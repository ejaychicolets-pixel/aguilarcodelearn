// CodeLearn engine: renders lessons, runs code, checks quizzes, saves progress.

const TRACKS = window.LESSON_TRACKS || {};
const STORAGE_KEY = "codelearn-progress-v1";
const DRAFTS_STORAGE_KEY = "codelearn-drafts-v1";
const PROJECT_DB_NAME = "codelearn-projects-v1";
const PROJECT_STORE_NAME = "projects";
const MAX_PROJECT_FILES = 1000;
const MAX_PROJECT_BYTES = 25 * 1024 * 1024;

let state = {
  track: Object.keys(TRACKS)[0],
  lessonIndex: 0,
  view: "lesson",
};

let progress = loadProgress();
let draftsStorageAvailable = true;
let drafts = loadDrafts();
const quizSessions = {};
let projectDbPromise = null;
let activeProject = null;
let selectedProjectPath = null;
let projectSaveTimer = null;

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    /* storage may be unavailable; progress still works for this visit */
  }
}

function loadDrafts() {
  try {
    const saved = JSON.parse(localStorage.getItem(DRAFTS_STORAGE_KEY));
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) return {};
    return Object.keys(saved).reduce((result, key) => {
      if (typeof saved[key] === "string") result[key] = saved[key];
      return result;
    }, {});
  } catch (e) {
    draftsStorageAvailable = false;
    return {};
  }
}

function saveDrafts() {
  try {
    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
    draftsStorageAvailable = true;
    return true;
  } catch (e) {
    draftsStorageAvailable = false;
    return false;
  }
}

function lessonsFor(track) {
  return TRACKS[track].lessons;
}

function lessonKey(track, lesson) {
  return track + ":" + lesson.id;
}

function isDone(track, lesson) {
  return !!progress[lessonKey(track, lesson)];
}

function markDone(track, lesson) {
  const key = lessonKey(track, lesson);
  const newlyCompleted = !progress[key];
  progress[key] = true;
  if (newlyCompleted) {
    saveProgress();
  }
  renderSidebar();
  renderOverallProgress();
}

// ---------- Rendering shell ----------

function renderTabs() {
  const nav = document.getElementById("language-tabs");
  nav.innerHTML = "";
  Object.keys(TRACKS).forEach((key) => {
    const btn = document.createElement("button");
    btn.textContent = TRACKS[key].name;
    if (key === state.track) btn.classList.add("active");
    btn.onclick = () => {
      state.track = key;
      state.lessonIndex = 0;
      state.view = "lesson";
      render();
    };
    nav.appendChild(btn);
  });
}

function renderSidebar() {
  const list = document.getElementById("lesson-list");
  document.getElementById("track-title").textContent = TRACKS[state.track].name + " lessons";
  list.innerHTML = "";
  lessonsFor(state.track).forEach((lesson, i) => {
    const li = document.createElement("li");
    li.textContent = lesson.title;
    if (i === state.lessonIndex) li.classList.add("active");
    if (isDone(state.track, lesson)) li.classList.add("done");
    li.onclick = () => {
      state.lessonIndex = i;
      state.view = "lesson";
      renderLesson();
      renderSidebar();
    };
    list.appendChild(li);
  });
}

function renderOverallProgress() {
  let total = 0;
  let done = 0;
  Object.keys(TRACKS).forEach((t) => {
    lessonsFor(t).forEach((l) => {
      total++;
      if (progress[lessonKey(t, l)]) done++;
    });
  });
  const pct = total ? Math.round((done / total) * 100) : 0;
  document.getElementById("progress-text").textContent = pct + "% complete";
  document.getElementById("progress-fill").style.width = pct + "%";
}

function render() {
  renderTabs();
  renderSidebar();
  const layout = document.querySelector(".layout");
  layout.classList.toggle("quiz-mode", state.view === "quiz");
  layout.classList.toggle("workspace-mode", state.view === "workspace");
  if (state.view === "quiz") {
    renderQuizPage();
  } else if (state.view === "workspace") {
    renderWorkspacePage();
  } else {
    renderLesson();
  }
  renderOverallProgress();
}

function transitionToView(view, direction) {
  state.view = view;
  render();
  const content = document.getElementById("content");
  content.classList.remove("view-enter-forward", "view-enter-back");
  void content.offsetWidth;
  content.classList.add(direction === "forward" ? "view-enter-forward" : "view-enter-back");
  window.scrollTo(0, 0);
  const headingId = view === "quiz" ? "quiz-title" : view === "workspace" ? "workspace-title" : "lesson-title";
  document.getElementById(headingId).focus({ preventScroll: true });
}

// ---------- Lesson view ----------

function renderLesson() {
  const lessons = lessonsFor(state.track);
  const lesson = lessons[state.lessonIndex];
  const content = document.getElementById("content");
  const runnerType = TRACKS[state.track].runner;

  content.innerHTML = `
    <div class="lesson-heading">
      <div>
        <span class="lesson-level">${lesson.level || (state.lessonIndex < 2 ? "Beginner" : state.lessonIndex < lessons.length - 1 ? "Intermediate" : "Advanced")}</span>
        <h1 id="lesson-title" tabindex="-1">${lesson.title}</h1>
      </div>
    </div>
    <p class="lead">${lesson.summary || ""}</p>

    <div class="card">
      ${lesson.explain}
    </div>

    <h2>Example: read it, then run it</h2>
    <div class="card">
      <pre><code>${escapeHtml(lesson.example)}</code></pre>
      ${runnerType === "html"
    ? `<h3 class="result-heading">Rendered example result</h3><p class="example-result-note">${escapeHtml(lesson.exampleResult || "The HTML is rendered in the preview below.")}</p>`
    : `<h3 class="result-heading">Example result</h3><pre class="example-result">${escapeHtml(lesson.exampleResult || "Run this example to see its output.")}</pre>`}
      ${runnerBlock(runnerType, lesson.example, "example")}
    </div>

    <h2>Your turn</h2>
    <div class="card">
      <p>${lesson.exercise.prompt}</p>
      <textarea class="editor" id="exercise-editor" spellcheck="false">${escapeHtml(lesson.exercise.starter || "")}</textarea>
      <p class="draft-status" id="draft-status" role="status" aria-live="polite"></p>
      ${runnerBlock(runnerType, null, "exercise")}
      <details class="hint">
        <summary>Show a hint</summary>
        <p>${lesson.exercise.hint}</p>
      </details>
      <details class="hint">
        <summary>Show a sample solution (try first!)</summary>
        <pre><code>${escapeHtml(lesson.exercise.solution)}</code></pre>
      </details>
    </div>

    <h2>Check what you learned</h2>
    <div class="card quiz-invite">
      <div>
        <span class="quiz-invite-kicker">20 QUESTIONS</span>
        <h3>Ready to test your knowledge?</h3>
        <p>Take a quick quiz on this lesson. You can return to the lesson without losing your answers.</p>
      </div>
      <button class="btn" id="start-quiz-btn">Start quiz <span aria-hidden="true">→</span></button>
    </div>

    <div class="nav-row">
      <button class="btn secondary" id="prev-btn" ${state.lessonIndex === 0 ? "disabled" : ""}>← Previous</button>
      <button class="btn secondary" id="next-btn" ${state.lessonIndex === lessons.length - 1 ? "disabled" : ""}>Next →</button>
    </div>
  `;

  addRainbowWords(content);
  const editor = document.getElementById("exercise-editor");
  const draftStatus = document.getElementById("draft-status");
  const key = lessonKey(state.track, lesson);
  const hasDraft = Object.prototype.hasOwnProperty.call(drafts, key);
  if (hasDraft) {
    editor.value = drafts[key];
  }
  draftStatus.textContent = !draftsStorageAvailable
    ? "Saved drafts are unavailable in this browser."
    : hasDraft
      ? "Draft restored from this device."
      : "Your code is saved automatically on this device.";
  editor.addEventListener("input", () => {
    drafts[key] = editor.value;
    draftStatus.textContent = saveDrafts()
      ? "Draft saved on this device."
      : "Could not save your draft. Check your browser storage settings.";
  });

  if (runnerType === "html") {
    document.getElementById("example-frame").srcdoc = lesson.example;
  }
  document.getElementById("start-quiz-btn").onclick = () => transitionToView("quiz", "forward");
  document.getElementById("prev-btn").onclick = () => goTo(state.lessonIndex - 1);
  document.getElementById("next-btn").onclick = () => goTo(state.lessonIndex + 1);
  window.scrollTo(0, 0);
}

function renderQuizPage() {
  const lesson = lessonsFor(state.track)[state.lessonIndex];
  const content = document.getElementById("content");
  content.innerHTML = `
    <div class="quiz-page">
      <button class="btn secondary quiz-back" id="quiz-back-top">← Back to lesson</button>
      <div class="quiz-page-heading">
        <span class="lesson-level">${TRACKS[state.track].name} review</span>
        <h1 id="quiz-title" tabindex="-1">Check what you learned</h1>
        <p class="lead">${lesson.title} · 20 questions</p>
      </div>
      <div class="quiz-progress" role="group" aria-label="Quiz progress">
        <span id="quiz-progress-text">0 of 20 questions answered</span>
        <div class="quiz-progress-bar" role="progressbar" aria-label="Questions answered" aria-valuemin="0" aria-valuemax="20" aria-valuenow="0">
          <div class="quiz-progress-fill"></div>
        </div>
      </div>
      <div class="card" id="quiz"></div>
      <div class="nav-row">
        <button class="btn secondary" id="quiz-back-bottom">← Return to lesson</button>
      </div>
    </div>
  `;
  document.getElementById("quiz-back-top").onclick = () => transitionToView("lesson", "back");
  document.getElementById("quiz-back-bottom").onclick = () => transitionToView("lesson", "back");
  renderQuiz(lesson);
  window.scrollTo(0, 0);
}

function goTo(i) {
  state.lessonIndex = i;
  state.view = "lesson";
  renderLesson();
  renderSidebar();
}

// ---------- Project workspace ----------

function openProjectDatabase() {
  if (!("indexedDB" in window)) {
    return Promise.reject(new Error("This browser does not support local project storage."));
  }
  if (!projectDbPromise) {
    projectDbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(PROJECT_DB_NAME, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(PROJECT_STORE_NAME)) {
          request.result.createObjectStore(PROJECT_STORE_NAME, { keyPath: "id" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Could not open project storage."));
      request.onblocked = () => reject(new Error("Project storage is busy in another tab. Close that tab and try again."));
    });
    projectDbPromise.catch(() => {
      projectDbPromise = null;
    });
  }
  return projectDbPromise;
}

function getStoredProjects() {
  return openProjectDatabase().then((db) => new Promise((resolve, reject) => {
    const request = db.transaction(PROJECT_STORE_NAME, "readonly")
      .objectStore(PROJECT_STORE_NAME)
      .getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Could not load projects."));
  }));
}

function getStoredProject(id) {
  return openProjectDatabase().then((db) => new Promise((resolve, reject) => {
    const request = db.transaction(PROJECT_STORE_NAME, "readonly")
      .objectStore(PROJECT_STORE_NAME)
      .get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Could not open this project."));
  }));
}

function saveStoredProject(project) {
  project.updatedAt = new Date().toISOString();
  return openProjectDatabase().then((db) => new Promise((resolve, reject) => {
    const transaction = db.transaction(PROJECT_STORE_NAME, "readwrite");
    transaction.objectStore(PROJECT_STORE_NAME).put(project);
    transaction.oncomplete = () => resolve(project);
    transaction.onerror = () => reject(transaction.error || new Error("Could not save this project."));
    transaction.onabort = () => reject(transaction.error || new Error("Project saving was interrupted."));
  }));
}

function deleteStoredProject(id) {
  return openProjectDatabase().then((db) => new Promise((resolve, reject) => {
    const transaction = db.transaction(PROJECT_STORE_NAME, "readwrite");
    transaction.objectStore(PROJECT_STORE_NAME).delete(id);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error("Could not delete this project."));
    transaction.onabort = () => reject(transaction.error || new Error("Project deletion was interrupted."));
  }));
}

function showWorkspaceStatus(message, isError) {
  const status = document.getElementById("workspace-status");
  if (!status) return;
  status.textContent = message;
  status.className = "workspace-status" + (isError ? " error" : "");
}

function showWorkspaceError(error) {
  const message = error && error.message ? error.message : "Something went wrong.";
  if (document.getElementById("workspace-status")) {
    showWorkspaceStatus(message, true);
  } else {
    window.alert(`Project workspace error: ${message}`);
  }
}

function requestWorkspaceInput(labelText, initialValue) {
  return new Promise((resolve) => {
    const dialog = document.createElement("dialog");
    dialog.className = "workspace-input-dialog";
    const form = document.createElement("form");
    const heading = document.createElement("h2");
    heading.id = "workspace-dialog-title";
    heading.textContent = labelText;
    dialog.setAttribute("aria-labelledby", heading.id);
    const label = document.createElement("label");
    label.htmlFor = "workspace-input-value";
    label.textContent = labelText;
    const input = document.createElement("input");
    input.id = "workspace-input-value";
    input.type = "text";
    input.value = initialValue;
    input.maxLength = 180;
    input.required = true;
    const actions = document.createElement("div");
    actions.className = "workspace-dialog-actions";
    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "btn secondary";
    cancel.textContent = "Cancel";
    cancel.onclick = () => dialog.close();
    const submit = document.createElement("button");
    submit.type = "submit";
    submit.className = "btn";
    submit.textContent = "Continue";
    actions.append(cancel, submit);
    form.append(heading, label, input, actions);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      dialog.close("submit");
    });
    dialog.addEventListener("close", () => {
      resolve(dialog.returnValue === "submit" ? input.value : null);
      dialog.remove();
    }, { once: true });
    dialog.appendChild(form);
    document.body.appendChild(dialog);
    dialog.showModal();
    input.focus();
    input.select();
  });
}

function renderWorkspacePage() {
  if (activeProject) {
    renderProjectEditor(activeProject);
  } else {
    renderProjectLibrary();
  }
}

function renderProjectLibrary() {
  const content = document.getElementById("content");
  content.innerHTML = `
    <section class="project-library">
      <div class="workspace-heading">
        <div>
          <span class="lesson-level">YOUR WORKSPACE</span>
          <h1 id="workspace-title" tabindex="-1">Projects</h1>
          <p class="lead">Create a project or import a folder. Projects save in this browser.</p>
        </div>
      </div>
      <div class="workspace-toolbar">
        <button class="btn" id="new-project-btn">＋ New project</button>
        <button class="btn secondary" id="import-folder-btn">Open a folder</button>
        <input id="folder-import-input" type="file" webkitdirectory directory multiple hidden>
      </div>
      <p class="workspace-status" id="workspace-status" role="status" aria-live="polite"></p>
      <div class="project-list" id="project-list"><p>Loading saved projects…</p></div>
      <p class="workspace-note">Download a project as a ZIP when you’re ready to upload it to a hosting provider.</p>
    </section>
  `;

  document.getElementById("new-project-btn").onclick = createProject;
  document.getElementById("import-folder-btn").onclick = () => {
    document.getElementById("folder-import-input").click();
  };
  document.getElementById("folder-import-input").addEventListener("change", importProjectFolder);
  getStoredProjects()
    .then((projects) => {
      if (state.view === "workspace" && !activeProject && document.getElementById("project-list")) {
        renderProjectCards(projects);
      }
    })
    .catch(showWorkspaceError);
}

function renderProjectCards(projects) {
  const list = document.getElementById("project-list");
  list.innerHTML = "";
  if (!projects.length) {
    const empty = document.createElement("div");
    empty.className = "project-empty";
    empty.textContent = "No projects yet. Create one or open a folder from your computer.";
    list.appendChild(empty);
    return;
  }

  projects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).forEach((project) => {
    const card = document.createElement("article");
    card.className = "project-card";
    const details = document.createElement("div");
    const name = document.createElement("h2");
    name.textContent = project.name;
    const info = document.createElement("p");
    info.textContent = `${project.files.length} files · Saved ${new Date(project.updatedAt).toLocaleDateString()}`;
    details.append(name, info);

    const actions = document.createElement("div");
    actions.className = "project-card-actions";
    const open = document.createElement("button");
    open.className = "btn";
    open.textContent = "Open";
    open.onclick = () => openProject(project.id);
    const remove = document.createElement("button");
    remove.className = "btn secondary";
    remove.textContent = "Delete";
    remove.onclick = () => removeProject(project.id, project.name);
    actions.append(open, remove);
    card.append(details, actions);
    list.appendChild(card);
  });
}

function createProjectId() {
  return window.crypto && typeof window.crypto.randomUUID === "function"
    ? window.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function createProject() {
  const enteredName = await requestWorkspaceInput("Project name", "My website");
  if (enteredName === null) return;
  const name = enteredName.trim().slice(0, 60);
  if (!name) {
    showWorkspaceStatus("Enter a project name to continue.", true);
    return;
  }
  const project = {
    id: createProjectId(),
    name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    folders: [],
    files: [{
      path: "index.html",
      isText: true,
      content: "<!doctype html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <title>My website</title>\n</head>\n<body>\n  <h1>Hello, world!</h1>\n  <p>Start building your project here.</p>\n</body>\n</html>\n",
    }],
  };
  saveStoredProject(project)
    .then(() => {
      activeProject = project;
      selectedProjectPath = "index.html";
      renderProjectEditor(project);
      showWorkspaceStatus("Project created and saved in this browser.");
    })
    .catch(showWorkspaceError);
}

function openProject(id) {
  getStoredProject(id)
    .then((project) => {
      if (!project) throw new Error("This project could not be found.");
      activeProject = project;
      selectedProjectPath = project.files.length ? project.files[0].path : null;
      renderProjectEditor(project);
    })
    .catch(showWorkspaceError);
}

function removeProject(id, name) {
  if (!window.confirm(`Delete “${name}” from this browser? This cannot be undone.`)) return;
  deleteStoredProject(id)
    .then(() => {
      if (activeProject && activeProject.id === id) {
        activeProject = null;
        selectedProjectPath = null;
      }
      renderProjectPageAfterChange();
      showWorkspaceStatus("Project deleted.");
    })
    .catch(showWorkspaceError);
}

function renderProjectPageAfterChange() {
  if (state.view === "workspace") renderWorkspacePage();
}

function safeProjectName(name) {
  return name.replace(/[<>:"/\\|?*\u0000-\u001f]+/g, "-").replace(/^[. ]+|[. ]+$/g, "") || "project";
}

function normalizeProjectPath(path) {
  const parts = String(path).replace(/\\/g, "/").split("/").filter(Boolean);
  if (!parts.length || parts.some((part) => (
    part === "." || part === ".." || /[\u0000-\u001f<>:"|?*]/.test(part) || /[. ]$/.test(part)
  ))) {
    return null;
  }
  return parts.join("/");
}

function getProjectFileSize(file, contentOverride) {
  return file.isText
    ? new TextEncoder().encode(contentOverride === undefined ? file.content : contentOverride).length
    : file.data ? file.data.byteLength : 0;
}

function getProjectSize(project) {
  return project.files.reduce((total, file) => total + getProjectFileSize(file), 0);
}

function addProjectFolderParents(project, path) {
  if (!path) return;
  const parts = path.split("/");
  for (let i = 1; i <= parts.length; i++) {
    const folder = parts.slice(0, i).join("/");
    if (!project.folders.includes(folder)) project.folders.push(folder);
  }
}

function importProjectFolder(event) {
  const input = event.currentTarget;
  const files = Array.from(input.files || []);
  input.value = "";
  if (!files.length) return;

  const totalBytes = files.reduce((total, file) => total + file.size, 0);
  if (files.length > MAX_PROJECT_FILES || totalBytes > MAX_PROJECT_BYTES) {
    showWorkspaceStatus("This folder is too large to import. Choose up to 1,000 files and 25 MB total.", true);
    return;
  }
  const firstPath = files[0].webkitRelativePath || files[0].name;
  const rootName = firstPath.split("/")[0] || "Imported project";
  const project = {
    id: createProjectId(),
    name: rootName.slice(0, 60),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    folders: [],
    files: [],
  };

  Promise.all(files.map(async (file) => {
    const fullPath = file.webkitRelativePath || file.name;
    const path = normalizeProjectPath(fullPath.split("/").slice(1).join("/") || file.name);
    if (!path) throw new Error(`Could not import “${file.name}” because its path contains unsupported characters.`);
    const isText = isTextProjectFile(path, file.type);
    const entry = isText
      ? { path, isText: true, content: await file.text() }
      : { path, isText: false, data: new Uint8Array(await file.arrayBuffer()) };
    addProjectFolderParents(project, path.split("/").slice(0, -1).join("/"));
    return entry;
  }))
    .then((entries) => {
      project.files = entries.filter(Boolean);
      if (!project.files.length) throw new Error("The selected folder did not contain any files.");
      if (getProjectSize(project) > MAX_PROJECT_BYTES) {
        throw new Error("The imported folder expands beyond the 25 MB project limit.");
      }
      return saveStoredProject(project);
    })
    .then(() => {
      activeProject = project;
      selectedProjectPath = project.files.find((file) => file.isText)?.path || project.files[0].path;
      renderProjectEditor(project);
      showWorkspaceStatus(`Imported ${project.files.length} files and saved the project in this browser.`);
    })
    .catch(showWorkspaceError);
}

function isTextProjectFile(path, mimeType) {
  const name = path.split("/").pop().toLowerCase();
  return mimeType.startsWith("text/")
    || /^(dockerfile|makefile|license|readme|\.env|\.gitignore|\.editorconfig)$/.test(name)
    || /\.(html?|css|scss|js|mjs|cjs|ts|tsx|jsx|json|md|txt|xml|svg|ya?ml|toml|py|c|h|cc|cpp|hpp|java|go|rs|php|sql|sh|bat|ps1|ini|conf|log|env|gitignore)$/.test(name)
    || mimeType === "application/json";
}

function renderProjectEditor(project) {
  const content = document.getElementById("content");
  const selectedFile = project.files.find((file) => file.path === selectedProjectPath);
  content.innerHTML = `
    <section class="project-workspace">
      <div class="workspace-editor-heading">
        <button class="btn secondary" id="back-to-projects-btn">← All projects</button>
        <div class="workspace-project-name">
          <span class="lesson-level">PROJECT</span>
          <h1 id="workspace-title" tabindex="-1"></h1>
        </div>
        <div class="workspace-toolbar compact">
          <button class="btn secondary" id="new-project-folder-btn">＋ Folder</button>
          <button class="btn secondary" id="new-project-file-btn">＋ File</button>
          <button class="btn" id="download-project-zip-btn">Download ZIP</button>
        </div>
      </div>
      <p class="workspace-status" id="workspace-status" role="status" aria-live="polite">Project saved in this browser.</p>
      <div class="workspace-shell">
        <aside class="project-explorer">
          <div class="explorer-heading">EXPLORER</div>
          <div id="project-tree" class="project-tree"></div>
        </aside>
        <section class="project-code-panel">
          <div class="project-file-tab" id="project-file-tab"></div>
          <textarea id="project-code-editor" class="project-code-editor" aria-label="Project file editor" spellcheck="false" hidden></textarea>
          <p id="project-binary-note" class="project-binary-note" hidden></p>
          <div id="project-empty-editor" class="project-empty-editor" hidden>Select a file to start editing.</div>
        </section>
      </div>
      <div class="workspace-publish">
        <p>Download a ZIP, then publish it using your hosting provider’s supported workflow.</p>
        <a href="https://app.netlify.com/drop" target="_blank" rel="noopener noreferrer">Netlify Drop</a>
        <a href="https://vercel.com/docs/deployments" target="_blank" rel="noopener noreferrer">Vercel deploy guide</a>
      </div>
    </section>
  `;
  document.getElementById("workspace-title").textContent = project.name;
  document.getElementById("back-to-projects-btn").onclick = returnToProjectLibrary;
  document.getElementById("new-project-folder-btn").onclick = addProjectFolder;
  document.getElementById("new-project-file-btn").onclick = addProjectFile;
  document.getElementById("download-project-zip-btn").onclick = downloadProjectZip;
  renderProjectTree(project);

  const fileTab = document.getElementById("project-file-tab");
  const editor = document.getElementById("project-code-editor");
  const binaryNote = document.getElementById("project-binary-note");
  const emptyEditor = document.getElementById("project-empty-editor");
  if (!selectedFile) {
    emptyEditor.hidden = false;
  } else {
    fileTab.textContent = selectedFile.path;
    if (selectedFile.isText) {
      editor.hidden = false;
      editor.value = selectedFile.content;
      editor.addEventListener("input", () => {
        const nextContent = editor.value;
        const otherBytes = project.files.reduce((total, file) => (
          total + (file === selectedFile ? 0 : getProjectFileSize(file))
        ), 0);
        if (otherBytes + getProjectFileSize(selectedFile, nextContent) > MAX_PROJECT_BYTES) {
          editor.value = selectedFile.content;
          showWorkspaceStatus("This project has reached the 25 MB limit.", true);
          return;
        }
        selectedFile.content = nextContent;
        showWorkspaceStatus("Saving changes…");
        scheduleProjectSave(project);
      });
      editor.addEventListener("blur", () => {
        if (projectSaveTimer === null) return;
        flushProjectSave()
          .then(() => {
            if (activeProject && activeProject.id === project.id) showWorkspaceStatus("Changes saved in this browser.");
          })
          .catch(showWorkspaceError);
      });
    } else {
      binaryNote.hidden = false;
      binaryNote.textContent = "This is a binary asset. It is preserved in your ZIP export but cannot be edited in the text editor.";
    }
  }
}

function renderProjectTree(project) {
  const tree = document.getElementById("project-tree");
  tree.innerHTML = "";
  const folders = new Set(project.folders);
  project.files.forEach((file) => {
    const parts = file.path.split("/");
    for (let i = 1; i < parts.length; i++) folders.add(parts.slice(0, i).join("/"));
  });
  Array.from(folders).sort((a, b) => a.split("/").length - b.split("/").length || a.localeCompare(b))
    .forEach((path) => {
      const folder = document.createElement("div");
      folder.className = "project-tree-folder";
      folder.style.paddingLeft = `${0.65 + (path.split("/").length - 1) * 0.9}rem`;
      folder.textContent = `▸ ${path.split("/").pop()}`;
      folder.title = path;
      tree.appendChild(folder);
    });
  project.files.slice().sort((a, b) => a.path.localeCompare(b.path)).forEach((file) => {
    const button = document.createElement("button");
    button.className = "project-tree-file" + (file.path === selectedProjectPath ? " active" : "");
    button.style.paddingLeft = `${0.65 + file.path.split("/").slice(0, -1).length * 0.9}rem`;
    button.textContent = `▤ ${file.path.split("/").pop()}`;
    button.title = file.path;
    button.setAttribute("aria-pressed", file.path === selectedProjectPath ? "true" : "false");
    button.onclick = () => {
      selectedProjectPath = file.path;
      renderProjectEditor(activeProject);
    };
    tree.appendChild(button);
  });
}

function scheduleProjectSave(project) {
  window.clearTimeout(projectSaveTimer);
  projectSaveTimer = window.setTimeout(() => {
    projectSaveTimer = null;
    saveStoredProject(project)
      .then(() => {
        if (state.view === "workspace" && activeProject && activeProject.id === project.id) {
          showWorkspaceStatus(`Saved in this browser at ${new Date().toLocaleTimeString()}.`);
        }
      })
      .catch(showWorkspaceError);
  }, 350);
}

function flushProjectSave() {
  window.clearTimeout(projectSaveTimer);
  projectSaveTimer = null;
  return activeProject ? saveStoredProject(activeProject) : Promise.resolve();
}

function returnToProjectLibrary() {
  flushProjectSave()
    .then(() => {
      activeProject = null;
      selectedProjectPath = null;
      renderProjectLibrary();
    })
    .catch(showWorkspaceError);
}

async function addProjectFolder() {
  const enteredPath = await requestWorkspaceInput("Folder path", "assets");
  if (enteredPath === null) return;
  const path = normalizeProjectPath(enteredPath);
  if (!path) {
    showWorkspaceStatus("Enter a valid folder path without parent references or reserved characters.", true);
    return;
  }
  addProjectFolderParents(activeProject, path);
  flushProjectSave()
    .then(() => {
      renderProjectEditor(activeProject);
      showWorkspaceStatus("Folder added and project saved.");
    })
    .catch(showWorkspaceError);
}

async function addProjectFile() {
  const currentFolder = selectedProjectPath && selectedProjectPath.includes("/")
    ? selectedProjectPath.slice(0, selectedProjectPath.lastIndexOf("/") + 1)
    : "";
  const enteredPath = await requestWorkspaceInput("File path", `${currentFolder}new-file.js`);
  if (enteredPath === null) return;
  const path = normalizeProjectPath(enteredPath);
  if (!path) {
    showWorkspaceStatus("Enter a valid file path without parent references or reserved characters.", true);
    return;
  }
  const isReplacement = activeProject.files.some((file) => file.path === path);
  if (!isReplacement && activeProject.files.length >= MAX_PROJECT_FILES) {
    showWorkspaceStatus("This project has reached the 1,000-file limit.", true);
    return;
  }
  const file = { path, isText: true, content: "" };
  const existing = activeProject.files.find((entry) => entry.path === path);
  const projectedSize = getProjectSize(activeProject)
    - (existing ? getProjectFileSize(existing) : 0)
    + getProjectFileSize(file);
  if (projectedSize > MAX_PROJECT_BYTES) {
    showWorkspaceStatus("This project has reached the 25 MB limit.", true);
    return;
  }
  if (isReplacement && !window.confirm(`Replace ${path}?`)) return;
  activeProject.files = activeProject.files.filter((file) => file.path !== path);
  activeProject.files.push(file);
  addProjectFolderParents(activeProject, path.split("/").slice(0, -1).join("/"));
  flushProjectSave()
    .then(() => {
      selectedProjectPath = path;
      renderProjectEditor(activeProject);
      showWorkspaceStatus("File added and project saved.");
    })
    .catch(showWorkspaceError);
}

function downloadProjectZip() {
  const button = document.getElementById("download-project-zip-btn");
  button.disabled = true;
  flushProjectSave()
    .then(() => createProjectZip(activeProject))
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${safeProjectName(activeProject.name)}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      showWorkspaceStatus("ZIP downloaded. Upload it using your hosting provider’s supported workflow.");
    })
    .catch(showWorkspaceError)
    .finally(() => {
      if (document.getElementById("download-project-zip-btn")) {
        document.getElementById("download-project-zip-btn").disabled = false;
      }
    });
}

function zipCrc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = ZIP_CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const ZIP_CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < table.length; n++) {
    let value = n;
    for (let bit = 0; bit < 8; bit++) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[n] = value >>> 0;
  }
  return table;
})();

async function compressZipFile(bytes) {
  if (typeof CompressionStream === "undefined") return { method: 0, bytes };
  let compressor;
  try {
    compressor = new CompressionStream("deflate-raw");
  } catch (e) {
    return { method: 0, bytes };
  }
  try {
    const stream = new Blob([bytes]).stream().pipeThrough(compressor);
    const compressed = new Uint8Array(await new Response(stream).arrayBuffer());
    return compressed.length < bytes.length
      ? { method: 8, bytes: compressed }
      : { method: 0, bytes };
  } catch (e) {
    return { method: 0, bytes };
  }
}

async function createProjectZip(project) {
  const encoder = new TextEncoder();
  const entries = project.folders.map((path) => ({ path: `${path}/`, isFolder: true, bytes: new Uint8Array() }));
  project.files.forEach((file) => {
    const bytes = file.isText ? encoder.encode(file.content) : new Uint8Array(file.data);
    entries.push({ path: file.path, isFolder: false, bytes });
  });
  if (!entries.length) throw new Error("Add at least one file before downloading a ZIP.");

  const localParts = [];
  const centralParts = [];
  let localOffset = 0;
  let centralSize = 0;
  const now = new Date();
  const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
  const dosDate = ((Math.max(now.getFullYear(), 1980) - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();

  for (const entry of entries) {
    const name = encoder.encode(entry.path);
    const compressed = entry.isFolder ? { method: 0, bytes: entry.bytes } : await compressZipFile(entry.bytes);
    const crc = zipCrc32(entry.bytes);
    const localHeader = new Uint8Array(30 + name.length);
    const local = new DataView(localHeader.buffer);
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint16(6, 0x0800, true);
    local.setUint16(8, compressed.method, true);
    local.setUint16(10, dosTime, true);
    local.setUint16(12, dosDate, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, compressed.bytes.length, true);
    local.setUint32(22, entry.bytes.length, true);
    local.setUint16(26, name.length, true);
    local.setUint16(28, 0, true);
    localHeader.set(name, 30);
    localParts.push(localHeader, compressed.bytes);

    const centralHeader = new Uint8Array(46 + name.length);
    const central = new DataView(centralHeader.buffer);
    central.setUint32(0, 0x02014b50, true);
    central.setUint16(4, 20, true);
    central.setUint16(6, 20, true);
    central.setUint16(8, 0x0800, true);
    central.setUint16(10, compressed.method, true);
    central.setUint16(12, dosTime, true);
    central.setUint16(14, dosDate, true);
    central.setUint32(16, crc, true);
    central.setUint32(20, compressed.bytes.length, true);
    central.setUint32(24, entry.bytes.length, true);
    central.setUint16(28, name.length, true);
    central.setUint16(30, 0, true);
    central.setUint16(32, 0, true);
    central.setUint16(34, 0, true);
    central.setUint16(36, 0, true);
    central.setUint32(38, entry.isFolder ? 0x10 : 0, true);
    central.setUint32(42, localOffset, true);
    centralHeader.set(name, 46);
    centralParts.push(centralHeader);

    localOffset += localHeader.length + compressed.bytes.length;
    centralSize += centralHeader.length;
  }

  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, entries.length, true);
  endView.setUint16(10, entries.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, localOffset, true);
  endView.setUint16(20, 0, true);
  return new Blob([...localParts, ...centralParts, end], { type: "application/zip" });
}

document.getElementById("open-projects").addEventListener("click", () => {
  flushProjectSave()
    .then(() => {
      activeProject = null;
      selectedProjectPath = null;
      transitionToView("workspace", "forward");
    })
    .catch(showWorkspaceError);
});

// ---------- Runners ----------

function runnerBlock(type, fixedCode, which) {
  if (type === "js") {
    return `<div class="btn-row">
      <button class="btn" onclick="runJS('${which}', ${fixedCode === null ? "null" : "true"})">▶ Run</button>
    </div>
    <div class="output" id="${which}-output">Output will appear here.</div>`;
  }
  if (type === "html") {
    return `<div class="btn-row">
      <button class="btn" onclick="runHTML('${which}')">▶ Preview</button>
    </div>
    <iframe class="preview-frame" id="${which}-frame" title="${which === "example" ? "Example rendered result" : "Exercise preview"}" sandbox="allow-scripts"></iframe>`;
  }
  if (type === "python") {
    return `<div class="btn-row">
      <button class="btn" id="${which}-py-btn" onclick="runPython('${which}')">▶ Run</button>
    </div>
    <div class="output" id="${which}-output">Output will appear here. (First run loads Python, which takes a few seconds.)</div>`;
  }
  if (type === "cpp") {
    const checkBtn = which === "exercise"
      ? `<div class="btn-row"><button class="btn" onclick="checkExerciseIfNeeded('exercise')">✔ Check my code</button></div>`
      : "";
    return `${checkBtn}<div class="output">C++ needs a compiler, so run it on your own computer. Save the code as <code>main.cpp</code>, then run:
g++ -std=c++17 main.cpp -o main
./main        (Windows: main.exe, or use an online compiler if you have no g++)</div>`;
  }
  return "";
}

function getCode(which) {
  if (which === "exercise") return document.getElementById("exercise-editor").value;
  // For the example, use the lesson's example code.
  return lessonsFor(state.track)[state.lessonIndex].example;
}

function setOutput(which, text, isError) {
  const el = document.getElementById(which + "-output");
  el.textContent = text;
  el.classList.toggle("error", !!isError);
}

async function runJS(which) {
  const code = getCode(which);
  const logs = [];
  const fakeConsole = {
    log: (...args) => logs.push(args.map(formatValue).join(" ")),
    error: (...args) => logs.push("Error: " + args.map(formatValue).join(" ")),
    warn: (...args) => logs.push("Warning: " + args.map(formatValue).join(" ")),
  };
  try {
    // Run in a function scope with console replaced, so output appears on the page.
    const execute = new Function("console", `return (async () => {\n${code}\n})()`);
    await execute(fakeConsole);
    setOutput(which, logs.length ? logs.join("\n") : "(no output - try console.log)", false);
  } catch (err) {
    setOutput(which, logs.join("\n") + (logs.length ? "\n" : "") + "Error: " + err.message, true);
  }
  checkExerciseIfNeeded(which);
}

function runHTML(which) {
  const code = getCode(which);
  document.getElementById(which + "-frame").srcdoc = code;
  checkExerciseIfNeeded(which);
}

let pyodideReady = null;
async function loadPyodideOnce() {
  if (!pyodideReady) {
    pyodideReady = (async () => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";
      document.head.appendChild(script);
      await new Promise((res, rej) => {
        script.onload = res;
        script.onerror = () => rej(new Error("Could not load Python runtime. Check your internet connection."));
      });
      return await loadPyodide();
    })();
  }
  return pyodideReady;
}

async function runPython(which) {
  const btn = document.getElementById(which + "-py-btn");
  btn.disabled = true;
  setOutput(which, "Loading Python...", false);
  try {
    const py = await loadPyodideOnce();
    // Capture print() output into a variable.
    py.runPython(`
import sys, io
sys.stdout = io.StringIO()
`);
    try {
      py.runPython(getCode(which));
      const out = py.runPython("sys.stdout.getvalue()");
      setOutput(which, out || "(no output - try print())", false);
    } catch (err) {
      const out = py.runPython("sys.stdout.getvalue()");
      setOutput(which, out + "Error: " + err.message, true);
    } finally {
      py.runPython("sys.stdout = sys.__stdout__");
    }
    checkExerciseIfNeeded(which);
  } catch (err) {
    setOutput(which, err.message, true);
  } finally {
    btn.disabled = false;
  }
}

// ---------- Exercise checking ----------
// Lessons can define exercise.check(code) returning { ok, message }.
// Used for lightweight automatic feedback on exercises.

function checkExerciseIfNeeded(which) {
  if (which !== "exercise") return;
  const lesson = lessonsFor(state.track)[state.lessonIndex];
  if (!lesson.exercise.check) return;
  const code = getCode("exercise");
  let result;
  try {
    result = lesson.exercise.check(code);
  } catch (e) {
    result = { ok: false, message: "Could not check this yet. " + e.message };
  }
  const feedbackEl = document.getElementById("exercise-feedback") || createFeedbackEl();
  feedbackEl.className = "feedback " + (result.ok ? "ok" : "bad");
  feedbackEl.textContent = result.message;
  if (result.ok) markDone(state.track, lesson);
}

function createFeedbackEl() {
  const el = document.createElement("div");
  el.id = "exercise-feedback";
  el.className = "feedback";
  const editor = document.getElementById("exercise-editor");
  editor.parentNode.insertBefore(el, editor.nextSibling);
  return el;
}

// ---------- Quiz ----------

function renderQuiz(lesson) {
  const el = document.getElementById("quiz");
  el.innerHTML = "";
  const session = quizSessionFor(lesson);
  const questions = session.questions;
  const grid = document.createElement("div");
  grid.className = "quiz-grid";
  questions.forEach((item, qi) => {
    const wrap = document.createElement("div");
    wrap.className = "quiz-item";
    const question = document.createElement("div");
    question.className = "quiz-q";
    question.textContent = `${qi + 1}. ${item.q}`;
    wrap.appendChild(question);
    item.options.forEach((opt, oi) => {
      const label = document.createElement("label");
      label.className = "quiz-opt";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `q${qi}`;
      input.value = oi;
      input.checked = session.answers[qi] === oi;
      input.addEventListener("change", () => {
        session.answers[qi] = oi;
        session.result = null;
        const feedback = el.querySelector(".quiz-feedback");
        if (feedback) feedback.remove();
        updateQuizProgress(session);
      });
      const text = document.createTextNode(" " + opt);
      label.append(input, text);
      wrap.appendChild(label);
    });
    grid.appendChild(wrap);
  });
  el.appendChild(grid);

  const btn = document.createElement("button");
  btn.className = "btn";
  btn.textContent = "Check answers";
  btn.onclick = () => {
    if (session.answers.some((answer) => answer === null)) {
      session.result = { message: `Answer all ${questions.length} questions before checking your score.`, allRight: false };
    } else {
      const correct = questions.reduce(
        (total, question, index) => total + (session.answers[index] === question.answer ? 1 : 0),
        0,
      );
      const allRight = correct === questions.length;
      session.result = {
        message: allRight
          ? `All ${correct} correct. Lesson complete!`
          : `${correct} of ${questions.length} correct. Review your choices and try again.`,
        allRight,
      };
      if (allRight) markDone(state.track, lesson);
    }
    el.querySelectorAll(".quiz-feedback").forEach((node) => node.remove());
    renderQuizFeedback(el, session);
  };
  el.appendChild(btn);
  renderQuizFeedback(el, session);
  updateQuizProgress(session);
  addRainbowWords(el);
}

function quizSessionFor(lesson) {
  const key = lessonKey(state.track, lesson);
  if (!quizSessions[key]) {
    const questions = buildLessonQuiz(lesson);
    quizSessions[key] = {
      questions,
      answers: Array(questions.length).fill(null),
      result: null,
    };
  }
  return quizSessions[key];
}

function renderQuizFeedback(container, session) {
  if (!session.result) return;
  const feedback = document.createElement("div");
  feedback.className = "feedback quiz-feedback " + (session.result.allRight ? "ok" : "bad");
  feedback.setAttribute("role", "status");
  feedback.textContent = session.result.message;
  container.appendChild(feedback);
}

function updateQuizProgress(session) {
  const answered = session.answers.filter((answer) => answer !== null).length;
  const text = document.getElementById("quiz-progress-text");
  const bar = document.querySelector(".quiz-progress-bar");
  text.textContent = `${answered} of ${session.questions.length} questions answered`;
  bar.setAttribute("aria-valuemax", session.questions.length);
  bar.setAttribute("aria-valuenow", answered);
  bar.firstElementChild.style.width = `${(answered / session.questions.length) * 100}%`;
}

function buildLessonQuiz(lesson) {
  const facts = window.LESSON_QUIZ_FACTS[lesson.id];
  if (!facts || facts.length !== 5) return lesson.quiz;

  const questions = [];
  const questionKinds = [
    { field: "meaning", prompt: (fact) => `What does ${fact.term} help you do?` },
    { field: "syntax", prompt: (fact) => `Which example correctly uses ${fact.term}?` },
    { field: "result", prompt: (fact) => `What does this ${fact.term} example produce: ${fact.syntax}?` },
    { field: "pitfall", prompt: (fact) => `Which mistake should you avoid with ${fact.term}?` },
  ];

  questionKinds.forEach((kind) => {
    facts.forEach((fact, index) => {
      const options = [fact[kind.field]];
      for (let offset = 1; offset < facts.length && options.length < 4; offset++) {
        const distractor = facts[(index + offset) % facts.length][kind.field];
        if (!options.includes(distractor)) options.push(distractor);
      }
      if (options.length !== 4) {
        throw new Error(`Quiz facts for ${lesson.id} must have four distinct ${kind.field} choices.`);
      }
      const answer = Math.floor(Math.random() * options.length);
      [options[answer], options[0]] = [options[0], options[answer]];
      questions.push({ q: kind.prompt(fact), options, answer });
    });
  });

  return questions;
}

// ---------- Helpers ----------

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function addRainbowWords(container) {
  const cards = container.matches(".card") ? [container] : container.querySelectorAll(".card");
  let wordIndex = 0;
  cards.forEach((card) => {
    const walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || parent.closest("a, button, textarea, input, select, option, .quiz-opt, .feedback")) {
          return NodeFilter.FILTER_REJECT;
        }
        if (!parent.closest("p, li, h3, h4, strong, code, .quiz-q") || !node.textContent.trim()) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const textNodes = [];
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }
    textNodes.forEach((node) => {
      let ancestor = node.parentElement;
      while (ancestor && ancestor !== card) {
        if (ancestor.matches("p, li, h3, h4, strong, code, .quiz-q")) {
          ancestor.classList.add("rainbow-words");
        }
        ancestor = ancestor.parentElement;
      }

      const fragment = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          fragment.appendChild(document.createTextNode(part));
          return;
        }
        const word = document.createElement("span");
        word.className = "rainbow-word";
        word.style.setProperty("--word-hue", `${(wordIndex * 47) % 360}deg`);
        word.textContent = part;
        wordIndex++;
        fragment.appendChild(word);
      });
      node.parentNode.replaceChild(fragment, node);
    });
  });
}

function formatValue(v) {
  if (typeof v === "object") {
    try { return JSON.stringify(v); } catch (e) { return String(v); }
  }
  return String(v);
}

// Expose handlers used by inline onclick attributes.
window.runJS = runJS;
window.runHTML = runHTML;
window.runPython = runPython;
window.checkExerciseIfNeeded = checkExerciseIfNeeded;

render();
