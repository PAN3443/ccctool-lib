//////////////////////////////////////////////
//////////////      HEADER      //////////////
//////////////////////////////////////////////
// File :: Class cMS
// Author :: Pascal Nardini
// License :: MIT

//////////////////////////////////////////////
//////////////////////////////////////////////

const { isCMSJSON, isNumber, checkIndex, checkInterpolationType, checkColorSpaceNotation, isColorJSON, isCMSKey } = require("../helper/guardClauses.js");
const { getRatio } = require("../helper/math.js");
const { colorToVector, vectorToColor } = require("../color/colorHelper.js");
const { linearInterpolation, splineInterpolation } = require("../helper/interpolation.js");
const { equalColors } = require("../color/colorHelper.js");

const { KeyCMS } = require("./class_cmsKey.js");
const { Color } = require("../color/class_Color.js");

//////////////////////////////////////////////

class CMS {
  // use p_ as placeholder for # (# private variables are not supported by e.g. react)
  constructor() {
    this.p_name = "Customer Colormap";

    this.p_interpolationSpace = "lab";
    this.p_interpolationType = "linear"; // linear or spline or optimization
    this.p_colorRefIntPre = undefined; // for spline interpolation
    this.p_colorRefIntStart = undefined;
    this.p_colorRefIntEnd = undefined;
    this.p_colorRefIntNext = undefined; // for spline interpolation
    this.p_colorInterpolated = new Color("rgb", 0, 0, 0);

    this.p_colorNaN = new Color("rgb", 0, 0, 0);
    this.p_colorBelow = new Color("rgb", 0, 0, 0);
    this.p_colorAbove = new Color("rgb", 0, 0, 0);

    this.p_keys = [];
    this.p_deltaColors = []; // save onlye lab colorjson

    this.p_jnd = 1; // just noticeable difference
    /// Probes
    this.p_probeSetArray = [];
    /// work
    this.p_workOn = false;

    this.p_creationDate = new Date();
    this.p_lastUpdateDate = new Date();
  }

  clear() {
    this.p_keys = [];
    this.p_deltaColors = [];
    this.p_probeSetArray = [];
  }

  /**************************************************************************************************
   **************************************************************************************************
   ************************************ CMS Specific Methods ****************************************
   **************************************************************************************************
   *************************************************************************************************/

  /**************************************************************************************************
   **************************************************************************************************
   *  Function    : calculateColor
   *  Description : calc the color for the reference value _val of this CMS (with the colorspace _space)
   *  Ouput       : Color JSON
   **************************************************************************************************
   *************************************************************************************************/
  calculateColor(_val, _space) {
    let space = checkColorSpaceNotation(_space, false);
    if (!space[0]) throw new TypeError('Error (CMS) :: Function "calculateColor" :: Unknown Colorspace.');

    if (!isNumber(_val)) {
      return this.getNaNColor(space[1]);
    }

    if (_val < this.getKeyRef(0)) {
      return this.getBelowColor(space[1]);
    }

    if (_val > this.getKeyRef(this.getKeyLength() - 1)) {
      return this.getAboveColor(space[1]);
    }

    let index = this.p_keys.findIndex(function (key) {
      return key.getRef() >= _val; // find the first key with the reference value smaller than the searched value (or equal)
    });
    index = index <= 0 ? 0 : index - 1; //

    return this.calculateBandColor(index, _val, space[1]);
  }

  /**************************************************************************************************
   **************************************************************************************************
   *  Function    : calculateBandColor
   *  Description : calc the color for the reference value _val of the Band "bandID" of this CMS (with the colorspace _space)
   *  Ouput       : Color JSON
   **************************************************************************************************
   *************************************************************************************************/
  calculateBandColor(_bandID, _val, _space) {
    let space = checkColorSpaceNotation(_space, false);

    if (!space[0]) throw new TypeError('Error (CMS) :: Function "calculateBandColor" :: Unknown Colorspace.');

    if (!isNumber(_val)) {
      return this.getNaNColor(space[1]);
    }

    if (!checkIndex(_bandID, this.getKeyLength() - 1)) throw new TypeError('Error (CMS) :: Function "calculateBandColor" :: Incorrect bandID! The value ' + _bandID + " is not a valid index!");

    // Determine
    this._determineInterpolationColors(_bandID);
    switch (true) {
      case this.p_keys[_bandID].getRef() == _val:
        //////////////////////////////////////////
        /////////   Hit the First Key    /////////
        //////////////////////////////////////////
        return this._getBandKeyColor(_bandID, true, space[1]);
      case this.p_keys[_bandID + 1].getRef() == _val:
        //////////////////////////////////////////
        /////////   Hit the Second Key    /////////
        //////////////////////////////////////////
        // check middle of triple color
        return this._getBandKeyColor(_bandID, false, space[1]);
      default:
        // value is between _bandID and _bandID+1
        let ratio = getRatio(this.p_keys[_bandID].getRef(), this.p_keys[_bandID + 1].getRef(), _val);
        if (this.p_interpolationType == "linear" && (this.interpolationSpace == "de94-ds" || this.interpolationSpace == "de2000-ds") && this.p_deltaColors[_bandID].length > 0) {
          /////////////////////////////////////////
          ///// In this case we have delta colors (Interpolation ds-de94 or ds-de2000) (=> only linear interpolation type)
          /////////////////////////////////////////
          let index = this.p_deltaColors[_bandID].findIndex(function (deltaColor) {
            return deltaColor[1] >= _val; // find the first key with the reference value smaller than the searched value (or equal)
          });

          switch (index) {
            case 0:
              this.p_colorRefIntEnd = this.p_deltaColors[_bandID][index][0];
              ratio = getRatio(this.p_keys[_bandID].getRef(), this.p_deltaColors[_bandID][index][1], _val);
              break;
            case this.p_deltaColors[_bandID].length - 1:
              this.p_colorRefIntStart = this.p_deltaColors[_bandID][index][0];
              ratio = getRatio(this.p_deltaColors[_bandID][index][1], this.p_keys[_bandID + 1].getRef(), _val);
              break;
            default:
              this.p_colorRefIntStart = this.p_deltaColors[_bandID][index - 1][0];
              this.p_colorRefIntEnd = this.p_deltaColors[_bandID][index][0];
              ratio = getRatio(this.p_deltaColors[_bandID][index - 1][1], this.p_deltaColors[_bandID][index][1], _val);
              break;
          }
        }
        this.interpolate(ratio);
        return this.p_colorInterpolated.getColorJSON(space[1]);
    }
  }

  /**************************************************************************************************
   **************************************************************************************************
   *  Function    : _getBandKeyColor
   *  Description : if calculateColor or calculateBandColor want to get a color at a reference point of a key.
   *                this function determine which color need to be returned (Depends on MoT,Key Type).
   *                This function is "private" (=> "_functionname"), because only this class methods need access to this method.
   **************************************************************************************************
   *************************************************************************************************/
  _getBandKeyColor(_bandID, _isStartKey, _space) {
    // private method, only call able inside this class => proofed input
    let keyIndex = _isStartKey ? _bandID : _bandID + 1;
    switch (this.getKeyType(keyIndex)) {
      case "nil":
        return this.getKeyCL_JSON(keyIndex + 1, _space);
      case "left":
        // if not private, we would have to check if the
        return this.p_keys[keyIndex].getMoT() ? this.getKeyCL_JSON(keyIndex + 1, _space) : this.getKeyCL_JSON(keyIndex, _space);
      case "twin":
        return this.p_keys[keyIndex].getMoT() ? this.getKeyCR_JSON(keyIndex, _space) : this.getKeyCL_JSON(keyIndex, _space);
      //case "right":
      // if not private we should check if _isStartKey=true, because right keys are alway at the first key of a CMS
      // return this.getKeyCR_JSON(keyIndex,space);
      default:
        return this.getKeyCR_JSON(keyIndex, _space);
    }
  }

  /**************************************************************************************************
   **************************************************************************************************
   *  Function    : _determineInterpolationColors
   *  Description : determine the colors needed for the interpolation inside of a band (between a key pair)
   *  Ouput       : None
   **************************************************************************************************
   *************************************************************************************************/
  _determineInterpolationColors(_bandID) {
    this.p_colorRefIntPre = undefined;
    this.p_colorRefIntStart = undefined;
    this.p_colorRefIntEnd = undefined;
    this.p_colorRefIntNext = undefined;

    switch (this.getKeyType(_bandID)) {
      case "nil":
      case "left":
        this.p_colorRefIntStart = this.getKeyCL(_bandID + 1);
        this.p_colorRefIntEnd = this.getKeyCL(_bandID + 1);
        break;
      default:
        if (this.getKeyType(_bandID) !== "right" && this.getKeyType(_bandID) !== "twin") {
          this.p_colorRefIntPre = this.getKeyCR(_bandID - 1);
        }

        this.p_colorRefIntStart = this.getKeyCR(_bandID);
        this.p_colorRefIntEnd = this.getKeyCL(_bandID + 1);

        if (this.getKeyType(_bandID + 1) !== "left" && this.getKeyType(_bandID + 1) !== "twin" && _bandID + 1 !== this.getKeyLength() - 1) {
          // this.getKeyLength()-1 is alwas a left key. For the push creation this don't have to be.
          this.p_colorRefIntNext = this.getKeyCL(_bandID + 2);
        }
    }
  }

  /**************************************************************************************************
   **************************************************************************************************
   *  Function    : interpolate
   *  Description : if calculateColor or calculateBandColor want to get a color at a reference point of a key.
   *                this function determine which color need to be returned (Depends on MoT,Key Type).
   *                This function is "private" (=> "_functionname"), because only this class methods need access to this method.
   *  Ouput       : None
   **************************************************************************************************
   *************************************************************************************************/
  interpolate(_ratio) {
    if (this.p_colorRefIntStart.equalTo(this.p_colorRefIntEnd.getColorJSON())) {
      //////////////////////////////////////////
      /////////      Constant Band     /////////
      //////////////////////////////////////////
      this.p_colorInterpolated.setColorJSON(this.p_colorRefIntStart.getColorJSON());
    } else {
      //////////////////////////////////////////
      /////////       Scaled Band      /////////
      //////////////////////////////////////////
      let color_V0 = [0, 0, 0];
      let color_V1 = colorToVector(this.p_colorRefIntStart.getColorJSON(this.p_interpolationSpace));
      let color_V2 = colorToVector(this.p_colorRefIntEnd.getColorJSON(this.p_interpolationSpace));
      let color_V3 = [0, 0, 0];
      switch (this.p_interpolationType) {
        case "linear":
          /////////////////////////////////////////////////////////////////
          /////////       Scaled Band  :: Linear Interpolation    /////////
          /////////////////////////////////////////////////////////////////
          this.p_colorInterpolated.setColorJSON(vectorToColor(linearInterpolation(color_V1, color_V2, _ratio), this.p_interpolationSpace));
          break;
        case "spline":
          if (this.p_colorRefIntPre !== undefined) color_V0 = colorToVector(this.p_colorRefIntPre.getColorJSON(this.p_interpolationSpace));
          if (this.p_colorRefIntNext !== undefined) color_V3 = colorToVector(this.p_colorRefIntNext.getColorJSON(this.p_interpolationSpace));
          /////////////////////////////////////////////////////////////////
          /////////       Scaled Band  :: Spline Interpolation    /////////
          /////////////////////////////////////////////////////////////////
          this.p_colorInterpolated.setColorJSON(vectorToColor(splineInterpolation(color_V0, color_V1, color_V2, color_V3, _ratio, 1.0), this.p_interpolationSpace));
          break;
      }
    }
  }

  /**************************************************************************************************
   **************************************************************************************************
   *  Function    : searchForContinuousSections
   *  Description : This algorithm search key sequences that cause a continues part in the CMS
   *  Return      : This algorithm return an array. Each element include the start index and end
   *                index of a continouse part
   *  Ouput       : multi dim array (1d => number of continues section, 2d => start and end index of this continuous section)
   *  Unit Test   : check
   **************************************************************************************************
   *************************************************************************************************/
  searchForContinuousSections(_startKey, _endKey) {
    if (_startKey == undefined) _startKey = 0;
    if (_endKey == undefined) _endKey = this.getKeyLength() - 1;

    if (!checkIndex(_startKey, this.getKeyLength())) throw new TypeError('Error (CMS) :: Function "calculateBandColor" :: Incorrect _startKey! The value ' + _startKey + " is not a valid index!");
    if (!checkIndex(_endKey, this.getKeyLength())) throw new TypeError('Error (CMS) :: Function "calculateBandColor" :: Incorrect bandID! The value ' + _endKey + " is not a valid index!");

    let continuousSections = [];
    let beforeConstant = false;
    //let startKey = 0;
    if (this.getKeyType(_startKey) === "twin" || this.getKeyType(_startKey) === "left") beforeConstant = true;

    for (let i = _startKey; i <= _endKey; i++) {
      switch (this.getKeyType(i)) {
        case "nil":
          beforeConstant = true;
          break;
        case "left":
          if (!beforeConstant) {
            let tmpStart = _startKey;
            let tmpEnd = i;
            continuousSections.push([tmpStart, tmpEnd]);
          }
          _startKey = i;
          beforeConstant = true;
          break;
        case "twin":
          if (!beforeConstant) {
            let tmpStart = _startKey;
            let tmpEnd = i;
            continuousSections.push([tmpStart, tmpEnd]);
          }
          _startKey = i;
          beforeConstant = false;
          break;
        default:
          if (beforeConstant) {
            _startKey = i;
            beforeConstant = false;
          } else {
            if (i == _endKey) {
              let tmpStart = _startKey;
              let tmpEnd = i;
              continuousSections.push([tmpStart, tmpEnd]);
            }
          }
      }
    }

    return continuousSections;
  }

  /**************************************************************************************************
   **************************************************************************************************
   *  Function    : calcReverse
   *  Description : This algorithm relocade the Key Colors so this CMS will be a reverse version of its previouse state
   *  Ouput       : None
   *  Unit Test   : check
   **************************************************************************************************
   *************************************************************************************************/
  calcReverse() {
    if (this.getKeyLength() < 2) return;

    this.p_workOn = true;
    let tmpkeys = [];
    let startPos = this.getKeyRef(0);
    let endPos = this.getKeyRef(this.getKeyLength() - 1);

    for (let i = 0; i < this.getKeyLength(); i++) {
      if ((this.getKeyType(i) === "nil" || this.getKeyType(i) === "left") && i != this.getKeyLength() - 1) {
        this.setKeyCR(i, this.getKeyCL_JSON(i + 1, this.p_interpolationSpace));
        this.setKeyCL(i + 1, undefined);
      }
      let newPos = startPos + (endPos - this.getKeyRef(i));
      let tmpColor = this.getKeyCL_JSON(i, this.p_interpolationSpace);
      this.setKeyCL(i, this.getKeyCR_JSON(i, this.p_interpolationSpace));
      this.setKeyCR(i, tmpColor);
      tmpkeys.splice(0, 0, this.getKeyClone(i));
      this.setKeyRef(0, newPos);
    }

    this.p_keys = tmpkeys;
    this.p_workOn = false;
    this._calcDeltaColors();
  }

  /**************************************************************************************************
   **************************************************************************************************
   *  Function    : setAutoRange
   *  Description : This algorithm rescale the CMS to a range from _newStart to _newEnd
   *  Ouput       : None
   *  Unit Test   : check
   **************************************************************************************************
   *************************************************************************************************/
  setAutoRange(_newStart, _newEnd) {
    let currentStart = this.getKeyRef(0);
    let currentdistance = this.getKeyRef(this.getKeyLength() - 1) - currentStart;
    let newDistance = _newEnd - _newStart;

    for (let i = 0; i < this.getKeyLength(); i++) {
      let ratio = (this.getKeyRef(i) - currentStart) / currentdistance;
      let newPos = _newStart + ratio * newDistance;
      this.setKeyRef(i, newPos);
    }
    this._calcDeltaColors();
  }

  /**************************************************************************************************
   **************************************************************************************************
   *  Function    : equalKeyIntervals
   *  Description : This algorithm set equal distances between all keys
   *  Ouput       : None
   *  Unit Test   : check
   **************************************************************************************************
   *************************************************************************************************/
  equalKeyIntervals() {
    if (this.getKeyLength() > 2) {
      let equalDis = Math.abs(this.getKeyRef(this.getKeyLength() - 1) - this.getKeyRef(0)) / (this.getKeyLength() - 1);
      for (let i = 1; i < this.getKeyLength() - 1; i++) {
        this.setKeyRef(i, this.getKeyRef(0) + i * equalDis);
      }
    }
    this._calcDeltaColors();
  }

  /**************************************************************************************************
   **************************************************************************************************
   *  Function    : getCMSJSON
   *  Description : Create a JSON file with the all the informaiton of this CMS (Not the Paraview Colormap JSON format)
   *  Ouput       : CMS JSON
   *  Unit Test   : check
   **************************************************************************************************
   *************************************************************************************************/
  getCMSJSON() {
    let cmsJSON = {};
    cmsJSON.isCMS = true; // for import methods to check if the json has the CCC-Tool format
    cmsJSON.cmsType = "ccc"; // for import methods to check if the json has the CCC-Tool format
    cmsJSON.name = this.p_name;
    cmsJSON.interpolationSpace = this.p_interpolationSpace;
    cmsJSON.interpolationType = this.p_interpolationType; // linear or spline or optimization
    cmsJSON.colorNaN = this.getNaNColor(this.p_interpolationSpace);
    cmsJSON.colorBelow = this.getBelowColor(this.p_interpolationSpace);
    cmsJSON.colorAbove = this.getAboveColor(this.p_interpolationSpace);
    cmsJSON.keys = [];
    cmsJSON.jnd = this.p_jnd;

    cmsJSON.creationDate = this.p_creationDate.toString();
    cmsJSON.lastUpdateDate = this.p_lastUpdateDate.toString();

    for (let i = 0; i < this.getKeyLength(); i++) {
      cmsJSON.keys.push(this.p_keys[i].getKeyJSON());
    }

    // probes
    return cmsJSON;
  }

  /**************************************************************************************************
   **************************************************************************************************
   *  Function    : setByJSON
   *  Description : set all parameters of this CMS by a cmsJSON file.
   *  Ouput       : None
   *  Unit Test   : check
   **************************************************************************************************
   *************************************************************************************************/
  setByJSON(_cmsJSON) {
    if (!isCMSJSON(_cmsJSON)) throw new TypeError('Error (CMS) :: Function "setByJSON" :: Incorrect cmsJSON file!');

    this.clear();
    this.p_name = _cmsJSON.name;

    if (typeof _cmsJSON.interpolationType === "string") if (_cmsJSON.interpolationType === "linear" || _cmsJSON.interpolationType === "spline") this.p_interpolationType = _cmsJSON.interpolationType;

    let space = checkColorSpaceNotation(_cmsJSON.interpolationSpace);
    if (space[0]) this.p_interpolationSpace = space[1];

    if ("colorNaN" in _cmsJSON) this.setNaNColor(_cmsJSON.colorNaN);
    if ("colorBelow" in _cmsJSON) this.setBelowColor(_cmsJSON.colorBelow);
    if ("colorAbove" in _cmsJSON) this.setAboveColor(_cmsJSON.colorAbove);

    if ("creationDate" in _cmsJSON) this.p_creationDate = new Date(_cmsJSON.creationDate);
    if ("lastUpdateDate" in _cmsJSON) this.p_lastUpdateDate = new Date(_cmsJSON.lastUpdateDate);

    /// Keys ///
    for (let index = 0; index < _cmsJSON.keys.length; index++) {
      this._pushKey(_keyJsonToInstance(_cmsJSON.keys[index]));
    }

    if (isNumber(_cmsJSON.jnd)) this.p_jnd = _cmsJSON.jnd;
  }

  /**************************************************************************************************
   **************************************************************************************************
   *  Function    : insertCMS
   *  Description : insert the keys of an other CMS into this key array.
   *  Ouput       : None
   *  Unit Test   : check
   **************************************************************************************************
   *************************************************************************************************/
  insertCMS(_cmsJSON, _index) {
    if (!isCMSJSON(_cmsJSON)) throw new TypeError('Error (CMS) :: Function "insertCMS" :: Incorrect cmsJSON file!');

    /// if the current CMS is empty we add all the cmsJSON information to this
    if (this.getKeyLength() == 0) {
      for (let index = 0; index < _cmsJSON.keys.length; index++) {
        this._pushKey(_keyJsonToInstance(_cmsJSON.keys[index]));
      }
      return;
    }

    if (!checkIndex(_index, this.getKeyLength())) throw new TypeError('Error (CMS) :: Function "insertCMS" :: Incorrect index!');

    this.p_workOn = true;
    let cmsDis = _cmsJSON.keys[_cmsJSON.keys.length - 1].ref - _cmsJSON.keys[0].ref;
    let startPos = undefined;
    let dist = undefined;
    switch (_index) {
      case this.getKeyLength() - 1:
        // case scaled band
        let tmpVal = this.getKeyRef(_index);
        dist = Math.abs(tmpVal - this.getKeyRef(_index - 1)) * 0.5;
        startPos = tmpVal - dist;

        this.setKeyRef(_index, startPos);
        this.setKeyCR(_index, _cmsJSON.keys[0].cR); // right color of first key

        for (let i = 1; i < _cmsJSON.keys.length; i++) {
          let ratio = (_cmsJSON.keys[i].ref - _cmsJSON.keys[i - 1].ref) / cmsDis;
          startPos = startPos + dist * ratio;

          if (i == _cmsJSON.keys.length - 1) this._pushKey(new KeyCMS(_cmsJSON.keys[i].cL, _cmsJSON.keys[i].cR, tmpVal, _cmsJSON.keys[i].isBur, _cmsJSON.keys[i].mot));
          else this._pushKey(new KeyCMS(_cmsJSON.keys[i].cL, _cmsJSON.keys[i].cR, startPos, _cmsJSON.keys[i].isBur, _cmsJSON.keys[i].mot));
        }
        break;

      default:
        startPos = this.getKeyRef(_index);
        dist = Math.abs(this.getKeyRef(_index + 1) - startPos) * 0.5;
        let endPos = startPos + dist;

        this.setKeyRef(_index, endPos);
        let oldColor = this.getKeyCL_JSON(_index, "lab");

        this.setKeyCL(_index, _cmsJSON.keys[_cmsJSON.keys.length - 1].cL); // left key color of the last key of the package
        this.setBur(_index, true);

        for (let i = _cmsJSON.keys.length - 2; i >= 0; i--) {
          let ratio = (_cmsJSON.keys[i + 1].ref - _cmsJSON.keys[i].ref) / cmsDis;
          endPos = endPos - dist * ratio;
          this._insertKey(_index, new KeyCMS(_cmsJSON.keys[i].cL, _cmsJSON.keys[i].cR, endPos, _cmsJSON.keys[i].isBur, _cmsJSON.keys[i].mot));
        }

        this.setKeyCL(_index, oldColor);
        this.setBur(_index, true);
    }
    this.p_workOn = false;
  }

  /**************************************************************************************************
   **************************************************************************************************
   ************************************ CMS Specific Methods ****************************************
   **************************************************************************************************
   *************************************************************************************************/

  _updateSurroundingDeltaColors() {}

  _calcDeltaColors() {}

  _updateBandDeltaColors(_bandID) {}

  /**************************************************************************************************
   **************************************************************************************************
   *****************************************  Manage Keys  ******************************************
   **************************************************************************************************
   *************************************************************************************************/
  deleteKey(_index) {
    if (!checkIndex(_index, this.getKeyLength())) return;
    this.p_keys.splice(_index, 1);
    this.p_deltaColors.splice(_index, 1);
    if (_index != 0 && _index != this.getKeyLength() - 1) this._updateBandDeltaColors(_index - 1);
  }

  getKeyLength() {
    return this.p_keys.length;
  }

  // Unit Test : check
  getKey(_index) {
    if (!checkIndex(_index, this.getKeyLength())) throw new TypeError('Error (CMS) :: Function "getKey" :: Incorrect index!');
    return this.p_keys[_index];
  }

  // Unit Test : check
  getKeyClone(_index) {
    if (!checkIndex(_index, this.getKeyLength())) throw new TypeError('Error (CMS) :: Function "getKeyClone" :: Incorrect index!');
    return _keyJsonToInstance(this.p_keys[_index].getKeyJSON());
  }

  // Unit Test : check
  setKeyCL(_index, _cL) {
    if (!checkIndex(_index, this.getKeyLength())) throw new TypeError('Error (CMS) :: Function "setKeyCL" :: Incorrect index!');

    if (this.p_workOn) {
      this.p_keys[_index].setCL(_cL);
      return;
    }

    if (!checkIndex(_index, this.getKeyLength())) throw new TypeError('Error (CMS) :: Function "setKeyCL" :: Incorrect index!');
    switch (_index) {
      case 0:
        if (_cL !== undefined) throw new TypeError('Error (CMS) :: Function "setKeyCL" :: The left color of the first key need to be undefined!');
        this.p_keys[_index].setCL(_cL);
        break;
      default:
        if (_cL === undefined) throw new TypeError('Error (CMS) :: Function "setKeyCL" :: Only the left color of the first key is allowed to be undefined!');
        this.p_keys[_index].setCL(_cL);
        this._updateBandDeltaColors(_index - 1);
        /*if (this.interpolationType === "spline") {
          if (_index - 2 >= 0) {
            if (this.p_keys[_index - 1].getKeyType() === "dual") {
              this._updateBandDeltaColors(_index - 2);
              if (_index - 3 >= 0) {
                if (this.p_keys[_index - 2].getKeyType() === "dual") this._updateBandDeltaColors(index - 3);
              }
            }
          }
        }*/
        break;
    }
  }

  // Unit Test : check
  setKeyCR(_index, _cR) {
    if (!checkIndex(_index, this.getKeyLength())) throw new TypeError('Error (CMS) :: Function "setKeyCR" :: Incorrect index!');

    if (this.p_workOn) {
      this.p_keys[_index].setCR(_cR);
      return;
    }

    switch (_index) {
      case this.getKeyLength() - 1:
        if (_cR !== undefined) throw new TypeError('Error (CMS) :: Function "setKeyCR" :: The right color of the last key need to be undefined!');
        this.p_keys[_index].setCR(_cR);
        break;
      default:
        this.p_keys[_index].setCR(_cR);
        this._updateBandDeltaColors(_index);
        /*if (this.interpolationType === "spline") {
          if (index + 1 < this.getKeyLength()) {
            if (this.p_keys[index + 1].getKeyType() === "dual") {
              this._updateBandDeltaColors(index + 1);
              if (index + 2 < this.getKeyLength()) {
                if (this.p_keys[index + 2].getKeyType() === "dual") this._updateBandDeltaColors(index + 2);
              }
            }
          }
        }*/
        break;
    }
  }

  // Unit Test : check
  getKeyCL(_index) {
    if (!checkIndex(_index, this.getKeyLength())) throw new TypeError('Error (CMS) :: Function "getKeyCL" :: Incorrect _index! The value ' + _index + " is not a valid index!");
    return this.p_keys[_index].getCL();
  }

  // Unit Test : check
  getKeyCR(_index) {
    if (!checkIndex(_index, this.getKeyLength())) throw new TypeError('Error (CMS) :: Function "getKeyCR" :: Incorrect _index! The value ' + _index + " is not a valid index!");
    return this.p_keys[_index].getCR();
  }

  getKeyCL_JSON(_index, _space) {
    if (!checkIndex(_index, this.getKeyLength())) throw new TypeError('Error (CMS) :: Function "getKeyCL_JSON" :: Incorrect _index! The value ' + _index + " is not a valid index!");
    return this.p_keys[_index].getCL_JSON(_space);
  }

  getKeyCR_JSON(_index, _space) {
    if (!checkIndex(_index, this.getKeyLength())) throw new TypeError('Error (CMS) :: Function "getKeyCR_JSON" :: Incorrect _index! The value ' + _index + " is not a valid index!");
    return this.p_keys[_index].getCR_JSON(_space);
  }

  getKeyType(_index) {
    if (!checkIndex(_index, this.getKeyLength())) throw new TypeError('Error (CMS) :: Function "getKeyType" :: Incorrect _index! The value ' + _index + " is not a valid index!");
    return this.p_keys[_index].getType();
  }

  getMoT(_index) {
    if (!checkIndex(_index, this.getKeyLength())) throw new TypeError('Error (CMS) :: Function "getMoT" :: Incorrect _index! The value ' + _index + " is not a valid index!");
    return this.p_keys[_index].getMoT();
  }

  setMoT(_index, _mot) {
    if (!checkIndex(_index, this.getKeyLength())) throw new TypeError('Error (CMS) :: Function "setMoT" :: Incorrect _index! The value ' + _index + " is not a valid index!");
    this.p_keys[_index].setMoT(_mot);
  }

  // Unit Test : check
  addKey(_key) {
    if (isCMSKey(_key)) _key = _keyJsonToInstance(_key);
    if (!(_key instanceof KeyCMS)) throw new TypeError('Error (CMS) :: Function "addKey" :: Incorrect parameter! The key is not a instance of the class KeyCMS!');

    let index = undefined;

    switch (this.getKeyLength()) {
      case 0:
        index = 0;
        break;
      case 1:
        // star key is already set
        if (_key.ref <= this.p_keys[0].getRef()) throw new TypeError('Error (CMS) :: Function "addKey" :: The reference value of added key is equal to the reference value of an existing key!');
        index = 1;
        break;
      default:
        // find position
        let ref = _key.getRef();
        switch (true) {
          case ref < this.getKeyRef(0):
            index = 0;
            break;
          case ref > this.getKeyRef(this.getKeyLength() - 1):
            index = this.getKeyLength();
            break;
          default:
            for (let i = 1; i < this.getKeyLength(); i++) {
              if (ref == this.getKeyRef(i - 1) || ref == this.getKeyRef(i)) throw new TypeError('Error (CMS) :: Function "addKey" :: The reference value of added key is equal to the reference value of an existing key!');
              if (ref > this.getKeyRef(i - 1) && ref < this.getKeyRef(i)) {
                index = i;
                break;
              }
            }
            break;
        }
        break;
    }

    if (index == undefined) throw new TypeError('Error (CMS) :: Function "addKey" :: The function was not able to find a index for this key!');

    // We need to check if the key type is correct for the determined index
    switch (index) {
      case 0:
        if (_key.getType() !== "nil" && _key.getType() !== "right") throw new TypeError('Error (CMS) :: Function "addKey" :: Incompatible index and key type! For the determined index=0, a "nil" or "right" key type is necessary!');

        // We cannot allow a new start key if another already exist
        if (this.getKeyLength() != 0) throw new TypeError('Error (CMS) :: Function "addKey" ::  There is already a start key. Key types "nil" or "right" can not be added to the CMS.!');
        break;
      case this.getKeyLength():
        if (_key.getType() !== "left") throw new TypeError('Error (CMS) :: Function "addKey" :: Incompatible index and key type! For the determined last index (' + this.getKeyLength() + '), a "left" key type is necessary!');
        break;
      default:
        if (_key.getType() === "nil" && _key.getType() === "right") throw new TypeError('Error (CMS) :: Function "addKey" :: Incompatible index and key type! For the determined index, a "nil" or "right" key type is not allowed!');
    }
    this._insertKey(index, _key);
  }

  _insertKey(_index, _key) {
    //if (!checkIndex(_index, this.getKeyLength())) throw new TypeError('Error (CMS) :: Function "_insertKey" :: Incorrect _index! The value ' + _index + " is not a valid index!");
    //if (isCMSKey(_key)) _key = _keyJsonToInstance(_key);
    //if (!(_key instanceof KeyCMS)) throw new TypeError('Error (CMS) :: Function "_insertKey" :: Incorrect parameter! The key is not a instance of the class KeyCMS!');

    this.p_keys.splice(_index, 0, _key);
    if (this.getKeyLength() > 1) {
      this.p_deltaColors.splice(_index, 0, []);
      this._updateSurroundingDeltaColors(_index);
    }
  }

  _pushKey(_key) {
    //if (isCMSKey(_key)) _key = _keyJsonToInstance(_key);
    //if (!(_key instanceof KeyCMS)) throw new TypeError('Error (CMS) :: Function "_pushKey" :: Incorrect parameter! The key is not a instance of the class KeyCMS!');
    /*if (this.getKeyLength() != 0) {
      if (_key.getRef() <= this.getKeyRef(this.getKeyLength() - 1)) throw new TypeError('Error (CMS) :: Function "_pushKey" :: Incorrect parameter! The reference value of pushed key need to be larger than the reference value of the previouse key!');
    }*/
    this.p_keys.push(_key);
    if (this.getKeyLength() > 1) this.p_deltaColors.push([]);
  }

  getBur(_index) {
    if (!checkIndex(_index, this.getKeyLength())) throw new TypeError('Error (CMS) :: Function "getBur" :: Incorrect _index! The value ' + _index + " is not a valid index!");
    return this.p_keys[_index].getBur();
  }

  setBur(_index, _isBur) {
    if (!checkIndex(_index, this.getKeyLength())) throw new TypeError('Error (CMS) :: Function "setBur" :: Incorrect _index! The value ' + _index + " is not a valid index!");
    this.p_keys[_index].setBur(_isBur);
  }

  deleteBand(_index) {
    let tmpRightColor = this.getKeyCR_JSON(_index + 1, "lab");
    this.p_keys[_index].setKeyCR(tmpRightColor);
    this.deleteKey(_index + 1);
  }

  /**************************************************************************************************
   **************************************************************************************************
   ************************************ CMS Drawing Methods *****************************************
   **************************************************************************************************
   *************************************************************************************************/

  /**************************************************************************************************
   **************************************************************************************************
   *  Function    : drawHorizontal
   *  Description : draw this cms horizontal in an imgageData object.
   *  Ouput       : ImageData
   **************************************************************************************************
   *************************************************************************************************/
  drawCMS(_width, _height, _drawVertical, _colorBlind, _alpha) {
    if (!Number.isInteger(_width) || !Number.isInteger(_height)) return new ImageData(1, 1);
    if (_width < 2 || _height < 2) return new ImageData(1, 1);
    let cmsImg = new ImageData(_width, _height);
    let disRef = this.getRefRange();

    if (_drawVertical) {
      for (let i = 0; i < this.getKeyLength() - 1; i++) {
        let linearKey_yPos = Math.round(((this.getKeyRef(i) - this.getKeyRef(0)) / disRef) * _height);
        let elementheight = Math.round(((this.getKeyRef(i + 1) - this.getKeyRef(i)) / disRef) * _height) + 1;
        this.drawBand(cmsImg, true, 0, _height - linearKey_yPos, i, _width, elementheight, _colorBlind, _alpha);
      }
    } else {
      for (let i = 0; i < this.getKeyLength() - 1; i++) {
        let linearKey_xPos = Math.round(((this.getKeyRef(i) - this.getKeyRef(0)) / disRef) * _width);
        let elementwidth = Math.round(((this.getKeyRef(i + 1) - this.getKeyRef(i)) / disRef) * _width) + 1; // plus 1 because sometimes a pixel column is empty
        this.drawBand(cmsImg, false, linearKey_xPos, 0, i, elementwidth, _height, _colorBlind, _alpha);
      }
    }
    return cmsImg;
  }

  drawBand(_imgRef, _drawVertical, _xStart, _yStart, _bandID, _bandWidth, _bandHeight, _doColorBlind, _alpha) {
    _xStart = Math.round(_xStart);
    _yStart = Math.round(_yStart);
    _bandID = Math.round(_bandID);
    _bandWidth = Math.round(_bandWidth);
    _bandHeight = Math.round(_bandHeight);

    _alpha = isNumber(isNumber) ? _alpha : 1;
    _alpha = _alpha < 0 ? 0 : _alpha;
    _alpha = _alpha > 1 ? 1 : _alpha;
    _alpha *= 255;

    this._determineInterpolationColors(_bandID);
    //this.interpolate(ratio);
    //return this.p_colorInterpolated.getColorJSON(space[1]);
    let tmpColorJSON = undefined;
    let tmpSpace = _doColorBlind ? "rgb_cb" : "rgb";

    if (_drawVertical) {
      for (let y = _yStart; y >= _yStart - _bandHeight; y--) {
        if (_yStart - y < 0) break;

        let tmpRatio = (_yStart - y) / _bandHeight;
        this.interpolate(tmpRatio);
        tmpColorJSON = this.p_colorInterpolated.getColorJSON(tmpSpace);

        for (let x = _xStart; x < _xStart + _bandWidth; x++) {
          let index = (x + (_yStart - (_yStart - y)) * _imgRef.width) * 4;
          _imgRef.data[index + 0] = Math.round(tmpColorJSON.c1 * 255); // r
          _imgRef.data[index + 1] = Math.round(tmpColorJSON.c2 * 255); // g
          _imgRef.data[index + 2] = Math.round(tmpColorJSON.c3 * 255); // b
          _imgRef.data[index + 3] = _alpha; //a
        }
      }
    } else {
      for (let x = _xStart; x < _xStart + _bandWidth; x++) {
        if (x >= _imgRef.width) continue;
        let tmpRatio = (x - _xStart) / _bandWidth;
        this.interpolate(tmpRatio);
        tmpColorJSON = this.p_colorInterpolated.getColorJSON(tmpSpace);

        for (let y = _yStart; y < _yStart + _bandHeight; y++) {
          let index = (x + y * _imgRef.width) * 4;
          //let index = ((xStart+x) + y * _imgRef.width) * 4;
          _imgRef.data[index + 0] = Math.round(tmpColorJSON.c1 * 255); // r
          _imgRef.data[index + 1] = Math.round(tmpColorJSON.c2 * 255); // g
          _imgRef.data[index + 2] = Math.round(tmpColorJSON.c3 * 255); // b
          _imgRef.data[index + 3] = _alpha; //a
        }
      }
    }
  }

  /**************************************************************************************************
   **************************************************************************************************
   *****************************************   Parser   ******************************************
   **************************************************************************************************
   *************************************************************************************************/

  parser_JSON(jsonString) {
    let jsonObj = JSON.parse(jsonString);
    let name = "Loaded Colormap";
    this.clear();

    switch (true) {
      case "isCMS" in jsonObj:
        this.setByJSON(jsonObj);
      case "colormaps" in jsonObj:
        // Mabye JSON Colormoves Format
        break;
      default:
        if (!jsonObj.hasOwnProperty("Name")) name = jsonObj[0].Name;

        let cSpace = ""; //jsonObj[0].ColorSpace;
        let pointName = "";

        // In the early age of ccc-tool we also offered a json download with HSV Lab or DIN99 points. The original paraview json only has RGBPoints
        if (jsonObj[0].hasOwnProperty("RGBPoints")) {
          cSpace = "rgb";
          pointName = "RGBPoints";
        }
        if (jsonObj[0].hasOwnProperty("HSVPoints")) {
          cSpace = "hsv";
          pointName = "HSVPoints";
        }
        if (jsonObj[0].hasOwnProperty("LabPoints")) {
          cSpace = "lab";
          pointName = "LabPoints";
        }
        if (jsonObj[0].hasOwnProperty("DIN99Points")) {
          cSpace = "din99";
          pointName = "DIN99Points";
        }

        if (pointName === "") {
          console.error('Error (cmsParser) :: Function "cmsParser_JSON" :: Missing attribute "RGBPoints"!');
          break;
        }

        if (jsonObj[0][pointName].length == 0) return;

        let val1_RatioFactor = 1;
        let val2_RatioFactor = 1;
        let val3_RatioFactor = 1;
        let hasKeyInfo = false;
        let hasMoTInfo = false;

        if (jsonObj[0].hasOwnProperty("isCMS")) {
          hasKeyInfo = true;
        }

        if (jsonObj[0].hasOwnProperty("isMoT")) {
          hasMoTInfo = true;
        }

        let hasNaNColor = false;
        if (jsonObj[0].hasOwnProperty("NanColor")) {
          hasNaNColor = true;
        }

        let hasAboveColor = false;
        if (jsonObj[0].hasOwnProperty("AboveColor")) {
          hasAboveColor = true;
        }

        let hasBelowColor = false;
        if (jsonObj[0].hasOwnProperty("BelowColor")) {
          hasBelowColor = true;
        }

        if (jsonObj[0].hasOwnProperty("Name")) {
          this.setCMSName(jsonObj[0].Name);
        }

        if (cSpace == undefined) return;
        ////////////////////////////////////////////

        if (cSpace === "rgb" || cSpace === "RGB" || cSpace === "Rgb") {
          for (let i = 0; i < jsonObj[0][pointName].length / 4; i++) {
            let r = parseFloat(jsonObj[0][pointName][i * 4 + 1]);
            let g = parseFloat(jsonObj[0][pointName][i * 4 + 2]);
            let b = parseFloat(jsonObj[0][pointName][i * 4 + 3]);

            if (r > 1.0 || g > 1.0 || b > 1.0) {
              val1_RatioFactor = 255;
              val2_RatioFactor = 255;
              val3_RatioFactor = 255;
              break;
            }
          }
        } else {
          break;
        }

        let keys = [];
        let lastIndex = jsonObj[0][pointName].length / 4 - 1;
        for (let i = 0; i < jsonObj[0][pointName].length / 4; i++) {
          let x = parseFloat(jsonObj[0].RGBPoints[i * 4]);
          let val1 = parseFloat(jsonObj[0].RGBPoints[i * 4 + 1]) / val1_RatioFactor;
          let val2 = parseFloat(jsonObj[0].RGBPoints[i * 4 + 2]) / val2_RatioFactor;
          let val3 = parseFloat(jsonObj[0].RGBPoints[i * 4 + 3]) / val3_RatioFactor;

          let tmpColor = { space: cSpace, c1: val1, c2: val2, c3: val3 };
          let tmpColor2 = undefined;
          switch (i) {
            case 0:
              let val1_Next = parseFloat(jsonObj[0].RGBPoints[(i + 1) * 4 + 1]) / val1_RatioFactor;
              let val2_Next = parseFloat(jsonObj[0].RGBPoints[(i + 1) * 4 + 2]) / val2_RatioFactor;
              let val3_Next = parseFloat(jsonObj[0].RGBPoints[(i + 1) * 4 + 3]) / val3_RatioFactor;

              tmpColor2 = { space: cSpace, c1: val1_Next, c2: val2_Next, c3: val3_Next };

              if (equalColors(tmpColor, tmpColor2)) {
                // nil key
                keys.push(new KeyCMS(undefined, undefined, x, true, false));
              } else {
                // right key
                keys.push(new KeyCMS(undefined, tmpColor, x, true, false));
              }
              break;
            case lastIndex:
              // right key
              keys.push(new KeyCMS(tmpColor, undefined, x, true, false));
              break;
            default:
              if (hasKeyInfo) {
                if (jsonObj[0].isCMS[i] == false) {
                  continue; // continue if cms attribute exist and if it is false
                }
              }

              let x_Previous = parseFloat(jsonObj[0].RGBPoints[(i - 1) * 4]);
              let x_Next = parseFloat(jsonObj[0].RGBPoints[(i + 1) * 4]);
              let val1_N = parseFloat(jsonObj[0].RGBPoints[(i + 1) * 4 + 1]) / val1_RatioFactor;
              let val2_N = parseFloat(jsonObj[0].RGBPoints[(i + 1) * 4 + 2]) / val2_RatioFactor;
              let val3_N = parseFloat(jsonObj[0].RGBPoints[(i + 1) * 4 + 3]) / val3_RatioFactor;

              tmpColor2 = { space: cSpace, c1: val1_N, c2: val2_N, c3: val3_N };

              if (x_Previous == x) {
                let val1_Prev = parseFloat(jsonObj[0].RGBPoints[(i - 1) * 4 + 1]) / val1_RatioFactor;
                let val2_Prev = parseFloat(jsonObj[0].RGBPoints[(i - 1) * 4 + 2]) / val2_RatioFactor;
                let val3_Prev = parseFloat(jsonObj[0].RGBPoints[(i - 1) * 4 + 3]) / val3_RatioFactor;

                let tmpColor_Prev = { space: cSpace, c1: val1_Prev, c2: val2_Prev, c3: val3_Prev };

                if (equalColors(tmpColor, tmpColor2)) {
                  // left key
                  let newKey = new KeyCMS(tmpColor_Prev, undefined, x, true, false);
                  if (hasMoTInfo) {
                    if (jsonObj[0].isMoT[i] == true) newKey.setMoT(true); // if right key color isMoT (left is default)
                  }
                  keys.push(newKey);
                } else {
                  // twin key
                  let newKey = new KeyCMS(tmpColor_Prev, tmpColor, x, true, false);
                  if (hasMoTInfo) {
                    if (jsonObj[0].isMoT[i] == true) newKey.setMoT(true); // if right key color isMoT (left is default)
                  }
                  keys.push(newKey);
                }
              } else {
                if (x != x_Next) {
                  // dual key
                  keys.push(new KeyCMS(tmpColor, tmpColor, x, false, false));
                }
              }
          } //switch
        }
        if (keys.length >= 2) {
          this.addKey(keys[0]);
          this.addKey(keys[keys.length - 1]);
          for (let i = 1; i < keys.length - 1; i++) this.addKey(keys[i]);
        }

        if (hasNaNColor) {
          let val1 = parseFloat(jsonObj[0].NanColor[0]) / val1_RatioFactor;
          let val2 = parseFloat(jsonObj[0].NanColor[1]) / val2_RatioFactor;
          let val3 = parseFloat(jsonObj[0].NanColor[2]) / val3_RatioFactor;
          this.setNaNColor({ space: cSpace, c1: val1, c2: val2, c3: val3 });
        }

        if (hasAboveColor) {
          let val1 = parseFloat(jsonObj[0].AboveColor[0]) / val1_RatioFactor;
          let val2 = parseFloat(jsonObj[0].AboveColor[1]) / val2_RatioFactor;
          let val3 = parseFloat(jsonObj[0].AboveColor[2]) / val3_RatioFactor;
          this.setAboveColor({ space: cSpace, c1: val1, c2: val2, c3: val3 });
        }

        if (hasBelowColor) {
          let val1 = parseFloat(jsonObj[0].BelowColor[0]) / val1_RatioFactor;
          let val2 = parseFloat(jsonObj[0].BelowColor[1]) / val2_RatioFactor;
          let val3 = parseFloat(jsonObj[0].BelowColor[2]) / val3_RatioFactor;
          this.setBelowColor({ space: cSpace, c1: val1, c2: val2, c3: val3 });
        }
    }
  }

  parser_XML(xmlString) {
    this.clear();
    let dp = new DOMParser();
    let xmlObject = dp.parseFromString(xmlString, "text/xml");

    let colormapObject = xmlObject.getElementsByTagName("ColorMap");

    if (colormapObject.length > 0) {
      let pointObject = colormapObject[0].getElementsByTagName("Point");
      let cSpace = checkXMLColorspace(pointObject);

      let isrgb255 = false;
      let val1Name, val2Name, val3Name;
      switch (cSpace) {
        case "RGB":
        case "rgb":
        case "Rgb":
          for (let i = 0; i < pointObject.length; i++) {
            let r = parseFloat(pointObject[i].getAttribute("r"));
            let g = parseFloat(pointObject[i].getAttribute("g"));
            let b = parseFloat(pointObject[i].getAttribute("b"));

            if (r > 1.0 || g > 1.0 || b > 1.0) {
              isrgb255 = true;
              break;
            }
          }

          val1Name = "r";
          val2Name = "g";
          val3Name = "b";

          break;
        case "HSV":
        case "hsv":
        case "Hsv":
          val1Name = "h";
          val2Name = "s";
          val3Name = "v";
          break;
        case "LAB":
        case "lab":
        case "Lab":
          val1Name = "l";
          val2Name = "a";
          val3Name = "b";
          break;
        case "DIN99":
        case "din99":
        case "Din99":
          val1Name = "l99";
          val2Name = "a99";
          val3Name = "b99";
          break;
        default:
          console.error('Error (CMS Class) :: Function "cmsParser_XML" :: Incorrect colorspace!');
          return;
      }

      let keys = [];
      for (let i = 0; i < pointObject.length; i++) {
        let x = parseFloat(pointObject[i].getAttribute("x"));
        let val1 = parseFloat(pointObject[i].getAttribute(val1Name));
        let val2 = parseFloat(pointObject[i].getAttribute(val2Name));
        let val3 = parseFloat(pointObject[i].getAttribute(val3Name));

        //console.log("x="+x+",r="+x+",g="+g+",b="+b);

        if (isrgb255) {
          val1 = val1 / 255.0;
          val2 = val2 / 255.0;
          val3 = val2 / 255.0;
        }

        let tmpColor = { space: cSpace, c1: val1, c2: val2, c3: val3 };
        let tmpColor2 = undefined;

        switch (i) {
          case 0:
            let val1_Next = parseFloat(pointObject[i + 1].getAttribute(val1Name));
            let val2_Next = parseFloat(pointObject[i + 1].getAttribute(val2Name));
            let val3_Next = parseFloat(pointObject[i + 1].getAttribute(val3Name));

            if (isrgb255) {
              val1_Next = val1_Next / 255.0;
              val2_Next = val2_Next / 255.0;
              val3_Next = val2_Next / 255.0;
            }

            tmpColor2 = { space: cSpace, c1: val1_Next, c2: val2_Next, c3: val3_Next };

            if (equalColors(tmpColor2, tmpColor)) {
              // nil key
              keys.push(new KeyCMS(undefined, undefined, x, true, false));
            } else {
              // right key
              keys.push(new KeyCMS(undefined, tmpColor, x, true, false));
            }
            break;
          case pointObject.length - 1:
            // left key
            keys.push(new KeyCMS(tmpColor, undefined, x, true, false));
            break;
          default:
            if (pointObject[i].hasAttribute("cms")) {
              if (pointObject[i].getAttribute("cms") == "false") {
                continue; // continue if cms attribute exist and if it is false
              }
            }

            let x_Previous = parseFloat(pointObject[i - 1].getAttribute("x"));

            let x_Next = parseFloat(pointObject[i + 1].getAttribute("x"));
            let val1_N = parseFloat(pointObject[i + 1].getAttribute(val1Name));
            let val2_N = parseFloat(pointObject[i + 1].getAttribute(val2Name));
            let val3_N = parseFloat(pointObject[i + 1].getAttribute(val3Name));

            if (isrgb255) {
              val1_N = val1_N / 255.0;
              val2_N = val2_N / 255.0;
              val3_N = val2_N / 255.0;
            }

            tmpColor2 = { space: cSpace, c1: val1_N, c2: val2_N, c3: val3_N };

            if (x_Previous == x) {
              let val1_Prev = parseFloat(pointObject[i - 1].getAttribute(val1Name));
              let val2_Prev = parseFloat(pointObject[i - 1].getAttribute(val2Name));
              let val3_Prev = parseFloat(pointObject[i - 1].getAttribute(val3Name));

              if (isrgb255) {
                val1_Prev = val1_Prev / 255.0;
                val2_Prev = val2_Prev / 255.0;
                val3_Prev = val3_Prev / 255.0;
              }

              let tmpColor_Prev = { space: cSpace, c1: val1_Prev, c2: val2_Prev, c3: val3_Prev };

              if (equalColors(tmpColor, tmpColor2)) {
                // left key
                let newKey = new KeyCMS(tmpColor_Prev, undefined, x, true, false);

                if (pointObject[i].hasAttribute("isMoT")) {
                  if (pointObject[i].getAttribute("isMoT") == "true") newKey.setMoT(true); // if right key color isMoT (left is default)
                }
                keys.push(newKey);
              } else {
                // twin key
                let newKey = new KeyCMS(tmpColor_Prev, tmpColor, x, true, false);
                if (pointObject[i].hasAttribute("isMoT")) {
                  if (pointObject[i].getAttribute("isMoT") == "true") newKey.setMoT(true); // if right key color isMoT (left is default)
                }
                keys.push(newKey);
              }
            } else {
              if (x != x_Next) {
                // dual key
                keys.push(new KeyCMS(tmpColor, tmpColor, x, false, false));
              }
            }
        } //switch
      } // for

      if (keys.length >= 2) {
        this.addKey(keys[0]);
        this.addKey(keys[keys.length - 1]);
        for (let i = 1; i < keys.length - 1; i++) {
          this.addKey(keys[i]);
        }
      }

      /////////////////// from here start loading the new probe set information
      // this is from an old version. The Probe function is part of future implementation.
      /*let probesetObjects = colormapObject[0].getElementsByTagName("ProbeSet");
  
      for (let i = 0; i < probesetObjects.length; i++) {
        let tmpProbeSet = new class_ProbeSet("New ProbeSet");
  
        if (probesetObjects[i].hasAttribute("name")) {
          let name = probesetObjects[i].getAttribute("name");
          tmpProbeSet.setProbeSetName(name);
        }
  
        let probeObjects = probesetObjects[i].getElementsByTagName("Probe");
  
        for (let k = 0; k < probeObjects.length; k++) {
          let type = parseInt(probeObjects[k].getAttribute("type"));
          let start = parseFloat(probeObjects[k].getAttribute("start"));
          let end = parseFloat(probeObjects[k].getAttribute("end"));
  
          if (type == undefined || start == undefined || end == undefined) continue;
  
          let tmpProbe = new class_Probe(type, start, end, "hsv"); //(type, start, end , space)
  
          if (probeObjects[k].getElementsByTagName("ProbeColor").length != 0) {
            let probeColorObj = probeObjects[k].getElementsByTagName("ProbeColor");
  
            let val1 = parseFloat(probeColorObj[0].getAttribute("h"));
            let val2 = parseFloat(probeColorObj[0].getAttribute("s"));
            let val3 = parseFloat(probeColorObj[0].getAttribute("v"));
  
            tmpProbe.setProbeColor(new class_Color_HSV(val1, val2, val3));
          }
  
          if (type == 0) {
            // const _> no functions
            tmpProbeSet.addProbe(tmpProbe);
            continue;
          }
  
          //// Determine Function
          let valueFunctionObj = probeObjects[k].getElementsByTagName("ValueFunction");
          let saturationFunctionObj = probeObjects[k].getElementsByTagName("SaturationFunction");
  
          /// One Sided
          if (valueFunctionObj.length == 0) {
            if (saturationFunctionObj.length == 2) {
              let sat1 = parseFloat(saturationFunctionObj[0].getAttribute("s"));
              let sat2 = parseFloat(saturationFunctionObj[1].getAttribute("s"));
  
              if (sat1 == 100 && sat2 == 0) {
                tmpProbe.setFunctionType(2);
              } else {
                tmpProbe.setFunctionType(3);
              }
  
              tmpProbeSet.addProbe(tmpProbe);
            }
            continue;
          }
  
          if (saturationFunctionObj.length == 0) {
            if (valueFunctionObj.length == 2) {
              let val1 = parseFloat(valueFunctionObj[0].getAttribute("v"));
              let val2 = parseFloat(valueFunctionObj[1].getAttribute("v"));
  
              if (val1 == 100 && val2 == 0) {
                tmpProbe.setFunctionType(0);
              } else {
                tmpProbe.setFunctionType(1);
              }
  
              tmpProbeSet.addProbe(tmpProbe);
            }
            continue;
          }
  
          /// Two Sided
          if (valueFunctionObj.length == 2) {
            if (saturationFunctionObj.length == 3) {
              let val1 = parseFloat(valueFunctionObj[0].getAttribute("v"));
              let val2 = parseFloat(valueFunctionObj[1].getAttribute("v"));
  
              if (val1 == 0 && val2 == 100) {
                tmpProbe.setFunctionType(0);
              } else {
                tmpProbe.setFunctionType(1);
              }
  
              tmpProbeSet.addProbe(tmpProbe);
            }
            continue;
          }
  
          if (saturationFunctionObj.length == 2 && valueFunctionObj.length == 3) {
            let valMiddle = parseFloat(valueFunctionObj[1].getAttribute("v"));
            let sat1 = parseFloat(saturationFunctionObj[0].getAttribute("s"));
            let sat2 = parseFloat(saturationFunctionObj[1].getAttribute("s"));
  
            if (valMiddle == 0) {
              if (sat1 == 0 && sat2 == 100) {
                tmpProbe.setFunctionType(2);
              } else {
                tmpProbe.setFunctionType(3);
              }
              tmpProbeSet.addProbe(tmpProbe);
              continue;
            }
  
            if (valMiddle == 100) {
              if (sat1 == 0 && sat2 == 100) {
                tmpProbe.setFunctionType(4);
              } else {
                tmpProbe.setFunctionType(5);
              }
            }
            tmpProbeSet.addProbe(tmpProbe);
          }
        }
  
        if (tmpProbeSet.getProbeLength() != 0) this.addProbeSet(tmpProbeSet);
      }
  
      //console.log(this.getProbeLength());*/

      /////////////////// till here new probe set information

      if (colormapObject[0].hasAttribute("name")) this.setCMSName(colormapObject[0].getAttribute("name"));

      if (colormapObject[0].hasAttribute("interpolationspace")) this.setInterpolationSpace(colormapObject[0].getAttribute("interpolationspace"));

      if (colormapObject[0].getElementsByTagName("NaN").length != 0) {
        let nanObj = colormapObject[0].getElementsByTagName("NaN");

        let val1 = parseFloat(nanObj[0].getAttribute(val1Name));
        let val2 = parseFloat(nanObj[0].getAttribute(val2Name));
        let val3 = parseFloat(nanObj[0].getAttribute(val3Name));

        if (isrgb255) {
          val1 = val1 / 255.0;
          val2 = val2 / 255.0;
          val3 = val2 / 255.0;
        }

        this.setNaNColor({ space: cSpace, c1: val1, c2: val2, c3: val3 });
      }

      if (colormapObject[0].getElementsByTagName("Above").length != 0) {
        let aboveObj = colormapObject[0].getElementsByTagName("Above");

        let val1 = parseFloat(aboveObj[0].getAttribute(val1Name));
        let val2 = parseFloat(aboveObj[0].getAttribute(val2Name));
        let val3 = parseFloat(aboveObj[0].getAttribute(val3Name));

        if (isrgb255) {
          val1 = val1 / 255.0;
          val2 = val2 / 255.0;
          val3 = val2 / 255.0;
        }

        this.setAboveColor({ space: cSpace, c1: val1, c2: val2, c3: val3 });
      }

      if (colormapObject[0].getElementsByTagName("Below").length != 0) {
        let belowObj = colormapObject[0].getElementsByTagName("Below");

        let val1 = parseFloat(belowObj[0].getAttribute(val1Name));
        let val2 = parseFloat(belowObj[0].getAttribute(val2Name));
        let val3 = parseFloat(belowObj[0].getAttribute(val3Name));

        if (isrgb255) {
          val1 = val1 / 255.0;
          val2 = val2 / 255.0;
          val3 = val2 / 255.0;
        }

        this.setBelowColor({ space: cSpace, c1: val1, c2: val2, c3: val3 });
      }
    }
  }

  parser_CSV(_csvString) {
    let csvlines = _csvString.split("\n");
    this.clear();

    if (csvlines.length == 0) return;

    let cSpace = checkCSVColorspace(csvlines[0]);
    let val1_RatioFactor = 1;
    let val2_RatioFactor = 1;
    let val3_RatioFactor = 1;

    for (let i = 1; i < csvlines.length; i++) {
      let keyData = csvlines[i].split(/[;,]+/);

      if (cSpace != "LAB" && cSpace != "DIN99") {
        if (keyData.length > 3) {
          let v1 = parseFloat(keyData[1]);
          let v2 = parseFloat(keyData[2]);
          let v3 = parseFloat(keyData[3]);
          if (v1 > 1.0 || v2 > 1.0 || v3 > 1.0) {
            switch (cSpace) {
              case "RGB":
                val1_RatioFactor = 255;
                val2_RatioFactor = 255;
                val3_RatioFactor = 255;
                break;
              case "HSV":
                val1_RatioFactor = 360;
                val2_RatioFactor = 100;
                val3_RatioFactor = 100;
                break;
              case "LCH":
                val1_RatioFactor = 100;
                val2_RatioFactor = 100;
                val3_RatioFactor = 360;
                break;
            }
            break;
          }
        }
      }
    }

    let checkData = csvlines[1].split(/[;,]+/);
    let hasCMS = false;
    let hasMoT = false;

    switch (checkData.length) {
      case 5:
        // do nothing
        break;
      case 6:
        hasCMS = true;
        break;
      case 7:
        hasCMS = true;
        hasMoT = true;
        break;
      default:
        return;
    }

    let keys = [];
    for (let i = 1; i < csvlines.length; i++) {
      let keyData = csvlines[i].split(/[;,]+/);

      let x = parseFloat(keyData[0]);
      let val1 = parseFloat(keyData[1]) / val1_RatioFactor;
      let val2 = parseFloat(keyData[2]) / val2_RatioFactor;
      let val3 = parseFloat(keyData[3]) / val3_RatioFactor;
      let opa = parseFloat(keyData[4]);

      let tmpColor = { space: cSpace, c1: val1, c2: val2, c3: val3 };
      let tmpColor2 = undefined;
      let keyData_Next = undefined;

      switch (i) {
        case 1:
          keyData_Next = csvlines[i + 1].split(/[;,]+/);
          let val1_Next = parseFloat(keyData_Next[1]) / val1_RatioFactor;
          let val2_Next = parseFloat(keyData_Next[2]) / val2_RatioFactor;
          let val3_Next = parseFloat(keyData_Next[3]) / val3_RatioFactor;

          tmpColor2 = { space: cSpace, c1: val1_Next, c2: val2_Next, c3: val3_Next };

          if (equalColors(tmpColor, tmpColor2)) {
            // nil key
            let newKey = new KeyCMS(undefined, undefined, x, true, false);
            newKey.setOpacity(opa, "left");
            newKey.setOpacity(opa, "right");
            keys.push(newKey);
          } else {
            // right key
            let newKey = new KeyCMS(undefined, tmpColor, x, true, false);
            newKey.setOpacity(opa, "left");
            newKey.setOpacity(opa, "right");
            keys.push(newKey);
          }
          break;
        case csvlines.length - 1:
          // right key
          let newKey = new KeyCMS(tmpColor, undefined, x, true, false);
          newKey.setOpacity(opa, "left");
          newKey.setOpacity(opa, "right");
          keys.push(newKey);
          break;
        default:
          if (hasCMS) {
            if (keyData[5] == "false") {
              continue; // continue if cms attribute exist and if it is false
            }
          }

          keyData_Next = csvlines[i + 1].split(/[;,]+/);
          let keyData_Previous = csvlines[i - 1].split(/[;,]+/);

          let x_Previous = parseFloat(keyData_Previous[0]);

          let x_Next = parseFloat(keyData_Next[0]);
          let val1_N = parseFloat(keyData_Next[1]) / val1_RatioFactor;
          let val2_N = parseFloat(keyData_Next[2]) / val2_RatioFactor;
          let val3_N = parseFloat(keyData_Next[3]) / val3_RatioFactor;

          tmpColor2 = { space: cSpace, c1: val1_N, c2: val2_N, c3: val3_N };

          if (x_Previous == x) {
            let val1_Prev = parseFloat(keyData_Previous[1]) / val1_RatioFactor;
            let val2_Prev = parseFloat(keyData_Previous[2]) / val2_RatioFactor;
            let val3_Prev = parseFloat(keyData_Previous[3]) / val3_RatioFactor;

            let tmpColor_Prev = { space: cSpace, c1: val1_Prev, c2: val2_Prev, c3: val3_Prev };

            if (equalColors(tmpColor, tmpColor2)) {
              // left key
              let o_Prev = parseFloat(keyData_Previous[4]);
              let newKey = new KeyCMS(tmpColor_Prev, undefined, x, true, false);

              newKey.setOpacity(o_Prev, "left");
              newKey.setOpacity(opa, "right");

              if (hasMoT) {
                if (keyData[6] == "true") newKey.setMoT(true); // if right key color isMoT (left is default)
              }
              keys.push(newKey);
            } else {
              // twin key
              let o_Prev = parseFloat(keyData_Previous[4]);
              let newKey = new KeyCMS(tmpColor_Prev, tmpColor, x, true, false);

              newKey.setOpacity(o_Prev, "left");
              newKey.setOpacity(opa, "right");

              if (hasMoT) {
                if (keyData[6] == "true") newKey.setMoT(true); // if right key color isMoT (left is default)
              }
              keys.push(newKey);
            }
          } else {
            if (x != x_Next) {
              // dual key
              let newKey = new KeyCMS(tmpColor, tmpColor, x, false, false);
              newKey.setOpacity(opa, "left");
              newKey.setOpacity(opa, "right");

              keys.push(newKey);
            }
          }
      } //switch
    }

    if (keys.length >= 2) {
      this.addKey(keys[0]);
      this.addKey(keys[keys.length - 1]);
      for (let i = 1; i < keys.length - 1; i++) this.addKey(keys[i]);
    }

    let firstLineElements = csvlines[0].split(/[;,]+/);
    // NAN
    if (firstLineElements.length > 13) {
      let val1 = parseFloat(firstLineElements[9]) / val1_RatioFactor;
      let val2 = parseFloat(firstLineElements[11]) / val2_RatioFactor;
      let val3 = parseFloat(firstLineElements[13]) / val3_RatioFactor;
      this.setNaNColor({ space: cSpace, c1: val1, c2: val2, c3: val3 });
    }
    // Above
    if (firstLineElements.length > 20) {
      let val1 = parseFloat(firstLineElements[16]) / val1_RatioFactor;
      let val2 = parseFloat(firstLineElements[18]) / val2_RatioFactor;
      let val3 = parseFloat(firstLineElements[20]) / val3_RatioFactor;
      this.setAboveColor({ space: cSpace, c1: val1, c2: val2, c3: val3 });
    }
    // Below
    if (firstLineElements.length > 27) {
      let val1 = parseFloat(firstLineElements[23]) / val1_RatioFactor;
      let val2 = parseFloat(firstLineElements[25]) / val2_RatioFactor;
      let val3 = parseFloat(firstLineElements[27]) / val3_RatioFactor;
      this.setBelowColor({ space: cSpace, c1: val1, c2: val2, c3: val3 });
    }
  }

  /**************************************************************************************************
   **************************************************************************************************
   *****************************************   Set & Get   ******************************************
   **************************************************************************************************
   *************************************************************************************************/

  getCreationDate() {
    return this.p_creationDate;
  }

  getLastUpdateDate() {
    return this.p_lastUpdateDate;
  }

  setLastUpdateDate() {
    this.p_lastUpdateDate = new Date();
  }

  getInterpolationType() {
    return this.p_interpolationType;
  }

  getInterpolationSpace() {
    return this.p_interpolationSpace;
  }

  getRefRange() {
    if (this.getKeyLength() > 1) {
      return this.p_keys[this.getKeyLength() - 1].getRef() - this.p_keys[0].getRef();
    } else {
      return 0;
    }
  }

  getKeyRef(_index) {
    if (!checkIndex(_index, this.getKeyLength())) throw new TypeError('Error (CMS) :: Function "getKeyRef" :: Incorrect _index! The value ' + _index + " is not a valid index!");
    if (_index < 0 || _index >= this.getKeyLength()) return undefined;

    return this.p_keys[_index].getRef();
  }

  getCMSName() {
    return this.p_name;
  }

  getNaNColor(_space) {
    let space = checkColorSpaceNotation(_space, false);
    if (!space[0]) throw new TypeError('Error (CMS) :: Function "getNaNColor" :: Unknown Colorspace.');
    return this.p_colorNaN.getColorJSON(space[1]);
  }

  getBelowColor(_space) {
    let space = checkColorSpaceNotation(_space, false);
    if (!space[0]) throw new TypeError('Error (CMS) :: Function "getBelowColor" :: Unknown Colorspace.');
    return this.p_colorBelow.getColorJSON(space[1]);
  }

  getAboveColor(_space) {
    let space = checkColorSpaceNotation(_space, false);
    if (!space[0]) throw new TypeError('Error (CMS) :: Function "getAboveColor" :: Unknown Colorspace.');
    return this.p_colorAbove.getColorJSON(space[1]);
  }

  setInterpolationType(_type) {
    if (!checkInterpolationType(_type)) throw new TypeError('Error (CMS) :: Function "setInterpolationType" :: Unknown Interpolation Type.');

    this.p_interpolationType = _type;

    if (this.p_interpolationType === "spline") {
      if (this.p_interpolationSpace === "de94-ds") {
        this.p_interpolationSpace = "lab";
        console.warn('Warning (CMS) :: Function "setInterpolationType" :: Interpolation Type "Spline" is not compatible with the "de94-ds" interpolation! Interpolation space reset to "lab".');
      }
      if (this.p_interpolationSpace === "de2000-ds") {
        this.p_interpolationSpace = "lab";
        console.warn('Warning (CMS) :: Function "setInterpolationType" :: Interpolation Type "Spline" is not compatible with the "de2000-ds" interpolation! Interpolation space reset to "lab".');
      }
    }

    this._calcDeltaColors(); // new interpolationType => supportColors need to be updated
  }

  setKeyRef(_index, _ref) {
    if (!checkIndex(_index, this.getKeyLength())) throw new TypeError('Error (CMS) :: Function "setKeyRef" :: Incorrect _index! The value ' + _index + " is not a valid index!");
    this.p_keys[_index].setRef(_ref);
    this._updateSurroundingDeltaColors(_index);
    if (_index != 0) this._updateSurroundingDeltaColors(_index - 1);
  }

  setInterpolationSpace(_space) {
    let space = checkColorSpaceNotation(_space, false);
    if (!space[0]) throw new TypeError('Error (CMS) :: Function "getAboveColor" :: Unknown Colorspace.');
    // special strings allowed for metric interpolation in LAB
    if (_space === "de94-ds") space[1] = _space;
    if (_space === "de2000-ds") space[1] = _space;

    this.p_interpolationSpace = space[1];
    this._calcDeltaColors(); // new interpolationSpace => supportColors need to be _updateSurroundingDeltaColors
  }

  // Unit Test : check
  setCMSName(_name) {
    if (typeof _name !== "string") throw new Error('\tError (CMS) :: Function "_newName" :: Input _name is not a string!');
    this.p_name = _name;
  }

  setNaNColor(_colorJSON) {
    //if (!isColorJSON(_colorJSON)) throw new Error('\tError (CMS) :: Function "setNaNColor" :: Input colorJSON is not a colorJSON!');
    this.p_colorNaN.setColorJSON(_colorJSON);
  }

  setBelowColor(_colorJSON) {
    //if (!isColorJSON(_colorJSON)) throw new Error('\tError (CMS) :: Function "setBelowColor" :: Input colorJSON is not a colorJSON!');
    this.p_colorBelow.setColorJSON(_colorJSON);
  }

  setAboveColor(_colorJSON) {
    //if (!isColorJSON(_colorJSON)) throw new Error('\tError (CMS) :: Function "setAboveColor" :: Input colorJSON is not a colorJSON!');
    this.p_colorAbove.setColorJSON(_colorJSON);
  }
} // End Class Color

////////////////////////////////////////////////////
//-------------- Private Functions --------------//
///////////////////////////////////////////////////
// Private function, which should only called with prooved parameters

// we need to check the key colorspace, because with this implementation of the key class we only allow rgb color json.

function _keyJsonToInstance(_key) {
  let tmpKey = new KeyCMS(undefined, undefined, 0, false, false);
  tmpKey.setByJSON(_key);
  return tmpKey;
}

function checkXMLColorspace(xmlObj) {
  if (xmlObj.length > 0) {
    if (xmlObj[0].hasAttribute("r") && xmlObj[0].hasAttribute("b") && xmlObj[0].hasAttribute("g")) return "rgb";

    if (xmlObj[0].hasAttribute("h") && xmlObj[0].hasAttribute("s") && xmlObj[0].hasAttribute("v")) return "hsv";

    if (xmlObj[0].hasAttribute("l") && xmlObj[0].hasAttribute("a") && xmlObj[0].hasAttribute("b")) return "lab";

    if (xmlObj[0].hasAttribute("l99") && xmlObj[0].hasAttribute("a99") && xmlObj[0].hasAttribute("b99")) return "din99";
  }
  return "NoSpace";
}

function checkCSVColorspace(headerLine) {
  let headerAttr = headerLine.split(/[;,]+/);

  if (headerAttr.length >= 6) {
    if ((headerAttr[1] === "r" || headerAttr[1] === "R") && (headerAttr[2] === "g" || headerAttr[2] === "G") && (headerAttr[3] === "b" || headerAttr[3] === "B")) return "rgb";

    if ((headerAttr[1] === "h" || headerAttr[1] === "H") && (headerAttr[2] === "s" || headerAttr[2] === "S") && (headerAttr[3] === "v" || headerAttr[3] === "V")) return "hsv";

    if ((headerAttr[1] === "l" || headerAttr[1] === "L") && (headerAttr[2] === "a" || headerAttr[2] === "A") && (headerAttr[3] === "b" || headerAttr[3] === "B")) return "lab";

    if ((headerAttr[1] === "l99" || headerAttr[1] === "L99") && (headerAttr[2] === "a99" || headerAttr[2] === "A99") && (headerAttr[3] === "b99" || headerAttr[3] === "B99")) return "din99";

    if ((headerAttr[1] === "l" || headerAttr[1] === "L") && (headerAttr[2] === "c" || headerAttr[2] === "C") && (headerAttr[3] === "h" || headerAttr[3] === "H")) return "lch";
  }

  return "NoSpace";
}

///////////////////////////////////////////////////
module.exports = {
  CMS: CMS,
};
