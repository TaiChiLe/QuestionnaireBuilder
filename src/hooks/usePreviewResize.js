import { useState, useEffect, useCallback, useRef } from 'react';

export const usePreviewResize = (initialHeight = null) => {
    const [previewHeight, setPreviewHeight] = useState(
        initialHeight || Math.round(window.innerHeight * 0.3)
    );
    const [isPreviewCollapsed, setIsPreviewCollapsed] = useState(false);

    const isResizingRef = useRef(false);
    const lastYRef = useRef(0);

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

    return {
        previewHeight,
        setPreviewHeight,
        isPreviewCollapsed,
        setIsPreviewCollapsed,
        startResize,
    };
};
