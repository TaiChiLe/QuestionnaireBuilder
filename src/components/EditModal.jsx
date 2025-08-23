import { useState, useEffect } from 'react';

const EditModal = ({ isOpen, editingItem, onSave, onCancel, onItemUpdate }) => {
  const [editFormData, setEditFormData] = useState({
    questionText: '',
  });

  // Function to sanitize label for key field
  const sanitizeForKey = (text) => {
    return text
      .toLowerCase() // Convert to lowercase
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^a-z0-9-]/g, '') // Remove all special characters except hyphens
      .replace(/-+/g, '-') // Replace multiple consecutive hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
  };

  useEffect(() => {
    if (editingItem) {
      setEditFormData({
        questionText: editingItem.questionText || '',
      });
    }
  }, [editingItem]);

  if (!isOpen || !editingItem) return null;

  const handleSave = () => {
    onSave(editingItem);
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-[2000] bg-black/10">
      <div
        className="bg-white rounded-lg p-6 w-[600px] max-w-[90vw] max-h-[80vh] overflow-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="m-0 mb-5 text-gray-800">
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

        <div className="flex flex-col space-y-4">
          {/* Title Field - only for pages */}
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
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Information-specific fields - only for information */}
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
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Table-specific fields - only for tables */}
          {editingItem.type === 'table' && (
            <>
              {/* Label Field - for tables */}
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
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Key Field - for tables */}
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

              {/* Required Field - for tables */}
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
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="font-semibold text-gray-700">Required</span>
                </label>
              </div>
            </>
          )}

          {/* Table-Field-specific fields - only for table-fields */}
          {editingItem.type === 'table-field' && (
            <>
              {/* Label Field - for table-fields */}
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
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Data Type Field - for table-fields */}
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

              {/* Required Field - for table-fields */}
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
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="font-semibold text-gray-700">Required</span>
                </label>
              </div>
            </>
          )}

          {/* Field-specific fields - only for fields */}
          {editingItem.type === 'field' && (
            <>
              {/* Label Field - for fields */}
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
                      // Auto-populate keyField only if it's empty or matches the previous sanitized label
                      keyField:
                        !prev.keyField ||
                        prev.keyField === sanitizeForKey(prev.label || '')
                          ? sanitizedKey
                          : prev.keyField,
                    }));
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Data Type Field - for fields */}
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

              {/* Key Field - for fields */}
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

              {/* Required Field - for fields */}
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
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-semibold text-gray-700">
                    Required Field
                  </span>
                </label>
              </div>
            </>
          )}

          {/* Question-specific fields - only for questions */}
          {editingItem.type === 'question' && (
            <>
              {/* Label Field - only for questions */}
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
                      // Auto-populate keyField only if it's empty or matches the previous sanitized label
                      keyField:
                        !prev.keyField ||
                        prev.keyField === sanitizeForKey(prev.label || '')
                          ? sanitizedKey
                          : prev.keyField,
                    }));
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Data Type Field */}
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

              {/* Key Field */}
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

              {/* Required Field */}
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
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-semibold text-gray-700">
                    Required Field
                  </span>
                </label>
              </div>

              {/* Answers List */}
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
                      onClick={() => {
                        const newAnswers = (editingItem.answers || []).filter(
                          (_, i) => i !== index
                        );
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
                  onClick={() => {
                    const newAnswer = {
                      id: `answer-${Date.now()}-${
                        (editingItem.answers || []).length + 1
                      }`,
                      text: `Option ${(editingItem.answers || []).length + 1}`,
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

          {/* Visibility Section - for pages, questions, fields, and tables */}
          {(editingItem.type === 'page' ||
            editingItem.type === 'question' ||
            editingItem.type === 'field' ||
            editingItem.type === 'table') && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Visibility Settings
              </h3>

              {/* Visibility Type Dropdown */}
              <div className="mb-4">
                <label className="block mb-1 font-semibold text-gray-700">
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

              {/* Conditions List */}
              <div>
                <label className="block mb-2 font-semibold text-gray-700">
                  Conditions:
                </label>
                {(editingItem.conditions || []).map((condition, index) => (
                  <div
                    key={condition.id}
                    className="flex gap-2 mb-3 p-3 border border-gray-200 rounded-md bg-gray-50"
                  >
                    <div className="flex-1">
                      <label className="block mb-1 text-sm font-medium text-gray-600">
                        Record Key:
                      </label>
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
                        className="w-full p-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter record name"
                      />
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
                ))}

                <button
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
                      conditions: [...(prev.conditions || []), newCondition],
                    }));
                  }}
                  className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-md hover:bg-green-100 cursor-pointer"
                >
                  Add Condition
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex gap-3 mt-6 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 bg-gray-100 text-gray-800 border border-gray-300 rounded-md hover:bg-gray-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-blue-600 text-white border-0 rounded-md hover:bg-blue-700 cursor-pointer font-semibold"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
