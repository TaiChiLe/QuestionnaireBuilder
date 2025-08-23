import React, { useMemo } from 'react';

// Lists configuration errors in the questionnaire structure.
// Current validations:
//  - Missing keyField on Question / Field / Table
//  - Duplicate keyField (record) across Question / Field / Table (ignores internal Text duplication)
// Format example:
//   Page Title -> Component Label : Key Missing
//   Page Title -> Component Label : Duplicate Key (my-key)
const ErrorPreview = ({ droppedItems }) => {
  const errors = useMemo(() => {
    const list = [];
    const keyUsage = {}; // key -> [{id, path, label, type}]
    const validKeyRegex = /^[A-Za-z0-9-]+$/; // Only letters, numbers, hyphen

    const pushMissing = (ctx) =>
      list.push({ ...ctx, errorType: 'missing-key' });
    const pushDuplicate = (ctx, key) =>
      list.push({ ...ctx, errorType: 'duplicate-key', key });
    const pushInvalid = (ctx, key) =>
      list.push({ ...ctx, errorType: 'invalid-key-format', key });

    const walk = (items, ancestorPages) => {
      items.forEach((item) => {
        const newAncestors =
          item.type === 'page'
            ? [...ancestorPages, item.title || item.label || 'Untitled Page']
            : ancestorPages;

        if (['question', 'field', 'table'].includes(item.type)) {
          const key = (item.keyField || '').trim();
          const ctx = {
            id: item.id,
            path: newAncestors,
            label: item.label || '(no label)',
            type: item.type,
          };
          if (!key) {
            pushMissing(ctx);
          } else if (!validKeyRegex.test(key)) {
            // Invalid format (spaces or disallowed symbols). Don't include in duplicate grouping.
            pushInvalid(ctx, key);
          } else {
            if (!keyUsage[key]) keyUsage[key] = [];
            keyUsage[key].push(ctx);
          }
        }

        if (item.children && item.children.length > 0)
          walk(item.children, newAncestors);
      });
    };

    walk(droppedItems, []);

    // Add duplicate key errors (only if key appears >1)
    Object.entries(keyUsage).forEach(([key, arr]) => {
      if (arr.length > 1) arr.forEach((ctx) => pushDuplicate(ctx, key));
    });

    return list;
  }, [droppedItems]);

  if (!droppedItems || droppedItems.length === 0) {
    return (
      <p className="text-center text-gray-400 italic my-10">
        Add components above to see error checks
      </p>
    );
  }

  if (errors.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 text-green-700 rounded p-4 text-sm">
        All keys present, valid format, and unique.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600">
        {errors.length} issue{errors.length !== 1 && 's'} found:
      </div>
      <ul className="m-0 p-0 list-none space-y-2">
        {errors.map((err, idx) => {
          const chain = [...err.path, err.label];
          const isDuplicate = err.errorType === 'duplicate-key';
          const isMissing = err.errorType === 'missing-key';
          const isInvalid = err.errorType === 'invalid-key-format';
          return (
            <li
              key={err.id + '-' + err.errorType + '-' + idx}
              className="border border-red-200 bg-red-50 rounded p-3 text-sm"
            >
              <span className="font-mono text-xs text-gray-700 block mb-1">
                {chain.join(' -> ')} : {isMissing && 'Key Missing'}
                {isDuplicate && `Duplicate Key (${err.key})`}
                {isInvalid && `Invalid Key (${err.key})`}
              </span>
              {isMissing && (
                <span className="text-red-700">
                  Provide a unique key for this {err.type}.
                </span>
              )}
              {isDuplicate && (
                <span className="text-red-700">
                  Change this key; it is also used on other components.
                </span>
              )}
              {isInvalid && (
                <span className="text-red-700">
                  Only letters, numbers, and hyphens allowed. Remove spaces or
                  other symbols.
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ErrorPreview;
