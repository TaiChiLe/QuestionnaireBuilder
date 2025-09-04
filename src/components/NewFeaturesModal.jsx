import React from 'react';

const NewFeaturesModal = ({ isOpen, onClose, isDarkMode = false }) => {
  if (!isOpen) return null;

  const handleClose = () => {
    try {
      localStorage.setItem('qb_seen_new_features_v1', 'true');
    } catch {
      // Ignore localStorage errors
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className={`${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto`}
      >
        <div className="flex justify-between items-start mb-6">
          <h2
            className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            🎉 New Features Available!
          </h2>
          <button
            onClick={handleClose}
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

        <div className="space-y-6">
          {/* Clinical Form Builder Feature */}
          <div
            className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-700' : 'bg-purple-50'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
              <h3
                className={`text-xl font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                🏥 Clinical Form Builder (NEW!)
              </h3>
            </div>
            <ul
              className={`space-y-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>
                  <strong>Complete Clinical Form Builder:</strong> Build
                  clinical forms with specialized components and validation
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>
                  <strong>Dual Mode Interface:</strong> Switch between Standard
                  Questionnaire and Clinical Form builders by clicking on the
                  title on the top left. You can upload any type and it will
                  automatically switch builders.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>
                  <strong>Clinical-Specific Components:</strong> Patient data
                  fields, charts, and more
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>
                  <strong>XML Generation & Parsing:</strong> Full support for
                  clinical form XML import/export
                </span>
              </li>
            </ul>
          </div>

          {/* Chart Components Feature */}
          <div
            className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-700' : 'bg-blue-50'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H9z"
                  />
                </svg>
              </div>
              <h3
                className={`text-xl font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                📊 Chart Components (Clinical Forms)
              </h3>
            </div>
            <ul
              className={`space-y-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>
                  <strong>4 Chart Types:</strong> Gauge, Stack, Line, and Bar
                  charts for data visualization
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>
                  <strong>Chart Meta Fields:</strong> Define data sources for
                  your charts
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>
                  <strong>Chart Definition Generator:</strong> Generate chart
                  definition XML for implementation
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>
                  <strong>Auto History Detection:</strong> Patient data fields
                  automatically get history="true" when linked to Line/Bar
                  charts
                </span>
              </li>
            </ul>

            {/* Notes section for Chart Components */}
            <div
              className={`mt-4 p-3 rounded-lg border-l-4 border-blue-500 ${
                isDarkMode ? 'bg-gray-600' : 'bg-blue-25'
              }`}
            >
              <h4
                className={`font-semibold mb-2 ${
                  isDarkMode ? 'text-blue-300' : 'text-blue-700'
                }`}
              >
                📝 Notes:
              </h4>
              <ul
                className={`space-y-1 text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                <li>
                  • You will need a patient data field and a chart item for it
                  to work properly.
                </li>
                <li>
                  • You will then need to copy the chart definition and create a
                  new chart definition with the same name as the title of the
                  chart name.
                </li>
              </ul>
            </div>
          </div>

          {/* Enhanced Clinical Forms */}
          <div
            className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-700' : 'bg-green-50'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3
                className={`text-xl font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                📋 Enhanced Clinical Forms
              </h3>
            </div>
            <ul
              className={`space-y-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>
                  <strong>Improved XML Parsing:</strong> Better support for
                  complex clinical form structures
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>
                  <strong>Enhanced Validation:</strong> More accurate
                  drag-and-drop validation
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>
                  <strong>Smart Filename Management:</strong> Filenames reset
                  when switching between builders
                </span>
              </li>
            </ul>
          </div>

          {/* Getting Started */}
          <div
            className={`p-4 rounded-lg border-2 border-dashed ${
              isDarkMode
                ? 'border-gray-600 bg-gray-700'
                : 'border-gray-300 bg-gray-50'
            }`}
          >
            <h3
              className={`text-lg font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              🚀 Getting Started
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Try the new Chart components in{' '}
              <strong>Clinical Form Builder</strong> mode! You can switch
              between builders using the toggle in the top left 'Concept -
              Questionnaire XML Builder'.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            No!, don't give me new features
          </button>
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewFeaturesModal;
