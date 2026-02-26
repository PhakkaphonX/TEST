/**
 * Toast notification utility
 */
let toastContainer = null

function ensureContainer() {
    if (!toastContainer) {
        toastContainer = document.createElement('div')
        toastContainer.className = 'toast-container'
        document.body.appendChild(toastContainer)
    }
    return toastContainer
}

export function showToast(message, type = 'success') {
    const container = ensureContainer()
    const toast = document.createElement('div')
    toast.className = `toast toast-${type}`
    toast.textContent = message
    container.appendChild(toast)

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in forwards'
        setTimeout(() => toast.remove(), 300)
    }, 3000)
}
