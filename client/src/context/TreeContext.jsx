import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const TreeContext = createContext();

export const useTree = () => {
    const context = useContext(TreeContext);
    if (!context) {
        throw new Error('useTree must be used within a TreeProvider');
    }
    return context;
};

export const TreeProvider = ({ children }) => {
    const [persons, setPersons] = useState([]);
    const [relations, setRelations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [personsData, relationsData] = await Promise.all([
                api.getPersons(),
                api.getRelations()
            ]);
            setPersons(personsData);
            setRelations(relationsData);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const addPerson = async (data) => {
        try {
            const newPerson = await api.createPerson(data);
            setPersons(prev => [...prev, newPerson]);
            return newPerson;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const updatePerson = async (id, data) => {
        try {
            const updated = await api.updatePerson(id, data);
            setPersons(prev => prev.map(p => p.id === id ? updated : p));
            return updated;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const deletePerson = async (id) => {
        try {
            await api.deletePerson(id);
            setPersons(prev => prev.filter(p => p.id !== id));
            setRelations(prev => prev.filter(r => r.person1Id !== id && r.person2Id !== id));
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const addRelation = async (data) => {
        try {
            const newRelation = await api.createRelation(data);
            setRelations(prev => [...prev, newRelation]);
            return newRelation;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    return (
        <TreeContext.Provider value={{
            persons,
            relations,
            loading,
            error,
            searchQuery,
            setSearchQuery,
            fetchData,
            addPerson,
            updatePerson,
            deletePerson,
            addRelation
        }}>
            {children}
        </TreeContext.Provider>
    );
};
