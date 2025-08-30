/**
 * Clinical Form Code Manager
 * Manages automatic code generation and incrementation for clinical form components
 * Uses a singleton pattern to ensure state is shared across all components
 */

// Singleton class to manage code counter state
class ClinicalFormCodeManager {
    constructor() {
        this.currentCodeCounter = 1;
    }

    /**
     * Get the next available code number
     * @returns {number} The next code number to use
     */
    getNextCodeNumber() {
        return this.currentCodeCounter++;
    }

    /**
     * Update the code counter based on existing items to ensure we don't create duplicates
     * @param {Array} droppedItems - Array of all dropped items
     */
    updateCodeCounter(droppedItems) {
        if (!droppedItems || droppedItems.length === 0) {
            this.currentCodeCounter = 1;
            return;
        }

        let maxCode = 0;

        const extractCodeNumbers = (items) => {
            items.forEach(item => {
                // Check if item has a code field and extract numeric value
                if (item.code) {
                    let codeNumber;
                    if (typeof item.code === 'number') {
                        codeNumber = item.code;
                    } else if (typeof item.code === 'string') {
                        // Extract numeric part from code (assuming format like "CODE123" or just "123")
                        const numericMatch = item.code.match(/(\d+)/);
                        if (numericMatch) {
                            codeNumber = parseInt(numericMatch[1], 10);
                        }
                    }

                    if (!isNaN(codeNumber) && codeNumber > maxCode) {
                        maxCode = codeNumber;
                    }
                }

                // Check options for codes (for cf-listbox, cf-radio, etc.)
                if (item.options && Array.isArray(item.options)) {
                    item.options.forEach(option => {
                        let optionValue;
                        if (typeof option.value === 'number') {
                            optionValue = option.value;
                        } else if (typeof option.value === 'string') {
                            const numericMatch = option.value.match(/(\d+)/);
                            if (numericMatch) {
                                optionValue = parseInt(numericMatch[1], 10);
                            }
                        }

                        if (!isNaN(optionValue) && optionValue > maxCode) {
                            maxCode = optionValue;
                        }
                    });
                }

                // Recursively check children (groups, panels, tables, etc.)
                if (item.children && Array.isArray(item.children) && item.children.length > 0) {
                    extractCodeNumbers(item.children);
                }
            });
        };

        extractCodeNumbers(droppedItems);

        // Set the next counter to be one more than the highest found code
        this.currentCodeCounter = maxCode + 1;
    }

    /**
     * Check for duplicate codes in the nested structure
     * @param {Array} droppedItems - Array of all dropped items
     * @returns {Array} Array of duplicate code information
     */
    findDuplicateCodes(droppedItems) {
        if (!droppedItems || droppedItems.length === 0) {
            return [];
        }

        const codeMap = new Map(); // Map of code -> array of items that use it
        const duplicates = [];

        const collectCodes = (items, path = []) => {
            items.forEach((item, index) => {
                const currentPath = [...path, index];

                // Debug logging
                console.log(`Checking item: ${item.type} (${item.id}) - Code: ${item.code}`);

                // Check item's own code - handle both string and numeric codes
                if (item.code !== undefined && item.code !== null && item.code !== '') {
                    // Normalize code to string for consistent comparison
                    const normalizedCode = String(item.code);
                    const key = `item-${item.id || 'unknown'}-code`;

                    if (!codeMap.has(normalizedCode)) {
                        codeMap.set(normalizedCode, []);
                    }
                    codeMap.get(normalizedCode).push({
                        type: 'item',
                        item: item,
                        path: currentPath,
                        field: 'code',
                        key: key
                    });

                    console.log(`  -> Added item code: ${normalizedCode}`);
                }

                // Check options for codes
                if (item.options && Array.isArray(item.options)) {
                    item.options.forEach((option, optionIndex) => {
                        if (option.value !== undefined && option.value !== null && option.value !== '') {
                            // Normalize option value to string for consistent comparison
                            const normalizedValue = String(option.value);
                            const key = `item-${item.id || 'unknown'}-option-${optionIndex}`;

                            if (!codeMap.has(normalizedValue)) {
                                codeMap.set(normalizedValue, []);
                            }
                            codeMap.get(normalizedValue).push({
                                type: 'option',
                                item: item,
                                option: option,
                                optionIndex: optionIndex,
                                path: currentPath,
                                field: 'value',
                                key: key
                            });

                            console.log(`  -> Added option value: ${normalizedValue} (${option.text})`);
                        }
                    });
                }

                // Recursively check children
                if (item.children && Array.isArray(item.children) && item.children.length > 0) {
                    console.log(`  -> Checking ${item.children.length} children of ${item.type}`);
                    collectCodes(item.children, currentPath);
                }
            });
        };

        console.log('=== Starting duplicate code detection ===');
        collectCodes(droppedItems);

        console.log('=== Code map contents ===');
        codeMap.forEach((items, code) => {
            console.log(`Code ${code}: ${items.length} items`);
            items.forEach(item => {
                console.log(`  - ${item.type}: ${item.item.type} (${item.item.id})`);
            });
        });

        // Find duplicates
        codeMap.forEach((items, code) => {
            if (items.length > 1) {
                duplicates.push({
                    code: code,
                    count: items.length,
                    items: items
                });
                console.log(`Duplicate found: Code ${code} used ${items.length} times`);
            }
        });

        console.log(`=== Found ${duplicates.length} duplicates ===`);
        return duplicates;
    }

    /**
     * Reset the code counter to 1
     */
    resetCodeCounter() {
        this.currentCodeCounter = 1;
    }

    /**
     * Set a specific starting value for the code counter
     * @param {number} value - The value to set the counter to
     */
    setCodeCounter(value) {
        if (typeof value === 'number' && value > 0) {
            this.currentCodeCounter = value;
        }
    }

    /**
     * Get the current code counter value
     * @returns {number} Current counter value
     */
    getCurrentCodeCounter() {
        return this.currentCodeCounter;
    }
}

// Create and export a single instance (singleton)
const codeManagerInstance = new ClinicalFormCodeManager();

// Export the instance methods
export const getNextCodeNumber = () => codeManagerInstance.getNextCodeNumber();
export const updateCodeCounter = (droppedItems) => codeManagerInstance.updateCodeCounter(droppedItems);
export const findDuplicateCodes = (droppedItems) => codeManagerInstance.findDuplicateCodes(droppedItems);
export const resetCodeCounter = () => codeManagerInstance.resetCodeCounter();
export const setCodeCounter = (value) => codeManagerInstance.setCodeCounter(value);
export const getCurrentCodeCounter = () => codeManagerInstance.getCurrentCodeCounter();

// Export the instance itself for direct access if needed
export default codeManagerInstance;
