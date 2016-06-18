/* jshint node: true, esversion: 6 */
'use strict';

const Plugin = require('broccoli-caching-writer');
const Builder = require('systemjs-builder');
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const webpack = require('webpack');

class BundlePlugin extends Plugin {
  constructor(inputNodes, options) {
    super(inputNodes, {});
    options = options || {};
    this.options = options;
  }

  build() {
    var relativeRoot = path.relative(process.cwd(), this.inputPaths[0]);
    var builder = new Builder(relativeRoot, `${relativeRoot}/system-config.js`);

    return builder.bundle('start-browser', `${this.outputPath}/start-browser.js`, { minify: true })
      .then(() => fse.copySync(`${this.inputPaths[0]}/system-config.js`,
        `${this.outputPath}/system-config.js`)
      )
      .then(() => {
        let webpackConfigPath = path.join(process.cwd(), 'config', 'webpack.config.js');
        
        return new Promise((resolve, reject) => {
          if (!fs.existsSync(webpackConfigPath)) {
            resolve(0);
          }
          webpack(require(webpackConfigPath), (err) => {
            if (err) {
              reject(6);
            }
            resolve(0);
          });
        })
      });
  }
}

module.exports = BundlePlugin;
