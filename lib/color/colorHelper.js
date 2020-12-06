const { checkColorSpaceNotation, isColorJSON, checkMathResult } = require("../helper/guardClauses.js");

module.exports = {
  equalColors: function (colorJSON1, colorJSON2) {
    if (!isColorJSON(colorJSON1)) throw new Error('\tError :: Color Helper :: Function "equalColors" :: Input colorJSON1 is not a colorJSON!');
    if (!isColorJSON(colorJSON2)) throw new Error('\tError :: Color Helper :: Function "equalColors" :: Input colorJSON2 is not a colorJSON!');
    if (colorJSON1.space !== colorJSON2.space) throw new Error('\tError :: Color Helper :: Function "equalColors" :: Incorrect Input! The colorJSON1 and colorJSON2 do not have the same colorspace!');

    if (checkMathResult(colorJSON1.c1, colorJSON2.c1) && checkMathResult(colorJSON1.c2, colorJSON2.c2) && checkMathResult(colorJSON1.c3, colorJSON2.c3)) return true;
    else return false;
  },

  getRandomColor: function (space) {
    // calc 3D Euclidean Distance
    console.log(123);
    /*try {
          
        } catch (e) {
          console.error('\tError :: CCC_Color :: Function "hsv2rgb" ::', e.message);
          throw new Error('\tError :: CCC_Color :: Function "hsv2rgb" :: No Output');
        }*/
  },
};
