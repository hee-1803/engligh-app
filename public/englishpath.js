/* SEED — ứng dụng học tiếng Anh cá nhân hóa
   Dữ liệu: /api/state (Supabase). AI: /api/ai (AI qua server). */
(() => {
"use strict";

/* ===================== NGÔN NGỮ GIAO DIỆN =====================
   Mặc định tiếng Việt. Cài đặt → Ngôn ngữ → English để đổi (lưu theo máy, tải lại trang).
   Nội dung học (nghĩa tiếng Việt của từ, câu dịch) giữ nguyên. */
// Ngôn ngữ: người dùng tự chọn (vi/en) hoặc "auto" = theo ngôn ngữ của máy. Mặc định: theo máy; máy không phải tiếng Anh thì dùng tiếng Việt.
const LANG_PICK = (() => { try { return localStorage.getItem("ep_lang") || "auto"; } catch (e) { return "auto"; } })();
const DEVICE_LANG = (() => { const l = String((navigator.languages && navigator.languages[0]) || navigator.language || "vi").toLowerCase(); return l.startsWith("vi") ? "vi" : "en"; })(); // chỉ máy cài tiếng Việt mới hiện tiếng Việt, còn lại tiếng Anh
const LANG = LANG_PICK === "vi" || LANG_PICK === "en" ? LANG_PICK : DEVICE_LANG;
const EN = {"Bỏ chọn tất cả": "Clear all", "Chọn tất cả": "Select all", "Đã chọn": "Selected", "tình huống": "situations", "Bạn đã ở trình độ cao nhất (C1).": "You're already at the top level (C1).", "Bạn có thể thi lại sau": "You can retake it in", "ngày nữa.": "more day(s).", "Trình duyệt này chưa hỗ trợ micro. Hãy mở bằng Chrome hoặc Safari.": "This browser doesn't support the microphone. Please use Chrome or Safari.", "Bạn là chuyên gia ra đề tiếng Anh theo CEFR. Chỉ trả JSON.": "You are an expert CEFR English test writer. Return JSON only.", "Kiểm tra nhanh, luyện theo kỹ năng, thi lên trình độ": "Quick check, skill practice, level-up test", "Lần gần nhất:": "Last:", "Bài test đầu vào": "Placement test", "Bạn đã bỏ qua phần nói.": "You skipped speaking.", "App nghe được:": "The app heard:", "Bạn chọn:": "Your answer:", "Tôi không biết": "I don't know", "Đáp án đúng:": "Correct answer:", "Giải thích": "Explain", "Đang soạn đề mới cho bạn…": "Writing a new test for you…", "Mỗi lần làm là một đề khác, không lặp câu cũ.": "Every test is new, no repeated questions.", "Đúng": "Correct", "Chúc mừng! Bạn đã lên trình độ": "Congratulations! You've moved up to", "Cần đạt": "You need", "để lên trình độ. Ôn thêm phần còn yếu rồi thi lại sau": "to move up. Practise your weaker skills and try again in", "ngày nhé!": "days!", "Ẩn đáp án": "Hide answers", "Xem lại đáp án": "Review answers", "Xong": "Done", "Trình độ hiện tại:": "Current level:", "mỗi lần làm là một đề mới": "a new test every time", "Kiểm tra nhanh": "Quick check", "5 phút · 4 kỹ năng · theo trình độ": "5 min · 4 skills · at level", "Chỉ xem điểm, không đổi trình độ.": "Just a score, your level won't change.", "Luyện theo kỹ năng": "Skill practice", "Chọn 1 kỹ năng và trình độ bạn muốn thử.": "Pick a skill and the level you want to try.", "Thi lên trình độ": "Level-up test", "Khoảng 10 phút ở trình độ": "About 10 minutes at level", "là được lên trình độ, trượt thì thi lại sau": "to move up; if you don't pass, retry after", "ngày.": "days.", "Thi lại sau": "Retry in", "ngày": "days", "Bắt đầu thi": "Start the test", "Lịch sử điểm": "Score history", "Chưa có bài kiểm tra nào. Làm thử bài Kiểm tra nhanh nhé!": "No tests yet. Try a Quick check!", "Chưa đạt": "Not passed", "Ẩn": "Hide", "Xem lại": "Review", "Mỗi ngày, bài kiểm tra đầu tiên được cộng điểm vào bảng xếp hạng tuần.": "Each day, your first test counts toward the weekly leaderboard.", "phần": "", "Không biết thì chọn \"Tôi không biết\", đừng đoán nhé!": "If you don't know, tap \"I don't know\" instead of guessing!", "Nghe": "Listening", "Nghe và chọn đúng câu bạn vừa nghe": "Listen and choose the sentence you heard", "Phần": "Part", "câu": "questions", "còn khoảng": "about", "phút": "min", "phút nữa": "min left", "câu số": "question", "Bắt đầu": "Start", "Tiếp tục": "Continue", "Bấm micro rồi đọc to câu dưới đây": "Tap the mic and read the sentence below aloud", "Đã có kết quả trình độ Viết của bạn:": "Your writing level is ready:", "Đã đổi trình độ": "Level changed", "Các bài tiếp theo sẽ theo trình độ mới.": "Upcoming lessons will follow your new level.", "Có vẻ bài hơi dễ với bạn!": "Lessons look a bit easy for you!", "Có vẻ bài đang hơi khó": "Lessons seem a bit hard right now", "Điểm trung bình 3 buổi gần nhất:": "Average of your last 3 lessons:", "Phần viết của bạn cũng tốt hơn trình độ hiện tại.": "Your writing is also above your current level.", "Phần viết của bạn cũng cần củng cố thêm.": "Your writing also needs more practice.", "Bạn muốn lên": "Would you like to move up to", "Bạn muốn học ở mức": "Would you like to study at", "Lên": "Move up to", "Chuyển sang": "Switch to", "Giữ trình độ": "Stay at", "Chọn trình độ của bạn": "Choose your level", "Nếu bạn đã biết trình độ (ví dụ qua IELTS, TOEIC hay lớp học), chọn luôn ở đây.": "If you already know your level (from IELTS, TOEIC or a class), pick it here.", "Bước 2/2 · Kiểm tra trình độ": "Step 2/2 · Level check", "Bài test 4 kỹ năng, khoảng 5 phút": "A 4-skill test, about 5 minutes", "bài đọc": "text", "Câu hỏi tự khó hoặc dễ hơn theo câu trả lời của bạn. Không biết thì chọn \"Tôi không biết\", đừng đoán. Phần Viết sẽ được chấm dần qua 3 bài học đầu tiên.": "Questions get harder or easier based on your answers. If you don't know, tap \"I don't know\" instead of guessing. Writing is assessed over your first 3 lessons.", "Bắt đầu kiểm tra": "Start the test", "Tôi mới bắt đầu, bỏ qua và học từ A0": "I'm a beginner, skip and start from A0", "Tôi đã biết trình độ của mình": "I already know my level", "Đánh giá qua 3 bài học đầu": "Assessed over your first 3 lessons", "Chưa đánh giá": "Not assessed", "Kết quả kiểm tra": "Your result", "Bạn tự chọn trình độ này.": "You chose this level yourself.", "Bạn đang ở mức mới bắt đầu, SEED sẽ dạy từ những điều cơ bản nhất.": "You're just starting out, so SEED will begin with the basics.", "Bạn trả lời đúng ": "You got ", " câu.": " right.", "Trình độ từng kỹ năng": "Level by skill", "Kỹ năng cần ưu tiên:": "Skill to focus on:", "Mỗi bài học sẽ có thêm 1 câu luyện kỹ năng này.": "Each lesson will include an extra exercise for it.", "Lộ trình đề xuất": "Suggested course", "trong": "in", "tuần": "weeks", "buổi học, mỗi buổi": "lessons, each", "bài kiểm tra định kỳ. Nội dung xoay quanh": "progress tests. Topics focus on", "Bắt đầu lộ trình": "Start the course", "Tôi muốn chọn trình độ khác": "I'd like a different level", "Làm lại bài test": "Retake the test", "Bỏ qua phần nói": "Skip speaking", "đang đánh giá": "assessing", "bài": "lessons", "cần thêm câu tự viết": "needs more written answers", "Kiểm tra lại": "Retest", "Viết được chấm qua các câu bạn tự đặt, dịch và nhắn trong role-play, cập nhật mỗi tuần.": "Writing is assessed from the sentences you write, translate and type in role-play, updated weekly.", "Giữ nguyên trình độ. Cố lên nhé!": "Keeping your level. Keep it up!", "?": "?", "Quản trị": "Admin", "Lịch sử học": "Learning history", "buổi": "lessons", "📜 Lịch sử học": "📜 Learning history", "Bảng xếp hạng tuần": "Weekly leaderboard", "Hạng": "Rank", "điểm": "pts", "còn": "", "điểm để vào top 10": "pts to reach the top 10", "Có kết quả tuần trước, bấm để xem!": "Last week's results are in, tap to see!", "Thử lại": "Try again", "Đang tải bảng xếp hạng…": "Loading the leaderboard…", "Kết quả tuần trước": "Last week's result", "Phần thưởng: huy hiệu tuần, danh hiệu, khung ảnh mới và 1 đóng băng chuỗi 🧊": "Rewards: a weekly badge, a title, a new frame and 1 streak freeze 🧊", "Tuần này cố lên nhé, vào top 10 là có quà!": "Keep going this week, the top 10 get rewards!", "Bạn được lên giải": "You've been promoted to", "Bạn xuống giải": "You've moved down to", "Tuần này giành lại nhé!": "Win it back this week!", "Tuyệt, nhận thưởng!": "Awesome, claim it!", "Bạn đang tắt tham gia xếp hạng nên không có tên trên bảng và không nhận thưởng theo hạng.": "You've left the leaderboard, so your name isn't shown and you don't get rank rewards.", "Tham gia lại": "Join again", "điểm tuần": "weekly pts", "Bạn đang hạng": "You're ranked", "đang trong top 10, giữ vững nhé!": "you're in the top 10, hold on!", "Học 1 bài để có tên trên bảng tuần này.": "Finish 1 lesson to get on this week's board.", "Bảng": "Board", "người": "people", "Chưa có ai trong bảng này tuần này. Học 1 bài là bạn đứng đầu!": "No one on this board yet this week. One lesson and you're #1!", "Về bảng của bạn": "Back to your board", "Mốc điểm tuần này": "This week's milestones", "Ai cũng nhận được, không cần lên top.": "Everyone can get these, no need to be at the top.", "Còn": "", "điểm nữa để nhận": "more pts to get", "Bạn đã nhận hết quà mốc điểm tuần này!": "You've collected every milestone reward this week!", "Đang dùng": "In use", "Dùng": "Use", "Phần thưởng của bạn": "Your rewards", "Đóng băng chuỗi: tự dùng khi bạn lỡ 1 ngày": "Streak freezes: used automatically if you miss a day", "Danh hiệu tuần này (hiện cạnh biệt danh khi trò chuyện)": "This week's title (shown next to your nickname in chat)", "Huy hiệu": "Badges", "Chưa có huy hiệu. Đạt 50 điểm trong tuần để nhận huy hiệu đầu tiên 🐝": "No badges yet. Reach 50 points in a week to earn your first one 🐝", "Khung ảnh đại diện": "Profile frames", "Không khung": "No frame", "Bỏ khung": "Remove frame", "Cách tính điểm & luật giải đấu": "How points and leagues work", "Tuỳ chọn xếp hạng": "Leaderboard options", "Hiện tên thật": "Show my name", "thay cho biệt danh": "instead of a nickname", "Đang bật": "On", "Tham gia bảng xếp hạng": "Join the leaderboard", "🧊 Đã dùng 1 đóng băng chuỗi cho hôm qua. Chuỗi ngày học của bạn vẫn còn!": "🧊 A streak freeze covered yesterday. Your streak is safe!", "💬 Phòng chung": "💬 Public room", "🤝 Ghép đôi 1-1": "🤝 1-on-1", "🏆 Xếp hạng": "🏆 Leaderboard", "Hôm nay bạn là": "Today you are", "Đóng băng chuỗi": "Streak freeze", "Xếp hạng & phần thưởng": "Leaderboard & rewards", "Phòng chung cho mọi người cùng hỏi đáp; Ghép đôi 1-1 để luyện nói, kể cả khi người kia đang offline. Mọi người chỉ thấy biệt danh. Không chia sẻ số điện thoại, mạng xã hội hay đường link (app sẽ chặn).": "One public room where everyone can ask and answer; 1-on-1 matching for speaking practice, even when the other person is offline. Everyone only sees nicknames. Don't share phone numbers, social media or links (the app blocks them).", "🎁 Đã nhận thưởng! Xem trong mục Phần thưởng của bạn.": "🎁 Reward claimed! See it under Your rewards.", "Tắt tham gia: bạn sẽ không có tên trên bảng và không nhận thưởng theo hạng. Tiếp tục?": "Leave the leaderboard? Your name won't be shown and you won't get rank rewards.", "Chính sách quyền riêng tư": "Privacy policy", "Yêu cầu xoá tài khoản & dữ liệu": "Delete my account & data", "Phiên bản": "Version", "Sinh nhật SEED cùng ngày với người sáng lập": "SEED shares its birthday with its founder", "Người sáng lập": "Founder", "</p></div>": "</p></div>", "Chào hỏi & giới thiệu bản thân": "Greetings & introducing yourself", "Động từ to be (am / is / are)": "The verb to be (am / is / are)", "Làm thủ tục ở sân bay": "Checking in at the airport", "Lời đề nghị lịch sự với Can / Could": "Polite requests with Can / Could", "Gọi món ở nhà hàng": "Ordering at a restaurant", "Họp nhóm hằng ngày": "Daily team meetings", "Thì hiện tại tiếp diễn": "Present continuous", "Hỏi đường": "Asking for directions", "Câu mệnh lệnh khi chỉ đường": "Imperatives for giving directions", "Mua sắm quần áo": "Shopping for clothes", "Xin chào & tên của bạn": "Hello & your name", "Số đếm & tuổi": "Numbers & age", "Hỏi và nói tuổi": "Asking and saying your age", "Gia đình tôi": "My family", "Đồ vật quanh tôi": "Things around me", "a / an và this / that": "a / an and this / that", "Màu sắc & món ăn yêu thích": "Colours & favourite foods", "Ngày trong tuần & giờ giấc": "Days of the week & telling the time", "Hỏi giờ & giới từ thời gian": "Asking the time & time prepositions", "Ngôi nhà của tôi": "My home", "Bạn khỏe không?": "How are you?", "Hỏi thăm: How are you?": "Asking after someone: How are you?", "Một ngày của tôi": "My day", "Thì hiện tại đơn": "Present simple", "Thói quen & sở thích": "Habits & hobbies", "Trạng từ chỉ tần suất": "Adverbs of frequency", "Thời tiết & quần áo": "Weather & clothes", "Bạn bè & ngoại hình": "Friends & appearance", "have / has để mô tả": "have / has for describing", "Cuối tuần vừa rồi": "Last weekend", "Quá khứ của to be: was / were": "Past of to be: was / were", "Hôm qua bạn đã làm gì?": "What did you do yesterday?", "Thì quá khứ đơn": "Past simple", "Kế hoạch sắp tới": "Upcoming plans", "be going to + V": "be going to + verb", "Bạn làm được gì?": "What can you do?", "Ở khách sạn": "At the hotel", "Yêu cầu lịch sự": "Polite requests", "Bạn đã từng...?": "Have you ever...?", "Hiện tại hoàn thành: trải nghiệm": "Present perfect: experiences", "So sánh & lựa chọn": "Comparing & choosing", "So sánh hơn & so sánh nhất": "Comparatives & superlatives", "Đi khám bệnh": "Seeing a doctor", "Lời khuyên với should": "Giving advice with should", "Chuyện gì đã xảy ra?": "What happened?", "Quá khứ tiếp diễn + quá khứ đơn": "Past continuous + past simple", "Dự định & lời hứa": "Plans & promises", "will và be going to": "will and be going to", "Phỏng vấn xin việc": "Job interviews", "Hiện tại hoàn thành với for / since": "Present perfect with for / since", "Gọi điện thoại": "Phone calls", "Cụm động từ khi gọi điện": "Phrasal verbs for phone calls", "Mời & từ chối lịch sự": "Polite invitations & declining", "Would you like to...? và cách đáp lại": "Would you like to...? and how to reply", "Mô tả người": "Describing people", "look like và be like": "look like and be like", "Họp & báo cáo tiến độ": "Meetings & progress updates", "Hiện tại hoàn thành khi báo cáo": "Present perfect for reporting", "Viết email công việc": "Writing work emails", "Cụm từ email trang trọng": "Formal email phrases", "Nêu ý kiến của bạn": "Giving your opinion", "Diễn đạt ý kiến": "Expressing opinions", "Xử lý phàn nàn của khách": "Handling customer complaints", "Câu điều kiện loại 1": "First conditional", "Nếu tôi là bạn...": "If I were you...", "Câu điều kiện loại 2": "Second conditional", "Phỏng vấn: kể kinh nghiệm": "Interviews: talking about experience", "Hiện tại hoàn thành tiếp diễn": "Present perfect continuous", "Quy trình sản xuất": "Production processes", "Câu bị động": "The passive voice", "Truyền đạt lại lời nói": "Passing on what people said", "Câu tường thuật": "Reported speech", "Thuyết trình ngắn": "Short presentations", "Từ nối trong thuyết trình": "Linking words in presentations", "Công nghệ trong đời sống": "Technology in everyday life", "Mệnh đề quan hệ who / which / that": "Relative clauses: who / which / that", "Lời khuyên & gợi ý": "Advice & suggestions", "Đưa lời khuyên & gợi ý": "Giving advice & suggestions", "Ngày xưa và bây giờ": "Then and now", "used to + V": "used to + verb", "Đàm phán hợp đồng": "Negotiating contracts", "Ngôn ngữ đàm phán lịch sự": "Polite negotiation language", "Thuyết trình chuyên nghiệp": "Professional presentations", "Dẫn dắt người nghe": "Guiding your audience", "Nêu & bảo vệ quan điểm": "Stating & defending a view", "Từ nối nhượng bộ & tương phản": "Linking words for concession & contrast", "Suy luận & phỏng đoán": "Deduction & speculation", "Động từ khuyết thiếu chỉ suy luận": "Modal verbs of deduction", "Nhìn lại & rút kinh nghiệm": "Looking back & learning lessons", "Câu điều kiện loại 3 & I wish": "Third conditional & I wish", "Phỏng vấn vị trí cao": "Senior-level interviews", "V-ing hay to + V": "-ing or to + verb", "Viết báo cáo & phân tích": "Writing reports & analysis", "Từ nối trong văn viết": "Linking words in writing", "Quản lý dự án": "Project management", "Tương lai hoàn thành & tương lai tiếp diễn": "Future perfect & future continuous", "Văn hóa công sở quốc tế": "International workplace culture", "Thành ngữ thường gặp ở công sở": "Common workplace idioms", "Môi trường & xã hội": "Environment & society", "Bị động với động từ khuyết thiếu": "Passive with modal verbs", "Lập luận thuyết phục": "Persuasive arguments", "Đảo ngữ để nhấn mạnh": "Inversion for emphasis", "Ngôn ngữ ngoại giao": "Diplomatic language", "Nói giảm, nói tránh (hedging)": "Softening and hedging", "Nhấn mạnh ý chính": "Emphasising the main point", "Câu chẻ (cleft sentences)": "Cleft sentences", "Phân tích dữ liệu": "Data analysis", "Danh từ hóa trong văn trang trọng": "Nominalisation in formal writing", "Xử lý khủng hoảng": "Crisis management", "Động từ khuyết thiếu ở quá khứ": "Past modals", "Phát biểu truyền cảm hứng": "Inspiring speeches", "Biện pháp tu từ": "Rhetorical devices", "Đàm phán phức tạp": "Complex negotiations", "Điều kiện nâng cao": "Advanced conditionals", "Cụm từ cố định & sắc thái": "Fixed expressions & nuance", "Cụm từ cố định (collocations)": "Collocations","Chào hỏi & giới thiệu bản thân": "Greetings & introducing yourself", "Động từ to be (am / is / are)": "The verb to be (am / is / are)", "Làm thủ tục ở sân bay": "Checking in at the airport", "Lời đề nghị lịch sự với Can / Could": "Polite requests with Can / Could", "Gọi món ở nhà hàng": "Ordering at a restaurant", "Họp nhóm hằng ngày": "Daily team meetings", "Thì hiện tại tiếp diễn": "Present continuous", "Hỏi đường": "Asking for directions", "Câu mệnh lệnh khi chỉ đường": "Imperatives for giving directions", "Mua sắm quần áo": "Shopping for clothes", "Xin chào & tên của bạn": "Hello & your name", "Số đếm & tuổi": "Numbers & age", "Hỏi và nói tuổi": "Asking and saying your age", "Gia đình tôi": "My family", "Đồ vật quanh tôi": "Things around me", "a / an và this / that": "a / an and this / that", "Màu sắc & món ăn yêu thích": "Colours & favourite foods", "Ngày trong tuần & giờ giấc": "Days of the week & telling the time", "Hỏi giờ & giới từ thời gian": "Asking the time & prepositions of time", "Ngôi nhà của tôi": "My home", "Bạn khỏe không?": "How are you?", "Hỏi thăm: How are you?": "Checking in on someone: How are you?", "Một ngày của tôi": "My day", "Thì hiện tại đơn": "Present simple", "Thói quen & sở thích": "Habits & hobbies", "Trạng từ chỉ tần suất": "Adverbs of frequency", "Thời tiết & quần áo": "Weather & clothes", "Bạn bè & ngoại hình": "Friends & appearance", "have / has để mô tả": "have / has for describing", "Cuối tuần vừa rồi": "Last weekend", "Quá khứ của to be: was / were": "Past of to be: was / were", "Hôm qua bạn đã làm gì?": "What did you do yesterday?", "Thì quá khứ đơn": "Past simple", "Kế hoạch sắp tới": "Upcoming plans", "be going to + V": "be going to + verb", "Bạn làm được gì?": "What can you do?", "Ở khách sạn": "At the hotel", "Yêu cầu lịch sự": "Polite requests", "Bạn đã từng...?": "Have you ever...?", "Hiện tại hoàn thành: trải nghiệm": "Present perfect: experiences", "So sánh & lựa chọn": "Comparing & choosing", "So sánh hơn & so sánh nhất": "Comparatives & superlatives", "Đi khám bệnh": "Seeing a doctor", "Lời khuyên với should": "Giving advice with should", "Chuyện gì đã xảy ra?": "What happened?", "Quá khứ tiếp diễn + quá khứ đơn": "Past continuous + past simple", "Dự định & lời hứa": "Plans & promises", "will và be going to": "will and be going to", "Phỏng vấn xin việc": "Job interviews", "Hiện tại hoàn thành với for / since": "Present perfect with for / since", "Gọi điện thoại": "Phone calls", "Cụm động từ khi gọi điện": "Phrasal verbs for phone calls", "Mời & từ chối lịch sự": "Inviting & politely declining", "Would you like to...? và cách đáp lại": "Would you like to...? and how to reply", "Mô tả người": "Describing people", "look like và be like": "look like and be like", "Họp & báo cáo tiến độ": "Meetings & progress updates", "Hiện tại hoàn thành khi báo cáo": "Present perfect for reporting", "Viết email công việc": "Writing work emails", "Cụm từ email trang trọng": "Formal email phrases", "Nêu ý kiến của bạn": "Giving your opinion", "Diễn đạt ý kiến": "Expressing opinions", "Xử lý phàn nàn của khách": "Handling customer complaints", "Câu điều kiện loại 1": "First conditional", "Nếu tôi là bạn...": "If I were you...", "Câu điều kiện loại 2": "Second conditional", "Phỏng vấn: kể kinh nghiệm": "Interviews: talking about experience", "Hiện tại hoàn thành tiếp diễn": "Present perfect continuous", "Quy trình sản xuất": "Production processes", "Câu bị động": "The passive voice", "Truyền đạt lại lời nói": "Passing on what someone said", "Câu tường thuật": "Reported speech", "Thuyết trình ngắn": "Short presentations", "Từ nối trong thuyết trình": "Linking words in presentations", "Công nghệ trong đời sống": "Technology in everyday life", "Mệnh đề quan hệ who / which / that": "Relative clauses: who / which / that", "Lời khuyên & gợi ý": "Advice & suggestions", "Đưa lời khuyên & gợi ý": "Giving advice & suggestions", "Ngày xưa và bây giờ": "Then and now", "used to + V": "used to + verb", "Đàm phán hợp đồng": "Negotiating a contract", "Ngôn ngữ đàm phán lịch sự": "Polite negotiation language", "Thuyết trình chuyên nghiệp": "Professional presentations", "Dẫn dắt người nghe": "Guiding your audience", "Nêu & bảo vệ quan điểm": "Stating & defending a position", "Từ nối nhượng bộ & tương phản": "Linking words for concession & contrast", "Suy luận & phỏng đoán": "Deduction & speculation", "Động từ khuyết thiếu chỉ suy luận": "Modal verbs of deduction", "Nhìn lại & rút kinh nghiệm": "Looking back & learning lessons", "Câu điều kiện loại 3 & I wish": "Third conditional & I wish", "Phỏng vấn vị trí cao": "Senior-level interviews", "V-ing hay to + V": "-ing or to + verb", "Viết báo cáo & phân tích": "Writing reports & analysis", "Từ nối trong văn viết": "Linking words in writing", "Quản lý dự án": "Project management", "Tương lai hoàn thành & tương lai tiếp diễn": "Future perfect & future continuous", "Văn hóa công sở quốc tế": "International workplace culture", "Thành ngữ thường gặp ở công sở": "Common workplace idioms", "Môi trường & xã hội": "Environment & society", "Bị động với động từ khuyết thiếu": "Passive with modal verbs", "Lập luận thuyết phục": "Persuasive arguments", "Đảo ngữ để nhấn mạnh": "Inversion for emphasis", "Ngôn ngữ ngoại giao": "Diplomatic language", "Nói giảm, nói tránh (hedging)": "Hedging", "Nhấn mạnh ý chính": "Emphasising key points", "Câu chẻ (cleft sentences)": "Cleft sentences", "Phân tích dữ liệu": "Data analysis", "Danh từ hóa trong văn trang trọng": "Nominalisation in formal writing", "Xử lý khủng hoảng": "Crisis management", "Động từ khuyết thiếu ở quá khứ": "Past modals", "Phát biểu truyền cảm hứng": "Inspiring speeches", "Biện pháp tu từ": "Rhetorical devices", "Đàm phán phức tạp": "Complex negotiations", "Điều kiện nâng cao": "Advanced conditionals", "Cụm từ cố định & sắc thái": "Fixed phrases & nuance", "Cụm từ cố định (collocations)": "Collocations","Chưa đăng nhập": "You're not logged in", "Không vào được phòng này": "You can't enter this room", "Cuộc trò chuyện này đã kết thúc": "This chat has ended", "Không gửi được tin nhắn": "Couldn't send the message", "Bạn gửi hơi nhanh, nghỉ một chút rồi gửi tiếp nhé.": "You're sending messages a bit fast. Take a short break and try again.", "Chờ 2 giây giữa hai tin nhắn nhé.": "Please wait 2 seconds between messages.", "Định dạng ghi âm không hỗ trợ": "This recording format isn't supported", "Đoạn ghi âm quá dài (tối đa khoảng 60 giây)": "The recording is too long (about 60 seconds max)", "Tin nhắn trống": "The message is empty", "Để giữ ẩn danh và an toàn, không gửi số điện thoại, email, đường link hay tài khoản mạng xã hội.": "To keep everyone anonymous and safe, don't send phone numbers, emails, links or social media accounts.", "Tin nhắn có từ ngữ không phù hợp. Hãy trò chuyện lịch sự nhé.": "Your message contains inappropriate language. Please keep it polite.", "Chỉ thu hồi được tin nhắn của chính bạn": "You can only unsend your own messages", "Bạn đang bị tạm khoá trò chuyện do bị báo cáo vi phạm.": "You're temporarily banned from chat because of reports against you.", "Không tìm thấy cuộc trò chuyện": "Chat not found", "Không tìm thấy tin nhắn": "Message not found", "Đây là tin nhắn của bạn": "This is your own message", "Không tìm thấy": "Not found", "Yêu cầu không hợp lệ": "Invalid request", "Phản hồi trống": "Your feedback is empty", "Bạn đã gửi nhiều phản hồi, thử lại sau ít phút nhé": "You've sent a lot of feedback. Please try again in a few minutes", "Máy chủ chưa cấu hình SUPABASE_SERVICE_ROLE_KEY": "The server isn't fully set up yet (SUPABASE_SERVICE_ROLE_KEY)", "Thiết bị này chưa bật thông báo": "Notifications aren't on for this device", "Bạn đã gửi tin nhắn giọng nói": "You sent a voice message", "Đã thu hồi một tin nhắn": "A message was unsent", "(tin đã ẩn)": "(message hidden)", "🎤 Tin nhắn giọng nói": "🎤 Voice message", "Bạn: ": "You: ","Nghe":"Listening","Mới bắt đầu":"Beginner","Sơ cấp":"Elementary","Sơ trung cấp":"Pre-intermediate","Trung cấp":"Intermediate","Trung cao cấp":"Upper-intermediate","Cao cấp":"Advanced","Giao tiếp":"Everyday conversation","Công việc":"Work","Du lịch":"Travel","Thi cử":"Exams","Họp nhóm, báo cáo tiến độ":"Team meetings and progress updates","Viết email công việc":"Writing work emails","Thuyết trình":"Presentations","Họp online với khách hàng, đối tác":"Online meetings with clients and partners","Đàm phán":"Negotiation","Small talk với đồng nghiệp nước ngoài":"Small talk with international colleagues","Phỏng vấn xin việc":"Job interviews","Đọc tài liệu chuyên ngành":"Reading industry documents","Đời sống hằng ngày":"Daily life","Chào hỏi, làm quen":"Greetings and introductions","Mua sắm, đi chợ":"Shopping and groceries","Gọi món ở quán ăn":"Ordering at a restaurant","Hỏi đường, đi lại":"Asking for directions and getting around","Gọi điện thoại":"Phone calls","Đi khám bệnh, mua thuốc":"Seeing a doctor, buying medicine","Ngân hàng, bưu điện":"Banks and post offices","Thuê nhà, nói chuyện với hàng xóm":"Renting a home, talking to neighbours","Giao tiếp khi du lịch":"Travel conversations","Sân bay, máy bay":"Airports and flights","Khách sạn":"Hotels","Taxi, tàu xe":"Taxis, trains and buses","Nhà hàng":"Restaurants","Tham quan, mua vé":"Sightseeing and buying tickets","Mua sắm, trả giá":"Shopping and bargaining","Xử lý sự cố (mất đồ, ốm)":"Handling problems (lost items, illness)","Kết bạn, mạng xã hội":"Making friends, social media","Nói về sở thích":"Talking about hobbies","Nhắn tin, bình luận":"Texting and commenting","Chia sẻ quan điểm":"Sharing opinions","Gọi video với bạn nước ngoài":"Video calls with friends abroad","Gia đình, nuôi dạy con":"Family and parenting","Nói chuyện với con bằng tiếng Anh":"Speaking English with your child","Đọc truyện cho con":"Reading stories to your child","Sinh hoạt hằng ngày ở nhà":"Daily routines at home","Trao đổi với giáo viên trường quốc tế":"Talking with international school teachers","Hẹn hò, tình cảm":"Dating and relationships","Làm quen, mời đi chơi":"Getting to know someone, asking them out","Nhắn tin":"Texting","Bày tỏ cảm xúc":"Expressing feelings","Gặp gia đình người yêu":"Meeting your partner's family","Nói trước đám đông":"Public speaking","Phát biểu, chúc mừng":"Speeches and toasts","Nêu ý kiến, tranh luận":"Giving opinions and debating","Dẫn chương trình":"Hosting events","IT, phần mềm":"IT and software","Viết bug report, ticket":"Writing bug reports and tickets","Giải thích vấn đề kỹ thuật":"Explaining technical issues","Làm việc với khách hàng nước ngoài (outsourcing)":"Working with overseas clients (outsourcing)","Viết tài liệu kỹ thuật":"Writing technical documentation","Giới thiệu sản phẩm":"Presenting products","Gọi điện cho khách hàng mới":"Cold-calling new clients","Đàm phán giá":"Negotiating prices","Chốt hợp đồng":"Closing deals","Chăm sóc khách hàng sau bán":"After-sales customer care","Brainstorm ý tưởng":"Brainstorming ideas","Viết content":"Writing content","Báo cáo chiến dịch":"Campaign reports","Làm việc với agency":"Working with agencies","Phân tích số liệu":"Data analysis","Tài chính, ngân hàng":"Finance and banking","Tư vấn khách hàng":"Advising clients","Giải thích sản phẩm tài chính":"Explaining financial products","Báo cáo tài chính":"Financial reports","Làm việc với kiểm toán":"Working with auditors","Y tế, dược":"Healthcare and pharmacy","Hỏi bệnh sử":"Taking a medical history","Giải thích chẩn đoán":"Explaining a diagnosis","Hướng dẫn dùng thuốc":"Explaining how to take medicine","Trao đổi với đồng nghiệp":"Talking with colleagues","Đọc tài liệu y khoa":"Reading medical literature","Khách sạn, nhà hàng":"Hotels and restaurants","Đón khách, check-in":"Welcoming guests, check-in","Giới thiệu dịch vụ":"Introducing services","Nhận order, giới thiệu món":"Taking orders, recommending dishes","Xử lý phàn nàn":"Handling complaints","Đặt phòng qua điện thoại":"Taking bookings by phone","Kỹ thuật, sản xuất":"Engineering and manufacturing","Hướng dẫn vận hành máy":"Explaining how to operate machines","An toàn lao động":"Workplace safety","Báo cáo sự cố":"Reporting incidents","Làm việc với chuyên gia nước ngoài":"Working with foreign experts","Giáo dục":"Education","Giảng dạy trên lớp":"Teaching in class","Trao đổi với phụ huynh":"Talking with parents","Họp chuyên môn":"Department meetings","Viết nhận xét học sinh":"Writing student reports","Xuất nhập khẩu, logistics":"Import-export and logistics","Theo dõi đơn hàng":"Tracking orders","Làm việc với forwarder":"Working with forwarders","Chứng từ, hải quan":"Documents and customs","Xử lý giao hàng trễ":"Handling late deliveries","Chăm sóc khách hàng":"Customer service","Trả lời điện thoại":"Answering the phone","Chat với khách":"Chatting with customers","Xử lý khiếu nại":"Handling complaints","Hướng dẫn sử dụng sản phẩm":"Explaining how to use a product","Văn phòng, hành chính, nhân sự":"Office, admin and HR","Lên lịch họp":"Scheduling meetings","Tiếp khách":"Receiving visitors","Tuyển dụng, phỏng vấn ứng viên":"Recruiting and interviewing candidates","Soạn thông báo nội bộ":"Writing internal announcements","Du lịch tự túc":"Independent travel","Khách sạn, homestay":"Hotels and homestays","Phương tiện công cộng":"Public transport","Ăn uống":"Eating out","Mua sắm":"Shopping","Xử lý sự cố":"Handling problems","Đi công tác":"Business trips","Sân bay, khách sạn":"Airports and hotels","Gặp đối tác":"Meeting partners","Dự hội thảo":"Attending conferences","Ăn tối tiếp khách":"Business dinners","Báo cáo chuyến công tác":"Trip reports","Du học":"Studying abroad","Phỏng vấn visa":"Visa interviews","Thủ tục nhập học":"Enrolment procedures","Thảo luận trên lớp":"Class discussions","Ở ký túc xá, ở ghép":"Dorms and flatshares","Đi làm thêm":"Part-time jobs","Định cư ở nước ngoài":"Living abroad","Thuê nhà":"Renting a home","Mở tài khoản ngân hàng":"Opening a bank account","Đi khám bệnh":"Seeing a doctor","Xin việc":"Job hunting","Giấy tờ hành chính":"Paperwork","Hàng xóm, cộng đồng":"Neighbours and community","Đọc":"Reading","Viết":"Writing","Nói":"Speaking","Việc chung ở công sở":"General office tasks","Ví dụ: hay nói chuyện với bạn bè nước ngoài qua mạng":"E.g. I often chat with friends abroad online","Ví dụ: tôi làm QA, thường họp và viết email với khách hàng Mỹ":"E.g. I work in QA and often have meetings and write emails with US clients","Ví dụ: đi Nhật và Hàn tháng 3 năm sau, tự đặt phòng và đi tàu":"E.g. going to Japan and Korea next March, booking hotels and taking trains on my own","Ví dụ: IELTS 6.5, cần nhất là Speaking":"E.g. IELTS 6.5, Speaking matters most","Ôn bài cũ":"Review","Từ vựng mới":"New words","Tự đặt câu":"Your sentences","Dịch câu":"Translation","Tổng kết":"Summary","Từ vựng":"Vocabulary","Ngữ pháp":"Grammar","Chính tả":"Spelling","Dịch":"Translation","Bước đầu tiên":"First step","Hoàn thành buổi học đầu tiên":"Finish your first lesson","Lửa nhỏ":"Little flame","Học 3 ngày liên tiếp":"Study 3 days in a row","Lửa bùng cháy":"Blazing fire","Học 7 ngày liên tiếp":"Study 7 days in a row","Tròn một tuần":"A full week","Hoàn thành 5 buổi học":"Finish 5 lessons","Điểm tuyệt đối":"Perfect score","Đạt từ 90 điểm trong một buổi":"Score 90 or more in a lesson","Giọng vàng":"Golden voice","Phát âm đạt từ 80%":"Reach 80% in pronunciation","Tai thính":"Sharp ears","Nghe chép đúng từ 80%":"Get 80% right in dictation","Nói như gió":"Smooth talker","Role-play đạt từ 80 điểm":"Score 80 or more in role-play","Kho 50 từ":"50-word stash","Có 50 từ trong flashcard":"Have 50 words in flashcards","Kho 100 từ":"100-word stash","Có 100 từ trong flashcard":"Have 100 words in flashcards","Thủ khoa Unit":"Unit topper","Kiểm tra định kỳ đạt từ 85%":"Score 85% or more in a unit test","Tốt nghiệp":"Graduate","Hoàn thành một khóa học":"Complete a course","<span class=\"spin\"></span> Đang dịch":"<span class=\"spin\"></span> Translating","Ẩn bản dịch":"Hide translation","lỗi ":"error ","Chưa dịch được: ":"Couldn't translate: ","quá chậm":"too slow","Trình duyệt chưa cho phép dùng micro. Bấm biểu tượng bên trái thanh địa chỉ và cho phép Micro.":"Your browser hasn't allowed the microphone yet. Click the icon to the left of the address bar and allow Microphone.","Không nghe thấy gì. Hãy nói to, rõ và gần micro hơn.":"I didn't hear anything. Speak louder, more clearly, and closer to the mic.","Trình duyệt này không hỗ trợ nhận giọng nói. Hãy dùng Chrome hoặc Edge.":"This browser doesn't support speech recognition. Please use Chrome or Edge.","Nhận giọng nói cần kết nối Internet.":"Speech recognition needs an internet connection.","Đã dừng ghi âm.":"Recording stopped.","Lỗi micro: ":"Microphone error: ","\"><b>Phát âm ":"\"><b>Pronunciation ","<br><span class=\"muted small\">Máy nghe được: \"":"<br><span class=\"muted small\">I heard: \"","<br><span class=\"small\">Từ gạch đỏ là từ máy chưa nhận ra. Bấm Nghe chậm, nghe mẫu rồi đọc lại.</span>":"<br><span class=\"small\">Words in red weren't recognised. Tap Slow, listen to the model, then try again.</span>","\"><b>Nghe đúng ":"\"><b>Heard correctly ","%</b><br>Câu gốc: ":"%</b><br>Original: ","Đang nghe: ":"Listening: ","Đang kiểm tra...":"Checking...","Bạn":"You","Đã tải tiến độ mới nhất từ thiết bị khác":"Loaded your latest progress from another device","Chưa lưu được tiến độ, app sẽ tự thử lại":"Couldn't save your progress yet. The app will retry automatically","Đã cập nhật tiến độ từ thiết bị khác":"Progress updated from another device","AI tạm nghỉ:":"AI paused:","Kiểm tra":"Check","không kết nối được":"can't connect","phản hồi quá chậm":"responding too slowly","mất kết nối":"connection lost","quá tải":"overloaded","AI hết lượt, tạm dùng nội dung mẫu":"AI out of quota, using sample content for now","AI lỗi ":"AI error ","không rõ lỗi":"unknown error","AI phản hồi quá chậm, sẽ tự thử lại sau":"AI is responding too slowly, will retry later","không gọi được server":"couldn't reach the server","Người học đang tiến bộ nhanh: tăng độ khó một chút.":"The learner is progressing quickly: make it slightly harder.","Người học đang gặp khó: giữ câu ngắn, từ thông dụng.":"The learner is struggling: keep sentences short and words common.","Bạn là giáo viên tiếng Anh cho người Việt. Trình độ người học: ":"You are an English teacher for Vietnamese learners. Learner's level: ",". Mục tiêu: ":". Goal: ",". Lĩnh vực: ":". Field: "," Các tình huống người học hay gặp: ":" Situations the learner often faces: ",". Người học tự mô tả: ":". The learner's own description: "," Ví dụ và tình huống luôn bám sát lĩnh vực này. Giải thích ngắn gọn bằng tiếng Việt.":" Examples and situations should always stay close to this field. Keep explanations short and in English."," Vị trí công việc: ":" Job title: ","không có":"none","Mới":"New","Đã thuộc":"Mastered","Đang nhớ":"Remembering","Đang học":"Learning","Ôn lại: ":"Review: ","Buổi ôn tập: củng cố phần chưa vững":"Review lesson: strengthen weak spots","Ôn lại các từ bạn trả lời sai trong bài kiểm tra":"Review the words you got wrong in the test","Người học":"Learner","Trò chuyện tự do với gia sư để dùng lại các từ vừa ôn.":"Chat freely with the tutor to reuse the words you just reviewed.","Dùng ít nhất 3 từ vừa ôn":"Use at least 3 of the words you reviewed","Kể về một việc bạn làm tuần này":"Talk about something you did this week","Đặt một câu hỏi cho gia sư":"Ask the tutor a question","Soạn buổi học số ":"Create lesson number "," của khóa ":" of the course ",".\nBài đã học (không lặp chủ đề và điểm ngữ pháp): ":".\nLessons already covered (don't repeat topics or grammar points): ",".\nTừ đã học (không lặp lại): ":".\nWords already learned (don't repeat): "," Độ khó tăng dần theo số buổi.\nTrả JSON đúng cấu trúc:\n{\"topic\":\"tên chủ đề tiếng Việt\",\"scenario\":\"bối cảnh 1 câu tiếng Việt\",\n\"words\":[{\"w\":\"từ hoặc cụm từ\",\"ipa\":\"IPA\",\"pos\":\"từ loại tiếng Việt\",\"vi\":\"nghĩa tiếng Việt\",\"ex\":\"câu ví dụ tiếng Anh\",\"ex_vi\":\"dịch câu ví dụ\"}] (đúng 8 mục),\n\"grammar\":{\"name\":\"tên điểm ngữ pháp\",\"pattern\":\"công thức\",\"note\":\"giải thích 2-3 câu tiếng Việt\",\"quiz\":[{\"q\":\"câu có chỗ trống ___\",\"opts\":[\"4 lựa chọn\"],\"ans\":0,\"explain\":\"giải thích ngắn\"}] (đúng 3 câu, đáp án ở vị trí ngẫu nhiên)},\n\"translations\":[{\"src\":\"câu gốc\",\"ref\":\"bản dịch mẫu\",\"dir\":\"vi-en hoặc en-vi\"}] (4 câu: 2 vi-en, 2 en-vi, có dùng từ và ngữ pháp của bài),\n\"roleplay\":{\"ai_role\":\"vai của AI, tiếng Anh\",\"user_role\":\"vai người học, tiếng Việt\",\"setting\":\"bối cảnh tiếng Việt\",\"tasks\":[\"3 nhiệm vụ tiếng Việt\"],\"opening\":\"câu mở đầu của AI, tiếng Anh\"}}":" Difficulty increases gradually with each lesson.\nReturn JSON with exactly this structure:\n{\"topic\":\"topic name in English\",\"scenario\":\"one-sentence context in English\",\n\"words\":[{\"w\":\"word or phrase\",\"ipa\":\"IPA\",\"pos\":\"part of speech in English\",\"vi\":\"Vietnamese meaning\",\"ex\":\"English example sentence\",\"ex_vi\":\"Vietnamese translation of the example\"}] (exactly 8 items),\n\"grammar\":{\"name\":\"grammar point name\",\"pattern\":\"pattern\",\"note\":\"2-3 sentence explanation in English\",\"quiz\":[{\"q\":\"sentence with a blank ___\",\"opts\":[\"4 options\"],\"ans\":0,\"explain\":\"short explanation\"}] (exactly 3 questions, correct answer in a random position)},\n\"translations\":[{\"src\":\"source sentence\",\"ref\":\"model translation\",\"dir\":\"vi-en or en-vi\"}] (4 sentences: 2 vi-en, 2 en-vi, using the lesson's words and grammar),\n\"roleplay\":{\"ai_role\":\"the AI's role, in English\",\"user_role\":\"the learner's role, in English\",\"setting\":\"context in English\",\"tasks\":[\"3 tasks in English\"],\"opening\":\"the AI's opening line, in English\"}}","(chưa có)":"(none yet)","TÌNH HUỐNG CỦA BUỔI NÀY: \"":"THIS LESSON'S SITUATION: \"","\". Toàn bộ chủ đề, từ vựng, câu dịch và role-play phải xoay quanh đúng tình huống này":"\". The whole topic, vocabulary, translation sentences and role-play must revolve around exactly this situation",", từ góc nhìn của người làm ":", from the perspective of someone working as ","Chủ đề, từ vựng, câu dịch và role-play phải là tình huống thực tế trong lĩnh vực của người học.":"The topic, vocabulary, translation sentences and role-play must be real situations in the learner's field.","Không sinh được bài:":"Couldn't generate lesson:","chờ quá lâu":"waited too long","AI chưa soạn được bài:":"AI couldn't create the lesson yet:"," nghĩa là gì?":" — what does it mean?","Từ nào có nghĩa là \"":"Which word means \"","Viết từ tiếng Anh có nghĩa: \"":"Write the English word for: \""," ký tự)":" letters)"," · phát âm ":" · pronunciation ","\">🔊 Nghe mẫu</button><button data-a=\"slow\" data-v=\"":"\">🔊 Listen</button><button data-a=\"slow\" data-v=\"","\">🐢 Nghe chậm</button>\n      <button class=\"mic big ":"\">🐢 Slow</button>\n      <button class=\"mic big ","● Đang nghe, bấm để dừng":"● Listening, tap to stop","🎤 Bấm rồi đọc to câu trên":"🎤 Tap and read the sentence aloud","<p class=\"live center\" id=\"live\">Hãy đọc...</p>":"<p class=\"live center\" id=\"live\">Start reading...</p>","<p class=\"muted small center\">Trình duyệt này không hỗ trợ micro.</p>":"<p class=\"muted small center\">This browser doesn't support the microphone.</p>","Dịch sang tiếng Anh":"Translate into English","Dịch sang tiếng Việt":"Translate into Vietnamese","<span class=\"muted small\">Gợi ý: ":"<span class=\"muted small\">Hint: ","Bản dịch của bạn":"Your translation","Gõ lại câu bạn nghe được":"Type what you heard","Gõ từ tiếng Anh":"Type the English word","<span class=\"spin\"></span> Đang chấm":"<span class=\"spin\"></span> Checking","Trả lời":"Answer","Đúng (có lỗi chính tả nhỏ)":"Correct (small spelling mistake)","Chính xác!":"Correct!","Chưa đúng.":"Not quite."," Đáp án: <b>":" Answer: <b>"," · từ vừa nghe: <b>":" · the word you heard: <b>","Xem kết quả":"See results","Câu tiếp theo":"Next question","\" aria-label=\"Nghe lại\">🔊</button><button class=\"mini\" data-a=\"slow\" data-v=\"":"\" aria-label=\"Listen again\">🔊</button><button class=\"mini\" data-a=\"slow\" data-v=\"","\">🐢 Nghe chậm</button></div>":"\">🐢 Slow</button></div>","\n     <div class=\"qcount\"><span class=\"eyebrow\">Câu ":"\n     <div class=\"qcount\"><span class=\"eyebrow\">Question ","\">← Thoát</button>":"\">← Exit</button>","Từ mục tiêu: \"":"Target word: \"","\". Câu người học viết: \"":"\". The learner's sentence: \"","\".\nChấm theo rubric: ngữ pháp 4 điểm, dùng từ mục tiêu đúng nghĩa 4 điểm, tự nhiên 2 điểm. Không bắt lỗi văn phong vượt trình độ ":"\".\nGrade with this rubric: grammar 4 points, using the target word with the right meaning 4 points, naturalness 2 points. Don't penalise style beyond level ",".\nTrả JSON {\"score\":0-10,\"corrected\":\"câu đã sửa (giữ nguyên nếu đúng)\",\"errors\":[{\"type\":\"ngữ pháp|dùng từ|chính tả|tự nhiên\",\"fix\":\"phần sửa\",\"explain\":\"giải thích ngắn tiếng Việt\"}],\"note\":\"nhận xét 1 câu tiếng Việt\"}":".\nReturn JSON {\"score\":0-10,\"corrected\":\"corrected sentence (unchanged if already correct)\",\"errors\":[{\"type\":\"grammar|word choice|spelling|naturalness\",\"fix\":\"the fix\",\"explain\":\"short explanation in English\"}],\"note\":\"one-sentence comment in English\"}","Câu chưa dùng từ \"":"The sentence doesn't use \"","Câu dùng đúng từ mục tiêu.":"The sentence uses the target word correctly.","Hãy viết câu đầy đủ hơn: có chủ ngữ, động từ, viết hoa đầu câu và dấu chấm cuối câu.":"Try writing a fuller sentence: a subject, a verb, a capital letter at the start and a full stop at the end.","Câu gốc: \"":"Original: \"","\". Bản dịch tham khảo: \"":"\". Reference translation: \"","\". Bản dịch của người học: \"":"\". Learner's translation: \"","\".\nChấm theo mức độ đúng ý (6 điểm) và đúng ngữ pháp, tự nhiên (4 điểm). Chấp nhận cách dịch khác nếu đúng nghĩa.\nTrả JSON {\"score\":0-10,\"note\":\"nhận xét ngắn tiếng Việt, chỉ ra lỗi nếu có\",\"better\":\"bản dịch tốt hơn dựa trên câu của người học\"}":"\".\nGrade on meaning (6 points) and on grammar and naturalness (4 points). Accept other translations if the meaning is right.\nReturn JSON {\"score\":0-10,\"note\":\"short comment in English, pointing out mistakes if any\",\"better\":\"an improved translation based on the learner's sentence\"}","Bản dịch sát ý.":"The translation captures the meaning.","Bản dịch còn thiếu ý, hãy so với câu tham khảo.":"The translation misses some meaning. Compare it with the reference.","Nghe và chọn nghĩa đúng":"Listen and choose the right meaning","<section class=\"panel\"><h2>Xem lại: Ôn bài cũ":"<section class=\"panel\"><h2>Review: Previous lesson","<p class=\"muted\">Buổi này không có phần ôn bài cũ.</p>":"<p class=\"muted\">This lesson had no review section.</p>","<section class=\"panel\"><h2>Xem lại: Từ vựng & ngữ pháp</h2>\n    <div class=\"revlist\">":"<section class=\"panel\"><h2>Review: Vocabulary & grammar</h2>\n    <div class=\"revlist\">","<section class=\"panel\"><h3>Ngữ pháp: ":"<section class=\"panel\"><h3>Grammar: ","<header class=\"lhead\"><div class=\"row between\"><button class=\"ghost\" data-a=\"exitLesson\">← Lưu & thoát</button>\n     <span class=\"muted small\">":"<header class=\"lhead\"><div class=\"row between\"><button class=\"ghost\" data-a=\"exitLesson\">← Save & exit</button>\n     <span class=\"muted small\">"," · Bước ":" · Step ","Buổi ôn tập":"Review lesson","Buổi ":"Lesson ","\" role=\"button\" tabindex=\"0\" title=\"Xem lại bước ":"\" role=\"button\" tabindex=\"0\" title=\"Review step ","<p class=\"muted small center\">Bấm vào thanh tiến trình để quay lại xem bước đã học.</p>":"<p class=\"muted small center\">Tap the progress bar to go back to a step you've done.</p>","<div class=\"backbar\"><span>👀 Đang xem lại bước ":"<div class=\"backbar\"><span>👀 Reviewing step ","\">Về bước đang học (":"\">Back to current step (","<section class=\"panel\"><h2>Ôn bài cũ</h2><p>Đây là buổi đầu tiên nên chưa có bài cũ để ôn.</p><button class=\"primary\" data-a=\"step\" data-v=\"1\">Sang từ vựng mới</button></section>":"<section class=\"panel\"><h2>Review</h2><p>This is your first lesson, so there's nothing to review yet.</p><button class=\"primary\" data-a=\"step\" data-v=\"1\">Go to new words</button></section>","<section class=\"panel\"><h2>Ôn bài cũ":"<section class=\"panel\"><h2>Review","</h2><p class=\"muted\">Ôn nhanh từ vựng và ngữ pháp buổi trước. Câu sai sẽ được đưa vào flashcard để ôn sớm hơn.</p></section>\n    <section class=\"panel quiz\">":"</h2><p class=\"muted\">A quick review of the last lesson's vocabulary and grammar. Wrong answers go into your flashcards so you review them sooner.</p></section>\n    <section class=\"panel quiz\">","<section class=\"panel\"><div class=\"row between\"><span class=\"tag\">Từ ":"<section class=\"panel\"><div class=\"row between\"><span class=\"tag\">Word ","\">🔊 Nghe câu</button> </p><div>":"\">🔊 Listen</button> </p><div>","<button data-a=\"vprev\">Từ trước</button>":"<button data-a=\"vprev\">Previous word</button>","Từ tiếp theo":"Next word","Xem điểm ngữ pháp":"See the grammar point","<section class=\"panel\"><span class=\"eyebrow\">Ngữ pháp trọng tâm</span><h2>":"<section class=\"panel\"><span class=\"eyebrow\">Key grammar</span><h2>","\n      <div class=\"row\"><button data-a=\"vprev\">Xem lại từ</button><button class=\"primary\" data-a=\"vnext\">Kiểm tra nhanh 4 câu</button></div></section>":"\n      <div class=\"row\"><button data-a=\"vprev\">Back to words</button><button class=\"primary\" data-a=\"vnext\">Quick 4-question check</button></div></section>","<p class=\"muted small\">Điểm ngữ pháp này sẽ được ôn lại ở đầu buổi sau.</p>":"<p class=\"muted small\">This grammar point will be reviewed at the start of your next lesson.</p>","<section class=\"panel\"><h2>Kiểm tra nhanh từ mới</h2><p class=\"muted\">Từ bạn học hôm nay đã được thêm vào flashcard.</p></section><section class=\"panel quiz\">":"<section class=\"panel\"><h2>Quick check: new words</h2><p class=\"muted\">Today's words have been added to your flashcards.</p></section><section class=\"panel quiz\">","Đọc từ":"Say the word","Đọc cả câu":"Say the sentence","<div class=\"speakbox\"><p class=\"eyebrow\">Luyện nghe – nói</p>\n    <div class=\"row\"><button class=\"mini\" data-a=\"slow\" data-v=\"":"<div class=\"speakbox\"><p class=\"eyebrow\">Listening & speaking</p>\n    <div class=\"row\"><button class=\"mini\" data-a=\"slow\" data-v=\"","\">🐢 Nghe chậm câu ví dụ</button>\n    ":"\">🐢 Slow example</button>\n    ","<p class=\"live\" id=\"live\">Hãy đọc to...</p>":"<p class=\"live\" id=\"live\">Read it aloud...</p>","<p class=\"muted small\">Trình duyệt này chưa hỗ trợ nhận giọng nói. Hãy mở app bằng Chrome hoặc Edge.</p>":"<p class=\"muted small\">This browser doesn't support speech recognition yet. Please open the app in Chrome or Edge.</p>","<section class=\"panel\"><h2>Tự đặt câu</h2><p class=\"muted\">Viết một câu tiếng Anh với mỗi từ, càng gần với công việc và cuộc sống của bạn càng tốt. ":"<section class=\"panel\"><h2>Your sentences</h2><p class=\"muted\">Write an English sentence with each word, as close to your work and life as you can. ","AI sẽ sửa lỗi và giải thích.":"AI will correct mistakes and explain.","Đang chấm cơ bản vì AI đang nghỉ.":"Basic grading only, because AI is taking a break.","\">Nghe ví dụ</button></div>\n     <label class=\"sr\" for=\"sent":"\">Hear example</button></div>\n     <label class=\"sr\" for=\"sent","\">Câu với ":"\">Sentence with ","\" placeholder=\"Ví dụ gợi ý: ":"\" placeholder=\"Example: ","Chấm lại":"Re-check","Chấm câu":"Check","<button data-a=\"step\" data-v=\"3\">Sang bước dịch câu →</button>":"<button data-a=\"step\" data-v=\"3\">Go to translation →</button>","<br>Câu sửa: <i>":"<br>Corrected: <i>","Hãy viết ít nhất một câu":"Write at least one sentence","<section class=\"panel\"><h2>Dịch câu</h2><p class=\"muted\">Dịch theo ý, không cần khớp từng chữ. Bấm vào từng từ để xem nghĩa và phiên âm; nút \"Xem bản dịch máy\" dịch cả câu ngay tại đây (nên tự dịch trước rồi mới so).</p></section>\n   ":"<section class=\"panel\"><h2>Translation</h2><p class=\"muted\">Translate the meaning; it doesn't have to match word for word. Tap any word to see its meaning and pronunciation. \"Show machine translation\" translates the whole sentence right here (try it yourself first, then compare).</p></section>\n   ","\n   <section class=\"panel\"><h2>Nghe và chép</h2><p class=\"muted\">Nghe câu tiếng Anh rồi gõ lại. Có thể nghe nhiều lần, nghe chậm nếu cần.</p></section>\n   ":"\n   <section class=\"panel\"><h2>Dictation</h2><p class=\"muted\">Listen to the English sentence and type it. You can listen as many times as you like, slowly if needed.</p></section>\n   ","\">Bản dịch</label><textarea id=\"tr":"\">Translation</label><textarea id=\"tr","\" rows=\"2\" placeholder=\"Bản dịch của bạn\">":"\" rows=\"2\" placeholder=\"Your translation\">","Việt → Anh":"Vietnamese → English","Anh → Việt":"English → Vietnamese","Xem bản dịch máy":"Show machine translation","\">🔊 Nghe câu</button>":"\">🔊 Listen</button>","<br>Tham khảo: <i>":"<br>Reference: <i>","<br>Gợi ý từ câu của bạn: <i>":"<br>Suggested from your sentence: <i>","<section class=\"panel\"><span class=\"tag\">Câu nghe ":"<section class=\"panel\"><span class=\"tag\">Dictation ","\">🐢 Nghe chậm</button></div>\n     <label class=\"sr\" for=\"dc":"\">🐢 Slow</button></div>\n     <label class=\"sr\" for=\"dc","\">Chép lại câu ":"\">Type sentence ","\" rows=\"2\" placeholder=\"Gõ lại câu bạn nghe được\">":"\" rows=\"2\" placeholder=\"Type what you heard\">","Chấm bài":"Check my work","Hãy dịch hoặc chép ít nhất một câu":"Translate or type at least one sentence","<section class=\"panel\"><h2>Kết quả role-play</h2><div class=\"stats\">":"<section class=\"panel\"><h2>Role-play results</h2><div class=\"stats\">","\n      <div class=\"row\"><button data-a=\"rpAgain\">Trò chuyện thêm</button><button class=\"primary\" data-a=\"step\" data-v=\"5\">Xem tổng kết →</button></div></section>":"\n      <div class=\"row\"><button data-a=\"rpAgain\">Keep chatting</button><button class=\"primary\" data-a=\"step\" data-v=\"5\">See summary →</button></div></section>","Trôi chảy":"Fluency","Chính xác":"Accuracy","Hoàn thành nhiệm vụ":"Tasks completed","<div class=\"fb\">Bạn nói: <i>":"<div class=\"fb\">You said: <i>","</i><br>Tự nhiên hơn: <b>":"</i><br>More natural: <b>","<section class=\"panel rp\"><div class=\"row between\"><h2>Role-play</h2><span class=\"muted small\">Bạn: ":"<section class=\"panel rp\"><div class=\"row between\"><h2>Role-play</h2><span class=\"muted small\">You: ","</ul>\n    <p class=\"small\">Từ đã dùng: ":"</ul>\n    <p class=\"small\">Words used: ","\n    <div class=\"row nowrap\"><label class=\"sr\" for=\"rpIn\">Câu trả lời</label><input id=\"rpIn\" data-enter=\"rpSend\" placeholder=\"Trả lời bằng tiếng Anh...\" autocomplete=\"off\" ":"\n    <div class=\"row nowrap\"><label class=\"sr\" for=\"rpIn\">Your reply</label><input id=\"rpIn\" data-enter=\"rpSend\" placeholder=\"Reply in English...\" autocomplete=\"off\" "," aria-label=\"Nói\">":" aria-label=\"Speak\">",">Gửi</button></div>\n    ":">Send</button></div>\n    ","\" data-a=\"autospeak\">🔈 Tự đọc câu của AI</button><button class=\"mini seg ":"\" data-a=\"autospeak\">🔈 Read AI replies aloud</button><button class=\"mini seg ","\" data-a=\"hidetext\">🙈 Ẩn chữ để luyện nghe</button>\n      ":"\" data-a=\"hidetext\">🙈 Hide text for listening practice</button>\n      ","</div>\n    <div class=\"row\"><button data-a=\"rpHint\">Gợi ý câu trả lời</button>":"</div>\n    <div class=\"row\"><button data-a=\"rpHint\">Suggest a reply</button>","<span class=\"muted\">(Chữ đã ẩn, hãy nghe)</span> <button class=\"mini\" data-a=\"reveal\" data-v=\"":"<span class=\"muted\">(Text hidden, listen)</span> <button class=\"mini\" data-a=\"reveal\" data-v=\"","\">Hiện chữ</button>":"\">Show text</button>","<span class=\"fix\">Nên nói: ":"<span class=\"fix\">Better: ","<div class=\"fb\">Gợi ý: <b>":"<div class=\"fb\">Try: <b>","● Dừng":"● Stop","🎤 Nói":"🎤 Speak","<p class=\"live\" id=\"live\">Hãy nói bằng tiếng Anh...</p>":"<p class=\"live\" id=\"live\">Speak in English...</p>","<span class=\"muted\">Bấm 🎤 Nói để trả lời bằng giọng nói.</span>":"<span class=\"muted\">Tap 🎤 Speak to answer by voice.</span>","<span class=\"muted\">Mở bằng Chrome hoặc Edge để nói bằng micro.</span>":"<span class=\"muted\">Open in Chrome or Edge to speak with the mic.</span>","<button class=\"primary\" data-a=\"rpEnd\" id=\"rpEndBtn\">Kết thúc & chấm điểm</button>":"<button class=\"primary\" data-a=\"rpEnd\" id=\"rpEndBtn\">Finish & get feedback</button>","<span class=\"muted small\">Trao đổi ít nhất 3 lượt để kết thúc (":"<span class=\"muted small\">Have at least 3 exchanges to finish (","Role-play: AI là ":"Role-play: the AI is ",", người học là ":", the learner is ",". Nhiệm vụ: ":". Tasks: ",".\nHội thoại: ":".\nConversation: ","\nGợi ý MỘT câu trả lời tiếp theo cho học viên, phù hợp trình độ ":"\nSuggest ONE next reply for the learner, suited to level ",". Trả JSON {\"en\":\"câu tiếng Anh\",\"vi\":\"nghĩa tiếng Việt\"}":". Return JSON {\"en\":\"English sentence\",\"vi\":\"Vietnamese meaning\"}","Học viên: ":"Learner: ",", có dùng từ \"":", using the word \"","Bạn có thể nói thêm về điều đó không?":"Could you tell me more about that?","Đánh giá phần role-play của học viên (trình độ ":"Evaluate the learner's role-play (level ","). AI đóng vai: ":"). The AI played: ",".\nHội thoại (câu có [nói] là học viên nói bằng giọng, được máy chuyển thành chữ nên có thể sai chính tả do nhận dạng; đừng trừ điểm lỗi chính tả ở những câu đó): ":".\nConversation (lines marked [spoken] were said aloud and converted to text by speech recognition, so they may have recognition spelling errors; don't deduct points for spelling in those lines): ","\nTrả JSON {\"fluency\":0-10,\"accuracy\":0-10,\"task_score\":0-10,\"comment_vi\":\"nhận xét 2 câu tiếng Việt\",\"better_phrases\":[{\"you\":\"câu học viên đã nói\",\"better\":\"cách nói tự nhiên hơn\"}] (tối đa 3)}":"\nReturn JSON {\"fluency\":0-10,\"accuracy\":0-10,\"task_score\":0-10,\"comment_vi\":\"2-sentence comment in English\",\"better_phrases\":[{\"you\":\"what the learner said\",\"better\":\"a more natural way to say it\"}] (max 3)}","Học viên [nói]: ":"Learner [spoken]: ","Bạn đã trao đổi ":"You had "," lượt (":" exchanges ("," lượt nói bằng giọng) và dùng ":" spoken) and used "," từ mới.":" new words.","Kiểm tra từ":"Word check","Phát âm":"Pronunciation","Đặt câu":"Sentences","Nghe chép":"Dictation","\n     <div class=\"grow\"><span class=\"eyebrow\">Tổng kết buổi học</span><h2>":"\n     <div class=\"grow\"><span class=\"eyebrow\">Lesson summary</span><h2>","</b><span>điểm trung bình</span></div>\n     <div class=\"bars\">":"</b><span>average score</span></div>\n     <div class=\"bars\">","</div></section>\n   <section class=\"panel\"><h3>Từ vựng hôm nay (":"</div></section>\n   <section class=\"panel\"><h3>Today's words ("," từ, đã vào flashcard)</h3>\n     <div class=\"wordgrid\">":" words, added to flashcards)</h3>\n     <div class=\"wordgrid\">","</div></section>\n   <section class=\"panel\"><h3>Ngữ pháp: ":"</div></section>\n   <section class=\"panel\"><h3>Grammar: "," Bạn có ":" You have "," thẻ flashcard cần ôn.</p>\n     <button class=\"primary\" data-a=\"finishLesson\" data-v=\"":" flashcards to review.</p>\n     <button class=\"primary\" data-a=\"finishLesson\" data-v=\"","\">Hoàn thành buổi học</button></section>":"\">Finish lesson</button></section>","Xuất sắc! Bạn làm rất tốt.":"Excellent! You did really well.","Tốt lắm! Thêm chút nữa là đạt 3 sao.":"Great job! Just a little more for 3 stars.","Khá ổn. Ôn lại phần chưa vững nhé.":"Not bad. Go over the weak spots again.","Đừng nản, buổi sau sẽ tốt hơn!":"Don't give up, next time will be better!","<section class=\"panel\"><h3>Lỗi cần nhớ</h3>":"<section class=\"panel\"><h3>Mistakes to remember</h3>","<b>Buổi tới là bài kiểm tra định kỳ</b> sau 5 buổi học.":"<b>Your next session is a unit test</b> after 5 lessons.","Còn ":""," buổi nữa đến bài kiểm tra định kỳ.":" more lessons until your unit test.","Đã lưu buổi học. Giỏi lắm!":"Lesson saved. Well done!","Nghe và chép lại câu":"Listen and type the sentence","Bạn nắm bài rất tốt. Các buổi tới sẽ khó hơn một chút.":"You've got a solid grasp of this. The next lessons will be a little harder.","Bạn đang theo kịp lộ trình. Giữ nguyên nhịp độ.":"You're keeping up with the course. Keep up the pace.","Hệ thống đã thêm 1 buổi ôn tập vào lộ trình để củng cố các từ còn sai.":"A review lesson has been added to your course to strengthen the words you missed.","</div><span class=\"eyebrow\">Kiểm tra định kỳ · Unit ":"</div><span class=\"eyebrow\">Unit test · Unit ","\n    <div class=\"row\"><button class=\"primary\" data-a=\"go\" data-v=\"home\">Về trang chủ</button>":"\n    <div class=\"row\"><button class=\"primary\" data-a=\"go\" data-v=\"home\">Back to home</button>","Xuất sắc":"Excellent","Đạt":"Passed","Cần ôn thêm":"Needs more review","<h3>Từ cần ôn lại</h3><p>":"<h3>Words to review</h3><p>","<button data-a=\"go\" data-v=\"review\">Ôn flashcard ngay</button>":"<button data-a=\"go\" data-v=\"review\">Review flashcards now</button>","</span><h1>Bạn học tiếng Anh để làm gì?</h1>\n    <p class=\"muted\">Câu trả lời quyết định chủ đề, từ vựng và tình huống role-play trong từng buổi học.</p></section>\n   <section class=\"panel\"><label for=\"sv-name\"><h3>Bạn tên gì?</h3></label><input id=\"sv-name\" data-sv=\"name\" value=\"":"</span><h1>Why are you learning English?</h1>\n    <p class=\"muted\">Your answers shape the topics, vocabulary and role-play situations in every lesson.</p></section>\n   <section class=\"panel\"><label for=\"sv-name\"><h3>What's your name?</h3></label><input id=\"sv-name\" data-sv=\"name\" value=\"","\" placeholder=\"Tên để app xưng hô\">\n    <h3>Mục tiêu chính</h3><div class=\"choices\">":"\" placeholder=\"What should the app call you?\">\n    <h3>Main goal</h3><div class=\"choices\">"," <span class=\"muted normal\">(chọn một hoặc nhiều)</span></h3>\n    <div class=\"chips\">":" <span class=\"muted normal\">(choose one or more)</span></h3>\n    <div class=\"chips\">"," <span class=\"muted normal\">(không bắt buộc)</span></h3></label>\n    <input id=\"sv-int\" data-sv=\"interest\" placeholder=\"":" <span class=\"muted normal\">(optional)</span></h3></label>\n    <input id=\"sv-int\" data-sv=\"interest\" placeholder=\"","\n    <h3>Thời gian học mỗi ngày</h3><div class=\"choices\">":"\n    <h3>Study time per day</h3><div class=\"choices\">","</div>\n    <h3>Kỹ năng muốn cải thiện</h3><div class=\"chips\">":"</div>\n    <h3>Skills to improve</h3><div class=\"chips\">","</div>\n    <label for=\"sv-rm\"><h3>Nhắc tôi học từ lúc</h3></label><input id=\"sv-rm\" type=\"time\" data-sv=\"remind\" value=\"":"</div>\n    <label for=\"sv-rm\"><h3>Remind me to study from</h3></label><input id=\"sv-rm\" type=\"time\" data-sv=\"remind\" value=\"","\" class=\"short\">\n    <p class=\"muted small\">Nếu chưa học, app nhắc mỗi tiếng từ giờ này đến 23:00. Đổi giờ và khoảng cách nhắc trong Cài đặt.</p>\n    <div class=\"row\">":"\" class=\"short\">\n    <p class=\"muted small\">If you haven't studied yet, the app reminds you every hour from this time until 23:00. Change the times and interval in Settings.</p>\n    <div class=\"row\">","Cập nhật mục tiêu":"Update goal","Bước 1/2 · Khảo sát":"Step 1/2 · Survey","Kỳ thi bạn nhắm tới":"Your target exam","Lĩnh vực công việc":"Your field of work","Hình thức đi nước ngoài":"Type of trip abroad","Bạn muốn giao tiếp trong tình huống nào":"Situations where you want to communicate"," <span class=\"muted normal\">(chọn càng đúng, bài học càng sát)</span></h3>\n      ":" <span class=\"muted normal\">(the more precise, the better your lessons fit)</span></h3>\n      ","\n      <div class=\"row\"><button class=\"mini\" data-a=\"svSubAll\">Chọn tất cả</button>":"\n      <div class=\"row\"><button class=\"mini\" data-a=\"svSubAll\">Select all</button>","Kỹ năng cần luyện nhiều nhất":"Skill you need to practise most","Tình huống cụ thể bạn hay gặp":"Specific situations you often face","<span class=\"muted small\">Đã chọn ":"<span class=\"muted small\">Selected "," tình huống</span>":" situations</span>","<label for=\"sv-job\"><h3>Vị trí công việc của bạn</h3></label><input id=\"sv-job\" data-sv=\"job\" value=\"":"<label for=\"sv-job\"><h3>Your job title</h3></label><input id=\"sv-job\" data-sv=\"job\" value=\"","\" placeholder=\"Ví dụ: QA Engineer, nhân viên lễ tân, kế toán\">":"\" placeholder=\"E.g. QA Engineer, receptionist, accountant\">","Điểm mục tiêu và kỹ năng cần nhất":"Target score and most needed skill","Mô tả cụ thể hơn":"Describe it in more detail","<label for=\"sv-dl\"><h3>Ngày thi <span class=\"muted normal\">(để tính độ dài khóa học)</span></h3></label><input id=\"sv-dl\" type=\"date\" data-sv=\"deadline\" value=\"":"<label for=\"sv-dl\"><h3>Exam date <span class=\"muted normal\">(to set the course length)</span></h3></label><input id=\"sv-dl\" type=\"date\" data-sv=\"deadline\" value=\""," phút</button>":" min</button>","<button data-a=\"go\" data-v=\"settings\">Hủy</button>":"<button data-a=\"go\" data-v=\"settings\">Cancel</button>","Chọn ít nhất một lĩnh vực":"Choose at least one field","Lưu mục tiêu":"Save goal","Tiếp tục: kiểm tra trình độ":"Continue: level test","<div class=\"grow\"><h3>🔔 Cho phép app nhắc bạn học mỗi ngày?</h3>\n    <p class=\"small\">Nếu hôm đó bạn chưa học, app sẽ nhắc từ ":"<div class=\"grow\"><h3>🔔 Let the app remind you to study every day?</h3>\n    <p class=\"small\">If you haven't studied that day, the app will remind you from ",". Đổi giờ hoặc tắt bất cứ lúc nào trong Cài đặt.</p>\n    ":". Change the time or turn it off anytime in Settings.</p>\n    ","<p class=\"small muted\">Trên iPhone: bấm <b>Chia sẻ</b> → <b>Thêm vào MH chính</b>, rồi mở app từ biểu tượng ngoài màn hình để bật được thông báo.</p>":"<p class=\"small muted\">On iPhone: tap <b>Share</b> → <b>Add to Home Screen</b>, then open the app from the home screen icon to turn on notifications.</p>","<button class=\"primary\" data-a=\"pushAsk\" data-v=\"1\">Bật thông báo</button>":"<button class=\"primary\" data-a=\"pushAsk\" data-v=\"1\">Turn on notifications</button>","Đã hiểu":"Got it","Để sau":"Later","</div><span class=\"eyebrow\">Bước 2/2 · Kiểm tra trình độ</span><h1>Bài test đầu vào thích ứng</h1>\n    <p>":"</div><span class=\"eyebrow\">Step 2/2 · Level test</span><h1>Adaptive placement test</h1>\n    <p>"," câu, khoảng 5 phút. Trả lời đúng thì câu sau khó hơn, sai thì dễ hơn, để xác định chính xác level của bạn từ A0 đến C1.</p>\n    <p class=\"muted\">Không biết thì chọn \"Tôi không biết\", đừng đoán, kết quả sẽ chính xác hơn.</p>\n    <button class=\"primary\" data-a=\"startPlacement\">Bắt đầu kiểm tra</button>\n    <button class=\"ghost\" data-a=\"skipPlacement\">Tôi mới bắt đầu học, bỏ qua và học từ A0</button></section></div>":" questions, about 5 minutes. Answer correctly and the next question gets harder; get it wrong and it gets easier, to pin down your level from A0 to C1.</p>\n    <p class=\"muted\">If you don't know, choose \"I don't know\" rather than guessing. The result will be more accurate.</p>\n    <button class=\"primary\" data-a=\"startPlacement\">Start the test</button>\n    <button class=\"ghost\" data-a=\"skipPlacement\">I'm a complete beginner, skip and start from A0</button></section></div>","</div><span class=\"eyebrow\">Kết quả kiểm tra</span>\n    <div class=\"levelbadge\">":"</div><span class=\"eyebrow\">Test result</span>\n    <div class=\"levelbadge\">","</h1>\n    <p>Bạn trả lời đúng ":"</h1>\n    <p>You answered "," câu.</p>\n    <div class=\"ladder\">":" questions correctly.</p>\n    <div class=\"ladder\">","</div>\n    <h3>Lộ trình đề xuất</h3>\n    <p><b>":"</div>\n    <h3>Suggested course</h3>\n    <p><b>"," tuần</b>: ":" weeks</b>: "," buổi học (5 buổi mỗi tuần, mỗi buổi ":" lessons (5 a week, "," phút), ":" min each), "," bài kiểm tra định kỳ. Nội dung xoay quanh <b>":" unit tests. Content focuses on <b>","</b>.</p>\n    <button class=\"primary\" data-a=\"confirmPath\">Bắt đầu lộ trình</button><button class=\"ghost\" data-a=\"startPlacement\">Làm lại bài test</button></section></div>":"</b>.</p>\n    <button class=\"primary\" data-a=\"confirmPath\">Start the course</button><button class=\"ghost\" data-a=\"startPlacement\">Retake the test</button></section></div>","<h2>Xong phiên ôn tập</h2><div class=\"scorebig\"><b>":"<h2>Review session complete</h2><div class=\"scorebig\"><b>","</b><span>câu đúng</span></div>\n      <div class=\"row center\"><button class=\"primary\" data-a=\"go\" data-v=\"review\">Về trang Ôn tập</button></div></section></div>":"</b><span>correct</span></div>\n      <div class=\"row center\"><button class=\"primary\" data-a=\"go\" data-v=\"review\">Back to Review</button></div></section></div>","Kiểm tra trình độ":"Level test","Kiểm tra định kỳ · Unit ":"Unit test · Unit ","Ôn tập flashcard":"Flashcard review","<div class=\"center\"><button class=\"ghost\" data-a=\"pick\" data-v=\"-1\">Tôi không biết</button></div>":"<div class=\"center\"><button class=\"ghost\" data-a=\"pick\" data-v=\"-1\">I don't know</button></div>","Hôm nay bạn đã học rồi, tuyệt vời! Ôn thêm vài thẻ flashcard cho nhớ lâu nhé.":"You've already studied today, awesome! Review a few flashcards to make it stick.","Chào buổi sáng! Một buổi học ngắn giúp cả ngày nói tiếng Anh tự tin hơn.":"Good morning! A short lesson helps you speak English more confidently all day.","Nghỉ trưa học một chút nhé, chỉ cần ":"Take a little study break at lunch, it only takes "," phút thôi.":" minutes.","Buổi chiều vui vẻ! Bài học hôm nay đang chờ bạn.":"Good afternoon! Today's lesson is waiting for you.","Buổi tối thư thả là lúc học hiệu quả nhất. Bắt đầu thôi!":"A relaxed evening is the best time to learn. Let's go!","<div class=\"grow\"><p class=\"eyebrow\">Nhãn dán mới</p><h2>Bạn vừa mở khóa ":"<div class=\"grow\"><p class=\"eyebrow\">New stickers</p><h2>You just unlocked "," nhãn dán!</h2></div></div>\n     <div class=\"badge-row\">":" stickers!</h2></div></div>\n     <div class=\"badge-row\">","</div><div class=\"row\"><button class=\"primary\" data-a=\"closeCelebrate\">Tuyệt quá!</button><a href=\"#\" class=\"link\" data-a=\"go\" data-v=\"history\">Xem bộ sưu tập →</a></div></section>":"</div><div class=\"row\"><button class=\"primary\" data-a=\"closeCelebrate\">Awesome!</button><a href=\"#\" class=\"link\" data-a=\"go\" data-v=\"history\">See collection →</a></div></section>","</p><h1>Chào ":"</p><h1>Hi "," ngày liên tiếp</span><span>":" day streak</span><span>"," Khóa ":" Course "," Tuần ":" Week ","</b><span>ngày học liên tiếp</span></div>\n      <div class=\"tile hue-mint\">":"</b><span>day streak</span></div>\n      <div class=\"tile hue-mint\">","</b><span>từ đã học</span></div>\n      <div class=\"tile hue-sun\">":"</b><span>words learned</span></div>\n      <div class=\"tile hue-sun\">","</b><span>điểm TB 5 buổi</span></div>\n      <button class=\"tile hue-sky\" data-a=\"":"</b><span>avg. of last 5 lessons</span></div>\n      <button class=\"tile hue-sky\" data-a=\""," Hành trình khóa học</h3><a href=\"#\" class=\"link\" data-a=\"go\" data-v=\"path\">Xem lộ trình →</a></div>\n    <div class=\"track\"><div class=\"track-fill\" style=\"width:":" Course journey</h3><a href=\"#\" class=\"link\" data-a=\"go\" data-v=\"path\">See course →</a></div>\n    <div class=\"track\"><div class=\"track-fill\" style=\"width:"," buổi · ":" lessons · "," bài kiểm tra · cờ là các bài kiểm tra định kỳ</p></section></div>":" tests · flags mark the unit tests</p></section></div>","bạn":"there","<div><b>Đã đến giờ học (":"<div><b>Time to study (",")</b><br><span class=\"muted\">Bạn chưa học hôm nay. Chỉ cần ":")</b><br><span class=\"muted\">You haven't studied today. Just "," phút để giữ chuỗi ngày học.</span></div></section>":" minutes keeps your streak going.</span></div></section>","Kiểm tra định kỳ":"Unit test","Đang ở bước ":"Currently on step ","<span class=\"eyebrow\">Đến hạn</span><h2>Kiểm tra định kỳ Unit ":"<span class=\"eyebrow\">Due</span><h2>Unit test ","</h2>\n        <p class=\"muted\">Bạn đã xong 5 buổi học. Bài kiểm tra gồm từ vựng, ngữ pháp, chính tả, dịch, nghe và nói, khoảng 15 phút.</p>\n        <button class=\"primary big\" data-a=\"startUnit\">Làm bài kiểm tra</button>":"</h2>\n        <p class=\"muted\">You've finished 5 lessons. The test covers vocabulary, grammar, spelling, translation, listening and speaking, about 15 minutes.</p>\n        <button class=\"primary big\" data-a=\"startUnit\">Take the test</button>","Bạn đã học hôm nay":"You've studied today","Buổi học hôm nay":"Today's lesson","<p class=\"small\"><span class=\"tag good\">Đã soạn xong</span> ":"<p class=\"small\"><span class=\"tag good\">Ready</span> ","Bài soạn riêng theo mục tiêu của bạn":"Made for your goals","Bài mẫu trình độ ":"Sample lesson, level "," · ôn lại":" · review","<p class=\"small muted\"><span class=\"spin\"></span> AI đang soạn sẵn buổi này...</p>":"<p class=\"small muted\"><span class=\"spin\"></span> Preparing this lesson...</p>","Học tiếp":"Continue","Học thêm buổi tiếp theo":"Do the next lesson","Bắt đầu buổi học":"Start lesson","thẻ cần ôn · bấm để ôn":"cards to review · tap to review","thẻ cần ôn":"cards to review","%\" title=\"Kiểm tra Unit ":"%\" title=\"Unit test ","<span class=\"eyebrow\">Hoàn thành khóa học</span><div class=\"levelbadge\">":"<span class=\"eyebrow\">Course complete</span><div class=\"levelbadge\">","</div>\n    <h1>Chúc mừng ":"</div>\n    <h1>Congratulations ","!</h1><p>Bạn đã hoàn thành ":"!</h1><p>You've completed "," buổi học và ":" lessons and "," bài kiểm tra của khóa ":" tests in the ","</b><span>điểm TB buổi học</span></div><div class=\"stat\"><b>":"</b><span>avg. lesson score</span></div><div class=\"stat\"><b>","%</b><span>điểm TB kiểm tra</span></div><div class=\"stat\"><b>":"%</b><span>avg. test score</span></div><div class=\"stat\"><b>","</b><span>từ đã học</span></div></div>\n    ":"</b><span>words learned</span></div></div>\n    ","<button class=\"primary big\" data-a=\"nextCourse\">Bắt đầu khóa ":"<button class=\"primary big\" data-a=\"nextCourse\">Start the course ","<button class=\"primary big\" data-a=\"nextCourse\">Tiếp tục nâng cao trình độ C1</button>":"<button class=\"primary big\" data-a=\"nextCourse\">Keep advancing at C1</button>","Chưa mở":"Locked","Buổi tiếp theo":"Next lesson","<span class=\"muted small\">Dự kiến · ":"<span class=\"muted small\">Planned · "," điểm":" pts"," · ôn tập":" · review","<button class=\"mini primary\" data-a=\"startLesson\">Học</button>":"<button class=\"mini primary\" data-a=\"startLesson\">Study</button>"," điểm</span></div><em>":" pts</span></div><em>","/5 buổi</span></div>\n      <ol class=\"sessions\">":"/5 lessons</span></div>\n      <ol class=\"sessions\">","\"><span class=\"num\">✓</span><div><b>Kiểm tra định kỳ Unit ":"\"><span class=\"num\">✓</span><div><b>Unit test ","<button class=\"mini primary\" data-a=\"startUnit\">Làm bài</button>":"<button class=\"mini primary\" data-a=\"startUnit\">Take test</button>","<div><p class=\"eyebrow\">Lộ trình của bạn</p><h1>":"<div><p class=\"eyebrow\">Your course</p><h1>"," tuần · ":" weeks · "," buổi · bắt đầu ":" lessons · started ","</p><p class=\"muted small\">Các buổi chưa học hiện bài dự kiến trong kho bài mẫu ":"</p><p class=\"muted small\">Upcoming lessons show the planned sample lesson for level ",". Khi AI hoạt động, bài sẽ được soạn riêng theo lĩnh vực của bạn ở cùng trình độ.</p></div>\n    <div class=\"ladder\">":". When AI is available, each lesson is tailored to your field at the same level.</p></div>\n    <div class=\"ladder\">","Đến hạn (":"Due (","Từ khó (":"Hard words (","Tất cả (":"All (","<h2>Chưa có flashcard</h2><p class=\"muted\">Từ vựng trong mỗi buổi học và từ bạn tra sẽ tự động được thêm vào đây.</p></section></div>":"<h2>No flashcards yet</h2><p class=\"muted\">Words from each lesson and words you look up are added here automatically.</p></section></div>","<input id=\"rq\" data-live=\"rq\" placeholder=\"Tìm từ hoặc nghĩa...\" value=\"":"<input id=\"rq\" data-live=\"rq\" placeholder=\"Search words or meanings...\" value=\"","\">\n      <div class=\"table-wrap\"><table class=\"cards\"><thead><tr><th>Từ</th><th>Nghĩa</th><th>Trạng thái</th><th>Ôn lại</th><th></th></tr></thead><tbody>\n      ":"\">\n      <div class=\"table-wrap\"><table class=\"cards\"><thead><tr><th>Word</th><th>Meaning</th><th>Status</th><th>Next review</th><th></th></tr></thead><tbody>\n      ","\" aria-label=\"Xóa ":"\" aria-label=\"Delete ","\">Xóa</button></td></tr>":"\">Delete</button></td></tr>","Đến hạn":"Due"," thẻ. Chọn cách ôn:</p><div class=\"modes\">\n      <button class=\"mode\" data-a=\"startFlip\" data-v=\"":" cards. Choose how to review:</p><div class=\"modes\">\n      <button class=\"mode\" data-a=\"startFlip\" data-v=\"","\"><b>Lật thẻ</b><span>Tự đánh giá Quên / Khó / Nhớ / Dễ</span></button>\n      <button class=\"mode\" data-a=\"startRQuiz\" data-v=\"":"\"><b>Flip cards</b><span>Rate yourself: Again / Hard / Good / Easy</span></button>\n      <button class=\"mode\" data-a=\"startRQuiz\" data-v=\"",":mcq\"><b>Trắc nghiệm</b><span>Chọn nghĩa đúng của từ</span></button>\n      <button class=\"mode\" data-a=\"startRQuiz\" data-v=\"":":mcq\"><b>Multiple choice</b><span>Pick the right meaning</span></button>\n      <button class=\"mode\" data-a=\"startRQuiz\" data-v=\"",":type\"><b>Gõ từ</b><span>Nhìn nghĩa, viết lại từ tiếng Anh</span></button>\n      <button class=\"mode\" data-a=\"startRQuiz\" data-v=\"":":type\"><b>Type it</b><span>See the meaning, write the English word</span></button>\n      <button class=\"mode\" data-a=\"startRQuiz\" data-v=\"",":listen\"><b>Nghe & gõ</b><span>Nghe phát âm, gõ lại từ</span></button>\n      ":":listen\"><b>Listen & type</b><span>Hear the word, type it</span></button>\n      ",":speak\"><b>Đọc to</b><span>Đọc từ và câu ví dụ, máy chấm phát âm</span></button>":":speak\"><b>Read aloud</b><span>Say the word and example; get a pronunciation score</span></button>","Bạn đã ôn hết thẻ đến hạn. Quay lại sau nhé.":"You've reviewed all due cards. Come back later!","Chưa có từ nào bị quên nhiều lần.":"No words you keep forgetting yet.","<button data-a=\"startFlip\" data-v=\"all\">Ôn tự do 20 thẻ bất kỳ</button>":"<button data-a=\"startFlip\" data-v=\"all\">Free review: 20 random cards</button>","<div><p class=\"eyebrow\">Ôn tập</p><h1>Flashcard của bạn</h1><p class=\"muted\">Lặp lại ngắt quãng: từ bạn nhớ tốt sẽ xuất hiện thưa dần (1, 3, 7, 16... ngày), từ hay quên sẽ quay lại sớm.</p></div></section>\n   <section class=\"panel\"><div class=\"stats\">":"<div><p class=\"eyebrow\">Review</p><h1>Your flashcards</h1><p class=\"muted\">Spaced repetition: words you know well show up less and less often (1, 3, 7, 16... days), while words you forget come back sooner.</p></div></section>\n   <section class=\"panel\"><div class=\"stats\">","<div class=\"wrap narrow\"><section class=\"panel center\"><h2>Xong phiên ôn tập</h2><p>Bạn đã ôn ":"<div class=\"wrap narrow\"><section class=\"panel center\"><h2>Review session complete</h2><p>You reviewed "," thẻ.</p><button class=\"primary\" data-a=\"go\" data-v=\"review\">Về trang Ôn tập</button></section></div>":" cards.</p><button class=\"primary\" data-a=\"go\" data-v=\"review\">Back to Review</button></section></div>","<div class=\"wrap narrow\"><div class=\"row between\"><button class=\"ghost\" data-a=\"go\" data-v=\"review\">← Thoát</button><span class=\"eyebrow\">Thẻ ":"<div class=\"wrap narrow\"><div class=\"row between\"><button class=\"ghost\" data-a=\"go\" data-v=\"review\">← Exit</button><span class=\"eyebrow\">Card ","\" data-a=\"flip\" tabindex=\"0\" role=\"button\" aria-label=\"Lật thẻ\">\n    ":"\" data-a=\"flip\" tabindex=\"0\" role=\"button\" aria-label=\"Flip card\">\n    ","<p class=\"muted\">Câu của bạn: ":"<p class=\"muted\">Your sentence: ","</div><p class=\"muted\">Bấm để xem nghĩa (phím Space)</p>":"</div><p class=\"muted\">Tap to see the meaning (Space key)</p>","Quên":"Again","<1 phút":"<1 min","Khó":"Hard","Nhớ":"Good","Dễ":"Easy","</b><span class=\"small muted\">phím ":"</b><span class=\"small muted\">key ","\">🔊 Nghe</button><button class=\"primary\" data-a=\"flip\">Xem nghĩa</button></div>":"\">🔊 Listen</button><button class=\"primary\" data-a=\"flip\">Show meaning</button></div>","<div><p class=\"eyebrow\">Lịch sử</p><h1>Kết quả học tập</h1>\n    <p class=\"muted\">":"<div><p class=\"eyebrow\">History</p><h1>Your progress</h1>\n    <p class=\"muted\">"," buổi học · ":" lessons · "," bài kiểm tra · tổng ":" tests · "," phút</p></div></section>\n   <section class=\"panel\"><div class=\"row between\"><h3>Bộ sưu tập nhãn dán</h3><span class=\"tag\">":" min in total</p></div></section>\n   <section class=\"panel\"><div class=\"row between\"><h3>Sticker collection</h3><span class=\"tag\">","\n   <section class=\"panel\"><h3>Hành trình level</h3><ul class=\"timeline\">\n     ":"\n   <section class=\"panel\"><h3>Level journey</h3><ul class=\"timeline\">\n     ","</ul></section>\n   <section class=\"panel\"><h3>Bài kiểm tra định kỳ</h3>":"</ul></section>\n   <section class=\"panel\"><h3>Unit tests</h3>","</section>\n   <section class=\"panel\"><h3>Các buổi học</h3>":"</section>\n   <section class=\"panel\"><h3>Lessons</h3>","<section class=\"panel\"><h3>Điểm 20 buổi gần nhất</h3><div class=\"spark\">":"<section class=\"panel\"><h3>Scores from your last 20 lessons</h3><div class=\"spark\">","</b> Test đầu vào · ":"</b> Placement test · ","</b> Hoàn thành khóa ":"</b> Completed the course ","</b> Khóa hiện tại, bắt đầu ":"</b> Current course, started ","<p class=\"muted\">Bài kiểm tra đầu tiên mở sau 5 buổi học.</p>":"<p class=\"muted\">Your first unit test unlocks after 5 lessons.</p>"," phút":" min","Ôn bài":"Review","<p class=\"muted\">Chưa có buổi học nào.</p>":"<p class=\"muted\">No lessons yet.</p>","Mục tiêu học":"Learning goal","Nhắc học & thông báo":"Reminders & notifications","Giao diện & ngày sinh":"Appearance & birthday","Giọng đọc & micro":"Voice & microphone","Hướng dẫn sử dụng":"How to use SEED","Gửi phản hồi":"Send feedback","Về SEED & người sáng lập":"About SEED & the founder","Dữ liệu":"Data","<div class=\"wrap narrow\"><div class=\"sethead\"><button class=\"mini ghost\" data-a=\"setPage\" data-v=\"\">‹ Cài đặt</button><h2>":"<div class=\"wrap narrow\"><div class=\"sethead\"><button class=\"mini ghost\" data-a=\"setPage\" data-v=\"\">‹ Settings</button><h2>","<button class=\"setitem\" data-a=\"logout\"><span class=\"si-ic\">🚪</span><span class=\"si-t danger-t\">Đăng xuất</span><span class=\"si-v\"></span><span class=\"si-go\"></span></button></div>\n   <p class=\"muted small center\">SEED · phiên bản ":"<button class=\"setitem\" data-a=\"logout\"><span class=\"si-ic\">🚪</span><span class=\"si-t danger-t\">Log out</span><span class=\"si-v\"></span><span class=\"si-go\"></span></button></div>\n   <p class=\"muted small center\">SEED · version "," · <a href=\"/privacy\">Quyền riêng tư</a></p></div>":" · <a href=\"/privacy\">Privacy</a></p></div>","Chưa đặt tên":"No name yet","Chưa bật trên máy này":"Not on for this device","Đang tắt":"Off","Mặc định":"Default"," phút/ngày · Trình độ ":" min/day · Level "," · Khóa ":" · Course ","</p><button class=\"primary\" data-a=\"editGoal\">Sửa mục tiêu</button></section>":"</p><button class=\"primary\" data-a=\"editGoal\">Edit goal</button></section>","<section class=\"panel\">\n    <div class=\"row between\"><b>Nhắc khi hôm đó chưa học</b><button class=\"mini seg ":"<section class=\"panel\">\n    <div class=\"row between\"><b>Remind me if I haven't studied</b><button class=\"mini seg ","</section>\n   <section class=\"panel\"><b>Thiết bị này</b>\n    ":"</section>\n   <section class=\"panel\"><b>This device</b>\n    ","Bật":"On","Tắt":"Off","<div class=\"row timerow\"><div class=\"tfield\"><label for=\"remindSet\">Từ</label><input id=\"remindSet\" type=\"time\" value=\"":"<div class=\"row timerow\"><div class=\"tfield\"><label for=\"remindSet\">From</label><input id=\"remindSet\" type=\"time\" value=\"","\" data-change=\"setRemind\"></div>\n     <div class=\"tfield\"><label for=\"remindEnd\">Đến</label><input id=\"remindEnd\" type=\"time\" value=\"":"\" data-change=\"setRemind\"></div>\n     <div class=\"tfield\"><label for=\"remindEnd\">Until</label><input id=\"remindEnd\" type=\"time\" value=\"","\" data-change=\"setRemindEnd\"></div></div>\n    <div class=\"setrow\"><span>Nhắc mỗi</span>":"\" data-change=\"setRemindEnd\"></div></div>\n    <div class=\"setrow\"><span>Remind every</span>","</div>\n    <div class=\"setrow\"><span>Giọng nhắc</span>":"</div>\n    <div class=\"setrow\"><span>Reminder style</span>","30 phút":"30 min","1 giờ":"1 hour","2 giờ":"2 hours","3 giờ":"3 hours","😈 Lầy lội":"😈 Cheeky","🙂 Nhẹ nhàng":"🙂 Gentle","<div class=\"row\"><span class=\"tag good\">Đang nhận thông báo</span><button class=\"mini\" data-a=\"pushTest\">Gửi thử</button><button class=\"mini\" data-a=\"pushOff\">Tắt</button></div>":"<div class=\"row\"><span class=\"tag good\">Notifications on</span><button class=\"mini\" data-a=\"pushTest\">Send a test</button><button class=\"mini\" data-a=\"pushOff\">Turn off</button></div>","<p class=\"small\">Trên iPhone, hãy thêm app vào màn hình chính trước (xem Hướng dẫn sử dụng).</p>":"<p class=\"small\">On iPhone, add the app to your Home Screen first (see How to use SEED).</p>","<button class=\"primary\" data-a=\"pushOn\">Bật thông báo</button>":"<button class=\"primary\" data-a=\"pushOn\">Turn on notifications</button>","<section class=\"panel\">\n    <div class=\"tfield\"><label for=\"bday\">Ngày sinh</label><input id=\"bday\" type=\"date\" value=\"":"<section class=\"panel\">\n    <div class=\"tfield\"><label for=\"bday\">Birthday</label><input id=\"bday\" type=\"date\" value=\"","\" data-change=\"setBday\"></div>\n    <label for=\"festSel\">Chủ đề</label><select id=\"festSel\" data-change=\"setFest\"><option value=\"auto\" ":"\" data-change=\"setBday\"></div>\n    <label for=\"festSel\">Theme</label><select id=\"festSel\" data-change=\"setFest\"><option value=\"auto\" ",">Tự động theo mùa & ngày lễ</option><option value=\"off\" ":">Automatic (seasons & holidays)</option><option value=\"off\" ",">Mặc định</option>\n      ":">Default</option>\n      ","</select>\n    <div class=\"setrow\"><span>Hiệu ứng rơi</span>":"</select>\n    <div class=\"setrow\"><span>Falling effects</span>","</div>\n    <div class=\"setrow\"><span>Cỡ chữ</span>":"</div>\n    <div class=\"setrow\"><span>Text size</span>","</div>\n    <div class=\"setrow\"><span>Chế độ</span>":"</div>\n    <div class=\"setrow\"><span>Mode</span>",">Xem thử: ":">Preview: ","Nhỏ":"Small","Vừa":"Medium","Lớn":"Large","Theo máy":"System","Sáng":"Light","Tối":"Dark","<section class=\"panel\">\n    <label for=\"voiceSel\">Giọng đọc</label><select id=\"voiceSel\" data-change=\"setVoice\">":"<section class=\"panel\">\n    <label for=\"voiceSel\">Voice</label><select id=\"voiceSel\" data-change=\"setVoice\">","</select>\n    <div class=\"setrow\"><span>Tốc độ</span>":"</select>\n    <div class=\"setrow\"><span>Speed</span>","</div>\n    <div class=\"row\"><button data-a=\"speak\" data-v=\"Hello! This is how I sound. Let's practise English together.\">🔊 Nghe thử</button><button class=\"mic ":"</div>\n    <div class=\"row\"><button data-a=\"speak\" data-v=\"Hello! This is how I sound. Let's practise English together.\">🔊 Preview</button><button class=\"mic ","<option>Giọng mặc định</option>":"<option>Default voice</option>","Rất chậm":"Very slow","Chậm":"Slow","● Đang nghe...":"● Listening...","🎤 Thử micro":"🎤 Test microphone","<p class=\"live\" id=\"live\">Hãy nói một câu tiếng Anh...</p>":"<p class=\"live\" id=\"live\">Say a sentence in English...</p>","<section class=\"panel\">\n    <p>Bạn thấy SEED thế nào? Mọi góp ý đều được đọc và dùng để làm app tốt hơn 💚</p>\n    <div class=\"setrow\"><span>Loại</span>":"<section class=\"panel\">\n    <p>How are you finding SEED? Every piece of feedback is read and used to make the app better 💚</p>\n    <div class=\"setrow\"><span>Type</span>","</div>\n    <div class=\"setrow\"><span>Đánh giá</span><div class=\"row stars\">":"</div>\n    <div class=\"setrow\"><span>Rating</span><div class=\"row stars\">","</div></div>\n    <label for=\"fbMsg\">Nội dung</label><textarea id=\"fbMsg\" rows=\"5\" maxlength=\"2000\" placeholder=\"Bạn thích điều gì, gặp lỗi ở đâu, muốn có thêm tính năng gì...\"></textarea>\n    <button class=\"primary\" data-a=\"fbSend\" ":"</div></div>\n    <label for=\"fbMsg\">Message</label><textarea id=\"fbMsg\" rows=\"5\" maxlength=\"2000\" placeholder=\"What do you like, what went wrong, what would you like to see...\"></textarea>\n    <button class=\"primary\" data-a=\"fbSend\" ","💡 Góp ý":"💡 Idea","🐞 Báo lỗi":"🐞 Bug","Khác":"Other","Đang gửi...":"Sending...","<section class=\"panel about center\">\n    <img src=\"/logo-full.png?v=6\" alt=\"SEED\" width=\"240\" height=\"240\" class=\"logo-lg\"><h2>SEED</h2><p class=\"muted\">Học tiếng Anh theo đúng mục tiêu của bạn, mỗi ngày một chút.</p></section>\n   <section class=\"panel founder\"><p class=\"eyebrow\">Người sáng lập</p><h3>":"<section class=\"panel about center\">\n    <img src=\"/logo-full.png?v=6\" alt=\"SEED\" width=\"240\" height=\"240\" class=\"logo-lg\"><h2>SEED</h2><p class=\"muted\">Learn English around your own goals, a little every day.</p></section>\n   <section class=\"panel founder\"><p class=\"eyebrow\">Founder</p><h3>","”</blockquote></section>\n   <section class=\"panel\"><p class=\"small muted\">Phiên bản ":"”</blockquote></section>\n   <section class=\"panel\"><p class=\"small muted\">Version "," · Sinh nhật SEED cùng ngày với người sáng lập (18/3).<br><a href=\"/privacy\">Chính sách quyền riêng tư</a> · <a href=\"/data-deletion\">Xoá dữ liệu</a></p></section>":" · SEED shares its birthday with its founder (18 March).<br><a href=\"/privacy\">Privacy policy</a> · <a href=\"/data-deletion\">Delete your data</a></p></section>","<section class=\"panel\"><p>Xoá toàn bộ tiến độ học để bắt đầu lại từ đầu. Không thể hoàn tác.</p><button class=\"danger\" data-a=\"reset\" id=\"resetBtn\">Xóa tiến độ và làm lại</button></section>":"<section class=\"panel\"><p>Erase all your learning progress and start over. This can't be undone.</p><button class=\"danger\" data-a=\"reset\" id=\"resetBtn\">Erase progress and start over</button></section>","Một người yêu cái đẹp: yêu thiên nhiên, cây cối, những bức tranh và từng nốt nhạc, và yêu con người. SEED được tạo ra từ mong muốn giúp mỗi người học tiếng Anh nhẹ nhàng như chăm một mầm cây: mỗi ngày tưới một chút, rồi đến lúc sẽ nở hoa.":"Someone who loves beautiful things: nature, plants, paintings, every note of music, and people. SEED grew from a wish to make learning English feel as gentle as tending a seedling: a little water every day, and one day it blooms.","🌿 Thiên nhiên":"🌿 Nature","🎨 Hội hoạ":"🎨 Painting","🎵 Âm nhạc":"🎵 Music","🎻 Nhạc cụ":"🎻 Instruments","💚 Con người":"💚 People","Ngôn ngữ cũng như âm nhạc: không cần hoàn hảo, chỉ cần mỗi ngày được cất lên.":"Language is like music: it doesn't have to be perfect, it just needs to be heard every day.","Một buổi học gồm những gì?":"What's in a lesson?","6 bước: Ôn bài cũ → Từ vựng mới → Tự đặt câu → Dịch câu → Role-play với AI → Tổng kết. Bấm thanh tiến trình trên đầu bài để quay lại xem bước đã học. Cứ 5 buổi có một bài kiểm tra ngắn.":"6 steps: Review → New words → Your sentences → Translation → Role-play with AI → Summary. Tap the progress bar at the top to go back to a step you've done. Every 5 lessons there's a short unit test.","Tra nghĩa và nghe phát âm":"Look up words and hear pronunciation","Bấm vào bất kỳ từ tiếng Anh nào để xem nghĩa, từ loại, phiên âm IPA và ví dụ. Bấm 🔊 để nghe, 🌐 Dịch để dịch cả câu ngay trong trang. Đổi giọng đọc và tốc độ trong Cài đặt → Giọng đọc & micro.":"Tap any English word to see its meaning, part of speech, IPA and examples. Tap 🔊 to listen, or 🌐 Translate to translate the whole sentence right on the page. Change the voice and speed in Settings → Voice & microphone.","Luyện nói bằng micro":"Speaking practice with the mic","Bấm 🎤 rồi nói. App chấm phát âm theo từng từ. Nhận giọng nói chạy tốt nhất trên Chrome hoặc Edge, cần có Internet.":"Tap 🎤 and speak. The app scores your pronunciation word by word. Speech recognition works best in Chrome or Edge and needs an internet connection.","Flashcard và ôn tập":"Flashcards and review","Từ đã học tự vào flashcard. App nhắc ôn đúng lúc bạn sắp quên (lặp lại ngắt quãng). Vào tab Ôn tập để lật thẻ hoặc làm bài ôn.":"Words you learn go into your flashcards automatically. The app brings them back just before you're likely to forget (spaced repetition). Open the Review tab to flip cards or take a review quiz.","Bật thông báo nhắc học":"Turning on study reminders","Cài đặt → Nhắc học & thông báo → Bật thông báo. Mỗi thiết bị bật riêng một lần. Học xong (hoặc đã vào học, ôn flashcard) trong ngày thì app không nhắc nữa.":"Settings → Reminders & notifications → Turn on notifications. Each device needs to be turned on once. Once you've studied that day (finished a lesson, started one, or reviewed flashcards), the app stops reminding you.","Dùng trên iPhone":"Using SEED on iPhone","Mở bằng Safari → nút Chia sẻ → Thêm vào MH chính → mở app từ biểu tượng ngoài màn hình. Sau đó mới bật được thông báo (iOS 16.4 trở lên).":"Open in Safari → Share → Add to Home Screen → open the app from its home screen icon. Then you can turn on notifications (iOS 16.4 or later).","Cộng đồng: trò chuyện ẩn danh":"Community: anonymous chat","Phòng chung theo trình độ để hỏi đáp; Ghép đôi 1-1 để luyện nói, kể cả khi người kia đang offline. Mọi người chỉ thấy biệt danh. Không chia sẻ số điện thoại, mạng xã hội hay đường link (app sẽ chặn).":"Level-based rooms for questions and answers; 1-on-1 matching for speaking practice, even when the other person is offline. Everyone only sees nicknames. Don't share phone numbers, social media or links (the app blocks them).","Giữ cuộc trò chuyện, thu hồi, chặn":"Keeping chats, unsending, blocking","⭐ Giữ: khi cả hai cùng bấm, hai bạn thành bạn chat và tin nhắn không bị xoá (cuộc trò chuyện thường tự xoá sau 30 ngày). Bấm ⋯ ở tin của mình để thu hồi. Bấm ⋯ trên đầu cuộc trò chuyện để tắt thông báo, kết thúc hoặc chặn. Bỏ chặn: Ghép đôi 1-1 → Người đã chặn.":"⭐ Keep: when you both tap it, you become chat buddies and your messages are kept (other chats are deleted after 30 days). Tap ⋯ on your own message to unsend it. Tap ⋯ at the top of a chat to mute, end or block. To unblock: 1-on-1 → Blocked people.","Giao diện theo mùa và sinh nhật":"Seasonal themes and birthdays","Giao diện tự đổi theo 4 mùa và các ngày lễ (Tết, 14/2, 8/3, 18/3, 1/6, Trung thu, 14/10, 20/11, Giáng Sinh…). Nhập ngày sinh để nhận lời chúc riêng đúng ngày sinh nhật.":"The look changes with the four seasons and holidays (Lunar New Year, 14 Feb, 8 Mar, 18 Mar, 1 Jun, Mid-Autumn, 14 Oct, 20 Nov, Christmas…). Add your birthday to get a special greeting on the day.","Đổi tài khoản":"Switching accounts","Cài đặt → Đăng xuất, rồi chọn tài khoản khác khi đăng nhập lại. Tiến độ được lưu theo tài khoản và đồng bộ giữa các thiết bị.":"Settings → Log out, then choose another account when you log back in. Progress is saved per account and synced across devices.","Tra từ ":"Look up ","Tra từ tiếng Anh \"":"Look up the English word \"","\" trong ngữ cảnh: \"":"\" in this context: \"","\".\nTrả JSON {\"headword\":\"dạng gốc\",\"ipa\":\"phiên âm IPA\",\"pos\":\"từ loại tiếng Việt (Danh từ, Động từ, Tính từ...)\",\"meaning\":\"nghĩa tiếng Việt đúng ngữ cảnh; thêm 1-2 nghĩa phổ biến khác nếu có\",\n\"examples\":[{\"en\":\"câu ví dụ\",\"vi\":\"dịch\"}] (3 câu, ưu tiên lĩnh vực của người học),\"collocations\":[\"cụm hay đi kèm\"] (tối đa 3)}":"\".\nReturn JSON {\"headword\":\"base form\",\"ipa\":\"IPA transcription\",\"pos\":\"part of speech in English (noun, verb, adjective...)\",\"meaning\":\"Vietnamese meaning that fits the context; add 1-2 other common meanings if any\",\n\"examples\":[{\"en\":\"example sentence\",\"vi\":\"Vietnamese translation\"}] (3 sentences, preferably from the learner's field),\"collocations\":[\"common collocations\"] (max 3)}","</div></div>\n     <button class=\"mini\" data-a=\"closePop\" aria-label=\"Đóng\">✕</button></div>\n   ":"</div></div>\n     <button class=\"mini\" data-a=\"closePop\" aria-label=\"Close\">✕</button></div>\n   ","\" data-sl=\"en\">🌐 Dịch</button></div><div class=\"pop-tr\"></div>":"\" data-sl=\"en\">🌐 Translate</button></div><div class=\"pop-tr\"></div>"," <span class=\"muted small\">(định nghĩa tiếng Anh)</span>":" <span class=\"muted small\">(English definition)</span>","<p class=\"muted small\">Hay đi với: ":"<p class=\"muted small\">Often used with: ","<p class=\"muted small\"><span class=\"spin\"></span> Đang tra...</p>":"<p class=\"muted small\"><span class=\"spin\"></span> Looking up...</p>","<p class=\"muted\">Chưa tra được từ này":"<p class=\"muted\">Couldn't look up this word",". Thử nút Dịch hoặc Cambridge bên dưới.</p>":". Try Translate or Cambridge below.</p>"," vì AI đang nghỉ":" because AI is taking a break","Đã có trong flashcard":"Already in flashcards","+ Thêm vào flashcard":"+ Add to flashcards","Tra từ tiếng Việt":"Look up Vietnamese word","Câu tiếng Việt: \"":"Vietnamese sentence: \"","\". Người học bấm vào âm tiết thứ ":"\". The learner tapped syllable number "," là \"":" which is \"","\".\nXác định TỪ tiếng Việt chứa âm tiết đó (có thể là từ ghép nhiều âm tiết, ví dụ \"hành lý\", \"kỹ sư phần mềm\").\nTrả JSON {\"word_vi\":\"từ tiếng Việt\",\"start\":vị trí âm tiết đầu tiên của từ (đếm từ 1),\"length\":số âm tiết,\"en\":\"từ hoặc cụm tiếng Anh tương đương đúng ngữ cảnh câu\",\"alts\":[\"cách nói khác\"] (tối đa 2),\"pos\":\"từ loại tiếng Việt\",\"ipa\":\"IPA của từ tiếng Anh chính\",\"note\":\"lưu ý cách dùng ngắn, nếu có\",\"examples\":[{\"en\":\"câu ví dụ\",\"vi\":\"dịch\"}] (2 câu)}":"\".\nIdentify the Vietnamese WORD containing that syllable (it may be a multi-syllable compound, e.g. \"hành lý\", \"kỹ sư phần mềm\").\nReturn JSON {\"word_vi\":\"the Vietnamese word\",\"start\":position of the word's first syllable (counting from 1),\"length\":number of syllables,\"en\":\"equivalent English word or phrase that fits the sentence\",\"alts\":[\"other ways to say it\"] (max 2),\"pos\":\"part of speech in English\",\"ipa\":\"IPA of the main English word\",\"note\":\"short usage note in English, if any\",\"examples\":[{\"en\":\"example sentence\",\"vi\":\"Vietnamese translation\"}] (2 sentences)}","<div class=\"row between nowrap\"><div><p class=\"eyebrow\">Tiếng Việt → Tiếng Anh</p><div class=\"word sm\">":"<div class=\"row between nowrap\"><div><p class=\"eyebrow\">Vietnamese → English</p><div class=\"word sm\">","</div></div><button class=\"mini\" data-a=\"closePop\" aria-label=\"Đóng\">✕</button></div>\n   ":"</div></div><button class=\"mini\" data-a=\"closePop\" aria-label=\"Close\">✕</button></div>\n   ","\">🌐 Dịch cả câu</button></div>\n   <div class=\"pop-tr\"></div>":"\">🌐 Translate sentence</button></div>\n   <div class=\"pop-tr\"></div>","<p class=\"small\">Cách nói khác: ":"<p class=\"small\">Other ways to say it: ","<p class=\"muted small\"><span class=\"spin\"></span> Đang tra theo ngữ cảnh câu...</p>":"<p class=\"muted small\"><span class=\"spin\"></span> Looking up in context...</p>"," Bạn vẫn có thể dịch cả câu bên dưới.</p>":" You can still translate the whole sentence below.</p>","Chưa tra được":"Couldn't look it up","Tra từng từ tiếng Việt cần AI đang hoạt động.":"Looking up Vietnamese words needs AI to be available.","Đến giờ học tiếng Anh":"Time to study English"," đang chờ bạn. ":" is waiting for you. "," thẻ flashcard cần ôn.":" flashcards to review.","Học tiếng Anh":"Study English","Mở app: ":"Open the app: ","SUMMARY:Học tiếng Anh":"SUMMARY:Study English","DESCRIPTION:Mở app: ":"DESCRIPTION:Open the app: ","DESCRIPTION:Đến giờ học tiếng Anh":"DESCRIPTION:Time to study English","Trên iPhone: mở app bằng Safari, bấm Chia sẻ → Thêm vào MH chính, rồi mở app từ biểu tượng ngoài màn hình để bật thông báo.":"On iPhone: open the app in Safari, tap Share → Add to Home Screen, then open it from the home screen icon to turn on notifications.","Trình duyệt này không hỗ trợ thông báo đẩy. Hãy dùng Chrome (Android/máy tính) hoặc Safari (iPhone, iOS 16.4 trở lên).":"This browser doesn't support push notifications. Please use Chrome (Android/computer) or Safari (iPhone, iOS 16.4 or later).","<span class=\"spin\"></span> Đang bật...":"<span class=\"spin\"></span> Turning on...","Bạn chưa cho phép thông báo. Vào cài đặt trình duyệt/điện thoại để cho phép thông báo của trang này.":"You haven't allowed notifications. Go to your browser or phone settings and allow notifications for this site.","Server chưa cấu hình khóa thông báo":"The server hasn't set up notification keys","Không lưu được thiết bị":"Couldn't save this device","Đã bật nhắc học trên thiết bị này":"Study reminders turned on for this device","Đã tắt nhắc học trên thiết bị này":"Study reminders turned off for this device","Đã gửi thông báo thử, kiểm tra thanh thông báo":"Test notification sent, check your notifications","Gửi thử thất bại":"Couldn't send the test","Hãy viết vài dòng hoặc chọn số sao nhé":"Write a few lines or pick a star rating","Không gửi được":"Couldn't send","Cảm ơn bạn đã góp ý 💚":"Thanks for your feedback 💚","Đã ghép! Bạn ấy có thể chưa online, cứ chào trước nhé 👋":"Matched! They may not be online yet, so say hi first 👋","Đã bỏ chặn":"Unblocked","🔕 Đã tắt thông báo của cuộc trò chuyện này. Tin nhắn vẫn hiện trong hộp thư.":"🔕 Notifications muted for this chat. Messages still show up in your inbox.","🔔 Đã bật lại thông báo":"🔔 Notifications turned back on","Bấm lần nữa để chặn":"Tap again to block","Đã chặn. Bạn sẽ không bao giờ thấy tin, bị ghép hay nhận thông báo từ người này nữa.":"Blocked. You'll never see messages from, be matched with, or get notifications from this person again.","⭐ Hai bạn đã là bạn chat!":"⭐ You're now chat buddies!","Đã bấm giữ. Chờ bạn ấy đồng ý nhé.":"Kept. Waiting for them to agree.","Đã bỏ giữ":"No longer kept","Bấm lần nữa để xác nhận":"Tap again to confirm","Đã gửi báo cáo. Cảm ơn bạn!":"Report sent. Thank you!","Đã chặn. Bạn sẽ không thấy tin nhắn của người này nữa.":"Blocked. You won't see this person's messages anymore.","Đã bật hiệu ứng rơi":"Falling effects on","Đã tắt hiệu ứng rơi":"Falling effects off","Máy nghe được: \"":"I heard: \"","Đã tạo lộ trình. Bắt đầu buổi 1 thôi!":"Your course is ready. Let's start lesson 1!","Đã lưu mục tiêu. Các buổi học tới sẽ theo lĩnh vực mới.":"Goal saved. Upcoming lessons will follow your new field.","Bắt đầu khóa mới!":"New course started!","Nghe và gõ lại từ":"Listen and type the word","nghĩa là ":"means ","Đã thêm vào flashcard":"Added to flashcards","Lời nhắc sẽ nhẹ nhàng":"Reminders will be gentle","Lời nhắc sẽ lầy lội 😈":"Reminders will be cheeky 😈","Đã bật nhắc học":"Study reminders on","Đã tắt nhắc học":"Study reminders off","<span class=\"spin\"></span> Đang dịch...":"<span class=\"spin\"></span> Translating...","<p class=\"muted small\">Chưa dịch được: ":"<p class=\"muted small\">Couldn't translate: ","lỗi":"error","Key và model hợp lệ":"Key and model are valid","AI chưa dùng được: ":"AI isn't available yet: ","Bấm lần nữa để xác nhận xóa":"Tap again to confirm erasing","Đã xóa tiến độ":"Progress erased","Đã lưu ngày sinh 🎂":"Birthday saved 🎂","Đã xoá ngày sinh":"Birthday removed","Đã lưu giờ nhắc":"Reminder time saved","Đã ghép với một bạn luyện tập 🎉":"Matched with a practice partner 🎉","Trình duyệt này chưa hỗ trợ ghi âm":"This browser doesn't support recording yet","Đoạn ghi âm quá ngắn":"Recording too short","Chưa có quyền dùng micro":"No permission to use the microphone","<h2>Cộng đồng dành cho người từ 16 tuổi</h2>\n    <p class=\"muted\">Phần trò chuyện với người lạ chỉ mở cho người từ 16 tuổi trở lên. Bạn vẫn có thể luyện nói với AI trong bước Role-play của mỗi bài học nhé!</p></section></div>":"<h2>Community is for ages 16 and up</h2>\n    <p class=\"muted\">Chatting with strangers is only open to people aged 16 and over. You can still practise speaking with AI in the Role-play step of every lesson!</p></section></div>","<p class=\"eyebrow\">Cộng đồng</p><h2>Trò chuyện ẩn danh để cùng luyện tiếng Anh</h2>\n    <p>Gặp những người cũng đang học, cùng luyện nói, hỏi đáp và động viên nhau. Không ai biết bạn là ai: mỗi ngày bạn có một biệt danh ngẫu nhiên.</p>\n    <h3>Nội quy</h3><ul class=\"rules\">\n     <li>🙂 Tôn trọng và lịch sự. Không xúc phạm, quấy rối, phân biệt đối xử.</li>\n     <li>🔒 Không chia sẻ thông tin cá nhân: số điện thoại, địa chỉ, mạng xã hội, đường link (app sẽ chặn).</li>\n     <li>🚫 Không nội dung người lớn, bạo lực, lừa đảo, quảng cáo.</li>\n     <li>🗣️ Ưu tiên nói tiếng Anh; dùng tiếng Việt khi cần hỏi bài.</li>\n     <li>🚩 Gặp người vi phạm: bấm ⋯ ở tin nhắn để <b>Báo cáo</b> hoặc <b>Chặn</b>. Người bị nhiều báo cáo sẽ bị khoá chat.</li>\n     <li>🎤 Tin nhắn giọng nói được lưu tối đa 30 ngày rồi tự xoá.</li></ul>\n    <p class=\"muted small\">Chỉ dành cho người từ 16 tuổi trở lên.</p>\n    <button class=\"primary big\" data-a=\"chAgree\">Tôi đồng ý, vào cộng đồng</button></section></div>":"<p class=\"eyebrow\">Community</p><h2>Practise English together, anonymously</h2>\n    <p>Meet other learners, practise speaking, ask questions and cheer each other on. No one knows who you are: you get a random nickname every day.</p>\n    <h3>Community rules</h3><ul class=\"rules\">\n     <li>🙂 Be respectful and kind. No insults, harassment or discrimination.</li>\n     <li>🔒 Don't share personal information: phone numbers, addresses, social media or links (the app blocks them).</li>\n     <li>🚫 No adult content, violence, scams or advertising.</li>\n     <li>🗣️ Use English whenever you can; Vietnamese is fine when asking about a lesson.</li>\n     <li>🚩 If someone breaks the rules, tap ⋯ on their message to <b>Report</b> or <b>Block</b>. People with many reports get chat-banned.</li>\n     <li>🎤 Voice messages are kept for up to 30 days, then deleted automatically.</li></ul>\n    <p class=\"muted small\">For ages 16 and up only.</p>\n    <button class=\"primary big\" data-a=\"chAgree\">I agree, join the community</button></section></div>","\" data-a=\"chTab\" data-v=\"room\">💬 Phòng chung</button><button class=\"seg ":"\" data-a=\"chTab\" data-v=\"room\">💬 Rooms</button><button class=\"seg ","\" data-a=\"chTab\" data-v=\"pair\">🤝 Ghép đôi 1-1</button>\n    ":"\" data-a=\"chTab\" data-v=\"pair\">🤝 1-on-1</button>\n    ","<span class=\"muted small\">Hôm nay bạn là <b>":"<span class=\"muted small\">Today you're <b>","Mọi trình độ":"All levels","\" title=\"Chặn người này, không bao giờ thấy tin của họ nữa\">⛔</button></div>":"\" title=\"Block this person and never see their messages again\">⛔</button></div>"," <span class=\"tag good\">⭐ Bạn chat</span>":" <span class=\"tag good\">⭐ Chat buddy</span>"," <span class=\"tag\">muốn giữ cuộc trò chuyện</span>":" <span class=\"tag\">wants to keep this chat</span>","Chưa có tin nhắn, hãy chào bạn ấy nhé!":"No messages yet, say hi!","<span title=\"Đã tắt thông báo\">🔕</span>":"<span title=\"Notifications muted\">🔕</span>","<section class=\"panel\">\n      <div class=\"row between nowrap\"><div><h2>Ghép đôi 1-1</h2></div>":"<section class=\"panel\">\n      <div class=\"row between nowrap\"><div><h2>1-on-1 chats</h2></div>","\n      <h3>Cuộc trò chuyện của bạn</h3>\n      ":"\n      <h3>Your chats</h3>\n      ","<div class=\"row\"><span class=\"spin\"></span><span>Đang tìm bạn phù hợp...</span><button class=\"mini\" data-a=\"chCancel\">Huỷ tìm</button></div>":"<div class=\"row\"><span class=\"spin\"></span><span>Finding a good match...</span><button class=\"mini\" data-a=\"chCancel\">Cancel</button></div>","<button class=\"primary big\" data-a=\"chMatch\">🔍 Tìm bạn luyện tập mới</button>":"<button class=\"primary big\" data-a=\"chMatch\">🔍 Find a new practice partner</button>","<p class=\"muted\">Chưa có cuộc trò chuyện nào.</p>":"<p class=\"muted\">No chats yet.</p>","Ẩn người đã chặn":"Hide blocked people","Người đã chặn":"Blocked people","</b><br><span class=\"muted small\">Chặn lúc ":"</b><br><span class=\"muted small\">Blocked on ","|0\">Bỏ chặn</button>":"|0\">Unblock</button>","|1\">Bỏ chặn & mở lại chat</button>":"|1\">Unblock & reopen chat</button>","<p class=\"muted small\">Bạn chưa chặn ai.</p>":"<p class=\"muted small\">You haven't blocked anyone.</p>","<div class=\"phead\"><button class=\"mini ghost\" data-a=\"chBack\" aria-label=\"Quay lại\">←</button>":"<div class=\"phead\"><button class=\"mini ghost\" data-a=\"chBack\" aria-label=\"Back\">←</button>","\n      <button class=\"mini\" data-a=\"chHMenu\" aria-label=\"Tuỳ chọn\" aria-expanded=\"":"\n      <button class=\"mini\" data-a=\"chHMenu\" aria-label=\"Options\" aria-expanded=\"","<span class=\"tag good\">⭐ Bạn chat</span>":"<span class=\"tag good\">⭐ Chat buddy</span>","\" title=\"Giữ cuộc trò chuyện\">":"\" title=\"Keep this chat\">","✓ Đã giữ":"✓ Kept","⭐ Giữ":"⭐ Keep","\">⛔ Chặn</button></div>":"\">⛔ Block</button></div>","🔔 Bật lại thông báo":"🔔 Unmute","🔕 Tắt thông báo":"🔕 Mute","Huỷ bạn chat":"Stop being chat buddies","Kết thúc":"End chat","<p class=\"fb small\">⭐ Bạn ấy muốn giữ cuộc trò chuyện. Bấm “Giữ” để thành bạn chat.</p>":"<p class=\"fb small\">⭐ They want to keep this chat. Tap “Keep” to become chat buddies.</p>","<p class=\"fb small\">Cuộc trò chuyện đã kết thúc.</p>":"<p class=\"fb small\">This chat has ended.</p>","Bạn đã thu hồi một tin nhắn":"You unsent a message","Tin nhắn đã được thu hồi":"This message was unsent","<span class=\"muted\">(Tin nhắn đã bị ẩn do vi phạm)</span>":"<span class=\"muted\">(Message hidden for breaking the rules)</span>","Xem tiếng Anh":"Show in English","\">↩️ Thu hồi</button><button class=\"mini ghost\" data-a=\"chMenu\" data-v=\"\">Đóng</button></div>":"\">↩️ Unsend</button><button class=\"mini ghost\" data-a=\"chMenu\" data-v=\"\">Close</button></div>","<div class=\"row cmenu\"><span class=\"small\">🚩 Báo cáo:</span>":"<div class=\"row cmenu\"><span class=\"small\">🚩 Report:</span>","\">⛔ Chặn người này</button><button class=\"mini ghost\" data-a=\"chMenu\" data-v=\"\">Đóng</button></div>":"\">⛔ Block this person</button><button class=\"mini ghost\" data-a=\"chMenu\" data-v=\"\">Close</button></div>","Thô tục":"Offensive","Quấy rối":"Harassment","Nội dung người lớn":"Adult content","Lừa đảo/quảng cáo":"Scam/advertising","Chưa có tin nhắn nào. Hãy chào mọi người nhé: “Hi everyone! 👋”":"No messages yet. Say hello to everyone: “Hi everyone! 👋”","<p class=\"fb small\">Bạn đang bị tạm khoá trò chuyện đến ":"<p class=\"fb small\">You're temporarily banned from chat until "," do bị báo cáo vi phạm.</p>":" because of reports against you.</p>","<div class=\"row recbar\"><span class=\"recdot\"></span><b id=\"recT\">0:00</b><span class=\"muted small\">Đang ghi âm (tối đa 60 giây)</span><button class=\"ghost\" data-a=\"chRecCancel\">Huỷ</button><button class=\"primary\" data-a=\"chRecStop\">Dừng & gửi</button></div>":"<div class=\"row recbar\"><span class=\"recdot\"></span><b id=\"recT\">0:00</b><span class=\"muted small\">Recording (up to 60 seconds)</span><button class=\"ghost\" data-a=\"chRecCancel\">Cancel</button><button class=\"primary\" data-a=\"chRecStop\">Stop & send</button></div>","<div class=\"row nowrap\"><label class=\"sr\" for=\"chIn\">Tin nhắn</label><input id=\"chIn\" data-enter=\"chSend\" maxlength=\"500\" placeholder=\"Viết bằng tiếng Anh (hoặc hỏi bằng tiếng Việt)...\" autocomplete=\"off\">\n         <button class=\"round\" data-a=\"chRec\" aria-label=\"Ghi âm\" title=\"Gửi tin nhắn giọng nói\">🎤</button><button class=\"primary\" data-a=\"chSend\" ":"<div class=\"row nowrap\"><label class=\"sr\" for=\"chIn\">Message</label><input id=\"chIn\" data-enter=\"chSend\" maxlength=\"500\" placeholder=\"Write in English (or ask in Vietnamese)...\" autocomplete=\"off\">\n         <button class=\"round\" data-a=\"chRec\" aria-label=\"Record\" title=\"Send a voice message\">🎤</button><button class=\"primary\" data-a=\"chSend\" ","Gửi":"Send","Tết Nguyên Đán":"Lunar New Year","Chúc mừng năm mới! Năm mới học tiếng Anh tiến bộ vượt bậc nhé 🧧":"Happy Lunar New Year! Wishing you a year of big leaps in your English 🧧","Lễ Tình nhân 14/2":"Valentine's Day","Happy Valentine's Day! Học thêm vài câu tỏ tình bằng tiếng Anh nào 💌":"Happy Valentine's Day! How about learning a few romantic lines in English? 💌","Quốc tế Phụ nữ 8/3":"International Women's Day","Chúc mừng ngày 8/3! Gửi lời chúc tới những người phụ nữ tuyệt vời 💐":"Happy Women's Day! Sending love to all the amazing women out there 💐","Sinh nhật người sáng lập 18/3":"Founder's birthday (18 March)","Hôm nay 18/3 là sinh nhật người tạo ra app này, một người yêu hội họa, âm nhạc và thiên nhiên. Cảm ơn bạn đã cùng học, cùng yêu cái đẹp! 🎨🎵":"Today, 18 March, is the birthday of the person who made this app, someone who loves painting, music and nature. Thank you for learning with us and loving beautiful things! 🎨🎵","Quốc tế Thiếu nhi 1/6":"Children's Day","Happy Children's Day! Ai cũng có một đứa trẻ bên trong, học vui như chơi nhé 🎈":"Happy Children's Day! There's a child in all of us, so make learning feel like play 🎈","Tết Trung thu":"Mid-Autumn Festival","Trung thu vui vẻ! Thử kể về Tết Trung thu bằng tiếng Anh xem 🥮":"Happy Mid-Autumn Festival! Try describing the festival in English 🥮","Ngày đặc biệt 14/10":"A special day (14 October)","Ngày Nhà giáo Việt Nam 20/11":"Vietnamese Teachers' Day","Chúc mừng ngày Nhà giáo Việt Nam 20/11! Tri ân những người thầy, người cô 💐":"Happy Vietnamese Teachers' Day! A big thank-you to all our teachers 💐","Tết Dương lịch":"New Year's Day","Happy New Year! Năm mới, mục tiêu mới: mỗi ngày thêm vài từ, cuối năm nói tiếng Anh thật tự tin 🎆":"Happy New Year! New year, new goals: a few new words every day, and by the end of the year you'll speak English with real confidence 🎆","Giáng Sinh":"Christmas","Merry Christmas! Giáng Sinh an lành và ấm áp 🎄":"Merry Christmas! Wishing you a warm and peaceful Christmas 🎄","Sinh nhật của bạn":"Your birthday","Mùa xuân":"Spring","Xuân về, hoa nở. Gieo vài từ mới hôm nay, mai sẽ nở thành câu nói 🌸":"Spring is here and flowers are blooming. Plant a few new words today and tomorrow they'll grow into sentences 🌸","Mùa hè":"Summer","Hè rực rỡ! Học một bài nhẹ rồi nghe một bản nhạc tiếng Anh nhé ☀️🎶":"Bright summer days! Do a light lesson, then listen to an English song ☀️🎶","Mùa thu":"Autumn","Thu dịu dàng như một bản violin. Pha tách trà và học vài câu mới nào 🍂🎻":"Autumn is as gentle as a violin. Make a cup of tea and learn a few new sentences 🍂🎻","Mùa đông":"Winter","Đông về, ngoài kia lạnh nhưng tiếng Anh của bạn vẫn ấm. Vào học thôi ❄️🎹":"Winter is here. It's cold outside, but your English is still warm. Time to study ❄️🎹","Chúc mừng sinh nhật ":"Happy birthday ","! 🎂 Chúc bạn tuổi mới thật nhiều niềm vui và nói tiếng Anh ngày càng giỏi. Happy birthday!":"! 🎂 Wishing you a year full of joy and ever-better English. Happy birthday!","Trang chủ":"Home","Lộ trình":"Course","Ôn tập":"Review","Cộng đồng":"Community","Lịch sử":"History","<div class=\"hin\"><a href=\"#\" class=\"brand\" data-a=\"go\" data-v=\"home\"><img class=\"logo\" src=\"/logo.png?v=6\" alt=\"\" width=\"40\" height=\"40\"><span><b>SEED</b><small>Tiếng Anh cá nhân hóa</small></span></a>\n    ":"<div class=\"hin\"><a href=\"#\" class=\"brand\" data-a=\"go\" data-v=\"home\"><img class=\"logo\" src=\"/logo.png?v=6\" alt=\"\" width=\"40\" height=\"40\"><span><b>SEED</b><small>Personalised English</small></span></a>\n    ","\n     <div class=\"usermenu\"><button class=\"avatar\" data-a=\"menu\" aria-label=\"Tài khoản ":"\n     <div class=\"usermenu\"><button class=\"avatar\" data-a=\"menu\" aria-label=\"Account ","<nav class=\"tabs-top\" aria-label=\"Điều hướng\">":"<nav class=\"tabs-top\" aria-label=\"Navigation\">","<span class=\"lvl\" title=\"Trình độ hiện tại\">":"<span class=\"lvl\" title=\"Current level\">","<a href=\"#\" data-a=\"logout\">Đăng xuất</a></div>":"<a href=\"#\" data-a=\"logout\">Log out</a></div>","Tài khoản":"Account","<a href=\"/admin\">🛠️ Quản trị</a>":"<a href=\"/admin\">🛠️ Admin</a>","<a href=\"#\" data-a=\"go\" data-v=\"settings\">Cài đặt</a>":"<a href=\"#\" data-a=\"go\" data-v=\"settings\">Settings</a>","Cài đặt":"Settings","<div class=\"wrap\"><section class=\"panel center\"><p><span class=\"spin\"></span> Đang tải tiến độ của bạn...</p></section></div>":"<div class=\"wrap\"><section class=\"panel center\"><p><span class=\"spin\"></span> Loading your progress...</p></section></div>","đang kiểm tra kết nối...":"checking connection..."};
const _t = s => (LANG === "en" && EN[s] !== undefined) ? EN[s] : s;
const prevTr = p => { if (!p || LANG !== "en") return p || ""; const me = p.startsWith("Bạn: "); const body = me ? p.slice(5) : p; return (me ? "You: " : "") + _t(body); };
const whoName = w => (LANG === "en" && w?.name_en) || w?.name || "";
// Tên bài/ngữ pháp trong kho bài mẫu: giữ tiếng Việt làm dữ liệu gốc, chỉ dịch lúc hiển thị
// Tên bài: có sẵn bản dịch thì dùng; bài do AI soạn trước đây (tiếng Việt) thì dịch tự động một lần và nhớ lại
const VIRE = /[ăâđêôơưàáạảãằắặẳẵầấậẩẫèéẹẻẽềếệểễìíịỉĩòóọỏõồốộổỗờớợởỡùúụủũừứựửữỳýỵỷỹ]/i;
let TPC = (() => { try { return JSON.parse(localStorage.getItem("ep_tpc") || "{}"); } catch (e) { return {}; } })(), TPQ = new Set(), TPT = null;
function tpFetch() {
  clearTimeout(TPT); TPT = setTimeout(async () => {
    const list = [...TPQ].slice(0, 12); TPQ.clear();
    await Promise.all(list.map(async x => { try { const r = await fetch(`/api/translate?sl=vi&tl=en&q=${encodeURIComponent(x)}`); const d = await r.json(); if (r.ok && d.text) TPC[x] = d.text; } catch (e) {} }));
    try { localStorage.setItem("ep_tpc", JSON.stringify(TPC)); } catch (e) {}
    if (list.some(x => TPC[x]) && typeof render === "function") render();
  }, 150);
}
const tr1 = x => { if (LANG !== "en" || EN[x] !== undefined || !VIRE.test(x)) return _t(x); if (TPC[x]) return TPC[x]; TPQ.add(x); tpFetch(); return x; };
const tp = x => { x = String(x || ""); return x.startsWith("Ôn lại: ") ? _t("Ôn lại: ") + tr1(x.slice(8)) : tr1(x); };
const VI_OF = Object.fromEntries(Object.entries(EN).map(([v, e]) => [e, v]));
// Nhãn lưu trong hồ sơ (lĩnh vực, tình huống) có thể được lưu bằng ngôn ngữ cũ: đổi sang ngôn ngữ đang dùng
const relabel = x => LANG === "en" ? _t(x) : (VI_OF[x] || x);
document.documentElement.lang = LANG;

/* =====================================================================
   DỮ LIỆU CỐ ĐỊNH
   ===================================================================== */
const LEVELS = ["A0","A1","A2","B1","B2","C1"];
const LEVEL_VI = {A0:_t("Mới bắt đầu"),A1:_t("Sơ cấp"),A2:_t("Sơ trung cấp"),B1:_t("Trung cấp"),B2:_t("Trung cao cấp"),C1:_t("Cao cấp")};
const GOALS = [["communication",_t("Giao tiếp")],["work",_t("Công việc")],["travel",_t("Du lịch")],["exam",_t("Thi cử")]];
// Mục tiêu → lĩnh vực → tình huống cụ thể
const WORK_COMMON = [_t("Họp nhóm, báo cáo tiến độ"),_t("Viết email công việc"),_t("Thuyết trình"),_t("Họp online với khách hàng, đối tác"),_t("Đàm phán"),_t("Small talk với đồng nghiệp nước ngoài"),_t("Phỏng vấn xin việc"),_t("Đọc tài liệu chuyên ngành")];
const FIELDS = {
  communication:[
    [_t("Đời sống hằng ngày"),[_t("Chào hỏi, làm quen"),_t("Mua sắm, đi chợ"),_t("Gọi món ở quán ăn"),_t("Hỏi đường, đi lại"),_t("Gọi điện thoại"),_t("Đi khám bệnh, mua thuốc"),_t("Ngân hàng, bưu điện"),_t("Thuê nhà, nói chuyện với hàng xóm")]],
    [_t("Giao tiếp khi du lịch"),[_t("Sân bay, máy bay"),_t("Khách sạn"),_t("Taxi, tàu xe"),_t("Nhà hàng"),_t("Tham quan, mua vé"),_t("Mua sắm, trả giá"),_t("Xử lý sự cố (mất đồ, ốm)")]],
    [_t("Kết bạn, mạng xã hội"),["Small talk",_t("Nói về sở thích"),_t("Nhắn tin, bình luận"),_t("Chia sẻ quan điểm"),_t("Gọi video với bạn nước ngoài")]],
    [_t("Gia đình, nuôi dạy con"),[_t("Nói chuyện với con bằng tiếng Anh"),_t("Đọc truyện cho con"),_t("Sinh hoạt hằng ngày ở nhà"),_t("Trao đổi với giáo viên trường quốc tế")]],
    [_t("Hẹn hò, tình cảm"),[_t("Làm quen, mời đi chơi"),_t("Nhắn tin"),_t("Bày tỏ cảm xúc"),_t("Gặp gia đình người yêu")]],
    [_t("Nói trước đám đông"),[_t("Thuyết trình"),_t("Phát biểu, chúc mừng"),_t("Nêu ý kiến, tranh luận"),_t("Dẫn chương trình")]]],
  work:[
    [_t("IT, phần mềm"),["Daily stand-up","Code review",_t("Viết bug report, ticket"),_t("Giải thích vấn đề kỹ thuật"),_t("Làm việc với khách hàng nước ngoài (outsourcing)"),_t("Viết tài liệu kỹ thuật")]],
    ["Kinh doanh, sales",[_t("Giới thiệu sản phẩm"),_t("Gọi điện cho khách hàng mới"),_t("Đàm phán giá"),_t("Chốt hợp đồng"),_t("Chăm sóc khách hàng sau bán")]],
    ["Marketing",[_t("Brainstorm ý tưởng"),_t("Viết content"),_t("Báo cáo chiến dịch"),_t("Làm việc với agency"),_t("Phân tích số liệu")]],
    [_t("Tài chính, ngân hàng"),[_t("Tư vấn khách hàng"),_t("Giải thích sản phẩm tài chính"),_t("Báo cáo tài chính"),_t("Làm việc với kiểm toán")]],
    [_t("Y tế, dược"),[_t("Hỏi bệnh sử"),_t("Giải thích chẩn đoán"),_t("Hướng dẫn dùng thuốc"),_t("Trao đổi với đồng nghiệp"),_t("Đọc tài liệu y khoa")]],
    [_t("Khách sạn, nhà hàng"),[_t("Đón khách, check-in"),_t("Giới thiệu dịch vụ"),_t("Nhận order, giới thiệu món"),_t("Xử lý phàn nàn"),_t("Đặt phòng qua điện thoại")]],
    [_t("Kỹ thuật, sản xuất"),[_t("Hướng dẫn vận hành máy"),_t("An toàn lao động"),_t("Báo cáo sự cố"),_t("Làm việc với chuyên gia nước ngoài")]],
    [_t("Giáo dục"),[_t("Giảng dạy trên lớp"),_t("Trao đổi với phụ huynh"),_t("Họp chuyên môn"),_t("Viết nhận xét học sinh")]],
    [_t("Xuất nhập khẩu, logistics"),[_t("Theo dõi đơn hàng"),_t("Làm việc với forwarder"),_t("Chứng từ, hải quan"),_t("Xử lý giao hàng trễ")]],
    [_t("Chăm sóc khách hàng"),[_t("Trả lời điện thoại"),_t("Chat với khách"),_t("Xử lý khiếu nại"),_t("Hướng dẫn sử dụng sản phẩm")]],
    [_t("Văn phòng, hành chính, nhân sự"),[_t("Lên lịch họp"),_t("Tiếp khách"),_t("Tuyển dụng, phỏng vấn ứng viên"),_t("Soạn thông báo nội bộ")]]],
  travel:[
    [_t("Du lịch tự túc"),[_t("Sân bay, máy bay"),_t("Khách sạn, homestay"),_t("Phương tiện công cộng"),_t("Ăn uống"),_t("Tham quan, mua vé"),_t("Mua sắm"),_t("Xử lý sự cố")]],
    [_t("Đi công tác"),[_t("Sân bay, khách sạn"),_t("Gặp đối tác"),_t("Dự hội thảo"),_t("Ăn tối tiếp khách"),_t("Báo cáo chuyến công tác")]],
    [_t("Du học"),[_t("Phỏng vấn visa"),_t("Thủ tục nhập học"),_t("Thảo luận trên lớp"),_t("Ở ký túc xá, ở ghép"),_t("Đi làm thêm")]],
    [_t("Định cư ở nước ngoài"),[_t("Thuê nhà"),_t("Mở tài khoản ngân hàng"),_t("Đi khám bệnh"),_t("Xin việc"),_t("Giấy tờ hành chính"),_t("Hàng xóm, cộng đồng")]]],
  exam:[
    ["IELTS",["Listening","Reading","Writing Task 1","Writing Task 2","Speaking Part 1","Speaking Part 2–3"]],
    ["TOEIC",["Listening","Reading","Speaking","Writing"]],
    ["TOEFL",["Listening","Reading","Speaking","Writing"]],
    ["VSTEP",[_t("Nghe"),_t("Đọc"),_t("Viết"),_t("Nói")]],
    ["Cambridge (KET/PET/FCE)",["Reading & Writing","Listening","Speaking"]]]
};
const subsOf = (goal, field) => { const f = FIELDS[goal].find(x => x[0] === field); return f ? f[1] : (goal === "work" && field === WORK_GROUP ? WORK_COMMON : []); };
const WORK_GROUP = _t("Việc chung ở công sở");
const subGroups = s => s.goal === "work" && s.fields.length ? [...s.fields, WORK_GROUP] : s.fields;
const DETAIL_HINT = {
  communication:_t("Ví dụ: hay nói chuyện với bạn bè nước ngoài qua mạng"),
  work:_t("Ví dụ: tôi làm QA, thường họp và viết email với khách hàng Mỹ"),
  travel:_t("Ví dụ: đi Nhật và Hàn tháng 3 năm sau, tự đặt phòng và đi tàu"),
  exam:_t("Ví dụ: IELTS 6.5, cần nhất là Speaking")
};
const STEPS = [_t("Ôn bài cũ"),_t("Từ vựng mới"),_t("Tự đặt câu"),_t("Dịch câu"),"Role-play",_t("Tổng kết")];
const SKILL_VI = {vocab:_t("Từ vựng"),grammar:_t("Ngữ pháp"),spelling:_t("Chính tả"),translation:_t("Dịch"),listening:_t("Nghe"),speaking:_t("Nói")};

// Test đầu vào: [bậc 0=A1..4=C1, câu hỏi, lựa chọn, đáp án]
const PLACEMENT = [
 [0,"I ___ a student.",["am","is","are","be"],0],
 [0,"She ___ two brothers.",["have","has","having","is"],1],
 [0,"\"Thank you\" nghĩa là:",["Xin lỗi","Cảm ơn","Tạm biệt","Xin chào"],1],
 [0,"___ is your name?",["What","Who","Where","How"],0],
 [0,"They ___ from Vietnam.",["is","am","are","be"],2],
 [0,"Từ nào là một ngày trong tuần?",["Monday","March","Morning","Month"],0],
 [1,"I ___ to Hue last summer.",["go","goes","went","going"],2],
 [1,"There isn't ___ milk left.",["some","any","many","a"],1],
 [1,"He is ___ than his brother.",["tall","taller","tallest","more tall"],1],
 [1,"We ___ dinner when you called.",["have","were having","are having","had have"],1],
 [1,"You ___ wear a seatbelt. It's the law.",["must","might","can","would"],0],
 [1,"\"Borrow\" nghĩa là:",["mượn","cho vay","trả lại","mua"],0],
 [2,"I have lived here ___ 2019.",["for","since","from","in"],1],
 [2,"If it rains, we ___ at home.",["stay","will stay","stayed","would stay"],1],
 [2,"The report ___ by Minh yesterday.",["wrote","was written","is writing","has write"],1],
 [2,"She asked me where I ___.",["live","lived","am living","will live"],1],
 [2,"I'm looking forward to ___ you.",["see","seeing","saw","seen"],1],
 [2,"\"Reliable\" nghĩa là:",["đáng tin cậy","dễ thương","nhanh chóng","đắt đỏ"],0],
 [3,"I wish I ___ more time.",["have","had","will have","am having"],1],
 [3,"If I had known, I ___ you.",["would tell","would have told","will tell","told"],1],
 [3,"She's used to ___ up early.",["get","getting","got","gets"],1],
 [3,"The project, ___ was delayed, finally launched.",["that","which","who","what"],1],
 [3,"\"Mitigate\" gần nghĩa nhất với:",["giảm nhẹ","làm trầm trọng","trì hoãn","phớt lờ"],0],
 [3,"By next year, they ___ the bridge.",["will finish","will have finished","finish","finished"],1],
 [4,"Hardly ___ the meeting started when the power went out.",["had","has","did","was"],0],
 [4,"His argument was ___ by a lack of evidence.",["undermined","understated","overcome","underlined"],0],
 [4,"Not only ___ late, but he also forgot the slides.",["he was","was he","he is","did he"],1],
 [4,"\"Ubiquitous\" nghĩa là:",["có mặt khắp nơi","hiếm có","mơ hồ","cổ xưa"],0],
 [4,"It's high time we ___ a decision.",["make","made","will make","making"],1],
 [4,"The findings ___ further investigation.",["warrant","warranty","wary","worth"],0]
];
const PLACEMENT_LEN = 12;
// ===== Bài test đầu vào: kho câu NGHE / ĐỌC / NÓI (lv 0=A1 · 1=A2 · 2=B1 · 3=B2 · 4=C1) =====
// NGHE: [lv, câu được đọc, kiểu ("same" = chọn câu vừa nghe | "q" = câu hỏi hiểu ý), câu hỏi (nếu "q"), đáp án..., chỉ số đúng]
const PL_LISTEN = [
 [0, "I have two cats and a dog.", "same", "", ["I have two cats and a dog.", "I had two cats and a dog.", "I have two hats and a dog.", "I have a cat and two dogs."], 0],
 [0, "What time is it now?", "same", "", ["What time is it now?", "What time is in now?", "Where is it now?", "What type is it now?"], 0],
 [0, "My sister works in a hospital.", "same", "", ["My sister walks to a hospital.", "My sister works in a hospital.", "My sisters work in a hotel.", "My sister worked in a hospital."], 1],
 [1, "I'm sorry, I can't come tonight because I have to finish my report.", "q", "Why can't the speaker come?", ["He is sick.", "He has to finish a report.", "He doesn't like parties.", "He has to pick up his son."], 1],
 [1, "The train to Hanoi leaves at half past seven from platform three.", "q", "When does the train leave?", ["7:00", "7:15", "7:30", "3:30"], 2],
 [1, "Could you buy some milk and eggs on your way home?", "q", "What does the speaker want?", ["Some milk and eggs", "A lift home", "Some bread and milk", "Directions to the shop"], 0],
 [2, "I was going to take the bus, but it was so crowded that I ended up walking all the way to the office.", "q", "How did the speaker get to the office?", ["By bus", "On foot", "By taxi", "By motorbike"], 1],
 [2, "If you'd told me earlier that the meeting had been moved, I wouldn't have driven all the way here.", "q", "How does the speaker feel?", ["Grateful for the reminder", "Annoyed that nobody told them in time", "Happy the meeting was cancelled", "Worried about being late"], 1],
 [2, "We're fully booked on Saturday, but there are still a couple of tables free on Sunday evening.", "q", "What can the customer do?", ["Book a table on Saturday", "Book a table on Sunday evening", "Come without booking on Saturday", "Nothing, the restaurant is closed"], 1],
 [3, "Although the new policy was meant to cut costs, it has actually led to a rise in overtime, which more than cancels out the savings.", "q", "What is the speaker's main point?", ["The policy saved a lot of money", "The policy reduced overtime", "The policy's savings were wiped out by extra overtime", "Overtime has nothing to do with costs"], 2],
 [3, "I'd be lying if I said I wasn't tempted by the offer, but relocating with two young kids just isn't on the cards right now.", "q", "What will the speaker probably do?", ["Accept the offer and move", "Turn the offer down for now", "Ask for a higher salary", "Move without the children"], 1],
 [3, "Had the forecast been more accurate, the organisers would never have gone ahead with an outdoor event.", "q", "What do we learn about the event?", ["It was held indoors as planned", "The forecast was wrong and it was held outdoors", "It was cancelled because of rain", "The organisers ignored an accurate forecast"], 1],
 [4, "Far from being a passing fad, remote work has fundamentally reshaped how companies think about office space and talent.", "q", "What is the speaker's view of remote work?", ["It is a short-lived trend", "It has caused lasting change", "It has made offices more crowded", "It only affects small companies"], 1],
 [4, "The minister's remarks, while ostensibly conciliatory, did little to placate critics who regard the reform as fundamentally flawed.", "q", "How did critics react?", ["They were satisfied by the remarks", "They remained unconvinced", "They withdrew their criticism", "They praised the reform"], 1],
 [4, "It's not so much that the data are wrong as that they've been cherry-picked to support a conclusion reached in advance.", "q", "What is the problem with the data?", ["They are completely false", "They were selected to fit an existing conclusion", "They are out of date", "They were collected too quickly"], 1],
];
// ĐỌC: [lv, đoạn văn, câu hỏi, đáp án..., chỉ số đúng]
const PL_READ = [
 [0, "Hi Lan, I'm at the café near the park. I'm wearing a red coat. The café has a big green door. See you soon! – Minh", "Where is Minh?", ["At the park", "At a café", "At home", "At school"], 1],
 [0, "Tom gets up at six. He has breakfast with his mother and walks to school. After school, he plays football with his friends.", "How does Tom go to school?", ["By bus", "By bike", "On foot", "By car"], 2],
 [1, "Dear guests, the swimming pool will be closed on Monday for cleaning. It will open again on Tuesday at 7 a.m. We are sorry for any problems this may cause.", "When can guests use the pool again?", ["On Monday afternoon", "On Tuesday morning", "Next week", "It is closed for good"], 1],
 [1, "Mai started learning the guitar last year. At first she practised every day, but now she only plays at weekends because she is busy with her new job.", "Why does Mai play less now?", ["She doesn't like the guitar", "Her guitar is broken", "She has a new job", "She moved house"], 2],
 [2, "Many people believe that drinking coffee dehydrates you. However, recent studies suggest that moderate coffee drinking contributes to your daily fluid intake in much the same way as water does.", "What do recent studies suggest?", ["Coffee always dehydrates you", "Moderate coffee drinking adds to your fluid intake", "Coffee is healthier than water", "People should stop drinking coffee"], 1],
 [2, "The company has decided to let staff work from home two days a week. Managers hope this will reduce stress, although some worry that teamwork may suffer.", "What concern do some people have?", ["Staff will be more stressed", "Teamwork might get worse", "The office will close", "Managers will work from home"], 1],
 [3, "While electric cars produce no exhaust emissions, critics point out that their overall environmental impact depends heavily on how the electricity is generated and how the batteries are produced and recycled.", "What is the critics' main argument?", ["Electric cars are more polluting than petrol cars", "Their real impact depends on electricity and battery production", "Batteries cannot be recycled", "Electric cars produce exhaust emissions"], 1],
 [3, "The novel's early chapters move at a frustratingly slow pace, yet readers who persevere are rewarded with one of the most gripping final acts in recent fiction.", "What does the writer think of the novel?", ["It is slow throughout", "It starts slowly but the ending is excellent", "It should be shorter at the end", "It is not worth finishing"], 1],
 [4, "Proponents of the four-day week contend that productivity gains offset the reduction in hours; sceptics counter that such findings stem largely from self-selected firms whose experience may not generalise.", "Why are sceptics doubtful?", ["The trials lasted too long", "The firms involved chose to take part, so results may not apply widely", "Productivity fell in every trial", "Workers disliked the shorter week"], 1],
 [4, "The museum's decision to repatriate the artefacts, long resisted on the grounds of preservation, marks a tacit acknowledgement that custodianship cannot be divorced from questions of provenance.", "What does the decision suggest?", ["The museum can no longer preserve the artefacts", "The museum now accepts that origin matters in deciding who keeps them", "The artefacts were fakes", "Preservation is no longer important"], 1],
];
// NÓI: [lv, câu đọc to]
const PL_SPEAK = [
 [0, "My name is Lan and I live in Hanoi."],
 [0, "I like coffee, but I don't like tea."],
 [1, "Last weekend I visited my grandparents in the countryside."],
 [1, "Could you tell me how to get to the station, please?"],
 [2, "I've been learning English for two years because I want to work abroad."],
 [2, "If it rains tomorrow, we'll have to cancel the trip."],
 [3, "Although the project was challenging, it taught me how to manage my time effectively."],
 [3, "I'd rather have stayed at home than waste the whole evening in traffic."],
 [4, "Despite considerable opposition, the proposal was eventually approved by a narrow majority."],
 [4, "Her argument, though persuasive at first glance, overlooks several crucial factors."],
];
const PL_PARTS = [
  {k:"grammar", n:5, ic:"pencil", vi:"Ngữ pháp & từ vựng", en:"Grammar & vocabulary"},
  {k:"listening", n:2, ic:"headphones", vi:"Nghe", en:"Listening"},
  {k:"reading", n:1, ic:"book", vi:"Đọc", en:"Reading"},
  {k:"speaking", n:1, ic:"mic", vi:"Nói", en:"Speaking"},
];
const SKILL_NAMES = {grammar:["Ngữ pháp & từ vựng","Grammar & vocabulary","pencil"], listening:["Nghe","Listening","headphones"], reading:["Đọc","Reading","book"], speaking:["Nói","Speaking","mic"], writing:["Viết","Writing","sparkle"]};
const SKILL_W = {grammar:.30, listening:.25, reading:.20, writing:.15, speaking:.10};


// Bài học mẫu, dùng khi chưa có AI
const W = (w,ipa,pos,vi,ex,ex_vi) => ({w,ipa,pos,vi,ex,ex_vi});
const BANK = [
 {topic:"Chào hỏi & giới thiệu bản thân",scenario:"Ngày đầu đi làm, gặp đồng nghiệp mới",
  words:[W("introduce","/ˌɪntrəˈdjuːs/","Động từ","giới thiệu","Let me introduce my friend Lan.","Để tôi giới thiệu bạn tôi, Lan."),
   W("colleague","/ˈkɒliːɡ/","Danh từ","đồng nghiệp","She is my colleague at the bank.","Cô ấy là đồng nghiệp của tôi ở ngân hàng."),
   W("hometown","/ˈhəʊmtaʊn/","Danh từ","quê nhà","My hometown is Da Nang.","Quê tôi là Đà Nẵng."),
   W("occupation","/ˌɒkjuˈpeɪʃn/","Danh từ","nghề nghiệp","What is your occupation?","Nghề nghiệp của bạn là gì?"),
   W("hobby","/ˈhɒbi/","Danh từ","sở thích","My hobby is playing badminton.","Sở thích của tôi là chơi cầu lông."),
   W("nice to meet you","/naɪs tə miːt juː/","Cụm từ","rất vui được gặp bạn","Hi Tom, nice to meet you.","Chào Tom, rất vui được gặp bạn."),
   W("originally","/əˈrɪdʒənəli/","Trạng từ","vốn dĩ, gốc là","I'm originally from Hue.","Tôi vốn là người Huế."),
   W("currently","/ˈkʌrəntli/","Trạng từ","hiện tại","I currently work in Ho Chi Minh City.","Hiện tại tôi làm việc ở TP.HCM.")],
  grammar:{name:"Động từ to be (am / is / are)",pattern:"I am · He/She/It is · You/We/They are",
   note:"Dùng to be để nói tên, nghề nghiệp, quê quán, tính chất. Chủ ngữ số nhiều luôn đi với are.",
   quiz:[{q:"My colleagues ___ very friendly.",opts:["are","is","am","be"],ans:0,explain:"Colleagues là số nhiều nên dùng are."},
    {q:"I ___ originally from Hue.",opts:["am","is","are","be"],ans:0,explain:"Chủ ngữ I luôn đi với am."},
    {q:"What ___ your occupation?",opts:["is","are","am","be"],ans:0,explain:"Occupation là danh từ số ít nên dùng is."}]},
  translations:[{src:"Tôi là kỹ sư phần mềm.",ref:"I am a software engineer.",dir:"vi-en"},
   {src:"My colleague is originally from Hanoi.",ref:"Đồng nghiệp của tôi vốn là người Hà Nội.",dir:"en-vi"},
   {src:"Sở thích của tôi là đọc sách.",ref:"My hobby is reading books.",dir:"vi-en"},
   {src:"Nice to meet you. I'm currently a student.",ref:"Rất vui được gặp bạn. Hiện tại tôi là sinh viên.",dir:"en-vi"}],
  roleplay:{ai_role:"Alex, a friendly new colleague from the design team",user_role:"Nhân viên mới",setting:"Bạn gặp Alex ở phòng pantry trong ngày đầu đi làm.",
   tasks:["Giới thiệu tên và quê","Nói về công việc hiện tại","Hỏi về sở thích của Alex"],opening:"Hi! I don't think we've met. I'm Alex from the design team. And you are?"}},
 {topic:"Làm thủ tục ở sân bay",scenario:"Check-in và gửi hành lý trước chuyến bay",
  words:[W("boarding pass","/ˈbɔːdɪŋ pɑːs/","Danh từ","thẻ lên máy bay","Here is your boarding pass.","Đây là thẻ lên máy bay của bạn."),
   W("luggage","/ˈlʌɡɪdʒ/","Danh từ","hành lý","My luggage is too heavy.","Hành lý của tôi quá nặng."),
   W("delay","/dɪˈleɪ/","Danh từ","sự trì hoãn","There is a two-hour delay.","Chuyến bay bị hoãn hai tiếng."),
   W("gate","/ɡeɪt/","Danh từ","cổng ra máy bay","Our flight leaves from gate 12.","Chuyến bay của chúng ta khởi hành ở cổng 12."),
   W("check in","/tʃek ɪn/","Cụm động từ","làm thủ tục","We need to check in early.","Chúng ta cần làm thủ tục sớm."),
   W("aisle seat","/aɪl siːt/","Danh từ","ghế cạnh lối đi","Could I have an aisle seat?","Tôi có thể ngồi ghế cạnh lối đi không?"),
   W("passport","/ˈpɑːspɔːt/","Danh từ","hộ chiếu","May I see your passport?","Cho tôi xem hộ chiếu của bạn được không?"),
   W("departure","/dɪˈpɑːtʃə/","Danh từ","sự khởi hành","The departure time is 9 a.m.","Giờ khởi hành là 9 giờ sáng.")],
  grammar:{name:"Lời đề nghị lịch sự với Can / Could",pattern:"Can/Could + I/you + động từ nguyên mẫu?",
   note:"Could lịch sự hơn Can. Sau Can/Could luôn là động từ nguyên mẫu, không thêm to hay -ing.",
   quiz:[{q:"___ I see your passport, please?",opts:["Could","Must","Should","Will"],ans:0,explain:"Xin phép lịch sự dùng Could I...?"},
    {q:"Could you ___ me with my luggage?",opts:["help","helping","helped","to help"],ans:0,explain:"Sau could là động từ nguyên mẫu."},
    {q:"Can I ___ an aisle seat?",opts:["have","having","had","has"],ans:0,explain:"Sau can là động từ nguyên mẫu."}]},
  translations:[{src:"Chuyến bay của tôi bị hoãn.",ref:"My flight is delayed.",dir:"vi-en"},
   {src:"Could I have a window seat?",ref:"Tôi có thể ngồi ghế cạnh cửa sổ không?",dir:"en-vi"},
   {src:"Tôi có thể gửi hành lý ở đâu?",ref:"Where can I check in my luggage?",dir:"vi-en"},
   {src:"Please go to gate 5 before 8 a.m.",ref:"Vui lòng đến cổng 5 trước 8 giờ sáng.",dir:"en-vi"}],
  roleplay:{ai_role:"an airline check-in staff member",user_role:"Hành khách",setting:"Bạn đang ở quầy check-in của hãng hàng không.",
   tasks:["Đưa hộ chiếu và nói điểm đến","Gửi một kiện hành lý","Xin ghế cạnh lối đi"],opening:"Good morning! May I see your passport, please? Where are you flying today?"}},
 {topic:"Gọi món ở nhà hàng",scenario:"Đặt món và thanh toán ở nhà hàng",
  words:[W("menu","/ˈmenjuː/","Danh từ","thực đơn","Could we see the menu, please?","Cho chúng tôi xem thực đơn được không?"),
   W("recommend","/ˌrekəˈmend/","Động từ","gợi ý, giới thiệu","What do you recommend?","Bạn gợi ý món gì?"),
   W("order","/ˈɔːdə/","Động từ","gọi món","I'd like to order now.","Tôi muốn gọi món bây giờ."),
   W("bill","/bɪl/","Danh từ","hóa đơn","Can we have the bill, please?","Cho chúng tôi xin hóa đơn."),
   W("spicy","/ˈspaɪsi/","Tính từ","cay","Is this soup spicy?","Món súp này có cay không?"),
   W("vegetarian","/ˌvedʒəˈteəriən/","Tính từ","ăn chay","Do you have vegetarian dishes?","Nhà hàng có món chay không?"),
   W("dessert","/dɪˈzɜːt/","Danh từ","món tráng miệng","I'd like ice cream for dessert.","Tôi muốn ăn kem tráng miệng."),
   W("reservation","/ˌrezəˈveɪʃn/","Danh từ","sự đặt bàn","I have a reservation for two.","Tôi đã đặt bàn cho hai người.")],
  grammar:{name:"Would like / I'd like",pattern:"I'd like + danh từ · I'd like to + động từ",
   note:"I'd like là cách nói lịch sự của I want. Sau I'd like to là động từ nguyên mẫu.",
   quiz:[{q:"I'd like ___ the chicken, please.",opts:["to order","order","ordering","ordered"],ans:0,explain:"I'd like to + động từ nguyên mẫu."},
    {q:"___ you like some dessert?",opts:["Would","Do","Are","Will"],ans:0,explain:"Câu mời lịch sự: Would you like...?"},
    {q:"I'd like ___ glass of water.",opts:["a","an","some","any"],ans:0,explain:"Glass bắt đầu bằng phụ âm nên dùng a."}]},
  translations:[{src:"Tôi muốn gọi một ly cà phê sữa.",ref:"I'd like a milk coffee.",dir:"vi-en"},
   {src:"What do you recommend?",ref:"Bạn gợi ý món gì?",dir:"en-vi"},
   {src:"Món này có cay không?",ref:"Is this dish spicy?",dir:"vi-en"},
   {src:"We have a reservation for four at 7 p.m.",ref:"Chúng tôi đã đặt bàn bốn người lúc 7 giờ tối.",dir:"en-vi"}],
  roleplay:{ai_role:"a waiter at a Western restaurant",user_role:"Thực khách",setting:"Bạn vừa ngồi vào bàn đã đặt trước.",
   tasks:["Hỏi món được gợi ý","Gọi một món không cay","Xin hóa đơn"],opening:"Good evening! Here is the menu. Can I get you something to drink first?"}},
 {topic:"Họp nhóm hằng ngày",scenario:"Báo cáo tiến độ trong buổi họp sáng",
  words:[W("deadline","/ˈdedlaɪn/","Danh từ","hạn chót","The deadline is next Friday.","Hạn chót là thứ Sáu tới."),
   W("update","/ˈʌpdeɪt/","Danh từ","bản cập nhật","Can you give us a quick update?","Bạn cập nhật nhanh cho cả nhóm được không?"),
   W("task","/tɑːsk/","Danh từ","nhiệm vụ","I am working on this task.","Tôi đang làm nhiệm vụ này."),
   W("priority","/praɪˈɒrəti/","Danh từ","ưu tiên","This bug is our top priority.","Lỗi này là ưu tiên hàng đầu."),
   W("schedule","/ˈʃedjuːl/","Động từ","lên lịch","Let's schedule a meeting.","Hãy lên lịch một cuộc họp."),
   W("feedback","/ˈfiːdbæk/","Danh từ","góp ý","Thanks for your feedback.","Cảm ơn góp ý của bạn."),
   W("issue","/ˈɪʃuː/","Danh từ","vấn đề","We have an issue with the server.","Chúng ta gặp vấn đề với máy chủ."),
   W("progress","/ˈprəʊɡres/","Danh từ","tiến độ","We are making good progress.","Chúng ta đang tiến triển tốt.")],
  grammar:{name:"Thì hiện tại tiếp diễn",pattern:"S + am/is/are + V-ing",
   note:"Dùng để nói việc đang diễn ra lúc này hoặc trong giai đoạn hiện tại, rất hay dùng khi báo cáo tiến độ.",
   quiz:[{q:"I ___ on the login page right now.",opts:["am working","work","worked","am work"],ans:0,explain:"Việc đang diễn ra: am + V-ing."},
    {q:"The team ___ the new feature this week.",opts:["is testing","test","tests","are test"],ans:0,explain:"Team là chủ ngữ số ít: is + V-ing."},
    {q:"What ___ you working on?",opts:["are","is","do","does"],ans:0,explain:"Câu hỏi: are + you + V-ing."}]},
  translations:[{src:"Tôi đang làm nhiệm vụ đó.",ref:"I am working on that task.",dir:"vi-en"},
   {src:"The deadline is tomorrow.",ref:"Hạn chót là ngày mai.",dir:"en-vi"},
   {src:"Chúng tôi đang gặp một vấn đề với máy chủ.",ref:"We are having an issue with the server.",dir:"vi-en"},
   {src:"This bug is our top priority this week.",ref:"Lỗi này là ưu tiên hàng đầu của chúng ta tuần này.",dir:"en-vi"}],
  roleplay:{ai_role:"Sarah, your team leader running the daily stand-up",user_role:"Thành viên nhóm",setting:"Buổi họp 15 phút đầu ngày của nhóm.",
   tasks:["Báo cáo việc đang làm","Nêu một khó khăn đang gặp","Hỏi lại về hạn chót"],opening:"Morning everyone. Let's start with you. What are you working on today?"}},
 {topic:"Hỏi đường",scenario:"Hỏi đường đến nhà ga khi bị lạc",
  words:[W("straight","/streɪt/","Trạng từ","thẳng","Go straight for two blocks.","Đi thẳng qua hai dãy nhà."),
   W("turn left","/tɜːn left/","Cụm động từ","rẽ trái","Turn left at the bank.","Rẽ trái ở ngân hàng."),
   W("corner","/ˈkɔːnə/","Danh từ","góc đường","The shop is on the corner.","Cửa hàng ở góc đường."),
   W("opposite","/ˈɒpəzɪt/","Giới từ","đối diện","The hotel is opposite the park.","Khách sạn đối diện công viên."),
   W("nearby","/ˌnɪəˈbaɪ/","Trạng từ","gần đây","Is there a pharmacy nearby?","Có nhà thuốc nào gần đây không?"),
   W("get lost","/ɡet lɒst/","Cụm động từ","bị lạc","I think I got lost.","Tôi nghĩ là tôi bị lạc rồi."),
   W("crossroads","/ˈkrɒsrəʊdz/","Danh từ","ngã tư","Turn right at the crossroads.","Rẽ phải ở ngã tư."),
   W("block","/blɒk/","Danh từ","dãy nhà","It's two blocks away.","Cách đây hai dãy nhà.")],
  grammar:{name:"Câu mệnh lệnh khi chỉ đường",pattern:"Động từ nguyên mẫu + ... (Go / Turn / Take)",
   note:"Câu chỉ đường bắt đầu bằng động từ nguyên mẫu, không cần chủ ngữ. Thêm please để lịch sự hơn.",
   quiz:[{q:"___ straight and turn right at the lights.",opts:["Go","Going","Goes","To go"],ans:0,explain:"Câu mệnh lệnh bắt đầu bằng động từ nguyên mẫu."},
    {q:"The station is ___ the post office.",opts:["opposite","straight","turn","nearby"],ans:0,explain:"Opposite + danh từ: đối diện cái gì."},
    {q:"___ the second street on the left.",opts:["Take","Taking","Takes","Took"],ans:0,explain:"Take the ... street: đi vào con đường thứ..."}]},
  translations:[{src:"Có nhà thuốc nào gần đây không?",ref:"Is there a pharmacy nearby?",dir:"vi-en"},
   {src:"Turn right at the corner.",ref:"Rẽ phải ở góc đường.",dir:"en-vi"},
   {src:"Nhà ga cách đây hai dãy nhà.",ref:"The station is two blocks away.",dir:"vi-en"},
   {src:"I got lost, could you help me?",ref:"Tôi bị lạc, bạn giúp tôi được không?",dir:"en-vi"}],
  roleplay:{ai_role:"a helpful local person on the street",user_role:"Du khách bị lạc",setting:"Bạn đang ở trung tâm thành phố và không tìm thấy nhà ga.",
   tasks:["Nói rằng bạn bị lạc","Hỏi đường đến nhà ga","Hỏi đi bộ mất bao lâu"],opening:"Hi there, you look a bit lost. Can I help you?"}},
 {topic:"Mua sắm quần áo",scenario:"Hỏi size, mặc thử và thanh toán",
  words:[W("discount","/ˈdɪskaʊnt/","Danh từ","giảm giá","Is there a discount today?","Hôm nay có giảm giá không?"),
   W("size","/saɪz/","Danh từ","kích cỡ","Do you have this in a smaller size?","Có size nhỏ hơn không?"),
   W("try on","/traɪ ɒn/","Cụm động từ","mặc thử","Can I try on this jacket?","Tôi mặc thử áo khoác này được không?"),
   W("receipt","/rɪˈsiːt/","Danh từ","biên lai","Here is your receipt.","Đây là biên lai của bạn."),
   W("refund","/ˈriːfʌnd/","Danh từ","hoàn tiền","I'd like a refund, please.","Tôi muốn được hoàn tiền."),
   W("cash","/kæʃ/","Danh từ","tiền mặt","Can I pay in cash?","Tôi trả tiền mặt được không?"),
   W("fitting room","/ˈfɪtɪŋ ruːm/","Danh từ","phòng thử đồ","The fitting room is over there.","Phòng thử đồ ở đằng kia."),
   W("on sale","/ɒn seɪl/","Cụm từ","đang giảm giá","These shoes are on sale.","Đôi giày này đang giảm giá.")],
  grammar:{name:"How much / How many",pattern:"How much + danh từ không đếm được / giá · How many + danh từ số nhiều",
   note:"Hỏi giá dùng How much is/are...? Hỏi số lượng đồ đếm được dùng How many.",
   quiz:[{q:"How ___ is this shirt?",opts:["much","many","long","often"],ans:0,explain:"Hỏi giá: How much."},
    {q:"How ___ items can I take into the fitting room?",opts:["many","much","long","far"],ans:0,explain:"Items đếm được, số nhiều: How many."},
    {q:"How much ___ these shoes?",opts:["are","is","do","does"],ans:0,explain:"Shoes số nhiều: How much are...?"}]},
  translations:[{src:"Tôi có thể mặc thử cái áo này không?",ref:"Can I try on this shirt?",dir:"vi-en"},
   {src:"How much is this bag?",ref:"Cái túi này bao nhiêu tiền?",dir:"en-vi"},
   {src:"Đôi giày này đang giảm giá phải không?",ref:"Are these shoes on sale?",dir:"vi-en"},
   {src:"Please keep your receipt for a refund.",ref:"Vui lòng giữ biên lai để được hoàn tiền.",dir:"en-vi"}],
  roleplay:{ai_role:"a shop assistant in a clothing store",user_role:"Khách mua hàng",setting:"Bạn đang xem áo khoác trong một cửa hàng quần áo.",
   tasks:["Hỏi size nhỏ hơn","Xin mặc thử","Hỏi giảm giá và trả tiền"],opening:"Hello! Are you looking for anything in particular today?"}}
];

/* =====================================================================
   TIỆN ÍCH
   ===================================================================== */
const $ = s => document.querySelector(s);
const esc = t => String(t ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const today = () => { const d = new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); };
const shuffle = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
const norm = s => String(s).toLowerCase().normalize("NFC").replace(/[^\p{L}\p{N}\s']/gu, " ").split(/\s+/).filter(Boolean);
const clean = s => norm(s).join(" ");
const fmtTime = ms => { const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
function lev(a, b) { const m = a.length, n = b.length, d = Array.from({length: m + 1}, (_, i) => [i]); for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i-1][j] + 1, d[i][j-1] + 1, d[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1)); return d[m][n]; }
// Bọc từng từ tiếng Anh để bấm vào tra nghĩa
const tw = t => esc(t).replace(/(&[a-z#0-9]+;)|([A-Za-z][A-Za-z'’-]*)/g, (m, ent, w) => ent ? ent : `<span class="w" data-w="${w}">${w}</span>`);
// Đọc văn bản: chọn giọng tiếng Anh tự nhiên nhất mà máy có
let VOICES = [];
function loadVoices() { try { VOICES = speechSynthesis.getVoices().filter(v => /^en[-_]/i.test(v.lang)); } catch (e) {} if (typeof view !== "undefined" && view === "settings") render(); }
function pickVoice() { const name = pref("ep_voice");
  return VOICES.find(v => v.name === name) || VOICES.find(v => /natural|online/i.test(v.name) && /en-US/i.test(v.lang)) || VOICES.find(v => /Google US English/i.test(v.name)) || VOICES.find(v => /en-US/i.test(v.lang)) || VOICES[0]; }
// Bọc từng âm tiết tiếng Việt để bấm vào xem từ tiếng Anh tương ứng
const twv = t => esc(t).replace(/(&[a-z#0-9]+;)|([\p{L}]+)/gu, (m, ent, w) => ent ? ent : `<span class="wv" data-s="${w}">${w}</span>`);
// ---- Nhãn dán & linh vật (SVG trong /stickers.js) ----
const STK = () => window.STICKERS || {}, MAS = () => window.MASCOT || {};
// Biểu tượng thanh dưới (cùng nét vẽ với bộ nhãn dán)
const NAV_HOME = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" stroke="#1f2d2b" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M10 30 L32 11 L54 30" fill="none"/><path d="M15 27 V52 Q15 55 18 55 H46 Q49 55 49 52 V27 L32 13 Z" fill="#ffd166"/><path d="M27 55 V42 Q27 38 32 38 Q37 38 37 42 V55" fill="#ef7b7b"/><path d="M41 16 V9 H47 V21" fill="#9fd47a"/><circle cx="22" cy="36" r="2.5" fill="#1f2d2b" stroke="none"/></svg>`;
const NAV_GEAR = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" stroke="#1f2d2b" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M28 7 H36 L38 15 L44 18 L51 13 L57 19 L52 26 L55 32 L57 34 V38 L52 40 L50 46 L55 52 L49 58 L42 53 L36 56 L34 60 H28 L26 53 L20 50 L13 55 L8 49 L12 42 L9 36 H7 V28 L13 26 L15 20 L10 13 L16 8 L22 12 L27 9 Z" fill="#a8c7ff" transform="translate(0 -1)"/><circle cx="32" cy="32" r="9" fill="#fff"/></svg>`;
const stk = (name, size = 48, cls = "", rot) => `<span class="stk ${cls}" style="--s:${size}px;--r:${rot ?? ((String(name).length * 7) % 13 - 6)}deg">${STK()[name] || STK().star || ""}</span>`;
const mascot = (mood = "happy", size = 120, cls = "") => `<span class="mascot ${cls}" style="--s:${size}px">${MAS()[mood] || ""}</span>`;
const W_ = w => `(?<![\\p{L}])(?:${w})(?![\\p{L}])`; // khớp nguyên từ, kể cả tiếng Việt có dấu
const TOPIC_RULES = [
  ["chào hỏi|giới thiệu|làm quen|kết bạn|small talk|mạng xã hội|nhắn tin|gọi điện", "chat", "sun"],
  ["sân bay|máy bay|chuyến bay|airport|flight|hành lý|visa", "plane", "sky"],
  ["khách sạn|homestay|hotel|đặt phòng|ký túc xá", "suitcase", "mint"],
  ["nhà hàng|quán ăn|gọi món|ăn uống|cà phê|restaurant|thực đơn", "coffee", "coral"],
  ["phỏng vấn|xin việc|tuyển dụng|interview|ứng viên", "briefcase", "sun"],
  ["họp|stand-up|code|bug|kỹ thuật|phần mềm|email|tài liệu|báo cáo|ticket|IT|dự án|khách hàng", "laptop", "lilac"],
  ["hỏi đường|chỉ đường|bản đồ|taxi|tàu|phương tiện|tham quan|du lịch", "map", "mint"],
  ["mua sắm|cửa hàng|giảm giá|trả giá|shopping|sales|bán hàng", "bag", "pink"],
  ["hẹn hò|tình cảm|người yêu|gia đình|nuôi dạy", "heart", "pink"],
  ["bệnh|khám|thuốc|y tế|bác sĩ|bệnh viện|dược", "pill", "coral"],
  ["thuyết trình|phát biểu|dẫn chương trình|presentation|đám đông", "mic", "lilac"],
  ["du học|trường học|lớp học|giảng dạy|giáo dục|IELTS|TOEIC|TOEFL|VSTEP|kỳ thi|Writing|Reading|Speaking|Listening", "cap", "sky"],
  ["ôn tập|củng cố", "book", "mint"]
].map(([w, s, h]) => [new RegExp(W_(w), "iu"), s, h]);
const topicStk = t => (TOPIC_RULES.find(([re]) => re.test(t || "")) || [null, "globe", "sky"]).slice(1);
const GOAL_STK = {communication:"chat", work:"briefcase", travel:"plane", exam:"cap"};
const STEP_STK = ["book", "sparkle", "pencil", "globe", "chat", "trophy"];
const WEEK_STK = ["star", "flame", "target", "sparkle", "trophy", "heart", "globe", "book"];
const confetti = (n = 42) => `<div class="confetti" aria-hidden="true">${Array.from({length:n}, (_, i) => `<i style="left:${(Math.random() * 100).toFixed(1)}%;animation-delay:${(Math.random() * .9).toFixed(2)}s;animation-duration:${(2.4 + Math.random() * 1.8).toFixed(2)}s;background:${["#ffc94a","#ff7a59","#5bb8ff","#4fd1a5","#a78bfa","#ff9ec7"][i % 6]};--rot:${Math.round(Math.random() * 720)}deg"></i>`).join("")}</div>`;
const BADGES = [
  {id:"first", name:_t("Bước đầu tiên"), desc:_t("Hoàn thành buổi học đầu tiên"), stk:"star"},
  {id:"streak3", name:_t("Lửa nhỏ"), desc:_t("Học 3 ngày liên tiếp"), stk:"flame"},
  {id:"streak7", name:_t("Lửa bùng cháy"), desc:_t("Học 7 ngày liên tiếp"), stk:"sparkle"},
  {id:"week", name:_t("Tròn một tuần"), desc:_t("Hoàn thành 5 buổi học"), stk:"calendar"},
  {id:"perfect", name:_t("Điểm tuyệt đối"), desc:_t("Đạt từ 90 điểm trong một buổi"), stk:"trophy"},
  {id:"speaker", name:_t("Giọng vàng"), desc:_t("Phát âm đạt từ 80%"), stk:"mic"},
  {id:"listener", name:_t("Tai thính"), desc:_t("Nghe chép đúng từ 80%"), stk:"headphones"},
  {id:"chatter", name:_t("Nói như gió"), desc:_t("Role-play đạt từ 80 điểm"), stk:"chat"},
  {id:"words50", name:_t("Kho 50 từ"), desc:_t("Có 50 từ trong flashcard"), stk:"book"},
  {id:"words100", name:_t("Kho 100 từ"), desc:_t("Có 100 từ trong flashcard"), stk:"globe"},
  {id:"ace", name:_t("Thủ khoa Unit"), desc:_t("Kiểm tra định kỳ đạt từ 85%"), stk:"target"},
  {id:"course", name:_t("Tốt nghiệp"), desc:_t("Hoàn thành một khóa học"), stk:"cap"}
];
const BADGE = Object.fromEntries(BADGES.map(b => [b.id, b]));
function checkBadges() {
  S.badges = S.badges || {}; const got = [];
  const give = id => { if (!S.badges[id]) { S.badges[id] = today(); got.push(id); } };
  const last = S.sessions[S.sessions.length - 1], st = streak(), nw = Object.keys(S.cards).length;
  if (S.sessions.length) give("first"); if (st >= 3) give("streak3"); if (st >= 7) give("streak7");
  if (doneN() >= 5) give("week"); if (last?.total >= 90) give("perfect");
  if (last?.scores?.speaking >= 80) give("speaker"); if (last?.scores?.listening >= 80) give("listener"); if (last?.scores?.roleplay >= 80) give("chatter");
  if (nw >= 50) give("words50"); if (nw >= 100) give("words100");
  if (S.tests.some(t => t.score >= 85)) give("ace"); if (S.courses.length) give("course");
  if (got.length) { save(); UI.celebrate = [...(UI.celebrate || []), ...got]; }
  return got;
}
const badgeCard = (b, on = true, date) => `<div class="badge-item ${on ? "" : "locked"}">${stk(b.stk, 60)}<b>${b.name}</b><span>${b.desc}</span>${date ? `<em>${date}</em>` : ""}</div>`;
// ---- Dịch ngay trong trang (/api/translate) ----
const TRC = {};
const trKey = (t, sl, tl) => sl + "|" + tl + "|" + t;
function trBtn(text, sl = "en", tl = "vi", label = _t("Dịch")) {
  const k = trKey(text, sl, tl), r = TRC[k];
  return `<span class="trbox"><button class="mini trbtn" data-a="tr" data-v="${esc(k)}" ${r === "…" ? "disabled" : ""}>${r === "…" ? `${_t("<span class=\"spin\"></span> Đang dịch")}` : r ? _t("Ẩn bản dịch") : "🌐 " + label}</button>${r && r !== "…" ? `<span class="tr-out">${esc(r.text)}${r.ipa ? `<span class="ipa tr-ipa">${esc(r.ipa)}</span>` : ""}<em>${esc(r.engine)}</em></span>` : ""}</span>`;
}
// IPA cả câu: ghép IPA từng từ (từ điển + từ đã học), từ không tra được giữ nguyên chữ
const IPAC = {};
function knownIPA() {
  const m = {}, add = w => { if (w && w.w && /^\/.+\/$/.test((w.ipa || "").trim()) && !/\s/.test(w.w.trim())) m[w.w.toLowerCase().trim()] = w.ipa.trim().slice(1, -1); };
  try { (window.LESSON_BANK ? Object.values(window.LESSON_BANK).flat() : []).forEach(l => (l.words || []).forEach(x => add(normWord(x)))); } catch (e) {}
  try { Object.values(S.lessons || {}).forEach(l => (l?.words || []).forEach(add)); (S.cards || []).forEach(c => add(c.w)); } catch (e) {}
  return m;
}
async function sentIPA(text) {
  if (/[à-ỹđ]/i.test(String(text).normalize("NFC").replace(/[a-z]/gi, ""))) return "";
  const toks = String(text).match(/[A-Za-z]+(?:['’][A-Za-z]+)*|\d+/g); if (!toks) return "";
  const known = knownIPA(), list = toks.slice(0, 40).map(t => t.toLowerCase().replace(/’/g, "'"));
  const ipas = await Promise.all(list.map(t => /^\d+$/.test(t) ? t : dictIPA(t, known)));
  return ipas.some((x, i) => x && x !== list[i]) ? "/" + ipas.map((x, i) => x || toks[i]).join(" ") + "/" : "";
}
async function dictIPA(t, known) {
  if (known[t]) return known[t];
  if (t in IPAC) return IPAC[t];
  let v = "";
  try { const r = await timeoutFetch("/api/dict?w=" + encodeURIComponent(t), {}, 8000);
    if (r.ok) { const j = (await r.json())[0]; v = (j?.phonetic || j?.phonetics?.find(p => p.text)?.text || "").replace(/^\/|\/$/g, "").replace(/^\[|\]$/g, ""); } } catch (e) {}
  return IPAC[t] = v;
}
async function doTranslate(k) {
  if (TRC[k] && TRC[k] !== "…") { delete TRC[k]; return render(); }
  const [sl, tl, ...rest] = k.split("|"), text = rest.join("|");
  TRC[k] = "…"; render();
  try { const r = await timeoutFetch(`/api/translate?sl=${sl}&tl=${tl}&q=${encodeURIComponent(text)}`, {}, 15000); const d = await r.json();
    if (!r.ok) throw new Error(d.error || _t("lỗi ") + r.status); const en = sl === "en" ? text : tl === "en" ? d.text : ""; TRC[k] = {text:d.text, engine:d.engine, ipa: en ? await sentIPA(en) : ""}; }
  catch (e) { delete TRC[k]; toast(_t("Chưa dịch được: ") + (e.name === "AbortError" ? _t("quá chậm") : e.message)); }
  render();
}
const gtLink = (t, sl, tl) => `https://translate.google.com/?sl=${sl}&tl=${tl}&op=translate&text=${encodeURIComponent(t)}`;
// Tốc độ đọc: mặc định 0.8 (chậm hơn tốc độ máy). Đổi giá trị cũ sang thang mới.
function ttsRate() { const v = pref("ep_rate"), old = {"0.95":"0.8", "1.1":"0.95", "0.75":"0.7"}; return Number(old[v] || v || 0.8); }
function say(t, rate) { return new Promise(res => { try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(String(t).replace(/_+/g, " blank "));
  const v = pickVoice(); if (v) { u.voice = v; u.lang = v.lang; } else u.lang = "en-US";
  u.rate = rate || ttsRate(); u.onend = res; u.onerror = res; speechSynthesis.speak(u); } catch (e) { res(); } }); }
// Nhận giọng nói (Chrome, Edge)
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let REC = null;
function hear(onInterim) { return new Promise((resolve, reject) => {
  if (!SR) return reject(new Error("unsupported"));
  try { speechSynthesis.cancel(); } catch (e) {}
  const r = new SR(); REC = r; r.lang = "en-US"; r.interimResults = true; r.maxAlternatives = 3; r.continuous = false;
  let text = "", alts = [];
  r.onresult = e => { let t = ""; for (let i = 0; i < e.results.length; i++) { t += e.results[i][0].transcript; if (e.results[i].isFinal) alts = Array.from(e.results[i]).map(a => a.transcript); } text = t; onInterim && onInterim(t); };
  r.onerror = e => { REC = null; reject(new Error(e.error)); };
  r.onend = () => { REC = null; resolve({text:text.trim(), alts}); };
  r.start(); }); }
const micErr = e => /not-allowed|service-not-allowed/.test(e.message) ? _t("Trình duyệt chưa cho phép dùng micro. Bấm biểu tượng bên trái thanh địa chỉ và cho phép Micro.") :
  e.message === "no-speech" ? _t("Không nghe thấy gì. Hãy nói to, rõ và gần micro hơn.") : e.message === "unsupported" ? _t("Trình duyệt này không hỗ trợ nhận giọng nói. Hãy dùng Chrome hoặc Edge.") :
  e.message === "network" ? _t("Nhận giọng nói cần kết nối Internet.") : e.message === "aborted" ? _t("Đã dừng ghi âm.") : _t("Lỗi micro: ") + e.message;
// So sánh câu nói với câu mẫu: từ nào máy nghe đúng
function pronScore(target, said, alts = []) {
  const tw_ = norm(target); let best = {score:-1, marks:[], said};
  for (const c of [said, ...alts].map(x => ({raw:x, w:norm(x)}))) {
    const marks = tw_.map(w => c.w.some(x => x === w || (w.length > 4 && lev(x, w) <= 1)));
    const sc = pct(marks.filter(Boolean).length, tw_.length);
    if (sc > best.score) best = {score:sc, marks, said:c.raw};
  }
  return {...best, words:tw_};
}
const markWords = (words, marks) => words.map((w, i) => `<span class="${marks[i] ? "ok-w" : "bad-w"}">${esc(w)}</span>`).join(" ");
const pronHtml = r => `<div class="fb ${r.score >= 80 ? "good" : r.score >= 50 ? "" : "bad"}${_t("\"><b>Phát âm ")}${r.score}%</b> · ${markWords(r.words, r.marks)}${_t("<br><span class=\"muted small\">Máy nghe được: \"")}${esc(r.said)}"</span>${r.score < 80 ? `${_t("<br><span class=\"small\">Từ gạch đỏ là từ máy chưa nhận ra. Bấm Nghe chậm, nghe mẫu rồi đọc lại.</span>")}` : ""}</div>`;
function dictScore(ref, text) { const rw = norm(ref), uw = norm(text); const marks = rw.map(w => uw.some(x => x === w || (w.length > 4 && lev(x, w) <= 1))); return {text, ref, score:pct(marks.filter(Boolean).length, rw.length), marks, words:rw}; }
const dictHtml = r => `<div class="fb ${r.score >= 80 ? "good" : "bad"}${_t("\"><b>Nghe đúng ")}${r.score}${_t("%</b><br>Câu gốc: ")}${markWords(r.words, r.marks)}</div>`;
const autoSpeak = () => pref("ep_autospeak") !== "0";
const hideText = () => pref("ep_hidetext") === "1";
function startRec(key, onDone) {
  if (UI.rec) { try { REC?.stop(); } catch (e) {} return; }
  UI.rec = key; render();
  hear(t => { const el = $("#live"); if (el) el.textContent = _t("Đang nghe: ") + t; })
    .then(r => { if (!r.text) throw new Error("no-speech"); UI.rec = null; onDone(r); })
    .catch(e => toast(micErr(e))).finally(() => { if (UI.rec === key) UI.rec = null; render(); });
}
function toast(msg) { const t = document.createElement("div"); t.className = "toast"; t.textContent = _t(String(msg)); document.body.appendChild(t); setTimeout(() => t.remove(), 2600); }
const pref = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } };

/* =====================================================================
   TRẠNG THÁI & LƯU TRỮ
   ===================================================================== */
const blank = () => ({v:4, revDays:{}, frozen:[], profile:null, level:null, target:null, placement:null, path:null, sessions:[], cards:{}, tests:[], lessons:{}, dict:{}, current:null, remedial:[], difficulty:0, courses:[]});
let S = blank();
let AI = {on:false, msg:_t("Đang kiểm tra...")};
let ME = null; // tài khoản đang đăng nhập: {email, name, avatar, provider}
const displayName = () => S.profile?.name || ME?.name || "";
let view = "home", UI = {rtab:"due", q:"", hx:null, menu:false};
let Q = null;      // bài quiz đang làm (test đầu vào, kiểm tra định kỳ, ôn tập)
let FC = null;     // phiên lật thẻ
let SV = null;     // bản nháp khảo sát
// Sau khi đổi ngôn ngữ ở trang khảo sát: lấy lại câu trả lời, đổi nhãn sang ngôn ngữ mới
function svRestore() {
  try {
    const d = JSON.parse(sessionStorage.getItem("ep_sv") || "null"); sessionStorage.removeItem("ep_sv"); if (!d) return null;
    const conv = x => typeof x !== "string" ? x : LANG === "en" ? _t(VI_OF[x] || x) : (VI_OF[x] || x);
    for (const k of Object.keys(d)) if (Array.isArray(d[k])) d[k] = d[k].map(conv); else if (k !== "name" && k !== "detail" && typeof d[k] === "string") d[k] = conv(d[k]);
    return {...newSv(null), ...d};
  } catch (e) { return null; }
}
let saveTimer = null;
let cancelWait = null; // bấm "Dùng bài mẫu" để thôi chờ AI

const normWord = x => Array.isArray(x) ? {w:x[0], ipa:x[1]||"", pos:"", vi:x[2]||"", ex:x[3]||"", ex_vi:""} : x;
function migrate(d) {
  const s = Object.assign(blank(), d || {});
  // Gộp flashcard trùng (cũ lưu theo chữ thường đơn giản): giữ thẻ đã ôn nhiều hơn, cộng dồn số lần quên
  if (s.cards && typeof cardKey === "function") { const m = {};
    for (const [k, c] of Object.entries(s.cards)) { const nk = cardKey(c?.w?.w || k); const o = m[nk];
      if (!o) m[nk] = c; else { const keep = (c.rep || 0) > (o.rep || 0) ? c : o, other = keep === c ? o : c; keep.lapses = (keep.lapses || 0) + (other.lapses || 0); keep.example = keep.example || other.example; keep.due = Math.min(keep.due || 0, other.due || 0) || keep.due; m[nk] = keep; } }
    s.cards = m; }
  if (s.profile) {
    if (Array.isArray(s.profile.fields)) s.profile.fields = s.profile.fields.map(relabel);
    if (Array.isArray(s.profile.subs)) s.profile.subs = s.profile.subs.map(x => { const i = x.indexOf(": "); return i < 0 ? relabel(x) : relabel(x.slice(0, i)) + ": " + relabel(x.slice(i + 2)); });
    if (Array.isArray(s.profile.weak)) s.profile.weak = s.profile.weak.map(relabel);
  }
  for (const k in s.cards) { const c = s.cards[k]; c.w = normWord(c.w); }
  for (const k in s.lessons) { const l = s.lessons[k]; if (l && l.words) l.words = l.words.map(normWord);
    if (l && typeof l.grammar === "string") l.grammar = {name:l.grammar, note:"", pattern:"", quiz:[]};
    if (l && !l.translations && l.tr) l.translations = l.tr.map(t => ({src:t[0], ref:t[1], dir:t[2] === "vi" ? "vi-en" : "en-vi"}));
    if (l && l.role && !l.roleplay) l.roleplay = {ai_role:l.role.ai, user_role:_t("Bạn"), setting:l.role.goal, tasks:[l.role.goal], opening:""}; }
  if (s.path && !s.path.id) { s.path.id = "c1"; s.path.offset = 0; s.sessions.forEach(x => x.course = x.course || "c1"); s.tests.forEach(x => x.course = x.course || "c1"); }
  if (s.current && !s.current.les) s.current = null;
  return s;
}
// Lưu tiến độ ngay khi có thay đổi (0,5 giây sau), không cần bấm "Lưu & thoát".
// Mỗi bản lưu có số thứ tự rev: điện thoại đang giữ bản cũ sẽ không ghi đè bản mới từ máy tính.
let BASE = 0, SAVING = false, DIRTY = false;
// Chế độ XEM THỬ bài (quản trị viên mở /?preview=ID): học thử như người học nhưng không lưu gì
let PREVIEW = false;
function alertBox(m) { const d = document.createElement("div"); d.style.cssText = "position:fixed;left:16px;right:16px;top:16px;z-index:9999;background:#fff3f3;color:#a12;border:2px solid #f3b;border-radius:16px;padding:14px;font-weight:700"; d.textContent = m; document.body.appendChild(d); setTimeout(() => d.remove(), 12000); }
async function startPreview(id) {
  try { const r = await timeoutFetch("/api/admin/lessons?id=" + encodeURIComponent(id), {}, 10000); const row = await r.json(); if (!r.ok) throw new Error(row.error);
    let d = row.data; if (typeof d === "string") { try { d = JSON.parse(d); } catch (e) { d = {}; } } d = d || {};
    if (!Array.isArray(d.words) || !d.words.length) throw new Error(LANG === "en" ? "this lesson has no vocabulary yet" : "bài chưa có từ vựng");
    d.grammar = d.grammar || {name:"", quiz:[]}; d.grammar.quiz = d.grammar.quiz || []; d.translate = d.translate || d.translations || []; d.roleplay = d.roleplay || {setting:"", tasks:[]};
    PREVIEW = true; const les = {...d, level:row.level, topic:row.topic, topic_en:row.topic_en, preview:true};
    if (les.topic_en) EN[les.topic] = les.topic_en; const ge = les.grammar?.name_en; if (ge) EN[les.grammar.name] = ge;
    const items = [...les.words.slice(0, 2).map(w => meaningQ(w, les.words)), ...(les.grammar?.quiz || []).slice(0, 2).map(g => gramQ(g))];
    S.current = {idx:-1, course:"preview", les, step:0, warmItems:items, prevTopic:"", vi:0, sent:{}, trans:{}, chat:[], tasksDone:[], rpEval:null, scores:{}, started:Date.now()};
    view = "lesson"; restoreLessonQuiz(); render(); toast(LANG === "en" ? "Preview mode: nothing is saved" : "Chế độ xem thử: không lưu tiến độ");
  } catch (e) { console.error(e); PREVIEW = false; const m = (LANG === "en" ? "Can't open preview: " : "Không mở được bản xem thử: ") + e.message; toast(m); setTimeout(() => { try { alertBox(m); } catch (x) {} }, 400); }
}
function save() { if (PREVIEW) return; if (["lesson", "quiz", "flip"].includes(view)) S.lastActive = today(); DIRTY = true; clearTimeout(saveTimer); saveTimer = setTimeout(pushState, 500); }
async function pushState(keepalive = false) {
  clearTimeout(saveTimer); saveTimer = null;
  if (SAVING) { saveTimer = setTimeout(pushState, 400); return; }
  SAVING = true; DIRTY = false;
  const next = BASE + 1;
  try { S.rev = next;
    const body = JSON.stringify(S);
    const r = await fetch("/api/state?base=" + BASE, {method:"PUT", keepalive: keepalive && body.length < 60000, headers:{"Content-Type":"application/json"}, body});
    if (r.status === 409) { const d = await r.json(); adoptState(d.data, _t("Đã tải tiến độ mới nhất từ thiết bị khác")); }
    else if (!r.ok) throw new Error(r.status);
    else { BASE = next; LB.at = 0; }
  } catch (e) { S.rev = BASE; DIRTY = true; saveTimer = setTimeout(pushState, 5000); if (!keepalive) toast(_t("Chưa lưu được tiến độ, app sẽ tự thử lại")); }
  SAVING = false;
}
function adoptState(data, msg) {
  if (!data) return;
  S = migrate(data); BASE = Number(S.rev || 0); try { applyFestive(); } catch (e) {}
  if (view === "lesson") { Q = null; if (L()) restoreLessonQuiz(); }
  render(); if (msg) toast(msg);
}
// Mở lại app / chuyển tab: kiểm tra máy chủ có bản mới hơn không
async function syncFromServer() {
  if (DIRTY || SAVING || saveTimer) return;
  try { const r = await timeoutFetch("/api/state", {}, 10000); if (!r.ok) return; const d = await r.json();
    if (d && Number(d.rev || 0) > BASE && !DIRTY && !SAVING) adoptState(d, _t("Đã cập nhật tiến độ từ thiết bị khác")); } catch (e) {}
}
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") syncFromServer(); else if (DIRTY) pushState(true); });
addEventListener("pagehide", () => { if (DIRTY) pushState(true); });
addEventListener("focus", syncFromServer);
setInterval(() => { if (document.visibilityState === "visible") syncFromServer(); }, 60000);
async function loadState() {
  try { const r = await timeoutFetch("/api/state", {}, 15000); if (r.ok) return migrate(await r.json()); if (r.status === 401) location.href = "/login"; } catch (e) {}
  return blank();
}

/* =====================================================================
   GEMINI
   ===================================================================== */
// AI lỗi/quá tải/hết lượt: tạm nghỉ dùng AI 2 phút để app luôn phản hồi nhanh (chấm cơ bản)
function pauseAI(reason) {
  const first = !AI.pauseUntil || Date.now() > AI.pauseUntil;
  AI.pauseUntil = Date.now() + 120e3;
  if (first) console.warn(_t("AI tạm nghỉ:"), reason);
}
let LAST_ENGINE = "", LAST_ENGINE_AT = 0, PROBE = null;
async function probeAI() {
  PROBE = "…"; render();
  try { const r = await timeoutFetch("/api/ai?probe=1", {}, 40000); PROBE = (await r.json()).list || []; } catch (e) { PROBE = [{name:_t("Kiểm tra"), ok:false, error:_t("không kết nối được")}]; }
  render();
}
async function gemini(system, prompt, json = true, history, ms = 30000) {
  const contents = history || [{role:"user", parts:[{text:prompt}]}];
  let r;
  try { r = await timeoutFetch("/api/ai", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({system, contents, json, heavy:ms > 60000})}, ms); }
  catch (e) { pauseAI(e.name === "AbortError" ? _t("phản hồi quá chậm") : _t("mất kết nối")); throw e; }
  const d = await r.json().catch(() => ({}));
  if (!r.ok && !d.quota && (d.busy || r.status >= 500)) pauseAI(d.error ? _t("quá tải") : _t("lỗi ") + r.status);
  if (!r.ok) { if (d.quota) { AI = {on:false, quota:true, quotaAt:Date.now(), msg:d.error}; console.warn(_t("AI hết lượt, tạm dùng nội dung mẫu")); }
    throw new Error(d.error || (_t("AI lỗi ") + r.status)); }
  if (d.engine) { LAST_ENGINE = d.engine; LAST_ENGINE_AT = Date.now(); }
  if (!json) return d.text;
  return JSON.parse(String(d.text).replace(/^```(json)?|```$/g, "").trim());
}
const timeoutFetch = (url, opt = {}, ms = 15000) => { const c = new AbortController(); const t = setTimeout(() => c.abort(), ms); return fetch(url, {...opt, signal:c.signal}).finally(() => clearTimeout(t)); };
async function checkAI() {
  try { const r = await timeoutFetch("/api/ai", {}, 12000); const d = await r.json(); AI = {on:!!d.ok, busy:!!d.busy, msg:d.ok ? (d.busy ? d.error : "") : (d.error || _t("không rõ lỗi"))}; }
  catch (e) { AI = {on:false, msg:e.name === "AbortError" ? _t("AI phản hồi quá chậm, sẽ tự thử lại sau") : _t("không gọi được server")}; }
}
const aiOn = () => AI.on && !(AI.pauseUntil && Date.now() < AI.pauseUntil);
const goalName = () => (GOALS.find(g => g[0] === S.profile?.goal) || [, ""])[1];
const fieldName = () => (S.profile?.fields || []).join(", ");
const focusName = () => goalName() + (fieldName() ? " · " + fieldName() : "");
const subList = () => (S.profile?.subs || []).map(x => x.split(": ").slice(1).join(": "));
// Mỗi buổi xoay vòng một tình huống người học đã chọn
const nextSituation = () => { const a = S.profile?.subs || []; return a.length ? a[doneN() % a.length] : ""; };
const diffText = () => S.difficulty > 0 ? _t("Người học đang tiến bộ nhanh: tăng độ khó một chút.") : S.difficulty < 0 ? _t("Người học đang gặp khó: giữ câu ngắn, từ thông dụng.") : "";
const TEACHER = () => `${_t("Bạn là giáo viên tiếng Anh cho người Việt. Trình độ người học: ")}${S.level}${_t(". Mục tiêu: ")}${goalName()}${_t(". Lĩnh vực: ")}${fieldName() || "chung"}.${S.profile?.job ? `${_t(" Vị trí công việc: ")}${S.profile.job}.` : ""}${_t(" Các tình huống người học hay gặp: ")}${subList().join(", ") || "chung"}${_t(". Người học tự mô tả: ")}${S.profile?.interest || _t("không có")}. ${diffText()}${_t(" Ví dụ và tình huống luôn bám sát lĩnh vực này. Giải thích ngắn gọn bằng tiếng Việt.")}`;

/* =====================================================================
   SPACED REPETITION (SM-2)
   ===================================================================== */
// Khoá flashcard: "To Introduce", "introduce " và "introduce." là cùng một thẻ (không bị trùng)
const cardKey = x => String(x || "").normalize("NFC").toLowerCase().replace(/[^\p{L}\p{N}\s/'-]/gu, " ").replace(/\s+/g, " ").trim().replace(/^(to|a|an|the) (?=\S)/, "");
function addCard(w, src, example) {
  w = normWord(w); const k = cardKey(w.w);
  if (!S.cards[k]) S.cards[k] = {w, ef:2.5, int:0, rep:0, lapses:0, due:Date.now(), src, added:today(), example:example || ""};
  else if (example) S.cards[k].example = example;
  return S.cards[k];
}
function review(word, q) { // q: 1 Quên · 3 Khó · 4 Nhớ · 5 Dễ
  const c = S.cards[cardKey(word)]; if (!c) return;
  if (q < 3) { c.rep = 0; c.int = 0; c.lapses++; c.due = Date.now() + 10 * 60e3; }
  else { c.rep++; c.int = c.rep === 1 ? 1 : c.rep === 2 ? 3 : Math.round(c.int * c.ef);
    if (q === 3) c.int = Math.max(1, Math.round(c.int * .6));
    c.ef = Math.max(1.3, c.ef + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)); c.due = Date.now() + c.int * 864e5; }
  c.last = Date.now(); S.revDays = S.revDays || {}; S.revDays[today()] = (S.revDays[today()] || 0) + 1;
  for (const k of Object.keys(S.revDays)) if (k < new Date(Date.now() - 40 * 864e5).toISOString().slice(0, 10)) delete S.revDays[k];
  save();
}
const cardList = () => Object.values(S.cards);
const dueCards = () => cardList().filter(c => c.due <= Date.now()).sort((a, b) => b.lapses - a.lapses || a.due - b.due);
const hardCards = () => cardList().filter(c => c.lapses >= 2 || (c.ef < 2.1 && c.rep > 0));
const cardState = c => c.rep === 0 && !c.last ? _t("Mới") : c.int >= 21 ? _t("Đã thuộc") : c.int >= 3 ? _t("Đang nhớ") : _t("Đang học");

/* =====================================================================
   LỘ TRÌNH
   ===================================================================== */
const lvIdx = l => LEVELS.indexOf(l);
function courseWeeks(level, p) {
  const i = lvIdx(level); let w = 8;
  if (i >= 3) w = 10; if (i >= 4) w = 12; if (p.minutes <= 15) w = Math.max(w, 12);
  if (p.goal === "exam" && p.deadline) { const days = (new Date(p.deadline) - new Date()) / 864e5; if (days > 0) w = Math.min(13, Math.max(8, Math.ceil(days / 7))); }
  return w;
}
function buildPath() {
  const i = lvIdx(S.level); S.target = LEVELS[Math.min(5, i + 1)];
  const weeks = courseWeeks(S.level, S.profile);
  S.path = {id:"c" + (S.courses.length + 1), start:today(), weeks, total:weeks * 5, offset:S.sessions.length, from:S.level, to:S.target};
  save();
}
const courseSessions = () => S.path ? S.sessions.filter(s => s.course === S.path.id) : [];
const courseTests = () => S.path ? S.tests.filter(t => t.course === S.path.id) : [];
const regSessions = () => courseSessions().filter(s => !s.remedial);
const doneN = () => regSessions().length;
const testDue = () => { const n = doneN(); return n > 0 && n % 5 === 0 && courseTests().length < n / 5; };
const courseDone = () => S.path && doneN() >= S.path.total && !testDue();
const doneToday = () => S.sessions.some(s => s.date === today());
function streak() {
  const ds = new Set(S.sessions.map(s => s.date).concat(S.frozen || [])); let k = 0; const d = new Date();
  if (!ds.has(today())) d.setDate(d.getDate() - 1);
  for (;;) { const t = d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); if (ds.has(t)) { k++; d.setDate(d.getDate() - 1); } else break; }
  return k;
}

/* =====================================================================
   SINH BÀI HỌC
   ===================================================================== */
function validLesson(l) { return l && l.topic && Array.isArray(l.words) && l.words.length >= 4 && l.grammar && Array.isArray(l.translations) && l.roleplay; }
// ---- Kho bài mẫu theo trình độ (public/lessonbank.js) ----
// Khóa A2 → B1: học hết bài A2 rồi tới bài B1; hết kho thì vòng lại dạng "Ôn lại"
function levelLessons(lv) {
  const LB = window.LESSON_BANK || {}, b = i => ({...BANK[i], level: i === 1 || i === 3 ? "A2" : "A1"});
  if (lv === "A1") { const a = LB.A1 || []; return [b(0), a[0], a[1], b(5), b(2), b(4), ...a.slice(2)].filter(Boolean); }
  if (lv === "A2") return [b(1), ...(LB.A2 || []), b(3)];
  return LB[lv] || [];
}
function bankSequence() {
  const from = S.path?.from || S.level || "A1", to = S.path?.to || from;
  let seq = from === to ? [...levelLessons(from), ...levelLessons(LEVELS[Math.max(0, lvIdx(from) - 1)])] : [...levelLessons(from), ...levelLessons(to)];
  if (!seq.length) seq = BANK.map((l, i) => ({...l, level: "A1"}));
  return seq;
}
function pickBankLesson() {
  const seq = bankSequence(), pos = doneN();
  const les = JSON.parse(JSON.stringify(seq[pos % seq.length]));
  if (pos >= seq.length) { les.topic = _t("Ôn lại: ") + les.topic; les.review = true; }
  les.bank = true;
  return les;
}
// Bài do AI soạn: bổ sung IPA còn thiếu bằng từ điển
async function fillIPA(words) {
  await Promise.all(words.filter(w => !/^\/.+\/$/.test((w.ipa || "").trim())).map(async w => {
    const parts = await Promise.all(String(w.w).toLowerCase().split(/\s+/).map(async t => {
      try { const r = await timeoutFetch("/api/dict?w=" + encodeURIComponent(t.replace(/[^a-z'-]/g, "")), {}, 8000); if (!r.ok) return ""; const j = (await r.json())[0];
        return (j?.phonetic || j?.phonetics?.find(p => p.text)?.text || "").replace(/^\/|\/$/g, ""); } catch (e) { return ""; } }));
    if (parts.every(Boolean)) w.ipa = "/" + parts.join(" ") + "/";
  }));
}
const INFLIGHT = {};
function getLesson(idx) {
  if (S.lessons[idx]) return Promise.resolve(S.lessons[idx]);
  if (!INFLIGHT[idx]) INFLIGHT[idx] = buildLesson(idx).finally(() => { delete INFLIGHT[idx]; });
  return INFLIGHT[idx];
}
// Soạn ngầm buổi tiếp theo để người học không phải chờ
let PREFETCH = "";
function prefetchNext() {
  if (!S.path || !aiOn() || courseDone()) return;
  const idx = S.sessions.length; if (S.lessons[idx] || INFLIGHT[idx]) return;
  PREFETCH = "loading"; if (view === "home") render();
  getLesson(idx).then(l => { PREFETCH = l?.ai ? "ready" : ""; if (view === "home") render(); }).catch(() => { PREFETCH = ""; });
}
async function buildLesson(idx) {
  if (S.lessons[idx]) return S.lessons[idx];
  let les = null;
  if (S.remedial?.length) {
    const ws = S.remedial.slice(0, 8).map(normWord);
    const g = Object.values(S.lessons).reverse().find(l => l.grammar?.quiz?.length)?.grammar || BANK[0].grammar;
    les = {level:S.level, topic:_t("Buổi ôn tập: củng cố phần chưa vững"), scenario:_t("Ôn lại các từ bạn trả lời sai trong bài kiểm tra"), remedial:true, words:ws, grammar:g,
      translations:ws.slice(0, 4).map(w => ({src:w.ex, ref:w.ex_vi || w.vi, dir:"en-vi"})),
      roleplay:{ai_role:"a friendly English tutor", user_role:_t("Người học"), setting:_t("Trò chuyện tự do với gia sư để dùng lại các từ vừa ôn."),
        tasks:[_t("Dùng ít nhất 3 từ vừa ôn"), _t("Kể về một việc bạn làm tuần này"), _t("Đặt một câu hỏi cho gia sư")], opening:"Hi! Let's practise the words from your review today. How was your week?"}};
    S.remedial = [];
  } else if (aiOn()) {
    try {
      const used = Object.keys(S.cards).slice(-80).join(", ");
      const prev = Object.values(S.lessons).slice(-12).map(l => l.topic + " (" + (l.grammar?.name || "") + ")").join("; ");
      const n = doneN() + 1;
      const j = await Promise.race([new Promise((_, rej) => { cancelWait = () => rej(new Error("skip")); }), gemini(TEACHER(),
`${_t("Soạn buổi học số ")}${n}/${S.path.total}${_t(" của khóa ")}${S.path.from} → ${S.path.to}${_t(".\nBài đã học (không lặp chủ đề và điểm ngữ pháp): ")}${prev || _t("(chưa có)")}${_t(".\nTừ đã học (không lặp lại): ")}${used || _t("(chưa có)")}.
${nextSituation() ? `${_t("TÌNH HUỐNG CỦA BUỔI NÀY: \"")}${nextSituation()}${_t("\". Toàn bộ chủ đề, từ vựng, câu dịch và role-play phải xoay quanh đúng tình huống này")}${S.profile?.job ? `${_t(", từ góc nhìn của người làm ")}${S.profile.job}` : ""}.` : _t("Chủ đề, từ vựng, câu dịch và role-play phải là tình huống thực tế trong lĩnh vực của người học.")}${_t(" Độ khó tăng dần theo số buổi.\nTrả JSON đúng cấu trúc:\n{\"topic\":\"tên chủ đề tiếng Việt\",\"scenario\":\"bối cảnh 1 câu tiếng Việt\",\n\"words\":[{\"w\":\"từ hoặc cụm từ\",\"ipa\":\"IPA\",\"pos\":\"từ loại tiếng Việt\",\"vi\":\"nghĩa tiếng Việt\",\"ex\":\"câu ví dụ tiếng Anh\",\"ex_vi\":\"dịch câu ví dụ\"}] (đúng 8 mục),\n\"grammar\":{\"name\":\"tên điểm ngữ pháp\",\"pattern\":\"công thức\",\"note\":\"giải thích 2-3 câu tiếng Việt\",\"quiz\":[{\"q\":\"câu có chỗ trống ___\",\"opts\":[\"4 lựa chọn\"],\"ans\":0,\"explain\":\"giải thích ngắn\"}] (đúng 3 câu, đáp án ở vị trí ngẫu nhiên)},\n\"translations\":[{\"src\":\"câu gốc\",\"ref\":\"bản dịch mẫu\",\"dir\":\"vi-en hoặc en-vi\"}] (4 câu: 2 vi-en, 2 en-vi, có dùng từ và ngữ pháp của bài),\n\"roleplay\":{\"ai_role\":\"vai của AI, tiếng Anh\",\"user_role\":\"vai người học, tiếng Việt\",\"setting\":\"bối cảnh tiếng Việt\",\"tasks\":[\"3 nhiệm vụ tiếng Việt\"],\"opening\":\"câu mở đầu của AI, tiếng Anh\"}}")}`, true, null, 150000)]);
      if (validLesson(j)) { les = j; les.ai = true; les.level = S.level; await fillIPA(les.words.map(normWord)).catch(() => {}); }
    } catch (e) { console.warn(_t("Không sinh được bài:"), e.message); if (e.name === "AbortError") e.message = _t("chờ quá lâu"); if (e.message !== "skip") console.warn(_t("AI chưa soạn được bài:"), e.message); }
    cancelWait = null;
  }
  if (!les) les = pickBankLesson();
  les.words = les.words.map(normWord);
  if (les.ai) await fillIPA(les.words).catch(() => {});
  // Nếu buổi này đã dùng bài mẫu (vì AI chưa soạn xong) thì giữ nguyên, không ghi đè
  if (!S.lessons[idx]) { S.lessons[idx] = les; save(); }
  return S.lessons[idx];
}

/* =====================================================================
   QUIZ CHUNG (test đầu vào, ôn bài cũ, kiểm tra từ, kiểm tra định kỳ, ôn tập)
   ===================================================================== */
function makeQuiz(mode, items, feedback) { return {mode, items, i:0, res:[], pick:null, start:Date.now(), feedback}; }
// Lấy 3 đáp án sai KHÔNG trùng nhau và không trùng đáp án đúng (kho từ có thể chứa cùng một từ ở nhiều bài)
function distinctOpts(right, cands, fill) {
  const seen = new Set([String(right).trim().toLowerCase()]), out = [];
  for (const x of [...shuffle(cands), ...fill]) { const k = String(x || "").trim().toLowerCase(); if (!k || seen.has(k)) continue; seen.add(k); out.push(x); if (out.length === 3) break; }
  return shuffle([right, ...out]);
}
function meaningQ(card, pool, skill = "vocab") {
  const w = normWord(card);
  const opts = distinctOpts(w.vi, pool.map(normWord).filter(x => x.vi && x.w !== w.w).map(x => x.vi), ["thời tiết","cái bàn","nhanh chóng","bữa sáng","gia đình"]);
  return {type:"mcq", q:`"${w.w}"${w.ipa ? " " + w.ipa : ""}${_t(" nghĩa là gì?")}`, opts, ans:opts.indexOf(w.vi), skill, word:w.w, speak:w.w};
}
function wordQ(card, pool) {
  const w = normWord(card); const opts = distinctOpts(w.w, pool.map(normWord).filter(x => x.w !== w.w).map(x => x.w), ["window","quickly","family","yesterday","beautiful"]);
  return {type:"mcq", q:`${_t("Từ nào có nghĩa là \"")}${w.vi}"?`, opts, ans:opts.indexOf(w.w), skill:"vocab", word:w.w};
}
const gramQ = g => { const right = g.opts[g.ans], opts = shuffle(g.opts.slice()); return {type:"mcq", q:g.q, opts, ans:opts.indexOf(right), skill:"grammar", explain:g.explain, speak:g.q}; };
const spellQ = w => ({type:"type", q:`${_t("Viết từ tiếng Anh có nghĩa: \"")}${w.vi}"`, ans:w.w, skill:"spelling", word:w.w, hint:w.w[0] + "… (" + w.w.length + _t(" ký tự)") + (w.ipa ? _t(" · phát âm ") + w.ipa : "")});
const transQ = t => ({type:"trans", q:t.src, ans:t.ref, skill:"translation", dir:t.dir});

function quizPickPlacement(q) {
  const used = new Set(q.items.map(x => x.pid));
  let pos = q.pos;
  for (let d = 0; d < 5; d++) {
    for (const p of [pos - d, pos + d]) {
      if (p < 0 || p > 4) continue;
      const c = PLACEMENT.map((x, i) => [x, i]).filter(([x, i]) => x[0] === p && !used.has(i));
      if (c.length) { const [x, i] = c[Math.floor(Math.random() * c.length)]; q.items.push({type:"mcq", q:x[1], opts:x[2], ans:x[3], lv:x[0], pid:i, skill:"placement", speak:/[a-z]{3}/i.test(x[1]) && !x[1].startsWith('"') ? x[1] : null}); return; }
    }
  }
}

// ----- Luồng bài test 4 phần (khoảng 5 phút) -----
function startPlacement() {
  Q = makeQuiz("placement", [], false); Q.pos = 1; Q.part = 0; Q.partStart = 0; Q.skipped = {};
  Q.items.push({type:"inter", part:"grammar", title:LANG === "en" ? PL_PARTS[0].en : PL_PARTS[0].vi, ic:PL_PARTS[0].ic}); quizPickPlacement(Q); view = "quiz"; UI.pickLv = false; render();
}
const plPartOf = it => it?.part || "grammar";
const plPartIdx = k => PL_PARTS.findIndex(p => p.k === k);
// kết quả theo vị trí câu (bỏ qua các màn chuyển phần)
const plRes = q => { const m = new Map(); q.res.forEach(r => { if (r.i !== undefined) m.set(r.i, r); }); return k => m.get(k); };
// ước lượng trình độ ngữ pháp (chỉ số trong LEVELS: 0=A0 … 5=C1)
function plGrammarIdx(q) {
  const R = plRes(q), g = q.items.map((it, k) => [it, R(k)]).filter(([it, r]) => r && plPartOf(it) === "grammar");
  if (!g.length) return 0;
  const a1 = g.filter(([it]) => it.lv === 0);
  if (a1.length >= 2 && a1.every(([, r]) => !r.ok)) return 0;
  const est = avg(g.slice(-4).map(([it, r]) => it.lv + (r.ok ? .5 : -.5)));
  if (est < -0.2) return 0;
  return Math.min(5, Math.max(0, Math.round(est)) + 1);
}
// kỹ năng khác: đúng ở mức lv → đạt lv+1; sai → dưới mức đó
function plSkillIdx(q, k) {
  const R = plRes(q), g = q.items.map((it, i) => [it, R(i)]).filter(([it, r]) => r && plPartOf(it) === k && !r.skip);
  if (!g.length) return null;
  const ok = g.filter(([, r]) => r.ok).map(([it]) => it.lv + 1);
  return ok.length ? Math.max(...ok) : Math.max(0, Math.min(...g.map(([it]) => it.lv)));
}
function plPick(bank, lv, used) {
  for (let d = 0; d < 5; d++) for (const p of [lv - d, lv + d]) {
    const c = bank.map((x, i) => [x, i]).filter(([x, i]) => x[0] === p && !used.has(p + ":" + i));
    if (c.length) { const [x, i] = c[Math.floor(Math.random() * c.length)]; used.add(p + ":" + i); return x; }
  }
  return bank[0];
}
function plAddPart(q, k) {
  const lv = Math.max(0, Math.min(4, (q.lvEst ?? 1) - 1)); q.used = q.used || new Set();
  const P = PL_PARTS[plPartIdx(k)];
  q.items.push({type:"inter", part:k, title:LANG === "en" ? P.en : P.vi, ic:P.ic});
  if (k === "listening") for (let n = 0; n < P.n; n++) {
    const x = plPick(PL_LISTEN, n === 0 ? lv : lv + 1, q.used);
    q.items.push({type:"mcq", part:k, lv:x[0], autoplay:true, speak:x[1], q:x[2] === "same" ? _t("Nghe và chọn đúng câu bạn vừa nghe") : x[3], opts:x[4], ans:x[5], skill:"listening", hideText:true});
  }
  if (k === "reading") { const x = plPick(PL_READ, lv, q.used); q.items.push({type:"mcq", part:k, lv:x[0], passage:x[1], q:x[2], opts:x[3], ans:x[4], skill:"reading"}); }
  if (k === "speaking") { const x = plPick(PL_SPEAK, lv, q.used); q.items.push({type:"speak", part:k, lv:x[0], q:x[1], ans:x[1], skill:"speaking", place:true}); }
}
// gọi sau mỗi câu trả lời trong bài test đầu vào
function plNext(q) {
  const it = q.items[q.i - 1], r = q.res[q.res.length - 1];
  if (it && plPartOf(it) === "grammar" && it.type !== "inter") {
    q.pos = Math.max(0, Math.min(4, q.pos + (r?.ok ? 1 : -1)));
    const R = plRes(q), g = q.items.filter((x, k) => plPartOf(x) === "grammar" && x.type !== "inter" && R(k));
    // dừng sớm: sai liên tục ở mức cơ bản
    if (g.length >= 3 && q.res.slice(-3).every(x => !x.ok) && g.slice(-3).every(x => x.lv === 0)) { q.stop = true; return; }
    if (g.length < PL_PARTS[0].n) return quizPickPlacement(q);
    q.lvEst = plGrammarIdx(q) || 1;
    return plAddPart(q, "listening");
  }
  if (q.i < q.items.length) return; // còn câu trong phần hiện tại
  const order = PL_PARTS.map(p => p.k), cur = plPartOf(it), nx = order[order.indexOf(cur) + 1];
  if (!nx) return;
  if (nx === "speaking" && !SR) { q.skipped.speaking = true; return; }
  // điều chỉnh mức cho phần sau theo kết quả phần trước
  const s = plSkillIdx(q, cur); if (s !== null) q.lvEst = Math.round((q.lvEst + s) / 2) || 1;
  plAddPart(q, nx);
}
function plFinish(q) {
  const skills = {grammar:plGrammarIdx(q), listening:plSkillIdx(q, "listening"), reading:plSkillIdx(q, "reading"), speaking:plSkillIdx(q, "speaking")};
  let lv;
  if (q.stop) { lv = 0; for (const k in skills) if (k !== "grammar") skills[k] = null; }
  else {
    let sum = 0, w = 0; for (const [k, v] of Object.entries(skills)) if (v !== null) { sum += v * SKILL_W[k]; w += SKILL_W[k]; }
    lv = w ? Math.max(0, Math.min(5, Math.round(sum / w))) : skills.grammar;
  }
  const R = plRes(q), real = q.items.map((it, k) => [it, R(k)]).filter(([it, r]) => it.type !== "inter" && r && !r.skip);
  xtRemember(q.items.filter(it => it.type !== "inter"));
  S.placement = {level:LEVELS[lv], correct:real.filter(([, r]) => r.ok).length, total:real.length, date:today(), early:!!q.stop,
    skills:Object.fromEntries(Object.entries(skills).map(([k, v]) => [k, v === null ? null : LEVELS[v]]))};
  S.skills = {...(S.skills || {}), ...Object.fromEntries(Object.entries(S.placement.skills).filter(([, v]) => v))};
  save(); view = "placeResult"; Q = null; render();
}
function plHead(q) {
  const PARTS = q.x ? q.x.parts : PL_PARTS;
  const it = q.items[q.i], k = plPartOf(it), pi = Math.max(0, PARTS.findIndex(p => p.k === k)), P = PARTS[pi];
  const inPart = q.items.filter((x, j) => j <= q.i && plPartOf(x) === k && x.type !== "inter").length;
  const left = PARTS.slice(pi).reduce((a, p) => a + p.n, 0) - inPart + (it.type === "inter" ? 0 : 1);
  const mins = Math.max(1, Math.round(left * 0.45));
  return `<div class="plhead"><div class="plsteps" style="grid-template-columns:repeat(${PARTS.length},1fr)">${PARTS.map((p, j) => `<span class="${j < pi ? "done" : j === pi ? "cur" : ""}">${stk(p.ic, 26, "", 0)}<b>${LANG === "en" ? p.en : p.vi}</b></span>`).join("")}</div>
    <p class="muted small center">${_t("Phần")} ${pi + 1}/${PARTS.length} · ${LANG === "en" ? P.en : P.vi}${it.type === "inter" ? "" : ` · ${_t("câu số")} ${inPart}/${P.n}`} · ${_t("còn khoảng")} ${mins} ${_t("phút nữa")}</p></div>`;
}
const PL_CHEER = {
  grammar:["Bắt đầu nhé! 5 câu ngữ pháp và từ vựng, câu sau tự khó hoặc dễ hơn theo câu trước.", "Let's go! 5 grammar & vocabulary questions that adapt to your answers."],
  listening:["Xong phần ngữ pháp rồi! Giờ nghe thử nhé 🎧 Bật loa lên, app sẽ đọc câu, không hiện chữ.", "Grammar done! Now some listening 🎧 Turn your sound on, the sentence won't be shown."],
  reading:["Tai bạn thính đấy! Giờ đọc một đoạn ngắn và trả lời 1 câu hỏi 📖", "Nice ears! Now read a short text and answer 1 question 📖"],
  speaking:["Phần cuối rồi! Đọc to 1 câu bằng micro 🗣️ Không tiện nói thì bấm bỏ qua nhé.", "Last part! Read one sentence aloud 🗣️ Can't speak right now? Just skip it."],
};
function plInterHtml(it) {
  const c = Q?.mode === "xtest" ? [`${it.xn} ${_t("câu")} ${_t("phần")} ${SKILL_NAMES[it.part][0].toLowerCase()}. ${_t("Không biết thì chọn \"Tôi không biết\", đừng đoán nhé!")}`, `${it.xn} ${SKILL_NAMES[it.part][1].toLowerCase()} questions. If you don't know, tap "I don't know" instead of guessing!`] : PL_CHEER[it.part] || ["", ""];
  return `<div class="plinter center">${mascot(it.part === "grammar" ? "happy" : "cheer", 110, "bob")}<h2>${stk(it.ic, 34, "", -6)} ${esc(it.title)}</h2><p>${c[LANG === "en" ? 1 : 0]}</p>
    <button class="primary big" data-a="plGo">${it.part === "grammar" ? _t("Bắt đầu") : _t("Tiếp tục")}</button></div>`;
}
function placementLevel(q) {
  const last = q.res.slice(-6).map((r, k) => q.items[q.res.length - Math.min(6, q.res.length) + k].lv + (r.ok ? .5 : -.5));
  const est = avg(last);
  const a1 = q.res.filter((r, k) => q.items[k].lv === 0);
  if (est < -0.2 || (a1.length >= 2 && a1.every(r => !r.ok))) return "A0";
  return LEVELS[Math.min(4, Math.max(0, Math.round(est))) + 1];
}

async function answer(raw) {
  const it = Q.items[Q.i]; if (!it || Q.pick || Q.busy) return;
  let ok = false, extra = {};
  if (it.type === "mcq") { ok = Number(raw) === it.ans; extra.pick = Number(raw); }
  else if (it.type === "type") { const a = clean(raw), b = clean(it.ans); if (!a) return; ok = a === b || (b.length >= 5 && lev(a, b) <= 1); extra.pick = raw; extra.close = ok && a !== b; }
  else if (it.type === "dict") { if (!String(raw).trim()) return; const d = dictScore(it.ans, raw); ok = d.score >= 80; extra = {pick:raw, dict:d}; }
  else if (it.type === "speak") { const r = pronScore(it.ans, raw.text, raw.alts); ok = r.score >= 70; extra = {pick:raw.text, pron:r}; }
  else if (it.type === "trans") {
    if (!String(raw).trim()) return;
    Q.busy = true; render();
    const g = await gradeTrans(it, raw); Q.busy = false; ok = g.score >= 7; extra = {pick:raw, grade:g};
  }
  Q.res.push({ok, skill:it.skill, word:it.word, i:Q.i, pick:extra.pick});
  if (it.word && Q.mode !== "vcheck") review(it.word, ok ? 4 : 1);
  if (Q.feedback) { Q.pick = {ok, ...extra}; render(); }
  else nextQ();
}
function nextQ() {
  Q.pick = null; Q.i++;
  if (Q.mode === "placement") { plNext(Q); if (Q.stop) return plFinish(Q); scrollTo(0, 0); }
  if (Q.i >= Q.items.length) return finishQuiz();
  render(); setTimeout(() => $("#qin")?.focus(), 30);
}
function finishQuiz() {
  const q = Q, ok = q.res.filter(r => r.ok).length, p = pct(ok, q.res.length);
  if (q.mode === "placement") return plFinish(q);
  if (q.mode === "xtest") return xFinish(q);
  if (q.mode === "warm") { L().scores.review = p; L().warmDone = true; L().step = 1; Q = null; save(); return render(); }
  if (q.mode === "vcheck") { L().scores.vocab = p; L().step = 2; Q = null; save(); return render(); }
  if (q.mode === "unit") return finishUnit(q);
  if (q.mode === "review") { q.done = true; render(); }
}

function vQuizBody(q, opts = {}) {
  const it = q.items[q.i]; if (!it) return "";
  const xh = q.mode === "placement" || (q.mode === "xtest" && q.x.parts.length > 1);
  if (it.type === "inter") return (xh ? plHead(q) : "") + plInterHtml(it);
  const pk = q.pick;
  let body;
  if (it.type === "mcq") {
    body = `<div class="opts">${it.opts.map((o, k) => {
      let cls = ""; if (pk) { if (k === it.ans) cls = "right"; else if (k === pk.pick) cls = "wrong"; }
      return `<button class="opt ${cls}" data-a="pick" data-v="${k}" ${pk ? "disabled" : ""}><span class="key">${"ABCD"[k]}</span><span>${esc(o)}</span></button>`; }).join("")}</div>`;
  } else if (it.type === "speak") {
    body = `<div class="row center"><button data-a="speak" data-v="${esc(it.ans)}${_t("\">🔊 Nghe mẫu</button><button data-a=\"slow\" data-v=\"")}${esc(it.ans)}${_t("\">🐢 Nghe chậm</button>\n      <button class=\"mic big ")}${UI.rec === "q" ? "on" : ""}" data-a="qMic" ${pk || !SR ? "disabled" : ""}>${UI.rec === "q" ? _t("● Đang nghe, bấm để dừng") : _t("🎤 Bấm rồi đọc to câu trên")}</button></div>
      ${UI.rec === "q" ? `${_t("<p class=\"live center\" id=\"live\">Hãy đọc...</p>")}` : ""}${SR ? "" : `${_t("<p class=\"muted small center\">Trình duyệt này không hỗ trợ micro.</p>")}`}`;
  } else {
    const area = it.type === "trans" || it.type === "dict";
    const label = it.type === "trans" ? `<span class="tag">${it.dir === "vi-en" ? _t("Dịch sang tiếng Anh") : _t("Dịch sang tiếng Việt")}</span>` : it.hint ? `${_t("<span class=\"muted small\">Gợi ý: ")}${esc(it.hint)}</span>` : "";
    body = `<div class="field">${label}
      <${area ? "textarea" : "input"} id="qin" data-enter="submitQ" autocomplete="off" spellcheck="false" ${pk ? "disabled" : ""} placeholder="${it.type === "trans" ? _t("Bản dịch của bạn") : it.type === "dict" ? _t("Gõ lại câu bạn nghe được") : _t("Gõ từ tiếng Anh")}">${area ? esc(pk?.pick || "") + "</textarea>" : ""}
      ${pk ? "" : `<button class="primary" data-a="submitQ" ${q.busy ? "disabled" : ""}>${q.busy ? `${_t("<span class=\"spin\"></span> Đang chấm")}` : _t("Trả lời")}</button>`}</div>`;
    if (!area && pk) setTimeout(() => { const i = $("#qin"); if (i) i.value = pk.pick; }, 0);
  }
  let fb = "";
  if (pk) {
    let inner;
    if (it.type === "speak") inner = pronHtml(pk.pron);
    else if (it.type === "dict") inner = dictHtml(pk.dict);
    else { const right = it.type === "mcq" ? it.opts[it.ans] : it.ans;
      inner = `<div class="fb ${pk.ok ? "good" : "bad"}"><b>${pk.ok ? (pk.close ? _t("Đúng (có lỗi chính tả nhỏ)") : _t("Chính xác!")) : _t("Chưa đúng.")}</b>
        ${!pk.ok || it.type === "trans" || it.autoplay ? `${_t(" Đáp án: <b>")}${esc(right)}</b>` : ""}${it.autoplay && it.word ? `${_t(" · từ vừa nghe: <b>")}${esc(it.word)}</b>` : ""}
        ${it.explain ? `<br>${esc(it.explain)}` : ""}${pk.grade ? `<br>${esc(pk.grade.note || "")}` : ""}</div>`; }
    fb = inner + `<button class="primary" data-a="nextQ" id="nextBtn">${q.i + 1 >= q.items.length && q.mode !== "placement" ? _t("Xem kết quả") : _t("Câu tiếp theo")}</button>`;
  }
  const qText = it.autoplay ? esc(it.q) : (it.type === "trans" && it.dir === "en-vi") || it.type === "speak" ? tw(it.q) : esc(it.q);
  const listenRow = it.autoplay ? `<div class="row center"><button class="round big-round" data-a="speak" data-v="${esc(it.speak)}${_t("\" aria-label=\"Nghe lại\">🔊</button><button class=\"mini\" data-a=\"slow\" data-v=\"")}${esc(it.speak)}${_t("\">🐢 Nghe chậm</button></div>")}` : "";
  return `${xh ? plHead(q) : ""}<div class="qtop">
     ${opts.exit ? `<button class="ghost" data-a="${opts.exit}${_t("\">← Thoát</button>")}` : "<span></span>"}${_t("\n     <div class=\"qcount\"><span class=\"eyebrow\">Câu ")}${xh ? "" : q.mode === "xtest" ? `${q.items.slice(0, q.i + 1).filter(x => x.type !== "inter").length}/${q.items.filter(x => x.type !== "inter").length}` : `${q.i + 1}/${q.items.length}`}</span><b class="timer" data-start="${q.start}">${fmtTime(Date.now() - q.start)}</b></div>
     ${it.speak && !it.autoplay && it.type !== "speak" ? `<button class="round" data-a="speak" data-v="${esc(it.speak)}" aria-label="${LANG === "en" ? "Listen" : "Nghe"}">🔊</button>` : "<span></span>"}</div>
   ${it.passage ? `<div class="passage">${esc(it.passage)}</div>` : ""}${it.place && it.type === "speak" ? `<p class="muted small center">${_t("Bấm micro rồi đọc to câu dưới đây")}</p>` : ""}<div class="qtext" ${(it.type === "trans" && it.dir === "en-vi") || it.type === "speak" ? "" : "data-notap"}>${qText}</div>${listenRow}${body}${fb}`;
}

/* =====================================================================
   CHẤM ĐIỂM
   ===================================================================== */
// ----- Đánh giá trình độ VIẾT qua các câu người học tự viết trong bài -----
const CEFR_ASK = "\nAlso add a field \"cefr\": the CEFR level (A1, A2, B1, B2 or C1) that this piece of the learner's writing demonstrates (grammar range and accuracy, vocabulary range, linking ideas, naturalness). Judge the learner's own text, not the target word.";
function wEv(lv, kind) {
  lv = String(lv || "").toUpperCase().trim(); if (!["A1", "A2", "B1", "B2", "C1"].includes(lv)) return;
  S.writeEv = [...(S.writeEv || []), {d:today(), lv, k:kind}].slice(-60);
}
// trình độ viết = trung vị của 20 câu gần nhất, chỉ chốt khi đã học đủ 3 buổi và có ít nhất 6 câu
function writingLevel() {
  const ev = (S.writeEv || []).slice(-20); if (ev.length < 6 || S.sessions.length < 3) return null;
  const xs = ev.map(e => lvIdx(e.lv)).sort((a, b) => a - b); return LEVELS[xs[Math.floor(xs.length / 2)]];
}
function updateWriting() {
  const w = writingLevel(); if (!w) return;
  S.skills = S.skills || {}; const old = S.skills.writing;
  if (old !== w) {
    const wk = new Date(); wk.setDate(wk.getDate() - ((wk.getDay() + 6) % 7)); const key = wk.toISOString().slice(0, 10);
    if (!old || S.skillWeek !== key) { // cập nhật tối đa 1 lần mỗi tuần để kết quả không nhảy lung tung
      S.skills.writing = w; S.skillWeek = key;
      UI.skillNews = old ? `✍️ ${_t("Viết")}: ${old} → ${w}${lvIdx(w) > lvIdx(old) ? " 🎉" : ""}` : `✍️ ${_t("Đã có kết quả trình độ Viết của bạn:")} ${w}`;
    }
  }
}
async function gradeSentence(word, text) {
  if (aiOn()) { try { const j = await gemini(TEACHER(),
`${_t("Từ mục tiêu: \"")}${word}${_t("\". Câu người học viết: \"")}${text}${_t("\".\nChấm theo rubric: ngữ pháp 4 điểm, dùng từ mục tiêu đúng nghĩa 4 điểm, tự nhiên 2 điểm. Không bắt lỗi văn phong vượt trình độ ")}${S.level}${_t(".\nTrả JSON {\"score\":0-10,\"corrected\":\"câu đã sửa (giữ nguyên nếu đúng)\",\"errors\":[{\"type\":\"ngữ pháp|dùng từ|chính tả|tự nhiên\",\"fix\":\"phần sửa\",\"explain\":\"giải thích ngắn tiếng Việt\"}],\"note\":\"nhận xét 1 câu tiếng Việt\"}")}` + CEFR_ASK);
    if (typeof j.score === "number") { wEv(j.cefr, "sentence"); return j; } } catch (e) {} }
  const has = clean(text).includes(clean(word).split(" ")[0]), len = norm(text).length;
  const sc = Math.min(10, (has ? 5 : 1) + (len >= 6 ? 3 : len >= 4 ? 2 : 0) + (/^[A-Z].*[.?!]$/.test(text.trim()) ? 2 : 0));
  return {score:sc, corrected:text, errors:[], note:!has ? `${_t("Câu chưa dùng từ \"")}${word}".` : sc >= 8 ? _t("Câu dùng đúng từ mục tiêu.") : _t("Hãy viết câu đầy đủ hơn: có chủ ngữ, động từ, viết hoa đầu câu và dấu chấm cuối câu."), basic:true};
}
async function gradeTrans(t, text) {
  const src = t.src || t.q, ref = t.ref || t.ans;
  if (aiOn()) { try { const j = await gemini(TEACHER(),
`${_t("Câu gốc: \"")}${src}${_t("\". Bản dịch tham khảo: \"")}${ref}${_t("\". Bản dịch của người học: \"")}${text}${_t("\".\nChấm theo mức độ đúng ý (6 điểm) và đúng ngữ pháp, tự nhiên (4 điểm). Chấp nhận cách dịch khác nếu đúng nghĩa.\nTrả JSON {\"score\":0-10,\"note\":\"nhận xét ngắn tiếng Việt, chỉ ra lỗi nếu có\",\"better\":\"bản dịch tốt hơn dựa trên câu của người học\"}")}` + (t.dir === "vi-en" ? CEFR_ASK : ""));
    if (typeof j.score === "number") { if (t.dir === "vi-en") wEv(j.cefr, "trans"); return j; } } catch (e) {} }
  const a = norm(text), b = norm(ref), hit = b.filter(x => a.includes(x)).length / Math.max(1, b.length);
  const sc = Math.round(hit * 10);
  return {score:sc, note:sc >= 7 ? _t("Bản dịch sát ý.") : _t("Bản dịch còn thiếu ý, hãy so với câu tham khảo."), better:ref, basic:true};
}

/* =====================================================================
   BUỔI HỌC 6 BƯỚC
   ===================================================================== */
const L = () => S.current;
async function startLesson() {
  if (testDue()) return startUnit();
  const idx = S.sessions.length;
  if (S.current && S.current.idx === idx) { view = "lesson"; restoreLessonQuiz(); return render(); }
  // Không bắt người học chờ AI: chờ tối đa ~1,5 giây (bài soạn ngầm thường đã xong), nếu chưa có thì học ngay bài mẫu đúng trình độ
  if (!S.lessons[idx]) {
    const ready = await Promise.race([getLesson(idx).catch(() => null), new Promise(r => setTimeout(() => r(null), 1500))]);
    if (!ready && !S.lessons[idx]) { S.lessons[idx] = pickBankLesson(); save(); }
  }
  const les = S.lessons[idx];
  if (!["home", "loading", "lesson", "path"].includes(view)) return;
  const prev = courseSessions().slice(-1)[0] || S.sessions.slice(-1)[0];
  const prevLes = prev ? S.lessons[prev.idx] : null;
  // Bước 1: từ + ngữ pháp buổi trước, cộng thẻ đến hạn
  const pool = [...cardList().map(c => c.w), ...les.words];
  const items = [];
  if (prevLes) {
    const pw = shuffle(prevLes.words);
    pw.slice(0, 3).forEach((w, k) => items.push(k % 2 ? wordQ(w, pool) : meaningQ(w, pool)));
    if (pw[3]) items.push({...meaningQ(pw[3], pool, "listening"), q:_t("Nghe và chọn nghĩa đúng"), speak:pw[3].w, autoplay:true});
    (prevLes.grammar?.quiz || []).slice(0, 2).forEach(g => items.push(gramQ(g)));
  }
  dueCards().filter(c => !items.some(i => i.word === c.w.w)).slice(0, Math.max(0, 8 - items.length)).forEach(c => items.push(meaningQ(c.w, pool)));
  S.current = {idx, course:S.path.id, les, step:items.length ? 0 : 1, warmItems:items, prevTopic:prevLes?.topic || "", vi:0,
    sent:{}, trans:{}, chat:[], tasksDone:[], rpEval:null, scores:{}, started:Date.now()};
  save(); view = "lesson"; restoreLessonQuiz(); render(); scrollTo(0, 0);
}
function restoreLessonQuiz() {
  const l = L(); Q = null;
  if (l.step === 0 && l.warmItems.length) Q = makeQuiz("warm", l.warmItems, true);
  if (l.step === 1 && l.vi > l.les.words.length) Q = makeQuiz("vcheck", vcheckItems(), true);
}
// kỹ năng yếu nhất (nghe/nói) so với trình độ chung → bài học thêm 1 câu luyện kỹ năng đó
function weakSkill() {
  const sk = S.skills || {}, base = lvIdx(S.level || "A1");
  const c = ["listening", "speaking"].filter(k => sk[k] && lvIdx(sk[k]) < base).sort((a, b) => lvIdx(sk[a]) - lvIdx(sk[b]));
  return c[0] || null;
}
function vcheckItems() {
  const ws = L().les.words, pool = [...ws, ...cardList().map(c => c.w)];
  const items = shuffle(ws).slice(0, 4).map((w, k) => k % 2 ? wordQ(w, pool) : meaningQ(w, pool));
  const wk = weakSkill(), ex = shuffle(ws.filter(w => w.ex))[0];
  if (wk === "listening" && ex) items.push({type:"dict", q:_t("Nghe và chép lại câu"), ans:ex.ex, speak:ex.ex, autoplay:true, skill:"listening", bonus:true});
  if (wk === "speaking" && ex && SR) items.push({type:"speak", q:ex.ex, ans:ex.ex, skill:"speaking", word:ex.w, bonus:true});
  return items;
}
function setStep(n) { const l = L(); l.max = Math.max(l.max || 0, l.step, n); l.step = n; Q = null; if (!(n < l.max && n < 2)) restoreLessonQuiz(); save(); render(); scrollTo(0, 0); }
// Xem lại bước đã học: bấm thanh tiến trình. Bước 1–2 (đã làm quiz) hiện bản tóm tắt thay vì làm lại.
function reviewPanel(k) {
  const l = L(), ws = l.les.words, g = l.les.grammar;
  if (k === 0) return `${_t("<section class=\"panel\"><h2>Xem lại: Ôn bài cũ")}${l.prevTopic ? ` · ${esc(tp(l.prevTopic))}` : ""}</h2>
    ${(l.warmItems || []).length ? `<ol class="revlist">${l.warmItems.map(it => `<li><b>${esc(it.q)}</b><br><span class="tag good">${esc(it.opts ? it.opts[it.ans] : it.ans)}</span>${it.explain ? ` <span class="muted small">${esc(it.explain)}</span>` : ""}</li>`).join("")}</ol>` : `${_t("<p class=\"muted\">Buổi này không có phần ôn bài cũ.</p>")}`}</section>`;
  return `${_t("<section class=\"panel\"><h2>Xem lại: Từ vựng & ngữ pháp</h2>\n    <div class=\"revlist\">")}${ws.map(w => `<div class="revword"><div class="row nowrap"><b>${esc(w.w)}</b><button class="round sm" data-a="speak" data-v="${esc(w.w)}" aria-label="${LANG === "en" ? "Listen" : "Nghe"}">🔊</button><span class="ipa">${esc(w.ipa || "")}</span>${w.pos ? `<span class="tag">${esc(w.pos)}</span>` : ""}</div>
      <div>${esc(w.vi)}</div>${w.ex ? `<div class="muted small"><i>${esc(w.ex)}</i>${w.ex_vi ? " · " + esc(w.ex_vi) : ""}</div>` : ""}</div>`).join("")}</div></section>
    ${g ? `${_t("<section class=\"panel\"><h3>Ngữ pháp: ")}${esc(tp(g.name || ""))}</h3>${g.pattern ? `<p><code>${esc(g.pattern)}</code></p>` : ""}<p>${esc(g.note || "")}</p>
      ${(g.quiz || []).map(qz => `<p class="small">• ${esc(qz.q)} → <b>${esc((qz.opts || [])[qz.ans] ?? "")}</b>${qz.explain ? ` <span class="muted">(${esc(qz.explain)})</span>` : ""}</p>`).join("")}</section>` : ""}`;
}

function vLesson() {
  const l = L(); if (!l) { view = "home"; return vHome(); }
  const mx = l.max = Math.max(l.max || 0, l.step);
  const head = `${_t("<header class=\"lhead\"><div class=\"row between\"><button class=\"ghost\" data-a=\"exitLesson\">← Lưu & thoát</button>\n     <span class=\"muted small\">")}${fmtTime(Date.now() - l.started)}</span></div>
     <div class="lesson-title hue-${topicStk(l.les.topic)[1]}">${stk(topicStk(l.les.topic)[0], 64, "", -8)}<div class="grow"><p class="eyebrow">${l.les.remedial ? _t("Buổi ôn tập") : _t("Buổi ") + (doneN() + 1)}${l.les.level ? " · " + l.les.level : ""}${_t(" · Bước ")}${l.step + 1}/6: ${STEPS[l.step]}</p><h2>${esc(tp(l.les.topic))}</h2></div>${stk(STEP_STK[l.step], 46, "step-stk", 10)}</div>
     <ol class="stepper">${STEPS.map((s, k) => { const reach = k <= mx && k !== l.step; return `<li class="${k < mx || k < l.step ? "done" : ""} ${k === l.step ? "cur" : ""} ${reach ? "go" : ""}" ${reach ? `data-a="step" data-v="${k}${_t("\" role=\"button\" tabindex=\"0\" title=\"Xem lại bước ")}${k + 1}"` : ""}><span>${k + 1}</span><em>${s}</em></li>`; }).join("")}</ol>
     ${mx > 0 ? `${_t("<p class=\"muted small center\">Bấm vào thanh tiến trình để quay lại xem bước đã học.</p>")}` : ""}</header>`;
  const back = l.step < mx ? `${_t("<div class=\"backbar\"><span>👀 Đang xem lại bước ")}${l.step + 1}: <b>${STEPS[l.step]}</b></span><button class="primary mini" data-a="step" data-v="${mx}${_t("\">Về bước đang học (")}${mx + 1}) →</button></div>` : "";
  const body = l.step < mx && l.step < 2 ? reviewPanel(l.step) : [step1, step2, step3, step4, step5, step6][l.step]();
  return `<div class="wrap narrow">${head}${back}${body}</div>`;
}
// Bước 1: Ôn bài cũ
function step1() {
  const l = L();
  if (!l.warmItems.length) return `${_t("<section class=\"panel\"><h2>Ôn bài cũ</h2><p>Đây là buổi đầu tiên nên chưa có bài cũ để ôn.</p><button class=\"primary\" data-a=\"step\" data-v=\"1\">Sang từ vựng mới</button></section>")}`;
  return `${_t("<section class=\"panel\"><h2>Ôn bài cũ")}${l.prevTopic ? `: ${esc(tp(l.prevTopic))}` : ""}${_t("</h2><p class=\"muted\">Ôn nhanh từ vựng và ngữ pháp buổi trước. Câu sai sẽ được đưa vào flashcard để ôn sớm hơn.</p></section>\n    <section class=\"panel quiz\">")}${vQuizBody(Q)}</section>`;
}
// Bước 2: Từ vựng mới + ngữ pháp + kiểm tra nhanh
function step2() {
  const l = L(), ws = l.les.words, n = ws.length;
  if (l.vi < n) {
    const w = ws[l.vi];
    return `${_t("<section class=\"panel\"><div class=\"row between\"><span class=\"tag\">Từ ")}${l.vi + 1}/${n}</span><div class="dots">${ws.map((_, k) => `<i class="${k <= l.vi ? "on" : ""}"></i>`).join("")}</div></div>
      <div class="vocab">${stk(topicStk(l.les.topic)[0], 70, "corner", 12)}<div class="row"><h2 class="word">${esc(w.w)}</h2><button class="round" data-a="speak" data-v="${esc(w.w)}" aria-label="${LANG === "en" ? "Listen" : "Nghe"}">🔊</button></div>
      <div class="ipa">${esc(w.ipa)}${w.pos ? ` · <span class="tag">${esc(w.pos)}</span>` : ""}</div>
      <p class="meaning">${esc(w.vi)}</p>
      <div class="example"><p>${tw(w.ex)} <button class="mini" data-a="speak" data-v="${esc(w.ex)}${_t("\">🔊 Nghe câu</button> </p><div>")}${trBtn(w.ex, "en", "vi", _t("Dịch câu"))}</div>${w.ex_vi ? `<p class="muted">${twv(w.ex_vi)}</p>` : ""}</div></div>
      ${speakBox(w, l.vi)}
      <div class="row">${l.vi > 0 ? `${_t("<button data-a=\"vprev\">Từ trước</button>")}` : ""}<button class="primary" data-a="vnext">${l.vi < n - 1 ? _t("Từ tiếp theo") : _t("Xem điểm ngữ pháp")}</button></div></section>`;
  }
  if (l.vi === n) {
    const g = l.les.grammar;
    return `${_t("<section class=\"panel\"><span class=\"eyebrow\">Ngữ pháp trọng tâm</span><h2>")}${esc(tp(g.name))}</h2>
      ${g.pattern ? `<div class="pattern">${esc(g.pattern)}</div>` : ""}<p>${twv(g.note || "")}</p>
      ${(g.quiz || []).length ? `${_t("<p class=\"muted small\">Điểm ngữ pháp này sẽ được ôn lại ở đầu buổi sau.</p>")}` : ""}${_t("\n      <div class=\"row\"><button data-a=\"vprev\">Xem lại từ</button><button class=\"primary\" data-a=\"vnext\">Kiểm tra nhanh 4 câu</button></div></section>")}`;
  }
  return `${_t("<section class=\"panel\"><h2>Kiểm tra nhanh từ mới</h2><p class=\"muted\">Từ bạn học hôm nay đã được thêm vào flashcard.</p></section><section class=\"panel quiz\">")}${vQuizBody(Q)}</section>`;
}
function speakBox(w, i) {
  const l = L(); l.pron = l.pron || {};
  const keys = [["w:" + i, _t("Đọc từ")], ["ex:" + i, _t("Đọc cả câu")]];
  return `${_t("<div class=\"speakbox\"><p class=\"eyebrow\">Luyện nghe – nói</p>\n    <div class=\"row\"><button class=\"mini\" data-a=\"slow\" data-v=\"")}${esc(w.ex)}${_t("\">🐢 Nghe chậm câu ví dụ</button>\n    ")}${keys.map(([k, t]) => `<button class="mini mic ${UI.rec === k ? "on" : ""}" data-a="pron" data-v="${k}" ${SR ? "" : "disabled"}>${UI.rec === k ? _t("● Đang nghe, bấm để dừng") : "🎤 " + t}</button>`).join("")}</div>
    ${keys.some(([k]) => UI.rec === k) ? `${_t("<p class=\"live\" id=\"live\">Hãy đọc to...</p>")}` : ""}
    ${keys.map(([k]) => l.pron[k] ? pronHtml(l.pron[k]) : "").join("")}
    ${SR ? "" : `${_t("<p class=\"muted small\">Trình duyệt này chưa hỗ trợ nhận giọng nói. Hãy mở app bằng Chrome hoặc Edge.</p>")}`}</div>`;
}
// Bước 3: Tự đặt câu
function step3() {
  const l = L(), ws = l.les.words.slice(0, 4), graded = Object.keys(l.sent).length;
  return `${_t("<section class=\"panel\"><h2>Tự đặt câu</h2><p class=\"muted\">Viết một câu tiếng Anh với mỗi từ, càng gần với công việc và cuộc sống của bạn càng tốt. ")}${aiOn() ? _t("AI sẽ sửa lỗi và giải thích.") : _t("Đang chấm cơ bản vì AI đang nghỉ.")}</p></section>
   ${ws.map((w, i) => { const r = l.sent[i]; return `<section class="panel"><div class="row between"><h3>${esc(w.w)} <span class="muted normal">· ${esc(w.vi)}</span></h3><button class="mini" data-a="speak" data-v="${esc(w.ex)}${_t("\">Nghe ví dụ</button></div>\n     <label class=\"sr\" for=\"sent")}${i}${_t("\">Câu với ")}${esc(w.w)}</label><textarea id="sent${i}${_t("\" placeholder=\"Ví dụ gợi ý: ")}${esc(w.ex)}">${esc(r?.text || "")}</textarea>${sentFb(r)}</section>`; }).join("")}
   <div class="row sticky-actions"><button class="primary" data-a="grade3" id="g3">${graded ? _t("Chấm lại") : _t("Chấm câu")}</button>${graded ? `${_t("<button data-a=\"step\" data-v=\"3\">Sang bước dịch câu →</button>")}` : ""}</div>`;
}
function sentFb(r) {
  if (!r || r.score == null) return "";
  return `<div class="fb ${r.score >= 7 ? "good" : "bad"}"><b>${r.score}/10</b> · ${esc(r.note || "")}
    ${r.corrected && clean(r.corrected) !== clean(r.text) ? `${_t("<br>Câu sửa: <i>")}${tw(r.corrected)}</i>` : ""}
    ${(r.errors || []).map(e => `<br>• <b>${esc(e.type || "")}</b>: ${esc(e.fix || "")}${e.explain ? ` · ${esc(e.explain)}` : ""}`).join("")}</div>`;
}
async function grade3() {
  const l = L(), ws = l.les.words.slice(0, 4), btn = $("#g3"); btn.disabled = true; btn.innerHTML = `${_t("<span class=\"spin\"></span> Đang chấm")}`;
  const texts = ws.map((_, i) => $("#sent" + i).value.trim());
  if (!texts.some(Boolean)) { btn.disabled = false; btn.textContent = _t("Chấm câu"); return toast(_t("Hãy viết ít nhất một câu")); }
  await Promise.all(ws.map(async (w, i) => { if (!texts[i]) return; if (l.sent[i]?.text === texts[i]) return;
    const r = await gradeSentence(w.w, texts[i]); l.sent[i] = {text:texts[i], word:w.w, ...r};
    if (r.score >= 7) addCard(w, "lesson", r.corrected || texts[i]); else { const c = S.cards[cardKey(w.w)]; if (c) c.due = Date.now(); } }));
  const v = Object.values(l.sent); l.scores.sentence = Math.round(avg(v.map(x => x.score)) * 10);
  save(); render();
}
// Bước 4: Dịch câu
function step4() {
  const l = L(), tr = l.les.translations, graded = Object.keys(l.trans).length;
  return `${_t("<section class=\"panel\"><h2>Dịch câu</h2><p class=\"muted\">Dịch theo ý, không cần khớp từng chữ. Bấm vào từng từ để xem nghĩa và phiên âm; nút \"Xem bản dịch máy\" dịch cả câu ngay tại đây (nên tự dịch trước rồi mới so).</p></section>\n   ")}${tr.map((t, i) => { const r = l.trans[i]; return `<section class="panel"><span class="tag">${t.dir === "vi-en" ? _t("Việt → Anh") : _t("Anh → Việt")}</span>
     <h3 class="src">${t.dir === "en-vi" ? tw(t.src) : twv(t.src)}</h3>
     <div class="row">${trBtn(t.src, t.dir === "vi-en" ? "vi" : "en", t.dir === "vi-en" ? "en" : "vi", _t("Xem bản dịch máy"))}${t.dir === "en-vi" ? `<button class="mini" data-a="speak" data-v="${esc(t.src)}${_t("\">🔊 Nghe câu</button>")}` : ""}</div>
     <label class="sr" for="tr${i}${_t("\">Bản dịch</label><textarea id=\"tr")}${i}${_t("\" rows=\"2\" placeholder=\"Bản dịch của bạn\">")}${esc(r?.text || "")}</textarea>
     ${r ? `<div class="fb ${r.score >= 7 ? "good" : "bad"}"><b>${r.score}/10</b> · ${esc(r.note || "")}${_t("<br>Tham khảo: <i>")}${t.dir === "vi-en" ? tw(t.ref) : esc(t.ref)}</i>${r.better && clean(r.better) !== clean(t.ref) ? `${_t("<br>Gợi ý từ câu của bạn: <i>")}${esc(r.better)}</i>` : ""}</div>` : ""}</section>`; }).join("")}${_t("\n   <section class=\"panel\"><h2>Nghe và chép</h2><p class=\"muted\">Nghe câu tiếng Anh rồi gõ lại. Có thể nghe nhiều lần, nghe chậm nếu cần.</p></section>\n   ")}${dictRefs(l).map((ref, i) => { const r = l.dict?.[i]; return `${_t("<section class=\"panel\"><span class=\"tag\">Câu nghe ")}${i + 1}</span>
     <div class="row"><button data-a="speak" data-v="${esc(ref)}">🔊 Nghe</button><button data-a="slow" data-v="${esc(ref)}${_t("\">🐢 Nghe chậm</button></div>\n     <label class=\"sr\" for=\"dc")}${i}${_t("\">Chép lại câu ")}${i + 1}</label><textarea id="dc${i}${_t("\" rows=\"2\" placeholder=\"Gõ lại câu bạn nghe được\">")}${esc(r?.text || "")}</textarea>${r ? dictHtml(r) : ""}</section>`; }).join("")}
   <div class="row sticky-actions"><button class="primary" data-a="grade4" id="g4">${graded || l.dict ? _t("Chấm lại") : _t("Chấm bài")}</button>${graded || l.dict ? `<button data-a="step" data-v="4">Sang role-play →</button>` : ""}</div>`;
}
const dictRefs = l => (l.dictRefs = l.dictRefs || shuffle(l.les.words.filter(w => w.ex)).slice(0, 2).map(w => w.ex));
async function grade4() {
  const l = L(), tr = l.les.translations, btn = $("#g4"); btn.disabled = true; btn.innerHTML = `${_t("<span class=\"spin\"></span> Đang chấm")}`;
  const texts = tr.map((_, i) => $("#tr" + i).value.trim()), dts = dictRefs(l).map((_, i) => $("#dc" + i)?.value.trim() || "");
  if (!texts.some(Boolean) && !dts.some(Boolean)) { btn.disabled = false; btn.textContent = _t("Chấm bài"); return toast(_t("Hãy dịch hoặc chép ít nhất một câu")); }
  l.dict = l.dict || {};
  dictRefs(l).forEach((ref, i) => { if (dts[i]) l.dict[i] = dictScore(ref, dts[i]); });
  if (Object.keys(l.dict).length) l.scores.listening = Math.round(avg(Object.values(l.dict).map(x => x.score)));
  await Promise.all(tr.map(async (t, i) => { if (!texts[i] || l.trans[i]?.text === texts[i]) return; l.trans[i] = {text:texts[i], ...(await gradeTrans(t, texts[i]))}; }));
  if (Object.keys(l.trans).length) l.scores.translation = Math.round(avg(Object.values(l.trans).map(x => x.score)) * 10);
  save(); render();
}
// Bước 5: Role-play
const FALLBACK_RP = ["That sounds good. Can you tell me a bit more?", "I see. What would you like to do next?", "Great! Is there anything else I can help you with?", "Thanks. Could you explain that a little more?", "Interesting! Why do you think so?"];
function step5() {
  const l = L(), rp = l.les.roleplay;
  if (!l.chat.length) { l.chat.push({role:"ai", text:rp.opening || "Hi! Shall we start?"}); if (autoSpeak()) setTimeout(() => say(l.chat[0].text), 400); }
  const used = l.les.words.filter(w => l.chat.some(m => m.role === "user" && clean(m.text).includes(clean(w.w)))).map(w => w.w);
  const turns = l.chat.filter(m => m.role === "user").length;
  if (l.rpEval) {
    const e = l.rpEval;
    return `${_t("<section class=\"panel\"><h2>Kết quả role-play</h2><div class=\"stats\">")}${[[_t("Trôi chảy"), e.fluency], [_t("Chính xác"), e.accuracy], [_t("Hoàn thành nhiệm vụ"), e.task_score]].map(([k, v]) => `<div class="stat"><b>${v}/10</b><span>${k}</span></div>`).join("")}</div>
      <p>${esc(e.comment_vi || "")}</p>${(e.better_phrases || []).map(b => `${_t("<div class=\"fb\">Bạn nói: <i>")}${esc(b.you)}${_t("</i><br>Tự nhiên hơn: <b>")}${tw(b.better)}</b></div>`).join("")}${_t("\n      <div class=\"row\"><button data-a=\"rpAgain\">Trò chuyện thêm</button><button class=\"primary\" data-a=\"step\" data-v=\"5\">Xem tổng kết →</button></div></section>")}`;
  }
  return `${_t("<section class=\"panel rp\"><div class=\"row between\"><h2>Role-play</h2><span class=\"muted small\">Bạn: ")}${esc(rp.user_role || "")}</span></div>
    <p class="muted">${esc(rp.setting || "")}</p>
    <ul class="tasks">${(rp.tasks || []).map((t, k) => `<li class="${l.tasksDone.includes(k) ? "done" : ""}">${esc(t)}</li>`).join("")}${_t("</ul>\n    <p class=\"small\">Từ đã dùng: ")}${l.les.words.map(w => `<span class="chip ${used.includes(w.w) ? "on" : ""}">${esc(w.w)}</span>`).join(" ")}</p></section>
   <section class="panel"><div class="chat" id="chat">${l.chat.map((m, mi) => `<div class="msg ${m.role}">${m.role === "ai" ? (hideText() && !(l.reveal || []).includes(mi) ? `${_t("<span class=\"muted\">(Chữ đã ẩn, hãy nghe)</span> <button class=\"mini\" data-a=\"reveal\" data-v=\"")}${mi}${_t("\">Hiện chữ</button>")}` : tw(m.text)) : (m.voice ? "🎤 " : "") + esc(m.text)}${m.fix ? `${_t("<span class=\"fix\">Nên nói: ")}${esc(m.fix)}</span>` : ""}${m.role === "ai" ? ` <button class="mini" data-a="speak" data-v="${esc(m.text)}" aria-label="${LANG === "en" ? "Listen" : "Nghe"}">🔊</button>${trBtn(m.text, "en", "vi")}` : ""}</div>`).join("")}
     ${l.rpBusy ? `<div class="msg ai"><span class="spin"></span></div>` : ""}</div>
    ${l.hint ? `${_t("<div class=\"fb\">Gợi ý: <b>")}${tw(l.hint.en)}</b>${l.hint.vi ? `<br><span class="muted">${twv(l.hint.vi)}</span>` : ""}</div>` : ""}${_t("\n    <div class=\"row nowrap\"><label class=\"sr\" for=\"rpIn\">Câu trả lời</label><input id=\"rpIn\" data-enter=\"rpSend\" placeholder=\"Trả lời bằng tiếng Anh...\" autocomplete=\"off\" ")}${l.rpBusy ? "disabled" : ""}>
      <button class="mic ${UI.rec === "rp" ? "on" : ""}" data-a="rpMic" ${SR && !l.rpBusy ? "" : "disabled"}${_t(" aria-label=\"Nói\">")}${UI.rec === "rp" ? _t("● Dừng") : _t("🎤 Nói")}</button>
      <button class="primary" data-a="rpSend" ${l.rpBusy ? "disabled" : ""}${_t(">Gửi</button></div>\n    ")}${UI.rec === "rp" ? `${_t("<p class=\"live\" id=\"live\">Hãy nói bằng tiếng Anh...</p>")}` : ""}
    <div class="row small"><button class="mini seg ${autoSpeak() ? "sel" : ""}${_t("\" data-a=\"autospeak\">🔈 Tự đọc câu của AI</button><button class=\"mini seg ")}${hideText() ? "sel" : ""}${_t("\" data-a=\"hidetext\">🙈 Ẩn chữ để luyện nghe</button>\n      ")}${SR ? `${_t("<span class=\"muted\">Bấm 🎤 Nói để trả lời bằng giọng nói.</span>")}` : `${_t("<span class=\"muted\">Mở bằng Chrome hoặc Edge để nói bằng micro.</span>")}`}${_t("</div>\n    <div class=\"row\"><button data-a=\"rpHint\">Gợi ý câu trả lời</button>")}${turns >= 3 ? `${_t("<button class=\"primary\" data-a=\"rpEnd\" id=\"rpEndBtn\">Kết thúc & chấm điểm</button>")}` : `${_t("<span class=\"muted small\">Trao đổi ít nhất 3 lượt để kết thúc (")}${turns}/3).</span>`}</div></section>`;
}
function scrollChat() { const c = $("#chat"); if (c) c.scrollTop = c.scrollHeight; }
async function rpSend(arg) {
  const l = L(), inp = $("#rpIn"), voice = typeof arg === "string" && !!arg.trim(), t = voice ? arg.trim() : inp?.value.trim(); if (!t || l.rpBusy) return;
  l.chat.push({role:"user", text:t, voice}); l.hint = null; l.rpBusy = true; render(); scrollChat();
  const rp = l.les.roleplay;
  if (aiOn()) {
    const sys = `You are role-playing as ${rp.ai_role}. Setting (Vietnamese): ${rp.setting}. The learner (level ${S.level}) plays: ${rp.user_role}.
Learner's tasks (Vietnamese, numbered from 0): ${(rp.tasks || []).map((x, k) => k + ". " + x).join(" | ")}. Lesson words: ${l.les.words.map(w => w.w).join(", ")}.
Stay in character. ALWAYS write "reply" in ENGLISH ONLY — never Vietnamese, even though the setting and tasks above are written in Vietnamese and even if the learner writes Vietnamese. Reply in 1-2 short sentences suited to the level, and gently steer the learner toward unfinished tasks.
Return JSON {"reply":"your in-character reply IN ENGLISH","fix":"if the learner's LAST message has a clear mistake, the corrected natural ENGLISH version of it (never a Vietnamese translation); otherwise empty string","done":[indices of tasks the learner has completed so far in the whole conversation]}`;
    const VI0 = /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹàáèéìíòóùúýãõĩũ]/i;
    // Bỏ các câu tiếng Việt cũ của AI khỏi lịch sử gửi đi, để AI không "bắt chước" nói tiếng Việt tiếp
    const hist = l.chat.filter(m => !(m.role === "ai" && VI0.test(m.text))).map(m => ({role:m.role === "ai" ? "model" : "user", parts:[{text:m.text}]}));
    if (hist[0]?.role === "model") hist.unshift({role:"user", parts:[{text:"(Start the role-play.)"}]});
    // Nhắc lại yêu cầu tiếng Anh ngay trong tin cuối (model nhỏ hay làm theo câu gần nhất)
    const last = hist[hist.length - 1]; if (last?.role === "user") last.parts = [...last.parts, {text:"\n\n(Remember: answer in ENGLISH only. \"reply\" and \"fix\" must both be English sentences.)"}];
    const VI = /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹàáèéìíòóùúýãõĩũ]/i;
    try { let j = await gemini(sys, null, true, hist);
      if (VI.test(j.reply || "") || VI.test(j.fix || "")) {
        try { const j2 = await gemini(sys + "\nIMPORTANT: your previous answer contained Vietnamese. Write \"reply\" and \"fix\" in English only.", null, true, hist); if (j2 && !VI.test(j2.reply || "")) j = {...j, ...j2}; } catch (e) {} }
      // Vẫn còn tiếng Việt → tự dịch sang tiếng Anh để role-play không bị lẫn
      const toEn = async x => { if (!x || !VI.test(x)) return x; try { const r = await timeoutFetch(`/api/translate?sl=vi&tl=en&q=${encodeURIComponent(x)}`, {}, 10000); const d = await r.json(); return r.ok && d.text ? d.text : x; } catch (e) { return x; } };
      j.reply = await toEn(j.reply); j.fix = await toEn(j.fix);
      if (j.fix && clean(j.fix) !== clean(t)) l.chat[l.chat.length - 1].fix = j.fix;
      if (Array.isArray(j.done)) l.tasksDone = [...new Set([...l.tasksDone, ...j.done.map(Number).filter(n => n >= 0 && n < (rp.tasks || []).length)])];
      l.chat.push({role:"ai", text:j.reply || FALLBACK_RP[0]});
    } catch (e) { l.chat.push({role:"ai", text:FALLBACK_RP[l.chat.length % FALLBACK_RP.length]}); }
  } else {
    const turns = l.chat.filter(m => m.role === "user").length;
    if (turns - 1 < (rp.tasks || []).length && !l.tasksDone.includes(turns - 1)) l.tasksDone.push(turns - 1);
    l.chat.push({role:"ai", text:FALLBACK_RP[turns % FALLBACK_RP.length]});
  }
  l.rpBusy = false; save(); render(); scrollChat(); $("#rpIn")?.focus();
  const last = l.chat[l.chat.length - 1]; if (autoSpeak() && last?.role === "ai") say(last.text);
}
async function rpHint() {
  const l = L(), rp = l.les.roleplay;
  const unused = l.les.words.find(w => !l.chat.some(m => m.role === "user" && clean(m.text).includes(clean(w.w))));
  if (aiOn()) { try { l.hint = await gemini(TEACHER(), `${_t("Role-play: AI là ")}${rp.ai_role}${_t(", người học là ")}${rp.user_role}${_t(". Nhiệm vụ: ")}${(rp.tasks || []).join("; ")}${_t(".\nHội thoại: ")}${l.chat.map(m => (m.role === "ai" ? "AI: " : _t("Học viên: ")) + m.text).join("\n")}${_t("\nGợi ý MỘT câu trả lời tiếp theo cho học viên, phù hợp trình độ ")}${S.level}${unused ? `${_t(", có dùng từ \"")}${unused.w}"` : ""}${_t(". Trả JSON {\"en\":\"câu tiếng Anh\",\"vi\":\"nghĩa tiếng Việt\"}")}`); save(); return render(); } catch (e) {} }
  l.hint = unused ? {en:unused.ex, vi:unused.ex_vi || ""} : {en:"Could you tell me more about that?", vi:_t("Bạn có thể nói thêm về điều đó không?")};
  render();
}
async function rpEnd() {
  const l = L(), rp = l.les.roleplay, btn = $("#rpEndBtn"); if (btn) { btn.disabled = true; btn.innerHTML = `${_t("<span class=\"spin\"></span> Đang chấm")}`; }
  const userMsgs = l.chat.filter(m => m.role === "user");
  const used = l.les.words.filter(w => userMsgs.some(m => clean(m.text).includes(clean(w.w)))).length;
  let e = null;
  if (aiOn()) { try { e = await gemini(TEACHER(), `${_t("Đánh giá phần role-play của học viên (trình độ ")}${S.level}${_t("). AI đóng vai: ")}${rp.ai_role}${_t(". Nhiệm vụ: ")}${(rp.tasks || []).join("; ")}${_t(".\nHội thoại (câu có [nói] là học viên nói bằng giọng, được máy chuyển thành chữ nên có thể sai chính tả do nhận dạng; đừng trừ điểm lỗi chính tả ở những câu đó): ")}${l.chat.map(m => (m.role === "ai" ? "AI: " : m.voice ? _t("Học viên [nói]: ") : _t("Học viên: ")) + m.text).join("\n")}${_t("\nTrả JSON {\"fluency\":0-10,\"accuracy\":0-10,\"task_score\":0-10,\"comment_vi\":\"nhận xét 2 câu tiếng Việt\",\"better_phrases\":[{\"you\":\"câu học viên đã nói\",\"better\":\"cách nói tự nhiên hơn\"}] (tối đa 3)}")}` + "\nAlso add a field \"cefr\": the CEFR level (A1, A2, B1, B2 or C1) shown by the learner's TYPED messages only (ignore [nói]/spoken lines). Use null if there are fewer than 2 typed messages."); if (e?.cefr) wEv(e.cefr, "roleplay"); } catch (er) { e = null; } }
  if (!e || typeof e.fluency !== "number") {
    const avgLen = avg(userMsgs.map(m => norm(m.text).length));
    e = {fluency:Math.min(10, Math.round(3 + avgLen / 2)), accuracy:Math.max(3, 10 - l.chat.filter(m => m.fix).length * 2), task_score:Math.round(l.tasksDone.length / Math.max(1, (rp.tasks || []).length) * 10),
      comment_vi:`${_t("Bạn đã trao đổi ")}${userMsgs.length}${_t(" lượt (")}${userMsgs.filter(m => m.voice).length}${_t(" lượt nói bằng giọng) và dùng ")}${used}/${l.les.words.length}${_t(" từ mới.")}`, better_phrases:l.chat.filter(m => m.fix).slice(0, 3).map(m => ({you:m.text, better:m.fix}))};
  }
  l.rpEval = e; l.scores.roleplay = Math.round((e.fluency + e.accuracy + e.task_score) / 3 * 10);
  save(); render();
}
// Bước 6: Tổng kết
function lessonMistakes(l) {
  return [
    ...Object.values(l.sent).filter(r => r.score < 7 || (r.corrected && clean(r.corrected) !== clean(r.text))).map(r => ({text:r.text, fix:r.corrected && clean(r.corrected) !== clean(r.text) ? r.corrected : r.note})),
    ...Object.entries(l.trans).filter(([, r]) => r.score < 7).map(([i, r]) => ({text:r.text, fix:l.les.translations[i].ref})),
    ...l.chat.filter(m => m.fix).map(m => ({text:m.text, fix:m.fix}))
  ].slice(0, 6);
}
function step6() {
  const l = L(), sc = l.scores, keys = [["review",_t("Ôn bài cũ")],["vocab",_t("Kiểm tra từ")],["speaking",_t("Phát âm")],["sentence",_t("Đặt câu")],["translation",_t("Dịch")],["listening",_t("Nghe chép")],["roleplay","Role-play"]];
  const parts = keys.map(([k]) => sc[k]).filter(x => x != null), total = Math.round(avg(parts));
  const ms = lessonMistakes(l), g = l.les.grammar;
  const nextTest = (doneN() + 1) % 5 === 0;
  const stars = total >= 85 ? 3 : total >= 65 ? 2 : total >= 40 ? 1 : 0;
  return `<section class="panel summary-hero">${total >= 75 ? confetti() : ""}<div class="row nowrap">${mascot(total >= 60 ? "cheer" : "think", 110, "bob")}${_t("\n     <div class=\"grow\"><span class=\"eyebrow\">Tổng kết buổi học</span><h2>")}${esc(tp(l.les.topic))}</h2>
     <div class="stars">${[0, 1, 2].map(i => stk("star", 46, i < stars ? "" : "dim", (i - 1) * 12)).join("")}</div>
     <p class="muted">${stars === 3 ? _t("Xuất sắc! Bạn làm rất tốt.") : stars === 2 ? _t("Tốt lắm! Thêm chút nữa là đạt 3 sao.") : stars === 1 ? _t("Khá ổn. Ôn lại phần chưa vững nhé.") : _t("Đừng nản, buổi sau sẽ tốt hơn!")}</p></div></div>
     <div class="scorebig"><b>${total}${_t("</b><span>điểm trung bình</span></div>\n     <div class=\"bars\">")}${keys.map(([k, n]) => `<div class="bar"><span>${n}</span><div><i style="width:${sc[k] ?? 0}%"></i></div><b>${sc[k] ?? "–"}</b></div>`).join("")}${_t("</div></section>\n   <section class=\"panel\"><h3>Từ vựng hôm nay (")}${l.les.words.length}${_t(" từ, đã vào flashcard)</h3>\n     <div class=\"wordgrid\">")}${l.les.words.map(w => `<div><b>${esc(w.w)}</b><span class="ipa">${esc(w.ipa || "")}</span><span class="muted">${esc(w.vi)}</span></div>`).join("")}${_t("</div></section>\n   <section class=\"panel\"><h3>Ngữ pháp: ")}${esc(tp(g.name))}</h3>${g.pattern ? `<div class="pattern">${esc(g.pattern)}</div>` : ""}<p class="muted">${twv(g.note || "")}</p></section>
   ${ms.length ? `${_t("<section class=\"panel\"><h3>Lỗi cần nhớ</h3>")}${ms.map(m => `<div class="fb bad"><s>${esc(m.text)}</s><br><b>${esc(m.fix)}</b></div>`).join("")}</section>` : ""}
   <section class="panel"><p>${nextTest ? _t("<b>Buổi tới là bài kiểm tra định kỳ</b> sau 5 buổi học.") : `${_t("Còn ")}${5 - (doneN() + 1) % 5}${_t(" buổi nữa đến bài kiểm tra định kỳ.")}`}${_t(" Bạn có ")}${dueCards().length}${_t(" thẻ flashcard cần ôn.</p>\n     <button class=\"primary\" data-a=\"finishLesson\" data-v=\"")}${total}${_t("\">Hoàn thành buổi học</button></section>")}`;
}
function finishLesson(total) {
  const l = L();
  S.sessions.push({idx:l.idx, course:l.course, date:today(), topic:l.les.topic, words:l.les.words.map(w => w.w), grammar:l.les.grammar?.name || "",
    scores:l.scores, total:Number(total), mistakes:lessonMistakes(l), dur:Math.round((Date.now() - l.started) / 60000), remedial:!!l.les.remedial, unit:Math.floor(Math.max(0, doneN() - (l.les.remedial ? 1 : 0)) / 5)});
  S.current = null; Q = null; checkBadges(); updateWriting(); checkAdjust(); save(); view = "home"; render(); scrollTo(0, 0);
  toast(UI.skillNews || _t("Đã lưu buổi học. Giỏi lắm!")); UI.skillNews = "";
  prefetchNext();
}

/* =====================================================================
   KIỂM TRA ĐỊNH KỲ (sau mỗi 5 buổi)
   ===================================================================== */
// Tuần đầu: sau buổi 3 và buổi 6, nếu bài quá dễ/khó thì gợi ý đổi trình độ
function checkAdjust() {
  if (!S.path) return; const rs = regSessions(), n = rs.length;
  if (![3, 6].includes(n) || (S.path.adjAt || []).includes(n)) return;
  S.path.adjAt = [...(S.path.adjAt || []), n];
  const a = avg(rs.slice(-3).map(x => x.total)), i = lvIdx(S.level), w = S.skills?.writing ? lvIdx(S.skills.writing) : null;
  if (a >= 90 && i < 5) S.adjOffer = {dir:"up", to:LEVELS[i + 1], avg:Math.round(a), w:w !== null && w > i};
  else if (a <= 50 && i > 0) S.adjOffer = {dir:"down", to:LEVELS[i - 1], avg:Math.round(a), w:w !== null && w < i};
}
function changeLevel(to) {
  const old = S.level; S.level = to; S.target = LEVELS[Math.min(5, lvIdx(to) + 1)];
  if (S.path) { S.path.from = to; S.path.to = S.target; }
  for (const k of Object.keys(S.lessons || {})) if (Number(k) >= S.sessions.length) delete S.lessons[k]; // soạn lại các bài sắp tới theo trình độ mới
  S.adjOffer = null; save(); render(); toast(`${_t("Đã đổi trình độ")} ${old} → ${to}. ${_t("Các bài tiếp theo sẽ theo trình độ mới.")}`); prefetchNext();
}
function adjCard() {
  const o = S.adjOffer; if (!o) return "";
  const up = o.dir === "up";
  return `<section class="panel notice adjcard"><div class="row nowrap">${mascot(up ? "cheer" : "think", 76, "bob")}<div class="grow">
    <b>${up ? _t("Có vẻ bài hơi dễ với bạn!") : _t("Có vẻ bài đang hơi khó")}</b>
    <p class="small">${_t("Điểm trung bình 3 buổi gần nhất:")} <b>${o.avg}</b>.${o.w ? " " + (up ? _t("Phần viết của bạn cũng tốt hơn trình độ hiện tại.") : _t("Phần viết của bạn cũng cần củng cố thêm.")) : ""} ${up ? _t("Bạn muốn lên") : _t("Bạn muốn học ở mức")} <b>${o.to}</b>${_t("?")}</p>
    <div class="row"><button class="primary" data-a="adjYes" data-v="${o.to}">${up ? `${_t("Lên")} ${o.to}` : `${_t("Chuyển sang")} ${o.to}`}</button><button class="ghost" data-a="adjNo">${_t("Giữ trình độ")} ${S.level}</button></div></div></div></section>`;
}
function startUnit() {
  const last5 = regSessions().slice(-5), lessons = last5.map(s => S.lessons[s.idx]).filter(Boolean);
  const words = lessons.flatMap(l => l.words), pool = [...words, ...cardList().map(c => c.w)];
  const items = [
    ...shuffle(words).slice(0, 8).map((w, k) => k % 2 ? wordQ(w, pool) : meaningQ(w, pool)),
    ...shuffle(lessons.flatMap(l => l.grammar?.quiz || [])).slice(0, 5).map(gramQ),
    ...shuffle(words).slice(0, 4).map(spellQ),
    ...shuffle(lessons.flatMap(l => (l.translations || []).filter(t => t.dir === "vi-en"))).slice(0, 3).map(transQ),
    ...shuffle(words).slice(0, 3).map(w => ({...meaningQ(w, pool, "listening"), q:_t("Nghe và chọn nghĩa đúng"), speak:w.w, autoplay:true})),
    ...shuffle(words.filter(w => w.ex)).slice(0, 2).map(w => ({type:"dict", q:_t("Nghe và chép lại câu"), ans:w.ex, speak:w.ex, autoplay:true, skill:"listening"})),
    ...(SR ? shuffle(words.filter(w => w.ex)).slice(0, 2).map(w => ({type:"speak", q:w.ex, ans:w.ex, skill:"speaking"})) : [])
  ];
  Q = makeQuiz("unit", items, true); Q.unit = courseTests().length + 1; view = "quiz"; render();
}
function finishUnit(q) {
  const skills = {};
  q.res.forEach(r => { (skills[r.skill] = skills[r.skill] || [0, 0])[1]++; if (r.ok) skills[r.skill][0]++; });
  const p = pct(q.res.filter(r => r.ok).length, q.res.length);
  const wrongWords = [...new Set(q.res.filter(r => !r.ok && r.word).map(r => r.word))];
  const ss = Object.fromEntries(Object.entries(skills).map(([k, [a, b]]) => [k, pct(a, b)]));
  let adj;
  if (p >= 85) { S.difficulty = Math.min(1, S.difficulty + 1); adj = _t("Bạn nắm bài rất tốt. Các buổi tới sẽ khó hơn một chút."); }
  else if (p >= 60) { adj = _t("Bạn đang theo kịp lộ trình. Giữ nguyên nhịp độ."); }
  else { S.difficulty = Math.max(-1, S.difficulty - 1); S.remedial = wrongWords.map(w => S.cards[cardKey(w)]?.w).filter(Boolean); adj = _t("Hệ thống đã thêm 1 buổi ôn tập vào lộ trình để củng cố các từ còn sai."); }
  const t = {course:S.path.id, unit:q.unit, date:today(), score:p, skills:ss, wrong:wrongWords, dur:Math.round((Date.now() - q.start) / 60000), adj};
  S.tests.push(t); checkBadges(); save();
  Q = null; view = "unitResult"; UI.lastTest = t; render();
}
function vUnitResult() {
  const t = UI.lastTest;
  return `<div class="wrap narrow"><section class="panel summary-hero">${t.score >= 85 ? confetti(56) : ""}<div class="row nowrap">${mascot(t.score >= 60 ? "cheer" : "think", 110, "bob")}${stk(t.score >= 85 ? "trophy" : t.score >= 60 ? "star" : "book", 70, "", -8)}${_t("</div><span class=\"eyebrow\">Kiểm tra định kỳ · Unit ")}${t.unit}</span><div class="scorebig"><b>${t.score}%</b><span>${t.score >= 85 ? _t("Xuất sắc") : t.score >= 60 ? _t("Đạt") : _t("Cần ôn thêm")}</span></div>
    <div class="bars">${Object.entries(t.skills).map(([k, v]) => `<div class="bar"><span>${SKILL_VI[k] || k}</span><div><i style="width:${v}%"></i></div><b>${v}</b></div>`).join("")}</div>
    <p class="fb">${esc(t.adj)}</p>
    ${t.wrong.length ? `${_t("<h3>Từ cần ôn lại</h3><p>")}${t.wrong.map(w => `<span class="chip">${esc(w)}</span>`).join(" ")}</p>` : ""}${_t("\n    <div class=\"row\"><button class=\"primary\" data-a=\"go\" data-v=\"home\">Về trang chủ</button>")}${t.wrong.length ? `${_t("<button data-a=\"go\" data-v=\"review\">Ôn flashcard ngay</button>")}` : ""}</div></section></div>`;
}

/* =====================================================================
   CÁC MÀN HÌNH
   ===================================================================== */
const newSv = (p) => p ? Object.assign({subs:[], job:""}, JSON.parse(JSON.stringify(p))) : {name:ME?.name || "", goal:"communication", fields:[], subs:[], job:"", minutes:30, interest:"", weak:[], remind:"20:00", deadline:""};
function vSurvey() {
  const s = SV, g = s.goal, edit = !!S.level;
  return `<div class="wrap narrow">${edit ? "" : `<div class="svlang"><button class="${LANG === "vi" ? "on" : ""}" data-a="setLang" data-v="vi">🇻🇳 Tiếng Việt</button><button class="${LANG === "en" ? "on" : ""}" data-a="setLang" data-v="en">🇬🇧 English</button></div>`}<section class="panel hero with-art"><div class="hero-art">${mascot("happy", 116, "bob")}</div><span class="eyebrow">${edit ? _t("Cập nhật mục tiêu") : _t("Bước 1/2 · Khảo sát")}${_t("</span><h1>Bạn học tiếng Anh để làm gì?</h1>\n    <p class=\"muted\">Câu trả lời quyết định chủ đề, từ vựng và tình huống role-play trong từng buổi học.</p></section>\n   <section class=\"panel\"><label for=\"sv-name\"><h3>Bạn tên gì?</h3></label><input id=\"sv-name\" data-sv=\"name\" value=\"")}${esc(s.name)}${_t("\" placeholder=\"Tên để app xưng hô\">\n    <h3>Mục tiêu chính</h3><div class=\"choices\">")}${GOALS.map(([k, t]) => `<button class="choice ${g === k ? "sel" : ""}" data-a="svGoal" data-v="${k}">${stk(GOAL_STK[k], 40, "", 0)}<span>${t}</span></button>`).join("")}</div>
    <h3>${g === "exam" ? _t("Kỳ thi bạn nhắm tới") : g === "work" ? _t("Lĩnh vực công việc") : g === "travel" ? _t("Hình thức đi nước ngoài") : _t("Bạn muốn giao tiếp trong tình huống nào")}${_t(" <span class=\"muted normal\">(chọn một hoặc nhiều)</span></h3>\n    <div class=\"chips\">")}${FIELDS[g].map(([f], k) => `<button class="chip-btn ${s.fields.includes(f) ? "sel" : ""}" data-a="svField" data-v="${k}">${f}</button>`).join("")}</div>
    ${s.fields.length ? `<div class="subs"><h3>${g === "exam" ? _t("Kỹ năng cần luyện nhiều nhất") : _t("Tình huống cụ thể bạn hay gặp")}${_t(" <span class=\"muted normal\">(chọn càng đúng, bài học càng sát)</span></h3>\n      ")}${(() => { const all = subGroups(s).flatMap(f => subsOf(g, f).map(x => f + ": " + x)), full = all.length && all.every(k => s.subs.includes(k));
        return `<div class="row subsall"><button class="mini ${full ? "sel" : ""}" data-a="svSubAll">${full ? _t("Bỏ chọn tất cả") : "✓ " + _t("Chọn tất cả")}</button>${s.subs.length ? `<span class="muted small">${_t("Đã chọn")} ${s.subs.length} ${_t("tình huống")}</span>` : ""}</div>`; })()}${subGroups(s).map(f => `<div class="subgroup"><p class="eyebrow">${esc(f)}</p><div class="chips">${subsOf(g, f).map(x => { const key = f + ": " + x; return `<button class="chip-btn sm ${s.subs.includes(key) ? "sel" : ""}" data-a="svSub" data-v="${esc(key)}">${esc(x)}</button>`; }).join("")}</div></div>`).join("")}</div>` : ""}
    ${g === "work" ? `${_t("<label for=\"sv-job\"><h3>Vị trí công việc của bạn</h3></label><input id=\"sv-job\" data-sv=\"job\" value=\"")}${esc(s.job || "")}${_t("\" placeholder=\"Ví dụ: QA Engineer, nhân viên lễ tân, kế toán\">")}` : ""}
    <label for="sv-int"><h3>${g === "exam" ? _t("Điểm mục tiêu và kỹ năng cần nhất") : _t("Mô tả cụ thể hơn")}${_t(" <span class=\"muted normal\">(không bắt buộc)</span></h3></label>\n    <input id=\"sv-int\" data-sv=\"interest\" placeholder=\"")}${DETAIL_HINT[g]}" value="${esc(s.interest)}">
    ${g === "exam" ? `${_t("<label for=\"sv-dl\"><h3>Ngày thi <span class=\"muted normal\">(để tính độ dài khóa học)</span></h3></label><input id=\"sv-dl\" type=\"date\" data-sv=\"deadline\" value=\"")}${esc(s.deadline)}" class="short">` : ""}${_t("\n    <h3>Thời gian học mỗi ngày</h3><div class=\"choices\">")}${[15, 30, 45].map(m => `<button class="choice ${s.minutes === m ? "sel" : ""}" data-a="svMin" data-v="${m}">${m}${_t(" phút</button>")}`).join("")}${_t("</div>\n    <h3>Kỹ năng muốn cải thiện</h3><div class=\"chips\">")}${[_t("Nghe"),_t("Nói"),_t("Đọc"),_t("Viết")].map(k => `<button class="chip-btn ${s.weak.includes(k) ? "sel" : ""}" data-a="svWeak" data-v="${k}">${k}</button>`).join("")}${_t("</div>\n    <label for=\"sv-rm\"><h3>Nhắc tôi học từ lúc</h3></label><input id=\"sv-rm\" type=\"time\" data-sv=\"remind\" value=\"")}${esc(s.remind)}${_t("\" class=\"short\">\n    <p class=\"muted small\">Nếu chưa học, app nhắc mỗi tiếng từ giờ này đến 23:00. Đổi giờ và khoảng cách nhắc trong Cài đặt.</p>\n    <div class=\"row\">")}${edit ? `${_t("<button data-a=\"go\" data-v=\"settings\">Hủy</button>")}` : ""}<button class="primary" data-a="svSubmit" ${s.fields.length ? "" : "disabled"}>${!s.fields.length ? _t("Chọn ít nhất một lĩnh vực") : edit ? _t("Lưu mục tiêu") : _t("Tiếp tục: kiểm tra trình độ")}</button></div></section></div>`;
}
// Lần đầu dùng app: hỏi có bật thông báo nhắc học không
function pushAskCard() {
  if (S.profile?.pushAsked || PUSH.on) return "";
  const ios = isIOS() && !isStandalone();
  return `<section class="panel pushask"><div class="row nowrap">${stk("calendar", 54, "", -8)}${_t("<div class=\"grow\"><h3>🔔 Cho phép app nhắc bạn học mỗi ngày?</h3>\n    <p class=\"small\">Nếu hôm đó bạn chưa học, app sẽ nhắc từ ")}${esc(S.profile.remind || "20:00")}${_t(". Đổi giờ hoặc tắt bất cứ lúc nào trong Cài đặt.</p>\n    ")}${ios ? `${_t("<p class=\"small muted\">Trên iPhone: bấm <b>Chia sẻ</b> → <b>Thêm vào MH chính</b>, rồi mở app từ biểu tượng ngoài màn hình để bật được thông báo.</p>")}` : ""}</div></div>
    <div class="row">${ios ? "" : `${_t("<button class=\"primary\" data-a=\"pushAsk\" data-v=\"1\">Bật thông báo</button>")}`}<button class="ghost" data-a="pushAsk" data-v="0">${ios ? _t("Đã hiểu") : _t("Để sau")}</button></div></section>`;
}
function lvPicker() {
  return `<section class="panel"><h3>${_t("Chọn trình độ của bạn")}</h3><p class="muted small">${_t("Nếu bạn đã biết trình độ (ví dụ qua IELTS, TOEIC hay lớp học), chọn luôn ở đây.")}</p>
    <div class="lvpick">${LEVELS.map(l => `<button class="seg ${S.placement?.level === l ? "sel" : ""}" data-a="pickLevel" data-v="${l}"><b>${l}</b><span>${esc(_t(LEVEL_VI[l]))}</span></button>`).join("")}</div></section>`;
}
function vPlaceIntro() {
  const en = LANG === "en";
  return `<div class="wrap narrow">${pushAskCard()}<section class="panel hero with-art"><div class="hero-art">${mascot("think", 116, "bob")}</div>
    <span class="eyebrow">${_t("Bước 2/2 · Kiểm tra trình độ")}</span><h1>${_t("Bài test 4 kỹ năng, khoảng 5 phút")}</h1>
    <div class="plparts">${PL_PARTS.map(p => `<div>${stk(p.ic, 34, "", 0)}<b>${en ? p.en : p.vi}</b><span>${p.n} ${p.k === "reading" ? _t("bài đọc") : _t("câu")}</span></div>`).join("")}</div>
    <p class="muted">${_t("Câu hỏi tự khó hoặc dễ hơn theo câu trả lời của bạn. Không biết thì chọn \"Tôi không biết\", đừng đoán. Phần Viết sẽ được chấm dần qua 3 bài học đầu tiên.")}</p>
    <button class="primary big" data-a="startPlacement">${_t("Bắt đầu kiểm tra")}</button>
    <div class="row center"><button class="ghost" data-a="skipPlacement">${_t("Tôi mới bắt đầu, bỏ qua và học từ A0")}</button><button class="ghost" data-a="pickLvOpen">${_t("Tôi đã biết trình độ của mình")}</button></div></section>
    ${UI.pickLv ? lvPicker() : ""}</div>`;
}
function skillBars(sk, opts = {}) {
  const en = LANG === "en", order = ["grammar", "listening", "reading", "speaking", "writing"];
  return `<div class="skbars">${order.map(k => { const v = sk?.[k], i = v ? lvIdx(v) : -1, [vi, enN, ic] = SKILL_NAMES[k];
    const note = v ? "" : k === "writing" ? (opts.wNote || _t("Đánh giá qua 3 bài học đầu")) : _t("Chưa đánh giá");
    return `<div class="skrow">${stk(ic, 30, "", 0)}<span class="skn">${en ? enN : vi}</span><span class="skbar"><i style="width:${v ? Math.max(8, (i + 1) / 6 * 100) : 0}%"></i></span><b class="skv">${v || "–"}</b>${note ? `<span class="small muted sknote">${note}</span>` : ""}</div>`; }).join("")}</div>`;
}
function vPlaceResult() {
  const p = S.placement, i = lvIdx(p.level), to = LEVELS[Math.min(5, i + 1)], weeks = courseWeeks(p.level, S.profile);
  const sk = {...(p.skills || {}), writing:S.skills?.writing || null};
  const weak = Object.entries(p.skills || {}).filter(([, v]) => v).sort((a, b) => lvIdx(a[1]) - lvIdx(b[1]))[0];
  return `<div class="wrap narrow"><section class="panel hero with-art">${confetti(30)}<div class="hero-art">${mascot("cheer", 116, "bob")}</div>
    <span class="eyebrow">${_t("Kết quả kiểm tra")}</span>
    <div class="levelbadge">${p.level}</div><h1>${esc(_t(LEVEL_VI[p.level]))}</h1>
    <p>${p.manual ? _t("Bạn tự chọn trình độ này.") : p.early ? _t("Bạn đang ở mức mới bắt đầu, SEED sẽ dạy từ những điều cơ bản nhất.") : `${_t("Bạn trả lời đúng ")}${p.correct}/${p.total}${_t(" câu.")}`}</p>
    <div class="ladder">${LEVELS.map((l, k) => `<span class="${k === i ? "cur" : k === i + 1 ? "next" : k < i ? "past" : ""}">${l}</span>`).join("")}</div>
    ${p.skills ? `<h3>${_t("Trình độ từng kỹ năng")}</h3>${skillBars(sk)}${weak && lvIdx(weak[1]) < i ? `<p class="small">💡 ${_t("Kỹ năng cần ưu tiên:")} <b>${LANG === "en" ? SKILL_NAMES[weak[0]][1] : SKILL_NAMES[weak[0]][0]}</b>.${["listening", "speaking"].includes(weak[0]) ? " " + _t("Mỗi bài học sẽ có thêm 1 câu luyện kỹ năng này.") : ""}</p>` : ""}` : ""}
    <h3>${_t("Lộ trình đề xuất")}</h3>
    <p><b>${p.level} → ${to}</b> ${_t("trong")} <b>${weeks} ${_t("tuần")}</b>: ${weeks * 5} ${_t("buổi học, mỗi buổi")} ${S.profile.minutes} ${_t("phút")}, ${weeks} ${_t("bài kiểm tra định kỳ. Nội dung xoay quanh")} <b>${esc(fieldName())}</b>.</p>
    <button class="primary big" data-a="confirmPath">${_t("Bắt đầu lộ trình")}</button>
    <div class="row center"><button class="ghost" data-a="pickLvOpen">${_t("Tôi muốn chọn trình độ khác")}</button><button class="ghost" data-a="startPlacement">${_t("Làm lại bài test")}</button></div></section>
    ${UI.pickLv ? lvPicker() : ""}</div>`;
}
function vQuiz() {
  if (!Q) { view = "home"; return vHome(); }
  if (Q.mode === "review" && Q.done) {
    const ok = Q.res.filter(r => r.ok).length;
    return `<div class="wrap narrow"><section class="panel center">${confetti(30)}${mascot("cheer", 110, "bob")}${_t("<h2>Xong phiên ôn tập</h2><div class=\"scorebig\"><b>")}${ok}/${Q.res.length}${_t("</b><span>câu đúng</span></div>\n      <div class=\"row center\"><button class=\"primary\" data-a=\"go\" data-v=\"review\">Về trang Ôn tập</button></div></section></div>")}`;
  }
  const title = Q.mode === "placement" ? _t("Kiểm tra trình độ") : Q.mode === "xtest" ? `${esc(xtName(Q.x))} · ${Q.x.level}` : Q.mode === "unit" ? `${_t("Kiểm tra định kỳ · Unit ")}${Q.unit}` : _t("Ôn tập flashcard");
  return `<div class="wrap narrow"><p class="eyebrow center">${title}</p><section class="panel quiz ${Q.mode === "placement" || Q.mode === "xtest" ? "pl" : ""}">${vQuizBody(Q, {exit:"quitQuiz"})}</section>
   ${(Q.mode === "placement" || Q.mode === "xtest") && !Q.pick && Q.items[Q.i]?.type === "mcq" ? `${_t("<div class=\"center\"><button class=\"ghost\" data-a=\"pick\" data-v=\"-1\">Tôi không biết</button></div>")}` : ""}${(Q.mode === "placement" || Q.mode === "xtest") && Q.items[Q.i]?.type === "speak" ? `<div class="center"><button class="ghost" data-a="plSkip">${_t("Bỏ qua phần nói")}</button></div>` : ""}</div>`;
}

function greetLine() {
  const h = new Date().getHours();
  if (doneToday()) return _t("Hôm nay bạn đã học rồi, tuyệt vời! Ôn thêm vài thẻ flashcard cho nhớ lâu nhé.");
  if (h < 11) return _t("Chào buổi sáng! Một buổi học ngắn giúp cả ngày nói tiếng Anh tự tin hơn.");
  if (h < 14) return _t("Nghỉ trưa học một chút nhé, chỉ cần ") + (S.profile?.minutes || 30) + _t(" phút thôi.");
  if (h < 18) return _t("Buổi chiều vui vẻ! Bài học hôm nay đang chờ bạn.");
  return _t("Buổi tối thư thả là lúc học hiệu quả nhất. Bắt đầu thôi!");
}
function vHome() {
  if (courseDone()) return vCourseDone();
  const n = doneN(), p = S.path, td = testDue(), cur = S.current && S.current.idx === S.sessions.length ? S.current : null;
  const nextLes = S.lessons[S.sessions.length];
  const topic = cur ? cur.les.topic : nextLes?.topic || "";
  const [ts, hue] = td ? ["target", "coral"] : topicStk(topic + " " + (nextSituation() || "") + " " + fieldName());
  const days = LANG === "en" ? ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] : ["T2","T3","T4","T5","T6","T7","CN"], d0 = new Date(); d0.setDate(d0.getDate() - ((d0.getDay() + 6) % 7));
  const week = days.map((k, i) => { const d = new Date(d0); d.setDate(d0.getDate() + i); const ds = d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
    const on = S.sessions.some(s => s.date === ds), fz = !on && (S.frozen || []).includes(ds); return `<div class="day ${on || fz ? "on" : ""} ${ds === today() ? "today" : ""}" ${fz ? `title="${_t("Đóng băng chuỗi")}"` : ""}><span>${k}</span><i>${on ? stk("flame", 22, "", 0) : fz ? "🧊" : ""}</i></div>`; }).join("");
  const due = dueCards().length, avgScore = Math.round(avg(courseSessions().slice(-5).map(s => s.total))), st = streak();
  const units = Math.ceil(p.total / 5), prog = pct(n, p.total);
  const celebrate = UI.celebrate?.length ? `<section class="panel celebrate">${confetti()}<div class="row nowrap">${mascot("cheer", 100, "bob")}${_t("<div class=\"grow\"><p class=\"eyebrow\">Nhãn dán mới</p><h2>Bạn vừa mở khóa ")}${UI.celebrate.length}${_t(" nhãn dán!</h2></div></div>\n     <div class=\"badge-row\">")}${UI.celebrate.map(id => BADGE[id] ? badgeCard(BADGE[id]) : "").join("")}${_t("</div><div class=\"row\"><button class=\"primary\" data-a=\"closeCelebrate\">Tuyệt quá!</button><a href=\"#\" class=\"link\" data-a=\"go\" data-v=\"history\">Xem bộ sưu tập →</a></div></section>")}` : "";
  return `<div class="wrap">
   ${festBanner()}${pushAskCard()}${celebrate}
   <section class="hero-home">
     <div class="hh-text"><p class="eyebrow">${esc(focusName())}${_t("</p><h1>Chào ")}${esc(displayName() || _t("bạn"))}!</h1><p class="hh-line">${greetLine()}</p>
       <div class="hh-chips"><span>${stk("flame", 22, "", 0)} ${st}${_t(" ngày liên tiếp</span><span>")}${stk("cap", 22, "", 0)}${_t(" Khóa ")}${p.from} → ${p.to}</span><span>${stk("calendar", 22, "", 0)}${_t(" Tuần ")}${Math.min(p.weeks, Math.floor(n / 5) + 1)}/${p.weeks}</span></div>
       <div class="week">${week}</div></div>
     <div class="hh-art">${mascot(doneToday() ? "cheer" : "happy", 168, "bob")}${stk("star", 40, "float f1", -12)}${stk("sparkle", 34, "float f2", 8)}${stk("book", 44, "float f3", -6)}</div>
   </section>
   ${adjCard()}${rankCard()}${testCard()}
   ${remindDue() ? `<section class="panel notice row nowrap">${stk("calendar", 40, "", -6)}${_t("<div><b>Đã đến giờ học (")}${remindTime()}${_t(")</b><br><span class=\"muted\">Bạn chưa học hôm nay. Chỉ cần ")}${S.profile.minutes}${_t(" phút để giữ chuỗi ngày học.</span></div></section>")}` : ""}
   <div class="grid-main">
    <section class="panel todaycard hue-${hue}">
     <div class="cover">${stk(ts, 104, "big")}<span class="cover-tag">${td ? _t("Kiểm tra định kỳ") : cur ? `${_t("Đang ở bước ")}${cur.step + 1}/6` : `${_t("Buổi ")}${n + 1}/${p.total}`}</span></div>
     <div class="today-body">
     ${td ? `${_t("<span class=\"eyebrow\">Đến hạn</span><h2>Kiểm tra định kỳ Unit ")}${n / 5}${_t("</h2>\n        <p class=\"muted\">Bạn đã xong 5 buổi học. Bài kiểm tra gồm từ vựng, ngữ pháp, chính tả, dịch, nghe và nói, khoảng 15 phút.</p>\n        <button class=\"primary big\" data-a=\"startUnit\">Làm bài kiểm tra</button>")}`
     : `<span class="eyebrow">${doneToday() && !cur ? _t("Bạn đã học hôm nay") : _t("Buổi học hôm nay")}</span>
        <h2>${cur ? esc(tp(cur.les.topic)) : nextLes ? esc(tp(nextLes.topic)) : `${_t("Buổi ")}${n + 1}`}</h2>
        ${!cur && nextLes ? `${_t("<p class=\"small\"><span class=\"tag good\">Đã soạn xong</span> ")}${nextLes.ai ? _t("Bài soạn riêng theo mục tiêu của bạn") : `${_t("Bài mẫu trình độ ")}${nextLes.level || S.level}${nextLes.review ? _t(" · ôn lại") : ""}`}</p>` : !cur && INFLIGHT[S.sessions.length] ? `${_t("<p class=\"small muted\"><span class=\"spin\"></span> AI đang soạn sẵn buổi này...</p>")}` : ""}
        <ol class="steps-mini">${STEPS.map((t, k) => `<li class="${cur && k < cur.step ? "done" : cur && k === cur.step ? "cur" : ""}">${stk(STEP_STK[k], 30, "", 0)}<span>${t}</span></li>`).join("")}</ol>
        <button class="primary big" data-a="startLesson">${cur ? _t("Học tiếp") : doneToday() ? _t("Học thêm buổi tiếp theo") : _t("Bắt đầu buổi học")}</button>`}
     </div></section>
    <section class="tiles">
      <div class="tile hue-coral">${stk("flame", 44)}<b>${st}${_t("</b><span>ngày học liên tiếp</span></div>\n      <div class=\"tile hue-mint\">")}${stk("book", 44)}<b>${Object.keys(S.cards).length}${_t("</b><span>từ đã học</span></div>\n      <div class=\"tile hue-sun\">")}${stk("star", 44)}<b>${avgScore || "–"}${_t("</b><span>điểm TB 5 buổi</span></div>\n      <button class=\"tile hue-sky\" data-a=\"")}${due ? "startFlip" : "go"}" data-v="${due ? "due" : "review"}">${stk("headphones", 44)}<b>${due}</b><span>${due ? _t("thẻ cần ôn · bấm để ôn") : _t("thẻ cần ôn")}</span></button>
    </section>
   </div>
   <section class="panel"><div class="row between"><h3 class="row">${stk("map", 32, "", -4)}${_t(" Hành trình khóa học</h3><a href=\"#\" class=\"link\" data-a=\"go\" data-v=\"path\">Xem lộ trình →</a></div>\n    <div class=\"track\"><div class=\"track-fill\" style=\"width:")}${prog}%"></div>
     ${Array.from({length:units}, (_, u) => { const left = Math.min(100, (u + 1) * 5 / p.total * 100), done = courseTests()[u]; return `<span class="mile ${done ? "done" : ""}" style="left:${left}${_t("%\" title=\"Kiểm tra Unit ")}${u + 1}">${stk(done ? "trophy" : "target", 26, "", 0)}</span>`; }).join("")}
     <span class="track-me" style="left:${prog}%">${mascot("happy", 44)}</span></div>
    <p class="muted small">${n}/${p.total}${_t(" buổi · ")}${courseTests().length}/${units}${_t(" bài kiểm tra · cờ là các bài kiểm tra định kỳ</p></section></div>")}`;
}
function vCourseDone() {
  const p = S.path, ts = courseTests(), ss = courseSessions(), i = lvIdx(p.to);
  return `<div class="wrap narrow"><section class="panel hero center">${confetti(60)}${mascot("cheer", 140, "bob")}${_t("<span class=\"eyebrow\">Hoàn thành khóa học</span><div class=\"levelbadge\">")}${p.to}${_t("</div>\n    <h1>Chúc mừng ")}${esc(displayName() || _t("bạn"))}${_t("!</h1><p>Bạn đã hoàn thành ")}${ss.length}${_t(" buổi học và ")}${ts.length}${_t(" bài kiểm tra của khóa ")}${p.from} → ${p.to}.</p>
    <div class="stats"><div class="stat"><b>${Math.round(avg(ss.map(s => s.total)))}${_t("</b><span>điểm TB buổi học</span></div><div class=\"stat\"><b>")}${Math.round(avg(ts.map(t => t.score)))}${_t("%</b><span>điểm TB kiểm tra</span></div><div class=\"stat\"><b>")}${Object.keys(S.cards).length}${_t("</b><span>từ đã học</span></div></div>\n    ")}${i < 5 ? `${_t("<button class=\"primary big\" data-a=\"nextCourse\">Bắt đầu khóa ")}${p.to} → ${LEVELS[i + 1]}</button>` : `${_t("<button class=\"primary big\" data-a=\"nextCourse\">Tiếp tục nâng cao trình độ C1</button>")}`}</section></div>`;
}
function skillsPanel() {
  const sk = {...(S.skills || {})}; if (!Object.values(sk).some(Boolean) && !(S.writeEv || []).length) return "";
  const ev = (S.writeEv || []).length, need = Math.max(0, 3 - S.sessions.length);
  const wNote = sk.writing ? "" : need ? `${_t("đang đánh giá")} (${Math.min(3, S.sessions.length)}/3 ${_t("bài")})` : `${_t("cần thêm câu tự viết")} (${ev}/6)`;
  return `<section class="panel"><div class="row between"><h3>${_t("Trình độ từng kỹ năng")}</h3><button class="mini ghost" data-a="go" data-v="tests">${_t("Kiểm tra trình độ")} ›</button></div>${skillBars(sk, {wNote})}
    <p class="muted small">${_t("Viết được chấm qua các câu bạn tự đặt, dịch và nhắn trong role-play, cập nhật mỗi tuần.")}</p></section>`;
}
function vPath() {
  const p = S.path, n = doneN(), units = Math.ceil(p.total / 5), tests = courseTests();
  let html = "";
  for (let u = 0; u < units; u++) {
    const cells = [];
    for (let k = 0; k < 5; k++) {
      const no = u * 5 + k; if (no >= p.total) break;
      const s = regSessions()[no], les = s ? S.lessons[s.idx] : (no === n ? S.lessons[S.sessions.length] : null);
      const seq = bankSequence(), plan = !s && !les && seq.length ? seq[no % seq.length] : null;
      const st = s ? "done" : no === n && !testDue() ? "now" : "locked";
      cells.push(`<li class="${st}"><span class="num">${no + 1}</span>${s || les || plan ? stk(topicStk(s?.topic || les?.topic || plan?.topic)[0], 32, "", 0) : ""}<div><b>${esc(tp(s?.topic || les?.topic || plan?.topic) || (st === "locked" ? _t("Chưa mở") : _t("Buổi tiếp theo")))}</b>${plan ? `${_t("<span class=\"muted small\">Dự kiến · ")}${plan.level} · ${esc(tp(plan.grammar?.name || ""))}</span>` : ""}${s ? `<span class="muted small">${s.date} · ${s.total}${_t(" điểm")}${s.remedial ? _t(" · ôn tập") : ""}</span>` : ""}</div>${s ? `<em>${s.total}</em>` : st === "now" ? `${_t("<button class=\"mini primary\" data-a=\"startLesson\">Học</button>")}` : ""}</li>`);
    }
    courseSessions().filter(s => s.remedial && s.unit === u).forEach(s => cells.push(`<li class="done"><span class="num">+</span><div><b>${esc(tp(s.topic))}</b><span class="muted small">${s.date} · ${s.total}${_t(" điểm</span></div><em>")}${s.total}</em></li>`));
    const t = tests[u], tst = t ? "done" : (n >= (u + 1) * 5 ? "now" : "locked");
    html += `<section class="panel unit ${n >= u * 5 && n < (u + 1) * 5 + 1 ? "active" : ""}"><div class="row between"><h3 class="row">${stk(WEEK_STK[u % WEEK_STK.length], 34, "", 0)}${_t(" Tuần ")}${u + 1}</h3><span class="muted small">${Math.min(5, Math.max(0, n - u * 5))}${_t("/5 buổi</span></div>\n      <ol class=\"sessions\">")}${cells.join("")}<li class="test ${tst}${_t("\"><span class=\"num\">✓</span><div><b>Kiểm tra định kỳ Unit ")}${u + 1}</b>${t ? `<span class="muted small">${t.date}</span>` : ""}</div>${t ? `<em>${t.score}%</em>` : tst === "now" ? `${_t("<button class=\"mini primary\" data-a=\"startUnit\">Làm bài</button>")}` : ""}</li></ol></section>`;
  }
  return `<div class="wrap"><section class="hello">${stk("map", 72, "", -6)}${_t("<div><p class=\"eyebrow\">Lộ trình của bạn</p><h1>")}${p.from} → ${p.to}</h1><p class="muted">${p.weeks}${_t(" tuần · ")}${p.total}${_t(" buổi · bắt đầu ")}${p.start} · ${esc(focusName())}${_t("</p><p class=\"muted small\">Các buổi chưa học hiện bài dự kiến trong kho bài mẫu ")}${p.from}${p.to !== p.from ? " → " + p.to : ""}${_t(". Khi AI hoạt động, bài sẽ được soạn riêng theo lĩnh vực của bạn ở cùng trình độ.</p></div>\n    <div class=\"ladder\">")}${LEVELS.map((l, k) => `<span class="${l === p.from ? "cur" : l === p.to ? "next" : k < lvIdx(p.from) ? "past" : ""}">${l}</span>`).join("")}</div></section>
   ${skillsPanel()}
    <div class="progress"><i style="width:${pct(n, p.total)}%"></i></div>${html}</div>`;
}
function vReview() {
  const all = cardList(), due = dueCards(), hard = hardCards();
  const tab = UI.rtab;
  const tabs = `<div class="tabs">${[["due", `${_t("Đến hạn (")}${due.length})`], ["hard", `${_t("Từ khó (")}${hard.length})`], ["all", `${_t("Tất cả (")}${all.length})`]].map(([k, t]) => `<button class="${tab === k ? "sel" : ""}" data-a="rtab" data-v="${k}">${t}</button>`).join("")}</div>`;
  if (!all.length) return `<div class="wrap narrow"><section class="panel center">${mascot("think", 120, "bob")}${_t("<h2>Chưa có flashcard</h2><p class=\"muted\">Từ vựng trong mỗi buổi học và từ bạn tra sẽ tự động được thêm vào đây.</p></section></div>")}`;
  const counts = {[_t("Mới")]:0, [_t("Đang học")]:0, [_t("Đang nhớ")]:0, [_t("Đã thuộc")]:0}; all.forEach(c => counts[cardState(c)]++);
  let body;
  if (tab === "all") {
    const q = UI.q.toLowerCase(), list = all.filter(c => !q || c.w.w.toLowerCase().includes(q) || (c.w.vi || "").toLowerCase().includes(q)).sort((a, b) => a.w.w.localeCompare(b.w.w));
    body = `${_t("<input id=\"rq\" data-live=\"rq\" placeholder=\"Tìm từ hoặc nghĩa...\" value=\"")}${esc(UI.q)}${_t("\">\n      <div class=\"table-wrap\"><table class=\"cards\"><thead><tr><th>Từ</th><th>Nghĩa</th><th>Trạng thái</th><th>Ôn lại</th><th></th></tr></thead><tbody>\n      ")}${list.map(c => `<tr><td><b>${esc(c.w.w)}</b><br><span class="ipa">${esc(c.w.ipa || "")}</span></td><td>${esc(c.w.vi)}</td><td><span class="tag">${cardState(c)}</span></td>
        <td class="small">${c.due <= Date.now() ? _t("Đến hạn") : new Date(c.due).toLocaleDateString("vi-VN")}</td><td><button class="mini" data-a="cdel" data-v="${esc(c.w.w.toLowerCase())}${_t("\" aria-label=\"Xóa ")}${esc(c.w.w)}${_t("\">Xóa</button></td></tr>")}`).join("")}
      </tbody></table></div>`;
  } else {
    const set = tab === "due" ? due : hard;
    body = set.length ? `<p>${set.length}${_t(" thẻ. Chọn cách ôn:</p><div class=\"modes\">\n      <button class=\"mode\" data-a=\"startFlip\" data-v=\"")}${tab}${_t("\"><b>Lật thẻ</b><span>Tự đánh giá Quên / Khó / Nhớ / Dễ</span></button>\n      <button class=\"mode\" data-a=\"startRQuiz\" data-v=\"")}${tab}${_t(":mcq\"><b>Trắc nghiệm</b><span>Chọn nghĩa đúng của từ</span></button>\n      <button class=\"mode\" data-a=\"startRQuiz\" data-v=\"")}${tab}${_t(":type\"><b>Gõ từ</b><span>Nhìn nghĩa, viết lại từ tiếng Anh</span></button>\n      <button class=\"mode\" data-a=\"startRQuiz\" data-v=\"")}${tab}${_t(":listen\"><b>Nghe & gõ</b><span>Nghe phát âm, gõ lại từ</span></button>\n      ")}${SR ? `<button class="mode" data-a="startRQuiz" data-v="${tab}${_t(":speak\"><b>Đọc to</b><span>Đọc từ và câu ví dụ, máy chấm phát âm</span></button>")}` : ""}</div>`
      : `<p class="muted">${tab === "due" ? _t("Bạn đã ôn hết thẻ đến hạn. Quay lại sau nhé.") : _t("Chưa có từ nào bị quên nhiều lần.")}</p>
         ${tab === "due" ? `${_t("<button data-a=\"startFlip\" data-v=\"all\">Ôn tự do 20 thẻ bất kỳ</button>")}` : ""}`;
  }
  return `<div class="wrap"><section class="hello">${stk("headphones", 72, "", -8)}${_t("<div><p class=\"eyebrow\">Ôn tập</p><h1>Flashcard của bạn</h1><p class=\"muted\">Lặp lại ngắt quãng: từ bạn nhớ tốt sẽ xuất hiện thưa dần (1, 3, 7, 16... ngày), từ hay quên sẽ quay lại sớm.</p></div></section>\n   <section class=\"panel\"><div class=\"stats\">")}${Object.entries(counts).map(([k, v]) => `<div class="stat"><b>${v}</b><span>${k}</span></div>`).join("")}</div></section>
   <section class="panel">${tabs}${body}</section></div>`;
}
function vFlip() {
  if (!FC || FC.i >= FC.keys.length) {
    const n = FC?.keys.length || 0; FC = null;
    return `${_t("<div class=\"wrap narrow\"><section class=\"panel center\"><h2>Xong phiên ôn tập</h2><p>Bạn đã ôn ")}${n}${_t(" thẻ.</p><button class=\"primary\" data-a=\"go\" data-v=\"review\">Về trang Ôn tập</button></section></div>")}`;
  }
  const c = S.cards[FC.keys[FC.i]]; if (!c) { FC.i++; return vFlip(); }
  const w = c.w;
  return `${_t("<div class=\"wrap narrow\"><div class=\"row between\"><button class=\"ghost\" data-a=\"go\" data-v=\"review\">← Thoát</button><span class=\"eyebrow\">Thẻ ")}${FC.i + 1}/${FC.keys.length}</span><span></span></div>
   <section class="flash ${FC.flip ? "back" : ""}${_t("\" data-a=\"flip\" tabindex=\"0\" role=\"button\" aria-label=\"Lật thẻ\">\n    ")}${FC.flip ? `<div class="word">${esc(w.w)}</div><div class="ipa">${esc(w.ipa || "")}${w.pos ? " · " + esc(w.pos) : ""}</div><p class="meaning">${esc(w.vi)}</p>
      ${w.ex ? `<p>${tw(w.ex)}</p>` : ""}${c.example && c.example !== w.ex ? `${_t("<p class=\"muted\">Câu của bạn: ")}${tw(c.example)}</p>` : ""}`
     : `<div class="word">${esc(w.w)}</div><div class="ipa">${esc(w.ipa || "")}${_t("</div><p class=\"muted\">Bấm để xem nghĩa (phím Space)</p>")}`}</section>
   ${FC.flip ? `<div class="rate">${[[1, _t("Quên"), _t("<1 phút")], [3, _t("Khó"), ""], [4, _t("Nhớ"), ""], [5, _t("Dễ"), ""]].map(([q, t]) => `<button data-a="rate" data-v="${q}"><b>${t}${_t("</b><span class=\"small muted\">phím ")}${q === 1 ? 1 : q === 3 ? 2 : q === 4 ? 3 : 4}</span></button>`).join("")}</div>`
     : `<div class="row center"><button data-a="speak" data-v="${esc(w.w)}${_t("\">🔊 Nghe</button><button class=\"primary\" data-a=\"flip\">Xem nghĩa</button></div>")}`}</div>`;
}
function vHistory() {
  const ss = S.sessions.slice().reverse(), ts = S.tests.slice().reverse();
  const chart = S.sessions.slice(-20);
  return `<div class="wrap"><section class="hello">${stk("trophy", 72, "", 8)}${_t("<div><p class=\"eyebrow\">Lịch sử</p><h1>Kết quả học tập</h1>\n    <p class=\"muted\">")}${S.sessions.length}${_t(" buổi học · ")}${S.tests.length}${_t(" bài kiểm tra · tổng ")}${S.sessions.reduce((a, s) => a + (s.dur || 0), 0)}${_t(" phút</p></div></section>\n   <section class=\"panel\"><div class=\"row between\"><h3>Bộ sưu tập nhãn dán</h3><span class=\"tag\">")}${Object.keys(S.badges || {}).length}/${BADGES.length}</span></div>
     <div class="badge-grid">${BADGES.map(b => badgeCard(b, !!S.badges?.[b.id], S.badges?.[b.id])).join("")}</div></section>
   ${chart.length > 1 ? `${_t("<section class=\"panel\"><h3>Điểm 20 buổi gần nhất</h3><div class=\"spark\">")}${chart.map(s => `<i style="height:${Math.max(4, s.total)}%" title="${esc(tp(s.topic))}: ${s.total}"></i>`).join("")}</div></section>` : ""}${_t("\n   <section class=\"panel\"><h3>Hành trình level</h3><ul class=\"timeline\">\n     ")}${S.placement ? `<li><b>${S.placement.level}${_t("</b> Test đầu vào · ")}${S.placement.date}</li>` : ""}
     ${S.courses.map(c => `<li><b>${c.to}${_t("</b> Hoàn thành khóa ")}${c.from} → ${c.to} · ${c.end}</li>`).join("")}
     ${S.path ? `<li class="cur"><b>${S.path.from} → ${S.path.to}${_t("</b> Khóa hiện tại, bắt đầu ")}${S.path.start}</li>` : ""}${_t("</ul></section>\n   <section class=\"panel\"><h3>Bài kiểm tra định kỳ</h3>")}${ts.length ? ts.map(t => `<div class="hrow"><div><b>Unit ${t.unit}</b> <span class="muted small">${t.date}</span>
      <div class="minibars">${Object.entries(t.skills || {}).map(([k, v]) => `<span>${SKILL_VI[k] || k} <b>${v}</b></span>`).join("")}</div></div><em class="score">${t.score}%</em></div>`).join("")
     : `${_t("<p class=\"muted\">Bài kiểm tra đầu tiên mở sau 5 buổi học.</p>")}`}${_t("</section>\n   <section class=\"panel\"><h3>Các buổi học</h3>")}${ss.length ? ss.map(s => `<div class="hrow click" data-a="hx" data-v="${s.idx}"><div><b>${esc(tp(s.topic))}</b><br><span class="muted small">${s.date} · ${s.dur || "?"}${_t(" phút")}${s.grammar ? " · " + esc(tp(s.grammar)) : ""}</span></div><em class="score">${s.total}</em></div>
      ${UI.hx === s.idx ? `<div class="hdetail"><p>${(s.words || []).map(w => `<span class="chip">${esc(w)}</span>`).join(" ")}</p>
        <div class="minibars">${Object.entries(s.scores || {}).map(([k, v]) => `<span>${{review:_t("Ôn bài"),vocab:_t("Từ vựng"),speaking:_t("Phát âm"),sentence:_t("Đặt câu"),translation:_t("Dịch"),listening:_t("Nghe chép"),roleplay:"Role-play"}[k] || k} <b>${v}</b></span>`).join("")}</div>
        ${(s.mistakes || []).map(m => `<div class="fb bad small"><s>${esc(m.text)}</s> → <b>${esc(m.fix)}</b></div>`).join("")}</div>` : ""}`).join("")
     : `${_t("<p class=\"muted\">Chưa có buổi học nào.</p>")}`}</section></div>`;
}
// Cài đặt kiểu ứng dụng: trang chính là danh sách gọn, bấm vào từng mục để mở trang con
const APP_VERSION = "1.0";
/* =====================================================================
   BẢNG XẾP HẠNG TUẦN + PHẦN THƯỞNG (điểm do máy chủ tính từ dữ liệu học)
   ===================================================================== */
var LB = {d:null, at:0, level:"", league:null, busy:false, err:"", cache:{}, pend:false, seq:0};
const lbEn = () => LANG === "en";
const lgName = k => { const g = (LB.d?.leagues || [])[k]; return g ? g.ic + " " + (lbEn() ? g.en : g.vi) : ""; };
const lbWho = r => lbEn() ? r.name_en : r.name;
const lbTitle = t => t ? (lbEn() ? t.en : t.vi) : "";
const MEDAL = {gold:"🥇", silver:"🥈", bronze:"🥉", star:"🌟", bee:"🐝", fire:"🔥"};
const BADGE_NAME = {gold:["Hạng nhất tuần","1st place"], silver:["Hạng nhì tuần","2nd place"], bronze:["Hạng ba tuần","3rd place"], star:["Top 10 tuần","Weekly top 10"], bee:["Chăm chỉ: 50 điểm/tuần","Busy Bee: 50 pts in a week"], fire:["Bền bỉ: 500 điểm/tuần","Unstoppable: 500 pts in a week"]};
function lbFrame() { try { return LB.d?.reward?.frame ?? localStorage.getItem("ep_frame") ?? ""; } catch (e) { return LB.d?.reward?.frame || ""; } }
// Tải bảng: hiện ngay bản đã lưu (nếu có), tải bản mới ở nền. Xem bảng khác (browse) thì máy chủ chỉ đọc bảng, rất nhanh.
async function lbLoad(force) {
  const browse = !!(LB.level || LB.league !== null), key = (LB.level || LB.d?.myLevel || "") + "|" + (LB.league ?? LB.d?.myLeague ?? "");
  if (!force && LB.d && Date.now() - LB.at < 60e3 && !browse) return;
  const c = LB.cache[key]; if (c) { LB.d = {...c, reward:LB.d?.reward || c.reward}; LB.pend = false; } else if (LB.d) LB.pend = true;
  if (view === "rank") render();
  if (c && Date.now() - c._at < 30e3) return;
  const my = ++LB.seq; LB.err = ""; LB.inflight = true;
  try {
    const q = new URLSearchParams(); if (LB.level) q.set("level", LB.level); if (LB.league !== null) q.set("league", LB.league); if (browse && LB.d) q.set("browse", "1");
    const r = await fetch("/api/leaderboard?" + q, {cache:"no-store"}); const j = await r.json();
    if (!r.ok) throw new Error(j.error || r.status);
    if (my !== LB.seq) return; // người dùng đã bấm sang bảng khác (yêu cầu mới hơn sẽ tự tắt cờ tải)
    j._at = Date.now(); LB.cache[j.level + "|" + j.league] = j; LB.d = j; LB.at = Date.now(); LB.pend = false;
    try { localStorage.setItem("ep_frame", j.reward?.frame || ""); } catch (e) {}
  } catch (e) { if (my === LB.seq) { LB.err = e.message; LB.pend = false; } }
  if (my === LB.seq) LB.inflight = false;
  if (["rank", "home", "settings"].includes(view)) render(); else renderHeader();
}
function lbLeft() {
  const ms = (LB.d?.endsAt || 0) - Date.now(); if (ms <= 0) return "";
  const d = Math.floor(ms / 864e5), h = Math.floor(ms % 864e5 / 36e5);
  return lbEn() ? (d ? `${d}d ${h}h left` : `${h}h left`) : (d ? `còn ${d} ngày ${h} giờ` : `còn ${h} giờ`);
}
function lbAv(r, size = 40) { return `<span class="lbav fr-${r.frame || "none"}" style="--h:${r.hue};width:${size}px;height:${size}px">${r.icon}</span>`; }
function lbRow(r) {
  return `<div class="lbrow ${r.me ? "me" : ""} ${r.rank <= 3 ? "top" + r.rank : ""}"><span class="lbrk">${r.rank <= 3 ? ["🥇","🥈","🥉"][r.rank - 1] : r.rank}</span>${lbAv(r)}
    <span class="grow"><b>${esc(lbWho(r))}</b>${r.me ? ` <span class="tag good">${_t("Bạn")}</span>` : ""}${r.title ? `<br><span class="small lbtitle">${esc(lbTitle(r.title))}</span>` : r.medals ? `<br><span class="small muted">${"🏅".repeat(Math.min(5, r.medals))}</span>` : ""}</span>
    <b class="lbpts">${r.points}</b></div>`;
}
// Thẻ nhỏ ở Trang chủ
function rankCard() {
  if (!S.profile) return "";
  if (!LB.d) { if (!LB.err && !LB.inflight) setTimeout(() => lbLoad(), 400); return ""; }
  const d = LB.d, me = d.me, r = d.reward; if (r.opt_out) return "";
  const lr = r.lastResult;
  return `<section class="panel rankcard" data-a="openRank" role="button" tabindex="0">
    <div class="row nowrap"><span class="rc-ic">${stk("trophy", 46, "", -8)}</span><div class="grow">
      <p class="eyebrow">${_t("Bảng xếp hạng tuần")} · ${esc(d.myLevel)} · ${lgName(d.myLeague)}</p>
      <b>${me.rank ? `${_t("Hạng")} #${me.rank} · ` : ""}${me.points} ${_t("điểm")}</b>
      <span class="muted small"> · ${lbLeft()}${me.gapTop10 ? ` · ${_t("còn")} ${me.gapTop10} ${_t("điểm để vào top 10")}` : ""}</span>
      ${lr ? `<br><span class="tag good">🎁 ${_t("Có kết quả tuần trước, bấm để xem!")}</span>` : ""}</div><span class="si-go">›</span></div></section>`;
}
function vRank() {
  if (!LB.d) { if (!LB.inflight && !LB.err) setTimeout(lbLoad, 0); return `<section class="panel center">${LB.err ? `<p class="bad-t">${esc(LB.err)}</p><button class="mini" data-a="lbReload">${_t("Thử lại")}</button>` : `<span class="spin"></span> ${_t("Đang tải bảng xếp hạng…")}`}</section>`; }
  const d = LB.d, r = d.reward, en = lbEn();
  const selLv = LB.level || d.myLevel, selLg = LB.league ?? (LB.level ? d.myLeague : d.league);
  const levels = ["A0","A1","A2","B1","B2","C1"].map(k => `<button class="mini seg ${selLv === k ? "sel" : ""}" data-a="lbLevel" data-v="${k}">${k}${k === d.myLevel ? " •" : ""}</button>`).join("");
  const leagues = d.leagues.map(g => `<button class="mini seg ${selLg === g.k ? "sel" : ""}" data-a="lbLeague" data-v="${g.k}" title="${esc(en ? g.en : g.vi)}">${g.ic}<span class="lg-n"> ${esc(en ? g.en : g.vi)}</span></button>`).join("");
  const mine = d.level === d.myLevel && d.league === d.myLeague;
  const lr = r.lastResult;
  const last = lr ? `<section class="panel celebrate lbres">${confetti()}<div class="row nowrap">${mascot(lr.rank <= 3 ? "cheer" : "happy", 90, "bob")}<div class="grow">
      <p class="eyebrow">${_t("Kết quả tuần trước")} · ${esc(lr.level)}</p>
      <h2>${lr.rank <= 3 ? ["🥇","🥈","🥉"][lr.rank - 1] + " " : ""}${_t("Hạng")} ${lr.rank}/${lr.of} · ${lr.points} ${_t("điểm")}</h2>
      <p>${lr.rank <= 10 ? _t("Phần thưởng: huy hiệu tuần, danh hiệu, khung ảnh mới và 1 đóng băng chuỗi 🧊") : _t("Tuần này cố lên nhé, vào top 10 là có quà!")}</p>
      ${lr.move === "up" ? `<p><b>⬆️ ${_t("Bạn được lên giải")} ${lgName(Math.min(4, lr.league + 1))}!</b></p>` : lr.move === "down" ? `<p>⬇️ ${_t("Bạn xuống giải")} ${lgName(Math.max(0, lr.league - 1))}. ${_t("Tuần này giành lại nhé!")}</p>` : ""}
      <button class="primary" data-a="lbSeen">${_t("Tuyệt, nhận thưởng!")}</button></div></div></section>` : "";
  const me = d.me;
  const meCard = r.opt_out ? `<section class="panel"><p>${_t("Bạn đang tắt tham gia xếp hạng nên không có tên trên bảng và không nhận thưởng theo hạng.")}</p><button class="mini" data-a="lbOpt" data-v="0">${_t("Tham gia lại")}</button></section>`
    : `<section class="panel lbme"><div class="row nowrap">${lbAv({...me, frame:r.frame}, 56)}<div class="grow"><b>${esc(lbWho(me))}</b>${r.title ? ` <span class="lbtitle">${esc(lbTitle(r.title))}</span>` : ""}
      <br><span class="muted small">${esc(d.myLevel)} · ${lgName(d.myLeague)} · ${lbLeft()}</span></div>
      <div class="lbbig"><b>${me.points}</b><span>${_t("điểm tuần")}</span></div></div>
      ${me.rank ? `<p class="small">${_t("Bạn đang hạng")} <b>#${me.rank}</b>/${mine ? d.total : "?"}${me.gapTop10 ? ` · ${_t("còn")} <b>${me.gapTop10}</b> ${_t("điểm để vào top 10")}` : me.rank <= 10 ? ` · ${_t("đang trong top 10, giữ vững nhé!")}` : ""}</p>` : `<p class="small muted">${_t("Học 1 bài để có tên trên bảng tuần này.")}</p>`}</section>`;
  const board = `<section class="panel">
    <div class="row between"><h3>${_t("Bảng")} ${esc(LB.pend ? selLv : d.level)} · ${lgName(LB.pend ? selLg : d.league)}</h3><span class="muted small">${d.total} ${_t("người")}</span></div>
    <div class="row lbtabs">${levels}</div><div class="row lbtabs">${leagues}</div>
    ${LB.pend ? `<div class="lblist lbskel">${"<div class=\"lbrow\"></div>".repeat(6)}</div>` : d.top.length ? `<div class="lblist">${d.top.map(lbRow).join("")}${d.near.length ? `<div class="lbgap">⋯</div>${d.near.map(lbRow).join("")}` : ""}</div>` : `<p class="muted center">${_t("Chưa có ai trong bảng này tuần này. Học 1 bài là bạn đứng đầu!")}</p>`}
    ${mine ? "" : `<p class="small"><a href="#" data-a="lbMine">← ${_t("Về bảng của bạn")}</a></p>`}</section>`;
  const nextM = d.milestones.find(m => !m.got), topM = d.milestones[d.milestones.length - 1].p;
  const miles = `<section class="panel"><h3>🎯 ${_t("Mốc điểm tuần này")}</h3><p class="muted small">${_t("Ai cũng nhận được, không cần lên top.")}</p>
    <div class="lbbar"><i style="width:${Math.min(100, me.points / topM * 100)}%"></i>${d.milestones.map(m => `<span class="${m.got ? "on" : ""}" style="left:${m.p / topM * 100}%" title="${m.p}"></span>`).join("")}</div>
    <div class="lbmiles">${d.milestones.map(m => `<div class="${m.got ? "on" : ""}"><b>${m.got ? stk("star", 24, "", 0) : m.p}</b><span>${esc(en ? m.en : m.vi)}</span></div>`).join("")}</div>
    ${nextM ? `<p class="small">${_t("Còn")} <b>${nextM.p - me.points}</b> ${_t("điểm nữa để nhận")} ${esc(en ? nextM.en : nextM.vi)}</p>` : `<p class="small good-t">🎉 ${_t("Bạn đã nhận hết quà mốc điểm tuần này!")}</p>`}</section>`;
  const frames = Object.entries(r.allFrames).map(([k, f]) => { const has = r.frames.includes(k);
    return `<button class="lbfr ${r.frame === k ? "sel" : ""} ${has ? "" : "locked"}" ${has ? `data-a="lbFrame" data-v="${k}"` : "disabled"} title="${esc(en ? f.how_en : f.how_vi)}">${lbAv({icon:me.icon, hue:me.hue, frame:k}, 44)}<b>${esc(en ? f.en : f.vi)}</b><span>${has ? (r.frame === k ? _t("Đang dùng") : _t("Dùng")) : "🔒 " + esc(en ? f.how_en : f.how_vi)}</span></button>`; }).join("");
  const counts = {}; r.badges.forEach(b => { counts[b.k] = (counts[b.k] || 0) + 1; });
  const rewards = `<section class="panel"><h3>🎁 ${_t("Phần thưởng của bạn")}</h3>
    <div class="lbstats"><div><b>🧊 ${r.freezes}/${r.maxFreeze}</b><span>${_t("Đóng băng chuỗi: tự dùng khi bạn lỡ 1 ngày")}</span></div>
      <div><b>${r.title ? esc(lbTitle(r.title)) : "–"}</b><span>${_t("Danh hiệu tuần này (hiện cạnh biệt danh khi trò chuyện)")}</span></div></div>
    <h4>${_t("Huy hiệu")}</h4>
    ${Object.keys(counts).length ? `<div class="lbbadges">${Object.entries(counts).map(([k, n]) => `<span class="lbbadge" title="${esc(BADGE_NAME[k]?.[en ? 1 : 0] || k)}">${MEDAL[k] || "🏅"}<b>×${n}</b><small>${esc(BADGE_NAME[k]?.[en ? 1 : 0] || k)}</small></span>`).join("")}</div>` : `<p class="muted small">${_t("Chưa có huy hiệu. Đạt 50 điểm trong tuần để nhận huy hiệu đầu tiên 🐝")}</p>`}
    <h4>${_t("Khung ảnh đại diện")}</h4><div class="lbframes">${r.frame ? `<button class="lbfr" data-a="lbFrame" data-v="">${lbAv({icon:me.icon, hue:me.hue}, 44)}<b>${_t("Không khung")}</b><span>${_t("Bỏ khung")}</span></button>` : ""}${frames}</div></section>`;
  const how = `<section class="panel"><details class="help"><summary>${_t("Cách tính điểm & luật giải đấu")}</summary>
    <ul class="small">${(en ? ["Lesson completed: 20 pts + score/10", "Periodic test: 40 pts + score/10", "Flashcard review: 2 pts per card (up to 60/day)", "Each day you study: +10 pts · max 300 pts/day", "Points reset every Monday 00:00. Rankings are per level and per league", "Top 20% of each board (min. 50 pts) move up a league; the bottom 20% of boards with 5+ people move down", "Top 10: weekly badge, title for next week, a new frame and 1 streak freeze 🧊", "You appear under a random nickname. You can show your name or leave the leaderboard below"]
      : ["Hoàn thành 1 buổi học: 20 điểm + điểm bài/10", "Bài kiểm tra định kỳ: 40 điểm + điểm bài/10", "Ôn flashcard: 2 điểm mỗi thẻ (tối đa 60/ngày)", "Mỗi ngày có học: +10 điểm · tối đa 300 điểm/ngày", "Điểm làm mới vào 0h thứ Hai. Xếp hạng riêng theo từng trình độ và từng giải đấu", "Top 20% mỗi bảng (tối thiểu 50 điểm) được lên giải; 20% cuối ở bảng từ 5 người trở lên xuống giải", "Top 10: huy hiệu tuần, danh hiệu cho tuần sau, khung ảnh mới và 1 đóng băng chuỗi 🧊", "Bạn hiện bằng biệt danh ngẫu nhiên. Có thể hiện tên thật hoặc tắt tham gia ở bên dưới"]).map(x => `<li>${x}</li>`).join("")}</ul></details></section>`;
  const opts = `<section class="panel"><h3>⚙️ ${_t("Tuỳ chọn xếp hạng")}</h3>
    <div class="setlist lbopts"><button class="setitem" data-a="lbNameT"><span class="si-ic">🪪</span><span class="si-t">${_t("Hiện tên thật")} (<b>${esc(displayName() || "?")}</b>) ${_t("thay cho biệt danh")}</span><span class="si-v">${r.show_name ? _t("Đang bật") : _t("Đang tắt")}</span><span class="tgl ${r.show_name ? "on" : ""}"></span></button>
    <button class="setitem" data-a="lbOpt" data-v="${r.opt_out ? 0 : 1}"><span class="si-ic">🏆</span><span class="si-t">${_t("Tham gia bảng xếp hạng")}</span><span class="si-v">${r.opt_out ? _t("Đang tắt") : _t("Đang bật")}</span><span class="tgl ${r.opt_out ? "" : "on"}"></span></button></div></section>`;
  return `${last}${meCard}${board}${r.opt_out ? "" : miles + rewards}${how}${opts}`;
}
// Tự dùng đóng băng chuỗi khi lỡ đúng 1 ngày (hôm qua) mà chuỗi trước đó còn
async function autoFreeze() {
  try {
    if (!S.profile || !S.sessions.length) return;
    const ds = d => { const x = new Date(); x.setDate(x.getDate() - d); return x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0")+"-"+String(x.getDate()).padStart(2,"0"); };
    const y = ds(1), y2 = ds(2), had = k => S.sessions.some(s => s.date === k) || (S.frozen || []).includes(k);
    if (had(y) || !had(y2)) return;
    if (localStorage.getItem("ep_frz") === y) return; localStorage.setItem("ep_frz", y);
    const r = await fetch("/api/leaderboard", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({action:"freeze", day:y})});
    if (!r.ok) return;
    S.frozen = [...(S.frozen || []), y].slice(-60); save(); LB.at = 0;
    toast(_t("🧊 Đã dùng 1 đóng băng chuỗi cho hôm qua. Chuỗi ngày học của bạn vẫn còn!")); render();
  } catch (e) {}
}
// Đổi tuỳ chọn: cập nhật giao diện ngay, gửi lên máy chủ ở nền; lỗi thì trả lại như cũ
async function lbSet(body) {
  const r = LB.d?.reward; if (!r) return; const old = {...r};
  if ("show_name" in body) { r.show_name = body.show_name; if (LB.d.me) { const nm = body.show_name && body.display_name ? body.display_name : null; LB.d.me._nm = LB.d.me._nm || {name:LB.d.me.name, name_en:LB.d.me.name_en}; LB.d.me.name = nm || LB.d.me._nm.name; LB.d.me.name_en = nm || LB.d.me._nm.name_en; } }
  if ("opt_out" in body) r.opt_out = body.opt_out;
  if ("frame" in body) r.frame = body.frame || null;
  LB.cache = {}; render();
  try { const x = await fetch("/api/leaderboard", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({action:"settings", ...body})}); const j = await x.json(); if (!x.ok) throw new Error(j.error); LB.at = 0; }
  catch (e) { Object.assign(r, old); render(); toast(e.message); }
}

/* =====================================================================
   CHÍNH SÁCH QUYỀN RIÊNG TƯ & XOÁ DỮ LIỆU (mở ngay trong Cài đặt)
   ===================================================================== */
function legalPage(k) {
  const en = LANG === "en", li = a => `<ul>${a.map(x => `<li>${x}</li>`).join("")}</ul>`, ol = a => `<ol>${a.map(x => `<li>${x}</li>`).join("")}</ol>`;
  const sec = (h, body) => `<h2>${h}</h2>${body}`;
  if (k === "privacy") return `<article class="lg-body panel"><p class="muted small">${en ? "Last updated" : "Cập nhật lần cuối"}: 13/11/2026</p>
   <p>${en ? "SEED is a personalised English-learning app. This page explains what data the app collects, what it is used for and what rights you have." : "SEED là ứng dụng học tiếng Anh cá nhân hóa. Trang này giải thích ứng dụng thu thập dữ liệu gì, dùng để làm gì và bạn có quyền gì."}</p>
   ${sec(en ? "Data we collect" : "Dữ liệu chúng tôi thu thập", li(en ? [
     "<b>Account information</b> when you sign in with Google, Facebook, Apple or a phone number: name, email (or phone number) and profile picture.",
     "<b>Learning data</b> you create: goals, level, lessons, answers, scores, flashcards, reminder schedule, weekly points and rewards, and your birthday if you enter it (used only for a birthday theme).",
     "<b>Device information for notifications</b>, only if you turn on study reminders.",
     "<b>Speech</b>: your browser turns speech into text on the device or through the browser's own service (Google/Microsoft). The app receives only the text and does not keep the recording.",
     "<b>Community & leaderboard</b>: messages and voice messages you send in chat, and your weekly points. You appear under a random nickname unless you choose to show your name.",
     "<b>Feedback</b> you send from Settings."] : [
     "<b>Thông tin tài khoản</b> khi bạn đăng nhập bằng Google, Facebook, Apple hoặc số điện thoại: tên, email (hoặc số điện thoại), ảnh đại diện.",
     "<b>Dữ liệu học tập</b> bạn tạo ra: mục tiêu, trình độ, bài học, câu trả lời, điểm số, flashcard, lịch nhắc học, điểm tuần và phần thưởng, và ngày sinh nếu bạn nhập (chỉ dùng cho giao diện sinh nhật).",
     "<b>Thông tin thiết bị để gửi thông báo</b>, chỉ khi bạn bật nhắc học.",
     "<b>Giọng nói</b>: trình duyệt chuyển giọng nói thành chữ ngay trên thiết bị hoặc qua dịch vụ của trình duyệt (Google/Microsoft). Ứng dụng chỉ nhận phần chữ, không lưu bản ghi âm.",
     "<b>Cộng đồng & bảng xếp hạng</b>: tin nhắn, tin nhắn thoại bạn gửi và điểm tuần của bạn. Bạn hiện bằng biệt danh ngẫu nhiên, trừ khi bạn chọn hiện tên thật.",
     "<b>Phản hồi</b> bạn gửi trong Cài đặt."]))}
   <p>${en ? "We do <b>not</b> post on your behalf, and we do not read your friends list, messages or other data from your social-media accounts." : "Chúng tôi <b>không</b> đăng bài, không đọc danh sách bạn bè, tin nhắn hay dữ liệu khác trên tài khoản mạng xã hội của bạn."}</p>
   ${sec(en ? "How we use it" : "Mục đích sử dụng", li(en ? ["To sign you in and sync your progress across your devices.", "To write lessons and mark your work around your goals. Your answers are sent to AI services for this.", "To send study reminders on your schedule.", "To run the weekly leaderboard and give rewards.", "To keep chat safe: messages are checked automatically for personal information and abusive language; reported messages may be reviewed by an administrator."]
     : ["Đăng nhập và đồng bộ tiến độ trên các thiết bị của bạn.", "Soạn bài và chấm bài theo mục tiêu của bạn. Bài làm được gửi tới dịch vụ AI để xử lý.", "Gửi nhắc học theo lịch bạn chọn.", "Tính bảng xếp hạng tuần và trao phần thưởng.", "Giữ an toàn cho phần trò chuyện: tin nhắn được tự động lọc thông tin cá nhân và từ ngữ xúc phạm; tin bị báo cáo có thể được quản trị viên xem xét."]))}
   <p>${en ? "We do not sell or rent your data, and we do not use it for advertising." : "Chúng tôi không bán, không cho thuê và không dùng dữ liệu của bạn cho quảng cáo."}</p>
   ${sec(en ? "Where data is stored and third parties" : "Nơi lưu trữ và bên thứ ba", li(en ? ["<b>Supabase</b>: accounts, learning data, chat and voice messages.", "<b>Vercel</b>: runs the app.", "<b>Google, Groq, OpenRouter</b>: AI services that process lessons and answers.", "<b>Google, Facebook, Apple</b>: sign-in, depending on your choice."]
     : ["<b>Supabase</b>: lưu tài khoản, dữ liệu học, tin nhắn và tin nhắn thoại.", "<b>Vercel</b>: chạy ứng dụng.", "<b>Google, Groq, OpenRouter</b>: dịch vụ AI xử lý bài học và bài làm.", "<b>Google, Facebook, Apple</b>: xác thực đăng nhập theo lựa chọn của bạn."]))}
   ${sec(en ? "Your rights" : "Quyền của bạn", `<p>${en ? "You can edit your learning details in Settings, delete all your progress at any time, leave the leaderboard, and ask for your account to be deleted completely." : "Bạn có thể sửa thông tin học trong Cài đặt, xoá toàn bộ tiến độ bất kỳ lúc nào, tắt tham gia bảng xếp hạng, và yêu cầu xoá hẳn tài khoản."}</p>
     <button class="mini" data-a="setPage" data-v="deletion">🗑️ ${en ? "How to delete your data" : "Cách xoá dữ liệu"}</button>`)}
   ${sec(en ? "Contact" : "Liên hệ", `<p>${en ? "For any privacy question, send us a message from" : "Mọi câu hỏi về quyền riêng tư, hãy nhắn cho chúng tôi trong"} <a href="#" data-a="setPage" data-v="feedback">${en ? "Send feedback" : "Gửi phản hồi"}</a>.</p>`)}</article>`;
  return `<article class="lg-body panel"><p>${en ? "You are fully in control of deleting your data from SEED." : "Bạn có toàn quyền xoá dữ liệu của mình khỏi SEED."}</p>
   ${sec(en ? "Delete your progress yourself" : "Tự xoá tiến độ học trong ứng dụng", ol(en ? ["Go to <b>Settings → Data</b>.", "Tap <b>Delete progress and start over</b>, then tap again to confirm."] : ["Vào <b>Cài đặt → Dữ liệu</b>.", "Bấm <b>Xóa tiến độ và làm lại</b> rồi bấm lần nữa để xác nhận."]) + `<p>${en ? "This immediately deletes all your lessons, scores, flashcards and reminders." : "Thao tác này xoá ngay toàn bộ bài học, điểm số, flashcard và lịch nhắc của bạn."}</p><button class="mini" data-a="setPage" data-v="data">🗂️ ${en ? "Open Data" : "Mở mục Dữ liệu"}</button>`)}
   ${sec(en ? "Ask us to delete your account completely" : "Yêu cầu xoá hẳn tài khoản", `<p>${en ? "Send a request from <b>Send feedback</b> with the words <b>“Delete my account”</b>. We will delete your account and all related data, including chat messages and leaderboard history, within 30 days." : "Gửi yêu cầu trong mục <b>Gửi phản hồi</b> với nội dung <b>“Xoá tài khoản”</b>. Chúng tôi sẽ xoá tài khoản và mọi dữ liệu liên quan, kể cả tin nhắn và lịch sử xếp hạng, trong vòng 30 ngày."}</p><button class="mini" data-a="setPage" data-v="feedback">💬 ${en ? "Send a request" : "Gửi yêu cầu"}</button>`)}
   ${sec(en ? "Removing access from Facebook" : "Gỡ quyền truy cập từ Facebook", `<p>${en ? "On Facebook, go to <b>Settings & privacy → Settings → Apps and websites</b>, choose <b>SEED</b> and tap <b>Remove</b>." : "Trên Facebook, vào <b>Cài đặt và quyền riêng tư → Cài đặt → Ứng dụng và trang web</b>, chọn <b>SEED</b> rồi bấm <b>Gỡ</b>."}</p>`)}</article>`;
}


/* =====================================================================
   MỤC KIỂM TRA: Kiểm tra nhanh · Luyện theo kỹ năng · Thi lên trình độ · Lịch sử
   Câu hỏi do AI soạn mới mỗi lần (không lặp câu đã làm), hết AI thì lấy từ kho có sẵn.
   ===================================================================== */
const XT_PLANS = {
  quick:   [["grammar", 5], ["listening", 2], ["reading", 1], ["speaking", 1]],
  levelup: [["grammar", 6], ["listening", 3], ["reading", 2], ["speaking", 1]],
  skill:   {grammar:[["grammar", 8]], listening:[["listening", 5]], reading:[["reading", 3]], speaking:[["speaking", 4]]},
};
const XT_NAMES = {quick:["Kiểm tra nhanh", "Quick check", "star"], skill:["Luyện theo kỹ năng", "Skill practice", "target"], levelup:["Thi lên trình độ", "Level-up test", "trophy"]};
const LEVELUP_PASS = 80, LEVELUP_WAIT = 3; // đạt 80% · trượt thì chờ 3 ngày
var XT = {busy:false, err:"", skill:"listening", lv:null, open:null, explain:{}};
const xtKey = s => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().slice(0, 80);
const xtSeen = () => new Set(S.seenQ || []);
function xtRemember(items) { S.seenQ = [...(S.seenQ || []), ...items.map(it => xtKey(it.q + " " + (it.speak || it.passage || "")))].slice(-400); }
const xtBankLv = idx => Math.max(0, Math.min(4, idx - 1)); // chỉ số LEVELS (0=A0…5=C1) → mức kho câu (0=A1…4=C1)
function xtDaysLeft() { const f = S.levelUpFail; if (!f) return 0; const d = Math.ceil(LEVELUP_WAIT - (Date.now() - Date.parse(f + "T00:00:00")) / 864e5); return Math.max(0, d); }

// Lấy câu từ kho (ưu tiên câu chưa làm)
function xtFromBank(part, lv, n, seen) {
  const src = part === "grammar" ? PLACEMENT.map(x => ({lv:x[0], q:x[1], opts:x[2], ans:x[3]}))
    : part === "listening" ? PL_LISTEN.map(x => ({lv:x[0], speak:x[1], q:x[2] === "same" ? _t("Nghe và chọn đúng câu bạn vừa nghe") : x[3], opts:x[4], ans:x[5]}))
    : part === "reading" ? PL_READ.map(x => ({lv:x[0], passage:x[1], q:x[2], opts:x[3], ans:x[4]}))
    : PL_SPEAK.map(x => ({lv:x[0], q:x[1], ans:x[1]}));
  const key = it => xtKey(it.q + " " + (it.speak || it.passage || ""));
  const near = d => src.filter(it => Math.abs(it.lv - lv) === d);
  let pool = [];
  for (let d = 0; d < 5 && pool.length < n; d++) pool = pool.concat(shuffle(near(d).filter(it => !seen.has(key(it)))));
  for (let d = 0; d < 5 && pool.length < n; d++) pool = pool.concat(shuffle(near(d))); // hết câu mới thì dùng lại
  return pool.slice(0, n);
}
// Nhờ AI soạn đề mới (1 lần gọi cho cả bài). Lỗi/chậm thì trả rỗng để dùng kho.
async function xtFromAI(plan, level, seen) {
  if (!AI.on) return {};
  const need = Object.fromEntries(plan.filter(([p]) => p !== "speaking").map(([p, n]) => [p, n]));
  const sp = plan.find(([p]) => p === "speaking");
  const ask = `Write a NEW English test at CEFR level ${level === "A0" ? "A1 (very easy, beginner)" : level} for a Vietnamese learner. Return JSON only:
{${need.grammar ? `"grammar":[${need.grammar} items {"q":"sentence with ___ gap or short question","opts":["4 options"],"ans":index 0-3,"explain":"why, 1 short sentence in ${LANG === "en" ? "English" : "Vietnamese"}"}],` : ""}
${need.listening ? `"listening":[${need.listening} items {"say":"1-2 natural spoken sentences (audio only, not shown)","q":"question about what was said","opts":["4 options"],"ans":0-3,"explain":"short, ${LANG === "en" ? "English" : "Vietnamese"}"}],` : ""}
${need.reading ? `"reading":[${need.reading} items {"passage":"40-90 word text (notice, message, short article)","q":"comprehension question","opts":["4 options"],"ans":0-3,"explain":"short, ${LANG === "en" ? "English" : "Vietnamese"}"}],` : ""}
${sp ? `"speaking":[${sp[1]} items "one natural sentence to read aloud"]` : ""}}
Rules: exactly one correct option, 4 different options of similar length, vary topics (daily life, work, travel), vary the position of the correct answer, no trick questions. Grammar must test different points.`;
  try {
    const j = await gemini(_t("Bạn là chuyên gia ra đề tiếng Anh theo CEFR. Chỉ trả JSON."), ask, true, undefined, 25000);
    const ok = it => it && typeof it.q === "string" && Array.isArray(it.opts) && it.opts.length === 4 && new Set(it.opts.map(String)).size === 4 && Number.isInteger(it.ans) && it.ans >= 0 && it.ans < 4;
    const out = {};
    for (const p of ["grammar", "listening", "reading"]) out[p] = (j[p] || []).filter(ok).filter(it => p !== "listening" || it.say).filter(it => p !== "reading" || it.passage)
      .map(it => ({q:it.q, opts:it.opts.map(String), ans:it.ans, explain:it.explain || "", speak:it.say, passage:it.passage, ai:true}))
      .filter(it => !seen.has(xtKey(it.q + " " + (it.speak || it.passage || ""))));
    out.speaking = (j.speaking || []).filter(x => typeof x === "string" && x.split(" ").length >= 4 && x.length < 160).map(x => ({q:x, ans:x, ai:true}));
    return out;
  } catch (e) { return {}; }
}
async function startXTest(kind, skill) {
  if (XT.busy) return;
  const cur = lvIdx(S.level || "A1");
  if (kind === "levelup") { if (cur >= 5) return toast(_t("Bạn đã ở trình độ cao nhất (C1).")); if (xtDaysLeft()) return toast(`${_t("Bạn có thể thi lại sau")} ${xtDaysLeft()} ${_t("ngày nữa.")}`); }
  const lvl = kind === "levelup" ? LEVELS[cur + 1] : kind === "skill" && XT.lv ? XT.lv : LEVELS[Math.max(cur, 0)];
  let plan = kind === "skill" ? XT_PLANS.skill[skill] : XT_PLANS[kind];
  if (!SR) plan = plan.filter(([p]) => p !== "speaking");
  if (!plan.length) return toast(_t("Trình duyệt này chưa hỗ trợ micro. Hãy mở bằng Chrome hoặc Safari."));
  XT.busy = true; XT.err = ""; view = "tests"; render();
  const seen = xtSeen(), ai = await xtFromAI(plan, lvl, seen), blv = xtBankLv(lvIdx(lvl));
  const items = [], parts = [];
  for (const [p, n] of plan) {
    const P = PL_PARTS.find(x => x.k === p), got = (ai[p] || []).slice(0, n);
    const all = got.concat(xtFromBank(p, blv, n - got.length, seen)).map(it => p === "speaking" ? {type:"speak", part:p, q:it.q, ans:it.ans, skill:"speaking", place:true, ai:it.ai}
      : {type:"mcq", part:p, q:it.q, opts:it.opts, ans:it.ans, explain:it.explain || "", speak:it.speak || null, autoplay:p === "listening", passage:it.passage || null, skill:p, ai:it.ai});
    if (plan.length > 1) items.push({type:"inter", part:p, title:LANG === "en" ? P.en : P.vi, ic:P.ic, xn:all.length});
    items.push(...all); parts.push({k:p, n:all.length, ic:P.ic, vi:P.vi, en:P.en});
  }
  XT.busy = false;
  Q = makeQuiz("xtest", items, false); Q.x = {kind, skill, level:lvl, parts, ai:items.some(it => it.ai)}; Q.skipped = {};
  if (plan.length === 1) Q.parts = parts;
  view = "quiz"; render(); scrollTo(0, 0);
}
function xFinish(q) {
  const R = plRes(q), rows = q.items.map((it, k) => [it, R(k), k]).filter(([it]) => it.type !== "inter");
  const real = rows.filter(([, r]) => !r?.skip), ok = real.filter(([, r]) => r?.ok).length, score = pct(ok, real.length);
  const by = {}; for (const [it, r] of real) { const b = by[it.part] = by[it.part] || {ok:0, n:0}; b.n++; if (r?.ok) b.ok++; }
  const x = q.x, passed = x.kind === "levelup" ? score >= LEVELUP_PASS : null;
  const rec = {id:Date.now().toString(36), kind:x.kind, skill:x.skill || null, level:x.level, date:today(), score, ok, total:real.length, by, passed,
    review:rows.map(([it, r]) => ({p:it.part, t:it.type, q:it.q, o:it.opts || null, a:it.ans, pick:r?.pick ?? null, ok:!!r?.ok, skip:!!r?.skip, ex:it.explain || "", say:it.speak || null, pa:it.passage || null}))};
  S.xtests = [...(S.xtests || []), rec].slice(-30);
  xtRemember(rows.map(([it]) => it));
  // bảng xếp hạng: máy chủ chỉ cộng điểm bài kiểm tra đầu tiên mỗi ngày (xem lib/leaderboard.ts)
  if (x.kind === "levelup") { if (passed) { S.levelUpFail = null; } else S.levelUpFail = today(); }
  Q = null; XT.open = null; XT.result = rec.id; view = "tests"; save(); render(); scrollTo(0, 0);
  if (x.kind === "levelup" && passed) setTimeout(() => changeLevel(x.level), 50);
}
// Thẻ ở Trang chủ
function testCard() {
  if (!S.path) return "";
  const last = (S.xtests || []).slice(-1)[0];
  return `<section class="panel testcard" data-a="go" data-v="tests" role="button" tabindex="0"><div class="row nowrap">${stk("cap", 46, "", -6)}<div class="grow">
    <p class="eyebrow">${_t("Kiểm tra trình độ")}</p><b>${_t("Kiểm tra nhanh, luyện theo kỹ năng, thi lên trình độ")}</b>
    ${last ? `<br><span class="muted small">${_t("Lần gần nhất:")} ${last.score}% · ${esc(xtName(last))} · ${last.date}</span>` : ""}</div><span class="si-go">›</span></div></section>`;
}
const xtName = r => { const n = XT_NAMES[r.kind]; let s = n ? (LANG === "en" ? n[1] : n[0]) : ""; if (r.kind === "skill" && r.skill) s += " · " + (LANG === "en" ? SKILL_NAMES[r.skill][1] : SKILL_NAMES[r.skill][0]); if (r.kind === "placement") s = _t("Bài test đầu vào"); return s; };
// Danh sách xem lại đáp án
function reviewList(rv, key) {
  const en = LANG === "en";
  return `<ol class="rvlist">${rv.map((r, i) => { const k = key + ":" + i, ex = r.ex || XT.explain[k];
    const pick = r.t === "speak" ? (r.pick ? `“${esc(r.pick)}”` : "") : r.o && Number.isInteger(r.pick) && r.pick >= 0 ? esc(r.o[r.pick]) : "";
    return `<li class="${r.skip ? "skip" : r.ok ? "ok" : "bad"}"><div class="rvhead"><span class="rvmark">${r.skip ? "–" : r.ok ? "✓" : "✗"}</span><span class="tag">${esc(en ? SKILL_NAMES[r.p]?.[1] || "" : SKILL_NAMES[r.p]?.[0] || "")}</span></div>
      ${r.pa ? `<div class="passage sm">${esc(r.pa)}</div>` : ""}${r.say ? `<p class="small"><button class="round sm" data-a="speak" data-v="${esc(r.say)}" aria-label="${en ? "Listen" : "Nghe"}">🔊</button> <i>${esc(r.say)}</i></p>` : ""}
      <p class="rvq"><b>${esc(r.q)}</b></p>
      ${r.t === "speak" ? `<p class="small">${r.skip ? _t("Bạn đã bỏ qua phần nói.") : `${_t("App nghe được:")} ${pick || "–"}`}</p>`
        : `<p class="small">${r.ok ? `${_t("Bạn chọn:")} <b class="good-t">${pick}</b>` : `${pick ? `${_t("Bạn chọn:")} <span class="bad-t"><b>${pick}</b></span> · ` : `${_t("Bạn chọn:")} <i>${_t("Tôi không biết")}</i> · `}${_t("Đáp án đúng:")} <b class="good-t">${esc(r.o?.[r.a] ?? "")}</b>`}</p>`}
      ${r.t !== "speak" ? (ex ? `<p class="small rvex">💡 ${esc(ex)}</p>` : `<button class="mini ghost" data-a="rvExplain" data-v="${esc(k)}">💡 ${_t("Giải thích")}</button>`) : ""}</li>`; }).join("")}</ol>`;
}
function vTests() {
  const en = LANG === "en";
  if (XT.busy) return `<div class="wrap narrow"><section class="panel center">${mascot("think", 120, "bob")}<h2>${_t("Đang soạn đề mới cho bạn…")}</h2><p class="muted">${_t("Mỗi lần làm là một đề khác, không lặp câu cũ.")}</p><span class="spin"></span></section></div>`;
  const hist = (S.xtests || []).slice().reverse(), cur = S.level || "A1", nx = LEVELS[Math.min(5, lvIdx(cur) + 1)], wait = xtDaysLeft();
  const res = XT.result && hist.find(r => r.id === XT.result);
  const result = res ? `<section class="panel hero with-art">${res.score >= 80 ? confetti(24) : ""}<div class="hero-art">${mascot(res.score >= 80 ? "cheer" : res.score >= 50 ? "happy" : "think", 100, "bob")}</div>
      <span class="eyebrow">${esc(xtName(res))} · ${res.level}</span><h1>${res.score}%</h1><p>${_t("Đúng")} ${res.ok}/${res.total} ${_t("câu")}.</p>
      ${res.kind === "levelup" ? (res.passed ? `<p><b>🎉 ${_t("Chúc mừng! Bạn đã lên trình độ")} ${res.level}.</b> ${_t("Các bài tiếp theo sẽ theo trình độ mới.")}</p>` : `<p>${_t("Cần đạt")} ${LEVELUP_PASS}% ${_t("để lên trình độ. Ôn thêm phần còn yếu rồi thi lại sau")} ${LEVELUP_WAIT} ${_t("ngày nhé!")}</p>`) : ""}
      <div class="xtby">${Object.entries(res.by).map(([k, b]) => `<span><b>${en ? SKILL_NAMES[k][1] : SKILL_NAMES[k][0]}</b> ${b.ok}/${b.n}</span>`).join("")}</div>
      <div class="row"><button class="primary" data-a="xtOpen" data-v="${res.id}">📋 ${XT.open === res.id ? _t("Ẩn đáp án") : _t("Xem lại đáp án")}</button><button class="ghost" data-a="xtDone">${_t("Xong")}</button></div></section>
      ${XT.open === res.id ? `<section class="panel"><h3>${_t("Xem lại đáp án")}</h3>${reviewList(res.review, res.id)}</section>` : ""}` : "";
  const lvBtns = LEVELS.map(l => `<button class="mini seg ${(XT.lv || cur) === l ? "sel" : ""}" data-a="xtLv" data-v="${l}">${l}</button>`).join("");
  const skBtns = ["grammar", "listening", "reading", "speaking"].map(k => `<button class="seg xtsk ${XT.skill === k ? "sel" : ""}" data-a="xtSkill" data-v="${k}">${stk(SKILL_NAMES[k][2], 28, "", 0)}<span>${en ? SKILL_NAMES[k][1] : SKILL_NAMES[k][0]}</span></button>`).join("");
  const chart = hist.length ? `<div class="xtchart">${hist.slice(0, 12).reverse().map(r => `<div title="${esc(xtName(r))} · ${r.date}"><i style="height:${Math.max(6, r.score)}%" class="${r.score >= 80 ? "hi" : r.score >= 50 ? "mid" : "lo"}"></i><span>${r.score}</span></div>`).join("")}</div>` : "";
  const list = hist;
  return `<div class="wrap narrow">${result}
    <section class="hello">${stk("cap", 64, "", -6)}<div><p class="eyebrow">${_t("Kiểm tra")}</p><h1>${_t("Kiểm tra trình độ")}</h1><p class="muted">${_t("Trình độ hiện tại:")} <b>${cur}</b> · ${_t("mỗi lần làm là một đề mới")}</p></div></section>
    <div class="xtgrid">
      <section class="panel xtcard"><div class="row nowrap">${stk("star", 44, "", 0)}<div class="grow"><h3>${_t("Kiểm tra nhanh")}</h3><p class="muted small">${_t("5 phút · 4 kỹ năng · theo trình độ")} ${cur}. ${_t("Chỉ xem điểm, không đổi trình độ.")}</p></div></div><button class="primary" data-a="xtStart" data-v="quick">${_t("Bắt đầu")}</button></section>
      <section class="panel xtcard"><div class="row nowrap">${stk("target", 44, "", 0)}<div class="grow"><h3>${_t("Luyện theo kỹ năng")}</h3><p class="muted small">${_t("Chọn 1 kỹ năng và trình độ bạn muốn thử.")}</p></div></div>
        <div class="xtskills">${skBtns}</div><div class="row lbtabs">${lvBtns}</div><button class="primary" data-a="xtStart" data-v="skill">${_t("Bắt đầu")}</button></section>
      <section class="panel xtcard gold"><div class="row nowrap">${stk("trophy", 44, "", -6)}<div class="grow"><h3>${_t("Thi lên trình độ")} ${cur === "C1" ? "" : `${cur} → ${nx}`}</h3><p class="muted small">${_t("Khoảng 10 phút ở trình độ")} ${nx}. ${_t("Đạt")} ${LEVELUP_PASS}% ${_t("là được lên trình độ, trượt thì thi lại sau")} ${LEVELUP_WAIT} ${_t("ngày.")}</p></div></div>
        ${cur === "C1" ? `<p class="small">${_t("Bạn đã ở trình độ cao nhất (C1).")}</p>` : wait ? `<button class="primary" disabled>${_t("Thi lại sau")} ${wait} ${_t("ngày")}</button>` : `<button class="primary" data-a="xtStart" data-v="levelup">${_t("Bắt đầu thi")}</button>`}</section>
    </div>
    <section class="panel"><h3>📈 ${_t("Lịch sử điểm")}</h3>${chart || `<p class="muted">${_t("Chưa có bài kiểm tra nào. Làm thử bài Kiểm tra nhanh nhé!")}</p>`}
      ${list.length ? `<div class="xtlist">${list.map(r => `<div class="xtrow"><div class="grow"><b>${esc(xtName(r))}</b> <span class="tag">${r.level}</span><br><span class="muted small">${r.date}${r.kind === "levelup" ? (r.passed ? " · ✅ " + _t("Đạt") : " · " + _t("Chưa đạt")) : ""}</span></div><b class="xtsc">${r.score}%</b><button class="mini ghost" data-a="xtOpen" data-v="${r.id}">${XT.open === r.id ? _t("Ẩn") : _t("Xem lại")}</button></div>${XT.open === r.id && r.id !== XT.result ? reviewList(r.review, r.id) : ""}`).join("")}</div>` : ""}
      <p class="muted small">${_t("Mỗi ngày, bài kiểm tra đầu tiên được cộng điểm vào bảng xếp hạng tuần.")}</p></section></div>`;
}
async function rvExplain(k) {
  const [id, i] = k.split(":"), rec = (S.xtests || []).find(r => r.id === id), r = rec?.review?.[+i]; if (!r) return;
  XT.explain[k] = "…"; render();
  try {
    const j = await gemini(TEACHER(), `${LANG === "en" ? "Explain briefly in English" : "Giải thích ngắn gọn bằng tiếng Việt (1-2 câu)"} why "${r.o?.[r.a]}" is the correct answer${Number.isInteger(r.pick) && r.pick >= 0 && r.pick !== r.a ? ` and why "${r.o?.[r.pick]}" is wrong` : ""}.\n${r.pa ? "Text: " + r.pa + "\n" : ""}${r.say ? "Audio: " + r.say + "\n" : ""}Question: ${r.q}\nOptions: ${(r.o || []).join(" | ")}\nReturn JSON {"explain":"..."}`, true, undefined, 20000);
    r.ex = j.explain || ""; XT.explain[k] = r.ex; save();
  } catch (e) { XT.explain[k] = LANG === "en" ? `Correct answer: ${r.o?.[r.a]}` : `Đáp án đúng: ${r.o?.[r.a]}`; }
  render();
}

const SET_PAGES = {
  goal:["🎯", _t("Mục tiêu học")], remind:["🔔", _t("Nhắc học & thông báo")], look:["🎨", _t("Giao diện & ngày sinh")], voice:["🔊", _t("Giọng đọc & micro")],
  lang:["🌐", LANG === "en" ? "Language / Ngôn ngữ" : "Ngôn ngữ / Language"],
  help:["📖", _t("Hướng dẫn sử dụng")], feedback:["💬", _t("Gửi phản hồi")], about:["🌱", _t("Về SEED & người sáng lập")], data:["🗂️", _t("Dữ liệu")],
  privacy:["🔒", _t("Chính sách quyền riêng tư")], deletion:["🗑️", _t("Yêu cầu xoá tài khoản & dữ liệu")],
};
function setRow(k, value = "") { const [ic, t] = SET_PAGES[k]; return `<button class="setitem" data-a="setPage" data-v="${k}"><span class="si-ic">${ic}</span><span class="si-t">${t}</span><span class="si-v">${value}</span><span class="si-go">›</span></button>`; }
function vSettings() {
  const pg = UI.sp;
  if (pg && SET_PAGES[pg]) return `${_t("<div class=\"wrap narrow\"><div class=\"sethead\"><button class=\"mini ghost\" data-a=\"setPage\" data-v=\"\">‹ Cài đặt</button><h2>")}${SET_PAGES[pg][0]} ${SET_PAGES[pg][1]}</h2></div>${setPage(pg)}</div>`;
  const rc = remindCfg();
  return `<div class="wrap narrow">
   <section class="panel account"><div class="row nowrap">
     <div class="bigavatar">${ME?.avatar ? `<img src="${esc(ME.avatar)}" alt="" referrerpolicy="no-referrer">` : esc((displayName() || ME?.email || "?")[0].toUpperCase())}</div>
     <div class="who grow"><b>${esc(displayName() || _t("Chưa đặt tên"))}</b><span>${esc(ME?.email || "")}</span></div><span class="tag">${esc(S.level || "")}</span></div></section>
   <div class="setlist">${setRow("goal", esc(focusName()))}${setRow("remind", rc.on ? (PUSH.on ? rc.start : _t("Chưa bật trên máy này")) : _t("Đang tắt"))}${setRow("look", esc(FEST[festiveTheme()]?.name || _t("Mặc định")))}${setRow("voice")}</div>
   <div class="setlist">${setRow("lang", LANG_PICK === "auto" ? (LANG === "en" ? "Device" : "Theo máy") : LANG === "en" ? "English" : "Tiếng Việt")}<button class="setitem" data-a="go" data-v="history"><span class="si-ic">📜</span><span class="si-t">${_t("Lịch sử học")}</span><span class="si-v">${S.sessions.length} ${_t("buổi")}</span><span class="si-go">›</span></button><button class="setitem" data-a="openRank"><span class="si-ic">🏆</span><span class="si-t">${_t("Xếp hạng & phần thưởng")}</span><span class="si-v">${LB.d && !LB.d.reward.opt_out ? `${LB.d.me.points} ${_t("điểm")}` : ""}</span><span class="si-go">›</span></button>${setRow("help")}${setRow("feedback")}${setRow("about")}</div>
   <div class="setlist">${setRow("data")}${setRow("privacy")}${setRow("deletion")}${_t("<button class=\"setitem\" data-a=\"logout\"><span class=\"si-ic\">🚪</span><span class=\"si-t danger-t\">Đăng xuất</span><span class=\"si-v\"></span><span class=\"si-go\"></span></button></div>\n   <p class=\"muted small center\">SEED · phiên bản ")}${APP_VERSION}${_t("</p></div>")}`;
}
function setPage(pg) {
  if (pg === "privacy" || pg === "deletion") return legalPage(pg);
  const fs = pref("ep_fs") || "m", th = pref("ep_theme") || "auto", rc = remindCfg();
  const seg = (list, cur, act) => `<div class="row">${list.map(([k, t]) => `<button class="seg ${String(cur) === String(k) ? "sel" : ""}" data-a="${act}" data-v="${k}">${t}</button>`).join("")}</div>`;
  if (pg === "goal") return `<section class="panel"><p><b>${esc(focusName())}</b>${S.profile.job ? ` · ${esc(S.profile.job)}` : ""}</p>${subList().length ? `<p class="small">${subList().map(esc).join(" · ")}</p>` : ""}
    <p class="muted small">${S.profile.minutes}${_t(" phút/ngày · Trình độ ")}${S.level}${_t(" · Khóa ")}${S.path?.from} → ${S.path?.to}${_t("</p><button class=\"primary\" data-a=\"editGoal\">Sửa mục tiêu</button></section>")}`;
  if (pg === "remind") return `${_t("<section class=\"panel\">\n    <div class=\"row between\"><b>Nhắc khi hôm đó chưa học</b><button class=\"mini seg ")}${rc.on ? "sel" : ""}" data-a="remToggle">${rc.on ? _t("Bật") : _t("Tắt")}</button></div>
    ${rc.on ? `${_t("<div class=\"row timerow\"><div class=\"tfield\"><label for=\"remindSet\">Từ</label><input id=\"remindSet\" type=\"time\" value=\"")}${rc.start}${_t("\" data-change=\"setRemind\"></div>\n     <div class=\"tfield\"><label for=\"remindEnd\">Đến</label><input id=\"remindEnd\" type=\"time\" value=\"")}${rc.end}${_t("\" data-change=\"setRemindEnd\"></div></div>\n    <div class=\"setrow\"><span>Nhắc mỗi</span>")}${seg([[30, _t("30 phút")], [60, _t("1 giờ")], [120, _t("2 giờ")], [180, _t("3 giờ")]], rc.every, "remEvery")}${_t("</div>\n    <div class=\"setrow\"><span>Giọng nhắc</span>")}${seg([["spicy", _t("😈 Lầy lội")], ["soft", _t("🙂 Nhẹ nhàng")]], S.profile.remindTone || "spicy", "remTone")}</div>` : ""}${_t("</section>\n   <section class=\"panel\"><b>Thiết bị này</b>\n    ")}${PUSH.on ? `${_t("<div class=\"row\"><span class=\"tag good\">Đang nhận thông báo</span><button class=\"mini\" data-a=\"pushTest\">Gửi thử</button><button class=\"mini\" data-a=\"pushOff\">Tắt</button></div>")}`
      : isIOS() && !isStandalone() ? `${_t("<p class=\"small\">Trên iPhone, hãy thêm app vào màn hình chính trước (xem Hướng dẫn sử dụng).</p>")}` : `${_t("<button class=\"primary\" data-a=\"pushOn\">Bật thông báo</button>")}`}</section>`;
  if (pg === "look") return `${_t("<section class=\"panel\">\n    <div class=\"tfield\"><label for=\"bday\">Ngày sinh</label><input id=\"bday\" type=\"date\" value=\"")}${esc(S.profile.birthday && S.profile.birthday.length === 10 ? S.profile.birthday : "")}${_t("\" data-change=\"setBday\"></div>\n    <label for=\"festSel\">Chủ đề</label><select id=\"festSel\" data-change=\"setFest\"><option value=\"auto\" ")}${(S.profile.festive || "auto") === "auto" ? "selected" : ""}${_t(">Tự động theo mùa & ngày lễ</option><option value=\"off\" ")}${S.profile.festive === "off" ? "selected" : ""}${_t(">Mặc định</option>\n      ")}${Object.entries(FEST).map(([k, f]) => `<option value="${k}" ${S.profile.festive === k ? "selected" : ""}${_t(">Xem thử: ")}${esc(f.name)}</option>`).join("")}${_t("</select>\n    <div class=\"setrow\"><span>Hiệu ứng rơi</span>")}${seg([[true, _t("Bật")], [false, _t("Tắt")]], S.profile.festFx !== false, "festFx")}${_t("</div>\n    <div class=\"setrow\"><span>Cỡ chữ</span>")}${seg([["s", _t("Nhỏ")], ["m", _t("Vừa")], ["l", _t("Lớn")]], fs, "fs")}${_t("</div>\n    <div class=\"setrow\"><span>Chế độ</span>")}${seg([["auto", _t("Theo máy")], ["light", _t("Sáng")], ["dark", _t("Tối")]], th, "theme")}</div></section>`;
  if (pg === "voice") return `${_t("<section class=\"panel\">\n    <label for=\"voiceSel\">Giọng đọc</label><select id=\"voiceSel\" data-change=\"setVoice\">")}${VOICES.length ? VOICES.map(v => `<option value="${esc(v.name)}" ${pickVoice()?.name === v.name ? "selected" : ""}>${esc(v.name)} (${esc(v.lang)})</option>`).join("") : `${_t("<option>Giọng mặc định</option>")}`}${_t("</select>\n    <div class=\"setrow\"><span>Tốc độ</span>")}${seg([["0.6", _t("Rất chậm")], ["0.7", _t("Chậm")], ["0.8", _t("Vừa")], ["0.95", "Nhanh"]], ttsRate(), "ttsRate")}${_t("</div>\n    <div class=\"row\"><button data-a=\"speak\" data-v=\"Hello! This is how I sound. Let's practise English together.\">🔊 Nghe thử</button><button class=\"mic ")}${UI.rec === "test" ? "on" : ""}" data-a="micTest" ${SR ? "" : "disabled"}>${UI.rec === "test" ? _t("● Đang nghe...") : _t("🎤 Thử micro")}</button></div>
    ${UI.rec === "test" ? `${_t("<p class=\"live\" id=\"live\">Hãy nói một câu tiếng Anh...</p>")}` : ""}</section>`;
  if (pg === "lang") return `<section class="panel"><div class="langpick">${[["auto", "📱", LANG === "en" ? `Device language (${DEVICE_LANG === "en" ? "English" : "Tiếng Việt"})` : `Theo ngôn ngữ của máy (${DEVICE_LANG === "en" ? "English" : "Tiếng Việt"})`], ["vi", "🇻🇳", "Tiếng Việt"], ["en", "🇬🇧", "English"]].map(([k, f, n]) => `<button class="setitem ${LANG_PICK === k ? "sel" : ""}" data-a="setLang" data-v="${k}"><span class="si-ic">${f}</span><span class="si-t">${n}</span><span class="si-v"></span><span class="si-go">${LANG_PICK === k ? "✓" : ""}</span></button>`).join("")}</div>
    <p class="muted small">${LANG === "en" ? "Lesson content such as Vietnamese meanings and translation exercises stays the same." : "Nội dung học như nghĩa tiếng Việt và bài dịch vẫn giữ nguyên."}</p></section>`;
  if (pg === "help") return HELP.map(([q, a], i) => `<details class="panel help" ${i === 0 ? "open" : ""}><summary>${q}</summary><div class="small">${a}</div></details>`).join("");
  if (pg === "feedback") return `${_t("<section class=\"panel\">\n    <p>Bạn thấy SEED thế nào? Mọi góp ý đều được đọc và dùng để làm app tốt hơn 💚</p>\n    <div class=\"setrow\"><span>Loại</span>")}${seg([["idea", _t("💡 Góp ý")], ["bug", _t("🐞 Báo lỗi")], ["love", "💚 Khen"], ["other", _t("Khác")]], UI.fbKind || "idea", "fbKind")}${_t("</div>\n    <div class=\"setrow\"><span>Đánh giá</span><div class=\"row stars\">")}${[1, 2, 3, 4, 5].map(n => `<button class="star ${n <= (UI.fbRate || 0) ? "on" : ""}" data-a="fbRate" data-v="${n}" aria-label="${n} sao">★</button>`).join("")}${_t("</div></div>\n    <label for=\"fbMsg\">Nội dung</label><textarea id=\"fbMsg\" rows=\"5\" maxlength=\"2000\" placeholder=\"Bạn thích điều gì, gặp lỗi ở đâu, muốn có thêm tính năng gì...\"></textarea>\n    <button class=\"primary\" data-a=\"fbSend\" ")}${UI.fbBusy ? "disabled" : ""}>${UI.fbBusy ? _t("Đang gửi...") : _t("Gửi phản hồi")}</button></section>`;
  if (pg === "about") { const F = founder(); return `<section class="panel about center">
    <img src="/logo-full.png?v=6" alt="SEED" width="240" height="240" class="logo-lg"><h2>SEED</h2><p class="muted">${esc(F.tagline)}</p></section>
   <section class="panel founder"><p class="eyebrow">${_t("Người sáng lập")}</p><h3>${esc(F.name)}</h3>
    <p>${esc(F.bio)}</p>
    <div class="row">${F.loves.map(t => `<span class="tag">${esc(t)}</span>`).join("")}</div>
    <blockquote>“${esc(F.quote)}”</blockquote></section>
   <p class="small muted center">${_t("Phiên bản")} ${APP_VERSION}${F.note ? " · " + esc(F.note) : ""}</p>`; }
  if (pg === "data") return `${_t("<section class=\"panel\"><p>Xoá toàn bộ tiến độ học để bắt đầu lại từ đầu. Không thể hoàn tác.</p><button class=\"danger\" data-a=\"reset\" id=\"resetBtn\">Xóa tiến độ và làm lại</button></section>")}`;
  return "";
}
// Thông tin người sáng lập (sửa tại đây)
// Nội dung trang "Về SEED" do admin sửa (tab 🌱 Giới thiệu); mặc định nếu chưa tải được
let ABOUT = null;
async function loadAbout() { try { const r = await fetch("/api/content", {cache:"no-store"}); if (r.ok) { ABOUT = (await r.json()).about; if (view === "settings" && UI.sp === "about") render(); } } catch (e) {} }
const ABOUT0 = {name:"Hồ Quốc Huy", birthday:"18/3",
  tagline_vi:"Học tiếng Anh theo đúng mục tiêu của bạn, mỗi ngày một chút.", tagline_en:"Learn English around your own goals, a little every day.",
  bio_vi:"Một người yêu cái đẹp: yêu thiên nhiên, cây cối, những bức tranh và từng nốt nhạc, và yêu con người. SEED được tạo ra từ mong muốn giúp mỗi người học tiếng Anh nhẹ nhàng như chăm một mầm cây: mỗi ngày tưới một chút, rồi đến lúc sẽ nở hoa.",
  bio_en:"Someone who loves beautiful things: nature, plants, paintings, every note of music, and people. SEED grew from a wish to make learning English feel as gentle as tending a seedling: a little water every day, and one day it blooms.",
  loves_vi:"🌿 Thiên nhiên\n🎨 Hội hoạ\n🎵 Âm nhạc\n🎻 Nhạc cụ\n💚 Con người", loves_en:"🌿 Nature\n🎨 Painting\n🎵 Music\n🎻 Instruments\n💚 People",
  quote_vi:"Ngôn ngữ cũng như âm nhạc: không cần hoàn hảo, chỉ cần mỗi ngày được cất lên.", quote_en:"Language is like music: it doesn't have to be perfect, it just needs to be heard every day.",
  note_vi:"Sinh nhật SEED cùng ngày với người sáng lập ({birthday}).", note_en:"SEED shares its birthday with its founder ({birthday})."};
function founder() {
  const A = {...ABOUT0, ...(ABOUT || {})}, en = LANG === "en", pick = k => ((en && A[k + "_en"]) || A[k + "_vi"] || "").trim();
  return {name:A.name, tagline:pick("tagline"), bio:pick("bio"), loves:pick("loves").split("\n").map(x => x.trim()).filter(Boolean), quote:pick("quote"), birthday:A.birthday, note:pick("note").replace("{birthday}", A.birthday)};
}

// Hướng dẫn sử dụng (gom tất cả chú thích chi tiết về đây)
const HELP = [
  [_t("Một buổi học gồm những gì?"), _t("6 bước: Ôn bài cũ → Từ vựng mới → Tự đặt câu → Dịch câu → Role-play với AI → Tổng kết. Bấm thanh tiến trình trên đầu bài để quay lại xem bước đã học. Cứ 5 buổi có một bài kiểm tra ngắn.")],
  [_t("Tra nghĩa và nghe phát âm"), _t("Bấm vào bất kỳ từ tiếng Anh nào để xem nghĩa, từ loại, phiên âm IPA và ví dụ. Bấm 🔊 để nghe, 🌐 Dịch để dịch cả câu ngay trong trang. Đổi giọng đọc và tốc độ trong Cài đặt → Giọng đọc & micro.")],
  [_t("Luyện nói bằng micro"), _t("Bấm 🎤 rồi nói. App chấm phát âm theo từng từ. Nhận giọng nói chạy tốt nhất trên Chrome hoặc Edge, cần có Internet.")],
  [_t("Flashcard và ôn tập"), _t("Từ đã học tự vào flashcard. App nhắc ôn đúng lúc bạn sắp quên (lặp lại ngắt quãng). Vào tab Ôn tập để lật thẻ hoặc làm bài ôn.")],
  [_t("Bật thông báo nhắc học"), _t("Cài đặt → Nhắc học & thông báo → Bật thông báo. Mỗi thiết bị bật riêng một lần. Học xong (hoặc đã vào học, ôn flashcard) trong ngày thì app không nhắc nữa.")],
  [_t("Dùng trên iPhone"), _t("Mở bằng Safari → nút Chia sẻ → Thêm vào MH chính → mở app từ biểu tượng ngoài màn hình. Sau đó mới bật được thông báo (iOS 16.4 trở lên).")],
  [_t("Cộng đồng: trò chuyện ẩn danh"), _t("Phòng chung cho mọi người cùng hỏi đáp; Ghép đôi 1-1 để luyện nói, kể cả khi người kia đang offline. Mọi người chỉ thấy biệt danh. Không chia sẻ số điện thoại, mạng xã hội hay đường link (app sẽ chặn).")],
  [_t("Giữ cuộc trò chuyện, thu hồi, chặn"), _t("⭐ Giữ: khi cả hai cùng bấm, hai bạn thành bạn chat và tin nhắn không bị xoá (cuộc trò chuyện thường tự xoá sau 30 ngày). Bấm ⋯ ở tin của mình để thu hồi. Bấm ⋯ trên đầu cuộc trò chuyện để tắt thông báo, kết thúc hoặc chặn. Bỏ chặn: Ghép đôi 1-1 → Người đã chặn.")],
  [_t("Giao diện theo mùa và sinh nhật"), _t("Giao diện tự đổi theo 4 mùa và các ngày lễ (Tết, 14/2, 8/3, 18/3, 1/6, Trung thu, 14/10, 20/11, Giáng Sinh…). Nhập ngày sinh để nhận lời chúc riêng đúng ngày sinh nhật.")],
  [_t("Đổi tài khoản"), _t("Cài đặt → Đăng xuất, rồi chọn tài khoản khác khi đăng nhập lại. Tiến độ được lưu theo tài khoản và đồng bộ giữa các thiết bị.")],
];
/* =====================================================================
   TRA TỪ
   ===================================================================== */
let POP = null, POPERR = "";
function closePop() { POP?.remove(); POP = null; document.querySelectorAll(".wv.hl").forEach(x => x.classList.remove("hl")); }
function knownWord(w) {
  const lw = w.toLowerCase(), all = [...cardList().map(c => c.w), ...(L()?.les?.words || [])];
  return all.find(x => x.w.toLowerCase() === lw) || all.find(x => x.w.toLowerCase().split(" ").includes(lw));
}
async function openWord(el) {
  closePop(); POPERR = "";
  const word = el.dataset.w.replace(/[’']s$/, ""), ctx = (el.closest(".msg,.example,.src,.flash,.fb,.qtext,p") || el).textContent.trim().slice(0, 200);
  const pop = document.createElement("div"); pop.id = "pop"; pop.setAttribute("role", "dialog"); pop.setAttribute("aria-label", _t("Tra từ ") + word); document.body.appendChild(pop); POP = pop;
  const r = el.getBoundingClientRect();
  if (innerWidth >= 600) { pop.style.top = (r.bottom + scrollY + 10) + "px"; pop.style.left = Math.max(12, Math.min(r.left + scrollX - 24, innerWidth - 384)) + "px"; }
  else pop.classList.add("sheet");
  const k = word.toLowerCase(); let d = S.dict[k];
  const kw = knownWord(word);
  if (!d && kw) d = {headword:kw.w, ipa:kw.ipa, pos:kw.pos, meaning:kw.vi, examples:[{en:kw.ex, vi:kw.ex_vi}]};
  drawPop(word, d, !S.dict[k]);
  setTimeout(() => pop.scrollIntoView?.({block:"nearest", behavior:"smooth"}), 30);
  if (S.dict[k]) return;
  let full = null;
  if (aiOn()) { try { full = await gemini(TEACHER(), `${_t("Tra từ tiếng Anh \"")}${word}${_t("\" trong ngữ cảnh: \"")}${ctx}${_t("\".\nTrả JSON {\"headword\":\"dạng gốc\",\"ipa\":\"phiên âm IPA\",\"pos\":\"từ loại tiếng Việt (Danh từ, Động từ, Tính từ...)\",\"meaning\":\"nghĩa tiếng Việt đúng ngữ cảnh; thêm 1-2 nghĩa phổ biến khác nếu có\",\n\"examples\":[{\"en\":\"câu ví dụ\",\"vi\":\"dịch\"}] (3 câu, ưu tiên lĩnh vực của người học),\"collocations\":[\"cụm hay đi kèm\"] (tối đa 3)}")}`); if (!full?.meaning) full = null; } catch (e) { full = null; POPERR = e.message; } }
  if (!full) { try { const r2 = await fetch("/api/dict?w=" + encodeURIComponent(k));
    if (r2.ok) { const j = (await r2.json())[0], m = j.meanings?.[0], defs = (j.meanings || []).flatMap(x => x.definitions || []);
      full = {headword:j.word, ipa:j.phonetic || j.phonetics?.find(p => p.text)?.text || "", pos:m?.partOfSpeech || "", meaning:d?.meaning || m?.definitions?.[0]?.definition || "", meaningEn:!d,
        examples:defs.filter(x => x.example).slice(0, 3).map(x => ({en:x.example, vi:""}))}; } } catch (e) {} }
  if (full) { if (d && !full.meaning) full.meaning = d.meaning; S.dict[k] = full; save(); d = full; }
  if (POP === pop) drawPop(word, d, false);
}
function drawPop(word, d, loading) {
  if (!POP) return;
  const hw = d?.headword || word, inCards = !!S.cards[cardKey(hw)];
  POP.innerHTML = `<div class="row between nowrap"><div><div class="word sm">${esc(hw)}</div><div class="ipa">${esc(d?.ipa || "")}${d?.pos ? ` · <span class="tag">${esc(d.pos)}</span>` : ""}${_t("</div></div>\n     <button class=\"mini\" data-a=\"closePop\" aria-label=\"Đóng\">✕</button></div>\n   ")}${d ? `<p class="meaning sm">${esc(d.meaning)}${d.meaningEn ? _t(" <span class=\"muted small\">(định nghĩa tiếng Anh)</span>") : ""}</p>` : ""}
   ${(d?.examples || []).filter(x => x.en).map(x => `<div class="ex">${esc(x.en)}${x.vi ? `<br><span class="muted">${esc(x.vi)}</span>` : ""}</div>`).join("")}
   ${d?.collocations?.length ? `${_t("<p class=\"muted small\">Hay đi với: ")}${d.collocations.map(esc).join(" · ")}</p>` : ""}
   ${loading ? `${_t("<p class=\"muted small\"><span class=\"spin\"></span> Đang tra...</p>")}` : ""}${!d && !loading ? `${_t("<p class=\"muted\">Chưa tra được từ này")}${AI.on ? (POPERR ? ` (${esc(POPERR)})` : "") : _t(" vì AI đang nghỉ")}${_t(". Thử nút Dịch hoặc Cambridge bên dưới.</p>")}` : ""}
   <div class="row"><button class="mini" data-a="speak" data-v="${esc(hw)}">🔊 Nghe</button>
    ${d ? `<button class="mini ${inCards ? "" : "primary"}" data-a="addLooked" data-v="${esc(word.toLowerCase())}" ${inCards ? "disabled" : ""}>${inCards ? _t("Đã có trong flashcard") : _t("+ Thêm vào flashcard")}</button>` : ""}
    <a class="mini btn" target="_blank" rel="noopener" href="https://dictionary.cambridge.org/dictionary/english-vietnamese/${encodeURIComponent(hw.toLowerCase())}">Cambridge ↗</a>
    <button class="mini" data-a="popTr" data-v="${esc(hw)}${_t("\" data-sl=\"en\">🌐 Dịch</button></div><div class=\"pop-tr\"></div>")}`;
}

// Bấm vào chữ tiếng Việt: tìm từ (có thể nhiều âm tiết) và từ tiếng Anh tương ứng
const VI_CACHE = {};
function viGuess(sylls, i) {
  const pool = [...(L()?.les?.words || []), ...cardList().map(c => c.w)].filter(w => w.vi);
  for (const n of [4, 3, 2, 1]) for (let a = Math.max(0, i - n + 1); a <= i && a + n <= sylls.length; a++) {
    const ph = sylls.slice(a, a + n).join(" ").toLowerCase();
    const w = pool.find(x => x.vi.toLowerCase().split(/[,;/()]/).map(z => z.trim()).some(z => z === ph || (n > 1 && (" " + z + " ").includes(" " + ph + " "))));
    if (w) return {word_vi:sylls.slice(a, a + n).join(" "), start:a + 1, length:n, en:w.w, ipa:w.ipa, pos:w.pos, examples:w.ex ? [{en:w.ex, vi:w.ex_vi}] : []};
  }
  return null;
}
async function openVi(el) {
  closePop(); POPERR = "";
  const box = el.closest(".src,.example p,.fb,.panel p,h3,p") || el.parentElement;
  const sylls = [...box.querySelectorAll(".wv")], i = sylls.indexOf(el), words = sylls.map(x => x.dataset.s), sent = words.join(" ");
  const pop = document.createElement("div"); pop.id = "pop"; pop.setAttribute("role", "dialog"); pop.setAttribute("aria-label", _t("Tra từ tiếng Việt")); document.body.appendChild(pop); POP = pop;
  const r = el.getBoundingClientRect();
  if (innerWidth >= 600) { pop.style.top = (r.bottom + scrollY + 10) + "px"; pop.style.left = Math.max(12, Math.min(r.left + scrollX - 24, innerWidth - 384)) + "px"; } else pop.classList.add("sheet");
  const key = sent + "|" + i;
  const mark = d => { sylls.forEach(x => x.classList.remove("hl")); if (d?.start) sylls.slice(d.start - 1, d.start - 1 + (d.length || 1)).forEach(x => x.classList.add("hl")); else el.classList.add("hl"); };
  let d = VI_CACHE[key] || viGuess(words, i);
  mark(d); drawViPop(el.dataset.s, sent, d, !VI_CACHE[key] && aiOn());
  setTimeout(() => pop.scrollIntoView?.({block:"nearest", behavior:"smooth"}), 30);
  if (VI_CACHE[key] || !aiOn()) return;
  try {
    const j = await gemini(TEACHER(), `${_t("Câu tiếng Việt: \"")}${sent}${_t("\". Người học bấm vào âm tiết thứ ")}${i + 1}${_t(" là \"")}${words[i]}${_t("\".\nXác định TỪ tiếng Việt chứa âm tiết đó (có thể là từ ghép nhiều âm tiết, ví dụ \"hành lý\", \"kỹ sư phần mềm\").\nTrả JSON {\"word_vi\":\"từ tiếng Việt\",\"start\":vị trí âm tiết đầu tiên của từ (đếm từ 1),\"length\":số âm tiết,\"en\":\"từ hoặc cụm tiếng Anh tương đương đúng ngữ cảnh câu\",\"alts\":[\"cách nói khác\"] (tối đa 2),\"pos\":\"từ loại tiếng Việt\",\"ipa\":\"IPA của từ tiếng Anh chính\",\"note\":\"lưu ý cách dùng ngắn, nếu có\",\"examples\":[{\"en\":\"câu ví dụ\",\"vi\":\"dịch\"}] (2 câu)}")}`);
    if (j?.en) { d = j; VI_CACHE[key] = j; }
  } catch (e) { POPERR = e.message; }
  if (POP === pop) { mark(d); drawViPop(el.dataset.s, sent, d, false); }
}
function drawViPop(syl, sent, d, loading) {
  if (!POP) return;
  const inCards = d?.en && !!S.cards[cardKey(d.en)];
  POP.dataset.vi = d ? JSON.stringify(d) : "";
  POP.innerHTML = `${_t("<div class=\"row between nowrap\"><div><p class=\"eyebrow\">Tiếng Việt → Tiếng Anh</p><div class=\"word sm\">")}${esc(d?.word_vi || syl)}${_t("</div></div><button class=\"mini\" data-a=\"closePop\" aria-label=\"Đóng\">✕</button></div>\n   ")}${d ? `<div class="en-ans"><b>${esc(d.en)}</b> <button class="mini" data-a="speak" data-v="${esc(d.en)}" aria-label="${LANG === "en" ? "Listen" : "Nghe"}">🔊</button></div>
     <div class="ipa">${esc(d.ipa || "")}${d.pos ? ` · <span class="tag">${esc(d.pos)}</span>` : ""}</div>
     ${d.alts?.length ? `${_t("<p class=\"small\">Cách nói khác: ")}${d.alts.map(esc).join(" · ")}</p>` : ""}${d.note ? `<p class="small muted">${esc(d.note)}</p>` : ""}
     ${(d.examples || []).filter(x => x.en).map(x => `<div class="ex">${esc(x.en)}${x.vi ? `<br><span class="muted">${esc(x.vi)}</span>` : ""}</div>`).join("")}` : ""}
   ${loading ? `${_t("<p class=\"muted small\"><span class=\"spin\"></span> Đang tra theo ngữ cảnh câu...</p>")}` : ""}
   ${!d && !loading ? `<p class="muted">${AI.on ? `${_t("Chưa tra được")}${POPERR ? ` (${esc(POPERR)})` : ""}.` : _t("Tra từng từ tiếng Việt cần AI đang hoạt động.")}${_t(" Bạn vẫn có thể dịch cả câu bên dưới.</p>")}` : ""}
   <div class="row">${d?.en ? `<button class="mini ${inCards ? "" : "primary"}" data-a="addVi" ${inCards ? "disabled" : ""}>${inCards ? _t("Đã có trong flashcard") : _t("+ Thêm vào flashcard")}</button>` : ""}
    <button class="mini" data-a="popTr" data-v="${esc(sent)}${_t("\">🌐 Dịch cả câu</button></div>\n   <div class=\"pop-tr\"></div>")}`;
}

/* =====================================================================
   NHẮC HỌC
   ===================================================================== */
const remindTime = () => S.profile?.remind || "20:00";
const toMin = t => { const [h, m] = String(t || "").split(":").map(Number); return (h || 0) * 60 + (m || 0); };
const fromMin = m => String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
const remindCfg = () => ({start:remindTime(), end:S.profile?.remindEnd || "23:00", every:Number(S.profile?.remindEvery || 60), on:S.profile?.remindOn !== false});
function remindSlots() { const c = remindCfg(), a = [], st = toMin(c.start), en = Math.max(toMin(c.end), st); for (let t = st; t <= en && a.length < 48; t += c.every) a.push(fromMin(t)); return a; }
function remindDue() { if (!S.profile || !S.path || !remindCfg().on) return false; const n = new Date(), now = n.getHours() * 60 + n.getMinutes(); return !doneToday() && now >= toMin(remindCfg().start) && now <= toMin(remindCfg().end) + 30; }
function remindLoop() {
  if (PUSH.on || !remindDue() || pref("ep_notified") === today()) return;
  if ("Notification" in window && Notification.permission === "granted") {
    try { new Notification(_t("Đến giờ học tiếng Anh"), {body:`${_t("Buổi ")}${doneN() + 1}${_t(" đang chờ bạn. ")}${dueCards().length}${_t(" thẻ flashcard cần ôn.")}`}); pref("ep_notified", today()); } catch (e) {}
  }
}
function calTimes() { const [h, m] = remindTime().split(":").map(Number), d = new Date(); d.setHours(h, m, 0, 0); const e = new Date(d.getTime() + (S.profile?.minutes || 30) * 60e3);
  const f = x => `${x.getFullYear()}${String(x.getMonth() + 1).padStart(2, "0")}${String(x.getDate()).padStart(2, "0")}T${String(x.getHours()).padStart(2, "0")}${String(x.getMinutes()).padStart(2, "0")}00`; return [f(d), f(e)]; }
function gcalLink() { const [a, b] = calTimes(); return "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + encodeURIComponent(_t("Học tiếng Anh")) + "&details=" + encodeURIComponent(_t("Mở app: ") + location.origin) + "&dates=" + a + "/" + b + "&ctz=Asia/Ho_Chi_Minh&recur=" + encodeURIComponent("RRULE:FREQ=DAILY"); }
function downloadIcs() { const [a, b] = calTimes();
  const ics = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//LoTrinhTiengAnh//VI","BEGIN:VEVENT","UID:" + Date.now() + "@lotrinh","DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z",
    "DTSTART;TZID=Asia/Ho_Chi_Minh:" + a, "DTEND;TZID=Asia/Ho_Chi_Minh:" + b, "RRULE:FREQ=DAILY", _t("SUMMARY:Học tiếng Anh"), _t("DESCRIPTION:Mở app: ") + location.origin,
    "BEGIN:VALARM","ACTION:DISPLAY",_t("DESCRIPTION:Đến giờ học tiếng Anh"),"TRIGGER:-PT0M","END:VALARM","END:VEVENT","END:VCALENDAR"].join("\r\n");
  const u = URL.createObjectURL(new Blob([ics], {type:"text/calendar"})), el = document.createElement("a"); el.href = u; el.download = "hoc-tieng-anh.ics"; document.body.appendChild(el); el.click(); el.remove(); setTimeout(() => URL.revokeObjectURL(u), 2000); }

/* =====================================================================
   THÔNG BÁO ĐẨY (nhắc học mỗi 2 tiếng, kể cả khi đóng app)
   ===================================================================== */
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const isStandalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
const pushSupported = () => "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
let PUSH = {on:false, checked:false};
async function swReg() { if (!("serviceWorker" in navigator)) return null; try { return await navigator.serviceWorker.register("/sw.js"); } catch (e) { console.warn("SW", e); return null; } }
async function checkPush() { try { const reg = await navigator.serviceWorker?.getRegistration(); const sub = await reg?.pushManager?.getSubscription(); PUSH = {on:!!sub && Notification.permission === "granted", checked:true};
  // Gắn lại thiết bị cho đúng tài khoản đang đăng nhập (khi đổi tài khoản trên cùng máy)
  if (PUSH.on) fetch("/api/push", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({subscription:sub.toJSON()})}).catch(() => {});
} catch (e) { PUSH = {on:false, checked:true}; } }
// Đăng xuất: gỡ thiết bị khỏi tài khoản này để không còn bị nhắc thay cho tài khoản cũ
async function logout() {
  try { const reg = await navigator.serviceWorker?.getRegistration(); const sub = await reg?.pushManager?.getSubscription();
    if (sub) await timeoutFetch("/api/push", {method:"DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({endpoint:sub.endpoint})}, 5000); } catch (e) {}
  if (DIRTY || saveTimer) await pushState().catch(() => {});
  location.href = "/auth/signout";
}
function b64ToBytes(b) { const p = "=".repeat((4 - b.length % 4) % 4), s = atob((b + p).replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from(s, c => c.charCodeAt(0)); }
async function enablePush(btn) {
  if (isIOS() && !isStandalone()) return toast(_t("Trên iPhone: mở app bằng Safari, bấm Chia sẻ → Thêm vào MH chính, rồi mở app từ biểu tượng ngoài màn hình để bật thông báo."));
  if (!pushSupported()) return toast(_t("Trình duyệt này không hỗ trợ thông báo đẩy. Hãy dùng Chrome (Android/máy tính) hoặc Safari (iPhone, iOS 16.4 trở lên)."));
  btn.disabled = true; btn.innerHTML = `${_t("<span class=\"spin\"></span> Đang bật...")}`;
  try {
    const perm = await Notification.requestPermission();
    if (perm !== "granted") throw new Error(_t("Bạn chưa cho phép thông báo. Vào cài đặt trình duyệt/điện thoại để cho phép thông báo của trang này."));
    const reg = await swReg() || await navigator.serviceWorker.ready;
    await navigator.serviceWorker.ready;
    const kr = await fetch("/api/push"); const kd = await kr.json(); if (!kd.publicKey) throw new Error(kd.error || _t("Server chưa cấu hình khóa thông báo"));
    const sub = await reg.pushManager.getSubscription() || await reg.pushManager.subscribe({userVisibleOnly:true, applicationServerKey:b64ToBytes(kd.publicKey)});
    const r = await fetch("/api/push", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({subscription:sub.toJSON()})});
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || _t("Không lưu được thiết bị"));
    PUSH.on = true; toast(_t("Đã bật nhắc học trên thiết bị này"));
  } catch (e) { toast(e.message); }
  render();
}
async function disablePush() {
  try { const reg = await navigator.serviceWorker.getRegistration(); const sub = await reg?.pushManager.getSubscription();
    if (sub) { await fetch("/api/push", {method:"DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({endpoint:sub.endpoint})}); await sub.unsubscribe(); } } catch (e) {}
  PUSH.on = false; toast(_t("Đã tắt nhắc học trên thiết bị này")); render();
}
async function testPush(btn) { btn.disabled = true; const r = await fetch("/api/push", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({test:true})}); const d = await r.json().catch(() => ({}));
  toast(r.ok ? _t("Đã gửi thông báo thử, kiểm tra thanh thông báo") : (d.error || _t("Gửi thử thất bại"))); btn.disabled = false; }

/* =====================================================================
   HÀNH ĐỘNG (data-a)
   ===================================================================== */
const ACT = {
  openRank: () => { view = "rank"; UI.menu = false; LB.level = ""; LB.league = null; render(); lbLoad(true); window.scrollTo(0, 0); },
  lbReload: () => { LB.err = ""; lbLoad(true); render(); },
  lbLevel: v => { LB.level = v; LB.league = LB.d?.myLeague ?? null; lbLoad(true); },
  lbLeague: v => { if (!LB.level) LB.level = LB.d?.myLevel || ""; LB.league = Number(v); lbLoad(true); },
  lbMine: () => { LB.level = ""; LB.league = null; lbLoad(true); },
  lbSeen: async () => { try { await fetch("/api/leaderboard", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({action:"seen"})}); } catch (e) {} if (LB.d) LB.d.reward.lastResult = null; render(); toast(_t("🎁 Đã nhận thưởng! Xem trong mục Phần thưởng của bạn.")); },
  lbFrame: v => { try { localStorage.setItem("ep_frame", v || ""); } catch (e) {} lbSet({frame: v || null}); },
  lbNameT: () => lbSet({show_name: !LB.d?.reward?.show_name, display_name: displayName() || ""}),
  lbOpt: v => { if (v === "1" && !confirm(_t("Tắt tham gia: bạn sẽ không có tên trên bảng và không nhận thưởng theo hạng. Tiếp tục?"))) return; lbSet({opt_out: v === "1"}); },
  setLang: async v => { if (v === LANG_PICK && !(v === "auto" && !S.profile)) { if (!S.profile && v === LANG) return; } try { localStorage.setItem("ep_lang", v); } catch (e) {}
    if (!S.profile) { try { sessionStorage.setItem("ep_sv", JSON.stringify(SV)); } catch (e) {} return location.reload(); } // đang khảo sát: giữ câu trả lời rồi tải lại
    S.profile.lang = v; S.profile.uiLang = v === "auto" ? DEVICE_LANG : v; save(); if (DIRTY || saveTimer) await pushState().catch(() => {}); location.reload(); },
  setPage: v => { UI.sp = v || ""; render(); scrollTo(0, 0); },
  fbKind: v => { UI.fbKind = v; render(); }, fbRate: v => { UI.fbRate = Number(v); render(); },
  fbSend: async () => { const msg = $("#fbMsg")?.value.trim(); if (!msg && !UI.fbRate) return toast(_t("Hãy viết vài dòng hoặc chọn số sao nhé"));
    UI.fbBusy = true; render();
    try { const r = await timeoutFetch("/api/feedback", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({kind:UI.fbKind || "idea", rating:UI.fbRate || null, message:msg, level:S.level, ua:navigator.userAgent})}, 15000);
      const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.error || _t("Không gửi được"));
      UI.fbRate = 0; UI.fbBusy = false; UI.sp = ""; render(); toast(_t("Cảm ơn bạn đã góp ý 💚")); }
    catch (e) { UI.fbBusy = false; render(); toast(e.message); } },
  logout: () => logout(),
  pushAsk: async (v, btn) => { S.profile.pushAsked = true; save(); if (v === "1") await enablePush(btn); else render(); },
  chAgree: () => { S.profile.chatOK = true; save(); chPoll(true); render(); },
  chTab: v => { CH.tab = v; CH.pair = null; CH.msgs = []; CH.last = 0; CH.menu = null; if (v === "rank") { LB.level = ""; LB.league = null; lbLoad(true); } render(); chPoll(true); },
  chRoom: v => { CH.room = v; CH.msgs = []; CH.last = 0; render(); chPoll(true); },
  chSend: () => chSend(),
  chRec: () => chRecStart(), chRecStop: () => chRecStop(false), chRecCancel: () => chRecStop(true),
  chMatch: async () => { CH.lastMatch = Date.now(); try { const d = await chApi({action:"match", level:S.level || "A1"}); if (d.room) { toast(_t("Đã ghép! Bạn ấy có thể chưa online, cứ chào trước nhé 👋")); chOpen(d.room.id); } else { CH.waiting = true; render(); } } catch (e) { toast(e.message); } },
  chCancel: async () => { try { await chApi({action:"cancel"}); } catch (e) {} CH.waiting = false; render(); },
  chOpen: v => chOpen(v),
  chBlocks: async () => { CH.showBlocks = !CH.showBlocks; if (CH.showBlocks) { try { const r = await timeoutFetch("/api/chat?blocks=1", {}, 10000); CH.blocks = (await r.json()).blocks || []; } catch (e) { CH.blocks = []; } } render(); },
  chUnblock: async v => { const [key, reopen] = String(v).split("|"); try { const d = await chApi({action:"unblock", key, reopen:reopen === "1"}); CH.blocks = (CH.blocks || []).filter(b => b.key !== key); toast(_t("Đã bỏ chặn")); if (d.room) return chOpen(d.room); render(); chPoll(true); } catch (e) { toast(e.message); } },
  chHMenu: () => { CH.hmenu = !CH.hmenu; render(); },
  chMute: async v => { try { await chApi({action:"mute", room:CH.pair.id, on:v === "1"}); if (CH.pairInfo) CH.pairInfo.muted = v === "1"; CH.hmenu = false; toast(v === "1" ? _t("🔕 Đã tắt thông báo của cuộc trò chuyện này. Tin nhắn vẫn hiện trong hộp thư.") : _t("🔔 Đã bật lại thông báo")); render(); } catch (e) { toast(e.message); } },
  chBlockRoom: async (v, btn) => { if (!btn.dataset.c) { btn.dataset.c = 1; btn.textContent = _t("Bấm lần nữa để chặn"); btn.classList.add("danger"); return; }
    try { await chApi({action:"blockRoom", room:v}); toast(_t("Đã chặn. Bạn sẽ không bao giờ thấy tin, bị ghép hay nhận thông báo từ người này nữa.")); } catch (e) { return toast(e.message); }
    CH.inbox = (CH.inbox || []).filter(r => r.id !== v); CH.pair = null; CH.msgs = []; CH.last = 0; render(); chPoll(true); },
  chBack: () => { CH.pair = null; CH.msgs = []; CH.last = 0; render(); chPoll(true); },
  chKeep: async v => { try { const d = await chApi({action:"keep", room:CH.pair.id, on:v === "1"}); toast(d.saved ? _t("⭐ Hai bạn đã là bạn chat!") : v === "1" ? _t("Đã bấm giữ. Chờ bạn ấy đồng ý nhé.") : _t("Đã bỏ giữ")); chPoll(false); if (CH.pairInfo) { CH.pairInfo.mineKeep = v === "1"; CH.pairInfo.saved = !!d.saved; } render(); } catch (e) { toast(e.message); } },
  chLeave: async (v, btn) => { if (!btn.dataset.c) { btn.dataset.c = 1; btn.textContent = _t("Bấm lần nữa để xác nhận"); return; }
    try { await chApi({action:"leave", room:CH.pair?.id}); } catch (e) {} CH.pair = null; CH.msgs = []; CH.last = 0; render(); chPoll(true); },
  chRecall: async v => { try { await chApi({action:"recall", id:Number(v)}); const m = CH.msgs.find(x => x.id === Number(v)); if (m) { m.recalled = true; m.text = ""; m.audio = null; } CH.menu = null; render(); } catch (e) { toast(e.message); } },
  chMenu: v => { CH.menu = v ? Number(v) : null; render(); },
  chReport: async v => { const [id, reason] = String(v).split("|"); try { await chApi({action:"report", id:Number(id), reason}); CH.menu = null; toast(_t("Đã gửi báo cáo. Cảm ơn bạn!")); chPoll(true); } catch (e) { toast(e.message); } },
  chBlock: async v => { try { await chApi({action:"block", id:Number(v)}); CH.menu = null; CH.msgs = CH.msgs.filter(m => m.id !== Number(v)); toast(_t("Đã chặn. Bạn sẽ không thấy tin nhắn của người này nữa.")); if (CH.tab === "pair") { CH.pair = null; CH.msgs = []; CH.last = 0; } chPoll(true); } catch (e) { toast(e.message); } },
  festFx: v => { S.profile.festFx = v === "true"; save(); applyFestive(); render(); toast(v === "true" ? _t("Đã bật hiệu ứng rơi") : _t("Đã tắt hiệu ứng rơi")); },
  go: v => { if (v === "settings") UI.sp = ""; view = v; Q = null; FC = null; closePop(); UI.menu = false; render(); scrollTo(0, 0); if (v === "chat") chPoll(true); if (v === "rank") { LB.level = ""; LB.league = null; lbLoad(true); } },
  speak: v => say(v),
  slow: v => say(v, Math.max(0.45, ttsRate() - 0.25)),
  pron: v => { const l = L(), [kind, i] = v.split(":"), w = l.les.words[Number(i)], target = kind === "w" ? w.w : w.ex;
    startRec(v, r => { l.pron[v] = pronScore(target, r.text, r.alts); l.scores.speaking = Math.round(avg(Object.values(l.pron).map(x => x.score))); save(); }); },
  qMic: () => startRec("q", r => answer(r)),
  rpMic: () => startRec("rp", r => rpSend(r.text)),
  micTest: () => startRec("test", r => toast(`${_t("Máy nghe được: \"")}${r.text}"`)),
  autospeak: () => { pref("ep_autospeak", autoSpeak() ? "0" : "1"); render(); },
  hidetext: () => { pref("ep_hidetext", hideText() ? "0" : "1"); render(); },
  reveal: v => { const l = L(); l.reveal = [...(l.reveal || []), Number(v)]; render(); },
  ttsRate: v => { pref("ep_rate", v); render(); say("This is the new speaking speed."); },
  closePop,
  pick: v => answer(v), submitQ: () => answer($("#qin")?.value || ""), nextQ: () => nextQ(),
  quitQuiz: () => { const m = Q?.mode; Q = null; view = m === "review" ? "review" : m === "xtest" ? "tests" : "home"; render(); },
  plGo: () => nextQ(),
  xtStart: v => startXTest(v, XT.skill), xtSkill: v => { XT.skill = v; render(); }, xtLv: v => { XT.lv = v; render(); },
  xtOpen: v => { XT.open = XT.open === v ? null : v; render(); }, xtDone: () => { XT.result = null; XT.open = null; render(); scrollTo(0, 0); },
  rvExplain: v => rvExplain(v),
  adjYes: v => changeLevel(v), adjNo: () => { S.adjOffer = null; save(); render(); toast(_t("Giữ nguyên trình độ. Cố lên nhé!")); },
  plSkip: () => { if (!Q) return; UI.rec = null; try { REC?.abort?.(); } catch (e) {} Q.res.push({ok:false, skip:true, skill:"speaking", i:Q.i}); Q.skipped.speaking = true; nextQ(); },
  pickLvOpen: () => { UI.pickLv = !UI.pickLv; render(); },
  pickLevel: v => { const sk = S.placement?.skills || null; S.placement = {...(S.placement || {}), level:v, manual:true, date:today(), correct:S.placement?.correct || 0, total:S.placement?.total || 0, skills:sk}; UI.pickLv = false; save(); view = "placeResult"; render(); },
  startPlacement, skipPlacement: () => { S.placement = {level:"A0", correct:0, total:0, date:today()}; save(); view = "placeResult"; render(); },
  confirmPath: () => { if (S.path && S.sessions.length) { S.skills = {...(S.skills || {}), ...Object.fromEntries(Object.entries(S.placement.skills || {}).filter(([, v]) => v))}; view = "path"; if (S.placement.level !== S.level) changeLevel(S.placement.level); else { save(); render(); } return; }
    S.level = S.placement.level; S.skills = {...(S.skills || {}), ...Object.fromEntries(Object.entries(S.placement.skills || {}).filter(([, v]) => v))}; buildPath(); view = "home"; render(); toast(_t("Đã tạo lộ trình. Bắt đầu buổi 1 thôi!")); prefetchNext(); },
  svGoal: v => { SV.goal = v; SV.fields = []; SV.subs = []; render(); },
  svField: v => { const f = FIELDS[SV.goal][v][0];
    if (SV.fields.includes(f)) { SV.fields = SV.fields.filter(x => x !== f); SV.subs = SV.subs.filter(x => !x.startsWith(f + ": ")); } else SV.fields = [...SV.fields, f]; render(); },
  svSub: v => { SV.subs = SV.subs.includes(v) ? SV.subs.filter(x => x !== v) : [...SV.subs, v]; render(); },
  svSubAll: () => { const all = subGroups(SV).flatMap(f => subsOf(SV.goal, f).map(x => f + ": " + x)); SV.subs = all.every(k => SV.subs.includes(k)) ? [] : all; render(); },
  svMin: v => { SV.minutes = Number(v); render(); },
  svWeak: v => { SV.weak = SV.weak.includes(v) ? SV.weak.filter(x => x !== v) : [...SV.weak, v]; render(); },
  svSubmit: () => { S.profile = {...SV}; save(); SV = null; view = S.level ? "settings" : "home"; render(); if (S.level) toast(_t("Đã lưu mục tiêu. Các buổi học tới sẽ theo lĩnh vực mới.")); },
  editGoal: () => { SV = newSv(S.profile); view = "survey"; render(); },
  startLesson, startUnit, exitLesson: () => { if (PREVIEW) return location.href = "/admin#lessons"; save(); Q = null; view = "home"; render(); },
  step: v => setStep(Number(v)),
  vnext: () => { const l = L(); l.vi++; if (l.vi === l.les.words.length) l.les.words.forEach(w => addCard(w, "lesson")); if (l.vi > l.les.words.length) Q = makeQuiz("vcheck", vcheckItems(), true); save(); render(); },
  vprev: () => { const l = L(); l.vi = Math.max(0, l.vi - 1); render(); },
  grade3, grade4, rpSend, rpHint, rpEnd, rpAgain: () => { L().rpEval = null; render(); },
  finishLesson: v => PREVIEW ? (location.href = "/admin#lessons") : finishLesson(v),
  nextCourse: () => { S.courses.push({...S.path, end:today()}); checkBadges(); S.level = S.path.to; S.difficulty = 0; buildPath(); view = "home"; render(); toast(_t("Bắt đầu khóa mới!")); },
  rtab: v => { UI.rtab = v; render(); },
  startFlip: v => { const set = v === "hard" ? hardCards() : v === "all" ? shuffle(cardList()).slice(0, 20) : dueCards();
    FC = {keys:set.slice(0, 30).map(c => c.w.w.toLowerCase()), i:0, flip:false}; view = "flip"; render(); },
  flip: () => { FC.flip = !FC.flip; render(); if (FC.flip) say(S.cards[FC.keys[FC.i]]?.w.w || ""); },
  rate: v => { review(FC.keys[FC.i], Number(v)); FC.i++; FC.flip = false; render(); },
  startRQuiz: v => { const [set, mode] = v.split(":"), cards = (set === "hard" ? hardCards() : dueCards()).slice(0, 15), pool = cardList().map(c => c.w);
    Q = makeQuiz("review", shuffle(cards).map(c => mode === "type" ? spellQ(c.w)
      : mode === "listen" ? {type:"type", q:_t("Nghe và gõ lại từ"), ans:c.w.w, speak:c.w.w, autoplay:true, skill:"listening", word:c.w.w, hint:_t("nghĩa là ") + c.w.vi}
      : mode === "speak" ? {type:"speak", q:c.w.ex || c.w.w, ans:c.w.ex || c.w.w, skill:"speaking", word:c.w.w}
      : meaningQ(c.w, pool)), true); view = "quiz"; render(); },
  cdel: v => { delete S.cards[v]; save(); render(); },
  hx: v => { UI.hx = UI.hx === Number(v) ? null : Number(v); render(); },
  addLooked: (v, btn) => { const d = S.dict[v] || (() => { const kw = knownWord(v); return kw && {headword:kw.w, ipa:kw.ipa, pos:kw.pos, meaning:kw.vi, examples:[{en:kw.ex, vi:kw.ex_vi}]}; })(); if (!d) return;
    addCard({w:d.headword, ipa:d.ipa || "", pos:d.pos || "", vi:d.meaning, ex:d.examples?.[0]?.en || "", ex_vi:d.examples?.[0]?.vi || ""}, "lookup"); save(); btn.textContent = _t("Đã thêm vào flashcard"); btn.disabled = true; btn.classList.remove("primary"); renderHeader(); },
  addVi: (v, btn) => { let d; try { d = JSON.parse(POP?.dataset.vi || "null"); } catch (e) {} if (!d?.en) return;
    addCard({w:d.en, ipa:d.ipa || "", pos:d.pos || "", vi:d.word_vi, ex:d.examples?.[0]?.en || "", ex_vi:d.examples?.[0]?.vi || ""}, "lookup"); save();
    btn.textContent = _t("Đã thêm vào flashcard"); btn.disabled = true; btn.classList.remove("primary"); renderHeader(); },
  skipWait: () => cancelWait?.(),
  pushOn: (v, btn) => enablePush(btn), pushOff: disablePush, pushTest: (v, btn) => testPush(btn),
  remEvery: v => { S.profile.remindEvery = Number(v); save(); render(); },
  probeAI: () => probeAI(),
  remTone: v => { S.profile.remindTone = v; save(); render(); toast(v === "soft" ? _t("Lời nhắc sẽ nhẹ nhàng") : _t("Lời nhắc sẽ lầy lội 😈")); },
  remToggle: () => { S.profile.remindOn = !remindCfg().on; save(); render(); toast(S.profile.remindOn ? _t("Đã bật nhắc học") : _t("Đã tắt nhắc học")); },
  closeCelebrate: () => { UI.celebrate = []; render(); },
  tr: v => doTranslate(v),
  popTr: async (v, btn) => { const sl = btn.dataset.sl || "vi", tl = sl === "vi" ? "en" : "vi", out = POP?.querySelector(".pop-tr"); if (!out) return;
    btn.disabled = true; out.innerHTML = `${_t("<span class=\"spin\"></span> Đang dịch...")}`;
    try { const r = await timeoutFetch(`/api/translate?sl=${sl}&tl=${tl}&q=${encodeURIComponent(v)}`, {}, 15000); const d = await r.json(); if (!r.ok) throw new Error(d.error);
      const ipa = await sentIPA(sl === "en" ? v : d.text); out.innerHTML = `<div class="tr-out">${esc(d.text)}${ipa ? `<span class="ipa tr-ipa">${esc(ipa)}</span>` : ""}<em>${esc(d.engine)}</em></div>`; } catch (e) { out.innerHTML = `${_t("<p class=\"muted small\">Chưa dịch được: ")}${esc(e.message || _t("lỗi"))}</p>`; }
    btn.disabled = false; },
  ics: downloadIcs,
  notify: async () => { try { await Notification.requestPermission(); } catch (e) {} render(); },
  checkAI: async (v, btn) => { btn.innerHTML = `<span class="spin"></span>`; await checkAI(); render(); toast(AI.on ? _t("Key và model hợp lệ") : _t("AI chưa dùng được: ") + AI.msg); },
  fs: v => { pref("ep_fs", v); applyPrefs(); render(); },
  theme: v => { pref("ep_theme", v); applyPrefs(); render(); },
  menu: () => { UI.menu = !UI.menu; renderHeader(); },
  reset: (v, btn) => { if (!btn.dataset.c) { btn.dataset.c = 1; btn.textContent = _t("Bấm lần nữa để xác nhận xóa"); return; }
    S = blank(); Q = null; FC = null; SV = null; pushState(); view = "home"; render(); toast(_t("Đã xóa tiến độ")); },
};
const CHANGE = {
  setBday: v => { S.profile.birthday = v || ""; save(); applyFestive(); render(); toast(v ? _t("Đã lưu ngày sinh 🎂") : _t("Đã xoá ngày sinh")); },
  setFest: v => { S.profile.festive = v; save(); applyFestive(); render(); },
  setRemind: v => { S.profile.remind = v; if (toMin(S.profile.remindEnd || "23:00") < toMin(v)) S.profile.remindEnd = v; save(); render(); toast(_t("Đã lưu giờ nhắc")); },
  setRemindEnd: v => { S.profile.remindEnd = toMin(v) < toMin(remindTime()) ? remindTime() : v; save(); render(); toast(_t("Đã lưu giờ nhắc")); }, setVoice: v => { pref("ep_voice", v); say("Hello! Nice to meet you."); } };

document.addEventListener("click", e => {
  const w = e.target.closest(".w");
  if (w && !e.target.closest("[data-notap]")) { e.preventDefault(); e.stopPropagation(); openWord(w); return; }
  const wv = e.target.closest(".wv");
  if (wv && !e.target.closest("[data-notap]")) { e.preventDefault(); e.stopPropagation(); openVi(wv); return; }
  if (POP && !e.target.closest("#pop")) closePop();
  if (UI.menu && !e.target.closest(".usermenu")) { UI.menu = false; renderHeader(); }
  const a = e.target.closest("[data-a]"); if (!a || a.disabled) return;
  e.preventDefault(); const fn = ACT[a.dataset.a];
  if (fn) { const r = fn(a.dataset.v, a); if (view === "lesson" && S.current) { save(); if (r && r.then) r.then(() => S.current && save(), () => {}); } }
}, true);
document.addEventListener("keydown", e => {
  if (e.key === "Escape") { closePop(); UI.menu = false; }
  const t = e.target;
  if (e.key === "Enter" && t.dataset?.enter && !(t.tagName === "TEXTAREA" && e.shiftKey)) { e.preventDefault(); ACT[t.dataset.enter]?.(); return; }
  if (/INPUT|TEXTAREA|SELECT/.test(t.tagName)) return;
  if (Q && view !== "flip" && (view === "quiz" || view === "lesson")) {
    if (Q.pick && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); return nextQ(); }
    const k = {"1":0,"2":1,"3":2,"4":3,"a":0,"b":1,"c":2,"d":3}[e.key.toLowerCase()];
    if (k != null && Q.items[Q.i]?.type === "mcq") answer(k);
  }
  if (view === "flip" && FC) {
    if (e.key === " ") { e.preventDefault(); ACT.flip(); }
    else if (FC.flip && "1234".includes(e.key)) ACT.rate([1, 3, 4, 5][Number(e.key) - 1]);
  }
});
document.addEventListener("input", e => {
  const t = e.target;
  if (t.dataset.sv && SV) SV[t.dataset.sv] = t.value;
  if (t.dataset.live === "rq") { UI.q = t.value; const pos = t.selectionStart; render(); const n = $("#rq"); if (n) { n.focus(); n.setSelectionRange(pos, pos); } }
});
document.addEventListener("change", e => { const t = e.target; if (t.dataset.change) CHANGE[t.dataset.change]?.(t.value); });
setInterval(() => document.querySelectorAll("[data-start]").forEach(el => el.textContent = fmtTime(Date.now() - Number(el.dataset.start))), 1000);



/* =====================================================================
   CỘNG ĐỒNG: trò chuyện ẩn danh (phòng chung theo trình độ + ghép đôi 1-1), có tin nhắn giọng nói
   ===================================================================== */
const CH = {tab:"room", room:"", msgs:[], last:0, me:null, pair:null, waiting:false, queue:0, err:"", sending:false, rec:null, timer:null, closed:false, menu:null};
const CH_LEVELS = ["A0","A1","A2","B1","B2","C1"];
const VIx = /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹàáèéìíòóùúýãõĩũ]/i;
function ageYears() { const b = S.profile?.birthday || ""; if (!/^\d{4}-\d\d-\d\d$/.test(b)) return null; const d = new Date(b), n = new Date(); return n.getFullYear() - d.getFullYear() - (n < new Date(n.getFullYear(), d.getMonth(), d.getDate()) ? 1 : 0); }
const chRoomId = () => CH.tab === "pair" ? CH.pair?.id : CH.tab === "rank" ? null : "lv-ALL"; // Phòng chung: 1 phòng cho mọi trình độ
async function chApi(body) {
  const r = await timeoutFetch("/api/chat", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body)}, 30000);
  const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.error || _t("lỗi ") + r.status); return d;
}
async function chPoll(reset) {
  if (view !== "chat" || CH.tab === "rank" || document.visibilityState !== "visible" || !S.profile?.chatOK) return chBadge();
  const lv = encodeURIComponent(S.level || "");
  try {
    if (CH.tab === "pair" && !CH.pair) {           // danh sách cuộc trò chuyện 1-1
      const r = await timeoutFetch(`/api/chat?inbox=1&lv=${lv}`, {}, 10000), d = await r.json(); if (!r.ok) throw new Error(d.error);
      // Đang chờ: cứ 15 giây thử ghép lại
      if (d.waiting && Date.now() - (CH.lastMatch || 0) > 15000) { CH.lastMatch = Date.now(); try { const m = await chApi({action:"match", level:S.level || "A1"}); if (m.room) { toast(_t("Đã ghép với một bạn luyện tập 🎉")); return chOpen(m.room.id); } } catch (e) {} }
      CH.inbox = d.rooms; CH.waiting = d.waiting; CH.unread = d.unread; CH.err = ""; return render();
    }
    const room = chRoomId(); if (!room) return render();
    if (reset) { CH.msgs = []; CH.last = 0; }
    const r = await timeoutFetch(`/api/chat?room=${encodeURIComponent(room)}&after=${CH.last}&lv=${lv}`, {}, 10000), d = await r.json();
    if (!r.ok) throw new Error(d.error);
    CH.me = d.me; CH.closed = d.closed; CH.ban = d.ban; CH.err = ""; if (d.pair) CH.pairInfo = d.pair;
    const box = $("#chbox"), atBottom = !box || box.scrollHeight - box.scrollTop - box.clientHeight < 80;
    const rec = new Set(d.recalled || []); let changed = false;
    CH.msgs.forEach(m => { if (rec.has(m.id) && !m.recalled) { m.recalled = true; m.text = ""; m.audio = null; changed = true; } });
    if (d.messages.length || reset || changed) { const seen = new Set(CH.msgs.map(m => m.id)); CH.msgs = [...CH.msgs, ...d.messages.filter(m => !seen.has(m.id))].slice(-300); CH.last = CH.msgs.at(-1)?.id || CH.last; render(); if (atBottom || reset) chScroll(); }
    else if (reset !== false) render();
  } catch (e) { if (CH.err !== e.message) { CH.err = e.message; render(); } }
}
// Số tin chưa đọc trên tab "Cộng đồng" (kiểm tra mỗi phút khi không ở trang chat)
let CH_BADGE_AT = 0;
async function chBadge() {
  if (!S.profile?.chatOK || document.visibilityState !== "visible" || Date.now() - CH_BADGE_AT < 60000) return;
  CH_BADGE_AT = Date.now();
  try { const r = await timeoutFetch("/api/chat?inbox=1", {}, 10000); if (!r.ok) return; const d = await r.json(); if (d.unread !== CH.unread) { CH.unread = d.unread; renderHeader(); } } catch (e) {}
}
function chOpen(id) { CH.hmenu = false; CH.tab = "pair"; CH.pair = {id}; CH.pairInfo = null; CH.msgs = []; CH.last = 0; CH.menu = null; render(); chPoll(true); }
function chScroll() { requestAnimationFrame(() => { const b = $("#chbox"); if (b) b.scrollTop = b.scrollHeight; }); }
setInterval(() => chPoll(false), 3000);
async function chSend() {
  const inp = $("#chIn"), t = inp?.value.trim(); if (!t || CH.sending) return;
  CH.sending = true;
  try { await chApi({action:"send", room:chRoomId(), text:t}); inp.value = ""; await chPoll(false); chScroll(); }
  catch (e) { toast(e.message); }
  CH.sending = false; render(); $("#chIn")?.focus();
}
// Ghi âm: MediaRecorder (Chrome/Android: webm, iPhone: mp4), tối đa 60 giây
async function chRecStart() {
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) return toast(_t("Trình duyệt này chưa hỗ trợ ghi âm"));
  try {
    const stream = await navigator.mediaDevices.getUserMedia({audio:true});
    const type = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"].find(t => MediaRecorder.isTypeSupported?.(t)) || "";
    const mr = new MediaRecorder(stream, type ? {mimeType:type, audioBitsPerSecond:32000} : undefined), chunks = [];
    mr.ondataavailable = e => e.data.size && chunks.push(e.data);
    CH.rec = {mr, stream, chunks, start:Date.now(), cancel:false};
    mr.onstop = async () => {
      stream.getTracks().forEach(t => t.stop()); clearInterval(CH.timer);
      const rec = CH.rec; CH.rec = null; render();
      if (rec.cancel || !chunks.length) return;
      const sec = (Date.now() - rec.start) / 1000; if (sec < 1) return toast(_t("Đoạn ghi âm quá ngắn"));
      const blob = new Blob(chunks, {type:mr.mimeType || type || "audio/webm"});
      const b64 = await new Promise(res => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(",")[1]); fr.readAsDataURL(blob); });
      CH.sending = true; render();
      try { await chApi({action:"send", room:chRoomId(), audio:b64, mime:blob.type, sec}); await chPoll(false); chScroll(); } catch (e) { toast(e.message); }
      CH.sending = false; render();
    };
    mr.start(); CH.timer = setInterval(() => { const el = $("#recT"); const s = Math.floor((Date.now() - CH.rec.start) / 1000); if (el) el.textContent = `0:${String(s).padStart(2, "0")}`; if (s >= 60) mr.stop(); }, 250);
    render();
  } catch (e) { toast(_t("Chưa có quyền dùng micro")); }
}
function chRecStop(cancel) { if (!CH.rec) return; CH.rec.cancel = !!cancel; CH.rec.mr.stop(); }

function chTabs() {
  return `<div class="row chtabs"><button class="seg ${CH.tab === "room" ? "sel" : ""}" data-a="chTab" data-v="room">${_t("💬 Phòng chung")}</button><button class="seg ${CH.tab === "pair" ? "sel" : ""}" data-a="chTab" data-v="pair">${_t("🤝 Ghép đôi 1-1")}</button>
    ${CH.me && CH.tab !== "rank" ? `<span class="muted small">${_t("Hôm nay bạn là")} <b>${CH.me.icon} ${esc(whoName(CH.me))}</b>${CH.me.title ? ` <span class="lbtitle">${esc(lbTitle(CH.me.title))}</span>` : ""}</span>` : ""}</div>`;
}
function vChat() {
  const age = ageYears();
  if (age !== null && age < 16) return `<div class="wrap narrow">${chTabs()}<section class="panel center">${mascot("happy", 90)}${_t("<h2>Cộng đồng dành cho người từ 16 tuổi</h2>\n    <p class=\"muted\">Phần trò chuyện với người lạ chỉ mở cho người từ 16 tuổi trở lên. Bạn vẫn có thể luyện nói với AI trong bước Role-play của mỗi bài học nhé!</p></section></div>")}`;
  if (!S.profile.chatOK) return `<div class="wrap narrow">${chTabs()}<section class="panel">${stk("chat", 64, "corner", 8)}${_t("<p class=\"eyebrow\">Cộng đồng</p><h2>Trò chuyện ẩn danh để cùng luyện tiếng Anh</h2>\n    <p>Gặp những người cũng đang học, cùng luyện nói, hỏi đáp và động viên nhau. Không ai biết bạn là ai: mỗi ngày bạn có một biệt danh ngẫu nhiên.</p>\n    <h3>Nội quy</h3><ul class=\"rules\">\n     <li>🙂 Tôn trọng và lịch sự. Không xúc phạm, quấy rối, phân biệt đối xử.</li>\n     <li>🔒 Không chia sẻ thông tin cá nhân: số điện thoại, địa chỉ, mạng xã hội, đường link (app sẽ chặn).</li>\n     <li>🚫 Không nội dung người lớn, bạo lực, lừa đảo, quảng cáo.</li>\n     <li>🗣️ Ưu tiên nói tiếng Anh; dùng tiếng Việt khi cần hỏi bài.</li>\n     <li>🚩 Gặp người vi phạm: bấm ⋯ ở tin nhắn để <b>Báo cáo</b> hoặc <b>Chặn</b>. Người bị nhiều báo cáo sẽ bị khoá chat.</li>\n     <li>🎤 Tin nhắn giọng nói được lưu tối đa 30 ngày rồi tự xoá.</li></ul>\n    <p class=\"muted small\">Chỉ dành cho người từ 16 tuổi trở lên.</p>\n    <button class=\"primary big\" data-a=\"chAgree\">Tôi đồng ý, vào cộng đồng</button></section></div>")}`;
  const room = chRoomId(), lv = (CH.room || "lv-" + S.level).replace("lv-", "");
  const tabs = chTabs();
  let head = "";
  if (CH.tab === "room") head = "";
  else if (!CH.pair) {
    const list = (CH.inbox || []).map(r => `<div class="inbox-item"><button class="inbox-row" data-a="chOpen" data-v="${r.id}"><span class="cav" style="--h:${r.partner.hue}">${r.partner.icon}</span>
      <span class="grow"><b>${esc(whoName(r.partner))}</b>${r.saved ? `${_t(" <span class=\"tag good\">⭐ Bạn chat</span>")}` : r.theirKeep ? `${_t(" <span class=\"tag\">muốn giữ cuộc trò chuyện</span>")}` : ""}<br><span class="muted small">${esc(prevTr(r.preview) || _t("Chưa có tin nhắn, hãy chào bạn ấy nhé!"))}</span></span>
      ${r.muted ? `${_t("<span title=\"Đã tắt thông báo\">🔕</span>")}` : ""}${r.unread ? `<span class="badge">${r.unread}</span>` : ""}</button>
      <button class="mini ghost inbox-x" data-a="chBlockRoom" data-v="${r.id}${_t("\" title=\"Chặn người này, không bao giờ thấy tin của họ nữa\">⛔</button></div>")}`).join("");
    return `<div class="wrap narrow">${tabs}${_t("<section class=\"panel\">\n      <div class=\"row between nowrap\"><div><h2>Ghép đôi 1-1</h2></div>")}${mascot(CH.waiting ? "think" : "cheer", 70, CH.waiting ? "bob" : "")}</div>
      ${CH.waiting ? `${_t("<div class=\"row\"><span class=\"spin\"></span><span>Đang tìm bạn phù hợp...</span><button class=\"mini\" data-a=\"chCancel\">Huỷ tìm</button></div>")}`
        : `${_t("<button class=\"primary big\" data-a=\"chMatch\">🔍 Tìm bạn luyện tập mới</button>")}`}${_t("\n      <h3>Cuộc trò chuyện của bạn</h3>\n      ")}${list ? `<div class="inbox">${list}</div>` : `${_t("<p class=\"muted\">Chưa có cuộc trò chuyện nào.</p>")}`}
      <p class="small"><a href="#" data-a="chBlocks">${CH.showBlocks ? _t("Ẩn người đã chặn") : _t("Người đã chặn")}</a></p>
      ${CH.showBlocks ? `<div class="inbox">${(CH.blocks || []).length ? CH.blocks.map(b => `<div class="inbox-item blk"><span class="cav" style="--h:${b.who.hue}">${b.who.icon}</span><span class="grow"><b>${esc(whoName(b.who))}${_t("</b><br><span class=\"muted small\">Chặn lúc ")}${new Date(b.at).toLocaleString("vi-VN")}</span></span>
        <button class="mini" data-a="chUnblock" data-v="${b.key}${_t("|0\">Bỏ chặn</button>")}${b.room ? `<button class="mini" data-a="chUnblock" data-v="${b.key}${_t("|1\">Bỏ chặn & mở lại chat</button>")}` : ""}</div>`).join("") : `${_t("<p class=\"muted small\">Bạn chưa chặn ai.</p>")}`}</div>` : ""}</section></div>`;
  }
  else {
    const P = CH.pairInfo || {}, w = P.partner;
    head = `${_t("<div class=\"phead\"><button class=\"mini ghost\" data-a=\"chBack\" aria-label=\"Quay lại\">←</button>")}${w ? `<span class="cav" style="--h:${w.hue}">${w.icon}</span><span class="pname"><b>${esc(whoName(w))}</b>${P.level ? ` <span class="tag">${esc(P.level)}</span>` : ""}${P.muted ? " 🔕" : ""}</span>` : `<span class="pname"></span>`}
      ${P.saved ? `${_t("<span class=\"tag good\">⭐ Bạn chat</span>")}` : `<button class="mini ${P.mineKeep ? "sel" : ""}" data-a="chKeep" data-v="${P.mineKeep ? 0 : 1}${_t("\" title=\"Giữ cuộc trò chuyện\">")}${P.mineKeep ? _t("✓ Đã giữ") : _t("⭐ Giữ")}</button>`}${_t("\n      <button class=\"mini\" data-a=\"chHMenu\" aria-label=\"Tuỳ chọn\" aria-expanded=\"")}${CH.hmenu ? "true" : "false"}">⋯</button></div>
      ${CH.hmenu ? `<div class="cmenu row hmenu"><button class="mini" data-a="chMute" data-v="${P.muted ? 0 : 1}">${P.muted ? _t("🔔 Bật lại thông báo") : _t("🔕 Tắt thông báo")}</button>
        <button class="mini" data-a="chLeave">${P.saved ? _t("Huỷ bạn chat") : _t("Kết thúc")}</button><button class="mini danger" data-a="chBlockRoom" data-v="${CH.pair.id}${_t("\">⛔ Chặn</button></div>")}` : ""}
      ${!P.saved && P.mineKeep ? `` : !P.saved && P.theirKeep ? `${_t("<p class=\"fb small\">⭐ Bạn ấy muốn giữ cuộc trò chuyện. Bấm “Giữ” để thành bạn chat.</p>")}` : ""}
      ${CH.closed ? `${_t("<p class=\"fb small\">Cuộc trò chuyện đã kết thúc.</p>")}` : ""}`;
  }
  const bubble = m => {
    const ws = (m.text || "").split(/\s+/).filter(Boolean), vi = ws.filter(w => VIx.test(w)).length > Math.max(1, ws.length * 0.3); // chủ yếu là tiếng Việt
    const body = m.recalled ? `<span class="muted"><i>${m.mine ? _t("Bạn đã thu hồi một tin nhắn") : _t("Tin nhắn đã được thu hồi")}</i></span>` : m.hidden ? `${_t("<span class=\"muted\">(Tin nhắn đã bị ẩn do vi phạm)</span>")}`
      : m.audio ? `<audio controls preload="none" src="${esc(m.audio)}"></audio><span class="muted small"> ${m.sec}s</span>`
      : vi ? esc(m.text) + trBtn(m.text, "vi", "en", _t("Xem tiếng Anh")) : tw(m.text) + ` <button class="mini" data-a="speak" data-v="${esc(m.text)}" aria-label="${LANG === "en" ? "Listen" : "Nghe"}">🔊</button>${trBtn(m.text, "en", "vi")}`;
    return `<div class="cmsg ${m.mine ? "mine" : ""}">${m.mine ? "" : `<span class="cav" style="--h:${m.who.hue}">${m.who.icon}</span>`}<div class="cbody">${m.mine ? "" : `<b class="cname">${esc(whoName(m.who))}${m.who.title ? ` <span class="lbtitle">${esc(lbTitle(m.who.title))}</span>` : ""}</b>`}<div class="msg ${m.mine ? "user" : "ai"}${m.recalled ? " recalled" : ""}">${body}</div>
      <span class="ctime">${new Date(m.at).toLocaleTimeString("vi-VN", {hour:"2-digit", minute:"2-digit"})}${m.hidden || m.recalled ? "" : ` · <a href="#" data-a="chMenu" data-v="${m.id}">⋯</a>`}</span>
      ${CH.menu === m.id && m.mine ? `<div class="row cmenu"><button class="mini danger" data-a="chRecall" data-v="${m.id}${_t("\">↩️ Thu hồi</button><button class=\"mini ghost\" data-a=\"chMenu\" data-v=\"\">Đóng</button></div>")}` : ""}
      ${CH.menu === m.id && !m.mine ? `${_t("<div class=\"row cmenu\"><span class=\"small\">🚩 Báo cáo:</span>")}${[_t("Thô tục"), _t("Quấy rối"), _t("Nội dung người lớn"), _t("Lừa đảo/quảng cáo"), _t("Khác")].map(r => `<button class="mini" data-a="chReport" data-v="${m.id}|${r}">${r}</button>`).join("")}<button class="mini" data-a="chBlock" data-v="${m.id}${_t("\">⛔ Chặn người này</button><button class=\"mini ghost\" data-a=\"chMenu\" data-v=\"\">Đóng</button></div>")}` : ""}</div></div>`;
  };
  const canSend = room && !CH.closed && !CH.ban;
  return `<div class="wrap narrow">${tabs}<section class="panel">${head}
    <div class="chat cbox" id="chbox">${CH.msgs.length ? CH.msgs.map(bubble).join("") : `<p class="muted center">${CH.err ? esc(CH.err) : _t("Chưa có tin nhắn nào. Hãy chào mọi người nhé: “Hi everyone! 👋”")}</p>`}</div>
    ${CH.ban ? `${_t("<p class=\"fb small\">Bạn đang bị tạm khoá trò chuyện đến ")}${new Date(CH.ban.until).toLocaleString("vi-VN")}${_t(" do bị báo cáo vi phạm.</p>")}` : ""}
    ${canSend ? (CH.rec ? `${_t("<div class=\"row recbar\"><span class=\"recdot\"></span><b id=\"recT\">0:00</b><span class=\"muted small\">Đang ghi âm (tối đa 60 giây)</span><button class=\"ghost\" data-a=\"chRecCancel\">Huỷ</button><button class=\"primary\" data-a=\"chRecStop\">Dừng & gửi</button></div>")}`
      : `${_t("<div class=\"row nowrap\"><label class=\"sr\" for=\"chIn\">Tin nhắn</label><input id=\"chIn\" data-enter=\"chSend\" maxlength=\"500\" placeholder=\"Viết bằng tiếng Anh (hoặc hỏi bằng tiếng Việt)...\" autocomplete=\"off\">\n         <button class=\"round\" data-a=\"chRec\" aria-label=\"Ghi âm\" title=\"Gửi tin nhắn giọng nói\">🎤</button><button class=\"primary\" data-a=\"chSend\" ")}${CH.sending ? "disabled" : ""}>${CH.sending ? "..." : _t("Gửi")}</button></div>`) : ""}</section></div>`;
}
/* =====================================================================
   GIAO DIỆN THEO MÙA / NGÀY LỄ + SINH NHẬT NGƯỜI DÙNG
   Sửa danh sách ngày đặc biệt ở FEST_DAYS (tháng-ngày, số ngày hiện trước, số ngày hiện sau).
   ===================================================================== */
// Mùng 1 Tết Âm lịch (cập nhật thêm năm khi cần)
const TET = {2026:"02-17", 2027:"02-06", 2028:"01-26", 2029:"02-13", 2030:"02-03", 2031:"01-23", 2032:"02-11", 2033:"01-31", 2034:"02-19", 2035:"02-08"};
// Rằm tháng 8 (Trung thu)
const TRUNGTHU = {2026:"09-25", 2027:"09-15", 2028:"10-03", 2029:"09-22", 2030:"09-12", 2031:"10-01", 2032:"09-19", 2033:"09-08", 2034:"09-27", 2035:"09-16"};
const FEST = {
  tet:      {name:_t("Tết Nguyên Đán"), emo:["🧧","🌸","🏮","🎆"], msg:_t("Chúc mừng năm mới! Năm mới học tiếng Anh tiến bộ vượt bậc nhé 🧧")},
  valentine:{name:_t("Lễ Tình nhân 14/2"), emo:["💖","💌","🌹","💕"], msg:_t("Happy Valentine's Day! Học thêm vài câu tỏ tình bằng tiếng Anh nào 💌")},
  women83:  {name:_t("Quốc tế Phụ nữ 8/3"), emo:["🌷","💐","🌸","💗"], msg:_t("Chúc mừng ngày 8/3! Gửi lời chúc tới những người phụ nữ tuyệt vời 💐")},
  founder:  {name:_t("Sinh nhật người sáng lập 18/3"), emo:["🎨","🎵","🎻","🖌️","🎹","🎶","🌿","🎂"], msg:_t("Hôm nay 18/3 là sinh nhật người tạo ra app này, một người yêu hội họa, âm nhạc và thiên nhiên. Cảm ơn bạn đã cùng học, cùng yêu cái đẹp! 🎨🎵")},
  kids:     {name:_t("Quốc tế Thiếu nhi 1/6"), emo:["🎈","🍭","🧸","🪁"], msg:_t("Happy Children's Day! Ai cũng có một đứa trẻ bên trong, học vui như chơi nhé 🎈")},
  midautumn:{name:_t("Tết Trung thu"), emo:["🏮","🥮","🌕","⭐"], msg:_t("Trung thu vui vẻ! Thử kể về Tết Trung thu bằng tiếng Anh xem 🥮")},
  special1410:{name:_t("Ngày đặc biệt 14/10"), emo:["💝","🌹","🎀","✨"], msg:"Happy birthday to someone very special 💝"},
  teacher:  {name:_t("Ngày Nhà giáo Việt Nam 20/11"), emo:["📚","💐","🍎","✏️"], msg:_t("Chúc mừng ngày Nhà giáo Việt Nam 20/11! Tri ân những người thầy, người cô 💐")},
  newyear:  {name:_t("Tết Dương lịch"), emo:["🎆","🥂","🎇","✨","🎉"], msg:_t("Happy New Year! Năm mới, mục tiêu mới: mỗi ngày thêm vài từ, cuối năm nói tiếng Anh thật tự tin 🎆")},
  xmas:     {name:_t("Giáng Sinh"), emo:["🎄","❄️","🎁","⛄"], msg:_t("Merry Christmas! Giáng Sinh an lành và ấm áp 🎄")},
  birthday: {name:_t("Sinh nhật của bạn"), emo:["🎂","🎉","🎈","🎁"], msg:""},
  // 4 mùa: thiên nhiên + nốt nhạc + nét cọ (tinh thần nghệ thuật của app), rơi thưa và nhẹ hơn ngày lễ
  spring:   {name:_t("Mùa xuân"), emo:["🌸","🌱","🎵","🌼","🦋"], msg:_t("Xuân về, hoa nở. Gieo vài từ mới hôm nay, mai sẽ nở thành câu nói 🌸")},
  summer:   {name:_t("Mùa hè"), emo:["🌻","🎶","🦋","🌊","☀️"], msg:_t("Hè rực rỡ! Học một bài nhẹ rồi nghe một bản nhạc tiếng Anh nhé ☀️🎶")},
  autumn:   {name:_t("Mùa thu"), emo:["🍁","🍂","🎵","🎻"], msg:_t("Thu dịu dàng như một bản violin. Pha tách trà và học vài câu mới nào 🍂🎻")},
  winter:   {name:_t("Mùa đông"), emo:["❄️","🎶","🎹","⛄"], msg:_t("Đông về, ngoài kia lạnh nhưng tiếng Anh của bạn vẫn ấm. Vào học thôi ❄️🎹")},
};
// [mã, tháng-ngày, hiện trước bao nhiêu ngày, hiện sau bao nhiêu ngày]
const FEST_DAYS = [["valentine","02-14",1,0], ["women83","03-08",1,0], ["founder","03-18",0,0], ["kids","06-01",1,0],
  ["special1410","10-14",0,0], ["teacher","11-20",1,0], ["xmas","12-25",10,1], ["newyear","01-01",2,1], ["newyear","12-31",1,1]];
function dayDiff(d, md, y) { const t = new Date(y, Number(md.slice(0, 2)) - 1, Number(md.slice(3))); return Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - t) / 864e5); }
function birthdayToday(d = new Date()) { const b = S?.profile?.birthday || ""; const md = b.slice(-5); return /^\d\d-\d\d$/.test(md) && dayDiff(d, md, d.getFullYear()) === 0; }
function festiveTheme(d = new Date()) {
  const pick = S?.profile?.festive || "auto";
  if (pick === "off") return null;
  if (pick !== "auto") return FEST[pick] ? pick : null; // xem trước một chủ đề
  if (birthdayToday(d)) return "birthday";
  const y = d.getFullYear();
  if (TET[y]) { const k = dayDiff(d, TET[y], y); if (k >= -7 && k <= 7) return "tet"; }
  if (TRUNGTHU[y]) { const k = dayDiff(d, TRUNGTHU[y], y); if (k >= -3 && k <= 0) return "midautumn"; }
  for (const [id, md, pre, post] of FEST_DAYS) { const k = dayDiff(d, md, y); if (k >= -pre && k <= post) return id; }
  const m = d.getMonth() + 1;
  return m >= 2 && m <= 4 ? "spring" : m >= 5 && m <= 7 ? "summer" : m >= 8 && m <= 10 ? "autumn" : "winter";
}
function applyFestive() {
  const id = festiveTheme(), r = document.documentElement;
  if (id) r.dataset.fest = id; else r.removeAttribute("data-fest");
  let fx = document.getElementById("festfx");
  const big = id && !["spring", "summer", "autumn", "winter"].includes(id);
  // Hiệu ứng rơi: ngày lễ dày hơn, 4 mùa thưa và mờ; tắt nếu máy bật "giảm chuyển động" hoặc người dùng tắt
  if (!id || S?.profile?.festFx === false || matchMedia("(prefers-reduced-motion: reduce)").matches) { fx?.remove(); return; }
  if (fx && fx.dataset.id === id) return;
  fx?.remove(); fx = document.createElement("div"); fx.id = "festfx"; fx.dataset.id = id; fx.setAttribute("aria-hidden", "true");
  const N = big ? 18 : 12; fx.className = big ? "" : "calm";
  fx.innerHTML = Array.from({length:N}, (_, i) => `<i style="left:${(i * (100 / N) + Math.random() * 4).toFixed(1)}%;animation-duration:${(9 + Math.random() * 8).toFixed(1)}s;animation-delay:-${(Math.random() * 15).toFixed(1)}s;font-size:${(14 + Math.random() * 14).toFixed(0)}px">${FEST[id].emo[i % FEST[id].emo.length]}</i>`).join("");
  document.body.appendChild(fx);
}
function festBanner() {
  const id = festiveTheme(); if (!id) return "";
  if (["spring", "summer", "autumn", "winter"].includes(id)) { const f = FEST[id]; return `<section class="panel festbanner season"><div class="row nowrap"><span class="festemo">${f.emo[0]}</span><div class="grow"><p class="eyebrow">${esc(f.name)}</p><p class="festmsg">${esc(f.msg)}</p></div></div></section>`; }
  const f = FEST[id], msg = id === "birthday" ? `${_t("Chúc mừng sinh nhật ")}${esc(displayName() || _t("bạn"))}${_t("! 🎂 Chúc bạn tuổi mới thật nhiều niềm vui và nói tiếng Anh ngày càng giỏi. Happy birthday!")}` : esc(f.msg);
  return `<section class="panel festbanner">${id === "birthday" ? confetti(50) : ""}<div class="row nowrap"><span class="festemo">${f.emo[0]}</span><div class="grow"><p class="eyebrow">${esc(f.name)}</p><p class="festmsg">${msg}</p></div></div></section>`;
}
/* =====================================================================
   KHUNG GIAO DIỆN
   ===================================================================== */
function applyPrefs() {
  const r = document.documentElement, th = pref("ep_theme") || "auto";
  r.dataset.fs = pref("ep_fs") || "m";
  if (th === "auto") r.removeAttribute("data-theme"); else r.dataset.theme = th;
  try { applyFestive(); } catch (e) {}
}
function renderHeader() {
  const h = $("#hdr"); if (!h) return;
  const focus = ["lesson", "quiz", "flip"].includes(view) || !S.path;
  const tabs = [["home", _t("Trang chủ")], ["path", _t("Lộ trình")], ["review", _t("Ôn tập")], ["rank", _t("🏆 Xếp hạng")], ["chat", _t("Cộng đồng")], ["history", _t("Lịch sử")]];
  const gift = LB.d?.reward?.lastResult ? `<span class="badge gift">🎁</span>` : "";
  const due = dueCards().length, name = displayName() || ME?.email || _t("Bạn");
  const active = view === "settings" ? "" : view;
  h.innerHTML = `${_t("<div class=\"hin\"><a href=\"#\" class=\"brand\" data-a=\"go\" data-v=\"home\"><img class=\"logo\" src=\"/logo.png?v=6\" alt=\"\" width=\"40\" height=\"40\"><span><b>SEED</b><small>Tiếng Anh cá nhân hóa</small></span></a>\n    ")}${focus ? "" : `${_t("<nav class=\"tabs-top\" aria-label=\"Điều hướng\">")}${tabs.map(([k, t]) => `<a href="#" class="${active === k ? "sel" : ""}" data-a="go" data-v="${k}">${t}${k === "review" && due ? `<span class="badge">${due}</span>` : k === "chat" && CH.unread ? `<span class="badge">${CH.unread}</span>` : k === "rank" ? gift : ""}</a>`).join("")}</nav>`}
    <div class="tools">${S.level ? `${_t("<span class=\"lvl\" title=\"Trình độ hiện tại\">")}${S.level}</span>` : ""}${_t("\n     <div class=\"usermenu\"><button class=\"avatar\" data-a=\"menu\" aria-label=\"Tài khoản ")}${esc(ME?.email || "")}">${ME?.avatar ? `<img src="${esc(ME.avatar)}" alt="" referrerpolicy="no-referrer">` : esc(name[0].toUpperCase())}</button>
     ${UI.menu ? `<div class="menu"><div class="who"><b>${esc(displayName() || _t("Tài khoản"))}</b><span>${esc(ME?.email || "")}</span></div>${ME?.admin ? `<a href="/admin">${_t("Quản trị")}</a>` : ""}${S.path ? `${_t("<a href=\"#\" data-a=\"go\" data-v=\"settings\">Cài đặt</a>")}` : ""}${_t("<a href=\"#\" data-a=\"logout\">Đăng xuất</a></div>")}` : ""}</div></div></div>`;
  const bn = $("#bnav");
  if (bn) { bn.hidden = focus; const BI = {home:NAV_HOME, path:STK().map, review:STK().book, rank:STK().trophy, chat:STK().chat, settings:NAV_GEAR};
    bn.innerHTML = focus ? "" : [...tabs.filter(t => t[0] !== "history"), ["settings", _t("Cài đặt")]].map(([k, t]) => `<a href="#" class="${view === k ? "sel" : ""}" data-a="go" data-v="${k}"><span class="bi">${BI[k]}</span><span class="bl">${LANG === "en" ? {home:"Home", path:"Course", review:"Review", rank:"Ranks", chat:"Chat", settings:"Settings"}[k] : k === "rank" ? "Xếp hạng" : t}</span>${k === "review" && due ? `<span class="badge">${due}</span>` : k === "chat" && CH.unread ? `<span class="badge">${CH.unread}</span>` : k === "rank" ? gift : ""}</a>`).join(""); }
}
function render() {
  const a = $("#app"); if (!a) return;
  if (view === "loading") return renderHeader();
  let html;
  if (view === "survey" || !S.profile) { if (!SV) SV = svRestore() || newSv(S.profile); view = "survey"; html = vSurvey(); }
  else if (view === "quiz" && Q) html = vQuiz();
  else if (view === "placeResult" && S.placement) html = vPlaceResult();
  else if (!S.level) html = vPlaceIntro();
  else if (view === "lesson") html = vLesson();
  else if (view === "unitResult") html = vUnitResult();
  else if (view === "flip") html = vFlip();
  else if (view === "path") html = vPath();
  else if (view === "review") html = vReview();
  else if (view === "history") html = vHistory();
  else if (view === "settings") html = vSettings();
  else if (view === "chat") html = vChat();
  else if (view === "tests") html = vTests();
  else if (view === "rank") html = `<div class="wrap narrow"><div class="sethead rankhead">${stk("trophy", 44, "", -8)}<h2>${_t("Bảng xếp hạng tuần")}</h2></div>${vRank()}</div>`;
  else { view = "home"; html = vHome(); }
  // Giữ nội dung đang gõ dở (câu tự đặt, bản dịch...) khi giao diện vẽ lại
  const keep = {}; a.querySelectorAll("textarea[id], input[id]").forEach(el => { if (el.value && !["qin", "rpIn", "rq"].includes(el.id) && !/^(sv-|remind)/.test(el.id)) keep[el.id] = el.value; });
  a.innerHTML = html;
  for (const id in keep) { const el = document.getElementById(id); if (el && !el.value && !el.disabled) el.value = keep[id]; }
  renderHeader();
  try { const fr = lbFrame(); document.querySelectorAll(".avatar, .bigavatar").forEach(el => { el.className = el.className.replace(/\s?fr-\S+/g, "") + (fr ? " fr-" + fr : ""); }); } catch (e) {}
  if (view === "lesson" && L()?.step === 4) scrollChat();
  if (Q && (view === "quiz" || view === "lesson") && !Q.pick) { const it = Q.items[Q.i]; if (it?.autoplay && Q.played !== Q.i) { Q.played = Q.i; setTimeout(() => say(it.speak), 350); } }
}

/* =====================================================================
   KHỞI ĐỘNG
   ===================================================================== */
(async () => {
  applyPrefs();
  const loadJs = (src, ok) => ok ? Promise.resolve() : new Promise(r => { const sc = document.createElement("script"); sc.src = src; sc.onload = r; sc.onerror = r; document.head.appendChild(sc); });
  await Promise.all([loadJs("/stickers.js?v=1", window.STICKERS), loadJs("/lessonbank.js?v=2", window.LESSON_BANK)]);
  // Kho bài trong database (thêm/sửa trong trang quản trị): bài cùng tên thay bản trong file, bài mới nối thêm vào cuối trình độ
  try { const r = await timeoutFetch("/api/lessons", {}, 6000); if (r.ok) { const d = await r.json(); const LB = window.LESSON_BANK = window.LESSON_BANK || {};
    for (const row of d.lessons || []) { const les = {...row.data, level:row.level, topic:row.topic, topic_en:row.topic_en || row.data.topic_en, dbId:row.id};
      const list = LB[row.level] = LB[row.level] || []; const i = list.findIndex(x => x.topic === les.topic); if (i >= 0) list[i] = les; else list.push(les); } } } catch (e) {}
  // Bài mới trong kho có thể kèm tên tiếng Anh (topic_en, grammar_en): nạp vào từ điển hiển thị
  try { Object.values(window.LESSON_BANK || {}).flat().forEach(l => { if (l.topic_en && EN[l.topic] === undefined) EN[l.topic] = l.topic_en; const ge = l.grammar_en || l.grammar?.name_en; if (ge && l.grammar && EN[l.grammar.name] === undefined) EN[l.grammar.name] = ge; }); } catch (e) {}
  if ("speechSynthesis" in window) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
  swReg().then(checkPush).then(() => { if (view === "settings") render(); });
  const app = $("#app");
  if (!app.querySelector(".boot")) app.innerHTML = "<div class=\"boot\" role=\"status\" aria-label=\"Loading\"><div class=\"gtrack\"><div class=\"runner r1\"><div class=\"depth\"><div class=\"flip\"><img class=\"gimg\" src=\"/goat-run1.png\" alt=\"\" width=\"120\" height=\"124\"><i class=\"dust d1\"></i><i class=\"dust d2\"></i><i class=\"dust d3\"></i></div><b class=\"note\">♪</b></div></div><div class=\"runner r2\"><div class=\"depth\"><div class=\"flip\"><img class=\"gimg\" src=\"/goat-run1.png\" alt=\"\" width=\"120\" height=\"124\"><i class=\"dust d1\"></i><i class=\"dust d2\"></i><i class=\"dust d3\"></i></div><b class=\"note\">♫</b></div></div></div><span class=\"boot-dots\"><i></i><i></i><i></i></span></div>";
  AI = {on:false, msg:_t("đang kiểm tra kết nối...")};
  const meP = fetch("/api/me").then(r => r.ok ? r.json() : null).catch(() => null);
  S = await loadState(); BASE = Number(S.rev || 0); try { if ((S.profile?.lang === "vi" || S.profile?.lang === "en") && !localStorage.getItem("ep_lang") && S.profile.lang !== LANG) { localStorage.setItem("ep_lang", S.profile.lang); return location.reload(); } } catch (e) {}
  if (S.profile && S.profile.uiLang !== LANG) { S.profile.uiLang = LANG; save(); } ME = await meP;
  loadAbout(); const pvId = new URLSearchParams(location.search).get("preview"); if (pvId) { if (ME?.admin) setTimeout(() => startPreview(pvId), 300); else setTimeout(() => alertBox(LANG === "en" ? "Preview is for admins only — log in with the admin account." : "Xem thử chỉ dành cho quản trị viên — hãy đăng nhập đúng tài khoản admin."), 500); }
  if (new URLSearchParams(location.search).get("view") === "rank" && S.path) { view = "rank"; history.replaceState(null, "", "/"); }
  if (S.profile) setTimeout(() => { autoFreeze(); lbLoad(); }, 1200);
  if (new URLSearchParams(location.search).get("view") === "chat" && S.path) { view = "chat"; history.replaceState(null, "", "/"); setTimeout(() => chPoll(true), 300); } try { applyFestive(); } catch (e) {} setInterval(() => { try { applyFestive(); } catch (e) {} }, 30 * 60e3); render(); remindLoop(); setInterval(remindLoop, 60e3);
  // Kiểm tra AI chạy ngầm, không chặn giao diện
  checkAI().then(() => { if (!["lesson", "quiz", "flip"].includes(view)) render(); setTimeout(prefetchNext, 1500); });
  setInterval(async () => { if (AI.quota && Date.now() - (AI.quotaAt || 0) < 300e3) return; if (!AI.on || AI.busy) { const was = AI.on && !AI.busy; await checkAI(); if (AI.on && !AI.busy && !was && !["lesson", "quiz"].includes(view)) render(); } }, 180e3);
  window.__EP = {get S() { return S; }, render}; // hỗ trợ gỡ lỗi
})();
})();
