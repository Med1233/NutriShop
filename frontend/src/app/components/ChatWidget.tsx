'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import { useLanguage } from '../i18n/LanguageContext';

export default function ChatWidget() {
  const {
    messages,
    isOpen,
    isStreaming,
    error,
    sendMessage,
    toggleChat,
    clearHistory,
    stopStreaming,
  } = useChat();
  const { t, dir } = useLanguage();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape') {
      toggleChat();
    }
  };

  const isRtl = dir === 'rtl';

  return (
    <>
      {/* Floating button */}
      <button
        onClick={toggleChat}
        aria-label={t('chat.title')}
        className={`fixed bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-lg transition-all hover:bg-green-700 hover:shadow-xl ${isRtl ? 'left-6' : 'right-6'}`}
      >
        {isOpen ? (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div
          className={`fixed bottom-24 z-50 flex h-[500px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl ${isRtl ? 'left-4' : 'right-4'}`}
          dir={dir}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 bg-green-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2a8 8 0 0 0-8 8c0 3.4 2.1 6.3 5 7.4V20h6v-2.6c2.9-1.1 5-4 5-7.4a8 8 0 0 0-8-8z" />
                <circle cx="10" cy="10" r="1" fill="currentColor" />
                <circle cx="14" cy="10" r="1" fill="currentColor" />
                <path d="M9 14c.6 1 1.7 1.5 3 1.5s2.4-.5 3-1.5" />
              </svg>
              <span className="text-sm font-semibold">{t('chat.title')}</span>
            </div>
            <button
              onClick={clearHistory}
              className="rounded px-2 py-1 text-xs text-green-100 transition-colors hover:bg-green-700 hover:text-white"
              title={t('chat.clear')}
            >
              {t('chat.clear')}
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.length === 0 && (
              <div className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-800">
                {t('chat.greeting')}
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? (isRtl ? 'justify-start' : 'justify-end') : isRtl ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] whitespace-pre-wrap rounded-xl px-3 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.content || (
                    <span className="inline-flex gap-1">
                      <span className="animate-bounce">.</span>
                      <span
                        className="animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      >
                        .
                      </span>
                      <span
                        className="animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      >
                        .
                      </span>
                    </span>
                  )}
                </div>
              </div>
            ))}
            {error && (
              <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 bg-white p-3">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('chat.placeholder')}
                disabled={isStreaming}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition-colors focus:border-green-500 disabled:bg-gray-50"
              />
              {isStreaming ? (
                <button
                  onClick={stopStreaming}
                  className="rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
                >
                  Stop
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:bg-gray-300"
                >
                  {t('chat.send')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
