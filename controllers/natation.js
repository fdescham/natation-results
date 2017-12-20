var request = require("request");
var jsdom = require("jsdom");
var Epreuve = require("../model/Epreuve");
var Nageur = require("../model/Nageur");
var Performance = require("../model/Performance");

module.exports = function (req, res, next)  {
    var { JSDOM } = jsdom;
    var options = {
        headers: {
            'User-Agent': 'request'
        }
    };

    const CSNG = "CSN GUYANCOURT";

    JSDOM.fromURL("https://ffn.extranat.fr/webffn/nat_rankings.php?idact=nat&go=epr&idbas=25&idcat=14&idmin=&idmax=&idsai=2018&idzon=2971&idepr=91", options).then(dom => {
        var tableauPerformance = dom.window.document.querySelector("#styleNoBorder");
        var epreuve  = new Epreuve( dom.window.document.querySelector(".enteteCompetition"));
        var listPerformance = tableauPerformance.querySelectorAll("tr");
        for (var item of listPerformance) {
            nageur = new Nageur(item);
            nageur.addPerformance( new Performance(item,epreuve));
            if (nageur.club === CSNG) {
                res.render('nageur', { title: "Natation", nageur: nageur });
            }
        };

        
    });
}