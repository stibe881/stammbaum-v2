const { Person, Relation } = require('../models');

const validateTree = async () => {
    const persons = await Person.findAll();
    const relations = await Relation.findAll();
    const errors = [];

    const personMap = new Map(persons.map(p => [p.id, p]));

    // 1. Date Checks
    persons.forEach(p => {
        if (p.birthDate && p.deathDate) {
            if (new Date(p.birthDate) > new Date(p.deathDate)) {
                errors.push({
                    personId: p.id,
                    name: `${p.firstName} ${p.lastName}`,
                    type: 'date',
                    message: 'Sterbedatum liegt vor Geburtsdatum.'
                });
            }
        }
    });

    // 2. Parent-Child Date Checks
    relations.filter(r => r.type === 'parent_child').forEach(r => {
        const parent = personMap.get(r.person1Id);
        const child = personMap.get(r.person2Id);

        if (parent && child && parent.birthDate && child.birthDate) {
            if (new Date(parent.birthDate) >= new Date(child.birthDate)) {
                errors.push({
                    personId: parent.id, // Link to parent
                    name: `${parent.firstName} ${parent.lastName}`,
                    type: 'logic',
                    message: `Elternteil ist jünger als oder gleich alt wie Kind (${child.firstName} ${child.lastName}).`
                });
            }
        }
    });

    // 3. Circular Dependency Check (Simplified DFS)
    const adj = {};
    relations.filter(r => r.type === 'parent_child').forEach(r => {
        if (!adj[r.person1Id]) adj[r.person1Id] = [];
        adj[r.person1Id].push(r.person2Id);
    });

    const visited = new Set();
    const recursionStack = new Set();

    const hasCycle = (nodeId, path = []) => {
        visited.add(nodeId);
        recursionStack.add(nodeId);

        const children = adj[nodeId] || [];
        for (const childId of children) {
            if (!visited.has(childId)) {
                if (hasCycle(childId, [...path, nodeId])) return true;
            } else if (recursionStack.has(childId)) {
                const p = personMap.get(nodeId);
                errors.push({
                    personId: nodeId,
                    name: p ? `${p.firstName} ${p.lastName}` : 'Unknown',
                    type: 'cycle',
                    message: 'Zirkuläre Verwandtschaft entdeckt.'
                });
                return true;
            }
        }

        recursionStack.delete(nodeId);
        return false;
    };

    persons.forEach(p => {
        if (!visited.has(p.id)) {
            hasCycle(p.id);
        }
    });

    return errors;
};

module.exports = { validateTree };
