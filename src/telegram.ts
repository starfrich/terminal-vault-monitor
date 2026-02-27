import { config } from './config';
import { log } from './logger';

// Escapes all MarkdownV2 reserved characters for use in plain text spans.
// Reserved: _ * [ ] ( ) ~ ` > # + - = | { } . !
// Do NOT use this inside code/pre blocks or inside link URLs.
export function esc(text: string | number): string {
  return String(text).replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&');
}

export async function sendMessage(text: string) {
  const url = `https://api.telegram.org/bot${config.telegramToken}/sendMessage`;

  const payload: Record<string, unknown> = {
    chat_id: config.telegramChatId,
    text,
    parse_mode: 'MarkdownV2',
    disable_web_page_preview: true
  };

  if (config.telegramThreadId) {
    payload.message_thread_id = Number(config.telegramThreadId);
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const body = await res.text();
    log.error('telegram', `send failed (${res.status}): ${body}`);
  }
}
