"use strict"
var log = require('color-logs')(true, true, __filename);
var { JSDOM } = require("jsdom");
var mongoose = require('mongoose');
var Club = require('../model/Club');
var Course = require('../model/Course');
var Epreuve = require('../model/Epreuve');
var Meeting = require('../model/Meeting');
var Nageur = require('../model/Nageur');
var Performance = require('../model/Performance');

const OPTIONS_URL = {
    headers: {
        'User-Agent': 'request'
    }
};

function getMeetingCode(codeString) {
    return codeString.split('competition=')[1].split("&")[0];
}

function getEpreuveCode(codeString) {
    return codeString.split('epreuve=')[1];
}

function getMeeting(dom) {
    var meeting = new Meeting.Instance();

    var lieu = dom.window.document.querySelector(".lieu");
    if (lieu) {
        meeting.lieu = lieu.textContent.trim()
    }

    var titre = dom.window.document.querySelector(".titre");
    if (titre) {
        titre = titre.textContent.trim().split('-');
        meeting.nom = titre[0].trim()
        meeting.bassin = titre[titre.length-1].split("m")[0].trim();
    }

    var date = dom.window.document.querySelector(".date");
    if (date) {
        meeting.date = date.textContent.trim();
    }

    try {
        var competition = dom.window.document.querySelector(".survol a");
        meeting.code = getMeetingCode(competition.href);
    }
    catch (e) {
        log.error(e);
    }

    return meeting;
}


function getPerformance(club, nageur, element, tds) {
    var performance = new Performance.Instance();
    performance.temps = tds[5].textContent.replace(/[\n\t]/, " ").split(" ")[0];
    performance.points = element.querySelector(".points").textContent.split("pt")[0].trim();
    performance.nageur = nageur;
    performance.club = club;
    return performance;
}

function getCourse(element) {
    var titre = element.querySelector(".epreuve");
    var course;
    if (titre) {
        course = new Course.Instance();
        titre = element.textContent.replace(/(\n\t)/, "").split(/[/(/)]+/);
        course.titre = titre[0].trim();
        course.date = titre.length > 1 ? titre[1].trim() : "Undefined";
        course.toBeTreated = 0;
    }

    return course;
}

function getEpreuve(dom) {
    var epreuve = new Epreuve.Instance();
    var epreuveCode = dom.window.document.querySelectorAll(".options option:selected");
    try {
        if (epreuveCode[0].value.length > 0) {
            epreuve.meetingCode = getMeetingCode(epreuveCode[0].value);
            epreuve.epreuveCode = getEpreuveCode(epreuveCode[0].value);
        }
        else if (epreuveCode[1].value.length > 0) {
            epreuve.meetingCode = getMeetingCode(epreuveCode[1].value);
            epreuve.epreuveCode = getEpreuveCode(epreuveCode[1].value);
        }
    }
    catch (e) { log.error(e); }
    return epreuve;
}

class MeetingLiveFfn {
    constructor() {
        this.meeting = {};
        this.epreuves = [];
        this.nageurs = [];
        this.clubs = [];
        this.clubsBeingManaged = [];
        this.courses = [];
        this.performances = [];
    }

    get meetingInstance() {
        return this.meeting;
    }

    get epreuveArrayInstance() {
        return this.epreuves;
    }

    get clubArrayInstance() {
        return this.clubs;
    }

    get nageurArrayInstance() {
        return this.nageurs;
    }

    get courseArrayInstance() {
        return this.courses;
    }

    get performanceArrayInstance() {
        return this.performances;
    }

    get meetingInstance() {
        return this.meeting;
    }

    getClub(element) {
        return new Promise(async (resolve, reject) => {
            var newClub = new Club.Instance();
            newClub.nom = element.textContent.trim();
            newClub.code = element.querySelector("a").href.split('structure=')[1];
            
            if (newClub.code === undefined) {
                newClub.code = Club.UNDEFINED_CODE;
            }

            // Verify the club has already been treated.
            var foundClub = this.clubs.find(club => club.code == newClub.code);
            if (foundClub) resolve(foundClub);

            // Verify the club is being treated.
            foundClub = this.clubsBeingManaged.find(club => club.code == newClub.code);
            if (foundClub) {
                resolve(foundClub);
            }
            else {
                this.clubsBeingManaged.push(newClub);
            }

            // Try to find the club in database.
            var clubInstance = await Club.getInstance(newClub.code);
            if (clubInstance) {
                newClub._id = clubInstance._id;
            }
            else {
                // Replace the club contents if it contents has already been treated.
                foundClub = this.clubsBeingManaged.find(club => club.code == newClub.code);
                if (foundClub) {
                    newClub = foundClub;
                }
            }

            foundClub = this.clubs.find(club => club.code == newClub.code);
            if (foundClub) newClub = foundClub
            else this.clubs.push(newClub);

            resolve(newClub);
        })
    }

    getNageur(club, tds) {
        return new Promise(async (resolve, reject) => {
            var nageur = new Nageur.Instance();
            nageur.codeIuf = tds[1].querySelector("a").href.split('iuf=')[1];
            nageur.nom = tds[1].textContent.trim();
            nageur.anneeNaissance = tds[2].textContent.trim();
            nageur.nationalite = tds[3].textContent.trim();
            nageur.club = club;

            // Try to find the nageur in database.
            var nageurInstance = await Nageur.getInstance(nageur.codeIuf);
            if (nageurInstance) {
                nageur._id = nageurInstance._id;
                nageur.club = nageurInstance.club;
            }

            var foundNageur = this.nageurs.find(element => element.codeIuf === nageur.codeIuf);
            if (foundNageur) nageur = foundNageur
            else this.nageurs.push(nageur);

            resolve(nageur);
        });
    }

    getEpreuveData(dom) {
        return new Promise((resolve, reject) => {
            var epreuve = getEpreuve(dom);

            try {
                var tableau = dom.window.document.querySelectorAll(".tableau tr");
                var course, newCourse, performanceToBeTreated = 0;
                tableau.forEach(async (element, index, array) => {
                    if (element.className == "survol") {
                        var tds = element.querySelectorAll("td");
                        var club, nageur, performance, myCourse = course;
                        performanceToBeTreated++;
                        myCourse.toBeTreated++;
                        club = await this.getClub(tds[4]);
                        nageur = await this.getNageur(club, tds);
                        performance = getPerformance(club, nageur, element, tds);
                        myCourse.performances.push(performance);
                        this.performances.push(performance);
                        performanceToBeTreated--;
                        myCourse.toBeTreated--;
                        if (myCourse.toBeTreated == 0) {
                            epreuve.courses.push(myCourse);
                            this.courses.push(myCourse);
                        }
                        if (performanceToBeTreated == 0) {
                            resolve(epreuve);
                        }
                    }
                    else {
                        var newCourse = getCourse(element);
                        if (newCourse) {
                            course = newCourse = getCourse(element) ? newCourse : course;
                        }
                    }
                });
            }
            catch (e) { log.error(e); }
        })
    }

    getData(dom) {
        return new Promise((resolve, reject) => {
            this.meeting = getMeeting(dom);

            this.getEpreuveData(dom)
                .then(epreuve => {
                    this.epreuves.push(epreuve);

                    epreuve.courses.forEach(course => {
                        log.info("course = ", course.titre, ' - ', course.performances.length);
                    });

                    this.clubs.forEach(club => {
                        log.info("club = ", club.nom, ' - ', club.code);
                    });

                    this.nageurs.forEach(nageur => {
                        //log.info("nageur = ", nageur.nom, ' - ', nageur._id);
                    });

                    resolve(epreuve);
                })
                .catch(reject);
        })
    }

    static fromFile(filePath) {
        return new Promise((resolve, reject) => {
            var meeting = new MeetingLiveFfn();
            JSDOM.fromFile(filePath)
                .then(dom => {
                    return meeting.getData(dom);
                })
                .then(epreuveUpdated => {
                    resolve(meeting);
                })
                .catch(error => { reject(error) })
        })
    }

    fromUrl(urlPath) {
        return new Promise((resolve, reject) => {
            log.info("fromUrl :", urlPath);
            JSDOM.fromURL(urlPath, OPTIONS_URL)
                .then(dom => {
                    log.info("Parse ", urlPath);
                    return this.getData(dom);
                })
                .then(epreuveUpdated => {
                    log.info(urlPath, "epreuveUpdated :", epreuveUpdated.meetingCode, epreuveUpdated.epreuveCode);
                    if (epreuveUpdated.meetingCode && epreuveUpdated.epreuveCode) resolve(epreuveUpdated);
                    else resolve(undefined);
                })
                .catch(reject);
        })
    }

    static getAllMeetingEpreuve(competitionCode) {
        return new Promise((resolve, reject) => {
            var meeting = new MeetingLiveFfn();
            JSDOM.fromURL("http://www.liveffn.com/cgi-bin/resultats.php?competition=" + competitionCode + "&langue=fra&go=epreuve", OPTIONS_URL)
                .then(dom => {
                    var epreuveListUrl = Array.from(dom.window.document.querySelectorAll(".options"))
                        .filter(option => !option.textContent.includes("Relais"))
                        .map(option => Array.from(option.querySelectorAll("option"))
                            .filter(url => url.value != "")
                            .map(element => element.value))
                        .reduce((a, b) => a.concat(b));

                    var promises = [];
                    epreuveListUrl.forEach(element => {
                        promises.push(meeting.fromUrl(element));
                    })
                    return Promise.all(promises);
                })
                .then(epreuveList => {
                    // Remove all the epreuve that looks not correct.
                    epreuveList = epreuveList.filter(epreuve => epreuve !== undefined);

                    epreuveList.forEach(epreuve => {
                        epreuve.courses.forEach(course => {
                            log.info("epreuve : ", course.date, " ", course.titre);
                        })
                    })
                    resolve(meeting)
                })
                .catch(reject);
        })
    }

    saveAllData() {
        var promises = [];
        promises.push(Meeting.createInstance(this.meeting));
        promises.push(Club.createAllInstances(this.clubs));
        promises.push(Nageur.createAllInstances(this.nageurs));
        promises.push(Performance.createAllInstances(this.performances));
        promises.push(Course.createAllInstances(this.courses));
        promises.push(Epreuve.createAllInstances(this.epreuves));

        return Promise.all(promises);
    }
}



module.exports.MeetingLiveFfn = MeetingLiveFfn;