/**
 * 战斗系统类 - v2.2
 * 负责处理回合制战斗逻辑
 */

import { BATTLE_TYPES, BATTLE_STATUS, TECHNIQUE_TYPES, SPECIAL_EFFECTS } from '../data/constants.js';

export class Battle {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        
        // 战斗状态
        this.currentBattle = null;
        this.battleHistory = [];
        
        // 战斗配置
        this.config = {
            maxTurns: 50,
            actionDelay: 1000, // 动作延迟(ms)
            criticalChance: 0.1, // 暴击率
            evadeChance: 0.05,   // 闪避率
        };
    }

    /**
     * 初始化战斗系统
     */
    async init() {
        console.log('初始化战斗系统...');
        // 战斗系统初始化逻辑
    }

    /**
     * 开始战斗
     */
    startBattle(player, enemy, battleType = BATTLE_TYPES.PVE) {
        // 创建战斗实例
        this.currentBattle = {
            id: 'battle_' + Date.now(),
            type: battleType,
            status: BATTLE_STATUS.PREPARING,
            startTime: new Date(),
            
            // 参与者
            participants: {
                player: this.createBattleParticipant(player, 'player'),
                enemy: this.createBattleParticipant(enemy, 'enemy')
            },
            
            // 战斗记录
            battleLog: [],
            
            // 回合信息
            currentTurn: 0,
            maxTurns: this.config.maxTurns,
            currentActor: null, // 当前行动者
            
            // 特殊状态
            statusEffects: {
                player: new Map(),
                enemy: new Map()
            }
        };

        // 确定先手
        this.determineFirstActor();
        
        // 开始战斗
        this.currentBattle.status = BATTLE_STATUS.ONGOING;
        
        // 触发战斗开始事件
        this.gameEngine.triggerEvent('battleStarted', {
            battle: this.currentBattle,
            enemy: enemy
        });

        // 添加战斗日志
        this.addBattleLog(`战斗开始！${player.name} VS ${enemy.name}`);
        
        // 如果是自动战斗，立即开始
        if (player.settings.autoBattle) {
            this.processBattleTurn();
        }
        
        return this.currentBattle;
    }

    /**
     * 创建战斗参与者
     */
    createBattleParticipant(entity, type) {
        return {
            type: type,
            original: entity, // 原始实体引用
            name: entity.name,
            level: entity.level,
            realm: entity.realm || '普通',
            
            // 战斗属性（制作副本）
            stats: {
                attack: entity.stats?.attack || 10,
                defense: entity.stats?.defense || 10,
                speed: entity.stats?.speed || 10,
                health: entity.stats?.health || 100,
                maxHealth: entity.stats?.maxHealth || 100,
                spiritPower: entity.stats?.spiritPower || 50,
                maxSpiritPower: entity.stats?.maxSpiritPower || 50
            },
            
            // 技能
            skills: this.getAvailableSkills(entity),
            
            // 战斗状态
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
        
        // 从装备的卡牌中获取技能
        if (entity.inventory?.equipped) {
            for (const card of Object.values(entity.inventory.equipped)) {
                if (card && card.type === 'technique') {
                    skills.push({
                        id: card.id,
                        name: card.name,
                        type: card.techniqueType,
                        damage: card.damage || 0,
                        healing: card.healing || 0,
                        spiritCost: card.spiritCost || 0,
                        description: card.description
                    });
                }
            }
        }
        
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
        
        // 比较速度，速度相同则随机
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
     * 处理战斗回合
     */
    async processBattleTurn() {
        if (!this.currentBattle) {
            console.error('Battle: currentBattle is null');
            return;
        }
        
        if (this.currentBattle.status !== BATTLE_STATUS.ONGOING) {
            console.log('Battle: status not ONGOING, current:', this.currentBattle.status);
            return;
        }

        this.currentBattle.currentTurn++;
        
        // 检查回合限制
        if (this.currentBattle.currentTurn > this.config.maxTurns) {
            this.endBattle('draw');
            return;
        }

        const actor = this.getCurrentActor();
        const opponent = this.getOpponent();

        // 处理状态效果
        this.processStatusEffects(actor);

        // 检查是否有人死亡
        if (actor.stats.health <= 0 || opponent.stats.health <= 0) {
            this.determineBattleResult();
            return;
        }

        // 执行行动
        await this.executeAction(actor, opponent);

        // 切换行动者
        this.switchActor();

        // 继续下一回合
        if (this.currentBattle.status === BATTLE_STATUS.ONGOING) {
            setTimeout(() => this.processBattleTurn(), this.config.actionDelay);
        }
    }

    /**
     * 执行行动
     */
    async executeAction(actor, opponent) {
        // 重置防御状态
        actor.isDefending = false;

        // 选择行动
        const action = this.selectAction(actor, opponent);
        
        // 执行行动
        switch (action.type) {
            case 'attack':
                this.executeAttack(actor, opponent, action.skill);
                break;
            case 'defend':
                this.executeDefend(actor);
                break;
            case 'skill':
                this.executeSkill(actor, opponent, action.skill);
                break;
            case 'heal':
                this.executeHeal(actor, action.skill);
                break;
            default:
                this.executeAttack(actor, opponent, null);
        }

        actor.lastAction = action;
        actor.actionCount++;
    }

    /**
     * 选择行动
     */
    selectAction(actor, opponent) {
        // 如果是玩家，返回默认攻击（实际游戏中应该由玩家选择）
        if (actor.type === 'player') {
            return {
                type: 'attack',
                skill: actor.skills.find(s => s.id === 'basic_attack')
            };
        }

        // AI逻辑
        const healthPercent = actor.stats.health / actor.stats.maxHealth;
        const spiritPercent = actor.stats.spiritPower / actor.stats.maxSpiritPower;

        // 血量低时优先治疗或防御
        if (healthPercent < 0.3) {
            const healSkill = actor.skills.find(s => s.type === TECHNIQUE_TYPES.HEALING);
            if (healSkill && spiritPercent >= 0.3) {
                return { type: 'heal', skill: healSkill };
            }
            return { type: 'defend' };
        }

        // 灵力充足时使用技能
        if (spiritPercent >= 0.5 && Math.random() < 0.7) {
            const attackSkills = actor.skills.filter(s => 
                s.type === TECHNIQUE_TYPES.ATTACK && 
                s.spiritCost <= actor.stats.spiritPower
            );
            if (attackSkills.length > 0) {
                const skill = attackSkills[Math.floor(Math.random() * attackSkills.length)];
                return { type: 'skill', skill: skill };
            }
        }

        // 默认攻击
        return {
            type: 'attack',
            skill: actor.skills.find(s => s.id === 'basic_attack')
        };
    }

    /**
     * 获取境界等级
     */
    getRealmLevel(realm) {
        const realmLevels = {
            '炼气期': 1,
            '筑基期': 2,
            '金丹期': 3,
            '元婴期': 4,
            '化神期': 5,
            '炼虚期': 6,
            '合体期': 7,
            '大乘期': 8,
            '渡劫期': 9,
            '仙人期': 10
        };
        return realmLevels[realm] || 1;
    }

    /**
     * 执行攻击
     */
    executeAttack(attacker, defender, skill) {
        const baseDamage = skill ? skill.damage : 5;
        const attackPower = attacker.stats.attack;
        const defensePower = defender.stats.defense * (defender.isDefending ? 1.5 : 1);
        
        // 计算基础伤害
        let damage = Math.max(1, baseDamage + attackPower - defensePower);
        
        // 境界加成：高境界对低境界有额外伤害
        if (attacker.realm && defender.realm) {
            const realmDiff = this.getRealmLevel(attacker.realm) - this.getRealmLevel(defender.realm);
            if (realmDiff > 0) {
                damage = Math.floor(damage * (1 + realmDiff * 0.2)); // 每高一个大境界+20%伤害
            }
        }
        
        // 暴击判定
        const isCritical = Math.random() < this.config.criticalChance;
        if (isCritical) {
            damage = Math.floor(damage * 1.5);
        }
        
        // 闪避判定
        const isEvaded = Math.random() < this.config.evadeChance;
        if (isEvaded) {
            this.addBattleLog(`${defender.name} 闪避了 ${attacker.name} 的攻击！`);
            return;
        }
        
        // 造成伤害
        const actualDamage = Math.min(damage, defender.stats.health); // 不能超过剩余血量
        defender.stats.health -= actualDamage;
        
        // 消耗灵力
        if (skill && skill.spiritCost > 0) {
            attacker.stats.spiritPower -= skill.spiritCost;
        }
        
        // 记录日志
        const actionName = skill ? skill.name : '普通攻击';
        const critText = isCritical ? '（暴击！）' : '';
        this.addBattleLog(
            `${attacker.name} 使用 ${actionName}${critText} 对 ${defender.name} 造成 ${actualDamage} 点伤害`
        );
        
        // 触发伤害事件，更新UI
        this.gameEngine.triggerEvent('battleDamage', {
            attacker: attacker.type,
            defender: defender.type,
            damage: actualDamage,
            remainingHealth: defender.stats.health,
            maxHealth: defender.stats.maxHealth
        });
    }

    /**
     * 执行防御
     */
    executeDefend(actor) {
        actor.isDefending = true;
        // 恢复少量灵力
        const spiritRestore = Math.floor(actor.stats.maxSpiritPower * 0.1);
        actor.stats.spiritPower = Math.min(actor.stats.spiritPower + spiritRestore, actor.stats.maxSpiritPower);
        
        this.addBattleLog(`${actor.name} 进入防御姿态，恢复 ${spiritRestore} 点灵力`);
    }

    /**
     * 执行技能
     */
    executeSkill(caster, target, skill) {
        // 消耗灵力
        caster.stats.spiritPower -= skill.spiritCost;
        
        switch (skill.type) {
            case TECHNIQUE_TYPES.ATTACK:
                this.executeAttack(caster, target, skill);
                break;
            case TECHNIQUE_TYPES.DEFENSE:
                this.executeDefenseSkill(caster, skill);
                break;
            case TECHNIQUE_TYPES.HEALING:
                this.executeHealingSkill(caster, skill);
                break;
            default:
                this.executeAttack(caster, target, skill);
        }
    }

    /**
     * 执行防御技能
     */
    executeDefenseSkill(caster, skill) {
        caster.isDefending = true;
        if (skill && skill.spiritCost > 0) {
            caster.stats.spiritPower -= skill.spiritCost;
        }
        
        const actionName = skill ? skill.name : '基础防御';
        this.addBattleLog(`${caster.name} 使用 ${actionName}`);
    }

    /**
     * 处理状态效果
     */
    processStatusEffects(actor) {
        const effects = this.currentBattle.statusEffects[actor.type];
        
        // 处理持续伤害、治疗等效果
        for (const [effectName, effect] of effects) {
            switch (effectName) {
                case SPECIAL_EFFECTS.POISON:
                    const poisonDamage = Math.floor(actor.stats.maxHealth * 0.05);
                    actor.stats.health -= poisonDamage;
                    effect.duration--;
                    this.addBattleLog(`${actor.name} 受到毒素伤害 ${poisonDamage} 点`);
                    break;
                case SPECIAL_EFFECTS.REGENERATION:
                    const regenHeal = Math.floor(actor.stats.maxHealth * 0.03);
                    actor.stats.health = Math.min(actor.stats.health + regenHeal, actor.stats.maxHealth);
                    effect.duration--;
                    this.addBattleLog(`${actor.name} 再生恢复 ${regenHeal} 点生命值`);
                    break;
            }
            
            // 移除过期效果
            if (effect.duration <= 0) {
                effects.delete(effectName);
            }
        }
    }

    /**
     * 切换行动者
     */
    switchActor() {
        this.currentBattle.currentActor = this.currentBattle.currentActor === 'player' ? 'enemy' : 'player';
    }

    /**
     * 确定战斗结果
     */
    determineBattleResult() {
        const player = this.currentBattle.participants.player;
        const enemy = this.currentBattle.participants.enemy;
        
        let result, winner, loser;
        
        if (player.stats.health <= 0 && enemy.stats.health <= 0) {
            result = 'draw';
        } else if (player.stats.health <= 0) {
            result = 'defeat';
            winner = enemy;
            loser = player;
        } else {
            result = 'victory';
            winner = player;
            loser = enemy;
        }
        
        this.endBattle(result, winner, loser);
    }

    /**
     * 结束战斗
     */
    endBattle(result, winner = null, loser = null) {
        this.currentBattle.status = BATTLE_STATUS[result.toUpperCase()];
        this.currentBattle.endTime = new Date();
        this.currentBattle.duration = Math.floor(
            (this.currentBattle.endTime - this.currentBattle.startTime) / 1000
        );

        // 计算奖励
        const rewards = this.calculateRewards(result, winner, loser);
        this.currentBattle.rewards = rewards;

        // 应用奖励
        this.applyRewards(rewards);

        // 更新玩家统计
        this.updatePlayerStats(result);

        // 添加战斗日志
        this.addBattleLog(`战斗结束！${this.getBattleResultText(result)}`);
        if (rewards.exp > 0) {
            this.addBattleLog(`获得 ${rewards.exp} 点经验`);
        }
        if (rewards.spiritStones > 0) {
            this.addBattleLog(`获得 ${rewards.spiritStones} 枚灵石`);
        }

        // 保存战斗记录
        this.saveBattleHistory();

        // 触发战斗结束事件
        this.gameEngine.triggerEvent('battleEnded', {
            battle: this.currentBattle,
            result: result,
            rewards: rewards
        });

        // 连续战斗机制：击败敌人后有概率触发新战斗
        if (result === 'victory' && winner.type === 'player') {
            this.triggerNextBattle();
        }

        // 恢复玩家状态
        this.restorePlayerStatus();

        // 清理当前战斗
        this.currentBattle = null;
    }

    /**
     * 触发下一场战斗（连续战斗）
     */
    triggerNextBattle() {
        const player = this.gameEngine.player;
        const playerPower = player.getCombatPower();

        // 30%概率触发连续战斗
        if (Math.random() < 0.3) {
            // 生成更强的敌人
            const nextEnemy = this.gameEngine.generateRandomEnemy(ENEMY_TYPES.BEAST);
            nextEnemy.level = Math.floor(nextEnemy.level * 1.2); // 比20%强
            nextEnemy.attack = Math.floor(nextEnemy.attack * 1.3);
            nextEnemy.defense = Math.floor(nextEnemy.defense * 1.25);
            nextEnemy.health = Math.floor(nextEnemy.health * 1.4);

            setTimeout(() => {
                this.addBattleLog('⚠️ 新的敌人出现了！比之前的更强！');
                this.startBattle(player, nextEnemy);
            }, 2000); // 2秒后新战斗

            this.gameEngine.addLog('连续战斗！更强的敌人来袭！', 'warning');
        } else {
            this.gameEngine.addLog('战斗结束，暂时安全', 'success');
        }
    }

    /**
     * 计算奖励
     */
    calculateRewards(result, winner, loser) {
        const rewards = {
            exp: 0,
            spiritStones: 0,
            cards: [],
            items: []
        };

        if (result === 'victory' && winner.type === 'player') {
            const enemy = this.currentBattle.participants.enemy.original;
            
            // 基础奖励 - 改为修为值
            const baseCultivation = enemy.level * 50; // 每级给50点修为
            rewards.cultivation = baseCultivation;
            rewards.exp = Math.floor(baseCultivation * 0.1); // 经验值作为修为的10%
            rewards.spiritStones = enemy.level * 2; // 每级给2个灵石
            
            // 额外奖励
            const levelDiff = enemy.level - winner.level;
            const bonusMultiplier = Math.max(0.5, Math.min(2, 1 + levelDiff * 0.1));
            
            rewards.cultivation = Math.floor(rewards.cultivation * bonusMultiplier);
            rewards.exp = Math.floor(rewards.exp * bonusMultiplier);
            rewards.spiritStones = Math.floor(rewards.spiritStones * bonusMultiplier);
            
            // 随机卡牌奖励（小概率）
            if (Math.random() < 0.1) {
                const cards = this.gameEngine.cardSystem.generateRandomCards(1, 'common');
                rewards.cards = cards;
            }
        } else if (result === 'draw') {
            // 平局少量奖励
            rewards.cultivation = 5;
            rewards.exp = 1;
            rewards.spiritStones = 1;
        }

        return rewards;
    }

    /**
     * 应用奖励
     */
    applyRewards(rewards) {
        const player = this.gameEngine.player;
        
        if (rewards.exp > 0) {
            player.addExp(rewards.exp);
        }
        
        if (rewards.spiritStones > 0) {
            player.addSpiritStones(rewards.spiritStones);
        }
        
        if (rewards.cultivation > 0) {
            player.cultivate(rewards.cultivation);
        }
        
        if (rewards.cards.length > 0) {
            rewards.cards.forEach(card => player.addCard(card));
        }
    }

    /**
     * 更新玩家统计
     */
    updatePlayerStats(result) {
        const player = this.gameEngine.player;
        
        player.progress.totalBattles++;
        
        if (result === 'victory') {
            player.progress.battleWins++;
        }
    }

    /**
     * 恢复玩家状态
     */
    restorePlayerStatus() {
        const player = this.gameEngine.player;
        
        // 恢复到战斗前的状态（这里简化为满血满蓝）
        player.stats.health = player.stats.maxHealth;
        player.stats.spiritPower = player.stats.maxSpiritPower;
    }

    /**
     * 获取战斗结果文本
     */
    getBattleResultText(result) {
        const texts = {
            victory: '胜利！',
            defeat: '失败...',
            draw: '平局'
        };
        return texts[result] || '未知';
    }

    /**
     * 添加战斗日志
     */
    addBattleLog(message) {
        this.currentBattle.battleLog.push({
            turn: this.currentBattle.currentTurn,
            message: message,
            timestamp: new Date()
        });
        
        // 触发日志事件
        this.gameEngine.triggerEvent('battleLog', { message });
    }

    /**
     * 保存战斗记录
     */
    saveBattleHistory() {
        this.battleHistory.push(JSON.parse(JSON.stringify(this.currentBattle)));
        
        // 限制历史记录数量
        if (this.battleHistory.length > 100) {
            this.battleHistory.shift();
        }
    }

    /**
     * 获取战斗历史
     */
    getBattleHistory() {
        return this.battleHistory;
    }

    /**
     * 获取当前战斗状态
     */
    getCurrentBattle() {
        return this.currentBattle;
    }

    /**
     * 玩家选择行动
     */
    playerChooseAction(actionType, skillId = null) {
        if (!this.currentBattle) {
            console.error('Battle: currentBattle is null in playerChooseAction');
            return { success: false, message: '没有进行中的战斗' };
        }
        
        if (this.currentBattle.status !== BATTLE_STATUS.ONGOING) {
            console.log('Battle: status not ONGOING in playerChooseAction, current:', this.currentBattle.status);
            return { success: false, message: '没有进行中的战斗' };
        }
        
        if (this.currentBattle.currentActor !== 'player') {
            return { success: false, message: '还不是你的回合' };
        }
        
        const player = this.currentBattle.participants.player;
        const opponent = this.currentBattle.participants.enemy;
        
        // 执行选择的行动
        switch (actionType) {
            case 'attack':
                const skill = skillId ? 
                    player.skills.find(s => s.id === skillId) : 
                    player.skills.find(s => s.id === 'basic_attack');
                this.executeAttack(player, opponent, skill);
                break;
            case 'defend':
                this.executeDefend(player);
                break;
            case 'skill':
                const selectedSkill = player.skills.find(s => s.id === skillId);
                if (!selectedSkill) {
                    return { success: false, message: '技能不存在' };
                }
                if (selectedSkill.spiritCost > player.stats.spiritPower) {
                    return { success: false, message: '灵力不足' };
                }
                this.executeSkill(player, opponent, selectedSkill);
                break;
            case 'heal':
                const healSkill = player.skills.find(s => s.id === skillId);
                if (!healSkill) {
                    return { success: false, message: '技能不存在' };
                }
                this.executeHeal(player, healSkill);
                break;
            default:
                return { success: false, message: '未知行动类型' };
        }
        
        // 切换到敌人回合
        this.switchActor();
        
        // 继续战斗
        setTimeout(() => this.processBattleTurn(), this.config.actionDelay);
        
        return { success: true };
    }

    /**
     * 逃跑
     */
    attemptEscape() {
        if (!this.currentBattle || this.currentBattle.status !== BATTLE_STATUS.ONGOING) {
            return { success: false, message: '没有进行中的战斗' };
        }
        
        // 计算逃跑成功率
        const player = this.currentBattle.participants.player;
        const enemy = this.currentBattle.participants.enemy;
        
        const levelDiff = enemy.level - player.level;
        const baseChance = 0.5;
        const escapeChance = Math.max(0.1, Math.min(0.9, baseChance - levelDiff * 0.1));
        
        if (Math.random() < escapeChance) {
            this.addBattleLog(`${player.name} 成功逃脱！`);
            this.endBattle('escape');
            return { success: true };
        } else {
            this.addBattleLog(`${player.name} 逃跑失败！`);
            // 逃跑失败切换到敌人回合
            this.switchActor();
            setTimeout(() => this.processBattleTurn(), this.config.actionDelay);
            return { success: false };
        }
    }
}
