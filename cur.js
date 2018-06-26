//Below is performance tweaking hell, read at your own risk
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

  num += numadd;              // Increase the numerator by the top of the fraction
  if (num >= den)             // Check if numerator >= denominator
  {
    num -= den;               // Calculate the new numerator value
    x += xinc1;               // Change the x as appropriate
    y += yinc1;               // Change the y as appropriate
  }
  x += xinc2;                 // Change the x as appropriate
  y += yinc2;                 // Change the y as appropriate

  for (curpixel = 1; curpixel < numpixels; curpixel++)
  {
    //cursObj.mvaddch(y,x,String.fromCharCode(9829));      // Draw the current pixel
    cursObj.mvaddch(y,x,'-');      // Draw the current pixel
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

  scrX1 = Math.round(u.data[0]*1.5 + Center[0]);
  scrY1 = Math.round(u.data[1]     + Center[1]);
  scrX2 = Math.round(v.data[0]*1.5 + Center[0]);
  scrY2 = Math.round(v.data[1]     + Center[1]);

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

  var sleeptime = 50;
  //var hls=['#34E2E2','#FFFF33','#FF4C4C','#885EAD','#879eb0'];
  Center = [Math.round(width/2), Math.round(height/2)];
  //var innerR = Math.min(width,height)/4.5;
  //var outerR = Math.max(width,height)/3.3;
  var innerR = Math.min(width,height)/4.5;
  var outerR = Math.max(width,height)/3.65;
  //var middleR = innerR*.6 + outerR*.4;
  while(true){
    CubeRot[0] += 2; //x-rot
    CubeRot[1] += 3;  //y-rot
    cobj.clear();
    let rotation1  = Mat.rotx(CubeRot[0]);
    rotation1 = rotation1.mul(Mat.roty(CubeRot[1]));
    rotation1 = rotation1.mul(Mat.scale(innerR,innerR,innerR));

    CubeRot[0] *= innerR/outerR;
    CubeRot[1] *= innerR/outerR;

    //cobj.set_fg(hls[2]);
    for (let i=0; i<tetraHedronInds.length; i+=2){
      let a = tetraHedronMesh[tetraHedronInds[i]];
      let b = tetraHedronMesh[tetraHedronInds[i+1]];
      draw3Dline(cobj,a,b,rotation1);
    }

    let rotation2  = Mat.rotx(-(CubeRot[0]/.65));
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


function nextCol(c){
  switch(c){
    case 'rgb(140,140,140)':
      return 'rgb(100,100,256)';
    case 'rgb(100,100,256)':
      return 'rgb(256,230,140)';
    case 'rgb(256,230,140)':
      return 'rgb(236,247,118)';
    case 'rgb(236,247,118)':
      return 'rgb(250,80,80)';
    case 'rgb(250,80,80)':
      return 'rgb(50,255,15)';
  }
}

function addQch(cobj,y,x){
  let c = cobj.getch(y,x);
  if (c[0] == '' || c[0] == undefined){
    cobj.set_fg('rgb(140,140,140');
  } else if (c[0] == ' '){
    cobj.set_fg('rgb(140,140,140)');
  } else {
    cobj.set_fg(nextCol(c[1]));
  }
  cobj.mvaddch(y, x, '%');
}

function cool2Dline(cursObj,y1,x1,y2,x2){
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
    //cursObj.mvaddch(y,x,String.fromCharCode(9829));      // Draw the current pixel
    addQch(cursObj,y,x);      // Draw the current pixel
    num += numadd;              // Increase the numerator by the top of the fraction
    if (num >= den)             // Check if numerator >= denominator
    {
      num -= den;               // Calculate the new numerator value
      x += xinc1;               // Change the x as appropriate
      y += yinc1;               // Change the y as appropriate
    } else {
      x += xinc2;                 // Change the x as appropriate
      y += yinc2;                 // Change the y as appropriate
    }
  }
}

var sins = [];
var coss = [];
for (var i=Math.PI/36; i<=Math.PI/2; i+=Math.PI/36){
	sins.push(Math.sin(i));
	coss.push(Math.cos(i));
}

//new approach with sampling
function drawCircle(cobj,radius, row, col){
  let v1 = Math.floor(row+radius);
  let v2 = Math.floor(row-radius);
  let u1 = Math.floor(col);
  let u2 = Math.floor(col);
  for (var i=0; i<=sins.length; i++){
    let x = sins[i]*radius;
    let y = coss[i]*radius;

    let y1 = Math.floor(row + y);
    let y2 = Math.floor(row - y);
    let x1 = Math.floor(col + x*1.5);
    let x2 = Math.floor(col - x*1.5);
    cool2Dline(cobj,v1,u1,y1,x1);
    cool2Dline(cobj,v2,u1,y2,x1);
    cool2Dline(cobj,v1,u2,y1,x2);
    cool2Dline(cobj,v2,u2,y2,x2);
    v1 = y1;
    v2 = y2;
    u1 = x1;
    u2 = x2;
  }
  cool2Dline(cobj,v1,u2,v2,u2);
  cool2Dline(cobj,v1,u1,v2,u1);
}

function Quake(y,x){
  this.y = y;
  this.x = x;
  this.radius = 2;
}

function getMousePos(helem, evt){
  let rect = helem.getBoundingClientRect();
  return {
    x : (evt.clientX - rect.left)/8,
    y : (evt.clientY - rect.top)/12
  };
}

async function demo3(cobj,width,height,helem){
  cobj.clear();
  var sleeptime = 50;
  let frameNum = 20;
  let spawnTime = 35;
  let quakes = [];

  var lastMove = 0;
  function newQuake(e){
    var pos = getMousePos(helem,e);
    if (Date.now() - lastMove > 550 && pos.y < 840 && pos.y>0 && pos.x > 0 && pos.x < 960){
      quakes.push(new Quake(pos.y,pos.x));
      drawCircle(cobj,1,pos.y,pos.x);
      cobj.refresh();
      lastMove = Date.now();
    }
  }

  function newQuakeTouch(e){
    var pos = getMousePos(helem,e.changedTouches[0]);
    if (Date.now() - lastMove > 550 && pos.y < 840 && pos.y>0 && pos.x > 0 && pos.x < 960){
      quakes.push(new Quake(pos.y,pos.x));
      drawCircle(cobj,1,pos.y,pos.x);
      cobj.refresh();
      lastMove = Date.now();
    }
  }

  window.addEventListener('mousemove',newQuake, false);
  window.addEventListener('touchstart',newQuakeTouch, false);

  //add limiter
  //do mouse scroll
  while(true){
    cobj.refresh();
    ++frameNum;
    if (frameNum > spawnTime){
      frameNum = 0;
      let r = Math.floor(Math.random() * height * width);
      y = r / height;
      x = r % height;
      quakes.push(new Quake(y,x));
    }
    for (let i=0; i<quakes.length; ++i){
      q = quakes[i];
      drawCircle(cobj,q.radius,q.y,q.x);
      drawCircle(cobj,q.radius+.5,q.y,q.x);
      q.radius+=2;
      if (q.radius > width){
        quakes.splice(i,1);
        delete q;
      }
    }

    cobj.refresh();
    await sleep(sleeptime);
    cobj.clear();
  }
}

function CoolSphere(pos, rad, tilt){
  this.position = pos;
  this.radius = rad;
  this.tilt=tilt;
  this.xrot=5*Math.PI/4;
}

//given coordinates on sphere, get normal
CoolSphere.prototype.getNormal = function(coord){
  return ((coord - this.position)/this.radius);
}

//returns distance of intersectin
CoolSphere.prototype.Intersect = function(campos, dir){
  let SPHERE_EPSILON = .000000000000001;
  let z = vec3.subtract(this.position,campos);
  let d = vec3.dot(z,dir);
  let closest_dist = vec3.subtract(vec3.add(campos,vec3.scale(dir,d)),this.position);
  let D2 = vec3.dot(closest_dist, closest_dist);
  let R2 = this.radius*this.radius;
  if (D2 > R2)
    return -1;

  //now solve for actual point
  let D=Math.sqrt(R2 - D2);

  //find actual point of collission
  let u = vec3.add(closest_dist, vec3.scale(dir,-D));

  //do a change of bases
  u = vec3.normalize(this.tilt.mul(u));

  //now convert this new vector to radians for x and y

  let a = Math.acos(u.data[0]);
  let b = Math.acos(u.data[1]);
  a += this.xrot;
  //get color
  let mod = (Math.floor(a/(Math.PI/4))%2) ^ (Math.floor(b/(Math.PI/4))%2);
  if (mod==1)
    return "#F00";
  else
    return "#FFF";
}

var csphere;

function drawSphere(cobj, py, px, radius){
  let pos = vec3.create(0,0,2);
  let dir = vec3.create(0,0,-1); //pos will change but dir will be the same
  for (let x=px-radius; x<px+radius; ++x){
    for (let y=py-radius; y<py+radius; ++y){
      pos.data[0] = x+.5;
      pos.data[1] = y+.5;
      let col=csphere.Intersect(pos,dir);
      if (col != -1){
        cobj.set_fg(col);
        cobj.set_bg(col);
        cobj.mvaddch(y,x,',');
      }
    }
  }
  cobj.set_fg('rgb(30,30,30)');
  cobj.set_bg('rgb(30,30,30)');
}

//function drawBG(cobj, W, H){
//  let normal_bg="#666764";
//  let shadow_bg="#555753";
//  let hinc = Math.floor(H/6);
//  let off=0;
//  cobj.set_bg(shadow_bg);
//  for (let floor=H; floor > H-hinc; --floor){
//    cobj.mvaddstr(floor,off,' '.repeat(W-2*off));
//    ++off;
//  }
//  cobj.set_bg(normal_bg);
//  for (let wall=H-hinc; wall >= 0; --wall){
//    cobj.mvaddstr(wall,off,' '.repeat(W-2*off));
//  }
//}

var bpos=[];
var bvel=[1,-1];
async function demo4(cobj,width,height){
  //amiga bouncing ball demo
  //raytrace ball
  //ball diameter = 1/4 screen
  //color based on x-position of ball and relative-y to top of ball
  //Shadown in bg
  //illussory static background(illusory perspective)
  bpos = [Math.round(width/2), Math.round(height/2)];
  let radius = 15 //Math.round((width+height)/10.75);
  let sleeptime=50;
  let rotV = .053;
  csphere = new CoolSphere(vec3.create(bpos[0],bpos[1],-20),radius,Mat.rotz(-15));
  while(true){

    drawBG(cobj, width, height);

    let nextPos = [csphere.position.data[0] + bvel[0], csphere.position.data[1] + bvel[1]];

    //y bounce?
    let buf=1;
    if (nextPos[1] - radius < 0 || nextPos[1] + radius > height){
      bvel[1] = -bvel[1];
      nextPos[1] = csphere.position.data[1] + bvel[1];
    }

    //x bounce?
    if (nextPos[0] - radius < 0 || nextPos[0] + radius > width){
      bvel[0] = -bvel[0];
      nextPos[0] = csphere.position.data[0] + bvel[0];
      rotV = -rotV;
    }

    csphere.position.data[0] = nextPos[0];
    csphere.position.data[1] = nextPos[1];

    drawSphere(cobj, Math.floor(nextPos[1]), Math.floor(nextPos[0]), radius);
    csphere.xrot += rotV;

    //if (csphere.xrot > 2*Math.PI)
    //csphere.xrot -= 2*Math.PI;

    cobj.refresh();
    await sleep(50);
    cobj.clear();
  }
}

function isOffScreen(el){
  var rect = el.getBoundingClientRect();
  return ( (rect.x + rect.width) < 0
        || (rect.y + rect.height) < 0
        || (rect.x > window.innerWidth || rect.y > window.innerHeight)
         );
}

//this way we only have one await callback
//args = [width, height, other_stuff...]
async function runDemos(cobj1, cobj2, cobj3, cobj4, arg1, arg2, arg3, arg4, e1, e2, e3, e4){
  var sleepval=68;

  let timer1=1;
  let timer2=0;
  let timer3=1;
  let timer4=0;
  let fnum=0;
  let fnum2=0;

  var vis1=false;
  var vis2=false;
  var vis3=false;
  var vis4=false;

  //demo1 setup
  let ayystate=0;
  let newlinestate=0;
  let tkndelimstate=0;
  var strngz = arg1[2];
  var keywords1 = ['function','var','{','}','[',']','(',')']; //bright blue
  var keywords2 = ['while','if','else','elseif']; //yellow
  var keywords3 = ['document','window','this']; //super red
  var tknDelims1 = ['\'','\"']; //purp
  var tknDelims2 = ['//']; //faded blue
  var tknDelims3 = ['/*','*/']; //faded blue
  var defb='rgb(30,30,30)';
  var deff='rgb(140,140,140)';
  var hls=['#34E2E2','rgb(30,30,30)','#FFFF33','#666600','#FF4C4C','#000000','#885EAD','rgb(30,30,30)','#879eb0','rgb(30,30,30)'];
  var str_itr=0;
  var strng = strngz[str_itr];
  var wordConsumer = new wordCruncher(strng);
  cobj1.clear();

  //demo2 setup
  cobj2.clear();
  Center = [Math.round(arg2[0]/2), Math.round(arg2[1]/2)];
  var innerR = Math.min(arg2[0],arg2[1])/4.5;
  var outerR = Math.max(arg2[0],arg2[1])/3.65;

  //demo3 setup
  cobj3.clear();
  let frameNum = 20;
  let spawnTime = 35;
  let quakes = [];
  let liveQuakes = 0;
  let quakeLim = Math.floor(2*arg3[0]/3);
  for (let m=0; m<7; ++m){
    quakes.push(new Quake(0,0));
    quakes[m].radius = -1;
  }
  var lastMove = 0;
  
  //demo4 setup
  cobj4.refresh();
  cobj4.clear();
  //drawBG(cobj4,arg4[0],arg4[1]);
  //cobj4.save();
  bpos = [Math.round(arg4[0]/2), Math.round(arg4[1]/2)];
  let radius = 15 //Math.round((width+height)/10.75);
  let sleeptime=50;
  let rotV = .053;
  csphere = new CoolSphere(vec3.create(bpos[0],bpos[1],-20),radius,Mat.rotz(-15));


  function handleQuakeMove(e){
    var pos = getMousePos(arg3[2],e.changedTouches[0]);
    if (liveQuakes < quakes.length && Date.now() - lastMove > 550){
      for (let m=0; m<quakes.length; ++m){
        if (quakes[m].radius == -1){
          quakes[m].y = pos.y;
          quakes[m].x = pos.x;
          quakes[m].radius = 1
          break;
        }
      }
      ++liveQuakes;
      drawCircle(cobj3,1,pos.y,pos.x);
      cobj3.refresh();
      lastMove = Date.now();
    }
  }


  function handleQuakeTouch(e){
    var pos = getMousePos(arg3[2],e.changedTouches[0]);
    if (liveQuakes < quakes.length && Date.now() - lastMove > 550){
      for (let m=0; m<quakes.length; ++m){
        if (quakes[m].radius == -1){
          quakes[m].y = pos.y;
          quakes[m].x = pos.x;
          quakes[m].radius = 1
          break;
        }
      }
      ++liveQuakes;
      drawCircle(cobj3,1,pos.y,pos.x);
      cobj3.refresh();
      lastMove = Date.now();
    }
  }

  e3.addEventListener('mousemove',handleQuakeMove, false);
  e3.addEventListener('touchstart',handleQuakeTouch, false);
  //e4.addEventListener('mousemove',mouseMoveHandler, false);
  //e4.addEventListener('touchstart',screenTouchHandler, false);

  var oldDate = new Date();

  while(true){

    //demo 1
    //which string am I in
    if (vis1 && str_itr<=strngz.length){
      if (wordConsumer.word() !== 'EOF'){
        var cur = wordConsumer.word();
        if (ayystate !== 0){
          if (cur !== ayystate){
            cobj1.addstr(cur);
            wordConsumer.next();
          } else {
            ayystate = 0;
            cobj1.addstr(cur);
            wordConsumer.next();
          }
        } else if (newlinestate !== 0){
          if (cur !== "\n"){
            cobj1.addstr(cur);
            wordConsumer.next();
          } else {
            newlinestate = 0;
          }

        } else if (tkndelimstate !== 0){
          if (cur !== tkndelimstate){
            cobj1.addstr(cur);
            wordConsumer.next();
            cobj1.refresh();
          } else {
            tkndelimstate = 0;
            cobj1.addstr(cur);
            wordConsumer.next();
          }

        } else if (keywords1.includes(cur)){
          cobj1.set_fg(hls[0]);
          cobj1.set_bg(hls[1]);
          cobj1.addstr(cur);
          wordConsumer.next();
        } else if (keywords2.includes(cur)){
          cobj1.set_fg(hls[2]);
          cobj1.set_bg(hls[3]);
          cobj1.addstr(cur);
          wordConsumer.next();
        } else if (keywords3.includes(cur)){
          cobj1.set_fg(hls[4]);
          cobj1.set_bg(hls[5]);
          cobj1.addstr(cur);
          wordConsumer.next();
        } else if (tknDelims1.includes(cur)){ //look for same next str delim
          cobj1.set_fg(hls[6]);
          cobj1.set_bg(hls[7]);
          ayystate = cur;
          cobj1.addstr(ayystate);
          wordConsumer.next();
        } else if (tknDelims2.includes(cur)){ //comment
          cobj1.set_fg(hls[8]);
          cobj1.set_bg(hls[9]);
          cobj1.addstr(cur);
          wordConsumer.next();
          newlinestate = "\n";
        } else if (cur == tknDelims3[0]){
          cobj1.set_fg(hls[8]);
          cobj1.set_bg(hls[9]);
          cobj1.addstr(cur);
          wordConsumer.next();
          tkndelimstate = tknDelims3[1];
        }else {  //normal
          cobj1.set_fg(deff);
          cobj1.set_bg(defb);
          cobj1.addstr(cur);
          wordConsumer.next();
        }
        if (cobj1.nextPage == true){
          cobj1.clear()
        }
        cobj1.refresh();
      } else {
        ++str_itr;
        if (str_itr == strngz.length)
          str_itr=0;
        strng = strngz[str_itr];
        wordConsumer = new wordCruncher(strng);
      }
    }

    if (vis2){
    if (fnum == timer2){
      //demo 2
      CubeRot[0] += 2; //x-rot
      CubeRot[1] += 3;  //y-rot
      let rotation1  = Mat.rotx(CubeRot[0]);
      rotation1 = rotation1.mul(Mat.roty(CubeRot[1]));
      rotation1 = rotation1.mul(Mat.scale(innerR,innerR,innerR));

      CubeRot[0] *= innerR/outerR;
      CubeRot[1] *= innerR/outerR;

      //cobj.set_fg(hls[2]);
      for (let i=0; i<tetraHedronInds.length; i+=2){
        let a = tetraHedronMesh[tetraHedronInds[i]];
        let b = tetraHedronMesh[tetraHedronInds[i+1]];
        draw3Dline(cobj2,a,b,rotation1);
      }
    } else {
      let rotation2  = Mat.rotx(-(CubeRot[0]/.65));
      rotation2 = rotation2.mul(Mat.roty(CubeRot[1]));
      rotation2 = rotation2.mul(Mat.scale(outerR,outerR,outerR));

      CubeRot[0] *= outerR/innerR;
      CubeRot[1] *= outerR/innerR;

      for (let i=0; i<cubeInds.length; i+=2){
        let a = cubeMesh[cubeInds[i]];
        let b = cubeMesh[cubeInds[i+1]];
        draw3Dline(cobj2,a,b,rotation2);
      }
      cobj2.cls();
      cobj2.refresh();
      cobj2.empty();
    }
    }


    if (vis3){
    if (fnum == timer3){
      //demo 3
      ++frameNum;
      if (frameNum > spawnTime){
        frameNum = 0;
        if (liveQuakes < quakes.length) {
          let r = Math.floor(Math.random() * arg3[1] * arg3[0]);
          y = r / arg3[1];
          x = r % arg3[1];
          for (let m=0; m<quakes.length; ++m){
            if (quakes[m].radius == -1){
              quakes[m].y = y;
              quakes[m].x = x;
              quakes[m].radius = 2;
              break;
            }
            ++liveQuakes;
          }
        }
      }

    } else {
      for (let i=0; i<quakes.length; ++i){
        if (quakes[i].radius > quakeLim){
          quakes[i].radius = -1;
          --liveQuakes;
        }
        else if (quakes[i].radius != -1){
          drawCircle(cobj3,quakes[i].radius,quakes[i].y,quakes[i].x);
          drawCircle(cobj3,quakes[i].radius+.5,quakes[i].y,quakes[i].x);
          quakes[i].radius+=2;
        }
      }
      cobj3.cls();
      cobj3.refresh();
      cobj3.empty();
    }
    }

    //demo 4
    
    if (vis4 && fnum == timer4){
    cobj4.clear();
    //cobj4.restore();
    //cobj4.save();
    //drawBG(cobj4, arg4[0], arg4[1]);

    let nextPos = [csphere.position.data[0] + bvel[0], csphere.position.data[1] + bvel[1]];

    //y bounce?
    let buf=1;
    if (nextPos[1] - radius < 0 || nextPos[1] + radius > arg4[1]){
      bvel[1] = -bvel[1];
      nextPos[1] = csphere.position.data[1] + bvel[1];
    }

    //x bounce?
    if (nextPos[0] - radius < 0 || nextPos[0] + radius > arg4[0]){
      bvel[0] = -bvel[0];
      nextPos[0] = csphere.position.data[0] + bvel[0];
      rotV = -rotV;
    }

    csphere.position.data[0] = nextPos[0];
    csphere.position.data[1] = nextPos[1];

    drawSphere(cobj4, Math.floor(nextPos[1]), Math.floor(nextPos[0]), radius);
    csphere.xrot += rotV;

    //if (csphere.xrot > 2*Math.PI)
    //csphere.xrot -= 2*Math.PI;

    cobj4.refresh();
    }

    var date = new Date();
    var dt=date - oldDate;
    oldDate = date;
    ++fnum;
    if (fnum > 1)
      fnum = 0;
    fnum2 += fnum;

    if (fnum2 > 8){
      vis1 = !isOffScreen(e1);
      vis2 = !isOffScreen(e2);
      vis3 = !isOffScreen(e3);
      vis4 = !isOffScreen(e4);
      fnum2 = 0;
    }

    var sleepve = sleepval - dt; //Math.floor((dt/100000));
    //==universal refresh==
    if (sleepve < sleepval)
      await sleep(sleepve);
  }
}

window.onload = function(){
  //each obj = 8px wide, 12px high
  var co1 = Cursify("canv1",120,70);//,"Courier New",8);
 // demo1(co1,700,700,[pstr1,pstr2]);
  var co2 = Cursify("canv2",120,70);
 // var ww2 = new Worker(demo2(co2,120,70));
  var co3 = Cursify("canv3",120,70);
 // var ww3 = new Worker(demo3(co3,120,70,document.getElementById("canv3")));
  var co4 = Cursify("canv4",120,55); co4.move(1,1);
 // var ww4 = new Worker(demo4(co4,120,55));
 // TODO: Combine these all into one runDemo function so you can get only one wait() timer(async is biggest time-sink)
  
  var e1 = document.getElementById("canv1");
  var e2 = document.getElementById("canv2");
  var e3 = document.getElementById("canv3");
  var e4 = document.getElementById("canv4");
  var ww = new Worker(runDemos(co1,co2,co3,co4,[120,70,[pstr1,pstr2]],[120,70],[120,70,e3],[120,55],e1,e2,e3,e4));
  //runDemos(co1,co2,co3,co4,[120,70,[pstr1,pstr2]],[120,70],[120,70,document.getElementById("canv3")],[120,55]);
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
