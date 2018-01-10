'use strict';
var log = require('color-logs')(true, true, __filename);
var Epreuve = require("../../model/Epreuve");

function retrieveAllEpreuves(meetingCodeList, done) {
    meetingCodeList.forEach(meetingCode => {
        Epreuve.getAllInstances(meetingCode)
            .then(epreuveList => {
                epreuveList.forEach(epreuveInstance => {
                    epreuveInstance.courses.forEach(course => {
                        log.info(course.titre);
                        course.performances.forEach(performance => {
                            log.info(performance.temps,' ', performance.nageur ? performance.nageur.nom : null);
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
                epreuveList.forEach(epreuveInstance => {
                    epreuveInstance.courses.forEach(course => {
                        log.info(course.titre);
                        course.performances.forEach(performance => {
                            log.info(performance.temps,' ', performance.nageur ? performance.nageur.nom : null);
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
                epreuveList.forEach(epreuveInstance => {
                    epreuveInstance.courses.forEach(course => {
                        course.performances.forEach(performance => {
                            log.info( performance.nageur ? performance.nageur.nom : null, performance.temps, course.titre);
                        })
                    })
                });
                done();
            })
            .catch(e => done(e));
    });
}

module.exports.retrieveAllEpreuves = retrieveAllEpreuves;
module.exports.retrieveAllEpreuvesByClub = retrieveAllEpreuvesByClub;
module.exports.retrieveAllEpreuvesBySwimmer = retrieveAllEpreuvesBySwimmer;
