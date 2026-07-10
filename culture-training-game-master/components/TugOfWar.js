// ─────────────────────────────────────────────────────────────────────────────
// TUG OF WAR – CSS & DOM Based (Sleek, Modern, Real-time, Round-based)
// ─────────────────────────────────────────────────────────────────────────────

window.renderTugOfWar = function(container, state, { playerId, isHost }) {
  const tugState = state.tugOfWar || {
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
  };

  // Helper lấy 5 câu hỏi của round hiện tại từ pool 10 câu
  const allStmts = window.getTugStatements ? window.getTugStatements() : [];
  const startIdx = tugState.round === 2 ? 5 : 0;
  const roundStmts = allStmts.slice(startIdx, startIdx + 5);

  const teamAObj = (state.teams || []).find(t => t.id === tugState.teamA) || { id: 'Red', name: 'Đội Đỏ', emoji: '🔴', color: '#ef4444' };
  const teamBObj = (state.teams || []).find(t => t.id === tugState.teamB) || { id: 'Blue', name: 'Đội Xanh', emoji: '🔵', color: '#0ea5e9' };

  let timerInterval = null;

  // ─── GIAO DIỆN HOST (MÁY CHIẾU) ──────────────────────────────────────────
  if (isHost) {
    const isPlaying = tugState.status === 'playing';
    const isReviewing = tugState.status === 'reviewing';
    
    // Câu hỏi đang hiển thị (phục vụ chơi hoặc review)
    const qIndex = isReviewing ? (tugState.reviewQuestionIndex || 0) : (tugState.currentQuestionIndex || 0);
    const q = roundStmts[qIndex];

    // Tính toán câu trả lời thực tế gửi lên cho câu hỏi qIndex hiện tại
    const answersObj = tugState.answers || {};
    const playerAnswers = [];
    let correctCount = 0;
    let totalAnswers = 0;
    const optionCounts = [0, 0, 0, 0];

    state.players.forEach(p => {
      // Chỉ tính những người thuộc 2 đội tham chiến
      if (p.team === tugState.teamA || p.team === tugState.teamB) {
        const key = p.id + "_" + qIndex;
        const pAns = answersObj[key];
        if (pAns) {
          totalAnswers++;
          if (pAns.option >= 0 && pAns.option <= 3) {
            optionCounts[pAns.option]++;
          }
          const isCorrect = pAns.correct;
          if (isCorrect) correctCount++;
          playerAnswers.push({
            name: p.name,
            team: p.team,
            value: pAns.option,
            isCorrect: isCorrect
          });
        }
      }
    });

    container.innerHTML = `
      <div class="fade-in" style="min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px; background:radial-gradient(circle at center, rgba(16,185,129,0.05) 0%, transparent 70%);">
        
        <!-- Header -->
        <div style="text-align:center; margin-bottom:20px;">
          <div class="section-eyebrow" style="justify-content:center; margin-bottom:12px;">Stage 2 · Kéo Co Đối Kháng · Round ${tugState.round}</div>
          <h1 style="font-size:46px; font-weight:900; color:var(--text-primary); letter-spacing:-0.03em; margin:0 0 10px; text-transform:uppercase;">
            ${teamAObj.emoji} ${teamAObj.name} <span style="color:var(--text-muted); font-size:28px; font-weight:500;">VS</span> ${teamBObj.name} ${teamBObj.emoji}
          </h1>
          <p style="color:var(--text-secondary); font-size:18px; max-width:800px; margin:0 auto; font-weight:500;">
            ${isPlaying ? 'Người chơi 2 đội hãy trả lời thật nhanh trên điện thoại để tạo lực kéo!' : 'Trận đấu đã kết thúc. Hãy xem lại đáp án các câu hỏi.'}
          </p>
        </div>

        <!-- BẢNG KÉO CO LIVE -->
        <div class="glass-card" style="width:100%; max-width:1000px; padding:50px 40px; position:relative; overflow:hidden; margin-bottom:30px;">
          <div style="position:absolute; top:0; left:0; bottom:0; width:50%; background:linear-gradient(90deg, rgba(239,68,68,0.03) 0%, transparent 100%); pointer-events:none;"></div>
          <div style="position:absolute; top:0; right:0; bottom:0; width:50%; background:linear-gradient(270deg, rgba(14,165,233,0.03) 0%, transparent 100%); pointer-events:none;"></div>

          <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:50px; position:relative; z-index:10;">
            <div style="text-align:left;">
              <div style="font-size:18px; font-weight:900; color:${teamAObj.color}; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:6px;">${teamAObj.emoji} ${teamAObj.name}</div>
              <div id="host-score-red" style="font-size:54px; font-weight:900; color:var(--text-primary); line-height:1; font-variant-numeric:tabular-nums;">${tugState.redScore}</div>
            </div>
            
            <div style="width:50px; height:50px; border-radius:50%; background:var(--bg-body); box-shadow:var(--shadow-sm); display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:900; color:var(--text-muted);">
              VS
            </div>

            <div style="text-align:right;">
              <div style="font-size:18px; font-weight:900; color:${teamBObj.color}; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:6px;">${teamBObj.name} ${teamBObj.emoji}</div>
              <div id="host-score-blue" style="font-size:54px; font-weight:900; color:var(--text-primary); line-height:1; font-variant-numeric:tabular-nums;">${tugState.blueScore}</div>
            </div>
          </div>

          <div id="host-tug-track" style="position:relative; height:12px; background:rgba(15,23,42,0.06); border-radius:100px;">
            <div style="position:absolute; left:50%; width:4px; height:40px; background:rgba(15,23,42,0.15); transform:translate(-50%,-14px); border-radius:2px;"></div>
            <div style="position:absolute; left:15%; width:3px; height:30px; background:rgba(239,68,68,0.4); transform:translate(-50%,-9px); border-radius:2px;"></div>
            <div style="position:absolute; right:15%; width:3px; height:30px; background:rgba(14,165,233,0.4); transform:translate(50%,-9px); border-radius:2px;"></div>
            
            <div id="host-tug-knot" style="position:absolute; top:50%; left:${tugState.ropePosition}%; width:44px; height:44px; border-radius:50%; background:#facc15; border:5px solid #fff; box-shadow:0 0 20px rgba(250,204,21,0.6); transform:translate(-50%,-50%); z-index:3; transition:left 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
              <div style="width:100%; height:100%; border-radius:50%; border:2px dashed rgba(0,0,0,0.1); animation:spin 4s linear infinite;"></div>
            </div>
          </div>

          <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:600; color:var(--text-muted); margin-top:30px;">
            <span style="color:${teamAObj.color};">← Lực kéo Đỏ</span>
            <span style="color:${teamBObj.color};">Lực kéo Xanh →</span>
          </div>
        </div>

        <!-- CÂU HỎI TRẬN ĐẤU -->
        ${q ? `
          <div style="width:100%; max-width:1000px;">
            <div class="glass-card" style="padding:32px; text-align:center; margin-bottom:20px; position:relative;">
              <div style="display:flex; justify-content:center; align-items:center; gap:20px; margin-bottom:12px;">
                <h2 style="font-size:18px; font-weight:800; color:var(--primary); margin:0;">
                  ${isReviewing ? 'BTC Review câu hỏi' : 'Câu hỏi'} ${qIndex + 1} / 5
                </h2>
                ${isPlaying && tugState.startTime ? `
                  <div id="host-tug-timer" style="width:44px; height:44px; border-radius:50%; border:3px solid var(--primary); display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:900; color:var(--primary); font-variant-numeric:tabular-nums; box-shadow:0 0 10px rgba(16,185,129,0.2);">
                    15
                  </div>
                ` : ''}
                ${isPlaying ? `
                  <div style="font-size:13px; font-weight:700; color:var(--text-secondary); background:rgba(15,23,42,0.04); padding:6px 12px; border-radius:100px;">
                    Đã trả lời: <strong style="color:var(--primary);">${totalAnswers}</strong>
                  </div>
                ` : ''}
              </div>
              <h1 style="font-size:26px; font-weight:800; color:var(--text-primary); line-height:1.4; margin:0;">
                ${q.question}
              </h1>
            </div>

            <!-- Tùy chọn Options: Chỉ tô màu đáp án đúng khi ở trạng thái Reviewing -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
              ${q.options.map((opt, idx) => {
                const alpha = ['A','B','C','D'][idx];
                const colors = ['#ef4444', '#3b82f6', '#eab308', '#10b981'];
                const color = colors[idx];
                
                let isCorrectHighlight = isReviewing && q.answer === idx;
                let opacity = isReviewing && !isCorrectHighlight ? 'opacity: 0.35;' : 'opacity: 1;';
                let extraStyle = isCorrectHighlight ? `box-shadow: 0 0 24px ${color}; transform: scale(1.01); border: 3px solid #fff; z-index:5;` : '';
                
                let statsHtml = '';
                if (isReviewing && totalAnswers > 0) {
                  const count = optionCounts[idx];
                  const pct = Math.round((count / totalAnswers) * 100);
                  statsHtml = `
                    <div style="margin-left:auto; display:flex; flex-direction:column; align-items:flex-end;">
                      <div style="font-size:20px; font-weight:900;">${count} <i data-lucide="user" style="width:14px;height:14px;display:inline;"></i></div>
                      <div style="font-size:11px; opacity:0.8;">${pct}%</div>
                    </div>
                  `;
                }

                return `
                  <div style="background:${color}; padding:18px 24px; border-radius:16px; color:#fff; display:flex; align-items:center; gap:16px; font-size:17px; font-weight:700; transition:all 0.4s var(--ease); ${opacity} ${extraStyle}">
                    <div style="width:36px; height:36px; border-radius:8px; background:rgba(255,255,255,0.2); display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:900; flex-shrink:0;">
                      ${alpha}
                    </div>
                    <div style="line-height:1.4; flex-grow:1;">${opt}</div>
                    ${statsHtml}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

        ${tugState.status === 'waiting' && !tugState.winner ? `
          <div class="animate-pulse" style="margin-top:40px; display:inline-flex; align-items:center; gap:10px; background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.2); padding:16px 32px; border-radius:100px; font-size:18px; color:var(--primary); font-weight:700;">
            <i data-lucide="clock" style="width:20px;height:20px;"></i> Đang chờ Quản trị viên bắt đầu trận đấu...
          </div>
        ` : ''}

        ${tugState.winner ? `
          <div class="fade-in" style="margin-top:40px; padding:20px 48px; border-radius:100px; background:var(--primary); color:#fff; font-size:26px; font-weight:900; box-shadow:0 12px 32px rgba(16,185,129,0.3); animation:mascot-bounce-in 0.6s var(--ease-spring);">
            🏆 ĐỘI CHỈNH PHỤC: ${(state.teams || []).find(t => t.id === tugState.winner)?.emoji || '👑'} ${(state.teams || []).find(t => t.id === tugState.winner)?.name.toUpperCase() || tugState.winner.toUpperCase()} CHIẾN THẮNG!
          </div>
        ` : ''}
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Đồng bộ đếm ngược Host Kéo co
    if (isPlaying && tugState.startTime) {
      const timerEl = container.querySelector('#host-tug-timer');
      timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - tugState.startTime) / 1000);
        const left = Math.max(0, 15 - elapsed);
        if (timerEl) {
          timerEl.textContent = left;
          if (left <= 5) {
            timerEl.style.color = 'var(--danger)';
            timerEl.style.borderColor = 'var(--danger)';
          }
        }
        if (left <= 0) clearInterval(timerInterval);
      }, 200);
    }

    // Lắng nghe cập nhật UI mượt mà cho Host
    const unsubHost = window.subscribeToState(newState => {
      if (newState.stage !== 2) return;
      const nt = newState.tugOfWar;
      const scoreR = container.querySelector('#host-score-red');
      const scoreB = container.querySelector('#host-score-blue');
      const knot = container.querySelector('#host-tug-knot');
      
      if (scoreR) scoreR.textContent = nt.redScore;
      if (scoreB) scoreB.textContent = nt.blueScore;
      if (knot) knot.style.left = `${nt.ropePosition}%`;
    });

    return () => {
      if (unsubHost) unsubHost();
      if (timerInterval) clearInterval(timerInterval);
    };
  }

  // ─── GIAO DIỆN NGƯỜI CHƠI ──────────────────────────────────────────────────
  const player = state.players.find(p => p.id === playerId);
  if (!player) return;

  let playerTimerInterval = null;

  // Lấy câu hỏi hiện tại hoặc đang review
  const isPlaying = tugState.status === 'playing';
  const isReviewing = tugState.status === 'reviewing';
  
  const currentStatementIdx = isReviewing ? (tugState.reviewQuestionIndex || 0) : (tugState.currentQuestionIndex || 0);
  const stmt = roundStmts[currentStatementIdx];

  // Kiểm tra xem người chơi này có thuộc 2 đội thi đấu trong Round hiện tại không
  const isParticipant = player.team === tugState.teamA || player.team === tugState.teamB;

  // Lịch sử trả lời phẳng trên sessionStorage
  const localAnswersKey = `tug_answers_${playerId}_round_${tugState.round}`;
  let userAnswers = JSON.parse(sessionStorage.getItem(localAnswersKey) || '{}');
  
  let hasAnsweredCurrent = userAnswers.hasOwnProperty(currentStatementIdx);
  const myAnswer = hasAnsweredCurrent ? userAnswers[currentStatementIdx] : null;

  // 1. Nếu không phải là người chơi của 2 đội tham chiến -> Chế độ Spectator
  if (tugState.status !== 'waiting' && !isParticipant) {
    container.innerHTML = `
      <div class="glass-card fade-in" style="max-width:500px; margin:40px auto; padding:44px 36px; text-align:center;">
        <div style="font-size:64px; margin-bottom:20px; animation:mascot-bounce-in 0.6s var(--ease-spring);">📣</div>
        <h2 style="font-size:24px; font-weight:800; color:var(--text-primary); margin-bottom:12px;">Chế độ Cổ Vũ</h2>
        <p style="color:var(--text-secondary); font-size:15px; line-height:1.6; margin-bottom:20px;">
          Round đấu này diễn ra giữa:<br>
          <strong style="color:${teamAObj.color};">${teamAObj.emoji} ${teamAObj.name}</strong> vs <strong style="color:${teamBObj.color};">${teamBObj.name} ${teamBObj.emoji}</strong>.
        </p>
        <p style="color:var(--text-muted); font-size:13px; font-style:italic;">
          Đội của bạn đang tạm nghỉ. Hãy quan sát màn hình máy chiếu và cổ vũ nhiệt tình cho đồng đội nhé!
        </p>
      </div>
    `;
    return;
  }

  // 2. Chờ trận đấu bắt đầu
  if (tugState.status === 'waiting') {
    const isRed = player.team === 'Red';
    const myTeamObj = (state.teams || []).find(t => t.id === player.team) || { name: player.team, emoji: '🔴' };
    
    container.innerHTML = `
      <div class="glass-card fade-in" style="max-width:500px; margin:40px auto; padding:44px 36px; text-align:center;">
        <div style="width:80px; height:80px; border-radius:24px; background:${isRed ? 'rgba(239,68,68,0.1)' : 'rgba(14,165,233,0.1)'}; display:flex; align-items:center; justify-content:center; margin:0 auto 24px; font-size:36px;">
          ${myTeamObj.emoji}
        </div>
        <h2 style="font-size:24px; font-weight:800; color:var(--text-primary); letter-spacing:-0.03em; margin-bottom:8px;">
          Đội ${myTeamObj.name}
        </h2>
        <p style="color:var(--text-secondary); margin-bottom:28px; font-size:15px; line-height:1.6;">
          Chuẩn bị tinh thần! Trò chơi Kéo Co Đối Kháng sắp bắt đầu.<br>
          Trận đấu sẽ được BTC bắt đầu trên màn hình chung.
        </p>
        <div class="animate-pulse" style="display:inline-flex; align-items:center; gap:8px; background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.2); border-radius:12px; padding:12px 24px; font-size:14px; color:var(--primary); font-weight:600;">
          <i data-lucide="clock" style="width:16px;height:16px;"></i>
          Đang chờ BTC kết cặp thi đấu...
        </div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  // 3. Trận đấu đang diễn ra (playing)
  if (isPlaying) {
    if (!stmt) return;

    container.innerHTML = `
      <div id="tug-wrap" class="fade-in" style="display:flex; flex-direction:column; gap:24px; max-width:860px; margin:0 auto;">
        
        <!-- Thanh thời gian countdown 15s -->
        ${!hasAnsweredCurrent && tugState.startTime ? `
          <div style="margin-bottom:-10px; height:8px; background:rgba(15,23,42,0.06); border-radius:4px; overflow:hidden; width:100%;">
            <div id="player-tug-timer-bar" style="height:100%; width:100%; background:var(--primary); transition:width 0.2s linear;"></div>
          </div>
        ` : ''}

        <!-- Bảng kéo co thu nhỏ cho người chơi -->
        <div class="glass-card" style="padding:24px; text-align:center;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <div style="text-align:left;">
              <div style="font-size:13px; font-weight:800; color:${teamAObj.color};">${teamAObj.emoji} ${teamAObj.name}</div>
              <div style="font-size:24px; font-weight:900; color:var(--text-primary); font-variant-numeric:tabular-nums;">${tugState.redScore}</div>
            </div>
            <div style="font-size:12px; font-weight:800; color:var(--text-muted);">VS</div>
            <div style="text-align:right;">
              <div style="font-size:13px; font-weight:800; color:${teamBObj.color};">${teamBObj.name} ${teamBObj.emoji}</div>
              <div style="font-size:24px; font-weight:900; color:var(--text-primary); font-variant-numeric:tabular-nums;">${tugState.blueScore}</div>
            </div>
          </div>
          <div style="position:relative; height:8px; background:rgba(15,23,42,0.06); border-radius:100px;">
            <div style="position:absolute; left:50%; width:3px; height:18px; background:rgba(15,23,42,0.15); transform:translate(-50%,-5px);"></div>
            <div id="player-tug-knot" style="position:absolute; top:50%; left:${tugState.ropePosition}%; width:20px; height:20px; border-radius:50%; background:#facc15; border:3px solid #fff; transform:translate(-50%,-50%); transition:left 0.4s ease;"></div>
          </div>
        </div>

        <div class="glass-card" style="padding:32px 24px; text-align:center;">
          <p style="font-size:18px; font-weight:800; color:var(--primary-dark); line-height:1.4; margin-bottom:20px;">
            "${stmt.question}"
          </p>

          <div id="player-tug-action-area">
            ${!hasAnsweredCurrent ? `
              <div style="display:grid; grid-template-columns:1fr; gap:12px; text-align:left;">
                ${stmt.options.map((opt, idx) => `
                  <button class="btn btn-outline tug-opt-btn" data-idx="${idx}" style="padding:14px 20px; border-color:rgba(15,23,42,0.1); color:var(--text-primary); font-size:15px; border-radius:14px; text-align:left; justify-content:flex-start; white-space:normal; height:auto; line-height:1.4;">
                    <strong style="font-size:18px; margin-right:8px; opacity:0.8;">${['A','B','C','D'][idx]}</strong> ${opt}
                  </button>
                `).join('')}
              </div>
            ` : `
              <!-- Khóa đáp án và không hiển thị đúng/sai, chỉ báo ghi nhận -->
              <div class="glass-card" style="padding:20px; background:rgba(16,185,129,0.05); border:1px dashed rgba(16,185,129,0.3); border-radius:16px;">
                <div style="font-size:32px; margin-bottom:8px;">📥</div>
                <h4 style="font-size:16px; font-weight:800; color:var(--primary-dark); margin-bottom:4px;">Đã gửi câu trả lời!</h4>
                <p style="font-size:13px; color:var(--text-secondary); margin:0;">
                  Lựa chọn của bạn: <strong>${['A','B','C','D'][myAnswer] || 'Không có'}</strong>
                </p>
                <p style="font-size:12px; color:var(--text-muted); margin-top:12px; font-style:italic;">
                  Hãy chờ tất cả người chơi hoàn thành lượt để tự qua câu tiếp theo...
                </p>
              </div>
            `}
          </div>
        </div>
      </div>
    `;

    // Khởi chạy timer interval cho người chơi nếu chưa trả lời
    if (playerTimerInterval) {
      clearInterval(playerTimerInterval);
      playerTimerInterval = null;
    }

    if (!hasAnsweredCurrent && tugState.startTime) {
      const bar = container.querySelector('#player-tug-timer-bar');
      playerTimerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - tugState.startTime) / 1000);
        const left = Math.max(0, 15 - elapsed);
        if (bar) {
          bar.style.width = `${(left/15)*100}%`;
          if (left <= 5) bar.style.background = 'var(--danger)';
        }
        if (left <= 0) {
          clearInterval(playerTimerInterval);
          if (!hasAnsweredCurrent) {
            submitTugAnswer(-1); // Hết giờ tự submit -1
          }
        }
      }, 200);
    }

    // Gắn sự kiện click trả lời
    container.querySelectorAll('.tug-opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        submitTugAnswer(idx);
      });
    });
  }

  // 4. Trận đấu kết thúc & Review kết quả
  if (isReviewing) {
    if (!stmt) return;
    
    const isCorrectPick = myAnswer === stmt.answer;

    container.innerHTML = `
      <div class="fade-in" style="max-width:500px; margin:20px auto; padding:20px;">
        <div style="text-align:center; margin-bottom:20px;">
          <h3 style="font-size:18px; font-weight:800; color:var(--text-primary);">Đang Xem Lại Câu ${currentStatementIdx + 1} / 5</h3>
          <p style="font-size:13px; color:var(--text-muted); margin:4px 0 0;">BTC đang giải đáp thắc mắc câu hỏi này</p>
        </div>

        <div class="glass-card" style="padding:28px 24px; text-align:center; margin-bottom:20px;">
          <p style="font-size:16px; font-weight:700; color:var(--text-secondary); line-height:1.5; margin-bottom:20px;">
            "${stmt.question}"
          </p>

          <div style="background:rgba(15,23,42,0.03); border-radius:12px; padding:12px; display:inline-block; width:100%; box-sizing:border-box;">
            <span style="font-size:11px; text-transform:uppercase; font-weight:700; color:var(--text-muted); display:block; margin-bottom:4px;">Đáp án chính xác</span>
            <strong style="font-size:18px; color:var(--primary);">${['A','B','C','D'][stmt.answer]}. ${stmt.options[stmt.answer]}</strong>
          </div>
        </div>

        <!-- Kết quả cá nhân của bạn -->
        <div class="glass-card" style="padding:24px; border:2px solid ${isCorrectPick ? 'var(--success)' : 'var(--danger)'}; text-align:center;">
          ${isCorrectPick ? `
            <div style="font-size:36px; margin-bottom:8px;">🎉</div>
            <h4 style="font-size:18px; font-weight:800; color:var(--success); margin:0 0 4px;">Bạn đã chọn đúng!</h4>
            <div style="font-size:13px; color:var(--text-muted);">Góp phần cộng lực kéo cho đội của mình.</div>
          ` : `
            <div style="font-size:36px; margin-bottom:8px;">😢</div>
            <h4 style="font-size:18px; font-weight:800; color:var(--danger); margin:0 0 4px;">Chưa chính xác!</h4>
            <div style="font-size:13px; color:var(--text-muted);">
              Lựa chọn của bạn: <strong>${['A','B','C','D'][myAnswer] || 'Không trả lời'}</strong>
            </div>
          `}
        </div>
      </div>
    `;
  }

  // Hàm xử lý gửi câu trả lời
  function submitTugAnswer(choice) {
    if (hasAnsweredCurrent) return;
    hasAnsweredCurrent = true;

    if (playerTimerInterval) {
      clearInterval(playerTimerInterval);
      playerTimerInterval = null;
    }
    const timerBarEl = container.querySelector('#player-tug-timer-bar');
    if (timerBarEl && timerBarEl.parentElement) timerBarEl.parentElement.style.display = 'none';

    const actionArea = container.querySelector('#player-tug-action-area');
    if (actionArea) {
      actionArea.innerHTML = `
        <div class="glass-card" style="padding:20px; background:rgba(16,185,129,0.05); border:1px dashed rgba(16,185,129,0.3); border-radius:16px;">
          <div style="font-size:32px; margin-bottom:8px;">📥</div>
          <h4 style="font-size:16px; font-weight:800; color:var(--primary-dark); margin-bottom:4px;">Đã gửi câu trả lời!</h4>
          <p style="font-size:13px; color:var(--text-secondary); margin:0;">
            Lựa chọn của bạn: <strong>${['A','B','C','D'][choice] || 'Không có'}</strong>
          </p>
          <p style="font-size:12px; color:var(--text-muted); margin-top:12px; font-style:italic;">
            Hãy chờ tất cả người chơi hoàn thành lượt để tự qua câu tiếp theo...
          </p>
        </div>
      `;
    }

    userAnswers[currentStatementIdx] = choice;
    sessionStorage.setItem(localAnswersKey, JSON.stringify(userAnswers));

    const correct = choice === stmt.answer;

    // Lưu vào global state dạng phẳng
    const answerKey = playerId + "_" + currentStatementIdx;

    window.setGameState(s => {
      let pos = s.tugOfWar.ropePosition;
      let redScore = s.tugOfWar.redScore;
      let blueSc = s.tugOfWar.blueScore;
      let winner = s.tugOfWar.winner;
      let isActive = s.tugOfWar.isActive;

      // Cộng điểm kéo co dựa trên câu trả lời đúng
      if (correct) {
        if (player.team === s.tugOfWar.teamA) {
          pos -= 5; // Kéo lệch về Trái (Team A)
          redScore += 5;
        } else if (player.team === s.tugOfWar.teamB) {
          pos += 5; // Kéo lệch về Phải (Team B)
          blueSc += 5;
        }
        
        pos = Math.max(0, Math.min(100, pos));
        
        // Vạch thắng tuyệt đối chạm ngưỡng 15% hoặc 85%
        if (pos <= 15) {
          winner = s.tugOfWar.teamA;
          isActive = false;
        } else if (pos >= 85) {
          winner = s.tugOfWar.teamB;
          isActive = false;
        }
      }

      return {
        ...s,
        tugOfWar: {
          ...s.tugOfWar,
          ropePosition: pos,
          redScore,
          blueScore: blueSc,
          winner,
          isActive,
          answers: {
            ...(s.tugOfWar.answers || {}),
            [answerKey]: { option: choice, correct: correct }
          }
        }
      };
    });
  }

  // ── Sync UI with state ────────────────────────────────────────────────────
  const unsub = window.subscribeToState((newState) => {
    if (newState.stage !== 2) return;
    const nt = newState.tugOfWar;

    // Nếu trạng thái game thay đổi lớn → để app.js xử lý re-render toàn bộ
    // KHÔNG gọi lại renderTugOfWar ở đây để tránh vòng lặp vô hạn

    // Chỉ cập nhật DOM nhỏ: điểm số và vị trí dây kéo
    const sR = container.querySelector('#score-red');
    const sB = container.querySelector('#score-blue');
    const knot = container.querySelector('#player-tug-knot');
    if (sR) sR.textContent = nt.redScore;
    if (sB) sB.textContent = nt.blueScore;
    if (knot) knot.style.left = `${nt.ropePosition}%`;
  });

  return () => {
    if (unsub) unsub();
    if (playerTimerInterval) clearInterval(playerTimerInterval);
  };
};
