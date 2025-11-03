// var header=document.querySelector('header');
var selectCountryList = document.getElementById("city");

const data = null;

const xhr = new XMLHttpRequest();
xhr.withCredentials = false;

xhr.addEventListener('readystatechange', function () {
	if (this.readyState === this.DONE) {
		console.log(`Response Text: ${this.responseText}`);
		console.log(`Response URL: ${this.responseURL}`);
		//populateHeader(this.responseText);
		const jsonData = JSON.parse(this.responseText);
		console.log(jsonData);
		populateHeaderJSON(jsonData)
	}
});

xhr.open('GET', 'https://country-state-city-search-rest-api.p.rapidapi.com/allcountries');
xhr.setRequestHeader('x-rapidapi-key', '046bbc92c4msh89a16971c93dbbfp109b1fjsnb76d127802f8');
xhr.setRequestHeader('x-rapidapi-host', 'country-state-city-search-rest-api.p.rapidapi.com');

xhr.send(data);

function populateHeaderJSON(jsonObj){
	// var myLabel = document.createElement('label');
	// myLabel.textContent = "Select Country";
	// header.appendChild(myLabel);
	// var selectCountryList = document.createElement('select');
	// header.appendChild(selectCountryList);
	for(let i = 0; i < jsonObj.length; i++){
		var myOption = document.createElement('option');
		myOption.textContent = jsonObj[i]['name'];
		selectCountryList.appendChild(myOption);
	}
}
