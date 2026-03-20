/**
 * 游戏常量定义
 * 包含游戏中使用的所有常量和枚举值
 */

// 境界系统
export const REALMS = {
    QI_REFINEMENT: '炼气期',
    FOUNDATION_ESTABLISHMENT: '筑基期',
    GOLDEN_CORE: '金丹期',
    NASCENT_SOUL: '元婴期',
    SOUL_FORMATION: '化神期',
    VOID_TUNING: '虚神期',
    TRIBULATION: '渡劫期',
    MAHAYANA: '大乘期',
    IMMORTAL: '仙人期'
};

// 境界等级要求
export const REALM_REQUIREMENTS = {
    [REALMS.QI_REFINEMENT]: { level: 1, cultivation: 0 },
    [REALMS.FOUNDATION_ESTABLISHMENT]: { level: 10, cultivation: 1000 },
    [REALMS.GOLDEN_CORE]: { level: 20, cultivation: 5000 },
    [REALMS.NASCENT_SOUL]: { level: 30, cultivation: 20000 },
    [REALMS.SOUL_FORMATION]: { level: 40, cultivation: 80000 },
    [REALMS.VOID_TUNING]: { level: 50, cultivation: 300000 },
    [REALMS.TRIBULATION]: { level: 60, cultivation: 1000000 },
    [REALMS.MAHAYANA]: { level: 70, cultivation: 5000000 },
    [REALMS.IMMORTAL]: { level: 80, cultivation: 20000000 }
};

// 卡牌稀有度
export const RARITY = {
    COMMON: 'common',
    RARE: 'rare',
    EPIC: 'epic',
    LEGENDARY: 'legendary',
    MYTHIC: 'mythic'
};

// 稀有度配置
export const RARITY_CONFIG = {
    [RARITY.COMMON]: {
        name: '普通',
        color: '#808080',
        dropRate: 60,
        qualityMin: 1,
        qualityMax: 2
    },
    [RARITY.RARE]: {
        name: '稀有',
        color: '#0080ff',
        dropRate: 25,
        qualityMin: 2,
        qualityMax: 3
    },
    [RARITY.EPIC]: {
        name: '史诗',
        color: '#8000ff',
        dropRate: 10,
        qualityMin: 3,
        qualityMax: 4
    },
    [RARITY.LEGENDARY]: {
        name: '传说',
        color: '#ff8000',
        dropRate: 4,
        qualityMin: 4,
        qualityMax: 5
    },
    [RARITY.MYTHIC]: {
        name: '神话',
        color: '#ff0080',
        dropRate: 1,
        qualityMin: 5,
        qualityMax: 5
    }
};

// 卡牌类型
export const CARD_TYPES = {
    TECHNIQUE: 'technique',      // 功法
    MEDICINE: 'medicine',        // 灵药
    EQUIPMENT: 'equipment'       // 装备
};

// 装备位置
export const EQUIPMENT_SLOTS = {
    WEAPON: 'weapon',            // 武器
    ARMOR: 'armor',              // 护甲
    ACCESSORY: 'accessory',      // 饰品
    TECHNIQUE: 'technique'       // 功法位
};

// 功法类型
export const TECHNIQUE_TYPES = {
    ATTACK: 'attack',            // 攻击功法
    DEFENSE: 'defense',          // 防御功法
    SUPPORT: 'support',          // 辅助功法
    HEALING: 'healing'           // 治疗功法
};

// 敌人类型
export const ENEMY_TYPES = {
    BEAST: 'beast',              // 妖兽
    DEMON: 'demon',              // 妖魔
    CULTIVATOR: 'cultivator',    // 修士
    BOSS: 'boss'                 // Boss
};

// 战斗类型
export const BATTLE_TYPES = {
    PVE: 'pve',                  // 玩家vs环境
    PVP: 'pvp',                  // 玩家vs玩家
    BOSS: 'boss'                 // Boss战
};

// 战斗状态
export const BATTLE_STATUS = {
    PREPARING: 'preparing',      // 准备中
    ONGOING: 'ongoing',          // 进行中
    VICTORY: 'victory',          // 胜利
    DEFEAT: 'defeat'             // 失败
};

// 元素属性
export const ELEMENTS = {
    FIRE: 'fire',                // 火
    WATER: 'water',              // 水
    EARTH: 'earth',              // 土
    WIND: 'wind',                // 风
    THUNDER: 'thunder',          // 雷
    LIGHT: 'light',              // 光
    DARK: 'dark'                 // 暗
};

// 元素克制关系
export const ELEMENT_COUNTERS = {
    [ELEMENTS.FIRE]: [ELEMENTS.WIND, ELEMENTS.EARTH],
    [ELEMENTS.WATER]: [ELEMENTS.FIRE, ELEMENTS.THUNDER],
    [ELEMENTS.EARTH]: [ELEMENTS.WATER, ELEMENTS.THUNDER],
    [ELEMENTS.WIND]: [ELEMENTS.EARTH, ELEMENTS.DARK],
    [ELEMENTS.THUNDER]: [ELEMENTS.WATER, ELEMENTS.WIND],
    [ELEMENTS.LIGHT]: [ELEMENTS.DARK],
    [ELEMENTS.DARK]: [ELEMENTS.LIGHT]
};

// 成就分类
export const ACHIEVEMENT_CATEGORIES = {
    BATTLE: 'battle',            // 战斗成就
    COLLECTION: 'collection',    // 收集成就
    PROGRESSION: 'progression',  // 进度成就
    SOCIAL: 'social',            // 社交成就
    SPECIAL: 'special'           // 特殊成就
};

// 游戏设置
export const GAME_SETTINGS = {
    BATTLE: {
        MAX_TURNS: 50,           // 最大回合数
        AUTO_BATTLE_SPEED: 2000, // 自动战斗速度(ms)
        ANIMATION_SPEED: 500     // 动画速度(ms)
    },
    ECONOMY: {
        STARTING_STONES: 100,    // 初始灵石
        OFFLINE_REWARD_RATE: 0.5, // 离线奖励倍率
        MAX_OFFLINE_HOURS: 24,   // 最大离线小时数
        DAILY_LOGIN_BONUS: 50    // 每日登录奖励
    },
    PROGRESSION: {
        EXP_RATE: 1.0,           // 经验倍率
        REALM_BONUS_MULTIPLIER: 1.5, // 境界突破倍率
        MAX_LEVEL: 100,          // 最大等级
        STAT_GROWTH_RATE: 1.1    // 属性成长率
    },
    CARD_SYSTEM: {
        MAX_INVENTORY_SIZE: 200, // 最大背包容量
        MAX_EQUIPPED_CARDS: 4,   // 最大装备卡牌数
        CARD_UPGRADE_COST: 100,  // 卡牌升级成本
        QUALITY_UPGRADE_RATE: 0.7 // 品质提升成功率
    }
};

// 卡包类型
export const CARD_PACK_TYPES = {
    BASIC: 'basic',              // 基础卡包
    PREMIUM: 'premium',          // 高级卡包
    EVENT: 'event',              // 活动卡包
    SPECIAL: 'special'           // 特殊卡包
};

// 卡包配置
export const CARD_PACK_CONFIG = {
    [CARD_PACK_TYPES.BASIC]: {
        name: '基础卡包',
        price: 100,
        dropRates: {
            [RARITY.COMMON]: 70,
            [RARITY.RARE]: 25,
            [RARITY.EPIC]: 4,
            [RARITY.LEGENDARY]: 1,
            [RARITY.MYTHIC]: 0
        }
    },
    [CARD_PACK_TYPES.PREMIUM]: {
        name: '高级卡包',
        price: 500,
        dropRates: {
            [RARITY.COMMON]: 30,
            [RARITY.RARE]: 40,
            [RARITY.EPIC]: 20,
            [RARITY.LEGENDARY]: 8,
            [RARITY.MYTHIC]: 2
        }
    },
    [CARD_PACK_TYPES.EVENT]: {
        name: '活动卡包',
        price: 800,
        dropRates: {
            [RARITY.COMMON]: 10,
            [RARITY.RARE]: 30,
            [RARITY.EPIC]: 35,
            [RARITY.LEGENDARY]: 20,
            [RARITY.MYTHIC]: 5
        }
    }
};

// 保底系统配置
export const PITY_CONFIG = {
    [CARD_PACK_TYPES.BASIC]: {
        enabled: true,
        pityCount: 10,
        guaranteedRarity: RARITY.RARE
    },
    [CARD_PACK_TYPES.PREMIUM]: {
        enabled: true,
        pityCount: 8,
        guaranteedRarity: RARITY.EPIC
    },
    [CARD_PACK_TYPES.EVENT]: {
        enabled: true,
        pityCount: 5,
        guaranteedRarity: RARITY.LEGENDARY
    }
};

// 特殊效果类型
export const SPECIAL_EFFECTS = {
    LIFE_STEAL: 'life_steal',            // 生命偷取
    MANA_BURN: 'mana_burn',              // 法力燃烧
    STUN: 'stun',                        // 眩晕
    BLEED: 'bleed',                      // 出血
    POISON: 'poison',                    // 中毒
    REGENERATION: 'regeneration',        // 再生
    SHIELD: 'shield',                    // 护盾
    CRITICAL_HIT: 'critical_hit',        // 暴击
    EVADE: 'evade',                      // 闪避
    COUNTER_ATTACK: 'counter_attack'     // 反击
};

// UI相关常量
export const UI_CONSTANTS = {
    ANIMATION_DURATION: 300,             // 动画持续时间(ms)
    TOAST_DURATION: 3000,                // 提示持续时间(ms)
    MODAL_BACKDROP_OPACITY: 0.5,         // 模态框背景透明度
    LOADING_MIN_DURATION: 1000,          // 加载最小持续时间(ms)
    DEBOUNCE_DELAY: 300                   // 防抖延迟(ms)
};

// 本地存储键名
export const STORAGE_KEYS = {
    PLAYER_DATA: 'cardToGod_playerData',
    GAME_SETTINGS: 'cardToGod_gameSettings',
    ACHIEVEMENTS: 'cardToGod_achievements',
    BATTLE_HISTORY: 'cardToGod_battleHistory',
    LAST_LOGIN: 'cardToGod_lastLogin',
    VERSION: 'cardToGod_version'
};

// 游戏版本
export const GAME_VERSION = '1.0.0';

// 调试模式
export const DEBUG_MODE = false;

// 导出所有常量
export const CONSTANTS = {
    REALMS,
    REALM_REQUIREMENTS,
    RARITY,
    RARITY_CONFIG,
    CARD_TYPES,
    EQUIPMENT_SLOTS,
    TECHNIQUE_TYPES,
    ENEMY_TYPES,
    BATTLE_TYPES,
    BATTLE_STATUS,
    ELEMENTS,
    ELEMENT_COUNTERS,
    ACHIEVEMENT_CATEGORIES,
    GAME_SETTINGS,
    CARD_PACK_TYPES,
    CARD_PACK_CONFIG,
    PITY_CONFIG,
    SPECIAL_EFFECTS,
    UI_CONSTANTS,
    STORAGE_KEYS,
    GAME_VERSION,
    DEBUG_MODE
};
