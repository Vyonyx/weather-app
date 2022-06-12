const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path');

module.exports = {
mode: 'development',
entry: './src/app.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devtool: 'inline-source-map',
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    open: true,
    hot: true,
    port: 3000,
  },
  plugins: [new HtmlWebpackPlugin({
    filename: 'index.html',
    template: path.resolve(__dirname, 'src/template.html')
  })],
  module: {
    rules: [
        {test: /\.scss$/, use: ['style-loader', 'css-loader', 'sass-loader']},
        {test: /\.(png|jpg|jpeg|svg)$/, type: 'asset/resource'},
    ],
  }
};