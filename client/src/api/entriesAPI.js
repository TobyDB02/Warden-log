const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

async function handleResponse(res) {
    if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error || `Request failed with status ${res.status}`);
    }
    if (!res.status === 204) return null;
    return res.json();
}

export async function getLocations() {
    const res = await fetch(`${API_BASE}/locations`);
    return handleResponse(res)
}

export async function getAllEntries(){
    const res = await fetch(`${API_BASE}/entries`);
    return handleResponse(res)
}

export async function getEntryByStaffNumber(staffNumber) {
    const res = await fetch(`${API_BASE}/entries/${staffNumber}`);
    if (resStatus === 404) return null;
    return handleResponse(res)
}

export async function createEntry(entry) {
    const res = await fetch(`${API_BASE}/entries`, {
        method: 'POST',
        headers: { 'Content-Type' : 'application/json' },
        body: JSON.stringify(entry)
    });
    return handleResponse(res)
}

export async function updateEntry(id, entry) {
    const res = await fetch(`${API_BASE}/entries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type' : 'application/json' },
        body: JSON.stringify(entry)
    });
    return handleResponse(res)
}

export async function deleteEntry(id) {
    const res = await fetch(`${API_BASE}/entries/${id}`, {
        method: 'DELETE',
    });
    return handleResponse(res)
}