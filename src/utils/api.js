const BASE = import.meta.env.VITE_API_URL ?? "/api";
const TOKEN_KEY = "gymflow_token";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {}
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

let onUnauthorized = () => {};
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

export async function request(path, { method = "GET", body } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  let data = null;
  try {
    data = await res.json();
  } catch {}

  if (!res.ok) {
    if (res.status === 401 && token) {
      clearToken();
      onUnauthorized();
    }
    throw new Error(data?.message || `Request failed (${res.status})`);
  }
  return data;
}

const toMember = (m) => ({ ...m, endDate: new Date(m.endDate) });

export const membersApi = {
  async list() {
    return (await request("/members")).map(toMember);
  },
  async create({ name, locker, plan }) {
    return toMember(
      await request("/members", {
        method: "POST",
        body: { name, locker, plan },
      }),
    );
  },
  async renew(id) {
    return toMember(await request(`/members/${id}/renew`, { method: "POST" }));
  },
  async pay(id) {
    return toMember(await request(`/members/${id}/pay`, { method: "POST" }));
  },
  async remove(id) {
    await request(`/members/${id}`, { method: "DELETE" });
  },
};
