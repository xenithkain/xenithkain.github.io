import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({
    include: "**/*.tsx",
  })],
  base: "/vite-react-deploy/", // YOUR REPO NAME HERE
});