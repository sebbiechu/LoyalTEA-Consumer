// File: scripts/rewards.js

import QrScanner from "https://cdn.jsdelivr.net/npm/qr-scanner@1.4.2/qr-scanner.min.js";
import { auth, db } from "./firebase-init.js";
import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

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
const qrReaderElem  = document.getElementById("qr-reader");
let qrScanner       = null;
let scanActive      = false;

// State
let userDocRef, userData, userId;

// --- Helper Functions ---
function updateRewardDisplay() {
  const stamps = Number(userData?.stamps) || 0;
  const teaRedeemed = userData?.teaRedeemed || 0;
  const rewardsContainer = document.querySelector('.rewards-container');

  console.log("DEBUG updateRewardDisplay: stamps=", stamps, "userData.stamps=", userData?.stamps, typeof userData?.stamps);

  // Always hide both at the start to prevent flicker
  rewardsContainer.style.display = "none";
  hideNoRewardsMessage();

  // Show empty state if not enough stamps
  if (stamps < 9) {
    showNoRewardsMessage("No rewards yet! Sip, stamp, and unlock your next treat when you reach 9 stamps.");
    return;
  }

  // Reset if stuck at 9 stamps & 2 teas used
  if (stamps >= 9 && teaRedeemed >= 2) {
    if (userDocRef) {
      updateDoc(userDocRef, { stamps: 0, teaRedeemed: 0 });
      setTimeout(fetchUserData, 300); // let Firestore update
    }
    return;
  }

  // At this point, rewards are available – show the container
  rewardsContainer.style.display = "block";
  hideNoRewardsMessage();

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

// --- Show/hide empty state message ---
function showNoRewardsMessage(msg) {
  let existing = document.getElementById('emptyStateMsg');
  if (!existing) {
    const div = document.createElement('div');
    div.id = 'emptyStateMsg';
    div.style.textAlign = 'center';
    div.style.margin = '48px auto 0';
    div.style.color = '#91204D';
    div.style.fontWeight = '500';
    div.style.fontSize = '1.13rem';
    div.textContent = msg;
    document.querySelector('.rewards-banner').after(div);
  } else {
    existing.textContent = msg;
  }
}
function hideNoRewardsMessage() {
  let existing = document.getElementById('emptyStateMsg');
  if (existing) existing.remove();
}

// --- Rewards badge logic ---
function updateRewardsBadge() {
  const badge = document.getElementById('rewardsBadge');
  const count = Number(userData?.stamps) || 0;
  if (badge) {
    if (count >= 9) {
      badge.style.display = "flex";
      badge.textContent = "1"; // Change if you ever want more than one reward
    } else {
      badge.style.display = "none";
    }
  }
}

// --- Stamp earning logic for staff QR scan ---
async function earnStamp() {
  if (!userDocRef) {
    console.error("No userDocRef!"); // Debug log
    return;
  }
  const now = new Date().toUTCString();
  const snap = await getDoc(userDocRef);
  const data = snap.exists() ? snap.data() : {};
  const newStamps = (Number(data.stamps) || 0) + 1;
  console.log("Updating stamps from", data.stamps, "to", newStamps); // Debug
  await updateDoc(userDocRef, { stamps: newStamps, lastStampedAt: now });
}


// --- Selection Events ---
function clearSelection() {
  coffeeCard.classList.remove("selected");
  teaCard.classList.remove("selected");
  coffeeRadio.checked = false;
  teaRadio.checked    = false;
  useBtn.disabled     = true;
}
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
useBtn.addEventListener("click", async () => {
  const rewardType = coffeeRadio.checked ? "Coffee" : teaRadio.checked ? "Tea" : null;
  if (!rewardType) return;
  await startStaffScan(rewardType);
});

// --- Start QR Scan (one-and-done, staff QR earns stamp or redeems reward) ---
async function startStaffScan(rewardType) {
  scanActive = true;
  scanStatus.textContent = "Scan the staff QR code at the till…";
  scanModal.classList.remove("hidden");

  // Clean up any previous scanner/camera
  if (qrScanner) {
    qrScanner.destroy();
    qrScanner = null;
  }
  qrReaderElem.srcObject = null; // Just in case

  qrScanner = new QrScanner(
    qrReaderElem,
    async result => {
      if (!scanActive) return;
      scanActive = false;
      qrScanner.stop();

      let data;
      try {
        data = JSON.parse(result.data);
      } catch {
        scanStatus.textContent = "Invalid QR code format.";
        setTimeout(() => {
          scanModal.classList.add("hidden");
          clearSelection();
        }, 900);
        return;
      }

      if (data.type === "staff" && data.code === "LOYALTEA") {
        await fetchUserData(); // Get up-to-date stamp count
        const stamps = Number(userData?.stamps) || 0;
        if (stamps < 9) {
          scanStatus.textContent = "Adding your stamp…";
          await earnStamp();
          scanStatus.textContent = "Stamp earned! Enjoy your drink.";
        } else {
          scanStatus.textContent = "Redeeming your reward…";
          await redeemReward(rewardType);
          scanStatus.textContent = "Reward redeemed! Enjoy your drink.";
        }
      } else {
        scanStatus.textContent = "Invalid staff QR code. Please try again.";
      }

      setTimeout(() => {
        scanModal.classList.add("hidden");
        fetchUserData();
        clearSelection();
      }, 1000);
    },
    {
      preferredCamera: 'environment',
      highlightScanRegion: true,
      highlightCodeOutline: true
    }
  );

  qrScanner.start();
}

closeScanBtn.addEventListener("click", () => {
  scanActive = false;
  if (qrScanner) {
    qrScanner.stop();
    qrScanner.destroy();
    qrScanner = null;
  }
  scanModal.classList.add("hidden");
  scanStatus.textContent = "";
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

  // Hide rewards container and clear selection right after redemption
  document.querySelector('.rewards-container').style.display = "none";
  clearSelection();
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
    updateRewardDisplay();    // <--- Only call here, AFTER snap!
    updateRewardsBadge();
    clearSelection();
  });
}



// --- Init on page load ---
document.addEventListener("DOMContentLoaded", fetchUserData);
