import { Server } from 'socket.io';

// In-memory active presence map: workflowId -> Map<socketId, UserPresence>
const activeRooms = new Map();
// In-memory comments store: workflowId -> Array<Comment>
const workflowComments = new Map();

export const initSocketIO = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH']
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);
    let currentRoom = null;
    let currentUser = null;

    // 1. Join Workflow Collaboration Room
    socket.on('join_workflow', ({ workflowId, user }) => {
      currentRoom = `workflow:${workflowId}`;
      currentUser = user || {
        id: socket.id,
        name: `Architect-${socket.id.slice(0, 4)}`,
        avatar: '👨‍💻',
        color: '#00d4ff',
        role: 'Process Architect'
      };

      socket.join(currentRoom);

      if (!activeRooms.has(workflowId)) {
        activeRooms.set(workflowId, new Map());
      }
      activeRooms.get(workflowId).set(socket.id, currentUser);

      // Broadcast active room members to all in room
      const roomMembers = Array.from(activeRooms.get(workflowId).values());
      io.to(currentRoom).emit('room_users_update', {
        workflowId,
        users: roomMembers
      });

      // Send existing comments for this workflow
      const comments = workflowComments.get(workflowId) || [];
      socket.emit('comments_loaded', { workflowId, comments });

      console.log(`[Socket.io] User ${currentUser.name} joined ${currentRoom}. Total active: ${roomMembers.length}`);
    });

    // 2. Real-time Cursor Coordinates Sync
    socket.on('cursor_move', ({ workflowId, position }) => {
      if (!currentRoom) return;
      socket.to(currentRoom).emit('user_cursor_moved', {
        userId: currentUser?.id || socket.id,
        name: currentUser?.name || 'Peer',
        avatar: currentUser?.avatar || '👤',
        color: currentUser?.color || '#00d4ff',
        position // { x, y }
      });
    });

    // 3. Real-time Workflow DAG Sync (Nodes/Edges changed)
    socket.on('workflow_change', ({ workflowId, changes, workflow }) => {
      if (!currentRoom) return;
      socket.to(currentRoom).emit('workflow_updated', {
        workflowId,
        changes,
        workflow,
        author: currentUser?.name || 'Collaborator',
        timestamp: new Date().toISOString()
      });
    });

    // 4. Real-time Node Comment Added
    socket.on('add_node_comment', ({ workflowId, comment }) => {
      if (!workflowId || !comment) return;
      if (!workflowComments.has(workflowId)) {
        workflowComments.set(workflowId, []);
      }
      const newComment = {
        id: `cmt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        nodeId: comment.nodeId,
        author: currentUser?.name || comment.author || 'Reviewer',
        avatar: currentUser?.avatar || '🧑‍💼',
        role: currentUser?.role || 'Reviewer',
        text: comment.text,
        createdAt: new Date().toISOString(),
        status: comment.status || 'open'
      };

      workflowComments.get(workflowId).push(newComment);

      io.to(`workflow:${workflowId}`).emit('node_comment_added', {
        workflowId,
        comment: newComment
      });
    });

    // 5. Workflow Approval Status Sync ('draft' | 'ready_for_review' | 'in_review' | 'approved')
    socket.on('update_approval_status', ({ workflowId, status, note }) => {
      io.to(`workflow:${workflowId}`).emit('approval_status_updated', {
        workflowId,
        status,
        note,
        author: currentUser?.name || 'Reviewer',
        timestamp: new Date().toISOString()
      });
    });

    // Handle Disconnection
    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
      if (currentRoom) {
        const workflowId = currentRoom.replace('workflow:', '');
        if (activeRooms.has(workflowId)) {
          activeRooms.get(workflowId).delete(socket.id);
          const remainingUsers = Array.from(activeRooms.get(workflowId).values());
          io.to(currentRoom).emit('room_users_update', {
            workflowId,
            users: remainingUsers
          });
          io.to(currentRoom).emit('user_cursor_left', { userId: currentUser?.id || socket.id });
        }
      }
    });
  });

  return io;
};
