/**
 * Validation rules and utilities for drag and drop operations
 * in the questionnaire builder.
 */

/**
 * Clinical form component types (can be placed at root level)
 */
const CLINICAL_FORM_TYPES = [
  'cf-button', 'cf-checkbox', 'cf-date', 'cf-future-date', 'cf-group',
  'cf-info', 'cf-listbox', 'cf-notes', 'cf-notes-history', 'cf-panel',
  'cf-patient-data', 'cf-patient-data-all', 'cf-prescription', 'cf-provided-services',
  'cf-radio', 'cf-snom-textbox', 'cf-table', 'cf-textbox'
];

/**
 * All clinical form component types (including table fields)
 */
const ALL_CLINICAL_FORM_TYPES = [
  ...CLINICAL_FORM_TYPES,
  'cf-table-field'
];

/**
 * Questionnaire component types
 */
const QUESTIONNAIRE_TYPES = [
  'page', 'question', 'field', 'information', 'table', 'table-field'
];

/**
 * Determines if a parent type can accept a child type based on builder mode and structure rules
 * @param {string} parentType - The type of the parent container ('root', 'page', 'table', etc.)
 * @param {string} childType - The type of the child item to be added
 * @param {string} builderMode - The current builder mode ('questionnaire' or 'clinical')
 * @returns {boolean} - Whether the parent can accept the child
 */
export const canParentAccept = (parentType, childType, builderMode = 'questionnaire') => {
  if (builderMode === 'clinical') {
    return canParentAcceptClinical(parentType, childType);
  } else {
    return canParentAcceptQuestionnaire(parentType, childType);
  }
};

/**
 * Clinical Form mode: Parent-child acceptance rules
 */
const canParentAcceptClinical = (parentType, childType) => {
  const rules = {
    root: CLINICAL_FORM_TYPES, // Root can only accept clinical form components (excluding table fields)
    'cf-group': ALL_CLINICAL_FORM_TYPES, // cf-group can contain any clinical form component including table fields
    'cf-panel': ALL_CLINICAL_FORM_TYPES, // cf-panel can contain any clinical form component including table fields
    'cf-table': ['cf-table-field'], // cf-table only accepts cf-table-field
    'cf-table-field': [], // CF table fields are self-contained
  };

  // Add rules for other CF components that don't accept children
  ALL_CLINICAL_FORM_TYPES.forEach(type => {
    if (!rules[type]) {
      rules[type] = [];
    }
  });

  return (rules[parentType] || []).includes(childType);
};/**
 * Questionnaire mode: Parent-child acceptance rules
 */
const canParentAcceptQuestionnaire = (parentType, childType) => {
  const rules = {
    root: ['page'], // Only pages at root level
    page: ['question', 'field', 'information', 'table'], // Pages accept questionnaire components
    question: [], // Questions are self-contained
    field: [], // Fields are self-contained
    information: [], // Information is self-contained
    table: ['table-field'], // Tables accept table-fields
    'table-field': [], // Table fields are self-contained
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
  if (builderMode === 'clinical') {
    return validateDropClinical(draggedType, targetId, droppedItems, findItemById, getParentContext);
  } else {
    return validateDropQuestionnaire(draggedType, targetId, droppedItems, findItemById, getParentContext);
  }
};

/**
 * Clinical Form mode: Validates drop operations for clinical forms
 */
const validateDropClinical = (draggedType, targetId, droppedItems, findItemById, getParentContext) => {
  // Rule 1: Root level validation for clinical forms - only CF components allowed
  if (targetId === 'main-canvas') {
    if (!CLINICAL_FORM_TYPES.includes(draggedType)) {
      return {
        valid: false,
        message: 'Only clinical form components can be placed at the root level in clinical form mode',
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

  // Rule 2: Container validation for clinical forms - only CF containers allowed
  const validContainers = ['cf-group', 'cf-panel', 'cf-table'];
  if (!validContainers.includes(target.type)) {
    return {
      valid: false,
      message: 'Items can only be dropped into clinical form groups, panels, or tables',
    };
  }

  // Rule 3: Clinical Form Groups (cf-group)
  if (target.type === 'cf-group') {
    if (!ALL_CLINICAL_FORM_TYPES.includes(draggedType)) {
      return {
        valid: false,
        message: 'Only clinical form components can be dropped into clinical form groups',
      };
    }
    return { valid: true };
  }

  // Rule 4: Clinical Form Panels (cf-panel) - same as cf-group
  if (target.type === 'cf-panel') {
    if (!ALL_CLINICAL_FORM_TYPES.includes(draggedType)) {
      return {
        valid: false,
        message: 'Only clinical form components can be dropped into clinical form panels',
      };
    }
    return { valid: true };
  }

  // Rule 5: Clinical Form Tables (cf-table)
  if (target.type === 'cf-table') {
    if (draggedType !== 'cf-table-field') {
      return {
        valid: false,
        message: 'Only clinical form table fields can be dropped into clinical form tables',
      };
    }
    return { valid: true };
  }

  // Rule 6: Self-contained CF components cannot accept children
  const selfContained = [
    'cf-button', 'cf-checkbox', 'cf-date', 'cf-future-date', 'cf-info',
    'cf-listbox', 'cf-notes', 'cf-notes-history',
    'cf-patient-data', 'cf-patient-data-all', 'cf-prescription',
    'cf-provided-services', 'cf-radio', 'cf-snom-textbox', 'cf-table-field', 'cf-textbox'
  ];

  if (selfContained.includes(target.type)) {
    return {
      valid: false,
      message: `${target.type} components cannot contain other items`,
    };
  }

  return { valid: true };
};/**
 * Questionnaire mode: Validates drop operations for traditional questionnaires
 */
const validateDropQuestionnaire = (draggedType, targetId, droppedItems, findItemById, getParentContext) => {
  // Rule 1: Root level validation for questionnaires
  if (targetId === 'main-canvas') {
    if (draggedType !== 'page') {
      return {
        valid: false,
        message: 'Only pages can be placed at the root level in questionnaire mode',
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

  // Rule 2: Container validation for questionnaires
  const validContainers = ['page', 'table'];
  if (!validContainers.includes(target.type)) {
    return {
      valid: false,
      message: 'Items can only be dropped into pages or tables',
    };
  }

  // Rule 3: Page containers in questionnaire mode
  if (target.type === 'page') {
    const validForPage = ['question', 'field', 'information', 'table'];

    if (draggedType === 'page') {
      return {
        valid: false,
        message: 'Pages cannot be dropped inside other pages',
      };
    }

    if (!validForPage.includes(draggedType)) {
      return {
        valid: false,
        message: 'Only questions, fields, information, and tables can be dropped into pages',
      };
    }

    return { valid: true };
  }

  // Rule 4: Table containers
  if (target.type === 'table') {
    if (draggedType !== 'table-field') {
      return {
        valid: false,
        message: 'Only table fields can be dropped into tables',
      };
    }
    return { valid: true };
  }

  // Rule 5: Self-contained components
  const selfContained = ['question', 'field', 'information', 'table-field'];
  if (selfContained.includes(target.type)) {
    return {
      valid: false,
      message: `${target.type}s cannot contain other items`,
    };
  }

  return { valid: true };
};
