import { create } from 'xmlbuilder2';

export function generateOrderedXML(droppedItems) {
    if (droppedItems.length === 0) return '';

    try {
        // Create XML document with xmlbuilder2
        const root = create({ version: '1.0', encoding: 'utf-16' })
            .ele('Questionnaire')
            .att('xmlns', 'QuestionnaireSchema.xsd')
            .ele('Pages');

        // Recursive function to add items in order
        const addItemsToXml = (parentNode, items) => {
            items.forEach((item) => {
                let elementNode;

                // Create the appropriate XML element
                if (item.type === 'page') {
                    elementNode = parentNode.ele('Page').att('title', item.title || '');
                } else if (item.type === 'question') {
                    elementNode = parentNode.ele('Question')
                        .att('record', item.keyField || '')
                        .att('required', item.required ? 'true' : 'false');

                    // Add datatype attribute if not default
                    let xmlDataType = item.dataType || 'List Box';
                    if (xmlDataType === 'Multi Select') {
                        xmlDataType = 'checkbox';
                    } else if (xmlDataType === 'List Box') {
                        xmlDataType = 'list-box';
                    } else if (xmlDataType === 'Radio Buttons') {
                        xmlDataType = 'radio';
                    }

                    if (xmlDataType.toLowerCase() !== 'list-box') {
                        elementNode.att('datatype', xmlDataType.toLowerCase());
                    }

                    // Add Text element
                    elementNode.ele('Text')
                        .att('record', item.keyField || '')
                        .txt(item.label || '');

                    // Add answers if they exist
                    if (item.answers && item.answers.length > 0) {
                        const answersNode = elementNode.ele('Answers');
                        item.answers.forEach((ans) => {
                            answersNode.ele('Answer').txt(ans.text);
                        });
                    }
                } else if (item.type === 'field') {
                    elementNode = parentNode.ele('Field')
                        .att('record', item.keyField || 'text')
                        .att('required', item.required ? 'true' : 'false');

                    // Add datatype attribute for non-textbox fields
                    if (item.dataType === 'Text Area') {
                        elementNode.att('datatype', 'textarea');
                    } else if (item.dataType === 'Date') {
                        elementNode.att('datatype', 'date');
                    }

                    // Add text content
                    elementNode.txt(item.label || '');
                } else if (item.type === 'information') {
                    elementNode = parentNode.ele('Information').txt(item.label || '');
                } else if (item.type === 'table') {
                    elementNode = parentNode.ele('Table')
                        .att('required', item.required ? 'true' : 'false');

                    // Add Text element
                    elementNode.ele('Text')
                        .att('record', item.keyField || 'table')
                        .txt(item.label || '');
                } else if (item.type === 'table-field') {
                    elementNode = parentNode.ele('Column')
                        .att('header', item.label || '')
                        .att('required', item.required ? 'true' : 'false');

                    // Add datatype attribute for non-textbox table-fields
                    if (item.dataType === 'Date') {
                        elementNode.att('datatype', 'date');
                    }
                }

                // Add children if they exist
                if (item.children && item.children.length > 0) {
                    addItemsToXml(elementNode, item.children);
                }

                // Add visibility after children
                if (item.conditions && item.conditions.length > 0) {
                    const visibilityType = item.visibilityType || 'Any';
                    const visibilityNode = elementNode.ele('Visibility').ele(visibilityType);

                    item.conditions.forEach((condition) => {
                        visibilityNode.ele('Condition')
                            .att('record', condition.record || '')
                            .att('answer', condition.answer || '');
                    });
                }
            });
        };

        // Add all items to the Pages element
        addItemsToXml(root, droppedItems);

        // Generate the XML string
        let xmlString = root.end({ prettyPrint: true, indent: '  ' });

        // Post-process to make Field elements single-line
        xmlString = xmlString.replace(
            /<Field([^>]*)>\s*([\s\S]*?)\s*<\/Field>/g,
            (match, attributes, content) => {
                const singleLineContent = content
                    .replace(/\s*\n\s*/g, '')
                    .replace(/\s+/g, ' ')
                    .trim();
                return `<Field${attributes}>${singleLineContent}</Field>`;
            }
        );

        return xmlString;
    } catch (error) {
        return `<!-- Error generating XML: ${error.message} -->`;
    }
}
