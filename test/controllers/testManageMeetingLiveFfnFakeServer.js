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
var retrieveAllEpreuves = require('../controllers/testMeetingTools').retrieveAllEpreuves;
var retrieveAllEpreuvesByClub = require('../controllers/testMeetingTools').retrieveAllEpreuvesByClub;
var retrieveAllEpreuvesBySwimmer = require('../controllers/testMeetingTools').retrieveAllEpreuvesBySwimmer;

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