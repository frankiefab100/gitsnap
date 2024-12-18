let tooltip = null;
let activeRepo = null;
let hoverTimeout = null;
let enabled = true;
let chartToggles = {
  contributors: true,
  branches: true,
  pullRequests: true,
  issues: true,
};

function init() {
  createTooltip();
  loadChartToggles();
  listenForExtensionStatus();
  addHoverListeners();
}

function createTooltip() {
  tooltip = document.createElement("div");
  tooltip.className = "repo-tooltip";
  document.body.appendChild(tooltip);
}

function loadChartToggles() {
  chrome.storage.sync.get(["chartToggles"], (result) => {
    if (result.chartToggles) {
      chartToggles = result.chartToggles;
    }
  });
}

function saveChartToggles() {
  chrome.storage.sync.set({ chartToggles }, () => {
    return chartToggles;
  });
}

function listenForExtensionStatus() {
  chrome.runtime.onMessage.addListener((message, sendResponse) => {
    try {
      if (message.action === "toggleTooltip") {
        enabled = message.enabled;
        if (enabled) {
          addHoverListeners();
        } else {
          removeHoverListeners();
          hideTooltip();
        }
        sendResponse({ success: true });
      } else if (message.action === "updateChartToggle") {
        chartToggles[message.chart] = message.enabled;
        if (activeRepo) {
          fetchRepoData();
        }
        sendResponse({ success: true });
      }
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
    return true;
  });
}

function addHoverListeners() {
  document.addEventListener("mouseover", handleMouseOver);
  document.addEventListener("mouseout", handleMouseOut);
}

function removeHoverListeners() {
  document.removeEventListener("mouseover", handleMouseOver);
  document.removeEventListener("mouseout", handleMouseOut);
}

async function handleMouseOver(event) {
  const repoLink = findRepoLink(event.target);
  if (!repoLink) return;

  clearTimeout(hoverTimeout);
  hoverTimeout = setTimeout(async () => {
    const [owner, repo] = repoLink.pathname.slice(1).split("/");
    activeRepo = { owner, repo };
    const rect = repoLink.getBoundingClientRect();
    showTooltip(rect);
    await fetchRepoData();
  }, 500);
}

function handleMouseOut() {
  clearTimeout(hoverTimeout);
  hoverTimeout = setTimeout(() => {
    hideTooltip();
  }, 300);
}

function findRepoLink(element) {
  if (element.tagName === "A") {
    const match = element.href.match(/github\.com\/([^/]+)\/([^/]+)/);
    return match ? element : null;
  }
  return null;
}

function showTooltip(rect) {
  tooltip.style.left = `${rect.left}px`;
  tooltip.style.top = `${rect.bottom + window.scrollY + 10}px`;
  tooltip.innerHTML = '<div class="loading">Loading repository data...</div>';
  tooltip.style.display = "block";
}

function hideTooltip() {
  tooltip.style.display = "none";
  activeRepo = null;
}

async function fetchRepoData() {
  try {
    const [contributors, branches, pullRequests, issues] = await Promise.all([
      chartToggles.contributors ? fetchContributors() : Promise.resolve(null),
      chartToggles.branches ? fetchBranches() : Promise.resolve(null),
      chartToggles.pullRequests ? fetchPullRequests() : Promise.resolve(null),
      chartToggles.issues ? fetchIssues() : Promise.resolve(null),
    ]);

    renderTooltipContent({
      contributors,
      branches,
      pullRequests,
      issues,
    });
  } catch (error) {
    showError(error.message);
  }
}

async function fetchWithAuth(url) {
  const response = await fetch(url, {
    headers: {
      Authorization: `token ${CONFIG.GITHUB_API_KEY}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);

  return response.json();
}

async function fetchContributors() {
  const url = `https://api.github.com/repos/${activeRepo.owner}/${activeRepo.repo}/contributors`;
  return fetchWithAuth(url);
}

async function fetchBranches() {
  const url = `https://api.github.com/repos/${activeRepo.owner}/${activeRepo.repo}/branches`;
  const branches = await fetchWithAuth(url);
  return branches.slice(0, CONFIG.MAX_BRANCHES);
}

async function fetchPullRequests() {
  const url = `https://api.github.com/repos/${activeRepo.owner}/${activeRepo.repo}/pulls`;
  const prs = await fetchWithAuth(url);
  return prs.slice(0, CONFIG.MAX_PRS);
}

async function fetchIssues() {
  const url = `https://api.github.com/repos/${activeRepo.owner}/${activeRepo.repo}/issues?state=all`;
  return fetchWithAuth(url);
}

function renderTooltipContent(data) {
  const enabledCharts = Object.keys(chartToggles).filter(
    (key) => chartToggles[key]
  );

  if (enabledCharts.length === 0) {
    tooltip.innerHTML =
      '<div class="no-charts">No charts selected to display</div>';
    return;
  }

  // Calculate the grid columns based on enabled charts
  const gridCols = enabledCharts.length > 2 ? 2 : enabledCharts.length;

  tooltip.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(${gridCols}, 1fr); gap: 16px; min-width: 600px;">
      ${
        chartToggles.contributors && data.contributors
          ? `
        <div class="tooltip-section">
          <h3 style="margin-bottom: 8px; font-size: 16px;">Contributors</h3>
          <div class="contributors-chart" style="width: 300px; height: 200px;"></div>
        </div>
      `
          : ""
      }
      ${
        chartToggles.branches && data.branches
          ? `
        <div class="tooltip-section">
          <h3 style="margin-bottom: 8px; font-size: 16px;">Branches</h3>
          <div class="branches-chart" style="width: 300px; height: 200px;"></div>
        </div>
      `
          : ""
      }
      ${
        chartToggles.pullRequests && data.pullRequests
          ? `
        <div class="tooltip-section">
          <h3 style="margin-bottom: 8px; font-size: 16px;">Pull Requests</h3>
          <div class="prs-chart" style="width: 300px; height: 200px;"></div>
        </div>
      `
          : ""
      }
      ${
        chartToggles.issues && data.issues
          ? `
        <div class="tooltip-section">
          <h3 style="margin-bottom: 8px; font-size: 16px;">Issues</h3>
          <div class="issues-chart" style="width: 300px; height: 200px;"></div>
        </div>
      `
          : ""
      }
    </div>`;

  // Initialize charts after a short delay to ensure containers are ready
  requestAnimationFrame(() => {
    if (chartToggles.contributors && data.contributors) {
      createContributorsChart(
        tooltip.querySelector(".contributors-chart"),
        data.contributors
      );
    }
    if (chartToggles.branches && data.branches) {
      createBranchesChart(
        tooltip.querySelector(".branches-chart"),
        data.branches
      );
    }
    if (chartToggles.pullRequests && data.pullRequests) {
      createPullRequestsChart(
        tooltip.querySelector(".prs-chart"),
        data.pullRequests
      );
    }
    if (chartToggles.issues && data.issues) {
      createIssuesChart(tooltip.querySelector(".issues-chart"), data.issues);
    }
  });
}

function showError(message) {
  tooltip.innerHTML = `<div class="error">Error: ${message}</div>`;
}

function createContributorsChart(container, contributors) {
  const chart = echarts.init(container);
  const data = contributors.map((contributor) => ({
    value: contributor.contributions,
    name: contributor.login,
  }));

  const option = {
    tooltip: {
      trigger: "item",
    },
    series: [
      {
        type: "pie",
        radius: "70%",
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };

  chart.setOption(option);
  return chart;
}

function createBranchesChart(container, branches) {
  const chart = echarts.init(container);

  const data = {
    name: "main",
    children: branches.map((branch) => ({
      name: branch.name,
      value: branch.name,
      itemStyle: { color: "#73c0de" },
      label: {
        show: true,
        position: "right",
        distance: 5,
        color: "#333",
        fontSize: 12,
        formatter: "{b}",
      },
    })),
  };

  const option = {
    series: [
      {
        type: "tree",
        data: [data],
        top: "5%",
        left: "15%",
        bottom: "5%",
        right: "15%",
        symbolSize: 7,
        orient: "LR",
        initialTreeDepth: 2,
        label: { position: "right", verticalAlign: "middle", align: "left" },
        leaves: {
          label: { position: "right", verticalAlign: "middle", align: "left" },
        },
        expandAndCollapse: false,
        animationDuration: 550,
        lineStyle: { color: "#ccc", width: 1 },
      },
    ],
  };

  chart.setOption(option);
  return chart;
}

function createPullRequestsChart(container, pullRequests) {
  const chart = echarts.init(container);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const timeData = {};
  for (
    let d = new Date(thirtyDaysAgo);
    d <= new Date();
    d.setDate(d.getDate() + 1)
  ) {
    const dateStr = d.toISOString().split("T")[0];
    timeData[dateStr] = { open: 0, merged: 0 };
  }

  pullRequests.forEach((pr) => {
    const date = new Date(pr.created_at).toISOString().split("T")[0];
    if (timeData[date]) {
      if (pr.merged_at) {
        timeData[date].merged++;
      } else {
        timeData[date].open++;
      }
    }
  });

  const option = {
    tooltip: { trigger: "axis" },
    legend: { data: ["Open", "Merged"] },
    xAxis: { type: "category", data: Object.keys(timeData) },
    yAxis: { type: "value" },
    series: [
      {
        name: "Open",
        type: "line",
        data: Object.values(timeData).map((d) => d.open),
        itemStyle: { color: "#28a745" },
      },
      {
        name: "Merged",
        type: "line",
        data: Object.values(timeData).map((d) => d.merged),
        itemStyle: { color: "#6f42c1" },
      },
    ],
  };

  chart.setOption(option);
  return chart;
}

function createIssuesChart(container, issues) {
  const chart = echarts.init(container);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const timeData = {};

  for (
    let d = new Date(thirtyDaysAgo);
    d <= new Date();
    d.setDate(d.getDate() + 1)
  ) {
    const dateStr = d.toISOString().split("T")[0];
    timeData[dateStr] = { open: 0, closed: 0 };
  }

  issues.forEach((issue) => {
    const date = new Date(issue.created_at).toISOString().split("T")[0];
    if (timeData[date]) {
      if (issue.state === "closed") {
        timeData[date].closed++;
      } else {
        timeData[date].open++;
      }
    }
  });

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    legend: {
      data: ["Open", "Closed"],
    },
    xAxis: {
      type: "category",
      data: Object.keys(timeData),
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "Open",
        type: "bar",
        data: Object.values(timeData).map((d) => d.open),
        itemStyle: { color: "#28a745" },
      },
      {
        name: "Closed",
        type: "bar",
        data: Object.values(timeData).map((d) => d.closed),
        itemStyle: { color: "#cb2431" },
      },
    ],
  };

  chart.setOption(option);
  return chart;
}

// Initialize the tooltip
init();
