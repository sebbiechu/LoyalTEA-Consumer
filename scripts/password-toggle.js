document.addEventListener("DOMContentLoaded", () => {
  const passwordInput = document.getElementById("loginPassword");
  const toggleBtn = document.getElementById("togglePassword");
  const eyeIcon = document.getElementById("eyeIcon");

  let showing = false;

  toggleBtn.addEventListener("click", () => {
    showing = !showing;
    passwordInput.type = showing ? "text" : "password";

    // Swap icon path between eye and eye-off
    eyeIcon.innerHTML = showing
      ? `<path d="M12 6c-3.87 0-7.19 2.41-9 6 1.81 3.59 5.13 6 9 6s7.19-2.41 9-6c-1.81-3.59-5.13-6-9-6zm0 10a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke="#fff" stroke-width="2"/>`
      : `<path d="M12 4.5C7 4.5 2.73 8.11 1 12c1.73 3.89 6 7.5 11 7.5s9.27-3.61 11-7.5C21.27 8.11 17 4.5 12 4.5zm0 12c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5S14.49 16.5 12 16.5z"/><circle cx="12" cy="12" r="2"/>`;
  });
});
