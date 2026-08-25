// API client helper sending httpOnly credentials and handling errors gracefully

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
    credentials: 'include', // send httpOnly cookie
  });

  const contentType = response.headers.get('content-type');
  let data: any;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    if (response.status === 401 && !endpoint.includes('/api/auth/login')) {
      try {
        window.dispatchEvent(new CustomEvent('ai365_session_expired', {
          detail: { message: typeof data === 'object' && data.error ? data.error : 'Session expired' }
        }));
      } catch (e) {
        // ignore dispatch errors
      }
    }
    const errorMsg = typeof data === 'object' && data.error ? data.error : 'An API error occurred.';
    throw new Error(errorMsg);
  }

  const method = (options.method || 'GET').toUpperCase();
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    try {
      window.dispatchEvent(new CustomEvent('ai365_data_updated'));
      localStorage.setItem('ai365_last_update', Date.now().toString());
    } catch (e) {
      // ignore storage access errors if any
    }
  }

  return data as T;
}
