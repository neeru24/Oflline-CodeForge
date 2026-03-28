import { useRef, useState, useEffect } from "react";
import { Box, HStack, Button, Input, VStack, Text } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import LanguageSelector from "./LanguageSelector";
import { CODE_SNIPPETS } from "../constants";
import Output from "./Output";

const CodeEditor = () => {
  const editorRef = useRef();

  const [language, setLanguage] = useState("javascript");
  const [value, setValue] = useState("");
  const [fileName, setFileName] = useState("");
  const [savedFiles, setSavedFiles] = useState([]);

  // 🔥 Load saved files list
  useEffect(() => {
    const files = JSON.parse(localStorage.getItem("saved-files")) || [];
    setSavedFiles(files);
  }, []);

  // 🔥 Load code on language change
  useEffect(() => {
    const savedCode = localStorage.getItem(`code-${language}`);
    if (savedCode) {
      setValue(savedCode);
    } else {
      setValue(CODE_SNIPPETS[language]);
    }
  }, [language]);

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const onSelect = (lang) => {
    setLanguage(lang);
  };

  const handleChange = (val) => {
    setValue(val);
    localStorage.setItem(`code-${language}`, val);
  };

  // 🔥 SAVE FILE WITH NAME
  const saveFile = () => {
    if (!fileName.trim()) {
      alert("Enter file name");
      return;
    }

    const newFile = {
      name: fileName,
      language,
      code: value,
    };

    const updatedFiles = [...savedFiles, newFile];

    localStorage.setItem("saved-files", JSON.stringify(updatedFiles));
    setSavedFiles(updatedFiles);
    setFileName("");

    console.log("File saved:", fileName);
  };

  // 🔥 LOAD FILE
  const loadFile = (file) => {
    setLanguage(file.language);
    setValue(file.code);
  };

  // 🔥 DELETE FILE
  const deleteFile = (index) => {
    const updatedFiles = savedFiles.filter((_, i) => i !== index);
    localStorage.setItem("saved-files", JSON.stringify(updatedFiles));
    setSavedFiles(updatedFiles);
  };

  const uploadFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log("Selected:", file.name);

    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target.result;

      const name = file.name.toLowerCase();

      // 🔥 Language detection
      if (name.endsWith(".py")) {
        setLanguage("python");
      } else if (name.endsWith(".js")) {
        setLanguage("javascript");
      } else {
        alert("⚠️ Unknown file type, loading as text");
      }

      // 🔥 Load into editor
      setValue(content);

      // 🔥 Optional: show filename in input
      setFileName(file.name);

      console.log("File loaded successfully");

      // 🔥 VERY IMPORTANT FIX
      e.target.value = null;
    };

    reader.readAsText(file);
  };
  return (
    <HStack spacing={4} h="100%" align="stretch">
      
      {/* LEFT SIDE */}
      <Box
        flex="2"
        display="flex"
        flexDirection="column"
        border="1px solid #00ffcc"
        borderRadius="6px"
        boxShadow="0 0 10px #00ffcc"
        p={2}
      >
        <LanguageSelector language={language} onSelect={onSelect} />

        {/* SAVE SECTION */}
        <HStack mb={2}>
          <Input
            placeholder="Enter file name"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            size="sm"
          />

          <Button size="sm" colorScheme="green" onClick={saveFile}>
            Save
          </Button>

          {/* ✅ Upload Button */}
          <Button
            size="sm"
            bg="#00ffcc"
            color="black"
            _hover={{ bg: "#00e6b8" }}
            onClick={() => document.getElementById("fileInput").click()}
          >
            {fileName ? `🔄 ${fileName}` : "📂 Upload"}
          </Button>

          {/* ✅ Hidden Input */}
          <input
            id="fileInput"
            type="file"
            accept=".js,.py,.txt"
            style={{ display: "none" }}
            onChange={uploadFile}
          />
        </HStack>

        <Box flex="1">
          <Editor
            height="100%"
            theme="vs-dark"
            language={language}
            value={value}
            onMount={onMount}
            onChange={handleChange}
            options={{ minimap: { enabled: false } }}
          />
        </Box>
      </Box>

      {/* RIGHT SIDE */}
      <Box flex="1" display="flex" flexDirection="column" gap={4}>

        {/* 📂 SAVED FILES LIST */}
        <Box
          p={3}
          border="1px solid #00ffcc"
          borderRadius="6px"
          boxShadow="0 0 10px #00ffcc"
          maxH="250px"
          overflowY="auto"
        >
          <Text mb={2} fontWeight="bold" color="#00ffcc">
            📂 Saved Files
          </Text>

          <VStack align="stretch" spacing={1}>
            {savedFiles.length === 0 && (
              <Text fontSize="sm">No files saved</Text>
            )}

            {savedFiles.map((file, index) => (
              <HStack
                key={index}
                justify="space-between"
                px={2}
                py={1}
                borderRadius="4px"
                _hover={{ bg: "#1a1a1a" }}
              >
                <Text
                  cursor="pointer"
                  px={2}
                  py={1}
                  borderRadius="4px"
                  _hover={{ bg: "#1a1a1a", color: "#00ffcc" }}
                  onClick={() => loadFile(file)}
                >
                  {file.name} ({file.language})
                </Text>

                <Button
                  size="xs"
                  colorScheme="red"
                  onClick={() => deleteFile(index)}
                >
                  X
                </Button>
              </HStack>
            ))}
          </VStack>
        </Box>

        {/* OUTPUT */}
        <Output editorRef={editorRef} language={language} />
      </Box>

    </HStack>
  );
};

export default CodeEditor;