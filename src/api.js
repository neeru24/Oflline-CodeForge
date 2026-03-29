// ==========================================
// 🔥 JavaScript Execution (Offline + Input)
// ==========================================
export const runJavaScript = (code, input = "") => {
  let output = [];

  try {
    let inputs = input.split("\n");
    let inputIndex = 0;

    const originalLog = console.log;

    // 🔥 capture console.log
    console.log = (...args) => {
      output.push(args.join(" "));
    };

    // 🔥 fake prompt
    const prompt = (msg = "") => {
      const value = inputs[inputIndex++] || "";

      if (msg) output.push(`> ${msg}`);
      output.push(`> ${value}`);

      return value;
    };

    // execute code
    new Function("prompt", code)(prompt);

    // restore console
    console.log = originalLog;

    return output.length
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

    // 🔥 escape input safely
    const safeInput = input.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

    py.runPython(`
import sys
from io import StringIO

input_data = """${safeInput}""".split("\\n")
input_index = 0

def input(prompt=""):
    global input_index
    if input_index < len(input_data):
        value = input_data[input_index]
        input_index += 1
        if prompt:
            print("> " + prompt)
        print("> " + value)
        return value
    return ""

sys.stdout = StringIO()
    `);

    py.runPython(code);

    let output = py.runPython("sys.stdout.getvalue()");

    return output || "✅ Code executed successfully!";
  } catch (error) {
    return "❌ Error: " + error.message;
  }
};