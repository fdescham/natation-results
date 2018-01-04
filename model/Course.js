var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Performance = require('./Performance');
var log = require('color-logs')(true, true, __filename);

const COURSE_MODEL_NAME = "Course";

var courseSchema = new Schema({
    titre: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    performances: [ {
        type: Schema.ObjectId,
        ref: Performance.MODEL_NAME
    } ]
});

var Course = mongoose.model(COURSE_MODEL_NAME, courseSchema);

function createInstance(courseObject) {
    log.info("createInstance :", courseObject.titre);
    return Course.create(courseObject);
};

function createAllInstances(courseArray) {
    log.info("createAllInstances");
    var promises = [];
    courseArray.forEach(courseObject => {
        promises.push(createInstance(courseObject));
    });
    return Promise.all(promises);
};

module.exports.MODEL_NAME = COURSE_MODEL_NAME;
module.exports.Instance = Course;
module.exports.createAllInstances = createAllInstances;