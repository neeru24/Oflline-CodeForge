// ==========================================
// 🔥 JavaScript Execution (Offline + Input)
// ==========================================
export const runJavaScript = (code, input = "") => {
  try {
    let output = [];

    const originalLog = console.log;
    const originalPrompt = window.prompt;

    // 🔥 Capture console.log
    console.log = (...args) => {
      output.push(args.join(" "));
    };

    // 🔥 Convert input lines into array
    const inputs = input.split("\n");
    let index = 0;

    // 🔥 Override prompt()
    window.prompt = () => {
      return inputs[index++] || "";
    };

    // Execute code
    new Function(code)();

    // Restore originals
    console.log = originalLog;
    window.prompt = originalPrompt;

    return output.length > 0
      ? output.join("\n")
      : "✅ Code executed successfully!";
  } catch (error) {
    return "❌ Error: " + error.message;
  }
};

// ==========================================
// 🐍 Python Execution (Pyodide + Input)
// ==========================================

let pyodide = null;

export const loadPyodideInstance = async () => {
  if (pyodide) return pyodide;

  if (!window.loadPyodide) {
    throw new Error("Pyodide not loaded. Check index.html");
  }

  pyodide = await window.loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/",
  });

  return pyodide;
};

export const runPython = async (code, input = "") => {
  try {
    const py = await loadPyodideInstance();

    // Setup input + output capture
    py.runPython(`
import sys
from io import StringIO

_input_data = """${input}""".split("\\n")
_input_index = 0

def input():
    global _input_index
    val = _input_data[_input_index]
    _input_index += 1
    return val

sys.stdout = StringIO()
    `);

    // Run user code
    py.runPython(code);

    // Get output
    let output = py.runPython("sys.stdout.getvalue()");

    return output || "✅ Code executed successfully!";
  } catch (error) {
    return "❌ Error: " + error.message;
  }
};