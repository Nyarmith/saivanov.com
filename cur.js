
function demo1(cobj){
    //demo that just prints out code? I can't do highlighting so probably not...
    //sure, let's try it with some basic highlighting, let's take the revision-based approach
}

function demo2(cobj){
    //demo that showcases rotating cubes
    //demo that showcases rotating cubes
}

function demo3(cobj){
    //either...
    //interactive demo based on mouse movements
    //or
    //demo based on drops coming form colliding objects
    //or
    //something period and harmonious
}

function demo4(cobj){
    //amiga bouncing ball demo
}

window.onload = function(){
    //each obj = 8px wide, 12px high
    var cursObj = Cursify("canv1",120,70);//,"Courier New",8);
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
    var co2 = Cursify("canv2",120,70);
    co2.move(3,3);
    co2.addstr("EEEEEEEEEEEEEEEEEEEEEEEEEEEEEE");
    co2.refresh();
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
