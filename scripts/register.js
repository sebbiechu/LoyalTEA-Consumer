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

document.addEventListener("DOMContentLoaded", () => {
  const passwordInput = document.getElementById("regPassword");
  const toggleBtn = document.getElementById("togglePassword");
  const eyeIcon = document.getElementById("eyeIcon");

  let showing = false;

  toggleBtn.addEventListener("click", () => {
    showing = !showing;
    passwordInput.type = showing ? "text" : "password";

    eyeIcon.innerHTML = showing
      ? `<path d="M12 6c-3.87 0-7.19 2.41-9 6 1.81 3.59 5.13 6 9 6s7.19-2.41 9-6c-1.81-3.59-5.13-6-9-6zm0 10a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke="#fff" stroke-width="2"/>`
      : `<path d="M12 4.5C7 4.5 2.73 8.11 1 12c1.73 3.89 6 7.5 11 7.5s9.27-3.61 11-7.5C21.27 8.11 17 4.5 12 4.5zm0 12c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5S14.49 16.5 12 16.5z"/><circle cx="12" cy="12" r="2"/>`;
  });
});
