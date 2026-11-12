/* Lộ Trình Tiếng Anh — ứng dụng học tiếng Anh cá nhân hóa
   Dữ liệu: /api/state (Supabase). AI: /api/ai (Gemini qua server). */
(() => {
"use strict";

/* =====================================================================
   DỮ LIỆU CỐ ĐỊNH
   ===================================================================== */
const LEVELS = ["A0","A1","A2","B1","B2","C1"];
const LEVEL_VI = {A0:"Mới bắt đầu",A1:"Sơ cấp",A2:"Sơ trung cấp",B1:"Trung cấp",B2:"Trung cao cấp",C1:"Cao cấp"};
const GOALS = [["communication","Giao tiếp"],["work","Công việc"],["travel","Du lịch"],["exam","Thi cử"]];
// Mục tiêu → lĩnh vực → tình huống cụ thể
const WORK_COMMON = ["Họp nhóm, báo cáo tiến độ","Viết email công việc","Thuyết trình","Họp online với khách hàng, đối tác","Đàm phán","Small talk với đồng nghiệp nước ngoài","Phỏng vấn xin việc","Đọc tài liệu chuyên ngành"];
const FIELDS = {
  communication:[
    ["Đời sống hằng ngày",["Chào hỏi, làm quen","Mua sắm, đi chợ","Gọi món ở quán ăn","Hỏi đường, đi lại","Gọi điện thoại","Đi khám bệnh, mua thuốc","Ngân hàng, bưu điện","Thuê nhà, nói chuyện với hàng xóm"]],
    ["Giao tiếp khi du lịch",["Sân bay, máy bay","Khách sạn","Taxi, tàu xe","Nhà hàng","Tham quan, mua vé","Mua sắm, trả giá","Xử lý sự cố (mất đồ, ốm)"]],
    ["Kết bạn, mạng xã hội",["Small talk","Nói về sở thích","Nhắn tin, bình luận","Chia sẻ quan điểm","Gọi video với bạn nước ngoài"]],
    ["Gia đình, nuôi dạy con",["Nói chuyện với con bằng tiếng Anh","Đọc truyện cho con","Sinh hoạt hằng ngày ở nhà","Trao đổi với giáo viên trường quốc tế"]],
    ["Hẹn hò, tình cảm",["Làm quen, mời đi chơi","Nhắn tin","Bày tỏ cảm xúc","Gặp gia đình người yêu"]],
    ["Nói trước đám đông",["Thuyết trình","Phát biểu, chúc mừng","Nêu ý kiến, tranh luận","Dẫn chương trình"]]],
  work:[
    ["IT, phần mềm",["Daily stand-up","Code review","Viết bug report, ticket","Giải thích vấn đề kỹ thuật","Làm việc với khách hàng nước ngoài (outsourcing)","Viết tài liệu kỹ thuật"]],
    ["Kinh doanh, sales",["Giới thiệu sản phẩm","Gọi điện cho khách hàng mới","Đàm phán giá","Chốt hợp đồng","Chăm sóc khách hàng sau bán"]],
    ["Marketing",["Brainstorm ý tưởng","Viết content","Báo cáo chiến dịch","Làm việc với agency","Phân tích số liệu"]],
    ["Tài chính, ngân hàng",["Tư vấn khách hàng","Giải thích sản phẩm tài chính","Báo cáo tài chính","Làm việc với kiểm toán"]],
    ["Y tế, dược",["Hỏi bệnh sử","Giải thích chẩn đoán","Hướng dẫn dùng thuốc","Trao đổi với đồng nghiệp","Đọc tài liệu y khoa"]],
    ["Khách sạn, nhà hàng",["Đón khách, check-in","Giới thiệu dịch vụ","Nhận order, giới thiệu món","Xử lý phàn nàn","Đặt phòng qua điện thoại"]],
    ["Kỹ thuật, sản xuất",["Hướng dẫn vận hành máy","An toàn lao động","Báo cáo sự cố","Làm việc với chuyên gia nước ngoài"]],
    ["Giáo dục",["Giảng dạy trên lớp","Trao đổi với phụ huynh","Họp chuyên môn","Viết nhận xét học sinh"]],
    ["Xuất nhập khẩu, logistics",["Theo dõi đơn hàng","Làm việc với forwarder","Chứng từ, hải quan","Xử lý giao hàng trễ"]],
    ["Chăm sóc khách hàng",["Trả lời điện thoại","Chat với khách","Xử lý khiếu nại","Hướng dẫn sử dụng sản phẩm"]],
    ["Văn phòng, hành chính, nhân sự",["Lên lịch họp","Tiếp khách","Tuyển dụng, phỏng vấn ứng viên","Soạn thông báo nội bộ"]]],
  travel:[
    ["Du lịch tự túc",["Sân bay, máy bay","Khách sạn, homestay","Phương tiện công cộng","Ăn uống","Tham quan, mua vé","Mua sắm","Xử lý sự cố"]],
    ["Đi công tác",["Sân bay, khách sạn","Gặp đối tác","Dự hội thảo","Ăn tối tiếp khách","Báo cáo chuyến công tác"]],
    ["Du học",["Phỏng vấn visa","Thủ tục nhập học","Thảo luận trên lớp","Ở ký túc xá, ở ghép","Đi làm thêm"]],
    ["Định cư ở nước ngoài",["Thuê nhà","Mở tài khoản ngân hàng","Đi khám bệnh","Xin việc","Giấy tờ hành chính","Hàng xóm, cộng đồng"]]],
  exam:[
    ["IELTS",["Listening","Reading","Writing Task 1","Writing Task 2","Speaking Part 1","Speaking Part 2–3"]],
    ["TOEIC",["Listening","Reading","Speaking","Writing"]],
    ["TOEFL",["Listening","Reading","Speaking","Writing"]],
    ["VSTEP",["Nghe","Đọc","Viết","Nói"]],
    ["Cambridge (KET/PET/FCE)",["Reading & Writing","Listening","Speaking"]]]
};
const subsOf = (goal, field) => { const f = FIELDS[goal].find(x => x[0] === field); return f ? f[1] : (goal === "work" && field === WORK_GROUP ? WORK_COMMON : []); };
const WORK_GROUP = "Việc chung ở công sở";
const subGroups = s => s.goal === "work" && s.fields.length ? [...s.fields, WORK_GROUP] : s.fields;
const DETAIL_HINT = {
  communication:"Ví dụ: hay nói chuyện với bạn bè nước ngoài qua mạng",
  work:"Ví dụ: tôi làm QA, thường họp và viết email với khách hàng Mỹ",
  travel:"Ví dụ: đi Nhật và Hàn tháng 3 năm sau, tự đặt phòng và đi tàu",
  exam:"Ví dụ: IELTS 6.5, cần nhất là Speaking"
};
const STEPS = ["Ôn bài cũ","Từ vựng mới","Tự đặt câu","Dịch câu","Role-play","Tổng kết"];
const SKILL_VI = {vocab:"Từ vựng",grammar:"Ngữ pháp",spelling:"Chính tả",translation:"Dịch",listening:"Nghe",speaking:"Nói"};

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

// Bài học mẫu, dùng khi chưa có Gemini
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
  {id:"first", name:"Bước đầu tiên", desc:"Hoàn thành buổi học đầu tiên", stk:"star"},
  {id:"streak3", name:"Lửa nhỏ", desc:"Học 3 ngày liên tiếp", stk:"flame"},
  {id:"streak7", name:"Lửa bùng cháy", desc:"Học 7 ngày liên tiếp", stk:"sparkle"},
  {id:"week", name:"Tròn một tuần", desc:"Hoàn thành 5 buổi học", stk:"calendar"},
  {id:"perfect", name:"Điểm tuyệt đối", desc:"Đạt từ 90 điểm trong một buổi", stk:"trophy"},
  {id:"speaker", name:"Giọng vàng", desc:"Phát âm đạt từ 80%", stk:"mic"},
  {id:"listener", name:"Tai thính", desc:"Nghe chép đúng từ 80%", stk:"headphones"},
  {id:"chatter", name:"Nói như gió", desc:"Role-play đạt từ 80 điểm", stk:"chat"},
  {id:"words50", name:"Kho 50 từ", desc:"Có 50 từ trong flashcard", stk:"book"},
  {id:"words100", name:"Kho 100 từ", desc:"Có 100 từ trong flashcard", stk:"globe"},
  {id:"ace", name:"Thủ khoa Unit", desc:"Kiểm tra định kỳ đạt từ 85%", stk:"target"},
  {id:"course", name:"Tốt nghiệp", desc:"Hoàn thành một khóa học", stk:"cap"}
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
function trBtn(text, sl = "en", tl = "vi", label = "Dịch") {
  const k = trKey(text, sl, tl), r = TRC[k];
  return `<span class="trbox"><button class="mini trbtn" data-a="tr" data-v="${esc(k)}" ${r === "…" ? "disabled" : ""}>${r === "…" ? `<span class="spin"></span> Đang dịch` : r ? "Ẩn bản dịch" : "🌐 " + label}</button>${r && r !== "…" ? `<span class="tr-out">${esc(r.text)}${r.ipa ? `<span class="ipa tr-ipa">${esc(r.ipa)}</span>` : ""}<em>${esc(r.engine)}</em></span>` : ""}</span>`;
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
    if (!r.ok) throw new Error(d.error || "lỗi " + r.status); const en = sl === "en" ? text : tl === "en" ? d.text : ""; TRC[k] = {text:d.text, engine:d.engine, ipa: en ? await sentIPA(en) : ""}; }
  catch (e) { delete TRC[k]; toast("Chưa dịch được: " + (e.name === "AbortError" ? "quá chậm" : e.message)); }
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
const micErr = e => /not-allowed|service-not-allowed/.test(e.message) ? "Trình duyệt chưa cho phép dùng micro. Bấm biểu tượng bên trái thanh địa chỉ và cho phép Micro." :
  e.message === "no-speech" ? "Không nghe thấy gì. Hãy nói to, rõ và gần micro hơn." : e.message === "unsupported" ? "Trình duyệt này không hỗ trợ nhận giọng nói. Hãy dùng Chrome hoặc Edge." :
  e.message === "network" ? "Nhận giọng nói cần kết nối Internet." : e.message === "aborted" ? "Đã dừng ghi âm." : "Lỗi micro: " + e.message;
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
const pronHtml = r => `<div class="fb ${r.score >= 80 ? "good" : r.score >= 50 ? "" : "bad"}"><b>Phát âm ${r.score}%</b> · ${markWords(r.words, r.marks)}<br><span class="muted small">Máy nghe được: "${esc(r.said)}"</span>${r.score < 80 ? `<br><span class="small">Từ gạch đỏ là từ máy chưa nhận ra. Bấm Nghe chậm, nghe mẫu rồi đọc lại.</span>` : ""}</div>`;
function dictScore(ref, text) { const rw = norm(ref), uw = norm(text); const marks = rw.map(w => uw.some(x => x === w || (w.length > 4 && lev(x, w) <= 1))); return {text, ref, score:pct(marks.filter(Boolean).length, rw.length), marks, words:rw}; }
const dictHtml = r => `<div class="fb ${r.score >= 80 ? "good" : "bad"}"><b>Nghe đúng ${r.score}%</b><br>Câu gốc: ${markWords(r.words, r.marks)}</div>`;
const autoSpeak = () => pref("ep_autospeak") !== "0";
const hideText = () => pref("ep_hidetext") === "1";
function startRec(key, onDone) {
  if (UI.rec) { try { REC?.stop(); } catch (e) {} return; }
  UI.rec = key; render();
  hear(t => { const el = $("#live"); if (el) el.textContent = "Đang nghe: " + t; })
    .then(r => { if (!r.text) throw new Error("no-speech"); UI.rec = null; onDone(r); })
    .catch(e => toast(micErr(e))).finally(() => { if (UI.rec === key) UI.rec = null; render(); });
}
function toast(msg) { const t = document.createElement("div"); t.className = "toast"; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2600); }
const pref = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } };

/* =====================================================================
   TRẠNG THÁI & LƯU TRỮ
   ===================================================================== */
const blank = () => ({v:4, profile:null, level:null, target:null, placement:null, path:null, sessions:[], cards:{}, tests:[], lessons:{}, dict:{}, current:null, remedial:[], difficulty:0, courses:[]});
let S = blank();
let AI = {on:false, msg:"Đang kiểm tra..."};
let ME = null; // tài khoản đang đăng nhập: {email, name, avatar, provider}
const displayName = () => S.profile?.name || ME?.name || "";
let view = "home", UI = {rtab:"due", q:"", hx:null, menu:false};
let Q = null;      // bài quiz đang làm (test đầu vào, kiểm tra định kỳ, ôn tập)
let FC = null;     // phiên lật thẻ
let SV = null;     // bản nháp khảo sát
let saveTimer = null;
let cancelWait = null; // bấm "Dùng bài mẫu" để thôi chờ Gemini

const normWord = x => Array.isArray(x) ? {w:x[0], ipa:x[1]||"", pos:"", vi:x[2]||"", ex:x[3]||"", ex_vi:""} : x;
function migrate(d) {
  const s = Object.assign(blank(), d || {});
  for (const k in s.cards) { const c = s.cards[k]; c.w = normWord(c.w); }
  for (const k in s.lessons) { const l = s.lessons[k]; if (l && l.words) l.words = l.words.map(normWord);
    if (l && typeof l.grammar === "string") l.grammar = {name:l.grammar, note:"", pattern:"", quiz:[]};
    if (l && !l.translations && l.tr) l.translations = l.tr.map(t => ({src:t[0], ref:t[1], dir:t[2] === "vi" ? "vi-en" : "en-vi"}));
    if (l && l.role && !l.roleplay) l.roleplay = {ai_role:l.role.ai, user_role:"Bạn", setting:l.role.goal, tasks:[l.role.goal], opening:""}; }
  if (s.path && !s.path.id) { s.path.id = "c1"; s.path.offset = 0; s.sessions.forEach(x => x.course = x.course || "c1"); s.tests.forEach(x => x.course = x.course || "c1"); }
  if (s.current && !s.current.les) s.current = null;
  return s;
}
// Lưu tiến độ ngay khi có thay đổi (0,5 giây sau), không cần bấm "Lưu & thoát".
// Mỗi bản lưu có số thứ tự rev: điện thoại đang giữ bản cũ sẽ không ghi đè bản mới từ máy tính.
let BASE = 0, SAVING = false, DIRTY = false;
function save() { DIRTY = true; clearTimeout(saveTimer); saveTimer = setTimeout(pushState, 500); }
async function pushState(keepalive = false) {
  clearTimeout(saveTimer); saveTimer = null;
  if (SAVING) { saveTimer = setTimeout(pushState, 400); return; }
  SAVING = true; DIRTY = false;
  const next = BASE + 1;
  try { S.rev = next;
    const body = JSON.stringify(S);
    const r = await fetch("/api/state?base=" + BASE, {method:"PUT", keepalive: keepalive && body.length < 60000, headers:{"Content-Type":"application/json"}, body});
    if (r.status === 409) { const d = await r.json(); adoptState(d.data, "Đã tải tiến độ mới nhất từ thiết bị khác"); }
    else if (!r.ok) throw new Error(r.status);
    else BASE = next;
  } catch (e) { S.rev = BASE; DIRTY = true; saveTimer = setTimeout(pushState, 5000); if (!keepalive) toast("Chưa lưu được tiến độ, app sẽ tự thử lại"); }
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
    if (d && Number(d.rev || 0) > BASE && !DIRTY && !SAVING) adoptState(d, "Đã cập nhật tiến độ từ thiết bị khác"); } catch (e) {}
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
// Gemini lỗi/quá tải/hết lượt: tạm nghỉ dùng AI 2 phút để app luôn phản hồi nhanh (chấm cơ bản)
function pauseAI(reason) {
  const first = !AI.pauseUntil || Date.now() > AI.pauseUntil;
  AI.pauseUntil = Date.now() + 120e3;
  if (first) console.warn("AI tạm nghỉ:", reason);
}
let LAST_ENGINE = "", LAST_ENGINE_AT = 0, PROBE = null;
async function probeAI() {
  PROBE = "…"; render();
  try { const r = await timeoutFetch("/api/ai?probe=1", {}, 40000); PROBE = (await r.json()).list || []; } catch (e) { PROBE = [{name:"Kiểm tra", ok:false, error:"không kết nối được"}]; }
  render();
}
async function gemini(system, prompt, json = true, history, ms = 30000) {
  const contents = history || [{role:"user", parts:[{text:prompt}]}];
  let r;
  try { r = await timeoutFetch("/api/ai", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({system, contents, json, heavy:ms > 60000})}, ms); }
  catch (e) { pauseAI(e.name === "AbortError" ? "phản hồi quá chậm" : "mất kết nối"); throw e; }
  const d = await r.json().catch(() => ({}));
  if (!r.ok && !d.quota && (d.busy || r.status >= 500)) pauseAI(d.error ? "quá tải" : "lỗi " + r.status);
  if (!r.ok) { if (d.quota) { AI = {on:false, quota:true, quotaAt:Date.now(), msg:d.error}; toast("Đã hết lượt Gemini miễn phí. Tạm dùng nội dung mẫu, app sẽ tự thử lại sau 5 phút."); }
    throw new Error(d.error || ("Gemini lỗi " + r.status)); }
  if (d.engine) { LAST_ENGINE = d.engine; LAST_ENGINE_AT = Date.now(); }
  if (!json) return d.text;
  return JSON.parse(String(d.text).replace(/^```(json)?|```$/g, "").trim());
}
const timeoutFetch = (url, opt = {}, ms = 15000) => { const c = new AbortController(); const t = setTimeout(() => c.abort(), ms); return fetch(url, {...opt, signal:c.signal}).finally(() => clearTimeout(t)); };
async function checkAI() {
  try { const r = await timeoutFetch("/api/ai", {}, 12000); const d = await r.json(); AI = {on:!!d.ok, busy:!!d.busy, msg:d.ok ? (d.busy ? d.error : "") : (d.error || "không rõ lỗi")}; }
  catch (e) { AI = {on:false, msg:e.name === "AbortError" ? "Gemini phản hồi quá chậm, sẽ tự thử lại sau" : "không gọi được server"}; }
}
const aiOn = () => AI.on && !(AI.pauseUntil && Date.now() < AI.pauseUntil);
const goalName = () => (GOALS.find(g => g[0] === S.profile?.goal) || [, ""])[1];
const fieldName = () => (S.profile?.fields || []).join(", ");
const focusName = () => goalName() + (fieldName() ? " · " + fieldName() : "");
const subList = () => (S.profile?.subs || []).map(x => x.split(": ").slice(1).join(": "));
// Mỗi buổi xoay vòng một tình huống người học đã chọn
const nextSituation = () => { const a = S.profile?.subs || []; return a.length ? a[doneN() % a.length] : ""; };
const diffText = () => S.difficulty > 0 ? "Người học đang tiến bộ nhanh: tăng độ khó một chút." : S.difficulty < 0 ? "Người học đang gặp khó: giữ câu ngắn, từ thông dụng." : "";
const TEACHER = () => `Bạn là giáo viên tiếng Anh cho người Việt. Trình độ người học: ${S.level}. Mục tiêu: ${goalName()}. Lĩnh vực: ${fieldName() || "chung"}.${S.profile?.job ? ` Vị trí công việc: ${S.profile.job}.` : ""} Các tình huống người học hay gặp: ${subList().join(", ") || "chung"}. Người học tự mô tả: ${S.profile?.interest || "không có"}. ${diffText()} Ví dụ và tình huống luôn bám sát lĩnh vực này. Giải thích ngắn gọn bằng tiếng Việt.`;

/* =====================================================================
   SPACED REPETITION (SM-2)
   ===================================================================== */
function addCard(w, src, example) {
  w = normWord(w); const k = w.w.toLowerCase();
  if (!S.cards[k]) S.cards[k] = {w, ef:2.5, int:0, rep:0, lapses:0, due:Date.now(), src, added:today(), example:example || ""};
  else if (example) S.cards[k].example = example;
  return S.cards[k];
}
function review(word, q) { // q: 1 Quên · 3 Khó · 4 Nhớ · 5 Dễ
  const c = S.cards[String(word).toLowerCase()]; if (!c) return;
  if (q < 3) { c.rep = 0; c.int = 0; c.lapses++; c.due = Date.now() + 10 * 60e3; }
  else { c.rep++; c.int = c.rep === 1 ? 1 : c.rep === 2 ? 3 : Math.round(c.int * c.ef);
    if (q === 3) c.int = Math.max(1, Math.round(c.int * .6));
    c.ef = Math.max(1.3, c.ef + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)); c.due = Date.now() + c.int * 864e5; }
  c.last = Date.now(); save();
}
const cardList = () => Object.values(S.cards);
const dueCards = () => cardList().filter(c => c.due <= Date.now()).sort((a, b) => b.lapses - a.lapses || a.due - b.due);
const hardCards = () => cardList().filter(c => c.lapses >= 2 || (c.ef < 2.1 && c.rep > 0));
const cardState = c => c.rep === 0 && !c.last ? "Mới" : c.int >= 21 ? "Đã thuộc" : c.int >= 3 ? "Đang nhớ" : "Đang học";

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
  const ds = new Set(S.sessions.map(s => s.date)); let k = 0; const d = new Date();
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
  if (pos >= seq.length) { les.topic = "Ôn lại: " + les.topic; les.review = true; }
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
    les = {level:S.level, topic:"Buổi ôn tập: củng cố phần chưa vững", scenario:"Ôn lại các từ bạn trả lời sai trong bài kiểm tra", remedial:true, words:ws, grammar:g,
      translations:ws.slice(0, 4).map(w => ({src:w.ex, ref:w.ex_vi || w.vi, dir:"en-vi"})),
      roleplay:{ai_role:"a friendly English tutor", user_role:"Người học", setting:"Trò chuyện tự do với gia sư để dùng lại các từ vừa ôn.",
        tasks:["Dùng ít nhất 3 từ vừa ôn", "Kể về một việc bạn làm tuần này", "Đặt một câu hỏi cho gia sư"], opening:"Hi! Let's practise the words from your review today. How was your week?"}};
    S.remedial = [];
  } else if (aiOn()) {
    try {
      const used = Object.keys(S.cards).slice(-80).join(", ");
      const prev = Object.values(S.lessons).slice(-12).map(l => l.topic + " (" + (l.grammar?.name || "") + ")").join("; ");
      const n = doneN() + 1;
      const j = await Promise.race([new Promise((_, rej) => { cancelWait = () => rej(new Error("skip")); }), gemini(TEACHER(),
`Soạn buổi học số ${n}/${S.path.total} của khóa ${S.path.from} → ${S.path.to}.
Bài đã học (không lặp chủ đề và điểm ngữ pháp): ${prev || "(chưa có)"}.
Từ đã học (không lặp lại): ${used || "(chưa có)"}.
${nextSituation() ? `TÌNH HUỐNG CỦA BUỔI NÀY: "${nextSituation()}". Toàn bộ chủ đề, từ vựng, câu dịch và role-play phải xoay quanh đúng tình huống này${S.profile?.job ? `, từ góc nhìn của người làm ${S.profile.job}` : ""}.` : "Chủ đề, từ vựng, câu dịch và role-play phải là tình huống thực tế trong lĩnh vực của người học."} Độ khó tăng dần theo số buổi.
Trả JSON đúng cấu trúc:
{"topic":"tên chủ đề tiếng Việt","scenario":"bối cảnh 1 câu tiếng Việt",
"words":[{"w":"từ hoặc cụm từ","ipa":"IPA","pos":"từ loại tiếng Việt","vi":"nghĩa tiếng Việt","ex":"câu ví dụ tiếng Anh","ex_vi":"dịch câu ví dụ"}] (đúng 8 mục),
"grammar":{"name":"tên điểm ngữ pháp","pattern":"công thức","note":"giải thích 2-3 câu tiếng Việt","quiz":[{"q":"câu có chỗ trống ___","opts":["4 lựa chọn"],"ans":0,"explain":"giải thích ngắn"}] (đúng 3 câu, đáp án ở vị trí ngẫu nhiên)},
"translations":[{"src":"câu gốc","ref":"bản dịch mẫu","dir":"vi-en hoặc en-vi"}] (4 câu: 2 vi-en, 2 en-vi, có dùng từ và ngữ pháp của bài),
"roleplay":{"ai_role":"vai của AI, tiếng Anh","user_role":"vai người học, tiếng Việt","setting":"bối cảnh tiếng Việt","tasks":["3 nhiệm vụ tiếng Việt"],"opening":"câu mở đầu của AI, tiếng Anh"}}`, true, null, 150000)]);
      if (validLesson(j)) { les = j; les.ai = true; les.level = S.level; await fillIPA(les.words.map(normWord)).catch(() => {}); }
    } catch (e) { console.warn("Không sinh được bài:", e.message); if (e.name === "AbortError") e.message = "chờ quá lâu"; if (e.message !== "skip") toast("Gemini chưa soạn được bài (" + e.message + "). Dùng bài mẫu."); }
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
  return {type:"mcq", q:`"${w.w}"${w.ipa ? " " + w.ipa : ""} nghĩa là gì?`, opts, ans:opts.indexOf(w.vi), skill, word:w.w, speak:w.w};
}
function wordQ(card, pool) {
  const w = normWord(card); const opts = distinctOpts(w.w, pool.map(normWord).filter(x => x.w !== w.w).map(x => x.w), ["window","quickly","family","yesterday","beautiful"]);
  return {type:"mcq", q:`Từ nào có nghĩa là "${w.vi}"?`, opts, ans:opts.indexOf(w.w), skill:"vocab", word:w.w};
}
const gramQ = g => { const right = g.opts[g.ans], opts = shuffle(g.opts.slice()); return {type:"mcq", q:g.q, opts, ans:opts.indexOf(right), skill:"grammar", explain:g.explain, speak:g.q}; };
const spellQ = w => ({type:"type", q:`Viết từ tiếng Anh có nghĩa: "${w.vi}"`, ans:w.w, skill:"spelling", word:w.w, hint:w.w[0] + "… (" + w.w.length + " ký tự)" + (w.ipa ? " · phát âm " + w.ipa : "")});
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
function startPlacement() { Q = makeQuiz("placement", [], false); Q.pos = 1; quizPickPlacement(Q); view = "quiz"; render(); }
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
  Q.res.push({ok, skill:it.skill, word:it.word});
  if (it.word && Q.mode !== "vcheck") review(it.word, ok ? 4 : 1);
  if (Q.feedback) { Q.pick = {ok, ...extra}; render(); }
  else nextQ();
}
function nextQ() {
  Q.pick = null; Q.i++;
  if (Q.mode === "placement") {
    const r = Q.res[Q.res.length - 1]; Q.pos = Math.max(0, Math.min(4, Q.pos + (r.ok ? 1 : -1)));
    if (Q.i < PLACEMENT_LEN) quizPickPlacement(Q);
  }
  if (Q.i >= Q.items.length) return finishQuiz();
  render(); setTimeout(() => $("#qin")?.focus(), 30);
}
function finishQuiz() {
  const q = Q, ok = q.res.filter(r => r.ok).length, p = pct(ok, q.res.length);
  if (q.mode === "placement") { S.placement = {level:placementLevel(q), correct:ok, total:q.res.length, date:today()}; save(); view = "placeResult"; Q = null; return render(); }
  if (q.mode === "warm") { L().scores.review = p; L().warmDone = true; L().step = 1; Q = null; save(); return render(); }
  if (q.mode === "vcheck") { L().scores.vocab = p; L().step = 2; Q = null; save(); return render(); }
  if (q.mode === "unit") return finishUnit(q);
  if (q.mode === "review") { q.done = true; render(); }
}

function vQuizBody(q, opts = {}) {
  const it = q.items[q.i]; if (!it) return "";
  const pk = q.pick;
  let body;
  if (it.type === "mcq") {
    body = `<div class="opts">${it.opts.map((o, k) => {
      let cls = ""; if (pk) { if (k === it.ans) cls = "right"; else if (k === pk.pick) cls = "wrong"; }
      return `<button class="opt ${cls}" data-a="pick" data-v="${k}" ${pk ? "disabled" : ""}><span class="key">${"ABCD"[k]}</span><span>${esc(o)}</span></button>`; }).join("")}</div>`;
  } else if (it.type === "speak") {
    body = `<div class="row center"><button data-a="speak" data-v="${esc(it.ans)}">🔊 Nghe mẫu</button><button data-a="slow" data-v="${esc(it.ans)}">🐢 Nghe chậm</button>
      <button class="mic big ${UI.rec === "q" ? "on" : ""}" data-a="qMic" ${pk || !SR ? "disabled" : ""}>${UI.rec === "q" ? "● Đang nghe, bấm để dừng" : "🎤 Bấm rồi đọc to câu trên"}</button></div>
      ${UI.rec === "q" ? `<p class="live center" id="live">Hãy đọc...</p>` : ""}${SR ? "" : `<p class="muted small center">Trình duyệt này không hỗ trợ micro.</p>`}`;
  } else {
    const area = it.type === "trans" || it.type === "dict";
    const label = it.type === "trans" ? `<span class="tag">${it.dir === "vi-en" ? "Dịch sang tiếng Anh" : "Dịch sang tiếng Việt"}</span>` : it.hint ? `<span class="muted small">Gợi ý: ${esc(it.hint)}</span>` : "";
    body = `<div class="field">${label}
      <${area ? "textarea" : "input"} id="qin" data-enter="submitQ" autocomplete="off" spellcheck="false" ${pk ? "disabled" : ""} placeholder="${it.type === "trans" ? "Bản dịch của bạn" : it.type === "dict" ? "Gõ lại câu bạn nghe được" : "Gõ từ tiếng Anh"}">${area ? esc(pk?.pick || "") + "</textarea>" : ""}
      ${pk ? "" : `<button class="primary" data-a="submitQ" ${q.busy ? "disabled" : ""}>${q.busy ? `<span class="spin"></span> Đang chấm` : "Trả lời"}</button>`}</div>`;
    if (!area && pk) setTimeout(() => { const i = $("#qin"); if (i) i.value = pk.pick; }, 0);
  }
  let fb = "";
  if (pk) {
    let inner;
    if (it.type === "speak") inner = pronHtml(pk.pron);
    else if (it.type === "dict") inner = dictHtml(pk.dict);
    else { const right = it.type === "mcq" ? it.opts[it.ans] : it.ans;
      inner = `<div class="fb ${pk.ok ? "good" : "bad"}"><b>${pk.ok ? (pk.close ? "Đúng (có lỗi chính tả nhỏ)" : "Chính xác!") : "Chưa đúng."}</b>
        ${!pk.ok || it.type === "trans" || it.autoplay ? ` Đáp án: <b>${esc(right)}</b>` : ""}${it.autoplay && it.word ? ` · từ vừa nghe: <b>${esc(it.word)}</b>` : ""}
        ${it.explain ? `<br>${esc(it.explain)}` : ""}${pk.grade ? `<br>${esc(pk.grade.note || "")}` : ""}</div>`; }
    fb = inner + `<button class="primary" data-a="nextQ" id="nextBtn">${q.i + 1 >= q.items.length && q.mode !== "placement" ? "Xem kết quả" : "Câu tiếp theo"}</button>`;
  }
  const qText = it.autoplay ? esc(it.q) : (it.type === "trans" && it.dir === "en-vi") || it.type === "speak" ? tw(it.q) : esc(it.q);
  const listenRow = it.autoplay ? `<div class="row center"><button class="round big-round" data-a="speak" data-v="${esc(it.speak)}" aria-label="Nghe lại">🔊</button><button class="mini" data-a="slow" data-v="${esc(it.speak)}">🐢 Nghe chậm</button></div>` : "";
  return `<div class="qtop">
     ${opts.exit ? `<button class="ghost" data-a="${opts.exit}">← Thoát</button>` : "<span></span>"}
     <div class="qcount"><span class="eyebrow">Câu ${q.i + 1}/${q.mode === "placement" ? PLACEMENT_LEN : q.items.length}</span><b class="timer" data-start="${q.start}">${fmtTime(Date.now() - q.start)}</b></div>
     ${it.speak && !it.autoplay && it.type !== "speak" ? `<button class="round" data-a="speak" data-v="${esc(it.speak)}" aria-label="Nghe">🔊</button>` : "<span></span>"}</div>
   <div class="qtext" ${(it.type === "trans" && it.dir === "en-vi") || it.type === "speak" ? "" : "data-notap"}>${qText}</div>${listenRow}${body}${fb}`;
}

/* =====================================================================
   CHẤM ĐIỂM
   ===================================================================== */
async function gradeSentence(word, text) {
  if (aiOn()) { try { const j = await gemini(TEACHER(),
`Từ mục tiêu: "${word}". Câu người học viết: "${text}".
Chấm theo rubric: ngữ pháp 4 điểm, dùng từ mục tiêu đúng nghĩa 4 điểm, tự nhiên 2 điểm. Không bắt lỗi văn phong vượt trình độ ${S.level}.
Trả JSON {"score":0-10,"corrected":"câu đã sửa (giữ nguyên nếu đúng)","errors":[{"type":"ngữ pháp|dùng từ|chính tả|tự nhiên","fix":"phần sửa","explain":"giải thích ngắn tiếng Việt"}],"note":"nhận xét 1 câu tiếng Việt"}`);
    if (typeof j.score === "number") return j; } catch (e) {} }
  const has = clean(text).includes(clean(word).split(" ")[0]), len = norm(text).length;
  const sc = Math.min(10, (has ? 5 : 1) + (len >= 6 ? 3 : len >= 4 ? 2 : 0) + (/^[A-Z].*[.?!]$/.test(text.trim()) ? 2 : 0));
  return {score:sc, corrected:text, errors:[], note:!has ? `Câu chưa dùng từ "${word}".` : sc >= 8 ? "Câu dùng đúng từ mục tiêu." : "Hãy viết câu đầy đủ hơn: có chủ ngữ, động từ, viết hoa đầu câu và dấu chấm cuối câu.", basic:true};
}
async function gradeTrans(t, text) {
  const src = t.src || t.q, ref = t.ref || t.ans;
  if (aiOn()) { try { const j = await gemini(TEACHER(),
`Câu gốc: "${src}". Bản dịch tham khảo: "${ref}". Bản dịch của người học: "${text}".
Chấm theo mức độ đúng ý (6 điểm) và đúng ngữ pháp, tự nhiên (4 điểm). Chấp nhận cách dịch khác nếu đúng nghĩa.
Trả JSON {"score":0-10,"note":"nhận xét ngắn tiếng Việt, chỉ ra lỗi nếu có","better":"bản dịch tốt hơn dựa trên câu của người học"}`);
    if (typeof j.score === "number") return j; } catch (e) {} }
  const a = norm(text), b = norm(ref), hit = b.filter(x => a.includes(x)).length / Math.max(1, b.length);
  const sc = Math.round(hit * 10);
  return {score:sc, note:sc >= 7 ? "Bản dịch sát ý." : "Bản dịch còn thiếu ý, hãy so với câu tham khảo.", better:ref, basic:true};
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
    if (pw[3]) items.push({...meaningQ(pw[3], pool, "listening"), q:"Nghe và chọn nghĩa đúng", speak:pw[3].w, autoplay:true});
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
function vcheckItems() { const ws = L().les.words, pool = [...ws, ...cardList().map(c => c.w)]; return shuffle(ws).slice(0, 4).map((w, k) => k % 2 ? wordQ(w, pool) : meaningQ(w, pool)); }
function setStep(n) { const l = L(); l.max = Math.max(l.max || 0, l.step, n); l.step = n; Q = null; if (!(n < l.max && n < 2)) restoreLessonQuiz(); save(); render(); scrollTo(0, 0); }
// Xem lại bước đã học: bấm thanh tiến trình. Bước 1–2 (đã làm quiz) hiện bản tóm tắt thay vì làm lại.
function reviewPanel(k) {
  const l = L(), ws = l.les.words, g = l.les.grammar;
  if (k === 0) return `<section class="panel"><h2>Xem lại: Ôn bài cũ${l.prevTopic ? ` · ${esc(l.prevTopic)}` : ""}</h2>
    ${(l.warmItems || []).length ? `<ol class="revlist">${l.warmItems.map(it => `<li><b>${esc(it.q)}</b><br><span class="tag good">${esc(it.opts ? it.opts[it.ans] : it.ans)}</span>${it.explain ? ` <span class="muted small">${esc(it.explain)}</span>` : ""}</li>`).join("")}</ol>` : `<p class="muted">Buổi này không có phần ôn bài cũ.</p>`}</section>`;
  return `<section class="panel"><h2>Xem lại: Từ vựng & ngữ pháp</h2>
    <div class="revlist">${ws.map(w => `<div class="revword"><div class="row nowrap"><b>${esc(w.w)}</b><button class="round sm" data-a="speak" data-v="${esc(w.w)}" aria-label="Nghe">🔊</button><span class="ipa">${esc(w.ipa || "")}</span>${w.pos ? `<span class="tag">${esc(w.pos)}</span>` : ""}</div>
      <div>${esc(w.vi)}</div>${w.ex ? `<div class="muted small"><i>${esc(w.ex)}</i>${w.ex_vi ? " · " + esc(w.ex_vi) : ""}</div>` : ""}</div>`).join("")}</div></section>
    ${g ? `<section class="panel"><h3>Ngữ pháp: ${esc(g.name || "")}</h3>${g.pattern ? `<p><code>${esc(g.pattern)}</code></p>` : ""}<p>${esc(g.note || "")}</p>
      ${(g.quiz || []).map(qz => `<p class="small">• ${esc(qz.q)} → <b>${esc((qz.opts || [])[qz.ans] ?? "")}</b>${qz.explain ? ` <span class="muted">(${esc(qz.explain)})</span>` : ""}</p>`).join("")}</section>` : ""}`;
}

function vLesson() {
  const l = L(); if (!l) { view = "home"; return vHome(); }
  const mx = l.max = Math.max(l.max || 0, l.step);
  const head = `<header class="lhead"><div class="row between"><button class="ghost" data-a="exitLesson">← Lưu & thoát</button>
     <span class="muted small">${fmtTime(Date.now() - l.started)}</span></div>
     <div class="lesson-title hue-${topicStk(l.les.topic)[1]}">${stk(topicStk(l.les.topic)[0], 64, "", -8)}<div class="grow"><p class="eyebrow">${l.les.remedial ? "Buổi ôn tập" : "Buổi " + (doneN() + 1)}${l.les.level ? " · " + l.les.level : ""} · Bước ${l.step + 1}/6: ${STEPS[l.step]}</p><h2>${esc(l.les.topic)}</h2></div>${stk(STEP_STK[l.step], 46, "step-stk", 10)}</div>
     <ol class="stepper">${STEPS.map((s, k) => { const reach = k <= mx && k !== l.step; return `<li class="${k < mx || k < l.step ? "done" : ""} ${k === l.step ? "cur" : ""} ${reach ? "go" : ""}" ${reach ? `data-a="step" data-v="${k}" role="button" tabindex="0" title="Xem lại bước ${k + 1}"` : ""}><span>${k + 1}</span><em>${s}</em></li>`; }).join("")}</ol>
     ${mx > 0 ? `<p class="muted small center">Bấm vào thanh tiến trình để quay lại xem bước đã học.</p>` : ""}</header>`;
  const back = l.step < mx ? `<div class="backbar"><span>👀 Đang xem lại bước ${l.step + 1}: <b>${STEPS[l.step]}</b></span><button class="primary mini" data-a="step" data-v="${mx}">Về bước đang học (${mx + 1}) →</button></div>` : "";
  const body = l.step < mx && l.step < 2 ? reviewPanel(l.step) : [step1, step2, step3, step4, step5, step6][l.step]();
  return `<div class="wrap narrow">${head}${back}${body}</div>`;
}
// Bước 1: Ôn bài cũ
function step1() {
  const l = L();
  if (!l.warmItems.length) return `<section class="panel"><h2>Ôn bài cũ</h2><p>Đây là buổi đầu tiên nên chưa có bài cũ để ôn.</p><button class="primary" data-a="step" data-v="1">Sang từ vựng mới</button></section>`;
  return `<section class="panel"><h2>Ôn bài cũ${l.prevTopic ? `: ${esc(l.prevTopic)}` : ""}</h2><p class="muted">Ôn nhanh từ vựng và ngữ pháp buổi trước. Câu sai sẽ được đưa vào flashcard để ôn sớm hơn.</p></section>
    <section class="panel quiz">${vQuizBody(Q)}</section>`;
}
// Bước 2: Từ vựng mới + ngữ pháp + kiểm tra nhanh
function step2() {
  const l = L(), ws = l.les.words, n = ws.length;
  if (l.vi < n) {
    const w = ws[l.vi];
    return `<section class="panel"><div class="row between"><span class="tag">Từ ${l.vi + 1}/${n}</span><div class="dots">${ws.map((_, k) => `<i class="${k <= l.vi ? "on" : ""}"></i>`).join("")}</div></div>
      <div class="vocab">${stk(topicStk(l.les.topic)[0], 70, "corner", 12)}<div class="row"><h2 class="word">${esc(w.w)}</h2><button class="round" data-a="speak" data-v="${esc(w.w)}" aria-label="Nghe">🔊</button></div>
      <div class="ipa">${esc(w.ipa)}${w.pos ? ` · <span class="tag">${esc(w.pos)}</span>` : ""}</div>
      <p class="meaning">${esc(w.vi)}</p>
      <div class="example"><p>${tw(w.ex)} <button class="mini" data-a="speak" data-v="${esc(w.ex)}">🔊 Nghe câu</button> </p><div>${trBtn(w.ex, "en", "vi", "Dịch câu")}</div>${w.ex_vi ? `<p class="muted">${twv(w.ex_vi)}</p>` : ""}</div></div>
      ${speakBox(w, l.vi)}
      <div class="row">${l.vi > 0 ? `<button data-a="vprev">Từ trước</button>` : ""}<button class="primary" data-a="vnext">${l.vi < n - 1 ? "Từ tiếp theo" : "Xem điểm ngữ pháp"}</button></div></section>`;
  }
  if (l.vi === n) {
    const g = l.les.grammar;
    return `<section class="panel"><span class="eyebrow">Ngữ pháp trọng tâm</span><h2>${esc(g.name)}</h2>
      ${g.pattern ? `<div class="pattern">${esc(g.pattern)}</div>` : ""}<p>${twv(g.note || "")}</p>
      ${(g.quiz || []).length ? `<p class="muted small">Điểm ngữ pháp này sẽ được ôn lại ở đầu buổi sau.</p>` : ""}
      <div class="row"><button data-a="vprev">Xem lại từ</button><button class="primary" data-a="vnext">Kiểm tra nhanh 4 câu</button></div></section>`;
  }
  return `<section class="panel"><h2>Kiểm tra nhanh từ mới</h2><p class="muted">Từ bạn học hôm nay đã được thêm vào flashcard.</p></section><section class="panel quiz">${vQuizBody(Q)}</section>`;
}
function speakBox(w, i) {
  const l = L(); l.pron = l.pron || {};
  const keys = [["w:" + i, "Đọc từ"], ["ex:" + i, "Đọc cả câu"]];
  return `<div class="speakbox"><p class="eyebrow">Luyện nghe – nói</p>
    <div class="row"><button class="mini" data-a="slow" data-v="${esc(w.ex)}">🐢 Nghe chậm câu ví dụ</button>
    ${keys.map(([k, t]) => `<button class="mini mic ${UI.rec === k ? "on" : ""}" data-a="pron" data-v="${k}" ${SR ? "" : "disabled"}>${UI.rec === k ? "● Đang nghe, bấm để dừng" : "🎤 " + t}</button>`).join("")}</div>
    ${keys.some(([k]) => UI.rec === k) ? `<p class="live" id="live">Hãy đọc to...</p>` : ""}
    ${keys.map(([k]) => l.pron[k] ? pronHtml(l.pron[k]) : "").join("")}
    ${SR ? "" : `<p class="muted small">Trình duyệt này chưa hỗ trợ nhận giọng nói. Hãy mở app bằng Chrome hoặc Edge.</p>`}</div>`;
}
// Bước 3: Tự đặt câu
function step3() {
  const l = L(), ws = l.les.words.slice(0, 4), graded = Object.keys(l.sent).length;
  return `<section class="panel"><h2>Tự đặt câu</h2><p class="muted">Viết một câu tiếng Anh với mỗi từ, càng gần với công việc và cuộc sống của bạn càng tốt. ${aiOn() ? "Gemini sẽ sửa lỗi và giải thích." : "Đang chấm cơ bản vì Gemini chưa hoạt động."}</p></section>
   ${ws.map((w, i) => { const r = l.sent[i]; return `<section class="panel"><div class="row between"><h3>${esc(w.w)} <span class="muted normal">· ${esc(w.vi)}</span></h3><button class="mini" data-a="speak" data-v="${esc(w.ex)}">Nghe ví dụ</button></div>
     <label class="sr" for="sent${i}">Câu với ${esc(w.w)}</label><textarea id="sent${i}" placeholder="Ví dụ gợi ý: ${esc(w.ex)}">${esc(r?.text || "")}</textarea>${sentFb(r)}</section>`; }).join("")}
   <div class="row sticky-actions"><button class="primary" data-a="grade3" id="g3">${graded ? "Chấm lại" : "Chấm câu"}</button>${graded ? `<button data-a="step" data-v="3">Sang bước dịch câu →</button>` : ""}</div>`;
}
function sentFb(r) {
  if (!r || r.score == null) return "";
  return `<div class="fb ${r.score >= 7 ? "good" : "bad"}"><b>${r.score}/10</b> · ${esc(r.note || "")}
    ${r.corrected && clean(r.corrected) !== clean(r.text) ? `<br>Câu sửa: <i>${tw(r.corrected)}</i>` : ""}
    ${(r.errors || []).map(e => `<br>• <b>${esc(e.type || "")}</b>: ${esc(e.fix || "")}${e.explain ? ` · ${esc(e.explain)}` : ""}`).join("")}</div>`;
}
async function grade3() {
  const l = L(), ws = l.les.words.slice(0, 4), btn = $("#g3"); btn.disabled = true; btn.innerHTML = `<span class="spin"></span> Đang chấm`;
  const texts = ws.map((_, i) => $("#sent" + i).value.trim());
  if (!texts.some(Boolean)) { btn.disabled = false; btn.textContent = "Chấm câu"; return toast("Hãy viết ít nhất một câu"); }
  await Promise.all(ws.map(async (w, i) => { if (!texts[i]) return; if (l.sent[i]?.text === texts[i]) return;
    const r = await gradeSentence(w.w, texts[i]); l.sent[i] = {text:texts[i], word:w.w, ...r};
    if (r.score >= 7) addCard(w, "lesson", r.corrected || texts[i]); else { const c = S.cards[w.w.toLowerCase()]; if (c) c.due = Date.now(); } }));
  const v = Object.values(l.sent); l.scores.sentence = Math.round(avg(v.map(x => x.score)) * 10);
  save(); render();
}
// Bước 4: Dịch câu
function step4() {
  const l = L(), tr = l.les.translations, graded = Object.keys(l.trans).length;
  return `<section class="panel"><h2>Dịch câu</h2><p class="muted">Dịch theo ý, không cần khớp từng chữ. Bấm vào từng từ để xem nghĩa và phiên âm; nút "Xem bản dịch máy" dịch cả câu ngay tại đây (nên tự dịch trước rồi mới so).</p></section>
   ${tr.map((t, i) => { const r = l.trans[i]; return `<section class="panel"><span class="tag">${t.dir === "vi-en" ? "Việt → Anh" : "Anh → Việt"}</span>
     <h3 class="src">${t.dir === "en-vi" ? tw(t.src) : twv(t.src)}</h3>
     <div class="row">${trBtn(t.src, t.dir === "vi-en" ? "vi" : "en", t.dir === "vi-en" ? "en" : "vi", "Xem bản dịch máy")}${t.dir === "en-vi" ? `<button class="mini" data-a="speak" data-v="${esc(t.src)}">🔊 Nghe câu</button>` : ""}</div>
     <label class="sr" for="tr${i}">Bản dịch</label><textarea id="tr${i}" rows="2" placeholder="Bản dịch của bạn">${esc(r?.text || "")}</textarea>
     ${r ? `<div class="fb ${r.score >= 7 ? "good" : "bad"}"><b>${r.score}/10</b> · ${esc(r.note || "")}<br>Tham khảo: <i>${t.dir === "vi-en" ? tw(t.ref) : esc(t.ref)}</i>${r.better && clean(r.better) !== clean(t.ref) ? `<br>Gợi ý từ câu của bạn: <i>${esc(r.better)}</i>` : ""}</div>` : ""}</section>`; }).join("")}
   <section class="panel"><h2>Nghe và chép</h2><p class="muted">Nghe câu tiếng Anh rồi gõ lại. Có thể nghe nhiều lần, nghe chậm nếu cần.</p></section>
   ${dictRefs(l).map((ref, i) => { const r = l.dict?.[i]; return `<section class="panel"><span class="tag">Câu nghe ${i + 1}</span>
     <div class="row"><button data-a="speak" data-v="${esc(ref)}">🔊 Nghe</button><button data-a="slow" data-v="${esc(ref)}">🐢 Nghe chậm</button></div>
     <label class="sr" for="dc${i}">Chép lại câu ${i + 1}</label><textarea id="dc${i}" rows="2" placeholder="Gõ lại câu bạn nghe được">${esc(r?.text || "")}</textarea>${r ? dictHtml(r) : ""}</section>`; }).join("")}
   <div class="row sticky-actions"><button class="primary" data-a="grade4" id="g4">${graded || l.dict ? "Chấm lại" : "Chấm bài"}</button>${graded || l.dict ? `<button data-a="step" data-v="4">Sang role-play →</button>` : ""}</div>`;
}
const dictRefs = l => (l.dictRefs = l.dictRefs || shuffle(l.les.words.filter(w => w.ex)).slice(0, 2).map(w => w.ex));
async function grade4() {
  const l = L(), tr = l.les.translations, btn = $("#g4"); btn.disabled = true; btn.innerHTML = `<span class="spin"></span> Đang chấm`;
  const texts = tr.map((_, i) => $("#tr" + i).value.trim()), dts = dictRefs(l).map((_, i) => $("#dc" + i)?.value.trim() || "");
  if (!texts.some(Boolean) && !dts.some(Boolean)) { btn.disabled = false; btn.textContent = "Chấm bài"; return toast("Hãy dịch hoặc chép ít nhất một câu"); }
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
    return `<section class="panel"><h2>Kết quả role-play</h2><div class="stats">${[["Trôi chảy", e.fluency], ["Chính xác", e.accuracy], ["Hoàn thành nhiệm vụ", e.task_score]].map(([k, v]) => `<div class="stat"><b>${v}/10</b><span>${k}</span></div>`).join("")}</div>
      <p>${esc(e.comment_vi || "")}</p>${(e.better_phrases || []).map(b => `<div class="fb">Bạn nói: <i>${esc(b.you)}</i><br>Tự nhiên hơn: <b>${tw(b.better)}</b></div>`).join("")}
      <div class="row"><button data-a="rpAgain">Trò chuyện thêm</button><button class="primary" data-a="step" data-v="5">Xem tổng kết →</button></div></section>`;
  }
  return `<section class="panel rp"><div class="row between"><h2>Role-play</h2><span class="muted small">Bạn: ${esc(rp.user_role || "")}</span></div>
    <p class="muted">${esc(rp.setting || "")}</p>
    <ul class="tasks">${(rp.tasks || []).map((t, k) => `<li class="${l.tasksDone.includes(k) ? "done" : ""}">${esc(t)}</li>`).join("")}</ul>
    <p class="small">Từ đã dùng: ${l.les.words.map(w => `<span class="chip ${used.includes(w.w) ? "on" : ""}">${esc(w.w)}</span>`).join(" ")}</p></section>
   <section class="panel"><div class="chat" id="chat">${l.chat.map((m, mi) => `<div class="msg ${m.role}">${m.role === "ai" ? (hideText() && !(l.reveal || []).includes(mi) ? `<span class="muted">(Chữ đã ẩn, hãy nghe)</span> <button class="mini" data-a="reveal" data-v="${mi}">Hiện chữ</button>` : tw(m.text)) : (m.voice ? "🎤 " : "") + esc(m.text)}${m.fix ? `<span class="fix">Nên nói: ${esc(m.fix)}</span>` : ""}${m.role === "ai" ? ` <button class="mini" data-a="speak" data-v="${esc(m.text)}" aria-label="Nghe">🔊</button>${trBtn(m.text, "en", "vi")}` : ""}</div>`).join("")}
     ${l.rpBusy ? `<div class="msg ai"><span class="spin"></span></div>` : ""}</div>
    ${l.hint ? `<div class="fb">Gợi ý: <b>${tw(l.hint.en)}</b>${l.hint.vi ? `<br><span class="muted">${twv(l.hint.vi)}</span>` : ""}</div>` : ""}
    <div class="row nowrap"><label class="sr" for="rpIn">Câu trả lời</label><input id="rpIn" data-enter="rpSend" placeholder="Trả lời bằng tiếng Anh..." autocomplete="off" ${l.rpBusy ? "disabled" : ""}>
      <button class="mic ${UI.rec === "rp" ? "on" : ""}" data-a="rpMic" ${SR && !l.rpBusy ? "" : "disabled"} aria-label="Nói">${UI.rec === "rp" ? "● Dừng" : "🎤 Nói"}</button>
      <button class="primary" data-a="rpSend" ${l.rpBusy ? "disabled" : ""}>Gửi</button></div>
    ${UI.rec === "rp" ? `<p class="live" id="live">Hãy nói bằng tiếng Anh...</p>` : ""}
    <div class="row small"><button class="mini seg ${autoSpeak() ? "sel" : ""}" data-a="autospeak">🔈 Tự đọc câu của AI</button><button class="mini seg ${hideText() ? "sel" : ""}" data-a="hidetext">🙈 Ẩn chữ để luyện nghe</button>
      ${SR ? `<span class="muted">Bấm 🎤 Nói để trả lời bằng giọng nói.</span>` : `<span class="muted">Mở bằng Chrome hoặc Edge để nói bằng micro.</span>`}</div>
    <div class="row"><button data-a="rpHint">Gợi ý câu trả lời</button>${turns >= 3 ? `<button class="primary" data-a="rpEnd" id="rpEndBtn">Kết thúc & chấm điểm</button>` : `<span class="muted small">Trao đổi ít nhất 3 lượt để kết thúc (${turns}/3).</span>`}</div></section>`;
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
  if (aiOn()) { try { l.hint = await gemini(TEACHER(), `Role-play: AI là ${rp.ai_role}, người học là ${rp.user_role}. Nhiệm vụ: ${(rp.tasks || []).join("; ")}.
Hội thoại: ${l.chat.map(m => (m.role === "ai" ? "AI: " : "Học viên: ") + m.text).join("\n")}
Gợi ý MỘT câu trả lời tiếp theo cho học viên, phù hợp trình độ ${S.level}${unused ? `, có dùng từ "${unused.w}"` : ""}. Trả JSON {"en":"câu tiếng Anh","vi":"nghĩa tiếng Việt"}`); save(); return render(); } catch (e) {} }
  l.hint = unused ? {en:unused.ex, vi:unused.ex_vi || ""} : {en:"Could you tell me more about that?", vi:"Bạn có thể nói thêm về điều đó không?"};
  render();
}
async function rpEnd() {
  const l = L(), rp = l.les.roleplay, btn = $("#rpEndBtn"); if (btn) { btn.disabled = true; btn.innerHTML = `<span class="spin"></span> Đang chấm`; }
  const userMsgs = l.chat.filter(m => m.role === "user");
  const used = l.les.words.filter(w => userMsgs.some(m => clean(m.text).includes(clean(w.w)))).length;
  let e = null;
  if (aiOn()) { try { e = await gemini(TEACHER(), `Đánh giá phần role-play của học viên (trình độ ${S.level}). AI đóng vai: ${rp.ai_role}. Nhiệm vụ: ${(rp.tasks || []).join("; ")}.
Hội thoại (câu có [nói] là học viên nói bằng giọng, được máy chuyển thành chữ nên có thể sai chính tả do nhận dạng; đừng trừ điểm lỗi chính tả ở những câu đó): ${l.chat.map(m => (m.role === "ai" ? "AI: " : m.voice ? "Học viên [nói]: " : "Học viên: ") + m.text).join("\n")}
Trả JSON {"fluency":0-10,"accuracy":0-10,"task_score":0-10,"comment_vi":"nhận xét 2 câu tiếng Việt","better_phrases":[{"you":"câu học viên đã nói","better":"cách nói tự nhiên hơn"}] (tối đa 3)}`); } catch (er) { e = null; } }
  if (!e || typeof e.fluency !== "number") {
    const avgLen = avg(userMsgs.map(m => norm(m.text).length));
    e = {fluency:Math.min(10, Math.round(3 + avgLen / 2)), accuracy:Math.max(3, 10 - l.chat.filter(m => m.fix).length * 2), task_score:Math.round(l.tasksDone.length / Math.max(1, (rp.tasks || []).length) * 10),
      comment_vi:`Bạn đã trao đổi ${userMsgs.length} lượt (${userMsgs.filter(m => m.voice).length} lượt nói bằng giọng) và dùng ${used}/${l.les.words.length} từ mới.`, better_phrases:l.chat.filter(m => m.fix).slice(0, 3).map(m => ({you:m.text, better:m.fix}))};
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
  const l = L(), sc = l.scores, keys = [["review","Ôn bài cũ"],["vocab","Kiểm tra từ"],["speaking","Phát âm"],["sentence","Đặt câu"],["translation","Dịch"],["listening","Nghe chép"],["roleplay","Role-play"]];
  const parts = keys.map(([k]) => sc[k]).filter(x => x != null), total = Math.round(avg(parts));
  const ms = lessonMistakes(l), g = l.les.grammar;
  const nextTest = (doneN() + 1) % 5 === 0;
  const stars = total >= 85 ? 3 : total >= 65 ? 2 : total >= 40 ? 1 : 0;
  return `<section class="panel summary-hero">${total >= 75 ? confetti() : ""}<div class="row nowrap">${mascot(total >= 60 ? "cheer" : "think", 110, "bob")}
     <div class="grow"><span class="eyebrow">Tổng kết buổi học</span><h2>${esc(l.les.topic)}</h2>
     <div class="stars">${[0, 1, 2].map(i => stk("star", 46, i < stars ? "" : "dim", (i - 1) * 12)).join("")}</div>
     <p class="muted">${stars === 3 ? "Xuất sắc! Bạn làm rất tốt." : stars === 2 ? "Tốt lắm! Thêm chút nữa là đạt 3 sao." : stars === 1 ? "Khá ổn. Ôn lại phần chưa vững nhé." : "Đừng nản, buổi sau sẽ tốt hơn!"}</p></div></div>
     <div class="scorebig"><b>${total}</b><span>điểm trung bình</span></div>
     <div class="bars">${keys.map(([k, n]) => `<div class="bar"><span>${n}</span><div><i style="width:${sc[k] ?? 0}%"></i></div><b>${sc[k] ?? "–"}</b></div>`).join("")}</div></section>
   <section class="panel"><h3>Từ vựng hôm nay (${l.les.words.length} từ, đã vào flashcard)</h3>
     <div class="wordgrid">${l.les.words.map(w => `<div><b>${esc(w.w)}</b><span class="ipa">${esc(w.ipa || "")}</span><span class="muted">${esc(w.vi)}</span></div>`).join("")}</div></section>
   <section class="panel"><h3>Ngữ pháp: ${esc(g.name)}</h3>${g.pattern ? `<div class="pattern">${esc(g.pattern)}</div>` : ""}<p class="muted">${twv(g.note || "")}</p></section>
   ${ms.length ? `<section class="panel"><h3>Lỗi cần nhớ</h3>${ms.map(m => `<div class="fb bad"><s>${esc(m.text)}</s><br><b>${esc(m.fix)}</b></div>`).join("")}</section>` : ""}
   <section class="panel"><p>${nextTest ? "<b>Buổi tới là bài kiểm tra định kỳ</b> sau 5 buổi học." : `Còn ${5 - (doneN() + 1) % 5} buổi nữa đến bài kiểm tra định kỳ.`} Bạn có ${dueCards().length} thẻ flashcard cần ôn.</p>
     <button class="primary" data-a="finishLesson" data-v="${total}">Hoàn thành buổi học</button></section>`;
}
function finishLesson(total) {
  const l = L();
  S.sessions.push({idx:l.idx, course:l.course, date:today(), topic:l.les.topic, words:l.les.words.map(w => w.w), grammar:l.les.grammar?.name || "",
    scores:l.scores, total:Number(total), mistakes:lessonMistakes(l), dur:Math.round((Date.now() - l.started) / 60000), remedial:!!l.les.remedial, unit:Math.floor(Math.max(0, doneN() - (l.les.remedial ? 1 : 0)) / 5)});
  S.current = null; Q = null; checkBadges(); save(); view = "home"; render(); scrollTo(0, 0);
  toast("Đã lưu buổi học. Giỏi lắm!");
  prefetchNext();
}

/* =====================================================================
   KIỂM TRA ĐỊNH KỲ (sau mỗi 5 buổi)
   ===================================================================== */
function startUnit() {
  const last5 = regSessions().slice(-5), lessons = last5.map(s => S.lessons[s.idx]).filter(Boolean);
  const words = lessons.flatMap(l => l.words), pool = [...words, ...cardList().map(c => c.w)];
  const items = [
    ...shuffle(words).slice(0, 8).map((w, k) => k % 2 ? wordQ(w, pool) : meaningQ(w, pool)),
    ...shuffle(lessons.flatMap(l => l.grammar?.quiz || [])).slice(0, 5).map(gramQ),
    ...shuffle(words).slice(0, 4).map(spellQ),
    ...shuffle(lessons.flatMap(l => (l.translations || []).filter(t => t.dir === "vi-en"))).slice(0, 3).map(transQ),
    ...shuffle(words).slice(0, 3).map(w => ({...meaningQ(w, pool, "listening"), q:"Nghe và chọn nghĩa đúng", speak:w.w, autoplay:true})),
    ...shuffle(words.filter(w => w.ex)).slice(0, 2).map(w => ({type:"dict", q:"Nghe và chép lại câu", ans:w.ex, speak:w.ex, autoplay:true, skill:"listening"})),
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
  if (p >= 85) { S.difficulty = Math.min(1, S.difficulty + 1); adj = "Bạn nắm bài rất tốt. Các buổi tới sẽ khó hơn một chút."; }
  else if (p >= 60) { adj = "Bạn đang theo kịp lộ trình. Giữ nguyên nhịp độ."; }
  else { S.difficulty = Math.max(-1, S.difficulty - 1); S.remedial = wrongWords.map(w => S.cards[w.toLowerCase()]?.w).filter(Boolean); adj = "Hệ thống đã thêm 1 buổi ôn tập vào lộ trình để củng cố các từ còn sai."; }
  const t = {course:S.path.id, unit:q.unit, date:today(), score:p, skills:ss, wrong:wrongWords, dur:Math.round((Date.now() - q.start) / 60000), adj};
  S.tests.push(t); checkBadges(); save();
  Q = null; view = "unitResult"; UI.lastTest = t; render();
}
function vUnitResult() {
  const t = UI.lastTest;
  return `<div class="wrap narrow"><section class="panel summary-hero">${t.score >= 85 ? confetti(56) : ""}<div class="row nowrap">${mascot(t.score >= 60 ? "cheer" : "think", 110, "bob")}${stk(t.score >= 85 ? "trophy" : t.score >= 60 ? "star" : "book", 70, "", -8)}</div><span class="eyebrow">Kiểm tra định kỳ · Unit ${t.unit}</span><div class="scorebig"><b>${t.score}%</b><span>${t.score >= 85 ? "Xuất sắc" : t.score >= 60 ? "Đạt" : "Cần ôn thêm"}</span></div>
    <div class="bars">${Object.entries(t.skills).map(([k, v]) => `<div class="bar"><span>${SKILL_VI[k] || k}</span><div><i style="width:${v}%"></i></div><b>${v}</b></div>`).join("")}</div>
    <p class="fb">${esc(t.adj)}</p>
    ${t.wrong.length ? `<h3>Từ cần ôn lại</h3><p>${t.wrong.map(w => `<span class="chip">${esc(w)}</span>`).join(" ")}</p>` : ""}
    <div class="row"><button class="primary" data-a="go" data-v="home">Về trang chủ</button>${t.wrong.length ? `<button data-a="go" data-v="review">Ôn flashcard ngay</button>` : ""}</div></section></div>`;
}

/* =====================================================================
   CÁC MÀN HÌNH
   ===================================================================== */
const newSv = (p) => p ? Object.assign({subs:[], job:""}, JSON.parse(JSON.stringify(p))) : {name:ME?.name || "", goal:"communication", fields:[], subs:[], job:"", minutes:30, interest:"", weak:[], remind:"20:00", deadline:""};
function vSurvey() {
  const s = SV, g = s.goal, edit = !!S.level;
  return `<div class="wrap narrow"><section class="panel hero with-art"><div class="hero-art">${mascot("happy", 116, "bob")}</div><span class="eyebrow">${edit ? "Cập nhật mục tiêu" : "Bước 1/2 · Khảo sát"}</span><h1>Bạn học tiếng Anh để làm gì?</h1>
    <p class="muted">Câu trả lời quyết định chủ đề, từ vựng và tình huống role-play trong từng buổi học.</p></section>
   <section class="panel"><label for="sv-name"><h3>Bạn tên gì?</h3></label><input id="sv-name" data-sv="name" value="${esc(s.name)}" placeholder="Tên để app xưng hô">
    <h3>Mục tiêu chính</h3><div class="choices">${GOALS.map(([k, t]) => `<button class="choice ${g === k ? "sel" : ""}" data-a="svGoal" data-v="${k}">${stk(GOAL_STK[k], 40, "", 0)}<span>${t}</span></button>`).join("")}</div>
    <h3>${g === "exam" ? "Kỳ thi bạn nhắm tới" : g === "work" ? "Lĩnh vực công việc" : g === "travel" ? "Hình thức đi nước ngoài" : "Bạn muốn giao tiếp trong tình huống nào"} <span class="muted normal">(chọn một hoặc nhiều)</span></h3>
    <div class="chips">${FIELDS[g].map(([f], k) => `<button class="chip-btn ${s.fields.includes(f) ? "sel" : ""}" data-a="svField" data-v="${k}">${f}</button>`).join("")}</div>
    ${s.fields.length ? `<div class="subs"><h3>${g === "exam" ? "Kỹ năng cần luyện nhiều nhất" : "Tình huống cụ thể bạn hay gặp"} <span class="muted normal">(chọn càng đúng, bài học càng sát)</span></h3>
      ${subGroups(s).map(f => `<div class="subgroup"><p class="eyebrow">${esc(f)}</p><div class="chips">${subsOf(g, f).map(x => { const key = f + ": " + x; return `<button class="chip-btn sm ${s.subs.includes(key) ? "sel" : ""}" data-a="svSub" data-v="${esc(key)}">${esc(x)}</button>`; }).join("")}</div></div>`).join("")}
      <div class="row"><button class="mini" data-a="svSubAll">Chọn tất cả</button>${s.subs.length ? `<span class="muted small">Đã chọn ${s.subs.length} tình huống</span>` : ""}</div></div>` : ""}
    ${g === "work" ? `<label for="sv-job"><h3>Vị trí công việc của bạn</h3></label><input id="sv-job" data-sv="job" value="${esc(s.job || "")}" placeholder="Ví dụ: QA Engineer, nhân viên lễ tân, kế toán">` : ""}
    <label for="sv-int"><h3>${g === "exam" ? "Điểm mục tiêu và kỹ năng cần nhất" : "Mô tả cụ thể hơn"} <span class="muted normal">(không bắt buộc)</span></h3></label>
    <input id="sv-int" data-sv="interest" placeholder="${DETAIL_HINT[g]}" value="${esc(s.interest)}">
    ${g === "exam" ? `<label for="sv-dl"><h3>Ngày thi <span class="muted normal">(để tính độ dài khóa học)</span></h3></label><input id="sv-dl" type="date" data-sv="deadline" value="${esc(s.deadline)}" class="short">` : ""}
    <h3>Thời gian học mỗi ngày</h3><div class="choices">${[15, 30, 45].map(m => `<button class="choice ${s.minutes === m ? "sel" : ""}" data-a="svMin" data-v="${m}">${m} phút</button>`).join("")}</div>
    <h3>Kỹ năng muốn cải thiện</h3><div class="chips">${["Nghe","Nói","Đọc","Viết"].map(k => `<button class="chip-btn ${s.weak.includes(k) ? "sel" : ""}" data-a="svWeak" data-v="${k}">${k}</button>`).join("")}</div>
    <label for="sv-rm"><h3>Nhắc tôi học từ lúc</h3></label><input id="sv-rm" type="time" data-sv="remind" value="${esc(s.remind)}" class="short">
    <p class="muted small">Nếu chưa học, app nhắc mỗi tiếng từ giờ này đến 23:00. Đổi giờ và khoảng cách nhắc trong Cài đặt.</p>
    <div class="row">${edit ? `<button data-a="go" data-v="settings">Hủy</button>` : ""}<button class="primary" data-a="svSubmit" ${s.fields.length ? "" : "disabled"}>${!s.fields.length ? "Chọn ít nhất một lĩnh vực" : edit ? "Lưu mục tiêu" : "Tiếp tục: kiểm tra trình độ"}</button></div></section></div>`;
}
// Lần đầu dùng app: hỏi có bật thông báo nhắc học không
function pushAskCard() {
  if (S.profile?.pushAsked || PUSH.on) return "";
  const ios = isIOS() && !isStandalone();
  return `<section class="panel pushask"><div class="row nowrap">${stk("calendar", 54, "", -8)}<div class="grow"><h3>🔔 Cho phép app nhắc bạn học mỗi ngày?</h3>
    <p class="small">Nếu hôm đó bạn chưa học, app sẽ nhắc từ ${esc(S.profile.remind || "20:00")}. Đổi giờ hoặc tắt bất cứ lúc nào trong Cài đặt.</p>
    ${ios ? `<p class="small muted">Trên iPhone: bấm <b>Chia sẻ</b> → <b>Thêm vào MH chính</b>, rồi mở app từ biểu tượng ngoài màn hình để bật được thông báo.</p>` : ""}</div></div>
    <div class="row">${ios ? "" : `<button class="primary" data-a="pushAsk" data-v="1">Bật thông báo</button>`}<button class="ghost" data-a="pushAsk" data-v="0">${ios ? "Đã hiểu" : "Để sau"}</button></div></section>`;
}
function vPlaceIntro() {
  return `<div class="wrap narrow">${pushAskCard()}<section class="panel hero with-art"><div class="hero-art">${mascot("think", 116, "bob")}</div><span class="eyebrow">Bước 2/2 · Kiểm tra trình độ</span><h1>Bài test đầu vào thích ứng</h1>
    <p>${PLACEMENT_LEN} câu, khoảng 5 phút. Trả lời đúng thì câu sau khó hơn, sai thì dễ hơn, để xác định chính xác level của bạn từ A0 đến C1.</p>
    <p class="muted">Không biết thì chọn "Tôi không biết", đừng đoán, kết quả sẽ chính xác hơn.</p>
    <button class="primary" data-a="startPlacement">Bắt đầu kiểm tra</button>
    <button class="ghost" data-a="skipPlacement">Tôi mới bắt đầu học, bỏ qua và học từ A0</button></section></div>`;
}
function vPlaceResult() {
  const p = S.placement, i = lvIdx(p.level), to = LEVELS[Math.min(5, i + 1)], weeks = courseWeeks(p.level, S.profile);
  return `<div class="wrap narrow"><section class="panel hero with-art">${confetti(30)}<div class="hero-art">${mascot("cheer", 116, "bob")}</div><span class="eyebrow">Kết quả kiểm tra</span>
    <div class="levelbadge">${p.level}</div><h1>${LEVEL_VI[p.level]}</h1>
    <p>Bạn trả lời đúng ${p.correct}/${p.total} câu.</p>
    <div class="ladder">${LEVELS.map((l, k) => `<span class="${k === i ? "cur" : k === i + 1 ? "next" : k < i ? "past" : ""}">${l}</span>`).join("")}</div>
    <h3>Lộ trình đề xuất</h3>
    <p><b>${p.level} → ${to}</b> trong <b>${weeks} tuần</b>: ${weeks * 5} buổi học (5 buổi mỗi tuần, mỗi buổi ${S.profile.minutes} phút), ${weeks} bài kiểm tra định kỳ. Nội dung xoay quanh <b>${esc(fieldName())}</b>.</p>
    <button class="primary" data-a="confirmPath">Bắt đầu lộ trình</button><button class="ghost" data-a="startPlacement">Làm lại bài test</button></section></div>`;
}
function vQuiz() {
  if (!Q) { view = "home"; return vHome(); }
  if (Q.mode === "review" && Q.done) {
    const ok = Q.res.filter(r => r.ok).length;
    return `<div class="wrap narrow"><section class="panel center">${confetti(30)}${mascot("cheer", 110, "bob")}<h2>Xong phiên ôn tập</h2><div class="scorebig"><b>${ok}/${Q.res.length}</b><span>câu đúng</span></div>
      <div class="row center"><button class="primary" data-a="go" data-v="review">Về trang Ôn tập</button></div></section></div>`;
  }
  const title = Q.mode === "placement" ? "Kiểm tra trình độ" : Q.mode === "unit" ? `Kiểm tra định kỳ · Unit ${Q.unit}` : "Ôn tập flashcard";
  return `<div class="wrap narrow"><p class="eyebrow center">${title}</p><section class="panel quiz">${vQuizBody(Q, {exit:"quitQuiz"})}</section>
   ${Q.mode === "placement" && !Q.pick ? `<div class="center"><button class="ghost" data-a="pick" data-v="-1">Tôi không biết</button></div>` : ""}</div>`;
}

function greetLine() {
  const h = new Date().getHours();
  if (doneToday()) return "Hôm nay bạn đã học rồi, tuyệt vời! Ôn thêm vài thẻ flashcard cho nhớ lâu nhé.";
  if (h < 11) return "Chào buổi sáng! Một buổi học ngắn giúp cả ngày nói tiếng Anh tự tin hơn.";
  if (h < 14) return "Nghỉ trưa học một chút nhé, chỉ cần " + (S.profile?.minutes || 30) + " phút thôi.";
  if (h < 18) return "Buổi chiều vui vẻ! Bài học hôm nay đang chờ bạn.";
  return "Buổi tối thư thả là lúc học hiệu quả nhất. Bắt đầu thôi!";
}
function vHome() {
  if (courseDone()) return vCourseDone();
  const n = doneN(), p = S.path, td = testDue(), cur = S.current && S.current.idx === S.sessions.length ? S.current : null;
  const nextLes = S.lessons[S.sessions.length];
  const topic = cur ? cur.les.topic : nextLes?.topic || "";
  const [ts, hue] = td ? ["target", "coral"] : topicStk(topic + " " + (nextSituation() || "") + " " + fieldName());
  const days = ["T2","T3","T4","T5","T6","T7","CN"], d0 = new Date(); d0.setDate(d0.getDate() - ((d0.getDay() + 6) % 7));
  const week = days.map((k, i) => { const d = new Date(d0); d.setDate(d0.getDate() + i); const ds = d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
    const on = S.sessions.some(s => s.date === ds); return `<div class="day ${on ? "on" : ""} ${ds === today() ? "today" : ""}"><span>${k}</span><i>${on ? stk("flame", 22, "", 0) : ""}</i></div>`; }).join("");
  const due = dueCards().length, avgScore = Math.round(avg(courseSessions().slice(-5).map(s => s.total))), st = streak();
  const units = Math.ceil(p.total / 5), prog = pct(n, p.total);
  const celebrate = UI.celebrate?.length ? `<section class="panel celebrate">${confetti()}<div class="row nowrap">${mascot("cheer", 100, "bob")}<div class="grow"><p class="eyebrow">Nhãn dán mới</p><h2>Bạn vừa mở khóa ${UI.celebrate.length} nhãn dán!</h2></div></div>
     <div class="badge-row">${UI.celebrate.map(id => BADGE[id] ? badgeCard(BADGE[id]) : "").join("")}</div><div class="row"><button class="primary" data-a="closeCelebrate">Tuyệt quá!</button><a href="#" class="link" data-a="go" data-v="history">Xem bộ sưu tập →</a></div></section>` : "";
  return `<div class="wrap">
   ${festBanner()}${pushAskCard()}${celebrate}
   <section class="hero-home">
     <div class="hh-text"><p class="eyebrow">${esc(focusName())}</p><h1>Chào ${esc(displayName() || "bạn")}!</h1><p class="hh-line">${greetLine()}</p>
       <div class="hh-chips"><span>${stk("flame", 22, "", 0)} ${st} ngày liên tiếp</span><span>${stk("cap", 22, "", 0)} Khóa ${p.from} → ${p.to}</span><span>${stk("calendar", 22, "", 0)} Tuần ${Math.min(p.weeks, Math.floor(n / 5) + 1)}/${p.weeks}</span></div>
       <div class="week">${week}</div></div>
     <div class="hh-art">${mascot(doneToday() ? "cheer" : "happy", 168, "bob")}${stk("star", 40, "float f1", -12)}${stk("sparkle", 34, "float f2", 8)}${stk("book", 44, "float f3", -6)}</div>
   </section>
   ${remindDue() ? `<section class="panel notice row nowrap">${stk("calendar", 40, "", -6)}<div><b>Đã đến giờ học (${remindTime()})</b><br><span class="muted">Bạn chưa học hôm nay. Chỉ cần ${S.profile.minutes} phút để giữ chuỗi ngày học.</span></div></section>` : ""}
   <div class="grid-main">
    <section class="panel todaycard hue-${hue}">
     <div class="cover">${stk(ts, 104, "big")}<span class="cover-tag">${td ? "Kiểm tra định kỳ" : cur ? `Đang ở bước ${cur.step + 1}/6` : `Buổi ${n + 1}/${p.total}`}</span></div>
     <div class="today-body">
     ${td ? `<span class="eyebrow">Đến hạn</span><h2>Kiểm tra định kỳ Unit ${n / 5}</h2>
        <p class="muted">Bạn đã xong 5 buổi học. Bài kiểm tra gồm từ vựng, ngữ pháp, chính tả, dịch, nghe và nói, khoảng 15 phút.</p>
        <button class="primary big" data-a="startUnit">Làm bài kiểm tra</button>`
     : `<span class="eyebrow">${doneToday() && !cur ? "Bạn đã học hôm nay" : "Buổi học hôm nay"}</span>
        <h2>${cur ? esc(cur.les.topic) : nextLes ? esc(nextLes.topic) : `Buổi ${n + 1}`}</h2>
        ${!cur && nextLes ? `<p class="small"><span class="tag good">Đã soạn xong</span> ${nextLes.ai ? "Bài soạn riêng theo mục tiêu của bạn" : `Bài mẫu trình độ ${nextLes.level || S.level}${nextLes.review ? " · ôn lại" : ""}`}</p>` : !cur && INFLIGHT[S.sessions.length] ? `<p class="small muted"><span class="spin"></span> Gemini đang soạn sẵn buổi này...</p>` : ""}
        <ol class="steps-mini">${STEPS.map((t, k) => `<li class="${cur && k < cur.step ? "done" : cur && k === cur.step ? "cur" : ""}">${stk(STEP_STK[k], 30, "", 0)}<span>${t}</span></li>`).join("")}</ol>
        <button class="primary big" data-a="startLesson">${cur ? "Học tiếp" : doneToday() ? "Học thêm buổi tiếp theo" : "Bắt đầu buổi học"}</button>`}
     ${AI.on ? "" : `<p class="fb small">Gemini chưa hoạt động (${esc(AI.msg)}). App dùng bài học mẫu và chấm điểm cơ bản.</p>`}
     </div></section>
    <section class="tiles">
      <div class="tile hue-coral">${stk("flame", 44)}<b>${st}</b><span>ngày học liên tiếp</span></div>
      <div class="tile hue-mint">${stk("book", 44)}<b>${Object.keys(S.cards).length}</b><span>từ đã học</span></div>
      <div class="tile hue-sun">${stk("star", 44)}<b>${avgScore || "–"}</b><span>điểm TB 5 buổi</span></div>
      <button class="tile hue-sky" data-a="${due ? "startFlip" : "go"}" data-v="${due ? "due" : "review"}">${stk("headphones", 44)}<b>${due}</b><span>${due ? "thẻ cần ôn · bấm để ôn" : "thẻ cần ôn"}</span></button>
    </section>
   </div>
   <section class="panel"><div class="row between"><h3 class="row">${stk("map", 32, "", -4)} Hành trình khóa học</h3><a href="#" class="link" data-a="go" data-v="path">Xem lộ trình →</a></div>
    <div class="track"><div class="track-fill" style="width:${prog}%"></div>
     ${Array.from({length:units}, (_, u) => { const left = Math.min(100, (u + 1) * 5 / p.total * 100), done = courseTests()[u]; return `<span class="mile ${done ? "done" : ""}" style="left:${left}%" title="Kiểm tra Unit ${u + 1}">${stk(done ? "trophy" : "target", 26, "", 0)}</span>`; }).join("")}
     <span class="track-me" style="left:${prog}%">${mascot("happy", 44)}</span></div>
    <p class="muted small">${n}/${p.total} buổi · ${courseTests().length}/${units} bài kiểm tra · cờ là các bài kiểm tra định kỳ</p></section></div>`;
}
function vCourseDone() {
  const p = S.path, ts = courseTests(), ss = courseSessions(), i = lvIdx(p.to);
  return `<div class="wrap narrow"><section class="panel hero center">${confetti(60)}${mascot("cheer", 140, "bob")}<span class="eyebrow">Hoàn thành khóa học</span><div class="levelbadge">${p.to}</div>
    <h1>Chúc mừng ${esc(displayName() || "bạn")}!</h1><p>Bạn đã hoàn thành ${ss.length} buổi học và ${ts.length} bài kiểm tra của khóa ${p.from} → ${p.to}.</p>
    <div class="stats"><div class="stat"><b>${Math.round(avg(ss.map(s => s.total)))}</b><span>điểm TB buổi học</span></div><div class="stat"><b>${Math.round(avg(ts.map(t => t.score)))}%</b><span>điểm TB kiểm tra</span></div><div class="stat"><b>${Object.keys(S.cards).length}</b><span>từ đã học</span></div></div>
    ${i < 5 ? `<button class="primary big" data-a="nextCourse">Bắt đầu khóa ${p.to} → ${LEVELS[i + 1]}</button>` : `<button class="primary big" data-a="nextCourse">Tiếp tục nâng cao trình độ C1</button>`}</section></div>`;
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
      cells.push(`<li class="${st}"><span class="num">${no + 1}</span>${s || les || plan ? stk(topicStk(s?.topic || les?.topic || plan?.topic)[0], 32, "", 0) : ""}<div><b>${esc(s?.topic || les?.topic || plan?.topic || (st === "locked" ? "Chưa mở" : "Buổi tiếp theo"))}</b>${plan ? `<span class="muted small">Dự kiến · ${plan.level} · ${esc(plan.grammar?.name || "")}</span>` : ""}${s ? `<span class="muted small">${s.date} · ${s.total} điểm${s.remedial ? " · ôn tập" : ""}</span>` : ""}</div>${s ? `<em>${s.total}</em>` : st === "now" ? `<button class="mini primary" data-a="startLesson">Học</button>` : ""}</li>`);
    }
    courseSessions().filter(s => s.remedial && s.unit === u).forEach(s => cells.push(`<li class="done"><span class="num">+</span><div><b>${esc(s.topic)}</b><span class="muted small">${s.date} · ${s.total} điểm</span></div><em>${s.total}</em></li>`));
    const t = tests[u], tst = t ? "done" : (n >= (u + 1) * 5 ? "now" : "locked");
    html += `<section class="panel unit ${n >= u * 5 && n < (u + 1) * 5 + 1 ? "active" : ""}"><div class="row between"><h3 class="row">${stk(WEEK_STK[u % WEEK_STK.length], 34, "", 0)} Tuần ${u + 1}</h3><span class="muted small">${Math.min(5, Math.max(0, n - u * 5))}/5 buổi</span></div>
      <ol class="sessions">${cells.join("")}<li class="test ${tst}"><span class="num">✓</span><div><b>Kiểm tra định kỳ Unit ${u + 1}</b>${t ? `<span class="muted small">${t.date}</span>` : ""}</div>${t ? `<em>${t.score}%</em>` : tst === "now" ? `<button class="mini primary" data-a="startUnit">Làm bài</button>` : ""}</li></ol></section>`;
  }
  return `<div class="wrap"><section class="hello">${stk("map", 72, "", -6)}<div><p class="eyebrow">Lộ trình của bạn</p><h1>${p.from} → ${p.to}</h1><p class="muted">${p.weeks} tuần · ${p.total} buổi · bắt đầu ${p.start} · ${esc(focusName())}</p><p class="muted small">Các buổi chưa học hiện bài dự kiến trong kho bài mẫu ${p.from}${p.to !== p.from ? " → " + p.to : ""}. Khi Gemini hoạt động, bài sẽ được soạn riêng theo lĩnh vực của bạn ở cùng trình độ.</p></div>
    <div class="ladder">${LEVELS.map((l, k) => `<span class="${l === p.from ? "cur" : l === p.to ? "next" : k < lvIdx(p.from) ? "past" : ""}">${l}</span>`).join("")}</div></section>
    <div class="progress"><i style="width:${pct(n, p.total)}%"></i></div>${html}</div>`;
}
function vReview() {
  const all = cardList(), due = dueCards(), hard = hardCards();
  const tab = UI.rtab;
  const tabs = `<div class="tabs">${[["due", `Đến hạn (${due.length})`], ["hard", `Từ khó (${hard.length})`], ["all", `Tất cả (${all.length})`]].map(([k, t]) => `<button class="${tab === k ? "sel" : ""}" data-a="rtab" data-v="${k}">${t}</button>`).join("")}</div>`;
  if (!all.length) return `<div class="wrap narrow"><section class="panel center">${mascot("think", 120, "bob")}<h2>Chưa có flashcard</h2><p class="muted">Từ vựng trong mỗi buổi học và từ bạn tra sẽ tự động được thêm vào đây.</p></section></div>`;
  const counts = {"Mới":0, "Đang học":0, "Đang nhớ":0, "Đã thuộc":0}; all.forEach(c => counts[cardState(c)]++);
  let body;
  if (tab === "all") {
    const q = UI.q.toLowerCase(), list = all.filter(c => !q || c.w.w.toLowerCase().includes(q) || (c.w.vi || "").toLowerCase().includes(q)).sort((a, b) => a.w.w.localeCompare(b.w.w));
    body = `<input id="rq" data-live="rq" placeholder="Tìm từ hoặc nghĩa..." value="${esc(UI.q)}">
      <div class="table-wrap"><table class="cards"><thead><tr><th>Từ</th><th>Nghĩa</th><th>Trạng thái</th><th>Ôn lại</th><th></th></tr></thead><tbody>
      ${list.map(c => `<tr><td><b>${esc(c.w.w)}</b><br><span class="ipa">${esc(c.w.ipa || "")}</span></td><td>${esc(c.w.vi)}</td><td><span class="tag">${cardState(c)}</span></td>
        <td class="small">${c.due <= Date.now() ? "Đến hạn" : new Date(c.due).toLocaleDateString("vi-VN")}</td><td><button class="mini" data-a="cdel" data-v="${esc(c.w.w.toLowerCase())}" aria-label="Xóa ${esc(c.w.w)}">Xóa</button></td></tr>`).join("")}
      </tbody></table></div>`;
  } else {
    const set = tab === "due" ? due : hard;
    body = set.length ? `<p>${set.length} thẻ. Chọn cách ôn:</p><div class="modes">
      <button class="mode" data-a="startFlip" data-v="${tab}"><b>Lật thẻ</b><span>Tự đánh giá Quên / Khó / Nhớ / Dễ</span></button>
      <button class="mode" data-a="startRQuiz" data-v="${tab}:mcq"><b>Trắc nghiệm</b><span>Chọn nghĩa đúng của từ</span></button>
      <button class="mode" data-a="startRQuiz" data-v="${tab}:type"><b>Gõ từ</b><span>Nhìn nghĩa, viết lại từ tiếng Anh</span></button>
      <button class="mode" data-a="startRQuiz" data-v="${tab}:listen"><b>Nghe & gõ</b><span>Nghe phát âm, gõ lại từ</span></button>
      ${SR ? `<button class="mode" data-a="startRQuiz" data-v="${tab}:speak"><b>Đọc to</b><span>Đọc từ và câu ví dụ, máy chấm phát âm</span></button>` : ""}</div>`
      : `<p class="muted">${tab === "due" ? "Bạn đã ôn hết thẻ đến hạn. Quay lại sau nhé." : "Chưa có từ nào bị quên nhiều lần."}</p>
         ${tab === "due" ? `<button data-a="startFlip" data-v="all">Ôn tự do 20 thẻ bất kỳ</button>` : ""}`;
  }
  return `<div class="wrap"><section class="hello">${stk("headphones", 72, "", -8)}<div><p class="eyebrow">Ôn tập</p><h1>Flashcard của bạn</h1><p class="muted">Lặp lại ngắt quãng: từ bạn nhớ tốt sẽ xuất hiện thưa dần (1, 3, 7, 16... ngày), từ hay quên sẽ quay lại sớm.</p></div></section>
   <section class="panel"><div class="stats">${Object.entries(counts).map(([k, v]) => `<div class="stat"><b>${v}</b><span>${k}</span></div>`).join("")}</div></section>
   <section class="panel">${tabs}${body}</section></div>`;
}
function vFlip() {
  if (!FC || FC.i >= FC.keys.length) {
    const n = FC?.keys.length || 0; FC = null;
    return `<div class="wrap narrow"><section class="panel center"><h2>Xong phiên ôn tập</h2><p>Bạn đã ôn ${n} thẻ.</p><button class="primary" data-a="go" data-v="review">Về trang Ôn tập</button></section></div>`;
  }
  const c = S.cards[FC.keys[FC.i]]; if (!c) { FC.i++; return vFlip(); }
  const w = c.w;
  return `<div class="wrap narrow"><div class="row between"><button class="ghost" data-a="go" data-v="review">← Thoát</button><span class="eyebrow">Thẻ ${FC.i + 1}/${FC.keys.length}</span><span></span></div>
   <section class="flash ${FC.flip ? "back" : ""}" data-a="flip" tabindex="0" role="button" aria-label="Lật thẻ">
    ${FC.flip ? `<div class="word">${esc(w.w)}</div><div class="ipa">${esc(w.ipa || "")}${w.pos ? " · " + esc(w.pos) : ""}</div><p class="meaning">${esc(w.vi)}</p>
      ${w.ex ? `<p>${tw(w.ex)}</p>` : ""}${c.example && c.example !== w.ex ? `<p class="muted">Câu của bạn: ${tw(c.example)}</p>` : ""}`
     : `<div class="word">${esc(w.w)}</div><div class="ipa">${esc(w.ipa || "")}</div><p class="muted">Bấm để xem nghĩa (phím Space)</p>`}</section>
   ${FC.flip ? `<div class="rate">${[[1, "Quên", "<1 phút"], [3, "Khó", ""], [4, "Nhớ", ""], [5, "Dễ", ""]].map(([q, t]) => `<button data-a="rate" data-v="${q}"><b>${t}</b><span class="small muted">phím ${q === 1 ? 1 : q === 3 ? 2 : q === 4 ? 3 : 4}</span></button>`).join("")}</div>`
     : `<div class="row center"><button data-a="speak" data-v="${esc(w.w)}">🔊 Nghe</button><button class="primary" data-a="flip">Xem nghĩa</button></div>`}</div>`;
}
function vHistory() {
  const ss = S.sessions.slice().reverse(), ts = S.tests.slice().reverse();
  const chart = S.sessions.slice(-20);
  return `<div class="wrap"><section class="hello">${stk("trophy", 72, "", 8)}<div><p class="eyebrow">Lịch sử</p><h1>Kết quả học tập</h1>
    <p class="muted">${S.sessions.length} buổi học · ${S.tests.length} bài kiểm tra · tổng ${S.sessions.reduce((a, s) => a + (s.dur || 0), 0)} phút</p></div></section>
   <section class="panel"><div class="row between"><h3>Bộ sưu tập nhãn dán</h3><span class="tag">${Object.keys(S.badges || {}).length}/${BADGES.length}</span></div>
     <div class="badge-grid">${BADGES.map(b => badgeCard(b, !!S.badges?.[b.id], S.badges?.[b.id])).join("")}</div></section>
   ${chart.length > 1 ? `<section class="panel"><h3>Điểm 20 buổi gần nhất</h3><div class="spark">${chart.map(s => `<i style="height:${Math.max(4, s.total)}%" title="${esc(s.topic)}: ${s.total}"></i>`).join("")}</div></section>` : ""}
   <section class="panel"><h3>Hành trình level</h3><ul class="timeline">
     ${S.placement ? `<li><b>${S.placement.level}</b> Test đầu vào · ${S.placement.date}</li>` : ""}
     ${S.courses.map(c => `<li><b>${c.to}</b> Hoàn thành khóa ${c.from} → ${c.to} · ${c.end}</li>`).join("")}
     ${S.path ? `<li class="cur"><b>${S.path.from} → ${S.path.to}</b> Khóa hiện tại, bắt đầu ${S.path.start}</li>` : ""}</ul></section>
   <section class="panel"><h3>Bài kiểm tra định kỳ</h3>${ts.length ? ts.map(t => `<div class="hrow"><div><b>Unit ${t.unit}</b> <span class="muted small">${t.date}</span>
      <div class="minibars">${Object.entries(t.skills || {}).map(([k, v]) => `<span>${SKILL_VI[k] || k} <b>${v}</b></span>`).join("")}</div></div><em class="score">${t.score}%</em></div>`).join("")
     : `<p class="muted">Bài kiểm tra đầu tiên mở sau 5 buổi học.</p>`}</section>
   <section class="panel"><h3>Các buổi học</h3>${ss.length ? ss.map(s => `<div class="hrow click" data-a="hx" data-v="${s.idx}"><div><b>${esc(s.topic)}</b><br><span class="muted small">${s.date} · ${s.dur || "?"} phút${s.grammar ? " · " + esc(s.grammar) : ""}</span></div><em class="score">${s.total}</em></div>
      ${UI.hx === s.idx ? `<div class="hdetail"><p>${(s.words || []).map(w => `<span class="chip">${esc(w)}</span>`).join(" ")}</p>
        <div class="minibars">${Object.entries(s.scores || {}).map(([k, v]) => `<span>${{review:"Ôn bài",vocab:"Từ vựng",speaking:"Phát âm",sentence:"Đặt câu",translation:"Dịch",listening:"Nghe chép",roleplay:"Role-play"}[k] || k} <b>${v}</b></span>`).join("")}</div>
        ${(s.mistakes || []).map(m => `<div class="fb bad small"><s>${esc(m.text)}</s> → <b>${esc(m.fix)}</b></div>`).join("")}</div>` : ""}`).join("")
     : `<p class="muted">Chưa có buổi học nào.</p>`}</section></div>`;
}
function vSettings() {
  const fs = pref("ep_fs") || "m", th = pref("ep_theme") || "auto";
  return `<div class="wrap narrow"><section class="hello">${mascot("happy", 80)}<div><p class="eyebrow">Cài đặt</p><h1>Tài khoản & tùy chỉnh</h1></div></section>
   <section class="panel account"><div class="row nowrap">
     <div class="bigavatar">${ME?.avatar ? `<img src="${esc(ME.avatar)}" alt="" referrerpolicy="no-referrer">` : esc((displayName() || ME?.email || "?")[0].toUpperCase())}</div>
     <div class="who"><b>${esc(displayName() || "Chưa đặt tên")}</b><span>${esc(ME?.email || "Không lấy được email")}</span>
      <span class="muted small">Đăng nhập bằng ${ME?.provider === "google" ? "Google" : "email"}${ME?.since ? ` · tham gia ${new Date(ME.since).toLocaleDateString("vi-VN")}` : ""}</span></div></div>
     <div class="row"><a class="btn" href="/auth/signout">Đăng xuất</a><span class="muted small">Muốn dùng tài khoản khác: đăng xuất rồi chọn tài khoản khi đăng nhập lại.</span></div></section>
   <section class="panel"><h3>Mục tiêu học</h3><p>${esc(focusName())}${S.profile.job ? ` · ${esc(S.profile.job)}` : ""}${subList().length ? `<br><span class="small">${subList().map(esc).join(" · ")}</span>` : ""}${S.profile.interest ? `<br><span class="muted">${esc(S.profile.interest)}</span>` : ""}</p>
    <p class="muted small">${S.profile.minutes} phút/ngày · Trình độ ${S.level} · Khóa ${S.path?.from} → ${S.path?.to}</p>
    <button data-a="editGoal">Sửa mục tiêu và lĩnh vực</button></section>
   <section class="panel"><div class="row between"><h3>Nhắc học</h3><button class="mini seg ${remindCfg().on ? "sel" : ""}" data-a="remToggle">${remindCfg().on ? "● Đang bật" : "○ Đang tắt"}</button></div>
    <p class="muted small">Nếu hôm nay bạn chưa học, app gửi thông báo theo lịch dưới đây. Học xong buổi trong ngày thì app ngừng nhắc.</p>
    <div class="row timerow"><div class="tfield"><label for="remindSet">Bắt đầu nhắc lúc</label><input id="remindSet" type="time" value="${remindCfg().start}" data-change="setRemind"></div>
     <div class="tfield"><label for="remindEnd">Nhắc đến</label><input id="remindEnd" type="time" value="${remindCfg().end}" data-change="setRemindEnd"></div></div>
    <div class="row"><span>Nhắc mỗi</span>${[[30, "30 phút"], [60, "1 tiếng"], [120, "2 tiếng"], [180, "3 tiếng"]].map(([k, t]) => `<button class="seg ${remindCfg().every === k ? "sel" : ""}" data-a="remEvery" data-v="${k}">${t}</button>`).join("")}</div>
    <div class="setrow"><span>Giọng nhắc</span><div class="row">${[["spicy", "😈 Lầy lội"], ["soft", "🙂 Nhẹ nhàng"]].map(([k, t]) => `<button class="seg ${(S.profile.remindTone || "spicy") === k ? "sel" : ""}" data-a="remTone" data-v="${k}">${t}</button>`).join("")}</div></div>
    <p class="fb small">${remindCfg().on ? `Các lần nhắc mỗi ngày (${remindSlots().length} lần): <b>${remindSlots().join(" · ")}</b>` : "Nhắc học đang tắt. Bạn sẽ không nhận thông báo nào."}</p>
    <div class="pushbox"><b>Nhận thông báo trên thiết bị này</b>
     <p class="muted small">Thông báo hiện trên điện thoại hoặc máy tính, kể cả khi đang đóng app. Mỗi thiết bị cần bật riêng một lần.</p>
     ${PUSH.on ? `<div class="row"><span class="tag good">Đang bật trên thiết bị này</span><button class="mini" data-a="pushTest">Gửi thử</button><button class="mini" data-a="pushOff">Tắt trên thiết bị này</button></div>`
       : `<button class="primary" data-a="pushOn">Bật thông báo trên thiết bị này</button>
          ${isIOS() && !isStandalone() ? `<p class="small">Trên iPhone (iOS 16.4 trở lên): mở bằng Safari → nút Chia sẻ → <b>Thêm vào MH chính</b> → mở app từ biểu tượng mới, rồi bấm nút trên.</p>` : ""}`}</div>
    <p class="muted small">Hoặc thêm một lời nhắc cố định vào lịch điện thoại (lúc ${remindCfg().start} mỗi ngày):</p>
    <div class="row"><a class="btn mini" target="_blank" rel="noopener" href="${gcalLink()}">Google Calendar ↗</a><button class="mini" data-a="ics">Tải file lịch (.ics)</button></div></section>
   <section class="panel"><div class="row between"><h3>Trạng thái AI</h3><button class="mini" data-a="probeAI" ${PROBE === "…" ? "disabled" : ""}>${PROBE === "…" ? `<span class="spin"></span> Đang kiểm tra` : "Kiểm tra AI"}</button></div>
    <p class="muted small">Chấm câu, role-play, tra từ: Groq → OpenRouter → Gemini. Soạn bài mới: Gemini trước (giữ lượt Gemini cho việc này), hết lượt thì Groq/OpenRouter soạn thay.${LAST_ENGINE ? ` Lần gần nhất trả lời: <b>${esc(LAST_ENGINE)}</b> (${new Date(LAST_ENGINE_AT).toLocaleTimeString("vi-VN", {hour:"2-digit", minute:"2-digit"})}).` : ""}</p>
    ${Array.isArray(PROBE) ? `<div class="ailist">${PROBE.map(p => `<div class="row between nowrap"><span><b>${esc(p.name)}</b> <span class="muted small">${esc(p.model || "")}</span></span>${p.ok ? `<span class="tag good">✓ Hoạt động · ${(p.ms / 1000).toFixed(1)}s</span>` : `<span class="tag bad" title="${esc(p.error || "")}">✗ ${esc(p.error || "Lỗi")}</span>`}</div>`).join("")}
      ${PROBE.length < 3 ? `<p class="muted small">AI nào chưa hiện là chưa có key (GROQ_API_KEY / OPENROUTER_API_KEY) trên máy chủ.</p>` : ""}</div>` : ""}</section>
   <section class="panel"><h3>Ngày sinh & giao diện theo mùa</h3>
    <div class="row timerow"><div class="tfield"><label for="bday">Ngày sinh (không bắt buộc)</label><input id="bday" type="date" value="${esc(S.profile.birthday && S.profile.birthday.length === 10 ? S.profile.birthday : "")}" data-change="setBday"></div></div>
    <p class="muted small">Đúng ngày sinh nhật, giao diện của bạn sẽ đổi sang chủ đề sinh nhật để chúc mừng 🎂. Chỉ bạn thấy.</p>
    <label for="festSel">Giao diện theo mùa & ngày lễ</label>
    <select id="festSel" data-change="setFest"><option value="auto" ${(S.profile.festive || "auto") === "auto" ? "selected" : ""}>Tự động theo ngày (khuyên dùng)</option><option value="off" ${S.profile.festive === "off" ? "selected" : ""}>Tắt, dùng màu mặc định</option>
      ${Object.entries(FEST).map(([k, f]) => `<option value="${k}" ${S.profile.festive === k ? "selected" : ""}>Xem thử: ${esc(f.name)}</option>`).join("")}</select>
    <div class="setrow"><span>Hiệu ứng rơi (hoa, lá, nốt nhạc…)</span><div class="row">${[[true, "Bật"], [false, "Tắt"]].map(([k, t]) => `<button class="seg ${(S.profile.festFx !== false) === k ? "sel" : ""}" data-a="festFx" data-v="${k}">${t}</button>`).join("")}</div></div>
    <p class="muted small">Hôm nay: <b>${esc(FEST[festiveTheme()]?.name || "Mặc định")}</b>. Tết Âm lịch, Tết Dương lịch, 14/2, 8/3, 18/3, 1/6, Trung thu, 14/10, 20/11, Giáng Sinh và 4 mùa.</p></section>
   <section class="panel"><h3>Giọng đọc & micro</h3>
    <label for="voiceSel">Giọng đọc tiếng Anh</label><select id="voiceSel" data-change="setVoice">${VOICES.length ? VOICES.map(v => `<option value="${esc(v.name)}" ${pickVoice()?.name === v.name ? "selected" : ""}>${esc(v.name)} (${esc(v.lang)})</option>`).join("") : `<option>Giọng mặc định của trình duyệt</option>`}</select>
    <div class="row"><span>Tốc độ đọc</span>${[["0.6", "Rất chậm"], ["0.7", "Chậm"], ["0.8", "Vừa"], ["0.95", "Nhanh"]].map(([k, t]) => `<button class="seg ${Number(k) === ttsRate() ? "sel" : ""}" data-a="ttsRate" data-v="${k}">${t}</button>`).join("")}
     <button data-a="speak" data-v="Hello! This is how I sound. Let's practise English together.">🔊 Nghe thử</button></div>
    <div class="row"><button class="mic ${UI.rec === "test" ? "on" : ""}" data-a="micTest" ${SR ? "" : "disabled"}>${UI.rec === "test" ? "● Đang nghe..." : "🎤 Thử micro"}</button>
     <span class="muted small">${SR ? "Nhận giọng nói chạy trên Chrome và Edge, cần có Internet." : "Trình duyệt này không hỗ trợ nhận giọng nói. Hãy dùng Chrome hoặc Edge."}</span></div>
    ${UI.rec === "test" ? `<p class="live" id="live">Hãy nói một câu tiếng Anh...</p>` : ""}
    <p class="muted small">Muốn giọng đọc tự nhiên hơn: dùng Edge (có sẵn giọng "Natural"), hoặc trên Windows vào Cài đặt → Thời gian & ngôn ngữ → Giọng nói để cài thêm giọng tiếng Anh.</p></section>
   <section class="panel"><h3>Hiển thị</h3><div class="row"><span>Cỡ chữ</span>${["s", "m", "l"].map(k => `<button class="seg ${fs === k ? "sel" : ""}" data-a="fs" data-v="${k}">${k.toUpperCase()}</button>`).join("")}</div>
    <div class="row"><span>Giao diện</span>${[["auto", "Theo máy"], ["light", "Sáng"], ["dark", "Tối"]].map(([k, t]) => `<button class="seg ${th === k ? "sel" : ""}" data-a="theme" data-v="${k}">${t}</button>`).join("")}</div></section>
   <section class="panel"><h3>Gemini AI</h3><p>${AI.quota ? `<span class="tag bad">Hết lượt miễn phí</span> Gemini giới hạn số lần gọi mỗi phút và mỗi ngày. App đang dùng nội dung mẫu và sẽ tự thử lại sau 5 phút. Nếu hết lượt theo ngày, lượt mới có lại vào khoảng 14–15 giờ chiều (giờ Việt Nam).` : AI.on && AI.busy ? `<span class="tag">Đang quá tải</span> ${esc(AI.msg)}. App vẫn dùng AI và tự thử lại; nếu vẫn lỗi sẽ tạm dùng nội dung mẫu.` : AI.on ? `<span class="tag good">Đang hoạt động</span> Bài học, chấm câu, role-play và tra từ dùng AI.` : `<span class="tag bad">Chưa hoạt động</span> ${esc(AI.msg)}`}</p>
    <p class="muted small">Key nằm trong file .env.local (GEMINI_API_KEY, GEMINI_MODEL). Sửa file rồi khởi động lại app.</p><button data-a="checkAI">Kiểm tra lại kết nối</button></section>
   <section class="panel"><h3>Dữ liệu</h3><div class="row">
    <button class="danger" data-a="reset" id="resetBtn">Xóa toàn bộ tiến độ và làm lại</button></div></section></div>`;
}

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
  const pop = document.createElement("div"); pop.id = "pop"; pop.setAttribute("role", "dialog"); pop.setAttribute("aria-label", "Tra từ " + word); document.body.appendChild(pop); POP = pop;
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
  if (aiOn()) { try { full = await gemini(TEACHER(), `Tra từ tiếng Anh "${word}" trong ngữ cảnh: "${ctx}".
Trả JSON {"headword":"dạng gốc","ipa":"phiên âm IPA","pos":"từ loại tiếng Việt (Danh từ, Động từ, Tính từ...)","meaning":"nghĩa tiếng Việt đúng ngữ cảnh; thêm 1-2 nghĩa phổ biến khác nếu có",
"examples":[{"en":"câu ví dụ","vi":"dịch"}] (3 câu, ưu tiên lĩnh vực của người học),"collocations":["cụm hay đi kèm"] (tối đa 3)}`); if (!full?.meaning) full = null; } catch (e) { full = null; POPERR = e.message; } }
  if (!full) { try { const r2 = await fetch("/api/dict?w=" + encodeURIComponent(k));
    if (r2.ok) { const j = (await r2.json())[0], m = j.meanings?.[0], defs = (j.meanings || []).flatMap(x => x.definitions || []);
      full = {headword:j.word, ipa:j.phonetic || j.phonetics?.find(p => p.text)?.text || "", pos:m?.partOfSpeech || "", meaning:d?.meaning || m?.definitions?.[0]?.definition || "", meaningEn:!d,
        examples:defs.filter(x => x.example).slice(0, 3).map(x => ({en:x.example, vi:""}))}; } } catch (e) {} }
  if (full) { if (d && !full.meaning) full.meaning = d.meaning; S.dict[k] = full; save(); d = full; }
  if (POP === pop) drawPop(word, d, false);
}
function drawPop(word, d, loading) {
  if (!POP) return;
  const hw = d?.headword || word, inCards = !!S.cards[hw.toLowerCase()];
  POP.innerHTML = `<div class="row between nowrap"><div><div class="word sm">${esc(hw)}</div><div class="ipa">${esc(d?.ipa || "")}${d?.pos ? ` · <span class="tag">${esc(d.pos)}</span>` : ""}</div></div>
     <button class="mini" data-a="closePop" aria-label="Đóng">✕</button></div>
   ${d ? `<p class="meaning sm">${esc(d.meaning)}${d.meaningEn ? ' <span class="muted small">(định nghĩa tiếng Anh)</span>' : ""}</p>` : ""}
   ${(d?.examples || []).filter(x => x.en).map(x => `<div class="ex">${esc(x.en)}${x.vi ? `<br><span class="muted">${esc(x.vi)}</span>` : ""}</div>`).join("")}
   ${d?.collocations?.length ? `<p class="muted small">Hay đi với: ${d.collocations.map(esc).join(" · ")}</p>` : ""}
   ${loading ? `<p class="muted small"><span class="spin"></span> Đang tra...</p>` : ""}${!d && !loading ? `<p class="muted">Chưa tra được từ này${AI.on ? (POPERR ? ` (${esc(POPERR)})` : "") : " vì Gemini chưa hoạt động"}. Thử nút Dịch hoặc Cambridge bên dưới.</p>` : ""}
   <div class="row"><button class="mini" data-a="speak" data-v="${esc(hw)}">🔊 Nghe</button>
    ${d ? `<button class="mini ${inCards ? "" : "primary"}" data-a="addLooked" data-v="${esc(word.toLowerCase())}" ${inCards ? "disabled" : ""}>${inCards ? "Đã có trong flashcard" : "+ Thêm vào flashcard"}</button>` : ""}
    <a class="mini btn" target="_blank" rel="noopener" href="https://dictionary.cambridge.org/dictionary/english-vietnamese/${encodeURIComponent(hw.toLowerCase())}">Cambridge ↗</a>
    <button class="mini" data-a="popTr" data-v="${esc(hw)}" data-sl="en">🌐 Dịch</button></div><div class="pop-tr"></div>`;
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
  const pop = document.createElement("div"); pop.id = "pop"; pop.setAttribute("role", "dialog"); pop.setAttribute("aria-label", "Tra từ tiếng Việt"); document.body.appendChild(pop); POP = pop;
  const r = el.getBoundingClientRect();
  if (innerWidth >= 600) { pop.style.top = (r.bottom + scrollY + 10) + "px"; pop.style.left = Math.max(12, Math.min(r.left + scrollX - 24, innerWidth - 384)) + "px"; } else pop.classList.add("sheet");
  const key = sent + "|" + i;
  const mark = d => { sylls.forEach(x => x.classList.remove("hl")); if (d?.start) sylls.slice(d.start - 1, d.start - 1 + (d.length || 1)).forEach(x => x.classList.add("hl")); else el.classList.add("hl"); };
  let d = VI_CACHE[key] || viGuess(words, i);
  mark(d); drawViPop(el.dataset.s, sent, d, !VI_CACHE[key] && aiOn());
  setTimeout(() => pop.scrollIntoView?.({block:"nearest", behavior:"smooth"}), 30);
  if (VI_CACHE[key] || !aiOn()) return;
  try {
    const j = await gemini(TEACHER(), `Câu tiếng Việt: "${sent}". Người học bấm vào âm tiết thứ ${i + 1} là "${words[i]}".
Xác định TỪ tiếng Việt chứa âm tiết đó (có thể là từ ghép nhiều âm tiết, ví dụ "hành lý", "kỹ sư phần mềm").
Trả JSON {"word_vi":"từ tiếng Việt","start":vị trí âm tiết đầu tiên của từ (đếm từ 1),"length":số âm tiết,"en":"từ hoặc cụm tiếng Anh tương đương đúng ngữ cảnh câu","alts":["cách nói khác"] (tối đa 2),"pos":"từ loại tiếng Việt","ipa":"IPA của từ tiếng Anh chính","note":"lưu ý cách dùng ngắn, nếu có","examples":[{"en":"câu ví dụ","vi":"dịch"}] (2 câu)}`);
    if (j?.en) { d = j; VI_CACHE[key] = j; }
  } catch (e) { POPERR = e.message; }
  if (POP === pop) { mark(d); drawViPop(el.dataset.s, sent, d, false); }
}
function drawViPop(syl, sent, d, loading) {
  if (!POP) return;
  const inCards = d?.en && !!S.cards[d.en.toLowerCase()];
  POP.dataset.vi = d ? JSON.stringify(d) : "";
  POP.innerHTML = `<div class="row between nowrap"><div><p class="eyebrow">Tiếng Việt → Tiếng Anh</p><div class="word sm">${esc(d?.word_vi || syl)}</div></div><button class="mini" data-a="closePop" aria-label="Đóng">✕</button></div>
   ${d ? `<div class="en-ans"><b>${esc(d.en)}</b> <button class="mini" data-a="speak" data-v="${esc(d.en)}" aria-label="Nghe">🔊</button></div>
     <div class="ipa">${esc(d.ipa || "")}${d.pos ? ` · <span class="tag">${esc(d.pos)}</span>` : ""}</div>
     ${d.alts?.length ? `<p class="small">Cách nói khác: ${d.alts.map(esc).join(" · ")}</p>` : ""}${d.note ? `<p class="small muted">${esc(d.note)}</p>` : ""}
     ${(d.examples || []).filter(x => x.en).map(x => `<div class="ex">${esc(x.en)}${x.vi ? `<br><span class="muted">${esc(x.vi)}</span>` : ""}</div>`).join("")}` : ""}
   ${loading ? `<p class="muted small"><span class="spin"></span> Đang tra theo ngữ cảnh câu...</p>` : ""}
   ${!d && !loading ? `<p class="muted">${AI.on ? `Chưa tra được${POPERR ? ` (${esc(POPERR)})` : ""}.` : "Tra từng từ tiếng Việt cần AI đang hoạt động."} Bạn vẫn có thể dịch cả câu bên dưới.</p>` : ""}
   <div class="row">${d?.en ? `<button class="mini ${inCards ? "" : "primary"}" data-a="addVi" ${inCards ? "disabled" : ""}>${inCards ? "Đã có trong flashcard" : "+ Thêm vào flashcard"}</button>` : ""}
    <button class="mini" data-a="popTr" data-v="${esc(sent)}">🌐 Dịch cả câu</button></div>
   <div class="pop-tr"></div>`;
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
    try { new Notification("Đến giờ học tiếng Anh", {body:`Buổi ${doneN() + 1} đang chờ bạn. ${dueCards().length} thẻ flashcard cần ôn.`}); pref("ep_notified", today()); } catch (e) {}
  }
}
function calTimes() { const [h, m] = remindTime().split(":").map(Number), d = new Date(); d.setHours(h, m, 0, 0); const e = new Date(d.getTime() + (S.profile?.minutes || 30) * 60e3);
  const f = x => `${x.getFullYear()}${String(x.getMonth() + 1).padStart(2, "0")}${String(x.getDate()).padStart(2, "0")}T${String(x.getHours()).padStart(2, "0")}${String(x.getMinutes()).padStart(2, "0")}00`; return [f(d), f(e)]; }
function gcalLink() { const [a, b] = calTimes(); return "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + encodeURIComponent("Học tiếng Anh") + "&details=" + encodeURIComponent("Mở app: " + location.origin) + "&dates=" + a + "/" + b + "&ctz=Asia/Ho_Chi_Minh&recur=" + encodeURIComponent("RRULE:FREQ=DAILY"); }
function downloadIcs() { const [a, b] = calTimes();
  const ics = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//LoTrinhTiengAnh//VI","BEGIN:VEVENT","UID:" + Date.now() + "@lotrinh","DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z",
    "DTSTART;TZID=Asia/Ho_Chi_Minh:" + a, "DTEND;TZID=Asia/Ho_Chi_Minh:" + b, "RRULE:FREQ=DAILY", "SUMMARY:Học tiếng Anh", "DESCRIPTION:Mở app: " + location.origin,
    "BEGIN:VALARM","ACTION:DISPLAY","DESCRIPTION:Đến giờ học tiếng Anh","TRIGGER:-PT0M","END:VALARM","END:VEVENT","END:VCALENDAR"].join("\r\n");
  const u = URL.createObjectURL(new Blob([ics], {type:"text/calendar"})), el = document.createElement("a"); el.href = u; el.download = "hoc-tieng-anh.ics"; document.body.appendChild(el); el.click(); el.remove(); setTimeout(() => URL.revokeObjectURL(u), 2000); }

/* =====================================================================
   THÔNG BÁO ĐẨY (nhắc học mỗi 2 tiếng, kể cả khi đóng app)
   ===================================================================== */
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const isStandalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
const pushSupported = () => "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
let PUSH = {on:false, checked:false};
async function swReg() { if (!("serviceWorker" in navigator)) return null; try { return await navigator.serviceWorker.register("/sw.js"); } catch (e) { console.warn("SW", e); return null; } }
async function checkPush() { try { const reg = await navigator.serviceWorker?.getRegistration(); const sub = await reg?.pushManager?.getSubscription(); PUSH = {on:!!sub && Notification.permission === "granted", checked:true}; } catch (e) { PUSH = {on:false, checked:true}; } }
function b64ToBytes(b) { const p = "=".repeat((4 - b.length % 4) % 4), s = atob((b + p).replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from(s, c => c.charCodeAt(0)); }
async function enablePush(btn) {
  if (isIOS() && !isStandalone()) return toast("Trên iPhone: mở app bằng Safari, bấm Chia sẻ → Thêm vào MH chính, rồi mở app từ biểu tượng ngoài màn hình để bật thông báo.");
  if (!pushSupported()) return toast("Trình duyệt này không hỗ trợ thông báo đẩy. Hãy dùng Chrome (Android/máy tính) hoặc Safari (iPhone, iOS 16.4 trở lên).");
  btn.disabled = true; btn.innerHTML = `<span class="spin"></span> Đang bật...`;
  try {
    const perm = await Notification.requestPermission();
    if (perm !== "granted") throw new Error("Bạn chưa cho phép thông báo. Vào cài đặt trình duyệt/điện thoại để cho phép thông báo của trang này.");
    const reg = await swReg() || await navigator.serviceWorker.ready;
    await navigator.serviceWorker.ready;
    const kr = await fetch("/api/push"); const kd = await kr.json(); if (!kd.publicKey) throw new Error(kd.error || "Server chưa cấu hình khóa thông báo");
    const sub = await reg.pushManager.getSubscription() || await reg.pushManager.subscribe({userVisibleOnly:true, applicationServerKey:b64ToBytes(kd.publicKey)});
    const r = await fetch("/api/push", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({subscription:sub.toJSON()})});
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "Không lưu được thiết bị");
    PUSH.on = true; toast("Đã bật nhắc học trên thiết bị này");
  } catch (e) { toast(e.message); }
  render();
}
async function disablePush() {
  try { const reg = await navigator.serviceWorker.getRegistration(); const sub = await reg?.pushManager.getSubscription();
    if (sub) { await fetch("/api/push", {method:"DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({endpoint:sub.endpoint})}); await sub.unsubscribe(); } } catch (e) {}
  PUSH.on = false; toast("Đã tắt nhắc học trên thiết bị này"); render();
}
async function testPush(btn) { btn.disabled = true; const r = await fetch("/api/push", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({test:true})}); const d = await r.json().catch(() => ({}));
  toast(r.ok ? "Đã gửi thông báo thử, kiểm tra thanh thông báo" : (d.error || "Gửi thử thất bại")); btn.disabled = false; }

/* =====================================================================
   HÀNH ĐỘNG (data-a)
   ===================================================================== */
const ACT = {
  pushAsk: async (v, btn) => { S.profile.pushAsked = true; save(); if (v === "1") await enablePush(btn); else render(); },
  chAgree: () => { S.profile.chatOK = true; save(); chPoll(true); render(); },
  chTab: v => { CH.tab = v; CH.pair = null; CH.msgs = []; CH.last = 0; CH.menu = null; render(); chPoll(true); },
  chRoom: v => { CH.room = v; CH.msgs = []; CH.last = 0; render(); chPoll(true); },
  chSend: () => chSend(),
  chRec: () => chRecStart(), chRecStop: () => chRecStop(false), chRecCancel: () => chRecStop(true),
  chMatch: async () => { CH.lastMatch = Date.now(); try { const d = await chApi({action:"match", level:S.level || "A1"}); if (d.room) { toast("Đã ghép! Bạn ấy có thể chưa online, cứ chào trước nhé 👋"); chOpen(d.room.id); } else { CH.waiting = true; render(); } } catch (e) { toast(e.message); } },
  chCancel: async () => { try { await chApi({action:"cancel"}); } catch (e) {} CH.waiting = false; render(); },
  chOpen: v => chOpen(v),
  chBlocks: async () => { CH.showBlocks = !CH.showBlocks; if (CH.showBlocks) { try { const r = await timeoutFetch("/api/chat?blocks=1", {}, 10000); CH.blocks = (await r.json()).blocks || []; } catch (e) { CH.blocks = []; } } render(); },
  chUnblock: async v => { const [key, reopen] = String(v).split("|"); try { const d = await chApi({action:"unblock", key, reopen:reopen === "1"}); CH.blocks = (CH.blocks || []).filter(b => b.key !== key); toast("Đã bỏ chặn"); if (d.room) return chOpen(d.room); render(); chPoll(true); } catch (e) { toast(e.message); } },
  chHMenu: () => { CH.hmenu = !CH.hmenu; render(); },
  chMute: async v => { try { await chApi({action:"mute", room:CH.pair.id, on:v === "1"}); if (CH.pairInfo) CH.pairInfo.muted = v === "1"; CH.hmenu = false; toast(v === "1" ? "🔕 Đã tắt thông báo của cuộc trò chuyện này. Tin nhắn vẫn hiện trong hộp thư." : "🔔 Đã bật lại thông báo"); render(); } catch (e) { toast(e.message); } },
  chBlockRoom: async (v, btn) => { if (!btn.dataset.c) { btn.dataset.c = 1; btn.textContent = "Bấm lần nữa để chặn"; btn.classList.add("danger"); return; }
    try { await chApi({action:"blockRoom", room:v}); toast("Đã chặn. Bạn sẽ không bao giờ thấy tin, bị ghép hay nhận thông báo từ người này nữa."); } catch (e) { return toast(e.message); }
    CH.inbox = (CH.inbox || []).filter(r => r.id !== v); CH.pair = null; CH.msgs = []; CH.last = 0; render(); chPoll(true); },
  chBack: () => { CH.pair = null; CH.msgs = []; CH.last = 0; render(); chPoll(true); },
  chKeep: async v => { try { const d = await chApi({action:"keep", room:CH.pair.id, on:v === "1"}); toast(d.saved ? "⭐ Hai bạn đã là bạn chat!" : v === "1" ? "Đã bấm giữ. Chờ bạn ấy đồng ý nhé." : "Đã bỏ giữ"); chPoll(false); if (CH.pairInfo) { CH.pairInfo.mineKeep = v === "1"; CH.pairInfo.saved = !!d.saved; } render(); } catch (e) { toast(e.message); } },
  chLeave: async (v, btn) => { if (!btn.dataset.c) { btn.dataset.c = 1; btn.textContent = "Bấm lần nữa để xác nhận"; return; }
    try { await chApi({action:"leave", room:CH.pair?.id}); } catch (e) {} CH.pair = null; CH.msgs = []; CH.last = 0; render(); chPoll(true); },
  chRecall: async v => { try { await chApi({action:"recall", id:Number(v)}); const m = CH.msgs.find(x => x.id === Number(v)); if (m) { m.recalled = true; m.text = ""; m.audio = null; } CH.menu = null; render(); } catch (e) { toast(e.message); } },
  chMenu: v => { CH.menu = v ? Number(v) : null; render(); },
  chReport: async v => { const [id, reason] = String(v).split("|"); try { await chApi({action:"report", id:Number(id), reason}); CH.menu = null; toast("Đã gửi báo cáo. Cảm ơn bạn!"); chPoll(true); } catch (e) { toast(e.message); } },
  chBlock: async v => { try { await chApi({action:"block", id:Number(v)}); CH.menu = null; CH.msgs = CH.msgs.filter(m => m.id !== Number(v)); toast("Đã chặn. Bạn sẽ không thấy tin nhắn của người này nữa."); if (CH.tab === "pair") { CH.pair = null; CH.msgs = []; CH.last = 0; } chPoll(true); } catch (e) { toast(e.message); } },
  festFx: v => { S.profile.festFx = v === "true"; save(); applyFestive(); render(); toast(v === "true" ? "Đã bật hiệu ứng rơi" : "Đã tắt hiệu ứng rơi"); },
  go: v => { view = v; Q = null; FC = null; closePop(); UI.menu = false; render(); scrollTo(0, 0); if (v === "chat") chPoll(true); },
  speak: v => say(v),
  slow: v => say(v, Math.max(0.45, ttsRate() - 0.25)),
  pron: v => { const l = L(), [kind, i] = v.split(":"), w = l.les.words[Number(i)], target = kind === "w" ? w.w : w.ex;
    startRec(v, r => { l.pron[v] = pronScore(target, r.text, r.alts); l.scores.speaking = Math.round(avg(Object.values(l.pron).map(x => x.score))); save(); }); },
  qMic: () => startRec("q", r => answer(r)),
  rpMic: () => startRec("rp", r => rpSend(r.text)),
  micTest: () => startRec("test", r => toast(`Máy nghe được: "${r.text}"`)),
  autospeak: () => { pref("ep_autospeak", autoSpeak() ? "0" : "1"); render(); },
  hidetext: () => { pref("ep_hidetext", hideText() ? "0" : "1"); render(); },
  reveal: v => { const l = L(); l.reveal = [...(l.reveal || []), Number(v)]; render(); },
  ttsRate: v => { pref("ep_rate", v); render(); say("This is the new speaking speed."); },
  closePop,
  pick: v => answer(v), submitQ: () => answer($("#qin")?.value || ""), nextQ: () => nextQ(),
  quitQuiz: () => { const m = Q?.mode; Q = null; view = m === "review" ? "review" : "home"; render(); },
  startPlacement, skipPlacement: () => { S.placement = {level:"A0", correct:0, total:0, date:today()}; save(); view = "placeResult"; render(); },
  confirmPath: () => { S.level = S.placement.level; buildPath(); view = "home"; render(); toast("Đã tạo lộ trình. Bắt đầu buổi 1 thôi!"); prefetchNext(); },
  svGoal: v => { SV.goal = v; SV.fields = []; SV.subs = []; render(); },
  svField: v => { const f = FIELDS[SV.goal][v][0];
    if (SV.fields.includes(f)) { SV.fields = SV.fields.filter(x => x !== f); SV.subs = SV.subs.filter(x => !x.startsWith(f + ": ")); } else SV.fields = [...SV.fields, f]; render(); },
  svSub: v => { SV.subs = SV.subs.includes(v) ? SV.subs.filter(x => x !== v) : [...SV.subs, v]; render(); },
  svSubAll: () => { SV.subs = subGroups(SV).flatMap(f => subsOf(SV.goal, f).map(x => f + ": " + x)); render(); },
  svMin: v => { SV.minutes = Number(v); render(); },
  svWeak: v => { SV.weak = SV.weak.includes(v) ? SV.weak.filter(x => x !== v) : [...SV.weak, v]; render(); },
  svSubmit: () => { S.profile = {...SV}; save(); SV = null; view = S.level ? "settings" : "home"; render(); if (S.level) toast("Đã lưu mục tiêu. Các buổi học tới sẽ theo lĩnh vực mới."); },
  editGoal: () => { SV = newSv(S.profile); view = "survey"; render(); },
  startLesson, startUnit, exitLesson: () => { save(); Q = null; view = "home"; render(); },
  step: v => setStep(Number(v)),
  vnext: () => { const l = L(); l.vi++; if (l.vi === l.les.words.length) l.les.words.forEach(w => addCard(w, "lesson")); if (l.vi > l.les.words.length) Q = makeQuiz("vcheck", vcheckItems(), true); save(); render(); },
  vprev: () => { const l = L(); l.vi = Math.max(0, l.vi - 1); render(); },
  grade3, grade4, rpSend, rpHint, rpEnd, rpAgain: () => { L().rpEval = null; render(); },
  finishLesson: v => finishLesson(v),
  nextCourse: () => { S.courses.push({...S.path, end:today()}); checkBadges(); S.level = S.path.to; S.difficulty = 0; buildPath(); view = "home"; render(); toast("Bắt đầu khóa mới!"); },
  rtab: v => { UI.rtab = v; render(); },
  startFlip: v => { const set = v === "hard" ? hardCards() : v === "all" ? shuffle(cardList()).slice(0, 20) : dueCards();
    FC = {keys:set.slice(0, 30).map(c => c.w.w.toLowerCase()), i:0, flip:false}; view = "flip"; render(); },
  flip: () => { FC.flip = !FC.flip; render(); if (FC.flip) say(S.cards[FC.keys[FC.i]]?.w.w || ""); },
  rate: v => { review(FC.keys[FC.i], Number(v)); FC.i++; FC.flip = false; render(); },
  startRQuiz: v => { const [set, mode] = v.split(":"), cards = (set === "hard" ? hardCards() : dueCards()).slice(0, 15), pool = cardList().map(c => c.w);
    Q = makeQuiz("review", shuffle(cards).map(c => mode === "type" ? spellQ(c.w)
      : mode === "listen" ? {type:"type", q:"Nghe và gõ lại từ", ans:c.w.w, speak:c.w.w, autoplay:true, skill:"listening", word:c.w.w, hint:"nghĩa là " + c.w.vi}
      : mode === "speak" ? {type:"speak", q:c.w.ex || c.w.w, ans:c.w.ex || c.w.w, skill:"speaking", word:c.w.w}
      : meaningQ(c.w, pool)), true); view = "quiz"; render(); },
  cdel: v => { delete S.cards[v]; save(); render(); },
  hx: v => { UI.hx = UI.hx === Number(v) ? null : Number(v); render(); },
  addLooked: (v, btn) => { const d = S.dict[v] || (() => { const kw = knownWord(v); return kw && {headword:kw.w, ipa:kw.ipa, pos:kw.pos, meaning:kw.vi, examples:[{en:kw.ex, vi:kw.ex_vi}]}; })(); if (!d) return;
    addCard({w:d.headword, ipa:d.ipa || "", pos:d.pos || "", vi:d.meaning, ex:d.examples?.[0]?.en || "", ex_vi:d.examples?.[0]?.vi || ""}, "lookup"); save(); btn.textContent = "Đã thêm vào flashcard"; btn.disabled = true; btn.classList.remove("primary"); renderHeader(); },
  addVi: (v, btn) => { let d; try { d = JSON.parse(POP?.dataset.vi || "null"); } catch (e) {} if (!d?.en) return;
    addCard({w:d.en, ipa:d.ipa || "", pos:d.pos || "", vi:d.word_vi, ex:d.examples?.[0]?.en || "", ex_vi:d.examples?.[0]?.vi || ""}, "lookup"); save();
    btn.textContent = "Đã thêm vào flashcard"; btn.disabled = true; btn.classList.remove("primary"); renderHeader(); },
  skipWait: () => cancelWait?.(),
  pushOn: (v, btn) => enablePush(btn), pushOff: disablePush, pushTest: (v, btn) => testPush(btn),
  remEvery: v => { S.profile.remindEvery = Number(v); save(); render(); },
  probeAI: () => probeAI(),
  remTone: v => { S.profile.remindTone = v; save(); render(); toast(v === "soft" ? "Lời nhắc sẽ nhẹ nhàng" : "Lời nhắc sẽ lầy lội 😈"); },
  remToggle: () => { S.profile.remindOn = !remindCfg().on; save(); render(); toast(S.profile.remindOn ? "Đã bật nhắc học" : "Đã tắt nhắc học"); },
  closeCelebrate: () => { UI.celebrate = []; render(); },
  tr: v => doTranslate(v),
  popTr: async (v, btn) => { const sl = btn.dataset.sl || "vi", tl = sl === "vi" ? "en" : "vi", out = POP?.querySelector(".pop-tr"); if (!out) return;
    btn.disabled = true; out.innerHTML = `<span class="spin"></span> Đang dịch...`;
    try { const r = await timeoutFetch(`/api/translate?sl=${sl}&tl=${tl}&q=${encodeURIComponent(v)}`, {}, 15000); const d = await r.json(); if (!r.ok) throw new Error(d.error);
      const ipa = await sentIPA(sl === "en" ? v : d.text); out.innerHTML = `<div class="tr-out">${esc(d.text)}${ipa ? `<span class="ipa tr-ipa">${esc(ipa)}</span>` : ""}<em>${esc(d.engine)}</em></div>`; } catch (e) { out.innerHTML = `<p class="muted small">Chưa dịch được: ${esc(e.message || "lỗi")}</p>`; }
    btn.disabled = false; },
  ics: downloadIcs,
  notify: async () => { try { await Notification.requestPermission(); } catch (e) {} render(); },
  checkAI: async (v, btn) => { btn.innerHTML = `<span class="spin"></span>`; await checkAI(); render(); toast(AI.on ? "Key và model hợp lệ" : "Gemini chưa dùng được: " + AI.msg); },
  fs: v => { pref("ep_fs", v); applyPrefs(); render(); },
  theme: v => { pref("ep_theme", v); applyPrefs(); render(); },
  menu: () => { UI.menu = !UI.menu; renderHeader(); },
  reset: (v, btn) => { if (!btn.dataset.c) { btn.dataset.c = 1; btn.textContent = "Bấm lần nữa để xác nhận xóa"; return; }
    S = blank(); Q = null; FC = null; SV = null; pushState(); view = "home"; render(); toast("Đã xóa tiến độ"); },
};
const CHANGE = {
  setBday: v => { S.profile.birthday = v || ""; save(); applyFestive(); render(); toast(v ? "Đã lưu ngày sinh 🎂" : "Đã xoá ngày sinh"); },
  setFest: v => { S.profile.festive = v; save(); applyFestive(); render(); },
  setRemind: v => { S.profile.remind = v; if (toMin(S.profile.remindEnd || "23:00") < toMin(v)) S.profile.remindEnd = v; save(); render(); toast("Đã lưu giờ nhắc"); },
  setRemindEnd: v => { S.profile.remindEnd = toMin(v) < toMin(remindTime()) ? remindTime() : v; save(); render(); toast("Đã lưu giờ nhắc"); }, setVoice: v => { pref("ep_voice", v); say("Hello! Nice to meet you."); } };

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
const chRoomId = () => CH.tab === "pair" ? CH.pair?.id : (CH.room || "lv-" + (CH_LEVELS.includes(S.level) ? S.level : "A1"));
async function chApi(body) {
  const r = await timeoutFetch("/api/chat", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body)}, 30000);
  const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.error || "lỗi " + r.status); return d;
}
async function chPoll(reset) {
  if (view !== "chat" || document.visibilityState !== "visible" || !S.profile?.chatOK) return chBadge();
  const lv = encodeURIComponent(S.level || "");
  try {
    if (CH.tab === "pair" && !CH.pair) {           // danh sách cuộc trò chuyện 1-1
      const r = await timeoutFetch(`/api/chat?inbox=1&lv=${lv}`, {}, 10000), d = await r.json(); if (!r.ok) throw new Error(d.error);
      // Đang chờ: cứ 15 giây thử ghép lại
      if (d.waiting && Date.now() - (CH.lastMatch || 0) > 15000) { CH.lastMatch = Date.now(); try { const m = await chApi({action:"match", level:S.level || "A1"}); if (m.room) { toast("Đã ghép với một bạn luyện tập 🎉"); return chOpen(m.room.id); } } catch (e) {} }
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
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) return toast("Trình duyệt này chưa hỗ trợ ghi âm");
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
      const sec = (Date.now() - rec.start) / 1000; if (sec < 1) return toast("Đoạn ghi âm quá ngắn");
      const blob = new Blob(chunks, {type:mr.mimeType || type || "audio/webm"});
      const b64 = await new Promise(res => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(",")[1]); fr.readAsDataURL(blob); });
      CH.sending = true; render();
      try { await chApi({action:"send", room:chRoomId(), audio:b64, mime:blob.type, sec}); await chPoll(false); chScroll(); } catch (e) { toast(e.message); }
      CH.sending = false; render();
    };
    mr.start(); CH.timer = setInterval(() => { const el = $("#recT"); const s = Math.floor((Date.now() - CH.rec.start) / 1000); if (el) el.textContent = `0:${String(s).padStart(2, "0")}`; if (s >= 60) mr.stop(); }, 250);
    render();
  } catch (e) { toast("Chưa có quyền dùng micro"); }
}
function chRecStop(cancel) { if (!CH.rec) return; CH.rec.cancel = !!cancel; CH.rec.mr.stop(); }

function vChat() {
  const age = ageYears();
  if (age !== null && age < 16) return `<div class="wrap narrow"><section class="panel center">${mascot("happy", 90)}<h2>Cộng đồng dành cho người từ 16 tuổi</h2>
    <p class="muted">Phần trò chuyện với người lạ chỉ mở cho người từ 16 tuổi trở lên. Bạn vẫn có thể luyện nói với AI trong bước Role-play của mỗi bài học nhé!</p></section></div>`;
  if (!S.profile.chatOK) return `<div class="wrap narrow"><section class="panel">${stk("chat", 64, "corner", 8)}<p class="eyebrow">Cộng đồng</p><h2>Trò chuyện ẩn danh để cùng luyện tiếng Anh</h2>
    <p>Gặp những người cũng đang học, cùng luyện nói, hỏi đáp và động viên nhau. Không ai biết bạn là ai: mỗi ngày bạn có một biệt danh ngẫu nhiên.</p>
    <h3>Nội quy</h3><ul class="rules">
     <li>🙂 Tôn trọng và lịch sự. Không xúc phạm, quấy rối, phân biệt đối xử.</li>
     <li>🔒 Không chia sẻ thông tin cá nhân: số điện thoại, địa chỉ, mạng xã hội, đường link (app sẽ chặn).</li>
     <li>🚫 Không nội dung người lớn, bạo lực, lừa đảo, quảng cáo.</li>
     <li>🗣️ Ưu tiên nói tiếng Anh; dùng tiếng Việt khi cần hỏi bài.</li>
     <li>🚩 Gặp người vi phạm: bấm ⋯ ở tin nhắn để <b>Báo cáo</b> hoặc <b>Chặn</b>. Người bị nhiều báo cáo sẽ bị khoá chat.</li>
     <li>🎤 Tin nhắn giọng nói được lưu tối đa 30 ngày rồi tự xoá.</li></ul>
    <p class="muted small">Chỉ dành cho người từ 16 tuổi trở lên.</p>
    <button class="primary big" data-a="chAgree">Tôi đồng ý, vào cộng đồng</button></section></div>`;
  const room = chRoomId(), lv = (CH.room || "lv-" + S.level).replace("lv-", "");
  const tabs = `<div class="row chtabs"><button class="seg ${CH.tab === "room" ? "sel" : ""}" data-a="chTab" data-v="room">💬 Phòng chung</button><button class="seg ${CH.tab === "pair" ? "sel" : ""}" data-a="chTab" data-v="pair">🤝 Ghép đôi 1-1</button>
    ${CH.me ? `<span class="muted small">Hôm nay bạn là <b>${CH.me.icon} ${esc(CH.me.name)}</b></span>` : ""}</div>`;
  let head = "";
  if (CH.tab === "room") head = `<div class="row">${[...CH_LEVELS, "ALL"].map(k => `<button class="mini seg ${(CH.room || "lv-" + (CH_LEVELS.includes(S.level) ? S.level : "A1")) === "lv-" + k ? "sel" : ""}" data-a="chRoom" data-v="lv-${k}">${k === "ALL" ? "Mọi trình độ" : k}</button>`).join("")}</div>
     <p class="muted small">Phòng ${lv === "ALL" ? "chung cho mọi trình độ" : "trình độ " + lv}: hỏi đáp, chia sẻ mẹo học, luyện viết câu.</p>`;
  else if (!CH.pair) {
    const list = (CH.inbox || []).map(r => `<div class="inbox-item"><button class="inbox-row" data-a="chOpen" data-v="${r.id}"><span class="cav" style="--h:${r.partner.hue}">${r.partner.icon}</span>
      <span class="grow"><b>${esc(r.partner.name)}</b>${r.saved ? ` <span class="tag good">⭐ Bạn chat</span>` : r.theirKeep ? ` <span class="tag">muốn giữ cuộc trò chuyện</span>` : ""}<br><span class="muted small">${esc(r.preview || "Chưa có tin nhắn, hãy chào bạn ấy nhé!")}</span></span>
      ${r.muted ? `<span title="Đã tắt thông báo">🔕</span>` : ""}${r.unread ? `<span class="badge">${r.unread}</span>` : ""}</button>
      <button class="mini ghost inbox-x" data-a="chBlockRoom" data-v="${r.id}" title="Chặn người này, không bao giờ thấy tin của họ nữa">⛔</button></div>`).join("");
    return `<div class="wrap narrow">${tabs}<section class="panel">
      <div class="row between nowrap"><div><h2>Ghép đôi 1-1</h2><p class="muted small">Ghép ngay với một người cùng trình độ, kể cả khi họ chưa online: họ sẽ nhận thông báo và trả lời sau.</p></div>${mascot(CH.waiting ? "think" : "cheer", 70, CH.waiting ? "bob" : "")}</div>
      ${CH.waiting ? `<div class="row"><span class="spin"></span><span>Chưa có ai phù hợp. App sẽ tự ghép khi có người vào (bạn có thể rời trang này).</span><button class="mini" data-a="chCancel">Huỷ tìm</button></div>`
        : `<button class="primary big" data-a="chMatch">🔍 Tìm bạn luyện tập mới</button>`}
      <h3>Cuộc trò chuyện của bạn</h3>
      ${list ? `<div class="inbox">${list}</div>` : `<p class="muted">Chưa có cuộc trò chuyện nào.</p>`}
      <p class="muted small">⛔ Không muốn nói chuyện với ai: bấm ⛔ để chặn. Bạn sẽ không bao giờ thấy tin, bị ghép lại hay nhận thông báo từ người đó. <a href="#" data-a="chBlocks">${CH.showBlocks ? "Ẩn danh sách đã chặn" : "Xem người đã chặn / bỏ chặn"}</a></p>
      ${CH.showBlocks ? `<div class="inbox">${(CH.blocks || []).length ? CH.blocks.map(b => `<div class="inbox-item blk"><span class="cav" style="--h:${b.who.hue}">${b.who.icon}</span><span class="grow"><b>${esc(b.who.name)}</b><br><span class="muted small">Chặn lúc ${new Date(b.at).toLocaleString("vi-VN")}</span></span>
        <button class="mini" data-a="chUnblock" data-v="${b.key}|0">Bỏ chặn</button>${b.room ? `<button class="mini" data-a="chUnblock" data-v="${b.key}|1">Bỏ chặn & mở lại chat</button>` : ""}</div>`).join("") : `<p class="muted small">Bạn chưa chặn ai.</p>`}</div>` : ""}
      <p class="muted small">⭐ Khi cả hai cùng bấm <b>Giữ cuộc trò chuyện</b>, hai bạn thành <b>bạn chat</b>: tin nhắn được giữ lại để nhắn với nhau mỗi ngày, nhưng vẫn chỉ thấy biệt danh của nhau. Cuộc trò chuyện chưa giữ sẽ tự xoá sau 30 ngày.</p></section></div>`;
  }
  else {
    const P = CH.pairInfo || {}, w = P.partner;
    head = `<div class="phead"><button class="mini ghost" data-a="chBack" aria-label="Quay lại">←</button>${w ? `<span class="cav" style="--h:${w.hue}">${w.icon}</span><span class="pname"><b>${esc(w.name)}</b>${P.level ? ` <span class="tag">${esc(P.level)}</span>` : ""}${P.muted ? " 🔕" : ""}</span>` : `<span class="pname"></span>`}
      ${P.saved ? `<span class="tag good">⭐ Bạn chat</span>` : `<button class="mini ${P.mineKeep ? "sel" : ""}" data-a="chKeep" data-v="${P.mineKeep ? 0 : 1}" title="Giữ cuộc trò chuyện">${P.mineKeep ? "✓ Đã giữ" : "⭐ Giữ"}</button>`}
      <button class="mini" data-a="chHMenu" aria-label="Tuỳ chọn" aria-expanded="${CH.hmenu ? "true" : "false"}">⋯</button></div>
      ${CH.hmenu ? `<div class="cmenu row hmenu"><button class="mini" data-a="chMute" data-v="${P.muted ? 0 : 1}">${P.muted ? "🔔 Bật lại thông báo" : "🔕 Tắt thông báo"}</button>
        <button class="mini" data-a="chLeave">${P.saved ? "Huỷ bạn chat" : "Kết thúc"}</button><button class="mini danger" data-a="chBlockRoom" data-v="${CH.pair.id}">⛔ Chặn</button></div>` : ""}
      ${!P.saved && P.mineKeep ? `<p class="muted small">Đang chờ bạn ấy cũng bấm “Giữ”. Khi cả hai cùng giữ, tin nhắn sẽ không bị xoá.</p>` : !P.saved && P.theirKeep ? `<p class="fb small">⭐ Bạn ấy muốn giữ cuộc trò chuyện này. Bấm “Giữ cuộc trò chuyện” để thành bạn chat!</p>` : ""}
      ${CH.closed ? `<p class="fb small">Cuộc trò chuyện đã kết thúc.</p>` : ""}`;
  }
  const bubble = m => {
    const ws = (m.text || "").split(/\s+/).filter(Boolean), vi = ws.filter(w => VIx.test(w)).length > Math.max(1, ws.length * 0.3); // chủ yếu là tiếng Việt
    const body = m.recalled ? `<span class="muted"><i>${m.mine ? "Bạn đã thu hồi một tin nhắn" : "Tin nhắn đã được thu hồi"}</i></span>` : m.hidden ? `<span class="muted">(Tin nhắn đã bị ẩn do vi phạm)</span>`
      : m.audio ? `<audio controls preload="none" src="${esc(m.audio)}"></audio><span class="muted small"> ${m.sec}s</span>`
      : vi ? esc(m.text) + trBtn(m.text, "vi", "en", "Xem tiếng Anh") : tw(m.text) + ` <button class="mini" data-a="speak" data-v="${esc(m.text)}" aria-label="Nghe">🔊</button>${trBtn(m.text, "en", "vi")}`;
    return `<div class="cmsg ${m.mine ? "mine" : ""}">${m.mine ? "" : `<span class="cav" style="--h:${m.who.hue}">${m.who.icon}</span>`}<div class="cbody">${m.mine ? "" : `<b class="cname">${esc(m.who.name)}</b>`}<div class="msg ${m.mine ? "user" : "ai"}${m.recalled ? " recalled" : ""}">${body}</div>
      <span class="ctime">${new Date(m.at).toLocaleTimeString("vi-VN", {hour:"2-digit", minute:"2-digit"})}${m.hidden || m.recalled ? "" : ` · <a href="#" data-a="chMenu" data-v="${m.id}">⋯</a>`}</span>
      ${CH.menu === m.id && m.mine ? `<div class="row cmenu"><button class="mini danger" data-a="chRecall" data-v="${m.id}">↩️ Thu hồi</button><button class="mini ghost" data-a="chMenu" data-v="">Đóng</button></div>` : ""}
      ${CH.menu === m.id && !m.mine ? `<div class="row cmenu"><span class="small">🚩 Báo cáo:</span>${["Thô tục", "Quấy rối", "Nội dung người lớn", "Lừa đảo/quảng cáo", "Khác"].map(r => `<button class="mini" data-a="chReport" data-v="${m.id}|${r}">${r}</button>`).join("")}<button class="mini" data-a="chBlock" data-v="${m.id}">⛔ Chặn người này</button><button class="mini ghost" data-a="chMenu" data-v="">Đóng</button></div>` : ""}</div></div>`;
  };
  const canSend = room && !CH.closed && !CH.ban;
  return `<div class="wrap narrow">${tabs}<section class="panel">${head}
    <div class="chat cbox" id="chbox">${CH.msgs.length ? CH.msgs.map(bubble).join("") : `<p class="muted center">${CH.err ? esc(CH.err) : "Chưa có tin nhắn nào. Hãy chào mọi người nhé: “Hi everyone! 👋”"}</p>`}</div>
    ${CH.ban ? `<p class="fb small">Bạn đang bị tạm khoá trò chuyện đến ${new Date(CH.ban.until).toLocaleString("vi-VN")} do bị báo cáo vi phạm.</p>` : ""}
    ${canSend ? (CH.rec ? `<div class="row recbar"><span class="recdot"></span><b id="recT">0:00</b><span class="muted small">Đang ghi âm (tối đa 60 giây)</span><button class="ghost" data-a="chRecCancel">Huỷ</button><button class="primary" data-a="chRecStop">Dừng & gửi</button></div>`
      : `<div class="row nowrap"><label class="sr" for="chIn">Tin nhắn</label><input id="chIn" data-enter="chSend" maxlength="500" placeholder="Viết bằng tiếng Anh (hoặc hỏi bằng tiếng Việt)..." autocomplete="off">
         <button class="round" data-a="chRec" aria-label="Ghi âm" title="Gửi tin nhắn giọng nói">🎤</button><button class="primary" data-a="chSend" ${CH.sending ? "disabled" : ""}>${CH.sending ? "..." : "Gửi"}</button></div>`) : ""}
    <p class="muted small">Ẩn danh · Không chia sẻ thông tin cá nhân · Bấm vào từ tiếng Anh để tra nghĩa · ⋯ để thu hồi, báo cáo hoặc chặn.</p></section></div>`;
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
  tet:      {name:"Tết Nguyên Đán", emo:["🧧","🌸","🏮","🎆"], msg:"Chúc mừng năm mới! Năm mới học tiếng Anh tiến bộ vượt bậc nhé 🧧"},
  valentine:{name:"Lễ Tình nhân 14/2", emo:["💖","💌","🌹","💕"], msg:"Happy Valentine's Day! Học thêm vài câu tỏ tình bằng tiếng Anh nào 💌"},
  women83:  {name:"Quốc tế Phụ nữ 8/3", emo:["🌷","💐","🌸","💗"], msg:"Chúc mừng ngày 8/3! Gửi lời chúc tới những người phụ nữ tuyệt vời 💐"},
  founder:  {name:"Sinh nhật người sáng lập 18/3", emo:["🎨","🎵","🎻","🖌️","🎹","🎶","🌿","🎂"], msg:"Hôm nay 18/3 là sinh nhật người tạo ra app này, một người yêu hội họa, âm nhạc và thiên nhiên. Cảm ơn bạn đã cùng học, cùng yêu cái đẹp! 🎨🎵"},
  kids:     {name:"Quốc tế Thiếu nhi 1/6", emo:["🎈","🍭","🧸","🪁"], msg:"Happy Children's Day! Ai cũng có một đứa trẻ bên trong, học vui như chơi nhé 🎈"},
  midautumn:{name:"Tết Trung thu", emo:["🏮","🥮","🌕","⭐"], msg:"Trung thu vui vẻ! Thử kể về Tết Trung thu bằng tiếng Anh xem 🥮"},
  special1410:{name:"Ngày đặc biệt 14/10", emo:["💝","🌹","🎀","✨"], msg:"Happy birthday to someone very special 💝"},
  teacher:  {name:"Ngày Nhà giáo Việt Nam 20/11", emo:["📚","💐","🍎","✏️"], msg:"Chúc mừng ngày Nhà giáo Việt Nam 20/11! Tri ân những người thầy, người cô 💐"},
  newyear:  {name:"Tết Dương lịch", emo:["🎆","🥂","🎇","✨","🎉"], msg:"Happy New Year! Năm mới, mục tiêu mới: mỗi ngày thêm vài từ, cuối năm nói tiếng Anh thật tự tin 🎆"},
  xmas:     {name:"Giáng Sinh", emo:["🎄","❄️","🎁","⛄"], msg:"Merry Christmas! Giáng Sinh an lành và ấm áp 🎄"},
  birthday: {name:"Sinh nhật của bạn", emo:["🎂","🎉","🎈","🎁"], msg:""},
  // 4 mùa: thiên nhiên + nốt nhạc + nét cọ (tinh thần nghệ thuật của app), rơi thưa và nhẹ hơn ngày lễ
  spring:   {name:"Mùa xuân", emo:["🌸","🌱","🎵","🌼","🦋"], msg:"Xuân về, hoa nở. Gieo vài từ mới hôm nay, mai sẽ nở thành câu nói 🌸"},
  summer:   {name:"Mùa hè", emo:["🌻","🎶","🦋","🌊","☀️"], msg:"Hè rực rỡ! Học một bài nhẹ rồi nghe một bản nhạc tiếng Anh nhé ☀️🎶"},
  autumn:   {name:"Mùa thu", emo:["🍁","🍂","🎵","🎻"], msg:"Thu dịu dàng như một bản violin. Pha tách trà và học vài câu mới nào 🍂🎻"},
  winter:   {name:"Mùa đông", emo:["❄️","🎶","🎹","⛄"], msg:"Đông về, ngoài kia lạnh nhưng tiếng Anh của bạn vẫn ấm. Vào học thôi ❄️🎹"},
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
  const f = FEST[id], msg = id === "birthday" ? `Chúc mừng sinh nhật ${esc(displayName() || "bạn")}! 🎂 Chúc bạn tuổi mới thật nhiều niềm vui và nói tiếng Anh ngày càng giỏi. Happy birthday!` : esc(f.msg);
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
  const tabs = [["home", "Trang chủ"], ["path", "Lộ trình"], ["review", "Ôn tập"], ["chat", "Cộng đồng"], ["history", "Lịch sử"]];
  const due = dueCards().length, name = displayName() || ME?.email || "Bạn";
  const active = view === "settings" ? "" : view;
  h.innerHTML = `<div class="hin"><a href="#" class="brand" data-a="go" data-v="home"><span class="logo">${mascot("happy", 40)}</span><span><b>Lộ Trình</b><small>Tiếng Anh cá nhân hóa</small></span></a>
    ${focus ? "" : `<nav class="tabs-top" aria-label="Điều hướng">${tabs.map(([k, t]) => `<a href="#" class="${active === k ? "sel" : ""}" data-a="go" data-v="${k}">${t}${k === "review" && due ? `<span class="badge">${due}</span>` : k === "chat" && CH.unread ? `<span class="badge">${CH.unread}</span>` : ""}</a>`).join("")}</nav>`}
    <div class="tools">${S.level ? `<span class="lvl" title="Trình độ hiện tại">${S.level}</span>` : ""}
     <div class="usermenu"><button class="avatar" data-a="menu" aria-label="Tài khoản ${esc(ME?.email || "")}">${ME?.avatar ? `<img src="${esc(ME.avatar)}" alt="" referrerpolicy="no-referrer">` : esc(name[0].toUpperCase())}</button>
     ${UI.menu ? `<div class="menu"><div class="who"><b>${esc(displayName() || "Tài khoản")}</b><span>${esc(ME?.email || "")}</span></div>${ME?.admin ? `<a href="/admin">🛠️ Quản trị</a>` : ""}${S.path ? `<a href="#" data-a="go" data-v="settings">Cài đặt</a>` : ""}<a href="/auth/signout">Đăng xuất</a></div>` : ""}</div></div></div>`;
  const bn = $("#bnav");
  if (bn) { bn.hidden = focus; bn.innerHTML = focus ? "" : [...tabs, ["settings", "Cài đặt"]].map(([k, t]) => `<a href="#" class="${view === k ? "sel" : ""}" data-a="go" data-v="${k}">${t}${k === "review" && due ? `<span class="badge">${due}</span>` : k === "chat" && CH.unread ? `<span class="badge">${CH.unread}</span>` : ""}</a>`).join(""); }
}
function render() {
  const a = $("#app"); if (!a) return;
  if (view === "loading") return renderHeader();
  let html;
  if (view === "survey" || !S.profile) { if (!SV) SV = newSv(S.profile); view = "survey"; html = vSurvey(); }
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
  else { view = "home"; html = vHome(); }
  // Giữ nội dung đang gõ dở (câu tự đặt, bản dịch...) khi giao diện vẽ lại
  const keep = {}; a.querySelectorAll("textarea[id], input[id]").forEach(el => { if (el.value && !["qin", "rpIn", "rq"].includes(el.id) && !/^(sv-|remind)/.test(el.id)) keep[el.id] = el.value; });
  a.innerHTML = html;
  for (const id in keep) { const el = document.getElementById(id); if (el && !el.value && !el.disabled) el.value = keep[id]; }
  renderHeader();
  if (view === "lesson" && L()?.step === 4) scrollChat();
  if (Q && (view === "quiz" || view === "lesson") && !Q.pick) { const it = Q.items[Q.i]; if (it?.autoplay && Q.played !== Q.i) { Q.played = Q.i; setTimeout(() => say(it.speak), 350); } }
}

/* =====================================================================
   KHỞI ĐỘNG
   ===================================================================== */
(async () => {
  applyPrefs();
  const loadJs = (src, ok) => ok ? Promise.resolve() : new Promise(r => { const sc = document.createElement("script"); sc.src = src; sc.onload = r; sc.onerror = r; document.head.appendChild(sc); });
  await Promise.all([loadJs("/stickers.js?v=1", window.STICKERS), loadJs("/lessonbank.js?v=1", window.LESSON_BANK)]);
  if ("speechSynthesis" in window) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
  swReg().then(checkPush).then(() => { if (view === "settings") render(); });
  const app = $("#app");
  app.innerHTML = `<div class="wrap"><section class="panel center"><p><span class="spin"></span> Đang tải tiến độ của bạn...</p></section></div>`;
  AI = {on:false, msg:"đang kiểm tra kết nối..."};
  const meP = fetch("/api/me").then(r => r.ok ? r.json() : null).catch(() => null);
  S = await loadState(); BASE = Number(S.rev || 0); ME = await meP;
  if (new URLSearchParams(location.search).get("view") === "chat" && S.path) { view = "chat"; history.replaceState(null, "", "/"); setTimeout(() => chPoll(true), 300); } try { applyFestive(); } catch (e) {} setInterval(() => { try { applyFestive(); } catch (e) {} }, 30 * 60e3); render(); remindLoop(); setInterval(remindLoop, 60e3);
  // Kiểm tra Gemini chạy ngầm, không chặn giao diện
  checkAI().then(() => { if (!["lesson", "quiz", "flip"].includes(view)) render(); setTimeout(prefetchNext, 1500); });
  setInterval(async () => { if (AI.quota && Date.now() - (AI.quotaAt || 0) < 300e3) return; if (!AI.on || AI.busy) { const was = AI.on && !AI.busy; await checkAI(); if (AI.on && !AI.busy && !was && !["lesson", "quiz"].includes(view)) render(); } }, 180e3);
  window.__EP = {get S() { return S; }, render}; // hỗ trợ gỡ lỗi
})();
})();
