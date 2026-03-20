/**
 * 重构后的战斗系统主类
 * 组合多个模块，职责分离
 */

import { BattleCore } from './battle/BattleCore.js';
import { BattleTurnProcessor } from './battle/BattleTurnProcessor.js';
import { BattleAI } from './battle/BattleAI.js';

export class Battle {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        
        // 组合各个模块
        this.core = new BattleCore(gameEngine);
        this.turnProcessor = new BattleTurnProcessor(this.core);
        this.ai = new BattleAI(this.core);
        
        // 兼容性属性
        this.currentBattle = null;
        this.config = this.core.config;
    }

    /**
     * 初始化
     */
    async init() {
        console.log('初始化模块化战斗系统...');
    }

    /**
     * 开始战斗 - 委托给核心模块
     */
    startBattle(player, enemy, battleType) {
        console.log('Battle.startBattle - delegating to core');
        
        this.currentBattle = this.core.startBattle(player, enemy, battleType);
        
        // 如果敌人先手，开始处理回合
        if (this.currentBattle.currentActor === 'enemy') {
            setTimeout(() => this.processBattleTurn(), 1000);
        }
        
        return this.currentBattle;
    }

    /**
     * 处理战斗回合 - 委托给回合处理器
     */
    async processBattleTurn() {
        await this.turnProcessor.processTurn();
    }

    /**
     * 玩家选择行动
     */
    playerChooseAction(actionType, skillId = null) {
        if (!this.currentBattle || this.currentBattle.status !== 'ongoing') {
            return { success: false, message: '没有进行中的战斗' };
        }
        
        if (this.currentBattle.currentActor !== 'player') {
            return { success: false, message: '还不是你的回合' };
        }
        
        const player = this.currentBattle.participants.player;
        const opponent = this.currentBattle.participants.enemy;
        
        // 执行玩家行动
        switch (actionType) {
            case 'attack':
                this.turnProcessor.executeAttack(player, opponent, player.skills.find(s => s.id === 'basic_attack'));
                break;
            case 'defend':
                this.turnProcessor.executeDefend(player);
                break;
        }
        
        // 切换到敌人回合
        this.core.switchActor();
        setTimeout(() => this.processBattleTurn(), this.config.actionDelay);
        
        return { success: true };
    }

    /**
     * 获取当前战斗 - 兼容性方法
     */
    getCurrentBattle() {
        return this.currentBattle;
    }

    /**
     * 添加战斗日志 - 兼容性方法
     */
    addBattleLog(message) {
        this.core.addBattleLog(message);
    }

    /**
     * 获取境界等级 - 兼容性方法
     */
    getRealmLevel(realm) {
        return this.core.getRealmLevel(realm);
    }

    // 其他兼容性方法...
    getCurrentActor() {
        return this.core.getCurrentActor();
    }

    getOpponent() {
        return this.core.getOpponent();
    }

    endBattle(result) {
        this.core.endBattle(result);
    }
}
