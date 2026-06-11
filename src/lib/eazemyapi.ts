/**
 * EazeMyAPI client
 *
 * Correct URL patterns (discovered by testing):
 *   CRUD:   https://api.eazemyapi.com/{project}/{version}/{table}/{action}
 *   Custom: https://api.eazemyapi.com/{project}/{version}/{endpoint}?params
 *
 * All requests require:  X-API-SIGNATURE: <key>
 * Date format:           MySQL  →  "YYYY-MM-DD HH:MM:SS"
 */

const BASE = "https://api.eazemyapi.com";
const PROJECT = process.env.EAZEMYAPI_PROJECT!;
const KEY = process.env.EAZEMYAPI_KEY!;
const VERSION = "v1";

function hdrs() {
  return {
    "Content-Type": "application/json",
    "X-API-SIGNATURE": KEY,
  };
}

/** Produce a MySQL-compatible datetime string from a JS Date */
export function mysqlDate(date: Date = new Date()): string {
  return date.toISOString().replace("T", " ").replace("Z", "").split(".")[0];
}

/** /{project}/{version}/{table}/{action} */
function crudUrl(table: string, action: string) {
  return `${BASE}/${PROJECT}/${VERSION}/${table}/${action}`;
}

/** /{project}/{version}/{endpoint}?params */
function queryUrl(endpoint: string, params?: Record<string, string>) {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return `${BASE}/${PROJECT}/${VERSION}/${endpoint}${qs}`;
}

// ─── CRUD helpers ─────────────────────────────────────────────────────────────

export async function eazeList(table: string) {
  const res = await fetch(crudUrl(table, "list"), { headers: hdrs(), cache: "no-store" });
  return res.json();
}

export async function eazeShow(table: string, id: string | number) {
  const res = await fetch(crudUrl(table, `show/${id}`), { headers: hdrs(), cache: "no-store" });
  const text = await res.text();
  try { return JSON.parse(text); } catch {
    console.error(`[eazeShow] non-JSON (${res.status}) for ${table}/${id}:`, text.slice(0, 200));
    return { success: false, message: `HTTP ${res.status}` };
  }
}

export async function eazeCreate(table: string, body: Record<string, unknown>, token?: string) {
  const headers: Record<string, string> = { ...hdrs() };
  if (token) headers["TOKEN"] = token;
  const res = await fetch(crudUrl(table, "create"), {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch {
    console.error(`[eazeCreate] non-JSON (${res.status}) for ${table}:`, text.slice(0, 200));
    return { success: false, message: `HTTP ${res.status}: ${text.slice(0, 150)}` };
  }
}

/** POST /v1/users/auth — authenticates user, returns auth_token */
export async function eazeAuth(email: string, password?: string) {
  const res = await fetch(crudUrl("users", "auth"), {
    method: "POST",
    headers: hdrs(),
    body: JSON.stringify({ email, ...(password ? { password } : {}) }),
  });
  return res.json();
}

export async function eazeUpdate(table: string, id: string | number, body: Record<string, unknown>, token?: string) {
  const headers: Record<string, string> = { ...hdrs() };
  if (token) headers["TOKEN"] = token;
  const res = await fetch(crudUrl(table, `update/${id}`), {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    console.error(`[eazeUpdate] non-JSON response (${res.status}) for ${table}/${id}:`, text.slice(0, 300));
    return { success: false, message: `HTTP ${res.status}: ${text.slice(0, 150)}` };
  }
}

export async function eazeDelete(table: string, id: string | number, token?: string) {
  const headers: Record<string, string> = { ...hdrs() };
  if (token) headers["TOKEN"] = token;
  const res = await fetch(crudUrl(table, `delete/${id}`), {
    method: "DELETE",
    headers,
  });
  return res.json();
}

// ─── Custom query helper ──────────────────────────────────────────────────────

export async function eazeQuery(endpoint: string, params?: Record<string, string>) {
  const res = await fetch(queryUrl(endpoint, params), { headers: hdrs(), cache: "no-store" });
  return res.json();
}

/** POST to a custom query endpoint (for UPDATE / INSERT custom SQL queries) */
export async function eazeQueryPost(endpoint: string, body: Record<string, unknown>, token?: string) {
  const headers: Record<string, string> = { ...hdrs() };
  if (token) headers["TOKEN"] = token;
  const res = await fetch(queryUrl(endpoint), {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch {
    console.error(`[eazeQueryPost] non-JSON (${res.status}) for ${endpoint}:`, text.slice(0, 200));
    return { success: false, message: `HTTP ${res.status}: ${text.slice(0, 150)}` };
  }
}

// ─── Normalise response data to always be an array ───────────────────────────

export function toArray<T>(data: T | T[] | null | undefined): T[] {
  if (!data) return [];
  return Array.isArray(data) ? data : [data];
}
