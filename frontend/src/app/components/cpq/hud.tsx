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
