angular.module("24EApp.zw_controllers", [])

	//系统管理
	 
// 会员管理
.controller('vipCtrl',function($scope,$http,$state,$rootScope,$location,$ionicLoading,$ionicPopup,$timeout){
	$scope.flag=true;	//加载动画
	$scope.hasmore=true;	//上拉加载动画
	var run = false;		
    var obj = {current:0,count:8};
    var result = chushihua(obj,1);
        //下拉加载
        $scope.loadMore = function(){
            var old = $scope.vips;
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
              // 会员信息列表
              $http({
                    method:'GET',
                    url:"http://"+$scope.url+"/index.php/Manage/User/userList",
                    params:obj_data,
                }).success(function(data){
                    run = false;
                    if(state==3){
                        if (data==null||data.length==0) {
                          console.log("结束");
                          $scope.hasmore=false;
                        }else{
                          obj.current += obj.count;
                          $scope.vips= $scope.vips.concat(data); 
                        }
                        
                    }else{
                    	$scope.flag=false;
                        $scope.vips=data;
                    }
                    
                })
            }
        }
	
	// 获取会员id 
	 $rootScope.vipid=null;
	$scope.dianji=function(id){
		$rootScope.vipid=id;
	}
	
	// 会员信息搜索
	$scope.search=function(cont){  
		$http.get("http://"+$scope.url+"/index.php/Manage/User/search?cont="+cont).success(function(data){
			if (data==null) {
				$ionicLoading.show({
			                    template:"没有你搜索的内容",
			                    noBackdrop:true,
			                    duration:1500
			                })
			}else{
        		$scope.vips=data;
			}
  		})
    }

})

// 添加会员
.controller('vipaddCtrl',function($scope,$http,$ionicLoading,$location){
	$scope.submitForm=function(addForm){
		// var name=addForm.name.$$lastCommittedViewValue;
		var levels=addForm.levels.$$lastCommittedViewValue;
		var realname=addForm.realname.$$lastCommittedViewValue;
		var phone=addForm.phone.$$lastCommittedViewValue;
		var price=addForm.price.$$lastCommittedViewValue;
		$http({
			url:"http://"+$scope.url+"/index.php/Manage/User/userAdd",
			method:'GET',
			params:{'levels':levels,'realname':realname,'phone':phone,'price':price}
		}).success(function(data){
			if (data=="success") {
				$ionicLoading.show({
			                    template:"添加成功",
			                    noBackdrop:true,
			                    duration:1500
			                })
				$location.path("/VipManagement");
			}else{
				$ionicLoading.show({
			                    template:data,
			                    noBackdrop:true,
			                    duration:1500
			                })
			}
		})
		
	}
})


// 会员修改
.controller('vipeditCtrl',function($scope,$http,$rootScope,$ionicLoading,$location,$ionicPopup){
	var id=$rootScope.vipid;
	console.log(id)
	// 查询出要编辑的内容
	$http.get("http://"+$scope.url+"/index.php/Manage/User/listEdit?id="+id).success(function(data){
        $scope.items=data;

  	})
	// 编辑
	$scope.edit=function(realname,phone,id){
		
		var realname=realname.$$lastCommittedViewValue;
		var phone=phone.$$lastCommittedViewValue;
		var id=id;
		$http({
			url:"http://"+$scope.url+"/index.php/Manage/User/userEdit",
			method:'GET',
			params:{'id':id,'realname':realname,'phone':phone}
		}).success(function(data){
			if (data=="success") {
				
				$ionicLoading.show({
			                    template:"修改成功",
			                    noBackdrop:true,
			                    duration:1500
			                })
				$location.path("/VipManagement");
			}else{
				
				$ionicLoading.show({
			                    template:data,
			                    noBackdrop:true,
			                    duration:1500
			                })
			}
		})

	}
	   
	// 会员删除
	$scope.dele=function(id){
		 $ionicPopup.confirm({
              template: "<p class='center'>您是否允许删除该会员</p>",
              title: "<h3>会员删除</h3>",
              okText: '确定',
              cancelText: '取消',
          })
          .then(function(res){
              if(res){
              		$http.get("http://"+$scope.url+"/index.php/Manage/User/userDelete?id="+id).success(function(data){
				        if (data=="success") {
				        	$ionicLoading.show({
						              template:"删除成功",
						              noBackdrop:true,
						              duration:1500
						                })
				        	$location.path("/VipManagement");
				        }else{
				        	$ionicLoading.show({
						            template:"删除失败",
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

.controller('paymentCtrl',function($scope,$http,$rootScope,$ionicLoading,$location,$timeout){
	var run = false;    
    var obj = {current:0,count:10};
    $scope.onselect=function(select){
  		$scope.select=select;
  		$scope.hasmore=true;  //上拉加载动画
        obj.current=0;
        var result = chushihua(obj,1,select);
  	}
        //下拉加载
        $scope.loadMore = function(select){ 
            if(select==1){
              var old = $scope.payments;
            }else{
              var old=$scope.paymonths;
            }
            if(old!=undefined){
              var result = chushihua(obj,3,select); 
            }
            $timeout(function(){
                $scope.$broadcast('scroll.infiniteScrollComplete');
            },500);   
            
        }; 
        function chushihua(obj_data,state,select){
            if(!run){
              run = true;
              if(select==1){
                // 查询出支付流水日志
                $http({
                    method:'GET',
                    url:"http://"+$scope.url+"/index.php/Manage/Pay/paylist",
                    params:obj_data,
                }).success(function(data){
                    run = false;
                    if(state==3){
                        if (data==null||data.length==0) {
                          console.log("结束");
                          $scope.hasmore=false;
                        }else{
                          obj.current += obj.count;
                          $scope.payments= $scope.payments.concat(data); 
                        }
                        
                    }else{
                      
                        $scope.payments=data;
                    }
                    
                })
              }else{
                // 查询出月数据统计
                  $http({
                      method:'GET',
                      url:"http://"+$scope.url+"/index.php/Manage/Pay/paymonth",
                      params:obj_data,
                  }).success(function(data){
                      run = false;
                      if(state==3){
                          if (data==null||data.length==0) {
                            console.log("结束");
                            $scope.hasmore=false;
                          }else{
                            obj.current += obj.count;
                            $scope.paymonths= $scope.paymonths.concat(data); 
                          }
                          
                      }else{
                        
                          $scope.paymonths=data;
                      }
                      
                  })
              }
              
            }
        }
	// // 查询出支付流水日志
	// $http.get("http://"+$scope.url+"/index.php/Manage/Pay/paylist").success(function(data){
 //        $scope.payments=data;
 //  	})
 //  	// 查询出月数据统计
	// $http.get("http://"+$scope.url+"/index.php/Manage/Pay/paymonth").success(function(data){
 //        $scope.paymonths=data;
 //  	})
	
  	
  	// 下载
  	var href=$location.$$absUrl;
  	$scope.downloads=function(type_num){
  		$http.get("http://"+$scope.url+"/index.php/Manage/Pay/download").success(function(data){
  			if (data=="你没有下载数据的权限") {
  				$ionicLoading.show({
			                    template:data,
			                    noBackdrop:true,
			                    duration:1500
			                })

  				$location.path(href); 
  			}
			var system = {
				win: false,
				mac: false,
				xll: false,
				ipad:false
			};
			var p = navigator.platform;
			system.win = p.indexOf("Win") == 0;
			system.mac = p.indexOf("Mac") == 0;
			system.x11 = (p == "X11") || (p.indexOf("Linux") == 0);
			system.ipad = (navigator.userAgent.match(/iPad/i) != null)?true:false;

			if (system.win || system.mac || system.xll||system.ipad) {
				window.open("http://218.15.27.250:10080/houduan/index.php/Manage/Pay/download?select="+type_num);
				
			} else {
				window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function(fileEntry) {
					fileEntry.getDirectory("Download", { create: true, exclusive: false }, function (fileEntry) {
						var myDate = new Date();
						var filename='paylog'+myDate.getFullYear()+(myDate.getMonth()+1)+myDate.getDate()+myDate.getHours()+myDate.getMinutes()+'.csv';
						var fileURL=fileEntry.toURL()+filename;
						var fileTransfer = new FileTransfer();
						var uri = encodeURI("http://218.15.27.250:10080/houduan/index.php/Manage/Pay/download?select="+type_num);
						fileTransfer.download(
							uri,
							fileURL,
							function(entry) {
								alert('下载完成 ('+fileURL+')');
							},
							function(error) {
								alert('下载出错：'+error.code);
							},
							false,
							{
								headers: {
									"Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
								}
							}
						);
					},function(){alert("没有找到下载目录")});
				});
			}
  		});
		return false;
  	}
})

.controller('systemCtrl',function($rootScope,$scope,$http,fileReader,$ionicLoading,$location,$timeout){	
		
		// 操作管理员列表
		$http.get("http://"+$scope.url+"/index.php/Manage/System/systemList").success(function(data){
        	$scope.systems=data;
  		})
  		
  		//操作员管理编辑获取id,同时也判断管理员有没有权限
  		$scope.edit=function(id){
  			$rootScope.editID=id;
  			$http.get("http://"+$scope.url+"/index.php/Manage/System/permissionsWho").success(function(data){
        		if (data==false) {
        			$location.path('/system');
        			$ionicLoading.show({
			                    template:"你没有编辑管理员的权限",
			                    noBackdrop:true,
			                    duration:1500
			                })
        		}else{
        			
        		}
  			})
  		}
  		
  		// 获取管理员id
  		$scope.revisions=function(id){
  			$rootScope.permissionID=id;

  		}
  		// 判断管理员有没有权限
  		$scope.add=function(){
  			$http.get("http://"+$scope.url+"/index.php/Manage/System/permissionsWho").success(function(data){
        		if (data==false) {
        			$location.path('/system');
        			$ionicLoading.show({
			                    template:"你没有新增管理员的权限",
			                    noBackdrop:true,
			                    duration:1500
			                })
        		}else{
        			
        		}
  			})
  		}
	    //公告信息-新增公告-历史公告
	    $scope.flag1=true;
	    $scope.flag2=false;
	    $scope.isSelect1=true;
	    $scope.isSelect2=false;
	    $scope.sub_click1=function(){
			$scope.flag1=true;
			$scope.flag2=false;
			$scope.isSelect1=true;
			$scope.isSelect2=false;
		}
		$scope.sub_click2=function(){
			$scope.flag1=false;
			$scope.flag2=true;
			$scope.isSelect1=false;
			$scope.isSelect2=true;
		}
		// 查询出历史公告信息
        $http.get("http://"+$scope.url+"/index.php/Manage/System/noticeList").success(function(data){
			$scope.items=data;
  		})
		//保存公告信息
		//用户上传图片
        $scope.getFile = function (file) {
                    
            fileReader.readAsDataUrl(file, $scope).then(function(result) {
                  $scope.mypic = result;
                  var files=[];
                  files.push(file);
                  var fd = new FormData();
                  angular.forEach(files,function(val,key){
                        fd.append(key, val);
              
                    });
                    
                    $http.post('http://'+$scope.url+'/index.php/Manage/System/upload',fd,{
                        withCredentials: true,
                        headers: {'Content-Type': undefined },
                        transformRequest: angular.identity
                    }).then(function(response){
                        if(response.data['status']=='success'){
                			
                            $rootScope.noticeImg=response.data['message'];
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
        $scope.noticeForm=function(cont){
        	var cont=cont.$$lastCommittedViewValue;
        	if(cont==undefined||cont==""){
        		$ionicLoading.show({
                    template:"公告信息不能为空",
                    noBackdrop:true,
                    duration:1500
                })
        	// }
        	// else if($rootScope.noticeImg==undefined||$rootScope.noticeImg==""){
        	// 	$ionicLoading.show({
         //            template:"图片上传失败",
         //            noBackdrop:true,
         //            duration:1500
         //        })
        	}else{
        		$http({
	        		method:'post',
	        		url:'http://'+$scope.url+'/index.php/Manage/System/noticeAdd',
	        		data:{
	        			'cont':cont,
	        			'noticeImg':$rootScope.noticeImg,
	        		},
	        	})
	        	.success(function(res){
	        		if (res) {
	        			$ionicLoading.show({
		                    template:"添加成功",
		                    noBackdrop:true,
		                    duration:1500
		                })
		                $timeout(function(){
		                	window.location.reload();
		                },1000)       
	        		}else{
	        			$ionicLoading.show({
		                    template:"添加失败",
		                    noBackdrop:true,
		                    duration:1500
		                })
	        		}
	        	})
        	}
        	
        }
})


.controller('priceCtrl',function($scope,$http,$location,$ionicLoading){
	$scope.start_time='value';
	$scope.end_time='value';

	$http.get("http://"+$scope.url+"/index.php/Manage/Price/price").success(function(data){
        	$scope.price=data;
  		})
		
		$scope.submitForm=function(priceForm){
			
			var start_time=priceForm.start_time.$$lastCommittedViewValue
			var end_time=priceForm.end_time.$$lastCommittedViewValue
			
			if (priceForm.number.$$lastCommittedViewValue==undefined) {
				var number=10;
			}else{
				var number=priceForm.number.$$lastCommittedViewValue;
			}
			var url="http://"+$scope.url+"/index.php/Manage/Price/price_set";
			$http({
				url:url,
				method:'GET',
				params:{'start_time':start_time,'end_time':end_time,'number':number}
			}).success(function(data){
				$ionicLoading.show({
			                    template:data,
			                    noBackdrop:true,
			                    duration:1500
			                })
				window.location.reload();
			})
		}


		
})
	//代办理价格设置功能开始
/*.controller("backesCtrl",function($scope,$ionicLoading){
	$ionicLoading.show({
			template:"亲，该功能还没有开放",
			noBackdrop:true,
			duration:1500

	})
})*/

/*提现管理*/
.controller("ti_cashCtrl",function($scope,$http,$rootScope,$ionicLoading,$timeout){
	$scope.hasmore=true;	//上拉加载动画
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
              // 查询提现管理详情
              $http({
                    method:'GET',
                    url:"http://"+$scope.url+"/index.php/Manage/Withdraw/withdraw",
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
	// // 查询提现管理列表
	// $http.get("http://"+$scope.url+"/index.php/Manage/Withdraw/withdraw").success(function(data){
	//         	$scope.items=data;
	//   		})
	// 审核
	$scope.check=function(id){
		
		$http.get("http://"+$scope.url+"/index.php/Manage/Withdraw/withdrawCheck?withdraw_id="+id).success(function(data){
	        	if (data==true) {
	        		$ionicLoading.show({
			                    template:'确认成功',
			                    noBackdrop:true,
			                    duration:1500
			                })
	        		window.location.reload();
	        	}else{
	        		$ionicLoading.show({
			                    template:'确认失败',
			                    noBackdrop:true,
			                    duration:1500
			                })
	        	}
	  		})
	}
	$scope.go=function(withdraw_id){
		$rootScope.withdraw_id=withdraw_id;
	}
})

/*提现管理详情*/
.controller("TakeCashManageCtrl",function($scope,$http,$rootScope,$ionicLoading,$timeout){
	var withdraw_id=$rootScope.withdraw_id

	
	// 查询提现管理详情
	$http.get("http://"+$scope.url+"/index.php/Manage/Withdraw/withdrawDetail?withdraw_id="+withdraw_id).success(function(data){
	        	$scope.item=data;
	 })
})


/*管理员编辑*/
.controller("EditCtrl",function($scope,$http,$rootScope,$ionicLoading,$location,$timeout){
	var id=$rootScope.editID;
	// 查询管理员详情
	$http.get("http://"+$scope.url+"/index.php/Manage/System/adminEditList?id="+id).success(function(data){
			$scope.item=data;	
	 })
	// 保存编辑
	$scope.edit=function(name,username,phone,id){
		var name=name.$$lastCommittedViewValue;
		var username=username.$$lastCommittedViewValue;
		var phone=phone.$$lastCommittedViewValue;
		$http({
				url:"http://"+$scope.url+"/index.php/Manage/System/adminEdit",
				method:'GET',
				params:{'id':id,'name':name,'username':username,'phone':phone}
			}).success(function(data){
				if (data=="success") {
					$ionicLoading.show({
			                    template:"保存成功",
			                    noBackdrop:true,
			                    duration:2000
			                })
					$location.path("/system");
				}else if(data=="superadmin"){
					$ionicLoading.show({
			                    template:"保存成功，请重新登录",
			                    noBackdrop:true,
			                    duration:1500
			                })
					$http.get("http://"+$scope.url+"/index.php/Manage/Index/loginout").success(function(data){
			        	if (data==true) {
			        		$timeout(function(){
		                	$location.path("/Login");
		                	},2000);
			            	$rootScope.user=false;	
			        	}
  					})
					
				}
				else{
					$ionicLoading.show({
			                    template:data,
			                    noBackdrop:true,
			                    duration:1500
			                })
				}
				
			})
	}

	// 删除
	$scope.dele=function(id){
		
		$http.get("http://"+$scope.url+"/index.php/Manage/System/adminDelete?id="+id).success(function(data){
	        	$ionicLoading.show({
			                    template:data,
			                    noBackdrop:true,
			                    duration:1500
			                })
				$location.path("/system");
	 	})
	}
	
})


/*管理员新增*/
.controller("AddCtrl",function($scope,$http,$rootScope,$ionicLoading,$location){
	
	$scope.add=function(name,username,phone){
		var name=name.$$lastCommittedViewValue;
		var username=username.$$lastCommittedViewValue;
		var phone=phone.$$lastCommittedViewValue;
		$http({
				url:"http://"+$scope.url+"/index.php/Manage/System/adminAdd",
				method:'GET',
				params:{'name':name,'username':username,'phone':phone}
			}).success(function(data){
				if (data=="success") {
					$ionicLoading.show({
			                    template:"新增成功",
			                    noBackdrop:true,
			                    duration:1500
			                })
					$location.path("/system");
				}else{
					$ionicLoading.show({
			                    template:data,
			                    noBackdrop:true,
			                    duration:1500
			                })
					
				}
				
			})
	}
	
})

// 权限管理
.controller("PermissionCtrl",function($scope,$http,$rootScope,$ionicLoading,$location){
	var id=$rootScope.permissionID;

	$scope.permissionsForm={};
  		$scope.permissionsForm.canCtrl={
  			'adduser':'',
  			'edituser':'',
  		};
  		$scope.checkCtrl={};
  		$scope.checkCtrl=$scope.permissionsForm.canCtrl;

	//权限管理
		$http.get("http://"+$scope.url+"/index.php/Manage/System/permissions?id="+id).success(function(data){
			$scope.permissionsForm.canCtrl=data[0]['permissions'];
			$scope.checkCtrl=$scope.permissionsForm.canCtrl;
			$scope.id=data[0]['id'];
  		})
  		// 权限设置
  		$scope.submitForm=function(permissionsForm,id){
  			if(!permissionsForm.$dirty){
  				permissionsForm.canCtrl=$scope.permissionsForm.canCtrl;
  				
  			}else{
  				
  				var o1=$scope.permissionsForm.canCtrl,
					o2=permissionsForm.canCtrl;
  				var extend=function(o,n,override){
				   for(var p in o)if(o.hasOwnProperty(p) && (!n.hasOwnProperty(p) || override))n[p]=o[p];
				   	return n;
				};		
				var p=extend(o1,o2);
  				permissionsForm.canCtrl=p;
  				
  			};
  			// console.log(permissionsForm);
  			// console.log(permissionsForm.adduser.$$lastCommittedViewValue);
  			var id=id;
  			var adduser=permissionsForm.canCtrl.adduser;
  			var edituser=permissionsForm.canCtrl.edituser;
  			var deluser=permissionsForm.canCtrl.deluser;
  			var serviceShenhe=permissionsForm.canCtrl.serviceShenhe;
  			var serviceShezhi=permissionsForm.canCtrl.serviceShezhi;
  			var serviceChakan=permissionsForm.canCtrl.serviceChakan;
  			var orderChaxun=permissionsForm.canCtrl.orderChaxun;
  			var orderChuli=permissionsForm.canCtrl.orderChuli;
  			var infor=permissionsForm.canCtrl.infor;
  			var download=permissionsForm.canCtrl.download;
  			
  			$http({
				url:"http://"+$scope.url+"/index.php/Manage/System/permissions_set",
				method:'GET',
				params:{'id':id,'adduser':adduser,'edituser':edituser,'deluser':deluser,'serviceShenhe':serviceShenhe,'serviceShezhi':serviceShezhi,'serviceChakan':serviceChakan,'orderChaxun':orderChaxun,'orderChuli':orderChuli,'infor':infor,'download':download,}
			}).success(function(data){
				
				if (data=="success") {
					$ionicLoading.show({
			                    template:"编辑成功！",
			                    noBackdrop:true,
			                    duration:1500
			                })
					
				}else{
					$ionicLoading.show({
			                    template:data,
			                    noBackdrop:true,
			                    duration:1500
			                })
				}
				
			})
  		}
})






