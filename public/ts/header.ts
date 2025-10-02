export const setupHeader = () => {
    const profilePicture = document.getElementById('profile-picture-header') as HTMLImageElement;
    const userPicture = localStorage.getItem('picture');
    if (profilePicture) {
        if (userPicture) {
            profilePicture.src = userPicture;
        }
    }
}