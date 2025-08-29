/**
 * Clinical Form HTML Converter Utility
 * Converts clinical form structure to HTML preview that matches the exact clinical form appearance
 */

/**
 * Converts an array of clinical form items to HTML string
 * @param {Array} items - Array of clinical form items
 * @param {number} level - Current nesting level for indentation
 * @returns {string} HTML string representation
 */
export const convertClinicalFormToHtml = (items, level = 0) => {
    return items
        .map((item) => {
            const indent = '  '.repeat(level);
            let html = '';

            switch (item.type) {
                case 'cf-group':
                    html = `${indent}<div style="margin: 0 0 10px 0; padding: 10px; border: 1px solid #ccc; background-color: #f8f9fa;" data-id="${item.id}">\n`;
                    html += `${indent}  <div style="font-weight: bold; color: #666; margin-bottom: 8px; font-size: 14px;">${item.label}</div>\n`;
                    if (item.children && item.children.length > 0) {
                        html += convertClinicalFormToHtml(item.children, level + 1);
                    }
                    html += `${indent}</div>\n`;
                    break;

                case 'cf-panel':
                    html = `${indent}<div style="margin: 0; padding: 0;" data-id="${item.id}">\n`;
                    if (item.children && item.children.length > 0) {
                        html += convertClinicalFormToHtml(item.children, level + 1);
                    }
                    html += `${indent}</div>\n`;
                    break;

                case 'cf-table':
                    html = `${indent}<div style="margin: 10px 0;" data-id="${item.id}">\n`;
                    html += `${indent}  <div style="border: 1px solid #ccc; background-color: #f5f5f5; padding: 8px; margin-bottom: 5px;">\n`;
                    html += `${indent}    <div style="font-weight: bold; color: #333; font-size: 13px;">${item.label}</div>\n`;
                    html += `${indent}  </div>\n`;
                    if (item.children && item.children.length > 0) {
                        html += `${indent}  <div style="border: 1px solid #ccc; border-top: none; padding: 8px; background-color: white;">\n`;
                        html += convertClinicalFormToHtml(item.children, level + 2);
                        html += `${indent}  </div>\n`;
                    }
                    html += `${indent}</div>\n`;
                    break;

                case 'cf-button':
                    html = `${indent}<div style="margin: 8px 0;" data-id="${item.id}">\n`;
                    html += `${indent}  <button style="padding: 4px 12px; background-color: #f0f0f0; border: 1px solid #ccc; font-size: 11px; color: #333; cursor: pointer;">${item.label}</button>\n`;
                    html += `${indent}</div>\n`;
                    break;

                case 'cf-checkbox':
                    html = `${indent}<div style="margin: 6px 0; display: flex; align-items: center;" data-id="${item.id}">\n`;
                    html += `${indent}  <input type="checkbox" style="margin-right: 6px; width: 13px; height: 13px;" />\n`;
                    html += `${indent}  <label style="font-size: 11px; color: #333; cursor: pointer;">${item.label}</label>\n`;
                    html += `${indent}</div>\n`;
                    break;

                case 'cf-date':
                case 'cf-future-date':
                    html = `${indent}<div style="margin: 6px 0; display: flex; align-items: center;" data-id="${item.id}">\n`;
                    html += `${indent}  <label style="display: inline-block; width: 100px; font-size: 11px; color: #333; margin-right: 8px;">${item.label}</label>\n`;
                    html += `${indent}  <input type="text" value="1/1/1971" style="width: 80px; padding: 2px 4px; border: 1px solid #ccc; font-size: 11px;" />\n`;
                    html += `${indent}</div>\n`;
                    break;

                case 'cf-info':
                    html = `${indent}<div style="margin: 4px 0; font-size: 11px; color: #666; font-style: italic;" data-id="${item.id}">\n`;
                    html += `${indent}  ${item.label}\n`;
                    html += `${indent}</div>\n`;
                    break;

                case 'cf-listbox':
                    html = `${indent}<div style="margin: 6px 0; display: flex; align-items: center;" data-id="${item.id}">\n`;
                    html += `${indent}  <label style="display: inline-block; width: 100px; font-size: 11px; color: #333; margin-right: 8px;">${item.label}</label>\n`;
                    html += `${indent}  <select style="width: 200px; padding: 2px 4px; border: 1px solid #ccc; font-size: 11px; background-color: white;">\n`;
                    // Always include a leading blank option so default selection is empty
                    html += `${indent}    <option value=""></option>\n`;
                    if (item.options && item.options.length > 0) {
                        item.options.forEach((option) => {
                            html += `${indent}    <option value="${option.value || option.id}">${option.text}</option>\n`;
                        });
                    }
                    html += `${indent}  </select>\n`;
                    html += `${indent}</div>\n`;
                    break;

                case 'cf-notes':
                    html = `${indent}<div style="margin: 6px 0;" data-id="${item.id}">\n`;
                    html += `${indent}  <label style="display: block; margin-bottom: 2px; font-size: 11px; color: #333;">${item.label}</label>\n`;
                    html += `${indent}  <textarea style="width: 300px; height: 60px; padding: 4px; border: 1px solid #ccc; font-size: 11px; font-family: Arial, sans-serif; resize: none;"></textarea>\n`;
                    html += `${indent}</div>\n`;
                    break;

                case 'cf-notes-history':
                    html = `${indent}<div style="margin: 6px 0;" data-id="${item.id}">\n`;
                    html += `${indent}  <label style="display: block; margin-bottom: 2px; font-size: 11px; color: #333;">${item.label}</label>\n`;
                    html += `${indent}  <div style="position: relative; display: inline-block;">\n`;
                    html += `${indent}    <textarea style="width: 300px; height: 80px; padding: 4px 24px 4px 4px; border: 1px solid #ccc; font-size: 11px; font-family: Arial, sans-serif; resize: none;"></textarea>\n`;
                    html += `${indent}    <button style="position: absolute; top: 4px; right: 4px; width: 16px; height: 16px; background: #ddd; border: 1px solid #999; font-size: 9px; cursor: pointer; display: flex; align-items: center; justify-content: center;" title="History">+</button>\n`;
                    html += `${indent}  </div>\n`;
                    html += `${indent}</div>\n`;
                    break;

                case 'cf-patient-data':
                    html = `${indent}<div style="margin: 6px 0; display: flex; align-items: center;" data-id="${item.id}">\n`;
                    html += `${indent}  <label style="display: inline-block; width: 140px; font-size: 11px; color: #333; margin-right: 8px;">${item.label}</label>\n`;
                    html += `${indent}  <input type="text" value="123.0" readonly style="width: 60px; padding: 2px 4px; border: 1px solid #ccc; font-size: 11px; background-color: #f9f9f9;" />\n`;
                    html += `${indent}</div>\n`;
                    break;

                case 'cf-prescription':
                    html = `${indent}<div style="margin: 8px 0; padding: 6px; background-color: #f9f9f9; border: 1px solid #ddd;" data-id="${item.id}">\n`;
                    html += `${indent}  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">\n`;
                    html += `${indent}    <span style="font-size: 11px; color: #333;">Paracetamol 500mg tablets</span>\n`;
                    html += `${indent}    <div style="display: flex; gap: 4px;">\n`;
                    html += `${indent}      <button style="padding: 2px 8px; background-color: #f0f0f0; border: 1px solid #ccc; font-size: 10px; cursor: pointer;">Dispense</button>\n`;
                    html += `${indent}      <button style="padding: 2px 8px; background-color: #f0f0f0; border: 1px solid #ccc; font-size: 10px; cursor: pointer;">Print</button>\n`;
                    html += `${indent}    </div>\n`;
                    html += `${indent}  </div>\n`;
                    html += `${indent}  <div style="font-size: 10px; color: #666;">Smith, Jane&nbsp;&nbsp;&nbsp;1/1/21</div>\n`;
                    html += `${indent}</div>\n`;
                    break;

                case 'cf-provided-services':
                    html = `${indent}<div style="margin: 8px 0; display: flex; align-items: center; justify-content: space-between; padding: 4px; background-color: #f9f9f9; border: 1px solid #ddd;" data-id="${item.id}">\n`;
                    html += `${indent}  <div style="display: flex; align-items: center;">\n`;
                    html += `${indent}    <input type="checkbox" checked style="margin-right: 6px; width: 13px; height: 13px;" />\n`;
                    html += `${indent}    <span style="font-size: 11px; color: #333;">GP Appointment</span>\n`;
                    html += `${indent}  </div>\n`;
                    html += `${indent}  <button style="padding: 2px 8px; background-color: #f0f0f0; border: 1px solid #ccc; font-size: 10px; cursor: pointer;">Options</button>\n`;
                    html += `${indent}</div>\n`;
                    break;

                case 'cf-radio':
                    html = `${indent}<div style="margin: 6px 0;" data-id="${item.id}">\n`;
                    html += `${indent}  <label style="display: block; margin-bottom: 4px; font-size: 11px; color: #333;">${item.label}</label>\n`;
                    if (item.options && item.options.length > 0) {
                        item.options.forEach((option, index) => {
                            html += `${indent}  <div style="margin: 2px 0; margin-left: 16px;">\n`;
                            html += `${indent}    <label style="display: flex; align-items: center; font-size: 11px; cursor: pointer;">\n`;
                            html += `${indent}      <input type="radio" name="${item.id}" value="${option.value || option.id}" style="margin-right: 6px; width: 13px; height: 13px;" ${index === 0 ? 'checked' : ''} />\n`;
                            html += `${indent}      <span style="color: #333;">${option.text}</span>\n`;
                            html += `${indent}    </label>\n`;
                            html += `${indent}  </div>\n`;
                        });
                    }
                    html += `${indent}</div>\n`;
                    break;

                case 'cf-snom-textbox':
                    html = `${indent}<div style="margin: 6px 0; display: flex; align-items: center;" data-id="${item.id}">\n`;
                    html += `${indent}  <label style="display: inline-block; width: 140px; font-size: 11px; color: #333; margin-right: 8px;">${item.label}</label>\n`;
                    html += `${indent}  <input type="text" placeholder="Restricted to subset" style="width: 200px; padding: 2px 4px; border: 1px solid #ccc; font-size: 11px;" />\n`;
                    html += `${indent}</div>\n`;
                    break;

                case 'cf-textbox':
                    html = `${indent}<div style="margin: 6px 0; display: flex; align-items: center;" data-id="${item.id}">\n`;
                    html += `${indent}  <label style="display: inline-block; width: 100px; font-size: 11px; color: #333; margin-right: 8px;">${item.label}</label>\n`;
                    html += `${indent}  <input type="text" style="width: 200px; padding: 2px 4px; border: 1px solid #ccc; font-size: 11px;" />\n`;
                    html += `${indent}</div>\n`;
                    break;

                case 'cf-table-field':
                    return convertTableFieldToHtml(item, indent);

                default:
                    html = `${indent}<!-- Unknown clinical form item type: ${item.type} -->\n`;
                    break;
            }

            return html;
        })
        .join('');
};

/**
 * Convert table field to HTML based on its data type
 */
function convertTableFieldToHtml(item, indent) {
    let html = '';

    switch (item.dataType) {
        case 'textbox':
        case 'Text Box':
            html = `${indent}<div style="margin: 4px 0; display: flex; align-items: center;">\n`;
            html += `${indent}  <label style="display: inline-block; width: 80px; font-size: 10px; color: #333; margin-right: 6px;">${item.label}</label>\n`;
            html += `${indent}  <input type="text" style="flex: 1; padding: 1px 3px; border: 1px solid #ccc; font-size: 10px;" />\n`;
            html += `${indent}</div>\n`;
            break;

        case 'notes':
        case 'Text Area':
            html = `${indent}<div style="margin: 4px 0;">\n`;
            html += `${indent}  <label style="display: block; margin-bottom: 1px; font-size: 10px; color: #333;">${item.label}</label>\n`;
            html += `${indent}  <textarea style="width: 100%; height: 40px; padding: 2px 3px; border: 1px solid #ccc; font-size: 10px; resize: none;"></textarea>\n`;
            html += `${indent}</div>\n`;
            break;

        case 'date':
        case 'Date':
        case 'cf-date':
            html = `${indent}<div style="margin: 4px 0; display: flex; align-items: center;">\n`;
            html += `${indent}  <label style="display: inline-block; width: 80px; font-size: 10px; color: #333; margin-right: 6px;">${item.label}</label>\n`;
            html += `${indent}  <input type="text" style="width: 70px; padding: 1px 3px; border: 1px solid #ccc; font-size: 10px;" />\n`;
            html += `${indent}</div>\n`;
            break;

        case 'cf-listbox':
        case 'List Box':
            html = `${indent}<div style="margin: 4px 0; display: flex; align-items: center;">\n`;
            html += `${indent}  <label style="display: inline-block; width: 80px; font-size: 10px; color: #333; margin-right: 6px;">${item.label}</label>\n`;
            html += `${indent}  <select style="flex: 1; padding: 1px 3px; border: 1px solid #ccc; font-size: 10px;">\n`;
            // Leading blank option ensures default appears empty
            html += `${indent}    <option value=""></option>\n`;
            if (item.options && item.options.length > 0) {
                item.options.forEach((option) => {
                    html += `${indent}    <option value="${option.value || option.id}">${option.text}</option>\n`;
                });
            }
            html += `${indent}  </select>\n`;
            html += `${indent}</div>\n`;
            break;

        case 'cf-checkbox':
            html = `${indent}<div style="margin: 4px 0; display: flex; align-items: center;">\n`;
            html += `${indent}  <input type="checkbox" style="margin-right: 4px; width: 11px; height: 11px;" />\n`;
            html += `${indent}  <label style="font-size: 10px; color: #333; cursor: pointer;">${item.label}</label>\n`;
            html += `${indent}</div>\n`;
            break;

        default:
            html = `${indent}<div style="margin: 4px 0; font-size: 10px; color: #666;">${item.label} (${item.dataType})</div>\n`;
            break;
    }

    return html;
}

/**
 * Group consecutive panels for side-by-side rendering
 */
function groupConsecutivePanels(items) {
    const result = [];
    let currentPanelGroup = [];

    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (item.type === 'cf-panel') {
            currentPanelGroup.push(item);
        } else {
            if (currentPanelGroup.length > 0) {
                if (currentPanelGroup.length === 1) {
                    result.push(currentPanelGroup[0]);
                } else {
                    result.push({
                        type: 'cf-panel-group',
                        panels: currentPanelGroup
                    });
                }
                currentPanelGroup = [];
            }

            result.push(item);
        }
    }

    if (currentPanelGroup.length > 0) {
        if (currentPanelGroup.length === 1) {
            result.push(currentPanelGroup[0]);
        } else {
            result.push({
                type: 'cf-panel-group',
                panels: currentPanelGroup
            });
        }
    }

    return result;
}

/**
 * Enhanced clinical form converter that handles panel grouping
 */
export const convertClinicalFormWithPanelGrouping = (items, level = 0) => {
    const groupedItems = groupConsecutivePanels(items);
    const indent = '  '.repeat(level);

    return groupedItems
        .map((item) => {
            if (item.type === 'cf-panel-group') {
                let html = `${indent}<div style="display: flex; gap: 8px; margin: 4px 0;">\n`;
                item.panels.forEach((panel) => {
                    html += `${indent}  <div style="flex: 1; border: 1px solid #ccc; padding: 4px; background-color: white;" data-id="${panel.id}">\n`;
                    if (panel.children && panel.children.length > 0) {
                        html += convertClinicalFormWithPanelGrouping(panel.children, level + 2);
                    }
                    html += `${indent}  </div>\n`;
                });
                html += `${indent}</div>\n`;
                return html;
            } else {
                return convertClinicalFormToHtml([item], level);
            }
        })
        .join('');
};

/**
 * Generate complete HTML document for clinical form preview
 */
export const generateClinicalFormHtmlDocument = (items, title = 'Clinical Form Preview') => {
    // IMPORTANT: Previously this function injected a full HTML document with a <style> block
    // that targeted the global <body>. When rendered inside the React preview (via
    // dangerouslySetInnerHTML) that <style> element still applied globally, shrinking fonts
    // and altering layout (affecting modals). We now scope all styles under a root class.
    const bodyContent = convertClinicalFormWithPanelGrouping(items);

    return `<div class="cf-preview-root">
    <style>
        .cf-preview-root {
            font-family: Arial, sans-serif;
            line-height: 1.2;
            background-color: white;
            color: #333;
            font-size: 11px;
            /* Do NOT set global margins here; keep preview self-contained */
        }
        .cf-preview-root .clinical-form-container {
            max-width: 900px;
            margin: 0 auto;
            background-color: white;
            padding: 10px;
        }
        .cf-preview-root h1 {
            color: #333;
            font-size: 16px;
            margin: 0 0 15px 0;
            border-bottom: 1px solid #ccc;
            padding-bottom: 5px;
            font-weight: normal;
        }
        .cf-preview-root input,
        .cf-preview-root select,
        .cf-preview-root textarea {
            font-family: Arial, sans-serif;
        }
    </style>
    <div class="clinical-form-container">
        <h1>${title}</h1>
${bodyContent}
    </div>
</div>`;
};