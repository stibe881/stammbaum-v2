const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const gedcom = require('gedcom');
const { Person, Relation } = require('../models');

const upload = multer({ dest: 'uploads/temp/' });

// Import GEDCOM
router.post('/import', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const content = fs.readFileSync(req.file.path, 'utf-8');
        const parsed = gedcom.parse(content);

        // Simple mapping logic (This is a simplified example)
        // Real GEDCOM parsing is complex. We'll try to extract basic Individuals and Families.

        // 1. Extract Individuals (INDI)
        const individuals = parsed.children.filter(c => c.tag === 'INDI');
        const idMap = {}; // GEDCOM ID -> DB ID

        for (const ind of individuals) {
            const id = ind.pointer;

            // Helper to find tag value
            const findTag = (parent, tag) => {
                const found = parent.children.find(c => c.tag === tag);
                return found ? found.value : null;
            };

            const nameNode = ind.children.find(c => c.tag === 'NAME');
            const name = nameNode ? nameNode.value.replace(/\//g, '') : 'Unknown';
            const [firstName, lastName] = name.split(' ').length > 1 ? name.split(' ') : [name, ''];

            const sex = findTag(ind, 'SEX');
            const birthNode = ind.children.find(c => c.tag === 'BIRT');
            const birthDate = birthNode ? findTag(birthNode, 'DATE') : null;

            const deathNode = ind.children.find(c => c.tag === 'DEAT');
            const deathDate = deathNode ? findTag(deathNode, 'DATE') : null;

            const person = await Person.create({
                firstName: firstName || 'Unknown',
                lastName: lastName || '',
                gender: sex === 'M' ? 'male' : sex === 'F' ? 'female' : 'other',
                // Note: Date parsing from GEDCOM string to DB Date is tricky and omitted for brevity
                // We would need a date parser here.
                bio: 'Imported from GEDCOM'
            });

            idMap[id] = person.id;
        }

        // 2. Extract Families (FAM) to create Relations
        const families = parsed.children.filter(c => c.tag === 'FAM');

        for (const fam of families) {
            const husb = fam.children.find(c => c.tag === 'HUSB')?.value; // Pointer
            const wife = fam.children.find(c => c.tag === 'WIFE')?.value; // Pointer
            const children = fam.children.filter(c => c.tag === 'CHIL').map(c => c.value);

            // Create Partner relation
            if (husb && wife && idMap[husb] && idMap[wife]) {
                await Relation.create({
                    person1Id: idMap[husb],
                    person2Id: idMap[wife],
                    type: 'partner',
                    subType: 'married'
                });
            }

            // Create Parent-Child relations
            if (children.length > 0) {
                for (const childPtr of children) {
                    if (!idMap[childPtr]) continue;

                    if (husb && idMap[husb]) {
                        await Relation.create({
                            person1Id: idMap[husb],
                            person2Id: idMap[childPtr],
                            type: 'parent_child',
                            subType: 'biological'
                        });
                    }
                    if (wife && idMap[wife]) {
                        await Relation.create({
                            person1Id: idMap[wife],
                            person2Id: idMap[childPtr],
                            type: 'parent_child',
                            subType: 'biological'
                        });
                    }
                }
            }
        }

        // Cleanup
        fs.unlinkSync(req.file.path);

        res.json({ message: `Imported ${individuals.length} individuals and ${families.length} families.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Export GEDCOM (Simplified)
router.get('/export', async (req, res) => {
    try {
        const persons = await Person.findAll();
        const relations = await Relation.findAll();

        let gedcomData = "0 HEAD\n1 SOUR STAMMBAUM_APP\n1 GEDC\n2 VERS 5.5.1\n2 FORM LINEAGE-LINKED\n1 CHAR UTF-8\n";

        // Individuals
        persons.forEach(p => {
            gedcomData += `0 @${p.id}@ INDI\n`;
            gedcomData += `1 NAME ${p.firstName} /${p.lastName}/\n`;
            gedcomData += `1 SEX ${p.gender === 'male' ? 'M' : p.gender === 'female' ? 'F' : 'U'}\n`;
            if (p.birthDate) {
                gedcomData += `1 BIRT\n2 DATE ${p.birthDate}\n`;
            }
            if (p.deathDate) {
                gedcomData += `1 DEAT\n2 DATE ${p.deathDate}\n`;
            }
        });

        // Families (Simplified: just grouping by parents for now is hard without more logic)
        // For this MVP export, we might just list individuals or try to reconstruct families.
        // Reconstructing FAM records from flat relations is non-trivial.
        // We will skip FAM export for this basic version or implement a simple one later.

        gedcomData += "0 TRLR\n";

        res.header('Content-Type', 'text/plain');
        res.attachment('stammbaum.ged');
        res.send(gedcomData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
