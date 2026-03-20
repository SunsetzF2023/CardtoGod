/**
 * 战斗回合处理器
 * 负责处理每个战斗回合的逻辑
 */

export class BattleTurnProcessor {
    constructor(battleCore) {
        this.battleCore = battleCore;
    }

    /**
     * 处理战斗回合
     */
    async processTurn() {
        if (!this.battleCore.currentBattle) {
            console.error('Battle: currentBattle is null');
            return;
        }
        
        if (this.battleCore.currentBattle.status !== 'ongoing') {
            console.log('Battle: status not ONGOING');
            return;
        }

        this.battleCore.currentBattle.currentTurn++;
        console.log(`Turn ${this.battleCore.currentBattle.currentTurn}, currentActor: ${this.battleCore.currentBattle.currentActor}`);
        
        // 检查回合限制
        if (this.battleCore.currentBattle.currentTurn > this.battleCore.config.maxTurns) {
            this.battleCore.endBattle('draw');
            return;
        }

        const actor = this.battleCore.getCurrentActor();
        const opponent = this.battleCore.getOpponent();
        
        console.log(`Actor: ${actor.name}, Opponent: ${opponent.name}`);

        // 检查是否有人死亡
        if (actor.stats.health <= 0 || opponent.stats.health <= 0) {
            this.determineBattleResult();
            return;
        }

        // 如果是玩家回合，等待玩家选择行动
        if (actor.type === 'player') {
            console.log('Player turn, waiting for action');
            return;
        }

        // 敌人自动行动
        console.log('Enemy turn, executing AI');
        await this.executeAction(actor, opponent);

        // 切换行动者
        this.battleCore.switchActor();

        // 继续下一回合
        if (this.battleCore.currentBattle.status === 'ongoing') {
            setTimeout(() => this.processTurn(), this.battleCore.config.actionDelay);
        }
    }

    /**
     * 执行行动
     */
    async executeAction(actor, opponent) {
        console.log(`Executing action for ${actor.name}`);
        
        actor.isDefending = false;
        const action = this.selectAction(actor, opponent);
        console.log('Selected action:', action);
        
        // 执行行动
        switch (action.type) {
            case 'attack':
                this.executeAttack(actor, opponent, action.skill);
                break;
            case 'defend':
                this.executeDefend(actor);
                break;
            default:
                this.executeAttack(actor, opponent, null);
        }

        actor.lastAction = action;
        actor.actionCount++;
        console.log(`Action completed for ${actor.name}`);
    }

    /**
     * 选择行动
     */
    selectAction(actor, opponent) {
        if (actor.type === 'player') {
            return {
                type: 'attack',
                skill: actor.skills.find(s => s.id === 'basic_attack')
            };
        }

        // 简单AI：随机选择攻击或防御
        const actions = ['attack', 'defend'];
        const selectedAction = actions[Math.floor(Math.random() * actions.length)];
        
        return {
            type: selectedAction,
            skill: selectedAction === 'attack' ? actor.skills.find(s => s.id === 'basic_attack') : null
        };
    }

    /**
     * 执行攻击
     */
    executeAttack(attacker, defender, skill) {
        const baseDamage = skill ? skill.damage : 5;
        const attackPower = attacker.stats.attack;
        const defensePower = defender.stats.defense * (defender.isDefending ? 1.5 : 1);
        
        let damage = Math.max(1, baseDamage + attackPower - defensePower);
        
        // 境界加成
        if (attacker.realm && defender.realm) {
            const realmDiff = this.battleCore.getRealmLevel(attacker.realm) - this.battleCore.getRealmLevel(defender.realm);
            if (realmDiff > 0) {
                damage = Math.floor(damage * (1 + realmDiff * 0.2));
            }
        }
        
        // 随机浮动
        damage = Math.floor(damage * (0.8 + Math.random() * 0.4));
        
        defender.stats.health = Math.max(0, defender.stats.health - damage);
        
        this.battleCore.addBattleLog(`${attacker.name} 攻击造成 ${damage} 点伤害！`);
        
        // 触发UI更新
        this.battleCore.gameEngine.triggerEvent('battleDamage', {
            target: defender.type,
            damage: damage,
            remainingHealth: defender.stats.health,
            maxHealth: defender.stats.maxHealth
        });
    }

    /**
     * 执行防御
     */
    executeDefend(actor) {
        actor.isDefending = true;
        this.battleCore.addBattleLog(`${actor.name} 进入防御状态！`);
    }

    /**
     * 确定战斗结果
     */
    determineBattleResult() {
        const player = this.battleCore.currentBattle.participants.player;
        const enemy = this.battleCore.currentBattle.participants.enemy;
        
        let result;
        if (player.stats.health <= 0 && enemy.stats.health <= 0) {
            result = 'draw';
        } else if (player.stats.health <= 0) {
            result = 'defeat';
        } else {
            result = 'victory';
        }
        
        this.battleCore.endBattle(result);
    }
}
