import React from 'react';
import {
  AspectRatio,
  Badge,
  Box,
  Button,
  Divider,
  Heading,
  HStack,
  Link,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { ArrowDownIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { DATASHEET_URL } from '../../lib/kitchen-assets';
import { DwgAsset } from '../../types/cpq';

interface DrawingsPanelProps {
  drawings: DwgAsset[];
}

function formatFileSize(bytes?: number): string {
  if (bytes == null) return 'Unknown size';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

const DrawingsPanel: React.FC<DrawingsPanelProps> = ({ drawings }) => {
  return (
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden" bg="white" boxShadow="sm">
      <Stack spacing={0}>
        <Box p={5}>
          <Stack spacing={3}>
            <Heading as="h3" size="md">
              Technical Drawings & Datasheet
            </Heading>
            <Text fontSize="sm" color="gray.600">
              Download CAD assets for kitchen layouts and review the latest product datasheet without leaving the configurator.
            </Text>
          </Stack>
        </Box>
        <Divider />
        <VStack align="stretch" spacing={0} divider={<Divider />}>
          <Box p={5}>
            <Heading as="h4" size="sm" mb={3}>
              2D DWG Downloads
            </Heading>
            <Stack spacing={3}>
              {drawings.length > 0 ? (
                drawings.map((asset) => (
                  <Box key={asset.fileName} borderWidth="1px" borderRadius="md" p={3}>
                    <HStack justify="space-between" align="flex-start">
                      <Stack spacing={0}>
                        <Text fontWeight="semibold">{asset.label}</Text>
                        <Text fontSize="xs" color="gray.500">
                          {asset.fileName}
                        </Text>
                      </Stack>
                      <HStack spacing={2}>
                        <Badge colorScheme="purple">{formatFileSize(asset.sizeInBytes)}</Badge>
                        <Button
                          as={Link}
                          href={asset.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          leftIcon={<ExternalLinkIcon />}
                          size="sm"
                          variant="ghost"
                          colorScheme="pink"
                          aria-label={`Preview ${asset.fileName}`}
                        >
                          Preview
                        </Button>
                        <Button
                          as={Link}
                          href={asset.url}
                          download
                          leftIcon={<ArrowDownIcon />}
                          size="sm"
                          colorScheme="pink"
                          aria-label={`Download ${asset.fileName}`}
                        >
                          Download
                        </Button>
                      </HStack>
                    </HStack>
                  </Box>
                ))
              ) : (
                <Box borderWidth="1px" borderRadius="md" p={3} textAlign="center" color="gray.500">
                  No 2D drawings were found in the technical archive.
                </Box>
              )}
            </Stack>
          </Box>
          <Box p={5}>
            <Heading as="h4" size="sm" mb={3}>
              Datasheet Reference
            </Heading>
            <AspectRatio ratio={4 / 5} borderWidth="1px" borderRadius="md" overflow="hidden">
              <iframe
                src={`${DATASHEET_URL}#toolbar=0&navpanes=0`}
                title="Kitchen Datasheet"
                style={{ border: '0' }}
              />
            </AspectRatio>
            <Button
              mt={3}
              as={Link}
              href={DATASHEET_URL}
              leftIcon={<ExternalLinkIcon />}
              colorScheme="pink"
              variant="outline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Datasheet In New Tab
            </Button>
          </Box>
        </VStack>
      </Stack>
    </Box>
  );
};

export default DrawingsPanel;
