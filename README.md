# Luma Attendee Downloader

Chrome extension: download attendees from a Luma event page and download as CSV.

## Install (unpacked)

**From a release (recommended)**

1. Go to [Releases](https://github.com/web3pm/luma-attendee-downloader/releases) and download the latest `luma-attendee-downloader-*.zip`.
2. Unzip the file.
3. Chrome → **Extensions** → **Manage** → **Load unpacked** → select the unzipped folder.

**From source**

1. Clone this repo, then: `npm install && npm run build`
2. Chrome → **Extensions** → **Manage** → **Load unpacked** → select the `dist` folder

## Use

1. Open a Luma event page that shows attendees (e.g. `https://lu.ma/your-event`).
2. Click the extension icon → **Start download**.
3. Wait for the count to finish, then **Download CSV**.

CSV columns: userId, profileUrl, name, displayNameRaw, bio, avatarUrl, x, instagram, linkedin, github, website, etc.
