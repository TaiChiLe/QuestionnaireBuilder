/**
 * Clinical Form XML Parser
 * Handles XML parsing specifically for clinical form format based on ClinicalForm.xsd
 */

import { generateId } from '../../components/utils/id';

// Simple robust ID generator for clinical form parsing
const createIdGenerator = () => {
    const counters = {};
    return (type) => {
        counters[type] = (counters[type] || 0) + 1;
        return `${type}-${Date.now()}-${counters[type]}-${Math.random()
            .toString(36)
            .slice(2, 8)}`;
    };
};

/**
 * Convert clinical form elements to internal item structure
 * @param {Element} element - XML element to parse
 * @param {Function} generateIdFn - ID generator function
 * @returns {Object|null} Parsed item object
 */
const parseClinicalFormElement = (element, generateIdFn) => {
    const tagName = element.tagName.toLowerCase();

    switch (tagName) {
        case 'group':
            const groupItem = {
                id: generateIdFn('group'),
                type: 'page', // Map groups to pages in our internal structure
                label: element.getAttribute('label') || element.getAttribute('title') || 'Group',
                title: element.getAttribute('title') || element.getAttribute('label') || 'Group',
                children: [],
            };

            // Parse show conditions
            const groupShow = element.getAttribute('show');
            if (groupShow) {
                groupItem.conditions = parseShowCondition(groupShow);
            }

            // Parse children of the group
            const groupChildren = Array.from(element.children);
            groupChildren.forEach((child) => {
                const childItem = parseClinicalFormElement(child, generateIdFn);
                if (childItem) {
                    groupItem.children.push(childItem);
                }
            });

            return groupItem;

        case 'panel':
            const panelItem = {
                id: generateIdFn('panel'),
                type: 'page', // Map panels to pages
                label: element.getAttribute('label') || 'Panel',
                children: [],
            };

            // Parse children of the panel
            const panelChildren = Array.from(element.children);
            panelChildren.forEach((child) => {
                const childItem = parseClinicalFormElement(child, generateIdFn);
                if (childItem) {
                    panelItem.children.push(childItem);
                }
            });

            return panelItem;

        case 'textbox':
            const textboxItem = {
                id: generateIdFn('field'),
                type: 'field',
                label: element.getAttribute('label') || 'Text Field',
                keyField: element.getAttribute('name') || '',
                required: element.getAttribute('required') === 'true',
                dataType: 'Text Box',
                children: [],
            };

            // Parse show conditions
            const textboxShow = element.getAttribute('show');
            if (textboxShow) {
                textboxItem.conditions = parseShowCondition(textboxShow);
            }

            return textboxItem;

        case 'textarea':
            const textareaItem = {
                id: generateIdFn('field'),
                type: 'field',
                label: element.getAttribute('label') || 'Text Area',
                keyField: element.getAttribute('name') || '',
                required: element.getAttribute('required') === 'true',
                dataType: 'Text Area',
                children: [],
            };

            const textareaShow = element.getAttribute('show');
            if (textareaShow) {
                textareaItem.conditions = parseShowCondition(textareaShow);
            }

            return textareaItem;

        case 'date':
            const dateItem = {
                id: generateIdFn('field'),
                type: 'field',
                label: element.getAttribute('label') || 'Date Field',
                keyField: element.getAttribute('name') || '',
                required: element.getAttribute('required') === 'true',
                dataType: 'Date',
                children: [],
            };

            const dateShow = element.getAttribute('show');
            if (dateShow) {
                dateItem.conditions = parseShowCondition(dateShow);
            }

            return dateItem;

        case 'check':
            const checkItem = {
                id: generateIdFn('field'),
                type: 'field',
                label: element.getAttribute('label') || 'Checkbox',
                keyField: element.getAttribute('name') || '',
                required: element.getAttribute('required') === 'true',
                dataType: 'Checkbox',
                children: [],
            };

            const checkShow = element.getAttribute('show');
            if (checkShow) {
                checkItem.conditions = parseShowCondition(checkShow);
            }

            return checkItem;

        case 'radio':
            const radioItem = {
                id: generateIdFn('question'),
                type: 'question',
                label: element.getAttribute('label') || 'Radio Question',
                keyField: element.getAttribute('name') || '',
                required: element.getAttribute('required') === 'true',
                dataType: 'Radio Buttons',
                answers: [],
                children: [],
            };

            // Parse radio items
            const radioItems = element.querySelectorAll('item');
            radioItems.forEach((item) => {
                radioItem.answers.push({
                    id: generateIdFn('answer'),
                    text: item.textContent || '',
                    value: item.getAttribute('value') || item.textContent || '',
                });
            });

            const radioShow = element.getAttribute('show');
            if (radioShow) {
                radioItem.conditions = parseShowCondition(radioShow);
            }

            return radioItem;

        case 'list':
            const listItem = {
                id: generateIdFn('question'),
                type: 'question',
                label: element.getAttribute('label') || 'List Question',
                keyField: element.getAttribute('name') || '',
                required: element.getAttribute('required') === 'true',
                dataType: 'List Box',
                answers: [],
                children: [],
            };

            // Parse list items
            const listItems = element.querySelectorAll('item');
            listItems.forEach((item) => {
                listItem.answers.push({
                    id: generateIdFn('answer'),
                    text: item.textContent || '',
                    value: item.getAttribute('value') || item.textContent || '',
                });
            });

            const listShow = element.getAttribute('show');
            if (listShow) {
                listItem.conditions = parseShowCondition(listShow);
            }

            return listItem;

        case 'info':
            const infoItem = {
                id: generateIdFn('information'),
                type: 'information',
                label: element.textContent || 'Information',
                children: [],
            };

            const infoShow = element.getAttribute('show');
            if (infoShow) {
                infoItem.conditions = parseShowCondition(infoShow);
            }

            return infoItem;

        case 'table':
            const tableItem = {
                id: generateIdFn('table'),
                type: 'table',
                label: element.getAttribute('label') || 'Table',
                keyField: element.getAttribute('name') || '',
                required: element.getAttribute('required') === 'true',
                children: [],
            };

            // Parse table children (columns/fields)
            const tableChildren = Array.from(element.children);
            tableChildren.forEach((child) => {
                const childItem = parseClinicalFormElement(child, generateIdFn);
                if (childItem) {
                    // Convert child items to table fields
                    childItem.type = 'table-field';
                    tableItem.children.push(childItem);
                }
            });

            const tableShow = element.getAttribute('show');
            if (tableShow) {
                tableItem.conditions = parseShowCondition(tableShow);
            }

            return tableItem;

        case 'button':
            const buttonItem = {
                id: generateIdFn('button'),
                type: 'button',
                label: element.getAttribute('text') || element.getAttribute('label') || 'Button',
                children: [],
            };

            return buttonItem;

        case 'notes':
        case 'notes_with_history':
            const notesItem = {
                id: generateIdFn('field'),
                type: 'field',
                label: element.getAttribute('label') || 'Notes',
                keyField: element.getAttribute('name') || '',
                required: element.getAttribute('required') === 'true',
                dataType: 'Text Area',
                children: [],
            };

            const notesShow = element.getAttribute('show');
            if (notesShow) {
                notesItem.conditions = parseShowCondition(notesShow);
            }

            return notesItem;

        default:
            // Skip unknown elements or return null
            return null;
    }
};

/**
 * Parse show condition string into our internal condition format
 * @param {string} showCondition - Show condition string
 * @returns {Array} Array of condition objects
 */
const parseShowCondition = (showCondition) => {
    if (!showCondition) return [];

    // Simple parsing for conditions like "{field} == 'value'"
    // This is a basic implementation - may need enhancement for complex conditions
    const conditions = [];

    try {
        // Match patterns like {field} == 'value' or {field} != 'value'
        const matches = showCondition.match(/\{([^}]+)\}\s*(==|!=)\s*['"]([^'"]+)['"]/g);

        if (matches) {
            matches.forEach(match => {
                const parts = match.match(/\{([^}]+)\}\s*(==|!=)\s*['"]([^'"]+)['"]/);
                if (parts) {
                    conditions.push({
                        record: parts[1],
                        field: parts[1],
                        operator: parts[2] === '==' ? 'equals' : 'not_equals',
                        answer: parts[3],
                        value: parts[3],
                    });
                }
            });
        }
    } catch (error) {
        console.warn('Error parsing show condition:', showCondition, error);
    }

    return conditions;
};

/**
 * Parse clinical form XML elements
 * @param {string} xmlString - Raw XML string
 * @returns {Object} Parsed clinical form data with metadata
 */
export function parseClinicalFormXml(xmlString) {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

        // Check for parsing errors
        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
            throw new Error('Invalid XML format: ' + parserError.textContent);
        }

        // Look for clinical form root element
        const form = xmlDoc.querySelector('form');
        if (!form) {
            throw new Error('Invalid clinical form XML format: Missing form root element');
        }

        const generateIdFn = createIdGenerator();
        const items = [];

        // Parse all direct children of the form
        const formChildren = Array.from(form.children);
        formChildren.forEach((child) => {
            const childItem = parseClinicalFormElement(child, generateIdFn);
            if (childItem) {
                items.push(childItem);
            }
        });

        const metadata = {
            name: form.getAttribute('tag') || form.getAttribute('key') || 'Untitled Clinical Form',
            version: '2.0',
            type: 'clinical-form',
            createdAt: new Date().toISOString(),
        };

        return {
            items,
            metadata,
            valid: true
        };
    } catch (error) {
        return {
            items: [],
            metadata: null,
            valid: false,
            error: error.message
        };
    }
}/**
 * Validate clinical form XML structure
 * @param {string} xmlString - Raw XML string
 * @returns {Object} Validation result
 */
export function validateClinicalFormXml(xmlString) {
    const errors = [];
    const warnings = [];

    // Basic validation
    if (!xmlString || xmlString.trim() === '') {
        errors.push('Empty XML content');
        return { valid: false, errors, warnings };
    }

    // Check for clinical form root element (must be <form>)
    if (!xmlString.includes('<form')) {
        errors.push('Missing form root element');
    }

    // Clinical form-specific validations based on XSD
    const clinicalFormElements = [
        'textbox', 'textarea', 'radio', 'list', 'check', 'date',
        'group', 'panel', 'info', 'table', 'button', 'notes'
    ];

    const hasValidElements = clinicalFormElements.some(element =>
        xmlString.includes(`<${element}`)
    );

    if (!hasValidElements) {
        warnings.push('No recognized clinical form elements found');
    }

    // Check for common clinical form attributes
    if (!xmlString.includes('name=')) {
        warnings.push('Consider adding name attributes to form elements for data binding');
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Extract clinical form name from XML
 * @param {string} xmlString - Raw XML string
 * @returns {string} Clinical form name
 */
export function extractClinicalFormName(xmlString) {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

        const form = xmlDoc.querySelector('form');
        if (form) {
            return form.getAttribute('tag') || form.getAttribute('key') || '';
        }

        return '';
    } catch (error) {
        return '';
    }
}
