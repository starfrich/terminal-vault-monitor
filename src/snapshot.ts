import { fetchPositions } from './api';
import { sendMessage, esc } from './telegram';
import { log } from './logger';

const WEI = 1e18;

function fmtUsd(val: string | number): string {
  return Number(val).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function fmtEth(wei: string): string {
  return (Number(wei) / WEI).toFixed(6);
}

function sign(val: string | number): string {
  return Number(val) >= 0 ? '+' : '';
}

// Pad key to fixed width for monospace alignment inside pre blocks
function row(key: string, value: string, width = 14): string {
  return `${key.padEnd(width)}${value}\n`;
}

async function sendSnapshot() {
  const data = await fetchPositions();

  const totalPnlUsd = Number(data.overallPnlUsd);
  const totalPnlPct = data.overallPnlPercent;

  // Header in bold, data block in pre for monospace alignment
  let msg = `*Portfolio Snapshot*\n`;

  let block =
    row('Total Value', `$${fmtUsd(data.overallValueUsd)}`) +
    row('PnL', `${sign(totalPnlUsd)}${fmtUsd(totalPnlUsd)} USD`) +
    row('', `${sign(totalPnlPct)}${totalPnlPct.toFixed(2)}%`) +
    row('ETH Balance', `${fmtEth(data.ethBalance)} ETH`);

  msg += `\`\`\`\n${block}\`\`\``;

  if (data.positions.length > 0) {
    msg += `\n*Open Positions*\n`;

    for (const p of data.positions) {
      msg += `\n*${esc(p.tokenSymbol)}* — ${esc(p.tokenName)}\n`;

      const posBlock =
        row('Value', `$${fmtUsd(p.currentValueUsd)}`) +
        row('Unrealized', `${sign(p.unrealizedPnlUsd)}${fmtUsd(p.unrealizedPnlUsd)} USD`) +
        row('Realized', `${sign(p.realizedPnlUsd)}${fmtUsd(p.realizedPnlUsd)} USD`) +
        row(
          'Total PnL',
          `${sign(p.totalPnlUsd)}${fmtUsd(p.totalPnlUsd)} USD (${sign(p.totalPnlPercent)}${p.totalPnlPercent.toFixed(2)}%)`
        );

      msg += `\`\`\`\n${posBlock}\`\`\``;
    }
  } else {
    msg += `\n_No open positions_`;
  }

  log.info(
    'snapshot',
    `portfolio $${fmtUsd(data.overallValueUsd)} | pnl ${sign(totalPnlUsd)}${fmtUsd(totalPnlUsd)} (${sign(totalPnlPct)}${totalPnlPct.toFixed(2)}%)`
  );
  await sendMessage(msg);
}

export function startSnapshotPoller() {
  sendSnapshot().catch((e) => log.error('snapshot', 'failed', e));

  return setInterval(
    () => sendSnapshot().catch((e) => log.error('snapshot', 'failed', e)),
    60 * 60 * 1000
  );
}
