'use client';

import { Box, Button, Flex, Input } from '@chakra-ui/react';
import { useState } from 'react';
import styles from './cpq-layout.module.css';

export interface CPQToggleControl {
  id: string;
  label: string;
  active: boolean;
  onToggle: () => void;
}

export interface CPQControlPanelProps {
  toggles: CPQToggleControl[];
  accentColor: string;
  onAccentChange: (hex: string) => void;
  onExecute: () => void;
}

const joinClassNames = (...tokens: Array<string | false | null | undefined>) =>
  tokens.filter(Boolean).join(' ');

export function CPQControlPanel({ toggles, accentColor, onAccentChange, onExecute }: CPQControlPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Box
      className={joinClassNames(styles.controlPanel, isExpanded ? styles.controlPanelExpanded : undefined)}
      role="region"
      aria-label="Control panel"
    >
      <Button
        type="button"
        onClick={() => setIsExpanded((value) => !value)}
        className={styles.controlsToggle}
        variant="unstyled"
        aria-expanded={isExpanded}
      >
        <svg className={styles.controlIcon} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="21" x2="4" y2="14" />
          <line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" />
          <line x1="20" y1="12" x2="20" y2="3" />
          <line x1="1" y1="14" x2="7" y2="14" />
          <line x1="9" y1="8" x2="15" y2="8" />
          <line x1="17" y1="16" x2="23" y2="16" />
        </svg>
        CONTROLS
      </Button>

      <Flex className={styles.controlSection} align="center" wrap="wrap">
        {toggles.map((toggle) => (
          <Box key={toggle.id} className={styles.switchGroup}>
            <Box
              as="button"
              type="button"
              className={joinClassNames(styles.cyberSwitch, toggle.active ? styles.cyberSwitchActive : undefined)}
              onClick={toggle.onToggle}
              aria-pressed={toggle.active}
              aria-label={`${toggle.label} toggle`}
            />
            <Box
              as="button"
              type="button"
              className={styles.switchLabel}
              onClick={toggle.onToggle}
            >
              {toggle.label}
            </Box>
          </Box>
        ))}
        <Box as="span" className={styles.switchLabel}>COLOR</Box>
        <Input
          className={styles.colorInput}
          type="color"
          value={accentColor}
          variant="unstyled"
          onChange={(event) => onAccentChange(event.target.value)}
          aria-label="Accent color selector"
        />
      </Flex>

      <Button type="button" onClick={onExecute} className={styles.executeButton} variant="unstyled">
        <svg className={styles.controlIcon} viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5,3 19,12 5,21" />
        </svg>
        EXECUTE_NEXT
      </Button>
    </Box>
  );
}
