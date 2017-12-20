var log = require('color-logs')(true, true, __filename);
var mongoose = require('mongoose');

var Club = require('../model/Club');
var Epreuve = require('../model/Epreuve');
var Nageur = require('../model/Nageur');
var Meeting = require('../model/Meeting');

function connectDatabase(done) {
    log.info("connectDatabase");

    //Connect to the database and clean the models.
    mongoose
        .connect('mongodb://localhost/myTestBase', { useMongoClient: true })
        .then(function () { return Nageur.Instance.remove() })
        .then(function () { return Club.Instance.remove(); })
        .then(function () { return Meeting.Instance.remove(); })
        .then(function () { return Epreuve.Instance.remove(); })
        .then(function () { done(); })
        .catch(function (error) { done(error); });
}

module.exports.connectDatabase = connectDatabase;