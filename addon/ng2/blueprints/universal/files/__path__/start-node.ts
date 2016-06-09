import * as path from 'path';
import * as express from 'express';
import * as bodyParser from 'body-parser';

/**
 * Angular 2 universal
 */
import 'angular2-universal/polyfills';
import {
  provide,
  enableProdMode,
  expressEngine,
  REQUEST_URL,
  ORIGIN_URL,
  BASE_URL,
  NODE_ROUTER_PROVIDERS,
  NODE_HTTP_PROVIDERS,
  queryParamsToBoolean,
  BootloaderConfig,
  NODE_PLATFORM_PIPES
} from 'angular2-universal';

const PACKAGES = {
  'angular2-universal/polyfills': {
    format: 'cjs',
    main: 'dist/polyfills',
    defaultExtension: 'js'
  },
  'angular2-universal': {
    format: 'cjs',
    main: 'dist/browser/index',
    defaultExtension: 'js'
  },
  '@angular/core': {
    format: 'cjs',
    main: 'index',
    defaultExtension: 'js'
  },
  '@angular/router-deprecated': {
    format: 'cjs',
    main: 'index',
    defaultExtension: 'js'
  },
  '@angular/platform-browser': {
    format: 'cjs',
    main: 'index',
    defaultExtension: 'js'
  },
  '@angular/platform-browser-dynamic': {
    format: 'cjs',
    main: 'index',
    defaultExtension: 'js'
  },
  '@angular/http': {
    format: 'cjs',
    main: 'index',
    defaultExtension: 'js'
  },
  '@angular/common': {
    format: 'cjs',
    main: 'index',
    defaultExtension: 'js'
  },
  '@angular/compiler': {
    format: 'cjs',
    main: 'index',
    defaultExtension: 'js'
  }
};

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
 * body parser for api
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

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
  let queryParams: any = queryParamsToBoolean(req.query);
  let options: BootloaderConfig = Object.assign(queryParams, {
    async: true,
    buildClientScripts: true,
    systemjs: {
      componentUrl: 'dist/start-browser',
      map: {
        'angular2-universal': 'dist/vendor/angular2-universal',
        '@angular': 'dist/vendor/@angular'
      },
      packages: PACKAGES
    },
    data: {},
    directives: [AppComponent],
    platformProviders: [
      provide(ORIGIN_URL, {useValue: 'file://'}),
      provide(BASE_URL, {useValue: '/'})
    ],
    preboot: false,
    providers: [
      provide(REQUEST_URL, {useValue: req.originalUrl}),

      NODE_PLATFORM_PIPES,
      NODE_ROUTER_PROVIDERS,
      NODE_HTTP_PROVIDERS
    ],
    ngOnRendered: () => {
      console.log('DONE');
    }
  });

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
