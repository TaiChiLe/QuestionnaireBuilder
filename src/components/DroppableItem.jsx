import { useDraggable, useDroppable } from '@dnd-kit/core';
import { useState, useEffect } from 'react';

function DroppableItem({
  item,
  onRemove,
  onEdit,
  children,
  isCollapsed,
  onToggleCollapse,
  parentType = 'root',
  isSelected = false,
  onSelect,
  expandedAnswerIds,
  isDarkMode,
}) {
  // Draggable (suppress keyboard activators later)
  const {
    attributes,
    listeners,
    setNodeRef: dragRef,
    transform,
    isDragging,
  } = useDraggable({ id: item.id });
  const { setNodeRef: dropRef, isOver } = useDroppable({ id: item.id });
  // We'll only apply drag listeners to the dedicated handle button

  const transformStyle = transform
    ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
    : undefined;

  // Local toggle state for showing question answers
  const [showAnswers, setShowAnswers] = useState(false);
  // Keep local state in sync if central set changes externally (only for questions)
  // Clinical form components use purely local state
  useEffect(() => {
    // Sync showAnswers with expandedAnswerIds for expandable components
    if (
      item.type === 'question' ||
      ((item.type === 'cf-listbox' || item.type === 'cf-radio') &&
        item.options &&
        item.options.length > 0)
    ) {
      const shouldBeOpen = expandedAnswerIds?.has(item.id) || false;
      setShowAnswers(shouldBeOpen);
    }
  }, [expandedAnswerIds, item]);

  return (
    <div
      ref={(node) => {
        dragRef(node);
        dropRef(node);
      }}
      data-item-id={item.id}
      className={`group my-1.5 p-2.5 rounded cursor-default select-none relative w-full text-sm
        ${
          isOver
            ? isDarkMode
              ? 'border-2 border-green-400 bg-green-900/20'
              : 'border-2 border-green-500 bg-green-50'
            : `border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} ${
                parentType === 'page' && item.type !== 'page'
                  ? isDarkMode
                    ? 'bg-gray-700'
                    : 'bg-gray-50'
                  : isDarkMode
                  ? 'bg-gray-800'
                  : 'bg-gray-100'
              }`
        }
        ${
          isDragging
            ? isDarkMode
              ? 'opacity-30 bg-blue-900/20'
              : 'opacity-30 bg-blue-50'
            : ''
        }
        ${!isDragging ? 'transition-all duration-200' : ''}
        ${isDragging ? 'z-[1000]' : 'z-[1]'}
  ${isSelected && !isDragging ? 'outline outline-blue-400' : ''}
      `}
      style={{ transform: transformStyle }}
      tabIndex={-1}
      role="presentation"
      onClick={(e) => {
        e.stopPropagation();
        onSelect && onSelect(e, item);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (
          onEdit &&
          (item.type === 'question' ||
            item.type === 'page' ||
            item.type === 'field' ||
            item.type === 'information' ||
            item.type === 'table' ||
            item.type === 'table-field' ||
            // Clinical Form components
            item.type === 'cf-button' ||
            item.type === 'cf-chart' ||
            item.type === 'cf-checkbox' ||
            item.type === 'cf-date' ||
            item.type === 'cf-future-date' ||
            item.type === 'cf-group' ||
            item.type === 'cf-info' ||
            item.type === 'cf-listbox' ||
            item.type === 'cf-notes' ||
            item.type === 'cf-notes-history' ||
            item.type === 'cf-panel' ||
            item.type === 'cf-patient-data' ||
            item.type === 'cf-patient-data-all' ||
            item.type === 'cf-prescription' ||
            item.type === 'cf-provided-services' ||
            item.type === 'cf-radio' ||
            item.type === 'cf-snom-textbox' ||
            item.type === 'cf-table' ||
            item.type === 'cf-table-field' ||
            item.type === 'cf-textbox')
        ) {
          onEdit(item.id);
        }
      }}
    >
      <div
        className={`flex justify-between items-center rounded-md -m-1.5 p-1.5 border border-transparent ${
          isDarkMode ? 'hover:border-blue-500' : 'hover:border-blue-400'
        } hover:shadow-sm transition-colors`}
      >
        <span className="font-bold flex items-center flex-1 min-w-0 gap-1">
          {/* Fixed-width control column (drag handle + optional collapse) */}
          <span className="flex items-center gap-1 w-14 shrink-0">
            <button
              type="button"
              className={`w-6 h-6 flex items-center justify-center rounded border text-xs font-semibold cursor-grab active:cursor-grabbing transition-colors ${
                isDragging
                  ? isDarkMode
                    ? 'bg-gray-600'
                    : 'bg-gray-300'
                  : isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 border-gray-600'
                  : 'bg-white hover:bg-gray-100'
              }`}
              aria-label="Drag item"
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
              }}
              {...listeners}
              {...attributes}
            >
              <svg
                className={`w-3 h-3 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <circle cx="5" cy="5" r="1.5" />
                <circle cx="10" cy="5" r="1.5" />
                <circle cx="15" cy="5" r="1.5" />
                <circle cx="5" cy="10" r="1.5" />
                <circle cx="10" cy="10" r="1.5" />
                <circle cx="15" cy="10" r="1.5" />
              </svg>
            </button>
            {item.type === 'page' ||
            item.type === 'cf-group' ||
            item.type === 'cf-panel' ||
            item.type === 'cf-table' ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleCollapse && onToggleCollapse();
                }}
                className={`w-6 h-6 flex items-center justify-center rounded border text-xs font-semibold transition-colors cursor-pointer ${
                  isCollapsed
                    ? isDarkMode
                      ? 'bg-gray-600 hover:bg-gray-500 border-gray-600'
                      : 'bg-gray-200 hover:bg-gray-300'
                    : isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 border-gray-600'
                    : 'bg-white hover:bg-gray-100'
                }`}
                title={
                  isCollapsed
                    ? `Expand ${
                        item.type === 'page'
                          ? 'Page'
                          : item.type === 'cf-group'
                          ? 'Group'
                          : item.type === 'cf-panel'
                          ? 'Panel'
                          : 'Table'
                      }`
                    : `Collapse ${
                        item.type === 'page'
                          ? 'Page'
                          : item.type === 'cf-group'
                          ? 'Group'
                          : item.type === 'cf-panel'
                          ? 'Panel'
                          : 'Table'
                      }`
                }
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {isCollapsed ? '+' : '−'}
              </button>
            ) : (
              // Placeholder to keep labels aligned when no collapse button
              <span className="w-6 h-6" />
            )}
          </span>
          {item.conditions && item.conditions.length > 0 && (
            //Visibility Icon
            <svg
              className={`w-4 h-4 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              } mr-2 inline flex-shrink-0`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fillRule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
          <span className="min-w-0">
            {item.type === 'page' ? item.title || 'Page' : item.label}
          </span>
          {(item.required || item.cfrequired) && (
            <span className="text-red-500 ml-1" title="Required">
              *
            </span>
          )}
          {(item.type === 'question' || item.type === 'field') &&
            item.dataType && (
              <span
                className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                } ml-2 font-normal mr-2`}
              >
                [{item.dataType}]
              </span>
            )}
          {((item.type === 'question' &&
            item.answers &&
            item.answers.length > 0) ||
            ((item.type === 'cf-listbox' || item.type === 'cf-radio') &&
              item.options &&
              item.options.length > 0)) && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Toggle locally and rely on parent to update central set through a callback (future enhancement)
                  setShowAnswers((s) => !s);
                }}
                className={`ml-1 w-6 h-6 flex items-center justify-center rounded border ${
                  isDarkMode
                    ? 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                    : 'border-gray-300 bg-white hover:bg-gray-100'
                } cursor-pointer`}
                title={showAnswers ? 'Hide Answers' : 'Show Answers'}
                aria-expanded={showAnswers}
              >
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-150 ${
                    showAnswers ? 'rotate-90' : ''
                  }`}
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="#f03741"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M7 4l6 6-6 6" />
                </svg>
              </button>
            </>
          )}
          {item.type === 'table' && (
            <span
              className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              } ml-2 font-normal mr-2`}
            >
              [Table]
            </span>
          )}
          {/* Clinical Form component data types */}
          {item.type === 'cf-button' && (
            <span
              className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              } ml-2 font-normal mr-2`}
            >
              [Button]
            </span>
          )}
          {item.type === 'cf-checkbox' && (
            <span
              className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              } ml-2 font-normal mr-2`}
            >
              [Checkbox]
            </span>
          )}
          {item.type === 'cf-date' && (
            <span
              className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              } ml-2 font-normal mr-2`}
            >
              [Date]
            </span>
          )}
          {item.type === 'cf-future-date' && (
            <span
              className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              } ml-2 font-normal mr-2`}
            >
              [Future Date]
            </span>
          )}
          {item.type === 'cf-group' && (
            <span
              className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              } ml-2 font-normal mr-2`}
            >
              [Group]
            </span>
          )}
          {item.type === 'cf-chart' && (
            <span
              className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              } ml-2 font-normal mr-2`}
            >
              [Chart]
            </span>
          )}
          {item.type === 'cf-info' && (
            <span
              className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              } ml-2 font-normal mr-2`}
            >
              [Info]
            </span>
          )}
          {item.type === 'cf-listbox' && (
            <span
              className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              } ml-2 font-normal mr-2`}
            >
              [Listbox]
            </span>
          )}
          {item.type === 'cf-notes' && (
            <span
              className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              } ml-2 font-normal mr-2`}
            >
              [Notes]
            </span>
          )}
          {item.type === 'cf-notes-history' && (
            <span
              className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              } ml-2 font-normal mr-2`}
            >
              [Notes History]
            </span>
          )}
          {item.type === 'cf-panel' && (
            <>
              <span className="font-bold">Panel</span>
              <span
                className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                } ml-2 font-normal mr-2`}
              >
                [Panel]
              </span>
            </>
          )}
          {item.type === 'cf-patient-data' && (
            <span
              className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              } ml-2 font-normal mr-2`}
            >
              [Patient Data]
            </span>
          )}
          {item.type === 'cf-patient-data-all' && (
            <>
              <span className="font-bold">Patient Data All</span>
              <span
                className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                } ml-2 font-normal mr-2`}
              >
                [Patient Data All]
              </span>
            </>
          )}
          {item.type === 'cf-prescription' && (
            <>
              <span className="font-bold">Prescription</span>
              <span
                className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                } ml-2 font-normal mr-2`}
              >
                [Prescription]
              </span>
            </>
          )}
          {item.type === 'cf-provided-services' && (
            <>
              <span className="font-bold">Provided Services</span>
              <span
                className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                } ml-2 font-normal mr-2`}
              >
                [Provided Services]
              </span>
            </>
          )}
          {item.type === 'cf-radio' && (
            <span
              className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              } ml-2 font-normal mr-2`}
            >
              [Radio]
            </span>
          )}
          {item.type === 'cf-snom-textbox' && (
            <span
              className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              } ml-2 font-normal mr-2`}
            >
              [SNOM Textbox]
            </span>
          )}
          {item.type === 'cf-table' && (
            <span
              className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              } ml-2 font-normal mr-2`}
            >
              [Table]
            </span>
          )}
          {item.type === 'cf-table-field' && (
            <span
              className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              } ml-2 font-normal mr-2`}
            >
              [{item.dataType ? item.dataType : 'CF Table Field'}]
            </span>
          )}
          {item.type === 'cf-textbox' && (
            <span
              className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              } ml-2 font-normal mr-2`}
            >
              [Textbox]
            </span>
          )}
          {/* Questionnaire component data types */}
          {item.type === 'information' && (
            <span
              className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              } ml-2 font-normal mr-2`}
            >
              [info]
            </span>
          )}
          {item.type === 'table-field' && item.dataType && (
            <span
              className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              } ml-2 font-normal mr-2`}
            >
              [{item.dataType.toLowerCase()}]
            </span>
          )}
        </span>
        <div className="flex gap-1">
          {onEdit && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (
                  item.type === 'question' ||
                  item.type === 'page' ||
                  item.type === 'field' ||
                  item.type === 'information' ||
                  item.type === 'table' ||
                  item.type === 'table-field' ||
                  // Clinical Form components
                  item.type === 'cf-button' ||
                  item.type === 'cf-chart' ||
                  item.type === 'cf-checkbox' ||
                  item.type === 'cf-date' ||
                  item.type === 'cf-future-date' ||
                  item.type === 'cf-group' ||
                  item.type === 'cf-info' ||
                  item.type === 'cf-listbox' ||
                  item.type === 'cf-notes' ||
                  item.type === 'cf-notes-history' ||
                  item.type === 'cf-panel' ||
                  item.type === 'cf-patient-data' ||
                  item.type === 'cf-patient-data-all' ||
                  item.type === 'cf-prescription' ||
                  item.type === 'cf-provided-services' ||
                  item.type === 'cf-radio' ||
                  item.type === 'cf-snom-textbox' ||
                  item.type === 'cf-table' ||
                  item.type === 'cf-table-field' ||
                  item.type === 'cf-textbox'
                ) {
                  onEdit(item.id);
                }
              }}
              className={`px-4 py-3 ${
                isDarkMode
                  ? 'bg-blue-900/50 text-blue-300 border-blue-600 hover:bg-blue-800/50'
                  : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
              } border rounded text-xs font-bold relative z-10 cursor-pointer`}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              Edit
            </button>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove(item.id);
            }}
            className={`px-4 py-3 ${
              isDarkMode
                ? 'bg-red-900/50 text-red-300 border-red-600 hover:bg-red-800/50'
                : 'bg-red-50 text-[#f03741] border-red-200 hover:bg-red-100'
            } border rounded text-xs font-bold relative z-10 cursor-pointer`}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            Remove
          </button>
        </div>
      </div>
      {showAnswers &&
        ((item.type === 'question' &&
          item.answers &&
          item.answers.length > 0) ||
          ((item.type === 'cf-listbox' || item.type === 'cf-radio') &&
            item.options &&
            item.options.length > 0)) && (
          <div
            className={`mt-2 ml-14 mb-1 p-2 ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600'
                : 'bg-white border-gray-200'
            } border rounded shadow-inner`}
          >
            <div
              className={`text-xs font-semibold ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              } mb-1`}
            >
              {item.type === 'question'
                ? `Answers (${item.answers?.length || 0})`
                : `Options (${item.options?.length || 0})`}
            </div>
            <ul className="list-disc ml-4 space-y-0.5">
              {item.type === 'question'
                ? item.answers?.map((ans) => (
                    <li
                      key={ans.id}
                      className={`text-xs ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      } break-all`}
                    >
                      {ans.text || '(empty)'}
                    </li>
                  ))
                : item.options?.map((opt) => (
                    <li
                      key={opt.id}
                      className={`text-xs ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      } break-all`}
                    >
                      {opt.text || '(empty)'}
                      {opt.value && opt.value !== opt.text && (
                        <span
                          className={`${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          } ml-1`}
                        >
                          [code: {opt.value}]
                        </span>
                      )}
                    </li>
                  ))}
            </ul>
          </div>
        )}
      {!isCollapsed && children && (
        <div
          className={`mt-2.5 pl-5 border-l-2 border-dashed ${
            isDarkMode ? 'border-gray-600' : 'border-gray-300'
          }`}
        >
          {children}
        </div>
      )}
      {item.type === 'page' && !isCollapsed && <div className="h-16 w-full" />}
      {item.type === 'cf-group' && !isCollapsed && (
        <div className="h-16 w-full" />
      )}
      {item.type === 'cf-panel' && !isCollapsed && (
        <div className="h-16 w-full" />
      )}
      {item.type === 'cf-table' && !isCollapsed && (
        <div className="h-16 w-full" />
      )}
      {item.type === 'table' && <div className="h-16 w-full" />}
    </div>
  );
}

export default DroppableItem;
