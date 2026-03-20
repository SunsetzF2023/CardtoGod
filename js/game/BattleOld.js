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
        console.log('Battle.startBattle called with:', { player, enemy, battleType });
        
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

        console.log('Battle created:', this.currentBattle);

        // 确定先手
        this.determineFirstActor();
        
        // 开始战斗
        this.currentBattle.status = BATTLE_STATUS.ONGOING;
        
        console.log('Battle status set to ONGOING, currentActor:', this.currentBattle.currentActor);
        
        // 触发战斗开始事件
        this.gameEngine.triggerEvent('battleStarted', {
            battle: this.currentBattle,
            enemy: enemy
        });

        // 添加战斗日志
        this.addBattleLog(`战斗开始！${player.name} VS ${enemy.name}`);
        
        // 开始处理战斗回合
        if (this.currentBattle.currentActor === 'enemy') {
            // 敌人先手，立即处理敌人行动
            setTimeout(() => this.processBattleTurn(), 1000);
        }
        
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
        console.log(`Battle: Turn ${this.currentBattle.currentTurn}, currentActor: ${this.currentBattle.currentActor}`);
        
        // 检查回合限制
        if (this.currentBattle.currentTurn > this.config.maxTurns) {
            this.endBattle('draw');
            return;
        }

        const actor = this.getCurrentActor();
        const opponent = this.getOpponent();
        
        console.log(`Battle: Actor is ${actor.name}, opponent is ${opponent.name}`);

        // 检查是否有人死亡
        if (actor.stats.health <= 0 || opponent.stats.health <= 0) {
            this.determineBattleResult();
            return;
        }

        // 如果是玩家回合，等待玩家选择行动
        if (actor.type === 'player') {
            console.log('Battle: Player turn, waiting for player action');
            return;
        }

        // 敌人自动行动
        console.log('Battle: Enemy turn, executing AI action');
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
        console.log(`Battle: executeAction called for ${actor.name}`);
        
        // 重置防御状态
        actor.isDefending = false;

        // 选择行动
        const action = this.selectAction(actor, opponent);
        console.log(`Battle: Selected action:`, action);
        
        // 执行行动
        switch (action.type) {
            case 'attack':
                console.log(`Battle: Executing attack by ${actor.name}`);
                this.executeAttack(actor, opponent, action.skill);
                break;
            case 'defend':
                console.log(`Battle: Executing defend by ${actor.name}`);
                this.executeDefend(actor);
                break;
            case 'skill':
                console.log(`Battle: Executing skill by ${actor.name}`);
                this.executeSkill(actor, opponent, action.skill);
                break;
            case 'heal':
                console.log(`Battle: Executing heal by ${actor.name}`);
                this.executeHeal(actor, action.skill);
                break;
            default:
                console.log(`Battle: Executing default attack by ${actor.name}`);
                this.executeAttack(actor, opponent, null);
        }

        actor.lastAction = action;
        actor.actionCount++;
        console.log(`Battle: Action completed for ${actor.name}`);
    }

    /**
     * 选择行动 - 增强AI逻辑 + 事件系统
     */
    selectAction(actor, opponent) {
        console.log(`Battle: selectAction called for ${actor.name} (type: ${actor.type})`);
        
        // 如果是玩家，返回默认攻击（实际游戏中应该由玩家选择）
        if (actor.type === 'player') {
            console.log(`Battle: Player action selected`);
            return {
                type: 'attack',
                skill: actor.skills.find(s => s.id === 'basic_attack')
            };
        }

        console.log(`Battle: Enemy AI selecting action for ${actor.name}`);
        
        // 增强AI逻辑
        const healthPercent = actor.stats.health / actor.stats.maxHealth;
        const spiritPercent = actor.stats.spiritPower / actor.stats.maxSpiritPower;
        const healthDiff = actor.stats.health - opponent.stats.health;
        const realmDiff = this.getRealmLevel(actor.realm || '炼气期') - this.getRealmLevel(opponent.realm || '炼气期');

        console.log(`Battle: AI stats - health: ${healthPercent.toFixed(2)}, spirit: ${spiritPercent.toFixed(2)}, realmDiff: ${realmDiff}`);

        // 特殊事件触发
        const specialEvent = this.checkSpecialEvents(actor, opponent, healthPercent, realmDiff);
        if (specialEvent) {
            console.log(`Battle: Special event triggered:`, specialEvent);
            return specialEvent;
        }

        // AI策略选择
        const strategy = this.selectAIStrategy(actor, opponent, healthPercent, spiritPercent, healthDiff, realmDiff);
        console.log(`Battle: AI strategy selected: ${strategy}`);
        
        switch (strategy) {
            case 'aggressive':
                return this.selectAggressiveAction(actor, opponent);
            case 'defensive':
                return this.selectDefensiveAction(actor, opponent);
            case 'tactical':
                return this.selectTacticalAction(actor, opponent);
            case 'desperate':
                return this.selectDesperateAction(actor, opponent);
            default:
                console.log(`Battle: Using balanced strategy`);
                return this.selectBalancedAction(actor, opponent);
        }
    }

    /**
     * 检查特殊战斗事件
     */
    checkSpecialEvents(actor, opponent, healthPercent, realmDiff) {
        // 呼叫增援：血量低于30%且境界被压制
        if (healthPercent < 0.3 && realmDiff < -1 && Math.random() < 0.3) {
            this.addBattleLog(`${actor.name} 正在呼叫增援！`);
            return this.triggerReinforcementEvent(actor, opponent);
        }

        // 智能逃跑：血量低于20%且明显不敌
        if (healthPercent < 0.2 && realmDiff < -2 && Math.random() < 0.4) {
            this.addBattleLog(`${actor.name} 试图逃跑！`);
            return this.triggerEscapeEvent(actor, opponent);
        }

        // 狂暴模式：血量低于15%但境界更高
        if (healthPercent < 0.15 && realmDiff > 0 && Math.random() < 0.5) {
            this.addBattleLog(`${actor.name} 进入狂暴状态！`);
            return this.triggerBerserkEvent(actor, opponent);
        }

        // 威吓：高境界对低境界首次见面
        if (realmDiff > 1 && actor.actionCount === 0 && Math.random() < 0.3) {
            this.addBattleLog(`${actor.name} 发出威吓！`);
            return this.triggerIntimidateEvent(actor, opponent);
        }

        // 奇遇事件：战斗中的意外发现
        if (Math.random() < 0.1) {
            return this.triggerRandomEncounterEvent(actor, opponent);
        }

        // 抢劫事件：敌人试图抢劫
        if (actor.type === 'enemy' && healthPercent < 0.4 && Math.random() < 0.2) {
            return this.triggerRobberyEvent(actor, opponent);
        }

        return null;
    }

    /**
     * 触发奇遇事件
     */
    triggerRandomEncounterEvent(actor, opponent) {
        const encounters = [
            {
                type: 'spirit_stone',
                name: '发现灵石矿脉',
                description: '战斗中发现了隐藏的灵石矿脉！',
                effect: () => {
                    const stones = Math.floor(Math.random() * 20) + 10;
                    this.gameEngine.player.addSpiritStones(stones);
                    this.addBattleLog(`获得 ${stones} 枚灵石！`);
                }
            },
            {
                type: 'cultivation_boost',
                name: '感悟天地',
                description: '战斗中的顿悟让你修为大增！',
                effect: () => {
                    const boost = Math.floor(Math.random() * 50) + 20;
                    this.gameEngine.player.cultivate(boost);
                    this.addBattleLog(`感悟获得 ${boost} 点修为！`);
                }
            },
            {
                type: 'storage_bag',
                name: '发现储物袋',
                description: '发现了一个修仙者遗落的储物袋！',
                effect: () => {
                    const bag = this.generateRandomStorageBag();
                    this.addBattleLog(`发现储物袋：${bag.name}！`);
                    this.processStorageBag(bag);
                }
            },
            {
                type: 'passerby_help',
                name: '路人相助',
                description: '一位路过的修仙者为你提供了帮助！',
                effect: () => {
                    const helpType = Math.random();
                    if (helpType < 0.4) {
                        // 治疗
                        const heal = Math.floor(opponent.stats.maxHealth * 0.3);
                        opponent.stats.health = Math.min(opponent.stats.health + heal, opponent.stats.maxHealth);
                        this.addBattleLog(`路人帮你治疗了 ${heal} 点生命！`);
                    } else if (helpType < 0.7) {
                        // 灵力恢复
                        const spirit = Math.floor(opponent.stats.maxSpiritPower * 0.4);
                        opponent.stats.spiritPower = Math.min(opponent.stats.spiritPower + spirit, opponent.stats.maxSpiritPower);
                        this.addBattleLog(`路人帮你恢复了 ${spirit} 点灵力！`);
                    } else {
                        // 临时增益
                        this.addBattleLog(`路人给了你一颗丹药，攻击力临时提升！`);
                        opponent.stats.attack = Math.floor(opponent.stats.attack * 1.2);
                    }
                }
            },
            {
                type: 'ancient_relic',
                name: '上古遗迹',
                description: '战斗中触发了上古遗迹的守护！',
                effect: () => {
                    const relics = ['破旧剑柄', '神秘玉简', '残缺丹方', '古老符箓'];
                    const relic = relics[Math.floor(Math.random() * relics.length)];
                    this.gameEngine.player.addItem({
                        id: 'relic_' + Date.now(),
                        name: relic,
                        type: 'relic',
                        rarity: 'rare',
                        description: '充满神秘力量的上古物品'
                    });
                    this.addBattleLog(`获得上古物品：${relic}！`);
                }
            }
        ];

        const encounter = encounters[Math.floor(Math.random() * encounters.length)];
        this.addBattleLog(`🌟 奇遇：${encounter.name}`);
        this.addBattleLog(encounter.description);
        
        setTimeout(() => {
            encounter.effect();
        }, 1000);

        // 奇遇后正常行动
        return {
            type: 'attack',
            skill: actor.skills.find(s => s.id === 'basic_attack'),
            encounter: true
        };
    }

    /**
     * 触发抢劫事件
     */
    triggerRobberyEvent(actor, opponent) {
        this.addBattleLog(`${actor.name} 试图抢劫你的储物袋！`);
        
        const player = this.gameEngine.player;
        const hasStorageBag = player.inventory?.items?.some(item => item.type === 'storage_bag');
        
        if (hasStorageBag && Math.random() < 0.6) {
            // 抢劫成功
            const stolenStones = Math.min(player.spiritStones, Math.floor(Math.random() * 30) + 10);
            player.spiritStones = Math.max(0, player.spiritStones - stolenStones);
            
            this.addBattleLog(`💔 悲剧！被抢走了 ${stolenStones} 枚灵石！`);
            
            // 激发玩家愤怒
            opponent.stats.attack = Math.floor(opponent.stats.attack * 1.3);
            this.addBattleLog(`你被激怒了，攻击力提升！`);
            
            return {
                type: 'attack',
                skill: actor.skills.find(s => s.id === 'basic_attack'),
                robbery: true
            };
        } else {
            // 抢劫失败
            this.addBattleLog(`${actor.name} 抢劫失败，露出破绽！`);
            actor.stats.defense = Math.floor(actor.stats.defense * 0.8);
            
            return {
                type: 'defend',
                robbery: false
            };
        }
    }

    /**
     * 生成随机储物袋
     */
    generateRandomStorageBag() {
        const bagTypes = [
            { name: '破旧储物袋', quality: 1, value: 20 },
            { name: '普通储物袋', quality: 2, value: 50 },
            { name: '精制储物袋', quality: 3, value: 100 },
            { name: '灵宝储物袋', quality: 4, value: 200 },
            { name: '仙器储物袋', quality: 5, value: 500 }
        ];
        
        const bag = bagTypes[Math.floor(Math.random() * bagTypes.length)];
        
        return {
            ...bag,
            contents: this.generateBagContents(bag.quality)
        };
    }

    /**
     * 生成储物袋内容
     */
    generateBagContents(quality) {
        const contents = [];
        const itemCount = Math.floor(Math.random() * quality) + 1;
        
        for (let i = 0; i < itemCount; i++) {
            const itemType = Math.random();
            if (itemType < 0.4) {
                // 灵石
                contents.push({
                    type: 'spirit_stones',
                    amount: Math.floor(Math.random() * quality * 20) + 10
                });
            } else if (itemType < 0.7) {
                // 丹药
                contents.push({
                    type: 'pill',
                    name: '聚灵丹',
                    effect: 'cultivation',
                    value: Math.floor(Math.random() * quality * 30) + 20
                });
            } else {
                // 材料
                contents.push({
                    type: 'material',
                    name: '灵草',
                    rarity: ['common', 'uncommon', 'rare'][Math.floor(Math.random() * 3)],
                    value: Math.floor(Math.random() * quality * 15) + 5
                });
            }
        }
        
        return contents;
    }

    /**
     * 处理储物袋
     */
    processStorageBag(bag) {
        const player = this.gameEngine.player;
        
        bag.contents.forEach(item => {
            switch (item.type) {
                case 'spirit_stones':
                    player.addSpiritStones(item.amount);
                    break;
                case 'pill':
                    player.cultivate(item.value);
                    break;
                case 'material':
                    player.addItem(item);
                    break;
            }
        });
        
        // 添加储物袋本身
        player.addItem({
            id: 'bag_' + Date.now(),
            name: bag.name,
            type: 'storage_bag',
            quality: bag.quality,
            value: bag.value
        });
    }

    /**
     * 触发增援事件
     */
    triggerReinforcementEvent(actor, opponent) {
        setTimeout(() => {
            // 生成增援敌人
            const reinforcement = this.gameEngine.generateRandomEnemy(ENEMY_TYPES.BEAST);
            reinforcement.level = Math.max(1, actor.level - 1); // 比主角稍弱
            reinforcement.attack = Math.floor(actor.attack * 0.8);
            reinforcement.defense = Math.floor(actor.defense * 0.8);
            reinforcement.health = Math.floor(actor.health * 0.7);
            reinforcement.maxHealth = reinforcement.health;
            
            this.addBattleLog(`增援 ${reinforcement.name} 出现了！`);
            this.triggerReinforcementBattle(reinforcement);
        }, 1500);

        // 原敌人防御一回合
        return { type: 'defend' };
    }

    /**
     * 触发逃跑事件
     */
    triggerEscapeEvent(actor, opponent) {
        const escapeChance = 0.3 + (actor.stats.speed / opponent.stats.speed) * 0.2;
        
        if (Math.random() < escapeChance) {
            // 逃跑成功
            setTimeout(() => {
                this.addBattleLog(`${actor.name} 成功逃跑了！`);
                this.endBattle('player_escape_victory', opponent, actor);
            }, 1000);
            
            return { type: 'defend', message: '正在逃跑...' };
        } else {
            // 逃跑失败
            this.addBattleLog(`${actor.name} 逃跑失败，陷入混乱！`);
            actor.stats.spiritPower = Math.max(0, actor.stats.spiritPower - 10);
            
            return {
                type: 'attack',
                skill: actor.skills.find(s => s.id === 'basic_attack'),
                penalty: true
            };
        }
    }

    /**
     * 触发狂暴事件
     */
    triggerBerserkEvent(actor, opponent) {
        // 狂暴状态：攻击力+50%，防御力-30%
        actor.stats.attack = Math.floor(actor.stats.attack * 1.5);
        actor.stats.defense = Math.floor(actor.stats.defense * 0.7);
        
        this.addBattleLog(`${actor.name} 攻击力大幅提升，防御力下降！`);
        
        // 必定使用最强攻击
        const attackSkills = actor.skills.filter(s => s.type === TECHNIQUE_TYPES.ATTACK);
        if (attackSkills.length > 0) {
            const strongestSkill = attackSkills.reduce((prev, current) => 
                (prev.damage > current.damage) ? prev : current
            );
            return { type: 'skill', skill: strongestSkill, berserk: true };
        }
        
        return { type: 'attack', berserk: true };
    }

    /**
     * 触发威吓事件
     */
    triggerIntimidateEvent(actor, opponent) {
        // 威吓效果：玩家灵力减少，可能有恐惧效果
        const intimidatePower = actor.level * 5;
        const spiritLoss = Math.min(intimidatePower, opponent.stats.spiritPower * 0.2);
        
        opponent.stats.spiritPower = Math.max(0, opponent.stats.spiritPower - spiritLoss);
        
        this.addBattleLog(`${opponent.name} 被威吓，损失 ${Math.floor(spiritLoss)} 点灵力！`);
        
        // 威吓后攻击
        return {
            type: 'attack',
            skill: actor.skills.find(s => s.id === 'basic_attack'),
            intimidate: true
        };
    }

    /**
     * 触发增援战斗
     */
    triggerReinforcementBattle(reinforcement) {
        // 结束当前战斗，立即开始增援战斗
        const currentPlayer = this.currentBattle.participants.player.original;
        const currentEnemy = this.currentBattle.participants.enemy.original;
        
        // 给予当前战斗的部分奖励
        const partialRewards = {
            cultivation: Math.floor(currentEnemy.level * 25),
            spiritStones: currentEnemy.level * 1
        };
        
        this.gameEngine.player.cultivate(partialRewards.cultivation);
        this.gameEngine.player.addSpiritStones(partialRewards.spiritStones);
        
        this.addBattleLog(`击败 ${currentEnemy.name}，获得 ${partialRewards.cultivation} 修为！`);
        
        // 立即开始增援战斗
        setTimeout(() => {
            this.startBattle(currentPlayer, reinforcement);
        }, 2000);
    }

    /**
     * 选择AI策略
     */
    selectAIStrategy(actor, opponent, healthPercent, spiritPercent, healthDiff, realmDiff) {
        // 绝望状态：血量极低
        if (healthPercent < 0.2) {
            return 'desperate';
        }
        
        // 激进策略：血量优势或境界压制
        if (healthDiff > 30 || realmDiff > 1) {
            return Math.random() < 0.7 ? 'aggressive' : 'tactical';
        }
        
        // 防御策略：血量劣势或被境界压制
        if (healthDiff < -30 || realmDiff < -1) {
            return Math.random() < 0.6 ? 'defensive' : 'tactical';
        }
        
        // 战术策略：灵力充足且血量适中
        if (spiritPercent > 0.5 && healthPercent > 0.4 && healthPercent < 0.8) {
            return 'tactical';
        }
        
        // 平衡策略：默认情况
        return 'balanced';
    }

    /**
     * 激进策略
     */
    selectAggressiveAction(actor, opponent) {
        const attackSkills = actor.skills.filter(s => 
            s.type === TECHNIQUE_TYPES.ATTACK && 
            s.spiritCost <= actor.stats.spiritPower
        );
        
        // 优先使用高伤害技能
        if (attackSkills.length > 0 && Math.random() < 0.8) {
            const highDamageSkill = attackSkills.reduce((prev, current) => 
                (prev.damage > current.damage) ? prev : current
            );
            return { type: 'skill', skill: highDamageSkill };
        }
        
        return {
            type: 'attack',
            skill: actor.skills.find(s => s.id === 'basic_attack')
        };
    }

    /**
     * 防御策略
     */
    selectDefensiveAction(actor, opponent) {
        const healthPercent = actor.stats.health / actor.stats.maxHealth;
        const spiritPercent = actor.stats.spiritPower / actor.stats.maxSpiritPower;
        
        // 血量低时优先治疗
        if (healthPercent < 0.4) {
            const healSkill = actor.skills.find(s => s.type === TECHNIQUE_TYPES.HEALING);
            if (healSkill && spiritPercent >= healSkill.spiritCost) {
                return { type: 'heal', skill: healSkill };
            }
        }
        
        // 使用防御技能
        const defenseSkills = actor.skills.filter(s => 
            s.type === TECHNIQUE_TYPES.DEFENSE && 
            s.spiritCost <= actor.stats.spiritPower
        );
        
        if (defenseSkills.length > 0 && Math.random() < 0.7) {
            return { type: 'skill', skill: defenseSkills[0] };
        }
        
        return { type: 'defend' };
    }

    /**
     * 战术策略
     */
    selectTacticalAction(actor, opponent) {
        const spiritPercent = actor.stats.spiritPower / actor.stats.maxSpiritPower;
        const opponentHealthPercent = opponent.stats.health / opponent.stats.maxHealth;
        
        // 对手血量低时，使用终结技能
        if (opponentHealthPercent < 0.3 && spiritPercent > 0.6) {
            const powerfulSkills = actor.skills.filter(s => 
                s.type === TECHNIQUE_TYPES.ATTACK && 
                s.damage > 10 && 
                s.spiritCost <= actor.stats.spiritPower
            );
            
            if (powerfulSkills.length > 0) {
                return { type: 'skill', skill: powerfulSkills[0] };
            }
        }
        
        // 根据灵力情况选择技能
        if (spiritPercent > 0.7) {
            // 灵力充足时使用技能
            const availableSkills = actor.skills.filter(s => 
                s.spiritCost <= actor.stats.spiritPower && 
                s.id !== 'basic_attack'
            );
            
            if (availableSkills.length > 0) {
                const skill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
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
     * 绝望策略
     */
    selectDesperateAction(actor, opponent) {
        const healthPercent = actor.stats.health / actor.stats.maxHealth;
        const spiritPercent = actor.stats.spiritPower / actor.stats.maxSpiritPower;
        
        // 最后的治疗机会
        if (healthPercent < 0.15) {
            const healSkill = actor.skills.find(s => s.type === TECHNIQUE_TYPES.HEALING);
            if (healSkill && spiritPercent >= healSkill.spiritCost) {
                return { type: 'heal', skill: healSkill };
            }
        }
        
        // 赌博式攻击：使用最强技能
        const allSkills = actor.skills.filter(s => s.spiritCost <= actor.stats.spiritPower);
        if (allSkills.length > 0) {
            const strongestSkill = allSkills.reduce((prev, current) => {
                const prevPower = prev.damage || prev.healing || 0;
                const currentPower = current.damage || current.healing || 0;
                return currentPower > prevPower ? current : prev;
            });
            
            return { type: 'skill', skill: strongestSkill };
        }
        
        // 最后的普通攻击
        return {
            type: 'attack',
            skill: actor.skills.find(s => s.id === 'basic_attack')
        };
    }

    /**
     * 平衡策略
     */
    selectBalancedAction(actor, opponent) {
        const healthPercent = actor.stats.health / actor.stats.maxHealth;
        const spiritPercent = actor.stats.spiritPower / actor.stats.maxSpiritPower;
        
        // 血量低时治疗或防御
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
        
        // 改进的伤害计算公式
        let damage = baseDamage + attackPower;
        
        // 防御力减少伤害，但不会让伤害太低
        const defenseReduction = Math.min(defensePower * 0.3, damage * 0.7); // 最多减少70%伤害
        damage = Math.max(3, damage - defenseReduction); // 最少造成3点伤害
        
        // 境界加成：高境界对低境界有额外伤害
        if (attacker.realm && defender.realm) {
            const realmDiff = this.getRealmLevel(attacker.realm) - this.getRealmLevel(defender.realm);
            if (realmDiff > 0) {
                damage = Math.floor(damage * (1 + realmDiff * 0.2)); // 每高一个大境界+20%伤害
            } else if (realmDiff < 0) {
                // 低境界攻击高境界伤害减少
                damage = Math.floor(damage * (1 + realmDiff * 0.1)); // 每低一个大境界-10%伤害
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
        
        // 随机浮动 ±20%
        const randomFactor = 0.8 + Math.random() * 0.4;
        damage = Math.floor(damage * randomFactor);
        
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
            const player = this.gameEngine.player;
            
            // 基础修为奖励 - 基于敌人等级和境界
            const enemyRealmLevel = this.getRealmLevel(enemy.realm || '炼气期');
            const playerRealmLevel = this.getRealmLevel(player.realm);
            const realmDiff = enemyRealmLevel - playerRealmLevel;
            
            // 修为计算公式
            let baseCultivation = enemy.level * 30; // 基础：每级30修为
            
            // 境界加成：击败高境界敌人获得更多修为
            if (realmDiff > 0) {
                baseCultivation = Math.floor(baseCultivation * (1 + realmDiff * 0.5)); // 每高一级+50%
            } else if (realmDiff < 0) {
                baseCultivation = Math.floor(baseCultivation * (1 + realmDiff * 0.2)); // 每低一级-20%
            }
            
            // 战斗时长加成：战斗越久，修为越多
            const battleDuration = this.currentBattle.duration || 0;
            const durationBonus = Math.min(battleDuration / 60, 0.5); // 最多50%加成
            baseCultivation = Math.floor(baseCultivation * (1 + durationBonus));
            
            // 连击加成：快速击败有奖励
            if (this.currentBattle.currentTurn <= 5) {
                baseCultivation = Math.floor(baseCultivation * 1.2); // 20%快速击败加成
            }
            
            rewards.cultivation = baseCultivation;
            rewards.exp = Math.floor(baseCultivation * 0.1); // 经验值作为修为的10%
            rewards.spiritStones = enemy.level * 3 + Math.floor(realmDiff * 2); // 境界差影响灵石
            
            // 特殊事件奖励
            if (this.currentBattle.specialEvents) {
                events.forEach(event => {
                    switch (event.type) {
                        case 'reinforcement':
                            rewards.cultivation = Math.floor(rewards.cultivation * 1.3); // 增援战斗+30%
                            break;
                        case 'berserk':
                            rewards.cultivation = Math.floor(rewards.cultivation * 1.2); // 击败狂暴+20%
                            break;
                        case 'escape':
                            rewards.cultivation = Math.floor(rewards.cultivation * 0.7); // 敌人逃跑-30%
                            break;
                    }
                });
            }
            
            // 随机卡牌奖励（小概率）
            if (Math.random() < 0.15) { // 提高概率
                const cards = this.gameEngine.cardSystem.generateRandomCards(1, 'common');
                rewards.cards = cards;
            }
        } else if (result === 'draw') {
            // 平局少量奖励
            rewards.cultivation = 8;
            rewards.exp = 1;
            rewards.spiritStones = 2;
        } else if (result === 'player_escape_victory') {
            // 敌人逃跑的胜利奖励
            rewards.cultivation = Math.floor(enemy.level * 15); // 一半奖励
            rewards.spiritStones = Math.floor(enemy.level * 1.5);
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
