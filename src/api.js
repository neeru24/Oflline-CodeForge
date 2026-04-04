export const runJavaScript = (code, inputs = []) => {
  const workerSource = `
self.onmessage = (event) => {
  const { code, inputs } = event.data;
  const output = [];
  let inputIndex = 0;

  const emit = (...args) => {
    output.push(args.map((arg) => String(arg)).join(" "));
  };

  const consoleProxy = {
    log: (...args) => emit(...args),
    info: (...args) => emit(...args),
    warn: (...args) => emit(...args),
    error: (...args) => emit(...args),
  };

  const prompt = () => {
    const value = inputs[inputIndex];
    inputIndex += 1;
    return value ?? "";
  };

  try {
    const runner = new Function("console", "prompt", code);
    runner(consoleProxy, prompt);
    self.postMessage({ ok: true, output: output.join("\\n") || "> (no output)" });
  } catch (error) {
    self.postMessage({ ok: false, error: String(error?.message || error) });
  }
};
`;

  return new Promise((resolve) => {
    const workerBlob = new Blob([workerSource], { type: "application/javascript" });
    const workerUrl = URL.createObjectURL(workerBlob);
    const worker = new Worker(workerUrl);

    const cleanup = () => {
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
    };

    const timeoutId = window.setTimeout(() => {
      cleanup();
      resolve("❌ Error: JavaScript execution timed out.");
    }, 4000);

    worker.onmessage = (event) => {
      clearTimeout(timeoutId);
      cleanup();

      if (event.data?.ok) {
        resolve(event.data.output);
        return;
      }

      resolve("❌ Error: " + (event.data?.error || "JavaScript execution failed."));
    };

    worker.onerror = () => {
      clearTimeout(timeoutId);
      cleanup();
      resolve("❌ Error: JavaScript worker crashed.");
    };

    worker.postMessage({ code, inputs: Array.isArray(inputs) ? inputs : [] });
  });
};

let pyodide = null;

const formatExecutionError = (error) => {
  const raw = String(error?.message ?? error ?? "").trim();
  if (!raw) return "Unknown execution error.";

  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return lines[lines.length - 1] || raw;
};

export const loadPyodideInstance = async () => {
  if (pyodide) return pyodide;

  if (!window.loadPyodide) {
    throw new Error("Pyodide loader missing. Ensure /pyodide/pyodide.js is available.");
  }

  pyodide = await window.loadPyodide({
    indexURL: "/pyodide/",
  });

  return pyodide;
};

export const runPython = async (code, input = []) => {
  try {
    const py = await loadPyodideInstance();
    const inputValues = Array.isArray(input) ? input : [];

    py.globals.set("__js_input_values", inputValues);

    py.runPython(`
import sys
from io import StringIO

sys.stdout = StringIO()
sys.stderr = StringIO()

input_data = [str(v) for v in __js_input_values]
input_index = 0

def input(prompt=""):
    global input_index
    if input_index < len(input_data):
        value = input_data[input_index]
        input_index += 1
        return value
    return ""
`);

    try {
      py.runPython(code);
    } catch (err) {
      return "❌ Error: " + formatExecutionError(err);
    } finally {
      py.globals.delete("__js_input_values");
    }

    const stdout = py.runPython("sys.stdout.getvalue()");
    const stderr = py.runPython("sys.stderr.getvalue()");
    const combined = [stdout, stderr].filter(Boolean).join("\n").trim();
    return combined || "> (no output)";
  } catch (error) {
    return "❌ Error: " + formatExecutionError(error);
  }
};