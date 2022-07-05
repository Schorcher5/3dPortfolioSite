import '../css/style.css'

import * as THREE from 'three';
import { MathUtils } from 'three';

import Stats from '.jsm/libs/stats.module.js';
import { GUI } from './jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';

document.addEventListener("DOMContentLoaded", function () {
  // Set up for the basic scene, camera and renderer
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#three-js-background'),
  });
  
  renderer.setPixelRatio( window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.position.setZ(30);
  
  //Set up for the electric lights

  let group, container, stats , positions, colors, 
  particles, pointCLoud, particlePositions, linesMesh;
  const particlesData = [];
  
  const maxParticleCount = 1000;
  let particleCount = 500;
  const r =  800;
  const rHalf = r/2;

  const effectController = {
    showDots: true,
    showLines: true,
    minDistance: 150,
    limitConnections: false,
    maxConnection: 20,
    particleCount: 500
  }

  function initGUI(){
    const gui = new GUI();
    
    gui.add(effectController, 'showDots').onChange((value) =>{
      pointCLoud.visible = value;
    });

    gui.add(effectController, 'showLines').onChange((value) => {
      linesMesh.visible = value;
    });

    gui.add(effectController, 'minDistance', 10, 300);
    gui.add(effectController, 'limitConnections');
    gui.add(effectController, 'maxConnections', 0, 30, 1);
    gui.add(effectController, 'particleCount', 0, maxParticleCount, 1).onChange((value) => {
      particleCount = parseInt(value);
      particles.setDrawRange(0, particleCount);
    });
  }

  //Dummy torus for testing
  const torus = new THREE.Mesh( 
    new THREE.TorusGeometry(10, 3, 16, 100), 
    new THREE.MeshStandardMaterial({color:0xFF6347}));
  
  scene.add(torus);
  

  //Basic lighting
  const pointLight = new THREE.PointLight(0xffffff);
  pointLight.position.set(20,20,20);
  
  const ambientLight = new THREE.AmbientLight(0xffffff);
  
  scene.add(pointLight, ambientLight);
  

  //Adding Stars to the scene in random places
  function addStars() {
    const star = new THREE.Mesh(
      new THREE.SphereGeometry(0.25,24,24),
      new THREE.MeshStandardMaterial({color:0xffffff})
    );
  
    const [x,y,z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
  
    star.position.set(x,y,z);
    scene.add(star);
  }
  
  Array(200).fill().forEach(addStars);
  

  //Animation loop where the rendering take place
  function animate(){
    requestAnimationFrame(animate);
  
    torus.rotation.x += 0.01;
    torus.rotation.y += 0.005;
    torus.rotation.z += 0.01;
  
    renderer.render(scene ,camera);
  }
  
  animate();
  
  
});

