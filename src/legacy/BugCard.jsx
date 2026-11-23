import { Link } from "react-router-dom";

export default function BugCard({ bug }) {
  return (
    <article>
      <h3><Link to={"/bugs/" + bug.id}>{bug.title}</Link></h3>
      <p>Severity: {bug.severity}</p>
    </article>
  );
}
