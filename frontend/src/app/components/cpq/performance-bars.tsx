'use client';

import { Box, Text } from '@chakra-ui/react';
import styles from './cpq-layout.module.css';

const metrics = [
  { label: 'CPU LOAD', barClass: styles.perfBarCpu },
  { label: 'GPU LOAD', barClass: styles.perfBarGpu },
  { label: 'MEMORY', barClass: styles.perfBarMemory },
];

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
