'use client';

import { Box, Text } from '@chakra-ui/react';
import styles from './cpq-layout.module.css';

const metrics = [
  { label: 'CPU LOAD', barClass: styles.perfBarCpu },
  { label: 'GPU LOAD', barClass: styles.perfBarGpu },
  { label: 'MEMORY', barClass: styles.perfBarMemory },
];

/**
 * Render a row of labeled performance bars for CPU, GPU, and memory.
 *
 * Each item shows a label and a decorative bar; the container uses role="presentation"
 * and each bar is marked `aria-hidden` so it is ignored by assistive technologies.
 *
 * @returns A React element containing the labeled performance bars where the visual bars are decorative and hidden from assistive technologies.
 */
export function CPQPerformanceBars() {
  return (
    <Box className={styles.performanceBars} role="presentation">
      {metrics.map((metric) => (
        <Box key={metric.label}>
          <Text className={styles.perfLabel}>{metric.label}</Text>
          <Box className={`${styles.perfBar} ${metric.barClass}`} aria-hidden />
        </Box>
      ))}
    </Box>
  );
}