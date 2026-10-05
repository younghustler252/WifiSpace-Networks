export function getApiBaseUrl() {
  if (typeof window !== "undefined") return "/api";
  return `${process.env.API_URL}/api`;
}