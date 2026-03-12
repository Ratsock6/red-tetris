import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      react: path.resolve(__dirname, "node_modules/react"),
      "react/jsx-runtime": path.resolve(__dirname, "node_modules/react/jsx-runtime.js"),
      "react/jsx-dev-runtime": path.resolve(__dirname, "node_modules/react/jsx-dev-runtime.js"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      "react-dom/client": path.resolve(__dirname, "node_modules/react-dom/client.js"),
      "react-dom/test-utils": path.resolve(__dirname, "node_modules/react-dom/test-utils.js"),
      "@testing-library/react": path.resolve(
        __dirname,
        "node_modules/@testing-library/react"
      ),
    },
    dedupe: ["react", "react-dom"],
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/__tests__/setup.js",
    server: {
      deps: {
        inline: [
          "react",
          "react-dom",
          "react-dom/client",
          "@testing-library/react",
        ],
      },
    },
  },
});