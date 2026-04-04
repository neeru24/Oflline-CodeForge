import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  HStack,
  Input,
  Textarea,
  Select,
  Text,
  VStack,
  Tabs,
  TabList,
  Tab,
  Divider,
  Badge,
  useToast,
} from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import { runJavaScript, runPython } from "../api";

const snippets = {
  html: "<!doctype html>\n<html>\n  <head>\n    <meta charset=\"UTF-8\" />\n    <title>Workspace Preview</title>\n  </head>\n  <body>\n    <h1>Hello Workspace</h1>\n    <p>Edit html/css/js and click Preview.</p>\n  </body>\n</html>",
  css: "body {\n  font-family: system-ui, sans-serif;\n  margin: 24px;\n}\n\nh1 {\n  color: #0f766e;\n}",
  javascript: "console.log('Hello from script.js');",
  python: "print('Hello from main.py')",
};

const WORKSPACE_STORAGE_KEY = "workspace-mode-state-v1";

const inferLanguage = (name) => {
  const lower = name.toLowerCase();
  if (lower.endsWith(".py")) return "python";
  if (lower.endsWith(".js")) return "javascript";
  if (lower.endsWith(".html") || lower.endsWith(".htm")) return "html";
  if (lower.endsWith(".css")) return "css";
  return "javascript";
};

const createInitialTree = () => {
  const now = Date.now();
  return [
    {
      id: `folder-src-${now}`,
      name: "src",
      type: "folder",
      children: [
        {
          id: `file-index-${now}`,
          name: "index.html",
          type: "file",
          language: "html",
          content: snippets.html,
        },
        {
          id: `file-style-${now}`,
          name: "styles.css",
          type: "file",
          language: "css",
          content: snippets.css,
        },
        {
          id: `file-script-${now}`,
          name: "script.js",
          type: "file",
          language: "javascript",
          content: snippets.javascript,
        },
        {
          id: `file-python-${now}`,
          name: "main.py",
          type: "file",
          language: "python",
          content: snippets.python,
        },
      ],
    },
  ];
};

const findNodeById = (nodes, id) => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.type === "folder") {
      const found = findNodeById(node.children || [], id);
      if (found) return found;
    }
  }
  return null;
};

const updateNodeInTree = (nodes, id, updater) => {
  return nodes.map((node) => {
    if (node.id === id) return updater(node);
    if (node.type === "folder") {
      return {
        ...node,
        children: updateNodeInTree(node.children || [], id, updater),
      };
    }
    return node;
  });
};

const appendToFolderInTree = (nodes, folderId, newNode) => {
  if (!folderId) return [...nodes, newNode];
  return nodes.map((node) => {
    if (node.id === folderId && node.type === "folder") {
      return { ...node, children: [...(node.children || []), newNode] };
    }
    if (node.type === "folder") {
      return {
        ...node,
        children: appendToFolderInTree(node.children || [], folderId, newNode),
      };
    }
    return node;
  });
};

const collectNodeIds = (node) => {
  if (!node) return [];
  if (node.type === "file") return [node.id];

  const childIds = (node.children || []).flatMap((child) => collectNodeIds(child));
  return [node.id, ...childIds];
};

const removeNodeFromTree = (nodes, targetId) => {
  return nodes
    .filter((node) => node.id !== targetId)
    .map((node) => {
      if (node.type === "folder") {
        return {
          ...node,
          children: removeNodeFromTree(node.children || [], targetId),
        };
      }
      return node;
    });
};

const moveNodeInSiblings = (siblings, targetId, direction) => {
  const index = siblings.findIndex((node) => node.id === targetId);
  if (index === -1) return siblings;

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= siblings.length) return siblings;

  const next = [...siblings];
  [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
  return next;
};

const moveNodeInTree = (nodes, targetId, direction) => {
  const inRoot = nodes.some((node) => node.id === targetId);
  if (inRoot) return moveNodeInSiblings(nodes, targetId, direction);

  return nodes.map((node) => {
    if (node.type !== "folder") return node;

    const children = node.children || [];
    if (children.some((child) => child.id === targetId)) {
      return {
        ...node,
        children: moveNodeInSiblings(children, targetId, direction),
      };
    }

    return {
      ...node,
      children: moveNodeInTree(children, targetId, direction),
    };
  });
};

const collectFiles = (nodes) => {
  const files = [];
  const walk = (list) => {
    list.forEach((item) => {
      if (item.type === "file") files.push(item);
      if (item.type === "folder") walk(item.children || []);
    });
  };
  walk(nodes);
  return files;
};

const collectFolderIds = (nodes) => {
  const folderIds = [];
  const walk = (list) => {
    list.forEach((item) => {
      if (item.type === "folder") {
        folderIds.push(item.id);
        walk(item.children || []);
      }
    });
  };
  walk(nodes);
  return folderIds;
};

const sortNodes = (nodes) =>
  [...nodes].sort((a, b) => {
    if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

const isLikelyTextFile = (name) => {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pyc") || lower.endsWith(".pyo") || lower.endsWith(".class")) return false;
  if (lower.endsWith(".exe") || lower.endsWith(".dll") || lower.endsWith(".so")) return false;
  if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".gif")) return false;
  if (lower.endsWith(".zip") || lower.endsWith(".tar") || lower.endsWith(".gz")) return false;
  return true;
};

const countExpectedInputs = (code, language) => {
  if (!code) return 0;
  const regex = language === "javascript" ? /\bprompt\s*\(/g : /\binput\s*\(/g;
  const matches = code.match(regex);
  return matches ? matches.length : 0;
};

function TreeNode({
  node,
  level,
  selectedId,
  onSelect,
  onDelete,
  onRename,
  onMove,
  expandedFolderIds,
  onToggleFolder,
}) {
  const isSelected = node.id === selectedId;
  if (node.type === "folder") {
    const isExpanded = expandedFolderIds.includes(node.id);
    const orderedChildren = sortNodes(node.children || []);

    return (
      <Box>
        <HStack spacing={1} ml={level * 3}>
          <Button size="xs" variant="ghost" onClick={() => onToggleFolder(node.id)} minW="24px" px={0}>
            {isExpanded ? "▾" : "▸"}
          </Button>
          <Button
            size="xs"
            variant={isSelected ? "solid" : "ghost"}
            colorScheme="teal"
            justifyContent="flex-start"
            flex="1"
            onClick={() => onSelect(node.id)}
          >
            📁 {node.name}
          </Button>
          {isSelected && (
            <>
              <Button size="xs" colorScheme="yellow" variant="ghost" onClick={() => onRename(node.id)}>
                ✏
              </Button>
              <Button size="xs" variant="ghost" onClick={() => onMove(node.id, "up")}>
                ⬆
              </Button>
              <Button size="xs" variant="ghost" onClick={() => onMove(node.id, "down")}>
                ⬇
              </Button>
              <Button size="xs" colorScheme="red" variant="ghost" onClick={() => onDelete(node.id)}>
                🗑
              </Button>
            </>
          )}
        </HStack>
        {isExpanded && (
          <VStack align="stretch" spacing={1} mt={1}>
            {orderedChildren.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                level={level + 1}
                selectedId={selectedId}
                onSelect={onSelect}
                onDelete={onDelete}
                onRename={onRename}
                onMove={onMove}
                expandedFolderIds={expandedFolderIds}
                onToggleFolder={onToggleFolder}
              />
            ))}
          </VStack>
        )}
      </Box>
    );
  }

  return (
    <HStack spacing={1} ml={level * 3}>
      <Button
        size="xs"
        variant={isSelected ? "solid" : "ghost"}
        colorScheme="blue"
        justifyContent="flex-start"
        flex="1"
        onClick={() => onSelect(node.id)}
      >
        📄 {node.name}
      </Button>
      {isSelected && (
        <>
          <Button size="xs" colorScheme="yellow" variant="ghost" onClick={() => onRename(node.id)}>
            ✏
          </Button>
          <Button size="xs" variant="ghost" onClick={() => onMove(node.id, "up")}>
            ⬆
          </Button>
          <Button size="xs" variant="ghost" onClick={() => onMove(node.id, "down")}>
            ⬇
          </Button>
          <Button size="xs" colorScheme="red" variant="ghost" onClick={() => onDelete(node.id)}>
            🗑
          </Button>
        </>
      )}
    </HStack>
  );
}

const MultiLanguageWorkspace = () => {
  const toast = useToast();
  const [tree, setTree] = useState(createInitialTree);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [openTabs, setOpenTabs] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);
  const [newName, setNewName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [newType, setNewType] = useState("file");
  const [runOutput, setRunOutput] = useState("Ready");
  const [runInput, setRunInput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [hasLoadedWorkspace, setHasLoadedWorkspace] = useState(false);
  const [expandedFolderIds, setExpandedFolderIds] = useState([]);
  const importFilesInputRef = useRef(null);
  const importFolderInputRef = useRef(null);
  const [isExplorerDragOver, setIsExplorerDragOver] = useState(false);

  const allFiles = useMemo(() => collectFiles(tree), [tree]);
  const filteredFiles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return allFiles.filter((file) => file.name.toLowerCase().includes(query)).slice(0, 10);
  }, [allFiles, searchQuery]);
  const activeFile = useMemo(() => findNodeById(tree, activeFileId), [tree, activeFileId]);
  const selectedNode = useMemo(() => findNodeById(tree, selectedNodeId), [tree, selectedNodeId]);
  const expectedInputCount = useMemo(() => {
    if (!activeFile || activeFile.type !== "file") return 0;
    if (activeFile.language !== "python" && activeFile.language !== "javascript") return 0;
    return countExpectedInputs(activeFile.content || "", activeFile.language);
  }, [activeFile]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.ctrlKey && event.key.toLowerCase() === "p") {
        event.preventDefault();
        const quickName = window.prompt("Go to file (contains):", "");
        if (!quickName || !quickName.trim()) return;

        const matched = allFiles.find((file) =>
          file.name.toLowerCase().includes(quickName.trim().toLowerCase())
        );
        if (!matched) return;

        setSelectedNodeId(matched.id);
        ensureFileOpen(matched);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [allFiles]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(WORKSPACE_STORAGE_KEY);
      if (!raw) {
        setHasLoadedWorkspace(true);
        return;
      }

      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.tree) && parsed.tree.length > 0) {
        setTree(parsed.tree);
      }
      if (Array.isArray(parsed?.openTabs)) {
        setOpenTabs(parsed.openTabs);
      }
      if (typeof parsed?.activeFileId === "string" || parsed?.activeFileId === null) {
        setActiveFileId(parsed.activeFileId);
      }
      if (typeof parsed?.selectedNodeId === "string" || parsed?.selectedNodeId === null) {
        setSelectedNodeId(parsed.selectedNodeId);
      }
    } catch {
      localStorage.removeItem(WORKSPACE_STORAGE_KEY);
    } finally {
      setHasLoadedWorkspace(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedWorkspace) return;
    const payload = {
      tree,
      openTabs,
      activeFileId,
      selectedNodeId,
    };
    localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(payload));
  }, [tree, openTabs, activeFileId, selectedNodeId, hasLoadedWorkspace]);

  useEffect(() => {
    const folderIds = collectFolderIds(tree);
    setExpandedFolderIds((prev) => {
      if (!prev.length) {
        return tree.filter((node) => node.type === "folder").map((node) => node.id);
      }
      return prev.filter((id) => folderIds.includes(id));
    });
  }, [tree]);

  const ensureFileOpen = (file) => {
    setOpenTabs((prev) => (prev.includes(file.id) ? prev : [...prev, file.id]));
    setActiveFileId(file.id);
  };

  const handleSelectNode = (id) => {
    setSelectedNodeId(id);
    const node = findNodeById(tree, id);
    if (node?.type === "file") {
      ensureFileOpen(node);
    }
  };

  const handleAddNode = () => {
    if (!newName.trim()) return;

    const targetFolderId = selectedNode?.type === "folder" ? selectedNode.id : null;
    const id = `${newType}-${newName}-${Date.now()}`;

    if (newType === "folder") {
      const folder = {
        id,
        name: newName.trim(),
        type: "folder",
        children: [],
      };
      setTree((prev) => appendToFolderInTree(prev, targetFolderId, folder));
      setSelectedNodeId(id);
    } else {
      const language = inferLanguage(newName.trim());
      const file = {
        id,
        name: newName.trim(),
        type: "file",
        language,
        content: snippets[language] || "",
      };
      setTree((prev) => appendToFolderInTree(prev, targetFolderId, file));
      ensureFileOpen(file);
      setSelectedNodeId(id);
    }

    setNewName("");
  };

  const updateActiveFileContent = (nextContent) => {
    if (!activeFileId) return;
    setTree((prev) =>
      updateNodeInTree(prev, activeFileId, (node) => ({
        ...node,
        content: nextContent ?? "",
      }))
    );
  };

  const closeTab = (fileId) => {
    setOpenTabs((prev) => prev.filter((id) => id !== fileId));
    if (activeFileId === fileId) {
      const remaining = openTabs.filter((id) => id !== fileId);
      setActiveFileId(remaining[remaining.length - 1] || null);
    }
  };

  const deleteNode = (nodeId) => {
    const node = findNodeById(tree, nodeId);
    if (!node) return;

    const idsToRemove = collectNodeIds(node);

    setTree((prev) => removeNodeFromTree(prev, nodeId));
    setOpenTabs((prev) => prev.filter((id) => !idsToRemove.includes(id)));
    setSelectedNodeId((prev) => (prev && idsToRemove.includes(prev) ? null : prev));
    setActiveFileId((prev) => (prev && idsToRemove.includes(prev) ? null : prev));
  };

  const renameNode = (nodeId) => {
    const node = findNodeById(tree, nodeId);
    if (!node) return;

    const nextName = window.prompt("Rename item", node.name);
    if (!nextName || !nextName.trim()) return;

    setTree((prev) =>
      updateNodeInTree(prev, nodeId, (item) => {
        const updatedName = nextName.trim();
        return {
          ...item,
          name: updatedName,
          ...(item.type === "file" ? { language: inferLanguage(updatedName) } : {}),
        };
      })
    );
  };

  const moveNode = (nodeId, direction) => {
    setTree((prev) => moveNodeInTree(prev, nodeId, direction));
  };

  const createId = (prefix, name) =>
    `${prefix}-${name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const toggleFolder = (folderId) => {
    setExpandedFolderIds((prev) =>
      prev.includes(folderId) ? prev.filter((id) => id !== folderId) : [...prev, folderId]
    );
  };

  const readFileAsText = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result || "");
      reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
      reader.readAsText(file);
    });

  const importFromRelativeEntries = (fileEntries) => {
    const targetFolderId = selectedNode?.type === "folder" ? selectedNode.id : null;

    const importedTopNodes = [];
    let firstImportedFileId = null;
    let importedCount = 0;
    let skippedCount = 0;

    fileEntries.forEach(({ relativePath, file, textContent }) => {
      const fileName = relativePath[relativePath.length - 1] || file?.name || "";
      if (!isLikelyTextFile(fileName)) {
        skippedCount += 1;
        return;
      }

      let cursor = importedTopNodes;

      relativePath.forEach((part, index) => {
        const isLast = index === relativePath.length - 1;

        if (isLast) {
          const fileNode = {
            id: createId("file", file.name),
            name: part,
            type: "file",
            language: inferLanguage(part),
            content: textContent,
          };
          cursor.push(fileNode);
          importedCount += 1;
          if (!firstImportedFileId) firstImportedFileId = fileNode.id;
          return;
        }

        let folderNode = cursor.find((node) => node.type === "folder" && node.name === part);
        if (!folderNode) {
          folderNode = {
            id: createId("folder", part),
            name: part,
            type: "folder",
            children: [],
          };
          cursor.push(folderNode);
        }

        cursor = folderNode.children;
      });
    });

    setTree((prev) => importedTopNodes.reduce((acc, node) => appendToFolderInTree(acc, targetFolderId, node), prev));

    if (firstImportedFileId) {
      setSelectedNodeId(firstImportedFileId);
      setOpenTabs((prev) => (prev.includes(firstImportedFileId) ? prev : [...prev, firstImportedFileId]));
      setActiveFileId(firstImportedFileId);
    }

    return { importedCount, skippedCount };
  };

  const handleImportFiles = async (event) => {
    try {
      const selectedFiles = Array.from(event.target.files || []);
      if (!selectedFiles.length) return;

      const fileEntries = await Promise.all(
        selectedFiles.map(async (file) => ({
          relativePath: [file.name],
          file,
          textContent: await readFileAsText(file),
        }))
      );

      const result = importFromRelativeEntries(fileEntries);
      toast({
        title: "Import complete",
        description:
          result.skippedCount > 0
            ? `Imported ${result.importedCount} file${result.importedCount === 1 ? "" : "s"}; skipped ${result.skippedCount} binary/cache file${result.skippedCount === 1 ? "" : "s"}.`
            : `Imported ${result.importedCount} file${result.importedCount === 1 ? "" : "s"}.`,
        status: "success",
        duration: 2500,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Unable to import files.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      event.target.value = null;
    }
  };

  const handleImportFolder = async (event) => {
    try {
      const selectedFiles = Array.from(event.target.files || []);
      if (!selectedFiles.length) return;

      const fileEntries = await Promise.all(
        selectedFiles.map(async (file) => {
          const textContent = await readFileAsText(file);
          const relativePath = (file.webkitRelativePath || file.name)
            .split("/")
            .filter(Boolean);
          return { relativePath, file, textContent };
        })
      );

      const result = importFromRelativeEntries(fileEntries);
      toast({
        title: "Folder import complete",
        description:
          result.skippedCount > 0
            ? `Imported ${result.importedCount} file${result.importedCount === 1 ? "" : "s"}; skipped ${result.skippedCount} binary/cache file${result.skippedCount === 1 ? "" : "s"}.`
            : `Imported ${result.importedCount} file${result.importedCount === 1 ? "" : "s"}.`,
        status: "success",
        duration: 2500,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Folder import failed",
        description: error instanceof Error ? error.message : "Unable to import folder.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      event.target.value = null;
    }
  };

  const readDroppedEntry = async (entry, parentPath = []) => {
    if (entry.isFile) {
      const file = await new Promise((resolve, reject) => entry.file(resolve, reject));
      const textContent = await readFileAsText(file);
      return [
        {
          relativePath: [...parentPath, entry.name],
          file,
          textContent,
        },
      ];
    }

    if (entry.isDirectory) {
      const reader = entry.createReader();
      const children = [];

      while (true) {
        const batch = await new Promise((resolve, reject) => reader.readEntries(resolve, reject));
        if (!batch.length) break;
        children.push(...batch);
      }

      const nested = await Promise.all(
        children.map((child) => readDroppedEntry(child, [...parentPath, entry.name]))
      );

      return nested.flat();
    }

    return [];
  };

  const handleExplorerDragOver = (event) => {
    event.preventDefault();
    setIsExplorerDragOver(true);
  };

  const handleExplorerDragLeave = (event) => {
    event.preventDefault();
    setIsExplorerDragOver(false);
  };

  const handleExplorerDrop = async (event) => {
    event.preventDefault();
    setIsExplorerDragOver(false);

    try {
      const items = Array.from(event.dataTransfer?.items || []);
      let fileEntries = [];

      if (items.length) {
        const entries = items
          .map((item) => (item.kind === "file" && item.webkitGetAsEntry ? item.webkitGetAsEntry() : null))
          .filter(Boolean);

        if (entries.length) {
          const nested = await Promise.all(entries.map((entry) => readDroppedEntry(entry)));
          fileEntries = nested.flat();
        }
      }

      if (!fileEntries.length) {
        const fallbackFiles = Array.from(event.dataTransfer?.files || []);
        fileEntries = await Promise.all(
          fallbackFiles.map(async (file) => ({
            relativePath: [file.name],
            file,
            textContent: await readFileAsText(file),
          }))
        );
      }

      if (fileEntries.length) {
        const result = importFromRelativeEntries(fileEntries);
        toast({
          title: "Drop import complete",
          description:
            result.skippedCount > 0
              ? `Imported ${result.importedCount} file${result.importedCount === 1 ? "" : "s"}; skipped ${result.skippedCount} binary/cache file${result.skippedCount === 1 ? "" : "s"}.`
              : `Imported ${result.importedCount} file${result.importedCount === 1 ? "" : "s"}.`,
          status: "success",
          duration: 2500,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Drop import failed",
        description: error instanceof Error ? error.message : "Unable to import dropped items.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const runActiveFile = async () => {
    if (!activeFile || activeFile.type !== "file") return;
    const inputLines = runInput
      .split("\n")
      .map((line) => line.replace(/\r/g, ""))
      .filter((line) => line.trim() !== "");

    if (expectedInputCount > 0 && inputLines.length < expectedInputCount) {
      setRunOutput(
        `Input required: expected at least ${expectedInputCount} value${expectedInputCount === 1 ? "" : "s"}, got ${inputLines.length}.`
      );
      return;
    }

    setIsRunning(true);

    try {
      if (activeFile.language === "javascript") {
        const out = await runJavaScript(activeFile.content || "", inputLines);
        setRunOutput(out || "(no output)");
      } else if (activeFile.language === "python") {
        const out = await runPython(activeFile.content || "", inputLines);
        setRunOutput(out || "(no output)");
      } else {
        setRunOutput("Run supports JavaScript and Python.");
      }
    } catch (error) {
      setRunOutput(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const resetWorkspace = () => {
    localStorage.removeItem(WORKSPACE_STORAGE_KEY);
    setTree(createInitialTree());
    setSelectedNodeId(null);
    setOpenTabs([]);
    setActiveFileId(null);
    setNewName("");
    setNewType("file");
    setRunOutput("Ready");
    setRunInput("");
  };

  return (
    <HStack spacing={4} h="100%" align="stretch">
      <Box
        w="300px"
        border="1px solid rgba(0,255,204,0.3)"
        borderRadius="8px"
        p={3}
        bg="rgba(0,0,0,0.35)"
        overflow="auto"
      >
        <Text fontWeight="bold" color="#00ffcc" mb={3}>
          🧭 Explorer
        </Text>
        <HStack mb={2}>
          <Select size="sm" value={newType} onChange={(e) => setNewType(e.target.value)}>
            <option value="file">File</option>
            <option value="folder">Folder</option>
          </Select>
          <Button size="sm" colorScheme="teal" onClick={handleAddNode}>
            Add
          </Button>
        </HStack>
        <Input
          size="sm"
          placeholder={newType === "folder" ? "components" : "main.py"}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          mb={2}
        />

        <Input
          size="sm"
          placeholder="Search files... (Ctrl+P)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          mb={2}
        />

        {filteredFiles.length > 0 && (
          <VStack align="stretch" spacing={1} mb={2}>
            {filteredFiles.map((file) => (
              <Button
                key={file.id}
                size="xs"
                variant="ghost"
                justifyContent="flex-start"
                onClick={() => {
                  setSelectedNodeId(file.id);
                  ensureFileOpen(file);
                  setSearchQuery("");
                }}
              >
                🔎 {file.name}
              </Button>
            ))}
          </VStack>
        )}

        <HStack mb={3} spacing={2}>
          <Button size="xs" colorScheme="purple" onClick={() => importFilesInputRef.current?.click()}>
            Import Files
          </Button>
          <Button
            size="xs"
            colorScheme="purple"
            variant="outline"
            onClick={() => importFolderInputRef.current?.click()}
          >
            Import Folder
          </Button>
        </HStack>

        <Input
          ref={importFilesInputRef}
          type="file"
          multiple
          display="none"
          onChange={handleImportFiles}
        />

        <Input
          ref={importFolderInputRef}
          type="file"
          multiple
          webkitdirectory=""
          directory=""
          display="none"
          onChange={handleImportFolder}
        />

        <VStack align="stretch" spacing={1}>
          {sortNodes(tree).map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              level={0}
              selectedId={selectedNodeId}
              onSelect={handleSelectNode}
              onDelete={deleteNode}
              onRename={renameNode}
              onMove={moveNode}
              expandedFolderIds={expandedFolderIds}
              onToggleFolder={toggleFolder}
            />
          ))}
        </VStack>
      </Box>

      <VStack flex="1" spacing={3} align="stretch" minW={0}>
        <Box
          border="1px solid rgba(0,255,204,0.3)"
          borderRadius="8px"
          bg="rgba(0,0,0,0.35)"
          overflow="hidden"
          flex="1"
          minH={0}
        >
          <HStack justify="space-between" p={2} borderBottom="1px solid rgba(255,255,255,0.1)">
            <HStack>
              <Badge colorScheme="teal">Workspace Mode</Badge>
              <Text fontSize="sm" color="gray.300">
                {activeFile?.name || "Open a file from explorer"}
              </Text>
            </HStack>
            <HStack>
              <Button size="sm" colorScheme="green" onClick={runActiveFile} isLoading={isRunning}>
                Run Active
              </Button>
              <Button size="sm" colorScheme="red" variant="outline" onClick={resetWorkspace}>
                Reset Workspace
              </Button>
            </HStack>
          </HStack>

          <Tabs variant="line" size="sm" colorScheme="teal" index={Math.max(0, openTabs.indexOf(activeFileId))}>
            <TabList overflowX="auto" whiteSpace="nowrap">
              {openTabs.map((tabId) => {
                const file = findNodeById(tree, tabId);
                if (!file || file.type !== "file") return null;
                return (
                  <HStack key={tabId} spacing={0} mr={1}>
                    <Tab onClick={() => setActiveFileId(tabId)}>{file.name}</Tab>
                    <Button size="xs" variant="ghost" onClick={() => closeTab(tabId)}>
                      ×
                    </Button>
                  </HStack>
                );
              })}
            </TabList>
          </Tabs>

          <Box h="calc(100% - 86px)">
            {activeFile?.type === "file" ? (
              <Editor
                height="100%"
                theme="vs-dark"
                language={activeFile.language}
                value={activeFile.content || ""}
                onChange={updateActiveFileContent}
                options={{ minimap: { enabled: false } }}
              />
            ) : (
              <VStack h="100%" justify="center">
                <Text color="gray.400">Select a file to start editing.</Text>
              </VStack>
            )}
          </Box>
        </Box>

        <HStack spacing={3} align="stretch" minH="240px">
          <Box
            flex="1"
            border="1px solid rgba(0,255,204,0.3)"
            borderRadius="8px"
            p={3}
            bg="rgba(0,0,0,0.35)"
          >
            <Text fontWeight="bold" color="#00ffcc" mb={2}>
              ⌨ Input (one line per input())
            </Text>
            <Text color="gray.400" fontSize="xs" mb={2}>
              One value per line.
            </Text>
            <Textarea
              mb={3}
              value={runInput}
              onChange={(e) => setRunInput(e.target.value)}
              placeholder={"Enter input values here, one per line"}
              size="sm"
              minH="84px"
            />
            <Text fontWeight="bold" color="#00ffcc" mb={2}>
              🖥 Console
            </Text>
            <Divider mb={2} />
            <Box as="pre" whiteSpace="pre-wrap" color="gray.200" fontSize="sm" minH="160px">
              {runOutput}
            </Box>
          </Box>
        </HStack>
      </VStack>
    </HStack>
  );
};

export default MultiLanguageWorkspace;







