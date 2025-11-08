!function(){
    window.requestAnimationFrame = window.requestAnimationFrame || 
        window.mozRequestAnimationFrame || 
        window.webkitRequestAnimationFrame || 
        window.msRequestAnimationFrame;

    const density = 0.05;
    const canvas = document.createElement("canvas");
    let width, height, ctx, particles = [];
    let isDarkMode = false;

    function init() {
        width = window.innerWidth;
        height = window.innerHeight;
        const scale = 0.216 * width;
        canvas.width = width;
        canvas.height = height;
        canvas.className = "canvas_effects";
        document.body.insertAdjacentElement('afterbegin', canvas);
        
        ctx = canvas.getContext("2d");
        for (let i = 0; i < height; i++) particles.push(new Particle());
        animate();
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => p.update());
        requestAnimationFrame(animate);
    }

    function Particle() {
        this.reset = () => {
            this.isGiant = Math.random() < 0.015;
            this.isComet = !this.isGiant && Math.random() < 0.1;
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.radius = Math.random() * 1.5 + 1.1;
            this.speedX = Math.random() * 6 + 1;
            this.speedY = Math.random() * 6 + 1;
            this.opacity = 0;
            this.opacityTarget = this.isComet ? 0.8 : 1;
            this.fadeSpeed = Math.random() * 0.002 + 0.001;
        };

        this.update = () => {
            if (!this.isFading) {
                this.opacity += this.fadeSpeed;
                if (this.opacity >= this.opacityTarget) this.isFading = true;
            } else {
                this.opacity -= this.fadeSpeed / 2;
                if (this.opacity <= 0) this.reset();
            }

            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x > width || this.y > height) {
                this.reset();
            }
        };

        this.draw = () => {
            ctx.beginPath();
            if (this.isGiant) {
                ctx.fillStyle = "rgba(180,184,240," + this.opacity + ")";
                ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            } else if (this.isComet) {
                ctx.fillStyle = "rgba(226,225,142," + this.opacity + ")";
                ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2);
                for (let i = 0; i < 30; i++) {
                    ctx.fillStyle = "rgba(226,225,142," + (this.opacity - i * 0.05) + ")";
                    ctx.fillRect(this.x - this.speedX * 0.25 * i, this.y - this.speedY * 0.25 * i - 2, 2, 2);
                }
            } else {
                ctx.fillStyle = "rgba(226,225,142," + this.opacity + ")";
                ctx.fillRect(this.x, this.y, this.radius, this.radius);
            }
            ctx.closePath();
            ctx.fill();
        };

        this.reset();
    }

    init();
    window.addEventListener('resize', init);
}();