import { useDroppable } from '@dnd-kit/core';
import { useMemo } from 'react';

function DroppableArea(props) {
  const { setNodeRef, isOver } = useDroppable({ id: props.id });

  return (
    <div
      ref={setNodeRef}
      className={`
        ${
          isOver
            ? 'border-4 border-blue-500 bg-blue-50'
            : 'border-2 border-dashed border-gray-300 bg-gray-50'
        }
        min-h-screen p-4 rounded-lg transition-all duration-200 w-full relative
      `}
      style={{ minHeight: 'calc(100vh - 160px)' }}
      onClick={(e) => {
        // clicking blank canvas clears selection
        if (e.currentTarget === e.target && props.onBackgroundClick) {
          props.onBackgroundClick();
        }
      }}
    >
      {props.children}
      {/* Add spacer at the bottom for dropping new components */}
      <div
        className="h-24 w-full"
        onClick={(e) => {
          e.stopPropagation();
        }}
      ></div>
    </div>
  );
}

export default DroppableArea;
