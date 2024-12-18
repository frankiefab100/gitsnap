document.addEventListener("DOMContentLoaded", () => {
  const toggleButtons = document.querySelectorAll(".tooltipToggle");

  chrome.storage.sync.get(["chartToggles"], (result) => {
    const savedToggles = result.chartToggles || {
      contributors: true,
      branches: true,
      pullRequests: true,
      issues: true,
    };

    toggleButtons.forEach((button) => {
      button.checked = savedToggles[button.id] !== false;
    });

    if (!result.chartToggles) {
      chrome.storage.sync.set({ chartToggles: savedToggles });
    }
  });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const isGitHubPage = tabs[0].url?.includes("github.com");

    if (!isGitHubPage) {
      toggleButtons.forEach((button) => {
        button.checked = false;
        button.disabled = true;
      });
      document.querySelector(".popup-container p").textContent =
        "Only works on GitHub pages";
    }
  });

  toggleButtons.forEach((button) => {
    button.addEventListener("change", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0].url?.includes("github.com")) {
          // Update storage first
          chrome.storage.sync.get(["chartToggles"], (result) => {
            const currentToggles = result.chartToggles || {};
            const updatedToggles = {
              ...currentToggles,
              [button.id]: button.checked,
            };

            chrome.storage.sync.set({ chartToggles: updatedToggles }, () => {
              // Only send message after successful storage update
              chrome.tabs
                .sendMessage(tabs[0].id, {
                  action: "updateChartToggle",
                  chart: button.id,
                  enabled: button.checked,
                })
                .catch((error) => {
                  console.error("Message sending failed:", error);
                  button.checked = !button.checked;
                });
            });
          });
        }
      });
    });
  });
});
