//设为首页
function SetHome(obj, vrl) {
	try {
		obj.style.behavior = 'url(#default#homepage)';
		obj.setHomePage(vrl);
	}
	catch (e) {
		if (window.netscape) {
			try {
				netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
			}
			catch (e) {
				alert("此操作被浏览器拒绝！\n请在浏览器地址栏输入“about:config”并回车\n然后将 [signed.applets.codebase_principal_support]的值设置为'true',双击即可。");
			}
			var prefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch);
			prefs.setCharPref('browser.startup.homepage', vrl);
		} else {
			alert("您的浏览器不支持，请按照下面步骤操作：1.打开浏览器设置。2.点击设置网页。3.输入：" + vrl + "点击确定。");
		}
	}
}


//收藏本站
function AddFavorite(title, url) {
	try {
		window.external.addFavorite(url, title);
	}
	catch (e) {
		try {
			window.sidebar.addPanel(title, url, "");
		}
		catch (e) {
			alert("抱歉，您所使用的浏览器无法完成此操作。\n\n加入收藏失败，请使用Ctrl+D进行添加");
		}
	}
}


//保存到桌面
function toDesktop(sUrl, sName) {
	try {
		var WshShell = new ActiveXObject("WScript.Shell");
		var oUrlLink = WshShell.CreateShortcut(WshShell.SpecialFolders("Desktop") + "\\" + sName + ".url");
		oUrlLink.TargetPath = sUrl;
		oUrlLink.Save();
	}
	catch (e) {
		alert("当前IE安全级别不允许操作！");
	}
}


function toggleColor(id, arr, s) {
	var self = this;
	self._i = 0;
	self._timer = null;

	self.run = function () {
		if (arr[self._i]) {
			$(id).css('color', arr[self._i]);
		}
		self._i == 0 ? self._i++ : self._i = 0;
		self._timer = setTimeout(function () {
			self.run(id, arr, s);
		},
			s);
	}
	self.run();
}

$(document).ready(function () {
	new toggleColor('#dlzcid', ['#FF0000', '#ffae00'], 1000);
	new toggleColor('#hzjmid', ['#FF0000', '#ffae00'], 800);
	new toggleColor('#dldrid', ['#FF0000', '#ffae00'], 900);
})