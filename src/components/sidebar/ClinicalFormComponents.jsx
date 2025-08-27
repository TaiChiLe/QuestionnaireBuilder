import React from 'react';
import DraggableItem from '../DraggableItem';

export const ClinicalFormComponents = ({ isValidDrop }) => {
  return (
    <>
      {/* Button */}
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
              className="w-5 h-5 text-gray-600"
            >
              <rect x="3" y="7" width="18" height="10" rx="2" />
              <path d="M9 12h6" />
            </svg>
            <span>Button</span>
          </span>
        </DraggableItem>
      </div>

      {/* Chart */}
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
              className="w-5 h-5 text-gray-600"
            >
              <path d="M3 3v18h18" />
              <path d="M18 17l-4-4-4 4-4-8" />
            </svg>
            <span>Chart</span>
          </span>
        </DraggableItem>
      </div>

      {/* Check */}
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
              className="w-5 h-5 text-gray-600"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            <span>Check</span>
          </span>
        </DraggableItem>
      </div>

      {/* Date */}
      <div className="mb-2">
        <DraggableItem id="clinical-date-tag" isValidDrop={isValidDrop}>
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
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Date</span>
          </span>
        </DraggableItem>
      </div>

      {/* Form Button */}
      <div className="mb-2">
        <DraggableItem id="form-button-tag" isValidDrop={isValidDrop}>
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
              <path d="M12 10v4" />
              <path d="M10 12h4" />
            </svg>
            <span>Form Button</span>
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
              className="w-5 h-5 text-gray-600"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            <span>Functions</span>
          </span>
        </DraggableItem>
      </div>

      {/* Future Date */}
      <div className="mb-2">
        <DraggableItem id="future-date-tag" isValidDrop={isValidDrop}>
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
              <polyline points="12,6 12,12 16,14" />
            </svg>
            <span>Future Date</span>
          </span>
        </DraggableItem>
      </div>

      {/* Group */}
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
              className="w-5 h-5 text-gray-600"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <span>Group</span>
          </span>
        </DraggableItem>
      </div>

      {/* Info */}
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

      {/* List */}
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
              className="w-5 h-5 text-gray-600"
            >
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            <span>List</span>
          </span>
        </DraggableItem>
      </div>

      {/* Metafield */}
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
              className="w-5 h-5 text-gray-600"
            >
              <path d="M4 6h16v2H4z" />
              <path d="M4 10h16v2H4z" />
              <path d="M4 14h16v2H4z" />
              <path d="M4 18h16v2H4z" />
            </svg>
            <span>Metafield</span>
          </span>
        </DraggableItem>
      </div>

      {/* Metafields */}
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
              className="w-5 h-5 text-gray-600"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M7 7h10" />
              <path d="M7 12h10" />
              <path d="M7 17h10" />
            </svg>
            <span>Metafields</span>
          </span>
        </DraggableItem>
      </div>

      {/* Notes */}
      <div className="mb-2">
        <DraggableItem id="clinical-notes-tag" isValidDrop={isValidDrop}>
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

      {/* Notes with History */}
      <div className="mb-2">
        <DraggableItem id="notes-with-history-tag" isValidDrop={isValidDrop}>
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
              <circle cx="18" cy="6" r="3" />
            </svg>
            <span>Notes with History</span>
          </span>
        </DraggableItem>
      </div>

      {/* Panel */}
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
              className="w-5 h-5 text-gray-600"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 3v18" />
            </svg>
            <span>Panel</span>
          </span>
        </DraggableItem>
      </div>

      {/* Prescriptions */}
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
              className="w-5 h-5 text-gray-600"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <span>Prescriptions</span>
          </span>
        </DraggableItem>
      </div>

      {/* Radio */}
      <div className="mb-2">
        <DraggableItem id="clinical-radio-tag" isValidDrop={isValidDrop}>
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
              <circle cx="12" cy="12" r="3" />
              <circle cx="12" cy="12" r="10" />
            </svg>
            <span>Radio</span>
          </span>
        </DraggableItem>
      </div>

      {/* Services */}
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
              className="w-5 h-5 text-gray-600"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            <span>Services</span>
          </span>
        </DraggableItem>
      </div>

      {/* Table */}
      <div className="mb-2">
        <DraggableItem id="clinical-table-tag" isValidDrop={isValidDrop}>
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

      {/* Textarea */}
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
              className="w-5 h-5 text-gray-600"
            >
              <rect x="3" y="6" width="18" height="12" rx="2" />
              <path d="M7 9h10" />
              <path d="M7 13h8" />
              <path d="M7 17h6" />
            </svg>
            <span>Textarea</span>
          </span>
        </DraggableItem>
      </div>

      {/* Textbox */}
      <div className="mb-2">
        <DraggableItem id="clinical-textbox-tag" isValidDrop={isValidDrop}>
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
            <span>Textbox</span>
          </span>
        </DraggableItem>
      </div>
    </>
  );
};
