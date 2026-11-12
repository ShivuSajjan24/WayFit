import React, { useState, useEffect } from 'react';
import { runWayFitUnitTests } from '../utils/__tests__/wayfit.test';
import { CheckCircle2, XCircle, RefreshCw, X, Award } from 'lucide-react';

interface UnitTestModalProps {
  onClose: () => void;
}

export const UnitTestModal: React.FC<UnitTestModalProps> = ({ onClose }) => {
  const [tests, setTests] = useState<{ name: string; passed: boolean; message?: string }[]>([]);
  const [running, setRunning] = useState<boolean>(false);

  const executeTests = () => {
    setRunning(true);
    setTimeout(() => {
      const res = runWayFitUnitTests();
      setTests(res);
      setRunning(false);
    }, 250);
  };

  useEffect(() => {
    executeTests();
  }, []);

  const passedCount = tests.filter((t) => t.passed).length;
  const allPassed = tests.length > 0 && passedCount === tests.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-3xl bg-[#1B2027] border border-gray-700 p-6 shadow-2xl flex flex-col text-white animate-fade-in max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-500/20 text-[#22C55E] flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">WayFit Core Unit Tests</h2>
              <p className="text-xs text-gray-400">Verifying distance, pace, calories, activity detection & GPX</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Banner */}
        <div className="py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                allPassed ? 'bg-green-500/20 text-green-400 border border-green-500/40' : 'bg-orange-500/20 text-orange-400'
              }`}
            >
              {passedCount} / {tests.length} Passed
            </span>
            {allPassed && <span className="text-xs text-gray-400">All tests verified</span>}
          </div>

          <button
            type="button"
            onClick={executeTests}
            disabled={running}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-white transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
            <span>Re-run</span>
          </button>
        </div>

        {/* Tests list */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 py-1">
          {tests.map((t, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex items-start gap-3 text-xs ${
                t.passed
                  ? 'bg-[#111418] border-gray-800'
                  : 'bg-red-950/20 border-red-500/40 text-red-300'
              }`}
            >
              {t.passed ? (
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <span className="font-semibold text-white">{t.name}</span>
                {t.message && <p className="text-[11px] text-gray-400 mt-0.5">{t.message}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-semibold text-xs active:scale-95 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
