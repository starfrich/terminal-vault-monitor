export const config = {
  vaultAddress: process.env.VAULT_ADDRESS!,
  telegramToken: process.env.TELEGRAM_BOT_TOKEN!,
  telegramChatId: process.env.TELEGRAM_CHAT_ID!,
  telegramThreadId: process.env.TELEGRAM_THREAD_ID ?? null,
  pnlAlertThreshold: Number(process.env.PNL_ALERT_THRESHOLD ?? 5),
  apiBase: 'https://api.terminal.markets/api/v1'
} as const;

const required = ['vaultAddress', 'telegramToken', 'telegramChatId'] as const;
for (const key of required) {
  if (!config[key]) throw new Error(`Missing env: ${key}`);
}
