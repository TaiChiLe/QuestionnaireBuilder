# Builder-Specific Utils Structure

This document outlines the new utility structure that separates Questionnaire and Clinical Form builder functionality.

## Directory Structure

```
src/
├── utils/
│   ├── questionnaire/
│   │   ├── index.js          # Centralized exports for questionnaire utils
│   │   ├── xmlBuilder.js     # Questionnaire XML generation
│   │   ├── xmlParser.js      # Questionnaire XML parsing
│   │   └── xmlExporter.js    # Questionnaire XML export
│   ├── clinicalForm/
│   │   ├── index.js          # Centralized exports for clinical form utils
│   │   ├── xmlBuilder.js     # Clinical form XML generation
│   │   ├── xmlParser.js      # Clinical form XML parsing
│   │   └── xmlExporter.js    # Clinical form XML export
│   └── index.js              # Main utils entry point
├── hooks/
│   └── useBuilderUtils.js    # Hook for builder-specific utilities
└── components/utils/         # Legacy utils (to be gradually migrated)
    ├── id.js
    ├── xmlBuilder2Solution.js
    ├── xmlExporter.js
    └── xmlParser.js
```

## Usage Patterns

### 1. Using the Hook (Recommended)

```jsx
import { useBuilderUtils } from '../hooks/useBuilderUtils';

function MyComponent({ builderMode }) {
  const { generateXML, parseXML, exportXML, builderType, defaultFilename } =
    useBuilderUtils(builderMode);

  // Use builder-specific functions
  const handleExport = () => {
    exportXML(droppedItems, formName);
  };
}
```

### 2. Direct Import

```jsx
import * as QuestionnaireUtils from '../utils/questionnaire';
import * as ClinicalFormUtils from '../utils/clinicalForm';

// Use specific builder utils
const questionnaireName = QuestionnaireUtils.extractQuestionnaireName(xml);
const clinicalForm = ClinicalFormUtils.parseClinicalFormXml(xml);
```

### 3. Dynamic Import

```jsx
import { getBuilderUtils } from '../utils';

const utils = getBuilderUtils(builderMode);
const result = utils.parseXML(xmlString);
```

## Builder-Specific Differences

### Questionnaire Builder

- **Root Element**: `<Questionnaire>`
- **Pages Container**: `<Pages>`
- **File Extension**: `.xml`
- **Namespace**: `QuestionnaireSchema.xsd`
- **Elements**: Page, Question, Field, Information, Table, Column

### Clinical Form Builder

- **Root Element**: `<ClinicalForm>` or `<ClinicalForms>`
- **Sections Container**: `<Sections>` (TBD)
- **File Extension**: `.xml`
- **Namespace**: Clinical form specific (TBD)
- **Elements**: Section, ClinicalQuestion, ClinicalField, PatientInfo, etc.

## Migration Strategy

### Phase 1: Create Placeholder Structure ✅

- Create separate utility directories
- Implement placeholder functions
- Create useBuilderUtils hook

### Phase 2: Implement Questionnaire Utils

- Migrate existing questionnaire logic
- Enhance with questionnaire-specific features
- Add comprehensive validation

### Phase 3: Implement Clinical Form Utils

- Research clinical form XML structure
- Implement clinical form-specific logic
- Add clinical form validation rules

### Phase 4: Update App Integration

- Replace direct imports with useBuilderUtils hook
- Update export/import functionality
- Add builder mode switching

### Phase 5: Legacy Cleanup

- Remove unused legacy utils
- Update all component imports
- Remove redundant code

## Key Features to Implement

### Questionnaire Utils

- [ ] Enhanced validation rules
- [ ] Metadata handling
- [ ] Export options (compression, formats)
- [ ] Import validation
- [ ] Schema validation

### Clinical Form Utils

- [ ] Clinical form XML structure research
- [ ] Patient information handling
- [ ] Clinical validation rules
- [ ] Regulatory compliance features
- [ ] Integration with clinical systems

## Current Status

- ✅ Directory structure created
- ✅ Placeholder files created
- ✅ useBuilderUtils hook implemented
- ✅ Index files for easy imports
- 🔄 Functions are placeholders - need implementation
- ⏳ App integration pending
- ⏳ Legacy migration pending

## Next Steps

1. **Research Clinical Form XML Structure**

   - Study existing clinical form XML formats
   - Define clinical form element structure
   - Determine validation requirements

2. **Implement Questionnaire Utils**

   - Move existing questionnaire logic to new structure
   - Enhance with additional features
   - Add comprehensive testing

3. **Update App.jsx**

   - Replace direct imports with useBuilderUtils
   - Add builder mode switching logic
   - Update export/import handlers

4. **Test Integration**
   - Verify functionality works with new structure
   - Test builder mode switching
   - Validate export/import operations

## Notes

- All current functions are placeholders that need proper implementation
- The existing `components/utils` files are preserved for backward compatibility
- Clinical form structure may need research to determine proper XML format
- Builder mode switching should be seamless for users
