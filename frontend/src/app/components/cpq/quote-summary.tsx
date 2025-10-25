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
import { ConfigurationPayload, FinishCategoryKey } from '../../types/cpq';

const categoryLabels: Record<FinishCategoryKey, string> = {
  countertop: 'Countertop Finish',
  door: 'Door Finish',
  texture: 'Texture',
};

function downloadPayload(payload: ConfigurationPayload): boolean {
  let url: string | undefined;
  let link: HTMLAnchorElement | undefined;
  let linkAppended = false;

  try {
    const dataStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    url = URL.createObjectURL(blob);

    link = document.createElement('a');
    link.href = url;
    link.download = `kitchen-config-${Date.now()}.json`;
    document.body.appendChild(link);
    linkAppended = true;
    link.click();

    return true;
  } catch (error) {
    console.error('Failed to export configuration payload', error);
    return false;
  } finally {
    if (link && linkAppended && link.parentNode) {
      link.parentNode.removeChild(link);
    }
    if (url) {
      URL.revokeObjectURL(url);
    }
  }
}

const QuoteSummary: React.FC = () => {
  const { selections, getPayload } = useConfigurationStore((state) => ({
    selections: state.selections,
    getPayload: state.getPayload,
  }));
  const toast = useToast();

  const payload = useMemo(() => getPayload(), [getPayload, selections]);
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

              const exportSucceeded = downloadPayload(payload);
              if (!exportSucceeded) {
                toast({
                  status: 'error',
                  title: 'Export failed',
                  description: 'We could not prepare the download. Please try again.',
                });
                return;
              }

              toast({ status: 'success', title: 'Configuration exported', duration: 2500 });
            }}
            isDisabled={!hasSelections}
            aria-disabled={!hasSelections}
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
