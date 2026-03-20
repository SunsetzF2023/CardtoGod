/**
 * UI管理器类
 * 负责管理用户界面、事件绑定、状态更新
 */

export class UIManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.currentView = 'cultivation';
        this.modals = new Map();
        this.toasts = [];
        
        // UI元素缓存
        this.elements = {};
        
        // 事件绑定
        this.bindedEvents = new Set();
    }

    /**
     * 初始化UI管理器
     */
    async init() {
        console.log('初始化UI管理器...');
        
        // 缓存UI元素
        this.cacheElements();
        
        // 绑定事件
        this.bindEvents();
        
        // 绑定游戏引擎事件
        this.bindGameEngineEvents();
        
        // 初始化界面
        this.updatePlayerInfo();
        this.showView('cultivation');
        
        console.log('UI管理器初始化完成');
    }

    /**
     * 缓存UI元素
     */
    cacheElements() {
        // 玩家信息元素
        this.elements.spiritStones = document.getElementById('spiritStones');
        this.elements.playerRealm = document.getElementById('playerRealm');
        this.elements.playerHealth = document.getElementById('playerHealth');
        this.elements.levelInfo = document.getElementById('levelInfo');
        this.elements.realmInfo = document.getElementById('realmInfo');
        this.elements.cultivationInfo = document.getElementById('cultivationInfo');
        this.elements.lifespanInfo = document.getElementById('lifespanInfo');
        
        // 属性条
        this.elements.attackValue = document.getElementById('attackValue');
        this.elements.attackBar = document.getElementById('attackBar');
        this.elements.defenseValue = document.getElementById('defenseValue');
        this.elements.defenseBar = document.getElementById('defenseBar');
        this.elements.spiritValue = document.getElementById('spiritValue');
        this.elements.spiritBar = document.getElementById('spiritBar');
        
        // 按钮
        this.elements.cultivateBtn = document.getElementById('cultivateBtn');
        this.elements.battleBtn = document.getElementById('battleBtn');
        this.elements.packBtn = document.getElementById('packBtn');
        this.elements.inventoryBtn = document.getElementById('inventoryBtn');
        this.elements.startCultivationBtn = document.getElementById('startCultivationBtn');
        this.elements.breakthroughBtn = document.getElementById('breakthroughBtn');
        this.elements.settingsBtn = document.getElementById('settingsBtn');
        
        // 主要内容区域
        this.elements.mainContent = document.getElementById('mainContent');
        this.elements.messageLog = document.getElementById('messageLog');
        
        // 气运信息
        this.elements.playerLuck = document.getElementById('playerLuck');
        this.elements.luckInfo = document.getElementById('luckInfo');
        
        // 容器
        this.elements.modalContainer = document.getElementById('modalContainer');
        this.elements.toastContainer = document.getElementById('toastContainer');
        this.elements.loadingOverlay = document.getElementById('loadingOverlay');
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 快捷操作按钮
        this.bindEvent(this.elements.cultivateBtn, 'click', () => {
            this.showView('cultivation');
        });
        
        this.bindEvent(this.elements.battleBtn, 'click', () => {
            this.showView('battle');
        });
        
        this.bindEvent(this.elements.packBtn, 'click', () => {
            this.showView('cardpack');
        });
        
        this.bindEvent(this.elements.inventoryBtn, 'click', () => {
            this.showView('inventory');
        });
        
        // 修炼按钮
        this.bindEvent(this.elements.startCultivationBtn, 'click', () => {
            this.toggleCultivation();
        });
        
        this.bindEvent(this.elements.breakthroughBtn, 'click', () => {
            this.attemptBreakthrough();
        });
        
        // 设置按钮
        this.bindEvent(this.elements.settingsBtn, 'click', () => {
            this.showSettingsModal();
        });
        
        // 键盘事件
        this.bindEvent(document, 'keydown', (e) => {
            this.handleKeyboard(e);
        });
    }

    /**
     * 绑定单个事件
     */
    bindEvent(element, event, handler) {
        if (element && !this.bindedEvents.has(element)) {
            element.addEventListener(event, handler);
            this.bindedEvents.add(element);
        }
    }

    /**
     * 绑定游戏引擎事件
     */
    bindGameEngineEvents() {
        // 玩家属性变化
        this.gameEngine.addEventListener('playerStatsChanged', (stats) => {
            this.updatePlayerStats(stats);
        });
        
        // 玩家升级
        this.gameEngine.addEventListener('playerLevelUp', (data) => {
            this.updatePlayerInfo();
            this.showToast(`恭喜升级到 Lv.${data.level}！`, 'success');
        });
        
        // 境界突破
        this.gameEngine.addEventListener('playerRealmBreakthrough', (data) => {
            this.updatePlayerInfo();
            this.showToast(`恭喜突破到 ${data.newRealm}！`, 'success');
        });
        
        // 灵石变化
        this.gameEngine.addEventListener('spiritStonesChanged', (amount) => {
            this.updateResourceInfo();
        });
        
        // 背包变化
        this.gameEngine.addEventListener('inventoryChanged', (inventory) => {
            this.updateInventoryInfo();
        });
        
        // 气运变化
        this.gameEngine.addEventListener('luckChanged', (luck) => {
            this.updateLuckInfo();
        });
        
        // 战斗伤害变化
        this.gameEngine.addEventListener('battleDamage', (data) => {
            this.updateBattleHealth(data);
        });
        
        // 战斗开始
        this.gameEngine.addEventListener('battleStarted', (data) => {
            this.showBattleView(data.enemy);
        });
        
        // 战斗结束
        this.gameEngine.addEventListener('battleEnded', (data) => {
            this.handleBattleEnd(data);
        });
        
        // 游戏日志
        this.gameEngine.addEventListener('addLog', (data) => {
            this.addLog(data.message, data.type);
        });
        
        // 战斗日志
        this.gameEngine.addEventListener('battleLog', (data) => {
            this.addBattleLog(data.message);
        });
        
        // 游戏更新
        this.gameEngine.addEventListener('gameUpdate', (data) => {
            this.update();
        });
    }

    /**
     * 更新UI
     */
    update() {
        this.updatePlayerInfo();
        this.updateResourceInfo();
        this.updateCurrentView();
    }

    /**
     * 更新玩家信息
     */
    updatePlayerInfo() {
        const player = this.gameEngine.player;
        
        // 基础信息
        if (this.elements.spiritStones) {
            this.elements.spiritStones.textContent = player.resources.spiritStones;
        }
        if (this.elements.playerRealm) {
            this.elements.playerRealm.textContent = player.realm;
        }
        if (this.elements.playerHealth) {
            this.elements.playerHealth.textContent = `${player.stats.health}/${player.stats.maxHealth}`;
        }
        
        // 详细信息
        if (this.elements.levelInfo) {
            this.elements.levelInfo.textContent = `Lv.${player.level}`;
        }
        if (this.elements.realmInfo) {
            this.elements.realmInfo.textContent = `${player.realm}${player.realmLevel}层`;
        }
        if (this.elements.cultivationInfo) {
            this.elements.cultivationInfo.textContent = `${player.cultivation}/1000`;
        }
        if (this.elements.lifespanInfo) {
            this.elements.lifespanInfo.textContent = `${player.lifespan}年`;
        }
        
        // 属性
        this.updatePlayerStats(player.stats);
        
        // 气运
        this.updateLuckInfo();
    }

    /**
     * 更新玩家属性
     */
    updatePlayerStats(stats) {
        // 攻击力
        if (this.elements.attackValue) {
            this.elements.attackValue.textContent = stats.attack;
            const attackPercent = Math.min(100, (stats.attack / 100) * 100);
            this.elements.attackBar.style.width = `${attackPercent}%`;
        }
        
        // 防御力
        if (this.elements.defenseValue) {
            this.elements.defenseValue.textContent = stats.defense;
            const defensePercent = Math.min(100, (stats.defense / 100) * 100);
            this.elements.defenseBar.style.width = `${defensePercent}%`;
        }
        
        // 灵力
        if (this.elements.spiritValue) {
            this.elements.spiritValue.textContent = `${stats.spiritPower}/${stats.maxSpiritPower}`;
            const spiritPercent = (stats.spiritPower / stats.maxSpiritPower) * 100;
            this.elements.spiritBar.style.width = `${spiritPercent}%`;
        }
    }

    /**
     * 更新资源信息
     */
    updateResourceInfo() {
        const player = this.gameEngine.player;
        if (this.elements.spiritStones) {
            this.elements.spiritStones.textContent = player.resources.spiritStones;
        }
    }

    /**
     * 更新背包信息
     */
    updateInventoryInfo() {
        // 这里可以更新背包UI
        // 暂时留空，后续实现
    }

    /**
     * 更新气运信息
     */
    updateLuckInfo() {
        const player = this.gameEngine.player;
        const luck = player.luck;
        
        if (this.elements.playerLuck) {
            this.elements.playerLuck.textContent = `气运: ${luck.level}`;
        }
        if (this.elements.luckInfo) {
            this.elements.luckInfo.textContent = luck.value;
        }
    }

    /**
     * 更新战斗血量显示
     */
    updateBattleHealth(data) {
        // 更新玩家血量
        if (data.defender === 'player') {
            const playerHealth = document.getElementById('playerBattleHealth');
            if (playerHealth) {
                playerHealth.textContent = `${data.remainingHealth}/${data.maxHealth}`;
            }
        }
        
        // 更新敌人血量
        if (data.defender === 'enemy') {
            const enemyHealth = document.getElementById('enemyBattleHealth');
            if (enemyHealth) {
                enemyHealth.textContent = `${data.remainingHealth}/${data.maxHealth}`;
            }
        }
        
        // 更新主界面的玩家信息
        this.updatePlayerInfo();
    }

    /**
     * 显示视图
     */
    showView(viewName) {
        this.currentView = viewName;
        this.gameEngine.switchView(viewName);
        
        const content = this.elements.mainContent;
        if (!content) return;
        
        switch (viewName) {
            case 'cultivation':
                this.showCultivationView();
                break;
            case 'battle':
                this.showBattlePreparationView();
                break;
            case 'cardpack':
                this.showCardPackView();
                break;
            case 'inventory':
                this.showInventoryView();
                break;
            default:
                console.warn(`未知视图: ${viewName}`);
        }
    }

    /**
     * 显示修炼视图
     */
    showCultivationView() {
        const content = this.elements.mainContent;
        const player = this.gameEngine.player;
        
        content.innerHTML = `
            <div id="cultivationView" class="game-view">
                <h2 class="text-2xl font-bold mb-6 text-yellow-400">
                    <i class="fas fa-mountain"></i> 修仙之路
                </h2>
                <div class="bg-gray-700 rounded-lg p-6 mb-6">
                    <h3 class="text-lg font-semibold mb-3">当前状态</h3>
                    <p class="text-gray-300 mb-4">你是一名${player.realm}${player.realmLevel}层的修士，需要不断修炼提升境界。</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="bg-gray-600 rounded p-4">
                            <div class="flex items-center justify-between">
                                <span class="text-gray-300">修炼速度</span>
                                <span class="text-green-400 font-semibold">${player.getRealmMultiplier().toFixed(1)}修为/秒</span>
                            </div>
                        </div>
                        <div class="bg-gray-600 rounded p-4">
                            <div class="flex items-center justify-between">
                                <span class="text-gray-300">战斗力</span>
                                <span class="text-cyan-400 font-semibold">${player.getCombatPower()}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gray-700 rounded-lg p-6 mb-6">
                    <h3 class="text-lg font-semibold mb-3">修为进度</h3>
                    <div class="mb-2">
                        <div class="flex justify-between text-sm mb-1">
                            <span>修为值</span>
                            <span>${player.cultivation}/1000</span>
                        </div>
                        <div class="w-full bg-gray-600 rounded-full h-3">
                            <div class="bg-green-500 h-3 rounded-full transition-all duration-500" style="width: ${(player.cultivation / 1000) * 100}%"></div>
                        </div>
                    </div>
                    <div class="mb-2">
                        <div class="flex justify-between text-sm mb-1">
                            <span>经验值</span>
                            <span>${player.resources.exp}/${player.resources.maxExp}</span>
                        </div>
                        <div class="w-full bg-gray-600 rounded-full h-3">
                            <div class="bg-blue-500 h-3 rounded-full transition-all duration-500" style="width: ${(player.resources.exp / player.resources.maxExp) * 100}%"></div>
                        </div>
                    </div>
                </div>
                
                <div class="flex space-x-4">
                    <button id="startCultivationBtn" class="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg transition-colors flex-1">
                        <i class="fas fa-play"></i> 开始修炼
                    </button>
                    <button id="breakthroughBtn" class="bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-6 rounded-lg transition-colors ${player.cultivation < 1000 ? 'opacity-50 cursor-not-allowed' : ''}" ${player.cultivation < 1000 ? 'disabled' : ''}>
                        <i class="fas fa-arrow-up"></i> 境界突破
                    </button>
                </div>
            </div>
        `;
        
        // 重新绑定按钮事件
        this.bindEvent(document.getElementById('startCultivationBtn'), 'click', () => {
            this.toggleCultivation();
        });
        
        this.bindEvent(document.getElementById('breakthroughBtn'), 'click', () => {
            this.attemptBreakthrough();
        });
    }

    /**
     * 显示战斗准备视图
     */
    showBattlePreparationView() {
        const content = this.elements.mainContent;
        const player = this.gameEngine.player;
        
        content.innerHTML = `
            <div id="battlePreparationView" class="game-view">
                <h2 class="text-2xl font-bold mb-6 text-red-400">
                    <i class="fas fa-sword"></i> 战斗准备
                </h2>
                <div class="bg-gray-700 rounded-lg p-6 mb-6">
                    <h3 class="text-lg font-semibold mb-3">选择对手</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="bg-gray-600 rounded p-4 cursor-pointer hover:bg-gray-500 transition-colors" onclick="game.ui.startBattleWithEnemy('beast')">
                            <div class="flex items-center justify-between mb-2">
                                <span class="font-semibold">野狼</span>
                                <span class="text-gray-400">Lv.1</span>
                            </div>
                            <div class="text-sm text-gray-300">
                                <div>攻击: 8</div>
                                <div>防御: 5</div>
                                <div>生命: 30</div>
                            </div>
                            <div class="text-sm text-green-400 mt-2">奖励: 10经验, 5灵石</div>
                        </div>
                        <div class="bg-gray-600 rounded p-4 cursor-pointer hover:bg-gray-500 transition-colors" onclick="game.ui.startBattleWithEnemy('beast_hard')">
                            <div class="flex items-center justify-between mb-2">
                                <span class="font-semibold">野猪</span>
                                <span class="text-gray-400">Lv.2</span>
                            </div>
                            <div class="text-sm text-gray-300">
                                <div>攻击: 12</div>
                                <div>防御: 8</div>
                                <div>生命: 50</div>
                            </div>
                            <div class="text-sm text-green-400 mt-2">奖励: 20经验, 10灵石</div>
                        </div>
                        <div class="bg-gray-600 rounded p-4 cursor-pointer hover:bg-gray-500 transition-colors" onclick="game.ui.startBattleWithEnemy('cultivator')">
                            <div class="flex items-center justify-between mb-2">
                                <span class="font-semibold">炼气修士</span>
                                <span class="text-gray-400">Lv.2</span>
                            </div>
                            <div class="text-sm text-gray-300">
                                <div>攻击: 15</div>
                                <div>防御: 10</div>
                                <div>生命: 60</div>
                            </div>
                            <div class="text-sm text-green-400 mt-2">奖励: 20经验, 10灵石</div>
                        </div>
                        <div class="bg-gray-600 rounded p-4 cursor-pointer hover:bg-gray-500 transition-colors" onclick="game.ui.startBattleWithEnemy('tiger')">
                            <div class="flex items-center justify-between mb-2">
                                <span class="font-semibold">老虎</span>
                                <span class="text-gray-400">Lv.3</span>
                            </div>
                            <div class="text-sm text-gray-300">
                                <div>攻击: 18</div>
                                <div>防御: 12</div>
                                <div>生命: 80</div>
                            </div>
                            <div class="text-sm text-green-400 mt-2">奖励: 30经验, 15灵石</div>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gray-700 rounded-lg p-6">
                    <h3 class="text-lg font-semibold mb-3">你的状态</h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="text-center">
                            <div class="text-2xl font-bold text-red-400">${player.stats.attack}</div>
                            <div class="text-sm text-gray-300">攻击力</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-blue-400">${player.stats.defense}</div>
                            <div class="text-sm text-gray-300">防御力</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-green-400">${player.stats.health}</div>
                            <div class="text-sm text-gray-300">生命值</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-purple-400">${player.stats.spiritPower}</div>
                            <div class="text-sm text-gray-300">灵力</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 显示战斗视图
     */
    showBattleView(enemy) {
        const content = this.elements.mainContent;
        const battle = this.gameEngine.battleSystem.getCurrentBattle();
        
        if (!battle) return;
        
        const player = battle.participants.player;
        const enemyData = battle.participants.enemy;
        
        content.innerHTML = `
            <div id="battleView" class="game-view">
                <h2 class="text-2xl font-bold mb-6 text-red-400">
                    <i class="fas fa-sword"></i> 战斗中
                </h2>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <!-- 玩家状态 -->
                    <div class="bg-gray-700 rounded-lg p-6">
                        <h3 class="text-lg font-semibold mb-4 text-green-400">${player.name}</h3>
                        <div class="space-y-3">
                            <div>
                                <div class="flex justify-between text-sm mb-1">
                                    <span>生命值</span>
                                    <span>${player.stats.health}/${player.stats.maxHealth}</span>
                                </div>
                                <div class="w-full bg-gray-600 rounded-full h-3">
                                    <div class="bg-green-500 h-3 rounded-full transition-all duration-300" style="width: ${(player.stats.health / player.stats.maxHealth) * 100}%"></div>
                                </div>
                            </div>
                            <div>
                                <div class="flex justify-between text-sm mb-1">
                                    <span>灵力</span>
                                    <span>${player.stats.spiritPower}/${player.stats.maxSpiritPower}</span>
                                </div>
                                <div class="w-full bg-gray-600 rounded-full h-3">
                                    <div class="bg-purple-500 h-3 rounded-full transition-all duration-300" style="width: ${(player.stats.spiritPower / player.stats.maxSpiritPower) * 100}%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 敌人状态 -->
                    <div class="bg-gray-700 rounded-lg p-6">
                        <h3 class="text-lg font-semibold mb-4 text-red-400">${enemyData.name}</h3>
                        <div class="space-y-3">
                            <div>
                                <div class="flex justify-between text-sm mb-1">
                                    <span>生命值</span>
                                    <span>${enemyData.stats.health}/${enemyData.stats.maxHealth}</span>
                                </div>
                                <div class="w-full bg-gray-600 rounded-full h-3">
                                    <div class="bg-red-500 h-3 rounded-full transition-all duration-300" style="width: ${(enemyData.stats.health / enemyData.stats.maxHealth) * 100}%"></div>
                                </div>
                            </div>
                            <div>
                                <div class="flex justify-between text-sm mb-1">
                                    <span>灵力</span>
                                    <span>${enemyData.stats.spiritPower}/${enemyData.stats.maxSpiritPower}</span>
                                </div>
                                <div class="w-full bg-gray-600 rounded-full h-3">
                                    <div class="bg-purple-500 h-3 rounded-full transition-all duration-300" style="width: ${(enemyData.stats.spiritPower / enemyData.stats.maxSpiritPower) * 100}%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 战斗行动 -->
                <div class="bg-gray-700 rounded-lg p-6 mb-6">
                    <h3 class="text-lg font-semibold mb-4">选择行动</h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <button onclick="game.ui.playerAction('attack')" class="bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg transition-colors">
                            <i class="fas fa-sword"></i>
                            <div class="text-sm mt-1">攻击</div>
                        </button>
                        <button onclick="game.ui.playerAction('defend')" class="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors">
                            <i class="fas fa-shield"></i>
                            <div class="text-sm mt-1">防御</div>
                        </button>
                        <button onclick="game.ui.playerAction('heal')" class="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors">
                            <i class="fas fa-heart"></i>
                            <div class="text-sm mt-1">治疗</div>
                        </button>
                        <button onclick="game.ui.attemptEscape()" class="bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-4 rounded-lg transition-colors">
                            <i class="fas fa-running"></i>
                            <div class="text-sm mt-1">逃跑</div>
                        </button>
                    </div>
                </div>
                
                <!-- 战斗日志 -->
                <div class="bg-gray-700 rounded-lg p-4">
                    <h3 class="text-lg font-semibold mb-3">战斗日志</h3>
                    <div id="battleLogContent" class="bg-gray-600 rounded p-3 h-32 overflow-y-auto text-sm space-y-1">
                        <div class="text-gray-300">战斗开始！</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 显示卡包视图
     */
    showCardPackView() {
        const content = this.elements.mainContent;
        const player = this.gameEngine.player;
        const cardSystem = this.gameEngine.cardSystem;
        
        content.innerHTML = `
            <div id="cardPackView" class="game-view">
                <h2 class="text-2xl font-bold mb-6 text-purple-400">
                    <i class="fas fa-box"></i> 卡包抽取
                </h2>
                
                <div class="bg-gray-700 rounded-lg p-6 mb-6">
                    <h3 class="text-lg font-semibold mb-4">选择卡包</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="bg-gray-600 rounded-lg p-4 border-2 border-gray-500 hover:border-purple-400 transition-colors cursor-pointer" onclick="game.ui.drawCardPack('basic')">
                            <div class="text-center mb-3">
                                <div class="text-3xl mb-2">📦</div>
                                <h4 class="font-semibold">基础卡包</h4>
                            </div>
                            <div class="text-sm text-gray-300 mb-3">包含普通到稀有卡牌</div>
                            <div class="flex justify-between items-center">
                                <span class="text-cyan-400 font-semibold">${cardSystem.getPackPrice('basic')} 灵石</span>
                                <span class="text-xs text-gray-400">70%普通 25%稀有</span>
                            </div>
                        </div>
                        
                        <div class="bg-gray-600 rounded-lg p-4 border-2 border-gray-500 hover:border-purple-400 transition-colors cursor-pointer" onclick="game.ui.drawCardPack('premium')">
                            <div class="text-center mb-3">
                                <div class="text-3xl mb-2">💎</div>
                                <h4 class="font-semibold">高级卡包</h4>
                            </div>
                            <div class="text-sm text-gray-300 mb-3">包含稀有到史诗卡牌</div>
                            <div class="flex justify-between items-center">
                                <span class="text-cyan-400 font-semibold">${cardSystem.getPackPrice('premium')} 灵石</span>
                                <span class="text-xs text-gray-400">40%稀有 20%史诗</span>
                            </div>
                        </div>
                        
                        <div class="bg-gray-600 rounded-lg p-4 border-2 border-gray-500 hover:border-purple-400 transition-colors cursor-pointer" onclick="game.ui.drawCardPack('event')">
                            <div class="text-center mb-3">
                                <div class="text-3xl mb-2">🌟</div>
                                <h4 class="font-semibold">活动卡包</h4>
                            </div>
                            <div class="text-sm text-gray-300 mb-3">高概率获得稀有卡牌</div>
                            <div class="flex justify-between items-center">
                                <span class="text-cyan-400 font-semibold">${cardSystem.getPackPrice('event')} 灵石</span>
                                <span class="text-xs text-gray-400">35%史诗 20%传说</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gray-700 rounded-lg p-6">
                    <h3 class="text-lg font-semibold mb-4">保底信息</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="bg-gray-600 rounded p-3">
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-300">基础卡包</span>
                                <span class="text-xs text-yellow-400">${cardSystem.getPityInfo('basic').current}/${cardSystem.getPityInfo('basic').max}</span>
                            </div>
                            <div class="w-full bg-gray-500 rounded-full h-2 mt-2">
                                <div class="bg-yellow-400 h-2 rounded-full" style="width: ${cardSystem.getPityInfo('basic').progress}%"></div>
                            </div>
                        </div>
                        <div class="bg-gray-600 rounded p-3">
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-300">高级卡包</span>
                                <span class="text-xs text-yellow-400">${cardSystem.getPityInfo('premium').current}/${cardSystem.getPityInfo('premium').max}</span>
                            </div>
                            <div class="w-full bg-gray-500 rounded-full h-2 mt-2">
                                <div class="bg-yellow-400 h-2 rounded-full" style="width: ${cardSystem.getPityInfo('premium').progress}%"></div>
                            </div>
                        </div>
                        <div class="bg-gray-600 rounded p-3">
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-300">活动卡包</span>
                                <span class="text-xs text-yellow-400">${cardSystem.getPityInfo('event').current}/${cardSystem.getPityInfo('event').max}</span>
                            </div>
                            <div class="w-full bg-gray-500 rounded-full h-2 mt-2">
                                <div class="bg-yellow-400 h-2 rounded-full" style="width: ${cardSystem.getPityInfo('event').progress}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 显示背包视图
     */
    showInventoryView() {
        const content = this.elements.mainContent;
        const player = this.gameEngine.player;
        
        content.innerHTML = `
            <div id="inventoryView" class="game-view">
                <h2 class="text-2xl font-bold mb-6 text-blue-400">
                    <i class="fas fa-backpack"></i> 背包管理
                </h2>
                
                <div class="bg-gray-700 rounded-lg p-6 mb-6">
                    <h3 class="text-lg font-semibold mb-4">已装备卡牌</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        ${this.generateEquippedCardsHTML()}
                    </div>
                </div>
                
                <div class="bg-gray-700 rounded-lg p-6">
                    <h3 class="text-lg font-semibold mb-4">背包卡牌 (${player.inventory.cards.length}/200)</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${this.generateInventoryCardsHTML()}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 生成已装备卡牌HTML
     */
    generateEquippedCardsHTML() {
        const equipped = this.gameEngine.player.inventory.equipped;
        const slots = {
            weapon: '武器',
            armor: '护甲', 
            accessory: '饰品',
            technique: '功法'
        };
        
        let html = '';
        for (const [slot, card] of Object.entries(equipped)) {
            html += `
                <div class="bg-gray-600 rounded-lg p-4">
                    <div class="text-sm text-gray-400 mb-2">${slots[slot]}</div>
                    ${card ? `
                        <div class="text-center">
                            <div class="text-2xl mb-2">${card.icon}</div>
                            <div class="font-semibold text-sm">${card.name}</div>
                            <div class="text-xs text-gray-400 mt-1">品质: ${card.quality}</div>
                            <button onclick="game.ui.unequipCard('${slot}')" class="mt-2 bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-2 rounded">
                                卸下
                            </button>
                        </div>
                    ` : `
                        <div class="text-center text-gray-500">
                            <div class="text-2xl mb-2">🔒</div>
                            <div class="text-sm">空位</div>
                        </div>
                    `}
                </div>
            `;
        }
        return html;
    }

    /**
     * 生成背包卡牌HTML
     */
    generateInventoryCardsHTML() {
        const cards = this.gameEngine.player.inventory.cards;
        
        if (cards.length === 0) {
            return '<div class="col-span-full text-center text-gray-500 py-8">背包是空的</div>';
        }
        
        return cards.map(card => `
            <div class="bg-gray-600 rounded-lg p-4 hover:bg-gray-500 transition-colors">
                <div class="flex items-start justify-between mb-2">
                    <div class="text-2xl">${card.icon}</div>
                    <div class="text-xs px-2 py-1 rounded ${this.getRarityColor(card.rarity)}">${this.getRarityName(card.rarity)}</div>
                </div>
                <div class="font-semibold text-sm mb-1">${card.name}</div>
                <div class="text-xs text-gray-400 mb-2">${card.description}</div>
                <div class="text-xs text-gray-300 mb-3">品质: ${card.quality}</div>
                <div class="flex space-x-2">
                    ${card.equipmentSlot ? `
                        <button onclick="game.ui.equipCard('${card.id}')" class="bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-2 rounded">
                            装备
                        </button>
                    ` : ''}
                    ${card.consumable ? `
                        <button onclick="game.ui.useConsumable('${card.id}')" class="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded">
                            使用
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    /**
     * 获取稀有度颜色
     */
    getRarityColor(rarity) {
        const colors = {
            common: 'bg-gray-500',
            rare: 'bg-blue-500',
            epic: 'bg-purple-500',
            legendary: 'bg-yellow-500',
            mythic: 'bg-red-500'
        };
        return colors[rarity] || 'bg-gray-500';
    }

    /**
     * 获取稀有度名称
     */
    getRarityName(rarity) {
        const names = {
            common: '普通',
            rare: '稀有',
            epic: '史诗',
            legendary: '传说',
            mythic: '神话'
        };
        return names[rarity] || '普通';
    }

    /**
     * 切换修炼状态
     */
    toggleCultivation() {
        const btn = document.getElementById('startCultivationBtn');
        if (!btn) return;
        
        if (this.gameEngine.gameState.currentView === 'cultivation') {
            this.gameEngine.gameState.currentView = 'idle';
            btn.innerHTML = '<i class="fas fa-play"></i> 开始修炼';
            btn.classList.remove('bg-red-600', 'hover:bg-red-700');
            btn.classList.add('bg-green-600', 'hover:bg-green-700');
        } else {
            this.gameEngine.gameState.currentView = 'cultivation';
            btn.innerHTML = '<i class="fas fa-pause"></i> 停止修炼';
            btn.classList.remove('bg-green-600', 'hover:bg-green-700');
            btn.classList.add('bg-red-600', 'hover:bg-red-700');
        }
    }

    /**
     * 尝试突破
     */
    attemptBreakthrough() {
        const player = this.gameEngine.player;
        if (player.cultivation >= 1000) {
            player.checkRealmBreakthrough();
            this.showView('cultivation');
        } else {
            this.showToast('修为不足，无法突破！', 'error');
        }
    }

    /**
     * 开始与敌人战斗
     */
    startBattleWithEnemy(enemyType) {
        const enemy = this.gameEngine.generateRandomEnemy(enemyType);
        this.gameEngine.startBattle(enemy);
    }

    /**
     * 玩家行动
     */
    playerAction(actionType, skillId = null) {
        const result = this.gameEngine.battleSystem.playerChooseAction(actionType, skillId);
        if (!result.success) {
            this.showToast(result.message, 'error');
        }
    }

    /**
     * 尝试逃跑
     */
    attemptEscape() {
        const result = this.gameEngine.battleSystem.attemptEscape();
        if (result.success) {
            this.showView('battle');
        } else {
            this.showToast(result.message, 'error');
        }
    }

    /**
     * 抽取卡包
     */
    drawCardPack(packType) {
        const result = this.gameEngine.drawCardPack(packType);
        if (result.success) {
            this.showCardDrawModal(result.cards);
            this.showView('cardpack');
            
            // 显示获得卡牌的属性提升
            this.showCardEffectsToast(result.cards);
            
            // 立即更新玩家信息显示
            this.updatePlayerInfo();
        } else {
            this.showToast(result.message, 'error');
        }
    }

    /**
     * 显示卡牌属性提升提示
     */
    showCardEffectsToast(cards) {
        const player = this.gameEngine.player;
        let totalEffects = {};
        
        // 计算总属性提升
        cards.forEach(card => {
            if (card.effects) {
                Object.entries(card.effects).forEach(([stat, value]) => {
                    if (!totalEffects[stat]) totalEffects[stat] = 0;
                    totalEffects[stat] += value;
                });
            }
        });
        
        // 生成属性提升消息
        const messages = [];
        Object.entries(totalEffects).forEach(([stat, value]) => {
            if (value > 0) {
                const statNames = {
                    attack: '攻击力',
                    defense: '防御力',
                    health: '生命值',
                    spiritPower: '灵力',
                    cultivation: '修为',
                    speed: '速度',
                    lifespan: '寿命'
                };
                messages.push(`${statNames[stat] || stat}+${value}`);
            }
        });
        
        if (messages.length > 0) {
            this.showToast(`获得卡牌提升：${messages.join(', ')}`, 'success');
        }
    }

    /**
     * 装备卡牌
     */
    equipCard(cardId) {
        const result = this.gameEngine.equipCard(cardId);
        this.showToast(result.message, result.success ? 'success' : 'error');
        this.showView('inventory');
    }

    /**
     * 卸下卡牌
     */
    unequipCard(slot) {
        const result = this.gameEngine.player.unequipCard(slot);
        this.showToast(result.message, result.success ? 'success' : 'error');
        this.showView('inventory');
    }

    /**
     * 使用消耗品
     */
    useConsumable(cardId) {
        const result = this.gameEngine.useConsumable(cardId);
        this.showToast(result.message, result.success ? 'success' : 'error');
        this.showView('inventory');
    }

    /**
     * 显示抽卡结果模态框
     */
    showCardDrawModal(cards) {
        const modalHTML = `
            <div class="modal active">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 class="modal-title">抽卡结果</h2>
                        <button class="modal-close" onclick="game.ui.closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            ${cards.map(card => `
                                <div class="card card-draw ${card.rarity}">
                                    <div class="text-center">
                                        <div class="text-4xl mb-2">${card.icon}</div>
                                        <div class="font-semibold">${card.name}</div>
                                        <div class="text-sm text-gray-300">${card.description}</div>
                                        <div class="text-xs mt-2 ${this.getRarityColor(card.rarity)} px-2 py-1 rounded">
                                            ${this.getRarityName(card.rarity)} • 品质 ${card.quality}
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="modal-footer mt-6">
                        <button onclick="game.ui.closeModal()" class="btn btn-primary">确定</button>
                    </div>
                </div>
            </div>
        `;
        
        this.elements.modalContainer.innerHTML = modalHTML;
    }

    /**
     * 显示设置模态框
     */
    showSettingsModal() {
        const player = this.gameEngine.player;
        
        const modalHTML = `
            <div class="modal active">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 class="modal-title">游戏设置</h2>
                        <button class="modal-close" onclick="game.ui.closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="space-y-4">
                            <div class="flex items-center justify-between">
                                <span>自动战斗</span>
                                <input type="checkbox" id="autoBattleSetting" ${player.settings.autoBattle ? 'checked' : ''}>
                            </div>
                            <div class="flex items-center justify-between">
                                <span>通知提醒</span>
                                <input type="checkbox" id="notificationsSetting" ${player.settings.notifications ? 'checked' : ''}>
                            </div>
                            <div class="flex items-center justify-between">
                                <span>音效</span>
                                <input type="checkbox" id="soundEffectsSetting" ${player.settings.soundEffects ? 'checked' : ''}>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer mt-6 flex space-x-3">
                        <button onclick="game.ui.saveSettings()" class="btn btn-primary">保存</button>
                        <button onclick="game.ui.closeModal()" class="btn btn-secondary">取消</button>
                    </div>
                </div>
            </div>
        `;
        
        this.elements.modalContainer.innerHTML = modalHTML;
    }

    /**
     * 保存设置
     */
    saveSettings() {
        const player = this.gameEngine.player;
        
        player.settings.autoBattle = document.getElementById('autoBattleSetting').checked;
        player.settings.notifications = document.getElementById('notificationsSetting').checked;
        player.settings.soundEffects = document.getElementById('soundEffectsSetting').checked;
        
        player.save();
        this.showToast('设置已保存', 'success');
        this.closeModal();
    }

    /**
     * 关闭模态框
     */
    closeModal() {
        this.elements.modalContainer.innerHTML = '';
    }

    /**
     * 显示提示消息
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${this.getToastIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        this.elements.toastContainer.appendChild(toast);
        
        // 自动移除
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    /**
     * 获取提示图标
     */
    getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    /**
     * 添加日志
     */
    addLog(message, type = 'info') {
        if (!this.elements.messageLog) return;
        
        const logEntry = document.createElement('div');
        logEntry.className = `text-${type === 'success' ? 'green' : type === 'error' ? 'red' : 'gray'}-400`;
        logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        this.elements.messageLog.appendChild(logEntry);
        this.elements.messageLog.scrollTop = this.elements.messageLog.scrollHeight;
        
        // 限制日志条数
        while (this.elements.messageLog.children.length > 50) {
            this.elements.messageLog.removeChild(this.elements.messageLog.firstChild);
        }
    }

    /**
     * 添加战斗日志
     */
    addBattleLog(message) {
        const battleLogContent = document.getElementById('battleLogContent');
        if (!battleLogContent) return;
        
        const logEntry = document.createElement('div');
        logEntry.className = 'text-gray-300';
        logEntry.textContent = `[回合${this.gameEngine.battleSystem.getCurrentBattle().currentTurn}] ${message}`;
        battleLogContent.appendChild(logEntry);
        battleLogContent.scrollTop = battleLogContent.scrollHeight;
        
        // 限制日志条数
        while (battleLogContent.children.length > 20) {
            battleLogContent.removeChild(battleLogContent.firstChild);
        }
    }

    /**
     * 处理战斗结束
     */
    handleBattleEnd(data) {
        const { result, rewards } = data;
        
        if (result === 'victory') {
            this.showToast(`战斗胜利！获得 ${rewards.exp} 经验和 ${rewards.spiritStones} 灵石`, 'success');
        } else if (result === 'defeat') {
            this.showToast('战斗失败...', 'error');
        } else {
            this.showToast('战斗平局', 'warning');
        }
        
        // 延迟后返回战斗准备界面
        setTimeout(() => {
            this.showView('battle');
        }, 2000);
    }

    /**
     * 处理键盘事件
     */
    handleKeyboard(e) {
        // 防止在输入框中触发
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch (e.key) {
            case 'Escape':
                this.closeModal();
                break;
        }
    }

    /**
     * 更新当前视图
     */
    updateCurrentView() {
        // 根据当前视图更新内容
        if (this.currentView === 'battle' && this.gameEngine.battleSystem.getCurrentBattle()) {
            this.updateBattleView();
        }
    }

    /**
     * 更新战斗视图
     */
    updateBattleView() {
        const battle = this.gameEngine.battleSystem.getCurrentBattle();
        if (!battle) return;
        
        const player = battle.participants.player;
        const enemy = battle.participants.enemy;
        
        // 更新生命值显示
        const playerHealthBar = document.querySelector('#battleView .bg-green-500');
        const enemyHealthBar = document.querySelector('#battleView .bg-red-500');
        
        if (playerHealthBar) {
            playerHealthBar.style.width = `${(player.stats.health / player.stats.maxHealth) * 100}%`;
        }
        
        if (enemyHealthBar) {
            enemyHealthBar.style.width = `${(enemy.stats.health / enemy.stats.maxHealth) * 100}%`;
        }
    }
}
