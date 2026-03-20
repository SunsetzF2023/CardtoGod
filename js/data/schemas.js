/**
 * 游戏数据模型定义
 * 定义游戏中所有核心数据结构的Schema
 */

// 玩家数据模型
export const PlayerSchema = {
    id: 'string',                    // 玩家唯一ID
    name: 'string',                  // 玩家名称
    level: 'number',                 // 等级
    realm: 'string',                 // 境界
    realmLevel: 'number',            // 境界层级 (1-9)
    age: 'number',                   // 年龄
    lifespan: 'number',              // 寿命
    cultivation: 'number',            // 修为值
    stats: {
        attack: 'number',            // 攻击力
        defense: 'number',           // 防御力
        speed: 'number',             // 速度
        health: 'number',            // 生命值
        maxHealth: 'number',        // 最大生命值
        spiritPower: 'number',       // 灵力
        maxSpiritPower: 'number'     // 最大灵力
    },
    resources: {
        spiritStones: 'number',      // 灵石
        contribution: 'number',      // 贡献点
        exp: 'number',               // 经验值
        maxExp: 'number'             // 升级所需经验
    },
    inventory: {
        cards: 'Array',              // 拥有的卡牌
        equipped: 'Object',          // 已装备的卡牌
        items: 'Array'               // 道具
    },
    progress: {
        currentStage: 'string',      // 当前阶段
        completedStages: 'Array',    // 已完成阶段
        achievements: 'Array',       // 成就
        battleWins: 'number',        // 战斗胜利次数
        totalBattles: 'number'       // 总战斗次数
    },
    settings: {
        autoBattle: 'boolean',       // 自动战斗
        notifications: 'boolean',    // 通知设置
        soundEffects: 'boolean'      // 音效设置
    },
    lastLogin: 'Date',               // 最后登录时间
    offlineRewards: 'Object'         // 离线奖励
};

// 卡牌数据模型
export const CardSchema = {
    id: 'string',                    // 卡牌唯一ID
    name: 'string',                  // 卡牌名称
    type: 'string',                  // 类型: technique(功法), medicine(灵药), equipment(装备)
    rarity: 'string',                // 稀有度: common, rare, epic, legendary, mythic
    quality: 'number',               // 品质 1-5
    level: 'number',                 // 等级
    description: 'string',           // 描述
    icon: 'string',                  // 图标路径
    
    // 属性加成
    effects: {
        attack: 'number',            // 攻击加成
        defense: 'number',           // 防御加成
        health: 'number',            // 生命加成
        spiritPower: 'number',       // 灵力加成
        cultivation: 'number',       // 修为加成
        lifespan: 'number',          // 寿命加成
        expBonus: 'number',          // 经验加成(%)
        stoneBonus: 'number'         // 灵石加成(%)
    },
    
    // 特殊效果
    specialEffects: 'Array',         // 特殊效果列表
    
    // 使用条件
    requirements: {
        realm: 'string',             // 需要境界
        level: 'number',             // 需要等级
        cultivation: 'number'        // 需要修为
    },
    
    // 消耗品相关
    consumable: 'boolean',           // 是否为消耗品
    stackSize: 'number',             // 堆叠数量
    cooldown: 'number',              // 冷却时间(秒)
    
    // 装备相关
    equipmentSlot: 'string',         // 装备位置: weapon, armor, accessory, technique
    durability: 'number',            // 耐久度
    maxDurability: 'number',         // 最大耐久度
    
    // 功法相关
    techniqueType: 'string',         // 功法类型: attack, defense, support
    spiritCost: 'number',            // 灵力消耗
    damage: 'number',                // 基础伤害
    healing: 'number',               // 治疗量
    
    // 元数据
    obtainable: 'boolean',           // 是否可获得
    tradable: 'boolean',             // 是否可交易
    sellPrice: 'number',             // 出售价格
    buyPrice: 'number',              // 购买价格
    
    createdAt: 'Date',               // 创建时间
    updatedAt: 'Date'                // 更新时间
};

// 卡包数据模型
export const CardPackSchema = {
    id: 'string',                    // 卡包ID
    name: 'string',                  // 卡包名称
    type: 'string',                  // 类型: basic, premium, event
    price: 'number',                 // 价格(灵石)
    description: 'string',           // 描述
    icon: 'string',                  // 图标
    
    // 抽取概率
    dropRates: {
        common: 'number',            // 普通概率 (%)
        rare: 'number',              // 稀有概率 (%)
        epic: 'number',              // 史诗概率 (%)
        legendary: 'number',         // 传说概率 (%)
        mythic: 'number'             // 神话概率 (%)
    },
    
    // 保底机制
    pitySystem: {
        enabled: 'boolean',          // 是否启用保底
        pityCount: 'number',         // 保底次数
        guaranteedRarity: 'string'   // 保底稀有度
    },
    
    // 奖励池
    rewardPool: 'Array',             // 可获得的卡牌ID列表
    
    // 限制
    limited: 'boolean',              // 是否限时
    startDate: 'Date',               // 开始时间
    endDate: 'Date',                 // 结束时间
    maxPurchases: 'number',          // 最大购买次数
    
    // 额外奖励
    bonusRewards: 'Array',           // 额外奖励
    
    available: 'boolean',            // 是否可用
    sortOrder: 'number'              // 排序顺序
};

// 战斗数据模型
export const BattleSchema = {
    id: 'string',                    // 战斗ID
    type: 'string',                  // 战斗类型: pve, pvp, boss
    status: 'string',                // 状态: preparing, ongoing, victory, defeat
    
    // 参与者
    participants: {
        player: 'PlayerSchema',      // 玩家数据
        enemy: 'EnemySchema'         // 敌人数据
    },
    
    // 战斗记录
    battleLog: 'Array',              // 战斗日志
    
    // 回合信息
    currentTurn: 'number',            // 当前回合
    maxTurns: 'number',              // 最大回合数
    
    // 奖励
    rewards: {
        exp: 'number',               // 经验奖励
        spiritStones: 'number',      // 灵石奖励
        cards: 'Array',              // 卡牌奖励
        items: 'Array'               // 道具奖励
    },
    
    // 时间记录
    startTime: 'Date',               // 开始时间
    endTime: 'Date',                 // 结束时间
    duration: 'number'               // 持续时间(秒)
};

// 敌人数据模型
export const EnemySchema = {
    id: 'string',                    // 敌人ID
    name: 'string',                  // 敌人名称
    type: 'string',                  // 类型: beast, demon, cultivator, boss
    level: 'number',                 // 等级
    realm: 'string',                 // 境界
    
    // 属性
    stats: {
        attack: 'number',            // 攻击力
        defense: 'number',           // 防御力
        speed: 'number',             // 速度
        health: 'number',            // 生命值
        maxHealth: 'number',        // 最大生命值
        spiritPower: 'number',       // 灵力
        maxSpiritPower: 'number'     // 最大灵力
    },
    
    // 技能
    skills: 'Array',                 // 技能列表
    
    // AI行为
    ai: {
        aggressiveness: 'number',    // 攻击性 (1-10)
        intelligence: 'number',      // 智能程度 (1-10)
        escapeThreshold: 'number'    // 逃跑阈值
    },
    
    // 奖励
    rewards: {
        exp: 'number',               // 经验奖励
        spiritStones: 'number',      // 灵石奖励
        dropTable: 'Array'           // 掉落表
    },
    
    // 特殊属性
    special: {
        elemental: 'string',         // 元素属性
        weaknesses: 'Array',         // 弱点
        resistances: 'Array'         // 抗性
    },
    
    description: 'string',           // 描述
    icon: 'string'                   // 图标
};

// 游戏配置数据模型
export const GameConfigSchema = {
    version: 'string',               // 游戏版本
    settings: {
        battle: {
            maxTurns: 'number',      // 最大回合数
            autoBattleSpeed: 'number', // 自动战斗速度
            animationSpeed: 'number'   // 动画速度
        },
        economy: {
            startingStones: 'number', // 初始灵石
            offlineRewardRate: 'number', // 离线奖励倍率
            maxOfflineHours: 'number'   // 最大离线小时数
        },
        progression: {
            expRate: 'number',       // 经验倍率
            realmRequirements: 'Object', // 境界要求
            levelCurve: 'Array'      // 等级曲线
        }
    },
    features: {
        enabled: 'Array',            // 启用的功能列表
        experimental: 'Array'        // 实验性功能
    },
    balance: {
        cardPrices: 'Object',        // 卡牌价格平衡
        enemyDifficulty: 'Object',   // 敌人难度平衡
        rewardRates: 'Object'        // 奖励率平衡
    }
};

// 成就数据模型
export const AchievementSchema = {
    id: 'string',                    // 成就ID
    name: 'string',                  // 成就名称
    description: 'string',           // 描述
    category: 'string',              // 分类: battle, collection, progression
    
    // 完成条件
    conditions: {
        type: 'string',              // 条件类型
        target: 'number',            // 目标数值
        current: 'number'            // 当前进度
    },
    
    // 奖励
    rewards: {
        spiritStones: 'number',      // 灵石奖励
        cards: 'Array',              // 卡牌奖励
        titles: 'Array',             // 称号奖励
        unlockedFeatures: 'Array'    // 解锁功能
    },
    
    // 状态
    completed: 'boolean',            // 是否完成
    completedAt: 'Date',             // 完成时间
    hidden: 'boolean',               // 是否隐藏
    sortOrder: 'number'              // 排序顺序
};

// 导出所有Schema
export const Schemas = {
    Player: PlayerSchema,
    Card: CardSchema,
    CardPack: CardPackSchema,
    Battle: BattleSchema,
    Enemy: EnemySchema,
    GameConfig: GameConfigSchema,
    Achievement: AchievementSchema
};
