const express = require("express");
const body_parser = require("body-parser");
const { default: axios } = require("axios");
require("dotenv").config();

const app = express();

app.use(body_parser.json());

const whatsappToken = process.env.WHATSAPPTOKEN;
const myToken = process.env.MYTOKEN;
const port = process.env.PORT;
app.listen(8000 || port, () => {
  console.log("webhook listening");
});

app.get("/", (req, res) => {
  res.send("hello biro");
});

app.get("/login", (req, res) => {
  res.send("This is login page.");
});

app.get("/webhook", (req, res) => {
  let mode = req.query["hub.mode"];
  let challenge = req.query["hub.challenge"];
  let token = req.query["hub.verify_token"];
  if (mode && token) {
    console.log("called", mode);
    if (mode === "subscribe" && token === myToken) {
      res.status(200).send(challenge);
    } else {
      res.status(403);
    }
  }
});

app.post("/webhook", (req, res) => {
  const body = req.body;

  console.log("body", JSON.stringify(body));

  if (body.object) {
    if (
      body.entry &&
      body.entry[0].changes &&
      body.entry[0].changes[0].value.messages &&
      body.entry[0].changes[0].value.messages[0]
    ) {
      let phone_number_id =
        body.entry[0].changes[0].value.metadata.phone_number_id;
      let from = body.entry[0].changes[0].value.messages[0].from;
      let message_body = body.entry[0].changes[0].value.messages[0].text.body;
      console.log("messageBody", message_body);
      console.log("phone_number_id", phone_number_id);
      console.log("from", from);
      console.log("message_body", message_body);
      axios({
        method: "post",
        url: `https://graph.facebook.com/v15.0/${phone_number_id}/messages`,
        headers: {
          Authorization: `Bearer ${whatsappToken}`,
          "Content-Type": "application/json",
        },
        data: {
          messaging_product: "whatsapp",
          to: from,
          type: "text",
          text: {
            body: "This is test message",
          },
        },
      });
    }
  }
});
