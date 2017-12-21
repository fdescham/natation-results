var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var log = require('color-logs')(true, true, __filename);
var courseSchema = require('./Course').courseSchema;

const EPREUVE_MODEL_NAME = "Epreuve";

var epreuveSchema = new Schema({
    epreuveCode: {
        type: Number,
        required: true
    },
    meetingCode: {
        type: Number,
        required: true
    },
    courses: [ courseSchema ]
}
);

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
    return Epreuve.findOne().byKeyCode(keyCode).exec();
};

module.exports.Instance = Epreuve;
module.exports.createInstance = createInstance;
module.exports.getInstance = getInstance;
module.exports.updateInstance = updateInstance;