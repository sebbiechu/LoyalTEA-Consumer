import { auth } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import QRCode from "https://cdn.skypack.dev/qrcode";

document.addEventListener("DOMContentLoaded", () => {
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
      });
    } else {
      window.location.href = "index.html";
    }
  });
});
