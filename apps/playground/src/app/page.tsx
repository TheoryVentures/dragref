import Link from "next/link";

export default function Home() {
  return (
    <section>
      <h1>dragref research harness</h1>
      <ul>
        <li>
          <Link href="/lab">Lab</Link>: one draggable per payload variant. Drag each into the
          pasteboard probe or a real client and record the outcome.
        </li>
        <li>
          <Link href="/inspect">Inspect</Link>: a drop zone that dumps everything a Chromium
          receiver sees. Open it in a second browser window.
        </li>
        <li>
          <Link href="/library">Library</Link>: the same references rendered through{" "}
          <code>dragref/react</code>.
        </li>
      </ul>
    </section>
  );
}
