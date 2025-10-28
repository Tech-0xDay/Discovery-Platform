/**
 * Real-Time Updates Hook - Socket.IO integration
 * Listens for WebSocket events and updates React Query cache automatically
 */
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

// Socket.IO instance (singleton)
let socket: Socket | null = null;

export function useRealTimeUpdates() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Get backend URL from environment or use default
    const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // Initialize Socket.IO connection (only once)
    if (!socket) {
      socket = io(BACKEND_URL, {
        transports: ['websocket', 'polling'], // Try WebSocket first, fallback to polling
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      console.log('[Socket.IO] Connecting to', BACKEND_URL);

      // Connection event handlers
      socket.on('connect', () => {
        console.log('[Socket.IO] Connected successfully');
      });

      socket.on('disconnect', (reason) => {
        console.log('[Socket.IO] Disconnected:', reason);
      });

      socket.on('connect_error', (error) => {
        console.error('[Socket.IO] Connection error:', error);
      });
    }

    // Project created event
    socket.on('project:created', (data) => {
      console.log('[Socket.IO] Project created:', data);

      // Show toast notification
      toast.success('New project published!', {
        description: data.message,
        duration: 5000,
      });

      // Invalidate and refetch feed queries
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    });

    // Project updated event
    socket.on('project:updated', (data) => {
      console.log('[Socket.IO] Project updated:', data);

      // Invalidate specific project and feed
      queryClient.invalidateQueries({ queryKey: ['project', data.project_id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    });

    // Project deleted event
    socket.on('project:deleted', (data) => {
      console.log('[Socket.IO] Project deleted:', data);

      // Remove from cache and refetch feeds
      queryClient.removeQueries({ queryKey: ['project', data.project_id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    });

    // Vote cast event
    socket.on('vote:cast', (data) => {
      console.log('[Socket.IO] Vote cast:', data);

      // Update specific project's vote count
      queryClient.invalidateQueries({ queryKey: ['project', data.project_id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    });

    // Comment added event
    socket.on('comment:added', (data) => {
      console.log('[Socket.IO] Comment added:', data);

      // Invalidate project to fetch new comments
      queryClient.invalidateQueries({ queryKey: ['project', data.project_id] });
      queryClient.invalidateQueries({ queryKey: ['comments', data.project_id] });
    });

    // Leaderboard updated event
    socket.on('leaderboard:updated', (data) => {
      console.log('[Socket.IO] Leaderboard updated:', data);

      // Refetch leaderboard
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    });

    // User profile updated event
    socket.on('user:updated', (data) => {
      console.log('[Socket.IO] User updated:', data);

      // Invalidate user profile
      queryClient.invalidateQueries({ queryKey: ['user', data.user_id] });
    });

    // Comment updated event
    socket.on('comment:updated', (data) => {
      console.log('[Socket.IO] Comment updated:', data);

      queryClient.invalidateQueries({ queryKey: ['project', data.project_id] });
      queryClient.invalidateQueries({ queryKey: ['comments', data.project_id] });
    });

    // Comment deleted event
    socket.on('comment:deleted', (data) => {
      console.log('[Socket.IO] Comment deleted:', data);

      queryClient.invalidateQueries({ queryKey: ['project', data.project_id] });
      queryClient.invalidateQueries({ queryKey: ['comments', data.project_id] });
    });

    // Comment voted event
    socket.on('comment:voted', (data) => {
      console.log('[Socket.IO] Comment voted:', data);

      queryClient.invalidateQueries({ queryKey: ['comments', data.project_id] });
    });

    // Vote removed event
    socket.on('vote:removed', (data) => {
      console.log('[Socket.IO] Vote removed:', data);

      queryClient.invalidateQueries({ queryKey: ['project', data.project_id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    });

    // Project featured event
    socket.on('project:featured', (data) => {
      console.log('[Socket.IO] Project featured:', data);

      toast.success('Project featured!');
      queryClient.invalidateQueries({ queryKey: ['project', data.project_id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    });

    // Badge awarded event
    socket.on('badge:awarded', (data) => {
      console.log('[Socket.IO] Badge awarded:', data);

      toast.success('New badge awarded!');
      queryClient.invalidateQueries({ queryKey: ['project', data.project_id] });
      queryClient.invalidateQueries({ queryKey: ['badges', data.project_id] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    });

    // Intro received event
    socket.on('intro:received', (data) => {
      console.log('[Socket.IO] Intro received:', data);

      toast('New intro request received!');
      queryClient.invalidateQueries({ queryKey: ['intros', 'received'] });
    });

    // Intro accepted event
    socket.on('intro:accepted', (data) => {
      console.log('[Socket.IO] Intro accepted:', data);

      toast.success('Your intro request was accepted!');
      queryClient.invalidateQueries({ queryKey: ['intros', 'sent'] });
    });

    // Intro declined event
    socket.on('intro:declined', (data) => {
      console.log('[Socket.IO] Intro declined:', data);

      toast('Your intro request was declined');
      queryClient.invalidateQueries({ queryKey: ['intros', 'sent'] });
    });

    // Message received event - Enhanced for instant delivery
    socket.on('message:received', (data) => {
      console.log('[Socket.IO] Message received:', data);

      // Extract message data
      const message = data.data;
      const senderId = message?.sender_id || data.sender_id;
      const senderName = message?.sender?.username || data.sender_name || 'Someone';

      // Show toast notification with sender name
      toast(`New message from ${senderName}`, {
        description: message?.message?.substring(0, 50) || 'View message',
        duration: 4000,
      });

      // Invalidate specific conversation for instant update
      if (senderId) {
        queryClient.invalidateQueries({
          queryKey: ['messages', 'conversation', senderId]
        });
      }

      // Invalidate conversations list to update last message and unread count
      queryClient.invalidateQueries({
        queryKey: ['messages', 'conversations']
      });
    });

    // Message read event - Update message status to read
    socket.on('message:read', (data) => {
      console.log('[Socket.IO] Message read:', data);

      // Invalidate all message queries to update read status
      // (Backend sends sender_id which is the person who was notified)
      queryClient.invalidateQueries({
        queryKey: ['messages']
      });
    });

    // Messages read event (multiple messages) - Batch update
    socket.on('messages:read', (data) => {
      console.log('[Socket.IO] Messages read:', data);

      // Invalidate specific conversation
      if (data.sender_id) {
        queryClient.invalidateQueries({
          queryKey: ['messages', 'conversation', data.sender_id]
        });
      }

      // Update conversations list
      queryClient.invalidateQueries({
        queryKey: ['messages', 'conversations']
      });
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        console.log('[Socket.IO] Cleaning up event listeners');

        // Remove all listeners
        socket.off('project:created');
        socket.off('project:updated');
        socket.off('project:deleted');
        socket.off('vote:cast');
        socket.off('vote:removed');
        socket.off('comment:added');
        socket.off('comment:updated');
        socket.off('comment:deleted');
        socket.off('comment:voted');
        socket.off('project:featured');
        socket.off('badge:awarded');
        socket.off('leaderboard:updated');
        socket.off('user:updated');
        socket.off('intro:received');
        socket.off('intro:accepted');
        socket.off('intro:declined');
        socket.off('message:received');
        socket.off('message:read');
        socket.off('messages:read');

        // Note: We DON'T disconnect the socket here
        // because we want to maintain the connection across the app
        // Only disconnect when the entire app unmounts
      }
    };
  }, [queryClient]);

  // Return socket instance for manual operations if needed
  return socket;
}

// Export function to disconnect socket (call this on app unmount)
export function disconnectSocket() {
  if (socket) {
    console.log('[Socket.IO] Disconnecting...');
    socket.disconnect();
    socket = null;
  }
}
