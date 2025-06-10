import { auth, db } from "./firebase-init.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const rewardsGroup = document.getElementById("rewardsGroup");
  const noRewardsMsg = document.getElementById("noRewards");

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        console.error("User document not found.");
        return;
      }

      const data = userSnap.data();
      const stamps = data.stamps || 0;

      if (stamps >= 9) {
        rewardsGroup.classList.remove("hidden");
        noRewardsMsg.classList.add("hidden");
      } else {
        rewardsGroup.classList.add("hidden");
        noRewardsMsg.classList.remove("hidden");
      }
    } catch (err) {
      console.error("Failed to load rewards data:", err);
    }
  });
});
