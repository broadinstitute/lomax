'use strict';

const Firestore = require('@google-cloud/firestore');

const lomax = async (req, res) => {

    // TODO: routing for the two types of HTTP requests: 1) create archive; 2) archive status
    // TODO: (??) routing for pubsub trigger for syncing jobs

    // create-archive path:
    // TODO: validate non-empty Authorization header exists in request
    // TODO: validate workspace, source bucket, destination bucket input params
    // TODO: call to Sam to authn/authz user, via Authorization token
    // TODO: read whitelist from bucket and validate user is whitelisted
    // TODO: query Firestore for pre-existing jobs on this workspace
    //     TODO: if any jobs exist, query to see if they are still active
    //     TODO: update Firestore if any jobs have finished
    // TODO: using Rawls bucket SA, add STS SA to source and destination buckets
    // TODO: create STS job
    // TODO: insert created STS job to firestore

    const firestore = new Firestore();
    let collectionRef = firestore.collection('archivejobs');

    let docs = await collectionRef.listDocuments();
    res.status(418).json(docs);

};

module.exports = {lomax};