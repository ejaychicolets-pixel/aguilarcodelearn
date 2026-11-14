window.LESSON_TRACKS = window.LESSON_TRACKS || {};
window.LESSON_TRACKS.css = {
  name: "CSS",
  runner: "html",
  lessons: [
    {
      id: "css-1-selectors",
      title: "1. Selectors and colors",
      summary: "CSS styles HTML. A selector chooses what to style.",
      explain: `
        <p><strong>CSS</strong> controls how HTML looks. A rule has a <strong>selector</strong> (what to style) and <strong>declarations</strong> inside braces, like <code>color: red;</code>.</p>
        <p>Selectors: <code>h1</code> picks every h1. <code>.box</code> picks elements with <code>class="box"</code>. <code>#main</code> picks the one element with <code>id="main"</code>.</p>`,
      example: `<style>
  h1 { color: #4f46e5; }
  .note { background: #fef9c3; padding: 10px; border-radius: 8px; }
</style>
<h1>Styled Heading</h1>
<p class="note">This paragraph has a yellow box.</p>`,
      exercise: {
        prompt: "Style a paragraph with the class <code>highlight</code> so its text is white, its background is dark blue (<code>#1e3a8a</code>), and it has 12px of padding.",
        starter: `<style>\n  /* Write your CSS here */\n</style>\n<p class="highlight">Look at me!</p>`,
        hint: "Use .highlight { ... } with color, background, and padding properties.",
        solution: `<style>\n  .highlight {\n    color: white;\n    background: #1e3a8a;\n    padding: 12px;\n  }\n</style>\n<p class="highlight">Look at me!</p>`,
        check: (code) => {
          const sel = /\.highlight\s*\{[^}]*\}/.test(code);
          const color = /color:\s*white/i.test(code);
          const bg = /background(-color)?:\s*#1e3a8a/i.test(code);
          const pad = /padding:\s*12px/i.test(code);
          if (sel && color && bg && pad) return { ok: true, message: "Correct! Lesson complete." };
          return { ok: false, message: "Your .highlight rule needs color: white, background: #1e3a8a, and padding: 12px." };
        },
      },
      quiz: [
        { q: "Which selector picks an element with class=\"card\"?", options: ["#card", ".card", "card", "*card"], answer: 1 },
        { q: "Which selector picks the single element with id=\"header\"?", options: [".header", "header", "#header", "@header"], answer: 2 },
      ],
    },
    {
      id: "css-2-box-model-flex",
      title: "2. Spacing and flexbox layout",
      summary: "Control spacing and place items side by side.",
      explain: `
        <p><code>margin</code> is space outside an element. <code>padding</code> is space inside it, between the content and the border.</p>
        <p>Flexbox lines up items in a row or column. Set <code>display: flex</code> on the parent, then use <code>gap</code> to space the children.</p>`,
      example: `<style>
  .row { display: flex; gap: 12px; }
  .card { background: #eef0ff; padding: 16px; border-radius: 10px; flex: 1; }
</style>
<div class="row">
  <div class="card">One</div>
  <div class="card">Two</div>
  <div class="card">Three</div>
</div>`,
      exercise: {
        prompt: "Make three boxes (<code>div</code>) with the class <code>box</code> sit side by side using flexbox, with 10px of space between them.",
        starter: `<style>\n  /* Write your CSS here */\n</style>\n<div class="wrap">\n  <div class="box">A</div>\n  <div class="box">B</div>\n  <div class="box">C</div>\n</div>`,
        hint: "Set display: flex and gap: 10px on the .wrap container.",
        solution: `<style>\n  .wrap { display: flex; gap: 10px; }\n  .box { background: #fde68a; padding: 16px; }\n</style>\n<div class="wrap">\n  <div class="box">A</div>\n  <div class="box">B</div>\n  <div class="box">C</div>\n</div>`,
        check: (code) => {
          const flex = /display:\s*flex/i.test(code);
          const gap = /gap:\s*10px/i.test(code);
          if (flex && gap) return { ok: true, message: "Correct! Lesson complete." };
          return { ok: false, message: "Add display: flex and gap: 10px to the container (.wrap)." };
        },
      },
      quiz: [
        { q: "What is the space INSIDE an element's border called?", options: ["margin", "padding", "border", "gap"], answer: 1 },
        { q: "Which property turns on flexbox?", options: ["display: flex", "flex: on", "layout: flex", "position: flex"], answer: 0 },
      ],
    },
  ],
};
