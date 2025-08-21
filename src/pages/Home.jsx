import React, { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import FilterPanel from "../components/FilterPanel";
import ErrorCard from "../components/ErrorCard";

export default function Home() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({});
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    async function loadData() {
      const windows = await fetch("/data/windows.json").then((r) => r.json());
      const linux = await fetch("/data/linux.json").then((r) => r.json());
      setErrors([...windows, ...linux]);
    }
    loadData();
  }, []);

  const filtered = errors.filter((err) => {
    const q = query.toLowerCase();
    const matchQuery =
      err.code.toLowerCase().includes(q) ||
      err.message.toLowerCase().includes(q);

    const matchFilters = Object.entries(filters).every(([cat, subs]) =>
      subs.length === 0 ? true : subs.includes(err.category)
    );

    return matchQuery && matchFilters;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <FilterPanel filters={filters} setFilters={setFilters} clearFilters={() => setFilters({})} />
      </div>
      <div className="md:col-span-3">
        <SearchBar query={query} setQuery={setQuery} />
        <div className="mt-4">
          {filtered.map((err) => (
            <ErrorCard key={err.code} error={err} />
          ))}
        </div>
      </div>
    </div>
  );
}
