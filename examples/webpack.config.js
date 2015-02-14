var fs = require('fs');
var path = require('path');
var webpack = require('webpack');
var ENTRIES_DIR = __dirname;
var React = require('react');

makeIndex();

module.exports = {

  devtool: 'eval',

  entry: fs.readdirSync(ENTRIES_DIR).reduce(function(entries, dir) {
    if (isDirectory(path.join(ENTRIES_DIR, dir)))
      entries[dir] = path.join(ENTRIES_DIR, dir, 'app.js');
    return entries;
  }, {}),

  output: {
    path: 'examples/__build__',
    filename: '[name].js',
    chunkFilename: '[id].chunk.js',
    publicPath: '/__build__/'
  },

  module: {
    loaders: [
      { test: /\.js$/, loader: 'jsx-loader?harmony' }
    ]
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin('shared.js')
  ],

  resolve: {
    alias: {
      'react-router-async-props': __dirname+'/../modules/index'
    }
  }

};

function makeIndex () {
  var list = fs.readdirSync(ENTRIES_DIR).filter(function(dir) {
    return isDirectory(path.join(ENTRIES_DIR, dir));
  }).map(function (dir) {
    return React.DOM.li({}, React.DOM.a({href: '/'+dir}, dir.replace(/-/g, ' ')));
  });
  var markup = React.renderToStaticMarkup((
    React.DOM.html({},
      React.DOM.link({rel: 'stylesheet', href: '/shared.css'}),
      React.DOM.body({id: "index"},
        React.DOM.ul({}, list)
      )
    )
  ));
  fs.writeFileSync('./examples/index.html', markup);
}

function isDirectory(dir) {
  return fs.lstatSync(dir).isDirectory();
}


