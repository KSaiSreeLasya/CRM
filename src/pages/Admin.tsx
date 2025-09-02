import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  CloseButton,
  FormControl,
  FormLabel,
  VStack,
  TableContainer,
  Select,
  Badge,
  useToast,
  HStack,
  Text,
  Flex,
  Heading,
  Card,
  CardBody,
  SimpleGrid,
  useColorModeValue,
  Divider,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Alert,
  AlertIcon,
  Checkbox,
  CheckboxGroup,
  Stack,
  Input,
} from '@chakra-ui/react';
import { supabase } from '../lib/supabase';
import { formatSupabaseError } from '../utils/error';
import { AddIcon, EditIcon, DeleteIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

interface ProjectAssignment {
  id: string;
  assignee_email: string;
  assignee_name: string;
  assigned_states: string[];
  project_count: number;
  created_at: string;
  updated_at: string;
}

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  helpText?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color, helpText }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const iconBg = useColorModeValue(`${color}.50`, `${color}.900`);
  
  return (
    <Card bg={cardBg} shadow="sm" border="1px solid" borderColor="gray.100">
      <CardBody>
        <Box display="flex" alignItems="center" gap={4}>
          <Box
            w="12"
            h="12"
            bg={iconBg}
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="xl"
            color={`${color}.600`}
          >
            {icon}
          </Box>
          <Box>
            <Text color="gray.600" fontSize="sm" fontWeight="medium">
              {title}
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color={`${color}.600`}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Text>
            {helpText && (
              <Text color="gray.500" fontSize="xs">
                {helpText}
              </Text>
            )}
          </Box>
        </Box>
      </CardBody>
    </Card>
  );
};

// Admin Dashboard Component (only renders when authorized)
const AdminDashboard = () => {
  const [assignments, setAssignments] = useState<ProjectAssignment[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isUserOpen, onOpen: onUserOpen, onClose: onUserClose } = useDisclosure();
  const [editingAssignment, setEditingAssignment] = useState<ProjectAssignment | null>(null);
  const [newAssignment, setNewAssignment] = useState({
    assignee_email: '',
    assignee_name: '',
    assigned_states: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '' });
  const [stats, setStats] = useState({
    totalAssignments: 0,
    activeAssignees: 0,
    statesManaged: 0,
    totalProjectsAssigned: 0,
  });
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const availableAssignees = [
    { email: 'yellesh@axisogreen.in', name: 'Yellesh' },
    { email: 'dhanush@axisogreen.in', name: 'Dhanush' },
    { email: 'TGoffice@axisogreen.in', name: 'TG Office' },
    { email: 'APoffice@axisogreen.in', name: 'AP Office' },
    { email: 'procurement@axisogreen.in', name: 'Procurement' },
    { email: 'services@axisogreen.in', name: 'Services' },
  ];

  const availableStates = ['Telangana', 'Andhra Pradesh', 'Chitoor'];

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('project_assignments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase error:', (error as any)?.message || error, error);
        toast({
          title: 'Error',
          description: `Failed to fetch assignments. ${formatSupabaseError(error)}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }
      
      if (data) {
        setAssignments(data);
        
        // Calculate stats
        const uniqueAssignees = new Set(data.map((a: any) => a.assignee_email)).size;
        const allStates = data.flatMap((a: any) => a.assigned_states);
        const uniqueStates = new Set(allStates).size;
        const totalProjects = data.reduce((sum: number, a: any) => sum + (a.project_count || 0), 0);

        setStats({
          totalAssignments: data.length,
          activeAssignees: uniqueAssignees,
          statesManaged: uniqueStates,
          totalProjectsAssigned: totalProjects,
        });
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleStatesChange = (states: string[]) => {
    setNewAssignment(prev => ({
      ...prev,
      assigned_states: states
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      if (!newAssignment.assignee_email || !newAssignment.assignee_name || newAssignment.assigned_states.length === 0) {
        toast({
          title: 'Validation Error',
          description: 'Please fill all required fields and select at least one state.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      const assignmentData = {
        assignee_email: newAssignment.assignee_email,
        assignee_name: newAssignment.assignee_name,
        assigned_states: newAssignment.assigned_states,
        project_count: 0, // Initial count
      };

      const { error } = await supabase
        .from('project_assignments')
        .insert([assignmentData]);

      if (error) {
        console.error('Supabase error:', (error as any)?.message || error, error);
        toast({
          title: 'Error',
          description: `Failed to create assignment. ${formatSupabaseError(error)}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Project assignment created successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onClose();
      setNewAssignment({
        assignee_email: '',
        assignee_name: '',
        assigned_states: [],
      });
      fetchAssignments();
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (assignment: ProjectAssignment) => {
    setEditingAssignment(assignment);
    setNewAssignment({
      assignee_email: assignment.assignee_email,
      assignee_name: assignment.assignee_name,
      assigned_states: assignment.assigned_states,
    });
    onEditOpen();
  };

  const handleUpdate = async () => {
    if (!editingAssignment) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('project_assignments')
        .update({
          assignee_email: newAssignment.assignee_email,
          assignee_name: newAssignment.assignee_name,
          assigned_states: newAssignment.assigned_states,
        })
        .eq('id', editingAssignment.id);

      if (error) {
        console.error('Supabase error:', (error as any)?.message || error, error);
        toast({
          title: 'Error',
          description: `Failed to update assignment. ${formatSupabaseError(error)}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Assignment updated successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onEditClose();
      setEditingAssignment(null);
      setNewAssignment({
        assignee_email: '',
        assignee_name: '',
        assigned_states: [],
      });
      fetchAssignments();
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('project_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) {
        console.error('Supabase error:', (error as any)?.message || error, error);
        toast({
          title: 'Error',
          description: `Failed to delete assignment. ${formatSupabaseError(error)}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Assignment deleted successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      fetchAssignments();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" color="gray.800" mb={2}>
            Admin Dashboard
          </Heading>
          <Text color="gray.600">
            Manage project assignments and team responsibilities
          </Text>
        </Box>

        {/* Alert */}
        <Alert status="info" borderRadius="lg">
          <AlertIcon />
          <Box>
            <Text fontSize="sm" fontWeight="medium">
              Administrator Access
            </Text>
            <Text fontSize="xs">
              You can assign projects to team members across different states (Telangana, AP, Chitoor)
            </Text>
          </Box>
        </Alert>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <StatsCard
            title="Total Assignments"
            value={stats.totalAssignments}
            icon="📋"
            color="blue"
            helpText="Active assignments"
          />
          <StatsCard
            title="Active Assignees"
            value={stats.activeAssignees}
            icon="👥"
            color="green"
            helpText="Team members"
          />
          <StatsCard
            title="States Managed"
            value={stats.statesManaged}
            icon="🏛️"
            color="purple"
            helpText="Geographic coverage"
          />
          <StatsCard
            title="Projects Assigned"
            value={stats.totalProjectsAssigned}
            icon="📊"
            color="orange"
            helpText="Total workload"
          />
        </SimpleGrid>

        {/* Header Actions */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <Box>
            <Heading size="md" color="gray.800" mb={2}>
              Project Assignments Management
            </Heading>
            <Text color="gray.600">
              {assignments.length} assignments configured
            </Text>
          </Box>
          <HStack>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="green"
              onClick={onOpen}
              size="lg"
              borderRadius="lg"
            >
              Create New Assignment
            </Button>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              variant="outline"
              onClick={onUserOpen}
              size="lg"
              borderRadius="lg"
            >
              Add New User
            </Button>
          </HStack>
        </Flex>

        {/* Assignments Table */}
        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody p={0}>
            {assignments.length > 0 ? (
              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th fontWeight="semibold" color="gray.700">Assignee</Th>
                      <Th fontWeight="semibold" color="gray.700">Email</Th>
                      <Th fontWeight="semibold" color="gray.700">Assigned States</Th>
                      <Th fontWeight="semibold" color="gray.700">Project Count</Th>
                      <Th fontWeight="semibold" color="gray.700">Created</Th>
                      <Th fontWeight="semibold" color="gray.700">Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {assignments.map(assignment => (
                      <Tr key={assignment.id} _hover={{ bg: 'gray.50' }} transition="all 0.2s">
                        <Td>
                          <Text fontWeight="medium" fontSize="sm">
                            {assignment.assignee_name}
                          </Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm" color="gray.600">
                            {assignment.assignee_email}
                          </Text>
                        </Td>
                        <Td>
                          <HStack spacing={1} wrap="wrap">
                            {assignment.assigned_states.map(state => (
                              <Badge key={state} colorScheme="blue" fontSize="xs" px={2} py={1} borderRadius="full">
                                {state}
                              </Badge>
                            ))}
                          </HStack>
                        </Td>
                        <Td>
                          <Text fontSize="sm" fontWeight="medium">
                            {assignment.project_count || 0}
                          </Text>
                        </Td>
                        <Td>
                          <Text fontSize="xs" color="gray.600">
                            {new Date(assignment.created_at).toLocaleDateString()}
                          </Text>
                        </Td>
                        <Td>
                          <Menu>
                            <MenuButton
                              as={IconButton}
                              icon={<ChevronDownIcon />}
                              variant="ghost"
                              size="sm"
                            />
                            <MenuList>
                              <MenuItem 
                                icon={<EditIcon />}
                                onClick={() => handleEdit(assignment)}
                              >
                                Edit Assignment
                              </MenuItem>
                              <MenuItem 
                                icon={<DeleteIcon />}
                                color="red.500"
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to delete this assignment?')) {
                                    handleDelete(assignment.id);
                                  }
                                }}
                              >
                                Delete Assignment
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            ) : (
              <Flex direction="column" align="center" py={16}>
                <Text fontSize="6xl" color="gray.300" mb={4}>⚙️</Text>
                <Text color="gray.500" fontSize="lg" fontWeight="medium" mb={2}>
                  No assignments found
                </Text>
                <Text color="gray.400" fontSize="sm" mb={6}>
                  Create your first project assignment to get started
                </Text>
                <Button
                  leftIcon={<AddIcon />}
                  colorScheme="green"
                  onClick={onOpen}
                >
                  Create New Assignment
                </Button>
              </Flex>
            )}
          </CardBody>
        </Card>
      </VStack>

      {/* Create Assignment Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Flex align="center" gap={2}>
              <AddIcon color="green.500" />
              Create New Assignment
            </Flex>
          </ModalHeader>
          <CloseButton position="absolute" right={2} top={2} onClick={onClose} />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="medium">Assignee</FormLabel>
                <Select
                  name="assignee_email"
                  value={newAssignment.assignee_email}
                  onChange={(e) => {
                    const selectedAssignee = availableAssignees.find(a => a.email === e.target.value);
                    setNewAssignment(prev => ({
                      ...prev,
                      assignee_email: e.target.value,
                      assignee_name: selectedAssignee?.name || ''
                    }));
                  }}
                  placeholder="Select assignee"
                >
                  {availableAssignees.map(assignee => (
                    <option key={assignee.email} value={assignee.email}>
                      {assignee.name} ({assignee.email})
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="medium">Assigned States</FormLabel>
                <CheckboxGroup 
                  value={newAssignment.assigned_states} 
                  onChange={handleStatesChange}
                >
                  <Stack spacing={2}>
                    {availableStates.map(state => (
                      <Checkbox key={state} value={state}>
                        {state}
                      </Checkbox>
                    ))}
                  </Stack>
                </CheckboxGroup>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Select one or more states to assign
                </Text>
              </FormControl>

              <Divider />

              <Button 
                colorScheme="green" 
                width="full" 
                onClick={handleSubmit}
                isLoading={loading}
                loadingText="Creating..."
                leftIcon={<AddIcon />}
                size="lg"
              >
                Create Assignment
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Add User Modal */}
      <Modal isOpen={isUserOpen} onClose={onUserClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Flex align="center" gap={2}>
              <AddIcon color="blue.500" />
              Add New User
            </Flex>
          </ModalHeader>
          <CloseButton position="absolute" right={2} top={2} onClick={onUserClose} />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="medium">Email</FormLabel>
                <Input type="email" value={newUser.email} onChange={(e)=>setNewUser({ ...newUser, email: e.target.value })} placeholder="user@example.com" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="medium">Password</FormLabel>
                <Input type="password" value={newUser.password} onChange={(e)=>setNewUser({ ...newUser, password: e.target.value })} placeholder="Min 6 characters" />
              </FormControl>
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                Creating users securely requires the Supabase Admin API (service role). Connect Supabase in MCP and provide a server-side endpoint to enable this.
              </Alert>
              <Button
                colorScheme="blue"
                onClick={() => {
                  toast({ title: 'Action required', description: 'Connect to Supabase via MCP and enable Admin API to create users from Admin.', status: 'info', duration: 6000, isClosable: true });
                }}
              >
                Enable User Creation
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Edit Assignment Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Flex align="center" gap={2}>
              <EditIcon color="blue.500" />
              Edit Assignment
            </Flex>
          </ModalHeader>
          <CloseButton position="absolute" right={2} top={2} onClick={onEditClose} />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="medium">Assignee</FormLabel>
                <Select
                  name="assignee_email"
                  value={newAssignment.assignee_email}
                  onChange={(e) => {
                    const selectedAssignee = availableAssignees.find(a => a.email === e.target.value);
                    setNewAssignment(prev => ({
                      ...prev,
                      assignee_email: e.target.value,
                      assignee_name: selectedAssignee?.name || ''
                    }));
                  }}
                  placeholder="Select assignee"
                >
                  {availableAssignees.map(assignee => (
                    <option key={assignee.email} value={assignee.email}>
                      {assignee.name} ({assignee.email})
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="medium">Assigned States</FormLabel>
                <CheckboxGroup 
                  value={newAssignment.assigned_states} 
                  onChange={handleStatesChange}
                >
                  <Stack spacing={2}>
                    {availableStates.map(state => (
                      <Checkbox key={state} value={state}>
                        {state}
                      </Checkbox>
                    ))}
                  </Stack>
                </CheckboxGroup>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Select one or more states to assign
                </Text>
              </FormControl>

              <Divider />

              <Button 
                colorScheme="blue" 
                width="full" 
                onClick={handleUpdate}
                isLoading={loading}
                loadingText="Updating..."
                leftIcon={<EditIcon />}
                size="lg"
              >
                Update Assignment
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

// Main Admin component with authorization check
const Admin = () => {
  const { user, isAdmin } = useAuth();

  // Check if user is admin
  if (!isAdmin || user?.email !== 'admin@axisogreen.in') {
    return <Navigate to="/dashboard" replace />;
  }

  return <AdminDashboard />;
};

export default Admin;
