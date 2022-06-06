# Jiffy Reader
A Browser Extension for Bionic Reading on ANY website!

<a href="https://www.producthunt.com/posts/jiffy-reader?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-jiffy&#0045;reader" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=347823&theme=light" alt="Jiffy&#0032;Reader - Read&#0032;anything&#0032;on&#0032;the&#0032;internet&#0032;faster&#0032;and&#0032;more&#0032;clearly&#0033; | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>
<a href="https://www.producthunt.com/posts/jiffy-reader?utm_source=badge-top-post-badge&utm_medium=badge&utm_souce=badge-jiffy&#0045;reader" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/top-post-badge.svg?post_id=347823&theme=light&period=daily" alt="Jiffy&#0032;Reader - Read&#0032;anything&#0032;on&#0032;the&#0032;internet&#0032;faster&#0032;and&#0032;more&#0032;clearly | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>



# How it works
Below is a screenshot demonstrating how the extension works by bolding out the initial parts of all text on any page when clicked. There are toggles and sliders to customize it to your preference so you can enjoy your time reading. You must agree this is awesome right?
![Screenshot from 2022-05-29 19-13-02](https://user-images.githubusercontent.com/20851930/170895288-992e802f-4f64-4134-97cc-5144685ecb9e.png)


The best way to install this extension is to follow the instructions below. However, we will also periodically be releasing this extension on the various stores under the name  [Jiffy Reader](https://jiffyreader.com). 



# Table of Contents
- [Jiffy Reader](#jiffy-reader)
- [How it works](#how-it-works)
- [Table of Contents](#table-of-contents)
- [Installation Instructions](#installation-instructions)
  - [Chrome](#chrome)
  - [Firefox](#firefox)
  - [Opera](#opera)
  - [Edge](#edge)
  - [Bookmarklet](#bookmarklet)
- [Customizations](#customizations)
  - [Shortcut](#shortcut)
- [What is Bionic Reading?](#what-is-bionic-reading)
- [Reporting Issues, bugs and feature request](#reporting-issues-bugs-and-feature-request)
- [How to Contribute](#how-to-contribute)
  - [Development](#development)
  - [Configure vscode to run the project when it is opened](#configure-vscode-to-run-the-project-when-it-is-opened)
  - [Release a new version](#release-a-new-version)

# Installation Instructions 


## Chrome

  > Download via [Chrome Store](https://chrome.google.com/webstore/detail/jiffy-reader/lljedihjnnjjefafchaljkhbpfhfkdic) or follow the instructions below

  1. Click [here](https://github.com/ansh/bionic-reading/releases/latest/download/chrome.zip) to download the latest `chrome.zip` release
  2. Extract the file
  3. Open Chrome
  4. Enter `chrome://extensions`  in the address bar 
  5. Enable `developer mode` with the toggle on the top right side of the page if it is not enabled already
  6. Click `load unpacked` on the left side of the page
  7. Find and select the extracted folder, this extension should now be installed
  8. To pin the extension, click the `puzzle icon` on the top right of Chrome, then `pin the extension`.



## Firefox

> Download via the [Mozilla Firefox Plugin/Add-on Store](https://addons.mozilla.org/en-US/firefox/addon/jiffy-reader/) or follow the instructions below

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

(Note: Bookmarklet is not in active support and may break when new updates are released)
1. To install the bookmarklet, head over to this [link](https://github.com/ansh/bionic-reading/releases/latest/download/bookmarklet.html)


# Customizations

## Shortcut
- `Alt+B` is the default toggle shortcut to turn `on or off` the extension
- If prefered you may customize the extension shortcut with the help of the resources below
- [Chrome, Firefox and Edge](https://www.makeuseof.com/open-browser-extensions-keyboard-shortcut/)
- Opera: open the extension management tab and click the `Keyboard shortcuts` link to access the page for customizing opera shortcuts



# What is Bionic Reading?
Bionic Reading is a new method facilitating the reading process by guiding the eyes through text with artficial fixation points.
As a result, the reader is only focusing on the highlighted initial letters and lets the brain center complete the word.
In a digital world dominated by shallow forms of reading, Bionic Reading aims to encourage a more in-depth reading and understanding of written content.

Read more about [Bionic Reading](https://bionic-reading.com/about/).



# Reporting Issues, bugs and feature request
  Visit the issues page to report, bugs or tell us about a feature you would like to see and hopefully we will get to you.
  Kindly allow for some time after submitting a issue for someone to get back to you.
  You can also see a list of open issues that you may contribute to by commenting to help out someone with a challenge or developing and opening a PR. [See contribution section](#how-to-contribution)



# How to Contribute
  Anyone is welcome to provide contributions to this project by submitting a PR (Pull Request) and it will be happily merged to provide features and fixes to the incredible people using the extension.

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
  5. Reload VS code. 



## Release a new version

- Change `version` in `package.json`, eg. `"version": "1.0.0"`
- Push a new tag to GitHub, eg. `git tag 1.0.0 && git push --tags`
- The Workflow should be running [here](https://github.com/ansh/bionic-reading/actions)
- Check the release version [here](https://github.com/ansh/bionic-reading/releases) and edit release notes.
