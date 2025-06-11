// scripts/home.js
import { auth } from "./firebase-init.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { db } from "./firebase-init.js";

document.addEventListener("DOMContentLoaded", () => {
  const userNameDisplay   = document.getElementById("userName");
  const currentStampsDisp = document.getElementById("currentStamps");
  const stampGrid         = document.getElementById("stampGrid");
  const scanBtn           = document.getElementById("scanQrBtn");
  const historyBtn        = document.getElementById("historyBtn");
  const menuBtn           = document.getElementById("menuBtn");
  const wrapper           = document.getElementById("pageWrapper");
  const qrModal           = document.getElementById('qrScannerModal');
  const closeQrModal      = document.getElementById('closeQrModal');
  const qrStatus          = document.getElementById('qrStatus');
  let html5QrCode         = null;

  // 🔁 Show cached name & stamps instantly
  const cachedName = localStorage.getItem("firstName");
  if (cachedName && userNameDisplay) {
    userNameDisplay.textContent = cachedName;
  }

  const cachedStamps = localStorage.getItem("stamps");
  if (cachedStamps && currentStampsDisp) {
    currentStampsDisp.textContent = cachedStamps;
    drawStamps(parseInt(cachedStamps, 10));
  }

  // 👉 Button navigation
  historyBtn?.addEventListener("click", () => {
    window.location.href = "redeem-history.html";
  });

  menuBtn?.addEventListener("click", () => {
    //window.location.href = "menu.html";
  });

  // 🔄 Re-fetch user data from Firestore
  auth.onAuthStateChanged(async user => {
    if (!user) {
      console.warn("No user signed in. Redirecting…");
      return window.location.href = "index.html";
    }

    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        throw new Error("User doc missing");
      }

      const data = userSnap.data();
      const firstName = data.firstName || "friend";
      const stamps = data.stamps || 0;

      if (userNameDisplay) {
        userNameDisplay.textContent = firstName;
        localStorage.setItem("firstName", firstName);
      }

      if (currentStampsDisp) {
        currentStampsDisp.textContent = stamps;
        localStorage.setItem("stamps", stamps);
      }

      drawStamps(stamps);
    } catch (err) {
      console.error("Error getting user data:", err);
      if (userNameDisplay) userNameDisplay.textContent = "friend";
      if (currentStampsDisp) currentStampsDisp.textContent = "0";
    }
  });

  // ✅ Draw stamps based on count (filled stars + final cup)
  function drawStamps(count) {
    if (!stampGrid) return;
    stampGrid.innerHTML = "";
    for (let i = 1; i <= 9; i++) {
      const cell = document.createElement("div");
      cell.className = "stamp" + (i <= count ? " filled" : "");
      stampGrid.appendChild(cell);
    }
    const cup = document.createElement("div");
    cup.className = "stampcup";
    stampGrid.appendChild(cup);
  }

  scanBtn.addEventListener('click', () => {
    qrModal.style.display = 'flex';
    qrStatus.textContent = 'Align the staff QR code within the frame.';
    startQrScanner();
  });

  closeQrModal.addEventListener('click', () => {
    stopQrScanner();
    qrModal.style.display = 'none';
    qrStatus.textContent = '';
  });

  function startQrScanner() {
    const qrRegionId = "qr-reader";
    if (!html5QrCode) {
      html5QrCode = new Html5Qrcode(qrRegionId);
    }
    html5QrCode.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: 250
      },
      qrCodeMessage => {
        // Handle the scanned QR code here
        qrStatus.textContent = "Scanned! Processing...";
        stopQrScanner();
        qrModal.style.display = 'none';
        processStaffQr(qrCodeMessage);
      },
      errorMessage => {
        // Optionally show scan errors
        // qrStatus.textContent = errorMessage;
      }
    ).catch(err => {
      qrStatus.textContent = "Camera error: " + err;
    });
  }

  function stopQrScanner() {
    if (html5QrCode && html5QrCode.getState() === Html5QrcodeScannerState.SCANNING) {
      html5QrCode.stop().catch(() => {});
    }
    // Clear the camera preview
    document.getElementById('qr-reader').innerHTML = '';
  }

  // Example: handle the scanned staff QR code
  function processStaffQr(qrData) {
    // You should validate and send this to your backend/Firebase
    // Example: show a message
    alert("Staff QR scanned: " + qrData);

    // TODO: Add your logic to award a stamp here
  }

  // Optional: Close modal if user clicks outside modal-content
  qrModal.addEventListener('click', (e) => {
    if (e.target === qrModal) {
      stopQrScanner();
      qrModal.style.display = 'none';
      qrStatus.textContent = '';
    }
  });
});
