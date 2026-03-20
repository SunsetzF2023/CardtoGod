/**
 * 卡包修仙游戏主类
 * 游戏入口和核心逻辑管理
 * v2.3 - 修复初始化问题
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
            
            // 绑定快捷操作按钮
            this.bindButton('cultivateBtn', () => this.gameEngine.cultivate());
            this.bindButton('battleBtn', () => this.gameEngine.startBattle());
            this.bindButton('packBtn', () => this.ui.showShopView());
            this.bindButton('inventoryBtn', () => this.ui.showInventory());
            this.bindButton('friendsBtn', () => this.ui.showFriendsView());
            
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
     * 绑定按钮事件
     */
    bindButton(buttonId, callback) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', callback);
        } else {
            console.warn(`Button with id '${buttonId}' not found`);
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
                this.ui.showView('cultivation');
                break;
            case 'b':
            case 'B':
                // 打开战斗界面
                this.ui.showView('battle');
                break;
            case 'p':
            case 'P':
                // 打开卡包界面
                this.ui.showView('cardpack');
                break;
            case 'i':
            case 'I':
                // 打开背包界面
                this.ui.showView('inventory');
                break;
            case 'Escape':
                // 关闭当前模态框
                this.ui.closeModal();
                break;
        }
    }

    /**
     * 检查离线奖励
     */
    async checkOfflineRewards() {
        const lastLogin = localStorage.getItem(STORAGE_KEYS.LAST_LOGIN);
        if (!lastLogin) return;
        
        const currentTime = Date.now();
        const offlineHours = (currentTime - parseInt(lastLogin)) / (1000 * 60 * 60);
        
        if (offlineHours < 0.1) return; // 离线少于6分钟不计算
        
        const player = this.gameEngine.player;
        const realmLevel = player.getRealmLevel(player.realm);
        
        // 离线修炼奖励：基于境界和离线时间
        const cultivationPerHour = realmLevel * 10; // 每小时修为
        const totalCultivation = Math.floor(offlineHours * cultivationPerHour);
        
        // 离线灵石奖励
        const spiritStonesPerHour = realmLevel * 5;
        const totalSpiritStones = Math.floor(offlineHours * spiritStonesPerHour);
        
        // 应用离线奖励
        if (totalCultivation > 0) {
            player.cultivate(totalCultivation);
            this.addLog(`离线 ${offlineHours.toFixed(1)} 小时，获得 ${totalCultivation} 点修为！`, 'success');
        }
        
        if (totalSpiritStones > 0) {
            player.addSpiritStones(totalSpiritStones);
            this.addLog(`离线 ${offlineHours.toFixed(1)} 小时，获得 ${totalSpiritStones} 枚灵石！`, 'success');
        }
        
        // 更新UI
        this.ui.updatePlayerInfo();
        
        // 更新最后活跃时间
        localStorage.setItem(STORAGE_KEYS.LAST_LOGIN, currentTime.toString());
    }

    /**
     * 开始游戏循环
     */
    startGameLoop() {
        // 游戏主循环 - 即使失去焦点也继续运行
        setInterval(() => {
            if (this.isInitialized) {
                // 移除document.hidden检查，确保后台也能运行
                this.gameEngine.update();
                this.ui.update();
            }
        }, 1000); // 每秒更新一次
        
        // 离线模式：记录离开时间
        window.addEventListener('beforeunload', () => {
            localStorage.setItem('lastActiveTime', Date.now().toString());
        });
        
        // 页面可见性变化时检查离线奖励
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.checkOfflineRewards();
            }
        });
        
        // 页面获得焦点时检查离线奖励
        window.addEventListener('focus', () => {
            this.checkOfflineRewards();
        });
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
