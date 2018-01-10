var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var log = require('color-logs')(true, true, __filename);
var Course = require('./Course');
var Performance = require('./Performance');

const EPREUVE_MODEL_NAME = "Epreuve";

const POPULATE_OPTIONS = {
    path: 'courses',
    populate: {
        path: "performances",
        populate: {
            path: "nageur",
            populate: {
                path: "club"
            }
        }
    }
};

var epreuveSchema = new Schema({
    epreuveCode: {
        type: Number,
        required: true
    },
    meetingCode: {
        type: Number,
        required: true
    },
    courses: [{
        type: Schema.ObjectId,
        ref: Course.MODEL_NAME
    }
    ]
});

epreuveSchema.query.byKeyCode = function (keyCode) {
    return this.findOne(keyCode);
};
var Epreuve = mongoose.model(EPREUVE_MODEL_NAME, epreuveSchema);

function createInstance(epreuveObject) {
    log.info("createInstance :", epreuveObject);
    var keyCode = {
        meetingCode: epreuveObject.meetingCode,
        epreuveCode: epreuveObject.epreuveCode
    }
    return new Promise((resolve, reject) => {
        getInstance(keyCode)
            .then(epreuveInstance => {
                log.info("getInstance :", epreuveInstance);
                if (epreuveInstance == null) {
                    log.info("epreuveObject :", epreuveObject);
                    Epreuve.create(epreuveObject)
                        .then(epreuveCreated => resolve(epreuveCreated))
                        .catch(error => reject(error))
                }
                else resolve(epreuveInstance);
            })
            .catch(error => { reject(error) })
    })
};

function createAllInstances(epreuveArray) {
    log.info("createAllInstances ", epreuveArray.length);
    var promises = [];
    epreuveArray.forEach(epreuveObject => {
        promises.push(createInstance(epreuveObject));
    });
    return Promise.all(promises);
};

function updateInstance(epreuveObject) {
    log.info("updateInstance :", epreuveObject);
    var keyCode = {
        meetingCode: epreuveObject.meetingCode,
        epreuveCode: epreuveObject.epreuveCode
    }
    return new Promise((resolve, reject) => {
        getInstance(keyCode)
            .then(epreuveInstance => {
                log.info("getInstance :", epreuveInstance);
                if (epreuveInstance == null) {
                    reject(new Error("Can not update a non existing instance."))
                }
                else {
                    epreuveInstance.courses = epreuveObject.courses;
                    log.info("epreuveInstance :", epreuveInstance);
                    epreuveInstance.save()
                        .then(epreuveCreated => resolve(epreuveCreated))
                        .catch(error => reject(error))
                }
            })
            .catch(error => { reject(error) })
    })
};

function getInstance(keyCode) {
    log.info("getInstance :", keyCode);
    return Epreuve.findOne().byKeyCode(keyCode);
};

function sortPerformance(a, b) {
    aTemps = Performance.convertToNumber(a.temps);
    bTemps = Performance.convertToNumber(b.temps);

    if (aTemps == -1)  return 1;
    if (bTemps == -1)  return -1;

    return aTemps - bTemps;
}

function getAllInstances(meetingCode) {
    log.info("getAllInstances :", meetingCode);
    return new Promise((resolve, reject) => {
        Epreuve
            .find({ meetingCode: meetingCode })
            .populate(POPULATE_OPTIONS)
            .then(epreuveList => {
                epreuveList.forEach(epreuveInstance => {
                    epreuveInstance.courses
                        .forEach(course => {
                            course.performances = course.performances.sort(sortPerformance);
                        });
                });
                resolve(epreuveList);
            })
            .catch(error => { reject(error) });
    })
};

function getAllInstancesByClub(meetingCode, clubCode) {
    log.info("getAllInstancesByClub :%d %d", meetingCode, clubCode);
    return new Promise((resolve, reject) => {
        Epreuve
            .find({ meetingCode: meetingCode })
            .populate(POPULATE_OPTIONS)
            .then(epreuveList => {
                epreuveList.forEach(epreuveInstance => {
                    epreuveInstance.courses
                        .forEach(course => {
                            course.performances = course.performances.filter(performance => performance.nageur.club.code === clubCode).sort(sortPerformance);
                        });

                    epreuveInstance.courses = epreuveInstance.courses.filter(course => course.performances.length > 0)

                });
                resolve(epreuveList);
            })
            .catch(error => { reject(error) })
    })
}

function getAllInstancesBySwimmer(meetingCode, nageurCode) {
    log.info("getAllInstancesBySwimmer :%d %d", meetingCode, nageurCode);
    return new Promise((resolve, reject) => {
        Epreuve
            .find({ meetingCode: meetingCode })
            .populate(POPULATE_OPTIONS)
            .then(epreuveList => {
                epreuveList.forEach(epreuveInstance => {
                    epreuveInstance.courses
                        .forEach(course => {
                            course.performances = course.performances.filter(performance => performance.nageur.codeIuf === nageurCode);
                        });

                    epreuveInstance.courses = epreuveInstance.courses.filter(course => course.performances.length > 0)

                });
                resolve(epreuveList);
            })
            .catch(error => { reject(error) })
    })
}

module.exports.Instance = Epreuve;
module.exports.createAllInstances = createAllInstances;
module.exports.createInstance = createInstance;
module.exports.getInstance = getInstance;
module.exports.getAllInstancesByClub = getAllInstancesByClub;
module.exports.getAllInstancesBySwimmer = getAllInstancesBySwimmer;
module.exports.getAllInstances = getAllInstances;
module.exports.updateInstance = updateInstance;