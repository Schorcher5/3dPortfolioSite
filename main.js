import './style.css'

import * as THREE from 'three';
import { MathUtils } from 'three';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#3d-background'),
});

renderer.setPixelRatio( window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

const torus = new THREE.Mesh( 
  new THREE.TorusGeometry(10, 3, 16, 100), 
  new THREE.MeshStandardMaterial({color:0xFF6347}));

scene.add(torus);

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(20,20,20);

const ambientLight = new THREE.AmbientLight(0xffffff);

scene.add(pointLight, ambientLight);

function addStars() {
  const star = new THREE.Mesh(
    new THREE.SphereGeometry(0.25,24,24),
    new THREE.MeshStandardMaterial({color:0xffffff})
  );

  const [x,y,z] = Array(3).fill().map(() => THREE>MathUtils.randFloatSpread(100));

  star.position.set(x,y,x);
  scene.add(star);
}

Array(200).fill().forEach(addStars);

function animate(){
  requestAnimationFrame(animate);

  torus.rotation.x += 0.01;
  torus.rotation.y += 0.005;
  torus.rotation.z += 0.01;

  renderer.render(scene ,camera);
}

animate();

