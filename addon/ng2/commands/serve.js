'use strict';

var assign = require('lodash/assign');
var Command = require('ember-cli/lib/models/command');
var Promise = require('ember-cli/lib/ext/promise');
var SilentError = require('silent-error');
var PortFinder = require('portfinder');
var win = require('ember-cli/lib/utilities/windows-admin');
var EOL = require('os').EOL;
var UniversalServe = require('../tasks/universal-serve');
const config = require('../models/config');

PortFinder.basePort = 49152;

var getPort = Promise.denodeify(PortFinder.getPort);
var defaultPort = process.env.PORT || 4200;

const NewCommand = Command.extend({
  name: 'serve',
  description: 'Builds and serves your app, rebuilding on file changes.',
  aliases: ['server', 's'],

  availableOptions: [
    { name: 'port', type: Number, default: defaultPort, aliases: ['p'] },
    { name: 'host', type: String, aliases: ['H'], description: 'Listens on all interfaces by default' },
    { name: 'proxy', type: String, aliases: ['pr', 'pxy'] },
    {
      name: 'insecure-proxy',
      type: Boolean,
      default: false,
      aliases: ['inspr'],
      description: 'Set false to proxy self-signed SSL certificates'
    },
    { name: 'watcher', type: String, default: 'events', aliases: ['w'] },
    { name: 'live-reload', type: Boolean, default: true, aliases: ['lr'] },
    { name: 'live-reload-host', type: String, aliases: ['lrh'], description: 'Defaults to host' },
    { name: 'live-reload-base-url', type: String, aliases: ['lrbu'], description: 'Defaults to baseURL' },
    {
      name: 'live-reload-port',
      type: Number,
      aliases: ['lrp'],
      description: '(Defaults to port number within [49152...65535])'
    },
    {
      name: 'environment',
      type: String,
      default: 'development',
      aliases: ['e', { 'dev': 'development' }, { 'prod': 'production' }]
    },
    { name: 'output-path', type: 'Path', default: 'dist/', aliases: ['op', 'out'] },
    { name: 'ssl', type: Boolean, default: false },
    { name: 'ssl-key', type: String, default: 'ssl/server.key' },
    { name: 'ssl-cert', type: String, default: 'ssl/server.crt' }
  ],

  run: function (commandOptions) {
    this.project.ngConfig = this.project.ngConfig || config.CliConfig.fromProject();
    commandOptions.liveReloadHost = commandOptions.liveReloadHost || commandOptions.host;

    return this._checkExpressPort(commandOptions)
      .then(this._autoFindLiveReloadPort.bind(this))
      .then(function (commandOptions) {
        var serve;
        commandOptions = assign({}, commandOptions, {
          baseURL: this.project.config(commandOptions.environment).baseURL || '/'
        });

        if (commandOptions.proxy) {
          if (!commandOptions.proxy.match(/^(http:|https:)/)) {
            var message = 'You need to include a protocol with the proxy URL.' + EOL + 'Try --proxy http://' + commandOptions.proxy;

            return Promise.reject(new SilentError(message));
          }
        }

        if (this.project.ngConfig.apps[0].universal === false) {
          var ServeTask = this.tasks.Serve;
          serve = new ServeTask({
            ui: this.ui,
            analytics: this.analytics,
            project: this.project
          });
        } else {
          serve = new UniversalServe({
            ui: this.ui,
            analytics: this.analytics,
            project: this.project
          });
        }

        return win.checkWindowsElevation(this.ui).then(function () {
          return serve.run(commandOptions);
        });
      }.bind(this));
  },

  _checkExpressPort: function (commandOptions) {
    return getPort({ port: commandOptions.port, host: commandOptions.host })
      .then(function (foundPort) {

        if (commandOptions.port !== foundPort && commandOptions.port !== 0) {
          var message = 'Port ' + commandOptions.port + ' is already in use.';
          return Promise.reject(new SilentError(message));
        }

        // otherwise, our found port is good
        commandOptions.port = foundPort;
        return commandOptions;

      }.bind(this));
  },

  _autoFindLiveReloadPort: function (commandOptions) {
    return getPort({ port: commandOptions.liveReloadPort, host: commandOptions.liveReloadHost })
      .then(function (foundPort) {

        // if live reload port matches express port, try one higher
        if (foundPort === commandOptions.port) {
          commandOptions.liveReloadPort = foundPort + 1;
          return this._autoFindLiveReloadPort(commandOptions);
        }

        // port was already open
        if (foundPort === commandOptions.liveReloadPort) {
          return commandOptions;
        }

        // use found port as live reload port
        commandOptions.liveReloadPort = foundPort;
        return commandOptions;

      }.bind(this));
  }
});

module.exports = NewCommand;
module.exports.overrideCore = true;
