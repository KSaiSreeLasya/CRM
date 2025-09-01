import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Select,
  SimpleGrid,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { supabase } from '../lib/supabase';

export interface LogisticsRow {
  id: string;
  date: string;
  item: string;
  quantity: number;
  from_location: string;
  to_location: string;
  status: string; // Pending | Shipped | Delivered
  reference?: string;
  vehicle?: string;
}

const defaultRow: Omit<LogisticsRow, 'id'> = {
  date: new Date().toISOString().slice(0, 10),
  item: '',
  quantity: 1,
  from_location: 'Main Warehouse',
  to_location: '',
  status: 'Pending',
  reference: '',
  vehicle: '',
};

const LogisticsManager: React.FC = () => {
  const [rows, setRows] = useState<LogisticsRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Omit<LogisticsRow, 'id'>>({ ...defaultRow });
  const [editingId, setEditingId] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const fetchRows = async () => {
    try {
      const { data, error } = await supabase
        .from('logistics')
        .select('*')
        .order('date', { ascending: false })
        .limit(50);
      if (error) throw error;
      setRows(data || []);
    } catch (err: any) {
      const msg = err?.message || JSON.stringify(err);
      console.error('Fetch logistics failed:', msg);
      const isMissing = /relation .* does not exist|42P01/i.test(msg);
      toast({
        title: isMissing ? 'Logistics table missing' : 'Failed to load logistics',
        description: isMissing
          ? 'Create table logistics (id uuid pk, date date, item text, quantity numeric, from_location text, to_location text, status text, reference text, vehicle text). Ensure RLS policies allow authenticated read/write.'
          : msg,
        status: isMissing ? 'info' : 'error',
        duration: 7000,
        isClosable: true,
      });
      setRows([]);
    }
  };

  useEffect(() => { fetchRows(); }, []);

  const openCreate = () => { setEditingId(null); setForm({ ...defaultRow }); onOpen(); };
  const openEdit = (r: LogisticsRow) => { setEditingId(r.id); const { id, ...rest } = r; setForm(rest); onOpen(); };

  const saveRow = async () => {
    try {
      setLoading(true);
      if (!form.item || !form.to_location) {
        toast({ title: 'Missing fields', description: 'Item and Destination are required', status: 'warning' });
        return;
      }
      if (editingId) {
        const { error } = await supabase
          .from('logistics')
          .update({ ...form })
          .eq('id', editingId);
        if (error) throw error;
        toast({ title: 'Logistics updated', status: 'success' });
      } else {
        const { error } = await supabase
          .from('logistics')
          .insert([{ ...form }]);
        if (error) throw error;
        toast({ title: 'Logistics added', status: 'success' });
      }
      onClose();
      setForm({ ...defaultRow });
      setEditingId(null);
      fetchRows();
    } catch (err: any) {
      const msg = err?.message || JSON.stringify(err);
      console.error('Save logistics failed:', msg);
      toast({ title: 'Failed to save', description: msg, status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const deleteRow = async (id: string) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      const { error } = await supabase
        .from('logistics')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast({ title: 'Deleted', status: 'success' });
      fetchRows();
    } catch (err: any) {
      const msg = err?.message || JSON.stringify(err);
      toast({ title: 'Failed to delete', description: msg, status: 'error' });
    }
  };

  return (
    <Box>
      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Heading size="md" color="gray.800">Logistics</Heading>
            <Button leftIcon={<AddIcon />} colorScheme="green" onClick={openCreate}>Add</Button>
          </Flex>
        </CardHeader>
        <CardBody pt={0}>
          <TableContainer>
            <Table size="sm" variant="simple">
              <Thead bg="gray.50">
                <Tr>
                  <Th>Date</Th>
                  <Th>Item</Th>
                  <Th isNumeric>Qty</Th>
                  <Th>From</Th>
                  <Th>To</Th>
                  <Th>Status</Th>
                  <Th>Ref</Th>
                  <Th>Vehicle</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {rows.map((r) => (
                  <Tr key={r.id} _hover={{ bg: 'gray.50' }}>
                    <Td>{r.date ? new Date(r.date).toLocaleDateString() : ''}</Td>
                    <Td>{r.item}</Td>
                    <Td isNumeric>{r.quantity}</Td>
                    <Td>{r.from_location}</Td>
                    <Td>{r.to_location}</Td>
                    <Td>{r.status}</Td>
                    <Td>{r.reference || '-'}</Td>
                    <Td>{r.vehicle || '-'}</Td>
                    <Td>
                      <HStack>
                        <IconButton aria-label="Edit" icon={<EditIcon />} size="sm" variant="ghost" onClick={() => openEdit(r)} />
                        <IconButton aria-label="Delete" icon={<DeleteIcon />} size="sm" variant="ghost" colorScheme="red" onClick={() => deleteRow(r.id)} />
                      </HStack>
                    </Td>
                  </Tr>
                ))}
                {rows.length === 0 && (
                  <Tr><Td colSpan={9}><Text color="gray.500">No logistics found</Text></Td></Tr>
                )}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingId ? 'Edit Logistics' : 'Add Logistics'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              <Input placeholder="Item" value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} />
              <Input type="number" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
              <Input placeholder="From" value={form.from_location} onChange={(e) => setForm({ ...form, from_location: e.target.value })} />
              <Input placeholder="To" value={form.to_location} onChange={(e) => setForm({ ...form, to_location: e.target.value })} />
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option>Pending</option>
                <option>Shipped</option>
                <option>Delivered</option>
              </Select>
              <Input placeholder="Reference" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
              <Input placeholder="Vehicle" value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} />
            </SimpleGrid>
            <HStack justify="flex-end" mt={6}>
              <Button onClick={onClose}>Cancel</Button>
              <Button colorScheme="green" isLoading={loading} onClick={saveRow}>{editingId ? 'Update' : 'Create'}</Button>
            </HStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default LogisticsManager;
