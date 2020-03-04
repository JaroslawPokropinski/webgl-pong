class Ball{
	constructor(x, y){
		this.position = {x: x, y: y};
		this.size = {x: 0.01, y: 0.01};
		this.vel = {x: 0.001, y: 0.0};
		this.speed = 0.001;
		this.color = [255.0/255, 153.0/255, 0, 1.0];
		
		this.depth = 0.0;
	}
}

class Pad{
	constructor(x, y){
		this.position = {x: x, y: y};
		this.size = {x: 0.01, y: 0.2};
		this.vel = {x: 0.0, y: 0.0};
		this.color = [1.0, 1.0, 1.0, 1.0];
		
		this.depth = 0.0;
	}
}

class Background1{
	constructor(x, y){
		this.position = {x: x, y: y};
		this.size = {x: 1.3, y: 0.95};
		this.vel = {x: 0.0, y: 0.0};
		this.color = [26.0/255, 140.0/255, 255.0/255, 1.0];
		
		this.depth = 1.0;
	}
}

class Background2{
	constructor(x, y){
		this.position = {x: x, y: y};
		this.size = {x: 0.02, y: 0.9};
		this.vel = {x: 0.0, y: 0.0};
		this.color = [0.0, 0.0, 0.0, 1.0];
		
		this.depth = 1.0;
	}
}
var pad = [new Pad(-1.0, 0.0), new Pad(1.0, 0.0)];
var ball = new Ball(0.0, 0.0);
var shade = new Ball(0.0, 0.0);
var objectsArray = [ball, pad[0], pad[1], shade, new Background1(0.0,0.0), new Background2(0.0, 0.0)];
var speedVal = 0.001;
var speed = {x: -0.001, y: 0.0}
var animation = {};




const canvas = document.querySelector('#glcanvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
}

const vsSource = `
attribute vec4 aVertexPosition;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
void main() {
  gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
}
`;


const fsSource = `
precision mediump float;
uniform vec4 uColorRGB;

void main() {
  gl_FragColor = vec4(uColorRGB);
}
`;

const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
  
  
 
const programInfo = {
	program: shaderProgram,
	attribLocations: {
	  vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
	},
	uniformLocations: {
	  projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
	  modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
	  colorRGB: gl.getUniformLocation(shaderProgram, 'uColorRGB'),
	},
};

const buffers = initBuffers(gl);


var gi = -1;

var animate2 = function( timeDelta ) {
	
	
	shade.position.x = ball.position.x;
	shade.position.y = ball.position.y;
	
	ball.position.x += ball.vel.x * timeDelta;
	ball.position.y += ball.vel.y * timeDelta;
	
	for(var i = 0; i < pad.length; i++){
		pad[i].position.y += pad[i].vel.y * timeDelta;
		
		if(pad[i].position.y < -1.0)
			pad[i].position.y = -1.0;
		else if(pad[i].position.y > 1.0)
			pad[i].position.y = 1.0;
	}
	
	
	if(ball.position.y < -1.0){
		ball.position.y = -2.0 - ball.position.y;
		ball.vel.y = -ball.vel.y;
	}
	else if(ball.position.y > 1.0){
		ball.position.y = 2.0 - ball.position.y;
		ball.vel.y = -ball.vel.y;
	}
	
	
}
var animate=function( time ) {
    var timeDelta= time-animation.lastTime;
	if(timeDelta > 100)
		timeDelta = 100;
	
	if(ball.position.x + ball.vel.x * timeDelta < -1.0 || ball.position.x + ball.vel.x * timeDelta > 1.0){
		if(ball.position.x + ball.vel.x * timeDelta < -1.0){
			gi = 0;
		}
		else{
			gi = 1;
		}
		
		var dt1 = (pad[gi].position.x - ball.position.x)/ball.vel.x;
		
		
		animate2(dt1);
		
		
		if(ball.position.y > pad[gi].position.y - pad[gi].size.y - ball.size.y && ball.position.y < pad[gi].position.y + pad[gi].size.y + ball.size.y){
					
			var angle = (ball.position.y  - pad[gi].position.y)/( pad[gi].size.y + ball.size.y) * 75.0 * Math.PI / 180.0;
			ball.vel.x = (1.0 - 2.0*gi)*Math.cos(angle) * ball.speed;
			ball.vel.y = Math.sin(angle) * ball.speed;
			
			
			animate2(timeDelta - dt1);
			
		}
		else{
			ball.position.x = 0.0
			ball.position.y = 0.0
			if(ball.vel.x > 0.)
				ball.vel.x = ball.speed;
			else
				ball.vel.x = -ball.speed;
			ball.vel.y = 0.0
			for(var i = 0; i < pad.length; i++){
				pad[i].position.y = 0.0
			}
		}
	}
	else
		animate2(timeDelta);
	
	animation.lastTime = time ;
	drawScene(gl, programInfo, buffers);
    gl.finish();
    animation.requestId = window.requestAnimationFrame(animate);
	
    
}

var animationStart= function(){
    animation.lastTime = window.performance.now();
    animation.requestId = window.requestAnimationFrame(animate);
}



function initBuffers(gl) {

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  const positions = [
     1.0,  1.0,
    -1.0,  1.0,
     1.0, -1.0,
    -1.0, -1.0,
  ];

  gl.bufferData(gl.ARRAY_BUFFER,
                new Float32Array(positions),
                gl.STATIC_DRAW);

  return {
    position: positionBuffer,
  };
}

function drawScene(gl, programInfo, buffers) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things


  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  mat4.ortho(projectionMatrix, -1.0 * aspect, 1.0 * aspect, -1.0, 1.0, -1.0, 1.0);
  //mat4.scale(projectionMatrix, projectionMatrix, [1.0/aspect, 1.0, 1.0]);

  for(var i =  0; i < objectsArray.length; i++)
  {
	  const modelViewMatrix = mat4.create();
	  
	  mat4.translate(modelViewMatrix,     // destination matrix
					 modelViewMatrix,     // matrix to translate
					 [objectsArray[i].position.x, objectsArray[i].position.y, -objectsArray[i].depth]);  // amount to translate
					 
	  mat4.scale(modelViewMatrix, modelViewMatrix, [objectsArray[i].size.x, objectsArray[i].size.y, 1.0]);

	  {
		const numComponents = 2;
		const type = gl.FLOAT;
		const normalize = false;
		const stride = 0;
		const offset = 0;
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
		gl.vertexAttribPointer(
			programInfo.attribLocations.vertexPosition,
			numComponents,
			type,
			normalize,
			stride,
			offset);
		gl.enableVertexAttribArray(
			programInfo.attribLocations.vertexPosition);
	  }


	  gl.useProgram(programInfo.program);

	  gl.uniformMatrix4fv(
		  programInfo.uniformLocations.projectionMatrix,
		  false,
		  projectionMatrix);
	  gl.uniformMatrix4fv(
		  programInfo.uniformLocations.modelViewMatrix,
		  false,
		  modelViewMatrix);
		  
	  gl.uniform4fv( programInfo.uniformLocations.colorRGB, objectsArray[i].color );

	  {
		const offset = 0;
		const vertexCount = 4;
		gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
	  }
  }
}

function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);


  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);


  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}


function loadShader(gl, type, source) {
  const shader = gl.createShader(type);


  gl.shaderSource(shader, source);

  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

window.onkeydown = function (e){
    var code= e.which || e.keyCode;
    switch(code)
    {
    case 38: // up
        pad[1].vel.y = pad[1].size.y/200.0;
	break;
    case 40: // down
        pad[1].vel.y = -pad[1].size.y/200.0;
	break;
	
	case 87: // W
        pad[0].vel.y = pad[1].size.y/200.0;
	break;
    case 83: // S
        pad[0].vel.y = -pad[1].size.y/200.0;
	break;
    }
}
window.onkeyup = function (e){
    var code= e.which || e.keyCode;
    switch(code)
    {
    case 38: // up
		if( pad[1].vel.y > 0)
			pad[1].vel.y = 0;
	break;
    case 40: // down
		if( pad[1].vel.y < 0)
			pad[1].vel.y = 0;
	break;
	
	case 87: // up
		if( pad[0].vel.y > 0)
			pad[0].vel.y = 0;
	break;
    case 83: // down
		if( pad[0].vel.y < 0)
			pad[0].vel.y = 0;
	break;
    }
}

window.onload = function(){
	drawScene(gl, programInfo, buffers);
	animationStart();
}