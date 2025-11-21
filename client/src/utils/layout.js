/**
 * Improved tree layout with partner grouping
 */
export const calculateLayout = (persons, relations) => {
    const nodes = persons.map(p => ({ ...p, x: 0, y: 0 }));
    const links = relations.map(r => ({ ...r }));

    // Find roots - people with no parents
    const childIds = new Set(relations.filter(r => r.type === 'parent_child').map(r => r.person2Id));
    const roots = nodes.filter(n => !childIds.has(n.id));

    // Assign levels (generations)
    const levels = {};
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
                queue.push({ id: partnerId, level: level });
            }
        });
    }

    // Handle disconnected nodes
    nodes.forEach(n => {
        if (levels[n.id] === undefined) levels[n.id] = 0;
    });

    // Group partners together
    const partnerGroups = [];
    const usedNodes = new Set();

    relations.filter(r => r.type === 'partner').forEach(rel => {
        if (!usedNodes.has(rel.person1Id) && !usedNodes.has(rel.person2Id)) {
            const person1 = nodes.find(n => n.id === rel.person1Id);
            const person2 = nodes.find(n => n.id === rel.person2Id);
            if (person1 && person2 && levels[person1.id] === levels[person2.id]) {
                partnerGroups.push([person1.id, person2.id]);
                usedNodes.add(person1.id);
                usedNodes.add(person2.id);
            }
        }
    });

    // Group by level
    const rows = {};
    nodes.forEach(n => {
        const lvl = levels[n.id];
        if (!rows[lvl]) rows[lvl] = [];

        // Check if this node is part of a partner group
        const group = partnerGroups.find(g => g.includes(n.id));
        if (group && !rows[lvl].some(item => Array.isArray(item) && item.some(id => group.includes(id)))) {
            // Add the whole partner group
            rows[lvl].push(group);
        } else if (!group && !usedNodes.has(n.id)) {
            // Add single node
            rows[lvl].push([n.id]);
        }
    });

    // Assign X and Y positions
    const LEVEL_HEIGHT = 200;
    const NODE_WIDTH = 160;
    const PARTNER_SPACING = 180; // Spacing between partners
    const GROUP_SPACING = 60; // Extra spacing between groups

    Object.keys(rows).forEach(lvl => {
        const rowItems = rows[lvl];

        // Calculate total width needed
        let totalWidth = 0;
        rowItems.forEach(item => {
            if (item.length === 2) {
                // Partner pair
                totalWidth += PARTNER_SPACING + NODE_WIDTH;
            } else {
                // Single person
                totalWidth += NODE_WIDTH;
            }
            totalWidth += GROUP_SPACING;
        });

        let startX = -totalWidth / 2;

        rowItems.forEach(item => {
            if (item.length === 2) {
                // Partner pair - place side by side
                const node1 = nodes.find(n => n.id === item[0]);
                const node2 = nodes.find(n => n.id === item[1]);

                node1.x = startX + NODE_WIDTH / 2;
                node1.y = Number(lvl) * LEVEL_HEIGHT;

                node2.x = startX + PARTNER_SPACING;
                node2.y = Number(lvl) * LEVEL_HEIGHT;

                startX += PARTNER_SPACING + NODE_WIDTH + GROUP_SPACING;
            } else {
                // Single person
                const node = nodes.find(n => n.id === item[0]);
                if (node) {
                    node.x = startX + NODE_WIDTH / 2;
                    node.y = Number(lvl) * LEVEL_HEIGHT;
                    startX += NODE_WIDTH + GROUP_SPACING;
                }
            }
        });
    });

    return { nodes, links };
};
