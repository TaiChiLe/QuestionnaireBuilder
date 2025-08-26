// Advanced textual summary generator for questionnaire XML
// Preserves Statuses, ClinicalForms, and element attributes like sex on Information

export function buildAdvancedTextSummary(xmlString) {
    if (!xmlString || !xmlString.trim()) return 'No XML loaded.';
    let xmlDoc;
    try {
        const parser = new DOMParser();
        xmlDoc = parser.parseFromString(xmlString, 'text/xml');
        const errorNode = xmlDoc.querySelector('parsererror');
        if (errorNode) {
            return 'Invalid XML: ' + errorNode.textContent.trim();
        }
    } catch (e) {
        return 'Error parsing XML: ' + e.message;
    }

    const root = xmlDoc.documentElement;
    if (!root || root.tagName !== 'Questionnaire') {
        return 'Not a Questionnaire XML (missing <Questionnaire> root).';
    }

    const lines = [];
    const q = (v) => (v == null ? '' : String(v));
    const quote = (v) => '"' + (q(v).replace(/"/g, '\\"')) + '"';

    // --- STATUSES --- (exception: fixed header)
    const statusesParent = root.querySelector(':scope > Statuses');
    if (statusesParent) {
        const statusEls = Array.from(statusesParent.querySelectorAll(':scope > Status'));
        statusEls.forEach((st) => {
            const code = st.getAttribute('code') || '';
            const valTxt = st.textContent.trim();
            lines.push('=== STATUS ===');
            lines.push('  type: Status');
            if (code) lines.push(`  code: ${quote(code)}`);
            if (st.getAttribute('action')) {
                lines.push(`  action: ${quote(st.getAttribute('action'))}`);
            }
            if (valTxt) lines.push(`  value: ${quote(valTxt)}`);
            lines.push('');
        });
    }

    // --- CLINICAL FORMS --- (exception: fixed header)
    const clinicalFormsParent = root.querySelector(':scope > ClinicalForms');
    if (clinicalFormsParent) {
        const formEls = Array.from(clinicalFormsParent.querySelectorAll(':scope > Form'));
        formEls.forEach((f) => {
            const name = f.getAttribute('name') || '';
            lines.push('=== CLINICAL FORM ===');
            lines.push('  type: ClinicalForm');
            if (name) lines.push(`  name: ${quote(name)}`);
            if (f.getAttribute('code')) lines.push(`  code: ${quote(f.getAttribute('code'))}`);
            lines.push('');
        });
    }

    // Pages
    const pagesParent = root.querySelector(':scope > Pages');
    if (!pagesParent) {
        lines.push('No <Pages> section found.');
        return lines.join('\n');
    }

    const pageEls = Array.from(pagesParent.querySelectorAll(':scope > Page'));
    pageEls.forEach((page, pageIndex) => {
        const pageTitle = page.getAttribute('title') || `Page ${pageIndex + 1}`;
        lines.push(`=== ${pageTitle} ===`);
        lines.push('  type: Page');
        const pageCode = page.getAttribute('code');
        if (pageCode) lines.push(`  code: ${quote(pageCode)}`);
        lines.push('');

        // Iterate allowed children
        Array.from(page.children).forEach((child) => {
            switch (child.tagName) {
                case 'Question': {
                    const record = child.getAttribute('record') || '';
                    const required = child.getAttribute('required') || 'false';
                    const datatype = child.getAttribute('datatype');
                    const codeAttr = child.getAttribute('code');
                    const textEl = child.querySelector(':scope > Text');
                    const qText = textEl ? textEl.textContent.trim() : '';
                    const textRecord = textEl?.getAttribute('record') || '';
                    const answersWrapper = child.querySelector(':scope > Answers');
                    const answerEls = answersWrapper ? Array.from(answersWrapper.querySelectorAll(':scope > Answer')) : [];
                    const header = qText || record || 'Question';
                    lines.push(`=== ${header} ===`);
                    lines.push('  type: Question');
                    lines.push(`  record: ${quote(record)}`);
                    if (codeAttr) lines.push(`  code: ${quote(codeAttr)}`);
                    lines.push(`  required: ${quote(required)}`);
                    if (datatype) lines.push(`  datatype: ${quote(datatype)}`);
                    if (textRecord) lines.push(`  textRecord: ${quote(textRecord)}`);
                    lines.push(`  Answers (${answerEls.length} option${answerEls.length !== 1 ? 's' : ''}):`);
                    answerEls.forEach((ans, idx) => {
                        lines.push(`    ${idx + 1}. ${quote(ans.textContent.trim())}`);
                    });

                    // Visibility
                    const visibility = child.querySelector(':scope > Visibility');
                    if (visibility) {
                        const modeEl = visibility.querySelector(':scope > Any, :scope > All');
                        if (modeEl) {
                            lines.push('  Visibility Condition:');
                            lines.push(`    Mode: ${modeEl.tagName}`);
                            const condEls = Array.from(modeEl.querySelectorAll(':scope > Condition'));
                            condEls.forEach((c, cIdx) => {
                                lines.push(`    Condition ${cIdx + 1}:`);
                                lines.push(`      Depends on: ${quote(c.getAttribute('record') || '')}`);
                                lines.push(`      Answer must be: ${quote(c.getAttribute('answer') || '')}`);
                            });
                        }
                    }
                    lines.push('');
                    break;
                }
                case 'Field': {
                    const record = child.getAttribute('record') || '';
                    const required = child.getAttribute('required') || 'false';
                    const datatype = child.getAttribute('datatype');
                    const codeAttr = child.getAttribute('code');
                    // Mixed content minus Visibility child
                    let fieldText = '';
                    child.childNodes.forEach((n) => {
                        if (n.nodeType === Node.TEXT_NODE) fieldText += n.textContent;
                    });
                    fieldText = fieldText.trim();
                    const header = fieldText || record || 'Field';
                    lines.push(`=== ${header} ===`);
                    lines.push('  type: Field');
                    lines.push(`  record: ${quote(record)}`);
                    if (codeAttr) lines.push(`  code: ${quote(codeAttr)}`);
                    lines.push(`  required: ${quote(required)}`);
                    if (datatype) lines.push(`  datatype: ${quote(datatype)}`);
                    const visibility = child.querySelector(':scope > Visibility');
                    if (visibility) {
                        const modeEl = visibility.querySelector(':scope > Any, :scope > All');
                        if (modeEl) {
                            const condEls = Array.from(modeEl.querySelectorAll(':scope > Condition'));
                            if (condEls.length > 0) {
                                lines.push('  Visibility Condition:');
                                condEls.forEach((c, cIdx) => {
                                    lines.push(`    Condition ${cIdx + 1}:`);
                                    lines.push(`      Depends on: ${quote(c.getAttribute('record') || '')}`);
                                    lines.push(`      Answer must be: ${quote(c.getAttribute('answer') || '')}`);
                                });
                            }
                        }
                    }
                    lines.push('');
                    break;
                }
                case 'Information': {
                    const txt = child.textContent.trim();
                    const header = txt || 'Information';
                    lines.push(`=== ${header} ===`);
                    lines.push('  type: Information');
                    // Include custom attributes
                    Array.from(child.attributes).forEach((attr) => {
                        if (attr.name.toLowerCase() === 'sex') {
                            lines.push(`  Sex Visibility: ${quote(attr.value)}`);
                        } else {
                            lines.push(`  @${attr.name}: ${quote(attr.value)}`);
                        }
                    });
                    lines.push('');
                    break;
                }
                case 'Table': {
                    const required = child.getAttribute('required') || 'false';
                    const textEl = child.querySelector(':scope > Text');
                    const label = textEl ? textEl.textContent.trim() : '';
                    const textRecord = textEl?.getAttribute('record') || '';
                    const columns = Array.from(child.querySelectorAll(':scope > Column'));
                    const codeAttr = child.getAttribute('code');
                    const header = label || 'Table';
                    lines.push(`=== ${header} ===`);
                    lines.push('  type: Table');
                    if (codeAttr) lines.push(`  code: ${quote(codeAttr)}`);
                    lines.push(`  required: ${quote(required)}`);
                    if (textRecord) lines.push(`  textRecord: ${quote(textRecord)}`);
                    lines.push(`  Columns (${columns.length} column${columns.length !== 1 ? 's' : ''}):`);
                    columns.forEach((col, idx) => {
                        lines.push(`    Column ${idx + 1}:`);
                        lines.push(`      header: ${quote(col.getAttribute('header') || '')}`);
                        lines.push(`      required: ${quote(col.getAttribute('required') || 'false')}`);
                        if (col.getAttribute('code')) {
                            lines.push(`      code: ${quote(col.getAttribute('code'))}`);
                        }
                        if (col.getAttribute('datatype')) {
                            lines.push(`      datatype: ${quote(col.getAttribute('datatype'))}`);
                        }
                    });
                    // Visibility
                    const visibility = child.querySelector(':scope > Visibility');
                    if (visibility) {
                        const modeEl = visibility.querySelector(':scope > Any, :scope > All');
                        if (modeEl) {
                            const condEls = Array.from(modeEl.querySelectorAll(':scope > Condition'));
                            if (condEls.length > 0) {
                                lines.push('  Visibility Condition:');
                                condEls.forEach((c, cIdx) => {
                                    lines.push(`    Condition ${cIdx + 1}:`);
                                    lines.push(`      Depends on: ${quote(c.getAttribute('record') || '')}`);
                                    lines.push(`      Answer must be: ${quote(c.getAttribute('answer') || '')}`);
                                });
                            }
                        }
                    }
                    lines.push('');
                    break;
                }
                default:
                    break;
            }
        });
    });

    // Add code attributes for clinical forms if present (already processed earlier)
    // (Clinical Form output earlier only shows name; update that section retroactively is more complex;
    // for simplicity, we handled Forms inline above. If needed, restructure later.)
    if (lines[lines.length - 1] === '') lines.pop();
    return lines.join('\n');
}
