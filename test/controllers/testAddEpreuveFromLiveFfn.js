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


describe('Parse an Epreuve from liveFFN and update the database', function () {

    before("Initialize Database", function (done) { return connectDatabase(done); });

    var epreuveLiveFfn = {};

    it('Retrieve Epreuve information from file', function (done) {
        EpreuveLiveFfn.fromFile(__dirname + "/../data/Epreuve1.html")
            .then(epreuve => {
                epreuveLiveFfn = epreuve;
                done();
            })
            .catch(error => done(error))
    })

    it('Save the meeting info', function (done) {
        log.info(epreuveLiveFfn.meetingInstance);
        Meeting.createInstance(epreuveLiveFfn.meetingInstance)
            .then(meetingInstance => {
                log.info('%s  %s  %s bassin : %d m ', meetingInstance.lieu, meetingInstance.nom, meetingInstance.date, meetingInstance.bassin);
                done();
            })
            .catch(e => done(e));
    })

    it('Save all the epreuve info', function (done) {
        epreuveLiveFfn.saveAllData()
            .then( function () {                   
                log.info("all data saved.");
                done();
            })
            .catch(e => done(e));
    })

});

describe('Retrieve Meeting information saved from liveFFN from the database', function () {
    var meetingCodeList = [];

    it('Get all the Meetings', function (done) {
        Meeting.getAllInstances()
            .then(meetingList => {
                meetingList.forEach(meetingInstance => {
                    meetingCodeList.push(meetingInstance.code);
                    log.info('%s  %s  %s bassin : %d m ', meetingInstance.lieu, meetingInstance.nom, meetingInstance.date, meetingInstance.bassin);

                });
                done();
            })
            .catch(e => done(e));
    })

    it('Get all the Epreuves from a meeting', function (done) {
        meetingCodeList.forEach(meetingCode => {
            Epreuve.getAllInstances(meetingCode)
                .then(epreuveList => {
                    log.info("epreuveList :", epreuveList);
                    epreuveList.forEach(epreuveInstance => {
                        log.info("epreuveInstance :", epreuveInstance);
                        epreuveInstance.courses.forEach(course => {
                            log.info("course :", course.titre);
                            course.performances.forEach(performance => {
                                log.info("performance :", performance)
                            })
                        })
                    });
                    done();
                })
                .catch(e => done(e));
        });
    })

    it('Get all the performance of a Club from a meeting', function (done) {
        meetingCodeList.forEach(meetingCode => {
            Epreuve.getAllInstancesByClub(meetingCode, 1156)
            .then(epreuveList => {
                log.info("Get all the performance of a Club from a meeting");
                epreuveList.forEach(epreuveInstance => {
                    epreuveInstance.courses.forEach(course => {
                        log.info("%s - %s", course.titre, course.date);
                        course.performances.forEach(performance => {
                            log.info("%s [%s] %s  %d pts", performance.nageur.nom, performance.nageur.club.nom, performance.temps, performance.points)
                        })
                    })
                });
                done();
            })
            .catch(e => done(e));
        });
    })
});