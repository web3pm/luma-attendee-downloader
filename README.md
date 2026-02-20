# Luma Attendee Downloader

Chrome extension: download attendees from a Luma event page and download as CSV.

## Install (unpacked)

1. Build: `npm install && npm run build`
2. Chrome → **Extensions** → **Manage** → **Load unpacked**
3. Select this folder (`luma-ingestion-extension`)

## Use

1. Open a Luma event page that shows attendees (e.g. `https://lu.ma/your-event`).
2. Click the extension icon → **Start download**.
3. Wait for the count to finish, then **Download CSV**.

CSV columns: userId, profileUrl, name, displayNameRaw, bio, avatarUrl, x, instagram, linkedin, github, website, etc.
