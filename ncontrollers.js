angular.module("24EApp.ncontrollers", [])

.controller('servicemCtrl',function($scope,$http,$state,$ionicLoading,$ionicPopup,$timeout){
	
    var run = false;    
    var obj = {current:0,count:8};
    $scope.get=function(type){
        $scope.hasmore=true;  //上拉加载动画
        obj.current=0;
        var result = chushihua(obj,1,type);
    }
        //下拉加载
        $scope.loadMore = function(type){ 
            if(type=="list"){
              var old = $scope.items;
            }else{
              var old=$scope.itemssz;
            }
            if(old!=undefined){
              var result = chushihua(obj,3,type); 
            }
            $timeout(function(){
                $scope.$broadcast('scroll.infiniteScrollComplete');
            },500);   
            
        }; 
        function chushihua(obj_data,state,type){
            if(!run){
              run = true;
              if(type=="list"){
                // 服务商列表
                $http({
                    method:'GET',
                    url:"http://"+$scope.url+"/index.php/Manage/Serve/servelist",
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
                    
                })
              }else{
                // 服务商设置列表
                  $http({
                      method:'GET',
                      url:"http://"+$scope.url+"/index.php/Manage/Serve/serveSet",
                      params:obj_data,
                  }).success(function(data){
                      run = false;
                      if(state==3){
                          if (data==null||data.length==0) {
                            console.log("结束");
                            $scope.hasmore=false;
                          }else{
                            obj.current += obj.count;
                            $scope.itemssz= $scope.itemssz.concat(data); 
                          }
                          
                      }else{
                        
                          $scope.itemssz=data;
                      }
                      
                  })
              }
              
            }
        }
	
  	// 审核
  	$scope.status=function(id,login_id){

          $ionicPopup.confirm({
              template: "<p class='center'>您是否允许该司机通过审核</p>",
              title: "<h3>审核</h3>",
              okText: '确定',
              cancelText: '取消',
          })
          .then(function(res){
              if(res){
                  $http.get("http://"+$scope.url+"/index.php/Manage/Serve/serveStatus?id="+id+"&login_id="+login_id)
                  .success(function(data){
                    if (data=="success") {
                      $ionicLoading.show({
                                    template:'审核通过！',
                                    noBackdrop:true,
                                    duration:1500
                                })
                      window.location.reload();
                    }else{
                      $ionicLoading.show({
                                    template:data,
                                    noBackdrop:true,
                                    duration:1500
                                })
                    }
                  })
              }else{
                return;
              }
          })

     
  	}
})

.controller('fwCtrl',function($scope,$stateParams,$http,$ionicLoading){
	
	// 服务商设置详细信息
	var id=$stateParams.id;
	$http.get("http://"+$scope.url+"/index.php/Manage/Serve/serveSetDetail?id="+id).success(function(data){
    		if (data=='你没有查看服务商的权限') {
    			$ionicLoading.show({
                              template:data,
                              noBackdrop:true,
                              duration:1500
                          })
    			window.location.href="#/servicem";
    		}else{
    			$scope.itemssz=data;
    		}
        
  	})
	
})

.controller('ordermCtrl',function($scope,$http,$ionicLoading,$timeout){
	   $scope.hasmore=true; //上拉加载动画
    var run = false;    
    var obj = {current:0,count:8};
    var result = chushihua(obj,1);
        //下拉加载
        $scope.loadMore = function(){
            var old = $scope.items;
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
             // 订单管理列表
              $http({
                    method:'GET',
                    url:"http://"+$scope.url+"/index.php/Manage/Order/orderlist",
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
                    
                })
            }
        }
 

	// 搜素
	$scope.search=function(cont){
		$http.get("http://"+$scope.url+"/index.php/Manage/Order/search?cont="+cont).success(function(data){
          if (data=="你没有订单查询的权限") {
            $ionicLoading.show({
                            template:"你没有订单查询的权限",
                            noBackdrop:true,
                            duration:1500
                        })
          }else if (data==null) {
            $ionicLoading.show({
                            template:"没有你查询的订单",
                            noBackdrop:true,
                            duration:1500
                        })
          }else{
            $scope.items=data;
          }
        	
  		})
	}
})

// 分析统计
.controller('analyzestatisticsCtrl',function($scope,$http){
	
	// 会员信息统计
	$http.get("http://"+$scope.url+"/index.php/Manage/Analytic/userTotal").success(function(data){
        $scope.user=data;
  	})
	// 营业统计
	$http.get("http://"+$scope.url+"/index.php/Manage/Analytic/businessTotal").success(function(data){
        $scope.business=data;
  	})
  	// 对账分润
	$http.get("http://"+$scope.url+"/index.php/Manage/Analytic/fenrun").success(function(data){
        $scope.fenrun=data;
  	})
})

// 退出
.controller('vipmCtrl',function($scope,$http,$location,$rootScope){
	$scope.loginout=function(){
		$http.get("http://"+$scope.url+"/index.php/Manage/Index/loginout").success(function(data){
        	if (data==true) {
        		$location.path("/Login");
            $rootScope.user=false;	
        	}
  		})
	}
})