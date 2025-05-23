"use client";
import { useState } from "react";
import axios from "axios";
import { AnalysisResult } from "@/types/types";

export default function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await axios.post<AnalysisResult>("/api/analyze", { url }, {
        timeout: 40000
      });
      setResult(res.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || err.message);
      } else {
        setError('An unexpected error occurred');
      }
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🏠 Is This Property Safe?</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Paste property URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full p-2 border rounded mb-2"
        />
        <small className="text-gray-500">
          Example format: https://www.example.com/listings/123
        </small>
      </div>
      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? "Analyzing..." : "Analyze"}
      </button>
      {error && (
        <div className="mt-4 p-4 rounded bg-red-100 text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}
      {result && (
        <div className="mt-6 border p-4 rounded bg-gray-50 space-y-3">
          <div>
            <strong>Suspicion Level:</strong> 
            <span className={`ml-2 px-2 py-1 rounded ${
              result.suspicion > 7 ? 'bg-red-200' : 
              result.suspicion > 4 ? 'bg-yellow-200' : 'bg-green-200'
            }`}>
              {result.suspicion}/10
            </span>
          </div>
          <div>
            <strong>Red Flags:</strong>
            <ul className="list-disc list-inside mt-1">
              {result.flags.map((flag, i) => (
                <li key={i} className="text-red-700">{flag}</li>
              ))}
            </ul>
          </div>
          <div>
            <strong>Analysis:</strong>
            <p className="mt-1 text-gray-700 whitespace-pre-wrap">{result.reasoning}</p>
          </div>
        </div>
      )}
    </main>
  );
}
