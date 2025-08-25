import React from 'react';

const tips = [
  {
    title: 'Getting Started',
    body: 'Drag a Page onto the canvas first. All other components must live inside a Page.',
  },
  {
    title: 'Adding Questions & Fields',
    body: 'Drag Question, Field, Information, or Table items into a Page (or into a Table for Table Fields).',
  },
  {
    title: 'Questions',
    body: 'Can contain multiple answers. Like Dropdowns, checkboxes, and radio buttons.',
  },
  {
    title: 'Fields',
    body: 'Fields are single or multi-line text inputs and dates.',
  },
  {
    title: 'Editing Items',
    body: 'Click on edit to edit items and its label, data type, required setting, answers (for questions), and visibility conditions. You can press Enter to save changes.',
  },
  {
    title: 'Copying Items and Cutting Items',
    body: 'Ctrl Left Click to select multiple items, then Ctrl C to copy. You can paste them by selecting another item you want it under and Ctrl V to paste. Similarly you can do this with cut.',
  },
  {
    title: 'Reordering Items',
    body: 'You can reorder items by dragging the handle with the 6 dots to drag them to a new position.',
  },
  {
    title: 'Keys',
    body: 'Keys are used to reference items in visibility conditions and XML. They must be unique, contain only letters, numbers, and hyphens, and no spaces.',
  },
  {
    title: 'Visibility Conditions',
    body: 'Use conditions to show an item only when other items have specific answers. Browse existing keys via the Browse button in the Edit modal.',
  },
  {
    title: 'Tables & Table Fields',
    body: 'Add a Table, then drag Table Field components into it. Each table field can have its own data type and required flag.',
  },
  {
    title: 'Adjusting the view',
    body: 'You can use the handle to expand / reduce the height of the preview panel. You can also collapse it by clicking on the arrow key to the left of the panel.',
  },
  {
    title: 'Exporting XML',
    body: 'Use the Save button once your questionnaire is complete. Fix any errors in the Errors tab before exporting.',
  },
  {
    title: 'Loading XML',
    body: 'Use Load to import or paste a saved questionnaire and continue editing.',
  },
];

function UserGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black/10 flex items-center justify-center z-[1200]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-800">User Guide</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close user guide"
          >
            ✕
          </button>
        </div>
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto text-sm leading-relaxed">
          {tips.map((t) => (
            <div key={t.title}>
              <h4 className="m-0 mb-1 text-base font-semibold text-gray-700">
                {t.title}
              </h4>
              <p className="m-0 text-gray-600">{t.body}</p>
            </div>
          ))}
          <div className="pt-2 text-gray-500 text-xs">
            Tip: Check the Errors tab in the preview section to ensure all keys
            are valid and unique.
          </div>
        </div>
        <div className="px-6 py-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserGuideModal;
