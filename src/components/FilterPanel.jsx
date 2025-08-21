import React from "react";

export default function FilterPanel({ filters, setFilters, clearFilters }) {
  const categories = {
    Windows: ["Bug Check Codes", "System Errors", "NTStatus Codes"],
    Linux: ["System Errors", "Errno Codes"],
  };

  const handleChange = (category, sub) => {
    setFilters((prev) => {
      const exists = prev[category]?.includes(sub);
      if (exists) {
        return { ...prev, [category]: prev[category].filter((s) => s !== sub) };
      }
      return {
        ...prev,
        [category]: [...(prev[category] || []), sub],
      };
    });
  };

  return (
    <div className="p-3 border rounded bg-white dark:bg-gray-800 dark:border-gray-600">
      <h2 className="font-semibold mb-2">Filters</h2>
      {Object.entries(categories).map(([cat, subs]) => (
        <div key={cat} className="mb-3">
          <h3 className="font-medium">{cat}</h3>
          {subs.map((sub) => (
            <label key={sub} className="block">
              <input
                type="checkbox"
                checked={filters[cat]?.includes(sub) || false}
                onChange={() => handleChange(cat, sub)}
              />{" "}
              {sub}
            </label>
          ))}
        </div>
      ))}
      <button onClick={clearFilters} className="mt-2 text-sm text-blue-500">Clear Filters</button>
    </div>
  );
}
