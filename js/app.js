/**
 * C.A.L.E.N.D.A.R.
 * Calendar Assistant for Legal Events, Notices, Deadlines, and Automated Reminders
 *
 * Main Application JavaScript
 */

// ============================================
// Configuration
// ============================================
const APP_DATA_KEY = 'calendarAppData';

const DEFAULT_CONFIG = {
    timezone: 'America/Chicago',
    timezoneAbbr: { standard: 'CST', daylight: 'CDT' },
    defaultEventDuration: 60,
    productId: '-//C.A.L.E.N.D.A.R.//Legal Deadline Generator//EN'
};

const DEFAULT_PRESET_DESCRIPTIONS = {
    "Standard Filing Deadline": {
        reminders: ["7AM Day Of", "1 Day", "3 Days", "1 Week", "1 Month"],
        defaultText: "Filing Deadline",
        isPreset: true
    },
    "Standard Hearing Date": {
        reminders: ["7AM Day Of", "1 Day", "3 Days", "1 Week"],
        defaultText: "Hearing",
        isPreset: true
    },
    "Standard MSJ Hearing": {
        reminders: ["7AM Day Of", "1 Day", "3 Days", "1 Week", "2 Weeks", "1 Month"],
        defaultText: "MSJ Hearing",
        isPreset: true
    }
};

const DEFAULT_ATTORNEYS = [
    { name: "Daniel Atkinson", email: "datkinson@mcginnislaw.com" },
    { name: "Travis C. Barton", email: "tcbarton@mcginnislaw.com" },
    { name: "Jonathan Baughman", email: "jbaughman@mcginnislaw.com" },
    { name: "Kevin M. Beiter", email: "kbeiter@mcginnislaw.com" },
    { name: "McLean Bell", email: "mbell@mcginnislaw.com" },
    { name: "Bill Bingham", email: "bbingham@mcginnislaw.com" },
    { name: "Austin Brister", email: "abrister@mcginnislaw.com" },
    { name: "Marla D. Broaddus", email: "mbroaddus@mcginnislaw.com" },
    { name: "Justin M. Cawley", email: "jcawley@mcginnislaw.com" },
    { name: "Mitchell C. Chaney", email: "mchaney@mcginnislaw.com" },
    { name: "Ray Chester", email: "rchester@mcginnislaw.com" },
    { name: "Paul D. Clote", email: "pclote@mcginnislaw.com" },
    { name: "Courtney Conner", email: "cconner@mcginnislaw.com" },
    { name: "Melanie H. Cruthirds", email: "mcruthirds@mcginnislaw.com" },
    { name: "Ashton G. Cumberbatch, Jr.", email: "acumberbatch@mcginnislaw.com" },
    { name: "Catherine Curtis", email: "ccurtis@mcginnislaw.com" },
    { name: "William H. Daniel", email: "wdaniel@mcginnislaw.com" },
    { name: "Ian Davis", email: "idavis@mcginnislaw.com" },
    { name: "Doug Dodds", email: "ddodds@mcginnislaw.com" },
    { name: "Marcus V. Eason", email: "meason@mcginnislaw.com" },
    { name: "Andrew Edge", email: "aedge@mcginnislaw.com" },
    { name: "Cliff Ernst", email: "cernst@mcginnislaw.com" },
    { name: "Manuel Escobar", email: "mescobar@mcginnislaw.com" },
    { name: "Felicity A. Fowler", email: "ffowler@mcginnislaw.com" },
    { name: "Emily Franco", email: "efranco@mcginnislaw.com" },
    { name: "Carl Galant", email: "cgalant@mcginnislaw.com" },
    { name: "Caleb Garcia", email: "cgarcia@mcginnislaw.com" },
    { name: "Tim George", email: "tgeorge@mcginnislaw.com" },
    { name: "William K. Grubb", email: "wgrubb@mcginnislaw.com" },
    { name: "Chris Halgren", email: "chalgren@mcginnislaw.com" },
    { name: "Kevin W. Haney", email: "khaney@mcginnislaw.com" },
    { name: "Clarke Heidrick", email: "cheidrick@mcginnislaw.com" },
    { name: "Seth Isgur", email: "sisgur@mcginnislaw.com" },
    { name: "Russell Johnson", email: "rjohnson@mcginnislaw.com" },
    { name: "Jamie Joiner", email: "jjoiner@mcginnislaw.com" },
    { name: "Austin Jones", email: "ajones@mcginnislaw.com" },
    { name: "Logan Jones", email: "ljones@mcginnislaw.com" },
    { name: "Michael Kabat", email: "mkabat@mcginnislaw.com" },
    { name: "Bruce Kramer", email: "bkramer@mcginnislaw.com" },
    { name: "Tim LaFrey", email: "tlafrey@mcginnislaw.com" },
    { name: "Alison Lenner", email: "alenner@mcginnislaw.com" },
    { name: "April Lucas", email: "alucas@mcginnislaw.com" },
    { name: "Martin Lutz", email: "mlutz@mcginnislaw.com" },
    { name: "Don Magee", email: "dmagee@mcginnislaw.com" },
    { name: "Sophia Makris", email: "smakris@mcginnislaw.com" },
    { name: "Edward McHorse", email: "emchorse@mcginnislaw.com" },
    { name: "Rick Milvenan", email: "rmilvenan@mcginnislaw.com" },
    { name: "Jordan Mullins", email: "jmullins@mcginnislaw.com" },
    { name: "Matthew K. Ormiston", email: "mormiston@mcginnislaw.com" },
    { name: "Ashley Parrish", email: "aparrish@mcginnislaw.com" },
    { name: "Douglas J. Paul", email: "dpaul@mcginnislaw.com" },
    { name: "James Phillips", email: "jphillips@mcginnislaw.com" },
    { name: "Jenna Pickering", email: "jpickering@mcginnislaw.com" },
    { name: "Jeena M. Piriano", email: "jpiriano@mcginnislaw.com" },
    { name: "Derrick Price", email: "dprice@mcginnislaw.com" },
    { name: "Robert E. Reetz, Jr.", email: "rreetz@mcginnislaw.com" },
    { name: "Nelia Robbi", email: "nrobbi@mcginnislaw.com" },
    { name: "Alejandra Salas", email: "asalas@mcginnislaw.com" },
    { name: "Victor Santana", email: "vsantana@mcginnislaw.com" },
    { name: "Sky Andrew Scherer", email: "sscherer@mcginnislaw.com" },
    { name: "Phillip Schmandt", email: "pschmandt@mcginnislaw.com" },
    { name: "Curt H. Schwake", email: "cschwake@mcginnislaw.com" },
    { name: "Derek Seal", email: "dseal@mcginnislaw.com" },
    { name: "Michael A. Shaunessy", email: "mshaunessy@mcginnislaw.com" },
    { name: "Paul Simpson", email: "psimpson@mcginnislaw.com" },
    { name: "Melissa Salhab Sykes", email: "msykes@mcginnislaw.com" },
    { name: "Ashley N. Vega", email: "avega@mcginnislaw.com" },
    { name: "Travis Vickery", email: "tvickery@mcginnislaw.com" },
    { name: "Jessica E. Visser", email: "jvisser@mcginnislaw.com" },
    { name: "Cade White", email: "cwhite@mcginnislaw.com" }
];

// List of default preset texts that trigger the hint
const PRESET_DEFAULT_TEXTS = ["Filing Deadline", "Hearing", "MSJ Hearing"];

// ============================================
// Data Management
// ============================================
function initializeAppData() {
    let appData;
    try {
        const storedData = localStorage.getItem(APP_DATA_KEY);
        if (storedData) {
            appData = JSON.parse(storedData);
            if (!appData.matters || !appData.descriptions || !appData.attorneys ||
                !appData.presetDescriptions || !appData.locations) {
                throw new Error("Invalid data structure");
            }
        } else {
            appData = null;
        }
    } catch (error) {
        console.error('Error loading app data:', error);
        appData = null;
    }

    if (!appData) {
        const initialData = {
            matters: {},
            descriptions: {},
            attorneys: DEFAULT_ATTORNEYS,
            presetDescriptions: DEFAULT_PRESET_DESCRIPTIONS,
            locations: [],
            organizer: { name: "", email: "" }
        };
        localStorage.setItem(APP_DATA_KEY, JSON.stringify(initialData));
        appData = initialData;
    }
    return appData;
}

function saveAppData(data) {
    localStorage.setItem(APP_DATA_KEY, JSON.stringify(data));
}

// ============================================
// UI Utilities
// ============================================
function showError(message) {
    const statusMessage = document.getElementById('status-message');
    statusMessage.textContent = message;
    statusMessage.className = 'status-message error';
    document.getElementById('download-container').style.display = 'none';
}

function showSuccess(message) {
    const statusMessage = document.getElementById('status-message');
    statusMessage.textContent = message;
    statusMessage.className = 'status-message success';
}

function updateRecipientsSummary() {
    const checked = document.querySelectorAll('.recipient-option:checked').length;
    document.getElementById('recipients-summary').textContent = `${checked} selected`;
}

function updateRemindersSummary() {
    const checked = document.querySelectorAll('.reminder-option:checked').length;
    document.getElementById('reminders-summary').textContent = `${checked} selected`;
}

function updateDescriptionHint() {
    const descValue = document.getElementById('deadline-description').value.trim();
    const hint = document.getElementById('description-hint');
    // Show hint if the value exactly matches a preset default text
    if (PRESET_DEFAULT_TEXTS.includes(descValue)) {
        hint.classList.add('show');
    } else {
        hint.classList.remove('show');
    }
}

// ============================================
// Modal Management
// ============================================
function openModal() {
    document.getElementById('settings-modal').classList.add('show');
    document.body.style.overflow = 'hidden';
    loadOrganizerInfo();
    setupAttorneysManagement();
    setupCasesManagement();
    setupDescriptionsManagement();
    setupLocationsManagement();
}

function closeModal() {
    document.getElementById('settings-modal').classList.remove('show');
    document.body.style.overflow = '';
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `tab-${tabName}`);
    });
}

// ============================================
// Collapsible Cards
// ============================================
function toggleCard(panelId) {
    const card = document.querySelector(`[data-toggle="${panelId}"]`).closest('.form-card');
    card.classList.toggle('collapsed');
}

// ============================================
// Organizer Management
// ============================================
function saveOrganizerInfo() {
    const organizerName = document.getElementById('organizer-name').value.trim();
    const organizerEmail = document.getElementById('organizer-email').value.trim();
    if (organizerName && organizerEmail) {
        const appData = initializeAppData();
        appData.organizer = { name: organizerName, email: organizerEmail };
        saveAppData(appData);
        return true;
    }
    return false;
}

function loadOrganizerInfo() {
    const appData = initializeAppData();
    if (appData.organizer) {
        document.getElementById('organizer-name').value = appData.organizer.name || "";
        document.getElementById('organizer-email').value = appData.organizer.email || "";
    }
}

// ============================================
// Date/Time Utilities
// ============================================
function setDefaultDateTime() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(17, 0, 0, 0);

    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    const hours = String(tomorrow.getHours()).padStart(2, '0');
    const minutes = String(tomorrow.getMinutes()).padStart(2, '0');

    document.getElementById('deadline-date').value = `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatDate(date) {
    const options = {
        weekday: 'long', year: 'numeric', month: 'long',
        day: 'numeric', hour: '2-digit', minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

function formatLocalDateForICS(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

function formatUTCDateForICS(date) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

// ============================================
// Recipients Management
// ============================================
function toggleAllRecipients() {
    const isChecked = document.getElementById('select-all-recipients').checked;
    document.querySelectorAll('.recipient-option').forEach(cb => cb.checked = isChecked);
    updateRecipientsSummary();
}

function populateRecipientsList() {
    const appData = initializeAppData();
    const attorneys = appData.attorneys;
    const recipientsGroup = document.getElementById('recipients-group');
    const noRecipientsMsg = document.getElementById('no-recipients-message');

    recipientsGroup.innerHTML = '';

    if (attorneys.length === 0) {
        noRecipientsMsg.style.display = 'block';
        recipientsGroup.style.display = 'none';
        return;
    }

    noRecipientsMsg.style.display = 'none';
    recipientsGroup.style.display = 'grid';

    attorneys.forEach((attorney, index) => {
        const label = document.createElement('label');
        label.className = 'checkbox-label';
        label.innerHTML = `
            <input type="checkbox" id="recipient-${index + 1}" name="recipients"
                   class="recipient-option" value="${attorney.name}" data-email="${attorney.email}">
            <span>${attorney.name}</span>
        `;
        recipientsGroup.appendChild(label);
    });

    // Add change listeners
    document.querySelectorAll('.recipient-option').forEach(cb => {
        cb.addEventListener('change', updateRecipientsSummary);
    });

    updateRecipientsSummary();
}

function toggleAllReminders() {
    const isChecked = document.getElementById('select-all-reminders').checked;
    document.querySelectorAll('.reminder-option').forEach(cb => cb.checked = isChecked);
    updateRemindersSummary();
}

// ============================================
// Attorneys Management (Settings Modal)
// ============================================
function setupAttorneysManagement() {
    const appData = initializeAppData();
    const attorneys = appData.attorneys;
    const container = document.getElementById('attorney-inputs-container');

    container.innerHTML = '';

    attorneys.forEach((attorney, index) => {
        addAttorneyRow(attorney.name, attorney.email);
    });
}

function addAttorneyRow(name = '', email = '') {
    const container = document.getElementById('attorney-inputs-container');
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
        <input type="text" class="attorney-name" placeholder="Name" value="${name}">
        <input type="email" class="attorney-email" placeholder="Email" value="${email}">
        <button type="button" class="remove-btn">Remove</button>
    `;
    row.querySelector('.remove-btn').onclick = () => row.remove();
    container.appendChild(row);
}

function saveAttorneysChanges() {
    const rows = document.querySelectorAll('#attorney-inputs-container .item-row');
    const appData = initializeAppData();
    const attorneys = [];

    rows.forEach(row => {
        const name = row.querySelector('.attorney-name').value.trim();
        const email = row.querySelector('.attorney-email').value.trim();
        if (name && email) {
            attorneys.push({ name, email });
        }
    });

    appData.attorneys = attorneys;
    saveAppData(appData);
    populateRecipientsList();
    showSuccess('Team members saved successfully.');
    setTimeout(() => document.getElementById('status-message').className = 'status-message', 3000);
}

// ============================================
// Cases Management (Settings Modal)
// ============================================
function setupCasesManagement() {
    const appData = initializeAppData();
    const matters = appData.matters;
    const container = document.getElementById('case-items-container');

    container.innerHTML = '';

    Object.keys(matters).forEach(caseName => {
        addCaseRow(caseName);
    });
}

function addCaseRow(name = '') {
    const container = document.getElementById('case-items-container');
    const row = document.createElement('div');
    row.className = 'item-row';
    row.dataset.original = name;
    row.innerHTML = `
        <input type="text" class="case-name-input" placeholder="Case Name" value="${name}">
        <button type="button" class="remove-btn">Remove</button>
    `;
    row.querySelector('.remove-btn').onclick = () => row.remove();
    container.appendChild(row);
}

function saveCasesChanges() {
    const rows = document.querySelectorAll('#case-items-container .item-row');
    const appData = initializeAppData();
    const updatedMatters = {};

    rows.forEach(row => {
        const input = row.querySelector('.case-name-input');
        const newName = input.value.trim();
        const originalName = row.dataset.original;

        if (newName) {
            if (originalName && appData.matters[originalName]) {
                updatedMatters[newName] = appData.matters[originalName];
            } else {
                updatedMatters[newName] = { attorneys: [] };
            }
        }
    });

    appData.matters = updatedMatters;
    saveAppData(appData);
    populateCaseNameDropdown();
    showSuccess('Cases saved successfully.');
    setTimeout(() => document.getElementById('status-message').className = 'status-message', 3000);
}

// ============================================
// Descriptions Management (Settings Modal)
// ============================================
function setupDescriptionsManagement() {
    const appData = initializeAppData();
    const descriptions = appData.descriptions;
    const presetDescriptions = appData.presetDescriptions || {};
    const container = document.getElementById('description-items-container');

    container.innerHTML = '';

    // Presets (read-only)
    Object.keys(presetDescriptions).forEach(descName => {
        const row = document.createElement('div');
        row.className = 'item-row preset';
        row.innerHTML = `
            <input type="text" value="${descName}" readonly disabled>
            <span class="preset-badge" style="padding: 8px 12px;">Preset</span>
        `;
        container.appendChild(row);
    });

    // User descriptions
    Object.keys(descriptions).forEach(descName => {
        addDescriptionRow(descName);
    });
}

function addDescriptionRow(name = '') {
    const container = document.getElementById('description-items-container');
    const row = document.createElement('div');
    row.className = 'item-row';
    row.dataset.original = name;
    row.innerHTML = `
        <input type="text" class="description-input" placeholder="Description" value="${name}">
        <button type="button" class="remove-btn">Remove</button>
    `;
    row.querySelector('.remove-btn').onclick = () => row.remove();
    container.appendChild(row);
}

function saveDescriptionsChanges() {
    const rows = document.querySelectorAll('#description-items-container .item-row:not(.preset)');
    const appData = initializeAppData();
    const updatedDescriptions = {};

    rows.forEach(row => {
        const input = row.querySelector('.description-input');
        const newName = input.value.trim();
        const originalName = row.dataset.original;

        if (newName && !appData.presetDescriptions[newName]) {
            if (originalName && appData.descriptions[originalName]) {
                updatedDescriptions[newName] = appData.descriptions[originalName];
            } else {
                updatedDescriptions[newName] = { reminders: [] };
            }
        }
    });

    appData.descriptions = updatedDescriptions;
    saveAppData(appData);
    populateDescriptionDropdown();
    showSuccess('Descriptions saved successfully.');
    setTimeout(() => document.getElementById('status-message').className = 'status-message', 3000);
}

// ============================================
// Locations Management (Settings Modal)
// ============================================
function setupLocationsManagement() {
    const appData = initializeAppData();
    const locations = appData.locations || [];
    const container = document.getElementById('location-items-container');

    container.innerHTML = '';

    locations.forEach(location => {
        addLocationRow(location.nickname, location.address);
    });
}

function addLocationRow(nickname = '', address = '') {
    const container = document.getElementById('location-items-container');
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
        <input type="text" class="location-nickname" placeholder="Nickname" value="${nickname}">
        <input type="text" class="location-address" placeholder="Full Address" value="${address}">
        <button type="button" class="remove-btn">Remove</button>
    `;
    row.querySelector('.remove-btn').onclick = () => row.remove();
    container.appendChild(row);
}

function saveLocationsChanges() {
    const rows = document.querySelectorAll('#location-items-container .item-row');
    const appData = initializeAppData();
    const updatedLocations = [];

    rows.forEach(row => {
        const nickname = row.querySelector('.location-nickname').value.trim();
        const address = row.querySelector('.location-address').value.trim();
        if (nickname && address) {
            updatedLocations.push({ nickname, address });
        }
    });

    appData.locations = updatedLocations;
    saveAppData(appData);
    populateLocationDropdown();
    showSuccess('Locations saved successfully.');
    setTimeout(() => document.getElementById('status-message').className = 'status-message', 3000);
}

// ============================================
// Dropdown Management
// ============================================
function populateCaseNameDropdown() {
    const appData = initializeAppData();
    const matters = Object.keys(appData.matters);
    const dropdown = document.getElementById('case-name-dropdown');

    dropdown.innerHTML = '';

    if (matters.length === 0) {
        dropdown.innerHTML = '<div class="dropdown-empty">No saved cases</div>';
    } else {
        matters.forEach(matter => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.textContent = matter;
            item.addEventListener('click', () => {
                document.getElementById('case-name').value = matter;
                loadMatterData(matter);
                dropdown.classList.remove('show');
            });
            dropdown.appendChild(item);
        });
    }
}

function populateDescriptionDropdown() {
    const appData = initializeAppData();
    const presetDescriptions = appData.presetDescriptions ? Object.keys(appData.presetDescriptions) : [];
    const userDescriptions = Object.keys(appData.descriptions);
    const dropdown = document.getElementById('description-dropdown');

    dropdown.innerHTML = '';

    if (presetDescriptions.length === 0 && userDescriptions.length === 0) {
        dropdown.innerHTML = '<div class="dropdown-empty">No saved descriptions</div>';
    } else {
        if (presetDescriptions.length > 0) {
            dropdown.innerHTML += '<div class="dropdown-item-header">Standard Presets</div>';
            presetDescriptions.forEach(desc => {
                const item = document.createElement('div');
                item.className = 'dropdown-item';
                item.innerHTML = `${desc} <span class="preset-badge">Preset</span>`;
                item.addEventListener('click', () => {
                    // Use cleaner default text from the constant (not localStorage)
                    const preset = DEFAULT_PRESET_DESCRIPTIONS[desc];
                    const defaultText = preset && preset.defaultText ? preset.defaultText : desc;
                    document.getElementById('deadline-description').value = defaultText;
                    loadDescriptionData(desc);
                    dropdown.classList.remove('show');
                    updateDescriptionHint();
                });
                dropdown.appendChild(item);
            });
        }

        if (userDescriptions.length > 0) {
            if (presetDescriptions.length > 0) {
                dropdown.innerHTML += '<div class="dropdown-item-header">Custom</div>';
            }
            userDescriptions.forEach(desc => {
                const item = document.createElement('div');
                item.className = 'dropdown-item';
                item.textContent = desc;
                item.addEventListener('click', () => {
                    document.getElementById('deadline-description').value = desc;
                    loadDescriptionData(desc);
                    dropdown.classList.remove('show');
                });
                dropdown.appendChild(item);
            });
        }
    }
}

function populateLocationDropdown() {
    const appData = initializeAppData();
    const locations = appData.locations || [];
    const dropdown = document.getElementById('location-dropdown');

    dropdown.innerHTML = '';

    if (locations.length === 0) {
        dropdown.innerHTML = '<div class="dropdown-empty">No saved locations</div>';
    } else {
        locations.forEach(location => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.textContent = location.nickname;
            item.addEventListener('click', () => {
                document.getElementById('event-location').value = location.nickname;
                dropdown.classList.remove('show');
            });
            dropdown.appendChild(item);
        });
    }
}

function loadMatterData(matterName) {
    const appData = initializeAppData();
    if (appData.matters[matterName]) {
        const selectedAttorneys = appData.matters[matterName].attorneys;
        document.querySelectorAll('.recipient-option').forEach(cb => {
            cb.checked = selectedAttorneys.includes(cb.value);
        });
        updateRecipientsSummary();
    }
}

function loadDescriptionData(description) {
    const appData = initializeAppData();
    let selectedReminders = [];

    if (appData.presetDescriptions && appData.presetDescriptions[description]) {
        selectedReminders = appData.presetDescriptions[description].reminders;
    } else if (appData.descriptions[description]) {
        selectedReminders = appData.descriptions[description].reminders;
    } else {
        return;
    }

    document.querySelectorAll('.reminder-option').forEach(cb => {
        cb.checked = selectedReminders.includes(cb.value);
    });
    updateRemindersSummary();
}

function saveMatterData(matterName, selectedAttorneys) {
    const appData = initializeAppData();
    if (!appData.matters[matterName]) {
        appData.matters[matterName] = { attorneys: [] };
    }
    appData.matters[matterName].attorneys = selectedAttorneys;
    saveAppData(appData);
}

function saveDescriptionData(description, selectedReminders) {
    const appData = initializeAppData();
    if (appData.presetDescriptions && appData.presetDescriptions[description]) {
        return;
    }
    if (!appData.descriptions[description]) {
        appData.descriptions[description] = { reminders: [] };
    }
    appData.descriptions[description].reminders = selectedReminders;
    saveAppData(appData);
}

// ============================================
// ICS Calendar Generation
// ============================================
function foldLine(line) {
    const MAX_LINE_LENGTH = 75;
    const foldedLines = [];
    while (line.length > MAX_LINE_LENGTH) {
        foldedLines.push(line.substring(0, MAX_LINE_LENGTH));
        line = ' ' + line.substring(MAX_LINE_LENGTH);
    }
    foldedLines.push(line);
    return foldedLines;
}

function generateICSEvent(eventDate, summary, description, priority, isMainEvent, location) {
    const organizerName = document.getElementById('organizer-name').value.trim();
    const organizerEmail = document.getElementById('organizer-email').value.trim();

    const eventDuration = isMainEvent ? parseInt(document.getElementById('event-duration').value) : 1;
    const markAsBusy = isMainEvent ? document.getElementById('mark-as-busy').checked : false;

    const endDate = new Date(eventDate);
    endDate.setMinutes(endDate.getMinutes() + eventDuration);

    const startDateFormatted = formatLocalDateForICS(eventDate);
    const endDateFormatted = formatLocalDateForICS(endDate);
    const dtstampFormatted = formatUTCDateForICS(new Date());

    const timestamp = new Date().getTime();
    const randomPart1 = Math.random().toString(16).substr(2, 24).toUpperCase();
    const randomPart2 = Math.random().toString(16).substr(2, 24).toUpperCase();
    const uid = `${randomPart1}${timestamp}${randomPart2}`;

    let icsPriority = "5";
    if (priority === "high") icsPriority = "1";
    if (priority === "low") icsPriority = "9";

    const busyStatus = markAsBusy ? 'BUSY' : 'FREE';

    const eventLines = [
        'BEGIN:VEVENT',
        ...foldLine(`UID:${uid}`),
        ...foldLine(`DTSTAMP:${dtstampFormatted}`),
        ...foldLine(`DTSTART;TZID=${DEFAULT_CONFIG.timezone}:${startDateFormatted}`),
        ...foldLine(`DTEND;TZID=${DEFAULT_CONFIG.timezone}:${endDateFormatted}`),
        ...foldLine(`SUMMARY:${summary}`),
        ...foldLine(`DESCRIPTION:${description.replace(/\n/g, '\\n')}`),
        ...foldLine(`PRIORITY:${icsPriority}`),
        'CLASS:PUBLIC',
        'STATUS:CONFIRMED',
        'SEQUENCE:0',
        ...foldLine(`TRANSP:${markAsBusy ? 'OPAQUE' : 'TRANSPARENT'}`),
        ...foldLine(`X-MICROSOFT-CDO-BUSYSTATUS:${busyStatus}`),
        ...foldLine(`X-MICROSOFT-CDO-INTENDEDSTATUS:${busyStatus}`),
        'X-MICROSOFT-DISALLOW-COUNTER:FALSE',
        ...foldLine(`ORGANIZER;CN="${organizerName}":mailto:${organizerEmail}`)
    ];

    if (isMainEvent && location) {
        eventLines.push(...foldLine(`LOCATION:${location}`));
    }

    eventLines.push(
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        'DESCRIPTION:Reminder',
        'TRIGGER;RELATED=START:-PT15M',
        'END:VALARM',
        'END:VEVENT'
    );

    return eventLines;
}

function generateTimezoneDefinition() {
    return [
        'BEGIN:VTIMEZONE',
        `TZID:${DEFAULT_CONFIG.timezone}`,
        `TZURL:http://tzurl.org/zoneinfo/${DEFAULT_CONFIG.timezone}`,
        `X-LIC-LOCATION:${DEFAULT_CONFIG.timezone}`,
        'BEGIN:DAYLIGHT',
        'TZOFFSETFROM:-0600',
        'TZOFFSETTO:-0500',
        `TZNAME:${DEFAULT_CONFIG.timezoneAbbr.daylight}`,
        'DTSTART:19700308T020000',
        'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU',
        'END:DAYLIGHT',
        'BEGIN:STANDARD',
        'TZOFFSETFROM:-0500',
        'TZOFFSETTO:-0600',
        `TZNAME:${DEFAULT_CONFIG.timezoneAbbr.standard}`,
        'DTSTART:19701101T020000',
        'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU',
        'END:STANDARD',
        'END:VTIMEZONE'
    ];
}

function generateCombinedICSContent(events, priority) {
    const icsLines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        `PRODID:${DEFAULT_CONFIG.productId}`,
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH'
    ];

    icsLines.push(...generateTimezoneDefinition());

    events.forEach(event => {
        const isMainEvent = event.filenameSuffix === 'Deadline';
        const eventLines = generateICSEvent(
            event.date, event.summary, event.description,
            priority, isMainEvent, event.location
        );
        icsLines.push(...eventLines);
    });

    icsLines.push('END:VCALENDAR');
    return icsLines.join('\r\n');
}

function generateICSContent(eventDate, summary, description, priority, isMainEvent, location) {
    const icsLines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        `PRODID:${DEFAULT_CONFIG.productId}`,
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH'
    ];

    icsLines.push(...generateTimezoneDefinition());
    const eventLines = generateICSEvent(eventDate, summary, description, priority, isMainEvent, location);
    icsLines.push(...eventLines);
    icsLines.push('END:VCALENDAR');

    return icsLines.join('\r\n');
}

// ============================================
// Download Management
// ============================================
function downloadAllFiles() {
    const links = document.querySelectorAll('.download-link');
    if (links.length === 0) return;

    let index = 0;
    function triggerNextDownload() {
        if (index >= links.length) return;
        links[index].click();
        index++;
        setTimeout(triggerNextDownload, 500);
    }
    triggerNextDownload();
}

// ============================================
// Import/Export Settings
// ============================================
function exportSettings() {
    try {
        const appData = initializeAppData();
        const blob = new Blob([JSON.stringify(appData, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'calendar-settings.json';
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);

        showSuccess('Settings exported successfully.');
        setTimeout(() => document.getElementById('status-message').className = 'status-message', 3000);
    } catch (error) {
        console.error('Error exporting settings:', error);
        showError('Failed to export settings.');
    }
}

function importSettings(file) {
    if (!file) {
        showError('No file selected.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);

            if (!importedData.matters || !importedData.descriptions ||
                !importedData.attorneys || !importedData.locations) {
                throw new Error('Invalid settings file format');
            }

            const currentData = initializeAppData();
            importedData.presetDescriptions = currentData.presetDescriptions;

            saveAppData(importedData);
            populateRecipientsList();
            populateCaseNameDropdown();
            populateDescriptionDropdown();
            populateLocationDropdown();
            loadOrganizerInfo();

            showSuccess('Settings imported successfully.');
            setTimeout(() => document.getElementById('status-message').className = 'status-message', 3000);
        } catch (error) {
            console.error('Error importing settings:', error);
            showError('Failed to import settings. Invalid file format.');
        }
    };
    reader.onerror = () => showError('Failed to read the file.');
    reader.readAsText(file);
}

// ============================================
// Priority Selection
// ============================================
function setPriority(value) {
    document.getElementById('priority-value').value = value;
    document.querySelectorAll('.priority-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.priority === value);
    });
}

// ============================================
// Dark Mode
// ============================================
function updateDarkModeIcon() {
    const icon = document.getElementById('dark-mode-icon');
    icon.textContent = document.body.classList.contains('dark-mode') ? '🌜' : '🌞';
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    updateDarkModeIcon();
}

function loadDarkModePreference() {
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
    updateDarkModeIcon();
}

// ============================================
// Form Processing
// ============================================
function processForm() {
    try {
        const organizerName = document.getElementById('organizer-name').value.trim();
        const organizerEmail = document.getElementById('organizer-email').value.trim();
        const caseName = document.getElementById('case-name').value.trim();
        const deadlineDescription = document.getElementById('deadline-description').value.trim();
        const locationInput = document.getElementById('event-location').value.trim();
        const deadlineDateInput = document.getElementById('deadline-date').value;
        const deadlineDate = new Date(deadlineDateInput);
        const additionalNotes = document.getElementById('additional-notes').value.trim();
        const priority = document.getElementById('priority-value').value;
        const downloadType = document.getElementById('download-type').value;

        // Validation
        if (!organizerName || !organizerEmail) {
            showError('Please configure your organizer info in Settings.');
            openModal();
            switchTab('organizer');
            return;
        }

        if (!caseName) {
            showError('Please enter a case name.');
            return;
        }

        if (!deadlineDescription) {
            showError('Please enter a description for the event.');
            return;
        }

        if (!deadlineDateInput || isNaN(deadlineDate.getTime())) {
            showError('Please select a valid date and time.');
            return;
        }

        const selectedRecipients = Array.from(document.querySelectorAll('.recipient-option:checked'));
        if (selectedRecipients.length === 0) {
            showError('Please select at least one recipient.');
            return;
        }

        const selectedReminders = Array.from(document.querySelectorAll('.reminder-option:checked'));
        if (selectedReminders.length === 0) {
            showError('Please select at least one reminder.');
            return;
        }

        // Save data
        saveMatterData(caseName, selectedRecipients.map(r => r.value));
        saveDescriptionData(deadlineDescription, selectedReminders.map(r => r.value));

        // Get location
        const appData = initializeAppData();
        let location = '';
        if (locationInput) {
            const savedLocation = appData.locations.find(loc => loc.nickname === locationInput);
            location = savedLocation ? savedLocation.address : locationInput;
        }

        // Build events
        const eventsToGenerate = [];

        // Handle prefix
        const prefixOption = document.getElementById('main-event-prefix').value;
        let prefix = '';
        if (prefixOption !== 'none') {
            if (prefixOption === 'custom') {
                prefix = document.getElementById('custom-prefix').value.trim();
            } else if (prefixOption === 'ALERT') {
                prefix = '🚨';
            } else {
                prefix = prefixOption;
            }
            if (prefix) prefix = `[${prefix}] `;
        }

        const summary = prefix + `${caseName} - ${deadlineDescription}`;
        const baseDescription = additionalNotes ? `Case: ${caseName}\n${additionalNotes}` : `Case: ${caseName}`;
        const intendedRecipients = selectedRecipients.map(r => r.dataset.email).join('; ');
        const mainDescription = `${baseDescription}\n\nIntended Recipients: ${intendedRecipients}`;

        // Main event
        eventsToGenerate.push({
            date: deadlineDate,
            summary: summary,
            description: mainDescription,
            filenameSuffix: 'Deadline',
            location: location
        });

        // Reminders
        selectedReminders.forEach(reminderOption => {
            const days = parseInt(reminderOption.dataset.days);
            const hours = parseInt(reminderOption.dataset.hours);
            const label = reminderOption.value;
            const isSpecial7am = reminderOption.dataset.special === "7am";

            const reminderDate = new Date(deadlineDate);
            if (isSpecial7am) {
                reminderDate.setHours(7, 0, 0, 0);
            } else {
                reminderDate.setDate(reminderDate.getDate() - days);
                reminderDate.setHours(reminderDate.getHours() - hours);
            }

            const reminderSummary = `[REMINDER - ${label}] ${caseName} - ${deadlineDescription}`;
            const reminderBaseDescription = `${label} REMINDER for deadline on ${formatDate(deadlineDate)}\n\n${baseDescription}`;
            const reminderDescription = `${reminderBaseDescription}\n\nIntended Recipients: ${intendedRecipients}`;

            eventsToGenerate.push({
                date: reminderDate,
                summary: reminderSummary,
                description: reminderDescription,
                filenameSuffix: `Reminder-${label.replace(/\s+/g, '')}`
            });
        });

        // Update dropdowns
        populateCaseNameDropdown();
        populateDescriptionDropdown();

        // Generate downloads
        const downloadLinksContainer = document.getElementById('download-links');
        downloadLinksContainer.innerHTML = '';

        if (downloadType === "combined") {
            const icsContent = generateCombinedICSContent(eventsToGenerate, priority);
            const blob = new Blob([icsContent], {type: 'text/calendar;charset=utf-8'});
            const url = URL.createObjectURL(blob);

            const sanitizedCaseName = caseName.replace(/[^\w\s-]/gi, '').replace(/\s+/g, '_');
            const filename = `${sanitizedCaseName}_All_Events.ics`;

            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.className = 'download-link';
            link.innerHTML = `📅 ${filename} (${eventsToGenerate.length} events)`;
            downloadLinksContainer.appendChild(link);

            document.getElementById('download-all-button').style.display = 'none';
        } else {
            eventsToGenerate.forEach(event => {
                const isMainEvent = event.filenameSuffix === 'Deadline';
                const icsContent = generateICSContent(
                    event.date, event.summary, event.description,
                    priority, isMainEvent, event.location
                );

                const blob = new Blob([icsContent], {type: 'text/calendar;charset=utf-8'});
                const url = URL.createObjectURL(blob);

                const sanitizedCaseName = caseName.replace(/[^\w\s-]/gi, '').replace(/\s+/g, '_');
                const filename = `${sanitizedCaseName}_${event.filenameSuffix}.ics`;

                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                link.className = 'download-link';
                link.innerHTML = `📅 ${filename}`;
                downloadLinksContainer.appendChild(link);
            });

            document.getElementById('download-all-button').style.display = 'flex';
        }

        // Show success
        const totalEvents = eventsToGenerate.length;
        const successMessage = downloadType === "combined"
            ? `Generated calendar file with ${totalEvents} events.`
            : `Generated ${totalEvents} calendar files.`;

        showSuccess(successMessage);
        document.getElementById('download-container').style.display = 'block';
        document.getElementById('download-container').scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error('Error processing form:', error);
        showError('An error occurred. Please try again.');
    }
}

// ============================================
// Event Listeners
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Initialize
    initializeAppData();
    loadDarkModePreference();
    setDefaultDateTime();
    populateRecipientsList();
    populateCaseNameDropdown();
    populateDescriptionDropdown();
    populateLocationDropdown();
    loadOrganizerInfo();

    // Settings modal
    document.getElementById('settings-button').addEventListener('click', openModal);
    document.getElementById('close-settings').addEventListener('click', closeModal);
    document.querySelector('.modal-overlay').addEventListener('click', closeModal);

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Collapsible cards
    document.querySelectorAll('.card-header[data-toggle]').forEach(header => {
        header.addEventListener('click', () => toggleCard(header.dataset.toggle));
    });

    // Dropdowns
    document.querySelectorAll('.dropdown-trigger').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const dropdownId = trigger.dataset.dropdown;
            const dropdown = document.getElementById(dropdownId);

            // Close other dropdowns
            document.querySelectorAll('.dropdown-menu.show').forEach(d => {
                if (d.id !== dropdownId) d.classList.remove('show');
            });

            dropdown.classList.toggle('show');
        });
    });

    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.select-input')) {
            document.querySelectorAll('.dropdown-menu.show').forEach(d => d.classList.remove('show'));
        }
    });

    // Priority buttons
    document.querySelectorAll('.priority-btn').forEach(btn => {
        btn.addEventListener('click', () => setPriority(btn.dataset.priority));
    });

    // Custom prefix toggle
    document.getElementById('main-event-prefix').addEventListener('change', function() {
        document.getElementById('custom-prefix').style.display = this.value === 'custom' ? 'block' : 'none';
    });

    // Select all toggles
    document.getElementById('select-all-recipients').addEventListener('change', toggleAllRecipients);
    document.getElementById('select-all-reminders').addEventListener('change', toggleAllReminders);

    // Reminder change listeners
    document.querySelectorAll('.reminder-option').forEach(cb => {
        cb.addEventListener('change', updateRemindersSummary);
    });

    // Generate button
    document.getElementById('generate-button').addEventListener('click', () => {
        saveOrganizerInfo();
        processForm();
    });

    // Download all
    document.getElementById('download-all-button').addEventListener('click', downloadAllFiles);

    // Dark mode
    document.getElementById('dark-mode-toggle').addEventListener('click', toggleDarkMode);

    // Settings modal buttons
    document.getElementById('save-organizer-info').addEventListener('click', () => {
        if (saveOrganizerInfo()) {
            showSuccess('Organizer info saved.');
            setTimeout(() => document.getElementById('status-message').className = 'status-message', 3000);
        } else {
            showError('Please enter both name and email.');
        }
    });

    document.getElementById('add-attorney-button').addEventListener('click', () => addAttorneyRow());
    document.getElementById('save-attorneys-button').addEventListener('click', saveAttorneysChanges);

    document.getElementById('add-case-button').addEventListener('click', () => addCaseRow());
    document.getElementById('save-cases-button').addEventListener('click', saveCasesChanges);

    document.getElementById('add-description-button').addEventListener('click', () => addDescriptionRow());
    document.getElementById('save-descriptions-button').addEventListener('click', saveDescriptionsChanges);

    document.getElementById('add-location-button').addEventListener('click', () => addLocationRow());
    document.getElementById('save-locations-button').addEventListener('click', saveLocationsChanges);

    // Import/Export
    document.getElementById('export-settings-button').addEventListener('click', exportSettings);
    document.getElementById('import-settings').addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            importSettings(e.target.files[0]);
            e.target.value = '';
        }
    });

    // Description change to load reminders
    document.getElementById('deadline-description').addEventListener('change', function() {
        const descValue = this.value.trim();
        if (descValue) loadDescriptionData(descValue);
    });

    // Description input to update hint visibility
    document.getElementById('deadline-description').addEventListener('input', updateDescriptionHint);

    // Initial summary updates
    updateRecipientsSummary();
    updateRemindersSummary();
});
