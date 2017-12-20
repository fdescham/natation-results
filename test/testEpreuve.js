'use strict';
var chai = require('chai');
var expect = chai.expect;
var log = require('color-logs')(true, true, __filename);
var mongoose = require('mongoose');
var Epreuve = require('../model/Epreuve');
var CONST = require('./constants');
var connectDatabase = require('./tools').connectDatabase;

mongoose.Promise = global.Promise;

function checkEpreuve(epreuveFrom, epreuveTo) {
    log.info("checkEpreuve: ",epreuveFrom,epreuveTo);
    expect(epreuveFrom.epreuveCode).to.equal(epreuveTo.epreuveCode);
    expect(epreuveFrom.meetingCode).to.equal(epreuveTo.meetingCode);
    expect(epreuveFrom.courses.lentgh).to.equal(epreuveTo.courses.lentgh);
    for (var i = 0; i < epreuveFrom.courses.lentgh; i++) {
        expect(epreuveFrom[i].courses.titre).to.equal(epreuveTo[i].courses.titre);
        expect(epreuveFrom[i].courses.date).to.equal(epreuveTo[i].courses.date);
        expect(epreuveFrom[i].courses.performances.lentgh).to.equal(epreuveTo[i].courses.performances.lentgh);
        for (var j = 0; j < epreuveFrom[i].courses.performances.lentgh; j++) {
            expect(epreuveFrom[i].courses.performances[j].codeNageur).to.equal(epreuveTo[i].courses.performances[j].codeNageur);
            expect(epreuveFrom[i].courses.performances[j].codeClub).to.equal(epreuveTo[i].courses.performances[j].codeClub);
            expect(epreuveFrom[i].courses.performances[j].temps).to.equal(epreuveTo[i].courses.performances[j].temps);
            expect(epreuveFrom[i].courses.performances[j].points).to.equal(epreuveTo[i].courses.performances[j].points);
        }
    }
}

describe('Add a new Epreuve', function () {
    var epreuve = new Epreuve.Instance();
    var epreuveToCheck = new Epreuve.Instance(CONST.EPREUVE_1);
    epreuveToCheck.courses.push(CONST.EPREUVE_1_COURSES[0]);
    epreuveToCheck.courses[0].performances = CONST.COURSES_1_PERFORMANCES;
    var epreuveKey = {
        epreuveCode: CONST.EPREUVE_1.epreuveCode,
        meetingCode: CONST.EPREUVE_1.meetingCode
    };

    before("Initialize Database", function (done) { return connectDatabase(done); });

    it('The epreuve should be initialized correctly', function (done) {
        log.info("epreuve :",epreuve);
        epreuve.meetingCode = CONST.EPREUVE_1.meetingCode;
        expect(epreuve.validateSync(), "Epreuve should contains all the required fields.").not.to.be.undefined;
        epreuve.epreuveCode = CONST.EPREUVE_1.epreuveCode;
        expect(epreuve.validateSync(), "Epreuve should contains all the required fields.").to.be.undefined;
        epreuve.courses.push(CONST.EPREUVE_1_COURSES[0]);
        epreuve.courses[0].performances.push(CONST.COURSES_1_PERFORMANCES[0]);
        log.info("performances :",epreuve.courses[0].performances);        
        expect(epreuve.validateSync(), "Epreuve should contains all the required fields.").to.be.undefined;
        done();
    });

    it('The epreuve should be added correctly', function (done) {
        log.info("epreuveKey = " + epreuveKey);
        Epreuve.getInstance(epreuveKey)
            .then(epreuveInstance => {
                log.error(epreuveInstance);
                expect(epreuveInstance).to.be.null;
                return Epreuve.createInstance(epreuve);
            })
            .then(epreuveCreated => {
                log.info("epreuve created :", epreuveCreated);
                checkEpreuve(epreuveCreated, epreuveToCheck);
                return Epreuve.getInstance(epreuveKey);
            })
            .then((epreuveInstance) => {
                log.info("epreuve instance :", epreuveInstance);
                checkEpreuve(epreuveInstance, epreuveToCheck);
                done();
            })
            .catch(error => { done(error); });

    });

    it('Add the same epreuve, it should not create a new one', function (done) {
        log.info("epreuve = " + epreuve);
        Epreuve.createInstance(epreuve)
            .then(doc => {
                return Epreuve.Instance.count();
            })
            .then((count) => {
                expect(count).to.equal(1);
                done();
            })
            .catch(error => { done(error); });
    });

    it('Update an existing epreuve, it should update the content. Adding a new Courses', function (done) {
        epreuve.courses.push(CONST.EPREUVE_1_COURSES[1]);
        epreuveToCheck.courses.push(CONST.EPREUVE_1_COURSES[1]);
        epreuve.courses[1].performances = CONST.COURSES_2_PERFORMANCES_1;
        epreuveToCheck.courses[1].performances = CONST.COURSES_2_PERFORMANCES_1;
        log.info("epreuve = " + epreuve);
        
        Epreuve.getInstance(epreuveKey)
            .then(epreuveInstance => {
                log.error(epreuveInstance);
                checkEpreuve(epreuveInstance, epreuveToCheck);
                epreuveInstance.courses.push()
                return Epreuve.updateInstance(epreuve);
            })
            .then((epreuveInstance) => {
                log.info("meeting instance :", epreuveInstance);
                checkEpreuve(epreuveInstance, epreuveToCheck);
                done();
            })
            .catch(error => { done(error); });
    });

    it('Update an existing epreuve, it should update the content. Adding a new Performances', function (done) {
        epreuve.courses[1].performances = CONST.COURSES_2_PERFORMANCES_2;
        epreuveToCheck.courses[1].performances = CONST.COURSES_2_PERFORMANCES_2;
        log.info("epreuve = " + epreuve);
        
        Epreuve.getInstance(epreuveKey)
            .then(epreuveInstance => {
                log.error(epreuveInstance);
                checkEpreuve(epreuveInstance, epreuveToCheck);
                epreuveInstance.courses.push()
                return Epreuve.updateInstance(epreuve);
            })
            .then((epreuveInstance) => {
                log.info("meeting instance :", epreuveInstance);
                checkEpreuve(epreuveInstance, epreuveToCheck);
                done();
            })
            .catch(error => { done(error); });
    });

});