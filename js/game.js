var tournamentTemplateIds = [];
var ROWS = 10;
var TYPE = 2;

//选择联赛
 layui.use('form', function () {
	var form = layui.form;
	form.on('checkbox(select_all)', function (data) {
		if ($(data.elem).prop('checked')) {
			$("#item_list input[type=checkbox]").attr('checked', 'checked');
		} else {
			$("#item_list input[type=checkbox]").removeAttr('checked');
		}
		form.render();
	})

	//联赛过滤
	form.on('select(liansaiSelect)', function (data) {
		category = data.value;  
    	categoryName = data.elem[data.elem.selectedIndex].text;  
    	form.render('select');   
		
		getGameResult(1, ROWS);
	})
	

});

layui.use('laydate', function(){
	var laydate = layui.laydate;
	
	//执行一个laydate实例
	laydate.render({
	  elem: '#gameResultDate', //指定元素
	  //value: new Date(),
	  done: function(value, date, endDate){
		getGameResult(1, ROWS);
		}
	});

});


function getNextDay(flag){
	var date = $("#gameResultDate").val();
	var timeadd;
	if(date){
		timeadd= new Date(date.replace(/-/g,"/")); //在页面取得当前时间，并截取。
	} else {
		timeadd = new Date();
	}
	timeadd= new Date(timeadd.getTime() + 1*24*60*60*1000*flag); //在日期+1天。
	var timeaddStr = timeadd.getFullYear() + "-";
	if(parseInt((timeadd.getMonth() + 1)) < 10){
		timeaddStr += "0";
	}
	timeaddStr += (timeadd.getMonth() + 1) + "-";
	if((parseInt(timeadd.getDate() + 1)) < 10){
		timeaddStr += "0";
	}
	timeaddStr += timeadd.getDate(); //重新格式化
	$("#gameResultDate").val(timeaddStr);
	
	getGameResult(1, ROWS);
}

//选择数据
var searchData = [];
var orderData = {};

//关闭客服
$(document).ready(function () {
	
	$(".close_btn").click(function () {
		$(".slider_kefu").hide();
	});
	
	$("#confirm-search-btn").click(function(){
		confirmSearch();
	});
	
	findGrounderLeagueList(1);
	
	$("#selPage").change(function(){
		if(TYPE == 2){
			findGrounderLeagueList($(this).val());
		} else {
			getTournamentTemplateList(TYPE, $(this).val())
		}
	});
	
	$("#orderPageNo").change(function(){
		getOrderList(2, $(this).val(), 10);
	});
	
	//下注金额
	$(".moenyCount").click(function(){
		var orderMoney = $("#BetMoney").val();
		if(!orderMoney){
			orderMoney = 0;
		}
		var moenyCount = $(this).attr("val");
		var money = parseInt(orderMoney) + parseInt(moenyCount);
		$("#BetMoney").val(money);
		if(orderData.type == "ou" || orderData.type == "ah"){
			$("#winMoney").html(formatterDouble((money * (parseFloat(orderData.odds)+1))));
		} else {
			$("#winMoney").html(formatterDouble((money * parseFloat(orderData.odds))));
		}
	});
	$("#BetMoney").keyup(function(){
		var orderMoney = $("#BetMoney").val();
		if(!orderMoney){
			orderMoney = 0;
		}
		if(orderData.type == "ou" || orderData.type == "ah"){
			$("#winMoney").html(formatterDouble((orderMoney * (parseFloat(orderData.odds)+1))));
		} else {
			$("#winMoney").html(formatterDouble((orderMoney * parseFloat(orderData.odds))));
		}
	});
	$("#order_delBTN").click(function(){
		$("#BetMoney").val("");
		$("#winMoney").html(0);
	});
	
	
	
	//下注
	$(".the_odds").click(function(){
		bindOdds(this);
	})
	
	//确定下注
	$("#confirm_bet").click(function(){
		orderData.memberId = getStorageUser().id;
		orderData.orderType = 0;
		orderData.betType = TYPE;
		orderData.sourceType = 0;
		orderData.betCount = $("#BetMoney").val();
		
		addOrder(orderData);
	});
	
	// 左边导航
	$(".order_menu li").click(function () {
        $(".order_menu li").removeClass("on");
        $(this).addClass("on");
        var index = $(".order_menu li").index(this);
        $(".order_content").hide()
        $(".order_content").eq(index).show()
        
        if(index == 2){
        	getOrderList(0, 1, 10);
			getOrderList(1, 1, 10);
        }
    })

    $(".game_type .type p").click(function () {
        $(".game_type .type p").removeClass("on");
        $(this).addClass("on");
    })
    
    getMyOrderCount();
	
	
	$("#gameResultListUp").click(function(){
		getNextDay(-1);
	});
	$("#gameResultListNext").click(function(){
		getNextDay(1);
	});
	
	//刷新按钮
	$("#freshTimeBtn").click(function(){
		clearTimeout(timer);
		clearTimeout(timer2);
		clearTimeout(timer3);
		if(TYPE == 0){
			countdown2 = 150;
			getTournamentTemplateList(0, 1);
		} else if(TYPE == 1){
			countdown3 = 150;
			getTournamentTemplateList(1, 1);
		} else {
			countdown = 30;
			findGrounderLeagueList(1);
		}
	})
})


function getMyOrderCount(){
	if(getStorageUser().id){
		$.ajax({
			type: "GET",
			url: BaseUrl + "order/getMyOrderCount",
			data: {memberId : getStorageUser().id},
			dataType: "json",
			cache:false,
			success: function(result){
				if (result.code == SUCCESS_CODE) {
					$("#myOrderCount").html(result.result)
				} else if(result.code == UNLOGIN){
					layer.alert(result.msg);
					unLogin();
				} else {
					
				}
			}
		})
	}
}

/**
 * 下注绑定事件
 * @param _this
 */
function bindOdds(_this){
	trade.touzhu();
	var oid = $(_this).attr("oid");
	var liansaiName = $(_this).attr("liansaiName");
	var liansaiId = $(_this).attr("liansaiId");
	var eventId = $(_this).attr("eventId");
	var eventAgoId = $(_this).attr("eventAgoId");
	var startTime = $(_this).attr("startTime");
	var hostTeamName = $(_this).attr("hostTeamName");
	var hostTeamId = $(_this).attr("hostTeamId");
	var guestTeamName = $(_this).attr("guestTeamName");
	var guestTeamId = $(_this).attr("guestTeamId");
	var scope = $(_this).attr("scope");
	var type = $(_this).attr("type");
	var state = $(_this).attr("state");
	var dataId = $(_this).attr("dataId");
	var odds = $(_this).html();
	
	var ahDparam = $(_this).attr("ahDparam");
	var ouDparam = $(_this).attr("ouDparam");
	var ahTeam = $(_this).attr("ahTeam");
	
	var half = $(_this).attr("currentPeriod"); //1上半场 2下半场
	var playTime = $(_this).attr("time");//注时比赛开始时长
	var score = $(_this).attr("score"); //下注时比赛比分
	
	
	orderData.oid = oid; //联赛id
	orderData.tournamentTemplate = liansaiId; //联赛id
	orderData.tournamentTemplateName = liansaiName; //联赛名称
	orderData.eventId = eventId; //赛程id
	if(eventAgoId)
		orderData.eventAgoId = eventAgoId; //赛程id
	orderData.startTime = startTime; //比赛开始事件
	orderData.odds = odds; //赔率
	orderData.oddsId = dataId; //赔率id
	orderData.teamId = hostTeamId; //主队id
	orderData.teamName = hostTeamName; //主队名称
	orderData.guestTeamId = guestTeamId; //客队id
	orderData.guestTeamName = guestTeamName; //客队名称
	orderData.scope = scope; //场次
	orderData.type = type; //对应类型
	orderData.state = state; //主客队之分 1主,2客,3不区分 这个只存在与大小
	if(ahDparam < 0){
		orderData.ahDparam = -ahDparam; //让球数
	} else {
		orderData.ahDparam = ahDparam; //让球数
	}
	orderData.ouDparam = ouDparam; //大小对应最大赔率
	orderData.ahTeam = ahTeam; //1:主让 2客让
	
	orderData.half = half; //1上半场 2下半场
	orderData.playTime = playTime;//注时比赛开始时长
	orderData.score = score;  //下注时比赛比分
	
	
	if(scope == "1h"){
		if(type == "1x2"){
			$("#0TypeName").html("半场独赢");
		} else if(type == "ah"){
			$("#0TypeName").html("半场让球");
		} else if(type == "ou"){
			$("#0TypeName").html("半场大小");
		}
	} else if(scope == "ord"){
		if(type == "1x2"){
			$("#0TypeName").html("全场独赢");
		} else if(type == "ah"){
			$("#0TypeName").html("全场让球");
		} else if(type == "ou"){
			$("#0TypeName").html("全场大小");
		}
	} else if(scope == "2h"){
		if(type == "1x2"){
			$("#0TypeName").html("下半场独赢");
		} else if(type == "ah"){
			$("#0TypeName").html("下半场让球");
		} else if(type == "ou"){
			$("#0TypeName").html("下半场大小");
		}
	}
	
	$("#orderLiansaiName").html(liansaiName);
	$("#orderHostTeamName").html(hostTeamName);
	$("#orderGuestTeamName").html(guestTeamName);
	
	$("#0ioradio_id").html(odds);
	
	
	
	var html = '';
	if(scope == "1h"){
		var ht = "";
		if(type == "1x2"){
			ht += '<span style="color: #CC0000;">';
			if(state == 1){
				ht += hostTeamName ;
			} else if(state == 2){
				ht += guestTeamName;
			} else if(state == 3){
				ht += "和";
			}
			ht += '  @<b>' + odds + '</b></span>';
		} else if(type == "ah"){
			ht += '<span style="color: #CC0000;">';
			if(state == 1){
				ht += hostTeamName;
				if(ahTeam == 1){
					ht += "-";
				} else if(ahTeam == 2){
					ht += "+";
				}
			} else if(state == 2){
				ht += guestTeamName;
				if(ahTeam == 1){
					ht += "+";
				} else if(ahTeam == 2){
					ht += "-";
				}
			}
			ht += formatOdds(orderData.ahDparam);
			ht += '  @<b>' + odds + '</b></span>';
		} else if(type == "ou"){
			if(state == 1){
				ht += '<span style="color: #CC0000;">大' + formatOdds(ouDparam) + '  @<b>' + odds + '</b></span>';
			} else if(state == 2){
				ht += '<span style="color: #CC0000;">小' + formatOdds(ouDparam) + '  @<b>' + odds + '</b></span>';
			}
		}
		$("#0RateNameDisplay").html(ht);
	} else if(scope == "ord"){
		var ht = "";
		if(type == "1x2"){
			ht += '<span style="color: #CC0000;">';
			if(state == 1){
				ht += hostTeamName ;
			} else if(state == 2){
				ht += guestTeamName;
			} else if(state == 3){
				ht += "和";
			}
			ht += '  @<b>' + odds + '</b></span>';
		} else if(type == "ah"){
			ht += '<span style="color: #CC0000;">';
			if(state == 1){
				ht += hostTeamName;
				if(ahTeam == 1){
					ht += "-";
				} else if(ahTeam == 2){
					ht += "+";
				}
			} else if(state == 2){
				ht += guestTeamName;
				if(ahTeam == 1){
					ht += "+";
				} else if(ahTeam == 2){
					ht += "-";
				}
			}
			ht += formatOdds(orderData.ahDparam);
			ht += '  @<b>' + odds + '</b></span>';
		} else if(type == "ou"){
			if(state == 1){
				ht += '<span style="color: #CC0000;">大' + formatOdds(ouDparam) + '  @<b>' + odds + '</b></span>';
			} else if(state == 2){
				ht += '<span style="color: #CC0000;">小' + formatOdds(ouDparam) + '  @<b>' + odds + '</b></span>';
			}
		}
		$("#0RateNameDisplay").html(ht);
	} else if(scope == "2h"){
		var ht = "";
		if(type == "1x2"){
			ht += '<span style="color: #CC0000;">';
			if(state == 1){
				ht += hostTeamName ;
			} else if(state == 2){
				ht += guestTeamName;
			} else if(state == 3){
				ht += "和";
			}
			ht += '  @<b>' + odds + '</b></span>';
		} else if(type == "ah"){
			ht += '<span style="color: #CC0000;">';
			if(state == 1){
				ht += hostTeamName;
				if(ahTeam == 1){
					ht += "-";
				} else if(ahTeam == 2){
					ht += "+";
				}
			} else if(state == 2){
				ht += guestTeamName;
				if(ahTeam == 1){
					ht += "+";
				} else if(ahTeam == 2){
					ht += "-";
				}
			}
			ht += formatOdds(orderData.ahDparam);
			ht += '  @<b>' + odds + '</b></span>';
		} else if(type == "ou"){
			if(state == 1){
				ht += '<span style="color: #CC0000;">大' + formatOdds(ouDparam) + '  @<b>' + odds + '</b></span>';
			} else if(state == 2){
				ht += '<span style="color: #CC0000;">小' + formatOdds(ouDparam) + '  @<b>' + odds + '</b></span>';
			}
		}
		$("#0RateNameDisplay").html(ht);
	}
	
	$("#sa").html(html)
	if(type == "ou" || type=="ah"){
		$("#winMoney").html(formatterDouble(($("#BetMoney").val() * (parseFloat(orderData.odds)+1))));
	} else {
		$("#winMoney").html(formatterDouble(($("#BetMoney").val() * parseFloat(orderData.odds))));
	}
}

/**
 * 确定下注
 */
function addOrder(reqData){
	$.ajax({
		type: "POST",
		url: BaseUrl + "order/addOrder",
		data: reqData,
		dataType: "json",
		cache:false,
		success: function(result){
			if (result.code == SUCCESS_CODE) {
				layer.alert("成功消息", {
					title : '下注成功'
				});
				$("#headBalance").html(formatterDouble(result.result.balance));
				$("#topBalance").html(formatterDouble(result.result.balance));
				
				$(".order_menu li").removeClass("on");
				$(".order_menu li").eq(2).addClass("on");
				$(".order_content").hide()
				$(".order_content").eq(2).show();

				$("#confirm_div").hide(); //交易遮罩
				
				$("#Ord_div").hide();
				$("#gold_show").hide();
				$("#Bet_nodata").show();
				
				$("#BetMoney").val("");
				$("#winMoney").html("0.00");
				
				getOrderList(0, 1, 10);
				getOrderList(1, 1, 10);
				
				getMyOrderCount();
			} else if(result.code == UNLOGIN){
				layer.alert(result.msg);
				unLogin();
			} else if(result.code == "11"){
				layer.alert(result.msg, {
					title : '错误信息'
				},function (index, layero) {
					cancelConfirmEvent();
					$("#freshTimeBtn").click();
					layer.close(index);
			    });
			} else {
				layer.alert(result.msg, {
					title : '错误信息'
				});
			}
		}
	});
}


//选择联赛
var select_ls={
	exit:function(){
		$("#select_ls_layer").hide();
	},
	pop_layer:function(){
		$("#select_ls_layer").show();
		if(TYPE == 0 || TYPE == 1){
			getAllTournamentTemplate();
		} else if(TYPE == 2){
			findCountGrounderLeague();
		}
	}
}

/**
 * 获取联赛
 * @returns
 */
function getAllTournamentTemplate(){
	var reqData = {
			type: TYPE,
			languageTypeFk: 58,
			object: 'tournament_template'
	};
	$.ajax({
		type: "GET",
		url: BaseUrl + "api/findAllTournamentTemplate",
		data: reqData,
		dataType: "json",
		cach: false,
		success: function(result){
			if(result.code == "00"){
				var data = result.result;
				if(data){
					var html = "";
					for(var i = 0; i < data.length; i++){
						var val = data[i];
						if(i%2 == 0 ){
							html += '<tr>';
						}
						html += '<td>';
						html += '<input type="checkbox" name="" id="' + val.leagueId + '" value="' + val.leagueId + '" lay-filter="" title="' + val.leagueCnName + '" lay-skin="primary"';
						if($.inArray(val.leagueId + "", tournamentTemplateIds) > -1){
							html += 'checked';
						}
						html += '>';
						html += '</td>';
						html += '<td>';
						html += '<span class="num">' + val.count + '</span>';
						html += '</td>';
						if((i+1)%2 == 0 ){
							html += '</tr>';
						}
					}
					
					$("#filter-tournamentTemplate-table").html(html);
					layui.form.render();
				}
			} else if(result.code == UNLOGIN){
				layer.alert(result.msg);
				unLogin();
			} else {
				alert(result.msg);
			}
		}
	});
}

/**
 * 获取滚球联赛
 */
function findCountGrounderLeague(){
	$.ajax({
		type: "POST",
		url: BaseUrl + "api/findCountGrounderLeague",
		dataType: "json",
		cach: false,
		success: function(result){
			var html = "";
			if(result.code == "00"){
				var data = result.result;
				if(data){
					for(var i = 0; i < data.length; i++){
						var val = data[i];
						if(i%2 == 0 ){
							html += '<tr>';
						}
						html += '<td>';
						html += '<input type="checkbox" name="" id="' + val.leagueId + '" value="' + val.leagueId + '" lay-filter="" title="' + val.leagueCnName + '" lay-skin="primary"';
						if($.inArray(val.leagueId + "", tournamentTemplateIds) > -1){
							html += 'checked';
						}
						html += '>';
						html += '</td>';
						html += '<td>';
						html += '<span class="num">' + val.count + '</span>';
						html += '</td>';
						if((i+1)%2 == 0 ){
							html += '</tr>';
						}
					}
				}
			} else if(result.code == UNLOGIN){
				layer.alert(result.msg);
				unLogin();
			}
			$("#filter-tournamentTemplate-table").html(html);
			layui.form.render();
		}
	});
}


/**
 * 确定搜索
 */
function confirmSearch(){
	tournamentTemplateIds = [];
	$.each($("#filter-tournamentTemplate-table").find("input[type='checkbox']:checked"), function(){
		tournamentTemplateIds.push($(this).val());
	});
	if(TYPE == 2){
		findGrounderLeagueList(1);
	} else {
		getTournamentTemplateList(TYPE, 1);
	}
	select_ls.exit();
}

/**
 * 获取滚球数据
 */
var listMapOld = {};
function findGrounderLeagueList(page){
	$("#totalPage").html("1");
	$("#currentPage").html(page);
	$("#selPage").html('<option value="1">1</option>');
	var ids = "";
	if(tournamentTemplateIds && tournamentTemplateIds.length > 0){
		for(var i=0; i<tournamentTemplateIds.length; i++){
			if(i>0){
				ids += ",";
			}
			ids += tournamentTemplateIds[i];
		}
	}
	
	var reqData = {
			tournamentTemplateFk: ids,
			page: page,
			rows: 20
	};
	$("#currentData .mCSB_container").html('<img src="images/loading.gif" style="margin-left: 30%; margin-top: 5%;">');
	
	$.ajax({
		type: "POST",
		url: BaseUrl + "api/findGrounderLeagueList",
		data: reqData,
		dataType: "json",
		cach: false,
		success: function(result){
			var code = result.code;
			if(code==SUCCESS_CODE){
				var data = result.result;
				if(data && data.count > 0){
					var count = data.count;
					if(count > 0){
						var totalPage = parseInt((count + (20 -1))/20);
						$("#totalPage").html(totalPage);
						if(totalPage > 1){
							var option = "";
							for(var i=0; i<totalPage; i++){
								option += '<option value="' + (i+1) + '"';
								if(page == (i+1))
									option += 'selected="selected"';
								option += '>' + (i+1) + '</option>';
							}
							$("#selPage").html(option);
						}
					}
					
					var listMap = data.listMap;
					if(listMap){
						var html = "";
						$.each(listMap, function(i, val){
							var liansaiName = val.name;
							var liansaiId = val.id;
							html += '<div class="game_country">';
							html += '<h1><span class="arrow"></span>' + val.name +'</h1>';
							html += '<table width="100%"><tbody>';
							
							var eventList = val.event;
							if(eventList){
								$.each(eventList, function(n, event){
									var hostTeamName = event.homeTeamCnName;
									var hostTeamId = event.homeAgoTeam;
									var homeScore = event.wholeHomeScore;
									var guestTeamName = event.awayTeamCnName;
									var guestTeamId = event.awayAgoTeam;
									var awayScore = event.wholeAwayScore;
									var startdate = event.startDate;
									var eventId = event.eventId;
									var eventAgoId = event.eventAgoId;
									
									var time = event.time;
									
									var bettingOffer = event.odds;
									if(bettingOffer){
										$.each(bettingOffer, function(m, betting){
											html += '<tr>';
											html += '<td width="80">';
											if(m == 0){
												
												html += '<p>' + homeScore + '-' + awayScore + '</p>';
												html += '<p class="red">' + time + ' <img src="images/in.gif" style="margin-bottom:6px;"></img></p>';
												html += '<p><a href="javascript:;" class="play_btn"><i title="" class="iconfont icon-bofang"></i>直播</a></p>';
											}
											html += '</td>';
											
											html += '<td width="125" class="team_vs" valign="top">';
											html += '<p>' + hostTeamName + '</p>';
											html += '<p>' + guestTeamName + '</p>';
											html += '<p>和局</p>';
											html += '</td>';
											
											
											//全场独赢
											var oid1x2 = betting["1x2Oid"] != undefined ? betting["1x2Oid"] : ""; 
											var hostOdds1x2 = betting["1x2hostOdds"] != undefined ? betting["1x2hostOdds"] : ""; // 主队独赢赔率
											var hostId1x2 = betting["1x2hostId"] != undefined ? betting["1x2hostId"] : "";     //主队独赢赔率对应id
											var guestOdds1x2 = betting["1x2guestOdds"] != undefined ? betting["1x2guestOdds"] : ""; //客队独赢赔率
											var drawOdds1x2 = betting["1x2drawOdds"] != undefined ? betting["1x2drawOdds"] : ""; //  独赢和对应赔率
											
											//全场大小
											var ouOid = betting["ouOid"] != undefined ? betting["ouOid"] : ""; 
											var ouId = betting.ouId != undefined ? betting.ouId : ""; //    大对应赔率id
											var ouOverOdds = betting.ouOverOdds != undefined ? betting.ouOverOdds : ""; //  大对应现有赔率
											var ouUnderOdds = betting.ouUnderOdds != undefined ? betting.ouUnderOdds : ""; //  小对应现有赔率
											var ouDParam = betting.ouDParam != undefined ? betting.ouDParam : ""; //  大对应最大赔率
											
											//全场让球
											var ahOid = betting["ahOid"] != undefined ? betting["ahOid"] : ""; 
											var ahId = betting.ahId != undefined ? betting.ahId : ""; //    主队让分赔率id
											var ahDParam = betting.ahDParam != undefined ? betting.ahDParam : ""; // 基率 +主队让 –客队让
											var ahHostOdds = betting.ahHostOdds != undefined ? betting.ahHostOdds : ""; //  主队让分赔率
											var ahGuestOdds = betting.ahGuestOdds != undefined ? betting.ahGuestOdds : ""; //  客队让分赔率
											
											
											//半场大小
											var ou1sOid = betting["ou1sOid"] != undefined ? betting["ou1sOid"] : ""; 
											var ou1sId = betting.ou1sId != undefined ? betting.ou1sId : ""; //    大对应赔率id
											var ou1sOverOdds = betting.ou1sOverOdds != undefined ? betting.ou1sOverOdds : ""; //  大对应现有赔率
											var ou1sUnderOdds = betting.ou1sUnderOdds != undefined ? betting.ou1sUnderOdds : ""; //  小对应现有赔率
											var ou1sDParam = betting.ou1sDParam != undefined ? betting.ou1sDParam : ""; //  大对应最大赔率
											
											//半场让球
											var ah1sOid = betting["ah1sOid"] != undefined ? betting["ah1sOid"] : ""; 
											var ah1sId = betting.ah1sId != undefined ? betting.ah1sId : ""; //    主队让分赔率id
											var ah1sDParam = betting.ah1sDParam != undefined ? betting.ah1sDParam : ""; // 基率 +主队让 –客队让
											var ah1sHostOdds = betting.ah1sHostOdds != undefined ? betting.ah1sHostOdds : ""; //  主队让分赔率
											var ah1sGuestOdds = betting.ah1sGuestOdds != undefined ? betting.ah1sGuestOdds : ""; //  客队让分赔率
											
											
											//全场独赢
											html += '<td width="90" class="all_duyin" valign="top">';
											if(hostOdds1x2){
												html += '<p><a class="the_odds" liansaiName="' + liansaiName + '" liansaiId="' + liansaiId + '" eventId="' + eventId + '" startTime="' + startdate + '" hostTeamName="' + hostTeamName + '" hostTeamId="' + hostTeamId + '" guestTeamName="' + guestTeamName + '" guestTeamId="' + guestTeamId + '" time="' + time + '" score="' + homeScore + '-' + awayScore + '" oid="' + oid1x2 + '" type="1x2" state="1" scope="ord" dataId="' + hostId1x2 + '">' + hostOdds1x2 + '</a></p>';
											} else {
												html += '<p style="padding: 4px 6px; margin: 4px 0;"></p>';
											}
											if(guestOdds1x2){
												html += '<p><a class="the_odds" liansaiName="' + liansaiName + '" liansaiId="' + liansaiId + '" eventId="' + eventId + '" startTime="' + startdate + '" hostTeamName="' + hostTeamName + '" hostTeamId="' + hostTeamId + '" guestTeamName="' + guestTeamName + '" guestTeamId="' + guestTeamId + '" time="' + time + '" score="' + homeScore + '-' + awayScore + '" oid="' + oid1x2 + '" type="1x2" state="2" scope="ord" dataId="' + hostId1x2 + '">' + guestOdds1x2 + '</a></p>';
											} else {
												html += '<p style="padding: 4px 6px; margin: 4px 0;"></p>';
											}
											if(drawOdds1x2){
												html += '<p><a class="the_odds" liansaiName="' + liansaiName + '" liansaiId="' + liansaiId + '" eventId="' + eventId + '" startTime="' + startdate + '" hostTeamName="' + hostTeamName + '" hostTeamId="' + hostTeamId + '" guestTeamName="' + guestTeamName + '" guestTeamId="' + guestTeamId + '" time="' + time + '" score="' + homeScore + '-' + awayScore + '" oid="' + oid1x2 + '" type="1x2" state="3" scope="ord" dataId="' + hostId1x2 + '">' + drawOdds1x2 + '</a></p>';
											} else {
												html += '<p style="padding: 4px 6px; margin: 4px 0;"></p>';
											}
											html += '</td>';
											
											//全场让球
											html += '<td class="all_rangqiu" width="100" valign="top">';
											if(ahHostOdds){
												html += '<p>';
												if(parseFloat(ahDParam) > 0){
													//html += ahDParam
													html += formatOdds(ahDParam)
												}
												html += '<a class="the_odds" liansaiName="' + liansaiName + '" liansaiId="' + liansaiId + '" eventId="' + eventId + '" startTime="' + startdate + '" hostTeamName="' + hostTeamName + '" hostTeamId="' + hostTeamId + '" guestTeamName="' + guestTeamName + '" guestTeamId="' + guestTeamId + '" time="' + time + '" score="' + homeScore + '-' + awayScore + '" oid="' + ahOid + '" type="ah" state="1" scope="ord" dataId="' + ahId + '" ahDparam="' + ahDParam + '" ahTeam="' + (parseFloat(ahDParam) <= 0 ? 2:1 ) + '">' + ahHostOdds + '</a></p>';
											} else {
												html += '<p style="padding: 4px 6px; margin: 4px 0;"></p>';
											}
											if(ahGuestOdds){
												html += '<p>' ;
												if(parseFloat(ahDParam) <= 0){
													//html += (-ahDParam)
													html += formatOdds(-ahDParam)
												}
												html += '<a class="the_odds" liansaiName="' + liansaiName + '" liansaiId="' + liansaiId + '" eventId="' + eventId + '" startTime="' + startdate + '" hostTeamName="' + hostTeamName + '" hostTeamId="' + hostTeamId + '" guestTeamName="' + guestTeamName + '" guestTeamId="' + guestTeamId + '" time="' + time + '" score="' + homeScore + '-' + awayScore + '" oid="' + ahOid + '" type="ah" state="2" scope="ord" dataId="' + ahId + '" ahDparam="' + ahDParam + '" ahTeam="' + (parseFloat(ahDParam) <= 0 ? 2:1 ) + '">' + ahGuestOdds + '</a></p>';
											} else {
												html += '<p style="padding: 4px 6px; margin: 4px 0;"></p>';
											}
											html += '</td>';
											
											//全场大小
											html += ' <td class="all_daxiao" width="100" valign="top">';
											if(ouOverOdds){
												html += '<p>大' + formatOdds(ouDParam) + '<a class="the_odds" liansaiName="' + liansaiName + '" liansaiId="' + liansaiId + '" eventId="' + eventId + '" startTime="' + startdate + '" hostTeamName="' + hostTeamName + '" hostTeamId="' + hostTeamId + '" guestTeamName="' + guestTeamName + '" guestTeamId="' + guestTeamId + '" time="' + time + '" score="' + homeScore + '-' + awayScore + '" oid="' + ouOid + '" type="ou" state="1" scope="ord" dataId="' + ouId + '" ouDparam="' + ouDParam + '">' + ouOverOdds + '</a></p>';
											} else {
												html += '<p style="padding: 4px 6px; margin: 4px 0;"></p>';
											}
											if(ouUnderOdds){
												html += '<p>小' + formatOdds(ouDParam) + '<a class="the_odds" liansaiName="' + liansaiName + '" liansaiId="' + liansaiId + '" eventId="' + eventId + '" startTime="' + startdate + '" hostTeamName="' + hostTeamName + '" hostTeamId="' + hostTeamId + '" guestTeamName="' + guestTeamName + '" guestTeamId="' + guestTeamId + '" time="' + time + '" score="' + homeScore + '-' + awayScore + '" oid="' + ouOid + '" type="ou" state="2" scope="ord" dataId="' + ouId + '" ouDparam="' + ouDParam + '">' + ouUnderOdds + '</a></p>';
											} else {
												html += '<p style="padding: 4px 6px; margin: 4px 0;"></p>';
											}
											html += '</td>';
											
											//半场让球
											html += '<td class="all_rangqiu" width="100" valign="top">';
											if(ah1sHostOdds){
												html += '<p>';
												if(parseFloat(ah1sDParam) > 0){
													//html += ah1sDParam
													html += formatOdds(ah1sDParam)
												}
												html += '<a class="the_odds" liansaiName="' + liansaiName + '" liansaiId="' + liansaiId + '" eventId="' + eventId + '" startTime="' + startdate + '" hostTeamName="' + hostTeamName + '" hostTeamId="' + hostTeamId + '" guestTeamName="' + guestTeamName + '" guestTeamId="' + guestTeamId + '" time="' + time + '" score="' + homeScore + '-' + awayScore + '" oid="' + ah1sOid + '"  type="ah" state="1" scope="1h" dataId="' + ah1sId + '" ahDparam="' + ah1sDParam + '" ahTeam="' + (parseFloat(ah1sDParam) <= 0 ? 2:1 ) + '">' + ah1sHostOdds + '</a></p>';
											} else {
												html += '<p style="padding: 4px 6px; margin: 4px 0;"></p>';
											}
											if(ah1sGuestOdds){
												html += '<p>' ;
												if(parseFloat(ah1sDParam) <= 0){
													//html += (-ah1sDParam)
													html += formatOdds(-ah1sDParam)
												}
												html += '<a class="the_odds" liansaiName="' + liansaiName + '" liansaiId="' + liansaiId + '" eventId="' + eventId + '" startTime="' + startdate + '" hostTeamName="' + hostTeamName + '" hostTeamId="' + hostTeamId + '" guestTeamName="' + guestTeamName + '" guestTeamId="' + guestTeamId + '" time="' + time + '" score="' + homeScore + '-' + awayScore + '" oid="' + ah1sOid + '" type="ah" state="2" scope="1h" dataId="' + ah1sId + '" ahDparam="' + ah1sDParam + '" ahTeam="' + (parseFloat(ah1sDParam) <= 0 ? 2:1 ) + '">' + ah1sGuestOdds + '</a></p>';
											} else {
												html += '<p style="padding: 4px 6px; margin: 4px 0;"></p>';
											}
											html += '</td>';
											
											//半场大小
											html += ' <td class="all_daxiao" width="100" valign="top">';
											if(ou1sOverOdds){
												html += '<p>大' + formatOdds(ou1sDParam) + '<a class="the_odds" liansaiName="' + liansaiName + '" liansaiId="' + liansaiId + '" eventId="' + eventId + '" startTime="' + startdate + '" hostTeamName="' + hostTeamName + '" hostTeamId="' + hostTeamId + '" guestTeamName="' + guestTeamName + '" guestTeamId="' + guestTeamId + '" time="' + time + '" score="' + homeScore + '-' + awayScore + '" oid="' + ou1sOid + '" type="ou" state="1" scope="1h" dataId="' + ou1sId + '" ouDparam="' + ou1sDParam + '">' + ou1sOverOdds + '</a></p>';
											} else {
												html += '<p style="padding: 4px 6px; margin: 4px 0;"></p>';
											}
											if(ou1sUnderOdds){
												html += '<p>小' + formatOdds(ou1sDParam) + '<a class="the_odds" liansaiName="' + liansaiName + '" liansaiId="' + liansaiId + '" eventId="' + eventId + '" startTime="' + startdate + '" hostTeamName="' + hostTeamName + '" hostTeamId="' + hostTeamId + '" guestTeamName="' + guestTeamName + '" guestTeamId="' + guestTeamId + '" time="' + time + '" score="' + homeScore + '-' + awayScore + '" oid="' + ou1sOid + '" type="ou" state="2" scope="1h" dataId="' + ou1sId + '" ouDparam="' + ou1sDParam + '">' + ou1sUnderOdds + '</a></p>';
											} else {
												html += '<p style="padding: 4px 6px; margin: 4px 0;"></p>';
											}
											html += '</td>';
											
											html += '</tr>';
										})
									} else {
										html += '<tr>';
										html += '<td width="80">';
										html += '<p>' + homeScore + '-' + awayScore + '</p>';
										html += '<p class="red">' + time + '</p>';
										html += '<p><a href="javascript:;" class="play_btn"><i title="" class="iconfont icon-bofang"></i>直播</a></p>';
										html += '</td>';
										
										html += '<td width="125" class="team_vs" valign="top">';
										html += '<p>' + hostTeamName + '</p>';
										html += '<p>' + guestTeamName + '</p>';
										html += '<p>和局</p>';
										html += '</td>';
										
										//全场独赢
										html += '<td class="half_dayin" width="100">';
										html += '<p><a class="the_odds"></a></p>';
										html += '<p><a class="the_odds"></a></p>';
										html += '<p><a class="the_odds"></a></p>';
										html += '</td>';
										
										//全场让球
										html += '<td class="all_rangqiu" width="100" valign="top">';
										html += ' <p></p>';
										html += '<p></p>';
										html += '</td>';
										
										//全场大小
										html += ' <td class="all_daxiao" width="100" valign="top">';
										html += ' <p></p>';
										html += '<p></p>';
										html += '</td>';
										
										//半场让球
										html += '<td class="half_rangqiu" width="100" valign="top">';
										html += ' <p></p>';
										html += '<p></p>';
										html += '</td>';
										
										//半场大小
										html += '<td class="half_daxiao" valign="top">';
										html += '<p></p>';
										html += '<p></p>';
										html += '</td>';
										
										html += '</tr>';
									}
									
									
								})
							}
							html += '</tbody></table>';
							html += '</div>';
						})
						$("#currentData").mCustomScrollbar("destroy");
						$("#currentData").html(html);
						$("#currentData").mCustomScrollbar();
						
						$(".game_country h1").toggle(function () {
							$(this).next().hide();
							$(this).find('span').addClass("arrow_on");
						}, function () {
							$(this).next().show();
							$(this).find('span').removeClass("arrow_on");
						})
						
						$(".the_odds").on("click", function(){
							bindOdds(this);
						})
					}
					
					listMapOld = listMap;
				} else {
					$("#currentData").html('<div style="padding: 20px; text-align: center;">暂无滚球数据</div>');
				}
				clearTimeout(timer);
				clearTimeout(timer2);
				clearTimeout(timer3);
				countdown=30;
				settime();
			} else if(result.code == UNLOGIN){
				layer.alert(result.msg);
				unLogin();
			}
		}
	});
}


/**
 * 获取联赛及比赛数据
 * @param id
 * @param type
 */
function getTournamentTemplateList(type, page){
	var templateFk = "";
	$("#totalPage").html("1");
	$("#currentPage").html(page);
	$("#selPage").html('<option value="1">1</option>');
	if(tournamentTemplateIds){
		for(var i=0; i<tournamentTemplateIds.length; i++){
			if(i > 0)
				templateFk += ',';
			templateFk += tournamentTemplateIds[i];
		}
	}
	var reqData = {
			type: type,
			languageTypeFk: 57,
			object: 'tournament_template',
			tournamentTemplateFk: templateFk,
			page: page,
			rows: 20
	};
	
	if(TYPE == 0){
		clearTimeout(timer);
		clearTimeout(timer2);
		clearTimeout(timer3);
		countdown2 = 150;
		settime2();
	} else if(TYPE == 1){
		countdown3 = 150;
		clearTimeout(timer);
		clearTimeout(timer2);
		clearTimeout(timer3);
		settime3();
	}
	
	
	if(type == 0){
		$("#todayData .mCSB_container").html('<img src="images/loading.gif" style="margin-left: 30%; margin-top: 5%;">');
	} else if(type == 1){
		$("#morningData .mCSB_container").html('<img src="images/loading.gif" style="margin-left: 30%; margin-top: 5%;">');
	}
	
	$.ajax({
		type: "POST",
		url: BaseUrl + "api/findTournamentTemplate",
		data: reqData,
		dataType: "json",
		cach: false,
		success: function(result){
			var code = result.code;
			if(code==SUCCESS_CODE){
				var data = result.result;
				if(data){
					var count = data.count;
					if(count > 0){
						var totalPage = parseInt((count + (20 -1))/20);
						$("#totalPage").html(totalPage);
						if(totalPage > 1){
							var option = "";
							for(var i=0; i<totalPage; i++){
								option += '<option value="' + (i+1) + '"';
								if(page == (i+1))
									option += 'selected="selected"';
								option += '>' + (i+1) + '</option>';
							}
							$("#selPage").html(option);
							
						}
					}
					
					var listMap = data.listMap;
					if(listMap){
						var html = "";
						$.each(listMap, function(i, val){
							var liansaiName = val.name;
							var liansaiId = val.id;
							html += '<div class="game_country">';
							html += '<h1><span class="arrow"></span>' + val.name +'</h1>';
							html += '<table width="100%"><tbody>';
							
							var eventList = val.event;
							if(eventList){
								$.each(eventList, function(n, event){
									var hostTeamName = event.homeTeamCnName;
									var hostTeamId = event.homeAgoTeam;
									var guestTeamName = event.awayTeamCnName;
									var guestTeamId = event.awayAgoTeam;
									var startdate = event.startDate;
									var eventId = event.eventId;
									
									
									var bettingOffer = event.odds;
									if(bettingOffer){
										$.each(bettingOffer, function(m, betting){
											html += '<tr>';
											html += '<td width="80">';
											if(m == 0){
												if(type == 0){
													html += '<p>' + startdate.substring(11, 16) + '</p>';
												} else if(type == 1){
													html += '<p>' + startdate.substring(0,11) + '</p>';
													html += '<p>' + startdate.substring(11, 16) + '</p>';
												}
											}
											html += '<p class="red"></p>';
											html += '</td>';
											
											html += '<td width="125" class="team_vs" valign="top">';
											html += '<p>' + hostTeamName + '</p>';
											html += '<p>' + guestTeamName + '</p>';
											html += '<p>和局</p>';
											html += '</td>';
											
											//全场独赢
											var hostOdds1x2 = betting["1x2hostOdds"] != undefined ? betting["1x2hostOdds"] : ""; // 主队独赢赔率
											var hostId1x2 = betting["1x2hostId"] != undefined ? betting["1x2hostId"] : "";     //主队独赢赔率对应id
											var guestOdds1x2 = betting["1x2guestOdds"] != undefined ? betting["1x2guestOdds"] : ""; //客队独赢赔率
											var drawOdds1x2 = betting["1x2drawOdds"] != undefined ? betting["1x2drawOdds"] : ""; //  独赢和对应赔率
											
											//全场大小
											var ouId = betting.ouId != undefined ? betting.ouId : ""; //    大对应赔率id
											var ouOverOdds = betting.ouOverOdds != undefined ? betting.ouOverOdds : ""; //  大对应现有赔率
											var ouUnderOdds = betting.ouUnderOdds != undefined ? betting.ouUnderOdds : ""; //  小对应现有赔率
											var ouDParam = betting.ouDParam != undefined ? betting.ouDParam : ""; //  大对应最大赔率
											
											//全场让球
											var ahId = betting.ahId != undefined ? betting.ahId : ""; //    主队让分赔率id
											var ahDParam = betting.ahDParam != undefined ? betting.ahDParam : ""; // 基率 +主队让 –客队让
											var ahHostOdds = betting.ahHostOdds != undefined ? betting.ahHostOdds : ""; //  主队让分赔率
											var ahGuestOdds = betting.ahGuestOdds != undefined ? betting.ahGuestOdds : ""; //  客队让分赔率
											
											
											//半场大小
											var ou1sId = betting.ou1sId != undefined ? betting.ou1sId : ""; //    大对应赔率id
											var ou1sOverOdds = betting.ou1sOverOdds != undefined ? betting.ou1sOverOdds : ""; //  大对应现有赔率
											var ou1sUnderOdds = betting.ou1sUnderOdds != undefined ? betting.ou1sUnderOdds : ""; //  小对应现有赔率
											var ou1sDParam = betting.ou1sDParam != undefined ? betting.ou1sDParam : ""; //  大对应最大赔率
											
											//半场让球
											var ah1sId = betting.ah1sId != undefined ? betting.ah1sId : ""; //    主队让分赔率id
											var ah1sDParam = betting.ah1sDParam != undefined ? betting.ah1sDParam : ""; // 基率 +主队让 –客队让
											var ah1sHostOdds = betting.ah1sHostOdds != undefined ? betting.ah1sHostOdds : ""; //  主队让分赔率
											var ah1sGuestOdds = betting.ah1sGuestOdds != undefined ? betting.ah1sGuestOdds : ""; //  客队让分赔率
											
											
											//全场独赢
											html += '<td width="90" class="all_duyin" valign="top">';
											if(hostOdds1x2){
												html += '<p><a class="the_odds" liansaiName="' + liansaiName + '" liansaiId="' + liansaiId + '" eventId="' + eventId + '" startTime="' + startdate + '" hostTeamName="' + hostTeamName + '" hostTeamId="' + hostTeamId + '" guestTeamName="' + guestTeamName + '" guestTeamId="' + guestTeamId + '" type="1x2" state="1" scope="ord" dataId="' + hostId1x2 + '">' + hostOdds1x2 + '</a></p>';
											} else {
												html += '<p style="padding: 4px 6px; margin: 4px 0;"></p>';
											}
											if(guestOdds1x2){
												html += '<p><a class="the_odds" liansaiName="' + liansaiName + '" liansaiId="' + liansaiId + '" eventId="' + eventId + '" startTime="' + startdate + '" hostTeamName="' + hostTeamName + '" hostTeamId="' + hostTeamId + '" guestTeamName="' + guestTeamName + '" guestTeamId="' + guestTeamId + '" type="1x2" state="2" scope="ord" dataId="' + hostId1x2 + '">' + guestOdds1x2 + '</a></p>';
											} else {
												html += '<p style="padding: 4px 6px; margin: 4px 0;"></p>';
											}
											if(drawOdds1x2){
												html += '<p><a class="the_odds" liansaiName="' + liansaiName + '" liansaiId="' + liansaiId + '" eventId="' + eventId + '" startTime="' + startdate + '" hostTeamName="' + hostTeamName + '" hostTeamId="' + hostTeamId + '" guestTeamName="' + guestTeamName + '" guestTeamId="' + guestTeamId + '" type="1x2" state="3" scope="ord" dataId="' + hostId1x2 + '">' + drawOdds1x2 + '</a></p>';
											} else {
												html += '<p style="padding: 4px 6px; margin: 4px 0;"></p>';
											}
											html += '</td>';
											
											//全场让球
											html += '<td class="all_rangqiu" width="100" valign="top">';
											if(ahHostOdds){
												html += '<p>';
												if(parseFloat(ahDParam) > 0){
													//html += ahDParam
													html += formatOdds(ahDParam);
												}
												html += '<a class="the_odds" liansaiName="' + liansaiName + '" liansaiId="' + liansaiId + '" eventId="' + eventId + '" startTime="' + startdate + '" hostTeamName="' + hostTeamName + '" hostTeamId="' + hostTeamId + '" guestTeamName="' + guestTeamName + '" guestTeamId="' + guestTeamId + '" type="ah" state="1" scope="ord" dataId="' + ahId + '" ahDparam="' + ahDParam + '" ahTeam="' + (parseFloat(ahDParam) <= 0 ? 2:1 ) + '">' + ahHostOdds + '</a></p>';
											} else {
												html += '<p style="padding: 4px 6px; margin: 4px 0;"></p>';
											}
											if(ahGuestOdds){
												html += '<p>' ;
												if(parseFloat(ahDParam) <= 0){
													//html += (-ahDParam)
													html += formatOdds(-ahDParam);
												}
												html += '<a class="the_odds" liansaiName="' + liansaiName + '" liansaiId="' + liansaiId + '" eventId="' + eventId + '" startTime="' + startdate + '" hostTeamName="' + hostTeamName + '" hostTeamId="' + hostTeamId + '" guestTeamName="' + guestTeamName + '" guestTeamId="' + guestTeamId + '" type="ah" state="2" scope="ord" dataId="' + ahId + '" ahDparam="' + ahDParam + '" ahTeam="' + (parseFloat(ahDParam) <= 0 ? 2:1 ) + '">' + ahGuestOdds + '</a></p>';
											} else {
												html += '<p style="padding: 4px 6px; margin: 4px 0;"></p>';
											}
											html += '</td>';
											
											//全场大小
											html += ' <td class="all_daxiao" width="100" valign="top">';
											if(ouOverOdds){
												html += '<p>大' + formatOdds(ouDParam)+ '<a class="the_odds" liansaiName="' + liansaiName + '" liansaiId="' + liansaiId + '" eventId="' + eventId + '" startTime="' + startdate + '" hostTeamName="' + hostTeamName + '" hostTeamId="' + hostTeamId + '" guestTeamName="' + guestTeamName + '" guestTeamId="' + guestTeamId + '" type="ou" state="1" scope="ord" dataId="' + ouId + '" ouDparam="' + ouDParam + '">' + ouOverOdds + '</a></p>';
											} else {
												html += '<p style="padding: 4px 6px; margin: 4px 0;"></p>';
											}
											if(ouUnderOdds){
												html += '<p>小' +formatOdds(ouDParam)+ '<a class="the_odds" liansaiName="' + liansaiName + '" liansaiId="' + liansaiId + '" eventId="' + eventId + '" startTime="' + startdate + '" hostTeamName="' + hostTeamName + '" hostTeamId="' + hostTeamId + '" guestTeamName="' + guestTeamName + '" guestTeamId="' + guestTeamId + '" type="ou" state="2" scope="ord" dataId="' + ouId + '" ouDparam="' + ouDParam + '">' + ouUnderOdds + '</a></p>';
											} else {
												html += '<p style="padding: 4px 6px; margin: 4px 0;"></p>';
											}
											html += '</td>';
											
											//半场让球
											html += '<td class="all_rangqiu" width="100" valign="top">';
											if(ah1sHostOdds){
												html += '<p>';
												if(parseFloat(ah1sDParam) > 0){
													//html += ah1sDParam
													html += formatOdds(ah1sDParam);
												}
												html += '<a class="the_odds" liansaiName="' + liansaiName + '" liansaiId="' + liansaiId + '" eventId="' + eventId + '" startTime="' + startdate + '" hostTeamName="' + hostTeamName + '" hostTeamId="' + hostTeamId + '" guestTeamName="' + guestTeamName + '" guestTeamId="' + guestTeamId + '" type="ah" state="1" scope="1h" dataId="' + ah1sId + '" ahDparam="' + ah1sDParam + '" ahTeam="' + (parseFloat(ah1sDParam) <= 0 ? 2:1 ) + '">' + ah1sHostOdds + '</a></p>';
											} else {
												html += '<p style="padding: 4px 6px; margin: 4px 0;"></p>';
											}
											if(ah1sGuestOdds){
												html += '<p>' ;
												if(parseFloat(ah1sDParam) <= 0){
													//html += (-ah1sDParam)
													html += formatOdds(-ah1sDParam);
												}
												html += '<a class="the_odds" liansaiName="' + liansaiName + '" liansaiId="' + liansaiId + '" eventId="' + eventId + '" startTime="' + startdate + '" hostTeamName="' + hostTeamName + '" hostTeamId="' + hostTeamId + '" guestTeamName="' + guestTeamName + '" guestTeamId="' + guestTeamId + '" type="ah" state="2" scope="1h" dataId="' + ah1sId + '" ahDparam="' + ah1sDParam + '" ahTeam="' + (parseFloat(ah1sDParam) <= 0 ? 2:1 ) + '">' + ah1sGuestOdds + '</a></p>';
											} else {
												html += '<p style="padding: 4px 6px; margin: 4px 0;"></p>';
											}
											html += '</td>';
											
											//半场大小
											html += ' <td class="all_daxiao" width="100" valign="top">';
											if(ou1sOverOdds){
												html += '<p>大' +formatOdds(ou1sDParam)+ '<a class="the_odds" liansaiName="' + liansaiName + '" liansaiId="' + liansaiId + '" eventId="' + eventId + '" startTime="' + startdate + '" hostTeamName="' + hostTeamName + '" hostTeamId="' + hostTeamId + '" guestTeamName="' + guestTeamName + '" guestTeamId="' + guestTeamId + '" type="ou" state="1" scope="1h" dataId="' + ou1sId + '" ouDparam="' + ou1sDParam + '">' + ou1sOverOdds + '</a></p>';
											} else {
												html += '<p style="padding: 4px 6px; margin: 4px 0;"></p>';
											}
											if(ou1sUnderOdds){
												html += '<p>小' +formatOdds(ou1sDParam)+ '<a class="the_odds" liansaiName="' + liansaiName + '" liansaiId="' + liansaiId + '" eventId="' + eventId + '" startTime="' + startdate + '" hostTeamName="' + hostTeamName + '" hostTeamId="' + hostTeamId + '" guestTeamName="' + guestTeamName + '" guestTeamId="' + guestTeamId + '" type="ou" state="2" scope="1h" dataId="' + ou1sId + '" ouDparam="' + ou1sDParam + '">' + ou1sUnderOdds + '</a></p>';
											} else {
												html += '<p style="padding: 4px 6px; margin: 4px 0;"></p>';
											}
											html += '</td>';
											
											html += '</tr>';
										})
									} else {
										html += '<tr>';
										html += '<td width="80">';
										html += '<p>' + startdate.substring(11, 16) + '</p>';
										html += '<p class="red"></p>';
										html += '</td>';
										
										html += '<td width="125" class="team_vs" valign="top">';
										html += '<p>' + hostTeamName + '</p>';
										html += '<p>' + guestTeamName + '</p>';
										html += '<p>和局</p>';
										html += '</td>';
										
										//全场独赢
										html += '<td class="half_dayin" width="100">';
										html += '<p><a class="the_odds"></a></p>';
										html += '<p><a class="the_odds"></a></p>';
										html += '<p><a class="the_odds"></a></p>';
										html += '</td>';
										
										//全场让球
										html += '<td class="all_rangqiu" width="100" valign="top">';
										html += ' <p></p>';
										html += '<p></p>';
										html += '</td>';
										
										//全场大小
										html += ' <td class="all_daxiao" width="100" valign="top">';
										html += ' <p></p>';
										html += '<p></p>';
										html += '</td>';
										
										//半场让球
										html += '<td class="half_rangqiu" width="100" valign="top">';
										html += ' <p></p>';
										html += '<p></p>';
										html += '</td>';
										
										//半场大小
										html += '<td class="half_daxiao" valign="top">';
										html += '<p></p>';
										html += '<p></p>';
										html += '</td>';
										
										html += '</tr>';
									}
									
									
								})
							}
							html += '</tbody></table>';
							html += '</div>';
						})
						if(type == 0){
							$("#todayData").mCustomScrollbar("destroy");
							$("#todayData").html(html);
							$("#todayData").mCustomScrollbar();
						} else if(type == 1){
							$("#morningData").mCustomScrollbar("destroy");
							$("#morningData").html(html);
							$("#morningData").mCustomScrollbar();
						}
						
						$(".game_country h1").toggle(function () {
							$(this).next().hide();
							$(this).find('span').addClass("arrow_on");
						}, function () {
							$(this).next().show();
							$(this).find('span').removeClass("arrow_on");
						})
						
						$(".the_odds").on("click", function(){
							bindOdds(this);
						})
					}
				}
			} else if(result.code == UNLOGIN){
				layer.alert(result.msg);
				unLogin();
			}
		}
	});
}


//目录
//滚球 今日 早盘 赛果
var game_type={
	switch_type:function(Text,num){
		var _text="("+Text+")";
		var _num=num;
		
		$(".game_type_text").html(_text);

		if(_num=="3"||_num=="4"){
			$(".filter_box").hide();
			if(_num=="4"){
				getOrderList(2, 1, 10)
			} else {
				findLeagues();
				getGameResult(1, ROWS);
			}
		}else{
			tournamentTemplateIds = [];
			if(_num == "0"){
				TYPE = 2;
				findGrounderLeagueList(1);
			} else if(_num == "1"){
				TYPE = 0;
				getTournamentTemplateList(0, 1);
			} else if(_num == "2"){
				TYPE = 1;
				getTournamentTemplateList(1, 1)
			}
			$(".filter_box").show();
		}

		$(".mulu_type").hide();
		$(".mulu_type").eq(_num).show();
	}
}


//选择联赛
var trade={
	touzhu:function(){
		$(".order_menu li").removeClass("on");
		$(".order_menu li").eq(1).addClass("on");
		$(".order_content").hide()
		$(".order_content").eq(1).show();

		//显示球队信息，注单功能区功能区
		$("#Bet_nodata").hide();
		$("#Ord_div").show();
		$("#gold_show").show();
	},
	cancelTouzhu:function(){
		$(".order_menu li").removeClass("on");
		$(".order_menu li").eq(0).addClass("on");
		$(".order_content").hide()
		$(".order_content").eq(0).show();

		$("#Bet_nodata").show();
		$("#Ord_div").hide();
		$("#gold_show").hide();
	}
}

//确定交易事件
function affirm_trad(){
	if(TYPE == 2){
		$("#dangerTip").show();
	} else {
		$("#dangerTip").hide();
	}
	var betMoney = $("#BetMoney").val();
	if(!betMoney){
		layer.alert("请输入下注金额！", {title: '错误信息'});
		return false;
	}
	if(!betMoney){
		betMoney = 0;
	} else {
		var userreg=/^[0-9]+([.]{1}[0-9]{1,2})?$/;
		if(!userreg.test(betMoney)){
			layer.alert("下注金额为数字且最多只能两位小数！", {title: '错误信息'});
			return false;
	    }
	}
	
	if(betMoney < 10 || betMoney > 500000){
		layer.alert("交易单单笔限额10～500000元", {
			title : '提示信息'
		});
		return false;
	}
	
	var isLock = checkUserLock();
	if(isLock == true){
		layer.alert("网络故障，请联系管理员", {title: '错误信息'});
		return false;
	}
	
	$("#confirm_BetMoney").html(betMoney);
	$("#confirm_wingold").html($("#winMoney").html());
	$("#confirm_div").show();
}

function cancelConfirmEvent(){
	$("#confirm_div").hide();
}

/**
 * 获取订单信息
 * @param type
 */
function getOrderList(type, page, rows){
	$("#totalPage").html("1");
	var memberId = getStorageUser().id;
	if(!memberId){
		layer.alert("用户还未登录", {
			title : '错误信息'
		});
	}
	var reqData = {
			memberId: getStorageUser().id,
			page: page,
			rows: rows,
			status: type,
	}
	$.ajax({
		type: "GET",
		url: BaseUrl + "order/getOrderList",
		data: reqData,
		dataType: "json",
		cache:false,
		success: function(result){
			var html = '';
			if (result.code == SUCCESS_CODE) {
				var data = result.result;
				if(data){
					var orderList = data.orderList;
					if(type == 0 || type == 1){
						$.each(orderList, function(i, order){
							var betType = order.betType;
							var betTypeStr = ""
							if(betType == 0){
								betTypeStr = "今日赛事";
							} else if(betType == 1){
								betTypeStr = "早盘";
							} else if(betType == 2){
								betTypeStr = "滚球";
							}
							html += '<div class="order_list">';
							html += '<p><span class="blue">足球' + betTypeStr + '</span> ' + order.tournamentTemplateName + '<span class="red" style="font-weight:bold;font-size:10px;">[' + order.betCount + ']</span>';
							if(order.status == 6)	
								html += "<span style='color: red;display: inline-block;float: right;'>确认中</span>"
							html += '</p>';
							html += '<p><span class="zhuc"> [主] </span>' + order.teamName + '</p>';
							html += '<p><span class="kec"> [客] </span>' + order.guestTeamName + '</p>';
							html += '<p><span class="LoseRateNamec">';
							var scope = order.scope;
							var type = order.type;
							var state = order.state;
							var odds = order.odds;
							var ahTeam = order.ahTeam;
							var ouDparam = order.ouDparam;
							if(scope == "1h"){
								if(type == "1x2"){
									if(state == 1){
										html += '半场独赢</span> ' + order.teamName + '@<span class="red">' + odds + '</span>';
									} else if(state == 2){
										html += '半场独赢</span> '+order.guestTeamName+'@<span class="red">' + odds + '</span>';
									} else if(state == 3){
										html += '半场独赢 和</span> @<span class="red">' + odds + '</span>';
									}
								} else if(type == "ah"){
									html += '半场让球 ';
									if(state == 1){
										html += order.teamName;
										if(order.ahTeam == 1){
											html += "-";
										} else if(order.ahTeam == 2){
											html += "+";
										}
									} else if(state == 2){
										html += order.guestTeamName;
										if(order.ahTeam == 1){
											html += "+";
										} else if(order.ahTeam == 2){
											html += "-";
										}
									}
									html += formatOdds(order.ahDparam);
									html += ' </span> @<span class="red">' + odds + '</span>';
								} else if(type == "ou"){
									if(state == 1){
										html += '半场大小  大' + formatOdds(ouDparam) + ' &nbsp;&nbsp;@<span class="red">' + odds + '</span>';
									} else if(state == 2){
										html += '半场大小 小' + formatOdds(ouDparam) + ' &nbsp;&nbsp;@<span class="red">' + odds + '</span>';
									}
								}
							} else if(scope == "ord"){
								if(type == "1x2"){
									if(state == 1){
										html += '全场独赢</span> ' + order.teamName + '@<span class="red">' + odds + '</span>';
									} else if(state == 2){
										html += '全场独赢</span> '+order.guestTeamName+'@<span class="red">' + odds + '</span>';
									} else if(state == 3){
										html += '全场独赢 和</span> @<span class="red">' + odds + '</span>';
									}
								} else if(type == "ah"){
									html += '全场让球 ';
									if(state == 1){
										html += order.teamName;
										if(order.ahTeam == 1){
											html += "-";
										} else if(order.ahTeam == 2){
											html += "+";
										}
									} else if(state == 2){
										html += order.guestTeamName;
										if(order.ahTeam == 1){
											html += "+";
										} else if(order.ahTeam == 2){
											html += "-";
										}
									}
									html += formatOdds(order.ahDparam);
									html += ' </span> @<span class="red">' + odds + '</span>';
								} else if(type == "ou"){
									if(state == 1){
										html += '全场大小  大' + formatOdds(ouDparam) + ' &nbsp;&nbsp;@<span class="red">' + odds + '</span>';
									} else if(state == 2){
										html += '全场大小 小' + formatOdds(ouDparam) + ' &nbsp;&nbsp;@<span class="red">' + odds + '</span>';
									}
								}
							} else if(scope == "2h"){
								if(type == "1x2"){
									if(state == 1){
										html += '下半场-主队(独赢)</span>- &nbsp;&nbsp;@<span class="red">' + odds + '</span>';
									} else if(state == 2){
										html += '下半场-客队(独赢)</span>- &nbsp;&nbsp;@<span class="red">' + odds + '</span>';
									} else if(state == 3){
										html += '下半场-和局(独赢)</span>- &nbsp;&nbsp;@<span class="red">' + odds + '</span>';
									}
								} else if(type == "ah"){
									if(state == 1){
										html += '下半场-主队(让球)</span>-';
									} else if(state == 2){
										html += '下半场-客队(让球)</span>-';
									} 
									if(ahTeam == 1){
										html += "主让";
									} else if(ahTeam == 2){
										html += '客让';
									}
									html += order.ahDparam;
									html += '&nbsp;&nbsp;@<span class="red">' + odds + '</span>';
								} else if(type == "ou"){
									if(state == 1){
										html += '下半场-总球数大</span>-大' + formatOdds(ouDparam) + ' &nbsp;&nbsp;@<span class="red">' + odds + '</span>';
									} else if(state == 2){
										html += '下半场-总球数小</span>-小' + formatOdds(ouDparam) + ' &nbsp;&nbsp;@<span class="red">' + odds + '</span>';
									}
								}
							}
							//html += '主队(让球)</span>-主让0 / 0.5 &nbsp;&nbsp;@<span class="red">0.93</span>';
							html += '</p>';
							html += '</div>';
						})
					} else if(type == 2){
						var count = data.total;
						if(count > 0){
							var totalPage = parseInt((count + (ROWS -1))/ROWS);
							$("#orderPage").html(totalPage);
							if(totalPage > 1){
								var option = "";
								for(var i=0; i<totalPage; i++){
									option += '<option value="' + (i+1) + '"';
									if(page == (i+1))
										option += 'selected';
									option += '>' + (i+1) + '</option>';
								}
								$("#orderPageNo").html(option);
							}
						}
						$.each(orderList, function(i, order){
							var betType = order.betType;
							var betTypeStr = ""
							if(betType == 0){
								betTypeStr = "今日赛事";
							} else if(betType == 1){
								betTypeStr = "早盘";
							} else if(betType == 2){
								betTypeStr = "滚球";
							}
							
							html += '<tr>';
							html += '<td width="115"><p>NO:' + order.orderNo + '</p><p>' + order.createTime.substring(5, 10) + '</p><p>' + order.createTime.substring(10, 19) + '</p></td>';
							html += '<td width="95"><p>足球' + betTypeStr + '</p>';
//							html += '<p>足球' + betTypeStr + '</p>';
//							html += '<p>主让0 / 0.5</p>';
							html += '</td>';
							html += '<td width="228">';
							html += '<p>';
							html += order.startTime.substring(5, 19);
							if(betType == 2){
								html += '<span>(</span>';
								html += '<span style="color:blue;" title="下注时比赛开始时长">';
								if(order.scope == "1h"){
									html += "半场  ";
								} else if(order.scope == "ord"){
									html += "全场  ";
								} else if(order.scope == "2h"){
									html += "下半场  ";
								}
								
								html += order.playTime + ' </span>';
								html += '<span style="color:red;" title="下注时比赛比分">&nbsp;&nbsp;' + order.score + '</span>';
								html += '<span>)</span>';
							}
							html += '</p>';
							
							html += '<p>' + order.tournamentTemplateName + '</p>';
							html += '<p>';
							html += '<span style="color: #8b0000;">[主]</span>' + order.teamName;
							html += '<span style="color:red;">';
							html += '<b>VS.</b>';
							html += '</span>';
							html += '<span style="color: #c0c0c0;">[客]</span>' + order.guestTeamName + '</p>';
							html += '<p>';
							var scope = order.scope;
							var type = order.type;
							var state = order.state;
							var odds = order.odds;
							var ouDparam = order.ouDparam;
							if(scope == "1h"){
								if(type == "1x2"){
									if(state == 1){
										html += '<span style="color: #CC0000;">半场独赢  '+order.teamName+'</span>  @<b>' + order.odds + '</b></span>';
									} else if(state == 2){
										html += '<span style="color: #CC0000;">半场独赢  '+order.guestTeamName+'</span>  @<b>' + order.odds + '</b></span>';
									} else if(state == 3){
										html += '<span style="color: #CC0000;">半场独赢  和  @<b>' + order.odds + '</b></span>';
									}
								} else if(type == "ah"){
									html += '<span style="color: #CC0000;">半场让球 ';
									if(state == 1){
										html += order.teamName;
										if(order.ahTeam == 1){
											html += "-";
										} else if(order.ahTeam == 2){
											html += "+";
										}
									} else if(state == 2){
										html += order.guestTeamName;
										if(order.ahTeam == 1){
											html += "+";
										} else if(order.ahTeam == 2){
											html += "-";
										}
									}
									html += formatOdds(order.ahDparam);
									html += '  @<b>' + order.odds + '</b></span>';
								} else if(type == "ou"){
									if(state == 1){
										html += '<span style="color: #CC0000;">半场大小球 大' + formatOdds(ouDparam) + '  @<b>' + order.odds + '</b></span>';
									} else if(state == 2){
										html += '<span style="color: #CC0000;">半场大小球 小' + formatOdds(ouDparam) + '  @<b>' + order.odds + '</b></span>';
									}
								}
							} else if(scope == "ord"){
								if(type == "1x2"){
									if(state == 1){
										html += '<span style="color: #CC0000;">全场独赢 '+order.teamName+'  @<b>' + order.odds + '</b></span>';
									} else if(state == 2){
										html += '<span style="color: #CC0000;">全场独赢 '+order.guestTeamName+'  @<b>' + order.odds + '</b></span>';
									} else if(state == 3){
										html += '<span style="color: #CC0000;">全场独赢 和  @<b>' + order.odds + '</b></span>';
									}
								} else if(type == "ah"){
									html += '<span style="color: #CC0000;">全场让球 ';
									if(state == 1){
										html += order.teamName;
										if(order.ahTeam == 1){
											html += "-";
										} else if(order.ahTeam == 2){
											html += "+";
										}
									} else if(state == 2){
										html += order.guestTeamName;
										if(order.ahTeam == 1){
											html += "+";
										} else if(order.ahTeam == 2){
											html += "-";
										}
									}
									html += formatOdds(order.ahDparam);
									html += '  @<b>' + order.odds + '</b></span>';
								} else if(type == "ou"){
									if(state == 1){
										html += '<span style="color: #CC0000;">全场大小球 大' + formatOdds(ouDparam) + ' @<b>' + order.odds + '</b></span>';
									} else if(state == 2){
										html += '<span style="color: #CC0000;">全场大小球 小' + formatOdds(ouDparam) + ' @<b>' + order.odds + '</b></span>';
									}
								}
							} else if(scope == "2h"){
								if(type == "1x2"){
									if(state == 1){
										html += '<span style="color: #CC0000;">下半场独赢</span>-<span></span>@<span style="color: #CC0000;"><b>' + order.odds + '</b></span>';
									} else if(state == 2){
										html += '<span style="color: #CC0000;">下半场独赢</span>-<span></span>@<span style="color: #CC0000;"><b>' + order.odds + '</b></span>';
									} else if(state == 3){
										html += '<span style="color: #CC0000;">下半场独赢</span>-<span></span>@<span style="color: #CC0000;"><b>' + order.odds + '</b></span>';
									}
								} else if(type == "ah"){
									if(state == 1){
										html += '<span style="color: #CC0000;">下半场让球</span>-<span>';
									} else if(state == 2){
										html += '<span style="color: #CC0000;">下半场让球</span>-<span>';
									}
									if(order.ahTeam == 1){
										html += "主让";
									} else if(order.ahTeam == 2){
										html += '客让';
									}
									html += order.ahDparam;
									html += '</span>@<span style="color: #CC0000;"><b>' + order.odds + '</b></span>';
								} else if(type == "ou"){
									if(state == 1){
										html += '<span style="color: #CC0000;">下半场大小</span>-<span>大' + formatOdds(ouDparam) + '</span>@<span style="color: #CC0000;"><b>' + order.odds + '</b></span>';
									} else if(state == 2){
										html += '<span style="color: #CC0000;">下半场大小</span>-<span>小' + formatOdds(ouDparam) + '</span>@<span style="color: #CC0000;"><b>' + order.odds + '</b></span>';
									}
								}
							}
							html += '</p>';
							html += ' </td>';
							html += '<td width="84">' + formatterDouble(order.betCount) + '</td>';
							html += '<td width="83">' + formatterDouble(order.winCount) + '</td>';
							html += '<td width="84">';
							html += ORDER_STATUS[order.status]
							if(order.resultScore)
								html + "<br/><span style='color: red;'>" + order.resultScore + "</span>";
							html += '</td>';
							html += '<td width="83">' + formatterDouble(order.reusltCount) + '</td>';
							html += '</tr>';
							
						})
					}
				}
				
				
				if(type == 0){ //0未结算注单
					$("#unfinishOrder").html(html);
				} else if(type == 1){
					$("#finishOrder").html(html);
				} else if(type == 2){
					$("#orderList tbody").html(html);
				}
				
				
			} else if(result.code == UNLOGIN){
				layer.alert(result.msg);
				unLogin();
			} else {
				layer.alert(result.msg, {
					title : '错误信息'
				});
			}
		}
	});
}



function getGameResult(page, rows){
	$("#totalPage").html("1");
	var liansaiId = $("#liansaiSelect").val();
	var gameResultDate = $("#gameResultDate").val();
	var reqData = {
			leagueId: liansaiId,
			startTime: gameResultDate,
			page: page,
			rows: rows,
	}
	$("#gameResultList").html('<img src="images/loading.gif" style="margin-left: 30%; margin-top: 5%; margin-bottom: 5%;">');
	$.ajax({
		type: "POST",
		url: BaseUrl + "api/findResultGame",
		data: reqData,
		dataType: "json",
		cache:false,
		success: function(result){
			if (result.code == SUCCESS_CODE) {
				var data =  result.result;
				var totalSize = data.count;
				
				var totalPage = parseInt((totalSize + (ROWS - 1))/ROWS);
				$("#total").html(totalSize);
				$("#page").html(page);
				
				$(".enableColor").off("click")
				if(page > 1){
					$("#firstPage").addClass("enableColor");
					$("#upPage").addClass("enableColor");
				} else {
					$("#firstPage").removeClass("enableColor");
					$("#upPage").removeClass("enableColor");
				}
				if(totalPage > 1 && totalPage != page){
					$("#nextPage").addClass("enableColor");
					$("#endPage").addClass("enableColor");
				}else{
					$("#nextPage").removeClass("enableColor");
					$("#endPage").removeClass("enableColor");
				}
				
				$(".enableColor").on("click", function(){
					var id= $(this).attr("id");
					if(id == "firstPage"){
						getGameResult(1, ROWS);
					} else if(id == "upPage"){
						getGameResult(page - 1, ROWS);
					} else if(id == "nextPage"){
						getGameResult(page + 1, ROWS);
					} else if(id == "endPage"){
						getGameResult(totalPage, ROWS);
					}
				})
				
				
				var gameResultList = data.eventForms;
				var html = '<table id="" width="100%">';
				
                html += '<thead>';
                html += '<tr>';
                html += '<th style="font-size:16px;" >足球&nbsp;&nbsp;';
                html += '<span class="game_type_text">（赛果）</span>';
                html += '</th>';
                html += '<th class="result_other" style="text-align:left;">日期</th>';
                html += '<th class="result_other" style="text-align:left;">球队</th>';
                html += '<th class="result_other">全场</th>';
                html += '<th class="result_other">上半场</th>';
                html += '<th></th>';
                html += '</tr>';
                html += '</thead>';
                html += '<tbody>';
				
				if(gameResultList && gameResultList.length > 0){
					$.each(gameResultList, function(i, val){
						html += '<tr>';
						html += '<td class="result_other">';
						html += '<p>' + val.leagueCnName + '</p>';
						html += '</td>';
						html += '<td class="result_time">';
						html += '<p>' + val.startDate.substring(0, 10) + '</p>';
						html += '<p>' + val.startDate.substring(11, 16) + '</p>';
						html += '</td>';
						html += '<td class="result_team">';
						html += '<p>' + val.homeTeamCnName + '</p>';
						html += '<p>' + val.awayTeamCnName + '</p>';
						html += '</td>';
						html += '<td class="result_other">';
						html += '<p>' + val.wholeHomeScore + '</p>';
						html += '<p>' + val.wholeAwayScore + '</p>';
						html += '</td>';
						html += '<td class="result_other">';
						html += '<p>' + val.homeScore + '</p>';
						html += '<p>' + val.awayScore + '</p>';
						html += '</td>';
						html += '<td></td>';
						html += '</tr>';
					})
				} else {
					html += '<tr>';
					html += '<td colspan="5">暂时没有数据！</td>';
					html += '</tr>';
				}
				html += '</tbody>';
                html += '</table>';
				$("#gameResultList").html(html)
			} else if(result.code == UNLOGIN){
				layer.alert(result.msg);
				unLogin();
			} else {
				layer.alert(result.msg, {
					title : '错误信息'
				});
			}
		}
	})
}

function findLeagues(){
	$.ajax({
		type: "POST",
		url: BaseUrl + "api/findLeagues",
		dataType: "json",
		cache:false,
		success: function(result){
			if (result.code == SUCCESS_CODE) {
				var html = ' <option value="">直接选择或搜索选择</option>';
				var data = result.result;
				if(data){
					$.each(data, function(i, leagues){
						html += ' <option value="' + leagues.leagueId + '">' + leagues.leagueCnName + '</option>'
					})
				}
				$("#liansaiSelect").html(html);
				var form = layui.form;
				form.render();
			} else if(result.code == UNLOGIN){
				layer.alert(result.msg);
				unLogin();
			} else {
				layer.alert(result.msg, {
					title : '错误信息'
				});
			}
		}
	});
}


var countdown=30;
var timer;
function settime() {  
    if (countdown == 0) { 
        countdown = 30;  
        findGrounderLeagueList(1);
    } else { 
    	countdown--; 
		$("#freshTime").html(countdown);
		timer = setTimeout(function() {  
            settime()  
        },1000)  
    }  

}  

var countdown2=150;
var timer2;
function settime2() {  
	if (countdown2 == 0) { 
		countdown2 = 150;  
		getTournamentTemplateList(0, 1);
	} else { 
		countdown2--; 
		$("#freshTime").html(countdown2);
		timer2 = setTimeout(function() {  
			settime2(); 
		},1000)  
	}  
}  

var countdown3=150;
var timer3;
function settime3(){
	if (countdown3 == 0) {
		countdown3 = 150;
		getTournamentTemplateList(1, 1);
	} else {
		countdown3--;
		$("#freshTime").html(countdown3);
		timer3 = setTimeout(function(){
			settime3();
		},1000)
	}
}


function checkOddsChange(oddsId, data){
	if(listMapOld){
		
	}
}

