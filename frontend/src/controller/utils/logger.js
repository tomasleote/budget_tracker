/**
 * Gated application logger.
 *
 * - `debug` only prints in development AND when `localStorage.bt_debug === 'true'`,
 *   so day-to-day usage has a clean console. Flip it on in the browser console with
 *   `localStorage.setItem('bt_debug', 'true')`.
 * - `info` prints in development only.
 * - `warn` / `error` always print.
 *
 * Use this instead of raw `console.*` in providers, hooks, and services.
 */
const isDev = process.env.NODE_ENV === 'development';

const isDebugOn = () => {
  try {
    return isDev && typeof localStorage !== 'undefined' && localStorage.getItem('bt_debug') === 'true';
  } catch (e) {
    return false;
  }
};

export const logger = {
  debug: (...args) => { if (isDebugOn()) console.log(...args); },
  info: (...args) => { if (isDev) console.info(...args); },
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args),
};

export default logger;
