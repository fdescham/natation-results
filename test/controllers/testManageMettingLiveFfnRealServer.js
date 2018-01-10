'use strict';
var log = require('color-logs')(true, true, __filename);
var MeetingLiveFfn = require('../../controllers/MeetingLiveFfn').MeetingLiveFfn;
var Meeting = require("../../model/Meeting");
var CONST = require('../constants');
var connectDatabase = require('../tools').connectDatabase;
var retrieveAllEpreuves = require('../controllers/testMeetingTools').retrieveAllEpreuves;
var retrieveAllEpreuvesByClub = require('../controllers/testMeetingTools').retrieveAllEpreuvesByClub;
var retrieveAllEpreuvesBySwimmer = require('../controllers/testMeetingTools').retrieveAllEpreuvesBySwimmer;

describe('Parse an Epreuve from liveFFN realServer and update the database', function () {

    before("Initialize Database", function (done) { return connectDatabase(done); });

    var meetingLiveFfn = {};

    it('Retrieve Epreuve information from file', function (done) {
        MeetingLiveFfn.getAllMeetingEpreuve(48837)
            .then(meeting => {
                meetingLiveFfn = meeting;
                done();
            })
            .catch(error => done(error));

    }).timeout(10000)

    it('Save all the Meeting info', function (done) {
        meetingLiveFfn.saveAllData()
            .then(function () {
                log.info("all data saved.");
                done();
            })
            .catch(e => done(e));
    })

});

describe('Retrieve Meeting information saved from liveFFN realServer from the database', function () {
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