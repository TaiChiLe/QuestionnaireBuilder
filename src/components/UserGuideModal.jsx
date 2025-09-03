import React from 'react';

// Questionnaire mode guide content
const questionnaireTips = [
  {
    title: 'Getting Started',
    body: 'Start by dragging a Page onto the canvas. All other components must be placed inside a Page to create your questionnaire structure.',
  },
  {
    title: 'Edit on Drop',
    body: 'In Edit on Drop mode, the edit modal opens automatically when you drop a component onto the canvas.',
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
    title: 'Preview Section',
    body: 'Use the preview panel to see your questionnaire. Using the handle, you can drag the preview panel to reposition it, or use the button to collapse/expand it.',
  },
  {
    title: 'Errors',
    body: 'Check the Errors tab to identify any issues before exporting. You can also click on the error messages to jump to the relevant question.',
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
    body: 'Keys are unique identifiers for components, change this only if you get duplicate key errors.',
    isAdvanced: true,
  },
  {
    title: 'Visibility Types',
    body: 'Choose "Any" (show if any condition is met) or "All" (show only if all conditions are met) for components with multiple visibility conditions.',
    isAdvanced: true,
  },
  {
    title: 'Visibility Conditions',
    body: 'Make components appear only when other components have specific answers. Set conditions in the Advanced section of the edit modal. Use "Browse" to select existing keys.',
    isAdvanced: true,
  },
  {
    title: 'Direct XML Editing',
    body: 'With "Show Advanced" enabled, you can edit the XML structure directly. This allows for precise control over the questionnaire layout and behavior.',
    isAdvanced: true,
  },
];

// Clinical form mode guide content
const clinicalTips = [
  {
    title: 'Getting Started',
    body: 'Start by dragging a Clinical Form component (e.g. Group, Panel, Notes, Table) onto the canvas. These components sit at the root in clinical mode (no Pages).',
  },
  {
    title: 'Groups vs Panels',
    body: 'Groups provide a bordered container with a title. Panels render content inline and consecutive panels are automatically displayed side-by-side in the builder preview.',
  },
  {
    title: 'Tables & Table Fields',
    body: 'Add a Table, then drag clinical Table Field components into it. Each field supports data types like Text Box, Notes, Date, List Box or Checkbox.',
  },
  {
    title: 'Codes',
    body: 'Codes can reference SNOMED concepts or internal numeric identifiers. They must be unique in context. The Code field auto-increments to help you manage them.',
  },
  {
    title: 'Keys',
    body: 'Keys are optional identifiers mainly used for conditional visibility or when duplicate labels are required. Leave blank unless needed.',
  },
  {
    title: 'Editing Items',
    body: 'Double Click a component to edit. Edit on Drop (toggle in sidebar) will open the edit modal automatically after placing a new component.',
  },
  {
    title: 'Side‑by‑Side Panels',
    body: 'Two or more Panels placed consecutively will display side-by-side in the clinical preview for easier comparative layout.',
  },
  {
    title: 'Provided Services & Prescription',
    body: 'These specialised components include embedded action buttons or checkboxes that mimic typical clinical form behaviour.',
  },
  {
    title: 'Copy, Cut & Paste',
    body: 'Multi‑select with Ctrl+Click then use Ctrl+C / Ctrl+X / Ctrl+V. Pasting validates that the target container accepts the clinical component types.',
  },
  {
    title: 'Errors',
    body: 'Use the Errors tab to ensure codes and keys are unique and structural rules are enforced before exporting.',
  },
  {
    title: 'Export',
    body: 'Use Save to export the Clinical Form XML. The HTML preview panel reflects grouping & panel layout but is a work in progress.',
  },
];

function UserGuideModal({ isOpen, onClose, builderMode = 'questionnaire' }) {
  if (!isOpen) return null;
  const tips = builderMode === 'clinical' ? clinicalTips : questionnaireTips;
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
          <h3 className="text-xl font-semibold text-gray-800">
            {builderMode === 'clinical'
              ? 'Clinical Form Guide'
              : 'Questionnaire Guide'}
          </h3>
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
            Tip: Check the Errors tab in the preview section to ensure all{' '}
            {builderMode === 'clinical' ? 'codes & keys' : 'keys'} are valid and
            unique.
          </div>
        </div>
        <div className="px-6 py-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#f03741] text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserGuideModal;
