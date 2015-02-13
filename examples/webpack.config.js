var webpack = require('webpack')

var config = {
  devtool: 'eval',
  entry: {
    App: [
      'webpack-dev-server/client?http://localhost:8080',
      'webpack/hot/only-dev-server',
      './main.jsx'
    ]
  },
  output: {
    path: './build',
    publicPath: '/assets/',
    filename: '[name].js'
  },
  resolve: {
    alias: {},
    extensions: ['', '.js', '.jsx']
  },
  module: {
    noParse: [],
    loaders: [
      { test: /(\.js|\.jsx)$/, loaders: ['react-hot', '6to5-loader', 'jsx-loader?harmony'], exclude: /node_modules/ }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ]
}

module.exports = config
