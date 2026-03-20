/**
 * NPC好友系统
 * 管理游戏内的NPC好友关系和收益
 */

export class NPCFriendSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.friends = new Map();
        this.friendshipLevels = {
            STRANGER: 0,
            ACQUAINTANCE: 1,
            FRIEND: 2,
            CLOSE_FRIEND: 3,
            BEST_FRIEND: 4,
            SOUL_BROTHER: 5
        };
        this.initDefaultFriends();
    }

    /**
     * 初始化默认好友
     */
    initDefaultFriends() {
        const defaultFriends = [
            {
                id: 'elder_zhang',
                name: '张长老',
                title: '青云门长老',
                realm: '元婴期',
                personality: 'wise',
                benefits: {
                    cultivation: 5,
                    spiritStones: 2,
                    guidance: 3
                },
                friendshipLevel: this.friendshipLevels.ACQUAINTANCE,
                lastInteraction: Date.now() - 86400000, // 1天前
                unlockLevel: 1
            },
            {
                id: 'sister_li',
                name: '李师姐',
                title: '内门弟子',
                realm: '金丹期',
                personality: 'caring',
                benefits: {
                    cultivation: 3,
                    pills: 1,
                    protection: 2
                },
                friendshipLevel: this.friendshipLevels.STRANGER,
                lastInteraction: Date.now() - 172800000, // 2天前
                unlockLevel: 1
            },
            {
                id: 'merchant_wang',
                name: '王掌柜',
                title: '百草堂掌柜',
                realm: '筑基期',
                personality: 'greedy',
                benefits: {
                    discounts: 0.1,
                    rareItems: 1,
                    information: 2
                },
                friendshipLevel: this.friendshipLevels.STRANGER,
                lastInteraction: Date.now() - 259200000, // 3天前
                unlockLevel: 1
            },
            {
                id: 'mysterious_liu',
                name: '刘神秘',
                title: '散修',
                realm: '化神期',
                personality: 'mysterious',
                benefits: {
                    secretTechniques: 1,
                    ancientKnowledge: 2,
                    adventureOpportunities: 3
                },
                friendshipLevel: this.friendshipLevels.STRANGER,
                lastInteraction: Date.now() - 604800000, // 7天前
                unlockLevel: 5
            },
            {
                id: 'blacksmith_chen',
                name: '陈铁匠',
                title: '炼器大师',
                realm: '筑基期',
                personality: 'honest',
                benefits: {
                    equipmentBonus: 2,
                    repairDiscount: 0.3,
                    customItems: 1
                },
                friendshipLevel: this.friendshipLevels.STRANGER,
                lastInteraction: Date.now() - 432000000, // 5天前
                unlockLevel: 3
            }
        ];

        defaultFriends.forEach(friend => {
            this.friends.set(friend.id, friend);
        });
    }

    /**
     * 获取所有好友
     */
    getAllFriends() {
        return Array.from(this.friends.values());
    }

    /**
     * 获取好友
     */
    getFriend(friendId) {
        return this.friends.get(friendId);
    }

    /**
     * 检查是否可以解锁
     */
    canUnlockFriend(friendId) {
        const friend = this.getFriend(friendId);
        if (!friend) return false;
        
        const player = this.gameEngine.player;
        return player.level >= friend.unlockLevel;
    }

    /**
     * 解锁好友
     */
    unlockFriend(friendId) {
        const friend = this.getFriend(friendId);
        if (friend && friend.friendshipLevel === this.friendshipLevels.STRANGER) {
            friend.friendshipLevel = this.friendshipLevels.ACQUAINTANCE;
            friend.lastInteraction = Date.now();
            
            this.gameEngine.addLog(`结识了新朋友：${friend.name}！`, 'success');
            return true;
        }
        return false;
    }

    /**
     * 与好友互动
     */
    interactWithFriend(friendId) {
        const friend = this.getFriend(friendId);
        if (!friend) return null;

        const now = Date.now();
        const timeSinceLastInteraction = now - friend.lastInteraction;
        
        // 检查冷却时间（6小时）
        if (timeSinceLastInteraction < 21600000) {
            const remainingTime = Math.ceil((21600000 - timeSinceLastInteraction) / 3600000);
            return {
                success: false,
                message: `${friend.name} 正在忙碌，请 ${remainingTime} 小时后再来。`
            };
        }

        // 更新互动时间
        friend.lastInteraction = now;

        // 根据性格和友好度生成互动结果
        const interaction = this.generateInteraction(friend);
        
        // 增加友好度
        this.increaseFriendship(friendId, interaction.friendshipChange);

        return {
            success: true,
            interaction: interaction
        };
    }

    /**
     * 生成互动内容
     */
    generateInteraction(friend) {
        const interactions = {
            wise: [
                {
                    type: 'guidance',
                    text: `${friend.name} 为你讲解修炼心得`,
                    effect: () => {
                        const cultivation = friend.benefits.guidance * 10;
                        this.gameEngine.player.cultivate(cultivation);
                        return `获得 ${cultivation} 点修为`;
                    },
                    friendshipChange: 1
                },
                {
                    type: 'blessing',
                    text: `${friend.name} 为你祝福，修为精进`,
                    effect: () => {
                        const boost = friend.benefits.cultivation * 5;
                        this.gameEngine.player.cultivate(boost);
                        return `修为临时提升 ${boost} 点`;
                    },
                    friendshipChange: 2
                }
            ],
            caring: [
                {
                    type: 'gift',
                    text: `${friend.name} 关心你的修炼情况`,
                    effect: () => {
                        const pills = friend.benefits.pills;
                        for (let i = 0; i < pills; i++) {
                            this.gameEngine.player.addItem({
                                id: 'pill_' + Date.now() + '_' + i,
                                name: '回气丹',
                                type: 'pill',
                                effect: 'restore_spirit',
                                value: 20
                            });
                        }
                        return `获得 ${pills} 颗回气丹`;
                    },
                    friendshipChange: 2
                },
                {
                    type: 'protection',
                    text: `${friend.name} 主动为你护法`,
                    effect: () => {
                        const protection = friend.benefits.protection;
                        // 临时增加防御力
                        const player = this.gameEngine.player;
                        player.stats.defense = (player.stats.defense || 10) + protection;
                        return `防御力临时提升 ${protection} 点`;
                    },
                    friendshipChange: 1
                }
            ],
            greedy: [
                {
                    type: 'trade',
                    text: `${friend.name} 愿意与你交易`,
                    effect: () => {
                        const discount = friend.benefits.discounts;
                        const stones = Math.floor(Math.random() * 50) + 20;
                        const actualCost = Math.floor(stones * (1 - discount));
                        
                        if (this.gameEngine.player.spiritStones >= actualCost) {
                            this.gameEngine.player.spiritStones -= actualCost;
                            this.gameEngine.player.addItem({
                                id: 'rare_material_' + Date.now(),
                                name: '稀有灵材',
                                type: 'material',
                                rarity: 'rare',
                                value: stones
                            });
                            return `以 ${actualCost} 枚灵石购买了稀有材料（节省了 ${Math.floor(stones * discount)} 枚）`;
                        }
                        return '灵石不足，无法交易';
                    },
                    friendshipChange: 1
                },
                {
                    type: 'information',
                    text: `${friend.name} 告诉你一个秘密`,
                    effect: () => {
                        const info = friend.benefits.information;
                        // 随机给予信息或位置
                        const secrets = [
                            '发现了一个隐藏的修炼地点',
                            '得知了某个敌人的弱点',
                            '获得了一张藏宝图',
                            '了解了一个新的修炼方法'
                        ];
                        const secret = secrets[Math.floor(Math.random() * secrets.length)];
                        this.gameEngine.player.addItem({
                            id: 'secret_' + Date.now(),
                            name: secret,
                            type: 'information',
                            value: info * 10
                        });
                        return `获得了信息：${secret}`;
                    },
                    friendshipChange: 2
                }
            ],
            mysterious: [
                {
                    type: 'secret_teaching',
                    text: `${friend.name} 传授你神秘功法`,
                    effect: () => {
                        const techniques = friend.benefits.secretTechniques;
                        for (let i = 0; i < techniques; i++) {
                            this.gameEngine.player.addItem({
                                id: 'technique_' + Date.now() + '_' + i,
                                name: '神秘剑诀',
                                type: 'technique',
                                rarity: 'rare',
                                damage: 15 + Math.floor(Math.random() * 10),
                                spiritCost: 5
                            });
                        }
                        return `获得了 ${techniques} 门神秘功法`;
                    },
                    friendshipChange: 3
                },
                {
                    type: 'adventure',
                    text: `${friend.name} 邀请你参与冒险`,
                    effect: () => {
                        const opportunities = friend.benefits.adventureOpportunities;
                        const rewards = Math.floor(opportunities * Math.random() * 100 + 50);
                        this.gameEngine.player.cultivate(rewards);
                        this.gameEngine.player.addSpiritStones(Math.floor(rewards / 2));
                        return `冒险归来，获得 ${rewards} 修为和 ${Math.floor(rewards / 2)} 灵石`;
                    },
                    friendshipChange: 2
                }
            ],
            honest: [
                {
                    type: 'craft_help',
                    text: `${friend.name} 帮助你炼制装备`,
                    effect: () => {
                        const bonus = friend.benefits.equipmentBonus;
                        const player = this.gameEngine.player;
                        
                        // 临时提升装备效果
                        if (player.inventory?.equipped?.weapon) {
                            const weapon = player.inventory.equipped.weapon;
                            weapon.damage = (weapon.damage || 5) + bonus;
                            return `武器伤害临时提升 ${bonus} 点`;
                        }
                        return '没有装备可以强化';
                    },
                    friendshipChange: 2
                },
                {
                    type: 'repair',
                    text: `${friend.name} 免费为你修理装备`,
                    effect: () => {
                        const discount = friend.benefits.repairDiscount;
                        // 模拟修理效果
                        return `装备修理费用减免 ${Math.floor(discount * 100)}%`;
                    },
                    friendshipChange: 1
                }
            ]
        };

        const personalityInteractions = interactions[friend.personality] || interactions.wise;
        return personalityInteractions[Math.floor(Math.random() * personalityInteractions.length)];
    }

    /**
     * 增加友好度
     */
    increaseFriendship(friendId, amount) {
        const friend = this.getFriend(friendId);
        if (!friend) return;

        friend.friendshipLevel = Math.min(
            this.friendshipLevels.SOUL_BROTHER,
            friend.friendshipLevel + amount
        );

        // 检查友好度提升
        const levelNames = {
            0: '陌生人',
            1: '相识',
            2: '朋友',
            3: '好友',
            4: '挚友',
            5: '兄弟'
        };

        const currentLevel = levelNames[friend.friendshipLevel];
        this.gameEngine.addLog(`与 ${friend.name} 的关系提升为：${currentLevel}`, 'success');
    }

    /**
     * 获取好友收益
     */
    getFriendBenefits() {
        let totalBenefits = {
            cultivation: 0,
            spiritStones: 0,
            pills: 0,
            equipmentBonus: 0
        };

        this.friends.forEach(friend => {
            if (friend.friendshipLevel >= this.friendshipLevels.FRIEND) {
                // 好友及以上等级提供稳定收益
                totalBenefits.cultivation += friend.benefits.cultivation || 0;
                totalBenefits.spiritStones += friend.benefits.spiritStones || 0;
                totalBenefits.pills += friend.benefits.pills || 0;
                totalBenefits.equipmentBonus += friend.benefits.equipmentBonus || 0;
            }
        });

        return totalBenefits;
    }

    /**
     * 应用好友收益（每小时）
     */
    applyHourlyBenefits() {
        const benefits = this.getFriendBenefits();
        const player = this.gameEngine.player;

        if (benefits.cultivation > 0) {
            player.cultivate(benefits.cultivation);
        }
        if (benefits.spiritStones > 0) {
            player.addSpiritStones(benefits.spiritStones);
        }
        if (benefits.pills > 0) {
            for (let i = 0; i < benefits.pills; i++) {
                player.addItem({
                    id: 'friend_pill_' + Date.now() + '_' + i,
                    name: '友人丹',
                    type: 'pill',
                    effect: 'cultivation',
                    value: 10
                });
            }
        }

        if (Object.values(benefits).some(v => v > 0)) {
            this.gameEngine.addLog('好友们为你提供了帮助！', 'success');
        }
    }

    /**
     * 保存好友数据
     */
    save() {
        const data = {
            friends: Array.from(this.friends.entries()),
            lastSaved: Date.now()
        };
        localStorage.setItem('npc_friends', JSON.stringify(data));
    }

    /**
     * 加载好友数据
     */
    load() {
        const saved = localStorage.getItem('npc_friends');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                data.friends.forEach(([id, friend]) => {
                    this.friends.set(id, friend);
                });
            } catch (error) {
                console.error('Failed to load NPC friends:', error);
            }
        }
    }
}
