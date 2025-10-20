var header=document.querySelector('header');
var section=document.querySelector('section');
let myCity = "Riga";

function validateForm() {
	let myCity = document.forms["cityName"]["myCity"].value;
		//console.log(myCity);
		if (myCity == "") {
			myCity = "Riga";
			//return false;
		}
	getResponse(myCity);
	}

var x = document.getElementById('cityName');
//myCity = x.value;
//console.log(myCity);
//var myCity = "Tashkent";
//var myCity = document.getElementById('city');


function getResponse(myCity){
	console.log(myCity);
	var requestURL=`http://api.weatherapi.com/v1/current.xml?key=e511a13169c149a187e80707230310&q=${myCity}&aqi=yes`;

	var request = new XMLHttpRequest();

	request.open('GET', requestURL);
	console.log(request);
	request.responseType='document';
	request.overrideMimeType("text/xml");

	request.onload = () => {
		if (request.readyState === request.DONE && request.status === 200) {
		//console.log(request.response);
			console.log(request.responseXML);
			var myWeather = request.response;
			populateHeader(myWeather);
	}
};

request.send();
}

function populateHeader(xmlObj) {
	var myH1 = document.createElement('h1');
	var myText = xmlObj.getElementsByTagName("name")[0].childNodes[0].nodeValue;
	myH1.textContent = `The weather in ${myText} is: `;
	//myH1.textContent = "The weather in "+xmlObj.getElementsByTagName("name")[0].childNodes[0].nodeValue+" is: ";
	header.appendChild(myH1);
	var myH2 = document.createElement('h1');
	myH2.textContent = xmlObj.getElementsByTagName("temp_c")[0].childNodes[0].nodeValue;
	header.appendChild(myH2);
	var myIMG = document.createElement('img');
	myIMG.src = "https:"+xmlObj.getElementsByTagName("icon")[0].childNodes[0].nodeValue;
	header.appendChild(myIMG);
}

//let s = setInterval(getResponse(myCity), 100);