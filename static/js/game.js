class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.timeLeft = 60;
        this.gameOver = false;
        this.isPaused = false;
        this.audioManager = new AudioManager();

        // Game objects
        this.cannon = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 30,
            width: 40,
            height: 20,
            angle: 0
        };

        this.projectiles = [];
        this.targets = [];
        this.obstacles = this.createObstacles();

        // Mouse position
        this.mouseX = 0;
        this.mouseY = 0;

        this.setupEventListeners();
        this.startGameLoop();
        this.startTimer();
        this.spawnTargets();
        this.loadHighScores();
    }

    createObstacles() {
        return [
            { x: 100, y: 200, width: 20, height: 100 },
            { x: 300, y: 300, width: 100, height: 20 },
            { x: 500, y: 150, width: 20, height: 150 },
            { x: 600, y: 400, width: 150, height: 20 }
        ];
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });

        this.canvas.addEventListener('click', () => {
            if (!this.gameOver && !this.isPaused) {
                this.shoot();
            }
        });

        // Pause button
        const pauseButton = document.getElementById('pauseButton');
        pauseButton.addEventListener('click', () => {
            this.togglePause();
        });

        // Add keyboard controls for pause (spacebar)
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.key === ' ') {
                this.togglePause();
            }
        });
    }

    togglePause() {
        if (this.gameOver) return;
        
        this.isPaused = !this.isPaused;
        const pauseButton = document.getElementById('pauseButton');
        
        if (this.isPaused) {
            pauseButton.textContent = 'Resume';
            pauseButton.classList.replace('btn-warning', 'btn-success');
            
            // Draw pause message
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Paused', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = '16px Arial';
            this.ctx.fillText('Press Space or click Resume to continue', this.canvas.width / 2, this.canvas.height / 2 + 40);
        } else {
            pauseButton.textContent = 'Pause';
            pauseButton.classList.replace('btn-success', 'btn-warning');
            // Resume game loop
            this.startGameLoop();
        }
    }

    shoot() {
        const angle = Math.atan2(this.mouseY - this.cannon.y, this.mouseX - this.cannon.x);
        this.projectiles.push({
            x: this.cannon.x,
            y: this.cannon.y,
            radius: 5,
            speed: 10,
            angle: angle
        });
        this.audioManager.playSound('shoot');
    }

    spawnTargets() {
        if (this.gameOver) return;

        const target = {
            x: Math.random() * (this.canvas.width - 30) + 15,
            y: 30,
            radius: 15
        };
        this.targets.push(target);

        setTimeout(() => this.spawnTargets(), 2000);
    }

    startTimer() {
        const timerElement = document.getElementById('timer');
        this.timer = setInterval(() => {
            if (!this.isPaused) {
                this.timeLeft--;
                timerElement.textContent = this.timeLeft;

                if (this.timeLeft <= 0) {
                    clearInterval(this.timer);
                    this.endGame();
                }
            }
        }, 1000);
    }

    endGame() {
        this.gameOver = true;
        document.getElementById('gameOver').classList.remove('d-none');
        document.getElementById('finalScore').textContent = this.score;
        this.saveScore(this.score);
    }

    checkCollisions() {
        // Check projectile collisions
        this.projectiles.forEach((projectile, pIndex) => {
            // Check obstacle collisions
            this.obstacles.forEach(obstacle => {
                if (this.checkProjectileObstacleCollision(projectile, obstacle)) {
                    this.projectiles.splice(pIndex, 1);
                }
            });

            // Check target collisions
            this.targets.forEach((target, tIndex) => {
                const dx = projectile.x - target.x;
                const dy = projectile.y - target.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < target.radius + projectile.radius) {
                    this.targets.splice(tIndex, 1);
                    this.projectiles.splice(pIndex, 1);
                    this.score += 10;
                    document.getElementById('score').textContent = this.score;
                    this.audioManager.playSound('hit');
                }
            });
        });
    }

    checkProjectileObstacleCollision(projectile, obstacle) {
        // Check if projectile intersects with obstacle
        const intersectsX = projectile.x >= obstacle.x - projectile.radius &&
                           projectile.x <= obstacle.x + obstacle.width + projectile.radius;
        const intersectsY = projectile.y >= obstacle.y - projectile.radius &&
                           projectile.y <= obstacle.y + obstacle.height + projectile.radius;

        if (intersectsX && intersectsY) {
            // Determine which side was hit (top/bottom or left/right)
            const dx = projectile.x - (obstacle.x + obstacle.width / 2);
            const dy = projectile.y - (obstacle.y + obstacle.height / 2);

            // If hit on left or right side
            if (Math.abs(dx) > Math.abs(dy) * (obstacle.width / obstacle.height)) {
                projectile.angle = Math.PI - projectile.angle;
            }
            // If hit on top or bottom
            else {
                projectile.angle = -projectile.angle;
            }

            // Add bounce count to projectile if not exists
            projectile.bounceCount = (projectile.bounceCount || 0) + 1;

            // Move projectile slightly away from obstacle to prevent multiple collisions
            projectile.x += Math.cos(projectile.angle) * projectile.speed;
            projectile.y += Math.sin(projectile.angle) * projectile.speed;

            return projectile.bounceCount >= 3; // Remove after 3 bounces
        }
        return false;
    }

    update() {
        // Update projectiles
        this.projectiles.forEach((projectile, index) => {
            projectile.x += Math.cos(projectile.angle) * projectile.speed;
            projectile.y += Math.sin(projectile.angle) * projectile.speed;

            // Remove projectiles that are off screen
            if (projectile.x < 0 || projectile.x > this.canvas.width ||
                projectile.y < 0 || projectile.y > this.canvas.height) {
                this.projectiles.splice(index, 1);
            }
        });

        // Update cannon angle
        this.cannon.angle = Math.atan2(
            this.mouseY - this.cannon.y,
            this.mouseX - this.cannon.x
        );

        this.checkCollisions();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw obstacles
        this.ctx.fillStyle = '#666666';
        this.obstacles.forEach(obstacle => {
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });

        // Draw targets
        this.ctx.fillStyle = '#ff0000';
        this.targets.forEach(target => {
            this.ctx.beginPath();
            this.ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Draw projectiles
        this.ctx.fillStyle = '#ffff00';
        this.projectiles.forEach(projectile => {
            this.ctx.beginPath();
            this.ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Draw cannon
        this.ctx.save();
        this.ctx.translate(this.cannon.x, this.cannon.y);
        this.ctx.rotate(this.cannon.angle);
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(-this.cannon.width / 2, -this.cannon.height / 2,
                         this.cannon.width, this.cannon.height);
        this.ctx.restore();
    }

    startGameLoop() {
        const gameLoop = () => {
            if (!this.gameOver && !this.isPaused) {
                this.update();
                this.draw();
                requestAnimationFrame(gameLoop);
            } else if (this.isPaused) {
                // Stop the loop but allow it to be resumed later
                return;
            }
        };
        gameLoop();
    }

    async loadHighScores() {
        try {
            const response = await fetch('/scores');
            const scores = await response.json();
            this.updateHighScoresDisplay(scores);
        } catch (error) {
            console.error('Error loading high scores:', error);
        }
    }

    updateHighScoresDisplay(scores) {
        const highScoresList = document.getElementById('highScoresList');
        highScoresList.innerHTML = scores.map(score => `
            <div class="high-score-item list-group-item">
                <span class="date">${new Date(score.created_at).toLocaleDateString()}</span>
                <span class="score">${score.points}</span>
            </div>
        `).join('');
    }

    async saveScore(score) {
        try {
            const response = await fetch('/scores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ score: score })
            });
            if (response.ok) {
                this.loadHighScores(); // Reload high scores after saving
            }
        } catch (error) {
            console.error('Error saving score:', error);
        }
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new Game();
});