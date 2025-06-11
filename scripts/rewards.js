import { auth, db } from "./firebase-init.js";
import { doc, getDoc, updateDoc, setDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";


// --- DOM Elements ---
const coffeeCard = document.getElementById("coffeeCard");
const teaCard = document.getElementById("teaCard");
const coffeeRadio = coffeeCard.querySelector('input[type="radio"]');
const teaRadio = teaCard.querySelector('input[type="radio"]');
const useBtn = document.getElementById("useRewardBtn");
const noRewardsMsg = document.getElementById("noRewards");
const coffeeUsesText = document.getElementById("coffeeUses");
const teaUsesText = document.getElementById("teaUses");

// Camera modal
const scanModal = document.getElementById("scanModal");
const closeScanBtn = document.getElementById("closeScanBtn");
const scanStatus = document.getElementById("scanStatus");
let html5QrScanner = null;

let userDocRef, userData, userId;

// --- Helper Functions ---
function updateRewardDisplay() {
  const stamps = userData?.stamps || 0;
  const teaRedeemed = userData?.teaRedeemed || 0;
  // Show rewards only if 9 stamps and not all rewards redeemed
  if (stamps < 9) {
    coffeeCard.style.display = "none";
    teaCard.style.display = "none";
    useBtn.style.display = "none";
    noRewardsMsg.style.display = "";
    return;
  }
  noRewardsMsg.style.display = "none";
  useBtn.style.display = "";

  // Coffee: only show if teaRedeemed < 2 (user hasn't started tea reward)
  if (teaRedeemed === 0) {
    coffeeCard.style.display = "";
    coffeeUsesText.textContent = `1 use remaining`;
  } else {
    coffeeCard.style.display = "none";
  }
  // Tea: show if teaRedeemed < 2
  if (teaRedeemed < 2) {
    teaCard.style.display = "";
    teaUsesText.textContent = `${2 - teaRedeemed} use${2 - teaRedeemed > 1 ? "s" : ""} remaining`;
  } else {
    teaCard.style.display = "none";
  }
  // If both are used up, hide all and allow stamps again (handled after redeem)
}

function clearSelection() {
  coffeeCard.classList.remove("selected");
  teaCard.classList.remove("selected");
  coffeeRadio.checked = false;
  teaRadio.checked = false;
  useBtn.disabled = true;
}

// --- Event Listeners for Selection ---
coffeeCard.addEventListener("click", () => {
  if (coffeeCard.style.display === "none") return;
  coffeeRadio.checked = true;
  teaRadio.checked = false;
  coffeeCard.classList.add("selected");
  teaCard.classList.remove("selected");
  useBtn.disabled = false;
});
teaCard.addEventListener("click", () => {
  if (teaCard.style.display === "none") return;
  teaRadio.checked = true;
  coffeeRadio.checked = false;
  teaCard.classList.add("selected");
  coffeeCard.classList.remove("selected");
  useBtn.disabled = false;
});

// --- Use at Till Button (Camera Scan) ---
useBtn.addEventListener("click", () => {
  let rewardType = coffeeRadio.checked ? "Coffee" : teaRadio.checked ? "Tea" : null;
  if (!rewardType) return;
  startStaffScan(rewardType);
});

// --- Open Camera and Scan Staff QR ---
function startStaffScan(rewardType) {
  scanModal.classList.remove("hidden");
  scanStatus.textContent = "Scan the staff QR code at the till…";
  html5QrScanner = new Html5Qrcode("qr-reader");
  html5QrScanner.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 220 },
    async (decodedText, decodedResult) => {
      // Validate the staff QR (should be JSON: {type:"staff",code:"something"})
      try {
        let data = JSON.parse(decodedText);
        if (data && data.type === "staff" && data.code) {
          scanStatus.textContent = "Redeeming your reward...";
          await redeemReward(rewardType);
          scanStatus.textContent = "Reward redeemed! Enjoy your drink.";
          setTimeout(() => {
            scanModal.classList.add("hidden");
            html5QrScanner.stop();
            html5QrScanner = null;
            fetchUserData(); // Refresh the UI
          }, 1200);
        } else {
          scanStatus.textContent = "Invalid staff QR code. Please try again.";
        }
      } catch (e) {
        scanStatus.textContent = "Invalid QR code format.";
      }
    },
    (errorMsg) => {
      // Optional: Show camera error messages
    }
  );
}

// --- Cancel/close scan modal ---
closeScanBtn.addEventListener("click", () => {
  scanModal.classList.add("hidden");
  if (html5QrScanner) {
    html5QrScanner.stop();
    html5QrScanner = null;
  }
  scanStatus.textContent = "";
  clearSelection();
});

// --- Redeem Reward Logic ---
async function redeemReward(type) {
  if (!userDocRef) return;
  const now = new Date();
  let updateObj = {};
  let redeemData = {
    uid: userId,
    type,
    date: now.toUTCString()
  };

  if (type === "Coffee") {
    // Reset stamps and teaRedeemed
    updateObj = { stamps: 0, teaRedeemed: 0, lastRedeemedAt: now.toUTCString() };
    redeemData.count = 1;
    redeemData.total = 1;
  } else if (type === "Tea") {
    // Increment teaRedeemed, reset stamps if both teas used
    const teaRedeemed = (userData.teaRedeemed || 0) + 1;
    updateObj = { teaRedeemed, lastRedeemedAt: now.toUTCString() };
    redeemData.count = teaRedeemed;
    redeemData.total = 2;
    if (teaRedeemed >= 2) {
      updateObj.stamps = 0;
    }
  }
  // Update user doc
  await updateDoc(userDocRef, updateObj);
  // Add to redeems collection
  await addDoc(collection(db, "redeems"), redeemData);
  // Refresh user data will be called after camera closes
}

// --- Fetch User Data ---
async function fetchUserData() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "index.html";
      return;
    }
    userId = user.uid;
    userDocRef = doc(db, "users", userId);
    const userSnap = await getDoc(userDocRef);
    if (!userSnap.exists()) {
      // Optionally create user doc here
      return;
    }
    userData = userSnap.data();
    updateRewardDisplay();
    clearSelection();
  });
}

// --- Initial State ---
document.addEventListener("DOMContentLoaded", fetchUserData);

// --- Optional: Show pending redemption message if redirected from QR ---
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get("pending")) {
    const msg = document.createElement("div");
    msg.textContent = "You need to redeem your rewards before you can earn more stamps!";
    msg.className = "no-rewards-message";
    document.querySelector(".rewards-container").prepend(msg);
  }
});
