let USER = "Tony";

const welcomeText = document.createElement("h1");
const header = document.querySelector(".header");

welcomeText.textContent = `Welcome, ${USER}`;
header.appendChild(welcomeText);
