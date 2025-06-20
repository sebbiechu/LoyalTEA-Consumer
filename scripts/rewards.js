import QrScanner from "https://cdn.jsdelivr.net/npm/qr-scanner@1.4.2/qr-scanner.min.js";
import { supabase } from './supabase-init.js';

document.addEventListener("DOMContentLoaded", () => {
  const rewardForm      = document.getElementById("rewardForm");
  const useBtn          = document.getElementById("useRewardBtn");
  const rewardUsesText  = document.getElementById("rewardUses");
  const scanModal       = document.getElementById("scanModal");
  const closeScanBtn    = document.getElementById("closeScanBtn");
  const scanStatus      = document.getElementById("scanStatus");
  const qrReaderElem    = document.getElementById("qr-reader");

  let qrScanner = null;
  let scanActive = false;
  let userId = null;
  let stampCount = 0;
  const SALT = "LOYALTEA_SECRET_SALT";
  let selectedDrink = null;

  async function generateTodayHash() {
    const today = new Date().toISOString().slice(0, 10);
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(SALT + today));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  }

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
      document.querySelector('.rewards-banner')?.after(div);
    } else {
      existing.textContent = msg;
    }
  }

  function hideNoRewardsMessage() {
    let existing = document.getElementById('emptyStateMsg');
    if (existing) existing.remove();
  }

  function updateRewardsBadge() {
    const badge = document.getElementById('rewardsBadge');
    if (badge) {
      badge.style.display = stampCount >= 9 ? "flex" : "none";
      badge.textContent = stampCount >= 9 ? "1" : "";
    }
  }

 async function redeemReward() {
  const now = new Date().toISOString();

  const selectedInput = document.querySelector('input[name="reward"]:checked');
  const selectedValue = selectedInput?.value?.trim();


  if (!selectedValue) {
    scanStatus.textContent = "Please select a reward before redeeming.";
    return;
  }

  console.log("Selected reward type:", selectedValue);

  const { error: insertError } = await supabase.from("redeems").insert({
    user_id: userId,
    type: selectedValue,
    count: 1,
    total: 1,
    created_at: now
  });

  if (insertError) {
    console.error("Insert error:", insertError);
    scanStatus.textContent = "Failed to redeem. Please try again.";
    return;
  }

  const { data: profileData, error: fetchError } = await supabase
    .from("profiles")
    .select("stamp_count")
    .eq("id", userId)
    .single();

  const current = profileData?.stamp_count || 0;
  const newCount = Math.max(current - 9, 0);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ stamp_count: newCount })
    .eq("id", userId);

  if (updateError) {
    console.error("Update error:", updateError);
    scanStatus.textContent = "Failed to update stamp count.";
    return;
  }

  document.getElementById("rewardSound")?.play();
  scanStatus.textContent = `Reward redeemed: ${selectedValue}!`;

  await fetchUserData();
}


  async function startStaffScan() {
    if (!selectedDrink) {
      alert("Please select a drink to redeem.");
      return;
    }

    scanActive = true;
    scanStatus.textContent = "Scan the staff QR code at the till…";
    scanModal?.classList.remove("hidden");

    if (qrScanner) {
      qrScanner.destroy();
      qrScanner = null;
    }
    qrReaderElem.srcObject = null;

    const todayHash = await generateTodayHash();

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
          scanStatus.textContent = "Invalid QR code.";
          closeScanModal();
          return;
        }

        if (data.type === "staff" && data.code === todayHash) {
          scanStatus.textContent = "Redeeming reward…";
          await redeemReward();
        } else {
          scanStatus.textContent = "Invalid staff QR code.";
        }

        setTimeout(() => {
          closeScanModal();
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

  function closeScanModal() {
    if (qrScanner) {
      qrScanner.stop();
      qrScanner.destroy();
      qrScanner = null;
    }
    scanModal?.classList.add("hidden");
    scanStatus.textContent = "";
    clearSelection();
  }

  function clearSelection() {
    const selected = document.querySelector('input[name="reward"]:checked');
    if (selected) selected.checked = false;
    selectedDrink = null;
    if (useBtn) useBtn.disabled = true;
  }

  async function fetchUserData() {
    const { data: session } = await supabase.auth.getUser();
    if (!session?.user) return window.location.href = "index.html";
    userId = session.user.id;

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("stamp_count")
      .eq("id", userId)
      .single();

    stampCount = profile?.stamp_count || 0;

    const container = document.querySelector(".rewards-container");
    if (stampCount < 9) {
      container.style.display = "none";
      showNoRewardsMessage("No rewards yet! Earn 9 stamps for a free drink.");
    } else {
      container.style.display = "block";
      hideNoRewardsMessage();
      if (rewardUsesText) rewardUsesText.textContent = "1 reward available";
    }

    updateRewardsBadge();
    clearSelection();
  }

  rewardForm?.addEventListener("change", (e) => {
    const selected = rewardForm.querySelector('input[name="reward"]:checked');
    if (selected) {
      selectedDrink = selected.value;
      if (useBtn) useBtn.disabled = false;
    }
  });

  useBtn?.addEventListener("click", startStaffScan);
  closeScanBtn?.addEventListener("click", closeScanModal);

  fetchUserData();
});
