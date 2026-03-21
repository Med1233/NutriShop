'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { localeNames, Locale } from '../i18n/translations';

const flags: Record<Locale, string> = {
  en: '🇬🇧',
  fr: '🇫🇷',
  ar: '🇸🇦',
};

export default function LanguageSelector() {
  const { locale, setLocale, dir } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const handleSelect = (code: Locale) => {
    setLocale(code);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 border rounded-lg cursor-pointer text-[0.8125rem] text-gray-700 font-medium font-[inherit] transition-all ${
          open ? 'border-blue-600 bg-blue-50 shadow-[0_0_0_2px_rgba(37,99,235,0.15)]' : 'border-gray-200 bg-gray-50'
        }`}
        aria-label="Select language"
        aria-expanded={open}
      >
        <span className="text-base leading-none">{flags[locale]}</span>
        <span className="leading-none">{localeNames[locale]}</span>
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          className="transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <path d="M1 1l4 4 4-4" stroke="#6b7280" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div
          className="absolute top-[calc(100%+6px)] min-w-[170px] bg-white border border-gray-200 rounded-[10px] shadow-[0_4px_16px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.06)] p-1 z-[1000] overflow-hidden"
          style={{ [dir === 'rtl' ? 'left' : 'right']: 0 }}
        >
          {(Object.keys(localeNames) as Locale[]).map((code) => (
            <button
              key={code}
              onClick={() => handleSelect(code)}
              className={`flex items-center gap-2 w-full px-2.5 py-2 border-none cursor-pointer text-[0.8125rem] font-[inherit] rounded-[7px] transition-colors text-start ${
                locale === code
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'bg-transparent text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-lg leading-none">{flags[code]}</span>
              <span className="flex-1 leading-snug">{localeNames[code]}</span>
              {locale === code && (
                <svg width="14" height="14" viewBox="0 0 14 14" className="shrink-0">
                  <path d="M2.5 7.5l3 3 6-6" stroke="#2563eb" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
