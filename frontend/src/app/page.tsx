import Header from './components/header'
import { Box } from '@chakra-ui/react'
import CPQLayout from './components/cpq/cpq-layout'

/**
 * Renders the application's Home page containing the global header and the CPQ layout.
 *
 * @returns The React element for the Home page composed of a main container with the header and CPQ layout.
 */
export default function Home() {
  return (
    <Box as="main" minH="100vh" display="flex" flexDirection="column">
      <Header />
      <CPQLayout />
    </Box>
  )
}