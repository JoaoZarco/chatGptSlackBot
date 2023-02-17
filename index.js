require('dotenv').config()
const { App } = require('@slack/bolt');

const threadLastBotMessageMap = new Map();
const threadConversationMap = new Map();

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});

app.event('app_mention', async ({ event, say }) => {
    const query = parseMentionText(event.text)
    const thread = event.thread_ts || event.ts

    const lastMessageId = threadLastBotMessageMap.get(thread)
    const conversationId = threadConversationMap.get(thread)

    const response = await queryChatGPT(query, conversationId, lastMessageId)

    threadLastBotMessageMap.set(thread, response.id)
    threadConversationMap.set(thread, response.conversationId)

    say({text: parseChatGPTResponse(response.text), thread_ts: thread})
})

const parseChatGPTResponse = (response) => {
    return '```'.concat(response).concat('```')
}

const parseMentionText = (text) => {
    const items = text.split('>')
    items.shift()
    return items.join('').trim();
}

const queryChatGPT = async (query, conversationId, parentMessageId) => {
    const ChatGPTAPI = (await import('chatgpt')).ChatGPTAPI
    const api = new ChatGPTAPI({
        apiKey: process.env.OPENAI_API_KEY,
    })
    return (await api.sendMessage(query, {
        conversationId,
        parentMessageId
    }))
}

const startBot = async () => {
  // Start the app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
};
startBot()

