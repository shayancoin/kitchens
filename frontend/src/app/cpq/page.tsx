'use client';

import dynamic from 'next/dynamic';
import {
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import CPQControls from '../components/cpq-controls';

const KitchenScene = dynamic(() => import('../components/KitchenScene'), {
  ssr: false,
  loading: () => (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      w="100%"
      h="100%"
      minH="320px"
    >
      <Text fontSize="sm" color="gray.600">
        Preparing kitchen viewer…
      </Text>
    </Box>
  ),
});

const CPQPage = () => {
  const pageBg = useColorModeValue('gray.50', 'gray.900');
  const surfaceBg = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box as="main" minH="100vh" py={{ base: 8, md: 12 }} bg={pageBg}>
      <Container maxW="7xl">
        <Stack spacing={8}>
          <Stack spacing={2}>
            <Heading size="lg">Kitchen CPQ</Heading>
            <Text color="gray.600">
              Configure layout perspectives and finishes to preview the kitchen design in real time.
            </Text>
          </Stack>
          <Grid
            templateColumns={{ base: '1fr', xl: 'minmax(0, 1fr) 360px' }}
            gap={{ base: 6, lg: 8 }}
            alignItems="start"
            minH="600px"
          >
            <GridItem minH={{ base: '320px', md: '520px' }}>
              <Box
                borderRadius="lg"
                overflow="hidden"
                borderWidth="1px"
                borderColor={borderColor}
                bg={surfaceBg}
                minH="100%"
              >
                <KitchenScene />
              </Box>
            </GridItem>
            <GridItem>
              <CPQControls />
            </GridItem>
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
};

export default CPQPage;
