import { request, setToken, clearToken, getToken } from "./api";

export async function login(email, password) {
  const { token, user } = await request("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  setToken(token);
  return user;
}

export async function register(name, email, password) {
  return request("/auth/register", {
    method: "POST",
    body: { name, email, password },
  });
}

export async function verifyEmail(email, code) {
  const { token, user } = await request("/auth/verify", {
    method: "POST",
    body: { email, code },
  });
  setToken(token);
  return user;
}

export async function resendCode(email) {
  return request("/auth/resend", {
    method: "POST",
    body: { email },
  });
}

export async function restoreSession() {
  if (!getToken()) return null;
  try {
    return await request("/auth/me");
  } catch {
    return null;
  }
}

export function logout() {
  clearToken();
  try {
    localStorage.removeItem("gymflow_total");
  } catch {}
}
