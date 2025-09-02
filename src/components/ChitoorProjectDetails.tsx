import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Text,
  Button,
  VStack,
  HStack,
  Flex,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  FormControl,
  FormLabel,
  useDisclosure,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  useToast,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  ModalCloseButton,
  Select,
  Divider,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { supabase } from '../lib/supabase';
import { formatSupabaseError } from '../utils/error';
import { ArrowBackIcon, EditIcon, CalendarIcon } from '@chakra-ui/icons';

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
  created_at?: string;
}

interface PaymentHistory {
  id: string;
  amount: number;
  payment_date: string;
  payment_mode?: string;
  created_at: string;
}

const ChitoorProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen: isPaymentOpen, onOpen: onPaymentOpen, onClose: onPaymentClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  
  const [project, setProject] = useState<ChitoorProject | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [processingPayment, setProcessingPayment] = useState(false);

  const fetchProjectDetails = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      // Fetch project details
      const { data: projectData, error: projectError } = await supabase
        .from('chitoor_projects')
        .select('*')
        .eq('id', id)
        .single();

      if (projectError) {
        console.error('Error fetching project:', projectError);
        toast({
          title: 'Error',
          description: `Failed to fetch project details. ${formatSupabaseError(projectError)}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      if (projectData) {
        setProject(projectData);
      }

      // Fetch payment history (if you have a separate payments table for chitoor)
      // For now, we'll create mock payment history based on amount_received
      const mockPayments: PaymentHistory[] = [];
      if (projectData?.amount_received && projectData.amount_received > 0) {
        mockPayments.push({
          id: '1',
          amount: projectData.amount_received,
          payment_date: projectData.date_of_order || new Date().toISOString(),
          payment_mode: 'Cash',
          created_at: projectData.created_at || new Date().toISOString(),
        });
      }
      setPaymentHistory(mockPayments);

    } catch (error) {
      console.error('Error:', error);
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

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const handleAddPayment = async () => {
    if (!paymentAmount || !project) return;

    try {
      setProcessingPayment(true);
      
      const newAmountReceived = (project.amount_received || 0) + parseFloat(paymentAmount);
      
      // Update project with new amount received
      const { error } = await supabase
        .from('chitoor_projects')
        .update({ 
          amount_received: newAmountReceived,
        })
        .eq('id', project.id);

      if (error) {
        console.error('Error updating project:', error);
        toast({
          title: 'Error',
          description: `Failed to add payment. ${formatSupabaseError(error)}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      // Add to local payment history
      const newPayment: PaymentHistory = {
        id: Date.now().toString(),
        amount: parseFloat(paymentAmount),
        payment_date: paymentDate,
        payment_mode: paymentMode,
        created_at: new Date().toISOString(),
      };

      setPaymentHistory(prev => [newPayment, ...prev]);
      setProject(prev => prev ? { ...prev, amount_received: newAmountReceived } : null);

      toast({
        title: 'Success',
        description: 'Payment added successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onPaymentClose();
      setPaymentAmount('');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setPaymentMode('Cash');

    } catch (error) {
      console.error('Error adding payment:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setProcessingPayment(false);
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

  if (loading) {
    return (
      <Box p={8} textAlign="center">
        <Text>Loading project details...</Text>
      </Box>
    );
  }

  if (!project) {
    return (
      <Box p={8} textAlign="center">
        <Text>Project not found</Text>
        <Button mt={4} onClick={() => navigate('/projects/chitoor')}>
          Back to Chitoor Projects
        </Button>
      </Box>
    );
  }

  const balanceAmount = (project.project_cost || 0) - (project.amount_received || 0);

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <HStack spacing={4}>
            <IconButton
              icon={<ArrowBackIcon />}
              onClick={() => navigate('/projects/chitoor')}
              variant="ghost"
              aria-label="Back to projects"
            />
            <Box>
              <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                Chitoor Project Details
              </Text>
              <Text color="gray.600">
                Project ID: {project.id}
              </Text>
            </Box>
          </HStack>
          <HStack spacing={2}>
            <Button leftIcon={<EditIcon />} variant="outline" onClick={onEditOpen}>
              Edit Project
            </Button>
            <Button leftIcon={<CalendarIcon />} colorScheme="blue" onClick={onPaymentOpen}>
              Add Payment
            </Button>
          </HStack>
        </Flex>

        {/* Project Info Cards */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* Customer Details */}
          <Card>
            <CardHeader>
              <Text fontSize="lg" fontWeight="semibold" color="gray.700">
                Customer Details
              </Text>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={3}>
                <Text><strong>Name:</strong> {project.customer_name}</Text>
                <Text><strong>Phone:</strong> {project.mobile_number}</Text>
                <Text><strong>Address:</strong> {project.address_mandal_village}</Text>
                {project.service_number && (
                  <Text><strong>Service Number:</strong> {project.service_number}</Text>
                )}
                <Text><strong>Order Date:</strong> {project.date_of_order ? new Date(project.date_of_order).toLocaleDateString() : 'N/A'}</Text>
              </VStack>
            </CardBody>
          </Card>

          {/* Project Details */}
          <Card>
            <CardHeader>
              <Text fontSize="lg" fontWeight="semibold" color="gray.700">
                Project Details
              </Text>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={3}>
                <Text><strong>Project Name:</strong> Chitoor-{project.id.slice(-6)}</Text>
                <HStack>
                  <Text><strong>Status:</strong></Text>
                  <Badge 
                    colorScheme={getStatusColor(project.project_status || 'pending')}
                    px={2} py={1} borderRadius="full"
                  >
                    {project.project_status || 'Pending'}
                  </Badge>
                </HStack>
                <Text><strong>Capacity:</strong> {project.capacity} kW</Text>
                <Text><strong>Project Cost:</strong> ₹{project.project_cost.toLocaleString()}</Text>
                <Text><strong>Amount Received:</strong> ₹{(project.amount_received || 0).toLocaleString()}</Text>
                <Text><strong>Balance Amount:</strong> ₹{balanceAmount.toLocaleString()}</Text>
                {project.subsidy_scope && (
                  <Text><strong>Subsidy Scope:</strong> {project.subsidy_scope}</Text>
                )}
                {project.material_sent_date && (
                  <Text><strong>Material Sent Date:</strong> {new Date(project.material_sent_date).toLocaleDateString()}</Text>
                )}
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Project Progress */}
        <Card>
          <CardHeader>
            <Text fontSize="lg" fontWeight="semibold" color="gray.700">
              Project Progress
            </Text>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <HStack justify="space-between" w="full">
                <Text><strong>Status:</strong></Text>
                <Badge 
                  colorScheme={getStatusColor(project.project_status || 'pending')}
                  px={3} py={2} borderRadius="full"
                >
                  {project.project_status || 'Pending'}
                </Badge>
              </HStack>
              
              {/* Payment Progress */}
              <Box w="full">
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" color="gray.600">Payment Progress</Text>
                  <Text fontSize="sm" color="gray.600">
                    ₹{(project.amount_received || 0).toLocaleString()} / ₹{project.project_cost.toLocaleString()}
                  </Text>
                </Flex>
                <Box bg="gray.200" borderRadius="full" h="2">
                  <Box
                    bg="green.400"
                    h="2"
                    borderRadius="full"
                    width={`${Math.min(((project.amount_received || 0) / project.project_cost) * 100, 100)}%`}
                  />
                </Box>
              </Box>
            </VStack>
          </CardBody>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <Flex justify="space-between" align="center">
              <Text fontSize="lg" fontWeight="semibold" color="gray.700">
                Payment History
              </Text>
              <Button size="sm" colorScheme="blue" onClick={onPaymentOpen}>
                Add Payment
              </Button>
            </Flex>
          </CardHeader>
          <CardBody>
            {paymentHistory.length > 0 ? (
              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Date</Th>
                      <Th>Amount (₹)</Th>
                      <Th>Mode</Th>
                      <Th>Receipt</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {paymentHistory.map((payment) => (
                      <Tr key={payment.id}>
                        <Td>{new Date(payment.payment_date).toLocaleDateString()}</Td>
                        <Td>₹{payment.amount.toLocaleString()}</Td>
                        <Td>{payment.payment_mode || 'Cash'}</Td>
                        <Td>
                          <Button size="xs" colorScheme="blue" variant="outline">
                            Download Receipt
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            ) : (
              <Text color="gray.500" textAlign="center" py={8}>
                No payments recorded yet
              </Text>
            )}
          </CardBody>
        </Card>
      </VStack>

      {/* Add Payment Modal */}
      <Modal isOpen={isPaymentOpen} onClose={onPaymentClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Payment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Payment Amount</FormLabel>
                <Input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter payment amount"
                  max={balanceAmount}
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Maximum payment amount: ₹{balanceAmount.toLocaleString()}
                </Text>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Payment Date</FormLabel>
                <Input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Payment Mode</FormLabel>
                <Select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="UPI">UPI</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onPaymentClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleAddPayment}
              isLoading={processingPayment}
              loadingText="Adding..."
            >
              Add Payment
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Project Modal - Placeholder */}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Project</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Edit functionality coming soon!</Text>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onEditClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ChitoorProjectDetails;
