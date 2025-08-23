import { useState, useMemo, useCallback } from 'react';
import { DndContext, pointerWithin, DragOverlay } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import DraggableItem from './components/DraggableItem';
import DroppableArea from './components/DroppableArea';
import DroppableItem from './components/DroppableItem';
import EditModal from './components/EditModal';
import WarningModal from './components/WarningModal';
import RemoveConfirmationModal from './components/RemoveConfirmationModal';
import NewXmlModal from './components/NewXmlModal';
import PreviewSection from './components/PreviewSection';
import XmlLoader from './components/XmlLoader';
import { generateOrderedXML } from './components/utils/xmlBuilder2Solution';
import { exportXmlStructure } from './components/utils/xmlExporter';

// The central state to represent the XML tree
const initialXmlTree = {};

function App() {
  const [xmlTree, setXmlTree] = useState(initialXmlTree);
  const [droppedItems, setDroppedItems] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [isValidDrop, setIsValidDrop] = useState(true); // Track if current drag is valid
  const [editingItem, setEditingItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showNewXmlModal, setShowNewXmlModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);

  // Function to show warning modal
  const showWarning = useCallback((message) => {
    setWarningMessage(message);
    setShowWarningModal(true);
  }, []);

  // Function to close warning modal
  const closeWarning = useCallback(() => {
    setShowWarningModal(false);
    setWarningMessage('');
  }, []);

  // Function to show remove confirmation
  const showRemoveConfirmation = useCallback((itemId) => {
    setItemToRemove({ id: itemId });
    setShowConfirmModal(true);
  }, []);

  // Function to close remove confirmation
  const closeRemoveConfirmation = useCallback(() => {
    setShowConfirmModal(false);
    setItemToRemove(null);
  }, []);

  // Real-time XML generation using xmlbuilder2 for proper ordering
  const currentXmlString = useMemo(() => {
    return generateOrderedXML(droppedItems);
  }, [droppedItems]);

  // Generate HTML preview from the structure

  // Generate HTML preview from the structure
  const currentHtmlString = useMemo(() => {
    if (droppedItems.length === 0) return '';

    const convertItemsToHtml = (items, level = 0) => {
      return items
        .map((item) => {
          const indent = '  '.repeat(level);
          let html = '';

          switch (item.type) {
            case 'page':
              html = `${indent}<div style="margin: 20px 0; padding: 20px; background-color: #ffffff; font-family: Arial, sans-serif;" data-id="${item.id}">\n`;
              html += `${indent}  <h2 style="margin: 0 0 10px 0; font-size: 18px; font-weight: bold; color: #333;">${
                item.title || item.label
              }</h2>\n`;
              html += `${indent}  <div style="background-color: #2196f3; height: 20px; margin-bottom: 20px; border-radius: 2px;"></div>\n`;
              if (item.children && item.children.length > 0) {
                html += convertItemsToHtml(item.children, level + 1);
              }
              html += `${indent}</div>\n`;
              break;
            case 'question':
              html = `${indent}<div style="margin: 15px 0;" data-id="${item.id}">\n`;
              html += `${indent}  <label style="display: block; margin-bottom: 8px; font-weight: normal; color: #333; font-size: 14px;">${
                item.label
              }${
                item.required ? ' <span style="color: #f44336;">*</span>' : ''
              }</label>\n`;

              if (item.answers && item.answers.length > 0) {
                if (item.dataType === 'List Box') {
                  // Dropdown select
                  html += `${indent}  <select name="${item.id}" style="width: 100%; padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px; background-color: white; font-size: 14px;">\n`;
                  html += `${indent}    <option value="">-- Select --</option>\n`;
                  item.answers.forEach((answer) => {
                    html += `${indent}    <option value="${answer.id}">${answer.text}</option>\n`;
                  });
                  html += `${indent}  </select>\n`;
                } else if (item.dataType === 'Multi Select') {
                  // Checkboxes
                  html += `${indent}  <div style="margin: 8px 0;">\n`;
                  item.answers.forEach((answer) => {
                    html += `${indent}    <label style="display: block; margin: 6px 0; cursor: pointer; font-weight: normal;">\n`;
                    html += `${indent}      <input type="checkbox" name="${item.id}" value="${answer.id}" style="margin-right: 8px;" />\n`;
                    html += `${indent}      ${answer.text}\n`;
                    html += `${indent}    </label>\n`;
                  });
                  html += `${indent}  </div>\n`;
                } else {
                  // Radio buttons
                  html += `${indent}  <div style="margin: 8px 0;">\n`;
                  item.answers.forEach((answer) => {
                    html += `${indent}    <label style="display: block; margin: 6px 0; cursor: pointer; font-weight: normal;">\n`;
                    html += `${indent}      <input type="radio" name="${item.id}" value="${answer.id}" style="margin-right: 8px;" />\n`;
                    html += `${indent}      ${answer.text}\n`;
                    html += `${indent}    </label>\n`;
                  });
                  html += `${indent}  </div>\n`;
                }
              }

              if (item.children && item.children.length > 0) {
                html += convertItemsToHtml(item.children, level + 1);
              }
              html += `${indent}</div>\n`;
              break;
            case 'field':
              html = `${indent}<div style="margin: 15px 0;" data-id="${item.id}">\n`;
              html += `${indent}  <label style="display: block; margin-bottom: 8px; font-weight: normal; color: #333; font-size: 14px;">${
                item.label
              }${
                item.required ? ' <span style="color: #f44336;">*</span>' : ''
              }</label>\n`;

              if (item.dataType === 'Date') {
                html += `${indent}  <input type="text" name="${item.id}" placeholder="dd/mm/yyyy" style="width: 100%; padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;" />\n`;
              } else if (item.dataType === 'Text Area') {
                html += `${indent}  <textarea name="${item.id}" placeholder="type here" rows="4" style="width: 100%; padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; resize: vertical;" ></textarea>\n`;
              } else {
                // Text Box (default)
                html += `${indent}  <input type="text" name="${item.id}" placeholder="type here" style="width: 100%; padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;" />\n`;
              }

              html += `${indent}</div>\n`;
              break;
            case 'information':
              html = `${indent}<div style="width: 100%;padding-bottom: 14px;">${item.label}</div>\n`;
              break;
            case 'table':
              html = `${indent}<div style="margin: 15px 0;" data-id="${item.id}">\n`;
              html += `${indent}  <label style="display: block; margin-bottom: 8px; font-weight: normal; color: #333; font-size: 14px;">${
                item.label
              }${
                item.required ? ' <span style="color: #f44336;">*</span>' : ''
              }</label>\n`;

              // Create proper HTML table
              if (item.children && item.children.length > 0) {
                html += `${indent}  <table style="width: 100%; border-collapse: collapse; border: 1px solid #ccc; background-color: white;">\n`;

                // Table header
                html += `${indent}    <thead>\n`;
                html += `${indent}      <tr>\n`;
                item.children.forEach((field) => {
                  html += `${indent}        <th style="padding: 12px; border: 1px solid #ccc; text-align: left; font-weight: normal; color: #333;">${
                    field.label
                  }${
                    field.required
                      ? ' <span style="color: #f44336;">*</span>'
                      : ''
                  }</th>\n`;
                });
                // Add delete column header
                html += `${indent}        <th style="padding: 12px; border: 1px solid #ccc; text-align: center; font-weight: normal; color: #333; width: 50px;"></th>\n`;
                html += `${indent}      </tr>\n`;
                html += `${indent}    </thead>\n`;

                // Table body with sample row
                html += `${indent}    <tbody>\n`;
                html += `${indent}      <tr>\n`;
                item.children.forEach((field) => {
                  html += `${indent}        <td style="padding: 12px; border: 1px solid #ccc;">\n`;
                  if (field.dataType === 'Date') {
                    html += `${indent}          <input type="text" placeholder="dd/mm/yyyy" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 3px; font-size: 14px;" />\n`;
                  } else {
                    html += `${indent}          <input type="text" placeholder="type here" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 3px; font-size: 14px;" />\n`;
                  }
                  html += `${indent}        </td>\n`;
                });
                // Add delete column with recycle bin icon
                html += `${indent}        <td style="padding: 12px; border: 1px solid #ccc; text-align: center;">\n`;
                html += `${indent}          <span style="font-size: 16px; color: #666;">🗑️</span>\n`;
                html += `${indent}        </td>\n`;
                html += `${indent}      </tr>\n`;
                html += `${indent}    </tbody>\n`;
                html += `${indent}  </table>\n`;

                // Add button for adding rows
                html += `${indent}  <button style="margin-top: 8px; padding: 6px 12px; background-color: #6c757d; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 12px;">+ Add</button>\n`;
              } else {
                // Empty table placeholder
                html += `${indent}  <div style="border: 1px solid #ccc; padding: 20px; background-color: #f9f9f9; border-radius: 4px; text-align: center; color: #666;">\n`;
                html += `${indent}    <em>Empty table - add table fields to see columns</em>\n`;
                html += `${indent}  </div>\n`;
              }

              html += `${indent}</div>\n`;
              break;
            case 'table-field':
              html = `${indent}<div style="margin: 8px 0; padding: 8px; border: 1px solid #ddd; border-radius: 3px; background-color: #fafafa;" data-id="${item.id}">\n`;
              html += `${indent}  <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Table Field</div>\n`;
              html += `${indent}  <div style="font-weight: 500; color: #333;">${
                item.label
              }${
                item.required ? ' <span style="color: #f44336;">*</span>' : ''
              }</div>\n`;
              if (item.datatype && item.datatype !== 'Text Box') {
                html += `${indent}  <div style="font-size: 11px; color: #888; margin-top: 2px;">Type: ${item.datatype}</div>\n`;
              }
              html += `${indent}</div>\n`;
              break;
            default:
              html = `${indent}<div style="margin: 10px 0; padding: 10px; border: 1px solid #ccc; border-radius: 4px;" data-id="${item.id}">${item.label}</div>\n`;
          }

          return html;
        })
        .join('');
    };

    return convertItemsToHtml(droppedItems);
  }, [droppedItems]);

  function handleDragStart(event) {
    setActiveId(event.active.id);
    setIsValidDrop(true); // Reset validation state
  }

  // Handle drag over to check validation
  function handleDragOver(event) {
    const { active, over } = event;

    if (!over || !active) {
      setIsValidDrop(true);
      return;
    }

    // Check if this is a sidebar item being dragged
    const isSidebarItem = [
      'form-tag',
      'section-tag',
      'field-tag',
      'information-tag',
      'table-tag',
      'table-field-tag',
    ].includes(active.id);

    if (isSidebarItem) {
      // For sidebar items, use normal validation
      let draggedType = 'page'; // default
      if (active.id === 'section-tag') draggedType = 'question';
      if (active.id === 'field-tag') draggedType = 'field';
      if (active.id === 'information-tag') draggedType = 'information';
      if (active.id === 'table-tag') draggedType = 'table';
      if (active.id === 'table-field-tag') draggedType = 'table-field';

      const validation = validateDrop(draggedType, over.id, droppedItems);
      setIsValidDrop(validation.valid);
      return;
    }

    // For existing items being moved, check if this is reordering
    const draggedItem = findItemById(droppedItems, active.id);
    if (!draggedItem) {
      setIsValidDrop(false);
      return;
    }

    const overItem = findItemById(droppedItems, over.id);
    if (overItem) {
      // Check if both items are at the same level (reordering)
      const draggedContext = getParentContext(droppedItems, active.id);
      const overContext = getParentContext(droppedItems, over.id);

      const sameParent = draggedContext?.parentType === overContext?.parentType;

      if (sameParent) {
        // This is reordering within the same parent - always valid
        setIsValidDrop(true);
        return;
      }
    }

    // For moving to different parent, use normal validation
    const validation = validateDrop(draggedItem.type, over.id, droppedItems);
    setIsValidDrop(validation.valid);
  }

  // Helper function to add a child to an item - memoized
  const addChildToItem = useCallback((items, parentId, newChild) => {
    return items.map((item) => {
      if (item.id === parentId) {
        return {
          ...item,
          children: [...item.children, newChild],
        };
      } else if (item.children && item.children.length > 0) {
        return {
          ...item,
          children: addChildToItem(item.children, parentId, newChild),
        };
      }
      return item;
    });
  }, []);

  // Helper function to move an existing item to top level - memoized
  const moveItemToTopLevel = useCallback((items, itemId) => {
    let itemToMove = null;

    const removeItem = (items) => {
      return items.reduce((acc, item) => {
        if (item.id === itemId) {
          itemToMove = item;
          return acc;
        } else if (item.children && item.children.length > 0) {
          const newChildren = removeItem(item.children);
          if (newChildren.length !== item.children.length) {
            return [...acc, { ...item, children: newChildren }];
          }
        }
        return [...acc, item];
      }, []);
    };

    const newItems = removeItem(items);
    if (itemToMove) {
      return [...newItems, itemToMove];
    }
    return items;
  }, []);

  // Helper function to move an item to be child of another item - memoized
  const moveItemToParent = useCallback((items, itemId, parentId) => {
    let itemToMove = null;

    const removeItem = (items) => {
      return items.reduce((acc, item) => {
        if (item.id === itemId) {
          itemToMove = item;
          return acc;
        } else if (item.children && item.children.length > 0) {
          const newChildren = removeItem(item.children);
          if (newChildren.length !== item.children.length) {
            return [...acc, { ...item, children: newChildren }];
          }
        }
        return [...acc, item];
      }, []);
    };

    const addToParent = (items) => {
      return items.map((item) => {
        if (item.id === parentId && itemToMove) {
          return {
            ...item,
            children: [...item.children, itemToMove],
          };
        } else if (item.children && item.children.length > 0) {
          return {
            ...item,
            children: addToParent(item.children),
          };
        }
        return item;
      });
    };

    const itemsWithoutMoved = removeItem(items);
    return addToParent(itemsWithoutMoved);
  }, []);

  // Function to remove an item - memoized
  const removeItem = useCallback((itemId) => {
    const removeFromItems = (items) => {
      return items.reduce((acc, item) => {
        if (item.id === itemId) {
          return acc;
        } else if (item.children && item.children.length > 0) {
          return [
            ...acc,
            { ...item, children: removeFromItems(item.children) },
          ];
        }
        return [...acc, item];
      }, []);
    };

    setDroppedItems((prev) => removeFromItems(prev));
    setXmlTree((prev) => {
      const newTree = { ...prev };
      delete newTree[itemId];
      return newTree;
    });
  }, []);

  // Function to confirm remove
  const confirmRemove = useCallback(() => {
    if (itemToRemove) {
      removeItem(itemToRemove.id);
      closeRemoveConfirmation();
    }
  }, [itemToRemove, removeItem, closeRemoveConfirmation]);

  // Export XML using utility function
  function handleExportXml() {
    exportXmlStructure(droppedItems);
  }
  const findItemById = useCallback((items, itemId) => {
    for (const item of items) {
      if (item.id === itemId) {
        return item;
      }
      if (item.children && item.children.length > 0) {
        const found = findItemById(item.children, itemId);
        if (found) return found;
      }
    }
    return null;
  }, []);

  // Function to handle editing an item
  const handleEditItem = useCallback(
    (itemId) => {
      const item = findItemById(droppedItems, itemId);
      if (item) {
        setEditingItem({ ...item }); // Create a copy for editing
        setShowEditModal(true);
      }
    },
    [droppedItems, findItemById]
  );

  // Function to save edited item
  const handleSaveEdit = useCallback((editedItem) => {
    const updateItemInArray = (items) => {
      return items.map((item) => {
        if (item.id === editedItem.id) {
          return editedItem;
        } else if (item.children && item.children.length > 0) {
          return {
            ...item,
            children: updateItemInArray(item.children),
          };
        }
        return item;
      });
    };

    setDroppedItems((prev) => updateItemInArray(prev));
    setShowEditModal(false);
    setEditingItem(null);
  }, []);

  // Function to cancel edit
  const handleCancelEdit = useCallback(() => {
    setShowEditModal(false);
    setEditingItem(null);
  }, []);

  // Function to handle loading XML
  const handleLoadXml = useCallback((parsedItems) => {
    setDroppedItems(parsedItems);
  }, []);

  // Function to handle creating new XML (clear all)
  const handleNewXml = useCallback(() => {
    if (droppedItems.length > 0) {
      setShowNewXmlModal(true);
    }
  }, [droppedItems.length]);

  // Function to confirm new XML creation
  const confirmNewXml = useCallback(() => {
    setDroppedItems([]);
    setXmlTree(initialXmlTree);
    setShowNewXmlModal(false);
  }, []);

  // Function to cancel new XML creation
  const cancelNewXml = useCallback(() => {
    setShowNewXmlModal(false);
  }, []);

  // Recursive function to render items and their children - memoized
  const renderItems = useCallback(
    (items) => {
      return items.map((item) => {
        return (
          <DroppableItem
            key={item.id}
            item={item}
            onRemove={showRemoveConfirmation}
            onEdit={handleEditItem}
          >
            {item.children &&
              item.children.length > 0 &&
              renderItems(item.children)}
          </DroppableItem>
        );
      });
    },
    [showRemoveConfirmation, handleEditItem]
  );

  // Helper function to get the parent context (what items are at the same level)
  const getParentContext = useCallback(
    (items, targetId, parentItems = null) => {
      // Check if targetId is in the current level
      for (const item of items) {
        if (item.id === targetId) {
          return {
            parentType: parentItems ? parentItems.type : 'root',
            siblings: items,
            target: item,
          };
        }
        if (item.children && item.children.length > 0) {
          const found = getParentContext(item.children, targetId, item);
          if (found) return found;
        }
      }
      return null;
    },
    []
  );

  // Validation rules for drag and drop
  const validateDrop = useCallback(
    (draggedType, targetId, droppedItems) => {
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

      // Rule 4: Only fields can be dropped into questions
      if (target.type === 'question' && draggedType !== 'field') {
        return {
          valid: false,
          message: 'Only fields can be dropped into questions',
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
    [findItemById, getParentContext]
  );

  // Helper function to determine if a drop zone is valid during drag
  const isValidDropZone = useCallback(
    (targetId, activeId) => {
      if (!activeId) return true;

      // Check if dragging from sidebar
      const isSidebarItem = [
        'form-tag',
        'section-tag',
        'field-tag',
        'information-tag',
        'table-tag',
        'table-field-tag',
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
    [validateDrop, findItemById, droppedItems]
  );

  // Function to reorder items within the same parent
  const reorderItems = useCallback((items, activeId, overId) => {
    const findItemAndParent = (items, targetId, parent = null, index = -1) => {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.id === targetId) {
          return { item, parent, index: i, siblings: items };
        }
        if (item.children && item.children.length > 0) {
          const found = findItemAndParent(item.children, targetId, item, i);
          if (found.item) return found;
        }
      }
      return { item: null, parent: null, index: -1, siblings: [] };
    };

    const activeResult = findItemAndParent(items, activeId);
    const overResult = findItemAndParent(items, overId);

    // Check if both items are in the same parent container
    if (
      activeResult.parent?.id === overResult.parent?.id ||
      (!activeResult.parent && !overResult.parent)
    ) {
      const targetArray = activeResult.parent
        ? activeResult.parent.children
        : items;
      const activeIndex = targetArray.findIndex((item) => item.id === activeId);
      const overIndex = targetArray.findIndex((item) => item.id === overId);

      if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
        const reorderedArray = arrayMove(targetArray, activeIndex, overIndex);

        if (activeResult.parent) {
          // Update parent's children
          return items.map((item) =>
            item.id === activeResult.parent.id
              ? { ...item, children: reorderedArray }
              : item.children && item.children.length > 0
              ? {
                  ...item,
                  children: reorderItems(item.children, activeId, overId),
                }
              : item
          );
        } else {
          // Root level reordering
          return reorderedArray;
        }
      }
    }

    return items;
  }, []);

  // Enhanced handleDragEnd to support reordering within same parent
  function handleDragEnd(event) {
    setActiveId(null);
    const { active, over } = event;

    // If no valid drop target, do nothing
    if (!over) {
      console.log('Item not dropped on any valid target');
      return;
    }

    const draggedItemId = active.id;
    const overId = over.id;

    // Check if dragging from sidebar (original draggable items)
    const isSidebarItem = [
      'form-tag',
      'section-tag',
      'field-tag',
      'information-tag',
      'table-tag',
      'table-field-tag',
    ].includes(draggedItemId);

    // Get all existing item IDs for validation
    const getAllItemIds = (items) => {
      let ids = [];
      items.forEach((item) => {
        ids.push(item.id);
        if (item.children && item.children.length > 0) {
          ids = ids.concat(getAllItemIds(item.children));
        }
      });
      return ids;
    };

    const existingItemIds = getAllItemIds(droppedItems);
    const validDropTargets = ['main-canvas', ...existingItemIds];

    // Validate that the drop target is actually valid
    if (!validDropTargets.includes(overId)) {
      console.log('Item dropped on invalid target:', overId);
      return;
    }

    if (isSidebarItem) {
      // Handle sidebar items with validation
      let newItem;
      let draggedType;

      switch (draggedItemId) {
        case 'form-tag':
          draggedType = 'page';
          newItem = {
            id: `page-${Date.now()}`,
            type: 'page',
            label: 'Page',
            children: [],
          };
          break;
        case 'section-tag':
          draggedType = 'question';
          newItem = {
            id: `question-${Date.now()}`,
            type: 'question',
            label: 'Question',
            children: [],
            // Question-specific attributes
            dataType: 'List Box', // 'List Box', 'Multi Select', 'Radio Buttons'
            textRecord: '',
            keyField: '',
            required: false,
            answers: [{ id: `answer-${Date.now()}-1`, text: 'Option 1' }],
          };
          break;
        case 'field-tag':
          draggedType = 'field';
          newItem = {
            id: `field-${Date.now()}`,
            type: 'field',
            label: 'Field',
            children: [],
            // Field-specific attributes
            dataType: 'Text Box', // Default to Text Box
            keyField: '',
            required: false,
          };
          break;
        case 'information-tag':
          draggedType = 'information';
          newItem = {
            id: `information-${Date.now()}`,
            type: 'information',
            label: 'New Information',
            children: [],
          };
          break;
        case 'table-tag':
          draggedType = 'table';
          newItem = {
            id: `table-${Date.now()}`,
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
            id: `table-field-${Date.now()}`,
            type: 'table-field',
            label: 'New Table Field',
            children: [],
            dataType: 'Text Box', // Default to Text Box
            required: false,
          };
          break;
        default:
          console.log('Unknown sidebar item:', draggedItemId);
          return;
      }

      // Validate the drop before proceeding
      const validation = validateDrop(draggedType, overId, droppedItems);
      if (!validation.valid) {
        console.log('Invalid drop:', validation.message);
        // You could show a toast notification here
        showWarning(`Cannot drop here: ${validation.message}`);
        return;
      }

      if (overId === 'main-canvas') {
        setDroppedItems((prev) => [...prev, newItem]);
      } else if (existingItemIds.includes(overId)) {
        setDroppedItems((prev) => addChildToItem(prev, overId, newItem));
      }

      setXmlTree((prev) => ({
        ...prev,
        [newItem.id]: newItem,
      }));
    } else {
      // Handle reordering/moving existing items with validation
      if (!existingItemIds.includes(draggedItemId)) {
        console.log('Cannot move non-existing item:', draggedItemId);
        return;
      }

      if (draggedItemId === overId) {
        console.log('Cannot drop item on itself');
        return;
      }

      // Get the type of the item being dragged
      const draggedItem = findItemById(droppedItems, draggedItemId);
      if (!draggedItem) {
        console.log('Dragged item not found');
        return;
      }

      // Check if this is a reordering operation (dropping on another existing item)
      if (existingItemIds.includes(overId)) {
        const overItem = findItemById(droppedItems, overId);
        if (overItem) {
          // Check if both items are at the same level (have same parent)
          const draggedContext = getParentContext(droppedItems, draggedItemId);
          const overContext = getParentContext(droppedItems, overId);

          const sameParent =
            draggedContext?.parentType === overContext?.parentType;

          if (sameParent) {
            // This is a reordering operation
            console.log('Reordering items');
            setDroppedItems((prev) =>
              reorderItems(prev, draggedItemId, overId)
            );
            return;
          }
        }
      }

      // Validate the move before proceeding (for non-reordering moves)
      const validation = validateDrop(draggedItem.type, overId, droppedItems);
      if (!validation.valid) {
        console.log('Invalid move:', validation.message);
        showWarning(`Cannot move here: ${validation.message}`);
        return;
      }

      if (overId === 'main-canvas') {
        // Move to top level - only pages allowed
        if (draggedItem.type !== 'page') {
          showWarning('Only pages can be moved to the root level');
          return;
        }
        setDroppedItems((prev) => moveItemToTopLevel(prev, draggedItemId));
      } else if (existingItemIds.includes(overId)) {
        // Moving to different parent - validate and move
        setDroppedItems((prev) =>
          moveItemToParent(prev, draggedItemId, overId)
        );
      }
    }
  }

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      collisionDetection={pointerWithin}
    >
      <div className="flex flex-col h-screen w-screen m-0 p-0 overflow-hidden fixed top-0 left-0">
        {/* Header with export button */}
        <div className="px-4 py-4 border-b border-gray-300 bg-gray-50 flex-shrink-0 flex justify-between items-center w-full">
          <h1 className="m-0 text-2xl">Questionnaire XML Builder</h1>
          <div className="flex gap-3 items-center">
            <button
              onClick={handleNewXml}
              className="px-4 py-2 bg-red-600 text-white border-none rounded cursor-pointer text-base hover:bg-red-700 transition-colors"
            >
              New XML
            </button>
            <div className="px-4 py-2 bg-green-600 text-white border-none rounded cursor-pointer text-base hover:bg-green-700 transition-colors">
              <XmlLoader onLoadXml={handleLoadXml} />
            </div>
            <button
              onClick={handleExportXml}
              className="px-4 py-2 bg-blue-500 text-white border-none rounded cursor-pointer text-base disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={droppedItems.length === 0}
            >
              Export XML
            </button>
          </div>
        </div>

        <div
          className="flex flex-1 w-full overflow-hidden"
          style={{ height: 'calc(50vh - 80px)' }}
        >
          {/* The Sidebar with Draggable items */}
          <div className="w-64 min-w-64 p-4 bg-gray-100 border-r border-gray-300 overflow-hidden h-full">
            <h3 className="m-0 mb-4 text-xl">Components</h3>
            <div className="block">
              <div className="mb-2">
                <DraggableItem id="form-tag" isValidDrop={isValidDrop}>
                  Page
                </DraggableItem>
              </div>
              <div className="mb-2">
                <DraggableItem id="section-tag" isValidDrop={isValidDrop}>
                  Question
                </DraggableItem>
              </div>
              <div className="mb-2">
                <DraggableItem id="field-tag" isValidDrop={isValidDrop}>
                  Field
                </DraggableItem>
              </div>
              <div className="mb-2">
                <DraggableItem id="information-tag" isValidDrop={isValidDrop}>
                  Information
                </DraggableItem>
              </div>
              <div className="mb-2">
                <DraggableItem id="table-tag" isValidDrop={isValidDrop}>
                  Table
                </DraggableItem>
              </div>
              <div className="mb-2">
                <DraggableItem id="table-field-tag" isValidDrop={isValidDrop}>
                  Table Field
                </DraggableItem>
              </div>
            </div>
          </div>

          {/* The Droppable Canvas */}
          <div className="flex-1 p-4 overflow-auto h-full w-auto">
            <DroppableArea id="main-canvas">
              {droppedItems.length === 0 ? (
                <p className="text-center text-lg text-gray-500 my-10">
                  Drag an item here to start building!
                </p>
              ) : (
                <div className="pb-24">{renderItems(droppedItems)}</div>
              )}
            </DroppableArea>
          </div>
        </div>

        {/* Preview Section */}
        <PreviewSection
          droppedItems={droppedItems}
          currentXmlString={currentXmlString}
          currentHtmlString={currentHtmlString}
        />
      </div>

      <DragOverlay className="z-[1000]">
        {activeId ? (
          <div
            className={`p-2.5 border-2 rounded shadow-2xl text-sm font-bold opacity-90 ${
              isValidDrop === false
                ? 'bg-red-50 border-red-500 text-red-700'
                : 'bg-white border-blue-500'
            }`}
          >
            {activeId === 'form-tag'
              ? 'Page'
              : activeId === 'section-tag'
              ? 'Question'
              : activeId === 'field-tag'
              ? 'Field'
              : activeId === 'information-tag'
              ? 'Information'
              : activeId === 'table-tag'
              ? 'Table'
              : activeId === 'table-field-tag'
              ? 'Table Field'
              : 'Moving Item'}
          </div>
        ) : null}
      </DragOverlay>

      {/* Edit Modal */}
      <EditModal
        isOpen={showEditModal}
        editingItem={editingItem}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
        onItemUpdate={setEditingItem}
        droppedItems={droppedItems}
      />

      {/* Warning Modal */}
      <WarningModal
        isOpen={showWarningModal}
        message={warningMessage}
        onClose={closeWarning}
      />

      {/* Remove Confirmation Modal */}
      <RemoveConfirmationModal
        isOpen={showConfirmModal}
        itemToRemove={itemToRemove}
        onConfirm={confirmRemove}
        onCancel={closeRemoveConfirmation}
      />

      {/* New XML Confirmation Modal */}
      <NewXmlModal
        isOpen={showNewXmlModal}
        onConfirm={confirmNewXml}
        onCancel={cancelNewXml}
      />
    </DndContext>
  );
}

export default App;
