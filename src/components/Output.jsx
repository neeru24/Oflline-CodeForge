import { useState } from "react";
import { Box, Button, Text, Textarea } from "@chakra-ui/react";
import { runJavaScript, runPython } from "../api";

const Output = ({ editorRef, language }) => {
  const [output, setOutput] = useState("");
  const [input, setInput] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const runCode = async () => {
    const sourceCode = editorRef.current.getValue();
    if (!sourceCode) return;

    try {
      setIsLoading(true);

      let result;

      if (language === "javascript") {
        result = runJavaScript(sourceCode, input);
      } else if (language === "python") {
        result = await runPython(sourceCode, input);
      } else {
        result = "⚠️ Language not supported";
      }

      setIsError(result.startsWith("❌"));
      setOutput(result);
    } catch (error) {
      setIsError(true);
      setOutput("❌ Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCode = () => {
    const code = editorRef.current.getValue();

    if (!code) {
      alert("No code to download!");
      return;
    }

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

  const uploadFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target.result;

      // 🔥 Detect language from extension
      if (file.name.endsWith(".py")) {
        setLanguage("python");
      } else if (file.name.endsWith(".js")) {
        setLanguage("javascript");
      }

      setValue(content);
    };

    reader.readAsText(file);
  };

  return (
    <Box flex="1" display="flex" flexDirection="column" p={2} gap={2}>
      
      {/* TITLE */}
      <Text fontSize="lg">Output</Text>

      {/* 🔹 SMALL INPUT BOX */}
      <Textarea
        placeholder="Input (one per line)"
        size="sm"
        rows={2}                 // ✅ FIX SIZE
        bg="black"
        color="white"
        border="1px solid #00ffcc"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      {/* 🔹 BUTTON ROW */}
      <Box display="flex" gap={2}>
        <Button
          bg="#00ffcc"
          color="black"
          _hover={{ bg: "#00e6b8" }}
          onClick={runCode}
          isLoading={isLoading}
        >
          Run Code
        </Button>

        <Button
          variant="outline"
          colorScheme="red"
          onClick={() => {
            setOutput("");
            setInput("");
            setIsError(false);
          }}
        >
          Clear
        </Button>

        <Button
          variant="outline"
          colorScheme="blue"
          onClick={downloadCode}
        >
          Download
        </Button>
      </Box>

      {/* 🔹 OUTPUT BOX (PROPER HEIGHT) */}
      <Box
        flex="1"
        minH="300px"                 // ✅ FIX HEIGHT
        p={3}
        bg="black"
        color="green.400"
        fontFamily="monospace"
        fontSize="14px"
        border="1px solid #00ffcc"
        borderRadius="6px"
        boxShadow="0 0 10px #00ffcc"
        overflowY="auto"
        whiteSpace="pre-wrap"
      >
        {isLoading
          ? "⏳ Running..."
          : output
          ? output
              .split("\n")
              .map((line) => `> ${line}`)
              .join("\n")
          : '> Click "Run Code" to see output'}
      </Box>
    </Box>
  );
};

export default Output;