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

    log.info(date, normalizedDate)
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
        codeClub : {
            type :Number,
            required : true
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
    log.info("createInstance :", nageurObject);
    return new Promise((resolve, reject) => {
        getInstance(nageurObject.codeIuf)
            .then(nageurInstance => {
                log.info("getInstance :",nageurInstance);
                if (nageurInstance == null) {
                    log.info("nageurObject :",nageurObject);
                    Nageur.create(nageurObject)
                        .then(nageurCreated => resolve(nageurCreated))
                        .catch(error => reject(error))
                }
                else resolve(nageurInstance);
            })
            .catch(error => { reject(error) })
    })
};

function getInstance(codeIuf) {
    log.info("getInstance :", codeIuf);
    return  Nageur.findOne().byCode(codeIuf).exec();
};

module.exports.Instance = Nageur;
module.exports.createInstance = createInstance;
module.exports.getInstance = getInstance;