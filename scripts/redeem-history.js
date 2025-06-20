import { supabase } from "./supabase-init.js";

const drinkDescriptions = {
  "Cafe Tea": "Your daily favourite tea.",
  "Cafe Speciality Tea": "Gently wrapped favourable tea.",
  "Double Expresso": "Arabic dark roast 100%.",
  "Flat White": "Espresso, cream, milk, foam.",
  "Americano": "Espresso, hot water.",
  "Cafe Latte": "Original blend latte.",
  "Cappuccino": "Espresso, steamed milk, foam.",
  "Cafe Mocha": "Espresso, chocolate, steamed milk, foam.",
  "Hot Chocolate": "Milk chocolate, steamed milk.",
  "Chai Latte": "Black tea infused with spices, milk, foam."
};

const drinkImages = {
  "Cafe Tea": "tea.jpg",
  "Cafe Speciality Tea": "specialtea.jpg",
  "Double Expresso": "espresso.jpg",
  "Flat White": "flatwhite.jpg",
  "Americano": "americano.jpg",
  "Cafe Latte": "latte.jpg",
  "Cappuccino": "cappuccino.jpg",
  "Cafe Mocha": "mocha.jpg",
  "Hot Chocolate": "hotchocolate.jpg",
  "Chai Latte": "chailatte.jpg"
};

document.addEventListener("DOMContentLoaded", async () => {
  const logContainer = document.getElementById("redeemLogs");

  const { data: session } = await supabase.auth.getUser();
  const userId = session?.user?.id;

  if (!userId) {
    logContainer.innerHTML = "<p>Please log in to view your history.</p>";
    return;
  }

  const { data: logs, error } = await supabase
    .from("redeems")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !logs || logs.length === 0) {
    logContainer.innerHTML = "<p>No redeem history found.</p>";
    return;
  }

  logContainer.innerHTML = logs.map(log => {
    const d = new Date(log.created_at);
    const formatted = d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const name = log.type;
    const desc = drinkDescriptions[name] || "Reward redeemed.";
    const img = drinkImages[name] ? `images/drinks/${drinkImages[name]}` : "images/default.jpg";

    return `
      <div class="redeem-log-entry">
        <div class="log-date">${formatted}</div>
        <div class="log-card">
          <img src="${img}" alt="${name}" class="drink-img">
          <div class="log-info">
            <div class="log-title">${name}</div>
            <div class="log-desc">${desc}</div>
          </div>
          <div class="log-status">Free</div>
        </div>
      </div>
    `;
  }).join("");
});
