import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prUrl, setPrUrl] = useState("");

  const scan = async () => {
    setLoading(true);
    const res = await fetch("https://enten-0vnu.onrender.com/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    setResults(data.issues);
    setLoading(false);
  };

  const fix = async () => {
    const res = await fetch("https://enten-0vnu.onrender.com/fix", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    setPrUrl(data.pr_url);
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
      <button onClick={scan} className="bg-blue-600 text-white px-4 py-2 mt-2">Scan</button>
      {loading && <p>Scanning...</p>}
      <ul className="mt-4">
        {results.map((r, i) => (
          <li key={i} className="bg-gray-100 p-2 my-1">
            <strong>{r.file}</strong> - {r.issue}
          </li>
        ))}
      </ul>
      {results.length > 0 && (
        <button onClick={fix} className="bg-green-600 text-white px-4 py-2 mt-4">Fix and PR</button>
      )}
      {prUrl && <p className="mt-4">Pull Request: <a className="text-blue-600" href={prUrl}>{prUrl}</a></p>}
    </div>
  );
}
