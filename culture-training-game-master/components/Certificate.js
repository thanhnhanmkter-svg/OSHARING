window.renderCertificate = function(container, state, { playerId, onRestart }) {
  const player = state.players.find(p => p.id === playerId);
  if (!player) {
    container.innerHTML = `<div class="glass-card" style="padding: 30px; text-align: center;">Lỗi: Không tìm thấy người chơi.</div>`;
    return;
  }

  container.innerHTML = `
    <div class="fade-in" style="min-height: 70vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box; position: relative; text-align: center;">

      <!-- Mascot head with floating effects above it (Y hệt màn hình Host) -->
      <div style="position: relative; width: 140px; height: 140px; margin-bottom: 24px; display: inline-block;">
        
        <!-- Sparkles and effects wrapper above the head -->
        <div style="position: absolute; top: -50px; left: 0; right: 0; height: 50px; display: flex; justify-content: center; pointer-events: none;">
          <!-- Sparkle 1 -->
          <span style="position: absolute; font-size: 22px; animation: float-sparkle 2.2s infinite ease-in-out;">✨</span>
          <!-- Sparkle 2 -->
          <span style="position: absolute; font-size: 16px; animation: float-sparkle 1.8s infinite ease-in-out 0.4s; left: 25px;">⭐</span>
          <!-- Sparkle 3 -->
          <span style="position: absolute; font-size: 18px; animation: float-sparkle 2s infinite ease-in-out 0.8s; right: 25px;">🎉</span>
          <!-- Sparkle 4 -->
          <span style="position: absolute; font-size: 24px; animation: float-sparkle 2.5s infinite ease-in-out 0.2s; top: -10px;">✨</span>
        </div>

        <!-- Glowing background behind mascot -->
        <div style="position: absolute; inset: 10px; background: rgba(16,185,129,0.2); filter: blur(24px); border-radius: 50%; animation: host-mascot-glow 3s infinite ease-in-out;"></div>

        <img src="assets/mascot.png" alt="Mascot" style="width: 100%; height: 100%; object-fit: contain; position: relative; z-index: 1; animation: mascot-float 4s ease-in-out infinite;">
      </div>
      
      <!-- Lời chào mừng cá nhân nằm dưới Mascot -->
      <h2 style="font-size: 28px; font-weight: 800; color: var(--text-primary); margin: 0 0 20px 0; line-height: 1.2;">
        Hey ${player.name} 👋
      </h2>

      <!-- Title vinh danh (Y hệt màn hình Host) -->
      <h1 style="font-size: 48px; font-weight: 900; letter-spacing: -0.03em; margin: 0; text-transform: uppercase; line-height: 1.1; font-family: var(--font);">
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

  if (window.lucide) window.lucide.createIcons();
};
