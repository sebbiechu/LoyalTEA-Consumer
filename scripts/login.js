import { auth } from "./firebase-init.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginSubmit");
  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");
  const loginError = document.getElementById("loginError");

  if (!loginBtn || !emailInput || !passwordInput || !loginError) {
    console.error("❌ Missing one or more required elements.");
    return;
  }

  loginBtn.addEventListener("click", async () => {
    let email = emailInput.value.trim(); // ✅ let instead of const so we can modify it
    const password = passwordInput.value.trim();

    if (!email || !password) {
      loginError.textContent = "Please enter both email and password.";
      return;
    }

    // ✅ Auto-append @loyaltea.app if not included
    if (!email.includes("@")) {
      email = `${email}@loyaltea.app`;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("✅ Logged in:", user);
      loginError.textContent = "";

      // 🚀 Redirect
      window.location.href = "home.html";
    } catch (err) {
      console.error("❌ Firebase login error:", err.message);
      loginError.textContent = "Login failed: " + err.message;
    }
  });
});
