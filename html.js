window.LESSON_TRACKS = window.LESSON_TRACKS || {};
window.LESSON_TRACKS.html = {
  name: "HTML",
  runner: "html",
  lessons: [
    {
      id: "html-1-structure",
      title: "1. Page structure",
      summary: "Every web page is built from tags.",
      explain: `
        <p><strong>HTML</strong> describes the content of a web page. It uses <strong>tags</strong> in angle brackets. Most tags come in pairs: an opening <code>&lt;p&gt;</code> and a closing <code>&lt;/p&gt;</code>.</p>
        <p><code>&lt;h1&gt;</code> is the biggest heading. <code>&lt;p&gt;</code> is a paragraph. <code>&lt;a href="..."&gt;</code> makes a link.</p>`,
      example: `<!DOCTYPE html>
<html>
  <body>
    <h1>My First Page</h1>
    <p>This is a paragraph.</p>
    <a href="https://www.example.com">Visit a website</a>
  </body>
</html>`,
      exampleResult: "A page with a large heading, a paragraph, and a clickable link.",
      exercise: {
        prompt: "Create a page with an <code>h1</code> heading that says <em>About Me</em>, a paragraph about yourself, and an unordered list (<code>ul</code> with <code>li</code> items) of 3 hobbies.",
        starter: `<!DOCTYPE html>\n<html>\n  <body>\n    \n  </body>\n</html>`,
        hint: "Put the heading and paragraph inside body. A list needs <ul> around the <li> items.",
        solution: `<!DOCTYPE html>\n<html>\n  <body>\n    <h1>About Me</h1>\n    <p>I am a student learning to code.</p>\n    <ul>\n      <li>Reading</li>\n      <li>Music</li>\n      <li>Football</li>\n    </ul>\n  </body>\n</html>`,
        check: (code) => {
          const hasH1 = /<h1>\s*About Me\s*<\/h1>/i.test(code);
          const hasP = /<p>[\s\S]*?<\/p>/i.test(code);
          const hasList = /<ul>[\s\S]*<li>[\s\S]*<li>[\s\S]*<li>[\s\S]*<\/ul>/i.test(code);
          if (hasH1 && hasP && hasList) return { ok: true, message: "Correct! Lesson complete." };
          return { ok: false, message: "Check for an h1 saying About Me, a p paragraph, and a ul with three li items." };
        },
      },
      quiz: [
        { q: "Which tag makes the largest heading?", options: ["<h6>", "<head>", "<h1>", "<title>"], answer: 2 },
        { q: "What does a closing tag look like?", options: ["<p>", "</p>", "<p/>", "[p]"], answer: 1 },
      ],
    },
    {
      id: "html-2-images-links",
      title: "2. Images and links",
      summary: "Add pictures and connect pages together.",
      explain: `
        <p>The <code>&lt;img&gt;</code> tag shows an image. It needs a <code>src</code> (where the file is) and an <code>alt</code> (a description for screen readers and when the image fails to load).</p>
        <p>The <code>&lt;a&gt;</code> tag links to another page. Its <code>href</code> is the destination.</p>`,
      example: `<h2>My Favorite Links</h2>
<img src="https://placehold.co/200x120" alt="A grey placeholder box">
<p><a href="https://developer.mozilla.org">Learn more on MDN</a></p>`,
      exampleResult: "A heading, a placeholder image with alternative text, and a link to MDN.",
      exercise: {
        prompt: "Add a link to <code>https://www.wikipedia.org</code> with the text <em>Wikipedia</em>, and an image from <code>https://placehold.co/150x100</code> with a meaningful alt text.",
        starter: `<h2>Resources</h2>\n`,
        hint: "Use <a href=\"...\">text</a> for links and <img src=\"...\" alt=\"...\"> for images.",
        solution: `<h2>Resources</h2>\n<a href="https://www.wikipedia.org">Wikipedia</a>\n<img src="https://placehold.co/150x100" alt="Placeholder image">`,
        check: (code) => {
          const link = /<a\s+href="https:\/\/www\.wikipedia\.org"[^>]*>\s*Wikipedia\s*<\/a>/i.test(code);
          const img = /<img\s+[^>]*src="https:\/\/placehold\.co\/150x100"[^>]*alt="[^"]+"/i.test(code);
          if (link && img) return { ok: true, message: "Correct! Lesson complete." };
          return { ok: false, message: "Check your link's href and text, and make sure the img has src and a non-empty alt." };
        },
      },
      quiz: [
        { q: "Which attribute holds the image file location?", options: ["href", "alt", "src", "link"], answer: 2 },
        { q: "Which attribute holds the link destination?", options: ["src", "href", "url", "target"], answer: 1 },
      ],
    },
    {
      id: "html-3-forms",
      title: "3. Forms and user input",
      level: "Intermediate",
      summary: "Collect useful input with labels, controls, and validation attributes.",
      explain: `
        <p>A <code>&lt;form&gt;</code> groups controls for submitting information. Each input should have a visible <code>&lt;label&gt;</code> connected by matching <code>for</code> and <code>id</code> values.</p>
        <p>Choose an input type that matches the data, such as <code>email</code>. The <code>required</code> attribute asks the browser to check that a value was supplied.</p>`,
      example: `<form>
  <label for="email">Email address</label>
  <input id="email" name="email" type="email" required>
  <button type="submit">Join the club</button>
</form>`,
      exampleResult: "A labeled email field and submit button. The browser asks for a valid email before submitting.",
      exercise: {
        prompt: "Build a form with a label connected to a required email input and a submit button.",
        starter: `<form>\n  <!-- Add a labeled email input and submit button -->\n</form>`,
        hint: "Match label for=\"email\" with input id=\"email\"; set type=\"email\" and required.",
        solution: `<form>\n  <label for="email">Email</label>\n  <input id="email" name="email" type="email" required>\n  <button type="submit">Send</button>\n</form>`,
        check: (code) => {
          const label = /<label[^>]*for="email"/i.test(code);
          const input = /<input[^>]*id="email"[^>]*type="email"[^>]*required/i.test(code);
          const button = /<button[^>]*type="submit"/i.test(code);
          return label && input && button
            ? { ok: true, message: "Correct! Lesson complete." }
            : { ok: false, message: "Connect a label to a required email input and include a submit button." };
        },
      },
      quiz: [],
    },
    {
      id: "html-4-semantic-accessibility",
      title: "4. Semantic HTML and accessibility",
      level: "Advanced",
      summary: "Give page content meaning and make it work for more people.",
      explain: `
        <p>Semantic elements describe purpose: <code>&lt;nav&gt;</code> for navigation, <code>&lt;main&gt;</code> for the primary content, and <code>&lt;article&gt;</code> for a self-contained piece.</p>
        <p>Use a logical heading order, descriptive link text, and useful <code>alt</code> text for informative images. Good HTML gives assistive technology a structure to navigate.</p>`,
      example: `<header><h1>Garden Journal</h1></header>
<nav aria-label="Main navigation"><a href="#tips">Growing tips</a></nav>
<main>
  <article>
    <h2 id="tips">Start with sunlight</h2>
    <img src="sunflower.jpg" alt="A sunflower growing in a pot">
  </article>
</main>`,
      exampleResult: "A page with a named navigation region and a self-contained article under the main heading.",
      exercise: {
        prompt: "Create a main region containing an article with a heading and an informative image with meaningful alt text.",
        starter: `<main>\n  <!-- Add an article, heading, and image -->\n</main>`,
        hint: "Use main > article > h2 and an img whose alt describes what the image shows.",
        solution: `<main>\n  <article>\n    <h2>My garden</h2>\n    <img src="garden.jpg" alt="Tomatoes growing on a sunny balcony">\n  </article>\n</main>`,
        check: (code) => {
          const structure = /<main>[\s\S]*<article>[\s\S]*<h[1-6][^>]*>[\s\S]*<\/article>[\s\S]*<\/main>/i.test(code);
          const image = /<img[^>]*alt="[^"]{8,}"/i.test(code);
          return structure && image
            ? { ok: true, message: "Correct! Lesson complete." }
            : { ok: false, message: "Nest an article in main, add a heading, and describe the image in alt text." };
        },
      },
      quiz: [],
    },
  ],
};
