import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Input,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Alert,
  AlertIcon,
  Text,
  Card,
  CardBody,
  Textarea,
  Code,
} from '@chakra-ui/react';
import { supabase } from '../lib/supabase';

interface ProcurementItem {
  id: string;
  item_name: string;
  quantity: number;
  supplier?: string;
  purchase_date?: string; // ISO Date string
  price?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

const Procurement: React.FC = () => {
  const [records, setRecords] = useState<ProcurementItem[]>([]);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [supplier, setSupplier] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [tableMissing, setTableMissing] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('procurements')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        if ((error as any).code === 'PGRST116') {
          setTableMissing(true);
          return;
        }
        throw error as any;
      }
      setRecords((data as any) || []);
    } catch (e: any) {
      toast({ title: 'Failed to load procurements', description: e?.message || String(e), status: 'error', duration: 4000, isClosable: true });
    }
  };

  useEffect(() => { fetchRecords(); }, []);

  const addRecord = async () => {
    try {
      if (!itemName || !quantity) {
        toast({ title: 'Missing fields', description: 'Item name and quantity are required', status: 'warning', duration: 3000, isClosable: true });
        return;
      }
      setLoading(true);
      const payload: any = {
        item_name: itemName,
        quantity,
        supplier: supplier || null,
        purchase_date: purchaseDate || null,
        price: price === '' ? null : Number(price),
        notes: notes || null,
      };
      const { data, error } = await supabase.from('procurements').insert([payload]).select('*');
      if (error) throw error as any;
      setRecords([...(data as any), ...(records || [])]);
      setItemName(''); setQuantity(0); setSupplier(''); setPurchaseDate(''); setPrice(''); setNotes('');
      toast({ title: 'Procurement saved', status: 'success', duration: 2000, isClosable: true });
    } catch (e: any) {
      toast({ title: 'Failed to save', description: e?.message || String(e), status: 'error', duration: 4000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  if (tableMissing) {
    return (
      <Alert status="warning" borderRadius="md">
        <AlertIcon />
        <Box>
          <Text mb={2}>Table "procurements" not found. Create it in your database to enable procurement storage.</Text>
          <Text fontWeight="semibold" mb={1}>SQL to create table:</Text>
          <Code display="block" whiteSpace="pre" p={3} borderRadius="md">
{`CREATE TABLE IF NOT EXISTS procurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  supplier VARCHAR(255),
  purchase_date DATE,
  price DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_on_procurements ON procurements;
CREATE TRIGGER set_updated_at_on_procurements
BEFORE UPDATE ON procurements
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();`}
          </Code>
        </Box>
      </Alert>
    );
  }

  return (
    <Box>
      <Heading size="lg" mb={4}>Procurement</Heading>
      <Card mb={6}><CardBody>
        <VStack align="stretch" spacing={3}>
          <HStack align="flex-start">
            <Input placeholder="Item name" value={itemName} onChange={(e) => setItemName(e.target.value)} />
            <Input type="number" placeholder="Qty" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} w="120px" />
            <Input placeholder="Supplier" value={supplier} onChange={(e) => setSupplier(e.target.value)} />
            <Input type="date" placeholder="Purchase date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} w="200px" />
            <Input type="number" step="0.01" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))} w="160px" />
          </HStack>
          <Textarea placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <HStack>
            <Button colorScheme="green" onClick={addRecord} isLoading={loading}>Save Procurement</Button>
          </HStack>
        </VStack>
      </CardBody></Card>

      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>Item</Th>
            <Th>Qty</Th>
            <Th>Supplier</Th>
            <Th>Purchase Date</Th>
            <Th isNumeric>Price</Th>
            <Th>Created</Th>
          </Tr>
        </Thead>
        <Tbody>
          {records.map((r) => (
            <Tr key={r.id}>
              <Td>{r.item_name}</Td>
              <Td>{r.quantity}</Td>
              <Td>{r.supplier || '-'}</Td>
              <Td>{r.purchase_date ? new Date(r.purchase_date).toLocaleDateString() : '-'}</Td>
              <Td isNumeric>{typeof r.price === 'number' ? r.price.toFixed(2) : '-'}</Td>
              <Td>{r.created_at ? new Date(r.created_at).toLocaleString() : '-'}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default Procurement;
