let clientId = '435424937057-ckq50rf8b5dki9o7dim9bgqjf3i5miq4.apps.googleusercontent.com';
let apiKey = 'AIzaSyCkX1JZd7rnzazV0KhOoYz8FKQC1mRn6FM';
let scopes = 'https://www.googleapis.com/auth/gmail.readonly '+'https://www.googleapis.com/auth/gmail.send';

let emails = [];

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

const handleClientLoad = () =>{
    gapi.client.setApiKey(apiKey);
    window.setTimeout(checkAuth, 1);
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
        loadGmailApi();
        //removeSignInScreen();
    }
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
    let keys = tmpEmail.Subject.split(" ");
    tmpEmail.keys = new Set(keys);
    emails.push(tmpEmail);
    reRenderPage();
}

const reRenderPage = () =>{

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

const sendEmail = () => {
    //Disable the button;

}

const sendMessage = (headers,message,callback) =>{
    let mail = '';
    for(let head in headers)
        mail += head += ": "+headers[head]+"\r\n";
    mail += "\r\n"+ message
    let sendReq = gapi.client.gmail.users.messages.send({'userid':'me','resource':{'raw':window.btoa(mail).replace(/\+/g, '-').replace(/\//g, '_')}})
    return sendReq.execute(callback);
}