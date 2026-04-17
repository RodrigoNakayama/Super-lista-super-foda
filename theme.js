const imageList = [
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=300&h=300&fit=crop',
    'src/'
]

function initTheme() {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark')
        updateDarkModeButton('dark')
    } else {
        document.documentElement.setAttribute('data-theme', 'light')
        updateDarkModeButton('light')
    }
}

function updateDarkModeButton(theme) {
    const darkModeBtn = document.getElementById('darkModeBtn')
    if (darkModeBtn) {
        darkModeBtn.textContent = theme === 'dark' ? '☀️' : '🌙'
    }
}

function toggleDarkMode() {
    const currentTheme = document.documentElement.getAttribute('data-theme')
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
    
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
    updateDarkModeButton(newTheme)
}

function getRandomImage() {
    const randomIndex = Math.floor(Math.random() * imageList.length)
    return imageList[randomIndex]
}

function showRandomImage() {
    const floatingImage = document.getElementById('floatingImage')
    const randomImage = document.getElementById('randomImage')
    
    if (floatingImage && randomImage) {
        const imageUrl = getRandomImage()
        randomImage.src = imageUrl
        
        floatingImage.classList.remove('hidden')
        
        setTimeout(() => {
            floatingImage.classList.add('show')
        }, 10)
    }
}

function hideFloatingImage() {
    const floatingImage = document.getElementById('floatingImage')
    if (floatingImage) {
        floatingImage.classList.remove('show')
        setTimeout(() => {
            floatingImage.classList.add('hidden')
        }, 500)
    }
}

function setupImageButton() {
    const imageBtn = document.getElementById('imageBtn')
    const closeImageBtn = document.getElementById('closeImageBtn')
    
    if (imageBtn) {
        imageBtn.addEventListener('click', showRandomImage)
    }
    
    if (closeImageBtn) {
        closeImageBtn.addEventListener('click', hideFloatingImage)
    }
    
    const floatingImage = document.getElementById('floatingImage')
    if (floatingImage) {
        floatingImage.addEventListener('click', function(e) {
            if (e.target === floatingImage) {
                hideFloatingImage()
            }
        })
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme()
    
    const darkModeBtn = document.getElementById('darkModeBtn')
    if (darkModeBtn) {
        darkModeBtn.addEventListener('click', toggleDarkMode)
    }
    
    setupImageButton()
})