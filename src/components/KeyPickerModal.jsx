import React, { useState, useMemo } from 'react';

// Reusable modal to pick a key from available question/field components
const KeyPickerModal = ({
  isOpen,
  onClose,
  onSelect,
  options = [],
  excludeKey,
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
        className="bg-white w-[640px] max-w-[94vw] max-h-[80vh] rounded-lg shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h3 className="m-0 text-lg font-semibold text-gray-800">
            Select Record Key
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 px-2 py-1 text-sm rounded"
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
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          <div className="text-xs text-gray-500 flex justify-between">
            <span>
              {filtered.length} / {options.length} keys
            </span>
            <span>
              Only Questions & Fields listed. Current component excluded.
            </span>
          </div>
          <div className="border rounded-md overflow-hidden">
            <div className="max-h-[40vh] overflow-auto divide-y">
              {filtered.length === 0 && (
                <div className="p-6 text-center text-gray-400 text-sm">
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
                  className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none flex flex-col"
                >
                  <span className="font-mono font-semibold text-gray-800 break-all">
                    {o.key}
                  </span>
                  <span className="text-gray-600">
                    {o.page ? o.page + ' · ' : ''}
                    {o.type}: {o.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm border border-gray-300"
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
