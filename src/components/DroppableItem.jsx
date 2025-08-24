import { useDraggable, useDroppable } from '@dnd-kit/core';

function DroppableItem({ item, onRemove, onEdit, children }) {
  // Set up dragging
  const {
    attributes,
    listeners,
    setNodeRef: dragRef,
    transform,
    isDragging,
  } = useDraggable({
    id: item.id,
  });

  // Set up dropping
  const { setNodeRef: dropRef, isOver } = useDroppable({
    id: item.id,
  });

  const transformStyle = transform
    ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
    : undefined;

  return (
    <div
      ref={(node) => {
        dragRef(node);
        dropRef(node);
      }}
      className={`
        my-1.5 p-2.5 rounded cursor-grab select-none relative w-full text-sm
        ${
          isOver
            ? 'border-2 border-green-500 bg-green-50'
            : 'border border-gray-300 bg-gray-50'
        }
        ${isDragging ? 'opacity-30 bg-blue-50' : ''}
        ${!isDragging ? 'transition-all duration-200' : ''}
        ${isDragging ? 'z-[1000]' : 'z-[1]'}
      `}
      style={{
        transform: transformStyle,
      }}
      {...listeners}
      {...attributes}
    >
      <div className="flex justify-between items-center">
        <span className="font-bold flex items-center">
          {/* Eye icon for components with visibility conditions */}
          {item.conditions && item.conditions.length > 0 && (
            <svg
              className="w-4 h-4 text-gray-600 mr-2 inline"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fillRule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {item.type === 'page' ? item.title || 'Page' : item.label}
          {(item.type === 'question' || item.type === 'field') &&
            item.dataType && (
              <span className="text-xs text-gray-500 ml-2 font-normal">
                [{item.dataType}]
              </span>
            )}
          {item.type === 'table' && (
            <span className="text-xs text-gray-500 ml-2 font-normal">
              [Table]
            </span>
          )}
        </span>
        <div className="flex gap-1">
          {/* Edit button - show for questions, pages, fields, information, tables, and table-fields */}
          {(item.type === 'question' ||
            item.type === 'page' ||
            item.type === 'field' ||
            item.type === 'information' ||
            item.type === 'table' ||
            item.type === 'table-field') &&
            onEdit && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit(item.id);
                }}
                className="px-4 py-3 bg-blue-50 text-blue-600 border border-blue-200 rounded text-xs font-bold relative z-10 cursor-pointer hover:bg-blue-100"
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                Edit
              </button>
            )}

          {/* Remove button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove(item.id);
            }}
            className="px-4 py-3 bg-red-50 text-red-600 border border-red-200 rounded text-xs font-bold relative z-10 cursor-pointer hover:bg-red-100"
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            Remove
          </button>
        </div>
      </div>
      {children && (
        <div className="mt-2.5 pl-5 border-l-2 border-dashed border-gray-300">
          {children}
        </div>
      )}
      {/* Add extra space at bottom for pages to make dropping easier */}
      {item.type === 'page' && <div className="h-8 w-full"></div>}
      {item.type === 'table' && <div className="h-8 w-full"></div>}
    </div>
  );
}

export default DroppableItem;
