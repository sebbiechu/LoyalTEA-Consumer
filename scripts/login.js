import { auth } from "./firebase-init.js";
import {
  formatEmail,
  handleLogin
} from "./app.js";

document.addEventListener("DOMContentLoaded", () => {
  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");
  const loginButton = document.getElementById("loginSubmit");

  loginButton.addEventListener("click", async () => {
    const email = formatEmail(emailInput.value);
    const password = passwordInput.value;

    try {
      await handleLogin(auth, email, password);
      console.log("✅ Logged in");
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  });
});
