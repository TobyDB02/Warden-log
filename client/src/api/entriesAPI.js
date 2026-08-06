const API_BASE =
    process.env.REACT_APP_API_URL ||
    'http://localhost:5005/api';

async function handleResponse(response) {
    if (!response.ok) {
        const errorBody = await response
            .json()
            .catch(() => ({}));

        throw new Error(
            errorBody.error ||
            `Request failed with status ${response.status}`
        );
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

export async function checkServerHealth() {
    const response = await fetch(
        `${API_BASE}/health`,
        {
            cache: 'no-store'
        }
    );

    return handleResponse(response);
}

export async function checkDatabaseHealth() {
    const response = await fetch(
        `${API_BASE}/health/database`,
        {
            cache: 'no-store'
        }
    );

    return handleResponse(response);
}

export async function getLocations() {
    const response = await fetch(
        `${API_BASE}/locations`
    );

    return handleResponse(response);
}

export async function getAllEntries() {
    const response = await fetch(
        `${API_BASE}/entries`
    );

    return handleResponse(response);
}

export async function getEntryByStaffNumber(staffNumber) {
    const encodedStaffNumber =
        encodeURIComponent(staffNumber);

    const response = await fetch(
        `${API_BASE}/entries/${encodedStaffNumber}`
    );

    if (response.status === 404) {
        return null;
    }

    return handleResponse(response);
}

export async function createEntry(entry) {
    const response = await fetch(
        `${API_BASE}/entries`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(entry)
        }
    );

    return handleResponse(response);
}

export async function updateEntry(id, entry) {
    const response = await fetch(
        `${API_BASE}/entries/${id}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(entry)
        }
    );

    return handleResponse(response);
}

export async function deleteEntry(id) {
    const response = await fetch(
        `${API_BASE}/entries/${id}`,
        {
            method: 'DELETE'
        }
    );

    return handleResponse(response);
}