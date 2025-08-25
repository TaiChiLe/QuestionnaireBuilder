import { useDraggable, useDroppable } from '@dnd-kit/core';

function DroppableItem({
  item,
  onRemove,
  onEdit,
  children,
  isCollapsed,
  onToggleCollapse,
  parentType = 'root',
}) {
  // Draggable (suppress keyboard activators later)
  const {
    attributes,
    listeners,
    setNodeRef: dragRef,
    transform,
    isDragging,
  } = useDraggable({ id: item.id });
  const { setNodeRef: dropRef, isOver } = useDroppable({ id: item.id });
  // We'll only apply drag listeners to the dedicated handle button

  const transformStyle = transform
    ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
    : undefined;

  return (
    <div
      ref={(node) => {
        dragRef(node);
        dropRef(node);
      }}
      className={`group my-1.5 p-2.5 rounded cursor-default select-none relative w-full text-sm
        ${
          isOver
            ? 'border-2 border-green-500 bg-green-50'
            : `border border-gray-300 ${
                parentType === 'page' && item.type !== 'page'
                  ? 'bg-gray-50'
                  : 'bg-gray-100'
              }`
        }
        ${isDragging ? 'opacity-30 bg-blue-50' : ''}
        ${!isDragging ? 'transition-all duration-200' : ''}
        ${isDragging ? 'z-[1000]' : 'z-[1]'}
      `}
      style={{ transform: transformStyle }}
      tabIndex={-1}
      role="presentation"
    >
      <div
        className="flex justify-between items-center rounded-md -m-1.5 p-1.5 border border-transparent hover:border-blue-400 hover:shadow-sm transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          if (
            onEdit &&
            (item.type === 'question' ||
              item.type === 'page' ||
              item.type === 'field' ||
              item.type === 'information' ||
              item.type === 'table' ||
              item.type === 'table-field')
          ) {
            onEdit(item.id);
          }
        }}
      >
        <span className="font-bold flex items-center">
          {/* Drag handle button */}
          <button
            type="button"
            className={`mr-2 w-6 h-6 flex items-center justify-center rounded border text-xs font-semibold cursor-grab active:cursor-grabbing transition-colors ${
              isDragging ? 'bg-gray-300' : 'bg-white hover:bg-gray-100'
            }`}
            aria-label="Drag item"
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              // prevent triggering edit when clicking handle
              e.stopPropagation();
            }}
            {...listeners}
            {...attributes}
          >
            <svg
              className="w-3 h-3 text-gray-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <circle cx="5" cy="5" r="1.5" />
              <circle cx="10" cy="5" r="1.5" />
              <circle cx="15" cy="5" r="1.5" />
              <circle cx="5" cy="10" r="1.5" />
              <circle cx="10" cy="10" r="1.5" />
              <circle cx="15" cy="10" r="1.5" />
            </svg>
          </button>
          {item.type === 'page' && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleCollapse && onToggleCollapse();
              }}
              className={`mr-2 w-6 h-6 flex items-center justify-center rounded border text-xs font-semibold transition-colors cursor-pointer ${
                isCollapsed
                  ? 'bg-gray-200 hover:bg-gray-300'
                  : 'bg-white hover:bg-gray-100'
              }`}
              title={isCollapsed ? 'Expand Page' : 'Collapse Page'}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {isCollapsed ? '+' : '−'}
            </button>
          )}
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
          {item.required && (
            <span className="text-red-500 ml-1" title="Required">
              *
            </span>
          )}
          {(item.type === 'question' || item.type === 'field') &&
            item.dataType && (
              <span className="text-xs text-gray-500 ml-2 font-normal mr-2">
                [{item.dataType}]
              </span>
            )}
          {item.type === 'table' && (
            <span className="text-xs text-gray-500 ml-2 font-normal mr-2">
              [Table]
            </span>
          )}
          {item.type === 'information' && (
            <span className="text-xs text-gray-500 ml-2 font-normal mr-2">
              [info]
            </span>
          )}
          {item.type === 'table-field' && item.dataType && (
            <span className="text-xs text-gray-500 ml-2 font-normal mr-2">
              [{item.dataType.toLowerCase()}]
            </span>
          )}
        </span>
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove(item.id);
            }}
            className="px-4 py-3 bg-red-50 text-[#f03741] border border-red-200 rounded text-xs font-bold relative z-10 cursor-pointer hover:bg-red-100"
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            Remove
          </button>
        </div>
      </div>
      {!isCollapsed && children && (
        <div className="mt-2.5 pl-5 border-l-2 border-dashed border-gray-300">
          {children}
        </div>
      )}
      {item.type === 'page' && !isCollapsed && <div className="h-8 w-full" />}
      {item.type === 'table' && <div className="h-8 w-full" />}
    </div>
  );
}

export default DroppableItem;
