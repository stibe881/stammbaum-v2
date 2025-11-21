import { useState } from 'react';
import { useTree } from '../context/TreeContext';
import { api } from '../services/api';
import './PersonForm.css';

export default function PersonForm({ onClose }) {
    const { addPerson } = useTree();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        birthDate: '',
        deathDate: '',
        gender: 'male',
        bio: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Convert empty strings to null for optional fields
            const cleanData = {
                ...formData,
                birthDate: formData.birthDate || null,
                deathDate: formData.deathDate || null,
                bio: formData.bio || null
            };

            const newPerson = await addPerson(cleanData);

            // Upload photo if selected
            const fileInput = document.getElementById('photo-upload');
            if (fileInput && fileInput.files[0]) {
                await api.uploadPhoto(newPerson.id, fileInput.files[0]);
            }

            onClose();
        } catch (err) {
            alert('Fehler beim Speichern: ' + err.message);
        }
    };

    return (
        <div className="person-form-overlay">
            <div className="person-form">
                <h2>Neue Person hinzufügen</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Vorname</label>
                        <input
                            type="text"
                            value={formData.firstName}
                            onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Nachname</label>
                        <input
                            type="text"
                            value={formData.lastName}
                            onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Geburtsdatum</label>
                            <input
                                type="date"
                                value={formData.birthDate}
                                onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Sterbedatum</label>
                            <input
                                type="date"
                                value={formData.deathDate}
                                onChange={e => setFormData({ ...formData, deathDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Geschlecht</label>
                        <select
                            value={formData.gender}
                            onChange={e => setFormData({ ...formData, gender: e.target.value })}
                        >
                            <option value="male">Männlich</option>
                            <option value="female">Weiblich</option>
                            <option value="other">Divers</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Foto</label>
                        <input type="file" id="photo-upload" accept="image/*" />
                    </div>

                    <div className="form-group">
                        <label>Biografie</label>
                        <textarea
                            value={formData.bio}
                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="btn-secondary">Abbrechen</button>
                        <button type="submit" className="btn-primary">Speichern</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
