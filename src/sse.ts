import { EventSource } from 'eventsource';
import { config } from './config';
import { sendMessage, esc } from './telegram';
import { log } from './logger';
import type { StreamEvent } from './types';

function fmtUsd(val: string | number): string {
  return Number(val).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function resolveUsd(ev: StreamEvent): string {
  if (ev.usdValue) return fmtUsd(ev.usdValue);
  if (ev.ethAmount && ev.ethPriceUsd) return fmtUsd((Number(ev.ethAmount) / 1e18) * ev.ethPriceUsd);
  return '?';
}

function formatSwapMessage(ev: StreamEvent): string {
  const side = ev.side === 'buy' ? 'BUY' : 'SELL';
  const sideMarker = ev.side === 'buy' ? '+' : '-';
  const tokenSymbol = esc(ev.tokenSymbol ?? '?');
  const tokenName = esc(ev.tokenName ?? 'Unknown');
  const ethAmt = (Number(ev.ethAmount ?? 0) / 1e18).toFixed(6);
  const usdAmt = resolveUsd(ev);
  const txHash = ev.txHash ?? ev.transactionHash;

  // Title line: bold side marker + token
  let msg = `*\\[${esc(sideMarker)}\\] ${tokenSymbol}* _${tokenName}_\n`;

  // Trade data in pre block — no escaping needed inside pre
  msg += `\`\`\`\n${ethAmt} ETH  ($${usdAmt})\n\`\`\``;

  // Reasoning in italic — must escape content
  if (ev.reasoning) {
    const truncated = ev.reasoning.length > 300 ? ev.reasoning.slice(0, 300) + '...' : ev.reasoning;
    msg += `\n_${esc(truncated)}_`;
  }

  // Link — only ) and \ need escaping inside URL, tx hashes are hex so both are safe
  if (txHash) {
    msg += `\n[View on Basescan](https://basescan.org/tx/${txHash})`;
  }

  return msg;
}

export function startSSE() {
  const url = `${config.apiBase}/stream?vaultAddress=${config.vaultAddress}`;
  log.info('sse', `connecting to ${url}`);

  const es = new EventSource(url);

  es.onopen = () => log.success('sse', 'connected');

  es.onmessage = async (event: MessageEvent) => {
    let raw: StreamEvent;
    try {
      raw = JSON.parse(event.data as string);
    } catch {
      return;
    }

    const action = String(raw.action ?? raw.type ?? '').toLowerCase();
    const isSwap = action.includes('swap') || action.includes('buy') || action.includes('sell');
    const isInference = action.includes('inference');

    log.debug('sse', `event: ${action} | raw: ${JSON.stringify(raw)}`);

    if (!isSwap && !isInference) return;

    if (isInference && !isSwap) {
      log.debug('sse', `inference-only: ${action}`);
      return;
    }

    // Flatten nested data object if present
    const data: StreamEvent =
      raw.data && typeof raw.data === 'object' ? { ...raw, ...(raw.data as object) } : raw;

    log.info(
      'sse',
      `${data.side?.toUpperCase() ?? action} ${data.tokenSymbol ?? ''} | ${data.ethAmount ?? '?'} ETH`
    );

    try {
      await sendMessage(formatSwapMessage(data));
    } catch (err) {
      log.error('sse', 'telegram send failed', err);
    }
  };

  es.onerror = (err: Event) => {
    log.error('sse', 'connection error — will reconnect', err);
  };

  return es;
}
