/**
 * Created by Administrator on 2016/5/4 0004.
 */
angular.module("24EApp.hjhcontrollers", [])

   //预约代驾
    .controller('BookedCtrl',function($scope,$ionicLoading,$state,$http,$rootScope,$timeout,$document,$ionicPopup,$filter,$location,$interval){

        var bookmap = $document[0].getElementById('bookmap');
        var map = new BMap.Map(bookmap);

        $scope.takeOrder = function(Booked_form) {
            var clickdatetime = Math.round(new Date().getTime()/1000);

            var name = Booked_form.name.$$lastCommittedViewValue;
            var start = $scope.start;
            var destination = $scope.destination;
            var userdate = Booked_form.date.$$lastCommittedViewValue;
            var usertime = Booked_form.time.$$lastCommittedViewValue;
            var tel = Booked_form.tel.$$lastCommittedViewValue;
            var orderdate = new Date();
            var orderdateformated = $filter('date')(orderdate, 
                'yyyy-MM-dd HH:mm:ss');

            var userdatetimestr = userdate + " " + usertime;
            var userdatetime = Math.round(new Date(userdatetimestr).getTime()/1000);

            //联系电话验证
            if(Booked_form.tel.$$lastCommittedViewValue==undefined||Booked_form.tel.$$lastCommittedViewValue==""){
                $ionicLoading.show({
                    template:"联系电话不能为空",
                    noBackdrop:true,
                    duration:2000
                })
            }
            else if(Booked_form.tel.$invalid){
                $ionicLoading.show({
                    template:"联系电话格式错误",
                    noBackdrop:true,
                    duration:2000
                })
            }
            //联系姓名验证
            if(Booked_form.name.$$lastCommittedViewValue==undefined||Booked_form.name.$$lastCommittedViewValue==""){
                $ionicLoading.show({
                    template:"联系姓名不能为空",
                    noBackdrop:true,
                    duration:2000
                })
            }
            //预约时间验证
            if(Booked_form.date.$$lastCommittedViewValue==undefined||Booked_form.time.$$lastCommittedViewValue==""){
                $ionicLoading.show({
                    template:"预约时间不能为空",
                    noBackdrop:true,
                    duration:2000
                })
            }
            //目的地验证
            if($scope.destination==undefined||$scope.destination==""){
                $ionicLoading.show({
                    template:"目的地不能为空",
                    noBackdrop:true,
                    duration:2000
                })
            }
            //预约地点验证
            if($scope.start==undefined||$scope.start==""){
                //alert("预约地点不能为空!")
                $ionicLoading.show({
                    template:"预约地点不能为空",
                    noBackdrop:true,
                    duration:2000
                })
            }

            else if(Booked_form.name.$invalid){
                $ionicLoading.show({
                    template:"联系姓名格式错误",
                    noBackdrop:true,
                    duration:2000
                })
            }

            //全部验证成功

            if (Booked_form.$valid) {
                if (userdatetime<clickdatetime) {
                    $ionicLoading.show({
                        template: "预约时间不能在当前时间之前",
                        noBackdrop: true,
                        duration: 2000
                    })
                    return;
                }
                var geoc = new BMap.Geocoder();

                $http.get('http://'+$scope.url+'/index.php/Client/OneKeyOrder/getprice?time='+usertime)
                    .success(function(res) {
                        $scope.price = parseInt(res);
                        geoc.getPoint(start, function(res) {
                            if(res == null) {
                                $ionicPopup.alert({title: "预约失败"});
                                return false;
                            }
                            var output_start_location = res;
                            geoc.getPoint(destination, function(res) {
                                if(res == null) {
                                    $ionicPopup.alert({title: "预约失败"});
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
                                // $scope.q = Math.floor($scope.transitdistance / 1000);
                                if(f <= 10) {
                                    $scope.preestimateprice = $scope.price;
                                } else {
                                    $scope.preestimateprice = $scope.price + Math.ceil((f-10)/5) * 20;
                                }
                                // var f = $scope.q;
                                var e = $scope.preestimateprice;
                                $ionicLoading.hide();
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
                                                method:'GET',
                                                url:'http://'+$scope.url+'/index.php/Client/OneKeyOrder/reservationdrive',
                                                params:{
                                                    'id':$rootScope.user.id,
                                                    'start':start,
                                                    'destination':destination,
                                                    'userdate':userdate,
                                                    'usertime':usertime,
                                                    'name':name,
                                                    'tel':tel,
                                                    'distance':f,
                                                    'estimateprice':e,
                                                    'ordertime':orderdateformated,
                                                }
                                            }).success(function(res){
                                                
                                                $ionicPopup.alert({title: "预约成功"}).then(function() {
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
                                                    //$state.go('pag',{'order_number':res});
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
                                            });
                                        }
                                    });    

                                } else {
                                    $ionicPopup.alert({title:"预约失败"});
                                }
                            }, "桂林市");
                        }, "桂林市");
                        
                });
                
                $ionicLoading.show({
                        template: "正在估算路程与价格，请稍后...",
                        noBackdrop: true,
                        duration: 3000
                });
                
            }
        };

        //自动完成对象筛选 appservices.js
        $scope.getItems = function (item) {
            $timeout(function () {
                $scope.mapitems = item;
            }, 500)
        };

        //获取出发地（发送到api计算距离）
        var mapSelect = function (id) {
            var pp = $scope.mapitems;
            if (pp != undefined) {
                $scope.start = id;
            }
        };

        //获取目的地（发送到api计算距离）
        function mapSelect1(id) {
            var muArray = $scope.mapitems;
            if (muArray != undefined) {
                $scope.destination = id;
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
            console.log($rootScope.popup);
        };

        //关闭目的地弹窗页面
        $scope.pSelect = function () {
           $rootScope.popup.close();
           $rootScope.popup.isPopup=false;
        };

        //获取目的地
        $scope.MSelect = function (id) {
            $scope.destination = id;
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
            $scope.start = id;
            mapSelect(id);
            $rootScope.popup.close();
            $rootScope.popup.isPopup=false;
        };

                   
    })

    //登录
    .controller('LoginCtrl',function($scope,$ionicPopup,$interval,$ionicLoading,$timeout,$state,$http,$rootScope, AUTH_EVENTS, AuthService,Session,UserInfo,$location,$cordovaGeolocation){
        //ip地址：
        var ip="192.168.1";
        var promise=UserInfo.query();    
        promise.then(function(res){    
            $rootScope.user=res;
            //判断用户有无登录;
            if(res){ 
                $ionicPopup.confirm({
                    title: "系统检测到您有登录过，请问是否直接登录",
                    okText: "确定",
                    cancelText: "取消"
                })
                .then(function(res) {
                    if(res){
                        if($rootScope.user.type=='user'){
            
                            $state.go('OneKeyOder');
                        }
                        else if($rootScope.user.type=='driver'){
                            
                            $state.go('orderTabs');
                        }
                        else if($rootScope.user.type=='admin'){
                            
                            $state.go('vipm');
                        }        
                    }else{
                        $http.get('http://'+$scope.url+'/index.php/Client/Login/clearsesstion')
                        .then(function(res){
                            if(res.data){
                                
                                $rootScope.user=false;
                            }
                        })
                    }
                    
                });
            }  
        },function(data){
            console.log('用户不存在');
        });
               
        $scope.paracont="获取验证码";
        $scope.paraclass="btn_null";
        $scope.paraevent=true;
        $scope.flag=false;
        $rootScope.code="";
        //手机号码验证
      $scope.getCode=function(login_form) {

        //return 'error';

        if(!login_form.tel.$invalid ){
            var second=60,
                timePromise=undefined;
            timePromise=$interval(function(){
                {
                    if (second<=0){
                        $interval.cancel(timePromise);
                        timePromise=undefined;
                        second=60;
                        $scope.paracont="重发验证码";
                        $scope.paraclass="but_null";
                        $scope.paraevent=true;
                        $scope.flag=false;
                    }else{
                        $scope.flag=true;
                        $scope.paracont=second+"秒后可重发";
                        $scope.paraclass="not but_null";
                        second--;
                    }
                }
            },1000,100);
            $http({
                url:'http://'+$scope.url+'/index.php/Client/DuanXin/index',
                method:'POST',
                data:{
                    'phone':login_form.tel.$$lastCommittedViewValue,
                },
            }).success(function(res){
                console.log(res);
                if(res){
                    $ionicPopup.alert({title:"验证码发送成功！"});
                     
                }else{
                    $ionicPopup.alert({title:"验证码发送失败！"});
                };
            }).error(function(){
                $ionicPopup.alert({title:"验证码发送错误！"});
                
            })
            
        }
           
           if (login_form.tel.$$lastCommittedViewValue==undefined|| login_form.tel.$$lastCommittedViewValue==""){
               $ionicLoading.show({
                   template: "手机号码不能为空！",
                   noBackdrop: true, //是否设置背景幕，true表示没有
                   duration: 1500,  //显示的时间
               });
              
           }
           else if (login_form.tel.$invalid){
               $ionicLoading.show({
                   template: "手机号码格式错误！",
                   noBackdrop: true, //是否设置背景幕，true表示没有
                   duration: 1500,  //显示的时间
               });

           }

       }
        //验证码验证
       $scope.login=function(login_form) {
            var tel=login_form.tel.$$lastCommittedViewValue;
            var code=login_form.check_tel.$$lastCommittedViewValue; 
            if(tel==undefined||tel==''){
                $ionicLoading.show({
                    template: "请输入手机号码！",
                    noBackdrop: true, //是否设置背景幕，true表示没有
                    duration: 1500,  //显示的时间
                })
                login_form.$valid=false;
            }else if(login_form.tel.$invalid){
                $ionicLoading.show({
                   template: "手机号码格式错误",
                   noBackdrop: true, //是否设置背景幕，true表示没有
                   duration: 1500,  //显示的时间
               });
                login_form.$valid=false;
            }else if (login_form.$dirty && login_form.check_tel.$invalid ){
                $ionicLoading.show({
                    template: "请正确输入验证码！",
                    noBackdrop: true, //是否设置背景幕，true表示没有
                    duration: 1500,  //显示的时间
                })
                login_form.$valid=false;
            }else{
                login_form.$valid=true;
            }
            
            //console.log(login_form.$valid);
            if(login_form.$valid){
                    
                AuthService.login({'tel':tel,'code':code,'ip':ip}).then(function (type) {
                   
                    if(type=='past'){
                        $ionicLoading.show({
                            template: "验证码已失效,请重新获取!",
                            noBackdrop: true, 
                            duration: 1500,  
                        })
                    }else if(type=='error'){
                        $ionicLoading.show({
                            template: "验证码错误！",
                            noBackdrop: true, 
                            duration: 1500,  
                        })
                    }else{
                         
                        $ionicPopup.alert({title:"登录成功！"}).then(function(){
                          $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                          $rootScope.user=type;
                          if(type.type=='user'){
                            $state.go('OneKeyOder');
                            
                            $interval(function(){
                                //通过百度sdk来获取经纬度,并且alert出经纬度信息
                                var noop = function(){}
                                window.locationService.getCurrentPosition(function(pos){
                                    $rootScope.lon = pos.coords.longitude;
                                    $rootScope.lat = pos.coords.latitude;
                                    $http.get('http://'+linkUrl+'/index.php/Client/Login/saveZuobiao?lon='+$rootScope.lon+'&lat='+$rootScope.lat)
                                        .success(function(data) {
                                            // $rootScope.driverlocation = [];
                                            // for(var i=0; i<data.length; i++) {
                                            //     var latandlog = data[i].location.toString();
                                            //     $rootScope.driverlocation.push(latandlog);
                                            // }
                                            // alert($rootScope.driverlocation);
                                        }).error(function(){
                                            // alert('error');
                                        });
                                },function(e){
                                    var options = {
                                        maximumAge: 5 * 60 * 1000,
                                        timeout: 10 * 1000,
                                        enableHighAccuracy: true,
                                    };
                                    $cordovaGeolocation.getCurrentPosition(options).then(function(position) {    //h5地理定位
                                        $rootScope.lat = position.coords.latitude;
                                        $rootScope.lon = position.coords.longitude;
                                        $http.get('http://'+linkUrl+'/index.php/Client/Login/saveZuobiao?lon='+$rootScope.lon+'&lat='+$rootScope.lat)
                                            .success(function(data){
                                                
                                            }).error(function(){
                                                // alert('error');
                                        });
                                    },function(e) {

                                    });
                                });
                                
                            },10000);
                          }
                          if(type.type=='driver'){
                                $state.go('orderTabs');
                                $interval(function(){
                                    //通过百度sdk来获取经纬度,并且alert出经纬度信息
                                    var noop = function(){}
                                    window.locationService.getCurrentPosition(function(pos){
                                        $rootScope.lon = pos.coords.longitude;
                                        $rootScope.lat = pos.coords.latitude;
                                        $http.get('http://'+linkUrl+'/index.php/Client/Login/saveZuobiao?lon='+$rootScope.lon+'&lat='+$rootScope.lat)
                                            .success(function(data){
                                                try {
                                                    var tags = [];
                                                    for(var i=0; i<data.length; i++) {
                                                        var usertags=data[i].phone;                                                           
                                                        tags.push(usertags);                                                        
                                                    }    
                                                    window.plugins.jPushPlugin.setTags(tags);
                                                } catch (exception) {
                                                        // console.log(exception);
                                                    }
                                            }).error(function(){
                                                // alert('error');
                                        });
                                    },function(e){
                                            var options = {
                                                maximumAge: 5 * 60 * 1000,
                                                timeout: 10 * 1000,
                                                enableHighAccuracy: true,
                                            };
                                            $cordovaGeolocation.getCurrentPosition(options).then(function(position) {    //h5地理定位
                                                $rootScope.lat = position.coords.latitude;
                                                $rootScope.lon = position.coords.longitude;
                                                $http.get('http://'+linkUrl+'/index.php/Client/Login/saveZuobiao?lon='+$rootScope.lon+'&lat='+$rootScope.lat)
                                                    .success(function(data){
                                                        try {
                                                            var tags = [];
                                                            for(var i=0; i<data.length; i++) {
                                                                var usertags=data[i].phone;                                                           
                                                                tags.push(usertags);                                                        
                                                            }    
                                                            window.plugins.jPushPlugin.setTags(tags);
                                                        } catch (exception) {
                                                                // console.log(exception);
                                                            }
                                                    }).error(function(){
                                                        // alert('error');
                                                });
                                            },function(e) {

                                            });
                                    });
                                    
                                },10000);
                          }

                          if(type.type=='admin'){
                            
                            $state.go('vipm');
                          }

                        })
                    }  
                  
                }, function () {
                  $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                }); 
                    
            }
        };

        function formcontroller($scope,$http){
            $scope.formData={};
        }
    })

    //个人中心
    .controller('PersonCtrl',function($scope,$ionicLoading,$http,$state,$rootScope,$timeout,fileReader){

       $scope.user={
            name:'您好！先生/女士',
            tel:'',
       };
       
        $timeout(function(){
            if($rootScope.user){
                $scope.user.tel=$rootScope.user.phone;
                $scope.flag=true;

            }else{
                $scope.flag=false;

            } 
            //获取用户头像
            $http.get('http://'+$scope.url+'/index.php/Client/Order/getHeadimg?login_id='+$rootScope.user.id).success(function(res){
                
                $scope.headImg="http://"+$scope.url+res;
                $rootScope.head=$scope.headImg;
            }) 
        },10)
             
        
        //用户上传图片
        $scope.getFile = function (file) {
                    
            fileReader.readAsDataUrl(file, $scope).then(function(result) {    
                  var files=[];
                  files.push(file);
                  var fd = new FormData();
                  angular.forEach(files,function(val,key){
                        fd.append(key, val);
              
                    });
                    
                    $http.post('http://'+$scope.url+'/index.php/Client/Order/uploadHead',fd,{
                        withCredentials: true,
                        headers: {'Content-Type': undefined },
                        transformRequest: angular.identity
                    }).then(function(response){
                        if(response.data['status']=='success'){
                            //替换成功后
                            $scope.headImg = result;
                            $ionicLoading.show({
                                template:response.data['message'],
                                noBackdrop:true,
                                duration:1500
                            })
                        }else{
                            //替换失败
                            $scope.headImg=$rootScope.head;
                            $ionicLoading.show({
                                template:response.data['message'],
                                noBackdrop:true,
                                duration:1500
                            })
                             
                        } 
                    });

            });
                                 
                               
        };

        $scope.exit=function(){
            $http.get('http://'+$scope.url+'/index.php/Client/Login/clearsesstion')
            .then(function(res){
                if(res.data){
                    $scope.flag=false;
                    $rootScope.user=false;
                }
            })
        }

        //拨号
        $scope.callPhone=function(){
            $window.location.href="tel:0668-2751645";
        }
        $scope.logintip=function(){
            $ionicLoading.show({
                template: "亲，你还没有登录喔，请先登录！",
                noBackdrop: true, //是否设置背景幕，true表示没有
                duration: 2000,  //显示的时间
            })
        }
    })

    //注册
    .controller('RCtrl',function($rootScope,$scope,$cordovaCamera,$ionicLoading,$timeout,$state,$http,fileReader,$cordovaFileTransfer,$ionicPopup){
        //文件上传功能
        $scope.getFile = function (file) {
                  
            fileReader.readAsDataUrl(file, $scope).then(function(result) {
                  $scope.imageSrc = result;
                  var files=[];
                  files.push(file);
                  var fd = new FormData();
                  angular.forEach(files,function(val,key){
                        fd.append(key, val);
              
                    });
                    $http.post('http://'+$scope.url+'/index.php/Client/Order/upload',fd,{
                        withCredentials: true,
                        headers: {'Content-Type': undefined },
                        transformRequest: angular.identity
                    }).then(function(response){
                        if(response.data['status']=='success'){
                            $ionicPopup.alert({title:"上传成功"});

                            $rootScope.imgName=response.data['message'];
                        }else{
                            $ionicLoading.show({
                                template:response.data['message'],
                                noBackdrop:true,
                                duration:1500
                            })
                        } 
                    });

            });
        };

        //打开照相机拍照
        $scope.takeCamera = function () {
            var options = {
                destinationType: 1,//0:DATA_URL, 1:FILE_URL, 2:NATIVE_URL
                targetWidth: 200,
                targetHeight: 200
            };
            $cordovaCamera.getPicture(options).then(function (imageUrl) {
                //alert('已保存到：' + imageUrl);
                $scope.imageSrc = imageUrl;
                //$scope.imageSrc= 'data:image/jpeg;base64,' + imageUrl;

                $cordovaFileTransfer.upload(
                    'http://' + $scope.url + '/index.php/Client/Order/upload',
                    imageUrl,
                    {
                        fileKey: "0",
                        fileName: imageUrl.substr(imageUrl.lastIndexOf('/') + 1),
                        //mimeType: "image/jpeg"
                    }
                ).then(function (result) {
                        //var str = JSON.stringify(result);
                        //alert('success: ' + str);
                        //alert(result.response);

                        //---- 把response转换为对象 ----
                        var obj_response = JSON.parse(result.response);
                        //alert(obj_response.message);
                        if (obj_response.status == 'success') {
                            //alert('图片上传成功');
                            $ionicLoading.show({
                                template: '图片上传成功',
                                noBackdrop: true,
                                duration: 2000
                            });
                            $rootScope.imgName = obj_response.message;
                        } else {
                            //alert(obj_response.message);
                            $ionicLoading.show({
                                template: obj_response.message,
                                noBackdrop: true,
                                duration: 2000
                            })
                        }
                    }, function (err) {
                        //var str = JSON.stringify(err);
                        //alert('error: ' + str);
                        $ionicLoading.show({
                            template: '网络出错,请重新上传图片!',
                            noBackdrop: true,
                            duration: 2000
                        })
                    }, function (progress) {
                        // constant progress updates
                    });

                //var options = {
                //    //这些参数可能要配合着使用，比如选择了sourcetype是0，destinationtype要相应的设置quality: 100,                                            //相片质量0-100
                //    destinationType: 2,        //返回类型：DATA_URL= 0，返回作为 base64 編碼字串。 FILE_URI=1，返回影像档的 URI。NATIVE_URI=2，返回图像本机URI (例如，資產庫)
                //    sourceType: 1,              //从哪里选择图片：PHOTOLIBRARY=0，相机拍照=1，SAVEDPHOTOALBUM=2。0和1其实都是本地图库
                //    targetWidth: 200,           //照片宽、高度
                //    targetHeight: 200,
                //    saveToPhotoAlbum: true,     //保存到手机相册
                //};
                //$http.post('http://'+$scope.url+'/index.php/Client/Order/upload',imageData,{
                //    withCredentials: true,
                //    headers: {'Content-Type': undefined },
                //    transformRequest: angular.identity
                //}).then(function(response){
                //    if(response.data['status']=='success'){
                //        alert('上传成功');
                //        $rootScope.imgName=response.data['message'];
                //    }else{
                //        $ionicLoading.show({
                //            template:response.data['message'],
                //            noBackdrop:true,
                //            duration:1500
                //        })
                //    }
                //});

            }, function (err) {
                //error
            })
        };




        $scope.date=new Date();//获取当前日期
        $scope.localdate=new Date();
        $scope.sure=function(Register_form,dataForm){
           console.log(Register_form);
            //姓名验证
           if(Register_form.username.$$lastCommittedViewValue==undefined||Register_form.username.$$lastCommittedViewValue==""){
                $ionicLoading.show({
                    template:'姓名不能为空',
                    noBackdrop:true,
                    duration:1500
                })
               $timeout(function () {
               }, 1500)
            }
            else if(Register_form.username.$invalid){
                $ionicLoading.show({
                    template:'姓名格式错误',
                    noBackdrop:true,
                    duration:1500
                })
                $timeout(function () {
                }, 1500)
            }

           //手机号码验证
            else if(Register_form.tel.$$lastCommittedViewValue==undefined||Register_form.tel.$$lastCommittedViewValue==""){
                $ionicLoading.show({
                    template:'手机号码不能为空',
                    noBackdrop:true,
                    duration:1500
                })
                $timeout(function () {
                }, 1500)
            }
            else if(Register_form.tel.$invalid){
                $ionicLoading.show({
                    template:'手机号码格式错误',
                    noBackdrop:true,
                    duration:1500
                })
                $timeout(function () {
                }, 1500)
            }

           //身份证号码验证
            else if(Register_form.idCardNum.$$lastCommittedViewValue==undefined||Register_form.idCardNum.$$lastCommittedViewValue==""){
                $ionicLoading.show({
                    template:'身份证号码不能为空',
                    noBackdrop:true,
                    duration:1500
                })

            }
            else if(Register_form.idCardNum.$invalid){
               $ionicLoading.show({
                   template:'身份证号码格式错误',
                   noBackdrop:true,
                   duration:1500
               })
           }

           //档案编号验证
            else if(Register_form.fileNum.$$lastCommittedViewValue==undefined||Register_form.fileNum.$$lastCommittedViewValue==""){
               $ionicLoading.show({
                   template:"档案编号不能为空",
                   noBackdrop:true,
                   duration:1500
               })
           }

           else if(Register_form.fileNum.$invalid){
               $ionicLoading.show({
                   template:'档案编号格式错误,纯数字',
                   noBackdrop:true,
                   duration:1500
               })
           }

           else if(Register_form.date.$invalid){
               $ionicLoading.show({
                   template:'请正确填写日期',
                   noBackdrop:true,
                   duration:1500
               })
           }

           //工作地验证
           else if(Register_form.user_address.$$lastCommittedViewValue==undefined||Register_form.user_address.$$lastCommittedViewValue==""){
               $ionicLoading.show({
                   template:"工作地不能为空",
                   noBackdrop:true,
                   duration:1500
               })
           }

           else if(Register_form.user_address.$invalid){
               $ionicLoading.show({
                   template:'工作地格式错误',
                   noBackdrop:true,
                   duration:1500
               })
           }
           
           else if($rootScope.imgName==undefined||$rootScope.imgName==""){
                $ionicLoading.show({
                   template:'证件上传失败',
                   noBackdrop:true,
                   duration:1500
               })
                Register_form.$valid=false;
           }
            Register_form.$setDirty();
            if(Register_form.$valid){

                //姓名：
                var driver_name=Register_form.username.$$lastCommittedViewValue;
                //手机号码：
                var driver_phone=Register_form.tel.$$lastCommittedViewValue;
                //身份证号码
                var idcrad=Register_form.idCardNum.$$lastCommittedViewValue;
                //档案编号
                var file_number=Register_form.fileNum.$$lastCommittedViewValue;
                //申请日期：
                var apply_date=Register_form.date.$$lastCommittedViewValue;
                //工作地：
                var work_address=Register_form.user_address.$$lastCommittedViewValue;

                $http({
                    url:'http://'+$scope.url+'/index.php/Client/Order/driver_reg',
                    method:'POST',
                    data:{
                        userid:$rootScope.user.id,
                        driver_name:driver_name,
                        driver_phone:driver_phone,
                        idcrad:idcrad,
                        paper_img:$rootScope.imgName,
                        file_number:file_number,
                        apply_date:apply_date,
                        work_address:work_address,
                    },
                }).success(function(res){
                    console.log(res);
                    if(res){
                        $ionicPopup.alert({title:"注册成功！"})
                        .then(function(){
                            $state.go('Person');
                        })
                        
                    }else{
                        $ionicLoading.show({
                           template:'亲，您已经是代驾服务商了！',
                           noBackdrop:true,
                           duration:1500
                       })
                    }

                    
                })
            }
        }
    })

    //我的账户
    .controller('accountCtrl',function($scope,$ionicPopup,$http,$rootScope,$timeout,$ionicLoading,FloatStr){
        $scope.account={
            current:'0.00',
        };
        
        var userid;
        $timeout(function(){
            userid= $rootScope.user.id;
            $http.get('http://'+$scope.url+'/index.php/Client/Order/get_account?userid='+userid).success(function(res){
                $scope.account.current=FloatStr.getFloatStr(res[0].account);
                console.log($scope.account.current);
            })
        },10);
        $scope.wechatPay="微信支付"
        $scope.alipay="支付宝支付"
        $scope.unionPay="网银支付"
        $scope.Myaccount_form={};
        $scope.takeRecharge=function(Myaccount_form){
            var account=Myaccount_form.money.$$lastCommittedViewValue;
           if(account==undefined||account==""){
                $ionicLoading.show({
                    template:"请输入要充值的金额",
                    noBackdrop:true,
                    duration:1500
                })
                Myaccount_form.valid=false;
            }
            else if(account<=0){
                $ionicLoading.show({
                    template:"您输入的金额无效！",
                    noBackdrop:true,
                    duration:1500
                })
                Myaccount_form.valid=false;
            }
            else if(Myaccount_form.pay.$untouched){
                $ionicLoading.show({
                    template:'请选择支付方式',
                    noBackdrop:true,
                    duration:1500
                })
                Myaccount_form.valid=false;
            }
            else{
                Myaccount_form.valid=true;
            }
            if(Myaccount_form.valid){

                //保留两位充值金额
                account=FloatStr.getFloatStr(account);
                if(Myaccount_form.pay == $scope.wechatPay){
                    //使用微信支付
                    $ionicPopup.alert({title:Myaccount_form.pay+"暂时未开通！"});
                    $rootScope.orderNo = Math.floor(Math.random() * 1000000000000000);
                    // $scope.productID = response.productId;
                    // $scope.msg = response.msg;
                    
                    console.log($rootScope.loginIsAccount);
                    navigator.notification.confirm('正在支付...请稍后',
                            wxresults, '小贴士', ['未完成支付', '已完成支付']);
                    var out_trade_no = $rootScope.orderNo;//"997896659622633";//15位订单号
                    var url = "http://weixin.qq.com"; //异步同步接口
                    var bodtxt = "余额充值";
                    var total_fee = "0.01";
                    window.plugins.Pgwxpay.wxpay(out_trade_no, url, bodtxt, total_fee * 100, function (success) {
                        alert(success);
                    }, function (fail) {
                        alert("encoding failed: " + fail);
                    });
                }
                if(Myaccount_form.pay == $scope.alipay){
                    //支付宝充值
                    $ionicPopup.alert({title:"您选择了"+Myaccount_form.pay});
                    
                    //var ord1= Math.floor(Math.random()*10);
                    //var ord2= Math.floor(Math.random()*10);
                    //获取充值订单
                    $http({
                        url:'http://'+$scope.url+'/index.php/Client/Order/recharge',
                        method:'GET',
                        params:{
                            'userid':$rootScope.user.id,
                            'retype':Myaccount_form.pay,
                            'account':account,
                        },
                    }).success(function(res){
                        if(res){
                            console.log('充值提交成功，等待充值...');
                            var out_trade_no=res.obj[0].bills_order;
                            var price=res.obj[0].recharge_amount;

                            console.log(price);
                            window.alipay.pay({
                                  tradeNo: out_trade_no,
                                  subject: "全顺代驾余额充值测试",
                                  body: "我是测试内容",
                                  price: price,
                                  notifyUrl: "www.baidu.com"
                                  }, function(successResults){
                                          $ionicPopup.alert({title:"充值成功"});
                                          //更新余额
                                           var newaccount=parseFloat($scope.account.current)+parseFloat(account);
                                           $scope.account.current=FloatStr.getFloatStr(newaccount);
                                          //保存充值信息  
                                          $http({
                                            url:'http://'+$scope.url+'/index.php/Client/Order/rechargepay',
                                            method:'POST',
                                            data:{
                                                'userid':$rootScope.user.id,
                                                'bills_order':out_trade_no,
                                            },
                                          }).success(function(res){
                                                if(res.result=="success"){
                                                    
                                                    $ionicPopup.alert({title:res.msg});
                                                }else{
                                                    
                                                    $ionicPopup.alert({title:res.msg});
                                                }
                                          });
                                          //充值成功。发送短信
                                            $http({
                                                url:'http://'+$scope.url+'/index.php/Client/DuanXin/rechageDuan',
                                                method:'POST',
                                                data:{
                                                    'phone':$rootScope.user.phone,
                                                    'money':price,
                                                    'sum':$scope.account.current,
                                                },
                                            }).success(function(res){
                                                console.log("短信发送成功");
                                            })
                                          
                                  }, function(errorResults)
                                  {
                                        
                                    $ionicPopup.alert({title:"充值失败"});
                                });
                           
                        }
                        
                    })
                    //var out_trade_no= Math.floor(Math.random() * 1000000000000000);//"14211615162133"+ord1+ord2;//15位订单号
                    
                     


                }

                if(Myaccount_form.pay == $scope.unionPay){
                    $ionicPopup.alert({title:Myaccount_form.pay+"暂时未开通！"});
                }
                
                
                
            }
        }


        //支付结果回调接收
            function wxresults(button) {
                //data = 2 支付失败
                //data = 1 支付参数错误
                //data =0  支付成功
                //alert("button---" + button);
                if (button === 2) {
                    //alert("button2--" + button);
                    window.plugins.Pgwxpay.getcode(
                            function (success) {
                                //alert("success--" + success); 
                                if (success == "0") {
                                    $ionicLoading.show({template: "支付成功", noBackdrop: true, duration: 1500});
                                } else {
                                    $ionicLoading.show({template: "未完成支付", noBackdrop: true, duration: 1500});
                                }

                                var element = document.getElementById('wxlog');
                                element.innerHTML = "֧支付结果:" + success;
                                //alert(success);
                            }, function (fail) {
                        alert("encoding failed: " + fail);
                        }
                    );

                } else {
                    //alert("else");
                    $ionicLoading.show({template: "用户取消操作", noBackdrop: true, duration: 1500});
                    window.plugins.Pgwxpay.getcode(
                            function (success) {
                                $rootScope.loginIsAccount = false;
                                var element = document.getElementById('wxlog');
                                element.innerHTML = "支付结果:" + success;
                                alert(success);
                            }, function (fail) {
                        alert("encoding failed: " + fail);
                    });
                }
            }

        //账单明细
        $scope.get_billsList=function(){
            $http({
                    url:'http://'+$scope.url+'/index.php/Client/Order/get_billsList',
                    method:'GET',
                    params:{
                        'userid':userid,
                    },
                }).success(function(res){
                    $scope.items=res;
                })
        }
       
    })

//公告信息
.controller('noticeCtrl',function($scope,$http){
    $http.get('http://'+linkUrl+'/index.php/Client/Order/getNotice')
    .success(function(res){
        $scope.notices=res;
    })
})