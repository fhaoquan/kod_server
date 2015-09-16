///**
// * Created by modun on 14-7-25.
// */
//
//var pomelo = require("../pomelo-client")
//var mongoose = require("mongoose")
//var Promise = require("bluebird")
//var should = require('should')
//var _ = require("underscore")
//
//var Consts = require("../../app/consts/consts")
//var Config = require("../config")
//var Api = require("../api")
//var MapUtils = require("../../app/utils/mapUtils")
//var Device = Promise.promisifyAll(require("../../app/domains/device"))
//var Player = Promise.promisifyAll(require("../../app/domains/player"))
//var Alliance = Promise.promisifyAll(require("../../app/domains/alliance"))
//var Billing = Promise.promisifyAll(require("../../app/domains/billing"))
//
//var GameDatas = require("../../app/datas/GameDatas")
//var Errors = GameDatas.Errors.errors
//
//describe("AllianceService", function(){
//	var m_user
//
//	before(function(done){
//		mongoose.connect(Config.mongoAddr, function(){
//			Device.removeAsync().then(function(){
//				return Player.removeAsync()
//			}).then(function(){
//				return Alliance.removeAsync()
//			}).then(function(){
//				return Billing.removeAsync()
//			}).then(function(){
//				done()
//			})
//		})
//	})
//
//
//	describe("entryHandler", function(){
//		it("login", function(done){
//			Api.loginPlayer(Config.deviceId, function(doc){
//				doc.code.should.equal(200)
//				m_user = doc.playerData
//				done()
//			})
//		})
//	})
//
//
//	describe("allianceHandler", function(){
//		it("initPlayerData 正常初始化1", function(done){
//			Api.initPlayerData(Consts.AllianceTerrain.Desert, Consts.AllianceLanguage.Cn, function(doc){
//				doc.code.should.equal(200)
//				done()
//			})
//		})
//
//		it("createAlliance 正常创建", function(done){
//			Api.createAlliance(Config.allianceName, Config.allianceTag, "cn", "grassLand", "e", function(doc){
//				doc.code.should.equal(200)
//				done()
//			})
//		})
//
//		it("createAlliance 联盟名称已经存在", function(done){
//			Api.loginPlayer(Config.deviceId2, function(doc){
//				doc.code.should.equal(200)
//				Api.initPlayerData(Consts.AllianceTerrain.Desert, Consts.AllianceLanguage.Cn, function(doc){
//					doc.code.should.equal(200)
//					Api.createAlliance(Config.allianceName, Config.allianceTag, "cn", "grassLand", "e", function(doc){
//						doc.code.should.equal(Errors.allianceNameExist.code)
//						done()
//					})
//				})
//			})
//		})
//
//		it("createAlliance 联盟标签已经存在", function(done){
//			Api.createAlliance("Hello", Config.allianceTag, "cn", "grassLand", "e", function(doc){
//				doc.code.should.equal(Errors.allianceTagExist.code)
//				done()
//			})
//		})
//
//		it("sendAllianceMail 玩家未加入联盟", function(done){
//			Api.sendAllianceMail("alliance mail", "this is a alliance mail", function(doc){
//				doc.code.should.equal(Errors.playerNotJoinAlliance.code)
//				Api.loginPlayer(Config.deviceId, function(doc){
//					doc.code.should.equal(200)
//					m_user = doc.playerData
//					done()
//				})
//			})
//		})
//
//		it("sendAllianceMail 此操作权限不足", function(done){
//			Api.loginPlayer(Config.deviceId3, function(doc){
//				doc.code.should.equal(200)
//				Api.initPlayerData(Consts.AllianceTerrain.Desert, Consts.AllianceLanguage.Cn, function(doc){
//					doc.code.should.equal(200)
//					Api.joinAllianceDirectly(m_user.allianceId, function(doc){
//						doc.code.should.equal(200)
//						Api.sendAllianceMail("alliance mail", "this is a alliance mail", function(doc){
//							doc.code.should.equal(Errors.allianceOperationRightsIllegal.code)
//							done()
//						})
//					})
//				})
//			})
//		})
//
//		it("sendAllianceMail 正常发送", function(done){
//			Api.loginPlayer(Config.deviceId, function(doc){
//				doc.code.should.equal(200)
//				Api.sendAllianceMail("alliance mail", "this is a alliance mail", function(doc){
//					doc.code.should.equal(200)
//					done()
//				})
//			})
//		})
//
//		it("editAllianceBasicInfo 玩家未加入联盟", function(done){
//			Api.loginPlayer(Config.deviceId2, function(doc){
//				doc.code.should.equal(200)
//				Api.editAllianceBasicInfo(Config.allianceName, Config.allianceTag, "cn", "e", function(doc){
//					doc.code.should.equal(Errors.playerNotJoinAlliance.code)
//					done()
//				})
//			})
//		})
//
//		var m_allianceData = null;
//		it("editAllianceBasicInfo 此操作权限不足", function(done){
//			Api.loginPlayer(Config.deviceId3, function(doc){
//				doc.code.should.equal(200)
//				m_allianceData = doc.allianceData;
//				Api.editAllianceBasicInfo(Config.allianceName, Config.allianceTag, "cn", "e", function(doc){
//					doc.code.should.equal(Errors.allianceOperationRightsIllegal.code)
//					done()
//				})
//			})
//		})
//
//		it('crateAlliance 正常创建2', function(done){
//			Api.loginPlayer(Config.deviceId4, function(doc){
//				doc.code.should.equal(200)
//				Api.initPlayerData(Consts.AllianceTerrain.Desert, Consts.AllianceLanguage.Cn, function(doc){
//					doc.code.should.equal(200)
//					Api.sendChat('soldiers 50', function(doc){
//						doc.code.should.equal(200)
//						Api.createAlliance("31231", Config.allianceTag2, "cn", "grassLand", "e", function(doc){
//							doc.code.should.equal(200)
//							done();
//						})
//					})
//				})
//			})
//		})
//
//		it('enterAlliance 正常观察', function(done){
//			Api.enterAlliance(m_allianceData._id, function(doc){
//				doc.code.should.equal(200);
//				done();
//			})
//		})
//
//		it('amInAlliance 正常心跳', function(done){
//			Api.amInAlliance(m_allianceData._id, function(doc){
//				doc.code.should.equal(200);
//				done();
//			})
//		})
//
//		it('leaveAlliance 正常离开', function(done){
//			Api.leaveAlliance(m_allianceData._id, function(doc){
//				doc.code.should.equal(200);
//				done();
//			})
//		})
//
//		it("editAllianceBasicInfo 联盟名称已经存在", function(done){
//			Api.editAllianceBasicInfo(Config.allianceName, "adf", "cn", "e", function(doc){
//				doc.code.should.equal(Errors.allianceNameExist.code)
//				done()
//			})
//		})
//
//		it("editAllianceBasicInfo 联盟标签已经存在", function(done){
//			Api.editAllianceBasicInfo("adfad", Config.allianceTag, "cn", "e", function(doc){
//				doc.code.should.equal(Errors.allianceTagExist.code)
//				done()
//			})
//		})
//
//		it("editAllianceBasicInfo 正常修改", function(done){
//			Api.editAllianceBasicInfo(Config.allianceName2, Config.allianceTag2, "cn", "e", function(doc){
//				doc.code.should.equal(200)
//				done()
//			})
//		})
//
//		it("editAllianceTerrian 联盟荣耀值不足", function(done){
//			Api.editAllianceTerrian("grassLand", function(doc){
//				doc.code.should.equal(Errors.allianceHonourNotEnough.code)
//				done()
//			})
//		})
//
//		it("editAllianceTerrian 正常编辑", function(done){
//			Api.sendChat("alliancehonour 5000", function(doc){
//				doc.code.should.equal(200)
//				Api.editAllianceTerrian("grassLand", function(doc){
//					doc.code.should.equal(200)
//					done()
//				})
//			})
//		})
//
//		it("editAllianceTitleName 此操作权限不足", function(done){
//			Api.loginPlayer(Config.deviceId3, function(doc){
//				doc.code.should.equal(200)
//				Api.editAllianceTitleName("archon", "老大", function(doc){
//					doc.code.should.equal(Errors.allianceOperationRightsIllegal.code)
//					done()
//				})
//			})
//		})
//
//		it("editTitleName 正常修改", function(done){
//			Api.loginPlayer(Config.deviceId, function(doc){
//				doc.code.should.equal(200)
//				Api.editAllianceTitleName("archon", "老大", function(doc){
//					doc.code.should.equal(200)
//					done()
//				})
//			})
//		})
//
//		it("editAllianceNotice 此操作权限不足", function(done){
//			Api.loginPlayer(Config.deviceId3, function(doc){
//				doc.code.should.equal(200)
//				Api.editAllianceNotice("这是第一条公告", function(doc){
//					doc.code.should.equal(Errors.allianceOperationRightsIllegal.code)
//					done()
//				})
//			})
//		})
//
//		it("editAllianceNotice 正常发布公告", function(done){
//			Api.loginPlayer(Config.deviceId, function(doc){
//				doc.code.should.equal(200)
//				Api.editAllianceNotice("这是第一条公告", function(doc){
//					doc.code.should.equal(200)
//					done()
//				})
//			})
//		})
//
//		it("editAllianceDescription 此操作权限不足", function(done){
//			Api.loginPlayer(Config.deviceId3, function(doc){
//				doc.code.should.equal(200)
//				Api.editAllianceDescription("这是第一条描述", function(doc){
//					doc.code.should.equal(Errors.allianceOperationRightsIllegal.code)
//					done()
//				})
//			})
//		})
//
//		it("editAllianceDescription 正常修改联盟描述", function(done){
//			Api.loginPlayer(Config.deviceId, function(doc){
//				doc.code.should.equal(200)
//				Api.editAllianceDescription("这是第一条描述", function(doc){
//					doc.code.should.equal(200)
//					done()
//				})
//			})
//		})
//
//		it("editAllianceJoinType 此操作权限不足", function(done){
//			Api.loginPlayer(Config.deviceId3, function(doc){
//				doc.code.should.equal(200)
//				Api.editAllianceJoinType("all", function(doc){
//					doc.code.should.equal(Errors.allianceOperationRightsIllegal.code)
//					done()
//				})
//			})
//		})
//
//		it("editAllianceJoinType 正常修改联盟描述", function(done){
//			Api.loginPlayer(Config.deviceId, function(doc){
//				doc.code.should.equal(200)
//				Api.editAllianceJoinType("all", function(doc){
//					doc.code.should.equal(200)
//					done()
//				})
//			})
//		})
//
//		it("editAllianceMemberTitle 此操作权限不足", function(done){
//			Api.loginPlayer(Config.deviceId3, function(doc){
//				doc.code.should.equal(200)
//				Api.editAllianceMemberTitle("asdfasdf", "member", function(doc){
//					doc.code.should.equal(Errors.allianceOperationRightsIllegal.code)
//					done()
//				})
//			})
//		})
//
//		it("editAllianceMemberTitle 联盟没有此玩家", function(done){
//			Api.loginPlayer(Config.deviceId, function(doc){
//				doc.code.should.equal(200)
//				Api.editAllianceMemberTitle("asdfasdf", "member", function(doc){
//					doc.code.should.equal(Errors.allianceDoNotHasThisMember.code)
//					done()
//				})
//			})
//		})
//
//		it("editAllianceMemberTitle 不能将玩家的职级调整到与自己平级或者比自己高", function(done){
//			var memberDoc = null
//			Api.loginPlayer(Config.deviceId3, function(doc){
//				doc.code.should.equal(200)
//				memberDoc = doc.playerData
//				Api.loginPlayer(Config.deviceId, function(doc){
//					doc.code.should.equal(200)
//					Api.editAllianceMemberTitle(memberDoc._id, "archon", function(doc){
//						doc.code.should.equal(Errors.allianceOperationRightsIllegal.code)
//						done()
//					})
//				})
//			})
//		})
//
//		it("editAllianceMemberTitle 正常编辑", function(done){
//			var memberDoc = null
//			Api.loginPlayer(Config.deviceId3, function(doc){
//				doc.code.should.equal(200)
//				memberDoc = doc.playerData
//				Api.loginPlayer(Config.deviceId, function(doc){
//					doc.code.should.equal(200)
//					Api.editAllianceMemberTitle(memberDoc._id, Consts.AllianceTitle.Elite, function(doc){
//						doc.code.should.equal(200)
//						done()
//					})
//				})
//			})
//		})
//
//		it("kickAllianceMemberOff 此操作权限不足", function(done){
//			Api.loginPlayer(Config.deviceId3, function(doc){
//				doc.code.should.equal(200)
//				Api.kickAllianceMemberOff("asdfasdf", function(doc){
//					doc.code.should.equal(Errors.allianceOperationRightsIllegal.code)
//					done()
//				})
//			})
//		})
//
//		it("kickAllianceMemberOff 联盟没有此玩家", function(done){
//			Api.loginPlayer(Config.deviceId, function(doc){
//				doc.code.should.equal(200)
//				Api.kickAllianceMemberOff("asdfasdf", function(doc){
//					doc.code.should.equal(Errors.allianceDoNotHasThisMember.code)
//					done()
//				})
//			})
//		})
//
//		it("kickAllianceMemberOff 正常踢出", function(done){
//			var memberDoc = null
//			Api.loginPlayer(Config.deviceId3, function(doc){
//				doc.code.should.equal(200)
//				memberDoc = doc.playerData
//				Api.loginPlayer(Config.deviceId, function(doc){
//					doc.code.should.equal(200)
//					Api.kickAllianceMemberOff(memberDoc._id, function(doc){
//						doc.code.should.equal(200)
//						done()
//					})
//				})
//			})
//		})
//
//		it("handOverArchon 别逗了,你是不盟主好么", function(done){
//			Api.loginPlayer(Config.deviceId3, function(doc){
//				doc.code.should.equal(200)
//				Api.joinAllianceDirectly(m_user.allianceId, function(doc){
//					doc.code.should.equal(200)
//					Api.handOverAllianceArchon("asdfasdf", function(doc){
//						doc.code.should.equal(Errors.youAreNotTheAllianceArchon.code)
//						done()
//					})
//				})
//			})
//		})
//
//		it("handOverArchon 玩家不存在", function(done){
//			Api.loginPlayer(Config.deviceId, function(doc){
//				doc.code.should.equal(200)
//				Api.handOverAllianceArchon("asdfasdf", function(doc){
//					doc.code.should.equal(Errors.allianceDoNotHasThisMember.code)
//					done()
//				})
//			})
//		})
//
//		it("handOverArchon 正常移交", function(done){
//			var memberDoc = null
//			Api.loginPlayer(Config.deviceId3, function(doc){
//				doc.code.should.equal(200)
//				memberDoc = doc.playerData
//				Api.loginPlayer(Config.deviceId, function(doc){
//					doc.code.should.equal(200)
//					Api.handOverAllianceArchon(memberDoc._id, function(doc){
//						doc.code.should.equal(200)
//						done()
//					})
//				})
//			})
//		})
//
//		it("quitAlliance 正常退出", function(done){
//			Api.loginPlayer(Config.deviceId, function(doc){
//				doc.code.should.equal(200)
//				Api.quitAlliance(function(doc){
//					doc.code.should.equal(200)
//					done()
//				})
//			})
//		})
//
//		it("joinAllianceDirectly 玩家已加入联盟", function(done){
//			Api.loginPlayer(Config.deviceId3, function(doc){
//				doc.code.should.equal(200)
//				Api.joinAllianceDirectly("asdfasdf", function(doc){
//					doc.code.should.equal(Errors.playerAlreadyJoinAlliance.code)
//					done()
//				})
//			})
//		})
//
//		it("joinAllianceDirectly 联盟不存在", function(done){
//			Api.loginPlayer(Config.deviceId, function(doc){
//				doc.code.should.equal(200)
//				Api.joinAllianceDirectly("asdfasdf", function(doc){
//					doc.code.should.equal(Errors.allianceNotExist.code)
//					done()
//				})
//			})
//		})
//
//		it("joinAllianceDirectly 联盟不允许直接加入", function(done){
//			Api.loginPlayer(Config.deviceId3, function(doc){
//				doc.code.should.equal(200)
//				Api.editAllianceJoinType("audit", function(doc){
//					doc.code.should.equal(200)
//					Api.loginPlayer(Config.deviceId, function(doc){
//						doc.code.should.equal(200)
//						Api.joinAllianceDirectly(m_user.allianceId, function(doc){
//							doc.code.should.equal(Errors.allianceDoNotAllowJoinDirectly.code)
//							Api.loginPlayer(Config.deviceId3, function(doc){
//								doc.code.should.equal(200)
//								Api.editAllianceJoinType("all", function(doc){
//									doc.code.should.equal(200)
//									done()
//								})
//							})
//						})
//					})
//				})
//			})
//		})
//
//		it("joinAllianceDirectly 正常加入", function(done){
//			Api.loginPlayer(Config.deviceId, function(doc){
//				doc.code.should.equal(200)
//				Api.joinAllianceDirectly(m_user.allianceId, function(doc){
//					doc.code.should.equal(200)
//					done()
//				})
//			})
//		})
//
//		it("requestToJoinAlliance 玩家已加入联盟", function(done){
//			Api.requestToJoinAlliance(m_user.allianceId, function(doc){
//				doc.code.should.equal(Errors.playerAlreadyJoinAlliance.code)
//				done()
//			})
//		})
//
//		it("requestToJoinAlliance 对此联盟的申请已发出,请耐心等候审核", function(done){
//			Api.loginPlayer(Config.deviceId3, function(doc){
//				doc.code.should.equal(200)
//				Api.editAllianceJoinType("audit", function(doc){
//					doc.code.should.equal(200)
//					Api.loginPlayer(Config.deviceId5, function(doc){
//						doc.code.should.equal(200)
//						Api.initPlayerData(Consts.AllianceTerrain.Desert, Consts.AllianceLanguage.Cn, function(){
//							Api.requestToJoinAlliance(m_user.allianceId, function(doc){
//								doc.code.should.equal(200)
//								Api.requestToJoinAlliance(m_user.allianceId, function(doc){
//									doc.code.should.equal(Errors.joinTheAllianceRequestAlreadySend.code)
//									done()
//								})
//							})
//						})
//					})
//				})
//			})
//		})
//
//		it("cancelJoinAllianceRequest 正常取消", function(done){
//			Api.cancelJoinAllianceRequest(m_user.allianceId, function(doc){
//				doc.code.should.equal(200)
//				done()
//			})
//		})
//
//		it("removeJoinAllianceReqeusts 正常处理", function(done){
//			var memberDoc = null
//			Api.loginPlayer(Config.deviceId5, function(doc){
//				doc.code.should.equal(200)
//				memberDoc = doc.playerData
//				Api.requestToJoinAlliance(m_user.allianceId, function(doc){
//					doc.code.should.equal(200)
//					Api.loginPlayer(Config.deviceId3, function(doc){
//						doc.code.should.equal(200)
//						Api.removeJoinAllianceReqeusts([memberDoc._id], function(doc){
//							doc.code.should.equal(200)
//							done()
//						})
//					})
//				})
//			})
//		})
//
//		it("approveJoinAllianceRequest 正常处理", function(done){
//			var memberDoc = null
//			Api.loginPlayer(Config.deviceId5, function(doc){
//				doc.code.should.equal(200)
//				memberDoc = doc.playerData
//				Api.requestToJoinAlliance(m_user.allianceId, function(doc){
//					doc.code.should.equal(200)
//					Api.loginPlayer(Config.deviceId3, function(doc){
//						doc.code.should.equal(200)
//						Api.approveJoinAllianceRequest(memberDoc._id, function(doc){
//							doc.code.should.equal(200)
//							done()
//						})
//					})
//				})
//			})
//		})
//
//		it("inviteToJoinAlliance 正常邀请", function(done){
//			var memberDoc = null
//			Api.loginPlayer(Config.deviceId5, function(doc){
//				doc.code.should.equal(200)
//				memberDoc = doc.playerData
//				Api.quitAlliance(function(doc){
//					doc.code.should.equal(200)
//					Api.loginPlayer(Config.deviceId3, function(doc){
//						doc.code.should.equal(200)
//						Api.inviteToJoinAlliance(memberDoc._id, function(doc){
//							doc.code.should.equal(200)
//							done()
//						})
//					})
//				})
//			})
//		})
//
//		it("handleJoinAllianceInvite 正常处理 拒绝邀请", function(done){
//			Api.loginPlayer(Config.deviceId5, function(doc){
//				doc.code.should.equal(200)
//				Api.handleJoinAllianceInvite(m_user.allianceId, false, function(doc){
//					doc.code.should.equal(200)
//					done()
//				})
//			})
//		})
//
//		it("handleJoinAllianceInvite 正常处理 同意邀请", function(done){
//			var memberDoc = null
//			Api.loginPlayer(Config.deviceId5, function(doc){
//				doc.code.should.equal(200)
//				memberDoc = doc.playerData
//				Api.loginPlayer(Config.deviceId3, function(doc){
//					doc.code.should.equal(200)
//					Api.inviteToJoinAlliance(memberDoc._id, function(doc){
//						doc.code.should.equal(200)
//						Api.loginPlayer(Config.deviceId4, function(doc){
//							doc.code.should.equal(200)
//							Api.inviteToJoinAlliance(memberDoc._id, function(doc){
//								doc.code.should.equal(200)
//								Api.loginPlayer(Config.deviceId5, function(doc){
//									doc.code.should.equal(200)
//									Api.handleJoinAllianceInvite(m_user.allianceId, true, function(doc){
//										doc.code.should.equal(200)
//										done()
//									})
//								})
//							})
//						})
//					})
//				})
//			})
//		})
//
//		it("getAllianceRankList 获取Power排行", function(done){
//			Api.getMyAllianceData(function(doc){
//				doc.code.should.equal(200)
//				Api.getAllianceRankList(doc.allianceData._id, Consts.RankTypes.Power, 0, function(doc){
//					doc.code.should.equal(200)
//					done()
//				})
//			})
//		})
//
//		it("getAllianceRankList 获取Kill排行", function(done){
//			Api.getMyAllianceData(function(doc){
//				doc.code.should.equal(200)
//				Api.getAllianceRankList(doc.allianceData._id, Consts.RankTypes.Kill, 0, function(doc){
//					doc.code.should.equal(200)
//					done()
//				})
//			})
//		})
//
//		it("buyAllianceArchon 购买盟主职位,正常购买", function(done){
//			Api.buyAllianceArchon(function(doc){
//				doc.code.should.equal(Errors.onlyAllianceArchonMoreThanSevenDaysNotOnLinePlayerCanBuyArchonTitle.code)
//				Api.loginPlayer(Config.deviceId5, function(doc){
//					doc.code.should.equal(200)
//					done()
//				})
//			})
//		})
//
//		it("searchAllianceByTag 正常搜索", function(done){
//			Api.searchAllianceByTag("t", function(doc){
//				doc.code.should.equal(200)
//				done()
//			})
//		})
//
//		it("getCanDirectJoinAlliances 正常获取", function(done){
//			Api.getCanDirectJoinAlliances(0, function(doc){
//				doc.code.should.equal(200)
//				done()
//			})
//		})
//
//		it("upgradeBuilding 加入联盟后", function(done){
//			var playerDoc = null
//			Api.sendChat('resources gem 100000', function(doc){
//				doc.code.should.equal(200)
//				Api.upgradeBuilding(1, true, function(doc){
//					doc.code.should.equal(200)
//					Api.upgradeBuilding(2, false, function(doc){
//						doc.code.should.equal(200)
//						Api.loginPlayer(Config.deviceId5, function(doc){
//							doc.code.should.equal(200)
//							playerDoc = doc.playerData
//							var buildEvent = playerDoc.buildingEvents[0]
//							Api.requestAllianceToSpeedUp(Consts.AllianceHelpEventType.BuildingEvents, buildEvent.id, function(doc){
//								doc.code.should.equal(200)
//								done()
//							})
//						})
//					})
//				})
//			})
//		})
//
//		it("createHouse 加入联盟后", function(done){
//			var playerDoc = null
//			Api.createHouse("dwelling", 3, 2, false, function(doc){
//				doc.code.should.equal(200)
//				Api.loginPlayer(Config.deviceId5, function(doc){
//					doc.code.should.equal(200)
//					playerDoc = doc.playerData
//					var buildEvent = _.find(playerDoc.houseEvents, function(event){
//						return event.finishTime > Date.now()
//					})
//					Api.requestAllianceToSpeedUp(Consts.AllianceHelpEventType.HouseEvents, buildEvent.id, function(doc){
//						doc.code.should.equal(200)
//						done()
//					})
//				})
//			})
//		})
//
//		it("upgradeHouse 加入联盟后", function(done){
//			var playerDoc = null
//			Api.createHouse("dwelling", 3, 1, true, function(doc){
//				doc.code.should.equal(200)
//				Api.upgradeHouse(3, 1, false, function(doc){
//					doc.code.should.equal(200)
//					Api.loginPlayer(Config.deviceId5, function(doc){
//						doc.code.should.equal(200)
//						playerDoc = doc.playerData
//						var buildEvent = _.find(playerDoc.houseEvents, function(event){
//							return event.finishTime > Date.now()
//						})
//						Api.requestAllianceToSpeedUp(Consts.AllianceHelpEventType.HouseEvents, buildEvent.id, function(doc){
//							doc.code.should.equal(200)
//							done()
//						})
//					})
//				})
//			})
//		})
//
//		it("helpAllianceMemberSpeedUp 正常帮助1", function(done){
//			var alliance = null
//			Api.loginPlayer(Config.deviceId3, function(doc){
//				doc.code.should.equal(200)
//				Api.getMyAllianceData(function(doc){
//					doc.code.should.equal(200)
//					alliance = doc.allianceData
//					var event = alliance.helpEvents[0]
//					Api.helpAllianceMemberSpeedUp(event.id, function(doc){
//						doc.code.should.equal(200)
//						done()
//					})
//				})
//			})
//		})
//
//		it("helpAllAllianceMemberSpeedUp 正常帮助", function(done){
//			Api.loginPlayer(Config.deviceId3, function(doc){
//				doc.code.should.equal(200)
//				Api.helpAllAllianceMemberSpeedUp(function(doc){
//					doc.code.should.equal(200)
//					done()
//				})
//			})
//		})
//
//		it("donateToAlliance 资源不足", function(done){
//			Api.sendChat("resources wood 500", function(doc){
//				doc.code.should.equal(200)
//				Api.donateToAlliance("wood", function(doc){
//					doc.code.should.equal(Errors.resourceNotEnough.code)
//					done()
//				})
//			})
//		})
//
//		it("donateToAlliance 正常捐赠1", function(done){
//			Api.loginPlayer(Config.deviceId3, function(doc){
//				doc.code.should.equal(200)
//				Api.sendChat("resources wood 5000000", function(doc){
//					doc.code.should.equal(200)
//					Api.sendChat("donatelevel 6", function(doc){
//						doc.code.should.equal(200)
//						Api.donateToAlliance("wood", function(doc){
//							doc.code.should.equal(200)
//							done()
//						})
//					})
//				})
//			})
//		})
//
//		it("donateToAlliance 正常捐赠2", function(done){
//			Api.donateToAlliance("wood", function(doc){
//				doc.code.should.equal(200)
//				done()
//			})
//		})
//
//		it("donateToAlliance 正常捐赠3", function(done){
//			Api.sendChat("donatelevel 1", function(doc){
//				doc.code.should.equal(200)
//				Api.donateToAlliance("gem", function(doc){
//					doc.code.should.equal(200)
//					done()
//				})
//			})
//		})
//
//		it("upgradeAllianceBuilding 联盟荣耀值不足", function(done){
//			Api.sendChat("allianceHonour 10", function(doc){
//				doc.code.should.equal(200)
//				Api.upgradeAllianceBuilding(Consts.AllianceBuildingNames.Palace, function(doc){
//					doc.code.should.equal(Errors.allianceHonourNotEnough.code)
//					done()
//				})
//			})
//		})
//
//		it("upgradeAllianceBuilding 正常升级1", function(done){
//			Api.sendChat("allianceHonour 50000000", function(doc){
//				doc.code.should.equal(200)
//				Api.upgradeAllianceBuilding(Consts.AllianceBuildingNames.Palace, function(doc){
//					doc.code.should.equal(200)
//					done()
//				})
//			})
//		})
//
//		it("upgradeAllianceBuilding 正常升级2", function(done){
//			Api.upgradeAllianceBuilding(Consts.AllianceBuildingNames.OrderHall, function(doc){
//				doc.code.should.equal(200)
//				done()
//			})
//		})
//
//		it("upgradeAllianceBuilding 正常升级3", function(done){
//			Api.upgradeAllianceBuilding(Consts.AllianceBuildingNames.OrderHall, function(doc){
//				doc.code.should.equal(200)
//				done()
//			})
//		})
//
//		it("upgradeAllianceVillage 正常升级", function(done){
//			Api.upgradeAllianceVillage("woodVillage", function(doc){
//				doc.code.should.equal(200)
//				done()
//			})
//		})
//
//		it("moveAllianceBuilding 正常移动", function(done){
//			var m_allianceData = null
//			Api.getMyAllianceData(function(doc){
//				doc.code.should.equal(200)
//				m_allianceData = doc.allianceData
//				var map = MapUtils.buildMap(m_allianceData.mapObjects)
//				var rect = MapUtils.getRect(map, 3, 3)
//				Api.moveAllianceBuilding(m_allianceData.mapObjects[0].id, rect.x, rect.y, function(doc){
//					doc.code.should.equal(200)
//					done()
//				})
//			})
//		})
//
//		it("getFirstJoinAllianceReward 正常领取", function(done){
//			Api.getFirstJoinAllianceReward(function(doc){
//				doc.code.should.equal(200)
//				done()
//			})
//		})
//
//		it("addShopItem 普通道具不需要进货补充", function(done){
//			Api.loginPlayer(Config.deviceId3, function(doc){
//				doc.code.should.equal(200)
//				Api.addShopItem("woodClass_4", 1, function(doc){
//					doc.code.should.equal(Errors.normalItemsNotNeedToAdd.code)
//					done()
//				})
//			})
//		})
//
//		it("addAllianceItem 此道具未在联盟商店出售", function(done){
//			Api.loginPlayer(Config.deviceId3, function(doc){
//				doc.code.should.equal(200)
//				Api.sendChat("allianceHonour 500000", function(doc){
//					doc.code.should.equal(200)
//					Api.addShopItem("vipPoint_3", 1, function(doc){
//						doc.code.should.equal(Errors.theItemNotSellInAllianceShop.code)
//						done()
//					})
//				})
//			})
//		})
//
//		it("addAllianceItem 正常添加", function(done){
//			Api.loginPlayer(Config.deviceId3, function(doc){
//				doc.code.should.equal(200)
//				Api.sendChat("alliancehonour 500000", function(doc){
//					doc.code.should.equal(200)
//					Api.addShopItem("dragonChest_1", 1, function(doc){
//						doc.code.should.equal(200)
//						done()
//					})
//				})
//			})
//		})
//
//		it("buyShopItem 玩家忠诚值不足", function(done){
//			Api.buyShopItem("dragonChest_1", 1, function(doc){
//				doc.code.should.equal(Errors.playerLoyaltyNotEnough.code)
//				done()
//			})
//		})
//
//		it("buyShopItem 正常购买", function(done){
//			Api.sendChat("resources gem 5000000", function(doc){
//				doc.code.should.equal(200)
//				Api.sendChat("donatelevel 6", function(doc){
//					doc.code.should.equal(200)
//					Api.donateToAlliance("gem", function(doc){
//						doc.code.should.equal(200)
//						Api.donateToAlliance("gem", function(doc){
//							doc.code.should.equal(200)
//							Api.donateToAlliance("gem", function(doc){
//								doc.code.should.equal(200)
//								Api.buyShopItem("dragonChest_1", 1, function(doc){
//									doc.code.should.equal(200)
//									done()
//								})
//							})
//						})
//					})
//				})
//			})
//		})
//
//		it("giveLoyaltyToAllianceMember 正常给予1", function(done){
//			var m_myAllianceData = null
//			Api.loginPlayer(Config.deviceId3, function(doc){
//				doc.code.should.equal(200)
//				Api.getMyAllianceData(function(doc){
//					doc.code.should.equal(200)
//					m_myAllianceData = doc.allianceData
//					Api.giveLoyaltyToAllianceMember(m_myAllianceData.members[0].id, 10, function(doc){
//						doc.code.should.equal(200)
//						done()
//					})
//				})
//			})
//		})
//
//		it("giveLoyaltyToAllianceMember 正常给予2", function(done){
//			var m_myAllianceData = null
//			Api.loginPlayer(Config.deviceId3, function(doc){
//				doc.code.should.equal(200)
//				Api.getMyAllianceData(function(doc){
//					doc.code.should.equal(200)
//					m_myAllianceData = doc.allianceData
//					Api.giveLoyaltyToAllianceMember(m_myAllianceData.members[1].id, 10, function(doc){
//						doc.code.should.equal(200)
//						done()
//					})
//				})
//			})
//		})
//
//		var m_myAllianceData = null
//		it("getAllianceInfo 正常查看", function(done){
//			Api.getMyAllianceData(function(doc){
//				doc.code.should.equal(200)
//				m_myAllianceData = doc.allianceData
//				Api.getAllianceInfo(m_myAllianceData._id, m_myAllianceData.serverId, function(doc){
//					doc.code.should.equal(200)
//					done()
//				})
//			})
//		})
//
//		it("getJoinRequestEvents 正常查看", function(done){
//			Api.getJoinRequestEvents(m_myAllianceData._id, function(doc){
//				doc.code.should.equal(200)
//				done()
//			})
//		})
//
//		it("getShrineReports 正常查看", function(done){
//			Api.getShrineReports(m_myAllianceData._id, function(doc){
//				doc.code.should.equal(200)
//				done()
//			})
//		})
//
//		it("getAllianceFightReports 正常查看", function(done){
//			Api.getAllianceFightReports(m_myAllianceData._id, function(doc){
//				doc.code.should.equal(200)
//				done()
//			})
//		})
//
//		it("getItemLogs 正常查看", function(done){
//			Api.getItemLogs(m_myAllianceData._id, function(doc){
//				doc.code.should.equal(200)
//				done()
//			})
//		})
//
//		//it("activateAllianceShrineStage 联盟感知力不足", function(done){
//		//	Api.sendChat("allianceperception 0", function(doc){
//		//		doc.code.should.equal(200)
//		//		Api.activateAllianceShrineStage("1_1", function(doc){
//		//			doc.code.should.equal(Errors.alliancePerceptionNotEnough.code)
//		//			done()
//		//		})
//		//	})
//		//})
//		//
//		//it("activateAllianceShrineStage 正常激活", function(done){
//		//	Api.loginPlayer(Config.deviceId3, function(doc){
//		//		doc.code.should.equal(200)
//		//		Api.sendChat("allianceperception 1000", function(doc){
//		//			doc.code.should.equal(200)
//		//			Api.activateAllianceShrineStage("1_1", function(doc){
//		//				doc.code.should.equal(200)
//		//				done()
//		//			})
//		//		})
//		//	})
//		//})
//		//
//		//it("activateAllianceShrineStage 此联盟事件已经激活", function(done){
//		//	Api.activateAllianceShrineStage("1_1", function(doc){
//		//		doc.code.should.equal(Errors.theAllianceShrineEventAlreadyActived.code)
//		//		done()
//		//	})
//		//})
//		//
//		//it("attackAllianceShrine 正常行军1", function(done){
//		//	var m_allianceData = null
//		//	Api.sendChat("dragonstar blueDragon 1", function(doc){
//		//		doc.code.should.equal(200)
//		//		Api.sendChat("soldiers 1000", function(doc){
//		//			doc.code.should.equal(200)
//		//			Api.getMyAllianceData(function(doc){
//		//				doc.code.should.equal(200)
//		//				m_allianceData = doc.allianceData
//		//				Api.attackAllianceShrine(m_allianceData.shrineEvents[0].id, "blueDragon", [
//		//					{
//		//						name:"swordsman",
//		//						count:200
//		//					},
//		//					{
//		//						name:"sentinel",
//		//						count:200
//		//					},
//		//					{
//		//						name:"ranger",
//		//						count:200
//		//					}
//		//				], function(doc){
//		//					doc.code.should.equal(200)
//		//					done()
//		//				})
//		//			})
//		//		})
//		//	})
//		//})
//		//
//		//it("attackAllianceShrine 正常行军2", function(done){
//		//	var m_allianceData = null
//		//	Api.loginPlayer(Config.deviceId, function(doc){
//		//		doc.code.should.equal(200)
//		//		Api.sendChat("dragonstar blueDragon 1", function(doc){
//		//			doc.code.should.equal(200)
//		//			Api.sendChat("soldiers 1000", function(doc){
//		//				doc.code.should.equal(200)
//		//				Api.getMyAllianceData(function(doc){
//		//					doc.code.should.equal(200)
//		//					m_allianceData = doc.allianceData
//		//					Api.attackAllianceShrine(m_allianceData.shrineEvents[0].id, "blueDragon", [
//		//						{
//		//							name:"swordsman",
//		//							count:20
//		//						},
//		//						{
//		//							name:"sentinel",
//		//							count:20
//		//						},
//		//						{
//		//							name:"ranger",
//		//							count:20
//		//						}
//		//					], function(doc){
//		//						doc.code.should.equal(200)
//		//						done()
//		//					})
//		//				})
//		//			})
//		//		})
//		//	})
//		//})
//		//
//		//it("attackAllianceShrine 正常行军3", function(done){
//		//	var m_allianceData = null
//		//	Api.loginPlayer(Config.deviceId5, function(doc){
//		//		doc.code.should.equal(200)
//		//		Api.sendChat("dragonstar blueDragon 1", function(doc){
//		//			doc.code.should.equal(200)
//		//			Api.sendChat("soldiers 1000", function(doc){
//		//				doc.code.should.equal(200)
//		//				Api.getMyAllianceData(function(doc){
//		//					doc.code.should.equal(200)
//		//					m_allianceData = doc.allianceData
//		//					Api.attackAllianceShrine(m_allianceData.shrineEvents[0].id, "blueDragon", [
//		//						{
//		//							name:"swordsman",
//		//							count:20
//		//						},
//		//						{
//		//							name:"sentinel",
//		//							count:20
//		//						},
//		//						{
//		//							name:"ranger",
//		//							count:20
//		//						}
//		//					], function(doc){
//		//						doc.code.should.equal(200)
//		//						done()
//		//					})
//		//				})
//		//			})
//		//		})
//		//	})
//		//})
//
//		it("requestAllianceToFight 正常请求", function(done){
//			Api.loginPlayer(Config.deviceId3, function(doc){
//				doc.code.should.equal(200)
//				Api.requestAllianceToFight(function(doc){
//					doc.code.should.equal(200)
//					done()
//				})
//			})
//		})
//
//		it("requestAllianceToFight 已经发送过开战请求", function(done){
//			Api.requestAllianceToFight(function(doc){
//				doc.code.should.equal(Errors.alreadySendAllianceFightRequest.code)
//				done()
//			})
//		})
//
//		it("findAllianceToFight 正常查找", function(done){
//			Api.loginPlayer(Config.deviceId3, function(doc){
//				doc.code.should.equal(200)
//				Api.findAllianceToFight(function(doc){
//					doc.code.should.equal(200);
//					done()
//				})
//			})
//		})
//
//		//it("getAllianceViewData 正常获取", function(done){
//		//	var m_allianceData = null
//		//	Api.getMyAllianceData(function(doc){
//		//		doc.code.should.equal(200)
//		//		m_allianceData = doc.allianceData
//		//		Api.getAllianceViewData(m_allianceData._id, function(doc){
//		//			doc.code.should.equal(200)
//		//			done()
//		//		})
//		//	})
//		//})
//		//
//		//it("getNearedAllianceInfos 正常获取", function(done){
//		//	Api.getNearedAllianceInfos(function(doc){
//		//		doc.code.should.equal(200)
//		//		done()
//		//	})
//		//})
//		//
//		//it("searchAllianceInfoByTag 正常搜索", function(done){
//		//	Api.searchAllianceInfoByTag("t", function(doc){
//		//		doc.code.should.equal(200)
//		//		done()
//		//	})
//		//})
//
//		//it("helpAllianceMemberDefence 正常协助", function(done){
//		//	Api.loginPlayer(Config.deviceId3, function(doc){
//		//		doc.code.should.equal(200)
//		//		var m_allianceData = null
//		//		Api.getMyAllianceData(function(doc){
//		//			doc.code.should.equal(200)
//		//			m_allianceData = doc.allianceData
//		//			Api.sendChat("dragonstar blueDragon 1", function(doc){
//		//				doc.code.should.equal(200)
//		//				Api.sendChat("soldiers 1000", function(doc){
//		//					doc.code.should.equal(200)
//		//					Api.helpAllianceMemberDefence(
//		//						"blueDragon",
//		//						[
//		//							{
//		//								name:"swordsman",
//		//								count:5
//		//							},
//		//							{
//		//								name:"sentinel",
//		//								count:5
//		//							},
//		//							{
//		//								name:"ranger",
//		//								count:5
//		//							}
//		//						],
//		//						m_allianceData.members[1].id,
//		//						function(doc){
//		//							doc.code.should.equal(200)
//		//							done()
//		//						})
//		//				})
//		//			})
//		//		})
//		//	})
//		//})
//
//		//it("getHelpDefenceMarchEventDetail 正常获取", function(done){
//		//	var m_myAllianceData = null
//		//	Api.loginPlayer(Config.deviceId, function(doc){
//		//		doc.code.should.equal(200)
//		//		Api.getMyAllianceData(function(doc){
//		//			doc.code.should.equal(200)
//		//			m_myAllianceData = doc.allianceData
//		//			Api.getHelpDefenceMarchEventDetail(m_myAllianceData._id, m_myAllianceData.attackMarchEvents[0].id, function(doc){
//		//				doc.code.should.equal(200)
//		//				done()
//		//			})
//		//		})
//		//	})
//		//})
//
//		//it("useItem retreatTroop", function(done){
//		//	var m_myAllianceData = null
//		//	Api.loginPlayer(Config.deviceId, function(doc){
//		//		doc.code.should.equal(200)
//		//		Api.getMyAllianceData(function(doc){
//		//			doc.code.should.equal(200)
//		//			m_myAllianceData = doc.allianceData
//		//			Api.buyItem("retreatTroop", 1, function(doc){
//		//				doc.code.should.equal(200)
//		//				Api.useItem("retreatTroop", {
//		//					retreatTroop:{
//		//						eventType:"attackMarchEvents",
//		//						eventId:m_myAllianceData.attackMarchEvents[0].id
//		//					}
//		//				}, function(doc){
//		//					doc.code.should.equal(200)
//		//					done()
//		//				})
//		//			})
//		//		})
//		//	})
//		//})
//
//		//it("useItem warSpeedupClass_2", function(done){
//		//	var m_myAllianceData = null
//		//	Api.loginPlayer(Config.deviceId, function(doc){
//		//		doc.code.should.equal(200)
//		//		Api.getMyAllianceData(function(doc){
//		//			doc.code.should.equal(200)
//		//			m_myAllianceData = doc.allianceData
//		//			Api.buyItem("warSpeedupClass_2", 1, function(doc){
//		//				doc.code.should.equal(200)
//		//				Api.useItem("warSpeedupClass_2", {
//		//					warSpeedupClass_2:{
//		//						eventType:"attackMarchEvents",
//		//						eventId:m_myAllianceData.attackMarchEvents[0].id
//		//					}
//		//				}, function(doc){
//		//					doc.code.should.equal(200)
//		//					done()
//		//				})
//		//			})
//		//		})
//		//	})
//		//})
//
//		//it("useItem moveTheCity", function(done){
//		//	var m_myAllianceData = null
//		//	Api.loginPlayer(Config.deviceId, function(doc){
//		//		doc.code.should.equal(200)
//		//		Api.getMyAllianceData(function(doc){
//		//			doc.code.should.equal(200)
//		//			m_myAllianceData = doc.allianceData
//		//			Api.buyItem("moveTheCity", 1, function(doc){
//		//				doc.code.should.equal(200)
//		//				var map = MapUtils.buildMap(m_myAllianceData.mapObjects)
//		//				var rect = MapUtils.getRect(map, 1, 1)
//		//				Api.useItem("moveTheCity", {
//		//					moveTheCity:{
//		//						locationX:rect.x,
//		//						locationY:rect.y
//		//					}
//		//				}, function(doc){
//		//					doc.code.should.equal(200)
//		//					done()
//		//				})
//		//			})
//		//		})
//		//	})
//		//})
//
//		//it("getHelpDefenceTroopDetail 正常获取", function(done){
//		//	setTimeout(function(){
//		//		Api.loginPlayer(Config.deviceId, function(doc){
//		//			doc.code.should.equal(200)
//		//			m_user = doc.playerData
//		//			Api.getHelpDefenceTroopDetail(m_user._id, m_user.helpedByTroops[0].id, function(doc){
//		//				doc.code.should.equal(200)
//		//				done()
//		//			})
//		//		})
//		//	}, 5.5 * 1000)
//		//})
//
//		//it("retreatFromBeHelpedAllianceMember 玩家没有协防部队驻扎在目标玩家城市", function(done){
//		//	var m_allianceData = null
//		//	Api.getMyAllianceData(function(doc){
//		//		doc.code.should.equal(200)
//		//		m_allianceData = doc.allianceData
//		//		Api.retreatFromBeHelpedAllianceMember(m_allianceData.members[1].id, function(doc){
//		//			doc.code.should.equal(Errors.noHelpDefenceTroopInTargetPlayerCity.code)
//		//			done()
//		//		})
//		//	})
//		//})
//
//		//it("retreatFromHelpedAllianceMember 正常撤回", function(done){
//		//	var m_allianceData = null
//		//	Api.getMyAllianceData(function(doc){
//		//		doc.code.should.equal(200)
//		//		m_allianceData = doc.allianceData
//		//		setTimeout(function(){
//		//			Api.retreatFromBeHelpedAllianceMember(m_allianceData.members[1].id, function(doc){
//		//				doc.code.should.equal(200)
//		//				done()
//		//			})
//		//		}, 6 * 1000)
//		//	})
//		//})
//
//		//it("revengeAlliance 正常复仇", function(done){
//		//	setTimeout(function(){
//		//		var m_allianceData = null
//		//		Api.loginPlayer(Config.deviceId3, function(doc){
//		//			doc.code.should.equal(200)
//		//			Api.getMyAllianceData(function(doc){
//		//				doc.code.should.equal(200)
//		//				Api.revengeAlliance(m_allianceData.allianceFightReports[0].id, function(doc){
//		//					doc.code.should.equal(200)
//		//					done()
//		//				})
//		//			})
//		//			var onGetAllianceDataSuccess = function(doc){
//		//				m_allianceData = doc
//		//				pomelo.removeListener("onGetAllianceDataSuccess", onGetAllianceDataSuccess)
//		//			}
//		//			pomelo.on("onGetAllianceDataSuccess", onGetAllianceDataSuccess)
//		//		})
//		//	}, 37 * 1000)
//		//})
//
//		//it("setDefenceDragon 正常设置", function(done){
//		//	Api.loginPlayer(Config.deviceId, function(doc){
//		//		doc.code.should.equal(200)
//		//		Api.sendChat("dragonstar greenDragon 1", function(doc){
//		//			doc.code.should.equal(200)
//		//			Api.sendChat("soldiers 10", function(doc){
//		//				doc.code.should.equal(200)
//		//				Api.setDefenceDragon("greenDragon", function(doc){
//		//					doc.code.should.equal(200)
//		//					done()
//		//				})
//		//			})
//		//		})
//		//	})
//		//})
//
//		//it("strikePlayerCity 有协防玩家", function(done){
//		//	Api.loginPlayer(Config.deviceId3, function(doc){
//		//		doc.code.should.equal(200)
//		//		var m_allianceData = null
//		//		Api.getMyAllianceData(function(doc){
//		//			m_allianceData = doc.allianceData
//		//			doc.code.should.equal(200)
//		//			Api.sendChat("dragonstar blueDragon 2", function(doc){
//		//				doc.code.should.equal(200)
//		//				Api.sendChat("soldiers 1000", function(doc){
//		//					doc.code.should.equal(200)
//		//					Api.helpAllianceMemberDefence(
//		//						"blueDragon",
//		//						[
//		//							{
//		//								name:"swordsman",
//		//								count:5
//		//							},
//		//							{
//		//								name:"sentinel",
//		//								count:5
//		//							},
//		//							{
//		//								name:"ranger",
//		//								count:5
//		//							}
//		//						],
//		//						m_allianceData.members[1].id,
//		//						function(doc){
//		//							doc.code.should.equal(200)
//		//						})
//		//				})
//		//			})
//		//		})
//		//	})
//		//	setTimeout(function(){
//		//		var m_myAllianceData = null
//		//		var m_enemyAllianceData = null
//		//		Api.loginPlayer(Config.deviceId4, function(doc){
//		//			doc.code.should.equal(200)
//		//			Api.getMyAllianceData(function(doc){
//		//				doc.code.should.equal(200)
//		//				m_myAllianceData = doc.allianceData
//		//				var allianceFight = m_myAllianceData.allianceFight
//		//				var enemyAllianceId = _.isEqual(allianceFight.attackAllianceId, m_myAllianceData._id) ? allianceFight.defenceAllianceId : allianceFight.attackAllianceId
//		//				Api.getAllianceViewData(enemyAllianceId, function(doc){
//		//					doc.code.should.equal(200)
//		//					m_enemyAllianceData = doc.allianceViewData
//		//					Api.sendChat("dragonstar greenDragon 1", function(doc){
//		//						doc.code.should.equal(200)
//		//						Api.strikePlayerCity("greenDragon", m_enemyAllianceData.members[1].id, function(doc){
//		//							doc.code.should.equal(200)
//		//							done()
//		//						})
//		//					})
//		//				})
//		//			})
//		//		})
//		//	}, 2 * 1000)
//		//})
//
//		//it("strikePlayerCity 无协防玩家,防守玩家有龙", function(done){
//		//	Api.loginPlayer(Config.deviceId, function(doc){
//		//		doc.code.should.equal(200)
//		//		Api.sendChat("dragonstar greenDragon 1", function(doc){
//		//			doc.code.should.equal(200)
//		//			Api.sendChat("soldiers 10", function(doc){
//		//				doc.code.should.equal(200)
//		//				Api.setDefenceDragon("greenDragon", function(doc){
//		//					doc.code.should.equal(200)
//		//				})
//		//			})
//		//		})
//		//	})
//		//	setTimeout(function(){
//		//		var m_myAllianceData = null
//		//		var m_enemyAllianceData = null
//		//		Api.loginPlayer(Config.deviceId4, function(doc){
//		//			doc.code.should.equal(200)
//		//			Api.getMyAllianceData(function(doc){
//		//				doc.code.should.equal(200)
//		//				m_myAllianceData = doc.allianceData
//		//				var allianceFight = m_myAllianceData.allianceFight
//		//				var enemyAllianceId = _.isEqual(allianceFight.attackAllianceId, m_myAllianceData._id) ? allianceFight.defenceAllianceId : allianceFight.attackAllianceId
//		//				Api.getAllianceViewData(enemyAllianceId, function(doc){
//		//					doc.code.should.equal(200)
//		//					m_enemyAllianceData = doc.allianceViewData
//		//					Api.sendChat("dragonstar greenDragon 2", function(doc){
//		//						doc.code.should.equal(200)
//		//						Api.strikePlayerCity("greenDragon", m_enemyAllianceData.members[1].id, function(doc){
//		//							doc.code.should.equal(200)
//		//							done()
//		//						})
//		//					})
//		//				})
//		//			})
//		//		})
//		//	}, 2 * 1000)
//		//})
//
//		//it("strikePlayerCity 无协防玩家,防守玩家无龙", function(done){
//		//	setTimeout(function(){
//		//		var m_myAllianceData = null
//		//		var m_enemyAllianceData = null
//		//		Api.loginPlayer(Config.deviceId4, function(doc){
//		//			doc.code.should.equal(200)
//		//			Api.getMyAllianceData(function(doc){
//		//				doc.code.should.equal(200)
//		//				m_myAllianceData = doc.allianceData
//		//				var allianceFight = m_myAllianceData.allianceFight
//		//				var enemyAllianceId = _.isEqual(allianceFight.attackAllianceId, m_myAllianceData._id) ? allianceFight.defenceAllianceId : allianceFight.attackAllianceId
//		//				Api.getAllianceViewData(enemyAllianceId, function(doc){
//		//					doc.code.should.equal(200)
//		//					m_enemyAllianceData = doc.allianceViewData
//		//					Api.sendChat("dragonstar greenDragon 2", function(doc){
//		//						doc.code.should.equal(200)
//		//						Api.strikePlayerCity("greenDragon", m_enemyAllianceData.members[1].id, function(doc){
//		//							doc.code.should.equal(200)
//		//							done()
//		//						})
//		//					})
//		//				})
//		//			})
//		//		})
//		//	}, 2 * 1000)
//		//})
//
//		//it("getStrikeMarchEventDetail 正常获取", function(done){
//		//	var m_enemyAllianceData = null
//		//	Api.loginPlayer(Config.deviceId4, function(doc){
//		//		doc.code.should.equal(200)
//		//		Api.getMyAllianceData(function(doc){
//		//			doc.code.should.equal(200)
//		//			m_enemyAllianceData = doc.allianceData
//		//			Api.loginPlayer(Config.deviceId, function(doc){
//		//				doc.code.should.equal(200)
//		//				Api.getStrikeMarchEventDetail(m_enemyAllianceData._id, m_enemyAllianceData.strikeMarchEvents[0].id, function(doc){
//		//					doc.code.should.equal(200)
//		//					done()
//		//				})
//		//			})
//		//		})
//		//	})
//		//})
//
//		//it("readReports 正常阅读", function(done){
//		//	setTimeout(function(){
//		//		Api.loginPlayer(Config.deviceId4, function(doc){
//		//			doc.code.should.equal(200)
//		//			m_user = doc.playerData
//		//			Api.readReports([m_user.reports[0].id], function(doc){
//		//				doc.code.should.equal(200)
//		//				done()
//		//			})
//		//		})
//		//	}, 5 * 1000)
//		//})
//		//
//		//it("saveReport 正常收藏", function(done){
//		//	Api.saveReport(m_user.reports[0].id, function(doc){
//		//		doc.code.should.equal(200)
//		//		done()
//		//	})
//		//})
//		//
//		//it("unSaveReport 正常取消收藏", function(done){
//		//	Api.unSaveReport(m_user.reports[0].id, function(doc){
//		//		doc.code.should.equal(200)
//		//		done()
//		//	})
//		//})
//		//
//		//it("getReports 获取战报", function(done){
//		//	Api.getReports(0, function(doc){
//		//		doc.code.should.equal(200)
//		//		done()
//		//	})
//		//})
//		//
//		//it("getSavedReports 获取已存战报", function(done){
//		//	Api.getSavedReports(0, function(doc){
//		//		doc.code.should.equal(200)
//		//		done()
//		//	})
//		//})
//		//
//		//it("deleteReports 正常删除收藏战报", function(done){
//		//	Api.deleteReports([m_user.reports[0].id], function(doc){
//		//		doc.code.should.equal(200)
//		//		done()
//		//	})
//		//})
//
//		//it("attackPlayerCity 有协防玩家,且协防玩家胜利", function(done){
//		//	Api.loginPlayer(Config.deviceId3, function(doc){
//		//		doc.code.should.equal(200)
//		//		var m_allianceData = null
//		//		Api.getMyAllianceData(function(doc){
//		//			doc.code.should.equal(200)
//		//			m_allianceData = doc.allianceData
//		//			Api.sendChat("dragonstar blueDragon 2", function(doc){
//		//				doc.code.should.equal(200)
//		//				Api.sendChat("soldiers 1000", function(doc){
//		//					doc.code.should.equal(200)
//		//					Api.helpAllianceMemberDefence(
//		//						"blueDragon",
//		//						[
//		//							{
//		//								name:"swordsman",
//		//								count:30
//		//							},
//		//							{
//		//								name:"sentinel",
//		//								count:30
//		//							},
//		//							{
//		//								name:"ranger",
//		//								count:30
//		//							}
//		//						],
//		//						m_allianceData.members[1].id,
//		//						function(doc){
//		//							doc.code.should.equal(200)
//		//						})
//		//				})
//		//			})
//		//		})
//		//	})
//		//	setTimeout(function(){
//		//		var m_myAllianceData = null
//		//		var m_enemyAllianceData = null
//		//		Api.loginPlayer(Config.deviceId4, function(doc){
//		//			doc.code.should.equal(200)
//		//			Api.getMyAllianceData(function(doc){
//		//				doc.code.should.equal(200)
//		//				m_myAllianceData = doc.allianceData
//		//				var allianceFight = m_myAllianceData.allianceFight
//		//				var enemyAllianceId = _.isEqual(allianceFight.attackAllianceId, m_myAllianceData._id) ? allianceFight.defenceAllianceId : allianceFight.attackAllianceId
//		//				Api.getAllianceViewData(enemyAllianceId, function(doc){
//		//					doc.code.should.equal(200)
//		//					m_enemyAllianceData = doc.allianceViewData
//		//					Api.sendChat("dragonstar greenDragon 1", function(doc){
//		//						doc.code.should.equal(200)
//		//						Api.sendChat("soldiers 1000", function(doc){
//		//							doc.code.should.equal(200)
//		//							Api.attackPlayerCity("greenDragon",[
//		//								{
//		//									name:"swordsman",
//		//									count:20
//		//								},
//		//								{
//		//									name:"sentinel",
//		//									count:20
//		//								},
//		//								{
//		//									name:"ranger",
//		//									count:20
//		//								}
//		//							], m_enemyAllianceData.members[1].id, function(doc){
//		//								doc.code.should.equal(200)
//		//								done()
//		//							})
//		//						})
//		//					})
//		//				})
//		//			})
//		//		})
//		//	}, 2 * 1000)
//		//})
//
//		//it("attackPlayerCity 有协防玩家,且协防玩家失败", function(done){
//		//	Api.loginPlayer(Config.deviceId3, function(doc){
//		//		doc.code.should.equal(200)
//		//		var m_allianceData = null
//		//		Api.getMyAllianceData(function(doc){
//		//			doc.code.should.equal(200)
//		//			m_allianceData = doc.allianceData
//		//			Api.sendChat("dragonstar blueDragon 1", function(doc){
//		//				doc.code.should.equal(200)
//		//				Api.sendChat("soldiers 1000", function(doc){
//		//					doc.code.should.equal(200)
//		//					Api.helpAllianceMemberDefence(
//		//						"blueDragon",
//		//						[
//		//							{
//		//								name:"swordsman",
//		//								count:10
//		//							},
//		//							{
//		//								name:"sentinel",
//		//								count:10
//		//							},
//		//							{
//		//								name:"ranger",
//		//								count:10
//		//							}
//		//						],
//		//						m_allianceData.members[1].id,
//		//						function(doc){
//		//							doc.code.should.equal(200)
//		//							Api.loginPlayer(Config.deviceId, function(doc){
//		//								doc.code.should.equal(200)
//		//								Api.sendChat("dragonstar greenDragon 1", function(doc){
//		//									doc.code.should.equal(200)
//		//									Api.sendChat("soldiers 20", function(doc){
//		//										doc.code.should.equal(200)
//		//										Api.setDefenceDragon("greenDragon", function(doc){
//		//											doc.code.should.equal(200)
//		//										})
//		//									})
//		//								})
//		//							})
//		//						})
//		//				})
//		//			})
//		//		})
//		//	})
//		//	setTimeout(function(){
//		//		var m_myAllianceData = null
//		//		var m_enemyAllianceData = null
//		//		Api.loginPlayer(Config.deviceId4, function(doc){
//		//			doc.code.should.equal(200)
//		//			Api.getMyAllianceData(function(doc){
//		//				doc.code.should.equal(200)
//		//				m_myAllianceData = doc.allianceData
//		//				var allianceFight = m_myAllianceData.allianceFight
//		//				var enemyAllianceId = _.isEqual(allianceFight.attackAllianceId, m_myAllianceData._id) ? allianceFight.defenceAllianceId : allianceFight.attackAllianceId
//		//				Api.getAllianceViewData(enemyAllianceId, function(doc){
//		//					doc.code.should.equal(200)
//		//					m_enemyAllianceData = doc.allianceViewData
//		//					Api.sendChat("dragonstar greenDragon 1", function(doc){
//		//						doc.code.should.equal(200)
//		//						Api.sendChat("soldiers 1000", function(doc){
//		//							doc.code.should.equal(200)
//		//							Api.attackPlayerCity("greenDragon", [
//		//								{
//		//									name:"swordsman",
//		//									count:20
//		//								},
//		//								{
//		//									name:"sentinel",
//		//									count:20
//		//								},
//		//								{
//		//									name:"ranger",
//		//									count:20
//		//								}
//		//							], m_enemyAllianceData.members[1].id, function(doc){
//		//								doc.code.should.equal(200)
//		//								done()
//		//							})
//		//						})
//		//					})
//		//				})
//		//			})
//		//		})
//		//	}, 2 * 1000)
//		//})
//
//		//it("attackPlayerCity 无协防玩家,有防守玩家,防守玩家成功", function(done){
//		//	Api.loginPlayer(Config.deviceId, function(doc){
//		//		doc.code.should.equal(200)
//		//		Api.sendChat("dragonstar greenDragon 1", function(doc){
//		//			doc.code.should.equal(200)
//		//			Api.sendChat("soldiers 1000", function(doc){
//		//				doc.code.should.equal(200)
//		//				Api.setDefenceDragon("greenDragon", function(doc){
//		//					doc.code.should.equal(200)
//		//				})
//		//			})
//		//		})
//		//	})
//		//
//		//	setTimeout(function(){
//		//		var m_myAllianceData = null
//		//		var m_enemyAllianceData = null
//		//		Api.loginPlayer(Config.deviceId4, function(doc){
//		//			doc.code.should.equal(200)
//		//			Api.getMyAllianceData(function(doc){
//		//				doc.code.should.equal(200)
//		//				m_myAllianceData = doc.allianceData
//		//				var allianceFight = m_myAllianceData.allianceFight
//		//				var enemyAllianceId = _.isEqual(allianceFight.attackAllianceId, m_myAllianceData._id) ? allianceFight.defenceAllianceId : allianceFight.attackAllianceId
//		//				Api.getAllianceViewData(enemyAllianceId, function(doc){
//		//					doc.code.should.equal(200)
//		//					m_enemyAllianceData = doc.allianceViewData
//		//					Api.sendChat("dragonstar greenDragon 2", function(doc){
//		//						doc.code.should.equal(200)
//		//						Api.sendChat("soldiers 2000", function(doc){
//		//							doc.code.should.equal(200)
//		//							Api.attackPlayerCity("greenDragon", [
//		//								{
//		//									name:"swordsman",
//		//									count:50
//		//								},
//		//								{
//		//									name:"sentinel",
//		//									count:50
//		//								},
//		//								{
//		//									name:"ranger",
//		//									count:50
//		//								}
//		//							], m_enemyAllianceData.members[1].id, function(doc){
//		//								doc.code.should.equal(200)
//		//								done()
//		//							})
//		//						})
//		//					})
//		//				})
//		//			})
//		//		})
//		//	}, 2 * 1000)
//		//})
//
//		//it("attackPlayerCity 无协防玩家,有防守玩家,防守玩家失败", function(done){
//		//	Api.loginPlayer(Config.deviceId, function(doc){
//		//		doc.code.should.equal(200)
//		//		Api.sendChat("soldiers 20", function(doc){
//		//			doc.code.should.equal(200)
//		//		})
//		//	})
//		//
//		//	setTimeout(function(){
//		//		var m_myAllianceData = null
//		//		var m_enemyAllianceData = null
//		//		Api.loginPlayer(Config.deviceId4, function(doc){
//		//			doc.code.should.equal(200)
//		//			Api.getMyAllianceData(function(doc){
//		//				doc.code.should.equal(200)
//		//				m_myAllianceData = doc.allianceData
//		//				var allianceFight = m_myAllianceData.allianceFight
//		//				var enemyAllianceId = _.isEqual(allianceFight.attackAllianceId, m_myAllianceData._id) ? allianceFight.defenceAllianceId : allianceFight.attackAllianceId
//		//				Api.getAllianceViewData(enemyAllianceId, function(doc){
//		//					doc.code.should.equal(200)
//		//					m_enemyAllianceData = doc.allianceViewData
//		//					Api.sendChat("dragonstar greenDragon 3", function(doc){
//		//						doc.code.should.equal(200)
//		//						doc.code.should.equal(200)
//		//						Api.sendChat("soldiers 5000", function(doc){
//		//							doc.code.should.equal(200)
//		//							Api.attackPlayerCity("greenDragon", [
//		//								{
//		//									name:"swordsman",
//		//									count:5000
//		//								},
//		//								{
//		//									name:"sentinel",
//		//									count:5000
//		//								},
//		//								{
//		//									name:"ranger",
//		//									count:5000
//		//								}
//		//							], m_enemyAllianceData.members[1].id, function(doc){
//		//								doc.code.should.equal(200)
//		//								done()
//		//							})
//		//						})
//		//					})
//		//				})
//		//			})
//		//		})
//		//	}, 2 * 1000)
//		//})
//
//		//it("getAttackMarchEventDetail 正常获取", function(done){
//		//	var m_enemyAllianceData = null
//		//	Api.loginPlayer(Config.deviceId4, function(doc){
//		//		doc.code.should.equal(200)
//		//		Api.getMyAllianceData(function(doc){
//		//			doc.code.should.equal(200)
//		//			m_enemyAllianceData = doc.allianceData
//		//			Api.loginPlayer(Config.deviceId, function(doc){
//		//				doc.code.should.equal(200)
//		//				Api.getAttackMarchEventDetail(m_enemyAllianceData._id, m_enemyAllianceData.attackMarchEvents[0].id, function(doc){
//		//					doc.code.should.equal(200)
//		//					done()
//		//				})
//		//			})
//		//			})
//		//		})
//		//		var onGetAllianceDataSuccess = function(doc){
//		//			m_enemyAllianceData = doc
//		//			pomelo.removeListener("onGetAllianceDataSuccess", onGetAllianceDataSuccess)
//		//		}
//		//		pomelo.on("onGetAllianceDataSuccess", onGetAllianceDataSuccess)
//		//})
//
//		//it("strikeVillage 突袭敌对联盟村落,直接回家", function(done){
//		//	setTimeout(function(){
//		//		var m_myAllianceData = null
//		//		var m_enemyAllianceData = null
//		//		Api.loginPlayer(Config.deviceId3, function(doc){
//		//			doc.code.should.equal(200)
//		//			Api.getMyAllianceData(function(doc){
//		//				doc.code.should.equal(200)
//		//				m_myAllianceData = doc.allianceData
//		//				var allianceFight = m_myAllianceData.allianceFight
//		//				var enemyAllianceId = _.isEqual(allianceFight.attackAllianceId, m_myAllianceData._id) ? allianceFight.defenceAllianceId : allianceFight.attackAllianceId
//		//				Api.getAllianceViewData(enemyAllianceId, function(doc){
//		//					doc.code.should.equal(200)
//		//					m_enemyAllianceData = doc.allianceViewData
//		//					Api.sendChat("dragonstar greenDragon 1", function(doc){
//		//						doc.code.should.equal(200)
//		//						Api.strikeVillage(
//		//							"greenDragon",
//		//							m_enemyAllianceData._id,
//		//							m_enemyAllianceData.villages[0].id,
//		//							function(doc){
//		//								doc.code.should.equal(200)
//		//								done()
//		//							}
//		//						)
//		//					})
//		//				})
//		//			})
//		//		})
//		//	}, 2 * 1000)
//		//})
//
//		//it("strikeVillage 进攻敌对联盟村落,敌方侦查此村落", function(done){
//		//	setTimeout(function(){
//		//		var m_myAllianceData = null
//		//		var m_enemyAllianceData = null
//		//		Api.loginPlayer(Config.deviceId3, function(doc){
//		//			doc.code.should.equal(200)
//		//			Api.getMyAllianceData(function(doc){
//		//				doc.code.should.equal(200)
//		//				m_myAllianceData = doc.allianceData
//		//				var allianceFight = m_myAllianceData.allianceFight
//		//				var enemyAllianceId = _.isEqual(allianceFight.attackAllianceId, m_myAllianceData._id) ? allianceFight.defenceAllianceId : allianceFight.attackAllianceId
//		//				Api.getAllianceViewData(enemyAllianceId, function(doc){
//		//					doc.code.should.equal(200)
//		//					m_enemyAllianceData = doc.allianceViewData
//		//					Api.sendChat("dragonstar greenDragon 1", function(doc){
//		//						doc.code.should.equal(200)
//		//						Api.sendChat("soldiers 1000", function(doc){
//		//							doc.code.should.equal(200)
//		//							Api.attackVillage(
//		//								"greenDragon",
//		//								[
//		//									{
//		//										name:"swordsman",
//		//										count:20
//		//									},
//		//									{
//		//										name:"sentinel",
//		//										count:20
//		//									},
//		//									{
//		//										name:"ranger",
//		//										count:20
//		//									}
//		//								],
//		//								m_enemyAllianceData._id,
//		//								m_enemyAllianceData.villages[0].id,
//		//								function(doc){
//		//									doc.code.should.equal(200)
//		//									setTimeout(function(){
//		//										Api.loginPlayer(Config.deviceId4, function(doc){
//		//											doc.code.should.equal(200)
//		//											Api.sendChat("dragonstar greenDragon 1", function(doc){
//		//												doc.code.should.equal(200)
//		//												Api.strikeVillage(
//		//													"greenDragon",
//		//													m_enemyAllianceData._id,
//		//													m_enemyAllianceData.villages[0].id,
//		//													function(doc){
//		//														doc.code.should.equal(200)
//		//														done()
//		//													}
//		//												)
//		//											})
//		//										})
//		//									}, 2 * 1000)
//		//								}
//		//							)
//		//						})
//		//					})
//		//				})
//		//			})
//		//		})
//		//	}, 2 * 1000)
//		//})
//
//		//it("attackVillage 进攻本联盟村落 采集完成自动回家", function(done){
//		//	var m_myAllianceData = null
//		//	Api.loginPlayer(Config.deviceId3, function(doc){
//		//		doc.code.should.equal(200)
//		//		Api.getMyAllianceData(function(doc){
//		//			doc.code.should.equal(200)
//		//			m_myAllianceData = doc.allianceData
//		//			Api.sendChat("dragonstar greenDragon 1", function(doc){
//		//				doc.code.should.equal(200)
//		//				Api.sendChat("soldiers 1000", function(doc){
//		//					doc.code.should.equal(200)
//		//					Api.attackVillage(
//		//						"greenDragon",
//		//						[
//		//							{
//		//								name:"swordsman",
//		//								count:5
//		//							},
//		//							{
//		//								name:"sentinel",
//		//								count:5
//		//							},
//		//							{
//		//								name:"ranger",
//		//								count:5
//		//							}
//		//						],
//		//						m_myAllianceData._id,
//		//						m_myAllianceData.villages[0].id,
//		//						function(doc){
//		//							doc.code.should.equal(200)
//		//							done()
//		//						}
//		//					)
//		//				})
//		//			})
//		//		})
//		//	})
//		//})
//
//		//it("attackVillage 进攻敌对联盟村落 采集完成自动回家", function(done){
//		//	setTimeout(function(){
//		//		var m_myAllianceData = null
//		//		var m_enemyAllianceData = null
//		//		Api.loginPlayer(Config.deviceId3, function(doc){
//		//			doc.code.should.equal(200)
//		//			Api.getMyAllianceData(function(doc){
//		//				doc.code.should.equal(200)
//		//				m_myAllianceData = doc.allianceData
//		//				var allianceFight = m_myAllianceData.allianceFight
//		//				var enemyAllianceId = _.isEqual(allianceFight.attackAllianceId, m_myAllianceData._id) ? allianceFight.defenceAllianceId : allianceFight.attackAllianceId
//		//				Api.getAllianceViewData(enemyAllianceId, function(doc){
//		//					doc.code.should.equal(200)
//		//					m_enemyAllianceData = doc.allianceViewData
//		//					Api.sendChat("dragonstar greenDragon 1", function(doc){
//		//						doc.code.should.equal(200)
//		//						Api.sendChat("soldiers 1000", function(doc){
//		//							doc.code.should.equal(200)
//		//							Api.attackVillage(
//		//								"greenDragon",
//		//								[
//		//									{
//		//										name:"swordsman",
//		//										count:15
//		//									},
//		//									{
//		//										name:"sentinel",
//		//										count:15
//		//									},
//		//									{
//		//										name:"ranger",
//		//										count:15
//		//									}
//		//								],
//		//								m_enemyAllianceData._id,
//		//								m_enemyAllianceData.villages[0].id,
//		//								function(doc){
//		//									doc.code.should.equal(200)
//		//									done()
//		//								}
//		//							)
//		//						})
//		//					})
//		//				})
//		//			})
//		//		})
//		//	}, 2 * 1000)
//		//})
//
//		//it("attackVillage 采集我方联盟村落 敌对方进攻且敌对方胜利", function(done){
//		//	var m_myAllianceData = null
//		//	var m_enemyAllianceData = null
//		//	Api.loginPlayer(Config.deviceId3, function(doc){
//		//		doc.code.should.equal(200)
//		//		Api.getMyAllianceData(function(doc){
//		//			doc.code.should.equal(200)
//		//			m_myAllianceData = doc.allianceData
//		//			var allianceFight = m_myAllianceData.allianceFight
//		//			var enemyAllianceId = _.isEqual(allianceFight.attackAllianceId, m_myAllianceData._id) ? allianceFight.defenceAllianceId : allianceFight.attackAllianceId
//		//			Api.getAllianceViewData(enemyAllianceId, function(doc){
//		//				doc.code.should.equal(200)
//		//				m_enemyAllianceData = doc.allianceViewData
//		//				Api.sendChat("dragonstar greenDragon 1", function(doc){
//		//					doc.code.should.equal(200)
//		//					Api.sendChat("soldiers 1000", function(doc){
//		//						doc.code.should.equal(200)
//		//						Api.attackVillage(
//		//							"greenDragon",
//		//							[
//		//								{
//		//									name:"swordsman",
//		//									count:20
//		//								},
//		//								{
//		//									name:"sentinel",
//		//									count:20
//		//								},
//		//								{
//		//									name:"ranger",
//		//									count:20
//		//								}
//		//							],
//		//							m_myAllianceData._id,
//		//							m_myAllianceData.villages[0].id,
//		//							function(doc){
//		//								doc.code.should.equal(200)
//		//								setTimeout(function(){
//		//									Api.loginPlayer(Config.deviceId4, function(doc){
//		//										doc.code.should.equal(200)
//		//										Api.sendChat("dragonstar greenDragon 1", function(doc){
//		//											doc.code.should.equal(200)
//		//											Api.sendChat("soldiers 1000", function(doc){
//		//												doc.code.should.equal(200)
//		//												Api.attackVillage(
//		//													"greenDragon",
//		//													[
//		//														{
//		//															name:"swordsman",
//		//															count:100
//		//														},
//		//														{
//		//															name:"sentinel",
//		//															count:100
//		//														},
//		//														{
//		//															name:"ranger",
//		//															count:100
//		//														}
//		//													],
//		//													m_myAllianceData._id,
//		//													m_myAllianceData.villages[0].id,
//		//													function(doc){
//		//														doc.code.should.equal(200)
//		//														done()
//		//													}
//		//												)
//		//											})
//		//										})
//		//									})
//		//								}, 2 * 1000)
//		//							}
//		//						)
//		//					})
//		//				})
//		//			})
//		//		})
//		//	})
//		//})
//
//		//it("attackVillage 采集我方联盟村落 敌对方进攻且敌对方失败", function(done){
//		//	setTimeout(function(){
//		//		var m_myAllianceData = null
//		//		var m_enemyAllianceData = null
//		//		Api.loginPlayer(Config.deviceId3, function(doc){
//		//			doc.code.should.equal(200)
//		//			Api.getMyAllianceData(function(doc){
//		//				doc.code.should.equal(200)
//		//				m_myAllianceData = doc.allianceData
//		//				var allianceFight = m_myAllianceData.allianceFight
//		//				var enemyAllianceId = _.isEqual(allianceFight.attackAllianceId, m_myAllianceData._id) ? allianceFight.defenceAllianceId : allianceFight.attackAllianceId
//		//				Api.getAllianceViewData(enemyAllianceId, function(doc){
//		//					doc.code.should.equal(200)
//		//					m_enemyAllianceData = doc.allianceViewData
//		//					Api.sendChat("dragonstar greenDragon 1", function(doc){
//		//						doc.code.should.equal(200)
//		//						Api.sendChat("soldiers 1000", function(doc){
//		//							doc.code.should.equal(200)
//		//							Api.attackVillage(
//		//								"greenDragon",
//		//								[
//		//									{
//		//										name:"swordsman",
//		//										count:100
//		//									},
//		//									{
//		//										name:"sentinel",
//		//										count:100
//		//									},
//		//									{
//		//										name:"ranger",
//		//										count:100
//		//									}
//		//								],
//		//								m_myAllianceData._id,
//		//								m_myAllianceData.villages[0].id,
//		//								function(doc){
//		//									doc.code.should.equal(200)
//		//									setTimeout(function(){
//		//										Api.loginPlayer(Config.deviceId4, function(doc){
//		//											doc.code.should.equal(200)
//		//											Api.sendChat("dragonstar greenDragon 1", function(doc){
//		//												doc.code.should.equal(200)
//		//												Api.sendChat("soldiers 1000", function(doc){
//		//													doc.code.should.equal(200)
//		//													Api.attackVillage(
//		//														"greenDragon",
//		//														[
//		//															{
//		//																name:"swordsman",
//		//																count:80
//		//															},
//		//															{
//		//																name:"sentinel",
//		//																count:80
//		//															},
//		//															{
//		//																name:"ranger",
//		//																count:80
//		//															}
//		//														],
//		//														m_myAllianceData._id,
//		//														m_myAllianceData.villages[0].id,
//		//														function(doc){
//		//															doc.code.should.equal(200)
//		//															done()
//		//														}
//		//													)
//		//												})
//		//											})
//		//										})
//		//									}, 2 * 1000)
//		//								}
//		//							)
//		//						})
//		//					})
//		//				})
//		//			})
//		//		})
//		//	}, 2 * 1000)
//		//})
//
//		//it("retreatFromVillage 从我方村落中撤兵", function(done){
//		//	var m_myAllianceData = null
//		//	Api.loginPlayer(Config.deviceId3, function(doc){
//		//		doc.code.should.equal(200)
//		//		Api.getMyAllianceData(function(doc){
//		//			doc.code.should.equal(200)
//		//			m_myAllianceData = doc.allianceData
//		//			Api.sendChat("dragonstar greenDragon 1", function(doc){
//		//				doc.code.should.equal(200)
//		//				Api.sendChat("soldiers 1000", function(doc){
//		//					doc.code.should.equal(200)
//		//					Api.attackVillage(
//		//						"greenDragon",
//		//						[
//		//							{
//		//								name:"swordsman",
//		//								count:100
//		//							},
//		//							{
//		//								name:"sentinel",
//		//								count:100
//		//							},
//		//							{
//		//								name:"ranger",
//		//								count:100
//		//							}
//		//						],
//		//						m_myAllianceData._id,
//		//						m_myAllianceData.villages[0].id,
//		//						function(doc){
//		//							doc.code.should.equal(200)
//		//							setTimeout(function(){
//		//								Api.getMyAllianceData(function(doc){
//		//									doc.code.should.equal(200)
//		//									m_myAllianceData = doc.allianceData
//		//									Api.retreatFromVillage(m_myAllianceData.villageEvents[0].id, function(doc){
//		//										doc.code.should.equal(200)
//		//										done()
//		//									})
//		//								})
//		//							}, 5 * 1000)
//		//						}
//		//					)
//		//				})
//		//			})
//		//		})
//		//	})
//		//})
//
//		//it("attackMonster 进攻本联盟野怪", function(done){
//		//	var m_myAllianceData = null
//		//	Api.loginPlayer(Config.deviceId3, function(doc){
//		//		doc.code.should.equal(200)
//		//		Api.getMyAllianceData(function(doc){
//		//			doc.code.should.equal(200)
//		//			m_myAllianceData = doc.allianceData
//		//			Api.sendChat("dragonstar greenDragon 1", function(doc){
//		//				doc.code.should.equal(200)
//		//				Api.sendChat("soldiers 1000", function(doc){
//		//					doc.code.should.equal(200)
//		//					Api.attackMonster(
//		//						"greenDragon",
//		//						[
//		//							{
//		//								name:"swordsman",
//		//								count:150
//		//							},
//		//							{
//		//								name:"sentinel",
//		//								count:150
//		//							},
//		//							{
//		//								name:"ranger",
//		//								count:150
//		//							}
//		//						],
//		//						m_myAllianceData._id,
//		//						m_myAllianceData.monsters[0].id,
//		//						function(doc){
//		//							doc.code.should.equal(200)
//		//							done()
//		//						}
//		//					)
//		//				})
//		//			})
//		//		})
//		//	})
//		//})
//
//		//it("attackMonster 进攻敌对联盟野怪", function(done){
//		//	setTimeout(function(){
//		//		var m_myAllianceData = null
//		//		var m_enemyAllianceData = null
//		//		Api.loginPlayer(Config.deviceId3, function(doc){
//		//			doc.code.should.equal(200)
//		//			Api.getMyAllianceData(function(doc){
//		//				doc.code.should.equal(200)
//		//				m_myAllianceData = doc.allianceData
//		//				var allianceFight = m_myAllianceData.allianceFight
//		//				var enemyAllianceId = _.isEqual(allianceFight.attackAllianceId, m_myAllianceData._id) ? allianceFight.defenceAllianceId : allianceFight.attackAllianceId
//		//				Api.getAllianceViewData(enemyAllianceId, function(doc){
//		//					doc.code.should.equal(200)
//		//					m_enemyAllianceData = doc.allianceViewData
//		//					Api.sendChat("dragonstar greenDragon 1", function(doc){
//		//						doc.code.should.equal(200)
//		//						Api.sendChat("soldiers 1000", function(doc){
//		//							doc.code.should.equal(200)
//		//							Api.attackMonster(
//		//								"greenDragon",
//		//								[
//		//									{
//		//										name:"swordsman",
//		//										count:150
//		//									},
//		//									{
//		//										name:"sentinel",
//		//										count:150
//		//									},
//		//									{
//		//										name:"ranger",
//		//										count:150
//		//									}
//		//								],
//		//								m_enemyAllianceData._id,
//		//								m_enemyAllianceData.monsters[0].id,
//		//								function(doc){
//		//									doc.code.should.equal(200)
//		//									done()
//		//								}
//		//							)
//		//						})
//		//					})
//		//				})
//		//			})
//		//		})
//		//	}, 3 * 1000)
//		//})
//
//		it('sendAllianceChat 正常发送', function(done){
//			Api.sendAllianceChat('test,test', function(doc){
//				doc.code.should.equal(200)
//				done()
//			})
//		})
//
//		it('sendAllianceFightChat 正常发送', function(done){
//			Api.sendAllianceFightChat('test,test', function(doc){
//				doc.code.should.equal(200)
//				done()
//			})
//		})
//
//		it('getAllianceChats 正常获取', function(done){
//			Api.getChats('alliance', function(doc){
//				doc.code.should.equal(200)
//				done()
//			})
//		})
//
//		it('getAllianceFightChats 正常获取', function(done){
//			Api.getChats('allianceFight', function(doc){
//				doc.code.should.equal(200)
//				done()
//			})
//		})
//	})
//
//
//	after(function(){
//		pomelo.disconnect()
//	})
//})