'use client';

import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  Heading,
  Stack,
  Text,
  Wrap,
  WrapItem,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  cameraPresetOptions,
  finishOptions,
  useKitchenViewerControls,
} from '../stores/kitchen-viewer-store';

const CPQControls = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const {
    viewMode,
    setViewMode,
    cameraPreset,
    setCameraPreset,
    finish,
    setFinish,
  } = useKitchenViewerControls();

  return (
    <Stack spacing={6} data-testid="cpq-controls">
      <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" shadow="sm">
        <CardBody>
          <Heading as="h3" size="sm" mb={3} textTransform="uppercase" letterSpacing="wide">
            View Mode
          </Heading>
          <ButtonGroup isAttached variant="outline">
            <Button
              onClick={() => setViewMode('3d')}
              variant={viewMode === '3d' ? 'solid' : 'outline'}
            >
              3D
            </Button>
            <Button
              onClick={() => setViewMode('2d')}
              variant={viewMode === '2d' ? 'solid' : 'outline'}
            >
              2D
            </Button>
          </ButtonGroup>
          <Text fontSize="sm" mt={2} color="gray.600">
            Switch between interactive 3D exploration and a 2D plan view.
          </Text>
        </CardBody>
      </Card>

      <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" shadow="sm">
        <CardBody>
          <Heading as="h3" size="sm" mb={3} textTransform="uppercase" letterSpacing="wide">
            Camera Presets
          </Heading>
          <Wrap spacing={2} shouldWrapChildren>
            {cameraPresetOptions.map((preset) => (
              <WrapItem key={preset.id}>
                <Button
                  size="sm"
                  onClick={() => setCameraPreset(preset.id)}
                  variant={cameraPreset === preset.id ? 'solid' : 'outline'}
                >
                  {preset.label}
                </Button>
              </WrapItem>
            ))}
          </Wrap>
          <Text fontSize="sm" mt={2} color="gray.600">
            Camera selections automatically sync with the viewer and orbit controls.
          </Text>
        </CardBody>
      </Card>

      <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" shadow="sm">
        <CardBody>
          <Heading as="h3" size="sm" mb={3} textTransform="uppercase" letterSpacing="wide">
            Finish Preview
          </Heading>
          <Stack spacing={2}>
            {finishOptions.map((option) => (
              <Box
                key={option.id}
                borderWidth="1px"
                borderColor={finish === option.id ? 'brand.purple' : borderColor}
                borderRadius="md"
                p={3}
                cursor="pointer"
                bg={finish === option.id ? 'purple.50' : 'transparent'}
                onClick={() => setFinish(option.id)}
              >
                <Heading as="h4" size="xs">
                  {option.label}
                </Heading>
                <Text fontSize="xs" color="gray.600">
                  {option.description}
                </Text>
              </Box>
            ))}
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
};

export default CPQControls;
