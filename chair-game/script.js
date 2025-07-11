class ChairGrabbingGame {
    constructor() {
        this.gameState = {
            isPlaying: false,
            musicPlaying: false,
            players: [],
            chairs: [],
            currentRound: 1,
            gameStartTime: null,
            musicStopTime: null,
            eliminatedPlayers: [],
            gameResults: []
        };
        
        this.sounds = {
            audioContext: null,
            oscillator: null
        };
        
        this.timers = {
            gameTimer: null,
            musicTimer: null,
            roundTimer: null
        };
        
        this.settings = {
            minMusicTime: 5000,
            maxMusicTime: 15000,
            chairGrabTime: 5000,
            playerColors: [
                '#3498db', '#e74c3c', '#2ecc71', '#f39c12',
                '#9b59b6', '#1abc9c', '#e67e22', '#34495e',
                '#e91e63', '#4caf50', '#ff5722', '#795548'
            ]
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.initAudio();
        this.updateDisplay();
    }
    
    bindEvents() {
        // Game controls
        document.getElementById('start-game').addEventListener('click', () => this.startGame());
        document.getElementById('stop-music').addEventListener('click', () => this.stopMusic());
        document.getElementById('reset-game').addEventListener('click', () => this.resetGame());
        
        // Player input validation
        document.getElementById('player-input').addEventListener('change', (e) => {
            const value = parseInt(e.target.value);
            if (value < 2) e.target.value = 2;
            if (value > 12) e.target.value = 12;
        });
    }
    
    initAudio() {
        try {
            this.sounds.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Audio context not supported');
        }
    }
    
    startGame() {
        const playerCount = parseInt(document.getElementById('player-input').value);
        
        if (playerCount < 2 || playerCount > 12) {
            this.showStatus('Please select between 2 and 12 players!', 'error');
            return;
        }
        
        this.gameState.isPlaying = true;
        this.gameState.currentRound = 1;
        this.gameState.eliminatedPlayers = [];
        this.gameState.gameResults = [];
        this.gameState.gameStartTime = Date.now();
        
        this.createPlayers(playerCount);
        this.createChairs(playerCount - 1);
        this.startRound();
        
        this.updateDisplay();
        this.updateControls();
    }
    
    createPlayers(count) {
        this.gameState.players = [];
        const gameBoard = document.getElementById('game-board');
        
        for (let i = 0; i < count; i++) {
            const player = {
                id: i + 1,
                name: `Player ${i + 1}`,
                color: this.settings.playerColors[i % this.settings.playerColors.length],
                isEliminated: false,
                hasChair: false,
                element: null
            };
            
            // Create player element
            const playerElement = document.createElement('div');
            playerElement.className = 'player moving';
            playerElement.style.background = `linear-gradient(45deg, ${player.color}, ${this.darkenColor(player.color)})`;
            playerElement.textContent = player.id;
            playerElement.dataset.playerId = player.id;
            
            player.element = playerElement;
            this.gameState.players.push(player);
            gameBoard.appendChild(playerElement);
        }
    }
    
    createChairs(count) {
        this.gameState.chairs = [];
        const gameBoard = document.getElementById('game-board');
        
        for (let i = 0; i < count; i++) {
            const chair = {
                id: i + 1,
                isOccupied: false,
                occupiedBy: null,
                element: null
            };
            
            // Create chair element
            const chairElement = document.createElement('div');
            chairElement.className = 'chair';
            chairElement.dataset.chairId = chair.id;
            chairElement.addEventListener('click', () => this.grabChair(chair.id));
            
            chair.element = chairElement;
            this.gameState.chairs.push(chair);
            gameBoard.appendChild(chairElement);
        }
    }
    
    startRound() {
        this.showStatus(`Round ${this.gameState.currentRound} - Music is playing! Walk around...`, 'info');
        this.startMusic();
        
        // Make chairs available for grabbing
        this.gameState.chairs.forEach(chair => {
            chair.isOccupied = false;
            chair.occupiedBy = null;
            chair.element.classList.remove('taken');
        });
        
        // Reset players
        this.gameState.players.forEach(player => {
            if (!player.isEliminated) {
                player.hasChair = false;
                player.element.classList.add('moving');
                player.element.classList.remove('eliminated');
            }
        });
        
        // Schedule music stop
        const musicDuration = Math.random() * 
            (this.settings.maxMusicTime - this.settings.minMusicTime) + 
            this.settings.minMusicTime;
            
        this.timers.musicTimer = setTimeout(() => {
            this.stopMusic();
        }, musicDuration);
    }
    
    startMusic() {
        this.gameState.musicPlaying = true;
        this.playBackgroundMusic();
        
        const musicIndicator = document.getElementById('music-indicator');
        musicIndicator.classList.add('active');
        
        this.updateControls();
    }
    
    stopMusic() {
        if (!this.gameState.musicPlaying) return;
        
        this.gameState.musicPlaying = false;
        this.gameState.musicStopTime = Date.now();
        
        this.stopBackgroundMusic();
        
        const musicIndicator = document.getElementById('music-indicator');
        musicIndicator.classList.remove('active');
        
        // Stop player movement
        this.gameState.players.forEach(player => {
            if (!player.isEliminated) {
                player.element.classList.remove('moving');
            }
        });
        
        // Make chairs available for grabbing
        this.gameState.chairs.forEach(chair => {
            chair.element.classList.add('available');
        });
        
        this.showStatus('Music stopped! Quick, grab a chair!', 'urgent');
        this.updateControls();
        
        // Start chair grabbing timer
        this.timers.roundTimer = setTimeout(() => {
            this.endRound();
        }, this.settings.chairGrabTime);
        
        // Clear music timer
        if (this.timers.musicTimer) {
            clearTimeout(this.timers.musicTimer);
            this.timers.musicTimer = null;
        }
    }
    
    grabChair(chairId) {
        if (this.gameState.musicPlaying) {
            this.showStatus('Wait for the music to stop!', 'warning');
            return;
        }
        
        const chair = this.gameState.chairs.find(c => c.id === chairId);
        if (!chair || chair.isOccupied) {
            this.showStatus('This chair is already taken!', 'error');
            return;
        }
        
        // Find an available player to assign the chair
        const availablePlayer = this.gameState.players.find(p => !p.isEliminated && !p.hasChair);
        if (!availablePlayer) return;
        
        // Assign chair to player
        chair.isOccupied = true;
        chair.occupiedBy = availablePlayer.id;
        availablePlayer.hasChair = true;
        
        // Update visual
        chair.element.classList.add('taken');
        chair.element.classList.remove('available');
        
        this.playGrabSound();
        this.showStatus(`${availablePlayer.name} grabbed a chair!`, 'success');
        
        // Check if round should end
        const playersWithChairs = this.gameState.players.filter(p => !p.isEliminated && p.hasChair).length;
        const availableChairs = this.gameState.chairs.filter(c => !c.isOccupied).length;
        
        if (availableChairs === 0 || playersWithChairs === this.gameState.chairs.length) {
            this.endRound();
        }
    }
    
    endRound() {
        // Clear timers
        if (this.timers.roundTimer) {
            clearTimeout(this.timers.roundTimer);
            this.timers.roundTimer = null;
        }
        
        // Remove chair availability
        this.gameState.chairs.forEach(chair => {
            chair.element.classList.remove('available');
        });
        
        // Find eliminated player
        const eliminatedPlayer = this.gameState.players.find(p => !p.isEliminated && !p.hasChair);
        
        if (eliminatedPlayer) {
            eliminatedPlayer.isEliminated = true;
            eliminatedPlayer.element.classList.add('eliminated');
            eliminatedPlayer.element.classList.remove('moving');
            
            this.gameState.eliminatedPlayers.push({
                player: eliminatedPlayer,
                round: this.gameState.currentRound,
                position: this.gameState.players.filter(p => !p.isEliminated).length + 1
            });
            
            this.showStatus(`${eliminatedPlayer.name} is eliminated!`, 'elimination');
            this.playEliminationSound();
        }
        
        // Check if game is over
        const remainingPlayers = this.gameState.players.filter(p => !p.isEliminated);
        
        if (remainingPlayers.length === 1) {
            this.endGame(remainingPlayers[0]);
        } else {
            // Prepare for next round
            setTimeout(() => {
                this.prepareNextRound();
            }, 3000);
        }
    }
    
    prepareNextRound() {
        this.gameState.currentRound++;
        
        // Remove one chair
        const lastChair = this.gameState.chairs.pop();
        if (lastChair && lastChair.element) {
            lastChair.element.remove();
        }
        
        // Reset players for next round
        this.gameState.players.forEach(player => {
            if (!player.isEliminated) {
                player.hasChair = false;
            }
        });
        
        this.updateDisplay();
        this.startRound();
    }
    
    endGame(winner) {
        this.gameState.isPlaying = false;
        winner.element.classList.add('winner');
        
        // Add winner to results
        this.gameState.gameResults.unshift({
            player: winner,
            position: 1,
            round: this.gameState.currentRound
        });
        
        // Add eliminated players to results
        this.gameState.eliminatedPlayers.reverse().forEach(eliminated => {
            this.gameState.gameResults.push(eliminated);
        });
        
        this.showStatus(`🎉 ${winner.name} wins the game! 🎉`, 'victory');
        this.playVictorySound();
        this.displayResults();
        this.updateControls();
    }
    
    displayResults() {
        const leaderboard = document.getElementById('leaderboard');
        const resultsList = document.getElementById('results-list');
        
        resultsList.innerHTML = '';
        
        this.gameState.gameResults.forEach((result, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            
            if (index === 0) {
                resultItem.classList.add('winner');
                resultItem.innerHTML = `🥇 ${result.player.name} - Winner!`;
            } else {
                const medal = index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';
                resultItem.innerHTML = `${medal} ${result.player.name} - ${this.getOrdinal(result.position)} place (eliminated in round ${result.round})`;
            }
            
            resultsList.appendChild(resultItem);
        });
        
        leaderboard.style.display = 'block';
    }
    
    resetGame() {
        // Clear all timers
        Object.values(this.timers).forEach(timer => {
            if (timer) clearTimeout(timer);
        });
        
        // Reset game state
        this.gameState = {
            isPlaying: false,
            musicPlaying: false,
            players: [],
            chairs: [],
            currentRound: 1,
            gameStartTime: null,
            musicStopTime: null,
            eliminatedPlayers: [],
            gameResults: []
        };
        
        // Clear game board
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';
        
        // Hide leaderboard
        document.getElementById('leaderboard').style.display = 'none';
        
        // Reset music indicator
        const musicIndicator = document.getElementById('music-indicator');
        musicIndicator.classList.remove('active');
        
        this.stopBackgroundMusic();
        this.updateDisplay();
        this.updateControls();
        this.showStatus('Game reset! Ready to play again?', 'info');
    }
    
    updateDisplay() {
        const playerCount = this.gameState.players.filter(p => !p.isEliminated).length;
        const chairCount = this.gameState.chairs.length;
        
        document.getElementById('player-count').textContent = playerCount;
        document.getElementById('chair-count').textContent = chairCount;
        document.getElementById('round-count').textContent = this.gameState.currentRound;
        
        // Update timer
        if (this.gameState.gameStartTime) {
            const elapsed = Math.floor((Date.now() - this.gameState.gameStartTime) / 1000);
            document.getElementById('timer').textContent = elapsed;
        } else {
            document.getElementById('timer').textContent = '0';
        }
    }
    
    updateControls() {
        const startBtn = document.getElementById('start-game');
        const stopBtn = document.getElementById('stop-music');
        const resetBtn = document.getElementById('reset-game');
        const playerInput = document.getElementById('player-input');
        
        startBtn.disabled = this.gameState.isPlaying;
        stopBtn.style.display = this.gameState.musicPlaying ? 'block' : 'none';
        playerInput.disabled = this.gameState.isPlaying;
        
        if (this.gameState.isPlaying) {
            startBtn.textContent = 'Game in Progress';
        } else {
            startBtn.textContent = 'Start Game';
        }
    }
    
    showStatus(message, type = 'info') {
        const statusElement = document.getElementById('status-message');
        statusElement.textContent = message;
        
        // Remove existing type classes
        statusElement.classList.remove('error', 'warning', 'success', 'urgent', 'elimination', 'victory', 'info');
        statusElement.classList.add(type);
        
        // Auto-hide certain message types
        if (type === 'success' || type === 'warning') {
            setTimeout(() => {
                if (statusElement.classList.contains(type)) {
                    statusElement.classList.remove(type);
                    statusElement.classList.add('info');
                }
            }, 3000);
        }
    }
    
    // Audio methods
    playBackgroundMusic() {
        if (!this.sounds.audioContext) return;
        
        try {
            this.sounds.oscillator = this.sounds.audioContext.createOscillator();
            const gainNode = this.sounds.audioContext.createGain();
            
            this.sounds.oscillator.connect(gainNode);
            gainNode.connect(this.sounds.audioContext.destination);
            
            this.sounds.oscillator.frequency.setValueAtTime(440, this.sounds.audioContext.currentTime);
            this.sounds.oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, this.sounds.audioContext.currentTime);
            
            this.sounds.oscillator.start();
            
            // Add some variation to the music
            const variation = setInterval(() => {
                if (this.gameState.musicPlaying && this.sounds.oscillator) {
                    const newFreq = 440 + Math.random() * 200 - 100;
                    this.sounds.oscillator.frequency.setValueAtTime(newFreq, this.sounds.audioContext.currentTime);
                } else {
                    clearInterval(variation);
                }
            }, 500);
        } catch (e) {
            console.warn('Unable to play background music:', e);
        }
    }
    
    stopBackgroundMusic() {
        if (this.sounds.oscillator) {
            try {
                this.sounds.oscillator.stop();
            } catch (e) {
                // Oscillator might already be stopped
            }
            this.sounds.oscillator = null;
        }
    }
    
    playGrabSound() {
        this.playTone(800, 0.1, 0.2);
    }
    
    playEliminationSound() {
        this.playTone(200, 0.5, 0.3);
    }
    
    playVictorySound() {
        // Play a victory sequence
        setTimeout(() => this.playTone(523, 0.2, 0.1), 0);
        setTimeout(() => this.playTone(659, 0.2, 0.1), 200);
        setTimeout(() => this.playTone(784, 0.2, 0.1), 400);
        setTimeout(() => this.playTone(1047, 0.4, 0.1), 600);
    }
    
    playTone(frequency, duration, volume) {
        if (!this.sounds.audioContext) return;
        
        try {
            const oscillator = this.sounds.audioContext.createOscillator();
            const gainNode = this.sounds.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.sounds.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, this.sounds.audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(volume, this.sounds.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.sounds.audioContext.currentTime + duration);
            
            oscillator.start();
            oscillator.stop(this.sounds.audioContext.currentTime + duration);
        } catch (e) {
            console.warn('Unable to play sound:', e);
        }
    }
    
    // Utility methods
    darkenColor(color) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        return `rgb(${Math.max(0, r - 50)}, ${Math.max(0, g - 50)}, ${Math.max(0, b - 50)})`;
    }
    
    getOrdinal(number) {
        const suffixes = ['th', 'st', 'nd', 'rd'];
        const value = number % 100;
        return number + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new ChairGrabbingGame();
    
    // Update timer every second
    setInterval(() => {
        game.updateDisplay();
    }, 1000);
    
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && game.gameState.musicPlaying) {
            // Pause music when tab is hidden
            game.stopBackgroundMusic();
        } else if (!document.hidden && game.gameState.musicPlaying) {
            // Resume music when tab is visible
            game.playBackgroundMusic();
        }
    });
});

// Add some additional CSS classes for status messages
const additionalStyles = `
    <style>
        .status-message.error {
            background: linear-gradient(45deg, #e74c3c, #c0392b) !important;
            color: white !important;
        }
        
        .status-message.warning {
            background: linear-gradient(45deg, #f39c12, #e67e22) !important;
            color: white !important;
        }
        
        .status-message.success {
            background: linear-gradient(45deg, #2ecc71, #27ae60) !important;
            color: white !important;
        }
        
        .status-message.urgent {
            background: linear-gradient(45deg, #e74c3c, #c0392b) !important;
            color: white !important;
            animation: pulse 1s ease-in-out infinite;
        }
        
        .status-message.elimination {
            background: linear-gradient(45deg, #8e44ad, #9b59b6) !important;
            color: white !important;
        }
        
        .status-message.victory {
            background: linear-gradient(45deg, #f39c12, #e67e22) !important;
            color: white !important;
            animation: victory 2s ease-in-out infinite;
        }
    </style>
`;

document.head.insertAdjacentHTML('beforeend', additionalStyles);