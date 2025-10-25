'use client';

import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import { Canvas, useThree } from '@react-three/fiber';
import { Environment, Html, OrbitControls, useGLTF } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import {
  cameraPresets,
  useKitchenViewerStore,
} from '../stores/kitchen-viewer-store';

const MODEL_URL = new URL(
  '../../../../docs/assets/Kitchen/TECHNICAL DRAWINGS 3D/vvd.glb',
  import.meta.url,
).href;

type MaterialSnapshot = {
  wireframe: boolean;
  roughness: number;
  metalness: number;
  color: THREE.Color;
};

const recordMaterialSnapshot = (mesh: THREE.Mesh) => {
  const material = mesh.material as THREE.MeshStandardMaterial;
  if (!mesh.userData.__kitchenMaterialSnapshot) {
    mesh.userData.__kitchenMaterialSnapshot = {
      wireframe: material.wireframe,
      roughness: material.roughness,
      metalness: material.metalness,
      color: material.color.clone(),
    } satisfies MaterialSnapshot;
  }
  return mesh.userData.__kitchenMaterialSnapshot as MaterialSnapshot;
};

const KitchenModel = () => {
  const { viewMode, finish } = useKitchenViewerStore((state) => ({
    viewMode: state.viewMode,
    finish: state.finish,
  }));
  const gltf = useGLTF(MODEL_URL);
  const model = useMemo(() => gltf.scene.clone(true), [gltf.scene]);

  useEffect(() => {
    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const material = mesh.material as THREE.MeshStandardMaterial;
        const snapshot = recordMaterialSnapshot(mesh);

        material.wireframe = viewMode === '2d';

        switch (finish) {
          case 'matte': {
            material.roughness = 0.9;
            material.metalness = 0.1;
            material.color = snapshot.color.clone().multiplyScalar(0.95);
            break;
          }
          case 'glossy': {
            material.roughness = 0.15;
            material.metalness = 0.6;
            material.color = snapshot.color.clone();
            break;
          }
          default: {
            material.roughness = snapshot.roughness;
            material.metalness = snapshot.metalness;
            material.color = snapshot.color.clone();
          }
        }

        material.needsUpdate = true;
      }
    });
  }, [model, viewMode, finish]);

  return <primitive object={model} dispose={null} />;
};

const CameraRig = ({ controlsRef }: { controlsRef: React.RefObject<OrbitControlsImpl> }) => {
  const { camera } = useThree();
  const { cameraPreset, viewMode } = useKitchenViewerStore((state) => ({
    cameraPreset: state.cameraPreset,
    viewMode: state.viewMode,
  }));

  useEffect(() => {
    const key = viewMode === '2d' ? 'plan' : cameraPreset;
    const preset = cameraPresets[key];
    if (!preset) return;

    camera.position.set(...preset.position);
    camera.up.set(...(preset.up ?? ([0, 1, 0] as THREE.Vector3Tuple)));
    camera.lookAt(...preset.target);
    camera.updateProjectionMatrix();

    if (controlsRef.current) {
      controlsRef.current.target.set(...preset.target);
      controlsRef.current.update();
    }
  }, [camera, controlsRef, cameraPreset, viewMode]);

  return null;
};

const KitchenScene = () => {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box position="relative" w="100%" h="100%" borderColor={borderColor} data-testid="kitchen-scene">
      <Canvas
        shadows
        camera={{ position: cameraPresets.isometric.position, fov: 45, near: 0.1, far: 1000 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense
          fallback={
            <Html center>
              <div style={{
                padding: '0.5rem 1rem',
                background: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '0.75rem',
                color: '#1a202c',
                fontSize: '0.875rem',
              }}>
                Loading kitchen model…
              </div>
            </Html>
          }
        >
          <ambientLight intensity={0.6} />
          <directionalLight
            intensity={0.9}
            position={[8, 12, 6]}
            castShadow
            shadow-camera-far={50}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <spotLight intensity={0.35} position={[-4, 10, -6]} angle={0.45} penumbra={0.5} castShadow />
          <KitchenModel />
          <Environment preset="apartment" background={false} />
          <CameraRig controlsRef={controlsRef} />
          <OrbitControls
            ref={controlsRef}
            enableDamping
            dampingFactor={0.08}
            enablePan
            enableZoom
            minDistance={2}
            maxDistance={25}
            maxPolarAngle={Math.PI * 0.49}
          />
        </Suspense>
      </Canvas>
    </Box>
  );
};

export default KitchenScene;

useGLTF.preload(MODEL_URL);
