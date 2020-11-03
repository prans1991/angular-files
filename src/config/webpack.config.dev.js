var webpackMerge = require("webpack-merge");
var commonConfig = require("./webpack.config.common.js");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
var helpers = require("./helpers");

module.exports = webpackMerge(commonConfig, {
  mode: "development",
  devtool: "cheap-module-eval-source-map",

  output: {
    path: helpers.root("dist"),
    publicPath: "/",
    filename: "[name].js",
    chunkFilename: "[id].chunk.js",
  },

  plugins: [new MiniCssExtractPlugin()],
  optimization: {
    noEmitOnErrors: true,
  },
  devServer: {
    historyApiFallback: true,
    stats: "minimal",
  },
});
