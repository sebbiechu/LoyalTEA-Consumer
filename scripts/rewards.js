// File: scripts/rewards.js

import { auth, db } from "./firebase-init.js";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { Html5Qrcode } from "https://unpkg.com/html5-qrcode@2.3.7/minified/html5-qrcode.min.js"; // ensure this matches your import source

// --- DOM Elements ---
const coffeeCard    = document.getElementById("coffeeCard");
const teaCard       = document.getElementById("teaCard");
const coffeeRadio   = coffeeCard.querySelector('input[type="radio"]');
const teaRadio      = teaCard.querySelector('input[type="radio"]');
const useBtn        = document.getElementById("useRewardBtn");
const noRewardsMsg  = document.getElementById("noRewards");
const coffeeUsesText= document.getElementById("coffeeUses");
const teaUsesText   = document.getElementById("teaUses");

// Camera modal
const scanModal     = document.getElementById("scanModal");
const closeScanBtn  = document.getElementById("closeScanBtn");
const scanStatus    = document.getElementById("scanStatus");
let html5QrScanner  = null;

// State
let userDocRef, userData, userId;
let hasScanned = false;   // ← new: prevent multiple scans

// --- Helper Functions ---
function updateRewardDisplay() {
  const stamps = userData?.stamps || 0;
  const teaRedeemed = userData?.teaRedeemed || 0;

  if (stamps < 9) {
    coffeeCard.style.display = "none";
    teaCard.style.display    = "none";
    useBtn.style.display      = "none";
    noRewardsMsg.style.display = "";
    return;
  }

  noRewardsMsg.style.display = "none";
  useBtn.style.display       = "";

  if (teaRedeemed === 0) {
    coffeeCard.style.display = "";
    coffeeUsesText.textContent = `1 use remaining`;
  } else {
    coffeeCard.style.display = "none";
  }

  if (teaRedeemed < 2) {
    teaCard.style.display = "";
    teaUsesText.textContent = `${2 - teaRedeemed} use${2 - teaRedeemed > 1 ? "s" : ""} remaining`;
  } else {
    teaCard.style.display = "none";
  }
}

function clearSelection() {
  coffeeCard.classList.remove("selected");
  teaCard.classList.remove("selected");
  coffeeRadio.checked = false;
  teaRadio.checked    = false;
  useBtn.disabled     = true;
}

// --- Selection Events ---
coffeeCard.addEventListener("click", () => {
  if (coffeeCard.style.display === "none") return;
  coffeeRadio.checked = true;
  teaRadio.checked    = false;
  coffeeCard.classList.add("selected");
  teaCard.classList.remove("selected");
  useBtn.disabled     = false;
});
teaCard.addEventListener("click", () => {
  if (teaCard.style.display === "none") return;
  teaRadio.checked    = true;
  coffeeRadio.checked = false;
  teaCard.classList.add("selected");
  coffeeCard.classList.remove("selected");
  useBtn.disabled     = false;
});

// --- “Use at till” Button ---
useBtn.addEventListener("click", () => {
  const rewardType = coffeeRadio.checked ? "Coffee" : teaRadio.checked ? "Tea" : null;
  if (!rewardType) return;
  startStaffScan(rewardType);
});

// --- Start QR Scan (one-and-done) ---
function startStaffScan(rewardType) {
  hasScanned = false;
  scanStatus.textContent = "Scan the staff QR code at the till…";
  scanModal.classList.remove("hidden");

  html5QrScanner = new Html5Qrcode("qr-reader");
  html5QrScanner.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 220 },
    async decodedText => {
      if (hasScanned) return;          // ignore repeats
      hasScanned = true;

      let data;
      try {
        data = JSON.parse(decodedText);
      } catch {
        scanStatus.textContent = "Invalid QR code format.";
        await stopScanner();
        return;
      }

      // single staff code expected
      if (data.type === "staff" && data.code === "LOYALTEA") {
        scanStatus.textContent = "Redeeming your reward…";
        await redeemReward(rewardType);
        scanStatus.textContent = "Reward redeemed! Enjoy your drink.";
      } else {
        scanStatus.textContent = "Invalid staff QR code. Please try again.";
      }

      await stopScanner();
      setTimeout(() => {
        scanModal.classList.add("hidden");
        fetchUserData();
        clearSelection();
      }, 800);
    },
    errorMsg => {
      // optional: console.warn("QR error", errorMsg);
    }
  );
}

// Stop & clear the scanner
async function stopScanner() {
  if (!html5QrScanner) return;
  await html5QrScanner.stop();
  html5QrScanner.clear();
  html5QrScanner = null;
}

// --- Cancel Scan ---
closeScanBtn.addEventListener("click", async () => {
  scanModal.classList.add("hidden");
  scanStatus.textContent = "";
  await stopScanner();
  clearSelection();
});

// --- Redeem Reward Logic ---
async function redeemReward(type) {
  if (!userDocRef) return;
  const now = new Date().toUTCString();
  let updateObj = {};
  const teaRedeemed = (userData.teaRedeemed || 0) + (type === "Tea" ? 1 : 0);

  if (type === "Coffee") {
    updateObj = { stamps: 0, teaRedeemed: 0, lastRedeemedAt: now };
  } else {
    updateObj = { teaRedeemed, lastRedeemedAt: now };
    if (teaRedeemed >= 2) updateObj.stamps = 0;
  }

  await updateDoc(userDocRef, updateObj);
  await addDoc(collection(db, "redeems"), {
    uid:   userId,
    type,
    date:  now,
    count: type === "Coffee" ? 1 : teaRedeemed,
    total: type === "Coffee" ? 1 : 2
  });
}

// --- Fetch & Render User Data ---
async function fetchUserData() {
  onAuthStateChanged(auth, async user => {
    if (!user) {
      window.location.href = "index.html";
      return;
    }
    userId     = user.uid;
    userDocRef = doc(db, "users", userId);
    const snap = await getDoc(userDocRef);
    userData    = snap.exists() ? snap.data() : {};
    updateRewardDisplay();
    clearSelection();
  });
}

// --- Init on page load ---
document.addEventListener("DOMContentLoaded", fetchUserData);
