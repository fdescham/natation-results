var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var log = require('color-logs')(true, true, __filename);

const CLUB_MODEL_NAME = "Club";

var clubSchema = new Schema({
    nom: {
        type: String,
        required: true
    },
    code: {
        type: Number,
        required: true
    }
}
);

clubSchema.query.byCode = function( code ){
    return this.findOne({code : code});
};

var Club = mongoose.model(CLUB_MODEL_NAME, clubSchema);

function createInstance(clubObject) {
    log.info("createInstance :", clubObject.nom);
    return new Promise((resolve, reject) => {
        getInstance(clubObject.code)
            .then(clubInstance => {
                if (clubInstance == null) {
                    Club.create(clubObject)
                        .then(clubCreated => resolve(clubCreated))
                        .catch(error => reject(error))
                }
                else resolve(clubInstance);
            })
            .catch(error => { reject(error) })
    })
};

function createAllInstances(clubArray) {
    log.info("createAllInstances");
    var promises = [];
    clubArray.forEach(clubObject => {
        promises.push(createInstance(clubObject));
    });
    return Promise.all(promises);
};

function getInstance(clubCode) {
    log.info("getInstance :", clubCode);
    return  Club.findOne().byCode(clubCode).exec();
};

module.exports.Instance = Club;
module.exports.createAllInstances = createAllInstances;
module.exports.createInstance = createInstance;
module.exports.getInstance = getInstance;
module.exports.MODEL_NAME = CLUB_MODEL_NAME;