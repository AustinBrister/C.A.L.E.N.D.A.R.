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

// Default configuration - users can customize these through the app
const DEFAULT_CONFIG = {
    timezone: 'America/Chicago',
    timezoneAbbr: { standard: 'CST', daylight: 'CDT' },
    defaultEventDuration: 60, // minutes
    productId: '-//C.A.L.E.N.D.A.R.//Legal Deadline Generator//EN'
};

// Default preset descriptions with recommended reminders
const DEFAULT_PRESET_DESCRIPTIONS = {
    "Standard Filing Deadline": {
        reminders: ["7AM Day Of", "1 Day", "3 Days", "1 Week", "1 Month"],
        isPreset: true
    },
    "Standard Hearing Date": {
        reminders: ["7AM Day Of", "1 Day", "3 Days", "1 Week"],
        isPreset: true
    },
    "Standard MSJ Hearing": {
        reminders: ["7AM Day Of", "1 Day", "3 Days", "1 Week", "2 Weeks", "1 Month"],
        isPreset: true
    }
};

// ============================================
// Data Management
// ============================================

/**
 * Initialize app data structure
 * Creates default data if none exists or if structure is invalid
 */
function initializeAppData() {
    let appData;
    try {
        const storedData = localStorage.getItem(APP_DATA_KEY);
        if (storedData) {
            appData = JSON.parse(storedData);
            // Validate structure
            if (!appData.matters || !appData.descriptions || !appData.attorneys ||
                !appData.presetDescriptions || !appData.locations) {
                throw new Error("Invalid data structure");
            }
        } else {
            appData = null;
        }
    } catch (error) {
        console.error('Error loading app data from localStorage:', error);
        appData = null;
    }

    if (!appData) {
        // Create fresh initial data
        const initialData = {
            matters: {},
            descriptions: {},
            attorneys: [],  // Empty - users add their own
            presetDescriptions: DEFAULT_PRESET_DESCRIPTIONS,
            locations: [],
            organizer: {
                name: "",
                email: ""
            }
        };
        localStorage.setItem(APP_DATA_KEY, JSON.stringify(initialData));
        appData = initialData;
    }
    return appData;
}

/**
 * Save app data to localStorage
 */
function saveAppData(data) {
    localStorage.setItem(APP_DATA_KEY, JSON.stringify(data));
}

// ============================================
// Organizer Management
// ============================================

/**
 * Save organizer information
 */
function saveOrganizerInfo() {
    const organizerName = document.getElementById('organizer-name').value.trim();
    const organizerEmail = document.getElementById('organizer-email').value.trim();
    if (organizerName && organizerEmail) {
        const appData = initializeAppData();
        appData.organizer = {
            name: organizerName,
            email: organizerEmail
        };
        saveAppData(appData);
        return true;
    }
    return false;
}

/**
 * Load organizer information into form
 */
function loadOrganizerInfo() {
    const appData = initializeAppData();
    if (appData.organizer) {
        document.getElementById('organizer-name').value = appData.organizer.name || "";
        document.getElementById('organizer-email').value = appData.organizer.email || "";
    }
    if (appData.organizer && appData.organizer.name && appData.organizer.email) {
        document.getElementById('organizer-panel').style.display = 'none';
        document.getElementById('toggle-organizer-info').textContent = 'Organizer Settings ▼';
    } else {
        document.getElementById('organizer-panel').style.display = 'block';
        document.getElementById('toggle-organizer-info').textContent = 'Organizer Settings ▲';
    }
}

// ============================================
// Date/Time Utilities
// ============================================

/**
 * Set default deadline to tomorrow at 5:00 PM
 */
function setDefaultDateTime() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(17, 0, 0, 0);

    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    const hours = String(tomorrow.getHours()).padStart(2, '0');
    const minutes = String(tomorrow.getMinutes()).padStart(2, '0');

    const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    document.getElementById('deadline-date').value = formattedDateTime;
}

/**
 * Format date for display
 */
function formatDate(date) {
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Format local date for ICS (with TZID)
 */
function formatLocalDateForICS(date) {
    if (!(date instanceof Date)) {
        throw new Error("date is not a Date object");
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

/**
 * Format UTC date for ICS (DTSTAMP)
 */
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
// Recipients/Attorneys Management
// ============================================

/**
 * Toggle all recipients checkboxes
 */
function toggleAllRecipients() {
    const isChecked = document.getElementById('select-all-recipients').checked;
    const recipientCheckboxes = document.querySelectorAll('.recipient-option');
    recipientCheckboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
    });
}

/**
 * Populate recipients list from stored attorneys
 */
function populateRecipientsList() {
    const appData = initializeAppData();
    const attorneys = appData.attorneys;
    const recipientsGroup = document.getElementById('recipients-group');

    recipientsGroup.innerHTML = '';

    if (attorneys.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.style.color = '#666';
        emptyMessage.style.fontStyle = 'italic';
        emptyMessage.style.padding = '10px';
        emptyMessage.textContent = 'No recipients configured. Click "Manage Attorneys List" to add team members.';
        recipientsGroup.appendChild(emptyMessage);
        return;
    }

    attorneys.forEach((attorney, index) => {
        const checkboxItem = document.createElement('div');
        checkboxItem.className = 'checkbox-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `recipient-${index + 1}`;
        checkbox.name = 'recipients';
        checkbox.className = 'recipient-option';
        checkbox.value = attorney.name;
        checkbox.dataset.email = attorney.email;

        const label = document.createElement('label');
        label.htmlFor = `recipient-${index + 1}`;
        label.textContent = attorney.name;

        checkboxItem.appendChild(checkbox);
        checkboxItem.appendChild(label);
        recipientsGroup.appendChild(checkboxItem);
    });

    // Add click listeners to recipient checkbox items
    document.querySelectorAll('#recipients-group .checkbox-item').forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        if (checkbox) {
            item.addEventListener('click', function(e) {
                if (e.target !== checkbox) {
                    checkbox.checked = !checkbox.checked;
                }
            });
        }
    });
}

/**
 * Setup attorneys management panel
 */
function setupAttorneysManagement() {
    const appData = initializeAppData();
    const attorneys = appData.attorneys;
    const container = document.getElementById('attorney-inputs-container');

    container.innerHTML = '';

    attorneys.forEach((attorney, index) => {
        const row = document.createElement('div');
        row.className = 'attorney-input-row';
        row.dataset.index = index;

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.className = 'attorney-name form-input';
        nameInput.placeholder = 'Name';
        nameInput.value = attorney.name;

        const emailInput = document.createElement('input');
        emailInput.type = 'email';
        emailInput.className = 'attorney-email form-input';
        emailInput.placeholder = 'Email Address';
        emailInput.value = attorney.email;

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'cancel-button';
        removeButton.textContent = 'Remove';
        removeButton.onclick = function() {
            row.remove();
        };

        row.appendChild(nameInput);
        row.appendChild(emailInput);
        row.appendChild(removeButton);
        container.appendChild(row);
    });
}

/**
 * Add new attorney input row
 */
function addAttorneyInput() {
    const container = document.getElementById('attorney-inputs-container');

    const row = document.createElement('div');
    row.className = 'attorney-input-row';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'attorney-name form-input';
    nameInput.placeholder = 'Name';

    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.className = 'attorney-email form-input';
    emailInput.placeholder = 'Email Address';

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'cancel-button';
    removeButton.textContent = 'Remove';
    removeButton.onclick = function() {
        row.remove();
    };

    row.appendChild(nameInput);
    row.appendChild(emailInput);
    row.appendChild(removeButton);
    container.appendChild(row);

    nameInput.focus();
}

/**
 * Save attorneys changes
 */
function saveAttorneysChanges() {
    const rows = document.querySelectorAll('#attorney-inputs-container .attorney-input-row');
    const appData = initializeAppData();

    const attorneys = [];

    rows.forEach(row => {
        const nameInput = row.querySelector('.attorney-name');
        const emailInput = row.querySelector('.attorney-email');

        if (nameInput.value.trim() && emailInput.value.trim()) {
            attorneys.push({
                name: nameInput.value.trim(),
                email: emailInput.value.trim()
            });
        }
    });

    appData.attorneys = attorneys;
    saveAppData(appData);

    document.getElementById('attorneys-management').style.display = 'none';

    populateRecipientsList();

    showSuccess('Team members updated successfully.');
    setTimeout(() => {
        document.getElementById('status-message').style.display = 'none';
    }, 3000);
}

// ============================================
// Reminders Management
// ============================================

/**
 * Toggle all reminders checkboxes
 */
function toggleAllReminders() {
    const isChecked = document.getElementById('select-all-reminders').checked;
    const reminderCheckboxes = document.querySelectorAll('.reminder-option');
    reminderCheckboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
    });
}

// ============================================
// Matter/Case Management
// ============================================

/**
 * Save matter data with selected attorneys
 */
function saveMatterData(matterName, selectedAttorneys) {
    const appData = initializeAppData();

    if (!appData.matters[matterName]) {
        appData.matters[matterName] = { attorneys: [] };
    }

    appData.matters[matterName].attorneys = selectedAttorneys;
    saveAppData(appData);
}

/**
 * Load matter data and select appropriate attorneys
 */
function loadMatterData(matterName) {
    const appData = initializeAppData();

    if (appData.matters[matterName]) {
        const selectedAttorneys = appData.matters[matterName].attorneys;

        document.querySelectorAll('.recipient-option').forEach(checkbox => {
            checkbox.checked = false;
        });

        selectedAttorneys.forEach(attorney => {
            document.querySelectorAll('.recipient-option').forEach(checkbox => {
                if (checkbox.value === attorney) {
                    checkbox.checked = true;
                }
            });
        });
    }
}

/**
 * Populate case name dropdown
 */
function populateCaseNameDropdown() {
    const appData = initializeAppData();
    const matters = Object.keys(appData.matters);
    const dropdown = document.getElementById('case-name-dropdown');

    dropdown.innerHTML = '';

    if (matters.length === 0) {
        const emptyItem = document.createElement('div');
        emptyItem.className = 'dropdown-empty';
        emptyItem.textContent = 'No saved matters';
        dropdown.appendChild(emptyItem);
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

/**
 * Setup case names management panel
 */
function setupCasesManagement() {
    const appData = initializeAppData();
    const matters = appData.matters;
    const container = document.getElementById('case-items-container');

    container.innerHTML = '';

    Object.keys(matters).forEach(caseName => {
        const row = document.createElement('div');
        row.className = 'item-row';
        row.dataset.name = caseName;

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'case-name-input form-input';
        input.value = caseName;
        input.dataset.original = caseName;

        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.className = 'edit-button';
        editButton.textContent = 'Edit Recipients';
        editButton.onclick = function() {
            showCaseDetailPanel(caseName, row);
        };

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'cancel-button';
        removeButton.textContent = 'Remove';
        removeButton.onclick = function() {
            row.remove();
            const detailPanel = document.querySelector(`.case-detail-panel[data-for="${caseName}"]`);
            if (detailPanel) {
                detailPanel.remove();
            }
        };

        row.appendChild(input);
        row.appendChild(editButton);
        row.appendChild(removeButton);
        container.appendChild(row);
    });
}

/**
 * Show case detail panel for editing recipients
 */
function showCaseDetailPanel(caseName, rowElement) {
    const appData = initializeAppData();

    document.querySelectorAll('.case-detail-panel').forEach(panel => {
        panel.remove();
    });

    const selectedAttorneys = appData.matters[caseName] ? appData.matters[caseName].attorneys : [];

    const detailPanel = document.createElement('div');
    detailPanel.className = 'case-detail-panel';
    detailPanel.dataset.for = caseName;

    const header = document.createElement('div');
    header.className = 'case-detail-header';
    header.textContent = `Configure Recipients for "${caseName}"`;

    const checkboxList = createAttorneyCheckboxList(selectedAttorneys);

    const saveButton = document.createElement('button');
    saveButton.type = 'button';
    saveButton.className = 'save-attorneys-button';
    saveButton.textContent = 'Save Recipients';
    saveButton.style.marginTop = '15px';
    saveButton.onclick = function() {
        saveCaseDetailChanges(caseName, detailPanel);
    };

    detailPanel.appendChild(header);
    detailPanel.appendChild(checkboxList);
    detailPanel.appendChild(saveButton);

    rowElement.parentNode.insertBefore(detailPanel, rowElement.nextSibling);
}

/**
 * Save case detail changes
 */
function saveCaseDetailChanges(caseName, detailPanel) {
    const appData = initializeAppData();

    const selectedAttorneys = [];
    detailPanel.querySelectorAll('.detail-attorney-option:checked').forEach(checkbox => {
        selectedAttorneys.push(checkbox.value);
    });

    if (!appData.matters[caseName]) {
        appData.matters[caseName] = { attorneys: [] };
    }
    appData.matters[caseName].attorneys = selectedAttorneys;

    saveAppData(appData);

    detailPanel.remove();

    const statusMessage = document.createElement('div');
    statusMessage.textContent = 'Recipients updated!';
    statusMessage.style.backgroundColor = '#d4edda';
    statusMessage.style.color = '#155724';
    statusMessage.style.padding = '8px';
    statusMessage.style.borderRadius = '4px';
    statusMessage.style.marginTop = '10px';
    statusMessage.style.marginBottom = '10px';

    const row = document.querySelector(`.item-row[data-name="${caseName}"]`);
    if (row) {
        row.appendChild(statusMessage);
        setTimeout(() => {
            statusMessage.remove();
        }, 2000);
    }
}

/**
 * Add new case input row
 */
function addCaseInput() {
    const container = document.getElementById('case-items-container');

    const row = document.createElement('div');
    row.className = 'item-row';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'case-name-input form-input';
    input.placeholder = 'Case Name/Number';

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'edit-button';
    editButton.textContent = 'Edit Recipients';
    editButton.disabled = true;
    editButton.style.opacity = '0.5';

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'cancel-button';
    removeButton.textContent = 'Remove';
    removeButton.onclick = function() {
        row.remove();
    };

    row.appendChild(input);
    row.appendChild(editButton);
    row.appendChild(removeButton);
    container.appendChild(row);

    input.focus();
}

/**
 * Save case names changes
 */
function saveCasesChanges() {
    const rows = document.querySelectorAll('#case-items-container .item-row');
    const appData = initializeAppData();
    const updatedMatters = {};

    rows.forEach(row => {
        const input = row.querySelector('.case-name-input');
        const newName = input.value.trim();
        const originalName = input.dataset.original;

        if (newName) {
            if (originalName && originalName !== newName) {
                updatedMatters[newName] = appData.matters[originalName] || { attorneys: [] };
            } else if (originalName) {
                updatedMatters[originalName] = appData.matters[originalName];
            } else {
                updatedMatters[newName] = { attorneys: [] };
            }
        }
    });

    appData.matters = updatedMatters;
    saveAppData(appData);

    document.getElementById('cases-management').style.display = 'none';

    populateCaseNameDropdown();

    showSuccess('Case names updated successfully.');
    setTimeout(() => {
        document.getElementById('status-message').style.display = 'none';
    }, 3000);
}

/**
 * Create attorney checkbox list for detail panels
 */
function createAttorneyCheckboxList(selectedAttorneys = []) {
    const appData = initializeAppData();
    const attorneys = appData.attorneys;
    const container = document.createElement('div');
    container.className = 'detail-checkbox-group';

    attorneys.forEach((attorney, index) => {
        const checkboxItem = document.createElement('div');
        checkboxItem.className = 'checkbox-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `detail-attorney-${index}`;
        checkbox.className = 'detail-attorney-option';
        checkbox.value = attorney.name;

        if (selectedAttorneys.includes(attorney.name)) {
            checkbox.checked = true;
        }

        const label = document.createElement('label');
        label.htmlFor = `detail-attorney-${index}`;
        label.textContent = attorney.name;

        checkboxItem.appendChild(checkbox);
        checkboxItem.appendChild(label);
        container.appendChild(checkboxItem);
    });

    return container;
}

// ============================================
// Description Management
// ============================================

/**
 * Save description data with selected reminders
 */
function saveDescriptionData(description, selectedReminders) {
    const appData = initializeAppData();

    // Don't modify preset descriptions
    if (appData.presetDescriptions && appData.presetDescriptions[description]) {
        return;
    }

    if (!appData.descriptions[description]) {
        appData.descriptions[description] = { reminders: [] };
    }

    appData.descriptions[description].reminders = selectedReminders;
    saveAppData(appData);
}

/**
 * Load description data and select appropriate reminders
 */
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

    document.querySelectorAll('.reminder-option').forEach(checkbox => {
        checkbox.checked = false;
    });

    selectedReminders.forEach(reminder => {
        document.querySelectorAll('.reminder-option').forEach(checkbox => {
            if (checkbox.value === reminder) {
                checkbox.checked = true;
            }
        });
    });
}

/**
 * Populate description dropdown
 */
function populateDescriptionDropdown() {
    const appData = initializeAppData();
    const presetDescriptions = appData.presetDescriptions ? Object.keys(appData.presetDescriptions) : [];
    const userDescriptions = Object.keys(appData.descriptions);
    const dropdown = document.getElementById('description-dropdown');

    dropdown.innerHTML = '';

    if (presetDescriptions.length === 0 && userDescriptions.length === 0) {
        const emptyItem = document.createElement('div');
        emptyItem.className = 'dropdown-empty';
        emptyItem.textContent = 'No saved descriptions';
        dropdown.appendChild(emptyItem);
    } else {
        if (presetDescriptions.length > 0) {
            const presetHeader = document.createElement('div');
            presetHeader.className = 'dropdown-item-header';
            presetHeader.style.fontWeight = 'bold';
            presetHeader.style.backgroundColor = '#f0f7ff';
            presetHeader.style.padding = '10px 15px';
            presetHeader.textContent = 'Standard Presets:';
            dropdown.appendChild(presetHeader);

            presetDescriptions.forEach(description => {
                const item = document.createElement('div');
                item.className = 'dropdown-item';
                item.innerHTML = `${description} <span class="preset-badge">Preset</span>`;
                item.addEventListener('click', () => {
                    document.getElementById('deadline-description').value = description;
                    loadDescriptionData(description);
                    dropdown.classList.remove('show');
                });
                dropdown.appendChild(item);
            });
        }

        if (userDescriptions.length > 0) {
            if (presetDescriptions.length > 0) {
                const separator = document.createElement('div');
                separator.style.borderBottom = '1px solid #ddd';
                separator.style.margin = '5px 15px';
                dropdown.appendChild(separator);

                const customHeader = document.createElement('div');
                customHeader.className = 'dropdown-item-header';
                customHeader.style.fontWeight = 'bold';
                customHeader.style.padding = '10px 15px';
                customHeader.textContent = 'Custom:';
                dropdown.appendChild(customHeader);
            }

            userDescriptions.forEach(description => {
                const item = document.createElement('div');
                item.className = 'dropdown-item';
                item.textContent = description;
                item.addEventListener('click', () => {
                    document.getElementById('deadline-description').value = description;
                    loadDescriptionData(description);
                    dropdown.classList.remove('show');
                });
                dropdown.appendChild(item);
            });
        }
    }
}

/**
 * Setup descriptions management panel
 */
function setupDescriptionsManagement() {
    const appData = initializeAppData();
    const descriptions = appData.descriptions;
    const presetDescriptions = appData.presetDescriptions || {};
    const container = document.getElementById('description-items-container');

    container.innerHTML = '';

    // Add preset descriptions (read-only)
    Object.keys(presetDescriptions).forEach(descName => {
        const row = document.createElement('div');
        row.className = 'item-row preset';
        row.dataset.name = descName;

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'description-input form-input';
        input.value = descName;
        input.readOnly = true;
        input.disabled = true;

        const badge = document.createElement('span');
        badge.className = 'preset-badge';
        badge.textContent = 'Preset';

        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.className = 'edit-button';
        editButton.textContent = 'View Settings';
        editButton.onclick = function() {
            showDescriptionDetailPanel(descName, row, true);
        };

        row.appendChild(input);
        row.appendChild(badge);
        row.appendChild(editButton);
        container.appendChild(row);
    });

    // Add user descriptions
    Object.keys(descriptions).forEach(descName => {
        const row = document.createElement('div');
        row.className = 'item-row';
        row.dataset.name = descName;

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'description-input form-input';
        input.value = descName;
        input.dataset.original = descName;

        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.className = 'edit-button';
        editButton.textContent = 'Edit Settings';
        editButton.onclick = function() {
            showDescriptionDetailPanel(descName, row);
        };

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'cancel-button';
        removeButton.textContent = 'Remove';
        removeButton.onclick = function() {
            row.remove();
            const detailPanel = document.querySelector(`.description-detail-panel[data-for="${descName}"]`);
            if (detailPanel) {
                detailPanel.remove();
            }
        };

        row.appendChild(input);
        row.appendChild(editButton);
        row.appendChild(removeButton);
        container.appendChild(row);
    });
}

/**
 * Show description detail panel
 */
function showDescriptionDetailPanel(descName, rowElement, isPreset = false) {
    const appData = initializeAppData();

    document.querySelectorAll('.description-detail-panel').forEach(panel => {
        panel.remove();
    });

    let selectedReminders = [];
    if (isPreset) {
        selectedReminders = appData.presetDescriptions[descName].reminders;
    } else {
        selectedReminders = appData.descriptions[descName] ? appData.descriptions[descName].reminders : [];
    }

    const detailPanel = document.createElement('div');
    detailPanel.className = 'description-detail-panel';
    detailPanel.dataset.for = descName;

    const header = document.createElement('div');
    header.className = 'description-detail-header';
    header.textContent = isPreset
        ? `Settings for "${descName}" (Preset - View Only)`
        : `Configure Reminder Settings for "${descName}"`;

    const checkboxList = createReminderCheckboxList(selectedReminders);

    if (isPreset) {
        checkboxList.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.disabled = true;
        });
    }

    detailPanel.appendChild(header);
    detailPanel.appendChild(checkboxList);

    if (!isPreset) {
        const saveButton = document.createElement('button');
        saveButton.type = 'button';
        saveButton.className = 'save-attorneys-button';
        saveButton.textContent = 'Save Settings';
        saveButton.style.marginTop = '15px';
        saveButton.onclick = function() {
            saveDescriptionDetailChanges(descName, detailPanel);
        };
        detailPanel.appendChild(saveButton);
    }

    rowElement.parentNode.insertBefore(detailPanel, rowElement.nextSibling);
}

/**
 * Save description detail changes
 */
function saveDescriptionDetailChanges(descName, detailPanel) {
    const appData = initializeAppData();

    const selectedReminders = [];
    detailPanel.querySelectorAll('.detail-reminder-option:checked').forEach(checkbox => {
        selectedReminders.push(checkbox.value);
    });

    if (!appData.descriptions[descName]) {
        appData.descriptions[descName] = { reminders: [] };
    }
    appData.descriptions[descName].reminders = selectedReminders;

    saveAppData(appData);

    detailPanel.remove();

    const statusMessage = document.createElement('div');
    statusMessage.textContent = 'Settings updated!';
    statusMessage.style.backgroundColor = '#d4edda';
    statusMessage.style.color = '#155724';
    statusMessage.style.padding = '8px';
    statusMessage.style.borderRadius = '4px';
    statusMessage.style.marginTop = '10px';
    statusMessage.style.marginBottom = '10px';

    const row = document.querySelector(`.item-row[data-name="${descName}"]`);
    if (row) {
        row.appendChild(statusMessage);
        setTimeout(() => {
            statusMessage.remove();
        }, 2000);
    }
}

/**
 * Add new description input row
 */
function addDescriptionInput() {
    const container = document.getElementById('description-items-container');

    const row = document.createElement('div');
    row.className = 'item-row';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'description-input form-input';
    input.placeholder = 'Deadline Description';

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'edit-button';
    editButton.textContent = 'Edit Settings';
    editButton.disabled = true;
    editButton.style.opacity = '0.5';

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'cancel-button';
    removeButton.textContent = 'Remove';
    removeButton.onclick = function() {
        row.remove();
    };

    row.appendChild(input);
    row.appendChild(editButton);
    row.appendChild(removeButton);
    container.appendChild(row);

    input.focus();
}

/**
 * Save descriptions changes
 */
function saveDescriptionsChanges() {
    const rows = document.querySelectorAll('#description-items-container .item-row:not(.preset)');
    const appData = initializeAppData();
    const updatedDescriptions = {};

    rows.forEach(row => {
        const input = row.querySelector('.description-input');
        const newName = input.value.trim();
        const originalName = input.dataset.original;

        if (newName) {
            if (appData.presetDescriptions && appData.presetDescriptions[newName]) {
                console.warn("Cannot overwrite preset description:", newName);
                return;
            }

            if (originalName && originalName !== newName) {
                updatedDescriptions[newName] = appData.descriptions[originalName] || { reminders: [] };
            } else if (originalName) {
                updatedDescriptions[originalName] = appData.descriptions[originalName];
            } else {
                updatedDescriptions[newName] = { reminders: [] };
            }
        }
    });

    appData.descriptions = updatedDescriptions;
    saveAppData(appData);

    document.getElementById('descriptions-management').style.display = 'none';

    populateDescriptionDropdown();

    showSuccess('Deadline descriptions updated successfully.');
    setTimeout(() => {
        document.getElementById('status-message').style.display = 'none';
    }, 3000);
}

/**
 * Create reminder checkbox list for detail panels
 */
function createReminderCheckboxList(selectedReminders = []) {
    const container = document.createElement('div');
    container.className = 'detail-checkbox-group';

    const reminderOptions = [
        { id: 'detail-reminder-7am', value: '7AM Day Of', label: '7AM Day Of Deadline' },
        { id: 'detail-reminder-1d', value: '1 Day', label: '1 Day Before' },
        { id: 'detail-reminder-2d', value: '2 Days', label: '2 Days Before' },
        { id: 'detail-reminder-3d', value: '3 Days', label: '3 Days Before' },
        { id: 'detail-reminder-1w', value: '1 Week', label: '1 Week Before' },
        { id: 'detail-reminder-2w', value: '2 Weeks', label: '2 Weeks Before' },
        { id: 'detail-reminder-1m', value: '1 Month', label: '1 Month Before' }
    ];

    reminderOptions.forEach(option => {
        const checkboxItem = document.createElement('div');
        checkboxItem.className = 'checkbox-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = option.id;
        checkbox.className = 'detail-reminder-option';
        checkbox.value = option.value;

        if (selectedReminders.includes(option.value)) {
            checkbox.checked = true;
        }

        const label = document.createElement('label');
        label.htmlFor = option.id;
        label.textContent = option.label;

        checkboxItem.appendChild(checkbox);
        checkboxItem.appendChild(label);
        container.appendChild(checkboxItem);
    });

    return container;
}

// ============================================
// Location Management
// ============================================

/**
 * Populate location dropdown
 */
function populateLocationDropdown() {
    const appData = initializeAppData();
    const locations = appData.locations || [];
    const dropdown = document.getElementById('location-dropdown');

    dropdown.innerHTML = '';

    if (locations.length === 0) {
        const emptyItem = document.createElement('div');
        emptyItem.className = 'dropdown-empty';
        emptyItem.textContent = 'No saved locations';
        dropdown.appendChild(emptyItem);
    } else {
        locations.forEach(location => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.textContent = location.nickname;
            item.dataset.address = location.address;
            item.addEventListener('click', () => {
                document.getElementById('event-location').value = location.nickname;
                dropdown.classList.remove('show');
            });
            dropdown.appendChild(item);
        });
    }
}

/**
 * Setup locations management panel
 */
function setupLocationsManagement() {
    const appData = initializeAppData();
    const locations = appData.locations || [];
    const container = document.getElementById('location-items-container');

    container.innerHTML = '';

    locations.forEach(location => {
        const row = document.createElement('div');
        row.className = 'item-row';
        row.dataset.nickname = location.nickname;

        const nicknameInput = document.createElement('input');
        nicknameInput.type = 'text';
        nicknameInput.className = 'location-nickname form-input';
        nicknameInput.value = location.nickname;
        nicknameInput.dataset.original = location.nickname;
        nicknameInput.placeholder = 'Nickname (e.g., Courthouse)';

        const addressInput = document.createElement('input');
        addressInput.type = 'text';
        addressInput.className = 'location-address form-input';
        addressInput.value = location.address;
        addressInput.placeholder = 'Full Address';

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'cancel-button';
        removeButton.textContent = 'Remove';
        removeButton.onclick = function() {
            row.remove();
        };

        row.appendChild(nicknameInput);
        row.appendChild(addressInput);
        row.appendChild(removeButton);
        container.appendChild(row);
    });
}

/**
 * Add new location input row
 */
function addLocationInput() {
    const container = document.getElementById('location-items-container');

    const row = document.createElement('div');
    row.className = 'item-row';

    const nicknameInput = document.createElement('input');
    nicknameInput.type = 'text';
    nicknameInput.className = 'location-nickname form-input';
    nicknameInput.placeholder = 'Nickname (e.g., Courthouse)';

    const addressInput = document.createElement('input');
    addressInput.type = 'text';
    addressInput.className = 'location-address form-input';
    addressInput.placeholder = 'Full Address';

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'cancel-button';
    removeButton.textContent = 'Remove';
    removeButton.onclick = function() {
        row.remove();
    };

    row.appendChild(nicknameInput);
    row.appendChild(addressInput);
    row.appendChild(removeButton);
    container.appendChild(row);

    nicknameInput.focus();
}

/**
 * Save locations changes
 */
function saveLocationsChanges() {
    const rows = document.querySelectorAll('#location-items-container .item-row');
    const appData = initializeAppData();
    const updatedLocations = [];

    rows.forEach(row => {
        const nicknameInput = row.querySelector('.location-nickname');
        const addressInput = row.querySelector('.location-address');
        const nickname = nicknameInput.value.trim();
        const address = addressInput.value.trim();
        if (nickname && address) {
            updatedLocations.push({ nickname, address });
        }
    });

    appData.locations = updatedLocations;
    saveAppData(appData);

    document.getElementById('locations-management').style.display = 'none';

    populateLocationDropdown();

    showSuccess('Locations updated successfully.');
    setTimeout(() => {
        document.getElementById('status-message').style.display = 'none';
    }, 3000);
}

// ============================================
// ICS Calendar Generation
// ============================================

/**
 * Fold long lines per ICS spec (max 75 chars)
 */
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

/**
 * Generate ICS event content
 */
function generateICSEvent(eventDate, summary, description, priority, isMainEvent, location) {
    if (!(eventDate instanceof Date)) {
        throw new Error("eventDate is not a Date object");
    }
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

/**
 * Generate timezone definition for ICS
 */
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

/**
 * Generate combined ICS file with multiple events
 */
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
            event.date,
            event.summary,
            event.description,
            priority,
            isMainEvent,
            event.location
        );
        icsLines.push(...eventLines);
    });

    icsLines.push('END:VCALENDAR');

    return icsLines.join('\r\n');
}

/**
 * Generate ICS content for a single file
 */
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

/**
 * Download all files sequentially
 */
function downloadAllFiles() {
    const links = document.querySelectorAll('.download-link');
    if (links.length === 0) return;

    let index = 0;

    function triggerNextDownload() {
        if (index >= links.length) return;

        const link = links[index];
        link.click();

        index++;
        setTimeout(triggerNextDownload, 500);
    }

    triggerNextDownload();
}

// ============================================
// Import/Export Settings
// ============================================

/**
 * Export settings to JSON file
 */
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
        setTimeout(() => {
            document.getElementById('status-message').style.display = 'none';
        }, 3000);

    } catch (error) {
        console.error('Error exporting settings:', error);
        showError('Failed to export settings. Please try again.');
    }
}

/**
 * Import settings from JSON file
 */
function importSettings(file) {
    if (!file) {
        showError('No file selected.');
        return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);

            if (!importedData.matters || !importedData.descriptions || !importedData.attorneys || !importedData.locations) {
                throw new Error('Invalid settings file format');
            }

            // Preserve preset descriptions
            const currentData = initializeAppData();
            importedData.presetDescriptions = currentData.presetDescriptions;

            saveAppData(importedData);

            populateRecipientsList();
            populateCaseNameDropdown();
            populateDescriptionDropdown();
            populateLocationDropdown();
            loadOrganizerInfo();

            showSuccess('Settings imported successfully.');
            setTimeout(() => {
                document.getElementById('status-message').style.display = 'none';
            }, 3000);

        } catch (error) {
            console.error('Error importing settings:', error);
            showError('Failed to import settings. The file may be corrupted or in the wrong format.');
        }
    };

    reader.onerror = function() {
        showError('Failed to read the file. Please try again.');
    };

    reader.readAsText(file);
}

// ============================================
// UI Utilities
// ============================================

/**
 * Show error message
 */
function showError(message) {
    const statusMessage = document.getElementById('status-message');
    statusMessage.textContent = message;
    statusMessage.className = 'status error';
    statusMessage.style.display = 'block';

    document.getElementById('download-container').style.display = 'none';
}

/**
 * Show success message
 */
function showSuccess(message) {
    const statusMessage = document.getElementById('status-message');
    statusMessage.textContent = message;
    statusMessage.className = 'status success';
    statusMessage.style.display = 'block';

    document.getElementById('download-container').style.display = 'block';
}

/**
 * Set priority level
 */
function setPriority(value) {
    document.getElementById('priority-value').value = value;

    document.querySelectorAll('.priority-option').forEach(option => {
        option.classList.remove('selected');
    });

    document.querySelector(`.priority-option[id="priority-${value}"]`).classList.add('selected');
}

/**
 * Toggle dropdown visibility
 */
function toggleDropdown(dropdown) {
    dropdown.classList.toggle('show');
}

/**
 * Close dropdowns when clicking outside
 */
function closeDropdowns(event) {
    const dropdowns = document.querySelectorAll('.dropdown-list');
    dropdowns.forEach(dropdown => {
        if (dropdown.classList.contains('show') &&
            !dropdown.contains(event.target) &&
            !event.target.classList.contains('dropdown-arrow')) {
            dropdown.classList.remove('show');
        }
    });
}

/**
 * Load creator image from localStorage
 */
function loadCreatorImageFromStorage() {
    const savedImage = localStorage.getItem('calendarCreatorImage');
    if (savedImage) {
        document.getElementById('creator-image').innerHTML = `<img src="${savedImage}" alt="Creator">`;
        document.getElementById('creator-image').classList.remove('empty');
    }
}

/**
 * Handle image upload for creator image
 */
function loadCreatorImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();

        reader.onload = function(e) {
            document.getElementById('creator-image').innerHTML = `<img src="${e.target.result}" alt="Creator">`;
            document.getElementById('creator-image').classList.remove('empty');

            localStorage.setItem('calendarCreatorImage', e.target.result);
        };

        reader.readAsDataURL(input.files[0]);
    }
}

// ============================================
// Form Processing
// ============================================

/**
 * Process the main form and generate calendar files
 */
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
        if (!organizerName) {
            showError('Please enter your name as the calendar organizer.');
            document.getElementById('organizer-panel').style.display = 'block';
            document.getElementById('toggle-organizer-info').textContent = 'Organizer Settings ▲';
            document.getElementById('organizer-name').focus();
            return;
        }

        if (!organizerEmail) {
            showError('Please enter your email as the calendar organizer.');
            document.getElementById('organizer-panel').style.display = 'block';
            document.getElementById('toggle-organizer-info').textContent = 'Organizer Settings ▲';
            document.getElementById('organizer-email').focus();
            return;
        }

        if (!caseName) {
            showError('Please enter a case name or number.');
            return;
        }

        if (!deadlineDescription) {
            showError('Please enter a description for the deadline.');
            return;
        }

        if (!deadlineDateInput) {
            showError('Please select a deadline date and time.');
            return;
        }

        if (isNaN(deadlineDate.getTime())) {
            showError('Invalid date format. Please select a valid date and time.');
            return;
        }

        const selectedRecipients = Array.from(document.querySelectorAll('.recipient-option:checked'));

        if (selectedRecipients.length === 0) {
            showError('Please select at least one recipient.');
            return;
        }

        const selectedReminders = Array.from(document.querySelectorAll('.reminder-option:checked'));

        if (selectedReminders.length === 0) {
            showError('Please select at least one reminder option.');
            return;
        }

        // Save data for future use
        saveMatterData(caseName, selectedRecipients.map(r => r.value));
        saveDescriptionData(deadlineDescription, selectedReminders.map(r => r.value));

        // Get location address if using saved location
        const appData = initializeAppData();
        let location = '';
        if (locationInput) {
            const savedLocation = appData.locations.find(loc => loc.nickname === locationInput);
            location = savedLocation ? savedLocation.address : locationInput;
        }

        // Build events array
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
            if (prefix) {
                prefix = `[${prefix}] `;
            }
        }

        const summary = prefix + `${caseName} - ${deadlineDescription}`;
        const baseDescription = additionalNotes ? `Case: ${caseName}\n${additionalNotes}` : `Case: ${caseName}`;
        const intendedRecipients = selectedRecipients.map(r => r.dataset.email).join('; ');
        const mainDescription = `${baseDescription}\n\nIntended Recipients: ${intendedRecipients}`;

        // Add main deadline event
        eventsToGenerate.push({
            date: deadlineDate,
            summary: summary,
            description: mainDescription,
            filenameSuffix: 'Deadline',
            location: location
        });

        // Add reminder events
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
        populateLocationDropdown();

        // Generate download links
        const downloadLinksContainer = document.getElementById('download-links');
        downloadLinksContainer.innerHTML = '';

        if (downloadType === "combined") {
            try {
                const icsContent = generateCombinedICSContent(eventsToGenerate, priority);

                const blob = new Blob([icsContent], {type: 'text/calendar;charset=utf-8'});
                const url = URL.createObjectURL(blob);

                const sanitizedCaseName = caseName.replace(/[^\w\s-]/gi, '').replace(/\s+/g, '_');
                const filename = `${sanitizedCaseName}_All_Events.ics`;

                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                link.className = 'download-link';
                link.innerHTML = `<span class="file-icon">📅</span> ${filename} (Contains all ${eventsToGenerate.length} events)`;

                downloadLinksContainer.appendChild(link);

                document.getElementById('download-all-button').style.display = 'none';
            } catch (error) {
                console.error('Error generating combined file:', error);
                showError('An error occurred while generating the combined calendar file. Please try again.');
                return;
            }
        } else {
            eventsToGenerate.forEach(event => {
                try {
                    const isMainEvent = event.filenameSuffix === 'Deadline';

                    const icsContent = generateICSContent(
                        event.date,
                        event.summary,
                        event.description,
                        priority,
                        isMainEvent,
                        event.location
                    );

                    const blob = new Blob([icsContent], {type: 'text/calendar;charset=utf-8'});
                    const url = URL.createObjectURL(blob);

                    const sanitizedCaseName = caseName.replace(/[^\w\s-]/gi, '').replace(/\s+/g, '_');
                    const filename = `${sanitizedCaseName}_${event.filenameSuffix}.ics`;

                    const link = document.createElement('a');
                    link.href = url;
                    link.download = filename;
                    link.className = 'download-link';
                    link.innerHTML = `<span class="file-icon">📅</span> ${filename}`;

                    downloadLinksContainer.appendChild(link);
                } catch (error) {
                    console.error('Error generating file:', error);

                    const errorElement = document.createElement('div');
                    errorElement.className = 'download-link error';
                    errorElement.innerHTML = `<span class="file-icon">❌</span> Error creating file: ${event.filenameSuffix}`;
                    downloadLinksContainer.appendChild(errorElement);
                }
            });

            document.getElementById('download-all-button').style.display = 'block';
        }

        // Show success message
        const totalEvents = eventsToGenerate.length;
        const successMessage = downloadType === "combined"
            ? `Generated a single calendar file containing ${totalEvents} events.`
            : `Generated ${totalEvents} calendar files. Click each link above to download, or use "Download All".`;

        showSuccess(successMessage);

        // Animate download container
        const downloadContainer = document.getElementById('download-container');
        downloadContainer.style.display = 'block';
        downloadContainer.style.animation = 'none';
        void downloadContainer.offsetWidth;
        downloadContainer.style.animation = 'highlight-new-files 1.5s ease-in-out';

        // Add timestamp
        const timestamp = document.createElement('div');
        timestamp.style.fontSize = '13px';
        timestamp.style.marginTop = '10px';
        timestamp.style.color = '#666';
        timestamp.innerHTML = `<span style="font-weight: bold;">Files generated:</span> ${new Date().toLocaleTimeString()}`;

        const existingTimestamp = downloadContainer.querySelector('.generation-timestamp');
        if (existingTimestamp) {
            existingTimestamp.remove();
        }

        timestamp.className = 'generation-timestamp';
        downloadContainer.querySelector('h3').after(timestamp);

        downloadContainer.scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error('Error processing form:', error);
        showError('An error occurred while generating calendar files. Please try again.');
    }
}

// ============================================
// Dark Mode
// ============================================

/**
 * Update dark mode icon
 */
function updateDarkModeIcon() {
    const darkModeIcon = document.getElementById('dark-mode-icon');
    if (document.body.classList.contains('dark-mode')) {
        darkModeIcon.textContent = '🌜';
    } else {
        darkModeIcon.textContent = '🌞';
    }
}

/**
 * Toggle dark mode
 */
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    updateDarkModeIcon();
}

/**
 * Load dark mode preference
 */
function loadDarkModePreference() {
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
    updateDarkModeIcon();
}

// ============================================
// Event Listeners Setup
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize data and UI
    loadCreatorImageFromStorage();
    initializeAppData();
    loadOrganizerInfo();
    setDefaultDateTime();
    loadDarkModePreference();

    // Populate lists
    populateRecipientsList();
    populateCaseNameDropdown();
    populateDescriptionDropdown();
    populateLocationDropdown();

    // Organizer panel toggle
    document.getElementById('toggle-organizer-info').addEventListener('click', function() {
        const panel = document.getElementById('organizer-panel');
        if (panel.style.display === 'none') {
            panel.style.display = 'block';
            this.textContent = 'Organizer Settings ▲';
        } else {
            panel.style.display = 'none';
            this.textContent = 'Organizer Settings ▼';
        }
    });

    document.getElementById('save-organizer-info').addEventListener('click', function() {
        if (saveOrganizerInfo()) {
            document.getElementById('organizer-panel').style.display = 'none';
            document.getElementById('toggle-organizer-info').textContent = 'Organizer Settings ▼';
            showSuccess('Organizer information saved successfully.');
            setTimeout(() => {
                document.getElementById('status-message').style.display = 'none';
            }, 3000);
        } else {
            showError('Please enter both your name and email address.');
        }
    });

    // Reminder checkboxes click handling
    document.querySelectorAll('#reminders-group .checkbox-item').forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        item.addEventListener('click', function(e) {
            if (e.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
            }
        });
    });

    // Main form button
    document.getElementById('generate-button').addEventListener('click', function() {
        saveOrganizerInfo();
        processForm();
    });

    // Priority buttons
    document.getElementById('priority-low').addEventListener('click', () => setPriority('low'));
    document.getElementById('priority-medium').addEventListener('click', () => setPriority('medium'));
    document.getElementById('priority-high').addEventListener('click', () => setPriority('high'));

    // Select all toggles
    document.getElementById('select-all-recipients').addEventListener('click', toggleAllRecipients);
    document.getElementById('select-all-reminders').addEventListener('click', toggleAllReminders);

    // Download all button
    document.getElementById('download-all-button').addEventListener('click', downloadAllFiles);

    // Dropdown toggles
    document.getElementById('case-name').addEventListener('focus', populateCaseNameDropdown);
    document.querySelector('#case-name + .dropdown-arrow').addEventListener('click', function() {
        toggleDropdown(document.getElementById('case-name-dropdown'));
    });

    document.getElementById('deadline-description').addEventListener('focus', populateDescriptionDropdown);
    document.querySelector('#deadline-description + .dropdown-arrow').addEventListener('click', function() {
        toggleDropdown(document.getElementById('description-dropdown'));
    });

    document.getElementById('event-location').addEventListener('focus', populateLocationDropdown);
    document.querySelector('#event-location + .dropdown-arrow').addEventListener('click', function() {
        toggleDropdown(document.getElementById('location-dropdown'));
    });

    // Custom prefix toggle
    document.getElementById('main-event-prefix').addEventListener('change', function() {
        const customInput = document.getElementById('custom-prefix');
        customInput.style.display = this.value === 'custom' ? 'block' : 'none';
    });

    // Close dropdowns on outside click
    document.addEventListener('click', closeDropdowns);

    // Attorneys management
    document.getElementById('edit-attorneys-button').addEventListener('click', function() {
        setupAttorneysManagement();
        document.getElementById('attorneys-management').style.display = 'block';
    });
    document.getElementById('add-attorney-button').addEventListener('click', addAttorneyInput);
    document.getElementById('save-attorneys-button').addEventListener('click', saveAttorneysChanges);
    document.getElementById('cancel-edit-button').addEventListener('click', function() {
        document.getElementById('attorneys-management').style.display = 'none';
    });

    // Cases management
    document.getElementById('manage-cases-button').addEventListener('click', function() {
        setupCasesManagement();
        document.getElementById('cases-management').style.display = 'block';
    });
    document.getElementById('add-case-button').addEventListener('click', addCaseInput);
    document.getElementById('save-cases-button').addEventListener('click', saveCasesChanges);
    document.getElementById('cancel-cases-button').addEventListener('click', function() {
        document.getElementById('cases-management').style.display = 'none';
    });

    // Descriptions management
    document.getElementById('manage-descriptions-button').addEventListener('click', function() {
        setupDescriptionsManagement();
        document.getElementById('descriptions-management').style.display = 'block';
    });
    document.getElementById('add-description-button').addEventListener('click', addDescriptionInput);
    document.getElementById('save-descriptions-button').addEventListener('click', saveDescriptionsChanges);
    document.getElementById('cancel-descriptions-button').addEventListener('click', function() {
        document.getElementById('descriptions-management').style.display = 'none';
    });

    // Locations management
    document.getElementById('manage-locations-button').addEventListener('click', function() {
        setupLocationsManagement();
        document.getElementById('locations-management').style.display = 'block';
    });
    document.getElementById('add-location-button').addEventListener('click', addLocationInput);
    document.getElementById('save-locations-button').addEventListener('click', saveLocationsChanges);
    document.getElementById('cancel-locations-button').addEventListener('click', function() {
        document.getElementById('locations-management').style.display = 'none';
    });

    // Description change handler
    document.getElementById('deadline-description').addEventListener('change', function() {
        const descValue = this.value.trim();
        if (descValue) {
            loadDescriptionData(descValue);
        }
    });

    // Import/Export
    document.getElementById('export-settings-button').addEventListener('click', exportSettings);
    document.getElementById('import-settings').addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            importSettings(e.target.files[0]);
            e.target.value = '';
        }
    });

    // Dark mode toggle
    document.getElementById('dark-mode-toggle').addEventListener('click', toggleDarkMode);
});
