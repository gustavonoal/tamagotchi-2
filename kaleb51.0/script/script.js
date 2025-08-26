document.addEventListener('DOMContentLoaded', () => {

    const petMoodEl = document.getElementById('pet-mood');
    const petImageEl = document.getElementById('pet-image');
    const petNameEl = document.getElementById('pet-name');

    const statusHungerEl = document.getElementById('status-hunger');
    const statusHappinessEl = document.getElementById('status-happiness');
    const statusEnergyEl = document.getElementById('status-energy');
    const statusCleanlinessEl = document.getElementById('status-cleanliness');
    const statusAgeEl = document.getElementById('status-age');
    const statusHealthEl = document.getElementById('status-health');

    const actionFeedBtn = document.getElementById('action-feed');
    const actionPlayBtn = document.getElementById('action-play');
    const actionSleepBtn = document.getElementById('action-sleep');
    const actionCleanBtn = document.getElementById('action-clean');

    const saveGameBtn = document.getElementById('save-game-btn');
    const loadGameBtn = document.getElementById('load-game-btn');
    const resetGameBtn = document.getElementById('reset-game-btn');
    const pauseGameBtn = document.getElementById('pause-game-btn');

    const messageBox = document.getElementById('message-box');
    const messageText = document.getElementById('message-text');
    const closeMessageBtn = document.getElementById('close-message-btn');

    const GAME_INTERVAL_MS = 1000;
    const AGE_INTERVAL_SECONDS = 10;
    const MAX_STAT = 100;
    const MIN_STAT = 0;
    const LOW_STAT_THRESHOLD = 30;

    const PET_STAGES = [
        { name: 'Feto', emoji: '🤰', minAge: 0, maxAge: 2 },
        { name: 'Bebê', emoji: '👶', minAge: 2, maxAge: 5 },
        { name: 'Criança', emoji: '🧒', minAge: 5, maxAge: 12 },
        { name: 'Pré-adolescente', emoji: '🧑', minAge: 12, maxAge: 18 },
        { name: 'Jovem', emoji: '🧑‍🎓', minAge: 18, maxAge: 25 },
        { name: 'Adulto', emoji: '🧔', minAge: 25, maxAge: 40 },
        { name: 'Meia-idade', emoji: '🧑‍🦳', minAge: 40, maxAge: 60 },
        { name: 'Idoso', emoji: '🧓', minAge: 60, maxAge: 80 },
        { name: 'Ancião', emoji: '👴', minAge: 80, maxAge: Infinity }
    ];

    let tamagotchi = {
        name: 'Feto',
        hunger: MAX_STAT,
        happiness: MAX_STAT,
        energy: MAX_STAT,
        cleanliness: MAX_STAT,
        health: MAX_STAT,
        ageDays: 0,
        lastUpdateTime: Date.now(),
        isSleeping: false,
        isSick: false,
        isAlive: true
    };

    let gameIntervalId = null;
    let ageCounter = 0;
    let isPaused = false;

    function showMessage(message) {
        messageText.textContent = message;
        messageBox.style.display = 'flex';
    }

    function hideMessage() {
        messageBox.style.display = 'none';
    }

    function updateDisplay() {
        petNameEl.textContent = tamagotchi.name;
        petImageEl.textContent = getPetEmoji();
        petMoodEl.textContent = getPetMoodEmoji();

        statusHungerEl.textContent = `${tamagotchi.hunger}%`;
        statusHappinessEl.textContent = `${tamagotchi.happiness}%`;
        statusEnergyEl.textContent = `${tamagotchi.energy}%`;
        statusCleanlinessEl.textContent = `${tamagotchi.cleanliness}%`;
        statusAgeEl.textContent = `${tamagotchi.ageDays} dias`;
        statusHealthEl.textContent = `${tamagotchi.health}%`;

        statusHungerEl.classList.toggle('low', tamagotchi.hunger < LOW_STAT_THRESHOLD);
        statusHappinessEl.classList.toggle('low', tamagotchi.happiness < LOW_STAT_THRESHOLD);
        statusEnergyEl.classList.toggle('low', tamagotchi.energy < LOW_STAT_THRESHOLD);
        statusCleanlinessEl.classList.toggle('low', tamagotchi.cleanliness < LOW_STAT_THRESHOLD);
        statusHealthEl.classList.toggle('low', tamagotchi.health < LOW_STAT_THRESHOLD);

        actionSleepBtn.disabled = tamagotchi.isSleeping;
        actionFeedBtn.disabled = !tamagotchi.isAlive || tamagotchi.isSleeping;
        actionPlayBtn.disabled = !tamagotchi.isAlive || tamagotchi.isSleeping;
        actionCleanBtn.disabled = !tamagotchi.isAlive || tamagotchi.isSleeping;

        const maxAge = 40;
        const brightness = Math.max(0.3, 1 - (tamagotchi.ageDays / maxAge) * 0.7);
        document.body.style.backgroundColor = `rgba(20, 20, 20, ${1 - brightness})`;
        document.body.style.filter = `brightness(${brightness})`;
    }

    function getPetEmoji() {
        if (!tamagotchi.isAlive) return '👻';
        if (tamagotchi.isSleeping) return '😴';
        for (const stage of PET_STAGES) {
            if (tamagotchi.ageDays >= stage.minAge && tamagotchi.ageDays < stage.maxAge) {
                return stage.emoji;
            }
        }
        return PET_STAGES[0].emoji;
    }

    function getPetMoodEmoji() {
        if (!tamagotchi.isAlive) return '💀';
        if (tamagotchi.isSleeping) return '💤';
        if (tamagotchi.isSick) return '🤢';
        const avgHappiness = (tamagotchi.hunger + tamagotchi.happiness + tamagotchi.energy + tamagotchi.cleanliness) / 4;
        if (avgHappiness > 80) return '🤩';
        if (avgHappiness > 60) return '😊';
        if (avgHappiness > 40) return '😐';
        if (avgHappiness > 20) return '😟';
        return '😭';
    }

    function clampStat(stat) {
        return Math.max(MIN_STAT, Math.min(MAX_STAT, stat));
    }

    function performAction(actionType) {
        if (!tamagotchi.isAlive) {
            showMessage('Seu Tamagotchi não está mais vivo.');
            return;
        }
        if (tamagotchi.isSleeping) {
            showMessage('Seu Tamagotchi está dormindo.');
            return;
        }
        switch (actionType) {
            case 'feed':
                if (tamagotchi.hunger === MAX_STAT) {
                    showMessage('Seu Tamagotchi não está com fome.');
                    return;
                }
                tamagotchi.hunger = clampStat(tamagotchi.hunger + 20);
                tamagotchi.happiness = clampStat(tamagotchi.happiness + 5);
                showMessage('Você alimentou seu Tamagotchi!');
                break;
            case 'play':
                if (tamagotchi.happiness === MAX_STAT) {
                    showMessage('Seu Tamagotchi já está muito feliz.');
                    return;
                }
                tamagotchi.happiness = clampStat(tamagotchi.happiness + 25);
                tamagotchi.energy = clampStat(tamagotchi.energy - 10);
                showMessage('Você brincou com seu Tamagotchi!');
                break;
            case 'sleep':
                if (tamagotchi.energy === MAX_STAT) {
                    showMessage('Seu Tamagotchi não está com sono.');
                    return;
                }
                tamagotchi.isSleeping = true;
                petImageEl.style.transform = 'scale(0.8)';
                showMessage('Seu Tamagotchi foi dormir.');
                break;
            case 'clean':
                if (tamagotchi.cleanliness === MAX_STAT) {
                    showMessage('Seu Tamagotchi já está limpo.');
                    return;
                }
                tamagotchi.cleanliness = MAX_STAT;
                tamagotchi.happiness = clampStat(tamagotchi.happiness + 10);
                showMessage('Você limpou seu Tamagotchi!');
                break;
        }
        updateDisplay();
        saveGame();
    }

    function gameLoop() {
        if (!tamagotchi.isAlive) {
            clearInterval(gameIntervalId);
            gameIntervalId = null;
            return;
        }
        ageCounter++;
        if (ageCounter >= AGE_INTERVAL_SECONDS) {
            tamagotchi.ageDays++;
            ageCounter = 0;
            const currentStage = PET_STAGES.find(stage => tamagotchi.ageDays >= stage.minAge && tamagotchi.ageDays < stage.maxAge);
            if (currentStage && tamagotchi.name !== currentStage.name) {
                tamagotchi.name = currentStage.name;
                showMessage(`Seu Tamagotchi evoluiu para a fase ${currentStage.name}!`);
            }
        }
        if (!tamagotchi.isSleeping) {
            tamagotchi.hunger = clampStat(tamagotchi.hunger - 5);
            tamagotchi.happiness = clampStat(tamagotchi.happiness - 3);
            tamagotchi.energy = clampStat(tamagotchi.energy - 3);
            tamagotchi.cleanliness = clampStat(tamagotchi.cleanliness - 2);
        } else {
            tamagotchi.energy = clampStat(tamagotchi.energy + 5);
            tamagotchi.happiness = clampStat(tamagotchi.happiness + 2);
            tamagotchi.health = clampStat(tamagotchi.health + 1);
            if (tamagotchi.energy >= MAX_STAT) {
                tamagotchi.isSleeping = false;
                petImageEl.style.transform = 'scale(1)';
                showMessage('Seu Tamagotchi acordou!');
            }
        }
        let healthPenalty = 0;
        if (tamagotchi.hunger < LOW_STAT_THRESHOLD) healthPenalty += 10;
        if (tamagotchi.happiness < LOW_STAT_THRESHOLD) healthPenalty += 6;
        if (tamagotchi.energy < LOW_STAT_THRESHOLD) healthPenalty += 4;
        if (tamagotchi.cleanliness < LOW_STAT_THRESHOLD) healthPenalty += 8;
        tamagotchi.health = clampStat(tamagotchi.health - healthPenalty);
        if (!tamagotchi.isSick && tamagotchi.health < LOW_STAT_THRESHOLD && Math.random() < 0.05) {
            tamagotchi.isSick = true;
            showMessage('Seu Tamagotchi ficou doente! Cuide bem dele.');
        } else if (tamagotchi.isSick && tamagotchi.health >= LOW_STAT_THRESHOLD + 20) {
            tamagotchi.isSick = false;
            showMessage('Seu Tamagotchi se recuperou da doença!');
        }
        if (tamagotchi.health <= MIN_STAT) {
            tamagotchi.isAlive = false;
            showMessage('Seu Tamagotchi faleceu... 😢');
            clearInterval(gameIntervalId);
            gameIntervalId = null;
            updateDisplay();
            saveGame();
            return;
        }
        updateDisplay();
        saveGame();
    }

    function saveGame() {
        localStorage.setItem('tamagotchiSave', JSON.stringify(tamagotchi));
    }

    function loadGame() {
        const savedState = localStorage.getItem('tamagotchiSave');
        if (savedState) {
            const loadedTamagotchi = JSON.parse(savedState);
            Object.assign(tamagotchi, loadedTamagotchi);
            tamagotchi.lastUpdateTime = Date.now();
            if (tamagotchi.isSleeping) {
                petImageEl.style.transform = 'scale(0.8)';
            } else {
                petImageEl.style.transform = 'scale(1)';
            }
            showMessage('Jogo carregado com sucesso!');
            updateDisplay();
            startGameLoop();
        } else {
            showMessage('Nenhum jogo salvo encontrado.');
        }
    }

    function resetGame() {
        clearInterval(gameIntervalId);
        gameIntervalId = null;
        tamagotchi = {
            name: 'Feto',
            hunger: MAX_STAT,
            happiness: MAX_STAT,
            energy: MAX_STAT,
            cleanliness: MAX_STAT,
            health: MAX_STAT,
            ageDays: 0,
            lastUpdateTime: Date.now(),
            isSleeping: false,
            isSick: false,
            isAlive: true
        };
        ageCounter = 0;
        localStorage.removeItem('tamagotchiSave');
        petImageEl.style.transform = 'scale(1)';
        showMessage('Jogo reiniciado!');
        updateDisplay();
        startGameLoop();
    }

    function startGameLoop() {
        if (gameIntervalId) {
            clearInterval(gameIntervalId);
        }
        gameIntervalId = setInterval(gameLoop, GAME_INTERVAL_MS);
    }

    actionFeedBtn.addEventListener('click', () => performAction('feed'));
    actionPlayBtn.addEventListener('click', () => performAction('play'));
    actionSleepBtn.addEventListener('click', () => performAction('sleep'));
    actionCleanBtn.addEventListener('click', () => performAction('clean'));

    saveGameBtn.addEventListener('click', saveGame);
    loadGameBtn.addEventListener('click', loadGame);
    resetGameBtn.addEventListener('click', resetGame);

    closeMessageBtn.addEventListener('click', hideMessage);
    messageBox.addEventListener('click', (e) => {
        if (e.target === messageBox) {
            hideMessage();
        }
    });

    const toggleThemeBtn = document.createElement('button');
    toggleThemeBtn.textContent = 'Alternar Tema';
    toggleThemeBtn.className = 'game-button';
    document.querySelector('.game-controls').appendChild(toggleThemeBtn);

    toggleThemeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        if (document.body.classList.contains('dark-theme')) {
            toggleThemeBtn.textContent = 'Tema Neon';
        } else {
            toggleThemeBtn.textContent = 'Tema Escuro';
        }
    });

    function pauseGame() {
        if (!isPaused) {
            clearInterval(gameIntervalId);
            isPaused = true;
            pauseGameBtn.textContent = '▶️ Retomar';
        } else {
            startGameLoop();
            isPaused = false;
            pauseGameBtn.textContent = '⏸️ Pausar';
        }
    }

    pauseGameBtn.addEventListener('click', pauseGame);

    loadGame(); 
    if (!gameIntervalId) { 
        updateDisplay(); 
        startGameLoop();
    }

    resetGame();
});