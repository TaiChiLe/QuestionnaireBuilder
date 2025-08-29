import React, { useState, useCallback } from 'react';

// Import parsers for both modes
import { parseXmlToItems, extractQuestionnaireName } from './utils/xmlParser';
import {
  parseClinicalFormXmlToItems,
  extractFormTag,
  isClinicalFormXml,
} from './utils/clinicalFormXmlParser';

// Modal for pasting raw XML text and parsing it into the questionnaire structure
const PasteXmlModal = ({ isOpen, onClose, onLoadXml, builderMode }) => {
  const [xmlText, setXmlText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setXmlText('');
    setError('');
    setIsParsing(false);
  };

  const handleClose = () => {
    if (isParsing) return; // prevent close mid-parse
    reset();
    onClose();
  };

  const parse = useCallback(() => {
    setIsParsing(true);
    setError('');
    try {
      const text = xmlText.trim();
      if (!text) {
        throw new Error('XML text is empty');
      }
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) throw new Error('Invalid XML format');

      // Detect XML type and use appropriate parser
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
        if (!questionnaire) throw new Error('Missing <Questionnaire> root');
        const pages = questionnaire.querySelector('Pages');
        if (!pages) throw new Error('Missing <Pages> section');

        parsedItems = parseXmlToItems(text);
        detectedMode = 'questionnaire';
      }

      // Pass the detected mode along with the parsed items
      onLoadXml(parsedItems, text, detectedMode);
      reset();
      onClose();
    } catch (e) {
      setError(e.message || 'Failed to parse XML');
    } finally {
      setIsParsing(false);
    }
  }, [xmlText, onLoadXml, onClose]);

  if (!isOpen) return null;

  const parseXmlElement = (element) => {
    const tagName = element.tagName;
    switch (tagName) {
      case 'Question': {
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
        const qVis = parseVisibility(element);
        if (qVis) {
          questionItem.visibilityType = qVis.type;
          questionItem.conditions = qVis.conditions;
        }
        return questionItem;
      }
      case 'Field': {
        const fieldText = getTextContentExcludingVisibility(element);
        const fieldItem = {
          id: generateId('field'),
          type: 'field',
          label: fieldText || 'Field',
          dataType: convertXmlFieldDataTypeToDisplay(
            element.getAttribute('datatype')
          ),
          keyField: element.getAttribute('record') || '',
          required: element.getAttribute('required') === 'true',
          children: [],
        };
        const fVis = parseVisibility(element);
        if (fVis) {
          fieldItem.visibilityType = fVis.type;
          fieldItem.conditions = fVis.conditions;
        }
        return fieldItem;
      }
      case 'Information':
        return {
          id: generateId('information'),
          type: 'information',
          label: element.textContent || 'Information',
          children: [],
        };
      case 'Table': {
        const tableItem = {
          id: generateId('table'),
          type: 'table',
          label: element.querySelector('Text')?.textContent || 'Table',
          keyField:
            element.querySelector('Text')?.getAttribute('record') || 'table',
          required: element.getAttribute('required') === 'true',
          children: [],
        };
        const columnElements = element.querySelectorAll('Column');
        columnElements.forEach((colEl) => {
          tableItem.children.push({
            id: generateId('table-field'),
            type: 'table-field',
            label: colEl.getAttribute('header') || 'Column',
            dataType: convertXmlFieldDataTypeToDisplay(
              colEl.getAttribute('datatype')
            ),
            required: colEl.getAttribute('required') === 'true',
            children: [],
          });
        });
        const tVis = parseVisibility(element);
        if (tVis) {
          tableItem.visibilityType = tVis.type;
          tableItem.conditions = tVis.conditions;
        }
        return tableItem;
      }
      default:
        return null;
    }
  };

  const parseAnswers = (answersElement) => {
    if (!answersElement)
      return [{ id: generateId('answer'), text: 'Option 1' }];
    const answerElements = answersElement.querySelectorAll('Answer');
    return Array.from(answerElements).map((ans) => ({
      id: generateId('answer'),
      text: ans.textContent || 'Option',
    }));
  };

  const parseVisibility = (element) => {
    let visibilityElement = null;
    for (const child of element.children) {
      if (child.tagName === 'Visibility') {
        visibilityElement = child;
        break;
      }
    }
    if (!visibilityElement) return null;
    const anyElement = visibilityElement.querySelector('Any');
    const allElement = visibilityElement.querySelector('All');
    const visibilityType = anyElement ? 'Any' : allElement ? 'All' : 'Any';
    const container = anyElement || allElement;
    if (!container) return null;
    const conditionElements = container.querySelectorAll('Condition');
    const conditions = Array.from(conditionElements).map((cond) => ({
      id: generateId('condition'),
      record: cond.getAttribute('record') || '',
      answer: cond.getAttribute('answer') || '',
    }));
    return { type: visibilityType, conditions };
  };

  const getTextContentExcludingVisibility = (element) => {
    const clone = element.cloneNode(true);
    clone.querySelectorAll('Visibility').forEach((vis) => vis.remove());
    return clone.textContent.trim();
  };

  const convertXmlDataTypeToDisplay = (xmlType) => {
    switch (xmlType) {
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

  const convertXmlFieldDataTypeToDisplay = (xmlType) => {
    switch (xmlType) {
      case 'textarea':
        return 'Text Area';
      case 'date':
        return 'Date';
      default:
        return 'Text Box';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[1200]">
      <div className="bg-white rounded shadow-xl w-full max-w-3xl p-6 relative">
        <h2 className="m-0 mb-4 text-xl font-semibold text-gray-800">
          Paste XML
        </h2>
        <textarea
          className="w-full h-64 border border-gray-300 rounded p-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          placeholder="Paste the Questionnaire XML here..."
          value={xmlText}
          onChange={(e) => setXmlText(e.target.value)}
          disabled={isParsing}
        />
        {error && (
          <div className="mt-3 text-red-700 text-sm bg-red-50 border border-red-200 rounded p-2">
            {error}
          </div>
        )}
        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
            disabled={isParsing}
          >
            Cancel
          </button>
          <button
            onClick={parse}
            className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isParsing}
          >
            {isParsing ? 'Parsing...' : 'Parse & Load'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasteXmlModal;
