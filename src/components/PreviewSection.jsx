import { useState, useMemo, useRef, useEffect } from 'react';
import { buildAdvancedTextSummary } from './utils/xmlTextSummary';
import { buildClinicalFormTextSummary } from './utils/clinicalFormTextSummary';
import ErrorPreview from './ErrorPreview';

const PreviewSection = ({
  droppedItems,
  currentXmlString,
  currentHtmlString,
  builderMode,
  height,
  collapsed,
  onToggleCollapse,
  onXmlEdit, // New prop for handling XML edits
  onNavigateToItem, // navigate from errors list to canvas item
  isDarkMode,
}) => {
  const [previewMode, setPreviewMode] = useState('html');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedXml, setEditedXml] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  // Raw (unfiltered) XML specifically for Text summary bypass
  const [rawTextXml, setRawTextXml] = useState('');
  const fileInputRef = useRef(null);
  // Download state (optional simple flash)
  const [justDownloaded, setJustDownloaded] = useState(false);
  // Track if advanced features are enabled (reflected from EditModal's toggle)
  const [advancedEnabled, setAdvancedEnabled] = useState(() => {
    try {
      return localStorage.getItem('qb_show_advanced') === 'true';
    } catch (_) {
      return false;
    }
  });

  useEffect(() => {
    const handler = (e) => setAdvancedEnabled(!!e.detail);
    window.addEventListener('qb-advanced-toggle', handler);
    return () => window.removeEventListener('qb-advanced-toggle', handler);
  }, []);

  const handleRawXmlFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setRawTextXml(String(evt.target?.result || ''));
      // Clear the file input value so the same file can be uploaded again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  const effectiveTextXml = rawTextXml || currentXmlString;

  // Memoized advanced text summary so it isn't rebuilt on every re-render & can be copied easily
  const textSummary = useMemo(
    () =>
      builderMode === 'clinical'
        ? buildClinicalFormTextSummary(effectiveTextXml)
        : buildAdvancedTextSummary(effectiveTextXml),
    [effectiveTextXml, builderMode]
  );

  const handleDownloadTextSummary = () => {
    try {
      const blob = new Blob([textSummary], {
        type: 'text/plain;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download =
        builderMode === 'clinical'
          ? 'clinical-form-summary.txt'
          : 'questionnaire-summary.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setJustDownloaded(true);
      setTimeout(() => setJustDownloaded(false), 1500);
    } catch (e) {
      alert('Download failed');
    }
  };

  const handleUnlockEdit = () => {
    setEditedXml(currentXmlString);
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedXml('');
  };

  const handleSaveEdit = async () => {
    if (!editedXml.trim()) {
      alert('XML content cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      // Parse XML to validate it
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(editedXml, 'text/xml');

      // Check for parsing errors
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        throw new Error('Invalid XML format: ' + parserError.textContent);
      }

      // Check if it's a valid questionnaire structure
      const questionnaire = xmlDoc.querySelector('Questionnaire');
      if (!questionnaire) {
        throw new Error(
          'Invalid questionnaire XML: Missing Questionnaire root element'
        );
      }

      // Call the parent handler to update the data
      if (onXmlEdit) {
        await onXmlEdit(editedXml);
      }

      setIsEditMode(false);
      setEditedXml('');
    } catch (error) {
      alert(`Error saving XML: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className={`${
        isDarkMode
          ? 'border-gray-700 bg-[#b91c1c]'
          : 'border-gray-300 bg-[#f03741]'
      } border-t flex flex-col transition-[height] duration-150 ease-in-out select-none ${
        collapsed ? 'overflow-hidden' : ''
      }`}
      style={{ height: collapsed ? 36 : height }}
    >
      {/* Preview Header */}
      <div
        className={`px-3 py-1.5 ${
          isDarkMode
            ? 'border-gray-700 bg-[#b91c1c]'
            : 'border-gray-300 bg-[#f03741]'
        } border-b flex justify-between items-center h-11`}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`w-6 h-6 flex items-center justify-center rounded ${
              isDarkMode
                ? 'bg-white/30 hover:bg-white/40'
                : 'bg-white/20 hover:bg-white/30'
            } text-white text-xs font-semibold`}
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
            {['text', 'xml', 'html', 'errors'].map((mode) => (
              <button
                key={mode}
                onClick={() => setPreviewMode(mode)}
                className={`px-3 py-1.5 border ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-300'
                } rounded cursor-pointer text-sm ${
                  previewMode === mode
                    ? isDarkMode
                      ? 'bg-gray-600 text-white'
                      : 'bg-gray-400 text-white'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'bg-white text-gray-700'
                }`}
              >
                {mode === 'xml'
                  ? 'XML'
                  : mode === 'html'
                  ? 'HTML'
                  : mode === 'text'
                  ? 'TXT'
                  : 'Errors'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Preview Content */}
      {!collapsed && (
        <div
          className={`flex-1 p-4 overflow-auto ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          {droppedItems.length === 0 && previewMode !== 'text' ? (
            <p
              className={`text-center ${
                isDarkMode ? 'text-gray-400' : 'text-gray-400'
              } italic my-10`}
            >
              Add components above to see the preview
            </p>
          ) : (
            <>
              {previewMode === 'xml' && droppedItems.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4
                      className={`m-0 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      Generated XML
                    </h4>
                    {isEditMode ? (
                      <div className="flex gap-2">
                        <button
                          onClick={handleCancelEdit}
                          disabled={isSaving}
                          className="px-3 py-1.5 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          disabled={isSaving || !editedXml.trim()}
                          className="px-3 py-1.5 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {isSaving ? (
                            <>
                              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              Save Changes
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      droppedItems.length > 0 &&
                      advancedEnabled &&
                      builderMode === 'questionnaire' && (
                        <button
                          onClick={handleUnlockEdit}
                          className="px-3 py-1.5 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors flex items-center gap-2"
                          title="Edit XML directly (advanced feature)"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                          Unlock to Edit
                        </button>
                      )
                    )}
                  </div>

                  {isEditMode ? (
                    <textarea
                      value={editedXml}
                      onChange={(e) => setEditedXml(e.target.value)}
                      className={`w-full h-96 p-3 border rounded font-mono text-xs leading-relaxed resize-none focus:outline-none focus:ring-2 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-500'
                          : 'border-gray-300 focus:ring-blue-400'
                      }`}
                      placeholder="Edit XML content here..."
                    />
                  ) : (
                    <pre
                      className={`border rounded p-3 text-xs leading-relaxed overflow-auto m-0 whitespace-pre-wrap ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-100'
                          : 'bg-gray-100 border-gray-300'
                      }`}
                    >
                      {currentXmlString}
                    </pre>
                  )}
                </div>
              )}

              {previewMode === 'html' && droppedItems.length > 0 && (
                <div>
                  <h4
                    className={`m-0 mb-3 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    HTML Preview
                  </h4>
                  <div
                    className="bg-white border border-gray-300 rounded p-5 text-sm leading-relaxed overflow-auto m-0 font-sans text-black"
                    style={{ color: '#000000' }}
                    dangerouslySetInnerHTML={{ __html: currentHtmlString }}
                  />
                </div>
              )}
              {previewMode === 'text' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4
                      className={`m-0 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      <b>
                        Note: You will have to upload here for Advanced
                        {builderMode === 'clinical'
                          ? ' Clinical Forms'
                          : ' Questionnaires'}
                        .
                      </b>
                    </h4>
                    <div className="flex gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xml,application/xml,text/xml"
                        className="hidden"
                        onChange={handleRawXmlFile}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`px-2.5 py-1 text-xs border rounded transition-colors ${
                          isDarkMode
                            ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'border-gray-300 bg-white hover:bg-gray-100'
                        }`}
                        title="Upload external questionnaire XML to bypass internal parser"
                      >
                        Upload XML
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadTextSummary}
                        className={`px-2.5 py-1 text-xs border rounded transition-colors ${
                          justDownloaded
                            ? 'bg-[#f03741] text-white'
                            : isDarkMode
                            ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'border-gray-300 bg-white hover:bg-gray-100'
                        }`}
                        title="Download text summary as file"
                      >
                        {justDownloaded ? 'Saved' : 'Download'}
                      </button>
                      {rawTextXml && (
                        <button
                          type="button"
                          onClick={() => setRawTextXml('')}
                          className={`px-2.5 py-1 text-xs border rounded transition-colors ${
                            isDarkMode
                              ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'border-gray-300 bg-white hover:bg-gray-100'
                          }`}
                          title="Clear uploaded XML and revert to generated XML"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                  <pre
                    className={`border rounded p-3 text-xs leading-relaxed overflow-auto m-0 whitespace-pre-wrap ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-100'
                        : 'bg-gray-100 border-gray-300'
                    }`}
                  >
                    {textSummary}
                  </pre>
                </div>
              )}
              {previewMode === 'errors' && droppedItems.length > 0 && (
                <div>
                  <h4
                    className={`m-0 mb-3 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    Error Check: Click To Move To Error
                  </h4>
                  <ErrorPreview
                    droppedItems={droppedItems}
                    onNavigateToItem={onNavigateToItem}
                    builderMode={builderMode}
                    isDarkMode={isDarkMode}
                  />
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
