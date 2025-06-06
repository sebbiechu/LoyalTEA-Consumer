import { auth } from "./firebase-init.js";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const oldPasswordInput = document.getElementById("oldPassword");
  const newPasswordInput = document.getElementById("newPassword");
  const confirmBtn = document.getElementById("confirmChangeBtn");
  const errorText = document.getElementById("changeError");
  const badgeElements = document.querySelectorAll(".badge");

  // 👁 Password Toggle
  document.querySelectorAll(".toggle-password").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const input = document.getElementById(targetId);
      input.type = input.type === "password" ? "text" : "password";
      btn.classList.toggle("visible");
    });
  });

  // ✅ Badge Validation
  const badgeMap = {
    upper: /[A-Z]/,
    lower: /[a-z]/,
    number: /\\d/,
    special: /[!@#$%^&*(),.?\":{}|<>]/,
    length: /.{8,}/,
  };

  newPasswordInput.addEventListener("input", () => {
    const value = newPasswordInput.value;
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

    confirmBtn.disabled = !allValid;
    confirmBtn.classList.toggle("active", allValid);
  });

  // 🔐 Confirm Change
  document.getElementById("changePasswordForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    errorText.textContent = "";

    const oldPassword = oldPasswordInput.value.trim();
    const newPassword = newPasswordInput.value.trim();

    const user = auth.currentUser;
    if (!user || !user.email) {
      errorText.textContent = "No user session found.";
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      alert("Password changed successfully.");
      window.location.href = "settings.html";
    } catch (err) {
      console.error(err);
      errorText.textContent = err.message || "Password change failed.";
    }
  });
});
