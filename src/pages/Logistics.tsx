import React, { useEffect, useState } from 'react';
import { Box, Heading, VStack, HStack, Input, Button, Table, Thead, Tbody, Tr, Th, Td, useToast, Alert, AlertIcon, Text, Card, CardBody } from '@chakra-ui/react';
import { supabase } from '../lib/supabase';

interface LogisticsRecord {
  id: string;
  tracking_no: string;
  vendor?: string;
  status?: string;
  expected_date?: string;
  notes?: string;
  updated_at?: string;
}

const Logistics: React.FC = () => {
  const [rows, setRows] = useState<LogisticsRecord[]>([]);
  const [tracking, setTracking] = useState('');
  const [vendor, setVendor] = useState('');
  const [status, setStatus] = useState('');
  const [expected, setExpected] = useState('');
  const [notes, setNotes] = useState('');
  const [tableMissing, setTableMissing] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetchRows = async () => {
    try {
      const { data, error } = await supabase.from('logistics').select('*').order('updated_at', { ascending: false });
      if (error) {
        if ((error as any).code === 'PGRST116') { setTableMissing(true); return; }
        throw error as any;
      }
      setRows((data as any) || []);
    } catch (e: any) {
      toast({ title: 'Failed to load logistics', description: e?.message || String(e), status: 'error', duration: 4000, isClosable: true });
    }
  };

  const addRow = async () => {
    try {
      setLoading(true);
      const payload = { tracking_no: tracking, vendor: vendor || null, status: status || null, expected_date: expected || null, notes: notes || null };
      const { data, error } = await supabase.from('logistics').insert([payload]).select('*');
      if (error) throw error as any;
      setRows([...(rows || []), ...(data as any)]);
      setTracking(''); setVendor(''); setStatus(''); setExpected(''); setNotes('');
      toast({ title: 'Logistics added', status: 'success', duration: 2000, isClosable: true });
    } catch (e: any) {
      toast({ title: 'Failed to add logistics', description: e?.message || String(e), status: 'error', duration: 4000, isClosable: true });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchRows(); }, []);

  if (tableMissing) {
    return (
      <Alert status="warning" borderRadius="md">
        <AlertIcon />
        <Text>Table "logistics" not found. Please create it in Supabase to enable logistics tracking.</Text>
      </Alert>
    );
  }

  return (
    <Box>
      <Heading size="lg" mb={4}>Logistics</Heading>
      <Card mb={6}><CardBody>
        <VStack align="stretch" spacing={3}>
          <HStack>
            <Input placeholder="Tracking number" value={tracking} onChange={(e) => setTracking(e.target.value)} />
            <Input placeholder="Vendor" value={vendor} onChange={(e) => setVendor(e.target.value)} />
            <Input placeholder="Status" value={status} onChange={(e) => setStatus(e.target.value)} />
            <Input type="date" placeholder="Expected date" value={expected} onChange={(e) => setExpected(e.target.value)} />
            <Input placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            <Button colorScheme="green" onClick={addRow} isLoading={loading}>Add</Button>
          </HStack>
        </VStack>
      </CardBody></Card>

      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>Tracking</Th>
            <Th>Vendor</Th>
            <Th>Status</Th>
            <Th>Expected</Th>
            <Th>Notes</Th>
            <Th>Updated</Th>
          </Tr>
        </Thead>
        <Tbody>
          {rows.map((r) => (
            <Tr key={r.id}>
              <Td>{r.tracking_no}</Td>
              <Td>{r.vendor || '-'}</Td>
              <Td>{r.status || '-'}</Td>
              <Td>{r.expected_date ? new Date(r.expected_date).toLocaleDateString() : '-'}</Td>
              <Td>{r.notes || '-'}</Td>
              <Td>{r.updated_at ? new Date(r.updated_at).toLocaleString() : '-'}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default Logistics;
