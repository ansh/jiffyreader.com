# bionic-reading
A Chrome Extension for Bionic Reading on ANY website!

<a href="https://www.producthunt.com/posts/jiffy-reader?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-jiffy&#0045;reader" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=347823&theme=light" alt="Jiffy&#0032;Reader - Read&#0032;anything&#0032;on&#0032;the&#0032;internet&#0032;faster&#0032;and&#0032;more&#0032;clearly&#0033; | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>


# How it works
Below is a screenshot demonstrating how the extension works by bolding out the initial parts of all text on any page when clicked. There are toggles and dials to customize it to your preference so you can enjoy your time reading. You must agree; this is awesome right.
![Screenshot from 2022-05-29 19-13-02](https://user-images.githubusercontent.com/20851930/170895288-992e802f-4f64-4134-97cc-5144685ecb9e.png)


The best way to install this extension is to follow the instructions below. However, we will also periodically be releasing this extension on the various stores under the name  [Jiffy Reader](https://jiffyreader.com). 



# Table of Contents
- [bionic-reading](#bionic-reading)
- [How it works](#how-it-works)
- [Table of Contents](#table-of-contents)
- [Installation Instructions](#installation-instructions)
  - [Chrome](#chrome)
  - [Firefox](#firefox)
  - [Opera](#opera)
  - [Edge](#edge)
  - [Bookmarklet](#bookmarklet)
- [What is Bionic Reading?](#what-is-bionic-reading)
- [Reporting Issues, bugs and feature request](#reporting-issues-bugs-and-feature-request)
- [How to Contribution](#how-to-contribution)
  - [Development](#development)
  - [Configure vscode to run the project when it is opened](#configure-vscode-to-run-the-project-when-it-is-opened)
  - [Release a new version](#release-a-new-version)

# Installation Instructions 


## Chrome

  > Download via [Chrome Store](https://chrome.google.com/webstore/detail/jiffy-reader/lljedihjnnjjefafchaljkhbpfhfkdic) or

  1. Click [here](https://github.com/ansh/bionic-reading/releases/latest/download/chrome.zip) to download the latest `chrome.zip` release
  2. Extract the file
  3. Open Chrome
  4. Enter `chrome://extensions`  in the address bar 
  5. Enable `developer mode` with the toggle on the top right side of the page if it is not enabled already
  6. Click `load unpacked` on the left side of the page
  7. Find and select the extracted folder, this extension should now be installed
  8. To pin the extension, click the `puzzle icon` on the top right of Chrome, then `pin the extension`.



## Firefox

  1. Download `firefox.xpi` by right clicking [here](https://github.com/ansh/bionic-reading/releases/latest/download/firefox.xpi) and choose `Save link as` to download the latest `firefox.xpi `release
  2. Open Firefox
  3. Enter `about:debugging#/runtime/this-firefox`  in the address bar 
  4. Click `Load Temporary Add-on...` and navigate to the path of the downloaded `firefox.xpi` and select it to install it

<strong>Firefox will remove the extension when the browser is closed. This will be solved once we provide a means to download the extension from the firefox store</strong>



## Opera

  1. Download: Click [here](https://github.com/ansh/bionic-reading/releases/latest/download/opera.crx) to download the latest `opera.crx` release
  2. Extract the file
  3. Open Opera
  4. Enter `opera://extensions`  in the address bar 
  5. Enable `developer mode` with the toggle on the top right side of the page if it is not enabled already
  6. Click `load unpacked` on the left side of the page
  7. Find and select the extracted folder, this extension should now be installed and listed on the screen
  8. To pin the extension, click the `cube icon` on the top right of Chrome, then `pin the extension`.

## Edge

  - Please follow the steps for [chrome](#chrome) above


## Bookmarklet
Drag and drop the following code into your browser's bookmarks section as seen below, then click the bookmark on any page to toggle Bionic Reading.:
```js
function highlightText(t){return t.split(" ").map((t=>{if(t.includes("-"))return t.split("-").map((t=>highlightText(t))).join("-");if(/\d/.test(t))return t;const{length:e}=t;let n=1;e>3&&(n=Math.round(e/2));return`<br-bold>${t.slice(0,n)}</br-bold>${t.slice(n)}`})).join(" ")}function main(){const t=document.getElementsByTagName("br-bold");if(document.body.classList.toggle("br-bold"),t.length)return;const e=document.createElement("style");e.textContent=".br-bold br-bold { font-weight: bold !important; display: inline; line-height: var(--br-line-height,initial); }",document.head.appendChild(e);const n=new DOMParser;["p","font","span","li"].forEach((t=>{for(const e of document.getElementsByTagName(t)){const t=n.parseFromString(e.innerHTML,"text/html"),o=Array.from(t.body.childNodes).map((t=>t.nodeType===Node.TEXT_NODE?highlightText(t.nodeValue):t.outerHTML));e.innerHTML=o.join(" ")}}))}main();
```

# What is Bionic Reading?
Bionic Reading is a new method facilitating the reading process by guiding the eyes through text with artficial fixation points.
As a result, the reader is only focusing on the highlighted initial letters and lets the brain center complete the word.
In a digital world dominated by shallow forms of reading, Bionic Reading aims to encourage a more in-depth reading and understanding of written content.

Read more about [Bionic Reading](https://bionic-reading.com/about/).



# Reporting Issues, bugs and feature request
  Visit the issues page to report, bugs or tell us about a feature you would like to see and hopefully we will get to you.
  Kindly allow for some time after submitting a issue for someone to get back to you.
  You can also see a list of open issues that you may contribute to by commenting to help out someone with a challenge or developing and opening a PR. [See contribution section](#how-to-contribution)



# How to Contribution
  Anyone is welcome to provide contributions to this project by submitting a PR (Pull Request) and it will be happily merged to provide features and 
  fixes to the increadible people using the extension.

## Development
   1. Clone the project
   2. Open in VS Code or your favourite editor
   3. Run `yarn` or `npm i` to install dependencies
   4. Run `yarn dev:chrome` or `npm run dev:chrome` to build the development version. Substitute chrome for firefox if that is your prefered browser.
   5. Follow the installation version for your prefered browser but navigate to the `projectRootFolder/extensions/` and choose the folder that corresponds with your browser.



## Configure vscode to run the project when it is opened
  1. Copy `.vscode/tasks.json.example` to `.vscode/tasks.json` or enter `cp .vscode/tasks.json.example .vscode/tasks.json` in the terminal from the `project root`
  2. Open `vs code command pallet`
  3. Type and select `Tasks: Manage Automatic Tasks in Folder`
  4. Click `Allow Automatic Tasks in Folder`.
  5. Reload vs code. 



## Release a new version

- Change `version` in `package.json`, eg. `"version": "1.0.0"`
- Push a new tag to GitHub, eg. `git tag 1.0.0 && git push --tags`
- The Workflow should be running [here](https://github.com/ansh/bionic-reading/actions)
- Check the release version [here](https://github.com/ansh/bionic-reading/releases) and edit release notes.
