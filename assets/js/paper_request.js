
/*
	FOR STRANDS 
		requestStrandPaperWithSelect(requestURL, selector, validator, exam_id, topic_id, strandOptions)
		requestStrandPaperWOSelect(requestURL, selector, validator, exam_id, topic_id, strand_id)
		
	FOR CATEGORIES 
*/
	
	
function requestStrandPaperWithSelect(name, buttonOrThumbnail, requestURL, selector, validator, exam_id, topic_id, strandOptions, paperNumber){
	var successfulResponse = false;
	var responseReceived = false;
	
	Swal.fire({
		// Open strand select pop-up
		title: 'Which Strand?',
		html: '<select class="custom-select form-control" id="strandIDSelect">' + strandOptions + '</select>',
		showCancelButton: false,
		confirmButtonText: 'Request paper',
		showLoaderOnConfirm: true,
		preConfirm: (selection) => {
	
			// Send paper request 
			$.ajax({
				url: requestURL,
				type: "POST",
				data: {
					selector: selector,
					validator: validator,
					buttonOrThumbnail: buttonOrThumbnail,
					paperNumber: paperNumber,
					exam_id: exam_id,
					topic_id: topic_id,
					strand_id: $("#strandIDSelect").val()
				},
				success: function(response){
					responseReceived = true;
					
					if (typeof(response.success) == 'undefined') {
						paperSuccess = false;
						responseMessage = response.error;
					} else {
						paperSuccess = true;
						responseMessage = response.success;
					}
					
				},
				error: function(){
					responseReceived = true;
					paperSuccess = false;
					responseMessage = "Connection lost! If the issue persists, contact support.";
				},
			}),
			
			
			// Close select pop-up
			swal.close();
			let timerInterval;
			
			// Timer pop-up 
			Swal.fire({
				title: 'Hi ' + name,
				html: 'I\'m generating a paper based on your metrics, hang tight!',
				timer: 3000,
				timerProgressBar: false,
				didOpen: () => {
					Swal.showLoading();
					timerInterval = setInterval(() => {
						if(Swal.getTimerLeft() < 300 && !responseReceived){
							Swal.increaseTimer(100);
						}
					}, 100)
				},
				willClose: () => {
					clearInterval(timerInterval)
				}
			}).then((result) => {
				if (result.dismiss === Swal.DismissReason.timer) {
					if(paperSuccess){
						window.location.href = responseMessage;
					} else {
						swal.close();
						Swal.fire('Error', responseMessage, 'warning');
					}
				}
			});
		},
		allowOutsideClick: () => !Swal.isLoading()
	});
}





function requestStrandPaperWOSelect(name, buttonOrThumbnail, requestURL, selector, validator, exam_id, topic_id, strand_id, paperNumber){
	// Status trackers 
	var responseReceived = false;
	var paperSuccess = false;
	var responseMessage = "";
	let timerInterval;
	
	// Request paper 
	$.ajax({
		url: requestURL,
		type: "POST",
		data: {
			selector: selector,
			validator: validator,
			buttonOrThumbnail: buttonOrThumbnail,
			paperNumber: paperNumber,
			exam_id: exam_id,
			topic_id: topic_id,
			strand_id: strand_id
		},
		success: function(response){
			responseReceived = true;
			
			if (typeof(response.success) == 'undefined') {
				paperSuccess = false;
				responseMessage = response.error;
			} else {
				paperSuccess = true;
				responseMessage = response.success;
			}
		},
		error: function(){
			responseReceived = true;
			paperSuccess = false;
			responseMessage = "Connection lost! If the issue persists, contact support.";
		},
	}),
	
	
	// Timer pop-up 
	Swal.fire({
		title: 'Hi ' + name,
		html: 'I\'m generating a paper based on your metrics, hang tight!',
		timer: 3000,
		timerProgressBar: false,
		didOpen: () => {
			Swal.showLoading();
			
			timerInterval = setInterval(() => {
				if(Swal.getTimerLeft() < 300 && !responseReceived){
					Swal.increaseTimer(100);
				}
			}, 100)
		},
		willClose: () => {
			clearInterval(timerInterval)
		}
	}).then((result) => {
		if (result.dismiss === Swal.DismissReason.timer) {
			if(paperSuccess){
				window.location.href = responseMessage;
			} else {
				swal.close();
				Swal.fire('Error', responseMessage, 'warning');
			}
		}
	});
}





function requestCategoryPaperWOSelect(name, buttonOrThumbnail, requestURL, selector, validator, exam_id, category_id, paperNumber){
	// Status trackers 
	var responseReceived = false;
	var paperSuccess = false;
	var responseMessage = "";
	let timerInterval;
	
	// Request paper 
	$.ajax({
		url: requestURL,
		type: "POST",
		data: {
			selector: selector,
			validator: validator,
			buttonOrThumbnail: buttonOrThumbnail,
			paperNumber: paperNumber,
			exam_id: exam_id,
			category_id: category_id
		},
		success: function(response){
			responseReceived = true;
			
			if (typeof(response.success) == 'undefined') {
				paperSuccess = false;
				responseMessage = response.error;
			} else {
				paperSuccess = true;
				responseMessage = response.success;
			}
		},
		error: function(){
			responseReceived = true;
			paperSuccess = false;
			responseMessage = "Connection lost! If the issue persists, contact support.";
		},
	}),
	
	
	// Timer pop-up 
	Swal.fire({
		title: 'Hi ' + name,
		html: 'I\'m generating a paper based on your metrics, hang tight!',
		timer: 3000,
		timerProgressBar: false,
		didOpen: () => {
			Swal.showLoading();
			
			timerInterval = setInterval(() => {
				if(Swal.getTimerLeft() < 300 && !responseReceived){
					Swal.increaseTimer(100);
				}
			}, 100)
		},
		willClose: () => {
			clearInterval(timerInterval)
		}
	}).then((result) => {
		if (result.dismiss === Swal.DismissReason.timer) {
			if(paperSuccess){
				window.location.href = responseMessage;
			} else {
				swal.close();
				Swal.fire('Error', responseMessage, 'warning');
			}
		}
	});
}