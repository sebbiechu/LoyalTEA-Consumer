import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { auth, db } from "./firebase-init.js";

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  const registerError = document.getElementById("registerError");
  const registerSubmit = document.getElementById("registerSubmit");

  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("regPassword");
  const togglePassword = document.getElementById("togglePassword");
  const passwordIcon = document.getElementById("passwordIcon");

  const badgeMap = {
    upper: /[A-Z]/,
    lower: /[a-z]/,
    length: /.{8,}/,
    special: /[!@#$%^&*(),.?":{}|<>]/,
    number: /\d/
  };

  function validatePassword(password) {
    Object.entries(badgeMap).forEach(([key, regex]) => {
      const badge = document.querySelector(`.badge[data-rule='${key}']`);
      if (regex.test(password)) {
        badge.classList.add("met");
      } else {
        badge.classList.remove("met");
      }
    });

    const allMet = Object.values(badgeMap).every((regex) => regex.test(password));
    const usernameFilled = usernameInput.value.trim();
    registerSubmit.disabled = !(allMet && usernameFilled);
  }

  passwordInput?.addEventListener("input", (e) => {
    validatePassword(e.target.value);
  });

  usernameInput?.addEventListener("input", () => {
    validatePassword(passwordInput.value);
  });

  togglePassword?.addEventListener("click", () => {
    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    passwordIcon.src = type === "text" ? "images/eye.png" : "images/close-eye.png";
  });

  registerForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim().toLowerCase();
    const email = `${username}@loyaltea.app`;
    const password = passwordInput.value;

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", cred.user.uid), {
        username,
        stamps: 0
      });
      alert("Account created!");
      window.location.href = "home.html";
    } catch (err) {
      registerError.textContent = err.message;
    }
  });

  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");

  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("loginUsername").value.trim().toLowerCase();
    const email = `${username}@loyaltea.app`;
    const password = document.getElementById("loginPassword").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      loginError.textContent = err.message;
    }
  });

  onAuthStateChanged(auth, (user) => {
    if (user) {
      window.location.href = "home.html";
    }
  });
});
