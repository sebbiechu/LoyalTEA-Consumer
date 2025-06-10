// login.js
import { auth } from "./firebase-init.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("loginPassword");
  const loginButton   = document.getElementById("loginSubmit");
  const loader        = document.getElementById("loginLoader");

  loginButton.addEventListener("click", async (e) => {
    e.preventDefault();
    // show spinner
    if (loader) loader.classList.remove("hidden");

    const username = usernameInput?.value.trim();
    const password = passwordInput?.value;

    if (!username || !password) {
      if (loader) loader.classList.add("hidden");
      alert("❌ Please enter both username and password.");
      return;
    }

    const email = `${username}@loyaltea.app`;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // on success, redirect
      window.location.href = "home.html";
    } catch (error) {
      if (loader) loader.classList.add("hidden");
      alert("❌ Login failed: " + error.message);
    }
  });
});
