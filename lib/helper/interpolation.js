//////////////////////////////////////////////
//////////////      HEADER      //////////////
//////////////////////////////////////////////
// File :: Interpolation Functions
// Author :: Pascal Nardini
// License :: MIT

//////////////////////////////////////////////
//////////////////////////////////////////////
const { isMathVector, isNumber } = require("../helper/guardClauses.js");
const {} = require("../helper/math.js");

exports.linearInterpolation = (start, end, ratio) => {
  if (!isNumber(ratio)) throw new TypeError('Error (Interpolation) :: Function "linearInterpolation" :: Incorrect is not a number');

  if (!numInRange(ratio, 0.0, 1.0, true, true)) isMathVector(start); // throw error if not
  isMathVector(end); // throw error if not
};
