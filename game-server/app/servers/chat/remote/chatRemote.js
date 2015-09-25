"use strict"

/**
 * Created by modun on 14-7-29.
 */

var _ = require("underscore")
var Promise = require('bluebird');

var DataUtils = require('../../../utils/dataUtils')
var LogicUtils = require('../../../utils/logicUtils')

var Define = require("../../../consts/define")
var Consts = require("../../../consts/consts")
var Events = require("../../../consts/events")

module.exports = function(app){
	return new ChatRemote(app)
}

var ChatRemote = function(app){
	this.app = app
	this.logService = app.get('logService');
	this.channelService = app.get("channelService")
	this.globalChatChannel = this.channelService.getChannel(Consts.GlobalChatChannel, true)
	this.allianceFights = app.get('allianceFights')
	this.allianceFightChats = app.get('allianceFightChats')
	this.chats = app.get('chats');
	this.Player = app.get('Player');
}

var pro = ChatRemote.prototype

/**
 * 将玩家添加到聊天频道中
 * @param playerId
 * @param logicServerId
 * @param cacheServerId
 * @param callback
 */
pro.addToChatChannel = function(playerId, logicServerId, cacheServerId, callback){
	this.logService.onRemote('chat.chatRemote.addToAllianceChannel', {
		playerId:playerId,
		logicServerId:logicServerId,
		cacheServerId:cacheServerId
	});
	this.globalChatChannel.add(playerId, logicServerId)
	this.channelService.getChannel(Consts.GlobalChatChannel + "_" + cacheServerId, true).add(playerId, logicServerId)
	callback()
}

/**
 * 将玩家从聊天频道中移除
 * @param playerId
 * @param logicServerId
 * @param cacheServerId
 * @param callback
 */
pro.removeFromChatChannel = function(playerId, logicServerId, cacheServerId, callback){
	this.logService.onRemote('chat.chatRemote.removeFromChatChannel', {
		playerId:playerId,
		logicServerId:logicServerId,
		cacheServerId:cacheServerId
	});
	this.globalChatChannel.leave(playerId, logicServerId)
	var channel = this.channelService.getChannel(Consts.GlobalChatChannel + "_" + cacheServerId, false)
	if(!_.isObject(channel)){
		this.logService.onRemoteError('chat.chatRemote.removeFromChatChannel', {
			playerId:playerId,
			logicServerId:logicServerId,
			cacheServerId:cacheServerId
		}, new Error('channel 不存在').stack);
		callback()
		return
	}
	channel.leave(playerId, logicServerId)
	callback()
}

/**
 * 将玩家添加到联盟频道
 * @param allianceId
 * @param playerId
 * @param logicServerId
 * @param callback
 */
pro.addToAllianceChannel = function(allianceId, playerId, logicServerId, callback){
	this.logService.onRemote('chat.chatRemote.addToAllianceChannel', {
		allianceId:allianceId,
		playerId:playerId,
		logicServerId:logicServerId
	});
	this.channelService.getChannel(Consts.AllianceChannelPrefix + "_" + allianceId, true).add(playerId, logicServerId)
	callback()
}

/**
 * 将玩家从联盟频道移除
 * @param allianceId
 * @param playerId
 * @param logicServerId
 * @param callback
 */
pro.removeFromAllianceChannel = function(allianceId, playerId, logicServerId, callback){
	this.logService.onRemote('chat.chatRemote.removeFromAllianceChannel', {
		allianceId:allianceId,
		playerId:playerId,
		logicServerId:logicServerId
	});
	var channel = this.channelService.getChannel(Consts.AllianceChannelPrefix + "_" + allianceId, false)
	if(!_.isObject(channel)){
		this.logService.onRemoteError('chat.chatRemote.removeFromAllianceChannel', {
			allianceId:allianceId,
			playerId:playerId,
			logicServerId:logicServerId
		}, new Error('channel 不存在').stack)
		callback()
		return
	}
	channel.leave(playerId, logicServerId)
	callback()
}

/**
 * 删除联盟频道
 * @param allianceId
 * @param callback
 */
pro.destroyAllianceChannel = function(allianceId, callback){
	this.logService.onRemote('chat.chatRemote.destroyAllianceChannel', {allianceId:allianceId});
	var channel = this.channelService.getChannel(Consts.AllianceChannelPrefix + "_" + allianceId, false)
	if(!_.isObject(channel)){
		this.logService.onRemoteError('chat.chatRemote.destroyAllianceChannel', {
			allianceId:allianceId
		}, new Error('channel 不存在').stack)
		callback()
		return
	}
	channel.destroy()
	callback()
}

/**
 * 将对战中的联盟记录起来
 * @param attackAllianceId
 * @param defenceAllianceId
 * @param callback
 */
pro.createAllianceFightChannel = function(attackAllianceId, defenceAllianceId, callback){
	this.logService.onRemote('chat.chatRemote.createAllianceFightChannel', {
		attackAllianceId:attackAllianceId,
		defenceAllianceId:defenceAllianceId
	});
	this.allianceFights[attackAllianceId] = attackAllianceId + '_' + defenceAllianceId
	this.allianceFights[defenceAllianceId] = attackAllianceId + '_' + defenceAllianceId
	callback()
}

/**
 * 将对战中的联盟从记录中移除
 * @param attackAllianceId
 * @param defenceAllianceId
 * @param callback
 */
pro.deleteAllianceFightChannel = function(attackAllianceId, defenceAllianceId, callback){
	this.logService.onRemote('chat.chatRemote.deleteAllianceFightChannel', {
		attackAllianceId:attackAllianceId,
		defenceAllianceId:defenceAllianceId
	});
	var allianceFights = this.app.get('allianceFights')
	delete allianceFights[attackAllianceId]
	delete allianceFights[defenceAllianceId]
	delete this.allianceFightChats[attackAllianceId + '_' + defenceAllianceId]
	callback()
}