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

function setupImageModal() {
  const imageBtn = document.getElementById('imageBtn')
  const modal = document.getElementById('imageModal')
  const modalImage = document.getElementById('modalImage')
  const closeBtn = document.querySelector('.close')
  
  if (imageBtn && modal && modalImage) {
    const imageUrl = prompt('Digite o URL da imagem que deseja exibir:', 'https://via.placeholder.com/400x300?text=Sua+Imagem')
    
    if (imageUrl) {
      modalImage.src = imageUrl
    } else {
      modalImage.src = 'https://via.placeholder.com/400x300?text=Clique+no+botao+para+adicionar+uma+imagem'
    }
    
    imageBtn.onclick = function() {
      modal.style.display = 'block'
    }
    
    closeBtn.onclick = function() {
      modal.style.display = 'none'
    }
    
    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = 'none'
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme()
  
  const darkModeBtn = document.getElementById('darkModeBtn')
  if (darkModeBtn) {
    darkModeBtn.addEventListener('click', toggleDarkMode)
  }
  
  setupImageModal()
})