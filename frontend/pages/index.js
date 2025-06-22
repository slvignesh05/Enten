import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prUrl, setPrUrl] = useState("");

  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

  const scan = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      setResults(Array.isArray(data.issues) ? data.issues : []);
    } catch (err) {
      console.error("Scan failed:", err);
      setResults([]);
    }
    setLoading(false);
  };

  const fix = async () => {
    try {
      const res = await fetch(`${BACKEND}/fix`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      setPrUrl(data.pr_url || "");
    } catch (err) {
      console.error("Fix failed:", err);
      setPrUrl("");
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">CI/CD Workflow Auditor</h1>
      <input
        className="border p-2 w-full"
        placeholder="Enter GitHub repo URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button
        onClick={scan}
        className="bg-blue-600 text-white px-4 py-2 mt-2"
      >
        Scan
      </button>
      {loading && <p className="mt-2 text-gray-600">Scanning...</p>}
      <ul className="mt-4">
        {results.map((r, i) => (
          <li key={i} className="bg-gray-100 p-2 my-1">
            <strong>{r.file}</strong> - {r.issue}
          </li>
        ))}
      </ul>
      {results.length > 0 && (
        <button
          onClick={fix}
          className="bg-green-600 text-white px-4 py-2 mt-4"
        >
          Fix and PR
        </button>
      )}
      {prUrl && (
        <p className="mt-4">
          Pull Request:{" "}
          <a
            className="text-blue-600 underline"
            href={prUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {prUrl}
          </a>
        </p>
      )}
    </div>
  );
}
