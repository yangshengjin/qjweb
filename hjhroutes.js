/**
 * Created by Administrator on 2016/5/4 0004.
 */
angular.module('24EApp.hjhroutes',[])
    .config(function($stateProvider,$urlRouterProvider){
        $stateProvider

            //注册
            .state('Register',{
                url:'/Register',
                templateUrl:'templates/Client/Register.html',
                controller:'RCtrl'
            })

            //登录
            .state('Login',{
                url:'/Login',
                templateUrl:'templates/Client/login.html',
                controller:'LoginCtrl'
            })

            //协议
            .state('Rule',{
                url:'/Rule',
                templateUrl:'templates/Client/Rule.html'
            })

            //预约代驾
            .state('Booked',{
                url:'/Booked',
                templateUrl:'templates/Client/Booked.html',
                controller:'BookedCtrl'
            })


            //个人中心
            .state('Person',{
                url:'/Person',
                cache:false,
                templateUrl:'templates/Client/Person.html',
                controller:'PersonCtrl'
            })

            //我的账户
            .state('Myaccount',{
                url:'/Myaccount',
                templateUrl:'templates/Client/Myaccount.html',
                controller:'accountCtrl',
            })

            //商务合作
            .state('Cooperation',{
                url:'/Cooperation',
                templateUrl:'templates/Client/Cooperation.html'
            })

            //帮助中心
            .state('Help',{
                url:'/Help',
                templateUrl:'templates/Client/Help.html'
            })
            //公告信息
            .state('Notice',{
                url:'/Notice',
                templateUrl:'templates/Client/Notice.html',
                controller:'noticeCtrl',
            })
    })