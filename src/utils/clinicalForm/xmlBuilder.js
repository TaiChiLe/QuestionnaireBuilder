/**
 * Clinical Form XML Builder
 * Handles XML generation specifically for clinical form format based on ClinicalForm.xsd
 */

import { create } from 'xmlbuilder2';

/**
 * Generate XML structure for clinical form format
 * @param {Array} droppedItems - Array of clinical form items
 * @param {string} formName - Name of the clinical form
 * @returns {string} Generated XML string
 */
export function generateClinicalFormXML(droppedItems, formName = '') {
    if (droppedItems.length === 0) return '';

    try {
        // Create XML document for clinical form based on the XSD schema
        const rootForm = create({ version: '1.0', encoding: 'utf-8' })
            .ele('form');

        if (formName) {
            rootForm.att('tag', formName);
        }

        // Recursive function to add items based on clinical form schema
        const addItemsToXml = (parentNode, items) => {
            items.forEach((item) => {
                let elementNode;

                switch (item.type) {
                    case 'page':
                    case 'group':
                        // Map pages to groups in clinical forms
                        elementNode = parentNode.ele('group');
                        if (item.label) elementNode.att('label', item.label);
                        if (item.title) elementNode.att('title', item.title);
                        break;

                    case 'panel':
                        elementNode = parentNode.ele('panel');
                        if (item.label) elementNode.att('label', item.label);
                        break;

                    case 'question':
                        // Map questions to appropriate clinical form elements based on dataType
                        const questionDataType = item.dataType || 'Text Box';
                        if (questionDataType === 'Radio Buttons') {
                            elementNode = parentNode.ele('radio');
                            if (item.keyField) elementNode.att('name', item.keyField);
                            if (item.label) elementNode.att('label', item.label);
                            if (item.required) elementNode.att('required', 'true');

                            // Add radio items from answers
                            if (item.answers && item.answers.length > 0) {
                                item.answers.forEach((answer) => {
                                    const itemNode = elementNode.ele('item');
                                    itemNode.txt(answer.text || '');
                                    if (answer.value) itemNode.att('value', answer.value);
                                });
                            }
                        } else if (questionDataType === 'Multi Select' || questionDataType === 'List Box') {
                            elementNode = parentNode.ele('list');
                            if (item.keyField) elementNode.att('name', item.keyField);
                            if (item.label) elementNode.att('label', item.label);
                            if (item.required) elementNode.att('required', 'true');

                            // Add list items from answers
                            if (item.answers && item.answers.length > 0) {
                                item.answers.forEach((answer) => {
                                    const itemNode = elementNode.ele('item');
                                    itemNode.txt(answer.text || '');
                                    if (answer.value) itemNode.att('value', answer.value);
                                });
                            }
                        } else {
                            // Default to textbox for other question types
                            elementNode = parentNode.ele('textbox');
                            if (item.keyField) elementNode.att('name', item.keyField);
                            if (item.label) elementNode.att('label', item.label);
                            if (item.required) elementNode.att('required', 'true');
                        }
                        break;

                    case 'field':
                        // Map fields to appropriate clinical form elements
                        const fieldDataType = item.dataType || 'Text Box';
                        if (fieldDataType === 'Date') {
                            elementNode = parentNode.ele('date');
                        } else if (fieldDataType === 'Text Area') {
                            elementNode = parentNode.ele('textarea');
                        } else if (fieldDataType === 'Checkbox') {
                            elementNode = parentNode.ele('check');
                        } else {
                            elementNode = parentNode.ele('textbox');
                        }

                        if (item.keyField) elementNode.att('name', item.keyField);
                        if (item.label) elementNode.att('label', item.label);
                        if (item.required) elementNode.att('required', 'true');
                        break;

                    case 'information':
                    case 'info':
                        elementNode = parentNode.ele('info');
                        if (item.label) elementNode.txt(item.label);
                        break;

                    case 'table':
                        elementNode = parentNode.ele('table');
                        if (item.keyField) elementNode.att('name', item.keyField);
                        if (item.label) elementNode.att('label', item.label);
                        if (item.required) elementNode.att('required', 'true');
                        break;

                    case 'table-field':
                        // Table fields become table columns/elements
                        elementNode = parentNode.ele('textbox');
                        if (item.keyField) elementNode.att('name', item.keyField);
                        if (item.label) elementNode.att('label', item.label);
                        if (item.required) elementNode.att('required', 'true');
                        break;

                    case 'button':
                        elementNode = parentNode.ele('button');
                        if (item.label) elementNode.att('text', item.label);
                        break;

                    case 'notes':
                        elementNode = parentNode.ele('notes');
                        if (item.keyField) elementNode.att('name', item.keyField);
                        if (item.label) elementNode.att('label', item.label);
                        break;

                    default:
                        // Default to textbox for unknown types
                        elementNode = parentNode.ele('textbox');
                        if (item.keyField) elementNode.att('name', item.keyField);
                        if (item.label) elementNode.att('label', item.label);
                        break;
                }

                if (!elementNode) return; // Safety check

                // Add common attributes
                if (item.id && ['group', 'button', 'textbox', 'radio'].includes(elementNode.node.nodeName)) {
                    elementNode.att('id', item.id);
                }

                // Add show/hide conditions if present
                if (item.conditions && item.conditions.length > 0) {
                    // Clinical forms use 'show' attribute for conditional display
                    // This is a simplified implementation - may need more complex logic
                    const showCondition = item.conditions.map(cond =>
                        `{${cond.record || cond.field}} == '${cond.answer || cond.value}'`
                    ).join(' && ');
                    elementNode.att('show', showCondition);
                }

                // Recursively add children
                if (item.children && item.children.length > 0) {
                    addItemsToXml(elementNode, item.children);
                }
            });
        };

        // Add all items to the form
        addItemsToXml(rootForm, droppedItems);

        // Generate the XML string
        const xmlString = rootForm.end({
            prettyPrint: true,
            indent: '  ',
            headless: false,
            allowEmpty: true
        });

        return xmlString;
    } catch (error) {
        return `<!-- Error generating Clinical Form XML: ${error.message} -->`;
    }
}/**
 * Validate clinical form XML structure
 * @param {Array} droppedItems - Array of clinical form items
 * @returns {Object} Validation result with errors and warnings
 */
export function validateClinicalFormStructure(droppedItems) {
    // TODO: Implement clinical form-specific validation rules
    const errors = [];
    const warnings = [];

    // Placeholder validation - add actual clinical form validation logic
    if (droppedItems.length === 0) {
        warnings.push('Empty clinical form');
    }

    // Clinical forms might have specific requirements
    const hasRequiredSections = droppedItems.some(item =>
        item.type === 'page' && item.label?.toLowerCase().includes('patient')
    );

    if (!hasRequiredSections) {
        warnings.push('Consider adding a patient information section');
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Get clinical form-specific export options
 * @returns {Object} Export configuration options
 */
export function getClinicalFormExportOptions() {
    return {
        fileExtension: '.xml',
        mimeType: 'application/xml',
        defaultFilename: 'clinical_form',
        includeMetadata: true,
        formatVersion: '2.0',
        requiresValidation: true,
        includeTimestamp: true
    };
}
