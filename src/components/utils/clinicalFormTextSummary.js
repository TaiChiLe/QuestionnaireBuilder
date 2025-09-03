// Advanced textual summary generator for clinical form XML
// Processes clinical form structures and components

export function buildClinicalFormTextSummary(xmlString) {
    if (!xmlString || !xmlString.trim()) return 'No XML loaded.';
    let xmlDoc;
    try {
        const parser = new DOMParser();
        xmlDoc = parser.parseFromString(xmlString, 'text/xml');
        const errorNode = xmlDoc.querySelector('parsererror');
        if (errorNode) {
            return 'Invalid XML: ' + errorNode.textContent.trim();
        }
    } catch (e) {
        return 'Error parsing XML: ' + e.message;
    }

    const root = xmlDoc.documentElement;
    if (!root || root.tagName !== 'form') {
        return 'Not a Clinical Form XML (missing <form> root).';
    }

    const lines = [];
    const q = (v) => (v == null ? '' : String(v));
    const quote = (v) => '"' + (q(v).replace(/"/g, '\\"')) + '"';

    // Root attributes
    lines.push('=== FORM ===');
    lines.push('  type: form');
    Array.from(root.attributes).forEach((attr) => {
        lines.push(`  ${attr.name}: ${quote(attr.value)}`);
    });
    lines.push('');

    // Process all child elements
    Array.from(root.children).forEach((child) => {
        processElement(child, lines, quote, '');
    });

    if (lines[lines.length - 1] === '') lines.pop();
    return lines.join('\n');
}

function processElement(element, lines, quote, indent) {
    const tagName = element.tagName;
    const textContent = element.textContent.trim();

    // Get all attributes
    const attributes = {};
    Array.from(element.attributes).forEach((attr) => {
        attributes[attr.name] = attr.value;
    });

    // Determine header based on element type
    let header = '';
    switch (tagName) {
        case 'group':
            header = attributes.label || attributes.title || 'Group';
            break;
        case 'panel':
            header = attributes.label || attributes.title || 'Panel';
            break;
        case 'check':
            header = attributes.label || 'Checkbox';
            break;
        case 'date':
            header = attributes.label || 'Date Field';
            break;
        case 'future_date':
            header = attributes.label || 'Future Date Field';
            break;
        case 'list':
            header = attributes.label || 'List Box';
            break;
        case 'notes':
            header = attributes.label || 'Notes Field';
            break;
        case 'notes_with_history':
            header = attributes.label || 'Notes with History';
            break;
        case 'button':
            header = attributes.label || attributes.text || attributes.title || 'Button';
            break;
        case 'form_button':
            header = attributes.label || attributes.text || 'Form Button';
            break;
        case 'textbox':
            header = attributes.label || 'Text Box';
            break;
        case 'textarea':
            header = attributes.label || 'Text Area';
            break;
        case 'radio':
            header = attributes.label || 'Radio Button';
            break;
        case 'table':
            header = attributes.label || 'Table';
            break;
        case 'metafield':
            header = attributes.label || 'Meta Field';
            break;
        case 'metafields':
            header = 'Meta Fields';
            break;
        case 'chart':
            header = attributes.name || 'Chart';
            break;
        case 'info':
            header = textContent || 'Information';
            break;
        case 'services':
            header = 'Services';
            break;
        case 'prescriptions':
            header = 'Prescriptions';
            break;
        case 'functions':
            header = 'Functions';
            break;
        // Keep cf- prefixed elements for backward compatibility
        case 'cf-panel':
            header = attributes.label || attributes.title || 'Panel';
            break;
        case 'cf-checkbox':
            header = attributes.label || 'Checkbox';
            break;
        case 'cf-date':
            header = attributes.label || 'Date Field';
            break;
        case 'cf-listbox':
            header = attributes.label || 'List Box';
            break;
        case 'cf-notes':
            header = attributes.label || 'Notes Field';
            break;
        case 'cf-notes-history':
            header = attributes.label || 'Notes History';
            break;
        case 'cf-patient-data':
            header = attributes.label || 'Patient Data';
            break;
        case 'cf-radio':
            header = attributes.label || 'Radio Button';
            break;
        case 'cf-textbox':
            header = attributes.label || 'Text Box';
            break;
        case 'cf-snom-textbox':
            header = attributes.label || 'SNOM Text Box';
            break;
        case 'cf-button':
            header = attributes.label || 'Button';
            break;
        case 'cf-table-field':
            header = attributes.label || 'Table Field';
            break;
        default:
            header = textContent || tagName;
            break;
    }

    lines.push(`${indent}=== ${header} ===`);
    lines.push(`${indent}  type: ${tagName}`);

    // Add all attributes
    Object.entries(attributes).forEach(([name, value]) => {
        if (name === 'label' || name === 'title') {
            // Skip these as they're already in the header
            return;
        }

        // Handle special attributes with better formatting
        switch (name) {
            case 'cfrequired':
            case 'cfbuttonrequired':
                if (value !== 'Ignore') {
                    lines.push(`${indent}  required: ${quote(value)}`);
                }
                break;
            case 'required':
                if (value === 'true' || value === true) {
                    lines.push(`${indent}  required: ${quote('true')}`);
                }
                break;
            case 'cfvalidationregex':
                lines.push(`${indent}  validation: ${quote(value)}`);
                break;
            case 'cfdefaultvalue':
                lines.push(`${indent}  defaultValue: ${quote(value)}`);
                break;
            case 'cfmaxlength':
                lines.push(`${indent}  maxLength: ${quote(value)}`);
                break;
            case 'cfrows':
                lines.push(`${indent}  rows: ${quote(value)}`);
                break;
            case 'cfcols':
                lines.push(`${indent}  columns: ${quote(value)}`);
                break;
            default:
                lines.push(`${indent}  ${name}: ${quote(value)}`);
                break;
        }
    });

    // Handle special elements with options
    if (tagName === 'list' || tagName === 'radio' || tagName === 'cf-listbox' || tagName === 'cf-radio') {
        // For 'list' and 'radio' elements, look for 'item' children
        const items = Array.from(element.querySelectorAll(':scope > item'));
        if (items.length > 0) {
            lines.push(`${indent}  Options (${items.length} option${items.length !== 1 ? 's' : ''}):`);
            items.forEach((item, idx) => {
                const itemText = item.textContent.trim();
                const itemValue = item.getAttribute('value') || item.getAttribute('code') || '';
                if (itemValue && itemValue !== itemText) {
                    lines.push(`${indent}    ${idx + 1}. ${quote(itemText)} (code: ${quote(itemValue)})`);
                } else {
                    lines.push(`${indent}    ${idx + 1}. ${quote(itemText)}`);
                }
            });
        }

        // For cf- prefixed elements, also check for 'option' children for backward compatibility
        const options = Array.from(element.querySelectorAll(':scope > option'));
        if (options.length > 0) {
            lines.push(`${indent}  Options (${options.length} option${options.length !== 1 ? 's' : ''}):`);
            options.forEach((option, idx) => {
                const optionText = option.textContent.trim();
                const optionValue = option.getAttribute('value') || '';
                if (optionValue && optionValue !== optionText) {
                    lines.push(`${indent}    ${idx + 1}. ${quote(optionText)} (value: ${quote(optionValue)})`);
                } else {
                    lines.push(`${indent}    ${idx + 1}. ${quote(optionText)}`);
                }
            });
        }
    }

    // Handle tables with children
    if (tagName === 'table' || tagName === 'cf-table-field') {
        const fields = Array.from(element.children).filter(child => child.tagName !== 'item' && child.tagName !== 'option');
        if (fields.length > 0) {
            lines.push(`${indent}  Table Contents (${fields.length} field${fields.length !== 1 ? 's' : ''}):`);
            fields.forEach((field) => {
                processElement(field, lines, quote, indent + '    ');
            });
        }
    }

    // Handle groups and panels with children
    if (tagName === 'group' || tagName === 'panel' || tagName === 'cf-panel') {
        const children = Array.from(element.children);
        if (children.length > 0) {
            const containerType = tagName === 'group' ? 'Group' : 'Panel';
            lines.push(`${indent}  ${containerType} Contents (${children.length} item${children.length !== 1 ? 's' : ''}):`);
            children.forEach((child) => {
                processElement(child, lines, quote, indent + '    ');
            });
        }
    }

    // Handle charts with parameters
    if (tagName === 'chart') {
        const parametersEl = element.querySelector(':scope > parameters');
        if (parametersEl) {
            const paramEls = Array.from(parametersEl.querySelectorAll(':scope > parameter'));
            if (paramEls.length > 0) {
                lines.push(`${indent}  Parameters (${paramEls.length} parameter${paramEls.length !== 1 ? 's' : ''}):`);
                paramEls.forEach((param, idx) => {
                    const paramName = param.getAttribute('name') || '';
                    const paramValue = param.getAttribute('value') || '';
                    lines.push(`${indent}    ${idx + 1}. ${quote(paramName)}: ${quote(paramValue)}`);
                });
            }
        }
    }

    lines.push('');
}
