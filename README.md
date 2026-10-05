# Futsal Event Tagger

A mobile-first web app for tagging futsal match events live: shots, passes, fouls, cards, power play and set pieces, per player.

## Features

- One card of event buttons per player (14-player squad + opponent): one tap logs the event and outcome
- Dashboard layout on tablet landscape / laptop (≥ 900px): every player card and the match log on one screen; scrolling list on phones
- Goals update the score automatically
- Power play and set-piece flags applied to the next tap
- Match log with undo, delete, and card / accumulated-foul controls on fouls
- CSV export (opens in Excel, Numbers, Google Sheets)
- CSV import: load an exported file to resume tagging a match where you stopped
- Portuguese / English interface

## Usage

No install or build step. Open `index.html` in a browser.

Squad size and player-name display are configured in `CONFIG` at the top of `app.js`.

> Tagged events are kept in memory only — export to CSV before closing or reloading the page, and use **Import CSV** to continue later.
