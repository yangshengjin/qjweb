/**
 * Created by Administrator on 2016/5/4 0004.
 */
angular.module('24EApp.tyxroutes',[])
    .config(function($stateProvider, $urlRouterProvider){
        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $urlRouterProvider.otherwise('/Login');
        $stateProvider

        //// if none of the above states are matched, use this as the fallback
        //$urlRouterProvider.otherwise('/tab/home');
        // setup an abstract state for the tabs directive



            //起始页路由
            .state('Route',{
              url:"/Route",
                //abstract:true,
                views:{
                    '':{
                        templateUrl: "templates/Route.html",
                        controller:'RouteCtrr'
                    }
                }
            })

            //一键下单
            .state('OneKeyOder',{
                url:"/OneKeyOder",
                // data: {
                //   authorizedRoles: [USER_ROLES.admin, USER_ROLES.user],
                // },
                views:{
                    '':{
                        templateUrl:'templates/Client/OneKeyOder.html',
                        controller:'OneKeyOderCtr'
                    }
                }
            })

            //一键下单后页
            .state('OneKeyOderLater',{
                url:"/OneKeyOderLater",
                cache:'false',
                views:{
                    '':{
                        templateUrl:'templates/Client/OneKeyOder-01.html',
                        controller:'OneKeyOderLaterCtr'
                    }
                }
            })

            //代叫

            .state('DaiJiao',{
                url:"/DaiJiao",
                params:{id:null},
                cache:true,
                views:{
                    '':{
                        templateUrl:'templates/Client/daijiao.html',
                        controller:'DaiJiaoCtr'
                    }
                }
            })


            // 订单管理
            .state('OrderManagement',{
                url:"/OrderManagement",
                views:{
                    '':{
                        templateUrl:'templates/Client/OrderManagement.html',
                        controller:'OrderManagementCtr'
                    }
                }
            })

            // 订单管理
            .state('PriceList',{
                url:"/PriceList",
                views:{
                    '':{
                        templateUrl:'templates/Client/PriceList.html',
                        controller:'PriceListCtr'
                    }
                }
            })
            // 代办业务
            .state('AgentService',{
                url:"/AgentService",
                views:{
                    '':{
                        templateUrl:'templates/Client/AgentService.html',
                        controller:'AgentServiceCtr'
                    }
                }
            })

            // 支付页
            .state('pag',{
                url:"/pag",
                params:{'order_number':null},
                cache:false,
                views:{
                    '':{
                        templateUrl:'templates/Client/pag.html',
                        controller:'pagCtr',
                    }
                }
            })
    })
