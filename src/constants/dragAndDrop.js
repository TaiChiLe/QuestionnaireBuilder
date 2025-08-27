export const SIDEBAR_ITEMS = [
    'form-tag',
    'section-tag',
    'field-tag',
    'information-tag',
    'table-tag',
    'table-field-tag',
    // Basic components
    'list-box-tag',
    'multi-select-tag',
    'radio-buttons-tag',
    'text-box-tag',
    'notes-tag',
    'date-tag',
];

export const DRAG_TYPES = {
    'form-tag': 'page',
    'section-tag': 'question',
    'field-tag': 'field',
    'information-tag': 'information',
    'table-tag': 'table',
    'table-field-tag': 'table-field',
    // Basic Question components
    'list-box-tag': 'question',
    'multi-select-tag': 'question',
    'radio-buttons-tag': 'question',
    // Basic Field components
    'text-box-tag': 'field',
    'notes-tag': 'field',
    'date-tag': 'field',
};

export const VALIDATION_RULES = {
    root: ['page'],
    page: ['question', 'field', 'information', 'table'],
    question: [], // Questions should not contain other items - they have their own answers
    field: [],
    information: [],
    table: ['table-field'],
    'table-field': [],
};

export const DEFAULT_ITEMS = {
    page: {
        type: 'page',
        label: 'Page',
        children: [],
    },
    question: {
        type: 'question',
        label: 'Question',
        children: [],
        dataType: 'List Box',
        textRecord: '',
        keyField: '',
        required: false,
        answers: [{ text: 'Option 1' }],
    },
    field: {
        type: 'field',
        label: 'Field',
        children: [],
        dataType: 'Text Box',
        keyField: '',
        required: false,
    },
    information: {
        type: 'information',
        label: 'New Information',
        children: [],
    },
    table: {
        type: 'table',
        label: 'New Table',
        children: [],
        keyField: '',
        required: false,
        columns: [
            { header: 'Column 1', dataType: 'Text Box', required: false },
        ],
    },
    'table-field': {
        type: 'table-field',
        label: 'New Table Field',
        children: [],
        dataType: 'Text Box',
        required: false,
    },
};

export const COMPONENT_SPECIFIC_ITEMS = {
    'list-box-tag': {
        type: 'question',
        label: 'List Box',
        children: [],
        dataType: 'List Box',
        textRecord: '',
        keyField: '',
        required: false,
        answers: [{ text: 'Option 1' }],
    },
    'multi-select-tag': {
        type: 'question',
        label: 'Multi Select',
        children: [],
        dataType: 'Multi Select',
        textRecord: '',
        keyField: '',
        required: false,
        answers: [{ text: 'Option 1' }],
    },
    'radio-buttons-tag': {
        type: 'question',
        label: 'Radio Buttons',
        children: [],
        dataType: 'Radio Buttons',
        textRecord: '',
        keyField: '',
        required: false,
        answers: [{ text: 'Option 1' }],
    },
    'text-box-tag': {
        type: 'field',
        label: 'Text Box',
        children: [],
        dataType: 'Text Box',
        keyField: '',
        required: false,
    },
    'notes-tag': {
        type: 'field',
        label: 'Notes',
        children: [],
        dataType: 'Text Area',
        keyField: '',
        required: false,
    },
    'date-tag': {
        type: 'field',
        label: 'Date',
        children: [],
        dataType: 'Date',
        keyField: '',
        required: false,
    },
};
