/**
 * Clinical Form XML Generator
 * Generates XML specifically for Clinical Form mode components (cf-* components)
 */

/**
 * Generate XML for clinical form components
 * @param {Array} droppedItems - Array of dropped clinical form items
 * @returns {string} Generated clinical form XML string
 */
export function generateClinicalFormXML(droppedItems) {
    if (!droppedItems || droppedItems.length === 0) {
        return '<?xml version="1.0" encoding="utf-8"?>\n<form tag="cons">\n</form>';
    }

    const xmlContent = generateItemsXML(droppedItems, 1);
    return `<?xml version="1.0" encoding="utf-8"?>\n<form tag="cons">\n${xmlContent}\n</form>`;
}

/**
 * Generate XML for a list of items
 * @param {Array} items - Array of items to generate XML for
 * @param {number} indentLevel - Current indentation level
 * @returns {string} Generated XML string for the items
 */
function generateItemsXML(items, indentLevel = 0) {
    return items.map(item => generateItemXML(item, indentLevel)).join('\n');
}

/**
 * Generate XML for a single item
 * @param {Object} item - Item to generate XML for
 * @param {number} indentLevel - Current indentation level
 * @returns {string} Generated XML string for the item
 */
function generateItemXML(item, indentLevel = 0) {
    const indent = '  '.repeat(indentLevel);

    switch (item.type) {
        case 'cf-group':
            return generateGroupXML(item, indentLevel);

        case 'cf-panel':
            return generatePanelXML(item, indentLevel);

        case 'cf-table':
            return generateTableXML(item, indentLevel);

        case 'cf-textbox':
            return generateTextboxXML(item, indentLevel);

        case 'cf-notes':
            return generateNotesXML(item, indentLevel);

        case 'cf-notes-history':
            return generateNotesHistoryXML(item, indentLevel);

        case 'cf-date':
            return generateDateXML(item, indentLevel);

        case 'cf-future-date':
            return generateFutureDateXML(item, indentLevel);

        case 'cf-listbox':
            return generateListboxXML(item, indentLevel);

        case 'cf-radio':
            return generateRadioXML(item, indentLevel);

        case 'cf-checkbox':
            return generateCheckboxXML(item, indentLevel);

        case 'cf-button':
            return generateButtonXML(item, indentLevel);

        case 'cf-info':
            return generateInfoXML(item, indentLevel);

        case 'cf-patient-data':
            return generatePatientDataXML(item, indentLevel);

        case 'cf-patient-data-all':
            return generatePatientDataAllXML(item, indentLevel);

        case 'cf-prescription':
            return generatePrescriptionXML(item, indentLevel);

        case 'cf-provided-services':
            return generateProvidedServicesXML(item, indentLevel);

        case 'cf-snom-textbox':
            return generateSnomTextboxXML(item, indentLevel);

        case 'cf-table-field':
            return generateTableFieldXML(item, indentLevel);

        default:
            return `${indent}<!-- Unknown item type: ${item.type} -->`;
    }
}

/**
 * Generate XML for cf-group
 */
function generateGroupXML(item, indentLevel) {
    const indent = '  '.repeat(indentLevel);

    const attributes = `label="${escapeXML(item.label)}"${getTagAttribute(item)}`;

    // If no children, make it self-closing
    if (!item.children || item.children.length === 0) {
        return `${indent}<group ${attributes} />`;
    }

    // If has children, use opening and closing tags
    const childrenXML = '\n' + generateItemsXML(item.children, indentLevel + 1) + '\n' + indent;
    return `${indent}<group ${attributes}>${childrenXML}</group>`;
}

/**
 * Generate XML for cf-panel
 */
function generatePanelXML(item, indentLevel) {
    const indent = '  '.repeat(indentLevel);
    const childrenXML = item.children && item.children.length > 0
        ? '\n' + generateItemsXML(item.children, indentLevel + 1) + '\n' + indent
        : '';

    const attributes = [
        `class="ClinicalFormColumn"`,
        `label="${escapeXML(item.label)}"`,
        getTagAttribute(item),
        item.width ? `width="${item.width}"` : '',
    ].filter(attr => attr).join(' ');

    return `${indent}<panel ${attributes}>${childrenXML}</panel>`;
}

/**
 * Generate XML for cf-table
 */
function generateTableXML(item, indentLevel) {
    const indent = '  '.repeat(indentLevel);
    const childrenXML = item.children && item.children.length > 0
        ? '\n' + generateItemsXML(item.children, indentLevel + 1) + '\n' + indent
        : '';

    const attributes = [
        getCodeAttribute(item),
        getKeyAttribute(item),
        `label="${escapeXML(item.label)}"`,
        getRequiredAttribute(item),
        getTagAttribute(item),
        getGlobalAttribute(item)
    ].filter(attr => attr).join(' ');

    return `${indent}<table ${attributes}>${childrenXML}</table>`;
}

/**
 * Generate XML for cf-textbox
 */
function generateTextboxXML(item, indentLevel) {
    const indent = '  '.repeat(indentLevel);

    const attributes = [
        getCodeAttribute(item),
        getKeyAttribute(item),
        `label="${escapeXML(item.label)}"`,
        getRequiredAttribute(item),
        getTagAttribute(item),
        getGlobalAttribute(item),
        item.width ? `width="${item.width}"` : ''
    ].filter(attr => attr).join(' ');

    return `${indent}<textbox ${attributes} />`;
}

/**
 * Generate XML for cf-notes
 */
function generateNotesXML(item, indentLevel) {
    const indent = '  '.repeat(indentLevel);

    const attributes = [
        getCodeAttribute(item),
        getKeyAttribute(item),
        `label="${escapeXML(item.label)}"`,
        getRequiredAttribute(item),
        getTagAttribute(item),
        getGlobalAttribute(item),
        item.width ? `width="${item.width}"` : '',
    ].filter(attr => attr).join(' ');

    return `${indent}<notes ${attributes} />`;
}

/**
 * Generate XML for cf-notes-history
 */
function generateNotesHistoryXML(item, indentLevel) {
    const indent = '  '.repeat(indentLevel);

    const attributes = [
        getCodeAttribute(item),
        getKeyAttribute(item),
        `label="${escapeXML(item.label)}"`,
        getRequiredAttribute(item),
        getTagAttribute(item),
        getGlobalAttribute(item),
        item.width ? `width="${item.width}"` : '',
    ].filter(attr => attr).join(' ');

    return `${indent}<notes_with_history ${attributes} />`;
}

/**
 * Generate XML for cf-date
 */
function generateDateXML(item, indentLevel) {
    const indent = '  '.repeat(indentLevel);

    const attributes = [
        getCodeAttribute(item),
        getKeyAttribute(item),
        `label="${escapeXML(item.label)}"`,
        getRequiredAttribute(item),
        getTagAttribute(item),
        getGlobalAttribute(item),
        item.width ? `width="${item.width}"` : ''
    ].filter(attr => attr).join(' ');

    return `${indent}<date ${attributes} />`;
}

/**
 * Generate XML for cf-future-date
 */
function generateFutureDateXML(item, indentLevel) {
    const indent = '  '.repeat(indentLevel);

    const attributes = [
        getCodeAttribute(item),
        getKeyAttribute(item),
        `label="${escapeXML(item.label)}"`,
        getRequiredAttribute(item),
        getTagAttribute(item),
        getGlobalAttribute(item),
        item.width ? `width="${item.width}"` : ''
    ].filter(attr => attr).join(' ');

    return `${indent}<future_date ${attributes} />`;
}

/**
 * Generate XML for cf-listbox
 */
function generateListboxXML(item, indentLevel) {
    const indent = '  '.repeat(indentLevel);
    const childIndent = '  '.repeat(indentLevel + 1);

    const attributes = [
        getCodeAttribute(item),
        getKeyAttribute(item),
        `label="${escapeXML(item.label)}"`,
        getRequiredAttribute(item),
        getTagAttribute(item),
        getGlobalAttribute(item),
        item.width ? `width="${item.width}"` : ''
    ].filter(attr => attr).join(' ');

    let optionsXML = '';
    if (item.options && item.options.length > 0) {
        optionsXML = '\n' + item.options.map(option =>
            `${childIndent}<item code="${option.value || option.id}">${escapeXML(option.text)}</item>`
        ).join('\n') + '\n' + indent;
    }

    return `${indent}<list ${attributes}>${optionsXML}</list>`;
}

/**
 * Generate XML for cf-radio
 */
function generateRadioXML(item, indentLevel) {
    const indent = '  '.repeat(indentLevel);
    const childIndent = '  '.repeat(indentLevel + 1);

    const attributes = [
        getCodeAttribute(item),
        getKeyAttribute(item),
        `label="${escapeXML(item.label)}"`,
        getRequiredAttribute(item),
        getTagAttribute(item),
        getGlobalAttribute(item),
        item.width ? `width="${item.width}"` : ''
    ].filter(attr => attr).join(' ');

    let optionsXML = '';
    if (item.options && item.options.length > 0) {
        optionsXML = '\n' + item.options.map(option =>
            `${childIndent}<item code="${option.value || option.id}">${escapeXML(option.text)}</item>`
        ).join('\n') + '\n' + indent;
    }

    return `${indent}<radio ${attributes}>${optionsXML}</radio>`;
}

/**
 * Generate XML for cf-checkbox
 */
function generateCheckboxXML(item, indentLevel) {
    const indent = '  '.repeat(indentLevel);

    const attributes = [
        getCodeAttribute(item),
        getKeyAttribute(item),
        `label="${escapeXML(item.label)}"`,
        getRequiredAttribute(item),
        getTagAttribute(item),
        getGlobalAttribute(item),
        item.width ? `width="${item.width}"` : ''
    ].filter(attr => attr).join(' ');

    return `${indent}<checkbox ${attributes} />`;
}

/**
 * Generate XML for cf-button
 */
function generateButtonXML(item, indentLevel) {
    const indent = '  '.repeat(indentLevel);

    // Map action display names to XML attribute values
    const getButtonActionAttribute = () => {
        if (!item.action) return '';

        const actionMap = {
            'Add Extra Services': 'AddExtraServices',
            'Assign Task': 'AssignTask',
            'Close Case': 'CloseCase',
            'Discharge': 'Discharge',
            'Follow Up': 'FollowUp',
            'Pathology Lab Request': 'PathologyLabRequest',
            'Prescribe': 'Prescribe',
            'Prescribe Repeat': 'PrescribeRepeat',
            'Print': 'Print',
            'Print From Template': 'PrintFromTemplate',
            'Refer': 'Refer',
            'Request Observation': 'RequestObservation',
            'Run Triggers': 'RunTriggers',
            'Run Triggers Async': 'RunTriggersAsync',
            'Run Triggers Async Then Discharge': 'RunTriggersAsyncThenDischarge',
            'Run Triggers Then Discharge': 'RunTriggersThenDischarge',
            'Send Follow Up Request': 'SendFollowUpRequest',
            'Send Follow Up Request And Discharge': 'SendFollowUpRequestAndDischarge',
            'Start Pathway': 'StartPathway',
            'Start Pathway Definition': 'StartPathwayDef'
        };

        const mappedAction = actionMap[item.action] || item.action;
        return `action="${mappedAction}"`;
    };

    const attributes = [
        getButtonActionAttribute(),
        `required="${item.cfrequired}"`,
        `label="${escapeXML(item.label)}"`,
        item.parameters ? `parameters="${item.parameters}"` : ''
    ].filter(attr => attr).join(' ');

    return `${indent}<button ${attributes} />`;
}

/**
 * Generate XML for cf-info
 */
function generateInfoXML(item, indentLevel) {
    const indent = '  '.repeat(indentLevel);
    const content = escapeXML(item.label);

    return `${indent}<info>${content}</info>`;
}

/**
 * Generate XML for cf-patient-data
 */
function generatePatientDataXML(item, indentLevel) {
    const indent = '  '.repeat(indentLevel);

    const attributes = [
        `label="${escapeXML(item.label)}"`,
        item.fieldName ? `field="${item.fieldName}"` : '',
        getRequiredAttribute(item),
    ].filter(attr => attr).join(' ');

    return `${indent}<metafield ${attributes} />`;
}

/**
 * Generate XML for cf-patient-data-all
 */
function generatePatientDataAllXML(item, indentLevel) {
    const indent = '  '.repeat(indentLevel);

    const attributes = [
        `label="${escapeXML(item.label)}"`,
    ].filter(attr => attr).join(' ');

    return `${indent}<metafields ${attributes} />`;
}

/**
 * Generate XML for cf-prescription
 */
function generatePrescriptionXML(item, indentLevel) {
    const indent = '  '.repeat(indentLevel);

    return `${indent}<prescriptions />`;
}

/**
 * Generate XML for cf-provided-services
 */
function generateProvidedServicesXML(item, indentLevel) {
    const indent = '  '.repeat(indentLevel);

    return `${indent}<services />`;
}

/**
 * Generate XML for cf-snom-textbox
 */
function generateSnomTextboxXML(item, indentLevel) {
    const indent = '  '.repeat(indentLevel);

    const attributes = [
        getCodeAttribute(item),
        getKeyAttribute(item),
        `label="${escapeXML(item.label)}"`,
        getRequiredAttribute(item),
        getTagAttribute(item),
        getGlobalAttribute(item),
        item.subset ? `snomedsub="${item.subset}"` : '',
        item.width ? `width="${item.width}"` : ''
    ].filter(attr => attr).join(' ');

    return `${indent}<snomedsubtextbox ${attributes} />`;
}

/**
 * Generate XML for cf-table-field
 */
function generateTableFieldXML(item, indentLevel) {
    const indent = '  '.repeat(indentLevel);
    const tagName = getTableFieldTagName(item.dataType);

    // Base attributes that most table fields use
    const baseAttributes = [
        getCodeAttribute(item),
        getKeyAttribute(item),
        `label="${escapeXML(item.label)}"`,
        getRequiredAttribute(item),
        getTagAttribute(item),
        getGlobalAttribute(item),
        item.width ? `width="${item.width}"` : ''
    ].filter(attr => attr);

    // Handle special cases for certain data types
    switch (item.dataType) {
        case 'cf-listbox':
        case 'cf-radio': {
            // These need child <item> elements for options
            const childIndent = '  '.repeat(indentLevel + 1);
            let optionsXML = '';

            if (item.options && item.options.length > 0) {
                optionsXML = '\n' + item.options.map(option =>
                    `${childIndent}<item code="${option.value || option.id}">${escapeXML(option.text)}</item>`
                ).join('\n') + '\n' + indent;
            }

            const attributes = baseAttributes.join(' ');
            return `${indent}<${tagName} ${attributes}>${optionsXML}</${tagName}>`;
        }

        case 'cf-snom-textbox': {
            // Add SNOMED subset attribute
            const snomedAttributes = [
                ...baseAttributes,
                item.subset ? `snomedsub="${item.subset}"` : ''
            ].filter(attr => attr);

            const attributes = snomedAttributes.join(' ');
            return `${indent}<${tagName} ${attributes} />`;
        }

        default: {
            // Self-closing tags for simple field types
            const attributes = baseAttributes.join(' ');
            return `${indent}<${tagName} ${attributes} />`;
        }
    }
}

/**
 * Helper function to get the appropriate tag name for table fields
 */
function getTableFieldTagName(dataType) {
    switch (dataType) {
        case 'textbox':
        case 'Text Box':
            return 'textbox';
        case 'notes':
        case 'Text Area':
            return 'notes';
        case 'date':
        case 'Date':
        case 'cf-date':
            return 'date';
        case 'cf-future-date':
            return 'future_date';
        case 'cf-checkbox':
            return 'checkbox';
        case 'cf-listbox':
        case 'List Box':
            return 'list';
        case 'cf-radio':
        case 'Radio Buttons':
            return 'radio';
        case 'cf-snom-textbox':
            return 'snomedsubtextbox';
        default:
            return 'textbox';
    }
}

/**
 * Helper function to get code attribute
 */
function getCodeAttribute(item) {
    return item.code ? `code="${item.code}"` : '';
}

/**
 * Helper function to get key attribute
 */
function getKeyAttribute(item) {
    return item.key ? `key="${item.key}"` : '';
}

/**
 * Helper function to get required attribute
 */
function getRequiredAttribute(item) {
    // Check cfrequired first (clinical form specific)
    if (item.cfrequired !== undefined) {
        // Only include the attribute if it's true
        return item.cfrequired === true ? `required="true"` : '';
    }

    // Fallback to required property
    if (item.required !== undefined) {
        // Only include the attribute if it's true
        return item.required === true ? `required="true"` : '';
    }

    // No required property found, omit the attribute
    return '';
}

/**
 * Helper function to get tag attribute
 */
function getTagAttribute(item) {
    if (!item.tag || item.tag === '[Inherit from parent]') {
        return '';
    }

    // Map tag display names to XML attribute values
    const tagMap = {
        '[Inherit from parent]': '',
        'Allergy': 'a',
        'Administrative': 'adm',
        'Advice': 'adv',
        'Background': 'back',
        'Complaint': 'comp',
        'Consultation': 'cons',
        'Current': 'current',
        'Drug History': 'dh',
        'Diagnosis': 'diag',
        'Dictation': 'dict',
        'Diet': 'diet',
        'Document': 'doc',
        'Email correspondence': 'email',
        'Examination': 'exam',
        'Exercise History': 'exer',
        'Family History': 'fh',
        'Investigation': 'inv',
        'Numerical Data': 'num',
        'Observation': 'obs',
        'Outcome': 'out',
        'Pathology Result': 'path',
        'Past Medical History': 'pmh',
        'Previous Physiotherapy History': 'prephys',
        'Prescription': 'pres',
        'Prescription (Acute)': 'pres_a',
        'Prescription': 'presalt',
        'Past Surgical History': 'psh',
        'Results Advice': 'radv',
        'Referral (inbound)': 'refi',
        'Referral (outbound)': 'refo',
        'Screening': 'scr',
        'Appointment Service': 'serv',
        'Social History': 'sh',
        'Snapshot': 'snap',
        'Stock Dispensed': 'stck',
        'Symptoms': 'symptoms',
        'Treatment': 'tm',
        'Urinalysis': 'uri',
        'Vaccination': 'vacc',
        'Visual acuity and refractive error': 'vis',
        'Vaccination Recording': 'vrec'
    };

    const mappedTag = tagMap[item.tag] || item.tag;
    return mappedTag ? ` tag="${mappedTag}"` : '';
}

/**
 * Helper function to get global attribute
 */
function getGlobalAttribute(item) {
    // Omit the global attribute if value is false, undefined, or empty string
    if (item.global === false || item.global === undefined || item.global === '') {
        return '';
    }
    return `global="${item.global}"`;
}

/**
 * Helper function to escape XML characters
 */
function escapeXML(str) {
    if (!str) return '';
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}
