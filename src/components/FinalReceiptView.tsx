import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { Check, Copy, LogIn, RotateCcw, Trophy, Zap } from 'lucide-react';
import { Difficulty } from '../data/items';
import {
  DIFFICULTY_CONFIGS,
  RoundResult,
  buildShareSummary,
  formatGBP,
} from '../utils/gameLogic';

interface FinalReceiptViewProps {
  results: RoundResult[];
  difficulty: Difficulty;
  mode: 'daily' | 'practice';
  dailyDate: string;
  user: User | null;
  postingStatus: 'idle' | 'posting' | 'posted' | 'already-daily' | 'error';
  isNewBest: boolean;
  onSignInAndPost: () => void;
  onPlayAgain: () => void;
  onQuickPlay: () => void;
  onViewLeaderboard: () => void;
}

export const FinalReceiptView: React.FC<FinalReceiptViewProps> = ({
  results,
  difficulty,
  mode,
  dailyDate,
  user,
  postingStatus,
  isNewBest,
  onSignInAndPost,
  onPlayAgain,
  onQuickPlay,
  onViewLeaderboard,
}) => {
  const [copied, setCopied] = useState(false);

  const cfg = DIFFICULTY_CONFIGS[difficulty];
  const totalScore = results.reduce((sum, r) => sum + r.points, 0);
  const avgErrorPct =
    results.length > 0
      ? results.reduce((sum, r) => sum + r.absErrorPct, 0) / results.length
      : 0;
  const totalActualPence = results.reduce((sum, r) => sum + r.actualTotalPence, 0);
  const totalGuessPence = results.reduce((sum, r) => sum + r.guessPence, 0);

  const handleCopy = () => {
    const text = buildShareSummary(results, difficulty, mode, dailyDate);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <section className="max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Thermal Receipt Card */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-t-xl receipt-serrated shadow-sm">
          <div className="px-6 py-6 border-b border-dashed border-slate-300">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>
                {mode === 'daily'
                  ? `Daily Basket · ${dailyDate}`
                  : 'Practice Shop Receipt'}
              </span>
              <span className="font-mono">
                {cfg.label} · ±{cfg.marginPct}%
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0F1D36]">
              Checkout Complete
            </h1>
          </div>

          {/* Round-by-round breakdown */}
          <div className="divide-y divide-dashed divide-slate-200">
            {results.map((r) => (
              <div key={r.roundNumber} className="px-6 py-4">
                <div className="flex items-baseline justify-between gap-4 mb-2">
                  <div>
                    <span className="font-display font-bold text-[#0F1D36] text-base">
                      Round {r.roundNumber}: {r.title}
                    </span>
                    <span className="text-xs text-slate-500 ml-2">
                      {r.itemCount} {r.itemCount === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                  <span
                    className={`font-mono font-bold text-base tabular-nums ${
                      r.inZone ? 'text-[#00539F]' : 'text-slate-400'
                    }`}
                  >
                    +{r.points.toLocaleString()} pts
                  </span>
                </div>

                <div className="space-y-1 mb-2.5">
                  {r.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-xs text-slate-600"
                    >
                      <span className="truncate pr-3">
                        {item.name} ({item.packSize})
                      </span>
                      <span className="font-mono tabular-nums shrink-0 text-slate-800">
                        {formatGBP(item.pricePence)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-2 border-t border-slate-100">
                  <span className="font-mono text-slate-600 tabular-nums">
                    Guess {formatGBP(r.guessPence)} vs Actual {formatGBP(r.actualTotalPence)}
                  </span>
                  <span
                    className={`font-semibold ${
                      r.diffPence === 0
                        ? 'text-[#00539F]'
                        : r.inZone
                          ? 'text-emerald-700'
                          : 'text-[#EE1C2E]'
                    }`}
                  >
                    {r.ratingLabel} ({r.absErrorPct.toFixed(1)}% off)
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Grand Total Footer */}
          <div className="px-6 py-5 bg-[#F8FAFC] border-t border-dashed border-slate-300 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Combined Basket Value</span>
              <span className="font-mono tabular-nums text-slate-700">
                Guessed {formatGBP(totalGuessPence)} / Actual {formatGBP(totalActualPence)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Average Accuracy Error</span>
              <span className="font-mono font-semibold tabular-nums text-[#0F1D36]">
                {avgErrorPct.toFixed(2)}%
              </span>
            </div>
            <div className="pt-2 flex items-baseline justify-between">
              <span className="font-display text-lg font-bold text-[#0F1D36]">
                Final Score
              </span>
              <span className="font-mono text-3xl font-bold text-[#00539F] tabular-nums">
                {totalScore.toLocaleString()}
                <span className="text-sm font-medium text-slate-400 ml-1">
                  / {cfg.maxTotalPoints.toLocaleString()}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Action & Leaderboard Sync Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-[#0F1D36]">
              Global Leaderboard Status
            </h2>

            {!user ? (
              <>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Sign in with Google right now to submit your{' '}
                  <span className="font-mono font-semibold text-[#0F1D36]">
                    {totalScore.toLocaleString()} pts
                  </span>{' '}
                  score to the live TEKSCOdle global leaderboard.
                </p>
                <button
                  type="button"
                  onClick={onSignInAndPost}
                  className="w-full py-3 px-4 bg-[#00539F] hover:bg-[#00407B] text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In &amp; Post Score</span>
                </button>
              </>
            ) : postingStatus === 'posting' ? (
              <p className="text-sm text-slate-600">
                Saving your checkout score to the global leaderboard...
              </p>
            ) : postingStatus === 'error' ? (
              <p className="text-sm text-[#EE1C2E]">
                Could not reach the leaderboard server. Your receipt is still saved below.
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-emerald-700">
                  {isNewBest
                    ? 'New Personal Best recorded on the global leaderboard.'
                    : 'Run saved to your shopper profile.'}
                </p>
                {mode === 'daily' && (
                  <p className="text-xs text-slate-600">
                    {postingStatus === 'already-daily'
                      ? `Your first Daily Basket attempt for ${dailyDate} remains locked on today's board.`
                      : `Posted to Today's Daily Basket (${dailyDate}) rankings.`}
                  </p>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={onViewLeaderboard}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-[#0F1D36] font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Trophy className="w-4 h-4 text-[#00539F]" />
              <span>View Global Leaderboard</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            <button
              type="button"
              onClick={handleCopy}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-[#0F1D36] border border-slate-200 font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Receipt Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Shareable Receipt</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onPlayAgain}
              className="w-full py-3 px-4 bg-[#00539F] hover:bg-[#00407B] text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </button>

            <button
              type="button"
              onClick={onQuickPlay}
              className="w-full py-2.5 px-4 bg-[#FFD100] hover:bg-[#F2C600] text-[#0F1D36] font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Zap className="w-4 h-4" />
              <span>Quick Play Round</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
