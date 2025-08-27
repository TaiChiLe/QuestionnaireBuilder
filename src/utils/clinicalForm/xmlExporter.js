/**
 * Clinical Form XML Exporter
 * Handles XML export specifically for clinical form format
 */

import { generateClinicalFormXML } from './xmlBuilder';

/**
 * Export clinical form XML
 * @param {Array} droppedItems - Array of clinical form items
 * @param {string} formName - Name of the clinical form
 */
export function exportClinicalFormXml(droppedItems, formName) {
    const xmlString = generateClinicalFormXML(droppedItems, formName);

    // Create and download the clinical form XML file
    const blob = new Blob([xmlString], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    const safeName = (formName || 'clinical_form')
        .toString()
        .trim()
        .replace(/[^a-z0-9-_]+/gi, '_')
        .replace(/^_+|_+$/g, '') || 'clinical_form';

    a.download = `${safeName}.xml`;
    a.click();
    URL.revokeObjectURL(url);
}/**
 * Export clinical form with additional options
 * @param {Array} droppedItems - Array of clinical form items
 * @param {string} formName - Name of the clinical form
 * @param {Object} options - Export options
 */
export function exportClinicalFormWithOptions(droppedItems, formName, options = {}) {
    // TODO: Implement clinical form-specific export with enhanced options
    const defaultOptions = {
        includeMetadata: true,
        formatVersion: '2.0',
        compression: false,
        validation: true,
        includeTimestamp: true,
        includePatientInfo: true,
        ...options
    };

    if (defaultOptions.validation) {
        // TODO: Add pre-export validation for clinical forms
        console.log('Validating clinical form before export...');
    }

    if (defaultOptions.includeMetadata) {
        // TODO: Add clinical form metadata to export
        console.log('Including clinical form metadata...');
    }

    if (defaultOptions.includePatientInfo) {
        // TODO: Ensure patient information fields are included
        console.log('Validating patient information fields...');
    }

    exportClinicalFormXml(droppedItems, formName);
}

/**
 * Generate clinical form export preview
 * @param {Array} droppedItems - Array of clinical form items
 * @param {string} formName - Name of the clinical form
 * @returns {Object} Export preview data
 */
export function generateClinicalFormExportPreview(droppedItems, formName) {
    // TODO: Implement clinical form export preview
    const { generateClinicalFormXML } = require('./xmlBuilder');

    const xmlString = generateClinicalFormXML(droppedItems, formName);

    // Clinical form-specific statistics
    const sectionCount = droppedItems.filter(item => item.type === 'page').length;
    const clinicalQuestionCount = droppedItems.filter(item => item.type === 'question').length;
    const clinicalFieldCount = droppedItems.filter(item => item.type === 'field').length;

    return {
        xmlString,
        size: new Blob([xmlString]).size,
        sectionCount,
        clinicalQuestionCount,
        clinicalFieldCount,
        filename: `${formName || 'clinical_form'}.xml`,
        type: 'clinical-form'
    };
}
