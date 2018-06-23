/**
 * Javascript Matrix Abstractions
 * Author : Sergey Ivanov
 */

// Prototype shared by all 
// matrix types
var MatProto = {
  /**
   * Standard matrix-multiplication
   */
  'mul' : (function(o){
    //test if matrices can even multiply
    if (this.cols != o.rows)
      throw "Error, Incompatible Dimensions";
    M = Matrix(this.rows,o.cols);
    for (let r=1; r<=this.rows; ++r){
      for (let c=1; c<=o.cols; ++c){
        let val=0;
        for (let i=1; i<=this.cols; ++i){
          val += this.at(r,i)*o.at(i,c);
        }
        M.set(r,c,val);
      }
    }
    return M;
  }),

  /**
   * Perform pairwise element multiplication,
   * only for matrices of equal size.
   * Returns a new matrix.
   */
  'eleWise' : (function(o, binop){
    //test if matrices can even multiply
    if (this.rows != o.rows || this.cols != o.cols)
      throw "Error, eleWise matrix dimensions must be equivalent";

    M = Matrix(this.rows, this.cols);
    for (let i=0; i<this.size; ++i){
      M.data[i] = binop(this.data[i],o.data[i]);
    }

    return M;
  }),

  /**
   * Create a sub-matrix
   */
  'subMat' : (function(sr,sc,rs,cs){

    //only first two arguments passed = start from top-left
    if (rs == undefined && cs == undefined){
      if (sr < 1 || sc < 1 || sr > this.rows || sc > this.cols)
        throw "Error, invalid arguments to subMat"
      //simple sub-matrix
      M = Matrix(sr,sc);
      for (let r=1; r<=sr; ++r){
        for (let c=1; c<=sc; ++c){
          M.set(r,c,this.at(r,c));
        }
      }
    } else {  //submatrix with starting, ending point
      if (sr < 1 || sc < 1 || rs < 1 || cs < 1 ||
        sr + rs > this.rows || sc + cs > this.cols)
        throw "Error, invalid arguments to start-end subMat"
      M = Matrix(rs,cs);
      for (let r=0; r<rs; ++r){
        for (let c=0; c<cs; ++c){
          M.set(r+1,c+1,this.at(sr+r,sc+c));
        }
      }
    }
    return M;
  }),

  /**
   * Calculate the determinant
   */
  'det' : (function(){
    if (this.rows != this.cols)
      throw "Error, cannot compute determinant as matrix is not square";

  }),

  /**
   * Return the transpose
   */
  'tpose' : (function(){
    M = Matrix(this.cols,this.rows);
    for (let r=1; r<=this.rows; ++r){
      for (let c=1; c<=this.cols; ++c){
        M.set(c,r,this.at(r,c));
      }
    }
    return M;
  }),

  /**
   * Returns a scaled Matrix
   */
  'scale' : (function(c){
    M = Matrix(this.rows,this.cols);
    M.data = this.data.slice();
    for (let i=0; i<this.size; ++i){
      M.data[i] *= c;
    }
    return M;
  }),

  /**
   * Return the element at (row,col)
   */
  'at' : (function(row, col){
    let pos = (row-1)*this.cols + col-1;
    if (pos < 0 || row > this.rows || col > this.cols)
      throw "Invalid row,col bounds";
    return this.data[pos];
  }),

  /**
   * Sets the element at (row,col)
   */
  'set' : (function(row, col, val){
    let pos = (row-1)*this.cols + col-1;
    if (pos < 0 || row > this.rows || col > this.cols)
      throw "Invalid row,col bounds";
    this.data[pos] = val;
  }),

  /**
   * Add two matrices together
   */
  'add' : (function(o){
    return this.eleWise(o,function(a,b){ return a+b; });
  }),

  /**
   * Subtract a matrix from the current one,
   * returns a new matrix
   */
  'sub' : (function(o){
    return this.eleWise(o,function(a,b){ return a-b; });
  }),

  /**
   * Get a row vector
   */
  'getrow' : (function(rownum){
    if (rownum < 1 || rownum > this.rows)
      throw "Invalid row selected";
    M = Matrix(1, this.cols);
    for ( let i=1; i<=this.cols; ++i){
      Matrix.set(1,i,this.at(rownum,col));
    }
  }),

  /**
   * Get a column vector
   */
  'getcol' : (function(colnum){
    if (colnum < 1 || colnum > this.cols)
      throw "Invalid row selected";
    M = Matrix(this.rows, 1);
    let offset = colnum-1;
    for ( let i=1; i<=this.rows; ++i){
      Matrix.set(i,1,this.at(i,colnum));
    }
  }),
}

function Matrix(row, col){
  var self = Object.create(MatProto);
  self.rows = row;
  self.cols = col;
  self.size = row*col;
  self.data = new Array(self.size);
  return self;
}

function XRotMat(degree){
  degree *= Math.PI/180;
  M = Matrix(3,3);
  let S = Math.sin(degree);
  let C = Math.cos(degree);
  M.set(1,1,1); M.set(1,2,0); M.set(1,3, 0);
  M.set(2,1,0); M.set(2,2,C); M.set(2,3,-S);
  M.set(3,1,0); M.set(3,2,S); M.set(3,3, C);
  return M;
}

function YRotMat(degree){
  degree *= Math.PI/180;
  M = Matrix(3,3);
  let S = Math.sin(degree);
  let C = Math.cos(degree);
  M.set(1,1,C);  M.set(1,2,0); M.set(1,3,S);
  M.set(2,1,0);  M.set(2,2,1); M.set(2,3,0);
  M.set(3,1,-S); M.set(3,2,0); M.set(3,3,C);
  return M;
}

function ZRotMat(degree){
  degree *= Math.PI/180;
  M = Matrix(3,3);
  let S = Math.sin(degree);
  let C = Math.cos(degree);
  M.set(1,1,C); M.set(1,2,-S); M.set(1,3,0);
  M.set(2,1,S); M.set(2,2, C); M.set(2,3,0);
  M.set(3,1,0); M.set(3,2,0);  M.set(3,3,1);
  return M;
}

function gRotMat(vector,degree){
  degree *= Math.PI/180;
  let S = Math.sin(degree);
  let C = Math.cos(degree);
  let nS = 1-S
  let nC = 1-C
  let x = vector.at(1,1);
  let y = vector.at(2,1);
  let z = vector.at(3,1);
  M = Matrix(3,3);
  M.set(1,1,C+x*x*nC);   M.set(1,2,x*y*nS-z*S); M.set(1,3,x*z*nC+y*S);
  M.set(2,1,y*x*nC+z*S); M.set(2,2,C+y*y*nC);   M.set(2,3,y*z*nC-x*S);
  M.set(3,1,z*x*nC-y*S); M.set(3,2,z*y*nC+x*S); M.set(3,3,C+z*z*nC);
  return M;
}

function makeVector(){
  if (arguments.length < 1)
    throw "Error, no arguments passed to makeVector";
  M = Matrix(arguments.length,1);
  for (let i=0; i<arguments.length; ++i){
    M.set(i+1,1,arguments[i]);
  }
  return M;
}

function scaleMat(){
  if (arguments.length < 1)
    throw "Error, no arguments passed to makeVector";
  M = Matrix(arguments.length, arguments.length);
  M.data.fill(0);
  for (let i=0; i<arguments.length; ++i){
    M.set(i+1,i+1,arguments[i]);
  }
  return M;
}

/** 
 * Exposed interface for matrix lib
 */

var Mat = {
  'rotx'   : (XRotMat),
  'roty'   : (YRotMat),
  'rotz'   : (ZRotMat),
  'rotg'   : (gRotMat),
  'vec'    : (makeVector),
  'scale'  : (scaleMat),
}



/**
 * Convenient vector wrapper interface
 */

function vec3(){};

vec3.create = function(a,b,c) {
  return Mat.vec(a,b,c);
}

vec3.dot = function(a, b) {
  return (a.data[0]*b.data[0]+a.data[1]*b.data[1]+a.data[2]*b.data[2]);
}

vec3.cross = function(a,b){
  var out = Matrix(3,1);

  out.data[0] = a.data[1]*b.data[2] - a.data[2]*b.data[1];
  out.data[1] = a.data[2]*b.data[0] - a.data[0]*b.data[2];
  out.data[2] = a.data[0]*b.data[1] - a.data[1]*b.data[0];

  return out;
}

vec3.scale = function(a,s){
  return vec3.create(a.data[0]*s, a.data[1]*s, a.data[2]*s);
}

vec3.multiply = function(a,b){
  return a.eleWise(b,function(a,b){ return a*b; });
}

vec3.add = function(a,b){
    return a.add(b);
}

vec3.subtract = function(a,b){
  return a.sub(b);
}

vec3.size = function(a){
  return (Math.sqrt(a.data[0]*a.data[0]+a.data[1]*a.data[1]+a.data[2]*a.data[2]));
}

vec3.normalize = function(a){
  var out = Matrix(3,1);
  var size = vec3.size(a);
  out.data[0] = a.data[0] / size;
  out.data[1] = a.data[1] / size;
  out.data[2] = a.data[2] / size;
  return out;
}
