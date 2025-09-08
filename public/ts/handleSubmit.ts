export const handleFormSubmit = async (event : Event, endpoint: string, action: (rep : Response, result : any) => void) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    console.log(data);
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log(result);
        action(response, result);
    } catch (e) {
        console.error(e);
    }
}

export const handleMultiFormSubmit  = async (event : Event, endpoint: string, action: (rep : Response, result : any) => void) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    console.log(formData);
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: formData
        });

        const result = await response.json();
        console.log(result);
        action(response, result);
    } catch (e) {
        console.error(e);
    }
}