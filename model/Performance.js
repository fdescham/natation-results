module.exports = class performance {
    constructor(item,epreuve) {
        this.epreuve = epreuve;
        this.rang = item.querySelector("#mainRkgPla").textContent;
        this.temps = item.querySelector("#mainRkgTps").textContent;
        this.date = item.querySelector("#mainRkgDat").textContent;
        this.pts = item.querySelector("#mainRkgPts").textContent;
        this.lieu = item.querySelector("img").parentElement.outerHTML.split(this.date)[1].split("<")[0]; var nageurElement = item.querySelectorAll("#mainRkgNomClb");
    }
};
