const URL = '/api';

async function fetchWithError(url, options) {
    const response = await fetch(url, options);
    const data = await response.json();

    if (response.ok) {
        return data;
    }
    else {
        throw data.error;
    }
}

export function getCats() {  
    const url = `${URL}/cats`;
    return fetchWithError(url);
}

export function getCat(id) {  
    const url = `${URL}/cats/${id}`;
    return fetchWithError(url);
}

export function addCat(cat) {
    const url = `${URL}/cats`;
    return fetchWithError(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(cat)
    });
}

export function getTypes(options) {
    const showAll = options && options.showAll;
    const url = `${URL}/types${showAll ? '?show=all' : ''}`;
    return fetchWithError(url);
}

export function addType(type) {
    const url = `${URL}/types`;
    return fetchWithError(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(type)
    });
}

export function updateType(type) {
    const url = `${URL}/types/${type.id}`;
    return fetchWithError(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(type)
    });
}

export function removeType(id) {
    const url = `${URL}/types/${id}`;
    return fetchWithError(url, {
        method: 'DELETE'
    });
}


