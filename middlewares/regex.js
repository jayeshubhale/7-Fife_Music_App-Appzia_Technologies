let nameRegex = /^[.a-zA-Z\s]+$/;
let phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/;
let emailRegex = /.+@.+\..+/;
let passRegex = /.{6,}/;


module.exports = {
    nameRegex,
    phoneRegex,
    emailRegex,passRegex
}