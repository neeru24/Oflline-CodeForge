# Offline CodeForge

Offline-first browser-based code playground built with **React, Vite, Monaco Editor, and Chakra UI**.

---

## Features

### 🧾 Classic Mode
- Run **JavaScript and Python** instantly in the browser  
- Supports **terminal-style input simulation**  
- No setup, no installation required  

### Workspace Mode
- Multi-file project support  
- File explorer with:
  - Create, rename, delete files and folders  
  - Drag and drop support  
  - Import files and folders  
- Tab-based editing system  
- Persistent storage using browser storage  

### Python Runtime
- Python runs directly in the browser using **Pyodide (WebAssembly)**  
- No installation or environment setup required  
- Runtime files served locally  

### Offline Support
- Works fully offline after initial load  
- Uses service worker caching  
- No backend or internet dependency  

### PWA Support
- Installable as a Progressive Web App  
- App-like experience on desktop and mobile  

---

## Tech Stack

- React.js – Frontend framework  
- Vite – Build tool  
- Monaco Editor – Code editor  
- Chakra UI – UI components  
- Pyodide (WebAssembly) – Python execution  
- Service Workers – Offline caching  

---

## Run Locally
npm install
npm run dev

## Production
npm run build
npm run preview

---

## 🔄 Execution Workflow

```mermaid
flowchart TD

A[User Opens App] --> B{Select Mode}

B -->|Classic Mode| C[Write Code in Monaco Editor]
B -->|Workspace Mode| D[Manage Files & Folders]

C --> E[Run Code]
D --> E

E --> F{Language Type}

F -->|JS / HTML / CSS| G[Browser Engine Execution]
F -->|Python| H[Pyodide WASM Runtime]

G --> I[Sandboxed iframe Output]
H --> I

E --> K{Input Required?}
K -->|Yes| L[Custom Input Simulation]
L --> E
K -->|No| I

I --> J[Display Output]

J --> M[Save to localStorage]

M --> N[Offline Access via Service Worker]
```

---

## Screenshots

### Landing Page - Both Light and Dark Theme 

<img width="959" height="469" alt="image" src="https://github.com/user-attachments/assets/5ee7d97d-4e7e-4118-b26d-50f9e1ec569a" />
<img width="873" height="414" alt="image" src="https://github.com/user-attachments/assets/9b99e0c1-1afd-490c-a80b-ed3ef0f8a7cc" />
<img width="772" height="384" alt="image" src="https://github.com/user-attachments/assets/456d14e1-ec52-475f-976d-666bca9ba729" />
<img width="883" height="395" alt="image" src="https://github.com/user-attachments/assets/1762b899-b384-4468-a619-c9bdc1cbfe4e" />

---

## MAIN EDITOR 
<img width="959" height="467" alt="image" src="https://github.com/user-attachments/assets/c92c10d7-41ed-4e9f-91e5-ba6b7c965f4f" />
<img width="959" height="469" alt="image" src="https://github.com/user-attachments/assets/88e3512f-45e8-483f-8e6d-923fd08b4835" />

---

## HTML/CSS PLAYGROUND
<img width="860" height="419" alt="image" src="https://github.com/user-attachments/assets/d55612d9-bca3-41cc-b4b0-0e50da900d4e" />
<img width="855" height="423" alt="image" src="https://github.com/user-attachments/assets/7963047f-d82e-4a2b-b28f-74d3ff57a7c4" />
<img width="790" height="430" alt="image" src="https://github.com/user-attachments/assets/7098be97-a644-46ef-841b-671c83a41e5e" />



## Offline Flow

1. Open the app while connected to the internet  
2. Launch the app once to initialize  
3. Wait for runtime and cache warmup  
4. Reload the application  
5. Turn off internet and continue using offline  

---

## Shortcuts

- Ctrl + Enter → Run code in Classic Mode  
- Ctrl + P → Quick open files in Workspace Mode  

---

## Key Highlights

- Zero setup required  
- Fully offline capable  
- Instant execution with no latency  
- Secure execution inside browser sandbox  

---

## Vision

Making coding **accessible, visual, and offline-first for everyone, everywhere**
