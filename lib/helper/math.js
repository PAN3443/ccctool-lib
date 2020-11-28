//////////////////////////////////////////////
//////////////      HEADER      //////////////
//////////////////////////////////////////////
// File :: Math Functions
// Author :: Pascal Nardini
// License :: MIT

//////////////////////////////////////////////
//////////////////////////////////////////////

// matrix * matrix multiplication
exports.mXm = (m1, m2) => {
  let m1NumRows = m1.length,
    m1NumCols = m1[0].length,
    //m2NumRows = m2.length,
    m2NumCols = m2[0].length,
    mResult = new Array(m1NumRows);

  for (var r = 0; r < m1NumRows; r++) {
    mResult[r] = new Array(m2NumCols);
    for (var c = 0; c < m2NumCols; c++) {
      mResult[r][c] = 0;
      for (var i = 0; i < m1NumCols; i++) {
        mResult[r][c] += m1[r][i] * m2[i][c];
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
exports.mXv = (m, v) => {
  let m1NumRows = m.length,
    m1NumCols = m[0].length,
    vNumRows = v.length,
    mResult = new Array(m1NumRows).fill(0);

  if (m1NumCols != vNumRows) {
    throw new TypeError('Error (math) :: Function "mXv" :: Matrix column size and vector size are not equal.');
  }

  for (var r = 0; r < m1NumRows; r++) {
    for (var c = 0; c < m1NumCols; c++) {
      mResult[r] += m[r][c] * v[c];
    }
  }

  return mResult;
};

// invert 3x3 matrix
exports.invert3x3 = (m) => {
  let det = this.determinant(m);

  if (det < 1e-2)
    //if(det==0)
    return undefined;

  let invdet = 1.0 / det;
  let matrix_Inv = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];

  for (var y = 0; y < 3; y++) {
    for (var x = 0; x < 3; x++) {
      matrix_Inv[y][x] = this.determinantOfMinor(x, y, m) * invdet;

      if (1 == (x + y) % 2) matrix_Inv[y][x] = -1 * matrix_Inv[y][x];
    }
  }

  return matrix_Inv;
};

exports.determinant = (m) => {
  return m[0][0] * this.determinantOfMinor(0, 0, m) - m[0][1] * this.determinantOfMinor(0, 1, m) + m[0][2] * this.determinantOfMinor(0, 2, m);
};

exports.determinantOfMinor = (yPos, xPos, m) => {
  let x1, x2, y1, y2;

  if (xPos == 0) x1 = 1;
  else x1 = 0;

  if (xPos == 2) x2 = 1;
  else x2 = 2;

  if (yPos == 0) y1 = 1;
  else y1 = 0;

  if (yPos == 2) y2 = 1;
  else y2 = 2;

  return m[y1][x1] * m[y2][x2] - m[y1][x2] * m[y2][x1];
};

///////////////////////////////////////////////////////////////////

// Inverse Algorithm based on Guassian elimination from http://blog.acipo.com/matrix-inversion-in-javascript/
// Returns the inverse of matrix `M`.
exports.matrix_invert = (m) => {
  // I use Guassian Elimination to calculate the inverse:
  // (1) 'augment' the matrix (left) by the identity (on the right)
  // (2) Turn the matrix on the left into the identity by elemetry row ops
  // (3) The matrix on the right is the inverse (was the identity matrix)
  // There are 3 elemtary row ops: (I combine b and c in my code)
  // (a) Swap 2 rows
  // (b) Multiply a row by a scalar
  // (c) Add 2 rows

  //if the matrix isn't square: exit (error)
  if (m.length !== m[0].length) {
    return;
  }

  //create the identity matrix (I), and a copy (C) of the original
  let i = 0,
    ii = 0,
    j = 0,
    dim = m.length,
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
      copyM[i][j] = m[i][j];
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
