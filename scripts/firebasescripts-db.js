// Initialize Firebase
var db;
var auth;
var masterTID = "t-ECRMT";
function initializeFirebase() {
    var config = {
        apiKey: "AIzaSyATh0-Y57g345S5v1jwAHbboFp99E3EW_4",
        authDomain: "calvinhacks19-gcp.firebaseapp.com",
        databaseURL: "https://calvinhacks19-gcp.firebaseio.com",
        projectId: "calvinhacks19-gcp",
        storageBucket: "calvinhacks19-gcp.appspot.com",
        messagingSenderId: "915538048011"
    };
    firebase.initializeApp(config);
    auth = firebase.auth();
    db = firebase.firestore();
}

initializeFirebase();

function getUserJSON(uID) {
    var post = db.collection("users").doc(uID);
    var one = post.get().then(function(doc) {
        if (doc.exists) {
            // console.log("Document data:", doc.data());
            return doc.data();
        } else {
            return null;
        }
        
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
    return Promise.all([one]);
}

function getResumeJSON(rID) {
    var post = db.collection("resumes").doc(rID);
    var one = post.get().then(function(doc) {
        if (doc.exists) {
            // console.log("Document data:", doc.data());
            return doc.data();
        } else {
            return null;
        }
        
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
    return Promise.all([one]);
}

function getItemJSON(iID) {
    var post = db.collection("items").doc(iID);
    var one = post.get().then(function(doc) {
        if (doc.exists) {
            // console.log("Document data:", doc.data());
            return doc.data();
        } else {
            return null;
        }
        
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
    return Promise.all([one]);
}

function createUser(uID, userInfo) {
    var newUser = db.collection("users").doc(uID);
    var one = newUser.get().then(function(doc) {
        if (doc.exists) {
            console.log(uID + " exists");
            return 1;
        } else {
            console.log(uID + " does not exist");
            newUser.set(userInfo)
            .then(function() {
                console.log("Document successfully written!");
            })
            .catch(function(error) {
                console.error("Error writing document: ", error);
            });
            return 0;
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
    return Promise.all([one]);
}

function updateResumeInfo(oldResumeID) {
    var completeJSON = {
        "id": "",
        "name": "",
        "emailID": user.emails,
        "emailValue": [],
        "emailIncluded": [],
        "phoneID": user.phones,
        "phoneValue": [],
        "phoneIncluded": [],
        "addressID": user.addresses,
        "addressValue": [],
        "addressIncluded": [],
        "websiteID": user.websites,
        "websiteValue": [],
        "websiteIncluded": [],
        "summaryID": user.summaries,
        "summaryValue": [],
        "summaryIncluded": [],
        "certID": user.certs,
        "certValue": [],
        "certIncluded": [],
    }
    if (oldResumeID != null) {
        var initialResumeRequest = getResumeJSON(oldResumeID);
        initialResumeRequest.then(function(oldResumeJSON) {
            var categories = ["email","phone","address","website","summary","cert"];
            completeJSON.name = oldResumeJSON.name;
            completeJSON.id = oldResumeJSON.id;
            var status = [];
            for (var i = 0; i < categories.length; i++) {
                status.push(singleLineSegmentAnalysis(oldResumeJSON, completeJSON, categories[i]));
            }
            status.then(function() {
                console.log(completeJSON);
            });
        });
    } else {
        completeJSON.name = "New Resume";
        var categories = ["email","phone","address","website","summary","cert"];
        var status = [];
        for (var i = 0; i < categories.length; i++) {
            status.push(singleLineSegmentAnalysis(null, completeJSON, categories[i]));
        }
        return Promise.all(status).then(function() {
            //console.log(status);
            //console.log(completeJSON);
            return completeJSON
        });
    }
}

function singleLineSegmentAnalysis(oldJSON, newJSON, tag) {
    var complete = [];
    for (var i = 0; i < newJSON[tag + "ID"].length; i++) {
        newJSON[tag + "Included"][i] = false;
        if (oldJSON != null) {
            for (var j = 0; j < oldJSON[tag + "ID"].length; j++) {
                if (oldJSON[tag + "ID"][j].indexOf(newJSON[tag + "ID"][i]) > -1) {
                    newJSON[tag + "Included"][i] = oldJSON[tag + "Included"][j];
                }
            }
        }
        complete.push(getItemJSON(newJSON[tag + "ID"][i]));
    }
    var allDone = Promise.all(complete).then(function(results){
        for (var i = 0; i < results.length; i++) {
            if (results[0] != null) {
                //console.log(results[0][i]);
                newJSON[tag + "Value"][i] = results[i][0].value;
            }
        }
    });
    return allDone;
}

function addNewResume(userType, typeIDCode, htmlType) {
    rID = typeIDCode + "-" + generateID(10);
    var newItem = db.collection("items").doc(iID);
    console.log(iID + " reserved");
    var two;
    var one = newItem.get().then(function(doc) {
        if (doc.exists) {
            console.log(iID + " exists");
            console.log("Duplicate ID. Trying again...");
            addSingleLineItem(userType, typeIDCode, htmlType)
        } else {
            console.log(iID + " does not exist");
            newItem.set({
                "id": iID,
                "value": document.getElementById("new" + htmlType).value
            })
            .then(function() {
                console.log("Document successfully written!");
                var DBUser = db.collection("users").doc(user.id);
                two = DBUser.get().then(function(doc) {
                    if (doc.exists) {
                        // console.log("Document data:", doc.data());
                        userData = doc.data();
                        userData[userType].push(iID);
                        DBUser.set(userData)
                        .then(function() {
                            console.log("Document successfully written!");
                            loadCurrentUser(auth.currentUser, [getInfo]);
                            addGoodMessage("Element Added Successfully");
                            document.getElementById("new" + htmlType).value = "";
                        })
                        .catch(function(error) {
                            console.error("Error writing document: ", error);
                        });
                        return 0;
                    } else {
                        console.log("Error: parent does not exist!");
                        return 1;
                    }
                }).catch(function(error) {
                    console.log("Error getting document:", error);
                });
            }).catch(function(error) {
                console.error("Error writing document: ", error);
            });
            return 0;
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
    return Promise.all([one,two]);
}
