import { useState, useEffect, useCallback } from 'react';

export const useHistory = (droppedItems, xmlTree, maxHistorySize = 50) => {
    const [historyStack, setHistoryStack] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [pendingHistorySave, setPendingHistorySave] = useState(false);

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

    const handleUndo = useCallback((setDroppedItems, setXmlTree, setSelectedIds, setFocusId) => {
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

    const handleRedo = useCallback((setDroppedItems, setXmlTree, setSelectedIds, setFocusId) => {
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

    return {
        historyStack,
        historyIndex,
        saveToHistory,
        setPendingHistorySave,
        handleUndo,
        handleRedo,
    };
};
