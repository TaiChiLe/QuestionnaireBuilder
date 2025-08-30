const WarningModal = ({ isOpen, message, onClose, isDarkMode }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex justify-center items-center z-[2100] bg-black/10"
      onClick={onClose}
    >
      <div
        className={`${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } rounded-lg p-6 w-96 max-w-[90vw] shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center mb-4">
          <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center mr-3 text-white font-bold text-sm">
            !
          </div>
          <h3
            className={`m-0 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}
          >
            Warning
          </h3>
        </div>

        <p
          className={`m-0 mb-5 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          } leading-relaxed`}
        >
          {message}
        </p>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-blue-600 text-white border-0 rounded-md hover:bg-blue-700 cursor-pointer font-semibold"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default WarningModal;
