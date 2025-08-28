import DraggableItem from './DraggableItem';

/**
 * SidebarDraggableComponents Component
 * 
 * Contains all the draggable component items that can be dragged from the sidebar
 * to create new questionnaire elements. Previously this was gated by basic mode
 * but is now always available.
 */

const SidebarDraggableComponents = ({ isValidDrop }) => {
  return (
    <>
      {/* Page Component */}
      <div className="mb-2">
        <DraggableItem id="form-tag" isValidDrop={isValidDrop}>
          <span className="inline-flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-gray-600"
            >
              <rect
                x="3"
                y="4"
                width="18"
                height="16"
                rx="2"
                ry="2"
              />
              <path d="M3 10h18" />
              <path d="M7 14h6" />
            </svg>
            <span>Page</span>
          </span>
        </DraggableItem>
      </div>

      {/* Basic Field Components */}
      <div className="mb-2">
        <DraggableItem id="date-tag" isValidDrop={isValidDrop}>
          <span className="inline-flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-gray-600"
            >
              <rect
                x="3"
                y="4"
                width="18"
                height="18"
                rx="2"
                ry="2"
              />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Date</span>
          </span>
        </DraggableItem>
      </div>

      {/* Information, Table, and Table Field - available in basic mode */}
      <div className="mb-2">
        <DraggableItem id="information-tag" isValidDrop={isValidDrop}>
          <span className="inline-flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-gray-600"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8h.01" />
              <path d="M10.5 12h1.5v4h1.5" />
            </svg>
            <span>Information</span>
          </span>
        </DraggableItem>
      </div>

      {/* Basic Question Components */}
      <div className="mb-2">
        <DraggableItem id="list-box-tag" isValidDrop={isValidDrop}>
          <span className="inline-flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-gray-600"
            >
              <rect x="3" y="6" width="18" height="12" rx="2" />
              <path d="M7 9h10" />
              <path d="M7 12h7" />
              <path d="M7 15h5" />
            </svg>
            <span>List Box</span>
          </span>
        </DraggableItem>
      </div>
      
      <div className="mb-2">
        <DraggableItem
          id="multi-select-tag"
          isValidDrop={isValidDrop}
        >
          <span className="inline-flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-gray-600"
            >
              <rect x="3" y="5" width="6" height="6" rx="1" />
              <path d="M21 7L13 15l-3-3" />
              <rect x="3" y="13" width="6" height="6" rx="1" />
              <path d="M21 15L13 23l-3-3" />
            </svg>
            <span>Multi Select</span>
          </span>
        </DraggableItem>
      </div>

      <div className="mb-2">
        <DraggableItem id="notes-tag" isValidDrop={isValidDrop}>
          <span className="inline-flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-gray-600"
            >
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <path d="M8 8h8" />
              <path d="M8 12h8" />
              <path d="M8 16h6" />
            </svg>
            <span>Notes</span>
          </span>
        </DraggableItem>
      </div>

      <div className="mb-2">
        <DraggableItem
          id="radio-buttons-tag"
          isValidDrop={isValidDrop}
        >
          <span className="inline-flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-gray-600"
            >
              <circle cx="7" cy="7" r="3" />
              <circle cx="7" cy="17" r="3" />
              <path d="M14 7h7" />
              <path d="M14 17h7" />
            </svg>
            <span>Radio Buttons</span>
          </span>
        </DraggableItem>
      </div>

      <div className="mb-2">
        <DraggableItem id="table-tag" isValidDrop={isValidDrop}>
          <span className="inline-flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-gray-600"
            >
              <rect x="3" y="6" width="18" height="12" rx="2" />
              <path d="M3 10h18" />
              <path d="M9 6v12" />
              <path d="M15 6v12" />
            </svg>
            <span>Table</span>
          </span>
        </DraggableItem>
      </div>
      
      <div className="mb-2">
        <DraggableItem id="table-field-tag" isValidDrop={isValidDrop}>
          <span className="inline-flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-gray-600"
            >
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <path d="M4 9h16" />
              <path d="M9 4v16" />
            </svg>
            <span>Table Field</span>
          </span>
        </DraggableItem>
      </div>

      <div className="mb-2">
        <DraggableItem id="text-box-tag" isValidDrop={isValidDrop}>
          <span className="inline-flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-gray-600"
            >
              <rect x="4" y="6" width="16" height="4" rx="1" />
              <path d="M6 8h12" />
            </svg>
            <span>Text Box</span>
          </span>
        </DraggableItem>
      </div>
    </>
  );
};

export default SidebarDraggableComponents;
