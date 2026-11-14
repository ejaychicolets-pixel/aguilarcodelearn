// CodeLearn engine: renders lessons, runs code, checks quizzes, saves progress.

const TRACKS = window.LESSON_TRACKS || {};
const STORAGE_KEY = "codelearn-progress-v1";

let state = {
  track: Object.keys(TRACKS)[0],
  lessonIndex: 0,
};

let progress = loadProgress();

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
  renderLesson();
  renderOverallProgress();
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
        <h1>${lesson.title}</h1>
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

    <h2>20-question review</h2>
    <div class="card" id="quiz"></div>

    <div class="nav-row">
      <button class="btn secondary" id="prev-btn" ${state.lessonIndex === 0 ? "disabled" : ""}>← Previous</button>
      <button class="btn secondary" id="next-btn" ${state.lessonIndex === lessons.length - 1 ? "disabled" : ""}>Next →</button>
    </div>
  `;

  renderQuiz(lesson);
  if (runnerType === "html") {
    document.getElementById("example-frame").srcdoc = lesson.example;
  }
  document.getElementById("prev-btn").onclick = () => goTo(state.lessonIndex - 1);
  document.getElementById("next-btn").onclick = () => goTo(state.lessonIndex + 1);
  window.scrollTo(0, 0);
}

function goTo(i) {
  state.lessonIndex = i;
  renderLesson();
  renderSidebar();
}

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
  const questions = buildLessonQuiz(lesson);
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
    let correct = 0;
    questions.forEach((item, qi) => {
      const chosen = document.querySelector(`input[name="q${qi}"]:checked`);
      if (chosen && Number(chosen.value) === item.answer) correct++;
    });
    const msg = document.createElement("div");
    const allRight = correct === questions.length;
    msg.className = "feedback " + (allRight ? "ok" : "bad");
    msg.textContent = allRight
      ? `All ${correct} correct. Lesson complete!`
      : `${correct} of ${questions.length} correct. Review the lesson and try again.`;
    el.querySelectorAll(".feedback").forEach((n) => n.remove());
    el.appendChild(msg);
    if (allRight) markDone(state.track, lesson);
  };
  el.appendChild(btn);
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
