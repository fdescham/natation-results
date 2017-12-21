var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var performanceSchema = require('./Performance').performanceSchema;

var courseSchema = new Schema({
    titre: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    performances: [ performanceSchema ]
});

module.exports.courseSchema = courseSchema;