// Hàm tạo hiệu ứng trái tim bay lên cho người chơi
window.spawnFloatingHeart = function(e) {
  const heartsContainer = document.getElementById('hearts-container');
  if (!heartsContainer) return;

  let x = e.clientX || window.innerWidth / 2;
  let y = e.clientY || window.innerHeight - 100;

  const heart  = document.createElement('div');
  heart.className = 'floating-heart';
  heart.innerHTML = ['❤️','🧡','💚','💛','💖'][Math.floor(Math.random()*5)];

  const offsetX = (Math.random() - 0.5) * 40;
  const offsetY = (Math.random() - 0.5) * 20;
  heart.style.left = `${x + offsetX - 12}px`;
  heart.style.top  = `${y + offsetY - 12}px`;

  const moveX = (Math.random() - 0.5) * 180;
  heartsContainer.appendChild(heart);

  heart.animate([
    { transform: 'translate(0,0) scale(0.6) rotate(0deg)', opacity: 1 },
    { transform: `translate(${moveX}px,-350px) scale(1.5) rotate(${Math.random()*80-40}deg)`, opacity: 0 }
  ], {
    duration: 1400 + Math.random() * 600,
    easing: 'cubic-bezier(0.1,0.8,0.3,1)',
    fill: 'forwards'
  });

  setTimeout(() => heart.remove(), 2100);
};

// Hàm tạo hiệu ứng bùng nổ tim cho Host
window.spawnHostHeart = function() {
  const heartsContainer = document.getElementById('host-hearts-canvas');
  if (!heartsContainer) return;

  const heart = document.createElement('div');
  heart.className = 'floating-heart';
  heart.innerHTML = ['❤️','🧡','💚','💛','💖','💘','💝','💓'][Math.floor(Math.random()*8)];
  
  // Vị trí ngẫu nhiên ở mép dưới màn hình
  const startX = Math.random() * window.innerWidth;
  const startY = window.innerHeight;
  
  heart.style.left = `${startX}px`;
  heart.style.top  = `${startY}px`;
  heart.style.fontSize = `${24 + Math.random() * 40}px`; // Kích thước ngẫu nhiên
  heart.style.filter = `drop-shadow(0 0 8px rgba(255,255,255,0.8))`;
  heart.style.zIndex = Math.floor(Math.random() * 100);

  heartsContainer.appendChild(heart);

  const moveX = (Math.random() - 0.5) * 400; // Bay ngang qua lại
  const moveY = -(window.innerHeight + 200); // Bay thẳng lên trên khỏi màn hình
  
  heart.animate([
    { transform: `translate(0, 0) scale(0) rotate(${Math.random()*40-20}deg)`, opacity: 0 },
    { transform: `translate(${moveX * 0.2}px, ${moveY * 0.2}px) scale(1.2) rotate(${Math.random()*60-30}deg)`, opacity: 1, offset: 0.2 },
    { transform: `translate(${moveX * 0.8}px, ${moveY * 0.8}px) scale(1) rotate(${Math.random()*60-30}deg)`, opacity: 0.8, offset: 0.8 },
    { transform: `translate(${moveX}px, ${moveY}px) scale(1.5) rotate(${Math.random()*80-40}deg)`, opacity: 0 }
  ], {
    duration: 3000 + Math.random() * 3000,
    easing: 'ease-out',
    fill: 'forwards'
  });

  setTimeout(() => heart.remove(), 6500);
};

window.renderSeniorSharing = function(container, state, { playerId, isHost }) {
  const cards = window.getSharingCards ? window.getSharingCards() : window.sharingCards;
  
  // ─── GIAO DIỆN HOST (MÁY CHIẾU) ──────────────────────────────────────────
  if (isHost) {
    container.innerHTML = `
      <div id="host-hearts-canvas" style="position:fixed; top:0; left:0; width:100vw; height:100vh; pointer-events:none; z-index:9999; overflow:hidden;"></div>
      
      <div class="fade-in" style="height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; z-index:10;">
        <div class="glass-card" style="padding:60px 100px; text-align:center; background:rgba(255,255,255,0.85); box-shadow:0 24px 64px rgba(16,185,129,0.15);">
          <h1 style="font-size:54px; font-weight:900; color:var(--text-primary); letter-spacing:-0.03em; margin:0;">
            ${state.sharingTitle || "LẮNG NGHE THẾ HỆ ĐI TRƯỚC"}
          </h1>
          <span id="host-total-hearts" style="display:none;">0</span>
        </div>
      </div>
    `;

    let prevTotal = Object.values(state.sharingHearts || {}).reduce((a,b)=>a+b,0);
    const hostHeartsEl = container.querySelector('#host-total-hearts');
    if (hostHeartsEl) hostHeartsEl.textContent = prevTotal;

    const unsub = window.subscribeToState((newState) => {
      if (newState.stage !== 3) return;
      const newTotal = Object.values(newState.sharingHearts || {}).reduce((a,b)=>a+b,0);
      
      if (newTotal > prevTotal) {
        if (hostHeartsEl) {
          hostHeartsEl.textContent = newTotal;
          hostHeartsEl.style.animation = 'none';
          hostHeartsEl.offsetHeight; // reflow
          hostHeartsEl.style.animation = 'mascot-bounce-in 0.4s';
        }
        
        // Spawn hearts based on delta
        const delta = Math.min(newTotal - prevTotal, 30); // Cáp max 30 tim 1 lần để tránh lag
        for (let i = 0; i < delta; i++) {
          setTimeout(window.spawnHostHeart, i * 80);
        }
        prevTotal = newTotal;
      }
    });

    return function cleanup() {
      if (unsub) unsub();
    };
  }

  // ─── GIAO DIỆN NGƯỜI CHƠI ──────────────────────────────────────────────────
  // Lọc bỏ các bài đang ẩn
  const visibleCards = cards.filter(c => !c.hidden);

  // Đọc bố cục từ Admin
  const layoutKey = localStorage.getItem('ctg_sharing_layout') || '3col';
  const gridCss = layoutKey === '1col'
    ? 'display:flex; flex-direction:column; gap:24px;'
    : layoutKey === '2col'
      ? 'display:grid; grid-template-columns:1fr 1fr; gap:24px;'
      : 'display:grid; grid-template-columns:repeat(3,1fr); gap:24px;';

  const hearts = state.sharingHearts || { 1: 0, 2: 0, 3: 0 };
  container.innerHTML = `
    <div id="hearts-container" style="position:fixed; top:0; left:0; width:100vw; height:100vh; pointer-events:none; z-index:9999; overflow:hidden;"></div>
    
    <div class="fade-in" style="max-width:960px; margin:0 auto; position:relative; z-index:10;">
      <!-- Header -->
      <div class="glass-card glass-card-emerald" style="padding:28px 32px; text-align:center; margin-bottom:28px;">
        <div class="section-eyebrow" style="justify-content:center; margin-bottom:10px;">Cảm Hứng & Chia Sẻ</div>
        <h2 style="font-size:26px; font-weight:800; color:var(--text-primary); letter-spacing:-0.03em; margin-bottom:8px;">
          ${state.sharingTitle || "LẮNG NGHE THẾ HỆ ĐI TRƯỚC"}
        </h2>
        <p style="color:var(--text-secondary); font-size:15px; max-width:560px; margin:0 auto; line-height:1.6;">
          ${state.sharingSubtitle || ""}
        </p>
      </div>

      <!-- Cards grid -->
      <div style="${gridCss}">
        ${visibleCards.map(card => {
          const cardHearts = hearts[card.id] || 0;
          return `
            <div class="glass-card sharing-card" style="padding:28px; display:flex; flex-direction:column; position:relative; overflow:hidden;">
              <div style="position:absolute; top:-40px; right:-40px; width:140px; height:140px;
                          background:${card.gradient}; opacity:0.1; filter:blur(32px); border-radius:50%;
                          pointer-events:none;"></div>

              <div style="flex:1;">
                <!-- Author -->
                <div style="display:flex; align-items:center; gap:14px; margin-bottom:18px;">
                  <div style="font-size:28px; width:54px; height:54px; border-radius:16px;
                              background:${card.gradient}; display:flex; align-items:center;
                              justify-content:center; box-shadow:0 4px 12px rgba(0,0,0,0.12); flex-shrink:0;">
                    ${card.avatar}
                  </div>
                  <div>
                    <h3 style="font-size:16px; font-weight:700; color:var(--text-primary); margin-bottom:2px;">${card.author}</h3>
                    <p style="font-size:12px; color:var(--text-muted); font-weight:500;">${card.role}</p>
                  </div>
                </div>

                <!-- Story -->
                ${card.image ? `<div style="margin-bottom:16px; border-radius:12px; overflow:hidden; border:1px solid rgba(15,23,42,0.1);"><img src="${card.image}" style="width:100%; height:auto; display:block;"></div>` : ''}
                <p style="color:var(--text-secondary); font-size:14px; line-height:1.75; font-style:italic;
                           padding-left:16px; border-left:3px solid rgba(16,185,129,0.4); margin-bottom:20px;">
                  ${card.story}
                </p>
              </div>

              <!-- Heart footer -->
              <div style="display:flex; justify-content:space-between; align-items:center;
                          border-top:1px solid rgba(15,23,42,0.07); padding-top:14px; margin-top:auto;">
                <button class="btn btn-heart" data-id="${card.id}"
                  style="background:rgba(244,63,94,0.07); border:1.5px solid rgba(244,63,94,0.2);
                         color:#f43f5e; padding:9px 20px; border-radius:var(--radius-full);
                         font-size:13px; font-weight:600; cursor:pointer; font-family:var(--font);
                         display:flex; align-items:center; gap:6px; transition:var(--transition);">
                  ❤️ Thả tim
                </button>
                <div style="display:flex; align-items:center; gap:6px;">
                  <span id="heart-counter-${card.id}" class="heart-counter" style="font-size:24px; font-weight:800; color:var(--text-primary); letter-spacing:-0.02em; font-variant-numeric:tabular-nums;">${cardHearts}</span>
                  <span style="font-size:12px; color:var(--text-muted); font-weight:500;">tim</span>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Waiting note -->
      <div style="margin-top:36px; text-align:center;" class="animate-pulse">
        <div style="display:inline-flex; align-items:center; gap:8px; background:rgba(16,185,129,0.08);
                    border:1px solid rgba(16,185,129,0.2); border-radius:12px; padding:12px 24px;
                    font-size:14px; color:var(--primary); font-weight:600;">
          <i data-lucide="loader" class="animate-spin" style="width:16px;height:16px;"></i>
          Đang chờ Admin kích hoạt giai đoạn tiếp theo (Giải mã từ khóa)...
        </div>
      </div>
    </div>

    <style>
      .sharing-card { transition: var(--transition); }
      .sharing-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }
      .btn-heart:hover { background: rgba(244,63,94,0.15) !important; transform: scale(1.06); }
      .btn-heart:active { transform: scale(0.96) !important; }
    </style>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Heart button events
  container.querySelectorAll('.btn-heart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const cardId = parseInt(btn.getAttribute('data-id'), 10);
      window.spawnFloatingHeart(e); // Hiệu ứng tại nút cho Player
      window.setGameState(s => {
        const nextHearts = { ...s.sharingHearts };
        nextHearts[cardId] = (nextHearts[cardId] || 0) + 1;
        return { ...s, sharingHearts: nextHearts };
      });
    });
  });

  // Đồng bộ số lượng tim Live cho Player (không render lại toàn bộ component)
  const unsubPlayer = window.subscribeToState((newState) => {
    if (newState.stage !== 3) return;
    const newHearts = newState.sharingHearts || {};
    visibleCards.forEach(card => {
      const counterEl = container.querySelector(`#heart-counter-${card.id}`);
      if (counterEl && String(newHearts[card.id]) !== counterEl.textContent) {
        counterEl.textContent = newHearts[card.id] || 0;
        counterEl.style.animation = 'none';
        counterEl.offsetHeight;
        counterEl.style.animation = 'mascot-bounce-in 0.4s';
      }
    });
  });

  return function cleanup() {
    if (unsubPlayer) unsubPlayer();
  };
};
