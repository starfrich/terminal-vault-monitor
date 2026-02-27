import { fetchPositions } from './api';
import { sendMessage, esc } from './telegram';
import { log } from './logger';
import { config } from './config';

let lastPnlPercent: number | null = null;

function fmtUsd(val: string | number): string {
  return Number(val).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function sign(val: number): string {
  return val >= 0 ? '+' : '';
}

function row(key: string, value: string, width = 14): string {
  return `${key.padEnd(width)}${value}\n`;
}

async function checkPnl() {
  const data = await fetchPositions();
  const current = data.overallPnlPercent;

  if (lastPnlPercent === null) {
    lastPnlPercent = current;
    log.debug('pnl-alert', `baseline set: ${current.toFixed(2)}%`);
    return;
  }

  const delta = current - lastPnlPercent;

  log.debug(
    'pnl-alert',
    `current ${sign(current)}${current.toFixed(2)}% | delta ${sign(delta)}${delta.toFixed(2)}%`
  );

  if (Math.abs(delta) >= config.pnlAlertThreshold) {
    const direction = delta >= 0 ? 'up' : 'down';

    const block =
      row('Movement', `${sign(delta)}${delta.toFixed(2)}% (${direction})`) +
      row('Current PnL', `${sign(current)}${current.toFixed(2)}%`) +
      row('', `${sign(Number(data.overallPnlUsd))}${fmtUsd(data.overallPnlUsd)} USD`) +
      row('Portfolio', `$${fmtUsd(data.overallValueUsd)}`);

    const msg = `*PnL Alert*\n\`\`\`\n${block}\`\`\``;

    log.warn('pnl-alert', `alert triggered: ${sign(delta)}${delta.toFixed(2)}% change`);
    await sendMessage(msg);
  }

  lastPnlPercent = current;
}

export function startPnlAlertPoller() {
  checkPnl().catch((e) => log.error('pnl-alert', 'failed', e));

  return setInterval(
    () => checkPnl().catch((e) => log.error('pnl-alert', 'failed', e)),
    5 * 60 * 1000
  );
}
