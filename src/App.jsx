import { Box, Button, HStack, Spinner, Text } from "@chakra-ui/react";
import { Suspense, lazy, useState } from "react";
import { loadPyodideInstance } from "./api";

const loadCodeEditor = () => import("./components/CodeEditor");
const loadMultiLanguageWorkspace = () => import("./components/MultiLanguageWorkspace");

const CodeEditor = lazy(loadCodeEditor);
const MultiLanguageWorkspace = lazy(loadMultiLanguageWorkspace);
const LandingPage = lazy(() => import("./pages/LandingPage.jsx"));

const OFFLINE_CACHE_KEY = "offline-runtime-v1";
const PYODIDE_ASSETS = [
  "/pyodide/pyodide.js",
  "/pyodide/pyodide.asm.js",
  "/pyodide/pyodide.asm.wasm",
  "/pyodide/python_stdlib.zip",
  "/pyodide/pyodide-lock.json",
];

function App() {
  const [showLanding, setShowLanding] = useState(true); // 👈 new
  const [mode, setMode] = useState("classic");
  const [hasPreloadedFirstMode, setHasPreloadedFirstMode] = useState(false);
  const [isPreparingOffline, setIsPreparingOffline] = useState(false);

  const warmupOfflineCache = async () => {
    if (typeof window === "undefined" || !("caches" in window)) return;

    const cache = await caches.open(OFFLINE_CACHE_KEY);
    const sameOriginRuntimeAssets = Array.from(
      document.querySelectorAll('script[src], link[rel="stylesheet"][href]')
    )
      .map((node) => node.getAttribute("src") || node.getAttribute("href"))
      .filter(Boolean)
      .map((value) => new URL(value, window.location.origin))
      .filter((url) => url.origin === window.location.origin)
      .map((url) => url.pathname + url.search);

    const criticalAssets = ["/", "/index.html", ...PYODIDE_ASSETS, ...sameOriginRuntimeAssets];
    const uniqueAssets = [...new Set(criticalAssets)];

    await Promise.allSettled(
      uniqueAssets.map(async (assetUrl) => {
        const response = await fetch(assetUrl, { cache: "reload" });
        if (response.ok) {
          await cache.put(assetUrl, response.clone());
        }
      })
    );
  };

  const prepareOfflineRuntime = async () => {
    await Promise.allSettled([
      loadCodeEditor(),
      loadMultiLanguageWorkspace(),
      warmupOfflineCache(),
    ]);

    try {
      await loadPyodideInstance();
    } catch {
      // Keep app usable even if Python runtime warmup fails once.
    }
  };

  const preloadMode = async (nextMode) => {
    if (nextMode === "workspace") {
      await loadMultiLanguageWorkspace();
      return;
    }
    await loadCodeEditor();
  };

  const handleLaunch = async () => {
    setIsPreparingOffline(true);

    if (!hasPreloadedFirstMode) {
      await preloadMode(mode);
      setHasPreloadedFirstMode(true);
    }

    await prepareOfflineRuntime();
    setIsPreparingOffline(false);
    setShowLanding(false);
  };

  const handleModeChange = async (nextMode) => {
    if (nextMode === mode) return;
    if (!hasPreloadedFirstMode) {
      await preloadMode(nextMode);
      setHasPreloadedFirstMode(true);
    }
    setMode(nextMode);
  };

  // 👇 if landing page active, show it
  if (showLanding) {
    if (isPreparingOffline) {
      return (
        <Box minH="100vh" display="grid" placeItems="center" bg="blackAlpha.900">
          <HStack spacing={3} color="teal.200">
            <Spinner color="teal.300" />
            <Text fontWeight="semibold">Preparing offline runtime...</Text>
          </HStack>
        </Box>
      );
    }

    return (
      <Suspense fallback={<Box p={6}><Spinner color="teal.300" /></Box>}>
        <LandingPage onLaunch={handleLaunch} />
      </Suspense>
    );
  }

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
      {/* 🔥 HEADER */}
      <Text
        fontSize="3xl"
        mb={3}
        color="#00ffcc"
        fontWeight="bold"
        textShadow="0 0 12px #00ffcc"
        letterSpacing="1px"
      >
        ⚡ Code Playground (Offline)
      </Text>

      <HStack mb={3} spacing={2}>
        <Button
          size="sm"
          colorScheme={mode === "classic" ? "teal" : "gray"}
          onClick={() => handleModeChange("classic")}
        >
          Classic Mode
        </Button>
        <Button
          size="sm"
          colorScheme={mode === "workspace" ? "teal" : "gray"}
          onClick={() => handleModeChange("workspace")}
        >
          Workspace Mode
        </Button>
      </HStack>

      {/* 🔥 MAIN CONTAINER */}
      <Box
        flex="1"
        minH={0}
        border="1px solid rgba(0,255,204,0.2)"
        borderRadius="10px"
        p={2}
        boxShadow="0 0 20px rgba(0,255,204,0.1)"
        bg="rgba(0,0,0,0.3)"
        backdropFilter="blur(10px)"
      >
        <Suspense fallback={<Box p={4}><Spinner color="teal.300" /></Box>}>
          {mode === "classic" ? <CodeEditor /> : <MultiLanguageWorkspace />}
        </Suspense>
      </Box>
    </Box>
  );
}

export default App;