export function getApiBaseUrl() {
  if (typeof window !== "undefined") return "/api";
  return `${process.env.API_URL ?? "http://localhost:4000"}/api`;
}