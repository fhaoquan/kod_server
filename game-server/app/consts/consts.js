"use strict"

/**
 * Created by modun on 14-8-7.
 */

module.exports = {
	GlobalChatChannel:"globalChatChannel",
	AllianceChannelPrefix:"allianceChannel",
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
		"dragonHatchEvents",
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
		Donate:"donate",//捐赠
		PromotionUp:"promotionUp",//升级
		PromotionDown:"promotionDown",//降级
		Join:"join",//新成员加入
		Kick:"kick",//踢出玩家
		Quit:"quit",//玩家退出
		Notice:"notice",//联盟公告
		Desc:"desc",//联盟描述
		HandOver:"handover",//转让盟主
		Tools:"tools",//补充道具
		Upgrade:"upgrade",//联盟建筑升级
		Name:"name",//联盟名字修改
		Tag:"tag",//联盟Tag修改
		Flag:"flag",//联盟旗帜修改
		Terrain:"terrain",//联盟地形修改
		Language:"language",//联盟语言修改
		Gve:"gve",//联盟圣地事件
		Fight:'fight',//开启联盟战
		BuildingUpgrade:'buildingUpgrade',//建筑升级
		VillageUpgrade:'villageUpgrade'//村落升级
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
	}
}