/**
 * Created by Administrator on 2016/5/4 0004.
 */
angular.module('24EApp.tyxcontrollers',[])

.controller('RouteCtrr',function($scope){

})


    //一键下单
    .controller('OneKeyOderCtr',function($http,$scope,$rootScope,$ionicPopup,$document,$ionicLoading,$cordovaGeolocation,$location,$interval,$state){
        var interval=$interval(function(){
            $http.get("http://" + $scope.url + "/index.php/Client/Order/detection")
            .success(function(res){
                if(res==1){
                    $ionicPopup.alert({title:"系统提醒你的订单已有司机接单了"})
                    .then(function(){
                        
                    })
                    $interval.cancel(interval);
                }
            });
            
        },5000);
        var intervalpay=$interval(function(){
            $http.get("http://" + linkUrl + "/index.php/Client/Order/detectionPay")
            .success(function(res){
                if(res){
                    $interval.cancel(intervalpay);
                    $ionicPopup.alert({title:"您有订单待支付，请前去支付"})
                    .then(function(){
                        $state.go("OrderManagement");
                    }) 
                }
            });
        },5000)

        $ionicLoading.show({
            template: "正在初始化地图，请稍等...",
            noBackdrop: true,
            duration: 1500
        });
        var Omap=$document[0].getElementById('Pmap');
        var map = new BMap.Map(Omap);
        createMap();//创建地图

        function createMap(){
            
            var aa= window.locationService.getCurrentPosition(function(position){ 
                var lat = position.coords.latitude;
                var long = position.coords.longitude;
                $rootScope.point = new BMap.Point(long, lat);
                map.centerAndZoom($rootScope.point, 12);
                var marker = new BMap.Marker($rootScope.point);
                map.addOverlay(marker);
               
            });

            if(aa==null){
                var options = {
                    maximumAge: 5 * 60 * 1000,
                    timeout: 10 * 1000,
                    enableHighAccuracy: true,
                };
                $cordovaGeolocation.getCurrentPosition(options).then(function(position) {    //h5地理定位
                    var lat = position.coords.latitude;
                    var long = position.coords.longitude;
                    $rootScope.point = new BMap.Point(long, lat);
                    map.centerAndZoom($rootScope.point, 12);
                    //alert(lat+"----"+long);
                    var geoc = new BMap.Geocoder();
                    var convertor = new BMap.Convertor();
                    var pointArr = [];
                    pointArr.push($rootScope.point);
                    //将谷歌地图的经纬度转化为百度地图的
                    convertor.translate(pointArr, 3, 5, function (data) {
                        if (data.status === 0) {
                            map.centerAndZoom(data.points[0], 18);
                            var marker = new BMap.Marker(data.points[0]);
                            map.addOverlay(marker);
                            geoc.getLocation(data.points[0], function (rs) {
                                var addComp = rs.addressComponents;
                                $ionicPopup.alert({title:addComp.province + ", " + addComp.city + ", " + addComp.district + ", " + addComp.street + ", " + addComp.streetNumber});
                            });
                        }
                    })
                })
            }
            else{
                $ionicPopup.alert({title:"获取位置失败"});                
            }
        }

    })

    //正在拍单
    .controller('OneKeyOderLaterCtr',function($scope,$location,$ionicPopup,$http,$rootScope,$document,$timeout,$filter,$state,$ionicLoading,$interval,$cordovaGeolocation){
        //每次进入拍单页面获取位置信息
        window.locationService.getCurrentPosition(function(pos){
            $rootScope.lon = pos.coords.longitude;
            $rootScope.lat = pos.coords.latitude;
        },function(e){
            var options = {
                maximumAge: 5 * 60 * 1000,
                timeout: 10 * 1000,
                enableHighAccuracy: true,
            };
            $cordovaGeolocation.getCurrentPosition(options).then(function(position) {    //h5地理定位
                $rootScope.lat = position.coords.latitude;
                $rootScope.lon = position.coords.longitude;
            },function(e) {

            });
        });
        
        $scope.showConfirm=function(){
            $ionicPopup.show({
                title:'<h2 class="pd-H2">温馨提示</h2>',
                template:'<span class="pd-span1">全顺正在联络代驾司机为您服务，确定</span><p class="pd-P">现在取消订单？</p>',
                scope: $scope,
                cssClass :"OneKeyOderLater",
                buttons:[
                     {text:"确定",
                      onTap: function() {
                         $scope.flag = true;
                      }
                    },
                     {text:"继续等待",
                      type:"button-positive",
                      onTap: function() {
                         $scope.flag = false;
                      }
                    }
                ]
            }).then(function() {
                var timer = $timeout(function() {
                                if($scope.flag) {
                                    $http({
                                        method: 'GET',
                                        url: "http://"+$scope.url+"/index.php/Client/OneKeyOrder/cancelorder",
                                        params: {
                                            "buttonsflag": $scope.flag,
                                            "id": $rootScope.user.id
                                        }
                                    }).success(function(res) {
                                        if(res) {
                                            $ionicLoading.show({
                                                template:"订单已取消",
                                                noBackdrop:true,
                                                duration:1500
                                            });
                                        } else {
                                            $ionicLoading.show({
                                                template:"没有订单可以取消",
                                                noBackdrop:true,
                                                duration:1500
                                            });
                                        }
                                    });
                                }
                                $timeout.cancel(timer);
                            }, 100);
            });
        };

        var Omap=$document[0].getElementById('allmap');
        var map = new BMap.Map(Omap);

        function createMap(){
            map.centerAndZoom($rootScope.point, 12);
        }
        function initMap(){
            createMap();//创建地图
            addMapControl();
        }

        //地图控件添加函数：
        function addMapControl(){
            // 添加定位控件
            var geolocationControl = new BMap.GeolocationControl({
                anchor:BMAP_ANCHOR_BOTTOM_RIGHT
            });

            geolocationControl.addEventListener("locationSuccess", function(e){
                // 定位成功事件
                var from = e.addressComponent.city + e.addressComponent.district +
                 e.addressComponent.street + e.addressComponent.streetNumber;
                // $scope.from = e.addressComponent.district + e.addressComponent.street;
                $scope.distinct = e.addressComponent.city;
                $ionicPopup.alert({title: "当前定位地址为：" + from});
                // $scope.from_location = e.point;
            });
            geolocationControl.addEventListener("locationError",function(e){
                // 定位失败事件
                //alert(e.message);
            });
            map.addControl(geolocationControl);
        }

        initMap();

        $scope.order = function() {
            var geoc = new BMap.Geocoder();
            if($rootScope.lon !== undefined && $rootScope.lat !== undefined) {
                var c = new BMap.Point($rootScope.lon, $rootScope.lat);
                geoc.getLocation(c, function(res) {
                    $scope.from = res.address;
                    var d = $scope.destinationmodel;
                    var q, output_start_location;
                    geoc.getPoint(d, function(res) {
                        output_start_location = res;
                        if(c) {
                            if(d) {
                                var orderdate = new Date();
                                var usertime = $filter('date')(orderdate, 'HH:mm:ss');
                                var f, f1;

                                $http.get('http://'+$scope.url+'/index.php/Client/OneKeyOrder/getprice?time='+usertime)
                                    .success(function(res) {
                                        $scope.price = parseInt(res);
                                        f1 = Math.floor((map.getDistance(output_start_location, 
                                            c)) / 1000);
                                        if(f1<1) {
                                            f = 1;
                                        } else {
                                            f = f1;
                                        }
                                        if(f <= 10) {
                                            $scope.preestimateprice = $scope.price;
                                        } else {
                                            $scope.preestimateprice = $scope.price + Math.ceil((f-10)/5) * 20;
                                        }

                                        var tel = $rootScope.user.phone;
                                        var orderdateformated = $filter('date')(orderdate, 
                                            'yyyy-MM-dd HH:mm:ss');
                                        var e = $scope.preestimateprice;

                                        if(e) {
                                            $ionicPopup.show({
                                                title:'<h2 class="pd-H2">订单确定</h2>',
                                                template:'<span class="pd-span1">此次代驾预计路程为'+f+'公里,价格为'+e+'元</span><p class="pd-P">确定下单？</p>',
                                                scope: $scope,
                                                cssClass :"OneKeyOderLater",
                                                buttons:[
                                                     {text:"确定",
                                                      onTap: function() {
                                                         $scope.flag_order = true;
                                                      }
                                                    },
                                                     {text:"取消",
                                                      type: "button-calm",
                                                      onTap: function() {
                                                         $scope.flag_order = false;
                                                      }
                                                    }
                                                ]
                                            }).then(function() {
                                                if($scope.flag_order === true) {
                                                    $http({
                                                        method: "GET",
                                                        url: "http://"+$scope.url+"/index.php/Client/OneKeyOrder/onekeyorder",
                                                        params: {
                                                            "id": $rootScope.user.id,
                                                            "tel": tel,
                                                            "date": orderdateformated,
                                                            "from": $scope.from,
                                                            "destination": d,
                                                            "distance": f,
                                                            "estimateprice": e
                                                        }
                                                    }).success(function(res) {
                                                        if(res !== false){
                                                            $ionicPopup.alert({title: "拍单成功"})
                                                            .then(function() {
                                                                var interval=$interval(function(){
                                                                    $http.get("http://" + $scope.url + "/index.php/Client/Order/detection")
                                                                    .success(function(res){
                                                                        if(res==1){

                                                                            $ionicPopup.alert({title:"系统提醒你的订单已有司机接单了"})
                                                                            .then(function(){
                                                                                $interval.cancel(interval);
                                                                            })

                                                                            
                                                                        }
                                                                    });
                                                                },3000) 
                                                    

                                                                $http({
                                                                    url:'http://'+$scope.url+'/index.php/Client/DuanXin/payDuan',
                                                                    method:'POST',
                                                                    data:{
                                                                        'phone':$rootScope.user.phone
                                                                    }
                                                                }).success(function(res){
                                                                    console.log("短信发送成功");
                                                                    $state.go('OneKeyOder');
                                                                }).error(function(res){
                                                                    console.log("短信发送失败");
                                                                    $state.go('OneKeyOder');
                                                                })
                                                            });
                                                        } else {
                                                            $ionicPopup.alert({title: "当前订单未完成"});
                                                        }
                                                    });
                                                }
                                            });
                                            
                                        } else {
                                            $ionicPopup.alert({title:
                                                "拍单失败"});
                                        }
                                });
                                map.clearOverlays();
                                driving = new BMap.DrivingRoute(map, {renderOptions:
                                 {map: map, autoViewport: true}}); 
                                driving.search(c, output_start_location);
                                
                            } else {
                                $ionicLoading.show({
                                    template: "请先输入目的地",
                                    noBackdrop: true,
                                    duration: 1500
                                });
                            }
                        } else {
                            $ionicLoading.show({
                                template: "请先进行地位",
                                noBackdrop: true,
                                duration: 1500
                            });
                        }
                    }, $scope.distinct);
               
                });
            } else {
                $ionicPopup.alert({title: "未知错误，请返回后重新进入拍单页面"});
            }
            
        };

        $scope.getItems = function (item) {
            $timeout(function () {
                $scope.mapitems = item;
            }, 500)
        };

        //获取目的地（发送到api计算距离）
        function mapSelect1(id) {
            var muArray = $scope.mapitems;
            if (muArray != undefined) {
                $scope.destinationmodel = id;
            }
        }

        //打开目的地弹窗页面
        $scope.account = function () {
            $rootScope.popup = $ionicPopup.show({
                cssClass: 'myPopup',
                templateUrl: 'templates/Client/mudidi.html',
                scope: $scope
            });
            $rootScope.popup.isPopup=true;

        };

        //关闭目的地弹窗页面
        $scope.pSelect = function () {
            $rootScope.popup.close();
            $rootScope.popup.isPopup=false;
        };

        //获取目的地
        $scope.MSelect = function (id) {
            $scope.destinationmodel = id;
            mapSelect1(id);
            $rootScope.popup.close();
            $rootScope.popup.isPopup=false;
        };
    })

//代叫
    .controller('DaiJiaoCtr',function($scope,$ionicActionSheet,$http,$ionicModal,$ionicPopup,$rootScope,$filter,$timeout,$state,$document,$stateParams,$ionicLoading,$cordovaContacts, $ionicPlatform,$location,$interval) {
        /*智能筛选->方法在appservices的mapSuggestion指令*/
        $scope.getItems = function (item) {
            $timeout(function () {
                $scope.mapitems = item;
            }, 500)
        };

        $scope.nb = '1';
        $scope.items = {
            firstname: '司机数量', secondname: '联系电话',
            thirdname: '出发地', fourthname: '目的地',
            fifthname: '预估价'
        };
        //联系电话
        $ionicModal.fromTemplateUrl("templates/Client/daijiao-tel.html", {
            scope: $scope,
            animation: "slide-in-right"
        }).then(function (modal) {
            $scope.modal = modal;
        });
        $scope.openTelModal = function () {
            $scope.modal.show();
        };
        $scope.closeTelModal = function (myForm) {
            //console.log(myForm.telphone)
            if (myForm.telphone.$$lastCommittedViewValue == undefined || myForm.telphone.$$lastCommittedViewValue == "") {
                //alert("不能为空")
                $ionicPopup.alert({
                    title: '<h3>抱歉</h3>',
                    template: '<span>电话号码不能为空</span>',
                    cssClass: 'telClass',
                    buttons: [{
                        text: '我知道了'
                    }]
                })
            }

            else if (myForm.telphone.$invalid) {
                //alert("djlk")
                $ionicPopup.alert({
                    title: '<h3>抱歉</h3>',
                    template: '<span>请输入正确的手机号码</span>',
                    cssClass: 'telClass',
                    buttons: [{
                        text: '我知道了'
                    }]
                })
            }

            if (myForm.$valid) {
                //alert("ok")
                $scope.modal.hide();
            }
            //$scope.modal.hide();
            $scope.telphone = myForm.telphone.$$lastCommittedViewValue;

        };
        $scope.claseM = function () {
            $scope.modal.hide();
        };
        //Cleanup the modal when we are done with it!
        $scope.$on("$destroy", function () {
            $scope.modal.remove();
        });
        // Execute action on hide modal
        $scope.$on("modal.hidden", function () {
            // Execute action
        });
        // Execute action on remove modal
        $scope.$on("modal.removed", function () {
            // Execute action
        });

        //导入电话本
        //$scope.addContact = function () {
        //    $cordovaContacts.save($scope.contactForm).then(function (result) {
        //        // Contact saved
        //    }, function (err) {
        //        // Contact error
        //    });
        //};
        //
        //$scope.getAllContacts = function () {
        //    $cordovaContacts.find().then(function (allContacts) { //omitting parameter to .find() causes all contacts to be returned
        //        $scope.contacts = allContacts;
        //    })
        //};
        //
        //$scope.findContactsBySearchTerm = function (searchTerm) {
        //    var opts = {                                           //search options
        //        filter: searchTerm,                                 // 'Bob'
        //        multiple: true,                                      // Yes, return any contact that matches criteria
        //        fields: ['displayName', 'name'],                  // These are the fields to search for 'bob'.
        //        desiredFields: [id]  //return fields.
        //    };
        //    //console.log(desiredFields)
        //
        //    if ($ionicPlatform.isAndroid()) {
        //        opts.hasPhoneNumber = true;         //hasPhoneNumber only works for android.
        //    }
        //    ;
        //
        //    $cordovaContacts.find(opts).then(function (contactsFound) {
        //        $scope.contacts = contactsFound;
        //    })
        //}
        //
        //$scope.pickContactUsingNativeUI = function () {
        //    $cordovaContacts.pickContact().then(function (contactPicked) {
        //        $scope.contact = contactPicked;
        //    })
        //}

        //上拉菜单
        $scope.show = function () {
            $ionicActionSheet.show({
                buttons: [
                    {text: '1'},
                    {text: '2'}
                ],
                buttonClicked: function (index) {
                    if (index == 0) {
                        $scope.nb = '1';
                        return true;
                    }
                    if (index == 1) {
                        $scope.nb = '2';
                        return true;
                    }
                },
                cssClass: 'daijiaoAc'
            })
        };
        //下单
        var daijiaomap = $document[0].getElementById('daijiaomap');
        var map = new BMap.Map(daijiaomap);

        function createMap() {
            var point = new BMap.Point(113.307, 23.120);
            map.centerAndZoom(point, 15);
        }

        createMap();

        $scope.myform = {};
        $scope.order = function (myform) {
            var tel = $scope.telphone;
            var a = $scope.myform.djfrom;
            var b = $scope.myform.djdestination;

            var orderdate = new Date();
            var orderdateformated = $filter('date')(orderdate, 'yyyy-MM-dd HH:mm:ss');
            var usertime = $filter('date')(orderdate, 'HH:mm:ss'); 
            var geoc = new BMap.Geocoder();
            if (tel) {
                if (a) {
                    if (b) {
                        geoc.getPoint(a, function(res) {
                            if(res == null) {
                                $ionicPopup.alert({title: "代叫失败"});
                                return false;
                            }
                            var output_start_location = res;
                            geoc.getPoint(b, function(res) {
                                if(res == null) {
                                    $ionicPopup.alert({title: "代叫失败"});
                                    return false;
                                }
                                var output_destination_location = res;
                                var f1 = Math.floor((map.getDistance(output_start_location, 
                                                output_destination_location)) / 1000);
                                var f;
                                if(f1<1) {
                                    f = 1;
                                } else {
                                    f = f1;
                                }
                                $http.get('http://'+$scope.url+'/index.php/Client/OneKeyOrder/getprice?time='+usertime)
                                    .success(function(res) {
                                        $scope.price = parseInt(res);
                                        if (f <= 10) {
                                            $scope.preestimateprice = $scope.price;
                                        } else {
                                            $scope.preestimateprice = $scope.price + Math.ceil((f - 10) / 5) * 20;
                                        }
                                        if ($scope.preestimateprice) {
                                            $ionicPopup.show({
                                                title:'<h2 class="pd-H2">订单确定</h2>',
                                                template:'<span class="pd-span1">此次代驾预计路程为'+f+'公里,价格为'+$scope.preestimateprice+'元</span><p class="pd-P">确定下单？</p>',
                                                scope: $scope,
                                                cssClass :"OneKeyOderLater",
                                                buttons:[
                                                     {text:"确定",
                                                      onTap: function() {
                                                         $scope.flag_order = true;
                                                      }
                                                    },
                                                     {text:"取消",
                                                      type: "button-calm",
                                                      onTap: function() {
                                                         $scope.flag_order = false;
                                                      }
                                                    }
                                                ]
                                            }).then(function() {
                                                if($scope.flag_order === true) {
                                                    $http({
                                                        method: "GET",
                                                        url: "http://" + $scope.url + "/index.php/Client/OneKeyOrder/daijiao",
                                                        params: {
                                                            'userid': $rootScope.user.id,
                                                            'tel': tel,
                                                            'from': a,
                                                            'to': b,
                                                            'price': $scope.preestimateprice,
                                                            'distance': f,
                                                            'date': orderdateformated
                                                        }
                                                    }).success(function (res) {
                                                            if (res.result = "success") {
                                                                $ionicPopup.alert({title: "代叫成功"})
                                                                    .then(function () {
                                                                        var interval=$interval(function(){
                                                                                $http.get("http://" + $scope.url + "/index.php/Client/Order/detection")
                                                                                .success(function(res){
                                                                                    if(res==1){
                                                                                        $ionicPopup.alert({title:"系统提醒你的订单已有司机接单了"})
                                                                                        .then(function(){
                                                                                            $interval.cancel(interval);
                                                                                        })
                                                                                    }
                                                                                });
                                                                            },3000)           

                                                                        //$state.go("pag", {"order_number": res.order_number});
                                                                         $http({
                                                                            url:'http://'+$scope.url+'/index.php/Client/DuanXin/payDuan',
                                                                            method:'POST',
                                                                            data:{
                                                                                'phone':$rootScope.user.phone
                                                                            }
                                                                        }).success(function(res){
                                                                            console.log("短信发送成功");
                                                                            $state.go('OneKeyOder');
                                                                        }).error(function(res){
                                                                            console.log("短信发送失败");
                                                                            $state.go('OneKeyOder');
                                                                        })
                                                                    });
                                                            } else {
                                                                $ionicPopup.alert({title: "代叫失败"});
                                                            }
                                                        }).error(function () {
                                                            $ionicPopup.alert({title: "代叫失败"});
                                                        });
                                                }
                                            });    
                                        } else {
                                            $ionicPopup.alert({title: "代叫失败"});
                                        }
                                }); 
                            }, "桂林市");
                        }, "桂林市");
                        
                    } else {
                        $ionicLoading.show({
                            template: "请先输入目的地",
                            noBackdrop: true,
                            duration: 1500
                        });
                    }
                } else {
                    $ionicLoading.show({
                        template: "请先输入出发地",
                        noBackdrop: true,
                        duration: 1500
                    });
                }
            } else {
                $ionicLoading.show({
                    template: "请先输入电话号码",
                    noBackdrop: true,
                    duration: 1500
                });
            }
        };

        //获取出发地（发送到api计算距离）
        var mapSelect = function (id) {
            //console.log(2222)
            var pp = $scope.mapitems;
            console.log(pp);
            if (pp != undefined) {
                $scope.myform.djfrom = id;
            }
        };

        //获取目的地（发送到api计算距离）
        function mapSelect1(id) {
            var muArray = $scope.mapitems;
            console.log(muArray);
            if (muArray != undefined) {
                $scope.myform.djdestination = id;
            }
        }

        //打开目的地弹窗页面
        $scope.account = function () {
            $rootScope.popup = $ionicPopup.show({
                cssClass: 'myPopup',
                templateUrl: 'templates/Client/mudidi.html',
                scope: $scope
            });

           $rootScope.popup.isPopup=true;
        
        };

        //关闭目的地弹窗页面
        $scope.pSelect = function () {
            $rootScope.popup.close();
            $rootScope.popup.isPopup=false;
        };

        //获取目的地
        $scope.MSelect = function (id) {
            $scope.myform.djdestination = id;
            mapSelect1(id);
            $rootScope.popup.close();
            $rootScope.popup.isPopup=false;
        };

        //打开出发地弹窗页面
        $scope.chufadi = function () {
            $rootScope.popup = $ionicPopup.show({
                cssClass: 'myPopup',
                templateUrl: 'templates/Client/chufadi.html',
                scope: $scope
            });

            $rootScope.popup.isPopup=true;

        };

        //关闭出发地弹窗页面
        $scope.cSelect = function () {
            $rootScope.popup.close();
            $rootScope.popup.isPopup=false;
        };


        //获取出发地
        $scope.CSelect = function (id) {
            $scope.myform.djfrom = id;
            mapSelect(id);
            $rootScope.popup.close();
            $rootScope.popup.isPopup=false;
        }
        
    })



//订单管理PriceListCtr

.controller('OrderManagementCtr',function($scope,$http,$state,$rootScope,$timeout,$ionicPopup,$ionicLoading,$timeout){
        
        var run = false;
        var obj = {current:0,count:8};
        $scope.on_select = function(status){
                $scope.hasmore=true; 
                obj.current=0;
                obj.status=status;
                obj.userid=$rootScope.user.id;
                
                var result = chushihua(obj,1); 
        };
        //下拉加载
        $scope.loadMore = function(status){
            var old = $scope.items;
            obj.status=status;
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
              $http({
                    method:'GET',
                    url:'http://'+$scope.url+'/index.php/Client/Order/get_orders',
                    params:obj_data,
                }).success(function(data){
                    run = false;
                    if(state==3){
                        if (data==null||data.length==0) {
                          console.log("结束");
                          $scope.hasmore=false;
                        }else{
                          obj.current += obj.count;
                          $scope.items= $scope.items.concat(data); 
                        }
                        
                    }else{
                        $scope.items=data;
                    }
                    if(!$scope.items) {
                      $scope.displaystatus = true;
                    } else {
                      $scope.displaystatus = false;
                    }
                    //console.log(data);
                })
            }
        }

        /*-----------取消订单----------------*/
        $scope.cancelOrder=function(orderform){
            $ionicPopup.confirm({
                "title":"您是否取消该订单？",
                 okText: "确定",
                 cancelText: "取消"
            }).then(function(res){
                if(res){
                    $http({
                        method:"POST",
                        url:"http://"+$scope.url+"/index.php/Client/Order/cancel_order",
                        data:{
                            orderform:orderform,
                            login_id:$rootScope.user.id
                        }
                    }).success(function(res){
                        if(res){ 
                            $ionicLoading.show({
                               template:res.msg,
                               noBackdrop:true,
                               duration:1500
                            })
                              
                        }else{
                            $ionicLoading.show({
                               template:'取消有误',
                               noBackdrop:true,
                               duration:1500
                           })
                        }
                    })
                }else{
                    return;
                }
                
            });
              
        }

        /*-------------订单支付----------------*/
        $scope.payfor=function(orderform){
            console.log(orderform);
            for(var i=0;i<$scope.items.length;i++){
                if(orderform==$scope.items[i].orderform){
                    var order=$scope.items[i];
                    break;
                }
            }
            if(order.real_price==null){
                real_price="暂无实际价格";
            }else{
                real_price="￥"+order.real_price;
            }
            $ionicPopup.confirm({
                    template: "<p class='center'>您本次订单的:</p><p>预估金额为：￥" + order.estimate_price + "</p><p>实际代驾金额为：" + real_price + "</p>",
                    title: "<h3>支付</h3>",
                    okText: '立即支付',
                    cancelText: '取消',
            })
            .then(function (res) {
                if (res) {
                    $state.go("pag", {"order_number": orderform});
                } else {
                    console.log('您已取消支付');
                }
            })
            
            
        }
   
    
})

//
.controller('PriceListCtr',function($scope,$http){
        $http.get("http://"+$scope.url+"/index.php/Client/Price/price").success(function(data){
            $scope.price=data;console.log(data);
        })
})

//代办业务
    .controller('AgentServiceCtr',function($scope,$ionicPopup){
        //$scope.lists=[
        //    {H3Class:'listHOne',h3:'年审',span:'高效、快速',p:'让你高枕无忧',ListSrc:'img/daiban1.png',Aclick:'aAlert'},
        //    {H3Class:'listHTwo',h3:'保险',span:'安全、保障',p:'做到最好,为你安心',ListSrc:'img/daiban2.png'},
        //    {H3Class:'listHThree',h3:'绿标',span:'正宗、效率',p:'让您车畅通无阻',ListSrc:'img/daiban3.png'},
        //    {H3Class:'listHFour',h3:'过户',span:'专业、安全',p:'让您放心、省心',ListSrc:'img/daiban4.png'},
        //    {H3Class:'listHFive',h3:'换证服务预订',span:'',p:'',ListSrc:'img/daiban5.png'}
        //];

        $scope.lists=
           {h1H3:'年审',span1:'高效、快速',p1:'让你高枕无忧',ListSrc1:'img/daiban1.png',
            h2H3:'保险',span2:'安全、保障',p2:'做到最好,为你安心',ListSrc2:'img/daiban2.png',
            h3H3:'绿标',span3:'正宗、效率',p3:'让您车畅通无阻',ListSrc3:'img/daiban3.png',
            h4H3:'过户',span4:'专业、安全',p4:'让您放心、省心',ListSrc4:'img/daiban4.png',
            h5H3:'换证服务预订',span5:'',p5:'',ListSrc5:'img/daiban5.png'};
        $scope.aAlert=function(){
            $ionicPopup.alert({title:"<h3>温馨提示</h3>",template:'此功能暂未开通',cssClass:'AgentClass',buttons:[{text:'取消'}]});
        }
    })
//支付
    .controller('pagCtr',function($scope,$http,$rootScope,$timeout,$ionicLoading,FloatStr,$stateParams,$state,$ionicPopup){
        //获取用余额
        $timeout(function(){
             $http.get("http://" + $scope.url + "/index.php/Client/Order/get_account?userid="+$rootScope.user.id)
            .success(function(res){
                $scope.account_yue=res[0].account;
            })
        },10);
       
        var order_number=$stateParams.order_number;
        $http.get("http://" + linkUrl +
         "/index.php/Client/OneKeyOrder/payrightnow?order_number=" +order_number)
        .success(function(res) {
            if(res.real_price!=null){
                price=res.real_price;
            }else{
                price=res.estimate_price;
            }
            $scope.items=[
                {firtname:'订单号',secondname:res.order_number},
                {firtname:'出发地',secondname:res.bespoke_address},
                {firtname:'目的地',secondname:res.destination},
                {firtname:'路程',secondname:res.distance+'公里'},
                {firtname:'车费',secondname:price+'元'}
            ];
            //$scope.pags=[
            //    {firtname:'余额支付',secondname:'可用余额35元',PagSrc:'img/yuer.png'},
            //    {firtname:'微信支付',secondname:'',PagSrc:'img/weixin.jpg'},
            //    {firtname:'支付宝支付',secondname:'',PagSrc:'img/aplay.jpg'},
            //    {firtname:'网银支付',secondname:'',PagSrc:'img/unionPay.jpg'}
            //];
          });
        $scope.yuerPay="余额支付";
        $scope.wechatPay="微信支付";
        $scope.alipay="支付宝支付";
        $scope.unionPay="网银支付";
        $scope.pageForm={};
        $scope.immediatePay=function(pageForm){
            //console.log(pageForm)
            if(pageForm.pay.$untouched){
               $ionicLoading.show({
                   template:'请选择支付方式',
                   noBackdrop:true,
                   duration:1500
               });
                pageForm.valid=false;
            }else {
                pageForm.valid=true;
            }

            if(pageForm.valid){
                //支付方式
                var pay_type;
                //订单号
                var out_trade_no=$scope.items[0].secondname;
                //价格
                var price=parseInt($scope.items[4].secondname);
                //使用余额支付
                if (pageForm.pay==$scope.yuerPay){
                    pay_type="account_yue";
                    //保存支付信息  
                      $http({
                        url:'http://'+$scope.url+'/index.php/Client/Order/orderpay',
                        method:'POST',
                        data:{
                            'userid':$rootScope.user.id,
                            'order_number':out_trade_no,
                            'pay_type':pay_type,
                            'money':price
                        }
                      }).success(function(res){
                            $ionicLoading.show({
                               template:res.msg,
                               noBackdrop:true,
                               duration:1500
                            });
                            if(res.result=="success"){
                                $state.go('OneKeyOder');
                            }
                           
                            // if(){
                            //     //支付成功。发送短信
                            //     $http({
                            //         url:'http://'+$scope.url+'/index.php/Client/DuanXin/payDuan',
                            //         method:'POST',
                            //         data:{
                            //             'phone':$rootScope.user.phone
                            //         }
                            //     }).success(function(res){
                            //         console.log("短信发送成功");
                            //         $state.go('OneKeyOder');
                            //     }).error(function(res){
                            //         console.log("短信发送失败");
                            //         $state.go('OneKeyOder');
                            //     })
                            // }
                      });
                      
                }

                //微信支付
                if (pageForm.pay==$scope.wechatPay){
                    $ionicPopup.alert({title:pageForm.pay+"暂时未开通！"});
                }
                //支付宝支付
                if (pageForm.pay==$scope.alipay){
                    pay_type="alipay";
                    window.alipay.pay({
                      tradeNo: out_trade_no,
                      subject: "全顺代驾余额支付测试",
                      body: "我是测试内容",
                      price: price,
                      notifyUrl: "www.baidu.com"
                    }, function(successResults){
                         
                          $ionicPopup.alert({title:"支付成功"});
                          //保存支付信息  
                          $http({
                            url:'http://'+$scope.url+'/index.php/Client/Order/orderpay',
                            method:'POST',
                            data:{
                                'userid':$rootScope.user.id,
                                'order_number':out_trade_no,
                                'pay_type':pay_type,
                                'money':price
                            }
                          }).success(function(res){
                                $ionicLoading.show({
                                   template:res.msg,
                                   noBackdrop:true,
                                   duration:1500
                                })
                                if(res.result=="success"){
                                    $state.go('OneKeyOder');
                                }
                          });

                          //支付成功。发送短信
                            // $http({
                            //     url:'http://'+$scope.url+'/index.php/Client/DuanXin/payDuan',
                            //     method:'POST',
                            //     data:{
                            //         'phone':$rootScope.user.phone
                            //     }
                            // }).success(function(res){
                            //     console.log("短信发送成功");
                            //     $state.go('OneKeyOder');
                            // }).error(function(res){
                            //     console.log("短信发送失败");
                            //     $state.go('OneKeyOder');
                            // })
                              
                      }, function(errorResults)
                      {
                           $ionicPopup.alert({title:"支付失败"}); 
                    });
                }
                //网银支付
                if (pageForm.pay==$scope.unionPay){
                    
                    $ionicPopup.alert({title:pageForm.pay+"暂时未开通！"});
                }
            }
        }
    })