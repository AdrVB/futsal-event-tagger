# Futsal Event Tagger

A mobile-first web app for tagging futsal match events live: shots, passes, fouls, cards, power play and set pieces, per player.

## Features

- 14-player squad grid with editable player names
- Own team / opponent tagging with context-specific outcomes (shot, pass, foul + card)
- Power play and set-piece flags
- Match log with edit and delete
- CSV export (opens in Excel, Numbers, Google Sheets)
- Portuguese / English interface

## Usage

No install or build step. Open `index.html` in a browser.

Squad size and form-reset behaviour are configured in `CONFIG` at the top of `app.js`.

> Tagged events are kept in memory only — export to CSV before closing or reloading the page.
