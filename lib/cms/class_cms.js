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
const { updateColorToSpace, colorToVector, vectorToColor } = require("../color/colorHelper.js");
const { linearInterpolation, splineInterpolation } = require("../helper/interpolation.js");
const { KeyCMS } = require("./class_cmsKey.js");
//////////////////////////////////////////////

class CMS {
  // use p_ as placeholder for # (# private variables are not supported by e.g. react)
  constructor() {
    this.p_name = "Customer Colormap";
    this.p_interpolationSpace = "lab";
    this.p_interpolationType = "linear"; // linear or spline or optimization
    this.p_colorNaN = { space: "rgb", c1: 0, c2: 0, c3: 0 };
    this.p_colorBelow = { space: "rgb", c1: 0, c2: 0, c3: 0 };
    this.p_colorAbove = { space: "rgb", c1: 0, c2: 0, c3: 0 };
    this.p_keys = [];
    this.p_deltaColors = [];
    this.p_jnd = 1; // just noticeable difference
    /// Probes
    this.p_probeSetArray = [];
    /// work
    this.p_workOn = false;
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
   **************************************************************************************************
   *************************************************************************************************/
  calculateBandColor(_bandID, _val, _space) {
    let space = checkColorSpaceNotation(_space, false);

    if (!space[0]) throw new TypeError('Error (CMS) :: Function "calculateBandColor" :: Unknown Colorspace.');

    if (!isNumber(_val)) {
      return this.getNaNColor(space[1]);
    }

    if (!checkIndex(_bandID, this.getKeyLength() - 1)) throw new TypeError('Error (CMS) :: Function "calculateBandColor" :: Incorrect bandID! The value ' + _bandID + " is not a valid index!");

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
        // value is between index-1 and index
        // we need to work with the color in the colorspace, which we use for interpolation
        let color1 = this.getKeyCR(_bandID, space[1]);
        let color2 = this.getKeyCL(_bandID + 1, space[1]);
        let ratio = undefined;

        if (color1 == undefined) {
          //////////////////////////////////////////
          /////////      Constant Band     /////////
          //////////////////////////////////////////
          return updateColorToSpace(color2, space[1]);
        } else {
          //////////////////////////////////////////
          /////////       Scaled Band      /////////
          //////////////////////////////////////////
          if (this.p_deltaColors[_bandID].length > 0) {
            /////////////////////////////////////////
            ///// In this case we have delta colors (Interpolation ds-de94 or ds-de2000) (=> only linear interpolation type)
            /////////////////////////////////////////
            let index = this.p_deltaColors[_bandID].findIndex(function (deltaColor) {
              return deltaColor[1] >= _val; // find the first key with the reference value smaller than the searched value (or equal)
            });

            let deltaColor_V1 = undefined;
            let deltaColor_V2 = undefined;
            switch (index) {
              case 0:
                deltaColor_V1 = colorToVector(color1);
                deltaColor_V2 = colorToVector(updateColorToSpace(this.p_deltaColors[_bandID][index][0], space[1]));
                ratio = getRatio(this.p_keys[_bandID].getRef(), this.p_deltaColors[_bandID][index][1], _val);
                break;
              case 0:
                deltaColor_V1 = colorToVector(updateColorToSpace(this.p_deltaColors[_bandID][index][0], space[1]));
                deltaColor_V2 = colorToVector(color2);
                ratio = getRatio(this.p_deltaColors[_bandID][index - 1][1], this.p_deltaColors[_bandID][index][1], _val);
                break;
              default:
                deltaColor_V1 = colorToVector(updateColorToSpace(this.p_deltaColors[_bandID][index][0], space[1]));
                deltaColor_V2 = colorToVector(updateColorToSpace(this.p_deltaColors[_bandID][index][0], space[1]));
                ratio = getRatio(this.p_deltaColors[_bandID][index][1], this.p_keys[_bandID + 1].getRef(), _val);
                break;
            }

            // do linear interpolation in interpolation colorspace and return the wished colorspace
            return updateColorToSpace(vectorToColor(linearInterpolation(deltaColor_V1, deltaColor_V2, ratio), space[1]), space[1]);
          } else {
            switch (this.p_interpolationType) {
              case "linear":
                /////////////////////////////////////////////////////////////////
                /////////       Scaled Band  :: Linear Interpolation    /////////
                /////////////////////////////////////////////////////////////////
                let color_V1 = colorToVector(color1);
                let color_V2 = colorToVector(color2);
                ratio = getRatio(this.p_keys[_bandID].getRef(), this.p_keys[_bandID + 1].getRef(), _val);
                return updateColorToSpace(vectorToColor(linearInterpolation(color_V1, color_V2, ratio), space[1]), space[1]);
              case "spline":
                /////////////////////////////////////////////////////////////////
                /////////       Scaled Band  :: Spline Interpolation    /////////
                /////////////////////////////////////////////////////////////////
                let refColors = this._getSplineColors(_bandID);
                ratio = getRatio(this.p_keys[_bandID].getRef(), this.p_keys[_bandID + 1].getRef(), _val);
                if (refColors == undefined) {
                  let color_V1 = colorToVector(color1);
                  let color_V2 = colorToVector(color2);
                  return updateColorToSpace(vectorToColor(linearInterpolation(color_V1, color_V2, ratio), space[1]), space[1]); // do linear if spline is not possible
                } else {
                  return updateColorToSpace(vectorToColor(splineInterpolation(refColors[0], refColors[1], refColors[2], refColors[3], ratio, 1.0), space[1]), space[1]);
                }
            }
          }
        }

        break;
    }

    return this.getNaNColor(space);
  }

  /**************************************************************************************************
   **************************************************************************************************
   *  Function    : _getSplineColors
   *  Description : Determines the 4 colors, which we need to calculate the spline color inside a band
   **************************************************************************************************
   *************************************************************************************************/
  _getSplineColors(_bandID) {
    // no interpolation needed for constand bands
    if (this.getKeyType(_bandID) == "nil" || this.getKeyType(_bandID) == "left") return undefined;
    if (this.interpolationSpace == "de94-ds" || this.interpolationSpace == "de2000-ds") return undefined;

    let existingC1 = true;
    let existingC3 = true;

    if (this.getKeyType(_bandID) == "right" || this.getKeyType(_bandID) == "twin") {
      existingC1 = false;
    }

    if (this.getKeyType(_bandID + 1) == "left" || this.getKeyType(_bandID + 1) == "twin" || _bandID + 1 == this.getKeyLength() - 1) {
      // this.getKeyLength()-1 is alwas a left key. For the push creation this don't have to be.
      existingC3 = false;
    }

    let c0 = undefined;
    let c1 = undefined;
    let c2 = undefined;
    let c3 = undefined;

    c1 = colorToVector(this.getKeyCR(_bandID, this.interpolationSpace));

    c2 = colorToVector(this.getKeyCL(_bandID + 1, this.interpolationSpace));

    if (!existingC1) {
      c0 = [0, 0, 0]; // every value is zero and has no influence
    } else c0 = colorToVector(this.getKeyCR(_bandID - 1, this.interpolationSpace));

    if (!existingC3) {
      c3 = [0, 0, 0]; // every value is zero and has no influence
    } else {
      c3 = colorToVector(this.getKeyCL(_bandID + 2, this.interpolationSpace));
    }

    return [c0, c1, c2, c3];
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
        return this.getKeyCL(keyIndex + 1, _space);
      case "left":
        // if not private, we would have to check if the
        return this.p_keys[keyIndex].getMoT() ? this.getKeyCL(keyIndex + 1, _space) : this.getKeyCL(keyIndex, _space);
      case "twin":
        return this.p_keys[keyIndex].getMoT() ? this.getKeyCR(keyIndex, _space) : this.getKeyCL(keyIndex, _space);
      //case "right":
      // if not private we should check if _isStartKey=true, because right keys are alway at the first key of a CMS
      // return this.getKeyCR(keyIndex,space);
      default:
        return this.getKeyCR(keyIndex, _space);
    }
  }

  /**************************************************************************************************
   **************************************************************************************************
   *  Function    : searchForContinuousSections
   *  Description : This algorithm search key sequences that cause a continues part in the CMS
   *  Return      : This algorithm return an array. Each element include the start index and end
   *                index of a continouse part
   *  Unit Test : check
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
   *  Unit Test : check
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
        this.setKeyCR(i, this.getKeyCL(i + 1, this.p_interpolationSpace));
        this.setKeyCL(i + 1, undefined);
      }
      let newPos = startPos + (endPos - this.getKeyRef(i));
      let tmpColor = this.getKeyCL(i, this.p_interpolationSpace);
      this.setKeyCL(i, this.getKeyCR(i, this.p_interpolationSpace));
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
   *  Unit Test : check
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
   *  Unit Test : check
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
   *  Unit Test : check
   **************************************************************************************************
   *************************************************************************************************/
  getCMSJSON() {
    let cmsJSON = {};
    cmsJSON.name = this.p_name;
    cmsJSON.interpolationSpace = this.p_interpolationSpace;
    cmsJSON.interpolationType = this.p_interpolationType; // linear or spline or optimization
    cmsJSON.colorNaN = this.p_colorNaN;
    cmsJSON.colorBelow = this.p_colorBelow;
    cmsJSON.colorAbove = this.p_colorAbove;
    cmsJSON.keys = [];
    cmsJSON.jnd = this.p_jnd;

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
   *  Unit Test : check
   **************************************************************************************************
   *************************************************************************************************/
  setByJSON(_cmsJSON) {
    if (!isCMSJSON(_cmsJSON)) throw new TypeError('Error (CMS) :: Function "setByJSON" :: Incorrect cmsJSON file!');

    this.clear();
    this.p_name = _cmsJSON.name;

    if (typeof _cmsJSON.interpolationType === "string") if (_cmsJSON.interpolationType === "linear" || _cmsJSON.interpolationType === "spline") this.p_interpolationType = _cmsJSON.interpolationType;

    let space = checkColorSpaceNotation(_cmsJSON.interpolationSpace);
    if (space[0]) this.p_interpolationSpace = space[1];

    if (isColorJSON(_cmsJSON.colorNaN)) this.p_colorNaN = _cmsJSON.colorNaN;
    if (isColorJSON(_cmsJSON.colorBelow)) this.p_colorBelow = _cmsJSON.colorBelow;
    if (isColorJSON(_cmsJSON.colorAbove)) this.p_colorAbove = _cmsJSON.colorAbove;

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
   *  Unit Test : check
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
        let oldColor = this.getKeyCL(_index, "lab");

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

    /// we only allow rgb color json in the key class implementation
    if (_cL != undefined) if (_cL.space != "rgb") _cL = updateColorToSpace(_cL, "rgb");

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

    /// we only allow rgb color json in the key class implementation
    if (_cR != undefined) if (_cR.space != "rgb") _cR = updateColorToSpace(_cR, "rgb");

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
  getKeyCL(_index, _space) {
    if (!checkIndex(_index, this.getKeyLength())) throw new TypeError('Error (CMS) :: Function "getKeyCL" :: Incorrect _index! The value ' + _index + " is not a valid index!");
    if (this.p_keys[_index].getCL() !== undefined) return updateColorToSpace(this.p_keys[_index].getCL(), _space);
    return undefined;
  }

  // Unit Test : check
  getKeyCR(_index, _space) {
    if (!checkIndex(_index, this.getKeyLength())) throw new TypeError('Error (CMS) :: Function "getKeyCR" :: Incorrect _index! The value ' + _index + " is not a valid index!");
    if (this.p_keys[_index].getCR() !== undefined) return updateColorToSpace(this.p_keys[_index].getCR(), _space);
    return undefined;
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
    _key = _checkKeyColorspace(_key);
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
    _key = _checkKeyColorspace(_key);
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

  deleteBand(index) {
    let tmpRightColor = this.getKeyCR(index + 1, "lab");
    this.p_keys[index].setKeyCR(tmpRightColor);
    this.deleteKey(index + 1);
  }

  /**************************************************************************************************
   **************************************************************************************************
   *****************************************   Set & Get   ******************************************
   **************************************************************************************************
   *************************************************************************************************/

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
    return updateColorToSpace(this.p_colorNaN, space[1]);
  }

  getBelowColor(_space) {
    let space = checkColorSpaceNotation(_space, false);
    if (!space[0]) throw new TypeError('Error (CMS) :: Function "getBelowColor" :: Unknown Colorspace.');
    return updateColorToSpace(this.p_colorBelow, space[1]);
  }

  getAboveColor(_space) {
    let space = checkColorSpaceNotation(_space, false);
    if (!space[0]) throw new TypeError('Error (CMS) :: Function "getAboveColor" :: Unknown Colorspace.');
    return updateColorToSpace(this.p_colorAbove, space[1]);
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
    if (!isColorJSON(_colorJSON)) throw new Error('\tError (CMS) :: Function "setNaNColor" :: Input colorJSON is not a colorJSON!');
    this.p_colorNaN = _colorJSON;
  }

  setBelowColor(_colorJSON) {
    if (!isColorJSON(_colorJSON)) throw new Error('\tError (CMS) :: Function "setBelowColor" :: Input colorJSON is not a colorJSON!');
    this.p_colorBelow = _colorJSON;
  }

  setAboveColor(_colorJSON) {
    if (!isColorJSON(_colorJSON)) throw new Error('\tError (CMS) :: Function "setAboveColor" :: Input colorJSON is not a colorJSON!');
    this.p_colorAbove = _colorJSON;
  }
} // End Class Color

////////////////////////////////////////////////////
//-------------- Private Functions --------------//
///////////////////////////////////////////////////
// Private function, which should only called with prooved parameters

// we need to check the key colorspace, because with this implementation of the key class we only allow rgb color json.
function _checkKeyColorspace(_key) {
  let cr = _key.getCR();
  if (cr != undefined) if (cr.space != "rgb") key.setCR(updateColorToSpace(cr, "rgb"));

  let cl = _key.getCL();
  if (cl != undefined) if (cl.space != "rgb") key.setCL(updateColorToSpace(cl, "rgb"));

  return _key;
}

function _keyJsonToInstance(_key) {
  let tmpKey = new KeyCMS(undefined, undefined, 0, false, false);
  tmpKey.setByJSON(_key);
  return tmpKey;
}

///////////////////////////////////////////////////
module.exports = {
  CMS: CMS,
};
