/**
 * Clinical Form XML Parser
 * Parses XML specifically for Clinical Form mode components (cf-* components)
 */

// Simple robust ID generator for XML parsing
const createIdGenerator = () => {
    const counters = {};
    return (type) => {
        counters[type] = (counters[type] || 0) + 1;
        return `${type}-${Date.now()}-${counters[type]}-${Math.random()
            .toString(36)
            .slice(2, 8)}`;
    };
};

// Map XML tag display values back to internal values
const mapTagXmlToDisplay = (xmlTag) => {
    const tagMap = {
        'a': 'Allergy',
        'adm': 'Administrative',
        'adv': 'Advice',
        'back': 'Background',
        'comp': 'Complaint',
        'cons': 'Consultation',
        'current': 'Current',
        'dh': 'Drug History',
        'diag': 'Diagnosis',
        'dict': 'Dictation',
        'diet': 'Diet',
        'doc': 'Document',
        'email': 'Email correspondence',
        'exam': 'Examination',
        'exer': 'Exercise History',
        'fh': 'Family History',
        'inv': 'Investigation',
        'num': 'Numerical Data',
        'obs': 'Observation',
        'out': 'Outcome',
        'path': 'Pathology Result',
        'pmh': 'Past Medical History',
        'prephys': 'Previous Physiotherapy History',
        'pres': 'Prescription',
        'pres_a': 'Prescription (Acute)',
        'presalt': 'Prescription',
        'psh': 'Past Surgical History',
        'radv': 'Results Advice',
        'refi': 'Referral (inbound)',
        'refo': 'Referral (outbound)',
        'scr': 'Screening',
        'serv': 'Appointment Service',
        'sh': 'Social History',
        'snap': 'Snapshot',
        'stck': 'Stock Dispensed',
        'symptoms': 'Symptoms',
        'tm': 'Treatment',
        'uri': 'Urinalysis',
        'vacc': 'Vaccination',
        'vis': 'Visual acuity and refractive error',
        'vrec': 'Vaccination Recording'
    };

    return tagMap[xmlTag] || xmlTag || '[Inherit from parent]';
};

// Map XML action values back to display values
const mapActionXmlToDisplay = (xmlAction) => {
    const actionMap = {
        'AddExtraServices': 'Add Extra Services',
        'AssignTask': 'Assign Task',
        'CloseCase': 'Close Case',
        'Discharge': 'Discharge',
        'FollowUp': 'Follow Up',
        'PathologyLabRequest': 'Pathology Lab Request',
        'Prescribe': 'Prescribe',
        'PrescribeRepeat': 'Prescribe Repeat',
        'Print': 'Print',
        'PrintFromTemplate': 'Print From Template',
        'Refer': 'Refer',
        'RequestObservation': 'Request Observation',
        'RunTriggers': 'Run Triggers',
        'RunTriggersAsync': 'Run Triggers Async',
        'RunTriggersAsyncThenDischarge': 'Run Triggers Async Then Discharge',
        'RunTriggersThenDischarge': 'Run Triggers Then Discharge',
        'SendFollowUpRequest': 'Send Follow Up Request',
        'SendFollowUpRequestAndDischarge': 'Send Follow Up Request And Discharge',
        'StartPathway': 'Start Pathway',
        'StartPathwayDef': 'Start Pathway Definition'
    };

    return actionMap[xmlAction] || xmlAction;
};

// Parse options from child <item> elements
const parseOptions = (parentElement, generateIdFn) => {
    const options = [];
    const itemElements = parentElement.querySelectorAll('item');

    itemElements.forEach((itemEl) => {
        options.push({
            id: generateIdFn('option'),
            text: itemEl.textContent || '',
            value: itemEl.getAttribute('code') || ''
        });
    });

    return options;
};

// Parse a single XML element
const parseXmlElement = (element, generateIdFn) => {
    const tagName = element.tagName.toLowerCase();
    console.log('Parsing XML element:', tagName, 'with attributes:', element.attributes);

    switch (tagName) {
        case 'group':
            const groupItem = {
                id: generateIdFn('cf-group'),
                type: 'cf-group',
                label: element.getAttribute('label') || 'Group',
                tag: mapTagXmlToDisplay(element.getAttribute('tag')),
                children: []
            };

            // Parse children of the group
            const groupChildren = Array.from(element.children);
            groupChildren.forEach((child) => {
                const childItem = parseXmlElement(child, generateIdFn);
                if (childItem) {
                    groupItem.children.push(childItem);
                }
            });

            return groupItem;

        case 'panel':
            const panelItem = {
                id: generateIdFn('cf-panel'),
                type: 'cf-panel',
                tag: mapTagXmlToDisplay(element.getAttribute('tag')),
                width: element.getAttribute('width') || '',
                children: []
            };

            // Parse children of the panel
            const panelChildren = Array.from(element.children);
            panelChildren.forEach((child) => {
                const childItem = parseXmlElement(child, generateIdFn);
                if (childItem) {
                    panelItem.children.push(childItem);
                }
            });

            return panelItem;

        case 'table':
            const tableItem = {
                id: generateIdFn('cf-table'),
                type: 'cf-table',
                label: element.getAttribute('label') || 'Table',
                code: element.getAttribute('code') || '',
                key: element.getAttribute('key') || '',
                tag: mapTagXmlToDisplay(element.getAttribute('tag')),
                global: element.getAttribute('global') || '',
                cfrequired: element.getAttribute('required') === 'true',
                children: []
            };

            // Parse children of the table (table fields)
            const tableChildren = Array.from(element.children);
            tableChildren.forEach((child) => {
                const childItem = parseXmlElement(child, generateIdFn);
                if (childItem) {
                    tableItem.children.push(childItem);
                }
            });

            return tableItem;

        case 'textbox':
            return {
                id: generateIdFn('cf-textbox'),
                type: 'cf-textbox',
                label: element.getAttribute('label') || 'Text Box',
                code: element.getAttribute('code') || '',
                key: element.getAttribute('key') || '',
                tag: mapTagXmlToDisplay(element.getAttribute('tag')),
                global: element.getAttribute('global') || '',
                cfrequired: element.getAttribute('required') === 'true',
                width: element.getAttribute('width') || ''
            };

        case 'textarea':
            return {
                id: generateIdFn('cf-textbox'),
                type: 'cf-textbox', // Map textarea to textbox component
                label: element.getAttribute('label') || 'Text Area',
                code: element.getAttribute('code') || '',
                key: element.getAttribute('key') || '',
                tag: mapTagXmlToDisplay(element.getAttribute('tag')),
                global: element.getAttribute('global') || '',
                cfrequired: element.getAttribute('required') === 'true',
                width: element.getAttribute('width') || ''
            };

        case 'chart':
            const chartItem = {
                id: generateIdFn('cf-chart'),
                type: 'cf-chart',
                label: element.getAttribute('name') || 'Chart',
                chartType: 'Gauge', // Default to Gauge since original XML doesn't specify
                chartMetaFields: [], // Initialize empty meta fields array
                width: element.getAttribute('width') || '',
                height: element.getAttribute('height') || ''
            };

            // Parse parameters if they exist
            const parametersElement = element.querySelector('parameters');
            if (parametersElement) {
                const parameterElements = parametersElement.querySelectorAll('parameter');
                parameterElements.forEach(paramEl => {
                    const paramName = paramEl.getAttribute('name');
                    const paramValue = paramEl.getAttribute('value');

                    if (paramName === 'source' || paramName === 'label') {
                        // Add the source/label value as a meta field if it's not already there
                        if (paramValue && !chartItem.chartMetaFields.includes(paramValue)) {
                            chartItem.chartMetaFields.push(paramValue);
                        }
                    }
                });
            }

            return chartItem;

        case 'form_button':
            return {
                id: generateIdFn('cf-button'),
                type: 'cf-button',
                label: element.getAttribute('label') || element.getAttribute('text') || 'Form Button',
                action: 'Custom', // Form buttons are custom actions
                formName: element.getAttribute('form') || '',
                link: element.getAttribute('link') || '',
                redirect: element.getAttribute('redirect') === 'true'
            };

        case 'notes':
            return {
                id: generateIdFn('cf-notes'),
                type: 'cf-notes',
                label: element.getAttribute('label') || 'Notes',
                code: element.getAttribute('code') || '',
                key: element.getAttribute('key') || '',
                tag: mapTagXmlToDisplay(element.getAttribute('tag')),
                global: element.getAttribute('global') || '',
                cfrequired: element.getAttribute('required') === 'true',
                width: element.getAttribute('width') || ''
            };

        case 'notes_with_history':
            return {
                id: generateIdFn('cf-notes-history'),
                type: 'cf-notes-history',
                label: element.getAttribute('label') || 'Notes With History',
                code: element.getAttribute('code') || '',
                key: element.getAttribute('key') || '',
                tag: mapTagXmlToDisplay(element.getAttribute('tag')),
                global: element.getAttribute('global') || '',
                cfrequired: element.getAttribute('required') === 'true',
                width: element.getAttribute('width') || ''
            };

        case 'date':
            return {
                id: generateIdFn('cf-date'),
                type: 'cf-date',
                label: element.getAttribute('label') || 'Date',
                code: element.getAttribute('code') || '',
                key: element.getAttribute('key') || '',
                tag: mapTagXmlToDisplay(element.getAttribute('tag')),
                global: element.getAttribute('global') || '',
                cfrequired: element.getAttribute('required') === 'true',
                width: element.getAttribute('width') || ''
            };

        case 'future_date':
            return {
                id: generateIdFn('cf-future-date'),
                type: 'cf-future-date',
                label: element.getAttribute('label') || 'Future Date',
                code: element.getAttribute('code') || '',
                key: element.getAttribute('key') || '',
                tag: mapTagXmlToDisplay(element.getAttribute('tag')),
                global: element.getAttribute('global') || '',
                cfrequired: element.getAttribute('required') === 'true',
                width: element.getAttribute('width') || ''
            };

        case 'list':
            const listItem = {
                id: generateIdFn('cf-listbox'),
                type: 'cf-listbox',
                label: element.getAttribute('label') || 'List Box',
                code: element.getAttribute('code') || '',
                key: element.getAttribute('key') || '',
                tag: mapTagXmlToDisplay(element.getAttribute('tag')),
                global: element.getAttribute('global') || '',
                cfrequired: element.getAttribute('required') === 'true',
                width: element.getAttribute('width') || '',
                options: parseOptions(element, generateIdFn)
            };
            return listItem;

        case 'radio':
            const radioItem = {
                id: generateIdFn('cf-radio'),
                type: 'cf-radio',
                label: element.getAttribute('label') || 'Radio Buttons',
                code: element.getAttribute('code') || '',
                key: element.getAttribute('key') || '',
                tag: mapTagXmlToDisplay(element.getAttribute('tag')),
                global: element.getAttribute('global') || '',
                cfrequired: element.getAttribute('required') === 'true',
                width: element.getAttribute('width') || '',
                options: parseOptions(element, generateIdFn)
            };
            return radioItem;

        case 'check':
            return {
                id: generateIdFn('cf-checkbox'),
                type: 'cf-checkbox',
                label: element.getAttribute('label') || 'Checkbox',
                code: element.getAttribute('code') || '',
                key: element.getAttribute('key') || '',
                tag: mapTagXmlToDisplay(element.getAttribute('tag')),
                global: element.getAttribute('global') || '',
                cfrequired: element.getAttribute('required') === 'true',
                width: element.getAttribute('width') || ''
            };

        case 'button':
            return {
                id: generateIdFn('cf-button'),
                type: 'cf-button',
                label: element.getAttribute('label') || 'Button',
                action: mapActionXmlToDisplay(element.getAttribute('action')),
                cfrequired: element.getAttribute('required') === 'true',
                parameters: element.getAttribute('parameters') || ''
            };

        case 'info':
            return {
                id: generateIdFn('cf-info'),
                type: 'cf-info',
                label: element.textContent || 'Information'
            };

        case 'metafield':
            return {
                id: generateIdFn('cf-patient-data'),
                type: 'cf-patient-data',
                label: element.getAttribute('label') || 'Patient Data',
                fieldName: element.getAttribute('field') || '',
                cfrequired: element.getAttribute('required') === 'true'
            };

        case 'metafields':
            return {
                id: generateIdFn('cf-patient-data-all'),
                type: 'cf-patient-data-all',
            };

        case 'prescriptions':
            return {
                id: generateIdFn('cf-prescription'),
                type: 'cf-prescription',
            };

        case 'services':
            return {
                id: generateIdFn('cf-provided-services'),
                type: 'cf-provided-services',
            };

        case 'snomedsubtextbox':
            return {
                id: generateIdFn('cf-snom-textbox'),
                type: 'cf-snom-textbox',
                label: element.getAttribute('label') || 'SNOMED Text Box',
                code: element.getAttribute('code') || '',
                key: element.getAttribute('key') || '',
                tag: mapTagXmlToDisplay(element.getAttribute('tag')),
                global: element.getAttribute('global') || '',
                subset: element.getAttribute('snomedsub') || '',
                width: element.getAttribute('width') || '',
                cfrequired: element.getAttribute('required') === 'true'
            };

        // Handle table field elements that can appear within tables
        case 'textbox':
        case 'notes':
        case 'date':
        case 'future_date':
        case 'list':
        case 'radio':
        case 'check':
        case 'snomedsubtextbox':
            // When these elements appear within a table, treat them as table fields
            const parentIsTable = element.parentElement && element.parentElement.tagName.toLowerCase() === 'table';
            if (parentIsTable) {
                // Map XML tag name to table field dataType
                const dataTypeMap = {
                    'textbox': 'textbox',
                    'notes': 'notes',
                    'date': 'cf-date',
                    'future_date': 'cf-future-date',
                    'list': 'cf-listbox',
                    'radio': 'cf-radio',
                    'check': 'cf-checkbox',
                    'snomedsubtextbox': 'cf-snom-textbox'
                };

                const tableFieldItem = {
                    id: generateIdFn('cf-table-field'),
                    type: 'cf-table-field',
                    label: element.getAttribute('label') || 'Table Field',
                    dataType: dataTypeMap[tagName] || 'textbox',
                    code: element.getAttribute('code') || '',
                    key: element.getAttribute('key') || '',
                    tag: mapTagXmlToDisplay(element.getAttribute('tag')),
                    global: element.getAttribute('global') || '',
                    cfrequired: element.getAttribute('required') === 'true',
                    width: element.getAttribute('width') || '',
                    subset: element.getAttribute('snomedsub') || '', // for SNOMED textbox
                    options: (tagName === 'list' || tagName === 'radio') ? parseOptions(element, generateIdFn) : []
                };

                return tableFieldItem;
            }
            // If not in a table, handle as regular components (fallback)
            break;

        case 'parameters':
        case 'parameter':
            // These are handled within their parent chart element, skip standalone instances
            return null;

        default:
            console.warn(`Unknown clinical form element: ${tagName}`);
            return null;
    }

    return null;
};

// Parse Clinical Form XML to items structure
export const parseClinicalFormXmlToItems = (xmlString) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
        throw new Error('Invalid XML format: ' + parserError.textContent);
    }

    // Parse the XML structure
    const form = xmlDoc.querySelector('form');
    if (!form) {
        throw new Error('Invalid clinical form XML format: Missing form root element');
    }

    const generateIdFn = createIdGenerator();
    const items = [];

    // Parse all child elements of the form
    const children = Array.from(form.children);
    console.log('Clinical Form parsing - found', children.length, 'child elements:', children.map(c => c.tagName));

    children.forEach((child) => {
        const childItem = parseXmlElement(child, generateIdFn);
        console.log('Parsed element', child.tagName, '→', childItem);
        if (childItem) {
            items.push(childItem);
        }
    });

    console.log('Final parsed items:', items);
    return items;
};

// Extract form tag from XML
export const extractFormTag = (xmlString) => {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
        const form = xmlDoc.querySelector('form');
        return form?.getAttribute('tag') || 'cons';
    } catch (error) {
        return 'cons';
    }
};

// Detect if XML is a clinical form
export const isClinicalFormXml = (xmlString) => {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

        // Check for parsing errors
        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
            return false;
        }

        // Clinical form XML has a root <form> element
        const form = xmlDoc.querySelector('form');

        // Also check if there's a Questionnaire element (should not be present in clinical forms)
        const questionnaire = xmlDoc.querySelector('Questionnaire');

        const result = !!form && !questionnaire;

        // Debug logging (can be removed later)
        console.log('XML Type Detection:', {
            hasForm: !!form,
            hasQuestionnaire: !!questionnaire,
            isClinicalForm: result,
            xmlPreview: xmlString.substring(0, 200) + '...'
        });

        return result;
    } catch (error) {
        console.log('Error in isClinicalFormXml:', error);
        return false;
    }
};