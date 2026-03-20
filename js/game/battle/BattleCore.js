/**
 * 战斗核心类 - 基础战斗逻辑
 * 负责战斗的基本流程控制
 */

import { BATTLE_TYPES, BATTLE_STATUS, TECHNIQUE_TYPES } from '../../data/constants.js';

export class BattleCore {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.currentBattle = null;
        this.battleHistory = [];
        
        // 战斗配置
        this.config = {
            maxTurns: 50,
            actionDelay: 1000,
            criticalChance: 0.1,
            evadeChance: 0.05,
        };
    }

    /**
     * 开始战斗
     */
    startBattle(player, enemy, battleType = BATTLE_TYPES.PVE) {
        console.log('BattleCore.startBattle called');
        
        this.currentBattle = this.createBattleInstance(player, enemy, battleType);
        this.determineFirstActor();
        this.currentBattle.status = BATTLE_STATUS.ONGOING;
        
        this.gameEngine.triggerEvent('battleStarted', {
            battle: this.currentBattle,
            enemy: enemy
        });

        this.addBattleLog(`战斗开始！${player.name} VS ${enemy.name}`);
        
        return this.currentBattle;
    }

    /**
     * 创建战斗实例
     */
    createBattleInstance(player, enemy, battleType) {
        return {
            id: 'battle_' + Date.now(),
            type: battleType,
            status: BATTLE_STATUS.PREPARING,
            startTime: new Date(),
            participants: {
                player: this.createBattleParticipant(player, 'player'),
                enemy: this.createBattleParticipant(enemy, 'enemy')
            },
            battleLog: [],
            currentTurn: 0,
            maxTurns: this.config.maxTurns,
            currentActor: null,
            statusEffects: {
                player: new Map(),
                enemy: new Map()
            }
        };
    }

    /**
     * 创建战斗参与者
     */
    createBattleParticipant(entity, type) {
        return {
            type: type,
            original: entity,
            name: entity.name,
            level: entity.level,
            realm: entity.realm || '普通',
            stats: {
                attack: entity.stats?.attack || 10,
                defense: entity.stats?.defense || 10,
                speed: entity.stats?.speed || 10,
                health: entity.stats?.health || 100,
                maxHealth: entity.stats?.maxHealth || 100,
                spiritPower: entity.stats?.spiritPower || 50,
                maxSpiritPower: entity.stats?.maxSpiritPower || 50
            },
            skills: this.getAvailableSkills(entity),
            isDefending: false,
            lastAction: null,
            actionCount: 0
        };
    }

    /**
     * 获取可用技能
     */
    getAvailableSkills(entity) {
        const skills = [];
        
        // 基础攻击技能
        skills.push({
            id: 'basic_attack',
            name: '普通攻击',
            type: TECHNIQUE_TYPES.ATTACK,
            damage: 5,
            spiritCost: 0,
            description: '基础的物理攻击'
        });
        
        return skills;
    }

    /**
     * 确定先手
     */
    determineFirstActor() {
        const player = this.currentBattle.participants.player;
        const enemy = this.currentBattle.participants.enemy;
        
        if (player.stats.speed > enemy.stats.speed) {
            this.currentBattle.currentActor = 'player';
        } else if (enemy.stats.speed > player.stats.speed) {
            this.currentBattle.currentActor = 'enemy';
        } else {
            this.currentBattle.currentActor = Math.random() < 0.5 ? 'player' : 'enemy';
        }
        
        this.addBattleLog(`${this.getCurrentActor().name} 获得先手！`);
    }

    /**
     * 获取当前行动者
     */
    getCurrentActor() {
        return this.currentBattle.participants[this.currentBattle.currentActor];
    }

    /**
     * 获取对手
     */
    getOpponent() {
        const actorType = this.currentBattle.currentActor;
        const opponentType = actorType === 'player' ? 'enemy' : 'player';
        return this.currentBattle.participants[opponentType];
    }

    /**
     * 添加战斗日志
     */
    addBattleLog(message) {
        if (this.currentBattle) {
            this.currentBattle.battleLog.push({
                message: message,
                timestamp: new Date(),
                turn: this.currentBattle.currentTurn
            });
        }
        console.log(`Battle Log: ${message}`);
    }

    /**
     * 获取境界等级
     */
    getRealmLevel(realm) {
        const realmMap = {
            '炼气期': 1, '筑基期': 2, '金丹期': 3, '元婴期': 4,
            '化神期': 5, '炼虚期': 6, '合体期': 7, '大乘期': 8,
            '渡劫期': 9, '仙人期': 10
        };
        return realmMap[realm] || 1;
    }

    /**
     * 切换行动者
     */
    switchActor() {
        this.currentBattle.currentActor = this.currentBattle.currentActor === 'player' ? 'enemy' : 'player';
    }

    /**
     * 结束战斗
     */
    endBattle(result) {
        this.currentBattle.status = result === 'victory' ? BATTLE_STATUS.VICTORY : BATTLE_STATUS.DEFEAT;
        this.currentBattle.endTime = new Date();
        
        this.gameEngine.triggerEvent('battleEnded', {
            battle: this.currentBattle,
            result: result
        });
    }
}
