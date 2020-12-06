//////////////////////////////////////////////
//////////////      HEADER      //////////////
//////////////////////////////////////////////
// File :: Class CMS Key
// Author :: Pascal Nardini
// License :: MIT

//////////////////////////////////////////////
//////////////////////////////////////////////

const { isColorJSON, isNumber } = require("../helper/guardClauses.js");
const { equalColors } = require("../color/colorHelper.js");

class Key {
  //////// Private Varaibles ////////
  #cL = undefined;
  #cR = undefined;
  #type = undefined;
  #oL = undefined; // opacity support for later?
  #oR = undefined;
  #mot = undefined; //middleOfTriple
  #isBur = undefined;
  #ref = undefined;

  constructor(cJSON_L, cJSON_R, refPos, isBur, mot) {
    this.setCL(cJSON_L);
    this.setCR(cJSON_R);
    this.setRef(refPos);
    this.#type = "nil";
    this.determineType();
    this.#oL = 1.0;
    this.#oR = 1.0;
    this.#mot = false;
    this.#isBur = false;
    this.setBur(isBur);
    this.setMoT(mot);
  }

  getKeyJSON() {
    let keyJSON = {};
    keyJSON.type = this.#type;
    keyJSON.cL = this.#cL;
    keyJSON.cR = this.#cR;
    keyJSON.oL = this.#oL; // opacity support for later?
    keyJSON.oR = this.#oR;
    keyJSON.ref = this.#ref;
    keyJSON.mot = this.#mot; //middleOfTriple
    keyJSON.isBur = this.#isBur;
    return keyJSON;
  }

  setBur(isBur) {
    if (typeof isBur === "boolean") this.#isBur = isBur;
  }

  getBur() {
    return this.#isBur;
  }

  setCL(cJSON_L) {
    if (isColorJSON(cJSON_L) || cJSON_L == undefined) this.#cL = cJSON_L;
    else throw new TypeError('Error (CMS Key) :: Function "Constructor" :: Incorrect Left Key Color! Need to be a colorJSON or undefined;');
    this.determineType();
  }

  setCR(cJSON_R) {
    if (isColorJSON(cJSON_R) || cJSON_R == undefined) this.#cR = cJSON_R;
    else throw new TypeError('Error (CMS Key) :: Function "Constructor" :: Incorrect Right Key Color! Need to be a colorJSON or undefined;');
    this.determineType();
  }

  determineType() {
    if (this.#cL == undefined) {
      if (this.#cR == undefined) {
        this.#type = "nil";
        return;
      } else {
        this.#type = "right";
        return;
      }
    }
    if (this.#cR == undefined) {
      this.#type = "left";
      return;
    }
    if (equalColors(this.#cL, this.#cR)) {
      this.#type = "dual";
      return;
    } else {
      this.#type = "twin";
      return;
    }
  }

  getCL() {
    return this.#cL;
  }

  getCR() {
    return this.#cR;
  }

  setRef(refPos) {
    if (isNumber(refPos)) this.#ref = refPos;
    else throw new TypeError('Error (CMS Key) :: Function "Constructor" :: Incorrect Reference Value! Need to be a number;');
  }

  getRef() {
    return this.#ref;
  }

  getType() {
    return this.#type;
  }

  getMoT() {
    return this.#mot;
  }

  setMoT(mot) {
    if (typeof mot === "boolean") this.#mot = mot;
  }

  setOpacity(val, side) {
    switch (side) {
      case "left":
        this.#oL = val;
        break;
      case "right":
        this.#oR = val;
        break;
      default:
    }
  }

  getOpacity(side) {
    switch (side) {
      case "left":
        return this.#oL;
      case "right":
        return this.#oR;
    }
  }
}

////////////////////////////////////////////////////
//-------------- Private Functions --------------//
///////////////////////////////////////////////////
// Private function, which should only called with prooved parameters

///////////////////////////////////////////////////
module.exports = {
  Key: Key,
};
