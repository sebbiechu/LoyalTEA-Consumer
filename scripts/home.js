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
  if (scanBtn && wrapper) {
    scanBtn.addEventListener("click", e => {
      e.preventDefault();
      wrapper.classList.add("page-slide-out-left");
      setTimeout(() => {
        window.location.href = "qr.html";
      }, 400);
    });
  }

  historyBtn?.addEventListener("click", () => {
    window.location.href = "redeem-history.html";
  });

  menuBtn?.addEventListener("click", () => {
    window.location.href = "menu.html";
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
});
