let clientId = '936953089183-uhqoc3o2ppvq9c7k3qt502a0qncngblh.apps.googleusercontent.com';
let apiKey = 'AIzaSyBCelgT8UegrlTPaSHAX3EpvRhHCD7Zz94';
let scopes = 'https://www.googleapis.com/auth/gmail.readonly '+'https://www.googleapis.com/auth/gmail.send';

let emails = [];

let gapi:any;

class Email{
    id:String;
    From:String;
    Date:String;
    Subject:String;
    replyTo:String;
    replySubject:String;
    MessageID:String;
    body:String;
    labels:String[];
    keys:Set<String>;
}

const handleClientLoad = async () =>{
    await setKey().then(()=>{
        checkAuth();
    });
}

const setKey = async () =>{
    return Promise.resolve(gapi.client.setApiKey(apiKey));
}

const checkAuth = () =>{
    gapi.auth.authorize({client_id: clientId,scope: scopes,immediate: true}, handleAuthResult);
}

const handleAuthClick = () => {
    gapi.auth.authorize({client_id:clientId,scope:scopes,immediate:false},handleAuthResult);
    return false;
}

const handleAuthResult = (authResult) =>{
    if(authResult && !authResult.error){
        removeSignInScreen();
        loadGmailApi();
    }
}

const removeSignInScreen = () =>{
    let signin = <HTMLDivElement>document.getElementById("signin");
    let signed = <HTMLDivElement>document.getElementById("signed");
    signin.classList.add("hidden");
    signed.classList.remove("hidden");
}

const logout = () =>{
    gapi.auth.signOut();
    let signin = <HTMLDivElement>document.getElementById("signin");
    let signed = <HTMLDivElement>document.getElementById("signed");
    signed.classList.add("hidden");
    signin.classList.remove("hidden");
}

const loadGmailApi = () =>{
    gapi.client.load('gmail','v1',displayBox);
}

const displayBox = async () =>{
    let userId = "me";
    let labelIds = "INBOX"
    let request = gapi.client.gmail.users.messages.list({userId,labelIds})
    await request.execute((response)=>{
        for(let i=0;i<response.messages.length;i++){
            let messageReq = gapi.client.gmail.users.messages.get({userId,'id':response.messages[i].id})
            messageReq.execute(addMessage);
        } 
    })
}

const addMessage = (message) =>{
    let tmpEmail = new Email();
    tmpEmail.id = message.id;
    tmpEmail.From = getHeader(message.payload.headers, 'From');
    tmpEmail.Subject = getHeader(message.payload.headers, 'Subject');
    tmpEmail.Date = getHeader(message.payload.headers,'Date');
    tmpEmail.body = getBody(message.payload);
    tmpEmail.replyTo = (getHeader(message.payload.headers,'Reply-to') !== ''?getHeader(message.payload.headers,'Reply-To') : getHeader(message.payload.headers, 'From')).replace(/\"/g, '&quot;')
    tmpEmail.replySubject = `Re: ${getHeader(message.payload.headers,'Subject').replace(/\"/g, '&quot;')}`;
    tmpEmail.MessageID = getHeader(message.payload.headers, 'Message-ID')
    tmpEmail.labels = message.labelIds;
    let keys = tmpEmail.Subject.toLowerCase().split(" ");
    tmpEmail.keys = new Set(keys);
    emails.push(tmpEmail);
    reRenderPage();
}

const getFiltered = (query) =>{
    query = query.toLowerCase();
    let results = []

    results = emails.filter(email => email.keys.has(query))
    return results;
}

const getResults = (element) =>{
    let query = element.value;
    if(query == ""){
        reRenderPage();
    }else{
        let rowContainer = <HTMLDivElement>document.getElementById("emailpanel");
        rowContainer.innerHTML = "";
        let data = getFiltered(query);
        console.log(data);
        data.forEach(email => {
        let cardContainer = <HTMLDivElement>document.createElement("div");
        cardContainer.classList.add("card");
        cardContainer.style.minWidth = "18rem"
        cardContainer.style.marginBottom = "10px"
        let cardBody = <HTMLDivElement>document.createElement("div");
        cardBody.classList.add("card-body");
        let cardTitle = <HTMLDivElement>document.createElement("div");
        cardTitle.classList.add("card-title");
        cardTitle.style.color = "dodgerblue"
        cardTitle.innerHTML = email.From;
        let cardSubject = <HTMLDivElement>document.createElement("div");
        cardSubject.classList.add("card-text");
        cardSubject.innerHTML = email.Subject;
        let timeStamp = <HTMLDivElement>document.createElement("div");
        timeStamp.innerHTML = email.Date;
        timeStamp.classList.add("text-muted");
        cardBody.appendChild(cardTitle);
        cardBody.appendChild(cardSubject);
        cardBody.appendChild(timeStamp);
        cardContainer.appendChild(cardBody);
        cardContainer.onclick = ()=>{changeContent(email.id);}
        rowContainer.appendChild(cardContainer);
    });

    }
}


const reRenderPage = () =>{
    let rowContainer = <HTMLDivElement>document.getElementById("emailpanel");
    rowContainer.innerHTML = "";
    emails.forEach(email => {
        let cardContainer = <HTMLDivElement>document.createElement("div");
        cardContainer.classList.add("card");
        cardContainer.style.minWidth = "18rem"
        cardContainer.style.marginBottom = "10px"
        let cardBody = <HTMLDivElement>document.createElement("div");
        cardBody.classList.add("card-body");
        let cardTitle = <HTMLDivElement>document.createElement("div");
        cardTitle.classList.add("card-title");
        cardTitle.style.color = "dodgerblue"
        cardTitle.innerHTML = email.From;
        let cardSubject = <HTMLDivElement>document.createElement("div");
        cardSubject.classList.add("card-text");
        cardSubject.innerHTML = email.Subject;
        let timeStamp = <HTMLDivElement>document.createElement("div");
        timeStamp.innerHTML = email.Date;
        timeStamp.classList.add("text-muted");
        cardBody.appendChild(cardTitle);
        cardBody.appendChild(cardSubject);
        cardBody.appendChild(timeStamp);
        cardContainer.appendChild(cardBody);
        cardContainer.onclick = ()=>{changeContent(email.id);}
        rowContainer.appendChild(cardContainer);
    });
    
}
const findIndex = (query) =>{
    const isIndex = (element) => element.id == query;
    let results = emails.filter(isIndex)
    return results[0].id;
}


const changeContent = (id) =>{
    let viewer = <HTMLDivElement>document.getElementById("viewer");
    viewer.innerHTML = "";
    let frame = <HTMLIFrameElement>document.createElement("iframe");
    let index = findIndex(id);
    console.log(emails[index]);
    frame.srcdoc = emails[index].body
    viewer.appendChild(frame)
}

const getForm = () =>{
    let viewer = <HTMLDivElement>document.getElementById("viewer");
    viewer.innerHTML = "";
    let formdata = '<form>\r\n                    <div class=\"form-group\">\r\n                      <input type=\"email\" class=\"form-control\" id=\"toAddress\" placeholder=\"To\" required>\r\n                    <\/div>\r\n                    <div class=\"form-group\">\r\n                      <input type=\"text\" class=\"form-control\" id=\"subject\" placeholder=\"Subject\">\r\n                    <\/div>\r\n                    <div class=\"form-group\">\r\n                        <textarea name=\"body\" class=\"form-control\" id=\"emailbody\" style=\"min-width: 100%;min-height: 70vh;\" placeholder=\"Enter Content\" required><\/textarea>\r\n                    <\/div>\r\n                    <button onclick=\"sendEmail()\" class=\"btn btn-primary\">Send<\/button>\r\n                  <\/form>'
    viewer.innerHTML = formdata;
}


const getHeader = (allHeaders, key) => {
    let header = "";
    allHeaders.forEach(element => {
        if(element.name.toLowerCase() === key.toLowerCase()){
            header = element.value;
        }
    });
    return header;
}

const getBody = (message) =>{
    let encoded = "";
    if(typeof message.parts === 'undefined'){
        encoded = message.body.data;
    }else{
        encoded = getHTML(message.parts);
    }
    encoded = encoded.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
    return decodeURIComponent(escape(window.atob(encoded)));
}

const getHTML = (data) =>{
    for(let i=0;i<=data.length;i++){
        if(typeof data[i].parts === 'undefined'){
            if(data[i].mimeType === 'text/html'){
                return data[i].body.data;
            }
        }
        else{
            return getHTML(data[i].parts);
        }
    }
    return "";
}

const showOutput = () => {
    let viewer = <HTMLDivElement>document.getElementById("viewer");
    viewer.innerHTML = "<div class=\"alert alert-success\" role=\"alert\">\r\n  Mail Sent\r\n<\/div>"
}

const sendEmail = () => {
    //Disable the button;
    console.log("Yay");
    let send = <HTMLButtonElement>document.getElementById("sendbutton");
    let bodyElement = <HTMLTextAreaElement>document.getElementById("emailbody");
    let SubjectElement = <HTMLInputElement>document.getElementById("subject");
    let ToElement = <HTMLInputElement>document.getElementById("toAddress");
    let body = bodyElement.value;
    let Subject = SubjectElement.value;
    let To = ToElement.value;
    send.disabled = true;
    sendMessage({To,Subject},body,showOutput);
    return false;
}

const sendMessage = (headers,message,callback) =>{
    let mail = '';
    for(let head in headers)
    mail += head += ": "+headers[head]+"\r\n";
    mail += "\r\n"+ message
    let sendReq = gapi.client.gmail.users.messages.send({'userid':'me','resource':{'raw':window.btoa(mail).replace(/\+/g, '-').replace(/\//g, '_')}})
    return sendReq.execute(callback);
}