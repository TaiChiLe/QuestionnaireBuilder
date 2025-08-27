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
import UserGuideModal from './components/UserGuideModal';
import PasteXmlModal from './components/PasteXmlModal';
import { Sidebar } from './components/sidebar/Sidebar';

// Utils
import { generateOrderedXML } from './components/utils/xmlBuilder2Solution';
import { exportXmlStructure } from './components/utils/xmlExporter';
import {
  parseXmlToItems,
  extractQuestionnaireName,
} from './components/utils/xmlParser';
import { generateId } from './components/utils/id';

// Hooks
import { useHistory } from './hooks/useHistory';
import { usePreviewResize } from './hooks/usePreviewResize';
import { useSelection } from './hooks/useSelection';
import { useDragAndDropHelpers } from './hooks/useDragAndDropHelpers';
import { useValidation } from './hooks/useValidation';
import { useHtmlGenerator } from './hooks/useHtmlGenerator';

// Constants
import {
  SIDEBAR_ITEMS,
  DRAG_TYPES,
  DEFAULT_ITEMS,
  COMPONENT_SPECIFIC_ITEMS,
} from './constants/dragAndDrop';

function App() {
  const [xmlTree, setXmlTree] = useState({});
  const [droppedItems, setDroppedItems] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [isValidDrop, setIsValidDrop] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [isNewlyCreatedItem, setIsNewlyCreatedItem] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showNewXmlModal, setShowNewXmlModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [showUserGuide, setShowUserGuide] = useState(false);
  const [showPasteXml, setShowPasteXml] = useState(false);
  const [collapsedPageIds, setCollapsedPageIds] = useState(() => new Set());
  const xmlLoaderRef = useRef(null);
  const [uploadMenuOpen, setUploadMenuOpen] = useState(false);
  const uploadMenuRef = useRef(null);
  const [questionnaireName, setQuestionnaireName] = useState('');
  const [builderMode, setBuilderMode] = useState('questionnaire');
  const [expandedAnswerIds, setExpandedAnswerIds] = useState(() => new Set());
  const [autoEdit, setAutoEdit] = useState(() => {
    try {
      const stored = localStorage.getItem('qb_auto_edit');
      return stored !== null ? stored === 'true' : true;
    } catch (_) {
      return true;
    }
  });

  // Use extracted hooks
  const {
    historyStack,
    historyIndex,
    saveToHistory,
    setPendingHistorySave,
    handleUndo: undoAction,
    handleRedo: redoAction,
  } = useHistory(droppedItems, xmlTree);

  const {
    previewHeight,
    isPreviewCollapsed,
    setIsPreviewCollapsed,
    startResize,
  } = usePreviewResize();

  const {
    selectedIds,
    setSelectedIds,
    focusId,
    setFocusId,
    clipboard,
    setClipboard,
    clearSelection,
    handleSelectItem,
    getSelectedRootNodes,
    deepCloneWithNewIds,
    deepCloneWithNewIdsAndCollect,
  } = useSelection(droppedItems);

  const {
    findItemById,
    getParentContext,
    addChildToItem,
    moveItemToTopLevel,
    moveItemToParent,
    reorderItems,
    insertItemBefore,
    extractItem,
  } = useDragAndDropHelpers();

  const { canParentAccept, validateDrop } = useValidation();

  const { generateHtmlPreview } = useHtmlGenerator();

  // Save auto-edit preference to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('qb_auto_edit', autoEdit ? 'true' : 'false');
    } catch (_) {
      /* noop */
    }
  }, [autoEdit]);

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

  // Real-time XML generation
  const currentXmlString = useMemo(() => {
    return generateOrderedXML(droppedItems);
  }, [droppedItems]);

  // Generate HTML preview
  const currentHtmlString = useMemo(() => {
    return generateHtmlPreview(droppedItems);
  }, [droppedItems, generateHtmlPreview]);

  function handleDragStart(event) {
    setActiveId(event.active.id);
    setIsValidDrop(true);
  }

  function handleDragOver(event) {
    const { active, over } = event;

    if (!over || !active) {
      setIsValidDrop(true);
      return;
    }

    const isSidebarItem = SIDEBAR_ITEMS.includes(active.id);

    if (isSidebarItem) {
      const draggedType = DRAG_TYPES[active.id] || 'page';
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

  // Function to remove an item
  const removeItem = useCallback(
    (itemId) => {
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

  // Function to handle editing an item
  const handleEditItem = useCallback(
    (itemId) => {
      const item = findItemById(droppedItems, itemId);
      if (item) {
        setEditingItem({ ...item });
        setIsNewlyCreatedItem(false);
        setShowEditModal(true);
      }
    },
    [droppedItems, findItemById]
  );

  // Function to save edited item
  const handleSaveEdit = useCallback(
    (editedItem) => {
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
      setIsNewlyCreatedItem(false);
    },
    [saveToHistory, isNewlyCreatedItem]
  );

  // Function to cancel edit
  const handleCancelEdit = useCallback(() => {
    setShowEditModal(false);
    setEditingItem(null);
    setIsNewlyCreatedItem(false);
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
    setXmlTree({});
    setShowNewXmlModal(false);
    setQuestionnaireName('');
  }, [saveToHistory]);

  // Function to cancel new XML creation
  const cancelNewXml = useCallback(() => {
    setShowNewXmlModal(false);
  }, []);

  // Function to handle loading XML
  const handleLoadXml = useCallback(
    (parsedItems, rawXmlText, fileName) => {
      saveToHistory();
      setDroppedItems(parsedItems);
      if (fileName) {
        const base = fileName.replace(/\\.xml$/i, '');
        setQuestionnaireName(base);
      }
      if (typeof rawXmlText === 'string') {
        try {
          const hasClinicalForms = /<clinicalforms\\b/i.test(rawXmlText);
          const hasStatuses = /<statuses\\b/i.test(rawXmlText);
          const hasSexAttr = /\\bsex\\s*=\\s*['\"]/i.test(rawXmlText);
          const hasInformationStyle =
            /<information\\b[^>]*\\bstyle\\s*=\\s*['\"]/i.test(rawXmlText);

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
        } catch (e) {
          // ignore parse errors
        }
      }
    },
    [showWarning, saveToHistory]
  );

  // Function to handle direct XML editing
  const handleXmlEdit = useCallback(
    async (editedXmlString) => {
      try {
        const parsedItems = parseXmlToItems(editedXmlString);
        const newQuestionnaireName = extractQuestionnaireName(editedXmlString);

        saveToHistory();

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

        setDroppedItems(parsedItems);
        setXmlTree(rebuildXmlTree(parsedItems));

        if (
          newQuestionnaireName &&
          newQuestionnaireName !== questionnaireName
        ) {
          setQuestionnaireName(newQuestionnaireName);
        }

        setSelectedIds(new Set());
        setFocusId(null);

        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    [saveToHistory, questionnaireName, setSelectedIds, setFocusId]
  );

  // Navigate from error panel to a specific item on canvas
  const navigateToItem = useCallback(
    (id) => {
      if (!id) return;
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
      requestAnimationFrame(() => {
        const el = document.querySelector(`[data-item-id="${id}"]`);
        if (el && typeof el.scrollIntoView === 'function') {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring', 'ring-2', 'ring-[#f03741]');
          setTimeout(() => {
            el.classList.remove('ring', 'ring-2', 'ring-[#f03741]');
          }, 1200);
        }
      });
    },
    [droppedItems, collapsedPageIds, setSelectedIds, setFocusId]
  );

  // Recursive renderer to display items and nested children
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
        setClipboard({ items: roots, isCut: true });
        removeMany(roots.map((r) => r.id));
        setFocusId(null);
        setSelectedIds(new Set());
      } else {
        const clones = roots.map((r) => deepCloneWithNewIds(r));
        setClipboard({ items: clones, isCut: false });
      }
    },
    [
      selectedIds,
      getSelectedRootNodes,
      removeMany,
      deepCloneWithNewIds,
      setClipboard,
      setFocusId,
      setSelectedIds,
    ]
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
              updated;
          }
        }
      }
      return out;
    };
    return walk(items);
  }, []);

  const handlePaste = useCallback(() => {
    if (!clipboard) return;

    if (!focusId) {
      const roots = clipboard.items;
      if (roots.length === 0) return;
      const allPages = roots.every((n) => n.type === 'page');
      if (!allPages) return;
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
    const targetNode = focusCtx.target;
    const parentType = focusCtx.parentType;
    const parentId = focusCtx.parentId;
    const siblings = focusCtx.siblings;
    const focusIndex = siblings.findIndex((s) => s.id === focusId);
    const roots = clipboard.items;

    const isContainer = ['page', 'question', 'table'].includes(targetNode.type);
    let mode = 'sibling';
    if (isContainer) {
      const allowedInside = roots.filter((n) =>
        canParentAccept(targetNode.type, n.type)
      );
      if (allowedInside.length > 0) {
        mode = 'append-children';
      }
    }

    const collectedIds = [];

    if (mode === 'append-children') {
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
    canParentAccept,
    deepCloneWithNewIdsAndCollect,
    showWarning,
    saveToHistory,
    setSelectedIds,
    setFocusId,
    setClipboard,
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
          undoAction(setDroppedItems, setXmlTree, setSelectedIds, setFocusId);
        } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          redoAction(setDroppedItems, setXmlTree, setSelectedIds, setFocusId);
        }
      } else if (e.key === 'Escape') {
        clearSelection();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [
    handleCopy,
    handlePaste,
    clearSelection,
    undoAction,
    redoAction,
    setDroppedItems,
    setXmlTree,
    setSelectedIds,
    setFocusId,
  ]);

  function handleDragEnd(event) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const draggedItemId = active.id;
    const overId = over.id;
    const isSidebarItem = SIDEBAR_ITEMS.includes(draggedItemId);

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
    if (!validDropTargets.includes(overId)) return;

    if (isSidebarItem) {
      setPendingHistorySave(true);

      const draggedType = DRAG_TYPES[draggedItemId];
      const baseItem =
        COMPONENT_SPECIFIC_ITEMS[draggedItemId] || DEFAULT_ITEMS[draggedType];

      if (!baseItem) return;

      const newItem = {
        ...baseItem,
        id: generateId(draggedType),
        answers: baseItem.answers?.map((answer) => ({
          ...answer,
          id: generateId('answer'),
        })),
      };

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
            setEditingItem({ ...newItem });
            setIsNewlyCreatedItem(true);
            if (autoEdit) setShowEditModal(true);
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

      setEditingItem({ ...newItem });
      setIsNewlyCreatedItem(true);
      if (autoEdit) setShowEditModal(true);
      return;
    }

    // Existing item move
    if (!existingItemIds.includes(draggedItemId)) return;
    if (draggedItemId === overId) return;

    const draggedItem = findItemById(droppedItems, draggedItemId);
    if (!draggedItem) return;

    setPendingHistorySave(true);

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
      if (overId !== 'main-canvas') {
        const ctx = getParentContext(droppedItems, overId);
        if (ctx && canParentAccept(ctx.parentType, draggedItem.type)) {
          setDroppedItems((prev) => {
            const liveCtx = getParentContext(prev, overId);
            if (!liveCtx) return prev;
            const siblings = liveCtx.siblings;
            const alreadySibling = siblings.some((s) => s.id === draggedItemId);
            if (alreadySibling) {
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
              const replace = (list, parentId) => {
                if (!parentId) return newSiblings;
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
      const draggedCtx = getParentContext(droppedItems, draggedItemId);
      if (draggedCtx && draggedCtx.parentId === overId) {
        return;
      }
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
      autoScroll={{ layoutShiftCompensation: false }}
    >
      <div className="flex flex-col h-screen w-screen m-0 p-0 overflow-hidden fixed top-0 left-0">
        {/* Header with export button */}
        <div className="px-4 py-2 border-b border-gray-300 bg-gray-50 flex-shrink-0 flex justify-between items-center w-full">
          <h1 className="m-0 text-2xl flex items-center gap-4 flex-1 justify-start whitespace-nowrap">
            <button
              type="button"
              onClick={() =>
                setBuilderMode((prev) =>
                  prev === 'questionnaire' ? 'clinical' : 'questionnaire'
                )
              }
              className="px-4 py-2 bg-white border-2 border-[#f03741] text-[#f03741] rounded-md hover:bg-[#f03741] hover:text-white transition-colors font-semibold text-xl"
              title="Toggle between Questionnaire and Clinical Form builders"
            >
              {builderMode === 'questionnaire'
                ? 'Questionnaire XML Builder'
                : 'Clinical Form XML Builder'}
            </button>
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
          <Sidebar
            builderMode={builderMode}
            isValidDrop={isValidDrop}
            autoEdit={autoEdit}
            setAutoEdit={setAutoEdit}
          />

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
                  onClick={() =>
                    undoAction(
                      setDroppedItems,
                      setXmlTree,
                      setSelectedIds,
                      setFocusId
                    )
                  }
                  title="Undo (Ctrl+Z)"
                >
                  Undo
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs rounded border bg-white hover:bg-gray-100 disabled:opacity-40 transition-colors"
                  disabled={historyIndex >= historyStack.length - 1}
                  onClick={() =>
                    redoAction(
                      setDroppedItems,
                      setXmlTree,
                      setSelectedIds,
                      setFocusId
                    )
                  }
                  title="Redo (Ctrl+Y)"
                >
                  Redo
                </button>

                {/* Separator */}
                <div className="mx-2 h-4 w-px bg-gray-300" />

                {/* Expand/Collapse Answers Button */}
                {(() => {
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
                  const nextActionExpand = !allExpanded;
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
                          setCollapsedPageIds(new Set());
                        } else {
                          setCollapsedPageIds(new Set(pageIds));
                        }
                      }}
                      title={!anyPages ? 'No pages yet' : title}
                    >
                      {label}
                    </button>
                  );
                })()}
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
                default:
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
