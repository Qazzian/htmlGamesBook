var paintStates = {
	inactive: {
		click: function (x, y) {
			this.setState('active');
			this.editFunction = 'closedShape';
			this.editShape.push([x, y]);
		},
		mouseMove: function (x, y, event) {
		}
	},
	active: {
		click: function (x, y, event) {
			console.info('active event: ', event);
			if (event.shiftKey) {
				this.editShape.push([x, y]);
				this.saveEdit();
				this.setState('inactive');
				this.refreshWindow();

			}
			else {
//				this.continuePath(x, y);
				this.editShape.push([x, y]);
			}
		},
		mouseMove: function(x, y, event) {
		}
	}
};


function Paint(canvasElmt, editPaneElement) {
	var self = this;

	// painting functions that should be overridden by the states above
	this.clickHandler = function () {
	};
	this.updateEditPosition = function () {
	};

	this.canvas = canvasElmt;
	this.context = canvasElmt.getContext('2d');
	this.shapes = [];

	this.editPane = editPaneElement;
	this.editContext = editPaneElement.getContext('2d');
	this.editFunction = '';
	this.editShape = [];

	this.pointerPosition = {
		x: 0,
		y: 0
	};

	this.width = this.canvas.clientWidth;
	this.height = this.canvas.clientHeight;

	var rect = this.canvas.getBoundingClientRect();
	console.info(rect);

	this.debugLog = document.getElementById('debugLog');

	this.init = function () {
		this.setState('inactive');
		this.editPane.addEventListener('click', self.handleClick);
		this.editPane.addEventListener('mousemove', self.handleMouseMove);
		this.bindEventHandlers();
	};

	this.bindEventHandlers = function () {
		document.getElementsByClassName('clearButton')[0].addEventListener('click', function () {
			self.clearCanvas();
		});
	};

	this.refreshWindow = function () {
		this.renderLayerList();
		this.renderShapes();
	};

	this.renderShapes = function (context) {
		context = context || this.context;
		this.shapes.forEach(function (writeCommand) {
			var renderFunction = writeCommand[0];
			if (self.renderFunctions.hasOwnProperty(renderFunction)) {
				self.renderFunctions[renderFunction](context, writeCommand[1]);
			}
			else {
				context[writeCommand[0]].apply(context, writeCommand[1]);
			}
		});
	};

	this.renderEditShape = function () {
		var context = this.editContext;
		var coords = this.editShape;
		console.info('editShape: ', coords);
		var i, l = coords.length;

		var editPath = new Path2D();

		context.clearRect(0, 0, this.width, this.height);
		if (l == 0) {
			return;
		}

//			editPath.beginPath();
		// first click
		editPath.moveTo(coords[0][0], coords[0][1]);
		console.info("start: ", coords[0][0], coords[0][1]);
		// continue from the second click
		for (i = 1; i < l; i++) {
			console.info("render", coords[i][0], coords[i][1]);
			editPath.lineTo(coords[i][0], coords[i][1]);
		}
		editPath.lineTo(this.pointerPosition.x, this.pointerPosition.y);
		context.stroke(editPath);
//			context.closePath();

	};

	this.renderLayerList = function () {
		var listElmt = document.getElementsByClassName('layer-list')[0];
		var i = 0, l = this.shapes.length;
		var liElmt, titleElmt, descriptionElmt;
		listElmt.innerHTML = '';

		for (; i < l; i++) {
			liElmt = document.createElement('li');
			titleElmt = document.createElement('span');
			descriptionElmt = document.createElement('span');
			titleElmt.innerHTML = this.shapes[i][0];
			descriptionElmt.innerHTML = this.shapes[i][1].join(', ');

			liElmt.appendChild(titleElmt);
			liElmt.appendChild(descriptionElmt);
			listElmt.appendChild(liElmt);
		}

	};

	this.clearCanvas = function () {
		console.info('clear canvas');
		this.context.clearRect(0, 0, self.width, self.height);
		this.editContext.clearRect(0, 0, self.width, self.height);
	};

	this.drawExamples = function () {
		this.shapes.push(['fillRect', [200, 10, 100, 100]]);
		this.shapes.push(['fillRect', [50, 70, 90, 30]]);

		this.shapes.push(['strokeRect', [110, 10, 50, 50]]);
		this.shapes.push(['strokeRect', [30, 10, 50, 50]]);

		this.shapes.push(['clearRect', [210, 20, 30, 20]]);
		this.shapes.push(['clearRect', [260, 20, 30, 20]]);

		this.refreshWindow();
	};

	this.updatePointerPosition = function(event) {
		this.pointerPosition.x = event.offsetX;
		this.pointerPosition.y = event.offsetY;
	};

	this.logMousePosition = function (event) {
		self.debugLog.innerHTML = "clientY: " + event.clientY + "<br />";
		self.debugLog.innerHTML += "layerY: " + event.layerY + "<br />";
		self.debugLog.innerHTML += "offsetY: " + event.offsetY + "<br />";
		self.debugLog.innerHTML += "pageY: " + event.pageY + "<br />";
		self.debugLog.innerHTML += "screenY: " + event.screenY + "<br />";
		self.debugLog.innerHTML += "y: " + event.y + "<br />";
	};

	this.setState = function (stateId) {
		if (paintStates.hasOwnProperty(stateId)) {
			console.info('STATE: ', stateId);
			this.clickHandler = paintStates[stateId].click;
			this.updateEditPosition = paintStates[stateId].mouseMove;
		}
	};

	this.handleClick = function (event) {
		console.info(event);

		var x = event.offsetX,
			y = event.offsetY;

		self.clickHandler(x, y, event);
		self.renderEditShape();
	};

	this.handleMouseMove = function (event) {
		self.logMousePosition(event);
		self.updatePointerPosition(event);
		self.renderEditShape();
	};

	this.getMousePosition = function (event) {
		return {
			x: event.offsetX,
			y: event.offsetY
		};
	};

	this.saveEdit = function () {
		var newEdit = [this.editFunction, this.editShape];
		this.shapes.push(newEdit);
		this.editFunction = '';
		this.editShape = [];
	}
}

Paint.prototype = {
	renderFunctions: {
		closedShape: function (context, coords) {
			if (coords.length < 0) {
				return;
			}
			var i, l = coords.length;

			context.beginPath();
			context.moveTo(coords[0][0], coords[0][1]);
			for (i = 1; i < l; i++) {
				context.lineTo(coords[i][0], coords[i][1]);
			}
			context.closePath();
			context.stroke();
		}
	}
};

function pageInit() {

	var painter = new Paint(document.getElementById('testCanvas'), document.getElementById('editPane'));
	painter.init();
	painter.drawExamples();

	window.painter = painter;
}

pageInit();