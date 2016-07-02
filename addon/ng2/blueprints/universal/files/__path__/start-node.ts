import * as path from 'path';
import * as express from 'express';
import * as serveStatic from 'serve-static';
import 'angular2-universal/polyfills';
import {
  enableProdMode,
  expressEngine,
  REQUEST_URL,
  ORIGIN_URL,
  BASE_URL,
  NODE_ROUTER_PROVIDERS,
  NODE_HTTP_PROVIDERS,
  BootloaderConfig,
  NODE_PLATFORM_PIPES
} from 'angular2-universal';
import {AppComponent, environment} from './app/index';

let app = express();
let port = process.env.PORT || 4200;
let root = path.join(path.resolve(__dirname), '..');

enableProdMode();

app.engine('html', expressEngine);
app.set('views', root);
app.set('view engine', 'html');
app.set('view options', {doctype: 'html'});
app.set('json spaces', 2);

app.use(serveStatic(path.join(root, 'dist'), {index: false}));
app.use(serveStatic(path.join(root, 'public'), {index: false}));

function ngApp(req, res, next) {
  if (req.path === '/ember-cli-live-reload.js') {
    next();
    return;
  }
  let options:BootloaderConfig = {
    async: true,
    directives: [AppComponent],
    platformProviders: [
      {provide: ORIGIN_URL, useValue: 'file://'},
      {provide: BASE_URL, useValue: '/'}
    ],
    preboot: false,
    providers: [
      {provide: REQUEST_URL, useValue: req.originalUrl},
      ...NODE_PLATFORM_PIPES,
      ...NODE_ROUTER_PROVIDERS,
      ...NODE_HTTP_PROVIDERS
    ]
  };

  res.render('dist/index', options);
}

app.get('*', ngApp);

if (environment.production) {
  app.listen(port, () => {
    console.log('Listening on port:' + port);
  });
}

module.exports = app;
