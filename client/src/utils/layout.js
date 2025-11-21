// utils/layout.js
// Calculates node positions for the family tree, grouping partners side‑by‑side.
export const calculateLayout = (persons, relations) => {
    // Initialise nodes with placeholder coordinates
    const nodes = persons.map(p => ({ ...p, x: 0, y: 0 }));
    const links = relations.map(r => ({ ...r }));

    // ---------- Determine generation levels ----------
    const childIds = new Set(
        relations.filter(r => r.type === 'parent_child').map(r => r.person2Id)
    );
    const roots = nodes.filter(n => !childIds.has(n.id));

    const levels = {};
    const queue = roots.map(r => ({ id: r.id, level: 0 }));
    const visited = new Set();

    while (queue.length > 0) {
        const { id, level } = queue.shift();
        if (visited.has(id)) continue;
        visited.add(id);
        levels[id] = level;

        // children
        relations
            .filter(r => r.type === 'parent_child' && r.person1Id === id)
            .forEach(r => queue.push({ id: r.person2Id, level: level + 1 }));

        // partners on same level
        relations
            .filter(
                r =>
                    r.type === 'partner' &&
                    (r.person1Id === id || r.person2Id === id)
            )
            .forEach(r => {
                const partnerId = r.person1Id === id ? r.person2Id : r.person1Id;
                if (!visited.has(partnerId)) {
                    queue.push({ id: partnerId, level });
                }
            });
    }

    // Ensure every node has a level (isolated nodes)
    nodes.forEach(n => {
        if (levels[n.id] === undefined) levels[n.id] = 0;
    });

    // ---------- Build partner groups (only when on same level) ----------
    const partnerGroups = [];
    const used = new Set();
    relations
        .filter(r => r.type === 'partner')
        .forEach(r => {
            if (used.has(r.person1Id) || used.has(r.person2Id)) return;
            const p1 = nodes.find(n => n.id === r.person1Id);
            const p2 = nodes.find(n => n.id === r.person2Id);
            if (p1 && p2 && levels[p1.id] === levels[p2.id]) {
                partnerGroups.push([p1.id, p2.id]);
                used.add(p1.id);
                used.add(p2.id);
            }
        });

    // ---------- Organise rows per level ----------
    const rows = {};
    nodes.forEach(n => {
        const lvl = levels[n.id];
        if (!rows[lvl]) rows[lvl] = [];
        const group = partnerGroups.find(g => g.includes(n.id));
        if (group) {
            // avoid duplicate insertion of the same group
            if (!rows[lvl].some(item => Array.isArray(item) && item.includes(group[0]))) {
                rows[lvl].push(group);
            }
        } else if (!used.has(n.id)) {
            rows[lvl].push([n.id]);
        }
    });

    // ---------- Position nodes ----------
    const LEVEL_HEIGHT = 200;
    const NODE_WIDTH = 160;
    const PARTNER_SPACING = 180; // distance between two partners
    const GROUP_SPACING = 60; // extra space between groups

    Object.keys(rows).forEach(lvlStr => {
        const lvl = Number(lvlStr);
        const items = rows[lvl];
        // total width needed for this row
        let totalWidth = 0;
        items.forEach(item => {
            if (item.length === 2) totalWidth += NODE_WIDTH + PARTNER_SPACING;
            else totalWidth += NODE_WIDTH;
            totalWidth += GROUP_SPACING;
        });
        let startX = -totalWidth / 2;
        items.forEach(item => {
            if (item.length === 2) {
                const [id1, id2] = item;
                const n1 = nodes.find(n => n.id === id1);
                const n2 = nodes.find(n => n.id === id2);
                if (n1 && n2) {
                    n1.x = startX + NODE_WIDTH / 2;
                    n1.y = lvl * LEVEL_HEIGHT;
                    n2.x = startX + NODE_WIDTH / 2 + PARTNER_SPACING;
                    n2.y = lvl * LEVEL_HEIGHT;
                }
                startX += NODE_WIDTH + PARTNER_SPACING + GROUP_SPACING;
            } else {
                const [id] = item;
                const n = nodes.find(node => node.id === id);
                if (n) {
                    n.x = startX + NODE_WIDTH / 2;
                    n.y = lvl * LEVEL_HEIGHT;
                }
                startX += NODE_WIDTH + GROUP_SPACING;
            }
        });
    });

    return { nodes, links };
};
