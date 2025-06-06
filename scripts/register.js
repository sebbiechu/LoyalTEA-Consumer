import { auth, db } from "./firebase-init.js";
import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const usernameInput = document.getElementById("username");
  const firstNameInput = document.getElementById("firstName");
  const passwordInput = document.getElementById("regPassword");
  const registerButton = document.getElementById("registerSubmit");

  // ✅ Badge logic
  const badgeElements = document.querySelectorAll(".badge");

  const badgeMap = {
    upper: /[A-Z]/,
    lower: /[a-z]/,
    number: /\d/,
    special: /[!@#$%^&*(),.?":{}|<>]/,
    length: /.{8,}/
  };

passwordInput.addEventListener("input", () => {
  const value = passwordInput.value;
  let allValid = true;

  badgeElements.forEach((el) => {
    const rule = el.getAttribute("data-rule");
    const regex = badgeMap[rule];
    if (regex && regex.test(value)) {
      el.classList.add("met");
    } else {
      el.classList.remove("met");
      allValid = false;
    }
  });

  // ✅ Enable or disable register button
  registerButton.disabled = !allValid;
  registerButton.classList.toggle("active", allValid);
});


  // ✅ Register handler
  registerButton.addEventListener("click", async (e) => {
    e.preventDefault();

    const username = usernameInput?.value.trim();
    const firstName = firstNameInput?.value.trim();
    const password = passwordInput?.value;

    // Basic validation (can be improved if needed)
    if (!username || !firstName || !password) {
      alert("Please fill out all required fields.");
      return;
    }

    try {
      const email = `${username}@loyaltea.app`; // virtual email for Firebase
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
      alert("❌ Registration failed: " + error.message);
    }
  });
});
