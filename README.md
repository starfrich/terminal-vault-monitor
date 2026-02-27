# terminal-vault-monitor

Real-time Telegram notifications for DX Terminal Pro vault activity trades, portfolio snapshots, and PnL alerts.

## Features

- **Live trade alerts** via Server-Sent Events: notified instantly on every buy/sell with token info, ETH amount, USD value, AI reasoning, and an Etherscan link.
- **Hourly portfolio snapshot**: total value, overall PnL, and a per-token breakdown of unrealized/realized PnL.
- **PnL change alerts** every 5 minutes: triggered when portfolio PnL moves beyond a configurable threshold.

## Requirements

- [Bun](https://bun.sh) v1.0 or later
- A Telegram bot token from [@BotFather](https://t.me/BotFather)
- A Dx Terminal Pro vault address

## Setup

**1. Clone and install dependencies**

```bash
git clone https://github.com/starfrich/terminal-vault-monitor
cd terminal-vault-monitor
bun install
```

**2. Configure environment variables**

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

```env
# Required
VAULT_ADDRESS=0x...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...

# Optional: send messages to a specific thread inside a group
TELEGRAM_THREAD_ID=

# Optional: PnL change percentage that triggers an alert (default: 5)
PNL_ALERT_THRESHOLD=5
```

To get your `TELEGRAM_CHAT_ID`, forward any message from your target chat to [@userinfobot](https://t.me/userinfobot).

For `TELEGRAM_THREAD_ID`, right-click a message in the thread, copy the link, and use the number after the last `/`.

**3. Run**

```bash
bun start
```

For development with auto-reload:

```bash
bun dev
```

## Project Structure

```bash
index.ts          Entry point
src/
  config.ts       Environment variable validation
  types.ts        API response types
  logger.ts       Colored console logger
  telegram.ts     Telegram message sender
  api.ts          Dx Terminal Pro REST client
  sse.ts          Real-time trade listener (SSE)
  snapshot.ts     Hourly portfolio snapshot poller
  pnl-alert.ts    5-minute PnL change alert poller
```

## Notifications

### Trade alert

Sent on every buy or sell detected via the live stream.

```
[+] AIGF  AIGF

0.050000 ETH  ($123.45)

Strong momentum signal detected...

View on Etherscan
```

### Portfolio snapshot (every hour)

```
Portfolio Snapshot

Total Value   $12,345.67
PnL           +234.56 USD
              +1.92%
ETH Balance   0.123456 ETH

AIGF  AIGF
Value         $1,234.56
Unrealized    +56.78 USD
Realized      +12.34 USD
Total PnL     +69.12 USD (+5.93%)
```

### PnL alert (every 5 minutes, when threshold exceeded)

```
PnL Alert

Movement      +5.23% (up)
Current PnL   +7.15%
              +876.54 USD
Portfolio     $12,345.67
```

## API

Data is sourced from the public [Dx Terminal Pro API](https://api.terminal.markets/api/v1). No authentication is required.

## License

MIT - See [LICENSE](LICENSE.md) file for details
