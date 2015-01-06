"use strict"

/**
 * Created by modun on 14-7-22.
 */

var Promise = require("bluebird")
var _ = require("underscore")

module.exports = function(app){
	return new Handler(app)
}

var Handler = function(app){
	this.app = app
	this.playerApiService = app.get("playerApiService")
	this.playerApiService2 = app.get("playerApiService2")
	this.playerApiService3 = app.get("playerApiService3")
}
var pro = Handler.prototype

/**
 * 升级大建筑
 * @param msg
 * @param session
 * @param next
 */
pro.upgradeBuilding = function(msg, session, next){
	var location = msg.location
	var finishNow = msg.finishNow

	this.playerApiService.upgradeBuildingAsync(session.uid, location, finishNow).then(function(){
		next(null, {code:200})
	}).catch(function(e){
		next(e, {code:500, message:e.message})
	})
}

/**
 * 创建小建筑
 * @param msg
 * @param session
 * @param next
 */
pro.createHouse = function(msg, session, next){
	var buildingLocation = msg.buildingLocation
	var houseType = msg.houseType
	var houseLocation = msg.houseLocation
	var finishNow = msg.finishNow

	this.playerApiService.createHouseAsync(session.uid, buildingLocation, houseType, houseLocation, finishNow).then(function(){
		next(null, {code:200})
	}).catch(function(e){
		next(e, {code:500, message:e.message})
	})
}

/**
 * 升级小建筑
 * @param msg
 * @param session
 * @param next
 */
pro.upgradeHouse = function(msg, session, next){
	var buildingLocation = msg.buildingLocation
	var houseLocation = msg.houseLocation
	var finishNow = msg.finishNow

	this.playerApiService.upgradeHouseAsync(session.uid, buildingLocation, houseLocation, finishNow).then(function(){
		next(null, {code:200})
	}).catch(function(e){
		next(e, {code:500, message:e.message})
	})
}

/**
 * 拆除小建筑
 * @param msg
 * @param session
 * @param next
 */
pro.destroyHouse = function(msg, session, next){
	var buildingLocation = msg.buildingLocation
	var houseLocation = msg.houseLocation
	this.playerApiService.destroyHouseAsync(session.uid, buildingLocation, houseLocation).then(function(){
		next(null, {code:200})
	}).catch(function(e){
		next(e, {code:500, message:e.message})
	})
}

/**
 * 升级箭塔
 * @param msg
 * @param session
 * @param next
 */
pro.upgradeTower = function(msg, session, next){
	var location = msg.location
	var finishNow = msg.finishNow

	this.playerApiService.upgradeTowerAsync(session.uid, location, finishNow).then(function(){
		next(null, {code:200})
	}).catch(function(e){
		next(e, {code:500, message:e.message})
	})
}

/**
 * 升级城墙
 * @param msg
 * @param session
 * @param next
 */
pro.upgradeWall = function(msg, session, next){
	var finishNow = msg.finishNow

	this.playerApiService.upgradeWallAsync(session.uid, finishNow).then(function(){
		next(null, {code:200})
	}).catch(function(e){
		next(e, {code:500, message:e.message})
	})
}

/**
 * 建筑升级加速
 * @param msg
 * @param session
 * @param next
 */
pro.freeSpeedUp = function(msg, session, next){
	var eventType = msg.eventType
	var eventId = msg.eventId

	this.playerApiService.freeSpeedUpAsync(session.uid, eventType, eventId).then(function(){
		next(null, {code:200})
	}).catch(function(e){
		next(e, {code:500, message:e.message})
	})
}

/**
 * 制作材料
 * @param msg
 * @param session
 * @param next
 */
pro.makeMaterial = function(msg, session, next){
	var category = msg.category
	var finishNow = msg.finishNow
	this.playerApiService.makeMaterialAsync(session.uid, category, finishNow).then(function(){
		next(null, {code:200})
	}).catch(function(e){
		next(e, {code:500, message:e.message})
	})
}

/**
 * 领取制作完成
 * @param msg
 * @param session
 * @param next
 */
pro.getMaterials = function(msg, session, next){
	var category = msg.category
	this.playerApiService.getMaterialsAsync(session.uid, category).then(function(){
		next(null, {code:200})
	}).catch(function(e){
		next(e, {code:500, message:e.message})
	})
}

/**
 * 招募普通士兵
 * @param msg
 * @param session
 * @param next
 */
pro.recruitNormalSoldier = function(msg, session, next){
	var soldierName = msg.soldierName
	var count = msg.count
	var finishNow = msg.finishNow

	this.playerApiService.recruitNormalSoldierAsync(session.uid, soldierName, count, finishNow).then(function(){
		next(null, {code:200})
	}).catch(function(e){
		next(e, {code:500, message:e.message})
	})
}

/**
 * 招募特殊士兵
 * @param msg
 * @param session
 * @param next
 */
pro.recruitSpecialSoldier = function(msg, session, next){
	var soldierName = msg.soldierName
	var count = msg.count
	var finishNow = msg.finishNow

	this.playerApiService2.recruitSpecialSoldierAsync(session.uid, soldierName, count, finishNow).then(function(){
		next(null, {code:200})
	}).catch(function(e){
		next(e, {code:500, message:e.message})
	})
}

/**
 * 制作龙装备
 * @param msg
 * @param session
 * @param next
 */
pro.makeDragonEquipment = function(msg, session, next){
	var equipmentName = msg.equipmentName
	var finishNow = msg.finishNow
	this.playerApiService2.makeDragonEquipmentAsync(session.uid, equipmentName, finishNow).then(function(){
		next(null, {code:200})
	}).catch(function(e){
		next(e, {code:500, message:e.message})
	})
}

/**
 * 治疗士兵
 * @param msg
 * @param session
 * @param next
 */
pro.treatSoldier = function(msg, session, next){
	var soldiers = msg.soldiers
	var finishNow = msg.finishNow
	this.playerApiService2.treatSoldierAsync(session.uid, soldiers, finishNow).then(function(){
		next(null, {code:200})
	}).catch(function(e){
		next(e, {code:500, message:e.message})
	})
}

/**
 * 孵化龙蛋
 * @param msg
 * @param session
 * @param next
 */
pro.hatchDragon = function(msg, session, next){
	var dragonType = msg.dragonType
	this.playerApiService2.hatchDragonAsync(session.uid, dragonType).then(function(){
		next(null, {code:200})
	}).catch(function(e){
		next(e, {code:500, message:e.message})
	})
}

/**
 * 设置龙的装备
 * @param msg
 * @param session
 * @param next
 */
pro.setDragonEquipment = function(msg, session, next){
	var dragonType = msg.dragonType
	var equipmentCategory = msg.equipmentCategory
	var equipmentName = msg.equipmentName
	this.playerApiService2.setDragonEquipmentAsync(session.uid, dragonType, equipmentCategory, equipmentName).then(function(){
		next(null, {code:200})
	}).catch(function(e){
		next(e, {code:500, message:e.message})
	})
}

/**
 * 强化龙的装备
 * @param msg
 * @param session
 * @param next
 */
pro.enhanceDragonEquipment = function(msg, session, next){
	var dragonType = msg.dragonType
	var equipmentCategory = msg.equipmentCategory
	var equipments = msg.equipments
	this.playerApiService2.enhanceDragonEquipmentAsync(session.uid, dragonType, equipmentCategory, equipments).then(function(){
		next(null, {code:200})
	}).catch(function(e){
		next(e, {code:500, message:e.message})
	})
}

/**
 * 重置龙的装备的随机Buff
 * @param msg
 * @param session
 * @param next
 */
pro.resetDragonEquipment = function(msg, session, next){
	var dragonType = msg.dragonType
	var equipmentCategory = msg.equipmentCategory
	this.playerApiService2.resetDragonEquipmentAsync(session.uid, dragonType, equipmentCategory).then(function(){
		next(null, {code:200})
	}).catch(function(e){
		next(e, {code:500, message:e.message})
	})
}

/**
 * 升级龙的技能
 * @param msg
 * @param session
 * @param next
 */
pro.upgradeDragonSkill = function(msg, session, next){
	var dragonType = msg.dragonType
	var skillKey = msg.skillKey
	this.playerApiService2.upgradeDragonSkillAsync(session.uid, dragonType, skillKey).then(function(){
		next(null, {code:200})
	}).catch(function(e){
		next(e, {code:500, message:e.message})
	})
}

/**
 * 升级龙的星级
 * @param msg
 * @param session
 * @param next
 */
pro.upgradeDragonStar = function(msg, session, next){
	var dragonType = msg.dragonType
	this.playerApiService2.upgradeDragonStarAsync(session.uid, dragonType).then(function(){
		next(null, {code:200})
	}).catch(function(e){
		next(e, {code:500, message:e.message})
	})
}

/**
 * 获取每日任务列表
 * @param msg
 * @param session
 * @param next
 */
pro.getDailyQuests = function(msg, session, next){
	this.playerApiService2.getDailyQuestsAsync(session.uid).then(function(){
		next(null, {code:200})
	}).catch(function(e){
		next(e, {code:500, message:e.message})
	})
}

/**
 * 为每日任务中某个任务增加星级
 * @param msg
 * @param session
 * @param next
 */
pro.addDailyQuestStar = function(msg, session, next){
	var questId = msg.questId
	this.playerApiService2.addDailyQuestStarAsync(session.uid, questId).then(function(){
		next(null, {code:200})
	}).catch(function(e){
		next(e, {code:500, message:e.message})
	})
}

/**
 * 设置玩家语言
 * @param msg
 * @param session
 * @param next
 */
pro.setPlayerLanguage = function(msg, session, next){
	var language = msg.language
	this.playerApiService2.setPlayerLanguageAsync(session.uid, language).then(function(){
		next(null, {code:200})
	}).catch(function(e){
		next(e, {code:500, message:e.message})
	})
}

/**
 * 获取玩家个人信息
 * @param msg
 * @param session
 * @param next
 */
pro.getPlayerInfo = function(msg, session, next){
	var memberId = msg.memberId
	this.playerApiService2.getPlayerInfoAsync(session.uid, memberId).then(function(){
		next(null, {code:200})
	}).catch(function(e){
		next(e, {code:500, message:e.message})
	})
}

/**
 * 发送个人邮件
 * @param msg
 * @param session
 * @param next
 */
pro.sendMail = function(msg, session, next){
	var memberName = msg.memberName
	var title = msg.title
	var content = msg.content
	this.playerApiService2.sendMailAsync(session.uid, memberName, title, content).then(function(){
		next(null, {code:200})
	}).catch(function(e){
		next(e, {code:500, message:e.message})
	})
}

/**
 * 阅读邮件
 * @param msg
 * @param session
 * @param next
 */
pro.readMails = function(msg, session, next){
	var mailIds = msg.mailIds
	this.playerApiService2.readMailsAsync(session.uid, mailIds).then(function(){
		next(null, {code:200})
	}).catch(function(e){
		next(e, {code:500, message:e.message})
	})
}

/**
 * 收藏邮件
 * @param msg
 * @param session
 * @param next
 */
pro.saveMail = function(msg, session, next){
	var mailId = msg.mailId
	this.playerApiService2.saveMailAsync(session.uid, mailId).then(function(){
		next(null, {code:200})
	}).catch(function(e){
		next(e, {code:500, message:e.message})
	})
}

/**
 * 取消收藏邮件
 * @param msg
 * @param session
 * @param next
 */
pro.unSaveMail = function(msg, session, next){
	var mailId = msg.mailId
	this.playerApiService3.unSaveMailAsync(session.uid, mailId).then(function(){
		next(null, {code:200})
	}).catch(function(e){
		next(e, {code:500, message:e.message})
	})
}

/**
 * 获取玩家邮件
 * @param msg
 * @param session
 * @param next
 */
pro.getMails = function(msg, session, next){
	var fromIndex = msg.fromIndex
	this.playerApiService3.getMailsAsync(session.uid, fromIndex).then(function(){
		next(null, {code:200})
	}).catch(function(e){
		next(e, {code:500, message:e.message})
	})
}

/**
 * 获取玩家已发邮件
 * @param msg
 * @param session
 * @param next
 */
pro.getSendMails = function(msg, session, next){
	var fromIndex = msg.fromIndex
	this.playerApiService3.getSendMailsAsync(session.uid, fromIndex).then(function(){
		next(null, {code:200})
	}).catch(function(e){
		next(e, {code:500, message:e.message})
	})
}

/**
 * 获取玩家已存邮件
 * @param msg
 * @param session
 * @param next
 */
pro.getSavedMails = function(msg, session, next){
	var fromIndex = msg.fromIndex
	this.playerApiService3.getSavedMailsAsync(session.uid, fromIndex).then(function(){
		next(null, {code:200})
	}).catch(function(e){
		next(e, {code:500, message:e.message})
	})
}

/**
 * 删除邮件
 * @param msg
 * @param session
 * @param next
 */
pro.deleteMails = function(msg, session, next){
	var mailIds = msg.mailIds
	this.playerApiService3.deleteMailsAsync(session.uid, mailIds).then(function(){
		next(null, {code:200})
	}).catch(function(e){
		next(e, {code:500, message:e.message})
	})
}

/**
 * 阅读战报
 * @param msg
 * @param session
 * @param next
 */
pro.readReports = function(msg, session, next){
	var reportIds = msg.reportIds
	this.playerApiService3.readReportsAsync(session.uid, reportIds).then(function(){
		next(null, {code:200})
	}).catch(function(e){
		next(e, {code:500, message:e.message})
	})
}

/**
 * 收藏战报
 * @param msg
 * @param session
 * @param next
 */
pro.saveReport = function(msg, session, next){
	var reportId = msg.reportId
	this.playerApiService3.saveReportAsync(session.uid, reportId).then(function(){
		next(null, {code:200})
	}).catch(function(e){
		next(e, {code:500, message:e.message})
	})
}

/**
 * 取消收藏战报
 * @param msg
 * @param session
 * @param next
 */
pro.unSaveReport = function(msg, session, next){
	var reportId = msg.reportId
	this.playerApiService3.unSaveReportAsync(session.uid, reportId).then(function(){
		next(null, {code:200})
	}).catch(function(e){
		next(e, {code:500, message:e.message})
	})
}

/**
 * 获取玩家战报
 * @param msg
 * @param session
 * @param next
 */
pro.getReports = function(msg, session, next){
	var fromIndex = msg.fromIndex
	this.playerApiService3.getReportsAsync(session.uid, fromIndex).then(function(){
		next(null, {code:200})
	}).catch(function(e){
		next(e, {code:500, message:e.message})
	})
}

/**
 * 获取玩家已存战报
 * @param msg
 * @param session
 * @param next
 */
pro.getSavedReports = function(msg, session, next){
	var fromIndex = msg.fromIndex
	this.playerApiService3.getSavedReportsAsync(session.uid, fromIndex).then(function(){
		next(null, {code:200})
	}).catch(function(e){
		next(e, {code:500, message:e.message})
	})
}

/**
 * 删除战报
 * @param msg
 * @param session
 * @param next
 */
pro.deleteReports = function(msg, session, next){
	var reportIds = msg.reportIds
	this.playerApiService3.deleteReportsAsync(session.uid, reportIds).then(function(){
		next(null, {code:200})
	}).catch(function(e){
		next(e, {code:500, message:e.message})
	})
}

/**
 * 修改玩家名字
 * @param msg
 * @param session
 * @param next
 */
pro.editPlayerName = function(msg, session, next){
	var name = msg.name
	this.playerApiService3.editPlayerNameAsync(session.uid, name).then(function(){
		next(null, {code:200})
	}).catch(function(e){
		next(e, {code:500, message:e.message})
	})
}

/**
 * 修改玩家城市名字
 * @param msg
 * @param session
 * @param next
 */
pro.editPlayerCityName = function(msg, session, next){
	var cityName = msg.cityName
	this.playerApiService3.editPlayerCityNameAsync(session.uid, cityName).then(function(){
		next(null, {code:200})
	}).catch(function(e){
		next(e, {code:500, message:e.message})
	})
}

/**
 * 获取玩家可视化数据数据
 * @param msg
 * @param session
 * @param next
 */
pro.getPlayerViewData = function(msg, session, next){
	var targetPlayerId = msg.targetPlayerId
	this.playerApiService3.getPlayerViewDataAsync(session.uid, targetPlayerId).then(function(){
		next(null, {code:200})
	}).catch(function(e){
		next(e, {code:500, message:e.message})
	})
}

/**
 * 设置驻防使用的龙
 * @param msg
 * @param session
 * @param next
 */
pro.setDefenceDragon = function(msg, session, next){
	var dragonType = msg.dragonType
	this.playerApiService3.setDefenceDragonAsync(session.uid, dragonType).then(function(){
		next(null, {code:200})
	}).catch(function(e){
		next(e, {code:500, message:e.message})
	})
}

/**
 * 取消驻防
 * @param msg
 * @param session
 * @param next
 */
pro.cancelDefenceDragon = function(msg, session, next){
	this.playerApiService3.cancelDefenceDragonAsync(session.uid).then(function(){
		next(null, {code:200})
	}).catch(function(e){
		next(e, {code:500, message:e.message})
	})
}