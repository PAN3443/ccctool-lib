const { CMS } = require("./class_cms.js");
const { KeyCMS } = require("./class_cmsKey.js");
const { equalColors } = require("../color/colorHelper.js");

module.exports = {
  cmsParser_JSON: function (jsonString) {
    let jsonObj = JSON.parse(jsonString);
    let name = "Loaded Colormap";

    const parsedCMS = new CMS();
    switch (true) {
      case "isCMS" in jsonObj:
        parsedCMS.setByJSON(jsonObj);
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

        if (jsonObj[0][pointName].length == 0) return parsedCMS;

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
          parsedCMS.setCMSName(jsonObj[0].Name);
        }

        if (cSpace == undefined) return parsedCMS;
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
          parsedCMS.addKey(keys[0]);
          parsedCMS.addKey(keys[keys.length - 1]);
          for (let i = 1; i < keys.length - 1; i++) parsedCMS.addKey(keys[i]);
        }

        if (hasNaNColor) {
          let val1 = parseFloat(jsonObj[0].NanColor[0]) / val1_RatioFactor;
          let val2 = parseFloat(jsonObj[0].NanColor[1]) / val2_RatioFactor;
          let val3 = parseFloat(jsonObj[0].NanColor[2]) / val3_RatioFactor;
          parsedCMS.setNaNColor({ space: cSpace, c1: val1, c2: val2, c3: val3 });
        }

        if (hasAboveColor) {
          let val1 = parseFloat(jsonObj[0].AboveColor[0]) / val1_RatioFactor;
          let val2 = parseFloat(jsonObj[0].AboveColor[1]) / val2_RatioFactor;
          let val3 = parseFloat(jsonObj[0].AboveColor[2]) / val3_RatioFactor;
          parsedCMS.setAboveColor({ space: cSpace, c1: val1, c2: val2, c3: val3 });
        }

        if (hasBelowColor) {
          let val1 = parseFloat(jsonObj[0].BelowColor[0]) / val1_RatioFactor;
          let val2 = parseFloat(jsonObj[0].BelowColor[1]) / val2_RatioFactor;
          let val3 = parseFloat(jsonObj[0].BelowColor[2]) / val3_RatioFactor;
          parsedCMS.setBelowColor({ space: cSpace, c1: val1, c2: val2, c3: val3 });
        }
    }

    return parsedCMS;
  },

  cmsParser_XML: function (xmlString) {
    const parsedCMS = new CMS();

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
          console.error('Error (cmsParser) :: Function "cmsParser_XML" :: Incorrect colorspace!');
          return parsedCMS;
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
        parsedCMS.addKey(keys[0]);
        parsedCMS.addKey(keys[keys.length - 1]);
        for (let i = 1; i < keys.length - 1; i++) {
          parsedCMS.addKey(keys[i]);
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

        if (tmpProbeSet.getProbeLength() != 0) parsedCMS.addProbeSet(tmpProbeSet);
      }

      //console.log(parsedCMS.getProbeLength());*/

      /////////////////// till here new probe set information

      if (colormapObject[0].hasAttribute("name")) parsedCMS.setCMSName(colormapObject[0].getAttribute("name"));

      if (colormapObject[0].hasAttribute("interpolationspace")) parsedCMS.setInterpolationSpace(colormapObject[0].getAttribute("interpolationspace"));

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

        parsedCMS.setNaNColor({ space: cSpace, c1: val1, c2: val2, c3: val3 });
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

        parsedCMS.setAboveColor({ space: cSpace, c1: val1, c2: val2, c3: val3 });
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

        parsedCMS.setBelowColor({ space: cSpace, c1: val1, c2: val2, c3: val3 });
      }
    }

    return parsedCMS;
  },

  cmsParser_CSV: function (_csvString) {
    let csvlines = _csvString.split("\n");
    const parsedCMS = new CMS();

    if (csvlines.length == 0) return parsedCMS;

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
        return parsedCMS;
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
      parsedCMS.addKey(keys[0]);
      parsedCMS.addKey(keys[keys.length - 1]);
      for (let i = 1; i < keys.length - 1; i++) parsedCMS.addKey(keys[i]);
    }

    let firstLineElements = csvlines[0].split(/[;,]+/);
    // NAN
    if (firstLineElements.length > 13) {
      let val1 = parseFloat(firstLineElements[9]) / val1_RatioFactor;
      let val2 = parseFloat(firstLineElements[11]) / val2_RatioFactor;
      let val3 = parseFloat(firstLineElements[13]) / val3_RatioFactor;
      parsedCMS.setNaNColor({ space: cSpace, c1: val1, c2: val2, c3: val3 });
    }
    // Above
    if (firstLineElements.length > 20) {
      let val1 = parseFloat(firstLineElements[16]) / val1_RatioFactor;
      let val2 = parseFloat(firstLineElements[18]) / val2_RatioFactor;
      let val3 = parseFloat(firstLineElements[20]) / val3_RatioFactor;
      parsedCMS.setAboveColor({ space: cSpace, c1: val1, c2: val2, c3: val3 });
    }
    // Below
    if (firstLineElements.length > 27) {
      let val1 = parseFloat(firstLineElements[23]) / val1_RatioFactor;
      let val2 = parseFloat(firstLineElements[25]) / val2_RatioFactor;
      let val3 = parseFloat(firstLineElements[27]) / val3_RatioFactor;
      parsedCMS.setBelowColor({ space: cSpace, c1: val1, c2: val2, c3: val3 });
    }

    return parsedCMS;
  },
};

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
