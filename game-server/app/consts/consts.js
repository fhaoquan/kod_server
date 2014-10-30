"use strict"

/**
 * Created by modun on 14-8-7.
 */

module.exports = {
	LogicChannelName:"logicChannel",
	GloablChatChannelName:"globalChatChannel",
	AllianceChannelPrefix:"allianceChannel_",
	PushServiceName:"pushService",
	CallbackService:"callbackService",
	BuildingType:{
		Building:"building",
		House:"house",
		Tower:"tower",
		Wall:"wall"
	},
	NormalSoldierType:{
		swordsman:"swordsman",
		sentinel:"sentinel",
		archer:"archer",
		crossbowman:"crossbowman",
		lancer:"lancer",
		horseArcher:"horseArcher",
		catapult:"catapult",
		ballista:"ballista"
	},
	DragonStatus:{
		Free:"free",
		March:"march",
		Fight:"fight",
		Defenc:"defence"
	},
	DragonEquipmentCategory:["crown", "armguardLeft", "armguardRight", "chest", "sting", "orb"],
	BasicResource:["wood", "stone", "iron", "food"],
	MaterialType:{
		Building:"building",
		Technology:"technology"
	},
	TimeEventType:{
		Player:"player",
		Alliance:"alliance"
	},
	DataChangedType:{
		Add:"add",
		Edit:"edit",
		Remove:"remove"
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
		Pt:"pt"
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
		Building:"building",
		House:"house",
		Tower:"tower",
		Wall:"wall"
	},
	AllianceEventCategory:{
		Normal:"normal",
		Important:"important",
		War:"war"
	},
	AllianceEventType:{
		Donate:"donate",//捐赠
		Promotion:"promotion",//升级,降级
		Join:"join",//新成员加入
		Kick:"kick",//踢出玩家
		Quit:"quit",//玩家退出
		Request:"request",//玩家申请
		Notice:"notice",//联盟公告
		Desc:"desc",//联盟描述
		Diplomacy:"diplomacy",//外交关系
		HandOver:"handover",//转让盟主
		Tools:"tools",//补充道具
		Upgrade:"upgrade",//联盟建筑升级
		Name:"name",//联盟名字修改
		Tag:"tag",//联盟Tag修改
		Flag:"flag",//联盟旗帜修改
		Terrain:"terrain",//联盟地形修改
		Language:"language",//联盟语言修改
		Gve:"gve"//联盟圣地事件
	},
	AllianceBuildingNames:{
		Palace:"palace",//联盟宫殿
		Gate:"gate",//月门
		Hall:"hall",//秩序大厅
		Shrine:"shrine",//圣地
		Shop:"shop"//联盟商店
	},
	AllianceSpyReportLevel:{
		E:1,
		D:2,
		C:3,
		B:4,
		A:5,
		S:6
	}
}