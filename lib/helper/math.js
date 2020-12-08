//////////////////////////////////////////////
//////////////      HEADER      //////////////
//////////////////////////////////////////////
// File :: Math Functions
// Author :: Pascal Nardini
// License :: MIT

//////////////////////////////////////////////
//////////////////////////////////////////////

const { isMathMatrix, isMathVector, isNumber } = require("../helper/guardClauses.js");

//////////////////////////////////////////////////////////
//////////////             Vector           //////////////
//////////////////////////////////////////////////////////

exports.vecScalMulti = (_v, _s) => {
  let result = copyVector(_v);
  for (let i = 0; i < result.length; i++) {
    result[i] = result[i] * _s;
  }
  return result;
};

exports.vec_Divi = (_v, _s) => {
  let result = [];
  for (let i = 0; i < _v.length; i++) {
    result.push(_v[i] / _s);
  }
  return result;
};

exports.vec_Diff = (_v1, _v2) => {
  if (_v1.length != v2.length) return undefined;
  let result = [];

  for (let i = 0; i < _v1.length; i++) {
    result.push(_v1[i] - _v2[i]);
  }
  return result;
};

exports.vec_Add = (_v1, _v2) => {
  if (_v1.length != _v2.length) return undefined;

  let result = [];

  for (let i = 0; i < _v1.length; i++) {
    result.push(_v1[i] + _v2[i]);
  }
  return result;
};

exports.vec_Dot = (_v1, _v2) => {
  if (_v1.length != _v2.length) return undefined;
  let result = 0;

  for (let i = 0; i < _v1.length; i++) {
    result += _v1[i] * _v2[i];
  }
  return result;
};

exports.vec_Cross = (_v1, _v2) => {
  if (_v1.length != 3 || _v2.length != 3) return undefined;

  let result = [undefined, undefined, undefined];
  result[0] = _v1[1] * _v2[2] - _v1[2] * _v2[1];
  result[1] = _v1[0] * _v2[2] - _v1[2] * _v2[0];
  result[2] = _v1[0] * _v2[1] - _v1[1] * _v2[0];
  return result;
};

exports.vecNorm = (_v) => {
  let result = copyVector(_v);
  if (vecLength(_v) != 0) {
    let tmp = 1 / vecLength(_v);
    for (let i = 0; i < result.length; i++) {
      result[i] = result[i] * tmp;
    }
    return result;
  }
  return result; // vector is [0,0,....];
};

exports.vecLength = (_v) => {
  let sum = 0;
  for (let i = 0; i < _v.length; i++) {
    sum += Math.pow(_v[i], 2);
  }
  return Math.sqrt(sum);
};

exports.vec_Distance = (_v1, _v2) => {
  if (_v1.length == _v2.length) {
    let sum = 0;
    for (let i = 0; i < _v1.length; i++) {
      sum += Math.pow(_v2[i] - _v1[i], 2);
    }
    return Math.sqrt(sum);
  }
  return undefined;
};

//////////////////////////////////////////////////////////
//////////////      Matrix Calculation      //////////////
//////////////////////////////////////////////////////////

// matrix * matrix multiplication
exports.mXm = (_m1, _m2) => {
  isMathMatrix(_m1); // throw error if not
  isMathMatrix(_m2); // throw error if not
  let m1NumRows = _m1.length,
    m1NumCols = _m1[0].length,
    m2NumRows = _m2.length,
    m2NumCols = _m2[0].length,
    mResult = new Array(m1NumRows);

  if (m1NumCols != m2NumRows) {
    throw new TypeError('Error (math) :: exports."mXm" :: m1 matrix column size and m2 matrix row size are not equal.');
  }

  for (let r = 0; r < m1NumRows; r++) {
    mResult[r] = new Array(m2NumCols);
    for (let c = 0; c < m2NumCols; c++) {
      mResult[r][c] = 0;
      for (let i = 0; i < m1NumCols; i++) {
        mResult[r][c] += _m1[r][i] * _m2[i][c];
      }
    }
  }

  return mResult;

  /*let result = new Array(m1.length).fill(0).map(row => new Array(m2[0].length).fill(0));
      return result.map((row, i) => {
          return row.map((val, j) => {
              return m1[i].reduce((sum, elm, k) => sum + (elm*m2[k][j]) ,0)
          })
    })*/
};

// matrix * vector multiplication
exports.mXv = (_m, _v) => {
  isMathMatrix(_m); // throw error if not
  isMathVector(_v); // throw error if not
  let m1NumRows = _m.length,
    m1NumCols = _m[0].length,
    vNumRows = _v.length,
    mResult = new Array(m1NumRows).fill(0);

  if (m1NumCols != vNumRows) {
    throw new TypeError('Error (math) :: exports."mXv" :: Matrix column size and vector size are not equal.');
  }

  for (let r = 0; r < m1NumRows; r++) {
    for (let c = 0; c < m1NumCols; c++) {
      mResult[r] += _m[r][c] * _v[c];
    }
  }

  return mResult;
};

// invert 3x3 matrix
exports.invert3x3 = (_m) => {
  isMathMatrix(_m); // throw error if not
  let det = this.determinant(_m);

  if (det == 0) throw new TypeError('Error (math) :: exports."invert3x3" :: matrix determinant is null.');
  //if (det < 1e-2) throw new TypeError('Error (math) :: exports."invert3x3" :: matrix determinant is null.');

  let invdet = 1.0 / det;
  let matrix_Inv = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];

  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 3; x++) {
      matrix_Inv[y][x] = determinantOfMinor(x, y, _m) * invdet;

      if (1 == (x + y) % 2) matrix_Inv[y][x] = -1 * matrix_Inv[y][x];
    }
  }

  return matrix_Inv;
};

exports.determinant = (_m) => {
  isMathMatrix(_m); // throw error if not
  return _m[0][0] * determinantOfMinor(0, 0, _m) - _m[0][1] * determinantOfMinor(0, 1, _m) + _m[0][2] * determinantOfMinor(0, 2, _m);
};

///////////////////////////////////////////////////////////////////

// Inverse Algorithm based on Guassian elimination from http://blog.acipo.com/matrix-inversion-in-javascript/
// Returns the inverse of matrix `M`.
exports.matrix_invert = (_m) => {
  // I use Guassian Elimination to calculate the inverse:
  // (1) 'augment' the matrix (left) by the identity (on the right)
  // (2) Turn the matrix on the left into the identity by elemetry row ops
  // (3) The matrix on the right is the inverse (was the identity matrix)
  // There are 3 elemtary row ops: (I combine b and c in my code)
  // (a) Swap 2 rows
  // (b) Multiply a row by a scalar
  // (c) Add 2 rows

  //if the matrix isn't square: exit (error)
  if (_m.length !== _m[0].length) {
    return;
  }

  //create the identity matrix (I), and a copy (C) of the original
  let i = 0,
    ii = 0,
    j = 0,
    dim = _m.length,
    e = 0,
    t = 0;
  let identityM = [],
    copyM = [];
  for (i = 0; i < dim; i += 1) {
    // Create the row
    identityM[identityM.length] = [];
    copyM[copyM.length] = [];
    for (j = 0; j < dim; j += 1) {
      //if we're on the diagonal, put a 1 (for identity)
      if (i == j) {
        identityM[i][j] = 1;
      } else {
        identityM[i][j] = 0;
      }

      // Also, make the copy of the original
      copyM[i][j] = _m[i][j];
    }
  }

  // Perform elementary row operations
  for (i = 0; i < dim; i += 1) {
    // get the element e on the diagonal
    e = copyM[i][i];

    // if we have a 0 on the diagonal (we'll need to swap with a lower row)
    if (e == 0) {
      //look through every row below the i'th row
      for (ii = i + 1; ii < dim; ii += 1) {
        //if the ii'th row has a non-0 in the i'th col
        if (copyM[ii][i] != 0) {
          //it would make the diagonal have a non-0 so swap it
          for (j = 0; j < dim; j++) {
            e = copyM[i][j]; //temp store i'th row
            copyM[i][j] = copyM[ii][j]; //replace i'th row by ii'th
            copyM[ii][j] = e; //repace ii'th by temp
            e = identityM[i][j]; //temp store i'th row
            identityM[i][j] = identityM[ii][j]; //replace i'th row by ii'th
            identityM[ii][j] = e; //repace ii'th by temp
          }
          //don't bother checking other rows since we've swapped
          break;
        }
      }
      //get the new diagonal
      e = copyM[i][i];
      //if it's still 0, not invertable (error)
      if (e == 0) {
        return;
      }
    }

    // Scale this row down by e (so we have a 1 on the diagonal)
    for (j = 0; j < dim; j++) {
      copyM[i][j] = copyM[i][j] / e; //apply to original matrix
      identityM[i][j] = identityM[i][j] / e; //apply to identity
    }

    // Subtract this row (scaled appropriately for each row) from ALL of
    // the other rows so that there will be 0's in this column in the
    // rows above and below this one
    for (ii = 0; ii < dim; ii++) {
      // Only apply to other rows (we want a 1 on the diagonal)
      if (ii == i) {
        continue;
      }

      // We want to change this element to 0
      e = copyM[ii][i];

      // Subtract (the row above(or below) scaled by e) from (the
      // current row) but start at the i'th column and assume all the
      // stuff left of diagonal is 0 (which it should be if we made this
      // algorithm correctly)
      for (j = 0; j < dim; j++) {
        copyM[ii][j] -= e * copyM[i][j]; //apply to original matrix
        identityM[ii][j] -= e * identityM[i][j]; //apply to identity
      }
    }
  }

  //we've done all operations, C should be the identity
  //matrix I should be the inverse:
  return identityM;
};

//////////////////////////////////////////////////////////
//////////////             Radial           //////////////
//////////////////////////////////////////////////////////

exports.deg2rad = (_degree) => {
  if (!isNumber(_degree)) throw new TypeError('Error (math) :: exports."deg2rad" :: Incorrect input! The parameter "degree" need be a number');
  return (_degree / 180) * Math.PI;
};

exports.rad2deg = (_rad) => {
  if (!isNumber(_rad)) throw new TypeError('Error (math) :: exports."rad2deg" :: Incorrect is not a number');
  return (_rad * 180) / Math.PI;
};

exports.atan2_360Degree = (_x, _y) => {
  if (!isNumber(_x)) throw new TypeError('Error (math) :: exports."atan2_360Degree" :: Incorrect is not a number');
  if (!isNumber(_y)) throw new TypeError('Error (math) :: exports."atan2_360Degree" :: Incorrect is not a number');
  let tmpRad = Math.atan2(_y, _x);
  if (tmpRad < 0) tmpRad = 2 * Math.PI + tmpRad;
  return this.rad2deg(tmpRad);
};

exports.degree360ToRad = (_degree) => {
  if (!isNumber(_degree)) throw new TypeError('Error (math) :: exports."degree360ToRad" :: Incorrect is not a number');
  if (_degree > 180) _degree = _degree - 360;
  return this.deg2rad(_degree);
};

//////////////////////////////////////////////////////////
//////////////             Other            //////////////
//////////////////////////////////////////////////////////

exports.getRatio = (_min, _max, _value) => {
  if (!isNumber(_min)) throw new TypeError('Error (math) :: exports."getRatio" :: Incorrect input! The parameter "min" need be a number');
  if (!isNumber(_max)) throw new TypeError('Error (math) :: exports."getRatio" :: Incorrect input! The parameter "max" need be a number');
  if (_min < _max) throw new TypeError('Error (math) :: exports."getRatio" :: Incorrect input! The parameter "max" need be a larger than "min"!');
  if (!isNumber(value)) throw new TypeError('Error (math) :: exports."getRatio" :: Incorrect input! The parameter "value" need be a number');
  if (_value < _min) throw new TypeError('Error (math) :: exports."getRatio" :: Incorrect input! The parameter "value" need be a larger than "min"!');
  if (_value > _max) throw new TypeError('Error (math) :: exports."getRatio" :: Incorrect input! The parameter "value" need be a smaller than "max"!');
  return Math.abs(_value - _min) / Math.abs(_max - _min);
};

/*
exports.sum = (...theArgs) => {
  return theArgs.reduce((previous, current) => {
    return previous + current;
  });
}

exports.sumArray = (array) => {
  let sum = 0;
  for (let i = 0; i < array.length; i++) {
    sum +=  array[i];
  }
  return sum;
}

exports.midnightFormula(a,b,c){


  let results = [];
  let discriminant = Math.pow(b,2) - (4*a*c);

  if(discriminant>0){
    // Roots are real and different
    results.push((-b + Math.sqrt(discriminant)) / (2*a));
    results.push((-b - Math.sqrt(discriminant)) / (2*a));
  }
  else if(discriminant==0){
    // Roots are real and same
    results.push((-b + Math.sqrt(discriminant)) / (2*a));
  }
  else{
    // Roots are complex and different
    //let realPart = -b/(2*a);
    //let imaginaryPart = Math.sqrt(-discriminant)/(2*a);

  }

  return results;

}
*/

//////////////////////////////////////////////////
///////////////////  Private  ////////////////////
//////////////////////////////////////////////////
function determinantOfMinor(_yPos, _xPos, _m) {
  let x1, x2, y1, y2;

  if (_xPos == 0) x1 = 1;
  else x1 = 0;

  if (_xPos == 2) x2 = 1;
  else x2 = 2;

  if (_yPos == 0) y1 = 1;
  else y1 = 0;

  if (_yPos == 2) y2 = 1;
  else y2 = 2;

  return _m[y1][x1] * _m[y2][x2] - _m[y1][x2] * _m[y2][x1];
}

function copyVector(_v) {
  var result = [];
  for (var i = 0; i < _v.length; i++) {
    result.push(_v[i]);
  }
  return result;
}
