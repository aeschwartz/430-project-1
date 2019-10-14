// syndicates.js 
// contains a list of helper functions and general setup stuff for every page
// in the future it would be better to do this with es6 modules

// stolen from https://stackoverflow.com/questions/1643320/get-month-name-from-date
const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

// convert size and id into igdb image url
const getIGDBImg = (size, id) => {
    return `https://images.igdb.com/igdb/image/upload/t_${size}/${id}.png`;
};

// parse a location.search query
const parseQuery = (query) => {
    const queryArr = query.substr(1).split("&");
    const queryObj = {};
    for (let i = 0; i < queryArr.length; i++) {
        let paramArr = queryArr[i].split(/=/);
        queryObj[paramArr[0]] = paramArr[1];
    }
    return queryObj;
};

// gets suggestions when hooked up to a search bar
const grabSuggestions = (e, searchBar) => {

    // remove suggestions from class list
    searchBar.classList.remove("suggestions-mode");

    // get elements inside search bar
    const searchField = searchBar.querySelector(".search-input");
    const suggestionsField = searchBar.querySelector(".suggestions");

    // if search field is empty, don't send request
    if (!searchField.value) return;

    //create a new AJAX request (asynchronous)
    const xhr = new XMLHttpRequest();
    //setup connect using the selected method and url
    xhr.open("GET", `/suggestions?q=${searchField.value}`);
    //set accept header in request to application/json
    //The accept header is a comma separated list of
    //accepted response types in order of preference
    //from first to last. You only need to send one
    //but you can send many, separated by commas.
    xhr.setRequestHeader('Accept', 'application/json');

    xhr.responseType = "json";
    //if get request or head request
    xhr.onload = (loadE) => {
        suggestionsField.innerHTML = '';
        if (xhr.response.length == 0 || !searchField.value) {
            searchBar.classList.remove("suggestions-mode");
            return;
        }
        searchBar.classList.add("suggestions-mode");
        for (let suggestion of xhr.response) {
            const imageId = suggestion.cover ? suggestion.cover.image_id : "nocover_qhhlj6";
            suggestionsField.appendChild(
                createSuggestion(
                    suggestion.name,
                    suggestion.id,
                    getIGDBImg("thumb", imageId)
                )
            );
        }
    }
    //send ajax request
    xhr.send();
}

// object factory for creating a "suggestion element"
const createSuggestion = (name, id, imgUrl) => {
    const suggestion = document.createElement("a");
    suggestion.className = "suggestion";
    suggestion.href = `/game?id=${id}`;

    const img = document.createElement("img");
    img.className = "suggestion-cover";
    img.src = imgUrl;

    const title = document.createElement("span");
    title.className = "suggestion-title";
    title.innerHTML = name;

    suggestion.appendChild(img);
    suggestion.appendChild(title);

    return suggestion;
}

let userXHR; // userXHR.response will be = to the current user object
// do this for every page
window.addEventListener("load", () => {
    // set up searchbar
    const search = document.querySelector(".search");
    search.querySelector(".search-input").addEventListener("input", (e) => grabSuggestions(e, search));

    // set up user link ("my page")
    const userLink = document.querySelector("a#user-link");
    if (!localStorage.username) {
        userLink.href = "/login";
    }
    else {
        // check to see if username exists server side
        userXHR = new XMLHttpRequest();
        userXHR.open("GET", `/getUser?name=${localStorage.username}`);
        userXHR.setRequestHeader("Accept", "application/json");
        userXHR.responseType = 'json';
        userXHR.addEventListener("load", (loadE) => {
            // set 'logged in' username to empty string if username doesn't exist
            if (userXHR.status == 404) localStorage.username = "";

            // set userlink to home if logged in previously
            if (localStorage.username) userLink.href = `/user?name=${localStorage.username}`;
            else userLink.href = "/login";
        });
        userXHR.send();
    }

});

