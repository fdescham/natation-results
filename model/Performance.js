var Club = require("./Club");
var Nageur = require("./Nageur");
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var log = require('color-logs')(true, true, __filename);

const PERFORMANCE_MODEL_NAME = "Performance";

function convertToNumber(temps) {
    if (isNaN(parseInt(temps))) return -1;
    timeValue = temps.split(/[:.]+/);
    return parseInt(timeValue[2]) + 100 * (parseInt(timeValue[1]) + 60 * parseInt(timeValue[0]));
};

function convertToTime(temps) {
    if (temps === -1) return "--:--:--";
    var centisecs = temps % 100
    centisecs = (centisecs >= 10) ? centisecs : "0" + centisecs;
    var seconds = (temps / 100);
    var minutes = Math.floor(seconds / 60);
    minutes = (minutes >= 10) ? minutes : "0" + minutes;

    seconds = Math.floor(seconds % 60);
    seconds = (seconds >= 10) ? seconds : "0" + seconds;
    return minutes + ":" + seconds + ":" + centisecs;
};


function convertToPoint(points) {
    if (isNaN(parseInt(points))) return 0;
    return points;
};

var performanceSchema = new Schema({
    nageur:  {
        type: Schema.ObjectId,
        ref: Nageur.MODEL_NAME
    },
    club:  {
        type: Schema.ObjectId,
        ref: Club.MODEL_NAME
    },
    temps: {
        type: Number,
        required: true,
        get: convertToTime,
        set: convertToNumber

    },
    points: {
        type: Number,
        required: true,
        set: convertToPoint
    }
});

var Performance = mongoose.model(PERFORMANCE_MODEL_NAME, performanceSchema);

function createInstance(performanceObject) {
    log.info("createInstance :", performanceObject.nageur.nom," ", performanceObject.temps);
    return Performance.create(performanceObject);
};

function createAllInstances(performanceArray) {
    log.info("createAllInstances ", performanceArray.length);
    var promises = [];
    performanceArray.forEach(performanceObject => {
        promises.push(createInstance(performanceObject));
    });
    return Promise.all(promises);
};

module.exports.MODEL_NAME = PERFORMANCE_MODEL_NAME;
module.exports.Instance = Performance;
module.exports.createAllInstances = createAllInstances;