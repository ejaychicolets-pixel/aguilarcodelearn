window.LESSON_TRACKS = window.LESSON_TRACKS || {};
window.LESSON_TRACKS.javascript = {
  name: "JavaScript",
  runner: "js",
  lessons: [
    {
      id: "js-1-variables",
      title: "1. Variables and printing",
      summary: "Store values and show them on screen.",
      explain: `
        <p>A <strong>variable</strong> is a named box that holds a value. Use <code>let</code> for values that can change and <code>const</code> for values that stay the same.</p>
        <p><code>console.log()</code> prints a value so you can see what your code is doing.</p>
        <p>Text is written in quotes and called a <strong>string</strong>. Numbers need no quotes.</p>`,
      example: `let name = "Maria";
const age = 17;
console.log("Hello,", name);
console.log("Age next year:", age + 1);`,
      exampleResult: `Hello, Maria
Age next year: 18`,
      exercise: {
        prompt: "Create a variable called <code>city</code> holding your city name, then print: <code>I live in ...</code> using that variable.",
        starter: `// Write your code below\n`,
        hint: "Create the variable with let or const, then call console.log with the text and the variable separated by a comma.",
        solution: `const city = "Manila";\nconsole.log("I live in", city);`,
        check: (code) => {
          const hasVar = /(let|const|var)\s+city\s*=/.test(code);
          const hasLog = /console\.log\(/.test(code) && /city/.test(code.split("console.log")[1] || "");
          if (hasVar && hasLog) return { ok: true, message: "Correct! Lesson complete." };
          return { ok: false, message: "Make sure you declare city with let or const and print it with console.log." };
        },
      },
      quiz: [
        { q: "Which keyword creates a value that should never change?", options: ["var", "let", "const", "print"], answer: 2 },
        { q: "What does console.log(5 + 2) print?", options: ["52", "7", "5 + 2", "Error"], answer: 1 },
      ],
    },
    {
      id: "js-2-conditions-loops",
      title: "2. Conditions and loops",
      summary: "Make decisions and repeat actions.",
      explain: `
        <p><code>if</code> runs code only when a condition is true. <code>else</code> runs when it is false.</p>
        <p>A <strong>for loop</strong> repeats code a set number of times. Each pass is called an iteration.</p>`,
      example: `for (let i = 1; i <= 5; i++) {
  if (i % 2 === 0) {
    console.log(i, "is even");
  } else {
    console.log(i, "is odd");
  }
}`,
      exampleResult: `1 is odd
2 is even
3 is odd
4 is even
5 is odd`,
      exercise: {
        prompt: "Use a loop to print the numbers 1 to 10, and print <code>FizzBuzz</code> instead of any number divisible by 3.",
        starter: `// Write your loop below\n`,
        hint: "Use a for loop from 1 to 10. Inside, check i % 3 === 0 first, then print the number otherwise.",
        solution: `for (let i = 1; i <= 10; i++) {\n  if (i % 3 === 0) {\n    console.log("FizzBuzz");\n  } else {\n    console.log(i);\n  }\n}`,
        check: (code) => {
          const hasLoop = /for\s*\(/.test(code);
          const hasModulo = /%\s*3/.test(code);
          const hasFizz = /FizzBuzz/.test(code);
          if (hasLoop && hasModulo && hasFizz) return { ok: true, message: "Correct! Lesson complete." };
          return { ok: false, message: "Use a for loop, check % 3, and print FizzBuzz for those numbers." };
        },
      },
      quiz: [
        { q: "What does the % operator give you?", options: ["The quotient", "The remainder", "A percentage", "The square root"], answer: 1 },
        { q: "How many times does for (let i = 0; i < 3; i++) run?", options: ["2", "3", "4", "Forever"], answer: 1 },
      ],
    },
    {
      id: "js-3-functions",
      title: "3. Functions",
      summary: "Package code into reusable blocks.",
      explain: `
        <p>A <strong>function</strong> is a named set of steps. You define it once and call it as many times as you like.</p>
        <p>Functions can take <strong>parameters</strong> (inputs) and send back a result with <code>return</code>.</p>`,
      example: `function add(a, b) {
  return a + b;
}

console.log(add(2, 3));
console.log(add(10, 20));`,
      exampleResult: `5
30`,
      exercise: {
        prompt: "Write a function called <code>square</code> that takes a number and returns that number multiplied by itself. Then print <code>square(7)</code>.",
        starter: `// Write your function below\n`,
        hint: "Use the function keyword, a parameter, and return n * n.",
        solution: `function square(n) {\n  return n * n;\n}\nconsole.log(square(7));`,
        check: (code) => {
          const hasFn = /function\s+square\s*\(/.test(code) || /square\s*=\s*\(/.test(code);
          const hasReturn = /return/.test(code);
          const callsIt = /square\(7\)/.test(code);
          if (hasFn && hasReturn && callsIt) return { ok: true, message: "Correct! Lesson complete." };
          return { ok: false, message: "Define square, use return, and call square(7) with console.log." };
        },
      },
      quiz: [
        { q: "What does return do?", options: ["Prints a value", "Sends a value back from the function", "Restarts the program", "Deletes a variable"], answer: 1 },
        { q: "In function add(a, b), what are a and b?", options: ["Results", "Parameters", "Loops", "Strings"], answer: 1 },
      ],
    },
    {
      id: "js-4-dom-events",
      title: "4. DOM events and state",
      level: "Intermediate",
      summary: "Select page elements, respond to clicks, and update the interface.",
      explain: `
        <p>The DOM is the browser's object model for HTML. Use <code>querySelector()</code> to find an element and <code>addEventListener()</code> to respond to events.</p>
        <p>Update visible text with <code>textContent</code>. Keeping state in a variable and rendering it after an event makes small interfaces predictable.</p>`,
      example: `const button = document.querySelector("#count-button");
const output = document.querySelector("#count");
let count = 0;

button.addEventListener("click", () => {
  count++;
  output.textContent = count;
});`,
      exampleResult: "Clicking the button increases the number shown in #count by one.",
      exercise: {
        prompt: "Select #message and make a button change its text to \"Hello!\" when clicked.",
        starter: `const button = document.querySelector("#greet");\n// Add a click listener\n`,
        hint: "Select #message, then add a click listener to button that assigns message.textContent.",
        solution: `const button = document.querySelector("#greet");\nconst message = document.querySelector("#message");\nbutton.addEventListener("click", () => {\n  message.textContent = "Hello!";\n});`,
        check: (code) => {
          const selects = /querySelector\(["']#message["']\)/.test(code);
          const listener = /addEventListener\(["']click["']/.test(code);
          const updates = /textContent\s*=\s*["']Hello!["']/.test(code);
          return selects && listener && updates
            ? { ok: true, message: "Correct! Lesson complete." }
            : { ok: false, message: "Select #message, listen for a click, and update its textContent." };
        },
      },
      quiz: [],
    },
    {
      id: "js-5-async",
      title: "5. Promises and async/await",
      level: "Advanced",
      summary: "Work with results that arrive later without blocking the page.",
      explain: `
        <p>A <strong>Promise</strong> represents a value that may be available later. An <code>async</code> function always returns a Promise.</p>
        <p>Use <code>await</code> inside an async function to wait for a Promise. Handle failures with <code>try/catch</code> and check HTTP responses before parsing them. This example uses a mock response so it works without a server.</p>`,
      example: `async function loadUser() {
  try {
    const response = await Promise.resolve({
      ok: true,
      json: async () => ({ name: "Ada" })
    });
    if (!response.ok) throw new Error("Request failed");
    const user = await response.json();
    console.log(user.name);
  } catch (error) {
    console.log("Could not load user");
  }
}
await loadUser();`,
      exampleResult: "Ada",
      exercise: {
        prompt: "Write an async function that awaits Promise.resolve(7) and prints the resolved value.",
        starter: `// Write your async function\n`,
        hint: "Declare async function showValue(), await the promise inside it, then call console.log.",
        solution: `async function showValue() {\n  const value = await Promise.resolve(7);\n  console.log(value);\n}\nshowValue();`,
        check: (code) => {
          const asyncFn = /async\s+function\s+showValue/.test(code);
          const awaited = /await\s+Promise\.resolve\(7\)/.test(code);
          const called = /showValue\(\)/.test(code) && /console\.log\(value\)/.test(code);
          return asyncFn && awaited && called
            ? { ok: true, message: "Correct! Lesson complete." }
            : { ok: false, message: "Use an async function, await the Promise, print its value, and call the function." };
        },
      },
      quiz: [],
    },
  ],
};
