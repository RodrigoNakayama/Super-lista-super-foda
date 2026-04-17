const imageList = [
    'src/image/does he know.jpg',
    'src/image/bait.jpg',
    'src/image/broly.jpg',
    'src/image/mrbreast.jpg',
    'src/image/tboi.jpg',
    'src/image/the goat.jpg',
    'src/image/truth.jpg',
    'src/image/asdfghjkl.jpg',
    'src/image/vegeta.jpg'
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