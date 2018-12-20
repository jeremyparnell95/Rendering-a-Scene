"use strict";

var gl;                 // The webgl context.

var a_coords_loc;       // Location of the a_coords attribute variable in the shader program.
var a_coords_buffer;    // Buffer to hold the values for a_coords.
var a_normal_loc;       // Location of a_normal attribute.
var a_normal_buffer;    // Buffer for a_normal.
var index_buffer;       // Buffer to hold vetex indices from model.

var u_diffuseColor;     // Locations of uniform variables in the shader program
var u_specularColor;
var u_specularExponent;
var u_lightPosition;
var u_modelview;
var u_projection;
var u_normalMatrix;   
var u_object_flag; 

var rotatedMoon = 0;
var rotatedCar = 0;

var projection = mat4.create();          // projection matrix
var modelview;                           // modelview matrix; value comes from rotator
var normalMatrix = mat3.create();        // matrix, derived from model and view matrix, for transforming normal vectors
var rotator;                             // A TrackballRotator to implement rotation by mouse.

var lastTime = 0;

var lightPositions = [  // values for light position
  [0,0,0,0],
];

var objects = [         // Objects for display
    cube(), ring(), uvSphere(), uvTorus(), uvCylinder(), uvCone()
];

var currentModelNumber;  // contains data for the current object

function degToRad(degrees) {
  return degrees * Math.PI / 180;
}

function draw() { 
    gl.clearColor(0,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(projection,Math.PI/5,1,10,20);
    modelview = rotator.getViewMatrix();
    mat4.rotateX(modelview,modelview,degToRad(30));

    //base
    installModel(objects[4]);
    currentModelNumber = 4;
    
    gl.uniform1i(u_object_flag, 1);
    mat4.rotateX(modelview,modelview,degToRad(90));
    mat4.scale(modelview,modelview,[8,8,.5]);
    update_uniform(modelview,projection,4);
    mat4.scale(modelview,modelview,[1/8,1/8,1/.5]);
    mat4.rotateX(modelview,modelview,degToRad(-90)); 

    //road
    installModel(objects[1]);
    currentModelNumber = 1;

    gl.uniform1i(u_object_flag, 2);
    mat4.rotateX(modelview,modelview,degToRad(-90));
    mat4.scale(modelview,modelview,[7,7,.5]);
    mat4.translate(modelview,modelview,[0,0,.502]);
    update_uniform(modelview,projection,1);
    mat4.translate(modelview,modelview,[0,0,-.502]);
    mat4.scale(modelview,modelview,[1/7,1/7,1/.5]);
    mat4.rotateX(modelview,modelview,degToRad(90));

    //light post
    installModel(objects[4]);
    currentModelNumber = 4;
   
    gl.uniform1i(u_object_flag, 4);
    mat4.rotateX(modelview,modelview,degToRad(90));
    mat4.scale(modelview,modelview,[.08,.08,1]);
    mat4.translate(modelview,modelview,[0,0,-.6]);
    update_uniform(modelview,projection,4);
    mat4.translate(modelview,modelview,[-0,-0,.6]);
    mat4.scale(modelview,modelview,[1/.08,1/.08,1/1]);
    mat4.rotateX(modelview,modelview,degToRad(-90)); 


    rotatedMoon = (rotatedMoon + .5) % 360;

    //light bulb
    installModel(objects[2]);
    currentModelNumber = 2;

    if(rotatedMoon < 140 || rotatedMoon > 315) //when its light
    {
        gl.uniform1i(u_object_flag, 4);
    }
    else //when its dark
    {
        gl.uniform1i(u_object_flag, 6);    
    }
    mat4.rotateX(modelview,modelview,degToRad(90));
    mat4.scale(modelview,modelview,[.3,.3,.3]);
    mat4.translate(modelview,modelview,[0,0,-3.8]);
    update_uniform(modelview,projection,2);
    mat4.translate(modelview,modelview,[0,0,3.8]);
    mat4.scale(modelview,modelview,[1/.3,1/.3,1/.3]);
    mat4.rotateX(modelview,modelview,degToRad(-90));

    //sun-moon
    installModel(objects[2]);
    currentModelNumber = 2;

    if(rotatedMoon < 140 || rotatedMoon > 315) //when its light
    {
        //color
        gl.uniform1i(u_object_flag, 6);   
    }
    else //when its dark
    {
        //color
        gl.uniform1i(u_object_flag, 4);
    } 
    mat4.rotate(modelview,modelview,degToRad(rotatedMoon),[0,0,1]);
    mat4.scale(modelview,modelview,[.5,.5,.5]);
    mat4.translate(modelview,modelview,[6.5,6.5,-1.5]);
    if(rotatedMoon < 140 || rotatedMoon > 315) //when its light
    {
        //light position
        gl.uniform4f(u_lightPosition,modelview[0],modelview[1],modelview[2],0);
        gl.uniform4f(u_diffuseColor, .8, .8, .8, .8);
       
    }
    else //when its dark
    {
        //light position
        gl.uniform4f(u_lightPosition,0.0,0.3,0.0,0.0);
        gl.uniform4f(u_diffuseColor, 0.6, 0.6, 0.6, 0.6);
    }
    update_uniform(modelview,projection,2);
    mat4.translate(modelview,modelview,[-6.5,-6.5,1.5]);
    mat4.scale(modelview,modelview,[1/.5,1/.5,1/.5]);
    mat4.rotate(modelview,modelview,degToRad(-rotatedMoon),[0,0,1]);


    //Tree Tops*******************************************************************
    //leftright,updown,nearfar
    installModel(objects[5]);
    currentModelNumber = 5;
    //tree 1

    gl.uniform1i(u_object_flag, 1);
    mat4.rotateX(modelview,modelview,degToRad(-90));
    mat4.scale(modelview,modelview,[.4,.4,.65]);
    mat4.translate(modelview,modelview,[-5.8,7.5,1.2]);
    update_uniform(modelview,projection,5);
    mat4.translate(modelview,modelview,[5.8,-7.5,-1.2]);
    mat4.scale(modelview,modelview,[1/.4,1/.4,1/.65]);
    mat4.rotateX(modelview,modelview,degToRad(90)); 

    installModel(objects[5]);
    currentModelNumber = 5;
    //tree 2

    mat4.rotateX(modelview,modelview,degToRad(-90));
    mat4.scale(modelview,modelview,[.35,.35,.47]);
    mat4.translate(modelview,modelview,[2,10.3,1.5]);
    update_uniform(modelview,projection,5);
    mat4.translate(modelview,modelview,[-2,-10.3,-1.5]);
    mat4.scale(modelview,modelview,[1/.35,1/.35,1/.47]);
    mat4.rotateX(modelview,modelview,degToRad(90)); 

    installModel(objects[5]);
    currentModelNumber = 5;
    //tree 3

    mat4.rotateX(modelview,modelview,degToRad(-90));
    mat4.scale(modelview,modelview,[.35,.35,.39]);
    mat4.translate(modelview,modelview,[4,9.8,1.5]);
    update_uniform(modelview,projection,5);
    mat4.translate(modelview,modelview,[-4,-9.8,-1.5]);
    mat4.scale(modelview,modelview,[1/.35,1/.35,1/.39]);
    mat4.rotateX(modelview,modelview,degToRad(90)); 

    installModel(objects[5]);
    currentModelNumber = 5;
    //tree 4

    mat4.rotateX(modelview,modelview,degToRad(-90));
    mat4.scale(modelview,modelview,[.38,.38,.39]);
    mat4.translate(modelview,modelview,[9.7,.58,1.5]);
    update_uniform(modelview,projection,5);
    mat4.translate(modelview,modelview,[-9.7,-.58,-1.5]);
    mat4.scale(modelview,modelview,[1/.38,1/.38,1/.39]);
    mat4.rotateX(modelview,modelview,degToRad(90)); 

    installModel(objects[5]);
    currentModelNumber = 5;
    //tree 5

    mat4.rotateX(modelview,modelview,degToRad(-90));
    mat4.scale(modelview,modelview,[.57,.57,.63]);
    mat4.translate(modelview,modelview,[6.8,-.5,1.2]);
    update_uniform(modelview,projection,5);
    mat4.translate(modelview,modelview,[-6.8,.5,-1.2]);
    mat4.scale(modelview,modelview,[1/.57,1/.57,1/.63]);
    mat4.rotateX(modelview,modelview,degToRad(90)); 

    installModel(objects[5]);
    currentModelNumber = 5;
    //tree 6

    mat4.rotateX(modelview,modelview,degToRad(-90));
    mat4.scale(modelview,modelview,[.35,.35,.39]);
    mat4.translate(modelview,modelview,[10.4,-2,1.7]);
    update_uniform(modelview,projection,5);
    mat4.translate(modelview,modelview,[-10.4,2,-1.7]);
    mat4.scale(modelview,modelview,[1/.35,1/.35,1/.39]);
    mat4.rotateX(modelview,modelview,degToRad(90)); 

    installModel(objects[5]);
    currentModelNumber = 5;
    //tree 7

    mat4.rotateX(modelview,modelview,degToRad(-90));
    mat4.scale(modelview,modelview,[.35,.35,.39]);
    mat4.translate(modelview,modelview,[-2.58,-10.5,1.7]);
    update_uniform(modelview,projection,5);
    mat4.translate(modelview,modelview,[2.58,10.5,-1.7]);
    mat4.scale(modelview,modelview,[1/.35,1/.35,1/.39]);
    mat4.rotateX(modelview,modelview,degToRad(90)); 
    
    installModel(objects[5]);
    currentModelNumber = 5;
    //tree 8

    mat4.rotateX(modelview,modelview,degToRad(-90));
    mat4.scale(modelview,modelview,[.80,.80,1]);
    mat4.translate(modelview,modelview,[-1.23,-.95,1.1]);
    update_uniform(modelview,projection,5);
    mat4.translate(modelview,modelview,[1.23,.95,-1.1]);
    mat4.scale(modelview,modelview,[1/.80,1/.80,1/1]);
    mat4.rotateX(modelview,modelview,degToRad(90)); 

    installModel(objects[5]);
    currentModelNumber = 5;
    //tree 9

    mat4.rotateX(modelview,modelview,degToRad(-90));
    mat4.scale(modelview,modelview,[.80,.80,1]);
    mat4.translate(modelview,modelview,[1.04,-.24,1.1]);
    update_uniform(modelview,projection,5);
    mat4.translate(modelview,modelview,[-1.04,.24,-1.1]);
    mat4.scale(modelview,modelview,[1/.80,1/.80,1/1]);
    mat4.rotateX(modelview,modelview,degToRad(90)); 

    installModel(objects[5]);
    currentModelNumber = 5;
    //tree 10

    mat4.rotateX(modelview,modelview,degToRad(-90));
    mat4.scale(modelview,modelview,[.6,.6,.75]);
    mat4.translate(modelview,modelview,[-.51,.8,1.2]);
    update_uniform(modelview,projection,5);
    mat4.translate(modelview,modelview,[.51,-.8,-1.2]);
    mat4.scale(modelview,modelview,[1/.6,1/.6,1/.75]);
    mat4.rotateX(modelview,modelview,degToRad(90));

    //Tree Trunks*********************************************************************
    //leftright,updown,nearfar

    installModel(objects[4]);
    currentModelNumber = 4;
    //tree 1

    gl.uniform1i(u_object_flag, 3);
    mat4.rotateX(modelview,modelview,degToRad(90));
    mat4.scale(modelview,modelview,[.1,.1,.55]);
    mat4.translate(modelview,modelview,[-23,-30,-.4]);
    update_uniform(modelview,projection,4);
    mat4.translate(modelview,modelview,[23,30,.4]);
    mat4.scale(modelview,modelview,[1/.1,1/.1,1/.55]);
    mat4.rotateX(modelview,modelview,degToRad(-90)); 

    installModel(objects[4]);
    currentModelNumber = 4;
    //tree 2
    mat4.rotateX(modelview,modelview,degToRad(90));
    mat4.scale(modelview,modelview,[.1,.1,.55]);
    mat4.translate(modelview,modelview,[7,-36,-.4]);
    update_uniform(modelview,projection,4);
    mat4.translate(modelview,modelview,[-7,36,.4]);
    mat4.scale(modelview,modelview,[1/.1,1/.1,1/.55]);
    mat4.rotateX(modelview,modelview,degToRad(-90)); 

    installModel(objects[4]);
    currentModelNumber = 4;
    //tree 3
    mat4.rotateX(modelview,modelview,degToRad(90));
    mat4.scale(modelview,modelview,[.1,.1,.55]);
    mat4.translate(modelview,modelview,[14,-34,-.4]);
    update_uniform(modelview,projection,4);
    mat4.translate(modelview,modelview,[-14,34,.4]);
    mat4.scale(modelview,modelview,[1/.1,1/.1,1/.55]);
    mat4.rotateX(modelview,modelview,degToRad(-90)); 

    installModel(objects[4]);
    currentModelNumber = 4;
    //tree 4
    mat4.rotateX(modelview,modelview,degToRad(90));
    mat4.scale(modelview,modelview,[.1,.1,.55]);
    mat4.translate(modelview,modelview,[36.7,-2,-.4]);
    update_uniform(modelview,projection,4);
    mat4.translate(modelview,modelview,[-36.7,2,.4]);
    mat4.scale(modelview,modelview,[1/.1,1/.1,1/.55]);
    mat4.rotateX(modelview,modelview,degToRad(-90)); 
   
    installModel(objects[4]);
    currentModelNumber = 4;
    //tree 5
    mat4.rotateX(modelview,modelview,degToRad(90));
    mat4.scale(modelview,modelview,[.1,.1,.55]);
    mat4.translate(modelview,modelview,[38.5,3,-.4]);
    update_uniform(modelview,projection,4);
    mat4.translate(modelview,modelview,[-38.5,-3,.4]);
    mat4.scale(modelview,modelview,[1/.1,1/.1,1/.55]);
    mat4.rotateX(modelview,modelview,degToRad(-90)); 

    installModel(objects[4]);
    currentModelNumber = 4;
    //tree 6
    mat4.rotateX(modelview,modelview,degToRad(90));
    mat4.scale(modelview,modelview,[.1,.1,.55]);
    mat4.translate(modelview,modelview,[36.2,7,-.4]);
    update_uniform(modelview,projection,4);
    mat4.translate(modelview,modelview,[-36.2,-7,.4]);
    mat4.scale(modelview,modelview,[1/.1,1/.1,1/.55]);
    mat4.rotateX(modelview,modelview,degToRad(-90)); 

    installModel(objects[4]);
    currentModelNumber = 4;
    //tree 7
    mat4.rotateX(modelview,modelview,degToRad(90));
    mat4.scale(modelview,modelview,[.1,.1,.55]);
    mat4.translate(modelview,modelview,[-9,37,-.4]);
    update_uniform(modelview,projection,4);
    mat4.translate(modelview,modelview,[9,-37,.4]);
    mat4.scale(modelview,modelview,[1/.1,1/.1,1/.55]);
    mat4.rotateX(modelview,modelview,degToRad(-90)); 

    installModel(objects[4]);
    currentModelNumber = 4;
    //tree 8
    mat4.rotateX(modelview,modelview,degToRad(90));
    mat4.scale(modelview,modelview,[.2,.2,.7]);
    mat4.translate(modelview,modelview,[-5,4,-.4]);
    update_uniform(modelview,projection,4);
    mat4.translate(modelview,modelview,[5,-4,.4]);
    mat4.scale(modelview,modelview,[1/.2,1/.2,1/.7]);
    mat4.rotateX(modelview,modelview,degToRad(-90)); 

    installModel(objects[4]);
    currentModelNumber = 4;
    //tree 9
    mat4.rotateX(modelview,modelview,degToRad(90));
    mat4.scale(modelview,modelview,[.2,.2,.7]);
    mat4.translate(modelview,modelview,[4,1,-.4]);
    update_uniform(modelview,projection,4);
    mat4.translate(modelview,modelview,[-4,-1,.4]);
    mat4.scale(modelview,modelview,[1/.2,1/.2,1/.7]);
    mat4.rotateX(modelview,modelview,degToRad(-90)); 

    //medium tree trunks
    installModel(objects[4]);
    currentModelNumber = 4;
    //tree 10
    mat4.rotateX(modelview,modelview,degToRad(90));
    mat4.scale(modelview,modelview,[.16,.16,.7]);
    mat4.translate(modelview,modelview,[-2,-3,-.4]);
    update_uniform(modelview,projection,4);
    mat4.translate(modelview,modelview,[2,3,.4]);
    mat4.scale(modelview,modelview,[1/.16,1/.16,1/.7]);
    mat4.rotateX(modelview,modelview,degToRad(-90));

    //Car Body******************************************************************
    rotatedCar = (rotatedCar + 1) % 360;

    installModel(objects[0]);
    currentModelNumber = 0;

    gl.uniform1i(u_object_flag, 7);
    mat4.rotate(modelview,modelview,degToRad(-rotatedCar),[0,1,0]);
    mat4.rotateX(modelview,modelview,degToRad(90));
    mat4.scale(modelview,modelview,[.5,.5,.4]);
    mat4.translate(modelview,modelview,[0,5,-1.25]);
    update_uniform(modelview,projection,0);
    mat4.translate(modelview,modelview,[0,-5,1.25]);
    mat4.scale(modelview,modelview,[1/.5,1/.5,1/.4]);
    mat4.rotateX(modelview,modelview,degToRad(-90));
    mat4.rotate(modelview,modelview,degToRad(rotatedCar),[0,1,0]);

    installModel(objects[0]);
    currentModelNumber = 0;

    mat4.rotate(modelview,modelview,degToRad(-rotatedCar),[0,1,0]);
    mat4.rotateX(modelview,modelview,degToRad(90));
    mat4.scale(modelview,modelview,[1,.55,.3]);
    mat4.translate(modelview,modelview,[-.07,4.55,-1.5]);
    update_uniform(modelview,projection,0);
    mat4.translate(modelview,modelview,[-.07,-4.55,1.5]);
    mat4.scale(modelview,modelview,[1/1,1/.55,1/.3]);
    mat4.rotateX(modelview,modelview,degToRad(-90));
    mat4.rotate(modelview,modelview,degToRad(rotatedCar),[0,1,0]);



    installModel(objects[2]); //right light
    currentModelNumber = 2;
    /* 
    if(rotatedMoon < 140 || rotatedMoon > 315) //when its light
    {
        gl.uniform3f(u_specularColor,0,0,0);
        gl.uniform4f(u_diffuseColor,0,0,0,0); 
    }
    else //when its dark
    {
        mView = modelview;
        mat4.rotate(mView,mView,degToRad(-rotatedCar),[0,1,0]);
        mat4.translate(mView,mView,[-2.55,17.8,-3]);
        gl.uniform4f(u_lightPosition,mView[0],mView[1],mView[2],0);
        gl.uniform3f(u_specularColor, 0.4, 0.4, 0.4);
        gl.uniform4f(u_diffuseColor, .6, .6, .6, .6);
        mat4.translate(modelview,modelview,[2.55,-17.8,3]);
        mat4.rotate(mView,mView,degToRad(rotatedCar),[0,1,0]);
    }
    */
    gl.uniform1i(u_object_flag, 8);
    mat4.rotate(modelview,modelview,degToRad(-rotatedCar),[0,1,0]);
    mat4.rotateX(modelview,modelview,degToRad(90));
    mat4.scale(modelview,modelview,[.15,.15,.15]);
    mat4.translate(modelview,modelview,[-2.55,17.8,-3]);
    update_uniform(modelview,projection,2);
    mat4.translate(modelview,modelview,[2.55,-17.8,3]);
    mat4.scale(modelview,modelview,[1/.15,1/.15,1/.15]);
    mat4.rotateX(modelview,modelview,degToRad(-90));
    mat4.rotate(modelview,modelview,degToRad(rotatedCar),[0,1,0]);


    installModel(objects[2]); //left light
    currentModelNumber = 2;
    /*
    if(rotatedMoon < 140 || rotatedMoon > 315) //when its light
    {
        gl.uniform3f(u_specularColor,0,0,0);
        gl.uniform4f(u_diffuseColor,0,0,0,0);  
    }
    else //when its dark
    {
        mView = modelview;
        mat4.rotate(mView,mView,degToRad(-rotatedCar),[0,1,0]);
        mat4.translate(modelview,modelview,[-2.55,15.5,-3]);
        gl.uniform4f(u_lightPosition,mView[0],mView[1],mView[2],0);
        gl.uniform3f(u_specularColor, 0.4, 0.4, 0.4);
        gl.uniform4f(u_diffuseColor, .6, .6, .6, .6);
        mat4.translate(modelview,modelview,[2.55,-15.5,3]);
        mat4.rotate(mView,mView,degToRad(rotatedCar),[0,1,0]); 
    }
    */
    mat4.rotate(modelview,modelview,degToRad(-rotatedCar),[0,1,0]);
    mat4.rotateX(modelview,modelview,degToRad(90));
    mat4.scale(modelview,modelview,[.15,.15,.15]);
    mat4.translate(modelview,modelview,[-2.55,15.5,-3]);
    update_uniform(modelview,projection,2);
    mat4.translate(modelview,modelview,[2.55,-15.5,3]);
    mat4.scale(modelview,modelview,[1/.15,1/.15,1/.15]);
    mat4.rotateX(modelview,modelview,degToRad(-90));
    mat4.rotate(modelview,modelview,degToRad(rotatedCar),[0,1,0]);

    //Car Tires*********************************************************************
    installModel(objects[3]); 
    currentModelNumber = 3;

    mat4.rotate(modelview,modelview,degToRad(-rotatedCar),[0,1,0]);
    gl.uniform1i(u_object_flag, 9);
    mat4.rotateX(modelview,modelview,degToRad(0));
    mat4.scale(modelview,modelview,[.3,.3,.3]);
    mat4.translate(modelview,modelview,[-.8,1.3,9.7]);
    update_uniform(modelview,projection,3);
    mat4.translate(modelview,modelview,[.8,-1.3,-9.7]);
    mat4.scale(modelview,modelview,[1/.3,1/.3,1/.3]);
    mat4.rotateX(modelview,modelview,degToRad(0));
    mat4.rotate(modelview,modelview,degToRad(rotatedCar),[0,1,0]);

    installModel(objects[3]); 
    currentModelNumber = 3;

    mat4.rotate(modelview,modelview,degToRad(-rotatedCar),[0,1,0]);
    mat4.rotateX(modelview,modelview,degToRad(0));
    mat4.scale(modelview,modelview,[.3,.3,.3]);
    mat4.translate(modelview,modelview,[1.3,1.3,9.7]);
    update_uniform(modelview,projection,3);
    mat4.translate(modelview,modelview,[-1.3,-1.3,-9.7]);
    mat4.scale(modelview,modelview,[1/.3,1/.3,1/.3]);
    mat4.rotateX(modelview,modelview,degToRad(0));
    mat4.rotate(modelview,modelview,degToRad(rotatedCar),[0,1,0]);

    installModel(objects[3]); 
    currentModelNumber = 3;

    mat4.rotate(modelview,modelview,degToRad(-rotatedCar),[0,1,0]);
    mat4.rotateX(modelview,modelview,degToRad(0));
    mat4.scale(modelview,modelview,[.3,.3,.3]);
    mat4.translate(modelview,modelview,[-.8,1.3,7]);
    update_uniform(modelview,projection,3);
    mat4.translate(modelview,modelview,[.8,-1.3,-7]);
    mat4.scale(modelview,modelview,[1/.3,1/.3,1/.3]);
    mat4.rotateX(modelview,modelview,degToRad(0));
    mat4.rotate(modelview,modelview,degToRad(rotatedCar),[0,1,0]);

    installModel(objects[3]); 
    currentModelNumber = 3;

    mat4.rotate(modelview,modelview,degToRad(-rotatedCar),[0,1,0]);
    mat4.rotateX(modelview,modelview,degToRad(0));
    mat4.scale(modelview,modelview,[.3,.3,.3]);
    mat4.translate(modelview,modelview,[1.3,1.3,7]);
    update_uniform(modelview,projection,3);
    mat4.translate(modelview,modelview,[-1.3,-1.3,-7]);
    mat4.scale(modelview,modelview,[1/.3,1/.3,1/.3]);
    mat4.rotateX(modelview,modelview,degToRad(0));  
    mat4.rotate(modelview,modelview,degToRad(rotatedCar),[0,1,0]);

    //Tire Spokes*********************************************************************
    installModel(objects[4]); 
    currentModelNumber = 4;
    //back right tire straight spoke

    gl.uniform1i(u_object_flag, 10);
    mat4.rotate(modelview,modelview,degToRad(-rotatedCar),[0,1,0]);
    mat4.rotateX(modelview,modelview,degToRad(90));
    mat4.scale(modelview,modelview,[.02,.02,.15]);
    mat4.translate(modelview,modelview,[19.8,105,-2.3]);
    update_uniform(modelview,projection,4);
    mat4.translate(modelview,modelview,[-19.8,-105,2.3]);
    mat4.scale(modelview,modelview,[1/.02,1/.02,1/.15]);
    mat4.rotateX(modelview,modelview,degToRad(-90));
    mat4.rotate(modelview,modelview,degToRad(rotatedCar),[0,1,0]);

    installModel(objects[4]); 
    currentModelNumber = 4;
    //front right tire right spoke

    mat4.rotate(modelview,modelview,degToRad(-rotatedCar),[0,1,0]);
    mat4.rotateX(modelview,modelview,degToRad(90));
    mat4.rotateY(modelview,modelview,degToRad(50));
    mat4.scale(modelview,modelview,[.02,.02,.15]);
    mat4.translate(modelview,modelview,[27,104.5,.6]);
    update_uniform(modelview,projection,4);
    mat4.translate(modelview,modelview,[-27,-104.5,-.6]);
    mat4.scale(modelview,modelview,[1/.02,1/.02,1/.15]);
    mat4.rotateY(modelview,modelview,degToRad(-50));
    mat4.rotateX(modelview,modelview,degToRad(-90)); 
    mat4.rotate(modelview,modelview,degToRad(rotatedCar),[0,1,0]);

    installModel(objects[4]); 
    currentModelNumber = 4;
    //front right tire left spoke

    mat4.rotate(modelview,modelview,degToRad(-rotatedCar),[0,1,0]);
    mat4.rotateX(modelview,modelview,degToRad(90));
    mat4.rotateY(modelview,modelview,degToRad(-50));
    mat4.scale(modelview,modelview,[.02,.02,.15]);
    mat4.translate(modelview,modelview,[-1.5,104.5,-3.5]);
    update_uniform(modelview,projection,4);
    mat4.translate(modelview,modelview,[1.5,-104.5,3.5]);
    mat4.scale(modelview,modelview,[1/.02,1/.02,1/.15]);
    mat4.rotateY(modelview,modelview,degToRad(50));
    mat4.rotateX(modelview,modelview,degToRad(-90));
    mat4.rotate(modelview,modelview,degToRad(rotatedCar),[0,1,0]); 

    installModel(objects[4]); 
    currentModelNumber = 4;
    //front right tire straight spoke

    mat4.rotate(modelview,modelview,degToRad(-rotatedCar),[0,1,0]);
    mat4.rotateX(modelview,modelview,degToRad(90));
    mat4.scale(modelview,modelview,[.02,.02,.15]);
    mat4.translate(modelview,modelview,[-12,105,-2.3]);
    update_uniform(modelview,projection,4);
    mat4.translate(modelview,modelview,[12,-105,2.3]);
    mat4.scale(modelview,modelview,[1/.02,1/.02,1/.15]);
    mat4.rotateX(modelview,modelview,degToRad(-90));
    mat4.rotate(modelview,modelview,degToRad(rotatedCar),[0,1,0]);

    installModel(objects[4]); 
    currentModelNumber = 4;
    //front right tire right spoke

    mat4.rotate(modelview,modelview,degToRad(-rotatedCar),[0,1,0]);
    mat4.rotateX(modelview,modelview,degToRad(90));
    mat4.rotateY(modelview,modelview,degToRad(50));
    mat4.scale(modelview,modelview,[.02,.02,.15]);
    mat4.translate(modelview,modelview,[6.4,104.5,-2.67]);
    update_uniform(modelview,projection,4);
    mat4.translate(modelview,modelview,[-6.4,-104.5,2.67]);
    mat4.scale(modelview,modelview,[1/.02,1/.02,1/.15]);
    mat4.rotateY(modelview,modelview,degToRad(-50));
    mat4.rotateX(modelview,modelview,degToRad(-90));
    mat4.rotate(modelview,modelview,degToRad(rotatedCar),[0,1,0]);

    installModel(objects[4]); 
    currentModelNumber = 4;
    //front right tire left spoke

    mat4.rotate(modelview,modelview,degToRad(-rotatedCar),[0,1,0]);
    mat4.rotateX(modelview,modelview,degToRad(90));
    mat4.rotateY(modelview,modelview,degToRad(-50));
    mat4.scale(modelview,modelview,[.02,.02,.15]);
    mat4.translate(modelview,modelview,[-21.5,104.5,-.2]);
    update_uniform(modelview,projection,4);
    mat4.translate(modelview,modelview,[21.5,-104.5,.2]);
    mat4.scale(modelview,modelview,[1/.02,1/.02,1/.15]);
    mat4.rotateY(modelview,modelview,degToRad(50));
    mat4.rotateX(modelview,modelview,degToRad(-90)); 
    mat4.rotate(modelview,modelview,degToRad(rotatedCar),[0,1,0]);

    installModel(objects[4]); 
    currentModelNumber = 4;
    //back left tire straight spoke

    mat4.rotate(modelview,modelview,degToRad(-rotatedCar),[0,1,0]);
    mat4.rotateX(modelview,modelview,degToRad(90));
    mat4.scale(modelview,modelview,[.02,.02,.15]);
    mat4.translate(modelview,modelview,[19.8,145,-2.3]);
    update_uniform(modelview,projection,4);
    mat4.translate(modelview,modelview,[-19.8,-145,2.3]);
    mat4.scale(modelview,modelview,[1/.02,1/.02,1/.15]);
    mat4.rotateX(modelview,modelview,degToRad(-90));
    mat4.rotate(modelview,modelview,degToRad(rotatedCar),[0,1,0]);

    installModel(objects[4]); 
    currentModelNumber = 4;
    //back left tire right spoke

    mat4.rotate(modelview,modelview,degToRad(-rotatedCar),[0,1,0]);
    mat4.rotateX(modelview,modelview,degToRad(90));
    mat4.rotateY(modelview,modelview,degToRad(50));
    mat4.scale(modelview,modelview,[.02,.02,.15]);
    mat4.translate(modelview,modelview,[27,144.5,.6]);
    update_uniform(modelview,projection,4);
    mat4.translate(modelview,modelview,[-27,-144.5,-.6]);
    mat4.scale(modelview,modelview,[1/.02,1/.02,1/.15]);
    mat4.rotateY(modelview,modelview,degToRad(-50));
    mat4.rotateX(modelview,modelview,degToRad(-90)); 
    mat4.rotate(modelview,modelview,degToRad(rotatedCar),[0,1,0]);

    installModel(objects[4]); 
    currentModelNumber = 4;
    //front right tire left spoke

    mat4.rotate(modelview,modelview,degToRad(-rotatedCar),[0,1,0]);
    mat4.rotateX(modelview,modelview,degToRad(90));
    mat4.rotateY(modelview,modelview,degToRad(-50));
    mat4.scale(modelview,modelview,[.02,.02,.15]);
    mat4.translate(modelview,modelview,[-1.5,144.5,-3.5]);
    update_uniform(modelview,projection,4);
    mat4.translate(modelview,modelview,[1.5,-144.5,3.5]);
    mat4.scale(modelview,modelview,[1/.02,1/.02,1/.15]);
    mat4.rotateY(modelview,modelview,degToRad(50));
    mat4.rotateX(modelview,modelview,degToRad(-90)); 
    mat4.rotate(modelview,modelview,degToRad(rotatedCar),[0,1,0]);


    installModel(objects[4]); 
    currentModelNumber = 4;
    //front left tire striaght spoke
    mat4.rotate(modelview,modelview,degToRad(-rotatedCar),[0,1,0]);
    mat4.rotateX(modelview,modelview,degToRad(90));
    mat4.scale(modelview,modelview,[.02,.02,.15]);
    mat4.translate(modelview,modelview,[-12,145,-2.3]);
    update_uniform(modelview,projection,4);
    mat4.translate(modelview,modelview,[12,-145,2.3]);
    mat4.scale(modelview,modelview,[1/.02,1/.02,1/.15]);
    mat4.rotateX(modelview,modelview,degToRad(-90));
    mat4.rotate(modelview,modelview,degToRad(rotatedCar),[0,1,0]);

    installModel(objects[4]); 
    currentModelNumber = 4;
    //front left tire right spoke

    mat4.rotate(modelview,modelview,degToRad(-rotatedCar),[0,1,0]);
    mat4.rotateX(modelview,modelview,degToRad(90));
    mat4.rotateY(modelview,modelview,degToRad(50));
    mat4.scale(modelview,modelview,[.02,.02,.15]);
    mat4.translate(modelview,modelview,[6.4,144.5,-2.67]);
    update_uniform(modelview,projection,4);
    mat4.translate(modelview,modelview,[-6.4,-144.5,2.67]);
    mat4.scale(modelview,modelview,[1/.02,1/.02,1/.15]);
    mat4.rotateY(modelview,modelview,degToRad(-50));
    mat4.rotateX(modelview,modelview,degToRad(-90));  
    mat4.rotate(modelview,modelview,degToRad(rotatedCar),[0,1,0]);

    installModel(objects[4]); 
    currentModelNumber = 4;
    //front right tire left spoke

    mat4.rotate(modelview,modelview,degToRad(-rotatedCar),[0,1,0]);
    mat4.rotateX(modelview,modelview,degToRad(90));
    mat4.rotateY(modelview,modelview,degToRad(-50));
    mat4.scale(modelview,modelview,[.02,.02,.15]);
    mat4.translate(modelview,modelview,[-21.5,144.5,-.2]);
    update_uniform(modelview,projection,4);
    mat4.translate(modelview,modelview,[21.5,-144.5,.2]);
    mat4.scale(modelview,modelview,[1/.02,1/.02,1/.15]);
    mat4.rotateY(modelview,modelview,degToRad(50));
    mat4.rotateX(modelview,modelview,degToRad(-90));
    mat4.rotate(modelview,modelview,degToRad(rotatedCar),[0,1,0]);

    //Car Axels***********************************************************************
    installModel(objects[4]); 
    currentModelNumber = 4;
    //front axel
    
    mat4.rotate(modelview,modelview,degToRad(-rotatedCar),[0,1,0]);
    mat4.rotateX(modelview,modelview,degToRad(180));
    mat4.scale(modelview,modelview,[.04,.04,.80]);
    mat4.translate(modelview,modelview,[10,-9.5,-3.1]);
    update_uniform(modelview,projection,4);
    mat4.translate(modelview,modelview,[-10,9.5,3.1]);
    mat4.scale(modelview,modelview,[1/.04,1/.04,1/.80]);
    mat4.rotateX(modelview,modelview,degToRad(-180));
    mat4.rotate(modelview,modelview,degToRad(rotatedCar),[0,1,0]);

    installModel(objects[4]); 
    currentModelNumber = 4;
    //back axel

    mat4.rotate(modelview,modelview,degToRad(-rotatedCar),[0,1,0]);
    mat4.rotateX(modelview,modelview,degToRad(180));
    mat4.scale(modelview,modelview,[.04,.04,.80]);
    mat4.translate(modelview,modelview,[-6,-9.5,-3.1]);
    update_uniform(modelview,projection,4);
    mat4.translate(modelview,modelview,[6,9.5,3.1]);
    mat4.scale(modelview,modelview,[1/.04,1/.04,1/.80]);
    mat4.rotateX(modelview,modelview,degToRad(-180)); 
    mat4.rotate(modelview,modelview,degToRad(rotatedCar),[0,1,0]);

    mat4.rotateX(modelview,modelview,degToRad(-30));
    requestAnimationFrame(draw);
}

/*
  this function assigns the computed values to the uniforms for the model, view and projection 
  transform
*/
function update_uniform(modelview,projection,currentModelNumber){

    /* Get the matrix for transforming normal vectors from the modelview matrix,
       and send matrices to the shader program*/
    mat3.normalFromMat4(normalMatrix, modelview);
    
    gl.uniformMatrix3fv(u_normalMatrix, false, normalMatrix);
    gl.uniformMatrix4fv(u_modelview, false, modelview );
    gl.uniformMatrix4fv(u_projection, false, projection );   
    gl.drawElements(gl.TRIANGLES, objects[currentModelNumber].indices.length, gl.UNSIGNED_SHORT, 0);
}



/* 
 * Called and data for the model are copied into the appropriate buffers, and the 
 * scene is drawn.
 */
function installModel(modelData) {
     gl.bindBuffer(gl.ARRAY_BUFFER, a_coords_buffer);
     gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexPositions, gl.STATIC_DRAW);
     gl.vertexAttribPointer(a_coords_loc, 3, gl.FLOAT, false, 0, 0);
     gl.enableVertexAttribArray(a_coords_loc);
     gl.bindBuffer(gl.ARRAY_BUFFER, a_normal_buffer);
     gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexNormals, gl.STATIC_DRAW);
     gl.vertexAttribPointer(a_normal_loc, 3, gl.FLOAT, false, 0, 0);
     gl.enableVertexAttribArray(a_normal_loc);
     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,index_buffer);
     gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, modelData.indices, gl.STATIC_DRAW);
}


/* Initialize the WebGL context.  Called from init() */
function initGL() {
    var prog = createProgram(gl,"vshader-source","fshader-source");
    gl.useProgram(prog);
    a_coords_loc =  gl.getAttribLocation(prog, "a_coords");
    a_normal_loc =  gl.getAttribLocation(prog, "a_normal");
    u_modelview = gl.getUniformLocation(prog, "modelview");
    u_projection = gl.getUniformLocation(prog, "projection");
    u_normalMatrix =  gl.getUniformLocation(prog, "normalMatrix");
    u_lightPosition=  gl.getUniformLocation(prog, "lightPosition");
    u_diffuseColor =  gl.getUniformLocation(prog, "diffuseColor");
    u_specularColor =  gl.getUniformLocation(prog, "specularColor");
    u_specularExponent = gl.getUniformLocation(prog, "specularExponent");
    u_object_flag = gl.getUniformLocation(prog, "object_flag");
    a_coords_buffer = gl.createBuffer();
    a_normal_buffer = gl.createBuffer();
    index_buffer = gl.createBuffer();
    gl.enable(gl.DEPTH_TEST);
    gl.uniform3f(u_specularColor, 0.5, 0.5, 0.5);
    gl.uniform4f(u_diffuseColor, 0.0, 0.0, 0.0, 1.0);
    gl.uniform1f(u_specularExponent,20);
    gl.uniform4f(u_lightPosition,0,0,0,0);
}

/* Creates a program for use in the WebGL context gl, and returns the
 * identifier for that program.  If an error occurs while compiling or
 * linking the program, an exception of type String is thrown.  The error
 * string contains the compilation or linking error.  If no error occurs,
 * the program identifier is the return value of the function.
 *    The second and third parameters are the id attributes for <script>
 * elementst that contain the source code for the vertex and fragment
 * shaders.
 */
function createProgram(gl, vertexShaderID, fragmentShaderID) {
    function getTextContent( elementID ) {
            // This nested function retrieves the text content of an
            // element on the web page.  It is used here to get the shader
            // source code from the script elements that contain it.
        var element = document.getElementById(elementID);
        var node = element.firstChild;
        var str = "";
        while (node) {
            if (node.nodeType == 3) // this is a text node
                str += node.textContent;
            node = node.nextSibling;
        }
        return str;
    }
    try {
        var vertexShaderSource = getTextContent( vertexShaderID );
        var fragmentShaderSource = getTextContent( fragmentShaderID );
    }
    catch (e) {
        throw "Error: Could not get shader source code from script elements.";
    }
    var vsh = gl.createShader( gl.VERTEX_SHADER );
    gl.shaderSource(vsh,vertexShaderSource);
    gl.compileShader(vsh);
    if ( ! gl.getShaderParameter(vsh, gl.COMPILE_STATUS) ) {
        throw "Error in vertex shader:  " + gl.getShaderInfoLog(vsh);
     }
    var fsh = gl.createShader( gl.FRAGMENT_SHADER );
    gl.shaderSource(fsh, fragmentShaderSource);
    gl.compileShader(fsh);
    if ( ! gl.getShaderParameter(fsh, gl.COMPILE_STATUS) ) {
       throw "Error in fragment shader:  " + gl.getShaderInfoLog(fsh);
    }
    var prog = gl.createProgram();
    gl.attachShader(prog,vsh);
    gl.attachShader(prog, fsh);
    gl.linkProgram(prog);
    if ( ! gl.getProgramParameter( prog, gl.LINK_STATUS) ) {
       throw "Link error in program:  " + gl.getProgramInfoLog(prog);
    }
    return prog;
}


/**
 * initialization function that will be called when the page has loaded
 */
function init() {
    try {
        var canvas = document.getElementById("myGLCanvas");
        gl = canvas.getContext("webgl") || 
                         canvas.getContext("experimental-webgl");
        if ( ! gl ) {
            throw "Browser does not support WebGL";
        }
    }
    catch (e) {
        document.getElementById("canvas-holder").innerHTML =
            "<p>Sorry, could not get a WebGL graphics context.</p>";
        return;
    }

    try {
        initGL();  // initialize the WebGL graphics context
    }
    catch (e) {
        document.getElementById("canvas-holder").innerHTML =
            "<p>Sorry, could not initialize the WebGL graphics context:" + e + "</p>";
        return;
    }
    
    rotator = new TrackballRotator(canvas, draw, 15);
    draw();
}









