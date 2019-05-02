// Takes JSON and autopopulates input form

let JSON2 = {};

/*let JSON = {
    "resumeName": "hello darkness my friend",
    "name": "John Smith",
    "websiteID": ["web-1", "web-2", "web-3"],
    "websiteValue": ["linkedin", "github", "twitter"],
    "websiteIsChecked": [true, false, false],
    "skillID": ["skill-1", "skill-2", "skill-3"],
    "skillValue": ["knitting", "swimming"],
    "skillIsChecked": [true, false, false],
    "emailID": ["skill-1", "skill-2", "skill-3"],
    "emailValue": ["knitting", "swimming"],
    "emailIsChecked": [true, false, false],
    "phoneID": ["skill-1", "skill-2", "skill-3"],
    "phoneValue": ["knitting", "swimming"],
    "phoneIsChecked": [false, false, false],
    "addressID": ["skill-1", "skill-2", "skill-3"],
    "addressValue": ["knitting", "swimming"],
    "addressIsChecked": [true, false, true],
    "summaryID": ["skill-1", "skill-2", "skill-3"],
    "summaryValue": ["knitting", "no"],
    "summaryIsChecked": [true, false, false],
    "certID": ["skill-1", "skill-2", "skill-3"],
    "certValue": ["knitting and crochet", "jazz"],
    "certIsChecked": [true, true, false]
}*/

// function for processing specific forms

function processSingleForm(JSON, container, formType, websiteLabel) {
    container.innerHTML = "<label><h3>" + websiteLabel + "</h3></label><br>"
    if (JSON[formType + "ID"].length > 0) {
        for (let i = 0; i < JSON[formType + "ID"].length; i++) {
            let inputContainerDiv = document.createElement("div");
            inputContainerDiv.classList.add("form-check");

            let input = document.createElement("input");
            input.type = "checkbox";
            input.classList.add("form-check-input");
            input.id = JSON[formType + "ID"][i];
            input.checked = JSON[formType + "Included"][i];
            input.value = "";

            let label = document.createElement("label");
            label.classList.add("form-check-label");
            label.setAttribute("for", JSON[formType + "ID"][i]);
            label.innerHTML = JSON[formType + "Value"][i] + "<br>";

            container.appendChild(inputContainerDiv);
            inputContainerDiv.appendChild(input);
            inputContainerDiv.appendChild(label);
        }
    } else {
        let inputContainerDiv = document.createElement("div");
        inputContainerDiv.classList.add("form-check");

        let label = document.createElement("label");
        label.classList.add("form-check-label");
        label.setAttribute("for", formType);
        label.innerHTML = "There are currently no " + websiteLabel + " in your profile to add to this resume. To add one, go to <a href='profile.html'>your profile</a>.<br>";

        container.appendChild(inputContainerDiv);
        inputContainerDiv.appendChild(label);
    }
}

// main

function loadResumeForm() {

    let JSONPromise;
    if (document.getElementById("selectResume").value.indexOf("newResume") > -1) {
        JSONPromise = updateResumeInfo(null);
        document.getElementById("saveResumeButton").style.display = "none";
    } else {
        JSONPromise = updateResumeInfo(document.getElementById("selectResume").value);
        document.getElementById("saveResumeButton").style.display = "";
    }
    JSONPromise.then(function (results) {
        JSON = results;
        JSON2 = JSON;
        console.log(JSON);

        document.getElementById("generatedInputElementsGoHere").innerHTML = /*"<label for='resumeName'><h3>Resumé version</h3></label>" +
        */"<div class='form-group'>"/*<input type='text' placeholder='Resumé for Apple, Resumé for Samsung' class='form-control' id='resumeName' value=\""+ JSON["name"] +"\"></div>"*/
        document.getElementById("resumeName").value = JSON["name"];

        let categories = ["email", "phone", "address", "website", "summary", "cert"];
        let labels = ["Emails", "Phones", "Addresses", "Websites", "Summaries", "Certifications"];
        for (let i = 0; i < categories.length; i++) {

            let container = document.createElement("div");
            document.getElementById("generatedInputElementsGoHere").appendChild(container);

            processSingleForm(JSON, container, categories[i], labels[i]);

        }

        previewResume();

    });
}

function loadResumeFormAuto() {
    if (!manualResumeSelection) {
        loadResumeForm();
    }
}

function loadResumeFormManual() {
    manualResumeSelection = true;
    loadResumeForm();
}

// Adds and subtracts individual sections to the Resume
function manageResumeContent(section) {
    try {
        let children = document.getElementById(JSON2[section + "ID"][0]).parentElement.parentElement.childNodes;
        children.forEach(function (element) {
            if (element.nodeName == "DIV" &&
                element.childNodes[0].checked &&
                document.getElementById(section + "Container").innerHTML.indexOf(element.childNodes[0].nextSibling.innerHTML) == -1) {
                document.getElementById(section + "Container").innerHTML += "<p>" + element.childNodes[0].nextSibling.innerHTML + "</p>";
            }
            if (element.nodeName == "DIV" &&
                !element.childNodes[0].checked) {
                let stringToReplace = "<p>" + element.childNodes[0].nextSibling.innerHTML + "</p>";
                document.getElementById(section + "Container").innerHTML = document.getElementById(section + "Container")
                    .innerHTML.replace(stringToReplace, "");
            }
        });
    } catch (err) {
        console.log(err);
    }
}

function previewResume() {

    document.getElementById("resumeDocumentName").innerHTML = user.name;

    manageResumeContent("email");
    manageResumeContent("phone");
    manageResumeContent("address");
    manageResumeContent("website");
    manageResumeContent("summary");
    if (document.getElementById("summaryContainer").innerHTML == "") {
        document.getElementById("summaryHeader").style.display = "none";
    } else {
        document.getElementById("summaryHeader").style.display = "";
    }

    manageResumeContent("cert");
    if (document.getElementById("certContainer").innerHTML == "") {
        document.getElementById("certHeader").style.display = "none";
    } else {
        document.getElementById("certHeader").style.display = "";
    }

}

manualResumeSelection = false;
function getResumes() {
    document.getElementById("selectResume").innerHTML = "";
    var resumeOptions = [];
    for (var i = 0; i < user.resumes.length; i++) {
        getResumeJSON(user.resumes[i]).then(function (results) {
            var innerHTML = "<option value='" + results[0].id + "'>" + results[0].name + "</option>"
            document.getElementById("selectResume").innerHTML += innerHTML;
        });
    }
    Promise.all(resumeOptions).then(function () {
        document.getElementById("selectResume").innerHTML += "<option value='newResume'> + Create New Resume</option>";
        loadResumeFormAuto();
    });
}

function PrintElem(elem)
{
    var mywindow = window.open('', 'PRINT', 'height=400,width=600');

    mywindow.document.write('<html><head><title>' + document.title  + '</title>');
    mywindow.document.write('</head><body >');
    mywindow.document.write(document.getElementById(elem).innerHTML);
    mywindow.document.write('</body></html>');

    mywindow.document.close(); // necessary for IE >= 10
    mywindow.focus(); // necessary for IE >= 10*/

    mywindow.print();
    mywindow.close();

    return true;
}