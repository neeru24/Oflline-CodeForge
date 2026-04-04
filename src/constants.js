export const LANGUAGE_VERSIONS = {
  javascript: "18.15.0",
  python: "3.10.0",
  html: "5",
  css: "3",
};

export const CODE_SNIPPETS = {
  javascript: `function greet(name) {
  console.log("Hello, " + name + "!");
}

greet("Alex");`,

  python: `def greet(name):
    print("Hello, " + name + "!")

greet("Alex")`,

  html: `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Modern HTML Starter</title>
  </head>
  <body>
    <main class="hero">
      <section class="card">
        <span class="chip">Starter</span>
        <h1>Modern HTML</h1>
        <p>Create a clean landing section and style it with CSS.</p>
        <button>Get Started</button>
      </section>
    </main>
  </body>
</html>`,

  css: `* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  font-family: system-ui, sans-serif;
  background: linear-gradient(135deg, #0f172a 0%, #312e81 100%);
  display: grid;
  place-items: center;
  padding: 24px;
}

.hero {
  width: 100%;
  display: grid;
  place-items: center;
}

.card {
  width: min(92vw, 440px);
  padding: 36px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(12px);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25);
  text-align: center;
}

.chip {
  display: inline-block;
  margin-bottom: 14px;
  padding: 6px 12px;
  border-radius: 999px;
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
}

h1 {
  margin: 0 0 10px;
  color: #111827;
  font-size: clamp(32px, 4vw, 44px);
}

p {
  margin: 0 0 24px;
  color: #4b5563;
  line-height: 1.6;
}

button {
  border: 0;
  padding: 12px 20px;
  border-radius: 14px;
  background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 12px 30px rgba(37, 99, 235, 0.35);
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 34px rgba(37, 99, 235, 0.45);
}`,
};