'use strict';

const WebpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');

const metalsmith = require('./metalsmith');
const Logger = require('./logger');
const watch = require('./watch');
const webpackConfig = require('../webpack.config.development');

function serv() {

  Logger.info('Starting webpack development server');

  return new Promise(resolve => {

    const compiler = webpack(webpackConfig);
    const server = new WebpackDevServer(compiler, {
      contentBase: './build',
      noInfo: false, // display no info to console (only warnings and errors)
      quiet: false, // display nothing to the console
      colors: true,
      stats: { colors: true },
      watchOptions: {
        aggregateTimeout: 1200,
        poll: 1000
      }
    });

    server.listen(9000, () => {
      Logger.ok('Finished webpack development server');
      resolve();
    });

  });

}

function start() {

  return metalsmith()
    .then(serv)
    .then(watch);
}

module.exports = start;
