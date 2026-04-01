import { forwardRef, useState, useImperativeHandle } from "react";
import { Box, Textarea, Text } from "@chakra-ui/react";
import { runJavaScript, runPython } from "../api";

const Output = forwardRef(({ editorRef, language }, ref) => {
  const [output, setOutput] = useState("");
  const [input, setInput] = useState("");

  useImperativeHandle(ref, () => ({
    runCode: async () => {
      setOutput(""); // ✅ clear previous output

      const code = editorRef.current.getValue();

      let result = "";

      if (language === "javascript") {
        result = runJavaScript(code, input);
      } else if (language === "python") {
        result = await runPython(code, input);
      }

      setOutput(result);
    },
  }));

  return (
    <Box
      flex="1"
      display="flex"
      flexDirection="column"
      border="1px solid #00ffcc"
      borderRadius="6px"
      boxShadow="0 0 10px #00ffcc"
      p={3}
    >
      <Text mb={2} fontWeight="bold" color="#00ffcc">
        🖥 Output
      </Text>

      {/* INPUT BOX */}
      <Textarea
        placeholder="Enter input (line by line)"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        size="sm"
        mb={2}
      />

      {/* OUTPUT */}
      <Textarea
        value={output}
        readOnly
        size="sm"
        flex="1"
        bg="black"
        color="#00ffcc"
        fontFamily="monospace"
      />
    </Box>
  );
});

export default Output;