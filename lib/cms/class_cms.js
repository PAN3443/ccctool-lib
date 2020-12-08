//////////////////////////////////////////////
//////////////      HEADER      //////////////
//////////////////////////////////////////////
// File :: Class cMS
// Author :: Pascal Nardini
// License :: MIT

//////////////////////////////////////////////
//////////////////////////////////////////////

const { isNumber, checkIndex, checkInterpolationType } = require("../helper/guardClauses.js");
const { getRatio } = require("../helper/math.js");
const { updateColorToSpace, colorToVector, vectorToColor } = require("../color/colorHelper.js");

const { KeyColor } = require("./class_cmsKey.js");
//////////////////////////////////////////////

class CMS {
  #interpolationSpace = "lab";
  #interpolationType = "linear"; // linear or spline or optimization
  #colorNaN = ["rgb", 0, 0, 0];
  #colorBelow = ["rgb", 0, 0, 0];
  #colorAbove = ["rgb", 0, 0, 0];
  #keyArray = [];
  #deltaColors = [];
  #jnd = 1; // just noticeable difference
  /// Probes
  #probeSetArray = [];

  constructor() {
    this.name = "Customer Colormap";
  }

  clear() {
    this.#keyArray = [];
    this.#deltaColors = [];
    this.#probeSetArray = [];
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

    if (_val > this.getKeyRef(this.#keyArray.length - 1)) {
      return this.getAboveColor(space[1]);
    }

    let index = keyArray.findIndex(function (key) {
      return key.getRef() >= _val; // find the first key with the reference value smaller than the searched value (or equal)
    });
    index = index <= 0 ? 0 : index - 1; //

    return calculateBandColor(index, _val, space[1]);
  }

  /**************************************************************************************************
   **************************************************************************************************
   *  Function    : calculateBandColor
   *  Description : calc the color for the reference value _val of the Band "bandID" of this CMS (with the colorspace _space)
   **************************************************************************************************
   *************************************************************************************************/
  calculateBandColor(_bandID, _val, _space) {
    let space = checkColorSpaceNotation(_space, false);
    if (!space[0]) throw new TypeError('Error (CMS) :: Function "calculateColor" :: Unknown Colorspace.');

    if (!isNumber(_val)) {
      return this.getNaNColor(space[1]);
    }

    if (!checkIndex(_bandID, this.#keyArray.length - 1)) throw new TypeError('Error (CMS) :: Function "calculateBandColor" :: Incorrect bandID! The value ' + _bandID + " is not a valid index!");

    switch (true) {
      case this.#keyArray[_bandID].getRef() == _val:
        //////////////////////////////////////////
        /////////   Hit the First Key    /////////
        //////////////////////////////////////////
        return getBandKeyColor(_bandID, true);
      case this.#keyArray[_bandID + 1].getRef() == _val:
        //////////////////////////////////////////
        /////////   Hit the Second Key    /////////
        //////////////////////////////////////////
        // check middle of triple color
        return getBandKeyColor(_bandID, false);
      default:
        // value is between index-1 and index
        // we need to work with the color in the colorspace, which we use for interpolation
        let color1 = this.getRightKeyColor(_bandID, this.interpolationSpace);
        let color2 = this.getLeftKeyColor(_bandID + 1, this.interpolationSpace);

        if (color1 == undefined) {
          //////////////////////////////////////////
          /////////      Constant Band     /////////
          //////////////////////////////////////////
          return updateColorToSpace(color2, space[1]);
        } else {
          //////////////////////////////////////////
          /////////       Scaled Band      /////////
          //////////////////////////////////////////
          if (this.#deltaColors[_bandID].length > 0) {
            /////////////////////////////////////////
            ///// In this case we have delta colors (Interpolation ds-de94 or ds-de2000) (=> only linear interpolation type)
            /////////////////////////////////////////
            let index = this.#deltaColors[_bandID].findIndex(function (deltaColor) {
              return deltaColor[1] >= _val; // find the first key with the reference value smaller than the searched value (or equal)
            });

            let deltaColor_V1 = undefined;
            let deltaColor_V2 = undefined;
            let ratio = undefined;
            switch (index) {
              case 0:
                deltaColor_V1 = colorToVector(color1);
                deltaColor_V2 = colorToVector(updateColorToSpace(this.#deltaColors[_bandID][index][0], this.interpolationSpace));
                ratio = getRatio(this.#keyArray[_bandID].getRef(), this.#deltaColors[_bandID][index][1], _val);
                break;
              case 0:
                deltaColor_V1 = colorToVector(updateColorToSpace(this.#deltaColors[_bandID][index][0], this.interpolationSpace));
                deltaColor_V2 = colorToVector(color2);
                ratio = getRatio(this.#deltaColors[_bandID][index - 1][1], this.#deltaColors[_bandID][index][1], _val);
                break;
              default:
                deltaColor_V1 = colorToVector(updateColorToSpace(this.#deltaColors[_bandID][index][0], this.interpolationSpace));
                deltaColor_V2 = colorToVector(updateColorToSpace(this.#deltaColors[_bandID][index][0], this.interpolationSpace));
                ratio = getRatio(this.#deltaColors[_bandID][index][1], this.#keyArray[_bandID + 1].getRef(), _val);
                break;
            }

            // do linear interpolation in interpolation colorspace and return the wished colorspace
            return updateColorToSpace(vectorToColor(linearInterpolation(deltaColor_V1, deltaColor_V2, ratio), this.interpolationSpace), space[1]);
          } else {
            switch (key) {
              case "linear":
                /////////////////////////////////////////////////////////////////
                /////////       Scaled Band  :: Linear Interpolation    /////////
                /////////////////////////////////////////////////////////////////
                let color_V1 = colorToVector(color1);
                let color_V2 = colorToVector(color2);
                let ratio = getRatio(this.#keyArray[_bandID].getRef(), this.#keyArray[_bandID + 1].getRef(), _val);
                return updateColorToSpace(vectorToColor(linearInterpolation(color_V1, color_V2, ratio), this.interpolationSpace), space[1]);
              case "spline":
                /////////////////////////////////////////////////////////////////
                /////////       Scaled Band  :: Spline Interpolation    /////////
                /////////////////////////////////////////////////////////////////
                let refColors = this.getSplineColors(_bandID);
                let ratio = getRatio(this.#keyArray[_bandID].getRef(), this.#keyArray[_bandID + 1].getRef(), _val);
                if (refColors == undefined) {
                  let color_V1 = colorToVector(color1);
                  let color_V2 = colorToVector(color2);
                  return updateColorToSpace(vectorToColor(linearInterpolation(color_V1, color_V2, ratio), this.interpolationSpace), space[1]); // do linear if spline is not possible
                } else {
                  return updateColorToSpace(vectorToColor(splineInterpolation(refColors[0], refColors[1], refColors[2], refColors[3], ratio, 1.0), this.interpolationSpace), space[1]);
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
   *  Function    : getSplineColors
   *  Description : Determines the 4 colors, which we need to calculate the spline color inside a band
   **************************************************************************************************
   *************************************************************************************************/
  static getSplineColors(_bandID) {
    // no interpolation needed for constand bands
    if (this.getKeyType(_bandID) == "nil" || this.getKeyType(_bandID) == "left") return undefined;
    if (this.interpolationSpace == "de94-ds" || this.interpolationSpace == "de2000-ds") return undefined;

    let existingC1 = true;
    let existingC3 = true;

    if (this.getKeyType(_bandID) == "right" || this.getKeyType(_bandID) == "twin") {
      existingC1 = false;
    }

    if (this.getKeyType(_bandID + 1) == "left" || this.getKeyType(_bandID + 1) == "twin" || _bandID + 1 == this.keyArray.length - 1) {
      // this.keyArray.length-1 is alwas a left key. For the push creation this don't have to be.
      existingC3 = false;
    }

    let c0 = undefined;
    let c1 = undefined;
    let c2 = undefined;
    let c3 = undefined;

    c1 = colorToVector(this.getRightKeyColor(_bandID, this.interpolationSpace));

    c2 = colorToVector(this.getLeftKeyColor(_bandID + 1, this.interpolationSpace));

    if (!existingC1) {
      c0 = [0, 0, 0]; // every value is zero and has no influence
    } else c0 = colorToVector(this.getRightKeyColor(_bandID - 1, this.interpolationSpace));

    if (!existingC3) {
      c3 = [0, 0, 0]; // every value is zero and has no influence
    } else {
      c3 = colorToVector(this.getLeftKeyColor(_bandID + 2, this.interpolationSpace));
    }

    return [c0, c1, c2, c3];
  }

  /**************************************************************************************************
   **************************************************************************************************
   *  Function    : getBandKeyColor
   *  Description : if calculateColor or calculateBandColor want to get a color at a reference point of a key.
   *                this function determine which color need to be returned (Depends on MoT,Key Type).
   *                This function is static, because only this class methods need access to this method.
   **************************************************************************************************
   *************************************************************************************************/
  static getBandKeyColor(_bandID, _isStartKey, _space) {
    // static method, only call able inside this class => proofed input
    let keyIndex = _isStartKey ? _bandID : _bandID + 1;
    switch (this.keyArray[keyIndex].getKeyType()) {
      case "nil":
        return this.getLeftKeyColor(keyIndex + 1, _space);
      case "left":
        // if not static, we would have to check if the
        return this.#keyArray[keyIndex].getMoT() ? this.getLeftKeyColor(keyIndex + 1, _space) : this.getLeftKeyColor(keyIndex, _space);
      case "twin":
        return this.#keyArray[keyIndex].getMoT() ? this.getRightKeyColor(keyIndex, _space) : this.getLeftKeyColor(keyIndex, _space);
      //case "right":
      // if not static we should check if _isStartKey=true, because right keys are alway at the first key of a CMS
      // return this.getRightKeyColor(keyIndex,space);
      default:
        return this.getRightKeyColor(keyIndex, _space);
    }
  }

  /**************************************************************************************************
   **************************************************************************************************
   *  Function    : searchForContinuousSections
   *  Description : This algorithm search key sequences that cause a continues part in the CMS
   *  Return      : This algorithm return an array. Each element include the start index and end
   *                index of a continouse part
   **************************************************************************************************
   *************************************************************************************************/
  searchForContinuousSections(_startKey, _endKey) {
    if (!checkIndex(_startKey, this.#keyArray.length)) throw new TypeError('Error (CMS) :: Function "calculateBandColor" :: Incorrect _startKey! The value ' + _startKey + " is not a valid index!");
    if (!checkIndex(_endKey, this.#keyArray.length)) throw new TypeError('Error (CMS) :: Function "calculateBandColor" :: Incorrect bandID! The value ' + _endKey + " is not a valid index!");

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

  /*calcReverse() {
    if (this.keyArray.length < 2) return;

    let tmpKeyArray = [];
    let startPos = this.getKeyRef(0);
    let endPos = this.getKeyRef(this.keyArray.length - 1);

    for (let i = 0; i < this.keyArray.length; i++) {
      //
      if ((this.keyArray[i].getKeyType() === "nil key" || this.keyArray[i].getKeyType() === "left key") && i != this.keyArray.length - 1) {
        this.keyArray[i].setRightKeyColor(this.getLeftKeyColor(i+1,"lab"));
        this.keyArray[i + 1].setLeftKeyColor(undefined);
      }

      let newPos = startPos + (endPos - this.getKeyRef(i));

      let tmpColor = this.getLeftKeyColor(i,"lab");
      this.keyArray[i].setLeftKeyColor(this.getRightKeyColor(i,"lab"));
      this.keyArray[i].setRightKeyColor(tmpColor);

      tmpKeyArray.splice(0, 0, this.getKeyClone(i));
      this.setKeyRef(0,newPos);
    }

    for (let i = this.keyArray.length - 1; i >= 0; i--) {
      this.keyArray[i].deleteReferences();
      this.keyArray[i] = null;
    }
    this.keyArray = tmpKeyArray;

    this.calcDeltaColors();
  }

  setAutoRange(newStart, newEnd) {
    let currentStart = this.getKeyRef(0);
    let currentdistance = this.getKeyRef(this.keyArray.length - 1) - currentStart;
    let newDistance = newEnd - newStart;

    for (let i = 0; i < this.keyArray.length; i++) {
      let ratio = (this.getKeyRef(i) - currentStart) / currentdistance;
      let newPos = newStart + ratio * newDistance;
      this.setKeyRef(i,newPos);
    }
    this.calcDeltaColors();
  }

  equalKeyIntervals() {
    if (this.keyArray.length > 2) {
      let equalDis = Math.abs(this.getKeyRef(this.keyArray.length - 1) - this.getKeyRef(0)) / (this.keyArray.length - 1);
      for (let i = 1; i < this.keyArray.length - 1; i++) {
        this.setKeyRef(i,this.getKeyRef(0) + i * equalDis);
      }
    }
    this.calcDeltaColors();
  }

  createCMSInfoPackage() {
    // we can use these packages to update the worker with a new CMS
    let tmpPack = [];

    tmpPack.push(this.name);
    tmpPack.push(this.interpolationSpace);
    tmpPack.push(this.interpolationType);

    tmpPack.push(this.colorNaN);
    tmpPack.push(this.colorBelow);
    tmpPack.push(this.colorAbove);

    let tmpKeysPack = [];
    for (let i = 0; i < this.getKeyLength(); i++) {
      tmpKeysPack.push(this.keyArray[i].getKeyPackage());
    }
    tmpPack.push(tmpKeysPack);
    let tmpProbePack = [];
    //////////////////////////////////
    ////// Probe is Missing //////////
    //////////////////////////////////
    tmpPack.push(tmpProbePack);

    //// SupportColor Info
    tmpPack.push(this.pathplotSpace);
    tmpPack.push(this.analysisWorkColorType); // none, interval, bandinterval
    tmpPack.push(this.analysisWorkColorIntervalNum);
    tmpPack.push(this.jnd_lab); // just noticeable difference for space lab
    tmpPack.push(this.jnd_de94); // just noticeable difference for space lab with metric DE94
    tmpPack.push(this.jnd_de2000); // just noticeable difference for space lab with metric CIEDE2000
    tmpPack.push(this.jnd_din99); // just noticeable difference for space din99

    return tmpPack;
  }

  setCMSFromPackage(cmsPackage) {
    this.clear();

    this.pathplotSpace = cmsPackage[8];
    this.analysisWorkColorType = cmsPackage[9]; // none, interval, bandinterval
    this.analysisWorkColorIntervalNum = cmsPackage[10];
    this.jnd_lab = cmsPackage[11]; // just noticeable difference for space lab
    this.jnd_de94 = cmsPackage[12]; // just noticeable difference for space lab with metric DE94
    this.jnd_de2000 = cmsPackage[13]; // just noticeable difference for space lab with metric CIEDE2000
    this.jnd_din99 = cmsPackage[14]; // just noticeable difference for space din99

    /////////////////////////////////////////////////
    this.name = cmsPackage[0];
    this.interpolationSpace = cmsPackage[1];
    this.interpolationType = cmsPackage[2];

    this.colorNaN = cmsPackage[3];
    this.colorBelow = cmsPackage[4];
    this.colorAbove = cmsPackage[5];

    /// Keys ///
    for (let i = 0; i < cmsPackage[6].length; i++) {
      this.pushKey(new class_Key(cmsPackage[6][i][0], cmsPackage[6][i][1], cmsPackage[6][i][2], cmsPackage[6][i][3], cmsPackage[6][i][4]));
    }

    //////////////////////////////////
    ////// Probe is Missing //////////
    //////////////////////////////////
  }

  /*insertCMS(cmsInfoPackage, insertIndex) {
    if (this.getKeyLength() == 0) return;

    let cmsDis = cmsInfoPackage[6][cmsInfoPackage[6].length - 1][2] - cmsInfoPackage[6][0][2];

    switch (insertIndex) {
      case this.getKeyLength() - 1:
        // case scaled band
        let tmpVal = this.getKeyRef(insertIndex);
        let dist = Math.abs(tmpVal - this.getKeyRef(insertIndex - 1)) * 0.5;
        let startPos = tmpVal - dist;

        this.setKeyRef(insertIndex, startPos);
        this.setRightKeyColor(insertIndex, cmsInfoPackage[6][0][1]); // cmsInfoPackage[6][0][1] = right color of first key

        for (let i = 1; i < cmsInfoPackage[6].length; i++) {
          let ratio = (cmsInfoPackage[6][i][2] - cmsInfoPackage[6][i - 1][2]) / cmsDis;
          startPos = startPos + dist * ratio;

          if (i == cmsInfoPackage[6].length - 1) this.pushKey(new class_Key(cmsInfoPackage[6][i][0], cmsInfoPackage[6][i][1], tmpVal, cmsInfoPackage[6][i][3], cmsInfoPackage[6][i][4]));
          else this.pushKey(new class_Key(cmsInfoPackage[6][i][0], cmsInfoPackage[6][i][1], startPos, cmsInfoPackage[6][i][3], cmsInfoPackage[6][i][4]));
        }
        break;

      default:
        let startPos = this.getKeyRef(insertIndex);
        let dist = Math.abs(this.getKeyRef(insertIndex + 1) - startPos) * 0.5;
        let endPos = startPos + dist;

        this.setKeyRef(insertIndex, endPos);
        let oldColor = this.getLeftKeyColor(insertIndex, "lab");

        this.setLeftKeyColor(insertIndex, cmsInfoPackage[6][cmsInfoPackage[6].length - 1][0]); // left key color of the last key of the package
        this.setBur(insertIndex, true);

        for (let i = cmsInfoPackage[6].length - 2; i >= 0; i--) {
          let ratio = (cmsInfoPackage[6][i + 1][2] - cmsInfoPackage[6][i][2]) / cmsDis;
          endPos = endPos - dist * ratio;
          this.insertKey(insertIndex, new class_Key(cmsInfoPackage[6][i][0], cmsInfoPackage[6][i][1], endPos, cmsInfoPackage[6][i][3], cmsInfoPackage[6][i][4]));
        }

        this.setLeftKeyColor(insertIndex, oldColor);
        this.setBur(insertIndex, true);
    }
  }*/

  /**************************************************************************************************
   **************************************************************************************************
   ************************************ CMS Specific Methods ****************************************
   **************************************************************************************************
   *************************************************************************************************/

  static updateSurroundingDeltaColors() {}

  static calcDeltaColors() {}

  static updateBandDeltaColors() {}

  /**************************************************************************************************
   **************************************************************************************************
   *****************************************  Manage Keys  ******************************************
   **************************************************************************************************
   *************************************************************************************************/
  /*deleteKey(index) {
    this.keyArray[index].deleteReferences();
    this.keyArray[index] = null;
    this.keyArray.splice(index, 1);

    this.supportColors.splice(index, 1);
    this.pathplotWorkColors.splice(index, 1);
    this.analysisWorkColors.splice(index, 1);
    this.exportWorkColors.splice(index, 1);

    if (index != 0 && index != this.keyArray.length - 1) {
      this.calcBandSupportColors(index - 1);

      if (this.interpolationType === "spline") {
        if (index - 2 >= 0) {
          if (this.keyArray[index - 1].getKeyType() === "dual key") {
            this.calcBandSupportColors(index - 2);
            if (index - 3 >= 0) {
              if (this.keyArray[index - 2].getKeyType() === "dual key") this.calcBandSupportColors(index - 3);
            }
          }
        }
        if (index + 1 < this.keyArray.length) {
          if (this.keyArray[index + 1].getKeyType() === "dual key") {
            this.calcBandSupportColors(index + 1);
            if (index + 2 < this.keyArray.length) {
              if (this.keyArray[index + 2].getKeyType() === "dual key") this.calcBandSupportColors(index + 2);
            }
          }
        }
      }
    }
  }

  getKeyLength() {
    return this.keyArray.length;
  }

  getKey(index) {
    return this.keyArray[index];
  }

  getKeyClone(index) {
    let keypackage = this.keyArray[index].getKeyPackage();
    let newKey = new class_Key(keypackage[0], keypackage[1], keypackage[2], keypackage[3], keypackage[4]);
    return newKey;
  }

  setLeftKeyColor(index, color) {
    this.keyArray[index].setLeftKeyColor(color);

    if (index != 0) {
      this.calcBandSupportColors(index - 1);

      if (this.interpolationType === "spline") {
        if (index - 2 >= 0) {
          if (this.keyArray[index - 1].getKeyType() === "dual key") {
            this.calcBandSupportColors(index - 2);
            if (index - 3 >= 0) {
              if (this.keyArray[index - 2].getKeyType() === "dual key") this.calcBandSupportColors(index - 3);
            }
          }
        }
      }
    }
  }

  setRightKeyColor(index, color) {
    this.keyArray[index].setRightKeyColor(color);

    if (index != this.keyArray.length - 1) {
      this.calcBandSupportColors(index);
      if (this.interpolationType === "spline") {
        if (index + 1 < this.keyArray.length) {
          if (this.keyArray[index + 1].getKeyType() === "dual key") {
            this.calcBandSupportColors(index + 1);
            if (index + 2 < this.keyArray.length) {
              if (this.keyArray[index + 2].getKeyType() === "dual key") this.calcBandSupportColors(index + 2);
            }
          }
        }
      }
    }
  }*/

  getLeftKeyColor(_index, _space) {
    if (!checkIndex(_index, this.#keyArray.length)) throw new TypeError('Error (CMS) :: Function "getLeftKeyColor" :: Incorrect _index! The value ' + _index + " is not a valid index!");
    return updateColorToSpace(this.#keyArray[_index].getCL(), _space);
  }

  getRightKeyColor(_index, _space) {
    if (!checkIndex(_index, this.#keyArray.length)) throw new TypeError('Error (CMS) :: Function "getRightKeyColor" :: Incorrect _index! The value ' + _index + " is not a valid index!");
    return updateColorToSpace(this.#keyArray[_index].getCR(), _space);
  }

  getKeyType(_index) {
    if (!checkIndex(_index, this.#keyArray.length)) throw new TypeError('Error (CMS) :: Function "getKeyType" :: Incorrect _index! The value ' + _index + " is not a valid index!");
    return this.keyArray[_index].getType();
  }

  getMoT(_index) {
    if (!checkIndex(_index, this.#keyArray.length)) throw new TypeError('Error (CMS) :: Function "getMoT" :: Incorrect _index! The value ' + _index + " is not a valid index!");
    return this.keyArray[_index].getMoT();
  }

  setMoT(_index, _mot) {
    if (!checkIndex(_index, this.#keyArray.length)) throw new TypeError('Error (CMS) :: Function "setMoT" :: Incorrect _index! The value ' + _index + " is not a valid index!");
    this.keyArray[_index].setMoT(_mot);
  }

  insertKey(_index, _key) {
    if (!checkIndex(_index, this.#keyArray.length)) throw new TypeError('Error (CMS) :: Function "insertKey" :: Incorrect _index! The value ' + _index + " is not a valid index!");
    if (!(_key instanceof KeyColor)) throw new TypeError('Error (CMS) :: Function "insertKey" :: Incorrect parameter! The key is not a instance of the class KeyColor!');
    this.#keyArray.splice(_index, 0, _key);
    this.#deltaColors.splice(_index, 0, []);
  }

  addKey(_key) {
    if (!(_key instanceof KeyColor)) throw new TypeError('Error (CMS) :: Function "addKey" :: Incorrect parameter! The key is not a instance of the class KeyColor!');
    // find position
    let index = undefined;
    let ref = _key.getRef();

    for (let i = 1; i < this.#keyArray.length; i++) {
      if (ref > this.getKeyRef(i - 1) && ref < this.getKeyRef(i)) {
        index = i;
        break;
      }
    }

    if (index != undefined) {
      this.#keyArray.splice(index, 0, key);
      this.#deltaColors.splice(index, 0, []);
      this.updateSurroundingDeltaColors(index);
    }
  }

  pushKey(_key) {
    if (!(_key instanceof KeyColor)) throw new TypeError('Error (CMS) :: Function "pushKey" :: Incorrect parameter! The key is not a instance of the class KeyColor!');
    this.#keyArray.push(_key);

    if (this.keyArray.length > 1) this.#deltaColors.push([]);
  }

  getBur(_index) {
    if (!checkIndex(_index, this.#keyArray.length)) throw new TypeError('Error (CMS) :: Function "getBur" :: Incorrect _index! The value ' + _index + " is not a valid index!");
    return this.#keyArray[_index].getBur();
  }

  setBur(_index, _isBur) {
    if (!checkIndex(_index, this.#keyArray.length)) throw new TypeError('Error (CMS) :: Function "setBur" :: Incorrect _index! The value ' + _index + " is not a valid index!");
    this.keyArray[_index].setBur(_isBur);
  }

  deleteBand(index) {
    let tmpRightColor = this.getRightKeyColor(index + 1, "lab");
    this.keyArray[index].setRightKeyColor(tmpRightColor);
    this.deleteKey(index + 1);
  }

  /**************************************************************************************************
   **************************************************************************************************
   *****************************************   Set & Get   ******************************************
   **************************************************************************************************
   *************************************************************************************************/

  getInterpolationType() {
    return this.#interpolationType;
  }

  getInterpolationSpace() {
    return this.#interpolationSpace;
  }

  getRefRange() {
    if (this.#keyArray.length > 1) {
      return this.#keyArray[this.#keyArray.length - 1].getRef() - this.#keyArray[0].getRef();
    } else {
      return 0;
    }
  }

  getKeyRef(_index) {
    if (!checkIndex(_index, this.#keyArray.length)) throw new TypeError('Error (CMS) :: Function "getKeyRef" :: Incorrect _index! The value ' + _index + " is not a valid index!");
    if (_index < 0 || _index >= this.#keyArray.length) return undefined;

    return this.#keyArray[_index].getRef();
  }

  getColormapName() {
    return this.#name;
  }

  getNaNColor(_space) {
    let space = checkColorSpaceNotation(_space, false);
    if (!space[0]) throw new TypeError('Error (CMS) :: Function "getNaNColor" :: Unknown Colorspace.');
    return updateColorToSpace(this.#colorNaN, space[1]);
  }

  getBelowColor(_space) {
    let space = checkColorSpaceNotation(_space, false);
    if (!space[0]) throw new TypeError('Error (CMS) :: Function "getBelowColor" :: Unknown Colorspace.');
    return updateColorToSpace(this.#colorBelow, space[1]);
  }

  getAboveColor(_space) {
    let space = checkColorSpaceNotation(_space, false);
    if (!space[0]) throw new TypeError('Error (CMS) :: Function "getAboveColor" :: Unknown Colorspace.');
    return updateColorToSpace(this.#colorAbove, space[1]);
  }

  setInterpolationType(_type) {
    if (!checkInterpolationType(_type)) throw new TypeError('Error (CMS) :: Function "setInterpolationType" :: Unknown Interpolation Type.');

    this.#interpolationType = _type;

    if (this.#interpolationType === "spline") {
      if (this.#interpolationSpace === "de94-ds") {
        this.#interpolationSpace = "lab";
        console.warn('Warning (CMS) :: Function "setInterpolationType" :: Interpolation Type "Spline" is not compatible with the "de94-ds" interpolation! Interpolation space reset to "lab".');
      }
      if (this.#interpolationSpace === "de2000-ds") {
        this.#interpolationSpace = "lab";
        console.warn('Warning (CMS) :: Function "setInterpolationType" :: Interpolation Type "Spline" is not compatible with the "de2000-ds" interpolation! Interpolation space reset to "lab".');
      }
    }

    this.calcDeltaColors(); // new interpolationType => supportColors need to be updated
  }

  setKeyRef(_index, _ref) {
    if (!checkIndex(_index, this.#keyArray.length)) throw new TypeError('Error (CMS) :: Function "setKeyRef" :: Incorrect _index! The value ' + _index + " is not a valid index!");
    this.#keyArray[_index].setRef(_ref);
    this.updateSurroundingDeltaColors(_index);
    if (_index != 0) this.updateSurroundingDeltaColors(_index - 1);
  }

  setInterpolationSpace(_space) {
    let space = checkColorSpaceNotation(_space, false);
    if (!space[0]) throw new TypeError('Error (CMS) :: Function "getAboveColor" :: Unknown Colorspace.');
    // special strings allowed for metric interpolation in LAB
    if (_space === "de94-ds") space[1] = _space;
    if (_space === "de2000-ds") space[1] = _space;

    this.#interpolationSpace = space[1];
    this.calcDeltaColors(); // new interpolationSpace => supportColors need to be updateSurroundingDeltaColors
  }

  setColormapName(_newName) {
    this.#name = _newName;
  }

  setNaNColor(_colorJSON) {
    if (!isColorJSON(_colorJSON)) throw new Error('\tError (CMS) :: Function "setNaNColor" :: Input colorJSON is not a colorJSON!');
    this.#colorNaN = _colorJSON;
  }

  setBelowColor(_colorJSON) {
    if (!isColorJSON(_colorJSON)) throw new Error('\tError (CMS) :: Function "setBelowColor" :: Input colorJSON is not a colorJSON!');
    this.#colorBelow = _colorJSON;
  }

  setAboveColor(_colorJSON) {
    if (!isColorJSON(_colorJSON)) throw new Error('\tError (CMS) :: Function "setAboveColor" :: Input colorJSON is not a colorJSON!');
    this.#colorAbove = _colorJSON;
  }
} // End Class Color

////////////////////////////////////////////////////
//-------------- Private Functions --------------//
///////////////////////////////////////////////////
// Private function, which should only called with prooved parameters

///////////////////////////////////////////////////
module.exports = {
  CMS: CMS,
};
