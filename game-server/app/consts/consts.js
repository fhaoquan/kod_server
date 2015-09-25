"use strict"

/**
 * Created by modun on 14-8-7.
 */

module.exports = {
	GlobalChatChannel:"globalChatChannel",
	AllianceChannelPrefix:"allianceChannel",
	BigMapChannelPrefix:'bigMapChannelPrefix',
	PushServiceName:"pushService",
	AlliancePowerRank:"alliancePowerRank",
	AllianceKillRank:"allianceKillRank",
	ServerStatus:{
		Starting:"starting",
		Stoping:"stoping",
		On:"on",
		ReadyShutdown:"readyShutdown"
	},
	ServerType:{
		Bronze:"bronze",
		Silver:"silver",
		Gold:"gold",
		Platinum:"platinum",
		Diamond:"diamond"
	},
	ChannelType:{
		Global:"global",
		Alliance:"alliance",
		AllianceFight:"allianceFight"
	},
	NoticeType:{
		Info:'info',
		Warning:'warning'
	},
	None:"__NONE__",
	ServerState:{
		Start:"start",
		Stop:"stop"
	},
	PlayerStatus:{
		Normal:"normal",
		Rout:"rout"
	},
	DragonStatus:{
		Free:"free",
		March:"march",
		Defence:"defence"
	},
	DragonEquipmentCategory:["crown", "armguardLeft", "armguardRight", "chest", "sting", "orb"],
	BasicResource:["wood", "stone", "iron", "food"],
	MaterialType:{
		BuildingMaterials:"buildingMaterials",
		TechnologyMaterials:"technologyMaterials"
	},
	ResourcesCanDeal:{
		resources:["wood", "stone", "iron", "food"],
		buildingMaterials:["blueprints", "tools", "tiles", "pulley"],
		technologyMaterials:["trainingFigure", "bowTarget", "saddle", "ironPart"]
	},
	TimeEventType:{
		Player:"player",
		Alliance:"alliance",
		AllianceFight:"allianceFight"
	},
	DataChangedType:{
		Add:"add",
		Edit:"edit",
		Remove:"remove"
	},
	FreeSpeedUpAbleEventTypes:{
		BuildingEvents:"buildingEvents",
		HouseEvents:"houseEvents",
		ProductionTechEvents:"productionTechEvents",
		MilitaryTechEvents:"militaryTechEvents",
		SoldierStarEvents:"soldierStarEvents"
	},
	SpeedUpEventTypes:[
		"materialEvents",
		"soldierEvents",
		"soldierStarEvents",
		"treatSoldierEvents",
		"dragonEquipmentEvents",
		"dragonDeathEvents",
		"buildingEvents",
		"houseEvents",
		"productionTechEvents",
		"militaryTechEvents",
		"dailyQuestEvents"
	],
	BuildingSpeedupEventTypes:[
		"buildingEvents",
		"houseEvents"
	],
	WarSpeedupEventTypes:{
		AttackMarchEvents:"attackMarchEvents",
		AttackMarchReturnEvents:"attackMarchReturnEvents",
		StrikeMarchEvents:"strikeMarchEvents",
		StrikeMarchReturnEvents:"strikeMarchReturnEvents"
	},
	FightResult:{
		AttackWin:"attackWin",
		DefenceWin:"defenceWin"
	},
	MarchType:{
		Village:"village",
		City:"city",
		Shrine:"shrine",
		HelpDefence:"helpDefence",
		Monster:"monster"
	},
	GachaType:{
		Normal:"normal",
		Advanced:"advanced"
	},
	DragonFightBuffTerrain:{
		redDragon:"desert",
		blueDragon:"iceField",
		greenDragon:"grassLand"
	},
	ResourceTechNameMap:{
		wood:"forestation",
		stone:"stoneCarving",
		iron:"ironSmelting",
		food:"cropResearch"
	},
	ResourceBuildingMap:{
		wood:"lumbermill",
		stone:"stoneMason",
		iron:"foundry",
		food:"mill"
	},
	ResourceHouseMap:{
		wood:"woodcutter",
		stone:"quarrier",
		iron:"miner",
		food:"farmer",
		coin:"dwelling"
	},
	BuildingHouseMap:{
		lumbermill:"woodcutter",
		stoneMason:"quarrier",
		foundry:"miner",
		mill:"farmer",
		dwelling:"townHall"
	},
	HouseBuildingMap:{
		woodcutter:"lumbermill",
		quarrier:"stoneMason",
		miner:"foundry",
		farmer:"mill",
		dwelling:"townHall"
	},
	MilitaryItemEventTypes:[
		"masterOfDefender",
		"fogOfTrick",
		"dragonExpBonus",
		"troopSizeBonus",
		"dragonHpBonus",
		"marchSpeedBonus",
		"unitHpBonus",
		"infantryAtkBonus",
		"cavalryAtkBonus",
		"siegeAtkBonus"
	],
	DailyTaskTypes:{
		EmpireRise:"empireRise",
		Conqueror:"conqueror",
		BrotherClub:"brotherClub",
		GrowUp:"growUp"
	},
	DailyTaskIndexMap:{
		EmpireRise:{
			UpgradeBuilding:1,
			RecruitSoldiers:2,
			PassSelinasTest:3,
			MakeBuildingMaterials:4
		},
		Conqueror:{
			JoinAllianceShrineEvent:1,
			AttackEnemyPlayersCity:2,
			OccupyVillage:3,
			StartPve:4
		},
		BrotherClub:{
			DonateToAlliance:1,
			BuyItemInAllianceShop:2,
			HelpAllianceMemberSpeedUp:3,
			HelpAllianceMemberDefence:4
		},
		GrowUp:{
			SpeedupBuildingBuild:1,
			SpeedupSoldiersRecruit:2,
			MakeDragonEquipment:3,
			BuyItemInShop:4
		}
	},
	GrowUpTaskTypes:{
		CityBuild:"cityBuild",
		DragonLevel:"dragonLevel",
		DragonStar:"dragonStar",
		DragonSkill:"dragonSkill",
		ProductionTech:"productionTech",
		MilitaryTech:"militaryTech",
		SoldierStar:"soldierStar",
		SoldierCount:"soldierCount",
		PveCount:"pveCount",
		AttackWin:"attackWin",
		StrikeWin:"strikeWin",
		PlayerKill:"playerKill",
		PlayerPower:"playerPower"
	},
	RankTypes:{
		Power:"power",
		Kill:"kill"
	},
	GemAddFrom:{
		Sys:"sys",
		Iap:"iap"
	},
	TerrainDragonMap:{
		grassLand:"greenDragon",
		desert:"redDragon",
		iceField:"blueDragon"
	},
	MaterialDepotTypes:[
		'soldierMaterials',
		'buildingMaterials',
		'technologyMaterials',
		'dragonMaterials'
	],
	ApnTypes:{
		OnAllianceFightPrepare:'onAllianceFightPrepare',
		OnAllianceFightStart:'onAllianceFightStart',
		OnAllianceShrineEventStart:'onAllianceShrineEventStart',
		OnCityBeAttacked:'onCityBeAttacked'
	},


	AllianceLanguage:{
		All:"all",
		Cn:"cn",
		Tw:"tw",
		En:"en",
		Fr:"fr",
		De:"de",
		Ko:"ko",
		Ja:"ja",
		Ru:"ru",
		Es:"es",
		Pt:"pt",
		It:"it"
	},
	AllianceTerrain:{
		GrassLand:"grassLand",
		Desert:"desert",
		IceField:"iceField"
	},
	AllianceJoinType:{
		All:"all",
		Audit:"audit"
	},
	AllianceTitle:{
		Archon:"archon",
		General:"general",
		Quartermaster:"quartermaster",
		Supervisor:"supervisor",
		Elite:"elite",
		Member:"member"
	},
	AllianceJoinStatus:{
		Pending:"pending",
		Reject:"reject"
	},
	AllianceHelpEventType:{
		BuildingEvents:"buildingEvents",
		HouseEvents:"houseEvents",
		ProductionTechEvents:"productionTechEvents",
		MilitaryTechEvents:"militaryTechEvents",
		SoldierStarEvents:"soldierStarEvents"
	},
	AllianceEventCategory:{
		Normal:"normal",
		Important:"important",
		War:"war"
	},
	AllianceEventType:{
		PromotionUp:"promotionUp",//xx xx将其联盟职位提高为xx
		PromotionDown:"promotionDown",//xx xx将联盟职位降低为xx
		Join:"join",//xx 一个新的玩家加入
		Kick:"kick",//xx 被xx踢出联盟
		Quit:"quit",//xx 退出了联盟
		Notice:"notice",//xx 发布了一个新的联盟公告
		Desc:"desc",//xx 编辑了联盟描述
		HandOver:"handover",//xx 将盟主职位转交给了xx
		Name:"name",//xx 将联盟名称修改为xx
		Tag:"tag",//xx 将联盟标签修改为xx
		Flag:"flag",//xx 修改了联盟旗帜
		Terrain:"terrain",//xx 将联盟地形修改为xx
		Language:"language",//xx 将联盟语言修改为xx
		Shrine:"shrine",//xx 开启了联盟圣地xx关卡
		Fight:'fight',//xx 开启了联盟战
		BuildingUpgrade:'buildingUpgrade',//xx 升级了xx建筑
		VillageUpgrade:'villageUpgrade',//xx 升级了xx村落
		MoveAlliance:'moveAlliance'//xx 迁移了联盟
	},
	AllianceBannerType:{
		AttackVillage:'attackVillage',//XX正在前往采集Lv XX XX(村落)
		AttackMonster:'attackMonster',//XX正在前往攻打Lv XX XX(野怪)
		StrikePlayer:'strikePlayer',//XX向XX发起了侦察
		AttackPlayer:'attackPlayer',//XX向XX发起了进攻
		HelpDefence:'helpDefence'//XX正在前往协防XX
	},
	AllianceBuildingNames:{
		Palace:"palace",//联盟宫殿
		MoonGate:"moonGate",//月门
		OrderHall:"orderHall",//秩序大厅
		Shrine:"shrine",//圣地
		Shop:"shop"//联盟商店
	},
	DragonStrikeReportLevel:{
		E:0,//诡计之雾
		D:1,
		C:2,
		B:3,
		A:4,
		S:5
	},
	AllianceStatus:{
		Peace:"peace",
		Prepare:"prepare",
		Fight:"fight",
		Protect:"protect"
	},
	AllianceStatusEvent:"allianceStatusEvent",
	MonsterRefreshEvent:"monsterRefreshEvent",
	PlayerReportType:{
		StrikeCity:"strikeCity",
		CityBeStriked:"cityBeStriked",
		AttackCity:"attackCity",
		AttackVillage:"attackVillage",
		AttackMonster:'attackMonster',
		AttackShrine:'attackShrine',
		StrikeVillage:"strikeVillage",
		VillageBeStriked:"villageBeStriked",
		CollectResource:"collectResource"
	},
	AllianceMergeStyle:{
		Left:"left",
		Right:"right",
		Top:"top",
		Bottom:"bottom"
	},
	AllianceViewDataKeys:[
		"_id",
		"basicInfo",
		"members",
		"buildings",
		"villages",
		"monsters",
		"mapObjects",
		"villageEvents",
		"strikeMarchEvents",
		"strikeMarchReturnEvents",
		"attackMarchEvents",
		"attackMarchReturnEvents"
	],
	AllianceItemLogType:{
		AddItem:"addItem",
		BuyItem:"buyItem"
	},
	AllianceMarchEventTypes:[
		'strikeMarchEvents',
		'strikeMarchReturnEvents',
		'attackMarchEvents',
		'attackMarchReturnEvents'
	]
}