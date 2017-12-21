'use strict';
var chai = require('chai');
var expect = chai.expect;
var log = require('color-logs')(true, true, __filename);
var mongoose = require('mongoose');
var EpreuveLiveFfn = require('../../controllers/EpreuveLiveFfn');
var Epreuve = require("../../model/Epreuve");
var Meeting = require("../../model/Meeting");
var CONST = require('../constants');
var connectDatabase = require('../tools').connectDatabase;


describe('Parse an Epreuve from liveFFN and update the database',function(){

    before("Initialize Database", function (done) { return connectDatabase(done); });
    
    var epreuveLiveFfn = {};

    it('Retrive Epreuve information from file', function(done){
        EpreuveLiveFfn.fromFile(__dirname +"/../data/Epreuve1.html")
        .then(epreuve =>  {
            epreuveLiveFfn = epreuve;
            done();
        })
        .catch(error => done(error))
    })

    it('Save the meeting info',function(done) {
        log.info(epreuveLiveFfn.meetingInstance);
        Meeting.createInstance(epreuveLiveFfn.meetingInstance)
        .then( meetingInstance => {
            log.info('%s  %s  %s bassin : %d m ',meetingInstance.lieu, meetingInstance.nom,meetingInstance.date, meetingInstance.bassin );
            done();
        })
        .catch( e => done(e));
    })

    it('Save the epreuve info',function(done) {
        Epreuve.createInstance(epreuveLiveFfn.epreuveInstance)
        .then( epreuveInstance => {
            epreuveInstance.courses.forEach( course => {
                log.info("%s - %s", course.titre, course.date);
                course.performances.forEach( performance => {
                    log.info("%d [%d]  %s  %d pts", performance.codeNageur, performance.codeClub, performance.temps, performance.points)
                })
            })
            done();
        })
        .catch( e => done(e));
    })
});