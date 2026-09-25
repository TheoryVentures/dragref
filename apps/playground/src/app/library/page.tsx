import { LibraryGrid } from "./library-grid";

export default function LibraryPage() {
  return (
    <section>
      <h1>Library</h1>
      <p>
        Each card is rendered by <code>dragref/react</code>. Drags are logged with a <code>L-</code>{" "}
        variant id so they line up with probe records in the egress summary.
      </p>
      <LibraryGrid />
    </section>
  );
}
