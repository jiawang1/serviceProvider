(function(){
	"use strict";

	$(function(){
		$("#server-submit").on("click", function(e){
			var val = $("#server-form").serialize();

			$.post(
				'/__server_config__/save_server_config',
				val,
				function(data){

					console.log(data);

				}
			);
		});

		$("#service-submit").on("click", function(e){
			var serviceUrl = $("#service-url").val();
			var serviceData = $("#service-data").val();
			var serviceMethod = $("#service-method").val();
			var serviceParam = $("#service-param").val();

			if(serviceUrl.length === 0 ||serviceMethod.length === 0 ){
				return false;
			}

			$.post(
				'/__server_config__/save_service_config',
				{
					serviceUrl: serviceUrl,
					serviceData:serviceData,
					serviceMethod:serviceMethod,
					serviceParam:serviceParam

				},
				function(data){
					if(data && data !=="no_change"){

						var serviceTd = $("<td class='service-url'>").text(data.url);
						var actionTd = $('<td><a class="edit">edit</a><a class="delete">delete</a></td>');
						var paramTd = $("<td class='service-param'>").text(data.param);
						var methodTd = $("<td class='service-method'>").text(data.method);
						$("table").append($("<tr>").append(serviceTd).append(methodTd).append(paramTd).append(actionTd));
					}
				}
			);
		});

		$("table").on("click",".delete", function(e){

			var $targetTd = $(e.currentTarget).parent();
			$.post("/__server_config__/delete_service_config", {
				serviceUrl: $targetTd.siblings(".service-url").text().trim(),
				serviceMethod: $targetTd.siblings(".service-method").text().trim(),
				serviceParam:  $targetTd.siblings(".service-param").text().trim(),
			}, 
			function(data){
				if(data && data.url){
					$targetTd.parent().remove();
				}			
			});
		});

		$("table").on("click",".sync", function(e){
			var $targetTd = $(e.currentTarget).parent();
			var methodName =  $targetTd.siblings(".service-method").text().trim();

			var param =	 $targetTd.siblings(".service-param").text().trim(),
				url = $targetTd.siblings(".service-url").text().trim();
			
			var setting = {	
					dataType: 'json',
					type: methodName,
					headers:{
						'__ignore-cache__':true
					},
					success:function(data){
						console.log("get back");
						$targetTd.siblings(".service-url").css({color: 'green'});

					},
					error:function(err){
						console.log(err);

						$targetTd.siblings(".service-url").css({color: 'red'});
					}
				};

				if(methodName === 'get'){
					(param.length > 0)&& (url = `${url}?${param}`);
				}else{
					(param.length > 0) && (setting.data = param);	
					setting.contentType = 'application/json';
				}

				setting.url = url;
				
			$.ajax(setting);
			
		});

		$("table").on("click",".edit", function(e){
			var $targetTd = $(e.currentTarget).parent();
			$.get("/__server_config__/load_service",{
				serviceUrl: $targetTd.siblings(".service-url").text().trim(),
				serviceMethod: $targetTd.siblings(".service-method").text().trim(),
				serviceParam: $targetTd.siblings(".service-param").text().trim()
			}, function(oData){
				if(oData && oData.url){
					$("#service-method").val(oData.method);
					$("#service-url").val(oData.url);
					$('#service-data').val(oData.data);
					$('#service-param').val(oData.param)
				}			
			});
		});
	});

})();
