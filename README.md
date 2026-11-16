# CodeLearn

A static, browser-based coding course that can be installed on supported devices as a Progressive Web App (PWA).

## Install on a device
- On GitHub, open the repository's **Settings → Pages**, choose **Deploy from a branch**, select the branch containing the site and the `/(root)` folder, then save. Use the HTTPS URL GitHub provides.
- Browser installation and offline caching do not work when opening the page directly as a `file://` URL.
- Visit the hosted site once while online. The service worker saves the course shell and lessons for offline use.
- Use **Install app** in the site or browser menu. On iPhone and iPad, open the site in Safari, tap **Share**, then **Add to Home Screen**.
- JavaScript, HTML, CSS, C++, and lesson content work offline after caching. Python execution loads Pyodide from the internet on first use and therefore needs a connection.

## Structure
- `index.html`: page shell
- `styles.css`: styling
- `app.js`: lesson and project workspace engine (rendering, running code, quizzes, progress, and local projects)
- `javascript.js`, `python.js`, `html.js`, `css.js`, `cpp.js`: lesson content, one file per language
- `quizzes.js`: the topic facts used to generate each lesson's 20-question review
- `manifest.webmanifest`, `service-worker.js`, `pwa.js`, and the app icons: installation and offline support

## Curriculum
- The five tracks progress from beginner concepts to intermediate and advanced topics.
- Each lesson includes a worked example with its expected result and a 20-question quiz on a separate in-app screen. Quiz answers remain selected when returning to the lesson.
- HTML and CSS examples include a rendered preview; CSS lessons keep their rules and sample HTML together so the styling is visible.

## Adding a lesson
Each lesson has: `id`, `title`, `summary`, `explain` (HTML), `example` (code), `exampleResult`, `exercise` (`prompt`, `starter`, `hint`, `solution`, `check(code)` returning `{ok, message}`), and 5 quiz facts in `quizzes.js`. The app uses those facts to build 20 distinct review questions per lesson.

## Runners
- JavaScript: runs in the page, output shown below the code.
- HTML and CSS: rendered live in a preview box.
- Python: runs in the browser through Pyodide (loads on first use, needs internet).
- C++: needs a compiler, so students compile on their own computer. Exercises are checked by pattern matching.

## Project workspace
- Open **Projects** to create a starter website, import a folder, edit text files, and add files or folders. Changes are saved automatically in IndexedDB in the current browser.
- Imported folders and projects are limited to 1,000 files and 25 MB. Binary assets are kept for ZIP export but are not editable in the text editor.
- Use **Download ZIP** to export a project, then upload it manually through your hosting provider’s supported workflow. Projects are not synced across browsers or devices, and the app does not deploy directly to Netlify or Vercel.

## Before public launch
- Code checks use simple pattern matching, not a real test run. Good enough for beginners; replace with a sandboxed test runner later.
- Lesson completion, exercise drafts, and projects are saved in the student's browser only. Drafts are kept per lesson and restored when the student returns on the same device and browser. Accounts or cross-device syncing would need a backend.
