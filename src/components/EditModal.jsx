import { useState, useMemo, useRef, useEffect } from 'react';
import KeyPickerModal from './KeyPickerModal';

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

  // Helper function to determine if we should use textarea based on text length
  const shouldUseTextarea = (text, threshold = 80) => {
    return text && text.length > threshold;
  };

  // Helper function to render adaptive input/textarea
  const renderAdaptiveInput = (
    value,
    onChange,
    placeholder = '',
    ref = null,
    threshold = 80
  ) => {
    const isTextarea = shouldUseTextarea(value, threshold);
    const commonClassName = `w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
      isDarkMode
        ? 'bg-gray-700 border-gray-600 text-gray-100'
        : 'border-gray-300'
    }`;

    if (isTextarea) {
      return (
        <textarea
          value={value || ''}
          onChange={onChange}
          ref={ref}
          className={`${commonClassName} resize-none min-h-[80px]`}
          placeholder={placeholder}
          rows={Math.min(Math.ceil((value || '').length / 40), 4)}
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
      const tag = (e.target && e.target.tagName) || '';
      if (keyPickerState.open) return; // allow key picker interaction
      if (tag === 'TEXTAREA' || e.shiftKey) return; // allow multiline future
      // Prevent accidental form submission bubbling to underlying DnD elements
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
                  className="px-5 py-2.5 bg-blue-600 text-white border-0 rounded-md hover:bg-blue-700 cursor-pointer font-semibold"
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
                  {renderAdaptiveInput(
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
                  {renderAdaptiveInput(
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
                    {renderAdaptiveInput(
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
                    {renderAdaptiveInput(
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
                    {renderAdaptiveInput(
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
                    {renderAdaptiveInput(
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
