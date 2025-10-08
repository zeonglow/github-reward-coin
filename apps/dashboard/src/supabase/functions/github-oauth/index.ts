import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Route: /github-oauth (OAuth initiation)
    if (path === "/github-oauth" && req.method === "GET") {
      // Generate random state for security
      const state = crypto.randomUUID();

      // Store state temporarily in Supabase (expires in 10 minutes)
      const { error: stateError } = await supabase.from("oauth_states").insert({
        state,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      });

      if (stateError) {
        console.error("Error storing state:", stateError);
        throw new Error("Failed to store OAuth state");
      }

      // Build GitHub OAuth URL
      const githubAuthUrl = new URL("https://github.com/login/oauth/authorize");
      githubAuthUrl.searchParams.set(
        "client_id",
        Deno.env.get("GITHUB_CLIENT_ID") ?? "",
      );
      githubAuthUrl.searchParams.set(
        "redirect_uri",
        `${url.origin}/functions/v1/github-oauth/callback`,
      );
      githubAuthUrl.searchParams.set("scope", "user:email,repo");
      githubAuthUrl.searchParams.set("state", state);

      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          Location: githubAuthUrl.toString(),
        },
      });
    }

    // Route: /github-oauth/callback (OAuth callback)
    if (path === "/github-oauth/callback" && req.method === "GET") {
      const { code, state, error } = Object.fromEntries(url.searchParams);

      if (error) {
        throw new Error(`GitHub OAuth error: ${error}`);
      }

      if (!code || !state) {
        throw new Error("Missing authorization code or state parameter");
      }

      // Verify state parameter
      const { data: storedState, error: stateError } = await supabase
        .from("oauth_states")
        .select("*")
        .eq("state", state)
        .single();

      if (
        stateError ||
        !storedState ||
        new Date(storedState.expires_at) < new Date()
      ) {
        throw new Error("Invalid or expired state parameter");
      }

      // Clean up state
      await supabase.from("oauth_states").delete().eq("state", state);

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
      const frontendUrl =
        Deno.env.get("FRONTEND_URL") ?? "http://localhost:3000";
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          Location: `${frontendUrl}?github_connected=true`,
        },
      });
    }

    // 404 for unknown routes
    return new Response("Not Found", {
      status: 404,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("GitHub OAuth error:", error);
    const frontendUrl = Deno.env.get("FRONTEND_URL") ?? "http://localhost:3000";
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        Location: `${frontendUrl}?github_error=${encodeURIComponent(error.message)}`,
      },
    });
  }
});
