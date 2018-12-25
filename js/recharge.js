$(function () {
    layui.use('laydate', function(){
        var laydate = layui.laydate;

        //执行一个laydate实例
        laydate.render({
            elem: '#createDate', //指定元素
            format:'yyyy-MM-dd HH:mm:ss'
        });
    });
})
