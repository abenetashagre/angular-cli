/* jshint node: true */
'use strict';

var Promise = require('ember-cli/lib/ext/promise');
var Task = require('ember-cli/lib/models/task');
var path = require('path');

// require dependencies within the target project
function requireDependency(root, moduleName) {
  var packageJson = require(path.join(root, 'node_modules', moduleName, 'package.json'));
  var main = path.normalize(packageJson.main);
  return require(path.join(root, 'node_modules', moduleName, main));
}

module.exports = Task.extend({

  run: function () {
    var projectRoot = this.project.root;
    var remapIstanbul = requireDependency(projectRoot, 'remap-istanbul');
    var coverageFolder = path.join(projectRoot, 'coverage');

    return new Promise((resolve) => {
      remapIstanbul(path.join(coverageFolder, 'coverage-final.json'), {
        html: path.join(coverageFolder, 'html')
      }).then(()=> {
        resolve(0);
      });
    });
  }
});
