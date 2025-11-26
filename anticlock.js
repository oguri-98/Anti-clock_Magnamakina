document.addEventListener('DOMContentLoaded', () => {
    // 要素の取得
    const secondHand = document.getElementById('second-hand');
    const minuteHand = document.getElementById('minute-hand');
    const hourHand = document.getElementById('hour-hand');
    const clock = document.querySelector('.clock-container');
    
    // コントロールパネル要素
    const inputH = document.getElementById('input-h');
    const inputM = document.getElementById('input-m');
    const inputS = document.getElementById('input-s');
    const setBtn = document.getElementById('set-time-btn');
    const secretTrigger = document.getElementById('secret-trigger');
    const controlPanel = document.getElementById('control-panel');

    // 角度変数
    let secondAngle = 0;
    let minuteAngle = 0;
    let hourAngle = 0;
    
    // アニメーション用
    let isDragging = false;
    let lastTime = performance.now();
    
    // 中央配置用のCSS定数
    const CENTRAL_TRANSFORM = 'translate(-50%, -50%)';

    // ==========================================
    // ⚙️ 時間設定・更新ロジック
    // ==========================================

    // 指定した時間から角度を計算してセット
    function setTime(h, m, s) {
        h = -parseInt(h) || 0;
        m = -parseInt(m) || 0;
        s = -parseInt(s) || 0;

        // 角度計算 (通常の時計回りとして計算し、アニメーションで引いていく)
        secondAngle = s * 6;
        minuteAngle = (m * 6) + (s * 0.1);
        hourAngle = ((h % 12) * 30) + (m * 0.5);

        updateHands();
    }

    // 画面の針を描画更新
    function updateHands() {
        secondHand.style.transform = `${CENTRAL_TRANSFORM} scale(2) rotate(${secondAngle}deg)`;
        minuteHand.style.transform = `${CENTRAL_TRANSFORM} scale(2) rotate(${minuteAngle}deg)`;
        
        // 短針はドラッグ中でなければ更新
        if (!isDragging) {
            hourHand.style.transform = `${CENTRAL_TRANSFORM} scale(2) rotate(${hourAngle}deg)`;
        }
    }

    // アニメーションループ (逆回転処理)
    function animate(currentTime) {
        const deltaTime = (currentTime - lastTime) / 1000; // 秒単位の経過時間
        lastTime = currentTime;

        // 逆回転 (反時計回り)
        secondAngle -= 6 * deltaTime;   // 秒針: 1秒で-6度
        minuteAngle -= 0.1 * deltaTime; // 長針: 1秒で-0.1度
        
        // 短針は自動では動かさず、手動位置で固定する仕様
        // (もし長針に合わせて動かしたい場合は hourAngle -= (0.1/12) * deltaTime を追加)

        updateHands();
        requestAnimationFrame(animate);
    }

    // ==========================================
    // 👆 短針のドラッグ操作 (タッチ & マウス)
    // ==========================================
    
    const startDrag = (e) => {
        e.preventDefault(); // スクロール等を防ぐ
        isDragging = true;
        hourHand.style.cursor = 'grabbing';
    };
    
    const dragMove = (e) => {
        if (!isDragging) return;
        
        // タッチまたはマウスの座標を取得
        let clientX, clientY;
        if (e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        // 時計の中心座標を計算
        const rect = clock.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // 中心からの距離(dx, dy)
        const dx = clientX - centerX;
        const dy = clientY - centerY;
        
        // 角度を計算 (ラジアン -> 度)
        let angle = Math.atan2(dy, dx) * (180 / Math.PI);
        angle += 90; // 12時方向を0度に補正
        
        // 角度変数を更新して即時反映
        hourAngle = angle;
        hourHand.style.transform = `${CENTRAL_TRANSFORM} rotate(${hourAngle}deg)`;
    };
    
    const endDrag = () => {
        isDragging = false;
        hourHand.style.cursor = 'grab';
    };
    
    // イベントリスナー登録 (マウス)
    hourHand.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup', endDrag);
    
    // イベントリスナー登録 (タッチ)
    hourHand.addEventListener('touchstart', startDrag);
    document.addEventListener('touchmove', dragMove);
    document.addEventListener('touchend', endDrag);


    // ==========================================
    // 🕵️‍♀️ 隠しコマンド & パネル操作
    // ==========================================
    
    let tapCount = 0;
    let tapTimer;

    // 右上エリアのタップ検出
    const handleSecretTap = (e) => {
        e.preventDefault();
        tapCount++;
        clearTimeout(tapTimer);

        if (tapCount === 3) {
            // 3回タップでパネル表示切り替え
            controlPanel.classList.toggle('visible');
            tapCount = 0;
        } else {
            // 0.4秒以内に次がなければリセット
            tapTimer = setTimeout(() => { tapCount = 0; }, 400);
        }
    };

    secretTrigger.addEventListener('touchstart', handleSecretTap);
    secretTrigger.addEventListener('click', handleSecretTap);

    // 時間設定ボタンクリック
    setBtn.addEventListener('click', () => {
        setTime(inputH.value, inputM.value, inputS.value);
        // 設定したらパネルを閉じる（オプション）
        // controlPanel.classList.remove('visible'); 
    });


    // ==========================================
    // 🚀 アプリ開始
    // ==========================================
    
    // 初期設定: 10時10分30秒からスタート
    setTime(10, 10, 30);
    
    // アニメーション開始
    requestAnimationFrame(animate);
});