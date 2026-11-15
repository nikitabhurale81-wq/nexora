"use client";

/**
 * Typed API service functions that call the NEXORA backend.
 *
 * The backend returns a consistent envelope: { success, data, message } on
 * success and { success:false, error:{code,message} } on failure. These
 * helpers unwrap `.data` and surface a readable error message.
 */

import { apiRequest, ApiError } from "./client";

const TOKEN_KEY = "nexora_token";

interface Envelope<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: { code: string; message: string };
}

export function setToken(token: string): void {
  if (typeof window !== "undefined") window.localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken(): void {
  if (typeof window !== "undefined") window.localStorage.removeItem(TOKEN_KEY);
}
export function hasToken(): boolean {
  return typeof window !== "undefined" && Boolean(window.localStorage.getItem(TOKEN_KEY));
}

/** Turn a thrown ApiError into a readable message from the backend envelope. */
export function readError(err: unknown, fallback = "Something went wrong"): string {
  const e = err as ApiError;
  const details = e?.details as Envelope<unknown> | undefined;
  return details?.error?.message || e?.message || fallback;
}

/** Ensure some bearer token exists; fall back to a backend guest session. */
export async function ensureGuestToken(): Promise<void> {
  if (hasToken()) return;
  const res = await apiRequest<Envelope<{ access_token: string }>>("/auth/guest", {
    method: "POST",
  });
  setToken(res.data.access_token);
}

export interface ChatResult {
  conversation_id: string | null;
  message_id?: string;
  content: string;
  model: string;
  tokens: number;
  guest: boolean;
}

export async function sendChatMessage(
  content: string,
  conversationId?: string | null,
  signal?: AbortSignal
): Promise<ChatResult> {
  const res = await apiRequest<Envelope<ChatResult>>("/chat/message", {
    method: "POST",
    body: { content, conversation_id: conversationId ?? null },
    signal,
  });
  return res.data;
}

export interface MeResult {
  id: string;
  email: string | null;
  name: string | null;
  role: string;
  subscription: string;
}

export async function getMe(): Promise<MeResult> {
  const res = await apiRequest<Envelope<MeResult>>("/auth/me");
  return res.data;
}
