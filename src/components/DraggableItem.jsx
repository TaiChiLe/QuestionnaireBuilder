import { useDraggable } from '@dnd-kit/core';

function DraggableItem(props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: props.id,
    });

  const transformStyle = transform
    ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
    : undefined;

  // Use the isValidDrop prop to determine styling when dragging
  const getBackgroundClass = () => {
    if (isDragging) {
      return props.isValidDrop === false
        ? props.isDarkMode
          ? 'bg-red-900 border-red-600'
          : 'bg-red-50 border-red-300'
        : props.isDarkMode
        ? 'bg-blue-900 border-blue-600'
        : 'bg-blue-50 border-blue-300';
    }
    return props.isDarkMode ? 'bg-gray-700' : 'bg-white';
  };

  const getTextColor = () => {
    return props.isDarkMode ? 'text-gray-200' : 'text-gray-800';
  };

  const getBorderColor = () => {
    if (isDragging) return '';
    return props.isDarkMode ? 'border-gray-600' : 'border-gray-300';
  };

  const getHoverClass = () => {
    if (isDragging) return '';
    return props.isDarkMode
      ? 'hover:shadow-lg hover:border-gray-500'
      : 'hover:shadow-md';
  };

  return (
    <div
      ref={setNodeRef}
      className={`
        p-2.5 my-1 border rounded cursor-grab select-none text-sm min-w-20 w-full relative
        flex items-center gap-2 ${getTextColor()}
        ${getBackgroundClass()}
        ${
          isDragging
            ? 'opacity-0 shadow-lg z-[1000]'
            : `${getBorderColor()} shadow-sm z-[1] ${getHoverClass()}`
        }
        ${!isDragging ? 'transition-all duration-200 ease-in-out' : ''}
      `}
      style={{
        transform: transformStyle,
      }}
      {...listeners}
      {...attributes}
    >
      {props.children}
    </div>
  );
}

export default DraggableItem;
