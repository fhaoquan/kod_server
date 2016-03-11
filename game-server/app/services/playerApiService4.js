"use strict"

/**
 * Created by modun on 14-7-23.
 */

var ShortId = require("shortid")
var Promise = require("bluebird")
var _ = require("underscore")

var Utils = require("../utils/utils")
var DataUtils = require("../utils/dataUtils")
var LogicUtils = require("../utils/logicUtils")
var TaskUtils = require("../utils/taskUtils")
var ItemUtils = require("../utils/itemUtils")
var ErrorUtils = require("../utils/errorUtils")
var Events = require("../consts/events")
var Consts = require("../consts/consts")
var Define = require("../consts/define")

var PlayerApiService4 = function(app){
	this.app = app
	this.env = app.get("env")
	this.pushService = app.get("pushService")
	this.playerTimeEventService = app.get("playerTimeEventService")
	this.timeEventService = app.get("timeEventService")
	this.cacheService = app.get('cacheService');
	this.dataService = app.get("dataService")
	this.logService = app.get("logService")
	this.GemChange = app.get("GemChange")
	this.Device = app.get("Device")
	this.Player = app.get("Player")
}
module.exports = PlayerApiService4
var pro = PlayerApiService4.prototype

/**
 * 升级生产科技
 * @param playerId
 * @param techName
 * @param finishNow
 * @param callback
 */
pro.upgradeProductionTech = function(playerId, techName, finishNow, callback){
	var self = this
	var playerDoc = null
	var playerData = []
	var eventFuncs = []
	var updateFuncs = []
	var tech = null
	this.cacheService.findPlayerAsync(playerId).then(function(doc){
		playerDoc = doc
		tech = playerDoc.productionTechs[techName]
		if(DataUtils.isProductionTechReachMaxLevel(tech.level)) return Promise.reject(ErrorUtils.techReachMaxLevel(playerId, techName, tech))
		if(tech.level == 0 && !DataUtils.isPlayerUnlockProductionTechLegal(playerDoc, techName)) return Promise.reject(ErrorUtils.techUpgradePreConditionNotMatch(playerId, techName, tech))

		lockPairs.push({type:Consts.Pairs.Player, value:playerDoc._id});
		return self.cacheService.lockAllAsync(lockPairs);
	}).then(function(){
		var gemUsed = 0
		var upgradeRequired = DataUtils.getPlayerProductionTechUpgradeRequired(playerDoc, techName, tech.level + 1)
		var buyedResources = null
		var buyedMaterials = null
		var preTechEvent = null
		DataUtils.refreshPlayerResources(playerDoc)
		if(finishNow){
			gemUsed += DataUtils.getGemByTimeInterval(upgradeRequired.buildTime)
			buyedResources = DataUtils.buyResources(playerDoc, upgradeRequired.resources, {})
			gemUsed += buyedResources.gemUsed
			buyedMaterials = DataUtils.buyMaterials(upgradeRequired.materials, {})
			gemUsed += buyedMaterials.gemUsed
		}else{
			buyedResources = DataUtils.buyResources(playerDoc, upgradeRequired.resources, playerDoc.resources)
			gemUsed += buyedResources.gemUsed
			buyedMaterials = DataUtils.buyMaterials(upgradeRequired.materials, playerDoc.buildingMaterials)
			gemUsed += buyedMaterials.gemUsed
			if(playerDoc.productionTechEvents.length > 0){
				preTechEvent = playerDoc.productionTechEvents[0]
				var timeRemain = (preTechEvent.finishTime - Date.now()) / 1000
				gemUsed += DataUtils.getGemByTimeInterval(timeRemain)
			}
		}

		if(gemUsed > playerDoc.resources.gem) return Promise.reject(ErrorUtils.gemNotEnough(playerId))
		if(gemUsed > 0){
			playerDoc.resources.gem -= gemUsed
			var gemUse = {
				playerId:playerId,
				playerName:playerDoc.basicInfo.name,
				changed:-gemUsed,
				left:playerDoc.resources.gem,
				api:"upgradeProductionTech",
				params:{
					techName:techName,
					currentLevel:tech.level,
					finishNow:finishNow
				}
			}
			updateFuncs.push([self.GemChange, self.GemChange.createAsync, gemUse])
		}
		LogicUtils.increace(buyedResources.totalBuy, playerDoc.resources)
		LogicUtils.increace(buyedMaterials.totalBuy, playerDoc.buildingMaterials)
		LogicUtils.reduce(upgradeRequired.resources, playerDoc.resources)
		LogicUtils.reduce(upgradeRequired.materials, playerDoc.buildingMaterials)
		playerData.push(["buildingMaterials", playerDoc.buildingMaterials])
		if(finishNow){
			tech.level += 1
			playerData.push(["productionTechs." + techName + ".level", tech.level])
			TaskUtils.finishProductionTechTaskIfNeed(playerDoc, playerData, techName, tech.level)
		}else{
			if(_.isObject(preTechEvent)){
				self.playerTimeEventService.onPlayerEvent(playerDoc, playerData, "productionTechEvents", preTechEvent.id)
				eventFuncs.push([self.timeEventService, self.timeEventService.removePlayerTimeEventAsync, playerDoc, "productionTechEvents", preTechEvent.id])
			}
			var finishTime = Date.now() + (upgradeRequired.buildTime * 1000)
			var event = LogicUtils.createProductionTechEvent(playerDoc, techName, finishTime)
			playerDoc.productionTechEvents.push(event)
			playerData.push(["productionTechEvents." + playerDoc.productionTechEvents.indexOf(event), event])
			eventFuncs.push([self.timeEventService, self.timeEventService.addPlayerTimeEventAsync, playerDoc, "productionTechEvents", event.id, finishTime - Date.now()])
		}
		DataUtils.refreshPlayerResources(playerDoc)
		playerData.push(["resources", playerDoc.resources])
		TaskUtils.finishDailyTaskIfNeeded(playerDoc, playerData, 'upgradeProudctionTech');
		updateFuncs.push([self.cacheService, self.cacheService.updatePlayerAsync, playerDoc._id, playerDoc])
		return Promise.resolve()
	}).then(function(){
		return self.cacheService.touchAllAsync(lockPairs);
	}).then(function(){
		return self.cacheService.unlockAllAsync(lockPairs);
	}).then(function(){
		return LogicUtils.excuteAll(updateFuncs)
	}).then(function(){
		return LogicUtils.excuteAll(eventFuncs)
	}).then(function(){
		callback(null, playerData)
	}).catch(function(e){
		if(!ErrorUtils.isObjectLockedError(e) && lockPairs.length > 0) self.cacheService.unlockAll(lockPairs);
		callback(e)
	})
}

/**
 * 升级军事科技
 * @param playerId
 * @param techName
 * @param finishNow
 * @param callback
 */
pro.upgradeMilitaryTech = function(playerId, techName, finishNow, callback){
	var self = this
	var playerDoc = null
	var playerData = []
	var eventFuncs = []
	var updateFuncs = []
	var tech = null
	var building = null
	this.cacheService.findPlayerAsync(playerId).then(function(doc){
		playerDoc = doc
		tech = playerDoc.militaryTechs[techName]
		building = DataUtils.getPlayerMilitaryTechBuilding(playerDoc, techName)
		if(building.level < 1) return Promise.reject(ErrorUtils.buildingNotBuild(playerId, building.location))
		if(DataUtils.isMilitaryTechReachMaxLevel(tech.level)) return Promise.reject(ErrorUtils.techReachMaxLevel(playerId, techName, tech))
		var isUpgrading = _.some(playerDoc.militaryTechEvents, function(event){
			return _.isEqual(event.name, techName)
		})
		if(isUpgrading) return Promise.reject(ErrorUtils.techIsUpgradingNow(playerId, techName, tech))

		lockPairs.push({type:Consts.Pairs.Player, value:playerDoc._id});
		return self.cacheService.lockAllAsync(lockPairs);
	}).then(function(){
		var gemUsed = 0
		var upgradeRequired = DataUtils.getPlayerMilitaryTechUpgradeRequired(playerDoc, techName, tech.level + 1)
		var buyedResources = null
		var buyedMaterials = null
		var preTechEvent = null
		DataUtils.refreshPlayerResources(playerDoc)
		if(finishNow){
			gemUsed += DataUtils.getGemByTimeInterval(upgradeRequired.buildTime)
			buyedResources = DataUtils.buyResources(playerDoc, upgradeRequired.resources, {})
			gemUsed += buyedResources.gemUsed
			buyedMaterials = DataUtils.buyMaterials(upgradeRequired.materials, {})
			gemUsed += buyedMaterials.gemUsed
		}else{
			buyedResources = DataUtils.buyResources(playerDoc, upgradeRequired.resources, playerDoc.resources)
			gemUsed += buyedResources.gemUsed
			buyedMaterials = DataUtils.buyMaterials(upgradeRequired.materials, playerDoc.technologyMaterials)
			gemUsed += buyedMaterials.gemUsed
			preTechEvent = DataUtils.getPlayerMilitaryTechUpgradeEvent(playerDoc, building.type)
			if(_.isObject(preTechEvent)){
				var timeRemain = (preTechEvent.event.finishTime - Date.now()) / 1000
				gemUsed += DataUtils.getGemByTimeInterval(timeRemain)
			}
		}

		if(gemUsed > playerDoc.resources.gem) return Promise.reject(ErrorUtils.gemNotEnough(playerId))
		if(gemUsed > 0){
			playerDoc.resources.gem -= gemUsed
			var gemUse = {
				playerId:playerId,
				playerName:playerDoc.basicInfo.name,
				changed:-gemUsed,
				left:playerDoc.resources.gem,
				api:"upgradeMilitaryTech",
				params:{
					techName:techName,
					currentLevel:tech.level,
					finishNow:finishNow
				}
			}
			updateFuncs.push([self.GemChange, self.GemChange.createAsync, gemUse])
		}
		LogicUtils.increace(buyedResources.totalBuy, playerDoc.resources)
		LogicUtils.increace(buyedMaterials.totalBuy, playerDoc.technologyMaterials)
		LogicUtils.reduce(upgradeRequired.resources, playerDoc.resources)
		LogicUtils.reduce(upgradeRequired.materials, playerDoc.technologyMaterials)
		playerData.push(["technologyMaterials", playerDoc.technologyMaterials])

		if(finishNow){
			tech.level += 1
			playerData.push(["militaryTechs." + techName + ".level", tech.level])
			TaskUtils.finishMilitaryTechTaskIfNeed(playerDoc, playerData, techName, tech.level)
		}else{
			if(_.isObject(preTechEvent)){
				self.playerTimeEventService.onPlayerEvent(playerDoc, playerData, preTechEvent.type, preTechEvent.event.id)
				eventFuncs.push([self.timeEventService, self.timeEventService.removePlayerTimeEventAsync, playerDoc, preTechEvent.type, preTechEvent.event.id])
			}
			var finishTime = Date.now() + (upgradeRequired.buildTime * 1000)
			var event = LogicUtils.createMilitaryTechEvent(playerDoc, techName, finishTime)
			playerDoc.militaryTechEvents.push(event)
			playerData.push(["militaryTechEvents." + playerDoc.militaryTechEvents.indexOf(event), event])
			eventFuncs.push([self.timeEventService, self.timeEventService.addPlayerTimeEventAsync, playerDoc, "militaryTechEvents", event.id, finishTime - Date.now()])
		}
		DataUtils.refreshPlayerResources(playerDoc)
		playerData.push(["resources", playerDoc.resources])
		TaskUtils.finishDailyTaskIfNeeded(playerDoc, playerData, 'upgradeMilitaryTech');
		updateFuncs.push([self.cacheService, self.cacheService.updatePlayerAsync, playerDoc._id, playerDoc])
		return Promise.resolve()
	}).then(function(){
		return self.cacheService.touchAllAsync(lockPairs);
	}).then(function(){
		return self.cacheService.unlockAllAsync(lockPairs);
	}).then(function(){
		return LogicUtils.excuteAll(updateFuncs)
	}).then(function(){
		return LogicUtils.excuteAll(eventFuncs)
	}).then(function(){
		callback(null, playerData)
	}).catch(function(e){
		if(!ErrorUtils.isObjectLockedError(e) && lockPairs.length > 0) self.cacheService.unlockAll(lockPairs);
		callback(e)
	})
}

/**
 * 升级士兵星级
 * @param playerId
 * @param soldierName
 * @param finishNow
 * @param callback
 */
pro.upgradeSoldierStar = function(playerId, soldierName, finishNow, callback){
	var self = this
	var playerDoc = null
	var playerData = []
	var eventFuncs = []
	var updateFuncs = []
	var building = null
	this.cacheService.findPlayerAsync(playerId).then(function(doc){
		playerDoc = doc
		building = DataUtils.getPlayerSoldierMilitaryTechBuilding(playerDoc, soldierName)
		if(building.level < 1) return Promise.reject(ErrorUtils.buildingNotBuild(playerId, building.location))
		var soldierMaxStar = DataUtils.getPlayerIntInit("soldierMaxStar")
		if(playerDoc.soldierStars[soldierName] >= soldierMaxStar) return Promise.reject(ErrorUtils.soldierReachMaxStar(playerId, soldierName))
		if(!DataUtils.isPlayerUpgradeSoldierStarTechPointEnough(playerDoc, soldierName)) return Promise.reject(ErrorUtils.techPointNotEnough(playerId, soldierName))
		var isUpgrading = _.some(playerDoc.soldierStarEvents, function(event){
			return _.isEqual(event.name, soldierName)
		})
		if(isUpgrading) return Promise.reject(ErrorUtils.soldierIsUpgradingNow(playerId, soldierName))

		lockPairs.push({type:Consts.Pairs.Player, value:playerDoc._id});
		return self.cacheService.lockAllAsync(lockPairs);
	}).then(function(){
		var gemUsed = 0
		var upgradeRequired = DataUtils.getSoldierStarUpgradeRequired(soldierName, playerDoc.soldierStars[soldierName] + 1)
		var buyedResources = null
		var preTechEvent = null

		DataUtils.refreshPlayerResources(playerDoc)
		if(finishNow){
			gemUsed += DataUtils.getGemByTimeInterval(upgradeRequired.upgradeTime)
			buyedResources = DataUtils.buyResources(playerDoc, upgradeRequired.resources, {})
			gemUsed += buyedResources.gemUsed
		}else{
			buyedResources = DataUtils.buyResources(playerDoc, upgradeRequired.resources, playerDoc.resources)
			gemUsed += buyedResources.gemUsed
			preTechEvent = DataUtils.getPlayerMilitaryTechUpgradeEvent(playerDoc, building.type)
			if(_.isObject(preTechEvent)){
				var timeRemain = (preTechEvent.event.finishTime - Date.now()) / 1000
				gemUsed += DataUtils.getGemByTimeInterval(timeRemain)
			}
		}

		if(gemUsed > playerDoc.resources.gem) return Promise.reject(ErrorUtils.gemNotEnough(playerId))
		if(gemUsed > 0){
			playerDoc.resources.gem -= gemUsed
			var gemUse = {
				playerId:playerId,
				playerName:playerDoc.basicInfo.name,
				changed:-gemUsed,
				left:playerDoc.resources.gem,
				api:"upgradeSoldierStar",
				params:{
					soldierName:soldierName,
					currentStar:playerDoc.soldierStars[soldierName],
					finishNow:finishNow
				}
			}
			updateFuncs.push([self.GemChange, self.GemChange.createAsync, gemUse])
		}
		LogicUtils.increace(buyedResources.totalBuy, playerDoc.resources)
		LogicUtils.reduce(upgradeRequired.resources, playerDoc.resources)

		if(finishNow){
			playerDoc.soldierStars[soldierName] += 1
			playerData.push(["soldierStars." + soldierName, playerDoc.soldierStars[soldierName]])
			TaskUtils.finishSoldierStarTaskIfNeed(playerDoc, playerData, soldierName, playerDoc.soldierStars[soldierName])
		}else{
			if(_.isObject(preTechEvent)){
				self.playerTimeEventService.onPlayerEvent(playerDoc, playerData, preTechEvent.type, preTechEvent.event.id)
				eventFuncs.push([self.timeEventService, self.timeEventService.removePlayerTimeEventAsync, playerDoc, preTechEvent.type, preTechEvent.event.id])
			}
			var finishTime = Date.now() + (upgradeRequired.upgradeTime * 1000)
			var event = LogicUtils.createSoldierStarEvent(playerDoc, soldierName, finishTime)
			playerDoc.soldierStarEvents.push(event)
			playerData.push(["soldierStarEvents." + playerDoc.soldierStarEvents.indexOf(event), event])
			eventFuncs.push([self.timeEventService, self.timeEventService.addPlayerTimeEventAsync, playerDoc, "soldierStarEvents", event.id, finishTime - Date.now()])
		}
		DataUtils.refreshPlayerResources(playerDoc)
		playerData.push(["resources", playerDoc.resources])
		updateFuncs.push([self.cacheService, self.cacheService.updatePlayerAsync, playerDoc._id, playerDoc])
		return Promise.resolve()
	}).then(function(){
		return self.cacheService.touchAllAsync(lockPairs);
	}).then(function(){
		return self.cacheService.unlockAllAsync(lockPairs);
	}).then(function(){
		return LogicUtils.excuteAll(updateFuncs)
	}).then(function(){
		return LogicUtils.excuteAll(eventFuncs)
	}).then(function(){
		callback(null, playerData)
	}).catch(function(e){
		if(!ErrorUtils.isObjectLockedError(e) && lockPairs.length > 0) self.cacheService.unlockAll(lockPairs);
		callback(e)
	})
}

/**
 * 设置玩家地形
 * @param playerId
 * @param terrain
 * @param callback
 */
pro.setTerrain = function(playerId, terrain, callback){
	var self = this
	var playerDoc = null
	var playerData = []
	var updateFuncs = []
	this.cacheService.findPlayerAsync(playerId).then(function(doc){
		playerDoc = doc

		var gemUsed = DataUtils.getPlayerIntInit("changeTerrainNeedGemCount")
		if(playerDoc.resources.gem < gemUsed) return Promise.reject(ErrorUtils.gemNotEnough(playerId))
		playerDoc.resources.gem -= gemUsed
		playerData.push(["resources.gem", playerDoc.resources.gem])
		DataUtils.refreshPlayerDragonsHp(playerDoc, null)
		var gemUse = {
			playerId:playerId,
			playerName:playerDoc.basicInfo.name,
			changed:-gemUsed,
			left:playerDoc.resources.gem,
			api:"setTerrain"
		}
		updateFuncs.push([self.GemChange, self.GemChange.createAsync, gemUse])

		playerDoc.basicInfo.terrain = terrain
		playerData.push(["basicInfo.terrain", playerDoc.basicInfo.terrain])
		playerData.push(['dragons.redDragon.hp', playerDoc.dragons.redDragon.hp])
		playerData.push(['dragons.redDragon.hpRefreshTime', playerDoc.dragons.redDragon.hpRefreshTime])
		playerData.push(['dragons.blueDragon.hp', playerDoc.dragons.blueDragon.hp])
		playerData.push(['dragons.blueDragon.hpRefreshTime', playerDoc.dragons.blueDragon.hpRefreshTime])
		playerData.push(['dragons.greenDragon.hp', playerDoc.dragons.greenDragon.hp])
		playerData.push(['dragons.greenDragon.hpRefreshTime', playerDoc.dragons.greenDragon.hpRefreshTime])
		updateFuncs.push([self.cacheService, self.cacheService.updatePlayerAsync, playerDoc._id, playerDoc])
		return Promise.resolve()
	}).then(function(){
		return self.cacheService.touchAllAsync(lockPairs);
	}).then(function(){
		return self.cacheService.unlockAllAsync(lockPairs);
	}).then(function(){
		return LogicUtils.excuteAll(updateFuncs)
	}).then(function(){
		callback(null, playerData)
	}).catch(function(e){
		if(!ErrorUtils.isObjectLockedError(e) && lockPairs.length > 0) self.cacheService.unlockAll(lockPairs);
		callback(e)
	})
}

/**
 * 购买道具
 * @param playerId
 * @param itemName
 * @param count
 * @param callback
 */
pro.buyItem = function(playerId, itemName, count, callback){
	var self = this
	var playerDoc = null
	var playerData = []
	var updateFuncs = []
	this.cacheService.findPlayerAsync(playerId).then(function(doc){
		playerDoc = doc
		var itemConfig = DataUtils.getItemConfig(itemName)
		if(!itemConfig.isSell) return Promise.reject(ErrorUtils.itemNotSell(playerId, itemName))
		var gemUsed = itemConfig.price * count
		if(playerDoc.resources.gem < gemUsed) return Promise.reject(ErrorUtils.gemNotEnough(playerId))
		playerDoc.resources.gem -= gemUsed
		playerData.push(["resources.gem", playerDoc.resources.gem])
		var gemUse = {
			playerId:playerId,
			playerName:playerDoc.basicInfo.name,
			changed:-gemUsed,
			left:playerDoc.resources.gem,
			api:"buyItem",
			params:{
				name:itemName,
				count:count
			}
		}
		updateFuncs.push([self.GemChange, self.GemChange.createAsync, gemUse])
		updateFuncs.push([self.dataService, self.dataService.addPlayerItemsAsync, playerDoc, playerData, 'buyShopItem', null, [{name:itemName, count:count}]]);
		TaskUtils.finishDailyTaskIfNeeded(playerDoc, playerData, 'buyShopItem');
		updateFuncs.push([self.cacheService, self.cacheService.updatePlayerAsync, playerDoc._id, playerDoc])
		return Promise.resolve()
	}).then(function(){
		return self.cacheService.touchAllAsync(lockPairs);
	}).then(function(){
		return self.cacheService.unlockAllAsync(lockPairs);
	}).then(function(){
		return LogicUtils.excuteAll(updateFuncs)
	}).then(function(){
		callback(null, playerData)
	}).catch(function(e){
		if(!ErrorUtils.isObjectLockedError(e) && lockPairs.length > 0) self.cacheService.unlockAll(lockPairs);
		callback(e)
	})
}

/**
 * 使用道具
 * @param playerId
 * @param itemName
 * @param params
 * @param callback
 */
pro.useItem = function(playerId, itemName, params, callback){
	var self = this
	var playerDoc = null
	var playerData = []
	var item = null
	var chestKey = null
	var itemData = null
	var updateFuncs = []
	var eventFuncs = []
	var pushFuncs = []
	var forceSave = false
	this.cacheService.findPlayerAsync(playerId).then(function(doc){
		playerDoc = doc
		item = _.find(playerDoc.items, function(item){
			return _.isEqual(item.name, itemName)
		})
		if(!_.isObject(item))  return Promise.reject(ErrorUtils.itemNotExist(playerId, itemName))
		itemData = params[itemName]
		if((DataUtils.isResourceItem(itemName) || _.isEqual(itemName, 'sweepScroll')) && item.count < itemData.count) return Promise.reject(ErrorUtils.itemCountNotEnough(playerId, playerDoc.allianceId, itemName));
		if(_.isEqual("changePlayerName", itemName)){
			forceSave = true
		}else if(_.isEqual("chest_2", itemName) || _.isEqual("chest_3", itemName) || _.isEqual("chest_4", itemName)){
			var key = "chestKey_" + itemName.slice(-1)
			chestKey = _.find(playerDoc.items, function(item){
				return _.isEqual(item.name, key)
			})
			if(!_.isObject(chestKey))  return Promise.reject(ErrorUtils.itemNotExist(playerId, key))
		}else if(_.isEqual("chestKey_2", itemName) || _.isEqual("chestKey_3", itemName) || _.isEqual("chestKey_4", itemName)){
			return Promise.reject(ErrorUtils.itemCanNotBeUsedDirectly(playerId, itemName))
		}
		return ItemUtils.useItem(itemName, itemData, playerDoc, playerData, self.cacheService, updateFuncs, eventFuncs, pushFuncs, self.pushService, self.timeEventService, self.playerTimeEventService, self.dataService)
	}).then(function(){
		if(DataUtils.isResourceItem(itemName) || _.isEqual(itemName, 'sweepScroll')) item.count -= itemData.count;
		else item.count -= 1;
		if(item.count <= 0){
			playerData.push(["items." + playerDoc.items.indexOf(item), null])
			LogicUtils.removeItemInArray(playerDoc.items, item)
		}else{
			playerData.push(["items." + playerDoc.items.indexOf(item) + ".count", item.count])
		}
		if(_.isObject(chestKey)){
			chestKey.count -= 1
			if(chestKey.count <= 0){
				playerData.push(["items." + playerDoc.items.indexOf(chestKey), null])
				LogicUtils.removeItemInArray(playerDoc.items, chestKey)
			}else{
				playerData.push(["items." + playerDoc.items.indexOf(chestKey) + ".count", chestKey.count])
			}
		}
		if(_.isEqual("changePlayerName", itemName)){
			eventFuncs.push([self.dataService, self.dataService.updatePlayerSessionAsync, playerDoc, {name:playerDoc.basicInfo.name}])
		}

		if(forceSave){
			updateFuncs.push([self.cacheService, self.cacheService.flushPlayerAsync, playerDoc._id, playerDoc])
		}else{
			updateFuncs.push([self.cacheService, self.cacheService.updatePlayerAsync, playerDoc._id, playerDoc])
		}
		return Promise.resolve()
	}).then(function(){
		return self.cacheService.touchAllAsync(lockPairs);
	}).then(function(){
		return self.cacheService.unlockAllAsync(lockPairs);
	}).then(function(){
		return LogicUtils.excuteAll(updateFuncs)
	}).then(function(){
		return LogicUtils.excuteAll(eventFuncs)
	}).then(function(){
		return LogicUtils.excuteAll(pushFuncs)
	}).then(function(){
		callback(null, playerData)
	}).catch(function(e){
		if(!ErrorUtils.isObjectLockedError(e) && lockPairs.length > 0) self.cacheService.unlockAll(lockPairs);
		callback(e)
	})
}

/**
 * 购买并使用道具
 * @param playerId
 * @param itemName
 * @param params
 * @param callback
 */
pro.buyAndUseItem = function(playerId, itemName, params, callback){
	var self = this
	var playerDoc = null
	var playerData = []
	var gemUsed = null
	var chestKey = null
	var forceSave = false
	var pushFuncs = []
	var eventFuncs = []
	var updateFuncs = []
	this.cacheService.findPlayerAsync(playerId).then(function(doc){
		playerDoc = doc
		var itemConfig = DataUtils.getItemConfig(itemName)
		if(!itemConfig.isSell) return Promise.reject(ErrorUtils.itemNotSell(playerId, itemName))
		var itemData = params[itemName]
		gemUsed = itemConfig.price * ((DataUtils.isResourceItem(itemName) || _.isEqual(itemName, 'sweepScroll')) ? itemData.count : 1);
		if(playerDoc.resources.gem < gemUsed) return Promise.reject(ErrorUtils.gemNotEnough(playerId))

		if(_.isEqual("changePlayerName", itemName)){
			forceSave = true
		}else if(_.isEqual("chest_2", itemName) || _.isEqual("chest_3", itemName) || _.isEqual("chest_4", itemName)){
			var key = "chestKey_" + itemName.slice(-1)
			chestKey = _.find(playerDoc.items, function(item){
				return _.isEqual(item.name, key)
			})
			if(!_.isObject(chestKey))  return Promise.reject(ErrorUtils.itemNotExist(playerId, key))
		}else if(_.isEqual("chestKey_2", itemName) || _.isEqual("chestKey_3", itemName) || _.isEqual("chestKey_4", itemName)){
			return Promise.reject(ErrorUtils.itemCanNotBeUsedDirectly(playerId, itemName))
		}
		return ItemUtils.useItem(itemName, itemData, playerDoc, playerData, self.cacheService, updateFuncs, eventFuncs, pushFuncs, self.pushService, self.timeEventService, self.playerTimeEventService, self.dataService)
	}).then(function(){
		playerDoc.resources.gem -= gemUsed
		playerData.push(["resources.gem", playerDoc.resources.gem])
		var gemUse = {
			playerId:playerId,
			playerName:playerDoc.basicInfo.name,
			changed:-gemUsed,
			left:playerDoc.resources.gem,
			api:"buyAndUseItem",
			params:{
				name:itemName,
				params:params
			}
		}
		updateFuncs.push([self.GemChange, self.GemChange.createAsync, gemUse])
		TaskUtils.finishDailyTaskIfNeeded(playerDoc, playerData, 'buyShopItem');

		if(_.isObject(chestKey)){
			chestKey.count -= 1
			if(chestKey.count <= 0){
				playerData.push(["items." + playerDoc.items.indexOf(chestKey), null])
				LogicUtils.removeItemInArray(playerDoc.items, chestKey)
			}else{
				playerData.push(["items." + playerDoc.items.indexOf(chestKey) + ".count", chestKey.count])
			}
		}
		if(_.isEqual("changePlayerName", itemName)){
			eventFuncs.push([self.dataService, self.dataService.updatePlayerSessionAsync, playerDoc, {name:playerDoc.basicInfo.name}])
		}

		if(forceSave){
			updateFuncs.push([self.cacheService, self.cacheService.flushPlayerAsync, playerDoc._id, playerDoc])
		}else{
			updateFuncs.push([self.cacheService, self.cacheService.updatePlayerAsync, playerDoc._id, playerDoc])
		}
		return Promise.resolve()
	}).then(function(){
		return self.cacheService.touchAllAsync(lockPairs);
	}).then(function(){
		return self.cacheService.unlockAllAsync(lockPairs);
	}).then(function(){
		return LogicUtils.excuteAll(updateFuncs)
	}).then(function(){
		return LogicUtils.excuteAll(eventFuncs)
	}).then(function(){
		return LogicUtils.excuteAll(pushFuncs)
	}).then(function(){
		callback(null, playerData)
	}).catch(function(e){
		if(!ErrorUtils.isObjectLockedError(e) && lockPairs.length > 0) self.cacheService.unlockAll(lockPairs);
		callback(e)
	})
}

/**
 * gacha
 * @param playerId
 * @param type
 * @param callback
 */
pro.gacha = function(playerId, type, callback){
	var self = this
	var playerDoc = null
	var playerData = []
	var updateFuncs = []
	this.cacheService.findPlayerAsync(playerId).then(function(doc){
		playerDoc = doc
		if(_.isEqual(type, Consts.GachaType.Normal) && DataUtils.isPlayerCanFreeNormalGacha(playerDoc)){
			playerDoc.countInfo.todayFreeNormalGachaCount += 1
			playerData.push(["countInfo.todayFreeNormalGachaCount", playerDoc.countInfo.todayFreeNormalGachaCount])
		}else{
			var casinoTokenNeeded = DataUtils.getCasinoTokeNeededInGachaType(type)
			if(playerDoc.resources.casinoToken - casinoTokenNeeded < 0) return Promise.reject(ErrorUtils.casinoTokenNotEnough(playerId, playerDoc.resources.casinoToken, casinoTokenNeeded))
			playerDoc.resources.casinoToken -= casinoTokenNeeded
			playerData.push(["resources.casinoToken", playerDoc.resources.casinoToken])
		}

		var count = _.isEqual(type, Consts.GachaType.Normal) ? 1 : 3
		var excludes = []
		var items = [];
		for(var i = 0; i < count; i++){
			var item = DataUtils.getGachaItemByType(type, excludes)
			items.push(item);
			excludes.push(item.name)
		}
		updateFuncs.push([self.dataService, self.dataService.addPlayerItemsAsync, playerDoc, playerData, 'gacha', {type:type}, items]);
		updateFuncs.push([self.cacheService, self.cacheService.updatePlayerAsync, playerDoc._id, playerDoc])
		return Promise.resolve()
	}).then(function(){
		return self.cacheService.touchAllAsync(lockPairs);
	}).then(function(){
		return self.cacheService.unlockAllAsync(lockPairs);
	}).then(function(){
		return LogicUtils.excuteAll(updateFuncs)
	}).then(function(){
		callback(null, playerData)
	}).catch(function(e){
		if(!ErrorUtils.isObjectLockedError(e) && lockPairs.length > 0) self.cacheService.unlockAll(lockPairs);
		callback(e)
	})
}

/**
 * 绑定GameCenter账号到当前玩家数据
 * @param playerId
 * @param type
 * @param gcId
 * @param gcName
 * @param callback
 */
pro.bindGc = function(playerId, type, gcId, gcName, callback){
	var self = this
	var gc = {type:type, gcId:gcId, gcName:gcName};
	var playerDoc = null
	var playerData = []
	var updateFuncs = []
	this.cacheService.findPlayerAsync(playerId).then(function(doc){
		playerDoc = doc
		if(!!playerDoc.gc) return Promise.reject(ErrorUtils.playerAlreadyBindGC(playerId, playerDoc.gc))
		return self.cacheService.getPlayerModel().findOneAsync({'gc.gcId':gcId}, {_id:true})
	}).then(function(doc){
		if(!!doc) return Promise.reject(ErrorUtils.theGCAlreadyBindedByOtherPlayer(playerId, gc))
		playerDoc.gc = gc
		playerData.push(["gc", playerDoc.gc]);
		updateFuncs.push([self.cacheService, self.cacheService.flushPlayerAsync, playerDoc._id, playerDoc])
	}).then(function(){
		return self.cacheService.touchAllAsync(lockPairs);
	}).then(function(){
		return self.cacheService.unlockAllAsync(lockPairs);
	}).then(function(){
		return LogicUtils.excuteAll(updateFuncs)
	}).then(function(){
		callback(null, playerData)
	}).catch(function(e){
		if(!ErrorUtils.isObjectLockedError(e) && lockPairs.length > 0) self.cacheService.unlockAll(lockPairs);
		callback(e)
	})
}

/**
 * 更新GcName
 * @param playerId
 * @param gcName
 * @param callback
 */
pro.updateGcName = function(playerId, gcName, callback){
	var self = this
	var playerDoc = null
	var playerData = []
	var updateFuncs = []
	this.cacheService.findPlayerAsync(playerId).then(function(doc){
		playerDoc = doc
		if(!playerDoc.gc) return Promise.reject(ErrorUtils.playerNotBindGC(playerId))
		playerDoc.gc.gcName = gcName;
		playerData.push(["gc.gcName", playerDoc.gc.gcName]);
		updateFuncs.push([self.cacheService, self.cacheService.updatePlayerAsync, playerDoc._id, playerDoc])
	}).then(function(){
		return self.cacheService.touchAllAsync(lockPairs);
	}).then(function(){
		return self.cacheService.unlockAllAsync(lockPairs);
	}).then(function(){
		return LogicUtils.excuteAll(updateFuncs)
	}).then(function(){
		callback(null, playerData)
	}).catch(function(e){
		if(!ErrorUtils.isObjectLockedError(e) && lockPairs.length > 0) self.cacheService.unlockAll(lockPairs);
		callback(e)
	})
}

/**
 * 切换GameCenter账号
 * @param playerId
 * @param deviceId
 * @param gcId
 * @param callback
 */
pro.switchGc = function(playerId, deviceId, gcId, callback){
	var self = this
	var playerDoc = null
	this.cacheService.directFindPlayerAsync(playerId).then(function(doc){
		playerDoc = doc
		if(!!playerDoc.gc && playerDoc.gc.gcId === gcId) return Promise.reject(ErrorUtils.theGCAlreadyBindedByCurrentPlayer(playerId, playerDoc.gc));
		return self.cacheService.getPlayerModel().findOneAsync({'gc.gcId':gcId}, {_id:true})
	}).then(function(doc){
		if(!_.isObject(doc)){
			return self.Device.removeAsync({_id:deviceId});
		}else{
			return self.Device.updateAsync({_id:deviceId}, {playerId:doc._id})
		}
	}).then(function(){
		callback()
		return Promise.resolve()
	}).then(function(){
		self.app.rpc.logic.logicRemote.kickPlayer.toServer(playerDoc.logicServerId, playerDoc._id, "切换账号")
	}).catch(function(e){
		callback(e)
	})
}