import React, { useEffect, useState } from 'react';
import { SupermarketItem } from '../data/items';
import { formatGBP } from '../utils/gameLogic';
import { ProductPackVisual } from './ProductPackVisual';

interface ItemCardProps {
  item: SupermarketItem;
  index: number;
  totalInBasket: number;
  revealed: boolean;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  index,
  totalInBasket,
  revealed,
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [item.id, item.image]);

  const hasPhoto = Boolean(item.image) && !imgFailed;
  const isStudioPackshot = hasPhoto && item.image.startsWith('/src/assets/images/catalog/');
  const isSingleFeatured = totalInBasket === 1;

  if (isSingleFeatured) {
    return (
      <article className="bg-white border border-slate-200 rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 items-stretch">
        <div
          className={`md:col-span-7 relative min-h-[260px] md:min-h-[340px] flex items-center justify-center ${
            isStudioPackshot
              ? 'bg-white border-b md:border-b-0 md:border-r border-slate-100 p-6'
              : 'bg-[#EEF2F6]'
          }`}
        >
          {hasPhoto ? (
            <img
              src={item.image}
              alt={`${item.name} (${item.packSize})`}
              referrerPolicy="no-referrer"
              onError={() => setImgFailed(true)}
              className={
                isStudioPackshot
                  ? 'max-h-[300px] w-full object-contain'
                  : 'w-full h-full object-cover'
              }
            />
          ) : (
            <ProductPackVisual item={item} />
          )}

          {revealed && (
            <div className="absolute bottom-4 right-4 bg-[#FFD100] text-[#0F1D36] px-4 py-2 rounded-lg shadow-sm border border-[#E5BC00]">
              <div className="text-[11px] font-semibold tracking-wide text-[#0F1D36]/80">
                Shelf Price
              </div>
              <div className="font-mono text-2xl font-bold tabular-nums leading-tight">
                {formatGBP(item.pricePence)}
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-5 p-6 flex flex-col justify-between gap-6">
          <div>
            <div className="flex items-center flex-wrap gap-2 text-xs font-medium text-slate-500 mb-2">
              <span>{item.aisle}</span>
              <span aria-hidden="true">·</span>
              <span>{item.packSize}</span>
              {item.promoNote && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#00539F] font-semibold">{item.promoNote}</span>
                </>
              )}
            </div>

            <h3 className="font-display text-2xl font-bold text-[#0F1D36] leading-snug text-balance mb-4">
              {item.name}
            </h3>

            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs font-semibold text-[#00539F] mb-1.5">
                Aisle Note
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                {item.funFact}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Item 1 of 1</span>
            <span className="font-mono font-semibold text-[#0F1D36] tabular-nums">
              {revealed ? formatGBP(item.pricePence) : 'Price Hidden'}
            </span>
          </div>
        </div>
      </article>
    );
  }

  // Multi-item (3 or 5 items) clean retail card
  return (
    <article className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
      <div
        className={`relative aspect-[4/3] overflow-hidden flex items-center justify-center ${
          isStudioPackshot
            ? 'bg-white border-b border-slate-100 p-3'
            : 'bg-[#EEF2F6]'
        }`}
      >
        {hasPhoto ? (
          <img
            src={item.image}
            alt={`${item.name} (${item.packSize})`}
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className={
              isStudioPackshot
                ? 'w-full h-full object-contain'
                : 'w-full h-full object-cover'
            }
          />
        ) : (
          <ProductPackVisual item={item} />
        )}

        {revealed && (
          <div className="absolute bottom-2.5 right-2.5 bg-[#FFD100] text-[#0F1D36] px-2.5 py-1 rounded-md shadow-sm border border-[#E5BC00]">
            <span className="font-mono text-sm font-bold tabular-nums">
              {formatGBP(item.pricePence)}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          <div className="flex items-center flex-wrap gap-1.5 text-xs text-slate-500 mb-1">
            <span>{item.aisle}</span>
            <span aria-hidden="true">·</span>
            <span>{item.packSize}</span>
          </div>

          <h3 className="font-display text-base font-bold text-[#0F1D36] leading-snug mb-2">
            {item.name}
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed">
            {item.funFact}
          </p>
        </div>

        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Basket item {index + 1} of {totalInBasket}
            {item.promoNote ? ` · ${item.promoNote}` : ''}
          </span>
          <span className="font-mono font-semibold text-[#0F1D36] tabular-nums">
            {revealed ? formatGBP(item.pricePence) : '£?.??'}
          </span>
        </div>
      </div>
    </article>
  );
};
