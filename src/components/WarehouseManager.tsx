import React, { useEffect, useMemo, useState } from 'react';
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

export interface StockItem {
  id: string;
  item_name: string;
  sku: string;
  quantity: number;
  unit: string;
  location: string;
  notes?: string;
  updated_at?: string;
}

const defaultItem: Omit<StockItem, 'id'> = {
  item_name: '',
  sku: '',
  quantity: 0,
  unit: 'pcs',
  location: 'Main Warehouse',
  notes: '',
  updated_at: ''
};

const WarehouseManager: React.FC = () => {
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Omit<StockItem, 'id'>>({ ...defaultItem });
  const [editingId, setEditingId] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('warehouse_stock')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (err: any) {
      // If table missing, show hint but don't crash app
      console.error('Fetch warehouse_stock failed:', err);
      toast({
        title: 'Warehouse table missing',
        description: 'Create table "warehouse_stock" in Supabase with columns: id uuid pk, item_name text, sku text, quantity numeric, unit text, location text, notes text, updated_at timestamp default now().',
        status: 'info',
        duration: 6000,
        isClosable: true,
      });
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const lowStock = useMemo(() => items.filter(i => (i.quantity || 0) <= 5), [items]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...defaultItem });
    onOpen();
  };

  const openEdit = (item: StockItem) => {
    setEditingId(item.id);
    const { id, ...rest } = item;
    setForm(rest);
    onOpen();
  };

  const saveItem = async () => {
    try {
      setLoading(true);
      if (!form.item_name || !form.sku) {
        toast({ title: 'Missing fields', description: 'Item name and SKU are required', status: 'warning' });
        return;
      }
      if (editingId) {
        const { error } = await supabase
          .from('warehouse_stock')
          .update({ ...form, updated_at: new Date().toISOString() })
          .eq('id', editingId);
        if (error) throw error;
        toast({ title: 'Stock updated', status: 'success' });
      } else {
        const { error } = await supabase
          .from('warehouse_stock')
          .insert([{ ...form }]);
        if (error) throw error;
        toast({ title: 'Stock added', status: 'success' });
      }
      onClose();
      setForm({ ...defaultItem });
      setEditingId(null);
      fetchItems();
    } catch (err: any) {
      console.error('Save stock failed:', err);
      toast({ title: 'Failed to save stock', description: err.message || String(err), status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      const { error } = await supabase
        .from('warehouse_stock')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast({ title: 'Stock removed', status: 'success' });
      fetchItems();
    } catch (err: any) {
      toast({ title: 'Failed to delete', description: err.message || String(err), status: 'error' });
    }
  };

  return (
    <Box>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={6}>
        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardHeader>
            <Flex justify="space-between" align="center">
              <Heading size="md" color="gray.800">Warehouse Stock</Heading>
              <Button leftIcon={<AddIcon />} colorScheme="green" onClick={openCreate}>
                Add Item
              </Button>
            </Flex>
          </CardHeader>
          <CardBody pt={0}>
            <TableContainer>
              <Table size="sm" variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Item</Th>
                    <Th>SKU</Th>
                    <Th isNumeric>Qty</Th>
                    <Th>Unit</Th>
                    <Th>Location</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {items.map((i) => (
                    <Tr key={i.id} _hover={{ bg: 'gray.50' }}>
                      <Td>{i.item_name}</Td>
                      <Td>{i.sku}</Td>
                      <Td isNumeric>{i.quantity}</Td>
                      <Td>{i.unit}</Td>
                      <Td>{i.location}</Td>
                      <Td>
                        <HStack>
                          <IconButton aria-label="Edit" icon={<EditIcon />} size="sm" variant="ghost" onClick={() => openEdit(i)} />
                          <IconButton aria-label="Delete" icon={<DeleteIcon />} size="sm" variant="ghost" colorScheme="red" onClick={() => deleteItem(i.id)} />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                  {items.length === 0 && (
                    <Tr><Td colSpan={6}><Text color="gray.500">No stock found</Text></Td></Tr>
                  )}
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md" color="gray.800">Low Stock Alerts</Heading>
          </CardHeader>
          <CardBody pt={0}>
            <TableContainer>
              <Table size="sm" variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Item</Th>
                    <Th>SKU</Th>
                    <Th isNumeric>Qty</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {lowStock.map((i) => (
                    <Tr key={i.id} _hover={{ bg: 'gray.50' }}>
                      <Td>{i.item_name}</Td>
                      <Td>{i.sku}</Td>
                      <Td isNumeric>{i.quantity}</Td>
                    </Tr>
                  ))}
                  {lowStock.length === 0 && (
                    <Tr><Td colSpan={3}><Text color="gray.500">No low stock</Text></Td></Tr>
                  )}
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Create/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingId ? 'Edit Stock' : 'Add Stock'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <Input placeholder="Item name" value={form.item_name} onChange={(e) => setForm({ ...form, item_name: e.target.value })} />
              <Input placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              <Input type="number" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
              <Select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                <option value="pcs">pcs</option>
                <option value="sets">sets</option>
                <option value="boxes">boxes</option>
              </Select>
              <Input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              <Input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </SimpleGrid>
            <HStack justify="flex-end" mt={6}>
              <Button onClick={onClose}>Cancel</Button>
              <Button colorScheme="green" isLoading={loading} onClick={saveItem}>{editingId ? 'Update' : 'Create'}</Button>
            </HStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default WarehouseManager;
