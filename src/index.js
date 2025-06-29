
// index.js

// IMPORTANT: This file should be placed in the same directory as your index.html and db.json.
// Ensure json-server is running: json-server --watch db.json
// Open index.html in your browser to see the app in action.

// Base URL for the toys API
const API_URL = "http://localhost:3000/toys";

// DOM elements for form toggling (usually provided in starter code)
let addToy = false;
const addBtn = document.querySelector("#new-toy-btn");
const toyFormContainer = document.querySelector(".container");
const toyCollectionDiv = document.getElementById("toy-collection");
const newToyForm = document.querySelector(".add-toy-form"); // Assuming your form has this class

// Function to render a single toy card and attach its like button listener
function renderToyCard(toy) {
  const cardDiv = document.createElement("div");
  cardDiv.className = "card";
  cardDiv.dataset.id = toy.id; // Store toy ID on the card for easy access

  cardDiv.innerHTML = `
    <h2>${toy.name}</h2>
    <img src="${toy.image}" class="toy-avatar" />
    <p>${toy.likes} Likes</p>
    <button class="like-btn" id="${toy.id}">Like ❤️</button>
  `;

  // Attach event listener to the like button for this specific toy card
  const likeButton = cardDiv.querySelector(".like-btn");
  likeButton.addEventListener("click", () => {
    // Pass the toy object, the button itself, and the paragraph element for likes
    increaseToyLikes(toy, likeButton, cardDiv.querySelector("p"));
  });

  toyCollectionDiv.append(cardDiv);
}

// Function to handle increasing likes and sending PATCH request
function increaseToyLikes(toy, likeButton, likesParagraph) {
  // Extract current likes from the paragraph element
  const currentLikes = parseInt(likesParagraph.textContent.split(" ")[0]);
  const newLikes = currentLikes + 1;

  const configObject = {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      likes: newLikes
    })
  };

  fetch(`${API_URL}/${toy.id}`, configObject) // PATCH request to specific toy ID
    .then(response => response.json())
    .then(updatedToy => {
      // Update the likes count in the DOM directly with the response data
      likesParagraph.textContent = `${updatedToy.likes} Likes`;
      // Optionally, update the toy object's likes in memory if it's used elsewhere
      toy.likes = updatedToy.likes;
    })
    .catch(error => console.error("Error updating likes:", error));
}


// Event listener for when the DOM content is fully loaded
document.addEventListener("DOMContentLoaded", () => {

  // Toggle "Add a new toy!" form visibility
  addBtn.addEventListener("click", () => {
    addToy = !addToy;
    if (addToy) {
      toyFormContainer.style.display = "block";
    } else {
      toyFormContainer.style.display = "none";
    }
  });

  // 1. Fetch Andy's Toys (GET Request) and render them
  fetch(API_URL)
    .then(response => response.json())
    .then(toys => {
      toys.forEach(toy => renderToyCard(toy));
    })
    .catch(error => console.error("Error fetching toys:", error));

  // 2. Add a New Toy (POST Request) when the form is submitted
  newToyForm.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent the page from reloading

    // Get values from form inputs
    const nameInput = event.target.name; // Assumes input has name="name"
    const imageInput = event.target.image; // Assumes input has name="image"

    const newToyData = {
      name: nameInput.value,
      image: imageInput.value,
      likes: 0 // New toys start with 0 likes
    };

    const configObject = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(newToyData)
    };

    fetch(API_URL, configObject)
      .then(response => response.json())
      .then(createdToy => {
        renderToyCard(createdToy); // Add the newly created toy to the DOM
        newToyForm.reset(); // Clear the form fields
        // Optionally hide the form and reset toggle state after submission
        toyFormContainer.style.display = "none";
        addToy = false;
      })
      .catch(error => console.error("Error creating new toy:", error));
  });

  // The PATCH request logic (increaseToyLikes function) is called from inside renderToyCard,
  // ensuring each dynamically created like button gets its event listener.

}); // End of DOMContentLoaded