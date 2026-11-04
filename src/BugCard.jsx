export default function BugCard({ bug }) {
  return (
    <article>
      <h3>{bug.title}</h3>
      <p>Severity: {bug.severity}</p>
    </article>
  );
}
