"use strict"

/**
 * Created by modun on 14-8-6.
 */

var ShortId = require("shortid")
var _ = require("underscore")
var sprintf = require("sprintf")
var Promise = require("bluebird")

var DataUtils = require("./dataUtils")
var MapUtils = require("./mapUtils")
var Consts = require("../consts/consts")
var Define = require("../consts/define")

var Utils = module.exports


/**
 * 获取Buff加成效果
 * @param origin
 * @param effect
 * @returns {number}
 */
Utils.getEfficiency = function(origin, effect){
	var res = 1 / (1 + effect)
	res = Math.floor(res * 1000000) / 1000000
	res = Math.floor(origin * res)
	return res
}

/**
 * 检查是否足够
 * @param need
 * @param has
 */
Utils.isEnough = function(need, has){
	return _.every(need, function(value, key){
		return _.isNumber(has[key]) && has[key] > need[key]
	})
}

/**
 * 从Array中移除Item
 * @param array
 * @param item
 */
Utils.removeItemInArray = function(array, item){
	var index = array.indexOf(item)
	if(index >= 0){
		array.splice(index, 1)
	}
}

/**
 * 清空Array
 * @param array
 */
Utils.clearArray = function(array){
	while(array.length > 0){
		array.pop()
	}
}

/**
 * 清空Object
 * @param object
 */
Utils.clearObject = function(object){
	_.each(object, function(value, key){
		delete object[key]
	})
}

/**
 * 减少相应数值
 * @param need
 * @param has
 */
Utils.reduce = function(need, has){
	_.each(need, function(value, key){
		if(_.isNumber(has[key])){
			has[key] -= value
		}else{
			has[key] = -value
		}
	})
}

/**
 * 增加相应数量
 * @param willAdd
 * @param has
 */
Utils.increace = function(willAdd, has){
	_.each(willAdd, function(value, key){
		if(_.isNumber(has[key])){
			has[key] += value
		}else{
			has[key] = value
		}
	})
}

/**
 * 一次执行所有函数
 * @param functionObjects
 * @returns {*}
 */
Utils.excuteAll = function(functionObjects){
	var funcs = []
	_.each(functionObjects, function(functionObj){
		var caller = functionObj[0]
		var func = functionObj[1]
		funcs.push(func.apply(caller, Array.prototype.slice.call(functionObj, 2)))
	})
	return Promise.all(funcs)
}

/**
 * 检测是否有建筑和箭塔需要从-1级升级到0级
 * @param playerDoc
 */
Utils.updateBuildingsLevel = function(playerDoc){
	var buildings = playerDoc.buildings
	var towers = playerDoc.towers
	for(var i = 1; i <= _.size(buildings); i++){
		var building = buildings["location_" + i]
		if(building.level == -1){
			for(var j = i - 1; j >= 1; j--){
				var preBuilding = buildings["location_" + j]
				if(preBuilding.level <= 0){
					return false
				}
			}

			var round = this.getBuildingCurrentRound(i)
			var fromToEnd = this.getBuildingRoundFromAndEnd(round)
			for(var k = fromToEnd.from; k < fromToEnd.to; k++){
				buildings["location_" + k].level = 0
			}

			fromToEnd = this.getBuildingRoundFromAndEnd(round - 1)
			var totalActiveTowerCount = fromToEnd.to - fromToEnd.from + 2
			for(var l = totalActiveTowerCount - 2 + 1; l <= totalActiveTowerCount; l++){
				var tower = towers["location_" + l]
				tower.level = 1
			}
			return true
		}
	}
	return false
}

/**
 * 检查建筑创建时坑位是否合法
 * @param playerDoc
 * @param location
 * @returns {boolean}
 */
Utils.isBuildingCanCreateAtLocation = function(playerDoc, location){
	var previousLocation = this.getPreviousBuildingLocation(location)
	var nextLocation = this.getNextBuildingLocation(location)
	var frontLocation = this.getFrontBuildingLocation(location)
	if(previousLocation){
		var previousBuilding = playerDoc.buildings["location_" + previousLocation]
		if(previousBuilding.level > 0) return true
	}
	if(nextLocation){
		var nextBuilding = playerDoc.buildings["location_" + nextLocation]
		if(nextBuilding.level > 0) return true
	}
	if(frontLocation){
		var frontBuilding = playerDoc.buildings["location_" + frontLocation]
		if(frontBuilding.level > 0) return true
	}

	return false
}

/**
 * 小屋是否能在指定位置创建
 * @param playerDoc
 * @param buildingLocation
 * @param houseType
 * @param houseLocation
 * @returns {boolean}
 */
Utils.isHouseCanCreateAtLocation = function(playerDoc, buildingLocation, houseType, houseLocation){
	var conditions = {
		location_1:{
			widthMax:2,
			heightMax:1
		},
		location_2:{
			widthMax:1,
			heightMax:1
		},
		location_3:{
			widthMax:1,
			heightMax:1
		}
	}

	var building = playerDoc.buildings["location_" + buildingLocation]
	var houses = building.houses
	var willBeSize = DataUtils.getHouseSize(houseType)
	var condition = conditions["location_" + houseLocation]
	if(willBeSize.width > condition.widthMax) return false
	if(willBeSize.height > condition.heightMax) return false
	var wantUse = [houseLocation]
	if(willBeSize.width > 1 || willBeSize.height > 1){
		wantUse.push(houseLocation + 1)
	}

	var alreadyUsed = []
	_.each(houses, function(house){
		var houseSize = DataUtils.getHouseSize(house.type)
		alreadyUsed.push(house.location)
		if(houseSize.width > 1 || houseSize.height > 1){
			wantUse.push(house.location + 1)
		}
	})

	return _.intersection(wantUse, alreadyUsed).length == 0
}

/**
 * 获取当前坐标的上一个坐标
 * @param currentLocation
 * @returns {*}
 */
Utils.getPreviousBuildingLocation = function(currentLocation){
	var round = this.getBuildingCurrentRound(currentLocation)
	var previousRound = this.getBuildingCurrentRound(currentLocation - 1)
	if(_.isEqual(round, previousRound)) return currentLocation - 1
	return null
}

/**
 * 获取当前坐标的下一个坐标
 * @param currentLocation
 * @returns {*}
 */
Utils.getNextBuildingLocation = function(currentLocation){
	var round = this.getBuildingCurrentRound(currentLocation)
	var previousRound = this.getBuildingCurrentRound(currentLocation + 1)
	if(_.isEqual(round, previousRound)) return currentLocation + 1
	return null
}

/**
 * 获取当前坐标的前一个坐标
 * @param currentLocation
 * @returns {*}
 */
Utils.getFrontBuildingLocation = function(currentLocation){
	var round = this.getBuildingCurrentRound(currentLocation)
	var middle = Math.floor(this.getBuildingRoundMiddleLocation(round))

	if(currentLocation == middle) return null
	if(currentLocation < middle){
		return currentLocation - ((round - 1) * 2) + 1
	}else if(currentLocation > middle){
		return currentLocation - ((round - 1) * 2) - 1
	}
	return null
}

/**
 *
 * @param currentLocation
 * @returns {*}
 */
Utils.getBuildingCurrentRound = function(currentLocation){
	var nextFrom = 1
	for(var i = 1; i <= 5; i++){
		var from = nextFrom
		var to = from + (i - 1) * 2 + 1
		nextFrom = to
		if(currentLocation >= from && currentLocation < to){
			return i
		}
	}

	return null
}

/**
 * 根据当前建筑坐标获取当前坐标所属圈数的起点坐标和结束坐标
 * @param currentRound
 * @returns {{from: *, to: *}}
 */
Utils.getBuildingRoundFromAndEnd = function(currentRound){
	var from = null
	var to = null
	var nextFrom = 1
	for(var i = 1; i <= currentRound; i++){
		from = nextFrom
		to = from + (i - 1) * 2 + 1
		nextFrom = to
	}

	return {from:from, to:to}
}

/**
 * 根据当前建筑坐标获取当前圈数的中间坐标
 * @param currentRound
 * @returns {*}
 */
Utils.getBuildingRoundMiddleLocation = function(currentRound){
	var fromAndTo = this.getBuildingRoundFromAndEnd(currentRound)
	var middle = fromAndTo.from + ((fromAndTo.to - fromAndTo.from) / 2)
	return middle
}

/**
 * 是否有指定坑位的建筑建造事件
 * @param playerDoc
 * @param buildingLocation
 * @returns {boolean}
 */
Utils.hasBuildingEvents = function(playerDoc, buildingLocation){
	return _.some(playerDoc.buildingEvents, function(event){
		return _.isEqual(buildingLocation, event.location)
	})
}

/**
 * 是否有指定坑位的小屋建造事件
 * @param playerDoc
 * @param buildingLocation
 * @param houseLocation
 * @returns {boolean}
 */
Utils.hasHouseEvents = function(playerDoc, buildingLocation, houseLocation){
	return _.some(playerDoc.houseEvents, function(event){
		return _.isEqual(event.buildingLocation, buildingLocation) && _.isEqual(event.houseLocation, houseLocation)
	})
}

/**
 * 是否有指定坑位的防御塔建造事件
 * @param playerDoc
 * @param towerLocation
 * @returns {boolean}
 */
Utils.hasTowerEvents = function(playerDoc, towerLocation){
	return _.some(playerDoc.towerEvents, function(event){
		return _.isEqual(towerLocation, event.location)
	})
}

/**
 * 是否有城墙建造事件
 * @param playerDoc
 * @returns {boolean}
 */
Utils.hasWallEvents = function(playerDoc){
	return playerDoc.wallEvents.length > 0
}

/**
 * 创建建筑建造事件
 * @param playerDoc
 * @param location
 * @param finishTime
 * @returns {{location: *, finishTime: *}}
 */
Utils.createBuildingEvent = function(playerDoc, location, finishTime){
	var event = {
		id:ShortId.generate(),
		location:location,
		startTime:Date.now(),
		finishTime:finishTime
	}
	return event
}

/**
 * 创建小屋建造事件
 * @param playerDoc
 * @param buildingLocation
 * @param houseLocation
 * @param finishTime
 * @returns {{buildingLocation: *, houseLocation: *, finishTime: *}}
 */
Utils.createHouseEvent = function(playerDoc, buildingLocation, houseLocation, finishTime){
	var event = {
		id:ShortId.generate(),
		buildingLocation:buildingLocation,
		houseLocation:houseLocation,
		startTime:Date.now(),
		finishTime:finishTime
	}
	return event
}

/**
 * 创建防御塔建造事件
 * @param playerDoc
 * @param location
 * @param finishTime
 * @returns {{location: *, finishTime: *}}
 */
Utils.createTowerEvent = function(playerDoc, location, finishTime){
	var event = {
		id:ShortId.generate(),
		location:location,
		startTime:Date.now(),
		finishTime:finishTime
	}
	return event
}

/**
 * 创建城墙事件
 * @param playerDoc
 * @param finishTime
 * @returns {{finishTime: *}}
 */
Utils.createWallEvent = function(playerDoc, finishTime){
	var event = {
		id:ShortId.generate(),
		startTime:Date.now(),
		finishTime:finishTime
	}
	return event
}

/**
 * 创建士兵招募事件
 * @param playerDoc
 * @param soldierName
 * @param count
 * @param finishTime
 * @returns {{name: *, count: *, finishTime: *}}
 */
Utils.createSoldierEvent = function(playerDoc, soldierName, count, finishTime){
	var event = {
		id:ShortId.generate(),
		name:soldierName,
		count:count,
		startTime:Date.now(),
		finishTime:finishTime
	}
	return event
}

/**
 * 创建龙装备制造事件
 * @param playerDoc
 * @param equipmentName
 * @param finishTime
 * @returns {{name: *, finishTime: *}}
 */
Utils.createDragonEquipmentEvent = function(playerDoc, equipmentName, finishTime){
	var event = {
		id:ShortId.generate(),
		name:equipmentName,
		startTime:Date.now(),
		finishTime:finishTime
	}
	return event
}

/**
 * 创建士兵治疗事件
 * @param playerDoc
 * @param soldiers
 * @param finishTime
 * @returns {{soldiers: *, finishTime: *}}
 */
Utils.createTreatSoldierEvent = function(playerDoc, soldiers, finishTime){
	var event = {
		id:ShortId.generate(),
		soldiers:soldiers,
		startTime:Date.now(),
		finishTime:finishTime
	}
	return event
}

/**
 * 创建收税事件
 * @param playerDoc
 * @param coin
 * @param finishTime
 * @returns {{coin: *, finishTime: *}}
 */
Utils.createCoinEvent = function(playerDoc, coin, finishTime){
	var event = {
		id:ShortId.generate(),
		coin:coin,
		startTime:Date.now(),
		finishTime:finishTime
	}
	return event
}

/**
 * 根据建筑建造事件查找建筑
 * @param playerDoc
 * @param buildingEvent
 * @returns {*}
 */
Utils.getBuildingByEvent = function(playerDoc, buildingEvent){
	return playerDoc.buildings["location_" + buildingEvent.location]
}

/**
 * 根据小屋建造事件查找小屋
 * @param playerDoc
 * @param houseEvent
 * @returns {*}
 */
Utils.getHouseByEvent = function(playerDoc, houseEvent){
	var building = playerDoc.buildings["location_" + houseEvent.buildingLocation]
	var theHouse = null
	_.some(building.houses, function(house){
		if(_.isEqual(house.location, houseEvent.houseLocation)){
			theHouse = house
			return true
		}
	})
	return theHouse
}

/**
 * 根据防御塔建造事件查找防御塔
 * @param playerDoc
 * @param towerEvent
 * @returns {*}
 */
Utils.getTowerByEvent = function(playerDoc, towerEvent){
	return playerDoc.towers["location_" + towerEvent.location]
}

/**
 * 移除数组中指定的元素
 * @param array
 * @param items
 */
Utils.removeItemsInArray = function(array, items){
	for(var i = 0; i < items.length; i++){
		for(var j = 0; j < array.length; j++){
			if(_.isEqual(array[j], items[i])){
				array.splice(j, 1)
				break
			}
		}
	}
}

/**
 * 获取指定类型的建造事件
 * @param playerDoc
 * @param category
 * @returns {*}
 */
Utils.getMaterialEventByCategory = function(playerDoc, category){
	var theEvent = null
	_.some(playerDoc.materialEvents, function(event){
		if(_.isEqual(event.category, category)){
			theEvent = event
			return true
		}
	})
	return theEvent
}

/**
 * 检查需要治疗的伤兵数据是否合法
 * @param playerDoc
 * @param soldiers
 * @returns {boolean}
 */
Utils.isTreatSoldierLegal = function(playerDoc, soldiers){
	if(soldiers.length == 0) return false
	return _.every(soldiers, function(soldier){
		var name = soldier.name
		var count = soldier.count
		if(!_.isString(name) || !_.isNumber(count)) return false
		count = Math.floor(count)
		if(count <= 0) return false
		return _.isNumber(playerDoc.woundedSoldiers[name]) && playerDoc.woundedSoldiers[name] >= count
	})
}

/**
 * 检查强化龙装备是否合法
 * @param playerDoc
 * @param equipments
 * @returns {boolean}
 */
Utils.isEnhanceDragonEquipmentLegal = function(playerDoc, equipments){
	if(equipments.length == 0) return false
	return _.every(equipments, function(equipment){
		var equipmentName = equipment.name
		var count = equipment.count
		if(!_.isString(equipmentName) || !_.isNumber(count)) return false
		count = Math.floor(count)
		if(count <= 0) return false
		return _.isNumber(playerDoc.dragonEquipments[equipmentName]) && playerDoc.dragonEquipments[equipmentName] >= count
	})
}

/**
 * 更新玩家在联盟的属性
 * @param playerDoc
 * @param allianceDoc
 * @returns {*}
 */
Utils.updateMyPropertyInAlliance = function(playerDoc, allianceDoc){
	var theMember = null
	_.some(allianceDoc.members, function(member){
		if(_.isEqual(member.id, playerDoc._id)){
			member.name = playerDoc.basicInfo.name
			member.icon = playerDoc.basicInfo.icon
			member.level = playerDoc.basicInfo.level
			member.power = playerDoc.basicInfo.power
			member.kill = playerDoc.basicInfo.kill
			member.loyalty = playerDoc.allianceInfo.loyalty
			member.lastLoginTime = playerDoc.countInfo.lastLoginTime
			member.allianceExp.woodExp = playerDoc.allianceInfo.woodExp
			member.allianceExp.stoneExp = playerDoc.allianceInfo.stoneExp
			member.allianceExp.ironExp = playerDoc.allianceInfo.ironExp
			member.allianceExp.foodExp = playerDoc.allianceInfo.foodExp
			member.allianceExp.coinExp = playerDoc.allianceInfo.coinExp
			theMember = member
		}
	})
	return theMember
}

/**
 * 刷新联盟属性
 * @param allianceDoc
 */
Utils.refreshAllianceBasicInfo = function(allianceDoc){
	var totalPower = 0
	var totalKill = 0
	_.each(allianceDoc.members, function(member){
		totalPower += member.power
		totalKill += member.kill
	})
	allianceDoc.basicInfo.power = totalPower
	allianceDoc.basicInfo.kill = totalKill
}

/**
 * 刷新联盟感知力
 * @param allianceDoc
 */
Utils.refreshAlliancePerception = function(allianceDoc){
	allianceDoc.basicInfo.perception = DataUtils.getAlliancePerception(allianceDoc)
	allianceDoc.basicInfo.perceptionRefreshTime = Date.now()
}

/**
 * 联盟是否存在此玩家
 * @param allianceDoc
 * @param playerId
 * @returns {boolean}
 */
Utils.isAllianceHasMember = function(allianceDoc, playerId){
	return _.some(allianceDoc.members, function(member){
		return _.isEqual(member.id, playerId)
	})
}

/**
 * 根据玩家Id获取联盟成员数据
 * @param allianceDoc
 * @param memberId
 */
Utils.getAllianceMemberById = function(allianceDoc, memberId){
	var theMember = null
	_.some(allianceDoc.members, function(member){
		if(_.isEqual(member.id, memberId)){
			theMember = member
			return true
		}
	})
	return theMember
}

/**
 * 根据村落ID查找村落
 * @param allianceDoc
 * @param villageId
 * @returns {*}
 */
Utils.getAllianceVillageById = function(allianceDoc, villageId){
	var theVillage = null
	_.some(allianceDoc.villages, function(village){
		if(_.isEqual(village.id, villageId)){
			theVillage = village
			return true
		}
	})
	return theVillage
}

/**
 * 是否有对某联盟的有效申请存在
 * @param playerDoc
 * @param allianceId
 * @returns {boolean}
 */
Utils.hasPendingRequestEventToAlliance = function(playerDoc, allianceId){
	var has = false
	_.each(playerDoc.requestToAllianceEvents, function(event){
		if(_.isEqual(event.id, allianceId)){
			has = true
		}
	})
	return has
}

/**
 * 获取针对某个联盟的申请信息
 * @param playerDoc
 * @param allianceId
 * @returns {*}
 */
Utils.getRequestToAllianceEvent = function(playerDoc, allianceId){
	var theEvent = null
	_.each(playerDoc.requestToAllianceEvents, function(event){
		if(_.isEqual(event.id, allianceId)){
			theEvent = event
		}
	})
	return theEvent
}

/**
 * 获取联盟邀请事件
 * @param playerDoc
 * @param allianceId
 * @returns {*}
 */
Utils.getInviteToAllianceEvent = function(playerDoc, allianceId){
	var theEvent = null
	_.each(playerDoc.inviteToAllianceEvents, function(event){
		if(_.isEqual(event.id, allianceId)){
			theEvent = event
		}
	})
	return theEvent
}

/**
 * 获取联盟中某人的申请信息
 * @param allianceDoc
 * @param playerId
 * @returns {*}
 */
Utils.getPlayerRequestEventAtAlliance = function(allianceDoc, playerId){
	var theEvent = null
	_.each(allianceDoc.joinRequestEvents, function(event){
		if(_.isEqual(event.id, playerId)){
			theEvent = event
		}
	})
	return theEvent
}

/**
 * 添加联盟申请事件
 * @param allianceDoc
 * @param playerDoc
 * @param requestTime
 * @return {*}
 */
Utils.addAllianceRequestEvent = function(allianceDoc, playerDoc, requestTime){
	var event = {
		id:playerDoc._id,
		name:playerDoc.basicInfo.name,
		icon:playerDoc.basicInfo.icon,
		level:playerDoc.basicInfo.level,
		power:playerDoc.basicInfo.power,
		requestTime:requestTime
	}
	allianceDoc.joinRequestEvents.push(event)
	return event
}

/**
 * 添加玩家对联盟的申请事件
 * @param playerDoc
 * @param allianceDoc
 * @param requestTime
 * @return {*}
 */
Utils.addPlayerJoinAllianceEvent = function(playerDoc, allianceDoc, requestTime){
	var event = {
		id:allianceDoc._id,
		name:allianceDoc.basicInfo.name,
		tag:allianceDoc.basicInfo.tag,
		flag:allianceDoc.basicInfo.flag,
		level:allianceDoc.basicInfo.level,
		members:allianceDoc.members.length,
		power:allianceDoc.basicInfo.power,
		language:allianceDoc.basicInfo.language,
		kill:allianceDoc.basicInfo.kill,
		status:Consts.AllianceJoinStatus.Pending,
		requestTime:requestTime
	}
	playerDoc.requestToAllianceEvents.push(event)
	return event
}

/**
 * 添加联盟对玩家的邀请事件
 * @param inviterId
 * @param playerDoc
 * @param allianceDoc
 * @param inviteTime
 * @return {*}
 */
Utils.addPlayerInviteAllianceEvent = function(inviterId, playerDoc, allianceDoc, inviteTime){
	var event = {
		id:allianceDoc._id,
		name:allianceDoc.basicInfo.name,
		tag:allianceDoc.basicInfo.tag,
		flag:allianceDoc.basicInfo.flag,
		terrain:allianceDoc.basicInfo.terrain,
		level:allianceDoc.basicInfo.level,
		members:allianceDoc.members.length,
		power:allianceDoc.basicInfo.power,
		language:allianceDoc.basicInfo.language,
		kill:allianceDoc.basicInfo.kill,
		inviterId:inviterId,
		inviteTime:inviteTime
	}
	playerDoc.inviteToAllianceEvents.push(event)
	return event
}

/**
 * 是否有对某联盟的邀请存在
 * @param playerDoc
 * @param allianceDoc
 * @returns {boolean}
 */
Utils.hasInviteEventToAlliance = function(playerDoc, allianceDoc){
	return _.some(playerDoc.inviteToAllianceEvents, function(event){
		return _.isEqual(event.id, allianceDoc._id)
	})
}

/**
 * 获取已经使用的建筑建造队列
 * @param playerDoc
 * @returns {number}
 */
Utils.getUsedBuildQueue = function(playerDoc){
	var usedBuildQueue = 0
	usedBuildQueue += playerDoc.buildingEvents.length
	usedBuildQueue += playerDoc.houseEvents.length
	usedBuildQueue += playerDoc.towerEvents.length
	usedBuildQueue += playerDoc.wallEvents.length

	return usedBuildQueue
}

/**
 * 获取最先完成的建筑建造事件
 * @param playerDoc
 * @returns {*}
 */
Utils.getSmallestBuildEvent = function(playerDoc){
	var eventObj = null
	_.each(playerDoc.buildingEvents, function(theEvent){
		if(eventObj == null || eventObj.event.finishTime > theEvent){
			eventObj = {
				eventType:"buildingEvents",
				event:theEvent
			}
		}
	})
	_.each(playerDoc.houseEvents, function(theEvent){
		if(eventObj == null || eventObj.event.finishTime > theEvent){
			eventObj = {
				eventType:"houseEvents",
				event:theEvent
			}
		}
	})
	_.each(playerDoc.towerEvents, function(theEvent){
		if(eventObj == null || eventObj.event.finishTime > theEvent){
			eventObj = {
				eventType:"towerEvents",
				event:theEvent
			}
		}
	})
	_.each(playerDoc.wallEvents, function(theEvent){
		if(eventObj == null || eventObj.event.finishTime > theEvent){
			eventObj = {
				eventType:"wallEvents",
				event:theEvent
			}
		}
	})

	return eventObj
}

/**
 * 获取玩家建造事件
 * @param playerDoc
 * @param eventType
 * @param eventId
 * @returns {*}
 */
Utils.getPlayerBuildEvent = function(playerDoc, eventType, eventId){
	if(_.isEqual(eventType, Consts.AllianceHelpEventType.Building)){
		return this.getEventById(playerDoc.buildingEvents, eventId)
	}else if(_.isEqual(eventType, Consts.AllianceHelpEventType.House)){
		return this.getEventById(playerDoc.houseEvents, eventId)
	}else if(_.isEqual(eventType, Consts.AllianceHelpEventType.Tower)){
		return this.getEventById(playerDoc.towerEvents, eventId)
	}else if(_.isEqual(eventType, Consts.AllianceHelpEventType.Wall)){
		return this.getEventById(playerDoc.wallEvents, eventId)
	}
	return null
}

/**
 * 根据Id获取事件
 * @param events
 * @param id
 * @returns {*}
 */
Utils.getEventById = function(events, id){
	var theEvent = null
	_.some(events, function(event){
		if(_.isEqual(event.id, id)){
			theEvent = event
			return true
		}
	})
	return theEvent
}

/**
 * 根据协助加速类型和建造事件获取建筑
 * @param playerDoc
 * @param eventType
 * @param buildEvent
 * @returns {*}
 */
Utils.getBuildingByEventTypeAndBuildEvent = function(playerDoc, eventType, buildEvent){
	if(_.isEqual(eventType, Consts.AllianceHelpEventType.Building)){
		return playerDoc.buildings["location_" + buildEvent.location]
	}else if(_.isEqual(eventType, Consts.AllianceHelpEventType.House)){
		var building = playerDoc.buildings["location_" + buildEvent.buildingLocation]
		var theHouse = null
		_.some(building.houses, function(house){
			if(_.isEqual(house.location, buildEvent.houseLocation)){
				theHouse = house
				return true
			}
		})
		return theHouse
	}else if(_.isEqual(eventType, Consts.AllianceHelpEventType.Tower)){
		return playerDoc.towers["location_" + buildEvent.location]
	}else if(_.isEqual(eventType, Consts.AllianceHelpEventType.Wall)){
		return playerDoc.wall
	}
	return null
}

/**
 * 根据帮助时间类型获取玩家时间队列
 * @param playerDoc
 * @param eventType
 * @returns {*}
 */
Utils.getPlayerBuildEvents = function(playerDoc, eventType){
	if(_.isEqual(eventType, Consts.AllianceHelpEventType.Building)){
		return {buildingEvents:playerDoc.buildingEvents}
	}else if(_.isEqual(eventType, Consts.AllianceHelpEventType.House)){
		return {houseEvents:playerDoc.houseEvents}
	}else if(_.isEqual(eventType, Consts.AllianceHelpEventType.Tower)){
		return {towerEvents:towerEventsplayerDoc.towerEvents}
	}else if(_.isEqual(eventType, Consts.AllianceHelpEventType.Wall)){
		return {wallEvents:playerDoc.wallEvents}
	}
	return null
}

/**
 * 为联盟添加帮助事件
 * @param allianceDoc
 * @param playerDoc
 * @param buildingLevel
 * @param helpEventType
 * @param buildingName
 * @param eventId
 * @returns {*}
 */
Utils.addAllianceHelpEvent = function(allianceDoc, playerDoc, buildingLevel, helpEventType, buildingName, eventId){
	var keep = playerDoc.buildings["location_1"]
	var event = {
		id:playerDoc._id,
		name:playerDoc.basicInfo.name,
		vipExp:playerDoc.basicInfo.vipExp,
		helpEventType:helpEventType,
		buildingName:buildingName,
		buildingLevel:buildingLevel,
		eventId:eventId,
		maxHelpCount:keep.level,
		helpedMembers:[]
	}
	allianceDoc.helpEvents.push(event)
	return event
}

/**
 * 更新玩家资源数据
 * @param doc
 */
Utils.refreshPlayerResources = function(doc){
	var resources = DataUtils.getPlayerResources(doc)
	_.each(resources, function(value, key){
		doc.resources[key] = value
	})
	doc.basicInfo.resourceRefreshTime = Date.now()
}

/**
 * 刷新玩家兵力信息
 * @param doc
 */
Utils.refreshPlayerPower = function(doc){
	var power = DataUtils.getPlayerPower(doc)
	doc.basicInfo.power = power
}

/**
 * 发送系统邮件
 * @param playerDoc
 * @param playerData
 * @param titleKey
 * @param titleArgs
 * @param contentKey
 * @param contentArgs
 * @returns {*}
 */
Utils.sendSystemMail = function(playerDoc, playerData, titleKey, titleArgs, contentKey, contentArgs){
	var language = playerDoc.basicInfo.language
	var title = titleKey[language]
	var content = contentKey[language]
	if(!_.isString(title)){
		return Promise.reject(new Error("title 本地化不存在"))
	}
	if(!_.isString(content)){
		return Promise.reject(new Error("content 本地化不存在"))
	}
	if(titleArgs.length > 0){
		title = sprintf.vsprintf(title, titleArgs)
	}
	if(contentArgs.length > 0){
		content = sprintf.vsprintf(content, contentArgs)
	}

	var mail = {
		id:ShortId.generate(),
		title:title,
		fromId:"__system",
		fromName:"__system",
		fromAllianceTag:"",
		sendTime:Date.now(),
		content:content,
		isRead:false,
		isSaved:false
	}
	playerData.__mails = []
	if(playerDoc.mails.length >= Define.PlayerMailsMaxSize){
		var willRemovedMail = this.getPlayerFirstUnSavedMail(playerDoc)
		this.removeItemInArray(playerDoc.mails, willRemovedMail)
		playerData.__mails.push({
			type:Consts.DataChangedType.Remove,
			data:willRemovedMail
		})
		if(!!willRemovedMail.isSaved){
			playerData.__savedMails = [{
				type:Consts.DataChangedType.Remove,
				data:willRemovedMail
			}]
		}
	}
	playerDoc.mails.push(mail)
	playerData.__mails.push({
		type:Consts.DataChangedType.Add,
		data:mail
	})

	return mail
}

/**
 * 根据事件类型和Index获取联盟帮助事件
 * @param allianceDoc
 * @param eventId
 * @returns {*}
 */
Utils.getAllianceHelpEvent = function(allianceDoc, eventId){
	var theEvent = null
	_.some(allianceDoc.helpEvents, function(event){
		if(_.isEqual(event.eventId, eventId)){
			theEvent = event
			return true
		}
	})
	return theEvent
}

/**
 * 根据邮件Id获取邮件
 * @param playerDoc
 * @param mailId
 * @returns {*}
 */
Utils.getPlayerMailById = function(playerDoc, mailId){
	var theMail = null
	_.some(playerDoc.mails, function(mail){
		if(_.isEqual(mail.id, mailId)){
			theMail = mail
			return true
		}
	})
	return theMail
}

/**
 * 根据战报Id获取战报
 * @param playerDoc
 * @param reportId
 * @returns {*}
 */
Utils.getPlayerReportById = function(playerDoc, reportId){
	for(var i = 0; i < playerDoc.reports.length; i++){
		var report = playerDoc.reports[i]
		if(_.isEqual(report.id, reportId)) return report
	}
	return null
}

/**
 * 获取第一份未保存的邮件
 * @param playerDoc
 * @returns {*}
 */
Utils.getPlayerFirstUnSavedMail = function(playerDoc){
	for(var i = 0; i < playerDoc.mails.length; i++){
		var mail = playerDoc.mails[i]
		if(!mail.isSaved){
			return mail
		}
	}
	return playerDoc.mails[0]
}

/**
 * 获取第一份未保存的战报
 * @param playerDoc
 * @returns {*}
 */
Utils.getPlayerFirstUnSavedReport = function(playerDoc){
	for(var i = 0; i < playerDoc.reports.length; i++){
		var report = playerDoc.reports[i]
		if(!report.isSaved){
			return report
		}
	}
	return playerDoc.reports[0]
}

/**
 * 获取升级建筑后,获取玩家被修改的数据
 * @param playerDoc
 * @param playerData
 */
Utils.refreshBuildingEventsData = function(playerDoc, playerData){
	playerData.resources = playerDoc.resources
	playerData.materials = playerDoc.materials
	playerData.basicInfo = playerDoc.basicInfo
	playerData.buildings = playerDoc.buildings
	playerData.towers = playerDoc.towers
	playerData.wall = playerDoc.wall
	playerData.buildingEvents = playerDoc.buildingEvents
	playerData.houseEvents = playerDoc.houseEvents
	playerData.towerEvents = playerDoc.towerEvents
	playerData.wallEvents = playerDoc.wallEvents
}

/**
 * 获取联盟盟主信息
 * @param allianceDoc
 * @returns {*}
 */
Utils.getAllianceArchon = function(allianceDoc){
	for(var i = 0; i < allianceDoc.members.length; i++){
		var member = allianceDoc.members[i]
		if(_.isEqual(member.title, Consts.AllianceTitle.Archon)){
			return member
		}
	}
	return null
}

/**
 * 添加联盟事件
 * @param allianceDoc
 * @param category
 * @param type
 * @param key
 * @param params
 * @returns {{category: *, type: *, key: *, time: number, params: *}}
 */
Utils.AddAllianceEvent = function(allianceDoc, category, type, key, params){
	var event = {
		category:category,
		type:type,
		key:key,
		time:Date.now(),
		params:params
	}

	if(allianceDoc.events.length >= Define.AllianceEventsMaxSize){
		allianceDoc.events.shift()
	}
	allianceDoc.events.push(event)
	return event
}

/**
 * 为联盟添加成员
 * @param allianceDoc
 * @param playerDoc
 * @param title
 * @param rect
 * @return {*}
 */
Utils.addAllianceMember = function(allianceDoc, playerDoc, title, rect){
	var member = {
		id:playerDoc._id,
		name:playerDoc.basicInfo.name,
		icon:playerDoc.basicInfo.icon,
		level:playerDoc.basicInfo.level,
		keepLevel:playerDoc.buildings["location_1"].level,
		wallLevel:playerDoc.wall.level,
		wallHp:playerDoc.resources.wallHp,
		status:Consts.PlayerStatus.Normal,
		helpedByTroopsCount:0,
		power:playerDoc.basicInfo.power,
		kill:playerDoc.basicInfo.kill,
		loyalty:playerDoc.allianceInfo.loyalty,
		lastLoginTime:playerDoc.countInfo.lastLoginTime,
		title:title,
		donateStatus:{
			wood:1,
			stone:1,
			iron:1,
			food:1,
			coin:1,
			gem:1
		},
		allianceExp:{
			woodExp:playerDoc.allianceInfo.woodExp,
			stoneExp:playerDoc.allianceInfo.stoneExp,
			ironExp:playerDoc.allianceInfo.ironExp,
			foodExp:playerDoc.allianceInfo.foodExp,
			coinExp:playerDoc.allianceInfo.coinExp
		},
		location:{
			x:rect.x,
			y:rect.y
		},
		isProtected:false
	}
	allianceDoc.members.push(member)
	return member
}

/**
 * 获取联盟成员当前捐赠等级
 * @param memberDocInAlliance
 * @param donateType
 * @returns {*}
 */
Utils.getAllianceMemberDonateLevelByType = function(memberDocInAlliance, donateType){
	return memberDocInAlliance.donateStatus[donateType]
}

/**
 * 获取可用的地图坐标
 * @param mapObjects
 * @param width
 * @param height
 * @returns {{x: *, y: *, width: *, height: *}}
 */
Utils.getFreePointInAllianceMap = function(mapObjects, width, height){
	var map = MapUtils.buildMap(mapObjects)
	var rect = MapUtils.getRect(map, width, height)
	return rect
}

/**
 * 根据坐标获取联盟地图中的对象
 * @param allianceDoc
 * @param location
 * @returns {*}
 */
Utils.getAllianceMapObjectByLocation = function(allianceDoc, location){
	for(var i = 0; i < allianceDoc.mapObjects.length; i++){
		var mapObject = allianceDoc.mapObjects[i]
		if(_.isEqual(mapObject.location, location)) return mapObject
	}
	return null
}

/**
 * 根据Id获取联盟地图中的对象
 * @param allianceDoc
 * @param objectId
 * @returns {*}
 */
Utils.getAllianceMapObjectById = function(allianceDoc, objectId){
	for(var i = 0; i < allianceDoc.mapObjects.length; i++){
		var mapObject = allianceDoc.mapObjects[i]
		if(_.isEqual(mapObject.id, objectId)) return mapObject
	}
	return null
}

/**
 * 创建联盟建筑对象
 * @param buildingType
 * @param rect
 * @returns {{type: *, location: {x: (rect.x|*), y: (rect.y|*)}}}
 */
Utils.createAllianceMapObject = function(buildingType, rect){
	var object = {
		id:ShortId.generate(),
		type:buildingType,
		location:{
			x:rect.x,
			y:rect.y
		}
	}
	return object
}

/**
 * 联盟某个村落是否真正被采集
 * @param allianceDoc
 * @param villageId
 * @returns {boolean}
 */
Utils.isAllianceVillageBeingCollect = function(allianceDoc, villageId){
	for(var i = 0; i < allianceDoc.villageEvents.length; i++){
		var collectEvent = allianceDoc.collectEvents[i]
		if(_.isEqual(collectEvent.villageId, villageId)) return true
	}
	return false
}

/**
 * 联盟某个圣地事件是否已经激活
 * @param allianceDoc
 * @param stageName
 * @returns {boolean}
 */
Utils.isAllianceShrineStageActivated = function(allianceDoc, stageName){
	for(var i = 0; i < allianceDoc.shrineEvents.length; i++){
		var event = allianceDoc.shrineEvents[i]
		if(_.isEqual(event.stageName, stageName)) return true
	}
	return false
}

/**
 * 获取联盟指定类型的建筑的数量类型
 * @param allianceDoc
 * @param decorateType
 * @returns {number}
 */
Utils.getAllianceDecorateObjectCountByType = function(allianceDoc, decorateType){
	var count = 0
	_.each(allianceDoc.mapObjects, function(mapObject){
		if(_.isEqual(mapObject.type, decorateType)) count++
	})

	return count
}

/**
 * 行军派出的士兵数量是否合法
 * @param playerDoc
 * @param soldiers
 * @returns {boolean}
 */
Utils.isPlayerMarchSoldiersLegal = function(playerDoc, soldiers){
	if(soldiers.length == 0) return false
	for(var i = 0; i < soldiers.length; i++){
		var soldier = soldiers[i]
		var soldierName = soldier.name
		var count = soldier.count
		if(!_.isString(soldierName) || !_.isNumber(count)) return false
		count = Math.floor(count)
		if(count <= 0) return false
		if(!playerDoc.soldiers[soldierName] || playerDoc.soldiers[soldierName] < count) return false
	}
	return true
}

/**
 * 重置玩家部队战斗数据
 * @param soldiersForFight
 * @param fightRoundData
 */
Utils.resetFightSoldiersByFightResult = function(soldiersForFight, fightRoundData){
	var soldiersWillRemoved = []
	_.each(fightRoundData, function(fightResult){
		var soldierForFight = _.find(soldiersForFight, function(soldierForFight){
			return _.isEqual(soldierForFight.name, fightResult.soldierName)
		})
		soldierForFight.totalCount -= fightResult.solderDamagedCount
		soldierForFight.currentCount = soldierForFight.totalCount
		soldierForFight.morale = 100
		if(soldierForFight.totalCount <= 0) soldiersWillRemoved.push(soldierForFight)
	})
	this.removeItemsInArray(soldiersForFight, soldiersWillRemoved)
}

/**
 * 从联盟圣地事件中获取玩家龙的信息
 * @param playerId
 * @param event
 * @returns {*}
 */
Utils.getPlayerDragonDataFromAllianceShrineStageEvent = function(playerId, event){
	for(var i = 0; i < event.playerTroops.length; i++){
		var playerTroop = event.playerTroops[i]
		if(_.isEqual(playerTroop.id, playerId)) return playerTroop.dragon
	}
	return null
}

/**
 * 圣地指定关卡是否已经有玩家部队存在
 * @param allianceDoc
 * @param shrineEvent
 * @param playerId
 * @returns {boolean}
 */
Utils.isPlayerHasTroopMarchToAllianceShrineStage = function(allianceDoc, shrineEvent, playerId){
	for(var i = 0; i < allianceDoc.attackMarchEvents.length; i++){
		var marchEvent = allianceDoc.attackMarchEvents[i]
		if(_.isEqual(marchEvent.marchType, Consts.AllianceMarchType.Shrine) && _.isEqual(marchEvent.defenceShrineData.shrineEventId, shrineEvent.id) && _.isEqual(marchEvent.attackPlayerData.id, playerId)) return true
	}
	for(i = 0; i < shrineEvent.playerTroops.length; i++){
		var playerTroop = shrineEvent.playerTroops[i]
		if(_.isEqual(playerTroop.id, playerId)) return true
	}
	return false
}

/**
 * 查看玩家是否已经对联盟某玩家协防
 * @param allianceDoc
 * @param playerDoc
 * @param targetPlayerId
 * @returns {boolean}
 */
Utils.isPlayerHasTroopHelpedPlayer = function(allianceDoc, playerDoc, targetPlayerId){
	for(var i = 0; i < allianceDoc.attackMarchEvents.length; i++){
		var marchEvent = allianceDoc.helpDefenceMarchEvents[i]
		if(_.isEqual(marchEvent.marchType, Consts.AllianceMarchType.HelpDefence) && _.isEqual(marchEvent.attackPlayerData.id, playerDoc._id) && _.isEqual(marchEvent.defencePlayerData.id, targetPlayerId)) return true
	}
	var playerTroop = null
	for(i = 0; i < playerDoc.helpToTroops.length; i++){
		playerTroop = playerDoc.helpToTroops[i]
		if(_.isEqual(playerTroop.targetPlayerData.id, targetPlayerId)) return true
	}
	return false
}

/**
 * 协助某指定玩家的部队的数量
 * @param allianceDoc
 * @param playerDoc
 * @returns {number}
 */
Utils.getAlliancePlayerBeHelpedTroopsCount = function(allianceDoc, playerDoc){
	var count = 0
	for(var i = 0; i < allianceDoc.attackMarchEvents.length; i++){
		var marchEvent = allianceDoc.attackMarchEvents[i]
		if(_.isEqual(marchEvent.marchType, Consts.AllianceMarchType.HelpDefence) && _.isEqual(marchEvent.defencePlayerData.id, playerDoc._id)) count += 1
	}
	count += playerDoc.helpedByTroops.length
	return count
}

/**
 * 玩家是否有协防部队驻扎在某玩家城市中
 * @param playerDoc
 * @param targetPlayerId
 * @returns {boolean}
 */
Utils.isPlayerHasHelpedTroopInAllianceMember = function(playerDoc, targetPlayerId){
	for(var i = 0; i < playerDoc.helpToTroops.length; i++){
		var troop = playerDoc.helpToTroops[i]
		if(_.isEqual(troop.beHelpedPlayerData.id, targetPlayerId)) return true
	}
	return false
}

/**
 * 获取联盟某关卡的历史星级数据
 * @param allianceDoc
 * @param stageName
 * @returns {*}
 */
Utils.getAllianceShrineStageData = function(allianceDoc, stageName){
	for(var i = 0; i < allianceDoc.shrineDatas.length; i++){
		var stageData = allianceDoc.shrineDatas[i]
		if(_.isEqual(stageData.stageName, stageName)){
			return stageData
		}
	}
	return null
}

/**
 * 获取所有部队平均战斗力
 * @param playerTroopsForFight
 * @returns {number}
 */
Utils.getPlayerTroopsAvgPower = function(playerTroopsForFight){
	var totalPower = 0
	_.each(playerTroopsForFight, function(playerTroopForFight){
		_.each(playerTroopForFight.soldiersForFight, function(soldierForFight){
			totalPower += soldierForFight.power * soldierForFight.totalCount
		})
	})
	var avgPower = playerTroopsForFight.length > 0 ? Math.floor(totalPower / playerTroopsForFight.length) : 0
	return avgPower
}

/**
 * 修复联盟圣地战战报中的未参战的玩家的数据
 * @param playerTroops
 * @param playerDatas
 * @return {*}
 */
Utils.fixAllianceShrineStagePlayerData = function(playerTroops, playerDatas){
	var playerIds = {}
	_.each(playerTroops, function(playerTroop){
		playerIds[playerTroop.id] = playerTroop.name
	})
	_.each(playerDatas, function(playerData){
		delete playerIds[playerData.id]
	})
	_.each(playerIds, function(playerName, playerId){
		var playerData = {
			id:playerId,
			name:playerName,
			kill:0,
			rewards:[]
		}
		playerDatas.push(playerData)
	})
	return playerDatas
}

/**
 * 联盟战匹配成功后,创建初始数据结构
 * @param attackAllianceDoc
 * @param defenceAllianceDoc
 * @param prepareTime
 */
Utils.prepareForAllianceFight = function(attackAllianceDoc, defenceAllianceDoc, prepareTime){
	var now = Date.now()
	attackAllianceDoc.basicInfo.status = Consts.AllianceStatus.Prepare
	attackAllianceDoc.basicInfo.statusStartTime = now
	attackAllianceDoc.basicInfo.statusFinishTime = prepareTime
	attackAllianceDoc.allianceFight = {
		activeBy:attackAllianceDoc._id,
		mergeStyle:Consts.AllianceMergePosition[(Math.random() * 4) << 0],
		attackAllianceId:attackAllianceDoc._id,
		defenceAllianceId:defenceAllianceDoc._id,
		attackPlayerKills:[],
		attackAllianceCountData:{
			kill:0,
			routCount:0,
			strikeCount:0,
			strikeSuccessCount:0,
			attackCount:0,
			attackSuccessCount:0
		},
		defencePlayerKills:[],
		defenceAllianceCountData:{
			kill:0,
			routCount:0,
			strikeCount:0,
			strikeSuccessCount:0,
			attackCount:0,
			attackSuccessCount:0
		}
	}
	defenceAllianceDoc.basicInfo.status = Consts.AllianceStatus.Prepare
	defenceAllianceDoc.basicInfo.statusStartTime = now
	defenceAllianceDoc.basicInfo.statusFinishTime = prepareTime
	defenceAllianceDoc.allianceFight = attackAllianceDoc.allianceFight
}

/**
 * 更新联盟统计数据
 * @param attackAllianceDoc
 * @param defenceAllianceDoc
 */
Utils.updateAllianceCountInfo = function(attackAllianceDoc, defenceAllianceDoc){
	var attackAllianceCountInfo = attackAllianceDoc.countInfo
	var defenceAllianceCountInfo = defenceAllianceDoc.countInfo
	var allianceFight = attackAllianceDoc.allianceFight
	attackAllianceCountInfo.kill += allianceFight.attackAllianceCountData.kill
	attackAllianceCountInfo.beKilled += allianceFight.defenceAllianceCountData.kill
	attackAllianceCountInfo.routCount += allianceFight.attackAllianceCountData.routCount
	attackAllianceCountInfo.winCount += allianceFight.attackAllianceCountData.kill >= allianceFight.defenceAllianceCountData.kill ? 1 : 0
	attackAllianceCountInfo.failedCount += allianceFight.attackAllianceCountData.kill >= allianceFight.defenceAllianceCountData.kill ? 0 : 1
	defenceAllianceCountInfo.kill += allianceFight.defenceAllianceCountData.kill
	defenceAllianceCountInfo.beKilled += allianceFight.attackAllianceCountData.kill
	defenceAllianceCountInfo.routCount += allianceFight.defenceAllianceCountData.routCount
	defenceAllianceCountInfo.winCount += allianceFight.defenceAllianceCountData.kill >= allianceFight.attackAllianceCountData.kill ? 1 : 0
	defenceAllianceCountInfo.failedCount += allianceFight.defenceAllianceCountData.kill >= allianceFight.attackAllianceCountData.kill ? 0 : 1
}

/**
 * 获取玩家正在进行防守的龙
 * @param playerDoc
 * @returns {*}
 */
Utils.getPlayerDefenceDragon = function(playerDoc){
	var dragon = null
	_.each(playerDoc.dragons, function(theDragon){
		if(_.isEqual(theDragon.status, Consts.DragonStatus.Defence)) dragon = theDragon
	})
	return dragon
}

/**
 * 为玩家添加战报
 * @param playerDoc
 * @param playerData
 * @param report
 */
Utils.addPlayerReport = function(playerDoc, playerData, report){
	if(!_.isArray(playerData.__reports)) playerData.__reports = []
	if(playerDoc.reports.length >= Define.PlayerReportsMaxSize){
		var willRemovedReport = this.getPlayerFirstUnSavedReport(playerDoc)
		this.removeItemInArray(playerDoc.reports, willRemovedReport)
		playerData.__reports.push({
			type:Consts.DataChangedType.Remove,
			data:willRemovedReport
		})
		if(!!willRemovedReport.isSaved){
			playerData.__savedReports = [{
				type:Consts.DataChangedType.Remove,
				data:willRemovedMail
			}]
		}
	}
	playerDoc.reports.push(report)
	playerData.__reports.push({
		type:Consts.DataChangedType.Add,
		data:report
	})
}

/**
 * 添加联盟战历史记录战报
 * @param allianceDoc
 * @param allianceData
 * @param report
 */
Utils.addAllianceFightReport = function(allianceDoc, allianceData, report){
	var willRemovedReport = null
	if(!_.isArray(allianceData.__allianceFightReports))allianceData.__allianceFightReports = []
	if(allianceDoc.allianceFightReports.length >= Define.AllianceFightReportsMaxSize){
		willRemovedReport = allianceDoc.allianceFightReports.shift()
		allianceData.__allianceFightReports.push({
			type:Consts.DataChangedType.Remove,
			data:willRemovedReport
		})
	}
	allianceDoc.allianceFightReports.push(report)
	allianceData.__allianceFightReports.push({
		type:Consts.DataChangedType.Add,
		data:report
	})
}

/**
 * 获取联盟
 * @param allianceDoc
 * @return {*}
 */
Utils.getAllianceViewData = function(allianceDoc){
	var viewData = {}
	viewData._id = allianceDoc._id
	_.each(Consts.AllianceViewDataKeys, function(key){
		viewData[key] = allianceDoc[key]
	})
	return viewData
}

/**
 * 创建敌对联盟修改后的必要数据
 * @param allianceData
 * @param enemyAllianceData
 */
Utils.putAllianceDataToEnemyAllianceData = function(allianceData, enemyAllianceData){
	enemyAllianceData.enemyAllianceDoc = {}
	_.forEach(Consts.AllianceViewDataKeys, function(key){
		if(_.isObject(allianceData[key])) enemyAllianceData.enemyAllianceDoc[key] = allianceData[key]
		var arrayKey = "__" + key
		if(_.isObject(allianceData[arrayKey])) enemyAllianceData.enemyAllianceDoc[arrayKey] = allianceData[arrayKey]
	})
}

/**
 * 如果联盟正在战斗,推送我方联盟相关数据变化到敌对联盟
 * @param allianceDoc
 * @param allianceData
 * @param pushFuncs
 * @param pushService
 */
Utils.pushAllianceDataToEnemyAllianceIfNeeded = function(allianceDoc, allianceData, pushFuncs, pushService){
	if(_.isObject(allianceDoc.allianceFight) && !_.isEmpty(allianceDoc.allianceFight)){
		var enemyAllianceData = {}
		this.putAllianceDataToEnemyAllianceData(allianceData, enemyAllianceData)
		if(!_.isEmpty(enemyAllianceData.enemyAllianceDoc)){
			var enemyAllianceId = _.isEqual(allianceDoc._id, allianceDoc.allianceFight.attackAllianceId) ? allianceDoc.allianceFight.defenceAllianceId : allianceDoc.allianceFight.attackAllianceId
			pushFuncs.push([pushService, pushService.onAllianceDataChangedAsync, enemyAllianceId, enemyAllianceData])
		}
	}
}

/**
 * 合并奖励
 * @param rewards
 * @param rewardsNew
 * @returns {*}
 */
Utils.mergeRewards = function(rewards, rewardsNew){
	_.each(rewardsNew, function(rewardNew){
		var reward = _.find(rewards, function(reward){
			return _.isEqual(reward.type, rewardNew.type) && _.isEqual(reward.name, rewardNew.name)
		})
		if(!_.isObject(reward)){
			reward = {
				type:rewardNew.type,
				name:rewardNew.name,
				count:0
			}
			rewards.push(reward)
		}
		reward.count += rewardNew.count
	})
	return rewards
}

/**
 * 合并兵力数据
 * @param soldiers
 * @param soldiersNew
 * @returns {*}
 */
Utils.mergeSoldiers = function(soldiers, soldiersNew){
	_.each(soldiersNew, function(soldierNew){
		var soldier = _.find(soldiers, function(soldier){
			return _.isEqual(soldier.name, soldierNew.name)
		})
		if(!_.isObject(soldier)){
			soldier = {
				name:soldierNew.name,
				count:0
			}
			soldiers.push(soldier)
		}
		soldier.count += soldierNew.count
	})
	return soldiers
}

/**
 * 玩家龙领导力是否足以派出指定的士兵
 * @param playerDoc
 * @param dragon
 * @param soldiers
 * @returns {boolean}
 */
Utils.isPlayerDragonLeadershipEnough = function(playerDoc, dragon, soldiers){
	var dragonMaxCitizen = DataUtils.getPlayerDragonMaxCitizen(playerDoc, dragon)
	var soldiersCitizen = DataUtils.getPlayerSoldiersCitizen(playerDoc, soldiers)
	return dragonMaxCitizen >= soldiersCitizen
}

/**
 * 根据坐标查询地图对象
 * @param allianceDoc
 * @param location
 * @returns {*}
 */
Utils.findAllianceMapObjectByLocation = function(allianceDoc, location){
	var object = _.find(allianceDoc.mapObjects, function(mapObject){
		return mapObject.location.x == location.x && mapObject.location.y == location.y
	})
	return object
}

/**
 * 根据坐标移除联盟地图对象
 * @param allianceDoc
 * @param location
 * @returns {*}
 */
Utils.removeAllianceMapObjectByLocation = function(allianceDoc, location){
	var mapObject = this.findAllianceMapObjectByLocation(allianceDoc, location)
	if(_.isObject(mapObject)) this.removeItemInArray(allianceDoc.mapObjects, mapObject)
	return mapObject
}