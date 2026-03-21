import { apiFetch } from './client';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function sendChatMessage(
  messages: ChatMessage[],
  locale: string,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const response = await apiFetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ messages, locale }),
    signal,
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Chat request failed');
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response stream');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;
      const payload = trimmed.slice(6);
      if (payload === '[DONE]') return;
      try {
        const parsed = JSON.parse(payload);
        if (parsed.text) onChunk(parsed.text);
        if (parsed.error) throw new Error(parsed.error);
      } catch (e) {
        if (e instanceof SyntaxError) continue;
        throw e;
      }
    }
  }
}
