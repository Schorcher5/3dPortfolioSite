import '../css/style.css'

import * as THREE from 'three';
import { MathUtils } from 'three';

import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

document.addEventListener("DOMContentLoaded", function () {
  // Set up for the basic scene, camera and renderer
  const scene = new THREE.Scene();
  const backdrop = document.querySelector('#three-js-background');

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 4000);
  const renderer = new THREE.WebGLRenderer({
    canvas: backdrop,
    antialias: true
  });
  
  renderer.setPixelRatio( window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  camera.position.setZ(1750);
  
  //Set up for the electric lights

  let group, container, stats , positions, colors, 
  particles, pointCloud, particlePositions, linesMesh;
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
      pointCloud.visible = value;
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

  function initLines() {

    initGUI();

    container = backdrop

    const controls = new OrbitControls( camera, container);
    controls.minDistance = 1000;
    controls.maxDistance = 3000;

    group = new THREE.Group();
    scene.add(group);

    const helper = new THREE.BoxHelper(new THREE.Mesh(new THREE.BoxGeometry(r,r,r)));
    helper.material.color.setHex(0x101010);
    helper.material.blending = THREE.AdditiveBlending;
    helper.material.transparent = true;
    group.add(helper);

    const segments = maxParticleCount * maxParticleCount;

    positions = new Float32Array(segments*3);
    colors = new Float32Array(segments * 3);

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xFFFFFF,
      size: 3,
      blending: THREE.AdditiveBlending,
      transparent: true,
      sizeAttenuation: false
    });

    particles = new THREE.BufferGeometry();
    particlePositions = new Float32Array(maxParticleCount * 3);

    for( let i = 0; i< maxParticleCount; i++){
      const x = Math.random() * r-r/2;
      const y = Math.random() * r-r/2;
      const z = Math.random() * r-r/2;

      particlePositions[i*3] = x;
      particlePositions[i*3+1] = y;
      particlePositions[i*3+2] = z;

      particlesData.push({
        velocity: new THREE.Vector3(-1 + Math.random()*2, -1 + Math.random()*2, -1 + Math.random()*2),
        numConnections:0
      });
    }

    particles.setDrawRange( 0, particleCount);
    particles.setAttribute( 'position', new THREE.BufferAttribute( particlePositions, 3).setUsage(THREE.DynamicDrawUsage));

    pointCloud = new THREE.Points(particles, particlePositions);
    group.add(pointCloud);
    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors,3).setUsage(THREE.DynamicDrawUsage));
    geometry.computeBoundingSphere();
    geometry.setDrawRange(0,0);

    const material = new THREE.LineBasicMaterial({
      vertexColors:true,
      blending: THREE.AdditiveBlending,
      transparent: true
    });

    linesMesh = new THREE.LineSegments(geometry, material);
    group.add(linesMesh);

    

    stats = new Stats();
    container.appendChild(stats.dom);
    


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
  
    const [x,y,z] = Array(3).fill().map(() => MathUtils.randFloatSpread(100));
  
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
  
  initLines();
  animate();
  
  
});

