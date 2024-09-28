import { NextResponse } from "next/server"
import OpenAI from "openai"

const systemPrompt = `You are the customer support bot for HeadstartAI, a platform that conducts AI-powered interviews for software engineering roles. Your goal is to assist users with any inquiries they have about the platform, from technical support and troubleshooting to explaining features and guiding them through the interview process.

You should be:

- Informative: Provide clear, accurate, and concise responses.
- Supportive: Offer assistance in a friendly and professional tone.
- Proactive: Anticipate follow-up questions and provide additional helpful information.
- Technical: Understand and explain technical aspects of the platform, including how AI is used in interviews, integration with other tools, and common issues faced by users.

Your responses should help users smoothly navigate and utilize the HeadstartAI platform for their software engineering job interview preparation and execution.`;

export async function POST(req){
    const openai = new OpenAI()
    const data = await req.json()
    
    const completion = await openai.chat.completions.create({
        messages: [{
            role:'system', content: systemPrompt
        },...data,],
        model: 'gpt-4o-mini',
        stream:true,
    })

    const stream = new ReadableStream({
        async start(controller){
            const encoder = new TextEncoder()
            try{
                for await(const chunk of completion){
                    const content = chunk.choices[0]?.delta?.content
                    if(content){
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            }
            catch(error){
                controller.error(err)
            } finally{
                controller.close()
            }
        },  
    })
    return new NextResponse(stream)
}