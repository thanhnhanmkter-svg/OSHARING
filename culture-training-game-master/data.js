// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT DATA (dùng để reset về mặc định khi admin xóa câu hỏi tùy chỉnh)
// ─────────────────────────────────────────────────────────────────────────────

window.DEFAULT_QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "Giá trị cốt lõi được đặt lên hàng đầu trong văn hóa doanh nghiệp của chúng ta là __________.",
    answer: "Chính trực",
    explanation: "Chính trực (Integrity) là nền tảng cốt lõi của mọi hành động tại doanh nghiệp chúng ta, tạo nên sự tin cậy lâu dài."
  },
  {
    id: 2,
    question: "Khi gặp khó khăn, chủ động chia sẻ với nhóm và cùng tìm giải pháp thể hiện tinh thần __________.",
    answer: "Đồng đội",
    explanation: "Sự thấu hiểu, sẻ chia và đồng lòng vượt qua thử thách là bản sắc văn hóa 'Đồng đội' của chúng ta."
  },
  {
    id: 3,
    question: "Nỗ lực mang lại giá trị vượt sự mong đợi của đối tác chính là tinh thần __________ là trọng tâm.",
    answer: "Khách hàng",
    explanation: "Chúng ta xem sự hài lòng của khách hàng là thước đo thành công và luôn nỗ lực vượt trên kỳ vọng của họ."
  },
  {
    id: 4,
    question: "Không ngừng cải tiến, học hỏi và đổi mới phương pháp làm việc chính là tinh thần __________.",
    answer: "Sáng tạo",
    explanation: "Sáng tạo không cần phải là điều gì vĩ đại, mà bắt đầu từ những cải tiến nhỏ hàng ngày trong công việc của bạn."
  },
  {
    id: 5,
    question: "Mục tiêu cao nhất của chương trình là hiểu sâu sắc và __________ văn hóa trong công việc hàng ngày.",
    answer: "Thực hành",
    explanation: "Văn hóa doanh nghiệp chỉ thực sự sống khi được mỗi thành viên thấu hiểu và thực hành mỗi ngày."
  }
];

window.DEFAULT_TUG_STATEMENTS = [
  { 
    id: 1, 
    question: "Hành động nào sau đây thể hiện rõ nhất sự 'Chính trực' tại công sở?", 
    options: ["Báo cáo sai tiến độ để tránh bị phạt", "Làm đúng quy trình ngay cả khi không có sếp", "Đổ lỗi cho team khác", "Lấy ý tưởng của đồng nghiệp nhận làm của mình"], 
    answer: 1 
  },
  { 
    id: 2, 
    question: "Khi khách hàng phàn nàn về dịch vụ, cách xử lý chuẩn văn hóa 'Khách hàng là trọng tâm' là gì?", 
    options: ["Lắng nghe, xin lỗi và ngay lập tức tìm cách hỗ trợ", "Phớt lờ vì không phải lỗi của mình", "Cãi tay đôi với khách hàng", "Bảo khách hàng đọc lại hợp đồng"], 
    answer: 0 
  },
  { 
    id: 3, 
    question: "Tinh thần 'Đồng đội' được thể hiện tốt nhất khi nào?", 
    options: ["Mạnh ai nấy làm, xong việc mình là về", "Bao che lỗi sai cho nhau", "Chủ động hỗ trợ đồng nghiệp khi họ gặp khó khăn", "Nói xấu đồng nghiệp sau lưng"], 
    answer: 2 
  },
  { 
    id: 4, 
    question: "Để 'Đổi mới sáng tạo', bạn nên làm gì?", 
    options: ["Luôn làm theo cách cũ vì nó an toàn", "Chờ sếp giao mới làm", "Ngại thay đổi", "Đề xuất quy trình mới giúp tiết kiệm thời gian"], 
    answer: 3 
  },
  { 
    id: 5, 
    question: "Tinh thần chịu trách nhiệm (Ownership) có nghĩa là gì?", 
    options: ["Chỉ làm đúng phần việc được giao, việc khác bỏ qua", "Nhận trách nhiệm và nỗ lực giải quyết vấn đề đến cùng", "Đổ lỗi cho hoàn cảnh hoặc người khác khi có sự cố", "Chờ đợi sự hướng dẫn chi tiết của cấp trên mới làm"], 
    answer: 1 
  },
  { 
    id: 6, 
    question: "Khi phát hiện một đồng nghiệp làm sai quy định an toàn bảo mật thông tin, bạn nên làm gì?", 
    options: ["Lờ đi coi như không biết gì", "Báo cáo cấp trên hoặc nhắc nhở đồng nghiệp đó sửa lỗi ngay", "Nói xấu đồng nghiệp đó với các thành viên khác", "Làm sai theo vì thấy không có ai bị phạt"], 
    answer: 1 
  },
  { 
    id: 7, 
    question: "Tinh thần học hỏi không ngừng (Continuous Learning) thể hiện qua việc:", 
    options: ["Nghĩ rằng mình đã biết hết mọi thứ và không cần học thêm", "Chủ động cập nhật kiến thức mới và cải thiện kỹ năng mỗi ngày", "Chỉ học khi công ty bắt buộc học và thi", "Che giấu những gì mình chưa biết để tránh bị đánh giá"], 
    answer: 1 
  },
  { 
    id: 8, 
    question: "Khi hợp tác liên phòng ban gặp xung đột ý kiến, cách giải quyết tốt nhất là gì?", 
    options: ["Kiên quyết bảo vệ ý kiến của mình và bác bỏ ý kiến phòng khác", "Ngừng hợp tác và báo cáo lên cấp trên giải quyết", "Lắng nghe đa chiều, tìm điểm chung để hướng tới mục tiêu chung", "Đồng ý bên ngoài nhưng không thực hiện bên trong"], 
    answer: 2 
  },
  { 
    id: 9, 
    question: "Làm thế nào để xây dựng niềm tin (Trust) với khách hàng và đồng nghiệp?", 
    options: ["Hứa thật nhiều nhưng thực hiện ít", "Luôn giữ lời hứa và thực thi công việc một cách chính trực", "Chỉ làm tốt trước mặt mọi người", "Đổ lỗi cho người khác khi không hoàn thành công việc"], 
    answer: 1 
  },
  { 
    id: 10, 
    question: "Tinh thần quyết liệt trong hành động (Execute with Excellence) thể hiện qua việc:", 
    options: ["Chỉ làm cho xong việc mà không quan tâm chất lượng", "Làm việc nửa vời, gặp khó khăn là bỏ cuộc", "Lên kế hoạch chi tiết và quyết tâm đạt kết quả tốt nhất", "Trì hoãn công việc đến sát hạn chót mới làm"], 
    answer: 2 
  }
];

window.DEFAULT_SHARING_CARDS = [
  {
    id: 1,
    hidden: false,
    author: "Chị Nguyễn Minh Hằng",
    role: "Giám đốc Nhân sự (12 năm đồng hành)",
    avatar: "👩‍💼",
    image: "",
    gradient: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
    story: "Với tôi, văn hóa công ty không nằm trên giấy tờ mà nằm ở nụ cười của các bạn mỗi sáng đến văn phòng. 12 năm trước, chúng ta bắt đầu chỉ với 10 người trong một căn phòng chật hẹp, nhưng chính tinh thần 'Đồng đội' và không bao giờ bỏ cuộc đã đưa chúng ta đến quy mô hàng ngàn nhân sự như hôm nay. Hãy luôn giữ vững ngọn lửa ấy nhé!"
  },
  {
    id: 2,
    hidden: false,
    author: "Anh Trần Hoàng Nam",
    role: "Trưởng phòng Công nghệ (8 năm đồng hành)",
    avatar: "👨‍💻",
    image: "",
    gradient: "linear-gradient(135deg, #4facfe, #00f2fe)",
    story: "Làm công nghệ tại đây, tôi học được rằng 'Đổi mới sáng tạo' là chìa khóa sinh tồn. Có những dự án tưởng chừng như bất khả thi, nhưng nhờ sự 'Chính trực' trong từng dòng code và sự tin tưởng tuyệt đối từ ban lãnh đạo, team Tech đã vượt qua tất cả. Các bạn trẻ hãy tự tin thử nghiệm và đừng sợ thất bại."
  },
  {
    id: 3,
    hidden: false,
    author: "Bác Lê Khắc Bình",
    role: "Phó Tổng Giám Đốc (15 năm đồng hành)",
    avatar: "👨‍💼",
    image: "",
    gradient: "linear-gradient(135deg, #b19ffb, #fc8ca9)",
    story: "Tôi muốn nhắn nhủ một điều: 'Khách hàng là trọng tâm' không phải là khẩu hiệu marketing. Đó là lời cam kết từ trái tim. Khi chúng ta tôn trọng khách hàng, chúng ta đang tự tôn trọng chính mình và tổ chức của mình. Chúc thế hệ trẻ sẽ tiếp nối và phát huy rực rỡ những giá trị cốt lõi này."
  }
];

window.DEFAULT_KEYWORDS = [
  { word: "CHÍNH TRỰC", clue: "Luôn hành động đúng đắn, trung thực kể cả khi không có ai giám sát." },
  { word: "ĐỒNG ĐỘI",   clue: "Sự đoàn kết, sẻ chia, thấu hiểu và cùng nhau vượt qua thử thách." },
  { word: "SÁNG TẠO",   clue: "Không ngừng cải tiến, học hỏi và thử nghiệm cái mới để nâng cao hiệu suất." },
  { word: "KHÁCH HÀNG", clue: "Trọng tâm của mọi hoạt động, nỗ lực mang lại giá trị vượt kỳ vọng." },
  { word: "TÔN TRỌNG",  clue: "Lắng nghe ý kiến đa chiều, ghi nhận sự đóng góp và tôn trọng sự khác biệt." },
  { word: "TỐC ĐỘ",     clue: "Hành động nhanh chóng, linh hoạt thích ứng và quyết liệt trong thực thi." }
];

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVE DATA (đọc từ localStorage nếu admin đã chỉnh sửa, fallback về default)
// ─────────────────────────────────────────────────────────────────────────────

function loadCustomOrDefault(key, defaultData) {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Migration check cho Tug of War: Nếu data cũ không có options, bỏ qua và dùng default
      if (key === 'ctg_custom_tug' && parsed.length > 0 && !parsed[0].options) {
        localStorage.removeItem(key);
        return JSON.parse(JSON.stringify(defaultData));
      }
      return parsed;
    }
  } catch (e) { /* fallback */ }
  return JSON.parse(JSON.stringify(defaultData));
}

// Live getters so components always get the latest
window.getQuizQuestions   = () => loadCustomOrDefault('ctg_custom_quiz',      window.DEFAULT_QUIZ_QUESTIONS);
window.getTugStatements   = () => loadCustomOrDefault('ctg_custom_tug',       window.DEFAULT_TUG_STATEMENTS);
window.getSharingCards    = () => loadCustomOrDefault('ctg_custom_sharing',   window.DEFAULT_SHARING_CARDS);
window.getKeywords        = () => loadCustomOrDefault('ctg_custom_keywords',  window.DEFAULT_KEYWORDS);
window.getQuizTimerSecs   = () => {
  const v = parseInt(localStorage.getItem('ctg_quiz_timer') || '15', 10);
  return isNaN(v) ? 15 : Math.max(5, Math.min(60, v));
};

// Legacy aliases (backward compat with components that use window.quizQuestions etc.)
window.quizQuestions = window.getQuizQuestions();
window.sharingCards  = window.getSharingCards();
window.keywords      = window.getKeywords();
