import { auth } from "./firebase-init.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { db } from "./firebase-init.js";

document.addEventListener("DOMContentLoaded", () => {
  const userNameDisplay = document.getElementById("userName");
  const stampCountDisplay = document.querySelector(".stamp-progress .current");
  const scanBtn = document.getElementById("scanQrBtn");
  const wrapper = document.getElementById("pageWrapper");

  // ✅ QR Slide Transition
  if (scanBtn && wrapper) {
    scanBtn.addEventListener("click", (e) => {
      e.preventDefault();
      wrapper.classList.add("page-slide-out-left");
      setTimeout(() => {
        window.location.href = "qr.html";
      }, 400);
    });
  }

  // ✅ Firebase Auth Check & Stamp Update
  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      console.warn("No user signed in. Redirecting...");
      window.location.href = "login.html";
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists() && userNameDisplay) {
        const data = userSnap.data();
        const firstName = data.firstName || "friend";
        const stamps = data.stamps || 0;

        console.log("✅ Name from Firestore:", firstName);
        userNameDisplay.textContent = firstName;

        if (stampCountDisplay) {
          stampCountDisplay.textContent = stamps;
        }
      } else {
        console.warn("User doc not found.");
        if (userNameDisplay) userNameDisplay.textContent = "friend";
      }
    } catch (err) {
      console.error("Error getting user data:", err);
      if (userNameDisplay) userNameDisplay.textContent = "friend";
    }
  });
});
