import { supabase } from './supabaseClient.js'

const lista = document.getElementById('lista')
const itemInput = document.getElementById('item')
const selecionarTodosBtn = document.getElementById('selecionarTodos')
const deletarSelecionadosBtn = document.getElementById('deletarSelecionados')
const aumentarSelecionadosBtn = document.getElementById('aumentarSelecionados')
const diminuirSelecionadosBtn = document.getElementById('diminuirSelecionados')

let currentUser = null
let columnNames = { nome: 'nome', completed: 'completed' }
let pollingInterval = null
let realtimeChannel = null
let itemsCache = []
let selectedItems = new Set()

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
    emptyLi.innerHTML = '<span style="text-align:center; width:100%">✨ Lista vazia. Adicione itens acima!</span>'
    emptyLi.style.justifyContent = 'center'
    emptyLi.style.opacity = '0.7'
    emptyLi.style.fontStyle = 'italic'
    emptyLi.style.cursor = 'default'
    lista.appendChild(emptyLi)
    return
  }
  
  itemsCache.forEach(item => {
    const quantidade = item.quantidade || 1
    const li = document.createElement('li')
    li.setAttribute('data-id', item.id)
    if (selectedItems.has(item.id)) {
      li.classList.add('selected')
    }
    
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.className = 'item-checkbox'
    checkbox.checked = selectedItems.has(item.id)
    checkbox.onchange = (e) => {
      e.stopPropagation()
      toggleSelectItem(item.id, checkbox.checked)
    }
    
    const span = document.createElement('span')
    span.className = 'item-name'
    if (quantidade > 1) {
      span.textContent = `${item[columnNames.nome]} (${quantidade}x)`
    } else {
      span.textContent = item[columnNames.nome]
    }
    if (item.completed) span.style.textDecoration = 'line-through'
    
    const quantidadeContainer = document.createElement('div')
    quantidadeContainer.className = 'quantidade-container'
    
    const diminuirBtn = document.createElement('button')
    diminuirBtn.textContent = '-'
    diminuirBtn.className = 'qtd-btn'
    diminuirBtn.onclick = (e) => {
      e.stopPropagation()
      alterarQuantidade(item.id, quantidade - 1, span, item[columnNames.nome])
    }
    
    const quantidadeSpan = document.createElement('span')
    quantidadeSpan.className = 'quantidade-valor'
    quantidadeSpan.textContent = quantidade
    quantidadeSpan.setAttribute('data-id', item.id)
    
    const aumentarBtn = document.createElement('button')
    aumentarBtn.textContent = '+'
    aumentarBtn.className = 'qtd-btn'
    aumentarBtn.onclick = (e) => {
      e.stopPropagation()
      alterarQuantidade(item.id, quantidade + 1, span, item[columnNames.nome])
    }
    
    quantidadeContainer.appendChild(diminuirBtn)
    quantidadeContainer.appendChild(quantidadeSpan)
    quantidadeContainer.appendChild(aumentarBtn)
    
    const deleteBtn = document.createElement('button')
    deleteBtn.textContent = '🗑️'
    deleteBtn.className = 'delete-btn'
    deleteBtn.onclick = (e) => {
      e.stopPropagation()
      deleteItem(item.id, li)
    }
    
    li.appendChild(checkbox)
    li.appendChild(span)
    li.appendChild(quantidadeContainer)
    li.appendChild(deleteBtn)
    
    li.onclick = (e) => {
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
        toggleItem(item.id, !item.completed, span)
      }
    }
    
    lista.appendChild(li)
  })
  
  updateSelecionadosButtons()
}

async function alterarQuantidade(id, novaQuantidade, spanElement, nomeItem) {
  if (novaQuantidade < 1) {
    if (confirm('Deseja remover este item?')) {
      const li = document.querySelector(`li[data-id="${id}"]`)
      if (li) {
        await deleteItem(id, li)
      }
    }
    return
  }
  
  if (typeof window.removePoints !== 'undefined') {
    if (!window.removePoints(2)) {
      showPointsMessage(`Pontos insuficientes! Custaria 2 pontos para alterar quantidade!`, 'error')
      return
    }
  }
  
  const { error } = await supabase
    .from('lista_compras')
    .update({ quantidade: novaQuantidade })
    .eq('id', id)
  
  if (error) {
    console.error('Erro ao alterar quantidade:', error)
    showPointsMessage('Erro ao alterar quantidade!', 'error')
    if (typeof window.addPoints !== 'undefined') {
      window.addPoints(2)
    }
    return
  }
  
  const quantidadeSpan = document.querySelector(`.quantidade-valor[data-id="${id}"]`)
  if (quantidadeSpan) {
    quantidadeSpan.textContent = novaQuantidade
  }
  
  if (spanElement) {
    if (novaQuantidade > 1) {
      spanElement.textContent = `${nomeItem} (${novaQuantidade}x)`
    } else {
      spanElement.textContent = nomeItem
    }
  }
  
  const item = itemsCache.find(i => i.id === id)
  if (item) {
    item.quantidade = novaQuantidade
  }
  
  showPointsMessage(`Quantidade alterada! -2 pontos`, 'success')
}

function toggleSelectItem(id, isSelected) {
  if (isSelected) {
    selectedItems.add(id)
  } else {
    selectedItems.delete(id)
  }
  
  const li = document.querySelector(`li[data-id="${id}"]`)
  if (li) {
    if (isSelected) {
      li.classList.add('selected')
    } else {
      li.classList.remove('selected')
    }
  }
  
  updateSelecionadosButtons()
}

function selecionarTodos() {
  if (selectedItems.size === itemsCache.length && itemsCache.length > 0) {
    selectedItems.clear()
  } else {
    itemsCache.forEach(item => {
      selectedItems.add(item.id)
    })
  }
  
  renderList()
}

function updateSelecionadosButtons() {
  const count = selectedItems.size
  const selecionarTodosBtn = document.getElementById('selecionarTodos')
  const deletarSelecionadosBtn = document.getElementById('deletarSelecionados')
  const aumentarSelecionadosBtn = document.getElementById('aumentarSelecionados')
  const diminuirSelecionadosBtn = document.getElementById('diminuirSelecionados')
  
  if (selecionarTodosBtn) {
    if (selectedItems.size === itemsCache.length && itemsCache.length > 0) {
      selecionarTodosBtn.textContent = 'Desselecionar Todos'
    } else {
      selecionarTodosBtn.textContent = 'Selecionar Todos'
    }
  }
  
  const hasSelection = count > 0
  if (deletarSelecionadosBtn) deletarSelecionadosBtn.disabled = !hasSelection
  if (aumentarSelecionadosBtn) aumentarSelecionadosBtn.disabled = !hasSelection
  if (diminuirSelecionadosBtn) diminuirSelecionadosBtn.disabled = !hasSelection
}

async function deletarSelecionados() {
  if (selectedItems.size === 0) return
  
  const custoTotal = selectedItems.size * 5
  
  if (typeof window.removePoints !== 'undefined') {
    if (!window.removePoints(custoTotal)) {
      showPointsMessage(`Pontos insuficientes! Custaria ${custoTotal} pontos para remover ${selectedItems.size} itens!`, 'error')
      return
    }
  }
  
  const idsToDelete = Array.from(selectedItems)
  
  for (const id of idsToDelete) {
    const { error } = await supabase
      .from('lista_compras')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Erro ao deletar item:', error)
      if (typeof window.addPoints !== 'undefined') {
        window.addPoints(5)
      }
    }
  }
  
  selectedItems.clear()
  showPointsMessage(`${idsToDelete.length} itens removidos! -${custoTotal} pontos`, 'success')
  await loadItems()
}

async function alterarQuantidadeSelecionados(incremento) {
  if (selectedItems.size === 0) return
  
  const itemsToUpdate = itemsCache.filter(item => selectedItems.has(item.id))
  const custoTotal = itemsToUpdate.length * 2
  
  if (typeof window.removePoints !== 'undefined') {
    if (!window.removePoints(custoTotal)) {
      showPointsMessage(`Pontos insuficientes! Custaria ${custoTotal} pontos para alterar ${itemsToUpdate.length} itens!`, 'error')
      return
    }
  }
  
  for (const item of itemsToUpdate) {
    const quantidadeAtual = item.quantidade || 1
    const novaQuantidade = Math.max(1, quantidadeAtual + incremento)
    
    if (novaQuantidade !== quantidadeAtual) {
      const { error } = await supabase
        .from('lista_compras')
        .update({ quantidade: novaQuantidade })
        .eq('id', item.id)
      
      if (error) {
        console.error('Erro ao alterar quantidade:', error)
      } else {
        item.quantidade = novaQuantidade
      }
    }
  }
  
  showPointsMessage(`${itemsToUpdate.length} itens alterados! -${custoTotal} pontos`, 'success')
  renderList()
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
  
  selectedItems.delete(id)
  
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
    quantidade: 1,
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

if (selecionarTodosBtn) selecionarTodosBtn.addEventListener('click', selecionarTodos)
if (deletarSelecionadosBtn) deletarSelecionadosBtn.addEventListener('click', deletarSelecionados)
if (aumentarSelecionadosBtn) aumentarSelecionadosBtn.addEventListener('click', () => alterarQuantidadeSelecionados(1))
if (diminuirSelecionadosBtn) diminuirSelecionadosBtn.addEventListener('click', () => alterarQuantidadeSelecionados(-1))

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