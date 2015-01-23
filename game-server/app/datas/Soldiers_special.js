"use strict"

var special = {}
module.exports = special

special["skeletonWarrior"] = {
	name:"skeletonWarrior",
	type:"infantry",
	specialMaterials:"deathHand,heroBones,soulStone",
	star:2,
	power:10,
	infantry:38,
	archer:30,
	cavalry:19,
	siege:57,
	wall:45,
	hp:50,
	load:17,
	march:50,
	consumeFood:5,
	killScore:1,
	citizen:1,
	recruitTime:40
}
special["skeletonArcher"] = {
	name:"skeletonArcher",
	type:"archer",
	specialMaterials:"deathHand,heroBones,magicBox",
	star:2,
	power:10,
	infantry:95,
	archer:63,
	cavalry:76,
	siege:32,
	wall:51,
	hp:31,
	load:18,
	march:64,
	consumeFood:18,
	killScore:1,
	citizen:1,
	recruitTime:60
}
special["deathKnight"] = {
	name:"deathKnight",
	type:"cavalry",
	specialMaterials:"deathHand,heroBones,magicBox",
	star:3,
	power:26,
	infantry:174,
	archer:58,
	cavalry:116,
	siege:140,
	wall:93,
	hp:87,
	load:48,
	march:80,
	consumeFood:48,
	killScore:2,
	citizen:2,
	recruitTime:80
}
special["meatWagon"] = {
	name:"meatWagon",
	type:"siege",
	specialMaterials:"heroBones,soulStone,magicBox",
	star:3,
	power:48,
	infantry:224,
	archer:336,
	cavalry:140,
	siege:280,
	wall:420,
	hp:135,
	load:96,
	march:52,
	consumeFood:96,
	killScore:4,
	citizen:4,
	recruitTime:95
}
special["priest"] = {
	name:"priest",
	type:"infantry",
	specialMaterials:"confessionHood,brightRing,holyBook",
	star:3,
	power:16,
	infantry:39,
	archer:20,
	cavalry:31,
	siege:47,
	wall:58,
	hp:80,
	load:27,
	march:52,
	consumeFood:27,
	killScore:1,
	citizen:1,
	recruitTime:140
}
special["demonHunter"] = {
	name:"demonHunter",
	type:"archer",
	specialMaterials:"confessionHood,brightRing,brightAlloy",
	star:3,
	power:16,
	infantry:78,
	archer:65,
	cavalry:98,
	siege:52,
	wall:33,
	hp:49,
	load:28,
	march:72,
	consumeFood:28,
	killScore:1,
	citizen:1,
	recruitTime:180
}
special["paladin"] = {
	name:"paladin",
	type:"cavalry",
	specialMaterials:"confessionHood,holyBook,brightAlloy",
	star:3,
	power:27,
	infantry:87,
	archer:58,
	cavalry:72,
	siege:108,
	wall:36,
	hp:150,
	load:53,
	march:75,
	consumeFood:53,
	killScore:2,
	citizen:2,
	recruitTime:240
}
special["steamTank"] = {
	name:"steamTank",
	type:"siege",
	specialMaterials:"brightRing,holyBook,brightAlloy",
	star:3,
	power:58,
	infantry:124,
	archer:372,
	cavalry:199,
	siege:248,
	wall:298,
	hp:186,
	load:106,
	march:48,
	consumeFood:106,
	killScore:4,
	citizen:4,
	recruitTime:280
}
