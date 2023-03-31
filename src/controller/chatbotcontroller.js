require("dotenv").config();
import request from "request";

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PAGE_VERIFY_TOKEN = process.env.PAGE_VERIFY_TOKEN;

let getHomePage = (req, res) => {
  return res.send("helloo");
};
let postWebhook = (req, res) => {
  let body = req.body;
  if (body.object === 'page') {
    body.entry.forEach(function (entry) {
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);
      let send_psid = webhook_event.sender.id;
      console.log("PSID---:" + send_psid);

      if (webhook_event.message) {
        handleMessage(send_psid, webhook_event.message);
        
      } else if (webhook_event.postback) {
        
        handlePostback(send_psid, webhook_event.postback);
      }
    });
    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
};

function handlePostback(send_psid, received_postback) {


}

function callsendAPI(sender_psid, response) {
  let request_body = {
    "recipient": {
      "id": sender_psid,
    }
  }
  
  request({
   
      "uri": "https://graph.facebook.com/v16.0/100091473608585/messages?access_token="+PAGE_VERIFY_TOKEN,
      "Content-Type": "application/json",
      "method": "POST",
      "message":{ 
        "text": response
      },
      "messaging_type": request_body
    },(err, res, body) => {
      if (!err) {
        console.log("message sent!");
      } else {
        console.error("unable to send message: " + err);
      }
    
  });
}
 

function handleMessage(sender_psid, received_message) {
  let response;
  if (received_message.text) {
    console.log("-----------------------------")

    console.log(received_message.text)
    console.log("-----------------------------")
    response = {
      "text": `chào bạn tin nhắn ---------:"${received_message.text}".không hợp lệ`
    }
  }
  callsendAPI(sender_psid, response);
}
let getWebhook = (req, res) => {
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];
  if (mode && token) {
    // Check the mode and token sent is correct
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      // Respond with the challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Respond with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
};
module.exports = {
  getHomePage: getHomePage,
  getWebhook: getWebhook,
  postWebhook: postWebhook,
};
