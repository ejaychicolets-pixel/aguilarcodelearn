window.LESSON_TRACKS = window.LESSON_TRACKS || {};
window.LESSON_TRACKS.cpp = {
  name: "C++",
  runner: "cpp",
  lessons: [
    {
      id: "cpp-1-hello",
      title: "1. Hello, C++ and variables",
      summary: "C++ is compiled, so you write code, build it, then run it.",
      explain: `
        <p>Every C++ program starts in <code>main()</code>. <code>#include &lt;iostream&gt;</code> brings in tools for input and output, and <code>std::cout</code> prints text.</p>
        <p>You must declare a variable's type: <code>int</code> for whole numbers, <code>double</code> for decimals, <code>string</code> for text (with <code>#include &lt;string&gt;</code>).</p>`,
      example: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string name = "Maria";
    int age = 17;
    cout << "Hello, " << name << endl;
    cout << "Age next year: " << age + 1 << endl;
    return 0;
}`,
      exercise: {
        prompt: "Write a program that declares an <code>int</code> called <code>year</code> and prints <code>The year is 2026</code> using that variable.",
        starter: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`,
        hint: "Declare int year = 2026; then cout << \"The year is \" << year << endl;",
        solution: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int year = 2026;\n    cout << "The year is " << year << endl;\n    return 0;\n}`,
        check: (code) => {
          const hasVar = /int\s+year\s*=\s*2026\s*;/.test(code);
          const hasCout = /cout\s*<</.test(code) && /year/.test(code.split("cout")[1] || "");
          if (hasVar && hasCout) return { ok: true, message: "Correct! Lesson complete. Remember to compile it on your computer to see the output." };
          return { ok: false, message: "Declare int year = 2026; and print it with cout." };
        },
      },
      quiz: [
        { q: "Which function is the program's starting point?", options: ["start()", "main()", "begin()", "run()"], answer: 1 },
        { q: "Which type holds a whole number?", options: ["string", "double", "int", "text"], answer: 2 },
      ],
    },
    {
      id: "cpp-2-loops-functions",
      title: "2. Loops and functions",
      summary: "Repeat code and organize it into functions.",
      explain: `
        <p>C++ loops look like JavaScript loops. A <code>for</code> loop has three parts: start, condition, and step.</p>
        <p>A function declares its return type first, such as <code>int</code>. It must be declared before <code>main()</code> uses it.</p>`,
      example: `#include <iostream>
using namespace std;

int square(int n) {
    return n * n;
}

int main() {
    for (int i = 1; i <= 3; i++) {
        cout << i << " squared is " << square(i) << endl;
    }
    return 0;
}`,
      exercise: {
        prompt: "Write a function <code>int add(int a, int b)</code> that returns the sum. Print <code>add(4, 5)</code> from main.",
        starter: `#include <iostream>\nusing namespace std;\n\n// Write your function here\n\nint main() {\n    // Call it here\n    return 0;\n}`,
        hint: "Return a + b from add, then call cout << add(4, 5) << endl; inside main.",
        solution: `#include <iostream>\nusing namespace std;\n\nint add(int a, int b) {\n    return a + b;\n}\n\nint main() {\n    cout << add(4, 5) << endl;\n    return 0;\n}`,
        check: (code) => {
          const fn = /int\s+add\s*\(\s*int\s+\w+\s*,\s*int\s+\w+\s*\)/.test(code);
          const ret = /return\s+\w+\s*\+\s*\w+\s*;/.test(code);
          const calls = /add\(\s*4\s*,\s*5\s*\)/.test(code);
          if (fn && ret && calls) return { ok: true, message: "Correct! Lesson complete." };
          return { ok: false, message: "Define int add(int a, int b), return the sum, and call add(4, 5) in main." };
        },
      },
      quiz: [
        { q: "What does the middle part of a for loop check?", options: ["The start value", "The step", "The condition", "The return value"], answer: 2 },
        { q: "What does a function declared as int square(int n) give back?", options: ["Nothing", "A string", "An integer", "A double"], answer: 2 },
      ],
    },
  ],
};
