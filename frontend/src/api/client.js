const base = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'NETWORK_ERROR', fields = {}, unknownOutcome = false } = {}) {
    super(message);
    Object.assign(this, { status, code, fields, unknownOutcome });
  }
}
export async function request(path, { method = 'GET', body, signal } = {}) {
  const controller = new AbortController();
  let timedOut = false;
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  signal?.addEventListener('abort', abort, { once: true });
  const timer = setTimeout(() => { timedOut = true; abort(); }, 15000);
  try {
    const response = await fetch(`${base}${path}`, {
      method,
      signal: controller.signal,
      headers: { Accept: 'application/json', ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    let data;
    try { data = await response.json(); }
    catch { throw new ApiError('The service returned an unreadable response. Please refresh tasks.', { status: response.status, unknownOutcome: method !== 'GET' }); }
    if (!response.ok) {
      throw new ApiError(data?.error?.message || 'The request could not be completed.', { status: response.status, code: data?.error?.code, fields: data?.error?.fields || {} });
    }
    if (data?.success !== true || !Object.hasOwn(data, 'data')) {
      throw new ApiError('The service returned an unexpected response. Please refresh tasks.', { unknownOutcome: method !== 'GET' });
    }
    return data;
  } catch (error) {
    if (signal?.aborted && !timedOut) throw new DOMException('Request canceled', 'AbortError');
    if (error instanceof ApiError) throw error;
    const writing = method !== 'GET';
    throw new ApiError(writing
      ? "We couldn't confirm the change. Refresh tasks before trying again."
      : timedOut ? 'Loading took too long. Check the API connection and retry.' : 'Unable to reach the task service. Check that the API is running.',
    { unknownOutcome: writing, code: timedOut ? 'REQUEST_TIMEOUT' : 'NETWORK_ERROR' });
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
  }
}
