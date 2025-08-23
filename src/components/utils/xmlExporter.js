import { generateOrderedXML } from './xmlBuilder2Solution';

export function exportXmlStructure(droppedItems) {
    const xmlString = generateOrderedXML(droppedItems);

    console.log('Generated XML:', xmlString);

    // Create and download the XML file
    const blob = new Blob([xmlString], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'xml-structure.xml';
    a.click();
    URL.revokeObjectURL(url);
}