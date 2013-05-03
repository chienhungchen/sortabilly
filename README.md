#Sortabilly
Barebone sortable using jQuery and Draggabilly (http://draggabilly.desandro.com)

##Dependencies
- jQuery (tested with 1.9.1+)
- Draggabilly (1.0.1+)
- Droppabilly (http://github.com/chienhungchen/droppabilly)

##License
MIT License (http://opensource.org/licenses/MIT)

##Demo
Download and load index.html in your browser for a basic demo.

##Browser Support
TBD

##Parameters
All available parameters below, put in the form of sample code. Enjoy!

	//BELOW TODO!
	$('#drop').droppabilly({
		
		//--------------------
		// any jquery selection
		//--------------------
		dragsters: '#selector',

		//--------------------
		// function is invoked when element is over the droppabilly
		// drop is the droppabilly element
		// drag is the current draggabilly element
		//--------------------
		over: function(drop, drag) {
			//put some code here!	
		},
		
		//--------------------
		// function is invoked when element moves out of the droppabilly
		// drop is the droppabilly element
		// drag is the current draggabilly element
		//--------------------
		out: function(drop, drag) {
			//put some code here!
		},

		//--------------------
		// function is invoked when element is dropped on the droppabilly
		// drop is the droppabilly element
		// drag is the current draggabilly element
		//--------------------
		drop: function(drop, drag) {
			//put some code here!
		}
	});
