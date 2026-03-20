/**
 * 卡包修仙游戏主入口文件
 * 负责初始化游戏和管理主要游戏循环
 */

import { GameEngine } from './game/GameEngine.js';
import { UIManager } from './ui/UIManager.js';
import { CONSTANTS, STORAGE_KEYS } from './data/constants.js';

class CardToGod {
    constructor() {
        this.gameEngine = null;
        this.ui = null; // 改为ui以匹配HTML调用
        this.isInitialized = false;
    }

    /**
     * 初始化游戏
     */
    async init() {
        try {
            console.log('正在初始化卡包修仙游戏...');
            
            // 显示加载界面
            this.showLoading(true);
            
            // 初始化游戏引擎
            this.gameEngine = new GameEngine();
            await this.gameEngine.init();
            
            // 初始化UI管理器
            this.ui = new UIManager(this.gameEngine);
            await this.ui.init();
            
            // 绑定全局事件
            this.bindGlobalEvents();
            
            // 检查离线奖励
            await this.checkOfflineRewards();
            
            // 开始游戏循环
            this.startGameLoop();
            
            this.isInitialized = true;
            this.showLoading(false);
            
            console.log('游戏初始化完成！');
            this.addLog('欢迎来到卡包修仙世界！', 'success');
            
        } catch (error) {
            console.error('游戏初始化失败:', error);
            this.showLoading(false);
            this.showError('游戏初始化失败，请刷新页面重试。');
        }
    }

    /**
     * 绑定全局事件
     */
    bindGlobalEvents() {
        // 页面卸载时保存数据
        window.addEventListener('beforeunload', () => {
            if (this.gameEngine) {
                this.gameEngine.saveGameData();
            }
        });

        // 页面可见性变化时处理
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // 页面隐藏时暂停游戏
                this.pauseGame();
            } else {
                // 页面显示时恢复游戏
                this.resumeGame();
            }
        });

        // 键盘快捷键
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardShortcuts(event);
        });
    }

    /**
     * 处理键盘快捷键
     */
    handleKeyboardShortcuts(event) {
        // 防止在输入框中触发快捷键
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        switch (event.key) {
            case 'c':
            case 'C':
                // 打开修炼界面
                this.uiManager.showView('cultivation');
                break;
            case 'b':
            case 'B':
                // 打开战斗界面
                this.uiManager.showView('battle');
                break;
            case 'p':
            case 'P':
                // 打开卡包界面
                this.uiManager.showView('cardpack');
                break;
            case 'i':
            case 'I':
                // 打开背包界面
                this.uiManager.showView('inventory');
                break;
            case 'Escape':
                // 关闭当前模态框
                this.uiManager.closeModal();
                break;
        }
    }

    /**
     * 检查离线奖励
     */
    async checkOfflineRewards() {
        const lastLogin = localStorage.getItem(STORAGE_KEYS.LAST_LOGIN);
        if (lastLogin) {
            const now = Date.now();
            const timeDiff = now - parseInt(lastLogin);
            const hoursOffline = Math.floor(timeDiff / (1000 * 60 * 60));
            
            if (hoursOffline > 0) {
                const maxHours = CONSTANTS.GAME_SETTINGS.ECONOMY.MAX_OFFLINE_HOURS;
                const rewardHours = Math.min(hoursOffline, maxHours);
                const rewardRate = CONSTANTS.GAME_SETTINGS.ECONOMY.OFFLINE_REWARD_RATE;
                const baseReward = 10; // 基础每小时灵石奖励
                const totalReward = Math.floor(baseReward * rewardHours * rewardRate);
                
                if (totalReward > 0) {
                    this.gameEngine.player.addSpiritStones(totalReward);
                    this.addLog(`离线 ${rewardHours} 小时，获得 ${totalReward} 灵石奖励！`, 'success');
                    this.uiManager.updatePlayerInfo();
                }
            }
        }
        
        // 更新最后登录时间
        localStorage.setItem(STORAGE_KEYS.LAST_LOGIN, Date.now().toString());
    }

    /**
     * 开始游戏循环
     */
    startGameLoop() {
        // 游戏主循环 - 每秒更新
        setInterval(() => {
            if (this.isInitialized && !document.hidden) {
                this.gameEngine.update();
                this.uiManager.update();
            }
        }, 1000);

        // 自动保存 - 每30秒
        setInterval(() => {
            if (this.isInitialized) {
                this.gameEngine.saveGameData();
            }
        }, 30000);
    }

    /**
     * 暂停游戏
     */
    pauseGame() {
        if (this.gameEngine) {
            this.gameEngine.pause();
        }
    }

    /**
     * 恢复游戏
     */
    resumeGame() {
        if (this.gameEngine) {
            this.gameEngine.resume();
            this.checkOfflineRewards();
        }
    }

    /**
     * 显示加载界面
     */
    showLoading(show) {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = show ? 'flex' : 'none';
        }
    }

    /**
     * 显示错误信息
     */
    showError(message) {
        this.addLog(message, 'error');
        alert(message); // 简单的错误提示，后续可以改为更优雅的UI
    }

    /**
     * 添加日志消息
     */
    addLog(message, type = 'info') {
        const messageLog = document.getElementById('messageLog');
        if (messageLog) {
            const logEntry = document.createElement('div');
            logEntry.className = `text-${type === 'success' ? 'green' : type === 'error' ? 'red' : 'gray'}-400`;
            logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
            messageLog.appendChild(logEntry);
            messageLog.scrollTop = messageLog.scrollHeight;
            
            // 限制日志条数
            while (messageLog.children.length > 50) {
                messageLog.removeChild(messageLog.firstChild);
            }
        }
    }
}

// 创建游戏实例
window.game = new CardToGod();

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    window.game.init();
});

// 导出游戏实例供其他模块使用
export default window.game;
