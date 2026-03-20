/**
 * 玩家类
 * 管理玩家的所有属性、状态和行为
 */

import { REALMS, REALM_REQUIREMENTS, CARD_TYPES, EQUIPMENT_SLOTS, STORAGE_KEYS } from '../data/constants.js';
import { CardSchema } from '../data/schemas.js';

export class Player {
    constructor() {
        // 基础信息
        this.id = this.generateId();
        this.name = '修仙者';
        this.level = 1;
        this.realm = REALMS.QI_REFINEMENT;
        this.realmLevel = 1;
        this.age = 16;
        this.lifespan = 100;
        this.cultivation = 0;
        
        // 战斗属性
        this.stats = {
            attack: 10,
            defense: 10,
            speed: 10,
            health: 100,
            maxHealth: 100,
            spiritPower: 50,
            maxSpiritPower: 50
        };
        
        // 资源
        this.resources = {
            spiritStones: 100,
            contribution: 0,
            exp: 0,
            maxExp: 100
        };
        
        // 背包和装备
        this.inventory = {
            cards: [],
            equipped: {
                [EQUIPMENT_SLOTS.WEAPON]: null,
                [EQUIPMENT_SLOTS.ARMOR]: null,
                [EQUIPMENT_SLOTS.ACCESSORY]: null,
                [EQUIPMENT_SLOTS.TECHNIQUE]: null
            },
            items: []
        };
        
        // 进度
        this.progress = {
            currentStage: 'cultivation',
            completedStages: [],
            achievements: [],
            battleWins: 0,
            totalBattles: 0
        };
        
        // 设置
        this.settings = {
            autoBattle: false,
            notifications: true,
            soundEffects: true
        };
        
        // 气运系统
        this.luck = {
            value: 50,              // 气运值 (0-100)
            level: '普通',         // 气运等级
            bonus: {               // 气运加成
                drawRate: 0,       // 抽卡概率加成 (%)
                dropRate: 0,       // 掉宝概率加成 (%)
                cultivation: 0,    // 修炼速度加成 (%)
                breakthrough: 0    // 突破成功率加成 (%)
            }
        };
        
        // 游戏状态
        this.gameState = 'idle';        // 当前状态: idle, cultivating, battling, resting
        
        // 时间记录
        this.lastLogin = new Date();
        this.offlineRewards = {};
        
        // 事件监听器
        this.eventListeners = new Map();
    }

    /**
     * 生成唯一ID
     */
    generateId() {
        return 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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
     * 修炼 - 增加修为和经验
     */
    cultivate(baseGain = 1) {
        const realmMultiplier = this.getRealmMultiplier();
        const actualGain = Math.floor(baseGain * realmMultiplier);
        
        this.cultivation += actualGain;
        this.addExp(actualGain);
        
        // 检查境界突破
        this.checkRealmBreakthrough();
        
        this.triggerEvent('cultivate', {
            gain: actualGain,
            cultivation: this.cultivation,
            realm: this.realm,
            realmLevel: this.realmLevel
        });
        
        return {
            gain: actualGain,
            realm: this.realm,
            realmLevel: this.realmLevel
        };
    }

    /**
     * 增加经验值
     */
    addExp(amount) {
        this.resources.exp += amount;
        
        // 检查升级
        while (this.resources.exp >= this.resources.maxExp) {
            this.levelUp();
        }
    }

    /**
     * 升级
     */
    levelUp() {
        this.resources.exp -= this.resources.maxExp;
        this.level++;
        this.resources.maxExp = this.calculateMaxExp();
        
        // 提升基础属性
        this.stats.maxHealth += 10;
        this.stats.health = this.stats.maxHealth;
        this.stats.maxSpiritPower += 5;
        this.stats.spiritPower = this.stats.maxSpiritPower;
        this.stats.attack += 2;
        this.stats.defense += 2;
        
        this.triggerEvent('levelUp', {
            level: this.level,
            stats: this.stats
        });
    }

    /**
     * 计算最大经验值
     */
    calculateMaxExp() {
        return Math.floor(100 * Math.pow(1.2, this.level - 1));
    }

    /**
     * 获取境界倍率 - 更真实的修仙阶梯感
     */
    getRealmMultiplier() {
        const realmMultipliers = {
            [REALMS.QI_REFINEMENT]: 1.0,        // 炼气期：1倍
            [REALMS.FOUNDATION_ESTABLISHMENT]: 2.5,  // 筑基期：2.5倍
            [REALMS.GOLDEN_CORE]: 6.0,         // 金丹期：6倍
            [REALMS.NASCENT_SOUL]: 15.0,       // 元婴期：15倍
            [REALMS.SOUL_FORMATION]: 35.0,     // 化神期：35倍
            [REALMS.VOID_TUNING]: 80.0,        // 虚神期：80倍
            [REALMS.TRIBULATION]: 180.0,       // 渡劫期：180倍
            [REALMS.MAHAYANA]: 400.0,          // 大乘期：400倍
            [REALMS.IMMORTAL]: 1000.0          // 仙人期：1000倍
        };
        
        const baseMultiplier = realmMultipliers[this.realm] || 1.0;
        const levelBonus = (this.realmLevel - 1) * 0.2; // 每层+20%
        const luckBonus = this.luck.bonus.cultivation / 100; // 气运加成
        
        return baseMultiplier * (1 + levelBonus) * (1 + luckBonus);
    }

    /**
     * 检查境界突破
     */
    checkRealmBreakthrough() {
        const requirements = REALM_REQUIREMENTS[this.realm];
        
        if (this.level >= requirements.level && this.cultivation >= requirements.cultivation) {
            this.breakthroughRealm();
        }
    }

    /**
     * 境界突破
     */
    breakthroughRealm() {
        const realms = Object.values(REALMS);
        const currentIndex = realms.indexOf(this.realm);
        
        if (currentIndex < realms.length - 1) {
            this.realm = realms[currentIndex + 1];
            this.realmLevel = 1;
            this.cultivation = 0;
            
            // 境界突破奖励
            this.stats.maxHealth += 50;
            this.stats.health = this.stats.maxHealth;
            this.stats.maxSpiritPower += 25;
            this.stats.spiritPower = this.stats.maxSpiritPower;
            this.stats.attack += 10;
            this.stats.defense += 10;
            this.lifespan += 100;
            
            this.triggerEvent('realmBreakthrough', {
                newRealm: this.realm,
                stats: this.stats,
                lifespan: this.lifespan
            });
        } else if (this.realmLevel < 9) {
            // 同境界内提升
            this.realmLevel++;
            this.cultivation = 0;
            
            this.stats.maxHealth += 20;
            this.stats.health = this.stats.maxHealth;
            this.stats.attack += 5;
            this.stats.defense += 5;
            
            this.triggerEvent('realmLevelUp', {
                realm: this.realm,
                realmLevel: this.realmLevel,
                stats: this.stats
            });
        }
    }

    /**
     * 消耗灵石
     */
    consumeSpiritStones(amount) {
        if (this.resources.spiritStones >= amount) {
            this.resources.spiritStones -= amount;
            this.triggerEvent('spiritStonesConsumed', { amount });
            return true;
        }
        return false;
    }

    /**
     * 增加灵石
     */
    addSpiritStones(amount) {
        this.resources.spiritStones += amount;
        this.triggerEvent('spiritStonesGained', { amount });
    }

    /**
     * 装备卡牌
     */
    equipCard(card) {
        if (!card || !card.equipmentSlot) {
            return { success: false, message: '该卡牌无法装备' };
        }
        
        // 检查是否满足使用条件
        if (!this.checkCardRequirements(card)) {
            return { success: false, message: '不满足装备条件' };
        }
        
        const slot = card.equipmentSlot;
        const currentCard = this.inventory.equipped[slot];
        
        // 卸下当前装备
        if (currentCard) {
            this.unequipCard(slot);
        }
        
        // 装备新卡牌
        this.inventory.equipped[slot] = card;
        this.applyCardEffects(card);
        
        // 从背包中移除
        const cardIndex = this.inventory.cards.findIndex(c => c.id === card.id);
        if (cardIndex !== -1) {
            this.inventory.cards.splice(cardIndex, 1);
        }
        
        this.triggerEvent('cardEquipped', { card, slot });
        
        return { success: true, message: `成功装备 ${card.name}` };
    }

    /**
     * 卸下卡牌
     */
    unequipCard(slot) {
        const card = this.inventory.equipped[slot];
        if (!card) {
            return { success: false, message: '该位置没有装备' };
        }
        
        // 移除卡牌效果
        this.removeCardEffects(card);
        
        // 放回背包
        this.inventory.cards.push(card);
        this.inventory.equipped[slot] = null;
        
        this.triggerEvent('cardUnequipped', { card, slot });
        
        return { success: true, message: `成功卸下 ${card.name}` };
    }

    /**
     * 应用卡牌效果 - 改为百分比加成，后期更爽
     */
    applyCardEffects(card) {
        const effects = card.effects || {};
        
        // 应用属性加成（百分比模式）
        if (effects.attack) {
            const bonus = Math.floor(this.stats.attack * (effects.attack / 100));
            this.stats.attack += bonus;
        }
        if (effects.defense) {
            const bonus = Math.floor(this.stats.defense * (effects.defense / 100));
            this.stats.defense += bonus;
        }
        if (effects.health) {
            const bonus = Math.floor(this.stats.maxHealth * (effects.health / 100));
            this.stats.maxHealth += bonus;
            this.stats.health += bonus;
        }
        if (effects.spiritPower) {
            const bonus = Math.floor(this.stats.maxSpiritPower * (effects.spiritPower / 100));
            this.stats.maxSpiritPower += bonus;
            this.stats.spiritPower += bonus;
        }
        
        // 固定值加成（修为、寿命等）
        if (effects.cultivation) {
            this.cultivation += effects.cultivation;
        }
        if (effects.lifespan) {
            this.lifespan += effects.lifespan;
        }
        
        this.triggerEvent('statsChanged', this.stats);
    }

    /**
     * 移除卡牌效果
     */
    removeCardEffects(card) {
        const effects = card.effects || {};
        
        // 移除属性加成
        if (effects.attack) this.stats.attack -= effects.attack;
        if (effects.defense) this.stats.defense -= effects.defense;
        if (effects.health) {
            this.stats.maxHealth -= effects.health;
            this.stats.health = Math.min(this.stats.health, this.stats.maxHealth);
        }
        if (effects.spiritPower) {
            this.stats.maxSpiritPower -= effects.spiritPower;
            this.stats.spiritPower = Math.min(this.stats.spiritPower, this.stats.maxSpiritPower);
        }
        
        this.triggerEvent('statsChanged', this.stats);
    }

    /**
     * 检查卡牌使用条件
     */
    checkCardRequirements(card) {
        const requirements = card.requirements || {};
        
        if (requirements.realm) {
            const realmIndex = Object.values(REALMS).indexOf(requirements.realm);
            const playerRealmIndex = Object.values(REALMS).indexOf(this.realm);
            if (playerRealmIndex < realmIndex) {
                return false;
            }
        }
        
        if (requirements.level && this.level < requirements.level) {
            return false;
        }
        
        if (requirements.cultivation && this.cultivation < requirements.cultivation) {
            return false;
        }
        
        return true;
    }

    /**
     * 添加卡牌到背包
     */
    addCard(card) {
        this.inventory.cards.push(card);
        this.triggerEvent('cardAdded', { card });
    }

    /**
     * 使用消耗品
     */
    useConsumable(card) {
        if (!card.consumable) {
            return { success: false, message: '该卡牌不是消耗品' };
        }
        
        if (!this.checkCardRequirements(card)) {
            return { success: false, message: '不满足使用条件' };
        }
        
        // 应用效果
        this.applyCardEffects(card);
        
        // 从背包中移除
        const cardIndex = this.inventory.cards.findIndex(c => c.id === card.id);
        if (cardIndex !== -1) {
            this.inventory.cards.splice(cardIndex, 1);
        }
        
        this.triggerEvent('consumableUsed', { card });
        
        return { success: true, message: `成功使用 ${card.name}` };
    }

    /**
     * 恢复生命值
     */
    heal(amount) {
        const actualHeal = Math.min(amount, this.stats.maxHealth - this.stats.health);
        this.stats.health += actualHeal;
        
        this.triggerEvent('healed', { amount: actualHeal });
        
        return actualHeal;
    }

    /**
     * 恢复灵力
     */
    restoreSpiritPower(amount) {
        const actualRestore = Math.min(amount, this.stats.maxSpiritPower - this.stats.spiritPower);
        this.stats.spiritPower += actualRestore;
        
        this.triggerEvent('spiritPowerRestored', { amount: actualRestore });
        
        return actualRestore;
    }

    /**
     * 受到伤害
     */
    takeDamage(damage) {
        const actualDamage = Math.max(0, damage - this.stats.defense);
        this.stats.health -= actualDamage;
        
        this.triggerEvent('damaged', { damage: actualDamage });
        
        return actualDamage;
    }

    /**
     * 检查是否死亡
     */
    isDead() {
        return this.stats.health <= 0;
    }

    /**
     * 更新气运系统
     */
    updateLuck() {
        const luckValue = this.luck.value;
        
        // 根据气运值确定等级和加成
        if (luckValue >= 90) {
            this.luck.level = '天选之子';
            this.luck.bonus = {
                drawRate: 20,      // +20%抽卡概率
                dropRate: 30,      // +30%掉宝概率  
                cultivation: 25,   // +25%修炼速度
                breakthrough: 15    // +15%突破成功率
            };
        } else if (luckValue >= 75) {
            this.luck.level = '气运滔天';
            this.luck.bonus = {
                drawRate: 15,
                dropRate: 20,
                cultivation: 15,
                breakthrough: 10
            };
        } else if (luckValue >= 60) {
            this.luck.level = '气运亨通';
            this.luck.bonus = {
                drawRate: 10,
                dropRate: 15,
                cultivation: 10,
                breakthrough: 5
            };
        } else if (luckValue >= 40) {
            this.luck.level = '普通';
            this.luck.bonus = {
                drawRate: 0,
                dropRate: 0,
                cultivation: 0,
                breakthrough: 0
            };
        } else if (luckValue >= 25) {
            this.luck.level = '时运不济';
            this.luck.bonus = {
                drawRate: -5,
                dropRate: -10,
                cultivation: -5,
                breakthrough: -5
            };
        } else {
            this.luck.level = '厄运缠身';
            this.luck.bonus = {
                drawRate: -15,
                dropRate: -20,
                cultivation: -10,
                breakthrough: -10
            };
        }
        
        this.triggerEvent('luckChanged', this.luck);
    }

    /**
     * 改变气运值
     */
    changeLuck(amount) {
        this.luck.value = Math.max(0, Math.min(100, this.luck.value + amount));
        this.updateLuck();
        
        const level = this.luck.level;
        if (amount > 0) {
            this.addLog(`气运提升！当前气运：${level}`, 'success');
        } else {
            this.addLog(`气运下降...当前气运：${level}`, 'warning');
        }
    }

    /**
     * 获取战斗力
     */
    getCombatPower() {
        return Math.floor(
            this.stats.attack * 2 + 
            this.stats.defense * 1.5 + 
            this.stats.maxHealth * 0.5 + 
            this.level * 10
        );
    }

    /**
     * 序列化玩家数据
     */
    serialize() {
        return {
            id: this.id,
            name: this.name,
            level: this.level,
            realm: this.realm,
            realmLevel: this.realmLevel,
            age: this.age,
            lifespan: this.lifespan,
            cultivation: this.cultivation,
            stats: { ...this.stats },
            resources: { ...this.resources },
            inventory: {
                cards: [...this.inventory.cards],
                equipped: { ...this.inventory.equipped },
                items: [...this.inventory.items]
            },
            progress: { ...this.progress },
            settings: { ...this.settings },
            lastLogin: this.lastLogin,
            offlineRewards: { ...this.offlineRewards }
        };
    }

    /**
     * 反序列化玩家数据
     */
    static deserialize(data) {
        const player = new Player();
        Object.assign(player, data);
        
        // 重新设置事件监听器
        player.eventListeners = new Map();
        
        return player;
    }

    /**
     * 保存玩家数据到本地存储
     */
    save() {
        try {
            const data = this.serialize();
            localStorage.setItem(STORAGE_KEYS.PLAYER_DATA, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('保存玩家数据失败:', error);
            return false;
        }
    }

    /**
     * 从本地存储加载玩家数据
     */
    static load() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.PLAYER_DATA);
            if (data) {
                return Player.deserialize(JSON.parse(data));
            }
        } catch (error) {
            console.error('加载玩家数据失败:', error);
        }
        return null;
    }
}
