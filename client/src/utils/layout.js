/**
 * Calculates positions for a tree layout.
 * This is a simplified version. In a real app, we'd use a library like dagre or d3-hierarchy,
 * or implement a full Reingold-Tilford algorithm.
 * 
 * For now, we just arrange them by generation (y) and distribute them horizontally (x).
 */
export const calculateLayout = (persons, relations) => {
    const nodes = persons.map(p => ({ ...p, x: 0, y: 0 }));
    const links = relations.map(r => ({ ...r }));

    // 1. Identify generations (simplified: just use birthDate to sort roughly)
    // In a real tree, we'd traverse relations.
    // Let's try to find root(s) - people with no parents in the list

    const childIds = new Set(relations.filter(r => r.type === 'parent_child').map(r => r.person2Id));
    const roots = nodes.filter(n => !childIds.has(n.id));

    // Assign levels (generations)
    const levels = {}; // id -> level
    const queue = roots.map(r => ({ id: r.id, level: 0 }));
    const visited = new Set();

    while (queue.length > 0) {
        const { id, level } = queue.shift();
        if (visited.has(id)) continue;
        visited.add(id);
        levels[id] = level;

        // Find children
        const childrenRels = relations.filter(r => r.type === 'parent_child' && r.person1Id === id);
        childrenRels.forEach(r => {
            queue.push({ id: r.person2Id, level: level + 1 });
        });

        // Find partners (same level)
        const partnerRels = relations.filter(r => r.type === 'partner' && (r.person1Id === id || r.person2Id === id));
        partnerRels.forEach(r => {
            const partnerId = r.person1Id === id ? r.person2Id : r.person1Id;
            if (!visited.has(partnerId)) {
                // Partners stay on same level usually, or we handle them specially.
                // For simplicity, let's say same level.
                queue.push({ id: partnerId, level: level });
            }
        });
    }

    // Handle disconnected nodes (assign level 0)
    nodes.forEach(n => {
        if (levels[n.id] === undefined) levels[n.id] = 0;
    });

    // Group by level
    const rows = {};
    nodes.forEach(n => {
        const lvl = levels[n.id];
        if (!rows[lvl]) rows[lvl] = [];
        rows[lvl].push(n);
    });

    // Assign X positions
    const LEVEL_HEIGHT = 150;
    const NODE_WIDTH = 180;
    const SPACING = 20;

    Object.keys(rows).forEach(lvl => {
        const rowNodes = rows[lvl];
        const totalWidth = rowNodes.length * (NODE_WIDTH + SPACING);
        let startX = -totalWidth / 2;

        rowNodes.forEach((n, i) => {
            n.x = startX + i * (NODE_WIDTH + SPACING);
            n.y = lvl * LEVEL_HEIGHT;
        });
    });

    return { nodes, links };
};
