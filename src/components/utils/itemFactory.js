import { generateId } from './id';

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

    // Basic Question components
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

    // Basic Field components
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

    default:
      return null; // Invalid draggedItemId
  }

  return { draggedType, newItem };
};
