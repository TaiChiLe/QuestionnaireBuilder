import { useState, useMemo, useRef, useEffect } from 'react';
import KeyPickerModal from './KeyPickerModal';

const EditModal = ({
  isOpen,
  editingItem,
  onSave,
  onCancel,
  onItemUpdate,
  droppedItems = [],
}) => {
  const [keyPickerState, setKeyPickerState] = useState({
    open: false,
    conditionIndex: null,
  });
  // Advanced settings toggle (persisted)
  const [showAdvanced, setShowAdvanced] = useState(() => {
    try {
      const stored = localStorage.getItem('qb_show_advanced');
      return stored === 'true';
    } catch (_) {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('qb_show_advanced', showAdvanced ? 'true' : 'false');
    } catch (_) {
      /* noop */
    }
  }, [showAdvanced]);

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
      // Delay focus slightly to ensure element is mounted
      const id = requestAnimationFrame(() => {
        if (firstFieldRef.current) {
          try {
            firstFieldRef.current.focus();
            firstFieldRef.current.select?.();
          } catch (_) {
            /* noop */
          }
        }
      });
      return () => cancelAnimationFrame(id);
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
        className="bg-white rounded-lg p-6 w-[600px] max-w-[90vw] max-h-[80vh] overflow-auto shadow-2xl"
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
          <div className="flex items-start justify-between gap-4 mb-5">
            <h2 className="m-0 font-bold text-xl text-gray-800 flex-1">
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
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className={`px-3 py-1.5 rounded text-xs font-semibold border transition-colors ${
                showAdvanced
                  ? 'bg-[#f03741] text-white border-[#f03741] hover:bg-[#d82f36]'
                  : 'bg-white text-[#f03741] border-[#fbc5c8] hover:bg-[#fff5f5]'
              }`}
            >
              {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
            </button>
          </div>
          <div className="px-2">
            <div className="flex flex-col space-y-4">
              {editingItem.type === 'page' && (
                <div>
                  <label className="block mb-1 font-semibold text-gray-700">
                    Title:
                  </label>
                  <input
                    type="text"
                    value={editingItem.title || ''}
                    onChange={(e) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    ref={firstFieldRef}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
              {editingItem.type === 'information' && (
                <div>
                  <label className="block mb-1 font-semibold text-gray-700">
                    Label:
                  </label>
                  <input
                    type="text"
                    value={editingItem.label || ''}
                    onChange={(e) =>
                      onItemUpdate((prev) => ({
                        ...prev,
                        label: e.target.value,
                      }))
                    }
                    ref={firstFieldRef}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
              {editingItem.type === 'table' && (
                <>
                  <div>
                    <label className="block mb-1 font-semibold text-gray-700">
                      Label:
                    </label>
                    <input
                      type="text"
                      value={editingItem.label || ''}
                      onChange={(e) =>
                        onItemUpdate((prev) => ({
                          ...prev,
                          label: e.target.value,
                          keyField: sanitizeForKey(e.target.value),
                        }))
                      }
                      ref={firstFieldRef}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold text-gray-700">
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
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        className="rounded border-gray-300 text-blue-600 shadow-sm"
                      />
                      <span className="font-semibold text-gray-700">
                        Required
                      </span>
                    </label>
                  </div>
                </>
              )}
              {editingItem.type === 'table-field' && (
                <>
                  <div>
                    <label className="block mb-1 font-semibold text-gray-700">
                      Label:
                    </label>
                    <input
                      type="text"
                      value={editingItem.label || ''}
                      onChange={(e) =>
                        onItemUpdate((prev) => ({
                          ...prev,
                          label: e.target.value,
                        }))
                      }
                      ref={firstFieldRef}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold text-gray-700">
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
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        className="rounded border-gray-300 text-blue-600"
                      />
                      <span className="font-semibold text-gray-700">
                        Required
                      </span>
                    </label>
                  </div>
                </>
              )}
              {editingItem.type === 'field' && (
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
                      value={editingItem.dataType || 'Text Box'}
                      onChange={(e) =>
                        onItemUpdate((prev) => ({
                          ...prev,
                          dataType: e.target.value,
                        }))
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Text Box">Text Box</option>
                      <option value="Text Area">Text Area</option>
                      <option value="Date">Date</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold text-gray-700">
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
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        className="rounded border-gray-300 text-blue-600"
                      />
                      <span className="font-semibold text-gray-700">
                        Required Field
                      </span>
                    </label>
                  </div>
                </>
              )}
              {editingItem.type === 'question' && (
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
                      value={editingItem.dataType || 'List Box'}
                      onChange={(e) =>
                        onItemUpdate((prev) => ({
                          ...prev,
                          dataType: e.target.value,
                        }))
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="List Box">List Box</option>
                      <option value="Multi Select">Multi Select</option>
                      <option value="Radio Buttons">Radio Buttons</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold text-gray-700">
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
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        className="rounded border-gray-300 text-blue-600"
                      />
                      <span className="font-semibold text-gray-700">
                        Required Field
                      </span>
                    </label>
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700">
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
                          className="flex-1 p-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                          className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100 cursor-pointer"
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
                      className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100 cursor-pointer"
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
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">
                      Visibility Settings
                    </h3>
                    <div className="px-2">
                      <div className="mb-4 ">
                        <label className="block mb-1  font-semibold text-gray-700">
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
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="Any">Any</option>
                          <option value="All">All</option>
                        </select>
                      </div>
                      <div>
                        <label className="block mb-2 font-semibold text-gray-700">
                          Conditions:
                        </label>
                        {(editingItem.conditions || []).map(
                          (condition, index) => (
                            <div
                              key={condition.id}
                              className="flex gap-2 mb-3 p-3 border border-gray-200 rounded-md bg-gray-50"
                            >
                              <div className="flex-1">
                                <label className="block mb-1 text-sm font-medium text-gray-600">
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
                                    className="flex-1 p-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                                    className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100 cursor-pointer"
                                  >
                                    Browse
                                  </button>
                                </div>
                              </div>
                              <div className="flex-1">
                                <label className="block mb-1 text-sm font-medium text-gray-600">
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
                                  className="w-full p-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                                  className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100 cursor-pointer"
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
                          className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-md hover:bg-green-100 cursor-pointer"
                        >
                          Add Condition
                        </button>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>
          <div className="flex gap-3 mt-6 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 bg-gray-100 text-gray-800 border border-gray-300 rounded-md hover:bg-gray-200 cursor-pointer"
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
      />
    </div>
  );
};

export default EditModal;
