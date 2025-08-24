import { generateOrderedXML } from './xmlBuilder2Solution';

export function exportXmlStructure(droppedItems, questionnaireName) {
    const xmlString = generateOrderedXML(droppedItems);

    // Create and download the XML file
    const blob = new Blob([xmlString], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = (questionnaireName || 'questionnaire')
        .toString()
        .trim()
        .replace(/[^a-z0-9-_]+/gi, '_')
        .replace(/^_+|_+$/g, '') || 'questionnaire';
    a.download = `${safeName}.xml`;
    a.click();
    URL.revokeObjectURL(url);
}