import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const urlJoin = (base, rel) =>
  `${(base || "/").replace(/\/+$/, "")}/${(rel || "").replace(/^\/+/, "")}`;

export default function FixPage() {
  const { errorId } = useParams();
  const [fix, setFix] = useState(null);

  useEffect(() => {
    const url = urlJoin(import.meta.env.BASE_URL, `fixes/${errorId}.json`);
    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then(setFix)
      .catch(() => setFix(null));
  }, [errorId]);

  if (!fix) return <p>Loading or fix not found.</p>;
  // ... render as you already do ...
  return (
    <div>
      <h1 className="text-2xl font-bold">{fix.code} - {fix.title || fix.message}</h1>
      {/* rest of your UI */}
      <Link to="/" className="block mt-6 text-blue-500">← Back</Link>
    </div>
  );
}
