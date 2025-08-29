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
                if (item.code && typeof item.code === 'string') {
                    // Extract numeric part from code (assuming format like "CODE123" or just "123")
                    const numericMatch = item.code.match(/(\d+)/);
                    if (numericMatch) {
                        const codeNumber = parseInt(numericMatch[1], 10);
                        if (!isNaN(codeNumber) && codeNumber > maxCode) {
                            maxCode = codeNumber;
                        }
                    }
                }

                // Check options for codes (for cf-listbox, cf-radio, etc.)
                if (item.options && Array.isArray(item.options)) {
                    item.options.forEach(option => {
                        if (option.value && typeof option.value === 'string') {
                            const numericMatch = option.value.match(/(\d+)/);
                            if (numericMatch) {
                                const codeNumber = parseInt(numericMatch[1], 10);
                                if (!isNaN(codeNumber) && codeNumber > maxCode) {
                                    maxCode = codeNumber;
                                }
                            }
                        }
                    });
                }

                // Recursively check children
                if (item.children && item.children.length > 0) {
                    extractCodeNumbers(item.children);
                }
            });
        };

        extractCodeNumbers(droppedItems);

        // Set the next counter to be one more than the highest found code
        this.currentCodeCounter = maxCode + 1;
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
export const resetCodeCounter = () => codeManagerInstance.resetCodeCounter();
export const setCodeCounter = (value) => codeManagerInstance.setCodeCounter(value);
export const getCurrentCodeCounter = () => codeManagerInstance.getCurrentCodeCounter();

// Export the instance itself for direct access if needed
export default codeManagerInstance;
