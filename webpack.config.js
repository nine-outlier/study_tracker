const path = require("path");

module.exports = {
  // IMPORTANT: This is the React renderer bundle, so treat it like a web target.
  target: "web",

  entry: "./src/main.jsx",

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",

    // IMPORTANT: Prevent webpack runtime from referencing `global`
    // (which does not exist when nodeIntegration is false)
    globalObject: "globalThis",
  },

  mode: "development",

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
    ],
  },

  resolve: {
    extensions: [".js", ".jsx"],
  },

  devtool: "source-map",
};