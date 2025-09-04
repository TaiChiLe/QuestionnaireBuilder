/**
 * Chart Definition Generator Utility
 * 
 * Generates XML chart definitions based on chart configuration.
 * This is separate from the main clinical form XML generation
 * and creates chart definition XML that users can copy.
 */

/**
 * Generate chart definition XML for a chart item
 * @param {Object} chartItem - The chart item with configuration
 * @returns {string} Generated chart definition XML
 */
export function generateChartDefinitionXML(chartItem) {
    if (!chartItem) {
        return generateEmptyChartDefinition();
    }

    const {
        label = 'Chart',
        chartType = 'Gauge',
        chartMetaFields = [],
        dataPoints = []
    } = chartItem;

    const xmlContent = generateChartDefinitionContent(label, chartType, chartMetaFields, dataPoints);

    return `${xmlContent}`;
}

/**
 * Generate the main chart definition content
 * @param {string} chartName - Name of the chart
 * @param {string} chartType - Type of chart (Gauge, Stack, Line, Bar)
 * @param {Array} metaFields - Array of chart meta fields (for Line/Bar charts)
 * @param {Array} dataPoints - Array of data points (for Gauge/Stack charts)
 * @returns {string} Chart definition XML content
 */
function generateChartDefinitionContent(chartName, chartType, metaFields = [], dataPoints = []) {
    const indent = '  ';

    // For Gauge and Stack charts, use the dataPoints format with meta field source
    if (chartType === 'Gauge' || chartType === 'Stack') {
        const source = metaFields.length > 0 ?
            (typeof metaFields[0] === 'string' ? metaFields[0] : metaFields[0].name || 'MetaField') :
            'MetaField';

        let xml = `<chartDefinition label="${escapeXML(chartName)}" type="${chartType.toLowerCase()}" source="${escapeXML(source)}">\n`;
        xml += `${indent}<dataPoints>\n`;

        if (dataPoints.length > 0) {
            dataPoints.forEach(point => {
                const label = escapeXML(point.label || 'DataPoint');
                const min = point.min || '0';
                const max = point.max || '100';
                const colour = point.colour || '#3B82F6';

                xml += `${indent}${indent}<dataPoint label="${label}" min="${min}" max="${max}" colour="${colour}" />\n`;
            });
        } else {
            // Default data point if none specified
            xml += `${indent}${indent}<dataPoint label="Default" min="0" max="100" colour="#3B82F6" />\n`;
        }

        xml += `${indent}</dataPoints>\n`;
        xml += `${indent}<value const="{const}" source="{source}" />\n`;
        xml += '</chartDefinition>';

        return xml;
    }    // For Line and Bar charts, use the dataPoints format with metaFields
    if (chartType === 'Line' || chartType === 'Bar') {
        const chartTypeAttr = chartType === 'Line' ? 'metafieldHistoryLine' : 'metafieldHistoryBar';

        let xml = `<chartDefinition label="${escapeXML(chartName)}" type="${chartTypeAttr}">\n`;
        xml += `${indent}<dataPoints>\n`;

        if (metaFields.length > 0) {
            metaFields.forEach(field => {
                const fieldName = typeof field === 'string' ? field : field.name || 'MetaField';
                xml += `${indent}${indent}<dataPoint label="${escapeXML(fieldName)}" />\n`;
            });
        } else {
            xml += `${indent}${indent}<dataPoint label="MetaField" />\n`;
        }

        xml += `${indent}</dataPoints>\n`;
        xml += '</chartDefinition>';

        return xml;
    }

    // Fallback for unknown chart types
    let xml = `<chartDefinition label="${escapeXML(chartName)}" type="gauge" source="MetaField">\n`;
    xml += `${indent}<dataPoints>\n`;
    xml += `${indent}${indent}<dataPoint label="Default" min="0" max="100" colour="#3B82F6" />\n`;
    xml += `${indent}</dataPoints>\n`;
    xml += `${indent}<value const="{const}" source="{source}" />\n`;
    xml += '</chartDefinition>';

    return xml;
}

/**
 * Generate empty chart definition for fallback
 */
function generateEmptyChartDefinition() {
    return `<chartDefinition label="Chart" type="gauge" source="MetaField">
  <dataPoints>
    <dataPoint label="Default" min="0" max="100" colour="#3B82F6" />
  </dataPoints>
  <value const="{const}" source="{source}" />
</chartDefinition>`;
}

/**
 * Helper function to escape XML characters
 */
function escapeXML(str) {
    if (!str) return '';
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}
