import React from 'react';
import { QuestionnaireComponents } from './QuestionnaireComponents';
import { ClinicalFormComponents } from './ClinicalFormComponents';

export const Sidebar = ({
  builderMode,
  isValidDrop,
  autoEdit,
  setAutoEdit,
}) => {
  return (
    <div className="w-64 min-w-64 max-w-64 p-4 bg-gray-100 border-r border-gray-300 overflow-x-hidden overflow-y-auto h-full relative">
      {/* Toggle Button for Auto-Edit */}
      <div className="mb-4">
        <button
          onClick={() => setAutoEdit(!autoEdit)}
          className="w-full px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200"
          style={{
            backgroundColor: autoEdit ? '#f03741' : '#e5e7eb',
            color: autoEdit ? 'white' : '#374151',
          }}
          title={
            autoEdit
              ? 'Edit on Drop enabled: Edit modal opens immediately when dropping components'
              : 'Edit on Drop disabled: Click components to edit them'
          }
        >
          Edit on Drop
        </button>
      </div>

      <div className="block overflow-hidden">
        {builderMode === 'questionnaire' ? (
          <QuestionnaireComponents isValidDrop={isValidDrop} />
        ) : (
          <ClinicalFormComponents isValidDrop={isValidDrop} />
        )}
      </div>
    </div>
  );
};
