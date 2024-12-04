document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("tooltipToggle");

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const isGitHubPage = tabs[0].url?.includes("github.com");
    toggleButton.disabled = !isGitHubPage;

    if (!isGitHubPage) {
      toggleButton.checked = false;
      document.querySelector(".popup-container p").textContent =
        "Only works on GitHub pages";
    }
  });

  toggleButton.addEventListener("change", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].url?.includes("github.com")) {
        chrome.tabs
          .sendMessage(tabs[0].id, {
            action: "toggleTooltip",
            enabled: toggleButton.checked,
          })
          .catch((error) => {
            console.error("Message sending failed:", error);
            toggleButton.checked = !toggleButton.checked;
          });
      }
    });
  });
});
