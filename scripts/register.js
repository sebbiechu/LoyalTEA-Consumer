import { auth, db } from "./firebase-init.js";
import {
  formatEmail,
  validatePassword
} from "./app.js";
import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const usernameInput = document.getElementById("username");
  const emailInput = document.getElementById("regEmail");
  const passwordInput = document.getElementById("regPassword");
  const registerButton = document.getElementById("registerSubmit");

  registerButton.addEventListener("click", async () => {
    const email = formatEmail(emailInput.value);
    const password = passwordInput.value;
    const firstName = usernameInput.value;

    if (!validatePassword(password)) {
      alert("❌ Password must be 8+ characters with a mix of upper, lower, number and symbol.");
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const userRef = doc(db, "users", userCred.user.uid);
      await setDoc(userRef, {
        firstName,
        stamps: 0,
        teaRedeemed: 0,
        rewardClaimed: false
      });

      console.log("✅ User registered");
      window.location.href = "home.html";
    } catch (error) {
      alert("Registration failed: " + error.message);
    }
  });
});
