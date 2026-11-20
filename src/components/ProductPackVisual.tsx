import React from 'react';
import { PackShape, SupermarketItem } from '../data/items';

interface ProductPackVisualProps {
  item: SupermarketItem;
  compact?: boolean;
}

const ACCENT_PALETTES: Record<
  string,
  { primary: string; secondary: string; text: string; foil?: string }
> = {
  blue: { primary: '#00539F', secondary: '#E8F1FA', text: '#FFFFFF', foil: '#FFD100' },
  red: { primary: '#C81E2B', secondary: '#FDF2F2', text: '#FFFFFF', foil: '#FDE68A' },
  green: { primary: '#1E6B43', secondary: '#ECFDF3', text: '#FFFFFF', foil: '#D1FAE5' },
  finest: { primary: '#181E29', secondary: '#262F40', text: '#F8FAFC', foil: '#D9B45B' },
  amber: { primary: '#B45309', secondary: '#FEF3C7', text: '#FFFFFF', foil: '#FDE68A' },
  teal: { primary: '#0F766E', secondary: '#CCFBF1', text: '#FFFFFF', foil: '#99F6E4' },
  burgundy: { primary: '#7F1D1D', secondary: '#FEE2E2', text: '#FFFFFF', foil: '#E5C07B' },
  purple: { primary: '#5B21B6', secondary: '#EDE9FE', text: '#FFFFFF', foil: '#FDE68A' },
  kraft: { primary: '#8C6239', secondary: '#F5EBD9', text: '#FFFBF5', foil: '#E6CFA8' },
  slate: { primary: '#334155', secondary: '#F1F5F9', text: '#FFFFFF', foil: '#CBD5E1' },
  orange: { primary: '#C2410C', secondary: '#FFEDD5', text: '#FFFFFF', foil: '#FED7AA' },
  navy: { primary: '#0F1D36', secondary: '#E2E8F0', text: '#FFFFFF', foil: '#FFD100' },
};

function renderSilhouette(
  shape: PackShape,
  primary: string,
  secondary: string,
  foil: string
) {
  switch (shape) {
    case 'bottle':
      return (
        <g>
          {/* Cap */}
          <rect x="116" y="22" width="28" height="14" rx="3" fill="#1E293B" />
          {/* Neck */}
          <path d="M119 36 L141 36 L144 62 L116 62 Z" fill={primary} opacity="0.92" />
          {/* Body */}
          <path
            d="M116 62 C95 72 92 86 92 104 L92 198 C92 206 98 212 106 212 L154 212 C162 212 168 206 168 198 L168 104 C168 86 165 72 144 62 Z"
            fill={primary}
          />
          {/* Specular glass highlight */}
          <path
            d="M104 98 L104 196"
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.22"
          />
          {/* Front label */}
          <rect x="97" y="102" width="66" height="82" rx="4" fill="#FFFFFF" />
          <rect x="97" y="102" width="66" height="12" rx="2" fill={foil} />
          <rect x="103" y="122" width="54" height="5" rx="2" fill={primary} opacity="0.85" />
          <rect x="108" y="132" width="44" height="4" rx="2" fill="#94A3B8" />
          <rect x="105" y="168" width="50" height="8" rx="2" fill={secondary} />
        </g>
      );

    case 'carton':
      return (
        <g>
          {/* Gable top */}
          <polygon points="88,68 130,36 172,68" fill={secondary} stroke={primary} strokeWidth="2" />
          <rect x="118" y="28" width="24" height="10" rx="2" fill={primary} />
          {/* Cap */}
          <ellipse cx="148" cy="54" rx="10" ry="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
          {/* Carton face */}
          <rect x="88" y="68" width="84" height="142" rx="4" fill={primary} />
          {/* Side fold shadow */}
          <rect x="156" y="68" width="16" height="142" fill="#000000" opacity="0.14" />
          {/* Label panel */}
          <rect x="95" y="88" width="56" height="96" rx="4" fill="#FFFFFF" />
          <rect x="95" y="88" width="56" height="14" rx="2" fill={foil} />
          <circle cx="123" cy="144" r="18" fill={secondary} />
          <circle cx="123" cy="144" r="10" fill={primary} opacity="0.85" />
        </g>
      );

    case 'tin':
      return (
        <g>
          {/* Metal rim top */}
          <ellipse cx="130" cy="64" rx="46" ry="11" fill="#CBD5E1" />
          <ellipse cx="130" cy="64" rx="38" ry="7" fill="#E2E8F0" />
          {/* Pull tab */}
          <ellipse cx="136" cy="63" rx="9" ry="4" fill="none" stroke="#94A3B8" strokeWidth="2" />
          {/* Tin cylinder */}
          <path
            d="M84 64 L84 194 C84 202 104 208 130 208 C156 208 176 202 176 194 L176 64 Z"
            fill={primary}
          />
          {/* Label wrap */}
          <path
            d="M84 82 L84 184 C84 191 104 196 130 196 C156 196 176 191 176 184 L176 82 Z"
            fill={primary}
          />
          <rect x="94" y="96" width="72" height="72" rx="6" fill="#FFFFFF" />
          <rect x="94" y="96" width="72" height="14" rx="3" fill={foil} />
          <circle cx="130" cy="142" r="16" fill={secondary} />
          {/* Metallic shine */}
          <rect x="92" y="72" width="8" height="122" fill="#FFFFFF" opacity="0.18" />
        </g>
      );

    case 'jar':
      return (
        <g>
          {/* Lid */}
          <rect x="92" y="42" width="76" height="22" rx="5" fill="#1E293B" />
          <rect x="92" y="57" width="76" height="5" fill={foil} opacity="0.85" />
          {/* Glass shoulder & body */}
          <path
            d="M96 64 L164 64 L174 84 L174 196 C174 205 166 210 156 210 L104 210 C94 210 86 205 86 196 L86 84 Z"
            fill={primary}
          />
          {/* Specular glass reflection */}
          <path
            d="M96 86 L96 194"
            stroke="#FFFFFF"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.24"
          />
          {/* Front label */}
          <rect x="96" y="102" width="68" height="76" rx="5" fill="#FFFDF7" />
          <rect x="102" y="109" width="56" height="62" rx="3" fill="none" stroke={foil} strokeWidth="1.5" />
          <rect x="108" y="122" width="44" height="6" rx="2" fill={primary} />
          <rect x="114" y="134" width="32" height="4" rx="2" fill="#94A3B8" />
          <rect x="112" y="152" width="36" height="10" rx="2" fill={secondary} />
        </g>
      );

    case 'box':
      return (
        <g>
          {/* Box front */}
          <rect x="68" y="40" width="110" height="168" rx="5" fill={primary} />
          {/* Side 3D edge */}
          <polygon points="178,40 196,50 196,198 178,208" fill="#000000" opacity="0.22" />
          <polygon points="178,40 196,50 196,198 178,208" fill={primary} opacity="0.72" />
          {/* Inner graphic panel */}
          <rect x="78" y="56" width="90" height="136" rx="4" fill="#FFFFFF" />
          <rect x="78" y="56" width="90" height="22" rx="3" fill={foil} />
          <circle cx="123" cy="136" r="28" fill={secondary} />
          <circle cx="123" cy="136" r="18" fill={primary} opacity="0.88" />
        </g>
      );

    case 'pouch':
      return (
        <g>
          {/* Top crimped seal */}
          <rect x="82" y="34" width="96" height="12" rx="2" fill={foil} />
          {/* Stand-up pouch body */}
          <path
            d="M84 46 L176 46 L184 196 C184 204 176 210 166 210 L94 210 C84 210 76 204 76 196 Z"
            fill={primary}
          />
          {/* Window / emblem */}
          <rect x="92" y="68" width="76" height="94" rx="8" fill="#FFFFFF" />
          <rect x="92" y="68" width="76" height="18" rx="4" fill={foil} />
          <ellipse cx="130" cy="126" rx="24" ry="20" fill={secondary} />
          <ellipse cx="130" cy="126" rx="14" ry="11" fill={primary} opacity="0.82" />
          {/* Gloss */}
          <path
            d="M88 58 L84 192"
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.2"
          />
        </g>
      );

    case 'tray':
      return (
        <g>
          {/* Black/clear chilled butcher tray */}
          <rect x="46" y="70" width="168" height="118" rx="14" fill="#1E293B" />
          <rect x="54" y="78" width="152" height="102" rx="10" fill={secondary} />
          {/* Film sheen */}
          <line x1="64" y1="88" x2="104" y2="88" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
          {/* Center retail sleeve */}
          <rect x="94" y="68" width="72" height="122" rx="3" fill={primary} />
          <rect x="94" y="68" width="72" height="14" fill={foil} />
          <rect x="102" y="96" width="56" height="58" rx="4" fill="#FFFFFF" />
          <rect x="108" y="112" width="44" height="6" rx="2" fill={primary} />
          <rect x="112" y="126" width="36" height="5" rx="2" fill="#94A3B8" />
        </g>
      );

    case 'loaf':
      return (
        <g>
          {/* Bread bag twist top */}
          <polygon points="116,38 144,38 136,64 124,64" fill={primary} opacity="0.85" />
          <rect x="122" y="58" width="16" height="8" rx="2" fill={foil} />
          {/* Rounded bakery loaf silhouette */}
          <path
            d="M54 118 C54 78 86 64 130 64 C174 64 206 78 206 118 L206 184 C206 196 196 204 184 204 L76 204 C64 204 54 196 54 184 Z"
            fill="#D4A373"
          />
          {/* Crust shading */}
          <path
            d="M62 114 C62 84 90 72 130 72 C170 72 198 84 198 114"
            fill="none"
            stroke="#A47148"
            strokeWidth="8"
            opacity="0.45"
          />
          {/* Supermarket bakery wrap band */}
          <rect x="54" y="138" width="152" height="54" rx="4" fill={primary} />
          <rect x="78" y="146" width="104" height="36" rx="4" fill="#FFFFFF" />
          <rect x="92" y="156" width="76" height="6" rx="2" fill={primary} />
          <rect x="102" y="168" width="56" height="4" rx="2" fill="#94A3B8" />
        </g>
      );

    case 'punnet':
      return (
        <g>
          {/* Clear produce punnet base */}
          <path
            d="M54 90 L206 90 L194 192 C192 200 186 204 178 204 L82 204 C74 204 68 200 66 192 Z"
            fill={secondary}
            stroke="#CBD5E1"
            strokeWidth="2.5"
          />
          {/* Fresh produce circles inside */}
          <circle cx="96" cy="144" r="24" fill={primary} opacity="0.9" />
          <circle cx="132" cy="136" r="26" fill={primary} />
          <circle cx="166" cy="146" r="23" fill={primary} opacity="0.88" />
          <circle cx="116" cy="168" r="22" fill={primary} opacity="0.82" />
          <circle cx="150" cy="168" r="21" fill={primary} opacity="0.92" />
          {/* Top produce film seal band */}
          <rect x="50" y="78" width="160" height="22" rx="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
          <rect x="90" y="78" width="80" height="22" rx="3" fill={primary} />
          <rect x="100" y="86" width="60" height="6" rx="2" fill={foil} />
        </g>
      );

    case 'bar':
      return (
        <g>
          {/* Angled confectionery / butter / cheese bar */}
          <g transform="rotate(-12 130 130)">
            <rect x="42" y="88" width="176" height="84" rx="8" fill={primary} />
            <rect x="42" y="88" width="176" height="14" rx="4" fill={foil} />
            <rect x="64" y="110" width="132" height="48" rx="4" fill="#FFFFFF" />
            <rect x="78" y="122" width="104" height="8" rx="2" fill={primary} />
            <rect x="92" y="138" width="76" height="5" rx="2" fill="#94A3B8" />
          </g>
        </g>
      );

    case 'tub':
      return (
        <g>
          {/* Wide lid */}
          <rect x="62" y="66" width="136" height="18" rx="6" fill={foil} />
          {/* Tapered deli/ice-cream/yogurt tub */}
          <path
            d="M70 84 L190 84 L178 196 C177 204 170 208 162 208 L98 208 C90 208 83 204 82 196 Z"
            fill={primary}
          />
          <rect x="86" y="106" width="88" height="72" rx="6" fill="#FFFFFF" />
          <circle cx="130" cy="142" r="20" fill={secondary} />
          <circle cx="130" cy="142" r="11" fill={primary} opacity="0.85" />
        </g>
      );

    case 'multipack':
      return (
        <g>
          {/* Multipack outer pack */}
          <rect x="48" y="64" width="164" height="136" rx="10" fill={primary} />
          {/* Handle cutout */}
          <rect x="108" y="52" width="44" height="16" rx="6" fill="none" stroke={primary} strokeWidth="5" />
          {/* Inner pack divisions */}
          <rect x="60" y="80" width="140" height="104" rx="6" fill="#FFFFFF" />
          <rect x="60" y="80" width="140" height="22" rx="4" fill={foil} />
          <rect x="72" y="114" width="34" height="56" rx="4" fill={secondary} />
          <rect x="113" y="114" width="34" height="56" rx="4" fill={secondary} />
          <rect x="154" y="114" width="34" height="56" rx="4" fill={secondary} />
        </g>
      );

    case 'roll':
      return (
        <g>
          {/* Cylindrical biscuit/tissue roll */}
          <ellipse cx="130" cy="60" rx="52" ry="14" fill={secondary} stroke={primary} strokeWidth="2" />
          <ellipse cx="130" cy="60" rx="16" ry="5" fill="#94A3B8" opacity="0.5" />
          <path
            d="M78 60 L78 192 C78 202 101 208 130 208 C159 208 182 202 182 192 L182 60 Z"
            fill={primary}
          />
          <rect x="88" y="94" width="84" height="78" rx="6" fill="#FFFFFF" />
          <rect x="88" y="94" width="84" height="14" rx="3" fill={foil} />
          <rect x="100" y="122" width="60" height="6" rx="2" fill={primary} />
          <rect x="108" y="136" width="44" height="5" rx="2" fill="#94A3B8" />
        </g>
      );
  }
}

export const ProductPackVisual: React.FC<ProductPackVisualProps> = ({
  item,
  compact = false,
}) => {
  const palette =
    ACCENT_PALETTES[item.accentColor || (item.tier === 'specialty' ? 'finest' : 'blue')] ||
    ACCENT_PALETTES.blue;
  const shape: PackShape = item.packShape || 'box';

  return (
    <div
      className="w-full h-full relative flex flex-col items-center justify-center overflow-hidden select-none"
      style={{
        background: 'linear-gradient(180deg, #E2E7EE 0%, #EDF1F6 68%, #DCE3EC 100%)',
      }}
      role="img"
      aria-label={`${item.name} (${item.packSize})`}
    >
      {/* Subtle studio tabletop horizon line */}
      <div
        className="absolute inset-x-0 bottom-0 h-[28%]"
        style={{
          background: 'linear-gradient(180deg, #D8E0EA 0%, #E7ECF2 100%)',
        }}
      />

      {/* Soft contact shadow beneath packaging */}
      <div
        className="absolute bottom-[16%] w-[52%] h-4 rounded-full blur-md opacity-35"
        style={{ backgroundColor: '#0F1D36' }}
      />

      {/* Bespoke studio pack SVG */}
      <svg
        viewBox="0 0 260 235"
        className={`relative z-10 w-auto ${compact ? 'h-[78%]' : 'h-[82%]'} drop-shadow-sm`}
        aria-hidden="true"
      >
        {renderSilhouette(
          shape,
          palette.primary,
          palette.secondary,
          palette.foil || '#FFD100'
        )}
      </svg>

      {/* Clean shelf-ready front-of-pack title banner on studio floor (no price) */}
      {!compact && (
        <div className="absolute top-3 left-3 z-20 max-w-[82%]">
          <div className="bg-white/90 backdrop-blur-xs border border-slate-200/80 rounded-md px-2.5 py-1">
            <div className="text-[10px] font-semibold tracking-wide text-slate-500 truncate">
              {item.aisle} · {item.packSize}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
