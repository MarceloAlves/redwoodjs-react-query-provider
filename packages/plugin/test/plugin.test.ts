import path from "path";

import pluginTester from "babel-plugin-tester";

import { default as redwoodCellPlugin } from "../src";

pluginTester({
  plugin: redwoodCellPlugin,
  pluginName: "babel-plugin-redwood-rqcell",
  fixtures: path.join(__dirname, "__fixtures__/cell"),
});
