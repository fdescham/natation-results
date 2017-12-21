'use strict';
var chai = require('chai');
var expect = chai.expect;
var log = require('color-logs')(true, true, __filename);
var mongoose = require('mongoose');
var Meeting = require('../../model/Meeting');
var CONST = require('../constants');
var connectDatabase = require('../tools').connectDatabase;

mongoose.Promise = global.Promise;

describe('Add a new Meeting', function () {
    var meeting = new Meeting.Instance();

    before("Initialize Database", function (done) { return connectDatabase(done); });

    it('The meeting should be initialized correctly', function (done) {
        log.error(meeting);
        meeting.nom = CONST.MEETING_1.nom;
        meeting.lieu = CONST.MEETING_1.lieu;
        meeting.bassin = CONST.MEETING_1.bassin;
        meeting.date = CONST.MEETING_1.date;
        expect(meeting.validateSync(), "Meeting should contains all the required fields.").not.to.be.undefined;
        meeting.code = CONST.MEETING_1.code;
        meeting.bassin = "100";
        expect(meeting.validateSync(), "Meeting should contains all the required fields.").not.to.be.undefined;
        meeting.bassin = CONST.MEETING_1.bassin;        
        expect(meeting.validateSync(), "Meeting should contains all the required fields.").to.be.undefined;
        done();
    });

    it('The meeting should be added correctly', function (done) {
        log.info("meeting = " + meeting);
        Meeting.getInstance(CONST.MEETING_1.code)
            .then(meetingInstance => {
                log.error(meetingInstance);
                expect(meetingInstance).to.be.null;
                return Meeting.createInstance(meeting);
            })
            .then(meetingCreated => {
                log.info("meeting created :", meetingCreated);
                expect(meetingCreated.code).to.equal(CONST.MEETING_1.code);
                expect(meetingCreated.nom).to.equal(CONST.MEETING_1.nom);
                return Meeting.getInstance(CONST.MEETING_1.code);
            })
            .then((meetingInstance) => {
                log.info("meeting instance :", meetingInstance);
                expect(meetingInstance.code).to.equal(CONST.MEETING_1.code);
                expect(meetingInstance.nom).to.equal(CONST.MEETING_1.nom);
                done();
            })
            .catch(error => { done(error); });

    });

    it('Add the same meeting, it should not be added', function (done) {
        log.info("meeting = " + meeting);
        Meeting.createInstance(meeting)
            .then(doc => {
                return Meeting.Instance.count();
            })
            .then((count) => {
                expect(count).to.equal(1);
                done();
            })
            .catch(error => { done(error); });
    });

});