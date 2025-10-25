import Header from './components/header'
import { Box } from '@chakra-ui/react'
import CPQLayout from './components/cpq/cpq-layout'

export default function Home() {
  return (
    <Box as="main" minH="100vh" display="flex" flexDirection="column">
      <Header />
      <CPQLayout />
    </Box>
  )
}
