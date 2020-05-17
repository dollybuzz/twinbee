//global variable
let selectedRow = null;

let navMapper = {
    main: function () {
        location.reload();
    },

    manageClients: function () {
      showFunction(clientFunctionality, "/api/getAllClients");
    },

    manageMakers: function () {
        showFunction($(this));
    },

    reviewTimeSheets: function () {
        showFunction($(this));
    }
};//end navMapper

/*

function showMakers(){
    //Create table
    $(".row").html(
        "<div id=\"floor\">\n" +
        "    <table id=\"makerTable\" class=\"table\">\n" +
        "    </table>\n" +
        "</div>");
    $.ajax({
        url: "/api/getAllMakers",
        method: "post",
        data: {
            auth: id_token
        },
        dataType: "json",
        success: function (res, status) {
            $("#makerTable").append('\n' +
                '        <thead class="thead">\n' +
                '            <th scope="col">#</th>\n' +
                '            <th scope="col">First Name</th>\n' +
                '            <th scope="col">Last Name</th>\n' +
                '            <th scope="col">Email</th>\n' +
                '        </thead><tbody>');
            //Populate table
            res.forEach(item => {
                $("#makerTable").append('\n' +
                    '<tr class="makerRow">' +
                    '   <td scope="row">' + item.id +'</td>' +
                    '   <td>' + item.firstName + '</td>'+
                    '   <td>' + item.lastName + '</td>'+
                    '   <td>' + item.email + '</td></tr>'
                );
            });
            $("#makerTable").append('\n</tbody>');

            //Body Block content
            createBody();

            //Event Listeners
            //Modify Maker
            $(".makerRow").click(function () {
                selectedRow = $(this);
                prePopModForm();
                $("#DeleteButton").show();
                $("#DeleteButton").css("opacity", "1");
                $("#DeleteButton").click(function () {
                    showDeletePrompt();
                });
            });//end modify maker

            //Expand Table Button
            $("#ExpandButton").click(function () {
                expandTable();
            });

            //Add Maker
            $("#AddButton").click(function () {
                popMakerAddForm();
                $("#DeleteButton").css("opacity", "0");
                setTimeout(function(){
                    $("#DeleteButton").hide();
                }, 500);
            });//end add maker

            //Row effect
            $(".makerRow").mouseenter(function () {
                $(this).css('transition', 'background-color 0.5s ease');
                $(this).css('background-color', '#e8ecef');
            }).mouseleave(function () {
                $(this).css('background-color', 'white');
            });
        },
        error: function (res, status) {
            $("#floor").html("Something went wrong!");
            //log, send error report
        }
    });//end ajax
};//end showMaker

function showSheets(){
    //Create table
    $(".row").html(
        "<div id=\"floor\">\n" +
        "    <table id=\"sheetsTable\" class=\"table\">\n" +
        "    </table>\n" +
        "</div>");
    $.ajax({
        url: "/api/getAllTimeSheets",
        method: "post",
        data: {
            auth: id_token
        },
        dataType: "json",
        success: function (res, status) {
            $("#sheetsTable").append('\n' +
                '        <thead class="thead">\n' +
                '            <th scope="col">#</th>\n' +
                '            <th scope="col">Maker ID</th>\n' +
                '            <th scope="col">Client ID</th>\n' +
                '            <th scope="col">Hourly Rate</th>\n' +
                '            <th scope="col">Clock In</th>\n' +
                '            <th scope="col">Clock Out</th>\n' +
                '            <th scope="col">Occupation</th>\n' +
                '        </thead><tbody>');
            //Populate table
            res.forEach(item => {
                $("#sheetsTable").append('\n' +
                    '<tr class="sheetRow">' +
                    '   <td scope="row">' + item.id +'</td>' +
                    '   <td>' + item.maker_id + '</td>'+
                    '   <td>' + item.client_id + '</td>'+
                    '   <td>' + item.hourly_rate + '</td>'+
                    '   <td>' + item.start_time + '</td>'+
                    '   <td>' + item.end_time + '</td>'+
                    '   <td>' + item.occupation + '</td></tr>'
                );
            });
            $("#sheetsTable").append('\n</tbody>');

            //Body Block content

            //Event Listeners
            $(".sheetRow").click(function () {
                let makerId = $(this).children()[0].innerHTML;
                $("#floor").css("width", "50vw");
                $(".row").css("float", "left");
                //alert ("You selected sheet " + makerId);
            });
            //Row effect
            $(".sheetRow").mouseenter(function () {
                $(this).css('transition', 'background-color 0.5s ease');
                $(this).css('background-color', '#e8ecef');
            }).mouseleave(function () {
                    $(this).css('background-color', 'white');
            });
        },
        error: function (res, status) {
            $("#floor").html("Something went wrong!");
            //log, send error report
        }
    });//end ajax
};//end showSheets

*/

//Versatile Functions
function createBody() {
    //top row
    $("#topRow").append('\n<div id="optionsClient"></div>');
    $("#optionsClient").hide();
    $("#optionsClient").css("width", "50%");
    $("#buttonsTop").append("<button id='AddButton' type='button' class='btn btn-default'>+</button>");
    $("#buttonsTop").append("<button id='DeleteButton' type='button' class='btn btn-default'>Delete</button>");
    $("#AddButton").css("opacity", "1");

    //bottom row
    $("#userMainContent").append('\n<div class="row" id="bottomRow"></div>');
    $("#userMainContent").append('<div id="buttonsBottom"></div>');
    $("#buttonsTop").append("<button id='ExpandButton' type='button' class='btn btn-default'>></button>");
    $("#buttonsBottom").append("<button id='SubmitButton' type='button' class='btn btn-default'>Submit</button>");
    $("#buttonsBottom").hide();
};

function showBlock() {
    //show block after table stops moving
    setTimeout(function () {
        $("#optionsClient").show();
        $("#buttonsBottom").show();
        $("#AddButton").show();
        $("#SubmitButton").show();
        $("#optionsClient").css("width", "50%");
        $("#optionsClient").css("width", "50%");
        $("#optionsClient").css("opacity", "1");
        $("#SubmitButton").css("opacity", "1");
        $("#ExpandButton").css("opacity", "1");
        $("#AddButton").css("opacity", "1");
    }, 500)
};

function minimizeTable() {
    $("#floor").css("transition", "width 0.5s ease-in-out");
    $("#floor").css("width", "50%");
    $("#floor").css("margin-left", "0");
    $("#floor").css("margin-right", "auto");
}

function expandTable() {
    $("#optionsClient").hide();
    $("#buttonsBottom").hide();
    $("#DeleteButton").hide();
    $("#optionsClient").css("width", "0%");
    $("#optionsClient").css("opacity", "0");
    $("#floor").css("width", "100%");
    $("#floor").css("margin-left", "0");
    $("#floor").css("margin-right", "auto");
    $("#floor").css("transition", "width 0.5s ease-in-out");
    $("#SubmitButton").css("opacity", "0");
    $("#ExpandButton").css("opacity", "0");
    $("#DeleteButton").css("opacity", "0");
    $("#AddButton").css("opacity", "1");
};

function showFunction(functionality, endpoint) {
    $.ajax({
        url: endpoint,
        method: "post",
        data: {
            auth: id_token
        },
        dataType: "json",
        success: function (res, status) {
            functionality(res);
        },
        error: function (res, status) {
            $("#userMainContent").html("Something went wrong!");
        }
    });//end outer ajax
};// end showFunction

//Mod
function prePopModForm(endpoint, modForm){
    minimizeTable();
    showBlock();
    let clientId = selectedRow.children()[0].innerHTML;
    $.ajax({
        url: endpoint,
        method: "post",
        data: {
            auth: id_token,
            id: clientId
        },
        dataType: "json",
        success: modForm,
        error: function (res, status) {
            $("#optionsClient").html("Mod Form is not populating!");
        }
    });//end ajax
}

function modSubmit(endpoint, object, successFunction) {
    $.ajax({
        url: endpoint,
        method: "post",
        data: object,
        dataType: "json",
        success: successFunction,
        error: function (res, status) {
            $("#optionsClient").html("Update Client isn't working!");
            //log, send error report
        }
    });//end ajax
}

//Add
function popAddForm(addForm){
    minimizeTable();
    showBlock();
    addForm();
}

function addSubmit(endpoint, object, successFunction) {
    $.ajax({
        url: endpoint,
        method: "post",
        data: object,
        dataType: "json",
        success: successFunction,
        error: function (res, status) {
            $("#optionsClient").html("Add isn't working!");
            //log, send error report
        }
    });//end ajax
};

//Delete
function showDeletePrompt(endpoint, object, successFunction, verifyDeleteUser) {
    showBlock();
    $("#optionsClient").html("<div id='deletePrompt'></div>");
    setTimeout(function() {
        $("#deletePrompt").html("<h5>Are you sure you want to delete this user?</h5>");
        $("#deletePrompt").append("<div id='selectionYorN'></div>");
        $("#selectionYorN").append("<button id='NoDelete' type='button' class='btn btn-default'>No</button>");
        $("#selectionYorN").append("<button id='YesDelete' type='button' class='btn btn-default'>Yes</button>");
        $("#SubmitButton").css("opacity", "0");
        $("#AddButton").css("opacity", "0");
        $("#DeleteButton").css("opacity", "0");
        $("#deletePrompt").css("opacity", "1");
        $("#YesDelete").css("opacity", "1");
        $("#NoDelete").css("opacity", "1");

        setTimeout(function () {
            $("#SubmitButton").hide();
            $("#AddButton").hide();
        }, 500);

        $("#NoDelete").click(function() {
            $("#SubmitButton").show();
            $("#AddButton").show();
            expandTable();
        });

        $("#YesDelete").click(function() {
            $("#SubmitButton").show();
            $("#AddButton").show();
            $("#SubmitButton").css("opacity", "1");
            $("#AddButton").css("opacity", "1");
            $("#deletePrompt").html(
                `<h5>Please type in the full name to delete the selected user.</h5>` +
                `<h6>You selected ${selectedRow.children()[1].innerHTML}<br>ID: ${selectedRow.children()[0].innerHTML}</h6>` +
                "<br><form id='delete'>" +
                "<label for='deleteUser'>Full Name:</label>" +
                `<input type='text' id='deleteUser' name='deleteUser'>\n<br>\n` +
                "</form>\n");

            $("#deletePrompt").append("<div id='verifyEntry'></div>");

            $("#SubmitButton").off("click");
            $("#SubmitButton").on("click", function (e) {
                if(verifyDeleteUser())
                {
                    $.ajax({
                        url: endpoint,
                        method: "post",
                        data: object,
                        dataType: "json",
                        success:successFunction,
                        error: function (res, status) {
                            $("#optionsClient").html("Delete user not working!");
                        }
                    });//end ajax
                }
                else
                {
                    $("#verifyEntry").html("<h6>Invalid entry. Please type in the name again.</h6>");
                }
            });
        });
    },500);
}

//Main Methods
function showMain() {
    //Contains any main tab functionality
    showOnlineMakers();
}

function showOnlineMakers() {
    //Create table
    $("#online").html(
        "<div id=\"floor\">\n" +
        "    <table id=\"onlineTable\" class=\"table\">\n" +
        "    </table>\n" +
        "</div>");
    $.ajax({
        url: "/api/getOnlineMakers",
        method: "post",
        data: {
            auth: id_token
        },
        dataType: "json",
        success: function (res, status) {
            $("#onlineTable").append('\n' +
                '        <thead class="thead">\n' +
                '            <th scope="col">Maker ID</th>\n' +
                '            <th scope="col">First Name</th>\n' +
                '            <th scope="col">Last Name</th>\n' +
                '            <th scope="col">Email</th>\n' +
                '        </thead><tbody>');
            //Populate table
            res.forEach(item => {
                $("#onlineTable").append('\n' +
                    '<tr class="onlineRow">' +
                    '   <td>' + item.id + '</td>' +
                    '   <td>' + item.firstName + '</td>'+
                    '   <td>' + item.lastName + '</td>'+
                    '   <td>' + item.email + '</td></tr>'
                );
            });
            $("#onlineTable").append('\n</tbody>');

            //Body Block content
            $("#text1").append('<h6>This is a table of current online makers.</h6>');
            $("#text2").append('<h6>This is a running table of daily/weekly/monthly hours?</h6>');

            //Event Listeners
            $(".onlineRow").click(function () {
                let clientId = $(this).children()[0].innerHTML;
                //alert("You selected client " + clientId);
            })
            //Row effect
            $(".onlineRow").mouseenter(function () {
                $(this).css('transition', 'background-color 0.5s ease');
                $(this).css('background-color', '#e8ecef');
            }).mouseleave(function () {
                $(this).css('background-color', 'white');
            });
        },
        error: function (res, status) {
            $("#floor").html("Something went wrong!");
            //log, send error report
        }
    });//end ajax
};

//Client Methods
function clientFunctionality (res) {
    //Create table
    $("#userMainContent").html(
        "<div id=\"buttonsTop\"></div>\n" +
        "<div class='row' id='topRow'>\n" +
        "<div id=\"floor\">\n" +
        "    <table id=\"clientTable\" class=\"table\">\n" +
        "    </table>\n" +
        "</div></div>");
    $("#clientTable").append('\n' +
        '        <thead class="thead">\n' +
        '            <th scope="col">ID</th>\n' +
        '            <th scope="col">Name</th>\n' +
        '            <th scope="col">Phone</th>\n' +
        '            <th scope="col">Email</th>\n' +
        '        </thead><tbody>');
    //Populate table
    res.forEach(item => {
        if (item.customer.billing_address && !item.customer.deleted) {
            $("#clientTable").append('\n' +
                '<tr class="clientRow">' +
                '   <td scope="row">' + item.customer.id + '</td>' +
                '   <td>' + `${item.customer.first_name} ${item.customer.last_name}` + '</td>' +
                '   <td>' + item.customer.phone + '</td>' +
                '   <td>' + item.customer.email + '</td></tr>'
            );
        };
    });
    $("#clientTable").append('\n</tbody>');

    //Body Block content
    createBody();

    //Event Listeners
    //Modify Client
    $(".clientRow").click(function () {
        selectedRow = $(this);
        prePopModForm("/api/getClient", clientModForm);
        $("#DeleteButton").show();
        $("#DeleteButton").css("opacity", "1");
        $("#DeleteButton").click(function () {
            let clientId = selectedRow.children()[0].innerHTML;
            showDeletePrompt("/api/deleteClient", {
                auth: id_token,
                id: clientId
            }, deleteClientSuccess, verifyDeleteClient);
        });
    });//end modify client

    //Add Client
    $("#AddButton").click(function () {
        popAddForm(clientAddForm);
        $("#DeleteButton").css("opacity", "0");
        setTimeout(function(){
            $("#DeleteButton").hide();
        }, 500);
    });//end add client

    //Expand Table Button
    $("#ExpandButton").click(function () {
        expandTable();
    });

    //Row effect
    $(".clientRow").mouseenter(function () {
        $(this).css('transition', 'background-color 0.5s ease');
        $(this).css('background-color', '#e8ecef');
    }).mouseleave(function () {
        $(this).css('background-color', 'white');
    });
}

function clientModForm(res, status) {
    //Pre-populate forms
    $("#optionsClient").html("<h5>Edit/Modify the following fields</h5><br>" +
        "<form id='modify'>\n" +
        "<label for='modClient'>Client Information</label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='modclientid'>ID:</label>" +
        `<input type='text' id='modclientid' name='modclientid' value='${res.id}' disabled>\n<br>\n` +
        "<label for='modclientfname'>First Name:</label>" +
        `<input type='text' id='modclientfname' name='modclientfname' value='${res.first_name}'>\n<br>\n` +
        "<label for='modclientlname'>Last Name:</label>" +
        `<input type='text' id='modclientlname' name='modclientlname' value='${res.last_name}'>\n<br>\n` +
        "<label for='modphone'>Phone:</label>" +
        `<input type='text' id='modphone' name='modphone' value='${res.phone}'>\n<br>\n` +
        "<label for='modemail'>Email:</label>" +
        `<input type='text' id='modemail' name='modemail' value='${res.email}'>\n<br>\n` +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='modbilling'>Billing Address</label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='modaddress'>Street:</label>" +
        `<input type='text' id='modaddress' name='modaddress' value='${res.billing_address.line1}'>\n<br>\n` +
        "<label for='modcity'>City:</label>" +
        `<input type='text' id='modcity' name='modcity' value='${res.billing_address.city}'>\n<br>\n` +
        "<label for='modstate'>State:</label>" +
        `<input type='text' id='modstate' name='modstate' value='${res.billing_address.state}'>\n<br>\n` +
        "<label for='modemail'>Zip:</label>" +
        `<input type='text' id='modzip' name='modzip' value='${res.billing_address.zip}'>\n<br>\n` +
        "</form>\n");

    //Submit button function
    $("#SubmitButton").off("click");
    $("#SubmitButton").on('click', function (e) {
        modSubmit("/api/updateClientContact", {
            auth: id_token,
            id: $("#modclientid").val(),
            firstName: $("#modclientfname").val(),
            lastName: $("#modclientlname").val() ,
            phone: $("#modphone").val(),
            email: $("#modemail").val()
        }, modClientSuccessContact);

        modSubmit("/api/updateClientBilling", {
            auth: id_token,
            id: $("#modclientid").val(),
            firstName: $("#modclientfname").val(),
            lastName: $("#modclientlname").val() ,
            phone: $("#modphone").val(),
            email: $("#modemail").val(),
            street: $("#modaddress").val(),
            city: $("#modcity").val(),
            state: $("#modstate").val(),
            zip: $("#modzip").val()
        }, modClientSuccessBilling);
    });
}

function clientAddForm () {
    $("#optionsClient").html("<h5>Add data into the following fields</h5><br>" +
        "<form id='add'>\n" +
        "<label for='addClient'>Client Information</label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='addclientfname'>First Name:</label>" +
        `<input type='text' id='addclientfname' name='addclientfname'>\n<br>\n` +
        "<label for='addclientlname'>Last Name:</label>" +
        `<input type='text' id='addclientlname' name='addclientlname'>\n<br>\n` +
        "<label for='addphone'>Phone:</label>" +
        `<input type='text' id='addphone' name='addphone'>\n<br>\n` +
        "<label for='addemail'>Email:</label>" +
        `<input type='text' id='addemail' name='addemail'>\n<br>\n` +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='addbilling'>Billing Address</label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='addbillingfname'>First Name:</label>" +
        `<input type='text' id='addbillingfname' name='addbillingfname'>\n<br>\n` +
        "<label for='addbillinglname'>Last Name:</label>" +
        `<input type='text' id='addbillinglname' name='addbillinglname'>\n<br>\n` +
        "<label for='addaddress'>Street:</label>" +
        `<input type='text' id='addaddress' name='addaddress'>\n<br>\n` +
        "<label for='addcity'>City:</label>" +
        `<input type='text' id='addcity' name='addcity'>\n<br>\n` +
        "<label for='addstate'>State:</label>" +
        `<input type='text' id='addstate' name='addstate'>\n<br>\n` +
        "<label for='addemail'>Zip:</label>" +
        `<input type='text' id='addzip' name='addzip'>\n<br>\n` +
        "</form>\n");

    //Submit button function
    $("#SubmitButton").off("click");
    $("#SubmitButton").on('click', function (e) {
        addSubmit("/api/createClient", {
            auth: id_token,
            firstName: $("#addclientfname").val(),
            lastName: $("#addclientlname").val() ,
            phone: $("#addphone").val(),
            email: $("#addemail").val(),
            street: $("#addaddress").val(),
            city: $("#addcity").val(),
            state: $("#addstate").val(),
            zip: $("#addzip").val(),
            billingFirst: $("#addbillingfname").val(),
            billingLast:$("#addbillinglname").val()
        }, addClientSuccess);
    });
}

function modClientSuccessContact (res, status) {
    $("#optionsClient").append("<div id='modsuccess'></div>");
    $("#modsuccess").html("");
    $("#modsuccess").html(`<br><h5>Successfully updated client ${$("#modclientid").val()}!</h5>`);

    //Updating viewable rows in table
    selectedRow.children()[1].innerHTML = $("#modclientfname").val() + " " + $("#modclientlname").val();
    selectedRow.children()[2].innerHTML = $("#modphone").val();
    selectedRow.children()[3].innerHTML = $("#modemail").val();
}

function modClientSuccessBilling (res, status) {
    $("#optionsClient").append("<div id='modsuccess'></div>");
    $("#modsuccess").html("");
    $("#modsuccess").html(`<br><h5>Successfully updated client ${$("#modclientid").val()}!</h5>`);
}

function addClientSuccess (res, status) {
    $("#optionsClient").append("<div id='addsuccess'></div>");
    $("#addsuccess").html("");
    $("#addsuccess").html(`<br><h5>Successfully added client ${res.id}!</h5>`);

    //Adding new client to table
    $("#clientTable").append('\n' +
        `<tr id="${res.id}" class="clientRow">` +
        '   <td scope="row">' + `${res.id}` + '</td>' +
        '   <td>' + `${res.first_name} ${res.last_name}` + '</td>' +
        '   <td>' + `${res.phone}` + '</td>' +
        '   <td>' + `${res.email}` + '</td></tr>'
    );

    $(`#${res.id}`).mouseenter(function () {
        $(this).css('transition', 'background-color 0.5s ease');
        $(this).css('background-color', '#e8ecef');
    }).mouseleave(function () {
        $(this).css('background-color', 'white');
    }).click(function () {
        prePopModForm("/api/getClient", clientModForm);
    });
}

function deleteClientSuccess (res, status) {
    $("#verifyEntry").html(`<h6>Successfully deleted user ${selectedRow.children()[0].innerHTML}!</h6>`);
    setTimeout(function () {
        showFunction(clientFunctionality, "/api/getAllClients");
    }, 1000);
}

function verifyDeleteClient () {
    let deleteUser = $("#deleteUser").val();
    return (deleteUser == selectedRow.children()[1].innerHTML);
}

//Maker Methods


//TimeSheet Methods



$(document).ready(function () {

    //table on page tab: Main (this functionality is not included in navItem)
    //Requires on load document ready instead of event listener method
    //otherwise it will not load unless clicking on 'Main'
    showMain();

    //Event Listeners for other nav menu items
    $(".navItem").click(function (e) {
        navMapper[e.target.id]();
        selectedTab = $(this)[0].id;
    })

    $(".navItem").hover(function () {
        $(this).css("color", '#dbb459');
        $(this).css("font-style", 'italic');
    });

    $(".navItem").on("mouseleave", function() {
        $(this).css("color", 'white');
        $(this).css("font-style", 'normal');
    });

    //shifts the logo
    $("#landingLogo").css("width", "20%");

    //Adding logout Button
    $("#logout").append("<button id='logoutButton' type='button' class='btn btn-default'>Log Out</button>");
    $("#logoutButton").click(function () {
        signOut();
        window.location.href = "/";
    })
})//end document ready