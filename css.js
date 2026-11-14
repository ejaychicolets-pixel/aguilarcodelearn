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
        <p>Selectors: <code>h1</code> picks every h1. <code>.box</code> picks elements with <code>class="box"</code>. <code>#main</code> picks the one element with <code>id="main"</code>.</p>
        <p>The <code>&lt;style&gt;</code> element contains the CSS rules, and the HTML below it supplies the elements those rules select.</p>`,
      example: `<style>
  h1 { color: #4f46e5; }
  .note { background: #fef9c3; padding: 10px; border-radius: 8px; }
</style>
<h1>Styled Heading</h1>
<p class="note">This paragraph has a yellow box.</p>`,
      exampleResult: "A purple heading and a rounded pale-yellow note with 10px of inner spacing.",
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
      exampleResult: "Three equal-width pastel cards arranged in a row with even gaps.",
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
    {
      id: "css-3-responsive-design",
      title: "3. Responsive layouts",
      level: "Intermediate",
      summary: "Make the same HTML comfortable to read on phones and larger screens.",
      explain: `
        <p>Responsive CSS adapts layout to available space. Use flexible widths such as <code>width: min(100%, 42rem)</code> rather than a fixed page width.</p>
        <p>A <code>@media</code> query applies rules only when its condition matches. Here a two-column grid becomes one column on narrow screens.</p>
        <p>The <code>&lt;style&gt;</code> rules still select the HTML by class; only the layout changes at the breakpoint.</p>`,
      example: `<style>
.cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
.card { padding: 1rem; border-radius: 12px; background: #e9e7ff; }
@media (max-width: 600px) {
  .cards { grid-template-columns: 1fr; }
}
</style>
<div class="cards">
  <article class="card">Learn</article>
  <article class="card">Practice</article>
</div>`,
      exampleResult: "Two cards side by side on wide screens; stacked cards on screens 600px wide or narrower.",
      exercise: {
        prompt: "Style the .cards container as a two-column grid, then switch to one column below 600px.",
        starter: `<style>\n/* Add the grid and media query */\n</style>\n<div class="cards"><article>One</article><article>Two</article></div>`,
        hint: "Use display: grid, grid-template-columns: repeat(2, 1fr), and a max-width: 600px media query.",
        solution: `<style>\n.cards { display: grid; grid-template-columns: repeat(2, 1fr); }\n@media (max-width: 600px) { .cards { grid-template-columns: 1fr; } }\n</style>\n<div class="cards"><article>One</article><article>Two</article></div>`,
        check: (code) => {
          const grid = /\.cards\s*\{[^}]*display:\s*grid/i.test(code);
          const columns = /grid-template-columns:\s*repeat\(2,\s*1fr\)/i.test(code);
          const query = /@media\s*\(max-width:\s*600px\)/i.test(code);
          const mobile = /grid-template-columns:\s*1fr/i.test(code);
          return grid && columns && query && mobile
            ? { ok: true, message: "Correct! Lesson complete." }
            : { ok: false, message: "Add the two-column grid and a 600px media query that stacks it." };
        },
      },
      quiz: [],
    },
    {
      id: "css-4-grid-tokens",
      title: "4. CSS Grid and design tokens",
      level: "Advanced",
      summary: "Build precise page layouts and keep shared styles easy to update.",
      explain: `
        <p>CSS Grid is useful for two-dimensional layouts. Define named columns with <code>grid-template-columns</code> and spacing with <code>gap</code>.</p>
        <p>Custom properties (design tokens) are declared with <code>--name</code> and read with <code>var(--name)</code>. Put shared values on <code>:root</code> so many rules can reuse them.</p>
        <p>In this example, semantic HTML provides the page regions while CSS Grid controls where they appear.</p>`,
      example: `<style>
:root { --ink: #29264b; --accent: #6b5ce7; }
.page { display: grid; grid-template-columns: 12rem 1fr; gap: 1rem; color: var(--ink); }
nav { background: var(--accent); color: white; padding: 1rem; }
main { padding: 1rem; }
</style>
<div class="page"><nav>Topics</nav><main><h1>CSS Grid</h1><p>Reusable layout.</p></main></div>`,
      exampleResult: "A purple navigation column beside a wider article, using reusable color tokens.",
      exercise: {
        prompt: "Create a --space token on :root and use it for the gap in a .layout grid with a sidebar and content column.",
        starter: `<style>\n/* Define the token and grid */\n</style>\n<div class="layout"><aside>Menu</aside><main>Content</main></div>`,
        hint: "Set --space: 1rem on :root; use grid-template-columns: 12rem 1fr and gap: var(--space).",
        solution: `<style>\n:root { --space: 1rem; }\n.layout { display: grid; grid-template-columns: 12rem 1fr; gap: var(--space); }\n</style>\n<div class="layout"><aside>Menu</aside><main>Content</main></div>`,
        check: (code) => {
          const token = /--space\s*:\s*1rem/i.test(code);
          const grid = /\.layout\s*\{[^}]*display:\s*grid/i.test(code);
          const gap = /gap:\s*var\(--space\)/i.test(code);
          return token && grid && gap
            ? { ok: true, message: "Correct! Lesson complete." }
            : { ok: false, message: "Define --space on :root and use it as the gap in a .layout grid." };
        },
      },
      quiz: [],
    },
  ],
};
