import fs from "fs";

// Copy client bundle
if (!fs.existsSync(".vercel/output/static")) {
  fs.mkdirSync(".vercel/output/static", { recursive: true });
}
fs.cpSync("dist/client", ".vercel/output/static", { recursive: true });

// Copy server bundle
if (!fs.existsSync(".vercel/output/functions/_serverless.func/dist/server")) {
  fs.mkdirSync(".vercel/output/functions/_serverless.func/dist/server", {
    recursive: true,
  });
}
fs.cpSync(
  "dist/server",
  ".vercel/output/functions/_serverless.func/dist/server",
  { recursive: true },
);

// Create serverless function
const func = `
import handler from "./dist/server/entry-node.mjs";
export default handler;
`;
fs.writeFileSync(".vercel/output/functions/_serverless.func/index.mjs", func);
const funcConfig = {
  runtime: "nodejs22.x",
  handler: "index.mjs",
  launcherType: "Nodejs",
  supportsResponseStreaming: true,
};
fs.writeFileSync(
  ".vercel/output/functions/_serverless.func/.vc-config.json",
  JSON.stringify(funcConfig, null, 2),
);

// Create vercel config
const config = {
  version: 3,
  routes: [
    {
      "src": "/assets/(.*)",
      "dest": "/assets/$1"
    },
    {
      src: ".*",
      dest: "_serverless",
    },
  ],
};
fs.writeFileSync(".vercel/output/config.json", JSON.stringify(config, null, 2));
