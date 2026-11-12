// Nội dung mặc định của trang "Về SEED" (dùng khi chưa sửa trong admin)
export type About = { name: string; tagline_vi: string; tagline_en: string; bio_vi: string; bio_en: string; loves_vi: string; loves_en: string; quote_vi: string; quote_en: string; birthday: string; note_vi: string; note_en: string };
export const ABOUT_DEFAULT: About = {
  name: "Hồ Quốc Huy",
  tagline_vi: "Học tiếng Anh theo đúng mục tiêu của bạn, mỗi ngày một chút.",
  tagline_en: "Learn English around your own goals, a little every day.",
  bio_vi: "Một người yêu cái đẹp: yêu thiên nhiên, cây cối, những bức tranh và từng nốt nhạc, và yêu con người. SEED được tạo ra từ mong muốn giúp mỗi người học tiếng Anh nhẹ nhàng như chăm một mầm cây: mỗi ngày tưới một chút, rồi đến lúc sẽ nở hoa.",
  bio_en: "Someone who loves beautiful things: nature, plants, paintings, every note of music, and people. SEED grew from a wish to make learning English feel as gentle as tending a seedling: a little water every day, and one day it blooms.",
  loves_vi: "🌿 Thiên nhiên\n🎨 Hội hoạ\n🎵 Âm nhạc\n🎻 Nhạc cụ\n💚 Con người",
  loves_en: "🌿 Nature\n🎨 Painting\n🎵 Music\n🎻 Instruments\n💚 People",
  quote_vi: "Ngôn ngữ cũng như âm nhạc: không cần hoàn hảo, chỉ cần mỗi ngày được cất lên.",
  quote_en: "Language is like music: it doesn't have to be perfect, it just needs to be heard every day.",
  birthday: "18/3",
  note_vi: "Sinh nhật SEED cùng ngày với người sáng lập ({birthday}).",
  note_en: "SEED shares its birthday with its founder ({birthday}).",
};
