
// Generates nodelist of all tags with the .load class
const loading = document.querySelectorAll(".load");

// Establishes the options for the IntersectionObserver api
const options = {
  root:null,
  threshold:0.1,
}

// Code for the Intersectin observer. Uses a call back function to preform actions on the entries(nodelist)
// Action should switch load class for loaded class to create fade on screen effect
const observer = new IntersectionObserver(function(entries,observer){
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.toggle("loaded");
      observer.unobserve(entry.target);
    }
  })
}, options)

// Intializes the Intersection Observer api for each item in the nodelist
loading.forEach(load => {
  observer.observe(load);
})
