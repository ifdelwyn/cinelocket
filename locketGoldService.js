const axios = require('axios');

const REVENUECAT_BASE_URL = 'https://api.revenuecat.com/v1';
const REVENUECAT_BEARER = 'Bearer appl_JngFETzdodyLmCREOlwTUtXdQik';

const REVENUECAT_HEADERS = {
  'Host': 'api.revenuecat.com',
  'Authorization': REVENUECAT_BEARER,
  'Content-Type': 'application/json',
  'Accept': '*/*',
  'X-Platform': 'iOS',
  'X-Platform-Version': 'Version 26.2 (Build 23C55)',
  'X-Platform-Device': 'iPhone15,3',
  'X-Platform-Flavor': 'native',
  'X-Version': '5.41.0',
  'X-Client-Version': '2.32.2',
  'X-Client-Bundle-ID': 'com.locket.Locket',
  'X-Client-Build-Version': '3',
  'X-StoreKit2-Enabled': 'true',
  'X-StoreKit-Version': '2',
  'X-Observer-Mode-Enabled': 'false',
  'X-Is-Sandbox': 'false',
  'X-Storefront': 'VNM',
  'X-Apple-Device-Identifier': '39A73C25-1E05-4350-ADA7-5CD3FE1079E8',
  'X-Preferred-Locales': 'vi_KR,ko_KR,en_KR',
  'X-Nonce': 'w0Mlb6+AmV4WYuVv',
  'X-Is-Backgrounded': 'false',
  'X-Retry-Count': '0',
  'X-Is-Debug-Build': 'false',
  'User-Agent': 'Locket/3 CFNetwork/3860.300.31 Darwin/25.2.0',
  'Accept-Language': 'vi-VN,vi;q=0.9',
  'Connection': 'keep-alive',
  'Pragma': 'no-cache',
  'Cache-Control': 'no-cache'
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Phân giải username hoặc link Locket thành UID 28 ký tự với cơ chế tự động thử lại
 */
async function resolveUid(input, retryCount = 3) {
  if (!input || typeof input !== 'string') {
    throw new Error('Vui lòng nhập Username hoặc Link Locket hợp lệ.');
  }

  let cleaned = input.trim().replace(/^@/, '');

  if (cleaned.includes('locket.cam/')) {
    cleaned = cleaned.split('locket.cam/')[1].split('?')[0].split('/')[0];
  } else if (cleaned.includes('locket.camera/')) {
    cleaned = cleaned.split('locket.camera/')[1].split('?')[0].split('/')[0];
  }

  // Hỗ trợ nhập trực tiếp UID 28 ký tự
  if (/^[A-Za-z0-9]{28}$/.test(cleaned)) {
    return {
      uid: cleaned,
      username: cleaned,
      avatarUrl: `https://firebasestorage.googleapis.com/v0/b/locket-img/o/users%2F${cleaned}%2Fpublic%2Fprofile_pic.webp?alt=media`,
      source: 'direct_uid'
    };
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
        timeout: 25000 // Tăng timeout lên 25s chống gián đoạn mạng
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
 * Thực thi gửi Receipt Payload lên RevenueCat API
 */
async function injectGoldReceipt(uid, tokenConfig = {}) {
  const url = `${REVENUECAT_BASE_URL}/receipts`;

  const fetchToken = tokenConfig.fetchToken || tokenConfig.fetch_token || '';
  const appTransaction = tokenConfig.appTransaction || tokenConfig.app_transaction || '';
  const isSandbox = Boolean(tokenConfig.isSandbox || tokenConfig.is_sandbox);

  const payload = {
    product_id: 'locket_199_1m',
    fetch_token: fetchToken,
    app_transaction: appTransaction,
    app_user_id: uid,
    is_restore: true,
    store_country: 'VNM',
    currency: 'USD',
    price: '1.99',
    normal_duration: 'P1M',
    subscription_group_id: '21419447',
    observer_mode: false,
    initiation_source: 'restore',
    offers: [],
    attributes: {
      '$attConsentStatus': {
        updated_at_ms: Date.now(),
        value: 'notDetermined'
      }
    }
  };

  const headers = { ...REVENUECAT_HEADERS };
  headers['Content-Length'] = String(Buffer.byteLength(JSON.stringify(payload)));
  headers['X-Is-Sandbox'] = String(isSandbox);

  if (tokenConfig.hashParams) headers['X-Post-Params-Hash'] = tokenConfig.hashParams;
  if (tokenConfig.hashHeaders) headers['X-Headers-Hash'] = tokenConfig.hashHeaders;

  try {
    const res = await axios.post(url, payload, {
      headers,
      timeout: 20000
    });

    return {
      success: res.status === 200,
      statusCode: res.status,
      data: res.data
    };
  } catch (err) {
    return {
      success: false,
      statusCode: err.response?.status || 500,
      error: err.response?.data?.message || err.message,
      errorCode: err.response?.data?.code || null,
      raw: err.response?.data || null
    };
  }
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

  // Bước 3: Gửi payload kích hoạt
  addLog('Đang truyền dữ liệu xác thực quyền lợi Gold...');
  const injectResult = await injectGoldReceipt(userObj.uid, {
    fetchToken: options.fetchToken || '',
    appTransaction: options.appTransaction || '',
    isSandbox: options.isSandbox || false
  });

  if (injectResult.success) {
    addLog('Hệ thống xác thực phản hồi 200 OK! Gói Gold đã được ghi nhận.', 'success');
  } else {
    addLog(`Xác nhận yêu cầu (${injectResult.statusCode}): ${injectResult.error || 'Đang cập nhật phiên bản dịch vụ.'}`, 'warn');
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
