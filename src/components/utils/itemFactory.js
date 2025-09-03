import { generateId } from './id';
import { getNextCodeNumber } from './clinicalFormCodeManager';

/**
 * Item Factory Utility
 * 
 * Handles the creation of new questionnaire items based on dragged component IDs.
 * This factory maps dragged item IDs to their corresponding item types and creates
 * properly structured item objects with default values.
 */

/**
 * Creates a new item object based on the dragged item ID
 * @param {string} draggedItemId - The ID of the dragged component from the sidebar
 * @returns {Object} An object containing the draggedType and newItem, or null if invalid
 */
export const createItemFromDraggedId = (draggedItemId) => {
  let newItem;
  let draggedType;

  switch (draggedItemId) {
    case 'form-tag':
      draggedType = 'page';
      newItem = {
        id: generateId('page'),
        type: 'page',
        label: 'Page',
        children: [],
      };
      break;

    case 'section-tag':
      draggedType = 'question';
      newItem = {
        id: generateId('question'),
        type: 'question',
        label: 'Question',
        children: [],
        dataType: 'List Box',
        textRecord: '',
        keyField: '',
        required: false,
        answers: [{ id: generateId('answer'), text: 'Option 1' }],
      };
      break;

    case 'field-tag':
      draggedType = 'field';
      newItem = {
        id: generateId('field'),
        type: 'field',
        label: 'Field',
        children: [],
        dataType: 'Text Box',
        keyField: '',
        required: false,
      };
      break;

    case 'information-tag':
      draggedType = 'information';
      newItem = {
        id: generateId('information'),
        type: 'information',
        label: 'New Information',
        children: [],
      };
      break;

    case 'table-tag':
      draggedType = 'table';
      newItem = {
        id: generateId('table'),
        type: 'table',
        label: 'New Table',
        children: [],
        keyField: '',
        required: false,
        columns: [
          { header: 'Column 1', dataType: 'Text Box', required: false },
        ],
      };
      break;

    case 'table-field-tag':
      draggedType = 'table-field';
      newItem = {
        id: generateId('table-field'),
        type: 'table-field',
        label: 'New Table Field',
        children: [],
        dataType: 'Text Box',
        required: false,
      };
      break;

    case 'list-box-tag':
      draggedType = 'question';
      newItem = {
        id: generateId('question'),
        type: 'question',
        label: 'List Box',
        children: [],
        dataType: 'List Box',
        textRecord: '',
        keyField: '',
        required: false,
        answers: [{ id: generateId('answer'), text: 'Option 1' }],
      };
      break;

    case 'multi-select-tag':
      draggedType = 'question';
      newItem = {
        id: generateId('question'),
        type: 'question',
        label: 'Multi Select',
        children: [],
        dataType: 'Multi Select',
        textRecord: '',
        keyField: '',
        required: false,
        answers: [{ id: generateId('answer'), text: 'Option 1' }],
      };
      break;

    case 'radio-buttons-tag':
      draggedType = 'question';
      newItem = {
        id: generateId('question'),
        type: 'question',
        label: 'Radio Buttons',
        children: [],
        dataType: 'Radio Buttons',
        textRecord: '',
        keyField: '',
        required: false,
        answers: [{ id: generateId('answer'), text: 'Option 1' }],
      };
      break;

    case 'text-box-tag':
      draggedType = 'field';
      newItem = {
        id: generateId('field'),
        type: 'field',
        label: 'Text Box',
        children: [],
        dataType: 'Text Box',
        keyField: '',
        required: false,
      };
      break;

    case 'notes-tag':
      draggedType = 'field';
      newItem = {
        id: generateId('field'),
        type: 'field',
        label: 'Notes',
        children: [],
        dataType: 'Text Area',
        keyField: '',
        required: false,
      };
      break;

    case 'date-tag':
      draggedType = 'field';
      newItem = {
        id: generateId('field'),
        type: 'field',
        label: 'Date',
        children: [],
        dataType: 'Date',
        keyField: '',
        required: false,
      };
      break;

    // Clinical Form (CF) Cases
    case 'cf-button-tag':
      draggedType = 'cf-button';
      newItem = {
        id: generateId('cf-button'),
        type: 'cf-button',
        label: 'Button',
        children: [],
        action: 'Print',
        cfbuttonrequired: 'Ignore',
      };
      break;

    case 'cf-check-tag':
      draggedType = 'cf-checkbox';
      newItem = {
        id: generateId('cf-checkbox'),
        type: 'cf-checkbox',
        label: 'Checkbox',
        children: [],
        code: `${getNextCodeNumber()}`,
        tag: '[Inherit from parent]',
        global: false,
        key: '',
        cfrequired: false,
        width: '',
      };
      break;

    case 'cf-date-tag':
      draggedType = 'cf-date';
      newItem = {
        id: generateId('cf-date'),
        type: 'cf-date',
        label: 'Date',
        children: [],
        dataType: 'Date',
        keyField: '',
        tag: '[Inherit from parent]',
        cfrequired: false,
        width: '',
        code: `${getNextCodeNumber()}`,
      };
      break;

    case 'cf-future-date-tag':
      draggedType = 'cf-future-date';
      newItem = {
        id: generateId('cf-future-date'),
        type: 'cf-future-date',
        label: 'Future Date',
        children: [],
        dataType: 'Future Date',
        keyField: '',
        code: `${getNextCodeNumber()}`,
        tag: '[Inherit from parent]',
        global: false,
        cfrequired: false,
        minDate: 'today',
        dateFormat: 'MM/DD/YYYY',
        width: '',
      };
      break;

    case 'cf-group-tag':
      draggedType = 'cf-group';
      newItem = {
        id: generateId('cf-group'),
        type: 'cf-group',
        label: 'Group',
        children: [],
        tag: '[Inherit from parent]',
      };
      break;

    case 'cf-info-tag':
      draggedType = 'cf-info';
      newItem = {
        id: generateId('cf-info'),
        type: 'cf-info',
        label: 'Information',
        children: [],
      };
      break;

    case 'cf-listbox-tag':
      draggedType = 'cf-listbox';
      newItem = {
        id: generateId('cf-listbox'),
        type: 'cf-listbox',
        label: 'List Box',
        children: [],
        dataType: 'List Box',
        keyField: '',
        code: `${getNextCodeNumber()}`,
        tag: '[Inherit from parent]',
        global: false,
        cfrequired: false,
        width: '',
        options: [{ id: generateId('option'), text: 'Option 1', value: `${getNextCodeNumber()}` }],
      };
      break;

    case 'cf-notes-tag':
      draggedType = 'cf-notes';
      newItem = {
        id: generateId('cf-notes'),
        type: 'cf-notes',
        label: 'Notes',
        children: [],
        dataType: 'Text Area',
        keyField: '',
        code: `${getNextCodeNumber()}`,
        tag: '[Inherit from parent]',
        global: false,
        cfrequired: false,
        width: '',
      };
      break;

    case 'cf-notes-history-tag':
      draggedType = 'cf-notes-history';
      newItem = {
        id: generateId('cf-notes-history'),
        type: 'cf-notes-history',
        label: 'Notes with History',
        children: [],
        dataType: 'Text Area',
        keyField: '',
        code: `${getNextCodeNumber()}`,
        tag: '[Inherit from parent]',
        global: false,
        cfrequired: false,
        width: '',
        showHistory: true,
      };
      break;

    case 'cf-panel-tag':
      draggedType = 'cf-panel';
      newItem = {
        id: generateId('cf-panel'),
        type: 'cf-panel',
        children: [],
        tag: '[Inherit from parent]',
        width: '250',
      };
      break;

    case 'cf-patient-data-tag':
      draggedType = 'cf-patient-data';
      newItem = {
        id: generateId('cf-patient-data'),
        type: 'cf-patient-data',
        label: 'Patient Data Field',
        children: [],
        fieldName: '',
        cfrequired: false,
      };
      break;

    case 'cf-patient-data-all-tag':
      draggedType = 'cf-patient-data-all';
      newItem = {
        id: generateId('cf-patient-data-all'),
        type: 'cf-patient-data-all',
        children: [],
      };
      break;

    case 'cf-prescription-tag':
      draggedType = 'cf-prescription';
      newItem = {
        id: generateId('cf-prescription'),
        type: 'cf-prescription',
        children: [],
      };
      break;

    case 'cf-provided-services-tag':
      draggedType = 'cf-provided-services';
      newItem = {
        id: generateId('cf-provided-services'),
        type: 'cf-provided-services',
        children: [],
      };
      break;

    case 'cf-radio-tag':
      draggedType = 'cf-radio';
      newItem = {
        id: generateId('cf-radio'),
        type: 'cf-radio',
        label: 'Radio Button',
        children: [],
        dataType: 'Radio Buttons',
        keyField: '',
        cfrequired: false,
        code: `${getNextCodeNumber()}`,
        options: [
          { id: generateId('option'), text: 'Option 1', value: `${getNextCodeNumber()}` },
          { id: generateId('option'), text: 'Option 2', value: `${getNextCodeNumber()}` }
        ],
      };
      break;

    case 'cf-snom-text-box':
      draggedType = 'cf-snom-textbox';
      newItem = {
        id: generateId('cf-snom-textbox'),
        type: 'cf-snom-textbox',
        label: 'SNOMED Text Box',
        children: [],
        code: `${getNextCodeNumber()}`,
        key: '',
        tag: '[Inherit from parent]',
        global: 'false',
        subset: '',
        width: '',
        cfrequired: false,
      };
      break;

    case 'cf-table-tag':
      draggedType = 'cf-table';
      newItem = {
        id: generateId('cf-table'),
        type: 'cf-table',
        label: 'Table',
        children: [],
        code: `${getNextCodeNumber()}`,
        key: '',
        tag: '[Inherit from parent]',
        global: '',
        cfrequired: false,
        columns: [
          { header: 'Column 1', dataType: 'Text Box', required: false },
        ],
      };
      break;

    case 'cf-table-field-tag':
      draggedType = 'cf-table-field';
      newItem = {
        id: generateId('cf-table-field'),
        type: 'cf-table-field',
        label: 'Table Field',
        children: [],
        dataType: 'textbox',
        // Common fields that might be needed based on datatype
        code: `${getNextCodeNumber()}`,
        key: '',
        tag: '[Inherit from parent]',
        global: '',
        subset: '', // for cf-snom-textbox
        width: '',
        options: [], // for cf-listbox and cf-radio
      };
      break;

    case 'cf-chart-tag':
      draggedType = 'cf-chart';
      newItem = {
        id: generateId('cf-chart'),
        type: 'cf-chart',
        label: 'Chart',
        chartType: 'Gauge',
        chartMetaFields: [],
        children: [],
      };
      break;

    case 'cf-textbox-tag':
      draggedType = 'cf-textbox';
      newItem = {
        id: generateId('cf-textbox'),
        type: 'cf-textbox',
        label: 'Text Box',
        children: [],
        code: `${getNextCodeNumber()}`,
        key: '',
        tag: '[Inherit from parent]',
        global: '',
        width: '',
      };
      break;

    default:
      return null; // Invalid draggedItemId
  }

  return { draggedType, newItem };
};
