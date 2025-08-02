
let scene, camera, renderer, controls, raycaster, mouse;
let planets = {};
let score = 0;

const planetData = {
  earth: {
    name: "Earth", color: 0x2266ff, size: 1.8, distance: 22,
    fact: "Earth is the only known planet with life.",
    quiz: {
      question: "How much of Earth's surface is covered in water?",
      options: ["50%", "71%", "90%", "30%"],
      answer: 1
    }
  },
  mars: {
    name: "Mars", color: 0xdd3333, size: 1.3, distance: 28,
    fact: "Mars is called the Red Planet because of iron oxide (rust).",
    quiz: {
      question: "How many moons does Mars have?",
      options: ["1", "2", "3", "0"],
      answer: 1
    }
  },
  jupiter: {
    name: "Jupiter", color: 0xffaa33, size: 3, distance: 36,
    fact: "Jupiter is the largest planet in our solar system.",
    quiz: {
      question: "What is the giant red spot on Jupiter?",
      options: ["A sea", "A desert", "A storm", "A mountain"],
      answer: 2
    }
  }
};

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 15, 50);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  const light = new THREE.PointLight(0xffffff, 1.5);
  light.position.set(0, 0, 0);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x404040));

  // Star background
  const starGeo = new THREE.BufferGeometry();
  const starCount = 1000;
  const positions = [];
  for (let i = 0; i < starCount; i++) {
    positions.push((Math.random() - 0.5) * 200);
    positions.push((Math.random() - 0.5) * 200);
    positions.push((Math.random() - 0.5) * 200);
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  for (let key in planetData) {
    const data = planetData[key];
    const geometry = new THREE.SphereGeometry(data.size, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: data.color });
    const planet = new THREE.Mesh(geometry, material);
    planet.position.x = data.distance;
    planet.userData = data;
    planets[key] = planet;
    scene.add(planet);
  }

  window.addEventListener('resize', onResize);
  renderer.domElement.addEventListener('click', onClick);
  document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('triviaModal').style.display = 'none';
  });

  animate();
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function getIntersects(x, y) {
  mouse.x = (x / window.innerWidth) * 2 - 1;
  mouse.y = -(y / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  return raycaster.intersectObjects(Object.values(planets));
}

function onClick(event) {
  const intersects = getIntersects(event.clientX, event.clientY);
  if (intersects.length > 0) {
    const planet = intersects[0].object;
    showModal(planet.userData);
    updateScore(10);
  }
}

function showModal(data) {
  const modal = document.getElementById('triviaModal');
  modal.style.display = 'block';
  document.getElementById('planetTitle').textContent = data.name;
  document.getElementById('planetFact').textContent = data.fact;

  const question = data.quiz.question;
  const options = data.quiz.options;
  const answer = data.quiz.answer;

  document.getElementById('quizQuestion').textContent = question;
  const optionsDiv = document.getElementById('quizOptions');
  optionsDiv.innerHTML = '';

  options.forEach((opt, i) => {
    const div = document.createElement('div');
    div.textContent = opt;
    div.onclick = () => {
      if (i === answer) {
        div.style.background = 'green';
        updateScore(20);
      } else {
        div.style.background = 'red';
      }
    };
    optionsDiv.appendChild(div);
  });
}

function updateScore(points) {
  score += points;
  document.getElementById('score').textContent = score;
}

function animate() {
  requestAnimationFrame(animate);
  Object.values(planets).forEach((planet, i) => {
    planet.rotation.y += 0.01;
    const t = Date.now() * 0.0003;
    planet.position.x = Math.cos(t + i) * planet.userData.distance;
    planet.position.z = Math.sin(t + i) * planet.userData.distance;
  });
  controls.update();
  renderer.render(scene, camera);
}

init();
