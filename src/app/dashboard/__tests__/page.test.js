import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DashboardPage from '../page';
import { useAuth } from '@/contexts/AuthContext';
import taskService from '@/services/taskService';

// Mock the hooks and services
jest.mock('@/contexts/AuthContext');
jest.mock('@/services/taskService');

const mockUseAuth = useAuth;
const mockTaskService = taskService;

describe('DashboardPage', () => {
  const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
  const mockTasks = [
    {
      id: 1,
      title: 'Test Task 1',
      description: 'Test Description 1',
      status: 'pending',
      priority: 'high',
      due_date: '2024-01-15',
      user_id: 1,
      created_at: '2024-01-10T10:00:00Z',
      updated_at: '2024-01-10T10:00:00Z'
    },
    {
      id: 2,
      title: 'Test Task 2',
      description: 'Test Description 2',
      status: 'completed',
      priority: 'medium',
      due_date: '2024-01-12',
      user_id: 1,
      created_at: '2024-01-08T09:00:00Z',
      updated_at: '2024-01-12T15:00:00Z'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useAuth
    mockUseAuth.mockReturnValue({
      user: mockUser,
      logout: jest.fn()
    });

    // Mock taskService methods
    mockTaskService.getTasks.mockReturnValue(mockTasks);
    mockTaskService.createTask.mockResolvedValue({ id: 3, title: 'New Task' });
    mockTaskService.updateTask.mockResolvedValue({ id: 1, title: 'Updated Task' });
    mockTaskService.deleteTask.mockResolvedValue(true);
  });

  describe('Rendering', () => {
    it('renders dashboard with create task button', () => {
      render(<DashboardPage />);
      
      expect(screen.getByText('Task Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Welcome back, Test User!')).toBeInTheDocument();
      expect(screen.getByText('Add Task')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('shows create task form when create button is clicked', () => {
      render(<DashboardPage />);
      
      const addButton = screen.getByText('Add Task');
      fireEvent.click(addButton);
      
      expect(screen.getByText('Create New Task')).toBeInTheDocument();
      expect(screen.getByLabelText('Title *')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
      expect(screen.getByLabelText('Status')).toBeInTheDocument();
      expect(screen.getByLabelText('Priority')).toBeInTheDocument();
      expect(screen.getByLabelText('Due Date')).toBeInTheDocument();
    });

    it('displays tasks when fetched successfully', async () => {
      render(<DashboardPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Tasks (2)')).toBeInTheDocument();
        expect(screen.getByText('Test Task 1')).toBeInTheDocument();
        expect(screen.getByText('Test Task 2')).toBeInTheDocument();
      });
    });

    it('shows loading state initially', () => {
      mockTaskService.getTasks.mockReturnValue([]);
      render(<DashboardPage />);
      
      expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
    });

    it('shows empty state when no tasks exist', async () => {
      mockTaskService.getTasks.mockReturnValue([]);
      render(<DashboardPage />);
      
      await waitFor(() => {
        expect(screen.getByText('No tasks found. Create your first task!')).toBeInTheDocument();
      });
    });
  });

  describe('Task Management', () => {
    it('creates a new task successfully', async () => {
      render(<DashboardPage />);
      
      // Click add task button
      const addButton = screen.getByText('Add Task');
      fireEvent.click(addButton);
      
      // Fill form
      const titleInput = screen.getByLabelText('Title *');
      const descriptionInput = screen.getByLabelText('Description');
      const statusSelect = screen.getByLabelText('Status');
      const prioritySelect = screen.getByLabelText('Priority');
      
      fireEvent.change(titleInput, { target: { value: 'New Task' } });
      fireEvent.change(descriptionInput, { target: { value: 'New Description' } });
      fireEvent.change(statusSelect, { target: { value: 'pending' } });
      fireEvent.change(prioritySelect, { target: { value: 'high' } });
      
      // Submit form
      const submitButton = screen.getByText('Create Task');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockTaskService.createTask).toHaveBeenCalledWith({
          title: 'New Task',
          description: 'New Description',
          status: 'pending',
          priority: 'high',
          due_date: ''
        }, 1);
      });
    });

    it('edits an existing task successfully', async () => {
      render(<DashboardPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      });
      
      // Click edit button on first task
      const editButtons = screen.getAllByRole('button');
      const editButton = editButtons.find(button => 
        button.querySelector('svg') && button.getAttribute('aria-label') !== 'delete'
      );
      
      if (editButton) {
        fireEvent.click(editButton);
        
        await waitFor(() => {
          expect(screen.getByText('Edit Task')).toBeInTheDocument();
          expect(screen.getByDisplayValue('Test Task 1')).toBeInTheDocument();
        });
        
        // Update title
        const titleInput = screen.getByDisplayValue('Test Task 1');
        fireEvent.change(titleInput, { target: { value: 'Updated Task' } });
        
        // Submit form
        const updateButton = screen.getByText('Update Task');
        fireEvent.click(updateButton);
        
        await waitFor(() => {
          expect(mockTaskService.updateTask).toHaveBeenCalledWith(1, {
            title: 'Updated Task',
            description: 'Test Description 1',
            status: 'pending',
            priority: 'high',
            due_date: '2024-01-15'
          }, 1);
        });
      }
    });

    it('deletes a task successfully', async () => {
      render(<DashboardPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      });
      
      // Mock confirm to return true
      global.confirm = jest.fn(() => true);
      
      // Click delete button on first task
      const deleteButtons = screen.getAllByRole('button');
      const deleteButton = deleteButtons.find(button => 
        button.querySelector('svg') && button.getAttribute('aria-label') === 'delete'
      );
      
      if (deleteButton) {
        fireEvent.click(deleteButton);
        
        expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete this task?');
        expect(mockTaskService.deleteTask).toHaveBeenCalledWith(1, 1);
      }
    });
  });

  describe('Filtering', () => {
    it('filters tasks by status', async () => {
      render(<DashboardPage />);
      
      const statusFilter = screen.getByLabelText('Status');
      fireEvent.change(statusFilter, { target: { value: 'completed' } });
      
      await waitFor(() => {
        expect(mockTaskService.getTasks).toHaveBeenCalledWith(1, { status: 'completed', priority: 'all' });
      });
    });

    it('filters tasks by priority', async () => {
      render(<DashboardPage />);
      
      const priorityFilter = screen.getByLabelText('Priority');
      fireEvent.change(priorityFilter, { target: { value: 'high' } });
      
      await waitFor(() => {
        expect(mockTaskService.getTasks).toHaveBeenCalledWith(1, { status: 'all', priority: 'high' });
      });
    });
  });

  describe('User Actions', () => {
    it('handles logout correctly', () => {
      render(<DashboardPage />);
      
      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);
      
      expect(mockUseAuth().logout).toHaveBeenCalled();
    });

    it('cancels form when cancel button is clicked', () => {
      render(<DashboardPage />);
      
      // Open create form
      const addButton = screen.getByText('Add Task');
      fireEvent.click(addButton);
      
      // Click cancel
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      
      expect(screen.queryByText('Create New Task')).not.toBeInTheDocument();
    });
  });

  describe('Task Display', () => {
    it('displays task information correctly', async () => {
      render(<DashboardPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Task 1')).toBeInTheDocument();
        expect(screen.getByText('Test Description 1')).toBeInTheDocument();
        expect(screen.getByText('high')).toBeInTheDocument();
        expect(screen.getByText('pending')).toBeInTheDocument();
      });
    });

    it('shows priority and status badges with correct colors', async () => {
      render(<DashboardPage />);
      
      await waitFor(() => {
        const highPriorityBadge = screen.getByText('high');
        const pendingStatusBadge = screen.getByText('pending');
        
        expect(highPriorityBadge).toHaveClass('bg-red-100', 'text-red-800');
        expect(pendingStatusBadge).toHaveClass('bg-gray-100', 'text-gray-800');
      });
    });
  });
});
