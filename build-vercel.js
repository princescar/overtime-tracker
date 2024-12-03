import * as fs from "fs";
import { bundle } from "@hattip/bundler-vercel";

await bundle({
  serverlessEntry: "vercel-serverless-entry.ts",
  manipulateEsbuildOptions,
});

await rewriteConfig();

function manipulateEsbuildOptions(options) {
  options.minify = false;
  options.target = "node22";
  options.format = "esm";
}

async function rewriteConfig() {
  console.log("Rewriting config");
  await fs.promises.writeFile(
    "./.vercel/output/functions/_serverless.func/.vc-config.json",
    JSON.stringify(
      {
        runtime: "nodejs22.x",
        handler: "index.js",
        launcherType: "Nodejs",
        supportsResponseStreaming: true,
      },
      null,
      2,
    ),
  );
}
