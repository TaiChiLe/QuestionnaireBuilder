import { useDroppable } from '@dnd-kit/core';
import { useMemo } from 'react';

function DroppableArea(props) {
  const { setNodeRef, isOver } = useDroppable({ id: props.id });

  const getDropAreaStyles = () => {
    if (isOver) {
      return props.isDarkMode
        ? 'border-4 border-blue-400 bg-blue-900/20'
        : 'border-4 border-blue-500 bg-blue-50';
    }
    return props.isDarkMode
      ? 'border-2 border-dashed border-gray-600 bg-gray-800/50'
      : 'border-2 border-dashed border-gray-300 bg-gray-50';
  };

  return (
    <div
      ref={setNodeRef}
      className={`
        ${getDropAreaStyles()}
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
