'use strict';
var chai = require('chai');
var expect = chai.expect;
var log = require('color-logs')(true, true, __filename);
var mongoose = require('mongoose');
var EpreuveLiveFfn = require('../../controllers/EpreuveLiveFfn');
var CONST = require('../constants');
var connectDatabase = require('../tools').connectDatabase;


describe('Parse an Epreuve from liveFFN and update the database',function(){

    before("Initialize Database", function (done) { return connectDatabase(done); });
    
    it('Create the class from file', function(done){
        EpreuveLiveFfn.fromFile(__dirname +"/../data/Epreuve1.html")
        .then(epreuve =>  done() )
        .catch(error => done(error))
    })
});