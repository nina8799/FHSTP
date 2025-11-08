# Hearing Tracker (downloadCsv/hearing_tracker.html)

What this does
- Simple browser page to record hearing test appointments.
- Enter a date and values (dB) for the frequencies 125, 250, 500, 1000, 2000, 4000 and 8000 Hz.
- Saved appointments are stored in localStorage and displayed in a chart showing changes across dates.

How to use
1. Open `downloadCsv/hearing_tracker.html` in your browser (double-click or open via editor Live Server).
2. Pick a date and enter dB values in the table. Click "Add appointment".
3. Repeat for multiple dates. The chart will update to show a separate line for each frequency across appointments.
4. Use "Clear all" to remove saved data.

Notes
- Data is stored locally in your browser (localStorage). It does not leave your computer.
- Chart uses Chart.js via CDN; internet access is required to load the library.

Files
- `hearing_tracker.html` — UI and canvas
- `hearing_tracker.js` — logic and Chart.js data wiring
