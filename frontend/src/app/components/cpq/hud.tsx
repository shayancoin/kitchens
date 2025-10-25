'use client';

import { Box, Flex, Text } from '@chakra-ui/react';
import styles from './cpq-layout.module.css';

export interface CPQHudProps {
  status: string;
  fps: number;
  nodes: number;
  mode: string;
  trailsActive: boolean;
  glowActive: boolean;
  flowActive: boolean;
}

const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(value);

/**
 * Renders a compact CPQ heads-up display presenting system status, performance metrics, and feature states.
 *
 * @param status - Human-readable system status label shown next to the status indicator
 * @param fps - Frames-per-second value (displayed rounded)
 * @param nodes - Number of nodes (formatted with en-US grouping)
 * @param mode - Current mode label
 * @param trailsActive - Whether trails are active; displays "ACTIVE" or "DISABLED"
 * @param glowActive - Whether glow is active; displays "ENABLED" or "OFFLINE"
 * @param flowActive - Whether flow is active; displays "ACTIVE" or "STANDBY"
 * @returns The HUD as a JSX element suitable for rendering in the app UI
 */
export function CPQHud({
  status,
  fps,
  nodes,
  mode,
  trailsActive,
  glowActive,
  flowActive,
}: CPQHudProps) {
  return (
    <Box className={styles.hud} role="presentation">
      <Flex className={styles.hudLine} align="center">
        <Text>SYSTEM:</Text>
        <Flex align="center" gap={2}>
          <Text className={styles.hudValue}>{status}</Text>
          <Box className={styles.statusIndicator} aria-hidden />
        </Flex>
      </Flex>
      <Flex className={styles.hudLine}>
        <Text>FPS:</Text>
        <Text className={styles.hudValue}>{Math.round(fps)}</Text>
      </Flex>
      <Flex className={styles.hudLine}>
        <Text>NODES:</Text>
        <Text className={styles.hudValue}>{formatNumber(nodes)}</Text>
      </Flex>
      <Flex className={styles.hudLine}>
        <Text>MODE:</Text>
        <Text className={styles.hudValue}>{mode}</Text>
      </Flex>
      <Flex className={styles.hudLine}>
        <Text>FLOW:</Text>
        <Text className={styles.hudValue}>{flowActive ? 'ACTIVE' : 'STANDBY'}</Text>
      </Flex>
      <Flex className={styles.hudLine}>
        <Text>TRAILS:</Text>
        <Text className={styles.hudValue}>{trailsActive ? 'ACTIVE' : 'DISABLED'}</Text>
      </Flex>
      <Flex className={styles.hudLine}>
        <Text>GLOW:</Text>
        <Text className={styles.hudValue}>{glowActive ? 'ENABLED' : 'OFFLINE'}</Text>
      </Flex>
    </Box>
  );
}