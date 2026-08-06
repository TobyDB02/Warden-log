import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from 'react';

import {
    getAllEntries,
    getLocations
} from '../api/entriesAPI';

export default function Dashboard({ refreshKey }) {
    const [locations, setLocations] = useState([]);
    const [entries, setEntries] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadDashboard = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const [
                locationData,
                entryData
            ] = await Promise.all([
                getLocations(),
                getAllEntries()
            ]);

            setLocations(
                Array.isArray(locationData)
                    ? locationData
                    : []
            );

            setEntries(
                Array.isArray(entryData)
                    ? entryData
                    : []
            );
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard, refreshKey]);

    const rows = useMemo(() => {
        return locations.flatMap((locationName) => {
            const locationEntries = entries.filter(
                (entry) =>
                    entry.location === locationName
            );

            if (locationEntries.length === 0) {
                return [
                    {
                        key: `empty-${locationName}`,
                        location: locationName,
                        attended: false,
                        entry: null
                    }
                ];
            }

            return locationEntries.map((entry) => ({
                key: entry.id,
                location: locationName,
                attended: true,
                entry
            }));
        });
    }, [entries, locations]);

    const filteredRows = useMemo(() => {
        if (filter === 'unattended') {
            return rows.filter(
                (row) => !row.attended
            );
        }

        if (filter === 'attended') {
            return rows.filter(
                (row) => row.attended
            );
        }

        return rows;
    }, [filter, rows]);

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
                <h2>Location Coverage</h2>

                <button
                    type="button"
                    onClick={loadDashboard}
                    disabled={loading}
                >
                    {loading
                        ? 'Refreshing...'
                        : 'Refresh'}
                </button>
            </div>

            <div
                className="dashboard-filter"
                role="group"
                aria-label="Filter locations"
            >
                <button
                    type="button"
                    className={
                        filter === 'all'
                            ? 'dashboard-filter__button active'
                            : 'dashboard-filter__button'
                    }
                    aria-pressed={filter === 'all'}
                    onClick={() => setFilter('all')}
                >
                    All Locations
                </button>

                <button
                    type="button"
                    className={
                        filter === 'unattended'
                            ? 'dashboard-filter__button active'
                            : 'dashboard-filter__button'
                    }
                    aria-pressed={filter === 'unattended'}
                    onClick={() =>
                        setFilter('unattended')
                    }
                >
                    Unattended
                </button>

                <button
                    type="button"
                    className={
                        filter === 'attended'
                            ? 'dashboard-filter__button active'
                            : 'dashboard-filter__button'
                    }
                    aria-pressed={filter === 'attended'}
                    onClick={() =>
                        setFilter('attended')
                    }
                >
                    Attended
                </button>
            </div>

            {loading && (
                <p>Loading locations...</p>
            )}

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
                filteredRows.length > 0 && (
                    <table className="dashboard-table">
                        <thead>
                        <tr>
                            <th>Location</th>
                            <th>Status</th>
                            <th>Staff Number</th>
                            <th>Name</th>
                            <th>Last Updated</th>
                        </tr>
                        </thead>

                        <tbody>
                        {filteredRows.map((row) => (
                            <tr key={row.key}>
                                <td>
                                    {row.location}
                                </td>

                                <td>
                                        <span
                                            className={
                                                row.attended
                                                    ? 'coverage-status coverage-status--attended'
                                                    : 'coverage-status coverage-status--empty'
                                            }
                                        >
                                            {row.attended
                                                ? 'Attended'
                                                : 'Empty'}
                                        </span>
                                </td>

                                <td>
                                    {row.entry?.staffNumber ?? '—'}
                                </td>

                                <td>
                                    {row.entry
                                        ? `${row.entry.firstName} ${row.entry.surname}`
                                        : '—'}
                                </td>

                                <td>
                                    {formatTime(
                                        row.entry?.lastUpdated
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}

            {!loading &&
                !error &&
                filteredRows.length === 0 && (
                    <p>
                        No locations match the selected filter.
                    </p>
                )}
        </div>
    );
}