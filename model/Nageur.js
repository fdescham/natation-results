var Club = require("./Club");
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var log = require('color-logs')(true, true, __filename);

const NAGEUR_MODEL_NAME = "Nageur";

function normalizeDate( date ) {
    var normalizedDate = parseInt(date);
    if ( normalizedDate <= 99 && normalizedDate > 30 ){
        normalizedDate += 1900;
    }
    else if (normalizedDate <= 30 )
        normalizedDate += 2000;

    return normalizedDate;

};

var nageurSchema = new Schema( {
        nom : {
            type :String,
            required : true 
        },
        anneeNaissance : {
            type :Number,
            required : true,
            set : normalizeDate 
        },
        nationalite : {
            type :String,
            required : true 
        },
        club:   {
            type: Schema.ObjectId,
            ref: Club.MODEL_NAME
        },
        codeIuf : {
            type :Number,
            required: true
        }
    }
);

nageurSchema.query.byCode = function( codeIuf ){
    return this.findOne({codeIuf : codeIuf});
};

function getNageurFromRanking( item ){
        var nageurElement = item.querySelectorAll("#mainRkgNomClb");
        var nageurDescription = nageurElement[0].textContent.split(/[-\(,\)]+/);

        
        return new Nageur({
            nom : nageurDescription[0],
            anneeNaissance : nageurDescription[1],
            nationalite : nageurDescription[3],
            club : getClubId(nageurElement[1].textContent)
        })
}

var Nageur = mongoose.model(NAGEUR_MODEL_NAME, nageurSchema);

function createInstance(nageurObject) {
    return new Promise((resolve, reject) => {
        getInstance(nageurObject.codeIuf)
            .then(nageurInstance => {
                if (nageurInstance == null) {
                    log.info("create a new Instance :", nageurObject.nom);                    
                    Nageur.create(nageurObject)
                        .then(nageurCreated => resolve(nageurCreated))
                        .catch(error => reject(error))
                }
                else resolve(nageurInstance);
            })
            .catch(error => { reject(error) })
    })
};

function createAllInstances(nageurArray) {
    log.info("createAllInstances");
    var promises = [];
    nageurArray.forEach(nageurObject => {
        promises.push(createInstance(nageurObject));
    });
    return Promise.all(promises);
};

function getInstance(codeIuf) {
    return  Nageur.findOne().byCode(codeIuf).exec();
};

module.exports.Instance = Nageur;
module.exports.createInstance = createInstance;
module.exports.createAllInstances = createAllInstances;
module.exports.getInstance = getInstance;
module.exports.MODEL_NAME = NAGEUR_MODEL_NAME;