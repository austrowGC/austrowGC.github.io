// console.log("loading script.js...");
const tags = name => document.getElementsByTagName(name);
const print = () => window.print();
document.querySelector("#print").addEventListener("click", print);

// console.log(tags("a"));
// console.log("finished loading script.js");
