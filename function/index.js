'use strict';

const {respondWithError} = require('./errors.js');
const app = require('./routes/index.js');

// const Firestore = require('@google-cloud/firestore');

// TODO: read config

// define live application
// const config = {
//   authorizer: '', // TODO: live Sam-based authorizer
//   events: '', // TODO: live pubsub-based event queuer
//   database: '', // TODO: live firestore-based database connection
//   whitelist: '', // TODO: live GCS-based whitelist reader
//   sts: '', // TODO: live STS-based archiver
// };

// const lomax = async (req, res, config) => {
//   // TODO: (??) routing for pubsub trigger for syncing jobs

//   // TODO: CORS support

//   // TODO: validate workspace, source bucket, destination bucket input params
//   // TODO: call to Sam to authn/authz user, via Authorization token
//   // TODO: read whitelist from bucket and validate user is whitelisted
//   // TODO: query Firestore for pre-existing jobs on this workspace
//   //     TODO: if any jobs exist, query to see if they are still active
//   //     TODO: update Firestore if any jobs have finished
//   // TODO: using Rawls bucket SA, add STS SA to source and dest buckets
//   // TODO: create STS job
//   // TODO: insert created STS job to firestore

//   const firestore = new Firestore();
//   const collectionRef = firestore.collection('archivejobs');

//   const docs = await collectionRef.listDocuments();
//   res.status(418).json(docs);
// };


const httpApi = (req, res) => {
  try {
    app(req, res);
  } catch (err) {
    respondWithError(res, err);
  }
};

module.exports = {httpApi};
