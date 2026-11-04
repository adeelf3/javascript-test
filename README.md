# Bug Bounty Board: Final Boss

You have 30 minutes. Build a small React app that lists bugs, searches them, adds new ones, and opens a details page.

## Get started

1. Unzip this project and open the folder in your editor.
2. Run `npm install` and `npm run dev`.
3. Run `git init`, then create your own **private** repo and push to it.
4. Give your evaluator access to the repo.
5. Commit as you go. Your commit history is part of your submission.

`src/mockApi.js` fails about one time in four on purpose. Please don't change it.

## Missions

| Mission | Requirements | Points |
| --- | --- | --- |
| Load the bugs | Call `fetchBugs` on mount; show loading and error states | 5 |
| Show the board | Use a `BugList` and `BugCard` component with stable keys | 4 |
| Search | Filter by title using a derived value, without storing filtered results in state | 4 |
| Report a bug | Add through a controlled form, reject blank titles, and update state immutably | 5 |
| Open a case | Add a `/bugs/:id` page and a route for unknown URLs | 2 |
| Submit and walk through | Submit working, readable code; explain where the state lives, how data flows, and one trade-off | 5 |

Bonus for bragging rights only: add a Retry button to the error state.

## Rules

Use the browser, DevTools, and documentation. Don't use AI tools.

## Submit

1. Push your final commit to `main` before time is called.
2. Paste your repo link into the evaluation form.
3. Be ready for a 3-minute walkthrough.
