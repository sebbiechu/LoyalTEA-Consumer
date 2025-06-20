// scripts/register.js
import { supabase } from './supabase-init.js';

document.addEventListener("DOMContentLoaded", () => {
  const emailInput       = document.getElementById("email");
  const firstNameInput   = document.getElementById("firstName");
  const passwordInput    = document.getElementById("regPassword");
  const registerButton   = document.getElementById("registerSubmit");
  const badgeElements    = document.querySelectorAll(".badge");
  const termsCheckbox    = document.getElementById("termsCheckbox");
  const errorDisplay     = document.getElementById("registerError");

  const badgeMap = {
    upper: /[A-Z]/,
    lower: /[a-z]/,
    number: /\d/,
    special: /[!@#$%^&*(),.?":{}|<>]/,
    length: /.{8,}/
  };

  // ✅ Password badge feedback
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

    registerButton.disabled = !allValid || !termsCheckbox.checked;
    registerButton.classList.toggle("active", allValid && termsCheckbox.checked);
  });

  termsCheckbox.addEventListener("change", () => {
    const allValid = Array.from(badgeElements).every(el => el.classList.contains("met"));
    registerButton.disabled = !allValid || !termsCheckbox.checked;
    registerButton.classList.toggle("active", allValid && termsCheckbox.checked);
  });

  // ✅ Registration logic
  registerButton.addEventListener("click", async (e) => {
    e.preventDefault();
    errorDisplay.textContent = "";

    const email     = emailInput?.value.trim();
    const firstName = firstNameInput?.value.trim();
    const password  = passwordInput?.value;

    if (!email || !firstName || !password) {
      errorDisplay.textContent = "Please fill out all required fields.";
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) throw new Error(error.message);

      const userId = data.user?.id;
      if (userId) {
        await supabase.from("profiles").insert([{
          id: userId,
          first_name: firstName,
          stamps: 0,
          tea_redeemed: 0,
          coffee_redeemed: false
        }]);
      }

      localStorage.setItem("firstName", firstName);
      window.location.href = "home.html";

    } catch (error) {
      errorDisplay.textContent = "❌ Registration failed: " + error.message;
    }
  });
});
