var request = require('request');
var importedJSON;
var invalidCustomers = [];
var count = 0; //calculate how many pages have been processed, instead of using callback, promise or async
request('https://backend-challenge-winter-2017.herokuapp.com/customers.json', function(err, res, body) {
    if (!err && res.statusCode == 200) {
        var importedJSON = JSON.parse(body);
        var totalPages = importedJSON.pagination.total; //get the number of total pages
        for (let i = 1; i <= totalPages; i++) {
            request('https://backend-challenge-winter-2017.herokuapp.com/customers.json?page=' + i, function(err, res, body) {
                if (err) throw err;
                var JSONFile = JSON.parse(body);
                var validation = JSONFile.validations;
                var nameValidation = validation[0].name; //get name validation
                var emailValidation = validation[1].email; //get email validation
                var ageValidation = validation[2].age; //get age validation
                var newsLetterValidation = validation[3].newsletter; // get newsletter validation
                var customers = JSONFile.customers; //get the customers array

                for (var x in customers) {
                    if (typeof customers[x] != 'undefined') {
                        var invalidFields = [];
                        var customerName = customers[x].name;
                        // name validation validate name length
                        if (nameValidation.required) {
                            if (customerName == null) {
                                invalidFields.push("name");
                            } else if (customerName.length < parseInt(nameValidation.length.min)) {
                                invalidFields.push("name");
                            }
                            // validate name type
                            else {
                                if (typeof customerName != nameValidation.type) invalidFields.push("name");
                            }
                        }

                        // email validation

                        if (emailValidation.required) {
                            if (customers[x].email === null) {
                                invalidFields.push("email");
                            }
                        }

                        // age validation
                        if (ageValidation.required) {
                            if (typeof customers[x].age != ageValidation.type) {
                                invalidFields.push("age");
                            }
                        }

                        //newsletter validation
                        if (newsLetterValidation.required) {
                            if (typeof customers[x].newsletter != newsLetterValidation.type) {
                                invalidFields.push("newsletter")
                            }
                        }
                        //at lease one of the above validations fails
                        if (invalidFields.length > 0) {
                            var invalidItems = JSON.stringify(invalidFields);
                            var invalidMember = {
                                "id": customers[x].id,
                                "invalid_fields": invalidFields
                            }
                            invalidCustomers.push(invalidMember);
                        }
                        count++;
                        //if program has processed all pages, output the result
                        if (count == totalPages) {
                            var invalidInfo = { invalidCustomers };
                            console.log(JSON.stringify(invalidInfo));
                        }
                    }
                }
            })
        }
    }
});