function initTheme() {
  const savedTheme = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.setAttribute('data-theme', 'dark')
    updateToggleButton('dark')
  } else {
    document.documentElement.setAttribute('data-theme', 'light')
    updateToggleButton('light')
  }
}

function updateToggleButton(theme) {
  const toggleBtn = document.getElementById('themeToggle')
  if (toggleBtn) {
    toggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙'
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme')
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
  
  document.documentElement.setAttribute('data-theme', newTheme)
  localStorage.setItem('theme', newTheme)
  updateToggleButton(newTheme)
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme()
  
  const toggleBtn = document.getElementById('themeToggle')
  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleTheme)
  }
})