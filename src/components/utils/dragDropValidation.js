/**
 * Validation rules and utilities for drag and drop operations
 * in the questionnaire builder.
 */

/**
 * Determines if a parent type can accept a child type based on questionnaire structure rules
 * @param {string} parentType - The type of the parent container ('root', 'page', 'table', etc.)
 * @param {string} childType - The type of the child item to be added
 * @param {string} builderMode - The current builder mode ('questionnaire' or 'clinical')
 * @returns {boolean} - Whether the parent can accept the child
 */
export const canParentAccept = (parentType, childType, builderMode = 'questionnaire') => {
  // Clinical form component types
  const clinicalFormTypes = [
    'cf-button', 'cf-checkbox', 'cf-date', 'cf-future-date', 'cf-group',
    'cf-info', 'cf-listbox', 'cf-notes', 'cf-notes-history', 'cf-panel',
    'cf-patient-data', 'cf-patient-data-all', 'cf-prescription', 'cf-provided-services',
    'cf-radio', 'cf-snom-textbox', 'cf-table', 'cf-table-field', 'cf-textbox'
  ];

  const rules = {
    root: builderMode === 'clinical'
      ? ['page', ...clinicalFormTypes]
      : ['page'],
    page: ['question', 'field', 'information', 'table'],
    question: [], // Questions should not contain other items - they have their own answers
    field: [],
    information: [],
    table: ['table-field'],
    'table-field': [],
  };
  return (rules[parentType] || []).includes(childType);
};

/**
 * Validates whether a dragged item can be dropped at a specific target location
 * @param {string} draggedType - The type of the item being dragged
 * @param {string} targetId - The ID of the drop target
 * @param {Array} droppedItems - The current array of dropped items
 * @param {Function} findItemById - Function to find an item by ID in the tree
 * @param {Function} getParentContext - Function to get parent context for an item
 * @param {string} builderMode - The current builder mode ('questionnaire' or 'clinical')
 * @returns {Object} - Validation result with 'valid' boolean and optional 'message'
 */
export const validateDrop = (draggedType, targetId, droppedItems, findItemById, getParentContext, builderMode = 'questionnaire') => {
  // Rule 1: Only certain items can be dropped in root level
  if (targetId === 'main-canvas') {
    // Define clinical form component types
    const clinicalFormTypes = [
      'cf-button', 'cf-checkbox', 'cf-date', 'cf-future-date', 'cf-group',
      'cf-info', 'cf-listbox', 'cf-notes', 'cf-notes-history', 'cf-panel',
      'cf-patient-data', 'cf-patient-data-all', 'cf-prescription', 'cf-provided-services',
      'cf-radio', 'cf-snom-textbox', 'cf-table', 'cf-table-field', 'cf-textbox'
    ];

    // Allow pages in both modes, clinical form components only in clinical mode
    const isValidForRoot = draggedType === 'page' ||
      (builderMode === 'clinical' && clinicalFormTypes.includes(draggedType));

    if (!isValidForRoot) {
      const modeText = builderMode === 'clinical' ? 'clinical form components' : 'pages';
      return {
        valid: false,
        message: `Only ${modeText} can be placed at the root level`,
      };
    }
    return { valid: true };
  }

  // Find the target item and its context
  const target = findItemById(droppedItems, targetId);
  if (!target) {
    return { valid: false, message: 'Target not found' };
  }

  const context = getParentContext(droppedItems, targetId);
  if (!context) {
    return { valid: false, message: 'Could not determine parent context' };
  }

  // Rule 2: Items can only be dropped into pages or tables
  if (target.type !== 'page' && target.type !== 'table') {
    return {
      valid: false,
      message: 'Items can only be dropped into pages or tables',
    };
  }

  // Rule 3: Only Questions, Fields, Information, and Tables can be dropped into pages (not other pages or table-fields)
  if (target.type === 'page') {
    if (draggedType === 'page') {
      return {
        valid: false,
        message: 'Pages cannot be dropped inside other pages',
      };
    }
    if (draggedType === 'table-field') {
      return {
        valid: false,
        message: 'Table fields can only be dropped into tables',
      };
    }
    if (
      draggedType === 'question' ||
      draggedType === 'field' ||
      draggedType === 'information' ||
      draggedType === 'table'
    ) {
      return { valid: true };
    }
  }

  // Rule 4: Nothing can be dropped into questions (they are self-contained with answers)
  if (target.type === 'question') {
    return {
      valid: false,
      message:
        'Questions cannot contain other items - they have their own answer options',
    };
  }

  // Rule 5: Nothing can be dropped into fields
  if (target.type === 'field') {
    return {
      valid: false,
      message: 'Fields cannot contain other items',
    };
  }

  // Rule 6: Only table-fields can be dropped into tables
  if (target.type === 'table') {
    if (draggedType !== 'table-field') {
      return {
        valid: false,
        message: 'Only table fields can be dropped into tables',
      };
    }
    return { valid: true };
  }

  return { valid: true };
};
