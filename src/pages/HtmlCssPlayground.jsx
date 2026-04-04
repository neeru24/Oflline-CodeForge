import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  IconButton,
  useColorMode,
  Container,
  Badge,
  keyframes,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Grid,
  GridItem,
  Textarea,
  Alert,
  AlertIcon,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Tooltip,
  Progress,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  MoonIcon,
  SunIcon,
  ArrowBackIcon,
  RepeatIcon,
  DownloadIcon,
  CopyIcon,
  CheckCircleIcon,
} from "@chakra-ui/icons";
import { useState, useEffect, useRef } from "react";

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(66, 153, 225, 0.5); }
  50% { box-shadow: 0 0 20px rgba(66, 153, 225, 0.8); }
  100% { box-shadow: 0 0 5px rgba(66, 153, 225, 0.5); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.02); }
`;

export default function HtmlCssPlayground({ onBack }) {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const [htmlCode, setHtmlCode] = useState(`<!DOCTYPE html>
<html>
<head>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    .card {
      background: white;
      padding: 40px;
      border-radius: 20px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      max-width: 400px;
      transition: transform 0.3s;
    }
    .card:hover {
      transform: translateY(-5px);
    }
    h1 {
      color: #667eea;
      margin-bottom: 15px;
    }
    p {
      color: #666;
      margin-bottom: 20px;
    }
    button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 30px;
      border-radius: 25px;
      cursor: pointer;
      font-size: 16px;
      transition: transform 0.2s;
    }
    button:hover {
      transform: scale(1.05);
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>✨ Interactive Card</h1>
    <p>Hover over me to see the effect!</p>
    <button>Click Me</button>
  </div>
</body>
</html>`);

  const [cssCode, setCssCode] = useState(`.card {
  background: white;
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  max-width: 400px;
  transition: transform 0.3s;
}
.card:hover {
  transform: translateY(-5px);
}
h1 {
  color: #667eea;
  margin-bottom: 15px;
}
p {
  color: #666;
  margin-bottom: 20px;
}
button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 16px;
  transition: transform 0.2s;
}
button:hover {
  transform: scale(1.05);
}`);

  const [jsCode, setJsCode] = useState(`// Add interactivity
document.querySelector('button')?.addEventListener('click', () => {
  alert('✨ Button clicked! Welcome to the playground! ✨');
});

console.log('🎨 HTML/CSS Playground Ready!');`);

  const [previewContent, setPreviewContent] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isReplayMode, setIsReplayMode] = useState(false);
  const [replaySpeed, setReplaySpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [replayStep, setReplayStep] = useState(0);
  const [replayHtml, setReplayHtml] = useState("");
  const intervalRef = useRef(null);

  const buildSteps = [
    { step: 0, name: "📝 HTML Structure", progress: 20 },
    { step: 1, name: "🎨 Basic Styling", progress: 40 },
    { step: 2, name: "✨ Colors & Gradients", progress: 60 },
    { step: 3, name: "💫 Animations & Effects", progress: 80 },
    { step: 4, name: "⚡ JavaScript Interactivity", progress: 100 },
  ];

  const templates = {
    gradient: {
      html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: 'Segoe UI', sans-serif;
      background: #f0f0f0;
    }
    .card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px;
      border-radius: 20px;
      text-align: center;
      color: white;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      transition: transform 0.3s;
    }
    .card:hover {
      transform: translateY(-10px);
    }
    button {
      background: white;
      border: none;
      padding: 12px 30px;
      border-radius: 25px;
      cursor: pointer;
      margin-top: 20px;
      font-weight: bold;
      transition: transform 0.2s;
    }
    button:hover {
      transform: scale(1.05);
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>✨ Gradient Card</h1>
    <p>Beautiful gradient background with hover effect</p>
    <button>Learn More</button>
  </div>
</body>
</html>`,
      css: `.card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  color: white;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  transition: transform 0.3s;
}
.card:hover {
  transform: translateY(-10px);
}
button {
  background: white;
  border: none;
  padding: 12px 30px;
  border-radius: 25px;
  cursor: pointer;
  margin-top: 20px;
  font-weight: bold;
  transition: transform 0.2s;
}
button:hover {
  transform: scale(1.05);
}`,
      js: `document.querySelector('button')?.addEventListener('click', () => {
  alert('✨ Welcome to the Gradient Card!');
});`,
    },
    animation: {
      html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #667eea, #764ba2);
    }
    .box {
      width: 100px;
      height: 100px;
      background: white;
      border-radius: 10px;
      animation: bounce 2s infinite;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-50px); }
    }
  </style>
</head>
<body>
  <div class="box">🎯</div>
</body>
</html>`,
      css: `.box {
  width: 100px;
  height: 100px;
  background: white;
  border-radius: 10px;
  animation: bounce 2s infinite;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-50px); }
}`,
      js: `document.querySelector('.box')?.addEventListener('click', () => {
  alert('🎉 Box clicked!');
});`,
    },
    flexbox: {
      html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #667eea, #764ba2);
      font-family: 'Segoe UI', sans-serif;
    }
    .container {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      justify-content: center;
      padding: 20px;
    }
    .item {
      background: white;
      padding: 30px;
      border-radius: 10px;
      color: #667eea;
      text-align: center;
      min-width: 150px;
      transition: all 0.3s;
      cursor: pointer;
      font-weight: bold;
    }
    .item:hover {
      transform: scale(1.05) translateY(-5px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="item">📦 Flex Item 1</div>
    <div class="item">🎨 Flex Item 2</div>
    <div class="item">⚡ Flex Item 3</div>
  </div>
</body>
</html>`,
      css: `.container {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
  padding: 20px;
}
.item {
  background: white;
  padding: 30px;
  border-radius: 10px;
  color: #667eea;
  text-align: center;
  min-width: 150px;
  transition: all 0.3s;
  cursor: pointer;
  font-weight: bold;
}
.item:hover {
  transform: scale(1.05) translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}`,
      js: `document.querySelectorAll('.item').forEach((item) => {
  item.addEventListener('click', () => {
    alert('✨ ' + item.innerText);
  });
});`,
    },
    premium: {
      html: `<div class="premium-card"><div class="icon">💎</div><h1>Premium Card</h1><p>Glassmorphism effects and smooth animations.</p><button class="btn-premium">Get Started →</button></div>`,
      css: `.premium-card { background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); padding: 40px; border-radius: 30px; text-align: center; box-shadow: 0 25px 50px rgba(0,0,0,0.3); max-width: 400px; transition: all 0.4s; }
.premium-card:hover { transform: translateY(-10px) scale(1.02); }
.btn-premium { background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; border: none; padding: 12px 35px; border-radius: 50px; cursor: pointer; }`,
      js: `document.querySelector('.btn-premium')?.addEventListener('click', () => alert('✨ Premium!'));`,
    },
    neubrutalism: {
      html: `<div class="brutal-card"><div class="badge">🔥 NEW</div><h1>Neubrutalism</h1><p>Bold shadows and vibrant colors.</p><div class="btn-group"><button class="btn-primary">Get Started</button><button class="btn-secondary">Learn More</button></div></div>`,
      css: `.brutal-card { background: #ffd700; padding: 40px; max-width: 450px; border: 3px solid #000; box-shadow: 8px 8px 0 #000; }
.btn-group { display: flex; gap: 15px; }
.btn-primary, .btn-secondary { padding: 12px 24px; border: 2px solid #000; cursor: pointer; }`,
      js: `document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => btn.addEventListener('click', () => alert(btn.innerText)));`,
    },
    dashboard: {
      html: `<div class="dashboard"><h1>📊 Analytics Dashboard</h1><div class="chart"><div class="bar" style="height:80px"></div><div class="bar" style="height:120px"></div><div class="bar" style="height:60px"></div></div></div>`,
      css: `.dashboard { background: #131b3c; border-radius: 20px; padding: 30px; color: white; }
.chart { display: flex; align-items: flex-end; gap: 20px; height: 200px; }
.bar { width: 60px; background: linear-gradient(180deg, #00ff88, #00cc66); border-radius: 10px; }`,
      js: `document.querySelectorAll('.bar').forEach(bar => bar.addEventListener('click', () => alert(bar.style.height)));`,
    },
    threedCard: {
      html: `<div class="card-3d"><div class="card-front"><div class="icon">🎴</div><h2>3D Flip Card</h2></div><div class="card-back"><div class="icon">✨</div><h2>Back Side</h2></div></div>`,
      css: `.card-3d { width: 350px; height: 450px; position: relative; transform-style: preserve-3d; transition: transform 0.5s; }
.card-3d:hover { transform: rotateY(10deg) rotateX(10deg); }
.card-front, .card-back { position:absolute; width:100%; height:100%; backface-visibility:hidden; border-radius:20px; padding:30px; color:white; }
.card-front { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.card-back { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); transform: rotateY(180deg); }`,
      js: `console.log('3D card ready');`,
    },
    portfolio: {
      html: `<div class="container"><h1>✨ My Portfolio</h1><div class="gallery"><div class="project"><div class="project-image">🎨</div><div class="project-info"><div class="project-title">Creative Design</div></div></div><div class="project"><div class="project-image">💻</div><div class="project-info"><div class="project-title">Web Development</div></div></div></div></div>`,
      css: `.gallery { display:grid; grid-template-columns: repeat(auto-fit, minmax(300px,1fr)); gap:30px; }
.project { background:white; border-radius:15px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,.1); transition:all .3s; }
.project:hover { transform: translateY(-10px); }`,
      js: `document.querySelectorAll('.project').forEach(p => p.addEventListener('click', () => alert('✨ Project opened')));`,
    },
  };

  useEffect(() => {
    if (!isReplayMode) {
      let fullHtml = htmlCode;
      if (!htmlCode.includes("<!DOCTYPE html>")) {
        fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>${cssCode}</style>
</head>
<body>
  ${htmlCode}
  <script>${jsCode}<\/script>
</body>
</html>`;
      }
      setPreviewContent(fullHtml);
    }
  }, [htmlCode, cssCode, jsCode, isReplayMode]);

  useEffect(() => {
    if (isReplayMode && isPlaying) {
      intervalRef.current = setInterval(() => {
        setReplayStep((prev) => {
          if (prev < 100) return Math.min(prev + (100 / (buildSteps.length * 2)), 100);
          setIsPlaying(false);
          return 100;
        });
      }, 800 / replaySpeed);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isReplayMode, isPlaying, replaySpeed]);

  useEffect(() => {
    if (isReplayMode) {
      const currentStep =
        buildSteps.find((step) => replayStep <= step.progress) || buildSteps[buildSteps.length - 1];
      const progressPercent = replayStep;

      let animatedCss = "";
      if (progressPercent >= 20) {
        const cssLines = cssCode.split("\n");
        const linesToShow = Math.floor(cssLines.length * (progressPercent / 100));
        animatedCss = cssLines.slice(0, linesToShow).join("\n");
      }

      const bodyContent = htmlCode.includes("<!DOCTYPE html")
        ? htmlCode.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || htmlCode
        : htmlCode;

      setReplayHtml(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 20px;
      background: #f0f0f0;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    ${animatedCss}
    .replay-indicator {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 10px 15px;
      border-radius: 10px;
      font-size: 12px;
      font-family: monospace;
      z-index: 1000;
      animation: pulseAnim 2s infinite;
    }
    @keyframes pulseAnim {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.05); }
    }
  </style>
</head>
<body>
  ${bodyContent}
  <div class="replay-indicator">🎬 Building: ${currentStep.name} (${Math.floor(progressPercent)}%)</div>
  <script>${jsCode}<\/script>
</body>
</html>`);
    }
  }, [isReplayMode, replayStep, htmlCode, cssCode, jsCode]);

  const loadTemplate = (template) => {
    setHtmlCode(templates[template].html);
    setCssCode(templates[template].css);
    setJsCode(templates[template].js || "// Add your JavaScript here");
    setIsReplayMode(false);
    setIsPlaying(false);
    setReplayStep(0);
  };

  const copyToClipboard = () => {
    const fullCode = `HTML:\n${htmlCode}\n\nCSS:\n${cssCode}\n\nJavaScript:\n${jsCode}`;
    navigator.clipboard.writeText(fullCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>My HTML/CSS Project</title>
  <style>
${cssCode}
  </style>
</head>
<body>
${htmlCode}
  <script>
${jsCode}
  <\/script>
</body>
</html>`;
    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "index.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const startReplayMode = () => {
    setIsReplayMode(true);
    setIsPlaying(true);
    setReplayStep(0);
  };

  const stopReplayMode = () => {
    setIsReplayMode(false);
    setIsPlaying(false);
    setReplayStep(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return (
    <Box
      minH="100vh"
      bg={
        isDark
          ? "linear-gradient(135deg, #0a0f1c 0%, #030618 100%)"
          : "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)"
      }
      color={isDark ? "white" : "gray.800"}
      overflow="auto"
    >
      <Box position="absolute" top={0} left={0} right={0} bottom={0} pointerEvents="none" opacity={0.1}>
        {[...Array(20)].map((_, i) => (
          <Box
            key={i}
            position="absolute"
            w="4px"
            h="4px"
            bg="blue.400"
            borderRadius="full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `${float} ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </Box>

      <Box
        position="sticky"
        top={0}
        zIndex={100}
        bg={isDark ? "rgba(10, 15, 28, 0.9)" : "rgba(255, 255, 255, 0.9)"}
        backdropFilter="blur(10px)"
        borderBottom="1px solid"
        borderColor={isDark ? "whiteAlpha.200" : "gray.200"}
      >
        <Container maxW="container.xl" py={4}>
          <HStack justify="space-between" wrap="wrap" spacing={4}>
            <HStack spacing={4}>
              <IconButton
                icon={<ArrowBackIcon />}
                onClick={onBack}
                variant="ghost"
                aria-label="Go back"
                _hover={{ transform: "scale(1.1)" }}
                transition="all 0.3s"
              />
              <IconButton
                icon={isDark ? <SunIcon /> : <MoonIcon />}
                onClick={toggleColorMode}
                variant="ghost"
                aria-label="Toggle theme"
                _hover={{ transform: "rotate(15deg)" }}
                transition="all 0.3s"
              />
              <VStack align="start" spacing={0}>
                <Heading size="md" bgGradient="linear(to-r, blue.400, purple.400, pink.400)" bgClip="text">
                  🎨 HTML/CSS Visual Playground
                </Heading>
                <Text fontSize="xs" color="gray.500">
                  Live editor with Replay, Explain, and Compare features
                </Text>
              </VStack>
            </HStack>

            <HStack spacing={3}>
              {!isReplayMode ? (
                <Button
                  size="sm"
                  leftIcon={<Text fontSize="16px">🎬</Text>}
                  bgGradient="linear(to-r, purple.500, pink.500)"
                  color="white"
                  _hover={{ transform: "scale(1.05)" }}
                  onClick={startReplayMode}
                >
                  Start Replay Mode
                </Button>
              ) : (
                <Button
                  size="sm"
                  leftIcon={<Text fontSize="16px">⏹️</Text>}
                  colorScheme="red"
                  variant="outline"
                  onClick={stopReplayMode}
                >
                  Exit Replay Mode
                </Button>
              )}
            </HStack>
          </HStack>
        </Container>
      </Box>

      <Container maxW="container.xl" py={6}>
        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
          <GridItem>
            <Box
              borderRadius="xl"
              border="1px solid"
              borderColor={isDark ? "gray.700" : "gray.200"}
              overflow="hidden"
              bg={isDark ? "gray.800" : "white"}
            >
              <VStack spacing={0} align="stretch">
                <HStack justify="space-between" p={3} borderBottom="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
                  <Heading size="sm">✏️ Code Editor</Heading>
                  <HStack>
                    <Tooltip label="Copy Code">
                      <IconButton
                        icon={copied ? <CheckCircleIcon /> : <CopyIcon />}
                        size="sm"
                        variant="ghost"
                        onClick={copyToClipboard}
                        colorScheme={copied ? "green" : "blue"}
                      />
                    </Tooltip>
                    <Tooltip label="Download HTML">
                      <IconButton icon={<DownloadIcon />} size="sm" variant="ghost" onClick={downloadCode} />
                    </Tooltip>
                  </HStack>
                </HStack>

                <Tabs variant="enclosed" colorScheme="purple" onChange={setActiveTab}>
                  <TabList bg={isDark ? "gray.700" : "gray.50"}>
                    <Tab>📝 HTML</Tab>
                    <Tab>🎨 CSS</Tab>
                    <Tab>⚡ JavaScript</Tab>
                    <Tab>📦 Templates</Tab>
                  </TabList>

                  <TabPanels>
                    <TabPanel px={4} py={4}>
                      <Textarea
                        value={htmlCode}
                        onChange={(e) => setHtmlCode(e.target.value)}
                        fontFamily="monospace"
                        fontSize="sm"
                        minH="350px"
                        bg={isDark ? "gray.900" : "gray.50"}
                        borderColor={isDark ? "gray.600" : "gray.200"}
                        _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px purple.500" }}
                      />
                    </TabPanel>
                    <TabPanel px={4} py={4}>
                      <Textarea
                        value={cssCode}
                        onChange={(e) => setCssCode(e.target.value)}
                        fontFamily="monospace"
                        fontSize="sm"
                        minH="350px"
                        bg={isDark ? "gray.900" : "gray.50"}
                        borderColor={isDark ? "gray.600" : "gray.200"}
                        _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px purple.500" }}
                      />
                    </TabPanel>
                    <TabPanel px={4} py={4}>
                      <Textarea
                        value={jsCode}
                        onChange={(e) => setJsCode(e.target.value)}
                        fontFamily="monospace"
                        fontSize="sm"
                        minH="350px"
                        bg={isDark ? "gray.900" : "gray.50"}
                        borderColor={isDark ? "gray.600" : "gray.200"}
                        _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px purple.500" }}
                        placeholder="// Add your JavaScript code here..."
                      />
                    </TabPanel>
                    <TabPanel px={4} py={4}>
                      <SimpleGrid columns={3} spacing={4}>
                        {[
                          ["gradient", "🎨", "Gradient Card", "Modern card design", "purple"],
                          ["animation", "🔄", "Animation", "Bouncing box", "green"],
                          ["flexbox", "📐", "Flexbox Layout", "Responsive flex design", "blue"],
                          ["premium", "💎", "Premium Card", "Glassmorphism design", "pink"],
                          ["neubrutalism", "🎯", "Neubrutalism", "Bold modern style", "yellow"],
                          ["dashboard", "📊", "Dark Dashboard", "Analytics dashboard", "cyan"],
                          ["threedCard", "🎴", "3D Flip Card", "3D rotation effect", "orange"],
                          ["portfolio", "✨", "Portfolio", "Project gallery", "teal"],
                        ].map(([key, icon, title, desc, scheme]) => (
                          <Button
                            key={key}
                            onClick={() => loadTemplate(key)}
                            h="100px"
                            variant="outline"
                            colorScheme={scheme}
                            _hover={{ transform: "scale(1.02)" }}
                          >
                            <VStack>
                              <Text fontSize="32px">{icon}</Text>
                              <Text fontSize="sm" fontWeight="bold">{title}</Text>
                              <Text fontSize="xs">{desc}</Text>
                            </VStack>
                          </Button>
                        ))}
                      </SimpleGrid>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </VStack>
            </Box>

            <Alert status="info" borderRadius="lg" fontSize="sm" mt={4}>
              <AlertIcon />
              💡 Tip: Click "Start Replay Mode" to watch your UI build step-by-step!
            </Alert>
          </GridItem>

          <GridItem>
            <Box
              borderRadius="xl"
              border="2px solid"
              borderColor="blue.500"
              overflow="hidden"
              bg="white"
              h="100%"
              {...(isReplayMode ? { animation: `${glow} 2s ease-in-out infinite` } : {})}
            >
              <HStack
                justify="space-between"
                p={3}
                bg={isDark ? "gray.800" : "gray.50"}
                borderBottom="1px solid"
                borderColor={isDark ? "gray.700" : "gray.200"}
              >
                <Heading size="sm">🖥️ Live Preview</Heading>
                {isReplayMode && (
                  <Badge colorScheme="purple" fontSize="xs" variant="solid" animation={`${pulse} 1s ease-in-out infinite`}>
                    🎬 REPLAY MODE ACTIVE
                  </Badge>
                )}
              </HStack>
              <Box minH="500px">
                <iframe
                  srcDoc={isReplayMode ? replayHtml : previewContent}
                  title="preview"
                  style={{
                    width: "100%",
                    height: "500px",
                    border: "none",
                  }}
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
                />
              </Box>

              {isReplayMode && (
                <Box p={4} bg={isDark ? "gray.800" : "gray.100"} borderTop="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
                  <VStack spacing={3}>
                    <HStack justify="space-between" w="full">
                      <Text fontWeight="bold" color="purple.500">🎬 Replay Mode - Watch UI Build</Text>
                      <HStack>
                        <Button
                          size="xs"
                          onClick={() => setIsPlaying(!isPlaying)}
                          colorScheme={isPlaying ? "orange" : "green"}
                          leftIcon={isPlaying ? <Text fontSize="12px">⏸</Text> : <Text fontSize="12px">▶</Text>}
                        >
                          {isPlaying ? "Pause" : "Play"}
                        </Button>
                        <Button
                          size="xs"
                          onClick={() => {
                            setIsPlaying(false);
                            setReplayStep(0);
                            setTimeout(() => setIsPlaying(true), 100);
                          }}
                          leftIcon={<RepeatIcon />}
                        >
                          Reset
                        </Button>
                      </HStack>
                    </HStack>

                    <Box w="full">
                      <Text fontSize="xs" mb={1}>Speed: {replaySpeed}x</Text>
                      <Slider value={replaySpeed} min={0.5} max={3} step={0.5} onChange={setReplaySpeed}>
                        <SliderTrack bg={isDark ? "gray.600" : "gray.300"}>
                          <SliderFilledTrack bg="purple.500" />
                        </SliderTrack>
                        <SliderThumb boxSize={4} bg="purple.500" />
                      </Slider>
                    </Box>

                    <Progress value={replayStep} width="100%" colorScheme="purple" borderRadius="full" size="sm" />

                    <Text fontSize="xs" color="gray.500" textAlign="center">
                      {replayStep < 20 && "📝 Adding HTML structure..."}
                      {replayStep >= 20 && replayStep < 40 && "🎨 Applying basic styles..."}
                      {replayStep >= 40 && replayStep < 60 && "✨ Adding colors and gradients..."}
                      {replayStep >= 60 && replayStep < 80 && "💫 Adding animations and transitions..."}
                      {replayStep >= 80 && replayStep < 100 && "⚡ Adding JavaScript interactivity..."}
                      {replayStep >= 100 && "✅ Build complete! The UI is fully styled!"}
                    </Text>
                  </VStack>
                </Box>
              )}
            </Box>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
}
