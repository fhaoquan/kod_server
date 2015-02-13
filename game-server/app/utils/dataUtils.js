"use strict"

/**
 * 和读取配置文件相关工具方法写在这里
 * Created by modun on 14-8-6.
 */

var _ = require("underscore")
var ShortId = require("shortid")

var Consts = require("../consts/consts")
var CommonUtils = require("./utils")
var LogicUtils = require("./logicUtils")
var GameDatas = require("../datas/GameDatas")
var BuildingLevelUp = GameDatas.BuildingLevelUp
var BuildingFunction = GameDatas.BuildingFunction
var HouseLevelUp = GameDatas.HouseLevelUp
var HouseReturn = GameDatas.HouseReturn
var HouseFunction = GameDatas.HouseFunction
var GemsPayment = GameDatas.GemsPayment
var Houses = GameDatas.Houses
var Buildings = GameDatas.Buildings
var PlayerInitData = GameDatas.PlayerInitData
var HouseInit = PlayerInitData.houses[1]
var Soldiers = GameDatas.Soldiers
var DragonEquipments = GameDatas.DragonEquipments
var Dragons = GameDatas.Dragons
var AllianceInit = GameDatas.AllianceInitData
var AllianceRight = AllianceInit.right
var AllianceBuilding = GameDatas.AllianceBuilding
var AllianceVillage = GameDatas.AllianceVillage
var AllianceShrine = GameDatas.AllianceShrine
var DailyQuests = GameDatas.DailyQuests
var ProductionTechs = GameDatas.ProductionTechs
var ProductionTechLevelUp = GameDatas.ProductionTechLevelUp
var MilitaryTechs = GameDatas.MilitaryTechs
var MilitaryTechLevelUp = GameDatas.MilitaryTechLevelUp
var Items = GameDatas.Items
var KillDropItems = GameDatas.KillDropItems
var Gacha = GameDatas.Gacha
var Activities = GameDatas.Activities
var StoreItems = GameDatas.StoreItems


var Utils = module.exports

/**
 * 购买资源
 * @param need
 * @param has
 * @returns {{gemUsed: number, totalBuy: {}}}
 */
Utils.buyResources = function(need, has){
	var gemUsed = 0
	var totalBuy = {}
	_.each(need, function(value, key){
		var config = GemsPayment[key]
		var required = null
		if(_.isNumber(has[key])){
			required = has[key] - value
		}else{
			required = -value
		}
		required = -required
		if(required > 0){
			var currentBuy = 0
			while(required > 0){
				for(var i = config.length; i >= 1; i--){
					var item = config[i]
					if(!_.isObject(item)) continue
					if(item.min < required){
						gemUsed += item.gem
						required -= item.resource
						currentBuy += item.resource
						break
					}
				}
			}
			totalBuy[key] = currentBuy
		}
	})

	return {gemUsed:gemUsed, totalBuy:totalBuy}
}

/**
 * 购买材料
 * @param need
 * @param has
 */
Utils.buyMaterials = function(need, has){
	var gemUsed = 0
	var totalBuy = {}
	var config = GemsPayment.material[1]
	_.each(need, function(value, key){
		var required = null
		if(_.isNumber(has[key])){
			required = has[key] - value
		}else{
			required = -value
		}
		required = -required
		if(required > 0){
			gemUsed += config[key] * required
			totalBuy[key] = required
		}
	})
	return {gemUsed:gemUsed, totalBuy:totalBuy}
}

/**
 * 根据所缺时间换算成宝石,并返回宝石数量
 * @param interval
 * @returns {number}
 */
Utils.getGemByTimeInterval = function(interval){
	var gem = 0
	var config = GemsPayment.time
	while(interval > 0){
		for(var i = config.length; i >= 1; i--){
			var item = config[i]
			if(!_.isObject(item)) continue
			if(item.min < interval){
				gem += item.gem
				interval -= item.speedup
				break
			}
		}
	}
	return gem
}

/**
 * 获取建筑升级时,需要的资源和道具
 * @param playerDoc
 * @param buildingType
 * @param buildingLevel
 * @returns {{resources: {wood: *, stone: *, iron: *, citizen: *}, materials: {blueprints: *, tools: *, tiles: *, pulley: *}, buildTime: *}}
 */
Utils.getPlayerBuildingUpgradeRequired = function(playerDoc, buildingType, buildingLevel){
	var buildingTimeBuff = this.getPlayerProductionTechBuff(playerDoc, "crane")
	var config = BuildingLevelUp[buildingType][buildingLevel]
	var required = {
		resources:{
			wood:config.wood,
			stone:config.stone,
			iron:config.iron,
			citizen:config.citizen
		},
		materials:{
			blueprints:config.blueprints,
			tools:config.tools,
			tiles:config.tiles,
			pulley:config.pulley
		},
		buildTime:LogicUtils.getTimeEfffect(config.buildTime, buildingTimeBuff)
	}

	return required
}

/**
 * 获取生产科技升级时,需要的资源和道具
 * @param playerDoc
 * @param techName
 * @param techLevel
 * @returns {{resources: {coin: *}, materials: {blueprints: *, tools: *, tiles: *, pulley: *}, buildTime: *}}
 */
Utils.getPlayerProductionTechUpgradeRequired = function(playerDoc, techName, techLevel){
	var config = ProductionTechLevelUp[techName][techLevel]
	var building = playerDoc.buildings.location_7
	var buildTime = null
	if(building.level > 0){
		var buildingConfig = BuildingFunction[building.type][building.level]
		buildTime = LogicUtils.getTimeEfffect(config.buildTime, buildingConfig.efficiency)
	}else{
		buildTime = config.buildTime
	}

	var required = {
		resources:{
			coin:config.coin
		},
		materials:{
			blueprints:config.blueprints,
			tools:config.tools,
			tiles:config.tiles,
			pulley:config.pulley
		},
		buildTime:buildTime
	}

	return required
}

/**
 * 获取军事科技升级时,需要的资源和道具
 * @param playerDoc
 * @param techName
 * @param techLevel
 * @returns {{resources: {coin: *}, materials: {trainingFigure: *, bowTarget: *, saddle: *, ironPart: *}, buildTime: *}}
 */
Utils.getPlayerMilitaryTechUpgradeRequired = function(playerDoc, techName, techLevel){
	var config = MilitaryTechLevelUp[techName][techLevel]
	var building = playerDoc.buildings.location_7
	var buildTime = null
	if(building.level > 0){
		var buildingConfig = BuildingFunction[building.type][building.level]
		buildTime = LogicUtils.getTimeEfffect(config.buildTime, buildingConfig.efficiency)
	}else{
		buildTime = config.buildTime
	}

	var required = {
		resources:{
			coin:config.coin
		},
		materials:{
			trainingFigure:config.trainingFigure,
			bowTarget:config.bowTarget,
			saddle:config.saddle,
			ironPart:config.ironPart
		},
		buildTime:buildTime
	}

	return required
}

/**
 * 获取士兵升级所需资源
 * @param soldierName
 * @param star
 * @returns {{resources: {coin: *}, buildTime: *}}
 */
Utils.getSoldierStarUpgradeRequired = function(soldierName, star){
	var config = Soldiers.normal[soldierName + "_" + star]
	var required = {
		resources:{
			coin:config.upgradeCoinNeed
		},
		upgradeTime:config.upgradeTimeSecondsNeed
	}

	return required
}

/**
 * 获取小屋升级时,需要的资源和道具
 * @param playerDoc
 * @param houseType
 * @param houseLevel
 * @returns {{resources: {wood: *, stone: *, iron: *, citizen: *}, materials: {blueprints: *, tools: *, tiles: *, pulley: *}, buildTime: *}}
 */
Utils.getPlayerHouseUpgradeRequired = function(playerDoc, houseType, houseLevel){
	var buildingTimeBuff = this.getPlayerProductionTechBuff(playerDoc, "crane")
	var houseUsed = this.getHouseUsedCitizen(houseType, houseLevel - 1)
	var config = HouseLevelUp[houseType][houseLevel]
	var required = {
		resources:{
			wood:config.wood,
			stone:config.stone,
			iron:config.iron,
			citizen:config.citizen - houseUsed
		},
		materials:{
			blueprints:config.blueprints,
			tools:config.tools,
			tiles:config.tiles,
			pulley:config.pulley
		},
		buildTime:LogicUtils.getTimeEfffect(config.buildTime, buildingTimeBuff)
	}

	return required
}

/**
 * 拆除小屋时,返还的资源
 * @param houseType
 * @param houseLevel
 * @returns {{wood: *, stone: *, iron: *, citizen: *}}
 */
Utils.getHouseDestroyReturned = function(houseType, houseLevel){
	var config = HouseReturn[houseType][houseLevel]
	var returned = {
		wood:config.wood,
		stone:config.stone,
		iron:config.iron,
		citizen:config.citizen
	}

	return returned
}

/**
 * 建筑是否达到最高等级
 * @param buildingLevel
 * @returns {boolean}
 */
Utils.isBuildingReachMaxLevel = function(buildingLevel){
	return buildingLevel >= PlayerInitData.intInit.buildingMaxLevel.value
}

/**
 * 获取建筑最高等级
 * @param buildingType
 * @returns {*}
 */
Utils.getBuildingMaxLevel = function(buildingType){
	var configs = BuildingLevelUp[buildingType]
	var config = configs[configs.length - 1]
	return config.level
}

/**
 * 建筑是否达到最高等级
 * @param houseType
 * @param houseLevel
 * @returns {boolean}
 */
Utils.isHouseReachMaxLevel = function(houseType, houseLevel){
	var config = HouseLevelUp[houseType][houseLevel + 1]
	return !_.isObject(config)
}

/**
 * 获取小屋最高等级
 * @param houseType
 * @returns {*}
 */
Utils.getHouseMaxLevel = function(houseType){
	var configs = HouseLevelUp[houseType]
	var config = configs[configs.length - 1]
	return config.level
}

/**
 * 获取小屋尺寸
 * @param houseType
 * @returns {{width: *, height: *}}
 */
Utils.getHouseSize = function(houseType){
	var config = Houses.houses[houseType]
	return {width:config.width, height:config.height}
}

/**
 * 检查小屋类型是否存在
 * @param houseType
 * @returns {*}
 */
Utils.isHouseTypeExist = function(houseType){
	return _.isObject(Houses.houses[houseType])
}

/**
 * 检查大型建筑周围是否允许建造小建筑
 * @param buildingLocation
 * @returns {hasHouse|*}
 */
Utils.isBuildingHasHouse = function(buildingLocation){
	var config = Buildings.buildings[buildingLocation]
	return config.hasHouse
}

/**
 * 获取玩家资源数据
 * @param playerDoc
 * @returns {{}}
 */
Utils.refreshPlayerResources = function(playerDoc){
	var self = this
	_.each(playerDoc.resources, function(value, key){
		if(_.isEqual(key, "food")){
			playerDoc.resources[key] = self.getPlayerFood(playerDoc)
		}else if(_.contains(Consts.BasicResource, key)){
			playerDoc.resources[key] = self.getPlayerResource(playerDoc, key)
		}else if(_.isEqual("citizen", key)){
			playerDoc.resources[key] = self.getPlayerCitizen(playerDoc)
		}else if(_.isEqual("wallHp", key)){
			playerDoc.resources[key] = self.getPlayerWallHp(playerDoc)
		}else if(_.isEqual("cart", key)){
			playerDoc.resources[key] = self.getPlayerCart(playerDoc)
		}else if(_.isEqual("stamina", key)){
			playerDoc.resources[key] = self.getPlayerStamina(playerDoc)
		}
	})
	playerDoc.resources.refreshTime = Date.now()
}

/**
 * 获取玩家基础资源数据
 * @param playerDoc
 * @param resourceName
 * @returns {*}
 */
Utils.getPlayerResource = function(playerDoc, resourceName){
	var resourceLimit = this.getPlayerResourceUpLimit(playerDoc, resourceName)
	if(resourceLimit <= playerDoc.resources[resourceName]){
		return playerDoc.resources[resourceName]
	}

	var houseType = this.getHouseTypeByResourceName(resourceName)
	var houses = this.getPlayerHousesByType(playerDoc, houseType)
	var totalPerHour = 0
	_.each(houses, function(house){
		var config = HouseFunction[house.type][house.level]
		totalPerHour += config.poduction
	})

	var totalPerSecond = totalPerHour / 60 / 60
	var totalSecond = (Date.now() - playerDoc.resources.refreshTime) / 1000
	var itemKey = resourceName + "Bonus"
	var itemBuff = this.isPlayerHasItemEvent(playerDoc, itemKey) ? 0.5 : 0
	var techBuff = this.getPlayerProductionTechBuff(playerDoc, Consts.ResourceNameForProductionTechNameMap[resourceName])
	var output = Math.floor(totalSecond * totalPerSecond * (1 + itemBuff + techBuff))
	var totalResource = playerDoc.resources[resourceName] + output
	if(totalResource > resourceLimit) totalResource = resourceLimit
	return totalResource
}

/**
 * 获取玩家士兵的消耗
 * @param playerDoc
 * @param time
 * @returns {number}
 */
Utils.getPlayerSoldiersFoodConsumed = function(playerDoc, time){
	var self = this
	var consumed = 0
	_.each(playerDoc.soldiers, function(count, soldierName){
		var config = self.getPlayerSoldierConfig(playerDoc, soldierName)
		consumed += config.consumeFoodPerHour * count
	})

	var itemBuff = this.isPlayerHasItemEvent(playerDoc, "quarterMaster") ? 0.25 : 0
	return Math.ceil(consumed * time / 1000 / 60 / 60 * (1 - itemBuff))
}

Utils.getPlayerFood = function(playerDoc){
	var resourceName = "food"
	var resourceLimit = this.getPlayerResourceUpLimit(playerDoc, resourceName)
	var houseType = this.getHouseTypeByResourceName(resourceName)
	var houses = this.getPlayerHousesByType(playerDoc, houseType)
	var totalPerHour = 0
	_.each(houses, function(house){
		var config = HouseFunction[house.type][house.level]
		totalPerHour += config.poduction
	})

	var totalPerSecond = totalPerHour / 60 / 60
	var totalTime = Date.now() - playerDoc.resources.refreshTime
	var soldierConsumed = this.getPlayerSoldiersFoodConsumed(playerDoc, totalTime)
	if(playerDoc.resources[resourceName] - soldierConsumed >= resourceLimit){
		return playerDoc.resources[resourceName] - soldierConsumed
	}else{
		var totalSecond = totalTime / 1000
		var itemBuff = this.isPlayerHasItemEvent(playerDoc, "foodBonus") ? 0.5 : 0
		var techBuff = this.getPlayerProductionTechBuff(playerDoc, Consts.ResourceNameForProductionTechNameMap["food"])
		var output = Math.floor(totalSecond * totalPerSecond * (1 + itemBuff + techBuff))
		var totalResource = playerDoc.resources[resourceName] + output - soldierConsumed
		if(totalResource > resourceLimit) totalResource = resourceLimit
		else if(totalResource < 0) totalResource = 0
		return totalResource
	}
}

/**
 * 获取玩家可用城民数据
 * @param playerDoc
 * @returns {*}
 */
Utils.getPlayerCitizen = function(playerDoc){
	var itemCityzenMaxCountBuff = this.getPlayerProductionTechBuff(playerDoc, "beerSupply")
	var citizenLimit = Math.floor(this.getPlayerCitizenUpLimit(playerDoc) * (1 + itemCityzenMaxCountBuff))
	var usedCitizen = this.getPlayerUsedCitizen(playerDoc)
	if(citizenLimit <= playerDoc.resources["citizen"] + usedCitizen){
		return citizenLimit - usedCitizen
	}

	var houses = this.getPlayerHousesByType(playerDoc, "dwelling")
	var totalPerHour = 0
	_.each(houses, function(house){
		var config = HouseFunction[house.type][house.level]
		totalPerHour += config.recoveryCitizen
	})

	var totalPerSecond = totalPerHour / 60 / 60
	var totalSecond = (Date.now() - playerDoc.resources.refreshTime) / 1000
	var itemCitizenRecoverBuff = this.isPlayerHasItemEvent(playerDoc, "citizenBonus") ? 0.5 : 0
	var output = Math.floor(totalSecond * totalPerSecond * (1 + itemCitizenRecoverBuff))
	var totalCitizen = playerDoc.resources["citizen"] + output
	if(totalCitizen - usedCitizen > citizenLimit) totalCitizen = citizenLimit - usedCitizen
	return totalCitizen
}

/**
 * 获取玩家运输小车数量
 * @param playerDoc
 * @returns {*}
 */
Utils.getPlayerCart = function(playerDoc){
	var building = playerDoc.buildings.location_16
	if(building.level < 1) return playerDoc.resources["cart"]

	var config = BuildingFunction.tradeGuild[building.level]
	var cartLimit = config.maxCart
	if(cartLimit <= playerDoc.resources["cart"]){
		return playerDoc.resources["cart"]
	}

	var totalPerSecond = config.cartRecovery / 60 / 60
	var totalSecond = (Date.now() - playerDoc.resources.refreshTime) / 1000
	var output = Math.floor(totalSecond * totalPerSecond)
	var totalCart = playerDoc.resources["cart"] + output
	return totalCart > cartLimit ? cartLimit : totalCart
}

/**
 * 获取玩家精力数据
 * @param playerDoc
 * @returns {intInit.staminaMax|*}
 */
Utils.getPlayerStamina = function(playerDoc){
	var staminaRecoverPerHour = PlayerInitData.intInit.staminaRecoverPerHour.value
	var staminaMax = PlayerInitData.intInit.staminaMax.value
	if(staminaMax <= playerDoc.resources["stamina"]){
		return staminaMax
	}

	var totalPerSecond = staminaRecoverPerHour / 60 / 60
	var totalSecond = (Date.now() - playerDoc.resources.refreshTime) / 1000
	var output = Math.floor(totalSecond * totalPerSecond)
	var totalStamina = playerDoc.resources["stamina"] + output
	return totalStamina > staminaMax ? staminaMax : totalStamina
}

/**
 * 获取玩家资源上限信息
 * @param playerDoc
 * @param resourceName
 * @returns {number}
 */
Utils.getPlayerResourceUpLimit = function(playerDoc, resourceName){
	var building = this.getPlayerBuildingByType(playerDoc, "warehouse")
	var totalUpLimit = 0
	if(building.level >= 1){
		var config = BuildingFunction["warehouse"][building.level]
		resourceName = resourceName.charAt(0).toUpperCase() + resourceName.slice(1)
		resourceName = "max" + resourceName
		totalUpLimit += config[resourceName]
	}

	return totalUpLimit
}

/**
 * 获取玩家城民上限信息
 * @returns {number}
 */
Utils.getPlayerCitizenUpLimit = function(playerDoc){
	var houses = this.getPlayerHousesByType(playerDoc, "dwelling")
	var totalUpLimit = 0
	_.each(houses, function(house){
		var config = HouseFunction["dwelling"][house.level]
		totalUpLimit += config.citizen
	})
	return totalUpLimit
}

/**
 * 获取已经占用的城民
 * @param playerDoc
 * @returns {number}
 */
Utils.getPlayerUsedCitizen = function(playerDoc){
	var used = 0
	_.each(playerDoc.buildings, function(building){
		_.each(building.houses, function(house){
			var houseLevel = LogicUtils.hasHouseEvents(playerDoc, building.location, house.location) ? house.level + 1 : house.level
			var config = HouseLevelUp[house.type][houseLevel]
			used += config.citizen
		})
	})
	return used
}

/**
 * 获取指定建筑占用的城民
 * @param houseType
 * @param houseLevel
 * @returns {number}
 */
Utils.getHouseUsedCitizen = function(houseType, houseLevel){
	return HouseLevelUp[houseType][houseLevel].citizen
}

/**
 * 获取玩家城墙血量
 * @param playerDoc
 */
Utils.getPlayerWallHp = function(playerDoc){
	var building = playerDoc.buildings.location_21
	if(building.level < 1) return playerDoc.resources["wallHp"]

	var config = BuildingFunction.wall[building.level]
	var hpLimit = config.wallHp
	if(hpLimit <= playerDoc.resources["wallHp"]){
		return hpLimit
	}

	var totalPerSecond = config.wallRecovery / 60 / 60
	var totalSecond = (Date.now() - playerDoc.resources.refreshTime) / 1000
	var techBuff = this.getPlayerProductionTechBuff(playerDoc, "fastFix")
	var output = Math.floor(totalSecond * totalPerSecond * (1 + techBuff))
	var totalHp = playerDoc.resources["wallHp"] + output
	return totalHp > hpLimit ? hpLimit : totalHp
}

/**
 * 根据建筑类型获取所有相关建筑
 * @param playerDoc
 * @param buildingType
 * @returns {Array}
 */
Utils.getPlayerBuildingByType = function(playerDoc, buildingType){
	return _.find(playerDoc.buildings, function(building){
		return _.isEqual(buildingType, building.type)
	})
}

/**
 * 根据小屋类型获取所有相关小屋
 * @param playerDoc
 * @param houseType
 * @returns {Array}
 */
Utils.getPlayerHousesByType = function(playerDoc, houseType){
	var houses = []
	_.each(playerDoc.buildings, function(building){
		_.each(building.houses, function(house){
			if(_.isEqual(houseType, house.type)){
				houses.push(house)
			}
		})
	})

	return houses
}

/**
 * 根据资源名称获取生产此资源的小屋类型
 * @param resourceName
 * @returns {*}
 */
Utils.getHouseTypeByResourceName = function(resourceName){
	var houseType = null
	_.each(Houses.houses, function(house){
		if(_.isEqual(resourceName, house.output)){
			houseType = house.type
		}
	})

	return houseType
}

/**
 * 根据小屋类型获取产出资源名称
 * @param houseType
 * @returns {houses.dwelling.output|*|houses.woodcutter.output|houses.farmer.output|houses.quarrier.output|houses.miner.output}
 */
Utils.getResourceNameByHouseType = function(houseType){
	return Houses.houses[houseType].output
}

/**
 * 获取住宅城民上限
 * @param houseLevel
 * @returns {citizen|*}
 */
Utils.getDwellingPopulationByLevel = function(houseLevel){
	var config = HouseFunction["dwelling"][houseLevel]
	return config.citizen
}

/**
 * 获取建筑数量
 * @param playerDoc
 * @returns {number}
 */
Utils.getPlayerBuildingsCount = function(playerDoc){
	var count = 0
	_.each(playerDoc.buildings, function(building){
		if(building.level > 0 || (building.level == 0 && LogicUtils.hasBuildingEvents(playerDoc, building.location))){
			count += 1
		}
	})
	return count
}

/**
 * 获取可建建筑总数量
 * @param playerDoc
 * @returns {unlock|*}
 */
Utils.getPlayerMaxBuildingsCount = function(playerDoc){
	var building = playerDoc.buildings.location_1
	var config = BuildingFunction[building.type][building.level]
	return config.unlock
}

/**
 * 获取可造建筑数量
 * @param playerDoc
 * @returns {number}
 */
Utils.getPlayerFreeBuildingsCount = function(playerDoc){
	return this.getPlayerMaxBuildingsCount(playerDoc) - this.getPlayerBuildingsCount(playerDoc)
}

/**
 * 获取材料仓库单个材料上限
 * @param playerDoc
 * @returns {number}
 */
Utils.getMaterialUpLimit = function(playerDoc){
	var building = this.getPlayerBuildingByType(playerDoc, "materialDepot")
	var totalUpLimit = 0
	if(building.level >= 1){
		var config = BuildingFunction["materialDepot"][building.level]
		totalUpLimit += config.maxMaterial
	}

	return totalUpLimit
}

/**
 * 将材料添加到材料仓库中,超过仓库上限后直接丢弃
 * @param playerDoc
 * @param materialEvent
 */
Utils.addPlayerMaterials = function(playerDoc, materialEvent){
	var materialUpLimit = this.getMaterialUpLimit(playerDoc)
	var materials = materialEvent.materials
	var playerMaterilas = playerDoc[materialEvent.category]
	_.each(materials, function(material){
		var currentMaterial = playerMaterilas[material.type]
		if(currentMaterial < materialUpLimit){
			currentMaterial += material.count
			currentMaterial = currentMaterial > materialUpLimit ? materialUpLimit : currentMaterial
			playerMaterilas[material.type] = currentMaterial
		}
	})
}

/**
 * 获取制造材料所需的资源
 * @param category
 * @param toolShopLevel
 * @returns {{}}
 */
Utils.getMakeMaterialRequired = function(category, toolShopLevel){
	var required = {}
	var config = BuildingFunction["toolShop"][toolShopLevel]
	if(_.isEqual(Consts.MaterialType.BuildingMaterials, category)){
		required.resources = {
			wood:config.productBmWood,
			stone:config.productBmStone,
			iron:config.productBmIron
		}
		required.buildTime = config.productBmtime
	}else if(_.isEqual(Consts.MaterialType.TechnologyMaterials, category)){
		required.resources = {
			wood:config.productAmWood,
			stone:config.productAmStone,
			iron:config.productAmIron
		}
		required.buildTime = config.productAmtime
	}
	return required
}

/**
 * 产生制作材料的事件
 * @param toolShop
 * @param category
 * @param finishNow
 */
Utils.createMaterialEvent = function(toolShop, category, finishNow){
	var categoryConfig = {}
	categoryConfig[Consts.MaterialType.BuildingMaterials] = [
		"blueprints", "tools", "tiles", "pulley"
	]
	categoryConfig[Consts.MaterialType.TechnologyMaterials] = [
		"trainingFigure", "bowTarget", "saddle", "ironPart"
	]

	var config = BuildingFunction["toolShop"][toolShop.level]
	var poduction = config.poduction
	var materialTypeCount = config.poductionType
	var materialTypes = categoryConfig[category]
	materialTypes = CommonUtils.shuffle(materialTypes)
	var materialCountArray = []
	for(var i = 1; i <= poduction; i++){
		materialCountArray.push(i)
	}
	materialCountArray = CommonUtils.shuffle(materialCountArray)

	var materials = []
	var totalGenerated = 0
	for(i = 0; i < materialTypeCount; i++){
		var material = {
			type:materialTypes[i],
			count:materialCountArray[i]
		}
		materials.push(material)
		totalGenerated += materialCountArray[i]

		if(poduction <= totalGenerated){
			material.count -= totalGenerated - poduction
			break
		}

		if(i == materialTypeCount - 1 && poduction > totalGenerated){
			material.count += poduction - totalGenerated
		}
	}

	var buildTime = _.isEqual(Consts.MaterialType.BuildingMaterials, category) ? config.productBmtime : config.productAmtime
	var event = {
		id:ShortId.generate(),
		category:category,
		materials:materials,
		startTime:Date.now(),
		finishTime:finishNow ? 0 : (Date.now() + (buildTime * 1000))
	}
	return event
}

/**
 * 获取玩家战斗力
 * @param playerDoc
 * @returns {*}
 */
Utils.getPlayerPower = function(playerDoc){
	var buildingPower = this.getPlayerBuildingsPower(playerDoc)
	var housePower = this.getPlayerHousesPower(playerDoc)
	var soldierPower = this.getPlayerSoldiersPower(playerDoc)

	return buildingPower + housePower + soldierPower
}

/**
 * 获取建筑战斗力
 * @param playerDoc
 * @returns {number}
 */
Utils.getPlayerBuildingsPower = function(playerDoc){
	var totalPower = 0
	_.each(playerDoc.buildings, function(building){
		if(building.level >= 1){
			var config = BuildingFunction[building.type][building.level]
			totalPower += config.power
		}
	})

	return totalPower
}

/**
 * 获取小屋战斗力
 * @param playerDoc
 * @returns {number}
 */
Utils.getPlayerHousesPower = function(playerDoc){
	var totalPower = 0
	_.each(playerDoc.buildings, function(building){
		_.each(building.houses, function(house){
			var config = HouseFunction[house.type][house.level]
			totalPower += config.power
		})
	})

	return totalPower
}

/**
 * 获取士兵战斗力
 * @param playerDoc
 * @returns {number}
 */
Utils.getPlayerSoldiersPower = function(playerDoc){
	var self = this
	var totalPower = 0
	_.each(playerDoc.soldiers, function(soldierCount, soldierName){
		var config = self.getPlayerSoldierConfig(playerDoc, soldierName)
		totalPower += config.power * soldierCount
	})

	return totalPower
}

/**
 * 获取玩家城堡等级
 * @param playerDoc
 * @returns {*}
 */
Utils.getPlayerKeepLevel = function(playerDoc){
	return playerDoc.buildings.location_1.level
}

/**
 * 获取玩家建筑等级限制
 * @param playerDoc
 * @returns {*}
 */
Utils.getPlayerBuildingLevelLimit = function(playerDoc){
	return this.getPlayerKeepLevel(playerDoc)
}

/**
 * 获取指定小屋最大建造数量
 * @param playerDoc
 * @param houseType
 * @returns {*}
 */
Utils.getPlayerHouseMaxCountByType = function(playerDoc, houseType){
	var config = Houses.houses[houseType]
	var limitBy = config.limitBy
	var totalCount = HouseInit[houseType]
	var building = this.getPlayerBuildingByType(playerDoc, limitBy)

	if(building.level >= 1){
		var buildingFunction = BuildingFunction[limitBy][building.level]
		totalCount += buildingFunction[houseType]
	}
	return totalCount
}

/**
 * 获取指定小屋建造数量
 * @param playerDoc
 * @param houseType
 * @returns {number}
 */
Utils.getPlayerHouseCountByType = function(playerDoc, houseType){
	var count = 0
	_.each(playerDoc.buildings, function(building){
		_.each(building.houses, function(house){
			if(_.isEqual(houseType, house.type)){
				count += 1
			}
		})
	})

	return count
}

/**
 * 获取指定小屋可建造数量
 * @param playerDoc
 * @param houseType
 * @returns {number}
 */
Utils.getPlayerFreeHousesCount = function(playerDoc, houseType){
	var maxCount = this.getPlayerHouseMaxCountByType(playerDoc, houseType)
	var currentCount = this.getPlayerHouseCountByType(playerDoc, houseType)
	return maxCount - currentCount
}

/**
 * 是否有普通兵种
 * @param soldierName
 */
Utils.isNormalSoldier = function(soldierName){
	return _.some(Soldiers.normal, function(config){
		if(_.isEqual(config.name, soldierName)) return true
	})
}

/**
 * 是否有特殊兵种
 * @param soldierName
 * @returns {boolean}
 */
Utils.hasSpecialSoldier = function(soldierName){
	var keys = _.keys(Soldiers.special)
	return _.contains(keys, soldierName)
}

/**
 * 获取招募普通兵种所需的资源
 * @param playerDoc
 * @param soldierName
 * @param count
 * @returns {{resources: {wood: number, stone: number, iron: number, food: number}, recruitTime: (*|Array)}}
 */
Utils.getPlayerRecruitNormalSoldierRequired = function(playerDoc, soldierName, count){
	var config = this.getPlayerSoldierConfig(playerDoc, soldierName)
	var resources = {
		wood:config.wood * count,
		stone:config.stone * count,
		iron:config.iron * count,
		food:config.food * count,
		citizen:config.citizen * count
	}
	var totalNeed = {
		resources:resources,
		recruitTime:this.getPlayerRecruitSoldierTime(playerDoc, soldierName, count)
	}
	return totalNeed
}

/**
 * 获取招募特殊兵种所需的材料
 * @param playerDoc
 * @param soldierName
 * @param count
 * @returns {{materials: (*|Array), recruitTime: *}}
 */
Utils.getPlayerRecruitSpecialSoldierRequired = function(playerDoc, soldierName, count){
	var config = Soldiers.special[soldierName]
	var materialNames = config.specialMaterials.split(",")
	var materials = {}
	_.each(materialNames, function(value){
		materials[value] = count
	})
	var totalNeed = {
		materials:materials,
		recruitTime:this.getPlayerRecruitSoldierTime(playerDoc, soldierName, count),
		citizen:config.citizen * count
	}
	return totalNeed
}

/**
 * 获取招募士兵时需要的时间
 * @param playerDoc
 * @param soldierName
 * @param count
 * @returns {number}
 */
Utils.getPlayerRecruitSoldierTime = function(playerDoc, soldierName, count){
	var config = this.getPlayerSoldierConfig(playerDoc, soldierName)
	var buildingName = this.isNormalSoldier(soldierName) ? Soldiers.normal[soldierName + "_1"].techBuildingName : Soldiers.special[soldierName].techBuildingName
	var building = _.find(playerDoc.buildings, function(building){
		return _.isEqual(building.type, buildingName)
	})
	if(building.level > 0){
		var buildingConfig = BuildingFunction[building.type][building.level]
		var recruitTime = LogicUtils.getTimeEfffect(config.recruitTime * count, buildingConfig.efficiency)
		return recruitTime
	}else{
		return config.recruitTime * count
	}

}

/**
 * 获取士兵招募单次最大数量
 * @param playerDoc
 * @param soldierName
 * @returns {number}
 */
Utils.getPlayerSoldierMaxRecruitCount = function(playerDoc, soldierName){
	var building = playerDoc.buildings.location_5
	if(building.level < 1) return 0
	var config = BuildingFunction[building.type][building.level]
	var maxRecruit = config.maxRecruit
	var soldierConfig = this.getPlayerSoldierConfig(playerDoc, soldierName)
	var maxCount = Math.floor(maxRecruit / soldierConfig.citizen)
	return maxCount
}

/**
 * 龙装备是否存在
 * @param equipmentName
 * @returns {boolean}
 */
Utils.isDragonEquipment = function(equipmentName){
	var has = false
	_.each(DragonEquipments.equipments, function(value, key){
		if(_.isEqual(equipmentName, key)){
			has = true
		}
	})
	return has
}

/**
 * 获取龙装备制造需求
 * @param playerDoc
 * @param equipmentName
 * @returns {{}}
 */
Utils.getPlayerMakeDragonEquipmentRequired = function(playerDoc, equipmentName){
	var required = {}
	var config = DragonEquipments.equipments[equipmentName]
	var materialNameArray = config.materials.split(",")
	var materials = {}
	_.each(materialNameArray, function(materialName){
		var nameAndCountArray = materialName.split(":")
		materials[nameAndCountArray[0]] = Number(nameAndCountArray[1])
	})
	required.materials = materials
	required.coin = config.coin
	required.makeTime = this.getPlayerMakeDragonEquipmentTime(playerDoc, equipmentName)
	return required
}

/**
 * 获取龙装备制造时间
 * @param playerDoc
 * @param equipmentName
 * @returns {*}
 */
Utils.getPlayerMakeDragonEquipmentTime = function(playerDoc, equipmentName){
	var building = playerDoc.buildings.location_9
	var smithConfig = BuildingFunction[building.type][building.level]
	var dragonEquipmentConfig = DragonEquipments.equipments[equipmentName]
	var makeTime = dragonEquipmentConfig.makeTime
	return LogicUtils.getTimeEfffect(makeTime, smithConfig.efficiency)
}

/**
 * 是否还有可用的建筑建造队列
 * @param playerDoc
 */
Utils.playerHasFreeBuildQueue = function(playerDoc){
	return playerDoc.basicInfo.buildQueue - LogicUtils.getUsedBuildQueue(playerDoc) > 0
}

/**
 * 获取治疗指定伤兵所需时间
 * @param playerDoc
 * @param soldierName
 * @param count
 * @returns {number}
 */
Utils.getPlayerTreatSoldierTime = function(playerDoc, soldierName, count){
	var config = this.getPlayerSoldierConfig(playerDoc, soldierName)
	return config.treatTime * count
}

/**
 * 获取资料普通兵种所需的资源
 * @param playerDoc
 * @param soldiers
 * @returns {{resources: {wood: number, stone: number, iron: number, food: number}, recruitTime: (*|Array)}}
 */
Utils.getPlayerTreatSoldierRequired = function(playerDoc, soldiers){
	var self = this
	var totalNeed = {
		resources:{
			wood:0,
			stone:0,
			iron:0,
			food:0
		},
		treatTime:0
	}
	_.each(soldiers, function(soldier){
		var soldierName = soldier.name
		var count = soldier.count
		var soldierKey = soldierName + "_" + playerDoc.soldierStars[soldierName]
		var config = Soldiers.normal[soldierKey]
		totalNeed.resources.wood += config.treatWood * count
		totalNeed.resources.stone += config.treatStone * count
		totalNeed.resources.iron += config.treatIron * count
		totalNeed.resources.food += config.treatFood * count
		totalNeed.treatTime += self.getPlayerTreatSoldierTime(playerDoc, soldierName, count)
	})
	return totalNeed
}

/**
 * 获取龙力量Buff
 * @param dragon
 * @param terrain
 * @returns {number}
 */
Utils.getDragonStrengthBuff = function(dragon, terrain){
	var terrainBuff = _.isEqual(Consts.DragonFightBuffTerrain[dragon.type], terrain) ? 0.1 : 0
	var dragonBreathSkill = _.find(dragon.skills, function(skill){
		return _.isEqual(skill.name, "dragonBreath")
	})
	var skillBuff = 0
	if(_.isObject(dragonBreathSkill)){
		var config = Dragons.dragonSkills["dragonBreath"]
		skillBuff = dragonBreathSkill.level * config.effectPerLevel
	}
	return terrainBuff + skillBuff
}

/**
 * 获取龙的力量
 * @param dragon
 * @param terrain
 * @returns {*}
 */
Utils.getDragonStrength = function(dragon, terrain){
	var config = Dragons.dragonAttributes[dragon.star]
	var strength = config.initStrength + (config.perLevelStrength * dragon.level)
	var buff = this.getDragonStrengthBuff(dragon, terrain)
	strength += Math.floor(strength * buff)
	_.each(dragon.equipments, function(equipment, category){
		if(!_.isEmpty(equipment.name)){
			var maxStar = DragonEquipments.equipments[equipment.name].maxStar
			var equipmentConfig = DragonEquipments[category][maxStar + "_" + equipment.star]
			var strengthAdd = equipmentConfig.strength
			strength += strengthAdd
		}
	})

	return strength
}

/**
 * 获取龙活力Buff
 * @param dragon
 * @returns {number}
 */
Utils.getDragonVitalityBuff = function(dragon){
	var skillBuff = 0
	var dragonBloodSkill = _.find(dragon.skills, function(skill){
		return _.isEqual(skill.name, "dragonBlood")
	})
	if(_.isObject(dragonBloodSkill)){
		var config = Dragons.dragonSkills["dragonBlood"]
		skillBuff = dragonBloodSkill.level * config.effectPerLevel
	}
	return skillBuff
}

/**
 * 获取龙的活力值
 * @param dragon
 * @returns {*}
 */
Utils.getDragonVitality = function(dragon){
	var config = Dragons.dragonAttributes[dragon.star]
	var vitality = config.initVitality + (config.perLevelVitality * dragon.level)
	var buff = this.getDragonVitalityBuff(dragon)
	vitality += Math.floor(vitality * buff)
	_.each(dragon.equipments, function(equipment, category){
		if(!_.isEmpty(equipment.name)){
			var maxStar = DragonEquipments.equipments[equipment.name].maxStar
			var equipmentConfig = DragonEquipments[category][maxStar + "_" + equipment.star]
			var strengthAdd = equipmentConfig.vitality
			vitality += strengthAdd
		}
	})

	return vitality
}

/**
 * 获取龙领导力Buff
 * @param playerDoc
 * @param dragon
 * @returns {number}
 */
Utils.getPlayerDragonLeadershipBuff = function(playerDoc, dragon){
	var itemBuff = 0
	var skillBuff = 0
	var equipmentBuff = 0

	var eventType = "troopSizeBonus"
	var itemEvent = _.find(playerDoc.itemEvents, function(event){
		return _.isEqual(event.type, eventType)
	})
	if(_.isObject(itemEvent)) itemBuff = 0.3

	var leadershipSkill = _.find(dragon.skills, function(skill){
		return _.isEqual(skill.name, "leadership")
	})
	if(_.isObject(leadershipSkill)){
		var config = Dragons.dragonSkills["leadership"]
		skillBuff = leadershipSkill.level * config.effectPerLevel
	}

	var equipmentBuffKey = "troopSizeAdd"
	_.each(dragon.equipments, function(equipment){
		_.each(equipment.buffs, function(key){
			if(_.isEqual(key, equipmentBuffKey)){
				equipmentBuff += DragonEquipments.equipmentBuff[equipmentBuffKey].buffEffect
			}
		})
	})

	return itemBuff + skillBuff + equipmentBuff
}

/**
 * 获取龙的领导力
 * @param playerDoc
 * @param dragon
 * @returns {*}
 */
Utils.getPlayerDragonLeadership = function(playerDoc, dragon){
	var config = Dragons.dragonAttributes[dragon.star]
	var leadership = config.initLeadership + (config.perLevelLeadership * dragon.level)
	var buff = this.getPlayerDragonLeadershipBuff(playerDoc, dragon)
	leadership += Math.floor(leadership * buff)
	_.each(dragon.equipments, function(equipment, category){
		if(!_.isEmpty(equipment.name)){
			var maxStar = DragonEquipments.equipments[equipment.name].maxStar
			var equipmentConfig = DragonEquipments[category][maxStar + "_" + equipment.star]
			var leadershipAdd = equipmentConfig.leadership
			leadership += leadershipAdd
		}
	})

	return leadership
}

/**
 * 随机生成Buff加成类型
 * @param equipmentName
 * @returns {Array}
 */
Utils.generateDragonEquipmentBuffs = function(equipmentName){
	var generatedBuffs = []
	var star = DragonEquipments.equipments[equipmentName].maxStar
	var buffs = DragonEquipments.equipmentBuff
	var buffKeys = Object.keys(buffs)
	for(var i = 0; i < star; i++){
		buffKeys = CommonUtils.shuffle(buffKeys)
		var key = buffKeys[0]
		generatedBuffs.push(key)
	}

	return generatedBuffs
}

/**
 * 检查某装备是否能装配到龙的制定位置上
 * @param equipmentName
 * @param equipmentCategory
 * @returns {boolean}
 */
Utils.isDragonEquipmentLegalAtCategory = function(equipmentName, equipmentCategory){
	var config = DragonEquipments.equipments[equipmentName]
	var categories = config.category.split(",")
	return _.contains(categories, equipmentCategory)

}

/**
 * 检查装备是否是属于此龙的类型
 * @param equipmentName
 * @param dragonType
 * @returns {*}
 */
Utils.isDragonEquipmentLegalOnDragon = function(equipmentName, dragonType){
	var config = DragonEquipments.equipments[equipmentName]
	return _.isEqual(dragonType, config.usedFor)
}

/**
 * 检查龙的装备的星级是否和龙的星级匹配
 * @param equipmentName
 * @param dragon
 * @returns {*}
 */
Utils.isDragonEquipmentStarEqualWithDragonStar = function(equipmentName, dragon){
	var config = DragonEquipments.equipments[equipmentName]
	return _.isEqual(config.maxStar, dragon.star)
}

/**
 * 龙装备是否已强化到最高等级
 * @param equipment
 * @returns {boolean}
 */
Utils.isDragonEquipmentReachMaxStar = function(equipment){
	var config = DragonEquipments.equipments[equipment.name]
	return config.maxStar <= equipment.star
}

/**
 * 获取指龙装备的最大星级
 * @param equipmentName
 * @returns {*}
 */
Utils.getDragonEquipmentMaxStar = function(equipmentName){
	var config = DragonEquipments.equipments[equipmentName]
	return config.maxStar
}

/**
 * 检查对龙技能的升级是否合法
 * @param dragon
 * @param skillName
 * @returns {boolean}
 */
Utils.isDragonSkillUnlocked = function(dragon, skillName){
	var config = Dragons.dragonSkills[skillName]
	return config.unlockStar <= dragon.star
}

/**
 * 此龙类型是否存在
 * @param dragonType
 * @returns {*}
 */
Utils.isDragonTypeExist = function(dragonType){
	var config = Dragons.dragons
	return _.contains(Object.keys(config), dragonType)
}

/**
 * 获取升级龙的技能所需的资源
 * @param dragon
 * @param skill
 * @returns {{}}
 */
Utils.getDragonSkillUpgradeRequired = function(dragon, skill){
	var config = Dragons.dragonSkills[skill.name]
	var totalNeed = {}
	totalNeed.blood = config.heroBloodCostPerLevel * (skill.level + 1) * (skill.level + 1)
	return totalNeed
}

/**
 * 技能是否以达到最高等级
 * @param skill
 * @returns {boolean}
 */
Utils.isDragonSkillReachMaxLevel = function(skill){
	var config = Dragons.dragonSkills[skill.name]
	return skill.level >= config.maxLevel
}

/**
 * 获取龙的指定技能的最高等级
 * @param skill
 * @returns {dragonSkill.dragonBlood.maxLevel|*|dragonSkill.infantryEnhance.maxLevel|dragonSkill.dragonBreath.maxLevel|dragonSkill.siegeEnhance.maxLevel|dragonSkill.cavalryEnhance.maxLevel}
 */
Utils.getDragonSkillMaxLevel = function(skill){
	var config = Dragons.dragonSkills[skill.name]
	return config.maxLevel
}

/**
 * 强化龙的装备
 * @param playerDoc
 * @param playerData
 * @param dragon
 * @param category
 * @param equipments
 */
Utils.enhancePlayerDragonEquipment = function(playerDoc, playerData, dragon, category, equipments){
	var equipmentInDragon = dragon.equipments[category]
	var config = DragonEquipments.equipments[equipmentInDragon.name]
	var maxStar = config.maxStar
	var currentStar = equipmentInDragon.star
	var currentExp = Number(equipmentInDragon.exp)
	var totalExp = this.getDragonEquipmentsExp(dragon.type, equipmentInDragon, equipments)
	while(totalExp > 0 && currentStar < maxStar){
		var nextStar = currentStar + 1
		var categoryConfig = DragonEquipments[category][maxStar + "_" + nextStar]
		var expNeeded = categoryConfig.enhanceExp - currentExp
		if(expNeeded <= totalExp){
			currentStar += 1
			currentExp = 0
			totalExp -= expNeeded
		}else{
			currentExp += totalExp
			totalExp = 0
		}
	}
	equipmentInDragon.star = currentStar
	equipmentInDragon.exp = currentExp

	playerData.dragonEquipments = {}
	_.each(equipments, function(equipment){
		playerDoc.dragonEquipments[equipment.name] -= equipment.count
		playerData.dragonEquipments[equipment.name] = playerDoc.dragonEquipments[equipment.name]
	})
}

/**
 * 获取龙装备的经验值
 * @param dragonType
 * @param equipmentInDragon
 * @param equipments
 * @returns {number}
 */
Utils.getDragonEquipmentsExp = function(dragonType, equipmentInDragon, equipments){
	var self = this
	var totalExp = 0
	_.each(equipments, function(equipment){
		var exp = self.getDragonEquipmentExp(dragonType, equipmentInDragon, equipment.name, equipment.count)
		totalExp += exp
	})
	return totalExp
}

/**
 * 获取单个龙装备的经验值
 * @param dragonType
 * @param equipmentInDragon
 * @param equipmentName
 * @param count
 * @returns {number}
 */
Utils.getDragonEquipmentExp = function(dragonType, equipmentInDragon, equipmentName, count){
	var config = DragonEquipments.equipments[equipmentName]
	var usedFor = config.usedFor
	if(_.isEqual(equipmentInDragon.name, equipmentName)){
		return config.resolveLExp * count
	}else if(_.isEqual(dragonType, usedFor)){
		return config.resolveMExp * count
	}else{
		return config.resolveSExp * count
	}
}

/**
 * 龙的等级是否达到让龙晋级的条件
 * @param dragon
 * @returns {boolean}
 */
Utils.isDragonReachUpgradeLevel = function(dragon){
	var config = Dragons.dragonAttributes[dragon.star + 1]
	return dragon.level >= config.promotionLevel
}

/**
 * 获取指定龙的星级下的最小等级
 * @param dragon
 * @returns {promotionLevel|*}
 */
Utils.getDragonLowestLevelOnStar = function(dragon){
	var config = Dragons.dragonAttributes[dragon.star]
	return config.promotionLevel
}

/**
 * 获取指定龙的星级下的最大等级
 * @param dragon
 * @returns {levelMax|*}
 */
Utils.getDragonHighestLevelOnStar = function(dragon){
	var config = Dragons.dragonAttributes[dragon.star]
	return config.levelMax
}

/**
 * 龙的装备是否达到让龙晋级的条件
 * @param dragon
 */
Utils.isDragonEquipmentsReachUpgradeLevel = function(dragon){
	var allCategory = Dragons.dragonAttributes[dragon.star + 1].allCategory.split(",")
	return _.every(allCategory, function(category){
		var equipment = dragon.equipments[category]
		if(_.isEmpty(equipment.name)) return false
		var maxStar = DragonEquipments.equipments[equipment.name].maxStar
		return equipment.star >= maxStar
	})
}

/**
 * 获取龙的最大星级
 * @returns {number}
 */
Utils.getDragonMaxStar = function(){
	return 4
}

/**
 *龙是否已达到最高星级
 * @param dragon
 * @returns {boolean}
 */
Utils.isDragonReachMaxStar = function(dragon){
	return dragon.star >= 4
}

/**
 * 获取建造联盟所消耗的宝石
 * @returns {*}
 */
Utils.getGemByCreateAlliance = function(){
	return AllianceInit.intInit.createAllianceGem.value
}

/**
 * 获取购买盟主职位所需要的宝石
 * @returns {*}
 */
Utils.getGemByBuyAllianceArchon = function(){
	return AllianceInit.intInit.buyArchonGem.value
}

/**
 * 检查操作联盟相关API的权限是否足够
 * @param title
 * @param api
 * @returns {*}
 */
Utils.isAllianceOperationLegal = function(title, api){
	var config = AllianceRight[title]
	return config[api]
}

/**
 * 获取联盟职称等级
 * @param title
 * @returns {*}
 */
Utils.getAllianceTitleLevel = function(title){
	return AllianceRight[title].titleLevel
}

/**
 * 获取玩家Vip等级
 * @param playerDoc
 * @returns {*}
 */
Utils.getPlayerVipLevel = function(playerDoc){
	var vipExpConfig = PlayerInitData.vipLevel
	var vipExp = playerDoc.basicInfo.vipExp
	for(var i = vipExpConfig.length; i >= 1; i++){
		var minExp = vipExpConfig[i].expFrom
		if(vipExp >= minExp) return i
	}
	return 1
}

/**
 * 获取玩家协助加速效果
 * @param playerDoc
 * @returns {number}
 */
Utils.getPlayerHelpAllianceMemberSpeedUpEffect = function(playerDoc){
	return 2 * 60 * 1000
}

/**
 * 获取免费加速效果
 * @param playerDoc
 * @returns {number}
 */
Utils.getPlayerFreeSpeedUpEffect = function(playerDoc){
	return 5 * 60 * 1000
}

/**
 * 联盟捐赠是否含有此捐赠类型
 * @param donateType
 * @returns {boolean}
 */
Utils.hasAllianceDonateType = function(donateType){
	var has = false
	_.each(AllianceInit.donate, function(config){
		if(_.isEqual(config.type, donateType)){
			has = true
		}
	})
	return has
}

/**
 * 根据捐赠类型和捐赠级别获取捐赠配置
 * @param donateType
 * @param donateLevel
 * @returns {*}
 */
Utils.getAllianceDonateConfigByTypeAndLevel = function(donateType, donateLevel){
	var donateConfig = null
	_.each(AllianceInit.donate, function(config){
		if(_.isEqual(config.type, donateType) && _.isEqual(config.level, donateLevel)){
			donateConfig = config
		}
	})
	return donateConfig
}

/**
 * 更新联盟玩家指定捐赠类型的下次捐赠等级
 * @param memberInAllianceDoc
 * @param donateType
 * @returns {*}
 */
Utils.updateAllianceMemberDonateLevel = function(memberInAllianceDoc, donateType){
	var currentLevel = memberInAllianceDoc.donateStatus[donateType]
	var hasFound = false
	_.each(AllianceInit.donate, function(config){
		if(!hasFound && _.isEqual(config.type, donateType)){
			if(config.level > currentLevel){
				currentLevel += 1
				hasFound = true
			}
		}
	})
	memberInAllianceDoc.donateStatus[donateType] = currentLevel
}

/**
 * 获取升级联盟建筑所需的资源
 * @param buildingName
 * @param buildingLevel
 * @returns {{honour: (needHonour|*)}}
 */
Utils.getAllianceBuildingUpgradeRequired = function(buildingName, buildingLevel){
	var config = AllianceBuilding[buildingName][buildingLevel]
	var required = {
		honour:config.needHonour
	}
	return required
}

/**
 * 获取升级联盟村落所需要的资源
 * @param villageType
 * @param villageLevel
 * @returns {{honour: (needHonour|*)}}
 */
Utils.getAllianceVillageUpgradeRequired = function(villageType, villageLevel){
	var config = AllianceVillage[villageType][villageLevel]
	var required = {
		honour:config.needHonour
	}
	return required
}

/**
 * 获取移动联盟建筑需要的资源
 * @param buildingName
 * @param buildingLevel
 * @returns {{honour: (moveNeedHonour|*)}}
 */
Utils.getAllianceMoveBuildingRequired = function(buildingName, buildingLevel){
	var config = AllianceBuilding[buildingName][buildingLevel]
	var required = {
		honour:config.moveNeedHonour
	}
	return required
}

/**
 *
 * @param decorateType
 * @returns {*}
 */
Utils.getAllianceDistroyDecorateRequired = function(decorateType){
	var config = AllianceInit.buildingType[decorateType]
	var required = {
		honour:config.distroyNeedHonour
	}
	return required
}

/**
 * 指定联盟建筑是否到达最高等级
 * @param buildingName
 * @param buildingLevel
 * @returns {boolean}
 */
Utils.isAllianceBuildingReachMaxLevel = function(buildingName, buildingLevel){
	var config = AllianceBuilding[buildingName][buildingLevel + 1]
	return !_.isObject(config)
}

/**
 * 指定联盟村落类型是否到达最高等级
 * @param allianceType
 * @param allianceLevel
 * @returns {boolean}
 */
Utils.isAllianceVillageReachMaxLevel = function(allianceType, allianceLevel){
	var config = AllianceVillage[allianceType][allianceLevel + 1]
	return !_.isObject(config)
}

/**
 * 获取编辑联盟基础信息消耗的宝石
 * @returns {*}
 */
Utils.getEditAllianceBasicInfoGem = function(){
	return AllianceInit.intInit.editAllianceBasicInfoGem.value
}

/**
 * 获取改变联盟地形所消耗的荣耀值
 * @returns {*}
 */
Utils.getEditAllianceTerrianHonour = function(){
	return AllianceInit.intInit.editAllianceTerrianHonour.value
}

/**
 * 获取村落配置
 * @returns {*}
 */
Utils.getAllianceVillageTypeConfigs = function(){
	var config = AllianceInit.buildingType
	var villages = _.filter(config, function(configObj){
		return _.isEqual(configObj.category, "village")
	})
	return villages
}

/**
 * 村落类型是否合法
 * @param villageType
 * @returns {*}
 */
Utils.isAllianceVillageTypeLegal = function(villageType){
	var keys = _.keys(AllianceVillage)
	return _.contains(keys, villageType)
}

/**
 * 获取村落士兵信息
 * @param villageType
 * @param villageLevel
 * @returns {*}
 */
Utils.getAllianceVillageConfigedDragonAndSoldiers = function(villageType, villageLevel){
	var soldiers = []
	var config = AllianceVillage[villageType][villageLevel]
	var soldierConfigs = config.soldiers.split(",")
	var dragonConfig = soldierConfigs.shift()
	var dragonParams = dragonConfig.split("_")
	var dragon = {
		type:dragonParams[0],
		star:parseInt(dragonParams[1]),
		level:parseInt(dragonParams[2])
	}
	_.each(soldierConfigs, function(soldierConfig){
		var params = soldierConfig.split("_")
		var soldierName = params[0]
		var soldierStar = parseInt(params[1])
		var soldierCount = parseInt(params[2])
		var soldierCountMax = Math.round(soldierCount * 1.2)
		var soldierCountMin = Math.round(soldierCount * 0.8)
		soldierCount = soldierCountMin + ((Math.random() * (soldierCountMax - soldierCountMin + 1)) << 0)
		var soldier = {
			name:soldierName,
			star:soldierStar,
			count:soldierCount
		}
		soldiers.push(soldier)
	})
	return {dragon:dragon, soldiers:soldiers}
}

Utils.getAllianceVillageProduction = function(villageType, villageLevel){
	var config = AllianceVillage[villageType][villageLevel]
	return config.production
}

/**
 * 获取联盟村落建筑等级
 * @param allianceDoc
 * @param villageType
 * @returns {*}
 */
Utils.getAllianceVillageLevelByType = function(allianceDoc, villageType){
	return allianceDoc.villageLevels[villageType]
}

/**
 * 创建联盟村落
 * @param mapObjects
 * @returns {Array}
 */
Utils.createMapVillages = function(mapObjects){
	var self = this
	var villages = []
	var villageObjects = _.filter(mapObjects, function(mapObject){
		var buildingType = mapObject.type
		var config = AllianceInit.buildingType[buildingType]
		return _.isEqual(config.category, "village")
	})
	_.each(villageObjects, function(villageObject){
		var dragonAndSoldiers = self.getAllianceVillageConfigedDragonAndSoldiers(villageObject.type, 1)
		var village = {
			id:ShortId.generate(),
			type:villageObject.type,
			level:1,
			resource:self.getAllianceVillageProduction(villageObject.type, 1),
			dragon:dragonAndSoldiers.dragon,
			soldiers:dragonAndSoldiers.soldiers,
			location:villageObject.location
		}
		villages.push(village)
	})
	return villages
}

/**
 * 为联盟添加村落
 * @param allianceDoc
 * @param mapObject
 * @returns {{id: *, type: *, level: *, resource: *, dragon: *, soldiers: *, location: *}}
 */
Utils.addAllianceVillageObject = function(allianceDoc, mapObject){
	var villageType = mapObject.type
	var villageLevel = allianceDoc.villageLevels[villageType]
	var dragonAndSoldiers = this.getAllianceVillageConfigedDragonAndSoldiers(villageType, villageLevel)
	var village = {
		id:ShortId.generate(),
		type:mapObject.type,
		level:villageLevel,
		resource:this.getAllianceVillageProduction(villageType, villageLevel),
		dragon:dragonAndSoldiers.dragon,
		soldiers:dragonAndSoldiers.soldiers,
		location:mapObject.location
	}
	allianceDoc.villages.push(village)
	return village
}

/**
 * 获取建筑类型在联盟的宽高
 * @param buildingType
 * @returns {{width: *, height: *}}
 */
Utils.getSizeInAllianceMap = function(buildingType){
	var config = AllianceInit.buildingType[buildingType]
	return {width:config.width, height:config.height}
}

/**
 * 联盟地图对象是否为装饰对象
 * @param objectType
 * @returns {*}
 */
Utils.isAllianceMapObjectTypeADecorateObject = function(objectType){
	var config = AllianceInit.buildingType[objectType]
	return _.isEqual(config.category, "decorate")
}

/**
 * 刷新联盟感知力
 * @param allianceDoc
 * @returns {perception|*|allianceSchema.basicInfo.perception}
 */
Utils.getAlliancePerception = function(allianceDoc){
	var shrine = allianceDoc.buildings.shrine
	var config = AllianceBuilding.shrine[shrine.level]
	var perception = allianceDoc.basicInfo.perception
	var addPerSecond = config.pRecovery / 60 / 60
	var totalSeconds = Date.now() - allianceDoc.basicInfo.perceptionRefreshTime
	var perceptionAdd = Math.floor(addPerSecond * totalSeconds)
	return perception + perceptionAdd > config.perception ? config.perception : perception + perceptionAdd
}

/**
 * 联盟圣地事件名称是否合法
 * @param stageName
 * @returns {*}
 */
Utils.isAllianceShrineStageNameLegal = function(stageName){
	var config = AllianceShrine.shrineStage
	return _.contains(_.keys(config), stageName)
}

/**
 * 创建联盟圣地事件
 * @param stageName
 * @returns {*}
 */
Utils.createAllianceShrineStageEvent = function(stageName){
	var event = {
		id:ShortId.generate(),
		stageName:stageName,
		createTime:Date.now(),
		startTime:Date.now() + (AllianceInit.intInit.activeShrineStageEventTime.value * 1000),
		playerTroops:[]
	}
	return event
}

/**
 * 获取激活圣地事件需要的感知力
 * @param stageName
 * @returns {{perception: *}}
 */
Utils.getAllianceActiveShrineStageRequired = function(stageName){
	var config = AllianceShrine.shrineStage[stageName]
	var required = {
		perception:config.needPerception
	}
	return required
}

/**
 * 获取士兵配置
 * @param playerDoc
 * @param soldierName
 * @returns {*}
 */
Utils.getPlayerSoldierConfig = function(playerDoc, soldierName){
	if(this.isNormalSoldier(soldierName)){
		return Soldiers.normal[soldierName + "_" + playerDoc.soldierStars[soldierName]]
	}else{
		return Soldiers.special[soldierName]
	}
}

/**
 * 获取玩家士兵星级
 * @param playerDoc
 * @param soldierName
 * @returns {*}
 */
Utils.getPlayerSoldierStar = function(playerDoc, soldierName){
	if(this.isNormalSoldier(soldierName)){
		return playerDoc.soldierStars[soldierName]
	}else{
		return Soldiers.special[soldierName].star
	}
}

/**
 * 获取玩家兵种的攻击力加成Buff
 * @param playerDoc
 * @param soldierName
 * @param dragon
 * @param terrain
 * @returns {number}
 */
Utils.getPlayerSoldierAtkBuff = function(playerDoc, soldierName, dragon, terrain){
	var itemBuff = 0
	var skillBuff = 0
	var equipmentBuff = 0

	var soldierConfig = this.getPlayerSoldierConfig(playerDoc, soldierName)
	var soldierType = soldierConfig.type

	var eventType = soldierType + "AtkBonus"
	var itemEvent = _.find(playerDoc.itemEvents, function(event){
		return _.isEqual(event.type, eventType)
	})
	if(_.isObject(itemEvent)) itemBuff = 0.3

	if(_.isEqual(Consts.DragonFightBuffTerrain[dragon.type], terrain)){
		var dragonSkillName = soldierType + "Enhance"
		var skill = _.find(dragon.skills, function(skill){
			return _.isEqual(skill.name, dragonSkillName)
		})
		var skillConfig = Dragons.dragonSkills[dragonSkillName]
		skillBuff = skill.level * skillConfig.effectPerLevel
	}

	var equipmentBuffKey = soldierType + "AtkAdd"
	_.each(dragon.equipments, function(equipment){
		_.each(equipment.buffs, function(key){
			if(_.isEqual(key, equipmentBuffKey)){
				equipmentBuff += DragonEquipments.equipmentBuff[equipmentBuffKey].buffEffect
			}
		})
	})

	return itemBuff + skillBuff + equipmentBuff
}

/**
 * 龙技能对进攻城墙的加成Buff
 * @param dragon
 * @returns {number}
 */
Utils.getDragonAtkWallBuff = function(dragon){
	var skillBuff = 0
	var dragonSkillName = "earthquake"
	var skill = _.find(dragon.skills, function(skill){
		return _.isEqual(skill.name, dragonSkillName)
	})
	if(_.isObject(skill)){
		var skillConfig = Dragons.dragonSkills[dragonSkillName]
		skillBuff = skill.level * skillConfig.effectPerLevel
	}

	return skillBuff
}

/**
 * 获取玩家兵种的Hp加成Buff
 * @param playerDoc
 * @param soldierName
 * @param dragon
 * @param terrain
 * @returns {number}
 */
Utils.getPlayerSoldierHpBuff = function(playerDoc, soldierName, dragon, terrain){
	var itemBuff = 0
	var skillBuff = 0
	var equipmentBuff = 0

	var soldierConfig = this.getPlayerSoldierConfig(playerDoc, soldierName)
	var soldierType = soldierConfig.type

	var eventType = "unitHpBonus"
	var itemEvent = _.find(playerDoc.itemEvents, function(event){
		return _.isEqual(event.type, eventType)
	})
	if(_.isObject(itemEvent)) itemBuff = 0.3

	if(_.isEqual(Consts.DragonFightBuffTerrain[dragon.type], terrain)){
		var dragonSkillName = soldierType + "Enhance"
		var skill = _.find(dragon.skills, function(skill){
			return _.isEqual(skill.name, dragonSkillName)
		})
		var skillConfig = Dragons.dragonSkills[dragonSkillName]
		skillBuff = skill.level * skillConfig.effectPerLevel
	}

	var equipmentBuffKey = soldierType + "HpAdd"
	_.each(dragon.equipments, function(equipment){
		_.each(equipment.buffs, function(key){
			if(_.isEqual(key, equipmentBuffKey)){
				equipmentBuff += DragonEquipments.equipmentBuff[equipmentBuffKey].buffEffect
			}
		})
	})

	return itemBuff + skillBuff + equipmentBuff
}

/**
 * 获取玩家士兵负重Buff加成
 * @param playerDoc
 * @param soldierName
 * @param dragon
 * @returns {number}
 */
Utils.getPlayerSoldierLoadBuff = function(playerDoc, soldierName, dragon){
	var equipmentBuff = 0

	var soldierConfig = this.getPlayerSoldierConfig(playerDoc, soldierName)
	var soldierType = soldierConfig.type

	var equipmentBuffKey = soldierType + "LoadAdd"
	_.each(dragon.equipments, function(equipment){
		_.each(equipment.buffs, function(key){
			if(_.isEqual(key, equipmentBuffKey)){
				equipmentBuff += DragonEquipments.equipmentBuff[equipmentBuffKey].buffEffect
			}
		})
	})

	return equipmentBuff
}

/**
 * 创建玩家战斗用军队
 * @param playerDoc
 * @param soldiers
 * @param dragon
 * @param terrain
 * @returns {Array}
 */
Utils.createPlayerSoldiersForFight = function(playerDoc, soldiers, dragon, terrain){
	var self = this
	var soldiersForFight = []
	_.each(soldiers, function(soldier){
		var soldierName = soldier.name
		var soldierStar = self.getPlayerSoldierStar(playerDoc, soldierName)
		var soldierCount = soldier.count
		var config = self.getPlayerSoldierConfig(playerDoc, soldierName)
		var atkBuff = self.getPlayerSoldierAtkBuff(playerDoc, soldierName, dragon, terrain)
		var atkWallBuff = self.getDragonAtkWallBuff(dragon)
		var hpBuff = self.getPlayerSoldierHpBuff(playerDoc, soldierName, dragon, terrain)
		var loadBuff = self.getPlayerSoldierLoadBuff(playerDoc, soldierName, dragon)
		var techBuffToInfantry = self.getPlayerMilitaryTechBuff(playerDoc, config.type + "_" + "infantry")
		var techBuffToArcher = self.getPlayerMilitaryTechBuff(playerDoc, config.type + "_" + "archer")
		var techBuffToCavalry = self.getPlayerMilitaryTechBuff(playerDoc, config.type + "_" + "cavalry")
		var techBuffToSiege = self.getPlayerMilitaryTechBuff(playerDoc, config.type + "_" + "siege")
		var soldierForFight = {
			name:soldierName,
			star:soldierStar,
			type:config.type,
			currentCount:soldierCount,
			totalCount:soldierCount,
			woundedCount:0,
			power:config.power,
			hp:Math.floor(config.hp * (1 + hpBuff)),
			load:Math.floor(config.load * (1 + loadBuff)),
			citizen:config.citizen,
			morale:100,
			round:0,
			attackPower:{
				infantry:Math.floor(config.infantry * (1 + atkBuff + techBuffToInfantry)),
				archer:Math.floor(config.archer * (1 + atkBuff + techBuffToArcher)),
				cavalry:Math.floor(config.cavalry * (1 + atkBuff + techBuffToCavalry)),
				siege:Math.floor(config.siege * (1 + atkBuff + techBuffToSiege)),
				wall:Math.floor(config.wall * (1 + atkBuff + atkWallBuff))
			},
			killedSoldiers:[]
		}
		soldiersForFight.push(soldierForFight)
	})
	soldiersForFight = _.sortBy(soldiersForFight, function(soldier){
		return -(soldier.power * soldier.totalCount)
	})
	return soldiersForFight
}

/**
 * 创建战斗用军队
 * @param soldiers
 * @returns {Array}
 */
Utils.createSoldiersForFight = function(soldiers){
	var self = this
	var soldiersForFight = []
	_.each(soldiers, function(soldier){
		var soldierName = soldier.name
		var soldierCount = soldier.count
		var soldierStar = soldier.star
		var config = null
		if(self.isNormalSoldier(soldierName)){
			config = Soldiers.normal[soldierName + "_" + soldierStar]
		}else{
			config = Soldiers.special[soldierName]
		}

		var soldierForFight = {
			name:soldierName,
			star:soldierStar,
			type:config.type,
			currentCount:soldierCount,
			totalCount:soldierCount,
			woundedCount:0,
			power:config.power,
			hp:config.hp,
			load:config.load,
			citizen:config.citizen,
			morale:100,
			round:0,
			attackPower:{
				infantry:config.infantry,
				archer:config.archer,
				cavalry:config.cavalry,
				siege:config.siege,
				wall:config.wall
			},
			killedSoldiers:[]
		}
		soldiersForFight.push(soldierForFight)
	})

	soldiersForFight = _.sortBy(soldiersForFight, function(soldier){
		return -(soldier.power * soldier.totalCount)
	})
	return soldiersForFight
}

/**
 * 创建玩家战斗用龙
 * @param playerDoc
 * @param dragon
 * @param terrain
 * @returns {*}
 */
Utils.createPlayerDragonForFight = function(playerDoc, dragon, terrain){
	this.refreshPlayerDragonsHp(playerDoc, dragon)
	var dragonForFight = {
		type:dragon.type,
		level:dragon.level,
		strength:this.getDragonStrength(dragon, terrain),
		vitality:this.getDragonVitality(dragon),
		maxHp:this.getDragonHpMax(dragon),
		totalHp:dragon.hp,
		currentHp:dragon.hp,
		isWin:false
	}
	return dragonForFight
}

/**
 * 创建圣地,村落中的战斗用龙
 * @param dragon
 * @param terrain
 * @returns {{type: *, level: *, strength: *, vitality: *, maxHp: number, totalHp: number, currentHp: number, isWin: boolean}}
 */
Utils.createDragonForFight = function(dragon, terrain){
	var dragonForFight = {
		type:dragon.type,
		level:dragon.level,
		strength:this.getDragonStrength(dragon, terrain),
		vitality:this.getDragonVitality(dragon),
		maxHp:this.getDragonHpMax(dragon),
		totalHp:this.getDragonHpMax(dragon),
		currentHp:this.getDragonHpMax(dragon),
		isWin:false
	}
	return dragonForFight
}

/**
 * 创建战斗用的城墙
 * @param playerDoc
 * @returns {*}
 */
Utils.createPlayerWallForFight = function(playerDoc){
	var getProperty = function(type, level, key){
		return BuildingFunction[type][level][key]
	}
	var getPowersByType = function(type){
		var power = getProperty("tower", playerDoc.buildings.location_22.level, type)
		return power
	}
	var itemDefencePowerBuff = this.getPlayerProductionTechBuff(playerDoc, "reinforcing")
	var itemAttackPowerBuff = this.getPlayerProductionTechBuff(playerDoc, "seniorTower")
	var wall = {
		maxHp:getProperty("wall", playerDoc.buildings.location_21.level, "wallHp"),
		totalHp:playerDoc.resources.wallHp,
		currentHp:playerDoc.resources.wallHp,
		round:0,
		attackPower:{
			infantry:Math.floor(getPowersByType("infantry") * (1 + itemAttackPowerBuff)),
			archer:Math.floor(getPowersByType("archer") * (1 + itemAttackPowerBuff)),
			cavalry:Math.floor(getPowersByType("cavalry") * (1 + itemAttackPowerBuff)),
			siege:Math.floor(getPowersByType("siege") * (1 + itemAttackPowerBuff))
		},
		defencePower:Math.floor(getPowersByType("defencePower") * (1 + itemDefencePowerBuff)),
		killedSoldiers:[]
	}
	return wall
}

/**
 * 获取圣地部队信息
 * @param allianceDoc
 * @param stageName
 * @returns {Array}
 */
Utils.getAllianceShrineStageTroops = function(allianceDoc, stageName){
	var troops = []
	var troopStrings = AllianceShrine.shrineStage[stageName].troops.split("&")
	for(var i = 0; i < troopStrings.length; i++){
		var troopString = troopStrings[i]
		var soldierConfigStrings = troopString.split(",")
		var dragonConfig = soldierConfigStrings.shift()
		var dragonParams = dragonConfig.split("_")
		var dragon = {
			type:dragonParams[0],
			star:parseInt(dragonParams[1]),
			level:parseInt(dragonParams[2])
		}
		var dragonForFight = this.createDragonForFight(dragon, allianceDoc.basicInfo.terrain)
		var soldiers = []
		_.each(soldierConfigStrings, function(soldierConfigString){
			var params = soldierConfigString.split("_")
			var soldierName = params[0]
			var soldierStar = parseInt(params[1])
			var soldierCount = parseInt(params[2])
			var soldier = {
				name:soldierName,
				star:soldierStar,
				count:soldierCount
			}
			soldiers.push(soldier)
		})
		var soldiersForFight = this.createSoldiersForFight(soldiers)
		troops.push({
			stageName:stageName,
			troopNumber:i + 1,
			dragonForFight:dragonForFight,
			soldiersForFight:soldiersForFight
		})
	}
	_.each(troops, function(troop){
		_.sortBy(troop.soldiersForFight, function(soldier){
			return -soldier.power * soldier.count
		})
	})

	var getSoldiersTotalPower = function(soldiers){
		var totalPower = 0
		_.each(soldiers, function(soldier){
			totalPower += soldier.power * soldier.count
		})
	}
	troops = _.sortBy(troops, function(troop){
		return -getSoldiersTotalPower(troop.soldiersForFight)
	})
	return troops
}

/**
 * 获取玩家战损兵力去医院的数量
 * @param playerDoc
 * @param dragon
 * @returns {number}
 */
Utils.getPlayerTreatSoldierPercent = function(playerDoc, dragon){
	var basePercent = 0.3
	var skillBuff = 0
	var equipmentBuff = 0

	var dragonSkillName = "recover"
	var skill = _.find(dragon.skills, function(skill){
		return _.isEqual(skill.name, dragonSkillName)
	})
	if(_.isObject(skill)){
		var skillConfig = Dragons.dragonSkills[dragonSkillName]
		skillBuff = skill.level * skillConfig.effectPerLevel
	}

	var equipmentBuffKey = "recoverAdd"
	_.each(dragon.equipments, function(equipment){
		_.each(equipment.buffs, function(key){
			if(_.isEqual(key, equipmentBuffKey)){
				equipmentBuff += DragonEquipments.equipmentBuff[equipmentBuffKey].buffEffect
			}
		})
	})

	return basePercent + skillBuff + equipmentBuff
}

/**
 * 获取士兵士气减少百分比
 * @param playerDoc
 * @param dragon
 * @returns {number}
 */
Utils.getPlayerSoldierMoraleDecreasedPercent = function(playerDoc, dragon){
	var basePercent = 1
	var skillBuff = 0
	var dragonSkillName = "insensitive"
	var skill = _.find(dragon.skills, function(skill){
		return _.isEqual(skill.name, dragonSkillName)
	})
	if(_.isObject(skill)){
		var skillConfig = Dragons.dragonSkills[dragonSkillName]
		skillBuff = skill.level * skillConfig.effectPerLevel
	}

	return basePercent - skillBuff
}

/**
 * 获取敌方士兵士气减少百分比
 * @param playerDoc
 * @param dragon
 * @returns {number}
 */
Utils.getEnemySoldierMoraleAddedPercent = function(playerDoc, dragon){
	var skillBuff = 0
	var dragonSkillName = "frenzied"
	var skill = _.find(dragon.skills, function(skill){
		return _.isEqual(skill.name, dragonSkillName)
	})
	if(_.isObject(skill)){
		var skillConfig = Dragons.dragonSkills[dragonSkillName]
		skillBuff = skill.level * skillConfig.effectPerLevel
	}

	return skillBuff
}

/**
 * 圣地战斗结束后,获取需要的结果
 * @param stageName
 * @param isWin
 * @param fightDatas
 * @returns {*}
 */
Utils.getAllianceShrineStageResultDatas = function(stageName, isWin, fightDatas){
	var self = this
	var playerDatas = {}
	var woundedSoldiers = {}
	var damagedSoldiers = {}
	var playerRewards = {}
	var playerKills = {}
	var playerDragonHps = {}
	var fightStar = 0
	var totalDeath = 0
	_.each(fightDatas, function(fightData){
		_.each(fightData.roundDatas, function(roundData){
			if(!_.isObject(playerDatas[roundData.playerId])){
				playerDatas[roundData.playerId] = {
					id:roundData.playerId,
					name:roundData.playerName,
					kill:0,
					rewards:[]
				}
				woundedSoldiers[roundData.playerId] = {}
				damagedSoldiers[roundData.playerId] = {}
				playerKills[roundData.playerId] = 0
				playerDragonHps[roundData.playerId] = 0
			}
			var playerData = playerDatas[roundData.playerId]
			playerDragonHps[roundData.playerId] += roundData.attackDragonFightData.hpDecreased
			_.each(roundData.defenceSoldierRoundDatas, function(defenceSoldierRoundData){
				var soldierConfig = Soldiers.normal[defenceSoldierRoundData.soldierName + "_" + defenceSoldierRoundData.soldierStar]
				var kill = defenceSoldierRoundData.soldierDamagedCount * soldierConfig.citizen
				playerData.kill += kill
				playerKills[roundData.playerId] += kill
			})
			_.each(roundData.attackSoldierRoundDatas, function(attackSoldierRoundData){
				var soldierConfig = function(){
					if(self.isNormalSoldier(attackSoldierRoundData.soldierName)){
						soldierConfig = Soldiers.normal[attackSoldierRoundData.soldierName + "_" + attackSoldierRoundData.soldierStar]
					}else{
						soldierConfig = Soldiers.special[attackSoldierRoundData.soldierName]
					}
					return soldierConfig
				}()
				totalDeath += attackSoldierRoundData.soldierDamagedCount * soldierConfig.citizen
				if(!_.isObject(woundedSoldiers[roundData.playerId][attackSoldierRoundData.soldierName])){
					woundedSoldiers[roundData.playerId][attackSoldierRoundData.soldierName] = {
						name:attackSoldierRoundData.soldierName,
						count:0
					}
					damagedSoldiers[roundData.playerId][attackSoldierRoundData.soldierName] = {
						name:attackSoldierRoundData.soldierName,
						count:0
					}
				}
				var woundedSoldier = woundedSoldiers[roundData.playerId][attackSoldierRoundData.soldierName]
				woundedSoldier.count += attackSoldierRoundData.soldierWoundedCount
				var damagedSoldier = damagedSoldiers[roundData.playerId][attackSoldierRoundData.soldierName]
				damagedSoldier.count += attackSoldierRoundData.soldierDamagedCount
			})
		})
	})

	if(isWin){
		fightStar += 1
		if(fightDatas.length <= 1){
			fightStar += 1
			if(totalDeath <= AllianceShrine.shrineStage[stageName].star2DeathCitizen){
				fightStar += 1
			}
		}
	}

	var stageConfig = AllianceShrine.shrineStage[stageName]
	_.each(playerDatas, function(playerData, playerId){
		var rewardStrings = null
		if(playerData.kill >= stageConfig.goldKill){
			rewardStrings = stageConfig.goldRewards.split(",")
			_.each(rewardStrings, function(rewardString){
				var param = rewardString.split(":")
				var type = param[0]
				var name = param[1]
				var count = parseInt(param[2])
				playerData.rewards.push({
					type:type,
					name:name,
					count:count
				})
			})
		}else if(playerData.kill >= stageConfig.silverKill){
			rewardStrings = stageConfig.silverRewards.split(",")
			_.each(rewardStrings, function(rewardString){
				var param = rewardString.split(":")
				var type = param[0]
				var name = param[1]
				var count = parseInt(param[2])
				playerData.rewards.push({
					type:type,
					name:name,
					count:count
				})
			})
		}else if(playerData.kill >= stageConfig.bronzeKill){
			rewardStrings = stageConfig.bronzeRewards.split(",")
			_.each(rewardStrings, function(rewardString){
				var param = rewardString.split(":")
				var type = param[0]
				var name = param[1]
				var count = parseInt(param[2])
				playerData.rewards.push({
					type:type,
					name:name,
					count:count
				})
			})
		}
		playerRewards[playerId] = playerData.rewards
	})

	playerDatas = _.values(playerDatas)
	playerDatas.sort(function(a, b){
		return b.kill - a.kill
	})

	_.each(damagedSoldiers, function(damagedSoldier, playerId){
		damagedSoldiers[playerId] = _.values(damagedSoldier)
	})
	_.each(woundedSoldiers, function(woundedSoldier, playerId){
		woundedSoldiers[playerId] = _.values(woundedSoldier)
	})
	var params = {
		playerDatas:playerDatas,
		fightStar:fightStar,
		damagedSoldiers:damagedSoldiers,
		woundedSoldiers:woundedSoldiers,
		playerRewards:playerRewards,
		playerKills:playerKills,
		playerDragonHps:playerDragonHps
	}
	return params
}

/**
 * 联盟圣地关卡是否解锁
 * @param allianceDoc
 * @param stageName
 */
Utils.isAllianceShrineStageLocked = function(allianceDoc, stageName){
	var config = AllianceShrine.shrineStage[stageName]
	if(config.index == 1) return false
	var previousStageName = null
	_.each(AllianceShrine.shrineStage, function(theConfig){
		if(theConfig.index == config.index - 1) previousStageName = theConfig.stageName
	})

	var stageData = LogicUtils.getAllianceShrineStageData(allianceDoc, stageName)
	return !_.isObject(stageData)
}

/**
 * 获取联盟圣地战争联盟获得的荣耀
 * @param stageName
 * @param fightStar
 * @returns {*}
 */
Utils.getAllianceShrineStageFightHoner = function(stageName, fightStar){
	var config = AllianceShrine.shrineStage[stageName]
	var honerName = "star" + fightStar + "Honour"
	return config[honerName]
}

/**
 * 获取联盟战准备期总时间
 * @returns {number}
 */
Utils.getAllianceFightPrepareTime = function(){
	return AllianceInit.intInit.allianceFightPrepareTime.value * 1000
}

/**
 * 获取联盟战战争期总时间
 * @returns {number}
 */
Utils.getAllianceFightTotalFightTime = function(){
	return AllianceInit.intInit.allianceFightTotalFightTime.value * 1000
}

/**
 * 获取联盟战单场战斗所需的时间
 * @returns {number}
 */
Utils.getAllianceFightSecondsPerFight = function(){
	return AllianceInit.intInit.allianceFightTimePerFight.value * 1000
}

/**
 * 获取联盟战后联盟获得的保护时间
 * @param allianceDoc
 * @returns {number}
 */
Utils.getAllianceProtectTimeAfterAllianceFight = function(allianceDoc){
	return 60 * 1000
}

/**
 * 获取龙的血量的最大值
 * @param dragon
 * @returns {number}
 */
Utils.getDragonHpMax = function(dragon){
	var vitality = this.getDragonVitality(dragon)
	return vitality * 2
}

/**
 * 联盟协防部队是否已达最大数量
 * @param allianceDoc
 * @param playerDoc
 * @returns {boolean}
 */
Utils.isAlliancePlayerBeHelpedTroopsReachMax = function(allianceDoc, playerDoc){
	var currentCount = LogicUtils.getAlliancePlayerBeHelpedTroopsCount(allianceDoc, playerDoc)
	return currentCount >= AllianceInit.intInit.allianceHelpDefenceTroopsMaxCount.value
}

/**
 * 联盟复仇时间是否过期
 * @param allianceFightReport
 * @returns {boolean}
 */
Utils.isAllianceRevengeTimeExpired = function(allianceFightReport){
	return Date.now() > allianceFightReport.fightTime + (AllianceInit.intInit.allianceRevengeMaxTime.value * 1000)
}

/**
 * 获取龙的力量修正  结果大于0,防御方力量降低返回值的百分比, 结果小于0,攻击方防御降低返回值绝对值的百分比
 * @param attackSoldiersForFight
 * @param defenceSoldiersForFight
 * @returns {number}
 */
Utils.getDragonFightFixedEffect = function(attackSoldiersForFight, defenceSoldiersForFight){
	var getSumPower = function(soldiersForFight){
		var power = 0
		_.each(soldiersForFight, function(soldierForFight){
			power += soldierForFight.power * soldierForFight.totalCount
		})
		return power
	}
	var getEffectPercent = function(multiple){
		var configs = Dragons.fightFix
		for(var i = 0; i < configs.length; i++){
			var config = configs[i]
			if(config.multipleMax > multiple){
				return config.effect
			}
		}
		return configs[configs.length - 1].effect
	}

	var attackSumPower = getSumPower(attackSoldiersForFight)
	var defenceSumPower = getSumPower(defenceSoldiersForFight)
	var effect = attackSumPower >= defenceSumPower ? getEffectPercent(attackSumPower / defenceSumPower) : -getEffectPercent(defenceSumPower / attackSumPower)
	return effect
}

/**
 * 刷新玩家龙的Hp信息
 * @param playerDoc
 * @param dragon
 */
Utils.refreshPlayerDragonsHp = function(playerDoc, dragon){
	var self = this
	if(!_.isObject(playerDoc)) return
	var config = BuildingFunction.dragonEyrie[playerDoc.buildings.location_4.level]
	var dragons = arguments.length > 1 ? [dragon] : playerDoc.dragons
	_.each(dragons, function(dragon){
		if(dragon.hp > 0 && dragon.level > 0 && !_.isEqual(dragon.status, Consts.DragonStatus.March)){
			var dragonMaxHp = self.getDragonHpMax(dragon)
			if(dragon.hp < dragonMaxHp){
				var totalMilSeconds = Date.now() - dragon.hpRefreshTime
				var recoveryPerMilSecond = config.hpRecoveryPerHour / 60 / 60 / 1000
				var itemBuff = self.isPlayerHasItemEvent(playerDoc, "dragonHpBonus") ? 0.3 : 0
				var hpRecovered = Math.floor(totalMilSeconds * recoveryPerMilSecond * (1 + itemBuff))
				dragon.hp += hpRecovered
				dragon.hp = dragon.hp > dragonMaxHp ? dragonMaxHp : dragon.hp
			}
		}
		dragon.hpRefreshTime = Date.now()
	})
}

/**
 * 更新龙的属性
 * @param playerDoc
 * @param dragon
 * @param expAdd
 */
Utils.addPlayerDragonExp = function(playerDoc, dragon, expAdd){
	dragon.exp += expAdd
	var currentStarMaxLevel = Dragons.dragonAttributes[dragon.star].levelMax
	var nextLevelExpNeed = Dragons.dragonAttributes[dragon.star].perLevelExp * Math.pow(dragon.level, 2)
	if(dragon.exp >= nextLevelExpNeed){
		if(dragon.level >= currentStarMaxLevel) dragon.exp = nextLevelExpNeed
		else{
			dragon.level += 1
			dragon.exp -= nextLevelExpNeed
		}
	}
}

/**
 * 获取玩家士兵占用人口
 * @param playerDoc
 * @param soldiers
 */
Utils.getPlayerSoldiersCitizen = function(playerDoc, soldiers){
	var self = this
	var totalCitizen = 0
	_.each(soldiers, function(soldier){
		if(soldier.count > 0){
			var config = self.getPlayerSoldierConfig(playerDoc, soldier.name)
			totalCitizen += config.citizen * soldier.count
		}
	})
	return totalCitizen
}

/**
 * 获取龙的最大带兵量
 * @param playerDoc
 * @param dragon
 */
Utils.getPlayerDragonMaxCitizen = function(playerDoc, dragon){
	var leaderShip = this.getPlayerDragonLeadership(playerDoc, dragon)
	return leaderShip * AllianceInit.intInit.citizenPerLeadership.value
}

/**
 * 获取防守部队类型和数量
 * @param playerDoc
 * @returns {Array}
 */
Utils.getPlayerDefenceSoldiers = function(playerDoc){
	var self = this
	var defenceSoldiers = []
	var defenceDragon = LogicUtils.getPlayerDefenceDragon(playerDoc)
	if(!_.isObject(defenceDragon)) return defenceSoldiers

	var getSoldiers = function(soldiers){
		var theSoldiers = []
		_.each(soldiers, function(count, name){
			if(count > 0){
				var theSoldier = {
					name:name,
					count:count
				}
				theSoldiers.push(theSoldier)
			}
		})
		return theSoldiers
	}

	var defenceDragonMaxCitizen = this.getPlayerDragonMaxCitizen(playerDoc, defenceDragon)
	var playerSoldiersTotalCitizen = this.getPlayerSoldiersCitizen(playerDoc, getSoldiers(playerDoc.soldiers))
	var citizenPercent = playerSoldiersTotalCitizen > 0 ? defenceDragonMaxCitizen / playerSoldiersTotalCitizen : 0
	citizenPercent = citizenPercent > 1 ? 1 : citizenPercent
	_.each(playerDoc.soldiers, function(count, name){
		if(count > 0){
			var config = self.getPlayerSoldierConfig(playerDoc, name)
			var totalCitizen = config.citizen * count
			var defenceSoldier = {
				name:name,
				count:Math.floor(totalCitizen * citizenPercent / config.citizen)
			}
			defenceSoldiers.push(defenceSoldier)
		}
	})
	return defenceSoldiers
}

/**
 * 获取玩家部队负重
 * @param playerDoc
 * @param soldiers
 * @returns {number}
 */
Utils.getPlayerSoldiersTotalLoad = function(playerDoc, soldiers){
	var self = this
	var totalLoad = 0
	_.each(soldiers, function(soldier){
		var config = self.getPlayerSoldierConfig(playerDoc, soldier.name)
		totalLoad += config.load * soldier.count
	})
	return totalLoad
}

/**
 * 获取玩家对某资源的采集熟练度等级
 * @param playerDoc
 * @param resourceType
 * @returns {*}
 */
Utils.getPlayerCollectLevel = function(playerDoc, resourceType){
	var collectExp = playerDoc.allianceInfo[resourceType + "Exp"]
	var collectExpConfig = PlayerInitData.collectLevel
	for(var i = collectExpConfig.length - 1; i >= 1; i--){
		var expFrom = collectExpConfig[i].expFrom
		if(collectExp >= expFrom) return i
	}
	return 1
}

/**
 * 获取采集资源需要消耗的时间
 * @param playerDoc
 * @param soldierLoadTotal
 * @param allianceVillage
 * @returns {*}
 */
Utils.getPlayerCollectResourceInfo = function(playerDoc, soldierLoadTotal, allianceVillage){
	var villageResourceMax = this.getAllianceVillageResourceMax(allianceVillage.type, allianceVillage.level)
	var villageResourceCurrent = allianceVillage.resource
	var collectTotal = soldierLoadTotal > villageResourceCurrent ? villageResourceCurrent : soldierLoadTotal
	var resourceType = allianceVillage.type.slice(0, -7)
	var playerCollectLevel = this.getPlayerCollectLevel(playerDoc, resourceType)
	var collectPerHour = PlayerInitData.collectLevel[playerCollectLevel].collectPercentPerHour * villageResourceMax
	var totalHour = collectTotal / collectPerHour
	return {collectTime:Math.ceil(totalHour * 60 * 60 * 1000), collectTotal:collectTotal}
}

/**
 * 获取联盟村落最大产量
 * @param villageType
 * @param villageLevel
 * @returns {production|*}
 */
Utils.getAllianceVillageResourceMax = function(villageType, villageLevel){
	return AllianceVillage[villageType][villageLevel].production
}

/**
 * 龙经验获取数量
 * @param kill
 * @returns {number}
 */
Utils.getDragonExpAdd = function(kill){
	return Math.floor(kill * AllianceInit.floatInit.dragonExpByKilledCitizen.value)
}

/**
 * 获取采集的资源增值的经验
 * @param name
 * @param count
 * @returns {number}
 */
Utils.getCollectResourceExpAdd = function(name, count){
	name = name.charAt(0).toUpperCase() + name.slice(1)
	var resourceCountPerExp = AllianceInit.intInit["collected" + name + "CountPerExp"].value
	var exp = Math.floor(count / resourceCountPerExp)
	return exp
}

/**
 * 创建龙孵化事件
 * @param playerDoc
 * @param dragon
 * @returns {{id: *, dragonType: *, finishTime: number}}
 */
Utils.createPlayerHatchDragonEvent = function(playerDoc, dragon){
	var needTime = AllianceInit.floatInit.playerHatchDragonNeedHours.value * 60 * 60 * 1000
	var event = {
		id:ShortId.generate(),
		dragonType:dragon.type,
		startTime:Date.now(),
		finishTime:Date.now() + needTime
	}
	return event
}

/**
 * 创建每日任务
 * @returns {Array}
 */
Utils.createDailyQuests = function(){
	var style = 1 + (Math.random() * 3) << 0
	var styleConfig = DailyQuests.dailyQuestStyle[style]
	var questsConfig = DailyQuests.dailyQuests
	var quests = []
	var star1Count = styleConfig.star_1
	var star2Count = styleConfig.star_2
	var star3Count = styleConfig.star_3
	var star4Count = styleConfig.star_4
	var star5Count = styleConfig.star_5
	var starCounts = [star1Count, star2Count, star3Count, star4Count, star5Count]
	for(var i = 0; i < starCounts.length; i++){
		for(var j = 0; j < starCounts[i]; j++){
			var questIndex = (Math.random() * questsConfig.length) >> 0
			var quest = {
				id:ShortId.generate(),
				index:questIndex,
				star:i + 1
			}
			quests.push(quest)
		}
	}
	return quests
}

/**
 * 获取每日任务刷新时间
 * @returns {number}
 */
Utils.getDailyQuestsRefreshTime = function(){
	return PlayerInitData.floatInit.dailyQuestsRefreshHours.value * 60 * 60 * 1000
}

/**
 * 获取为任务添加星级说需宝石
 * @returns {intInit.dailyQuestAddStarNeedGemCount.value|*}
 */
Utils.getDailyQuestAddStarNeedGemCount = function(){
	return PlayerInitData.intInit.dailyQuestAddStarNeedGemCount.value
}

/**
 * 创建每日任务事件
 * @param playerDoc
 * @param quest
 * @returns {{id: *, index: *, star: *, startTime: number, finishTime: number}}
 */
Utils.createPlayerDailyQuestEvent = function(playerDoc, quest){
	var config = DailyQuests.dailyQuestStar[quest.star]
	var now = Date.now()
	var finishTime = now + (config.needMinutes * 60 * 1000)
	var event = {
		id:ShortId.generate(),
		index:quest.index,
		star:quest.star,
		startTime:now,
		finishTime:finishTime
	}

	return event
}

/**
 * 获取玩家每日任务事件奖励
 * @param playerDoc
 * @param questEvent
 * @returns {Array}
 */
Utils.getPlayerDailyQuestEventRewards = function(playerDoc, questEvent){
	var self = this
	var config = DailyQuests.dailyQuests[questEvent.index]
	var townhallLevel = playerDoc.buildings.location_14.level
	var effect = questEvent.star * (1 + (0.02 * townhallLevel))
	var rewards = []
	var rewardStrings = config.rewards.split(",")
	_.each(rewardStrings, function(rewardString){
		var param = rewardString.split(":")
		var type = param[0]
		var name = param[1]
		var itemBuff = self.isPlayerHasItemEvent(playerDoc, "taxesBonus") ? 0.5 : 0
		var count = Math.floor(parseInt(param[2]) * effect * (1 + itemBuff))
		rewards.push({
			type:type,
			name:name,
			count:count
		})
	})
	return rewards
}

/**
 * 玩家资源是否足够
 * @param playerDoc
 * @param type
 * @param name
 * @param count
 */
Utils.isPlayerResourceEnough = function(playerDoc, type, name, count){
	if(_.isUndefined(playerDoc[type][name])) return false
	return playerDoc[type][name] >= count
}

/**
 * 获取出售资源所需的小车
 * @param playerDoc
 * @param resourceType
 * @param resourceName
 * @param resourceCount
 */
Utils.getPlayerCartUsedForSale = function(playerDoc, resourceType, resourceName, resourceCount){
	var resourceCountPerCart = null
	if(_.isEqual(resourceType, "resources")){
		resourceCountPerCart = PlayerInitData.intInit.resourcesPerCart.value
	}else{
		resourceCountPerCart = PlayerInitData.intInit.materialsPerCart.value
	}

	return Math.ceil(resourceCount / resourceCountPerCart)
}

/**
 * 玩家商品出售队列是否足够
 * @param playerDoc
 * @returns {boolean}
 */
Utils.isPlayerSellQueueEnough = function(playerDoc){
	var buildingLevel = playerDoc.buildings.location_16.level
	if(buildingLevel < 1) return false
	var maxSellQueue = BuildingFunction.tradeGuild[buildingLevel].maxSellQueue
	return playerDoc.deals.length < maxSellQueue
}

/**
 * 生产科技名称是否合法
 * @param techName
 * @returns {*}
 */
Utils.isProductionTechNameLegal = function(techName){
	return _.contains(_.keys(ProductionTechs.productionTechs), techName)
}

/**
 * 解锁科技是否合法
 * @param playerDoc
 * @param techName
 * @returns {boolean}
 */
Utils.isPlayerUnlockProductionTechLegal = function(playerDoc, techName){
	var techConfig = ProductionTechs.productionTechs[techName]
	var preTechConfig = _.find(ProductionTechs.productionTechs, function(theTech){
		return theTech.index == techConfig.unlockBy
	})
	var preTech = playerDoc.productionTechs[preTechConfig.name]
	return preTech.level >= techConfig.unlockLevel
}

/**
 * 生产科技是否已达最高等级
 * @param techLevel
 * @returns {boolean}
 */
Utils.isProductionTechReachMaxLevel = function(techLevel){
	return PlayerInitData.intInit.productionTechnologyMaxLevel <= techLevel
}

/**
 * 军事科技名称是否合法
 * @param techName
 * @returns {*}
 */
Utils.isMilitaryTechNameLegal = function(techName){
	return _.contains(_.keys(MilitaryTechs.militaryTechs), techName)
}

/**
 * 玩家军事科技建筑是否建造
 * @param playerDoc
 * @param techName
 */
Utils.isPlayerMilitaryTechBuildingCreated = function(playerDoc, techName){
	var tech = playerDoc.militaryTechs[techName]
	var buildingName = tech.building
	var buildingConfig = _.find(Buildings.buildings, function(building){
		return _.isObject(building) && _.isEqual(buildingName, building.name)
	})
	var building = playerDoc.buildings["location_" + buildingConfig.location]
	return building.level > 0
}

/**
 * 军事科技是否已达最高等级
 * @param techLevel
 * @returns {boolean}
 */
Utils.isMilitaryTechReachMaxLevel = function(techLevel){
	return PlayerInitData.intInit.militaryTechnologyMaxLevel <= techLevel
}

/**
 * 获取升级科技所需的科技点
 * @param playerDoc
 * @param soldierName
 * @returns {Boolean}
 */
Utils.isPlayerUpgradeSoldierStarTechPointEnough = function(playerDoc, soldierName){
	var soldierStar = playerDoc.soldierStars[soldierName]
	var config = Soldiers.normal[soldierName + "_" + soldierStar]
	var soldierType = config.type
	var techPointNeed = config.upgradeTechPointNeed
	var techNames = _.filter(_.keys(playerDoc.militaryTechs), function(name){
		return name.indexOf(soldierType + "_") == 0
	})
	var techPointTotal = 0
	_.each(techNames, function(name){
		var techPointPerLevel = MilitaryTechs.militaryTechs[name].techPointPerLevel
		var tech = playerDoc.militaryTechs[name]
		techPointTotal += techPointPerLevel * tech.level
	})

	return techPointTotal >= techPointNeed
}

/**
 * 道具名称是否存在
 * @param itemName
 * @returns {*}
 */
Utils.isItemNameExist = function(itemName){
	var keys = []
	keys = keys.concat(_.keys(Items.special))
	keys = keys.concat(_.keys(Items.buff))
	keys = keys.concat(_.keys(Items.resource))
	keys = keys.concat(_.keys(Items.speedup))
	return _.contains(keys, itemName)
}

/**
 * 获取某个商品的配置信息
 * @param itemName
 * @returns {*}
 */
Utils.getItemConfig = function(itemName){
	return _.contains(_.keys(Items.special), itemName) ? Items.special[itemName]
		: _.contains(_.keys(Items.buff), itemName) ? Items.buff[itemName]
		: _.contains(_.keys(Items.resource), itemName) ? Items.resource[itemName]
		: Items.speedup[itemName]
}

/**
 * 创建龙死亡事件
 * @param playerDoc
 * @param dragon
 * @returns {{id: *, dragonType: *, startTime: number, finishTime: number}}
 */
Utils.createPlayerDragonDeathEvent = function(playerDoc, dragon){
	var reviveTime = PlayerInitData.intInit.dragonReviveNeedMinutes.value * 60 * 1000
	var event = {
		id:ShortId.generate(),
		dragonType:dragon.type,
		startTime:Date.now(),
		finishTime:Date.now() + reviveTime
	}
	return event
}

/**
 * 根据击杀和地形获取奖励
 * @param killScore
 * @param terrain
 * @returns {Array}
 */
Utils.getRewardsByKillScoreAndTerrain = function(killScore, terrain){
	var ParseConfig = function(config){
		var objects = []
		var configArray_1 = config.split(",")
		_.each(configArray_1, function(config_1){
			var configArray_2 = config_1.split(":")
			var object = {
				type:configArray_2[0],
				name:configArray_2[1],
				count:parseInt(configArray_2[2]),
				weight:parseInt(configArray_2[3])
			}
			objects.push(object)
		})
		return objects
	}
	var SortFunc = function(objects){
		var totalWeight = 0
		_.each(objects, function(object){
			totalWeight += object.weight + 1
		})

		_.each(objects, function(object){
			var weight = object.weight + 1 + (Math.random() * totalWeight << 0)
			object.weight = weight
		})

		return _.sortBy(objects, function(object){
			return -object.weight
		})
	}

	var config = null
	for(var i = KillDropItems[terrain].length - 1; i >= 1; i--){
		var theConfig = KillDropItems[terrain][i]
		if(killScore >= theConfig.killScoreMin){
			config = theConfig
			break
		}
	}

	if(!_.isObject(config)) return []

	var rewards = []
	var items = ParseConfig(config.rewards)
	items = SortFunc(items)
	var item = items[0]
	rewards.push({
		type:item.type,
		name:item.name,
		count:item.count
	})

	return rewards
}

/**
 * 获取所需的赌币
 * @param gachaType
 * @returns {*}
 */
Utils.getCasinoTokeNeededInGachaType = function(gachaType){
	if(_.isEqual(gachaType, Consts.GachaType.Normal)){
		return PlayerInitData.intInit.casinoTokenNeededPerNormalGacha.value
	}
	return PlayerInitData.intInit.casinoTokenNeededPerAdvancedGacha.value
}

/**
 * 获取Gacha出的道具
 * @param gachaType
 * @returns {*}
 */
Utils.getGachaItemByType = function(gachaType){
	var SortFunc = function(objects){
		var totalWeight = 0
		_.each(objects, function(object){
			totalWeight += object.weight + 1
		})

		_.each(objects, function(object){
			var weight = object.weight + 1 + (Math.random() * totalWeight << 0)
			object.weight = weight
		})

		return _.sortBy(objects, function(object){
			return -object.weight
		})
	}

	var items = []
	var itemConfigs = Gacha[gachaType]
	_.each(itemConfigs, function(itemConfig){
		if(_.isObject(itemConfig)){
			var item = {
				name:itemConfig.itemName,
				count:itemConfig.itemCount,
				weight:itemConfig.weight
			}
			items.push(item)
		}
	})

	items = SortFunc(items)
	return items[0]
}

/**
 * 获取每日登陆奖励中当日的奖励道具
 * @param day
 * @returns {*}
 */
Utils.getDay60RewardItem = function(day){
	var configString = Activities.day60[day].rewards
	var configStrings = configString.split(",")
	var rewards = []
	_.each(configStrings, function(configString){
		var params = configString.split(":")
		var reward = {
			type:params[0],
			name:params[1],
			count:parseInt(params[2])
		}
		rewards.push(reward)
	})

	return rewards
}

/**
 * 玩家是否达到在线奖励所需的时间
 * @param playerDoc
 * @param timePoint
 * @returns {boolean}
 */
Utils.isPlayerReachOnlineTimePoint = function(playerDoc, timePoint){
	var onlineTime = playerDoc.countInfo.todayOnLineTime + (Date.now() - playerDoc.countInfo.lastLoginTime)
	var onlineMinutes = Math.floor(onlineTime / 1000 / 60)
	var needMinutes = Activities.online[timePoint].onLineMinutes
	return onlineMinutes >= needMinutes
}

/**
 * 获取在线时间奖励
 * @param timePoint
 * @returns {Array}
 */
Utils.getOnlineRewardItem = function(timePoint){
	var configString = Activities.online[timePoint].rewards
	var configStrings = configString.split(",")
	var rewards = []
	_.each(configStrings, function(configString){
		var params = configString.split(":")
		var reward = {
			type:params[0],
			name:params[1],
			count:parseInt(params[2])
		}
		rewards.push(reward)
	})

	return rewards
}

/**
 * 获取14日登陆奖励
 * @param day
 * @returns {Array}
 */
Utils.getDay14Rewards = function(day){
	var configString = Activities.day14[day].rewards
	var configStrings = configString.split(",")
	var rewards = []
	_.each(configStrings, function(configString){
		var params = configString.split(":")
		var reward = {
			type:params[0],
			name:params[1],
			count:parseInt(params[2])
		}
		rewards.push(reward)
	})

	return rewards
}

/**
 * 获取首冲奖励
 * @returns {Array}
 */
Utils.getFirstIAPRewards = function(){
	var configString = PlayerInitData.stringInit.firstIAPRewards.value
	var configStrings = configString.split(",")
	var rewards = []
	_.each(configStrings, function(configString){
		var params = configString.split(":")
		var reward = {
			type:params[0],
			name:params[1],
			count:parseInt(params[2])
		}
		rewards.push(reward)
	})

	return rewards
}

/**
 * 获取日常任务奖励
 * @param taskType
 * @returns {Array}
 */
Utils.getDailyTaskRewardsByType = function(taskType){
	var configKey = taskType + "DailyTaskRewards"
	var configString = PlayerInitData.stringInit[configKey].value
	var configStrings = configString.split(",")
	var rewards = []
	_.each(configStrings, function(configString){
		var params = configString.split(":")
		var reward = {
			type:params[0],
			name:params[1],
			count:parseInt(params[2])
		}
		rewards.push(reward)
	})

	return rewards
}

/**
 * 获取玩家等级
 * @param playerDoc
 * @returns {*}
 */
Utils.getPlayerLevel = function(playerDoc){
	var levelConfigs = PlayerInitData.playerLevel
	for(var i = levelConfigs.length - 1; i >= 1; i--){
		var levelConfig = levelConfigs[i]
		if(playerDoc.basicInfo.levelExp >= levelConfig.expFrom) return levelConfig.level
	}

	return 1
}

/**
 * 新手冲击奖励是否存在
 * @param levelupIndex
 * @returns {*}
 */
Utils.isLevelupIndexExist = function(levelupIndex){
	return _.isObject(Activities.levelup[levelupIndex])
}

/**
 * 玩家等级是否足够以领取冲级奖励
 * @param playerDoc
 * @param levelupIndex
 * @returns {boolean}
 */
Utils.isPlayerLevelLegalForLevelupIndex = function(playerDoc, levelupIndex){
	var playerLevel = this.getPlayerLevel(playerDoc)
	var needLevel = Activities.levelup[levelupIndex].level
	return playerLevel >= needLevel
}

/**
 * 获取冲级奖励
 * @param levelupIndex
 * @returns {Array}
 */
Utils.getLevelupRewards = function(levelupIndex){
	var configString = Activities.levelup[levelupIndex].rewards
	var configStrings = configString.split(",")
	var rewards = []
	_.each(configStrings, function(configString){
		var params = configString.split(":")
		var reward = {
			type:params[0],
			name:params[1],
			count:parseInt(params[2])
		}
		rewards.push(reward)
	})

	return rewards
}

/**
 * 获取玩家城防大师Buff
 * @param playerDoc
 */
Utils.getPlayerMasterOfDefenderBuffAboutDefenceWall = function(playerDoc){
	var buff = 0
	var itemEvent = _.find(playerDoc.itemEvents, function(event){
		return _.isEqual(event.type, "masterOfDefender")
	})
	if(_.isObject(itemEvent)) buff = 0.2
	return buff
}

/**
 * 玩家是否有相关道具Buff
 * @param playerDoc
 * @param eventType
 * @returns {*}
 */
Utils.isPlayerHasItemEvent = function(playerDoc, eventType){
	return _.some(playerDoc.itemEvents, function(event){
		return _.isEqual(event.type, eventType)
	})
}

/**
 * 获取玩家生产科技的Buff效果
 * @param playerDoc
 * @param techName
 * @returns {number}
 */
Utils.getPlayerProductionTechBuff = function(playerDoc, techName){
	var techConfig = ProductionTechs.productionTechs[techName]
	var tech = playerDoc.productionTechs[techName]
	return tech.level * techConfig.effectPerLevel
}

/**
 * 获取玩家军事科技的Buff效果
 * @param playerDoc
 * @param techName
 * @returns {number}
 */
Utils.getPlayerMilitaryTechBuff = function(playerDoc, techName){
	var techConfig = MilitaryTechs.militaryTechs[techName]
	var tech = playerDoc.militaryTechs[techName]
	return tech.level * techConfig.effectPerLevel
}

/**
 * 获取医院最大容量
 * @param playerDoc
 * @returns {*}
 */
Utils.getPlayerHospitalMaxCitizen = function(playerDoc){
	var itemBuff = this.getPlayerProductionTechBuff(playerDoc, "rescueTent")
	var building = playerDoc.buildings.location_6
	if(building.level < 1) return 0
	var config = BuildingFunction.hospital[building.level]
	return Math.floor(config.maxCitizen * (1 + itemBuff))
}

/**
 * 为玩家添加伤兵
 * @param playerDoc
 * @param playerData
 * @param woundedSoldiers
 */
Utils.addPlayerWoundedSoldiers = function(playerDoc, playerData, woundedSoldiers){
	var maxCitizen = this.getPlayerHospitalMaxCitizen(playerDoc)
	var usedCitizen = this.getPlayerSoldiersCitizen(playerDoc, LogicUtils.getFormatedSoldiers(playerDoc.woundedSoldiers))
	if(maxCitizen > usedCitizen){
		if(!_.isObject(playerData.woundedSoldiers)) playerData.woundedSoldiers = {}
		_.each(woundedSoldiers, function(woundedSoldier){
			playerDoc.woundedSoldiers[woundedSoldier.name] += woundedSoldier.count
			playerData.woundedSoldiers[woundedSoldier.name] = playerDoc.woundedSoldiers[woundedSoldier.name]
		})
	}
	if(_.isEmpty(playerData.woundedSoldiers)) delete playerData.woundedSoldiers
}

/**
 * 获取商城商品的配置信息
 * @returns {GameDatas.StoreItems.items|*}
 */
Utils.getStoreItemConfigs = function(){
	return StoreItems.items
}

/**
 * 根据军事科技名称查找士兵升星事件
 * @param playerDoc
 * @param militaryTechName
 * @returns {*}
 */
Utils.getPlayerSoldierStarUpgradeEvent = function(playerDoc, militaryTechName){
	var buildingName = MilitaryTechs.militaryTechs[militaryTechName].building
	return _.find(playerDoc.soldierStarEvents, function(event){
		var soldierConfig = Soldiers.normal[event.name + "_1"]
		return _.isEqual(soldierConfig.techBuildingName, buildingName)
	})
}

/**
 * 根据士兵名字查找正在升级的军事科技
 * @param playerDoc
 * @param soldierName
 * @returns {*}
 */
Utils.getPlayerMilitaryTechUpgradeEvent = function(playerDoc, soldierName){
	var buildingName = Soldiers.normal[soldierName + "_1"].techBuildingName
	return _.find(playerDoc.militaryTechEvents, function(event){
		var techConfig = MilitaryTechs.militaryTechs[event.name]
		return _.isEqual(techConfig.building, buildingName)
	})
}

/**
 * 检查玩家建筑升级是否合法
 * @param playerDoc
 * @param location
 * @returns {boolean}
 */
Utils.isPlayerBuildingUpgradeLegal = function(playerDoc, location){
	var building = playerDoc.buildings["location_" + location]
	var config = Buildings.buildings[location]
	var configParams = config.preCondition.split("_")
	var preType = configParams[0]
	var preName = configParams[1]
	var preLevel = parseInt(configParams[2])
	if(_.isEqual("building", preType)){
		var preBuilding = this.getPlayerBuildingByType(playerDoc, preName)
		return preBuilding.level >= building.level + preLevel
	}else{
		var houses = this.getPlayerHousesByType(playerDoc, preName)
		houses = _.sortBy(houses, function(house){
			return -house.level
		})
		return houses.length == 0 ? false : houses[0].level >= building.level + preLevel
	}
}

/**
 * 检查玩家小屋升级是否合法
 * @param playerDoc
 * @param buildingLocation
 * @param houseType
 * @param houseLocation
 * @returns {boolean}
 */
Utils.isPlayerHouseUpgradeLegal = function(playerDoc, buildingLocation, houseType, houseLocation){
	var theHouses = playerDoc.buildings["location_" + buildingLocation].houses
	var theHouse = _.find(theHouses, function(house){
		return house.location == houseLocation
	})
	if(!_.isObject(theHouse)) theHouse = {level:0}

	var config = Houses.houses[houseType]
	var configParams = config.preCondition.split("_")
	var preType = configParams[0]
	var preName = configParams[1]
	var preLevel = parseInt(configParams[2])
	if(_.isEqual("building", preType)){
		var preBuilding = this.getPlayerBuildingByType(playerDoc, preName)
		return preBuilding.level >= theHouse.level + preLevel
	}else{
		var houses = this.getPlayerHousesByType(playerDoc, preName)
		houses = _.sortBy(houses, function(house){
			return -house.level
		})
		return houses.length == 0 ? false : houses[0].level >= theHouse.level + preLevel
	}
}

/**
 * 获取玩家冲级奖励过期时间
 * @param playerDoc
 * @returns {*}
 */
Utils.getPlayerLevelupExpireTime = function(playerDoc){
	return playerDoc.countInfo.registerTime + (PlayerInitData.intInit.playerLevelupRewardsHours.value * 60 * 60 * 1000)
}