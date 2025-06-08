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

  // QR transition (unchanged)
  if (scanBtn && wrapper) {
    scanBtn.addEventListener("click", e => {
      e.preventDefault();
      wrapper.classList.add("page-slide-out-left");
      setTimeout(() => {
        window.location.href = "qr.html";
      }, 400);
    });
  }

  // “View history” and “Menu” buttons:
  historyBtn?.addEventListener("click", () => {
    window.location.href = "redeem-history.html";
  });
  menuBtn?.addEventListener("click", () => {
    window.location.href = "menu.html";
  });

  // Auth + Firestore lookup
  auth.onAuthStateChanged(async user => {
    if (!user) {
      console.warn("No user signed in. Redirecting…");
      return window.location.href = "login.html";
    }

    try {
      const userRef  = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        throw new Error("User doc missing");
      }
      const data      = userSnap.data();
      const firstName = data.firstName || "friend";
      const stamps    = data.stamps    || 0;

      // 1) Name
      userNameDisplay.textContent = firstName;

      // 2) Number in big “0/9”
      if (currentStampsDisp) {
        currentStampsDisp.textContent = stamps;
      }

      // 3) Draw the 9-star grid + cup
      if (stampGrid) {
        stampGrid.innerHTML = "";
        for (let i = 1; i <= 9; i++) {
          const cell = document.createElement("div");
          cell.className = "stamp" + (i <= stamps ? " filled" : "");
          stampGrid.appendChild(cell);
        }
        // Finally, append the “cup” icon cell
        const cup = document.createElement("div");
        cup.className = "stamp cup";
        stampGrid.appendChild(cup);
      }
      if (stampGrid) {
      stampGrid.innerHTML = "";
      for (let i = 1; i <= 9; i++) {
      const cell = document.createElement("div");
      cell.className = "stamp" + (i <= stamps ? " filled" : "");
      stampGrid.appendChild(cell);
      }
    }

    } catch (err) {
      console.error("Error getting user data:", err);
      if (userNameDisplay) userNameDisplay.textContent = "friend";
      if (currentStampsDisp) currentStampsDisp.textContent = "0";
    }
  });
});
