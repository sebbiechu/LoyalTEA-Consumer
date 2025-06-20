import { supabase } from './supabase-init.js';

document.addEventListener("DOMContentLoaded", async () => {
  const changePasswordBtn = document.getElementById("resetPasswordBtn");
  const redeemHistoryBtn  = document.getElementById("redeemHistoryBtn");
  const deleteAccountBtn  = document.getElementById("deleteAccountBtn");
  const logoutBtn         = document.getElementById("logoutBtn");

  // ⚡ Show cached name instantly if available
  const cachedName = localStorage.getItem("firstName");
  const nameSpan = document.getElementById("userFirstName");
  if (cachedName && nameSpan) nameSpan.textContent = cachedName;

  // 🧠 Fetch fresh name from Supabase
  const { data: session } = await supabase.auth.getUser();
  const userId = session?.user?.id;

  if (userId) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("first_name")
      .eq("id", userId)
      .single();

    if (!error && profile?.first_name) {
      const firstName = profile.first_name;
      if (nameSpan) nameSpan.textContent = firstName;
      localStorage.setItem("firstName", firstName);
    }
  }

  // 🔁 Reset Password
  changePasswordBtn?.addEventListener("click", async () => {
    const confirmReset = confirm("Are you sure you want to reset your password?");
    if (!confirmReset) return;

    const { data: session } = await supabase.auth.getUser();
    const email = session?.user?.email;

    if (!email) {
      alert("Error: No email associated with this account.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://loyaltea.app/update-password.html"
    });

    if (error) {
      console.error("Password reset error:", error);
      alert("Something went wrong. Please try again.");
    } else {
      alert("A password reset link has been sent to your email.");
    }
  });

  // 📜 View redeem history
  redeemHistoryBtn?.addEventListener("click", () => {
    window.location.href = "redeem-history.html";
  });

  // 🗑️ Delete account
  deleteAccountBtn?.addEventListener("click", async () => {
    const confirmed = confirm("Are you sure you want to delete your account? This cannot be undone.");
    if (!confirmed) return;

    const { error } = await supabase.auth.signOut();
    if (!error) {
      window.location.href = "index.html";
    }
  });

  // 🚪 Log out
  logoutBtn?.addEventListener("click", async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      window.location.href = "index.html";
    }
  });
});
