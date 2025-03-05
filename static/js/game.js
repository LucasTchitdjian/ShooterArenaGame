class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.timeLeft = 60;
        this.gameOver = false;
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
            if (!this.gameOver) {
                this.shoot();
            }
        });
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
        const timer = setInterval(() => {
            this.timeLeft--;
            timerElement.textContent = this.timeLeft;
            
            if (this.timeLeft <= 0) {
                clearInterval(timer);
                this.endGame();
            }
        }, 1000);
    }

    endGame() {
        this.gameOver = true;
        document.getElementById('gameOver').classList.remove('d-none');
        document.getElementById('finalScore').textContent = this.score;
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
        return projectile.x >= obstacle.x &&
               projectile.x <= obstacle.x + obstacle.width &&
               projectile.y >= obstacle.y &&
               projectile.y <= obstacle.y + obstacle.height;
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
            if (!this.gameOver) {
                this.update();
                this.draw();
                requestAnimationFrame(gameLoop);
            }
        };
        gameLoop();
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new Game();
});
