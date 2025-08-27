import React, { useEffect, useMemo, useState } from "react";
import { HashRouter, Routes, Route, Link, useParams, useSearchParams } from "react-router-dom";
import { Moon, Sun, Search, Filter, ChevronDown, ArrowLeft, ExternalLink } from "lucide-react";

// ---------- helpers ----------
const urlJoin = (base, rel) => `${(base || "/").replace(/\/+$/, "")}/${(rel || "").replace(/^\/+/, "")}`;
const SOURCES = [
  "data/windows/bugcheck.json",
  "data/windows/ntstatus.json",
  "data/linux/errors.json",
];

function useDark() {
  const [theme, setTheme] = useState(() => localStorage.getItem("eh-theme") || "light");
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("eh-theme", theme);
  }, [theme]);
  return [theme, setTheme];
}

function useErrors() {
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const results = await Promise.all(
          SOURCES.map(async (rel) => {
            const url = urlJoin(import.meta.env.BASE_URL, rel);
            const res = await fetch(url, { cache: "no-store" });
            if (!res.ok) return [];
            const arr = await res.json();
            // normalize
            return (arr || []).map((e) => ({
              id: e.id || e.code || e.message,
              code: e.code || "",
              message: e.message || "",
              description: e.description || "",
              tags: e.tags || [],
              category: e.category || inferCategoryFromRel(rel),
            }));
          })
        );
        setErrors(results.flat());
      } catch (e) {
        console.error(e);
        setErrors([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  const categories = useMemo(() => {
    const tree = {};
    for (const e of errors) {
      const [top, sub] = (e.category || "").split(" > ");
      if (!top) continue;
      if (!tree[top]) tree[top] = new Set();
      if (sub) tree[top].add(sub);
    }
    const out = {};
    for (const [k, v] of Object.entries(tree)) out[k] = Array.from(v);
    return out;
  }, [errors]);
  return { loading, errors, categories };
}
function inferCategoryFromRel(rel) {
  // e.g. data/windows/bugcheck.json -> "Windows > bugcheck"
  const parts = rel.split("/");
  const os = parts[1] || ""; // windows, linux
  const file = (parts[2] || "").replace(/\.json$/, "");
  const label =
    file.toLowerCase() === "bugcheck" ? "Bug Check Codes" :
    file.toLowerCase() === "ntstatus" ? "NTStatus Codes" :
    file.toLowerCase() === "errors" ? "System Errors" : file;
  return `${capitalize(os)} > ${label}`;
}
const capitalize = (s) => s ? s[0].toUpperCase() + s.slice(1) : s;

// ---------- layout ----------
function Layout({ children, onToggleTheme, theme }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="flex items-center justify-between px-6 py-4 border-b bg-white dark:bg-gray-800 dark:border-gray-700">
        <Link to="/" className="text-2xl font-bold">ErrorHub</Link>
        <button onClick={onToggleTheme} className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700">
          {theme === "dark" ? <Sun size={18}/> : <Moon size={18}/>}<span className="text-sm">{theme === "dark" ? "Light" : "Dark"} mode</span>
        </button>
      </header>
      {children}
    </div>
  );
}

// ---------- pages ----------
function HomePage({ errors, categories }) {
  const [expanded, setExpanded] = useState(null);
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("q") || "");
  const [sort, setSort] = useState(params.get("sort") || "codeAsc");
  const [selected, setSelected] = useState((params.get("tags") || "").split(",").filter(Boolean));

  useEffect(() => {
    const p = {};
    if (search) p.q = search;
    if (selected.length) p.tags = selected.join(",");
    if (sort && sort !== "codeAsc") p.sort = sort;
    setParams(p, { replace: true });
  }, [search, sort, selected, setParams]);

  const toggleTag = (t) => setSelected((prev) => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  const clear = () => setSelected([]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return errors
      .filter(e => {
        const bySearch = !q || e.code.toLowerCase().includes(q) || e.message.toLowerCase().includes(q) || e.description.toLowerCase().includes(q);
        const byTags = selected.length === 0 || selected.some(t => (e.category + "," + (e.tags||[]).join(",")).includes(t));
        return bySearch && byTags;
      })
      .sort((a,b)=>{
        switch (sort) {
          case "codeAsc": return a.code.localeCompare(b.code);
          case "codeDesc": return b.code.localeCompare(a.code);
          case "messageAsc": return a.message.localeCompare(b.message);
          case "messageDesc": return b.message.localeCompare(a.message);
          default: return 0;
        }
      });
  }, [errors, search, selected, sort]);

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="w-72 border-r dark:border-gray-700 p-6 hidden md:block">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2"><Filter size={18}/><h2 className="font-semibold">Filters</h2></div>
          <button onClick={clear} className="text-sm text-red-500 hover:underline">Clear</button>
        </div>
        <ul className="space-y-2">
          {Object.entries(categories).map(([cat, subs]) => (
            <li key={cat}>
              <button onClick={()=>setExpanded(expanded===cat?null:cat)} className="w-full text-left px-3 py-1 rounded-lg flex justify-between items-center bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700">
                {cat}<ChevronDown className={`transition-transform ${expanded===cat?"rotate-180":""}`} size={16}/>
              </button>
              {expanded===cat && subs.length>0 && (
                <ul className="ml-4 mt-2 space-y-1">
                  {subs.map(sub => (
                    <li key={sub}>
                      <button onClick={()=>toggleTag(sub)} className={`w-full text-left px-3 py-1 rounded-lg ${selected.includes(sub)?"bg-blue-500 text-white":"bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"}`}>{sub}</button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </aside>

      {/* Main */}
      <div className="flex-1">
        {/* Search + Sort */}
        <div className="px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2 w-full md:w-1/2">
            <Search className="text-gray-500"/>
            <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search error codes, messages..." className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none"/>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm">Sort by:</label>
            <select id="sort" value={sort} onChange={(e)=>setSort(e.target.value)} className="px-2 py-1 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm">
              <option value="codeAsc">Code (A–Z)</option>
              <option value="codeDesc">Code (Z–A)</option>
              <option value="messageAsc">Message (A–Z)</option>
              <option value="messageDesc">Message (Z–A)</option>
            </select>
          </div>
        </div>

        {/* List */}
        <main className="px-6 grid gap-4">
          {filtered.map((e) => (
            <div key={e.id} className="p-4 rounded-2xl shadow bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-mono font-semibold text-lg">{e.code || e.message}</h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">{[e.category, ...(e.tags||[])].filter(Boolean).join(", ")}</span>
              </div>
              <p className="font-semibold">{e.message}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{e.description}</p>
              <Link to={`/#/error/${encodeURIComponent(e.id)}`} className="mt-3 inline-block px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm">
                View Fixes
              </Link>
            </div>
          ))}
          {filtered.length===0 && <p className="px-6 text-gray-500 dark:text-gray-400">No results found.</p>}
        </main>
      </div>
    </div>
  );
}

function FixPage() {
  const { id } = useParams();
  const [fix, setFix] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const url = urlJoin(import.meta.env.BASE_URL, `fixes/${id}.json`);
    fetch(url, { cache: "no-store" })
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (data) { setFix(data); setStatus("ok"); }
        else setStatus("missing");
      })
      .catch(() => setStatus("missing"));
  }, [id]);

  if (status === "loading") return <Layout><div className="p-6">Loading…</div></Layout>;
  if (status === "missing") return (
    <Layout>
      <div className="p-6">
        <button onClick={()=>history.back()} className="mb-4 flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"><ArrowLeft size={16}/>Back</button>
        <div className="p-6 rounded-2xl shadow bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h2 className="font-bold text-xl mb-2">Fix not found</h2>
          <p>Missing file: <code>public/fixes/{id}.json</code></p>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="p-6">
        <button onClick={()=>history.back()} className="mb-4 flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"><ArrowLeft size={16}/>Back</button>
        <div className="p-6 rounded-2xl shadow bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h2 className="font-mono font-bold text-xl mb-2">{fix.code}</h2>
          <p className="font-semibold">{fix.title || fix.message}</p>
          {fix.description && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{fix.description}</p>}
          {fix.image && <img src={urlJoin(import.meta.env.BASE_URL, fix.image)} alt={fix.title} className="my-4 rounded-lg"/>}
          {fix.steps?.length>0 && (
            <>
              <h3 className="font-semibold mt-4 mb-2">Steps to Fix:</h3>
              <ul className="list-disc ml-6 space-y-1">{fix.steps.map((s,i)=>(<li key={i}>{s}</li>))}</ul>
            </>
          )}
          {fix.resources?.length>0 && (
            <>
              <h3 className="font-semibold mt-4 mb-2">Additional Resources:</h3>
              <ul className="list-disc ml-6 space-y-1">
                {fix.resources.map((r,i)=>(
                  <li key={i}><a href={r.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-500 hover:underline">{r.label || r.name}<ExternalLink size={14}/></a></li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default function App() {
  const { loading, errors, categories } = useErrors();
  const [theme, setTheme] = useDark();
  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  return (
    <HashRouter>
      {loading ? (
        <Layout onToggleTheme={toggleTheme} theme={theme}>
          <div className="p-6">Loading…</div>
        </Layout>
      ) : (
        <Routes>
          <Route path="/" element={<Layout onToggleTheme={toggleTheme} theme={theme}><HomePage errors={errors} categories={categories}/></Layout>} />
          <Route path="/error/:id" element={<FixPage/>} />
          <Route path="*" element={<Layout onToggleTheme={toggleTheme} theme={theme}><div className="p-6">Page not found. <Link to="/" className="text-blue-500">Back to home</Link></div></Layout>} />
        </Routes>
      )}
    </HashRouter>
  );
}
