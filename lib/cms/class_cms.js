//////////////////////////////////////////////
//////////////      HEADER      //////////////
//////////////////////////////////////////////
// File :: Class cMS
// Author :: Pascal Nardini
// License :: MIT

//////////////////////////////////////////////
//////////////////////////////////////////////

const { isNumber } = require("../helper/guardClauses.js");
const { Color } = require("../color/class_Color.js");
const workColor = new Color("rgb", 0, 0, 0);

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
    this.#probeSetArray = [];
  }

  /**************************************************************************************************
   **************************************************************************************************
   ************************************ CMS Specific Methods ****************************************
   **************************************************************************************************
   *************************************************************************************************/

  /**************************************************************************************************
   **************************************************************************************************
   *  Function    :
   *  Description :
   **************************************************************************************************
   *************************************************************************************************/
  /*
  let ages = [{ref:3, c1:123}, {ref:10, c1:123}, {ref:10, c1:123},{ref:20, c1:123}];
  function myFunction() {
  document.getElementById("demo").innerHTML = ages.findIndex(function (age) {
    return age.ref >= 18;
  });
 */

  calculateColor(val, cspace) {
    let space = checkColorSpaceNotation(cspace, false);
    if (!space[0]) throw new TypeError('Error (CMS) :: Function "calculateColor" :: Unknown Colorspace.');

    if (!isNumber(val)) {
      return this.getNaNColor(space[1]);
    }

    if (val < this.keyArray[0].getRefPosition()) {
      return this.getBelowColor(space[1]);
    }

    if (val > this.keyArray[this.keyArray.length - 1].getRefPosition()) {
      return this.getAboveColor(space[1]);
    }

    let index = keyArray.findIndex(function (key) {
      return key.getRef() >= val; // find the first key with the reference value smaller than the searched value (or equal)
    });

    return calculateBandColor(index - 1, val, space[1]);
  }

  calculateBandColor(bandID, val, cspace) {
    let space = checkColorSpaceNotation(cspace, false);
    if (!space[0]) throw new TypeError('Error (CMS) :: Function "calculateColor" :: Unknown Colorspace.');

    if (!isNumber(val)) {
      return this.getNaNColor(space[1]);
    }

    if (!isNumber(bandID)) throw new TypeError('Error (CMS) :: Function "calculateBandColor" :: Incorrect bandID!');

    if (bandID > this.#keyArray.length - 2) throw new TypeError('Error (CMS) :: Function "calculateBandColor" :: Incorrect bandID!');

    switch (true) {
      case this.#keyArray[bandID].getRef() == val:
        //////////////////////////////////////////
        /////////   Hit the First Key    /////////
        //////////////////////////////////////////
        return getBandKeyColor(bandID, true);
      case this.#keyArray[bandID + 1].getRef() == val:
        //////////////////////////////////////////
        /////////   Hit the Second Key    /////////
        //////////////////////////////////////////
        // check middle of triple color
        return getBandKeyColor(bandID, false);
      default:
        // value is between index-1 and index
        let color1 = this.#keyArray[bandID - 1].getRightKeyColor(this.interpolationSpace);
        let color2 = this.#keyArray[bandID].getLeftKeyColor(this.interpolationSpace);

        if (color1 == undefined) {
          //////////////////////////////////////////
          /////////      Constant Band     /////////
          //////////////////////////////////////////
          if (space === this.interpolationSpace) return color2;
          workColor.setColorJSON(color2);
          return workColor.getColorJSON(space);
        } else {
          //////////////////////////////////////////
          /////////       Scaled Band      /////////
          //////////////////////////////////////////
          if (this.#deltaColors[bandID].length > 0) {
            /////////////////////////////////////////
            ///// In this case we have delta colors (Interpolation ds-de94 or ds-de2000)
            /////////////////////////////////////////
            let index = this.#deltaColors[bandID].findIndex(function (deltaColor) {
              return deltaColor[1] >= val; // find the first key with the reference value smaller than the searched value (or equal)
            });
            // value is between index-1 and index
            let deltaColor1 = this.#deltaColors[bandID][index - 1][0];
            let deltaColor2 = this.#deltaColors[bandID][index][0];
            linearInterpolation;
          } else {
            switch (key) {
              case "linear":
                linearInterpolation;
                break;
              case "spline":
                break;
            }
          }
        }

        break;
    }

    return this.getNaNColor(space);

    /*let newColorValues = undefined;
    if (this.getSupportColorsLength(bandID) > 0) {
      if (val > this.keyArray[bandID].getRefPosition() && val <= this.getSupportColorRef(bandID, 0)) {
        let leftRef = this.keyArray[bandID].getRefPosition();
        let rightRef = this.getSupportColorRef(bandID, 0);
        let supportColor2 = this.getSupportColor(bandID, 0, this.interpolationSpace);
        let tmpRatio = (val - leftRef) / (rightRef - leftRef);
        newColorValues = calcGradientLinear(color1[1], color1[2], color1[3], supportColor2[1], supportColor2[2], supportColor2[3], tmpRatio);
      } else if (val > this.getSupportColorRef(bandID, this.getSupportColorsLength(bandID) - 1) && val < this.keyArray[bandID + 1].getRefPosition()) {
        let leftRef = this.getSupportColorRef(bandID, this.getSupportColorsLength(bandID) - 1);
        let rightRef = this.keyArray[bandID + 1].getRefPosition();
        let supportColor1 = this.getSupportColor(bandID, this.getSupportColorsLength(bandID) - 1, this.interpolationSpace);
        let tmpRatio = (val - leftRef) / (rightRef - leftRef);
        newColorValues = calcGradientLinear(supportColor1[1], supportColor1[2], supportColor1[3], color2[1], color2[2], color2[3], tmpRatio);
      } else {
        for (let j = 0; j < this.getSupportColorsLength(bandID) - 1; j++) {
          if (val > this.getSupportColorRef(bandID, j) && val <= this.getSupportColorRef(bandID, j + 1)) {
            let leftRef = this.getSupportColorRef(bandID, j);
            let rightRef = this.getSupportColorRef(bandID, j + 1);
            let supportColor1 = this.getSupportColor(bandID, j, this.interpolationSpace);
            let supportColor2 = this.getSupportColor(bandID, j + 1, this.interpolationSpace);
            let tmpRatio = (val - leftRef) / (rightRef - leftRef);
            newColorValues = calcGradientLinear(supportColor1[1], supportColor1[2], supportColor1[3], supportColor2[1], supportColor2[2], supportColor2[3], tmpRatio);
          }
        }
      }
    } else {
      let leftRef = this.keyArray[bandID].getRefPosition();
      let rightRef = this.keyArray[bandID + 1].getRefPosition();
      let tmpRatio = (val - leftRef) / (rightRef - leftRef);
      newColorValues = calcGradientLinear(color1[1], color1[2], color1[3], color2[1], color2[2], color2[3], tmpRatio);
    }

    if (space === this.interpolationSpace) return [this.interpolationSpace, newColorValues[0], newColorValues[1], newColorValues[2]];
    gWorkColor1.updateColor(this.interpolationSpace, newColorValues[0], newColorValues[1], newColorValues[2]);
    return gWorkColor1.getColorInfo(space);*/
  }

  //
  static getBandKeyColor(bandID, isStartKey) {
    // static method, only call able inside this class => proofed input
    var keyIndex = isStartKey ? bandID : bandID + 1;
    switch (this.keyArray[keyIndex].getKeyType()) {
      case "nil":
        return this.#keyArray[keyIndex + 1].getLeftKeyColor(space);
      case "left":
        // if not static, we would have to check if the
        return this.#keyArray[keyIndex].getMoT() ? this.#keyArray[keyIndex + 1].getLeftKeyColor(space) : this.#keyArray[keyIndex].getLeftKeyColor(space);
      case "twin":
        return this.#keyArray[index].getMoT() ? this.#keyArray[index].getRightKeyColor(space) : this.#keyArray[index].getLeftKeyColor(space);
      //case "right":
      // if not static we should check if isStartKey=true, because right keys are alway at the first key of a CMS
      // return this.#keyArray[index].getRightKeyColor(space);
      default:
        return this.#keyArray[index].getRightKeyColor(space);
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
  /*searchForContinuousSections(startKey, endKey) {
    let continuousSections = [];
    let beforeConstant = false;
    //let startKey = 0;
    if (this.getKeyType(startKey) === "twin" || this.getKeyType(startKey) === "left") beforeConstant = true;

    for (let i = startKey; i <= endKey; i++) {
      switch (this.getKeyType(i)) {
        case "nil":
          beforeConstant = true;
          break;
        case "left":
          if (!beforeConstant) {
            let tmpStart = startKey;
            let tmpEnd = i;
            continuousSections.push([tmpStart, tmpEnd]);
          }
          startKey = i;
          beforeConstant = true;
          break;
        case "twin":
          if (!beforeConstant) {
            let tmpStart = startKey;
            let tmpEnd = i;
            continuousSections.push([tmpStart, tmpEnd]);
          }
          startKey = i;
          beforeConstant = false;
          break;
        default:
          if (beforeConstant) {
            startKey = i;
            beforeConstant = false;
          } else {
            if (i == endKey) {
              let tmpStart = startKey;
              let tmpEnd = i;
              continuousSections.push([tmpStart, tmpEnd]);
            }
          }
      }
    }

    return continuousSections;
  }

  calcReverse() {
    if (this.keyArray.length < 2) return;

    let tmpKeyArray = [];
    let startPos = this.keyArray[0].getRefPosition();
    let endPos = this.keyArray[this.keyArray.length - 1].getRefPosition();

    for (let i = 0; i < this.keyArray.length; i++) {
      //
      if ((this.keyArray[i].getKeyType() === "nil key" || this.keyArray[i].getKeyType() === "left key") && i != this.keyArray.length - 1) {
        this.keyArray[i].setRightKeyColor(this.keyArray[i + 1].getLeftKeyColor("lab"));
        this.keyArray[i + 1].setLeftKeyColor(undefined);
      }

      let newPos = startPos + (endPos - this.keyArray[i].getRefPosition());

      let tmpColor = this.keyArray[i].getLeftKeyColor("lab");
      this.keyArray[i].setLeftKeyColor(this.keyArray[i].getRightKeyColor("lab"));
      this.keyArray[i].setRightKeyColor(tmpColor);

      tmpKeyArray.splice(0, 0, this.getKeyClone(i));
      tmpKeyArray[0].setRefPosition(newPos);
    }

    for (let i = this.keyArray.length - 1; i >= 0; i--) {
      this.keyArray[i].deleteReferences();
      this.keyArray[i] = null;
    }
    this.keyArray = tmpKeyArray;

    this.updateSupportColors();
  }

  setAutoRange(newStart, newEnd) {
    let currentStart = this.keyArray[0].getRefPosition();
    let currentdistance = this.keyArray[this.keyArray.length - 1].getRefPosition() - currentStart;
    let newDistance = newEnd - newStart;

    for (let i = 0; i < this.keyArray.length; i++) {
      let ratio = (this.keyArray[i].getRefPosition() - currentStart) / currentdistance;
      let newPos = newStart + ratio * newDistance;
      this.keyArray[i].setRefPosition(newPos);
    }
    this.updateSupportColors();
  }

  equalKeyIntervals() {
    if (this.keyArray.length > 2) {
      let equalDis = Math.abs(this.keyArray[this.keyArray.length - 1].getRefPosition() - this.keyArray[0].getRefPosition()) / (this.keyArray.length - 1);
      for (let i = 1; i < this.keyArray.length - 1; i++) {
        this.keyArray[i].setRefPosition(this.keyArray[0].getRefPosition() + i * equalDis);
      }
    }
    this.updateSupportColors();
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

  insertCMS(cmsInfoPackage, insertIndex) {
    if (this.getKeyLength() == 0) return;

    let cmsDis = cmsInfoPackage[6][cmsInfoPackage[6].length - 1][2] - cmsInfoPackage[6][0][2];

    switch (insertIndex) {
      case this.getKeyLength() - 1:
        // case scaled band
        let tmpVal = this.getRefPosition(insertIndex);
        let dist = Math.abs(tmpVal - this.getRefPosition(insertIndex - 1)) * 0.5;
        let startPos = tmpVal - dist;

        this.setRefPosition(insertIndex, startPos);
        this.setRightKeyColor(insertIndex, cmsInfoPackage[6][0][1]); // cmsInfoPackage[6][0][1] = right color of first key

        for (let i = 1; i < cmsInfoPackage[6].length; i++) {
          let ratio = (cmsInfoPackage[6][i][2] - cmsInfoPackage[6][i - 1][2]) / cmsDis;
          startPos = startPos + dist * ratio;

          if (i == cmsInfoPackage[6].length - 1) this.pushKey(new class_Key(cmsInfoPackage[6][i][0], cmsInfoPackage[6][i][1], tmpVal, cmsInfoPackage[6][i][3], cmsInfoPackage[6][i][4]));
          else this.pushKey(new class_Key(cmsInfoPackage[6][i][0], cmsInfoPackage[6][i][1], startPos, cmsInfoPackage[6][i][3], cmsInfoPackage[6][i][4]));
        }
        break;

      default:
        let startPos = this.getRefPosition(insertIndex);
        let dist = Math.abs(this.getRefPosition(insertIndex + 1) - startPos) * 0.5;
        let endPos = startPos + dist;

        this.setRefPosition(insertIndex, endPos);
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
   ***************************************** INTERPOLATION ******************************************
   **************************************************************************************************
   *************************************************************************************************/

  /*getInterpolationType() {
    return this.#interpolationType;
  }

  getInterpolationSpace() {
    return this.interpolationSpace;
  }

  getSplineColors(keyIndex) {
    // no interpolation needed for constand bands
    if (this.getKeyType(keyIndex) == "nil key" || this.getKeyType(keyIndex) == "left key") return [undefined, undefined, undefined, undefined];

    if (this.interpolationSpace == "de94" || this.interpolationSpace == "de2000") return [undefined, undefined, undefined, undefined];

    let existingC1 = true;
    let existingC3 = true;

    if (this.getKeyType(keyIndex) == "right key" || this.getKeyType(keyIndex) == "twin key") {
      existingC1 = false;
    }

    if (this.getKeyType(keyIndex + 1) == "left key" || this.getKeyType(keyIndex + 1) == "twin key" || keyIndex + 1 == this.keyArray.length - 1) {
      // this.keyArray.length-1 is alwas a left key. For the push creation this don't have to be.
      existingC3 = false;
    }

    let c0 = undefined; //
    let c1 = undefined; //
    let c2 = undefined; //
    let c3 = undefined; //

    c1 = this.getRightKeyColor(keyIndex, this.interpolationSpace);

    c2 = this.getLeftKeyColor(keyIndex + 1, this.interpolationSpace);

    if (!existingC1) {
      c0 = ["rgb", 0, 0, 0]; // every value is zero and has no influence
    } else c0 = this.getRightKeyColor(keyIndex - 1, this.interpolationSpace);

    if (!existingC3) {
      c3 = ["rgb", 0, 0, 0]; // every value is zero and has no influence
    } else {
      c3 = this.getLeftKeyColor(keyIndex + 2, this.interpolationSpace);
    }

    return [c0, c1, c2, c3];
  }*/

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
  }

  getLeftKeyColor(index, colorspace) {
    return this.keyArray[index].getLeftKeyColor(colorspace);
  }

  getRightKeyColor(index, colorspace) {
    return this.keyArray[index].getRightKeyColor(colorspace);
  }

  getKeyType(index) {
    if (this.keyArray[index] == undefined) {
      return undefined;
    } else return this.keyArray[index].getKeyType();
  }

  getMoT(index) {
    return this.keyArray[index].getMoT();
  }

  setMoT(index, mot) {
    this.keyArray[index].setMoT(mot);
  }

  insertKey(index, key) {
    this.keyArray.splice(index, 0, key);
  }

  addKey(key) {
    // find position
    let index = undefined;
    let ref = key.getRefPosition();

    for (let i = 1; i < this.keyArray.length; i++) {
      if (ref > this.keyArray[i - 1].getRefPosition() && ref < this.keyArray[i].getRefPosition()) {
        index = i;
        break;
      }
    }

    if (index != undefined) {
      this.keyArray.splice(index, 0, key);
      this.supportColors.splice(index, 0, []);
      this.pathplotWorkColors.splice(index, 0, []);
      this.analysisWorkColors.splice(index, 0, []);
      this.exportWorkColors.splice(index, 0, []);
      this.updateKeySurroundingSupportColors(index);
    }
  }

  pushKey(key) {
    this.keyArray.push(key);

    if (this.keyArray.length > 1) {
      this.supportColors.push([]);
      this.pathplotWorkColors.push([]);
      this.analysisWorkColors.push([]);
      this.exportWorkColors.push([]);
      this.calcBandSupportColors(this.keyArray.length - 2);

      if (this.interpolationType === "spline") {
        if (this.keyArray.length - 3 >= 0) {
          if (this.keyArray[this.keyArray.length - 2].getKeyType() === "dual key") {
            this.calcBandSupportColors(this.keyArray.length - 3);
            if (this.keyArray.length - 4 >= 0) {
              if (this.keyArray[this.keyArray.length - 3].getKeyType() === "dual key") this.calcBandSupportColors(this.keyArray.length - 4);
            }
          }
        }
      }
    }
  }

  getBur(index) {
    return this.keyArray[index].getBur();
  }

  setBur(index, newBurs) {
    this.keyArray[index].setBur(newBurs);
  }

  deleteBand(index) {
    let tmpRightColor = this.keyArray[index + 1].getRightKeyColor("lab");
    this.keyArray[index].setRightKeyColor(tmpRightColor);
    this.deleteKey(index + 1);
  }*/

  /**************************************************************************************************
   **************************************************************************************************
   *****************************************   Set & Get   ******************************************
   **************************************************************************************************
   *************************************************************************************************/

  /*getRefRange() {
    if (this.#keyArray.length > 1) {
      return this.#keyArray[this.#keyArray.length - 1].getRefPosition() - this.#keyArray[0].getRefPosition();
    } else {
      return 0;
    }
  }

  getRefPosition(index) {
    if (index < 0 || index >= this.#keyArray.length) return undefined;

    return this.#keyArray[index].getRefPosition();
  }

  getColormapName() {
    return this.name;
  }

  getNaNColor(colorspace) {
    gWorkColor1.autoRGBClipping = true;
    gWorkColor1.setColorInfo(this.colorNaN);
    return gWorkColor1.getColorInfo(colorspace);
  }

  getBelowColor(colorspace) {
    gWorkColor1.autoRGBClipping = true;
    gWorkColor1.setColorInfo(this.colorBelow);
    return gWorkColor1.getColorInfo(colorspace);
  }

  getAboveColor(colorspace) {
    gWorkColor1.autoRGBClipping = true;
    gWorkColor1.setColorInfo(this.colorAbove);
    return gWorkColor1.getColorInfo(colorspace);
  }

  getOpacityVal(index, side) {
    return this.keyArray[index].getOpacityVal(side);
  }

  setInterpolationType(type) {
    this.interpolationType = type;
    this.updateSupportColors(); // new interpolationType => supportColors need to be updated
  }

  setRefPosition(index, ref) {
    this.keyArray[index].setRefPosition(ref);

    this.updateKeySurroundingSupportColors(index);

    if (index != 0) this.updateKeySurroundingSupportColors(index - 1);
  }

  setInterpolationSpace(space) {
    this.interpolationSpace = space;
    this.updateSupportColors(); // new interpolationSpace => supportColors need to be updateKeySurroundingSupportColors
  }

  setColormapName(newName) {
    this.name = newName;
  }

  setNaNColor(colorInfo) {
    if (colorInfo == undefined) return;
    this.colorNaN = colorInfo;
  }

  setBelowColor(colorInfo) {
    if (colorInfo == undefined) return;

    this.colorBelow = colorInfo;
  }

  setAboveColor(colorInfo) {
    if (colorInfo == undefined) return;

    this.colorAbove = colorInfo;
  }

  setOpacityVal(index, val, side) {
    this.keyArray[index].setOpacityVal(val, side);
  }*/
} // End Class Color

////////////////////////////////////////////////////
//-------------- Private Functions --------------//
///////////////////////////////////////////////////
// Private function, which should only called with prooved parameters

///////////////////////////////////////////////////
module.exports = {
  CMS: CMS,
};
