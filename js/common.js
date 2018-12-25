var BaseUrl = "https://www.hg885599.com/";
var SysteLoginUrl = 'http://admin.hg885599.com/';
var SUCCESS_CODE = "00";
var UNLOGIN = "02";
var CAPITALDETAI_TYPE= {
		"0": "下注扣款",	
		"1": "反水优惠",	
		"2": "派奖",	
		"3": "提现",	
		"4": "彩金赠送",	
		"5": "系统扣款",
		"6":"上分",
		"7":"下分",
		"8":"订单取消",
		"9":"危险订单取消",
		"10":"充值",
};
var ORDER_STATUS= {
		"0": "未结算",	
		"1": "全赢",	
		"2": "赢半",	
		"3": "全输",	
		"4": "输半",	
		"5": "走盘",
		"6":"确认中",
		"7":"取消",
		"8":"危险取消",
};

layui.use('form', function () {
	var layer= layui.layer;
});

$(function(){

	$(".zixun_btn").click(function(){
		var w = document.documentElement.clientWidth || document.body.clientWidth;
		var h = document.documentElement.clientHeight || document.body.clientHeight;
		w = (w - 690)/2;
		h = (h - 520)/2;
		
		layer.open({
			  title:"在线客服",
			  type: 2,
			  skin: 'layui-layer-rim', //加上边框
			  area: ['690px', '520px'], //宽高
			  content: 'https://ssl.pop800.com/chat/358084'
			});
		//window.open("http://api.pop800.com/chat/358084","newwindow","height=520,width=690,toolbar=no,menubar=no,scrollbars=no,resizable=no, location=no,status=no,top="+h+", left="+w+",");
	});
	
	$(".user").hover(function () {
		$(".drop").show();
	}, function () {
		$(".drop").hide();
	})
	
	$("#verify_code_img").click(function(){
		getVerifyCode();
	});
	getVerifyCode();
	
	checkLogin();
	
	$("#loginOut").click(function(){
		EixtLogin();
		window.location.href='../../index.html';
	});
	
	
	$("#dldrid").attr("href", SysteLoginUrl);
	
})

/**
 * 获取图片验证码
 */
function getVerifyCode(){
	$("#verify_code_img").attr("src", BaseUrl+"user/generateImage?random=" + Math.floor(Math.random()*1000));
}

/**
 * 校验用户是否已经登录
 */
function checkLogin(){
	var userInfo = sessionStorage.getItem("userInfo");
	if(userInfo){
		$.ajax({
			type : "GET",
			url : BaseUrl + "user/getUserInfo?timestamp=" +  (new Date()).getTime(),
			dataType : "json",
			async: false,
			success : function(result) {
				if (result.code == SUCCESS_CODE) {
					var user = result.result.user;
					$("#member_name").html(user.account);
					$("#headUsserName").html(user.account);
					$("#topBalance").html(formatterDouble(user.balance));
					$("#headBalance").html(formatterDouble(user.balance));
					$("#no_login").hide();
					$("#logined").show();
					var registerType = user.registerType;
					if(registerType == 1){
						$("#saveMoney").remove();
						$("#getMoney").remove();
						$("#onlineRecharge").remove();
						$("#tixianApply").remove();
						$("#bankPassword").remove();
					}
				} else if(result.code == UNLOGIN){
					unLogin();
				} else {
					layer.alert(result.msg, {
						title : '错误信息'
					});
					
				}
			}
		});
	}
}

/**
 * 登录
 * @returns {Boolean}
 */
function BetLogin() {
	var login_accout = $.trim($("#login_accout").val());
	var login_pwd = $.trim($("#login_pwd").val());
	var verify_code = $.trim($("#verify_code").val());
	if (!login_accout) {
		layer.alert('请输入账号！');
		return false;
	}
	if (!login_pwd) {
		layer.alert('请输入密码！');
		return false;
	}
	if (!verify_code) {
		layer.alert('请输入验证码！');
		return false;
	}

	var reqData = {
			account: login_accout,
			password: login_pwd,
			captcha: verify_code,
	};
	$.ajax({
		type : "POST",
		url : BaseUrl + "user/login?timestamp=" +  (new Date()).getTime(),
		data : reqData,
		dataType : "json",
		cach : false,
		success : function(result) {
			if (result.code == SUCCESS_CODE) {
				var user = result.result.user;
				$("#member_name").html(user.account);
				$("#headUsserName").html(user.account);
				$("#topBalance").html(formatterDouble(user.balance));
				$("#headBalance").html(formatterDouble(user.balance));
				$("#no_login").hide();
				$("#logined").show();
				$("#login_accout").val("");
				$("#login_pwd").val("");
				$("#verify_code").val("");
				
				$("#myOrderCount").html(result.result.unSettleOrderCount);
				
				sessionStorage.setItem("userInfo", JSON.stringify(user));
				sessionStorage.setItem("token", result.result.token);
			} else {
				$("#verify_code").val("");
				getVerifyCode();
				layer.alert(result.msg, {title : '错误信息'});
			}
		}
	});

	
}

/**
 * 退出登录
 */
function EixtLogin() {
	$.ajax({
		type : "GET",
		url : BaseUrl + "user/logout?timestamp=" +  (new Date()).getTime(),
		dataType : "json",
		cach : false,
		success : function(result) {
			if (result.code == SUCCESS_CODE || result.code == UNLOGIN) {
				$("#no_login").show();
				$("#logined").hide();
				$("#headUsserName").html("请登录");
				$("#headBalance").html("0.00");
				$("#topBalance").html("0.00");
				$("#myOrderCount").html("0");
				sessionStorage.removeItem("userInfo");
				getVerifyCode();
			} else {
				layer.alert(result.msg, {title : '错误信息'});
			}
		}
	});
}

//获取url中的参数
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
	var r = window.location.search.substr(1).match(reg);  //匹配目标参数
	if (r != null) return unescape(r[2]); return null; //返回参数值
}

/*
 * 获取Storage的用户信息
 */
function getStorageUser(){
	var userStr = sessionStorage.getItem("userInfo");
	if(userStr){
		return JSON.parse(userStr);
	} else {
		return {};
	}
}


function checkUserLock(){
	var lock = false;
	$.ajax({
		type : "GET",
		url : BaseUrl + "user/getUserInfo?timestamp=" +  (new Date()).getTime(),
		dataType : "json",
		async: false,
		success : function(result) {
			if (result.code == SUCCESS_CODE) {
				var user = result.result.user;
				if(user.status == 0){
					lock = true;
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
	return lock;
}

//获取url中的参数
function getUrlParam(name) {
  var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)"); // 匹配目标参数
  var result = window.location.search.substr(1).match(reg); // 对querystring匹配目标参数
  if (result != null) {
    return decodeURIComponent(result[2]);
  } else {
    return null;
  }
}


function unLogin(){
	$("#no_login").show();
	$("#logined").hide();
	$("#headUsserName").html("请登录");
	$("#headBalance").html("0.00");
	$("#topBalance").html("0.00");
	$("#myOrderCount").html("0");
	sessionStorage.removeItem("userInfo");
}

function formatterDouble(number){
	if(!number)
		number = 0;
	var numberStr = number.toString();
	if(numberStr.indexOf(".") > -1){
		numberStr += "00";
		numberStr = numberStr.substring(0, numberStr.indexOf(".") + 3);
	}else{
		numberStr += ".00";
	}
	return numberStr;
}


function formatOdds(odds){
	var odds = odds.toString();
	if(odds.indexOf(".25") > -1){
		var a = odds.substring(0, odds.indexOf("."));
		return a + "/" + (a + ".5");
	} else if(odds.indexOf(".75") > -1){
		var a = odds.substring(0, odds.indexOf("."));
		return (a + ".5") + "/" + (parseInt(a) + 1);
	}else {
		return odds;
	}
}
