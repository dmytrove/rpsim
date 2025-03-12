"use client"

export function registerServiceWorker() {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      // Get the base path for GitHub Pages
      const basePath = window.location.pathname.includes("/rock-paper-scissors-simulator")
        ? "/rock-paper-scissors-simulator"
        : ""

      navigator.serviceWorker.register(`${basePath}/sw.js`).then(
        (registration) => {
          console.log("ServiceWorker registration successful with scope: ", registration.scope)
        },
        (err) => {
          console.log("ServiceWorker registration failed: ", err)
        },
      )
    })
  }
}

