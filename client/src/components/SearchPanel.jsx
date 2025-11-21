import { useState } from 'react';
import { useTree } from '../context/TreeContext';
import { api } from '../services/api';
import './SearchPanel.css';

export default function SearchPanel() {
    const { persons, setSearchQuery, searchQuery } = useTree();
    const [validationErrors, setValidationErrors] = useState([]);
    const [showValidation, setShowValidation] = useState(false);

    const handleValidate = async () => {
        try {
            const errors = await api.validateTree();
            setValidationErrors(errors);
            setShowValidation(true);
            if (errors.length === 0) {
                alert('Keine Fehler gefunden! Der Stammbaum ist logisch konsistent.');
                setShowValidation(false);
            }
        } catch (err) {
            alert('Validierung fehlgeschlagen: ' + err.message);
        }
    };

    return (
        <div className="search-panel">
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Suche nach Namen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button onClick={handleValidate} className="btn-validate" title="Logik prüfen">
                    ⚠️
                </button>
            </div>

            {showValidation && validationErrors.length > 0 && (
                <div className="validation-results">
                    <div className="validation-header">
                        <h3>Logik-Fehler ({validationErrors.length})</h3>
                        <button onClick={() => setShowValidation(false)}>×</button>
                    </div>
                    <ul>
                        {validationErrors.map((err, i) => (
                            <li key={i} className="validation-error">
                                <strong>{err.name}</strong>: {err.message}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
