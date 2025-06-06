// app.js (shared logic across pages)

import { auth } from "./firebase-init.js";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

/**
 * Auto-format email by appending @loyaltea.app
 */
export function formatEmail(emailInput) {
  const value = emailInput.value.trim();
  emailInput.value = value.includes("@") ? value : `${value}@loyaltea.app`;
}

/**
 * Shared password validation check
 */
export function validatePassword(password) {
  const badgeMap = {
    upper: /[A-Z]/,
    lower: /[a-z]/,
    number: /\d/,
    special: /[!@#$%^&*(),.?":{}|<>]/,
    length: /.{8,}/
  };

  return Object.entries(badgeMap).every(([_, regex]) => regex.test(password));
}

/**
 * Centralized login handler
 */
export async function handleLogin(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Centralized register handler
 */
export async function handleRegister(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Redirect if already logged in
 */
export function redirectIfLoggedIn() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      window.location.href = "home.html";
    }
  });
}
