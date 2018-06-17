function sleep(ms){
  return new Promise(resolve => setTimeout(resolve,ms));
}

function isAlphaNum(ch){
  if (!(ch > 47 && ch < 58) && // numeric (0-9)
    !(ch > 64 && ch < 91) && // upper alpha (A-Z)
    !(ch > 96 && ch < 123))  // lower alpha (a-z)
    return false;

  return true;
}

function wordCruncher(strn){
  this.strn = strn;
  this.pos = 0;
  this.curWord = '';
}

wordCruncher.prototype.peek = function(){
  if (this.pos+1 <this.strn.length){
    return this.strn[this.pos+1];
  } else {
    return 'EOF';
  }
}

wordCruncher.prototype.next = function(){
  this.curWord = '';
  if (this.pos >= this.strn.length)
    return 'EOF';
  //am I in a word
  if (isAlphaNum(this.strn.charCodeAt(this.pos))){
    //go until no longer alpha numeric
    while (this.pos < this.strn.length &&
      isAlphaNum(this.strn.charCodeAt(this.pos))){

      this.curWord += this.strn[this.pos];
      this.pos += 1;
    }
  } else if ( this.strn[this.pos] == '/' && this.peek() == '/'){
    this.curWord = '//';
    this.pos += 2;
  } else if ( this.strn[this.pos] == '/' && this.peek() == '*'){
    this.curWord = '/*';
    this.pos += 2;
  } else if ( this.strn[this.pos] == '*' && this.peek() == '/'){
    this.curWord = '*/';
    this.pos += 2;
  } else if (!isAlphaNum(this.strn[this.pos])){
    this.curWord += this.strn[this.pos];
    this.pos += 1;
  } else if (this.strn[this.pos] == ' '){
    while(this.pos < this.length && this.strn[this.pos] == ' '){
      this.curWord += this.strn[this.pos];
      this.pos += 1;
    }
  } else{
    this.curWord += this.strn[this.pos];
    this.pos += 1;
  }
}

wordCruncher.prototype.word = function(){
  return this.curWord;
}

async function demo1(cobj,width,height,strngz){
  //demo that just prints out code? I can't do highlighting so probably not...
  //sure, let's try it with some basic highlighting, let's take the revision-based approach

  //basic logic: for each line in a string, get the next word(printing whitespace)
  // if word is in a keyword, print it with the fg/bg value associated with that specific keyword set
  var keywords1 = ['function','var','{','}','[',']','(',')']; //bright blue
  var keywords2 = ['while','if','else','elseif']; //yellow
  var keywords3 = ['document','window','this']; //super red
  var tknDelims1 = ['\'','\"']; //purp
  var tknDelims2 = ['//']; //faded blue
  var tknDelims3 = ['/*','*/']; //faded blue
  var defb='rgb(30,30,30)';
  var deff='rgb(140,140,140)';
  var hls=['#34E2E2','rgb(30,30,30)','#FFFF33','#666600','#FF4C4C','#000000','#885EAD','rgb(30,30,30)','#879eb0','rgb(30,30,30)']; //fg1,bg1,fg2,bg2,etc...
  var sleepval=49;

  for (var i=0; i<strngz.length; i += 1){
    var strng = strngz[i];
    let wordConsumer = new wordCruncher(strng);
    while (wordConsumer.word() != 'EOF'){
      var cur = wordConsumer.word();
      if (keywords1.includes(cur)){
        cobj.set_fg(hls[0]);
        cobj.set_bg(hls[1]);
        cobj.addstr(cur);
        wordConsumer.next();
      } else if (keywords2.includes(cur)){
        cobj.set_fg(hls[2]);
        cobj.set_bg(hls[3]);
        cobj.addstr(cur);
        wordConsumer.next();
      } else if (keywords3.includes(cur)){
        cobj.set_fg(hls[4]);
        cobj.set_bg(hls[5]);
        cobj.addstr(cur);
        wordConsumer.next();
      } else if (tknDelims1.includes(cur)){ //look for same next str delim
        cobj.set_fg(hls[6]);
        cobj.set_bg(hls[7]);
        var ayy = cur;
        cobj.addstr(ayy);
        wordConsumer.next();
        while (wordConsumer.word() != ayy && wordConsumer.word() != 'EOF'){
          cobj.addstr(wordConsumer.word());
          wordConsumer.next();
          cobj.refresh();
          await sleep(sleepval);
        }
        cobj.addstr(wordConsumer.word());  //seen other delim
        cobj.refresh();
        await sleep(sleepval);
        wordConsumer.next();
      } else if (tknDelims2.includes(cur)){ //comment
        cobj.set_fg(hls[8]);
        cobj.set_bg(hls[9]);
        cobj.addstr(cur);
        wordConsumer.next();
        while (wordConsumer.word() != "\n" && wordConsumer.word != 'EOF'){
          cobj.addstr(wordConsumer.word());
          wordConsumer.next();
          cobj.refresh();
          await sleep(sleepval);
        }
      } else if (cur == tknDelims3[0]){
        cobj.set_fg(hls[8]);
        cobj.set_bg(hls[9]);
        cobj.addstr(cur);
        wordConsumer.next();
        while (wordConsumer.word() != tknDelims3[1] && wordConsumer.word != 'EOF'){
          cobj.addstr(wordConsumer.word());
          wordConsumer.next();
          cobj.refresh();
          await sleep(sleepval);
        }
        cobj.addstr(wordConsumer.word());
        wordConsumer.next();
      }else {  //normal
        cobj.set_fg(deff);
        cobj.set_bg(defb);
        cobj.addstr(cur);
        wordConsumer.next();
      }
      if (cobj.nextPage == true){
        cobj.clear()
      }
      cobj.refresh();
      await sleep(sleepval);
    }
    if (i == strngz.length - 1)
      i=0;
  }
}


// ==== DEMO2 BEGIN ====
var CubeRot = [1,1];
var Center  = [450,450];

function draw2Dline(cursObj,x1,y1,x2,y2,c){
  deltax = Math.abs(x2 - x1);        // The difference between the x's
  deltay = Math.abs(y2 - y1);        // The difference between the y's
  x = x1;                       // Start x off at the first pixel
  y = y1;                       // Start y off at the first pixel

  if (x2 >= x1)                 // The x-values are increasing
  {
    xinc1 = 1;
    xinc2 = 1;
  }
  else                          // The x-values are decreasing
  {
    xinc1 = -1;
    xinc2 = -1
  }

  if (y2 >= y1)                 // The y-values are increasing
  {
    yinc1 = 1;
    yinc2 = 1;
  }
  else                          // The y-values are decreasing
  {
    yinc1 = -1;
    yinc2 = -1;
  }

  if (deltax >= deltay)         // There is at least one x-value for every y-value
  {
    xinc1 = 0;                  // Don't change the x when numerator >= denominator
    yinc2 = 0;                  // Don't change the y for every iteration
    den = deltax;
    num = deltax / 2;
    numadd = deltay;
    numpixels = deltax;         // There are more x-values than y-values
  }
  else                          // There is at least one y-value for every x-value
  {
    xinc2 = 0;                  // Don't change the x for every iteration
    yinc1 = 0;                  // Don't change the y when numerator >= denominator
    den = deltay;
    num = deltay / 2;
    numadd = deltax;
    numpixels = deltay;         // There are more y-values than x-values
  }

  for (curpixel = 0; curpixel <= numpixels; curpixel++)
  {
    cursObj.mvaddch(y,x,'%');      // Draw the current pixel
    num += numadd;              // Increase the numerator by the top of the fraction
    if (num >= den)             // Check if numerator >= denominator
    {
      num -= den;               // Calculate the new numerator value
      x += xinc1;               // Change the x as appropriate
      y += yinc1;               // Change the y as appropriate
    }
    x += xinc2;                 // Change the x as appropriate
    y += yinc2;                 // Change the y as appropriate
  }
}

function draw3Dline(cursObj,a,b,rot){
  var xRot = CubeRot[0];
  var yRot = CubeRot[1];
  var scrX1 = 0;
  var scrY1 = 0;
  var scrX2 = 0;
  var scrY2 = 0;

  var rotX1 = 0;
  var rotY1 = 0;
  var rotZ1 = 0;
  var rotX2 = 0;
  var rotY2 = 0;
  var rotZ2 = 0;

  // 3D rotation:
  let u = rot.mul(a);
  let v = rot.mul(b);

  // Convert to 2D line:

  scrX1 = Math.round(u.data[0] + Center[0]);
  scrY1 = Math.round(u.data[1] + Center[1]);
  scrX2 = Math.round(v.data[0] + Center[0]);
  scrY2 = Math.round(v.data[1] + Center[1]);

  /// ...and draw it!
  draw2Dline(cursObj,scrX1,scrY1,scrX2,scrY2);
}

var cubeMesh = [
vec3.create( 1, 1, 1),
vec3.create( 1, 1,-1),
vec3.create( 1,-1, 1),
vec3.create( 1,-1,-1),
vec3.create(-1, 1, 1),
vec3.create(-1, 1,-1),
vec3.create(-1,-1, 1),
vec3.create(-1,-1,-1),
]

var cubeInds = [
0,1,
0,2,
0,4,
3,1,
3,2,
3,7,
6,2,
6,4,
6,7,
5,4,
5,1,
5,7,
]

var tetraHedronMesh = [
vec3.create( 1, 1, 0),
vec3.create(-1, 1, 0),
vec3.create( 0,-1,-1),
vec3.create( 0,-1, 1),
]

var tetraHedronInds = [
0,1,
0,2,
0,3,
1,2,
1,3,
2,3,
]

async function demo2(cobj,width,height){
    cobj.clear();
  //demo that showcases rotating cubes
  //base the inner circle around the max height(slightly smaller),and the inner circle around min(width,height,max(width,height)*3/5
  //we can cheat here, since we're using cubes we only need to define radius and rotations for each cube
  //orientation: z-axis = towards you, y-axis = up, x-axis = right

  var sleeptime=70;
  Center = [Math.round(width/2), Math.round(height/2)];
  //var innerR = Math.min(width,height)/4.5;
  //var outerR = Math.max(width,height)/3.3;
  var innerR = Math.min(width,height)/4.5;
  var outerR = Math.max(width,height)/3.35;
  //var middleR = innerR*.6 + outerR*.4;
  while(true){
    CubeRot[0] += 1.71; //x-rot
    CubeRot[1] += 2.29;  //y-rot
    cobj.clear();
    let rotation1  = Mat.rotx(CubeRot[0]);
    rotation1 = rotation1.mul(Mat.roty(CubeRot[1]));
    rotation1 = rotation1.mul(Mat.scale(innerR,innerR,innerR));

    CubeRot[0] *= innerR/outerR;
    CubeRot[1] *= innerR/outerR;

    for (let i=0; i<tetraHedronInds.length; i+=2){
        let a = tetraHedronMesh[tetraHedronInds[i]];
        let b = tetraHedronMesh[tetraHedronInds[i+1]];
        draw3Dline(cobj,a,b,rotation1);
    }

    let rotation2  = Mat.rotx(CubeRot[0]);
    rotation2 = rotation2.mul(Mat.roty(CubeRot[1]));
    rotation2 = rotation2.mul(Mat.scale(outerR,outerR,outerR));

    CubeRot[0] *= outerR/innerR;
    CubeRot[1] *= outerR/innerR;

    for (let i=0; i<cubeInds.length; i+=2){
        let a = cubeMesh[cubeInds[i]];
        let b = cubeMesh[cubeInds[i+1]];
        draw3Dline(cobj,a,b,rotation2);
    }

    cobj.refresh();
    await sleep(sleeptime);
  }
}

async function demo3(cobj,width,height){
  //either...
  //interactive demo based on mouse movements
  //or
  //demo based on drops coming form colliding objects
  //or
  //something period and harmonious
}

async function demo4(cobj,width,height){
  //amiga bouncing ball demo
}

window.onload = function(){
  //each obj = 8px wide, 12px high
  var cursObj = Cursify("canv1",120,70);//,"Courier New",8);
  /*
  cursObj.move(1,1);
  cursObj.addstr("8888888888 aycdefg help me pls! to");
  cursObj.mvaddstr(2,1,"aeyou aeyou Aeyou");
  cursObj.set_fg("rgb(200,150,50)");
  cursObj.set_bg("rgb(20,50,50)");
  cursObj.mvaddstr(3,1,"ahhhyAu aeyou Aeyou");
  cursObj.mvaddstr(5,2,"ahhhyAu aeyou Aeyou");
  cursObj.set_fg("rgb(190,190,190)");
  cursObj.set_bg("rgb(30,30,30)");
  cursObj.mvaddstr(6,3,"pls to HELP aeyou Aeyou");
  cursObj.set_fg("rgb(190,150,50)");
  cursObj.set_bg("rgb(20,50,50)");
  cursObj.mvaddstr(7,4,"ERROR -- ERROR -- ERROR -- AHHHH aeyou Aeyou");
  cursObj.set_fg("rgb(200,100,100)");
  cursObj.set_bg("rgb(80,80,80)");
  cursObj.mvaddstr(11,6,"CALL ADMINISTRATOR %%@@!@# CANNyaT COMPUTE");
  cursObj.refresh();
  */
  demo1(cursObj,700,700,[pstr1,pstr2]);
  var co2 = Cursify("canv2",120,70);
  demo2(co2,120,70);
  var co3 = Cursify("canv3",120,70);
  co3.move(1,1);
  co3.addstr("asdjojaoidijsaioajdijsioikojo");
  co3.refresh();
  var co4 = Cursify("canv4",120,45); co4.move(1,1);
  co4.addstr("..!celebration..");
  co4.set_fg("rgb(200,100,100)");
  co4.set_bg("rgb(80,80,80)");
  co4.mvaddstr(3,4, "-- SUCCESS -- ERRCODE 0x9FA23B44");
  co4.refresh();
};

var pstr1 = `
// VECTOR DEFINITION
/**
 * algo_handler root namespace.
 *
 * @nameSpace algo_handler
 */
if (typeof vec3 == "undefined" || !vec3) {
  function vec3(){};
}

vec3.create = function() {
  var out = Array(3);
  out[0]=out[1]=out[2]=0;
  return out;
}

vec3.dot = function(a, b) {
  return (a[0]*b[0]+a[1]*b[1]+a[2]*b[2]);
}

vec3.cross = function(a,b){
  var out = Array(3);

  out[0] = a[1]*b[2] - a[2]*b[1];
  out[1] = a[2]*b[0] - a[0]*b[2];
  out[2] = a[0]*b[1] - a[1]*b[0];

  return out;
}

vec3.scale = function(a,s){
  var out = Array(3);
  out[0] = a[0] * s;
  out[1] = a[1] * s;
  out[2] = a[2] * s;
  return out;
}

vec3.multiply = function(a,b){
  var out = Array(3);
  out[0] *= a[0] * b[0];
  out[1] *= a[1] * b[1];
  out[2] *= a[2] * b[2];
  return out;
}

vec3.add = function(a,b){
  var out = Array(3);
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  return out;
}

vec3.subtract = function(a,b){
  var out = Array(3);
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  return out;
}

vec3.size = function(a){
  return (Math.sqrt(a[0]*a[0]+a[1]*a[1]+a[2]*a[2]));
}

vec3.normalize = function(a){
  var out = Array(3);
  var size = vec3.size(a);
  out[0] = a[0] / size;
  out[1] = a[1] / size;
  out[2] = a[2] / size;
  return out;
}

//RAYTRACE OBJECT DEFINITION



// TODO : Find better places to put these consts
MAX_DISTANCE = Number.MAX_VALUE;   //constant only used as return and compare value when we don't collide with anything
SPHERE_EPSILON = .000000000000001;

//Defining a raytracer object
function Sphere(pos, rad, mats){
  this.position = pos;
  this.radius = rad;
  this.material = mats;
}

//given coordinates on sphere, get normal
Sphere.prototype.getNormal = function(coord){
  return ((coord - this.position)/this.radius);
}

//returns distance of intersectin
Sphere.prototype.testIntersection = function(eye, dir){
  var emc = vec3.subtract(eye,this.position);
  var d_d = vec3.dot(dir,dir);
  var pt1 = Math.pow(vec3.dot(dir, emc),2);
  var pt2 = d_d*(vec3.dot(emc,emc))-this.radius*this.radius;
  var discriminant = pt1 - pt2;
  if (discriminant<0){
    return MAX_DISTANCE;
  }

  t1 = (-(vec3.dot(dir,emc))+Math.sqrt(discriminant))/d_d;
  t2 = (-(vec3.dot(dir,emc))-Math.sqrt(discriminant))/d_d;

  if (t1<SPHERE_EPSILON && t2 < SPHERE_EPSILON){
    return MAX_DISTANCE
  }
  else if ( t1<SPHERE_EPSILON && t2>=SPHERE_EPSILON)
    return (t2)*(vec3.size(dir));
  else if ( t2<SPHERE_EPSILON && t1>=SPHERE_EPSILON)
    return (t1)*(vec3.size(dir));
  else {
    return (vec3.size(dir)*Math.min(t1,t2));
  }

}

//SCENE MANAGEMENT SECTION


//setting up scene
function Scene(entityList, light_list, cameraPos, yfov, forward, up, bgcolor){
  this.entities = entityList;
  this.lights = light_list;
  this.eye = cameraPos;
  this.gaze = vec3.normalize(forward);
  this.background_color = bgcolor;
  this.up = up;
  this.y_fov = yfov;
};


//test collissions with ray and any objects
Scene.prototype.testCollisions = function(eye, dir){
  //TODO : make octree
  var dist = MAX_DISTANCE;
  for (var i=0; i<this.entities.length; i++){
    var d = this.entities[i].testIntersection(eye,dir);
    if (d < dist){
      this.closest = this.entities[i];
      dist=d;
    }
  }
  return dist;
}

//return color given ray
Scene.prototype.rayTrace = function(eye, dir, recursionDepth){
  //could use good data structure here
  var dist = this.testCollisions(eye,dir);
  if (dist == MAX_DISTANCE)
    return (this.background_color);

  var new_pos = vec3.add(eye, vec3.multiply(dir, dist));
  var collide_obj = this.closest;
  var normal = collide_obj.getNormal(new_pos);

  var color = [0,0,0];
  //this is where you can add shading and lighting and stuff
  color = vec3.add(color, collide_obj.material.ambient);

  //TODO : Add diffuse lighting

  //diffuse light
  //for (var i=0; i<this.lights.length; i++){
  //    //see if there is a path to the light
  //}
  //color = vec3.scale(color, 1/Math.max(color[0],color[1],color[2]));  //normalize to make our max color 1
  // TODO : Add specular shading
  return vec3.scale(color, 256);  //multiply color intensities by 256 before returning so its in screen format
}

//ACTUAL SCENE CREATION
//
//Making Spheres and adding it to our entity list
var sphere1 = new Sphere([-5,0,20], 2, {ambient: [1,0,0], specular : [.5, .2, .2]});
var sphere2 = new Sphere([2,0,10],  2, {ambient: [0,1,0], specular : [.2, .5, .25]});
var sphere3 = new Sphere([0,0,15],  2, {ambient: [0,0,1], specular : [.1, .1, .2]});
mySpheres = [sphere1, sphere2, sphere3];

//Making light(s) and adding to light list
var light1 = {pos : [-4, 8, 15], color: [1, 1, 1]}
var light2 = {pos : [8, 10, 30], color: [1, 1, 1]}

lights = [light1, light2];

myScene = new Scene(mySpheres, lights, [0,0,0], 45, [0,0,1], [0,1,0], [15,15,70]);

//SCREEN MANAGEMENT SECTION

//helper function for setting pixel info)
function setPixel(imgDat, x, y, color){
  var index = (x + y * imgDat.width) * 4;
  imgDat.data[index + 0]   =   color[0];   //r
  imgDat.data[index + 1]   =   color[1];   //g
  imgDat.data[index + 2]   =   color[2];   //b
  imgDat.data[index + 3]   =   255;        //a, opaque
}

//main
window.onload = function()
{
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  //stuff
  width  = canvas.width;
  height = canvas.height;
  var gaze  = myScene.gaze;
  var up = myScene.up;
  var fovy = myScene.y_fov*3.1416/180; //from degrees to radians
  var eye = myScene.eye;
  //get other stuff necessary to compute
  var gaze_len = height/(2*Math.tan(fovy/2)); //get length of gaze
  //get unit vectors for left, down, right
  var left  = vec3.cross(up,gaze);
  var right = vec3.cross(gaze,up);
  var down = vec3.scale(up, -1);

  //now compute the top left vector
  var top_left = vec3.add(vec3.add(vec3.scale(up, height/2), vec3.scale(left,width/2)),vec3.scale(gaze,gaze_len));

  //create frame, not really taking advantage of alpha channel atm
  //but could be done by drawing over
  imageData = ctx.createImageData(width, height); //rgba buffer
  for (var x = 0; x < width; x++)
  {
    for (var y = 0; y < height; y++)
    {
      var dir = vec3.add(top_left,vec3.add(vec3.scale(right,x), vec3.scale(down,y)));
      color   = myScene.rayTrace(eye, vec3.normalize(dir), 0);
      setPixel(imageData,x,y,color);
    }
    //console.log(x);
  }

  ctx.putImageData(imageData,0,0);
}
`;

var pstr2 = `
function sleep(ms){
  return new Promise(resolve => setTimeout(resolve,ms));
}

function isAlphaNum(ch){
  if (!(ch > 47 && ch < 58) && // numeric (0-9)
    !(ch > 64 && ch < 91) && // upper alpha (A-Z)
    !(ch > 96 && ch < 123))  // lower alpha (a-z)
    return false;

  return true;
}

function wordCruncher(strn){
  this.strn = strn;
  this.pos = 0;
  this.curWord = '';
}

wordCruncher.prototype.peek = function(){
  if (this.pos+1 <this.strn.length){
    return this.strn[this.pos+1];
  } else {
    return 'EOF';
  }
}

wordCruncher.prototype.next = function(){
  this.curWord = '';
  if (this.pos >= this.strn.length)
    return 'EOF';
  //am I in a word
  if (isAlphaNum(this.strn.charCodeAt(this.pos))){
    //go until no longer alpha numeric
    while (this.pos < this.strn.length &&
      isAlphaNum(this.strn.charCodeAt(this.pos))){

      this.curWord += this.strn[this.pos];
      this.pos += 1;
    }
  } else if ( this.strn[this.pos] == '/' && this.peek() == '/'){
    this.curWord = '//';
    this.pos += 2;
  } else if ( this.strn[this.pos] == '/' && this.peek() == '*'){
    this.curWord = '/*';
    this.pos += 2;
  } else if ( this.strn[this.pos] == '*' && this.peek() == '/'){
    this.curWord = '*/';
    this.pos += 2;
  } else if (!isAlphaNum(this.strn[this.pos])){
    this.curWord += this.strn[this.pos];
    this.pos += 1;
  } else if (this.strn[this.pos] == ' '){
    while(this.pos < this.length && this.strn[this.pos] == ' '){
      this.curWord += this.strn[this.pos];
      this.pos += 1;
    }
  } else{
    this.curWord += this.strn[this.pos];
    this.pos += 1;
  }
}

wordCruncher.prototype.word = function(){
  return this.curWord;
}

async function demo1(cobj,width,height,strng){
  //demo that just prints out code? I can't do highlighting so probably not...
  //sure, let's try it with some basic highlighting, let's take the revision-based approach

  //basic logic: for each line in a string, get the next word(printing whitespace)
  // if word is in a keyword, print it with the fg/bg value associated with that specific keyword set
  var keywords1 = ['function','var','{','}','[',']','(',')']; //bright blue
  var keywords2 = ['while','if','else','elseif']; //yellow
  var keywords3 = ['document','window','this']; //super red
  var tknDelims1 = ['\'','\"']; //purp
  var tknDelims2 = ['//']; //faded blue
  var tknDelims3 = ['/*','*/']; //faded blue
  var defb='rgb(30,30,30)';
  var deff='rgb(140,140,140)';
  var hls=['#34E2E2','rgb(30,30,30)','#FFFF33','#666600','#FF4C4C','#000000','#885EAD','rgb(30,30,30)','#879eb0','rgb(30,30,30)']; //fg1,bg1,fg2,bg2,etc...
  var sleepval=049;

  let wordConsumer = new wordCruncher(strng);
  while (wordConsumer.word() != 'EOF'){
    var cur = wordConsumer.word();
    if (keywords1.includes(cur)){
      cobj.set_fg(hls[0]);
      cobj.set_bg(hls[1]);
      cobj.addstr(cur);
      wordConsumer.next();
    } else if (keywords2.includes(cur)){
      cobj.set_fg(hls[2]);
      cobj.set_bg(hls[3]);
      cobj.addstr(cur);
      wordConsumer.next();
    } else if (keywords3.includes(cur)){
      cobj.set_fg(hls[4]);
      cobj.set_bg(hls[5]);
      cobj.addstr(cur);
      wordConsumer.next();
    } else if (tknDelims1.includes(cur)){ //look for same next str delim
      cobj.set_fg(hls[6]);
      cobj.set_bg(hls[7]);
      var ayy = cur;
      cobj.addstr(ayy);
      wordConsumer.next();
      while (wordConsumer.word() != ayy && wordConsumer.word() != 'EOF'){
        cobj.addstr(wordConsumer.word());
        wordConsumer.next();
        cobj.refresh();
        await sleep(sleepval);
      }
      cobj.addstr(wordConsumer.word());  //seen other delim
      cobj.refresh();
      await sleep(sleepval);
      wordConsumer.next();
    } else if (tknDelims2.includes(cur)){ //comment
      cobj.set_fg(hls[8]);
      cobj.set_bg(hls[9]);
      cobj.addstr(cur);
      wordConsumer.next();
      while (wordConsumer.word() != "\n" && wordConsumer.word != 'EOF'){
        cobj.addstr(wordConsumer.word());
        wordConsumer.next();
        cobj.refresh();
        await sleep(sleepval);
      }
    } else if (cur == tknDelims3[0]){
      cobj.set_fg(hls[8]);
      cobj.set_bg(hls[9]);
      cobj.addstr(cur);
      wordConsumer.next();
      while (wordConsumer.word() != tknDelims3[1] && wordConsumer.word != 'EOF'){
        cobj.addstr(wordConsumer.word());
        wordConsumer.next();
        cobj.refresh();
        await sleep(sleepval);
      }
      cobj.addstr(wordConsumer.word());
      wordConsumer.next();
    }else {  //normal
      cobj.set_fg(deff);
      cobj.set_bg(defb);
      cobj.addstr(cur);
      wordConsumer.next();
    }
    if (cobj.nextPage == true){
      cobj.clear()
    }
    cobj.refresh();
    await sleep(sleepval);
  }
}

//function demo1(cobj,width,height){
//var spheres
//}

async function demo2(cobj,width,height){
  //demo that showcases rotating cubes
  //base the inner circle around the max height(slightly smaller),and the inner circle around min(width,height,max(width,height)*3/5

}

async function demo3(cobj,width,height){
  //either...
  //interactive demo based on mouse movements
  //or
  //demo based on drops coming form colliding objects
  //or
  //something period and harmonious
}

async function demo4(cobj,width,height){
  //amiga bouncing ball demo
}

window.onload = function(){
  //each obj = 8px wide, 12px high
  var cursObj = Cursify("canv1",120,70);//,"Courier New",8);
  /*
  cursObj.move(1,1);
  cursObj.addstr("8888888888 aycdefg help me pls! to");
  cursObj.mvaddstr(2,1,"aeyou aeyou Aeyou");
  cursObj.set_fg("rgb(200,150,50)");
  cursObj.set_bg("rgb(20,50,50)");
  cursObj.mvaddstr(3,1,"ahhhyAu aeyou Aeyou");
  cursObj.mvaddstr(5,2,"ahhhyAu aeyou Aeyou");
  cursObj.set_fg("rgb(190,190,190)");
  cursObj.set_bg("rgb(30,30,30)");
  cursObj.mvaddstr(6,3,"pls to HELP aeyou Aeyou");
  cursObj.set_fg("rgb(190,150,50)");
  cursObj.set_bg("rgb(20,50,50)");
  cursObj.mvaddstr(7,4,"ERROR -- ERROR -- ERROR -- AHHHH aeyou Aeyou");
  cursObj.set_fg("rgb(200,100,100)");
  cursObj.set_bg("rgb(80,80,80)");
  cursObj.mvaddstr(11,6,"CALL ADMINISTRATOR %%@@!@# CANNyaT COMPUTE");
  cursObj.refresh();
  */
  demo1(cursObj,700,700,[pstr1,pstr2]);
  var co2 = Cursify("canv2",120,70);
  demo2(co2,
  var co3 = Cursify("canv3",120,70);
  co3.move(1,1);
  co3.addstr("asdjojaoidijsaioajdijsioikojo");
  co3.refresh();
  var co4 = Cursify("canv4",120,45); co4.move(1,1);
  co4.addstr("..!celebration..");
  co4.set_fg("rgb(200,100,100)");
  co4.set_bg("rgb(80,80,80)");
  co4.mvaddstr(3,4, "-- SUCCESS -- ERRCODE 0x9FA23B44");
  co4.refresh();
};
`;
