import React from 'react';

const tips = [
  {
    title: 'Getting Started',
    body: 'Start by dragging a Page onto the canvas. All other components must be placed inside a Page to create your questionnaire structure.',
  },
  {
    title: 'Auto-Edit',
    body: 'In Auto-Edit mode, the edit modal opens automatically when you drop a component onto the canvas.',
  },
  {
    title: 'Adding Components',
    body: 'Drag components from the sidebar into Pages. Table Fields must be placed inside Tables.',
  },
  {
    title: 'Editing Items',
    body: 'Double-click any item to edit its properties. You can also use the edit button. Press Enter to save changes quickly.',
  },
  {
    title: 'Copy, Cut & Paste',
    body: 'Ctrl+Click to select multiple items, then Ctrl+C to copy or Ctrl+X to cut. Select a target item and Ctrl+V to paste underneath it.',
  },
  {
    title: 'Reordering Items',
    body: 'Drag items by their handle (6 dots icon) to reorder them within their parent container.',
  },
  {
    title: 'Tables',
    body: 'Add a Table component, then drag Table Field components into it to create columns. Each Table Field can have different data types.',
  },
  {
    title: 'Answer Management',
    body: 'For List Boxes, Multi Select and Radio Buttons, click the chevron to expand and see answer options. Use the global "Expand All" / "Collapse All" buttons to control all questions at once.',
  },
  {
    title: 'Preview & Errors',
    body: 'Use the preview panel to see your questionnaire. Check the Errors tab to identify any issues before exporting. Resize the panel by dragging the handle, or use the buttons to collapse/expand it.',
  },
  {
    title: '--- Advanced Features ---',
    body: 'The following features require enabling "Show Advanced" in the edit modal.',
    isAdvanced: true,
  },
  {
    title: 'Data Type Customization',
    body: 'In Advanced mode or with "Show Advanced" enabled, you can modify data types for different components.',
    isAdvanced: true,
  },
  {
    title: 'Key Fields',
    body: 'Keys are unique identifiers for components, used in visibility conditions and XML export. They should contain only letters, numbers, and hyphens.',
    isAdvanced: true,
  },
  {
    title: 'Visibility Conditions',
    body: 'Make components appear only when other components have specific answers. Set conditions in the Advanced section of the edit modal. Use "Browse" to select existing keys.',
    isAdvanced: true,
  },
  {
    title: 'Visibility Types',
    body: 'Choose "Any" (show if any condition is met) or "All" (show only if all conditions are met) for components with multiple visibility conditions.',
    isAdvanced: true,
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
            <div
              key={t.title}
              className={
                t.isAdvanced
                  ? 'border-l-4 border-red-400 pl-4 bg-red-50 py-2 rounded-r'
                  : ''
              }
            >
              <h4
                className={`m-0 mb-1 text-base font-semibold ${
                  t.isAdvanced ? 'text-red-700' : 'text-gray-700'
                }`}
              >
                {t.title}
              </h4>
              <p
                className={`m-0 ${
                  t.isAdvanced ? 'text-red-600' : 'text-gray-600'
                }`}
              >
                {t.body}
              </p>
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
