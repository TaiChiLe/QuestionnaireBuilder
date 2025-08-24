import { useState } from 'react';
import ErrorPreview from './ErrorPreview';

const PreviewSection = ({
  droppedItems,
  currentXmlString,
  currentHtmlString,
}) => {
  const [previewMode, setPreviewMode] = useState('structure');

  return (
    <div
      className="border-t border-gray-300 bg-[#f03741] flex flex-col"
      style={{ height: 'calc(50vh)' }}
    >
      {/* Preview Header */}
      <div className="px-4 py-3 border-b border-gray-300 bg-[#f03741] flex justify-between items-center">
        <h3 className="m-0 text-lg text-white">Preview</h3>
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
      </div>

      {/* Preview Content */}
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
                  {droppedItems.map((item, index) => (
                    <div key={item.id} className="mb-2">
                      <strong>{item.type}</strong>: {item.label}
                      {item.children && item.children.length > 0 && (
                        <div className="ml-5 mt-1">
                          {item.children.map((child) => (
                            <div key={child.id} className="mb-1">
                              ↳ <strong>{child.type}</strong>: {child.label}
                              {child.children && child.children.length > 0 && (
                                <div className="ml-5 mt-0.5">
                                  {child.children.map((grandchild) => (
                                    <div key={grandchild.id} className="mb-0.5">
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
    </div>
  );
};

export default PreviewSection;
