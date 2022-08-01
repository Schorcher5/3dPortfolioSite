import '../css/style.css'

import * as THREE from 'three';
import { MathUtils } from 'three';

import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

document.addEventListener("DOMContentLoaded", function () {
  // Set up for the basic scene, camera and renderer
  const scene = new THREE.Scene();
  const backdrop = document.querySelector('#three-js-background');

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1,2000);
  const renderer = new THREE.WebGLRenderer({
    canvas: backdrop,
    antialias: true
  });
  
  renderer.setPixelRatio( window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.outputEncoding = THREE.sRGBEncoding;
  camera.position.setZ(200);
  camera.position.setX(0);
  
  //Set up for the electric lights

  let group, container, stats , positions, colors, 
  particles, pointCloud, particlePositions, linesMesh;
  const particlesData = [];
  
  const maxParticleCount = 500;
  let particleCount = 200;
  const r =  800;
  const rHalf = r/2;

  const effectController = {
    showDots: true,
    showLines: true,
    minDistance: 150,
    limitConnections: true,
    maxConnections: 5,
    particleCount: 50
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
    gui.add( effectController, 'maxConnections', 0, 30, 1 );
    gui.add(effectController, 'particleCount', 0, maxParticleCount, 1).onChange((value) => {
      particleCount = parseInt(value);
      particles.setDrawRange(0, particleCount);
    });
  }

  function initLines() {

    initGUI();

    container = backdrop


    group = new THREE.Group();
    scene.add(group);

  

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
      color: 0xD75281,
      vertexColors:true,
      blending: THREE.AdditiveBlending,
      transparent: true
    });

    linesMesh = new THREE.LineSegments(geometry, material);
    group.add(linesMesh);

    

    stats = new Stats();
    stats.showPanel(0);
    container.appendChild(stats.dom);

    //Re-adjusts the canvas size according to changes in the viewport

    window.addEventListener('resize', () =>{
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
  
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
    


  }

  //Dummy torus for testing
  const torus = new THREE.Mesh( 
    new THREE.TorusGeometry(10, 3, 16, 100), 
    new THREE.MeshStandardMaterial({color:0xB93160}));
  
  scene.add(torus);
  

  //Basic lighting
  const pointLight = new THREE.PointLight(0xffffff);
  pointLight.position.set(20,20,20);
  
  const ambientLight = new THREE.AmbientLight(0xffffff);
  
  scene.add(pointLight, ambientLight);
  
  

  //Adding Stars to the scene in random places
  function addStars() {
    const star = new THREE.Mesh(
      new THREE.SphereGeometry(0.4),
      new THREE.MeshStandardMaterial({color:0xFFF89C})
    );
  
    const [x,y,z] = Array(3).fill().map(() => MathUtils.randFloatSpread(1200));
  
    star.position.set(x,y,z);
    scene.add(star);
  }
  
  Array(400).fill().forEach(addStars);
  

  //Animation loop where the rendering take place
  function animate(){

    // line animation

    let vertexPosition = 0;
    let colorPosition = 0;
    let numberOfConnected = 0;
    
    // Reset number of connections back to 0;

    for( let i =0; i<particleCount; i++){
      particlesData[i].numConnections = 0;
    }


    //Set up new positions of lines through steps that are based on their particle data and where they sit in relation to the radius (+-400, half of radius)
    for( let i = 0; i< particleCount; i++){
      const particleData = particlesData[i];

      particlePositions[i*3] += particleData.velocity.x;
      particlePositions[i*3 + 1] += particleData.velocity.y;
      particlePositions[i*3 + 2] += particleData.velocity.z;

      // Switching step magnitude if they cross the min/max range (+- 400) set by half the radius
      if (particlePositions[i*3 + 1] < -rHalf  || particlePositions[i*3 + 1] > rHalf)
        particleData.velocity.y *= -1;

      if (particlePositions[i*3] < -rHalf  || particlePositions[i*3] > rHalf)
        particleData.velocity.x *= -1;

      if (particlePositions[i*3 + 2] < -rHalf  || particlePositions[i*3 + 2] > rHalf)
        particleData.velocity.z *= -1;

      if (effectController.limitConnections && particleData.numConnections >= effectController.maxConnections) continue;


      for( let j = i+ 1; j<particleCount; j++){

        const particleDataBase = particlesData[j];

        if (effectController.limitConnections && particleDataBase.numConnections >= effectController.maxConnections) continue;

        const dx = particlePositions[i*3] - particlePositions[j*3];
        const dy = particlePositions[i*3 + 1] - particlePositions[j*3 + 1];
        const dz = particlePositions[i*3 + 2] - particlePositions[j*3 + 2];
        const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        if(distance < effectController.minDistance) {

          particleData.numConnections++;
          particleDataBase.numConnections++;

          const alpha = 1.0 - distance/effectController.minDistance;

          positions[ vertexPosition++ ] = particlePositions[ i * 3 ];
          positions[ vertexPosition++ ] = particlePositions[ i * 3 + 1 ];
          positions[ vertexPosition++ ] = particlePositions[ i * 3 + 2 ];

          positions[ vertexPosition++ ] = particlePositions[ j * 3 ];
          positions[ vertexPosition++ ] = particlePositions[ j * 3 + 1 ];
          positions[ vertexPosition++ ] = particlePositions[ j * 3 + 2 ];

          colors[ colorPosition++ ] = alpha;
          colors[ colorPosition++ ] = alpha;
          colors[ colorPosition++ ] = alpha;

          colors[ colorPosition++ ] = alpha;
          colors[ colorPosition++ ] = alpha;
          colors[ colorPosition++ ] = alpha;

          numberOfConnected++;


          
        }
      }

    }

    linesMesh.geometry.setDrawRange(0, numberOfConnected*2);
    linesMesh.geometry.attributes.position.needsUpdate = true;
    linesMesh.geometry.attributes.color.needsUpdate = true;

    pointCloud.geometry.attributes.position.needsUpdate = true;

    // Torus animation
    requestAnimationFrame(animate);
  
    torus.rotation.x += 0.01;
    torus.rotation.y += 0.005;
    torus.rotation.z += 0.01;
  


    stats.update();
    renderer.render(scene ,camera);
  }
  
  initLines();
  
  //Scrolling animation for lines

  let lastTop = 0;

  document.body.onscroll = ()=>{
      const top = document.body.getBoundingClientRect().top;
      let difference = 0;
      let x = 0;
      let y = 0;
      let z = 0;

      if(top < lastTop){
        difference = (top-lastTop);
        x = -0.001 * difference;

      }else if( top > lastTop){
        difference = (lastTop-top);
        x = 0.001 * difference;
      }

      group.rotation.x += x;
      console.log(x);
      lastTop = top;
  };

  animate();
  
});

