// scripts/register.js
import { supabase } from './supabase-init.js';

document.addEventListener("DOMContentLoaded", () => {
  const emailInput      = document.getElementById("email");
  const firstNameInput  = document.getElementById("firstName");
  const lastNameInput   = document.getElementById("lastName");
  const passwordInput   = document.getElementById("regPassword");
  const registerButton  = document.getElementById("registerSubmit");
  const termsCheckbox   = document.getElementById("termsCheckbox");
  const errorDisplay    = document.getElementById("registerError");

  // ✅ Only enable button when terms are accepted
  termsCheckbox.addEventListener("change", () => {
    registerButton.disabled = !termsCheckbox.checked;
    registerButton.classList.toggle("active", termsCheckbox.checked);
  });

  // ✅ Registration logic
  registerButton.addEventListener("click", async (e) => {
    e.preventDefault();
    errorDisplay.textContent = "";

    const email     = emailInput?.value.trim();
    const firstName = firstNameInput?.value.trim();
    const lastName  = lastNameInput?.value.trim();
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
        const { error: profileError, data: profileData } = await supabase.from("profiles").insert([{
          id: userId,
          first_name: firstName,
          last_name: lastName,
        }]);

        if (profileError) {
          console.error("❌ Profile insert error:", profileError.message || profileError);

          errorDisplay.textContent = "Profile save failed: " + profileError.message;
          return;
        }

        console.log("✅ Profile inserted:", profileData);
      }

      localStorage.setItem("firstName", firstName);
      window.location.href = "home.html";

    } catch (error) {
      errorDisplay.textContent = "❌ Registration failed: " + error.message;
    }
  }); // ← End of click event
}); // ← End of DOMContentLoaded
