import { auth } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import QRCode from "https://cdn.skypack.dev/qrcode";

document.addEventListener("DOMContentLoaded", () => {
  const spinner = document.getElementById("loadingSpinner");
  const qrContainer = document.querySelector(".qr-container");

  // Show spinner
  spinner.classList.remove("hidden");
  qrContainer.style.opacity = 0;

  onAuthStateChanged(auth, (user) => {
    if (user) {
      const uid = user.uid;
      document.getElementById("userId").textContent = uid;

      // Generate QR code
      QRCode.toCanvas(document.getElementById("qrcode"), uid, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000",
          light: "#fff"
        }
      }, (error) => {
        // Hide spinner + fade in container once QR is drawn
        if (!error) {
          spinner.classList.add("hidden");
          qrContainer.classList.add("fade-in");
        } else {
          console.error("QR Generation Error:", error);
        }
      });
    } else {
      window.location.href = "index.html";
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const closeBtn = document.getElementById("closeBtn");
  const qrWrapper = document.getElementById("qrWrapper");

  if (closeBtn && qrWrapper) {
    closeBtn.addEventListener("click", () => {
      qrWrapper.classList.add("page-slide-out-right");
      setTimeout(() => {
        window.location.href = "home.html";
      }, 400);
    });
  }
});
