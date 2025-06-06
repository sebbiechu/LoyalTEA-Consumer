import { auth } from "./firebase-init.js";
import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("loginPassword");
  const loginButton = document.getElementById("loginSubmit");

  loginButton.addEventListener("click", async (e) => {
    e.preventDefault();

    const username = usernameInput?.value.trim();
    const password = passwordInput?.value;

    if (!username || !password) {
      alert("❌ Please enter both username and password.");
      return;
    }

    const email = `${username}@loyaltea.app`; // same logic as register

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ Logged in successfully");
      window.location.href = "home.html";
    } catch (error) {
      alert("❌ Login failed: " + error.message);
    }
  });
});
