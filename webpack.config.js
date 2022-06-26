const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

/**
 * @type {webpack.Configuration}
 */
module.exports = {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    library: {
      name: 'Spacing',
      type: 'window',
    },
  },
  resolve: { extensions: ['.ts', '.js', '.json'] },
  module: {
    rules: [
      {
        test: /\.(t|j)s$/,
        loader: 'babel-loader',
        exclude: /(node_modules)/,
      },
    ],
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: { compress: { pure_funcs: ['console.info', 'console.debug', 'console.log'] } },
        extractComments: false,
      }),
    ],
  },
};
