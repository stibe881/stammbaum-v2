import './RelationDialog.css';

export default function RelationDialog({ sourcePerson, targetPerson, onClose, onConfirm }) {
    if (!sourcePerson || !targetPerson) return null;

    return (
        <div className="relation-dialog-overlay">
            <div className="relation-dialog">
                <h3>Beziehung erstellen</h3>
                <p>
                    Wie stehen <strong>{sourcePerson.firstName}</strong> und <strong>{targetPerson.firstName}</strong> zueinander?
                </p>

                <div className="relation-options">
                    <button
                        className="btn-option"
                        onClick={() => onConfirm('parent_child', 'biological')}
                    >
                        <strong>Elternteil - Kind</strong><br />
                        {sourcePerson.firstName} ist Elternteil von {targetPerson.firstName}
                    </button>

                    <button
                        className="btn-option"
                        onClick={() => onConfirm('partner', 'married')}
                    >
                        <strong>Partner</strong><br />
                        Verheiratet / Partnerschaft
                    </button>
                </div>

                <button className="btn-cancel" onClick={onClose}>Abbrechen</button>
            </div>
        </div>
    );
}
