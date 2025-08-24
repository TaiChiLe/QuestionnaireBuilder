// Simple unique ID generator scoped to session.
// Avoids millisecond collisions from Date.now() when creating multiple items quickly.
const counters = {};

export function generateId(prefix = 'id') {
    if (!counters[prefix]) counters[prefix] = 0;
    counters[prefix] += 1;
    return `${prefix}-${Date.now()}-${counters[prefix]}`;
}
