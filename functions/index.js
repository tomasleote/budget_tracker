const { onRequest } = require('firebase-functions/v2/https');

// The backend package must satisfy two contracts (see docs/DEPLOY.md, owned by Track A):
//   1. Export the configured Express `app` from its main entry (dist/server.js).
//   2. Not call app.listen() on import - the listen call is guarded behind
//      `require.main === module` so importing the module here does not start a
//      second HTTP server inside the function runtime.
const backend = require('budget-tracker-backend');
const app = backend.app || backend.default || backend;

// Served at /api/** via the Hosting rewrite in firebase.json. In the cloud the
// Admin SDK authenticates through Application Default Credentials (the function's
// runtime service account), so no service-account key file is needed here.
exports.api = onRequest({ region: 'us-central1' }, app);
