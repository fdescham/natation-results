var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var log = require('color-logs')(true, true, __filename);

const MEETING_MODEL_NAME = "Meeting";

var meetingSchema = new Schema({
    lieu: {
        type: String,
        required: true
    },
    nom: {
        type: String,
        required: true
    },
    bassin: {
        type: String,
        enum: ['25','50'],
        required: true
    },
    dateMeeting: {
        type: String,
        required: true
    },
    code: {
        type: Number,
        required: true
    }
}
);

meetingSchema.query.byCode = function (code) {
    return this.findOne({ code: code });
};

var Meeting = mongoose.model(MEETING_MODEL_NAME, meetingSchema);

function createInstance(meetingObject) {
    log.info("createInstance :", meetingObject);
    return new Promise((resolve, reject) => {
        getInstance(meetingObject.code)
            .then(meetingInstance => {
                log.info("getInstance :", meetingInstance);
                if (meetingInstance == null) {
                    log.info("meetingObject :", meetingObject);
                    Meeting.create(meetingObject)
                        .then(meetingCreated => resolve(meetingCreated))
                        .catch(error => reject(error))
                }
                else resolve(meetingInstance);
            })
            .catch(error => { reject(error) })
    })
};

function getInstance(clubCode) {
    log.info("getInstance :", clubCode);
    return Meeting.findOne().byCode(clubCode).exec();
};

module.exports.Instance = Meeting;
module.exports.createInstance = createInstance;
module.exports.getInstance = getInstance;