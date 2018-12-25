
$(document).ready(function(){
    var daili_indx=$.query.get("daili");//获取代理tab索引值，通过url传递，控制tab切换
    daili_type._init_switch(daili_indx);
})

var daili_type={
    _init_switch:function(index){
        $(".partners_menu li").removeClass("on");
        $(".partners_menu li").eq(index).addClass("on");
        $(".partners_content").hide();
        $(".partners_content").eq(index).show();

    }
}