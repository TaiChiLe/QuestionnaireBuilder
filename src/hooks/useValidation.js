import { useCallback } from 'react';
import { VALIDATION_RULES } from '../constants/dragAndDrop';

export const useValidation = () => {
    const canParentAccept = useCallback((parentType, childType, builderMode = 'questionnaire') => {
        // For clinical forms, use cf-root instead of root for the main canvas
        if (builderMode === 'clinical' && parentType === 'root') {
            parentType = 'cf-root';
        }
        return (VALIDATION_RULES[parentType] || []).includes(childType);
    }, []);

    // Validation rules for drag and drop
    const validateDrop = useCallback(
        (draggedType, targetId, droppedItems, findItemById, getParentContext, builderMode = 'questionnaire') => {
            // Rule 1: Only certain items can be dropped in root level
            if (targetId === 'main-canvas') {
                if (builderMode === 'clinical') {
                    // In clinical form mode, allow any clinical form element at root
                    const clinicalTypes = ['cf-group', 'cf-panel', 'cf-table', 'cf-textbox', 'cf-textarea', 'cf-radio', 'cf-list', 'cf-check', 'cf-date', 'cf-button', 'cf-info', 'cf-notes'];
                    if (!clinicalTypes.includes(draggedType)) {
                        return {
                            valid: false,
                            message: 'Only clinical form elements can be placed at the root level in clinical form mode',
                        };
                    }
                } else {
                    // Only pages can be dropped at root level in questionnaire mode
                    if (draggedType !== 'page') {
                        return {
                            valid: false,
                            message: 'Only pages can be placed at the root level in questionnaire mode',
                        };
                    }
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

            // Builder mode specific validation
            if (builderMode === 'clinical') {
                // Clinical form validation rules
                return validateClinicalFormDrop(draggedType, target, context);
            } else {
                // Questionnaire validation rules (existing logic)
                return validateQuestionnaireDrop(draggedType, target, context);
            }
        },
        []
    );

    const validateQuestionnaireDrop = useCallback((draggedType, target, context) => {
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
    }, []);

    const validateClinicalFormDrop = useCallback((draggedType, target, context) => {
        // Clinical form elements that can contain other elements
        const containerTypes = ['cf-group', 'cf-panel', 'cf-table'];

        // Clinical form leaf elements (cannot contain other elements)
        const leafTypes = ['cf-textbox', 'cf-textarea', 'cf-radio', 'cf-list', 'cf-check', 'cf-date', 'cf-button', 'cf-info', 'cf-notes'];

        // Rule 1: Leaf elements cannot contain other elements
        if (leafTypes.includes(target.type)) {
            return {
                valid: false,
                message: `${target.type} elements cannot contain other items`,
            };
        }

        // Rule 2: Container elements can accept any clinical form element
        if (containerTypes.includes(target.type)) {
            const allClinicalTypes = [...containerTypes, ...leafTypes];
            if (allClinicalTypes.includes(draggedType)) {
                return { valid: true };
            }
            return {
                valid: false,
                message: 'Only clinical form elements can be dropped into clinical form containers',
            };
        }

        // Rule 3: Mixed builder modes not allowed
        const questionnaireTypes = ['page', 'question', 'field', 'information', 'table', 'table-field'];
        if (questionnaireTypes.includes(draggedType) || questionnaireTypes.includes(target.type)) {
            return {
                valid: false,
                message: 'Cannot mix questionnaire and clinical form elements',
            };
        }

        return { valid: true };
    }, []);

    // Helper function to determine if a drop zone is valid during drag
    const isValidDropZone = useCallback(
        (targetId, activeId, droppedItems, findItemById, validateDrop, builderMode = 'questionnaire') => {
            if (!activeId) return true;

            // Get the appropriate sidebar items based on builder mode
            const sidebarItems = builderMode === 'clinical'
                ? [
                    'cf-textbox-tag', 'cf-textarea-tag', 'cf-radio-tag', 'cf-list-tag',
                    'cf-check-tag', 'cf-date-tag', 'cf-button-tag', 'cf-info-tag',
                    'cf-group-tag', 'cf-panel-tag', 'cf-table-tag', 'cf-notes-tag'
                ]
                : [
                    'form-tag', 'section-tag', 'field-tag', 'information-tag',
                    'table-tag', 'table-field-tag', 'list-box-tag', 'multi-select-tag',
                    'radio-buttons-tag', 'text-box-tag', 'notes-tag', 'date-tag'
                ];

            const isSidebarItem = sidebarItems.includes(activeId);

            if (isSidebarItem) {
                let draggedType;

                if (builderMode === 'clinical') {
                    // Clinical form drag types
                    switch (activeId) {
                        case 'cf-textbox-tag':
                            draggedType = 'cf-textbox';
                            break;
                        case 'cf-textarea-tag':
                            draggedType = 'cf-textarea';
                            break;
                        case 'cf-radio-tag':
                            draggedType = 'cf-radio';
                            break;
                        case 'cf-list-tag':
                            draggedType = 'cf-list';
                            break;
                        case 'cf-check-tag':
                            draggedType = 'cf-check';
                            break;
                        case 'cf-date-tag':
                            draggedType = 'cf-date';
                            break;
                        case 'cf-button-tag':
                            draggedType = 'cf-button';
                            break;
                        case 'cf-info-tag':
                            draggedType = 'cf-info';
                            break;
                        case 'cf-group-tag':
                            draggedType = 'cf-group';
                            break;
                        case 'cf-panel-tag':
                            draggedType = 'cf-panel';
                            break;
                        case 'cf-table-tag':
                            draggedType = 'cf-table';
                            break;
                        case 'cf-notes-tag':
                            draggedType = 'cf-notes';
                            break;
                        default:
                            return false;
                    }
                } else {
                    // Questionnaire drag types (existing logic)
                    switch (activeId) {
                        case 'form-tag':
                            draggedType = 'page';
                            break;
                        case 'section-tag':
                            draggedType = 'question';
                            break;
                        case 'field-tag':
                            draggedType = 'field';
                            break;
                        case 'information-tag':
                            draggedType = 'information';
                            break;
                        case 'table-tag':
                            draggedType = 'table';
                            break;
                        case 'table-field-tag':
                            draggedType = 'table-field';
                            break;
                        // Basic Question components
                        case 'list-box-tag':
                        case 'multi-select-tag':
                        case 'radio-buttons-tag':
                            draggedType = 'question';
                            break;
                        // Basic Field components
                        case 'text-box-tag':
                        case 'notes-tag':
                        case 'date-tag':
                            draggedType = 'field';
                            break;
                        default:
                            return false;
                    }
                }

                const validation = validateDrop(draggedType, targetId, droppedItems, findItemById, getParentContext, builderMode);
                return validation.valid;
            } else {
                // Existing item being moved
                const draggedItem = findItemById(droppedItems, activeId);
                if (!draggedItem) return false;

                const validation = validateDrop(
                    draggedItem.type,
                    targetId,
                    droppedItems,
                    findItemById,
                    getParentContext,
                    builderMode
                );
                return validation.valid;
            }
        },
        []
    );

    return {
        canParentAccept,
        validateDrop,
        isValidDropZone,
        validateQuestionnaireDrop,
        validateClinicalFormDrop,
    };
};
