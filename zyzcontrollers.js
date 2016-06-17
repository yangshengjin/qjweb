/**
 * Created by Administrator on 2016/5/4 0004.
 */
angular.module("24EApp.zyzcontrollers", [])

    .controller('myorderCtrl', function ($scope, $http, $rootScope, $state, $interval,$ionicLoading) {
        $scope.goto=function(order_number){
            
            $http({
                url:"http://" + $scope.url + "/index.php/Server/Order/roborder",
                method:"POST",
                data:{
                    'order_number':order_number,
                    'login_id':$rootScope.user.id,
                },
            })
            .success(function (data) {
                console.log(data);
                if(data.status=="delay"){
                    $ionicLoading.show({
                        template: "该预约订单还没到时间",
                        noBackdrop: true,
                        duration: 1500
                    })
                }
                else{
                    if(data.status=="success"){
                        $rootScope.address = data.data.bespoke_address;
                        $rootScope.destination = data.data.destination;
                        $rootScope.telphone = data.data.telphone;
                    }
                    $state.go("orderTabs.receiveOrder.inform");
                }
                
            });
        }
        //当前订单
        $scope.selecton = function () {

            $http.get("http://" + $scope.url + "/index.php/Server/Order/currentOrder?login_id=" + $rootScope.user.id)
                .success(function (data) {

                    $scope.orders = data.data;
                    if (!data.data) {
                        $scope.displaystatus = true;
                    } else {
                        $scope.displaystatus = false;
                    }
                });

        }

    })

    .controller('mycurrentCtrl', function ($scope, $http, $rootScope,$timeout) {
        $scope.hasmore=true;    //上拉加载动画
        var run = false;        
        var obj = {current:0,count:8,id:$rootScope.user.id};
        var result = chushihua(obj,1);
            //下拉加载
            $scope.loadMore = function(){
                var old = $scope.currents;
                if(old!=undefined){
                  var result = chushihua(obj,3); 
                }
                $timeout(function(){
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                },500);   
                
            }; 
            function chushihua(obj_data,state){
                if(!run){
                  run = true;
                  // 历史订单
                  $http({
                        method:'GET',
                        url:"http://" + $scope.url + "/index.php/Server/Order/history_order",
                        params:obj_data,
                    }).success(function(data){
                        run = false;
                        if(state==3){
                            if (data==null||data.length==0) {
                              console.log("结束");
                              $scope.hasmore=false;
                            }else{
                              obj.current += obj.count;
                              $scope.currents= $scope.currents.concat(data); 
                            }
                            
                        }else{ 
                            $scope.currents=data;
                        }
                        for(var i=0; i<$scope.currents.length; i++) {
                            if($scope.currents[i]['pay_status'] == 0) {
                                $scope.currents[i]['pay_status_hans'] = "未支付";
                            } else {
                                $scope.currents[i]['pay_status_hans'] = "已支付";
                            }
                        }
                        if(!$scope.currents) {
                          $scope.displaystatus = true;
                        } else {
                          $scope.displaystatus = false;
                        }
                    })
                }
            }
        // 历史订单

        // $http.get("http://" + $scope.url + "/index.php/Server/Order/history_order?id=" + $rootScope.user.id)
        //     .success(function (data) {
        //         $scope.currents = data;
        //         if (!data) {
        //             $scope.displaystatus = true;
        //         } else {
        //             $scope.displaystatus = false;
        //         }
        //         for(var i=0; i<$scope.currents.length; i++) {
        //             if($scope.currents[i]['pay_status'] == 0) {
        //                 $scope.currents[i]['pay_status_hans'] = "未支付";
        //             } else {
        //                 $scope.currents[i]['pay_status_hans'] = "已支付";
        //             }
        //         }
        //     })


    })

    .controller('mycashCtrl', function ($timeout, $scope, $ionicLoading, $http, $rootScope, $ionicPopup, FloatStr, $state) {

        // 帐号余额
        $scope.account = {
            account_yue: '0.00'
        }
        $scope.onselect = function () {
            $timeout(function () {

                $http({
                    method: "GET",
                    url: "http://" + $scope.url + "/index.php/Server/Order/zhanghaoyue",
                    params: {'login_id': $rootScope.user.id},
                }).success(function (data) {
                    if (data == null || data == "") {
                        $scope.account.account_yue = 0.00;
                    } else {
                        $scope.account.account_yue = data.account_yue;
                    }
                });

                //提现记录
                $http.get("http://" + $scope.url + "/index.php/Server/Order/get_withdraw_list?login_id=" + $rootScope.user.id)
                    .success(function (res) {
                        if (res.result == 'success') {
                            $scope.cashs = res.obj;

                        }
                    })
                    .error(function (res) {
                        console.log(res);
                    })
            }, 10);
        }
        //余额提现
        $scope.setcash = function (number) {

            if (number == undefined) {
                $ionicLoading.show({
                    template: '请输入提现金额！',
                    noBackdrop: true,
                    duration: 1500,
                })
            } else if (number <= 0) {
                $ionicLoading.show({
                    template: '您输入的金额无效！',
                    noBackdrop: true,
                    duration: 1500,
                })
            } else if (number > $scope.account.account_yue) {
                $ionicLoading.show({
                    template: '您的余额不足！',
                    noBackdrop: true,
                    duration: 1500,
                })
            } else {
                number = FloatStr.getFloatStr(number);
                var popup = $ionicPopup.confirm({
                    template: "<p class='center'>您的提现金额为：￥" + number + "</p>",
                    title: "<h3>提现</h3>",
                    okText: '确定',
                    cancelText: '取消',
                })
                popup.then(function (res) {
                    if (res) {
                        $state.go('TakeCash', {money: number, account_yue: $scope.account.account_yue});
                    } else {
                        console.log('您已取消提现');
                    }
                })

            }
            ;
        }

    })

    .controller('TakeCashController', function ($rootScope, $scope, $ionicLoading, $stateParams, $http, $state, $timeout) {
        console.log($stateParams);
        $scope.CanTake = $stateParams.account_yue;
        $scope.money = $stateParams.money;
        $scope.count = 3;
        $scope.Sure = function (TakeCash_from) {

            if (TakeCash_from.realName.$$lastCommittedViewValue == undefined || TakeCash_from.realName.$$lastCommittedViewValue == "") {
                $ionicLoading.show({
                    template: "真实姓名不能为空",
                    noBackdrop: true,
                    duration: 1500
                })
            }

            else if (TakeCash_from.realName.$invalid) {
                $ionicLoading.show({
                    template: "请正确输入你的真实姓名",
                    noBackdrop: true,
                    duration: 1500
                })
            }
            if (TakeCash_from.AplayNum.$$lastCommittedViewValue == undefined || TakeCash_from.AplayNum.$$lastCommittedViewValue == "") {
                $ionicLoading.show({
                    template: "支付宝账号不能为空",
                    noBackdrop: true,
                    duration: 1500
                })
            }

            if (TakeCash_from.$valid) {
                $http({
                    method: 'POST',
                    url: "http://" + $scope.url + "/index.php/Server/Order/withdraw",
                    data: {
                        'login_id': $rootScope.user.id,
                        'money': $scope.money,
                        'alpay_account': TakeCash_from.AplayNum.$$lastCommittedViewValue,
                        'real_name': TakeCash_from.realName.$$lastCommittedViewValue,
                    },
                })
                    .success(function (res) {

                        if (res.result = 'success') {
                            // $scope.account.account_yue-=number;
                            // $scope.account.account_yue=FloatStr.getFloatStr($scope.account.account_yue);
                            // $scope.cashs.unshift(res.obj);
                            $ionicLoading.show({
                                template: "提现成功，正在审核，请耐心等待...",
                                noBackdrop: true,
                                duration: 1500
                            })
                            $timeout(function () {
                                $state.go("orderTabs.TaskNotice");
                            }, 1000);

                        }
                        if (res == 'nono') {
                            $ionicLoading.show({
                                template: '您的余额不足！',
                                noBackdrop: true,
                                duration: 1500,
                            })
                        }
                        if (res == 'beyond') {
                            $ionicLoading.show({
                                template: '您今天的提现次数已达到三次！',
                                noBackdrop: true,
                                duration: 1500,
                            })
                        }
                    })
                    .error(function (res) {
                        console.log(res);
                    })
            }
        }


    });

    ////---- 为了实现关停定时器  ----
    //.controller('receiveOrderCtrl', function ($rootScope,$scope) {
    //    $scope.onRealTimerSelected = function () {
    //        $rootScope.realTimerFlag = 1;
    //        //alert("页面选择");
    //    };
    //
    //    $scope.onRealTimerDeselected = function () {
    //        $rootScope.realTimerFlag = 0;
    //        alert("页面退出清定时器");
    //    };
    //});
