import { supabase } from './supabase-init.js';
import QrScanner from "https://cdn.jsdelivr.net/npm/qr-scanner@1.4.2/qr-scanner.min.js";

document.addEventListener("DOMContentLoaded", async () => {
  const userIdSpan = document.getElementById("userId");
  const userName = document.getElementById("userName");
  const stampGrid = document.getElementById("stampGrid");
  const stampSound = document.getElementById("stampSound");
  const rewardSound = document.getElementById("rewardSound");
  const qrModal = document.getElementById("qrScannerModal");
  const qrReaderElem = document.getElementById("qr-reader");
  const closeQRBtn = document.getElementById("closeQrModal");
  const scanStatus = document.getElementById("qrStatus");
  const openQRBtn = document.getElementById("openQRBtn");
  const rewardsBadge = document.getElementById("rewardsBadge");

  let userId = null;
  let stampCount = 0;
  let qrScanner = null;
  const SALT = "LOYALTEA_SECRET_SALT";

  async function generateTodayHash() {
    const today = new Date().toISOString().slice(0, 10);
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(SALT + today));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  }

  async function fetchUser() {
    const { data: session } = await supabase.auth.getUser();
    if (!session?.user) return window.location.href = "index.html";
    userId = session.user.id;
    if (userIdSpan) userIdSpan.textContent = userId;
  }

  async function fetchUserData() {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("first_name, stamp_count")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return;
    }

    const firstName = profileData.first_name;
    stampCount = profileData.stamp_count || 0;

    // Save to localStorage
    localStorage.setItem("firstName", firstName);

    const stampCountDisplay = document.getElementById("stampCountDisplay");
    if (stampCountDisplay) stampCountDisplay.textContent = stampCount;

    if (userName) userName.textContent = `${firstName}`;
    updateStampGrid();
    updateRewardsBadge();
  }

  // Show cached first name instantly if available
  const cachedFirstName = localStorage.getItem("firstName");
  if (cachedFirstName && userName) {
    userName.textContent = cachedFirstName;
  }

  function updateStampGrid() {
    if (!stampGrid) return;
    stampGrid.innerHTML = "";
    for (let i = 0; i < 9; i++) {
      const stamp = document.createElement("div");
      stamp.className = "stamp-slot";
      const img = document.createElement("img");
      img.src = i < stampCount ? "images/star_filled.png" : "images/star_empty.png";
      img.alt = "stamp";
      img.style.width = "36px";
      img.style.height = "36px";
      stamp.appendChild(img);
      stampGrid.appendChild(stamp);
    }
  }

  function updateRewardsBadge() {
    if (rewardsBadge) {
      rewardsBadge.style.display = stampCount >= 9 ? "flex" : "none";
      rewardsBadge.textContent = stampCount >= 9 ? "1" : "";
    }
  }

async function addStamp() {
  if (stampCount >= 9) {
    alert("You already have 9 stamps. Please redeem your free drink before collecting more.");
    window.location.href = "rewards.html";
    return;
  }

  const newCount = stampCount + 1;

  // ✅ First update the profile
  const { error } = await supabase
    .from("profiles")
    .update({ stamp_count: newCount })
    .eq("id", userId);

  if (error) {
    console.error("Error updating stamp count:", error);
    if (scanStatus) scanStatus.textContent = "Failed to add stamp.";
    return;
  }

  // ✅ THEN log the scan
  await supabase.from("stamps").insert({
    user_id: userId,
    method: "QR"
  });

  stampCount = newCount;

  const stampCountDisplay = document.getElementById("stampCountDisplay");
  if (stampCountDisplay) stampCountDisplay.textContent = stampCount;

  updateStampGrid();
  updateRewardsBadge();
  stampSound?.play();
  if (scanStatus) scanStatus.textContent = "Stamp added!";
}




  async function startQRScan() {
    if (!qrModal || !scanStatus || !qrReaderElem) return;

    console.log("QR Scan triggered");
    qrModal.classList.remove("hidden");
    scanStatus.textContent = "Scanning...";

    const todayHash = await generateTodayHash();

    if (qrScanner) {
      qrScanner.destroy();
      qrScanner = null;
    }

    qrReaderElem.srcObject = null;
    qrScanner = new QrScanner(
      qrReaderElem,
      async result => {
        qrScanner.stop();

        let data;
        try {
          data = JSON.parse(result.data);
        } catch {
          scanStatus.textContent = "Invalid QR code.";
          return;
        }

        if (data.type === "staff" && data.code === todayHash) {
          await addStamp();
          closeQRModal();
        } else {
          scanStatus.textContent = "Invalid staff QR code.";
        }
      },
      {
        preferredCamera: 'environment',
        highlightScanRegion: true,
        highlightCodeOutline: true
      }
    );
    qrScanner.start();
  }

  function closeQRModal() {
    if (qrScanner) {
      qrScanner.stop();
      qrScanner.destroy();
      qrScanner = null;
    }
    if (qrModal) qrModal.classList.add("hidden");
    if (scanStatus) scanStatus.textContent = "";
  }

  openQRBtn?.addEventListener("click", startQRScan);
  closeQRBtn?.addEventListener("click", closeQRModal);

  await fetchUser();
  await fetchUserData();
});
