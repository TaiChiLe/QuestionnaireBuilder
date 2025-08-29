import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';

// Import parsers for both modes
import { parseXmlToItems, extractQuestionnaireName } from './utils/xmlParser';
import {
  parseClinicalFormXmlToItems,
  extractFormTag,
  isClinicalFormXml,
} from './utils/clinicalFormXmlParser';

const XmlLoader = forwardRef(
  ({ onLoadXml, builderMode = 'questionnaire' }, ref) => {
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

        // Detect XML type and validate against current builder mode
        const isClinicalForm = isClinicalFormXml(text);

        // Auto-switch modes if XML type doesn't match current mode
        let actualMode = builderMode;
        if (builderMode === 'clinical' && !isClinicalForm) {
          // Clinical form mode but questionnaire XML detected - switch to questionnaire mode
          actualMode = 'questionnaire';
        } else if (builderMode === 'questionnaire' && isClinicalForm) {
          // Questionnaire mode but clinical form XML detected - switch to clinical mode
          actualMode = 'clinical';
        }

        let parsedItems;
        let detectedMode;

        if (isClinicalForm) {
          // Parse as clinical form XML
          parsedItems = parseClinicalFormXmlToItems(text);
          detectedMode = 'clinical';
        } else {
          // Parse as questionnaire XML
          const questionnaire = xmlDoc.querySelector('Questionnaire');
          if (!questionnaire) {
            throw new Error('Invalid questionnaire XML format');
          }

          const pages = questionnaire.querySelector('Pages');
          if (!pages) {
            throw new Error('No pages found in XML');
          }

          parsedItems = parseXmlToItems(text);
          detectedMode = 'questionnaire';
        }

        // Pass the detected mode along with the parsed items
        onLoadXml(parsedItems, text, file.name, detectedMode);

        // Reset the file input
        event.target.value = '';
      } catch (error) {
        alert(`Error loading XML: ${error.message}`);
      } finally {
        setIsLoading(false);
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
  }
);

export default XmlLoader;
