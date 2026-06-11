/**
 * Auth helpers — session management via EazeMyAPI
 *
 * Table:   user_sessions   (not "sessions")
 * Delete:  soft-delete — set expires_at to past date (DELETE requires EazeMyAPI auth token)
 * Dates:   MySQL format "YYYY-MM-DD HH:MM:SS"
 *
 * Custom queries used:
 *   session_by_token   →  SELECT * FROM user_sessions WHERE session_token = :session_token LIMIT 1
 *   sessions_by_user   →  SELECT * FROM user_sessions WHERE user_id = :user_id
 */

import { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { eazeQuery, eazeCreate, eazeUpdate, toArray, mysqlDate } from "./eazemyapi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SessionPayload {
  token: string;
  eazeToken: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface EazeSession {
  id: string;
  user_id: string;
  session_token: string;
  device_name: string;
  device_type: string;
  ip_address: string;
  user_agent: string;
  expires_at: string;   // stored as "YYYY-MM-DD" by EazeMyAPI
  created_at: string;
}

// ─── Cookie config ────────────────────────────────────────────────────────────

export const SESSION_COOKIE = "mktf_session";

export const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: "/",
};

// ─── Session cookie helpers ───────────────────────────────────────────────────

export function getSessionPayload(req: NextRequest): SessionPayload | null {
  const cookie = req.cookies.get(SESSION_COOKIE);
  if (!cookie?.value) return null;
  try {
    return JSON.parse(cookie.value) as SessionPayload;
  } catch {
    return null;
  }
}

// ─── Session DB helpers ───────────────────────────────────────────────────────

function parseDevice(ua: string): { device_name: string; device_type: string } {
  const lower = ua.toLowerCase();
  if (lower.includes("mobile") || lower.includes("android") || lower.includes("iphone")) {
    return { device_name: "Mobile Browser", device_type: "mobile" };
  }
  if (lower.includes("tablet") || lower.includes("ipad")) {
    return { device_name: "Tablet Browser", device_type: "tablet" };
  }
  return { device_name: "Web Browser", device_type: "web" };
}

/** Create a new session in user_sessions table. Returns the session token. */
export async function createSession(userId: string, req: NextRequest): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const ua = req.headers.get("user-agent") || "";
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const { device_name, device_type } = parseDevice(ua);

  // expires 7 days from now — MySQL date "YYYY-MM-DD HH:MM:SS"
  const expiresAt = mysqlDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

  await eazeCreate("user_sessions", {
    user_id: userId,
    session_token: token,
    device_name,
    device_type,
    ip_address: ip,
    user_agent: ua,
    expires_at: expiresAt,
    created_at: mysqlDate(),
  });

  return token;
}

/** Look up a session by token. Returns null if not found or expired. */
export async function getSession(token: string): Promise<EazeSession | null> {
  const result = await eazeQuery("session_by_token", { session_token: token });
  const rows = toArray<EazeSession>(result.data);
  if (!result.success || rows.length === 0) return null;

  const session = rows[0];
  // expires_at is "YYYY-MM-DD" — treat as end-of-day
  if (new Date(session.expires_at) < new Date()) return null;

  return session;
}

/**
 * Invalidate a session — soft-delete by setting expires_at to the past.
 * (Hard DELETE requires EazeMyAPI's own auth token, which we don't use.)
 */
export async function invalidateSession(sessionId: string): Promise<void> {
  await eazeUpdate("user_sessions", sessionId, {
    expires_at: "2000-01-01 00:00:00",
  });
}

/** Invalidate ALL sessions for a user (logout all devices). */
export async function invalidateAllSessions(userId: string): Promise<void> {
  const result = await eazeQuery("sessions_by_user", { user_id: userId });
  const sessions = toArray<EazeSession>(result.data);
  await Promise.all(sessions.map((s) => invalidateSession(s.id)));
}
