var header=document.querySelector('header');
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
		populateHeader(jsonData)
	}
});

xhr.open('GET', 'https://country-state-city-search-rest-api.p.rapidapi.com/allcountries');
xhr.setRequestHeader('x-rapidapi-key', '046bbc92c4msh89a16971c93dbbfp109b1fjsnb76d127802f8');
xhr.setRequestHeader('x-rapidapi-host', 'country-state-city-search-rest-api.p.rapidapi.com');

xhr.send(data);

function populateHeader(jsonObj){
	for(let i = 0; i < jsonObj.length; i++){
		var myH1 = document.createElement('h1');
		myH1.textContent = jsonObj[i]['name'];
		header.appendChild(myH1);
	}
}
