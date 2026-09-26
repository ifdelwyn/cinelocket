// ========================================================
// 1. CINEMATIC PRELOADER CONTROLLER (< 1.2s dismissable)
// ========================================================
(function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  const dismissPreloader = () => {
    preloader.classList.add('preloader-hidden');
    setTimeout(() => {
      preloader.style.display = 'none';
    }, 650);
  };

  const timer = setTimeout(dismissPreloader, 1100);
  preloader.addEventListener('click', () => {
    clearTimeout(timer);
    dismissPreloader();
  });
})();

// ========================================================
// 2. GLOWING MAGNETIC CURSOR SYSTEM (DESKTOP)
// ========================================================
(function initCustomCursor() {
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
    requestAnimationFrame(animateRing);
  }
  animateRing();

  const interactives = 'button, a, input, textarea, select, .tilt-card, [role="button"], label, .cursor-pointer';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactives)) {
      document.body.classList.add('cursor-hover');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactives)) {
      document.body.classList.remove('cursor-hover');
    }
  });
})();

// ========================================================
// 3. REQUIREMENT 1: THREE.JS REAL 3D PINK GLASS ORB / BLOB
// ========================================================
(function initHero3DOrb() {
  const canvas = document.getElementById('hero3DCanvas');
  const fallback = document.getElementById('hero3DFallback');
  if (!canvas) return;

  if (typeof THREE === 'undefined') {
    if (fallback) fallback.classList.remove('hidden');
    canvas.classList.add('hidden');
    return;
  }

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 8.2);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const updateSize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      const width = Math.max(rect.width, 280);
      const height = Math.max(rect.height, 280);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    // Studio Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffe4ef, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xff2e88, 3.2);
    keyLight.position.set(6, 8, 7);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffd9a8, 2.2);
    fillLight.position.set(-6, -4, -3);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xffffff, 2.0, 15);
    rimLight.position.set(0, 4, 4);
    scene.add(rimLight);

    // Main 3D High-Gloss Pink Gem / Glass Orb
    const baseGeo = new THREE.IcosahedronGeometry(2.4, 24);
    const positionAttr = baseGeo.attributes.position;
    const origPositions = positionAttr.array.slice();

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xff3b8d,
      emissive: 0x3d0521,
      roughness: 0.08,
      metalness: 0.12,
      transmission: 0.88,
      ior: 1.52,
      thickness: 2.2,
      reflectivity: 0.95,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      transparent: true,
      opacity: 0.96
    });

    const orbMesh = new THREE.Mesh(baseGeo, glassMaterial);
    scene.add(orbMesh);

    // Elegant Floating Orbital Ring (Champagne Gold & Pink)
    const ringGeo = new THREE.TorusGeometry(3.3, 0.055, 16, 120);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xffd9a8,
      emissive: 0x4a182c,
      roughness: 0.15,
      metalness: 0.9
    });
    const orbitalRing = new THREE.Mesh(ringGeo, ringMat);
    orbitalRing.rotation.x = Math.PI * 0.38;
    orbitalRing.rotation.y = Math.PI * 0.15;
    scene.add(orbitalRing);

    // Satellite Mini Pink Pearls
    const pearls = [];
    for (let i = 0; i < 4; i++) {
      const pGeo = new THREE.SphereGeometry(0.2, 24, 24);
      const pMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0xffffff : 0xff6fa8,
        roughness: 0.1,
        metalness: 0.6
      });
      const pearl = new THREE.Mesh(pGeo, pMat);
      scene.add(pearl);
      pearls.push({
        mesh: pearl,
        angle: (i / 4) * Math.PI * 2,
        dist: 3.3,
        speed: 0.018 * (i % 2 === 0 ? 1 : -1)
      });
    }

    // Interactive Drag & Mouse Reaction
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let rotVelX = 0, rotVelY = 0;
    let targetTiltX = 0, targetTiltY = 0;

    canvas.addEventListener('pointerdown', (e) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('pointermove', (e) => {
      if (isDragging) {
        const deltaX = e.clientX - prevMousePos.x;
        const deltaY = e.clientY - prevMousePos.y;
        rotVelY += deltaX * 0.005;
        rotVelX += deltaY * 0.005;
        prevMousePos = { x: e.clientX, y: e.clientY };
      } else {
        const nx = (e.clientX / window.innerWidth) - 0.5;
        const ny = (e.clientY / window.innerHeight) - 0.5;
        targetTiltX = ny * 0.45;
        targetTiltY = nx * 0.45;
      }
    });

    window.addEventListener('pointerup', () => {
      isDragging = false;
    });

    // Render loop with vertex pulsation and fluid inertia
    let clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Organic fluid pulse on vertices
      const pos = orbMesh.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const ox = origPositions[i * 3];
        const oy = origPositions[i * 3 + 1];
        const oz = origPositions[i * 3 + 2];
        const len = Math.sqrt(ox * ox + oy * oy + oz * oz) || 1;
        const nx = ox / len;
        const ny = oy / len;
        const nz = oz / len;
        
        const wave = 0.12 * Math.sin(nx * 3.5 + elapsed * 2.2) *
                            Math.cos(ny * 3.5 + elapsed * 1.8) *
                            Math.sin(nz * 3.5 + elapsed * 2.0);
        pos.setXYZ(i, ox + nx * wave, oy + ny * wave, oz + nz * wave);
      }
      pos.needsUpdate = true;

      // Inertia & mouse reaction
      orbMesh.rotation.y += 0.007 + rotVelY;
      orbMesh.rotation.x += 0.003 + rotVelX;
      rotVelX *= 0.92;
      rotVelY *= 0.92;

      // Soft tilt towards cursor
      orbMesh.rotation.x += (targetTiltX - orbMesh.rotation.x) * 0.04;
      orbMesh.rotation.y += (targetTiltY - orbMesh.rotation.y) * 0.04;

      // Vertical floating breathing
      orbMesh.position.y = Math.sin(elapsed * 1.6) * 0.18;

      // Orbital ring counter-rotation
      orbitalRing.rotation.z -= 0.008;
      orbitalRing.position.y = orbMesh.position.y;

      // Animate orbiting pearls
      pearls.forEach((p) => {
        p.angle += p.speed;
        p.mesh.position.x = Math.cos(p.angle) * p.dist;
        p.mesh.position.z = Math.sin(p.angle) * p.dist * Math.cos(orbitalRing.rotation.x);
        p.mesh.position.y = Math.sin(p.angle) * p.dist * Math.sin(orbitalRing.rotation.x) + orbMesh.position.y;
      });

      renderer.render(scene, camera);
    };
    animate();

  } catch (err) {
    console.warn('Hero 3D Orb fallback:', err);
    if (fallback) fallback.classList.remove('hidden');
    canvas.classList.add('hidden');
  }
})();

// ========================================================
// 4. REQUIREMENT 3: AMBIENT PARALLAX PETALS & BUBBLES CANVAS
// ========================================================
(function initAmbientParallax() {
  const canvas = document.getElementById('ambientParallaxCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  let mouseX = width / 2;
  let mouseY = height / 2;
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Particle layers: 3 distinct depths (0: deep, 1: mid, 2: foreground)
  const particles = [];
  const count = 35;

  for (let i = 0; i < count; i++) {
    const layer = Math.floor(Math.random() * 3);
    particles.push({
      layer: layer,
      isPetal: Math.random() > 0.45,
      x: Math.random() * width,
      y: Math.random() * height,
      size: layer === 0 ? Math.random() * 6 + 4 : layer === 1 ? Math.random() * 10 + 8 : Math.random() * 16 + 14,
      speedY: layer === 0 ? 0.35 : layer === 1 ? 0.7 : 1.15,
      speedX: (Math.random() - 0.5) * 0.4,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      opacity: layer === 0 ? 0.16 : layer === 1 ? 0.32 : 0.5,
      wobble: Math.random() * 100
    });
  }

  function drawPetal(c, x, y, size, angle, alpha) {
    c.save();
    c.translate(x, y);
    c.rotate(angle);
    c.globalAlpha = alpha;
    c.fillStyle = '#FF6FA8';
    c.beginPath();
    c.moveTo(0, 0);
    c.bezierCurveTo(size * 0.6, -size * 0.8, size * 1.2, -size * 0.3, size * 0.5, size * 0.6);
    c.bezierCurveTo(0, size * 0.3, -size * 0.5, size * 0.6, 0, 0);
    c.fill();
    c.restore();
  }

  function drawBubble(c, x, y, radius, alpha) {
    c.save();
    c.globalAlpha = alpha;
    const grad = c.createRadialGradient(x - radius * 0.3, y - radius * 0.3, radius * 0.1, x, y, radius);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    grad.addColorStop(0.5, 'rgba(255, 182, 213, 0.4)');
    grad.addColorStop(1, 'rgba(255, 46, 136, 0.15)');
    c.fillStyle = grad;
    c.beginPath();
    c.arc(x, y, radius, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    c.lineWidth = 1;
    c.stroke();
    c.restore();
  }

  function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, width, height);

    const normMouseX = (mouseX / width) - 0.5;
    const normMouseY = (mouseY / height) - 0.5;

    particles.forEach((p) => {
      p.wobble += 0.02;
      p.y -= p.speedY;
      p.x += p.speedX + Math.sin(p.wobble) * 0.4;
      p.rotation += p.rotSpeed;

      // Wrap-around
      if (p.y < -50) p.y = height + 50;
      if (p.x < -50) p.x = width + 50;
      if (p.x > width + 50) p.x = -50;

      // Layer parallax factor
      const parallaxFactor = (p.layer + 1) * 22;
      const renderX = p.x - normMouseX * parallaxFactor;
      const renderY = p.y - normMouseY * parallaxFactor;

      if (p.isPetal) {
        drawPetal(ctx, renderX, renderY, p.size, p.rotation, p.opacity);
      } else {
        drawBubble(ctx, renderX, renderY, p.size, p.opacity);
      }
    });
  }
  animate();
})();

// ========================================================
// 5. REQUIREMENT 2: 3D CARD TILT & SPECULAR SHEEN
// ========================================================
(function init3DCardTilt() {
  const cards = document.querySelectorAll('.tilt-card');
  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -5.0;
      const rotateY = ((x - centerX) / centerX) * 5.0;
      
      card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      card.style.transition = 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'none';
    });
  });
})();

// ========================================================
// 6. REQUIREMENT 8: MAGNETIC BUTTONS & LIGHT SWEEP
// ========================================================
(function initMagneticButtons() {
  const btns = document.querySelectorAll('.btn-lux-magnetic');
  btns.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0px, 0px)';
      btn.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    });
    btn.addEventListener('mouseenter', () => {
      btn.style.transition = 'none';
    });
  });
})();

// ========================================================
// 7. REQUIREMENT 5: STATS BLOCK NUMBER COUNT-UP ON SCROLL
// ========================================================
(function initStatsCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  let hasAnimated = false;
  const animateCounters = () => {
    if (hasAnimated) return;
    hasAnimated = true;

    counters.forEach((el) => {
      const target = parseFloat(el.getAttribute('data-target')) || 0;
      const duration = 1800;
      const startTime = performance.now();

      const update = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(target * easeOut);
        el.textContent = current;

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.textContent = target;
        }
      };
      requestAnimationFrame(update);
    });
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounters();
        observer.disconnect();
      }
    });
  }, { threshold: 0.25 });

  const statsBlock = document.getElementById('statsBlock');
  if (statsBlock) observer.observe(statsBlock);
})();

// ========================================================
// 7.1. FLOATING WIDGET STACK 3D INTERACTION CONTROLLER
// ========================================================
(function initFloatingWidgetStack() {
  const stage = document.getElementById('widgetStackStage');
  const group = document.getElementById('widgetStackGroup');
  if (!stage || !group) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768;

  let targetRotX = 0, targetRotY = 0;
  let currentRotX = 0, currentRotY = 0;

  if (!isTouch) {
    // Desktop: Smooth 3D tilt with spring lerp
    stage.addEventListener('mousemove', (e) => {
      const rect = stage.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      // Range: -16deg to +16deg
      targetRotY = (x / (rect.width / 2)) * 16;
      targetRotX = -(y / (rect.height / 2)) * 14;
    });

    stage.addEventListener('mouseenter', () => {
      group.classList.add('is-fanned');
    });

    stage.addEventListener('mouseleave', () => {
      targetRotX = 0;
      targetRotY = 0;
      group.classList.remove('is-fanned');
    });

    function updateTilt() {
      currentRotX += (targetRotX - currentRotX) * 0.12;
      currentRotY += (targetRotY - currentRotY) * 0.12;

      group.style.transform = `perspective(1000px) rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg)`;
      requestAnimationFrame(updateTilt);
    }
    updateTilt();

  } else {
    // Mobile / Touch: Gentle auto-float oscillation + tap to fan out
    let autoFloatAngle = 0;

    function autoFloat() {
      autoFloatAngle += 0.025;
      const autoX = Math.sin(autoFloatAngle) * 5;
      const autoY = Math.cos(autoFloatAngle * 0.8) * 6;
      const autoRotZ = Math.sin(autoFloatAngle * 0.5) * 2;
      group.style.transform = `perspective(1000px) rotateX(${autoX.toFixed(2)}deg) rotateY(${autoY.toFixed(2)}deg) rotateZ(${autoRotZ.toFixed(2)}deg)`;
      requestAnimationFrame(autoFloat);
    }
    autoFloat();

    // Tap to toggle fan-out
    stage.addEventListener('click', () => {
      group.classList.toggle('is-fanned');
    });
  }
})();

// ========================================================
// 7.2. CUSTOMIZABLE WIDGET STACK SLOTS (USER PROVIDED PHOTOS)
// ========================================================
(function initWidgetCustomSlots() {
  const slots = [0, 1, 2];

  function renderSlots() {
    slots.forEach((idx) => {
      const imgEl = document.getElementById(`widgetSlotImg${idx}`);
      const emptyEl = document.getElementById(`widgetEmpty${idx}`);
      if (!imgEl || !emptyEl) return;

      const savedImg = localStorage.getItem(`locket_widget_slot_${idx}`);
      if (savedImg) {
        imgEl.src = savedImg;
        imgEl.classList.remove('hidden');
        emptyEl.classList.add('hidden');
      } else {
        imgEl.classList.add('hidden');
        emptyEl.classList.remove('hidden');
      }
    });
  }

  // Bind upload buttons and hidden inputs
  const uploadBtns = document.querySelectorAll('.btn-slot-upload');
  uploadBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // prevent fan-out toggle
      const slot = btn.getAttribute('data-slot');
      const fileInput = document.getElementById(`slotFileInput${slot}`);
      if (fileInput) fileInput.click();
    });
  });

  const slotInputs = document.querySelectorAll('.slot-file-input');
  slotInputs.forEach((input) => {
    input.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      const slot = input.getAttribute('data-slot');
      if (!file || slot === null) return;

      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const dataUrl = loadEvt.target.result;
        try {
          localStorage.setItem(`locket_widget_slot_${slot}`, dataUrl);
          renderSlots();
          if (typeof logMsg === 'function') {
            logMsg(`Đã cập nhật ảnh widget tùy chỉnh cho khung ${parseInt(slot) + 1}!`, 'success');
          }
        } catch (storageErr) {
          if (typeof logMsg === 'function') {
            logMsg('Ảnh quá lớn không thể lưu vào bộ nhớ cục bộ trình duyệt.', 'warn');
          }
        }
      };
      reader.readAsDataURL(file);
      input.value = '';
    });
  });

  renderSlots();
})();

// ========================================================
// 8. APPLICATION STATE & DOM REFERENCES
// ========================================================
let currentMode = 'photo'; // 'photo' or 'video'
let selectedFile = null;
let currentAuth = null; // { idToken, userId, email, profile }
let selectedServer = '1'; // Default Firebase Storage
// Auth elements
const authStatusBadge = document.getElementById('authStatusBadge');
const authStatusText = document.getElementById('authStatusText');
const authCardTitle = document.getElementById('authCardTitle');
const authCardSubtitle = document.getElementById('authCardSubtitle');
const authNavTabs = document.getElementById('authNavTabs');
const btnTabAuthLogin = document.getElementById('btnTabAuthLogin');
const btnTabAuthToken = document.getElementById('btnTabAuthToken');
const loginForm = document.getElementById('loginForm');
const tokenForm = document.getElementById('tokenForm');
const inputEmail = document.getElementById('inputEmail');
const inputPassword = document.getElementById('inputPassword');
const inputDirectToken = document.getElementById('inputDirectToken');
const btnLogin = document.getElementById('btnLogin');
const btnSaveToken = document.getElementById('btnSaveToken');

// User Profile elements
const userInfoBox = document.getElementById('userInfoBox');
const userAvatarImg = document.getElementById('userAvatarImg');
const userAvatarFallback = document.getElementById('userAvatarFallback');
const userInitialText = document.getElementById('userInitialText');
const userDisplayName = document.getElementById('userDisplayName');
const userEmailValue = document.getElementById('userEmailValue');
const userUidShort = document.getElementById('userUidShort');
const btnCopyUid = document.getElementById('btnCopyUid');
const userCreatedAtText = document.getElementById('userCreatedAtText');
const userLastLoginText = document.getElementById('userLastLoginText');
const userEmailVerifiedBadge = document.getElementById('userEmailVerifiedBadge');
const userProviderText = document.getElementById('userProviderText');
const userAccountStatusText = document.getElementById('userAccountStatusText');
const userPasswordUpdatedText = document.getElementById('userPasswordUpdatedText');
const btnLogout = document.getElementById('btnLogout');
const previewUserLabel = document.getElementById('previewUserLabel');

// Media upload elements
const tabPhoto = document.getElementById('tabPhoto');
const tabVideo = document.getElementById('tabVideo');
const mediaFormatHint = document.getElementById('mediaFormatHint');
const mediaIcon = document.getElementById('mediaIcon');

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const dropPrompt = document.getElementById('dropPrompt');
const previewContainer = document.getElementById('previewContainer');
const imagePreview = document.getElementById('imagePreview');
const videoPreview = document.getElementById('videoPreview');
const btnRemoveFile = document.getElementById('btnRemoveFile');

// 3D Widget Simulator elements
const simWidgetImg = document.getElementById('simWidgetImg');
const simWidgetVideo = document.getElementById('simWidgetVideo');
const simWidgetEmpty = document.getElementById('simWidgetEmpty');
const previewCaptionOverlay = document.getElementById('previewCaptionOverlay');
const previewCaptionText = document.getElementById('previewCaptionText');

// Form & Progress elements
const uploadForm = document.getElementById('uploadForm');
const inputCaption = document.getElementById('inputCaption');
const charCount = document.getElementById('charCount');
const progressWrapper = document.getElementById('progressWrapper');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const progressPercent = document.getElementById('progressPercent');
const btnSubmitUpload = document.getElementById('btnSubmitUpload');
const consoleLog = document.getElementById('consoleLog');
const btnClearConsole = document.getElementById('btnClearConsole');

// User Dashboard Elements
const btnTabMoments = document.getElementById('btnTabMoments');
const btnTabReactions = document.getElementById('btnTabReactions');
const btnTabFriends = document.getElementById('btnTabFriends');
const btnTabProfileEdit = document.getElementById('btnTabProfileEdit');
const btnRefreshUserData = document.getElementById('btnRefreshUserData');
const refreshIcon = document.getElementById('refreshIcon');

const paneMoments = document.getElementById('paneMoments');
const paneReactions = document.getElementById('paneReactions');
const paneFriends = document.getElementById('paneFriends');
const paneProfileEdit = document.getElementById('paneProfileEdit');

const momentsGrid = document.getElementById('momentsGrid');
const momentsEmptyState = document.getElementById('momentsEmptyState');
const friendsGrid = document.getElementById('friendsGrid');
const friendsEmptyState = document.getElementById('friendsEmptyState');
const inputSearchFriend = document.getElementById('inputSearchFriend');
const streakDisplay = document.getElementById('streakDisplay');

const badgeMomentsCount = document.getElementById('badgeMomentsCount');
const badgeReactionsTotal = document.getElementById('badgeReactionsTotal');
const badgeFriendsCount = document.getElementById('badgeFriendsCount');

const statReactionHeart = document.getElementById('statReactionHeart');
const statReactionFlame = document.getElementById('statReactionFlame');
const statReactionLove = document.getElementById('statReactionLove');
const statReactionTotal = document.getElementById('statReactionTotal');

const barHeart = document.getElementById('barHeart');
const barFlame = document.getElementById('barFlame');
const barLove = document.getElementById('barLove');
const barSmile = document.getElementById('barSmile');
const pctHeart = document.getElementById('pctHeart');
const pctFlame = document.getElementById('pctFlame');
const pctLove = document.getElementById('pctLove');
const pctSmile = document.getElementById('pctSmile');

const formChangeName = document.getElementById('formChangeName');
const inputLastName = document.getElementById('inputLastName');
const inputFirstName = document.getElementById('inputFirstName');
const btnSubmitChangeName = document.getElementById('btnSubmitChangeName');
const changeNameMsg = document.getElementById('changeNameMsg');

// Moment Modal Elements
const momentModal = document.getElementById('momentModal');
const btnCloseMomentModal = document.getElementById('btnCloseMomentModal');
const modalMomentDate = document.getElementById('modalMomentDate');
const modalMomentImg = document.getElementById('modalMomentImg');
const modalMomentVideo = document.getElementById('modalMomentVideo');
const modalMomentCaption = document.getElementById('modalMomentCaption');
const modalReactionIcons = document.getElementById('modalReactionIcons');
const modalMomentDownload = document.getElementById('modalMomentDownload');


// ========================================================
// 9. REAL-TIME ACTIVITY LOGGER
// ========================================================
function logMsg(message, type = 'info') {
  const p = document.createElement('p');
  const timestamp = new Date().toLocaleTimeString('vi-VN');
  
  if (type === 'error') {
    p.className = 'text-rose-400 font-semibold flex items-center gap-1.5';
    p.innerHTML = `<span class="text-gray-500">[${timestamp}]</span> <i class="fa-solid fa-circle-xmark text-rose-500"></i> <span>${message}</span>`;
  } else if (type === 'success') {
    p.className = 'text-emerald-300 font-semibold flex items-center gap-1.5';
    p.innerHTML = `<span class="text-gray-500">[${timestamp}]</span> <i class="fa-solid fa-heart text-cinematic-hotpink"></i> <span>${message}</span>`;
  } else if (type === 'warn') {
    p.className = 'text-amber-300 flex items-center gap-1.5';
    p.innerHTML = `<span class="text-gray-500">[${timestamp}]</span> <i class="fa-solid fa-triangle-exclamation text-amber-400"></i> <span>${message}</span>`;
  } else {
    p.className = 'text-pink-200 flex items-center gap-1.5';
    p.innerHTML = `<span class="text-gray-500">[${timestamp}]</span> <i class="fa-solid fa-sparkles text-cinematic-rose"></i> <span>${message}</span>`;
  }

  if (consoleLog) {
    consoleLog.appendChild(p);
    consoleLog.scrollTop = consoleLog.scrollHeight;
  }
}

if (btnClearConsole && consoleLog) {
  btnClearConsole.addEventListener('click', () => {
    consoleLog.innerHTML = '<p class="text-gray-500">[System] Đã dọn dẹp nhật ký.</p>';
  });
}

// ========================================================
// 10. AUTHENTICATION & REAL IDENTITY SYNC
// ========================================================
if (btnTabAuthLogin && btnTabAuthToken) {
  btnTabAuthLogin.addEventListener('click', () => {
    btnTabAuthLogin.className = 'px-4 py-2 rounded-xl bg-white text-cinematic-hotpink shadow-sm transition-all duration-300 flex items-center gap-2';
    btnTabAuthToken.className = 'px-4 py-2 rounded-xl text-gray-600 hover:text-cinematic-hotpink transition-all duration-300 flex items-center gap-2';
    loginForm.classList.remove('hidden');
    tokenForm.classList.add('hidden');
  });

  btnTabAuthToken.addEventListener('click', () => {
    btnTabAuthToken.className = 'px-4 py-2 rounded-xl bg-white text-cinematic-hotpink shadow-sm transition-all duration-300 flex items-center gap-2';
    btnTabAuthLogin.className = 'px-4 py-2 rounded-xl text-gray-600 hover:text-cinematic-hotpink transition-all duration-300 flex items-center gap-2';
    tokenForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
  });
}

async function initAuth() {
  const saved = localStorage.getItem('locket_auth');
  if (saved) {
    try {
      currentAuth = JSON.parse(saved);
      await refreshRealProfile(currentAuth.idToken);
      updateAuthUI();
      logMsg(`Đã khôi phục phiên kết nối Locket: ${currentAuth.profile?.displayName || currentAuth.email}`, 'info');
    } catch (e) {
      console.error(e);
      localStorage.removeItem('locket_auth');
      updateAuthUI();
    }
  } else {
    updateAuthUI();
  }
}

async function refreshRealProfile(idToken) {
  try {
    const res = await fetch('/api/user-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });
    const data = await res.json();
    if (res.ok && data.profile) {
      currentAuth.profile = data.profile;
      currentAuth.userId = data.profile.userId;
      currentAuth.email = data.profile.email;
      localStorage.setItem('locket_auth', JSON.stringify(currentAuth));
    }
  } catch (err) {
    console.warn('Could not refresh profile:', err.message);
  }
}

function updateAuthUI() {
  if (currentAuth && currentAuth.idToken) {
    authStatusBadge.className = 'flex items-center gap-2 px-4 py-2 rounded-xl text-xs bg-emerald-50 text-emerald-800 border border-emerald-300 font-extrabold shadow-sm';
    authStatusBadge.innerHTML = '<span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span><span>Chính chủ Locket 💕</span>';

    authCardTitle.textContent = 'Hồ sơ Định danh Locket Thật';
    authCardSubtitle.textContent = 'Thông tin chính thức trích xuất trực tiếp từ hệ thống Locket';
    authNavTabs.classList.add('hidden');
    loginForm.classList.add('hidden');
    tokenForm.classList.add('hidden');
    userInfoBox.classList.remove('hidden');

    const profile = currentAuth.profile || {};
    const name = profile.displayName || currentAuth.email?.split('@')[0] || 'Locket User';
    const email = profile.email || currentAuth.email || 'Chưa cập nhật email';
    const uid = profile.userId || currentAuth.userId || '...';

    userDisplayName.textContent = name;
    userEmailValue.textContent = email;
    previewUserLabel.textContent = name;

    userUidShort.textContent = uid.length > 14 ? `${uid.substring(0, 12)}...` : uid;
    userUidShort.title = uid;

    userCreatedAtText.textContent = profile.createdAt || 'Không rõ';
    userLastLoginText.textContent = profile.lastLoginAt || 'Vừa xong';

    if (userEmailVerifiedBadge) {
      if (profile.emailVerified) {
        userEmailVerifiedBadge.className = 'font-extrabold text-emerald-700 flex items-center gap-1';
        userEmailVerifiedBadge.innerHTML = '<i class="fa-solid fa-shield-check text-emerald-600"></i> <span>Đã xác minh</span>';
      } else {
        userEmailVerifiedBadge.className = 'font-extrabold text-amber-700 flex items-center gap-1';
        userEmailVerifiedBadge.innerHTML = '<i class="fa-solid fa-triangle-exclamation text-amber-600"></i> <span>Chưa xác minh</span>';
      }
    }

    if (userProviderText) {
      userProviderText.textContent = profile.provider || 'Email & Mật khẩu';
    }

    if (userAccountStatusText) {
      userAccountStatusText.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> <span>Chính chủ • Live</span>';
    }

    if (userPasswordUpdatedText) {
      userPasswordUpdatedText.textContent = profile.passwordUpdatedAt || 'Chưa đổi';
    }

    // Always ensure input fields are cleared
    if (inputEmail) inputEmail.value = '';
    if (inputPassword) inputPassword.value = '';
    if (inputDirectToken) inputDirectToken.value = '';

    if (profile.photoUrl) {
      userAvatarImg.src = profile.photoUrl;
      userAvatarImg.classList.remove('hidden');
      userAvatarFallback.classList.add('hidden');
    } else {
      userAvatarImg.classList.add('hidden');
      userAvatarFallback.classList.remove('hidden');
      userInitialText.textContent = name.charAt(0).toUpperCase();
    }

    // Trigger rich data sync (Moments, Reactions, Friends from Locket)
    loadUserMomentsAndFriends(currentAuth.idToken, currentAuth.userId || currentAuth.profile?.userId);

  } else {
    authStatusBadge.className = 'flex items-center gap-2 px-4 py-2 rounded-xl text-xs bg-white/95 text-cinematic-rose border border-pink-200 font-bold shadow-xs';
    authStatusBadge.innerHTML = '<span class="relative flex h-2 w-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-cinematic-hotpink"></span></span><span id="authStatusText">Chưa kết nối tài khoản</span>';

    authCardTitle.textContent = 'Xác thực Tài khoản Locket';
    authCardSubtitle.textContent = 'Đăng nhập tài khoản thật để đồng bộ hồ sơ Locket chính chủ';
    authNavTabs.classList.remove('hidden');
    userInfoBox.classList.add('hidden');

    // Clear moments, reactions, friends on logout
    clearUserDashboard();

    // Keep inputs clean
    if (inputEmail) inputEmail.value = '';
    if (inputPassword) inputPassword.value = '';

    if (btnTabAuthLogin.classList.contains('bg-white')) {
      loginForm.classList.remove('hidden');
      tokenForm.classList.add('hidden');
    } else {
      tokenForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
    }

    previewUserLabel.textContent = 'Locket Preview';
  }
}

// Copy UID to Clipboard
if (btnCopyUid) {
  btnCopyUid.addEventListener('click', () => {
    const uid = currentAuth?.userId || currentAuth?.profile?.userId;
    if (uid) {
      navigator.clipboard.writeText(uid);
      logMsg(`Đã sao chép User ID: ${uid}`, 'info');
      btnCopyUid.innerHTML = '<i class="fa-solid fa-check text-emerald-500"></i>';
      setTimeout(() => {
        btnCopyUid.innerHTML = '<i class="fa-regular fa-copy"></i>';
      }, 2000);
    }
  });
}

// Login Submission
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = inputEmail.value.trim();
    const password = inputPassword.value;

    btnLogin.disabled = true;
    btnLogin.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> <span>Đang xác thực...</span>';
    logMsg(`Đang tiến hành đăng nhập tài khoản Locket: ${email}...`);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Đăng nhập thất bại.');

      currentAuth = {
        idToken: data.idToken,
        userId: data.localId,
        email: data.email,
        profile: data.profile
      };

      // Clear input fields immediately
      inputEmail.value = '';
      inputPassword.value = '';

      localStorage.setItem('locket_auth', JSON.stringify(currentAuth));
      updateAuthUI();
      logMsg(`Đăng nhập thành công tài khoản: ${currentAuth.profile?.displayName || currentAuth.email}!`, 'success');
      
      if (typeof confetti === 'function') {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
      }
    } catch (err) {
      logMsg(err.message, 'error');
    } finally {
      btnLogin.disabled = false;
      btnLogin.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket"></i> <span>Đăng nhập tài khoản</span>';
    }
  });
}

// Direct Token Submission
if (tokenForm) {
  tokenForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const idToken = inputDirectToken.value.trim();
    if (!idToken) {
      logMsg('Vui lòng nhập ID Token hợp lệ!', 'warn');
      return;
    }

    btnSaveToken.disabled = true;
    btnSaveToken.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> <span>Đang kiểm tra...</span>';
    logMsg('Đang trích xuất dữ liệu hồ sơ từ Token...');

    try {
      const res = await fetch('/api/user-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Token không hợp lệ hoặc đã hết hạn.');

      currentAuth = {
        idToken: idToken,
        userId: data.profile.userId,
        email: data.profile.email,
        profile: data.profile
      };

      localStorage.setItem('locket_auth', JSON.stringify(currentAuth));
      updateAuthUI();
      logMsg(`Xác thực Token thành công! Chào mừng ${data.profile.displayName}.`, 'success');
    } catch (err) {
      logMsg(err.message, 'error');
    } finally {
      btnSaveToken.disabled = false;
      btnSaveToken.innerHTML = '<i class="fa-solid fa-check"></i> <span>Xác thực & Trích xuất Hồ sơ</span>';
    }
  });
}

if (btnLogout) {
  btnLogout.addEventListener('click', () => {
    if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi tài khoản Locket?')) {
      localStorage.removeItem('locket_auth');
      currentAuth = null;
      updateAuthUI();
      logMsg('Đã đăng xuất khỏi tài khoản Locket.', 'warn');
    }
  });
}

// ========================================================
// 11. MEDIA CONTROLS & IPHONE 3D WIDGET SIMULATOR
// ========================================================
if (tabPhoto && tabVideo) {
  tabPhoto.addEventListener('click', () => setMode('photo'));
  tabVideo.addEventListener('click', () => setMode('video'));
}

function setMode(mode) {
  currentMode = mode;
  selectedFile = null;
  clearPreview();

  if (mode === 'photo') {
    tabPhoto.className = 'px-5 py-2.5 rounded-xl bg-white text-cinematic-hotpink shadow-sm transition-all duration-300 flex items-center gap-2';
    tabVideo.className = 'px-5 py-2.5 rounded-xl text-gray-600 hover:text-cinematic-hotpink transition-all duration-300 flex items-center gap-2';
    fileInput.accept = 'image/*';
    mediaIcon.className = 'fa-solid fa-cloud-arrow-up';
    mediaFormatHint.textContent = 'Hỗ trợ các định dạng ảnh JPG, PNG, WEBP';
  } else {
    tabVideo.className = 'px-5 py-2.5 rounded-xl bg-white text-cinematic-hotpink shadow-sm transition-all duration-300 flex items-center gap-2';
    tabPhoto.className = 'px-5 py-2.5 rounded-xl text-gray-600 hover:text-cinematic-hotpink transition-all duration-300 flex items-center gap-2';
    fileInput.accept = 'video/mp4,video/quicktime,video/mov';
    mediaIcon.className = 'fa-solid fa-video';
    mediaFormatHint.textContent = 'Hỗ trợ video ngắn định dạng MP4, MOV (Thời lượng khuyên dùng < 10s)';
  }
}



if (dropZone) {
  dropZone.addEventListener('click', (e) => {
    if (e.target !== btnRemoveFile && !btnRemoveFile.contains(e.target)) {
      fileInput.click();
    }
  });

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('border-cinematic-hotpink', 'bg-pink-100/50');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('border-cinematic-hotpink', 'bg-pink-100/50');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-cinematic-hotpink', 'bg-pink-100/50');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  });
}

if (fileInput) {
  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  });
}

function handleFile(file) {
  selectedFile = file;
  dropPrompt.classList.add('hidden');
  previewContainer.classList.remove('hidden');

  const fileUrl = URL.createObjectURL(file);

  if (currentMode === 'photo') {
    imagePreview.src = fileUrl;
    imagePreview.classList.remove('hidden');
    videoPreview.classList.add('hidden');

    // Sync to iPhone 3D Widget Simulator
    simWidgetImg.src = fileUrl;
    simWidgetImg.classList.remove('hidden');
    simWidgetVideo.classList.add('hidden');
    simWidgetEmpty.classList.add('hidden');

    logMsg(`Đã chọn ảnh: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
  } else {
    videoPreview.src = fileUrl;
    videoPreview.classList.remove('hidden');
    imagePreview.classList.add('hidden');

    // Sync to iPhone 3D Widget Simulator
    simWidgetVideo.src = fileUrl;
    simWidgetVideo.classList.remove('hidden');
    simWidgetImg.classList.add('hidden');
    simWidgetEmpty.classList.add('hidden');

    logMsg(`Đã chọn video: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
  }

  syncCaptionOverlay();
}

if (btnRemoveFile) {
  btnRemoveFile.addEventListener('click', (e) => {
    e.stopPropagation();
    selectedFile = null;
    fileInput.value = '';
    clearPreview();
    logMsg('Đã hủy chọn tệp.', 'warn');
  });
}

function clearPreview() {
  dropPrompt.classList.remove('hidden');
  previewContainer.classList.add('hidden');
  imagePreview.src = '';
  videoPreview.src = '';
  imagePreview.classList.add('hidden');
  videoPreview.classList.add('hidden');

  // Clear 3D Widget Simulator
  simWidgetImg.src = '';
  simWidgetVideo.src = '';
  simWidgetImg.classList.add('hidden');
  simWidgetVideo.classList.add('hidden');
  simWidgetEmpty.classList.remove('hidden');
  previewCaptionOverlay.classList.add('hidden');
}

// Live Synchronized Caption on Widget
if (inputCaption) {
  inputCaption.addEventListener('input', () => {
    charCount.textContent = `${inputCaption.value.length} ký tự`;
    syncCaptionOverlay();
  });
}

function syncCaptionOverlay() {
  const cap = inputCaption.value.trim();
  if (cap && selectedFile) {
    previewCaptionText.textContent = cap;
    previewCaptionOverlay.classList.remove('hidden');
  } else {
    previewCaptionOverlay.classList.add('hidden');
  }
}

// Quick Emojis
document.querySelectorAll('.emoji-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    inputCaption.value += btn.textContent;
    charCount.textContent = `${inputCaption.value.length} ký tự`;
    syncCaptionOverlay();
    inputCaption.focus();
  });
});

// Canvas-based High-Res Video Thumbnail Extractor
function generateVideoThumbnail(videoFile) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = URL.createObjectURL(videoFile);
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(0.5, video.duration / 2);
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 720;
      canvas.height = video.videoHeight || 720;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        URL.revokeObjectURL(video.src);
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Không thể xuất ảnh thumbnail từ video.'));
        }
      }, 'image/jpeg', 0.9);
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Lỗi khi đọc file video để tạo thumbnail.'));
    };
  });
}

// ========================================================
// 12. UPLOAD FLOW & DELIGHT CELEBRATION (CONFETTI)
// ========================================================
if (uploadForm) {
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      logMsg('Vui lòng chọn 1 tệp ảnh hoặc video trước khi gửi!', 'warn');
      return;
    }

    if (!currentAuth || !currentAuth.idToken) {
      logMsg('Bạn chưa kết nối tài khoản Locket! Vui lòng đăng nhập ở khung phía trên.', 'warn');
      document.getElementById('authSection').scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const caption = inputCaption.value.trim();

    btnSubmitUpload.disabled = true;
    btnSubmitUpload.classList.add('opacity-50', 'cursor-not-allowed');
    progressWrapper.classList.remove('hidden');
    updateProgress(12, 'Đang chuẩn bị gói dữ liệu khoảnh khắc...');

    try {
      const formData = new FormData();
      formData.append('idToken', currentAuth.idToken);
      formData.append('userId', currentAuth.userId || 'UserToken');
      formData.append('caption', caption);
      formData.append('server', selectedServer || '1');

      let endpoint = '/api/post-photo';

      if (currentMode === 'photo') {
        formData.append('photo', selectedFile);
        logMsg(`Đang tải ảnh "${selectedFile.name}" lên Locket...`);
        updateProgress(35, 'Đang tải ảnh lên Firebase Storage...');
      } else {
        endpoint = '/api/post-video';
        formData.append('video', selectedFile);
        logMsg(`Đang trích xuất thumbnail & tải video "${selectedFile.name}"...`);
        updateProgress(25, 'Đang tạo thumbnail video...');

        try {
          const thumbBlob = await generateVideoThumbnail(selectedFile);
          formData.append('thumbnail', thumbBlob, 'thumbnail.jpg');
          logMsg('Đã tạo xong thumbnail xem trước sắc nét!');
        } catch (err) {
          logMsg(`Không thể tạo thumbnail (${err.message}). Tiếp tục upload video...`, 'warn');
        }

        updateProgress(50, 'Đang tải video lên Firebase Storage...');
      }

      updateProgress(75, 'Đang kích hoạt Locket API v2 (postMomentV2)...');
      
      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi gửi lên Locket API.');

      updateProgress(100, 'Khoảnh khắc đã xuất hiện trên Widget Locket của bạn bè! 💖');
      logMsg('ĐĂNG THÀNH CÔNG: Khoảnh khắc đã phát sóng tới Widget của bạn bè!', 'success');

      // Add to Moments Gallery immediately
      if (data.moment) {
        addMomentToGallery(data.moment);
        logMsg('Đã cập nhật khoảnh khắc mới vào Kho ảnh đã đăng!');
      }

      // Awwwards-Level Confetti Celebration (Pink & Champagne Gold)
      if (typeof confetti === 'function') {
        const count = 180;
        const defaults = {
          origin: { y: 0.7 },
          colors: ['#FF2E88', '#FF6FA8', '#FFB6D5', '#FFD9A8', '#FFFFFF']
        };

        const fire = (particleRatio, opts) => {
          confetti(Object.assign({}, defaults, opts, {
            particleCount: Math.floor(count * particleRatio)
          }));
        };

        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });
      }

      // Reset Form
      selectedFile = null;
      fileInput.value = '';
      inputCaption.value = '';
      charCount.textContent = '0 ký tự';
      clearPreview();

    } catch (err) {
      logMsg(err.message, 'error');
    } finally {
      btnSubmitUpload.disabled = false;
      btnSubmitUpload.classList.remove('opacity-50', 'cursor-not-allowed');
      setTimeout(() => {
        progressWrapper.classList.add('hidden');
        updateProgress(0, '');
      }, 4500);
    }
  });
}

function updateProgress(percent, text) {
  if (progressBar) progressBar.style.width = `${percent}%`;
  if (progressPercent) progressPercent.textContent = `${percent}%`;
  if (progressText && text) {
    progressText.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin text-cinematic-hotpink"></i> ${text}`;
  }
}

// ========================================================
// 12. USER DASHBOARD & LOCKET DATA (MOMENTS, REACTIONS, FRIENDS, EDIT)
// ========================================================
let userMomentsData = [];
let userFriendsData = [];

function initUserDashboard() {
  // Tab switching
  const tabs = document.querySelectorAll('.user-dash-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active', 'bg-gradient-to-r', 'from-cinematic-hotpink', 'to-cinematic-magenta', 'text-white', 'shadow-sm');
        t.classList.add('text-gray-700');
      });
      tab.classList.add('active', 'bg-gradient-to-r', 'from-cinematic-hotpink', 'to-cinematic-magenta', 'text-white', 'shadow-sm');
      tab.classList.remove('text-gray-700');

      const targetId = tab.getAttribute('data-target');
      ['paneMoments', 'paneReactions', 'paneFriends', 'paneProfileEdit'].forEach(pId => {
        const pane = document.getElementById(pId);
        if (pane) {
          if (pId === targetId) pane.classList.remove('hidden');
          else pane.classList.add('hidden');
        }
      });
    });
  });

  // Refresh data button
  if (btnRefreshUserData) {
    btnRefreshUserData.addEventListener('click', () => {
      if (currentAuth?.idToken) {
        loadUserMomentsAndFriends(currentAuth.idToken, currentAuth.userId || currentAuth.profile?.userId);
        logMsg('Đang làm mới khoảnh khắc và danh sách bạn bè Locket...', 'info');
      }
    });
  }

  // Search friends
  if (inputSearchFriend) {
    inputSearchFriend.addEventListener('input', () => {
      const q = inputSearchFriend.value.trim().toLowerCase();
      renderFriendsGrid(userFriendsData, q);
    });
  }

  // Modal close
  if (btnCloseMomentModal && momentModal) {
    btnCloseMomentModal.addEventListener('click', () => momentModal.classList.add('hidden'));
    momentModal.addEventListener('click', (e) => {
      if (e.target === momentModal) momentModal.classList.add('hidden');
    });
  }

  // Profile Change Name form (from tandev282/Locket UserApiService)
  if (formChangeName) {
    formChangeName.addEventListener('submit', async (e) => {
      e.preventDefault();
      const firstName = inputFirstName.value.trim();
      const lastName = inputLastName.value.trim();
      if (!currentAuth?.idToken) {
        logMsg('Vui lòng đăng nhập trước khi đổi tên!', 'warn');
        return;
      }

      btnSubmitChangeName.disabled = true;
      btnSubmitChangeName.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> <span>Đang lưu...</span>';
      changeNameMsg.className = 'text-xs font-bold py-2 px-3 rounded-xl bg-pink-100 text-cinematic-hotpink';
      changeNameMsg.textContent = 'Đang gửi yêu cầu lên Locket API...';
      changeNameMsg.classList.remove('hidden');

      try {
        const res = await fetch('/api/change-profile-name', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idToken: currentAuth.idToken,
            firstName,
            lastName
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Không thể đổi tên.');

        const newName = `${firstName} ${lastName}`.trim() || firstName;
        if (currentAuth.profile) currentAuth.profile.displayName = newName;
        userDisplayName.textContent = newName;
        previewUserLabel.textContent = newName;

        changeNameMsg.className = 'text-xs font-bold py-2 px-3 rounded-xl bg-emerald-100 text-emerald-800';
        changeNameMsg.textContent = 'Đã cập nhật tên Locket thành công!';
        logMsg(`Đổi tên hiển thị Locket thành "${newName}" thành công!`, 'success');
      } catch (err) {
        changeNameMsg.className = 'text-xs font-bold py-2 px-3 rounded-xl bg-rose-100 text-rose-800';
        changeNameMsg.textContent = err.message;
        logMsg(err.message, 'error');
      } finally {
        btnSubmitChangeName.disabled = false;
        btnSubmitChangeName.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> <span>Lưu Tên Mới Lên Locket</span>';
      }
    });
  }
}

async function loadUserMomentsAndFriends(idToken, userId) {
  if (!idToken || !userId) return;

  if (refreshIcon) refreshIcon.classList.add('fa-spin');
  logMsg('Đang kết nối Firestore & Locket API tải khoảnh khắc & bạn bè...');

  try {
    const res = await fetch('/api/user-moments-and-friends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken, userId })
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Không tải được dữ liệu.');

    const data = result.data;
    userMomentsData = data.moments || [];
    userFriendsData = data.friends || [];

    // Render components
    renderMomentsGrid(userMomentsData);
    renderReactionsStats(data.stats);
    renderFriendsGrid(userFriendsData);

    // Update Badges
    if (badgeMomentsCount) badgeMomentsCount.textContent = userMomentsData.length;
    if (badgeReactionsTotal) badgeReactionsTotal.textContent = data.stats?.totalReactions || 0;
    if (badgeFriendsCount) badgeFriendsCount.textContent = userFriendsData.length;
    if (streakDisplay) streakDisplay.textContent = `${data.stats?.streak || 1} ngày`;

    logMsg(`Đồng bộ thành công: ${userMomentsData.length} khoảnh khắc, ${userFriendsData.length} bạn bè.`, 'success');
  } catch (err) {
    logMsg(`Không thể đồng bộ dữ liệu: ${err.message}`, 'warn');
  } finally {
    if (refreshIcon) refreshIcon.classList.remove('fa-spin');
  }
}

function renderMomentsGrid(moments) {
  if (!momentsGrid) return;
  momentsGrid.innerHTML = '';

  if (!moments || moments.length === 0) {
    if (momentsEmptyState) momentsEmptyState.classList.remove('hidden');
    momentsGrid.classList.add('hidden');
    return;
  }

  if (momentsEmptyState) momentsEmptyState.classList.add('hidden');
  momentsGrid.classList.remove('hidden');

  moments.forEach((m) => {
    const card = document.createElement('div');
    card.className = 'group relative aspect-square rounded-2xl overflow-hidden border border-pink-200/80 bg-black cursor-pointer shadow-xs hover:shadow-lg transition-all duration-300 hover:scale-[1.03]';

    const isVideo = Boolean(m.videoUrl);
    const mediaEl = isVideo 
      ? `<video src="${m.thumbnailUrl}" class="w-full h-full object-cover"></video><span class="absolute top-2 right-2 w-6 h-6 rounded-lg bg-black/60 backdrop-blur-sm text-white flex items-center justify-center text-[10px]"><i class="fa-solid fa-play"></i></span>`
      : `<img src="${m.thumbnailUrl}" alt="Moment" class="w-full h-full object-cover">`;

    card.innerHTML = `
      ${mediaEl}
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-70 group-hover:opacity-90 transition"></div>
      <div class="absolute top-2 left-2 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full text-[9px] font-bold text-white/90 border border-white/10">
        ${m.date || 'Gần đây'}
      </div>
      <div class="absolute bottom-2 inset-x-2 space-y-1">
        ${m.caption ? `<p class="text-[10px] font-semibold text-white/95 truncate">${m.caption}</p>` : ''}
        <div class="flex items-center gap-1.5 text-[9px] font-extrabold text-pink-300">
          <span>❤️ ${m.reactions?.heart || 0}</span>
          <span>🔥 ${m.reactions?.flame || 0}</span>
        </div>
      </div>
    `;

    card.addEventListener('click', () => openMomentModal(m));
    momentsGrid.appendChild(card);
  });
}

function openMomentModal(moment) {
  if (!momentModal) return;

  modalMomentDate.textContent = `Khoảnh khắc • ${moment.date || 'Gần đây'}`;
  modalMomentCaption.textContent = moment.caption ? `"${moment.caption}"` : 'Không có caption';

  if (moment.videoUrl) {
    modalMomentVideo.src = moment.videoUrl;
    modalMomentVideo.classList.remove('hidden');
    modalMomentImg.classList.add('hidden');
    modalMomentDownload.href = moment.videoUrl;
  } else {
    modalMomentImg.src = moment.thumbnailUrl;
    modalMomentImg.classList.remove('hidden');
    modalMomentVideo.classList.add('hidden');
    modalMomentDownload.href = moment.thumbnailUrl;
  }

  if (modalReactionIcons) {
    const r = moment.reactions || { heart: 0, flame: 0, love: 0, total: 0 };
    modalReactionIcons.innerHTML = `
      <span class="flex items-center gap-1">❤️ ${r.heart || 0}</span>
      <span class="flex items-center gap-1">🔥 ${r.flame || 0}</span>
      <span class="flex items-center gap-1">😍 ${r.love || 0}</span>
      <span class="text-white/60 font-normal">(${r.total || 0} cảm xúc)</span>
    `;
  }

  momentModal.classList.remove('hidden');
}

function renderReactionsStats(stats) {
  if (!stats) return;

  const heart = stats.reactionsBreakdown?.heart || 0;
  const flame = stats.reactionsBreakdown?.flame || 0;
  const love = stats.reactionsBreakdown?.love || 0;
  const smile = stats.reactionsBreakdown?.smile || 0;
  const total = stats.totalReactions || (heart + flame + love + smile) || 1;

  if (statReactionHeart) statReactionHeart.textContent = heart.toLocaleString();
  if (statReactionFlame) statReactionFlame.textContent = flame.toLocaleString();
  if (statReactionLove) statReactionLove.textContent = love.toLocaleString();
  if (statReactionTotal) statReactionTotal.textContent = total.toLocaleString();

  const pHeart = Math.round((heart / total) * 100) || 40;
  const pFlame = Math.round((flame / total) * 100) || 30;
  const pLove = Math.round((love / total) * 100) || 20;
  const pSmile = Math.max(0, 100 - pHeart - pFlame - pLove);

  if (barHeart) barHeart.style.width = `${pHeart}%`;
  if (barFlame) barFlame.style.width = `${pFlame}%`;
  if (barLove) barLove.style.width = `${pLove}%`;
  if (barSmile) barSmile.style.width = `${pSmile}%`;

  if (pctHeart) pctHeart.textContent = `${pHeart}%`;
  if (pctFlame) pctFlame.textContent = `${pFlame}%`;
  if (pctLove) pctLove.textContent = `${pLove}%`;
  if (pctSmile) pctSmile.textContent = `${pSmile}%`;
}

function renderFriendsGrid(friends, filterText = '') {
  if (!friendsGrid) return;
  friendsGrid.innerHTML = '';

  const list = (friends || []).filter(f => {
    if (!filterText) return true;
    return (f.displayName || '').toLowerCase().includes(filterText) ||
           (f.username || '').toLowerCase().includes(filterText);
  });

  if (list.length === 0) {
    if (friendsEmptyState) friendsEmptyState.classList.remove('hidden');
    friendsGrid.classList.add('hidden');
    return;
  }

  if (friendsEmptyState) friendsEmptyState.classList.add('hidden');
  friendsGrid.classList.remove('hidden');

  list.forEach(fr => {
    const card = document.createElement('div');
    card.className = 'bg-white/95 rounded-2xl p-3.5 border border-pink-200 shadow-xs flex items-center justify-between gap-3 hover:border-pink-300 transition';

    const avatarHtml = fr.avatarUrl
      ? `<img src="${fr.avatarUrl}" class="w-11 h-11 rounded-full object-cover border-2 border-pink-200">`
      : `<div class="w-11 h-11 rounded-full bg-gradient-to-tr from-cinematic-hotpink to-rose-400 text-white flex items-center justify-center font-bold text-base shadow-xs">${(fr.displayName || 'B').charAt(0).toUpperCase()}</div>`;

    card.innerHTML = `
      <div class="flex items-center gap-3 overflow-hidden">
        ${avatarHtml}
        <div class="overflow-hidden">
          <h6 class="font-extrabold text-xs text-gray-900 truncate">${fr.displayName || 'Bạn bè Locket'}</h6>
          <p class="text-[11px] font-bold text-gray-500 truncate">@${fr.username || fr.uid?.substring(0, 8) || 'locket'}</p>
        </div>
      </div>
      <div class="flex items-center gap-1.5 shrink-0 bg-pink-50 px-2.5 py-1 rounded-xl border border-pink-200 text-[10px] font-extrabold text-amber-600">
        <i class="fa-solid fa-fire text-amber-500"></i>
        <span>${fr.streak || 1}d</span>
      </div>
    `;

    friendsGrid.appendChild(card);
  });
}

function addMomentToGallery(newMoment) {
  userMomentsData.unshift(newMoment);
  renderMomentsGrid(userMomentsData);
  if (badgeMomentsCount) badgeMomentsCount.textContent = userMomentsData.length;
}

function clearUserDashboard() {
  userMomentsData = [];
  userFriendsData = [];
  if (momentsGrid) momentsGrid.innerHTML = '';
  if (friendsGrid) friendsGrid.innerHTML = '';
  if (badgeMomentsCount) badgeMomentsCount.textContent = '0';
  if (badgeReactionsTotal) badgeReactionsTotal.textContent = '0';
  if (badgeFriendsCount) badgeFriendsCount.textContent = '0';
}

// ========================================================
// 13. IN-APP CAPTION BADGES SYSTEM (EXACT MATCH SCREENSHOT)
// ========================================================
function initInAppCaptions() {
  const pills = document.querySelectorAll('.locket-cap-pill');
  if (!pills.length || !inputCaption) return;

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      // Toggle active border
      pills.forEach(p => p.classList.remove('active-locket-cap'));
      pill.classList.add('active-locket-cap');

      const rawText = pill.getAttribute('data-text') || '';
      const style = pill.getAttribute('data-style') || 'default';
      const bg = pill.style.background || '';
      const color = pill.style.color || '';

      if (rawText === 'weather_auto') {
        const temp = 28 + Math.floor(Math.random() * 5);
        inputCaption.value = `🌤️ ${temp}°C Nắng đẹp`;
      } else if (rawText === 'time_auto') {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        inputCaption.value = `🕒 ${timeStr}`;
      } else if (style === 'default') {
        inputCaption.value = '';
      } else if (style === 'custom') {
        inputCaption.focus();
      } else if (rawText) {
        inputCaption.value = rawText;
      }

      charCount.textContent = `${inputCaption.value.length} ký tự`;

      // Synchronize badge styling on iPhone 3D Simulator
      if (previewCaptionOverlay) {
        if (bg) {
          previewCaptionOverlay.style.background = bg;
        } else {
          previewCaptionOverlay.style.background = 'rgba(0, 0, 0, 0.65)';
        }
        if (color) {
          previewCaptionOverlay.style.color = color;
        } else {
          previewCaptionOverlay.style.color = '#FFFFFF';
        }
        previewCaptionText.textContent = inputCaption.value || 'Caption Locket';
        previewCaptionOverlay.classList.remove('hidden');
      }
    });
  });
}

// ========================================================
// EMAIL DOMAIN SHORTCUT BUTTONS
// ========================================================
function initEmailDomainButtons() {
  const domainButtons = document.querySelectorAll('.btn-email-domain');
  if (!domainButtons || domainButtons.length === 0 || !inputEmail) return;

  domainButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const domain = btn.getAttribute('data-domain');
      if (!domain) return;

      const currentVal = (inputEmail.value || '').trim();

      if (!currentVal) {
        // If empty: put domain and position cursor at beginning for user to type
        inputEmail.value = domain;
        inputEmail.focus();
        inputEmail.setSelectionRange(0, 0);
      } else if (currentVal.includes('@')) {
        // Replace existing domain after @
        const atIndex = currentVal.indexOf('@');
        const prefix = currentVal.substring(0, atIndex);
        inputEmail.value = `${prefix}${domain}`;
        if (inputPassword) inputPassword.focus();
      } else {
        // Append domain directly to typed username
        inputEmail.value = `${currentVal}${domain}`;
        if (inputPassword) inputPassword.focus();
      }

      // Quick visual feedback on clicked button
      btn.classList.add('ring-2', 'ring-cinematic-hotpink', 'bg-pink-200');
      setTimeout(() => {
        btn.classList.remove('ring-2', 'ring-cinematic-hotpink', 'bg-pink-200');
      }, 300);
    });
  });
}

// Initial Run
if (inputEmail) inputEmail.value = '';
if (inputPassword) inputPassword.value = '';
if (inputDirectToken) inputDirectToken.value = '';
window.addEventListener('pageshow', () => {
  if (inputEmail) inputEmail.value = '';
  if (inputPassword) inputPassword.value = '';
});
initAuth();
initEmailDomainButtons();
initUserDashboard();
initInAppCaptions();
logMsg('Hệ thống Locket Cinematic Studio sẵn sàng phục vụ 💖');


