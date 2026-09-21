const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const locketService = require('./locketService');
const locketGoldService = require('./locketGoldService');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure Multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Route for VIP Boarding Pass page
app.get('/gold', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'gold.html'));
});

// API Routes

/**
 * POST /api/login
 * Body: { email, password, apiKey? }
 */
app.post('/api/login', async (req, res) => {
  const { email, password, apiKey } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email và mật khẩu không được để trống.' });
  }

  try {
    const authData = await locketService.login(email, password, apiKey);
    res.json(authData);
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(401).json({ error: error.message });
  }
});

/**
// Cache for user moments uploaded in the current session
const userSessionMoments = new Map();

/**
 * POST /api/user-profile
 * Body: { idToken, apiKey? }
 */
app.post('/api/user-profile', async (req, res) => {
  const { idToken, apiKey } = req.body;
  if (!idToken) {
    return res.status(400).json({ error: 'Thiếu ID Token.' });
  }

  try {
    const profile = await locketService.getUserProfile(idToken, apiKey);
    res.json({ success: true, profile });
  } catch (error) {
    console.error('Fetch profile error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/user-moments-and-friends
 * Body: { idToken, userId }
 */
app.post('/api/user-moments-and-friends', async (req, res) => {
  const { idToken, userId } = req.body;
  if (!idToken || !userId) {
    return res.status(400).json({ error: 'Thiếu ID Token hoặc User ID.' });
  }

  try {
    const data = await locketService.getMomentsAndFriends(idToken, userId);
    
    // Merge session uploaded moments (prepend at front)
    const sessionList = userSessionMoments.get(userId) || [];
    const mergedMoments = [...sessionList];
    
    data.moments.forEach(m => {
      if (!mergedMoments.some(sm => sm.thumbnailUrl === m.thumbnailUrl)) {
        mergedMoments.push(m);
      }
    });

    data.moments = mergedMoments;
    data.stats.totalMoments = mergedMoments.length;
    res.json({ success: true, data });
  } catch (error) {
    console.error('Moments and friends error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/change-profile-name
 * Body: { idToken, firstName, lastName }
 */
app.post('/api/change-profile-name', async (req, res) => {
  const { idToken, firstName, lastName } = req.body;
  if (!idToken) {
    return res.status(400).json({ error: 'Thiếu ID Token xác thực.' });
  }

  try {
    const result = await locketService.changeProfileName(idToken, firstName, lastName);
    res.json(result);
  } catch (error) {
    console.error('Change profile name error:', error.message);
    res.status(400).json({ error: error.message });
  }
});


/**
 * POST /api/post-photo
 * Form Data: photo (file), caption (text), idToken (text), userId (text), email?, password?
 */
app.post('/api/post-photo', upload.single('photo'), async (req, res) => {
  try {
    let { idToken, userId, caption, email, password, server } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Vui lòng chọn 1 tệp hình ảnh.' });
    }

    // Auto-login if token is missing
    if (!idToken || !userId) {
      if (email && password) {
        const auth = await locketService.login(email, password);
        idToken = auth.idToken;
        userId = auth.localId;
      } else {
        return res.status(400).json({ error: 'Thiếu ID Token hoặc thông tin tài khoản Locket.' });
      }
    }

    console.log(`[Photo Upload] Uploading photo for user ${userId} via Server ${server || '1'}...`);

    // 1. Upload photo to Firebase Storage (Server 1 or Server 2)
    const uploadFn = server === '2' 
      ? locketService.uploadToStorageServer2 
      : locketService.uploadToStorage;

    const thumbnailUrl = await uploadFn(
      idToken,
      userId,
      req.file.buffer,
      req.file.mimetype || 'image/jpeg',
      false
    );

    console.log(`[Photo Upload] Storage URL: ${thumbnailUrl}`);

    // 2. Post moment to Locket API
    const result = await locketService.postMomentV2(idToken, {
      thumbnail_url: thumbnailUrl,
      caption: caption || ''
    });

    // Record to user's live session gallery
    const newMoment = {
      id: `uploaded_${Date.now()}`,
      thumbnailUrl: thumbnailUrl,
      videoUrl: null,
      caption: caption || '',
      date: new Date().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }),
      reactions: { heart: 2, flame: 1, love: 1, total: 4 },
      isOwner: true
    };
    if (!userSessionMoments.has(userId)) userSessionMoments.set(userId, []);
    userSessionMoments.get(userId).unshift(newMoment);

    res.json({
      success: true,
      server: server === '2' ? 'Server 2 (Backup/Fast)' : 'Server 1 (Default)',
      message: `Đăng ảnh lên Locket thành công (qua Server ${server || '1'})!`,
      thumbnail_url: thumbnailUrl,
      moment: newMoment,
      result: result.data
    });
  } catch (error) {
    console.error('Post photo error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/post-video
 * Form Data: video (file), thumbnail (file), caption (text), idToken (text), userId (text), email?, password?
 */
app.post('/api/post-video', upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
  try {
    let { idToken, userId, caption, email, password, server } = req.body;

    const videoFile = req.files?.['video']?.[0];
    const thumbFile = req.files?.['thumbnail']?.[0];

    if (!videoFile) {
      return res.status(400).json({ error: 'Vui lòng chọn 1 tệp video.' });
    }

    // Auto-login if token is missing
    if (!idToken || !userId) {
      if (email && password) {
        const auth = await locketService.login(email, password);
        idToken = auth.idToken;
        userId = auth.localId;
      } else {
        return res.status(400).json({ error: 'Thiếu ID Token hoặc thông tin tài khoản Locket.' });
      }
    }

    console.log(`[Video Upload] Uploading video for user ${userId} via Server ${server || '1'}...`);

    const uploadFn = server === '2' 
      ? locketService.uploadToStorageServer2 
      : locketService.uploadToStorage;

    // 1. Upload video to Storage
    const videoUrl = await uploadFn(
      idToken,
      userId,
      videoFile.buffer,
      videoFile.mimetype || 'video/mp4',
      true
    );

    console.log(`[Video Upload] Video Storage URL: ${videoUrl}`);

    // 2. Upload thumbnail to Storage
    let thumbnailUrl = videoUrl;
    if (thumbFile) {
      thumbnailUrl = await uploadFn(
        idToken,
        userId,
        thumbFile.buffer,
        thumbFile.mimetype || 'image/jpeg',
        false
      );
      console.log(`[Video Upload] Thumbnail Storage URL: ${thumbnailUrl}`);
    }

    // 3. Post moment to Locket API
    const result = await locketService.postMomentV2(idToken, {
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl,
      caption: caption || ''
    });

    const newMoment = {
      id: `uploaded_${Date.now()}`,
      thumbnailUrl: thumbnailUrl,
      videoUrl: videoUrl,
      caption: caption || '',
      date: new Date().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }),
      reactions: { heart: 3, flame: 2, love: 1, total: 6 },
      isOwner: true
    };
    if (!userSessionMoments.has(userId)) userSessionMoments.set(userId, []);
    userSessionMoments.get(userId).unshift(newMoment);

    res.json({
      success: true,
      server: server === '2' ? 'Server 2 (Backup/Fast)' : 'Server 1 (Default)',
      message: `Đăng video lên Locket thành công (qua Server ${server || '1'})!`,
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl,
      moment: newMoment,
      result: result.data
    });
  } catch (error) {
    console.error('Post video error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ========================================================
// SERVER 2: LOCKET GOLD AUTOMATION PIPELINE
// Based on: https://github.com/thanhdo1110/Locket-Gold
// ========================================================

/**
 * POST /api/server2/resolve-user
 * Body: { username }
 */
app.post('/api/server2/resolve-user', async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Vui lòng cung cấp Username hoặc Link Locket.' });
  }

  try {
    const user = await locketGoldService.resolveUid(username);
    res.json({ success: true, user });
  } catch (error) {
    console.error('Resolve user error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/server2/check-status
 * Body: { uid }
 */
app.post('/api/server2/check-status', async (req, res) => {
  const { uid } = req.body;
  if (!uid) {
    return res.status(400).json({ error: 'Vui lòng cung cấp UID.' });
  }

  try {
    const status = await locketGoldService.checkRevenueCatStatus(uid);
    res.json(status);
  } catch (error) {
    console.error('Check status error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/server2/activate-gold
 * Body: { username, fetchToken?, appTransaction?, nextDnsApiKey?, isSandbox? }
 */
app.post('/api/server2/activate-gold', async (req, res) => {
  const { username, fetchToken, appTransaction, nextDnsApiKey, isSandbox } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Vui lòng cung cấp Username hoặc Link Locket.' });
  }

  try {
    console.log(`[Server 2 Gold] Running activation pipeline for: ${username}...`);
    const result = await locketGoldService.runLocketGoldPipeline(username, {
      fetchToken,
      appTransaction,
      nextDnsApiKey,
      isSandbox
    });

    res.json({
      success: true,
      message: `Đã thực thi pipeline Locket Gold cho @${result.user.username}!`,
      data: result
    });
  } catch (error) {
    console.error('Activate gold error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 Locket Web App đang chạy tại: http://localhost:${PORT}`);
  console.log(`===================================================`);
});
