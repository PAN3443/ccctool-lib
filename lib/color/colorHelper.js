//////////////////////////////////////////////
//////////////      HEADER      //////////////
//////////////////////////////////////////////
// File :: Color Helpers
// Author :: Pascal Nardini
// License :: MIT

//////////////////////////////////////////////
//////////////////////////////////////////////

const { Color } = require("./class_Color.js");
const { checkColorSpaceNotation, isColorJSON, checkMathResult, isMathVector_3D } = require("../helper/guardClauses.js");

const workColor = new Color("rgb", 0, 0, 0);

exports.equalColors = (_colorJSON1, _colorJSON2) => {
  if (!isColorJSON(_colorJSON1)) throw new Error('\tError (Color Helper) :: Function "equalColors" :: Input colorJSON1 is not a colorJSON!');
  if (!isColorJSON(_colorJSON2)) throw new Error('\tError (Color Helper) :: Function "equalColors" :: Input colorJSON2 is not a colorJSON!');
  if (_colorJSON1.space !== _colorJSON2.space) throw new Error('\tError (Color Helper) :: Function "equalColors" :: Incorrect Input! The colorJSON1 and colorJSON2 do not have the same colorspace!');

  if (checkMathResult(_colorJSON1.c1, _colorJSON2.c1) && checkMathResult(_colorJSON1.c2, _colorJSON2.c2) && checkMathResult(_colorJSON1.c3, _colorJSON2.c3)) return true;
  else return false;
};

exports.getRandomColor = (_space) => {
  let space = checkColorSpaceNotation(_space, false);
  if (!space[0]) throw new TypeError('Error (Color Helper) :: Function "getRandomColor" :: Unknown Colorspace.');
  console.log(123);
  // random function need to be included
};

exports.colorToVector = (_colorJSON) => {
  if (!isColorJSON(_colorJSON)) throw new Error('\tError (Color Helper) :: Function "colorToVector" :: Input colorJSON is not a colorJSON!');
  return [_colorJSON.c1, _colorJSON.c2, _colorJSON.c3];
};

exports.vectorToColor = (_vec, _space) => {
  let space = checkColorSpaceNotation(_space, false);
  if (!space[0]) throw new TypeError('Error (Color Helper) :: Function "vectorToColor" :: Unknown Colorspace.');
  if (!isMathVector_3D(_vec)) throw new Error('\tError (Color Helper) :: Function "vectorToColor" :: Input vec is not a vector or rather a vector with the length 3)!');
  return { space: space[0], c1: _vec[0], c2: _vec[1], c3: _vec[2] };
};

exports.updateColorToSpace = (_colorJSON, _space) => {
  let space = checkColorSpaceNotation(_space, false);
  if (!space[0]) throw new TypeError('Error (Color Helper) :: Function "updateColorToSpace" :: Unknown Colorspace.');
  if (!isColorJSON(_colorJSON)) throw new Error('\tError (Color Helper) :: Function "updateColorToSpace" :: Input colorJSON is not a colorJSON!');

  if (_colorJSON.space === space[1]) return _colorJSON;
  workColor.setColorJSON(_colorJSON);
  return workColor.getColorJSON(_space);
};
