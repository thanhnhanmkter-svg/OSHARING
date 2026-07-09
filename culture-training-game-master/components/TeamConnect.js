// Component cho Stage Team Connect: Phân chia đội ngũ
window.renderTeamConnect = function(container, state, { playerId, isHost }) {
  const teams = state.teams || [];

  // Khởi tạo layout tĩnh lần đầu tiên để tránh chớp giật màn hình
  if (isHost) {
    if (!container.querySelector('#team-connect-host-wrap')) {
      container.innerHTML = `
        <div id="team-connect-host-wrap" class="fade-in" style="min-height: 100vh; display: flex; flex-direction: column; padding: 40px; box-sizing: border-box; background: var(--bg-app);">
          
          <!-- Header -->
          <div class="glass-card" style="padding: 30px 40px; margin-bottom: 30px; display: flex; flex-direction: column; align-items: flex-start; gap: 16px; background: rgba(255,255,255,0.85);">
            <div>
              <h1 style="font-size: 38px; font-weight: 900; color: var(--text-primary); letter-spacing: -0.02em; margin: 0; line-height: 1;">
                TEAM CONNECT
              </h1>
            </div>
            
            <!-- Progress bar sitting below title -->
            <div style="width: 100%; max-width: 500px;">
              <div style="font-size: 13.5px; font-weight: 700; color: var(--text-secondary); margin-bottom: 8px;">
                Tiến độ xếp đội: <span id="tc-host-progress-text" style="color: var(--primary); font-size: 16px; font-weight: 800;">0/0</span>
              </div>
              <div style="width: 100%; height: 8px; background: rgba(15,23,42,0.06); border-radius: 100px; overflow: hidden;">
                <div id="tc-host-progress-bar" style="width: 0%; height: 100%; background: var(--primary); transition: width 0.4s ease-out;"></div>
              </div>
            </div>
          </div>

          <!-- Main Layout -->
          <div style="display: grid; grid-template-columns: 300px 1fr; gap: 30px; flex: 1; align-items: start;">
            
            <!-- Left Column: Unassigned Players -->
            <div class="glass-card" style="padding: 24px; max-height: calc(100vh - 200px); overflow-y: auto;">
              <h3 style="font-size: 16px; font-weight: 800; color: var(--text-primary); margin-top: 0; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #ef4444; animation: ping 1.2s infinite;"></span>
                Chưa Phân Đội (<span id="tc-host-unassigned-count">0</span>)
              </h3>
              <div id="tc-host-unassigned-list" style="display: flex; flex-direction: column; gap: 10px;"></div>
            </div>

            <!-- Right Column: Teams Grid -->
            <div id="tc-host-teams-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
              ${teams.map(t => `
                <div class="glass-card" style="padding: 24px; border-top: 5px solid ${t.color}; min-height: 250px; display: flex; flex-direction: column;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; border-bottom: 1px solid rgba(15,23,42,0.06); padding-bottom: 12px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <span style="font-size: 28px;">${t.emoji}</span>
                      <div>
                        <h4 style="font-size: 16px; font-weight: 800; color: var(--text-primary); margin: 0;">${t.name}</h4>
                        <span style="font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Thành viên: <span id="tc-host-team-count-${t.id}">0</span></span>
                      </div>
                    </div>
                  </div>

                  <!-- Members list container -->
                  <div id="tc-host-team-list-${t.id}" style="display: flex; flex-direction: column; gap: 8px; flex: 1; overflow-y: auto; max-height: 350px;"></div>
                </div>
              `).join('')}
            </div>

          </div>
        </div>
      `;
    }

    // Hàm cập nhật DOM mượt mà cho Host mà không vẽ lại toàn bộ
    const updateHostDOM = (st) => {
      const currentPlayers = st.players || [];
      const unassigned = currentPlayers.filter(p => !p.team);
      const assignedCount = currentPlayers.length - unassigned.length;
      const progressPercent = currentPlayers.length > 0 ? Math.round((assignedCount / currentPlayers.length) * 100) : 0;

      // Cập nhật tiến độ
      const progressText = container.querySelector('#tc-host-progress-text');
      const progressBar = container.querySelector('#tc-host-progress-bar');
      if (progressText) progressText.innerHTML = `<span style="color: var(--primary); font-size: 18px; font-weight: 800;">${assignedCount}/${currentPlayers.length}</span> (${progressPercent}%)`;
      if (progressBar) progressBar.style.width = `${progressPercent}%`;

      // Cập nhật Chưa phân đội
      const unassignedCount = container.querySelector('#tc-host-unassigned-count');
      if (unassignedCount) unassignedCount.textContent = unassigned.length;

      const unassignedList = container.querySelector('#tc-host-unassigned-list');
      if (unassignedList) {
        const newHtml = unassigned.length === 0
          ? `<div style="text-align: center; color: var(--text-muted); font-size: 13px; padding: 20px 0; border: 1.5px dashed rgba(15,23,42,0.08); border-radius: 12px;">Tất cả thành viên đã vào đội! 🎉</div>`
          : unassigned.map(p => `
              <div class="fade-in" style="background: rgba(15,23,42,0.02); border: 1px solid rgba(15,23,42,0.05); border-radius: 10px; padding: 12px 14px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <strong style="font-size: 14px; color: var(--text-primary); display: block;">${p.name}</strong>
                  <span style="font-size: 11px; color: var(--text-muted);">${p.department}</span>
                </div>
                <span style="font-size: 18px; opacity: 0.4;">⏳</span>
              </div>
            `).join('');
        if (unassignedList.innerHTML !== newHtml) {
          unassignedList.innerHTML = newHtml;
        }
      }

      // Cập nhật danh sách từng đội
      teams.forEach(t => {
        const tPlayers = currentPlayers.filter(p => p.team === t.id);
        
        const teamCount = container.querySelector(`#tc-host-team-count-${t.id}`);
        if (teamCount) teamCount.textContent = tPlayers.length;

        const teamList = container.querySelector(`#tc-host-team-list-${t.id}`);
        if (teamList) {
          const newHtml = tPlayers.length === 0
            ? `<div style="text-align: center; color: var(--text-muted); font-size: 13px; margin: auto 0; padding: 20px 0; border: 1.5px dashed rgba(15,23,42,0.06); border-radius: 12px;">Đang chờ xếp thành viên...</div>`
            : tPlayers.map(p => `
                <div class="fade-in" style="background: ${t.colorLight}; border: 1px solid ${t.border}; border-radius: 10px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <strong style="font-size: 13.5px; color: var(--text-primary); display: block;">${p.name}</strong>
                    <span style="font-size: 11px; color: var(--text-muted);">${p.department}</span>
                  </div>
                  <span style="font-size: 14px; font-weight: 800; color: ${t.color};">✓</span>
                </div>
              `).join('');
          if (teamList.innerHTML !== newHtml) {
            teamList.innerHTML = newHtml;
          }
        }
      });
    };

    // Chạy cập nhật lần đầu tiên
    updateHostDOM(state);

    // Lắng nghe thay đổi real-time mượt mà cho Host
    const unsubHost = window.subscribeToState((newState) => {
      if (!newState.teamConnectActive) return;
      updateHostDOM(newState);
    });

    return () => {
      if (unsubHost) unsubHost();
    };
  }

  // --- PLAYER VIEW ---
  // Định nghĩa hàm hiển thị giao diện cho Player theo trạng thái cụ thể
  let lastPlayerState = null; // 'waiting' | 'reveal' | 'revealed'
  
  const updatePlayerDOM = (st) => {
    const currentPlayers = st.players || [];
    const player = currentPlayers.find(p => p.id === playerId);
    if (!player) {
      container.innerHTML = `<div class="glass-card" style="padding: 30px; text-align: center;">Lỗi: Không tìm thấy thông tin người chơi.</div>`;
      return;
    }

    const teamObj = teams.find(t => t.id === player.team);
    const sessionRevealKey = `revealed_team_${playerId}`;
    const isAlreadyRevealed = sessionStorage.getItem(sessionRevealKey) === player.team && player.team;

    let targetState = 'waiting';
    if (player.team && teamObj) {
      targetState = isAlreadyRevealed ? 'revealed' : 'reveal';
    }

    // Nếu trạng thái cụ thể của người chơi này chưa hề đổi -> Bỏ qua, không re-render để tránh chớp
    if (lastPlayerState === targetState) {
      return;
    }
    lastPlayerState = targetState;

    if (targetState === 'waiting') {
      sessionStorage.removeItem(sessionRevealKey);
      container.innerHTML = `
        <div id="tc-player-waiting" class="glass-card fade-in" style="max-width: 480px; margin: 40px auto; padding: 48px 36px; text-align: center;">
          <div style="position: relative; width: 120px; height: 120px; margin: 0 auto 28px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; inset: 0; border-radius: 50%; border: 3px solid rgba(16,185,129,0.35); animation: ping 1.6s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="position: absolute; inset: 8px; border-radius: 50%; border: 2px solid rgba(16,185,129,0.2); animation: ping 1.6s cubic-bezier(0,0,0.2,1) infinite 0.4s;"></div>
            <img src="assets/mascot.png" alt="Ollie"
              style="width: 96px; height: 96px; object-fit: contain; position: relative; z-index: 1;
                     animation: mascot-float 3s ease-in-out infinite;
                     filter: drop-shadow(0 8px 16px rgba(16,185,129,0.25));">
          </div>
          <h2 style="font-size: 24px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.03em; margin-bottom: 8px;">
            Giai Đoạn Chia Đội
          </h2>
          <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 24px; line-height: 1.5;">
            Xin chào <strong>${player.name}</strong>, BTC đang tiến hành sắp xếp các đội thi đấu trên màn hình chính. Vui lòng chờ trong giây lát!
          </p>
          <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(15,23,42,0.04); border-radius: 12px; padding: 12px 20px; font-size: 13px; color: var(--text-muted); font-weight: 600;">
            <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--text-muted); animation: dot-flash 1.2s infinite;"></span>
            <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--text-muted); animation: dot-flash 1.2s infinite 0.2s;"></span>
            <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--text-muted); animation: dot-flash 1.2s infinite 0.4s;"></span>
            Đang chờ xếp đội...
          </div>
        </div>
        <style>
          @keyframes ping { 75%, 100% { transform: scale(1.8); opacity: 0; } }
          @keyframes dot-flash { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }
        </style>
      `;
    } else if (targetState === 'reveal') {
      container.innerHTML = `
        <div id="tc-player-reveal-box" class="glass-card fade-in" style="max-width: 480px; margin: 40px auto; padding: 48px 36px; text-align: center;">
          <div style="font-size: 56px; margin-bottom: 20px; animation: mascot-bounce 2s infinite;">✉️</div>
          <h2 style="font-size: 26px; font-weight: 900; color: var(--text-primary); letter-spacing: -0.03em; margin-bottom: 8px;">
            ĐÃ CÓ THƯ CHIA ĐỘI!
          </h2>
          <p style="font-size: 14.5px; color: var(--text-secondary); margin-bottom: 28px; line-height: 1.6;">
            BTC đã xếp bạn vào hàng ngũ chiến đấu. Hãy nhấn nút bên dưới để mở phong thư và khám phá đồng đội của mình!
          </p>
          <button id="btnRevealTeam" class="btn btn-primary" style="padding: 14px 28px; font-size: 16px; font-weight: 800; border-radius: 14px; width: 100%; box-shadow: 0 8px 20px rgba(16,185,129,0.3);">
            🔓 MỞ THƯ CHIA ĐỘI
          </button>
        </div>
      `;

      container.querySelector('#btnRevealTeam').addEventListener('click', () => {
        sessionStorage.setItem(sessionRevealKey, player.team);
        // Force refresh UI sang trạng thái 'revealed'
        lastPlayerState = null;
        updatePlayerDOM(window.getGameState());
        
        // Hiệu ứng pháo bông
        if (window.confetti) {
          window.confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 } });
        }
      });
    } else if (targetState === 'revealed') {
      container.innerHTML = `
        <div id="tc-player-revealed" class="glass-card fade-in" style="max-width: 480px; margin: 40px auto; padding: 48px 36px; text-align: center; border: 2.5px solid ${teamObj.color};">
          <div style="font-size: 72px; margin-bottom: 20px; animation: mascot-bounce-in 0.6s var(--ease-spring);">
            ${teamObj.emoji}
          </div>
          <div style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 6px;">
            Chào mừng chiến binh
          </div>
          <h3 style="font-size: 22px; font-weight: 800; color: var(--text-primary); margin: 0 0 20px;">
            ${player.name}
          </h3>
          <div style="background: ${teamObj.colorLight}; border: 1.5px solid ${teamObj.border}; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px;">Bạn thuộc đội</div>
            <div style="font-size: 24px; font-weight: 900; color: ${teamObj.color}; letter-spacing: -0.02em;">
              ${teamObj.name}
            </div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Phòng ban: ${player.department}</div>
          </div>
          <div style="background: rgba(15,23,42,0.03); border: 1px solid rgba(15,23,42,0.06); border-radius: 12px; padding: 14px 20px; font-size: 13.5px; color: var(--text-secondary); font-weight: 600;">
            🤝 Hãy kết nối, thảo luận cùng đồng đội mới của mình ngay bây giờ!
          </div>
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 14px;">
            Sẵn sàng khi Admin bắt đầu chặng tiếp theo...
          </div>
        </div>
      `;
    }
  };

  // Chạy lần đầu tiên cho Player
  updatePlayerDOM(state);

  // Lắng nghe thay đổi real-time cho Player
  const unsubPlayer = window.subscribeToState((newState) => {
    if (!newState.teamConnectActive) return;
    updatePlayerDOM(newState);
  });

  return () => {
    if (unsubPlayer) unsubPlayer();
  };
};
