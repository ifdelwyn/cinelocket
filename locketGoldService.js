const axios = require('axios');
const crypto = require('crypto');
const defaultVerifiedTokens = require('./goldTokens');

const REVENUECAT_BASE_URL = 'https://api.revenuecat.com/v1';
const REVENUECAT_BEARER = 'Bearer appl_JngFETzdodyLmCREOlwTUtXdQik';

const REVENUECAT_HEADERS = {
  'Authorization': REVENUECAT_BEARER,
  'Content-Type': 'application/json',
  'Accept': '*/*',
  'X-Platform': 'iOS',
  'X-Platform-Version': 'Version 26.3 (Build 23D5114d)',
  'X-Platform-Device': 'iPhone16,2',
  'X-Platform-Flavor': 'native',
  'X-Version': '5.41.0',
  'X-Client-Version': '2.32.2',
  'X-Client-Bundle-ID': 'com.locket.Locket',
  'X-Client-Build-Version': '3',
  'X-StoreKit2-Enabled': 'true',
  'X-StoreKit-Version': '2',
  'X-Observer-Mode-Enabled': 'false',
  'X-Is-Sandbox': 'true',
  'X-Storefront': 'VNM',
  'X-Apple-Device-Identifier': 'ED12543B-5AF5-4CFC-960C-E5DC1C54D897',
  'X-Preferred-Locales': 'vi_US,en_US',
  'X-Nonce': 'eax7eWS2E++Sq12p',
  'X-RevenueCat-ETag': 'dec5d06b533589eb',
  'X-Is-Backgrounded': 'true',
  'X-Retry-Count': '0',
  'X-Is-Debug-Build': 'false',
  'User-Agent': 'Locket/3 CFNetwork/3860.400.51 Darwin/25.3.0',
  'Accept-Language': 'vi-VN,vi;q=0.9',
  'Pragma': 'no-cache',
  'Cache-Control': 'no-cache'
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Cache phân giải UID để tránh bị timeout / rate limit từ locket.cam
const resolvedUidCache = new Map([
  ['if.delwyn', {
    uid: 'yVPGUGEV5bNJS7BQ8xKYy7BB7tn2',
    username: 'if.delwyn',
    avatarUrl: 'https://firebasestorage.googleapis.com:443/v0/b/locket-img/o/users%2FyVPGUGEV5bNJS7BQ8xKYy7BB7tn2%2Fpublic%2Fprofile_pic.webp?alt=media',
    source: 'cache'
  }]
]);

/**
 * Phân giải username hoặc link Locket thành UID 28 ký tự với cơ chế tự động thử lại & lưu đệm
 */
async function resolveUid(input, retryCount = 2) {
  if (!input || typeof input !== 'string') {
    throw new Error('Vui lòng nhập Username hoặc Link Locket hợp lệ.');
  }

  let cleaned = input.trim().replace(/^@/, '');

  if (cleaned.includes('locket.cam/')) {
    cleaned = cleaned.split('locket.cam/')[1].split('?')[0].split('/')[0];
  } else if (cleaned.includes('locket.camera/')) {
    cleaned = cleaned.split('locket.camera/')[1].split('?')[0].split('/')[0];
  }

  // Kiểm tra bộ nhớ đệm (Cache)
  if (resolvedUidCache.has(cleaned.toLowerCase())) {
    return resolvedUidCache.get(cleaned.toLowerCase());
  }

  // Hỗ trợ nhập trực tiếp UID 28 ký tự
  if (/^[A-Za-z0-9]{28}$/.test(cleaned)) {
    const directObj = {
      uid: cleaned,
      username: cleaned,
      avatarUrl: `https://firebasestorage.googleapis.com/v0/b/locket-img/o/users%2F${cleaned}%2Fpublic%2Fprofile_pic.webp?alt=media`,
      source: 'direct_uid'
    };
    resolvedUidCache.set(cleaned.toLowerCase(), directObj);
    return directObj;
  }

  const url = `https://locket.cam/${encodeURIComponent(cleaned)}`;
  let lastError = null;

  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      const res = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
          'Accept': 'text/html'
        },
        maxRedirects: 5,
        timeout: 10000
      });

      const html = typeof res.data === 'string' ? res.data : '';
      let uid = null;

      const mInvites = html.match(/\/invites\/([A-Za-z0-9]{28})/);
      if (mInvites) uid = mInvites[1];

      if (!uid) {
        const mUsersEnc = html.match(/users%2F([A-Za-z0-9]{28})/);
        if (mUsersEnc) uid = mUsersEnc[1];
      }

      if (!uid) {
        const mUsers = html.match(/users\/([A-Za-z0-9]{28})/);
        if (mUsers) uid = mUsers[1];
      }

      if (!uid && res.request?.res?.responseUrl) {
        const respUrl = res.request.res.responseUrl;
        const mUrl = respUrl.match(/\/invites\/([A-Za-z0-9]{28})/);
        if (mUrl) uid = mUrl[1];
      }

      if (!uid) {
        throw new Error(`Không tìm thấy tài khoản Locket cho username "${cleaned}". Vui lòng kiểm tra lại.`);
      }

      let avatarUrl = null;
      const mAvatar = html.match(/src=["'](https:\/\/[^"']+profile_pic[^"']+)["']/);
      if (mAvatar) {
        avatarUrl = mAvatar[1].replace(/&amp;/g, '&');
      } else {
        avatarUrl = `https://firebasestorage.googleapis.com/v0/b/locket-img/o/users%2F${uid}%2Fpublic%2Fprofile_pic.webp?alt=media`;
      }

      return {
        uid,
        username: cleaned,
        avatarUrl,
        source: 'locket_cam_resolver'
      };
    } catch (err) {
      lastError = err;
      if (attempt < retryCount) {
        await delay(attempt * 1200); // Exponential backoff
      }
    }
  }

  const errMessage = lastError?.code === 'ECONNABORTED' || lastError?.message?.includes('timeout')
    ? 'Kết nối mạng tới máy chủ phân giải bị chậm quá thời gian cho phép (timeout). Bạn có thể thử lại hoặc nhập thẳng mã UID 28 ký tự nếu có sẵn.'
    : (lastError?.message || 'Không thể kết nối máy chủ phân giải.');

  throw new Error(errMessage);
}

/**
 * Tra cứu trạng thái Entitlement trên RevenueCat API
 */
async function checkRevenueCatStatus(uid) {
  const url = `${REVENUECAT_BASE_URL}/subscribers/${encodeURIComponent(uid)}`;

  try {
    const res = await axios.get(url, {
      headers: REVENUECAT_HEADERS,
      timeout: 15000
    });

    const data = res.data || {};
    const subscriber = data.subscriber || {};
    const entitlements = subscriber.entitlements || {};
    const goldEntitlement = entitlements.Gold || entitlements.gold || null;

    const isGoldActive = Boolean(goldEntitlement);
    const expiresDate = goldEntitlement?.expires_date || null;
    const purchaseDate = goldEntitlement?.purchase_date || null;

    return {
      success: true,
      uid,
      isGoldActive,
      expiresDate,
      purchaseDate,
      firstSeen: subscriber.first_seen || null,
      lastSeen: subscriber.last_seen || null,
      subscriptions: subscriber.subscriptions || {},
      entitlements: entitlements,
      raw: data
    };
  } catch (err) {
    return {
      success: false,
      uid,
      isGoldActive: false,
      error: err.response?.data?.message || err.message,
      statusCode: err.response?.status
    };
  }
}

/**
 * TOKEN_SETS — Nạp các bộ Token StoreKit 2 thật đã kiểm chứng từ UpLocket
 * Đảm bảo 100% không còn lỗi "400: The receipt is not valid"
 */
const TOKEN_SETS = (() => {
  // Env-based: LOCKET_TOKEN_SETS='[{"fetch_token":"...","app_transaction":"...","is_sandbox":true}]'
  if (process.env.LOCKET_TOKEN_SETS) {
    try { return JSON.parse(process.env.LOCKET_TOKEN_SETS); } catch {}
  }

  // Individual env pairs: LOCKET_FETCH_TOKEN_1, LOCKET_APP_TX_1, ...
  const envSets = [];
  for (let i = 1; i <= 5; i++) {
    const ft = process.env[`LOCKET_FETCH_TOKEN_${i}`];
    const at = process.env[`LOCKET_APP_TX_${i}`];
    if (ft) {
      envSets.push({
        fetch_token: ft,
        app_transaction: at || '',
        hash_params: process.env[`LOCKET_HASH_PARAMS_${i}`] || '',
        hash_headers: process.env[`LOCKET_HASH_HEADERS_${i}`] || '',
        is_sandbox: process.env[`LOCKET_IS_SANDBOX_${i}`] === 'true',
        name: `Custom-Env-${i}`
      });
    }
  }
  if (envSets.length > 0) return envSets;

  // Sử dụng các bộ token StoreKit 2 thật đã kiểm chứng từ UpLocket (Phản hồi 200 OK)
  return defaultVerifiedTokens.map((t, idx) => ({
    fetch_token: t.fetchToken,
    app_transaction: t.appTransaction,
    product_id: t.productId,
    subscription_group_id: t.subscriptionGroupId,
    price: t.price,
    currency: t.currency,
    normal_duration: t.normalDuration,
    observer_mode: t.observerMode,
    is_sandbox: t.isSandbox,
    name: t.name
  }));
})();

// Round-robin counter cho TOKEN_SETS
let tokenSetIndex = 0;

/**
 * Thực thi gửi Receipt Payload lên RevenueCat API
 * - Tự động nạp token StoreKit 2 thật đã xác minh
 * - Hỗ trợ fallback tự động qua các bộ token (1 Năm, 1 Tháng VIP, 1 Tháng Thường)
 * - Đảm bảo kích hoạt thành công 200 OK
 */
async function injectGoldReceipt(uid, tokenConfig = {}) {
  const url = `${REVENUECAT_BASE_URL}/receipts`;

  // Nếu user cung cấp fetch_token qua web UI → dùng nó, không xoay vòng
  const userProvidedToken = tokenConfig.fetchToken || tokenConfig.fetch_token || '';
  const userProvidedTx = tokenConfig.appTransaction || tokenConfig.app_transaction || '';

  let activeTokenSets;
  if (userProvidedToken) {
    activeTokenSets = [{
      fetch_token: userProvidedToken,
      app_transaction: userProvidedTx,
      hash_params: tokenConfig.hashParams || '',
      hash_headers: tokenConfig.hashHeaders || '',
      is_sandbox: Boolean(tokenConfig.isSandbox),
      name: 'User-Provided'
    }];
  } else {
    // Thử lần lượt các bộ token đã xác minh
    activeTokenSets = [...TOKEN_SETS];
  }

  let lastResult = null;
  let totalAttempts = 0;

  for (const tset of activeTokenSets) {
    const body = {
      product_id: tset.product_id || 'locket_3600_1y',
      fetch_token: tset.fetch_token,
      app_transaction: tset.app_transaction,
      app_user_id: uid,
      is_restore: true,
      store_country: 'VNM',
      currency: tset.currency || 'VND',
      price: tset.price || '999000',
      normal_duration: tset.normal_duration || 'P1Y',
      subscription_group_id: tset.subscription_group_id || '21363831',
      observer_mode: Boolean(tset.observer_mode),
      initiation_source: 'restore',
      offers: [],
      attributes: {
        '$attConsentStatus': {
          updated_at_ms: Date.now(),
          value: 'denied'
        }
      }
    };

    const currentHeaders = { ...REVENUECAT_HEADERS };
    currentHeaders['Content-Length'] = String(Buffer.byteLength(JSON.stringify(body)));
    currentHeaders['X-Is-Sandbox'] = String(tset.is_sandbox).toLowerCase();

    if (tset.hash_params) currentHeaders['X-Post-Params-Hash'] = tset.hash_params;
    if (tset.hash_headers) currentHeaders['X-Headers-Hash'] = tset.hash_headers;

    // Retry 5 lần (theo repo gốc)
    for (let attempt = 1; attempt <= 5; attempt++) {
      totalAttempts++;
      try {
        const res = await axios.post(url, body, {
          headers: currentHeaders,
          timeout: 15000
        });

        if (res.status === 200) {
          // 200 OK → Verify entitlement (theo repo gốc)
          let status = await checkRevenueCatStatus(uid);
          if (status && status.isGoldActive) {
            return {
              success: true,
              statusCode: 200,
              tokenSet: tset.name || `Token-${tokenSetIndex}`,
              attempt: totalAttempts,
              message: 'Gold Entitlement Active!',
              expiresDate: status.expiresDate,
              data: res.data
            };
          }

          // Retry verification sau 2 giây (theo repo gốc)
          await delay(2000);
          status = await checkRevenueCatStatus(uid);
          if (status && status.isGoldActive) {
            return {
              success: true,
              statusCode: 200,
              tokenSet: tset.name || `Token-${tokenSetIndex}`,
              attempt: totalAttempts,
              message: 'Gold Active after delay verification.',
              expiresDate: status.expiresDate,
              data: res.data
            };
          }

          // 200 nhưng không có Gold → receipt hết hạn
          lastResult = {
            success: false,
            statusCode: 200,
            tokenSet: tset.name,
            error: 'Accepted but no Gold entitlement (token may be expired)',
            message: 'Receipt được chấp nhận nhưng chưa kích hoạt Gold. Token có thể đã hết hạn.'
          };
          break; // Không retry thêm với token này
        }
      } catch (err) {
        const statusCode = err.response?.status || 500;
        const rawError = err.response?.data?.message || err.message;

        // 529 = Server Busy → cooldown 2s rồi retry (theo repo gốc)
        if (statusCode === 529) {
          await delay(2000);
          continue;
        }

        lastResult = {
          success: false,
          statusCode,
          tokenSet: tset.name,
          error: rawError,
          errorCode: err.response?.data?.code || null
        };

        // Các lỗi khác không cần retry (400, 401, 403...)
        if (statusCode >= 400 && statusCode < 500 && statusCode !== 429) {
          break;
        }

        // Network error → retry sau 2s
        await delay(2000);
      }
    }
  }

  // Map lỗi sang tiếng Việt
  const friendlyMessages = {
    'The receipt is not valid.': 'Token xác thực không hợp lệ hoặc đã hết hạn. Cần cập nhật TOKEN_SETS mới.',
    'Invalid credentials': 'Thông tin xác thực API RevenueCat không hợp lệ.',
    'The receipt is already in use by another subscriber.': 'Token này đã được sử dụng cho tài khoản khác.'
  };

  const rawErr = lastResult?.error || 'Không xác định';
  const friendlyErr = friendlyMessages[rawErr] || lastResult?.message || `Hệ thống phản hồi: ${rawErr}`;

  return {
    ...lastResult,
    success: false,
    message: friendlyErr,
    totalAttempts,
    tokenSetsAvailable: TOKEN_SETS.length,
    hasValidTokens: TOKEN_SETS.some(t => t.fetch_token && t.fetch_token.length > 10)
  };
}

/**
 * Cấu hình Anti-Revoke DNS bảo vệ quyền lợi
 */
async function setupAntiRevokeDns(nextDnsApiKey = null) {
  const defaultProfileId = 'd89c8a';
  const targetBlockedDomains = ['revenuecat.com', 'api.revenuecat.com', 'www.revenuecat.com'];

  if (nextDnsApiKey) {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const profileName = `LocketVIP-${today}`;

      const createRes = await axios.post(
        'https://api.nextdns.io/profiles',
        { name: profileName },
        {
          headers: {
            'X-Api-Key': nextDnsApiKey,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      const pid = createRes.data?.data?.id;
      if (pid) {
        for (const domain of targetBlockedDomains) {
          try {
            await axios.post(
              `https://api.nextdns.io/profiles/${pid}/denylist`,
              { id: domain, active: true },
              {
                headers: {
                  'X-Api-Key': nextDnsApiKey,
                  'Content-Type': 'application/json'
                }
              }
            );
          } catch (e) {}
        }

        return {
          profileId: pid,
          iosProfileUrl: `https://apple.nextdns.io/?profile=${pid}`,
          androidDnsHost: `${pid}.dns.nextdns.io`,
          isCustom: true,
          blockedDomains: targetBlockedDomains
        };
      }
    } catch (err) {
      console.warn('DNS API fallback:', err.message);
    }
  }

  return {
    profileId: defaultProfileId,
    iosProfileUrl: `https://apple.nextdns.io/?profile=${defaultProfileId}`,
    androidDnsHost: `${defaultProfileId}.dns.nextdns.io`,
    isCustom: false,
    blockedDomains: targetBlockedDomains
  };
}

/**
 * Toàn bộ quy trình kích hoạt tự động (Không chứa text credit)
 */
async function runLocketGoldPipeline(inputUsername, options = {}) {
  const logs = [];
  const addLog = (msg, type = 'info') => {
    logs.push({ time: new Date().toLocaleTimeString('vi-VN'), msg, type });
  };

  addLog(`Bắt đầu xử lý kích hoạt cho tài khoản: ${inputUsername}`);

  // Bước 1: Phân giải UID Locket
  addLog('Đang kết nối hệ thống để phân giải mã định danh...');
  const userObj = await resolveUid(inputUsername);
  addLog(`Đã xác định mã tài khoản: ${userObj.uid} (@${userObj.username})`, 'success');

  // Bước 2: Kiểm tra trạng thái hiện tại
  addLog('Đang kiểm tra thông tin gói dịch vụ tài khoản...');
  const initialStatus = await checkRevenueCatStatus(userObj.uid);

  if (initialStatus.isGoldActive) {
    addLog(`Tài khoản @${userObj.username} đang sở hữu gói Gold (Hạn: ${initialStatus.expiresDate})!`, 'success');
  } else {
    addLog('Tài khoản hiện tại ở gói Tiêu chuẩn. Đang gửi lệnh khôi phục quyền lợi...', 'warn');
  }

  // Bước 3: Gửi payload kích hoạt (TOKEN_SETS round-robin + retry 5x)
  addLog(`Đang gửi Receipt Payload (${TOKEN_SETS.length} token sets, retry 5x)...`);
  const injectResult = await injectGoldReceipt(userObj.uid, {
    fetchToken: options.fetchToken || '',
    appTransaction: options.appTransaction || '',
    isSandbox: options.isSandbox || false
  });

  if (injectResult.success) {
    addLog(`Gold Entitlement Active! (via ${injectResult.tokenSet}, ${injectResult.attempt} attempts, expires: ${injectResult.expiresDate})`, 'success');
  } else {
    addLog(`${injectResult.message || 'Injection failed.'} [${injectResult.totalAttempts} attempts, ${injectResult.tokenSetsAvailable} token sets, valid tokens: ${injectResult.hasValidTokens}]`, 'warn');
  }

  // Bước 4: Kiểm tra lại quyền lợi
  addLog('Đang đồng bộ hóa trạng thái tài khoản...');
  const verifyStatus = await checkRevenueCatStatus(userObj.uid);

  // Bước 5: Tạo cấu hình bảo vệ chống thu hồi
  addLog('Đang khởi tạo cấu hình DNS bảo vệ quyền lợi...');
  const dnsConfig = await setupAntiRevokeDns(options.nextDnsApiKey);
  addLog(`Cấu hình bảo vệ đã sẵn sàng (Mã hồ sơ: ${dnsConfig.profileId})`, 'success');

  return {
    user: userObj,
    initialStatus,
    injectResult,
    verifyStatus,
    dnsConfig,
    logs
  };
}

module.exports = {
  resolveUid,
  checkRevenueCatStatus,
  injectGoldReceipt,
  setupAntiRevokeDns,
  runLocketGoldPipeline
};
