import * as esbuild from "esbuild";
import { copyFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const watch = process.argv.includes("--watch");

const base = {
  entryPoints: ["src/popup/popup.ts", "src/content/lumaAttendeesDownloader.ts"],
  bundle: true,
  format: "iife",
  platform: "browser",
  target: "chrome100",
  outdir: "dist",
  outbase: "src",
  sourcemap: watch,
  minify: !watch,
};

function copyPopupHtml() {
  mkdirSync(join(__dirname, "dist", "popup"), { recursive: true });
  copyFileSync(
    join(__dirname, "src", "popup", "popup.html"),
    join(__dirname, "dist", "popup", "popup.html"),
  );
}

async function build() {
  const ctx = await esbuild.context({
    ...base,
    outExtension: { ".js": ".js" },
  });
  if (watch) {
    await ctx.watch();
    copyPopupHtml();
    console.log("watching...");
  } else {
    await ctx.rebuild();
    copyPopupHtml();
    await ctx.dispose();
  }
}

build().catch(() => process.exit(1));
