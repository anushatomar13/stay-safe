"use client";
import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-950 text-white">
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="p-6 max-w-2xl mx-auto pt-16"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            🏠 Is This Property Safe?
          </h1>
          <p className="text-gray-400">Analyze property listings for potential red flags</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-6"
        >
          <motion.input
            type="text"
            placeholder="Paste property URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full p-4 bg-slate-800 border border-slate-600 rounded-lg mb-2 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
            whileFocus={{ scale: 1.02 }}
          />
          <small className="text-gray-500">
            Example format: https://www.example.com/listings/123
          </small>
        </motion.div>

        <motion.button
          onClick={handleAnalyze}
          disabled={loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-600 disabled:to-slate-700 transition-all duration-200 shadow-lg"
        >
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-2"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
                Analyzing...
              </motion.div>
            ) : (
              <motion.span
                key="analyze"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Analyze Property
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="mt-6 p-4 rounded-lg bg-red-900/50 border border-red-700 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2">
                <span className="text-red-400 text-xl">⚠️</span>
                <div>
                  <strong className="text-red-300">Error:</strong>
                  <p className="text-red-200 mt-1">{error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.9 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mt-8 border border-slate-600 p-6 rounded-lg bg-slate-800/50 backdrop-blur-sm space-y-6"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <strong className="text-slate-200 text-lg">Suspicion Level:</strong>
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className={`ml-3 px-3 py-1 rounded-full font-bold ${
                    result.suspicion > 7 ? 'bg-red-600 text-red-100' : 
                    result.suspicion > 4 ? 'bg-yellow-600 text-yellow-100' : 'bg-green-600 text-green-100'
                  }`}
                >
                  {result.suspicion}/10
                </motion.span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <strong className="text-slate-200 text-lg">Red Flags:</strong>
                <ul className="list-none mt-3 space-y-2">
                  {result.flags.map((flag, i) => (
                    <motion.li 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="flex items-center gap-2 text-red-300 bg-red-900/20 p-2 rounded border-l-2 border-red-500"
                    >
                      <span className="text-red-400">🚩</span>
                      {flag}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <strong className="text-slate-200 text-lg">Analysis:</strong>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-3 p-4 bg-slate-700/30 rounded-lg border border-slate-600"
                >
                  <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{result.reasoning}</p>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>
    </div>
  );
}