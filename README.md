<div align="center">
<p align="center">
  <img width="100" src="https://github.com/user-attachments/assets/44ebc490-691b-4b38-89b1-dcab2afb354d" alt="gitsnap-logo-bg">
</p>

 <h1>GitSnap</h1>
 <p>Visualize key metrics of a GitHub repository as charts</p>
</div>

<div align="center">
   <img src="https://badgen.net/chrome-web-store/v/gkeemliblioicebplmgekbmpdleogmpg?icon=chrome&color=607cd2" alt="chrome web store version">
   <img src="https://badgen.net/chrome-web-store/users/gkeemliblioicebplmgekbmpdleogmpg?icon=chrome&color=607cd2" alt="chrome web store users">
</div> 
<p align="center">
  <a href="https://github.com/frankiefab100/gitsnap/issues/new/choose">Report Bug</a>
    ·
    <a href="https://github.com/frankiefab100/gitsnap/issues/new/choose">Request Feature</a>
</p>

---
GitSnap is a browser extension that transforms your GitHub repository data into visually engaging charts.

It utilize the [Echarts library](https://echarts.apache.org/) to create various types of charts (such as line chart, pie chart, bar chart) for visualizing GitHub repository key metrics such as contributors' activity, branches, pull request, and issue statistics.

## Features

- **Contributors Metrics**: See who is contributing to your project with detailed insights into distribution of contributions as well as key contributors.
- **Pull Request Analytics**: Monitor the status (open, merged, and closed) of pull requests over time.
- **Issue Tracking**: Track issues with line charts that display both open and closed issues over time.
- **Branch Visualization**: View branches as a tree structure, to understand the relationships and hierarchy between different branches in your repository.

## Demo

![GitSnap-gif](https://github.com/user-attachments/assets/26eab250-353e-4ca0-bc88-3a39a27ac47c)

## How It Works

- After installation, click on the GitSnap icon in your browser's extension menu.
- Toggle the switch to activate the extension.
- Hover over any GitHub repository link to view visually engaging charts that present key data.

> [!NOTE]
>
> The GitSnap extension will only work on GitHub pages. If you are not on a GitHub repository, the extension will remain disabled and no charts will be displayed.


## Installation

### Install from the Chrome Web Store
<a href="https://chromewebstore.google.com/detail/gitsnap/gkeemliblioicebplmgekbmpdleogmpg" target="_blank"><img src="https://github.com/user-attachments/assets/c9349de6-ccfe-4bd0-a4b0-650a4553582d" alt="Chrome Web Store" style="width:200px"/></a>

### Local Installation

How to Locally Install `GitSnap` in your Chrome Browser.

**1.** Open Google Chrome browser and type `chrome://extensions/` in the search tab.
<!-- screenshot here -->
![chrome://extensions/ in the search tab](https://github.com/user-attachments/assets/9ae3d6a7-0c98-4d58-b69c-d1a9abe731a5)


Or simply, click the **Options Menu** navigate to **Settings** then select **Extensions**

<!-- screenshot here -->
![Options Menu](https://github.com/user-attachments/assets/4b5ea4d8-1804-4419-8f70-24881b732e3f)


**2.** Turn **Developer mode**, Click on **Load Unpacked**.
<!-- screenshot here -->
<img width="688" alt="Developer mode" src="https://github.com/user-attachments/assets/e29e15b3-447b-4f7c-bbe9-fad0b5de2a47">


**3.** Locate the **gitsnap** directory and select to load the files.
<!-- screenshot here -->
<img width="702" alt="Load Unpacked" src="https://github.com/user-attachments/assets/fea7c4fa-0b11-49db-9cb0-b28d5bb3dbdf">

## Configuration Instructions

In `config.js`, you'll need to modify the `GITHUB_API_KEY` with your GitHub Personal Access Token.

- Click on your profile picture in the top right corner and select **Settings** from the dropdown menu.
- In the left sidebar, scroll down and click on **Developer settings**.
- Click on **Personal access tokens**. Then, Select **Tokens (classic)**.
- Click on the **Generate new token** button.
- Copy your new token immediately, as you won’t be able to see it again once you leave this page.
- Update the `config.js` file.
  
     ```javascript
     const CONFIG = {
         GITHUB_API_KEY: 'your_personal_access_token_here',
     };
     ```

## Roadmap (Work In Progress)
- [x] **Custom Toggle Switches**: Introduce custom toggle switches for each chart type, allowing users to display data for Contributors, Pull Requests, Issues or Branches.
- [ ] **GitHub URL Input**: Implement a feature to switch/select the "Enter GitHub URL" tab where users can copy and paste any GitHub repository link.


## Releases

To see the latest updates and changes, please refer to the [CHANGELOG](https://github.com/frankiefab100/gitsnap/blob/main/CHANGELOG.md).

## License

This project is licensed under [MIT](https://opensource.org/license/mit) license.
