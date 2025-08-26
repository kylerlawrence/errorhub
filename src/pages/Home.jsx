import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Where your JSON files live (no leading slash)
const SOURCES = [
  "data/windows/bugcheck.json",
  "data/windows/ntstatus.json",
  "data/linux/errors.json",
];

// inline helper if you don't want a separate file
const urlJoin = (base, rel) =>
  `${(base || "/").replace(/\/+$/, "")}/${(rel || "").replace(/^\/+/, "")}`;

export default function Home() {
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const results = await Promise.all(
          SOURCES.map(async (rel) => {
            const url = urlJoin(import.meta.env.BASE_URL, rel);
            const res = await fetch(url, { cache: "no-store" });
            if (!res.ok) return [];
            return res.json();
          })
        );
        setErrors(results.flat());
      } catch {
        setErrors([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Loading…</p>;
  if (errors.length === 0) {
    return (
      <div>
        <p className="text-red-600 font-semibold">No error data found.</p>
        <ul className="list-disc ml-6 text-sm">
          {SOURCES.map((rel) => (
            <li key={rel}>{urlJoin(import.meta.env.BASE_URL, rel)}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Error Codes</h1>
      <ul className="space-y-3">
        {errors.map((e) => (
          <li key={e.id || e.code} className="p-4 rounded bg-white dark:bg-gray-800 shadow">
            <Link to={`/error/${encodeURIComponent(e.id || e.code)}`}>
              <p className="font-mono text-blue-600">{e.code}</p>
              <p className="font-semibold">{e.message}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{e.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
