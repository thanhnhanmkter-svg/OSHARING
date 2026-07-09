const rootContainer = document.getElementById('app-root');
const headerContainer = document.getElementById('header-root');

let activeComponentCleanup = null;
let lastResetCounter = 0;

// Khởi chạy dọn dẹp component cũ trước khi vẽ component mới
function cleanupActiveComponent() {
  if (typeof activeComponentCleanup === 'function') {
    activeComponentCleanup();
    activeComponentCleanup = null;
  }
}

// Render Header của Website
function renderHeader(state, player, isAdmin) {
  if (!player && !isAdmin) {
    headerContainer.innerHTML = '';
    headerContainer.style.display = 'none';
    return;
  }

  headerContainer.style.display = 'block';

  let userBadgeHTML = '';
  if (isAdmin) {
    userBadgeHTML = `
      <div class="header-user-badge" style="border-color:rgba(16,185,129,0.3); color:var(--primary-dark); background:var(--primary-xlight);">
        <i data-lucide="shield-check" style="width:14px;height:14px;"></i>
        <span style="font-weight:700;">Quản trị viên</span>
      </div>
    `;
  } else if (player) {
    const isRevealed = sessionStorage.getItem(`revealed_team_${player.id}`) === player.team;
    const hideTeam = state.teamConnectActive && !isRevealed;
    const teamObj = !hideTeam ? (state.teams || []).find(t => t.id === player.team) : null;
    userBadgeHTML = `
      <div style="display:flex; gap:10px; align-items:center;">
        <div class="header-user-badge">
          <i data-lucide="user" style="width:14px;height:14px;"></i>
          <span>${player.name} · ${player.department}</span>
        </div>
        ${teamObj ? `
          <span class="badge" style="background:${teamObj.colorLight}; color:${teamObj.color}; border:1.5px solid ${teamObj.border};">
            ${teamObj.emoji} ${teamObj.name}
          </span>
        ` : `
          <span class="badge" style="background:rgba(15,23,42,0.06); color:var(--text-secondary); border: 1.5px solid rgba(15,23,42,0.08);">
            ⏳ Chưa xếp đội
          </span>
        `}
      </div>
    `;
  }

  headerContainer.innerHTML = `
    <div class="header-container">
      <a href="#" class="header-logo" id="headerLogoHome">
        <div class="header-logo-dot"></div>
        <span>Welcome to OPPO</span>
      </a>
      ${userBadgeHTML}
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  document.getElementById('headerLogoHome').addEventListener('click', (e) => {
    e.preventDefault();
    renderApp(window.getGameState());
  });
}

// Render màn hình sảnh chờ cho người chơi khi stage = 0
function renderWaitingLobby(container, player) {
  container.innerHTML = `
    <div class="glass-card fade-in" style="max-width:480px; margin:40px auto; padding:48px 36px; text-align:center;">

      <!-- Mascot head bouncing -->
      <div style="position:relative; width:120px; height:120px; margin:0 auto 28px; display:flex; align-items:center; justify-content:center;">
        <!-- Vòng sóng pulse xanh -->
        <div style="position:absolute; inset:0; border-radius:50%; border:3px solid rgba(16,185,129,0.35); animation:ping 1.6s cubic-bezier(0,0,0.2,1) infinite;"></div>
        <div style="position:absolute; inset:8px; border-radius:50%; border:2px solid rgba(16,185,129,0.2); animation:ping 1.6s cubic-bezier(0,0,0.2,1) infinite 0.4s;"></div>
        <!-- Mascot head -->
        <img src="assets/mascot.png" alt="Ollie"
          style="width:96px; height:96px; object-fit:contain; position:relative; z-index:1;
                 animation:mascot-float 3s ease-in-out infinite;
                 filter:drop-shadow(0 8px 16px rgba(16,185,129,0.25));">
      </div>

      <!-- Chào mừng -->
      <h2 style="font-size:28px; font-weight:900; color:var(--text-primary); letter-spacing:-0.03em; margin-bottom:6px;">
        Chào mừng, ${player.name}! 🎉
      </h2>
      <p style="font-size:14px; color:var(--text-muted); margin-bottom:20px;">
        ${player.department}
      </p>

      <!-- Trạng thái chờ -->
      <div style="margin-top:24px; background:rgba(16,185,129,0.06); border:1px solid rgba(16,185,129,0.18); border-radius:14px; padding:16px 20px;">
        <div style="font-size:13px; font-weight:700; color:var(--primary); margin-bottom:4px;">
          ✅ Kết nối thành công!
        </div>
        <div style="font-size:12px; color:var(--text-muted); line-height:1.6;">
          Màn hình sẽ tự động chuyển khi Admin kích hoạt chương trình.
        </div>
      </div>

    </div>

    <style>
      @keyframes ping {
        75%, 100% { transform: scale(1.8); opacity: 0; }
      }
    </style>
  `;
  if (window.lucide) window.lucide.createIcons();
}

// Hàm điều phối chính (App Router)
let lastRenderedStageState = null; // Chuỗi định danh stage để xem có cần chạy hiệu ứng chuyển cảnh không

window.renderApp = function (state) {
  try {
    if (!state) state = window.getGameState();
    const isAdminLoggedIn = sessionStorage.getItem('admin_logged_in') === 'true';
    const isHostLoggedIn = sessionStorage.getItem('host_logged_in') === 'true';
    const currentPlayerId = sessionStorage.getItem('current_player_id');
    const player = (state.players || []).find(p => p.id === currentPlayerId);

    // Tự động reload để cập nhật script mới nhất khi Admin thay đổi câu hỏi
    if (state.quizQuestionsVersion) {
      const localVer = sessionStorage.getItem('last_quiz_version');
      if (localVer && localVer !== String(state.quizQuestionsVersion)) {
        sessionStorage.setItem('last_quiz_version', state.quizQuestionsVersion);
        location.reload();
        return;
      }
      sessionStorage.setItem('last_quiz_version', state.quizQuestionsVersion);
    }

    // Định danh màn hình hiện tại. Thêm các thuộc tính chi tiết để re-render khi qua câu, bắt đầu, hiện đáp án.
    const currentStageState = `stage:${state.stage}-tc:${state.teamConnectActive}-title:${state.showTitleScreen}-admin:${isAdminLoggedIn}-host:${isHostLoggedIn}-player:${!!player}-reset:${state.globalResetCounter || 0}-quiz:${JSON.stringify(state.quizState)}-tug:${JSON.stringify({ idx: state.tugOfWar?.currentQuestionIndex, reviewIdx: state.tugOfWar?.reviewQuestionIndex, active: state.tugOfWar?.isActive, winner: state.tugOfWar?.winner, status: state.tugOfWar?.status, round: state.tugOfWar?.round, ansLen: Object.keys(state.tugOfWar?.answers || {}).length })}-welcome:${JSON.stringify(state.welcomeSettings)}-players:${(state.players || []).map(p => p.id + ':' + p.team).join(',')}-sharingCardsVersion:${state.sharingCardsVersion || 0}-sharingLayoutVersion:${state.sharingLayoutVersion || 0}`;

    if (lastRenderedStageState === currentStageState) {
      return; // Không mount lại toàn bộ DOM để tránh giật lag, mất focus input và hỏng CSS transition.
    }

    const isScreenChanged = lastRenderedStageState && lastRenderedStageState !== currentStageState;

    if (isScreenChanged && !isAdminLoggedIn && (!!player || isHostLoggedIn) && state.stage !== 0 && state.stage !== 2) {
      // Nếu màn hình đổi và là người chơi/Host -> Chạy hiệu ứng tim tràn viền (Không áp dụng cho Stage 2 Kéo co)
      lastRenderedStageState = currentStageState;
      triggerHeartTransition(() => executeRender(state, isAdminLoggedIn, isHostLoggedIn, currentPlayerId, player));
    } else {
      lastRenderedStageState = currentStageState;
      executeRender(state, isAdminLoggedIn, isHostLoggedIn, currentPlayerId, player);
    }
  } catch (err) {
    console.error("Critical Render Error:", err);
    document.body.innerHTML = `<div style="padding: 20px; color: red; font-family: monospace; background: white; z-index: 9999; position: fixed; top: 0; left: 0; width: 100%; height: 100%;">
      <h2>Ứng dụng gặp lỗi nghiêm trọng (Critical Error)</h2>
      <p><b>Message:</b> ${err.message}</p>
      <pre>${err.stack}</pre>
    </div>`;
  }
};

function triggerHeartTransition(callback) {
  const overlay = document.getElementById('transition-overlay');
  const heart = overlay.querySelector('.heart-transition');

  // Reset trạng thái
  overlay.style.display = 'flex';
  heart.className = 'heart-transition';

  // Bắt đầu phình to
  setTimeout(() => {
    heart.classList.add('expanding');

    // Khi tim to hết cỡ (che màn hình), render content mới
    setTimeout(() => {
      callback();

      // Mờ dần tim rồi biến mất
      heart.classList.add('fading');
      setTimeout(() => {
        overlay.style.display = 'none';
        heart.className = 'heart-transition'; // reset
      }, 400);
    }, 550);
  }, 50);
}

function renderTitleScreen(container, state, stageNum) {
  const titles = state.stageTitles || { 1: "KIẾN THỨC CỐT LÕI", 2: "SỨC MẠNH ĐỒNG ĐỘI", 3: "CẢM HỨNG VÀ CHIA SẺ", 4: "GIẢI MÃ TỪ KHÓA" };
  const title = titles[stageNum] || `Giai đoạn ${stageNum}`;

  container.innerHTML = `
    <div class="glass-card fade-in" style="max-width:700px; margin:10vh auto; padding:60px 40px; text-align:center;">
      <div style="font-size:14px; font-weight:800; color:var(--primary); letter-spacing:0.3em; text-transform:uppercase; margin-bottom:16px;">
        Welcome to OPPO
      </div>
      <h1 style="font-size:42px; font-weight:900; color:var(--text-primary); letter-spacing:-0.03em; margin-bottom:24px; line-height:1.2;">
        ${title}
      </h1>
      <div style="width:60px; height:4px; background:linear-gradient(90deg, var(--primary), var(--primary-dark)); margin:0 auto 32px; border-radius:2px;"></div>
      
      <div class="animate-pulse" style="display:inline-flex; align-items:center; gap:8px; font-size:15px; color:var(--text-secondary); font-weight:600;">
        <i data-lucide="loader" class="animate-spin" style="width:18px;height:18px;color:var(--primary);"></i>
        Đang chờ Quản trị viên bắt đầu...
      </div>
    </div>
  `;
  if (window.lucide) window.lucide.createIcons();
}

function executeRender(state, isAdminLoggedIn, isHostLoggedIn, currentPlayerId, player) {
  cleanupActiveComponent();

  // 1. Kiểm tra Reset toàn cục từ Admin
  if (state.globalResetCounter > lastResetCounter) {
    lastResetCounter = state.globalResetCounter;
    sessionStorage.clear();
    if (isAdminLoggedIn) sessionStorage.setItem('admin_logged_in', 'true');
    if (isHostLoggedIn) sessionStorage.setItem('host_logged_in', 'true');
    alert("Hệ thống đã được Quản trị viên reset về mặc định! Vui lòng đăng ký lại.");
  }

  // 2. Nếu Admin đã đăng nhập
  if (isAdminLoggedIn) {
    renderHeader(state, null, true);
    activeComponentCleanup = window.renderAdminDashboard(rootContainer, state, {
      onLogout: () => {
        sessionStorage.removeItem('admin_logged_in');
        lastRenderedStageState = null;
        window.renderApp(window.getGameState());
      }
    });
    return;
  }

  // 3. Nếu chưa đăng nhập (Người chơi hoặc Admin/Host chưa gõ PIN)
  if (!isHostLoggedIn && (!currentPlayerId || !player)) {
    if (currentPlayerId && !player) sessionStorage.removeItem('current_player_id');
    renderHeader(state, null, false);
    window.renderLogin(rootContainer, state, {
      onLoginSuccess: (newPlayer) => {
        window.renderApp(window.getGameState());
      },
      onAdminAccess: () => {
        window.renderApp(window.getGameState());
      }
    });
    return;
  }

  // 4. Render Header (Host không cần Header cá nhân)
  if (!isHostLoggedIn) {
    renderHeader(state, player, false);
  } else {
    headerContainer.innerHTML = '';
    headerContainer.style.display = 'none';
  }

  // Kiểm tra xem người chơi đã tự hoàn thành 6 từ khóa chưa, hiển thị Certificate trước
  if (!isHostLoggedIn) {
    const completedKeywords = player.keywordsGuessed || [];
    if (completedKeywords.length === 6 && state.stage >= 4) {
      window.renderCertificate(rootContainer, state, {
        playerId: player.id,
        onRestart: () => window.renderApp(window.getGameState())
      });
      return;
    }
  }

  // Nếu đang kích hoạt giai đoạn kết nối đội ngũ (Team Connect)
  if (state.teamConnectActive) {
    const TCArgs = { isHost: isHostLoggedIn, playerId: player ? player.id : null };
    activeComponentCleanup = window.renderTeamConnect(rootContainer, state, TCArgs);
    return;
  }

  // Điều phối các Stage theo cài đặt của Admin
  switch (state.stage) {
    case 0: // Sảnh chờ
      if (isHostLoggedIn) {
        const welcome = state.welcomeSettings || { textSize: 120, mascotSize: 180 };
        rootContainer.innerHTML = `
          <div class="fade-in" style="height:100vh; display:flex; align-items:center; justify-content:center; flex-direction:column; padding: 40px; text-align: center; box-sizing: border-box; background: radial-gradient(circle at center, rgba(16, 185, 129, 0.04) 0%, transparent 70%); position: relative; overflow: hidden;">
            <!-- Premium background gradients -->
            <div style="position: absolute; width: 400px; height: 400px; background: radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%); top: -100px; left: -100px; pointer-events: none; border-radius: 50%;"></div>
            <div style="position: absolute; width: 500px; height: 500px; background: radial-gradient(circle, rgba(14,165,233,0.05) 0%, transparent 70%); bottom: -150px; right: -150px; pointer-events: none; border-radius: 50%;"></div>

            <div style="display:flex; flex-direction:column; align-items:center; gap: ${Math.max(16, welcome.textSize * 0.25)}px; max-width: 90%; z-index: 1;">
              <div style="display: flex; justify-content: center; align-items: center; min-height: ${welcome.mascotSize}px;">
                <img src="assets/mascot.png" alt="Ollie" style="width:${welcome.mascotSize}px; height:${welcome.mascotSize}px; object-fit:contain; animation: mascot-bounce-in 1.2s var(--ease-spring), mascot-float 5s ease-in-out infinite 1.2s; filter: drop-shadow(0 20px 30px rgba(16,185,129,0.15));">
              </div>
              
              <div style="display: flex; flex-direction: column; align-items: center;">
                <div style="font-size: ${Math.max(16, welcome.textSize * 0.35)}px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.3em; margin-bottom: ${Math.max(8, welcome.textSize * 0.08)}px; line-height: 1.2;">
                  WELCOME TO
                </div>
                <h1 style="font-size:${welcome.textSize}px; font-weight:900; letter-spacing:-0.03em; margin: 0; line-height: 0.95; text-transform:uppercase; white-space: nowrap;">
                  <span style="background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">OPPO</span>
                  <span style="color: var(--text-primary);">VIỆT NAM</span>
                </h1>
              </div>

              <!-- Player List on Host Screen -->
              <div style="margin-top: 32px; width: 100%; max-width: 800px;">
                <div style="font-size: 14px; font-weight: 700; color: var(--text-secondary); margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.08em; display: flex; align-items: center; justify-content: center; gap: 8px;">
                  <i data-lucide="users" style="width: 18px; height: 18px; color: var(--primary);"></i>
                  Thành viên tham gia (${state.players ? state.players.length : 0})
                </div>
                
                ${!state.players || state.players.length === 0 ? `
                  <div style="color: var(--text-muted); font-size: 14px; font-style: italic;">
                    Chưa có người chơi nào đăng nhập...
                  </div>
                ` : `
                  <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px;">
                    ${state.players.map(p => {
                      const teamObj = (state.teams || []).find(t => t.id === p.team);
                      const bg     = teamObj ? teamObj.colorLight : 'rgba(15,23,42,0.04)';
                      const border = teamObj ? `1px solid ${teamObj.border}` : '1px solid rgba(15,23,42,0.08)';
                      const color  = teamObj ? teamObj.color : 'var(--text-secondary)';
                      const emoji  = teamObj ? teamObj.emoji : '👤';
                      const tName  = teamObj ? teamObj.name : '';
                      return `
                        <div class="fade-in" style="background:${bg}; border:${border}; color:${color}; padding: 8px 16px; border-radius: 12px; font-weight: 700; font-size: 13px; display: flex; align-items: center; gap: 6px; box-shadow: var(--shadow-xs);">
                          ${emoji}
                          ${p.name}
                          <span style="font-weight: 500; font-size: 11px; opacity: 0.7;">
                            (${p.department}${tName ? ` · ${tName}` : ''})
                          </span>
                        </div>
                      `;
                    }).join('')}
                  </div>
                `}
              </div>
            </div>
          </div>
        `;
        if (window.lucide) window.lucide.createIcons();
      } else {
        renderWaitingLobby(rootContainer, player);
      }
      return;
  }

  // Nếu màn hình đang ở chế độ Title Screen
  if (state.showTitleScreen && state.stage >= 1 && state.stage <= 4) {
    renderTitleScreen(rootContainer, state, state.stage);
    return;
  }

  // 5. Render nội dung Stage (nếu không hiện Title Screen)
  const args = { isHost: isHostLoggedIn, playerId: player ? player.id : null };
  switch (state.stage) {
    case 1:
      activeComponentCleanup = window.renderQuizGame(rootContainer, state, args);
      break;

    case 2: // Game 2: Kéo co
      activeComponentCleanup = window.renderTugOfWar(rootContainer, state, args);
      break;

    case 3: // Stage 3: Chia sẻ thả tim
      window.renderSeniorSharing(rootContainer, state, args);
      break;

    case 4: // Stage 4: Nhập từ khóa
      args.onAllGuessed = () => window.renderApp(window.getGameState());
      window.renderKeywordGrid(rootContainer, state, args);
      break;

    case 5: // Stage 5: Chứng nhận hoàn thành
      if (isHostLoggedIn) {
        rootContainer.innerHTML = `
          <div class="fade-in" style="height:80vh; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px; box-sizing:border-box; position:relative; overflow:hidden; text-align:center;">
            
            <!-- Mascot head with floating effects above it -->
            <div style="position:relative; width:160px; height:160px; margin-bottom:40px; display:inline-block;">
              
              <!-- Sparkles and effects wrapper above the head -->
              <div style="position:absolute; top:-50px; left:0; right:0; height:50px; display:flex; justify-content:center; pointer-events:none;">
                <!-- Sparkle 1 -->
                <span style="position:absolute; font-size:24px; animation: float-sparkle 2.2s infinite ease-in-out;">✨</span>
                <!-- Sparkle 2 -->
                <span style="position:absolute; font-size:18px; animation: float-sparkle 1.8s infinite ease-in-out 0.4s; left:30px;">⭐</span>
                <!-- Sparkle 3 -->
                <span style="position:absolute; font-size:20px; animation: float-sparkle 2s infinite ease-in-out 0.8s; right:30px;">🎉</span>
                <!-- Sparkle 4 -->
                <span style="position:absolute; font-size:26px; animation: float-sparkle 2.5s infinite ease-in-out 0.2s; top:-10px;">✨</span>
              </div>

              <!-- Glowing background behind mascot -->
              <div style="position:absolute; inset:10px; background:rgba(16,185,129,0.2); filter:blur(24px); border-radius:50%; animation: host-mascot-glow 3s infinite ease-in-out;"></div>

              <img src="assets/mascot.png" alt="Mascot" style="width:100%; height:100%; object-fit:contain; position:relative; z-index:1; animation: mascot-float 4s ease-in-out infinite;">
            </div>

            <h1 style="font-size:64px; font-weight:900; letter-spacing:-0.03em; margin:0; text-transform:uppercase; line-height:1.1; font-family:var(--font);">
              NOW YOU ARE <span style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">OPPOER</span>
            </h1>
          </div>

          <style>
            @keyframes float-sparkle {
              0% { transform: translateY(20px) scale(0.5); opacity: 0; }
              50% { opacity: 1; }
              100% { transform: translateY(-40px) scale(1.2); opacity: 0; }
            }
            @keyframes host-mascot-glow {
              0%, 100% { transform: scale(1); opacity: 0.5; }
              50% { transform: scale(1.25); opacity: 0.8; }
            }
          </style>
        `;
      } else {
        args.onRestart = () => window.renderApp(window.getGameState());
        window.renderCertificate(rootContainer, state, args);
      }
      break;

    default:
      if (isHostLoggedIn) rootContainer.innerHTML = '';
      else renderWaitingLobby(rootContainer, player);
      break;
  }
};

// Khởi tạo chạy ứng dụng
const initialState = window.getGameState();
lastResetCounter = initialState.globalResetCounter || 0;

// Đăng ký nhận sự thay đổi trạng thái
window.subscribeToState((state) => {
  window.renderApp(state);
});

// Chạy vẽ màn hình lần đầu tiên
window.renderApp(initialState);

