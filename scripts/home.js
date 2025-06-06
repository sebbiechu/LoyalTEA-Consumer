import { auth } from "./firebase-init.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { db } from "./firebase-init.js";

document.addEventListener("DOMContentLoaded", () => {
  const userNameDisplay = document.getElementById("userName");
  const stampCountDisplay = document.querySelector(".stamp-progress .current");

  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      console.warn("No user signed in. Redirecting...");
      window.location.href = "login.html";
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        const firstName = data.firstName || "there";
        const stamps = data.stamps || 0;

        console.log("✅ Name from Firestore:", firstName);
        userNameDisplay.textContent = firstName;
        stampCountDisplay.textContent = stamps;
      } else {
        console.warn("User doc not found.");
        userNameDisplay.textContent = "there";
      }
    } catch (err) {
      console.error("Error getting user data:", err);
      userNameDisplay.textContent = "friend";
    }
  });
});
