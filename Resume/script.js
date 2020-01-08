console.log("loading script.js...");
console.log(tags("a"));


console.log("finished loading script.js");

function tags(tagName) {
    document.getElementsByTagName(tagName);
}
