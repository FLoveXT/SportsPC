var intDiff = parseInt(10);//倒计时总秒数量
$(function(){
	var salt = getUrlParam("salt");
	if(salt){
		$("#inviteCodeDiv").remove();
		$.ajax({
			type: "GET",
			url: BaseUrl + "user/getParent/" + salt,
			dataType: "json",
			cach: false,
			success: function(result){
				if(result.code == SUCCESS_CODE){
					var user = result.result;
					var type = user.type;
					$("#salt").val(salt);
					var registerType = user.registerType;
					$("#registerType").val(registerType);
					$("#baseInfoContent").show();
					if(registerType == 1){
						$("#bankInfoContent").remove();
					} else {
						$("#bankInfoContent").show();
					}
					if(type == 1){
						$("#type").val(2)
						$(".partners_menu li").removeClass("on");
						$($(".partners_menu li")[2]).addClass("on");
						$(".partners_content").hide();
						$(".partners_content").eq(2).show();
					} else if(type == 2){
						$("#type").val(3)
					}
					$("#register-btn").show();
				} else {
					layer.alert(result.msg, {  
					      title: '错误信息'  
					    }) 
				}
			}
		});
	}
	$("#smsCode").click(function(){
		sendMsgCode();
	});
	
	
	$("#check-btn").click(function(){
		var inviteCode = $("#inviteCode").val();
		if(inviteCode){
			$.ajax({
				type: "GET",
				url: BaseUrl + "user/checkInviteCode/" + inviteCode,
				dataType: "json",
				cach: false,
				success: function(result){
					if(result.code == SUCCESS_CODE){
						var user = result.result;
						var type = user.type;
						if(type == 1){
							var url = window.location.href;
							if(url.indexOf("register.html") > -1){
								layer.alert("校验不通过，合作商邀请码仅用于代理商注册使用", {  
									title: '信息'  
								}) 
								
								return false;
							}
						}
						
						$("#check-btn").remove();
						$("#baseInfoContent").show();
						$("#register-btn").show();
						$("#inviteCode").attr("readonly", "readonly");
						
						
						var registerType = user.registerType;
						$("#registerType").val(registerType);
						if(registerType == 1){
							$("#bankInfoContent").remove();
						} else {
							$("#bankInfoContent").show();
						}
						
						if(type == 1){
							$("#type").val(2)
							$(".partners_menu li").removeClass("on");
							$($(".partners_menu li")[2]).addClass("on");
							$(".partners_content").hide();
							$(".partners_content").eq(2).show();
						} else if(type == 2){
							$("#type").val(3)
						}
						
						layer.alert("校验通过", {  
						      title: '信息'  
						 }) 
					} else {
						layer.alert(result.msg, {  
						      title: '错误信息'  
						 }) 
					}
				}
			});
		} else {
			$("#baseInfoContent").show();
			$("#bankInfoContent").show();
			$("#register-btn").show();
		}
	});
}); 


layui.use('form', function () {
	var form = layui.form; 
   
  //自定义验证规则  
  form.verify({  
	  account: function(value){
		  value = $.trim(value);
		  if(value.length < 4 || value.length >12){  
			  return '帐号只能输入4-12个字符';  
		  }  
		  if(!new RegExp("^[a-zA-Z0-9_\u4e00-\u9fa5\\s·]+$").test(value)){
			  return '帐号不能有特殊字符';
		  }
		  if(/(^\_)|(\__)|(\_+$)/.test(value)){
			  return '帐号首尾不能出现下划线\'_\'';
		  }
		  if(/^\d+\d+\d$/.test(value)){
			  return '用户名不能全为数字';
		  }
	  }, pwd: function(value){  
		  if(value.length < 6 || value.length >12){  
			  return '须为6-12位英文或数字且符合0~9或a~z字符';  
		  } 
		  if(!new RegExp("^[a-zA-Z0-9]+$").test(value)){
			  return '须为6-12位英文或数字且符合0~9或a~z字符';
		  }
	  }, contact: function(value){  
          if(value.length < 4){  
            return '内容请输入至少4个字符';  
          }  
        }  
        ,phone: function(value){
        	//[/^1[3|4|5|7|8]\d{9}$/, '手机必须11位，只能是数字！'] 
        	if(value && new RegExp("^1[3|4|5|7|8]\d{9}$").test(value)){
  			  return '手机号码不合法！';
  		  }
        } 
        ,email: [/^[a-z0-9._%-]+@([a-z0-9-]+\.)+[a-z]{2,4}$|^1[3|4|5|7|8]\d{9}$/, '邮箱格式不对']  
  });  
    
  var aa = 0;
  //监听提交  
  form.on('submit(register-btn)', function(data){ 
	var pwd = $("#pwd").val();
	var pwd2 = $("#pwd2").val();
	if(pwd != pwd2){
		layer.alert("输入的两次密码不一致！", {  
		      title: '错误信息'  
		    });
		return false;
	}
	var bankPwd = $("#bankPwd").val();
	var bankPwd2 = $("#bankPwd2").val();
	if(bankPwd != bankPwd2){
		layer.alert("输入的取款密码不一致！", {  
		      title: '错误信息'  
		    });
		return false;
	}
	
	if(aa == 0){
		aa = 1;
		$.ajax({
			type: "POST",
			url: BaseUrl + "user/register",
			data: data.field,
			dataType: "json",
			cach: false,
			success: function(result){
				aa = 0;
				if(result.code == "00"){
					var userType = data.field.type;
					if(userType == 1 || userType == 2 ){
						alert("提交成功，请联系客服查看审核进度。");
				    	window.history.back();  //返回上一页
					} else {
						alert("提交成功");
				    	window.history.back();  //返回上一页
					}
					
				} else {
					layer.alert(result.msg, {  
					      title: '错误信息'  
					    }) 
				}
			}
		});
	}
	
    return false;  
  });
  
  //监听提交  
  form.on('submit(login-btn)', function(data){  
	  var formData = $('#loginForm').serializeJSON();
	  $.ajax({
		  type: "POST",
		  url: BaseUrl + "user/login",
		  data: JSON.stringify(data.field),
		  dataType: "json",
		  cach: false,
		  success: function(result){
			  if(result.code == "00"){
				  layer.alert(result.msg, {  
					  title: '最终的提交信息'  
				  }) 
			  } else {
				  layer.alert(result.msg, {  
					  title: '错误信息'  
				  }) 
			  }
		  }
	  });
  
	  return false;  
  });  
});


function sendMsgCode(){
	var phone = $.trim($("#phone").val());
	if(phone){
		var able = $("#smsCode").attr('enabled');
		console.log(able)
		if(able == "true"){
			sendemail();
			$.ajax({
				  type: "GET",
				  url: BaseUrl + "user/sendMsgCode/" + phone,
				  dataType: "json",
				  cach: false,
				  success: function(result){
					  if(result.code == "00"){
					  } else {
						  layer.alert(result.msg, {  
							  title: '错误信息'  
						  }) 
					  }
				  }
			  });
		} else {
			return false;
		}
	} else {
		layer.alert('电话号码不能为空！', {  
			  title: '错误信息' 
		  }) 
	}
}


function timer(intDiff){
    window.setInterval(function(){
    var day=0,
        hour=0,
        minute=0,
        second=0;//时间默认值        
    if(intDiff > 0){
//        day = Math.floor(intDiff / (60 * 60 * 24));
//        hour = Math.floor(intDiff / (60 * 60)) - (day * 24);
//        minute = Math.floor(intDiff / 60) - (day * 24 * 60) - (hour * 60);
//        second = Math.floor(intDiff) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
    	second = Math.floor(intDiff);
    } else {
    	$("#smsCode").removeClass("wait_time");
		$("#smsCode").addClass("get_yzCode");
    }
    if (minute <= 9) minute = '0' + minute;
    if (second <= 9) second = '0' + second;
//    $('#day_show').html(day+"天");
//    $('#hour_show').html('<s id="h"></s>'+hour+'时');
//    $('#minute_show').html('<s></s>'+minute+'分');
    $('#second_show').html(second);
    intDiff--;
    }, 1000);
} 


var countdown = 60;
function sendemail() {
	var obj = $("#smsCode");
	settime(obj);

}
function settime(obj) { // 发送验证码倒计时
	if (countdown == 0) {
		$(obj).removeClass('wait_time');
		$(obj).addClass('get_yzCode');
		$(obj).attr('enabled', true);
		// obj.removeattr("disabled");
		$(obj).html("获取验证码");
		countdown = 60;
		return;
	} else {
		$(obj).removeClass('get_yzCode');
		$(obj).addClass('wait_time');
		$(obj).attr('enabled', false);
		$(obj).html("重新发送(" + countdown + ")");
		countdown--;
	}
	setTimeout(function() {
		settime(obj)
	}, 1000)
}

