export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();

    // Canonicalize the www alias in one hop, including the Trebell Code path.
    if (host === "www.trebell.dev") {
      if (url.pathname === "/code" || url.pathname.startsWith("/code/")) {
        url.hostname = "code.trebell.dev";
        url.pathname = url.pathname.replace(/^\/code(?=\/|$)/, "") || "/";
      } else {
        url.hostname = "trebell.dev";
      }
      url.protocol = "https:";
      return Response.redirect(url.toString(), 301);
    }

    // Cloudflare's generated Pages hostname is an implementation detail.
    // Send visitors straight to the public canonical domain in one hop.
    if (host === "trebell.pages.dev") {
      if (url.pathname === "/code" || url.pathname.startsWith("/code/")) {
        url.hostname = "code.trebell.dev";
        url.pathname = url.pathname.replace(/^\/code(?=\/|$)/, "") || "/";
      } else {
        url.hostname = "trebell.dev";
      }
      url.protocol = "https:";
      return Response.redirect(url.toString(), 301);
    }

    // Keep the old path-style Trebell Code URL as a permanent alias.
    if (
      host === "trebell.dev" &&
      (url.pathname === "/code" || url.pathname.startsWith("/code/"))
    ) {
      url.hostname = "code.trebell.dev";
      url.pathname = url.pathname.replace(/^\/code(?=\/|$)/, "") || "/";
      url.protocol = "https:";
      return Response.redirect(url.toString(), 301);
    }

    // Serve the /code directory as the root of code.trebell.dev without
    // exposing /code in the browser URL.
    if (host === "code.trebell.dev") {
      if (
        url.pathname === "/favicon.png" ||
        url.pathname === "/apple-touch.png" ||
        url.pathname === "/logo.png" ||
        url.pathname === "/logo-ui.webp" ||
        url.pathname === "/logo-hero.webp" ||
        url.pathname.startsWith("/assets/")
      ) {
        return env.ASSETS.fetch(request);
      }

      if (!url.pathname.startsWith("/code/")) {
        const assetUrl = new URL(url);
        assetUrl.pathname =
          url.pathname === "/" ? "/code/" : "/code" + url.pathname;
        return env.ASSETS.fetch(new Request(assetUrl, request));
      }
    }

    return env.ASSETS.fetch(request);
  },
};
