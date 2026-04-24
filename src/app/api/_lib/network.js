function timeoutError(label, timeoutMs) {
  return Object.assign(new Error(`${label} timed out after ${timeoutMs}ms`), {
    code: 'REQUEST_TIMEOUT',
    status: 504,
  })
}

export async function fetchWithTimeout(url, init = {}, { timeoutMs = 10_000, timeoutLabel = 'Request' } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(timeoutError(timeoutLabel, timeoutMs)), timeoutMs)

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    })
  } catch (error) {
    if (error?.name === 'AbortError' || error?.code === 'REQUEST_TIMEOUT') {
      throw timeoutError(timeoutLabel, timeoutMs)
    }
    throw error
  } finally {
    clearTimeout(timer)
  }
}
