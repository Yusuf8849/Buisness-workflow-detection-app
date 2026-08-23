import { io, Socket } from 'socket.io-client';

export interface CollaboratorUser {
  id: string;
  name: string;
  avatar: string;
  color: string;
  role: string;
}

export interface RemoteCursor {
  userId: string;
  name: string;
  avatar: string;
  color: string;
  position: { x: number; y: number };
}

export interface NodeComment {
  id: string;
  nodeId: string;
  author: string;
  avatar: string;
  role: string;
  text: string;
  createdAt: string;
  status: 'open' | 'resolved';
}

export type ApprovalStatus = 'draft' | 'ready_for_review' | 'in_review' | 'approved';

const SOCKET_URL = typeof window !== 'undefined' ? (window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin) : 'http://localhost:5000';

class CollaborationSocketService {
  private socket: Socket | null = null;
  private currentUser: CollaboratorUser = {
    id: `usr_${Math.random().toString(36).substr(2, 6)}`,
    name: 'You (Lead Architect)',
    avatar: '👨‍💻',
    color: '#00d4ff',
    role: 'Process Architect'
  };

  init(): Socket {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000
      });

      this.socket.on('connect', () => {
        console.log('[Collaboration] Connected to real-time sync server:', this.socket?.id);
      });
    }
    return this.socket;
  }

  getCurrentUser(): CollaboratorUser {
    return this.currentUser;
  }

  setCurrentUser(user: Partial<CollaboratorUser>) {
    this.currentUser = { ...this.currentUser, ...user };
  }

  joinWorkflow(workflowId: string) {
    const s = this.init();
    s.emit('join_workflow', {
      workflowId,
      user: this.currentUser
    });
  }

  sendCursorMove(workflowId: string, position: { x: number; y: number }) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('cursor_move', { workflowId, position });
    }
  }

  sendWorkflowChange(workflowId: string, changes: any, workflow: any) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('workflow_change', { workflowId, changes, workflow });
    }
  }

  addNodeComment(workflowId: string, nodeId: string, text: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('add_node_comment', {
        workflowId,
        comment: {
          nodeId,
          text,
          author: this.currentUser.name,
          avatar: this.currentUser.avatar,
          role: this.currentUser.role
        }
      });
    }
  }

  updateApprovalStatus(workflowId: string, status: ApprovalStatus, note?: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('update_approval_status', {
        workflowId,
        status,
        note
      });
    }
  }

  onUsersUpdate(callback: (data: { workflowId: string; users: CollaboratorUser[] }) => void) {
    const s = this.init();
    s.on('room_users_update', callback);
    return () => { s.off('room_users_update', callback); };
  }

  onCursorMoved(callback: (cursor: RemoteCursor) => void) {
    const s = this.init();
    s.on('user_cursor_moved', callback);
    return () => { s.off('user_cursor_moved', callback); };
  }

  onCursorLeft(callback: (data: { userId: string }) => void) {
    const s = this.init();
    s.on('user_cursor_left', callback);
    return () => { s.off('user_cursor_left', callback); };
  }

  onWorkflowUpdated(callback: (data: any) => void) {
    const s = this.init();
    s.on('workflow_updated', callback);
    return () => { s.off('workflow_updated', callback); };
  }

  onCommentAdded(callback: (data: { workflowId: string; comment: NodeComment }) => void) {
    const s = this.init();
    s.on('node_comment_added', callback);
    return () => { s.off('node_comment_added', callback); };
  }

  onCommentsLoaded(callback: (data: { workflowId: string; comments: NodeComment[] }) => void) {
    const s = this.init();
    s.on('comments_loaded', callback);
    return () => { s.off('comments_loaded', callback); };
  }

  onApprovalStatusUpdated(callback: (data: { workflowId: string; status: ApprovalStatus; author: string; note?: string }) => void) {
    const s = this.init();
    s.on('approval_status_updated', callback);
    return () => { s.off('approval_status_updated', callback); };
  }
}

export const collaborationSocket = new CollaborationSocketService();
