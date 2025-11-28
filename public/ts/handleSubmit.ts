const getToken = (): string | null => {
    return localStorage.getItem('authToken');
}

export const handleFormSubmit = async (event : Event, endpoint: string, action: (rep : Response, result : any) => void) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        const token = getToken();
        if (token) 
            headers['Authorization'] = `Bearer ${token}`;
        const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
        const result = await response.json();
        action(response, result);
    } catch (e) {
        console.error(e);
    }
}

export const handleMultiFormSubmit  = async (event : Event, endpoint: string, action: (rep : Response, result : any) => void) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
        const headers: HeadersInit = {};
        const token = getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: formData
        });
        const result = await response.json();
        action(response, result);
    } catch (e) {
        console.error(e);
    }
}