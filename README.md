# Luma Attendee Downloader

Chrome extension: download attendees from a Luma event page and download as CSV.

## How it works & permissions

The extension is open source and does not send data to any external service. It only runs on Luma event pages (`lu.ma`, `luma.com`). It reads attendee cards already visible in the page DOM, builds a CSV in memory, and triggers a download to your machine. No telemetry, no analytics, no outbound calls to third parties.

**Permissions:**

- **activeTab / scripting** — Used to show the extension popup and run the scraper when you click "Start download."
- **Host access: `https://lu.ma/*`, `https://luma.com/*`** — The content script is limited to these origins; it cannot read or run on other sites.

Data never leaves the browser except as the CSV file you choose to download.

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
