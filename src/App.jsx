import { Box, Text } from "@chakra-ui/react";
import CodeEditor from "./components/CodeEditor";

function App() {
  return (
    <Box
      h="100vh"
      display="flex"
      flexDirection="column"
      bg="linear-gradient(135deg, #0f0a19, #1a0f2e, #000000)"
      px={6}
      py={4}
      overflow="hidden"
    >
      <Text
        fontSize="3xl"
        mb={2}
        color="#00ffcc"
        fontWeight="bold"
        textShadow="0 0 10px #00ffcc"
      >
        ⚡ Code Playground (Offline)
      </Text>

      {/* 🔥 THIS IS CRITICAL */}
      <Box flex="1" minH={0}>
        <CodeEditor />
      </Box>
    </Box>
  );
}

export default App;