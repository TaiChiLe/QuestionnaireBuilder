import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
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
import UserGuideModal from './components/UserGuideModal';
import PasteXmlModal from './components/PasteXmlModal';
import { generateId } from './components/utils/id';

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
  const [showUserGuide, setShowUserGuide] = useState(false);
  const [showPasteXml, setShowPasteXml] = useState(false);
  // Multi-select & clipboard state
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [focusId, setFocusId] = useState(null);
  const [clipboard, setClipboard] = useState(null); // { items: [], isCut: bool }
  // Track collapsed page IDs for UI collapsing/expanding large forms
  const [collapsedPageIds, setCollapsedPageIds] = useState(() => new Set());
  // XML dropdown state & ref to hidden file input component
  const xmlLoaderRef = useRef(null);
  const [xmlMenuOpen, setXmlMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [questionnaireName, setQuestionnaireName] = useState('');
  // Central set of question IDs whose answers are expanded
  const [expandedAnswerIds, setExpandedAnswerIds] = useState(() => new Set());
  // Preview panel sizing & collapse
  const [previewHeight, setPreviewHeight] = useState(
    Math.round(window.innerHeight * 0.3)
  );
  const [isPreviewCollapsed, setIsPreviewCollapsed] = useState(false);
  const [isBasicMode, setIsBasicMode] = useState(true);
  // Auto-edit toggle - open edit modal immediately when dropping components
  const [autoEdit, setAutoEdit] = useState(() => {
    try {
      const stored = localStorage.getItem('qb_auto_edit');
      return stored !== null ? stored === 'true' : true; // default to true
    } catch (_) {
      return true;
    }
  });
  const isResizingRef = useRef(false);
  const lastYRef = useRef(0);

  // Save auto-edit preference to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('qb_auto_edit', autoEdit ? 'true' : 'false');
    } catch (_) {
      /* noop */
    }
  }, [autoEdit]);

  // Clamp height on window resize so it doesn't exceed viewport
  useEffect(() => {
    const onResize = () => {
      setPreviewHeight((h) => {
        const max = window.innerHeight - 180; // leave space for header & content
        return Math.min(Math.max(h, 100), Math.max(max, 100));
      });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const startResize = useCallback(
    (e) => {
      if (isPreviewCollapsed) return;
      isResizingRef.current = true;
      lastYRef.current = e.clientY;
      document.body.style.userSelect = 'none';
    },
    [isPreviewCollapsed]
  );

  const stopResize = useCallback(() => {
    if (isResizingRef.current) {
      isResizingRef.current = false;
      document.body.style.userSelect = '';
    }
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!isResizingRef.current) return;
    const delta = lastYRef.current - e.clientY; // dragging upward increases delta
    lastYRef.current = e.clientY;
    setPreviewHeight((h) => {
      const next = h + delta;
      return Math.min(Math.max(next, 120), window.innerHeight - 220);
    });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', stopResize);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', stopResize);
    };
  }, [onMouseMove, stopResize]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!xmlMenuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setXmlMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('touchstart', handleClickOutside, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('touchstart', handleClickOutside, true);
    };
  }, [xmlMenuOpen]);

  const togglePageCollapse = useCallback((pageId) => {
    setCollapsedPageIds((prev) => {
      const next = new Set(prev);
      if (next.has(pageId)) next.delete(pageId);
      else next.add(pageId);
      return next;
    });
  }, []);

  // Move existing item to a new parent inserting before a specific sibling (used for table-field cross-table moves)
  const moveItemToParentBefore = useCallback(
    (items, itemId, newParentId, beforeSiblingId) => {
      let itemToMove = null;
      const remove = (list) =>
        list.reduce((acc, itm) => {
          if (itm.id === itemId) return acc; // drop it
          if (itm.children && itm.children.length > 0) {
            const newChildren = remove(itm.children);
            if (newChildren !== itm.children) {
              itm = { ...itm, children: newChildren };
            }
          }
          return [...acc, itm];
        }, []);

      const without = remove(items);

      if (!itemToMove) {
        // Need to locate original item (second pass) since we discarded it; fetch from original tree first.
        const find = (list) => {
          for (const itm of list) {
            if (itm.id === itemId) return itm;
            if (itm.children && itm.children.length > 0) {
              const f = find(itm.children);
              if (f) return f;
            }
          }
          return null;
        };
        itemToMove = find(items);
      }
      if (!itemToMove) return items; // nothing to do

      const insert = (list) =>
        list.map((itm) => {
          if (itm.id === newParentId) {
            const children = itm.children || [];
            const existingIdx = children.findIndex((c) => c.id === itemId);
            if (existingIdx !== -1) return itm; // already present
            const beforeIdx = children.findIndex(
              (c) => c.id === beforeSiblingId
            );
            let newChildren;
            if (beforeIdx === -1) {
              newChildren = [...children, itemToMove];
            } else {
              newChildren = [
                ...children.slice(0, beforeIdx),
                itemToMove,
                ...children.slice(beforeIdx),
              ];
            }
            return { ...itm, children: newChildren };
          }
          if (itm.children && itm.children.length > 0) {
            return { ...itm, children: insert(itm.children) };
          }
          return itm;
        });
      return insert(without);
    },
    []
  );

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
    ].includes(active.id);

    if (isSidebarItem) {
      let draggedType = 'page';
      if (active.id === 'section-tag') draggedType = 'question';
      if (active.id === 'field-tag') draggedType = 'field';
      if (active.id === 'information-tag') draggedType = 'information';
      if (active.id === 'table-tag') draggedType = 'table';
      if (active.id === 'table-field-tag') draggedType = 'table-field';
      // Basic Question components
      if (
        ['list-box-tag', 'multi-select-tag', 'radio-buttons-tag'].includes(
          active.id
        )
      ) {
        draggedType = 'question';
      }
      // Basic Field components
      if (['text-box-tag', 'notes-tag', 'date-tag'].includes(active.id)) {
        draggedType = 'field';
      }

      const validation = validateDrop(draggedType, over.id, droppedItems);
      if (!validation.valid) {
        const targetItem = findItemById(droppedItems, over.id);
        if (targetItem) {
          const ctx = getParentContext(droppedItems, over.id);
          if (ctx && canParentAccept(ctx.parentType, draggedType)) {
            setIsValidDrop(true);
            return;
          }
        }
        setIsValidDrop(false);
      } else {
        setIsValidDrop(true);
      }
      return;
    }

    const draggedItem = findItemById(droppedItems, active.id);
    if (!draggedItem) {
      setIsValidDrop(false);
      return;
    }

    const overItem = findItemById(droppedItems, over.id);
    if (overItem) {
      const draggedContext = getParentContext(droppedItems, active.id);
      const overContext = getParentContext(droppedItems, over.id);
      const sameParent = draggedContext?.parentId === overContext?.parentId;
      if (sameParent) {
        setIsValidDrop(true);
        return;
      }
    }

    const validation = validateDrop(draggedItem.type, over.id, droppedItems);
    if (!validation.valid) {
      // Allow slot insertion for existing item drag
      const ctx = getParentContext(droppedItems, over.id);
      if (ctx && canParentAccept(ctx.parentType, draggedItem.type)) {
        setIsValidDrop(true);
      } else {
        setIsValidDrop(false);
      }
    } else {
      setIsValidDrop(true);
    }
  }

  // Helper function to add a child to an item - memoized
  const addChildToItem = useCallback((items, parentId, newChild) => {
    return items.map((item) => {
      if (item.id === parentId) {
        const exists = item.children.some((c) => c.id === newChild.id);
        if (exists) {
          // Duplicate reference guard: don't add same object twice
          return item;
        }
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
    exportXmlStructure(droppedItems, questionnaireName);
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
    // Clear questionnaire name when starting a brand new questionnaire
    setQuestionnaireName('');
  }, []);

  // Function to cancel new XML creation
  const cancelNewXml = useCallback(() => {
    setShowNewXmlModal(false);
  }, []);

  // Function to handle loading XML with file name detection & destructive warnings
  const handleLoadXml = useCallback(
    (parsedItems, rawXmlText, fileName) => {
      setDroppedItems(parsedItems);
      if (fileName) {
        const base = fileName.replace(/\.xml$/i, '');
        setQuestionnaireName(base);
      }
      if (typeof rawXmlText === 'string') {
        try {
          const hasClinicalForms = /<clinicalforms\b/i.test(rawXmlText);
          const hasStatuses = /<statuses\b/i.test(rawXmlText);
          const hasSexAttr = /\bsex\s*=\s*['"]/i.test(rawXmlText);
          if (hasClinicalForms || hasStatuses || hasSexAttr) {
            const reasons = [];
            if (hasClinicalForms) reasons.push('ClinicalForms tag detected');
            if (hasStatuses) reasons.push('Statuses tag detected');
            if (hasSexAttr) reasons.push('sex attribute detected');
            showWarning(
              `${reasons.join(
                ' and '
              )} - editing this questionnaire is destructive`
            );
          }
        } catch (e) {
          // ignore parse errors
        }
      }
    },
    [showWarning]
  );

  // Helper function to get the parent context (what items are at the same level)
  const getParentContext = useCallback((items, targetId, parentItem = null) => {
    for (const item of items) {
      if (item.id === targetId) {
        return {
          parentType: parentItem ? parentItem.type : 'root',
          parentId: parentItem ? parentItem.id : null,
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
  }, []);

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
          return reorderedArray;
        }
      }
    }

    return items;
  }, []);

  // Recursive renderer (lost in refactor) to display items and nested children
  const renderItems = useCallback(
    (items, parentType = 'root') =>
      items.map((item) => {
        const isPageCollapsed =
          item.type === 'page' && collapsedPageIds.has(item.id);
        return (
          <DroppableItem
            key={item.id}
            item={item}
            onRemove={showRemoveConfirmation}
            onEdit={handleEditItem}
            isCollapsed={isPageCollapsed}
            onToggleCollapse={
              item.type === 'page'
                ? () => togglePageCollapse(item.id)
                : undefined
            }
            parentType={parentType}
            selected={selectedIds.has(item.id)}
            onSelect={(e) => handleSelectItem(e, item.id)}
            expandedAnswerIds={expandedAnswerIds}
          >
            {!isPageCollapsed &&
              item.children &&
              item.children.length > 0 &&
              renderItems(item.children, item.type)}
          </DroppableItem>
        );
      }),
    [
      collapsedPageIds,
      showRemoveConfirmation,
      handleEditItem,
      togglePageCollapse,
      selectedIds,
      expandedAnswerIds,
    ]
  );

  // === Slot Insertion Helpers ===
  const canParentAccept = useCallback((parentType, childType) => {
    const rules = {
      root: ['page'],
      page: ['question', 'field', 'information', 'table'],
      question: ['field'],
      field: [],
      information: [],
      table: ['table-field'],
      'table-field': [],
    };
    return (rules[parentType] || []).includes(childType);
  }, []);

  // ===== Selection & Clipboard Logic =====
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setFocusId(null);
  }, []);

  // Normalize selection to prevent parent+descendant mixes
  const normalizeSelection = useCallback(
    (ids) => {
      const keep = new Set(ids);
      const walk = (list, ancestorSelected) => {
        for (const itm of list) {
          const sel = keep.has(itm.id);
          if (ancestorSelected && sel) {
            keep.delete(itm.id);
          }
          if (itm.children && itm.children.length) {
            walk(itm.children, ancestorSelected || sel);
          }
        }
      };
      walk(droppedItems, false);
      return keep;
    },
    [droppedItems]
  );

  const handleSelectItem = useCallback(
    (e, id) => {
      e.preventDefault();
      const isMeta = e.metaKey || e.ctrlKey;
      const isShift = e.shiftKey; // future range selection potential
      setSelectedIds((prev) => {
        let next;
        if (isMeta) {
          next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
        } else if (isShift && focusId) {
          // simple range across flattened order (only same depth for now)
          const flat = [];
          const flatten = (list) => {
            for (const itm of list) {
              flat.push(itm.id);
              if (itm.children && itm.children.length) flatten(itm.children);
            }
          };
          flatten(droppedItems);
          const a = flat.indexOf(focusId);
          const b = flat.indexOf(id);
          if (a !== -1 && b !== -1) {
            const [start, end] = a < b ? [a, b] : [b, a];
            next = new Set(flat.slice(start, end + 1));
          } else {
            next = new Set([id]);
          }
        } else {
          next = new Set([id]);
        }
        next = normalizeSelection(next);
        return next;
      });
      setFocusId(id);
    },
    [droppedItems, focusId, normalizeSelection]
  );

  // Extract top-level selected item objects (no descendants because normalized)
  const getSelectedRootNodes = useCallback(() => {
    const roots = [];
    const walk = (list) => {
      for (const itm of list) {
        if (selectedIds.has(itm.id)) {
          roots.push(itm);
        } else if (itm.children && itm.children.length) walk(itm.children);
      }
    };
    walk(droppedItems);
    return roots;
  }, [droppedItems, selectedIds]);

  const deepCloneWithNewIds = useCallback((node) => {
    const { id, children, ...rest } = node;
    const cloned = {
      ...rest,
      id: generateId(node.type),
      type: node.type,
      children: (children || []).map((c) => deepCloneWithNewIds(c)),
    };
    return cloned;
  }, []);

  // Deep clone collecting new ids (used for selection after paste when copying)
  const deepCloneWithNewIdsAndCollect = useCallback((node, collected) => {
    const { id, children, ...rest } = node;
    const newId = generateId(node.type);
    collected.push(newId);
    return {
      ...rest,
      id: newId,
      type: node.type,
      children: (children || []).map((c) =>
        deepCloneWithNewIdsAndCollect(c, collected)
      ),
    };
  }, []);

  const removeMany = useCallback((ids) => {
    const idSet = new Set(ids);
    const prune = (list) =>
      list
        .filter((itm) => !idSet.has(itm.id))
        .map((itm) =>
          itm.children && itm.children.length
            ? { ...itm, children: prune(itm.children) }
            : itm
        );
    setDroppedItems((prev) => prune(prev));
  }, []);

  const handleCopy = useCallback(
    (isCut) => {
      if (selectedIds.size === 0) return;
      const roots = getSelectedRootNodes();
      if (roots.length === 0) return;
      if (isCut) {
        // store originals, then remove them (move semantics)
        setClipboard({ items: roots, isCut: true });
        removeMany(roots.map((r) => r.id));
        // focus becomes last removed parent (can't retain, so clear focus)
        setFocusId(null);
        setSelectedIds(new Set());
      } else {
        const clones = roots.map((r) => deepCloneWithNewIds(r));
        setClipboard({ items: clones, isCut: false });
      }
    },
    [selectedIds, getSelectedRootNodes, removeMany, deepCloneWithNewIds]
  );

  const insertAfterId = useCallback((items, targetId, newNodes) => {
    const walk = (list) => {
      const out = [];
      for (const itm of list) {
        out.push(itm);
        if (itm.id === targetId) {
          out.push(...newNodes);
        }
        if (itm.children && itm.children.length) {
          const newChildren = walk(itm.children);
          if (newChildren !== itm.children) {
            const updated = { ...itm, children: newChildren };
            out[out.length - (itm.id === targetId ? newNodes.length + 1 : 1)] =
              updated; // replace last occurrence
          }
        }
      }
      return out;
    };
    return walk(items);
  }, []);

  const handlePaste = useCallback(() => {
    if (!clipboard) return;

    // Root-level paste fallback: if no focus and clipboard contains only pages, append at root
    if (!focusId) {
      const roots = clipboard.items;
      if (roots.length === 0) return;
      const allPages = roots.every((n) => n.type === 'page');
      if (!allPages) return; // need a focus context for non-page types
      const collectedIds = [];
      setDroppedItems((prev) => {
        const insertion = clipboard.isCut
          ? roots
          : roots.map((n) => deepCloneWithNewIdsAndCollect(n, collectedIds));
        return [...prev, ...insertion];
      });
      const newIds = clipboard.isCut ? roots.map((r) => r.id) : collectedIds;
      setSelectedIds(new Set(newIds));
      setFocusId(newIds[newIds.length - 1] || null);
      if (clipboard.isCut) setClipboard(null);
      return;
    }

    const focusCtx = getParentContext(droppedItems, focusId);
    if (!focusCtx) return;
    const targetNode = focusCtx.target; // the focused item itself
    const parentType = focusCtx.parentType;
    const parentId = focusCtx.parentId; // null if root
    const siblings = focusCtx.siblings;
    const focusIndex = siblings.findIndex((s) => s.id === focusId);
    const roots = clipboard.items;

    // Determine if we should paste inside the focused container (page/question/table)
    const isContainer = ['page', 'question', 'table'].includes(targetNode.type);
    let mode = 'sibling';
    if (isContainer) {
      // Check if any clipboard item can be a child of this container
      const allowedInside = roots.filter((n) =>
        canParentAccept(targetNode.type, n.type)
      );
      if (allowedInside.length > 0) {
        mode = 'append-children';
      }
    }

    const collectedIds = [];

    if (mode === 'append-children') {
      // Paste as children at end of container
      const allowed = [];
      const skipped = [];
      for (const node of roots) {
        if (canParentAccept(targetNode.type, node.type)) allowed.push(node);
        else skipped.push(node);
      }
      if (allowed.length === 0) {
        showWarning('Nothing to paste into this container.');
        return;
      }
      setDroppedItems((prev) => {
        const update = (list) =>
          list.map((itm) => {
            if (itm.id === targetNode.id) {
              const insertion = clipboard.isCut
                ? allowed
                : allowed.map((n) =>
                    deepCloneWithNewIdsAndCollect(n, collectedIds)
                  );
              return { ...itm, children: [...itm.children, ...insertion] };
            }
            if (itm.children && itm.children.length) {
              return { ...itm, children: update(itm.children) };
            }
            return itm;
          });
        return update(prev);
      });
      const newIds = clipboard.isCut ? allowed.map((n) => n.id) : collectedIds;
      setSelectedIds(new Set(newIds));
      setFocusId(newIds[newIds.length - 1]);
      if (clipboard.isCut) setClipboard(null);
      if (skipped.length) {
        showWarning(
          `Skipped ${skipped.length} item(s) not allowed inside ${targetNode.type}.`
        );
      }
      return;
    }

    // Fallback: sibling insertion after focus
    const allowed = [];
    const skipped = [];
    for (const node of roots) {
      const pt = parentId ? parentType : 'root';
      if (canParentAccept(pt, node.type)) allowed.push(node);
      else skipped.push(node);
    }
    if (allowed.length === 0) {
      if (skipped.length) showWarning('Nothing to paste here (types invalid).');
      return;
    }
    setDroppedItems((prev) => {
      if (!parentId) {
        const arr = [...prev];
        const idx = arr.findIndex((i) => i.id === focusId);
        const insertion = clipboard.isCut
          ? allowed
          : allowed.map((n) => deepCloneWithNewIdsAndCollect(n, collectedIds));
        arr.splice(idx + 1, 0, ...insertion);
        return arr;
      }
      const insertion = clipboard.isCut
        ? allowed
        : allowed.map((n) => deepCloneWithNewIdsAndCollect(n, collectedIds));
      const spliceInto = (list) =>
        list.map((itm) => {
          if (itm.id === parentId) {
            const ch = [...itm.children];
            ch.splice(focusIndex + 1, 0, ...insertion);
            return { ...itm, children: ch };
          }
          if (itm.children && itm.children.length) {
            return { ...itm, children: spliceInto(itm.children) };
          }
          return itm;
        });
      return spliceInto(prev);
    });
    const newIds = clipboard.isCut ? allowed.map((n) => n.id) : collectedIds;
    setSelectedIds(new Set(newIds));
    setFocusId(newIds[newIds.length - 1]);
    if (clipboard.isCut) setClipboard(null);
    if (skipped.length) {
      showWarning(
        `Skipped ${skipped.length} item(s) not allowed in this location.`
      );
    }
  }, [
    clipboard,
    focusId,
    getParentContext,
    droppedItems,
    canParentAccept,
    deepCloneWithNewIdsAndCollect,
    showWarning,
  ]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (
        e.target &&
        (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')
      )
        return;
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'c') {
          e.preventDefault();
          handleCopy(false);
        } else if (e.key === 'x') {
          e.preventDefault();
          handleCopy(true);
        } else if (e.key === 'v') {
          e.preventDefault();
          handlePaste();
        }
      } else if (e.key === 'Escape') {
        clearSelection();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleCopy, handlePaste, clearSelection]);

  const insertItemBefore = useCallback((items, targetId, newItem) => {
    const walk = (list) => {
      const result = [];
      for (let itm of list) {
        if (itm.id === targetId) {
          result.push(newItem); // insert before target
        }
        if (itm.children && itm.children.length > 0) {
          const newChildren = walk(itm.children);
          if (newChildren !== itm.children) {
            itm = { ...itm, children: newChildren };
          }
        }
        result.push(itm);
      }
      return result;
    };
    return walk(items);
  }, []);

  // Extract (remove and return) an item anywhere in the tree
  const extractItem = useCallback((items, targetId) => {
    let removed = null;
    const walk = (list) =>
      list.reduce((acc, itm) => {
        if (itm.id === targetId) {
          removed = itm;
          return acc; // skip
        }
        if (itm.children && itm.children.length > 0) {
          const newChildren = walk(itm.children);
          if (newChildren !== itm.children) {
            itm = { ...itm, children: newChildren };
          }
        }
        acc.push(itm);
        return acc;
      }, []);
    const without = walk(items);
    return { items: without, removed };
  }, []);

  function handleDragEnd(event) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) {
      return;
    }

    const draggedItemId = active.id;
    const overId = over.id;
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
    ].includes(draggedItemId);

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
    if (!validDropTargets.includes(overId)) {
      return;
    }

    if (isSidebarItem) {
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
          return;
      }

      const validation = validateDrop(draggedType, overId, droppedItems);
      if (!validation.valid) {
        if (overId !== 'main-canvas') {
          const ctx = getParentContext(droppedItems, overId);
          if (ctx && canParentAccept(ctx.parentType, draggedType)) {
            setDroppedItems((prev) => insertItemBefore(prev, overId, newItem));
            setXmlTree((prev) => ({ ...prev, [newItem.id]: newItem }));

            // Automatically open edit modal for the newly created item (if enabled)
            setEditingItem({ ...newItem });
            if (autoEdit) {
              setShowEditModal(true);
            }

            return;
          }
        }
        showWarning(`Cannot drop here: ${validation.message}`);
        return;
      }

      if (overId === 'main-canvas') {
        setDroppedItems((prev) => [...prev, newItem]);
      } else if (existingItemIds.includes(overId)) {
        setDroppedItems((prev) => addChildToItem(prev, overId, newItem));
      }
      setXmlTree((prev) => ({ ...prev, [newItem.id]: newItem }));

      // Automatically open edit modal for the newly created item (if enabled)
      setEditingItem({ ...newItem });
      if (autoEdit) {
        setShowEditModal(true);
      }

      return;
    }

    // Existing item move
    if (!existingItemIds.includes(draggedItemId)) return;
    if (draggedItemId === overId) return;

    const draggedItem = findItemById(droppedItems, draggedItemId);
    if (!draggedItem) return;

    // Reordering within same parent (drop on sibling) handled earlier; here we attempt slot insertion first if standard drop invalid
    const overItem = findItemById(droppedItems, overId);
    if (overItem) {
      const draggedContext = getParentContext(droppedItems, draggedItemId);
      const overContext = getParentContext(droppedItems, overId);
      const sameParent = draggedContext?.parentId === overContext?.parentId;
      if (sameParent) {
        setDroppedItems((prev) => reorderItems(prev, draggedItemId, overId));
        return;
      }
    }

    const validation = validateDrop(draggedItem.type, overId, droppedItems);
    if (!validation.valid) {
      // Try slot insertion (insert before overId among siblings of overId)
      if (overId !== 'main-canvas') {
        const ctx = getParentContext(droppedItems, overId);
        if (ctx && canParentAccept(ctx.parentType, draggedItem.type)) {
          setDroppedItems((prev) => {
            const liveCtx = getParentContext(prev, overId); // recompute in current state
            if (!liveCtx) return prev;
            const siblings = liveCtx.siblings;
            const alreadySibling = siblings.some((s) => s.id === draggedItemId);
            if (alreadySibling) {
              // Reorder instead of duplicate insert
              const currentIndex = siblings.findIndex(
                (s) => s.id === draggedItemId
              );
              const targetIndex = siblings.findIndex((s) => s.id === overId);
              if (
                currentIndex === -1 ||
                targetIndex === -1 ||
                currentIndex === targetIndex
              )
                return prev;
              const newSiblings = arrayMove(
                siblings,
                currentIndex,
                targetIndex
              );
              // helper to replace siblings
              const replace = (list, parentId) => {
                if (!parentId) return newSiblings; // root
                return list.map((itm) =>
                  itm.id === parentId
                    ? { ...itm, children: newSiblings }
                    : itm.children && itm.children.length > 0
                    ? { ...itm, children: replace(itm.children, parentId) }
                    : itm
                );
              };
              return replace(prev, liveCtx.parentId);
            }
            // remove then insert before target
            const remove = (list) =>
              list.reduce((acc, itm) => {
                if (itm.id === draggedItemId) return acc;
                if (itm.children && itm.children.length > 0) {
                  const newChildren = remove(itm.children);
                  return [
                    ...acc,
                    newChildren === itm.children
                      ? itm
                      : { ...itm, children: newChildren },
                  ];
                }
                return [...acc, itm];
              }, []);
            const without = remove(prev);
            return insertItemBefore(without, overId, draggedItem);
          });
          return;
        }
      }
      showWarning(`Cannot move here: ${validation.message}`);
      return;
    }

    if (overId === 'main-canvas') {
      if (draggedItem.type !== 'page') {
        showWarning('Only pages can be moved to the root level');
        return;
      }
      setDroppedItems((prev) => moveItemToTopLevel(prev, draggedItemId));
    } else if (existingItemIds.includes(overId)) {
      // Prevent duplicating by dropping onto the same parent container (e.g., table) that already owns the dragged item
      const draggedCtx = getParentContext(droppedItems, draggedItemId);
      if (draggedCtx && draggedCtx.parentId === overId) {
        // No change needed; optionally could move to end if desired.
        return;
      }
      // Special handling: moving a table-field between tables should always detach then attach (never copy)
      if (draggedItem.type === 'table-field') {
        setDroppedItems((prev) => {
          const { items: without, removed } = extractItem(prev, draggedItemId);
          if (!removed) return prev;
          return addChildToItem(without, overId, removed);
        });
        return;
      }
      setDroppedItems((prev) => moveItemToParent(prev, draggedItemId, overId));
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
        <div className="px-4 py-2 border-b border-gray-300 bg-gray-50 flex-shrink-0 flex justify-between items-center w-full">
          <h1 className="m-0 text-2xl flex items-center gap-4 flex-1 justify-start whitespace-nowrap">
            <span>Questionnaire XML Builder</span>
            <button
              type="button"
              onClick={() => setShowUserGuide(true)}
              className="w-6 h-6 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 text-[#f03741] transition-colors"
              title="User Guide"
              aria-label="Open user guide"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </h1>
          <div className="flex items-center gap-3 justify-center">
            <h1>Questionnaire Name:</h1>
            <input
              type="text"
              value={questionnaireName}
              onChange={(e) => setQuestionnaireName(e.target.value)}
              placeholder="Untitled Questionnaire"
              className="text-base px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white min-w-[200px]"
            />
          </div>
          <div className="flex gap-3 items-center  flex-1 justify-end whitespace-nowrap">
            {/* Clipboard Toolbar */}
            <div className="flex items-center gap-1 mr-4">
              <button
                type="button"
                className="px-2 py-1 text-xs rounded border bg-white hover:bg-gray-100 disabled:opacity-40"
                disabled={selectedIds.size === 0}
                onClick={() => handleCopy(false)}
                title="Copy (Ctrl+C)"
              >
                Copy
              </button>
              <button
                type="button"
                className="px-2 py-1 text-xs rounded border bg-white hover:bg-gray-100 disabled:opacity-40"
                disabled={selectedIds.size === 0}
                onClick={() => handleCopy(true)}
                title="Cut (Ctrl+X)"
              >
                Cut
              </button>
              <button
                type="button"
                className="px-2 py-1 text-xs rounded border bg-white hover:bg-gray-100 disabled:opacity-40"
                disabled={
                  !clipboard ||
                  (!focusId &&
                    !(clipboard.items || []).every((i) => i.type === 'page'))
                }
                onClick={handlePaste}
                title="Paste After (Ctrl+V)"
              >
                Paste
              </button>
              <div className="mx-2 h-5 w-px bg-gray-300" />
              {(() => {
                // compute button label based on expandedAnswerIds
                const allQuestionIds = [];
                const walk = (list) => {
                  for (const itm of list) {
                    if (itm.type === 'question') allQuestionIds.push(itm.id);
                    if (itm.children && itm.children.length) walk(itm.children);
                  }
                };
                walk(droppedItems);
                const allCount = allQuestionIds.length;
                const alreadyAllOpen =
                  allCount > 0 &&
                  allQuestionIds.every((id) => expandedAnswerIds.has(id));
                const label = alreadyAllOpen
                  ? 'Collapse Answers'
                  : 'Expand Answers';
                const title = alreadyAllOpen
                  ? 'Collapse all question answers'
                  : 'Expand all question answers';
                return (
                  <button
                    type="button"
                    className="px-2 py-1 text-xs rounded border bg-white hover:bg-gray-100"
                    onClick={() => {
                      if (alreadyAllOpen) {
                        setExpandedAnswerIds(new Set());
                      } else {
                        setExpandedAnswerIds(new Set(allQuestionIds));
                      }
                    }}
                    title={title}
                  >
                    {label}
                  </button>
                );
              })()}
            </div>
            {/* Consolidated Menu Button */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setXmlMenuOpen((o) => !o)}
                className="px-4 py-2 bg-white text-gray-800 border border-gray-300 rounded cursor-pointer text-base hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                Menu
                <span
                  className={`transition-transform text-xs ${
                    xmlMenuOpen ? 'rotate-180' : ''
                  }`}
                >
                  ▾
                </span>
              </button>
              {xmlMenuOpen && (
                <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded shadow-lg z-50 text-sm py-1">
                  <button
                    className="flex w-full justify-between items-center text-left px-3 py-2 hover:bg-gray-100"
                    onClick={() => {
                      setXmlMenuOpen(false);
                      handleNewXml();
                    }}
                  >
                    <span>New Questionnaire</span>
                  </button>
                  <div className="border-t my-1" />
                  <div className="px-3 py-1 text-[11px] uppercase tracking-wide text-gray-500">
                    Load
                  </div>
                  <button
                    className="flex w-full justify-between items-center text-left px-3 py-2 hover:bg-gray-100"
                    onClick={() => {
                      setXmlMenuOpen(false);
                      xmlLoaderRef.current?.openFileDialog();
                    }}
                  >
                    <span>From File...</span>
                  </button>
                  <button
                    className="flex w-full justify-between items-center text-left px-3 py-2 hover:bg-gray-100"
                    onClick={() => {
                      setXmlMenuOpen(false);
                      setShowPasteXml(true);
                    }}
                  >
                    <span>Paste XML...</span>
                  </button>
                  <div className="border-t my-1" />
                  <button
                    className="flex w-full justify-between items-center text-left px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={droppedItems.length === 0}
                    onClick={() => {
                      setXmlMenuOpen(false);
                      handleExportXml();
                    }}
                  >
                    <span>Save XML</span>
                  </button>
                </div>
              )}
              <XmlLoader
                ref={xmlLoaderRef}
                onLoadXml={(items, raw, fileName) => {
                  setXmlMenuOpen(false);
                  handleLoadXml(items, raw, fileName);
                }}
              />
            </div>
          </div>
        </div>

        <div
          className="flex flex-1 w-full overflow-hidden"
          style={{ height: `calc(100vh - ${previewHeight + 56}px)` }}
        >
          {/* The Sidebar with Draggable items */}
          <div className="w-64 min-w-64 p-4 bg-gray-100 border-r border-gray-300 overflow-hidden h-full">
            {/* Toggle Button for Basic/Advanced Components */}
            <div className="mb-4">
              <button
                onClick={() => setIsBasicMode(!isBasicMode)}
                className="w-full px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200"
                style={{
                  backgroundColor: isBasicMode ? '#f03741' : '#e5e7eb',
                  color: isBasicMode ? 'white' : '#374151',
                }}
              >
                {isBasicMode ? 'Show Advanced' : 'Show Basic'}
              </button>
            </div>

            {/* Toggle Button for Auto-Edit */}
            <div className="mb-4">
              <button
                onClick={() => setAutoEdit(!autoEdit)}
                className="w-full px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200"
                style={{
                  backgroundColor: autoEdit ? '#10b981' : '#e5e7eb',
                  color: autoEdit ? 'white' : '#374151',
                }}
                title={
                  autoEdit
                    ? 'Auto-edit enabled: Edit modal opens immediately when dropping components'
                    : 'Auto-edit disabled: Click components to edit them'
                }
              >
                {autoEdit ? 'Auto-Edit ON' : 'Auto-Edit OFF'}
              </button>
            </div>

            <div className="block">
              {/* Advanced Components */}
              {!isBasicMode && (
                <>
                  <div className="mb-2">
                    <DraggableItem id="form-tag" isValidDrop={isValidDrop}>
                      <span className="inline-flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-5 h-5 text-gray-600"
                        >
                          <rect
                            x="3"
                            y="4"
                            width="18"
                            height="16"
                            rx="2"
                            ry="2"
                          />
                          <path d="M3 10h18" />
                          <path d="M7 14h6" />
                        </svg>
                        <span>Page</span>
                      </span>
                    </DraggableItem>
                  </div>
                  <div className="mb-2">
                    <DraggableItem id="field-tag" isValidDrop={isValidDrop}>
                      <span className="inline-flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-5 h-5 text-gray-600"
                        >
                          <rect x="4" y="5" width="16" height="14" rx="2" />
                          <path d="M8 9h8" />
                          <path d="M8 13h5" />
                        </svg>
                        <span>Field</span>
                      </span>
                    </DraggableItem>
                  </div>
                  <div className="mb-2">
                    <DraggableItem
                      id="information-tag"
                      isValidDrop={isValidDrop}
                    >
                      <span className="inline-flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-5 h-5 text-gray-600"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 8h.01" />
                          <path d="M10.5 12h1.5v4h1.5" />
                        </svg>
                        <span>Information</span>
                      </span>
                    </DraggableItem>
                  </div>
                  <div className="mb-2">
                    <DraggableItem id="section-tag" isValidDrop={isValidDrop}>
                      <span className="inline-flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-5 h-5 text-gray-600"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M8 10h8" />
                          <path d="M8 14h5" />
                        </svg>
                        <span>Question</span>
                      </span>
                    </DraggableItem>
                  </div>
                  <div className="mb-2">
                    <DraggableItem id="table-tag" isValidDrop={isValidDrop}>
                      <span className="inline-flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-5 h-5 text-gray-600"
                        >
                          <rect x="3" y="6" width="18" height="12" rx="2" />
                          <path d="M3 10h18" />
                          <path d="M9 6v12" />
                          <path d="M15 6v12" />
                        </svg>
                        <span>Table</span>
                      </span>
                    </DraggableItem>
                  </div>
                  <div className="mb-2">
                    <DraggableItem
                      id="table-field-tag"
                      isValidDrop={isValidDrop}
                    >
                      <span className="inline-flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-5 h-5 text-gray-600"
                        >
                          <rect x="4" y="4" width="16" height="16" rx="2" />
                          <path d="M4 9h16" />
                          <path d="M9 4v16" />
                        </svg>
                        <span>Table Field</span>
                      </span>
                    </DraggableItem>
                  </div>
                </>
              )}

              {/* Basic Components */}
              {isBasicMode && (
                <>
                  {/* Page is available in both modes */}
                  <div className="mb-2">
                    <DraggableItem id="form-tag" isValidDrop={isValidDrop}>
                      <span className="inline-flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-5 h-5 text-gray-600"
                        >
                          <rect
                            x="3"
                            y="4"
                            width="18"
                            height="16"
                            rx="2"
                            ry="2"
                          />
                          <path d="M3 10h18" />
                          <path d="M7 14h6" />
                        </svg>
                        <span>Page</span>
                      </span>
                    </DraggableItem>
                  </div>

                  {/* Basic Field Components */}
                  <div className="mb-2">
                    <DraggableItem id="date-tag" isValidDrop={isValidDrop}>
                      <span className="inline-flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-5 h-5 text-gray-600"
                        >
                          <rect
                            x="3"
                            y="4"
                            width="18"
                            height="18"
                            rx="2"
                            ry="2"
                          />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span>Date</span>
                      </span>
                    </DraggableItem>
                  </div>

                  {/* Information, Table, and Table Field - available in basic mode */}
                  <div className="mb-2">
                    <DraggableItem
                      id="information-tag"
                      isValidDrop={isValidDrop}
                    >
                      <span className="inline-flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-5 h-5 text-gray-600"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 8h.01" />
                          <path d="M10.5 12h1.5v4h1.5" />
                        </svg>
                        <span>Information</span>
                      </span>
                    </DraggableItem>
                  </div>

                  {/* Basic Question Components */}
                  <div className="mb-2">
                    <DraggableItem id="list-box-tag" isValidDrop={isValidDrop}>
                      <span className="inline-flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-5 h-5 text-gray-600"
                        >
                          <rect x="3" y="6" width="18" height="12" rx="2" />
                          <path d="M7 9h10" />
                          <path d="M7 12h7" />
                          <path d="M7 15h5" />
                        </svg>
                        <span>List Box</span>
                      </span>
                    </DraggableItem>
                  </div>
                  <div className="mb-2">
                    <DraggableItem
                      id="multi-select-tag"
                      isValidDrop={isValidDrop}
                    >
                      <span className="inline-flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-5 h-5 text-gray-600"
                        >
                          <rect x="3" y="5" width="6" height="6" rx="1" />
                          <path d="M21 7L13 15l-3-3" />
                          <rect x="3" y="13" width="6" height="6" rx="1" />
                          <path d="M21 15L13 23l-3-3" />
                        </svg>
                        <span>Multi Select</span>
                      </span>
                    </DraggableItem>
                  </div>

                  <div className="mb-2">
                    <DraggableItem id="notes-tag" isValidDrop={isValidDrop}>
                      <span className="inline-flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-5 h-5 text-gray-600"
                        >
                          <rect x="4" y="4" width="16" height="16" rx="2" />
                          <path d="M8 8h8" />
                          <path d="M8 12h8" />
                          <path d="M8 16h6" />
                        </svg>
                        <span>Notes</span>
                      </span>
                    </DraggableItem>
                  </div>

                  <div className="mb-2">
                    <DraggableItem
                      id="radio-buttons-tag"
                      isValidDrop={isValidDrop}
                    >
                      <span className="inline-flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-5 h-5 text-gray-600"
                        >
                          <circle cx="7" cy="7" r="3" />
                          <circle cx="7" cy="17" r="3" />
                          <path d="M14 7h7" />
                          <path d="M14 17h7" />
                        </svg>
                        <span>Radio Buttons</span>
                      </span>
                    </DraggableItem>
                  </div>

                  <div className="mb-2">
                    <DraggableItem id="table-tag" isValidDrop={isValidDrop}>
                      <span className="inline-flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-5 h-5 text-gray-600"
                        >
                          <rect x="3" y="6" width="18" height="12" rx="2" />
                          <path d="M3 10h18" />
                          <path d="M9 6v12" />
                          <path d="M15 6v12" />
                        </svg>
                        <span>Table</span>
                      </span>
                    </DraggableItem>
                  </div>
                  <div className="mb-2">
                    <DraggableItem
                      id="table-field-tag"
                      isValidDrop={isValidDrop}
                    >
                      <span className="inline-flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-5 h-5 text-gray-600"
                        >
                          <rect x="4" y="4" width="16" height="16" rx="2" />
                          <path d="M4 9h16" />
                          <path d="M9 4v16" />
                        </svg>
                        <span>Table Field</span>
                      </span>
                    </DraggableItem>
                  </div>

                  <div className="mb-2">
                    <DraggableItem id="text-box-tag" isValidDrop={isValidDrop}>
                      <span className="inline-flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-5 h-5 text-gray-600"
                        >
                          <rect x="4" y="6" width="16" height="4" rx="1" />
                          <path d="M6 8h12" />
                        </svg>
                        <span>Text Box</span>
                      </span>
                    </DraggableItem>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* The Droppable Canvas */}
          <div className="flex-1 p-4 overflow-auto h-full w-auto">
            <DroppableArea
              id="main-canvas"
              onBackgroundClick={() => {
                clearSelection();
              }}
            >
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

        {/* Resize Handle & Preview Section */}
        <div
          className={`relative w-full flex-shrink-0 ${
            isPreviewCollapsed ? 'h-9' : ''
          }`}
          style={{ height: isPreviewCollapsed ? 36 : previewHeight }}
        >
          {/* Drag handle */}
          <div
            onMouseDown={startResize}
            className={`absolute -top-1 left-0 right-0 h-2 cursor-row-resize group z-20 flex items-center justify-center ${
              isPreviewCollapsed ? 'pointer-events-none opacity-0' : ''
            }`}
          >
            <div className="w-40 h-1 rounded bg-gray-400 group-hover:bg-gray-600 transition-colors" />
          </div>
          <PreviewSection
            droppedItems={droppedItems}
            currentXmlString={currentXmlString}
            currentHtmlString={currentHtmlString}
            height={isPreviewCollapsed ? 36 : previewHeight}
            collapsed={isPreviewCollapsed}
            onToggleCollapse={() => setIsPreviewCollapsed((c) => !c)}
          />
        </div>
      </div>

      <DragOverlay className="z-[1000]">
        {activeId ? (
          <div
            className={`p-2.5 my-1 border rounded text-sm flex items-center gap-2 min-w-20 shadow-2xl opacity-90 ${
              isValidDrop === false
                ? 'bg-red-50 border-red-300 text-red-700'
                : 'bg-blue-50 border-blue-300 text-gray-800'
            }`}
          >
            {/* Icon + Label mimic sidebar */}
            {(() => {
              const common = 'w-5 h-5 text-gray-600 flex-shrink-0';
              switch (activeId) {
                case 'form-tag':
                  return (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={common}
                      >
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="16"
                          rx="2"
                          ry="2"
                        />
                        <path d="M3 10h18" />
                        <path d="M7 14h6" />
                      </svg>
                      <span>Page</span>
                    </>
                  );
                case 'section-tag':
                  return (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={common}
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M8 10h8" />
                        <path d="M8 14h5" />
                      </svg>
                      <span>Question</span>
                    </>
                  );
                case 'field-tag':
                  return (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={common}
                      >
                        <rect x="4" y="5" width="16" height="14" rx="2" />
                        <path d="M8 9h8" />
                        <path d="M8 13h5" />
                      </svg>
                      <span>Field</span>
                    </>
                  );
                case 'information-tag':
                  return (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={common}
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8h.01" />
                        <path d="M10.5 12h1.5v4h1.5" />
                      </svg>
                      <span>Information</span>
                    </>
                  );
                case 'table-tag':
                  return (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={common}
                      >
                        <rect x="3" y="6" width="18" height="12" rx="2" />
                        <path d="M3 10h18" />
                        <path d="M9 6v12" />
                        <path d="M15 6v12" />
                      </svg>
                      <span>Table</span>
                    </>
                  );
                case 'table-field-tag':
                  return (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={common}
                      >
                        <rect x="4" y="4" width="16" height="16" rx="2" />
                        <path d="M4 9h16" />
                        <path d="M9 4v16" />
                      </svg>
                      <span>Table Field</span>
                    </>
                  );
                // Basic Question components
                case 'list-box-tag':
                  return (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={common}
                      >
                        <rect x="3" y="6" width="18" height="12" rx="2" />
                        <path d="M7 9h10" />
                        <path d="M7 12h7" />
                        <path d="M7 15h5" />
                      </svg>
                      <span>List Box</span>
                    </>
                  );
                case 'multi-select-tag':
                  return (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={common}
                      >
                        <rect x="3" y="5" width="6" height="6" rx="1" />
                        <path d="M21 7L13 15l-3-3" />
                        <rect x="3" y="13" width="6" height="6" rx="1" />
                        <path d="M21 15L13 23l-3-3" />
                      </svg>
                      <span>Multi Select</span>
                    </>
                  );
                case 'radio-buttons-tag':
                  return (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={common}
                      >
                        <circle cx="7" cy="7" r="3" />
                        <circle cx="7" cy="17" r="3" />
                        <path d="M14 7h7" />
                        <path d="M14 17h7" />
                      </svg>
                      <span>Radio Buttons</span>
                    </>
                  );
                // Basic Field components
                case 'text-box-tag':
                  return (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={common}
                      >
                        <rect x="4" y="6" width="16" height="4" rx="1" />
                        <path d="M6 8h12" />
                      </svg>
                      <span>Text Box</span>
                    </>
                  );
                case 'notes-tag':
                  return (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={common}
                      >
                        <rect x="4" y="4" width="16" height="16" rx="2" />
                        <path d="M8 8h8" />
                        <path d="M8 12h8" />
                        <path d="M8 16h6" />
                      </svg>
                      <span>Notes</span>
                    </>
                  );
                case 'date-tag':
                  return (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={common}
                      >
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span>Date</span>
                    </>
                  );
                default:
                  // Existing item drag - just show its type text
                  return <span>Moving Item</span>;
              }
            })()}
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

      {/* User Guide Modal */}
      <UserGuideModal
        isOpen={showUserGuide}
        onClose={() => setShowUserGuide(false)}
      />
      <PasteXmlModal
        isOpen={showPasteXml}
        onClose={() => setShowPasteXml(false)}
        onLoadXml={(items, raw) => handleLoadXml(items, raw)}
      />
    </DndContext>
  );
}

export default App;
