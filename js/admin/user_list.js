//JavaScript代码区域
layui.use(['layer', 'form', 'laydate', 'table'], function () {
    let layer = layui.layer,
        $ = layui.$,
        form = layui.form,
        laydate = layui.laydate,
        table = layui.table;

    let user = {
        init: function () {
            this.tableInit();
            this.laydateInit();
            this.tableEvents();
            this.formEvents();
            this.bindingEvents();
        },
        tableInit: function () {
            //数据表格实例
            table.render({
                id: 'idTest',
                elem: '#demo',
                url: IP + 'user/users',
                height: 'full-180',
                method: 'get',
                page: true,
                even: true,
                cols: [
                    [{
                        type: 'checkbox'
                    }, {
                        field: 'id',
                        title: 'UID',
                        hide: true
                    }, {
                        field: 'username',
                        title: '用户名'
                    }, {
                        field: 'nickname',
                        title: '昵称',
                        edit: true
                    }, {
                        field: 'sex',
                        title: '性别',
                        width: 150,
                        templet: '#switchTpl',
                        unresize: true
                    }, {
                        field: 'isLock',
                        title: '锁定',
                        width: 150,
                        templet: '#checkboxTpl',
                        unresize: true
                    }, {
                        field: 'crateTime',
                        title: '创建时间',
                        sort: true
                    }, {
                        fixed: 'right',
                        width: 300,
                        title: '操作',
                        align: 'center',
                        toolbar: '#barDemo'
                    }]
                ],
                request: {
                    pageName: 'page',
                    limitName: 'pageSize'
                },
                response: {
                    statusName: 'code',
                    statusCode: 0,
                    msgName: 'message',
                    countName: 'count',
                    dataName: 'data'
                },
                done: function (res, curr, count) {
                    layer.closeAll('loading');
                }
            });
        },
        laydateInit: function () {
            //执行一个laydate实例
            laydate.render({
                elem: '#start',
                max: 0
            });
            laydate.render({
                elem: '#end',
                max: 0
            });
        },
        tableEvents: function () {
            //数据表格监听工具条(查看、编辑、删除按钮)
            table.on('tool(test)', function (obj) {
                let data = obj.data;
                let layEvent = obj.event;
                if (layEvent === 'reset') {
                    let users = [];
                    let temp = {};
                    temp.id = data.id;
                    temp.username = data.username;
                    users.push(temp)
                    user.submitResetAction(users);
                } else if (layEvent === 'del') {
                    let ids = [];
                    ids.push(data.id)
                    user.submitDelAction(ids);
                } else {
                    layer.msg("开发中");
                }
            });
            //复选框批量操作
            table.on('checkbox(test)', function (obj) {
                let checkStatus = table.checkStatus('idTest');
                if (checkStatus.data.length > 0) {
                    $('#delAll').show();
                    $('#resetAll').show();
                } else {
                    $('#delAll').hide();
                    $('#resetAll').hide();
                }
            });
            //监听单元格编辑
            table.on('edit(test)', function (obj) {
                let value = obj.value //得到修改后的值
                    , id = obj.data.id //得到所在行所有键值
                    , field = obj.field; //得到字段
                let temp = '{"id":'+id+',"'+field+'":"'+value+'"}';
                user.layerMsg(user.submitEditAction(temp));
            });
        },
        formEvents: function () {
            //监听性别操作
            form.on('switch(sexDemo)', function (obj) {
                $(obj.elem).attr("disabled","disabled");
                let id = this.value,sex=1;
                if (obj.elem.checked){sex=0;}
                let temp = '{"id":'+id+',"sex":'+sex+'}';
                user.layerTips(user.submitEditAction(temp),obj);
                $(obj.elem).removeAttr("disabled");
            });
            //监听锁定操作
            form.on('checkbox(lockDemo)', function (obj) {
                $(obj.elem).attr("disabled","disabled");
                let id = this.value,isLock=1;
                if (obj.elem.checked){isLock=0;}
                let temp = '{"id":'+id+',"isLock":'+isLock+'}';
                user.layerTips(user.submitEditAction(temp),obj);
                $(obj.elem).removeAttr("disabled");
            });
            //监听提交
            form.on('submit(formDemo)', function (data) {
                table.reload('idTest', {
                    where: data.field
                });
                return false;
            });
        },
        bindingEvents: function () {
            //批量删除按钮
            $('#delAll').on('click', function () {
                let checkStatus = table.checkStatus('idTest');
                if (checkStatus.data.length > 0) {
                    let list = checkStatus.data;
                    let ids = [];
                    $.each(list, function (idx, obj) {
                        ids.push(obj.id);
                    });
                    user.submitDelAction(ids);
                }
            });
            //批量重置按钮
            $('#resetAll').on('click', function () {
                let checkStatus = table.checkStatus('idTest');
                if (checkStatus.data.length > 0) {
                    let list = checkStatus.data;
                    let users = [];
                    $.each(list, function (idx, obj) {
                        let temp = {};
                        temp.id = obj.id;
                        temp.username = obj.username;
                        users.push(temp);
                    });
                    user.submitResetAction(users);
                }
            });
            //添加按钮事件
            $('#adduser').on('click', function () {
                window.location = 'user_add.html'
            });
        },
        submitDelAction: function (array) {
            layer.confirm('确认删除吗？', {icon: 3}, function () {
                $.ajax({
                    url: IP + 'user/user',
                    type: "DELETE",
                    data: JSON.stringify(array),
                    success: function (result) {
                        if (layerMsg.msg(result.code, '删除', 1000)){
                            table.reload('idTest');
                        }
                    }
                });
            });
        },
        submitResetAction:function (array) {
            layer.confirm('确认重置吗？', {icon: 3}, function () {
                $.ajax({
                    url: IP + 'user/reset',
                    type: "post",
                    data: JSON.stringify(array),
                    success: function (result) {
                        console.log(result);
                        layerMsg.msg(result.code, '重置密码', 1000);
                    }
                });
            });
        },
        submitEditAction:function (str) {
            let status = false;
            $.ajax({
               type:'put',
               url:IP+"user/user",
               data:str,
               async:false,
               success:function (result) {
                   if (result.code ===0){status = true;}
               }
            });
            return status;
        },
        layerTips:function (res,obj) {
            if (res) {
                layer.tips("修改成功!", obj.othis);
            }else {
                layer.tips("修改失败!", obj.othis);
                this.tableReload({});
            }
        },
        layerMsg:function (res) {
            if (res){
                layer.msg('修改成功', {icon: 6,time:1000});
            }else {
                layer.msg('修改失败', {icon: 5,time:1000});
                this.tableReload({});
            }
        },
        tableReload:function (obj) {
            table.reload('idTest',obj);
        }
    };

    $(function () {
        user.init();
    });

});