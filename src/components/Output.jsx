import { Box, Button, Text } from "@chakra-ui/react";
import { runJavaScript, runPython } from "../api";
import { useState, useImperativeHandle, forwardRef } from "react";

const Output = forwardRef(({ editorRef, language }, ref) => {
  const [isLoading, setIsLoading] = useState(false);

  // 🔥 TERMINAL STATES
  const [terminal, setTerminal] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [inputs, setInputs] = useState([]);

  // 🚀 RUN CODE
  const runCode = async () => {
    const sourceCode = editorRef.current.getValue();
    if (!sourceCode) return;

    setTerminal([]);
    setInputs([]);
    setCurrentInput("");

    // 🔍 detect if input needed
    if (sourceCode.includes("prompt") || sourceCode.includes("input")) {
      setWaitingForInput(true);
      setTerminal(["> Program started..."]);
      return;
    }

    executeCode(sourceCode, []);
  };

  useImperativeHandle(ref, () => ({
    runCode,
  }));

  // ⚙️ EXECUTE CODE
  const executeCode = async (code, inputsArr) => {
    try {
      setIsLoading(true);

      let result;

      if (language === "javascript") {
        result = runJavaScript(code, inputsArr.join("\n"));
      } else if (language === "python") {
        result = await runPython(code, inputsArr.join("\n"));
      }

      // 🔥 API already formats prompts → just print
      setTerminal((prev) => [...prev, ...result.split("\n")]);
    } catch (error) {
      setTerminal((prev) => [...prev, "❌ " + error.message]);
    } finally {
      setIsLoading(false);
      setWaitingForInput(false);
    }
  };

  // ⌨️ HANDLE INPUT
  const handleTerminalInput = (e) => {
    if (e.key === "Enter") {
      const value = currentInput;
      const code = editorRef.current.getValue();

      const expectedInputs =
        (code.match(/prompt/g) || []).length +
        (code.match(/input/g) || []).length;

      const updatedInputs = [...inputs, value];

      setCurrentInput("");
      setInputs(updatedInputs);

      if (updatedInputs.length < expectedInputs) return;

      executeCode(code, updatedInputs);
    }
  };

  // 💾 DOWNLOAD CODE
  const downloadCode = () => {
    const code = editorRef.current.getValue();

    if (!code) return;

    let extension = "txt";
    if (language === "javascript") extension = "js";
    else if (language === "python") extension = "py";

    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `code.${extension}`;
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <Box flex="1" display="flex" flexDirection="column" p={2} gap={2}>
      {/* TITLE */}
      <Text fontSize="lg">Output</Text>

      {/* BUTTONS */}
      <Box display="flex" gap={2}>
        <Button
          variant="outline"
          colorScheme="red"
          onClick={() => {
            setTerminal([]);
            setCurrentInput("");
            setInputs([]);
          }}
        >
          Clear
        </Button>

        <Button variant="outline" colorScheme="blue" onClick={downloadCode}>
          Download
        </Button>
      </Box>

      {/* TERMINAL */}
      <Box
        flex="1"
        minH="300px"
        p={3}
        bg="black"
        color="green.400"
        fontFamily="monospace"
        fontSize="14px"
        border="1px solid #00ffcc"
        borderRadius="6px"
        boxShadow="0 0 10px #00ffcc"
        overflowY="auto"
      >
        {/* EMPTY */}
        {terminal.length === 0 && "> Click Run to start"}

        {/* OUTPUT */}
        {terminal.map((line, i) => (
          <div key={i}>{line}</div>
        ))}

        {/* INPUT */}
        {waitingForInput && (
          <input
            style={{
              background: "black",
              color: "#00ffcc",
              border: "none",
              outline: "none",
              width: "100%",
              fontFamily: "monospace",
            }}
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleTerminalInput}
            autoFocus
          />
        )}

        {/* LOADING */}
        {isLoading && <div>⏳ Running...</div>}
      </Box>
    </Box>
  );
});

export default Output;