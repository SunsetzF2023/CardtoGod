/**
 * 游戏引擎类
 * 负责管理游戏主循环、事件处理、状态管理
 */

import { Player } from './Player.js';
import { CardSystem } from './CardSystem.js';
import { Battle } from './Battle.js';
import { CONSTANTS, ENEMY_TYPES, BATTLE_TYPES, STORAGE_KEYS } from '../data/constants.js';

export class GameEngine {
    constructor() {
        this.player = null;
        this.cardSystem = null;
        this.battleSystem = null;
        
        // 游戏状态
        this.gameState = {
            isPaused: false,
            isRunning: false,
            currentView: 'cultivation',
            gameTime: 0,
            lastUpdate: Date.now(),
            turnCount: 0
        };
        
        // 随机事件系统
        this.randomEventChance = 0.1; // 每回合10%概率触发随机事件
        this.lastRandomEvent = 0;
        
        // 事件监听器
        this.eventListeners = new Map();
        
        // 定时器
        this.timers = new Map();
    }

    /**
     * 初始化游戏引擎
     */
    async init() {
        try {
            console.log('初始化游戏引擎...');
            
            // 初始化玩家
            await this.initPlayer();
            
            // 初始化卡牌系统
            this.cardSystem = new CardSystem(this);
            await this.cardSystem.init();
            
            // 初始化战斗系统
            this.battleSystem = new Battle(this);
            await this.battleSystem.init();
            
            // 绑定玩家事件
            this.bindPlayerEvents();
            
            // 启动游戏
            this.startGame();
            
            console.log('游戏引擎初始化完成');
            
        } catch (error) {
            console.error('游戏引擎初始化失败:', error);
            throw error;
        }
    }

    /**
     * 初始化玩家
     */
    async initPlayer() {
        // 尝试加载已存档
        this.player = Player.load();
        
        if (!this.player) {
            // 创建新玩家
            this.player = new Player();
            this.player.save();
            console.log('创建新玩家');
        } else {
            console.log('加载玩家存档');
        }
    }

    /**
     * 绑定玩家事件
     */
    bindPlayerEvents() {
        // 监听玩家属性变化
        this.player.addEventListener('statsChanged', (stats) => {
            this.triggerEvent('playerStatsChanged', stats);
        });
        
        this.player.addEventListener('levelUp', (data) => {
            this.addLog(`恭喜升级到 Lv.${data.level}！`, 'success');
            this.triggerEvent('playerLevelUp', data);
        });
        
        this.player.addEventListener('realmBreakthrough', (data) => {
            this.addLog(`恭喜突破到 ${data.newRealm}！`, 'success');
            this.triggerEvent('playerRealmBreakthrough', data);
        });
        
        this.player.addEventListener('spiritStonesGained', (data) => {
            this.triggerEvent('spiritStonesChanged', this.player.resources.spiritStones);
        });
        
        this.player.addEventListener('spiritStonesConsumed', (data) => {
            this.triggerEvent('spiritStonesChanged', this.player.resources.spiritStones);
        });
        
        this.player.addEventListener('cardEquipped', (data) => {
            this.addLog(`装备了 ${data.card.name}`, 'info');
            this.triggerEvent('inventoryChanged', this.player.inventory);
        });
        
        this.player.addEventListener('cardAdded', (data) => {
            this.addLog(`获得了 ${data.card.name}`, 'success');
            this.triggerEvent('inventoryChanged', this.player.inventory);
        });
    }

    /**
     * 启动游戏
     */
    startGame() {
        this.gameState.isRunning = true;
        this.gameState.isPaused = false;
        this.gameState.lastUpdate = Date.now();
        
        this.addLog('游戏开始！', 'success');
        this.triggerEvent('gameStarted');
    }

    /**
     * 游戏主循环 - 每秒执行
     */
    update() {
        if (!this.gameState.isRunning || this.gameState.isPaused) {
            return;
        }
        
        const now = Date.now();
        const deltaTime = (now - this.gameState.lastUpdate) / 1000; // 转换为秒
        this.gameState.lastUpdate = now;
        
        // 更新游戏时间
        this.gameState.gameTime += deltaTime;
        this.gameState.turnCount++;
        
        // 处理每回合逻辑
        this.processTurn();
        
        // 触发随机事件
        this.checkRandomEvents();
        
        // 自动修炼
        this.processAutoCultivation();
        
        // 处理定时器
        this.processTimers();
        
        // 触发更新事件
        this.triggerEvent('gameUpdate', {
            turnCount: this.gameState.turnCount,
            gameTime: this.gameState.gameTime,
            player: this.player
        });
    }

    /**
     * 处理回合逻辑
     */
    processTurn() {
        // 每秒恢复少量灵力
        if (this.gameState.turnCount % 5 === 0) { // 每5秒恢复一次
            const spiritRestore = Math.floor(this.player.stats.maxSpiritPower * 0.05);
            this.player.restoreSpiritPower(spiritRestore);
        }
        
        // 每分钟恢复少量生命值
        if (this.gameState.turnCount % 60 === 0) {
            const healthRestore = Math.floor(this.player.stats.maxHealth * 0.02);
            this.player.heal(healthRestore);
        }
        
        // 增加年龄
        if (this.gameState.turnCount % 3600 === 0) { // 每小时增加一岁
            this.player.age++;
            if (this.player.age >= this.player.lifespan) {
                this.triggerGameOver('寿命耗尽');
            }
        }
    }

    /**
     * 检查随机事件
     */
    checkRandomEvents() {
        if (Math.random() < this.randomEventChance && 
            this.gameState.turnCount - this.lastRandomEvent > 30) {
            
            this.triggerRandomEvent();
            this.lastRandomEvent = this.gameState.turnCount;
        }
    }

    /**
     * 触发随机事件
     */
    triggerRandomEvent() {
        const events = [
            this.eventEncounterBeast,
            this.eventFindSpiritStone,
            this.eventEncounterCultivator,
            this.eventFindTreasure,
            this.eventEnlightenment
        ];
        
        const event = events[Math.floor(Math.random() * events.length)];
        event.call(this);
    }

    /**
     * 随机事件：偶遇妖兽
     */
    eventEncounterBeast() {
        const beast = this.generateRandomEnemy(ENEMY_TYPES.BEAST);
        this.addLog(`偶遇 ${beast.name}！`, 'warning');
        this.triggerEvent('randomEvent', { type: 'beast_encounter', enemy: beast });
        
        // 可以选择战斗或逃跑
        if (this.player.settings.autoBattle) {
            this.startBattle(beast);
        }
    }

    /**
     * 随机事件：发现灵石
     */
    eventFindSpiritStone() {
        const amount = Math.floor(Math.random() * 50) + 10;
        this.player.addSpiritStones(amount);
        this.addLog(`幸运地发现了 ${amount} 枚灵石！`, 'success');
        this.triggerEvent('randomEvent', { type: 'spirit_stone_found', amount });
    }

    /**
     * 随机事件：偶遇修士
     */
    eventEncounterCultivator() {
        const cultivator = this.generateRandomEnemy(ENEMY_TYPES.CULTIVATOR);
        this.addLog(`偶遇 ${cultivator.name}！`, 'info');
        this.triggerEvent('randomEvent', { type: 'cultivator_encounter', enemy: cultivator });
    }

    /**
     * 随机事件：发现宝藏
     */
    eventFindTreasure() {
        const cards = this.cardSystem.generateRandomCards(1, 'rare');
        cards.forEach(card => this.player.addCard(card));
        this.addLog(`发现了宝箱，获得了 ${cards[0].name}！`, 'success');
        this.triggerEvent('randomEvent', { type: 'treasure_found', cards });
    }

    /**
     * 随机事件：顿悟
     */
    eventEnlightenment() {
        const cultivationGain = Math.floor(Math.random() * 100) + 50;
        const result = this.player.cultivate(cultivationGain);
        this.addLog(`顿悟！修为增加 ${result.gain}！`, 'success');
        this.triggerEvent('randomEvent', { type: 'enlightenment', gain: result.gain });
    }

    /**
     * 生成随机敌人
     */
    generateRandomEnemy(type) {
        const enemyTemplates = {
            [ENEMY_TYPES.BEAST]: [
                { name: '野狼', level: 1, attack: 8, defense: 5, health: 30 },
                { name: '野猪', level: 2, attack: 12, defense: 8, health: 50 },
                { name: '老虎', level: 3, attack: 18, defense: 12, health: 80 }
            ],
            [ENEMY_TYPES.CULTIVATOR]: [
                { name: '炼气修士', level: 2, attack: 15, defense: 10, health: 60 },
                { name: '筑基修士', level: 5, attack: 25, defense: 20, health: 120 }
            ]
        };
        
        const templates = enemyTemplates[type] || enemyTemplates[ENEMY_TYPES.BEAST];
        const template = templates[Math.floor(Math.random() * templates.length)];
        
        return {
            id: 'enemy_' + Date.now(),
            type: type,
            ...template,
            maxHealth: template.health,
            spiritPower: 30,
            maxSpiritPower: 30,
            speed: 10,
            rewards: {
                exp: template.level * 10,
                spiritStones: template.level * 5
            }
        };
    }

    /**
     * 处理自动修炼
     */
    processAutoCultivation() {
        // 如果玩家开启自动修炼，每秒进行修炼
        if (this.gameState.currentView === 'cultivation') {
            this.player.cultivate(1);
        }
    }

    /**
     * 处理定时器
     */
    processTimers() {
        // 处理各种定时效果
        for (const [id, timer] of this.timers) {
            timer.remaining -= 1;
            if (timer.remaining <= 0) {
                timer.callback();
                this.timers.delete(id);
            }
        }
    }

    /**
     * 添加定时器
     */
    addTimer(id, duration, callback) {
        this.timers.set(id, {
            remaining: duration,
            callback: callback
        });
    }

    /**
     * 开始战斗
     */
    startBattle(enemy) {
        this.gameState.currentView = 'battle';
        this.battleSystem.startBattle(this.player, enemy);
        this.triggerEvent('battleStarted', { enemy });
    }

    /**
     * 抽取卡包
     */
    drawCardPack(packType = 'basic') {
        if (!this.player.consumeSpiritStones(this.cardSystem.getPackPrice(packType))) {
            return { success: false, message: '灵石不足' };
        }
        
        const cards = this.cardSystem.drawCardPack(packType);
        cards.forEach(card => this.player.addCard(card));
        
        this.addLog(`抽取了 ${cards.length} 张卡牌！`, 'success');
        this.triggerEvent('cardsDrawn', { cards, packType });
        
        return { success: true, cards };
    }

    /**
     * 装备卡牌
     */
    equipCard(cardId) {
        const card = this.player.inventory.cards.find(c => c.id === cardId);
        if (!card) {
            return { success: false, message: '卡牌不存在' };
        }
        
        return this.player.equipCard(card);
    }

    /**
     * 使用消耗品
     */
    useConsumable(cardId) {
        const card = this.player.inventory.cards.find(c => c.id === cardId);
        if (!card) {
            return { success: false, message: '卡牌不存在' };
        }
        
        return this.player.useConsumable(card);
    }

    /**
     * 切换游戏视图
     */
    switchView(viewName) {
        this.gameState.currentView = viewName;
        this.triggerEvent('viewChanged', { view: viewName });
    }

    /**
     * 暂停游戏
     */
    pause() {
        this.gameState.isPaused = true;
        this.triggerEvent('gamePaused');
    }

    /**
     * 恢复游戏
     */
    resume() {
        this.gameState.isPaused = false;
        this.gameState.lastUpdate = Date.now();
        this.triggerEvent('gameResumed');
    }

    /**
     * 游戏结束
     */
    triggerGameOver(reason) {
        this.gameState.isRunning = false;
        this.addLog(`游戏结束：${reason}`, 'error');
        this.triggerEvent('gameOver', { reason });
    }

    /**
     * 重新开始游戏
     */
    restart() {
        // 清除存档
        localStorage.removeItem(STORAGE_KEYS.PLAYER_DATA);
        
        // 重新初始化
        this.init();
    }

    /**
     * 保存游戏数据
     */
    saveGameData() {
        try {
            this.player.save();
            
            // 保存游戏状态
            const gameData = {
                gameState: this.gameState,
                lastSave: Date.now()
            };
            localStorage.setItem(STORAGE_KEYS.GAME_SETTINGS, JSON.stringify(gameData));
            
            console.log('游戏数据已保存');
            return true;
        } catch (error) {
            console.error('保存游戏数据失败:', error);
            return false;
        }
    }

    /**
     * 添加游戏日志
     */
    addLog(message, type = 'info') {
        this.triggerEvent('addLog', { message, type });
    }

    /**
     * 添加事件监听器
     */
    addEventListener(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    /**
     * 触发事件
     */
    triggerEvent(event, data) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach(callback => callback(data));
        }
    }

    /**
     * 获取游戏统计信息
     */
    getGameStats() {
        return {
            playTime: this.gameState.gameTime,
            turnCount: this.gameState.turnCount,
            playerLevel: this.player.level,
            playerRealm: this.player.realm,
            combatPower: this.player.getCombatPower(),
            totalCards: this.player.inventory.cards.length,
            equippedCards: Object.values(this.player.inventory.equipped).filter(c => c !== null).length,
            battleWins: this.player.progress.battleWins,
            totalBattles: this.player.progress.totalBattles
        };
    }

    /**
     * 获取玩家状态
     */
    getPlayerStatus() {
        return {
            player: this.player,
            gameState: this.gameState,
            stats: this.getGameStats()
        };
    }
}
