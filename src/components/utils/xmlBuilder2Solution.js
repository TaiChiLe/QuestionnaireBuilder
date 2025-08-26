import { create } from 'xmlbuilder2';

export function generateOrderedXML(droppedItems) {
    if (droppedItems.length === 0) return '';

    try {
        // Create XML document with xmlbuilder2
        const rootQuestionnaire = create({ version: '1.0', encoding: 'utf-16' })
            .ele('Questionnaire')
            .att('xmlns', 'QuestionnaireSchema.xsd');
        const root = rootQuestionnaire.ele('Pages');

        // Recursive function to add items in order
        const addItemsToXml = (parentNode, items) => {
            items.forEach((item) => {
                let elementNode;

                if (item.type === 'page') {
                    const pageTitle = item.title || item.label || 'Page';
                    elementNode = parentNode.ele('Page').att('title', pageTitle);
                } else if (item.type === 'question') {
                    elementNode = parentNode.ele('Question')
                        .att('record', item.keyField || '')
                        .att('required', item.required ? 'true' : 'false');

                    // Only allow checkbox (Multi Select) and radio for Question
                    let xmlDataType = item.dataType || '';
                    if (xmlDataType === 'Multi Select') xmlDataType = 'checkbox';
                    else if (xmlDataType === 'Radio Buttons') xmlDataType = 'radio';
                    const allowedQuestionTypes = new Set(['checkbox', 'radio']);
                    if (allowedQuestionTypes.has(xmlDataType)) {
                        elementNode.att('datatype', xmlDataType);
                    } // date/textarea NEVER emitted for Question

                    elementNode.ele('Text')
                        .att('record', item.keyField || '')
                        .txt(item.label || '');

                    const answersNode = elementNode.ele('Answers');
                    if (item.answers && item.answers.length > 0) {
                        item.answers.forEach((ans) => {
                            answersNode.ele('Answer').txt(ans.text || '');
                        });
                    } else {
                        // Placeholder blank answer to satisfy schema requirement of at least one Answer
                        answersNode.ele('Answer').txt('');
                    }
                } else if (item.type === 'field') {
                    elementNode = parentNode.ele('Field')
                        .att('record', item.keyField || 'text')
                        .att('required', item.required ? 'true' : 'false');

                    // Only allow date and textarea for Field
                    if (item.dataType === 'Text Area') {
                        elementNode.att('datatype', 'textarea');
                    } else if (item.dataType === 'Date') {
                        elementNode.att('datatype', 'date');
                    } // checkbox/radio NEVER emitted for Field

                    elementNode.txt(item.label || '');
                } else if (item.type === 'information') {
                    elementNode = parentNode.ele('Information').txt(item.label || '');
                } else if (item.type === 'table') {
                    elementNode = parentNode.ele('Table')
                        .att('required', item.required ? 'true' : 'false');

                    elementNode.ele('Text')
                        .att('record', item.keyField || 'table')
                        .txt(item.label || '');
                } else if (item.type === 'table-field') {
                    elementNode = parentNode.ele('Column')
                        .att('header', item.label || '')
                        .att('required', item.required ? 'true' : 'false');

                    if (item.dataType === 'Date') {
                        elementNode.att('datatype', 'date');
                    }
                }

                if (!elementNode) return; // Safety

                if (item.children && item.children.length > 0) {
                    addItemsToXml(elementNode, item.children);
                }

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
        let xmlString = rootQuestionnaire.end({ prettyPrint: true, indent: '  ' });

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
