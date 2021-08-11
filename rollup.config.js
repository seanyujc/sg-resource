import path from "path";
import typescript from "rollup-plugin-typescript2";

export default {
  input: path.resolve(__dirname, "src/index.ts"),
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
  plugins: [
    typescript({
      tsconfig: path.resolve(__dirname, "./tsconfig.json"),
      extensions: [".js", ".ts", ".tsx"],
    }),
  ],
};
