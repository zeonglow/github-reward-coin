// @no-auth
// @ts-expect-error - NPM imports in Deno not fully supported by TypeScript
import { Hono, Context } from "npm:hono";
// @ts-expect-error - NPM imports in Deno not fully supported by TypeScript
import { cors } from "npm:hono/cors";
// @ts-expect-error - NPM imports in Deno not fully supported by TypeScript
import { logger } from "npm:hono/logger";
// @ts-expect-error - JSR imports not fully supported by TypeScript yet
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
// @ts-expect-error - Deno requires .ts extension for local imports
import * as kv from "./kv_store.ts";
// @ts-expect-error - NPM imports in Deno not fully supported by TypeScript
import { ethers } from "npm:ethers";

// Types for GitHub API responses
interface GitHubUser {
  id: number;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
}

interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!,
);
const app = new Hono();

// Enable logger
app.use("*", logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint - publicly accessible
app.get("/health", (c: Context) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "github-reward-coin-server",
  });
});

// Debug endpoint to test routing
app.get("/", (c: Context) => {
  return c.json({
    message: "Server is running",
    timestamp: new Date().toISOString(),
    routes: ["/health", "/connect/github", "/connect/github/callback"],
  });
});

// Handle Supabase path structure - add routes that match what Supabase passes
app.get("/connect", (c: Context) => {
  return c.json({
    message: "Server is running (Supabase path)",
    timestamp: new Date().toISOString(),
    routes: ["/connect/github", "/connect/github/callback"],
  });
});

// GitHub OAuth endpoints
app.get("/connect/github", async (c: Context) => {
  try {
    // Generate random state for security
    const state = crypto.randomUUID();

    // Store state temporarily (expires in 10 minutes)
    await kv.set(`github_oauth_state_${state}`, {
      timestamp: Date.now(),
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    // Build GitHub OAuth URL
    const githubAuthUrl = new URL("https://github.com/login/oauth/authorize");
    githubAuthUrl.searchParams.set(
      "client_id",
      Deno.env.get("GITHUB_CLIENT_ID")!,
    );
    // Construct the proper callback URL
    // Check if GITHUB_REDIRECT_URL is set, otherwise use dynamic logic
    const customRedirectUrl = Deno.env.get("GITHUB_CALLBACK_URL");
    let callbackUrl;

    if (customRedirectUrl) {
      // Use the custom redirect URL from environment variable
      callbackUrl = customRedirectUrl;
    } else {
      // Fallback to dynamic logic for backward compatibility
      const requestUrl = new URL(c.req.url);
      const isLocalDev =
        requestUrl.host.includes("kong") ||
        requestUrl.host.includes("localhost") ||
        requestUrl.host.includes("127.0.0.1") ||
        requestUrl.host.includes("supabase_edge_runtime");

      if (isLocalDev) {
        // Use localhost for local development
        callbackUrl =
          "http://127.0.0.1:54321/functions/v1/connect/github/callback";
      } else {
        // Use the request origin for production
        const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
        callbackUrl = `${baseUrl}/functions/v1/connect/github/callback`;
      }
    }

    githubAuthUrl.searchParams.set("redirect_uri", callbackUrl);
    githubAuthUrl.searchParams.set("scope", "user:email,repo");
    githubAuthUrl.searchParams.set("state", state);

    return c.redirect(githubAuthUrl.toString());
  } catch (error) {
    console.error("GitHub OAuth initiation error:", error);
    return c.redirect(
      `${Deno.env.get("FRONTEND_URL")}?github_error=oauth_initiation_failed`,
    );
  }
});

app.get("/connect/github/callback", async (c: Context) => {
  try {
    const { code, state, error } = c.req.query();

    if (error) {
      throw new Error(`GitHub OAuth error: ${error}`);
    }

    if (!code || !state) {
      throw new Error("Missing authorization code or state parameter");
    }

    // Verify state parameter
    const storedState = await kv.get(`github_oauth_state_${state}`);
    if (!storedState || storedState.expires < Date.now()) {
      throw new Error("Invalid or expired state parameter");
    }

    // Clean up state
    await kv.del(`github_oauth_state_${state}`);

    // Exchange code for token
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: Deno.env.get("GITHUB_CLIENT_ID"),
          client_secret: Deno.env.get("GITHUB_CLIENT_SECRET"),
          code,
        }),
      },
    );

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for token");
    }

    const tokenData = (await tokenResponse.json()) as GitHubTokenResponse;

    // Fetch user info from GitHub
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!userResponse.ok) {
      throw new Error("Failed to fetch GitHub user info");
    }

    const githubUser = (await userResponse.json()) as GitHubUser;

    // For now, we'll use a placeholder user ID
    // In a real app, you'd identify the current user from session/auth
    const userId = `${githubUser.login}${githubUser.id}`;

    // Save to Supabase
    const { error: dbError } = await supabase.from("users").upsert({
      id: userId,
      github_token: tokenData.access_token,
      github_username: githubUser.login,
      github_id: githubUser.id,
      email: githubUser.email,
      updated_at: new Date().toISOString(),
    });

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    // Generate Ethereum wallet for the user (if not exists)
    const { data: existingUser } = await supabase
      .from("users")
      .select("wallet_address", "wallet_private_key", "wallet_mnemonic_phrase")
      .eq("id", userId)
      .single();

    if (!existingUser?.wallet_address) {
      const wallet = ethers.Wallet.createRandom();
      const mnemonic = wallet?.mnemonic?.phrase;

      const { error: walletError } = await supabase
        .from("users")
        .update({
          wallet_address: wallet.address,
          wallet_private_key: wallet.privateKey,
          wallet_mnemonic_phrase: mnemonic,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (walletError) {
        throw new Error(`Failed to save wallet info: ${walletError.message}`);
      }
    }

    // Redirect to frontend with success
    return c.redirect(`${Deno.env.get("FRONTEND_URL")}?github_connected=true`);
  } catch (error) {
    console.error("GitHub OAuth callback error:", error);
    return c.redirect(
      `${Deno.env.get("FRONTEND_URL")}?github_error=${encodeURIComponent((error as Error).message)}`,
    );
  }
});

// Catch-all route for debugging
app.all("*", (c: Context) => {
  console.log(`Unmatched route: ${c.req.method} ${c.req.url}`);
  return c.json(
    {
      error: "Route not found",
      method: c.req.method,
      url: c.req.url,
      path: new URL(c.req.url).pathname,
    },
    404,
  );
});

Deno.serve(app.fetch);
