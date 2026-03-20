/**
 * 卡牌数据定义
 * 包含所有可获得的卡牌模板
 */

import { 
    CARD_TYPES, 
    RARITY, 
    EQUIPMENT_SLOTS, 
    TECHNIQUE_TYPES 
} from './constants.js';

// 功法卡牌数据
export const TECHNIQUE_CARDS = [
    {
        id: 'tech_basic_sword',
        name: '基础剑法',
        type: CARD_TYPES.TECHNIQUE,
        techniqueType: TECHNIQUE_TYPES.ATTACK,
        rarity: RARITY.COMMON,
        description: '基础的剑法招式，适合初学者',
        damage: 10,
        spiritCost: 5,
        effects: { attack: 5 }, // +5%攻击力
        requirements: { level: 1 },
        equipmentSlot: EQUIPMENT_SLOTS.TECHNIQUE
    },
    {
        id: 'tech_basic_fist',
        name: '基础拳法',
        type: CARD_TYPES.TECHNIQUE,
        techniqueType: TECHNIQUE_TYPES.ATTACK,
        rarity: RARITY.COMMON,
        description: '基础的拳脚功夫',
        damage: 8,
        spiritCost: 3,
        effects: { attack: 3, speed: 5 }, // +3%攻击, +5%速度
        requirements: { level: 1 },
        equipmentSlot: EQUIPMENT_SLOTS.TECHNIQUE
    },
    {
        id: 'tech_meditation',
        name: '静心诀',
        type: CARD_TYPES.TECHNIQUE,
        techniqueType: TECHNIQUE_TYPES.SUPPORT,
        rarity: RARITY.COMMON,
        description: '静心凝神，提升修炼效率',
        healing: 15,
        spiritCost: 10,
        effects: { cultivation: 2, spiritPower: 10 }, // +2修为/秒, +10%灵力
        requirements: { level: 1 },
        equipmentSlot: EQUIPMENT_SLOTS.TECHNIQUE
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
        effects: { attack: 15, spiritPower: 8 }, // +15%攻击, +8%灵力
        requirements: { level: 5 },
        equipmentSlot: EQUIPMENT_SLOTS.TECHNIQUE
    },
    {
        id: 'tech_ice_arrow',
        name: '冰箭术',
        type: CARD_TYPES.TECHNIQUE,
        techniqueType: TECHNIQUE_TYPES.ATTACK,
        rarity: RARITY.RARE,
        description: '发射冰箭攻击，有一定几率减速敌人',
        damage: 20,
        spiritCost: 12,
        effects: { attack: 12, spiritPower: 6 }, // +12%攻击, +6%灵力
        requirements: { level: 5 },
        equipmentSlot: EQUIPMENT_SLOTS.TECHNIQUE
    },
    {
        id: 'tech_ice_shield',
        name: '冰盾术',
        type: CARD_TYPES.TECHNIQUE,
        techniqueType: TECHNIQUE_TYPES.DEFENSE,
        rarity: RARITY.RARE,
        description: '召唤冰盾保护自己',
        healing: 10,
        spiritCost: 15,
        effects: { defense: 20, spiritPower: 12 }, // +20%防御, +12%灵力
        requirements: { level: 5 },
        equipmentSlot: EQUIPMENT_SLOTS.TECHNIQUE
    },
    {
        id: 'tech_wind_step',
        name: '轻身术',
        type: CARD_TYPES.TECHNIQUE,
        techniqueType: TECHNIQUE_TYPES.SUPPORT,
        rarity: RARITY.RARE,
        description: '提升身法，增加闪避几率',
        spiritCost: 8,
        effects: { speed: 15, defense: 5 }, // +15%速度, +5%防御
        requirements: { level: 5 },
        equipmentSlot: EQUIPMENT_SLOTS.TECHNIQUE
    },
    {
        id: 'tech_earth_wall',
        name: '土墙术',
        type: CARD_TYPES.TECHNIQUE,
        techniqueType: TECHNIQUE_TYPES.DEFENSE,
        rarity: RARITY.RARE,
        description: '召唤土墙防御',
        spiritCost: 20,
        effects: { defense: 25, health: 10 }, // +25%防御, +10%生命
        requirements: { level: 5 },
        equipmentSlot: EQUIPMENT_SLOTS.TECHNIQUE
    },
    {
        id: 'tech_thunder_strike',
        name: '雷击术',
        type: CARD_TYPES.TECHNIQUE,
        techniqueType: TECHNIQUE_TYPES.ATTACK,
        rarity: RARITY.EPIC,
        description: '召唤雷电攻击敌人，威力巨大',
        damage: 50,
        spiritCost: 30,
        effects: { attack: 35, spiritPower: 20 }, // +35%攻击, +20%灵力
        requirements: { level: 10 },
        equipmentSlot: EQUIPMENT_SLOTS.TECHNIQUE
    },
    {
        id: 'tech_flame_dragon',
        name: '炎龙术',
        type: CARD_TYPES.TECHNIQUE,
        techniqueType: TECHNIQUE_TYPES.ATTACK,
        rarity: RARITY.EPIC,
        description: '召唤炎龙进行强力攻击',
        damage: 60,
        spiritCost: 35,
        effects: { attack: 40, spiritPower: 25 }, // +40%攻击, +25%灵力
        requirements: { level: 10 },
        equipmentSlot: EQUIPMENT_SLOTS.TECHNIQUE
    },
    {
        id: 'tech_golden_body',
        name: '金身诀',
        type: CARD_TYPES.TECHNIQUE,
        techniqueType: TECHNIQUE_TYPES.DEFENSE,
        rarity: RARITY.EPIC,
        description: '修炼金身，大幅提升防御力',
        spiritCost: 25,
        effects: { defense: 45, health: 20, spiritPower: 15 }, // +45%防御, +20%生命, +15%灵力
        requirements: { level: 10 },
        equipmentSlot: EQUIPMENT_SLOTS.TECHNIQUE
    },
    {
        id: 'tech_sword_dance',
        name: '剑舞',
        type: CARD_TYPES.TECHNIQUE,
        techniqueType: TECHNIQUE_TYPES.ATTACK,
        rarity: RARITY.EPIC,
        description: '华丽的剑舞，连续攻击敌人',
        damage: 40,
        spiritCost: 28,
        effects: { attack: 30, speed: 20 }, // +30%攻击, +20%速度
        requirements: { level: 10 },
        equipmentSlot: EQUIPMENT_SLOTS.TECHNIQUE
    },
    {
        id: 'tech_heavenly_sword',
        name: '天剑诀',
        type: CARD_TYPES.TECHNIQUE,
        techniqueType: TECHNIQUE_TYPES.ATTACK,
        rarity: RARITY.LEGENDARY,
        description: '传说中的剑法，威力无穷',
        damage: 80,
        spiritCost: 40,
        effects: { attack: 60, spiritPower: 30, speed: 15 }, // +60%攻击, +30%灵力, +15%速度
        requirements: { level: 15 },
        equipmentSlot: EQUIPMENT_SLOTS.TECHNIQUE
    },
    {
        id: 'tech_immortal_body',
        name: '仙体诀',
        type: CARD_TYPES.TECHNIQUE,
        techniqueType: TECHNIQUE_TYPES.DEFENSE,
        rarity: RARITY.LEGENDARY,
        description: '修炼仙体，万法不侵',
        spiritCost: 30,
        effects: { defense: 60, health: 35, spiritPower: 25, cultivation: 5 }, // +60%防御, +35%生命, +25%灵力, +5修为/秒
        requirements: { level: 15 },
        equipmentSlot: EQUIPMENT_SLOTS.TECHNIQUE
    }
];

// 灵药卡牌数据
export const MEDICINE_CARDS = [
    {
        id: 'med_health_potion_small',
        name: '小回血丹',
        type: CARD_TYPES.MEDICINE,
        rarity: RARITY.COMMON,
        description: '恢复20点生命值',
        consumable: true,
        stackSize: 10,
        effects: { health: 20 },
        requirements: { level: 1 }
    },
    {
        id: 'med_health_potion_medium',
        name: '中回血丹',
        type: CARD_TYPES.MEDICINE,
        rarity: RARITY.RARE,
        description: '恢复50点生命值',
        consumable: true,
        stackSize: 5,
        effects: { health: 50 },
        requirements: { level: 3 }
    },
    {
        id: 'med_health_potion_large',
        name: '大回血丹',
        type: CARD_TYPES.MEDICINE,
        rarity: RARITY.EPIC,
        description: '恢复100点生命值',
        consumable: true,
        stackSize: 3,
        effects: { health: 100 },
        requirements: { level: 8 }
    },
    {
        id: 'med_spirit_potion_small',
        name: '小回灵丹',
        type: CARD_TYPES.MEDICINE,
        rarity: RARITY.COMMON,
        description: '恢复15点灵力',
        consumable: true,
        stackSize: 10,
        effects: { spiritPower: 15 },
        requirements: { level: 1 }
    },
    {
        id: 'med_spirit_potion_medium',
        name: '中回灵丹',
        type: CARD_TYPES.MEDICINE,
        rarity: RARITY.RARE,
        description: '恢复40点灵力',
        consumable: true,
        stackSize: 5,
        effects: { spiritPower: 40 },
        requirements: { level: 3 }
    },
    {
        id: 'med_spirit_potion_large',
        name: '大回灵丹',
        type: CARD_TYPES.MEDICINE,
        rarity: RARITY.EPIC,
        description: '恢复80点灵力',
        consumable: true,
        stackSize: 3,
        effects: { spiritPower: 80 },
        requirements: { level: 8 }
    },
    {
        id: 'med_cultivation_potion_small',
        name: '小修为丹',
        type: CARD_TYPES.MEDICINE,
        rarity: RARITY.RARE,
        description: '增加30点修为',
        consumable: true,
        stackSize: 5,
        effects: { cultivation: 30 },
        requirements: { level: 3 }
    },
    {
        id: 'med_cultivation_potion_medium',
        name: '中修为丹',
        type: CARD_TYPES.MEDICINE,
        rarity: RARITY.EPIC,
        description: '增加80点修为',
        consumable: true,
        stackSize: 3,
        effects: { cultivation: 80 },
        requirements: { level: 8 }
    },
    {
        id: 'med_breakthrough_potion',
        name: '突破丹',
        type: CARD_TYPES.MEDICINE,
        rarity: RARITY.EPIC,
        description: '大幅增加修为，有助于境界突破',
        consumable: true,
        stackSize: 3,
        effects: { cultivation: 200 },
        requirements: { level: 8 }
    },
    {
        id: 'med_longevity_potion',
        name: '延寿丹',
        type: CARD_TYPES.MEDICINE,
        rarity: RARITY.LEGENDARY,
        description: '增加50年寿命',
        consumable: true,
        stackSize: 1,
        effects: { lifespan: 50 },
        requirements: { level: 15 }
    },
    {
        id: 'med_rejuvenation_potion',
        name: '还童丹',
        type: CARD_TYPES.MEDICINE,
        rarity: RARITY.MYTHIC,
        description: '恢复青春，减少10岁年龄',
        consumable: true,
        stackSize: 1,
        effects: { lifespan: 100, health: 50, spiritPower: 50 },
        requirements: { level: 20 }
    }
];

// 装备卡牌数据
export const EQUIPMENT_CARDS = [
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
        id: 'eq_iron_club',
        name: '铁棍',
        type: CARD_TYPES.EQUIPMENT,
        equipmentSlot: EQUIPMENT_SLOTS.WEAPON,
        rarity: RARITY.COMMON,
        description: '沉重的铁棍',
        effects: { attack: 6, speed: -1 },
        requirements: { level: 1 }
    },
    {
        id: 'eq_wooden_staff',
        name: '木杖',
        type: CARD_TYPES.EQUIPMENT,
        equipmentSlot: EQUIPMENT_SLOTS.WEAPON,
        rarity: RARITY.COMMON,
        description: '普通的木制法杖',
        effects: { attack: 3, spiritPower: 8 },
        requirements: { level: 1 }
    },
    {
        id: 'eq_steel_sword',
        name: '钢剑',
        type: CARD_TYPES.EQUIPMENT,
        equipmentSlot: EQUIPMENT_SLOTS.WEAPON,
        rarity: RARITY.RARE,
        description: '精钢打造的长剑',
        effects: { attack: 12, speed: 1 },
        requirements: { level: 5 }
    },
    {
        id: 'eq_flame_sword',
        name: '烈焰剑',
        type: CARD_TYPES.EQUIPMENT,
        equipmentSlot: EQUIPMENT_SLOTS.WEAPON,
        rarity: RARITY.RARE,
        description: '蕴含火焰力量的剑',
        effects: { attack: 15, spiritPower: 5 },
        requirements: { level: 5 }
    },
    {
        id: 'eq_frost_blade',
        name: '寒冰刃',
        type: CARD_TYPES.EQUIPMENT,
        equipmentSlot: EQUIPMENT_SLOTS.WEAPON,
        rarity: RARITY.RARE,
        description: '寒气逼人的利刃',
        effects: { attack: 13, spiritPower: 8 },
        requirements: { level: 5 }
    },
    {
        id: 'eq_spirit_sword',
        name: '灵剑',
        type: CARD_TYPES.EQUIPMENT,
        equipmentSlot: EQUIPMENT_SLOTS.WEAPON,
        rarity: RARITY.EPIC,
        description: '蕴含灵力的神剑',
        effects: { attack: 25, spiritPower: 15, speed: 3 },
        requirements: { level: 10 }
    },
    {
        id: 'eq_thunder_blade',
        name: '雷鸣刃',
        type: CARD_TYPES.EQUIPMENT,
        equipmentSlot: EQUIPMENT_SLOTS.WEAPON,
        rarity: RARITY.EPIC,
        description: '带有雷电属性的武器',
        effects: { attack: 28, spiritPower: 20, speed: 5 },
        requirements: { level: 10 }
    },
    {
        id: 'eq_dragon_sword',
        name: '龙鳞剑',
        type: CARD_TYPES.EQUIPMENT,
        equipmentSlot: EQUIPMENT_SLOTS.WEAPON,
        rarity: RARITY.LEGENDARY,
        description: '用龙鳞打造的传说武器',
        effects: { attack: 40, spiritPower: 30, speed: 8, health: 20 },
        requirements: { level: 15 }
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
        id: 'eq_leather_armor',
        name: '皮甲',
        type: CARD_TYPES.EQUIPMENT,
        equipmentSlot: EQUIPMENT_SLOTS.ARMOR,
        rarity: RARITY.COMMON,
        description: '兽皮制作的护甲',
        effects: { defense: 4, speed: -1 },
        requirements: { level: 1 }
    },
    {
        id: 'eq_iron_armor',
        name: '铁甲',
        type: CARD_TYPES.EQUIPMENT,
        equipmentSlot: EQUIPMENT_SLOTS.ARMOR,
        rarity: RARITY.RARE,
        description: '铁制护甲',
        effects: { defense: 10, health: 20, speed: -2 },
        requirements: { level: 5 }
    },
    {
        id: 'eq_steel_armor',
        name: '钢甲',
        type: CARD_TYPES.EQUIPMENT,
        equipmentSlot: EQUIPMENT_SLOTS.ARMOR,
        rarity: RARITY.RARE,
        description: '精钢打造的护甲',
        effects: { defense: 12, health: 25, speed: -1 },
        requirements: { level: 5 }
    },
    {
        id: 'eq_spirit_armor',
        name: '灵甲',
        type: CARD_TYPES.EQUIPMENT,
        equipmentSlot: EQUIPMENT_SLOTS.ARMOR,
        rarity: RARITY.EPIC,
        description: '蕴含灵力的护甲',
        effects: { defense: 20, health: 40, spiritPower: 15 },
        requirements: { level: 10 }
    },
    {
        id: 'eq_jade_armor',
        name: '玉甲',
        type: CARD_TYPES.EQUIPMENT,
        equipmentSlot: EQUIPMENT_SLOTS.ARMOR,
        rarity: RARITY.EPIC,
        description: '美玉制作的护甲',
        effects: { defense: 18, health: 50, spiritPower: 20, cultivation: 2 },
        requirements: { level: 10 }
    },
    {
        id: 'eq_dragon_armor',
        name: '龙鳞甲',
        type: CARD_TYPES.EQUIPMENT,
        equipmentSlot: EQUIPMENT_SLOTS.ARMOR,
        rarity: RARITY.LEGENDARY,
        description: '龙鳞制作的传说护甲',
        effects: { defense: 35, health: 80, spiritPower: 25, speed: -3 },
        requirements: { level: 15 }
    },
    {
        id: 'eq_wooden_ring',
        name: '木戒指',
        type: CARD_TYPES.EQUIPMENT,
        equipmentSlot: EQUIPMENT_SLOTS.ACCESSORY,
        rarity: RARITY.COMMON,
        description: '普通的木制戒指',
        effects: { cultivation: 1 },
        requirements: { level: 1 }
    },
    {
        id: 'eq_copper_ring',
        name: '铜戒指',
        type: CARD_TYPES.EQUIPMENT,
        equipmentSlot: EQUIPMENT_SLOTS.ACCESSORY,
        rarity: RARITY.COMMON,
        description: '铜制戒指',
        effects: { health: 5, spiritPower: 5 },
        requirements: { level: 1 }
    },
    {
        id: 'eq_silver_ring',
        name: '银戒指',
        type: CARD_TYPES.EQUIPMENT,
        equipmentSlot: EQUIPMENT_SLOTS.ACCESSORY,
        rarity: RARITY.RARE,
        description: '银制戒指',
        effects: { health: 10, spiritPower: 10, cultivation: 2 },
        requirements: { level: 5 }
    },
    {
        id: 'eq_jade_ring',
        name: '玉戒指',
        type: CARD_TYPES.EQUIPMENT,
        equipmentSlot: EQUIPMENT_SLOTS.ACCESSORY,
        rarity: RARITY.RARE,
        description: '美玉戒指',
        effects: { spiritPower: 15, cultivation: 3, health: 8 },
        requirements: { level: 5 }
    },
    {
        id: 'eq_spirit_ring',
        name: '灵戒',
        type: CARD_TYPES.EQUIPMENT,
        equipmentSlot: EQUIPMENT_SLOTS.ACCESSORY,
        rarity: RARITY.EPIC,
        description: '增加灵力的戒指',
        effects: { spiritPower: 30, cultivation: 5, health: 15 },
        requirements: { level: 10 }
    },
    {
        id: 'eq_immortal_ring',
        name: '仙戒',
        type: CARD_TYPES.EQUIPMENT,
        equipmentSlot: EQUIPMENT_SLOTS.ACCESSORY,
        rarity: RARITY.LEGENDARY,
        description: '传说中的仙人之戒',
        effects: { spiritPower: 50, cultivation: 10, health: 30, lifespan: 20 },
        requirements: { level: 15 }
    },
    {
        id: 'eq_copper_bracelet',
        name: '铜手镯',
        type: CARD_TYPES.EQUIPMENT,
        equipmentSlot: EQUIPMENT_SLOTS.ACCESSORY,
        rarity: RARITY.COMMON,
        description: '铜制手镯',
        effects: { attack: 2, defense: 2 },
        requirements: { level: 1 }
    },
    {
        id: 'eq_silver_bracelet',
        name: '银手镯',
        type: CARD_TYPES.EQUIPMENT,
        equipmentSlot: EQUIPMENT_SLOTS.ACCESSORY,
        rarity: RARITY.RARE,
        description: '银制手镯',
        effects: { attack: 5, defense: 5, health: 10 },
        requirements: { level: 5 }
    },
    {
        id: 'eq_jade_bracelet',
        name: '玉手镯',
        type: CARD_TYPES.EQUIPMENT,
        equipmentSlot: EQUIPMENT_SLOTS.ACCESSORY,
        rarity: RARITY.EPIC,
        description: '美玉手镯',
        effects: { attack: 8, defense: 8, spiritPower: 20, health: 20 },
        requirements: { level: 10 }
    }
];

// 所有卡牌数据
export const ALL_CARDS = [
    ...TECHNIQUE_CARDS,
    ...MEDICINE_CARDS,
    ...EQUIPMENT_CARDS
];

// 按稀有度分类的卡牌
export const CARDS_BY_RARITY = {
    [RARITY.COMMON]: ALL_CARDS.filter(card => card.rarity === RARITY.COMMON),
    [RARITY.RARE]: ALL_CARDS.filter(card => card.rarity === RARITY.RARE),
    [RARITY.EPIC]: ALL_CARDS.filter(card => card.rarity === RARITY.EPIC),
    [RARITY.LEGENDARY]: ALL_CARDS.filter(card => card.rarity === RARITY.LEGENDARY),
    [RARITY.MYTHIC]: ALL_CARDS.filter(card => card.rarity === RARITY.MYTHIC)
};

// 按类型分类的卡牌
export const CARDS_BY_TYPE = {
    [CARD_TYPES.TECHNIQUE]: TECHNIQUE_CARDS,
    [CARD_TYPES.MEDICINE]: MEDICINE_CARDS,
    [CARD_TYPES.EQUIPMENT]: EQUIPMENT_CARDS
};

// 导出所有卡牌数据
export default {
    TECHNIQUE_CARDS,
    MEDICINE_CARDS,
    EQUIPMENT_CARDS,
    ALL_CARDS,
    CARDS_BY_RARITY,
    CARDS_BY_TYPE
};
