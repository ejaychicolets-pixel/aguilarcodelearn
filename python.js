window.LESSON_TRACKS = window.LESSON_TRACKS || {};
window.LESSON_TRACKS.python = {
  name: "Python",
  runner: "python",
  lessons: [
    {
      id: "py-1-variables",
      title: "1. Variables and print",
      summary: "Python reads almost like English, which makes it a good first language.",
      explain: `
        <p>A <strong>variable</strong> stores a value. In Python you just write the name, an equals sign, and the value. No keyword is needed.</p>
        <p><code>print()</code> shows a value on screen. Text goes in quotes; numbers do not.</p>`,
      example: `name = "Maria"
age = 17
print("Hello,", name)
print("Age next year:", age + 1)`,
      exampleResult: `Hello, Maria
Age next year: 18`,
      exercise: {
        prompt: "Create a variable called <code>city</code> with your city name, then print <code>I live in ...</code> using it.",
        starter: `# Write your code below\n`,
        hint: "Write city = \"...\" and then print with a comma between the text and the variable.",
        solution: `city = "Manila"\nprint("I live in", city)`,
        check: (code) => {
          const hasVar = /^\s*city\s*=/m.test(code);
          const hasPrint = /print\(/.test(code) && /city/.test(code.split("print")[1] || "");
          if (hasVar && hasPrint) return { ok: true, message: "Correct! Lesson complete." };
          return { ok: false, message: "Assign city = \"...\" and print it with print()." };
        },
      },
      quiz: [
        { q: "How do you create a variable in Python?", options: ["let x = 5", "var x = 5", "x = 5", "int x = 5"], answer: 2 },
        { q: "What does print(\"5\" + \"2\") show?", options: ["7", "52", "Error", "5 + 2"], answer: 1 },
      ],
    },
    {
      id: "py-2-loops-conditions",
      title: "2. Conditions and loops",
      summary: "Indentation matters in Python: it marks which code belongs to which block.",
      explain: `
        <p>Python uses <strong>indentation</strong> (spaces at the start of a line) instead of braces. Keep blocks lined up.</p>
        <p><code>if</code> checks a condition. <code>for</code> loops over a sequence like a list or <code>range()</code>.</p>`,
      example: `for i in range(1, 6):
    if i % 2 == 0:
        print(i, "is even")
    else:
        print(i, "is odd")`,
      exampleResult: `1 is odd
2 is even
3 is odd
4 is even
5 is odd`,
      exercise: {
        prompt: "Use a loop to print the numbers 1 to 10. Print <code>FizzBuzz</code> instead of any number divisible by 3.",
        starter: `# Write your loop below\n`,
        hint: "Use for i in range(1, 11): and check i % 3 == 0 first.",
        solution: `for i in range(1, 11):\n    if i % 3 == 0:\n        print("FizzBuzz")\n    else:\n        print(i)`,
        check: (code) => {
          const hasLoop = /for\s+\w+\s+in\s+range\(/.test(code);
          const hasMod = /%\s*3/.test(code);
          const hasFizz = /FizzBuzz/.test(code);
          if (hasLoop && hasMod && hasFizz) return { ok: true, message: "Correct! Lesson complete." };
          return { ok: false, message: "Use a for loop with range, check % 3, and print FizzBuzz." };
        },
      },
      quiz: [
        { q: "What does range(3) produce?", options: ["1, 2, 3", "0, 1, 2", "0, 1, 2, 3", "3, 3, 3"], answer: 1 },
        { q: "How does Python mark a block of code?", options: ["Curly braces", "Semicolons", "Indentation", "BEGIN and END"], answer: 2 },
      ],
    },
    {
      id: "py-3-lists-functions",
      title: "3. Lists and functions",
      summary: "Store many values and reuse code with functions.",
      explain: `
        <p>A <strong>list</strong> holds several values in order, written with square brackets. Use <code>len()</code> for its length and <code>.append()</code> to add an item.</p>
        <p>Define a function with <code>def</code> and send a result back with <code>return</code>.</p>`,
      example: `scores = [88, 92, 75]
scores.append(95)
print("Count:", len(scores))

def average(values):
    return sum(values) / len(values)

print("Average:", average(scores))`,
      exampleResult: `Count: 4
Average: 87.5`,
      exercise: {
        prompt: "Write a function <code>largest(numbers)</code> that returns the biggest number in a list. Test it with <code>[3, 9, 2]</code>.",
        starter: `# Write your function below\n`,
        hint: "Python has a built-in max() function. You can return max(numbers).",
        solution: `def largest(numbers):\n    return max(numbers)\n\nprint(largest([3, 9, 2]))`,
        check: (code) => {
          const hasDef = /def\s+largest\s*\(/.test(code);
          const hasReturn = /return/.test(code);
          const testsIt = /largest\(\s*\[3,\s*9,\s*2\]\s*\)/.test(code);
          if (hasDef && hasReturn && testsIt) return { ok: true, message: "Correct! Lesson complete." };
          return { ok: false, message: "Define largest with def, return the result, and test it with [3, 9, 2]." };
        },
      },
      quiz: [
        { q: "Which brackets make a list?", options: ["( )", "{ }", "[ ]", "< >"], answer: 2 },
        { q: "Which keyword defines a function in Python?", options: ["function", "def", "func", "fn"], answer: 1 },
      ],
    },
    {
      id: "py-4-dictionaries",
      title: "4. Dictionaries and data",
      level: "Intermediate",
      summary: "Store related information under meaningful keys and process it safely.",
      explain: `
        <p>A dictionary maps unique keys to values. Use <code>record["name"]</code> to read a value and <code>get()</code> when a key may be missing.</p>
        <p>Loop through <code>.items()</code> to get keys and values together. Choose a clear structure before writing the processing logic.</p>`,
      example: `scores = {"Mia": 92, "Leo": 85}
for name, score in scores.items():
    print(f"{name}: {score}")

print("Unknown:", scores.get("Sam", 0))`,
      exampleResult: `Mia: 92
Leo: 85
Unknown: 0`,
      exercise: {
        prompt: "Create a dictionary with an \"apples\" key set to 3, then safely print the value for \"oranges\" using a default of 0.",
        starter: `# Create your dictionary and read its values\n`,
        hint: "Use inventory = {\"apples\": 3}, then inventory.get(\"oranges\", 0).",
        solution: `inventory = {"apples": 3}\nprint(inventory.get("oranges", 0))`,
        check: (code) => {
          const entry = /["']apples["']\s*:\s*3/.test(code);
          const safeRead = /\.get\(["']oranges["']\s*,\s*0\)/.test(code);
          return entry && safeRead
            ? { ok: true, message: "Correct! Lesson complete." }
            : { ok: false, message: "Add apples: 3 to a dictionary and use get(\"oranges\", 0)." };
        },
      },
      quiz: [],
    },
    {
      id: "py-5-classes-errors",
      title: "5. Classes and error handling",
      level: "Advanced",
      summary: "Model related data and behavior, and handle expected failures.",
      explain: `
        <p>A class describes objects with shared data and behavior. <code>__init__</code> initializes an object, and <code>self</code> refers to that instance.</p>
        <p>Use <code>try/except</code> around operations that can fail. Catch the specific error you expect instead of hiding every possible problem.</p>`,
      example: `class Temperature:
    def __init__(self, celsius):
        self.celsius = celsius

    def fahrenheit(self):
        return self.celsius * 9 / 5 + 32

try:
    print(Temperature(20).fahrenheit())
except TypeError:
    print("Use a number")`,
      exampleResult: `68.0`,
      exercise: {
        prompt: "Define a class Counter initialized with a value, then add a method increment that increases its value by one.",
        starter: `class Counter:\n    # Add initialization and increment\n    pass\n`,
        hint: "Set self.value in __init__(self, value); increment should assign self.value += 1.",
        solution: `class Counter:\n    def __init__(self, value):\n        self.value = value\n\n    def increment(self):\n        self.value += 1`,
        check: (code) => {
          const cls = /class\s+Counter\s*:/i.test(code);
          const init = /def\s+__init__\s*\(\s*self\s*,\s*value\s*\)/.test(code);
          const method = /def\s+increment\s*\(\s*self\s*\)/.test(code);
          const update = /self\.value\s*\+=\s*1/.test(code);
          return cls && init && method && update
            ? { ok: true, message: "Correct! Lesson complete." }
            : { ok: false, message: "Define Counter, initialize self.value, and increment it in a method." };
        },
      },
      quiz: [],
    },
  ],
};
