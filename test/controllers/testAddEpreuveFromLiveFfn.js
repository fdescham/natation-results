'use strict';
var chai = require('chai');
var expect = chai.expect;
var log = require('color-logs')(true, true, __filename);
var mongoose = require('mongoose');
var MeetingLiveFfn = require('../../controllers/MeetingLiveFfn').MeetingLiveFfn;
var Epreuve = require("../../model/Epreuve");
var Meeting = require("../../model/Meeting");
var CONST = require('../constants');
var connectDatabase = require('../tools').connectDatabase;

function retrieveAllEpreuves(meetingCodeList, done) {
    meetingCodeList.forEach(meetingCode => {
        Epreuve.getAllInstances(meetingCode)
            .then(epreuveList => {
                log.info("retrieveAllEpreuves : epreuveList :", epreuveList);
                epreuveList.forEach(epreuveInstance => {
                    log.info("retrieveAllEpreuves : epreuveInstance :", epreuveInstance.epreuveCode);
                    epreuveInstance.courses.forEach(course => {
                        log.info("retrieveAllEpreuves : course :", course.titre);
                        course.performances.forEach(performance => {
                            log.info("retrieveAllEpreuves : performance :", performance.temps,' ', performance.nageur ? performance.nageur.nom : null);
                        })
                    })
                });
                done();
            })
            .catch(e => done(e));
    });
}

function retrieveAllEpreuvesByClub(meetingCodeList, clubCode, done) {
    meetingCodeList.forEach(meetingCode => {
        Epreuve.getAllInstancesByClub(meetingCode, clubCode)
            .then(epreuveList => {
                log.info("retrieveAllEpreuvesByClub : epreuveList :", epreuveList);
                epreuveList.forEach(epreuveInstance => {
                    log.info("retrieveAllEpreuvesByClub : epreuveInstance :", epreuveInstance.epreuveCode);
                    epreuveInstance.courses.forEach(course => {
                        log.info("retrieveAllEpreuvesByClub : course :", course.titre);
                        course.performances.forEach(performance => {
                            log.info("retrieveAllEpreuvesByClub : performance :", performance.temps,' ', performance.nageur ? performance.nageur.nom : null);
                        })
                    })
                });
                done();
            })
            .catch(e => done(e));
    });
}

function retrieveAllEpreuvesBySwimmer(meetingCodeList, nageurCode, done) {
    meetingCodeList.forEach(meetingCode => {
        Epreuve.getAllInstancesBySwimmer(meetingCode, nageurCode)
            .then(epreuveList => {
                log.info("retrieveAllEpreuvesBySwimmer : epreuveList :", epreuveList);
                epreuveList.forEach(epreuveInstance => {
                    log.info("retrieveAllEpreuvesBySwimmer : epreuveInstance :", epreuveInstance.epreuveCode);
                    epreuveInstance.courses.forEach(course => {
                        log.info("retrieveAllEpreuvesBySwimmer : course :", course.titre);                        
                        course.performances.forEach(performance => {
                            log.info("retrieveAllEpreuvesBySwimmer : performance :", performance.temps,' ', performance.nageur ? performance.nageur.nom : null);
                        })
                    })
                });
                done();
            })
            .catch(e => done(e));
    });
}


describe('Parse an Epreuve from liveFFN fakeServer and update the database', function () {

    before("Initialize Database", function (done) { return connectDatabase(done); });

    var epreuveLiveFfn = {};

    it('Retrieve Epreuve information from file', function (done) {
        MeetingLiveFfn.fromFile(__dirname + "/../data/Epreuve1.html")
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
            .then(function () {
                log.info("all data saved.");
                done();
            })
            .catch(e => done(e));
    })

});

describe('Retrieve Meeting information saved from liveFFN fakeServer from the database', function () {
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
        retrieveAllEpreuves(meetingCodeList, done);
    })

    it('Get all the performance of a Club from a meeting', function (done) {
        retrieveAllEpreuvesByClub(meetingCodeList, CONST.CLUB_1.code, done);
    })

    it('Get all the performance of a Nageurs from a meeting', function (done) {
        retrieveAllEpreuvesBySwimmer(meetingCodeList, CONST.COURSES_3_PERFORMANCES_1[0].codeNageur, done);
    })
});

describe('Parse another Epreuve from liveFFN fakeServer and update the database', function () {

    var epreuveLiveFfn = {};

    it('Retrieve another Epreuve information from file', function (done) {
        MeetingLiveFfn.fromFile(__dirname + "/../data/Epreuve3.html")
            .then(epreuve => {
                epreuveLiveFfn = epreuve;
                return Meeting.createInstance(epreuveLiveFfn.meetingInstance)
            })
            .then(meetingInstance => {
                log.info('%s  %s  %s bassin : %d m ', meetingInstance.lieu, meetingInstance.nom, meetingInstance.date, meetingInstance.bassin);
                return epreuveLiveFfn.saveAllData()
            })
            .then(function () {
                log.info("all data saved.");
                done();
            })
            .catch(error => done(error))
    })

});

describe('Retrieve Meeting information saved from liveFFN fakeServer from the database', function () {
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
        retrieveAllEpreuves(meetingCodeList, done);
    })

    it('Get all the performance of a Club from a meeting', function (done) {
        retrieveAllEpreuvesByClub(meetingCodeList, CONST.CLUB_1.code, done);
    })

    it('Get all the performance of a Nageurs from a meeting', function (done) {
        retrieveAllEpreuvesBySwimmer(meetingCodeList, CONST.COURSES_3_PERFORMANCES_1[0].codeNageur, done);
    })
});