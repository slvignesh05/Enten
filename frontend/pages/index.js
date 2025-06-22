import { useState } from "react";
import Head from "next/head";

export default function Home() {
  const [url, setUrl] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prUrl, setPrUrl] = useState("");
  const [vulnInfo, setVulnInfo] = useState(null);

  const scan = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://enten-0vnu.onrender.com/scan", {
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

  const showVulnInfo = (issue) => {
    let message = "";
    if (issue.includes("not pinned")) {
      message = "Without pinning to a specific commit, malicious updates to the action can compromise your CI/CD pipeline.";
    } else if (issue.includes("curl")) {
      message = "Using curl without checksum validation allows attackers to inject malicious scripts.";
    }
    setVulnInfo(message);
  };

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 font-sans overflow-hidden animate-fade-in">
      <Head>
        <title>EntenCI Auditor</title>
      </Head>

      {/* Animated Blobs */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <div className="absolute w-96 h-96 bg-fuchsia-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob delay-2000 left-1/3"></div>
        <div className="absolute w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob delay-4000 top-1/2 left-2/3"></div>
      </div>

      <h1 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">
        EntenCI Auditor
      </h1>

      <input
        className="bg-black/30 border border-white/20 backdrop-blur-md p-3 rounded-lg w-full max-w-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
        placeholder="Enter GitHub repo URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <button
        onClick={scan}
        className="mt-4 px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-black font-semibold shadow-lg transition"
      >
        🔍 Scan Repository
      </button>

      {loading && <p className="mt-4 text-blue-200 animate-pulse">Scanning...</p>}

      <ul className="mt-8 w-full max-w-2xl space-y-4">
        {results.map((r, i) => (
          <li
            key={i}
            className="bg-white/10 backdrop-blur-lg p-4 rounded-xl shadow-lg flex justify-between items-start text-sm"
          >
            <div>
              <a
                href={`https://github.com/${url.replace("https://github.com/", "")}/blob/main/.github/workflows/${r.file}`}
                className="underline text-cyan-300 hover:text-cyan-400 transition"
                target="_blank"
                rel="noopener noreferrer"
              >
                {r.file}
              </a>
              <span className="block text-gray-200 mt-1">{r.issue}</span>
            </div>
            <button
              className="bg-cyan-500/20 px-2 py-1 text-xs rounded hover:bg-cyan-500/30 transition"
              onClick={() => showVulnInfo(r.issue)}
            >
              Why?
            </button>
          </li>
        ))}
      </ul>

      {vulnInfo && (
        <di
