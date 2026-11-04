import BugCard from "./BugCard";

export default function BugList({ bugs }) {
  if (bugs.length === 0) {
    return <p>No bugs found.</p>;
  }

  return (
    <div>
      {bugs.map(function (bug) {
        return <BugCard key={bug.id} bug={bug} />;
      })}
    </div>
  );
}
