// Locket Gold VIP 2099 Unlocker (Shadowrocket, Loon, Quantumult X, Surge)
let obj;
try {
  obj = JSON.parse($response.body);
} catch (e) {
  obj = {};
}

const goldEntitlement = {
  grace_period_expires_date: null,
  purchase_date: "2024-01-01T00:00:00Z",
  product_identifier: "locket_3600_1y",
  expires_date: "2099-12-31T23:59:59Z"
};

const goldSubscription = {
  is_sandbox: false,
  ownership_type: "PURCHASED",
  billing_issues_detected_at: null,
  expires_date: "2099-12-31T23:59:59Z",
  original_purchase_date: "2024-01-01T00:00:00Z",
  purchase_date: "2024-01-01T00:00:00Z",
  store: "app_store"
};

if (!obj.subscriber) {
  obj.subscriber = {
    entitlements: {},
    subscriptions: {},
    non_subscriptions: {},
    first_seen: "2024-01-01T00:00:00Z",
    original_application_version: "1.0",
    other_purchases: {},
    management_url: null
  };
}

obj.subscriber.entitlements = obj.subscriber.entitlements || {};
obj.subscriber.entitlements["Gold"] = goldEntitlement;
obj.subscriber.subscriptions = obj.subscriber.subscriptions || {};
obj.subscriber.subscriptions["locket_3600_1y"] = goldSubscription;

$done({ body: JSON.stringify(obj) });
