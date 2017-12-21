var mongoose = require('mongoose');
var Schema = mongoose.Schema;

function convertToNumber(temps) {
    timeValue = temps.split(/[:.]+/);
    return parseInt(timeValue[2])+100*(parseInt(timeValue[1])+60*parseInt(timeValue[0]));
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
        set: convertToNumber
    },
    points: {
        type: Number,
        required: true
    }
});

module.exports.performanceSchema = performanceSchema;