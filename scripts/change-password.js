// scripts/change-password.js
import { supabase } from "./supabase-init.js";

document.addEventListener("DOMContentLoaded", () => {
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
    number: /\d/,
    special: /[!@#$%^&*(),.?":{}|<>]/,
    length: /.{8,}/
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

  // 🚧 Submit Placeholder
  document.getElementById("changePasswordForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    errorText.textContent = "";

    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    if (!user) {
      errorText.textContent = "No user session found.";
      return;
    }

    // ❌ Supabase client cannot update password directly
    alert("⚠️ Password changes must be done via email reset link.\n\nYou'll be redirected to request one now.");

    const { error } = await supabase.auth.resetPasswordForEmail(user.email);
    if (error) {
      errorText.textContent = error.message;
    } else {
      alert("🔐 A reset email has been sent to your inbox.");
      window.location.href = "index.html";
    }
  });
});
