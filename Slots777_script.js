// Slots777游戏交互逻辑

// 游戏状态变量
let balance = 1000; // 初始余额
let betAmount = 50; // 默认下注金额
let totalBet = 250; // 总投注额
let totalWin = 750; // 总赢取额
let winStreak = 2; // 连胜次数
let isSpinning = false; // 是否正在旋转
let autoSpinInterval = null; // 自动旋转定时器
let playerLevel = 3; // 玩家等级
let playerExp = 450; // 玩家经验值

// 符号配置
const symbols = [
    { id: 'seven', symbol: '7️⃣', probability: 0.05, value: 100 },
    { id: 'diamond', symbol: '💎', probability: 0.10, value: 50 },
    { id: 'cherry', symbol: '🍒', probability: 0.15, value: 25 },
    { id: 'lemon', symbol: '🍋', probability: 0.20, value: 10 },
    { id: 'orange', symbol: '🍊', probability: 0.20, value: 8 },
    { id: 'grape', symbol: '🍇', probability: 0.15, value: 5 },
    { id: 'bar', symbol: 'BAR', probability: 0.10, value: 3 },
    { id: 'wild', symbol: '⭐', probability: 0.05, value: 0 }
];

// 教程相关变量
let currentStep = 1;

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面
    updateBalance();
    updateStats();
    
    // 绑定页面切换事件
    document.querySelectorAll('[data-page]').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            switchPage(page);
        });
    });
    
    // 绑定菜单事件
    document.querySelector('.menu-icon').addEventListener('click', function() {
        document.querySelector('.mobile-nav').classList.add('active');
        document.querySelector('.mobile-nav-overlay').style.display = 'block';
    });
    
    document.querySelector('.close-menu').addEventListener('click', closeMenu);
    document.querySelector('.mobile-nav-overlay').addEventListener('click', closeMenu);
    
    // 绑定下注控制事件
    document.querySelectorAll('.btn-bet')[0].addEventListener('click', decreaseBet);
    document.querySelectorAll('.btn-bet')[1].addEventListener('click', increaseBet);
    
    // 绑定旋转按钮事件
    document.querySelector('.spin-button').addEventListener('click', spin);
    
    // 绑定自动旋转事件
    document.getElementById('autoSpin').addEventListener('change', toggleAutoSpin);
    
    // 绑定模式切换事件
    document.querySelectorAll('.mode-option').forEach(option => {
        option.addEventListener('click', function() {
            const parent = this.parentElement;
            parent.querySelectorAll('.mode-option').forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // 绑定中奖线选择事件
    document.querySelectorAll('.payline-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.payline-option').forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            // 更新可见的中奖线
            const lines = parseInt(this.textContent);
            updatePaylines(lines);
        });
    });
    
    // 绑定弹窗关闭事件
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.style.display = 'none';
        });
    });
    
    // 绑定结果弹窗按钮事件
    document.querySelector('.btn-play-again').addEventListener('click', function() {
        document.getElementById('resultModal').style.display = 'none';
        spin();
    });
    
    document.querySelector('.btn-risk').addEventListener('click', function() {
        document.getElementById('resultModal').style.display = 'none';
        // 显示风险游戏
        document.querySelector('.risk-game').style.display = 'block';
    });
    
    document.querySelector('.btn-collect').addEventListener('click', function() {
        document.getElementById('resultModal').style.display = 'none';
        // 隐藏风险游戏
        document.querySelector('.risk-game').style.display = 'none';
    });
    
    // 首次加载时显示教程
    setTimeout(function() {
        showTutorial();
    }, 1000);
});

// 关闭菜单
function closeMenu() {
    document.querySelector('.mobile-nav').classList.remove('active');
    document.querySelector('.mobile-nav-overlay').style.display = 'none';
}

// 切换页面
function switchPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(page).classList.add('active');
    
    // 更新底部导航激活状态
    document.querySelectorAll('.bottom-nav .nav-item').forEach(nav => nav.classList.remove('active'));
    document.querySelectorAll(`.bottom-nav .nav-item[data-page="${page}"]`).forEach(nav => nav.classList.add('active'));
    
    // 更新侧边菜单激活状态
    document.querySelectorAll('.mobile-nav-item').forEach(nav => nav.classList.remove('active'));
    document.querySelectorAll(`.mobile-nav-item[data-page="${page}"]`).forEach(nav => nav.classList.add('active'));
    
    // 关闭侧边菜单
    closeMenu();
}

// 减少下注金额
function decreaseBet() {
    if (betAmount > 10) {
        betAmount -= 10;
        updateBetAmount();
    }
}

// 增加下注金额
function increaseBet() {
    if (betAmount < 100) {
        betAmount += 10;
        updateBetAmount();
    }
}

// 更新下注金额显示
function updateBetAmount() {
    document.querySelector('.bet-amount').textContent = `¥${betAmount}`;
}

// 更新余额显示
function updateBalance() {
    document.querySelectorAll('.user-balance').forEach(el => {
        el.textContent = `¥${balance}`;
    });
}

// 更新游戏统计
function updateStats() {
    const stats = document.querySelector('.game-stats');
    stats.querySelectorAll('.stat-item')[1].querySelectorAll('div')[1].textContent = `¥${totalBet}`;
    stats.querySelectorAll('.stat-item')[2].querySelectorAll('div')[1].textContent = `¥${totalWin}`;
    stats.querySelectorAll('.stat-item')[3].querySelectorAll('div')[1].textContent = `¥${totalWin - totalBet}`;
    stats.querySelectorAll('.stat-item')[4].querySelectorAll('div')[1].textContent = winStreak;
    stats.querySelectorAll('.stat-item')[5].querySelectorAll('div')[1].textContent = playerLevel;
}

// 更新中奖线显示
function updatePaylines(lines) {
    document.querySelectorAll('.payline-indicator').forEach((line, index) => {
        if (index < lines) {
            line.style.display = 'block';
        } else {
            line.style.display = 'none';
        }
    });
}

// 旋转老虎机
function spin() {
    if (isSpinning) return;
    
    // 检查余额是否足够
    if (balance < betAmount) {
        alert('余额不足，请充值或减少下注金额！');
        return;
    }
    
    isSpinning = true;
    
    // 扣除下注金额
    balance -= betAmount;
    totalBet += betAmount;
    updateBalance();
    
    // 添加旋转动画
    const slotMachine = document.querySelector('.slot-machine');
    slotMachine.classList.add('spinning');
    
    // 移除之前的高亮
    document.querySelectorAll('.symbol').forEach(symbol => {
        symbol.classList.remove('highlight');
    });
    
    // 随机生成结果
    setTimeout(() => {
        slotMachine.classList.remove('spinning');
        
        // 生成随机结果
        const result = generateResult();
        
        // 显示结果
        displayResult(result);
        
        // 计算奖励
        const reward = calculateReward(result);
        
        // 更新余额和统计
        if (reward > 0) {
            balance += reward;
            totalWin += reward;
            winStreak++;
            
            // 检查是否触发特殊事件
            checkSpecialEvents(result, reward);
            
            // 显示获胜结果
            showWinResult(reward);
        } else {
            winStreak = 0;
            
            // 显示失败结果
            showLoseResult();
        }
        
        updateBalance();
        updateStats();
        
        // 增加经验值
        addExperience(betAmount * 0.1);
        
        isSpinning = false;
    }, 2000);
}

// 生成随机结果
function generateResult() {
    const result = [];
    
    // 为每个卷轴生成随机符号
    for (let i = 0; i < 3; i++) {
        const reelResult = [];
        for (let j = 0; j < 3; j++) {
            // 根据概率随机选择符号
            const rand = Math.random();
            let cumProb = 0;
            let selectedSymbol = null;
            
            for (const symbol of symbols) {
                cumProb += symbol.probability;
                if (rand < cumProb) {
                    selectedSymbol = symbol;
                    break;
                }
            }
            
            // 如果没有选中，使用最后一个符号
            if (!selectedSymbol) {
                selectedSymbol = symbols[symbols.length - 1];
            }
            
            reelResult.push(selectedSymbol);
        }
        result.push(reelResult);
    }
    
    return result;
}

// 显示结果
function displayResult(result) {
    const reels = document.querySelectorAll('.reel');
    
    for (let i = 0; i < reels.length; i++) {
        const symbols = reels[i].querySelectorAll('.symbol');
        for (let j = 0; j < symbols.length; j++) {
            symbols[j].textContent = result[i][j].symbol;
        }
    }
}

// 计算奖励
function calculateReward(result) {
    let reward = 0;
    
    // 获取当前选择的中奖线
    const paylineOption = document.querySelector('.payline-option.active');
    const paylines = parseInt(paylineOption.textContent);
    
    // 检查中间行
    const middleRow = [result[0][1], result[1][1], result[2][1]];
    const middleRowReward = checkLine(middleRow);
    if (middleRowReward > 0) {
        highlightSymbols([1, 1, 1]);
        reward += middleRowReward;
    }
    
    if (paylines >= 3) {
        // 检查顶行
        const topRow = [result[0][0], result[1][0], result[2][0]];
        const topRowReward = checkLine(topRow);
        if (topRowReward > 0) {
            highlightSymbols([0, 0, 0]);
            reward += topRowReward;
        }
        
        // 检查底行
        const bottomRow = [result[0][2], result[1][2], result[2][2]];
        const bottomRowReward = checkLine(bottomRow);
        if (bottomRowReward > 0) {
            highlightSymbols([2, 2, 2]);
            reward += bottomRowReward;
        }
    }
    
    if (paylines >= 5) {
        // 检查对角线 (左上到右下)
        const diag1 = [result[0][0], result[1][1], result[2][2]];
        const diag1Reward = checkLine(diag1);
        if (diag1Reward > 0) {
            highlightSymbols([0, 1, 2]);
            reward += diag1Reward;
        }
        
        // 检查对角线 (左下到右上)
        const diag2 = [result[0][2], result[1][1], result[2][0]];
        const diag2Reward = checkLine(diag2);
        if (diag2Reward > 0) {
            highlightSymbols([2, 1, 0]);
            reward += diag2Reward;
        }
    }
    
    // 应用连胜奖励
    if (winStreak >= 10) {
        reward *= 5;
    } else if (winStreak >= 5) {
        reward *= 3;
    } else if (winStreak >= 3) {
        reward *= 2;
    }
    
    return reward;
}

// 检查一行符号是否中奖
function checkLine(line) {
    // 检查是否有Wild符号
    const wildCount = line.filter(symbol => symbol.id === 'wild').length;
    
    // 如果全是Wild，返回最高奖励
    if (wildCount === 3) {
        return betAmount * 100;
    }
    
    // 如果有Wild，检查其他符号是否相同
    if (wildCount > 0) {
        // 获取非Wild符号
        const nonWildSymbols = line.filter(symbol => symbol.id !== 'wild');
        
        // 如果所有非Wild符号相同
        if (nonWildSymbols.length > 0 && nonWildSymbols.every(symbol => symbol.id === nonWildSymbols[0].id)) {
            // 根据Wild数量增加倍数
            const multiplier = wildCount === 1 ? 2 : 3;
            return betAmount * nonWildSymbols[0].value * multiplier;
        }
    }
    
    // 检查所有符号是否相同
    if (line[0].id === line[1].id && line[1].id === line[2].id) {
        return betAmount * line[0].value;
    }
    
    // 检查是否是任意水果组合
    const fruitIds = ['cherry', 'lemon', 'orange', 'grape'];
    const isFruitCombo = line.every(symbol => fruitIds.includes(symbol.id));
    
    if (isFruitCombo) {
        return betAmount * 2;
    }
    
    return 0;
}

// 高亮显示中奖符号
function highlightSymbols(positions) {
    const reels = document.querySelectorAll('.reel');
    
    for (let i = 0; i < reels.length; i++) {
        const symbols = reels[i].querySelectorAll('.symbol');
        symbols[positions[i]].classList.add('highlight');
    }
}

// 检查特殊事件
function checkSpecialEvents(result, reward) {
    // 检查是否触发免费旋转 (三个Wild)
    const allSymbols = result.flat();
    const wildCount = allSymbols.filter(symbol => symbol.id === 'wild').length;
    
    if (wildCount >= 3) {
        setTimeout(() => {
            showFreeSpinsModal();
        }, 1000);
        return;
    }
    
    // 检查是否触发幸运七大奖 (中间行三个7)
    const middleRow = [result[0][1], result[1][1], result[2][1]];
    const isLucky7 = middleRow.every(symbol => symbol.id === 'seven');
    
    if (isLucky7) {
        setTimeout(() => {
            showLucky7Modal();
        }, 1000);
        return;
    }
    
    // 检查是否触发连胜奖励
    if (winStreak === 5) {
        setTimeout(() => {
            showWinStreakModal();
        }, 1000);
        return;
    }
    
    // 检查是否触发累积奖池 (极低概率随机触发)
    if (Math.random() < 0.001) {
        setTimeout(() => {
            showJackpotModal();
        }, 1000);
        return;
    }
}

// 显示获胜结果
function showWinResult(reward) {
    const resultModal = document.getElementById('resultModal');
    const resultContent = resultModal.querySelector('.modal-content');
    
    resultContent.className = 'modal-content win-result';
    resultContent.querySelector('.result-icon').textContent = '🎉';
    resultContent.querySelector('.result-title').textContent = '恭喜您赢了!';
    resultContent.querySelector('.result-amount').textContent = `+¥${reward}`;
    
    resultModal.style.display = 'flex';
}

// 显示失败结果
function showLoseResult() {
    const resultModal = document.getElementById('resultModal');
    const resultContent = resultModal.querySelector('.modal-content');
    
    resultContent.className = 'modal-content lose-result';
    resultContent.querySelector('.result-icon').textContent = '😢';
    resultContent.querySelector('.result-title').textContent = '很遗憾，您输了!';
    resultContent.querySelector('.result-amount').textContent = `-¥${betAmount}`;
    
    resultModal.style.display = 'flex';
}

// 显示免费旋转弹窗
function showFreeSpinsModal() {
    document.getElementById('freeSpinsModal').style.display = 'flex';
}

// 显示幸运七大奖弹窗
function showLucky7Modal() {
    const modal = document.getElementById('lucky7Modal');
    const reward = betAmount * 777;
    
    modal.querySelector('.special-event-reward').textContent = `奖励: ¥${reward}`;
    modal.style.display = 'flex';
    
    // 更新余额
    balance += reward;
    totalWin += reward;
    updateBalance();
    updateStats();
}

// 显示连胜奖励弹窗
function showWinStreakModal() {
    document.getElementById('winStreakModal').style.display = 'flex';
}

// 显示累积奖池弹窗
function showJackpotModal() {
    document.getElementById('jackpotModal').style.display = 'flex';
}

// 显示教程弹窗
function showTutorial() {
    currentStep = 1;
    updateTutorialStep();
    document.getElementById('tutorialModal').style.display = 'flex';
}

// 切换自动旋转
function toggleAutoSpin() {
    const autoSpin = document.getElementById('autoSpin');
    
    if (autoSpin.checked) {
        // 启动自动旋转
        autoSpinInterval = setInterval(function() {
            if (!isSpinning && !document.getElementById('resultModal').style.display || 
                document.getElementById('resultModal').style.display === 'none') {
                spin();
            }
        }, 3000);
    } else {
        // 停止自动旋转
        clearInterval(autoSpinInterval);
    }
}

// 增加经验值
function addExperience(exp) {
    playerExp += exp;
    
    // 检查是否升级
    const expNeeded = 1000 * playerLevel;
    
    if (playerExp >= expNeeded) {
        playerExp -= expNeeded;
        playerLevel++;
        
        // 显示升级奖励
        alert(`恭喜您升级到 ${playerLevel} 级! 奖励: 500金币`);
        balance += 500;
        updateBalance();
    }
    
    // 更新显示
    updateStats();
}

// 教程导航
function nextTutorial() {
    if (currentStep < 3) {
        currentStep++;
        updateTutorialStep();
    }
}

function prevTutorial() {
    if (currentStep > 1) {
        currentStep--;
        updateTutorialStep();
    }
}

function updateTutorialStep() {
    document.querySelectorAll('.tutorial-step').forEach(step => step.classList.remove('active'));
    document.querySelector(`.tutorial-step[data-step="${currentStep}"]`).classList.add('active');
}

function closeTutorial() {
    document.getElementById('tutorialModal').style.display = 'none';
} 