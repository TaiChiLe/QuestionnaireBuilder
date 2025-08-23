// This is a simple table component that integrates with the existing DroppableItem system
// The table functionality is handled by DroppableItem, this file exists for potential future table-specific logic

const Table = {
  // Table-specific utilities can go here if needed in the future
  defaultColumns: [
    { header: 'Column 1', dataType: 'Text Box', required: false },
  ],

  createNewTable: () => ({
    id: `table-${Date.now()}`,
    type: 'table',
    label: 'New Table',
    children: [],
    keyField: '',
    required: false,
    columns: [{ header: 'Column 1', dataType: 'Text Box', required: false }],
  }),
};

export default Table;
