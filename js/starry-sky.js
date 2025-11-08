const DreamConfig = {
  effects_universe_mode: 'dark'
};

document.addEventListener('DOMContentLoaded', () => {
  window.requestAnimationFrame = window.requestAnimationFrame || 
                                window.mozRequestAnimationFrame || 
                                window.webkitRequestAnimationFrame || 
                                window.msRequestAnimationFrame;
                                
  const baseSpeed = 0.05;
  const mode = DreamConfig.effects_universe_mode;
  const canvas = document.createElement("canvas");
  let canvasWidth, canvasHeight, starCount, initialDelay = true;
  const cometColor = "226,225,224";
  const stars = [];
  let ctx;
  // 检测深色模式（适配Butterfly的data-theme属性）
  let isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';

  // 初始化画布
  function initCanvas() {
    if (!isDarkMode) return;
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    starCount = Math.floor(0.216 * canvasWidth);
    canvas.setAttribute("width", canvasWidth);
    canvas.setAttribute("height", canvasHeight);
    canvas.setAttribute("class", "canvas_effects " + mode);
    if (!document.querySelector('.canvas_effects')) {
      document.body.insertBefore(canvas, document.body.firstChild);
      ctx = canvas.getContext("2d");
      stars.length = 0;
      // 初始化星星（关键修正：确保Star实例有reset方法）
      for (let i = 0; i < starCount; i++) {
        const star = new Star(); // 创建实例
        stars.push(star); // 添加到数组
        star.reset(); // 调用reset方法
      }
    }
  }

  // 星星类（修正reset方法定义）
  class Star {
    constructor() {
      // 构造函数中先初始化，后续reset会覆盖
      this.x = 0;
      this.y = 0;
      // 延迟显示彗星
      setTimeout(() => { initialDelay = false; }, 50);
    }

    // 关键：正确定义reset方法（确保方法名拼写正确）
    reset() {
      this.giant = this.randomBool(3); // 巨型星星概率
      this.comet = !this.giant && !initialDelay && this.randomBool(10); // 彗星概率
      this.x = this.randomRange(0, canvasWidth - 10);
      this.y = this.randomRange(0, canvasHeight);
      this.r = this.randomRange(1.1, 2.6);
      // 速度（彗星更快）
      this.dx = this.randomRange(baseSpeed, 6 * baseSpeed) + (this.comet ? baseSpeed * this.randomRange(50, 120) + 0.1 : 0);
      this.dy = -this.randomRange(baseSpeed, 6 * baseSpeed) - (this.comet ? baseSpeed * this.randomRange(50, 120) : 0);
      this.fadingOut = null;
      this.fadingIn = true;
      this.opacity = 0;
      this.opacityTresh = this.randomRange(0.2, 1 - (this.comet ? 0.4 : 0));
      this.fadeSpeed = this.randomRange(0.0005, 0.002) + (this.comet ? 0.001 : 0);
    }

    fadeIn() {
      if (this.fadingIn) {
        this.fadingIn = !(this.opacity > this.opacityTresh);
        this.opacity += this.fadeSpeed;
      }
    }

    fadeOut() {
      if (this.fadingOut) {
        this.fadingOut = !(this.opacity < 0);
        this.opacity -= this.fadeSpeed / 2;
        if (this.x > canvasWidth || this.y < 0) {
          this.fadingOut = false;
          this.reset(); // 调用reset重置
        }
      }
    }

    draw() {
      ctx.beginPath();
      if (this.giant) {
        ctx.fillStyle = `rgba(180,184,240,${this.opacity})`;
        ctx.arc(this.x, this.y, 2, 0, 2 * Math.PI, false);
      } else if (this.comet) {
        ctx.fillStyle = `rgba(${cometColor},${this.opacity})`;
        ctx.arc(this.x, this.y, 1.5, 0, 2 * Math.PI, false);
        // 拖尾效果
        for (let i = 0; i < 30; i++) {
          ctx.fillStyle = `rgba(${cometColor},${this.opacity - this.opacity / 20 * i})`;
          ctx.rect(this.x - this.dx / 4 * i, this.y - this.dy / 4 * i - 2, 2, 2);
          ctx.fill();
        }
      } else {
        ctx.fillStyle = `rgba(226,225,142,${this.opacity})`;
        ctx.rect(this.x, this.y, this.r, this.r);
      }
      ctx.closePath();
      ctx.fill();
    }

    move() {
      this.x += this.dx;
      this.y += this.dy;
      if (!this.fadingOut && (this.x > canvasWidth - canvasWidth / 4 || this.y < 0)) {
        this.fadingOut = true;
      }
    }

    randomBool(t) {
      return Math.floor(1000 * Math.random()) + 1 < 10 * t;
    }

    randomRange(min, max) {
      return Math.random() * (max - min) + min;
    }
  }

  // 渲染帧
  function render() {
    if (!isDarkMode || !ctx) return;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    stars.forEach(star => {
      star.move();
      star.fadeIn();
      star.fadeOut();
      star.draw();
    });
    window.requestAnimationFrame(render);
  }

  // 监听深色模式切换（监听data-theme属性）
  function watchDarkMode() {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.attributeName === 'data-theme') {
          const newIsDark = document.documentElement.getAttribute('data-theme') === 'dark';
          if (newIsDark !== isDarkMode) {
            isDarkMode = newIsDark;
            if (isDarkMode) {
              initCanvas();
            } else {
              const canvas = document.querySelector('.canvas_effects');
              if (canvas) canvas.remove();
            }
          }
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  // 初始化
  if (isDarkMode) {
    initCanvas();
    render();
  }
  watchDarkMode();

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    if (isDarkMode) {
      initCanvas();
    }
  });
});