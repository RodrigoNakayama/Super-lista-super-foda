const symbols = ['🍒', '🍋', '🍊', '🍉', '⭐', '💎', '7️⃣', '🔔']
let isSpinning = false

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)]
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
    
    if (result1 === result2 && result2 === result3) {
        showSlotMessage(`🎉 JACKPOT! ${result1} ${result2} ${result3} 🎉`, 'jackpot')
        triggerJackpot()
    } else if (result1 === result2 || result2 === result3 || result1 === result3) {
        showSlotMessage(`Quase lá! ${result1} ${result2} ${result3}`, 'almost')
    } else {
        showSlotMessage(`Tente novamente! ${result1} ${result2} ${result3}`, 'lose')
    }
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

function triggerJackpot() {
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

function closeJackpotModal() {
    const jackpotModal = document.getElementById('jackpotModal')
    jackpotModal.classList.remove('show')
    jackpotModal.classList.add('hidden')
}

document.addEventListener('DOMContentLoaded', () => {
    const spinBtn = document.getElementById('spinBtn')
    if (spinBtn) {
        spinBtn.addEventListener('click', spinSlots)
    }
})