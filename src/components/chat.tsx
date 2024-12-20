/**
* This code was generated by v0 by Vercel.
* @see https://v0.dev/t/rQ4JU8lM7Gn
* Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
*/

/** Add fonts into your Next.js project:

import { Inter } from 'next/font/google'

inter({
  subsets: ['latin'],
  display: 'swap',
})

To read more about using these font, please visit the Next.js documentation:
- App Directory: https://nextjs.org/docs/app/building-your-application/optimizing/fonts
- Pages Directory: https://nextjs.org/docs/pages/building-your-application/optimizing/fonts
**/
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose, DrawerFooter } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useContext, useEffect, useRef, useState } from "react"
import { ChatContext, MessageVisibility } from "@/contexts/chat-context"
import ChatMessage from "./chat-message"
import DataLoader from "./data-loader"
import { CheckCircle2, CheckIcon, FileIcon, SendIcon, SettingsIcon, Trash2Icon, Wand2 } from "lucide-react"
import { coercedVal, ConfigContext } from "@/contexts/config-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import { ChatBubbleIcon, CheckboxIcon, MagicWandIcon } from "@radix-ui/react-icons"
import TemplateStringRenderer from "./template-string-renderer"
import Markdown from 'react-markdown'
import styles from './chat-message.module.css';
import remarkGfm from 'remark-gfm';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog"

export function Chat() {

  const config = useContext(ConfigContext);
  const chatContext = useContext(ChatContext);
  const [currentMessage, setCurrentMessage] = useState('');
  const [llmProvider, setLlmProvider] = useState('chatgpt');
  const [llmModel, setLlmModel] = useState('chatgpt-4o-latest');
  const messageTextArea = useRef<HTMLTextAreaElement | null>(null);
  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const [addFolderContext, setFolderContext] = useState(true);

  const [defaultLLMModel, setDefaultLLMModel] = useState('chatgpt-4o-latest');
  const [warningRead, setWarningRead] = useState(false);

  const [defaultChatProvider, setDefaultChatProvider] = useState('');
  const [ollamaUrl, setOllamaUrl] = useState('');
  const [showProviders, setShowProviders] = useState(false);



  useEffect(()=> {
    if (chatContext.lastMessage) {
      lastMessageRef.current?.scrollIntoView({ behavior: 'instant' });
    }
    async function loadConfig() {
      setDefaultChatProvider(await config?.getServerConfig('llmProviderChat') as string);
      setLlmProvider(await config?.getServerConfig('llmProviderChat') as string);
      setLlmModel(await config?.getServerConfig('llmModelChat') as string ?? 'chatgpt-4o-latest');
      const configOllamaUrl = await config?.getServerConfig('ollamaUrl') as string
      setOllamaUrl(configOllamaUrl);
      setShowProviders(process.env.NEXT_PUBLIC_CHAT_PROVIDER_SELECT !== "" && (configOllamaUrl !== null && typeof configOllamaUrl === 'string' && configOllamaUrl.startsWith('http')));
    }; 
    loadConfig();

    messageTextArea.current?.focus();
  }, [chatContext.messages, chatContext.lastMessage, chatContext.isStreaming, config]);
  

  const handleSubmit = async () => {
    let messageWasDelivered = false;
    if (currentMessage) {
      if (addFolderContext) {
        if (chatContext.areRecordsLoaded === false && !chatContext.isStreaming && await chatContext.checkApiConfig()) {
          try {
            messageWasDelivered = true;
          } catch (error) {
            console.error(error);
            toast.error(t('Failed to load folder records into chat: ') + error);
          }
        }        
      } 
      
      if (!messageWasDelivered) {
        chatContext.sendMessage({ message: { role: 'user', name: 'You', content: currentMessage}, providerName: llmProvider ?? defaultChatProvider, modelName: llmModel ?? defaultLLMModel, onResult: (result) => {
          }
        });
      }
      setCurrentMessage('');
    }
  }

  return (
            <>
        <AlertDialog open={chatContext.agentFinishedDialogOpen}>
          <AlertDialogContent className="bg-white dark:bg-zinc-950">
            <AlertDialogHeader>
              <AlertDialogTitle>The agent has finished. Do you want to clear the context and start New Chat?</AlertDialogTitle>
              <AlertDialogDescription>
                {chatContext.agentFinishMessage}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No</AlertDialogCancel>
              <AlertDialogAction onClick={(e) => 
                {
                  chatContext.newChat();
                }
              }>YES</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>      
                
        {chatContext.agentContext ? (
          <div className="dark:text-black bg-green-200 grid grid-cols-3 p-5 text-sm">
            <div><strong>AI Agent Context</strong></div>
            <div>type: <strong>{chatContext.agentContext.displayName}</strong></div>
          </div>
        ) : null}

        <div className="flex flex-col h-[500px] overflow-y-auto">
          <div className="flex-1 p-4 space-y-4">
            {/* {chatContext.messages.length === 1 ? (
              <OnboardingChat />              
            ) : null} */}
            {chatContext.messages.length > 1 && chatContext.visibleMessages.slice(chatContext.visibleMessages.length > 5 ? chatContext.visibleMessages.length-5 : 0, chatContext.visibleMessages.length).map((message, index) => ( // display only last 5 messages
              <ChatMessage key={index} message={message} />
            ))}

            {chatContext.isStreaming ? (
              <div className="flex"><div className="ml-2 h-4 w-4 animate-spin rounded-full border-4 border-primary border-t-transparent" /> <span className="text-xs">AI request in progress, provider: {llmProvider ? llmProvider : chatContext?.providerName}{llmModel ? ' (' + llmModel + ')' : ''}</span></div>
            ):null}
            <div id="last-message" ref={lastMessageRef}></div>
          </div>
        </div>
          <div className="flex">
            {chatContext.chatTemplatePromptVisible ? (
              <div className="relative w-full">
                <div className="min-h-[48px] rounded-2xl resize-none p-4 border border-neutral-400 shadow-sm pr-16">
                  <TemplateStringRenderer template={chatContext.promptTemplate} onChange={(v:string) => {
                    setCurrentMessage(v);
                  }} />
                </div>

                <div className="absolute flex top-3 right-3 gap-2">
                  <div className="">              
                    <Button type="submit" size="icon" className="w-8 h-8" onClick={() => {
                      handleSubmit();
                      chatContext.setTemplatePromptVisible(false);
                      chatContext.setChatCustomPromptVisible(false);
                    }}>
                      <ArrowUpIcon className="w-4 h-4" />
                      <span className="sr-only">Send</span>
                    </Button>              
                    </div>
                  </div>
              </div>
            ) : ''}

            {chatContext.chatCustomPromptVisible ? (
            <div className="relative grow">
              <Textarea
                placeholder="Type your message..."
                name="message"
                autoFocus
                ref={messageTextArea}
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                id="message"
                rows={1}
                onKeyDown={(e) => {
                  if(e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit()
                  }
                }}
                className="min-h-[48px] rounded-2xl resize-none p-4 border border-neutral-400 shadow-sm pr-16"
              />
              <div className="absolute flex top-3 right-3 gap-2">
                <div className="xxs:invisible md:visible">
                  <Select id="llmProvider" value={llmProvider} onValueChange={setLlmProvider}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue  placeholder="Default: Chat GPT" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem key="chatgpt" value="chatgpt">Cloud: Chat GPT</SelectItem>
                        {showProviders ? (
                          <SelectItem key="ollama" value="ollama">Local: Ollama</SelectItem>
                        ): null}
                      </SelectContent>
                    </Select>
                  </div>

                <Button type="submit" size="icon" className="w-8 h-8" onClick={() => {
                  handleSubmit();
                }}>
                  <ArrowUpIcon className="w-4 h-4" />
                  <span className="sr-only">Send</span>
                </Button>
                </div>     
            </div>
            ) : ''}
          </div>
      </>
  )
}

function ArrowUpIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 7-7 7 7" />
      <path d="M12 19V5" />
    </svg>
  )
}


function XIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

export function MessageCircleIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  )
}