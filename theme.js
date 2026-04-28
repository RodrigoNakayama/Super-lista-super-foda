const imageList = [
    'src/image/does he know.jpg',
    'src/image/bait.jpg',
    'src/image/broly.jpg',
    'src/image/mrbreast.jpg',
    'src/image/tboi.jpg',
    'src/image/the goat.jpg',
    'src/image/truth.jpg',
    'src/image/asdfghjkl.jpg',
    'src/image/vegeta.jpg',
    'src/image/lowtiergod.jpg',
    'src/image/rato.jpg',
    'src/image/balatrito.jpg',
    'src/image/meu pai e seu amigo.jpg',
    'src/image/yuri.jpg',
    'src/image/sas.jpg',
    'src/image/balls.jpg',
    'src/image/bobs.jpg',
    'src/image/cokc.jpg',
    'src/image/homijpg',
    'src/image/hulc.jpg'
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

function getRandomPosition() {
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight
    const imageSize = 250
    
    const maxX = windowWidth - imageSize - 20
    const maxY = windowHeight - imageSize - 20
    
    const randomX = Math.random() * maxX
    const randomY = Math.random() * maxY
    
    return { x: Math.max(10, randomX), y: Math.max(10, randomY) }
}

let activeTimeout = null

function showRandomImage() {
    const floatingImage = document.getElementById('floatingImage')
    const randomImage = document.getElementById('randomImage')
    
    if (activeTimeout) {
        clearTimeout(activeTimeout)
        floatingImage.classList.remove('show')
        setTimeout(() => {
            showImage(randomImage, floatingImage)
        }, 50)
    } else {
        showImage(randomImage, floatingImage)
    }
}

function showImage(randomImage, floatingImage) {
    const imageUrl = getRandomImage()
    const position = getRandomPosition()
    
    randomImage.src = imageUrl
    
    floatingImage.style.left = position.x + 'px'
    floatingImage.style.top = position.y + 'px'
    floatingImage.style.transform = 'none'
    
    floatingImage.classList.remove('hidden')
    
    setTimeout(() => {
        floatingImage.classList.add('show')
    }, 10)
    
    activeTimeout = setTimeout(() => {
        floatingImage.classList.remove('show')
        setTimeout(() => {
            floatingImage.classList.add('hidden')
            activeTimeout = null
        }, 300)
    }, 800)
}

function setupImageButton() {
    const imageBtn = document.getElementById('imageBtn')
    
    if (imageBtn) {
        imageBtn.addEventListener('click', showRandomImage)
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