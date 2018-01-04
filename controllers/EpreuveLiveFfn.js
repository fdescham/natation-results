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

function getEpreuve(dom) {
    var epreuve = new Epreuve.Instance();
    var nageurs = [];
    var clubs = [];
    var courses = [];
    var performances = [];
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

    try {
        var tableau = dom.window.document.querySelectorAll(".tableau tr");
        var course = new Course.Instance();
        tableau.forEach(element => {
            if (element.className == "survol") {
                var tds = element.querySelectorAll("td");
                // Get Club Information.
                var club = new Club.Instance();
                club.nom = tds[4].textContent.trim();
                club.code = tds[4].querySelector("a").href.split('structure=')[1];

                // Get Nageur Information.
                var nageur = new Nageur.Instance();
                nageur.codeIuf = tds[1].querySelector("a").href.split('iuf=')[1];
                nageur.nom = tds[1].textContent.trim();
                nageur.anneeNaissance = tds[2].textContent.trim();
                nageur.nationalite = tds[3].textContent.trim();

                // Get Performance Information.
                var performance = new Performance.Instance();
                performance.temps = tds[5].textContent.replace(/[\n\t]/, " ").split(" ")[0];
                performance.points = element.querySelector(".points").textContent.split("pt")[0].trim();

                if ((foundClub = clubs.find(element => element.code === club.code)) === undefined) {
                    clubs.push(club);
                }
                else {
                    club = foundClub;
                }
                nageur.club = club;
                if ((found_nageur = nageurs.find(element => element.codeIuf === nageur.codeIuf)) === undefined) {
                    nageurs.push(nageur);
                }
                else {
                    nageur = found_nageur;
                }
                // Get Performance Information.
                performance.nageur = nageur;
                performance.club = club;
                course.performances.push(performance);
                performances.push(performance);

                Club.getInstance(club.code).then( clubInstance => { 
                    if (clubInstance) club._id = clubInstance._id;
                })
                Nageur.getInstance(nageur.codeIuf).then( nageurInstance => { 
                    if (nageurInstance) {
                        nageur._id = nageurInstance._id;
                        nageur.club = nageurInstance.club;
                    }
                })
                
            }
            else {
                var titre = element.querySelector(".epreuve");
                if (titre) {
                    if (course.performances != 0) {
                        epreuve.courses.push(course);
                        courses.push(course);
                        course = new Course.Instance();
                    }
                    titre = element.textContent.replace(/(\n\t)/, "").split(/[/(/)]+/);
                    course.titre = titre[0].trim();
                    course.date = titre[1].trim();
                }
            }
        });
        if (course.performances.length != 0) {
            epreuve.courses.push(course);
            courses.push(course);
        }


    }
    catch (e) { log.error(e); }


    return {
        epreuve: epreuve,
        clubs: clubs,
        nageurs: nageurs,
        courses: courses,
        performances: performances,
    };
}

class EpreuveLiveFfn {
    constructor(dom) {
        this.meeting = getMeeting(dom);
        var data = getEpreuve(dom);
        this.epreuve = data.epreuve;
        this.nageurs = data.nageurs;
        this.clubs = data.clubs;
        this.courses = data.courses;
        this.performances = data.performances;

        log.info("Epreuve = ", this.epreuve);

        this.clubs.forEach(club => {
            log.info("club = ", club.nom, ' - ', club._id);
        });

        this.nageurs.forEach(nageur => {
            log.info("nageur = ", nageur.nom, ' - ', nageur._id);
        })
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

function fromFile(filePath) {
    return new Promise((resolve, reject) => {
        JSDOM.fromFile(filePath)
            .then(dom => {
                resolve(new EpreuveLiveFfn(dom));
            })
            .catch(error => { reject(error) })
    })
}

module.exports.fromFile = fromFile;