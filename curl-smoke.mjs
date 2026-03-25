import { execFile } from "node:child_process";
import { writeFileSync } from "node:fs";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const BASE = "https://server.hkmeetup.space";
const user1 = { email: "ignite_test_1773852469188_1@example.com", password: "StrongPass123!" };
const user2 = { email: "ignite_test_1773852469188_2@example.com", password: "StrongPass123!" };

const calls = [];

const parseCurlOutput = (stdout) => {
  const marker = "\n__STATUS__:";
  const idx = stdout.lastIndexOf(marker);
  if (idx === -1) {
    return { status: 0, bodyText: stdout.trim() };
  }
  const bodyText = stdout.slice(0, idx).trim();
  const statusText = stdout.slice(idx + marker.length).trim();
  return { status: Number(statusText) || 0, bodyText };
};

const safeJson = (text) => {
  if (!text) {
    return {};
  }
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
};

const redact = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => redact(item));
  }
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, fieldValue] of Object.entries(value)) {
      if (key === "password" || key === "access_token" || key === "refresh_token") {
        out[key] = "[REDACTED]";
      } else {
        out[key] = redact(fieldValue);
      }
    }
    return out;
  }
  return value;
};

const callCurl = async (name, { method = "GET", path, token, body, tokenLabel }) => {
  const url = `${BASE}${path}`;
  const args = ["-sS", "-X", method, url];
  const commandParts = [`curl -X ${method} "${url}"`];
  if (token) {
    args.push("-H", `authorization: Bearer ${token}`);
    commandParts.push(`-H "authorization: Bearer ${tokenLabel || "[REDACTED_TOKEN]"}"`);
  }
  if (body) {
    args.push("-H", "content-type: application/json", "--data-raw", JSON.stringify(body));
    commandParts.push(`-H "content-type: application/json" --data-raw '${JSON.stringify(redact(body))}'`);
  }
  args.push("-w", "\n__STATUS__:%{http_code}");

  const { stdout, stderr } = await execFileAsync("curl", args);
  const { status, bodyText } = parseCurlOutput(stdout || "");
  const response = safeJson(bodyText);
  const entry = {
    name,
    curl: commandParts.join(" "),
    request: {
      method,
      path,
      hasAuth: Boolean(token),
      body: redact(body || null)
    },
    status,
    response: redact(response),
    stderr: stderr || ""
  };
  calls.push(entry);
  return { ...entry, rawResponse: response };
};

const login1 = await callCurl("login_user1", {
  method: "POST",
  path: "/api/auth/login",
  body: user1
});

const login2 = await callCurl("login_user2", {
  method: "POST",
  path: "/api/auth/login",
  body: user2
});

const token1 = login1.rawResponse?.session?.access_token;
const token2 = login2.rawResponse?.session?.access_token;
const user1Id = login1.rawResponse?.user?.id;
const user2Id = login2.rawResponse?.user?.id;

if (token1) {
  await callCurl("auth_me_user1", { path: "/api/auth/me", token: token1, tokenLabel: "{{USER1_TOKEN}}" });
  await callCurl("update_me_user1", {
    method: "PUT",
    path: "/api/me",
    token: token1,
    tokenLabel: "{{USER1_TOKEN}}",
    body: {
      bio: "User1 bio curl run",
      city: "Mumbai",
      country: "India",
      latitude: 19.076,
      longitude: 72.8777
    }
  });
  await callCurl("update_preferences_user1", {
    method: "PUT",
    path: "/api/preferences",
    token: token1,
    tokenLabel: "{{USER1_TOKEN}}",
    body: {
      min_age: 21,
      max_age: 35,
      max_distance_km: 200,
      interested_in: ["female"],
      show_me: true
    }
  });
  await callCurl("replace_images_user1", {
    method: "POST",
    path: "/api/images",
    token: token1,
    tokenLabel: "{{USER1_TOKEN}}",
    body: {
      operation: "replace_all",
      urls: ["https://picsum.photos/seed/u1curl/400/600", "https://picsum.photos/seed/u1curl2/400/600"]
    }
  });
  await callCurl("discover_user1", { path: "/api/discover?limit=20", token: token1, tokenLabel: "{{USER1_TOKEN}}" });
}

if (token2) {
  await callCurl("auth_me_user2", { path: "/api/auth/me", token: token2, tokenLabel: "{{USER2_TOKEN}}" });
  await callCurl("update_me_user2", {
    method: "PUT",
    path: "/api/me",
    token: token2,
    tokenLabel: "{{USER2_TOKEN}}",
    body: {
      bio: "User2 bio curl run",
      city: "Noida",
      country: "India",
      latitude: 28.57,
      longitude: 77.32
    }
  });
  await callCurl("update_preferences_user2", {
    method: "PUT",
    path: "/api/preferences",
    token: token2,
    tokenLabel: "{{USER2_TOKEN}}",
    body: {
      min_age: 21,
      max_age: 35,
      max_distance_km: 200,
      interested_in: ["male"],
      show_me: true
    }
  });
  await callCurl("replace_images_user2", {
    method: "POST",
    path: "/api/images",
    token: token2,
    tokenLabel: "{{USER2_TOKEN}}",
    body: {
      operation: "replace_all",
      urls: ["https://picsum.photos/seed/u2curl/400/600"]
    }
  });
  await callCurl("discover_user2", { path: "/api/discover?limit=20", token: token2, tokenLabel: "{{USER2_TOKEN}}" });
}

if (token1 && user2Id) {
  await callCurl("swipe_user1_like_user2", {
    method: "POST",
    path: "/api/swipes",
    token: token1,
    tokenLabel: "{{USER1_TOKEN}}",
    body: { target_id: user2Id, action: "like" }
  });
}

if (token2 && user1Id) {
  await callCurl("swipe_user2_like_user1", {
    method: "POST",
    path: "/api/swipes",
    token: token2,
    tokenLabel: "{{USER2_TOKEN}}",
    body: { target_id: user1Id, action: "like" }
  });
}

let user1NotificationId = null;
if (token1) {
  const notifications1 = await callCurl("notifications_user1", {
    path: "/api/notifications?limit=30",
    token: token1,
    tokenLabel: "{{USER1_TOKEN}}"
  });
  await callCurl("matches_user1", { path: "/api/matches", token: token1, tokenLabel: "{{USER1_TOKEN}}" });
  user1NotificationId = notifications1.rawResponse?.notifications?.[0]?.id || null;
}

if (token1 && user1NotificationId) {
  await callCurl("notification_read_user1", {
    method: "PATCH",
    path: `/api/notifications/${user1NotificationId}/read`,
    token: token1,
    tokenLabel: "{{USER1_TOKEN}}"
  });
}

if (token2) {
  await callCurl("notifications_user2", { path: "/api/notifications?limit=30", token: token2, tokenLabel: "{{USER2_TOKEN}}" });
  await callCurl("matches_user2", { path: "/api/matches", token: token2, tokenLabel: "{{USER2_TOKEN}}" });
}

if (token1 && user2Id) {
  await callCurl("report_user2_by_user1", {
    method: "POST",
    path: "/api/reports",
    token: token1,
    tokenLabel: "{{USER1_TOKEN}}",
    body: { reported_id: user2Id, reason: "spam", details: "curl sequential api test" }
  });
}

if (token2 && user1Id) {
  await callCurl("block_user1_by_user2", {
    method: "POST",
    path: "/api/blocks",
    token: token2,
    tokenLabel: "{{USER2_TOKEN}}",
    body: { blocked_id: user1Id }
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
    success: calls.filter((call) => call.status >= 200 && call.status < 300).length,
    failure: calls.filter((call) => call.status < 200 || call.status >= 300).length
  },
  calls
};

writeFileSync("curl-api-report.json", `${JSON.stringify(report, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(report.summary)}\n`);
