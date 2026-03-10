"use client";

import { useEffect } from "react";

function isArticleListPath(pathname) {
  if (!pathname.startsWith("/api/")) return false;
  if (/\/\d+\/?$/.test(pathname)) return false;

  const listEndpoints = [
    "articles",
    "success-stories",
    "resources",
    "programmes",
    "science-articles",
    "arts-traditions-articles",
    "culture_urbaine_articles",
    "culture-urbaine-articles",
    "actualitehome",
    "events",
    "categories",  // ← ajoute cette ligne
    "sections",
  ];

  return listEndpoints.some((segment) => pathname.includes(segment));
}

function toRequestUrl(input) {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}

export default function FetchFallbackGuard() {
  useEffect(() => {
    const originalFetch = window.fetch.bind(window);

    window.fetch = async (input, init = {}) => {
      const requestUrl = toRequestUrl(input);
      const method = (init.method || (input instanceof Request ? input.method : "GET")).toUpperCase();

      let parsedUrl;
      try {
        parsedUrl = new URL(requestUrl, window.location.origin);
      } catch {
        parsedUrl = null;
      }

      try {
        const response = await originalFetch(input, init);

        if (
          method === "GET" &&
          parsedUrl &&
          isArticleListPath(parsedUrl.pathname) &&
          (response.status === 404 || response.status === 204)
        ) {
          return new Response("[]", {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        return response;
      } catch (error) {
        if (method === "GET" && parsedUrl && isArticleListPath(parsedUrl.pathname)) {
          console.warn("Article list fetch fallback to empty array:", requestUrl);
          return new Response("[]", {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}
