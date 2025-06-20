// scripts/login.js
import { supabase } from './supabase-init.js';

document.addEventListener("DOMContentLoaded", () => {
  const emailInput    = document.getElementById("email");
  const passwordInput = document.getElementById("loginPassword");
  const loginButton   = document.getElementById("loginSubmit");
  const loader        = document.getElementById("loginLoader");

  loginButton.addEventListener("click", async (e) => {
    e.preventDefault();

    if (loader) loader.classList.remove("hidden");

    const email = emailInput?.value.trim();
    const password = passwordInput?.value;

    if (!email || !password) {
      if (loader) loader.classList.add("hidden");
      alert("❌ Please enter both email and password.");
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw new Error(error.message);

      // ✅ Redirect to home page on success
      window.location.href = "home.html";
    } catch (error) {
      alert("❌ Login failed: " + error.message);
    } finally {
      if (loader) loader.classList.add("hidden");
    }
  });
});
