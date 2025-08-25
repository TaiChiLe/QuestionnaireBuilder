const RemoveConfirmationModal = ({
  isOpen,
  itemToRemove,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !itemToRemove) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center z-[2200] bg-black/10">
      <div
        className="bg-white rounded-lg p-6 w-96 max-w-[90vw] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center mb-4">
          <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center mr-3 text-white font-bold text-xs">
            ×
          </div>
          <h3 className="m-0 text-gray-800">Confirm Remove</h3>
        </div>

        <p className="m-0 mb-5 text-gray-600 leading-relaxed">
          Are you sure you want to remove this item?
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 bg-gray-100 text-gray-800 border border-gray-300 rounded-md hover:bg-gray-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 bg-red-600 text-white border-0 rounded-md hover:bg-red-700 cursor-pointer font-semibold"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoveConfirmationModal;
