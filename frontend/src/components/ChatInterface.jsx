import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactDOM from 'react-dom';
import Message from './Message';
import ChatInput from './ChatInput';
import { getConversations, getMessages, sendMessageStream, createConversation, deleteConversation, updateConversation, getConversation } from '../services/api';
import { logout, getUserInfo } from '../services/authService';

const ChatInterface = () => {
  // Basic state
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(null);
  const [editingTitle, setEditingTitle] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  // Pagination state - RESTORED for proper pagination
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 10;
  const [shouldLoadMore, setShouldLoadMore] = useState(false);
  
  // Conversation pagination state
  const [hasMoreConversations, setHasMoreConversations] = useState(false);
  const [isLoadingMoreConversations, setIsLoadingMoreConversations] = useState(false);
  const [conversationsPage, setConversationsPage] = useState(1);
  const conversationsPerPage = 10;
  
  // Refs
  const messagesContainerRef = useRef();
  const scrollTimeoutRef = useRef(null);
  const sidebarRef = useRef(null);

  // Typewriter effect state
  const [typewriterConvId, setTypewriterConvId] = useState(null);
  const [typewriterTitle, setTypewriterTitle] = useState("");
  const [isTypewriting, setIsTypewriting] = useState(false);
  const sidebarTypewriterRefs = useRef({});

  // Message state
  const [isAddingNewMessage, setIsAddingNewMessage] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState(null);
  const [isSwitchingConversation, setIsSwitchingConversation] = useState(false);
  
  // Sidebar search state
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Add debounce state for conversation switching
  const [isSwitchingDebounced, setIsSwitchingDebounced] = useState(false);
  const switchTimeoutRef = useRef(null);

  // Add flag to track when we're creating a new chat
  const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);
  
  // User permissions state
  const [canChat, setCanChat] = useState(true);




  const { conversationId: urlConversationId } = useParams();
  const navigate = useNavigate();
  
  // Filter conversations based on search
  // Note: sidebarSearch and showSearch state are kept for potential future use

  // Load conversations on component mount
  useEffect(() => {
    loadConversations(true, 1, false);
  }, []);

  // Load user info on component mount
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const user = await getUserInfo();
        setCanChat(user.can_chat || false);
      } catch (error) {
        console.error('Error loading user info:', error);
        // Default to allowing chat if we can't get user info
        setCanChat(true);
      }
    };
    
    loadUserInfo();
  }, []);
  
  // Effect to handle URL-based conversation loading
  useEffect(() => {
    console.log('🔄 URL-based conversation loading effect triggered:', {
      urlConversationId,
      conversationsLength: conversations.length,
      currentConversationId: currentConversation?.id,
      isCreatingNewChat
    });
    
    // Skip URL-based loading if we're creating a new chat
    if (isCreatingNewChat) {
      console.log('⚠️ Skipping URL-based loading because creating new chat');
      return;
    }
    
    if (conversations.length === 0) return; // Wait for conversations to load
    
    if (urlConversationId) {
      const conversationId = parseInt(urlConversationId);
      if (isNaN(conversationId)) {
        console.log('❌ Invalid conversation ID in URL, redirecting to first conversation');
        if (conversations.length > 0) {
          navigate(`/${conversations[0].id}`);
        }
        return;
      }
      
      // First, try to find the conversation in the current conversations array
      let conversation = conversations.find(c => c.id === conversationId);
      
      console.log('🔍 Looking for conversation:', {
        conversationId,
        foundInArray: !!conversation,
        currentConversationId: currentConversation?.id,
        conversationsIds: conversations.map(c => c.id)
      });
      
      if (conversation && currentConversation?.id !== conversation.id) {
        console.log('🔄 URL conversation found in current array, selecting:', conversation.id);
        // Use the selectConversation function to ensure proper state management
        selectConversation(conversation);
      } else if (!conversation) {
        // Conversation not found in current array, try to load it directly
        console.log('🔄 URL conversation not in current array, loading directly:', conversationId);
        loadConversationDirectly(conversationId);
      }
    } else {
      // No URL conversation ID, redirect to first conversation
      console.log('🔄 No URL conversation ID, redirecting to first conversation');
      if (conversations.length > 0) {
        selectConversation(conversations[0]);
      }
    }
  }, [urlConversationId, conversations, currentConversation, navigate, isCreatingNewChat]);

  // SIMPLE: Load a conversation directly
  const loadConversationDirectly = async (conversationId) => {
    try {
      console.log('🔄 Loading conversation directly:', conversationId);
      const conversation = await getConversation(conversationId);
      
      if (conversation) {
        console.log('✅ Conversation loaded directly:', conversation);
        setCurrentConversation(conversation);

        // Check if conversation is on first page (first 10 conversations)
        const firstPageConversations = conversations.slice(0, conversationsPerPage);
        const isOnFirstPage = firstPageConversations.some(c => c.id === conversationId);

        if (!isOnFirstPage) {
          console.log('📝 Conversation NOT on first page, moving to top');
          
          // Update conversation's updated_at timestamp to move it to top
          await updateConversation(conversationId, { title: conversation.title });
          
          // Reload conversations to get the new order
          await loadConversations(false, 1, false);
        } else {
          console.log('📝 Conversation is on first page, keeping current position');
        }

        // Auto-scroll to the conversation in sidebar
        setTimeout(() => {
          const targetElement = document.querySelector(`[data-conversation-id="${conversationId}"]`);
          if (targetElement) {
            targetElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center',
              inline: 'nearest'
            });
          }
        }, 300);
        
      } else {
        console.log('❌ Conversation not found, redirecting to first conversation');
        if (conversations.length > 0) {
          navigate(`/${conversations[0].id}`);
        }
      }
    } catch (error) {
      console.error('Error loading conversation directly:', error);
      if (conversations.length > 0) {
        navigate(`/${conversations[0].id}`);
      }
    }
  };
  
  // Keyboard shortcuts for navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + N for new chat
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        createNewChat();
      }
      
      // Escape to close search (if implemented)
      if (e.key === 'Escape' && showSearch) {
        setShowSearch(false);
        setSidebarSearch('');
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSearch, sidebarSearch]);
  
  // Sidebar scroll handler - optimized for pagination
  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) {
      return;
    }
    
    let scrollTimeout;
    const handleScroll = () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      
      // Debounce sidebar scroll to prevent lag during streaming
      scrollTimeout = setTimeout(() => {
        const { scrollTop, scrollHeight, clientHeight } = sidebar;
        const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100; // 100px from bottom
        
        console.log('📊 Sidebar scroll check:', {
          scrollTop,
          scrollHeight,
          clientHeight,
          isNearBottom,
          hasMoreConversations,
          isLoadingMoreConversations,
          isStreaming
        });
        
        if (isNearBottom && hasMoreConversations && !isLoadingMoreConversations && !isStreaming) {
          console.log('🔄 Loading more conversations on scroll');
          setIsLoadingMoreConversations(true);
          loadConversations(false, conversationsPage + 1, true).finally(() => {
            setIsLoadingMoreConversations(false);
          });
        }
      }, isStreaming ? 300 : 150); // Longer debounce during streaming
    };
    
    sidebar.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      sidebar.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [hasMoreConversations, isLoadingMoreConversations, conversationsPage, conversationsPerPage, isStreaming]);
  
  // Scroll to top function - removed but kept for reference

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversation) {
      console.log('🔄 Conversation changed, loading messages for:', currentConversation.id);
      loadMessagesForConversation(currentConversation.id);
    }
  }, [currentConversation]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu && !event.target.closest('.menu-container') && !event.target.closest('.menu-button')) {
        setShowMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // Typewriter effect for sidebar conversation titles
  useEffect(() => {
    if (isTypewriting && typewriterConvId && typewriterTitle) {
      const ref = sidebarTypewriterRefs.current[typewriterConvId];
      if (!ref) return;
      
      console.log('DEBUG: Starting manual typewriter for title:', typewriterTitle);
      
      // Clear the element
      ref.innerHTML = '';
      
      let currentIndex = 0;
      const typeNextChar = () => {
        if (currentIndex < typewriterTitle.length) {
          ref.textContent = typewriterTitle.substring(0, currentIndex + 1) + '|';
          currentIndex++;
          setTimeout(typeNextChar, 50);
        } else {
          // Remove cursor when done
          ref.textContent = typewriterTitle;
          setTimeout(() => {
            setIsTypewriting(false);
            setTypewriterConvId(null);
          }, 500);
        }
      };
      
      // Start typing
      setTimeout(typeNextChar, 100);
      
      return () => {
        // Cleanup if component unmounts
        if (ref) {
          ref.textContent = typewriterTitle;
        }
      };
    }
  }, [isTypewriting, typewriterConvId, typewriterTitle]);

  // Effect to handle loading more messages when shouldLoadMore is true
  useEffect(() => {
    if (shouldLoadMore && !isLoadingMore && hasMoreMessages && currentConversation && currentPage > 1) {
      console.log('🔄 Triggering loadMoreMessages from shouldLoadMore effect');
      setShouldLoadMore(false); // Reset the flag
      setIsLoadingMore(true); // This will trigger the loadMoreMessages effect
    }
  }, [shouldLoadMore, isLoadingMore, hasMoreMessages, currentConversation, currentPage, messagesPerPage]);

  // Effect to handle the actual loading when isLoadingMore becomes true
  useEffect(() => {
    if (isLoadingMore && currentConversation && hasMoreMessages && currentPage > 1) {
      console.log('🔄 Starting to load more messages from effect');
      const loadMore = async () => {
        try {
          // Store current scroll position
          const container = messagesContainerRef.current;
          const oldScrollHeight = container ? container.scrollHeight : 0;
          const oldScrollTop = container ? container.scrollTop : 0;

          // Load previous page (older messages)
          const prevPage = Math.max(1, currentPage - 1);
          console.log('🟡 Requesting previous page:', prevPage);
          const data = await getMessages(currentConversation.id, prevPage, messagesPerPage);

          console.log('📄 Loaded page data:', {
            prevPage,
            messageCount: data.messages.length,
            total: data.total,
            totalPages: data.totalPages
          });

          // Combine with existing messages and sort, avoiding duplicates
          setMessages(prev => {
            const existingIds = new Set(prev.map(msg => msg.id));
            const newMessages = data.messages.filter(msg => !existingIds.has(msg.id));
            return sortMessagesByTimestamp([...newMessages, ...prev]);
          });
          setHasMoreMessages(prevPage > 1); // Has more if we can go to page 1
          setCurrentPage(prevPage);

          console.log('✅ Updated pagination state:', {
            newCurrentPage: prevPage,
            hasMore: prevPage > 1
          });

          // Restore scroll position
          if (container) {
            const newScrollHeight = container.scrollHeight;
            const scrollDifference = newScrollHeight - oldScrollHeight;
            const newScrollTop = oldScrollTop + scrollDifference;
            container.scrollTop = newScrollTop;
          }
        } catch (error) {
          console.error('Failed to load more messages:', error);
        } finally {
          setIsLoadingMore(false);
        }
      };
      
      loadMore();
    }
  }, [isLoadingMore, currentConversation, hasMoreMessages, currentPage, messagesPerPage]);

  // Optimized scroll handler to reduce lag during streaming
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      let scrollTimeout;
      const debouncedScrollHandler = () => {
        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(() => {
          const container = messagesContainerRef.current;
          if (!container) {
            return;
          }

          // Only check for loading more messages if not streaming to reduce lag
          if (!isStreaming && container.scrollTop <= 300 && !isLoadingMore && hasMoreMessages && currentPage > 1) {
            setShouldLoadMore(true);
          }
        }, isStreaming ? 200 : 100); // Longer debounce during streaming
      };

      container.addEventListener('scroll', debouncedScrollHandler, { passive: true });
      return () => {
        container.removeEventListener('scroll', debouncedScrollHandler);
        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
        }
      };
    }
  }, [hasMoreMessages, isLoadingMore, currentPage, messagesPerPage, isStreaming]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (switchTimeoutRef.current) {
        clearTimeout(switchTimeoutRef.current);
      }
    };
  }, []);

  // Ultra-smooth scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      // Use smooth scrolling for better UX
      container.scrollTo({
        top: container.scrollHeight,
        behavior: isStreaming ? 'smooth' : 'smooth' // Smooth scrolling for visible effect
      });
    }
  }, [isStreaming]);

  // Slower debounced scroll function for visible streaming
  const debouncedScrollToBottom = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(scrollToBottom, 50); // Slower scrolling for visible effect
  }, [scrollToBottom]);

  // Ultra-smooth auto-scroll effect for streaming
  useEffect(() => {
    if (messages.length > 0 && !isLoadingMore && isAddingNewMessage) {
      const container = messagesContainerRef.current;
      if (container) {
        if (isStreaming) {
          // Slower scroll for visible streaming effect
          debouncedScrollToBottom();
        } else {
          // For non-streaming messages, use immediate scroll
          scrollToBottom();
        }
      }
    }
  }, [messages.length, isLoadingMore, isAddingNewMessage, debouncedScrollToBottom, messagesPerPage, isStreaming]);

    // SIMPLE: Load conversations
  const loadConversations = async (showLoading = false, page = 1, append = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      
      console.log('🔄 Loading conversations:', { 
        page, 
        append, 
        conversationsPerPage,
        isLoadingMore: isLoadingMoreConversations
      });
      
      // Get ALL conversations from backend
      const data = await getConversations(page, conversationsPerPage, []);
      
      console.log('📄 Conversations data:', {
        conversationsCount: data.conversations.length,
        hasMore: data.hasMore,
        page: data.page,
        total: data.total,
        totalPages: data.totalPages
      });
      
      if (append) {
        // Append new conversations to existing ones
        setConversations(prev => {
          const existingIds = new Set(prev.map(c => c.id));
          const uniqueNewConversations = data.conversations.filter(c => 
            !existingIds.has(c.id)
          );
          
          return [...prev, ...uniqueNewConversations];
        });
      } else {
        // First load - just use the data from backend
        setConversations(data.conversations);
      }
      
      setHasMoreConversations(data.hasMore);
      setConversationsPage(data.page);
      
      // Update current conversation if it exists in the new data
      if (currentConversation) {
        const updatedConversation = data.conversations.find(c => c.id === currentConversation.id);
        if (updatedConversation) {
          setCurrentConversation(updatedConversation);
        }
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  // FIXED: Load messages for a conversation with proper pagination
  const loadMessagesForConversation = async (conversationId) => {
    try {
      console.log('🔄 Loading messages for conversation:', conversationId);
      
      // Only proceed if we're not currently streaming or creating a new chat
      if (isStreaming || isCreatingNewChat) {
        console.log('⚠️ Skipping message load during streaming or new chat creation');
        return;
      }
      
      // Get total count first
      const firstPage = await getMessages(conversationId, 1, messagesPerPage);
      const total = firstPage.total || firstPage.messages.length;
      const totalPages = Math.ceil(total / messagesPerPage);
      const lastPage = Math.max(1, totalPages);
      
      console.log('📊 Pagination info:', {
        total,
        totalPages,
        lastPage,
        messagesPerPage,
        conversationId
      });
      
      // FIXED: Load the last page (most recent messages) on refresh
      // But if the last page has fewer messages than expected, we need to load more pages
      let allRecentMessages = [];
      let currentPageToLoad = lastPage;
      let seenMessageIds = new Set(); // Track seen message IDs to avoid duplicates
      
      // Load pages from the end until we have enough recent messages or reach page 1
      while (currentPageToLoad >= 1 && allRecentMessages.length < messagesPerPage) {
        const data = await getMessages(conversationId, currentPageToLoad, messagesPerPage);
        console.log(`📄 Loaded page ${currentPageToLoad}: ${data.messages.length} messages`);
        
        // Add only unique messages from this page to our collection
        const uniqueMessages = data.messages.filter(msg => {
          if (seenMessageIds.has(msg.id)) {
            return false; // Skip duplicate
          }
          seenMessageIds.add(msg.id);
          return true;
        });
        
        allRecentMessages = [...uniqueMessages, ...allRecentMessages];
        currentPageToLoad--;
      }
      
      // Take only the most recent messages (up to messagesPerPage)
      const recentMessages = allRecentMessages.slice(-messagesPerPage);
      
      console.log('📊 Loaded recent messages:', {
        totalLoaded: allRecentMessages.length,
        recentMessagesCount: recentMessages.length,
        total,
        hasMore: lastPage > 1,
        messages: recentMessages.map(m => ({ id: m.id, content: m.content.substring(0, 20) + '...' }))
      });
      
      // Only update messages if we're not currently streaming or creating a new chat
      if (!isStreaming && !isCreatingNewChat) {
        setMessages(sortMessagesByTimestamp(recentMessages));
        setHasMoreMessages(lastPage > 1); // Has more if there are multiple pages
        setCurrentPage(lastPage);
        
        console.log('✅ Set pagination state:', {
          hasMoreMessages: lastPage > 1,
          currentPage: lastPage,
          messageCount: recentMessages.length
        });
        
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      } else {
        console.log('⚠️ Skipping message update during streaming or new chat creation');
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      if (!isStreaming && !isCreatingNewChat) {
        setMessages([]);
        setHasMoreMessages(false);
        setCurrentPage(1); // Reset pagination on error
      }
    }
  };

  // FIXED: Poll for title update
  const pollForTitleUpdate = async (conversationId, initialTitle = 'New Chat', maxAttempts = 10, interval = 1000) => {
    console.log('🔄 Starting title polling for conversation:', conversationId);
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        console.log(`🔄 Polling attempt ${attempt + 1}/${maxAttempts}`);
        const conv = await getConversation(conversationId);
        console.log('📄 Retrieved conversation:', { id: conv.id, title: conv.title, initialTitle });
        
        if (conv.title && conv.title !== initialTitle) {
          console.log('✅ Title updated:', conv.title);
          setTypewriterTitle(conv.title);
          setTypewriterConvId(conversationId);
          setIsTypewriting(true);
          
          // Update conversations list
          await loadConversations(false, 1, false);
          
          // Update current conversation if it's the same one
          if (currentConversation && currentConversation.id === conversationId) {
            const updatedConversations = await getConversations(1, conversationsPerPage);
            const updatedConversation = updatedConversations.conversations.find(c => c.id === conversationId);
            if (updatedConversation) {
              setCurrentConversation(updatedConversation);
            }
          }
          
          return;
        } else {
          console.log('⏳ Title not yet updated, waiting...');
        }
      } catch (error) {
        console.error('❌ Error during title polling:', error);
        // Continue polling despite errors
      }
      await new Promise(res => setTimeout(res, interval));
    }
    console.log('⏰ Title polling timed out after', maxAttempts, 'attempts');
  };

  // FIXED: Send message function - optimized for real-time markdown rendering
  const handleSend = async (text) => {
    if (!text.trim() || !currentConversation) return;
    setIsAddingNewMessage(true);
    setIsTyping(true);
    setIsStreaming(true);

    // Add user message immediately
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);

    // Add a placeholder for the assistant message
    const tempId = Date.now() + 1;
    setStreamingMessageId(tempId);
    const assistantMessage = {
      id: tempId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      const reader = await sendMessageStream(currentConversation.id, text);
      let assistantContent = '';
      let done = false;
      let buffer = '';
      let lastUpdateTime = 0;
      const updateThrottle = 100; // Update every 100ms for slower, visible streaming
      
      // Ultra-smooth update mechanism
      const updateMessage = (content) => {
        // Direct DOM manipulation for maximum performance
        setMessages(prev => {
          const newMessages = [...prev];
          const messageIndex = newMessages.findIndex(msg => msg.id === tempId);
          if (messageIndex !== -1) {
            newMessages[messageIndex] = { ...newMessages[messageIndex], content };
          }
          return newMessages;
        });
      };
       
      // Use a more aggressive streaming approach
      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        
        if (value) {
          buffer += new TextDecoder().decode(value);
          let lines = buffer.split('\n');
          buffer = lines.pop(); // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.startsWith('data:')) {
              const content = line.replace('data:', '');
              if (content === '[DONE]') {
                done = true;
                break;
              }
              
              if (content && content.trim() !== '[DONE]') {
                assistantContent += content;
                
                // Slower streaming with visible text appearance
                const now = Date.now();
                if (now - lastUpdateTime > updateThrottle) {
                  // Update with delay for visible streaming effect
                  updateMessage(assistantContent);
                  lastUpdateTime = now;
                  
                  // Add artificial delay for even slower streaming
                  await new Promise(resolve => setTimeout(resolve, 50)); // 50ms additional delay
                }
              }
            }
          }
        }
      }
      
      // Final update with complete content - optimized
      requestAnimationFrame(() => {
        updateMessage(assistantContent);
      });
      
      // After streaming completes, handle post-processing efficiently
      console.log('✅ Streaming completed, handling post-processing');
      
      // Remove the temporary message and add the final message with proper ID
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== tempId);
        return [...filtered, {
          id: Date.now() + 1000, // Use a proper ID for the final message
          role: 'assistant',
          content: assistantContent,
          timestamp: new Date().toISOString()
        }];
      });
      
      // Refresh conversations list in background (for title updates)
      loadConversations(false, 1, false).then(() => {
        // Check if we need to poll for title update
        if (currentConversation && (currentConversation.title === 'New Chat' || !currentConversation.title)) {
          console.log('🔄 Starting title polling after streaming');
          pollForTitleUpdate(currentConversation.id, 'New Chat');
        }
      }).catch(error => {
        console.error('Error refreshing conversations:', error);
      });
    } catch (error) {
      console.error('Streaming error:', error);
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 2,
          role: 'assistant',
          content: 'Sorry, there was an error processing your message. Please try again.',
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsTyping(false);
      setIsAddingNewMessage(false);
      setIsStreaming(false);
      setStreamingMessageId(null);
      setCurrentPage(1); // Reset pagination on error
    }
  };

  // FIXED: Create new chat function
  const createNewChat = async () => {
    // Prevent rapid clicking
    if (isSwitchingDebounced) {
      console.log('⚠️ Conversation switch already in progress, ignoring new chat click');
      return;
    }
    
    try {
      // Set flags to prevent interference
      setIsCreatingNewChat(true);
      setIsSwitchingDebounced(true);
      
      // Show loading state immediately
      setIsSwitchingConversation(true);
      
      // Clear messages immediately to prevent old messages from showing
      setMessages([]);
      setHasMoreMessages(false);
      setCurrentPage(1);
      
      const newConversation = await createConversation('New Chat');
      
      // Update conversations list
      const data = await getConversations(1, conversationsPerPage);
      setConversations(data.conversations);
      setHasMoreConversations(data.hasMore);
      setConversationsPage(data.page);
      
      // Set the new conversation as current
      const updatedConversation = data.conversations.find(c => c.id === newConversation.id);
      setCurrentConversation(updatedConversation || newConversation);
      
      setSidebarOpen(false);
      
      // Navigate to the new conversation URL
      navigate(`/${newConversation.id}`);
      
      // Hide loading after a short delay
      setTimeout(() => {
        setIsSwitchingConversation(false);
        // Reset flags after a delay
        switchTimeoutRef.current = setTimeout(() => {
          setIsSwitchingDebounced(false);
          setIsCreatingNewChat(false);
        }, 300);
      }, 100);
    } catch (error) {
      console.error('Failed to create conversation:', error);
      setIsSwitchingConversation(false);
      setIsSwitchingDebounced(false);
      setIsCreatingNewChat(false);
      // Show error message to user
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 3,
          role: 'assistant',
          content: 'Sorry, there was an error creating a new conversation. Please try again.',
          timestamp: new Date().toISOString()
        }
      ]);
    }
  };

  // FIXED: Select conversation function - optimized for instant response
  const selectConversation = async (conversation) => {
    // Prevent rapid clicking
    if (isSwitchingDebounced) {
      console.log('⚠️ Conversation switch already in progress, ignoring click');
      return;
    }
    
    if (currentConversation?.id !== conversation.id) {
      console.log('🔄 Selecting conversation:', conversation.id);
      
      // Set debounce flag to prevent rapid clicking
      setIsSwitchingDebounced(true);
      
      // Clear any existing timeout
      if (switchTimeoutRef.current) {
        clearTimeout(switchTimeoutRef.current);
      }
      
      // Show immediate feedback and prevent multiple clicks
      setIsSwitchingConversation(true);
      setSidebarOpen(false);
      setShowMenu(null);
      
      // Clear messages immediately for instant feedback
      setMessages([]);
      setHasMoreMessages(false);
      setCurrentPage(1);
      
      // REMOVED: clearPinnedConversations(); - Keep pinned conversations when switching
      
      // Update current conversation immediately
      setCurrentConversation(conversation);
      
      // Navigate to the selected conversation URL
      navigate(`/${conversation.id}`);
      
      // Load messages for the new conversation
      try {
        await loadMessagesForConversation(conversation.id);
      } catch (error) {
        console.error('Error loading messages for conversation:', error);
        // Show error message to user
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 4,
            role: 'assistant',
            content: 'Sorry, there was an error loading this conversation. Please try again.',
            timestamp: new Date().toISOString()
          }
        ]);
      } finally {
        // Hide loading after messages are loaded
        setTimeout(() => {
          setIsSwitchingConversation(false);
          // Reset debounce flag after a delay
          switchTimeoutRef.current = setTimeout(() => {
            setIsSwitchingDebounced(false);
          }, 300);
        }, 100);
      }
    } else {
      setSidebarOpen(false);
      setShowMenu(null);
    }
  };

  // FIXED: Menu click handler
  const handleMenuClick = (e, conversationId) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({ x: rect.right + 8, y: rect.top });
    setShowMenu(showMenu === conversationId ? null : conversationId);
  };

  // FIXED: Delete conversation function
  const handleDeleteConversation = async (conversationId) => {
    try {
      await deleteConversation(conversationId);
      
      const data = await getConversations(1, conversationsPerPage);
      setConversations(data.conversations);
      setHasMoreConversations(data.hasMore);
      setConversationsPage(data.page);
      
      if (currentConversation?.id === conversationId) {
        if (data.conversations.length > 0) {
          setCurrentConversation(data.conversations[0]);
          // Navigate to the first conversation after deletion
          navigate(`/${data.conversations[0].id}`);
        } else {
          setCurrentConversation(null);
          setMessages([]);
          // Navigate to root if no conversations left
          navigate('/');
        }
      }
      
      setShowMenu(null);
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      // Show error message to user
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 5,
          role: 'assistant',
          content: 'Sorry, there was an error deleting the conversation. Please try again.',
          timestamp: new Date().toISOString()
        }
      ]);
    }
  };

  // FIXED: Rename conversation function
  const handleRenameConversation = (conversation) => {
    console.log('DEBUG: handleRenameConversation called with:', conversation);
    setEditingTitle(conversation.id);
    setNewTitle(conversation.title || '');
    setShowMenu(null);
  };

  // FIXED: Save title function
  const handleSaveTitle = async (conversationId) => {
    try {
      console.log('DEBUG: Renaming conversation', conversationId, 'to:', newTitle);
      
      if (!newTitle.trim()) {
        console.log('DEBUG: Empty title, cancelling rename');
        handleCancelEdit();
        return;
      }
      
      await updateConversation(conversationId, { title: newTitle });
      
      // Update the conversation title locally without refreshing the entire list
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, title: newTitle }
            : conv
        )
      );
      
      // Update current conversation if it's the same one
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(prev => ({ ...prev, title: newTitle }));
      }
      
      setEditingTitle(null);
      setNewTitle('');
    } catch (error) {
      console.error('Failed to rename conversation:', error);
      // Show error message to user
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 6,
          role: 'assistant',
          content: 'Sorry, there was an error renaming the conversation. Please try again.',
          timestamp: new Date().toISOString()
        }
      ]);
    }
  };

  // FIXED: Cancel edit function
  const handleCancelEdit = () => {
    setEditingTitle(null);
    setNewTitle('');
  };

  // Logout handler function
  const handleLogout = () => {
    logout();
  };

  // Loading state
  if (loading || (conversations.length === 0 && !urlConversationId)) {
    return (
      <div className="flex h-screen bg-[#23242a] items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }



  return (
    <div className="flex h-screen bg-[#23242a]">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} md:flex md:flex-col md:h-full w-80 bg-[#1a1b1f] border-r border-gray-800 shadow-lg`}>
        <div className="p-4 border-b border-gray-800 bg-[#23242a]">
          <button
            onClick={createNewChat}
            disabled={isSwitchingDebounced}
            className={`new-chat-button flex items-center justify-center gap-2 w-full ${isSwitchingDebounced ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>
        </div>
        <div ref={sidebarRef} className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 sidebar-scrollbar">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              <p>No conversations yet</p>
              <p className="text-sm mt-1">Create a new chat to get started!</p>
            </div>
          ) : (
            <>
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  data-conversation-id={conversation.id} // Add this line
                  onClick={() => selectConversation(conversation)}
                  className={`sidebar-conversation ${currentConversation?.id === conversation.id ? 'active' : ''} ${isSwitchingDebounced ? 'opacity-50 pointer-events-none' : ''}`}
                  style={{ cursor: isSwitchingDebounced ? 'not-allowed' : 'pointer' }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      {editingTitle === conversation.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSaveTitle(conversation.id);
                              } else if (e.key === 'Escape') {
                                e.preventDefault();
                                handleCancelEdit();
                              }
                            }}
                            onBlur={(e) => {
                              const relatedTarget = e.relatedTarget;
                              if (!relatedTarget || !relatedTarget.closest('.edit-buttons')) {
                                handleCancelEdit();
                              }
                            }}
                            className="flex-1 bg-transparent text-gray-100 border border-gray-600 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                            autoFocus
                          />
                          <div className="edit-buttons flex gap-1">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleSaveTitle(conversation.id);
                              }}
                              className="text-green-400 hover:text-green-300 text-xs px-1 py-1 rounded hover:bg-gray-700"
                              type="button"
                            >
                              ✓
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleCancelEdit();
                              }}
                              className="text-red-400 hover:text-red-300 text-xs px-1 py-1 rounded hover:bg-gray-700"
                              type="button"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ) : (
                        <h3 className="font-medium text-gray-100 truncate text-sm">
                          {isTypewriting && typewriterConvId === conversation.id ? (
                            <span ref={el => sidebarTypewriterRefs.current[conversation.id] = el}></span>
                          ) : (
                            conversation.title || 'New Chat'
                          )}
                        </h3>
                      )}
                    </div>
                    {/* 3-dots menu */}
                    <div className="relative">
                      <button
                        onClick={(e) => handleMenuClick(e, conversation.id)}
                        className="menu-button p-1 rounded transition-colors bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent outline-none border-none shadow-none"
                        style={{ backgroundColor: 'transparent' }}
                      >
                        <svg className="w-4 h-4 text-gray-100" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                      </button>
                      {/* Dropdown menu rendered via portal */}
                      {showMenu === conversation.id && ReactDOM.createPortal(
                        <div
                          className="menu-container fixed w-32 border border-gray-800 rounded-md shadow-lg z-50"
                          style={{
                            left: `${menuPosition.x}px`,
                            top: `${menuPosition.y}px`,
                            backgroundColor: '#1a1b1f'
                          }}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              handleRenameConversation(conversation);
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-gray-100 hover:bg-[#23242a] focus:bg-[#23242a] active:bg-[#23242a] transition-colors outline-none"
                            style={{ backgroundColor: '#1a1b1f' }}
                          >
                            Rename
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              handleDeleteConversation(conversation.id);
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-gray-100 hover:bg-[#23242a] focus:bg-[#23242a] active:bg-[#23242a] rounded-b-md transition-colors outline-none"
                            style={{ backgroundColor: '#1a1b1f' }}
                          >
                            Delete
                          </button>
                        </div>,
                        document.body
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Loading indicator for more conversations */}
              {isLoadingMoreConversations && (
                <div className="flex justify-center py-4">
                  <div className="text-gray-400 text-sm flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                    Loading more conversations...
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="chat-header">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mobile-menu-button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-gray-100">
                {currentConversation?.title || 'New Chat'}
              </h1>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="logout-button bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl transition-all duration-200 font-medium flex items-center gap-2 border border-gray-700"
            title="Logout"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

        {/* Messages with pagination - optimized for smooth streaming */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#23242a]"
          style={{
            willChange: isStreaming ? 'scroll-position' : 'auto',
            transform: isStreaming ? 'translateZ(0)' : 'none' // Force hardware acceleration
          }}
        >
          {!Array.isArray(messages) || messages.length === 0 ? (
            <div className="empty-state">
              {isSwitchingConversation ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                  <p className="text-gray-400">Loading conversation...</p>
                </div>
              ) : (
                <>
                  <p className="text-lg font-medium text-gray-400">No messages yet</p>
                  <p className="text-sm text-gray-500 mt-2">Start a conversation to begin chatting!</p>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Loading indicator for older messages */}
              {isLoadingMore && (
                <div className="flex justify-center py-4">
                  <div className="text-gray-400 text-sm flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                    Loading older messages...
                  </div>
                </div>
              )}
              
              {/* Messages - ultra-smooth streaming */}
              {messages.map((msg) => (
                <Message
                  key={msg.id}
                  messageId={msg.id}
                  role={msg.role}
                  content={msg.content}
                  timestamp={msg.timestamp}
                  isStreaming={isStreaming && msg.role === 'assistant' && msg.id === streamingMessageId}
                />
              ))}
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="chat-message assistant">
                  <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Input */}
        <div className="p-4 bg-[#1a1b1f] border-t border-gray-800 shadow-lg">
          <ChatInput 
            onSend={handleSend} 
            disabled={!currentConversation || !canChat} 
            placeholder={!canChat ? "Chat access disabled. You can view messages but cannot send new ones." : "Message..."}
          />
        </div>
      </div>
    </div>
  );
};

// Helper function to sort messages by timestamp ascending and remove duplicates
const sortMessagesByTimestamp = (msgs) => {
  // Remove duplicates by ID
  const uniqueMessages = msgs.filter((msg, index, self) => 
    index === self.findIndex(m => m.id === msg.id)
  );
  
  // Sort by timestamp ascending
  return uniqueMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
};

export default ChatInterface;