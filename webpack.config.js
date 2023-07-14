const resolve = require('path').resolve;
module.exports = {
  output: {
    library: "HarmoVisWidget",
    libraryExport: "default",
    libraryTarget: "umd",
    path: __dirname,
    filename: 'library.js'
  },
  devtool: 'source-map',
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
      include: [resolve(__dirname), resolve(__dirname, './src')],
      query: { "presets": ["@babel/react"] }
    }, {
      test: /\.scss$/,
      use: ["style-loader", "css-loader", "sass-loader"]
    }]
  }
};
