/**
 * useBuilderUtils Hook
 * Provides builder-specific utility functions based on the current builder mode
 */

import { useMemo } from 'react';
import * as QuestionnaireUtils from '../utils/questionnaire';
import * as ClinicalFormUtils from '../utils/clinicalForm';

/**
 * Hook to get builder-specific utilities
 * @param {string} builderMode - 'questionnaire' or 'clinical'
 * @returns {Object} Builder-specific utility functions
 */
export function useBuilderUtils(builderMode) {
    const utils = useMemo(() => {
        if (builderMode === 'clinical') {
            return {
                // Clinical form specific functions
                generateXML: ClinicalFormUtils.generateClinicalFormXML,
                parseXML: ClinicalFormUtils.parseClinicalFormXml,
                validateXML: ClinicalFormUtils.validateClinicalFormXml,
                exportXML: ClinicalFormUtils.exportClinicalFormXml,
                exportWithOptions: ClinicalFormUtils.exportClinicalFormWithOptions,
                generateExportPreview: ClinicalFormUtils.generateClinicalFormExportPreview,
                validateStructure: ClinicalFormUtils.validateClinicalFormStructure,
                getExportOptions: ClinicalFormUtils.getClinicalFormExportOptions,
                extractName: ClinicalFormUtils.extractClinicalFormName,

                // Builder-specific properties
                builderType: 'clinical',
                defaultFilename: 'clinical_form',
                fileExtension: '.xml',
                rootElementName: 'ClinicalForm'
            };
        }

        // Default to questionnaire utils
        return {
            // Questionnaire specific functions
            generateXML: QuestionnaireUtils.generateQuestionnaireXML,
            parseXML: QuestionnaireUtils.parseQuestionnaireXml,
            validateXML: QuestionnaireUtils.validateQuestionnaireXml,
            exportXML: QuestionnaireUtils.exportQuestionnaireXml,
            exportWithOptions: QuestionnaireUtils.exportQuestionnaireWithOptions,
            generateExportPreview: QuestionnaireUtils.generateQuestionnaireExportPreview,
            validateStructure: QuestionnaireUtils.validateQuestionnaireStructure,
            getExportOptions: QuestionnaireUtils.getQuestionnaireExportOptions,
            extractName: QuestionnaireUtils.extractQuestionnaireName,

            // Builder-specific properties
            builderType: 'questionnaire',
            defaultFilename: 'questionnaire',
            fileExtension: '.xml',
            rootElementName: 'Questionnaire'
        };
    }, [builderMode]);

    return utils;
}

/**
 * Hook to get legacy utils (for backward compatibility)
 * These will gradually be replaced by builder-specific utils
 */
export function useLegacyUtils() {
    return useMemo(() => ({
        // Legacy imports - these are currently used by the app
        generateOrderedXML: require('../components/utils/xmlBuilder2Solution').generateOrderedXML,
        exportXmlStructure: require('../components/utils/xmlExporter').exportXmlStructure,
        parseXmlToItems: require('../components/utils/xmlParser').parseXmlToItems,
        extractQuestionnaireName: require('../components/utils/xmlParser').extractQuestionnaireName,
        generateId: require('../components/utils/id').generateId,
    }), []);
}
