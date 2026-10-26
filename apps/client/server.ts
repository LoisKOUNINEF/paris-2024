import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();

// Hosts allowed to be rendered (SSRF protection). NG_ALLOWED_HOSTS is only read when this list is not set.
const angularApp = new AngularNodeAppEngine({
  allowedHosts: [
    'studi-exam-jo.lois-kouninef.eu',
    'www.studi-exam-jo.lois-kouninef.eu',
    'studi-exam-jo-staging.lois-kouninef.eu',
    'www.studi-exam-jo-staging.lois-kouninef.eu',
    'localhost',
  ],
});

// Serve static files from /browser. Pages (prerendered or not) are left to the Angular engine,
// so html is never served with the long cache meant for hashed assets.
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  })
);

// Every other request is handled by Angular, following the render mode of app.routes.server.ts
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next()
    )
    .catch(next);
});

if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4222;
  // Start up the Node server
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

// Request handler used by the Angular CLI (dev server, build) and serverless functions.
export const reqHandler = createNodeRequestHandler(app);
