// scripts/home.js
import QrScanner from "https://cdn.jsdelivr.net/npm/qr-scanner@1.4.2/qr-scanner.min.js";
import { auth } from "./firebase-init.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { db } from "./firebase-init.js";

document.addEventListener("DOMContentLoaded", () => {
  const userNameDisplay   = document.getElementById("userName");
  const currentStampsDisp = document.getElementById("currentStamps");
  const stampGrid         = document.getElementById("stampGrid");
  const scanBtn           = document.getElementById("scanStampBtn");
  const historyBtn        = document.getElementById("historyBtn");
  const menuBtn           = document.getElementById("menuBtn");
  // --- Modal Elements for Scanner ---
  const qrModal           = document.getElementById("qrScannerModal");
  const closeQrModal      = document.getElementById("closeQrModal");
  const qrStatus          = document.getElementById("qrStatus");
  const qrReaderElem      = document.getElementById("qr-reader");
  let qrScanner           = null;
  let scanActive          = false;

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

  // 👉 Button navigation
menuBtn?.addEventListener("click", () => {
  window.open("images/canteen_menu_june_16th.png", "_blank");
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

  // ---- QR Scanner (qr-scanner library, animated orange corners) ----
  scanBtn.addEventListener('click', () => {
    scanActive = true;
    qrModal.classList.remove("hidden");
    qrStatus.textContent = "Scan the staff QR code at the till…";
    startQrScanner();
  });

  closeQrModal.addEventListener('click', () => {
    scanActive = false;
    stopQrScanner();
    qrModal.classList.add("hidden");
    qrStatus.textContent = '';
  });

  function startQrScanner() {
    if (qrScanner) {
      qrScanner.destroy();
      qrScanner = null;
    }
    qrReaderElem.srcObject = null;

    qrScanner = new QrScanner(
      qrReaderElem,
      async result => {
        if (!scanActive) return;
        scanActive = false;
        qrScanner.stop();

        let data;
        try {
          data = JSON.parse(result.data);
        } catch {
          showToast("Invalid QR code format.");
          setTimeout(() => {
            qrModal.classList.add("hidden");
          }, 900);
          return;
        }

        if (data.type === "staff" && data.code === "LOYALTEA") {
          // Award a stamp!
          try {
            const user = auth.currentUser;
            if (!user) {
              showToast("You are not signed in.");
              return;
            }
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
              showToast("User record not found.");
              return;
            }
            const userData = userSnap.data();
            const currentStamps = Number(userData.stamps) || 0;

            if (currentStamps < 9) {
              const newStamps = currentStamps + 1;
              await updateDoc(userRef, { stamps: newStamps, lastStampedAt: new Date().toUTCString() });

              //Play stamp sound!
              document.getElementById('stampSound')?.play();

              showToast("Stamp earned! You now have " + newStamps + " stamp" + (newStamps > 1 ? "s." : "."));
              // Optionally: update displayed stamps instantly
              if (currentStampsDisp) currentStampsDisp.textContent = newStamps;
              if (stampGrid) drawStamps(newStamps);
            } else {
              showToast("You have a reward ready! Please redeem it before collecting more stamps.");
              // Optionally: redirect to rewards page
              // window.location.href = "rewards.html";
            }
          } catch (err) {
            showToast("Error awarding stamp: " + err.message);
            console.error(err);
          }
        } else {
          showToast("Invalid staff QR code. Please try again.");
        }

        setTimeout(() => {
          qrModal.classList.add("hidden");
        }, 1000);
      },
      {
        highlightScanRegion: true,
        highlightCodeOutline: true,
        preferredCamera: 'environment'
      }
    );
    qrScanner.start();
  }

  function stopQrScanner() {
    if (qrScanner) {
      qrScanner.stop();
      qrScanner.destroy();
      qrScanner = null;
    }
    qrReaderElem.srcObject = null;
  }

  // Toast notification for status
  function showToast(message, timeout = 2600) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.style.display = "block";
    toast.style.opacity = "0.97";
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => { toast.style.display = "none"; }, 350);
    }, timeout);
  }

  // Optional: Close modal if user clicks outside modal-content
  qrModal.addEventListener('click', (e) => {
    if (e.target === qrModal) {
      stopQrScanner();
      qrModal.classList.add("hidden");
      qrStatus.textContent = '';
    }
  });
});
