import { useEffect, useRef, useState } from "react";
import { Routes, Route } from "react-router-dom";
import BugDetails from "./BugDetails";
import NotFound from "./NotFound";
import { fetchBugs } from "./mockApi";
import BugList from "./BugList";
import "./style.css";

export default function App() {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");

  const [formError, setFormError] = useState("");
  const [severity, setSeverity] = useState("Low");
  const latestRequest = useRef(0);

  function loadBugs() {
    const requestId = ++latestRequest.current;
    setLoading(true);
    setError("");

    fetchBugs()
      .then(function (data) {
        if (requestId !== latestRequest.current) return;
        setBugs(data);
      })
      .catch(function (err) {
        if (requestId !== latestRequest.current) return;
        setError(err.message);
      })
      .finally(function () {
        if (requestId !== latestRequest.current) return;
        setLoading(false);
      });
  }

  useEffect(function () {
    loadBugs();
    return function () {
      latestRequest.current += 1;
    };
  }, []);

  const filteredBugs = bugs.filter(function (bug) {
    return bug.title.toLowerCase().includes(search.toLowerCase());
  });

  function handleSubmit(event) {
    event.preventDefault();
    if (loading || error) return;
    if (title.trim() === "") {
      setFormError("Please enter a bug title.");
      return;
    }

    setBugs(function (currentBugs) {
      const nextId = Math.max(0, ...currentBugs.map(function (bug) {
        return bug.id;
      })) + 1;

      const newBug = { id: nextId, title: title.trim(), severity: severity };
      return [...currentBugs, newBug];
    });
    setTitle("");
    setSeverity("Low");
    setFormError("");
  }

  return (
    <main>
      <h1>Bug Bounty Board</h1>

      <Routes>
        <Route path="/" element={<>
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
            <form onSubmit={handleSubmit}>
              <label htmlFor="title">Bug title</label>
              <input
                id="title"
                value={title}
                onChange={function (event) {
                  setTitle(event.target.value);
                }}
              />
              <label htmlFor="severity">Severity</label>
              <select id="severity" value={severity} onChange={function (event) {
                setSeverity(event.target.value);
              }}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
              {formError && <p role="alert">{formError}</p>}
              <button type="submit" disabled={loading || Boolean(error)}>Add bug</button>
            </form>
        </>} />
        <Route path="/bugs/:id" element={
          <BugDetails bugs={bugs} loading={loading} error={error} onRetry={loadBugs} />
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
  );
}
