import { supabase } from './supabaseClient.js'

const lista = document.getElementById('lista')
const itemInput = document.getElementById('item')

let currentUser = null
let columnNames = { nome: 'nome', completed: 'completed' }
let pollingInterval = null
let realtimeChannel = null
let itemsCache = []

async function discoverColumns() {
  const { data, error } = await supabase
    .from('lista_compras')
    .select('*')
    .limit(1)
  
  if (error || !data || data.length === 0) {
    return
  }
  
  const cols = Object.keys(data[0])
  
  if (cols.includes('nome')) columnNames.nome = 'nome'
  else if (cols.includes('name')) columnNames.nome = 'name'
  else if (cols.includes('titulo')) columnNames.nome = 'titulo'
  else if (cols.includes('item')) columnNames.nome = 'item'
  
  if (cols.includes('completed')) columnNames.completed = 'completed'
  else if (cols.includes('feito')) columnNames.completed = 'feito'
  else if (cols.includes('concluido')) columnNames.completed = 'concluido'
  else if (cols.includes('check')) columnNames.completed = 'check'
  else if (cols.includes('status')) columnNames.completed = 'status'
  
  console.log('Colunas detectadas:', columnNames)
}

async function checkAuth() {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    window.location.href = 'login.html'
    return
  }
  
  currentUser = user
  await discoverColumns()
  await loadItems()
  setupRealtime()
  if (typeof updatePointsDisplay === 'function') {
    updatePointsDisplay()
  }
}

async function loadItems() {
  const { data, error } = await supabase
    .from('lista_compras')
    .select('*')
    .order('created_at', { ascending: true })
  
  if (error) {
    console.error('Erro ao carregar:', error)
    return
  }
  
  itemsCache = data || []
  renderList()
}

function renderList() {
  if (!lista) return
  
  lista.innerHTML = ''
  
  if (itemsCache.length === 0) {
    const emptyLi = document.createElement('li')
    emptyLi.textContent = '✨ Lista vazia. Adicione itens acima!'
    emptyLi.style.justifyContent = 'center'
    emptyLi.style.opacity = '0.7'
    emptyLi.style.fontStyle = 'italic'
    emptyLi.style.cursor = 'default'
    lista.appendChild(emptyLi)
    return
  }
  
  itemsCache.forEach(item => {
    const li = document.createElement('li')
    li.setAttribute('data-id', item.id)
    
    const span = document.createElement('span')
    span.textContent = item[columnNames.nome]
    const isCompleted = item[columnNames.completed]
    if (isCompleted) span.style.textDecoration = 'line-through'
    
    const deleteBtn = document.createElement('button')
    deleteBtn.textContent = '🗑️'
    deleteBtn.onclick = (e) => {
      e.stopPropagation()
      deleteItem(item.id, li)
    }
    
    li.appendChild(span)
    li.appendChild(deleteBtn)
    
    li.onclick = () => {
      toggleItem(item.id, !isCompleted, span)
    }
    
    lista.appendChild(li)
  })
}

window.adicionarItem = async function () {
  if (!itemInput) return
  
  const nome = itemInput.value.trim()
  
  if (!nome) {
    showPointsMessage('Digite um item para adicionar!', 'error')
    return
  }
  
  if (typeof window.removePoints !== 'undefined') {
    if (!window.removePoints(10)) {
      showPointsMessage('Pontos insuficientes! Gire os slots para ganhar pontos!', 'error')
      return
    }
  }
  
  const btn = document.querySelector('button[onclick="adicionarItem()"]')
  if (btn) {
    btn.disabled = true
    btn.style.opacity = '0.7'
  }
  
  const novoItem = {
    [columnNames.nome]: nome,
    [columnNames.completed]: false,
    user_id: currentUser.id
  }
  
  const { error } = await supabase
    .from('lista_compras')
    .insert([novoItem])
  
  if (btn) {
    btn.disabled = false
    btn.style.opacity = '1'
  }
  
  if (error) {
    console.error('Erro ao adicionar:', error)
    showPointsMessage('Erro ao adicionar item!', 'error')
    if (typeof window.addPoints !== 'undefined') {
      window.addPoints(10)
    }
    return
  }
  
  itemInput.value = ''
  itemInput.focus()
  showPointsMessage('Item adicionado! -10 pontos', 'success')
}

async function toggleItem(id, completed, spanElement) {
  const updateData = { [columnNames.completed]: completed }
  
  const { error } = await supabase
    .from('lista_compras')
    .update(updateData)
    .eq('id', id)
  
  if (error) {
    console.error('Erro ao atualizar:', error)
    return
  }
  
  if (spanElement) {
    if (completed) {
      spanElement.style.textDecoration = 'line-through'
    } else {
      spanElement.style.textDecoration = 'none'
    }
  }
}

async function deleteItem(id, liElement) {
  if (liElement.classList.contains('removing')) return
  
  if (typeof window.removePoints !== 'undefined') {
    if (!window.removePoints(5)) {
      showPointsMessage('Pontos insuficientes para remover! Gire os slots!', 'error')
      return
    }
  }
  
  liElement.classList.add('removing')
  liElement.style.animation = 'slideOut 0.25s ease-in forwards'
  
  setTimeout(async () => {
    const { error } = await supabase
      .from('lista_compras')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Erro ao deletar:', error)
      liElement.classList.remove('removing')
      liElement.style.animation = ''
      if (typeof window.addPoints !== 'undefined') {
        window.addPoints(5)
      }
      showPointsMessage('Erro ao remover item!', 'error')
    } else {
      showPointsMessage('Item removido! -5 pontos', 'success')
    }
  }, 200)
}

function setupRealtime() {
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel)
  }
  
  realtimeChannel = supabase
    .channel('lista_compras_realtime')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'lista_compras'
      },
      (payload) => {
        console.log('Evento recebido:', payload.eventType)
        loadItems()
      }
    )
    .subscribe((status) => {
      console.log('Realtime status:', status)
      
      if (status === 'SUBSCRIBED') {
        console.log('Realtime conectado')
        if (pollingInterval) {
          clearInterval(pollingInterval)
          pollingInterval = null
        }
      } else if (status === 'CHANNEL_ERROR') {
        console.log('Realtime indisponivel, usando polling')
        startPolling()
      }
    })
  
  setTimeout(() => {
    if (realtimeChannel && realtimeChannel.subscriptionStatus !== 'SUBSCRIBED') {
      console.log('Timeout no Realtime, ativando polling')
      startPolling()
    }
  }, 5000)
}

function startPolling() {
  if (pollingInterval) return
  console.log('Polling ativado (a cada 3 segundos)')
  pollingInterval = setInterval(() => {
    loadItems()
  }, 3000)
}

function showPointsMessage(message, type) {
  const pointsMessage = document.getElementById('pointsMessage')
  if (pointsMessage) {
    pointsMessage.textContent = message
    pointsMessage.className = 'points-message ' + type
    setTimeout(() => {
      if (pointsMessage.textContent === message) {
        pointsMessage.textContent = ''
        pointsMessage.className = 'points-message'
      }
    }, 2000)
  } else {
    alert(message)
  }
}

window.logout = async function () {
  if (pollingInterval) {
    clearInterval(pollingInterval)
  }
  if (realtimeChannel) {
    await supabase.removeChannel(realtimeChannel)
  }
  await supabase.auth.signOut()
  window.location.href = 'login.html'
}

const style = document.createElement('style')
style.textContent = `
  @keyframes slideOut {
    to {
      opacity: 0;
      transform: translateX(30px);
    }
  }
`
document.head.appendChild(style)

checkAuth()