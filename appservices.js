angular.module("24EApp.appservices", [])

.constant('AUTH_EVENTS', {
  loginSuccess: 'auth-login-success',
  loginFailed: 'auth-login-failed',
  logoutSuccess: 'auth-logout-success',
  sessionTimeout: 'auth-session-timeout',
  notAuthenticated: 'auth-not-authenticated',
  notAuthorized: 'auth-not-authorized'
})

.constant('USER_ROLES', {
  all: '*',
  admin: 'admin',
  user: 'user',
  driver: 'driver',
})
//同步获取后台用户session
.factory('UserInfo', ['$http', '$q', function ($http,$q) {  
  return {  
    query : function() {  
      var deferred = $q.defer(); // 声明延后执行，表示要去监控后面的执行
      $http({method: 'GET', url: 'http://'+linkUrl+'/index.php/Client/Login/getsesstion'}).  

        success(function(data, status, headers, config) {
        deferred.resolve(data);  // 声明执行成功，即http请求数据成功，可以返回数据了  
      }).  
      error(function(data, status, headers, config) {  
        deferred.reject(data);   // 声明执行失败，即服务器返回错误  
      });  
      return deferred.promise;   // 返回承诺，这里并不是最终数据，而是访问最终数据的API  
    } // end query  
  };  
}])  

//用户登录
.factory('AuthService', function ($http) {
  var authService = {};

  authService.login = function (credentials) {
    return $http
      .get('http://'+linkUrl+'/index.php/Client/Login/login?tel='+credentials.tel+'&code='+credentials.code+'&ip='+credentials.ip)
      .then(function (res) {
      	//console.log(res);
        //Session.create(res.data.id, res.data.phone,res.data.type);
        return res.data;
      });
  };

  // authService.isAuthenticated = function () {
  //   return !!Session.id;
  // };

  // authService.isAuthorized = function (authorizedRoles) {
  //   if (!angular.isArray(authorizedRoles)) {
  //     authorizedRoles = [authorizedRoles];
  //   }
  //   return (authService.isAuthenticated() &&
  //     authorizedRoles.indexOf(Session.userTel) !== -1);
  // };
   return authService;
})

.service('Session', function ($http,$rootScope) {
	var _this=this;
   return _this;
})



// 文件上传
.factory('fileReader', ["$q", "$log", function($q, $log){
  var onLoad = function(reader, deferred, scope) {
    return function () {
      scope.$apply(function () {
        deferred.resolve(reader.result);
      });
    };
  };
  var onError = function (reader, deferred, scope) {
    return function () {
      scope.$apply(function () {
        deferred.reject(reader.result);
      });
    };
  };
  var getReader = function(deferred, scope) {
    var reader = new FileReader();
    reader.onload = onLoad(reader, deferred, scope);
    reader.onerror = onError(reader, deferred, scope);
    return reader;
  };
  var readAsDataURL = function (file, scope) {
    var deferred = $q.defer();
    var reader = getReader(deferred, scope);     
    reader.readAsDataURL(file);
    return deferred.promise;
  };
  return {
    readAsDataUrl: readAsDataURL  
  };
}])

//文件上传指令
.directive('fileModel', ['$parse', function ($parse) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs, ngModel) {
      var model = $parse(attrs.fileModel);
      var modelSetter = model.assign;
      element.bind('change', function(event){
        scope.$apply(function(){
          modelSetter(scope, element[0].files[0]);
        });
        //附件预览
           scope.file = (event.srcElement || event.target).files[0];
          
          scope.getFile(scope.file);
      });
    }
  };
}])

//地图指令
.directive("appMap", function () {
  return {
    restrict: "E",
    replace: true,
    template: "<div id='allMap'></div>",
    scope: {
      center: "=",   
      markers: "=",    
      width: "@",    
      height: "@",    
      zoom: "@",      
      zoomControl: "@",   
      scaleControl: "@",   
      address:"@"
    },
    link: function (scope, element, attrs) {
      var map;
      // 百度地图API功能
      map = new BMap.Map("allMap");
      //map.addControl(new BMap.ZoomControl());
      // 创建地址解析器实例
       var myGeo = new BMap.Geocoder();
      // 将地址解析结果显示在地图上,并调整地图视野
      myGeo.getPoint(scope.address, function(point){
        if (point) {
          map.centerAndZoom(point, 16);
          map.addOverlay(new BMap.Marker(point));
        }
      }, "");
    }
  };
})

//关闭弹窗指令
.directive('rjCloseBackDrop', [function() {
  return {
    scope: false,//共享父scope
    restrict: 'A',
    replace: false,
    link: function(scope, iElm, iAttrs, controller) {
      //要在html上添加点击事件,
      var htmlEl = angular.element(document.querySelector('html'));
      htmlEl.on("click", function(event) {
        if (event.target.nodeName === "HTML" &&
          scope.popup &&
          scope.popup.isPopup) {
          scope.popup.close();
          scope.popup.isPopup = false;
        }
      });
    }
  };
}])

//将传入数据转换为字符串,并清除字符串中非数字与.的字符  
//按数字格式补全字符串
.factory('FloatStr',function(){
  var getFloatStr = function(num){  
        num += '';  
        num = num.replace(/[^0-9|\.]/g, ''); //清除字符串中的非数字非.字符  
          
        if(/^0+/) //清除字符串开头的0  
            num = num.replace(/^0+/, '');  
        if(!/\./.test(num)) //为整数字符串在末尾添加.00  
            num += '.00';  
        if(/^\./.test(num)) //字符以.开头时,在开头添加0  
            num = '0' + num;  
        num += '00';        //在字符串末尾补零  
        num = num.match(/\d+\.\d{2}/)[0]; 
        return num; 
  };
  return {getFloatStr:getFloatStr};

}) 

/*关键字检索--智能筛选*/
.directive('mapSuggestion', [function() {
  return {
    scope: true,//共享父scope
    restrict: 'A',
    transclude: true,
    replace: true,
    link: function(scope, iElm, iAttrs, controller) {
    
      var ac = new BMap.Autocomplete(    //建立一个自动完成的对象
      {"input" : iAttrs.id,
        "onSearchComplete":function(e){
        
            scope.getItems(e.wr);               
        }
      });
      // scope.$watch('value',function(newValue,oldValue, scope){ 
      //       scope.getItems(scope.value);
      // });
      
    }
  };
}])