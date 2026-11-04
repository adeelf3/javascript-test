import { useEffect, useState } from "react";
import { fetchBugs } from "./mockApi";
import BugList from "./BugList";
import "./style.css";

export default function App() {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");

  function loadBugs() {
    setLoading(true);
    setError("");

    fetchBugs()
      .then(function (data) {
        setBugs(data);
      })
      .catch(function (err) {
        setError(err.message);
      })
      .finally(function () {
        setLoading(false);
      });
  }

  useEffect(function () {
    loadBugs();
  }, []);

  const filteredBugs = bugs.filter(function (bug) {
    return bug.title.toLowerCase().includes(search.toLowerCase());
  });

  function handleSubmit(event) {
    event.preventDefault();
    // TODO: Check the title and add a new bug to the bugs array.
  }

  return (
    <main>
      <h1>Bug Bounty Board</h1>

      <label htmlFor="search">Search bugs</label>
      <input
        id="search"
        value={search}
        onChange={function (event) {
          setSearch(event.target.value);
        }}
        placeholder="Search by title"
      />

      {loading && <p>Loading bugs...</p>}

      {error && (
        <div role="alert">
          <p>{error}</p>
          <button onClick={loadBugs}>Retry</button>
        </div>
      )}

      {!loading && !error && <BugList bugs={filteredBugs} />}

      <h2>Report a bug</h2>
      <p>This form is incomplete. Adding a bug is still pending.</p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="title">Bug title</label>
        <input
          id="title"
          value={title}
          onChange={function (event) {
            setTitle(event.target.value);
          }}
        />
        <button type="submit" disabled>Add bug (pending)</button>
      </form>
    </main>
  );
}
