import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// Create a Three.JS Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 50;
camera.position.y = -10;
camera.fov = 50;

let object;
let controls;

const loader = new GLTFLoader();
loader.load(
  '../images/model/earbuds.gltf', 
  function (gltf) {
    object = gltf.scene;
    object.scale.set(8, 8, 12);
    scene.add(object);
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },
  function (error) {
    console.error(error);
  }
);

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio*3);
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container-3D").appendChild(renderer.domElement);

const topLight = new THREE.DirectionalLight(0xffffff, 7);
topLight.position.set(500, 500, 500);
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x404040, 5);
scene.add(ambientLight);

renderer.shadowMap.enabled = true;
topLight.castShadow = true;
if (object) object.castShadow = true;


if (object) {
  controls = new OrbitControls(camera, renderer.domElement);
}


function animate() {
  requestAnimationFrame(animate);
  
  if (object) {
    object.rotation.y = -3 + mouseX / window.innerWidth * 3;
    object.rotation.x = -1.2 + mouseY * 2.5 / window.innerHeight;
  }
  renderer.render(scene, camera);
}

window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
document.onmousemove = (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
};

animate();

//Scroll-on-animation

const canvas = document.querySelector("#explode-view");
const context = canvas.getContext("2d");

canvas.width = 1920;
canvas.height = 1080;

const frameCount = 101; 
const images = [];
let imagesLoaded = 0;



// Load all the animation frames
for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    img.src = `images/scroll_ani/frame_${i.toString().padStart(3, '0')}.webp`;

    img.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === frameCount) {
            initAnimation();
        }
    };

    img.onerror = (e) => {
        console.error(`Image loading failed: ${img.src}`, e);
    };

    images.push(img);
}

const buds = { frame: 0 };

function initAnimation() {
    if (!gsap || !ScrollTrigger) {
        console.error("GSAP and ScrollTrigger are required for this animation.");
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    gsap.to(buds, {
        frame: frameCount - 1,
        snap: "frame",
        scrollTrigger: {
            trigger: "#explode-view",
            pin: true,
            scrub: 1,
            markers: true,
            start: "top top",
            end: "bottom bottom",
        },
        onUpdate: render
    });

    render(); // Render the first frame
}

function render() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    const currentImage = images[Math.round(buds.frame)];
    if (currentImage && currentImage.complete) {
        context.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
    } else {
        console.warn("Image is not loaded or complete yet:", currentImage);
    }
}

// Ensure canvas is responsive
function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    render(); // Re-render after resizing
}

// Event listener for resizing
window.addEventListener("resize", resizeCanvas);
resizeCanvas(); // Initialize canvas size on load
