export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiRequestError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = "ApiRequestError";
  }
}

/**
 * Fired whenever an authenticated request comes back 401. The client-side
 * AuthProvider subscribes to this to redirect to /login. Server-side callers
 * (route handlers) never trigger this since there's no `window`.
 */
let unauthorizedHandler = null;
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

function buildUrl(path, params) {
  const url = new URL(path, API_BASE_URL);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function request(path, options = {}) {
  const { method = "GET", body, token, params, cache } = options;

  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(buildUrl(path, params), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: cache ?? "no-store",
    });
  } catch (err) {
    throw new ApiRequestError(
      0,
      "Could not reach the server. Check that the backend is running."
    );
  }

  if (res.status === 401 && typeof window !== "undefined") {
    unauthorizedHandler?.();
  }

  if (!res.ok) {
    let message = res.statusText || `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (typeof data?.detail === "string") message = data.detail;
      else if (data?.detail?.message) message = data.detail.message;
    } catch {
      // ignore body parse errors
    }
    throw new ApiRequestError(res.status, message);
  }

  if (res.status === 204) return undefined;

  return await res.json();
}

// ---------- Auth ----------

export function login(username, password) {
  return request("/auth/login", {
    method: "POST",
    body: { username, password },
  });
}

export function getMe(token) {
  return request("/auth/me", { token });
}

// ---------- Roles ----------

export function getRoles(token) {
  return request("/roles", { token });
}

// ---------- Categories (admin) ----------

export function getCategories(token) {
  return request("/categories", { token });
}

export function createCategory(data, token) {
  return request("/categories", { method: "POST", body: data, token });
}

export function updateCategory(id, data, token) {
  return request(`/categories/${id}`, {
    method: "PUT",
    body: data,
    token,
  });
}

export function deleteCategory(id, token) {
  return request(`/categories/${id}`, { method: "DELETE", token });
}

// ---------- Products (admin) ----------

export function getProducts(params, token) {
  return request("/products", { params, token });
}

export function getProduct(id, token) {
  return request(`/products/${id}`, { token });
}

export function createProduct(data, token) {
  return request("/products", { method: "POST", body: data, token });
}

export function updateProduct(id, data, token) {
  return request(`/products/${id}`, {
    method: "PUT",
    body: data,
    token,
  });
}

export function deleteProduct(id, token) {
  return request(`/products/${id}`, { method: "DELETE", token });
}

export function sellProduct(id, data, token) {
  return request(`/products/${id}/sell`, {
    method: "POST",
    body: data,
    token,
  });
}

// ---------- Dashboard ----------

export function getDashboard(token) {
  return request("/dashboard", { token });
}

// ---------- Public storefront ----------

export function getPublicCategories() {
  return request("/public/categories");
}

export function getPublicProducts(params = {}) {
  return request("/public/products", { params });
}

export function getPublicProduct(id) {
  return request(`/public/products/${id}`);
}

// ---------- Health ----------

export function getHealth() {
  return request("/health");
}
