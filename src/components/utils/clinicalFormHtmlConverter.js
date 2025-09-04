/**
 * Clinical Form HTML Converter Utility
 * Converts clinical form structure to HTML preview that matches the exact clinical form appearance
 */

/**
 * Helper function to check if an item is required and return asterisk HTML
 * @param {Object} item - The clinical form item
 * @returns {string} HTML string for required asterisk or empty string
 */
function getRequiredAsterisk(item) {
    // Check different required field patterns
    const isRequired =
        (item.cfrequired && item.cfrequired !== 'Ignore' && item.cfrequired !== false) ||
        (item.cfbuttonrequired && item.cfbuttonrequired !== 'Ignore' && item.cfbuttonrequired !== false) ||
        item.required === true;

    return isRequired ? '<span style="color: red; margin-left: 2px;">*</span>' : '';
}

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
                        html += `${indent}  <div style="border: 1px solid #ccc; border-top: none; background-color: white;">\n`;

                        // Create table headers
                        html += `${indent}    <div style="display: grid; grid-template-columns: repeat(${item.children.length}, 1fr); background-color: #f0f0f0; border-bottom: 1px solid #ccc;">\n`;
                        item.children.forEach(child => {
                            html += `${indent}      <div style="padding: 6px 8px; border-right: 1px solid #ccc; font-weight: bold; font-size: 10px; color: #333;">${child.label}${getRequiredAsterisk(child)}</div>\n`;
                        });
                        html += `${indent}    </div>\n`;

                        // Create table row with inputs
                        html += `${indent}    <div style="display: grid; grid-template-columns: repeat(${item.children.length}, 1fr);">\n`;
                        item.children.forEach(child => {
                            html += `${indent}      <div style="padding: 8px; border-right: 1px solid #ccc;">\n`;
                            html += convertTableFieldToHtml(child, indent + '        ');
                            html += `${indent}      </div>\n`;
                        });
                        html += `${indent}    </div>\n`;

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
                    html += `${indent}  <label style="font-size: 11px; color: #333; cursor: pointer; margin-right: 6px;">${item.label}${getRequiredAsterisk(item)}</label>\n`;
                    html += `${indent}  <input type="checkbox" style="width: 13px; height: 13px;" />\n`;
                    html += `${indent}</div>\n`;
                    break;

                case 'cf-chart':
                    const chartType = item.chartType || 'Gauge';
                    const dataPoints = item.dataPoints || [];
                    const metaFields = item.chartMetaFields || [];

                    html = `${indent}<div style="margin: 10px 0; padding: 12px; border: 1px solid #ddd; background-color: #f9f9f9; border-radius: 4px;" data-id="${item.id}">\n`;
                    html += `${indent}  <div style="font-size: 12px; color: #333; font-weight: bold; margin-bottom: 8px;">${item.label} (${chartType} Chart)</div>\n`;

                    if (chartType === 'Gauge') {
                        // Gauge Chart Preview (Semi-circle)
                        html += `${indent}  <div style="height: 120px; background-color: #ffffff; border: 1px solid #ccc; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; position: relative; border-radius: 4px; padding: 12px;">\n`;
                        html += `${indent}    <div style="width: 140px; height: 75px; position: relative; overflow: hidden; margin-bottom: 8px;">\n`;
                        html += `${indent}      <div style="width: 140px; height: 140px; border-radius: 50%; background: conic-gradient(from 180deg, #a020f0 0deg, #33cc33 36deg, #ffcd56 72deg, #ff6384 108deg, #8b0000 180deg); position: relative;">\n`;
                        html += `${indent}        <div style="width: 100px; height: 100px; background-color: white; border-radius: 50%; position: absolute; top: 20px; left: 20px; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold; color: #666;">23</div>\n`;
                        html += `${indent}        <div style="position: absolute; top: 45px; left: 70px; width: 2px; height: 30px; background-color: #333; transform-origin: bottom center; transform: rotate(30deg);"></div>\n`;
                        html += `${indent}      </div>\n`;
                        html += `${indent}    </div>\n`;
                        html += `${indent}    <div style="margin-top: 8px; font-size: 10px; color: #666;">BMI Gauge</div>\n`;
                        if (dataPoints.length > 0) {
                            html += `${indent}    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; font-size: 9px;">\n`;
                            dataPoints.slice(0, 3).forEach(point => {
                                html += `${indent}      <span style="background-color: ${point.colour || '#ccc'}; color: white; padding: 2px 6px; border-radius: 2px;">${point.label} (${point.min}-${point.max})</span>\n`;
                            });
                            if (dataPoints.length > 3) {
                                html += `${indent}      <span style="color: #666;">+${dataPoints.length - 3} more</span>\n`;
                            }
                            html += `${indent}    </div>\n`;
                        }
                        html += `${indent}  </div>\n`;
                    } else if (chartType === 'Stack') {
                        // Stack Chart Preview
                        html += `${indent}  <div style="height: 160px; background-color: #ffffff; border: 1px solid #ccc; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 4px; padding: 12px;">\n`;
                        html += `${indent}    <div style="width: 100%; height: 30px; background: linear-gradient(90deg, #a020f0 0% 18%, #33cc33 18% 25%, #ffcd56 25% 30%, #d3d3d3 30% 100%); border-radius: 4px; position: relative; display: flex; align-items: center;">\n`;
                        html += `${indent}      <div style="position: absolute; left: 22%; top: -25px; font-size: 9px; color: #333; background: white; padding: 1px 3px; border: 1px solid #ccc; border-radius: 2px;">✓ 24.9</div>\n`;
                        html += `${indent}    </div>\n`;
                        html += `${indent}    <div style="margin-top: 12px; font-size: 10px; color: #666;">BMI Stack Chart</div>\n`;
                        if (dataPoints.length > 0) {
                            html += `${indent}    <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; font-size: 8px;">\n`;
                            dataPoints.slice(0, 4).forEach(point => {
                                html += `${indent}      <span style="background-color: ${point.colour || '#ccc'}; color: white; padding: 1px 4px; border-radius: 2px;">${point.label}</span>\n`;
                            });
                            if (dataPoints.length > 4) {
                                html += `${indent}      <span style="color: #666;">+${dataPoints.length - 4} more</span>\n`;
                            }
                            html += `${indent}    </div>\n`;
                        }
                        html += `${indent}  </div>\n`;
                    } else if (chartType === 'Line') {
                        // Line Chart Preview
                        html += `${indent}  <div style="height: 160px; background-color: #ffffff; border: 1px solid #ccc; display: flex; flex-direction: column; justify-content: center; border-radius: 4px; padding: 12px; position: relative;">\n`;
                        html += `${indent}    <div style="font-size: 10px; color: #666; margin-bottom: 8px;">Line Chart - Patient History</div>\n`;
                        html += `${indent}    <svg width="100%" height="80" viewBox="0 0 200 80" style="border: 1px solid #eee;">\n`;
                        html += `${indent}      <defs><linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" style="stop-color:#5B9BD5;stop-opacity:1" /><stop offset="100%" style="stop-color:#FF6B6B;stop-opacity:1" /></linearGradient></defs>\n`;
                        html += `${indent}      <polyline points="10,60 30,45 50,40 70,35 90,30 110,32 130,28 150,25 170,30 190,28" style="fill:none;stroke:#5B9BD5;stroke-width:2" />\n`;
                        html += `${indent}      <polyline points="10,70 30,65 50,62 70,58 90,55 110,57 130,52 150,48 170,53 190,50" style="fill:none;stroke:#FF6B6B;stroke-width:2" />\n`;
                        html += `${indent}      <text x="10" y="15" font-size="8" fill="#666">BMI & Weight Over Time</text>\n`;
                        html += `${indent}    </svg>\n`;
                        if (metaFields.length > 0) {
                            html += `${indent}    <div style="display: flex; gap: 8px; margin-top: 4px; font-size: 8px;">\n`;
                            metaFields.slice(0, 2).forEach((field, index) => {
                                const colors = ['#5B9BD5', '#FF6B6B'];
                                const fieldName = typeof field === 'string' ? field : field.name || 'MetaField';
                                html += `${indent}      <span style="color: ${colors[index] || '#666'};">■ ${fieldName}</span>\n`;
                            });
                            if (metaFields.length > 2) {
                                html += `${indent}      <span style="color: #666;">+${metaFields.length - 2} more</span>\n`;
                            }
                            html += `${indent}    </div>\n`;
                        }
                        html += `${indent}  </div>\n`;
                    } else if (chartType === 'Bar') {
                        // Bar Chart Preview
                        html += `${indent}  <div style="height: 160px; background-color: #ffffff; border: 1px solid #ccc; display: flex; flex-direction: column; justify-content: center; border-radius: 4px; padding: 12px;">\n`;
                        html += `${indent}    <div style="font-size: 10px; color: #666; margin-bottom: 8px;">Bar Chart - Field Comparison</div>\n`;
                        html += `${indent}    <svg width="100%" height="80" viewBox="0 0 200 80" style="border: 1px solid #eee;">\n`;
                        html += `${indent}      <rect x="10" y="30" width="8" height="40" fill="#5B9BD5" />\n`;
                        html += `${indent}      <rect x="20" y="35" width="8" height="35" fill="#FF6B6B" />\n`;
                        html += `${indent}      <rect x="35" y="25" width="8" height="45" fill="#5B9BD5" />\n`;
                        html += `${indent}      <rect x="45" y="30" width="8" height="40" fill="#FF6B6B" />\n`;
                        html += `${indent}      <rect x="60" y="20" width="8" height="50" fill="#5B9BD5" />\n`;
                        html += `${indent}      <rect x="70" y="28" width="8" height="42" fill="#FF6B6B" />\n`;
                        html += `${indent}      <rect x="85" y="22" width="8" height="48" fill="#5B9BD5" />\n`;
                        html += `${indent}      <rect x="95" y="25" width="8" height="45" fill="#FF6B6B" />\n`;
                        html += `${indent}      <text x="10" y="15" font-size="8" fill="#666">BMI & Weight Data Points</text>\n`;
                        html += `${indent}    </svg>\n`;
                        if (metaFields.length > 0) {
                            html += `${indent}    <div style="display: flex; gap: 8px; margin-top: 4px; font-size: 8px;">\n`;
                            metaFields.slice(0, 2).forEach((field, index) => {
                                const colors = ['#5B9BD5', '#FF6B6B'];
                                const fieldName = typeof field === 'string' ? field : field.name || 'MetaField';
                                html += `${indent}      <span style="color: ${colors[index] || '#666'};">■ ${fieldName}</span>\n`;
                            });
                            if (metaFields.length > 2) {
                                html += `${indent}      <span style="color: #666;">+${metaFields.length - 2} more</span>\n`;
                            }
                            html += `${indent}    </div>\n`;
                        }
                        html += `${indent}  </div>\n`;
                    } else {
                        // Fallback for unknown chart types
                        html += `${indent}  <div style="height: 120px; background-color: #ffffff; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; color: #888; font-size: 10px; border-radius: 4px;">\n`;
                        html += `${indent}    [${chartType} Chart Preview]\n`;
                        html += `${indent}  </div>\n`;
                    }

                    html += `${indent}</div>\n`;
                    break;

                case 'cf-date':
                case 'cf-future-date':
                    html = `${indent}<div style="margin: 6px 0; display: flex; align-items: center;" data-id="${item.id}">\n`;
                    html += `${indent}  <label style="display: inline-block; width: 100px; font-size: 11px; color: #333; margin-right: 8px;">${item.label}${getRequiredAsterisk(item)}</label>\n`;
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
                    html += `${indent}  <label style="display: inline-block; width: 100px; font-size: 11px; color: #333; margin-right: 8px;">${item.label}${getRequiredAsterisk(item)}</label>\n`;
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
                    html += `${indent}  <label style="display: block; margin-bottom: 2px; font-size: 11px; color: #333;">${item.label}${getRequiredAsterisk(item)}</label>\n`;
                    html += `${indent}  <textarea style="width: 300px; height: 60px; padding: 4px; border: 1px solid #ccc; font-size: 11px; font-family: Arial, sans-serif; resize: none;"></textarea>\n`;
                    html += `${indent}</div>\n`;
                    break;

                case 'cf-notes-history':
                    html = `${indent}<div style="margin: 6px 0;" data-id="${item.id}">\n`;
                    html += `${indent}  <label style="display: block; margin-bottom: 2px; font-size: 11px; color: #333;">${item.label}${getRequiredAsterisk(item)}</label>\n`;
                    html += `${indent}  <div style="position: relative; display: inline-block;">\n`;
                    html += `${indent}    <textarea style="width: 300px; height: 80px; padding: 4px 24px 4px 4px; border: 1px solid #ccc; font-size: 11px; font-family: Arial, sans-serif; resize: none;"></textarea>\n`;
                    html += `${indent}    <button style="position: absolute; top: 4px; right: 4px; width: 16px; height: 16px; background: #ddd; border: 1px solid #999; font-size: 9px; cursor: pointer; display: flex; align-items: center; justify-content: center;" title="History">+</button>\n`;
                    html += `${indent}  </div>\n`;
                    html += `${indent}</div>\n`;
                    break;

                case 'cf-patient-data':
                    html = `${indent}<div style="margin: 6px 0; display: flex; align-items: center;" data-id="${item.id}">\n`;
                    html += `${indent}  <label style="display: inline-block; width: 140px; font-size: 11px; color: #333; margin-right: 8px;">${item.label}${getRequiredAsterisk(item)}</label>\n`;
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
                    html += `${indent}  <label style="display: block; margin-bottom: 4px; font-size: 11px; color: #333;">${item.label}${getRequiredAsterisk(item)}</label>\n`;
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
                    html += `${indent}  <label style="display: inline-block; width: 140px; font-size: 11px; color: #333; margin-right: 8px;">${item.label}${getRequiredAsterisk(item)}</label>\n`;
                    html += `${indent}  <input type="text" placeholder="Restricted to subset" style="width: 200px; padding: 2px 4px; border: 1px solid #ccc; font-size: 11px;" />\n`;
                    html += `${indent}</div>\n`;
                    break;

                case 'cf-textbox':
                    html = `${indent}<div style="margin: 6px 0; display: flex; align-items: center;" data-id="${item.id}">\n`;
                    html += `${indent}  <label style="display: inline-block; width: 100px; font-size: 11px; color: #333; margin-right: 8px;">${item.label}${getRequiredAsterisk(item)}</label>\n`;
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
            html = `${indent}<input type="text" style="width: 100%; padding: 2px 4px; border: 1px solid #ccc; font-size: 10px; box-sizing: border-box;" />\n`;
            break;

        case 'notes':
        case 'Text Area':
            html = `${indent}<textarea style="width: 100%; height: 40px; padding: 2px 3px; border: 1px solid #ccc; font-size: 10px; resize: none; box-sizing: border-box;"></textarea>\n`;
            break;

        case 'date':
        case 'Date':
        case 'cf-date':
            html = `${indent}<input type="text" style="width: 100%; padding: 2px 4px; border: 1px solid #ccc; font-size: 10px; box-sizing: border-box;" />\n`;
            break;

        case 'cf-listbox':
        case 'List Box':
            html = `${indent}<select style="width: 100%; padding: 2px 4px; border: 1px solid #ccc; font-size: 10px; box-sizing: border-box;">\n`;
            // Leading blank option ensures default appears empty
            html += `${indent}  <option value=""></option>\n`;
            if (item.options && item.options.length > 0) {
                item.options.forEach((option) => {
                    html += `${indent}  <option value="${option.value || option.id}">${option.text}</option>\n`;
                });
            }
            html += `${indent}</select>\n`;
            break;

        case 'cf-checkbox':
            html = `${indent}<input type="checkbox" style="width: 13px; height: 13px;" />\n`;
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