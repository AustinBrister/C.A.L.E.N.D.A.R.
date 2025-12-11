# C.A.L.E.N.D.A.R.

**Calendar Assistant for Legal Events, Notices, Deadlines, and Automated Reminders**

A browser-based tool designed for legal professionals to generate ICS calendar files with customizable reminders for deadlines, hearings, and other time-sensitive events.

## Features

- **ICS File Generation** - Creates RFC 5545 compliant calendar files compatible with Outlook, Google Calendar, Apple Calendar, and other calendar applications
- **Customizable Reminders** - Generate reminder events at 7AM day-of, 1 day, 2 days, 3 days, 1 week, 2 weeks, or 1 month before deadlines
- **Team Distribution** - Add team members as recipients and track who should receive each calendar invite
- **Priority Levels** - Mark events as Low, Medium, or High priority
- **Saved Data** - Stores case names, descriptions, locations, and team members in browser localStorage for quick reuse
- **Import/Export Settings** - Backup and restore all saved data via JSON export
- **Dark Mode** - Toggle between light and dark themes
- **Flexible Download Options** - Download all events in a single file or as separate ICS files

## Getting Started

### Option 1: Open Directly
Simply open `index.html` in any modern web browser.

### Option 2: Local Server
For development or if you encounter any CORS issues:

```bash
# Python 3
python -m http.server 8000

# Then open http://localhost:8000 in your browser
```

## Usage

1. **Configure Organizer** - Click "Organizer Settings" to set your name and email (used in calendar invites)
2. **Enter Event Details**:
   - Case name or matter number
   - Deadline description (e.g., "MSJ Filing Deadline", "Response Due")
   - Location (optional, for hearings/meetings)
   - Date and time
   - Priority level
   - Additional notes
3. **Select Recipients** - Choose which team members should receive the calendar invite
4. **Choose Reminders** - Select which reminder events to generate
5. **Generate & Download** - Click "Generate Calendar Files" and download the ICS file(s)
6. **Import to Calendar** - Double-click the downloaded .ics file to add events to your calendar

## Managing Data

### Team Members
Click "Manage Team Members" to add, edit, or remove people from your recipient list. Each team member needs a name and email address.

### Cases, Descriptions & Locations
Each field has a "Manage" button to maintain a database of frequently used values. Items are automatically saved when you use them.

### Backup & Restore
- **Export Settings** - Downloads all your saved data as a JSON file
- **Import Settings** - Restore data from a previously exported JSON file

## Project Structure

```
c.a.l.e.n.d.a.r./
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # Stylesheet with dark mode support
├── js/
│   └── app.js          # Application logic and ICS generation
├── assets/             # Images and other resources
└── README.md
```

## Technical Details

- **Pure JavaScript** - No frameworks or build tools required
- **LocalStorage Persistence** - All data stored locally in the browser
- **ICS Generation** - Generates compliant VCALENDAR/VEVENT data with proper timezone handling
- **Responsive Design** - Works on desktop and tablet devices

## Browser Support

Tested and working in:
- Chrome/Chromium
- Firefox
- Safari
- Edge

## License

MIT License - Feel free to use, modify, and distribute.

## Author

Built by [Austin Brister](https://github.com/AustinBrister)

---

*Part of a suite of legal-specific tools for improving law practice efficiency.*
