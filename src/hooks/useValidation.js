import { useCallback } from 'react';
import { VALIDATION_RULES } from '../constants/dragAndDrop';

export const useValidation = () => {
    const canParentAccept = useCallback((parentType, childType) => {
        return (VALIDATION_RULES[parentType] || []).includes(childType);
    }, []);

    // Validation rules for drag and drop
    const validateDrop = useCallback(
        (draggedType, targetId, droppedItems, findItemById, getParentContext) => {
            // Rule 1: Only certain items can be dropped in root level
            if (targetId === 'main-canvas') {
                // Only pages can be dropped at root level
                if (draggedType !== 'page') {
                    return {
                        valid: false,
                        message: 'Only pages can be placed at the root level',
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
        },
        []
    );

    // Helper function to determine if a drop zone is valid during drag
    const isValidDropZone = useCallback(
        (targetId, activeId, droppedItems, findItemById, validateDrop) => {
            if (!activeId) return true;

            // Check if dragging from sidebar
            const isSidebarItem = [
                'form-tag',
                'section-tag',
                'field-tag',
                'information-tag',
                'table-tag',
                'table-field-tag',
                // Basic components
                'list-box-tag',
                'multi-select-tag',
                'radio-buttons-tag',
                'text-box-tag',
                'notes-tag',
                'date-tag',
            ].includes(activeId);

            if (isSidebarItem) {
                let draggedType;
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

                const validation = validateDrop(draggedType, targetId, droppedItems);
                return validation.valid;
            } else {
                // Existing item being moved
                const draggedItem = findItemById(droppedItems, activeId);
                if (!draggedItem) return false;

                const validation = validateDrop(
                    draggedItem.type,
                    targetId,
                    droppedItems
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
    };
};
