import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
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

// Health check endpoint
app.get("/make-server-b1e42adc/health", (c) => {
  return c.json({ status: "ok" });
});

// GitHub OAuth endpoints
app.get("/connect/github", async (c) => {
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
    githubAuthUrl.searchParams.set(
      "redirect_uri",
      `${c.req.url.split("/connect/github")[0]}/connect/github/callback`,
    );
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

app.get("/connect/github/callback", async (c) => {
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

    const tokenData = await tokenResponse.json();

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

    const githubUser = await userResponse.json();

    // For now, we'll use a placeholder user ID
    // In a real app, you'd identify the current user from session/auth
    const userId = "placeholder-user-id"; // TODO: Get actual user ID from auth

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

    // Redirect to frontend with success
    return c.redirect(`${Deno.env.get("FRONTEND_URL")}?github_connected=true`);
  } catch (error) {
    console.error("GitHub OAuth callback error:", error);
    return c.redirect(
      `${Deno.env.get("FRONTEND_URL")}?github_error=${encodeURIComponent(error.message)}`,
    );
  }
});

Deno.serve(app.fetch);
