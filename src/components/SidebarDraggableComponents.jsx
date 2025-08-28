import DraggableItem from './DraggableItem';

/**
 * SidebarDraggableComponents Component
 *
 * Contains all the draggable component items that can be dragged from the sidebar
 * to create new questionnaire elements. Now supports both questionnaire and clinical
 * form builder modes with different available components.
 */

const SidebarDraggableComponents = ({
  isValidDrop,
  builderMode = 'questionnaire',
  isDarkMode,
}) => {
  // Questionnaire builder components
  const questionnaireComponents = (
    <>
      {/* Page Component */}
      <div className="mb-2">
        <DraggableItem
          id="form-tag"
          isValidDrop={isValidDrop}
          isDarkMode={isDarkMode}
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
              className={`w-5 h-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              <rect x="3" y="4" width="18" height="16" rx="2" ry="2" />
              <path d="M3 10h18" />
              <path d="M7 14h6" />
            </svg>
            <span>Page</span>
          </span>
        </DraggableItem>
      </div>

      {/* Basic Field Components */}
      <div className="mb-2">
        <DraggableItem
          id="date-tag"
          isValidDrop={isValidDrop}
          isDarkMode={isDarkMode}
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
              className={`w-5 h-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
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
        <DraggableItem
          id="information-tag"
          isValidDrop={isValidDrop}
          isDarkMode={isDarkMode}
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
              className={`w-5 h-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
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
        <DraggableItem
          id="list-box-tag"
          isValidDrop={isValidDrop}
          isDarkMode={isDarkMode}
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
              className={`w-5 h-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
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
          isDarkMode={isDarkMode}
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
              className={`w-5 h-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
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
        <DraggableItem
          id="notes-tag"
          isValidDrop={isValidDrop}
          isDarkMode={isDarkMode}
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
              className={`w-5 h-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
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
          isDarkMode={isDarkMode}
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
              className={`w-5 h-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
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
        <DraggableItem
          id="table-tag"
          isValidDrop={isValidDrop}
          isDarkMode={isDarkMode}
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
              className={`w-5 h-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
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
        <DraggableItem
          id="table-field-tag"
          isValidDrop={isValidDrop}
          isDarkMode={isDarkMode}
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
              className={`w-5 h-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
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
        <DraggableItem
          id="text-box-tag"
          isValidDrop={isValidDrop}
          isDarkMode={isDarkMode}
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
              className={`w-5 h-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
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

  // Clinical form builder components (based on XSD schema)
  const clinicalComponents = (
    <>
      {/* Form - Root element */}
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
              className="w-5 h-5 text-blue-600"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span>Form</span>
          </span>
        </DraggableItem>
      </div>

      {/* Container Elements */}
      <div className="mb-2">
        <DraggableItem id="panel-tag" isValidDrop={isValidDrop}>
          <span className="inline-flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-blue-500"
            >
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M3 10h18" />
            </svg>
            <span>Panel</span>
          </span>
        </DraggableItem>
      </div>

      <div className="mb-2">
        <DraggableItem id="group-tag" isValidDrop={isValidDrop}>
          <span className="inline-flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-blue-400"
            >
              <rect x="3" y="6" width="18" height="12" rx="2" />
              <path d="M7 10h10" />
              <path d="M7 14h7" />
            </svg>
            <span>Group</span>
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
              className="w-5 h-5 text-blue-300"
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

      {/* Input Elements */}
      <div className="mb-2">
        <DraggableItem id="textbox-tag" isValidDrop={isValidDrop}>
          <span className="inline-flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-green-600"
            >
              <rect x="4" y="6" width="16" height="4" rx="1" />
              <path d="M6 8h12" />
            </svg>
            <span>Text Box</span>
          </span>
        </DraggableItem>
      </div>

      <div className="mb-2">
        <DraggableItem id="textarea-tag" isValidDrop={isValidDrop}>
          <span className="inline-flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-green-500"
            >
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <path d="M8 8h8" />
              <path d="M8 12h8" />
              <path d="M8 16h6" />
            </svg>
            <span>Text Area</span>
          </span>
        </DraggableItem>
      </div>

      <div className="mb-2">
        <DraggableItem id="check-tag" isValidDrop={isValidDrop}>
          <span className="inline-flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-green-400"
            >
              <rect x="3" y="5" width="6" height="6" rx="1" />
              <path d="M21 7L13 15l-3-3" />
            </svg>
            <span>Checkbox</span>
          </span>
        </DraggableItem>
      </div>

      <div className="mb-2">
        <DraggableItem id="radio-tag" isValidDrop={isValidDrop}>
          <span className="inline-flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-green-300"
            >
              <circle cx="7" cy="7" r="3" />
              <circle cx="7" cy="17" r="3" />
              <path d="M14 7h7" />
              <path d="M14 17h7" />
            </svg>
            <span>Radio Button</span>
          </span>
        </DraggableItem>
      </div>

      <div className="mb-2">
        <DraggableItem id="list-tag" isValidDrop={isValidDrop}>
          <span className="inline-flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-green-200"
            >
              <rect x="3" y="6" width="18" height="12" rx="2" />
              <path d="M7 9h10" />
              <path d="M7 12h7" />
              <path d="M7 15h5" />
            </svg>
            <span>List</span>
          </span>
        </DraggableItem>
      </div>

      {/* Date Elements */}
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
              className="w-5 h-5 text-purple-600"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Date</span>
          </span>
        </DraggableItem>
      </div>

      <div className="mb-2">
        <DraggableItem id="future_date-tag" isValidDrop={isValidDrop}>
          <span className="inline-flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-purple-500"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <path d="M8 14l2 2 4-4" />
            </svg>
            <span>Future Date</span>
          </span>
        </DraggableItem>
      </div>

      {/* Button Elements */}
      <div className="mb-2">
        <DraggableItem id="button-tag" isValidDrop={isValidDrop}>
          <span className="inline-flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-orange-600"
            >
              <rect x="3" y="8" width="18" height="8" rx="2" />
              <path d="M12 12h.01" />
            </svg>
            <span>Button</span>
          </span>
        </DraggableItem>
      </div>

      <div className="mb-2">
        <DraggableItem id="form_button-tag" isValidDrop={isValidDrop}>
          <span className="inline-flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-orange-500"
            >
              <rect x="3" y="8" width="18" height="8" rx="2" />
              <path d="M9 12h6" />
              <path d="M12 9v6" />
            </svg>
            <span>Form Button</span>
          </span>
        </DraggableItem>
      </div>

      {/* Clinical-specific Elements */}
      <div className="mb-2">
        <DraggableItem id="metafield-tag" isValidDrop={isValidDrop}>
          <span className="inline-flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-red-600"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            <span>Metafield</span>
          </span>
        </DraggableItem>
      </div>

      <div className="mb-2">
        <DraggableItem id="metafields-tag" isValidDrop={isValidDrop}>
          <span className="inline-flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-red-500"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              <path d="M2 20h20" />
            </svg>
            <span>Metafields</span>
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
              className="w-5 h-5 text-yellow-600"
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
        <DraggableItem id="notes_with_history-tag" isValidDrop={isValidDrop}>
          <span className="inline-flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-yellow-500"
            >
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <path d="M8 8h8" />
              <path d="M8 12h8" />
              <path d="M8 16h6" />
              <circle cx="18" cy="6" r="2" />
            </svg>
            <span>Notes with History</span>
          </span>
        </DraggableItem>
      </div>

      <div className="mb-2">
        <DraggableItem id="prescriptions-tag" isValidDrop={isValidDrop}>
          <span className="inline-flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-indigo-600"
            >
              <rect x="3" y="8" width="18" height="4" rx="1" />
              <path d="M12 8v13" />
              <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
            </svg>
            <span>Prescriptions</span>
          </span>
        </DraggableItem>
      </div>

      <div className="mb-2">
        <DraggableItem id="services-tag" isValidDrop={isValidDrop}>
          <span className="inline-flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-teal-600"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span>Services</span>
          </span>
        </DraggableItem>
      </div>

      {/* Display Elements */}
      <div className="mb-2">
        <DraggableItem id="info-tag" isValidDrop={isValidDrop}>
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
            <span>Info</span>
          </span>
        </DraggableItem>
      </div>

      <div className="mb-2">
        <DraggableItem id="chart-tag" isValidDrop={isValidDrop}>
          <span className="inline-flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-cyan-600"
            >
              <path d="M18 20V10" />
              <path d="M12 20V4" />
              <path d="M6 20v-6" />
            </svg>
            <span>Chart</span>
          </span>
        </DraggableItem>
      </div>

      {/* Functions */}
      <div className="mb-2">
        <DraggableItem id="functions-tag" isValidDrop={isValidDrop}>
          <span className="inline-flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-pink-600"
            >
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            <span>Functions</span>
          </span>
        </DraggableItem>
      </div>
    </>
  );

  return builderMode === 'questionnaire'
    ? questionnaireComponents
    : clinicalComponents;
};

export default SidebarDraggableComponents;
