/**
 * HTML Converter Utility
 * Converts questionnaire structure to HTML preview
 */

/**
 * Converts an array of questionnaire items to HTML string
 * @param {Array} items - Array of questionnaire items
 * @param {number} level - Current nesting level for indentation
 * @returns {string} HTML string representation
 */
export const convertItemsToHtml = (items, level = 0) => {
  return items
    .map((item) => {
      const indent = '  '.repeat(level);
      let html = '';

      switch (item.type) {
        case 'page':
          html = `${indent}<div style="margin: 20px 0; padding: 20px; background-color: #ffffff; font-family: Arial, sans-serif;" data-id="${item.id}">\n`;
          html += `${indent}  <h2 style="margin: 0 0 10px 0; font-size: 18px; font-weight: bold; color: #333;">${
            item.title || item.label
          }</h2>\n`;
          html += `${indent}  <div style="background-color: #2196f3; height: 20px; margin-bottom: 20px; border-radius: 2px;"></div>\n`;
          if (item.children && item.children.length > 0) {
            html += convertItemsToHtml(item.children, level + 1);
          }
          html += `${indent}</div>\n`;
          break;

        case 'question':
          html = `${indent}<div style="margin: 15px 0;" data-id="${item.id}">\n`;
          html += `${indent}  <label style="display: block; margin-bottom: 8px; font-weight: normal; color: #333; font-size: 14px;">${
            item.label
          }${
            item.required ? ' <span style="color: #f44336;">*</span>' : ''
          }</label>\n`;

          if (item.answers && item.answers.length > 0) {
            if (item.dataType === 'List Box') {
              // Dropdown select
              html += `${indent}  <select name="${item.id}" style="width: 100%; padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px; background-color: white; font-size: 14px;">\n`;
              html += `${indent}    <option value="">-- Select --</option>\n`;
              item.answers.forEach((answer) => {
                html += `${indent}    <option value="${answer.id}">${answer.text}</option>\n`;
              });
              html += `${indent}  </select>\n`;
            } else if (item.dataType === 'Multi Select') {
              // Checkboxes
              html += `${indent}  <div style="margin: 8px 0;">\n`;
              item.answers.forEach((answer) => {
                html += `${indent}    <label style="display: block; margin: 6px 0; cursor: pointer; font-weight: normal;">\n`;
                html += `${indent}      <input type="checkbox" name="${item.id}" value="${answer.id}" style="margin-right: 8px;" />\n`;
                html += `${indent}      ${answer.text}\n`;
                html += `${indent}    </label>\n`;
              });
              html += `${indent}  </div>\n`;
            } else {
              // Radio buttons
              html += `${indent}  <div style="margin: 8px 0;">\n`;
              item.answers.forEach((answer) => {
                html += `${indent}    <label style="display: block; margin: 6px 0; cursor: pointer; font-weight: normal;">\n`;
                html += `${indent}      <input type="radio" name="${item.id}" value="${answer.id}" style="margin-right: 8px;" />\n`;
                html += `${indent}      ${answer.text}\n`;
                html += `${indent}    </label>\n`;
              });
              html += `${indent}  </div>\n`;
            }
          }

          if (item.children && item.children.length > 0) {
            html += convertItemsToHtml(item.children, level + 1);
          }
          html += `${indent}</div>\n`;
          break;

        case 'field':
          html = `${indent}<div style="margin: 15px 0;" data-id="${item.id}">\n`;
          html += `${indent}  <label style="display: block; margin-bottom: 8px; font-weight: normal; color: #333; font-size: 14px;">${
            item.label
          }${
            item.required ? ' <span style="color: #f44336;">*</span>' : ''
          }</label>\n`;

          if (item.dataType === 'Date') {
            html += `${indent}  <input type="text" name="${item.id}" placeholder="dd/mm/yyyy" style="width: 100%; padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;" />\n`;
          } else if (item.dataType === 'Text Area') {
            html += `${indent}  <textarea name="${item.id}" placeholder="type here" rows="4" style="width: 100%; padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; resize: vertical;" ></textarea>\n`;
          } else {
            // Text Box (default)
            html += `${indent}  <input type="text" name="${item.id}" placeholder="type here" style="width: 100%; padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;" />\n`;
          }

          html += `${indent}</div>\n`;
          break;

        case 'information':
          html = `${indent}<div style="width: 100%;padding-bottom: 14px;">${item.label}</div>\n`;
          break;

        case 'table':
          html = `${indent}<div style="margin: 15px 0;" data-id="${item.id}">\n`;
          html += `${indent}  <label style="display: block; margin-bottom: 8px; font-weight: normal; color: #333; font-size: 14px;">${
            item.label
          }${
            item.required ? ' <span style="color: #f44336;">*</span>' : ''
          }</label>\n`;

          // Create proper HTML table
          if (item.children && item.children.length > 0) {
            html += `${indent}  <table style="width: 100%; border-collapse: collapse; border: 1px solid #ccc; background-color: white;">\n`;

            // Table header
            html += `${indent}    <thead>\n`;
            html += `${indent}      <tr>\n`;
            item.children.forEach((field) => {
              html += `${indent}        <th style="padding: 12px; border: 1px solid #ccc; text-align: left; font-weight: normal; color: #333;">${
                field.label
              }${
                field.required
                  ? ' <span style="color: #f44336;">*</span>'
                  : ''
              }</th>\n`;
            });
            // Add delete column header
            html += `${indent}        <th style="padding: 12px; border: 1px solid #ccc; text-align: center; font-weight: normal; color: #333; width: 50px;"></th>\n`;
            html += `${indent}      </tr>\n`;
            html += `${indent}    </thead>\n`;

            // Table body with sample row
            html += `${indent}    <tbody>\n`;
            html += `${indent}      <tr>\n`;
            item.children.forEach((field) => {
              html += `${indent}        <td style="padding: 12px; border: 1px solid #ccc;">\n`;
              if (field.dataType === 'Date') {
                html += `${indent}          <input type="text" placeholder="dd/mm/yyyy" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 3px; font-size: 14px;" />\n`;
              } else {
                html += `${indent}          <input type="text" placeholder="type here" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 3px; font-size: 14px;" />\n`;
              }
              html += `${indent}        </td>\n`;
            });
            // Add delete column with recycle bin icon
            html += `${indent}        <td style="padding: 12px; border: 1px solid #ccc; text-align: center;">\n`;
            html += `${indent}          <span style="font-size: 16px; color: #666;">🗑️</span>\n`;
            html += `${indent}        </td>\n`;
            html += `${indent}      </tr>\n`;
            html += `${indent}    </tbody>\n`;
            html += `${indent}  </table>\n`;

            // Add button for adding rows
            html += `${indent}  <button style="margin-top: 8px; padding: 6px 12px; background-color: #6c757d; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 12px;">+ Add</button>\n`;
          } else {
            // Empty table placeholder
            html += `${indent}  <div style="border: 1px solid #ccc; padding: 20px; background-color: #f9f9f9; border-radius: 4px; text-align: center; color: #666;">\n`;
            html += `${indent}    <em>Empty table - add table fields to see columns</em>\n`;
            html += `${indent}  </div>\n`;
          }

          html += `${indent}</div>\n`;
          break;

        case 'table-field':
          html = `${indent}<div style="margin: 8px 0; padding: 8px; border: 1px solid #ddd; border-radius: 3px; background-color: #fafafa;" data-id="${item.id}">\n`;
          html += `${indent}  <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Table Field</div>\n`;
          html += `${indent}  <div style="font-weight: 500; color: #333;">${
            item.label
          }${
            item.required ? ' <span style="color: #f44336;">*</span>' : ''
          }</div>\n`;
          if (item.datatype && item.datatype !== 'Text Box') {
            html += `${indent}  <div style="font-size: 11px; color: #888; margin-top: 2px;">Type: ${item.datatype}</div>\n`;
          }
          html += `${indent}</div>\n`;
          break;

        default:
          html = `${indent}<div style="margin: 10px 0; padding: 10px; border: 1px solid #ccc; border-radius: 4px;" data-id="${item.id}">${item.label}</div>\n`;
      }

      return html;
    })
    .join('');
};

/**
 * Generates HTML string from questionnaire items
 * @param {Array} droppedItems - Array of questionnaire items
 * @returns {string} Complete HTML string or empty string if no items
 */
export const generateHtmlPreview = (droppedItems) => {
  if (!droppedItems || droppedItems.length === 0) {
    return '';
  }
  
  return convertItemsToHtml(droppedItems);
};
