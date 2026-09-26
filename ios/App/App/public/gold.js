/**
 * Locket VIP Gold Experience - Client Controller
 * Concept: Dark Cinematic Pink • VIP Boarding Pass
 * Zero Credit / Pure Authentic Locket VIP Experience
 */

document.addEventListener('DOMContentLoaded', () => {
  // ========================================================
  // 1. DOM REFERENCES
  // ========================================================
  const ambientCanvas = document.getElementById('ambientCanvas');
  const ticketPass = document.getElementById('ticketPass');
  const cardSheen = document.getElementById('cardSheen');
  const cardAvatarImg = document.getElementById('cardAvatarImg');
  const cardAvatarFallback = document.getElementById('cardAvatarFallback');
  const cardUsernameDisplay = document.getElementById('cardUsernameDisplay');
  const cardUidDisplay = document.getElementById('cardUidDisplay');
  const btnCopyCardUid = document.getElementById('btnCopyCardUid');
  const ticketBadgeStatus = document.getElementById('ticketBadgeStatus');
  const ticketBadgeText = document.getElementById('ticketBadgeText');
  const cardIssueDate = document.getElementById('cardIssueDate');
  const cardDnsStatus = document.getElementById('cardDnsStatus');

  const goldForm = document.getElementById('goldActivationForm');
  const inputUsername = document.getElementById('inputUsername');
  const btnClearInput = document.getElementById('btnClearInput');
  const btnOpenSettings = document.getElementById('btnOpenSettings');
  const btnSubmitActivate = document.getElementById('btnSubmitActivate');
  const btnSubmitText = document.getElementById('btnSubmitText');

  // Drawer
  const settingsDrawerOverlay = document.getElementById('settingsDrawerOverlay');
  const settingsDrawerPanel = document.getElementById('settingsDrawerPanel');
  const btnCloseSettings = document.getElementById('btnCloseSettings');
  const btnSaveSettings = document.getElementById('btnSaveSettings');
  const inputFetchToken = document.getElementById('inputFetchToken');
  const inputAppTransaction = document.getElementById('inputAppTransaction');
  const inputNextDnsKey = document.getElementById('inputNextDnsKey');
  const checkSandbox = document.getElementById('checkSandbox');

  // Stepper & Terminal Log
  const stepperSection = document.getElementById('stepperSection');
  const stepperOverallStatus = document.getElementById('stepperOverallStatus');
  const btnToggleLogTerminal = document.getElementById('btnToggleLogTerminal');
  const terminalLogBox = document.getElementById('terminalLogBox');
  const terminalArrow = document.getElementById('terminalArrow');

  // Result Section
  const resultSection = document.getElementById('resultSection');
  const resultProfileBadge = document.getElementById('resultProfileBadge');
  const btnIosDns = document.getElementById('btnIosDns');
  const inputAndroidDns = document.getElementById('inputAndroidDns');
  const btnCopyAndroidDns = document.getElementById('btnCopyAndroidDns');

  // Set today's date on Boarding Pass
  if (cardIssueDate) {
    const now = new Date();
    cardIssueDate.textContent = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
  }

  // ========================================================
  // 2. LIGHTWEIGHT FLOATING PETALS & AMBIENT DUST
  // ========================================================
  (function initAmbientPetals() {
    if (!ambientCanvas) return;
    const ctx = ambientCanvas.getContext('2d');
    if (!ctx) return;

    let width = (ambientCanvas.width = window.innerWidth);
    let height = (ambientCanvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = ambientCanvas.width = window.innerWidth;
      height = ambientCanvas.height = window.innerHeight;
    });

    const particles = [];
    const count = 35; // Gentle and lightweight
    const colors = [
      'rgba(255, 46, 136, 0.45)',
      'rgba(255, 111, 168, 0.35)',
      'rgba(246, 203, 183, 0.35)',
      'rgba(214, 16, 107, 0.4)'
    ];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.5 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.4,
        vy: Math.random() * 0.6 + 0.3,
        alpha: Math.random() * 0.7 + 0.3,
        angle: Math.random() * Math.PI * 2,
        angularSpeed: (Math.random() - 0.5) * 0.02
      });
    }

    let isVisible = true;
    document.addEventListener('visibilitychange', () => {
      isVisible = !document.hidden;
    });

    function renderParticles() {
      if (isVisible) {
        ctx.clearRect(0, 0, width, height);

        for (const p of particles) {
          p.x += p.vx;
          p.y += p.vy;
          p.angle += p.angularSpeed;

          if (p.y > height) {
            p.y = -10;
            p.x = Math.random() * width;
          }
          if (p.x > width) p.x = 0;
          if (p.x < 0) p.x = width;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.beginPath();
          ctx.ellipse(0, 0, p.radius * 1.8, p.radius, 0, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
          ctx.restore();
        }
      }
      requestAnimationFrame(renderParticles);
    }
    renderParticles();
  })();

  // ========================================================
  // 3. 3D PERSPECTIVE TILT FOR VIP BOARDING PASS
  // ========================================================
  (function initTicketTilt() {
    if (!ticketPass) return;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) return; // Disable tilt on touch devices for solid readability

    let targetRotX = 0, targetRotY = 0;
    let currentRotX = 0, currentRotY = 0;

    window.addEventListener('mousemove', (e) => {
      const rect = ticketPass.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) / (window.innerWidth / 2);
      const deltaY = (e.clientY - centerY) / (window.innerHeight / 2);

      targetRotY = deltaX * 12; // -12 to 12 deg
      targetRotX = -deltaY * 10; // -10 to 10 deg

      if (cardSheen) {
        const sheenX = 50 + deltaX * 35;
        const sheenY = 50 + deltaY * 35;
        cardSheen.style.background = `radial-gradient(circle at ${sheenX}% ${sheenY}%, rgba(255, 255, 255, 0.15), rgba(255, 46, 136, 0.15) 35%, transparent 70%)`;
      }
    });

    window.addEventListener('mouseleave', () => {
      targetRotX = 0;
      targetRotY = 0;
    });

    function updateTilt() {
      currentRotX += (targetRotX - currentRotX) * 0.1;
      currentRotY += (targetRotY - currentRotY) * 0.1;

      ticketPass.style.transform = `perspective(1000px) rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg)`;
      requestAnimationFrame(updateTilt);
    }
    updateTilt();
  })();

  // ========================================================
  // 4. LIVE INPUT TYPING & BOARDING PASS CARD PREVIEW
  // ========================================================
  let debounceTimer = null;

  function updateCardPreview(rawVal) {
    const val = (rawVal || '').trim();

    if (!val) {
      cardUsernameDisplay.textContent = '@username';
      cardUidDisplay.textContent = 'UID: Chưa phân giải';
      btnCopyCardUid.classList.add('hidden');
      cardAvatarImg.classList.add('hidden');
      cardAvatarFallback.classList.remove('hidden');
      btnClearInput.classList.add('hidden');
      return;
    }

    btnClearInput.classList.remove('hidden');

    let cleaned = val.replace(/^@/, '');
    if (cleaned.includes('locket.cam/')) {
      cleaned = cleaned.split('locket.cam/')[1].split('?')[0].split('/')[0];
    } else if (cleaned.includes('locket.camera/')) {
      cleaned = cleaned.split('locket.camera/')[1].split('?')[0].split('/')[0];
    }

    cardUsernameDisplay.textContent = `@${cleaned}`;

    // Direct 28-character UID check
    if (/^[A-Za-z0-9]{28}$/.test(cleaned)) {
      cardUidDisplay.textContent = `UID: ${cleaned.slice(0, 6)}...${cleaned.slice(-4)}`;
      cardUidDisplay.setAttribute('data-full-uid', cleaned);
      btnCopyCardUid.classList.remove('hidden');

      const directAvatar = `https://firebasestorage.googleapis.com/v0/b/locket-img/o/users%2F${cleaned}%2Fpublic%2Fprofile_pic.webp?alt=media`;
      cardAvatarImg.src = directAvatar;
      cardAvatarImg.onload = () => {
        cardAvatarImg.classList.remove('hidden');
        cardAvatarFallback.classList.add('hidden');
      };
      cardAvatarImg.onerror = () => {
        cardAvatarImg.classList.add('hidden');
        cardAvatarFallback.classList.remove('hidden');
      };
    } else {
      cardUidDisplay.textContent = 'UID: Tự động phân giải khi kích hoạt';
      btnCopyCardUid.classList.add('hidden');
    }
  }

  if (inputUsername) {
    inputUsername.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        updateCardPreview(e.target.value);
      }, 100);
    });
  }

  if (btnClearInput) {
    btnClearInput.addEventListener('click', () => {
      inputUsername.value = '';
      updateCardPreview('');
      inputUsername.focus();
    });
  }

  if (btnCopyCardUid) {
    btnCopyCardUid.addEventListener('click', () => {
      const uid = cardUidDisplay.getAttribute('data-full-uid');
      if (uid) {
        navigator.clipboard.writeText(uid);
        appendTerminalLog(`[Clipboard] Đã chép mã UID: ${uid}`, 'info');
      }
    });
  }

  // ========================================================
  // 6. ADVANCED SETTINGS DRAWER
  // ========================================================
  function openSettings() {
    if (!settingsDrawerOverlay || !settingsDrawerPanel) return;
    settingsDrawerOverlay.classList.remove('pointer-events-none', 'opacity-0');
    settingsDrawerOverlay.classList.add('opacity-100');
    settingsDrawerPanel.classList.remove('translate-x-full');
  }

  function closeSettings() {
    if (!settingsDrawerOverlay || !settingsDrawerPanel) return;
    settingsDrawerOverlay.classList.add('opacity-0', 'pointer-events-none');
    settingsDrawerOverlay.classList.remove('opacity-100');
    settingsDrawerPanel.classList.add('translate-x-full');
  }

  if (btnOpenSettings) btnOpenSettings.addEventListener('click', openSettings);
  if (btnCloseSettings) btnCloseSettings.addEventListener('click', closeSettings);
  if (settingsDrawerOverlay) settingsDrawerOverlay.addEventListener('click', closeSettings);
  if (btnSaveSettings) {
    btnSaveSettings.addEventListener('click', () => {
      closeSettings();
      appendTerminalLog('Đã lưu các tham số cài đặt nâng cao.', 'info');
    });
  }

  // ========================================================
  // 7. TERMINAL REALTIME LOG CONTROLLER
  // ========================================================
  function appendTerminalLog(msg, type = 'info') {
    if (!terminalLogBox) return;
    const time = new Date().toLocaleTimeString('vi-VN');
    const p = document.createElement('p');

    let colorClass = 'text-vip-rose/80';
    let icon = '<i class="fa-solid fa-sparkles text-vip-hotpink"></i>';

    if (type === 'success') {
      colorClass = 'text-emerald-400 font-semibold';
      icon = '<i class="fa-solid fa-check text-emerald-400"></i>';
    } else if (type === 'warn') {
      colorClass = 'text-amber-400 font-semibold';
      icon = '<i class="fa-solid fa-triangle-exclamation text-amber-400"></i>';
    } else if (type === 'error') {
      colorClass = 'text-rose-400 font-semibold';
      icon = '<i class="fa-solid fa-circle-xmark text-rose-500"></i>';
    }

    p.className = `flex items-center gap-2 ${colorClass}`;
    p.innerHTML = `<span class="text-gray-500 font-mono text-[10px]">[${time}]</span> ${icon} <span>${msg}</span>`;

    terminalLogBox.appendChild(p);
    terminalLogBox.scrollTop = terminalLogBox.scrollHeight;
  }

  if (btnToggleLogTerminal && terminalLogBox) {
    btnToggleLogTerminal.addEventListener('click', () => {
      terminalLogBox.classList.toggle('hidden');
      if (terminalArrow) {
        terminalArrow.classList.toggle('rotate-180');
      }
    });
  }

  // ========================================================
  // 8. STEPPER STATE MANAGER
  // ========================================================
  function setStepState(stepNum, state, subText = null) {
    const stepEl = document.getElementById(`step${stepNum}`);
    const iconEl = document.getElementById(`step${stepNum}Icon`);
    const subEl = document.getElementById(`step${stepNum}Sub`);
    const badgeEl = document.getElementById(`step${stepNum}Badge`);

    if (!stepEl || !iconEl || !badgeEl) return;

    if (subText && subEl) subEl.textContent = subText;

    if (state === 'pending') {
      iconEl.className = 'w-6 h-6 rounded-lg bg-pink-100 text-pink-400 flex items-center justify-center text-xs';
      iconEl.innerHTML = '<i class="fa-solid fa-circle-dot"></i>';
      badgeEl.className = 'text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white text-gray-500 border border-pink-100 font-bold';
      badgeEl.textContent = 'Chờ';
    } else if (state === 'active') {
      iconEl.className = 'w-6 h-6 rounded-lg bg-cinematic-hotpink text-white flex items-center justify-center text-xs animate-pulse';
      iconEl.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>';
      badgeEl.className = 'text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-pink-100 text-cinematic-hotpink border border-pink-300 font-extrabold animate-pulse';
      badgeEl.textContent = 'Đang chạy';
    } else if (state === 'retrying') {
      iconEl.className = 'w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-xs animate-pulse';
      iconEl.innerHTML = '<i class="fa-solid fa-arrows-rotate fa-spin"></i>';
      badgeEl.className = 'text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 font-extrabold animate-pulse';
      badgeEl.textContent = 'Đang thử lại';
    } else if (state === 'success') {
      iconEl.className = 'w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs border border-emerald-300';
      iconEl.innerHTML = '<i class="fa-solid fa-check"></i>';
      badgeEl.className = 'text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold';
      badgeEl.textContent = 'Hoàn tất';
    } else if (state === 'error') {
      iconEl.className = 'w-6 h-6 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center text-xs border border-rose-300';
      iconEl.innerHTML = '<i class="fa-solid fa-xmark"></i>';
      badgeEl.className = 'text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 font-extrabold';
      badgeEl.textContent = 'Lỗi';
    }
  }

  // ========================================================
  // 9. FORM SUBMIT & REAL ACTIVATION PIPELINE
  // ========================================================
  if (goldForm) {
    goldForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = (inputUsername ? inputUsername.value : '').trim();
      if (!username) {
        appendTerminalLog('Vui lòng nhập Username, link Locket hoặc UID để kích hoạt!', 'warn');
        if (inputUsername) inputUsername.focus();
        return;
      }

      // Collect Advanced Settings
      const fetchToken = inputFetchToken ? inputFetchToken.value.trim() : '';
      const appTransaction = inputAppTransaction ? inputAppTransaction.value.trim() : '';
      const nextDnsApiKey = inputNextDnsKey ? inputNextDnsKey.value.trim() : '';
      const isSandbox = checkSandbox ? checkSandbox.checked : false;

      // Lock UI
      btnSubmitActivate.disabled = true;
      btnSubmitActivate.classList.add('opacity-60', 'cursor-not-allowed');
      btnSubmitText.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin text-vip-champagne"></i> <span>Đang kết nối hệ thống...</span>';

      // Reset & Reveal Stepper
      stepperSection.classList.remove('hidden');
      resultSection.classList.add('hidden');
      terminalLogBox.classList.remove('hidden');
      if (terminalArrow) terminalArrow.classList.add('rotate-180');

      setStepState(1, 'active', 'Đang phân giải UID từ máy chủ Locket...');
      setStepState(2, 'pending', 'Đang chờ bước 1...');
      setStepState(3, 'pending', 'Đang chờ bước 2...');
      setStepState(4, 'pending', 'Đang chờ bước 3...');
      stepperOverallStatus.textContent = 'Đang xử lý (Bước 1/4)...';

      appendTerminalLog(`Khởi chạy tiến trình kích hoạt Gold cho: ${username}...`, 'info');

      try {
        // Direct UID check optimization
        const isDirectUid = /^[A-Za-z0-9]{28}$/.test(username.replace(/^@/, ''));
        if (isDirectUid) {
          appendTerminalLog(`Nhận diện mã UID trực tiếp: ${username}`, 'info');
        }

        // Call real backend endpoint
        const response = await fetch('/api/server2/activate-gold', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            fetchToken,
            appTransaction,
            nextDnsApiKey,
            isSandbox
          })
        });

        const json = await response.json();

        if (!response.ok) {
          const errorMsg = json.error || 'Máy chủ phản hồi không thành công.';
          throw new Error(errorMsg);
        }

        const d = json.data;

        // Step 1 Complete
        setStepState(1, 'success', `Đã xác định UID: ${d.user.uid} (@${d.user.username})`);
        stepperOverallStatus.textContent = 'Đang xử lý (Bước 2/4)...';

        // Step 2 Complete
        setStepState(2, 'success', d.initialStatus?.isGoldActive ? 'Tài khoản đang có gói Gold!' : 'Đã kiểm tra quyền lợi.');
        stepperOverallStatus.textContent = 'Đang xử lý (Bước 3/4)...';

        // Step 3 Complete
        setStepState(3, 'success', d.injectResult?.success ? 'Gói Gold đã được cấp thành công!' : 'Đã ghi nhận yêu cầu khôi phục.');
        stepperOverallStatus.textContent = 'Đang xử lý (Bước 4/4)...';

        // Step 4 Complete
        setStepState(4, 'success', `Lá chắn DNS đã sẵn sàng (${d.dnsConfig?.profileId})`);
        stepperOverallStatus.textContent = 'Hoàn tất toàn bộ!';

        // Append server logs
        if (d.logs && Array.isArray(d.logs)) {
          d.logs.forEach(l => appendTerminalLog(l.msg, l.type));
        }

        // ====================================================
        // UPDATE BOARDING PASS TICKET TO ACTIVATED
        // ====================================================
        ticketPass.classList.add('vip-glass-active');
        ticketBadgeStatus.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm';
        ticketBadgeText.textContent = 'VIP GOLD ACTIVE';

        cardUsernameDisplay.textContent = `@${d.user.username}`;
        cardUidDisplay.textContent = `UID: ${d.user.uid.slice(0, 6)}...${d.user.uid.slice(-4)}`;
        cardUidDisplay.setAttribute('data-full-uid', d.user.uid);
        btnCopyCardUid.classList.remove('hidden');

        if (d.user.avatarUrl) {
          cardAvatarImg.src = d.user.avatarUrl;
          cardAvatarImg.classList.remove('hidden');
          cardAvatarFallback.classList.add('hidden');
        }

        if (cardDnsStatus) {
          cardDnsStatus.textContent = `SHIELD: ${d.dnsConfig.profileId}`;
          cardDnsStatus.className = 'font-mono font-bold text-emerald-700 mt-0.5 block';
        }

        // ====================================================
        // RENDER RESULT SECTION & ANTI-REVOKE SETUP
        // ====================================================
        resultSection.classList.remove('hidden');
        if (resultProfileBadge) resultProfileBadge.textContent = `Profile: ${d.dnsConfig.profileId}`;
        if (btnIosDns) btnIosDns.href = d.dnsConfig.iosProfileUrl;
        if (inputAndroidDns) inputAndroidDns.value = d.dnsConfig.androidDnsHost;

        // Copy Android DNS
        if (btnCopyAndroidDns) {
          btnCopyAndroidDns.onclick = () => {
            navigator.clipboard.writeText(d.dnsConfig.androidDnsHost);
            btnCopyAndroidDns.textContent = 'Đã chép!';
            setTimeout(() => (btnCopyAndroidDns.textContent = 'Chép'), 2000);
          };
        }

        // ====================================================
        // LUXURIOUS PINK & ROSE-GOLD CONFETTI
        // ====================================================
        if (typeof confetti === 'function') {
          const count = 160;
          const defaults = {
            origin: { y: 0.65 },
            colors: ['#FF2E88', '#FF6FA8', '#F6CBB7', '#FFE1CF', '#FFFFFF', '#D6106B']
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

        appendTerminalLog(`KÍCH HOẠT HOÀN TẤT: Chúc mừng @${d.user.username} đã gia nhập Locket Gold!`, 'success');

        // Smooth scroll down to result
        setTimeout(() => {
          resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);

      } catch (err) {
        setStepState(1, 'error', err.message);
        stepperOverallStatus.textContent = 'Xảy ra gián đoạn';
        appendTerminalLog(err.message, 'error');

        // Friendly advice for timeout or connection issues
        if (err.message.includes('timeout') || err.message.includes('kết nối') || err.message.includes('chậm')) {
          appendTerminalLog('Mẹo: Nếu máy chủ phân giải username quá tải, bạn có thể nhập trực tiếp chuỗi UID 28 ký tự để kích hoạt tức thì!', 'warn');
        }
      } finally {
        btnSubmitActivate.disabled = false;
        btnSubmitActivate.classList.remove('opacity-60', 'cursor-not-allowed');
        btnSubmitText.innerHTML = '<span>Kích Hoạt Locket Gold Ngay</span>';
      }
    });
  }

});
