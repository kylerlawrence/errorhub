import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function FixPage() {
  const { errorId } = useParams();
  const [fix, setFix] = useState(null);

  useEffect(() => {
    fetch(`/fixes/${errorId}.json`)
      .then((r) => r.json())
      .then(setFix)
      .catch(() => setFix(null));
  }, [errorId]);

  if (!fix) return <p>Loading or fix not found.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold">{fix.code} - {fix.message}</h1>
      <p className="mt-2">{fix.description}</p>

      {fix.image && <img src={`/images/${fix.image}`} alt={fix.code} className="my-4" />}

      <h2 className="text-xl font-semibold mt-4">Steps to Fix</h2>
      <ol className="list-decimal ml-6">
        {fix.steps.map((s, i) => <li key={i}>{s}</li>)}
      </ol>

      <h2 className="text-xl font-semibold mt-4">Resources</h2>
      <ul className="list-disc ml-6">
        {fix.resources.map((r, i) => (
          <li key={i}><a href={r.url} className="text-blue-500">{r.name}</a></li>
        ))}
      </ul>

      <Link to="/" className="block mt-6 text-blue-500">← Back to search</Link>
    </div>
  );
}
