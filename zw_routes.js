angular.module('24EApp.zw_routes',[])
    .config(function($stateProvider,$urlRouterProvider){
        $stateProvider

            .state('VipManagement',{
                url:'/VipManagement',
                templateUrl:'templates/Manage/VipManagement.html',
                cache:'false',
                controller:'vipCtrl'
            })

            .state('vipEdit',{
                url:'/vipEdit',
                templateUrl:'templates/Manage/vipEdit.html',
                cache:'false',
                controller:'vipeditCtrl',
            })

            .state('VipManagement_info',{
                url:'/VipManagement_info',
                templateUrl:'templates/Manage/VipManagement_info.html',
                cache:'false',
                controller:'editCtrl'
            })
            .state('VipManagement_add',{
                url:'/VipManagement_add',
                templateUrl:'templates/Manage/VipManagement_add.html',
                cache:'false',
            })
            
            .state('price_setting',{
                url:'/price_setting',
                templateUrl:'templates/Manage/price_setting.html',
                cache:'false',
                controller:'priceCtrl',
               
            })
            
            .state('payment',{
                url:'/payment',
                templateUrl:'templates/Manage/payment.html',
                controller:'paymentCtrl'
            })
            
            .state('system',{
                url:'/system',
                templateUrl:'templates/Manage/system.html',
                controller:'systemCtrl',
                cache:'false',
            })
            
            .state('ti_cash',{
                url:'/ti_cash',
                templateUrl:'templates/Manage/ti_cash.html',
                controller:'ti_cashCtrl',
            })

            //余额提现管理详情
            .state('TakeCashManage',{
                url:'/TakeCashManage',
                templateUrl:'templates/Manage/TakeCashManage.html',
                controller:'TakeCashManageCtrl',

            })
            //操作员管理编辑
            .state('Edit',{
                url:'/Edit',
                templateUrl:'templates/Manage/Edit.html',
                controller:'EditCtrl',
                cache:'false',
            })
            //增加操作员管理
            .state('Add',{
                url:'/Add',
                templateUrl:'templates/Manage/Add.html',
                controller:'AddCtrl',
                cache:'false',
            })
            //权限管理编辑
            .state('Permission',{
                url:'/Permission',
                templateUrl:'templates/Manage/Permission.html',
                controller:'PermissionCtrl',
                cache:'false',
            })
    })