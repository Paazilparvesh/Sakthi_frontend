export const fetchJSON = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(url, options);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.msg || `HTTP Error: ${response.status}`);
  }
  return response.json();
};
