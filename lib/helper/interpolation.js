import { isMathVector_3D, isNumber, numInRange } from "../helper/guardClauses.js";
import { vec_Diff, vec_Add, vecScalMulti } from "../helper/math.js";

/**************************************************************************************************
 **************************************************************************************************
 *  Function    : linearInterpolation = (_start, _end, _ratio) => {
 *  Description : just a linear interpolation.
 **************************************************************************************************
 *************************************************************************************************/
export const linearInterpolation = (_start, _end, _ratio) => {
  if (!isNumber(_ratio)) throw new TypeError('Error (Interpolation) :: Function "linearInterpolation" :: Incorrect input! The ratio parameter need to be a number');

  if (!numInRange(_ratio, 0.0, 1.0, true, true)) throw new TypeError('Error (Interpolation) :: Function "linearInterpolation" :: Incorrect input! The "ratio" parameter need to be a number between 0 and 1!');

  if (!isMathVector_3D(_start)) throw new TypeError('Error (Interpolation) :: Function "linearInterpolation" :: Incorrect input! The "start" parameter need to be a vector with 3 entries!');

  if (!isMathVector_3D(_end)) throw new TypeError('Error (Interpolation) :: Function "linearInterpolation" :: Incorrect input! The "end" parameter need to be a vector with 3 entries!');

  return vec_Add(_start, vecScalMulti(vec_Diff(_end, _start), _ratio));
};

/**************************************************************************************************
 **************************************************************************************************
 *  Function    : export const linearInterpolation = (_start, _end, _ratio) => {
 *  Description : Implementation of the CATMULL ROM Splines
 **************************************************************************************************
 *************************************************************************************************/

export const splineInterpolation = (v0, v1, v2, v3, t_val, curvescale) => {
  if (!isNumber(t_val)) throw new TypeError('Error (Interpolation) :: Function "splineInterpolation" :: Incorrect input! The "t_val" parameter need to be a number');
  if (!numInRange(t_val, 0.0, 1.0, true, true)) throw new TypeError('Error (Interpolation) :: Function "splineInterpolation" :: Incorrect input! The "t_val" parameter need to be a number between 0 and 1!');

  if (curvescale == undefined) curvescale = 1;
  if (!isNumber(curvescale)) throw new TypeError('Error (Interpolation) :: Function "splineInterpolation" :: Incorrect input! The "curvescale" parameter need to be a number');
  if (!numInRange(curvescale, 0.0, 1.0, true, true)) throw new TypeError('Error (Interpolation) :: Function "splineInterpolation" :: Incorrect input! The "curvescale" parameter need to be a number between 0 and 1!');

  if (!isMathVector_3D(v0)) throw new TypeError('Error (Interpolation) :: Function "splineInterpolation" :: Incorrect input! The "v4" parameter need to be a vector with 3 entries!');
  if (!isMathVector_3D(v1)) throw new TypeError('Error (Interpolation) :: Function "splineInterpolation" :: Incorrect input! The "v1" parameter need to be a vector with 3 entries!');
  if (!isMathVector_3D(v2)) throw new TypeError('Error (Interpolation) :: Function "splineInterpolation" :: Incorrect input! The "v2" parameter need to be a vector with 3 entries!');
  if (!isMathVector_3D(v3)) throw new TypeError('Error (Interpolation) :: Function "splineInterpolation" :: Incorrect input! The "v3" parameter need to be a vector with 3 entries!');

  let t = t_val;
  let tt = Math.pow(t, 2);
  let ttt = Math.pow(t, 3);

  let influenceFactorP0 = (-ttt + 2.0 * tt - t) * curvescale; // f(x)=-x^3+2x^2-x
  let influenceFactorP1 = 3.0 * ttt - 5.0 * tt + 2.0; // f(x)=3x^3-5x^2+2
  let influenceFactorP2 = -3.0 * ttt + 4.0 * tt + t; // f(x)=-3x^3+4x^2+x
  let influenceFactorP3 = (ttt - tt) * curvescale; // f(x)=x^3-x^2

  return [
    0.5 * (v0[0] * influenceFactorP0 + v1[0] * influenceFactorP1 + v2[0] * influenceFactorP2 + v3[0] * influenceFactorP3),
    0.5 * (v0[1] * influenceFactorP0 + v1[1] * influenceFactorP1 + v2[1] * influenceFactorP2 + v3[1] * influenceFactorP3),
    0.5 * (v0[2] * influenceFactorP0 + v1[2] * influenceFactorP1 + v2[2] * influenceFactorP2 + v3[2] * influenceFactorP3),
  ]; // half of  the values because influence factor P1 and P2 are between 0 and 2. and we want to have 0,1
};
