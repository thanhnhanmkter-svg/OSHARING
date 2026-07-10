window.renderLogin = function(container, state, { onLoginSuccess, onAdminAccess }) {
  container.innerHTML = `
    <div class="login-page fade-in" style="min-height:calc(100vh - 80px); display:flex; align-items:center; justify-content:center; padding:20px;">
      <div style="width:100%; max-width:440px;">

        <!-- Mascot + Title -->
        <div class="mascot-wrapper" style="text-align:center; margin-bottom:24px;">
          <img id="loginMascot" src="./assets/mascot.png" alt="Mascot"
               style="width:150px; height:auto; filter:drop-shadow(0 20px 40px rgba(16,185,129,0.3));
                      animation: mascot-bounce-in 0.85s cubic-bezier(0.16,1,0.3,1) forwards;
                      transform-origin: center bottom;" />

          <!-- CULTURE WORKSHOP JOURNEY Title -->
          <div style="margin-top:18px; line-height:1.15;">
            <div style="font-size:32px; font-weight:900; letter-spacing:-0.02em; line-height:1.1;">
              <span style="color:var(--primary); text-shadow:0 0 32px rgba(16,185,129,0.4);">CULTURE</span>
            </div>
            <div style="font-size:14px; font-weight:700; letter-spacing:0.22em; text-transform:uppercase; color:var(--text-secondary); margin-top:2px;">
              WORKSHOP JOURNEY
            </div>
            <div style="width:48px; height:3px; background:linear-gradient(90deg, var(--primary), var(--primary-dark)); border-radius:2px; margin:10px auto 0;"></div>
          </div>
        </div>

        <!-- Card -->
        <div class="glass-card glass-card-emerald slide-up"
             style="padding:36px 32px; animation-delay:0.2s; animation-fill-mode:both;">

          <!-- Title inside card -->
          <div style="text-align:center; margin-bottom:26px;">
            <h2 style="font-size:20px; font-weight:700; color:var(--text-primary); letter-spacing:-0.02em; margin-bottom:5px;">
              Đăng ký tham gia
            </h2>
            <p style="font-size:13px; color:var(--text-secondary); line-height:1.5;">
              Nhập thông tin để bắt đầu hành trình trải nghiệm văn hóa
            </p>
          </div>

          <!-- Form -->
          <form id="loginForm">
            <div style="margin-bottom:20px;">
              <label for="playerName">Họ và tên</label>
              <input type="text" id="playerName" class="form-input" required
                     placeholder="Nhập đầy đủ họ và tên của bạn"
                     style="width:100%; padding:13px 16px; border-radius:12px;
                            border:1.5px solid rgba(15,23,42,0.12); background:rgba(255,255,255,0.9);
                            font-family:var(--font); font-size:15px; color:var(--text-primary); outline:none;
                            transition:var(--transition);">
            </div>

            <div style="margin-bottom:28px;">
              <label for="playerDept">Phòng ban / Bộ phận</label>
              <select id="playerDept" required
                      style="width:100%; padding:13px 16px; border-radius:12px;
                             border:1.5px solid rgba(15,23,42,0.12); background:rgba(255,255,255,0.9);
                             font-family:var(--font); font-size:15px; color:var(--text-primary);
                             outline:none; cursor:pointer; transition:var(--transition); appearance:auto;">
                <option value="" disabled selected>Chọn phòng ban của bạn</option>
                ${(state.departments || ["HR", "Tech", "Sales", "Marketing", "Operations", "Finance"]).map(d => `
                  <option value="${d}">${d}</option>
                `).join('')}
              </select>
            </div>

            <button type="submit" id="btnLogin" class="btn btn-primary btn-lg"
                    style="width:100%; border-radius:14px; font-size:16px; position:relative; overflow:hidden;">
              <span id="btnLoginText">Bắt đầu hành trình</span>
              <i data-lucide="arrow-right" style="width:18px; height:18px;"></i>
            </button>
          </form>

          <!-- Divider -->
          <div style="margin-top:24px; display:flex; align-items:center; gap:12px;">
            <div style="flex:1; height:1px; background:rgba(15,23,42,0.08);"></div>
            <span style="font-size:12px; color:var(--text-muted);">hoặc</span>
            <div style="flex:1; height:1px; background:rgba(15,23,42,0.08);"></div>
          </div>

          <!-- Admin & Host toggles -->
          <div style="margin-top:18px; text-align:center; display:flex; justify-content:center; gap:12px;">
            <button id="btnAdminMode"
                    style="background:none; border:none; color:var(--text-muted); cursor:pointer;
                           font-size:13px; font-family:var(--font); transition:var(--transition);
                           display:inline-flex; align-items:center; gap:5px; padding:6px 12px;
                           border-radius:8px;">
              <i data-lucide="shield" style="width:14px; height:14px;"></i>
              Quản trị viên
            </button>
            <button id="btnHostMode"
                    style="background:none; border:none; color:var(--primary); cursor:pointer;
                           font-size:13px; font-weight:600; font-family:var(--font); transition:var(--transition);
                           display:inline-flex; align-items:center; gap:5px; padding:6px 12px;
                           border-radius:8px; background:rgba(16,185,129,0.06);">
              <i data-lucide="monitor" style="width:14px; height:14px;"></i>
              Màn hình chung (Máy chiếu)
            </button>
          </div>

          <!-- Admin panel -->
          <div id="adminPanelInput" style="display:none; margin-top:16px;" class="fade-in">
            <div style="background:rgba(16,185,129,0.05); border:1px solid rgba(16,185,129,0.15);
                        border-radius:14px; padding:20px;">
              <label for="adminPin" style="color:var(--primary-dark); margin-bottom:8px;">
                <i data-lucide="lock" style="width:12px; height:12px; display:inline;"></i>
                Mã PIN Admin
              </label>
              <div style="display:flex; gap:10px;">
                <input type="password" id="adminPin" placeholder="Nhập mã PIN..."
                       style="flex:1; padding:11px 14px; border-radius:10px;
                              border:1.5px solid rgba(15,23,42,0.12); background:#fff;
                              font-family:var(--font); font-size:14px; color:var(--text-primary); outline:none;
                              transition:var(--transition);">
                <button id="btnSubmitAdmin" class="btn btn-primary btn-sm"
                        style="border-radius:10px; white-space:nowrap;">
                  Vào Admin
                </button>
              </div>
              <p id="adminError"
                 style="color:var(--danger); font-size:12px; margin-top:8px; display:none; font-weight:500;"></p>
            </div>
          </div>

        </div>

        <!-- Footer note -->
        <p style="text-align:center; font-size:12px; color:var(--text-muted); margin-top:20px;">
          Dữ liệu được đồng bộ giữa các tab · Không cần cài đặt gì thêm
        </p>
      </div>
    </div>

    <style>
      #loginMascot { cursor: default; }
      #loginMascot:hover {
        animation: mascot-wiggle 0.6s ease forwards !important;
      }
      #btnAdminMode:hover {
        background: rgba(16,185,129,0.08) !important;
        color: var(--primary-dark) !important;
      }
      #playerName:focus, #playerDept:focus, #adminPin:focus {
        border-color: var(--primary) !important;
        box-shadow: 0 0 0 3px rgba(16,185,129,0.12) !important;
        background: #fff !important;
      }

      /* After bounce-in, switch to float */
      .mascot-floating {
        animation: mascot-float 4s ease-in-out infinite !important;
      }
    </style>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Switch mascot to floating after bounce-in finishes
  const mascot = container.querySelector('#loginMascot');
  setTimeout(() => {
    if (mascot) mascot.classList.add('mascot-floating');
  }, 900);

  // Re-attach hover to reset animation
  mascot.addEventListener('mouseenter', () => {
    mascot.style.animation = 'mascot-wiggle 0.6s ease forwards';
  });
  mascot.addEventListener('mouseleave', () => {
    mascot.style.animation = 'mascot-float 4s ease-in-out infinite';
  });

  // ── Login form ──────────────────────────────────────────────────────────
  const loginForm = container.querySelector('#loginForm');
  const btnLoginText = container.querySelector('#btnLoginText');

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = container.querySelector('#playerName').value.trim();
    const dept = container.querySelector('#playerDept').value;

    if (!name || !dept) return;

    btnLoginText.textContent = 'Đang tham gia...';

    const playerId = 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const team = null; // Chưa gán đội lúc đăng ký

    const newPlayer = { id: playerId, name, department: dept, score: 0, team, keywordsGuessed: [] };

    window.setGameState(s => ({ ...s, players: [...(s.players || []), newPlayer] }));
    sessionStorage.setItem('current_player_id', playerId);

    if (onLoginSuccess) onLoginSuccess(newPlayer);
  });

  // ── Admin / Host toggle ──────────────────────────────────────────────────
  const btnAdminMode    = container.querySelector('#btnAdminMode');
  const btnHostMode     = container.querySelector('#btnHostMode');
  const adminPanelInput = container.querySelector('#adminPanelInput');
  const btnSubmitAdmin  = container.querySelector('#btnSubmitAdmin');
  const adminPinInput   = container.querySelector('#adminPin');
  const adminError      = container.querySelector('#adminError');

  // Toggle Admin panel
  let isAdminPanelOpen = false;
  let currentLoginMode = 'admin'; // 'admin' or 'host'

  function toggleAdminPanel(mode) {
    if (!isAdminPanelOpen || currentLoginMode !== mode) {
      isAdminPanelOpen = true;
      currentLoginMode = mode;
      adminPanelInput.style.display = 'block';
      adminPinInput.focus();
      adminPinInput.value = '';
      adminError.style.display = 'none';
      
      if (mode === 'host') {
        adminPinInput.placeholder = 'Nhập mã PIN Máy chiếu...';
        btnSubmitAdmin.textContent = 'Mở Màn Hình Chung';
        container.querySelector('label[for="adminPin"]').innerHTML = '<i data-lucide="monitor" style="width:12px; height:12px; display:inline;"></i> Mã PIN Máy Chiếu';
      } else {
        adminPinInput.placeholder = 'Nhập mã PIN Admin...';
        btnSubmitAdmin.textContent = 'Vào Admin';
        container.querySelector('label[for="adminPin"]').innerHTML = '<i data-lucide="lock" style="width:12px; height:12px; display:inline;"></i> Mã PIN Admin';
      }
      if (window.lucide) window.lucide.createIcons();
    } else {
      isAdminPanelOpen = false;
      adminPanelInput.style.display = 'none';
    }
  }

  btnAdminMode.addEventListener('click', () => toggleAdminPanel('admin'));
  btnHostMode.addEventListener('click', () => toggleAdminPanel('host'));

  // Admin / Host login
  btnSubmitAdmin.addEventListener('click', () => {
    const pin = adminPinInput.value.trim();
    const truePin = localStorage.getItem('ctg_admin_pin') || 'admin123';
    
    if (pin === truePin || pin === 'host123') { // host123 as fallback for Host
      if (currentLoginMode === 'admin' && pin === truePin) {
        sessionStorage.setItem('admin_logged_in', 'true');
        sessionStorage.removeItem('host_logged_in');
        if (onAdminAccess) onAdminAccess();
      } else if (currentLoginMode === 'host' && (pin === truePin || pin === 'host123')) {
        sessionStorage.setItem('host_logged_in', 'true');
        sessionStorage.removeItem('admin_logged_in');
        if (onAdminAccess) onAdminAccess(); // Trả về điều hướng lại app.js
      } else {
        adminError.textContent = 'Mã PIN không hợp lệ cho chế độ này';
        adminError.style.display = 'block';
      }
    } else {
      adminError.textContent = 'Mã PIN không đúng!';
      adminError.style.display = 'block';
      adminPinInput.value = '';
      adminPinInput.focus();
    }
  });

  adminPinInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') btnSubmitAdmin.click(); });
};
