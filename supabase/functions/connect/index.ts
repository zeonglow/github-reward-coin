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
// Use zod for request validation (same schema as the token package)
// Using small inline validation instead of zod for Deno compatibility
// Local Deno-friendly token client wrapper
// @ts-expect-error - Deno requires .ts extension for local imports
import { giveReward as sendTokenReward } from "./token_client.ts";

// Inline validator to mimic TransactionRequestSchema behavior
function validateTransactionRequest(obj: any) {
  if (!obj || typeof obj !== "object")
    return { ok: false, error: "Body must be an object" };
  const to = obj.to;
  const rewardId = obj.rewardId;
  if (typeof rewardId !== "number" || rewardId <= 0)
    return { ok: false, error: "Reward ID must be a positive integer" };
  if (typeof to !== "string" || to.length === 0)
    return { ok: false, error: "Recipient address is required" };
  const amount = obj.amount;
  if (typeof amount !== "string" || amount.length === 0)
    return { ok: false, error: "Amount is required" };
  if (!/^-?\d+$/.test(amount))
    return { ok: false, error: "Amount must be an integer string" };
  // amount can be string, number, or bigint. We accept strings that parse to a positive integer.
  let amountBigInt: bigint;
  try {
    if (typeof amount === "bigint") amountBigInt = amount;
    else if (typeof amount === "number")
      amountBigInt = BigInt(Math.floor(amount));
    else if (typeof amount === "string") {
      // handle numeric string
      if (!/^-?\d+$/.test(amount))
        return { ok: false, error: "Amount must be an integer string" };
      amountBigInt = BigInt(amount);
    } else return { ok: false, error: "Amount must be a bigint/number/string" };
  } catch (e) {
    return { ok: false, error: "Invalid amount format" };
  }
  if (amountBigInt <= 0n)
    return { ok: false, error: "Amount must be positive" };
  return { ok: true, data: { to, amount: amountBigInt, rewardId } };
}

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

interface GithubPushEvent {
  ref: string;
  commits: Array<{
    id: string;
    message: string;
    committer: { username: string };
  }>;
  repository: {
    full_name: string;
  };
}

interface RewardActivity {
  description: string;
  points: number;
  type: string;
  rewardId: number;
  repository: string;
  ticketId?: string;
}

interface Reward {
  status: string;
  developerId: string;
  totalTokens: number;
  createdAt: Date;
  updatedAt: Date;
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

    // Redirect to frontend with success and user info
    const frontendUrl = new URL(Deno.env.get("FRONTEND_URL")!);
    frontendUrl.searchParams.set("github_connected", "true");
    frontendUrl.searchParams.set("github_id", githubUser.id.toString());
    frontendUrl.searchParams.set("github_username", githubUser.login);
    return c.redirect(frontendUrl.toString());
  } catch (error) {
    console.error("GitHub OAuth callback error:", error);
    return c.redirect(
      `${Deno.env.get("FRONTEND_URL")}?github_error=${encodeURIComponent((error as Error).message)}`,
    );
  }
});

app.post("/connect/github/webhook/push", async (c: Context) => {
  try {
    // Handle GitHub push events
    const payload = (await c.req.json()) as GithubPushEvent;

    // Only handle main branch pushes
    if (payload.ref !== "refs/heads/main") {
      return c.json({ error: "Ignored: not main branch" }, 200);
    }

    const { repository } = payload;
    const authorStats: Record<
      string,
      {
        commits: number;
        additions: number;
        deletions: number;
        changes: number;
        points: number;
      }
    > = {};
    const rewardActivities: Partial<Record<string, RewardActivity[]>> = {};

    // Fetch details for each commit
    await Promise.all(
      payload.commits.map(async (commit) => {
        const sha = commit.id;
        const commitUrl = new URL(
          `https://api.github.com/repos/${repository.full_name}/commits/${sha}`,
        );
        const githubClientId = Deno.env.get("GITHUB_CLIENT_ID");
        const githubClientSecret = Deno.env.get("GITHUB_CLIENT_SECRET");
        if (githubClientId && githubClientSecret) {
          commitUrl.searchParams.set("client_id", githubClientId);
          commitUrl.searchParams.set("client_secret", githubClientSecret);
        }

        const commitRes = await fetch(commitUrl.toString(), {
          headers: {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "CodeChangeWebhook",
          },
        });

        type CommitFile = { additions?: number; deletions?: number };
        type CommitResponse = {
          author?: { login?: string };
          commit?: { author?: { name?: string }; message?: string };
          files?: CommitFile[];
        };

        const data = (await commitRes.json()) as CommitResponse;
        const username =
          commit?.committer?.username ||
          data.author?.login ||
          data.commit?.author?.name ||
          "unknown";

        const additions =
          data.files?.reduce(
            (a: number, f: CommitFile) => a + (f.additions ?? 0),
            0,
          ) || 0;
        const deletions =
          data.files?.reduce(
            (a: number, f: CommitFile) => a + (f.deletions ?? 0),
            0,
          ) || 0;
        const changes = additions + deletions;

        if (!authorStats[username]) {
          authorStats[username] = {
            commits: 0,
            additions: 0,
            deletions: 0,
            changes: 0,
            points: 0,
          };
        }
        if (!rewardActivities[username]) {
          rewardActivities[username] = [];
        }

        authorStats[username].commits++;
        authorStats[username].additions += additions;
        authorStats[username].deletions += deletions;
        authorStats[username].changes += changes;
        authorStats[username].points += Math.floor(changes);

        rewardActivities[username].push({
          description: commit.message,
          repository: repository.full_name,
          points: changes,
          type: "commit",
          rewardId: 0,
        });
      }),
    );

    // Save to reward
    for (const [username, stats] of Object.entries(authorStats)) {
      const user = await supabase
        .from("users")
        .select("id")
        .eq("github_username", username)
        .single();
      if (!user.data?.id) {
        console.error(`No user found for GitHub username: ${username}`);
        continue;
      }

      const reward: Reward = {
        status: "pending",
        developerId: user.data?.id || "unknown",
        totalTokens: stats.points,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { data, error: rewardError } = await supabase
        .from("rewards")
        .insert(reward)
        .select("id");
      if (rewardError) {
        console.error("Failed to create reward:", rewardError);
        continue;
      }

      const rewardId = data?.[0]?.id;
      if (!rewardId) {
        console.error("No reward ID returned");
        continue;
      }

      // Insert activities
      const rewardActivitiesOfDeveloper = rewardActivities[username] ?? [];
      if (rewardActivitiesOfDeveloper.length === 0) {
        continue;
      }

      for (let i = 0; i < rewardActivitiesOfDeveloper.length; i++) {
        rewardActivitiesOfDeveloper[i].rewardId = rewardId;
      }

      const { error: activityError } = await supabase
        .from("reward_activities")
        .insert(rewardActivitiesOfDeveloper);
      if (activityError) {
        console.error("Failed to insert reward activities:", activityError);
        continue;
      }
    }

    return c.json({ status: "ok" });
  } catch (error) {
    console.error("GitHub webhook error:", error);
    return c.json({ error: "Failed to process webhook" }, 500);
  }
});

// accept a transaction request and dispatch token reward
app.post("/connect/reward", async (c: Context) => {
  try {
    const body = await c.req.json();

    const parsed = validateTransactionRequest(body);
    if (!parsed.ok) {
      console.error("Invalid /connect/reward request:", parsed.error);
      return c.json({ error: "Invalid request", details: parsed.error }, 400);
    }

    // Narrow txRequest now that parsed.ok is true
    const txRequest = parsed.data as {
      rewardId: number;
      to: string;
      amount: bigint;
    };

    // Get user by to (developerId)
    const { data: user } = await supabase
      .from("users")
      .select("wallet_address")
      .eq("id", txRequest.to)
      .single();
    if (!user) {
      console.error("User not found for address:", txRequest.to);
      return c.json({ error: "User not found" }, 404);
    }

    if (!user.wallet_address) {
      console.error("User has no wallet address:", user.id);
      return c.json({ error: "User has no wallet address" }, 400);
    }

    // sendTokenReward expects (to, amountTokens) where amountTokens is string|number
    const result = await sendTokenReward(
      user.wallet_address,
      txRequest.amount.toString(),
    );

    if (!result) {
      console.error("Token reward dispatch failed");
      return c.json({ error: "Failed to dispatch token reward" }, 500);
    }

    const { error: updateError } = await supabase
      .from("rewards")
      .update({ status: "distributed" })
      .eq("id", txRequest.rewardId);
    if (updateError) {
      console.error(
        `Failed to update reward status for rewardId ${txRequest.rewardId}:`,
        updateError,
      );
    }

    return c.json({
      to: user.wallet_address,
      amount: txRequest.amount.toString(),
      timestamp: new Date().toISOString(),
      status: result ? "success" : "error",
      details: result,
    });
  } catch (err) {
    console.error("/connect/reward error:", err);
    return c.json({ error: "Internal server error" }, 500);
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
