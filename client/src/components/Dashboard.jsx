import {
    useCallback,
    useEffect,
    useState
} from 'react';

import { getAllEntries } from '../api/entriesAPI';

export default function Dashboard({ refreshKey }) {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadEntries = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const data = await getAllEntries();
            setEntries(Array.isArray(data) ? data : []);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadEntries();
    }, [loadEntries, refreshKey]);

    function formatTime(isoString) {
        if (!isoString) return '—';

        const date = new Date(isoString);

        if (Number.isNaN(date.getTime())) {
            return '—';
        }

        return date.toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h2>Fire Warden Locations</h2>

                <button
                    type="button"
                    onClick={loadEntries}
                    disabled={loading}
                >
                    {loading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {loading && <p>Loading entries...</p>}

            {error && (
                <p
                    role="alert"
                    className="status-message error"
                >
                    {error}
                </p>
            )}

            {!loading &&
                !error &&
                entries.length === 0 && (
                    <p>
                        No fire warden locations have been recorded yet.
                    </p>
                )}

            {!loading &&
                !error &&
                entries.length > 0 && (
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

                                <td>
                                    {entry.firstName}{' '}
                                    {entry.surname}
                                </td>

                                <td>{entry.location}</td>

                                <td>
                                    {formatTime(
                                        entry.lastUpdated
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
        </div>
    );
}