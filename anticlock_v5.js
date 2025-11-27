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
    const syncHourBtn = document.getElementById('sync-hour-btn');
    
    const secretTrigger = document.getElementById('secret-trigger');
    const topLeftTrigger = document.getElementById('top-left-trigger');
    const controlPanel = document.getElementById('control-panel');
    const timeDisplay = document.getElementById('time-display');

    // 画像切り替え関連の要素
    const imageControlPanel = document.getElementById('image-control-panel');
    const imageSelectButtons = imageControlPanel ? imageControlPanel.querySelectorAll('.image-select-group button') : [];
    const displayImage = document.getElementById('display-image');
    
    // ▼▼▼ 追加：body要素と右下トリガーを取得 ▼▼▼
    const body = document.body;
    const bottomRightTrigger = document.getElementById('bottom-right-trigger');
    // ▲▲▲ 追加箇所 ▲▲▲

    // --- 初期設定 ---
    const DEFAULT_TIME = { h: 1, m: 0, s: 0 };
    
    let secondAngle = 0;
    let minuteAngle = 0;
    let hourAngle = 0;
    
    let isPaused = false;
    
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

    // --- 描画更新 ---
    function updateHands() {
        secondHand.style.transform = `${CENTRAL_TRANSFORM} rotate(${secondAngle}deg)`;
        minuteHand.style.transform = `${CENTRAL_TRANSFORM} rotate(${minuteAngle}deg)`;
        
        if (!isDragging) {
            hourHand.style.transform = `${CENTRAL_TRANSFORM} rotate(${hourAngle}deg)`;
        }

        // 経過時間表示
        let totalSeconds = Math.round(-minuteAngle * 10);
        let sign = "";
        if (totalSeconds < 0) {
            sign = "-";
            totalSeconds = Math.abs(totalSeconds);
        }
        let m = Math.floor(totalSeconds / 60);
        let s = totalSeconds % 60;
        let mStr = m.toString().padStart(2, '0');
        let sStr = s.toString().padStart(2, '0');
        timeDisplay.textContent = `${sign}${mStr}:${sStr}`;
    }

    // --- アニメーションループ ---
    function animate(currentTime) {
        const deltaTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;

        // 停止中でなければ時間を進める
        if (!isPaused) {
            // 逆回転
            secondAngle -= 6 * deltaTime;
            minuteAngle -= 0.1 * deltaTime;
        }
        
        updateHands();
        requestAnimationFrame(animate);
    }

    // --- ドラッグ操作 ---
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


    // --- 隠しコマンド (右上：時間パネル表示) ---
    let tapCountRight = 0;
    let tapTimerRight;

    const handleRightTap = (e) => {
        e.preventDefault();
        tapCountRight++;
        clearTimeout(tapTimerRight);
        if (tapCountRight === 3) {
            controlPanel.classList.toggle('visible');
            tapCountRight = 0;
        } else {
            tapTimerRight = setTimeout(() => { tapCountRight = 0; }, 400);
        }
    };
    secretTrigger.addEventListener('touchstart', handleRightTap, { passive: false });
    secretTrigger.addEventListener('click', handleRightTap);


    // --- 隠しコマンド (左上：58分へジャンプ＆継続) ---
    let tapCountLeft = 0;
    let tapTimerLeft;

    const handleLeftTap = (e) => {
        e.preventDefault();
        tapCountLeft++;
        clearTimeout(tapTimerLeft);
        
        if (tapCountLeft === 3) {
            isPaused = false;
            minuteAngle = -348;
            secondAngle = 0;
            hourAngle = 30 + (minuteAngle / 12);
            updateHands();
            
            tapCountLeft = 0;
        } else {
            tapTimerLeft = setTimeout(() => { tapCountLeft = 0; }, 400);
        }
    };
    topLeftTrigger.addEventListener('touchstart', handleLeftTap, { passive: false });
    topLeftTrigger.addEventListener('click', handleLeftTap);


    // ▼▼▼ 新規追加：隠しコマンド (右下：画像パネル表示) ▼▼▼
    let tapCountBottomRight = 0;
    let tapTimerBottomRight;

    const handleBottomRightTap = (e) => {
        e.preventDefault();
        tapCountBottomRight++;
        clearTimeout(tapTimerBottomRight);
        if (tapCountBottomRight === 3) {
            // image-control-panel の表示/非表示を切り替える
            imageControlPanel.classList.toggle('visible');
            tapCountBottomRight = 0;
        } else {
            tapTimerBottomRight = setTimeout(() => { tapCountBottomRight = 0; }, 400);
        }
    };
    
    if (bottomRightTrigger) {
        bottomRightTrigger.addEventListener('touchstart', handleBottomRightTap, { passive: false });
        bottomRightTrigger.addEventListener('click', handleBottomRightTap);
    }
    // ▲▲▲ 新規追加 ▲▲▲


    // --- ボタン操作 (時間調整) ---
    
    resetBtn.addEventListener('click', () => {
        isPaused = false;
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

    syncHourBtn.addEventListener('click', () => {
        const startOffset = (DEFAULT_TIME.h % 12) * 30;
        hourAngle = startOffset + (minuteAngle / 12);
        updateHands();
    });

    // --- 画像切り替え処理 ---
    imageSelectButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const imageName = e.currentTarget.getAttribute('data-image');
            
            // まずはbodyのwhite-screenクラスを解除
            body.classList.remove('white-screen');

            if (imageName === 'clock') {
                // 「時計」を選択した場合: 画像を非表示にし、時計を表示
                displayImage.classList.add('hidden-image');
                displayImage.src = ""; 
                
            } else if (imageName === 'white.png') {
                // 「白」を選択した場合: bodyにwhite-screenクラスを付与
                body.classList.add('white-screen');
                displayImage.classList.add('hidden-image'); 
                displayImage.src = "";
            }
            else {
                // その他の画像を選択した場合: 画像を表示し、時計の上に重ねる
                displayImage.src = imageName;
                displayImage.classList.remove('hidden-image');
            }
        });
    });

    // --- 開始 ---
    displayImage.classList.add('hidden-image');
    body.classList.remove('white-screen');
    setTime(DEFAULT_TIME.h, DEFAULT_TIME.m, DEFAULT_TIME.s);
    requestAnimationFrame(animate);
});