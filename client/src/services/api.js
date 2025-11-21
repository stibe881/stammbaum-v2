const API_BASE = '/api';

export const api = {
    // Persons
    getPersons: async () => {
        const res = await fetch(`${API_BASE}/persons`);
        if (!res.ok) throw new Error('Failed to fetch persons');
        return res.json();
    },

    createPerson: async (personData) => {
        const res = await fetch(`${API_BASE}/persons`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(personData),
        });
        if (!res.ok) throw new Error('Failed to create person');
        return res.json();
    },

    updatePerson: async (id, personData) => {
        const res = await fetch(`${API_BASE}/persons/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(personData),
        });
        if (!res.ok) throw new Error('Failed to update person');
        return res.json();
    },

    deletePerson: async (id) => {
        const res = await fetch(`${API_BASE}/persons/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete person');
        return res.json();
    },

    // Relations
    getRelations: async () => {
        const res = await fetch(`${API_BASE}/relations`);
        if (!res.ok) throw new Error('Failed to fetch relations');
        return res.json();
    },

    createRelation: async (relationData) => {
        const res = await fetch(`${API_BASE}/relations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(relationData),
        });
        if (!res.ok) throw new Error('Failed to create relation');
        return res.json();
    },

    deleteRelation: async (id) => {
        const res = await fetch(`${API_BASE}/relations/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete relation');
        return res.json();
    },

    // Media
    uploadPhoto: async (personId, file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'photo');

        const res = await fetch(`${API_BASE}/media/upload/${personId}`, {
            method: 'POST',
            body: formData,
        });
        if (!res.ok) throw new Error('Failed to upload photo');
        return res.json();
    },

    // GEDCOM
    importGedcom: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`${API_BASE}/gedcom/import`, {
            method: 'POST',
            body: formData,
        });
        if (!res.ok) throw new Error('Failed to import GEDCOM');
        return res.json();
    },

    exportGedcom: () => {
        window.location.href = `${API_BASE}/gedcom/export`;
    },

    // Validation
    validateTree: async () => {
        const res = await fetch(`${API_BASE}/validate`);
        if (!res.ok) throw new Error('Failed to validate tree');
        return res.json();
    }
};
