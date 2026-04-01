// ==========================================
// 🔥 JavaScript Execution (Offline + Input)
// ==========================================
export const runJavaScript = (code, input = "") => {
  let output = [];

  try {
    let inputs = input.split("\n");
    let inputIndex = 0;

    const originalLog = console.log;

    // capture console.log
    console.log = (...args) => {
      output.push(args.join(" "));
    };

    // fake prompt
    const prompt = (msg = "") => {
      const value = inputs[inputIndex++] || "";

      if (msg) output.push(`> ${msg}`);
      if (value) output.push(`> ${value}`);

      return value;
    };

    // execute user code
    new Function("prompt", code)(prompt);

    console.log = originalLog;

    return output.join("\n"); // ✅ clean output (no extra message)
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

    const safeInput = input
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"');

    // 🔥 RESET ENVIRONMENT EVERY RUN
    py.runPython(`
import sys
from io import StringIO

sys.stdout = StringIO()

input_data = """${safeInput}""".split("\\n")
input_index = 0

def input(prompt=""):
    global input_index
    if input_index < len(input_data):
        value = input_data[input_index]
        input_index += 1
        if prompt:
            print("> " + prompt)
        if value:
            print("> " + value)
        return value
    return ""
`);

    // run user code
    py.runPython(code);

    let output = py.runPython("sys.stdout.getvalue()");

    return output.trim();
  } catch (error) {
    return "❌ Error: " + error.message;
  }
};