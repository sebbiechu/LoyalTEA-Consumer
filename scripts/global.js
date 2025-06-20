// scripts/global.js
import { supabase } from './supabase-init.js';

// ✅ Display or hide the rewards badge
function updateRewardsBadge(stamps) {
  const badge = document.getElementById('rewardsBadge');
  if (badge) {
    if (stamps >= 9) {
      badge.style.display = "flex";
      badge.textContent = "1";
    } else {
      badge.style.display = "none";
    }
  }
}

// ✅ Fetch user profile and update badge
async function checkAndUpdateBadge() {
  const {
    data: session,
    error: sessionError
  } = await supabase.auth.getUser();

  if (!session?.user) return;

  const userId = session.user.id;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("stamp_count")
    .eq("id", userId)
    .single();

  if (!profile || profileError) return;

  const stamps = Number(profile.stamp_count) || 0;
  updateRewardsBadge(stamps);
}

// ✅ Run on load
document.addEventListener("DOMContentLoaded", checkAndUpdateBadge);
