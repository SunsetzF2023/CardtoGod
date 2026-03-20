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
            turnCount: 0,
            currentState: 'idle',         // 游戏状态机: idle, cultivating, battling, resting, exploring
            stateDuration: 0             // 当前状态持续时间
        };
        
        // 随机事件系统
        this.randomEventChance = 0.1; // 基础10%概率
        this.lastRandomEvent = 0;
        
        // 气运影响的事件
        this.luckEvents = {
            highLuck: [    // 高气运事件
                { type: 'fortune_treasure', chance: 0.3, description: '发现神秘宝箱' },
                { type: 'master_guidance', chance: 0.2, description: '偶遇高人指点' },
                { type: 'spiritual_enlightenment', chance: 0.25, description: '顿悟突破' },
                { type: 'rare_herb', chance: 0.25, description: '发现灵药' }
            ],
            lowLuck: [     // 低气运事件
                { type: 'ambushed', chance: 0.4, description: '遭遇埋伏' },
                { type: 'cursed', chance: 0.3, description: '遭遇诅咒' },
                { type: 'lost_way', chance: 0.3, description: '迷路了' }
            ]
        };
        
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
            
            // 初始化UI管理器（延迟导入避免循环依赖）
            const { UIManager } = await import('../ui/UIManager.js');
            this.uiManager = new UIManager(this);
            await this.uiManager.init();
            
            // 绑定玩家事件
            this.bindPlayerEvents();
            
            // 初始化气运系统
            this.player.updateLuck();
            
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
            // 立即更新UI
            if (this.uiManager) {
                this.uiManager.updatePlayerInfo();
            }
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
        this.gameState.stateDuration++;
        
        // 处理状态机
        this.processStateMachine();
        
        // 处理每回合逻辑
        this.processTurn();
        
        // 触发随机事件（受气运影响）
        this.checkRandomEvents();
        
        // 处理定时器
        this.processTimers();
        
        // 触发更新事件
        this.triggerEvent('gameUpdate', {
            turnCount: this.gameState.turnCount,
            gameTime: this.gameState.gameTime,
            currentState: this.gameState.currentState,
            player: this.player
        });
    }

    /**
     * 状态机处理
     */
    processStateMachine() {
        const currentState = this.gameState.currentState;
        const player = this.player;
        
        switch (currentState) {
            case 'idle':
                // 空闲状态，随机切换到其他状态
                if (this.gameState.stateDuration > 5) {
                    this.switchToRandomState();
                }
                break;
                
            case 'cultivating':
                // 修炼状态，持续获得修为
                if (this.gameState.turnCount % 2 === 0) { // 每2秒修炼一次
                    player.cultivate(1);
                }
                // 修炼疲劳，自动切换到休息
                if (this.gameState.stateDuration > 30) {
                    this.changeState('resting');
                    this.addLog('修炼疲劳，需要休息一下', 'info');
                }
                break;
                
            case 'battling':
                // 战斗状态，由战斗系统管理
                break;
                
            case 'resting':
                // 休息状态，恢复体力和灵力
                if (this.gameState.turnCount % 3 === 0) {
                    player.restoreSpiritPower(5);
                    player.heal(3);
                }
                // 休息完成，切换到空闲
                if (this.gameState.stateDuration > 10) {
                    this.changeState('idle');
                    this.addLog('休息完成，精神饱满', 'success');
                }
                break;
                
            case 'exploring':
                // 探索状态，增加随机事件概率
                if (this.gameState.stateDuration > 15) {
                    this.changeState('idle');
                    this.addLog('探索结束，返回安全区域', 'info');
                }
                break;
        }
    }

    /**
     * 切换游戏状态
     */
    changeState(newState) {
        const oldState = this.gameState.currentState;
        this.gameState.currentState = newState;
        this.gameState.stateDuration = 0;
        
        // 更新玩家状态
        this.player.gameState = newState;
        
        this.triggerEvent('gameStateChanged', { oldState, newState });
    }

    /**
     * 随机切换状态
     */
    switchToRandomState() {
        const states = ['cultivating', 'resting', 'exploring'];
        const weights = [0.4, 0.3, 0.3]; // 权重
        
        const random = Math.random();
        let cumulative = 0;
        
        for (let i = 0; i < states.length; i++) {
            cumulative += weights[i];
            if (random <= cumulative) {
                this.changeState(states[i]);
                break;
            }
        }
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
     * 检查随机事件 - 受气运影响
     */
    checkRandomEvents() {
        const player = this.player;
        const luckBonus = player.luck.bonus.dropRate / 100;
        const actualChance = this.randomEventChance + luckBonus;
        
        // 探索状态下事件概率更高
        const stateMultiplier = this.gameState.currentState === 'exploring' ? 2.0 : 1.0;
        const finalChance = Math.min(0.5, actualChance * stateMultiplier);
        
        if (Math.random() < finalChance && 
            this.gameState.turnCount - this.lastRandomEvent > 30) {
            
            this.triggerRandomEvent();
            this.lastRandomEvent = this.gameState.turnCount;
        }
    }

    /**
     * 触发随机事件 - 根据气运选择不同事件
     */
    triggerRandomEvent() {
        const player = this.player;
        const luckValue = player.luck.value;
        
        let event;
        if (luckValue >= 75) {
            // 高气运：触发好运事件
            const highLuckEvents = this.luckEvents.highLuck;
            event = highLuckEvents[Math.floor(Math.random() * highLuckEvents.length)];
            this.executeHighLuckEvent(event);
        } else if (luckValue < 25) {
            // 低气运：触发坏运事件
            const lowLuckEvents = this.luckEvents.lowLuck;
            event = lowLuckEvents[Math.floor(Math.random() * lowLuckEvents.length)];
            this.executeLowLuckEvent(event);
        } else {
            // 中等气运：普通随机事件
            this.triggerNormalRandomEvent();
        }
    }

    /**
     * 普通随机事件
     */
    triggerNormalRandomEvent() {
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
     * 执行高气运事件
     */
    executeHighLuckEvent(event) {
        const player = this.player;
        
        switch (event.type) {
            case 'fortune_treasure':
                const cards = this.cardSystem.generateRandomCards(2, 'rare');
                cards.forEach(card => player.addCard(card));
                this.addLog(`🎉 ${event.description}！获得稀有卡牌！`, 'success');
                player.changeLuck(5); // 增加气运
                break;
                
            case 'master_guidance':
                const cultivationGain = 100 + Math.floor(Math.random() * 100);
                player.cultivate(cultivationGain);
                this.addLog(`🎉 ${event.description}！修为增加${cultivationGain}！`, 'success');
                player.changeLuck(3);
                break;
                
            case 'spiritual_enlightenment':
                player.changeLuck(10);
                player.cultivate(200);
                this.addLog(`🎉 ${event.description}！气运大增，修为暴涨！`, 'success');
                break;
                
            case 'rare_herb':
                player.addSpiritStones(100);
                this.addLog(`🎉 ${event.description}！获得100灵石！`, 'success');
                player.changeLuck(2);
                break;
        }
        
        this.triggerEvent('highLuckEvent', event);
    }

    /**
     * 执行低气运事件
     */
    executeLowLuckEvent(event) {
        const player = this.player;
        
        switch (event.type) {
            case 'ambushed':
                const damage = Math.floor(player.stats.maxHealth * 0.2);
                player.takeDamage(damage);
                this.addLog(`💀 ${event.description}！受到${damage}点伤害！`, 'error');
                player.changeLuck(-5);
                break;
                
            case 'cursed':
                player.changeLuck(-10);
                this.addLog(`💀 ${event.description}！气运大幅下降！`, 'error');
                break;
                
            case 'lost_way':
                player.addSpiritStones(-20);
                this.addLog(`💀 ${event.description}！损失20灵石！`, 'error');
                player.changeLuck(-3);
                break;
        }
        
        this.triggerEvent('lowLuckEvent', event);
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
