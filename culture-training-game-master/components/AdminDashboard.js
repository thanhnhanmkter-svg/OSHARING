window.renderAdminDashboard = function(container, state, { onLogout }) {
  let activeTab = sessionStorage.getItem('admin_active_tab') || 'control';
  let cleanupFns = [];

  function render() {
    const st      = window.getGameState();
    const teams   = st.teams || [];
    const players = st.players || [];
    const redTeam = players.filter(p => p.team === 'Red');
    const blueTeam = players.filter(p => p.team === 'Blue');
    const hearts  = st.sharingHearts || { 1: 0, 2: 0, 3: 0 };
    const totalHearts = Object.values(hearts).reduce((a, b) => a + b, 0);
    const completedKw = players.filter(p => p.keywordsGuessed && p.keywordsGuessed.length === 6).length;

    container.innerHTML = `
      <div class="fade-in" style="display:flex; flex-direction:column; gap:24px; margin-bottom:50px; max-width:1200px; margin-left:auto; margin-right:auto;">

        <!-- ── Header ─────────────────────────────────────── -->
        <div class="glass-card glass-card-emerald" style="padding:20px 28px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px;">
          <div style="display:flex; align-items:center; gap:14px;">
            <div style="width:46px; height:46px; border-radius:14px; background:linear-gradient(135deg,var(--primary),var(--primary-dark)); display:flex; align-items:center; justify-content:center; box-shadow:var(--shadow-emerald);">
              <i data-lucide="shield-check" style="width:24px; height:24px; color:#fff;"></i>
            </div>
            <div>
              <h1 style="font-size:20px; font-weight:800; color:var(--text-primary); letter-spacing:-0.03em;">
                Bảng Điều Khiển Quản Trị
              </h1>
              <p style="font-size:13px; color:var(--text-secondary); margin-top:1px;">
                Kiểm soát toàn bộ chương trình đào tạo văn hóa
              </p>
            </div>
          </div>
          <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <button id="btnResetAll" class="btn btn-danger btn-sm">
              <i data-lucide="refresh-cw" style="width:14px;height:14px;"></i> Reset Game
            </button>
            <button id="btnAdminLogout" class="btn btn-secondary btn-sm">
              <i data-lucide="log-out" style="width:14px;height:14px;"></i> Đăng xuất
            </button>
          </div>
        </div>

        <!-- ── Quick Stats ─────────────────────────────────── -->
        <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:16px;">
          ${[
            { icon:'users',      value: players.length,    label:'Người chơi',    color:'var(--primary)' },
            { icon:'heart',      value: totalHearts,       label:'Lượt thả tim',  color:'#f43f5e' },
            { icon:'key-round',  value: completedKw,       label:'Hoàn thành KW', color:'#f59e0b' },
            { icon:'zap',        value: st.stage === 0 ? 'Màn Chờ' : `Stage ${st.stage}`,label:'Giai đoạn',   color:'#8b5cf6' },
          ].map(s => `
            <div class="glass-card" style="padding:18px 20px; display:flex; align-items:center; gap:14px;">
              <div style="width:40px; height:40px; border-radius:12px; background:${s.color}18; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                <i data-lucide="${s.icon}" style="width:20px;height:20px;color:${s.color};"></i>
              </div>
              <div>
                <div style="font-size:24px; font-weight:800; color:var(--text-primary); letter-spacing:-0.03em;">${s.value}</div>
                <div style="font-size:11px; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.06em;">${s.label}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- ── Tab Navigation ─────────────────────────────── -->
        <div class="glass-card" style="padding:6px;">
          <div class="admin-tabs">
            <button class="admin-tab ${activeTab==='control'?'active':''}" data-tab="control">
              <i data-lucide="navigation" style="width:16px;height:16px;"></i> Điều Khiển Game
            </button>
            <button class="admin-tab ${activeTab==='content'?'active':''}" data-tab="content">
              <i data-lucide="edit-3" style="width:16px;height:16px;"></i> Chỉnh Sửa Nội Dung
            </button>
            <button class="admin-tab ${activeTab==='players'?'active':''}" data-tab="players">
              <i data-lucide="users" style="width:16px;height:16px;"></i> Người Chơi
            </button>
            <button class="admin-tab ${activeTab==='settings'?'active':''}" data-tab="settings">
              <i data-lucide="settings" style="width:16px;height:16px;"></i> Cài Đặt
            </button>
          </div>
        </div>

        <!-- ── Tab Content ─────────────────────────────────── -->
        <div id="tab-content"></div>

      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Wire tabs
    container.querySelectorAll('.admin-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.dataset.tab;
        sessionStorage.setItem('admin_active_tab', activeTab);
        render();
      });
    });

    // Wire action buttons
    container.querySelector('#btnResetAll').addEventListener('click', () => {
      if (confirm('Cảnh báo: Reset toàn bộ sẽ xóa tất cả dữ liệu người chơi và điểm số!\n\nBạn có chắc chắn?')) {
        window.resetGameState();
      }
    });
    container.querySelector('#btnAdminLogout').addEventListener('click', () => {
      sessionStorage.removeItem('admin_logged_in');
      if (onLogout) onLogout();
    });

    // Render active tab
    const tabEl = container.querySelector('#tab-content');
    if (activeTab === 'control')  renderTabControl(tabEl, st, teams, redTeam, blueTeam, players);
    if (activeTab === 'content')  renderTabContent(tabEl);
    if (activeTab === 'players')  renderTabPlayers(tabEl, players);
    if (activeTab === 'settings') renderTabSettings(tabEl);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // TAB 1 – ĐIỀU KHIỂN GAME
  // ────────────────────────────────────────────────────────────────────────────
  function renderTabControl(el, st, teams, redTeam, blueTeam, players) {
    el.innerHTML = `
      <div style="display:grid; grid-template-columns:1fr 340px; gap:24px;">

        <!-- Left column -->
        <div style="display:flex; flex-direction:column; gap:24px;">

          <!-- Stage switcher -->
          <div class="glass-card" style="padding:28px;">
            <h2 style="font-size:16px; font-weight:700; color:var(--text-primary); margin-bottom:20px; display:flex; align-items:center; gap:8px;">
              <i data-lucide="layers" style="width:18px;height:18px;color:var(--primary);"></i>
              Kích Hoạt Stage Toàn Phòng
            </h2>
            <div style="display:grid; grid-template-columns:repeat(6,1fr); gap:10px; margin-bottom:16px;">
              ${[0,1,2,3,4,5].map(stg => `
                <button class="btn-stage-select ${st.stage === stg ? 'btn-primary' : 'btn-outline'}"
                        data-stage="${stg}"
                        style="padding:12px 6px; font-weight:700; font-size:13px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; line-height:1.2; min-height:60px;">
                  <span style="font-size:10px; opacity:0.8; font-weight:600; text-transform:uppercase; letter-spacing:0.02em;">
                    ${st.stage === stg ? '▶ Đang chạy' : (stg === 0 ? 'Khởi động' : `Giai đoạn`)}
                  </span>
                  <span>
                    ${stg === 0 ? 'Màn Chờ' : `Stage ${stg}`}
                  </span>
                </button>
              `).join('')}
            </div>

            <!-- Prev / Next Stage Buttons -->
            <div style="display:flex; gap:12px; margin-bottom:16px;">
              <button id="btnStagePrev" class="btn btn-secondary btn-sm" style="flex:1; padding:12px; font-weight:700; display:flex; align-items:center; justify-content:center; gap:8px;" ${st.stage === 0 ? 'disabled' : ''}>
                <i data-lucide="chevron-left" style="width:16px; height:16px;"></i> Lùi Stage
              </button>
              <button id="btnStageNext" class="btn btn-secondary btn-sm" style="flex:1; padding:12px; font-weight:700; display:flex; align-items:center; justify-content:center; gap:8px;" ${st.stage === 5 ? 'disabled' : ''}>
                Tiến Stage <i data-lucide="chevron-right" style="width:16px; height:16px;"></i>
              </button>
            </div>

            ${st.stage > 0 ? `
            <!-- Nút Bắt đầu nội dung Stage -->
            <button id="btnStartStageContent" class="btn btn-primary" style="width:100%; padding:16px; font-size:16px; font-weight:800; display:flex; align-items:center; justify-content:center; gap:10px; margin-bottom:16px; border-radius:14px; box-shadow:0 4px 16px rgba(16,185,129,0.3); ${!st.showTitleScreen ? 'opacity:0.5; cursor:not-allowed;' : ''}">
              <i data-lucide="play-circle" style="width:22px;height:22px;"></i>
              ${st.showTitleScreen ? `▶ Bắt Đầu Nội Dung Stage ${st.stage}` : `✅ Đang chạy nội dung Stage ${st.stage}`}
            </button>
            ` : `
            <!-- Nút Toggle Team Connect -->
            <div style="background: rgba(16, 185, 129, 0.05); border: 1.5px dashed var(--primary); border-radius: 14px; padding: 16px; text-align: center; margin-bottom: 16px;">
              <h4 style="font-size: 14px; font-weight: 800; color: var(--primary-dark); margin: 0 0 6px;">Kết Nối Đồng Đội</h4>
              <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 14px; line-height: 1.4;">Bật để chuyển giao diện người chơi &amp; máy chiếu sang chế độ phân chia đội ngũ.</p>
              <button id="btnToggleTeamConnect" class="btn ${st.teamConnectActive ? 'btn-danger' : 'btn-primary'}" style="width:100%; padding:12px; font-weight:800; display:flex; align-items:center; justify-content:center; gap:8px; border-radius:10px; font-size:13.5px; box-shadow: 0 4px 12px ${st.teamConnectActive ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'};">
                <i data-lucide="${st.teamConnectActive ? 'pause-circle' : 'users'}" style="width:18px;height:18px;"></i>
                ${st.teamConnectActive ? '⏸ Dừng Team Connect' : '▶ Bắt Đầu Team Connect'}
              </button>
              ${st.teamConnectActive ? `
                <div style="margin-top: 10px; font-size: 11px; color: var(--primary-darker); font-weight: 600;">
                  💡 Xếp đội ở cột bên phải. Khi xong, hãy bấm Lùi/Tiến Stage.
                </div>
              ` : ''}
            </div>
            `}

            <!-- Title Screen Toggle -->

            <div style="margin-top:20px; display:flex; align-items:center; gap:10px; background:var(--bg-card); padding:14px 18px; border-radius:12px; border:1px solid rgba(15,23,42,0.06);">
              <label class="switch" style="position:relative; display:inline-block; width:44px; height:24px;">
                <input type="checkbox" id="chkShowTitle" ${st.showTitleScreen ? 'checked' : ''} style="opacity:0; width:0; height:0;">
                <span class="slider" style="position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background-color:${st.showTitleScreen ? 'var(--primary)' : '#ccc'}; transition:.4s; border-radius:34px;">
                  <span style="position:absolute; content:''; height:18px; width:18px; left:3px; bottom:3px; background-color:white; transition:.4s; border-radius:50%; transform:${st.showTitleScreen ? 'translateX(20px)' : 'translateX(0)'}"></span>
                </span>
              </label>
              <div style="display:flex; flex-direction:column;">
                <span style="font-weight:700; font-size:14px; color:var(--text-primary);">Màn hình Tiêu đề (Title Screen)</span>
                <span style="font-size:12px; color:var(--text-secondary);">Bật để người chơi thấy Tiêu đề trước khi bắt đầu nội dung Stage</span>
              </div>
            </div>
            <div style="background:var(--primary-xlight); border:1px solid rgba(16,185,129,0.15); border-radius:10px; padding:12px 16px; font-size:13px; color:var(--primary-darker); display:flex; align-items:center; gap:8px;">
              <i data-lucide="info" style="width:14px;height:14px;flex-shrink:0;"></i>
              Khi chuyển Stage, tất cả tab người chơi sẽ tự động cập nhật ngay lập tức.
            </div>
          </div>

          <!-- Quiz Game (Stage 1) -->
          <div class="glass-card" style="padding:28px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:22px;">
              <h2 style="font-size:16px; font-weight:700; color:var(--text-primary); display:flex; align-items:center; gap:8px; margin:0;">
                <i data-lucide="help-circle" style="width:18px;height:18px;color:var(--primary);"></i>
                Điều khiển Quiz (Stage 1)
              </h2>
            </div>
            
            <div style="display:flex; flex-direction:column; gap:16px; background:rgba(15,23,42,0.03); border:var(--border-soft); border-radius:16px; padding:24px;">
              <div style="font-size:14px; font-weight:700;">
                Câu hiện tại: <span id="admin-quiz-qnum" style="color:var(--primary); font-size:16px;">${st.quizState.currentQuestionIndex + 1}</span> / ${window.getQuizQuestions().length}
              </div>
              <div style="display:flex; gap:10px;">
                <button id="btnQuizPrev" class="btn btn-secondary btn-sm" ${st.quizState.currentQuestionIndex === 0 ? 'disabled' : ''}>&lt; Câu Trước</button>
                <button id="btnQuizNext" class="btn btn-secondary btn-sm" ${st.quizState.currentQuestionIndex === window.getQuizQuestions().length - 1 ? 'disabled' : ''}>Câu Tiếp Theo &gt;</button>
              </div>
              <hr style="border:0; border-top:1px solid rgba(15,23,42,0.06); margin:4px 0;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <button id="btnQuizToggle" class="btn btn-sm ${st.quizState.isActive ? 'btn-danger' : 'btn-primary'}">
                  ${st.quizState.isActive ? '⏸ Khóa Câu Hỏi' : '▶ Bắt Đầu C/Hỏi'}
                </button>
                <button id="btnQuizShowAnswer" class="btn btn-sm ${st.quizState.showAnswer ? 'btn-danger' : 'btn-outline'}">
                  ${st.quizState.showAnswer ? 'Ẩn Đáp Án' : 'Hiện Đáp Án'}
                </button>
              </div>
            </div>
          </div>

          <!-- Tug of war -->
          <div class="glass-card" style="padding:28px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:22px;">
              <h2 style="font-size:16px; font-weight:700; color:var(--text-primary); display:flex; align-items:center; gap:8px; margin:0;">
                <i data-lucide="swords" style="width:18px;height:18px;color:var(--team-red);"></i>
                Live Kéo Co (Stage 2)
              </h2>
            </div>
            
            ${st.tugOfWar.status === 'waiting' ? `
              <!-- CHƯA BẮT ĐẦU: Cấu hình Round và Đội đấu -->
              <div style="display:flex; flex-direction:column; gap:16px; background:rgba(15,23,42,0.03); border:var(--border-soft); border-radius:16px; padding:20px;">
                <div>
                  <label style="display:block; font-size:12px; font-weight:700; color:var(--text-muted); margin-bottom:6px;">Chọn Round thi đấu</label>
                  <select id="selTugRound" style="width:100%; padding:10px; border-radius:10px; border:1px solid rgba(15,23,42,0.1); font-size:14px; font-family:var(--font); outline:none; background:#fff; cursor:pointer;">
                    <option value="1" ${st.tugOfWar.round === 1 ? 'selected' : ''}>Round 1 (Câu 1 - 5 từ pool)</option>
                    <option value="2" ${st.tugOfWar.round === 2 ? 'selected' : ''}>Round 2 (Câu 6 - 10 từ pool)</option>
                  </select>
                </div>
                
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                  <div>
                    <label style="display:block; font-size:12px; font-weight:700; color:var(--text-muted); margin-bottom:6px;">Đội Đỏ (Bên Trái)</label>
                    <select id="selTugTeamA" style="width:100%; padding:10px; border-radius:10px; border:1px solid rgba(15,23,42,0.1); font-size:14px; font-family:var(--font); outline:none; background:#fff; cursor:pointer;">
                      ${teams.map(t => `<option value="${t.id}" ${st.tugOfWar.teamA === t.id ? 'selected' : ''}>${t.emoji} ${t.name}</option>`).join('')}
                    </select>
                  </div>
                  <div>
                    <label style="display:block; font-size:12px; font-weight:700; color:var(--text-muted); margin-bottom:6px;">Đội Xanh (Bên Phải)</label>
                    <select id="selTugTeamB" style="width:100%; padding:10px; border-radius:10px; border:1px solid rgba(15,23,42,0.1); font-size:14px; font-family:var(--font); outline:none; background:#fff; cursor:pointer;">
                      ${teams.map(t => `<option value="${t.id}" ${st.tugOfWar.teamB === t.id ? 'selected' : ''}>${t.emoji} ${t.name}</option>`).join('')}
                    </select>
                  </div>
                </div>

                <button id="btnStartTugMatch" class="btn btn-primary" style="width:100%; padding:12px; font-weight:800; font-size:15px; display:flex; align-items:center; justify-content:center; gap:8px;">
                  <i data-lucide="play" style="width:18px;height:18px;"></i> Bắt Đầu Trận Đấu
                </button>
              </div>
            ` : ''}

            ${st.tugOfWar.status === 'playing' ? `
              <!-- ĐANG THI ĐẤU -->
              <div style="display:flex; flex-direction:column; gap:16px; background:rgba(15,23,42,0.03); border:var(--border-soft); border-radius:16px; padding:20px; margin-bottom:16px;">
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:14px; font-weight:700; color:var(--primary-dark);">
                  <span>Round ${st.tugOfWar.round} · Trận đấu đang diễn ra</span>
                  <span style="font-size:12px; font-weight:600; color:var(--text-muted);">
                    Đội: ${teams.find(t => t.id === st.tugOfWar.teamA)?.emoji || '🔴'} vs ${teams.find(t => t.id === st.tugOfWar.teamB)?.emoji || '🔵'}
                  </span>
                </div>
                
                <div style="font-size:14px; font-weight:700;">
                  Câu hiện tại: <span style="color:var(--primary); font-size:18px;">${(st.tugOfWar.currentQuestionIndex || 0) + 1}</span> / 5
                </div>

                <div style="display:flex; gap:12px; justify-content:space-between; align-items:center;">
                  <div style="font-size:13px; font-weight:600; color:var(--text-muted);">
                    Đã trả lời: <strong style="color:var(--primary);">${Object.keys(st.tugOfWar.answers || {}).length}</strong>
                  </div>
                  
                  <button id="btnCancelTugMatch" class="btn btn-danger btn-sm">
                    <i data-lucide="x-circle" style="width:14px;height:14px;"></i> Hủy Trận Đấu
                  </button>
                </div>
              </div>
            ` : ''}

            ${st.tugOfWar.status === 'reviewing' ? `
              <!-- XEM LẠI KẾT QUẢ (BTC SHOW ĐÁP ÁN) -->
              <div style="display:flex; flex-direction:column; gap:16px; background:rgba(15,23,42,0.03); border:var(--border-soft); border-radius:16px; padding:20px; margin-bottom:16px;">
                <div style="font-size:14px; font-weight:800; color:var(--success); text-transform:uppercase;">
                  🏆 Trận đấu kết thúc! BTC Review kết quả
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; font-size:14px; font-weight:700;">
                  <span>Xem lại câu hỏi:</span>
                  <span style="color:var(--primary); font-size:16px;">${(st.tugOfWar.reviewQuestionIndex || 0) + 1} / 5</span>
                </div>

                <div style="display:flex; gap:10px;">
                  <button id="btnReviewTugPrev" class="btn btn-secondary btn-sm" style="flex:1;" ${(st.tugOfWar.reviewQuestionIndex || 0) === 0 ? 'disabled' : ''}>&lt; Câu Trước</button>
                  <button id="btnReviewTugNext" class="btn btn-secondary btn-sm" style="flex:1;" ${(st.tugOfWar.reviewQuestionIndex || 0) === 4 ? 'disabled' : ''}>Câu Tiếp &gt;</button>
                </div>

                <button id="btnResetTugMatch" class="btn btn-outline btn-sm" style="width:100%; border-color:rgba(15,23,42,0.1); font-weight:700; display:flex; align-items:center; justify-content:center; gap:6px;">
                  <i data-lucide="rotate-ccw" style="width:14px;height:14px;"></i> Trận Đấu Mới (Reset)
                </button>
              </div>
            ` : ''}

            ${st.tugOfWar.status !== 'waiting' ? `
              <!-- Rope vis -->
              <div style="background:rgba(15,23,42,0.03); border:var(--border-soft); border-radius:16px; padding:24px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:14px; font-size:13px; font-weight:700;">
                  <span id="admin-tug-red" style="color:var(--team-red);">
                    🔴 ${teams.find(t => t.id === st.tugOfWar.teamA)?.name || 'Team A'} — ${st.tugOfWar.redScore} lực
                  </span>
                  <span id="admin-tug-blue" style="color:var(--team-blue);">
                    ${st.tugOfWar.blueScore} lực — ${teams.find(t => t.id === st.tugOfWar.teamB)?.name || 'Team B'} 🔵
                  </span>
                </div>
                <div class="rope-track" style="height:16px; margin:8px 0; position:relative;">
                  <div style="position:absolute; left:50%; width:3px; height:30px; background:rgba(15,23,42,0.2); transform:translate(-50%,-7px); border-radius:2px;"></div>
                  <div style="position:absolute; left:15%; width:2px; height:22px; background:rgba(239,68,68,0.4); transform:translate(-50%,-3px); border-radius:2px;"></div>
                  <div style="position:absolute; right:15%; width:2px; height:22px; background:rgba(14,165,233,0.4); transform:translateX(50%) translateY(-3px); border-radius:2px;"></div>
                  <div id="admin-tug-knot" style="position:absolute; left:${st.tugOfWar.ropePosition}%; width:22px; height:22px; border-radius:50%; background:#facc15; border:3px solid #fff; transform:translate(-50%,-3px); z-index:3; box-shadow:0 0 14px rgba(250,204,21,0.6); transition:left 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);"></div>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-muted); margin-top:14px;">
                  <span>← Vạch thắng Trái (< 15%)</span>
                  <span>Trung tâm (50%)</span>
                  <span>Vạch thắng Phải (> 85%) →</span>
                </div>
              </div>
            ` : ''}

            ${st.tugOfWar.winner ? `
              <div class="fade-in" style="text-align:center; padding:14px; border-radius:12px; background:linear-gradient(135deg,rgba(16,185,129,0.1),rgba(16,185,129,0.05)); border:1px solid rgba(16,185,129,0.2); margin-top:16px; font-weight:700; color:var(--primary-dark); font-size:15px;">
                🏆 Chiến thắng: Đội ${teams.find(t => t.id === st.tugOfWar.winner)?.emoji || '👑'} ${teams.find(t => t.id === st.tugOfWar.winner)?.name}!
              </div>
            ` : ''}
          </div>

        </div>

        <!-- Right column -->
        <div style="display:flex; flex-direction:column; gap:24px;">

          <!-- Team split -->
          <div class="glass-card" style="padding:24px;">
            <h3 style="font-size:15px; font-weight:700; color:var(--text-primary); margin-bottom:4px; display:flex; align-items:center; gap:8px;">
              <i data-lucide="shield" style="width:16px;height:16px;"></i> Cơ cấu đội
            </h3>
            <p style="font-size:11px; color:var(--text-muted); margin-bottom:14px;">Tối thiểu 2 đội · Tối đa 6 đội</p>

            <!-- Add/Remove team row -->
            <div style="display:flex; gap:8px; margin-bottom:14px;">
              ${teams.length < 6 ? `
                <button id="btnAddTeam" class="btn btn-sm" style="flex:1; font-weight:700; display:flex; align-items:center; justify-content:center; gap:5px; background:rgba(16,185,129,0.08); border:1.5px solid rgba(16,185,129,0.3); color:var(--primary);">
                  <i data-lucide="plus" style="width:13px;height:13px;"></i> Thêm đội mới
                </button>
              ` : `<span style="font-size:11px; color:var(--text-muted); align-self:center;">Đã đạt tối đa 6 đội</span>`}
            </div>

            <!-- Unassigned players -->
            ${players.filter(p => !p.team).length > 0 ? `
              <div style="background:rgba(15,23,42,0.04); border:1px solid rgba(15,23,42,0.08); border-radius:12px; padding:14px; margin-bottom:12px;">
                <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:700; color:var(--text-secondary); margin-bottom:10px;">
                  <span>👤 Chưa xếp đội</span>
                  <span>${players.filter(p => !p.team).length} người</span>
                </div>
                <div style="display:flex; flex-direction:column; gap:6px; max-height:100px; overflow-y:auto;">
                  ${players.filter(p => !p.team).map(p => `
                    <div style="display:flex; align-items:center; justify-content:space-between; gap:6px;">
                      <span style="font-size:12px; color:var(--text-secondary); flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${p.name}</span>
                      <div style="display:flex; gap:3px; flex-shrink:0; flex-wrap:wrap; justify-content:flex-end;">
                        ${teams.map(t => `
                          <button class="btn-move-player" data-pid="${p.id}" data-team="${t.id}"
                            style="font-size:10px; padding:2px 6px; border-radius:6px; border:1.5px solid ${t.border}; background:${t.colorLight}; color:${t.color}; cursor:pointer; font-weight:700; line-height:1.4;"
                            title="Thêm vào ${t.name}">${t.emoji}</button>
                        `).join('')}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Each team -->
            ${teams.map((t, tIdx) => {
              const tPlayers = players.filter(p => p.team === t.id);
              const otherTeams = teams.filter(o => o.id !== t.id);
              return `
                <div style="background:${t.colorLight}; border:1.5px solid ${t.border}; border-radius:12px; padding:14px; margin-bottom:10px;">
                  <!-- Team header row -->
                  <div style="display:flex; align-items:center; gap:6px; margin-bottom:10px;">
                    <span style="font-size:16px;">${t.emoji}</span>
                    <input class="team-rename-input" data-tid="${t.id}"
                      value="${t.name}"
                      style="flex:1; font-size:13px; font-weight:700; color:${t.color}; background:transparent; border:none; border-bottom:1.5px solid ${t.border}; padding:2px 4px; outline:none; min-width:0;"
                      placeholder="Tên đội...">
                    <button class="btn-save-team-name" data-tid="${t.id}"
                      style="font-size:10px; padding:3px 8px; border-radius:6px; border:1.5px solid ${t.border}; background:${t.colorLight}; color:${t.color}; cursor:pointer; font-weight:700;">Lưu</button>
                    ${teams.length > 2 ? `
                      <button class="btn-remove-team" data-tid="${t.id}"
                        style="font-size:10px; padding:3px 7px; border-radius:6px; border:1.5px solid rgba(100,116,139,0.4); background:rgba(100,116,139,0.08); color:var(--text-muted); cursor:pointer; font-weight:700; line-height:1;" title="Xóa đội">✕</button>
                    ` : ''}
                    <span style="font-size:11px; font-weight:700; color:${t.color}; white-space:nowrap;">${tPlayers.length} ng</span>
                  </div>
                  <!-- Players in team -->
                  <div style="display:flex; flex-direction:column; gap:5px; max-height:110px; overflow-y:auto;">
                    ${tPlayers.length === 0
                      ? `<span style="font-size:12px; color:var(--text-muted); font-style:italic;">Chưa có thành viên</span>`
                      : tPlayers.map(p => `
                        <div style="display:flex; align-items:center; justify-content:space-between; gap:6px;">
                          <span style="font-size:12px; color:var(--text-secondary); flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${p.name}</span>
                          <div style="display:flex; gap:3px; flex-shrink:0;">
                            ${otherTeams.map(o => `
                              <button class="btn-move-player" data-pid="${p.id}" data-team="${o.id}"
                                style="font-size:10px; padding:2px 6px; border-radius:6px; border:1.5px solid ${o.border}; background:${o.colorLight}; color:${o.color}; cursor:pointer; font-weight:700; line-height:1.4;"
                                title="Chuyển sang ${o.name}">${o.emoji}</button>
                            `).join('')}
                            <button class="btn-move-player" data-pid="${p.id}" data-team="none"
                              style="font-size:10px; padding:2px 6px; border-radius:6px; border:1.5px solid rgba(100,116,139,0.4); background:rgba(100,116,139,0.08); color:var(--text-muted); cursor:pointer; font-weight:700; line-height:1.4;"
                              title="Đưa về Chưa xếp đội">✕</button>
                          </div>
                        </div>
                      `).join('')
                    }
                  </div>
                </div>
              `;
            }).join('')}
          </div>


          <!-- Sharing hearts -->
          <div class="glass-card" style="padding:24px; text-align:center;">
            <div style="font-size:32px; margin-bottom:6px;">❤️</div>
            <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:var(--text-muted); margin-bottom:4px;">Tổng Tim Stage 3</div>
            <div style="font-size:48px; font-weight:800; color:var(--text-primary); letter-spacing:-0.04em;">${Object.values(st.sharingHearts||{}).reduce((a,b)=>a+b,0)}</div>
          </div>

          <!-- Word Cloud -->
          <div class="glass-card" style="padding:24px; text-align:center;">
            <div style="font-size:32px; margin-bottom:6px;">☁️</div>
            <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:var(--text-muted); margin-bottom:12px;">Đám Mây Từ Khóa (Stage 4)</div>
            <div style="font-size:24px; font-weight:800; color:var(--primary); letter-spacing:-0.04em; margin-bottom:16px;">
              ${(st.wordCloud?.words || []).length} từ
            </div>
            <button id="btnClearWordCloud" class="btn btn-sm btn-danger" style="width:100%;">Xóa Sạch Mây</button>
          </div>

        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Stage buttons
    el.querySelectorAll('.btn-stage-select').forEach(btn => {
      btn.addEventListener('click', () => {
        window.setGameState({ stage: parseInt(btn.dataset.stage, 10), showTitleScreen: true, teamConnectActive: false });
        render();
      });
    });

    // Prev / Next stage buttons
    const btnStagePrev = el.querySelector('#btnStagePrev');
    if (btnStagePrev) {
      btnStagePrev.addEventListener('click', () => {
        window.setGameState(s => {
          const prevStage = Math.max(0, s.stage - 1);
          return { ...s, stage: prevStage, showTitleScreen: true, teamConnectActive: false };
        });
        render();
      });
    }

    const btnStageNext = el.querySelector('#btnStageNext');
    if (btnStageNext) {
      btnStageNext.addEventListener('click', () => {
        window.setGameState(s => {
          const nextStage = Math.min(5, s.stage + 1);
          return { ...s, stage: nextStage, showTitleScreen: true, teamConnectActive: false };
        });
        render();
      });
    }

    // Toggle Title Screen
    const chkShowTitle = el.querySelector('#chkShowTitle');
    if (chkShowTitle) {
      chkShowTitle.addEventListener('change', (e) => {
        window.setGameState({ showTitleScreen: e.target.checked });
        render();
      });
    }

    // Nút Bắt đầu nội dung Stage (tắt Title Screen)
    const btnStartStageContent = el.querySelector('#btnStartStageContent');
    if (btnStartStageContent) {
      btnStartStageContent.addEventListener('click', () => {
        const curState = window.getGameState();
        if (!curState.showTitleScreen) return; // Đã đang chạy rồi
        window.setGameState({ showTitleScreen: false });
        render();
      });
    }

    // Toggle Team Connect
    const btnToggleTeamConnect = el.querySelector('#btnToggleTeamConnect');
    if (btnToggleTeamConnect) {
      btnToggleTeamConnect.addEventListener('click', () => {
        window.setGameState(s => ({
          ...s,
          teamConnectActive: !s.teamConnectActive
        }));
        render();
      });
    }

    // Quiz controls
    el.querySelector('#btnQuizPrev').addEventListener('click', () => {
      window.setGameState(s => {
        const nextIdx = Math.max(0, s.quizState.currentQuestionIndex - 1);
        return { ...s, quizState: { ...s.quizState, currentQuestionIndex: nextIdx, isActive: false, showAnswer: false, answers: {} } };
      });
      render();
    });
    el.querySelector('#btnQuizNext').addEventListener('click', () => {
      window.setGameState(s => {
        const nextIdx = Math.min(window.getQuizQuestions().length - 1, s.quizState.currentQuestionIndex + 1);
        return { ...s, quizState: { ...s.quizState, currentQuestionIndex: nextIdx, isActive: false, showAnswer: false, answers: {} } };
      });
      render();
    });
    el.querySelector('#btnQuizToggle').addEventListener('click', () => {
      window.setGameState(s => ({
        ...s, 
        showTitleScreen: false,
        quizState: { 
          ...s.quizState, 
          isActive: !s.quizState.isActive, 
          showAnswer: false,
          startTime: !s.quizState.isActive ? Date.now() : s.quizState.startTime 
        }
      }));
      render();
    });
    el.querySelector('#btnQuizShowAnswer').addEventListener('click', () => {
      window.setGameState(s => ({
        ...s, 
        quizState: { ...s.quizState, showAnswer: !s.quizState.showAnswer }
      }));
      render();
    });

    // Tug controls (New logic)
    const btnStartTugMatch = el.querySelector('#btnStartTugMatch');
    if (btnStartTugMatch) {
      btnStartTugMatch.addEventListener('click', () => {
        const round = parseInt(el.querySelector('#selTugRound').value, 10);
        const teamA = el.querySelector('#selTugTeamA').value;
        const teamB = el.querySelector('#selTugTeamB').value;
        
        if (teamA === teamB) {
          alert('Vui lòng chọn 2 đội khác nhau để thi đấu!');
          return;
        }

        window.setGameState(s => ({
          ...s,
          showTitleScreen: false,
          tugOfWar: {
            ...s.tugOfWar,
            round,
            teamA,
            teamB,
            status: 'playing',
            isActive: true,
            startTime: Date.now(),
            currentQuestionIndex: 0,
            reviewQuestionIndex: 0,
            ropePosition: 50,
            redScore: 0,
            blueScore: 0,
            winner: null,
            answers: {}
          }
        }));
        render();
      });
    }

    const btnCancelTugMatch = el.querySelector('#btnCancelTugMatch');
    if (btnCancelTugMatch) {
      btnCancelTugMatch.addEventListener('click', () => {
        if (confirm('Bạn có chắc muốn hủy trận đấu hiện tại?')) {
          window.setGameState(s => ({
            ...s,
            tugOfWar: {
              ...s.tugOfWar,
              status: 'waiting',
              isActive: false,
              startTime: null,
              winner: null
            }
          }));
          render();
        }
      });
    }

    const btnReviewTugPrev = el.querySelector('#btnReviewTugPrev');
    if (btnReviewTugPrev) {
      btnReviewTugPrev.addEventListener('click', () => {
        window.setGameState(s => {
          const prevIdx = Math.max(0, (s.tugOfWar.reviewQuestionIndex || 0) - 1);
          return { ...s, tugOfWar: { ...s.tugOfWar, reviewQuestionIndex: prevIdx } };
        });
        render();
      });
    }

    const btnReviewTugNext = el.querySelector('#btnReviewTugNext');
    if (btnReviewTugNext) {
      btnReviewTugNext.addEventListener('click', () => {
        window.setGameState(s => {
          const nextIdx = Math.min(4, (s.tugOfWar.reviewQuestionIndex || 0) + 1);
          return { ...s, tugOfWar: { ...s.tugOfWar, reviewQuestionIndex: nextIdx } };
        });
        render();
      });
    }

    const btnResetTugMatch = el.querySelector('#btnResetTugMatch');
    if (btnResetTugMatch) {
      btnResetTugMatch.addEventListener('click', () => {
        if (confirm('Xác nhận đặt lại trò chơi kéo co?')) {
          window.setGameState(s => ({
            ...s,
            tugOfWar: {
              round: 1,
              teamA: 'Red',
              teamB: 'Blue',
              status: 'waiting',
              currentQuestionIndex: 0,
              reviewQuestionIndex: 0,
              ropePosition: 50,
              redScore: 0,
              blueScore: 0,
              isActive: false,
              winner: null,
              answers: {}
            }
          }));
          render();
        }
      });
    }

    // Move player between teams (event delegation)
    el.addEventListener('click', e => {
      const btn = e.target.closest('.btn-move-player');
      if (!btn) return;
      const pid  = btn.dataset.pid;
      const team = btn.dataset.team;
      window.setGameState(s => ({
        ...s,
        players: s.players.map(p =>
          p.id === pid ? { ...p, team: team === 'none' ? null : team } : p
        )
      }));
      render();
    });

    // Predefined extra teams (beyond the first 2)
    const TEAM_PRESETS = [
      { id: 'Green',  name: 'Đội Lá',   emoji: '🟢', color: '#22c55e', colorLight: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.3)'  },
      { id: 'Purple', name: 'Đội Tím',  emoji: '🟣', color: '#a855f7', colorLight: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.3)' },
      { id: 'Orange', name: 'Đội Cam',  emoji: '🟠', color: '#f97316', colorLight: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.3)' },
      { id: 'Yellow', name: 'Đội Vàng', emoji: '🟡', color: '#ca8a04', colorLight: 'rgba(202,138,4,0.08)',  border: 'rgba(202,138,4,0.3)'  },
    ];

    // Add team
    const btnAddTeam = el.querySelector('#btnAddTeam');
    if (btnAddTeam) {
      btnAddTeam.addEventListener('click', () => {
        window.setGameState(s => {
          const currentIds = (s.teams || []).map(t => t.id);
          const next = TEAM_PRESETS.find(t => !currentIds.includes(t.id));
          if (!next || s.teams.length >= 6) return s;
          return { ...s, teams: [...s.teams, next] };
        });
        render();
      });
    }

    // Save team name (event delegation)
    el.addEventListener('click', e => {
      const btn = e.target.closest('.btn-save-team-name');
      if (!btn) return;
      const tid = btn.dataset.tid;
      const input = el.querySelector(`.team-rename-input[data-tid="${tid}"]`);
      if (!input) return;
      const newName = input.value.trim();
      if (!newName) return;
      window.setGameState(s => ({
        ...s,
        teams: (s.teams || []).map(t => t.id === tid ? { ...t, name: newName } : t)
      }));
      render();
    });

    // Remove team
    el.addEventListener('click', e => {
      const btn = e.target.closest('.btn-remove-team');
      if (!btn) return;
      const tid = btn.dataset.tid;
      window.setGameState(s => {
        if ((s.teams || []).length <= 2) return s;
        return {
          ...s,
          teams: s.teams.filter(t => t.id !== tid),
          // Move players from removed team back to unassigned
          players: s.players.map(p => p.team === tid ? { ...p, team: null } : p)
        };
      });
      render();
    });

    // Word Cloud

    const btnClearWordCloud = el.querySelector('#btnClearWordCloud');
    if (btnClearWordCloud) {
      btnClearWordCloud.addEventListener('click', () => {
        if (confirm("Bạn có chắc chắn muốn xóa sạch toàn bộ từ khóa trên màn hình không?")) {
          window.setGameState(s => ({
            ...s,
            wordCloud: { words: [] }
          }));
          render();
        }
      });
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // TAB 2 – CHỈNH SỬA NỘI DUNG
  // ────────────────────────────────────────────────────────────────────────────
  function renderTabContent(el) {
    const quizQs    = window.getQuizQuestions();
    const tugSts    = window.getTugStatements();
    const sharingCs = window.getSharingCards();
    const kws       = window.getKeywords();
    const timerSecs = window.getQuizTimerSecs();

    let contentSection = sessionStorage.getItem('admin_content_section') || 'quiz'; // quiz | tug | sharing | keywords | timer

    function renderContentSections() {
      const st = window.getGameState();
      const currentTitles = st.stageTitles || { 1:"", 2:"", 3:"", 4:"" };

      el.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:24px;">

          <!-- Stage Titles Editor -->
          <div class="glass-card" style="padding:28px;">
            <h3 style="font-size:16px; font-weight:700; color:var(--text-primary); margin-bottom:16px; display:flex; align-items:center; gap:8px;">
              <i data-lucide="type" style="width:18px;height:18px;color:var(--primary);"></i>
              Tiêu Đề Các Stage
            </h3>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
              ${[1, 2, 3, 4].map(i => `
                <div>
                  <label style="display:block; font-size:12px; font-weight:600; color:var(--text-muted); margin-bottom:6px;">Stage ${i}</label>
                  <input type="text" class="input-title-stage" data-stage="${i}" value="${currentTitles[i] || ''}" style="width:100%; padding:10px 14px; border-radius:10px; border:1px solid rgba(15,23,42,0.1); font-size:14px; font-family:var(--font); outline:none;">
                </div>
              `).join('')}
            </div>
            <button id="btnSaveTitles" class="btn btn-primary btn-sm" style="margin-top:16px;">Lưu Tiêu Đề</button>
            <span id="saveTitleStatus" style="font-size:13px; color:var(--primary); margin-left:12px; opacity:0; transition:opacity 0.3s;">Đã lưu thành công!</span>
          </div>

          <!-- Sub-tabs -->
          <div class="glass-card" style="padding:4px; display:flex; gap:2px; overflow-x:auto;">
            ${[
              {k:'quiz',    label:'📝 Quiz (5 câu)'              },
              {k:'tug',     label:'⚔️ Kéo Co (8 câu)'           },
              {k:'sharing', label:'❤️ Chia Sẻ Thâm Niên'        },
              {k:'keywords',label:'🔑 Từ Khóa Văn Hóa'          },
              {k:'timer',   label:'⏱ Thời Gian Quiz'            },
            ].map(t => `
              <button class="admin-tab ${contentSection===t.k?'active':''}" data-csect="${t.k}"
                      style="font-size:13px; padding:9px 16px;">
                ${t.label}
              </button>
            `).join('')}
          </div>

          <!-- Content -->
          <div id="content-section-inner"></div>

        </div>
      `;

      // Wire sub-tabs
      el.querySelectorAll('[data-csect]').forEach(btn => {
        btn.addEventListener('click', () => {
          contentSection = btn.dataset.csect;
          sessionStorage.setItem('admin_content_section', contentSection);
          renderContentSections();
        });
      });

      // Save Titles logic
      el.querySelector('#btnSaveTitles').addEventListener('click', () => {
        const newTitles = {};
        el.querySelectorAll('.input-title-stage').forEach(input => {
          newTitles[input.dataset.stage] = input.value;
        });
        window.setGameState({ stageTitles: newTitles });
        const status = el.querySelector('#saveTitleStatus');
        status.style.opacity = '1';
        setTimeout(() => status.style.opacity = '0', 2000);
      });

      const inner = el.querySelector('#content-section-inner');

      if (contentSection === 'quiz')    renderQuizEditor(inner, window.getQuizQuestions());
      if (contentSection === 'tug')     renderTugEditor(inner, window.getTugStatements());
      if (contentSection === 'sharing') renderSharingEditor(inner, window.getSharingCards());
      if (contentSection === 'keywords')renderKeywordsEditor(inner, window.getKeywords());
      if (contentSection === 'timer')   renderTimerEditor(inner, window.getQuizTimerSecs());
    }

    renderContentSections();

    // ── Quiz editor ──────────────────────────────────────────────────────────
    function renderQuizEditor(inner, questions) {
      inner.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:16px;">
          
          <!-- Sticky Header bar for saving bulk -->
          <div class="editor-card" style="padding:14px 20px; display:flex; justify-content:space-between; align-items:center; background:rgba(16,185,129,0.05); border:1.5px solid rgba(16,185,129,0.15);">
            <div style="font-size:13px; font-weight:700; color:var(--text-primary);">
              Quản lý danh sách câu hỏi Quiz
            </div>
            <button class="btn btn-primary" onclick="saveAllQuizQuestions()" style="font-weight:800; font-size:13px; padding:10px 20px; box-shadow:0 4px 12px rgba(16,185,129,0.25);">
              <i data-lucide="save" style="width:15px;height:15px;vertical-align:middle;margin-right:4px;"></i> LƯU TẤT CẢ CÂU HỎI
            </button>
          </div>

          ${questions.map((q, qi) => `
            <div class="editor-card" id="qcard-${qi}" data-id="${q.id}">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                <span style="font-size:12px; font-weight:700; color:var(--primary); text-transform:uppercase; letter-spacing:0.08em;">
                  Câu ${qi + 1}
                </span>
                <div style="display:flex; gap:8px;">
                  <button class="btn btn-sm btn-danger" onclick="deleteQuizQuestion(${qi})" style="background:rgba(239,68,68,0.1); color:var(--danger); border:1px solid rgba(239,68,68,0.2);">
                    <i data-lucide="trash-2" style="width:13px;height:13px;"></i> Xóa
                  </button>
                </div>
              </div>
              <div style="margin-bottom:12px;">
                <label style="margin-bottom:6px; font-size:12px;">Nội dung câu hỏi (Dùng __________ để biểu thị chỗ trống)</label>
                <textarea class="editor-input" id="q-q-${qi}" rows="2">${q.question}</textarea>
              </div>
              <div style="margin-bottom:12px;">
                <label style="margin-bottom:6px; font-size:12px;">Đáp án đúng (Người chơi điền vào)</label>
                <input type="text" class="editor-input" id="q-ans-${qi}" value="${q.answer || ''}" style="padding:9px 12px;">
              </div>
            </div>
          `).join('')}

          <div style="display:flex; gap:12px; margin-top:16px; align-items:center;">
            <button class="btn btn-primary" onclick="saveAllQuizQuestions()" style="font-weight:800;">
              <i data-lucide="save" style="width:14px;height:14px;"></i> Lưu tất cả câu hỏi
            </button>
            <button class="btn btn-outline" onclick="addQuizQuestion()">
              <i data-lucide="plus" style="width:14px;height:14px;"></i> Thêm câu hỏi mới
            </button>
            <button class="btn btn-secondary" onclick="resetQuizToDefault()">
              <i data-lucide="rotate-ccw" style="width:14px;height:14px;"></i> Đặt lại câu hỏi mặc định
            </button>
          </div>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();

      function collectQuizQuestionsFromDOM() {
        const cards = inner.querySelectorAll('.editor-card[id^="qcard-"]');
        const list = [];
        cards.forEach((card) => {
          const qi = card.id.split('-')[1];
          const qEl = inner.querySelector(`#q-q-${qi}`);
          const ansEl = inner.querySelector(`#q-ans-${qi}`);
          if (qEl && ansEl) {
            const originalId = card.dataset.id;
            list.push({
              id: originalId ? parseInt(originalId, 10) : Date.now() + parseInt(qi, 10),
              question: qEl.value.trim(),
              answer: ansEl.value.trim()
            });
          }
        });
        return list;
      }

      window.saveAllQuizQuestions = function() {
        const list = collectQuizQuestionsFromDOM();
        localStorage.setItem('ctg_custom_quiz', JSON.stringify(list));
        window.quizQuestions = list;
        window.setGameState({ quizQuestionsVersion: Date.now() });
        showSaveToast('✅ Đã lưu tất cả câu hỏi Quiz thành công!');
        renderContentSections();
      };

      window.addQuizQuestion = function() {
        const list = collectQuizQuestionsFromDOM();
        list.push({
          id: Date.now(),
          question: "Giá trị cốt lõi thứ 6 của chúng ta là __________.",
          answer: "Tốc độ"
        });
        localStorage.setItem('ctg_custom_quiz', JSON.stringify(list));
        window.quizQuestions = list;
        window.setGameState({ quizQuestionsVersion: Date.now() });
        renderContentSections();
        showSaveToast('➕ Đã thêm câu hỏi mới vào danh sách!');
      };

      window.deleteQuizQuestion = function(qi) {
        if (confirm('Bạn có chắc muốn xóa câu hỏi này?')) {
          const list = collectQuizQuestionsFromDOM();
          list.splice(qi, 1);
          localStorage.setItem('ctg_custom_quiz', JSON.stringify(list));
          window.quizQuestions = list;
          window.setGameState({ quizQuestionsVersion: Date.now() });
          renderContentSections();
          showSaveToast('🗑️ Đã xóa câu hỏi khỏi danh sách tạm!');
        }
      };

      window.resetQuizToDefault = function() {
        if (confirm('Đặt lại về câu hỏi mặc định? Tất cả chỉnh sửa chưa lưu sẽ bị mất.')) {
          localStorage.removeItem('ctg_custom_quiz');
          window.quizQuestions = window.getQuizQuestions();
          window.setGameState({ quizQuestionsVersion: Date.now() });
          renderContentSections();
        }
      };
    }

    // ── Tug editor ────────────────────────────────────────────────────────────
    function renderTugEditor(inner, stmts) {
      const poolCount = stmts.length;
      const warningHtml = poolCount < 10
        ? `<div style="background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.25); border-radius:10px; padding:12px 16px; margin-bottom:16px; font-size:13px; color:var(--danger); display:flex; align-items:center; gap:8px;">
            <i data-lucide="alert-triangle" style="width:16px;height:16px;flex-shrink:0;"></i>
            <span>Pool hiện có <strong>${poolCount} câu</strong> (cần tối thiểu 10). Round 2 sẽ bị <strong>thiếu câu hoặc lặp câu Round 1</strong> nếu pool dưới 10!</span>
           </div>`
        : `<div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.2); border-radius:10px; padding:12px 16px; margin-bottom:16px; font-size:13px; color:var(--primary); display:flex; align-items:center; gap:8px;">
            <i data-lucide="check-circle" style="width:16px;height:16px;flex-shrink:0;"></i>
            Pool đủ <strong>${poolCount} câu</strong> ✔ Round 1 dùng câu 1–5, Round 2 dùng câu 6–10.
           </div>`;

      inner.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:16px;">
          ${warningHtml}

          <!-- Sticky Header bar for saving bulk -->
          <div class="editor-card" style="padding:14px 20px; display:flex; justify-content:space-between; align-items:center; background:rgba(16,185,129,0.05); border:1.5px solid rgba(16,185,129,0.15);">
            <div style="font-size:13px; font-weight:700; color:var(--text-primary);">
              Quản lý danh sách câu hỏi Kéo co
            </div>
            <button class="btn btn-primary" onclick="saveAllTugStatements()" style="font-weight:800; font-size:13px; padding:10px 20px; box-shadow:0 4px 12px rgba(16,185,129,0.25);">
              <i data-lucide="save" style="width:15px;height:15px;vertical-align:middle;margin-right:4px;"></i> LƯU TẤT CẢ CÂU KÉO CO
            </button>
          </div>

          <!-- Round 1 header -->
          <div style="display:flex; align-items:center; gap:8px; padding:10px 0; border-bottom:2px solid rgba(245,158,11,0.3);">
            <span style="font-size:14px; font-weight:800; color:#f59e0b;">🟡 Round 1</span>
            <span style="font-size:12px; color:var(--text-muted);">Câu 1 → 5</span>
          </div>

          ${stmts.slice(0, 5).map((s, i) => `
            <div class="editor-card" id="tcard-${i}" data-id="${s.id}">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                <div style="display:flex; align-items:center;">
                  <span style="font-size:12px; font-weight:700; color:#f59e0b; text-transform:uppercase; letter-spacing:0.08em;">
                    Câu ${i + 1}
                  </span>
                </div>
                <div style="display:flex; gap:8px;">
                  <button class="btn btn-sm btn-danger" onclick="deleteTugStatement(${i})" style="background:rgba(239,68,68,0.1); color:var(--danger); border:1px solid rgba(239,68,68,0.2);">
                    <i data-lucide="trash-2" style="width:13px;height:13px;"></i> Xóa
                  </button>
                </div>
              </div>
              <div style="margin-bottom:12px;">
                <label style="margin-bottom:6px; font-size:12px;">Nội dung câu hỏi</label>
                <textarea class="editor-input" id="tug-q-${i}" rows="2">${s.question}</textarea>
              </div>
              ${s.options.map((opt, oi) => `
                <div style="display:flex; align-items:flex-start; gap:10px; margin-bottom:10px;">
                  <input type="radio" name="tans-${i}" value="${oi}" ${s.answer===oi?'checked':''}
                         id="tr-${i}-${oi}" style="margin-top:11px; accent-color:var(--primary); cursor:pointer;">
                  <div style="flex:1;">
                    <label for="tr-${i}-${oi}" style="text-transform:none; font-size:11px; color:var(--text-muted); margin-bottom:4px; letter-spacing:0; cursor:pointer;">
                      ${oi===s.answer ? '✅ Đáp án đúng' : `Lựa chọn ${oi+1}`}
                    </label>
                    <input type="text" class="editor-input" id="tug-o-${i}-${oi}" value="${opt}" style="padding:9px 12px;">
                  </div>
                </div>
              `).join('')}
            </div>
          `).join('')}

          <!-- Round 2 header -->
          <div style="display:flex; align-items:center; gap:8px; padding:10px 0; border-bottom:2px solid rgba(139,92,246,0.3); margin-top:8px;">
            <span style="font-size:14px; font-weight:800; color:#8b5cf6;">🟣 Round 2</span>
            <span style="font-size:12px; color:var(--text-muted);">Câu 6 → 10</span>
          </div>

          ${stmts.slice(5).map((s, j) => { const i = j + 5; return `
            <div class="editor-card" id="tcard-${i}" data-id="${s.id}">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                <div style="display:flex; align-items:center;">
                  <span style="font-size:12px; font-weight:700; color:#8b5cf6; text-transform:uppercase; letter-spacing:0.08em;">
                    Câu ${i + 1}
                  </span>
                </div>
                <div style="display:flex; gap:8px;">
                  <button class="btn btn-sm btn-danger" onclick="deleteTugStatement(${i})" style="background:rgba(239,68,68,0.1); color:var(--danger); border:1px solid rgba(239,68,68,0.2);">
                    <i data-lucide="trash-2" style="width:13px;height:13px;"></i> Xóa
                  </button>
                </div>
              </div>
              <div style="margin-bottom:12px;">
                <label style="margin-bottom:6px; font-size:12px;">Nội dung câu hỏi</label>
                <textarea class="editor-input" id="tug-q-${i}" rows="2">${s.question}</textarea>
              </div>
              ${s.options.map((opt, oi) => `
                <div style="display:flex; align-items:flex-start; gap:10px; margin-bottom:10px;">
                  <input type="radio" name="tans-${i}" value="${oi}" ${s.answer===oi?'checked':''}
                         id="tr-${i}-${oi}" style="margin-top:11px; accent-color:var(--primary); cursor:pointer;">
                  <div style="flex:1;">
                    <label for="tr-${i}-${oi}" style="text-transform:none; font-size:11px; color:var(--text-muted); margin-bottom:4px; letter-spacing:0; cursor:pointer;">
                      ${oi===s.answer ? '✅ Đáp án đúng' : `Lựa chọn ${oi+1}`}
                    </label>
                    <input type="text" class="editor-input" id="tug-o-${i}-${oi}" value="${opt}" style="padding:9px 12px;">
                  </div>
                </div>
              `).join('')}
            </div>
          `; }).join('')}

          <div style="display:flex; gap:12px; margin-top:16px; align-items:center;">
            <button class="btn btn-primary" onclick="saveAllTugStatements()" style="font-weight:800;">
              <i data-lucide="save" style="width:14px;height:14px;"></i> Lưu tất cả câu kéo co
            </button>
            <button class="btn btn-outline" onclick="addTugStatement()">
              <i data-lucide="plus" style="width:14px;height:14px;"></i> Thêm câu kéo co
            </button>
            <button class="btn btn-secondary" onclick="resetTugToDefault()">
              <i data-lucide="rotate-ccw" style="width:14px;height:14px;"></i> Đặt lại mặc định
            </button>
          </div>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();

      inner.querySelectorAll('input[type="radio"]').forEach(r => {
        r.addEventListener('change', () => {
          const i = r.name.split('-')[1];
          inner.querySelectorAll(`[name="tans-${i}"]`).forEach(rb => {
            const oi = rb.value;
            const lbl = inner.querySelector(`label[for="tr-${i}-${oi}"]`);
            if (lbl) lbl.textContent = rb.checked ? '✅ Đáp án đúng' : `Lựa chọn ${parseInt(oi)+1}`;
          });
        });
      });

      function collectTugStatementsFromDOM() {
        const cards = inner.querySelectorAll('.editor-card[id^="tcard-"]');
        const list = [];
        cards.forEach((card) => {
          const i = card.id.split('-')[1];
          const qEl = inner.querySelector(`#tug-q-${i}`);
          if (qEl) {
            const checkedRadio = inner.querySelector(`[name="tans-${i}"]:checked`);
            const options = [0,1,2,3].map(oi => {
              const optEl = inner.querySelector(`#tug-o-${i}-${oi}`);
              return optEl ? optEl.value.trim() : '';
            });
            const answerVal = checkedRadio ? parseInt(checkedRadio.value, 10) : 0;
            const originalId = card.dataset.id;
            list.push({
              id: originalId ? parseInt(originalId, 10) : Date.now() + parseInt(i, 10),
              question: qEl.value.trim(),
              options: options,
              answer: answerVal
            });
          }
        });
        return list;
      }

      window.saveAllTugStatements = function() {
        const list = collectTugStatementsFromDOM();
        localStorage.setItem('ctg_custom_tug', JSON.stringify(list));
        window.tugStatements = list;
        window.setGameState({ tugQuestionsVersion: Date.now() });
        showSaveToast('✅ Đã lưu tất cả câu hỏi Kéo Co thành công!');
        renderContentSections();
      };

      window.addTugStatement = function() {
        const list = collectTugStatementsFromDOM();
        list.push({
          id: Date.now(),
          question: "Nội dung câu hỏi kéo co mới",
          options: ["Lựa chọn 1", "Lựa chọn 2", "Lựa chọn 3", "Lựa chọn 4"],
          answer: 0
        });
        localStorage.setItem('ctg_custom_tug', JSON.stringify(list));
        window.tugStatements = list;
        window.setGameState({ tugQuestionsVersion: Date.now() });
        renderContentSections();
        showSaveToast('➕ Đã thêm câu hỏi kéo co vào danh sách!');
      };

      window.deleteTugStatement = function(i) {
        if (confirm('Bạn có chắc muốn xóa câu này?')) {
          const list = collectTugStatementsFromDOM();
          list.splice(i, 1);
          localStorage.setItem('ctg_custom_tug', JSON.stringify(list));
          window.tugStatements = list;
          window.setGameState({ tugQuestionsVersion: Date.now() });
          renderContentSections();
          showSaveToast('🗑️ Đã xóa câu hỏi khỏi danh sách tạm!');
        }
      };

      window.resetTugToDefault = function() {
        if (confirm('Đặt lại về câu hỏi mặc định? Tất cả chỉnh sửa chưa lưu sẽ bị mất.')) {
          localStorage.removeItem('ctg_custom_tug');
          window.tugStatements = window.getTugStatements();
          window.setGameState({ tugQuestionsVersion: Date.now() });
          renderContentSections();
        }
      };
    }

    // ── Sharing editor ────────────────────────────────────────────────────────
    function renderSharingEditor(inner, cards) {
      const st = window.getGameState();
      const currentLayout = localStorage.getItem('ctg_sharing_layout') || '3col';

      const LAYOUTS = [
        { key: '1col', icon: 'align-justify', label: '1 Cột' },
        { key: '2col', icon: 'columns',       label: '2 Cột' },
        { key: '3col', icon: 'layout-grid',   label: '3 Cột' },
      ];

      inner.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:16px;">

          <!-- Cấu hình Tiêu đề & Mô tả -->
          <div class="editor-card" style="padding:20px;">
            <div style="font-size:13px; font-weight:700; color:var(--text-primary); margin-bottom:12px; display:flex; align-items:center; gap:6px;">
              <i data-lucide="heading" style="width:16px;height:16px;color:var(--primary);"></i>
              Tiêu Đề &amp; Mô Tả Giao Diện Chia Sẻ
            </div>
            <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:12px;">
              <div>
                <label style="font-size:12px; display:block; margin-bottom:4px;">Tiêu đề chính (Host &amp; Player)</label>
                <input type="text" class="editor-input" id="sc-main-title" value="${st.sharingTitle || 'LẮNG NGHE THẾ HỆ ĐI TRƯỚC'}" style="padding:9px 12px;">
              </div>
              <div>
                <label style="font-size:12px; display:block; margin-bottom:4px;">Mô tả / Hướng dẫn (Player)</label>
                <textarea class="editor-input" id="sc-main-sub" rows="2" style="padding:9px 12px;">${st.sharingSubtitle || ''}</textarea>
              </div>
            </div>
            <button class="btn btn-sm btn-primary" onclick="saveSharingHeaders()" style="padding:8px 16px; font-weight:700;">
              Lưu tiêu đề &amp; mô tả
            </button>
          </div>

          <!-- Bộ chọn bố cục -->
          <div class="editor-card" style="padding:20px;">
            <div style="font-size:13px; font-weight:700; color:var(--text-primary); margin-bottom:12px; display:flex; align-items:center; gap:6px;">
              <i data-lucide="layout-grid" style="width:16px;height:16px;color:var(--primary);"></i>
              Bố Cục Hiển Thị Bài Chia Sẻ
            </div>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
              ${LAYOUTS.map(l => `
                <button class="btn ${currentLayout === l.key ? 'btn-primary' : 'btn-outline'} btn-layout-select"
                  data-layout="${l.key}"
                  style="display:flex; align-items:center; gap:6px; padding:10px 20px; font-weight:700; font-size:13px;">
                  <i data-lucide="${l.icon}" style="width:16px;height:16px;"></i> ${l.label}
                </button>
              `).join('')}
            </div>
            <div style="margin-top:10px; font-size:12px; color:var(--text-muted);">
              Cài đặt này ảnh hưởng ngay đến giao diện người chơi ở Stage 3.
            </div>
          </div>

          <!-- Danh sách bài chia sẻ -->
          ${cards.map((c, i) => `
            <div class="editor-card" id="sc-${i}" style="${c.hidden ? 'opacity:0.5; border:1.5px dashed rgba(15,23,42,0.15);' : ''}">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <span style="font-size:12px; font-weight:700; color:${c.hidden ? 'var(--text-muted)' : 'var(--primary)'}; text-transform:uppercase;">
                    Bài chia sẻ ${i+1}
                  </span>
                  ${c.hidden ? `<span style="font-size:11px; background:rgba(100,116,139,0.12); color:var(--text-muted); border-radius:6px; padding:2px 8px; font-weight:600;">🙈 Đang ẩn</span>` : ''}
                </div>
                <div style="display:flex; gap:6px; flex-wrap:wrap; justify-content:flex-end;">
                  <button class="btn btn-sm" onclick="toggleHideSharingCard(${i})"
                    style="background:${c.hidden ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.08)'}; color:${c.hidden ? 'var(--primary)' : 'var(--text-muted)'}; border:1px solid ${c.hidden ? 'rgba(16,185,129,0.3)' : 'rgba(100,116,139,0.2)'}; font-weight:700; padding:5px 12px;">
                    ${c.hidden ? '👁 Hiện' : '🙈 Ẩn'}
                  </button>
                  <button class="btn btn-sm btn-primary" onclick="saveSharingCard(${i})">
                    <i data-lucide="save" style="width:13px;height:13px;"></i> Lưu
                  </button>
                  <button class="btn btn-sm btn-danger" onclick="deleteSharingCard(${i})" style="background:rgba(239,68,68,0.1); color:var(--danger); border:1px solid rgba(239,68,68,0.2);">
                    <i data-lucide="trash-2" style="width:13px;height:13px;"></i> Xóa
                  </button>
                </div>
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
                <div>
                  <label style="font-size:12px;">Tên người chia sẻ</label>
                  <input type="text" class="editor-input" id="sc-author-${i}" value="${c.author}" style="padding:9px 12px;">
                </div>
                <div>
                  <label style="font-size:12px;">Chức vụ &amp; số năm</label>
                  <input type="text" class="editor-input" id="sc-role-${i}" value="${c.role}" style="padding:9px 12px;">
                </div>
              </div>
              <div style="margin-bottom:12px;">
                <label style="font-size:12px;">Emoji đại diện (avatar)</label>
                <input type="text" class="editor-input" id="sc-avatar-${i}" value="${c.avatar || '👤'}" style="padding:9px 12px; width:80px; font-size:22px;">
              </div>
              <div style="margin-bottom:12px;">
                <label style="font-size:12px;">Link Hình Ảnh (URL - Không bắt buộc)</label>
                <input type="text" class="editor-input" id="sc-image-${i}" value="${c.image || ''}" placeholder="https://..." style="padding:9px 12px;">
              </div>
              <div>
                <label style="font-size:12px;">Nội dung câu chuyện</label>
                <textarea class="editor-input" id="sc-story-${i}" rows="4">${c.story}</textarea>
              </div>
            </div>
          `).join('')}

          <div style="display:flex; gap:12px; flex-wrap:wrap; margin-top:4px;">
            <button class="btn btn-primary" onclick="addSharingCard()" style="align-self:flex-start;">
              <i data-lucide="plus" style="width:14px;height:14px;"></i> Thêm bài chia sẻ mới
            </button>
            <button class="btn btn-secondary" onclick="resetSharingToDefault()" style="align-self:flex-start;">
              <i data-lucide="rotate-ccw" style="width:14px;height:14px;"></i> Đặt lại mặc định
            </button>
          </div>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();

      // Layout selector click events
      inner.querySelectorAll('.btn-layout-select').forEach(btn => {
        btn.addEventListener('click', () => {
          const layout = btn.dataset.layout;
          localStorage.setItem('ctg_sharing_layout', layout);
          renderContentSections();
          showSaveToast(`✅ Đã chọn bố cục ${layout === '1col' ? '1 cột' : layout === '2col' ? '2 cột' : '3 cột'}!`);
          window.setGameState({ sharingLayoutVersion: Date.now() });
        });
      });

      window.saveSharingHeaders = function() {
        const title = inner.querySelector('#sc-main-title').value.trim();
        const subtitle = inner.querySelector('#sc-main-sub').value.trim();
        window.setGameState({
          sharingTitle: title,
          sharingSubtitle: subtitle
        });
        showSaveToast('✅ Đã lưu tiêu đề & mô tả!');
      };

      window.saveSharingCard = function(i) {
        const cur = window.getSharingCards();
        cur[i] = {
          ...cur[i],
          author: inner.querySelector(`#sc-author-${i}`).value.trim(),
          role:   inner.querySelector(`#sc-role-${i}`).value.trim(),
          avatar: inner.querySelector(`#sc-avatar-${i}`).value.trim() || '👤',
          image:  inner.querySelector(`#sc-image-${i}`).value.trim(),
          story:  inner.querySelector(`#sc-story-${i}`).value.trim(),
        };
        localStorage.setItem('ctg_custom_sharing', JSON.stringify(cur));
        window.sharingCards = cur;
        window.setGameState({ sharingCardsVersion: Date.now() });
        showSaveToast('✅ Đã lưu bài chia sẻ!');
      };

      window.toggleHideSharingCard = function(i) {
        const cur = window.getSharingCards();
        cur[i].hidden = !cur[i].hidden;
        localStorage.setItem('ctg_custom_sharing', JSON.stringify(cur));
        window.sharingCards = cur;
        window.setGameState({ sharingCardsVersion: Date.now() });
        renderContentSections();
        showSaveToast(cur[i].hidden ? '🙈 Đã ẩn bài chia sẻ!' : '👁 Đã hiện bài chia sẻ!');
      };

      window.deleteSharingCard = function(i) {
        if (confirm(`Xóa bài chia sẻ ${i+1}? Hành động này không thể hoàn tác.`)) {
          const cur = window.getSharingCards();
          cur.splice(i, 1);
          localStorage.setItem('ctg_custom_sharing', JSON.stringify(cur));
          window.sharingCards = cur;
          window.setGameState({ sharingCardsVersion: Date.now() });
          renderContentSections();
          showSaveToast('🗑 Đã xóa bài chia sẻ!');
        }
      };

      window.addSharingCard = function() {
        const cur = window.getSharingCards();
        cur.push({
          id: Date.now(),
          hidden: false,
          author: "Tên người chia sẻ",
          role: "Chức vụ (X năm đồng hành)",
          avatar: "👤",
          image: "",
          gradient: "linear-gradient(135deg, #10b981, #059669)",
          story: "Nhập nội dung câu chuyện chia sẻ tại đây..."
        });
        localStorage.setItem('ctg_custom_sharing', JSON.stringify(cur));
        window.sharingCards = cur;
        window.setGameState({ sharingCardsVersion: Date.now() });
        renderContentSections();
        showSaveToast('✅ Đã thêm bài chia sẻ mới!');
      };

      window.resetSharingToDefault = function() {
        if (confirm('Đặt lại về nội dung mặc định? Tất cả chỉnh sửa sẽ bị mất.')) {
          localStorage.removeItem('ctg_custom_sharing');
          localStorage.removeItem('ctg_sharing_layout');
          window.sharingCards = window.getSharingCards();
          window.setGameState({ sharingCardsVersion: Date.now() });
          renderContentSections();
        }
      };
    }

    // ── Keywords editor ───────────────────────────────────────────────────────
    function renderKeywordsEditor(inner, kws) {
      inner.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
          ${kws.map((kw, i) => `
            <div class="editor-card">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <span style="font-size:12px; font-weight:700; color:var(--primary); text-transform:uppercase;">Từ khóa ${i+1}</span>
                <button class="btn btn-primary btn-sm" onclick="saveKeyword(${i})">Lưu</button>
              </div>
              <div style="margin-bottom:10px;">
                <label style="font-size:12px;">Từ khóa</label>
                <input type="text" class="editor-input" id="kw-w-${i}" value="${kw.word}" style="padding:9px 12px; text-transform:uppercase; font-weight:700;">
              </div>
              <div>
                <label style="font-size:12px;">Gợi ý cho người chơi</label>
                <textarea class="editor-input" id="kw-c-${i}" rows="2">${kw.clue}</textarea>
              </div>
            </div>
          `).join('')}
        </div>
        <button class="btn btn-secondary" onclick="resetKeywordsToDefault()" style="margin-top:16px;">
          <i data-lucide="rotate-ccw" style="width:14px;height:14px;"></i> Đặt lại mặc định
        </button>
      `;
      if (window.lucide) window.lucide.createIcons();

      window.saveKeyword = function(i) {
        const cur = window.getKeywords();
        cur[i] = {
          word: inner.querySelector(`#kw-w-${i}`).value.trim().toUpperCase(),
          clue: inner.querySelector(`#kw-c-${i}`).value.trim(),
        };
        localStorage.setItem('ctg_custom_keywords', JSON.stringify(cur));
        window.keywords = cur;
        showSaveToast('✅ Đã lưu từ khóa!');
      };

      window.resetKeywordsToDefault = function() {
        if (confirm('Đặt lại về từ khóa mặc định?')) {
          localStorage.removeItem('ctg_custom_keywords');
          window.keywords = window.getKeywords();
          renderContentSections();
        }
      };
    }

    // ── Timer editor ──────────────────────────────────────────────────────────
    function renderTimerEditor(inner, secs) {
      inner.innerHTML = `
        <div class="glass-card glass-card-emerald" style="padding:32px; max-width:500px;">
          <h3 style="font-size:18px; font-weight:700; color:var(--text-primary); margin-bottom:6px; display:flex; align-items:center; gap:10px;">
            <i data-lucide="timer" style="width:22px;height:22px;color:var(--primary);"></i>
            Thời gian trả lời Quiz
          </h3>
          <p style="font-size:14px; color:var(--text-secondary); margin-bottom:28px;">
            Mỗi câu hỏi Quiz người chơi có bao nhiêu giây để trả lời?
          </p>

          <div style="text-align:center; margin-bottom:24px;">
            <div id="timer-display" style="font-size:72px; font-weight:900; color:var(--primary); letter-spacing:-0.05em; line-height:1;">${secs}</div>
            <div style="font-size:16px; color:var(--text-secondary); margin-top:4px;">giây / câu hỏi</div>
          </div>

          <input type="range" id="timerRange" min="5" max="60" step="5" value="${secs}"
                 style="width:100%; accent-color:var(--primary); height:6px; cursor:pointer; margin-bottom:16px;">

          <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-muted); margin-bottom:24px;">
            <span>5s (nhanh)</span>
            <span>30s (vừa)</span>
            <span>60s (chậm)</span>
          </div>

          <button class="btn btn-primary" onclick="saveTimer()" style="width:100%;">
            <i data-lucide="save" style="width:16px;height:16px;"></i>
            Lưu cài đặt thời gian
          </button>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();

      inner.querySelector('#timerRange').addEventListener('input', function() {
        inner.querySelector('#timer-display').textContent = this.value;
      });

      window.saveTimer = function() {
        const v = inner.querySelector('#timerRange').value;
        localStorage.setItem('ctg_quiz_timer', v);
        showSaveToast(`✅ Đã lưu: ${v} giây / câu hỏi!`);
      };
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // TAB 3 – NGƯỜI CHƠI
  // ────────────────────────────────────────────────────────────────────────────
  function renderTabPlayers(el, players) {
    el.innerHTML = `
      <div class="glass-card" style="padding:28px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
          <h2 style="font-size:18px; font-weight:700; color:var(--text-primary); display:flex; align-items:center; gap:10px; margin:0;">
            <i data-lucide="users" style="width:20px;height:20px;color:var(--primary);"></i>
            Danh Sách Người Chơi (${players.length})
          </h2>
          <button class="btn btn-primary btn-sm" onclick="exportCSV()" id="btnExportCSV">
            <i data-lucide="download" style="width:14px;height:14px;"></i> Tải CSV
          </button>
        </div>

        ${players.length === 0 ? `
          <div style="text-align:center; padding:48px 20px; color:var(--text-muted);">
            <i data-lucide="users" style="width:48px;height:48px;opacity:0.3; margin-bottom:12px;"></i>
            <p style="font-size:15px;">Chưa có người chơi nào tham gia</p>
            <p style="font-size:13px; margin-top:4px;">Mở tab mới và đăng ký để bắt đầu</p>
          </div>
        ` : `
          <div style="overflow-x:auto; border-radius:12px; border:var(--border-soft); overflow:hidden;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tên người chơi</th>
                  <th>Phòng ban</th>
                  <th>Đội</th>
                  <th>Điểm Quiz</th>
                  <th>Từ khóa</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                ${players.map((p, i) => `
                  <tr>
                    <td style="color:var(--text-muted); font-size:12px;">${i+1}</td>
                    <td style="font-weight:600;">${p.name}</td>
                    <td style="color:var(--text-secondary);">${p.department}</td>
                    <td>
                      <span class="badge badge-${p.team==='Red'?'red':'blue'}">
                        ${p.team === 'Red' ? '🔴 Đỏ' : '🔵 Xanh'}
                      </span>
                    </td>
                    <td style="font-weight:700; color:var(--primary);">${p.score} / 50</td>
                    <td>
                      <span style="background:rgba(16,185,129,0.1); color:var(--primary-dark); border-radius:8px; padding:3px 10px; font-size:12px; font-weight:600;">
                        ${(p.keywordsGuessed||[]).length} / 6
                      </span>
                    </td>
                    <td>
                      <div style="display:flex; gap:6px;">
                        <button class="btn btn-secondary btn-sm" onclick="switchTeam('${p.id}')"
                                title="Đổi đội" style="padding:5px 10px;">
                          🔄
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="removePlayer('${p.id}')"
                                title="Xóa người chơi" style="padding:5px 10px;">
                          <i data-lucide="trash-2" style="width:12px;height:12px;"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();

    window.switchTeam = function(playerId) {
      window.setGameState(s => ({
        ...s,
        players: s.players.map(p =>
          p.id === playerId ? {...p, team: p.team === 'Red' ? 'Blue' : 'Red'} : p
        )
      }));
      render();
    };

    window.removePlayer = function(playerId) {
      if (confirm('Bạn có chắc chắn muốn xóa người chơi này?')) {
        window.setGameState(s => ({...s, players: s.players.filter(p => p.id !== playerId)}));
        render();
      }
    };

    window.exportCSV = function() {
      const st = window.getGameState();
      const rows = [
        ['#', 'Tên', 'Phòng ban', 'Đội', 'Điểm Quiz', 'Từ khóa hoàn thành'],
        ...st.players.map((p, i) => [
          i+1, p.name, p.department, p.team === 'Red' ? 'Đội Đỏ' : 'Đội Xanh',
          p.score, (p.keywordsGuessed||[]).length + '/6'
        ])
      ];
      const csv = rows.map(r => r.join(',')).join('\n');
      const blob = new Blob(['\uFEFF' + csv], {type:'text/csv;charset=utf-8;'});
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = 'ketqua_daotao_vanhoa.csv';
      a.click();
      URL.revokeObjectURL(url);
    };
  }

  // ────────────────────────────────────────────────────────────────────────────
  // TAB 4 – CÀI ĐẶT
  // ────────────────────────────────────────────────────────────────────────────
  function renderTabSettings(el) {
    el.innerHTML = `
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:24px; max-width:1000px;">

        <!-- Welcome Settings -->
        <div class="glass-card" style="padding:28px;">
          <h3 style="font-size:16px; font-weight:700; color:var(--text-primary); margin-bottom:16px; display:flex; align-items:center; gap:8px;">
            <i data-lucide="monitor" style="width:18px;height:18px;color:var(--primary);"></i>
            Kích thước màn hình chờ
          </h3>
          <div style="display:flex; flex-direction:column; gap:16px;">
            <div>
              <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                <label style="font-size:12px;">Kích cỡ chữ (px)</label>
                <span id="lblTextSize" style="font-size:12px; font-weight:700; color:var(--primary);">${st.welcomeSettings?.textSize || 120}</span>
              </div>
              <input type="range" id="rngTextSize" min="40" max="200" value="${st.welcomeSettings?.textSize || 120}" style="width:100%;">
            </div>
            <div>
              <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                <label style="font-size:12px;">Kích cỡ Mascot (px)</label>
                <span id="lblMascotSize" style="font-size:12px; font-weight:700; color:var(--primary);">${st.welcomeSettings?.mascotSize || 180}</span>
              </div>
              <input type="range" id="rngMascotSize" min="50" max="400" value="${st.welcomeSettings?.mascotSize || 180}" style="width:100%;">
            </div>
          </div>
        </div>

        <!-- Change PIN -->
        <div class="glass-card glass-card-emerald" style="padding:28px;">
          <h3 style="font-size:16px; font-weight:700; color:var(--text-primary); margin-bottom:6px; display:flex; align-items:center; gap:8px;">
            <i data-lucide="lock" style="width:18px;height:18px;color:var(--primary);"></i>
            Đổi Mã PIN Admin
          </h3>
          <p style="font-size:13px; color:var(--text-secondary); margin-bottom:22px; line-height:1.6;">
            Mặc định là <strong>admin123</strong>. Mã mới được lưu vào localStorage của trình duyệt này.
          </p>

          <div style="display:flex; flex-direction:column; gap:14px;">
            <div>
              <label style="font-size:12px;">PIN hiện tại</label>
              <input type="password" id="pinCurrent" class="editor-input" placeholder="Nhập PIN hiện tại...">
            </div>
            <div>
              <label style="font-size:12px;">PIN mới</label>
              <input type="password" id="pinNew" class="editor-input" placeholder="Nhập PIN mới (≥ 4 ký tự)...">
            </div>
            <div>
              <label style="font-size:12px;">Xác nhận PIN mới</label>
              <input type="password" id="pinConfirm" class="editor-input" placeholder="Nhập lại PIN mới...">
            </div>
            <p id="pinMsg" style="font-size:13px; font-weight:500; display:none;"></p>
            <button class="btn btn-primary" onclick="changePIN()">
              <i data-lucide="check" style="width:16px;height:16px;"></i>
              Cập nhật PIN
            </button>
          </div>
        </div>

        <!-- App info -->
        <div class="glass-card" style="padding:28px;">
          <h3 style="font-size:16px; font-weight:700; color:var(--text-primary); margin-bottom:16px; display:flex; align-items:center; gap:8px;">
            <i data-lucide="info" style="width:18px;height:18px;color:var(--primary);"></i>
            Thông tin ứng dụng
          </h3>
          <div style="display:flex; flex-direction:column; gap:10px;">
            ${[
              ['Phiên bản', 'v2.0 – Emerald Edition'],
              ['Đồng bộ',   'localStorage + Storage Event'],
              ['Công nghệ', 'Vanilla HTML/CSS/JS'],
              ['Quiz timer',window.getQuizTimerSecs() + ' giây / câu'],
              ['Custom Quiz', localStorage.getItem('ctg_custom_quiz') ? '✅ Đã tùy chỉnh' : '⬜ Mặc định'],
              ['Custom Kéo Co', localStorage.getItem('ctg_custom_tug') ? '✅ Đã tùy chỉnh' : '⬜ Mặc định'],
              ['Custom Từ khóa', localStorage.getItem('ctg_custom_keywords') ? '✅ Đã tùy chỉnh' : '⬜ Mặc định'],
            ].map(([k, v]) => `
              <div style="display:flex; justify-content:space-between; font-size:13px; padding:8px 0; border-bottom:1px solid rgba(15,23,42,0.05);">
                <span style="color:var(--text-secondary); font-weight:500;">${k}</span>
                <span style="color:var(--text-primary); font-weight:600;">${v}</span>
              </div>
            `).join('')}
          </div>

          <button class="btn btn-danger btn-sm" onclick="clearAllCustomData()" style="margin-top:20px; width:100%;">
            <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
            Xóa tất cả dữ liệu tùy chỉnh
          </button>
        </div>

      </div>
    `;
    if (window.lucide) window.lucide.createIcons();

    // Welcome Settings logic
    el.querySelector('#rngTextSize').addEventListener('input', (e) => {
      el.querySelector('#lblTextSize').textContent = e.target.value;
    });
    el.querySelector('#rngTextSize').addEventListener('change', (e) => {
      window.setGameState(s => ({
        ...s,
        welcomeSettings: { ...(s.welcomeSettings || {}), textSize: parseInt(e.target.value, 10) }
      }));
    });

    el.querySelector('#rngMascotSize').addEventListener('input', (e) => {
      el.querySelector('#lblMascotSize').textContent = e.target.value;
    });
    el.querySelector('#rngMascotSize').addEventListener('change', (e) => {
      window.setGameState(s => ({
        ...s,
        welcomeSettings: { ...(s.welcomeSettings || {}), mascotSize: parseInt(e.target.value, 10) }
      }));
    });

    window.changePIN = function() {
      const cur     = localStorage.getItem('ctg_admin_pin') || 'admin123';
      const current = el.querySelector('#pinCurrent').value;
      const nw      = el.querySelector('#pinNew').value.trim();
      const confirm = el.querySelector('#pinConfirm').value.trim();
      const msg     = el.querySelector('#pinMsg');

      msg.style.display = 'block';

      if (current !== cur) {
        msg.textContent = '❌ PIN hiện tại không đúng!';
        msg.style.color = 'var(--danger)';
        return;
      }
      if (nw.length < 4) {
        msg.textContent = '❌ PIN mới phải có ít nhất 4 ký tự!';
        msg.style.color = 'var(--danger)';
        return;
      }
      if (nw !== confirm) {
        msg.textContent = '❌ Xác nhận PIN không khớp!';
        msg.style.color = 'var(--danger)';
        return;
      }
      localStorage.setItem('ctg_admin_pin', nw);
      msg.textContent = '✅ Đổi PIN thành công!';
      msg.style.color = 'var(--primary-dark)';
      el.querySelector('#pinCurrent').value = '';
      el.querySelector('#pinNew').value = '';
      el.querySelector('#pinConfirm').value = '';
    };

    window.clearAllCustomData = function() {
      if (confirm('Xóa tất cả dữ liệu tùy chỉnh (câu hỏi, từ khóa, chia sẻ)?\nHành động này không thể hoàn tác!')) {
        ['ctg_custom_quiz','ctg_custom_tug','ctg_custom_sharing','ctg_custom_keywords','ctg_quiz_timer']
          .forEach(k => localStorage.removeItem(k));
        window.quizQuestions = window.getQuizQuestions();
        window.keywords      = window.getKeywords();
        showSaveToast('✅ Đã xóa tất cả dữ liệu tùy chỉnh!');
        render();
      }
    };
  }

  // ────────────────────────────────────────────────────────────────────────────
  // TOAST NOTIFICATION
  // ────────────────────────────────────────────────────────────────────────────
  function showSaveToast(msg) {
    const existing = document.querySelector('#admin-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'admin-toast';
    toast.style.cssText = `
      position:fixed; bottom:28px; left:50%; transform:translateX(-50%);
      background:var(--text-primary); color:#fff; padding:12px 24px;
      border-radius:12px; font-size:14px; font-weight:600; z-index:10000;
      box-shadow:var(--shadow-lg); animation:slideDown 0.3s var(--ease-spring);
      white-space:nowrap;
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2800);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // ADMIN LIVE SYNC & MOCK AI
  // ────────────────────────────────────────────────────────────────────────────
  let mockInterval = null;
  const unsub = window.subscribeToState(newState => {
    // Sync UI without full render
    const knot = container.querySelector('#admin-tug-knot');
    if (knot) knot.style.left = `${newState.tugOfWar.ropePosition}%`;
    
    const scRed = container.querySelector('#admin-tug-red');
    if (scRed) {
      const teamObj = (newState.teams || []).find(t => t.id === newState.tugOfWar.teamA);
      scRed.textContent = `${teamObj?.emoji || '🔴'} ${teamObj?.name || 'Team A'} — ${newState.tugOfWar.redScore} lực`;
    }
    
    const scBlue = container.querySelector('#admin-tug-blue');
    if (scBlue) {
      const teamObj = (newState.teams || []).find(t => t.id === newState.tugOfWar.teamB);
      scBlue.textContent = `${newState.tugOfWar.blueScore} lực — ${teamObj?.name || 'Team B'} ${teamObj?.emoji || '🔵'}`;
    }

    // Quản lý đếm ngược tự động chuyển câu hỏi Stage 2 (Kéo co)
    if (newState.tugOfWar.isActive && !newState.tugOfWar.winner && newState.tugOfWar.startTime) {
      if (!mockInterval) {
        mockInterval = setInterval(() => {
          const cur = window.getGameState();
          const nt = cur.tugOfWar;
          if (!nt.isActive || nt.winner || !nt.startTime) {
            clearInterval(mockInterval);
            mockInterval = null;
            return;
          }

          const elapsed = Math.floor((Date.now() - nt.startTime) / 1000);
          
          // Chỉ đếm những người chơi thuộc 2 đội đang thi đấu
          const activePlayers = cur.players ? cur.players.filter(p => p.team === nt.teamA || p.team === nt.teamB) : [];
          const totalPlayersCount = activePlayers.length;
          
          // Lấy số lượng câu trả lời đã gửi cho câu hỏi hiện tại qIndex
          const answeredCount = Object.keys(nt.answers || {}).filter(k => k.endsWith('_' + nt.currentQuestionIndex)).length;

          // Điều kiện chuyển câu hỏi: Hết 15 giây HOẶC tất cả người chơi thi đấu đã trả lời xong
          const isTimeUp = elapsed >= 15;
          const isEveryoneAnswered = totalPlayersCount > 0 && answeredCount >= totalPlayersCount;

          if (isTimeUp || isEveryoneAnswered) {
            const nextIdx = (nt.currentQuestionIndex || 0) + 1;

            if (nextIdx < 5) { // Mỗi round chỉ làm 5 câu
              // Còn câu hỏi tiếp theo -> Chuyển câu hỏi mới
              window.setGameState(s => ({
                ...s,
                tugOfWar: {
                  ...s.tugOfWar,
                  currentQuestionIndex: nextIdx,
                  startTime: Date.now()
                }
              }));
            } else {
              // Hết 5 câu -> Kết thúc trận đấu và chuyển qua trạng thái 'reviewing' để BTC review đáp án
              window.setGameState(s => {
                let winner = s.tugOfWar.winner;
                if (!winner) {
                  // Đội nào kéo dây lệch về phía mình nhiều hơn sẽ thắng
                  if (s.tugOfWar.ropePosition < 50) {
                    winner = s.tugOfWar.teamA;
                  } else if (s.tugOfWar.ropePosition > 50) {
                    winner = s.tugOfWar.teamB;
                  } else {
                    winner = s.tugOfWar.teamA; // Mặc định Đội Đỏ nếu hòa
                  }
                }
                return {
                  ...s,
                  tugOfWar: {
                    ...s.tugOfWar,
                    isActive: false,
                    status: 'reviewing',
                    reviewQuestionIndex: 0,
                    winner: winner
                  }
                };
              });
            }
          }
        }, 1000);
      }
    } else {
      if (mockInterval) { clearInterval(mockInterval); mockInterval = null; }
    }
  });

  // Trigger if already active
  const curSt = window.getGameState();
  if (curSt.tugOfWar.isActive && !curSt.tugOfWar.winner) {
    window.setGameState({...curSt}); 
  }

  // Register cleanup into cleanupFns to be called when Admin logs out or changes view
  cleanupFns.push(() => {
    if (mockInterval) clearInterval(mockInterval);
    unsub();
  });

  // ── Initial render ────────────────────────────────────────────────────────
  render();

  return function cleanup() {
    cleanupFns.forEach(fn => fn());
  };
};
