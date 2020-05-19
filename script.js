var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var clientId = '936953089183-uhqoc3o2ppvq9c7k3qt502a0qncngblh.apps.googleusercontent.com';
var apiKey = 'AIzaSyBCelgT8UegrlTPaSHAX3EpvRhHCD7Zz94';
var scopes = 'https://www.googleapis.com/auth/gmail.readonly ' + 'https://www.googleapis.com/auth/gmail.send';
var emails = [];
var gapi;
var Email = /** @class */ (function () {
    function Email() {
    }
    return Email;
}());
var handleClientLoad = function () { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, setKey().then(function () {
                    checkAuth();
                })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var setKey = function () { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, Promise.resolve(gapi.client.setApiKey(apiKey))];
    });
}); };
var checkAuth = function () {
    gapi.auth.authorize({ client_id: clientId, scope: scopes, immediate: true }, handleAuthResult);
};
var handleAuthClick = function () {
    gapi.auth.authorize({ client_id: clientId, scope: scopes, immediate: false }, handleAuthResult);
    return false;
};
var handleAuthResult = function (authResult) {
    if (authResult && !authResult.error) {
        removeSignInScreen();
        loadGmailApi();
    }
};
var removeSignInScreen = function () {
    var signin = document.getElementById("signin");
    var signed = document.getElementById("signed");
    signin.classList.add("hidden");
    signed.classList.remove("hidden");
};
var logout = function () {
    gapi.auth.signOut();
    var signin = document.getElementById("signin");
    var signed = document.getElementById("signed");
    signed.classList.add("hidden");
    signin.classList.remove("hidden");
};
var loadGmailApi = function () {
    gapi.client.load('gmail', 'v1', displayBox);
};
var displayBox = function () { return __awaiter(_this, void 0, void 0, function () {
    var userId, labelIds, request;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = "me";
                labelIds = "INBOX";
                request = gapi.client.gmail.users.messages.list({ userId: userId, labelIds: labelIds });
                return [4 /*yield*/, request.execute(function (response) {
                        for (var i = 0; i < response.messages.length; i++) {
                            var messageReq = gapi.client.gmail.users.messages.get({ userId: userId, 'id': response.messages[i].id });
                            messageReq.execute(addMessage);
                        }
                    })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var addMessage = function (message) {
    var tmpEmail = new Email();
    tmpEmail.id = message.id;
    tmpEmail.From = getHeader(message.payload.headers, 'From');
    tmpEmail.Subject = getHeader(message.payload.headers, 'Subject');
    tmpEmail.Date = getHeader(message.payload.headers, 'Date');
    tmpEmail.body = getBody(message.payload);
    tmpEmail.replyTo = (getHeader(message.payload.headers, 'Reply-to') !== '' ? getHeader(message.payload.headers, 'Reply-To') : getHeader(message.payload.headers, 'From')).replace(/\"/g, '&quot;');
    tmpEmail.replySubject = "Re: " + getHeader(message.payload.headers, 'Subject').replace(/\"/g, '&quot;');
    tmpEmail.MessageID = getHeader(message.payload.headers, 'Message-ID');
    tmpEmail.labels = message.labelIds;
    var keys = tmpEmail.Subject.toLowerCase().split(" ");
    tmpEmail.keys = new Set(keys);
    emails.push(tmpEmail);
    reRenderPage();
};
var getFiltered = function (query) {
    query = query.toLowerCase();
    var results = [];
    for (var i = 0; i < emails.length; i++) {
        if (emails[i].keys.has(query)) {
            results.push(emails[i]);
        }
    }
    return results;
};
var getResults = function (element) {
    var query = element.value;
    if (query == "") {
        reRenderPage();
    }
    else {
        var rowContainer_1 = document.getElementById("emailpanel");
        rowContainer_1.innerHTML = "";
        var data = getFiltered(query);
        console.log(data);
        data.forEach(function (email) {
            var cardContainer = document.createElement("div");
            cardContainer.classList.add("card");
            cardContainer.style.minWidth = "18rem";
            cardContainer.style.marginBottom = "10px";
            var cardBody = document.createElement("div");
            cardBody.classList.add("card-body");
            var cardTitle = document.createElement("div");
            cardTitle.classList.add("card-title");
            cardTitle.style.color = "dodgerblue";
            cardTitle.innerHTML = email.From;
            var cardSubject = document.createElement("div");
            cardSubject.classList.add("card-text");
            cardSubject.innerHTML = email.Subject;
            var timeStamp = document.createElement("div");
            timeStamp.innerHTML = email.Date;
            timeStamp.classList.add("text-muted");
            cardBody.appendChild(cardTitle);
            cardBody.appendChild(cardSubject);
            cardBody.appendChild(timeStamp);
            cardContainer.appendChild(cardBody);
            cardContainer.onclick = function () { changeContent(email.id); };
            rowContainer_1.appendChild(cardContainer);
        });
    }
};
var reRenderPage = function () {
    var rowContainer = document.getElementById("emailpanel");
    rowContainer.innerHTML = "";
    emails.forEach(function (email) {
        var cardContainer = document.createElement("div");
        cardContainer.classList.add("card");
        cardContainer.style.minWidth = "18rem";
        cardContainer.style.marginBottom = "10px";
        var cardBody = document.createElement("div");
        cardBody.classList.add("card-body");
        var cardTitle = document.createElement("div");
        cardTitle.classList.add("card-title");
        cardTitle.style.color = "dodgerblue";
        cardTitle.innerHTML = email.From;
        var cardSubject = document.createElement("div");
        cardSubject.classList.add("card-text");
        cardSubject.innerHTML = email.Subject;
        var timeStamp = document.createElement("div");
        timeStamp.innerHTML = email.Date;
        timeStamp.classList.add("text-muted");
        cardBody.appendChild(cardTitle);
        cardBody.appendChild(cardSubject);
        cardBody.appendChild(timeStamp);
        cardContainer.appendChild(cardBody);
        cardContainer.onclick = function () { changeContent(email.id); };
        rowContainer.appendChild(cardContainer);
    });
};
var findIndex = function (query) {
    for (var i = 0; i < emails.length; i++) {
        if (emails[i].id == query) {
            return i;
        }
    }
    return -1;
};
var changeContent = function (id) {
    var viewer = document.getElementById("viewer");
    viewer.innerHTML = "";
    var frame = document.createElement("iframe");
    var index = findIndex(id);
    console.log(emails[index]);
    frame.srcdoc = emails[index].body;
    viewer.appendChild(frame);
};
/* <div class="card">
<div class="card-body">
<div class="card-title">ABC</div>
<div class="card-text">Some Subject</div>
<div class="text-muted">Some Time</div>
</div>
</div> */
var getHeader = function (allHeaders, key) {
    var header = "";
    allHeaders.forEach(function (element) {
        if (element.name.toLowerCase() === key.toLowerCase()) {
            header = element.value;
        }
    });
    return header;
};
var getBody = function (message) {
    var encoded = "";
    if (typeof message.parts === 'undefined') {
        encoded = message.body.data;
    }
    else {
        encoded = getHTML(message.parts);
    }
    encoded = encoded.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
    return decodeURIComponent(escape(window.atob(encoded)));
};
var getHTML = function (data) {
    for (var i = 0; i <= data.length; i++) {
        if (typeof data[i].parts === 'undefined') {
            if (data[i].mimeType === 'text/html') {
                return data[i].body.data;
            }
        }
        else {
            return getHTML(data[i].parts);
        }
    }
    return "";
};
var sendEmail = function () {
    //Disable the button;
};
var sendMessage = function (headers, message, callback) {
    var mail = '';
    for (var head in headers)
        mail += head += ": " + headers[head] + "\r\n";
    mail += "\r\n" + message;
    var sendReq = gapi.client.gmail.users.messages.send({ 'userid': 'me', 'resource': { 'raw': window.btoa(mail).replace(/\+/g, '-').replace(/\//g, '_') } });
    return sendReq.execute(callback);
};
