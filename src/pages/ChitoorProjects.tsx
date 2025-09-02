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
  Input,
  VStack,
  HStack,
  TableContainer,
  Select,
  Badge,
  useToast,
  Text,
  Flex,
  Heading,
  Card,
  CardBody,
  SimpleGrid,
  useColorModeValue,
  Divider,
} from '@chakra-ui/react';
import { supabase } from '../lib/supabase';
import { formatSupabaseError } from '../utils/error';
import { AddIcon } from '@chakra-ui/icons';

interface ChitoorProject {
  id: string;
  customer_name: string;
  mobile_number: string;
  date_of_order: string;
  service_number?: string;
  address_mandal_village: string;
  capacity: number;
  project_cost: number;
  amount_received?: number;
  subsidy_scope?: string;
  velugu_officer_payments?: number;
  project_status?: string;
  material_sent_date?: string;
  balamuragan_payment?: number;
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

const ChitoorProjects = () => {
  const [projects, setProjects] = useState<ChitoorProject[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newProject, setNewProject] = useState({
    customer_name: '',
    mobile_number: '',
    date_of_order: '',
    service_number: '',
    address_mandal_village: '',
    capacity: '',
    project_cost: '',
    amount_received: '',
    subsidy_scope: '',
    velugu_officer_payments: '',
    project_status: 'Pending',
    material_sent_date: '',
    balamuragan_payment: '',
  });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalProjects: 0,
    pendingProjects: 0,
    completedProjects: 0,
    totalRevenue: 0,
    totalCapacity: 0,
  });
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const fetchChitoorProjects = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chitoor_projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase error:', (error as any)?.message || error, error);
        toast({
          title: 'Error',
          description: `Failed to fetch Chitoor projects. ${formatSupabaseError(error)}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }
      
      if (data) {
        setProjects(data);
        
        // Calculate stats
        const pendingProjects = data.filter(p => p.project_status?.toLowerCase() === 'pending');
        const completedProjects = data.filter(p => p.project_status?.toLowerCase() === 'completed');
        const totalRevenue = data.reduce((sum, p) => sum + (p.project_cost || 0), 0);
        const totalCapacity = data.reduce((sum, p) => sum + (p.capacity || 0), 0);

        setStats({
          totalProjects: data.length,
          pendingProjects: pendingProjects.length,
          completedProjects: completedProjects.length,
          totalRevenue,
          totalCapacity,
        });
      }
    } catch (error) {
      console.error('Error fetching Chitoor projects:', error);
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
    fetchChitoorProjects();
  }, [fetchChitoorProjects]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewProject(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const projectData = {
        customer_name: newProject.customer_name,
        mobile_number: newProject.mobile_number,
        date_of_order: newProject.date_of_order,
        service_number: newProject.service_number || null,
        address_mandal_village: newProject.address_mandal_village,
        capacity: parseFloat(newProject.capacity),
        project_cost: parseFloat(newProject.project_cost),
        amount_received: newProject.amount_received ? parseFloat(newProject.amount_received) : null,
        subsidy_scope: newProject.subsidy_scope || null,
        velugu_officer_payments: newProject.velugu_officer_payments ? parseFloat(newProject.velugu_officer_payments) : null,
        project_status: newProject.project_status || 'Pending',
        material_sent_date: newProject.material_sent_date || null,
        balamuragan_payment: newProject.balamuragan_payment ? parseFloat(newProject.balamuragan_payment) : null,
      };

      const { error } = await supabase
        .from('chitoor_projects')
        .insert([projectData]);

      if (error) {
        console.error('Supabase error:', (error as any)?.message || error, error);
        toast({
          title: 'Error',
          description: `Failed to create project. ${formatSupabaseError(error)}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Chitoor project created successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onClose();
      setNewProject({
        customer_name: '',
        mobile_number: '',
        date_of_order: '',
        service_number: '',
        address_mandal_village: '',
        capacity: '',
        project_cost: '',
        amount_received: '',
        subsidy_scope: '',
        velugu_officer_payments: '',
        project_status: 'Pending',
        material_sent_date: '',
        balamuragan_payment: '',
      });
      fetchChitoorProjects();
    } catch (error) {
      console.error('Error creating Chitoor project:', error);
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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'green';
      case 'installation completed': return 'green';
      case 'pending': return 'yellow';
      case 'material pending': return 'yellow';
      case 'in progress': return 'blue';
      case 'material sent': return 'purple';
      case 'on hold': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Box>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" color="gray.800" mb={2}>
            Chitoor Projects Dashboard
          </Heading>
          <Text color="gray.600">
            Overview and management of Chitoor district projects (AP region with dedicated tracking)
          </Text>
        </Box>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={6}>
          <StatsCard
            title="Total Projects"
            value={stats.totalProjects}
            icon="📋"
            color="blue"
            helpText="All Chitoor projects"
          />
          <StatsCard
            title="Pending Projects"
            value={stats.pendingProjects}
            icon="⏳"
            color="yellow"
            helpText="Awaiting action"
          />
          <StatsCard
            title="Completed Projects"
            value={stats.completedProjects}
            icon="✅"
            color="green"
            helpText="Successfully delivered"
          />
          <StatsCard
            title="Total Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            icon="💰"
            color="orange"
            helpText="Project value"
          />
          <StatsCard
            title="Total Capacity"
            value={`${stats.totalCapacity.toLocaleString()} kW`}
            icon="⚡"
            color="purple"
            helpText="Energy capacity"
          />
        </SimpleGrid>

        {/* Header Actions */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <Box>
            <Heading size="md" color="gray.800" mb={2}>
              Chitoor Projects Management
            </Heading>
            <Text color="gray.600">
              {projects.length} projects total
            </Text>
          </Box>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="green"
            onClick={onOpen}
            size="lg"
            borderRadius="lg"
            _hover={{ transform: 'translateY(-1px)', boxShadow: 'lg' }}
            transition="all 0.2s"
          >
            Create New Chitoor Project
          </Button>
        </Flex>

        {/* Projects Cards/Table */}
        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody p={0}>
            {projects.length > 0 ? (
              <Box>
                {/* Mobile/Tablet: Card Layout */}
                <Box display={{ base: 'block', xl: 'none' }} p={4}>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    {projects.map(project => (
                      <Card key={project.id} bg="white" border="1px solid" borderColor="gray.200" _hover={{ shadow: 'md' }}>
                        <CardBody p={4}>
                          <VStack spacing={3} align="stretch">
                            <Flex justify="space-between" align="center">
                              <Text fontWeight="bold" fontSize="lg" color="blue.600">
                                {project.customer_name}
                              </Text>
                              <Badge
                                colorScheme={getStatusColor(project.project_status || 'pending')}
                                px={2}
                                py={1}
                                borderRadius="full"
                                fontSize="xs"
                              >
                                {project.project_status || 'Pending'}
                              </Badge>
                            </Flex>

                            <SimpleGrid columns={2} spacing={2} fontSize="sm">
                              <Box>
                                <Text color="gray.500" fontSize="xs">Mobile</Text>
                                <Text fontWeight="medium">{project.mobile_number}</Text>
                              </Box>
                              <Box>
                                <Text color="gray.500" fontSize="xs">Capacity</Text>
                                <Text fontWeight="medium">{project.capacity} kW</Text>
                              </Box>
                              <Box>
                                <Text color="gray.500" fontSize="xs">Project Cost</Text>
                                <Text fontWeight="medium" color="green.600">₹{project.project_cost.toLocaleString()}</Text>
                              </Box>
                              <Box>
                                <Text color="gray.500" fontSize="xs">Amount Received</Text>
                                <Text fontWeight="medium" color="blue.600">
                                  {project.amount_received ? `₹${project.amount_received.toLocaleString()}` : 'N/A'}
                                </Text>
                              </Box>
                            </SimpleGrid>

                            <Box>
                              <Text color="gray.500" fontSize="xs">Address</Text>
                              <Text fontSize="sm">{project.address_mandal_village}</Text>
                            </Box>

                            <SimpleGrid columns={2} spacing={2} fontSize="xs" color="gray.600">
                              <Box>
                                <Text>Order Date: {project.date_of_order ? new Date(project.date_of_order).toLocaleDateString() : 'N/A'}</Text>
                              </Box>
                              <Box>
                                <Text>Material Date: {project.material_sent_date ? new Date(project.material_sent_date).toLocaleDateString() : 'N/A'}</Text>
                              </Box>
                            </SimpleGrid>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                </Box>

                {/* Desktop: Responsive Table */}
                <Box display={{ base: 'none', xl: 'block' }}>
                  <TableContainer>
                    <Table variant="simple" size="sm">
                      <Thead bg="gray.50">
                        <Tr>
                          <Th fontWeight="semibold" color="gray.700" minW="150px">Customer Details</Th>
                          <Th fontWeight="semibold" color="gray.700" minW="120px">Project Info</Th>
                          <Th fontWeight="semibold" color="gray.700" minW="140px">Financial</Th>
                          <Th fontWeight="semibold" color="gray.700" minW="120px">Status & Dates</Th>
                          <Th fontWeight="semibold" color="gray.700" minW="100px">Payments</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {projects.map(project => (
                          <Tr key={project.id} _hover={{ bg: 'gray.50' }} transition="all 0.2s">
                            <Td>
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="bold" fontSize="sm" color="blue.600">
                                  {project.customer_name}
                                </Text>
                                <Text fontSize="xs" color="gray.600">{project.mobile_number}</Text>
                                <Text fontSize="xs" color="gray.500">{project.address_mandal_village}</Text>
                                {project.service_number && (
                                  <Text fontSize="xs" color="gray.500">Service: {project.service_number}</Text>
                                )}
                              </VStack>
                            </Td>
                            <Td>
                              <VStack align="start" spacing={1}>
                                <Text fontSize="sm" fontWeight="medium">{project.capacity} kW</Text>
                                <Text fontSize="xs" color="gray.600">
                                  Order: {project.date_of_order ? new Date(project.date_of_order).toLocaleDateString() : 'N/A'}
                                </Text>
                                {project.subsidy_scope && (
                                  <Badge size="sm" colorScheme="blue">{project.subsidy_scope}</Badge>
                                )}
                              </VStack>
                            </Td>
                            <Td>
                              <VStack align="start" spacing={1}>
                                <Text fontSize="sm" fontWeight="bold" color="green.600">
                                  ₹{project.project_cost.toLocaleString()}
                                </Text>
                                <Text fontSize="xs" color="blue.600">
                                  Received: {project.amount_received ? `₹${project.amount_received.toLocaleString()}` : 'N/A'}
                                </Text>
                              </VStack>
                            </Td>
                            <Td>
                              <VStack align="start" spacing={1}>
                                <Badge
                                  colorScheme={getStatusColor(project.project_status || 'pending')}
                                  px={2}
                                  py={1}
                                  borderRadius="full"
                                  fontSize="xs"
                                >
                                  {project.project_status || 'Pending'}
                                </Badge>
                                <Text fontSize="xs" color="gray.600">
                                  Material: {project.material_sent_date ? new Date(project.material_sent_date).toLocaleDateString() : 'N/A'}
                                </Text>
                              </VStack>
                            </Td>
                            <Td>
                              <VStack align="start" spacing={1}>
                                {project.velugu_officer_payments && (
                                  <Text fontSize="xs" color="purple.600">
                                    Velugu: ₹{project.velugu_officer_payments.toLocaleString()}
                                  </Text>
                                )}
                                {project.balamuragan_payment && (
                                  <Text fontSize="xs" color="orange.600">
                                    Balamuragan: ₹{project.balamuragan_payment.toLocaleString()}
                                  </Text>
                                )}
                                {!project.velugu_officer_payments && !project.balamuragan_payment && (
                                  <Text fontSize="xs" color="gray.400">No payments</Text>
                                )}
                              </VStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Box>
              </Box>
            ) : (
              <Flex direction="column" align="center" py={16}>
                <Text fontSize="6xl" color="gray.300" mb={4}>📊</Text>
                <Text color="gray.500" fontSize="lg" fontWeight="medium" mb={2}>
                  No Chitoor projects found
                </Text>
                <Text color="gray.400" fontSize="sm" mb={6}>
                  Create your first Chitoor project to get started
                </Text>
                <Button
                  leftIcon={<AddIcon />}
                  colorScheme="green"
                  onClick={onOpen}
                >
                  Create New Chitoor Project
                </Button>
              </Flex>
            )}
          </CardBody>
        </Card>
      </VStack>

      {/* Create Chitoor Project Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Flex align="center" gap={2}>
              <AddIcon color="green.500" />
              Create New Chitoor Project
            </Flex>
          </ModalHeader>
          <CloseButton position="absolute" right={2} top={2} onClick={onClose} />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} w="full">
                

                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="medium">Customer Name <Text as="span" color="red.500">*</Text></FormLabel>
                  <Input
                    name="customer_name"
                    value={newProject.customer_name}
                    onChange={handleInputChange}
                    placeholder="Enter customer name"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="medium">Mobile Number <Text as="span" color="red.500">*</Text></FormLabel>
                  <Input
                    name="mobile_number"
                    value={newProject.mobile_number}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="medium">Date of Order <Text as="span" color="red.500">*</Text></FormLabel>
                  <Input
                    name="date_of_order"
                    type="date"
                    value={newProject.date_of_order}
                    onChange={handleInputChange}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">Service Number</FormLabel>
                  <Input
                    name="service_number"
                    value={newProject.service_number}
                    onChange={handleInputChange}
                    placeholder="Service number"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="medium">Address (Mandal, Village) <Text as="span" color="red.500">*</Text></FormLabel>
                  <Input
                    name="address_mandal_village"
                    value={newProject.address_mandal_village}
                    onChange={handleInputChange}
                    placeholder="Mandal, Village"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="medium">Capacity (kW) <Text as="span" color="red.500">*</Text></FormLabel>
                  <Select
                    name="capacity"
                    value={newProject.capacity}
                    onChange={handleInputChange}
                    placeholder="Select capacity"
                  >
                    <option value="2">2 kW</option>
                    <option value="3">3 kW</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="medium">Project Cost (₹) <Text as="span" color="red.500">*</Text></FormLabel>
                  <Select
                    name="project_cost"
                    value={newProject.project_cost}
                    onChange={handleInputChange}
                    placeholder="Select total amount"
                  >
                    <option value="205000">₹2,05,000</option>
                    <option value="140000">���1,40,000</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">Amount Received (₹)</FormLabel>
                  <Input
                    name="amount_received"
                    type="number"
                    value={newProject.amount_received}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">Subsidy Scope</FormLabel>
                  <Select
                    name="subsidy_scope"
                    value={newProject.subsidy_scope}
                    onChange={handleInputChange}
                    placeholder="Select subsidy scope"
                  >
                    <option value="Axiso">Axiso</option>
                    <option value="Customer (in Chitoor)">Customer (in Chitoor)</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">Velugu Officer Payments (₹)</FormLabel>
                  <Input
                    name="velugu_officer_payments"
                    type="number"
                    value={newProject.velugu_officer_payments}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">Project Status</FormLabel>
                  <Select
                    name="project_status"
                    value={newProject.project_status}
                    onChange={handleInputChange}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Installation Completed">Installation Completed</option>
                    <option value="Material Sent">Material Sent</option>
                    <option value="Material Pending">Material Pending</option>
                    <option value="On Hold">On Hold</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">Material Sent Date</FormLabel>
                  <Input
                    name="material_sent_date"
                    type="date"
                    value={newProject.material_sent_date}
                    onChange={handleInputChange}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">Balamuragan Payment (₹)</FormLabel>
                  <Input
                    name="balamuragan_payment"
                    type="number"
                    value={newProject.balamuragan_payment}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </FormControl>
              </SimpleGrid>

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
                Create Chitoor Project
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ChitoorProjects;
