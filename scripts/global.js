// scripts/global.js

import { auth, db } from "./firebase-init.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// Checks if rewards badge exists and updates it
function updateRewardsBadge(stamps) {
  const badge = document.getElementById('rewardsBadge');
  if (badge) {
    if (stamps >= 9) {
      badge.style.display = "flex";
      badge.textContent = "1";
    } else {
      badge.style.display = "none";
    }
  }
}

// Fetches user data and updates the badge
function checkAndUpdateBadge() {
  onAuthStateChanged(auth, async user => {
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    const snap = await getDoc(userDocRef);
    const userData = snap.exists() ? snap.data() : {};
    updateRewardsBadge(Number(userData?.stamps) || 0);
  });
}

// Run on load
document.addEventListener("DOMContentLoaded", checkAndUpdateBadge);
