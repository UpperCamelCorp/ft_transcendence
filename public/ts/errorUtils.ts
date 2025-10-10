export const invalidError = (input: HTMLInputElement, error: HTMLParagraphElement, str: string) => {
    error.textContent = str;
    error.classList.remove('hidden');
    input.classList.replace('border-[#475569]', 'border-[#FF0000]');
}

export const clearError = (input: HTMLInputElement, error: HTMLParagraphElement) => {
    error.textContent = "";
    error.classList.add('hidden');
    input.classList.replace('border-[#FF0000]', 'border-[#475569]');

}