'use client';

import React, { useMemo } from 'react';
import {
  Badge,
  Box,
  Button,
  Divider,
  Heading,
  List,
  ListItem,
  Stack,
  Text,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import { DownloadIcon, ExternalLinkIcon, InfoIcon } from '@chakra-ui/icons';
import { useConfigurationStore } from '../../stores/configuration-store';
import { ConfigurationPayload, FinishCategoryKey, FinishItem } from '../../types/cpq';

const categoryLabels: Record<FinishCategoryKey, string> = {
  countertop: 'Countertop Finish',
  door: 'Door Finish',
  texture: 'Texture',
};

type SelectionMap = Partial<Record<FinishCategoryKey, FinishItem>>;

/**
 * Builds a configuration payload containing the current timestamp and the provided finish selections.
 *
 * @param selections - Map of selected finish items keyed by finish category
 * @returns An object with `generatedAt` set to the current ISO timestamp and `selections` containing a shallow copy of the provided selections
 */
function buildPayload(selections: SelectionMap): ConfigurationPayload {
  return {
    generatedAt: new Date().toISOString(),
    selections: { ...selections },
  };
}

/**
 * Triggers a browser download of the given configuration payload as a timestamped JSON file.
 *
 * @param payload - The configuration object to serialize and download; the file name will include the current timestamp (e.g., `kitchen-config-<timestamp>.json`).
 */
function downloadPayload(payload: ConfigurationPayload) {
  const dataStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `kitchen-config-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const QuoteSummary: React.FC = () => {
  const selections = useConfigurationStore((state) => state.selections);
  const toast = useToast();

  const payload = useMemo(() => buildPayload(selections), [selections]);
  const hasSelections = Object.keys(selections).length > 0;

  return (
    <Box borderWidth="1px" borderRadius="lg" p={5} bg="white" boxShadow="sm">
      <Stack spacing={4}>
        <Heading as="h3" size="md">
          Configuration Summary
        </Heading>
        <Text fontSize="sm" color="gray.600">
          Track finish selections and export data for pricing or CPQ workflows.
        </Text>
        <Divider />
        <List spacing={3}>
          {Object.entries(categoryLabels).map(([key, label]) => {
            const selection = selections[key as FinishCategoryKey];
            return (
              <ListItem key={key} display="flex" justifyContent="space-between" alignItems="center">
                <Stack spacing={0}>
                  <Text fontWeight="semibold">{label}</Text>
                  {selection ? (
                    <Text fontSize="sm" color="gray.600">
                      {selection.name}
                    </Text>
                  ) : (
                    <Text fontSize="sm" color="gray.400">
                      No selection yet
                    </Text>
                  )}
                </Stack>
                {selection ? (
                  <Badge colorScheme="pink">{selection.sku ?? selection.fileName}</Badge>
                ) : (
                  <Tooltip label="Select a finish to populate the quote." fontSize="xs">
                    <InfoIcon color="gray.300" />
                  </Tooltip>
                )}
              </ListItem>
            );
          })}
        </List>
        <Divider />
        <Stack spacing={2}>
          <Button
            colorScheme="pink"
            leftIcon={<DownloadIcon />}
            onClick={() => {
              if (!hasSelections) {
                toast({
                  status: 'warning',
                  title: 'No selections yet',
                  description: 'Choose at least one finish before exporting the configuration.',
                });
                return;
              }

              downloadPayload(payload);
              toast({ status: 'success', title: 'Configuration exported', duration: 2500 });
            }}
          >
            Export JSON
          </Button>
          <Button
            variant="outline"
            colorScheme="pink"
            leftIcon={<ExternalLinkIcon />}
            onClick={() => {
              toast({
                status: 'info',
                title: 'Pricing endpoint coming soon',
                description: 'We will send the configuration payload to the pricing API once available.',
              });
            }}
          >
            Send to Pricing API
          </Button>
        </Stack>
        <Box fontSize="xs" color="gray.500">
          <Text>
            Generated: <strong>{payload.generatedAt}</strong>
          </Text>
          <Text>
            Items tracked: <strong>{Object.keys(selections).length}</strong>
          </Text>
        </Box>
      </Stack>
    </Box>
  );
};

export default QuoteSummary;