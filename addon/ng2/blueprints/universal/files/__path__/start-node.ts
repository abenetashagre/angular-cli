import * as path from 'path';
import * as express from 'express';

/**
 * Angular 2 universal
 */
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

/**
 * ServerSide app
 */
import { AppComponent, environment } from './app/index';

let app = express();
let port = process.env.PORT || 4200;
let root = path.join(path.resolve(__dirname), '..');

enableProdMode();

/**
 * Render HTML files with the Angular 2 Universal ExpressEngine
 */
app.engine('html', expressEngine);
app.set('views', root);
app.set('view engine', 'html');
app.set('view options', {doctype: 'html'});
app.set('json spaces', 2);

/**
 * static content for SPA
 */
app.use(express.static(path.join(root, 'dist')));

/**
 * Render Angular 2 Application
 * @param req
 * @param res
 */
function ngApp(req, res) {
  let options: BootloaderConfig = {
    async: true,
    directives: [AppComponent],
    platformProviders: [
      { provide: ORIGIN_URL, useValue: 'file://' },
      { provide: BASE_URL, useValue: '/' }
    ],
    preboot: false,
    providers: [
      { provide: REQUEST_URL, useValue: req.originalUrl },

      NODE_PLATFORM_PIPES,
      NODE_ROUTER_PROVIDERS,
      NODE_HTTP_PROVIDERS
    ]
  };

  res.render('dist/index', options);
}

/**
 * render everything else on the server
 */
app.get('/**', ngApp);

if (environment.production) {
  app.listen(port, () => {
    console.log('Listening on http://localhost:' + port);
  });
}

module.exports = app;
