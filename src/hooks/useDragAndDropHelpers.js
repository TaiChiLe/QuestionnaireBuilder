import { useCallback } from 'react';
import { arrayMove } from '@dnd-kit/sortable';

export const useDragAndDropHelpers = () => {
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

    return {
        findItemById,
        getParentContext,
        addChildToItem,
        moveItemToTopLevel,
        moveItemToParent,
        moveItemToParentBefore,
        reorderItems,
        insertItemBefore,
        extractItem,
    };
};
