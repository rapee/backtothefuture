$(function() {
	$('#form-search').ajaxForm({
		url: 'http://localhost:8000/search',
		type: 'GET',
		dataType: 'json',
		resetForm : true,
		success : function(data){
			var imageArray = data.SearchForImagesResult.Images;
			var content = '<ul>';
			$.each(imageArray,function(index, image){
				console.log(image);
				content += '<li>';
				content += '<img src="'+image.UrlThumb+'">'
				content += '</li>';
			});
			content+='</ul>';
			$('#result').html(content);
		},
		error : function(xhr){
			console.log(xhr);
		}
	})
});