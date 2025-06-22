import { useState } from "react";

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
      message = "If an action isn't pinned to a commit SHA, an attacker can update the tag to malicious code.";
    } else if (issue.includes("curl")) {
      message = "Downloading scripts with curl without verifying checksum can lead to remote code execution.";
    }
    setVulnInfo(message);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white flex flex-col justify-center items-center px-4">
      <h1 className="text-4xl font-bold mb-6">EntenCI</h1>

      <input
        className="bg-black/20 border border-white/30 backdrop-blur-md p-3 rounded-lg w-full max-w-md text-white placeholder-white/60"
        placeholder="Enter GitHub repo URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <button
        onClick={scan}
        className="bg-indigo-500 hover:bg-indigo-600 mt-4 px-6 py-2 rounded-lg"
      >
        Scan
      </button>

      {loading && <p className="mt-4">Scanning...</p>}

      <ul className="mt-6 w-full max-w-2xl space-y-3">
        {results.map((r, i) => (
          <li
            key={i}
            className="bg-white/10 backdrop-blur-lg p-4 rounded-lg shadow-md flex justify-between items-center"
          >
            <div>
              <a
                href={`https://github.com/${url.replace("https://github.com/", "")}/blob/main/.github/workflows/${r.file}`}
                className="underline text-blue-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                {r.file}
              </a>{" "}- {r.issue}
            </div>
            <button
              className="bg-white/20 px-2 py-1 text-xs rounded hover:bg-white/30"
              onClick={() => showVulnInfo(r.issue)}
            >
              Why?
            </button>
          </li>
        ))}
      </ul>

      {vulnInfo && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white/10 text-white p-4 rounded-xl backdrop-blur-xl shadow-xl w-full max-w-sm">
          <p className="text-sm">{vulnInfo}</p>
          <button onClick={() => setVulnInfo(null)} className="mt-2 text-xs underline">Close</button>
        </div>
      )}

      {results.length > 0 && (
        <button
          onClick={async () => {
            const res = await fetch("https://enten-0vnu.onrender.com/fix", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url }),
            });
            const data = await res.json();
            setPrUrl(data.pr_url || "");
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 mt-6 rounded-lg"
        >
          Fix and PR
        </button>
      )}

      {prUrl && (
        <p className="mt-6">Pull Request: <a className="underline text-blue-400" href={prUrl} target="_blank" rel="noopener noreferrer">{prUrl}</a></p>
      )}
    </div>
  );
}
