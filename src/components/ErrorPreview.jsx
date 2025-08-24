import React, { useMemo } from 'react';

// Lists configuration errors in the questionnaire structure.
// Current validations:
//  - Missing page title
//  - Empty tables (no table-fields)
//  - Missing keyField on Question / Field / Table
//  - Duplicate keyField (record) across Question / Field / Table (ignores internal Text duplication)
//  - Invalid key format (only letters, numbers, hyphens)
// Format example:
//   Page Title -> Component Label : Key Missing
//   Page Title -> Component Label : Duplicate Key (my-key)
const ErrorPreview = ({ droppedItems }) => {
  const errors = useMemo(() => {
    const list = [];
    const keyUsage = {}; // key -> [{id, path, label, type}]
    const validKeyRegex = /^[A-Za-z0-9-]+$/; // Only letters, numbers, hyphen

    const pushMissingKey = (ctx) =>
      list.push({ ...ctx, errorType: 'missing-key' });
    const pushDuplicateKey = (ctx, key) =>
      list.push({ ...ctx, errorType: 'duplicate-key', key });
    const pushInvalidKey = (ctx, key) =>
      list.push({ ...ctx, errorType: 'invalid-key-format', key });
    const pushMissingTitle = (ctx) =>
      list.push({ ...ctx, errorType: 'missing-page-title' });
    const pushEmptyTable = (ctx) =>
      list.push({ ...ctx, errorType: 'empty-table' });

    const walk = (items, ancestorPages) => {
      items.forEach((item) => {
        const newAncestors =
          item.type === 'page'
            ? [...ancestorPages, item.title || item.label || 'Untitled Page']
            : ancestorPages;

        // Page level validation: missing title (title property preferred)
        if (item.type === 'page') {
          const title = (item.title || '').trim();
          if (!title) {
            pushMissingTitle({
              id: item.id,
              path: newAncestors.slice(0, -1), // exclude placeholder
              label: '(missing title)',
              type: 'page',
            });
          }
        }

        if (item.type === 'table') {
          if (!item.children || item.children.length === 0) {
            pushEmptyTable({
              id: item.id,
              path: newAncestors,
              label: item.label || '(table)',
              type: 'table',
            });
          }
        }

        if (['question', 'field', 'table'].includes(item.type)) {
          const key = (item.keyField || '').trim();
          const ctx = {
            id: item.id,
            path: newAncestors,
            label: item.label || '(no label)',
            type: item.type,
          };
          if (!key) {
            pushMissingKey(ctx);
          } else if (!validKeyRegex.test(key)) {
            // Invalid format (spaces or disallowed symbols). Don't include in duplicate grouping.
            pushInvalidKey(ctx, key);
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
      if (arr.length > 1) arr.forEach((ctx) => pushDuplicateKey(ctx, key));
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
        No structural or key issues detected.
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
          const isMissingTitle = err.errorType === 'missing-page-title';
          const isEmptyTable = err.errorType === 'empty-table';
          return (
            <li
              key={err.id + '-' + err.errorType + '-' + idx}
              className="border border-red-200 bg-red-50 rounded p-3 text-sm"
            >
              <span className="font-mono text-xs text-gray-700 block mb-1">
                {chain.join(' -> ')} : {isMissing && 'Key Missing'}
                {isDuplicate && `Duplicate Key (${err.key})`}
                {isInvalid && `Invalid Key (${err.key})`}
                {isMissingTitle && 'Missing Page Title'}
                {isEmptyTable && 'Empty Table (no fields)'}
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
              {isMissingTitle && (
                <span className="text-red-700">
                  Enter a title for this page to identify it.
                </span>
              )}
              {isEmptyTable && (
                <span className="text-red-700">
                  Add at least one table field (column) or remove the table.
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
