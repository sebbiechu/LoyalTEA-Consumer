// rewards.js
import { auth, db } from "./firebase-init.js";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const coffeeReward = document.getElementById("coffeeReward");
  const teaReward    = document.getElementById("teaReward");
  const confirmBtn   = document.getElementById("confirmRewardBtn");
  const teaBadge     = document.getElementById("teaBadge");

  let stamps         = 0;
  let teaRedeemed    = 0;
  let selectedReward = null;

  function resetSelection() {
    selectedReward = null;
    coffeeReward.classList.remove("selected");
    teaReward.classList.remove("selected");
    confirmBtn.disabled = true;
    confirmBtn.classList.remove("active");
  }

  function updateTeaStatus() {
    // Show “1/2” if they've taken one tea in this cycle,
    // show “✅” (and disable the card) if they've taken two.
    if (teaRedeemed >= 2) {
      teaBadge.textContent = "✅";
      teaBadge.style.display = "inline-block";
      teaReward.classList.add("disabled");
    } else if (teaRedeemed === 1) {
      teaBadge.textContent = "1/2";
      teaBadge.style.display = "inline-block";
      teaReward.classList.remove("disabled");
    } else {
      teaBadge.textContent = "";
      teaBadge.style.display = "none";
      teaReward.classList.remove("disabled");
    }
  }

  function applyUIBasedOnStamps() {
    if (stamps >= 9) {
      coffeeReward.classList.remove("disabled");
      // Only allow Free Teas if they've redeemed fewer than 2 this cycle
      if (teaRedeemed < 2) teaReward.classList.remove("disabled");
      else teaReward.classList.add("disabled");
    } else {
      coffeeReward.classList.add("disabled");
      teaReward.classList.add("disabled");
    }
    updateTeaStatus();
  }

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    try {
      // 1) Read the user's Firestore doc
      const userRef  = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        console.error("No user document found!");
        return;
      }
      const data = userSnap.data();

      // 2) Populate local variables from that doc
      stamps      = data.stamps      || 0;
      teaRedeemed = data.teaRedeemed || 0;

      // 3) Now draw the UI based on those values
      applyUIBasedOnStamps();
    } catch (err) {
      console.error("Error loading user data:", err);
    }
  });

  coffeeReward.addEventListener("click", () => {
    if (stamps >= 9 && !coffeeReward.classList.contains("disabled")) {
      coffeeReward.classList.add("selected");
      teaReward.classList.remove("selected");
      selectedReward = "coffee";
      confirmBtn.disabled = false;
      confirmBtn.classList.add("active");
    }
  });

  teaReward.addEventListener("click", () => {
    if (stamps >= 9 && teaRedeemed < 2 && !teaReward.classList.contains("disabled")) {
      teaReward.classList.add("selected");
      coffeeReward.classList.remove("selected");
      selectedReward = "tea";
      confirmBtn.disabled = false;
      confirmBtn.classList.add("active");
    }
  });

  confirmBtn.addEventListener("click", async () => {
    if (!selectedReward) return;
    const user = auth.currentUser;
    if (!user) return;
    const userRef = doc(db, "users", user.uid);

    try {
      if (selectedReward === "coffee") {
        // ─── Coffee Redemption ───────────────────────────────
        // 1) Log a “Coffee” doc in the "redeems" collection
        await addDoc(collection(db, "redeems"), {
          uid: user.uid,
          type: "Coffee",
          count: 1,
          total: 1,
          date: serverTimestamp()
        });
        alert("☕ Enjoy your free coffee!");

        // 2) Reset this cycle entirely: stamps=0, teaRedeemed=0 (for next time)
        stamps = 0;
        teaRedeemed = 0;
        await updateDoc(userRef, {
          stamps: 0,
          teaRedeemed: 0,
          lastRedeemedAt: serverTimestamp()
        });
      }

      else if (selectedReward === "tea") {
        // ─── Tea Redemption ───────────────────────────────────
        // 1) Increment teaRedeemed (1 or 2) and write a log
        const nextCount = teaRedeemed + 1;

        await addDoc(collection(db, "redeems"), {
          uid: user.uid,
          type: "Tea",
          count: nextCount,
          total: 2,
          date: serverTimestamp()
        });
        alert(`🫖 Enjoy tea ${nextCount} of 2`);

        // 2) Update Firestore with the new teaRedeemed.
        //    If nextCount === 2, also reset stamps = 0 (new cycle).
        if (nextCount === 2) {
          stamps = 0;
          teaRedeemed = 2;
          await updateDoc(userRef, {
            teaRedeemed: 2,
            stamps: 0,
            lastRedeemedAt: serverTimestamp()
          });

          // Immediately clear out teaRedeemed so next cycle starts fresh
          teaRedeemed = 0;
          await updateDoc(userRef, {
            teaRedeemed: 0
          });
        } else {
          // nextCount === 1 (first tea)
          teaRedeemed = 1;
          await updateDoc(userRef, {
            teaRedeemed: 1,
            lastRedeemedAt: serverTimestamp()
          });
        }
      }

      resetSelection();
      applyUIBasedOnStamps();
    } catch (err) {
      console.error("Error redeeming:", err);
      alert("Something went wrong. Please try again.");
    }
  });
});
