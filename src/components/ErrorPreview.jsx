import React, { useMemo } from 'react';

// Lists configuration errors in the questionnaire structure.
// Current validations:
//  - Missing page title
//  - Empty tables (no table-fields)
//  - Missing keyField on Question / Field / Table
//  - Duplicate keyField (record) across Question / Field / Table (ignores internal Text duplication)
//  - Invalid key format (only letters, numbers, hyphens)
//  - Clinical Form validations:
//    - Missing cfcode on CF components
//    - Empty cf-listbox/cf-radio (no options)
//    - Empty cf-table/cf-panel (no children)
//    - Invalid cfcode format
// Format example:
//   Page Title -> Component Label : Key Missing
//   Page Title -> Component Label : Duplicate Key (my-key)
const ErrorPreview = ({ droppedItems, onNavigateToItem, builderMode }) => {
  const errors = useMemo(() => {
    const list = [];
    const keyUsage = {}; // key -> [{id, path, label, type}]
    const codeUsage = {}; // code -> [{id, path, label, type}] for clinical forms
    const validKeyRegex = /^[A-Za-z0-9-]+$/; // Only letters, numbers, hyphen
    const validCodeRegex = /^[0-9]+$/; // Only numbers

    const pushMissingKey = (ctx) =>
      list.push({ ...ctx, errorType: 'missing-key', targetId: ctx.id });
    const pushDuplicateKey = (ctx, key) =>
      list.push({ ...ctx, errorType: 'duplicate-key', key, targetId: ctx.id });
    const pushInvalidKey = (ctx, key) =>
      list.push({
        ...ctx,
        errorType: 'invalid-key-format',
        key,
        targetId: ctx.id,
      });
    const pushMissingTitle = (ctx) =>
      list.push({ ...ctx, errorType: 'missing-page-title', targetId: ctx.id });
    const pushEmptyTable = (ctx) =>
      list.push({ ...ctx, errorType: 'empty-table', targetId: ctx.id });
    const pushEmptyQuestion = (ctx) =>
      list.push({
        ...ctx,
        errorType: 'empty-question',
        targetId: ctx.originalId,
      });
    const pushBlankConditionRecord = (ctx) =>
      list.push({
        ...ctx,
        errorType: 'blank-condition-record',
        targetId: ctx.originalId,
      });

    // Clinical Form specific error functions
    const pushMissingCode = (ctx) =>
      list.push({ ...ctx, errorType: 'missing-code', targetId: ctx.id });
    const pushDuplicateCode = (ctx, code) => {
      // For option-related errors, navigate to the parent component
      const targetId = ctx.id.includes('-option-')
        ? ctx.id.split('-option-')[0]
        : ctx.id;
      list.push({
        ...ctx,
        errorType: 'duplicate-code',
        code,
        targetId,
      });
    };
    const pushInvalidCode = (ctx, code) => {
      // For option-related errors, navigate to the parent component
      const targetId = ctx.id.includes('-option-')
        ? ctx.id.split('-option-')[0]
        : ctx.id;
      list.push({
        ...ctx,
        errorType: 'invalid-code-format',
        code,
        targetId,
      });
    };
    const pushEmptyCfOptions = (ctx) =>
      list.push({ ...ctx, errorType: 'empty-cf-options', targetId: ctx.id });
    const pushEmptyCfContainer = (ctx) =>
      list.push({ ...ctx, errorType: 'empty-cf-container', targetId: ctx.id });
    const pushChartWithoutPatientData = (ctx) =>
      list.push({ ...ctx, errorType: 'chart-without-patient-data', targetId: ctx.id });

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

        // Questionnaire mode validations
        if (builderMode !== 'clinical') {
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

          // Empty Question warning (no answers configured)
          if (item.type === 'question') {
            const answers = Array.isArray(item.answers) ? item.answers : [];
            if (answers.length === 0) {
              pushEmptyQuestion({
                id: item.id + '-emptyq',
                originalId: item.id,
                path: newAncestors,
                label: item.label || '(no label)',
                type: 'question',
              });
            }
          }

          // Condition validation: blank record key
          if (Array.isArray(item.conditions) && item.conditions.length > 0) {
            item.conditions.forEach((cond, idx) => {
              const rec = (cond.record || '').trim();
              if (!rec) {
                pushBlankConditionRecord({
                  id: `${item.id}-cond-${idx}`,
                  originalId: item.id,
                  path: newAncestors.concat([
                    (item.label || item.title || item.type || 'Component') +
                      ` (Condition ${idx + 1})`,
                  ]),
                  label: '(blank record)',
                  type: 'condition',
                });
              }
            });
          }
        }

        // Clinical Form mode validations
        if (builderMode === 'clinical') {
          const clinicalFormComponents = [
            'cf-button',
            'cf-checkbox',
            'cf-date',
            'cf-future-date',
            'cf-group',
            'cf-info',
            'cf-listbox',
            'cf-notes',
            'cf-notes-history',
            'cf-panel',
            'cf-patient-data',
            'cf-patient-data-all',
            'cf-prescription',
            'cf-provided-services',
            'cf-radio',
            'cf-snom-textbox',
            'cf-table',
            'cf-table-field',
            'cf-textbox',
          ];

          // Components that require Code (only those that actually have code property in itemFactory)
          const codeRequiredComponents = [
            'cf-checkbox',
            'cf-date',
            'cf-future-date',
            'cf-listbox',
            'cf-notes',
            'cf-notes-history',
            'cf-radio',
            'cf-snom-textbox',
            'cf-table',
            'cf-table-field',
            'cf-textbox',
          ];

          if (codeRequiredComponents.includes(item.type)) {
            const code = (item.code || '').trim();
            const ctx = {
              id: item.id,
              path: newAncestors,
              label: item.label || '(no label)',
              type: item.type,
            };

            // Check for missing code
            if (!code) {
              pushMissingCode(ctx);
            } else if (!validCodeRegex.test(code)) {
              // Invalid code format
              pushInvalidCode(ctx, code);
            } else {
              // Track code usage for duplicate detection
              if (!codeUsage[code]) codeUsage[code] = [];
              codeUsage[code].push(ctx);
            }
          }

          // Check option values for duplicate codes (cf-listbox, cf-radio, cf-table-field)
          if (
            item.type === 'cf-listbox' ||
            item.type === 'cf-radio' ||
            item.type === 'cf-table-field'
          ) {
            const options = Array.isArray(item.options) ? item.options : [];
            options.forEach((option, optionIndex) => {
              if (option.value) {
                const optionCode = (option.value || '').toString().trim();
                if (optionCode && validCodeRegex.test(optionCode)) {
                  const optionCtx = {
                    id: `${item.id}-option-${optionIndex}`,
                    path: newAncestors,
                    label: `${item.label || '(no label)'} > Option: ${
                      option.text || `#${optionIndex + 1}`
                    }`,
                    type: `${item.type}-option`,
                  };
                  if (!codeUsage[optionCode]) codeUsage[optionCode] = [];
                  codeUsage[optionCode].push(optionCtx);
                }
              }
            });
          }

          // Empty CF listbox/radio validation (no options)
          if (item.type === 'cf-listbox' || item.type === 'cf-radio') {
            const options = Array.isArray(item.options) ? item.options : [];
            if (options.length === 0) {
              pushEmptyCfOptions({
                id: item.id,
                path: newAncestors,
                label: item.label || '(no label)',
                type: item.type,
              });
            }
          }

          // Empty CF container validation (no children)
          if (
            item.type === 'cf-table' ||
            item.type === 'cf-panel' ||
            item.type === 'cf-group'
          ) {
            if (!item.children || item.children.length === 0) {
              pushEmptyCfContainer({
                id: item.id,
                path: newAncestors,
                label: item.label || '(no label)',
                type: item.type,
              });
            }
          }
        }

        if (item.children && item.children.length > 0)
          walk(item.children, newAncestors);
      });
    };

    walk(droppedItems, []);

    // Check for charts without patient data fields in clinical form mode
    if (builderMode === 'clinical') {
      const hasCharts = [];
      const hasPatientDataFields = [];

      const findChartsAndPatientData = (items, ancestorPages) => {
        items.forEach((item) => {
          const newAncestors = 
            item.type === 'page'
              ? [...ancestorPages, item.title || item.label || 'Untitled Page']
              : ancestorPages;

          // Check for chart components
          if (item.type === 'cf-chart') {
            hasCharts.push({
              id: item.id,
              path: newAncestors,
              label: item.label || '(chart)',
              type: item.type,
            });
          }

          // Check for patient data field components
          if (item.type === 'cf-patient-data' || item.type === 'cf-patient-data-all') {
            hasPatientDataFields.push({
              id: item.id,
              path: newAncestors,
              label: item.label || '(patient data)',
              type: item.type,
            });
          }

          if (item.children && item.children.length > 0) {
            findChartsAndPatientData(item.children, newAncestors);
          }
        });
      };

      findChartsAndPatientData(droppedItems, []);

      // If there are charts but no patient data fields, add errors for each chart
      if (hasCharts.length > 0 && hasPatientDataFields.length === 0) {
        hasCharts.forEach((chart) => {
          pushChartWithoutPatientData(chart);
        });
      }
    }

    // Add duplicate key errors (only if key appears >1) - for questionnaire mode
    if (builderMode !== 'clinical') {
      Object.entries(keyUsage).forEach(([key, arr]) => {
        if (arr.length > 1) arr.forEach((ctx) => pushDuplicateKey(ctx, key));
      });
    }

    // Add duplicate code errors (only if code appears >1) - for clinical form mode
    if (builderMode === 'clinical') {
      Object.entries(codeUsage).forEach(([code, arr]) => {
        if (arr.length > 1) arr.forEach((ctx) => pushDuplicateCode(ctx, code));
      });
    }

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
          const isBlankCond = err.errorType === 'blank-condition-record';
          const isEmptyQuestion = err.errorType === 'empty-question';
          // Clinical form specific error types
          const isMissingCode = err.errorType === 'missing-code';
          const isDuplicateCode = err.errorType === 'duplicate-code';
          const isInvalidCode = err.errorType === 'invalid-code-format';
          const isEmptyCfOptions = err.errorType === 'empty-cf-options';
          const isEmptyCfContainer = err.errorType === 'empty-cf-container';
          const isChartWithoutPatientData = err.errorType === 'chart-without-patient-data';

          const isWarning =
            isEmptyQuestion || isEmptyCfOptions || isEmptyCfContainer; // classify warnings
          const wrapperClasses = isWarning
            ? 'border border-orange-200 bg-orange-50 text-orange-700'
            : 'border border-red-200 bg-red-50 text-red-700';
          return (
            <li
              key={err.id + '-' + err.errorType + '-' + idx}
              onClick={() => {
                if (onNavigateToItem) {
                  const isContainer = [
                    'page',
                    'group',
                    'table',
                    'cf-panel',
                    'cf-table-field',
                  ].includes(err.type);
                  onNavigateToItem(err.targetId || err.id, {
                    scrollToTop: isContainer,
                  });
                }
              }}
              className={`${wrapperClasses} rounded p-3 text-sm cursor-pointer hover:shadow transition-shadow`}
              title="Click to focus this item"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (onNavigateToItem) {
                    const isContainer = [
                      'page',
                      'group',
                      'table',
                      'cf-panel',
                      'cf-table-field',
                    ].includes(err.type);
                    onNavigateToItem(err.targetId || err.id, {
                      scrollToTop: isContainer,
                    });
                  }
                }
              }}
            >
              <span className="font-mono text-xs text-gray-700 block mb-1">
                {chain.join(' -> ')} : {isMissing && 'Key Missing'}
                {isDuplicate && `Duplicate Key (${err.key})`}
                {isInvalid && `Invalid Key (${err.key})`}
                {isMissingTitle && 'Missing Page Title'}
                {isEmptyTable && 'Empty Table (no fields)'}
                {isBlankCond && 'Blank Condition Record'}
                {isEmptyQuestion && 'Empty Question (no answers)'}
                {isMissingCode && 'Missing Code'}
                {isDuplicateCode && `Duplicate Code (${err.code})`}
                {isInvalidCode && `Invalid Code (${err.code})`}
                {isEmptyCfOptions && 'Empty Options'}
                {isEmptyCfContainer && 'Empty Container'}
                {isChartWithoutPatientData && 'Chart Requires Patient Data Field'}
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
              {isBlankCond && (
                <span className="text-red-700">
                  Each visibility condition must reference a record key. Enter
                  or remove this condition.
                </span>
              )}
              {isEmptyQuestion && (
                <span className="text-orange-700">
                  Add one or more answers or convert this to a Field if
                  free-text.
                </span>
              )}
              {isMissingCode && (
                <span className="text-red-700">
                  Provide a unique code for this clinical form component.
                </span>
              )}
              {isDuplicateCode && (
                <span className="text-red-700">
                  Change this code; it is also used on other components.
                </span>
              )}
              {isInvalidCode && (
                <span className="text-red-700">
                  Only numbers allowed. Remove letters, spaces, or other
                  symbols.
                </span>
              )}
              {isEmptyCfOptions && (
                <span className="text-orange-700">
                  Add one or more options or remove this component.
                </span>
              )}
              {isEmptyCfContainer && (
                <span className="text-orange-700">
                  Add child components or remove this empty container.
                </span>
              )}
              {isChartWithoutPatientData && (
                <span className="text-red-700">
                  Charts require at least one Patient Data field to display data. Add a Patient Data field component.
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
