"use strict"

/**
 * Created by modun on 15/2/1.
 */

var ShortId = require("shortid")
var Https = require("https")
var Promise = require("bluebird")
var _ = require("underscore")

var Utils = require("../utils/utils")
var DataUtils = require("../utils/dataUtils")
var LogicUtils = require("../utils/logicUtils")
var ErrorUtils = require("../utils/errorUtils")
var Events = require("../consts/events")
var Consts = require("../consts/consts")
var Define = require("../consts/define")

var GameDatas = require("../datas/GameDatas")
var StoreItems = GameDatas.StoreItems

var PlayerIAPService = function(app){
	this.app = app
	this.env = app.get("env")
	this.logService = app.get("logService")
	this.pushService = app.get("pushService")
	this.timeEventService = app.get("timeEventService")
	this.globalChannelService = app.get("globalChannelService")
	this.allianceDao = app.get("allianceDao")
	this.playerDao = app.get("playerDao")
	this.Billing = app.get("Billing")
	this.GemAdd = app.get("GemAdd")
	this.billingValidateHost = "sandbox.itunes.apple.com"
	this.billingValidatePath = "/verifyReceipt"
}

module.exports = PlayerIAPService
var pro = PlayerIAPService.prototype


/**
 21000
 The App Store could not read the JSON object you provided.
 21002
 The data in the receipt-data property was malformed or missing.
 21003
 The receipt could not be authenticated.
 21004
 The shared secret you provided does not match the shared secret on file for your account.
 Only returned for iOS 6 style transaction receipts for auto-renewable subscriptions.
 21005
 The receipt server is not currently available.
 21006
 This receipt is valid but the subscription has expired. When this status code is returned to your server, the receipt data is also decoded and returned as part of the response.
 Only returned for iOS 6 style transaction receipts for auto-renewable subscriptions.
 21007
 This receipt is from the test environment, but it was sent to the production environment for verification. Send it to the test environment instead.
 21008
 This receipt is from the production environment, but it was sent to the test environment for verification. Send it to the production environment instead.
 */

/**
 * 去苹果商店验证
 * @param playerDoc
 * @param receiptData
 * @param callback
 */
var BillingValidate = function(playerDoc, receiptData, callback){
	var postData = {
		"receipt-data":new Buffer(receiptData).toString("base64")
	}
	var httpOptions = {
		host:this.billingValidateHost,
		path:this.billingValidatePath,
		method:"post"
	}
	var request = Https.request(httpOptions, function(response){
		response.on("data", function(data){
			var jsonObj = JSON.parse(data.toString())
			if(jsonObj.status == 0){
				callback(null, jsonObj.receipt)
			}else if(jsonObj.status == 21005){
				callback(ErrorUtils.iapServerNotAvailable(playerDoc._id, jsonObj))
			}else{
				callback(ErrorUtils.iapValidateFaild(playerDoc._id, jsonObj))
			}
		})
	})

	request.on("error", function(e){
		callback(ErrorUtils.netErrorWithIapServer(playerDoc._id, e.message))
	})
	request.write(JSON.stringify(postData))
	request.end()
}

/**
 * 创建订单记录
 * @param playerId
 * @param receiptObject
 * @returns {{playerId: *, transactionId: *, productId: *, quantity: (*|BillingSchema.quantity), itemId: *, purchaseDate: *}}
 */
var CreateBillingItem = function(playerId, receiptObject){
	var billing = {
		playerId:playerId,
		transactionId:receiptObject.transaction_id,
		productId:receiptObject.product_id,
		quantity:receiptObject.quantity,
		itemId:receiptObject.item_id,
		purchaseDate:receiptObject.purchase_date
	}
	return billing
}

/**
 * 获取商品道具奖励
 * @param config
 * @returns {{rewardsToMe: Array, rewardToAllianceMember: *}}
 * @constructor
 */
var GetStoreItemRewardsFromConfig = function(config){
	var rewardsToMe = []
	var rewardToAllianceMember = null
	var configArray_1 = config.rewards.split(",")
	_.each(configArray_1, function(config){
		var rewardArray = config.split(":")
		var reward = {
			type:rewardArray[0],
			name:rewardArray[1],
			count:parseInt(rewardArray[2])
		}
		rewardsToMe.push(reward)
	})
	if(!_.isEmpty(config.allianceRewards)){
		var rewardArray = config.allianceRewards.split(":")
		rewardToAllianceMember = {
			type:rewardArray[0],
			name:rewardArray[1],
			count:parseInt(rewardArray[2])
		}
	}

	return {rewardsToMe:rewardsToMe, rewardToAllianceMember:rewardToAllianceMember}
}

var SendAllianceMembersRewards = function(senderId, senderName, memberIds, reward){
	var self = this
	if(memberIds.length == 0) return Promise.resolve()
	var memberId = memberIds.shift()
	if(_.isEqual(memberId, senderId)) return SendAllianceMembersRewards.call(this, senderId, senderName, memberIds, reward)
	var memberDoc = null
	var memberData = []
	return this.playerDao.findAsync(memberId).then(function(doc){
		memberDoc = doc
		var iapGift = {
			id:ShortId.generate(),
			from:senderName,
			name:reward.name,
			count:reward.count,
			time:Date.now()
		}
		if(memberDoc.iapGifts.length >= Define.PlayerIapGiftsMaxSize){
			var giftToRemove = memberDoc.iapGifts[0]
			memberData.push(["iapGifts." + memberDoc.iapGifts.indexOf(giftToRemove), null])
			LogicUtils.removeItemInArray(memberDoc.iapGifts, giftToRemove)
		}
		memberDoc.iapGifts.push(iapGift)
		memberData.push(["iapGifts." + memberDoc.iapGifts.indexOf(iapGift), iapGift])
		return Promise.resolve()
	}).then(function(){
		return self.playerDao.updateAsync(memberDoc)
	}).then(function(){
		return self.pushService.onPlayerDataChangedAsync(memberDoc, memberData)
	}).then(function(){
		return SendAllianceMembersRewards.call(self, senderId, senderName, memberIds, reward)
	}).catch(function(e){
		self.logService.onIapGiftError("playerIAPService.SendAllianceMembersRewards", {senderId:senderId, senderName:senderName, memberId:memberId, reward:reward}, e.stack)
		var funcs = []
		if(_.isObject(memberDoc)){
			funcs.push(self.playerDao.removeLockAsync(memberDoc._id))
		}
		if(funcs.length > 0){
			return Promise.all(funcs).then(function(){
				return SendAllianceMembersRewards.call(self, senderId, senderName, memberIds, reward)
			})
		}else{
			return SendAllianceMembersRewards.call(self, senderId, senderName, memberIds, reward)
		}
	})
}

/**
 * 上传IAP信息
 * @param playerId
 * @param transactionId
 * @param receiptData
 * @param callback
 */
pro.addPlayerBillingData = function(playerId, transactionId, receiptData, callback){
	if(!_.isFunction(callback)){
		throw new Error("callback 不合法")
	}
	if(!_.isString(playerId)){
		callback(new Error("playerId 不合法"))
		return
	}
	if(!_.isString(transactionId)){
		callback(new Error("transactionId 不合法"))
		return
	}
	if(!_.isString(receiptData) || _.isEmpty(receiptData.trim())){
		callback(new Error("receiptData 不合法"))
	}

	callback()

	//var self = this
	//var playerDoc = null
	//var allianceDoc = null
	//var billing = null
	//var playerData = []
	//var updateFuncs = []
	//var rewards = null
	//this.playerDao.findAsync(playerId).then(function(doc){
	//	playerDoc = doc
	//	return self.Billing.findOneAsync({transactionId:transactionId})
	//}).then(function(doc){
	//	if(_.isObject(doc)) return Promise.reject(ErrorUtils.duplicateIAPTransactionId(playerId, transactionId, receiptData))
	//	var billingValidateAsync = Promise.promisify(BillingValidate, self)
	//	return billingValidateAsync(playerDoc, receiptData)
	//}).then(function(responseReceiptData){
	//	billing = CreateBillingItem(playerId, responseReceiptData)
	//	return self.Billing.createAsync(billing)
	//}).then(function(){
	//	var quantity = billing.quantity
	//	var itemConfig = _.find(StoreItems.items, function(item){
	//		if(_.isObject(item)){
	//			return _.isEqual(item.productId, billing.productId)
	//		}
	//	})
	//	if(!_.isObject(itemConfig)) return Promise.reject(ErrorUtils.iapProductNotExist(playerId, responseReceiptData, billing))
	//	playerDoc.resources.gem += itemConfig.gem * quantity
	//	playerData.push(["resources.gem", playerDoc.resources.gem])
	//	playerDoc.countInfo.iapCount += 1
	//	playerData.push(["countInfo.iapCount", playerDoc.countInfo.iapCount])
	//	rewards = GetStoreItemRewardsFromConfig(itemConfig)
	//	_.each(rewards.rewardsToMe, function(reward){
	//		var resp = LogicUtils.addPlayerItem(playerDoc, reward.name, reward.count * quantity)
	//		playerData.push(["items." + playerDoc.items.indexOf(resp.item), resp.item])
	//	})
	//	var gemAdd = {
	//		playerId:playerId,
	//		add:itemConfig.gem * quantity,
	//		left:playerDoc.resources.gem,
	//		from:Consts.GemAddFrom.Iap,
	//		rewards:rewards
	//	}
	//	updateFuncs.push([self.GemAdd, self.GemAdd.createAsync, gemAdd])
	//	updateFuncs.push([self.playerDao, self.playerDao.updateAsync, playerDoc])
	//	return Promise.resolve()
	//}).then(function(){
	//	if(_.isObject(rewards.rewardToAllianceMember) && _.isObject(playerDoc.alliance)){
	//		return self.allianceDao.findAsync(playerDoc.alliance.id, true)
	//	}
	//	return Promise.resolve()
	//}).then(function(doc){
	//	if(_.isObject(rewards.rewardToAllianceMember) && _.isObject(playerDoc.alliance)){
	//		allianceDoc = doc
	//		updateFuncs.push([self.allianceDao, self.allianceDao.removeLockAsync, allianceDoc._id])
	//		var memberIds = _.pluck(allianceDoc.members, "id")
	//		return SendAllianceMembersRewards.call(self, playerDoc._id, playerDoc.basicInfo.name, memberIds, rewards.rewardToAllianceMember)
	//	}
	//	return Promise.resolve()
	//}).then(function(){
	//	return LogicUtils.excuteAll(updateFuncs)
	//}).then(function(){
	//	callback(null, [playerData, billing.transactionId])
	//}).catch(function(e){
	//	var funcs = []
	//	if(_.isObject(playerDoc)){
	//		funcs.push(self.playerDao.removeLockAsync(playerDoc._id))
	//	}
	//	if(_.isObject(allianceDoc)){
	//		funcs.push(self.playerDao.removeLockAsync(playerDoc._id))
	//	}
	//	if(funcs.length > 0){
	//		Promise.all(funcs).then(function(){
	//			callback(e)
	//		})
	//	}else{
	//		callback(e)
	//	}
	//})
}