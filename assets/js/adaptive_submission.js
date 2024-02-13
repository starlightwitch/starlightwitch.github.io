$("#quiz-form").submit(function(e) {
	e.preventDefault();
	

	// STUDENT METHOD
	let method_inputs = document.querySelectorAll('input[name="student_method[]"]');
	let student_method = [];
	
	// Create array 
	for (let i = 0; i < method_inputs.length; i++) {
		// Parse the array in the value attribute of the input and store it in the "methods" array
		if (method_inputs[i].type === "hidden") {
			if(method_inputs[i].value !== ""){
				let method_line = JSON.parse(decodeURIComponent(method_inputs[i].value));
				student_method.push(method_line);
			}
		}
	}
	
	
	// STUDENT ANSWER
	let answer_inputs = document.querySelectorAll('input[name="answers[]"]');
	let student_answer = [];
	
	// Create array 
	for (let i = 0; i < answer_inputs.length; i++) {
		// If answer is a checkbox and the checkbox is not checked, skip current loop and don't add the value in the "answers" array
		if (answer_inputs[i].type === "checkbox" && answer_inputs[i].checked === false) {
			continue;
		}
		// If answer is a hidden input, parse the array in the value attribute of the input and store it in the "answers" array
		if (answer_inputs[i].type === "hidden") {
			let valueArray = JSON.parse(decodeURIComponent(answer_inputs[i].value));
			student_answer = valueArray;
			continue;
		}

		let answer = answer_inputs[i].value;
		student_answer.push(answer);
	}
	
	
	// SUBMIT REQUEST 
	$.ajax({
		url: "https://api.tutorpal.co.uk/student_api/in_page/adaptive_submit.php",
		type: "POST",
		data: {
			selector: 						selector,
			validator: 						validator,

			student_method:			student_method,
			student_answer:			student_answer,
			question_id:					question_id,
			
			paper_id: 						paper_id,
			paper_type:					paper_type,
			
			segment_id: 					segment_id,
			combination_id:			combination_id
		},
		success: function (response) {
			// API response 
			var response_object = response;
			

			// CHECK ANSWER VALIDITY 
			// Answer status may be invalid if say we are expecting 3 answers but only received 2
			// If invalid let the student submit again 
			var answer_status = response_object.answer_status;
			var error_status = response_object.error;
			
			// If there is an error 
			if(error_status){
				triggerPopup(error_status);
				return;
			}
			
			
			// If valid display marked answer 
			if(answer_status == "valid"){
				
				// RE-ATTEMPT 
				var allow_another_attempt 	= response_object.allow_another_attempt;
				var attempts_left_message 	= response_object.attempts_left_message;
				
				if(allow_another_attempt){
					Swal.fire(
						'Wrong answer',
						attempts_left_message,
						'error'
					);
					
					return;
				}
				
				
				// STUDENT METHOD 
				// Remove working out container
				removeWorkingOutConfig();
				
				// Receive the marked method 
				var marked_method 							= response_object.marked_method;
				var mark_scheme_border_colour		= response_object.mark_scheme_border_colour;
				var method_border_colour					= response_object.method_border_colour;
				var display_mark_scheme					= response_object.display_mark_scheme;
				var mark_scheme									= response_object.mark_scheme;
				
				// MARKED METHOD 
				// Display the container 
				let workingOutContainer = document.getElementById('submitted-student-method-container');
				workingOutContainer.style.display = "block";
				
				// Container border
				if (method_border_colour.length !== 0){
					workingOutContainer.classList.add(method_border_colour);	
				}
				
				// Append each line of working 
				marked_method.forEach(
					function(working_out_line){
						var el = document.createElement( 'p' );
						el.innerHTML = working_out_line;
						workingOutContainer.append(el);
					}
				);
				
				
				// MARK SCHEME 
				// Display method marks available 
				if(display_mark_scheme === true){
					let markSchemeContainer = document.getElementById('mark-scheme-container');
					markSchemeContainer.style.display = "block";
					
					let markSchemeLinesContainer = document.getElementById('mark-scheme-lines-container');
					markSchemeLinesContainer.classList.add(mark_scheme_border_colour);
					
					mark_scheme.forEach(
						function(mark_scheme_line){
							var el = document.createElement( 'p' );
							el.innerHTML = mark_scheme_line;
							markSchemeLinesContainer.append(el);
						}
					);
				}
				
				
				
				// SOLUTION SECTION 
				// Display "Solution" title 
				document.getElementById("solution-title-tag").style.display 			= "block";
				
				// Misconception
				var misconception_alert = response_object.misconception_alert;
				document.getElementById("solution-text-container").innerHTML	+= misconception_alert;
				
				// Solution text
				var solution_text = response_object.solution_text;
				document.getElementById("solution-text-container").innerHTML	+= solution_text;
				
				// Functions to run when the solution is shown
				var s_widget_parameters 			= response_object.s_widget_parameters;
				var s_solution_run_function 		= response_object.s_solution_run_function;
				
				document.getElementById("solution-run").innerHTML = s_widget_parameters + s_solution_run_function;
				
				
				
				// REMOVE CURRENT ANSWER SECTION
				// We do this after the solution run functions so any widgets in the answer section are removed first 
				// If we remove them after then the site crashes as the widget is trying to run without a container 
				document.getElementById("answer-text-and-visual-container").style.display = "none";
			
			
			
				// SHOW MARKED STUDENT ANSWER 
				if(js_answer_type == "checkbox"){
					// CHECKBOX QUESTIONS 
					// Get correct answers
					var correct_checkboxes		= response_object.student_correct;
					var wrong_checkboxes 		= response_object.student_wrong;
					var missed_checkboxes		= response_object.student_missed;
					var neutral_checkboxes 		= response_object.neutral_options;
					
					// Create checkboxes html to inject 
					var checkboxes_html = "";
					
					correct_checkboxes.forEach(
						function(entry){
							var checkbox_value = "<div class='custom-checkboxes'><label class='correct-check'><input type='checkbox' checked disabled /><span></span> " + entry +"</label></div>";
							checkboxes_html += checkbox_value;
						}
					);
					
					wrong_checkboxes.forEach(
						function(entry){
							var checkbox_value = "<div class='custom-checkboxes'><label class='wrong-cross'><input type='checkbox' checked disabled /><span></span> " + entry + "</label></div>";
							checkboxes_html += checkbox_value;
						}
					);

					neutral_checkboxes.forEach(
						function(entry){
							var checkbox_value = "<div class='custom-checkboxes'><label class='neutral-checkbox'><input type='checkbox' checked disabled /><span></span> " + entry + "</label></div>";
							checkboxes_html += checkbox_value;
						}
					);
					
					missed_checkboxes.forEach(
						function(entry){
							var checkbox_value = "<div class='custom-checkboxes'><label class='missed-dash'><input type='checkbox' checked disabled /><span></span> " + entry + "</label></div>";
							checkboxes_html += checkbox_value;
						}
					);
					
					document.getElementById("marked-checkboxes").innerHTML = checkboxes_html;
					
				} else {
					
					// NON-CHECKBOX QUESTIONS 
					// Response variables 
					var formatted_student_answer = response_object.formatted_answer;
					var student_score = response_object.student_score;
					
					// Show student answer 
					if(student_score == 0){
						var class_to_add = "is-invalid";
					} else {
						var class_to_add = "is-valid";
					}
					
					document.getElementById("student-answer-marked").classList.add(class_to_add);
					document.getElementById("student-answer-marked").classList.add("student-formatted-answer");
					document.getElementById("student-answer-marked").innerHTML = formatted_student_answer;
					document.getElementById("student-answer-marked").style.display = "block";
				}
				
				
				
				// RUN MATHJAX
				// This is to type set any maths that is in the solution or marked answers 
				MathJax.typeset();
				
				
				
				// CHANGE SUBMIT BUTTON TO NEXT QUESTION
				document.getElementById("submit-answer-button").style.display = "none";
				document.getElementById("next-question-button").style.display = "block";
				
				// LAST QUESTION HANDLING
				var last_question = response_object.last_question;
				
				if(last_question){
					// Update form values 
					document.getElementById("finishPaper").elements["percentage_score_input"].value 			= response_object.percentage_score;
					document.getElementById("finishPaper").elements["questions_correct_input"].value 			= response_object.questions_correct;
					document.getElementById("finishPaper").elements["point_booster_input"].value 					= response_object.point_booster;
					document.getElementById("finishPaper").elements["points_earned_input"].value 				= response_object.points_earned;
					document.getElementById("finishPaper").elements["points_till_next_level_input"].value 	= response_object.points_till_next_level;
					document.getElementById("finishPaper").elements["percentage_bar_fill_input"].value 		= response_object.percentage_bar_fill;
					
					document.getElementById('next-question-button').setAttribute('onclick', "document.getElementById('finishPaper').submit()")
					document.getElementById("next-question-button").innerHTML = "Finish Paper";
				}
				
				
				
				// Scroll up
				var rect = document.getElementById("question-text").getBoundingClientRect();
				window.scrollTo(0, rect.top + window.scrollY - 120);
				
				
			} else {
				// The provided answer is not valid 
				triggerPopup(answer_status);
				
			}

		},

		
		error: function (xhr, ajaxOptions, thrownError) {
			Swal.fire(
				'Connection lost',
				'Try again! If the issue persists, contact support.',
				'info'
			);
		},
	});
	
	
});