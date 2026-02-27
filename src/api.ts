import { config } from './config';
import type { PositionsResponse } from './types';

export async function fetchPositions(): Promise<PositionsResponse> {
  const res = await fetch(`${config.apiBase}/positions/${config.vaultAddress}`);
  if (!res.ok) throw new Error(`positions API ${res.status}`);
  return res.json() as Promise<PositionsResponse>;
}
