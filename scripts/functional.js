const Funk = function(tag, attributes, ...children) {
    const create = function(tag) {
        return document.createElement(tag);
    }
    const applyAttr = function(element, name, value) {
        return element.setAttribute(name, value);
    }
    const applyList = function(tag, ...attrs) {
        return attrs.map( function(a) {
            // applyAttr(element(tag), );
            return a.value;
        });
    }
    return applyList(tag, attributes);
}
const Attribute = function(name, value) {
    const create = function(name) {
        return document.createAttribute(name);
    }
    const set = function(attr, value) {
        return false;
    }
}
const attributes = [
    { value: 52 },
    { value: 53 },
    { value: 54 },
    { value: 55 }
];
const text = [
    "spam",
    "eggs",
    "foo",
    "bar"
];
