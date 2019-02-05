'use strict';

const Firestore = require('@google-cloud/firestore');

const lomax = async (req, res) => {

    const firestore = new Firestore();
    let collectionRef = firestore.collection('archivejobs');

    let docs = await collectionRef.listDocuments();
    res.status(418).json(docs);

};

module.exports = {lomax};