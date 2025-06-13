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
  const logContainer = document.getElementById("redeemLogs");

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    try {
      // ── 1) Clear any old logs and fetch the “redeems” for this user ──
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

      // ── 2) Loop through each document and render a log entry ──
      redeemSnap.forEach(docSnapshot => {
        const log = docSnapshot.data();

        // Format Firestore timestamp into “DD MMMM YYYY”
        let formattedDate = "";
if (log.date) {
  // If log.date is a Firestore Timestamp object:
  if (typeof log.date.toDate === "function") {
    const d = log.date.toDate();
    formattedDate = d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }
  // If log.date is a string (fallback):
  else if (typeof log.date === "string") {
    const d = new Date(log.date);
    formattedDate = d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }
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
