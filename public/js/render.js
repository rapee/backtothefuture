
var camera, scene, renderer;
var cube;
var controls;

var offset = 0;
var speed = 0;
var acc = 0.97;

var keyboard = new KeyboardState();

var objectList = [];

init();
animate();

function init() {

  window.addEventListener( 'resize', onWindowResize, false );

  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor( 0xffffff, 1);
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.getElementById( 'stage' ).appendChild( renderer.domElement );

  //

  camera = new THREE.PerspectiveCamera( 120, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.y = 50;
  camera.position.z = 50;
  // camera.lookAt(new THREE.Vector3( 0, 0, 50));

  // // EVENTS
  // THREEx.WindowResize(renderer, camera);
  // THREEx.FullScreen.bindKey({ charCode : 'f'.charCodeAt(0) });

  // CONTROLS
  controls = new THREE.OrbitControls( camera, renderer.domElement );

  scene = new THREE.Scene();

  var plane = createPlane();
  scene.add(plane);

  var dist = 0;
  function addOnTimeline(obj, d) {
    objectList.push(obj);
    scene.add(obj);
    obj.position.z = dist;
    dist -= d || 60;
  }

  // Add objects
  addOnTimeline(createTextMarker( "December 2013 " ), 30);
  addOnTimeline(createSprite( '/public/images/test3.jpg'));
  addOnTimeline(createSprite( '/public/images/test1.jpg'));
  addOnTimeline(createSprite( '/public/images/test2.jpg'));

  addOnTimeline(createTextMarker( "January 2014 " ), 30);
  addOnTimeline(createSprite( '/public/images/test1.jpg'));
  addOnTimeline(createSprite( '/public/images/test2.jpg'));
  addOnTimeline(createSprite( '/public/images/test3.jpg'));

  addOnTimeline(createTextMarker( "February 2014 " ), 30);
  addOnTimeline(createSprite( '/public/images/test2.jpg'));
  addOnTimeline(createSprite( '/public/images/test1.jpg'));
  addOnTimeline(createSprite( '/public/images/test3.jpg'));

}

function createCube() {

  var geometry = new THREE.BoxGeometry( 200, 200, 200 );

  var texture = THREE.ImageUtils.loadTexture( '/public/images/crate.gif' );
  texture.anisotropy = renderer.getMaxAnisotropy();

  var material = new THREE.MeshBasicMaterial( { map: texture } );

  mesh = new THREE.Mesh( geometry, material );
  return mesh;
}

function createPlane(params) {
  params = params || {};
  params.position = params.position || {};
  params.rotation = params.rotation || {};

  var geometry = new THREE.PlaneGeometry( params.width || 200, params.height || 3000 );
  var material = new THREE.MeshBasicMaterial( {color: params.color || 0xdddddd, side: THREE.DoubleSide} );
  mesh = new THREE.Mesh( geometry, material );

  mesh.position.x = params.position.x || 0;
  mesh.position.y = params.position.y || 0;
  mesh.position.z = params.position.z || 0;

  mesh.rotation.x = params.rotation.x || Math.PI/2;
  mesh.rotation.y = params.rotation.y || 0;
  mesh.rotation.z = params.rotation.z || 0;

  return mesh;
}

function createSprite( src ) {
  var texture = THREE.ImageUtils.loadTexture(src);
  var material = new THREE.SpriteMaterial( { map: texture, useScreenCoordinates: false } );
  var sprite = new THREE.Sprite( material );
  sprite.scale.set(50,50,1);
  sprite.position.y = 20;
  return sprite;
}

function createTextMarker(str) {
  var group = new THREE.Object3D();
  var text = createText( str, {
      fontsize: 32,
      fontface: "Helvetica",
      borderColor: {r:0, g:0, b:255, a:1.0}
    } );
  text.position.x = 150;
  text.position.z = 0;
  var line = createPlane({ width: 200, height: .5, position: { x: 0, y: .5 }, color: 0x333333});

  group.add(text);
  group.add(line);
  return group;
}

function createText( message, parameters )
{
  if ( parameters === undefined ) parameters = {};

  var fontface = parameters.hasOwnProperty("fontface") ?
    parameters["fontface"] : "Arial";

  var fontsize = parameters.hasOwnProperty("fontsize") ?
    parameters["fontsize"] : 18;

  var borderThickness = parameters.hasOwnProperty("borderThickness") ?
    parameters["borderThickness"] : 4;

  var borderColor = parameters.hasOwnProperty("borderColor") ?
    parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };

  var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
    parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };

  var spriteAlignment = new THREE.Vector2(-1,-1); //THREE.SpriteAlignment.topLeft;

  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  context.font = "Bold " + fontsize + "px " + fontface;

  // get size data (height depends only on font size)
  var metrics = context.measureText( message );
  var textWidth = metrics.width;

  // background color
  context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
                  + backgroundColor.b + "," + backgroundColor.a + ")";
  // border color
  context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
                  + borderColor.b + "," + borderColor.a + ")";

  context.lineWidth = borderThickness;
  // roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
  // 1.4 is extra height factor for text below baseline: g,j,p,q.

  // text color
  context.fillStyle = "rgba(0, 0, 0, 1.0)";

  context.fillText( message, borderThickness, fontsize + borderThickness);

  // canvas contents will be used for a texture
  var texture = new THREE.Texture(canvas)
  texture.needsUpdate = true;

  var spriteMaterial = new THREE.SpriteMaterial(
    { map: texture, useScreenCoordinates: false, alignment: spriteAlignment } );
  var sprite = new THREE.Sprite( spriteMaterial );
  sprite.scale.set(100,50,1.0);
  return sprite;
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

  requestAnimationFrame( animate );

  // cube.rotation.x += 0.005;
  // cube.rotation.y += 0.01;

  renderer.render( scene, camera );

  keyUpdate();

  controls.update();

  worldUpdate();
}

function keyUpdate() {

  keyboard.update();


  if ( keyboard.pressed("up") )
    speed += 0.4;
  if ( keyboard.pressed("down") )
    speed -= 0.4;
}

function worldUpdate() {
  speed *= acc;
  if (Math.abs(speed) < 0.001) speed = 0;

  // move objects
  objectList.forEach(function(obj) {
    obj.position.z += speed;
  });
}
