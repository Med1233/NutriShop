'use client';

import { useState } from 'react';

const CATEGORY_COLORS: Record<string, string> = {
  proteins: '#2563eb',
  vitamins: '#f59e0b',
  supplements: '#8b5cf6',
  superfoods: '#16a34a',
  snacks: '#ef4444',
};

interface ProductImageProps {
  category: string;
  name: string;
  imageUrl?: string;
  size?: 'small' | 'medium' | 'large';
  style?: React.CSSProperties;
}

const SIZES = {
  small: { width: 60, height: 60 },
  medium: { width: '100%' as const, height: 160 },
  large: { width: '100%' as const, height: 320 },
};

export default function ProductImage({
  category,
  name,
  imageUrl,
  size = 'medium',
  style,
}: ProductImageProps) {
  const [imgError, setImgError] = useState(false);
  const dims = SIZES[size];
  const bg = CATEGORY_COLORS[category] || '#6b7280';
  const hasImage = imageUrl && !imgError;

  return (
    <div
      className="relative shrink-0 overflow-hidden"
      style={{
        width: dims.width,
        height: dims.height,
        borderRadius: size === 'small' ? 8 : 12,
        background: hasImage
          ? '#f3f4f6'
          : `linear-gradient(135deg, ${bg}, ${bg}dd)`,
        ...style,
      }}
    >
      {hasImage ? (
        <img
          src={imageUrl}
          alt={name}
          onError={() => setImgError(true)}
          className="block h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <span
            className="font-bold text-white/50"
            style={{
              fontSize:
                size === 'small'
                  ? '1.5rem'
                  : size === 'medium'
                    ? '3rem'
                    : '5rem',
            }}
          >
            {name.charAt(0)}
          </span>
        </div>
      )}

      {/* Name overlay for medium/large */}
      {size !== 'small' && (
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            padding: size === 'large' ? '1.5rem' : '0.75rem',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.5))',
          }}
        >
          <span
            className="font-semibold text-white"
            style={{
              fontSize: size === 'large' ? '1.1rem' : '0.75rem',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            }}
          >
            {name}
          </span>
        </div>
      )}
    </div>
  );
}
