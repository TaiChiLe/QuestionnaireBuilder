import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import KeyPickerModal from './KeyPickerModal';
import { getNextCodeNumber } from './utils/clinicalFormCodeManager';

// Define reusable field components outside the main component to prevent re-creation
const CodeField = ({ value, onChange, required = false }) => (
  <div>
    <label className="block mb-1 font-semibold text-gray-700">Code:</label>
    <p className="text-sm text-gray-600 mb-2">
      This can be a numeric SNOMED concept id or just a unique number within the
      context of this form.
    </p>
    <input
      type="number"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      required={required}
    />
  </div>
);

const KeyField = ({ value, onChange, required = false }) => (
  <div>
    <label className="block mb-1 font-semibold text-gray-700">Key:</label>
    <p className="text-sm text-gray-600 mb-2">
      Leave this blank unless you need to have the same label on more than one
      item.
    </p>
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      required={required}
    />
  </div>
);

const TagField = ({ value, onChange, required = false }) => (
  <div>
    <label className="block mb-1 font-semibold text-gray-700">Tag:</label>
    <p className="text-sm text-gray-600 mb-2">
      Categorise questions to assist in filtering the medical history. Inherited
      tag is Consultation.
    </p>
    <select
      value={value || 'Outcome'}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      required={required}
    >
      {/* Tags from image 2 */}
      <option value="[Inherit from parent]">[Inherit from parent]</option>
      <option value="Allergy">Allergy</option>
      <option value="Administrative">Administrative</option>
      <option value="Advice">Advice</option>
      <option value="Background">Background</option>
      <option value="Complaint">Complaint</option>
      <option value="Consultation">Consultation</option>
      <option value="Current">Current</option>
      <option value="Drug History">Drug History</option>
      <option value="Diagnosis">Diagnosis</option>
      <option value="Dictation">Dictation</option>
      <option value="Diet">Diet</option>
      <option value="Document">Document</option>
      <option value="Email correspondence">Email correspondence</option>
      <option value="Examination">Examination</option>
      <option value="Exercise History">Exercise History</option>
      <option value="Family History">Family History</option>
      <option value="Investigation">Investigation</option>
      <option value="Numerical Data">Numerical Data</option>
      <option value="Observation">Observation</option>

      {/* Tags from image 1 */}
      <option value="Outcome">Outcome</option>
      <option value="Pathology Result">Pathology Result</option>
      <option value="Past Medical History">Past Medical History</option>
      <option value="Previous Physiotherapy History">
        Previous Physiotherapy History
      </option>
      <option value="Prescription">Prescription</option>
      <option value="Prescription (Acute)">Prescription (Acute)</option>
      <option value="Prescription">Prescription</option>
      <option value="Past Surgical History">Past Surgical History</option>
      <option value="Results Advice">Results Advice</option>
      <option value="Referral (inbound)">Referral (inbound)</option>
      <option value="Referral (outbound)">Referral (outbound)</option>
      <option value="Screening">Screening</option>
      <option value="Appointment Service">Appointment Service</option>

      {/* Tags from image 3 */}
      <option value="Social History">Social History</option>
      <option value="Snapshot">Snapshot</option>
      <option value="Stock Dispensed">Stock Dispensed</option>
      <option value="Symptoms">Symptoms</option>
      <option value="Treatment">Treatment</option>
      <option value="Urinalysis">Urinalysis</option>
      <option value="Vaccination">Vaccination</option>
      <option value="Visual acuity and refractive error">
        Visual acuity and refractive error
      </option>
      <option value="Vaccination Recording">Vaccination Recording</option>
    </select>
  </div>
);

const GlobalField = ({ value, onChange }) => (
  <div>
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={value || false}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-gray-300 text-blue-600"
      />
      <span className="font-semibold text-gray-700">Global</span>
    </label>
    <p className="text-sm text-gray-600 mt-1 ml-6">
      This should be ticked when the answer to a question carries forward from
      one episode to the next.
    </p>
  </div>
);

const RequiredCheckboxField = ({ value, onChange }) => (
  <div>
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={value || false}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-gray-300 text-blue-600"
      />
      <span className="font-semibold text-gray-700">Required</span>
    </label>
    <p className="text-sm text-gray-600 mt-1 ml-6">
      This should be ticked when a question must be answered.
    </p>
  </div>
);

const WidthField = ({ value, onChange, required = false }) => (
  <div>
    <label className="block mb-1 font-semibold text-gray-700">Width:</label>
    <p className="text-sm text-gray-600 mb-2">
      Width of the control in pixels. Leave blank to use the default width.
    </p>
    <input
      type="number"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      required={required}
      min="1"
    />
  </div>
);

const EditModal = ({
  isOpen,
  editingItem,
  onSave,
  onCancel,
  onItemUpdate,
  droppedItems = [],
  showAdvanced = false,
  isDarkMode = false,
}) => {
  const [keyPickerState, setKeyPickerState] = useState({
    open: false,
    conditionIndex: null,
  });

  // Track whether to use textarea based on initial content length when modal opens
  const [useTextareaForLabel, setUseTextareaForLabel] = useState(false);

  // Initialize textarea state when modal opens or item changes
  useEffect(() => {
    if (isOpen && editingItem) {
      const initialText =
        editingItem.type === 'page' ? editingItem.title : editingItem.label;
      setUseTextareaForLabel((initialText || '').length > 80);
    }
  }, [isOpen, editingItem?.id, editingItem?.type]);

  // Helper function to render input (uses consistent input type throughout editing session)
  const renderInput = (value, onChange, placeholder = '', ref = null) => {
    const commonClassName = `w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
      isDarkMode
        ? 'bg-gray-700 border-gray-600 text-gray-100'
        : 'border-gray-300'
    }`;

    if (useTextareaForLabel) {
      return (
        <textarea
          value={value || ''}
          onChange={onChange}
          ref={ref}
          className={`${commonClassName} resize-none`}
          placeholder={placeholder}
          rows={Math.min(Math.ceil((value || '').length / 60), 4)}
        />
      );
    }

    return (
      <input
        type="text"
        value={value || ''}
        onChange={onChange}
        ref={ref}
        className={commonClassName}
        placeholder={placeholder}
      />
    );
  };

  const sanitizeForKey = (text) =>
    (text || '')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');

  const availableKeyOptions = useMemo(() => {
    if (!droppedItems || droppedItems.length === 0) return [];
    const results = [];
    const walk = (items, pageTitle) => {
      items.forEach((it) => {
        const currentPage =
          it.type === 'page' ? it.title || it.label || 'Page' : pageTitle;
        if (
          ['question', 'field'].includes(it.type) &&
          it.id !== editingItem?.id
        ) {
          const keyVal = (it.keyField || '').trim();
          if (keyVal)
            results.push({
              key: keyVal,
              label: it.label || it.title || '(no label)',
              type: it.type,
              page: currentPage,
            });
        }
        if (it.children && it.children.length) walk(it.children, currentPage);
      });
    };
    walk(droppedItems, null);
    const seen = new Set();
    return results
      .filter((r) => {
        if (seen.has(r.key)) return false;
        seen.add(r.key);
        return true;
      })
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [droppedItems, editingItem?.id]);

  const handleSave = () => onSave(editingItem);

  // Ref for first label (or title) input to focus when modal opens
  const firstFieldRef = useRef(null);

  useEffect(() => {
    if (isOpen && editingItem) {
      // Use a small timeout to ensure modal animation completes and input is ready
      const timer = setTimeout(() => {
        if (firstFieldRef.current) {
          try {
            firstFieldRef.current.focus();
            firstFieldRef.current.select();
            // Ensure the input is ready for typing
            firstFieldRef.current.setSelectionRange(
              0,
              firstFieldRef.current.value.length
            );
          } catch (_) {
            /* noop */
          }
        }
      }, 100); // Small delay to ensure modal is fully rendered
      return () => clearTimeout(timer);
    }
  }, [isOpen, editingItem?.id, editingItem?.type]);

  // Early return (no hooks after this point)
  if (!isOpen || !editingItem) return null;

  const handleFormKeyDown = (e) => {
    if (e.key === 'Enter') {
      // Don't save if key picker modal is open
      if (keyPickerState.open) return;

      // Save the form regardless of what element has focus
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-[2000] bg-black/10">
      <div
        className={`rounded-lg px-6 w-[600px] max-w-[90vw] max-h-[80vh] overflow-auto shadow-2xl ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          onKeyDown={handleFormKeyDown}
          noValidate
        >
          {/* Fixed Header with Title and Action Buttons */}
          <div
            className={`sticky top-0 z-10 border-b -mx-6 px-6 py-4 mb-4 ${
              isDarkMode
                ? 'bg-gray-800 border-gray-600'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2
                className={`m-0 font-bold text-xl sm:flex-1 ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-800'
                } truncate pr-4`}
                title={`Edit ${
                  editingItem.type === 'page'
                    ? 'Page'
                    : editingItem.type === 'field'
                    ? 'Field'
                    : editingItem.type === 'information'
                    ? 'Information'
                    : editingItem.type === 'table'
                    ? 'Table'
                    : editingItem.type === 'table-field'
                    ? 'Table Field'
                    : 'Question'
                }: ${editingItem.label}`}
              >
                Edit{' '}
                {editingItem.type === 'page'
                  ? 'Page'
                  : editingItem.type === 'field'
                  ? 'Field'
                  : editingItem.type === 'information'
                  ? 'Information'
                  : editingItem.type === 'table'
                  ? 'Table'
                  : editingItem.type === 'table-field'
                  ? 'Table Field'
                  : editingItem.type === 'cf-button'
                  ? 'Button'
                  : editingItem.type === 'cf-checkbox'
                  ? 'Checkbox'
                  : editingItem.type === 'cf-date'
                  ? 'Date'
                  : editingItem.type === 'cf-future-date'
                  ? 'Future Date'
                  : editingItem.type === 'cf-group'
                  ? 'Group'
                  : editingItem.type === 'cf-info'
                  ? 'Information'
                  : editingItem.type === 'cf-listbox'
                  ? 'List Box'
                  : editingItem.type === 'cf-notes'
                  ? 'Notes'
                  : editingItem.type === 'cf-notes-history'
                  ? 'Notes with History'
                  : editingItem.type === 'cf-panel'
                  ? 'Panel'
                  : editingItem.type === 'cf-patient-data'
                  ? 'Patient Data'
                  : editingItem.type === 'cf-patient-data-all'
                  ? 'All Patient Data'
                  : editingItem.type === 'cf-prescription'
                  ? 'Prescription'
                  : editingItem.type === 'cf-provided-services'
                  ? 'Provided Services'
                  : editingItem.type === 'cf-radio'
                  ? 'Radio'
                  : editingItem.type === 'cf-snom-textbox'
                  ? 'SNOM Text Box'
                  : editingItem.type === 'cf-table'
                  ? 'Table'
                  : editingItem.type === 'cf-table-field'
                  ? 'Table Field'
                  : editingItem.type === 'cf-textbox'
                  ? 'Text Box'
                  : 'Question'}
                : {editingItem.label}
              </h2>
              <div className="flex gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={onCancel}
                  className={`px-5 py-2.5 border rounded-md hover:bg-opacity-80 cursor-pointer ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#f03741] text-white border-0 rounded-md hover:bg-red-700 cursor-pointer font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="px-2 pb-6">
            <div className="flex flex-col space-y-4">
              {editingItem.type === 'page' && (
                <div>
                  <label
                    className={`block mb-1 font-semibold ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Title:
                  </label>
                  {renderInput(
                    editingItem.title,
                    (e) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        title: e.target.value,
                      })),
                    'Enter page title...',
                    firstFieldRef
                  )}
                </div>
              )}
              {editingItem.type === 'information' && (
                <div>
                  <label
                    className={`block mb-1 font-semibold ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Label:
                  </label>
                  {renderInput(
                    editingItem.label,
                    (e) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        label: e.target.value,
                      })),
                    'Enter information text...',
                    firstFieldRef
                  )}
                </div>
              )}
              {editingItem.type === 'table' && (
                <>
                  <div>
                    <label
                      className={`block mb-1 font-semibold ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Label:
                    </label>
                    {renderInput(
                      editingItem.label,
                      (e) =>
                        onItemUpdate((prev) => ({
                          ...prev,
                          label: e.target.value,
                          keyField: sanitizeForKey(e.target.value),
                        })),
                      'Enter table label...',
                      firstFieldRef
                    )}
                  </div>
                  <div>
                    <label
                      className={`block mb-1 font-semibold ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Key Field:
                    </label>
                    <input
                      type="text"
                      value={editingItem.keyField || ''}
                      onChange={(e) =>
                        onItemUpdate((prev) => ({
                          ...prev,
                          keyField: e.target.value,
                        }))
                      }
                      className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-100'
                          : 'border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editingItem.required || false}
                        onChange={(e) =>
                          onItemUpdate((prev) => ({
                            ...prev,
                            required: e.target.checked,
                          }))
                        }
                        className={`rounded text-blue-600 shadow-sm ${
                          isDarkMode
                            ? 'border-gray-500 bg-gray-700'
                            : 'border-gray-300'
                        }`}
                      />
                      <span
                        className={`font-semibold ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        Required
                      </span>
                    </label>
                  </div>
                </>
              )}
              {editingItem.type === 'table-field' && (
                <>
                  <div>
                    <label
                      className={`block mb-1 font-semibold ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Label:
                    </label>
                    {renderInput(
                      editingItem.label,
                      (e) =>
                        onItemUpdate((prev) => ({
                          ...prev,
                          label: e.target.value,
                        })),
                      'Enter table field label...',
                      firstFieldRef
                    )}
                  </div>
                  <div>
                    <label
                      className={`block mb-1 font-semibold ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Data Type:
                    </label>
                    <select
                      value={editingItem.dataType || 'Text Box'}
                      onChange={(e) =>
                        onItemUpdate((prev) => ({
                          ...prev,
                          dataType: e.target.value,
                        }))
                      }
                      className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-100'
                          : 'border-gray-300'
                      }`}
                    >
                      <option value="Text Box">Text Box</option>
                      <option value="Date">Date</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editingItem.required || false}
                        onChange={(e) =>
                          onItemUpdate((prev) => ({
                            ...prev,
                            required: e.target.checked,
                          }))
                        }
                        className={`rounded text-blue-600 ${
                          isDarkMode
                            ? 'border-gray-500 bg-gray-700'
                            : 'border-gray-300'
                        }`}
                      />
                      <span
                        className={`font-semibold ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        Required
                      </span>
                    </label>
                  </div>
                </>
              )}
              {editingItem.type === 'cf-button' && (
                <>
                  <div>
                    <label className="block mb-1 font-semibold text-gray-700">
                      Label:
                    </label>
                    <input
                      type="text"
                      value={editingItem.label || ''}
                      onChange={(e) => {
                        const newLabel = e.target.value;
                        onItemUpdate((prev) => ({
                          ...prev,
                          label: newLabel,
                        }));
                      }}
                      ref={firstFieldRef}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold text-gray-700">
                      Action:
                    </label>
                    <select
                      value={editingItem.action || 'Add Extra Services'}
                      onChange={(e) =>
                        onItemUpdate((prev) => ({
                          ...prev,
                          action: e.target.value,
                        }))
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Add Extra Services">
                        Add Extra Services
                      </option>
                      <option value="Assign Task">Assign Task</option>
                      <option value="Close Case">Close Case</option>
                      <option value="Discharge">Discharge</option>
                      <option value="Follow Up">Follow Up</option>
                      <option value="Pathology Lab Request">
                        Pathology Lab Request
                      </option>
                      <option value="Prescribe">Prescribe</option>
                      <option value="Prescribe Repeat">Prescribe Repeat</option>
                      <option value="Print">Print</option>
                      <option value="Print From Template">
                        Print From Template
                      </option>
                      <option value="Refer">Refer</option>
                      <option value="Request Observation">
                        Request Observation
                      </option>
                      <option value="Run Triggers">Run Triggers</option>
                      <option value="Run Triggers Async">
                        Run Triggers Async
                      </option>
                      <option value="Run Triggers Async Then Discharge">
                        Run Triggers Async Then Discharge
                      </option>
                      <option value="Run Triggers Then Discharge">
                        Run Triggers Then Discharge
                      </option>
                      <option value="Send Follow Up Request">
                        Send Follow Up Request
                      </option>
                      <option value="Send Follow Up Request And Discharge">
                        Send Follow Up Request And Discharge
                      </option>
                      <option value="Start Pathway">Start Pathway</option>
                      <option value="Start Pathway Definition">
                        Start Pathway Definition
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold text-gray-700">
                      Required:
                    </label>
                    <select
                      value={editingItem.cfrequired || 'Ignore'}
                      onChange={(e) =>
                        onItemUpdate((prev) => ({
                          ...prev,
                          cfbuttonrequired: e.target.value,
                        }))
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Ignore">Ignore</option>
                      <option value="Warn">Warn</option>
                      <option value="Strict">Strict</option>
                    </select>
                  </div>
                </>
              )}
              {editingItem.type === 'cf-checkbox' && (
                <>
                  <div>
                    <label className="block mb-1 font-semibold text-gray-700">
                      Label:
                    </label>
                    <input
                      type="text"
                      value={editingItem.label || ''}
                      onChange={(e) => {
                        const newLabel = e.target.value;
                        onItemUpdate((prev) => ({
                          ...prev,
                          label: newLabel,
                        }));
                      }}
                      ref={firstFieldRef}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <CodeField
                    value={editingItem.code}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        code: value,
                      }))
                    }
                  />
                  <KeyField
                    value={editingItem.keyField}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        keyField: value,
                      }))
                    }
                  />
                  <TagField
                    value={editingItem.tag}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        tag: value,
                      }))
                    }
                  />
                  <GlobalField
                    value={editingItem.global}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        global: value,
                      }))
                    }
                  />
                  <RequiredCheckboxField
                    value={editingItem.cfrequired}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        cfrequired: value,
                      }))
                    }
                  />
                  <WidthField
                    value={editingItem.width}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        width: value,
                      }))
                    }
                  />
                </>
              )}
              {editingItem.type === 'cf-date' && (
                <>
                  <div>
                    <label className="block mb-1 font-semibold text-gray-700">
                      Label:
                    </label>
                    <input
                      type="text"
                      value={editingItem.label || ''}
                      onChange={(e) => {
                        const newLabel = e.target.value;
                        onItemUpdate((prev) => ({
                          ...prev,
                          label: newLabel,
                        }));
                      }}
                      ref={firstFieldRef}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <CodeField
                    value={editingItem.code}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        code: value,
                      }))
                    }
                  />
                  <KeyField
                    value={editingItem.key}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        key: value,
                      }))
                    }
                  />
                  <TagField
                    value={editingItem.tag}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        tag: value,
                      }))
                    }
                  />
                  <GlobalField
                    value={editingItem.global}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        global: value,
                      }))
                    }
                  />
                  <RequiredCheckboxField
                    value={editingItem.cfrequired}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        cfrequired: value,
                      }))
                    }
                  />
                  <WidthField
                    value={editingItem.width}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        width: value,
                      }))
                    }
                  />
                </>
              )}
              {editingItem.type === 'cf-future-date' && (
                <>
                  <div>
                    <label className="block mb-1 font-semibold text-gray-700">
                      Label:
                    </label>
                    <input
                      type="text"
                      value={editingItem.label || ''}
                      onChange={(e) => {
                        const newLabel = e.target.value;
                        onItemUpdate((prev) => ({
                          ...prev,
                          label: newLabel,
                        }));
                      }}
                      ref={firstFieldRef}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <CodeField
                    value={editingItem.code}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        code: value,
                      }))
                    }
                  />
                  <KeyField
                    value={editingItem.key}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        key: value,
                      }))
                    }
                  />
                  <TagField
                    value={editingItem.tag}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        tag: value,
                      }))
                    }
                  />
                  <GlobalField
                    value={editingItem.global}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        global: value,
                      }))
                    }
                  />
                  <RequiredCheckboxField
                    value={editingItem.cfrequired}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        cfrequired: value,
                      }))
                    }
                  />
                  <WidthField
                    value={editingItem.width}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        width: value,
                      }))
                    }
                  />
                </>
              )}
              {editingItem.type === 'cf-group' && (
                <>
                  <div>
                    <label className="block mb-1 font-semibold text-gray-700">
                      Label:
                    </label>
                    <input
                      type="text"
                      value={editingItem.label || ''}
                      onChange={(e) => {
                        const newLabel = e.target.value;
                        onItemUpdate((prev) => ({
                          ...prev,
                          label: newLabel,
                        }));
                      }}
                      ref={firstFieldRef}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <TagField
                    value={editingItem.tag}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        tag: value,
                      }))
                    }
                  />
                </>
              )}
              {editingItem.type === 'cf-info' && (
                <>
                  <div>
                    <label className="block mb-1 font-semibold text-gray-700">
                      Label:
                    </label>
                    <input
                      type="text"
                      value={editingItem.label || ''}
                      onChange={(e) => {
                        const newLabel = e.target.value;
                        onItemUpdate((prev) => ({
                          ...prev,
                          label: newLabel,
                        }));
                      }}
                      ref={firstFieldRef}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </>
              )}
              {editingItem.type === 'cf-listbox' && (
                <>
                  <div>
                    <label className="block mb-1 font-semibold text-gray-700">
                      Label:
                    </label>
                    <input
                      type="text"
                      value={editingItem.label || ''}
                      onChange={(e) => {
                        const newLabel = e.target.value;
                        onItemUpdate((prev) => ({
                          ...prev,
                          label: newLabel,
                        }));
                      }}
                      ref={firstFieldRef}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <CodeField
                    value={editingItem.code}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        code: value,
                      }))
                    }
                  />
                  <KeyField
                    value={editingItem.key}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        key: value,
                      }))
                    }
                  />
                  <TagField
                    value={editingItem.tag}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        tag: value,
                      }))
                    }
                  />
                  <GlobalField
                    value={editingItem.global}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        global: value,
                      }))
                    }
                  />
                  <RequiredCheckboxField
                    value={editingItem.cfrequired}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        cfrequired: value,
                      }))
                    }
                  />
                  <WidthField
                    value={editingItem.width}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        width: value,
                      }))
                    }
                  />
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700">
                      Answer Options:
                    </label>
                    <div className="flex gap-2 mb-2">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Label
                        </label>
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Code
                        </label>
                      </div>
                      <div className="w-20">
                        {/* Spacer for remove button */}
                      </div>
                    </div>
                    {(editingItem.options || []).map((option, index) => (
                      <div key={option.id} className="flex gap-2 mb-2">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={option.text || ''}
                            onChange={(e) => {
                              const newOptions = [
                                ...(editingItem.options || []),
                              ];
                              newOptions[index] = {
                                ...option,
                                text: e.target.value,
                              };
                              onItemUpdate((prev) => ({
                                ...prev,
                                options: newOptions,
                              }));
                            }}
                            className="w-full p-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Label"
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="number"
                            value={option.value || ''}
                            onChange={(e) => {
                              const newOptions = [
                                ...(editingItem.options || []),
                              ];
                              newOptions[index] = {
                                ...option,
                                value: e.target.value,
                              };
                              onItemUpdate((prev) => ({
                                ...prev,
                                options: newOptions,
                              }));
                            }}
                            className="w-full p-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Code"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newOptions = (
                              editingItem.options || []
                            ).filter((_, i) => i !== index);
                            onItemUpdate((prev) => ({
                              ...prev,
                              options: newOptions,
                            }));
                          }}
                          className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const newOption = {
                          id: `option-${Date.now()}-${
                            (editingItem.options || []).length + 1
                          }`,
                          text: '',
                          value: getNextCodeNumber(),
                        };
                        onItemUpdate((prev) => ({
                          ...prev,
                          options: [...(prev.options || []), newOption],
                        }));
                      }}
                      className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100 cursor-pointer"
                    >
                      Add Answer Option
                    </button>
                  </div>
                </>
              )}
              {editingItem.type === 'cf-notes' && (
                <>
                  <div>
                    <label className="block mb-1 font-semibold text-gray-700">
                      Label:
                    </label>
                    <input
                      type="text"
                      value={editingItem.label || ''}
                      onChange={(e) => {
                        const newLabel = e.target.value;
                        onItemUpdate((prev) => ({
                          ...prev,
                          label: newLabel,
                        }));
                      }}
                      ref={firstFieldRef}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <CodeField
                    value={editingItem.code}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        code: value,
                      }))
                    }
                  />
                  <KeyField
                    value={editingItem.key}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        key: value,
                      }))
                    }
                  />
                  <TagField
                    value={editingItem.tag}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        tag: value,
                      }))
                    }
                  />
                  <GlobalField
                    value={editingItem.global}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        global: value,
                      }))
                    }
                  />
                  <RequiredCheckboxField
                    value={editingItem.cfrequired}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        cfrequired: value,
                      }))
                    }
                  />
                  <WidthField
                    value={editingItem.width}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        width: value,
                      }))
                    }
                  />
                </>
              )}
              {editingItem.type === 'cf-notes-history' && (
                <>
                  <div>
                    <label className="block mb-1 font-semibold text-gray-700">
                      Label:
                    </label>
                    <input
                      type="text"
                      value={editingItem.label || ''}
                      onChange={(e) => {
                        const newLabel = e.target.value;
                        onItemUpdate((prev) => ({
                          ...prev,
                          label: newLabel,
                        }));
                      }}
                      ref={firstFieldRef}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <CodeField
                    value={editingItem.code}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        code: value,
                      }))
                    }
                  />
                  <KeyField
                    value={editingItem.key}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        key: value,
                      }))
                    }
                  />
                  <TagField
                    value={editingItem.tag}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        tag: value,
                      }))
                    }
                  />
                  <GlobalField
                    value={editingItem.global}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        global: value,
                      }))
                    }
                  />
                  <RequiredCheckboxField
                    value={editingItem.cfrequired}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        cfrequired: value,
                      }))
                    }
                  />
                  <WidthField
                    value={editingItem.width}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        width: value,
                      }))
                    }
                  />
                </>
              )}
              {editingItem.type === 'cf-panel' && (
                <>
                  <TagField
                    value={editingItem.tag}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        tag: value,
                      }))
                    }
                  />
                  <WidthField
                    value={editingItem.width}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        width: value,
                      }))
                    }
                  />
                </>
              )}
              {editingItem.type === 'cf-patient-data' && (
                <>
                  <div>
                    <label className="block mb-1 font-semibold text-gray-700">
                      Label:
                    </label>
                    <input
                      type="text"
                      value={editingItem.label || ''}
                      onChange={(e) => {
                        const newLabel = e.target.value;
                        onItemUpdate((prev) => ({
                          ...prev,
                          label: newLabel,
                        }));
                      }}
                      ref={firstFieldRef}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <RequiredCheckboxField
                    value={editingItem.cfrequired}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        cfrequired: value,
                      }))
                    }
                  />
                </>
              )}
              {editingItem.type === 'cf-patient-data-all' && (
                <>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                    <p className="text-gray-600 text-center italic">
                      There are no settings for this control
                    </p>
                  </div>
                </>
              )}
              {editingItem.type === 'cf-prescription' && (
                <>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                    <p className="text-gray-600 text-center italic">
                      There are no settings for this control
                    </p>
                  </div>
                </>
              )}
              {editingItem.type === 'cf-provided-services' && (
                <>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                    <p className="text-gray-600 text-center italic">
                      There are no settings for this control
                    </p>
                  </div>
                </>
              )}
              {editingItem.type === 'cf-radio' && (
                <>
                  <div>
                    <label className="block mb-1 font-semibold text-gray-700">
                      Label:
                    </label>
                    <input
                      type="text"
                      value={editingItem.label || ''}
                      onChange={(e) => {
                        const newLabel = e.target.value;
                        onItemUpdate((prev) => ({
                          ...prev,
                          label: newLabel,
                        }));
                      }}
                      ref={firstFieldRef}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <CodeField
                    value={editingItem.code}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        code: value,
                      }))
                    }
                  />
                  <KeyField
                    value={editingItem.key}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        key: value,
                      }))
                    }
                  />
                  <TagField
                    value={editingItem.tag}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        tag: value,
                      }))
                    }
                  />
                  <GlobalField
                    value={editingItem.global}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        global: value,
                      }))
                    }
                  />
                  <RequiredCheckboxField
                    value={editingItem.cfrequired}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        cfrequired: value,
                      }))
                    }
                  />
                  <WidthField
                    value={editingItem.width}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        width: value,
                      }))
                    }
                  />
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700">
                      Options:
                    </label>
                    <div className="flex gap-2 mb-2">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Label
                        </label>
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Code
                        </label>
                      </div>
                      <div className="w-20">
                        {/* Spacer for remove button */}
                      </div>
                    </div>
                    {(editingItem.options || []).map((option, index) => (
                      <div key={option.id} className="flex gap-2 mb-2">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={option.text || ''}
                            onChange={(e) => {
                              const newOptions = [
                                ...(editingItem.options || []),
                              ];
                              newOptions[index] = {
                                ...option,
                                text: e.target.value,
                              };
                              onItemUpdate((prev) => ({
                                ...prev,
                                options: newOptions,
                              }));
                            }}
                            className="w-full p-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Label"
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="number"
                            value={option.value || ''}
                            onChange={(e) => {
                              const newOptions = [
                                ...(editingItem.options || []),
                              ];
                              newOptions[index] = {
                                ...option,
                                value: e.target.value,
                              };
                              onItemUpdate((prev) => ({
                                ...prev,
                                options: newOptions,
                              }));
                            }}
                            className="w-full p-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Code"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newOptions = (
                              editingItem.options || []
                            ).filter((_, i) => i !== index);
                            onItemUpdate((prev) => ({
                              ...prev,
                              options: newOptions,
                            }));
                          }}
                          className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const newOption = {
                          id: `option-${Date.now()}-${
                            (editingItem.options || []).length + 1
                          }`,
                          text: '',
                          value: getNextCodeNumber(),
                        };
                        onItemUpdate((prev) => ({
                          ...prev,
                          options: [...(prev.options || []), newOption],
                        }));
                      }}
                      className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100 cursor-pointer"
                    >
                      Add Answer Option
                    </button>
                  </div>
                </>
              )}
              {editingItem.type === 'cf-snom-textbox' && (
                <>
                  <div>
                    <label className="block mb-1 font-semibold text-gray-700">
                      Label:
                    </label>
                    <input
                      type="text"
                      value={editingItem.label || ''}
                      onChange={(e) => {
                        const newLabel = e.target.value;
                        onItemUpdate((prev) => ({
                          ...prev,
                          label: newLabel,
                        }));
                      }}
                      ref={firstFieldRef}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <CodeField
                    value={editingItem.code}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        code: value,
                      }))
                    }
                  />
                  <KeyField
                    value={editingItem.key}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        key: value,
                      }))
                    }
                  />
                  <TagField
                    value={editingItem.tag}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        tag: value,
                      }))
                    }
                  />
                  <GlobalField
                    value={editingItem.global}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        global: value,
                      }))
                    }
                  />
                  <div>
                    <label className="block mb-1 font-semibold text-gray-700">
                      Subset:
                    </label>
                    <p className="text-sm text-gray-600 mb-2">
                      This will be a numeric SNOMED concept id for the subset.
                    </p>
                    <input
                      type="number"
                      value={editingItem.subset || ''}
                      onChange={(e) =>
                        onItemUpdate((prev) => ({
                          ...prev,
                          subset: e.target.value,
                        }))
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter SNOMED concept id"
                    />
                  </div>
                  <WidthField
                    value={editingItem.width}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        width: value,
                      }))
                    }
                  />
                </>
              )}
              {editingItem.type === 'cf-table' && (
                <>
                  <div>
                    <label className="block mb-1 font-semibold text-gray-700">
                      Label:
                    </label>
                    <input
                      type="text"
                      value={editingItem.label || ''}
                      onChange={(e) => {
                        const newLabel = e.target.value;
                        onItemUpdate((prev) => ({
                          ...prev,
                          label: newLabel,
                        }));
                      }}
                      ref={firstFieldRef}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <CodeField
                    value={editingItem.code}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        code: value,
                      }))
                    }
                  />
                  <KeyField
                    value={editingItem.key}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        key: value,
                      }))
                    }
                  />
                  <TagField
                    value={editingItem.tag}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        tag: value,
                      }))
                    }
                  />
                  <GlobalField
                    value={editingItem.global}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        global: value,
                      }))
                    }
                  />
                  <RequiredCheckboxField
                    value={editingItem.cfrequired}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        cfrequired: value,
                      }))
                    }
                  />
                </>
              )}
              {editingItem.type === 'cf-table-field' && (
                <>
                  <div>
                    <label className="block mb-1 font-semibold text-gray-700">
                      Label:
                    </label>
                    <input
                      type="text"
                      value={editingItem.label || ''}
                      onChange={(e) => {
                        const newLabel = e.target.value;
                        onItemUpdate((prev) => ({
                          ...prev,
                          label: newLabel,
                        }));
                      }}
                      ref={firstFieldRef}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold text-gray-700">
                      Data Type:
                    </label>
                    <select
                      value={editingItem.dataType || 'textbox'}
                      onChange={(e) =>
                        onItemUpdate((prev) => ({
                          ...prev,
                          dataType: e.target.value,
                        }))
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="textbox">Text Box</option>
                      <option value="cf-checkbox">Checkbox</option>
                      <option value="cf-date">Date</option>
                      <option value="cf-future-date">Future Date</option>
                      <option value="cf-listbox">List Box</option>
                      <option value="cf-radio">Radio</option>
                      <option value="cf-snom-textbox">SNOMED Text Box</option>
                    </select>
                  </div>

                  {/* Common fields for simple datatypes: checkbox, date, future-date, and textbox */}
                  {(editingItem.dataType === 'cf-checkbox' ||
                    editingItem.dataType === 'cf-date' ||
                    editingItem.dataType === 'cf-future-date' ||
                    editingItem.dataType === 'textbox') && (
                    <>
                      <CodeField
                        value={editingItem.code}
                        onChange={(value) =>
                          onItemUpdate((prev) => ({
                            ...prev,
                            code: value,
                          }))
                        }
                      />
                      <KeyField
                        value={editingItem.key}
                        onChange={(value) =>
                          onItemUpdate((prev) => ({
                            ...prev,
                            key: value,
                          }))
                        }
                      />
                      <TagField
                        value={editingItem.tag}
                        onChange={(value) =>
                          onItemUpdate((prev) => ({
                            ...prev,
                            tag: value,
                          }))
                        }
                      />
                      <GlobalField
                        value={editingItem.global}
                        onChange={(value) =>
                          onItemUpdate((prev) => ({
                            ...prev,
                            global: value,
                          }))
                        }
                      />
                      <WidthField
                        value={editingItem.width}
                        onChange={(value) =>
                          onItemUpdate((prev) => ({
                            ...prev,
                            width: value,
                          }))
                        }
                      />
                    </>
                  )}

                  {(editingItem.dataType === 'cf-listbox' ||
                    editingItem.dataType === 'cf-radio') && (
                    <>
                      <CodeField
                        value={editingItem.code}
                        onChange={(value) =>
                          onItemUpdate((prev) => ({
                            ...prev,
                            code: value,
                          }))
                        }
                      />
                      <KeyField
                        value={editingItem.key}
                        onChange={(value) =>
                          onItemUpdate((prev) => ({
                            ...prev,
                            key: value,
                          }))
                        }
                      />
                      <TagField
                        value={editingItem.tag}
                        onChange={(value) =>
                          onItemUpdate((prev) => ({
                            ...prev,
                            tag: value,
                          }))
                        }
                      />
                      <GlobalField
                        value={editingItem.global}
                        onChange={(value) =>
                          onItemUpdate((prev) => ({
                            ...prev,
                            global: value,
                          }))
                        }
                      />
                      <RequiredCheckboxField
                        value={editingItem.cfrequired}
                        onChange={(value) =>
                          onItemUpdate((prev) => ({
                            ...prev,
                            cfrequired: value,
                          }))
                        }
                      />
                      <WidthField
                        value={editingItem.width}
                        onChange={(value) =>
                          onItemUpdate((prev) => ({
                            ...prev,
                            width: value,
                          }))
                        }
                      />
                      <div>
                        <label className="block mb-2 font-semibold text-gray-700">
                          {editingItem.dataType === 'cf-listbox' && (
                            <span>Answer </span>
                          )}
                          Options:
                        </label>
                        <div className="flex gap-2 mb-2">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                              Label
                            </label>
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                              Code
                            </label>
                          </div>
                          <div className="w-20">
                            {/* Spacer for remove button */}
                          </div>
                        </div>
                        {(editingItem.options || []).map((option, index) => (
                          <div key={option.id} className="flex gap-2 mb-2">
                            <div className="flex-1">
                              <input
                                type="text"
                                value={option.text || ''}
                                onChange={(e) => {
                                  const newOptions = [
                                    ...(editingItem.options || []),
                                  ];
                                  newOptions[index] = {
                                    ...option,
                                    text: e.target.value,
                                  };
                                  onItemUpdate((prev) => ({
                                    ...prev,
                                    options: newOptions,
                                  }));
                                }}
                                className="w-full p-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Label"
                              />
                            </div>
                            <div className="flex-1">
                              <input
                                type="number"
                                value={option.value || ''}
                                onChange={(e) => {
                                  const newOptions = [
                                    ...(editingItem.options || []),
                                  ];
                                  newOptions[index] = {
                                    ...option,
                                    value: e.target.value,
                                  };
                                  onItemUpdate((prev) => ({
                                    ...prev,
                                    options: newOptions,
                                  }));
                                }}
                                className="w-full p-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Code"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const newOptions = (
                                  editingItem.options || []
                                ).filter((_, i) => i !== index);
                                onItemUpdate((prev) => ({
                                  ...prev,
                                  options: newOptions,
                                }));
                              }}
                              className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100 cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const newOption = {
                              id: `option-${Date.now()}-${
                                (editingItem.options || []).length + 1
                              }`,
                              text: '',
                              value: getNextCodeNumber(),
                            };
                            onItemUpdate((prev) => ({
                              ...prev,
                              options: [...(prev.options || []), newOption],
                            }));
                          }}
                          className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100 cursor-pointer"
                        >
                          Add Answer Option
                        </button>
                      </div>
                    </>
                  )}

                  {editingItem.dataType === 'cf-snom-textbox' && (
                    <>
                      <CodeField
                        value={editingItem.code}
                        onChange={(value) =>
                          onItemUpdate((prev) => ({
                            ...prev,
                            code: value,
                          }))
                        }
                      />
                      <KeyField
                        value={editingItem.key}
                        onChange={(value) =>
                          onItemUpdate((prev) => ({
                            ...prev,
                            key: value,
                          }))
                        }
                      />
                      <TagField
                        value={editingItem.tag}
                        onChange={(value) =>
                          onItemUpdate((prev) => ({
                            ...prev,
                            tag: value,
                          }))
                        }
                      />
                      <GlobalField
                        value={editingItem.global}
                        onChange={(value) =>
                          onItemUpdate((prev) => ({
                            ...prev,
                            global: value,
                          }))
                        }
                      />
                      <div>
                        <label className="block mb-1 font-semibold text-gray-700">
                          Subset:
                        </label>
                        <p className="text-sm text-gray-600 mb-2">
                          This will be a numeric SNOMED concept id for the
                          subset.
                        </p>
                        <input
                          type="number"
                          value={editingItem.subset || ''}
                          onChange={(e) =>
                            onItemUpdate((prev) => ({
                              ...prev,
                              subset: e.target.value,
                            }))
                          }
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter SNOMED concept id"
                        />
                      </div>
                      <WidthField
                        value={editingItem.width}
                        onChange={(value) =>
                          onItemUpdate((prev) => ({
                            ...prev,
                            width: value,
                          }))
                        }
                      />
                    </>
                  )}
                </>
              )}
              {editingItem.type === 'cf-textbox' && (
                <>
                  <div>
                    <label className="block mb-1 font-semibold text-gray-700">
                      Label:
                    </label>
                    <input
                      type="text"
                      value={editingItem.label || ''}
                      onChange={(e) => {
                        const newLabel = e.target.value;
                        onItemUpdate((prev) => ({
                          ...prev,
                          label: newLabel,
                        }));
                      }}
                      ref={firstFieldRef}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <CodeField
                    value={editingItem.code}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        code: value,
                      }))
                    }
                  />
                  <KeyField
                    value={editingItem.key}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        key: value,
                      }))
                    }
                  />
                  <TagField
                    value={editingItem.tag}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        tag: value,
                      }))
                    }
                  />
                  <GlobalField
                    value={editingItem.global}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        global: value,
                      }))
                    }
                  />
                  <RequiredCheckboxField
                    value={editingItem.cfrequired}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        cfrequired: value,
                      }))
                    }
                  />
                  <WidthField
                    value={editingItem.width}
                    onChange={(value) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        width: value,
                      }))
                    }
                  />
                </>
              )}
              {editingItem.type === 'field' && (
                <>
                  <div>
                    <label
                      className={`block mb-1 font-semibold ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Label:
                    </label>
                    {renderInput(
                      editingItem.label,
                      (e) => {
                        const newLabel = e.target.value;
                        const sanitizedKey = sanitizeForKey(newLabel);
                        onItemUpdate((prev) => ({
                          ...prev,
                          label: newLabel,
                          keyField:
                            !prev.keyField ||
                            prev.keyField === sanitizeForKey(prev.label || '')
                              ? sanitizedKey
                              : prev.keyField,
                        }));
                      },
                      'Enter field label...',
                      firstFieldRef
                    )}
                  </div>
                  {showAdvanced && (
                    <div>
                      <label
                        className={`block mb-1 font-semibold ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        Data Type:
                      </label>
                      <select
                        value={editingItem.dataType || 'Text Box'}
                        onChange={(e) =>
                          onItemUpdate((prev) => ({
                            ...prev,
                            dataType: e.target.value,
                          }))
                        }
                        className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-gray-100'
                            : 'border-gray-300'
                        }`}
                      >
                        <option value="Text Box">Text Box</option>
                        <option value="Text Area">Text Area</option>
                        <option value="Date">Date</option>
                      </select>
                    </div>
                  )}
                  <div>
                    <label
                      className={`block mb-1 font-semibold ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Key:
                    </label>
                    <input
                      type="text"
                      value={editingItem.keyField || ''}
                      onChange={(e) =>
                        onItemUpdate((prev) => ({
                          ...prev,
                          keyField: e.target.value,
                        }))
                      }
                      className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-100'
                          : 'border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingItem.required || false}
                        onChange={(e) =>
                          onItemUpdate((prev) => ({
                            ...prev,
                            required: e.target.checked,
                          }))
                        }
                        className={`rounded text-blue-600 ${
                          isDarkMode
                            ? 'border-gray-500 bg-gray-700'
                            : 'border-gray-300'
                        }`}
                      />
                      <span
                        className={`font-semibold ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        Required Field
                      </span>
                    </label>
                  </div>
                </>
              )}
              {editingItem.type === 'question' && (
                <>
                  <div>
                    <label
                      className={`block mb-1 font-semibold ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Label:
                    </label>
                    {renderInput(
                      editingItem.label,
                      (e) => {
                        const newLabel = e.target.value;
                        const sanitizedKey = sanitizeForKey(newLabel);
                        onItemUpdate((prev) => ({
                          ...prev,
                          label: newLabel,
                          keyField:
                            !prev.keyField ||
                            prev.keyField === sanitizeForKey(prev.label || '')
                              ? sanitizedKey
                              : prev.keyField,
                        }));
                      },
                      'Enter question label...',
                      firstFieldRef
                    )}
                  </div>
                  {showAdvanced && (
                    <div>
                      <label
                        className={`block mb-1 font-semibold ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        Data Type:
                      </label>
                      <select
                        value={editingItem.dataType || 'List Box'}
                        onChange={(e) =>
                          onItemUpdate((prev) => ({
                            ...prev,
                            dataType: e.target.value,
                          }))
                        }
                        className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-gray-100'
                            : 'border-gray-300'
                        }`}
                      >
                        <option value="List Box">List Box</option>
                        <option value="Multi Select">Multi Select</option>
                        <option value="Radio Buttons">Radio Buttons</option>
                      </select>
                    </div>
                  )}
                  <div>
                    <label
                      className={`block mb-1 font-semibold ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Key:
                    </label>
                    <input
                      type="text"
                      value={editingItem.keyField || ''}
                      onChange={(e) =>
                        onItemUpdate((prev) => ({
                          ...prev,
                          keyField: e.target.value,
                        }))
                      }
                      className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-100'
                          : 'border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingItem.required || false}
                        onChange={(e) =>
                          onItemUpdate((prev) => ({
                            ...prev,
                            required: e.target.checked,
                          }))
                        }
                        className={`rounded text-blue-600 ${
                          isDarkMode
                            ? 'border-gray-500 bg-gray-700'
                            : 'border-gray-300'
                        }`}
                      />
                      <span
                        className={`font-semibold ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        Required Field
                      </span>
                    </label>
                  </div>
                  <div>
                    <label
                      className={`block mb-2 font-semibold ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Answer Options:
                    </label>
                    {(editingItem.answers || []).map((answer, index) => (
                      <div key={answer.id} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={answer.text}
                          onChange={(e) => {
                            const newAnswers = [...(editingItem.answers || [])];
                            newAnswers[index] = {
                              ...answer,
                              text: e.target.value,
                            };
                            onItemUpdate((prev) => ({
                              ...prev,
                              answers: newAnswers,
                            }));
                          }}
                          className={`flex-1 p-1.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-gray-100'
                              : 'border-gray-300'
                          }`}
                          placeholder={`Option ${index + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newAnswers = (
                              editingItem.answers || []
                            ).filter((_, i) => i !== index);
                            onItemUpdate((prev) => ({
                              ...prev,
                              answers: newAnswers,
                            }));
                          }}
                          className={`px-3 py-1.5 border rounded-md hover:bg-opacity-80 cursor-pointer ${
                            isDarkMode
                              ? 'bg-red-900 text-red-300 border-red-700 hover:bg-red-800'
                              : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                          }`}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const newAnswer = {
                          id: `answer-${Date.now()}-${
                            (editingItem.answers || []).length + 1
                          }`,
                          text: `Option ${
                            (editingItem.answers || []).length + 1
                          }`,
                        };
                        onItemUpdate((prev) => ({
                          ...prev,
                          answers: [...(prev.answers || []), newAnswer],
                        }));
                      }}
                      className={`px-4 py-2 border rounded-md hover:bg-opacity-80 cursor-pointer ${
                        isDarkMode
                          ? 'bg-blue-900 text-blue-300 border-blue-700 hover:bg-blue-800'
                          : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                      }`}
                    >
                      Add Answer Option
                    </button>
                  </div>
                </>
              )}
              {showAdvanced &&
                (editingItem.type === 'page' ||
                  editingItem.type === 'question' ||
                  editingItem.type === 'field' ||
                  editingItem.type === 'table') && (
                  <div
                    className={`border-t pt-4 ${
                      isDarkMode ? 'border-gray-600' : 'border-gray-200'
                    }`}
                  >
                    <h3
                      className={`text-lg font-semibold mb-3 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Visibility Settings
                    </h3>
                    <div className="px-2">
                      <div className="mb-4 ">
                        <label
                          className={`block mb-1 font-semibold ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          Visibility Type:
                        </label>
                        <select
                          value={editingItem.visibilityType || 'Any'}
                          onChange={(e) =>
                            onItemUpdate((prev) => ({
                              ...prev,
                              visibilityType: e.target.value,
                            }))
                          }
                          className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-gray-100'
                              : 'border-gray-300'
                          }`}
                        >
                          <option value="Any">Any</option>
                          <option value="All">All</option>
                        </select>
                      </div>
                      <div>
                        <label
                          className={`block mb-2 font-semibold ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          Conditions:
                        </label>
                        {(editingItem.conditions || []).map(
                          (condition, index) => (
                            <div
                              key={condition.id}
                              className={`flex gap-2 mb-3 p-3 border rounded-md ${
                                isDarkMode
                                  ? 'border-gray-600 bg-gray-700'
                                  : 'border-gray-200 bg-gray-50'
                              }`}
                            >
                              <div className="flex-1">
                                <label
                                  className={`block mb-1 text-sm font-medium ${
                                    isDarkMode
                                      ? 'text-gray-400'
                                      : 'text-gray-600'
                                  }`}
                                >
                                  Record Key:
                                </label>
                                <div className="flex gap-2 items-start">
                                  <input
                                    type="text"
                                    value={condition.record || ''}
                                    onChange={(e) => {
                                      const newConditions = [
                                        ...(editingItem.conditions || []),
                                      ];
                                      newConditions[index] = {
                                        ...condition,
                                        record: e.target.value,
                                      };
                                      onItemUpdate((prev) => ({
                                        ...prev,
                                        conditions: newConditions,
                                      }));
                                    }}
                                    className={`flex-1 p-1.5 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                                      isDarkMode
                                        ? 'bg-gray-600 border-gray-500 text-gray-100'
                                        : 'border-gray-300'
                                    }`}
                                    placeholder="Enter or pick a key"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setKeyPickerState({
                                        open: true,
                                        conditionIndex: index,
                                      })
                                    }
                                    className={`px-3 py-1.5 border rounded-md hover:bg-opacity-80 cursor-pointer ${
                                      isDarkMode
                                        ? 'bg-blue-900 text-blue-300 border-blue-700 hover:bg-blue-800'
                                        : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                    }`}
                                  >
                                    Browse
                                  </button>
                                </div>
                              </div>
                              <div className="flex-1">
                                <label
                                  className={`block mb-1 text-sm font-medium ${
                                    isDarkMode
                                      ? 'text-gray-400'
                                      : 'text-gray-600'
                                  }`}
                                >
                                  Answer:
                                </label>
                                <input
                                  type="text"
                                  value={condition.answer || ''}
                                  onChange={(e) => {
                                    const newConditions = [
                                      ...(editingItem.conditions || []),
                                    ];
                                    newConditions[index] = {
                                      ...condition,
                                      answer: e.target.value,
                                    };
                                    onItemUpdate((prev) => ({
                                      ...prev,
                                      conditions: newConditions,
                                    }));
                                  }}
                                  className={`w-full p-1.5 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                                    isDarkMode
                                      ? 'bg-gray-600 border-gray-500 text-gray-100'
                                      : 'border-gray-300'
                                  }`}
                                  placeholder="Enter answer value"
                                />
                              </div>
                              <div className="flex items-end">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newConditions = (
                                      editingItem.conditions || []
                                    ).filter((_, i) => i !== index);
                                    onItemUpdate((prev) => ({
                                      ...prev,
                                      conditions: newConditions,
                                    }));
                                  }}
                                  className={`px-3 py-1.5 border rounded-md hover:bg-opacity-80 cursor-pointer ${
                                    isDarkMode
                                      ? 'bg-red-900 text-red-300 border-red-700 hover:bg-red-800'
                                      : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                  }`}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          )
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const newCondition = {
                              id: `condition-${Date.now()}-${
                                (editingItem.conditions || []).length + 1
                              }`,
                              record: '',
                              answer: '',
                            };
                            onItemUpdate((prev) => ({
                              ...prev,
                              conditions: [
                                ...(prev.conditions || []),
                                newCondition,
                              ],
                            }));
                          }}
                          className={`px-4 py-2 border rounded-md hover:bg-opacity-80 cursor-pointer ${
                            isDarkMode
                              ? 'bg-green-900 text-green-300 border-green-700 hover:bg-green-800'
                              : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                          }`}
                        >
                          Add Condition
                        </button>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </form>
      </div>
      <KeyPickerModal
        isOpen={keyPickerState.open}
        options={availableKeyOptions}
        onClose={() => setKeyPickerState({ open: false, conditionIndex: null })}
        onSelect={(selectedKey) => {
          if (keyPickerState.conditionIndex == null) return;
          const idx = keyPickerState.conditionIndex;
          const newConditions = [...(editingItem.conditions || [])];
          newConditions[idx] = {
            ...(newConditions[idx] || {}),
            record: selectedKey,
          };
          onItemUpdate((prev) => ({ ...prev, conditions: newConditions }));
        }}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default EditModal;
