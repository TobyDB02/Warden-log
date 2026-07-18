import { useState, useEffect } from 'react';
import { getLocations, getEntryByStaffNumber, createEntry, updateEntry, deleteEntry } from '../api/entriesAPI';

export default function EntryForm() {
    const [locations, setLocations] = useState([]);
    const [staffNumber, setStaffNumber] = useState('');
    const [firstName, setFirstName] = useState('');
    const [surname, setSurname] = useState('');
    const [location, setLocation] = useState('');
    const [existingEntry, setExistingEntry] = useState(null);
    const [status, setStatus] = useState({ type: '', message: ''});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getLocations()
            .then(setLocations)
            .catch(() => setStatus({ type: 'error', message: 'Could not load locations' }));
    }, []);

    async function handleLookup() {
        if (!staffNumber) return;
        setStatus({ type: '', message: ''});
        try {
            const entry = await getEntryByStaffNumber(staffNumber);
            if (entry) {
                setExistingEntry(entry);
                setFirstName(entry.firstName);
                setSurname(entry.surname);
                setLocation(entry.location);
                setStatus({ type: 'info', message: `Amend existing entry: ${entry.firstName} ${entry.surname}` });
            } else {
                setExistingEntry(null);
                setStatus({ type: 'info', message: 'Fill entry details: '});
            }
        } catch (error) {
            setStatus({ type: 'error', message: error.message });
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!staffNumber || !firstName || !surname || !location) {
            setStatus({ type: 'error', message: 'Please enter fields:'})
            return
        }

        setLoading(true);
        setStatus({ type: '', message: ''});

        try {
            if (existingEntry) {
                const updated = await updateEntry(existingEntry.id, { firstName, surname, location});
                setExistingEntry(updated);
                setStatus({ type: 'success', message: 'Your entry has been sucess' });
            } else {
                const created = await createEntry({ staffNumber, firstName, surname, location });
                setExistingEntry(created);
                setStatus({ type: 'success', message: 'Your location has been recorded' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: error.message });
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete() {
        if (!existingEntry) return;
        if (!window.confirm('Are you sure you want to delete this entry?')) return;

        setLoading(true);
        try {
            await deleteEntry(existingEntry.id);
            setExistingEntry(null);
            setFirstName('');
            setSurname('');
            setLocation('');
            setStatus({ type: 'success', message: 'Entry deleted' });
        } catch (error) {
            setStatus({ type: 'error', message: error.message });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="entry-form">
            <h2>Fire Warden Check-in</h2>

            <div className="field-group">
                <label htmlFor="staffNumber">Staff Number:</label>
                <input
                    id="staffNumber"
                    type="text"
                    value={staffNumber}
                    onChange={e => setStaffNumber(e.target.value)}
                    onBlur={() => handleLookup()}
                    disabled={loading}
                />
            </div>

            <form onSubmit={handleSubmit}>
                <div className="field-group">
                    <label htmlFor="firstName">First Name:</label>
                    <input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        disabled={loading}
                        />
                </div>

                <div className="field-group">
                    <label htmlFor="surname">Surname:</label>
                    <input
                        id="surname"
                        type="text"
                        value={surname}
                        onChange={e => setSurname(e.target.value)}
                        disabled={loading}
                        />
                </div>

                <div className="field-group">
                    <label htmlFor="location">Location:</label>
                    <select
                        id="location"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        disabled={loading}
                        >
                    <option value="">-- Select a location --</option>
                    {locations.map((location) => (
                        <option key={location} value={location}>{location}</option>
                    ))}
                    </select>
                </div>

                <div className="field-group">
                    <button type="submit" disabled={loading}>
                        {existingEntry ? 'Update Location' : 'Record Location'}
                    </button>
                    {existingEntry && (
                        <button type={"button"} onClick={handleDelete} disabled={loading} className={"delete-btn"}>
                            Delete Entry
                        </button>
                    )}
                </div>
            </form>

            {status.message && (
                <p role={"status"} className={`status-message ${status.type}`}>
                    {status.message}
                </p>
            )}
        </div>
    );

}