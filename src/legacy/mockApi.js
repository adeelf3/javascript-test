const BUGS = [
  { id: 1, title: "Login button overlaps footer", severity: "Low" },
  { id: 2, title: "Checkout total is wrong", severity: "High" },
  { id: 3, title: "Search ignores capital letters", severity: "Medium" },
];

export function fetchBugs() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.25) {
        reject(new Error("The bug server is hiding"));
      } else {
        resolve(BUGS);
      }
    }, 800);
  });
}
