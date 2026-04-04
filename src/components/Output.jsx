import {
  forwardRef,
  useState,
  useImperativeHandle,
  useEffect,
  useRef,
} from "react";
import { Box, Text } from "@chakra-ui/react";
import { runJavaScript, runPython } from "../api";

const Output = forwardRef(({ editorRef, language }, ref) => {
  const [terminal, setTerminal] = useState([]);
  const [previewDoc, setPreviewDoc] = useState("");
  const [currentInput, setCurrentInput] = useState("");
  const [inputs, setInputs] = useState([]);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [expectedInputs, setExpectedInputs] = useState(0);

  const terminalRef = useRef(null);
  const inputRef = useRef(null);

  // auto scroll
  useEffect(() => {
    terminalRef.current?.scrollTo(0, terminalRef.current.scrollHeight);
  }, [terminal]);

  // force focus
  useEffect(() => {
    if (waitingForInput) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [waitingForInput]);

  const appendLine = (line) => {
    setTerminal((prev) => [...prev, line]);
  };

  const extractPrompts = (code) => {
    const regex = language === "javascript" ? /\bprompt\s*\(/g : /\binput\s*\(/g;
    const matches = code.match(regex);
    return matches ? matches.length : 0;
  };

  const buildHtmlPreview = (code) => {
    if (/<html[\s>]/i.test(code) || /<!doctype html>/i.test(code)) {
      return code;
    }

    return `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>${code}</style>
  </head>
  <body>
    <div class="card">
      <h1>Preview</h1>
      <p>Your CSS is applied to this sample card.</p>
    </div>
  </body>
</html>`;
  };

  const renderPreview = (code) => {
    if (language === "html") {
      setPreviewDoc(buildHtmlPreview(code));
      appendLine("> HTML preview updated.");
      return;
    }

    if (language === "css") {
      setPreviewDoc(buildHtmlPreview(code));
      appendLine("> CSS preview updated.");
      return;
    }
  };

  const executeCode = async (userInputs) => {
    const code = editorRef.current.getValue();

    try {
      if (language === "html" || language === "css") {
        renderPreview(code);
        setIsRunning(false);
        return;
      }

      let result =
        language === "javascript"
          ? await runJavaScript(code, userInputs)
          : await runPython(code, userInputs);

      appendLine("");
      appendLine(result || "> (no output)");
    } catch (err) {
      appendLine("❌ Error: " + err.message);
    }

    setIsRunning(false);
  };

  useImperativeHandle(ref, () => ({
    runCode: async () => {
      if (isRunning) return;

      setTerminal([]);
      setInputs([]);
      setCurrentInput("");
      setPreviewDoc("");

      const code = editorRef.current.getValue();
      const promptCount = language === "javascript" || language === "python" ? extractPrompts(code) : 0;
      setExpectedInputs(promptCount);

      if (promptCount > 0) {
        setWaitingForInput(true);
        appendLine(`> Provide ${promptCount} input value${promptCount === 1 ? "" : "s"} and press Enter.`);
        appendLine('> For loop/dynamic input programs, enter values then type "/run".');

        return;
      }

      setIsRunning(true);
      await executeCode([]);
    },
  }));

  const handleInputSubmit = async () => {
    if (!waitingForInput || isRunning) return;

    if (currentInput === "/clear") {
      setTerminal([]);  
      setCurrentInput("");
      return;
    }

    if (currentInput === "/run") {
      setWaitingForInput(false);
      setIsRunning(true);
      await executeCode(inputs);
      setInputs([]);
      setCurrentInput("");
      return;
    }

    appendLine("> " + currentInput);
    const newInputs = [...inputs, currentInput];
    setInputs(newInputs);
    setCurrentInput("");

    if (newInputs.length >= expectedInputs) {
      setWaitingForInput(false);
      setIsRunning(true);

      await executeCode(newInputs);

      setInputs([]);
    }
  };
    
     

  return (
    <Box flex="1" display="flex" flexDirection="column" p={3}>
      <Box display="flex" justifyContent="space-between">
        <Text color="#00ffcc">🖥 Terminal</Text>
        <Text color="red" cursor="pointer" onClick={() => setTerminal([])}>
          Clear
        </Text>
      </Box>

      <Box
        ref={terminalRef}
        flex="1"
        bg="black"
        color="#00ffcc"
        p={2}
        fontFamily="monospace"
        overflowY="auto"
      >
        {terminal.map((line, i) => (
          <Text key={i}>{line}</Text>
        ))}

        {waitingForInput && (
          <Box display="flex">
            <Text>{"> "}</Text>
            <input
              ref={inputRef}
              autoFocus
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleInputSubmit();
              }}
              style={{
                background: "black",
                color: "#00ffcc",
                border: "none",
                outline: "none",
                flex: 1,
              }}
            />
              {(language === "html" || language === "css") && (
                <Box mb={3} border="1px solid rgba(0,255,204,0.25)" borderRadius="8px" overflow="hidden" bg="white">
                  <iframe
                    title="classic-preview"
                    srcDoc={previewDoc || buildHtmlPreview(editorRef.current?.getValue?.() || "")}
                    style={{ width: "100%", height: "220px", border: "none" }}
                    sandbox="allow-scripts"
                  />
                </Box>
              )}

          </Box>
        )}
      </Box>
    </Box>
  );
});

export default Output;