import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { auth, db } from "./firebase-init.js";

document.addEventListener("DOMContentLoaded", () => {
  const usernameInput = document.getElementById("username");
  const firstNameInput = document.getElementById("firstName");
  const passwordInput = document.getElementById("regPassword");
  const registerButton = document.getElementById("registerSubmit");

  const badgeMap = {
    upper: /[A-Z]/,
    lower: /[a-z]/,
    number: /\d/,
    special: /[!@#$%^&*(),.?":{}|<>]/,
    length: /.{8,}/
  };

  function validatePassword(password) {
    let allMet = true;
    Object.entries(badgeMap).forEach(([key, regex]) => {
      const badge = document.querySelector(`.badge[data-rule="${key}"]`);
      if (regex.test(password)) {
        badge.classList.add("met");
      } else {
        badge.classList.remove("met");
        allMet = false;
      }
    });
    return allMet;
  }

  function updateButtonState() {
    const isUsernameValid = usernameInput.value.trim().length > 0;
    const isPasswordValid = validatePassword(passwordInput.value);
    registerButton.disabled = !(isUsernameValid && isPasswordValid);
  }

  usernameInput?.addEventListener("input", updateButtonState);
  passwordInput?.addEventListener("input", updateButtonState);

  const togglePassword = document.getElementById("togglePassword");
  const passwordIcon = document.getElementById("passwordIcon");

  togglePassword?.addEventListener("click", () => {
    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    passwordIcon.src = type === "text" ? "images/eye.png" : "images/close-eye.png";
  });

  document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim().toLowerCase();
    const firstName = firstNameInput.value.trim();
    const password = passwordInput.value;

    const fakeEmail = `${username}@loyaltea.app`;

    try {
    const cred = await createUserWithEmailAndPassword(auth, fakeEmail, password);
await setDoc(doc(db, "users", cred.user.uid), {
  firstName: firstName,
  stamps: 0,
  rewards: { coffee: 0, tea: 0 }
});

      window.location.href = "home.html";
    } catch (err) {
      document.getElementById("registerError").textContent = err.message;
    }
  });
});
