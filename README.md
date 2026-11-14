# CodeLearn

A static, browser-based coding course. Open `index.html` in any browser, no server needed.

## Structure
- `index.html`: page shell
- `styles.css`: styling
- `app.js`: lesson engine (rendering, running code, quizzes, progress)
- `lessons/*.js`: one file per language. Add lessons by copying an existing lesson object.

## Adding a lesson
Each lesson has: `id`, `title`, `summary`, `explain` (HTML), `example` (code), `exercise` (`prompt`, `starter`, `hint`, `solution`, `check(code)` returning `{ok, message}`), and `quiz` (`q`, `options`, `answer` as an index).

## Runners
- JavaScript: runs in the page, output shown below the code.
- HTML and CSS: rendered live in a preview box.
- Python: runs in the browser through Pyodide (loads on first use, needs internet).
- C++: needs a compiler, so students compile on their own computer. Exercises are checked by pattern matching.

## Before public launch
- Code checks use simple pattern matching, not a real test run. Good enough for beginners; replace with a sandboxed test runner later.
- Progress is saved in the student's browser only. Accounts would need a backend.
