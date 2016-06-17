angular.module('24EApp.nrouters', [])
.config(function($stateProvider, $urlRouterProvider) {
	$stateProvider

	  .state('vipm',{
	  		url:'/vipm',
		  	templateUrl:'templates/Manage/vipm.html',
		  	controller:'vipmCtrl'
	  })

	  .state('servicem',{
	  		url:'/servicem',
	  		cache:'false',
	  		templateUrl:'templates/Manage/servicem.html',
	  		controller:'servicemCtrl'
	  })

	  .state('fwsszxq',{
	  		url:'/fwsszxq',
	  		cache:'false',
	  		params:{'id':null},
	  		templateUrl:'templates/Manage/fwsszxq.html',
	  		controller:'fwCtrl'
	  })

	  .state('orderm',{
	  		url:'/orderm',
	  		templateUrl:'templates/Manage/orderm.html',
	  		controller:'ordermCtrl'
	  })

	  .state('analyzestatistics',{
	  		url:'/analyzestatistics',
	  		templateUrl:'templates/Manage/analyzestatistics.html',
	  		controller:'analyzestatisticsCtrl'
	  })
})