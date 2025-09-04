/**
 * Chart Definition Modal Component
 *
 * Displays the XML chart definition that users can copy for their charts.
 * This modal shows the generated chart definition XML based on the chart's
 * configuration including chart type and meta fields.
 */

import { useState, useRef } from 'react';
import { generateChartDefinitionXML } from './utils/chartDefinitionGenerator';

const ChartDefinitionModal = ({ isOpen, onClose, chartItem, isDarkMode }) => {
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef(null);

  if (!isOpen) return null;

  // Generate the chart definition XML
  const chartDefinitionXML = generateChartDefinitionXML(chartItem);

  const handleCopy = async () => {
    if (textareaRef.current) {
      try {
        await navigator.clipboard.writeText(chartDefinitionXML);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        // Fallback for older browsers
        textareaRef.current.select();
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleSelectAll = () => {
    if (textareaRef.current) {
      textareaRef.current.select();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/10 flex items-center justify-center p-4 z-50">
      <div
        className={`w-full max-w-4xl max-h-[90vh] rounded-lg shadow-xl ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <h2
              className={`text-xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Chart Definition - {chartItem?.label || 'Chart'}
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-md transition-colors ${
                isDarkMode
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
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
          <p
            className={`text-sm mt-2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Copy the chart definition XML below to use in your chart
            implementation.
          </p>
          <p
            className={`text-sm mt-2 ${
              isDarkMode ? 'text-red-400' : 'text-red-600'
            }`}
          >
            <strong>Note:</strong> When saving the Chart Definition, the
            definition name must be identical to Chart Name:{' '}
            <strong>{chartItem?.label}</strong>.
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-4 flex-1 overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center space-x-2">
              <span
                className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Chart Type: {chartItem?.chartType || 'Gauge'}
              </span>
              <span
                className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                • Meta Fields: {chartItem?.chartMetaFields?.length || 0}
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleSelectAll}
                className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Select All
              </button>
              <button
                onClick={handleCopy}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  copied
                    ? isDarkMode
                      ? 'bg-green-700 text-green-200'
                      : 'bg-green-100 text-green-700'
                    : isDarkMode
                    ? 'bg-blue-700 text-blue-200 hover:bg-blue-600'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                {copied ? 'Copied!' : 'Copy XML'}
              </button>
            </div>
          </div>

          <div className="relative">
            <textarea
              ref={textareaRef}
              value={chartDefinitionXML}
              readOnly
              className={`w-full h-96 p-4 font-mono text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode
                  ? 'bg-gray-900 border-gray-600 text-gray-100'
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              }`}
              spellCheck={false}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-4 border-t ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-md transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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

export default ChartDefinitionModal;
