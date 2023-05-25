import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
if (!localStorage.highScore) {
  localStorage.highScore = 0;
};
document.getElementById("highscore").innerHTML = "highscore: " + localStorage.highScore + "cm"
var miles = 0;
var livesApearance = document.getElementById('lives');
livesApearance.src = "./threeLives.png";
var lives = 3;
var livesBeenReduced = false;
var lightOn = false;
var car;
var carLoaded = false;
//make inital scene and set camera
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.z = 400;
camera.position.x = 0;
camera.position.y = 200;
//render stuff and append to html
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
//add luigi bounding box helepr cuz i need it before
const luigiBBHelperMaterial = new THREE.MeshBasicMaterial( {color: 0x00ff00, visible: false} );
const luigiBBHelperGeometry = new THREE.BoxGeometry(1, 5.5, 1);
const luigiBBHelper = new THREE.Mesh(luigiBBHelperGeometry, luigiBBHelperMaterial);
luigiBBHelper.material.color.setColorName('red');
scene.add(luigiBBHelper);
let luigiBB = new THREE.Box3( new THREE.Vector3(), new THREE.Vector3);
luigiBB.setFromObject(luigiBBHelper);
//make plane
const planeGeometry = new THREE.PlaneGeometry( 10, 15 );
const planeMaterial = new THREE.MeshStandardMaterial( {color: 0x282828, metalness: 1} );
const plane = new THREE.Mesh( planeGeometry, planeMaterial );
plane.position.z = 1;
plane.rotation.x = Math.PI / 180 * -90;
scene.add( plane );
const stripeGeometry = new THREE.PlaneGeometry( 0.5, 2 );
const stripeMaterial = new THREE.MeshStandardMaterial( {color: 0xFFFFFF} );
const stripe = new THREE.Mesh( stripeGeometry, stripeMaterial );
stripe.position.z = 0;
stripe.position.y = 0.001;
stripe.rotation.x = Math.PI / 180 * -90;
scene.add( stripe );
//set light
var light = new THREE.PointLight(0xFFFFFF, 7, 0);
light.position.set(0,3.5,-40);
scene.add(light);
const ambientLight = new THREE.AmbientLight(0x404040, 5); // soft white light
scene.add( ambientLight );
//load car and penguin
const loader = new GLTFLoader();
loader.load( './car.gltf', function ( gltf ) {
  scene.add( gltf.scene ).scale.set(50,50,50);
  car = gltf.scene;
  car.rotation.y = 3.15;
  car.position.z = 4;
  carLoaded = true;
}, undefined, function ( error ) {

	console.error( error );

} );
loader.load( './luigi.glb', function ( gltf ) {
  scene.add( gltf.scene );
  var luigi = gltf.scene;
  luigi.scale.set(0.02,0.03,0.02);
  luigi.position.z = -5;
  luigiBBHelper.position.z = -5;
  luigiBBHelper.position.x = 0.2;
  var luigiLoop = setInterval(()=>{
    luigi.translateZ(0.4);
    luigiBBHelper.translateZ(0.4);
    if(luigi.position.z > 8){
      livesBeenReduced = false;
      luigi.position.z = -5;
      luigiBBHelper.position.z = -5;
      luigi.position.x = Math.random() * 10 - 5;
      luigiBBHelper.position.x = luigi.position.x + 0.2;
    }
  },50);
}, undefined, function ( error ) {

	console.error( error );

} );
const controls = new OrbitControls( camera, renderer.domElement );
controls.target.set(0, 0, 0);
controls.update();
//car controlls
document.addEventListener('keydown', keyPressed);

function keyPressed(e) {
  if(e.key == 'ArrowLeft'){
    let counter = 1;
    let leftLoop = setInterval(goLeft, 10);
    function goLeft(){
      if(car.position.x > -4.2){
        car.translateX(0.01);
        carBBHelper.translateX(-0.01);
        light.position.x -= 0.1;
      }
      if(counter > 50){
        clearInterval(leftLoop);
      }
      counter++;
    }
  }
  if(e.key == 'ArrowRight'){
    let counter = 1;
    let rightLoop = setInterval(goRight, 10);
    function goRight(){
      if(car.position.x < 4.2){
        car.translateX(-0.01);
        carBBHelper.translateX(0.01);
        light.position.x += 0.1;
      }
      if(counter > 50){
        clearInterval(rightLoop);
      }
      counter++;
    }
  }
  if(e.code == "Space"){
    lightOn = true;
  } else{
    lightOn = false;
  }
}
//bounding boxes
const carBBHelperMaterial = new THREE.MeshBasicMaterial( {color: 0x00ff00, visible: false} );
let carBB = new THREE.Box3( new THREE.Vector3(), new THREE.Vector3);
//cube for bounding box to use
const carBBHelperGeometry = new THREE.BoxGeometry( 1.8, 4, 3.5 );
const carBBHelper = new THREE.Mesh( carBBHelperGeometry, carBBHelperMaterial );
carBBHelper.position.z = 4;
scene.add( carBBHelper );
carBB.setFromObject(carBBHelper);
//animate loop

var animate = function () {
  if(lives == 2){
    livesApearance.src = "./twoLives.png";
  } else if(lives == 1){
    livesApearance.src = "./oneLife.png";
  } else if (lives<1){
    livesApearance.remove();
    window.alert("Reload then hit ok to play again");
  }
  if(carBB.intersectsBox(luigiBB) && !livesBeenReduced){
    lives--;
    livesBeenReduced = true;
  }
  if(lightOn){
    light.intensity = 15;
    setTimeout(()=>{
      lightOn = false;
    }, 5000);
  }
  if(!lightOn){
    light.intensity = 7;
  }
  carBB.setFromObject(carBBHelper);
  luigiBB.setFromObject(luigiBBHelper);
  stripe.translateY(-0.2);
  if(stripe.position.z > 10){
    stripe.position.z = -5;
  }
	requestAnimationFrame( animate );
	renderer.render(scene, camera);
  controls.update();
};

animate();

setInterval(()=>{
  miles++;
  document.getElementById("distance").innerHTML = miles + "cm"
  if(miles > localStorage.highScore){
    localStorage.highScore = miles;
    document.getElementById("highscore").innerHTML = "highscore: " + localStorage.highScore + "cm"
  }
}, 1000);
