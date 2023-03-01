import fs from "fs";
import path from "path";
import typescript from "rollup-plugin-typescript2";

const plugins = [
  typescript({
    tsconfig: path.resolve(__dirname, "./tsconfig.json"),
    extensions: [".js", ".ts", ".tsx"],
  }),
];

const root = path.resolve(__dirname, "packages");

const packages = fs
  .readdirSync(root)
  .filter((item) => fs.statSync(path.resolve(root, item)).isDirectory())
  .map((item) => {
    const pkg = require(path.resolve(root, item, "package.json"));
    return {
      input: path.resolve(root, item, "index.ts"),
      output: [
        {
          exports: "auto",
          file: path.resolve(root, item, pkg.main),
          format: "cjs",
        },
        {
          exports: "auto",
          file: path.join(root, item, pkg.module),
          format: "es",
        },
      ],
      plugins,
      external: [],
    };
  });
packages.push({
  input: path.resolve(root, "index.ts"),
  output: [
    {
      exports: "auto",
      file: path.resolve("dist/cjs/index.js"),
      format: "cjs",
    },
    {
      exports: "auto",
      file: path.join("dist/es/index.js"),
      format: "es",
    },
  ],
  plugins,
});

module.exports = packages;
