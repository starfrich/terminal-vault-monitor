import './src/config'; // validate env early
import { startSSE } from './src/sse';
import { startSnapshotPoller } from './src/snapshot';
import { startPnlAlertPoller } from './src/pnl-alert';
import { sendMessage } from './src/telegram';
import { log } from './src/logger';

log.info('bot', 'starting vault monitor...');

await sendMessage('*Vault Monitor started*\n_Listening for trades and tracking portfolio_\n');

startSSE();
startSnapshotPoller();
startPnlAlertPoller();

log.success('bot', 'all services running');
