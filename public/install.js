/* Gợi ý "Thêm vào màn hình chính" nhanh cho SEED
   - Android / máy tính (Chrome, Edge, Samsung Internet): bắt sự kiện beforeinstallprompt → 1 nút "Cài đặt" là xong
   - iPhone / iPad (Safari): Apple không cho web tự cài, nên hiện hướng dẫn 2 bước có hình, chỉ đúng nút cần bấm
   - Mở trong Zalo / Facebook / Messenger: các app này chặn cài đặt → hướng dẫn mở bằng trình duyệt */
(() => {
  "use strict";
  const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  if (standalone) return;
  const KEY = "ep_install_hide";
  try { if (Date.now() < Number(localStorage.getItem(KEY) || 0)) return; } catch (e) {}
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const inApp = /FBAN|FBAV|FB_IAB|Instagram|Zalo|Messenger|Line\//i.test(ua);
  const mobile = ios || /Android/i.test(ua);
  const pick = (() => { try { return localStorage.getItem("ep_lang") || "auto"; } catch (e) { return "auto"; } })();
  const en = pick === "en" || (pick === "auto" && String(navigator.language || "").toLowerCase().startsWith("en"));
  const T = (vi, e) => (en ? e : vi);
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});

  const css = `.ins{position:fixed;left:12px;right:12px;bottom:calc(84px + env(safe-area-inset-bottom,0px));z-index:9999;max-width:460px;margin:0 auto;background:#fff;color:#2b2350;border-radius:22px;box-shadow:0 14px 40px -10px rgba(40,30,90,.45);padding:14px 16px;display:flex;gap:12px;align-items:center;font:600 15px/1.35 Nunito,system-ui,sans-serif;animation:insUp .35s ease-out}
  .ins img{width:48px;height:48px;border-radius:12px;flex:none}.ins .g{flex:1;min-width:0}.ins b{display:block;font-size:16px}.ins small{color:#6f6895;font-weight:600}
  .ins button{border:0;border-radius:99px;padding:10px 16px;font:800 14px Nunito,system-ui,sans-serif;cursor:pointer}.ins .go{background:#57a13e;color:#fff;box-shadow:0 3px 0 #3d7a2a}.ins .x{background:none;color:#8a84a8;padding:6px 8px;font-size:18px}
  .insS{position:fixed;inset:0;z-index:10000;background:rgba(20,15,40,.45);display:flex;align-items:flex-end;justify-content:center;animation:insFade .2s}
  .insS .sh{background:#fff;color:#2b2350;width:100%;max-width:480px;border-radius:26px 26px 0 0;padding:20px 20px calc(24px + env(safe-area-inset-bottom,0px));font:600 16px/1.45 Nunito,system-ui,sans-serif}
  .insS h3{margin:0 0 12px;font:800 20px 'Baloo 2',Nunito,sans-serif}.insS ol{margin:0;padding:0;list-style:none;display:grid;gap:12px}.insS li{display:flex;gap:12px;align-items:center;background:#f3f6ef;border-radius:16px;padding:10px 12px}
  .insS .n{width:28px;height:28px;border-radius:50%;background:#57a13e;color:#fff;display:grid;place-items:center;font-weight:900;flex:none}.insS .ic{width:30px;height:30px;flex:none}
  .insS .ok{margin-top:14px;width:100%;border:0;border-radius:99px;padding:13px;background:#57a13e;color:#fff;font:800 16px Nunito,sans-serif}
  .insS .arrow{position:fixed;left:50%;bottom:6px;transform:translateX(-50%);font-size:34px;animation:insBob 1s infinite}
  @keyframes insUp{from{transform:translateY(30px);opacity:0}}@keyframes insFade{from{opacity:0}}@keyframes insBob{50%{transform:translate(-50%,-8px)}}`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  const hide = (days) => { try { localStorage.setItem(KEY, String(Date.now() + days * 864e5)); } catch (e) {} document.querySelector(".ins")?.remove(); };
  const SHARE = '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="#1a73e8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>';
  const ADD = '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="#2b2350" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 8v8M8 12h8"/></svg>';

  function banner(text, sub, btn, onGo) {
    if (document.querySelector(".ins")) return;
    const d = document.createElement("div"); d.className = "ins"; d.setAttribute("role", "dialog");
    d.innerHTML = `<img src="/icon-192.png?v=5" alt=""><div class="g"><b>${text}</b><small>${sub}</small></div><button class="go">${btn}</button><button class="x" aria-label="${T("Đóng", "Close")}">✕</button>`;
    d.querySelector(".go").onclick = onGo; d.querySelector(".x").onclick = () => hide(7);
    document.body.appendChild(d);
  }
  function sheet(title, steps, arrow) {
    const s = document.createElement("div"); s.className = "insS";
    s.innerHTML = `<div class="sh"><h3>${title}</h3><ol>${steps.map((x, i) => `<li><span class="n">${i + 1}</span>${x}</li>`).join("")}</ol><button class="ok">${T("Đã hiểu", "Got it")}</button>${arrow ? '<div style="height:44px"></div>' : ''}</div>${arrow ? '<div class="arrow">⬇️</div>' : ""}`;
    s.onclick = (e) => { if (e.target === s || e.target.classList.contains("ok")) s.remove(); };
    document.body.appendChild(s);
  }

  // 1) Android / máy tính: cài 1 chạm
  let deferred = null;
  addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); deferred = e;
    setTimeout(() => banner(T("Cài SEED lên màn hình chính", "Install SEED on your home screen"), T("Mở nhanh như app, nhận nhắc học", "Opens like an app, with study reminders"), T("Cài đặt", "Install"),
      async () => { document.querySelector(".ins")?.remove(); deferred.prompt(); const r = await deferred.userChoice.catch(() => null); deferred = null; if (r?.outcome !== "accepted") hide(3); }), 2500);
  });
  addEventListener("appinstalled", () => hide(3650));

  // 2) Mở trong Zalo / Facebook: phải chuyển sang trình duyệt
  if (inApp && mobile) return setTimeout(() => banner(T("Mở bằng trình duyệt để cài app", "Open in your browser to install"), T(ios ? "Bấm ⋯ rồi chọn Mở trong Safari" : "Bấm ⋮ rồi chọn Mở bằng trình duyệt", ios ? "Tap ⋯ then Open in Safari" : "Tap ⋮ then Open in browser"),
    T("Xem cách", "How"), () => sheet(T("Mở SEED bằng trình duyệt", "Open SEED in your browser"), [T(`Bấm nút <b>⋯</b> hoặc <b>⋮</b> ở góc trên`, `Tap <b>⋯</b> or <b>⋮</b> in the top corner`), T(`Chọn <b>${ios ? "Mở trong Safari" : "Mở bằng trình duyệt"}</b>`, `Choose <b>${ios ? "Open in Safari" : "Open in browser"}</b>`), T("Ở trình duyệt, app sẽ hiện nút cài đặt", "The browser will then offer to install the app")])), 2500);

  // 3) iPhone / iPad (Safari): hướng dẫn 2 bước có hình, mũi tên chỉ xuống thanh công cụ
  if (ios) setTimeout(() => banner(T("Thêm SEED vào màn hình chính", "Add SEED to your home screen"), T("Chỉ 2 bước, mở nhanh như app", "Just 2 steps, opens like an app"), T("Thêm", "Add"),
    () => { document.querySelector(".ins")?.remove(); sheet(T("Thêm vào màn hình chính", "Add to Home Screen"), [
      `${SHARE}<span>${T("Bấm nút <b>Chia sẻ</b> ở thanh dưới cùng (hoặc góc trên bên phải trên iPad)", "Tap the <b>Share</b> button in the bottom bar (top right on iPad)")}</span>`,
      `${ADD}<span>${T("Kéo xuống, chọn <b>Thêm vào MH chính</b> rồi bấm <b>Thêm</b>", "Scroll down, tap <b>Add to Home Screen</b>, then <b>Add</b>")}</span>`], true); }), 2500);
})();
