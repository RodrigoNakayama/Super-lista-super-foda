const symbols = ['🍒', '🍋', '🍊', '🍉', '⭐', '💎', '7️⃣', '🔔']
let isSpinning = false
let userPoints = 100
let secretCode = ''
const targetCode = 'ILOVEYURI'

const pointValues = {
    '🍒🍒🍒': 10,
    '🍋🍋🍋': 15,
    '🍊🍊🍊': 20,
    '🍉🍉🍉': 25,
    '⭐⭐⭐': 50,
    '💎💎💎': 75,
    '7️⃣7️⃣7️⃣': 100,
    '🔔🔔🔔': 30
}

const confettiImages = [
    'src/image/yuri.jpg',
    'src/image/yuriv2.jpg'
]

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)]
}

function updatePointsDisplay() {
    const pointsDisplay = document.getElementById('pointsDisplay')
    if (pointsDisplay) {
        pointsDisplay.textContent = userPoints
    }
}

function addPoints(amount) {
    userPoints += amount
    updatePointsDisplay()
    showPointsMessage(`+${amount} pontos!`, 'gain')
}

function removePoints(amount) {
    userPoints -= amount
    updatePointsDisplay()
    showPointsMessage(`-${amount} ponto${amount > 1 ? 's' : ''}!`, 'lose')
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
    }
}

function launchConfetti(points) {
    const baseConfetti = 30
    const bonusConfetti = points * 2
    const totalConfetti = Math.min(baseConfetti + bonusConfetti, 200)
    
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight - 50
    
    for (let i = 0; i < totalConfetti; i++) {
        setTimeout(() => {
            const confetto = document.createElement('img')
            const randomImage = confettiImages[Math.floor(Math.random() * confettiImages.length)]
            
            const angle = (Math.random() * Math.PI * 2)
            const velocity = 300 + Math.random() * 400
            const timeToLive = 2 + Math.random() * 1.5
            
            const sizeBonus = points / 10
            const randomSize = Math.min(25 + sizeBonus + Math.random() * 45, 80)
            const randomRotation = Math.random() * 360
            
            confetto.src = randomImage
            confetto.style.position = 'fixed'
            confetto.style.left = centerX + 'px'
            confetto.style.top = centerY + 'px'
            confetto.style.width = randomSize + 'px'
            confetto.style.height = randomSize + 'px'
            confetto.style.zIndex = '1500'
            confetto.style.pointerEvents = 'none'
            confetto.style.opacity = '1'
            confetto.style.transform = `rotate(${randomRotation}deg)`
            
            document.body.appendChild(confetto)
            
            const startTime = performance.now()
            
            function animateConfetto(now) {
                const elapsed = (now - startTime) / 1000
                
                if (elapsed >= timeToLive) {
                    confetto.remove()
                    return
                }
                
                const progress = elapsed / timeToLive
                const distance = velocity * elapsed
                const currentX = centerX + Math.cos(angle) * distance
                const currentY = centerY + Math.sin(angle) * distance - (9.8 * elapsed * elapsed * 50)
                
                confetto.style.left = currentX + 'px'
                confetto.style.top = currentY + 'px'
                confetto.style.opacity = 1 - progress
                confetto.style.transform = `rotate(${randomRotation + (elapsed * 360)}deg)`
                
                requestAnimationFrame(animateConfetto)
            }
            
            requestAnimationFrame(animateConfetto)
        }, i * 20)
    }
    
    console.log(`Canhão de confete: ${totalConfetti} confetes para ${points} pontos!`)
}

function checkWinPoints(result1, result2, result3) {
    const combination = `${result1}${result2}${result3}`
    const specialCombination = `${result1}${result2}${result3}`
    
    if (result1 === result2 && result2 === result3) {
        const points = pointValues[specialCombination] || 5
        addPoints(points)
        
        if (result1 === '7️⃣' && result2 === '7️⃣' && result3 === '7️⃣') {
            showSlotMessage(`💀 JACKPOT MORTAL! 7️⃣7️⃣7️⃣ - Você será desconectado! 💀`, 'jackpot')
            triggerJackpotLogout()
        } else {
            showSlotMessage(`🎉 JACKPOT! +${points} pontos! 🎉`, 'jackpot')
            launchConfetti(points)
        }
        return points
    } else if (result1 === result2 || result2 === result3 || result1 === result3) {
        addPoints(3)
        showSlotMessage(`Quase lá! +3 pontos`, 'almost')
        return 3
    } else {
        removePoints(1)
        showSlotMessage(`Nenhuma combinação! -1 ponto`, 'lose')
        return -1
    }
}

function animateReel(reelElement, targetSymbol, duration = 500) {
    return new Promise((resolve) => {
        const startTime = Date.now()
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime
            if (elapsed >= duration) {
                clearInterval(interval)
                reelElement.textContent = targetSymbol
                reelElement.style.transform = 'scale(1)'
                resolve()
            } else {
                reelElement.textContent = getRandomSymbol()
                reelElement.style.transform = 'scale(1.1)'
                setTimeout(() => {
                    if (reelElement.style.transform) {
                        reelElement.style.transform = 'scale(1)'
                    }
                }, 50)
            }
        }, 80)
    })
}

async function forceJackpot() {
    if (isSpinning) return
    
    isSpinning = true
    const spinBtn = document.getElementById('spinBtn')
    
    spinBtn.disabled = true
    spinBtn.textContent = 'JACKPOT SECRETO!'
    
    const jackpotSymbol = getRandomSymbol()
    
    const reel1 = document.getElementById('slot1')
    const reel2 = document.getElementById('slot2')
    const reel3 = document.getElementById('slot3')
    
    await animateReel(reel1, jackpotSymbol, 300)
    await animateReel(reel2, jackpotSymbol, 400)
    await animateReel(reel3, jackpotSymbol, 500)
    
    spinBtn.disabled = false
    spinBtn.textContent = 'GIRAR 🎲'
    isSpinning = false
    
    const points = pointValues[`${jackpotSymbol}${jackpotSymbol}${jackpotSymbol}`] || 50
    addPoints(points)
    
    if (jackpotSymbol === '7️⃣') {
        showSlotMessage(`🔓 CÓDIGO SECRETO! 7️⃣7️⃣7️⃣ - Você será desconectado! 🔓`, 'jackpot')
        triggerJackpotLogout()
    } else {
        showSlotMessage(`🔓 CÓDIGO SECRETO! +${points} pontos! 🔓`, 'jackpot')
        launchConfetti(points)
    }
}

async function spinSlots() {
    if (isSpinning) {
        showSlotMessage('Aguarde o giro terminar!', 'warning')
        return
    }
    
    isSpinning = true
    const spinBtn = document.getElementById('spinBtn')
    const slotMessage = document.getElementById('slotMessage')
    
    spinBtn.disabled = true
    spinBtn.textContent = 'GIRANDO...'
    slotMessage.textContent = ''
    
    const result1 = getRandomSymbol()
    const result2 = getRandomSymbol()
    const result3 = getRandomSymbol()
    
    const reel1 = document.getElementById('slot1')
    const reel2 = document.getElementById('slot2')
    const reel3 = document.getElementById('slot3')
    
    await animateReel(reel1, result1, 400)
    await animateReel(reel2, result2, 500)
    await animateReel(reel3, result3, 600)
    
    spinBtn.disabled = false
    spinBtn.textContent = 'GIRAR 🎲'
    isSpinning = false
    
    checkWinPoints(result1, result2, result3)
}

function showSlotMessage(message, type) {
    const slotMessage = document.getElementById('slotMessage')
    slotMessage.textContent = message
    slotMessage.className = 'slot-message ' + type
    setTimeout(() => {
        if (slotMessage.textContent === message) {
            slotMessage.textContent = ''
            slotMessage.className = 'slot-message'
        }
    }, 3000)
}

function triggerJackpotLogout() {
    const jackpotModal = document.getElementById('jackpotModal')
    let countdown = 3
    const countdownSpan = document.getElementById('countdown')
    
    jackpotModal.classList.remove('hidden')
    jackpotModal.classList.add('show')
    
    const countdownInterval = setInterval(() => {
        countdown--
        if (countdownSpan) {
            countdownSpan.textContent = countdown
        }
        
        if (countdown <= 0) {
            clearInterval(countdownInterval)
            window.logout()
        }
    }, 1000)
}

function checkSecretCode(event) {
    const key = event.key.toUpperCase()
    const expectedKey = targetCode[secretCode.length]
    
    if (key === expectedKey) {
        secretCode += key
        if (secretCode === targetCode) {
            forceJackpot()
            secretCode = ''
        }
    } else {
        if (targetCode.startsWith(secretCode + key)) {
            secretCode += key
        } else {
            secretCode = ''
            if (key === targetCode[0]) {
                secretCode = key
            }
        }
    }
}

function closeJackpotModal() {
    const jackpotModal = document.getElementById('jackpotModal')
    jackpotModal.classList.remove('show')
    jackpotModal.classList.add('hidden')
}

window.addPoints = addPoints
window.removePoints = removePoints
window.updatePointsDisplay = updatePointsDisplay
window.getUserPoints = () => userPoints

document.addEventListener('DOMContentLoaded', () => {
    const spinBtn = document.getElementById('spinBtn')
    if (spinBtn) {
        spinBtn.addEventListener('click', spinSlots)
    }
    updatePointsDisplay()
    
    document.addEventListener('keydown', checkSecretCode)
})