var log = require('color-logs')(true, true, __filename);
var { JSDOM } = require("jsdom");
var mongoose = require('mongoose');
var Epreuve = require('../model/Epreuve');
var Meeting = require('../model/Meeting');

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
        var course = {};
        tableau.forEach(element => {
            if (element.className == "survol") {
                var nageur = {};
                var performance = {};
                var club = {};
                var tds = element.querySelectorAll("td");
                performance.codeNageur = tds[1].querySelector("a").href.split('iuf=')[1];
                nageur.nom = tds[1].textContent.trim();
                nageur.codeIuf = performance.codeNageur;
                nageur.anneeNaissance = tds[2].textContent.trim();
                nageur.nationalite = tds[3].textContent.trim();
                club.nom = tds[4].textContent.trim();
                club.code = tds[4].querySelector("a").href.split('structure=')[1];
                performance.codeClub = club.code;
                nageur.codeClub = club.code;
                performance.temps = tds[5].textContent.replace(/[\n\t]/, " ").split(" ")[0];
                performance.points = element.querySelector(".points").textContent.split("pt")[0].trim();
                if (clubs.findIndex(element => element.code === club.code) === -1) {
                    clubs.push(club);
                }
                if (nageurs.findIndex(element => element.codeIuf === nageur.codeIuf) === -1) {
                    nageurs.push(nageur);
                }
                course.performances.push(performance);
            }
            else {
                var titre = element.querySelector(".epreuve");
                if (titre) {
                    if (course.performances) {
                        epreuve.courses.push(course);
                        course = {};
                    }
                    titre = element.textContent.replace(/(\n\t)/, "").split(/[/(/)]+/);
                    course.titre = titre[0].trim();
                    course.date = titre[1].trim();
                    course.performances = [];
                }
            }
        });
        if (course.performances) {
            epreuve.courses.push(course);
        }
    }
    catch (e) { log.error(e); }


    return {
        epreuve: epreuve,
        clubs: clubs,
        nageurs: nageurs
    };
}

class EpreuveLiveFfn {
    constructor(dom) {
        this.meeting = getMeeting(dom);
        var data = getEpreuve(dom);
        this.epreuve = data.epreuve;
        this.nageurs = data.nageurs;
        this.clubs = data.clubs
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