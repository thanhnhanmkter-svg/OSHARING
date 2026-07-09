// Trạng thái mặc định của hệ thống
const DEFAULT_STATE = {
  stage: 0, // 0: Login, 1: Quiz, 2: Tug of war, 3: Sharing, 4: Keywords, 5: Certificate
  teamConnectActive: false, // Nếu true, hiển thị màn hình Team Connect để xếp đội
  showTitleScreen: true, // Nếu true, hiển thị màn hình Title của Stage trước khi vào nội dung
  // Danh sách đội: có thể có từ 2 đến 6 đội
  teams: [
    { id: 'Red',    name: 'Đội Đỏ (Đột Phá)',  emoji: '🔴', color: '#ef4444', colorLight: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.25)'  },
    { id: 'Blue',   name: 'Đội Xanh (Bền Bỉ)', emoji: '🔵', color: '#0ea5e9', colorLight: 'rgba(14,165,233,0.08)', border: 'rgba(14,165,233,0.25)' },
  ],
  stageTitles: {
    1: "KIẾN THỨC CỐT LÕI",
    2: "SỨC MẠNH ĐỒNG ĐỘI",
    3: "CẢM HỨNG VÀ CHIA SẺ",
    4: "GIẢI MÃ TỪ KHÓA"
  },
  sharingTitle: "LẮNG NGHE THẾ HỆ ĐI TRƯỚC",
  sharingSubtitle: "Những câu chuyện thực tế từ các nhân sự thâm niên về hành trình phát triển và văn hóa làm việc. Hãy thả tim để bày tỏ sự trân trọng! ❤️",
  players: [], // Danh sách người chơi [{ id, name, department, score, team, keywordsGuessed: [] }]
  sharingHearts: { 1: 0, 2: 0, 3: 0 }, // Lượt thả tim cho từng bài chia sẻ
  quizState: {
    currentQuestionIndex: 0,
    showAnswer: false, // Admin bật để Host hiện đáp án và người chơi ngưng trả lời
    startTime: null,   // Lưu thời điểm bắt đầu để đếm ngược đồng bộ
    isActive: false, // Admin bật khi bắt đầu câu hỏi
    answers: {} // { "playerId": { option: 1 } }
  },
  tugOfWar: {
    round: 1, // 1 hoặc 2
    teamA: 'Red',
    teamB: 'Blue',
    status: 'waiting', // 'waiting' | 'playing' | 'reviewing'
    currentQuestionIndex: 0,
    reviewQuestionIndex: 0,
    ropePosition: 50,
    redScore: 0, // Điểm Team A
    blueScore: 0, // Điểm Team B
    isActive: false,
    winner: null,
    answers: {} // Phẳng: { "playerId_qIndex": { option: choice, correct: isCorrect } }
  },
  welcomeSettings: {
    textSize: 120, // px
    mascotSize: 180 // px
  },
  wordCloud: {
    words: [] // [{ text: "Sáng tạo", color: "#10b981", size: 24, left: 10, top: 20 }]
  },
  globalResetCounter: 0
};

const STORAGE_KEY = 'culture_training_game_state';

// Hàm merge state với default để đảm bảo mọi field luôn tồn tại
function mergeWithDefaults(data) {
  return {
    ...JSON.parse(JSON.stringify(DEFAULT_STATE)),
    ...data,
    // Đảm bảo các sub-object quan trọng luôn có đầy đủ fields
    teams:        Array.isArray(data.teams) && data.teams.length > 0 ? data.teams : JSON.parse(JSON.stringify(DEFAULT_STATE.teams)),
    players:      Array.isArray(data.players)      ? data.players      : [],
    quizState:    { ...DEFAULT_STATE.quizState,    ...(data.quizState    || {}) },
    tugOfWar:     { 
      ...DEFAULT_STATE.tugOfWar, 
      ...(data.tugOfWar || {}),
      status: data.tugOfWar?.status || 'waiting',
      round: data.tugOfWar?.round || 1,
      teamA: data.tugOfWar?.teamA || 'Red',
      teamB: data.tugOfWar?.teamB || 'Blue',
      currentQuestionIndex: data.tugOfWar?.currentQuestionIndex || 0,
      reviewQuestionIndex: data.tugOfWar?.reviewQuestionIndex || 0
    },
    sharingHearts:{ ...DEFAULT_STATE.sharingHearts, ...(data.sharingHearts || {}) },
    welcomeSettings: { ...DEFAULT_STATE.welcomeSettings, ...(data.welcomeSettings || {}) },
    wordCloud:    { words: Array.isArray(data.wordCloud?.words) ? data.wordCloud.words : [] },
    stageTitles:  { ...DEFAULT_STATE.stageTitles,  ...(data.stageTitles  || {}) },
  };
}

// Cache state trong bộ nhớ để tránh đọc localStorage liên tục
let localStateCache = null;

window.getGameState = function() {
  if (localStateCache) return localStateCache;
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STATE));
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }
  try {
    return mergeWithDefaults(JSON.parse(data));
  } catch (e) {
    console.error("Lỗi đọc state từ localStorage, reset về mặc định", e);
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }
};

// Các hàm đăng ký lắng nghe sự thay đổi
const listeners = new Set();

window.subscribeToState = function(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

function notifyListeners(state) {
  listeners.forEach(callback => callback(state));
}

// Hàm cập nhật state
window.setGameState = function(updater) {
  const currentState = window.getGameState();
  const newState = typeof updater === 'function' ? updater(currentState) : { ...currentState, ...updater };
  
  if (window.db) {
    // Nếu có Firebase, đẩy thẳng lên Firebase (Firebase sẽ gọi lại hàm onValue để update UI)
    window.db.ref('game_state').set(newState);
  } else {
    // Fallback Local Storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    localStateCache = newState;
    notifyListeners(newState);
  }
};

// Reset toàn bộ game về mặc định
window.resetGameState = function() {
  const current = window.getGameState();
  const newState = {
    ...JSON.parse(JSON.stringify(DEFAULT_STATE)),
    globalResetCounter: (current.globalResetCounter || 0) + 1
  };
  
  if (window.db) {
    window.db.ref('game_state').set(newState);
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    localStateCache = newState;
    notifyListeners(newState);
  }
};

// Firebase listener
if (window.db) {
  console.log("Firebase is initialized, listening to 'game_state'...");
  window.db.ref('game_state').on('value', (snapshot) => {
    const rawData = snapshot.val();
    if (rawData) {
      const data = mergeWithDefaults(rawData);
      localStateCache = data;
      // Backup to localStorage just in case
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      notifyListeners(data);
    } else {
      // First time init Firebase
      window.setGameState(window.getGameState());
    }
  });
} else {
  // Lắng nghe sự kiện storage từ các tab khác (nếu không có Firebase)
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) {
      try {
        const newState = mergeWithDefaults(JSON.parse(event.newValue));
        localStateCache = newState;
        notifyListeners(newState);
      } catch (e) {
        console.error("Lỗi parse dữ liệu từ sự kiện storage", e);
      }
    }
  });
}
