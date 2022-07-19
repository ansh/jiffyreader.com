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
  - [Android (kiwi Browser)](#android-kiwi-browser)
  - [Bookmarklet](#bookmarklet)
  - [FAQ](#faq)
    - [How to access the extension settings/popup ui](#how-to-access-the-extension-settingspopup-ui)
      - [Desktop](#desktop)
    - [Android (kiwi browser)](#android-kiwi-browser-1)
    - [What are the functions of the buttons and sliders](#what-are-the-functions-of-the-buttons-and-sliders)
      - [Global preferences button](#global-preferences-button)
      - [Site preferences button](#site-preferences-button)
      - [Enable reading mode button](#enable-reading-mode-button)
      - [Saccades interval slider](#saccades-interval-slider)
      - [Fixation strength slider](#fixation-strength-slider)
      - [Fixation edge opacity](#fixation-edge-opacity)
      - [Saccades colors](#saccades-colors)
      - [Saccades styles](#saccades-styles)
      - [Line height buttons](#line-height-buttons)
      - [Always on/off button](#always-onoff-button)
      - [Reset Defaults](#reset-defaults)
    - [Google Play Books Native (Epub and PDF support)](#google-play-books-native-epub-and-pdf-support)
      - [Upload Books (Epubs & PDFs)](#upload-books-epubs--pdfs)
        - [PFD files not working](#pfd-files-not-working)
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

  1. Click [here](https://github.com/ansh/jiffyreader.com/releases/latest/download/jiffyReader-chrome.zip) to download the latest `jiffyReader-chrome.zip` release
  2. Extract the file
  3. Open Chrome
  4. Enter `chrome://extensions`  in the address bar 
  5. Enable `developer mode` with the toggle on the top right side of the page if it is not enabled already
  6. Click `load unpacked` on the left side of the page
  7. Find and select the extracted folder, this extension should now be installed
  8. To pin the extension, click the `puzzle icon` on the top right of Chrome, then `pin the extension`.
  9. The extensions default reading mode is set to off when installed
  10. See the [faq section](#FAQ) on how to use the extension, customize it (global and per site settings) and excluding sites from `always on`



## Firefox

> Download via the [Mozilla Firefox Plugin/Add-on Store](https://addons.mozilla.org/en-US/firefox/addon/jiffy-reader/) or follow the instructions below

  1. Download `jiffyReader-firefox.xpi` by right clicking [here](https://github.com/ansh/jiffyreader.com/releases/latest/download/jiffyReader-firefox.xpi) and choose `Save link as` to download the latest `jiffyReader-firefox.xpi `release
  2. Open Firefox
  3. Enter `about:debugging#/runtime/this-firefox`  in the address bar 
  4. Click `Load Temporary Add-on...` and navigate to the path of the downloaded `jiffyReader-firefox.xpi` and select it to install it
  5. The extensions default reading mode is set to off when installed
  6. See the [faq section](#FAQ) on how to use the extension, customize it (global and per site settings) and excluding sites from `always on`

<strong>Firefox will remove the extension when the browser is closed. This will be solved once we provide a means to download the extension from the firefox store</strong>



## Opera

  1. Download: Click [here](https://github.com/ansh/jiffyreader.com/releases/latest/download/jiffyReader-opera.crx) to download the latest `jiffyReader-opera.crx` release
  2. Extract the file
  3. Open Opera
  4. Enter `opera://extensions`  in the address bar 
  5. Enable `developer mode` with the toggle on the top right side of the page if it is not enabled already
  6. Click `load unpacked` on the left side of the page
  7. Find and select the extracted folder, this extension should now be installed and listed on the screen
  8. To pin the extension, click the `cube icon` on the top right of Chrome, then `pin the extension`.
  9. The extensions default reading mode is set to off when installed
  10. See the [faq section](#FAQ) on how to use the extension, customize it (global and per site settings) and excluding sites from `always on`

## Edge

  - Please follow the steps for [chrome](#chrome) above

## Android (kiwi Browser)
  1. Download the kiwi browser if you do not already have it installed
  2. Open kiwi browser
  3. Navigate to the extension listing on  [Chrome Store](https://chrome.google.com/webstore/detail/jiffy-reader/lljedihjnnjjefafchaljkhbpfhfkdic) and 
  4. Click the `Add to Chrome` button to install the extension
  5. The extensions default reading mode is set to off when installed
  6. See the [faq section](#FAQ) on how to use the extension, customize it (global and per site settings) and excluding sites from `always on`

## Bookmarklet

(Note: Bookmarklet is not in active support and may break when new updates are released)
1. To install the bookmarklet, head over to this [link](https://github.com/ansh/jiffyreader.com/releases/latest/download/jiffyReader-bookmarklet.html)



## FAQ

### How to access the extension settings/popup ui

#### Desktop
1. Click on the (on chrome: `puzzle icon` | on edge `puzzle icon` | on opera `cube icon` | on brave `puzzle icon`) 
   - Note: Firefox will auto pin the extension
2. Click on the pin icon next to jiffy reader to pin it next the address bar
3. Click on the pinned icon to access the settings/popup menu

### Android (kiwi browser)
1. Click on the `more (3 vertical dots)` button and scroll down
2. Click on `Jiffy Reader` to open the settings/popup ui

### What are the functions of the buttons and sliders

#### Global preferences button
- clicking this button enters global mode where your preferences are saved and applied to applied to all other sites when you open them afterwards

#### Site preferences button
- Clicking this buttons activates and saves preferences only for the site you are presently on. 
- Any changes you make with the other buttons and sliders persist for only this site.

#### Enable reading mode button
 - Click this button to turn on/off the emphasization(bionification) of the text on the page.
 - Press `ALT + A` to achieve the same effect as clicking this button on chrome. see the [shortcut-section](#shortcut) for more info.

#### Saccades interval slider
- Use this slider to set how many words are left untouched/unbolded or un-emphasized after the first emphasized word or the first word.
- 0 means there will not be a single or any untouched words, all words are emphasized.
- 1 means exactly 1 word is left untouched before the next successive emphasized word.
- 2 means 2 words are left untouched so does 3 and 4.

#### Fixation strength slider
- Use this to control how much or how little of each word is emphasized you your liking .

#### Fixation edge opacity
- Use this to control how faint(weakly visible) or strongly visible you want the edge(un-emphasized) part of words to appear.

#### Saccades colors
- Use this to select a means of emphasization using colors.

#### Saccades styles
- Use this to select a means of emphasization using bold variations or underline variations. 

#### Line height buttons
- Use these buttons to increase or decrease line height to strain and improve the confort of reading.

#### Always on/off button
- Use this button to controls the default behaviour which is if words on pages are or aren't emphasized when loaded by default.

#### Reset Defaults
- Resets preferences of the currently engaged preference mode.

### Google Play Books Native (Epub and PDF support)
- This extension works with [google play books](https://play.google.com/books)
1. Open or navigate to [google play books](https://play.google.com/books)
2. Click on any book in your library to read it and turn on the extension if not on already
3. You can search for new books (paid or free) and add to your library to start reading

#### Upload Books (Epubs & PDFs)
- Upload your ebooks to Google Play Books reads to be able to read it with JiffyReader.  
1. Open [google play books](https://play.google.com/books)
2. Click the upload button
3. Select your epub or pdf file to complete the upload 
4. Click on the uploaded file to open it in the Google Play Books web reader. Have fun.

##### PFD files not working
PDF files may still not work after uploading to Google Play Books
Use steps in [Google Play Books Native (Epub and PDF support)](#google-play-books-native-epub-and-pdf-support) to 
search for the book if you believe it is commercially/freely available in the [google play books](https://play.google.com/books) 

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

Read more about [Bionic Reading](https://jiffyreader.com.com/about/).



# Reporting Issues, bugs and feature request
  Visit the [issues page](https://github.com/ansh/jiffyreader.com/issues) to report, bugs or tell us about a feature you would like to see and hopefully we will get to you.
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
- The Workflow should be running [here](https://github.com/ansh/jiffyreader.com/actions)
- Check the release version [here](https://github.com/ansh/jiffyreader.com/releases) and edit release notes.
