// var header=document.querySelector('header');
var selectCityList = document.getElementById("city");

var selectCountryList = document.getElementById("country");

function validateCountryForm() {
	let myCountry = document.forms["countryName"]["myCountry"].value;
	if (myCountry == "") {
		myCountry = "LV";
	}
	getCities(myCountry);
}

function getCities(countryCODE) {
	const data = null;

	const xhr = new XMLHttpRequest();
	xhr.withCredentials = false;

	xhr.addEventListener('readystatechange', function () {
		if (this.readyState === this.DONE) {
			// console.log(this.responseText);
			const jsonData = JSON.parse(this.responseText);
			// console.log(jsonData);
			populateHeaderJSON(jsonData)
		}
	});

	xhr.open('GET', `https://country-state-city-search-rest-api.p.rapidapi.com/cities-by-countrycode?countrycode=${countryCODE}`);
	xhr.setRequestHeader('x-rapidapi-key', '046bbc92c4msh89a16971c93dbbfp109b1fjsnb76d127802f8');
	xhr.setRequestHeader('x-rapidapi-host', 'country-state-city-search-rest-api.p.rapidapi.com');

	xhr.send(data);
}

function populateHeaderJSON(jsonObj) {
	for (let i = 0; i < jsonObj.length; i++) {
		var myOption = document.createElement('option');
		myOption.textContent = jsonObj[i]['name'];
		selectCityList.appendChild(myOption);
	}
}
