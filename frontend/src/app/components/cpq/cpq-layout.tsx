'use client';

import { Box } from '@chakra-ui/react';
import { useMemo, useState, type CSSProperties } from 'react';
import styles from './cpq-layout.module.css';
import { CPQHud } from './hud';
import { CPQPerformanceBars } from './performance-bars';
import { CPQControlPanel } from './control-panel';

const MODES = ['HARMONIC SPHERE', 'RESONANT GRID', 'LUMEN CASCADE', 'SINGULARITY BLOOM'];

const normalizeHex = (hex: string) => {
  if (!hex) return '#00ffff';
  const value = hex.trim().replace('#', '');
  if (value.length === 3) {
    return `#${value.split('').map((ch) => ch + ch).join('')}`.toLowerCase();
  }
  if (value.length === 6) {
    return `#${value.toLowerCase()}`;
  }
  return '#00ffff';
};

const hexToRgbArray = (hex: string) => {
  const safeHex = normalizeHex(hex).replace('#', '');
  const bigint = parseInt(safeHex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b] as const;
};

const toRgbString = (hex: string) => hexToRgbArray(hex).join(', ');

const lightenColor = (hex: string, amount: number) => {
  const [r, g, b] = hexToRgbArray(hex);
  const lighten = (channel: number) => Math.round(channel + (255 - channel) * amount);
  const toHex = (channel: number) => channel.toString(16).padStart(2, '0');
  return `#${toHex(lighten(r))}${toHex(lighten(g))}${toHex(lighten(b))}`;
};

export function CPQLayout() {
  const [modeIndex, setModeIndex] = useState(0);
  const [flowActive, setFlowActive] = useState(true);
  const [trailsActive, setTrailsActive] = useState(true);
  const [glowActive, setGlowActive] = useState(true);
  const [fps, setFps] = useState(60);
  const [nodes, setNodes] = useState(28000);
  const [accentColor, setAccentColor] = useState('#00ffff');

  const mode = MODES[modeIndex];
  const status = flowActive || trailsActive || glowActive ? 'ONLINE' : 'STANDBY';

  const stageStyle = useMemo(() => {
    const primary = normalizeHex(accentColor);
    const accent = lightenColor(primary, 0.25);
    const primaryRgb = toRgbString(primary);
    const accentRgb = toRgbString(accent);
    return {
      '--cpq-primary': primary,
      '--cpq-primary-rgb': primaryRgb,
      '--cpq-accent': accent,
      '--cpq-accent-rgb': accentRgb,
      '--cpq-secondary': '#0088ff',
      '--cpq-secondary-rgb': '0, 136, 255',
    } as CSSProperties;
  }, [accentColor]);

  const handleExecute = () => {
    setModeIndex((index) => (index + 1) % MODES.length);
    setFps((value) => (value >= 64 ? 58 : value + 2));
    setNodes((value) => (value >= 34000 ? 27500 : value + 1500));
  };

  return (
    <Box className={styles.stage} style={stageStyle} role="presentation">
      <Box className={styles.background} aria-hidden />
      <Box className={styles.gridOverlay} aria-hidden />
      <Box className={styles.techPattern} aria-hidden />
      <Box className={styles.circuitLines} aria-hidden />
      <Box className={styles.scanLine} aria-hidden />

      <Box className={styles.canvasLayer} aria-label="Particle synthesis viewport">
        PARTICLE SYNTHESIS MATRIX
      </Box>

      <Box className={styles.dataStream} aria-hidden>
        {mode}
      </Box>

      <CPQHud
        status={status}
        fps={fps}
        nodes={nodes}
        mode={mode}
        trailsActive={trailsActive}
        glowActive={glowActive}
        flowActive={flowActive}
      />

      <CPQPerformanceBars />

      <CPQControlPanel
        toggles={[
          { id: 'data_flow', label: 'DATA_FLOW', active: flowActive, onToggle: () => setFlowActive((value) => !value) },
          { id: 'trails', label: 'TRAILS', active: trailsActive, onToggle: () => setTrailsActive((value) => !value) },
          { id: 'glow', label: 'GLOW_EFFECT', active: glowActive, onToggle: () => setGlowActive((value) => !value) },
        ]}
        accentColor={accentColor}
        onAccentChange={setAccentColor}
        onExecute={handleExecute}
      />
    </Box>
  );
}

export default CPQLayout;
