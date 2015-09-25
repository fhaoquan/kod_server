"use strict"

/**
 * Created by modun on 14-8-7.
 */

var _ = require("underscore")
var Promise = require("bluebird")

var Consts = require("../consts/consts")
var Events = require("../consts/events")
var Utils = require("../utils/utils")
var LogicUtils = require("../utils/logicUtils")

var PushService = function(app){
	this.app = app
	this.channelService = app.get("channelService")
	this.logService = app.get("logService")
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
	var self = this
	this.channelService.pushMessageByUids(eventName, data, [{
		uid:playerDoc._id,
		sid:playerDoc.logicServerId
	}], {}, function(e){
		if(_.isObject(e)) self.logService.onEventError("cache.pushService.pushToPlayer", {
			playerId:playerDoc._id,
			serverId:playerDoc.logicServerId
		}, e.stack)
	})
	callback()
}

/**
 * 推送玩家数据给玩家
 * @param playerDoc
 * @param data
 * @param callback
 */
pro.onPlayerDataChanged = function(playerDoc, data, callback){
	this.pushToPlayer(playerDoc, Events.player.onPlayerDataChanged, data, callback)
}

/**
 * 成功获取联盟完整数据
 * @param playerDoc
 * @param playerData
 * @param allianceDoc
 * @param enemyAllianceData
 * @param callback
 */
pro.onJoinAllianceSuccess = function(playerDoc, playerData, allianceDoc, enemyAllianceData, callback){
	this.pushToPlayer(playerDoc, Events.player.onJoinAllianceSuccess, {
		playerData:playerData,
		allianceData:allianceDoc,
		enemyAllianceData:enemyAllianceData
	}, callback)
}

/**
 * 联盟内部Banner消息
 * @param allianceId
 * @param key
 * @param params
 * @param callback
 */
pro.onAllianceNotice = function(allianceId, key, params, callback){
	var self = this
	var eventName = Events.chat.onAllianceNotice;
	var channelName = Consts.AllianceChannelPrefix + "_" + allianceId
	var channel = this.channelService.getChannel(channelName, false)
	if(!_.isObject(channel)){
		callback()
		return
	}
	channel.pushMessage(eventName, {targetAllianceId:allianceId, data:{key:key, params:params}}, {}, function(e){
		if(_.isObject(e)) self.logService.onEventError("cache.pushService.onAllianceDataChanged", {allianceId:allianceId}, e.stack)
	})
	callback()
}

/**
 * 推送联盟数据给玩家
 * @param allianceDoc
 * @param data
 * @param callback
 */
pro.onAllianceDataChanged = function(allianceDoc, data, callback){
	var self = this
	var eventName = Events.alliance.onAllianceDataChanged;
	var channelName = Consts.AllianceChannelPrefix + "_" + allianceDoc._id;
	var channel = this.channelService.getChannel(channelName, false)
	if(!_.isObject(channel)){
		callback()
		return
	}
	channel.pushMessage(eventName, {targetAllianceId:allianceDoc._id, data:data}, {}, function(e){
		if(_.isObject(e)) self.logService.onEventError("cache.pushService.onAllianceDataChanged", {allianceId:allianceDoc._id}, e.stack)
	})

	var cacheService = app.get('cacheService');
	var mapIndexData = cacheService.getMapDataAtIndex(allianceDoc.mapIndex);
	if(mapIndexData.memberCount > 0){
		mapIndexData.channel.pushMessage(eventName, {targetAllianceId:allianceDoc._id, data:data}, {}, function(e){
			if(_.isObject(e)) self.logService.onEventError("cache.pushService.onAllianceDataChanged", {allianceId:allianceDoc._id}, e.stack)
		})
	}
	callback()
}

/**
 * 推送给联盟除指定玩家之外的其他玩家
 * @param allianceDoc
 * @param data
 * @param memberId
 * @param callback
 */
pro.onAllianceDataChangedExceptMemberId = function(allianceDoc, data, memberId, callback){
	var self = this
	var eventName = Events.alliance.onAllianceDataChanged
	var channelName = Consts.AllianceChannelPrefix + "_" + allianceDoc._id
	var channel = this.channelService.getChannel(channelName, false)
	if(!_.isObject(channel)){
		callback()
		return
	}

	var uids = _.values(channel.records)
	uids = _.filter(uids, function(uid){
		return !_.isEqual(uid.uid, memberId)
	})
	if(uids.length > 0){
		self.channelService.pushMessageByUids(eventName, {
			targetAllianceId:allianceDoc._id,
			data:data
		}, uids, {}, function(e){
			if(_.isObject(e)) self.logService.onEventError("cache.pushService.onAllianceDataChangedExceptMemberId", {
				allianceId:allianceId,
				memberId:memberId
			}, e.stack)
		})
	}

	var cacheService = app.get('cacheService');
	var mapIndexData = cacheService.getMapDataAtIndex(allianceDoc.mapIndex);
	if(mapIndexData.memberCount > 0){
		mapIndexData.channel.pushMessage(eventName, {targetAllianceId:allianceDoc._id, data:data}, {}, function(e){
			if(_.isObject(e)){
				self.logService.onEventError("cache.pushService.onAllianceDataChangedExceptMemberId", {
					allianceId:allianceDoc._id,
					memberId:memberId
				}, e.stack)
			}
		})
	}
	callback()
}