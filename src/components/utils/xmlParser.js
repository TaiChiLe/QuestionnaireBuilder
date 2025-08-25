import { generateId } from './id';

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

// Convert XML datatype to display format
const convertXmlDataTypeToDisplay = (xmlDataType) => {
    switch (xmlDataType?.toLowerCase()) {
        case 'text':
            return 'Text';
        case 'integer':
        case 'number':
            return 'Number';
        case 'date':
            return 'Date';
        case 'boolean':
        case 'yes/no':
            return 'Yes/No';
        case 'choice':
        case 'radio':
            return 'Radio Buttons';
        case 'multichoice':
        case 'checkbox':
            return 'Multi Select';
        case 'list-box':
        case 'listbox':
        default:
            return 'List Box';
    }
};

// Get text content excluding visibility tags
const getTextContentExcludingVisibility = (element) => {
    let textContent = '';

    for (const node of element.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
            textContent += node.textContent;
        } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'Visibility') {
            textContent += getTextContentExcludingVisibility(node);
        }
    }

    return textContent.trim();
};

// Parse visibility conditions
const parseVisibility = (element) => {
    const visibilityEl = element.querySelector('Visibility');
    if (!visibilityEl) return null;

    // The visibility type is the first child element of Visibility
    const typeEl = Array.from(visibilityEl.children).find(child => child.tagName !== 'Condition');
    const type = typeEl ? typeEl.tagName : 'show';
    const conditions = [];

    const conditionEls = visibilityEl.querySelectorAll('Condition');
    conditionEls.forEach((condEl) => {
        conditions.push({
            record: condEl.getAttribute('record') || '',
            answer: condEl.getAttribute('answer') || '',
            // Also support legacy format
            field: condEl.getAttribute('field') || condEl.getAttribute('record') || '',
            operator: condEl.getAttribute('operator') || 'equals',
            value: condEl.getAttribute('value') || condEl.getAttribute('answer') || '',
        });
    });

    return { type, conditions };
};

// Parse answers for questions
const parseAnswers = (answersElement) => {
    if (!answersElement) return [];

    const answers = [];
    const answerElements = answersElement.querySelectorAll('Answer');
    const generateIdFn = createIdGenerator();

    answerElements.forEach((answerEl) => {
        answers.push({
            id: generateIdFn('answer'),
            text: answerEl.getAttribute('text') || answerEl.textContent || '',
            value: answerEl.getAttribute('value') || answerEl.textContent || '',
        });
    });

    return answers;
};

// Parse a single XML element
const parseXmlElement = (element, generateIdFn) => {
    const tagName = element.tagName;

    switch (tagName) {
        case 'Question':
            const textElement = element.querySelector('Text');
            const questionItem = {
                id: generateIdFn('question'),
                type: 'question',
                label: textElement?.textContent || 'Question',
                dataType: convertXmlDataTypeToDisplay(
                    element.getAttribute('datatype')
                ),
                keyField: element.getAttribute('record') || '',
                textRecord: textElement?.getAttribute('record') || '',
                required: element.getAttribute('required') === 'true',
                answers: parseAnswers(element.querySelector('Answers')),
                children: [],
            };

            // Parse visibility for question
            const questionVisibility = parseVisibility(element);
            if (questionVisibility) {
                questionItem.visibilityType = questionVisibility.type;
                questionItem.conditions = questionVisibility.conditions;
            }

            return questionItem;

        case 'Field':
            const fieldTextContent = getTextContentExcludingVisibility(element);

            const fieldItem = {
                id: generateIdFn('field'),
                type: 'field',
                label: fieldTextContent || 'Field',
                keyField: element.getAttribute('record') || '',
                required: element.getAttribute('required') === 'true',
                dataType: convertXmlDataTypeToDisplay(element.getAttribute('datatype')),
                children: [],
            };

            // Parse visibility for field
            const fieldVisibility = parseVisibility(element);
            if (fieldVisibility) {
                fieldItem.visibilityType = fieldVisibility.type;
                fieldItem.conditions = fieldVisibility.conditions;
            }

            return fieldItem;

        case 'Group':
            const groupItem = {
                id: generateIdFn('group'),
                type: 'group',
                label: element.getAttribute('label') || 'Group',
                children: [],
            };

            // Parse visibility for group
            const groupVisibility = parseVisibility(element);
            if (groupVisibility) {
                groupItem.visibilityType = groupVisibility.type;
                groupItem.conditions = groupVisibility.conditions;
            }

            // Parse children of the group
            const groupChildren = Array.from(element.children);
            groupChildren.forEach((child) => {
                if (child.tagName === 'Visibility') return;

                const childItem = parseXmlElement(child, generateIdFn);
                if (childItem) {
                    groupItem.children.push(childItem);
                }
            });

            return groupItem;

        case 'Information':
            const informationItem = {
                id: generateIdFn('information'),
                type: 'information',
                label: element.textContent || 'Information',
                children: [],
            };

            // Parse visibility for information
            const informationVisibility = parseVisibility(element);
            if (informationVisibility) {
                informationItem.visibilityType = informationVisibility.type;
                informationItem.conditions = informationVisibility.conditions;
            }

            return informationItem;

        case 'Table':
            const tableTextElement = element.querySelector('Text');
            const tableItem = {
                id: generateIdFn('table'),
                type: 'table',
                label: tableTextElement?.textContent || 'Table',
                keyField: tableTextElement?.getAttribute('record') || '',
                required: element.getAttribute('required') === 'true',
                children: [],
            };

            // Parse visibility for table
            const tableVisibility = parseVisibility(element);
            if (tableVisibility) {
                tableItem.visibilityType = tableVisibility.type;
                tableItem.conditions = tableVisibility.conditions;
            }

            // Parse children of the table (columns)
            const tableChildren = Array.from(element.children);
            tableChildren.forEach((child) => {
                if (child.tagName === 'Visibility' || child.tagName === 'Text') return;

                const childItem = parseXmlElement(child, generateIdFn);
                if (childItem) {
                    tableItem.children.push(childItem);
                }
            });

            return tableItem;

        case 'Column':
            const columnItem = {
                id: generateIdFn('table-field'),
                type: 'table-field',
                label: element.getAttribute('header') || 'Column',
                required: element.getAttribute('required') === 'true',
                dataType: convertXmlDataTypeToDisplay(element.getAttribute('datatype')),
                children: [],
            };

            // Parse visibility for column
            const columnVisibility = parseVisibility(element);
            if (columnVisibility) {
                columnItem.visibilityType = columnVisibility.type;
                columnItem.conditions = columnVisibility.conditions;
            }

            return columnItem;

        default:
            return null;
    }
};

// Parse XML to items structure
export const parseXmlToItems = (xmlString) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
        throw new Error('Invalid XML format: ' + parserError.textContent);
    }

    // Parse the XML structure
    const questionnaire = xmlDoc.querySelector('Questionnaire');
    if (!questionnaire) {
        throw new Error('Invalid questionnaire XML format: Missing Questionnaire root element');
    }

    const pages = questionnaire.querySelector('Pages');
    if (!pages) {
        throw new Error('No pages found in XML');
    }

    const generateIdFn = createIdGenerator();
    const items = [];
    const pageElements = pages.querySelectorAll('Page');

    pageElements.forEach((pageEl, index) => {
        const pageTitle = pageEl.getAttribute('title');
        const pageTitleOrDefault = pageTitle || 'Page';

        const pageItem = {
            id: generateIdFn('page'),
            type: 'page',
            label: pageTitleOrDefault,
            children: [],
        };

        // Only add title property if it was explicitly set in XML and not empty
        if (pageTitle && pageTitle.trim() !== '') {
            pageItem.title = pageTitle;
        }

        // Parse visibility for page
        const pageVisibility = parseVisibility(pageEl);
        if (pageVisibility) {
            pageItem.visibilityType = pageVisibility.type;
            pageItem.conditions = pageVisibility.conditions;
        }

        // Parse children of the page
        const children = Array.from(pageEl.children);

        children.forEach((child) => {
            // Skip Visibility elements as they're handled separately
            if (child.tagName === 'Visibility') return;

            const childItem = parseXmlElement(child, generateIdFn);
            if (childItem) {
                pageItem.children.push(childItem);
            }
        }); items.push(pageItem);
    });

    return items;
};

// Extract questionnaire name from XML
export const extractQuestionnaireName = (xmlString) => {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
        const questionnaire = xmlDoc.querySelector('Questionnaire');
        return questionnaire?.getAttribute('name') || '';
    } catch (error) {
        return '';
    }
};
