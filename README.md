====================================================================================

**THIS PROJECT IS NO LONGER MAINTAINED. THIS REPOSITORY IS AN ARCHIVE FOR EDUCATIONAL PURPOSES ONLY.**

====================================================================================


# Jiffy Reader
A Browser Extension for [Faster Reading](#what-is-faster-reading) on ANY website!

<a href="https://www.producthunt.com/posts/jiffy-reader?utm_source=badge-top-post-badge&utm_medium=badge&utm_souce=badge-jiffy&#0045;reader" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/top-post-badge.svg?post_id=347823&theme=light&period=daily" alt="Jiffy&#0032;Reader - Read&#0032;anything&#0032;on&#0032;the&#0032;internet&#0032;faster&#0032;and&#0032;more&#0032;clearly | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

<a href="https://www.producthunt.com/posts/jiffy-reader?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-jiffy&#0045;reader" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=347823&theme=light" alt="Jiffy&#0032;Reader - Read&#0032;anything&#0032;on&#0032;the&#0032;internet&#0032;faster&#0032;and&#0032;more&#0032;clearly&#0033; | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

<a href="https://www.buymeacoffee.com/jiffyreader" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>



# How it works
Below is a screenshot demonstrating how the extension works by bolding out the initial parts of all text on any page when clicked. There are toggles and sliders to customize it to your preference so you can enjoy your time reading. You must agree this is awesome right?
![Screenshot from 2022-05-29 19-13-02](https://user-images.githubusercontent.com/20851930/170895288-992e802f-4f64-4134-97cc-5144685ecb9e.png)


The best way to install this extension is to follow the instructions below.



# Table of Contents
- [Jiffy Reader](#jiffy-reader)
- [How it works](#how-it-works)
- [Table of Contents](#table-of-contents)
- [Installation Instructions](#installation-instructions)
  - [Chrome](#chrome)
  - [Firefox](#firefox)
  - [Safari](#safari)
  - [Firefox Nightly / Fennec F-droid / Mull (Android)](#firefox-nightly--fennec-f-droid--mull-android)
  - [Opera](#opera)
  - [Edge](#edge)
  - [Android (kiwi Browser)](#android-kiwi-browser)
  - [Bookmarklet](#bookmarklet)
- [First Installation Welcome](#first-installation-welcome)
  - [Notes on the extension](#notes-on-the-extension)
  - [Notes on this page](#notes-on-this-page)
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
  - [PDF and Epub support](#pdf-and-epub-support)
    - [Google Play Books Native (Epub)](#google-play-books-native-epub)
      - [Upload Epubs to Google Play Books (Epubs)](#upload-epubs-to-google-play-books-epubs)
    - [PFD Support (convert pdf files to epub or html)](#pfd-support-convert-pdf-files-to-epub-or-html)
    - [Google Docs support (publish method)](#google-docs-support-publish-method)
    - [Google Docs support (html download method)](#google-docs-support-html-download-method)
    - [Enable file url permissions (Chrome)](#enable-file-url-permissions-chrome)
- [Customizations](#customizations)
  - [Shortcut](#shortcut)
- [What is Faster Reading?](#what-is-faster-reading)
- [Reporting Issues, bugs and feature request](#reporting-issues-bugs-and-feature-request)
- [How to Contribute](#how-to-contribute)
- [Help with Translations](#help-with-translations)
  - [Working with the translation files.](#working-with-the-translation-files)
  - [Submitting your translations](#submitting-your-translations)
- [Supported languages](#supported-languages)
  - [Development](#development)
  - [Configure vscode to run the project when it is opened](#configure-vscode-to-run-the-project-when-it-is-opened)
  - [Release a new version](#release-a-new-version)

# Installation Instructions


## Chrome

  > Download via [Chrome Store](https://chrome.google.com/webstore/detail/jiffy-reader/lljedihjnnjjefafchaljkhbpfhfkdic) or follow the instructions below

  1. Click [here](https://github.com/ansh/jiffyreader.com/releases/latest/download/jiffyReader-chrome-prod.zip) to download the latest `jiffyReader-chrome-prod.zip` release
  2. Extract the file
  3. Open Chrome
  4. Enter `chrome://extensions`  in the address bar 
  5. Enable `developer mode` with the toggle on the top right side of the page if it is not enabled already
  6. Click `load unpacked` on the left side of the page
  7. Find and select the extracted folder, this extension should now be installed
  8. To pin the extension, click the `puzzle icon` on the top right of Chrome, then `pin the extension`.
  9. The extensions default reading mode is set to off when installed
  10. See the [FAQ](#FAQ) section on how to use the extension, customize it (global and per site settings) and excluding sites from `always on`

The Chrome version includes support for [mellowtel.dev](https://mellowtel.dev/about-mellowtel), an open-source library to support the development of free browser extensions.

## Firefox

> Download via the [Mozilla Firefox Plugin/Add-on Store](https://addons.mozilla.org/en-US/firefox/addon/jiffy-reader/) or follow the instructions below

  1. Download `jiffyReader-firefox-prod.xpi` by right-clicking [here](https://github.com/ansh/jiffyreader.com/releases/latest/download/jiffyReader-firefox-prod.xpi) and choose `Save link as` to download the latest `jiffyReader-firefox-prod.xpi `release
  2. Open Firefox
  3. Enter `about:debugging#/runtime/this-firefox`  in the address bar 
  4. Click `Load Temporary Add-on...` and navigate to the path of the downloaded `jiffyReader-firefox-prod.xpi` and select it to install it
  5. The extensions default reading mode is set to off when installed
  6. See the [FAQ](#FAQ) section on how to use the extension, customize it (global and per site settings) and excluding sites from `always on`

<strong>Firefox will remove the extension when the browser is closed if the extension is not downloaded from the store.</strong>

## Safari

> Download via the [App Store here](https://apps.apple.com/in/app/jiffy-reader/id6444754311) or [TestFlight here](https://testflight.apple.com/join/eFFlcXzz). This works for both macOS and iOS. We are working on getting it approved to download directly via the App Store. If you want to build the app yourself, follow the instructions below

1. We will be [converting the web extension for Safari](https://developer.apple.com/documentation/safariservices/safari_web_extensions/converting_a_web_extension_for_safari) usage. This will require a macOS computer and the latest version of XCode installed.
2. Use `git clone` to clone the Jiffy Reader repo locally.
3. Run `pnpm build:xcode` or `pnpm build:xcode:all` to convert the extension.
4. Open the Safari app on your Mac and make sure to click `Develop` `->` `Allow Unsigned Extensions` in the top menu bar.
5. Open the project in XCode and click run!

## Firefox Nightly / Fennec F-droid / Mull (Android)

1. Go to settings
2. Scroll to the bottom and select `About {browser name}`
3. Tap the browser logo five times
4. Go back to settings and in the Advanced section, select `Custom Add-on collection`
5. Type `17432789` as the collection owner (user ID)
6. Type `jiffyreader` as the collection name. The browser will close to apply the settings.
7. Go to Add-ons/Add-ons manager to install the add-on. 

<strong>For convenience you may want to enable the extension by default by clicking on the `Turn On Always` button in the add-on's menu.</strong>

## Opera

  1. Download: Click [here](https://github.com/ansh/jiffyreader.com/releases/latest/download/jiffyReader-opera-prod.crx) to download the latest `jiffyReader-opera-prod.crx` release
  2. Extract the file
  3. Open Opera
  4. Enter `opera://extensions`  in the address bar 
  5. Enable `developer mode` with the toggle on the top right side of the page if it is not enabled already
  6. Click `load unpacked` on the left side of the page
  7. Find and select the extracted folder, this extension should now be installed and listed on the screen
  8. To pin the extension, click the `cube icon` on the top right of Chrome, then `pin the extension`.
  9. The extensions default reading mode is set to off when installed
  10. See the [FAQ](#FAQ) section on how to use the extension, customize it (global and per site settings) and excluding sites from `always on`

## Edge

  - Please follow the steps for [chrome](#chrome) above

## Android (kiwi Browser)
  1. Download the kiwi browser if you do not already have it installed
  2. Open kiwi browser
  3. Navigate to the extension listing on  [Chrome Store](https://chrome.google.com/webstore/detail/jiffy-reader/lljedihjnnjjefafchaljkhbpfhfkdic) and 
  4. Click the `Add to Chrome` button to install the extension
  5. The extensions default reading mode is set to off when installed
  6. See the [FAQ](#FAQ) section on how to use the extension, customize it (global and per site settings) and excluding sites from `always on`

## Bookmarklet

(Note: Bookmarklet is not in active support and may break when new updates are released)
1. To install the bookmarklet, head over to this [link](https://github.com/ansh/jiffyreader.com/releases/latest/download/jiffyReader-bookmarklet.html)


# First Installation Welcome
- Thank you for installing JiffyReader. 
- <strong>Read the 8 points below</strong> which will help you the most in getting you started with JiffyReader
## Notes on the extension
1. Why did the browser open this page? because this is the first time you installed JiffyReader.<br/>
2. The extension is on the default settings and optimal for most websites.
3. Changes to settings are saved instantly and can be restored to the default optimal settings by clicking the `Reset Settings` button at the bottom of the extension.
4. If confused on how to use the buttons and sliders check out the section on [what are the functions of the buttons and sliders](#what-are-the-functions-of-the-buttons-and-sliders).
## Notes on this page
5. You can find important resources such as the [FAQ section](#faq), [how to contribute](#how-to-contribute) and [how to report issues](#reporting-issues-bugs-and-feature-request) on this page.<br/>
6. You can always get to this page by clicking the FAQ link in the footer of the extension popup.
7. For further help, check the [table of contents](#table-of-contents) or open an issue ticket using the links at the very top of this page.
8. You can close this page and return at anytime to find more help or clarification.

# FAQ

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
- clicking this button enters global mode where your preferences are saved and applied to all other sites when you open them afterwards

#### Site preferences button
- Clicking this buttons activates and saves preferences only for the site you are presently on. 
- Any changes you make with the other buttons and sliders persist for only this site.

#### Enable reading mode button
 - Click this button to turn on/off the emphasis (bionification) of the text on the page.
 - Press `ALT + B` on chrome and `ALT + W` on firefox to achieve the same effect as clicking this button on chrome. see the [shortcut](#shortcut) section for more info.

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
- Use this to select a means of creating emphasis using colors.

#### Saccades styles
- Use this to select a means of creating emphasis using bold variations or underline variations. 

#### Line height buttons
- Use these buttons to increase or decrease line height to strain and improve the comfort of reading.

#### Always on/off button
- Use this button to controls the default behavior which is if words on pages are or aren't emphasized when loaded by default.

#### Reset Defaults
- Resets preferences of the currently engaged preference mode.

## PDF and Epub support

### Google Play Books Native (Epub)
- This extension works with [Google Play Books](https://play.google.com/books)
1. Open or navigate to [Google Play Books](https://play.google.com/books)
2. Click on any book in your library to read it and turn on the extension if not on already
3. You can search for new books (paid or free) and add to your library to start reading

#### Upload Epubs to Google Play Books (Epubs)
- Upload your Epub ebook(s) to Google Play Books, then you will be able to read it with JiffyReader.  
1. Open [Google Play Books](https://play.google.com/books)
2. Click the upload button
3. Select your epub file to complete the upload 
4. Click on the uploaded file to open it in the Google Play Books web reader. Have fun.

### PFD Support (convert pdf files to epub or html)
1. Open [cloud convert](https://cloudconvert.com) to 
2. Upload your pdf file
3. Select your output format (html or epub)
4. Click convert to start the process
5. Click download 
6. Open your downloaded html file in your browser and turn on JiffyReader


- For chrome permission issues, follow the steps in [Enable file url permissions (Chrome)](#enable-file-url-permissions-chrome)
- For epub files follow the steps in [Upload Epub to Google Play Books](#upload-epubs-to-google-play-books-epubs)
- JiffyReader does not collaborate with cloudconvert. Please consult their privacy policy for any privacy concerns.

### Google Docs support (publish method)
1. Open the Google Docs document in your browser
2. Click File > click share > click publish to web
3. Click publish and copy the published link. Alternatively you can replace `edit` in the address bar with `pub` to access the published document
4. Open the published link in a new tab and turn on JiffyReader

- Note: the document will be accessible to anyone on the internet as long as they have the correct link.
If you do not want to publish the document to the web then please follow the alternative steps in [Google Docs support (html download method)](#google-docs-support-html-download-method)

### Google Docs support (html download method)
1. Click on File > click download
2. Download the document as a html (preferred) or epub optional [Google Play Books Native (Epub)](#google-play-books-native-epub)
3. Open the downloaded html with your browser and turn on JiffyReader
- You may be required to enable permissions to access `file urls` for chrome. To do so follow [Enable file permissions](#enable-file-url-permissions-chrome)

### Enable file url permissions (Chrome)
1. Enable JiffyReader to work with tabs that have file urls by right-clicking on the JiffyReader icon
2. Click manage extension
3. Find `Allow access to file URLs` option and enable it


# Customizations

## Shortcut
- `Alt+B` (on Windows) or `option+B` (on Mac) is the default toggle shortcut to turn `on or off` the extension
- If preferred you may customize the extension shortcut with the help of the resources below
- [Chrome, Firefox and Edge](https://www.makeuseof.com/open-browser-extensions-keyboard-shortcut/)
- Opera: open the extension management tab and click the `Keyboard shortcuts` link to access the page for customizing opera shortcuts



# What is Faster Reading?
This extension provides faster reading through facilitating the reading process by bolding half the words.
As a result, the reader is only focusing on the bolded initial letters and lets the brain autocomplete the words. This allows you to read faster.


# Reporting Issues, bugs and feature request
  Visit the [issues page](https://github.com/ansh/jiffyreader.com/issues) to report, bugs or tell us about a feature you would like to see and hopefully we will get to you.
  Kindly allow for some time after submitting an issue for someone to get back to you.
  You can also see a list of open issues that you may contribute to by commenting to help out someone with a challenge or developing and opening a PR. See [How to Contribute](#how-to-contribute) section.



# How to Contribute
  Anyone is welcome to provide contributions to this project by submitting a PR (Pull Request) and it will be happily merged to provide features and fixes to the incredible people using the extension.

# Help with Translations
  JiffyReader is in need of translation help for what ever language you can.
  To help: 
  1. Please check that the language you would like to help with has not already been taken up by someone else by looking through both the open and closed tickets for translations.
  2. Open an issue ticket and add the `translation` label to it along with the name of the language you want to translate. Use this [shortcut link to open a new ticket](https://github.com/ansh/jiffyreader.com/issues/new?assignees=&labels=enhancement&template=feature_request.md&title=%5BFEATURE%5D+Give+a+suitable+title)
  3. Copy either the english locale json  [click here](https://github.com/ansh/jiffyreader.com/blob/master/assets/_locales/en/messages.json) or spanish local json [click here](https://github.com/ansh/jiffyreader.com/blob/master/assets/_locales/es/messages.json) translate into the language you can assist with using your preferred editor or even Microsoft Word. 
  4. Indicate the language you would like to help translate in the ticket title. This helps to eliminate duplicate work.

  - Attach any questions or updates to the ticket you are working on and someone will try and get to them within a day or two.
   
   ## Working with the translation files.
   The translation files are json formats. You only need to worry about translating the text associated with the message key.
   ```
    <!-- example -->
    "exampleText":{
      "message": "this is the text to translate",
      "description": "it is not required to translate this text"
    }
    ```

    - result after translation into spanish
    
    ```
    "exampleText":{
      "message": "esto es el texto a traducir",
      "description": "it is not required to translate this text"
    }

   ```

   ## Submitting your translations
   - You can email the translated file or paste the entire translation as a new comment in the ticket you opened and we will take it from there.
   - Don't forget to indicate your name for attribution.

  # Supported languages
  1. English: by JiffyReader maintainer
  2. Spanish: by JiffyReader maintainer
  3. Others coming soon: contributor name

  JiffyReader has been updated to support displaying information in multiple languages thanks to a strong interest and constant emails and enquiries about it.
  We have implemented the required mechanisms to support displaying the extension in the language of your choice. The challenge we have now is to get as many translations as possible.

## Development
   1. Clone the project
   2. Open in VS Code or your favorite editor
   3. Run `yarn` or `npm i` to install dependencies
   4. Install pnpm if you don't already have it, use `npm i -g pnpm`
   5. Run `pnpm dev:chrome` or `pnpm run dev:chrome` to build the development version. Substitute chrome for firefox if that is your preferred browser.
   6. Follow the installation version for your preferred browser but navigate to the `projectRootFolder/build/` and choose the folder that corresponds with your browser.



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
