//////////////////////////////////////////////
//////////////      HEADER      //////////////
//////////////////////////////////////////////
// File :: Class CMS Key
// Author :: Pascal Nardini
// License :: MIT

//////////////////////////////////////////////
//////////////////////////////////////////////

const { isColorJSON, isNumber, isCMSKey } = require("../helper/guardClauses.js");
const { Color } = require("../color/class_Color.js");

class KeyCMS {
  //////// Private Varaibles ////////
  // use p_ as placeholder for # (# private variables are not supported by e.g. react)
  constructor(_cJSON_L, _cJSON_R, _refPos, _isBur, _mot) {
    this.p_cL = new Color(); // only RGB Color JSON!
    this.p_cR = new Color(); // only RGB Color JSON!
    this.p_ref = undefined;
    this.setCL(_cJSON_L);
    this.setCR(_cJSON_R);
    this.setRef(_refPos);
    this.p_type = "nil";
    this._determineType();
    this.p_oL = 1.0;
    this.p_oR = 1.0;
    this.p_mot = false;
    this.p_isBur = false;
    this.setBur(_isBur);
    this.setMoT(_mot);
  }

  setByJSON(_keyJSON) {
    if (isCMSKey(_keyJSON)) {
      this.setCL(_keyJSON.cL);
      this.setCR(_keyJSON.cR);
      this.setRef(_keyJSON.ref);
      this._determineType();
      this.setBur(_keyJSON.isBur);
      this.setMoT(_keyJSON.mot);
    } else throw new TypeError('Error (CMS Key) :: Function "setKeyJSON" :: Incorrect Left Key Color! Need to be a colorJSON or undefined;');
  }

  getKeyJSON() {
    let keyJSON = {};
    //keyJSON.type = this.p_type;
    keyJSON.cL = this.p_cL.getColorJSON();
    keyJSON.cR = this.p_cR.getColorJSON();
    keyJSON.ref = this.p_ref;
    keyJSON.mot = this.p_mot; //middleOfTriple
    keyJSON.isBur = this.p_isBur;
    return keyJSON;
  }

  setBur(_isBur) {
    if (typeof _isBur === "boolean") this.p_isBur = _isBur;
    //else console.warn('Warning (CMS Key) :: Function "setBur" :: Incorrect Parameter! Bur need to be a boolean;');
  }

  getBur() {
    return this.p_isBur;
  }

  setCL(_cJSON_L) {
    if (isColorJSON(_cJSON_L) || _cJSON_L == undefined) this.p_cL.setColorJSON(_cJSON_L);
    else throw new TypeError('Error (CMS Key) :: Function "setCL" :: Incorrect Left Key Color! Need to be a colorJSON or undefined;');
    this._determineType();
  }

  setCR(_cJSON_R) {
    if (isColorJSON(_cJSON_R) || _cJSON_R == undefined) this.p_cR.setColorJSON(_cJSON_R);
    else throw new TypeError('Error (CMS Key) :: Function "setCR" :: Incorrect Right Key Color! Need to be a colorJSON or undefined;');
    this._determineType();
  }

  _determineType() {
    if (this.p_cL.isUndefined()) {
      if (this.p_cR.isUndefined()) {
        this.p_type = "nil";
        return;
      } else {
        this.p_type = "right";
        return;
      }
    }
    if (this.p_cR.isUndefined()) {
      this.p_type = "left";
      return;
    }
    if (this.p_cL.equalTo(this.p_cR.getColorJSON())) {
      this.p_type = "dual";
      return;
    } else {
      this.p_type = "twin";
      return;
    }
  }

  getCL() {
    return this.p_cL;
  }

  getCR() {
    return this.p_cR;
  }

  getCL_JSON(_space) {
    return this.p_cL.getColorJSON(_space);
  }

  getCR_JSON(_space) {
    return this.p_cR.getColorJSON(_space);
  }

  setRef(_refPos) {
    if (isNumber(_refPos)) this.p_ref = _refPos;
    else throw new TypeError('Error (CMS Key) :: Function "Constructor" :: Incorrect Reference Value! Need to be a number;');
  }

  getRef() {
    return this.p_ref;
  }

  getType() {
    return this.p_type;
  }

  getMoT() {
    return this.p_mot;
  }

  setMoT(_mot) {
    if (typeof _mot === "boolean") this.p_mot = _mot;
    //else console.warn('Warning (CMS Key) :: Function "setMoT" :: Incorrect Parameter! Mot need to be a boolean;');
  }

  setOpacity(_val, _side) {
    switch (_side) {
      case "left":
        this.p_oL = _val;
        break;
      case "right":
        this.p_oR = _val;
        break;
      default:
    }
  }

  getOpacity(_side) {
    switch (_side) {
      case "left":
        return this.p_oL;
      case "right":
        return this.p_oR;
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
