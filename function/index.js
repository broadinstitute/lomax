'use strict';

const lomax = function(req, res) {
    res.status(418).json({hello:'lomax'});
};

module.exports = {lomax};