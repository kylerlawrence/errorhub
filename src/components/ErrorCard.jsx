import React from "react";
import { Link } from "react-router-dom";

export default function ErrorCard({ error }) {
  return (
    <div className="p-3 border rounded bg-white dark:bg-gray-800 dark:border-gray-600 mb-2">
      <h3 className="font-bold">{error.code}</h3>
      <p>{error.message}</p>
      <Link to={`/error/${error.code}`} className="text-blue-500">View Fix</Link>
    </div>
  );
}
