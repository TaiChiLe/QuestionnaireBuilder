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
        ? 'bg-red-50 border-red-300'
        : 'bg-blue-50 border-blue-300';
    }
    return 'bg-white';
  };

  return (
    <div
      ref={setNodeRef}
      className={`
        p-2.5 my-1 border rounded cursor-grab select-none text-sm text-center min-w-20 w-full relative
        ${getBackgroundClass()}
        ${
          isDragging
            ? 'opacity-50 shadow-lg z-[1000]'
            : 'border-gray-300 shadow-sm z-[1] hover:shadow-md'
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
