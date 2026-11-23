import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <>
      <h2>Page not found</h2>
      <Link to="/">Back to board</Link>
    </>
  );
}
