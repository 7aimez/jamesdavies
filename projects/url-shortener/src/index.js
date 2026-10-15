export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Normalize the path and remove a leading slash to get the slug.
    const path = url.pathname.replace(/^\/+/, "");

    // Root requests go back to the main portfolio site.
    if (!path) {
      return Response.redirect("https://yourdomain.com", 302);
    }

    // Handle authenticated short-link creation from the admin endpoint.
    if (path === "admin/create" && request.method === "POST") {
      const providedSecret = request.headers.get("X-Admin-Secret");

      // Reject requests that do not provide the expected admin secret.
      if (!providedSecret || providedSecret !== env.ADMIN_SECRET) {
        return new Response("Unauthorized", { status: 401 });
      }

      let payload;
      try {
        payload = await request.json();
      } catch {
        return new Response("Invalid JSON body", { status: 400 });
      }

      const { slug, url: targetUrl } = payload ?? {};

      // Require non-empty string values for both slug and destination URL.
      if (
        typeof slug !== "string" ||
        slug.trim() === "" ||
        typeof targetUrl !== "string" ||
        targetUrl.trim() === ""
      ) {
        return new Response("Both slug and url are required as non-empty strings", {
          status: 400
        });
      }

      const normalizedSlug = slug.trim();
      const normalizedUrl = targetUrl.trim();

      // Persist the slug => destination URL mapping in Cloudflare KV.
      await env.URL_STORE.put(normalizedSlug, normalizedUrl);

      return Response.json({
        success: true,
        slug: normalizedSlug,
        url: normalizedUrl
      });
    }

    // For all other paths, attempt to resolve the slug from KV storage.
    const targetUrl = await env.URL_STORE.get(path);

    if (targetUrl) {
      // Redirect visitors to the full target URL when the slug exists.
      return Response.redirect(targetUrl, 302);
    }

    // Return a clear not-found response when no short link matches the slug.
    return new Response("Short link not found", { status: 404 });
  }
};
