import React from "react";

export default function SearchBar({ query, setQuery }) {
  return (
    <input
      type="text"
      placeholder="Search error codes or messages..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
    />
  );
}
