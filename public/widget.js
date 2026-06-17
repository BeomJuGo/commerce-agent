// AI 커머스 고객 응대 위젯 로더
// 사용법: <script src="https://YOUR_DOMAIN/widget.js" data-shop="쇼핑몰 이름"></script>
(function () {
  var script = document.currentScript;
  var shop = (script && script.getAttribute("data-shop")) || "";
  // 스크립트 src에서 베이스 오리진 추출
  var base = "";
  try {
    base = new URL(script.src).origin;
  } catch (e) {
    base = "";
  }
  var widgetUrl = base + "/widget" + (shop ? "?shop=" + encodeURIComponent(shop) : "");

  var open = false;

  // 토글 버튼
  var btn = document.createElement("button");
  btn.setAttribute("aria-label", "AI 상담 열기");
  btn.innerHTML = "💬";
  Object.assign(btn.style, {
    position: "fixed",
    right: "20px",
    bottom: "20px",
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    border: "none",
    background: "#6366f1",
    color: "#fff",
    fontSize: "24px",
    cursor: "pointer",
    boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
    zIndex: "2147483000",
  });

  // iframe 컨테이너
  var frame = document.createElement("iframe");
  frame.src = widgetUrl;
  frame.title = "AI 상담";
  Object.assign(frame.style, {
    position: "fixed",
    right: "20px",
    bottom: "88px",
    width: "360px",
    maxWidth: "calc(100vw - 40px)",
    height: "540px",
    maxHeight: "calc(100vh - 120px)",
    border: "none",
    borderRadius: "16px",
    boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
    zIndex: "2147483000",
    display: "none",
    background: "#fff",
  });

  function toggle() {
    open = !open;
    frame.style.display = open ? "block" : "none";
    btn.innerHTML = open ? "✕" : "💬";
  }

  btn.addEventListener("click", toggle);

  function mount() {
    document.body.appendChild(frame);
    document.body.appendChild(btn);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
