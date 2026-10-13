// Web App Manifest — served at /manifest.webmanifest by Next.js.
// Makes Xyvot Shop installable as a standalone mobile app.
export default function manifest() {
  return {
    name: "Xyvot Shop",
    short_name: "Xyvot",
    description:
      "Shop fresh groceries, vegetables, dairy, and daily essentials online. 15-minute express delivery from neighbourhood shops.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#ea580c",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["shopping", "food"],
    lang: "en",
  };
}
