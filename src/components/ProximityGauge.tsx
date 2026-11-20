import React from 'react';
import { RoundResult, formatGBP } from '../utils/gameLogic';

interface ProximityGaugeProps {
  result: RoundResult;
}

export const ProximityGauge: React.FC<ProximityGaugeProps> = ({ result }) => {
  // Visual scale spans -25% to +25% around the actual till total
  const spanPct = Math.max(25, result.marginPct * 2);
  const signedPct =
    result.actualTotalPence > 0
      ? ((result.guessPence - result.actualTotalPence) / result.actualTotalPence) * 100
      : 0;

  const clampedSigned = Math.max(-spanPct, Math.min(spanPct, signedPct));
  const markerLeftPct = ((clampedSigned + spanPct) / (spanPct * 2)) * 100;

  const zoneWidthPct = ((result.marginPct * 2) / (spanPct * 2)) * 100;
  const zoneLeftPct = 50 - zoneWidthPct / 2;

  const directionText =
    result.diffPence === 0
      ? 'Spot on to the penny'
      : result.diffPence > 0
        ? `${formatGBP(result.diffPence)} too high (+${result.absErrorPct.toFixed(1)}%)`
        : `${formatGBP(Math.abs(result.diffPence))} too low (-${result.absErrorPct.toFixed(1)}%)`;

  return (
    <div className="py-3">
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="font-semibold text-[#0F1D36]">
          {result.ratingLabel}
        </span>
        <span
          className={`font-mono font-semibold tabular-nums ${
            result.diffPence === 0
              ? 'text-[#00539F]'
              : result.inZone
                ? 'text-emerald-700'
                : 'text-[#EE1C2E]'
          }`}
        >
          {directionText}
        </span>
      </div>

      {/* Horizontal accuracy track */}
      <div className="relative h-7 flex items-center">
        {/* Base rail */}
        <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden relative">
          {/* Scoring zone band */}
          <div
            className="absolute top-0 bottom-0 bg-[#00539F]/20 border-x border-[#00539F]/50"
            style={{ left: `${zoneLeftPct}%`, width: `${zoneWidthPct}%` }}
          />
          {/* Exact bullseye center line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-[#0F1D36]"
            style={{ left: '50%' }}
          />
        </div>

        {/* Player guess marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-transform duration-200"
          style={{ left: `${markerLeftPct}%` }}
          title={`Your guess: ${formatGBP(result.guessPence)}`}
        >
          <div
            className={`w-4 h-4 rounded-full border-2 border-white shadow-sm ${
              result.diffPence === 0
                ? 'bg-[#FFD100] ring-2 ring-[#0F1D36]'
                : result.inZone
                  ? 'bg-emerald-600'
                  : 'bg-[#EE1C2E]'
            }`}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 tabular-nums mt-1">
        <span>-{result.marginPct}% cutoff</span>
        <span className="font-semibold text-[#0F1D36]">
          Actual {formatGBP(result.actualTotalPence)}
        </span>
        <span>+{result.marginPct}% cutoff</span>
      </div>
    </div>
  );
};
