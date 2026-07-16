// Hàm chuẩn hóa tiếng Việt để so khớp tương đối câu trả lời điền vào chỗ trống
function normalizeString(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim()
    .replace(/\s+/g, " ");
}

window.renderQuizGame = function(container, state, { playerId, isHost }) {
  const TIMER_SECS = window.getQuizTimerSecs ? window.getQuizTimerSecs() : 15;
  const AUTO_NEXT_SECS = 7; // Thời gian hiện đáp án trước khi tự qua câu
  const allQs = window.getQuizQuestions ? window.getQuizQuestions() : window.quizQuestions;
  const quizState = state.quizState || { currentQuestionIndex: 0, isActive: false, showAnswer: false, startTime: 0 };
  const qIndex = quizState.currentQuestionIndex;
  const q = allQs[qIndex];

  let timerInterval1 = null; // đếm ngược trả lời
  let timerInterval2 = null; // đếm ngược qua câu

  // Hàm tính thời gian còn lại hiện đáp án
  function getAutoNextLeft() {
    if (!quizState.answerDisplayStartTime) return AUTO_NEXT_SECS;
    const elapsed = Math.floor((Date.now() - quizState.answerDisplayStartTime) / 1000);
    return Math.max(0, AUTO_NEXT_SECS - elapsed);
  }

  // ─── GIAO DIỆN HOST (MÁY CHIẾU) ──────────────────────────────────────────
  if (isHost) {
    if (!q) {
      container.innerHTML = `<div class="glass-card" style="padding: 30px; text-align: center;">Chưa có câu hỏi điền chỗ trống nào.</div>`;
      return;
    }

    const answersObj = quizState.answers || {};
    const playerAnswers = [];
    let correctCount = 0;
    let totalAnswers = 0;

    state.players.forEach(p => {
      const pAns = answersObj[p.id];
      if (pAns) {
        totalAnswers++;
        const isCorrect = normalizeString(pAns.option) === normalizeString(q.answer);
        if (isCorrect) correctCount++;
        playerAnswers.push({
          name: p.name,
          team: p.team,
          value: pAns.option,
          isCorrect: isCorrect
        });
      }
    });

    const autoNextLeft = getAutoNextLeft();

    container.innerHTML = `
      <div class="fade-in" style="max-width:960px; margin:40px auto; padding:40px;">
        <div style="text-align:center; margin-bottom:40px;">
          <div class="section-eyebrow" style="justify-content:center; margin-bottom:12px;">Điền Vào Chỗ Trống</div>
          <div style="display:flex; justify-content:center; align-items:center; gap:20px;">
            <h2 style="font-size:28px; font-weight:800; color:var(--text-primary); margin:0;">Câu hỏi ${qIndex + 1} / ${allQs.length}</h2>
            ${quizState.isActive && !quizState.showAnswer ? `
              <div id="host-timer" style="width:70px; height:70px; border-radius:50%; border:5px solid var(--primary); display:flex; align-items:center; justify-content:center; font-size:32px; font-weight:900; color:var(--primary); font-variant-numeric:tabular-nums; box-shadow:0 0 20px rgba(16,185,129,0.3);">
                ${TIMER_SECS}
              </div>
            ` : ''}
            ${quizState.isActive && !quizState.showAnswer ? `
              <div style="font-size:16px; font-weight:700; color:var(--text-secondary); background:var(--bg-card); padding:8px 16px; border-radius:100px;">
                Đã trả lời: <strong id="host-answered-count" style="color:var(--primary);">${totalAnswers}</strong>
              </div>
            ` : ''}
          </div>
        </div>

        <div class="glass-card" style="padding:48px; text-align:center; margin-bottom:30px;">
          <h1 style="font-size:36px; font-weight:900; color:var(--text-primary); line-height:1.4; letter-spacing:-0.02em;">
            ${q.question}
          </h1>
        </div>

        ${quizState.showAnswer ? `
          <div class="glass-card fade-in" style="padding:32px; border:2px solid var(--primary); margin-bottom:30px; text-align:center;">
            <div style="font-size:14px; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:8px; letter-spacing:0.05em;">Đáp án chính xác</div>
            <div style="font-size:40px; font-weight:900; color:var(--primary); text-transform:uppercase;">
              ${q.answer}
            </div>
            <div style="font-size:16px; color:var(--text-secondary); margin-top:12px; font-weight:600;">
              Tỷ lệ chính xác: <span style="color:var(--success); font-size:20px; font-weight:800;">${correctCount}/${totalAnswers}</span> người chơi
            </div>
            ${quizState.isActive && quizState.answerDisplayStartTime ? `
              <div style="margin-top:16px; display:inline-flex; align-items:center; gap:8px; background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.2); border-radius:12px; padding:10px 20px;">
                <i data-lucide="clock" style="width:14px;height:14px;color:var(--primary);"></i>
                <span style="font-size:13px; color:var(--text-muted); font-weight:700;">Tự động qua câu tiếp theo sau <span id="host-auto-next-secs" style="color:var(--primary); font-size:16px; font-weight:900;">${autoNextLeft}</span> giây</span>
              </div>
            ` : ''}
          </div>

          <!-- Danh sách câu trả lời của người chơi -->
          ${playerAnswers.length > 0 ? `
            <div class="glass-card fade-in" style="padding:28px;">
              <h3 style="font-size:16px; font-weight:800; color:var(--text-primary); margin-bottom:16px; display:flex; align-items:center; gap:8px;">
                <i data-lucide="message-square" style="width:18px;height:18px;color:var(--primary);"></i>
                Câu trả lời thực tế từ người chơi
              </h3>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; max-height:240px; overflow-y:auto; padding-right:8px;">
                ${playerAnswers.map(ans => {
                  const teamObj = state.teams ? state.teams.find(t => t.id === ans.team) : null;
                  const borderCol = teamObj ? teamObj.border : 'rgba(15,23,42,0.1)';
                  const bgCol = teamObj ? teamObj.colorLight : 'rgba(15,23,42,0.02)';
                  const teamColor = teamObj ? teamObj.color : 'var(--text-primary)';
                  return `
                    <div style="background:${bgCol}; border:1px solid ${borderCol}; border-radius:12px; padding:12px 16px; display:flex; justify-content:space-between; align-items:center; gap:10px;">
                      <div>
                        <div style="font-size:13px; font-weight:700; color:${teamColor};">${ans.name} ${teamObj ? `(${teamObj.emoji})` : ''}</div>
                        <div style="font-size:15px; font-weight:800; color:var(--text-primary); margin-top:2px;">"${ans.value}"</div>
                      </div>
                      <div style="font-size:18px;">
                        ${ans.isCorrect ? '🟢' : '🔴'}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          ` : ''}
        ` : `
          ${!quizState.isActive ? `
            <div style="margin-top:40px; text-align:center;" class="animate-pulse">
              <span style="background:rgba(15,23,42,0.8); color:#fff; padding:12px 24px; border-radius:100px; font-weight:600; font-size:16px;">
                Đang chờ Quản trị viên bắt đầu...
              </span>
            </div>
          ` : ''}
        `}
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Timer 1: Đếm ngược trả lời → tự hiện đáp án khi hết giờ
    if (quizState.isActive && !quizState.showAnswer && quizState.startTime) {
      const timerEl = container.querySelector('#host-timer');
      timerInterval1 = setInterval(() => {
        const elapsed = Math.floor((Date.now() - quizState.startTime) / 1000);
        const left = Math.max(0, TIMER_SECS - elapsed);
        if (timerEl) {
          timerEl.textContent = left;
          if (left <= 5) {
            timerEl.style.color = 'var(--danger)';
            timerEl.style.borderColor = 'var(--danger)';
            timerEl.style.boxShadow = '0 0 20px rgba(239,68,68,0.4)';
          }
        }
        if (left <= 0) {
          clearInterval(timerInterval1);
          // Guard để tránh gọi nhiều lần
          if (!window._quizAutoShowingAnswer) {
            window._quizAutoShowingAnswer = true;
            window.setGameState(s => ({
              ...s,
              quizState: {
                ...s.quizState,
                showAnswer: true,
                answerDisplayStartTime: Date.now()
              }
            }));
            setTimeout(() => { window._quizAutoShowingAnswer = false; }, 3000);
          }
        }
      }, 250);
    }

    // Timer 2: Đếm ngược hiện đáp án → tự qua câu tiếp theo
    if (quizState.isActive && quizState.showAnswer && quizState.answerDisplayStartTime) {
      const secsEl = container.querySelector('#host-auto-next-secs');
      timerInterval2 = setInterval(() => {
        const left = getAutoNextLeft();
        if (secsEl) secsEl.textContent = left;
        if (left <= 0) {
          clearInterval(timerInterval2);
          if (!window._quizAutoAdvancing) {
            window._quizAutoAdvancing = true;
            const nextIdx = qIndex + 1;
            if (nextIdx < allQs.length) {
              window.setGameState(s => ({
                ...s,
                quizState: {
                  currentQuestionIndex: nextIdx,
                  isActive: true,
                  showAnswer: false,
                  startTime: Date.now(),
                  answerDisplayStartTime: null,
                  answers: {}
                }
              }));
            } else {
              // Hết câu hỏi - dừng game
              window.setGameState(s => ({
                ...s,
                quizState: {
                  ...s.quizState,
                  isActive: false,
                  answerDisplayStartTime: null
                }
              }));
            }
            setTimeout(() => { window._quizAutoAdvancing = false; }, 3000);
          }
        }
      }, 250);
    }

    const unsubHost = window.subscribeToState(newState => {
      if (newState.stage !== 1) return;
      const qs = newState.quizState;
      if (!qs) return;
      const ansObj = qs.answers || {};
      let total = 0;
      (newState.players || []).forEach(p => {
        if (ansObj[p.id]) total++;
      });
      const ansCountEl = container.querySelector('#host-answered-count');
      if (ansCountEl) ansCountEl.textContent = total;
    });

    return () => {
      if (unsubHost) unsubHost();
      if (timerInterval1) clearInterval(timerInterval1);
      if (timerInterval2) clearInterval(timerInterval2);
    };
  }

  // ─── GIAO DIỆN NGƯỜI CHƠI ──────────────────────────────────────────────────
  const player = state.players.find(p => p.id === playerId);
  if (!player) return;

  const localAnswersKey = `quiz_answers_${playerId}`;
  let userAnswers = JSON.parse(sessionStorage.getItem(localAnswersKey) || '{}');
  
  const hasAnsweredCurrent = userAnswers.hasOwnProperty(qIndex);
  const myAnswer = hasAnsweredCurrent ? userAnswers[qIndex] : '';
  const autoNextLeft = getAutoNextLeft();

  container.innerHTML = `
    <div class="fade-in" style="max-width:500px; margin:20px auto; padding:20px;">
      
      <div style="text-align:center; margin-bottom:24px;">
        <div class="section-eyebrow" style="justify-content:center; margin-bottom:8px;">Điền Vào Chỗ Trống</div>
        <h3 style="font-size:20px; font-weight:800; color:var(--text-primary);">Câu ${qIndex + 1} / ${allQs.length}</h3>
      </div>

      ${!quizState.isActive && !quizState.showAnswer ? `
        <div class="glass-card fade-in" style="padding:40px 24px; text-align:center;">
          <div style="font-size:48px; margin-bottom:16px;">👀</div>
          <h2 style="font-size:20px; font-weight:800; color:var(--text-primary); margin-bottom:12px;">Hãy nhìn lên Màn hình chung!</h2>
          <p style="color:var(--text-secondary); font-size:15px; margin-bottom:24px;">Đọc kỹ câu hỏi trên màn hình máy chiếu và chuẩn bị câu trả lời của bạn.</p>
          <div class="animate-pulse" style="display:inline-flex; align-items:center; gap:8px; font-size:14px; font-weight:700; color:var(--primary);">
            <i data-lucide="loader" class="animate-spin" style="width:16px;height:16px;"></i> Chờ Admin bắt đầu...
          </div>
        </div>
      ` : ''}

      ${quizState.isActive || quizState.showAnswer ? `
        ${quizState.isActive && !quizState.showAnswer && !hasAnsweredCurrent ? `
          <div style="margin-bottom:20px; height:8px; background:rgba(15,23,42,0.06); border-radius:4px; overflow:hidden;">
            <div id="player-timer-bar" style="height:100%; width:100%; background:var(--primary); transition:width 0.2s linear;"></div>
          </div>

          <div id="player-quiz-card-wrapper">
            <div class="glass-card fade-in" style="padding:24px;">
              <div style="font-size:16px; font-weight:700; color:var(--text-primary); margin-bottom:16px; line-height:1.5;">
                ${q.question}
              </div>
              
              <div style="display:flex; flex-direction:column; gap:12px;">
                <input type="text" id="player-fill-input" class="form-input" 
                       style="font-size:18px; font-weight:800; text-align:center; padding:12px; border-radius:12px; border:2px solid rgba(15,23,42,0.15);" 
                       placeholder="Nhập câu trả lời của bạn..." autocomplete="off">
                
                <button id="btnSubmitFill" class="btn btn-primary" style="padding:12px; font-weight:800; font-size:16px; display:flex; align-items:center; justify-content:center; gap:8px;">
                  Gửi đáp án <i data-lucide="send" style="width:16px;height:16px;"></i>
                </button>
              </div>
            </div>
          </div>
        ` : ''}

        ${hasAnsweredCurrent && !quizState.showAnswer ? `
          <div id="player-quiz-card-wrapper">
            <div class="glass-card fade-in" style="padding:32px 24px; text-align:center;">
              <div style="font-size:40px; margin-bottom:12px;">📥</div>
              <h3 style="font-size:18px; font-weight:800; color:var(--text-primary); margin-bottom:8px;">Đã ghi nhận câu trả lời!</h3>
              <div style="display:inline-block; background:rgba(16,185,129,0.08); border:1.5px solid rgba(16,185,129,0.2); padding:10px 20px; border-radius:12px; margin-top:8px;">
                <span style="font-size:11px; text-transform:uppercase; font-weight:700; color:var(--text-muted); display:block;">Đáp án bạn đã gửi</span>
                <strong style="font-size:18px; color:var(--primary); text-transform:uppercase;">"${myAnswer}"</strong>
              </div>
              <p style="font-size:13px; color:var(--text-muted); margin-top:20px; font-style:italic;">Đang chờ kết quả...</p>
            </div>
          </div>
        ` : ''}

        ${quizState.showAnswer ? `
          <div class="glass-card fade-in" style="padding:32px 24px; text-align:center; border:2px solid ${normalizeString(myAnswer) === normalizeString(q.answer) ? 'var(--success)' : 'var(--danger)'};">
            ${normalizeString(myAnswer) === normalizeString(q.answer) ? `
              <div style="font-size:48px; margin-bottom:12px;">🎉</div>
              <h2 style="font-size:22px; font-weight:900; color:var(--success); margin-bottom:6px;">Chính xác!</h2>
              <div style="font-size:14px; font-weight:700; color:var(--primary); margin-bottom:16px;">+10 Điểm</div>
            ` : `
              <div style="font-size:48px; margin-bottom:12px;">😢</div>
              <h2 style="font-size:22px; font-weight:900; color:var(--danger); margin-bottom:6px;">Chưa chính xác!</h2>
              <div style="font-size:14px; color:var(--text-muted); margin-bottom:16px;">Câu trả lời của bạn: "${myAnswer || 'Không có'}"</div>
            `}
            
            <div style="background:rgba(15,23,42,0.03); border-radius:12px; padding:12px; display:inline-block; width:100%;">
              <span style="font-size:11px; text-transform:uppercase; font-weight:700; color:var(--text-muted); display:block;">Đáp án đúng</span>
              <strong style="font-size:22px; color:var(--primary); text-transform:uppercase;">"${q.answer}"</strong>
            </div>

            ${quizState.isActive && quizState.answerDisplayStartTime ? `
              <div style="margin-top:16px; display:inline-flex; align-items:center; gap:8px; background:rgba(15,23,42,0.04); border-radius:10px; padding:8px 16px;">
                <i data-lucide="clock" style="width:13px;height:13px;color:var(--text-muted);"></i>
                <span style="font-size:12px; color:var(--text-muted); font-weight:600;">Câu tiếp theo sau <span id="player-auto-next-secs" style="color:var(--primary); font-weight:900;">${autoNextLeft}</span> giây</span>
              </div>
            ` : ''}
          </div>
        ` : ''}
      ` : ''}

    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Timer 1: thanh đếm ngược trả lời cho Player
  if (quizState.isActive && !quizState.showAnswer && !hasAnsweredCurrent && quizState.startTime) {
    const bar = container.querySelector('#player-timer-bar');
    timerInterval1 = setInterval(() => {
      const elapsed = Math.floor((Date.now() - quizState.startTime) / 1000);
      const left = Math.max(0, TIMER_SECS - elapsed);
      if (bar) {
        bar.style.width = `${(left/TIMER_SECS)*100}%`;
        if (left <= 5) bar.style.background = 'var(--danger)';
      }
      if (left <= 0) {
        clearInterval(timerInterval1);
        timerInterval1 = null;
        if (!hasAnsweredCurrent) {
          userAnswers[qIndex] = "";
          sessionStorage.setItem(localAnswersKey, JSON.stringify(userAnswers));
          const timerBarEl = container.querySelector('#player-timer-bar');
          if (timerBarEl && timerBarEl.parentElement) timerBarEl.parentElement.style.display = 'none';
          const cardWrapper = container.querySelector('#player-quiz-card-wrapper');
          if (cardWrapper) {
            cardWrapper.innerHTML = `
              <div class="glass-card" style="padding:32px 24px; text-align:center;">
                <div style="font-size:40px; margin-bottom:12px;">⏰</div>
                <h3 style="font-size:18px; font-weight:800; color:var(--text-primary); margin-bottom:8px;">Hết thời gian trả lời!</h3>
                <p style="font-size:13px; color:var(--text-muted); margin-top:20px; font-style:italic;">Đang chờ kết quả...</p>
              </div>
            `;
          }
          window.setGameState(s => ({
            ...s,
            quizState: {
              ...s.quizState,
              answers: { ...(s.quizState?.answers || {}), [playerId]: { option: "", correct: false } }
            }
          }));
        }
      }
    }, 200);
  }

  // Timer 2: đếm ngược qua câu tiếp theo cho Player (chỉ hiển thị, không gọi setGameState)
  if (quizState.isActive && quizState.showAnswer && quizState.answerDisplayStartTime) {
    const secsEl = container.querySelector('#player-auto-next-secs');
    timerInterval2 = setInterval(() => {
      const left = getAutoNextLeft();
      if (secsEl) secsEl.textContent = left;
      if (left <= 0) clearInterval(timerInterval2);
    }, 250);
  }

  // Xử lý gửi đáp án
  if (!hasAnsweredCurrent && !quizState.showAnswer && quizState.isActive) {
    const inputEl = container.querySelector('#player-fill-input');
    const submitBtn = container.querySelector('#btnSubmitFill');

    if (inputEl && submitBtn) {
      inputEl.focus();

      const sendAnswer = () => {
        const textVal = inputEl.value.trim();
        if (!textVal) return;

        userAnswers[qIndex] = textVal;
        sessionStorage.setItem(localAnswersKey, JSON.stringify(userAnswers));

        const isCorrect = normalizeString(textVal) === normalizeString(q.answer);

        if (timerInterval1) {
          clearInterval(timerInterval1);
          timerInterval1 = null;
        }
        const timerBarEl = container.querySelector('#player-timer-bar');
        if (timerBarEl && timerBarEl.parentElement) timerBarEl.parentElement.style.display = 'none';

        const cardWrapper = container.querySelector('#player-quiz-card-wrapper');
        if (cardWrapper) {
          cardWrapper.innerHTML = `
            <div class="glass-card" style="padding:32px 24px; text-align:center;">
              <div style="font-size:40px; margin-bottom:12px;">📥</div>
              <h3 style="font-size:18px; font-weight:800; color:var(--text-primary); margin-bottom:8px;">Đã ghi nhận câu trả lời!</h3>
              <div style="display:inline-block; background:rgba(16,185,129,0.08); border:1.5px solid rgba(16,185,129,0.2); padding:10px 20px; border-radius:12px; margin-top:8px;">
                <span style="font-size:11px; text-transform:uppercase; font-weight:700; color:var(--text-muted); display:block;">Đáp án bạn đã gửi</span>
                <strong style="font-size:18px; color:var(--primary); text-transform:uppercase;">"${textVal}"</strong>
              </div>
              <p style="font-size:13px; color:var(--text-muted); margin-top:20px; font-style:italic;">Đang chờ kết quả...</p>
            </div>
          `;
        }

        window.setGameState(s => {
          let updatedPlayers = s.players;
          if (isCorrect) {
            updatedPlayers = s.players.map(p => p.id === playerId ? { ...p, score: (p.score||0) + 10 } : p);
          }
          return {
            ...s,
            players: updatedPlayers,
            quizState: {
              ...s.quizState,
              answers: { ...(s.quizState?.answers || {}), [playerId]: { option: textVal, correct: isCorrect } }
            }
          };
        });
      };

      submitBtn.addEventListener('click', sendAnswer);
      inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendAnswer();
      });
    }
  }

  return () => {
    if (timerInterval1) clearInterval(timerInterval1);
    if (timerInterval2) clearInterval(timerInterval2);
  };
};
