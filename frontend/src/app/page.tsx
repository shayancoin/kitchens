import Header from './components/header'
import { Box, Container, GridItem, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import FinishSelector from './components/cpq/finish-selector'
import QuoteSummary from './components/cpq/quote-summary'
import DrawingsPanel from './components/cpq/drawings-panel'
import { loadFinishCatalog, loadTwoDDrawings } from './lib/kitchen-assets'

/**
 * Loads finish catalog and 2D drawings, then renders the Kitchen CPQ configurator page.
 *
 * Renders a full-page configurator UI that presents finish selectors, a quote summary, and a drawings panel.
 *
 * @returns The React element for the Kitchen CPQ Configurator page, including header, finish selectors, quote summary, and drawings panel.
 */
export default async function Home() {
  const [finishCatalog, drawings] = await Promise.all([
    loadFinishCatalog(),
    loadTwoDDrawings(),
  ])

  return (
    <Box as="main" minH="100vh" display="flex" flexDirection="column" bg="gray.50">
      <Header />
      <Box py={{ base: 8, md: 12 }}>
        <Container maxW="7xl">
          <Stack spacing={{ base: 8, md: 12 }}>
            <Stack spacing={3} textAlign="center">
              <Heading as="h1" size="xl">
                Kitchen CPQ Configurator
              </Heading>
              <Text color="gray.600" maxW="3xl" mx="auto">
                Build tailored kitchen packages by selecting countertop, door, and texture finishes while referencing
                technical drawings and datasheets in a single workspace.
              </Text>
            </Stack>
            <SimpleGrid columns={{ base: 1, xl: 3 }} spacing={{ base: 6, md: 10 }}>
              <GridItem colSpan={{ base: 1, xl: 2 }}>
                <Stack spacing={{ base: 8, md: 12 }}>
                  {finishCatalog.map((category) => (
                    <FinishSelector key={category.key} category={category} />
                  ))}
                </Stack>
              </GridItem>
              <GridItem colSpan={1}>
                <Stack spacing={6} position="sticky" top={{ base: 0, md: 24 }}>
                  <QuoteSummary />
                  <DrawingsPanel drawings={drawings} />
                </Stack>
              </GridItem>
            </SimpleGrid>
          </Stack>
        </Container>
      </Box>
    </Box>
  )
}