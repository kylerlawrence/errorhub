import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load JSON files (example: Windows BugCheck + NTStatus, Linux errors, etc.)
  useEffect(() => {
    async function loadData() {
      try {
        // Load multiple categories
        const sources = [
          "/data/windows/bugcheck.json",
          "/data/windows/ntstatus.json",
          "/data/linux/errors.json",
        ];

        const results = await Promise.all(
          sources.map(src =>
            fetch(process.env.PUBLIC_URL + src).then(res =>
              res.ok ? res.json() : []
            )
          )
        );

        // Flatten and merge all categories
        const merged = results.flat();
        setErrors(merged);
      } catch (err) {
        console.error("Error loading JSON data", err);
        setErrors([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return <p className="text-gray-600">Loading errors...</p>;
  }

  if (errors.length === 0) {
    return <p className="text-red-500">No error data found.</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Error Codes</h1>
      <ul className="space-y-2">
        {errors.map((err, i) => (
          <li
            key={i}
            className="p-4 rounded bg-white dark:bg-gray-800 shadow hover:shadow-md transition"
          >
            <Link to={`/error/${encodeURIComponent(err.code)}`}>
              <p className="font-mono text-blue-600 dark:text-blue-400">
                {err.code}
              </p>
              <p className="font-semibold">{err.message}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {err.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
