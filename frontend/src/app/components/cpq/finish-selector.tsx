'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import {
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react';
import { FinishCategory, FinishItem } from '../../types/cpq';
import { useConfigurationStore } from '../../stores/configuration-store';

interface FinishSelectorProps {
  category: FinishCategory;
}

/**
 * Group FinishItem objects by their `group` property.
 *
 * @param items - Array of finish items to group; each item's `group` value is used as the key.
 * @returns An object mapping group names to arrays of `FinishItem` that belong to that group.
 */
function groupItems(items: FinishItem[]): Record<string, FinishItem[]> {
  return items.reduce<Record<string, FinishItem[]>>((acc, item) => {
    if (!acc[item.group]) {
      acc[item.group] = [];
    }
    acc[item.group].push(item);
    return acc;
  }, {});
}

const FinishSelector: React.FC<FinishSelectorProps> = ({ category }) => {
  const { key, title, description, items } = category;
  const groupedItems = useMemo(() => groupItems(items), [items]);
  const groups = Object.keys(groupedItems).sort();
  const columns = useBreakpointValue({ base: 2, md: 3, xl: 4 }) ?? 2;
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const selectedItem = useConfigurationStore((state) => state.selections[key]);
  const setSelection = useConfigurationStore((state) => state.setSelection);
  const clearSelection = useConfigurationStore((state) => state.clearSelection);

  const renderItemCard = (item: FinishItem) => {
    const isSelected = selectedItem?.id === item.id;

    return (
      <GridItem key={item.id}>
        <Box
          role="button"
          tabIndex={0}
          onClick={() => setSelection(key, item)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setSelection(key, item);
            }
          }}
          borderWidth="2px"
          borderColor={isSelected ? 'brand.pink' : borderColor}
          borderRadius="lg"
          overflow="hidden"
          transition="border-color 0.2s ease"
          cursor="pointer"
          bg={cardBg}
          position="relative"
          _hover={{ borderColor: 'brand.purple' }}
        >
          <Box position="relative" width="100%" paddingTop="75%">
            <Image
              src={item.src}
              alt={item.name}
              fill
              sizes="(max-width: 768px) 50vw, 20vw"
              style={{ objectFit: 'cover' }}
            />
          </Box>
          <Box p={3}>
            <Stack spacing={1}>
              <Text fontWeight="semibold" fontSize="sm" noOfLines={2}>
                {item.name}
              </Text>
              <HStack justify="space-between">
                <Badge colorScheme="purple">{item.group}</Badge>
                {item.sku && (
                  <Badge colorScheme="pink" variant="subtle">
                    SKU: {item.sku}
                  </Badge>
                )}
              </HStack>
            </Stack>
          </Box>
          {isSelected && (
            <Badge
              position="absolute"
              top={2}
              right={2}
              colorScheme="pink"
              borderRadius="full"
              px={3}
              py={1}
            >
              Selected
            </Badge>
          )}
        </Box>
      </GridItem>
    );
  };

  return (
    <Stack spacing={4}>
      <Flex align={{ base: 'stretch', md: 'center' }} justify="space-between" direction={{ base: 'column', md: 'row' }}>
        <Box>
          <Heading as="h2" size="md">
            {title}
          </Heading>
          <Text color="gray.600" fontSize="sm">
            {description}
          </Text>
        </Box>
        {selectedItem && (
          <Button variant="outline" colorScheme="pink" onClick={() => clearSelection(key)}>
            Clear Selection
          </Button>
        )}
      </Flex>
      {groups.length > 1 ? (
        <Tabs variant="enclosed" colorScheme="pink" isLazy>
          <TabList>
            {groups.map((group) => (
              <Tab key={group}>{group}</Tab>
            ))}
          </TabList>
          <TabPanels>
            {groups.map((group) => (
              <TabPanel key={group} px={0}>
                <Grid templateColumns={`repeat(${columns}, 1fr)`} gap={4}>
                  {groupedItems[group].map((item) => renderItemCard(item))}
                </Grid>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      ) : (
        <Grid templateColumns={`repeat(${columns}, 1fr)`} gap={4}>
          {items.map((item) => renderItemCard(item))}
        </Grid>
      )}
    </Stack>
  );
};

export default FinishSelector;