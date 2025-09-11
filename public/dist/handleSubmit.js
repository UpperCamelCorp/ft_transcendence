const getToken = () => {
    return localStorage.getItem('authToken');
};
export const handleFormSubmit = async (event, endpoint, action) => {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    console.log(data);
    try {
        const headers = {
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
        console.log(result);
        action(response, result);
    }
    catch (e) {
        console.error(e);
    }
};
export const handleMultiFormSubmit = async (event, endpoint, action) => {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    console.log(formData);
    try {
        const headers = {};
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
        console.log(result);
        action(response, result);
    }
    catch (e) {
        console.error(e);
    }
};
