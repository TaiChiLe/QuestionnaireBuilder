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
import DragOverlayContent from './components/DragOverlayContent';
import SidebarDraggableComponents from './components/SidebarDraggableComponents';
import { generateOrderedXML } from './components/utils/xmlBuilder2Solution';
import { exportXmlStructure } from './components/utils/xmlExporter';
import {
  parseXmlToItems,
  extractQuestionnaireName,
} from './components/utils/xmlParser';
import UserGuideModal from './components/UserGuideModal';
import PasteXmlModal from './components/PasteXmlModal';
import { generateId } from './components/utils/id';
import { generateHtmlPreview } from './components/utils/htmlConverter';
import { createItemFromDraggedId } from './components/utils/itemFactory';
import {
  validateDrop,
  canParentAccept,
} from './components/utils/dragDropValidation';

// The central state to represent the XML tree
const initialXmlTree = {};

function App() {
  const [xmlTree, setXmlTree] = useState(initialXmlTree);
  const [droppedItems, setDroppedItems] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [isValidDrop, setIsValidDrop] = useState(true); // Track if current drag is valid
  const [editingItem, setEditingItem] = useState(null);
  const [isNewlyCreatedItem, setIsNewlyCreatedItem] = useState(false); // Track if current editing item was just created
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
  const [uploadMenuOpen, setUploadMenuOpen] = useState(false);
  const uploadMenuRef = useRef(null);
  const [questionnaireName, setQuestionnaireName] = useState('');
  // Central set of question IDs whose answers are expanded
  const [expandedAnswerIds, setExpandedAnswerIds] = useState(() => new Set());
  // Preview panel sizing & collapse
  const [previewHeight, setPreviewHeight] = useState(
    Math.round(window.innerHeight * 0.3)
  );
  const [isPreviewCollapsed, setIsPreviewCollapsed] = useState(false);
  // Auto-edit toggle - open edit modal immediately when dropping components
  const [autoEdit, setAutoEdit] = useState(() => {
    try {
      const stored = localStorage.getItem('qb_auto_edit');
      return stored !== null ? stored === 'true' : true; // default to true
    } catch {
      return true;
    }
  });

  // Advanced settings toggle (persisted)
  const [showAdvanced, setShowAdvanced] = useState(() => {
    try {
      const stored = localStorage.getItem('qb_show_advanced');
      return stored === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('qb_show_advanced', showAdvanced ? 'true' : 'false');
    } catch {
      // Ignore localStorage errors
    }
  }, [showAdvanced]);

  // Undo/Redo functionality
  const [historyStack, setHistoryStack] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const maxHistorySize = 50;

  const isResizingRef = useRef(false);
  const lastYRef = useRef(0);

  // Initialize history with the current state
  useEffect(() => {
    if (historyStack.length === 0 && historyIndex === -1) {
      const initialState = {
        droppedItems: JSON.parse(JSON.stringify(droppedItems)),
        xmlTree: JSON.parse(JSON.stringify(xmlTree)),
      };
      setHistoryStack([initialState]);
      setHistoryIndex(0);
    }
  }, [droppedItems, xmlTree, historyStack.length, historyIndex]);

  // Manual save to history function - called before making changes
  const saveToHistory = useCallback(() => {
    const currentState = {
      droppedItems: JSON.parse(JSON.stringify(droppedItems)),
      xmlTree: JSON.parse(JSON.stringify(xmlTree)),
    };

    // Calculate new values synchronously to avoid stale closures
    const currentIndex = historyIndex;
    const currentStack = historyStack;

    // Remove any future history if we're not at the end
    const newStack = currentStack.slice(0, currentIndex + 1);
    newStack.push(currentState);

    let newIndex;
    let finalStack;

    // Limit history size
    if (newStack.length > maxHistorySize) {
      finalStack = newStack.slice(1); // Remove first item
      newIndex = maxHistorySize - 1;
    } else {
      finalStack = newStack;
      newIndex = currentIndex + 1;
    }

    // Update both states
    setHistoryStack(finalStack);
    setHistoryIndex(newIndex);
  }, [droppedItems, xmlTree, historyIndex, historyStack, maxHistorySize]);

  // Save to history after drag operations complete
  const [pendingHistorySave, setPendingHistorySave] = useState(false);

  useEffect(() => {
    if (pendingHistorySave && historyStack.length > 0) {
      const currentState = {
        droppedItems: JSON.parse(JSON.stringify(droppedItems)),
        xmlTree: JSON.parse(JSON.stringify(xmlTree)),
      };

      setHistoryStack((prevStack) => {
        const newStack = prevStack.slice(0, historyIndex + 1);
        newStack.push(currentState);

        if (newStack.length > maxHistorySize) {
          return newStack.slice(1);
        }
        return newStack;
      });

      setHistoryIndex((prev) => Math.min(prev + 1, maxHistorySize - 1));
      setPendingHistorySave(false);
    }
  }, [
    droppedItems,
    xmlTree,
    pendingHistorySave,
    historyStack.length,
    historyIndex,
    maxHistorySize,
  ]);

  // Save auto-edit preference to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('qb_auto_edit', autoEdit ? 'true' : 'false');
    } catch {
      // Ignore localStorage errors
    }
  }, [autoEdit]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const targetIndex = historyIndex - 1;
      const targetState = historyStack[targetIndex];

      if (targetState) {
        setDroppedItems(targetState.droppedItems);
        setXmlTree(targetState.xmlTree);
        setHistoryIndex(targetIndex);
        // Clear any selections that might not exist in the previous state
        setSelectedIds(new Set());
        setFocusId(null);
      }
    }
  }, [historyIndex, historyStack]);

  const handleRedo = useCallback(() => {
    if (historyIndex < historyStack.length - 1) {
      const targetIndex = historyIndex + 1;
      const targetState = historyStack[targetIndex];

      if (targetState) {
        setDroppedItems(targetState.droppedItems);
        setXmlTree(targetState.xmlTree);
        setHistoryIndex(targetIndex);
        // Clear any selections that might not exist in the future state
        setSelectedIds(new Set());
        setFocusId(null);
      }
    }
  }, [historyIndex, historyStack]);

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

  // Close menus when clicking outside
  useEffect(() => {
    if (!uploadMenuOpen) return;
    const handleClickOutside = (e) => {
      if (uploadMenuRef.current && !uploadMenuRef.current.contains(e.target)) {
        setUploadMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('touchstart', handleClickOutside, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('touchstart', handleClickOutside, true);
    };
  }, [uploadMenuOpen]);

  const togglePageCollapse = useCallback((pageId) => {
    setCollapsedPageIds((prev) => {
      const next = new Set(prev);
      if (next.has(pageId)) next.delete(pageId);
      else next.add(pageId);
      return next;
    });
  }, []);

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
  const currentHtmlString = useMemo(() => {
    return generateHtmlPreview(droppedItems);
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

      const validation = validateDrop(
        draggedType,
        over.id,
        droppedItems,
        findItemById,
        getParentContext
      );
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

    const validation = validateDrop(
      draggedItem.type,
      over.id,
      droppedItems,
      findItemById,
      getParentContext
    );
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
  const removeItem = useCallback(
    (itemId) => {
      // Save current state to history before removal
      saveToHistory();

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
    },
    [saveToHistory]
  );

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
        setIsNewlyCreatedItem(false); // This is an existing item, not newly created
        setShowEditModal(true);
      }
    },
    [droppedItems, findItemById]
  );

  // Function to save edited item
  const handleSaveEdit = useCallback(
    (editedItem) => {
      // Only save to history if this isn't a newly created item being auto-edited
      if (!isNewlyCreatedItem) {
        saveToHistory();
      }

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
      setIsNewlyCreatedItem(false); // Reset the flag
    },
    [saveToHistory, isNewlyCreatedItem]
  );

  // Function to cancel edit
  const handleCancelEdit = useCallback(() => {
    setShowEditModal(false);
    setEditingItem(null);
    setIsNewlyCreatedItem(false); // Reset the flag
  }, []);

  // Function to handle creating new XML (clear all)
  const handleNewXml = useCallback(() => {
    if (droppedItems.length > 0) {
      setShowNewXmlModal(true);
    }
  }, [droppedItems.length]);

  // Function to confirm new XML creation
  const confirmNewXml = useCallback(() => {
    saveToHistory();
    setDroppedItems([]);
    setXmlTree(initialXmlTree);
    setShowNewXmlModal(false);
    // Clear questionnaire name when starting a brand new questionnaire
    setQuestionnaireName('');
  }, [saveToHistory]);

  // Function to cancel new XML creation
  const cancelNewXml = useCallback(() => {
    setShowNewXmlModal(false);
  }, []);

  // Function to handle loading XML with file name detection & destructive warnings
  const handleLoadXml = useCallback(
    (parsedItems, rawXmlText, fileName) => {
      saveToHistory();
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
          // Detect any Information (or information) element with a style attribute
          const hasInformationStyle =
            /<information\b[^>]*\bstyle\s*=\s*['"]/i.test(rawXmlText);
          if (
            hasClinicalForms ||
            hasStatuses ||
            hasSexAttr ||
            hasInformationStyle
          ) {
            const reasons = [];
            if (hasClinicalForms) reasons.push('ClinicalForms tag detected');
            if (hasStatuses) reasons.push('Statuses tag detected');
            if (hasSexAttr) reasons.push('sex attribute detected');
            if (hasInformationStyle)
              reasons.push('Information style attribute detected');
            showWarning(
              `Advanced Questionnaire Detected: ${reasons.join(
                ' and '
              )} - advanced features present; editing this questionnaire is destructive.`
            );
          }
        } catch {
          // Ignore parse errors
        }
      }
    },
    [showWarning, saveToHistory]
  );

  // Function to handle direct XML editing
  const handleXmlEdit = useCallback(
    async (editedXmlString) => {
      try {
        // Parse the edited XML to validate and convert to items
        const parsedItems = parseXmlToItems(editedXmlString);

        // Extract questionnaire name if it exists
        const newQuestionnaireName = extractQuestionnaireName(editedXmlString);

        // Save current state to history before making changes
        saveToHistory();

        // Rebuild xmlTree from parsed items
        const rebuildXmlTree = (items) => {
          const newTree = {};
          const processItems = (itemsList) => {
            itemsList.forEach((item) => {
              newTree[item.id] = item;
              if (item.children && item.children.length > 0) {
                processItems(item.children);
              }
            });
          };
          processItems(items);
          return newTree;
        };

        // Update the state with the new data
        setDroppedItems(parsedItems);
        setXmlTree(rebuildXmlTree(parsedItems));

        // Update questionnaire name if it was found in the XML
        if (
          newQuestionnaireName &&
          newQuestionnaireName !== questionnaireName
        ) {
          setQuestionnaireName(newQuestionnaireName);
        }

        // Clear any selections that might not be valid anymore
        setSelectedIds(new Set());
        setFocusId(null);

        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    [saveToHistory, questionnaireName]
  );

  // Navigate from error panel to a specific item on canvas
  const navigateToItem = useCallback(
    (id) => {
      if (!id) return;
      // Expand ancestor page if collapsed
      const findPath = (items, targetId, path = []) => {
        for (const itm of items) {
          const newPath = [...path, itm];
          if (itm.id === targetId) return newPath;
          if (itm.children && itm.children.length) {
            const found = findPath(itm.children, targetId, newPath);
            if (found) return found;
          }
        }
        return null;
      };
      const path = findPath(droppedItems, id) || [];
      const pageAncestor = path.find((n) => n.type === 'page');
      if (pageAncestor && collapsedPageIds.has(pageAncestor.id)) {
        setCollapsedPageIds((prev) => {
          const next = new Set(prev);
          next.delete(pageAncestor.id);
          return next;
        });
      }
      setSelectedIds(new Set([id]));
      setFocusId(id);
      // Scroll after render
      requestAnimationFrame(() => {
        const el = document.querySelector(`[data-item-id="${id}"]`);
        if (el && typeof el.scrollIntoView === 'function') {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Flash effect
          el.classList.add('ring', 'ring-2', 'ring-[#f03741]');
          setTimeout(() => {
            el.classList.remove('ring', 'ring-2', 'ring-[#f03741]');
          }, 1200);
        }
      });
    },
    [droppedItems, collapsedPageIds]
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

  // Function to reorder items within the same parent
  const reorderItems = useCallback((items, activeId, overId) => {
    const findItemAndParent = (items, targetId, parent = null) => {
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
      handleSelectItem,
    ]
  );

  // ===== Selection & Clipboard Logic =====
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setFocusId(null);
  }, []);

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
    const { children, ...rest } = node;
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
    const { children, ...rest } = node;
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

  const removeMany = useCallback(
    (ids) => {
      const idSet = new Set(ids);
      const prune = (list) =>
        list
          .filter((itm) => !idSet.has(itm.id))
          .map((itm) =>
            itm.children && itm.children.length
              ? { ...itm, children: prune(itm.children) }
              : itm
          );
      saveToHistory();
      setDroppedItems((prev) => prune(prev));
    },
    [saveToHistory]
  );

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

  const handlePaste = useCallback(() => {
    if (!clipboard) return;

    // Root-level paste fallback: if no focus and clipboard contains only pages, append at root
    if (!focusId) {
      const roots = clipboard.items;
      if (roots.length === 0) return;
      const allPages = roots.every((n) => n.type === 'page');
      if (!allPages) return; // need a focus context for non-page types
      const collectedIds = [];
      saveToHistory();
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
      saveToHistory();
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
    saveToHistory();
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
    deepCloneWithNewIdsAndCollect,
    showWarning,
    saveToHistory,
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
        } else if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          handleUndo();
        } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          handleRedo();
        }
      } else if (e.key === 'Escape') {
        clearSelection();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleCopy, handlePaste, clearSelection, handleUndo, handleRedo]);

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
      //dragged type validation
      setPendingHistorySave(true);

      const itemResult = createItemFromDraggedId(draggedItemId);
      if (!itemResult) {
        return; // Invalid draggedItemId
      }

      const { draggedType, newItem } = itemResult;

      const validation = validateDrop(
        draggedType,
        overId,
        droppedItems,
        findItemById,
        getParentContext
      );
      if (!validation.valid) {
        if (overId !== 'main-canvas') {
          const ctx = getParentContext(droppedItems, overId);
          if (ctx && canParentAccept(ctx.parentType, draggedType)) {
            setDroppedItems((prev) => insertItemBefore(prev, overId, newItem));
            setXmlTree((prev) => ({ ...prev, [newItem.id]: newItem }));

            // Automatically open edit modal for the newly created item (if enabled)
            setEditingItem({ ...newItem });
            setIsNewlyCreatedItem(true); // Mark as newly created
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
      setIsNewlyCreatedItem(true); // Mark as newly created
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

    // Mark that we need to save to history after this operation
    setPendingHistorySave(true);

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

    const validation = validateDrop(
      draggedItem.type,
      overId,
      droppedItems,
      findItemById,
      getParentContext
    );
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
            <span>Unofficial Questionnaire XML Builder</span>
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
          <div className="flex gap-2 items-center flex-1 justify-end whitespace-nowrap">
            {/* New Button */}
            <button
              type="button"
              onClick={handleNewXml}
              className="px-3 py-2 bg-[#f03741] text-white border border-gray-300 rounded cursor-pointer text-sm hover:bg-red-600 transition-colors flex items-center gap-2"
              title="New Questionnaire"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New
            </button>

            {/* Upload Button with Dropdown */}
            <div className="relative" ref={uploadMenuRef}>
              <button
                type="button"
                onClick={() => setUploadMenuOpen((o) => !o)}
                className="px-3 py-2 bg-white text-gray-800 border border-gray-300 rounded cursor-pointer text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
                title="Upload Questionnaire"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                Upload
                <span
                  className={`transition-transform text-xs ${
                    uploadMenuOpen ? 'rotate-180' : ''
                  }`}
                >
                  ▾
                </span>
              </button>
              {uploadMenuOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded shadow-lg z-50 text-sm py-1">
                  <button
                    className="flex w-full justify-between items-center text-left px-3 py-2 hover:bg-gray-100"
                    onClick={() => {
                      setUploadMenuOpen(false);
                      xmlLoaderRef.current?.openFileDialog();
                    }}
                  >
                    <span>From File...</span>
                  </button>
                  <button
                    className="flex w-full justify-between items-center text-left px-3 py-2 hover:bg-gray-100"
                    onClick={() => {
                      setUploadMenuOpen(false);
                      setShowPasteXml(true);
                    }}
                  >
                    <span>Paste XML...</span>
                  </button>
                </div>
              )}
            </div>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleExportXml}
              disabled={droppedItems.length === 0}
              className="px-3 py-2 bg-white text-gray-800 border border-gray-300 rounded cursor-pointer text-sm hover:bg-gray-100 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Save XML"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              Save
            </button>

            <XmlLoader
              ref={xmlLoaderRef}
              onLoadXml={(items, raw, fileName) => {
                setUploadMenuOpen(false);
                handleLoadXml(items, raw, fileName);
              }}
            />
          </div>
        </div>

        <div
          className="flex flex-1 w-full overflow-hidden"
          style={{ height: `calc(100vh - ${previewHeight + 56}px)` }}
        >
          {/* The Sidebar with Draggable items */}
          <div className="w-64 min-w-64 p-4 bg-gray-100 border-r border-gray-300 overflow-x-hidden overflow-y-auto h-full">
            {/* Toggle Button for Auto-Edit */}
            <div className="mb-4">
              <button
                onClick={() => setAutoEdit(!autoEdit)}
                className="w-full px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200"
                style={{
                  backgroundColor: autoEdit ? '#f03741' : '#e5e7eb',
                  color: autoEdit ? 'white' : '#374151',
                }}
                title={
                  autoEdit
                    ? 'Edit on Drop enabled: Edit modal opens immediately when dropping components'
                    : 'Edit on Drop disabled: Click components to edit them'
                }
              >
                Edit on Drop
              </button>
            </div>

            <div className="block overflow-hidden">
              {/* Basic Components */}
              {/* Draggable Components (previously gated by basic mode) */}
              <SidebarDraggableComponents isValidDrop={isValidDrop} />
            </div>
          </div>

          {/* The Droppable Canvas */}
          <div className="flex-1 p-4 overflow-auto h-full w-auto relative">
            {/* Floating Toolbar */}
            <div className="sticky top-0 z-10 mb-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg px-4 py-1.5">
              <div className="flex items-center gap-2">
                {/* Copy/Cut/Paste Buttons */}
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs rounded border bg-white hover:bg-gray-100 disabled:opacity-40 transition-colors"
                  disabled={selectedIds.size === 0}
                  onClick={() => handleCopy(false)}
                  title="Copy (Ctrl+C)"
                >
                  Copy
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs rounded border bg-white hover:bg-gray-100 disabled:opacity-40 transition-colors"
                  disabled={selectedIds.size === 0}
                  onClick={() => handleCopy(true)}
                  title="Cut (Ctrl+X)"
                >
                  Cut
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs rounded border bg-white hover:bg-gray-100 disabled:opacity-40 transition-colors"
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

                {/* Separator */}
                <div className="mx-2 h-4 w-px bg-gray-300" />

                <button
                  type="button"
                  className="px-3 py-1.5 text-xs rounded border bg-white hover:bg-gray-100 disabled:opacity-40 transition-colors"
                  disabled={historyIndex <= 0}
                  onClick={handleUndo}
                  title="Undo (Ctrl+Z)"
                >
                  Undo
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs rounded border bg-white hover:bg-gray-100 disabled:opacity-40 transition-colors"
                  disabled={historyIndex >= historyStack.length - 1}
                  onClick={handleRedo}
                  title="Redo (Ctrl+Y)"
                >
                  Redo
                </button>

                {/* Separator */}
                <div className="mx-2 h-4 w-px bg-gray-300" />

                {/* Expand/Collapse Answers Button */}
                {(() => {
                  // compute button label based on expandedAnswerIds
                  const allQuestionIds = [];
                  const walk = (list) => {
                    for (const itm of list) {
                      if (itm.type === 'question') allQuestionIds.push(itm.id);
                      if (itm.children && itm.children.length)
                        walk(itm.children);
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
                      className="px-3 py-1.5 text-xs rounded border bg-white hover:bg-gray-100 transition-colors"
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

                {/* Toggle Expand/Collapse All Pages */}
                {(() => {
                  const pageIds = [];
                  const collectPages = (list) => {
                    for (const itm of list) {
                      if (itm.type === 'page') pageIds.push(itm.id);
                      if (itm.children && itm.children.length)
                        collectPages(itm.children);
                    }
                  };
                  collectPages(droppedItems);
                  const anyPages = pageIds.length > 0;
                  const allExpanded =
                    anyPages &&
                    pageIds.every((id) => !collapsedPageIds.has(id));
                  const nextActionExpand = !allExpanded; // if not all expanded, button expands; else collapses
                  const label = nextActionExpand
                    ? 'Expand Pages'
                    : 'Collapse Pages';
                  const title = nextActionExpand
                    ? 'Expand all pages'
                    : 'Collapse all pages';
                  return (
                    <button
                      type="button"
                      className="ml-2 px-3 py-1.5 text-xs rounded border bg-white hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!anyPages}
                      onClick={() => {
                        if (nextActionExpand) {
                          // expand all -> clear collapsed set
                          setCollapsedPageIds(new Set());
                        } else {
                          // collapse all -> add all page ids
                          setCollapsedPageIds(new Set(pageIds));
                        }
                      }}
                      title={!anyPages ? 'No pages yet' : title}
                    >
                      {label}
                    </button>
                  );
                })()}

                {/* Advanced Features Toggle */}
                <button
                  type="button"
                  onClick={() =>
                    setShowAdvanced((v) => {
                      const next = !v;
                      try {
                        // Broadcast change so other components (e.g., PreviewSection) can react immediately
                        window.dispatchEvent(
                          new CustomEvent('qb-advanced-toggle', {
                            detail: next,
                          })
                        );
                      } catch {
                        // Ignore any errors when dispatching the event
                      }
                      return next;
                    })
                  }
                  className={`ml-2 px-3 py-1.5 rounded text-xs font-semibold border transition-colors ${
                    showAdvanced
                      ? 'bg-white text-[#f03741] border-[#fbc5c8] hover:bg-[#fff5f5]'
                      : 'bg-[#f03741] text-white border-[#f03741] hover:bg-[#d82f36]'
                  }`}
                  title={
                    showAdvanced
                      ? 'Hide advanced features'
                      : 'Show advanced features'
                  }
                >
                  {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
                </button>
              </div>
            </div>

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
            onXmlEdit={handleXmlEdit}
            onNavigateToItem={navigateToItem}
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
            <DragOverlayContent activeId={activeId} />
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
        showAdvanced={showAdvanced}
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
