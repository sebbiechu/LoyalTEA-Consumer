import { auth, db } from "./firebase-init.js";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { doc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const changePasswordBtn = document.getElementById("changePasswordBtn");
  const redeemHistoryBtn  = document.getElementById("redeemHistoryBtn");
  const deleteAccountBtn  = document.getElementById("deleteAccountBtn");
  const logoutBtn         = document.getElementById("logoutBtn");

  // 🔐 Change Password
  changePasswordBtn.addEventListener("click", () => {
    window.location.href = "change-password.html";
  });

  // ☕ Redeem History (navigate instead of alert)
  redeemHistoryBtn.addEventListener("click", () => {
    window.location.href = "redeem-history.html";
  });

  // 🗑️ Delete Account
  deleteAccountBtn.addEventListener("click", async () => {
    const confirmed = confirm("Are you sure you want to delete your account? This cannot be undone.");
    if (!confirmed) return;

    const user = auth.currentUser;
    if (!user) return;

    try {
      // Delete Firestore user doc
      await deleteDoc(doc(db, "users", user.uid));

      // Delete Auth account
      await deleteUser(user);

      alert("Your account has been deleted.");
      window.location.href = "index.html";
    } catch (err) {
      alert("Error deleting account: " + err.message);
    }
  });

  // 🔓 Log Out
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "index.html";
    } catch (err) {
      alert("Logout failed: " + err.message);
    }
  });
});
