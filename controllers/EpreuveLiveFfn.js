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
        meeting.bassin = titre[1].split("m")[0].trim();
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

function getClub(clubs, element) {
    return new Promise(async (resolve, reject) => {
        var newClub = new Club.Instance();
        newClub.nom = element.textContent.trim();
        newClub.code = element.querySelector("a").href.split('structure=')[1];

        // Try to find the club in database.
        var clubInstance = await Club.getInstance(newClub.code);
        if (clubInstance) {
            newClub._id = clubInstance._id;
        }

        var foundClub = clubs.find(club => club.code == newClub.code);
        if (foundClub) newClub = foundClub
        else clubs.push(newClub);

        resolve(newClub);
    })
}

function getNageur(nageurs, club, tds) {
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

        var foundNageur = nageurs.find(element => element.codeIuf === nageur.codeIuf);
        if (foundNageur) nageur = foundNageur
        else nageurs.push(nageur);

        resolve(nageur);
    });
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
        course.date = titre[1].trim();
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

class EpreuveLiveFfn {
    constructor(dom) {
        this.dom = dom;
        this.meeting = {};
        this.epreuve = {};
        this.nageurs = [];
        this.clubs = [];
        this.courses = [];
        this.performances = [];
    }

    get meetingInstance() {
        return this.meeting;
    }

    get epreuveInstance() {
        return this.epreuve;
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

    getEpreuveData() {
        return new Promise((resolve, reject) => {
            this.epreuve = getEpreuve(this.dom);

            try {
                var tableau = this.dom.window.document.querySelectorAll(".tableau tr");
                var course, newCourse, performanceToBeTreated = 0;
                tableau.forEach(async (element, index, array) => {
                    if (element.className == "survol") {
                        var tds = element.querySelectorAll("td");
                        var club, nageur, performance, myCourse = course;
                        performanceToBeTreated++;
                        myCourse.toBeTreated++;
                        club = await getClub(this.clubs, tds[4]);
                        nageur = await getNageur(this.nageurs, club, tds);
                        performance = getPerformance(club, nageur, element, tds);
                        myCourse.performances.push(performance);
                        this.performances.push(performance);
                        performanceToBeTreated--;
                        myCourse.toBeTreated--;
                        if (myCourse.toBeTreated == 0) {
                            this.epreuve.courses.push(myCourse);
                            this.courses.push(myCourse);
                        }
                        if (performanceToBeTreated == 0) resolve(this);
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

    getData() {
        return new Promise((resolve, reject) => {
            this.meeting = getMeeting(this.dom);

            this.getEpreuveData()
                .then(data => {
                    this.epreuve = data.epreuve;
                    this.nageurs = data.nageurs;
                    this.clubs = data.clubs;
                    this.courses = data.courses;
                    this.performances = data.performances;

                    this.epreuve.courses.forEach(course => {
                        log.info("course = ", course.titre, ' - ', course.performances.length);
                    });
                    log.info("Epreuve = ", this.epreuve.courses[0].performances);

                    this.clubs.forEach(club => {
                        log.info("club = ", club.nom, ' - ', club._id);
                    });

                    this.nageurs.forEach(nageur => {
                        log.info("nageur = ", nageur.nom, ' - ', nageur._id);
                    });

                    resolve(this);
                })
                .catch(reject);
        })
    }

    static fromFile(filePath) {
        return new Promise((resolve, reject) => {
            JSDOM.fromFile(filePath)
                .then(dom => {
                    return new EpreuveLiveFfn(dom).getData();
                })
                .then(epreuveUpdated => {
                    resolve(epreuveUpdated);
                })
                .catch(error => { reject(error) })
        })
    }

    saveAllData() {
        var promises = [];
        promises.push(Club.createAllInstances(this.clubs));
        promises.push(Nageur.createAllInstances(this.nageurs));
        promises.push(Performance.createAllInstances(this.performances));
        promises.push(Course.createAllInstances(this.courses));
        promises.push(Epreuve.createInstance(this.epreuve));

        return Promise.all(promises);
    }
}



module.exports.EpreuveLiveFfn = EpreuveLiveFfn;