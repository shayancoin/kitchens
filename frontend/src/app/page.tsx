import Header from './components/header'
import { Box, Container, GridItem, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import FinishSelector from './components/cpq/finish-selector'
import QuoteSummary from './components/cpq/quote-summary'
import DrawingsPanel from './components/cpq/drawings-panel'
import { loadFinishCatalog, loadTwoDDrawings } from './lib/kitchen-assets'

export default async function Home() {
  const [finishCatalogResult, drawingsResult] = await Promise.allSettled([
    loadFinishCatalog(),
    loadTwoDDrawings(),
  ])
  if (finishCatalogResult.status === 'rejected') {
    console.error('Failed to load finish catalog', finishCatalogResult.reason)
  }
  if (drawingsResult.status === 'rejected') {
    console.error('Failed to load 2D drawings', drawingsResult.reason)
  }

  const finishCatalog =
    finishCatalogResult.status === 'fulfilled' ? finishCatalogResult.value : []
  const drawings = drawingsResult.status === 'fulfilled' ? drawingsResult.value : []

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
