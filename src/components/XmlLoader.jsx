import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';

// Simple robust ID generator (per mount) to avoid collisions when parsing quickly
const createIdGenerator = () => {
  const counters = {};
  return (type) => {
    counters[type] = (counters[type] || 0) + 1;
    // Include counter + random segment. Date.now left for chronological grouping only.
    return `${type}-${Date.now()}-${counters[type]}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;
  };
};

const XmlLoader = forwardRef(({ onLoadXml }, ref) => {
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.xml')) {
      alert('Please select a valid XML file');
      return;
    }

    setIsLoading(true);
    try {
      const text = await file.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');

      // Check for parsing errors
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        throw new Error('Invalid XML format');
      }

      // Parse the XML structure
      const questionnaire = xmlDoc.querySelector('Questionnaire');
      if (!questionnaire) {
        throw new Error('Invalid questionnaire XML format');
      }

      const pages = questionnaire.querySelector('Pages');
      if (!pages) {
        throw new Error('No pages found in XML');
      }

      const parsedItems = parseXmlToItems(pages);
      onLoadXml(parsedItems, text, file.name);

      // Reset the file input
      event.target.value = '';
    } catch (error) {
      alert(`Error loading XML: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const generateId = createIdGenerator();

  const parseXmlToItems = (pagesElement) => {
    const items = [];
    const pageElements = pagesElement.querySelectorAll('Page');

    pageElements.forEach((pageEl) => {
      const pageItem = {
        id: generateId('page'),
        type: 'page',
        title: pageEl.getAttribute('title') || 'Page',
        label: pageEl.getAttribute('title') || 'Page',
        children: [],
      };

      // Parse visibility for page
      const pageVisibility = parseVisibility(pageEl);
      if (pageVisibility) {
        pageItem.visibilityType = pageVisibility.type;
        pageItem.conditions = pageVisibility.conditions;
      }

      // Parse children of the page
      const children = Array.from(pageEl.children);
      children.forEach((child, index) => {
        // Skip Visibility elements as they're handled separately
        if (child.tagName === 'Visibility') return;

        const childItem = parseXmlElement(child, index);
        if (childItem) {
          pageItem.children.push(childItem);
        }
      });

      items.push(pageItem);
    });

    return items;
  };

  const parseXmlElement = (element /*, index */) => {
    const tagName = element.tagName;

    switch (tagName) {
      case 'Question':
        const questionItem = {
          id: generateId('question'),
          type: 'question',
          label: element.querySelector('Text')?.textContent || 'Question',
          dataType: convertXmlDataTypeToDisplay(
            element.getAttribute('datatype')
          ),
          keyField: element.getAttribute('record') || '',
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
        // Get the text content, excluding any Visibility tags
        const fieldTextContent = getTextContentExcludingVisibility(element);

        const fieldItem = {
          id: generateId('field'),
          type: 'field',
          label: fieldTextContent || 'Field',
          dataType: convertXmlFieldDataTypeToDisplay(
            element.getAttribute('datatype')
          ),
          keyField: element.getAttribute('record') || '',
          required: element.getAttribute('required') === 'true',
          children: [],
        };

        // Parse visibility for field
        const fieldVisibility = parseVisibility(element);
        if (fieldVisibility) {
          fieldItem.visibilityType = fieldVisibility.type;
          fieldItem.conditions = fieldVisibility.conditions;
        }

        return fieldItem;

      case 'Information':
        return {
          id: generateId('information'),
          type: 'information',
          label: element.textContent || 'Information',
          children: [],
        };

      case 'Table':
        const tableItem = {
          id: generateId('table'),
          type: 'table',
          label: element.querySelector('Text')?.textContent || 'Table',
          keyField:
            element.querySelector('Text')?.getAttribute('record') || 'table',
          required: element.getAttribute('required') === 'true',
          children: [],
        };

        // Parse table columns
        const columnElements = element.querySelectorAll('Column');
        columnElements.forEach((columnEl) => {
          const columnItem = {
            id: generateId('table-field'),
            type: 'table-field',
            label: columnEl.getAttribute('header') || 'Column',
            dataType: convertXmlFieldDataTypeToDisplay(
              columnEl.getAttribute('datatype')
            ),
            required: columnEl.getAttribute('required') === 'true',
            children: [],
          };
          tableItem.children.push(columnItem);
        });

        // Parse visibility for table
        const tableVisibility = parseVisibility(element);
        if (tableVisibility) {
          tableItem.visibilityType = tableVisibility.type;
          tableItem.conditions = tableVisibility.conditions;
        }

        return tableItem;

      default:
        return null;
    }
  };

  const parseAnswers = (answersElement) => {
    if (!answersElement) {
      return [{ id: generateId('answer'), text: 'Option 1' }];
    }
    const answerElements = answersElement.querySelectorAll('Answer');
    return Array.from(answerElements).map((answerEl) => ({
      id: generateId('answer'),
      text: answerEl.textContent || 'Option',
    }));
  };

  const parseVisibility = (element) => {
    // Only look for direct child Visibility elements, not nested ones
    let visibilityElement = null;

    // Check only direct children, not descendants
    for (const child of element.children) {
      if (child.tagName === 'Visibility') {
        visibilityElement = child;
        break;
      }
    }

    if (!visibilityElement) return null;

    // Check for Any or All type
    const anyElement = visibilityElement.querySelector('Any');
    const allElement = visibilityElement.querySelector('All');

    const visibilityType = anyElement ? 'Any' : allElement ? 'All' : 'Any';
    const conditionsContainer = anyElement || allElement;

    if (!conditionsContainer) return null;

    const conditionElements = conditionsContainer.querySelectorAll('Condition');
    const conditions = Array.from(conditionElements).map((condEl) => ({
      id: generateId('condition'),
      record: condEl.getAttribute('record') || '',
      answer: condEl.getAttribute('answer') || '',
    }));

    return {
      type: visibilityType,
      conditions: conditions,
    };
  };

  const getTextContentExcludingVisibility = (element) => {
    // Clone the element to avoid modifying the original
    const clonedElement = element.cloneNode(true);

    // Remove any Visibility child elements
    const visibilityElements = clonedElement.querySelectorAll('Visibility');
    visibilityElements.forEach((visEl) => visEl.remove());

    // Return the remaining text content
    return clonedElement.textContent.trim();
  };

  const convertXmlDataTypeToDisplay = (xmlDataType) => {
    switch (xmlDataType) {
      case 'checkbox':
      case 'multi-select':
        return 'Multi Select';
      case 'radio':
        return 'Radio Buttons';
      case 'list-box':
      default:
        return 'List Box';
    }
  };

  const convertXmlFieldDataTypeToDisplay = (xmlDataType) => {
    switch (xmlDataType) {
      case 'textarea':
        return 'Text Area';
      case 'date':
        return 'Date';
      default:
        return 'Text Box';
    }
  };

  useImperativeHandle(ref, () => ({
    openFileDialog: () => {
      if (inputRef.current && !isLoading) {
        inputRef.current.click();
      }
    },
    isLoading,
  }));

  return (
    <input
      ref={inputRef}
      type="file"
      accept=".xml"
      onChange={handleFileSelect}
      disabled={isLoading}
      className="hidden"
    />
  );
});

export default XmlLoader;
