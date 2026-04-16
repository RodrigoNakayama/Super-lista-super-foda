import { supabase } from './supabaseClient.js'

window.login = async function () {
  const email = document.getElementById('email').value
  const senha = document.getElementById('senha').value

  if (!email || !senha) {
    alert('Preencha e-mail e senha')
    return
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })

  if (error) {
    alert('Erro no login: ' + error.message)
    console.error('Login error:', error)
  } else {
    window.location.href = 'index.html'
  }
}

window.cadastro = async function () {
  const email = document.getElementById('email').value
  const senha = document.getElementById('senha').value

  if (!email || !senha) {
    alert('Preencha e-mail e senha')
    return
  }

  if (senha.length < 6) {
    alert('Senha deve ter pelo menos 6 caracteres')
    return
  }

  const { data, error } = await supabase.auth.signUp({ email, password: senha })

  if (error) {
    alert('Erro no cadastro: ' + error.message)
    console.error('Cadastro error:', error)
  } else {
    if (data.user?.identities?.length === 0) {
      alert('Este e-mail já está cadastrado! Faça login.')
    } else {
      alert('Cadastro realizado! Faça login.')
      document.getElementById('email').value = ''
      document.getElementById('senha').value = ''
    }
  }
}

document.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    const caminho = window.location.pathname
    if (caminho.includes('login.html') || caminho === '/' || caminho === '/login') {
      window.login()
    }
  }
})