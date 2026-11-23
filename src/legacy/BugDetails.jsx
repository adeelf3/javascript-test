import { Link, useParams } from "react-router-dom";

export default function BugDetails({ bugs, loading, error, onRetry }) {
  const { id } = useParams();

  if (loading) {
    return <p>Loading bug...</p>;
  }

  if (error) {
    return <div role="alert"><p>{error}</p><button onClick={onRetry}>Retry</button></div>;
  }

  const bug = bugs.find(function (item) {
    return String(item.id) === id;
  });

  if (!bug) {
    return <><p>Bug not found.</p><Link to="/">Back to board</Link></>;
  }

  return (
    <>
      <h2>{bug.title}</h2>
      <p>Bug ID: {bug.id}</p>
      <p>Severity: {bug.severity}</p>
      <Link to="/">Back to board</Link>
    </>
  );
}
