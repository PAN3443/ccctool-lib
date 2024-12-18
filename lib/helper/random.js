import { isNumber } from "../helper/guardClauses.js";

export const randomArbitrary = (_min, _max) => {
  if (!isNumber(_min)) throw new TypeError('Error (random) :: "randomArbitrary" :: _min need to be a number.');
  if (!isNumber(_max)) throw new TypeError('Error (random) :: "randomArbitrary" :: _max need to be a number.');
  if (_min >= _max) throw new TypeError('Error (random) :: "randomArbitrary" :: _min need to be smaller than _max.');
  return Math.random() * (_max - _min) + _min;
};

export const randomInt = (_min, _max) => {
  if (!isNumber(_min)) throw new TypeError('Error (random) :: "randomInt" :: _min need to be a number.');
  if (!isNumber(_max)) throw new TypeError('Error (random) :: "randomInt" :: _max need to be a number.');
  if (_min >= _max) throw new TypeError('Error (random) :: "randomInt" :: _min need to be smaller than _max.');
  _min = Math.ceil(_min);
  _max = Math.floor(_max);
  return Math.floor(Math.random() * (_max - _min + 1)) + _min; //The maximum is inclusive and the minimum is inclusive
};

// gausian/normal distribution (with Box-Muller transformation)
export const randomBoxMuller = () => {
  var u = 0;
  var v = 0;
  while (u === 0) u = Math.random(); // without 0
  while (v === 0) v = Math.random(); // without 0

  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
};

export const randomBeta = () => {
  return rand_beta(0);
};

export const randomBetaLeft = () => {
  return rand_beta(1);
};

export const randomBetaRight = () => {
  return rand_beta(2);
};

function rand_beta(type) {
  var rand = Math.random();
  var betaRand = Math.pow(Math.sin((rand * Math.PI) / 2.0), 2.0);
  switch (type) {
    case 0:
      return betaRand;
      break;
    case 1:
      // Beta Left
      var betaRandLeft = undefined;
      if (betaRand < 0.5) betaRandLeft = 2 * betaRand;
      else betaRandLeft = 2 * (1 - betaRand);
      return betaRandLeft;
    case 2:
      // Beta Right
      var betaRandRight = undefined;
      if (betaRand > 0.5) betaRandRight = 2 * betaRand - 1;
      else betaRandRight = 2 * (1 - betaRand) - 1;
      return betaRandRight;
  }
}
