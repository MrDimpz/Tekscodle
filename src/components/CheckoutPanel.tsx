import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, RotateCcw, Zap } from 'lucide-react';
import { Difficulty } from '../data/items';
import {
  DIFFICULTY_CONFIGS,
  RoundConfig,
  RoundResult,
  formatGBP,
} from '../utils/gameLogic';
import { ProximityGauge } from './ProximityGauge';

interface CheckoutPanelProps {
  round: RoundConfig;
  roundIndex: number;
  totalRounds: number;
  difficulty: Difficulty;
  mode: 'daily' | 'practice' | 'quick';
  cumulativeScore: number;
  revealedResult: RoundResult | null;
  onSubmitGuess: (guessPence: number) => void;
  onNextRound: () => void;
  onNextQuickPlay: () => void;
  onSwitchToFullGame: () => void;
}

export const CheckoutPanel: React.FC<CheckoutPanelProps> = ({
  round,
  roundIndex,
  totalRounds,
  difficulty,
  mode,
  cumulativeScore,
  revealedResult,
  onSubmitGuess,
  onNextRound,
  onNextQuickPlay,
  onSwitchToFullGame,
}) => {
  const cfg = DIFFICULTY_CONFIGS[difficulty];
  // Reasonable slider ceiling based on basket size so the slider stays ergonomic
  const sliderMaxPence =
    round.itemCount === 1
      ? Math.max(1500, Math.ceil((round.actualTotalPence * 1.8) / 100) * 100)
      : round.itemCount === 3
        ? Math.max(2500, Math.ceil((round.actualTotalPence * 1.7) / 100) * 100)
        : Math.max(3500, Math.ceil((round.actualTotalPence * 1.6) / 100) * 100);

  const defaultGuessPence = round.itemCount === 1 ? 200 : round.itemCount === 3 ? 650 : 1200;

  const [inputValue, setInputValue] = useState<string>((defaultGuessPence / 100).toFixed(2));
  const [inputError, setInputError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue((defaultGuessPence / 100).toFixed(2));
    setInputError('');
    // Focus input smoothly on new round
    const timer = window.setTimeout(() => {
      if (!revealedResult && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 60);
    return () => window.clearTimeout(timer);
  }, [round, defaultGuessPence, revealedResult]);

  const parsedPence = (() => {
    const cleaned = inputValue.replace(/[^0-9.]/g, '');
    const num = parseFloat(cleaned);
    if (Number.isNaN(num) || num < 0) return 0;
    return Math.round(num * 100);
  })();

  const handleNudge = (deltaPence: number) => {
    const next = Math.max(5, Math.min(99999, parsedPence + deltaPence));
    setInputValue((next / 100).toFixed(2));
    setInputError('');
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pence = Number(e.target.value);
    setInputValue((pence / 100).toFixed(2));
    setInputError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedPence <= 0) {
      setInputError('Enter a valid basket price above £0.00.');
      return;
    }
    setInputError('');
    onSubmitGuess(parsedPence);
  };

  // --- REVEALED STATE: Thermal Supermarket Till Receipt ---
  if (revealedResult) {
    const isFinalRound = roundIndex + 1 >= totalRounds;
    const nextCount = roundIndex === 0 ? 3 : 5;

    return (
      <aside className="bg-white border border-slate-200 rounded-t-xl receipt-serrated shadow-sm">
        {/* Receipt header */}
        <div className="px-6 py-5 border-b border-dashed border-slate-300">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>TEKSCOdle Till Receipt</span>
            <span className="font-mono tabular-nums">
              {mode === 'quick'
                ? 'Quick Play'
                : `Round ${roundIndex + 1} of ${totalRounds}`}
            </span>
          </div>
          <h2 className="font-display text-xl font-bold text-[#0F1D36]">
            {revealedResult.title}
          </h2>
        </div>

        {/* Itemised till breakdown */}
        <div className="px-6 py-4 border-b border-dashed border-slate-300 space-y-2">
          {revealedResult.items.map((item) => (
            <div
              key={item.id}
              className="flex items-baseline justify-between gap-3 text-sm"
            >
              <span className="text-slate-700 truncate">
                {item.name}{' '}
                <span className="text-xs text-slate-400">({item.packSize})</span>
              </span>
              <span className="font-mono font-semibold text-[#0F1D36] tabular-nums shrink-0">
                {formatGBP(item.pricePence)}
              </span>
            </div>
          ))}
        </div>

        {/* Totals comparison */}
        <div className="px-6 py-4 border-b border-dashed border-slate-300 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Your Basket Guess</span>
            <span className="font-mono font-semibold text-slate-800 tabular-nums">
              {formatGBP(revealedResult.guessPence)}
            </span>
          </div>
          <div className="flex items-center justify-between text-base">
            <span className="font-semibold text-[#0F1D36]">Actual Basket Total</span>
            <span className="font-mono text-lg font-bold text-[#0F1D36] tabular-nums">
              {formatGBP(revealedResult.actualTotalPence)}
            </span>
          </div>

          <ProximityGauge result={revealedResult} />
        </div>

        {/* Points Awarded Block */}
        <div className="px-6 py-5 bg-[#F8FAFC]">
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="text-xs text-slate-500">Points Earned</div>
              <div
                className={`font-mono text-3xl font-bold tabular-nums leading-none mt-1 ${
                  revealedResult.inZone ? 'text-[#00539F]' : 'text-slate-400'
                }`}
              >
                +{revealedResult.points.toLocaleString()}
                <span className="text-sm font-medium text-slate-400 ml-1">
                  / {revealedResult.maxPoints.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">
                {mode === 'quick' ? 'Margin Rule' : 'Session Total'}
              </div>
              <div className="font-mono text-base font-bold text-[#0F1D36] tabular-nums mt-1">
                {mode === 'quick'
                  ? `±${revealedResult.marginPct}%`
                  : `${cumulativeScore.toLocaleString()} pts`}
              </div>
            </div>
          </div>

          {mode === 'quick' ? (
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={onNextQuickPlay}
                className="w-full py-3 px-4 bg-[#00539F] hover:bg-[#00407B] text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Zap className="w-4 h-4" />
                <span>Next Quick Basket</span>
              </button>
              <button
                type="button"
                onClick={onSwitchToFullGame}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-[#0F1D36] border border-slate-200 font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play 3-Round Challenge</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onNextRound}
              className="w-full py-3 px-4 bg-[#00539F] hover:bg-[#00407B] text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <span>
                {isFinalRound
                  ? 'View Final Receipt'
                  : `Continue to Round ${roundIndex + 2} (${nextCount} Items)`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>
    );
  }

  // --- ACTIVE PLAY STATE: Checkout Till Price Entry ---
  return (
    <aside className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Dark navy digital till screen header */}
      <div className="bg-[#0F1D36] text-white px-6 py-5">
        <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
          <span>
            {mode === 'quick'
              ? 'Quick Play Till'
              : `Round ${roundIndex + 1} of ${totalRounds}`}
          </span>
          <span className="font-mono tabular-nums text-[#FFD100]">
            {cfg.label} · ±{cfg.marginPct}% zone
          </span>
        </div>
        <h2 className="font-display text-xl font-bold tracking-tight">
          {round.itemCount === 1
            ? 'Guess the item price'
            : `Guess the ${round.itemCount}-item total`}
        </h2>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
          Score starts at {cfg.marginPct}% away ({cfg.minZonePoints} pts) and climbs to{' '}
          {cfg.maxRoundPoints.toLocaleString()} pts for an exact hit.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div>
          <label
            htmlFor="basket-guess-input"
            className="block text-xs font-semibold text-slate-600 mb-2"
          >
            Your Total Estimate (GBP)
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-4 font-mono text-2xl font-bold text-slate-400 select-none">
              £
            </span>
            <input
              ref={inputRef}
              id="basket-guess-input"
              type="text"
              inputMode="decimal"
              value={inputValue}
              onChange={(e) => {
                const raw = e.target.value;
                if (/^[0-9]*\.?[0-9]{0,2}$/.test(raw)) {
                  setInputValue(raw);
                  setInputError('');
                }
              }}
              placeholder="0.00"
              className="w-full pl-10 pr-4 py-3.5 font-mono text-3xl font-bold text-[#0F1D36] tabular-nums bg-[#F8FAFC] border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00539F] focus:border-[#00539F] transition-colors"
            />
          </div>
          {inputError && (
            <p className="text-xs text-[#EE1C2E] font-medium mt-1.5">{inputError}</p>
          )}
        </div>

        {/* Tactile price slider */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono tabular-nums mb-1.5">
            <span>£0.25</span>
            <span>Slide to adjust</span>
            <span>{formatGBP(sliderMaxPence)}</span>
          </div>
          <input
            type="range"
            min={25}
            max={sliderMaxPence}
            step={5}
            value={Math.min(sliderMaxPence, Math.max(25, parsedPence))}
            onChange={handleSliderChange}
            aria-label="Adjust basket price estimate"
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00539F]"
          />
        </div>

        {/* Quick coin/note nudge buttons */}
        <div className="grid grid-cols-3 gap-2">
          {[-100, -25, -5, 5, 25, 100].map((delta) => {
            const label =
              delta < 0
                ? delta <= -100
                  ? `-£${Math.abs(delta) / 100}`
                  : `-${Math.abs(delta)}p`
                : delta >= 100
                  ? `+£${delta / 100}`
                  : `+${delta}p`;
            return (
              <button
                key={delta}
                type="button"
                onClick={() => handleNudge(delta)}
                className="py-2 px-2 text-xs font-mono font-semibold tabular-nums text-[#0F1D36] bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap"
              >
                {label}
              </button>
            );
          })}
        </div>

        <button
          type="submit"
          className="w-full py-3.5 px-4 bg-[#00539F] hover:bg-[#00407B] text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <Check className="w-4 h-4" />
          <span>Submit Guess</span>
        </button>

        {/* Session score footer inside console */}
        {mode !== 'quick' && (
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Current Session Score</span>
            <span className="font-mono font-bold text-[#0F1D36] tabular-nums">
              {cumulativeScore.toLocaleString()} / {cfg.maxTotalPoints.toLocaleString()} pts
            </span>
          </div>
        )}
      </form>
    </aside>
  );
};
