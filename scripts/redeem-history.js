// redeem-history.js
import { auth, db } from "./firebase-init.js";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const grid         = document.querySelector(".stamp-grid");
  const logContainer = document.getElementById("redeemLogs");

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    try {
      // ── 1) Build the top‐grid of stamps (1–9 plus cup) ──
      const userRef  = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      const currentStamps = userData.stamps || 0;

      grid.innerHTML = "";
      for (let i = 1; i <= 9; i++) {
        const stamp = document.createElement("div");
        stamp.classList.add("stamp");
        if (i <= currentStamps) {
          stamp.classList.add("filled");
          stamp.textContent = ""; // the filled bean icon comes from CSS
        } else {
          stamp.textContent = i;  // show number for unfilled
        }
        grid.appendChild(stamp);
      }
      const cup = document.createElement("div");
      cup.classList.add("stamp", "cup");
      grid.appendChild(cup);

      // ── 2) Clear any old logs and fetch the “redeems” for this user ──
      logContainer.innerHTML = "";
      const redeemQuery = query(
        collection(db, "redeems"),
        where("uid", "==", user.uid),
        orderBy("date", "desc")
      );
      const redeemSnap = await getDocs(redeemQuery);

      if (redeemSnap.empty) {
        const noHistory = document.createElement("div");
        noHistory.classList.add("redeem-log");
        noHistory.textContent = "No redemption history yet.";
        logContainer.appendChild(noHistory);
        return;
      }

      // ── 3) Loop through each document and render a log entry ──
      redeemSnap.forEach(docSnapshot => {
        const log = docSnapshot.data();

        // Format Firestore timestamp into “DD MMMM YYYY”
        let formattedDate = "";
        if (log.date && log.date.toDate) {
          const d = log.date.toDate();
          formattedDate = d.toLocaleDateString("en-GB", {
            day:   "2-digit",
            month: "long",
            year:  "numeric"
          });
        }

        const logBlock = document.createElement("div");
        logBlock.classList.add("redeem-log");

        if (formattedDate) {
          const dateEl = document.createElement("div");
          dateEl.classList.add("redeem-date");
          dateEl.textContent = formattedDate;
          logBlock.appendChild(dateEl);
        }

        const msg = document.createElement("div");
        msg.classList.add("redeem-entry");

        // Apply different CSS classes so ::before picks the right icon
        if (log.type === "Coffee") {
          msg.classList.add("coffee");
        } else {
          msg.classList.add("tea");
        }

        const count = log.count || 0;
        const total = log.total || (log.type === "Tea" ? 2 : 1);
        const singularType = log.type;            // "Coffee" or "Tea"
        const pluralType   = singularType + "s";  // "Coffees" or "Teas"
        const displayType  = count === 1 ? singularType : pluralType;

        // ── Conditionally omit “/ 1 Coffees” when type is Coffee ──
        if (log.type === "Coffee") {
          msg.textContent = `You have redeemed: ${count} ${displayType}`;
        } else {
          // For Tea, show “1 Tea / 2 Teas” or “2 Teas / 2 Teas”
          msg.textContent = `You have redeemed: ${count} ${displayType} / ${total} ${pluralType}`;
        }

        logBlock.appendChild(msg);
        logContainer.appendChild(logBlock);
      });
    }
    catch (err) {
      console.error("Failed to load redeem history:", err);
      const errEl = document.createElement("div");
      errEl.classList.add("redeem-log");
      errEl.textContent = "Error loading redemption history.";
      logContainer.appendChild(errEl);
    }
  });
});
