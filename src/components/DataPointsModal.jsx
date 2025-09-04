import React, { useState, useEffect } from 'react';

const DataPointsModal = ({
  isOpen,
  onClose,
  dataPoints = [],
  onSave,
  isDarkMode = false,
}) => {
  const [localDataPoints, setLocalDataPoints] = useState([]);
  const [newDataPoint, setNewDataPoint] = useState({
    label: '',
    min: '',
    max: '',
    colour: '#3B82F6',
  });

  // Initialize local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalDataPoints(dataPoints.length > 0 ? [...dataPoints] : []);
      setNewDataPoint({
        label: '',
        min: '',
        max: '',
        colour: '#3B82F6',
      });
    }
  }, [isOpen, dataPoints]);

  const handleAddDataPoint = () => {
    if (!newDataPoint.label.trim()) return;

    const dataPoint = {
      label: newDataPoint.label.trim(),
      min: newDataPoint.min || '0',
      max: newDataPoint.max || '100',
      colour: newDataPoint.colour,
    };

    setLocalDataPoints((prev) => [...prev, dataPoint]);
    setNewDataPoint({
      label: '',
      min: '',
      max: '',
      colour: '#3B82F6',
    });
  };

  const handleRemoveDataPoint = (index) => {
    setLocalDataPoints((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateDataPoint = (index, field, value) => {
    setLocalDataPoints((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSave = () => {
    onSave(localDataPoints);
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddDataPoint();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className={`${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } rounded-lg p-6 max-w-7xl w-full mx-4 max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2
            className={`text-xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Manage Data Points
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode
                ? 'hover:bg-gray-700 text-gray-400'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Add New Data Point */}
        <div
          className={`p-4 rounded-lg mb-6 ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}
        >
          <h3
            className={`font-semibold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Add New Data Point
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label
                className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Label
              </label>
              <input
                type="text"
                value={newDataPoint.label}
                onChange={(e) =>
                  setNewDataPoint((prev) => ({
                    ...prev,
                    label: e.target.value,
                  }))
                }
                onKeyPress={handleKeyPress}
                placeholder="e.g., Healthy"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Min Value
              </label>
              <input
                type="number"
                value={newDataPoint.min}
                onChange={(e) =>
                  setNewDataPoint((prev) => ({ ...prev, min: e.target.value }))
                }
                onKeyPress={handleKeyPress}
                placeholder="0"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Max Value
              </label>
              <input
                type="number"
                value={newDataPoint.max}
                onChange={(e) =>
                  setNewDataPoint((prev) => ({ ...prev, max: e.target.value }))
                }
                onKeyPress={handleKeyPress}
                placeholder="100"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Colour
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={newDataPoint.colour}
                  onChange={(e) =>
                    setNewDataPoint((prev) => ({
                      ...prev,
                      colour: e.target.value,
                    }))
                  }
                  className="w-12 h-9 border rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={newDataPoint.colour}
                  onChange={(e) =>
                    setNewDataPoint((prev) => ({
                      ...prev,
                      colour: e.target.value,
                    }))
                  }
                  placeholder="#3B82F6"
                  className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode
                      ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleAddDataPoint}
            disabled={!newDataPoint.label.trim()}
            className={`mt-4 px-4 py-2 rounded-md font-medium transition-colors ${
              newDataPoint.label.trim()
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : isDarkMode
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Add Data Point
          </button>
        </div>

        {/* Existing Data Points */}
        <div className="mb-6">
          <h3
            className={`font-semibold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Data Points ({localDataPoints.length})
          </h3>

          {localDataPoints.length === 0 ? (
            <p
              className={`text-center py-8 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              No data points added yet. Add some above to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {localDataPoints.map((point, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        Label
                      </label>
                      <input
                        type="text"
                        value={point.label}
                        onChange={(e) =>
                          handleUpdateDataPoint(index, 'label', e.target.value)
                        }
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        Min
                      </label>
                      <input
                        type="number"
                        value={point.min}
                        onChange={(e) =>
                          handleUpdateDataPoint(index, 'min', e.target.value)
                        }
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        Max
                      </label>
                      <input
                        type="number"
                        value={point.max}
                        onChange={(e) =>
                          handleUpdateDataPoint(index, 'max', e.target.value)
                        }
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>

                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label
                          className={`block text-sm font-medium mb-1 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          Colour
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={point.colour}
                            onChange={(e) =>
                              handleUpdateDataPoint(
                                index,
                                'colour',
                                e.target.value
                              )
                            }
                            className="w-10 h-9 border rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={point.colour}
                            onChange={(e) =>
                              handleUpdateDataPoint(
                                index,
                                'colour',
                                e.target.value
                              )
                            }
                            className={`flex-1 px-2 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                              isDarkMode
                                ? 'bg-gray-600 border-gray-500 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveDataPoint(index)}
                        className={`p-2 rounded transition-colors ${
                          isDarkMode
                            ? 'hover:bg-red-600 text-red-400'
                            : 'hover:bg-red-100 text-red-600'
                        }`}
                        title="Remove data point"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              isDarkMode
                ? 'bg-gray-600 hover:bg-gray-700 text-gray-300'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
          >
            Save Data Points
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataPointsModal;
