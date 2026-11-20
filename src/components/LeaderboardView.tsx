import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { Award, Check, Edit2, LogIn, Trophy } from 'lucide-react';
import { Difficulty } from '../data/items';
import {
  DailyLeaderboardEntryRecord,
  LeaderboardEntryRecord,
  UserProfileRecord,
} from '../firebase';

interface LeaderboardViewProps {
  user: User | null;
  profile: UserProfileRecord | null;
  globalEntries: LeaderboardEntryRecord[];
  dailyEntries: DailyLeaderboardEntryRecord[];
  todayDate: string;
  loading: boolean;
  error: string | null;
  onSignIn: () => void;
  onUpdateDisplayName: (newName: string) => Promise<void>;
  onStartPlay: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  user,
  profile,
  globalEntries,
  dailyEntries,
  todayDate,
  loading,
  error,
  onSignIn,
  onUpdateDisplayName,
  onStartPlay,
}) => {
  const [boardTab, setBoardTab] = useState<'alltime' | 'daily'>('alltime');
  const [diffFilter, setDiffFilter] = useState<'all' | Difficulty>('all');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile?.displayName || user?.displayName || '');
  const [savingName, setSavingName] = useState(false);

  const filteredAllTime =
    diffFilter === 'all'
      ? globalEntries
      : globalEntries.filter((e) => e.difficulty === diffFilter);

  const filteredDaily =
    diffFilter === 'all'
      ? dailyEntries
      : dailyEntries.filter((e) => e.difficulty === diffFilter);

  const activeRows = boardTab === 'alltime' ? filteredAllTime : filteredDaily;

  const currentUserRank = user
    ? activeRows.findIndex((row) => row.uid === user.uid) + 1
    : 0;

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    setSavingName(true);
    try {
      await onUpdateDisplayName(nameInput.trim());
      setEditingName(false);
    } finally {
      setSavingName(false);
    }
  };

  return (
    <section className="space-y-6">
      {/* Header & player summary strip */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#00539F] mb-1">
            Global Checkout Rankings
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0F1D36] text-balance">
            TEKSCOdle Leaderboard
          </h1>
          <p className="text-sm text-slate-600 mt-1.5 max-w-2xl">
            Ranked by 3-round basket score across Express (1 item), Midweek Top-Up (3 items), and The Big Shop (5 items). Ties break by lowest average price error.
          </p>
        </div>

        <button
          type="button"
          onClick={onStartPlay}
          className="self-start lg:self-auto px-5 py-2.5 text-sm font-semibold text-white bg-[#00539F] hover:bg-[#00407B] rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          Play a Basket
        </button>
      </div>

      {/* Signed-in Player Stats Bar or Sign-In Prompt */}
      {user ? (
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-[#0F1D36] text-[#FFD100] font-display font-bold text-lg flex items-center justify-center shrink-0">
              {(profile?.displayName || user.displayName || 'S').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              {editingName ? (
                <form onSubmit={handleSaveName} className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={40}
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    aria-label="Edit shopper display name"
                    className="px-2.5 py-1 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00539F]"
                  />
                  <button
                    type="submit"
                    disabled={savingName}
                    className="px-3 py-1 text-xs font-semibold text-white bg-[#00539F] rounded-md hover:bg-[#00407B] whitespace-nowrap"
                  >
                    <Check className="w-3.5 h-3.5 inline mr-1" />
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingName(false)}
                    className="px-2 py-1 text-xs text-slate-500 hover:text-slate-800 whitespace-nowrap"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-[#0F1D36] truncate">
                    {profile?.displayName || user.displayName || 'Shopper'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setNameInput(profile?.displayName || user.displayName || '');
                      setEditingName(true);
                    }}
                    aria-label="Edit display name"
                    className="text-slate-400 hover:text-[#00539F] transition-colors p-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <div className="text-xs text-slate-500">
                {currentUserRank > 0
                  ? `Currently ranked #${currentUserRank} on this board`
                  : 'Complete a 3-round game to post your score'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-left sm:text-right">
            <div>
              <div className="text-xs text-slate-500">Best Score</div>
              <div className="font-mono text-lg font-bold text-[#0F1D36] tabular-nums">
                {(profile?.bestScore ?? 0).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">3-Round Games</div>
              <div className="font-mono text-lg font-bold text-[#0F1D36] tabular-nums">
                {profile?.gamesPlayed ?? 0}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Quick Plays</div>
              <div className="font-mono text-lg font-bold text-[#0F1D36] tabular-nums">
                {profile?.quickPlays ?? 0}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Daily Streak</div>
              <div className="font-mono text-lg font-bold text-[#00539F] tabular-nums">
                {profile?.dailyStreak ?? 0}d
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-bold text-[#0F1D36]">
              Want your score on the global board?
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              Sign in with Google to save your personal best, daily streaks, and climb the worldwide TEKSCOdle rankings.
            </p>
          </div>
          <button
            type="button"
            onClick={onSignIn}
            className="px-4 py-2.5 text-sm font-semibold text-white bg-[#00539F] hover:bg-[#00407B] rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In with Google</span>
          </button>
        </div>
      )}

      {/* Controls Bar: Board Scope + Difficulty Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="inline-flex items-center p-1 bg-slate-200/80 rounded-lg self-start">
          <button
            type="button"
            onClick={() => setBoardTab('alltime')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              boardTab === 'alltime'
                ? 'bg-white text-[#0F1D36] shadow-sm'
                : 'text-slate-600 hover:text-[#0F1D36]'
            }`}
          >
            All-Time High Scores
          </button>
          <button
            type="button"
            onClick={() => setBoardTab('daily')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              boardTab === 'daily'
                ? 'bg-white text-[#0F1D36] shadow-sm'
                : 'text-slate-600 hover:text-[#0F1D36]'
            }`}
          >
            Daily Basket ({todayDate})
          </button>
        </div>

        <div className="inline-flex items-center p-1 bg-slate-200/80 rounded-lg self-start">
          {(['all', 'easy', 'medium', 'hard'] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setDiffFilter(level)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors capitalize whitespace-nowrap ${
                diffFilter === level
                  ? 'bg-white text-[#0F1D36] shadow-sm'
                  : 'text-slate-600 hover:text-[#0F1D36]'
              }`}
            >
              {level === 'all' ? 'All Tiers' : level}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {error ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-[#EE1C2E] mb-2">
              Unable to load live leaderboard right now.
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Check your connection or try refreshing in a moment.
            </p>
          </div>
        ) : loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading live global rankings...
          </div>
        ) : activeRows.length === 0 ? (
          <div className="p-12 text-center">
            <Trophy className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <h3 className="font-display text-lg font-bold text-[#0F1D36] mb-1">
              No scores posted yet
            </h3>
            <p className="text-sm text-slate-500 mb-5 max-w-sm mx-auto">
              {boardTab === 'daily'
                ? `Be the first shopper on today's (${todayDate}) Daily Basket leaderboard.`
                : 'Complete a 3-round game while signed in to claim the #1 checkout spot.'}
            </p>
            <button
              type="button"
              onClick={onStartPlay}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#00539F] hover:bg-[#00407B] rounded-lg transition-colors whitespace-nowrap"
            >
              Start a Game
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F8FAFC] text-xs font-semibold text-slate-500">
                  <th className="py-3.5 pl-6 pr-3 w-16">Rank</th>
                  <th className="py-3.5 px-3">Shopper</th>
                  <th className="py-3.5 px-3">Difficulty</th>
                  <th className="py-3.5 px-3 text-right">1-Item / 3-Item / 5-Item</th>
                  <th className="py-3.5 px-3 text-right">Avg Error</th>
                  <th className="py-3.5 pl-3 pr-6 text-right">Total Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {activeRows.map((row, idx) => {
                  const rank = idx + 1;
                  const isMe = Boolean(user && row.uid === user.uid);
                  return (
                    <tr
                      key={boardTab === 'daily' ? (row as DailyLeaderboardEntryRecord).id : row.uid}
                      className={isMe ? 'bg-[#00539F]/5' : 'hover:bg-slate-50/70 transition-colors'}
                    >
                      <td className="py-3.5 pl-6 pr-3 font-mono font-bold tabular-nums">
                        {rank === 1 ? (
                          <span className="inline-flex items-center gap-1 text-amber-600">
                            <Award className="w-4 h-4" />1
                          </span>
                        ) : (
                          <span className="text-slate-600">#{rank}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-[#0F1D36]">
                        {row.displayName}
                        {isMe && (
                          <span className="ml-2 text-xs font-medium text-[#00539F]">
                            (You)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-xs text-slate-600 capitalize">
                        {row.difficulty}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-xs text-slate-500 tabular-nums">
                        {row.round1Score} / {row.round2Score} / {row.round3Score}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-xs text-slate-700 tabular-nums">
                        {row.avgErrorPct.toFixed(1)}%
                      </td>
                      <td className="py-3.5 pl-3 pr-6 text-right font-mono text-base font-bold text-[#0F1D36] tabular-nums">
                        {row.totalScore.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};
