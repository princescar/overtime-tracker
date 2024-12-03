import { bundle } from "@hattip/bundler-vercel";

await bundle({
  serverlessEntry: "vercel-serverless-entry.ts",
  manipulateEsbuildOptions,
});

function manipulateEsbuildOptions(options) {
  options.format = "esm";
}
