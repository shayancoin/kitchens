'use client';

import { create } from 'zustand';
import type { Vector3Tuple } from 'three';

export type CameraPresetKey = 'isometric' | 'front' | 'plan';

export interface CameraPreset {
  id: CameraPresetKey;
  label: string;
  position: Vector3Tuple;
  target: Vector3Tuple;
  up?: Vector3Tuple;
}

export const cameraPresets: Record<CameraPresetKey, CameraPreset> = {
  isometric: {
    id: 'isometric',
    label: 'Isometric',
    position: [6, 4.5, 6],
    target: [0, 1.2, 0],
  },
  front: {
    id: 'front',
    label: 'Front',
    position: [0, 3, 8],
    target: [0, 1.3, 0],
  },
  plan: {
    id: 'plan',
    label: 'Plan (Top)',
    position: [0, 12, 0],
    target: [0, 0, 0],
    up: [0, 0, -1],
  },
};

export const cameraPresetOptions = Object.values(cameraPresets);

export type FinishOptionKey = 'default' | 'matte' | 'glossy';

export interface FinishOption {
  id: FinishOptionKey;
  label: string;
  description: string;
}

export const finishOptions: FinishOption[] = [
  { id: 'default', label: 'Default', description: 'Use the materials baked into the GLB.' },
  { id: 'matte', label: 'Matte', description: 'Softens reflections for a flatter preview.' },
  { id: 'glossy', label: 'Glossy', description: 'Highlights reflections to preview polished finishes.' },
];

interface KitchenViewerState {
  viewMode: '3d' | '2d';
  cameraPreset: CameraPresetKey;
  finish: FinishOptionKey;
  setViewMode: (viewMode: '3d' | '2d') => void;
  toggleViewMode: () => void;
  setCameraPreset: (preset: CameraPresetKey) => void;
  setFinish: (finish: FinishOptionKey) => void;
}

const deriveModeFromPreset = (preset: CameraPresetKey): '3d' | '2d' =>
  preset === 'plan' ? '2d' : '3d';

export const useKitchenViewerStore = create<KitchenViewerState>((set) => ({
  viewMode: '3d',
  cameraPreset: 'isometric',
  finish: 'default',
  setViewMode: (viewMode) =>
    set((state) => ({
      viewMode,
      cameraPreset:
        viewMode === '2d'
          ? 'plan'
          : state.cameraPreset === 'plan'
          ? 'isometric'
          : state.cameraPreset,
    })),
  toggleViewMode: () =>
    set((state) => {
      const nextMode = state.viewMode === '3d' ? '2d' : '3d';
      return {
        viewMode: nextMode,
        cameraPreset:
          nextMode === '2d'
            ? 'plan'
            : state.cameraPreset === 'plan'
            ? 'isometric'
            : state.cameraPreset,
      };
    }),
  setCameraPreset: (cameraPreset) =>
    set({
      cameraPreset,
      viewMode: deriveModeFromPreset(cameraPreset),
    }),
  setFinish: (finish) => set({ finish }),
}));

export const useKitchenViewerControls = () =>
  useKitchenViewerStore((state) => ({
    viewMode: state.viewMode,
    cameraPreset: state.cameraPreset,
    finish: state.finish,
    setViewMode: state.setViewMode,
    toggleViewMode: state.toggleViewMode,
    setCameraPreset: state.setCameraPreset,
    setFinish: state.setFinish,
  }));
