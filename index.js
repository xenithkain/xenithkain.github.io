import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';


var navBarExtenderIsClicked = false;

function navBarExtenderButton(navBar, button){
    console.log('clicked');
    var nav = document.getElementById(navBar);
    var button = document.getElementById(button);
    if(!navBarExtenderIsClicked){
        
        nav.style.transform = 'translateX(0px)';
    }else{
        nav.style.transform = 'translateX(-20vw)';
    }
    navBarExtenderIsClicked = !navBarExtenderIsClicked;
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(
    45, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.x = 3;
camera.position.y = 20;
camera.position.z = 45;
const renderer = new THREE.WebGLRenderer({antialias: true});

const controls = new OrbitControls(camera, renderer.domElement);
controls.target = new THREE.Vector3(0,0,-40);
controls.update();

const plane = new THREE.Mesh(new THREE.PlaneGeometry(200,200), new THREE.MeshPhongMaterial({color:0x0a7d15}));
plane.rotation.x = - Math.PI / 2;
plane.receiveShadow = true;
scene.add(plane);

const light1 = new THREE.PointLight(0xff6666, 1, 100);
light1.castShadow = true;
light1.shadow.mapSize.width = 4096;
light1.shadow.mapSize.height = 4096;
scene.add(light1);

const light2 = new THREE.PointLight(0x33ff33, 1, 100);
light2.castShadow = true;
light2.shadow.mapSize.width = 4096;
light2.shadow.mapSize.height = 4096;
scene.add(light2);

function animate(){
    const now = Date.now() / 1000;
    light1.position.y = 15;
    light1.position.x = Math.cos(now) * 20;
    light1.position.z = Math.sin(now) * 20;

    light2.position.y = 15;
    light2.position.x = Math.cos(now) * 20;
    light2.position.z = Math.sin(now) * 20;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
document.getElementById('main_page').appendChild(renderer.domElement);
animate();