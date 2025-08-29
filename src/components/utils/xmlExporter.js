import { generateOrderedXML } from './xmlBuilder2Solution';
import { generateClinicalFormXML } from './clinicalFormXmlGenerator';

export function exportXmlStructure(droppedItems, questionnaireName, builderMode = 'questionnaire') {
    const xmlString = builderMode === 'clinical'
        ? generateClinicalFormXML(droppedItems)
        : generateOrderedXML(droppedItems);

    // Create and download the XML file
    const blob = new Blob([xmlString], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = (questionnaireName || (builderMode === 'clinical' ? 'clinical-form' : 'questionnaire'))
        .toString()
        .trim()
        .replace(/[^a-z0-9-_]+/gi, '_')
        .replace(/^_+|_+$/g, '') || (builderMode === 'clinical' ? 'clinical-form' : 'questionnaire');
    a.download = `${safeName}.xml`;
    a.click();
    URL.revokeObjectURL(url);
}