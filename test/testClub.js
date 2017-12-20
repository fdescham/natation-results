'use strict';
var chai = require('chai');
var expect = chai.expect;
var log = require('color-logs')(true, true, __filename);
var mongoose = require('mongoose');
var Club = require('../model/Club');
var CONST = require('./constants');
var connectDatabase = require('./tools').connectDatabase;

mongoose.Promise = global.Promise;

describe('Add a new Club', function () {
    var club = new Club.Instance();

    before("Initialize Database", function (done) { return connectDatabase(done); });

    it('The club should be initialized correctly', function (done) {
        club.nom = CONST.CLUB_1.nom;
        expect(club.validateSync(), "Club should contains all the required fields.").not.to.be.undefined;
        club.code = CONST.CLUB_1.code;
        expect(club.validateSync(), "Club should contains all the required fields.").to.be.undefined;
        done();
    });

    it('The club should be added correctly', function (done) {
        log.info("club = " + club);
        Club.getInstance(CONST.CLUB_1.code)
            .then(clubInstance => {
                log.error(clubInstance);
                expect(clubInstance).to.be.null;
                return Club.createInstance(club);
            })
            .then(clubCreated => {
                log.info("club created :", clubCreated);
                expect(clubCreated.code).to.equal(CONST.CLUB_1.code);
                expect(clubCreated.nom).to.equal(CONST.CLUB_1.nom);
                return Club.getInstance(CONST.CLUB_1.code);
            })
            .then((clubInstance) => {
                log.info("club instance :", clubInstance);
                expect(clubInstance.code).to.equal(CONST.CLUB_1.code);
                expect(clubInstance.nom).to.equal(CONST.CLUB_1.nom);
                done();
            })
            .catch(error => { done(error); });

    });


    it('Add the same club, it should not be added', function (done) {
        log.info("club = " + club);
        Club.createInstance(club)
            .then(doc => {
                return Club.Instance.count();
            })
            .then((count) => {
                expect(count).to.equal(1);
                done();
            })
            .catch(error => { done(error); });
    });

});