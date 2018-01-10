'use strict';

var log = require('color-logs')(true, true, __filename);
var MeetingLiveFfn = require('../../controllers/MeetingLiveFfn').MeetingLiveFfn;
var connectDatabase = require('../tools').connectDatabase;

describe('Parse an Epreuve from liveFFN realServer and update the database', function () {
    
        before("Initialize Database", function (done) { return connectDatabase(done); });
    
        var meetingLiveFfn = {};
    
        it('Retrieve Epreuve information from file', function (done) {
            MeetingLiveFfn.getAllMeetingEpreuve(49551)
                .then(meeting => {
                    meetingLiveFfn = meeting;
                    done();
                })
                .catch(error => done(error));
        
        }).timeout(10000)
    });