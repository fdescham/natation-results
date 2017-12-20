'use strict';
var chai = require('chai');
var expect = chai.expect;
var log = require('color-logs')(true, true, __filename);
var CONST = require('./constants');
var connectDatabase = require('./tools').connectDatabase;
var Nageur = require('../model/Nageur');

describe('Add a new Nageur', function () {

  before("Initialize Database", function (done) { return connectDatabase(done); });

  var nageur = new Nageur.Instance({
    nom: CONST.NAGEUR_1.nom,
    anneeNaissance: CONST.NAGEUR_1.anneeNaissance
  });

  function checkNageur(nageurFrom, nageurTo){
    expect(nageurFrom.codeClub).to.equal(nageurTo.codeClub);
    expect(nageurFrom.nationalite).to.equal(nageurTo.nationalite);
    expect(nageurFrom.codeIuf).to.equal(nageurTo.codeIuf);
    expect(nageurFrom.nom).to.equal(nageurTo.nom);
  };

  it('Test the normalisation of anneNaissance', function (done) {
    nageur.anneeNaissance = "00";
    expect(nageur.anneeNaissance).to.equals(2000);
    nageur.anneeNaissance = "99";
    expect(nageur.anneeNaissance).to.equals(1999);
    nageur.anneeNaissance = "31";
    expect(nageur.anneeNaissance).to.equals(1931);
    nageur.anneeNaissance = "20";
    expect(nageur.anneeNaissance).to.equals(2020);
    nageur.anneeNaissance = "2000";
    expect(nageur.anneeNaissance).to.equals(2000);
    nageur.anneeNaissance = "1999";
    expect(nageur.anneeNaissance).to.equals(1999);
    nageur.anneeNaissance = "1931";
    expect(nageur.anneeNaissance).to.equals(1931);
    nageur.anneeNaissance = "2020";
    expect(nageur.anneeNaissance).to.equals(2020);
    nageur.anneeNaissance = 0;
    expect(nageur.anneeNaissance).to.equals(2000);
    nageur.anneeNaissance = 99;
    expect(nageur.anneeNaissance).to.equals(1999);
    nageur.anneeNaissance = 31;
    expect(nageur.anneeNaissance).to.equals(1931);
    nageur.anneeNaissance = 20;
    expect(nageur.anneeNaissance).to.equals(2020);
    nageur.anneeNaissance = 2000;
    expect(nageur.anneeNaissance).to.equals(2000);
    nageur.anneeNaissance = 1999;
    expect(nageur.anneeNaissance).to.equals(1999);
    nageur.anneeNaissance = 1931;
    expect(nageur.anneeNaissance).to.equals(1931);
    nageur.anneeNaissance = 2020;
    expect(nageur.anneeNaissance).to.equals(2020);
    done();
  });


  it('The nageur should be initialized correctly', function (done) {
    expect(nageur.validateSync(), "Nageur should contains all the required fields.").not.to.be.undefined;
    nageur.nationalite = CONST.NAGEUR_1.nationalite;
    nageur.codeIuf = CONST.NAGEUR_1.codeIuf;
    nageur.codeClub = CONST.NAGEUR_1.codeClub;
    done();
  });

  it('The Nageur should be added correctly', function (done) {
    log.info("nageur = " + nageur);
    Nageur.getInstance(CONST.NAGEUR_1.codeIuf)
      .then(nageurInstance => {
        log.error(nageurInstance);
        expect(nageurInstance).to.be.null;
        return Nageur.createInstance(nageur);
      })
      .then(nageurCreated => {
        log.info("nageur created :", nageurCreated);
        checkNageur(nageurCreated,CONST.NAGEUR_1);
        return Nageur.getInstance(CONST.NAGEUR_1.codeIuf);
      })
      .then((nageurInstance) => {
        log.info("nageur instance :", nageurInstance);
        checkNageur(nageurInstance,CONST.NAGEUR_1);
        done();
      })
      .catch(error => { done(error); });

  });

  it('Add the same nageur, it should not be added', function (done) {
    log.info("nageur = " + nageur);
    Nageur.createInstance(nageur)
      .then(doc => {
        return Nageur.Instance.count();
      })
      .then((count) => {
        expect(count).to.equal(1);
        done();
      })
      .catch(error => { done(error); });
  });

});