var webpack = require('webpack');
var path = require('path');

var commonConfig = {
  resolve: {
    extensions: ['', '.ts', '.js']
  },
  module: {
    loaders: [
      // TypeScript
      { test: /\.ts$/, loader: 'ts-loader' },
      { test: /\.json$/, loader: 'raw-loader' }
    ],
    preLoaders: [
      // needed to lower the filesize of angular due to inline source-maps
      { test: /\.js$/, loader: 'source-map-loader', exclude: [
        // these packages have problems with their sourcemaps
        root('node_modules/rxjs'),
        root('node_modules/@angular')
      ]}
    ]
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(true)
  ]

};

var serverConfig = {
  target: 'node',
  entry: '../src/start-node',
  output: {
    path: root('..', 'dist'),
    filename: 'start-node.js',
    libraryTarget: 'commonjs2'
  },
  externals: checkNodeImport,
  node: {
    global: true,
    __dirname: true,
    __filename: true,
    process: true,
    Buffer: true
  }
};

// Default config
var defaultConfig = {
  context: __dirname,
  resolve: {
    root: root('/src')
  },
  output: {
    publicPath: path.resolve(__dirname),
    filename: 'index.js'
  }
};

var webpackMerge = require('webpack-merge');

module.exports = [
  webpackMerge({}, defaultConfig, commonConfig, serverConfig)
];

// Helpers
function checkNodeImport(context, request, cb) {
  if (!path.isAbsolute(request) && request.charAt(0) !== '.') {
    cb(null, 'commonjs ' + request); return;
  }
  cb();
}

function root(args) {
  args = Array.prototype.slice.call(arguments, 0);
  return path.join.apply(path, [__dirname].concat(args));
}
