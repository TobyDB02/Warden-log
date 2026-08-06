import {
    useEffect,
    useState
} from 'react';

import {
    createEntry,
    deleteEntry,
    getLocations,
    updateEntry
} from '../api/entriesAPI';

const NAME_CHARACTERS_PATTERN =
    /^[\p{L}\p{M} '’\-]*$/u;

const COMPLETE_NAME_PATTERN =
    /^[\p{L}\p{M}]+(?:[ '’\-][\p{L}\p{M}]+)*$/u;

function formatTime(isoString) {
    if (!isoString) return '';

    const date = new Date(isoString);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

export default function EntryForm({
                                      staffNumber,
                                      initialEntry,
                                      onEntriesChanged
                                  }) {
    const [locations, setLocations] = useState([]);
    const [firstName, setFirstName] = useState('');
    const [surname, setSurname] = useState('');
    const [location, setLocation] = useState('');
    const [existingEntry, setExistingEntry] = useState(
        initialEntry
    );
    const [status, setStatus] = useState({
        type: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getLocations()
            .then((data) => {
                setLocations(
                    Array.isArray(data)
                        ? data
                        : []
                );
            })
            .catch(() => {
                setStatus({
                    type: 'error',
                    message: 'Could not load locations'
                });
            });
    }, []);

    useEffect(() => {
        setExistingEntry(initialEntry);

        if (initialEntry) {
            setFirstName(initialEntry.firstName ?? '');
            setSurname(initialEntry.surname ?? '');
            setLocation(initialEntry.location ?? '');

            setStatus({
                type: 'info',
                message:
                    `Existing entry found for ${initialEntry.firstName} ${initialEntry.surname}`
            });
        } else {
            setFirstName('');
            setSurname('');
            setLocation('');

            setStatus({
                type: 'info',
                message: 'Enter your details to sign in'
            });
        }
    }, [initialEntry]);

    async function handleSubmit(event) {
        event.preventDefault();

        const trimmedStaffNumber =
            String(staffNumber ?? '').trim();

        const trimmedFirstName =
            firstName.trim();

        const trimmedSurname =
            surname.trim();

        if (
            !trimmedStaffNumber ||
            !trimmedFirstName ||
            !trimmedSurname ||
            !location
        ) {
            setStatus({
                type: 'error',
                message: 'Please complete all fields'
            });
            return;
        }

        if (
            !COMPLETE_NAME_PATTERN.test(trimmedFirstName) ||
            !COMPLETE_NAME_PATTERN.test(trimmedSurname)
        ) {
            setStatus({
                type: 'error',
                message:
                    'Names may contain letters, spaces, apostrophes and hyphens only'
            });
            return;
        }

        setLoading(true);

        setStatus({
            type: '',
            message: ''
        });

        try {
            if (existingEntry) {
                const updated = await updateEntry(
                    existingEntry.id,
                    {
                        firstName: trimmedFirstName,
                        surname: trimmedSurname,
                        location
                    }
                );

                setExistingEntry(updated);

                const updatedTime = formatTime(
                    updated?.lastUpdated
                );

                setStatus({
                    type: 'success',
                    message: updatedTime
                        ? `Updated at ${updatedTime}`
                        : 'Your details have been updated'
                });
            } else {
                const created = await createEntry({
                    staffNumber: trimmedStaffNumber,
                    firstName: trimmedFirstName,
                    surname: trimmedSurname,
                    location
                });

                setExistingEntry(created);

                const signedInTime = formatTime(
                    created?.lastUpdated
                );

                setStatus({
                    type: 'success',
                    message: signedInTime
                        ? `Signed in at ${signedInTime}`
                        : 'Signed in successfully'
                });
            }

            onEntriesChanged?.();
        } catch (error) {
            setStatus({
                type: 'error',
                message: error.message
            });
        } finally {
            setLoading(false);
        }
    }

    async function handleSignOut() {
        if (!existingEntry) {
            setStatus({
                type: 'error',
                message: 'You are not currently signed in'
            });
            return;
        }

        const confirmed = window.confirm(
            `Sign out from ${existingEntry.location}?`
        );

        if (!confirmed) return;

        setLoading(true);

        setStatus({
            type: '',
            message: ''
        });

        try {
            await deleteEntry(existingEntry.id);

            setExistingEntry(null);
            setFirstName('');
            setSurname('');
            setLocation('');

            setStatus({
                type: 'success',
                message: 'Signed out successfully'
            });

            onEntriesChanged?.();
        } catch (error) {
            setStatus({
                type: 'error',
                message: error.message
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="entry-form">
            <form onSubmit={handleSubmit}>
                <div className="field-group">
                    <label htmlFor="firstName">
                        First Name:
                    </label>

                    <input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(event) => {
                            const value =
                                event.target.value;

                            if (
                                NAME_CHARACTERS_PATTERN.test(value)
                            ) {
                                setFirstName(value);
                            }
                        }}
                        disabled={loading}
                        autoComplete="given-name"
                    />
                </div>

                <div className="field-group">
                    <label htmlFor="surname">
                        Surname:
                    </label>

                    <input
                        id="surname"
                        type="text"
                        value={surname}
                        onChange={(event) => {
                            const value =
                                event.target.value;

                            if (
                                NAME_CHARACTERS_PATTERN.test(value)
                            ) {
                                setSurname(value);
                            }
                        }}
                        disabled={loading}
                        autoComplete="family-name"
                    />
                </div>

                <div className="field-group">
                    <label htmlFor="location">
                        Location:
                    </label>

                    <select
                        id="location"
                        value={location}
                        onChange={(event) =>
                            setLocation(
                                event.target.value
                            )
                        }
                        disabled={loading}
                    >
                        <option value="">
                            -- Select a location --
                        </option>

                        {locations.map((locationName) => (
                            <option
                                key={locationName}
                                value={locationName}
                            >
                                {locationName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="field-group">
                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {existingEntry
                            ? 'Update'
                            : 'Sign In'}
                    </button>

                    {existingEntry && (
                        <button
                            type="button"
                            onClick={handleSignOut}
                            disabled={loading}
                            className="delete-btn"
                        >
                            Sign Out
                        </button>
                    )}
                </div>
            </form>

            {status.message && (
                <p
                    role={
                        status.type === 'error'
                            ? 'alert'
                            : 'status'
                    }
                    className={`status-message ${status.type}`}
                >
                    {status.message}
                </p>
            )}
        </div>
    );
}