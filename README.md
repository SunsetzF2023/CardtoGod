# 卡包修仙 (CardToGod)

一款基于Web的文字/放置类修仙游戏，玩家通过抽取卡包获得功法、灵药、装备，提升境界，体验修仙之路。

## 游戏特色

- 🎴 卡包抽取系统：消耗灵石抽取不同品质的卡牌
- 📈 属性成长系统：境界、寿命、攻击、防御多维成长
- ⚔️ 回合制战斗：挑战妖兽，获取奖励
- 🧘‍♂️ 修仙境界：从炼气到飞升的完整境界体系
- 💎 放置收益：离线也能获得灵石收益

## 技术栈

- **前端**: HTML5 + CSS3 + JavaScript (ES6+)
- **样式**: Tailwind CSS
- **存储**: LocalStorage
- **部署**: GitHub Pages

## 项目结构

```
CardToGod/
├── index.html              # 主页面
├── css/                    # 样式文件
│   ├── main.css           # 主样式
│   └── components/        # 组件样式
├── js/                     # JavaScript文件
│   ├── main.js            # 主入口
│   ├── game/              # 游戏核心逻辑
│   │   ├── GameEngine.js  # 游戏引擎
│   │   ├── Player.js      # 玩家类
│   │   ├── CardSystem.js  # 卡牌系统
│   │   └── Battle.js      # 战斗系统
│   ├── data/              # 数据层
│   │   ├── schemas.js     # 数据模型
│   │   ├── cards.js       # 卡牌数据
│   │   └── constants.js   # 常量定义
│   ├── ui/                # UI交互
│   │   ├── UIManager.js   # UI管理器
│   │   └── components/    # UI组件
│   └── utils/             # 工具函数
├── assets/                # 静态资源
│   ├── images/           # 图片资源
│   └── icons/            # 图标资源
└── docs/                 # 文档
    ├── game-design.md    # 游戏设计文档
    └── api.md           # API文档
```

## 快速开始

1. 克隆仓库
```bash
git clone https://github.com/SunsetzF2023/CardtoGod.git
```

2. 打开 `index.html` 即可开始游戏

## 游戏玩法

1. **初始境界**: 炼气期，基础属性100
2. **获取灵石**: 战斗胜利、放置收益、完成任务
3. **抽取卡包**: 消耗灵石抽取功法、灵药、装备
4. **提升实力**: 装备卡牌、使用灵药、学习功法
5. **挑战进阶**: 提升境界，挑战更强妖兽

## 开发计划

- [x] 项目架构设计
- [ ] 基础UI框架
- [ ] 核心游戏逻辑
- [ ] 卡牌系统
- [ ] 战斗系统
- [ ] 数据持久化
- [ ] 移动端适配

## 贡献

欢迎提交Issue和Pull Request！

## 许可证

MIT License
