/**
 * 战斗AI系统
 * 负责敌人的智能决策
 */

export class BattleAI {
    constructor(battleCore) {
        this.battleCore = battleCore;
    }

    /**
     * 选择敌人行动
     */
    selectEnemyAction(actor, opponent) {
        console.log(`AI selecting action for ${actor.name}`);
        
        const healthPercent = actor.stats.health / actor.stats.maxHealth;
        const spiritPercent = actor.stats.spiritPower / actor.stats.maxSpiritPower;
        
        // 简单AI逻辑
        if (healthPercent < 0.3) {
            // 血量低时倾向于防御
            return Math.random() < 0.7 ? 
                { type: 'defend', skill: null } : 
                { type: 'attack', skill: actor.skills.find(s => s.id === 'basic_attack') };
        } else if (healthPercent > 0.7) {
            // 血量高时倾向于攻击
            return Math.random() < 0.8 ? 
                { type: 'attack', skill: actor.skills.find(s => s.id === 'basic_attack') } : 
                { type: 'defend', skill: null };
        } else {
            // 中等血量随机选择
            return Math.random() < 0.6 ? 
                { type: 'attack', skill: actor.skills.find(s => s.id === 'basic_attack') } : 
                { type: 'defend', skill: null };
        }
    }
}
