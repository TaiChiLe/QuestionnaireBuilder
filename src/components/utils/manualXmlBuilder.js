export function generateManualXML(droppedItems) {
    if (droppedItems.length === 0) return '';

    const escapeXml = (text) => {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    };

    const generateElement = (item, indent = '    ') => {
        let xml = '';

        if (item.type === 'page') {
            xml += `${indent}<Page title="${escapeXml(item.title || '')}">\n`;

            // Add children
            if (item.children && item.children.length > 0) {
                item.children.forEach(child => {
                    xml += generateElement(child, indent + '  ');
                });
            }

            // Add visibility if exists
            if (item.conditions && item.conditions.length > 0) {
                xml += generateVisibility(item, indent + '  ');
            }

            xml += `${indent}</Page>\n`;

        } else if (item.type === 'question') {
            let dataTypeAttr = '';
            let xmlDataType = item.dataType || 'List Box';

            if (xmlDataType === 'Multi Select') {
                xmlDataType = 'multi-select';
            } else if (xmlDataType === 'List Box') {
                xmlDataType = 'list-box';
            } else if (xmlDataType === 'Radio Buttons') {
                xmlDataType = 'radio';
            }

            if (xmlDataType.toLowerCase() !== 'list-box') {
                dataTypeAttr = ` datatype="${xmlDataType.toLowerCase()}"`;
            }

            xml += `${indent}<Question record="${escapeXml(item.keyField || '')}" required="${item.required ? 'true' : 'false'}"${dataTypeAttr}>\n`;

            // Add Text element
            xml += `${indent}  <Text record="${escapeXml(item.keyField || '')}">${escapeXml(item.label || '')}</Text>\n`;

            // Add answers
            if (item.answers && item.answers.length > 0) {
                xml += `${indent}  <Answers>\n`;
                item.answers.forEach(ans => {
                    xml += `${indent}    <Answer>${escapeXml(ans.text)}</Answer>\n`;
                });
                xml += `${indent}  </Answers>\n`;
            }

            // Add children
            if (item.children && item.children.length > 0) {
                item.children.forEach(child => {
                    xml += generateElement(child, indent + '  ');
                });
            }

            // Add visibility if exists
            if (item.conditions && item.conditions.length > 0) {
                xml += generateVisibility(item, indent + '  ');
            }

            xml += `${indent}</Question>\n`;

        } else if (item.type === 'field') {
            let dataTypeAttr = '';
            if (item.dataType === 'Text Area') {
                dataTypeAttr = ' datatype="textarea"';
            } else if (item.dataType === 'Date') {
                dataTypeAttr = ' datatype="date"';
            }

            const fieldContent = escapeXml(item.label || '');
            const visibilityXml = item.conditions && item.conditions.length > 0
                ? generateVisibility(item, '', true)
                : '';

            xml += `${indent}<Field record="${escapeXml(item.keyField || 'text')}" required="${item.required ? 'true' : 'false'}"${dataTypeAttr}>${fieldContent}${visibilityXml}</Field>\n`;

        } else if (item.type === 'information') {
            xml += `${indent}<Information>${escapeXml(item.label || '')}</Information>\n`;

        } else if (item.type === 'table') {
            xml += `${indent}<Table required="${item.required ? 'true' : 'false'}">\n`;

            // Add Text element
            xml += `${indent}  <Text record="${escapeXml(item.keyField || 'table')}">${escapeXml(item.label || '')}</Text>\n`;

            // Add children (table fields)
            if (item.children && item.children.length > 0) {
                item.children.forEach(child => {
                    xml += generateElement(child, indent + '  ');
                });
            }

            // Add visibility if exists
            if (item.conditions && item.conditions.length > 0) {
                xml += generateVisibility(item, indent + '  ');
            }

            xml += `${indent}</Table>\n`;

        } else if (item.type === 'table-field') {
            let dataTypeAttr = '';
            if (item.dataType === 'Date') {
                dataTypeAttr = ' datatype="date"';
            }

            xml += `${indent}<Column header="${escapeXml(item.label || '')}" required="${item.required ? 'true' : 'false'}"${dataTypeAttr}></Column>\n`;
        }

        return xml;
    };

    const generateVisibility = (item, indent, inline = false) => {
        const visibilityType = item.visibilityType || 'Any';

        if (inline) {
            let xml = `<Visibility><${visibilityType}>`;
            item.conditions.forEach(condition => {
                xml += `<Condition record="${escapeXml(condition.record || '')}" answer="${escapeXml(condition.answer || '')}"></Condition>`;
            });
            xml += `</${visibilityType}></Visibility>`;
            return xml;
        } else {
            let xml = `${indent}<Visibility>\n`;
            xml += `${indent}  <${visibilityType}>\n`;
            item.conditions.forEach(condition => {
                xml += `${indent}    <Condition record="${escapeXml(condition.record || '')}" answer="${escapeXml(condition.answer || '')}"></Condition>\n`;
            });
            xml += `${indent}  </${visibilityType}>\n`;
            xml += `${indent}</Visibility>\n`;
            return xml;
        }
    };

    let xml = '<?xml version="1.0" encoding="utf-8"?>\n';
    xml += '<Questionnaire xmlns="QuestionnaireSchema.xsd">\n';
    xml += '  <Pages>\n';

    // Generate each item in order
    droppedItems.forEach(item => {
        xml += generateElement(item);
    });

    xml += '  </Pages>\n';
    xml += '</Questionnaire>';

    return xml;
}
