import commonjs from "rollup-plugin-commonjs";
import nodeResolve from "rollup-plugin-node-resolve";
import globals from "rollup-plugin-node-globals";
import builtins from "rollup-plugin-node-builtins";
import { root } from "./tools.mjs";
import typescript from "@rollup/plugin-typescript";

export default [
  {
    input: root("src/client.ts"),
    output: [
      {
        file: root("dist/client.cjs.js"),
        format: "iife"
      },
      {
        file: root("dist/client.esm.js"),
        format: "es"
      },
    ],
    plugins: [
      commonjs({
        include: /node_modules/
      }),
      nodeResolve({ preferBuiltins: false }), // or `true`
      globals(),
      builtins(),
      typescript({
        exclude: "node_modules/**",
        module: "esnext"
      })
    ]
  },
  {
    input: root("src/server.ts"),
    output: [
      {
        file: root("dist/server.cjs.js"),
        format: "cjs"
      }
    ],
    plugins: [
      commonjs({
        include: /node_modules/
      }),
      nodeResolve({ preferBuiltins: false }), // or `true`
      globals(),
      builtins(),
      typescript({
        exclude: "node_modules/**",
        module: "commonjs"
      })
    ]
  }

];
