# bionic-reading
A Chrome Extension for Bionic Reading on ANY website!

<a href="https://www.producthunt.com/posts/jiffy-reader?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-jiffy&#0045;reader" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=347823&theme=light" alt="Jiffy&#0032;Reader - Read&#0032;anything&#0032;on&#0032;the&#0032;internet&#0032;faster&#0032;and&#0032;more&#0032;clearly&#0033; | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

The best way to install this extension is to follow the instructions below. However, we will also periodically be releasing this extension on the various stores under the name  [Jiffy Reader](https://jiffyreader.com). 

# Table of Contents
- [Installation Instructions](#installation-instructions)
  - [Chrome, Edge and chromium-based browsers](#chrome-edge-and-chromium-based-browsers)
  - [Firefox](#firefox)
  - [Opera](#opera)
- [What is Bionic Reading?](#what-is-bionic-reading)
- [How to build](#how-to-build)
- [Development](#development)
- [Release a new version](#release-a-new-version)

# Installation Instructions 

## Chrome, Edge and chromium-based browsers

> Download via [Chrome Store](https://chrome.google.com/webstore/detail/jiffy-reader/lljedihjnnjjefafchaljkhbpfhfkdic) or

- Download the latest build `chrome.zip` in [releases](https://github.com/ansh/bionic-reading/releases)
- Extract the `chrome` folder from the zip file
- Open Chrome > go to this link `chrome://extensions/` .
- Enable "Developer mode".
- Click "Load unpacked" and then choose the `chrome` folder. 
- To pin the extension, click the puzzle icon on the top right of Chrome, then pin the extension.


## Firefox

- Download the latest build `firefox.xpi` in [releases](https://github.com/ansh/bionic-reading/releases) (Use other browsers, Firefox won't allow downloading unsigned xip files)
- open Firefox
- enter `about:debugging#/runtime/this-firefox` in the URL bar
- click "Load Temporary Add-on"
- select the `firefox.xpi`

## Opera

- Download the latest build `chrome.zip` in [releases](https://github.com/ansh/bionic-reading/releases) and unzip it
- open Opera
- Enable Developer mode in Extension page
- click "Load Unpacked"
- select the folder

# What is Bionic Reading?
Bionic Reading is a new method facilitating the reading process by guiding the eyes through text with artficial fixation points.
As a result, the reader is only focusing on the highlighted initial letters and lets the brain center complete the word.
In a digital world dominated by shallow forms of reading, Bionic Reading aims to encourage a more in-depth reading and understanding of written content.

Read more about [Bionic Reading](https://bionic-reading.com/about/).

# How to build
Need to install npm and yarn
To build run followings
1. yarn install
2. yarn build (This will create extentions for chrome, firefox and opera inside extention folder)
to debug run 

# Development
1. Run ```yarn dev:chrome``` to start dev server with hot reloading <br/>
You may enable vscode to run ```yarn dev:chrome``` by copying .vscode/tasks.json.example to .vscode/tasks.json

# Release a new version

- Change `version` in `package.json`, eg. `"version": "1.0.0"`
- Push a new tag to GitHub, eg. `git tag 1.0.0 && git push --tags`
- The Workflow should be running [here](https://github.com/ansh/bionic-reading/actions)
- Check the release version [here](https://github.com/ansh/bionic-reading/releases) and edit release notes.
