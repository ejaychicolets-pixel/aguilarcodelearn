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
      example: `      #include <iostream>
      #include <string>
      using namespace std;

int main() {
    string name = "Maria";
    int age = 17;
    cout << "Hello, " << name << endl;
    cout << "Age next year: " << age + 1 << endl;
    return 0;
}`,
      exampleResult: `Hello, Maria
Age next year: 18`,
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
      exampleResult: `1 squared is 1
2 squared is 4
3 squared is 9`,
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
    {
      id: "cpp-3-vectors",
      title: "3. Vectors and algorithms",
      level: "Intermediate",
      summary: "Store a changing number of values and process them with standard algorithms.",
      explain: `
        <p><code>std::vector</code> is a resizable sequence. Use <code>push_back()</code> to add items and range-based <code>for</code> loops to visit each one.</p>
        <p>Include the standard headers you use. <code>std::accumulate</code> from <code>&lt;numeric&gt;</code> can combine a range into a total.</p>`,
      example: `#include <iostream>
#include <numeric>
#include <vector>

int main() {
    std::vector<int> scores{80, 90, 100};
    scores.push_back(95);
    int total = std::accumulate(scores.begin(), scores.end(), 0);
    std::cout << "Count: " << scores.size() << "\\n";
    std::cout << "Total: " << total << "\\n";
}`,
      exampleResult: `Count: 4
Total: 365`,
      exercise: {
        prompt: "Create a vector of integers, add 7 with push_back, and print the vector's size.",
        starter: `#include <iostream>\n#include <vector>\n\nint main() {\n    // Create and update a vector\n}`,
        hint: "Declare std::vector<int> values{2, 4}; then call values.push_back(7).",
        solution: `#include <iostream>\n#include <vector>\n\nint main() {\n    std::vector<int> values{2, 4};\n    values.push_back(7);\n    std::cout << values.size() << "\\n";\n}`,
        check: (code) => {
          const vector = /vector\s*<\s*int\s*>/.test(code);
          const push = /\.push_back\(\s*7\s*\)/.test(code);
          const size = /\.size\(\)/.test(code);
          return vector && push && size
            ? { ok: true, message: "Correct! Lesson complete." }
            : { ok: false, message: "Use a vector<int>, push_back(7), and print its size()." };
        },
      },
      quiz: [],
    },
    {
      id: "cpp-4-classes-raii",
      title: "4. Classes and resource safety",
      level: "Advanced",
      summary: "Encapsulate behavior and let object lifetimes manage resources.",
      explain: `
        <p>A class groups data and functions. Keep implementation details <code>private</code> and expose intentional operations with <code>public</code> methods.</p>
        <p>RAII ties resource lifetime to object lifetime: acquire a resource in a constructor and release it in a destructor. Standard library types such as <code>std::vector</code> manage their own memory.</p>`,
      example: `#include <iostream>
#include <string>
#include <utility>

class Greeter {
public:
    explicit Greeter(std::string name) : name_(std::move(name)) {}
    void greet() const { std::cout << "Hello, " << name_ << "\\n"; }
private:
    std::string name_;
};

int main() {
    Greeter person("Ada");
    person.greet();
}`,
      exampleResult: `Hello, Ada`,
      exercise: {
        prompt: "Create a class Box that stores a private integer value and exposes a public getValue() const method.",
        starter: `class Box {\n    // Add private data and a public getter\n};`,
        hint: "Put int value_ under private: and define int getValue() const under public:.",
        solution: `class Box {\nprivate:\n    int value_;\npublic:\n    explicit Box(int value) : value_(value) {}\n    int getValue() const { return value_; }\n};`,
        check: (code) => {
          const cls = /class\s+Box\s*\{/.test(code);
          const privateValue = /private\s*:[\s\S]*int\s+value_/.test(code);
          const getter = /int\s+getValue\s*\(\s*\)\s*const/.test(code);
          return cls && privateValue && getter
            ? { ok: true, message: "Correct! Lesson complete." }
            : { ok: false, message: "Add private value_ data and a public const getValue() method." };
        },
      },
      quiz: [],
    },
  ],
};
