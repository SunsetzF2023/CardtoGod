/**
 * 卡牌系统类
 * 负责管理卡牌生成、抽取、效果计算等
 */

import { 
    CARD_TYPES, 
    RARITY, 
    RARITY_CONFIG, 
    EQUIPMENT_SLOTS, 
    TECHNIQUE_TYPES,
    CARD_PACK_TYPES,
    CARD_PACK_CONFIG,
    PITY_CONFIG
} from '../data/constants.js';

export class CardSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.cardDatabase = new Map();
        this.playerPity = new Map(); // 玩家保底计数
    }

    /**
     * 初始化卡牌系统
     */
    async init() {
        console.log('初始化卡牌系统...');
        
        // 初始化卡牌数据库
        this.initCardDatabase();
        
        // 初始化保底系统
        this.initPitySystem();
        
        console.log('卡牌系统初始化完成');
    }

    /**
     * 初始化卡牌数据库
     */
    initCardDatabase() {
        // 功法卡牌
        const techniques = [
            {
                id: 'tech_basic_sword',
                name: '基础剑法',
                type: CARD_TYPES.TECHNIQUE,
                techniqueType: TECHNIQUE_TYPES.ATTACK,
                rarity: RARITY.COMMON,
                description: '基础的剑法招式',
                damage: 10,
                spiritCost: 5,
                effects: { attack: 2 },
                requirements: { level: 1 }
            },
            {
                id: 'tech_fire_ball',
                name: '火球术',
                type: CARD_TYPES.TECHNIQUE,
                techniqueType: TECHNIQUE_TYPES.ATTACK,
                rarity: RARITY.RARE,
                description: '凝聚火元素攻击敌人',
                damage: 25,
                spiritCost: 15,
                effects: { attack: 5 },
                requirements: { level: 5 }
            },
            {
                id: 'tech_ice_shield',
                name: '冰盾术',
                type: CARD_TYPES.TECHNIQUE,
                techniqueType: TECHNIQUE_TYPES.DEFENSE,
                rarity: RARITY.RARE,
                description: '召唤冰盾保护自己',
                effects: { defense: 8, spiritPower: 10 },
                requirements: { level: 5 }
            },
            {
                id: 'tech_healing_art',
                name: '疗术',
                type: CARD_TYPES.TECHNIQUE,
                techniqueType: TECHNIQUE_TYPES.HEALING,
                rarity: RARITY.COMMON,
                description: '恢复生命值',
                healing: 20,
                spiritCost: 10,
                effects: { health: 5 },
                requirements: { level: 1 }
            },
            {
                id: 'tech_thunder_strike',
                name: '雷击术',
                type: CARD_TYPES.TECHNIQUE,
                techniqueType: TECHNIQUE_TYPES.ATTACK,
                rarity: RARITY.EPIC,
                description: '召唤雷电攻击敌人',
                damage: 50,
                spiritCost: 30,
                effects: { attack: 12 },
                requirements: { level: 10 }
            }
        ];

        // 灵药卡牌
        const medicines = [
            {
                id: 'med_health_potion',
                name: '回血丹',
                type: CARD_TYPES.MEDICINE,
                rarity: RARITY.COMMON,
                description: '恢复30点生命值',
                consumable: true,
                stackSize: 10,
                effects: { health: 30 },
                requirements: { level: 1 }
            },
            {
                id: 'med_spirit_potion',
                name: '回灵丹',
                type: CARD_TYPES.MEDICINE,
                rarity: RARITY.COMMON,
                description: '恢复20点灵力',
                consumable: true,
                stackSize: 10,
                effects: { spiritPower: 20 },
                requirements: { level: 1 }
            },
            {
                id: 'med_cultivation_pill',
                name: '修为丹',
                type: CARD_TYPES.MEDICINE,
                rarity: RARITY.RARE,
                description: '增加50点修为',
                consumable: true,
                stackSize: 5,
                effects: { cultivation: 50 },
                requirements: { level: 3 }
            },
            {
                id: 'med_breakthrough_pill',
                name: '突破丹',
                type: CARD_TYPES.MEDICINE,
                rarity: RARITY.EPIC,
                description: '大幅增加修为，有助于境界突破',
                consumable: true,
                stackSize: 3,
                effects: { cultivation: 200 },
                requirements: { level: 8 }
            }
        ];

        // 装备卡牌
        const equipments = [
            {
                id: 'eq_iron_sword',
                name: '铁剑',
                type: CARD_TYPES.EQUIPMENT,
                equipmentSlot: EQUIPMENT_SLOTS.WEAPON,
                rarity: RARITY.COMMON,
                description: '普通的铁制长剑',
                effects: { attack: 5 },
                requirements: { level: 1 }
            },
            {
                id: 'eq_steel_sword',
                name: '钢剑',
                type: CARD_TYPES.EQUIPMENT,
                equipmentSlot: EQUIPMENT_SLOTS.WEAPON,
                rarity: RARITY.RARE,
                description: '精钢打造的长剑',
                effects: { attack: 12 },
                requirements: { level: 5 }
            },
            {
                id: 'eq_spirit_sword',
                name: '灵剑',
                type: CARD_TYPES.EQUIPMENT,
                equipmentSlot: EQUIPMENT_SLOTS.WEAPON,
                rarity: RARITY.EPIC,
                description: '蕴含灵力的神剑',
                effects: { attack: 25, spiritPower: 15 },
                requirements: { level: 10 }
            },
            {
                id: 'eq_cloth_armor',
                name: '布甲',
                type: CARD_TYPES.EQUIPMENT,
                equipmentSlot: EQUIPMENT_SLOTS.ARMOR,
                rarity: RARITY.COMMON,
                description: '简单的布制护甲',
                effects: { defense: 3 },
                requirements: { level: 1 }
            },
            {
                id: 'eq_iron_armor',
                name: '铁甲',
                type: CARD_TYPES.EQUIPMENT,
                equipmentSlot: EQUIPMENT_SLOTS.ARMOR,
                rarity: RARITY.RARE,
                description: '铁制护甲',
                effects: { defense: 10, health: 20 },
                requirements: { level: 5 }
            },
            {
                id: 'eq_spirit_ring',
                name: '灵戒',
                type: CARD_TYPES.EQUIPMENT,
                equipmentSlot: EQUIPMENT_SLOTS.ACCESSORY,
                rarity: RARITY.EPIC,
                description: '增加灵力的戒指',
                effects: { spiritPower: 30, cultivation: 1 },
                requirements: { level: 8 }
            }
        ];

        // 将所有卡牌添加到数据库
        [...techniques, ...medicines, ...equipments].forEach(cardTemplate => {
            this.addCardTemplate(cardTemplate);
        });
    }

    /**
     * 添加卡牌模板到数据库
     */
    addCardTemplate(template) {
        const card = {
            ...template,
            id: template.id,
            name: template.name,
            type: template.type,
            rarity: template.rarity,
            quality: this.generateQuality(template.rarity),
            level: 1,
            description: template.description,
            icon: this.getCardIcon(template.type, template.rarity),
            effects: template.effects || {},
            requirements: template.requirements || {},
            consumable: template.consumable || false,
            stackSize: template.stackSize || 1,
            equipmentSlot: template.equipmentSlot,
            techniqueType: template.techniqueType,
            damage: template.damage || 0,
            healing: template.healing || 0,
            spiritCost: template.spiritCost || 0,
            obtainable: true,
            tradable: true,
            sellPrice: this.calculateSellPrice(template.rarity),
            buyPrice: this.calculateBuyPrice(template.rarity),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.cardDatabase.set(card.id, card);
    }

    /**
     * 生成卡牌品质
     */
    generateQuality(rarity) {
        const config = RARITY_CONFIG[rarity];
        return Math.floor(Math.random() * (config.qualityMax - config.qualityMin + 1)) + config.qualityMin;
    }

    /**
     * 获取卡牌图标
     */
    getCardIcon(type, rarity) {
        const typeIcons = {
            [CARD_TYPES.TECHNIQUE]: '📜',
            [CARD_TYPES.MEDICINE]: '🧪',
            [CARD_TYPES.EQUIPMENT]: '⚔️'
        };
        return typeIcons[type] || '🎴';
    }

    /**
     * 计算出售价格
     */
    calculateSellPrice(rarity) {
        const prices = {
            [RARITY.COMMON]: 10,
            [RARITY.RARE]: 50,
            [RARITY.EPIC]: 200,
            [RARITY.LEGENDARY]: 800,
            [RARITY.MYTHIC]: 2000
        };
        return prices[rarity] || 10;
    }

    /**
     * 计算购买价格
     */
    calculateBuyPrice(rarity) {
        return this.calculateSellPrice(rarity) * 2;
    }

    /**
     * 初始化保底系统
     */
    initPitySystem() {
        Object.values(CARD_PACK_TYPES).forEach(packType => {
            this.playerPity.set(packType, 0);
        });
    }

    /**
     * 获取卡包价格
     */
    getPackPrice(packType) {
        return CARD_PACK_CONFIG[packType]?.price || 100;
    }

    /**
     * 抽取卡包
     */
    drawCardPack(packType = CARD_PACK_TYPES.BASIC, count = 1) {
        const packConfig = CARD_PACK_CONFIG[packType];
        if (!packConfig) {
            throw new Error(`未知的卡包类型: ${packType}`);
        }

        const cards = [];
        
        for (let i = 0; i < count; i++) {
            const card = this.drawSingleCard(packType);
            cards.push(card);
        }

        return cards;
    }

    /**
     * 抽取单张卡牌
     */
    drawSingleCard(packType) {
        const packConfig = CARD_PACK_CONFIG[packType];
        const pityConfig = PITY_CONFIG[packType];
        
        // 检查保底
        let guaranteedRarity = null;
        if (pityConfig.enabled) {
            const currentPity = this.playerPity.get(packType) + 1;
            this.playerPity.set(packType, currentPity);
            
            if (currentPity >= pityConfig.pityCount) {
                guaranteedRarity = pityConfig.guaranteedRarity;
                this.playerPity.set(packType, 0); // 重置保底
            }
        }

        // 确定稀有度
        let rarity = guaranteedRarity || this.determineRarity(packConfig.dropRates);
        
        // 获取该稀有度的所有卡牌
        const availableCards = Array.from(this.cardDatabase.values())
            .filter(card => card.rarity === rarity && card.obtainable);
        
        if (availableCards.length === 0) {
            // 如果没有可用的卡牌，降级到普通
            rarity = RARITY.COMMON;
            const fallbackCards = Array.from(this.cardDatabase.values())
                .filter(card => card.rarity === rarity && card.obtainable);
            if (fallbackCards.length === 0) {
                throw new Error('没有可用的卡牌');
            }
        }

        // 随机选择一张卡牌
        const cardTemplate = availableCards[Math.floor(Math.random() * availableCards.length)];
        
        // 创建卡牌实例
        const card = this.createCardInstance(cardTemplate);
        
        return card;
    }

    /**
     * 确定卡牌稀有度
     */
    determineRarity(dropRates) {
        const random = Math.random() * 100;
        let cumulative = 0;
        
        for (const [rarity, rate] of Object.entries(dropRates)) {
            cumulative += rate;
            if (random <= cumulative) {
                return rarity;
            }
        }
        
        return RARITY.COMMON; // 默认返回普通
    }

    /**
     * 创建卡牌实例
     */
    createCardInstance(template) {
        const card = JSON.parse(JSON.stringify(template)); // 深拷贝
        
        // 生成唯一ID
        card.id = template.id + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // 重新生成品质
        card.quality = this.generateQuality(card.rarity);
        
        // 应用品质加成
        this.applyQualityBonus(card);
        
        // 设置创建时间
        card.createdAt = new Date();
        card.updatedAt = new Date();
        
        return card;
    }

    /**
     * 应用品质加成
     */
    applyQualityBonus(card) {
        const qualityMultiplier = 1 + (card.quality - 1) * 0.2; // 每级品质增加20%效果
        
        // 增强属性效果
        for (const [stat, value] of Object.entries(card.effects)) {
            if (typeof value === 'number') {
                card.effects[stat] = Math.floor(value * qualityMultiplier);
            }
        }
        
        // 增强伤害和治疗
        if (card.damage) {
            card.damage = Math.floor(card.damage * qualityMultiplier);
        }
        if (card.healing) {
            card.healing = Math.floor(card.healing * qualityMultiplier);
        }
        
        // 调整价格
        card.sellPrice = Math.floor(card.sellPrice * qualityMultiplier);
        card.buyPrice = Math.floor(card.buyPrice * qualityMultiplier);
    }

    /**
     * 生成随机卡牌
     */
    generateRandomCards(count, minRarity = null) {
        const cards = [];
        
        for (let i = 0; i < count; i++) {
            const rarity = minRarity || this.getRandomRarity();
            const availableCards = Array.from(this.cardDatabase.values())
                .filter(card => card.rarity === rarity && card.obtainable);
            
            if (availableCards.length > 0) {
                const template = availableCards[Math.floor(Math.random() * availableCards.length)];
                cards.push(this.createCardInstance(template));
            }
        }
        
        return cards;
    }

    /**
     * 获取随机稀有度
     */
    getRandomRarity() {
        const rarities = Object.values(RARITY);
        const weights = [60, 25, 10, 4, 1]; // 对应各稀有度的权重
        
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < rarities.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return rarities[i];
            }
        }
        
        return RARITY.COMMON;
    }

    /**
     * 获取卡牌信息
     */
    getCardInfo(cardId) {
        return this.cardDatabase.get(cardId);
    }

    /**
     * 获取所有卡牌
     */
    getAllCards() {
        return Array.from(this.cardDatabase.values());
    }

    /**
     * 按类型获取卡牌
     */
    getCardsByType(type) {
        return Array.from(this.cardDatabase.values())
            .filter(card => card.type === type);
    }

    /**
     * 按稀有度获取卡牌
     */
    getCardsByRarity(rarity) {
        return Array.from(this.cardDatabase.values())
            .filter(card => card.rarity === rarity);
    }

    /**
     * 计算卡牌战斗力
     */
    calculateCardPower(card) {
        let power = 0;
        
        // 基础稀有度分值
        const rarityPower = {
            [RARITY.COMMON]: 10,
            [RARITY.RARE]: 25,
            [RARITY.EPIC]: 50,
            [RARITY.LEGENDARY]: 100,
            [RARITY.MYTHIC]: 200
        };
        
        power += rarityPower[card.rarity] || 10;
        
        // 品质加成
        power += card.quality * 5;
        
        // 属性加成
        for (const value of Object.values(card.effects)) {
            if (typeof value === 'number') {
                power += Math.abs(value);
            }
        }
        
        // 特殊属性加成
        if (card.damage) power += card.damage;
        if (card.healing) power += card.healing;
        
        return power;
    }

    /**
     * 获取保底信息
     */
    getPityInfo(packType) {
        const pityConfig = PITY_CONFIG[packType];
        const currentPity = this.playerPity.get(packType) || 0;
        
        return {
            current: currentPity,
            max: pityConfig.pityCount,
            guaranteed: pityConfig.guaranteedRarity,
            progress: (currentPity / pityConfig.pityCount) * 100
        };
    }

    /**
     * 重置保底
     */
    resetPity(packType) {
        this.playerPity.set(packType, 0);
    }
}
