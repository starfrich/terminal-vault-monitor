const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const GRAY = '\x1b[90m';

function timestamp(): string {
  return `${DIM}${new Date().toISOString()}${RESET}`;
}

function tag(label: string, color: string): string {
  return `${color}${BOLD}[${label}]${RESET}`;
}

export const log = {
  info: (module: string, msg: string, ...args: unknown[]) =>
    console.log(`${timestamp()} ${tag(module, CYAN)} ${msg}`, ...args),

  success: (module: string, msg: string, ...args: unknown[]) =>
    console.log(`${timestamp()} ${tag(module, GREEN)} ${msg}`, ...args),

  warn: (module: string, msg: string, ...args: unknown[]) =>
    console.warn(`${timestamp()} ${tag(module, YELLOW)} ${msg}`, ...args),

  error: (module: string, msg: string, ...args: unknown[]) =>
    console.error(`${timestamp()} ${tag(module, RED)} ${msg}`, ...args),

  debug: (module: string, msg: string, ...args: unknown[]) =>
    console.log(`${timestamp()} ${tag(module, GRAY)} ${msg}`, ...args)
};
