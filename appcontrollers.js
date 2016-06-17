/**
 * Created by Administrator on 2016/5/4 0004.
 */
angular.module("24EApp.appcontrollers", [])

//公告信息
.controller('notiseCtrl',function($scope,$http){
    $http.get('http://'+linkUrl+'/index.php/Client/Order/getNotice')
    .success(function(res){
        $scope.notices=res;
    })
})
// 状态
    .controller('set-stateCtrl', ['$rootScope', '$scope', '$http', '$ionicLoading', '$timeout', 'fileReader', '$state', function ($rootScope, $scope, $http, $ionicLoading, $timeout, fileReader, $state) {
        $scope.user = {
            name: '司机，您好！',
            tel: '',
        };
        $timeout(function () {

            if ($rootScope.user) {
                $scope.user.tel = $rootScope.user.phone;
                $scope.flag = true;
            } else {
                $scope.flag = false;

            }
            //获取司机头像
            $http.get('http://' + $scope.url + '/index.php/Server/Index/getHeadimg?login_id=' + $rootScope.user.id).success(function (res) {

                $scope.paperImg = "http://" + $scope.url + res;
                $rootScope.paperhead = $scope.paperImg;
            })
        }, 20)
        //司机上传图片
        $scope.getFile = function (file) {

            fileReader.readAsDataUrl(file, $scope).then(function (result) {
                $scope.paperImg = result;
                var files = [];
                files.push(file);
                var fd = new FormData();
                angular.forEach(files, function (val, key) {
                    fd.append(key, val);

                });

                $http.post('http://' + $scope.url + '/index.php/Server/Index/uploadHead', fd, {
                    withCredentials: true,
                    headers: {'Content-Type': undefined},
                    transformRequest: angular.identity
                }).then(function (response) {
                    if (response.data) {
                        console.log('上传成功');
                    } else {
                        console.log('上传失败');
                        $scope.paperImg = $rootScope.paperhead;
                    }
                });
            });
        };


        $scope.exit = function () {
            $http.get('http://' + $scope.url + '/index.php/Client/Login/clearsesstion')
                .then(function (res) {
                    //console.log(res.data)
                    if (res.data) {
                        $scope.flag = false;
                        $rootScope.user = false;
                    }

                })
        }
        $scope.loginTip = function () {
            $ionicLoading.show({
                template: '亲，你还没登录喔，请先登录',
                noBackdrop: true,
                duration: 1500
            })
        }


    }])
    //设置状态
    .controller('StateCtrl', function ($scope, $ionicLoading, $http, $timeout) {
        $timeout(function () {
            $http.get("http://" + $scope.url + "/index.php/Server/Order/drive_status?login_id=" + $scope.user.id).success(function (data) {

                var status = data['drive_status'];
                if (status == 1) {
                    $scope.flag = true;
                } else {
                    $scope.flag = false;
                }
            })
        }, 10)


        //上班
        $scope.work = function () {
            $scope.flag = true;
            var status = 1;
            $http.get("http://" + $scope.url + "/index.php/Server/Order/editstatus?status=" + status + "&login_id=" + $scope.user.id).success(function (data) {
                console.log(data);
            })
        }
        //休息
        $scope.rest = function () {
            $scope.flag = false;
            var status = 2;
            $http.get("http://" + $scope.url + "/index.php/Server/Order/editstatus?status=" + status + "&login_id=" + $scope.user.id).success(function (data) {
                console.log(data);
            })
        }

    })
// 任务通知
    .controller('informCtrl', ['$rootScope', '$scope', '$ionicPopup', '$timeout', '$http', '$location', '$state', '$ionicLoading','$interval', function ($rootScope, $scope, $ionicPopup, $timeout, $http, $location, $state, $ionicLoading,$interval) {
        //预约订单处理
        // var interval=$interval(function(){
        //     $http.get("http://" + $scope.url + "/index.php/Server/Order/yuyueOrder?login_id=" + $rootScope.user.id)
        //     .success(function(res){
        //         if(res.status=="suc"){
        //             $ionicPopup.alert({title:res.msg})
        //             .then(function(){
        //                 $interval.cancel(interval);
        //             })
        //         }
        //     });
        // },60000)
        // if($rootScope.user.type!="drivevr"){
        //     $interval.cancel(interval);
        // }
        

        $timeout(function () {
            //查看司机接的单的状态
            $http.get("http://" + $scope.url + "/index.php/Server/Order/criteriaStatus?login_id=" + $rootScope.user.id
            )
                .success(function (data) {
                    //console.log(data);
                })
            //已经接到的单
            $http.get("http://" + $scope.url + "/index.php/Server/Order/presentOrder?login_id=" + $rootScope.user.id
            )
                .success(function (data) {
                    if (data.status == "hasOrder") {
                        $scope.orderTab = data.data;
                        $rootScope.address = data.data.bespoke_address;
                        $rootScope.telphone = data.data.telphone;
                        $rootScope.order_form=data.data.order_number;    

                    }
                    if (data.status == "expired") {
                        $ionicLoading.show({
                            "template": "您的订单已过期，请重新去接单！",
                            "noBackdrop": true,
                            "duration": 1500,
                        });
                        $scope.orderTab = null;
                    }
                    if (data.status == "null") {
                        $ionicLoading.show({
                            "template": "当前没有订单！",
                            "noBackdrop": true,
                            "duration": 1000,
                        });
                        $scope.orderTab = null;
                    }
                    ;

                })
        }, 10)

        //新任务订单
        $http.get("http://" + $scope.url + "/index.php/Server/Order/notice")
            .success(function (data) {
                $scope.orders = data;

            })

        //抢单

        $scope.gradOrder = function (orderid, x) {
            $http.get("http://" + $scope.url + "/index.php/Server/Order/grab_order?order_id=" + orderid + "&login_id=" + $rootScope.user.id)
                .success(function (data) {
                    if (data['result'] == "success") {
                        var popup = $ionicPopup.show({
                            template: "<p class='center'><i class='ion-android-car popupicon'></i></p>",
                            title: "<h3>恭喜您</h3>",
                            subTitle: '抢单成功',
                        });

                        $scope.orders[x].driver_id = data.order.driver_id;
                        if (data.order.order_type != 1) {
                            $scope.orderTab = data.order;
                            $rootScope.address = data.order.bespoke_address;
                            $rootScope.telphone = data.order.telphone;
                            $rootScope.order_form=data.order.order_number;
                        }
                        $timeout(function () {
                            popup.close();
                        }, 1500);

                    }
                    else {
                        if (data == 'error') {
                            $ionicLoading.show({
                                template: "该订单已被抢走",
                                noBackdrop: true,
                                duration: 1500
                            })
                        } else {
                            $ionicLoading.show({
                                template: data,
                                noBackdrop: true,
                                duration: 1500
                            })
                        }

                    }
                    ;
                })
        }

        //下拉刷新
        $scope.doRefresh = function () {
            //查看司机接的单的状态
            $http.get("http://" + $scope.url + "/index.php/Server/Order/criteriaStatus?login_id=" + $rootScope.user.id
            )
                .success(function (data) {
                    //已经接到的单
                    $http.get("http://" + $scope.url + "/index.php/Server/Order/presentOrder?login_id=" + $rootScope.user.id
                    )
                        .success(function (data) {
                            if (data.status == "hasOrder") {
                                $scope.orderTab = data.data;
                                $rootScope.address = data.data.bespoke_address;
                                $rootScope.destination = data.data.destination;
                                $rootScope.telphone = data.data.telphone;
                            }
                            if (data.status == "expired") {
                                $ionicLoading.show({
                                    "template": "您的订单已过期，请重新去接单！",
                                    "noBackdrop": true,
                                    "duration": 1500,
                                });
                                $scope.orderTab = null;
                            }
                            if (data.status == "null") {
                                $ionicLoading.show({
                                    "template": "当前没有订单！",
                                    "noBackdrop": true,
                                    "duration": 1000,
                                });
                                $scope.orderTab = null;
                            }
                            ;
                            //新任务订单
                            $http.get("http://" + $scope.url + "/index.php/Server/Order/notice")   //注意改为自己本站的地址，不然会有跨域问题
                                .success(function (data) {

                                    $scope.orders = data;
                                })
                                //结束刷新效果
                                .finally(function () {
                                    $scope.$broadcast('scroll.refreshComplete');
                                })
                        })
                })

        };


    }])
// 地图定位
    .controller('mapCtrl', ['$scope', '$rootScope', '$document', '$cordovaGeolocation', '$ionicLoading', '$ionicPopup', function ($scope, $rootScope, $document, $cordovaGeolocation, $ionicLoading, $ionicPopup) {
        $scope.flag = true;
        var lmap = $document[0].getElementById('l-map');
        var map = new BMap.Map(lmap);//在百度地图容器中创建一个地图

        function getLocation() {
            //获取地理位置

            createMap();

            function createMap() {
                //获取位置
                window.locationService.getCurrentPosition(function (position) { //百度sdk定位插件获取
                    $scope.flag = false;
                    var lat = position.coords.latitude;
                    var long = position.coords.longitude;
                    var ggpoint = new BMap.Point(long, lat);
                    map.centerAndZoom(ggpoint, 12);
                    var marker = new BMap.Marker(ggpoint);
                    map.addOverlay(marker);
                    var geoc = new BMap.Geocoder();
                    geoc.getLocation(ggpoint, function (rs) {
                        var addComp = rs.addressComponents;
                        var address=addComp.province + ", " + addComp.city + ", " + addComp.district + ", " + addComp.street + ", " + addComp.streetNumber;
                        $ionicPopup.alert({title:"当前位置："+address});
                    });
                }, function (e) {
                    var options = {
                        maximumAge: 5 * 60 * 1000,
                        timeout: 10 * 1000,
                        enableHighAccuracy: true,
                    };
                    $cordovaGeolocation.getCurrentPosition(options).then(function (position) {   //h5获取
                        $scope.flag = false;
                        var lat = position.coords.latitude; //纬度
                        var lon = position.coords.longitude; //经度
                        var ggpoint = new BMap.Point(lon, lat);//定义一个中心点坐标
                        var geoc = new BMap.Geocoder();
                        var convertor = new BMap.Convertor();
                        var pointArr = [];
                        pointArr.push(ggpoint);
                        //将谷歌地图的经纬度转化为百度地图的
                        convertor.translate(pointArr, 3, 5, function (data) {
                            if (data.status === 0) {
                                map.centerAndZoom(data.points[0], 12);
                                var marker = new BMap.Marker(data.points[0]);
                                map.addOverlay(marker);
                                geoc.getLocation(data.points[0], function (rs) {
                                    var addComp = rs.addressComponents;
                                    var address=addComp.province + ", " + addComp.city + ", " + addComp.district + ", " + addComp.street + ", " + addComp.streetNumber;
                                    $ionicPopup.alert({title:"当前位置："+address});
                                });
                            }
                        })
                    },function(error){
                        $scope.flag = false;
                        switch (error.code) {
                            case error.PERMISSION_DENIED:
                                $ionicPopup.alert({title:"用户拒绝对获取地理位置的请求。"})
                                break;
                            case error.POSITION_UNAVAILABLE:
                                $ionicPopup.alert({title:"位置信息是不可用的。"})
                                break;
                            case error.TIMEOUT:
                                $ionicPopup.alert({title:"请求用户地理位置超时。"})
                                break;
                            case error.UNKNOWN_ERROR:
                                $ionicPopup.alert({title:"位置获取不到,请检查您的网络是否可用"})
                                break;
                        }
                    })    
                });

                //添加定位控件
                var geolocationControl = new BMap.GeolocationControl({
                    anchor: BMAP_ANCHOR_TOP_RIGHT,
                });
                geolocationControl.addEventListener("locationSuccess", function (e) {
                    // 定位成功事件
                    map.clearOverlays();
                    var pt = e.point;
                    var marker = new BMap.Marker(pt);
                    map.addOverlay(marker);
                    geoc.getLocation(pt, function (rs) {
                        var addComp = rs.addressComponents;
                        var address = addComp.province + ", " + addComp.city + ", " + addComp.district + ", " + addComp.street + ", " + addComp.streetNumber;
                        $ionicPopup.alert({title: "当前定位地址为：" + address});
                    });
                });
                geolocationControl.addEventListener("locationError", function (e) {
                    // 定位失败事件
                    $ionicPopup.alert({title:e.message});
                });
                map.addControl(geolocationControl);
            }


        };
        getLocation();


    }])

// 联系客户
    .controller('clientsCtrl', ['$rootScope', '$scope', '$timeout', '$http', function ($rootScope, $scope, $timeout, $http) {
        //已经接到的单
        $scope.telphone = $rootScope.telphone;
        $scope.address = $rootScope.address;
    }])
// 实时计时器
    .controller('timerCtrl', ['$scope', '$rootScope', '$document', '$ionicPopup', '$timeout', '$location', '$stateParams', '$interval', '$http', '$cordovaGeolocation',function ($scope, $rootScope, $document, $ionicPopup, $timeout, $location, $stateParams, $interval, $http,$cordovaGeolocation) {
        var wmap = $document[0].getElementById('w-map');

        //---- 判断是否需要初始化变量 ----
        if ($rootScope.realTimerNeedInitFlag == 1) {
            initTimer();//初始化实时计时器
        }

        initMap();

        function initMap() {
            createMap();//创建地图
            setMapEvent();//设置地图事件
            //addMapControl();
            driving();
        }

        //---- 实时计价器初始化 ----
        function initTimer() {
            //---- 经纬度 初始化 ----
            getLastLngAndLat();

            //---- 距离 初始化 ----
            $rootScope.lastDistance = 0;
            $rootScope.newDistance = 0;
            $rootScope.showDistance = 0;

            $rootScope.classDistance = 10;//起始的阶段公里数(超过10公里,加收20元)

            //---- 时间 初始化 ----
            $rootScope.calcHour = 0;
            $rootScope.calcMinute = 0;
            $rootScope.calcSecond = 0;
            $rootScope.waitTime = 0;//停车等待时间(秒)

            //---- 展示的时间 初始化 ----
            $rootScope.showHour = '00';
            $rootScope.showMinute = '00';
            $rootScope.showSecond = '00';

            //---- 费用 初始化 ----
            getCalcFeeRules();
        }

        function createMap() {
            var map = new BMap.Map(wmap);//在百度地图容器中创建一个地图
            var point = new BMap.Point($rootScope.lastLng, $rootScope.lastLat);//定义一个中心点坐标
            map.centerAndZoom(point, 18);//设定地图的中心点和坐标并将地图显示在地图容器中
            window.map = map;//将map变量存储在全局
        }

        //地图事件设置函数：
        function setMapEvent() {
            map.enableDragging();//启用地图拖拽事件，默认启用(可不写)
            //map.enableScrollWheelZoom();//启用地图滚轮放大缩小
            //map.enableDoubleClickZoom();//启用鼠标双击放大，默认启用(可不写)
            map.enableKeyboard();//启用键盘上下左右键移动地图
        }

        //地图控件添加函数：
        function addMapControl() {
            //向地图中添加缩放控件
            var ctrl_nav = new BMap.NavigationControl({
                anchor: BMAP_ANCHOR_BOTTOM_RIGHT,
                type: BMAP_NAVIGATION_CONTROL_LARGE
            });
            map.addControl(ctrl_nav);
        }

        //驾车路线
        function driving() {
            var driving = new BMap.DrivingRoute(map, {
                onSearchComplete: yyy,
                renderOptions: {map: map, autoViewport: true}
            });
            driving.search($rootScope.address,$rootScope.destination);   //驾车查询
            function yyy(rs) {
                console.log("从光华北路到油城四路打车总费用为：" + "100元");     //计算出白天的打车费用的总价
            }
        }

        //********************** 计时处理 **********************
        //弹出计时器
        $scope.popup = $ionicPopup.show({
            template: "<div class='center'><button class='button button-fixed btn-calmm' ng-click='finishTimer()'>完成计时</button></div><div><ul class='timerList'><li class='item-i item-h'>时长</li><li class='item-i item-kilo'>里程</li><li class='item-i item-cash'>车费</li></ul><ul class='timerList timerList2'><li>{{showHour}}:{{showMinute}}:{{showSecond}}</li><li>{{showDistance}}公里</li><li>{{calcFee}}元</li></ul></div>",
            cssClass: 'timerpopup',
            scope: $rootScope
        });
        $scope.popup.isPopup = true;

        //---- 判断是否需要启动定时器 ----
        if ($rootScope.realTimerNeedInitFlag == 1) {
            //---- 定时器(1秒) 计算时间和距离 ----
            $rootScope.theRealtimerInterval = undefined;
            $rootScope.theRealtimerInterval = $interval(function () {
                //---- 每1秒 更新时间 ----
                updateShowTime();

                //---- 每10秒 重新计算距离 和 费用----
                if ($rootScope.calcSecond % 10 == 0) {
                    calcDistanceByLatAndLng();
                    calcFee();
                }
            }, 1000);

            $rootScope.realTimerNeedInitFlag = 0;//置零,等待到计时完成再置1
        }

        //$scope.$watch("realTimerFlag", function(newVal,oldVal) {
        // 关联: www\js\zyzroutes.js
        // 关联: www\js\zyzcontrollers.js
        // 关联: www\templates\Serve\receiveOrder.html
        //    if (newVal == 0) {
        //        //this.cancel = function(){
        //        //    $interval.cancel(timer);
        //        //};
        //        $interval.cancel(thisRealtimer);
        //        alert("页面退出清定时器");
        //        alert(thisRealtimer);
        //    }
        //});

        //---- 退出此页面时的操作 ----
        $scope.$on("$destroy",function( event ) {
                //$interval.cancel(thisRealtimer);
                $scope.popup.close();
          		$scope.popup.isPopup = false;
                
            }
        );

        //---- 获取 初始化的经纬度 ----
        function getLastLngAndLat() {
            window.locationService.getCurrentPosition(function (pos) {

                $rootScope.lastLng = pos.coords.longitude;
                $rootScope.lastLat = pos.coords.latitude;
                // alert('lastLng:' + $rootScope.lastLng + ',lastLat' + $rootScope.lastLat)
            }, function (e) {
                $cordovaGeolocation.getCurrentPosition(function (pos) {    
                    $rootScope.lastLng = pos.coords.longitude;
                    $rootScope.lastLat = pos.coords.latitude;
                    
                });
                // alert('初始化抛错:' + JSON.stringify(e))
            });
        }

        //---- 获取 当前的价格规则 ----
        function getCalcFeeRules() {
            $http.get('http://' + $scope.url + '/index.php/Server/Order/getCaclFeeRules').success(function (data) {
                $rootScope.calcFee = data.startFee;
            })
        }

        //---- 每1秒 更新显示时间 ----
        function updateShowTime() {
            $rootScope.calcSecond++;

            //---- 调整 分:秒 ----
            if ($rootScope.calcSecond == 60) {
                $rootScope.calcSecond = 0;
                $rootScope.calcMinute++;
            }

            //---- 调整 时:分 ----
            if ($rootScope.calcMinute == 60) {
                $rootScope.calcMinute = 0;
                $rootScope.calcHour++;
            }

            //---- 显示 秒 ----
            if ($rootScope.calcSecond < 10) {
                $rootScope.showSecond = '0' + $rootScope.calcSecond;
            } else {
                $rootScope.showSecond = $rootScope.calcSecond;
            }

            //---- 显示 分 ----
            if ($rootScope.calcMinute < 10) {
                $rootScope.showMinute = '0' + $rootScope.calcMinute;
            } else {
                $rootScope.showMinute = $rootScope.calcMinute;
            }

            //---- 显示 时 ----
            if ($rootScope.calcHour < 10) {
                $rootScope.showHour = '0' + $rootScope.calcHour;
            } else {
                $rootScope.showHour = $rootScope.calcHour;
            }
        }

        ////---- 根据经纬度计算两点距离(旧) ----
        //function calcDistanceByLatAndLng() {
        //    window.locationService.getCurrentPosition(function (pos) {
        //        var nowLng = pos.coords.longitude;
        //        var nowLat = pos.coords.latitude;
        //
        //        //---- 近似的地球半径(千米) ----
        //        var earthRadius = 6378.137;
        //        //---- 圆周率 ----
        //        var pi = 3.1415926535898;
        //
        //        //---- 角度转换为弧度 ----
        //        var lastLng = ($rootScope.lastLng * pi) / 180;
        //        var lastLat = ($rootScope.lastLat * pi) / 180;
        //
        //        nowLng = (nowLng * pi) / 180;
        //        nowLat = (nowLat * pi) / 180;
        //
        //        //---- 使用半正矢公式计算距离 ----
        //        var calcLongitude = nowLng - lastLng;
        //        var calcLatitude = nowLat - lastLat;
        //        var stepOne = Math.pow(Math.sin(calcLatitude / 2), 2) + Math.cos(lastLat) * Math.cos(nowLat) * Math.pow(Math.sin(calcLongitude / 2), 2);
        //        var stepTwo = 2 * Math.asin(Math.min(1, Math.sqrt(stepOne)));
        //        $rootScope.newDistance = Math.round(earthRadius * stepTwo) + $rootScope.lastDistance;
        //
        //        $rootScope.lastLng = nowLng;
        //        $rootScope.lastLat = nowLat;
        //
        //    }, function (e) {
        //        //alert(JSON.stringify(e))
        //    });
        //}

        //---- 根据经纬度计算两点距离 ----
        function calcDistanceByLatAndLng() {
            window.locationService.getCurrentPosition(function (pos) {
                var nowLng = pos.coords.longitude;
                var nowLat = pos.coords.latitude;

                // alert('nowLng:' + nowLng + ',nowLat' + nowLat);

                //---- point(lng,lat) ----
                var pointA = new BMap.Point($rootScope.lastLng, $rootScope.lastLat);
                var pointB = new BMap.Point(nowLng, nowLat);

                //var calcDistance = (map.getDistance(pointA, pointB) / 1000).toFixed(2);//获取两点距离,保留小数点后两位(米)
                //calcDistance = Number(calcDistance);//转换字符串类型为浮点数
                var calcDistance = 0;
                calcDistance = (map.getDistance(pointA, pointB)) / 1000;//获取两点距离,保留小数点后两位(米)

                $rootScope.newDistance = $rootScope.lastDistance + calcDistance;

                if ($rootScope.newDistance != 0) {
                    $rootScope.showDistance = $rootScope.newDistance.toFixed(2);
                }

                $rootScope.lastLng = nowLng;
                $rootScope.lastLat = nowLat;

                // map.centerAndZoom(pointB, 18);//设定地图的中心点和坐标并将地图显示在地图容器中

            }, function (e) {
                // alert('计算中抛错:' + JSON.stringify(e))
            });
        }

        //---- 计算 费用 ----
        function calcFee() {
            //---- 计算公里费用 (10公里内起步价,超出后每 5公里加 20 元)----
            if ($rootScope.lastDistance > $rootScope.classDistance) {
                $rootScope.classDistance += 5;
                $rootScope.calcFee += 20;//多收20元
            }

            //---- 距离相等时 认为是停车等待 开始等待计时----
            if ($rootScope.lastDistance == $rootScope.newDistance) {
                //---- 10秒累计 ----
                $rootScope.waitTime += 10;

                //---- 超出30分钟(多收20元) ----
                if ($rootScope.waitTime >= 1800) {
                    $rootScope.calcFee += 20;
                    $rootScope.waitTime = 0;//清30分钟,进行下一次30分钟计算
                }
            }

            //---- 覆盖新的距离 ----
            $rootScope.lastDistance = $rootScope.newDistance;
        }

        //---- 页面退出时操作 ----
        //$scope.$on('$ionicView.beforeLeave', function() {
        //    $interval.cancel(timer);
        //    alert("页面退出清定时器");
        //});

        //$scope.onRealTimerSelected = function () {
        //    initTimer();//初始化实时计时器
        //    initMap();
        //    alert("页面选择");
        //};
        //
        //$scope.onRealTimerDeselected = function () {
        //    $interval.cancel(timer);
        //    alert("页面退出清定时器");
        //};
        //完成计时，更新实际价格
        $rootScope.finishTimer=function(){
            $interval.cancel($rootScope.theRealtimerInterval);//关停定时器
            $rootScope.realTimerNeedInitFlag = 1;//下一次需要初始化(置1)

            $http({
                url:'http://' + $scope.url + '/index.php/Server/Order/saveRealprice',
                method:"POST",
                data:{real_price:$rootScope.calcFee,
                      order_form:$rootScope.order_form,  
                },
            }).success(function(res){
                if(res=="success"){
                    $rootScope.order_form=null;
                    $rootScope.telphone=null;
                    $rootScope.address=null;
                    $ionicPopup.alert({title:"计费完成，价格为："+$rootScope.calcFee})
                    .then(function(){
                        $scope.popup.close();
                        $scope.popup.isPopup = false;
                    })
                    
                }else{
                    $ionicPopup.alert({title:res})
                    .then(function(){
                        $scope.popup.close();
                        $scope.popup.isPopup = false;
                    });
                    
                }
                
            })
        }

    }]);