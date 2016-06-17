// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

//定义一个全局变量修改数据连接接口，服务端的为218.15.27.250:10080/houduan

var linkUrl="localhost/quanshun_houduan"//"localhost/quanshun_houduan";

angular.module('24EApp', [
                            'ionic',
                            'ngCordova',
                            '24EApp.appcontrollers',
                            '24EApp.appservices',
                            '24EApp.tyxcontrollers',
                            '24EApp.tyxroutes',
                            '24EApp.hjhcontrollers',
                            '24EApp.hjhroutes',
                            '24EApp.zw_controllers',
                            '24EApp.zw_routes',
                            '24EApp.ncontrollers',
                            '24EApp.nrouters',
                            '24EApp.zyzcontrollers',
                            '24EApp.zyzroutes',  
                            ])
    .config(['$ionicConfigProvider','$httpProvider', function($ionicConfigProvider,$httpProvider) {
         
         //使http服务支持post请求发送
         $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
         // Override $http service's default transformRequest
        $httpProvider.defaults.transformRequest = [function(data) {
            /**
             * The workhorse; converts an object to x-www-form-urlencoded serialization.
             * @param {Object} obj
             * @return {String}
             */
            var param = function(obj) {
                var query = '';
                var name, value, fullSubName, subName, subValue, innerObj, i;

                for (name in obj) {
                    value = obj[name];

                    if (value instanceof Array) {
                        for (i = 0; i < value.length; ++i) {
                            subValue = value[i];
                            fullSubName = name + '[' + i + ']';
                            innerObj = {};
                            innerObj[fullSubName] = subValue;
                            query += param(innerObj) + '&';
                        }
                    } else if (value instanceof Object) {
                        for (subName in value) {
                            subValue = value[subName];
                            fullSubName = name + '[' + subName + ']';
                            innerObj = {};
                            innerObj[fullSubName] = subValue;
                            query += param(innerObj) + '&';
                        }
                    } else if (value !== undefined && value !== null) {
                        query += encodeURIComponent(name) + '='
                                + encodeURIComponent(value) + '&';
                    }
                }

                return query.length ? query.substr(0, query.length - 1) : query;
            };

            return angular.isObject(data) && String(data) !== '[object File]'
                    ? param(data)
                    : data;
        }];
        
        $ionicConfigProvider.tabs.position('bottom'); // other values: top
        //$httpProvider.interceptors.push('UserInterceptor');

    }])
    .config(['$compileProvider', function($compileProvider){

            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|sms):/);
    }])

    .run(['$interval','$ionicHistory','$cordovaToast','$ionicPlatform', '$ionicPopup','$rootScope','$location','$timeout','$cordovaNetwork','$cordovaKeyboard','$http','$state','$ionicLoading','UserInfo',function ($interval,$ionicHistory,$cordovaToast,$ionicPlatform, $ionicPopup, $rootScope, $location,$timeout,$cordovaNetwork,$cordovaKeyboard,$http,$state,$ionicLoading,UserInfo) {
        //修改数据连接接口，服务端的为218.15.27.250:10080/houduan
        //linkUrl为全局变量，存放接口地址，放在app.js文件代码的最顶部
        $rootScope.url=linkUrl;
        $rootScope.realTimerNeedInitFlag=1;
        $ionicPlatform.ready(function () {
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }


        })

        $rootScope.popup={};
        $rootScope.popup.isPopup=false;
        //双击退出
        document.addEventListener("backbutton",function(e){
            e.preventDefault();

            function showConfirm() {  
                var confirmPopup = $ionicPopup.confirm({  
                    title: '<strong>退出应用?</strong>',  
                    template: '你确定要退出应用吗?',  
                    okText: '退出',  
                    cancelText: '取消'  
                });  
  
                confirmPopup.then(function (res) {  
                    if (res) {  
                        navigator.app.exitApp();  
                    } else {  
                        return; 
                    }  
                });  
            }
            if ($location.path() == '/Login'||$location.path()=='/orderTabs/receiveOrder/inform'||$location.path()=='/OneKeyOder'||$location.path()=='/vipm') {
                showConfirm();
            }
            else if($rootScope.popup.isPopup){
                $rootScope.popup.close();
                $rootScope.popup.isPopup=false;
            }
            else if($cordovaKeyboard.isVisible()){
                $cordovaKeyboard.close();  
            }
            else{
                $rootScope.$ionicGoBack();
            }  
            if($location.path() == '/Person'){
                $state.go("OneKeyOder");
            }
        },false);
        

        // $ionicPlatform.registerBackButtonAction(function (e) {
        //     e.preventDefault();
        //     //判断处于哪个页面时双击退出
        //     if ($location.path() == '/Login'||$location.path()=='/orderTabs/receiveOrder/inform'||$location.path()=='/OneKeyOder'||$location.path()=='/vipm') {
        //         if ($rootScope.backButtonPressedOnceToExit) {
        //             ionic.Platform.exitApp();
        //         } else {
        //             $rootScope.backButtonPressedOnceToExit = true;
        //             $cordovaToast.showShortBottom('再按一次退出系统');
        //             setTimeout(function () {
        //                 $rootScope.backButtonPressedOnceToExit = false;
        //             }, 2000);
        //         }
        //     }
        //     else if ($ionicHistory.backView()) {
        //         if ($cordovaKeyboard.isVisible()) {
        //             $cordovaKeyboard.close();
        //         } else {
        //             $rootScope.$ionicGoBack();
        //         }
        //     } else {
        //         $rootScope.backButtonPressedOnceToExit = true;
        //         $cordovaToast.showShortBottom('再按一次退出系统');
        //         setTimeout(function () {
        //             $rootScope.backButtonPressedOnceToExit = false;
        //         }, 2000);
        //     }
            
        //     return false;
        // }, 101);
        

        //登录拦截
        $rootScope.$on('$stateChangeStart',function(event, toState, toParams, fromState, fromParams){ 
            //$rootScope.user存放用户的session；
            //$rootScope.user={id:null,type:null,phone:null};
            
            //获取登录用户session，保存在全局变量$rootScope.user中;
            var promise=UserInfo.query();   // 同步调用，获得承诺接口; 
            promise.then(function(res){     //调用承诺API获取数据 .resolve
                $rootScope.user=res;
                //alert(res.ip);
                $http.get('http://'+linkUrl+'/index.php/Client/Login/getip?login_id='+$rootScope.user.id)
                .success(function(data){
                    //alert(data.ip);
                    if($rootScope.user.ip!=data.ip){
                        $http.get('http://'+linkUrl+'/index.php/Client/Login/clearsesstion')
                        .then(function(res){
                            $rootScope.user=false;
                            $ionicPopup.alert({title:"系统检测到您的号码在别处登录，请重新登录！"})
                            .then(function(){
                                $state.go('Login');
                            }) 
                                   
                        }) 
                    } 
                }) 
            },function(data){
                console.log('用户不存在');
            });
            
            // 如果用户不存在 
            if($rootScope.user==false){
                if(toState.name=='Login'){
                    return;// 如果是进入登录界面则允许
                }else if(toState.name=='Rule'){
                    return;
                }else{
                    event.preventDefault();// 取消默认跳转行为
                    $location.path("/Login");//跳转到登录界面
                    $ionicLoading.show({
                        template: "您未登录，请先登录后操作！",
                        noBackdrop: true, 
                        duration: 1500,  
                    })
                    
                }        
                
            }
            if($rootScope.user!=false&&$rootScope.user!=undefined){
                if(toState.name=='Login'){
                    event.preventDefault();
                }else{
                    return;
                }
            }    
            
            
        });
                

    }])




