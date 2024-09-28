'use client';

import axios from 'axios';
import { Box, Stack, TextField, Button } from '@mui/material';
import { useState } from 'react';

// Ensure your OpenAI API key is correctly set in your environment variables
const openaiApiKey = process.env.REACT_APP_OPENAI_API_KEY;

export default function Home() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: 'Hi! I am the Headstarter Support Agent, how can I assist you today?'
  }]);
  const [message, setMessage] = useState('');
  const [context, setContext] = useState([]); // Store conversation context

  const sendMessage = async () => {
    const userMessage = message.trim();
    if (!userMessage) return;

    setMessage('');
    setMessages((messages) => [
      ...messages,
      { role: "user", content: userMessage },
      { role: "assistant", content: '...' }, // Show typing indicator
    ]);

    // Add the new user message to the context
    const updatedContext = [...context, { role: "user", content: userMessage }];
    setContext(updatedContext);

    try {
      console.log("API Key being used:", openaiApiKey); // Debugging: Ensure API Key is accessible
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-4",
          messages: updatedContext,
        },
        {
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const assistantResponse = response.data.choices[0].message.content;

      // Add the assistant's response to the messages and context
      setMessages((messages) => {
        const otherMessages = messages.slice(0, messages.length - 1); // Remove typing indicator
        return [
          ...otherMessages,
          { role: "assistant", content: assistantResponse },
        ];
      });
      setContext([...updatedContext, { role: "assistant", content: assistantResponse }]);

    } catch (error) {
      console.error('Error sending message:', error.response ? error.response.data : error.message);
      // Friendly error message
      const friendlyMessage = "I’m sorry, I’m having trouble understanding right now. Could you please try again later?";
      setMessages((messages) => [
        ...messages,
        { role: "assistant", content: friendlyMessage }
      ]);
    }
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Stack
        direction="column"
        width="600px"
        height="700px"
        border="1px solid black"
        p={2}
        spacing={2}
      >
        <Stack
          direction="column"
          spacing={2}
          flexGrow={1}
          sx={{ overflow: 'auto', maxHeight: '100%' }}
        >
          {
            messages.map((message, index) => (
              <Box key={index} display='flex' justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }>
                <Box bgcolor={
                  message.role === 'assistant' ? 'primary.main' : 'secondary.main'
                }
                  color="white"
                  borderRadius={16}
                  p={3}
                >
                  {message.content}
                </Box>
              </Box>
            ))
          }
        </Stack>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') sendMessage();
            }}
          />
          <Button variant="contained" onClick={sendMessage}>Send</Button>
        </Stack>
      </Stack>
    </Box>
  );
}
