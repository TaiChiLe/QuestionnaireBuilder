import { useState } from 'react';
import ErrorPreview from './ErrorPreview';

const PreviewSection = ({
  droppedItems,
  currentXmlString,
  currentHtmlString,
  height,
  collapsed,
  onToggleCollapse,
}) => {
  const [previewMode, setPreviewMode] = useState('html');

  return (
    <div
      className={`border-t border-gray-300 bg-[#f03741] flex flex-col transition-[height] duration-150 ease-in-out select-none ${
        collapsed ? 'overflow-hidden' : ''
      }`}
      style={{ height: collapsed ? 36 : height }}
    >
      {/* Preview Header */}
      <div className="px-3 py-1.5 border-b border-gray-300 bg-[#f03741] flex justify-between items-center h-11">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="w-6 h-6 flex items-center justify-center rounded bg-white/20 hover:bg-white/30 text-white text-xs font-semibold"
            title={collapsed ? 'Expand preview' : 'Collapse preview'}
          >
            {collapsed ? '▴' : '▾'}
          </button>
          <h3 className="m-0 text-sm font-medium text-white tracking-wide">
            Preview
          </h3>
        </div>
        {!collapsed && (
          <div className="flex gap-2">
            {['structure', 'xml', 'html', 'errors'].map((mode) => (
              <button
                key={mode}
                onClick={() => setPreviewMode(mode)}
                className={`px-3 py-1.5 border border-gray-300 rounded cursor-pointer text-sm ${
                  previewMode === mode
                    ? 'bg-gray-400 text-white'
                    : 'bg-white text-gray-700'
                }`}
              >
                {mode === 'structure'
                  ? 'Structure'
                  : mode === 'xml'
                  ? 'XML'
                  : mode === 'html'
                  ? 'HTML'
                  : 'Errors'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Preview Content */}
      {!collapsed && (
        <div className="flex-1 p-4 overflow-auto bg-white">
          {droppedItems.length === 0 ? (
            <p className="text-center text-gray-400 italic my-10">
              Add components above to see the preview
            </p>
          ) : (
            <>
              {previewMode === 'structure' && (
                <div>
                  <h4 className="m-0 mb-3 text-gray-600">Structure Overview</h4>
                  <div className="font-mono text-sm leading-relaxed text-gray-700">
                    {droppedItems.map((item) => (
                      <div key={item.id} className="mb-2">
                        <strong>{item.type}</strong>: {item.label}
                        {item.children && item.children.length > 0 && (
                          <div className="ml-5 mt-1">
                            {item.children.map((child) => (
                              <div key={child.id} className="mb-1">
                                ↳ <strong>{child.type}</strong>: {child.label}
                                {child.children &&
                                  child.children.length > 0 && (
                                    <div className="ml-5 mt-0.5">
                                      {child.children.map((grandchild) => (
                                        <div
                                          key={grandchild.id}
                                          className="mb-0.5"
                                        >
                                          ↳ <strong>{grandchild.type}</strong>:{' '}
                                          {grandchild.label}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {previewMode === 'xml' && (
                <div>
                  <h4 className="m-0 mb-3 text-gray-600">Generated XML</h4>
                  <pre className="bg-gray-100 border border-gray-300 rounded p-3 text-xs leading-relaxed overflow-auto m-0 whitespace-pre-wrap">
                    {currentXmlString}
                  </pre>
                </div>
              )}

              {previewMode === 'html' && (
                <div>
                  <h4 className="m-0 mb-3 text-gray-600">HTML Preview</h4>
                  <div
                    className="bg-white border border-gray-300 rounded p-5 text-sm leading-relaxed overflow-auto m-0 font-sans"
                    dangerouslySetInnerHTML={{ __html: currentHtmlString }}
                  />
                </div>
              )}
              {previewMode === 'errors' && (
                <div>
                  <h4 className="m-0 mb-3 text-gray-600">Error Check</h4>
                  <ErrorPreview droppedItems={droppedItems} />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PreviewSection;
