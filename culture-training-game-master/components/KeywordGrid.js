// ─────────────────────────────────────────────────────────────────────────────
// WORD CLOUD (Thay thế cho Keyword Grid cũ)
// ─────────────────────────────────────────────────────────────────────────────

window.renderKeywordGrid = function(container, state, { playerId, isHost }) {
  const tState = state.wordCloud || { words: [] };

  // ─── MÀN HÌNH HOST (WORD CLOUD) ──────────────────────────────────────────────
  if (isHost) {
    container.innerHTML = `
      <div class="fade-in" style="height:100vh; position:relative; overflow:hidden; background:radial-gradient(circle at center, rgba(16,185,129,0.05) 0%, transparent 70%); display:flex; flex-direction:column; align-items:center;">
        
        <div style="text-align:center; margin-top:50px; z-index:10; pointer-events:none;">
          <div class="section-eyebrow" style="justify-content:center; margin-bottom:16px;">Stage 4 · Nhìn Lại Hành Trình</div>
          <h1 style="font-size:54px; font-weight:900; color:var(--text-primary); letter-spacing:-0.03em; margin-bottom:12px; text-transform:uppercase;">
            ${state.wordCloudTitle || "ĐÁM MÂY TỪ KHÓA"}
          </h1>
          <p style="color:var(--text-secondary); font-size:22px; max-width:800px; margin:0 auto; font-weight:500;">
            ${state.wordCloudSubtitle || "Người chơi hãy nhập những từ khóa bạn ấn tượng nhất trong ngày hôm nay!"}
          </p>
        </div>

        <div id="word-cloud-container" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none;">
          <!-- Các từ khóa sẽ bay lơ lửng ở đây -->
        </div>
      </div>
    `;

    const cloudContainer = container.querySelector('#word-cloud-container');
    let renderedWordsCount = 0;

    const renderWords = (words) => {
      // Chỉ render thêm những từ mới để không bị giật lag các từ cũ đang bay
      if (words.length > renderedWordsCount) {
        for (let i = renderedWordsCount; i < words.length; i++) {
          const w = words[i];
          const el = document.createElement('div');
          el.textContent = w.text;
          el.style.position = 'absolute';
          el.style.left = w.left + '%';
          el.style.top = w.top + '%';
          el.style.color = w.color;
          el.style.fontSize = w.size + 'px';
          el.style.fontWeight = '900';
          el.style.textTransform = 'uppercase';
          el.style.whiteSpace = 'nowrap';
          el.style.textShadow = '0 4px 12px rgba(0,0,0,0.1)';
          
          // CSS Floating Animation
          el.style.animation = `floatCloud ${w.duration}s ease-in-out infinite alternate`;
          el.style.animationDelay = w.delay + 's';
          
          cloudContainer.appendChild(el);
        }
        renderedWordsCount = words.length;
      } else if (words.length === 0) {
        // Xóa sạch (nếu Admin reset)
        cloudContainer.innerHTML = '';
        renderedWordsCount = 0;
      }
    };

    // Style animation
    if (!document.getElementById('cloud-animation')) {
      const style = document.createElement('style');
      style.id = 'cloud-animation';
      style.innerHTML = `
        @keyframes floatCloud {
          0% { transform: translateY(0) scale(1) rotate(-2deg); }
          50% { transform: translateY(-20px) scale(1.05) rotate(1deg); }
          100% { transform: translateY(10px) scale(0.95) rotate(3deg); }
        }
      `;
      document.head.appendChild(style);
    }

    renderWords(tState.words);

    const unsubHost = window.subscribeToState(newState => {
      if (newState.stage !== 4) return;
      const nt = newState.wordCloud || { words: [] };
      renderWords(nt.words);
    });

    return () => { if (unsubHost) unsubHost(); };
  }

  // ─── MÀN HÌNH PLAYER (NHẬP TỪ KHÓA) ──────────────────────────────────────────
  const player = state.players.find(p => p.id === playerId);
  if (!player) return;

  container.innerHTML = `
    <div class="fade-in" style="max-width:600px; margin:40px auto; display:flex; flex-direction:column; gap:30px;">
      
      <div class="glass-card" style="padding:40px 30px; text-align:center;">
        <span style="font-size:12px; font-weight:800; color:var(--primary); letter-spacing:0.1em; text-transform:uppercase;">
          Nhìn lại hành trình
        </span>
        <h2 style="font-size:28px; font-weight:900; color:var(--text-primary); margin-top:12px; margin-bottom:16px;">
          Bạn nhớ những keyword nào nhất qua buổi hôm nay?
        </h2>
        <p style="color:var(--text-secondary); font-size:15px; line-height:1.6; margin-bottom:30px;">
          Hãy nhập từ khóa và gửi lên màn hình chính. Bạn có thể gửi bao nhiêu từ tùy thích!
        </p>

        <div style="display:flex; flex-direction:column; gap:16px;">
          <input type="text" id="wcInput" placeholder="Ví dụ: ĐỘT PHÁ, BỀN BỈ..." autocomplete="off"
                 style="width:100%; padding:18px 24px; border-radius:16px; border:2px solid rgba(16,185,129,0.2); background:var(--bg-card); color:var(--text-primary); font-size:18px; outline:none; font-weight:700; text-align:center; transition:border-color 0.3s;">
          
          <button id="btnSubmitWC" class="btn btn-primary" style="padding:18px; font-size:18px; border-radius:16px; width:100%;">
            Gửi Từ Khóa Lên Mây <i data-lucide="cloud-upload" style="width:20px;height:20px;"></i>
          </button>
        </div>
        
        <div id="wcFeedback" style="display:none; font-size:15px; font-weight:700; color:var(--success); margin-top:20px; padding:12px; background:rgba(16,185,129,0.1); border-radius:12px;">
          Đã gửi thành công!
        </div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const wcInput = container.querySelector('#wcInput');
  const btnSubmitWC = container.querySelector('#btnSubmitWC');
  const wcFeedback = container.querySelector('#wcFeedback');

  function submitWord() {
    const text = wcInput.value.trim();
    if (!text) return;

    // Random styling
    const colors = ['#10b981', '#3b82f6', '#facc15', '#ef4444', '#f8fafc', '#94a3b8', '#0ea5e9', '#22c55e'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.floor(Math.random() * 40) + 30; // 30px to 70px
    const left = Math.floor(Math.random() * 80) + 10; // 10% to 90%
    const top = Math.floor(Math.random() * 60) + 20; // 20% to 80%
    const duration = (Math.random() * 4) + 3; // 3s to 7s
    const delay = Math.random() * 2; // 0s to 2s

    const newWordObj = {
      text: text.toUpperCase(),
      color,
      size,
      left,
      top,
      duration,
      delay
    };

    window.setGameState(s => ({
      ...s,
      wordCloud: {
        ...s.wordCloud,
        words: [...(s.wordCloud?.words || []), newWordObj]
      }
    }));

    wcInput.value = '';
    wcFeedback.style.display = 'block';
    setTimeout(() => { wcFeedback.style.display = 'none'; }, 2000);
    wcInput.focus();
  }

  btnSubmitWC.addEventListener('click', submitWord);
  wcInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submitWord();
  });
};
