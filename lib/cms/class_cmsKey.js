//////////////////////////////////////////////
//////////////      HEADER      //////////////
//////////////////////////////////////////////
// File :: Class CMS Key
// Author :: Pascal Nardini
// License :: MIT

//////////////////////////////////////////////
//////////////////////////////////////////////

const { isColorJSON, isNumber, isCMSKey } = require("../helper/guardClauses.js");
const { equalColors } = require("../color/colorHelper.js");

class KeyCMS {
  //////// Private Varaibles ////////
  #cL = undefined;
  #cR = undefined;
  #type = undefined;
  #oL = undefined; // opacity support for later?
  #oR = undefined;
  #mot = undefined; //middleOfTriple, boolean (for left or twin keys -> false = cL, true = cR;)
  #isBur = undefined;
  #ref = undefined;

  constructor(_cJSON_L, _cJSON_R, _refPos, _isBur, _mot) {
    this.setCL(_cJSON_L);
    this.setCR(_cJSON_R);
    this.setRef(_refPos);
    this.#type = "nil";
    this.determineType();
    this.#oL = 1.0;
    this.#oR = 1.0;
    this.#mot = false;
    this.#isBur = false;
    this.setBur(_isBur);
    this.setMoT(_mot);
  }

  setByJSON(_keyJSON) {
    if (isCMSKey(_keyJSON)) {
      this.setCL(_keyJSON.cL);
      this.setCR(_keyJSON.cR);
      this.setRef(_keyJSON.ref);
      this.determineType();
      this.setBur(_keyJSON.isBur);
      this.setMoT(_keyJSON.mot);
    } else throw new TypeError('Error (CMS Key) :: Function "setKeyJSON" :: Incorrect Left Key Color! Need to be a colorJSON or undefined;');
  }

  getKeyJSON() {
    let keyJSON = {};
    //keyJSON.type = this.#type;
    keyJSON.cL = this.#cL;
    keyJSON.cR = this.#cR;
    keyJSON.ref = this.#ref;
    keyJSON.mot = this.#mot; //middleOfTriple
    keyJSON.isBur = this.#isBur;
    return keyJSON;
  }

  setBur(_isBur) {
    if (typeof _isBur === "boolean") this.#isBur = _isBur;
    else console.warn('Warning (CMS Key) :: Function "setBur" :: Incorrect Parameter! Bur need to be a boolean;');
  }

  getBur() {
    return this.#isBur;
  }

  setCL(_cJSON_L) {
    if (isColorJSON(_cJSON_L) || _cJSON_L == undefined) this.#cL = _cJSON_L;
    else throw new TypeError('Error (CMS Key) :: Function "setCL" :: Incorrect Left Key Color! Need to be a colorJSON or undefined;');
    this.determineType();
  }

  setCR(_cJSON_R) {
    if (isColorJSON(_cJSON_R) || _cJSON_R == undefined) this.#cR = _cJSON_R;
    else throw new TypeError('Error (CMS Key) :: Function "setCR" :: Incorrect Right Key Color! Need to be a colorJSON or undefined;');
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

  setRef(_refPos) {
    if (isNumber(_refPos)) this.#ref = _refPos;
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

  setMoT(_mot) {
    if (typeof _mot === "boolean") this.#mot = _mot;
    else console.warn('Warning (CMS Key) :: Function "setMoT" :: Incorrect Parameter! Mot need to be a boolean;');
  }

  setOpacity(_val, _side) {
    switch (_side) {
      case "left":
        this.#oL = _val;
        break;
      case "right":
        this.#oR = _val;
        break;
      default:
    }
  }

  getOpacity(_side) {
    switch (_side) {
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
  KeyCMS: KeyCMS,
};
