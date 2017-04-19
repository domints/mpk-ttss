// Special directions
var special_directions = {
	'Zajezdnia Nowa Huta' : 'NH',
	'Zajezdnia Podgórze' : 'P',
};

var VEHICLE_TYPES = {
		E1: 	{id: 1, name: 'E1'},
		_105NA: {id: 2, name: '105Na'},
		_105NB: {id: 3, name: '105Nb'},
		GT8S: 	{id: 4, name: 'GT8S'},
		GT8C: 	{id: 5, name: 'GT8C'},
		EU8N: 	{id: 6, name: 'EU8N'},
		N8SNF: 	{id: 7, name: 'N8S-NF'},
		N8CNF: 	{id: 8, name: 'N8C-NF'},
		NGT6_1: {id: 9, name: 'NGT6 (1)'},
		NGT6_2: {id: 10, name: 'NGT6 (2)'},
		NGT6_3: {id: 11, name: 'NGT6 (3)'},
		NGT8: 	{id: 12, name: 'NGT8'},
		_126N: 	{id: 13, name: '126N'},
		_2014N: {id: 14, name: '2014N'},
		_405NKR: {id: 15, name: '405N-Kr'}
};

var script_version;
var script_version_xhr;

// Check for website updates
function checkVersion() {
	if(script_version_xhr) script_version_xhr.abort();
	
	script_version_xhr = $.get(
		'version.php'
	).done(function(data) {
		if(!script_version) {
			script_version = data;
			return;
		}
		
		if(script_version != data) {
			fail(lang.error_new_version);
			location.reload(true);
		}
	});
}

function checkVersionInit() {
	checkVersion();
	setInterval(checkVersion, 3600000);
}

// Webservice-related functions
function parseVehicle(vehicleId) {
	if(!vehicleId) return false;
	if(vehicleId.substr(0, 15) != '635218529567218') {
		console.log('Unknown vehicle, vehicleId=' + vehicleId);
		return false;
	}
	
	var id = parseInt(vehicleId.substr(15)) - 736;
	var prefix;
	var type;
	var low; // low floor: 0 = no, 1 - semi, 2 - full
	
	// Single exception - old id used in one case
	if(id == 831) {
		id = 216;
	}
	
	if(101 <= id && id <= 174) {
		prefix = 'HW';
		type = VEHICLE_TYPES.E1;
		low = 0;
		
		if((108 <= id && id <= 113) || id == 127 || id == 131 || id == 132 || id == 134 || (137 <= id && id <= 139) || (148 <= id && id <= 150) || (153 <= id && id <= 155)) {
			prefix = 'RW';
		}
	} else if(201 <= id && id <= 293) {
		prefix = 'RZ';
		type = VEHICLE_TYPES._105NA
		low = 0;
		
		if(246 <= id) {
			prefix = 'HZ';
		}
		if(id == 290) {
			type = VEHICLE_TYPES._105NB;
		}
	} else if(301 <= id && id <= 328) {
		prefix = 'RF';
		type = VEHICLE_TYPES.GT8S;
		low = 0;
		
		if(id == 313) {
			type = VEHICLE_TYPES.GT8C
			low = 1;
		} else if(id == 323) {
			low = 1;
		}
	} else if(401 <= id && id <= 440) {
		prefix = 'HL';
		type = VEHICLE_TYPES.EU8N;
		low = 1;
	} else if(451 <= id && id <= 462) {
		prefix = 'HK';
		type = VEHICLE_TYPES.N8SNF;
		low = 1;
		
		if((451 <= id && id <= 456) || id == 462) {
			type = VEHICLE_TYPES.N8CNF;
		}
	} else if(601 <= id && id <= 650) {
		prefix = 'RP';
		type = VEHICLE_TYPES.NGT6_3;
		low = 2;
		
		if(id <= 613) {
			type = VEHICLE_TYPES.NGT6_1;
		} else if (id <= 626) {
			type = VEHICLE_TYPES.NGT6_2;
		}
	} else if(801 <= id && id <= 824) {
		prefix = 'RY';
		type = VEHICLE_TYPES.NGT8;
		low = 2;
	} else if(id == 899) {
		prefix = 'RY';
		type = VEHICLE_TYPES._126N;
		low = 2;
	} else if(901 <= id && id <= 936) {
		prefix = 'RG';
		type = VEHICLE_TYPES._2014N;
		low = 2;
		
		if(915 <= id) {
			prefix = 'HG';
		}
	} else if(id === 999) {
		prefix = 'HG';
		type = VEHICLE_TYPES._405NKR;
		low = 1;
	} else {
		console.log('Unknown vehicle, vehicleId=' + vehicleId + ', id=' + id);
		return false;
	}
	
	return {
		vehicleId: vehicleId,
		prefix: prefix,
		id: id,
		num: prefix + id,
		type: type,
		low: low
	};
}

function tramIdToVehicleId(tramId) {
	if(0 <= tramId && tramId <= 999) {
		var vehicleId = '0000' + (tramId + 736);
		vehicleId = vehicleId.substr(vehicleId.length - 4)
		return '635218529567218' + vehicleId;
	}
}

// Element mangling
function deleteChildren(element) {
	while(element.lastChild) element.removeChild(element.lastChild);
}

function addElementWithText(parent, element, text) {
	var elem = document.createElement(element);
	elem.appendChild(document.createTextNode(text));
	parent.appendChild(elem);
	return elem;
}

function addCellWithText(parent, text) {
	return addElementWithText(parent, 'td', text);
}

function addParaWithText(parent, text) {
	return addElementWithText(parent, 'p', text);
}

function setText(element, text) {
	deleteChildren(element);
	element.appendChild(document.createTextNode(text));
}
