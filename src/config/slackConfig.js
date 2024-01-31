const { WebClient } = require('@slack/web-api');
require("dotenv").config();

// Slack API 토큰 설정
const slackToken = process.env.SLACK_TOKEN;
const slackClient = new WebClient(slackToken);

module.exports = slackClient;