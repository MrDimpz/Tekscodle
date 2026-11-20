import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  ArrowRight,
  LogIn,
  LogOut,
  ShoppingBasket,
  Trophy,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { CheckoutPanel } from './components/CheckoutPanel';
import { FinalReceiptView } from './components/FinalReceiptView';
import { HowToPlayView } from './components/HowToPlayView';
import { ItemCard } from './components/ItemCard';
import { LeaderboardView } from './components/LeaderboardView';
import { ProductPackVisual } from './components/ProductPackVisual';
import {
  Difficulty,
  getItemsPoolForDifficulty,
  SUPERMARKET_ITEMS,
} from './data/items';
import {
  auth,
  DailyLeaderboardEntryRecord,
  fetchUserProfile,
  LeaderboardEntryRecord,
  recordQuickPlayToProfile,
  signInWithGoogle,
  signOutPlayer,
  submitCompletedGameToFirestore,
  subscribeDailyLeaderboard,
  subscribeGlobalLeaderboard,
  updatePlayerDisplayName,
  UserProfileRecord,
} from './firebase';
import {
  buildQuickPlayRound,
  buildThreeRoundSession,
  DIFFICULTY_CONFIGS,
  getTodayUtcDate,
  RoundConfig,
  RoundResult,
  scoreRoundGuess,
} from './utils/gameLogic';
import { playScannerBeep, playTillMiss, playTillSuccess } from './utils/sound';

type NavTab = 'play' | 'leaderboard' | 'rules';
type PlayState = 'TITLE_MENU' | 'PLAYING' | 'ROUND_REVEAL' | 'GAME_OVER';
type GameMode = 'daily' | 'practice' | 'quick';

export default function App() {
  const todayDate = useMemo(() => getTodayUtcDate(), []);

  // Navigation & audio
  const [activeTab, setActiveTab] = useState<NavTab>('play');
  const [muted, setMuted] = useState<boolean>(false);

  // Firebase Auth & Leaderboard state
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfileRecord | null>(null);
  const [globalEntries, setGlobalEntries] = useState<LeaderboardEntryRecord[]>([]);
  const [dailyEntries, setDailyEntries] = useState<DailyLeaderboardEntryRecord[]>([]);
  const [lbLoading, setLbLoading] = useState<boolean>(true);
  const [lbError, setLbError] = useState<string | null>(null);

  // Game state machine
  const [playState, setPlayState] = useState<PlayState>('TITLE_MENU');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [selectedMode, setSelectedMode] = useState<'daily' | 'practice'>('daily');
  const [activeMode, setActiveMode] = useState<GameMode>('daily');
  const [rounds, setRounds] = useState<RoundConfig[]>([]);
  const [roundIndex, setRoundIndex] = useState<number>(0);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [currentReveal, setCurrentReveal] = useState<RoundResult | null>(null);

  // Score posting state
  const [postingStatus, setPostingStatus] = useState<
    'idle' | 'posting' | 'posted' | 'already-daily' | 'error'
  >('idle');
  const [isNewBest, setIsNewBest] = useState<boolean>(false);
  const [authNotice, setAuthNotice] = useState<string>('');

  // Track Firebase Auth readiness
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
      if (nextUser) {
        try {
          const prof = await fetchUserProfile(nextUser.uid);
          setProfile(prof);
        } catch {
          // Non-fatal if first login
        }
      } else {
        setProfile(null);
      }
    });
    return () => unsub();
  }, []);

  // Subscribe to live global & daily leaderboards once auth is initialized
  useEffect(() => {
    if (!authReady) return;
    setLbLoading(true);
    setLbError(null);

    let globalLoaded = false;
    let dailyLoaded = false;

    const unsubGlobal = subscribeGlobalLeaderboard(
      (entries) => {
        setGlobalEntries(entries);
        globalLoaded = true;
        if (globalLoaded && dailyLoaded) setLbLoading(false);
      },
      (err) => {
        setLbError(err.message);
        setLbLoading(false);
      }
    );

    const unsubDaily = subscribeDailyLeaderboard(
      todayDate,
      (entries) => {
        setDailyEntries(entries);
        dailyLoaded = true;
        if (globalLoaded && dailyLoaded) setLbLoading(false);
      },
      (err) => {
        setLbError(err.message);
        setLbLoading(false);
      }
    );

    return () => {
      unsubGlobal();
      unsubDaily();
    };
  }, [authReady, todayDate]);

  const handleSignIn = useCallback(async (): Promise<User | null> => {
    setAuthNotice('');
    try {
      const signedInUser = await signInWithGoogle();
      const prof = await fetchUserProfile(signedInUser.uid);
      setProfile(prof);
      return signedInUser;
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (!msg.includes('popup-closed-by-user')) {
        setAuthNotice('Sign-in was cancelled or blocked by the browser.');
      }
      return null;
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOutPlayer();
    setProfile(null);
  }, []);

  const postThreeRoundScore = useCallback(
    async (
      targetUser: User,
      completedResults: RoundResult[],
      completedMode: 'daily' | 'practice',
      completedDiff: Difficulty
    ) => {
      if (completedResults.length < 3) return;
      setPostingStatus('posting');
      try {
        const avgErr =
          completedResults.reduce((acc, r) => acc + r.absErrorPct, 0) /
          completedResults.length;
        const res = await submitCompletedGameToFirestore({
          user: targetUser,
          displayName: profile?.displayName || targetUser.displayName || 'Shopper',
          mode: completedMode,
          dailyDate: todayDate,
          difficulty: completedDiff,
          round1Score: completedResults[0].points,
          round2Score: completedResults[1].points,
          round3Score: completedResults[2].points,
          avgErrorPct: avgErr,
        });
        setIsNewBest(res.isNewBest);
        setPostingStatus(res.dailyAlreadyExisted ? 'already-daily' : 'posted');
        const refreshed = await fetchUserProfile(targetUser.uid);
        setProfile(refreshed);
      } catch {
        setPostingStatus('error');
      }
    },
    [todayDate, profile?.displayName]
  );

  // Start a full 3-round game (1 item -> 3 items -> 5 items)
  const startFullGame = useCallback(
    (modeOverride?: 'daily' | 'practice', diffOverride?: Difficulty) => {
      const modeToUse = modeOverride ?? selectedMode;
      const diffToUse = diffOverride ?? difficulty;
      const sessionRounds = buildThreeRoundSession(diffToUse, modeToUse, todayDate);
      setActiveMode(modeToUse);
      setDifficulty(diffToUse);
      setRounds(sessionRounds);
      setRoundIndex(0);
      setResults([]);
      setCurrentReveal(null);
      setPostingStatus('idle');
      setIsNewBest(false);
      setPlayState('PLAYING');
      setActiveTab('play');
      playScannerBeep(muted);
    },
    [selectedMode, difficulty, todayDate, muted]
  );

  // Instant Quick Play: immediately jumps into 1 random basket (1, 3, or 5 items)
  const startQuickPlay = useCallback(
    (diffOverride?: Difficulty) => {
      const diffToUse = diffOverride ?? difficulty;
      const previousIds = rounds[0]?.items.map((i) => i.id) ?? [];
      const quickRound = buildQuickPlayRound(diffToUse, previousIds);
      setActiveMode('quick');
      setDifficulty(diffToUse);
      setRounds([quickRound]);
      setRoundIndex(0);
      setResults([]);
      setCurrentReveal(null);
      setPostingStatus('idle');
      setPlayState('PLAYING');
      setActiveTab('play');
      playScannerBeep(muted);
    },
    [difficulty, muted, rounds]
  );

  const handleSubmitGuess = useCallback(
    async (guessPence: number) => {
      const activeRound = rounds[roundIndex];
      if (!activeRound) return;

      const result = scoreRoundGuess(activeRound, guessPence, difficulty);
      setCurrentReveal(result);
      setResults((prev) => [...prev, result]);
      setPlayState('ROUND_REVEAL');

      if (result.inZone) {
        playTillSuccess(muted, result.diffPence === 0);
      } else {
        playTillMiss(muted);
      }

      if (activeMode === 'quick' && user) {
        try {
          await recordQuickPlayToProfile(
            user,
            profile?.displayName || user.displayName || 'Shopper',
            result.points
          );
          const refreshed = await fetchUserProfile(user.uid);
          setProfile(refreshed);
        } catch {
          // Keep gameplay flowing seamlessly
        }
      }
    },
    [rounds, roundIndex, difficulty, muted, activeMode, user, profile?.displayName]
  );

  const handleNextRound = useCallback(async () => {
    if (roundIndex + 1 < rounds.length) {
      setRoundIndex((prev) => prev + 1);
      setCurrentReveal(null);
      setPlayState('PLAYING');
      playScannerBeep(muted);
    } else {
      setCurrentReveal(null);
      setPlayState('GAME_OVER');
      if (user && (activeMode === 'daily' || activeMode === 'practice')) {
        await postThreeRoundScore(user, results, activeMode, difficulty);
      }
    }
  }, [
    roundIndex,
    rounds.length,
    muted,
    user,
    activeMode,
    results,
    difficulty,
    postThreeRoundScore,
  ]);

  const handleSignInAndPost = useCallback(async () => {
    const signedIn = await handleSignIn();
    if (signedIn && (activeMode === 'daily' || activeMode === 'practice')) {
      await postThreeRoundScore(signedIn, results, activeMode, difficulty);
    }
  }, [handleSignIn, activeMode, results, difficulty, postThreeRoundScore]);

  const handleUpdateDisplayName = useCallback(
    async (newName: string) => {
      if (!user) return;
      await updatePlayerDisplayName(user, newName);
      const refreshed = await fetchUserProfile(user.uid);
      setProfile(refreshed);
    },
    [user]
  );

  const activeDifficultyCfg = DIFFICULTY_CONFIGS[difficulty];
  const activePool = useMemo(
    () => getItemsPoolForDifficulty(difficulty),
    [difficulty]
  );
  const previewItems = useMemo(() => {
    // Showcase 3 varied items from the active difficulty pool (preferring studio photos for hero clarity)
    const photographed = activePool.filter((item) => Boolean(item.image));
    const source = photographed.length >= 3 ? photographed : activePool;
    if (source.length <= 3) return source;
    const mid = Math.floor(source.length / 2);
    return [source[0], source[mid], source[source.length - 1]];
  }, [activePool]);
  const totalCatalogCount = SUPERMARKET_ITEMS.length;
  const totalAisleCount = useMemo(
    () => new Set(SUPERMARKET_ITEMS.map((item) => item.aisle)).size,
    []
  );

  const currentRound = rounds[roundIndex];
  const cumulativeScore = results.reduce((sum, r) => sum + r.points, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9] text-[#0F1D36]">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-element Brand Wordmark */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('play');
              setPlayState('TITLE_MENU');
            }}
            className="text-left whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00539F] rounded"
          >
            <span className="block font-display text-2xl font-extrabold tracking-tight leading-none text-[#EE1C2E]">
              TEKSCO<span className="text-[#00539F]">dle</span>
            </span>
            <span className="block h-1 w-full mt-0.5 teksco-chevrons rounded-xs" />
          </button>

          {/* Zone 2: Concise single-line text nav links */}
          <nav
            aria-label="Primary navigation"
            className="flex items-center gap-5 sm:gap-7 text-sm font-semibold overflow-x-auto"
          >
            <button
              type="button"
              onClick={() => setActiveTab('play')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                activeTab === 'play' && activeMode !== 'quick'
                  ? 'border-[#00539F] text-[#00539F]'
                  : 'border-transparent text-slate-600 hover:text-[#0F1D36]'
              }`}
            >
              Play
            </button>
            <button
              type="button"
              onClick={() => startQuickPlay()}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                activeTab === 'play' &&
                activeMode === 'quick' &&
                playState !== 'TITLE_MENU'
                  ? 'border-[#00539F] text-[#00539F]'
                  : 'border-transparent text-slate-600 hover:text-[#0F1D36]'
              }`}
            >
              Quick Play
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('leaderboard')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                activeTab === 'leaderboard'
                  ? 'border-[#00539F] text-[#00539F]'
                  : 'border-transparent text-slate-600 hover:text-[#0F1D36]'
              }`}
            >
              Leaderboard
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('rules')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                activeTab === 'rules'
                  ? 'border-[#00539F] text-[#00539F]'
                  : 'border-transparent text-slate-600 hover:text-[#0F1D36]'
              }`}
            >
              How to Play
            </button>
          </nav>

          {/* Zone 3: Single Primary Account Action */}
          <div className="shrink-0">
            {user ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="px-4 py-2 text-xs font-semibold text-[#0F1D36] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <span className="hidden sm:inline max-w-[110px] truncate">
                  {profile?.displayName || user.displayName || 'Shopper'}
                </span>
                <LogOut className="w-3.5 h-3.5 text-slate-500" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSignIn}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#00539F] hover:bg-[#00407B] rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {authNotice && (
          <div className="mb-6 bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 flex items-center justify-between">
            <span>{authNotice}</span>
            <button
              type="button"
              onClick={() => setAuthNotice('')}
              className="text-xs font-semibold text-[#00539F] hover:underline ml-4 whitespace-nowrap"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* TAB 1: LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <LeaderboardView
            user={user}
            profile={profile}
            globalEntries={globalEntries}
            dailyEntries={dailyEntries}
            todayDate={todayDate}
            loading={lbLoading}
            error={lbError}
            onSignIn={handleSignIn}
            onUpdateDisplayName={handleUpdateDisplayName}
            onStartPlay={() => {
              setActiveTab('play');
              if (playState === 'GAME_OVER') setPlayState('TITLE_MENU');
            }}
          />
        )}

        {/* TAB 2: HOW TO PLAY */}
        {activeTab === 'rules' && (
          <HowToPlayView
            onStartPlay={() => startFullGame()}
            onQuickPlay={() => startQuickPlay()}
          />
        )}

        {/* TAB 3: PLAY (TITLE MENU / ACTIVE PLAY / FINAL RECEIPT) */}
        {activeTab === 'play' && playState === 'TITLE_MENU' && (
          <div className="space-y-8">
            {/* Hero 2-Column Split */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Left Column: Setup & Primary Actions */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col justify-between gap-6">
                <div>
                  <div className="flex items-center flex-wrap gap-2 text-xs font-semibold text-[#00539F] mb-2">
                    <span>UK Supermarket Checkout Challenge</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-500 font-normal">
                      {totalCatalogCount} Products across {totalAisleCount} Aisles
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-500 font-normal">
                      Daily {todayDate}
                    </span>
                  </div>

                  <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-[#0F1D36] tracking-tight leading-[1.1] text-balance mb-4">
                    Price the basket before the till rings.
                  </h1>

                  <p className="text-base text-slate-600 leading-relaxed max-w-xl">
                    Guess real UK supermarket prices across <strong>1 item</strong>,{' '}
                    <strong>3 items</strong>, and <strong>5 items</strong>. Land within the
                    accuracy margin to score points—the closer your guess, the higher you
                    climb on the global leaderboard.
                  </p>
                </div>

                {/* Difficulty Selector */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-[#0F1D36]">
                        Select Difficulty
                      </span>
                      <span className="text-xs font-mono text-slate-500 tabular-nums">
                        ±{activeDifficultyCfg.marginPct}% margin · Up to{' '}
                        {activeDifficultyCfg.maxTotalPoints.toLocaleString()} pts
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-lg">
                      {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => {
                        const cfg = DIFFICULTY_CONFIGS[level];
                        const isActive = difficulty === level;
                        return (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setDifficulty(level)}
                            className={`py-2.5 px-3 rounded-md text-left transition-colors ${
                              isActive
                                ? 'bg-white text-[#0F1D36] shadow-sm'
                                : 'text-slate-600 hover:text-[#0F1D36]'
                            }`}
                          >
                            <div className="text-sm font-bold leading-tight">
                              {cfg.label}
                            </div>
                            <div className="text-[11px] font-mono text-slate-500 mt-0.5 tabular-nums">
                              ±{cfg.marginPct}% · {cfg.subtitle}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      {activeDifficultyCfg.poolDescription}
                    </p>
                  </div>

                  {/* Mode Selector: Daily vs Practice */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                    <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg self-start">
                      <button
                        type="button"
                        onClick={() => setSelectedMode('daily')}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                          selectedMode === 'daily'
                            ? 'bg-white text-[#0F1D36] shadow-sm'
                            : 'text-slate-600 hover:text-[#0F1D36]'
                        }`}
                      >
                        Daily Basket
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedMode('practice')}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                          selectedMode === 'practice'
                            ? 'bg-white text-[#0F1D36] shadow-sm'
                            : 'text-slate-600 hover:text-[#0F1D36]'
                        }`}
                      >
                        Endless Practice
                      </button>
                    </div>
                    <span className="text-xs text-slate-500">
                      {selectedMode === 'daily'
                        ? 'Same 9 items for everyone worldwide today.'
                        : 'Freshly shuffled 1, 3 & 5 item baskets every run.'}
                    </span>
                  </div>

                  {/* Primary Action Row */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => startFullGame()}
                      className="flex-1 py-3.5 px-6 bg-[#00539F] hover:bg-[#00407B] text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <span>
                        Start {selectedMode === 'daily' ? 'Daily Basket' : '3-Round Game'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => startQuickPlay()}
                      className="py-3.5 px-5 bg-[#FFD100] hover:bg-[#F2C600] text-[#0F1D36] font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Quick Play</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Difficulty Shelf Preview */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between gap-5">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                    <span className="font-semibold text-[#0F1D36]">
                      Sample {activeDifficultyCfg.label} Aisle ({activePool.length} items)
                    </span>
                    <span className="font-mono">Prices hidden until checkout</span>
                  </div>

                  <div className="space-y-3">
                    {previewItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-2.5 bg-[#F8FAFC] rounded-lg border border-slate-100"
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            className={
                              item.image.startsWith('/src/assets/images/catalog/')
                                ? 'w-20 h-16 object-contain rounded-md bg-white border border-slate-100 p-1 shrink-0'
                                : 'w-20 h-16 object-cover rounded-md bg-slate-200 shrink-0'
                            }
                          />
                        ) : (
                          <div className="w-20 h-16 rounded-md overflow-hidden bg-[#EEF2F6] shrink-0">
                            <ProductPackVisual item={item} compact />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-xs text-slate-500 truncate">
                            {item.aisle} · {item.packSize}
                          </div>
                          <div className="font-display font-bold text-sm text-[#0F1D36] truncate">
                            {item.name}
                          </div>
                        </div>
                        <span className="font-mono text-xs font-bold text-slate-400 pr-1 shrink-0">
                          £?.??
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3-Round Escalation Summary */}
                <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-3 text-center">
                  <div className="bg-[#F8FAFC] rounded-lg py-2.5 px-2">
                    <div className="text-[11px] text-slate-500">Round 1</div>
                    <div className="font-display font-bold text-sm text-[#0F1D36]">
                      1 Item
                    </div>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-lg py-2.5 px-2">
                    <div className="text-[11px] text-slate-500">Round 2</div>
                    <div className="font-display font-bold text-sm text-[#0F1D36]">
                      3 Items
                    </div>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-lg py-2.5 px-2">
                    <div className="text-[11px] text-slate-500">Round 3</div>
                    <div className="font-display font-bold text-sm text-[#0F1D36]">
                      5 Items
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Full-Width Live Top Shoppers Strip below Hero */}
            <section className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <Trophy className="w-4 h-4 text-[#00539F]" />
                  <h2 className="font-display text-lg font-bold text-[#0F1D36]">
                    Top Checkout Shoppers
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('leaderboard')}
                  className="text-xs font-semibold text-[#00539F] hover:underline self-start sm:self-auto whitespace-nowrap"
                >
                  Open Full Leaderboard
                </button>
              </div>

              {globalEntries.length === 0 ? (
                <p className="text-sm text-slate-500">
                  {lbLoading
                    ? 'Loading live global rankings...'
                    : 'No global scores posted yet—complete a 3-round basket to set the benchmark.'}
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {globalEntries.slice(0, 3).map((entry, idx) => (
                    <div
                      key={entry.uid}
                      className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-lg border border-slate-100"
                    >
                      <div className="min-w-0 pr-3">
                        <div className="text-xs text-slate-500">
                          Rank #{idx + 1} ·{' '}
                          <span className="capitalize">{entry.difficulty}</span>
                        </div>
                        <div className="font-display font-bold text-[#0F1D36] truncate">
                          {entry.displayName}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono text-lg font-bold text-[#00539F] tabular-nums">
                          {entry.totalScore.toLocaleString()}
                        </div>
                        <div className="font-mono text-[11px] text-slate-500 tabular-nums">
                          {entry.avgErrorPct.toFixed(1)}% avg err
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ACTIVE PLAY & ROUND REVEAL */}
        {activeTab === 'play' &&
          (playState === 'PLAYING' || playState === 'ROUND_REVEAL') &&
          currentRound && (
            <div className="space-y-6">
              {/* Unobtrusive Top Workspace HUD Bar */}
              <div className="bg-white border border-slate-200 rounded-xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <ShoppingBasket className="w-4 h-4 text-[#00539F] shrink-0" />
                  <span className="font-display font-bold text-sm text-[#0F1D36]">
                    {activeMode === 'quick'
                      ? 'Quick Play'
                      : activeMode === 'daily'
                        ? `Daily Basket · ${todayDate}`
                        : 'Practice Shop'}
                  </span>
                  <span className="text-slate-300" aria-hidden="true">
                    /
                  </span>
                  <span className="text-xs font-semibold text-slate-600">
                    {activeDifficultyCfg.label} (±{activeDifficultyCfg.marginPct}%)
                  </span>
                </div>

                {/* Round Stepper (for 3-round game) or Difficulty Quick Switch (for Quick Play) */}
                {activeMode !== 'quick' ? (
                  <div className="flex items-center gap-4 text-xs font-mono tabular-nums">
                    {[1, 3, 5].map((cnt, idx) => {
                      const done = idx < results.length && !(idx === roundIndex && playState === 'ROUND_REVEAL');
                      const isCurrent = idx === roundIndex;
                      return (
                        <span
                          key={cnt}
                          className={
                            isCurrent
                              ? 'font-bold text-[#00539F]'
                              : done
                                ? 'text-emerald-700 font-semibold'
                                : 'text-slate-400'
                          }
                        >
                          R{idx + 1}: {cnt} {cnt === 1 ? 'Item' : 'Items'}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-md">
                    {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => startQuickPlay(level)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded capitalize transition-colors whitespace-nowrap ${
                          difficulty === level
                            ? 'bg-white text-[#0F1D36] shadow-xs'
                            : 'text-slate-500 hover:text-[#0F1D36]'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                )}

                {/* Audio Mute & Back to Lobby */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMuted((m) => !m)}
                    aria-label={muted ? 'Unmute till sounds' : 'Mute till sounds'}
                    className="p-2 text-slate-500 hover:text-[#0F1D36] rounded-md hover:bg-slate-100 transition-colors"
                  >
                    {muted ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlayState('TITLE_MENU')}
                    className="text-xs font-semibold text-slate-600 hover:text-[#0F1D36] whitespace-nowrap"
                  >
                    Change Setup
                  </button>
                </div>
              </div>

              {/* 12-Column Play Arena: Basket Items (8 cols) + Checkout Till (4 cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <div>
                      <h1 className="font-display text-2xl font-bold text-[#0F1D36]">
                        {currentRound.title}
                      </h1>
                      <p className="text-sm text-slate-600">
                        {currentRound.itemCount === 1
                          ? 'Inspect the product, pack size, and aisle note, then estimate its exact UK shelf price.'
                          : `Estimate the combined checkout total for all ${currentRound.itemCount} items in this basket.`}
                      </p>
                    </div>
                  </div>

                  {/* Dynamic Basket Grid: 1 featured, 3 clean grid, or 5 balanced grid */}
                  <div
                    className={
                      currentRound.itemCount === 1
                        ? 'grid grid-cols-1 gap-5'
                        : currentRound.itemCount === 3
                          ? 'grid grid-cols-1 sm:grid-cols-3 gap-4'
                          : 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
                    }
                  >
                    {currentRound.items.map((item, idx) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        index={idx}
                        totalInBasket={currentRound.itemCount}
                        revealed={playState === 'ROUND_REVEAL'}
                      />
                    ))}
                  </div>
                </div>

                {/* Sticky Checkout Till Panel */}
                <div className="lg:col-span-4 lg:sticky lg:top-24">
                  <CheckoutPanel
                    round={currentRound}
                    roundIndex={roundIndex}
                    totalRounds={rounds.length}
                    difficulty={difficulty}
                    mode={activeMode}
                    cumulativeScore={cumulativeScore}
                    revealedResult={currentReveal}
                    onSubmitGuess={handleSubmitGuess}
                    onNextRound={handleNextRound}
                    onNextQuickPlay={() => startQuickPlay()}
                    onSwitchToFullGame={() => startFullGame('daily')}
                  />
                </div>
              </div>
            </div>
          )}

        {/* FINAL RECEIPT VIEW */}
        {activeTab === 'play' &&
          playState === 'GAME_OVER' &&
          (activeMode === 'daily' || activeMode === 'practice') && (
            <FinalReceiptView
              results={results}
              difficulty={difficulty}
              mode={activeMode}
              dailyDate={todayDate}
              user={user}
              postingStatus={postingStatus}
              isNewBest={isNewBest}
              onSignInAndPost={handleSignInAndPost}
              onPlayAgain={() => startFullGame('practice')}
              onQuickPlay={() => startQuickPlay()}
              onViewLeaderboard={() => setActiveTab('leaderboard')}
            />
          )}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            TEKSCOdle — Independent UK supermarket price-guessing parody game. Prices reflect typical UK retail benchmarks.
          </span>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setActiveTab('rules')}
              className="hover:text-[#0F1D36] transition-colors whitespace-nowrap"
            >
              Scoring Rules
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('leaderboard')}
              className="hover:text-[#0F1D36] transition-colors whitespace-nowrap"
            >
              Global Rankings
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
