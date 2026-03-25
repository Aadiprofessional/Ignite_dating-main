import { writeFileSync } from "node:fs";

const BASE = "https://server2.matrixaiserver.com";
const user1 = { email: "ignite_test_1773852469188_1@example.com", password: "StrongPass123!" };
const user2 = { email: "ignite_test_1773852469188_2@example.com", password: "StrongPass123!" };

const calls = [];
const sensitiveKeys = new Set(["password", "access_token", "refresh_token"]);

const redact = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => redact(item));
  }
  if (value && typeof value === "object") {
    const out = {};
    Object.entries(value).forEach(([key, fieldValue]) => {
      if (sensitiveKeys.has(key)) {
        out[key] = "[REDACTED]";
      } else {
        out[key] = redact(fieldValue);
      }
    });
    return out;
  }
  return value;
};

const callApi = async (name, { method = "GET", path, token, body }) => {
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...(body ? { "content-type": "application/json" } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const raw = await response.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    data = { raw };
  }
  const entry = {
    name,
    request: {
      method,
      path,
      body: redact(body || null),
      hasAuth: Boolean(token)
    },
    status: response.status,
    response: redact(data)
  };
  calls.push(entry);
  return { ...entry, rawResponse: data };
};

await callApi("root", { path: "/" });
await callApi("health", { path: "/health" });

const login1 = await callApi("login_user1", {
  method: "POST",
  path: "/api/auth/login",
  body: user1
});
const login2 = await callApi("login_user2", {
  method: "POST",
  path: "/api/auth/login",
  body: user2
});

const token1 = login1.rawResponse?.session?.access_token;
const token2 = login2.rawResponse?.session?.access_token;
const user1Id = login1.rawResponse?.user?.id;
const user2Id = login2.rawResponse?.user?.id;

if (token1) {
  await callApi("auth_me_user1", { path: "/api/auth/me", token: token1 });
  await callApi("update_me_user1", {
    method: "PUT",
    path: "/api/me",
    token: token1,
    body: {
      bio: "User1 bio updated final",
      city: "Mumbai",
      country: "India",
      latitude: 19.076,
      longitude: 72.8777
    }
  });
  await callApi("update_preferences_user1", {
    method: "PUT",
    path: "/api/preferences",
    token: token1,
    body: {
      min_age: 21,
      max_age: 35,
      max_distance_km: 200,
      interested_in: ["female"],
      show_me: true
    }
  });
  await callApi("replace_images_user1", {
    method: "POST",
    path: "/api/images",
    token: token1,
    body: {
      operation: "replace_all",
      urls: ["https://picsum.photos/seed/u1a/400/600", "https://picsum.photos/seed/u1b/400/600"]
    }
  });
  await callApi("discover_user1", { path: "/api/discover?limit=20", token: token1 });
}

if (token2) {
  await callApi("auth_me_user2", { path: "/api/auth/me", token: token2 });
  await callApi("update_me_user2", {
    method: "PUT",
    path: "/api/me",
    token: token2,
    body: {
      bio: "User2 bio updated final",
      city: "Noida",
      country: "India",
      latitude: 28.57,
      longitude: 77.32
    }
  });
  await callApi("update_preferences_user2", {
    method: "PUT",
    path: "/api/preferences",
    token: token2,
    body: {
      min_age: 21,
      max_age: 35,
      max_distance_km: 200,
      interested_in: ["male"],
      show_me: true
    }
  });
  await callApi("replace_images_user2", {
    method: "POST",
    path: "/api/images",
    token: token2,
    body: {
      operation: "replace_all",
      urls: ["https://picsum.photos/seed/u2a/400/600"]
    }
  });
  await callApi("discover_user2", { path: "/api/discover?limit=20", token: token2 });
}

if (token1 && user2Id) {
  await callApi("swipe_user1_like_user2", {
    method: "POST",
    path: "/api/swipes",
    token: token1,
    body: { target_id: user2Id, action: "like" }
  });
}

if (token2 && user1Id) {
  await callApi("swipe_user2_like_user1", {
    method: "POST",
    path: "/api/swipes",
    token: token2,
    body: { target_id: user1Id, action: "like" }
  });
}

if (token1) {
  const notifications1 = await callApi("notifications_user1", { path: "/api/notifications?limit=30", token: token1 });
  await callApi("matches_user1", { path: "/api/matches", token: token1 });
  const notificationId = notifications1.rawResponse?.notifications?.[0]?.id;
  if (notificationId) {
    await callApi("notification_read_user1", {
      method: "PATCH",
      path: `/api/notifications/${notificationId}/read`,
      token: token1
    });
  }
}

if (token2) {
  await callApi("notifications_user2", { path: "/api/notifications?limit=30", token: token2 });
  await callApi("matches_user2", { path: "/api/matches", token: token2 });
}

if (token1 && user2Id) {
  await callApi("report_user2_by_user1", {
    method: "POST",
    path: "/api/reports",
    token: token1,
    body: { reported_id: user2Id, reason: "spam", details: "final api test" }
  });
  await callApi("block_user2_by_user1", {
    method: "POST",
    path: "/api/blocks",
    token: token1,
    body: { blocked_id: user2Id }
  });
}

const report = {
  baseUrl: BASE,
  testedAt: new Date().toISOString(),
  users: {
    user1: user1.email,
    user2: user2.email,
    user1Id: user1Id || null,
    user2Id: user2Id || null
  },
  summary: {
    total: calls.length,
    success: calls.filter((entry) => entry.status >= 200 && entry.status < 300).length,
    failure: calls.filter((entry) => entry.status < 200 || entry.status >= 300).length
  },
  calls
};

writeFileSync("api-test-report.json", `${JSON.stringify(report, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(report.summary)}\n`);
