var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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
    codeNageur: {
        type: Number,
        required: true
    },
    codeClub: {
        type: Number,
        required: true
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

module.exports.performanceSchema = performanceSchema;