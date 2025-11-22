export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  // Determine the base URL
  let baseUrl = '';
  
  if (typeof window === 'undefined') {
    // Server-side
    baseUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000';
  }

  const url = path.startsWith('/') ? `${baseUrl}${path}` : `${baseUrl}/${path}`;

  // Log for debugging if needed, but keeping it clean for now.
  // console.log(`Fetching: ${url}`); 

  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!res.ok) {
    // Try to parse error message from JSON if available
    let errorMessage = `API Error: ${res.status} ${res.statusText}`;
    try {
      const errorData = await res.json();
      if (errorData.detail) {
        errorMessage = errorData.detail;
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMessage);
  }

  return res.json();
}
