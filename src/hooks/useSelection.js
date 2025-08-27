import { useState, useEffect, useCallback } from 'react';
import { generateId } from '../components/utils/id';

export const useSelection = (droppedItems) => {
    const [selectedIds, setSelectedIds] = useState(() => new Set());
    const [focusId, setFocusId] = useState(null);
    const [clipboard, setClipboard] = useState(null); // { items: [], isCut: bool }

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

    return {
        selectedIds,
        setSelectedIds,
        focusId,
        setFocusId,
        clipboard,
        setClipboard,
        clearSelection,
        normalizeSelection,
        handleSelectItem,
        getSelectedRootNodes,
        deepCloneWithNewIds,
        deepCloneWithNewIdsAndCollect,
    };
};
