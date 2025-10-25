import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

let scene, camera, renderer, dataNodes, trailSystem, backgroundNodes;
let composer, controls;
let time = 0;
let currentVisualization = 0;
let isTransforming = false;
let transformProgress = 0;
let frameCount = 0;
let lastTime = performance.now();
let fps = 60;

let dataFlow = true;
let showTrails = true;
let glowEffect = true;

const nodeCount = 28000;
const trailCount = 10000;
const transformSpeed = 0.018;

const visualizationNames = [
  "HARMONIC SPHERE",
  "TOROIDAL VORTEX",
  "NEBULA CORE"
];

let baseColors = ['#00ffff', '#ffff00', '#ff00ff'];
let colorSchemes = baseColors.map(generateScheme);

function generateScheme(baseHex) {
  const base = new THREE.Color(baseHex);
  const hsl = base.getHSL({h:0, s:0, l:0});
  const scheme = [];
  for (let i = 0; i < 10; i++) {
    const h = (hsl.h + (i - 5) * 0.03) % 1;
    const s = Math.min(1, Math.max(0, hsl.s + (i - 5) * 0.02));
    const l = Math.min(1, Math.max(0, hsl.l + (i - 5) * 0.03));
    const c = new THREE.Color().setHSL(h, s, l);
    scheme.push(c);
  }
  return scheme;
}

function updateCSSColors(baseHex) {
  const base = new THREE.Color(baseHex);
  const hsl = base.getHSL({h:0, s:0, l:0});

  const accentHsl = {h: hsl.h, s: hsl.s, l: Math.min(1, hsl.l + 0.4)};
  const accent = new THREE.Color().setHSL(accentHsl.h, accentHsl.s, accentHsl.l).getHexString();
  const secondaryHsl = {h: (hsl.h + 0.08) % 1, s: hsl.s * 0.8, l: hsl.l};
  const secondary = new THREE.Color().setHSL(secondaryHsl.h, secondaryHsl.s, secondaryHsl.l).getHexString();

  const startColor = new THREE.Color().setHSL(hsl.h - 0.05, hsl.s, hsl.l);
  const startHex = startColor.getHexString();

  const endColor = new THREE.Color().setHSL(hsl.h + 0.1, hsl.s * 0.8, hsl.l);
  const endHex = endColor.getHexString();

  document.documentElement.style.setProperty('--primary-color', baseHex);
  document.documentElement.style.setProperty('--accent-color', `#${accent}`);
  document.documentElement.style.setProperty('--secondary-color', `#${secondary}`);
  document.documentElement.style.setProperty('--gradient-start', `#${startHex}`);
  document.documentElement.style.setProperty('--gradient-middle', baseHex);
  document.documentElement.style.setProperty('--gradient-end', `#${endHex}`);

  const primaryRgb = `${Math.round(base.r * 255)}, ${Math.round(base.g * 255)}, ${Math.round(base.b * 255)}`;
  document.documentElement.style.setProperty('--primary-rgb', primaryRgb);

  const accentC = new THREE.Color(`#${accent}`);
  const accentRgb = `${Math.round(accentC.r * 255)}, ${Math.round(accentC.g * 255)}, ${Math.round(accentC.b * 255)}`;
  document.documentElement.style.setProperty('--accent-rgb', accentRgb);

  const secondaryC = new THREE.Color(`#${secondary}`);
  const secondaryRgb = `${Math.round(secondaryC.r * 255)}, ${Math.round(secondaryC.g * 255)}, ${Math.round(secondaryC.b * 255)}`;
  document.documentElement.style.setProperty('--secondary-rgb', secondaryRgb);
}

window.onload = initializeSystem;

function generateHarmonicSphere(i, count) {
  const t = i / count;
  const phi = Math.acos(1 - 2 * t);
  const theta = Math.PI * (1 + Math.sqrt(5)) * i;
  const radius = 80;
  const perturbation = 0.2 * (Math.sin(5 * phi) * Math.cos(3 * theta) + Math.cos(4 * phi) * Math.sin(2 * theta));
  const r = radius * (1 + perturbation);
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.sin(phi) * Math.sin(theta);
  const z = r * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

function generateToroidalVortex(i, count) {
  const t = i / count;
  const theta = t * Math.PI * 2;
  const phi = theta * 10 + Math.PI * (1 + Math.sqrt(5)) * t * 10;
  const major = 70;
  const minor = 25 + Math.sin(theta * 3) * 5;
  const x = (major + minor * Math.cos(phi)) * Math.cos(theta);
  const y = (major + minor * Math.cos(phi)) * Math.sin(theta);
  const z = minor * Math.sin(phi) + Math.cos(theta * 4) * 10;
  return new THREE.Vector3(x, y, z);
}

function generateNebulaCore(i, count) {
  const coreRatio = 0.25;
  const coreCount = Math.floor(count * coreRatio);
  if (i < coreCount) {
    const t = i / coreCount;
    const phi = Math.acos(1 - 2 * t);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i + Math.sin(t * 10) * 0.5;
    const radius = 25 * Math.pow(Math.random(), 1.5);
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi) + Math.sin(theta * 2) * 2;
    return new THREE.Vector3(x, y, z);
  } else {
    const ringParticles = count - coreCount;
    const ringIndex = i - coreCount;
    const numRings = 8;
    const ringNum = Math.floor(ringIndex / (ringParticles / numRings));
    const nodeInRing = ringIndex % Math.floor(ringParticles / numRings);
    const nodeInRingT = nodeInRing / Math.floor(ringParticles / numRings);
    const angle = nodeInRingT * Math.PI * 2 + Math.sin(ringNum * 2) * 0.3;
    const baseRadius = 35 + ringNum * 10;
    const ringRadius = baseRadius + Math.sin(angle * 4) * 5;
    const tiltAngle = (ringNum % 2 === 0 ? 1 : -1) * (Math.PI / 6 + ringNum * Math.PI / 15);
    const axisAngle = ringNum * Math.PI / 4;
    const axis = new THREE.Vector3(Math.sin(axisAngle), Math.cos(axisAngle), Math.sin(axisAngle * 2)).normalize();
    const rotationMatrix = new THREE.Matrix4().makeRotationAxis(axis, tiltAngle);
    const pos = new THREE.Vector3(
      Math.cos(angle) * ringRadius,
      0,
      Math.sin(angle) * ringRadius
    );
    pos.applyMatrix4(rotationMatrix);
    return pos;
  }
}

const visualizations = [
  generateHarmonicSphere,
  generateToroidalVortex,
  generateNebulaCore
];

function createTrailSystem() {
  const trailGeometry = new THREE.BufferGeometry();
  const trailPositions = new Float32Array(trailCount * 3);
  const trailColors = new Float32Array(trailCount * 3);
  const trailSizes = new Float32Array(trailCount);
  const trailOpacities = new Float32Array(trailCount);

  for (let i = 0; i < trailCount; i++) {
    trailPositions[i * 3]     = (Math.random() - 0.5) * 120;
    trailPositions[i * 3 + 1] = (Math.random() - 0.5) * 120;
    trailPositions[i * 3 + 2] = (Math.random() - 0.5) * 120;

    const colorScheme = colorSchemes[currentVisualization];
    const color = colorScheme[Math.floor(Math.random() * colorScheme.length)];
    trailColors[i * 3]     = color.r;
    trailColors[i * 3 + 1] = color.g;
    trailColors[i * 3 + 2] = color.b;

    trailSizes[i] = Math.random() * 2 + 0.8;
    trailOpacities[i] = Math.random() * 0.6 + 0.3;
  }

  trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
  trailGeometry.setAttribute('color', new THREE.BufferAttribute(trailColors, 3));
  trailGeometry.setAttribute('size', new THREE.BufferAttribute(trailSizes, 1));
  trailGeometry.setAttribute('opacity', new THREE.BufferAttribute(trailOpacities, 1));

  const trailMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      textureMap: { value: createTrailTexture() }
    },
    vertexShader: `
      attribute vec3 color;
      attribute float size;
      attribute float opacity;
      varying vec3 vColor;
      varying float vOpacity;
      uniform float time;
      void main() {
        vColor = color;
        vOpacity = opacity * (0.5 + 0.5 * sin(time + position.x * 0.1));
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform sampler2D textureMap;
      varying vec3 vColor;
      varying float vOpacity;
      void main() {
        vec4 tex = texture2D(textureMap, gl_PointCoord);
        gl_FragColor = vec4(vColor * tex.rgb, tex.a * vOpacity);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  trailSystem = new THREE.Points(trailGeometry, trailMaterial);
  scene.add(trailSystem);
}

function createTrailTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
  gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.5)');
  gradient.addColorStop(0.8, 'rgba(255, 255, 255, 0.2)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createBackgroundParticles() {
  const bgGeometry = new THREE.BufferGeometry();
  const bgCount = 3000;
  const bgPositions = new Float32Array(bgCount * 3);
  const bgColors = new Float32Array(bgCount * 3);
  const bgSizes = new Float32Array(bgCount);

  for (let i = 0; i < bgCount; i++) {
    const radius = 250 + Math.random() * 350;
    const phi = Math.random() * Math.PI * 2;
    const theta = Math.random() * Math.PI;

    bgPositions[i * 3]     = radius * Math.sin(theta) * Math.cos(phi);
    bgPositions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
    bgPositions[i * 3 + 2] = radius * Math.cos(theta);

    const intensity = Math.random() * 0.4 + 0.2;
    bgColors[i * 3]     = intensity * 0.3;
    bgColors[i * 3 + 1] = intensity * 0.4;
    bgColors[i * 3 + 2] = intensity * 0.6;

    bgSizes[i] = Math.random() * 3 + 1;
  }

  bgGeometry.setAttribute('position', new THREE.BufferAttribute(bgPositions, 3));
  bgGeometry.setAttribute('color', new THREE.BufferAttribute(bgColors, 3));
  bgGeometry.setAttribute('size', new THREE.BufferAttribute(bgSizes, 1));

  const bgMaterial = new THREE.PointsMaterial({
    size: 1.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  backgroundNodes = new THREE.Points(bgGeometry, bgMaterial);
  scene.add(backgroundNodes);
}

function initializeSystem() {
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000814, 0.0005);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2500);
  camera.position.set(0, 0, 155);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  document.getElementById('container').appendChild(renderer.domElement);

  setupCameraControls();
  setupPostProcessing();
  createDataVisualization();
  createTrailSystem();
  createBackgroundParticles();
  setupEventHandlers();

  updateCSSColors(baseColors[currentVisualization]);
  document.getElementById('color-picker').value = baseColors[currentVisualization];
  displayVisualizationName(visualizationNames[currentVisualization]);

  executeMainLoop();
}

function setupCameraControls() {
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.rotateSpeed = 0.6;
  controls.zoomSpeed = 0.9;
  controls.minDistance = 30;
  controls.maxDistance = 350;
  controls.enablePan = false;
}

function setupPostProcessing() {
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.5, 0.6, 0.8
  );
  composer.addPass(bloomPass);

  const distortionShader = {
    uniforms: {
      tDiffuse: { value: null },
      time: { value: 0.0 },
      intensity: { value: 0.02 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float time;
      uniform float intensity;
      varying vec2 vUv;
      void main() {
        vec2 uv = vUv;
        uv.x += sin(uv.y * 10.0 + time) * intensity;
        uv.y += cos(uv.x * 10.0 + time) * intensity;
        gl_FragColor = texture2D(tDiffuse, uv);
      }
    `
  };
  const distortionPass = new ShaderPass(distortionShader);
  composer.addPass(distortionPass);
  composer.addPass(new OutputPass());
}

function createDataVisualization() {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(nodeCount * 3);
  const colors = new Float32Array(nodeCount * 3);
  const sizes = new Float32Array(nodeCount);

  const initialVisualization = visualizations[currentVisualization];
  for (let i = 0; i < nodeCount; i++) {
    const pos = initialVisualization(i, nodeCount);
    positions[i * 3]     = pos.x;
    positions[i * 3 + 1] = pos.y;
    positions[i * 3 + 2] = pos.z;
    assignParticleProperties(i, colors, sizes, currentVisualization);
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.userData.currentColors = new Float32Array(colors);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      textureMap: { value: createEnhancedParticleTexture() },
      glowIntensity: { value: 1.0 }
    },
    vertexShader: `
      attribute vec3 color;
      attribute float size;
      varying vec3 vColor;
      uniform float time;
      uniform float glowIntensity;
      void main() {
        vColor = color * (1.0 + 0.2 * sin(time * 2.0 + position.y * 0.05)) * glowIntensity;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (350.0 / -mvPosition.z) * (1.0 + 0.1 * sin(time + position.x));
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform sampler2D textureMap;
      uniform float time;
      varying vec3 vColor;
      void main() {
        vec2 uv = gl_PointCoord - vec2(0.5);
        float r = length(uv) * 2.0;
        vec4 tex = texture2D(textureMap, gl_PointCoord);
        float alpha = tex.a * (1.0 - smoothstep(0.8, 1.0, r));
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  dataNodes = new THREE.Points(geometry, material);
  scene.add(dataNodes);
}

function assignParticleProperties(i, colors, sizes, vizIndex) {
  const colorScheme = colorSchemes[vizIndex];
  let color;
  let brightness = 1.0;
  if (sizes) {
    if (vizIndex === 0) {
      const channelIndex = Math.floor((i / nodeCount) * 12);
      color = colorScheme[channelIndex % colorScheme.length];
      brightness = 0.8 + Math.random() * 0.7;
      sizes[i] = 1.0 + Math.random() * 2.5;
    } else if (vizIndex === 1) {
      const layerIndex = Math.floor(i / (nodeCount / 10));
      color = colorScheme[layerIndex % colorScheme.length];
      brightness = 0.9 + Math.random() * 0.6;
      sizes[i] = 1.0 + Math.random() * 2.5;
    } else {
      const coreRatio = 0.25;
      const coreCount = Math.floor(nodeCount * coreRatio);
      if (i < coreCount) {
        color = colorScheme[i % 4];
        brightness = 1.2 + Math.random() * 0.6;
        sizes[i] = 2.0 + Math.random() * 2.5;
      } else {
        color = colorScheme[4 + (i % (colorScheme.length - 4))];
        brightness = 0.8 + Math.random() * 0.6;
        sizes[i] = 1.0 + Math.random() * 2.0;
      }
    }
  } else {
    const channelIndex = Math.floor((i / nodeCount) * 12);
    color = colorScheme[channelIndex % colorScheme.length];
    brightness = 1.0;
  }
  colors[i * 3]     = color.r * brightness;
  colors[i * 3 + 1] = color.g * brightness;
  colors[i * 3 + 2] = color.b * brightness;
}

function createEnhancedParticleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');

  const centerX = 128, centerY = 128;
  const outerGradient = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, 128);
  outerGradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
  outerGradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.7)');
  outerGradient.addColorStop(0.6, 'rgba(200, 255, 255, 0.4)');
  outerGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  context.fillStyle = outerGradient;
  context.fillRect(0, 0, 256, 256);

  const coreGradient = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, 20);
  coreGradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
  coreGradient.addColorStop(1, 'rgba(200, 255, 255, 0.3)');

  context.fillStyle = coreGradient;
  context.beginPath();
  context.arc(centerX, centerY, 20, 0, Math.PI * 2);
  context.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function setupEventHandlers() {
  window.addEventListener('resize', onSystemResize);

  const flowSwitch = document.getElementById('flow-switch');
  if (flowSwitch) {
    flowSwitch.addEventListener('click', () => {
      dataFlow = !dataFlow;
      flowSwitch.classList.toggle('active', dataFlow);
    });
  }

  const trailsSwitch = document.getElementById('trails-switch');
  if (trailsSwitch) {
    trailsSwitch.addEventListener('click', () => {
      showTrails = !showTrails;
      trailsSwitch.classList.toggle('active', showTrails);
      if (trailSystem) {
        trailSystem.visible = showTrails;
        document.getElementById('trail-display').textContent = showTrails ? 'ACTIVE' : 'INACTIVE';
      }
    });
  }

  const glowSwitch = document.getElementById('glow-switch');
  if (glowSwitch) {
    glowSwitch.addEventListener('click', () => {
      glowEffect = !glowEffect;
      glowSwitch.classList.toggle('active', glowEffect);
      if (dataNodes) {
        dataNodes.material.uniforms.glowIntensity.value = glowEffect ? 1.0 : 0.5;
      }
      document.getElementById('glow-display').textContent = glowEffect ? 'ENABLED' : 'DISABLED';
    });
  }

  const colorPicker = document.getElementById('color-picker');
  if (colorPicker) {
    colorPicker.addEventListener('input', (e) => {
      baseColors[currentVisualization] = e.target.value;
      colorSchemes[currentVisualization] = generateScheme(e.target.value);

      const colors = dataNodes.geometry.attributes.color.array;
      for (let i = 0; i < nodeCount; i++) {
        assignParticleProperties(i, colors, null, currentVisualization);
      }
      dataNodes.geometry.attributes.color.needsUpdate = true;

      const trailColors = trailSystem.geometry.attributes.color.array;
      const scheme = colorSchemes[currentVisualization];
      for (let i = 0; i < trailCount; i++) {
        const c = scheme[Math.floor(Math.random() * scheme.length)];
        trailColors[i * 3]     = c.r;
        trailColors[i * 3 + 1] = c.g;
        trailColors[i * 3 + 2] = c.b;
      }
      trailSystem.geometry.attributes.color.needsUpdate = true;

      updateCSSColors(e.target.value);
    });
  }

  const executeBtn = document.getElementById('execute-btn');
  if (executeBtn) {
    executeBtn.addEventListener('click', executeTransformation);
    executeBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      executeTransformation();
    });
  }

  const controlsToggle = document.getElementById('controls-toggle');
  const controlPanel = document.getElementById('control-panel');
  if (controlsToggle && controlPanel) {
    controlsToggle.addEventListener('click', () => {
      controlPanel.classList.toggle('expanded');
    });
  }
}

function executeTransformation() {
  if (isTransforming) return;
  const nextVisualization = (currentVisualization + 1) % visualizations.length;
  transformToVisualization(nextVisualization);
  displayVisualizationName(visualizationNames[nextVisualization]);
}

function transformToVisualization(newVisualization) {
  document.getElementById('color-picker').value = baseColors[newVisualization];
  updateCSSColors(baseColors[newVisualization]);

  isTransforming = true;
  transformProgress = 0;

  const positions = dataNodes.geometry.attributes.position.array;
  const colors = dataNodes.geometry.attributes.color.array;
  const sizes = dataNodes.geometry.attributes.size.array;

  const currentPositions = new Float32Array(positions);
  const currentColors = new Float32Array(dataNodes.geometry.userData.currentColors);
  const currentSizes = new Float32Array(sizes);

  const visualizationFunction = visualizations[newVisualization];
  const newPositions = new Float32Array(positions.length);
  const newColors = new Float32Array(colors.length);
  const newSizes = new Float32Array(sizes.length);

  for (let i = 0; i < nodeCount; i++) {
    const pos = visualizationFunction(i, nodeCount);
    newPositions[i * 3]     = pos.x;
    newPositions[i * 3 + 1] = pos.y;
    newPositions[i * 3 + 2] = pos.z;
    assignParticleProperties(i, newColors, newSizes, newVisualization);
  }

  dataNodes.userData.fromPositions = currentPositions;
  dataNodes.userData.toPositions = newPositions;
  dataNodes.userData.fromColors = currentColors;
  dataNodes.userData.toColors = newColors;
  dataNodes.userData.fromSizes = currentSizes;
  dataNodes.userData.toSizes = newSizes;
  dataNodes.userData.targetVisualization = newVisualization;

  if (trailSystem) {
    const trailColors = trailSystem.geometry.attributes.color.array;
    const newColorScheme = colorSchemes[newVisualization];
    for (let i = 0; i < trailCount; i++) {
      const color = newColorScheme[Math.floor(Math.random() * newColorScheme.length)];
      trailColors[i * 3]     = color.r;
      trailColors[i * 3 + 1] = color.g;
      trailColors[i * 3 + 2] = color.b;
    }
    trailSystem.geometry.attributes.color.needsUpdate = true;
  }
}

function displayVisualizationName(name) {
  const modeElement = document.getElementById('mode-display');
  modeElement.textContent = name;
}

function updateSystemStatus() {
  frameCount++;
  const currentTime = performance.now();
  if (currentTime - lastTime >= 1000) {
    fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
    document.getElementById('fps-display').textContent = fps;
    document.getElementById('node-display').textContent = nodeCount.toLocaleString();
    frameCount = 0;
    lastTime = currentTime;
  }
}

function animateTrailSystem() {
  if (!trailSystem || !showTrails) return;
  const positions = trailSystem.geometry.attributes.position.array;
  const opacities = trailSystem.geometry.attributes.opacity.array;

  for (let i = 0; i < trailCount; i++) {
    const ix = i * 3, iy = ix + 1, iz = ix + 2;
    switch(currentVisualization) {
      case 0:
        positions[iy] += 0.35;
        if (positions[iy] > 70) positions[iy] = -70;
        positions[ix] += Math.sin(time * 2.2 + i * 0.12) * 0.12;
        positions[iz] += Math.cos(time * 2.0 + i * 0.12) * 0.12;
        break;
      case 1:
        const distance = Math.sqrt(positions[ix] * positions[ix] + positions[iz] * positions[iz]);
        if (distance > 0.1) {
          const expansion = 1 + Math.sin(time * 3.5 + i * 0.06) * 0.006;
          positions[ix] *= expansion;
          positions[iz] *= expansion;
        }
        positions[iy] += Math.sin(time * 2.8 + i * 0.04) * 0.25;
        break;
      case 2:
        const orbitSpeed = 0.012 + (i % 6) * 0.006;
        const x = positions[ix];
        const z = positions[iz];
        positions[ix] = x * Math.cos(orbitSpeed) - z * Math.sin(orbitSpeed);
        positions[iz] = x * Math.sin(orbitSpeed) + z * Math.cos(orbitSpeed);
        positions[iy] += Math.sin(time * 1.5 + i * 0.08) * 0.15;
        break;
    }
    opacities[i] = 0.4 + Math.sin(time * 3.5 + i * 0.12) * 0.35;
  }

  trailSystem.geometry.attributes.position.needsUpdate = true;
  trailSystem.geometry.attributes.opacity.needsUpdate = true;
  trailSystem.material.uniforms.time.value = time;
}

function animateDataFlow() {
  if (!dataNodes || isTransforming || !dataFlow) return;
  const positions = dataNodes.geometry.attributes.position.array;
  switch(currentVisualization) {
    case 0:
      for (let i = 0; i < nodeCount; i++) {
        const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
        const x = positions[ix];
        const z = positions[iz];
        positions[ix] = x * Math.cos(0.005) - z * Math.sin(0.005);
        positions[iz] = x * Math.sin(0.005) + z * Math.cos(0.005);
      }
      dataNodes.geometry.attributes.position.needsUpdate = true;
      break;
    case 1:
      for (let i = 0; i < nodeCount; i++) {
        const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
        const x = positions[ix];
        const y = positions[iy];
        positions[ix] = x * Math.cos(0.004) - y * Math.sin(0.004);
        positions[iy] = x * Math.sin(0.004) + y * Math.cos(0.004);
      }
      dataNodes.geometry.attributes.position.needsUpdate = true;
      break;
    case 2:
      const coreRatio = 0.25;
      const coreCount = Math.floor(nodeCount * coreRatio);
      for (let i = 0; i < nodeCount; i++) {
        const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
        let x = positions[ix], y = positions[iy], z = positions[iz];
        let rotationSpeed;
        if (i < coreCount) {
          rotationSpeed = 0.0015;
        } else {
          const ringParticles = nodeCount - coreCount;
          const ringIndex = i - coreCount;
          const numRings = 8;
          const ringNum = Math.floor(ringIndex / (ringParticles / numRings));
          rotationSpeed = 0.0025 + ringNum * 0.002;
        }
        positions[ix] = x * Math.cos(rotationSpeed) - z * Math.sin(rotationSpeed);
        positions[iz] = x * Math.sin(rotationSpeed) + z * Math.cos(rotationSpeed);
      }
      dataNodes.geometry.attributes.position.needsUpdate = true;
      break;
  }
}

function onSystemResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}

function executeMainLoop() {
  requestAnimationFrame(executeMainLoop);
  time += 0.012;

  updateSystemStatus();
  controls.update();

  if (backgroundNodes) {
    backgroundNodes.rotation.y += 0.0004;
    backgroundNodes.rotation.x += 0.00015;
  }

  if (isTransforming) {
    transformProgress += transformSpeed;
    if (transformProgress >= 1.0) {
      const positions = dataNodes.geometry.attributes.position.array;
      const colors = dataNodes.geometry.attributes.color.array;
      const sizes = dataNodes.geometry.attributes.size.array;

      positions.set(dataNodes.userData.toPositions);
      colors.set(dataNodes.userData.toColors);
      sizes.set(dataNodes.userData.toSizes);

      dataNodes.geometry.attributes.position.needsUpdate = true;
      dataNodes.geometry.attributes.color.needsUpdate = true;
      dataNodes.geometry.attributes.size.needsUpdate = true;
      dataNodes.geometry.userData.currentColors = new Float32Array(dataNodes.userData.toColors);
      currentVisualization = dataNodes.userData.targetVisualization;
      isTransforming = false;
      transformProgress = 0;
    } else {
      const positions = dataNodes.geometry.attributes.position.array;
      const colors = dataNodes.geometry.attributes.color.array;
      const sizes = dataNodes.geometry.attributes.size.array;
      const t = transformProgress;
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      for (let i = 0; i < positions.length; i++) {
        positions[i] = dataNodes.userData.fromPositions[i] * (1 - ease) + dataNodes.userData.toPositions[i] * ease;
        colors[i]    = dataNodes.userData.fromColors[i]    * (1 - ease) + dataNodes.userData.toColors[i]    * ease;
      }
      for (let i = 0; i < sizes.length; i++) {
        sizes[i] = dataNodes.userData.fromSizes[i] * (1 - ease) + dataNodes.userData.toSizes[i] * ease;
      }
      dataNodes.geometry.attributes.position.needsUpdate = true;
      dataNodes.geometry.attributes.color.needsUpdate = true;
      dataNodes.geometry.attributes.size.needsUpdate = true;
    }
  } else {
    animateDataFlow();
  }

  animateTrailSystem();

  if (dataNodes) {
    dataNodes.material.uniforms.time.value = time;
  }
  composer.passes[2].uniforms.time.value = time;
  composer.render();
}
