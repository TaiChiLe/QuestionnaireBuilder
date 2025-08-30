import React, { useState, useMemo } from 'react';

// Reusable modal to pick a key from available question/field components
const KeyPickerModal = ({
  isOpen,
  onClose,
  onSelect,
  options = [],
  excludeKey,
  isDarkMode = false,
}) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.key.toLowerCase().includes(q) ||
        (o.label || '').toLowerCase().includes(q) ||
        (o.page || '').toLowerCase().includes(q)
    );
  }, [options, query]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className={`w-[640px] max-w-[94vw] max-h-[80vh] rounded-lg shadow-2xl flex flex-col ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`px-5 py-4 border-b flex items-center justify-between ${
            isDarkMode ? 'border-gray-600' : 'border-gray-200'
          }`}
        >
          <h3
            className={`m-0 text-lg font-semibold ${
              isDarkMode ? 'text-gray-100' : 'text-gray-800'
            }`}
          >
            Select Record Key
          </h3>
          <button
            onClick={onClose}
            className={`px-2 py-1 text-sm rounded ${
              isDarkMode
                ? 'text-gray-400 hover:text-gray-200'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ✕
          </button>
        </div>
        <div className="p-4 space-y-4">
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by key, label, or page..."
            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                : 'border-gray-300'
            }`}
          />
          <div
            className={`text-xs flex justify-between ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            <span>
              {filtered.length} / {options.length} keys
            </span>
            <span>
              Only Questions & Fields listed. Current component excluded.
            </span>
          </div>
          <div
            className={`border rounded-md overflow-hidden ${
              isDarkMode ? 'border-gray-600' : 'border-gray-200'
            }`}
          >
            <div
              className={`max-h-[40vh] overflow-auto divide-y ${
                isDarkMode ? 'divide-gray-600' : 'divide-gray-200'
              }`}
            >
              {filtered.length === 0 && (
                <div
                  className={`p-6 text-center text-sm ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}
                >
                  No matches.
                </div>
              )}
              {filtered.map((o) => (
                <button
                  key={o.key}
                  onClick={() => {
                    onSelect(o.key);
                    onClose();
                  }}
                  className={`w-full text-left px-4 py-2 text-sm focus:outline-none flex flex-col ${
                    isDarkMode
                      ? 'hover:bg-gray-700 focus:bg-gray-700'
                      : 'hover:bg-blue-50 focus:bg-blue-50'
                  }`}
                >
                  <span
                    className={`font-mono font-semibold break-all ${
                      isDarkMode ? 'text-gray-100' : 'text-gray-800'
                    }`}
                  >
                    {o.key}
                  </span>
                  <span
                    className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}
                  >
                    {o.page ? o.page + ' · ' : ''}
                    {o.type}: {o.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div
            className={`flex justify-end gap-2 pt-2 border-t ${
              isDarkMode ? 'border-gray-600' : 'border-gray-200'
            }`}
          >
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-md text-sm border ${
                isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyPickerModal;
