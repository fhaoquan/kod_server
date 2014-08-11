/**
 * Created by modun on 14-7-22.
 */

var Promise = require("bluebird")
var Promisify = Promise.promisify
var _ = require("underscore")
var utils = require("../../../utils/utils")

var Consts = require("../../../consts/consts")

module.exports = function(app){
	return new Handler(app)
}

var Handler = function(app){
	this.app = app
	this.playerService = this.app.get("playerService")
	this.callbackService = this.app.get("callbackService")
	this.pushService = this.app.get("pushService")
	this.globalChannelService = this.app.get("globalChannelService")
	this.globalChannelName = Consts.GlobalChannelName
	this.serverId = this.app.getServerId()
}

var pro = Handler.prototype

/**
 * 玩家登陆
 * @param msg
 * @param session
 * @param next
 */
pro.login = function(msg, session, next){
	var self = this
	var deviceId = msg.deviceId
	if(_.isNull(deviceId) || _.isUndefined(deviceId)){
		next(null, {code:500})
		return
	}

	var updatePlayerData = Promisify(UpdatePlayerData, this)
	var bindPlayerSession = Promisify(BindPlayerSession, this)
	var addPlayerToLogicChannel = Promisify(AddPlayerToLogicChannel, this)
	var addPlayerToChatChannel = Promisify(AddPlayerToChatChannel, this)

	var userDoc

	this.playerService.getPlayerByDeviceIdAsync(deviceId).then(function(doc){
		userDoc = doc
		return updatePlayerData(userDoc)
	}).then(function(){
		return self.playerService.updatePlayerAsync(userDoc)
	}).then(function(){
		return bindPlayerSession(session, userDoc)
	}).then(function(){
		return addPlayerToLogicChannel(session)
	}).then(function(){
		return addPlayerToChatChannel(session)
	}).then(function(){
		userDoc.time = Date.now()
		next(null, utils.next(utils.filter(userDoc), 200))
	}).catch(function(e){
		console.error(e)
		next(null, {code:500})
	})
}


var BindPlayerSession = function(session, doc, callback){
	session.bind(doc._id)
	session.set("serverId", this.serverId)
	session.on("closed", PlayerLeave.bind(this))
	session.pushAll()
	process.nextTick(callback)
}

var PlayerLeave = function(session, reason){
	console.log("user [" + session.uid + "] logout with reason [" + reason + "]")

	var savePlayerData = Promisify(SavePlayerData, this)
	var clearPlayerCallback = Promisify(ClearPlayerCallback, this)
	var removePlayerFromGlobalChannel = Promisify(RemovePlayerFromGlobalChannel, this)
	var removePlayerFromChatChannel = Promisify(RemovePlayerFromChatChannel, this)

	savePlayerData(session).then(function(){
		return clearPlayerCallback(session)
	}).then(function(){
		return removePlayerFromGlobalChannel(session)
	}).then(function(){
		return removePlayerFromChatChannel(session)
	}).catch(function(e){
		console.error(e)
	})
}

var AddPlayerToLogicChannel = function(session, callback){
	this.globalChannelService.add(this.globalChannelName, session.uid, this.serverId, callback)
}

var RemovePlayerFromGlobalChannel = function(session, callback){
	this.globalChannelService.leave(this.globalChannelName, session.uid, this.serverId, callback)
}

var AddPlayerToChatChannel = function(session, callback){
	this.app.rpc.chat.chatRemote.add(session, session.uid, this.serverId, callback)
}

var RemovePlayerFromChatChannel = function(session, callback){
	this.app.rpc.chat.chatRemote.leave(session, session.uid, this.serverId, callback)
}

var ClearPlayerCallback = function(session, callback){
	this.callbackService.removeAllPlayerCallback(session.uid)
	callback()
}

var SavePlayerData = function(session, callback){
	this.playerService.savePlayerAsync(session.uid).then(function(){
		callback()
	}).catch(function(e){
		callback(e)
	})
}

var UpdatePlayerData = function(userDoc, callback){
	var self = this
	userDoc.basicInfo.lastLoginTime = Date.now()
	userDoc.basicInfo.loginCount += 1
	_.each(userDoc.buildings, function(building){
		if(building.finishTime > 0){
			if(building.finishTime <= Date.now()){
				building.finishTime = 0
				building.level += 1
			}else{
				self.callbackService.addPlayerCallback(userDoc._id, building.finishTime, self.playerService.excutePlayerCallback.bind(self.playerService))
			}
		}
	})

	callback()
}