import { useState, useEffect } from "react";
import { getAllEntries } from "../api/entriesAPI";

export default function Dashboard() {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadEntries();
    }, []);

    async function loadEntries() {
        setLoading(true);
        setError('');
        try {
            const data = await getAllEntries();
            setEntries(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    function formatTime(isoString) {
        return new Date(isoString).toLocaleDateString("en-Gb", {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h2>Fire Warden Locations</h2>
                <button onClick={loadEntries} disabled={loading}>
                    Refresh
                </button>
            </div>

            {loading && <p>Loading entries...</p>}
            {error && <p role="alert" className="status-meesage error">{error}</p>}

            {!loading && !error && entries.length === 0 && (
                <p>No fire warden locations have been recorded yet.</p>
            )}

            {!loading && !error && entries.length > 0 && (
                <table className="dashboard-table">
                    <thead>
                    <tr>
                        <th>Staff Number</th>
                        <th>Name</th>
                        <th>Location</th>
                        <th>Last Updated</th>
                    </tr>
                    </thead>
                    <tbody>
                        {entries.map((entry) => (
                            <tr key={entry.id}>
                                <td>{entry.staffNumber}</td>
                                <td>{entry.firstName}</td>
                                <td>{entry.location}</td>
                                <td>{formatTime(entry.lastUpdated)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}