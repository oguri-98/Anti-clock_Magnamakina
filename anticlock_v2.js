document.addEventListener('DOMContentLoaded', () => {
    // --- 要素の取得 ---
    const secondHand = document.getElementById('second-hand');
    const minuteHand = document.getElementById('minute-hand');
    const hourHand = document.getElementById('hour-hand');
    const clock = document.querySelector('.clock-container');
    
    const resetBtn = document.getElementById('reset-btn');
    const plus1mBtn = document.getElementById('plus-1m-btn');
    const minus1mBtn = document.getElementById('minus-1m-btn');
    const plus5mBtn = document.getElementById('plus-5m-btn');
    const minus5mBtn = document.getElementById('minus-5m-btn');
    
    const secretTrigger = document.getElementById('secret-trigger');
    const controlPanel = document.getElementById('control-panel');
    const timeDisplay = document.getElementById('time-display'); // 追加

    // --- 初期設定 (1時0分0秒) ---
    const DEFAULT_TIME = { h: 1, m: 0, s: 0 };
    
    let secondAngle = 0;
    let minuteAngle = 0;
    let hourAngle = 0;
    
    let isDragging = false;
    let lastTime = performance.now();
    
    const CENTRAL_TRANSFORM = 'translate(-50%, -50%)';

    // --- 時間セット関数 ---
    function setTime(h, m, s) {
        secondAngle = s * 6;
        minuteAngle = (m * 6) + (s * 0.1);
        hourAngle = ((h % 12) * 30) + (m * 0.5);
        updateHands();
    }

    // --- 描画更新 & 時間計算 ---
    function updateHands() {
        // 針の更新
        secondHand.style.transform = `${CENTRAL_TRANSFORM} rotate(${secondAngle}deg)`;
        minuteHand.style.transform = `${CENTRAL_TRANSFORM} rotate(${minuteAngle}deg)`;
        if (!isDragging) {
            hourHand.style.transform = `${CENTRAL_TRANSFORM} rotate(${hourAngle}deg)`;
        }

        // ▼▼▼ 追加：経過時間の計算と表示 ▼▼▼
        // 長針(minuteAngle)は1分で6度進みます（逆回転なのでマイナス）。
        // スタート地点(0度)からの総回転角度を元に秒数を計算します。
        // 角度 -6度 = 1分(60秒)経過 => 1度あたり10秒
        
        let totalSeconds = Math.round(-minuteAngle * 10);
        
        // マイナス（スタートより前）の処理
        let sign = "";
        if (totalSeconds < 0) {
            sign = "-";
            totalSeconds = Math.abs(totalSeconds);
        }

        let m = Math.floor(totalSeconds / 60);
        let s = totalSeconds % 60;

        // ゼロ埋め (05:03 のように)
        let mStr = m.toString().padStart(2, '0');
        let sStr = s.toString().padStart(2, '0');

        timeDisplay.textContent = `${sign}${mStr}:${sStr}`;
    }

    // --- アニメーションループ ---
    function animate(currentTime) {
        const deltaTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;

        // 逆回転
        secondAngle -= 6 * deltaTime;
        minuteAngle -= 0.1 * deltaTime;
        
        updateHands();
        requestAnimationFrame(animate);
    }

    // --- 短針ドラッグ操作 ---
    const startDrag = (e) => {
        e.preventDefault();
        isDragging = true;
        hourHand.style.cursor = 'grabbing';
    };
    
    const dragMove = (e) => {
        if (!isDragging) return;
        let clientX, clientY;
        if (e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const rect = clock.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = clientX - centerX;
        const dy = clientY - centerY;
        
        let angle = Math.atan2(dy, dx) * (180 / Math.PI);
        angle += 90; 
        
        hourAngle = angle;
        hourHand.style.transform = `${CENTRAL_TRANSFORM} rotate(${hourAngle}deg)`;
    };
    
    const endDrag = () => {
        isDragging = false;
        hourHand.style.cursor = 'grab';
    };
    
    hourHand.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup', endDrag);
    hourHand.addEventListener('touchstart', startDrag);
    document.addEventListener('touchmove', dragMove);
    document.addEventListener('touchend', endDrag);


    // --- 隠しコマンド ---
    let tapCount = 0;
    let tapTimer;

    const handleSecretTap = (e) => {
        e.preventDefault();
        tapCount++;
        clearTimeout(tapTimer);
        if (tapCount === 3) {
            controlPanel.classList.toggle('visible');
            tapCount = 0;
        } else {
            tapTimer = setTimeout(() => { tapCount = 0; }, 400);
        }
    };

    secretTrigger.addEventListener('touchstart', handleSecretTap, { passive: false });
    secretTrigger.addEventListener('click', handleSecretTap);


    // --- ボタン操作 ---
    
    resetBtn.addEventListener('click', () => {
        setTime(DEFAULT_TIME.h, DEFAULT_TIME.m, DEFAULT_TIME.s);
    });

    plus1mBtn.addEventListener('click', () => {
        minuteAngle -= 6;
        hourAngle -= 0.5;
        updateHands();
    });

    minus1mBtn.addEventListener('click', () => {
        minuteAngle += 6;
        hourAngle += 0.5;
        updateHands();
    });

    plus5mBtn.addEventListener('click', () => {
        minuteAngle -= 30;
        hourAngle -= 2.5;
        updateHands();
    });

    minus5mBtn.addEventListener('click', () => {
        minuteAngle += 30;
        hourAngle += 2.5;
        updateHands();
    });

    // --- 開始 ---
    setTime(DEFAULT_TIME.h, DEFAULT_TIME.m, DEFAULT_TIME.s);
    requestAnimationFrame(animate);
});