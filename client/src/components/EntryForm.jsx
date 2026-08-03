import { useEffect, useState } from 'react';
import {
    createEntry,
    deleteEntry,
    getEntryByStaffNumber,
    getLocations,
    updateEntry
} from '../api/entriesAPI';

const NAME_CHARACTERS_PATTERN =
    /^[\p{L}\p{M} '’\-]*$/u;

const COMPLETE_NAME_PATTERN =
    /^[\p{L}\p{M}]+(?:[ '’\-][\p{L}\p{M}]+)*$/u;

function normaliseValue(value) {
    return String(value ?? '')
        .trim()
        .toLocaleLowerCase('en-GB');
}

export default function EntryForm({ onEntriesChanged }) {
    const [locations, setLocations] = useState([]);
    const [staffNumber, setStaffNumber] = useState('');
    const [firstName, setFirstName] = useState('');
    const [surname, setSurname] = useState('');
    const [location, setLocation] = useState('');
    const [existingEntry, setExistingEntry] = useState(null);
    const [status, setStatus] = useState({
        type: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);

    const allFieldsComplete = Boolean(
        staffNumber.trim() &&
        firstName.trim() &&
        surname.trim() &&
        location
    );

    useEffect(() => {
        getLocations()
            .then(setLocations)
            .catch(() => {
                setStatus({
                    type: 'error',
                    message: 'Could not load locations'
                });
            });
    }, []);

    async function handleLookup() {
        const trimmedStaffNumber = staffNumber.trim();

        if (!trimmedStaffNumber) return;

        setStatus({
            type: '',
            message: ''
        });

        try {
            const entry = await getEntryByStaffNumber(
                trimmedStaffNumber
            );

            if (entry) {
                setExistingEntry(entry);
                setFirstName(entry.firstName);
                setSurname(entry.surname);
                setLocation(entry.location);

                setStatus({
                    type: 'info',
                    message: `Amend existing entry: ${entry.firstName} ${entry.surname}`
                });
            } else {
                setExistingEntry(null);
                setFirstName('');
                setSurname('');
                setLocation('');

                setStatus({
                    type: 'info',
                    message: 'Enter the staff member’s details'
                });
            }
        } catch (error) {
            setStatus({
                type: 'error',
                message: error.message
            });
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const trimmedStaffNumber = staffNumber.trim();
        const trimmedFirstName = firstName.trim();
        const trimmedSurname = surname.trim();

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

                setStatus({
                    type: 'success',
                    message: 'Your location has been updated'
                });
            } else {
                const created = await createEntry({
                    staffNumber: trimmedStaffNumber,
                    firstName: trimmedFirstName,
                    surname: trimmedSurname,
                    location
                });

                setExistingEntry(created);

                setStatus({
                    type: 'success',
                    message: 'Your location has been recorded'
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

    async function handleDelete() {
        if (!existingEntry) {
            setStatus({
                type: 'error',
                message: 'Please look up an existing entry first'
            });
            return;
        }

        if (!allFieldsComplete) {
            setStatus({
                type: 'error',
                message:
                    'Please complete all fields before deleting the entry'
            });
            return;
        }

        const detailsMatch =
            normaliseValue(staffNumber) ===
            normaliseValue(existingEntry.staffNumber) &&
            normaliseValue(firstName) ===
            normaliseValue(existingEntry.firstName) &&
            normaliseValue(surname) ===
            normaliseValue(existingEntry.surname) &&
            normaliseValue(location) ===
            normaliseValue(existingEntry.location);

        if (!detailsMatch) {
            setStatus({
                type: 'error',
                message:
                    'The name, surname and location must match the existing entry before it can be deleted'
            });
            return;
        }

        const confirmed = window.confirm(
            'Are you sure you want to delete this entry?'
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
            setStaffNumber('');
            setFirstName('');
            setSurname('');
            setLocation('');

            setStatus({
                type: 'success',
                message: 'Entry deleted'
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
            <h2>Fire Warden Check-in</h2>

            <div className="field-group">
                <label htmlFor="staffNumber">
                    Staff Number:
                </label>

                <input
                    id="staffNumber"
                    type="text"
                    value={staffNumber}
                    onChange={(event) =>
                        setStaffNumber(event.target.value)
                    }
                    onBlur={handleLookup}
                    disabled={loading}
                />
            </div>

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
                            const value = event.target.value;

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
                            const value = event.target.value;

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
                            setLocation(event.target.value)
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
                            ? 'Update Location'
                            : 'Record Location'}
                    </button>

                    {existingEntry && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={
                                loading ||
                                !allFieldsComplete
                            }
                            className="delete-btn"
                        >
                            Delete Entry
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