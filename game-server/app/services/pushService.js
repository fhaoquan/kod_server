"use strict"

/**
 * Created by modun on 14-8-7.
 */

var _ = require("underscore")
var Promise = require("bluebird")

var Consts = require("../consts/consts")
var Events = require("../consts/events")
var Utils = require("../utils/utils")

var PushService = function(app){
	this.app = app
	this.channelService = app.get("channelService")
	this.globalChannelService = Promise.promisifyAll(app.get("globalChannelService"))
	this.serverId = app.getServerId()
	this.serverType = app.getServerType()
}

module.exports = PushService
var pro = PushService.prototype

/**
 * 推送消息给单个玩家
 * @param playerDoc
 * @param eventName
 * @param data
 * @param callback
 */
pro.pushToPlayer = function(playerDoc, eventName, data, callback){
	if(_.isEmpty(playerDoc.logicServerId)){
		callback()
		return
	}
	this.channelService.pushMessageByUids(eventName, data, [
		{uid:playerDoc._id, sid:playerDoc.logicServerId}
	], callback)
}

/**
 * 推送玩家数据给玩家
 * @param playerDoc
 * @param callback
 */
pro.onPlayerDataChanged = function(playerDoc, callback){
	this.pushToPlayer(playerDoc, Events.player.onPlayerDataChanged, Utils.filter(playerDoc), callback)
}

/**
 * 玩家登陆成功时,推送数据给玩家
 * @param playerDoc
 * @param callback
 */
pro.onPlayerLoginSuccess = function(playerDoc, callback){
	playerDoc.serverTime = Date.now()
	this.pushToPlayer(playerDoc, Events.player.onPlayerLoginSuccess, Utils.filter(playerDoc), callback)
}

/**
 * 建筑升级成功事件推送
 * @param playerDoc
 * @param location
 * @param callback
 */
pro.onBuildingLevelUp = function(playerDoc, location, callback){
	var building = playerDoc.buildings["location_" + location]
	var data = {
		buildingType:building.type,
		level:building.level
	}
	this.pushToPlayer(playerDoc, Events.player.onBuildingLevelUp, data, callback)
}

/**
 * 小屋升级成功事件推送
 * @param playerDoc
 * @param buildingLocation
 * @param houseLocation
 * @param callback
 */
pro.onHouseLevelUp = function(playerDoc, buildingLocation, houseLocation, callback){
	var building = playerDoc.buildings["location_" + buildingLocation]
	var house = null
	_.each(building.houses, function(v){
		if(_.isEqual(houseLocation, v.location)){
			house = v
		}
	})
	var data = {
		buildingType:building.type,
		houseType:house.type,
		level:house.level
	}
	this.pushToPlayer(playerDoc, Events.player.onHouseLevelUp, data, callback)
}

/**
 * 箭塔升级成功事件推送
 * @param playerDoc
 * @param location
 * @param callback
 */
pro.onTowerLevelUp = function(playerDoc, location, callback){
	var tower = playerDoc.towers["location_" + location]
	var data = {
		level:tower.level
	}
	this.pushToPlayer(playerDoc, Events.player.onTowerLevelUp, data, callback)
}

/**
 * 城墙成绩成功事件推送
 * @param playerDoc
 * @param callback
 */
pro.onWallLevelUp = function(playerDoc, callback){
	var wall = playerDoc.wall
	var data = {
		level:wall.level
	}
	this.pushToPlayer(playerDoc, Events.player.onWallLevelUp, data, callback)
}

/**
 * 材料制作完成事件推送
 * @param playerDoc
 * @param event
 * @param callback
 */
pro.onMakeMaterialFinished = function(playerDoc, event, callback){
	var data = {
		category:event.category
	}
	this.pushToPlayer(playerDoc, Events.player.onMakeMaterialFinished, data, callback)
}

/**
 * 获取由工具作坊制作的材料成功
 * @param playerDoc
 * @param event
 * @param callback
 */
pro.onGetMaterialSuccess = function(playerDoc, event, callback){
	var data = {
		category:event.category
	}
	this.pushToPlayer(playerDoc, Events.player.onGetMaterialSuccess, data, callback)
}

/**
 * 士兵招募成功推送
 * @param playerDoc
 * @param soldierName
 * @param count
 * @param callback
 */
pro.onRecruitSoldierSuccess = function(playerDoc, soldierName, count, callback){
	var data = {
		soldierName:soldierName,
		count:count
	}
	this.pushToPlayer(playerDoc, Events.player.onRecruitSoldierSuccess, data, callback)
}

/**
 * 龙装备制作完成
 * @param playerDoc
 * @param equipmentName
 * @param callback
 */
pro.onMakeDragonEquipmentSuccess = function(playerDoc, equipmentName, callback){
	var data = {
		equipmentName:equipmentName
	}
	this.pushToPlayer(playerDoc, Events.player.onMakeDragonEquipmentSuccess, data, callback)
}

/**
 * 治疗士兵成功通知
 * @param playerDoc
 * @param soldiers
 * @param callback
 */
pro.onTreatSoldierSuccess = function(playerDoc, soldiers, callback){
	var data = {
		soldiers:soldiers
	}
	this.pushToPlayer(playerDoc, Events.player.onTreatSoldierSuccess, data, callback)
}

/**
 * 收税完成通知
 * @param playerDoc
 * @param coinCount
 * @param callback
 */
pro.onImposeSuccess = function(playerDoc, coinCount, callback){
	var data = {
		coinCount:coinCount
	}
	this.pushToPlayer(playerDoc, Events.player.onImposeSuccess, data, callback)
}

/**
 * 查看玩家个人信息通知
 * @param playerDoc
 * @param callback
 */
pro.onGetPlayerInfoSuccess = function(playerDoc, callback){
	var hasAlliance = _.isObject(playerDoc.alliance) && !_.isEmpty(playerDoc.alliance.id)
	var data = {
		name:playerDoc.basicInfo.name,
		power:playerDoc.basicInfo.power,
		level:playerDoc.basicInfo.level,
		exp:playerDoc.basicInfo.exp,
		vip:playerDoc.basicInfo.vip,
		alliance:hasAlliance ? playerDoc.alliance.name : "",
		title:hasAlliance ? playerDoc.alliance.title : "",
		titleName:hasAlliance ? playerDoc.alliance.titleName : "",
		lastLoginTime:playerDoc.countInfo.lastLoginTime
	}
	this.pushToPlayer(playerDoc, Events.player.onGetPlayerInfoSuccess, data, callback)
}

/**
 * 推送联盟数据给玩家
 * @param allianceDoc
 * @param callback
 */
pro.onAllianceDataChanged = function(allianceDoc, callback){
	var eventName = Events.alliance.onAllianceDataChanged
	var channelName = Consts.AllianceChannelPrefix + allianceDoc._id
	this.globalChannelService.pushMessage(this.serverType, eventName, allianceDoc, channelName, null, callback)
}

/**
 * 联盟搜索数据返回
 * @param playerDoc
 * @param allianceDocs
 * @param callback
 */
pro.onSearchAllianceSuccess = function(playerDoc, allianceDocs, callback){
	var data = {
		alliances:allianceDocs
	}
	this.pushToPlayer(playerDoc, Events.player.onSearchAllianceSuccess, data, callback)
}