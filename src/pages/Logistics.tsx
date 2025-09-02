import React, { useEffect, useState } from 'react';
import { Box, Heading, VStack, HStack, Input, Button, Table, Thead, Tbody, Tr, Th, Td, useToast, Alert, AlertIcon, Text, Card, CardBody, IconButton } from '@chakra-ui/react';
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

interface EditState {
  id: string;
  tracking_no: string;
  vendor: string;
  status: string;
  expected_date: string;
  notes: string;
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
  const [editing, setEditing] = useState<EditState | null>(null);
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
      const payload = { tracking_no: tracking, vendor: vendor || null, status: status || null, expected_date: expected || null, notes: notes || null } as any;
      const { data, error } = await supabase.from('logistics').insert([payload]).select('*');
      if (error) throw error as any;
      setRows([...(rows || []), ...(data as any)]);
      setTracking(''); setVendor(''); setStatus(''); setExpected(''); setNotes('');
      toast({ title: 'Logistics added', status: 'success', duration: 2000, isClosable: true });
    } catch (e: any) {
      toast({ title: 'Failed to add logistics', description: e?.message || String(e), status: 'error', duration: 4000, isClosable: true });
    } finally { setLoading(false); }
  };

  const startEdit = (r: LogisticsRecord) => {
    setEditing({
      id: r.id,
      tracking_no: r.tracking_no,
      vendor: r.vendor || '',
      status: r.status || '',
      expected_date: r.expected_date || '',
      notes: r.notes || ''
    });
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      setLoading(true);
      const payload: any = {
        tracking_no: editing.tracking_no,
        vendor: editing.vendor || null,
        status: editing.status || null,
        expected_date: editing.expected_date || null,
        notes: editing.notes || null
      };
      const { data, error } = await supabase.from('logistics').update(payload).eq('id', editing.id).select('*');
      if (error) throw error as any;
      setRows(rows.map(r => (r.id === editing.id ? (data as any)[0] : r)));
      setEditing(null);
      toast({ title: 'Updated', status: 'success', duration: 2000 });
    } catch (e: any) {
      toast({ title: 'Failed to update', description: e?.message || String(e), status: 'error', duration: 4000 });
    } finally { setLoading(false); }
  };

  const deleteRow = async (id: string) => {
    try {
      const { error } = await supabase.from('logistics').delete().eq('id', id);
      if (error) throw error as any;
      setRows(rows.filter(r => r.id !== id));
      toast({ title: 'Deleted', status: 'success', duration: 2000 });
    } catch (e: any) {
      toast({ title: 'Failed to delete', description: e?.message || String(e), status: 'error', duration: 4000 });
    }
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
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {rows.map((r) => (
            <Tr key={r.id}>
              <Td>{editing?.id === r.id ? (<Input value={editing.tracking_no} onChange={(e)=>setEditing({...editing!, tracking_no:e.target.value})} />) : r.tracking_no}</Td>
              <Td>{editing?.id === r.id ? (<Input value={editing.vendor} onChange={(e)=>setEditing({...editing!, vendor:e.target.value})} />) : (r.vendor || '-')}</Td>
              <Td>{editing?.id === r.id ? (<Input value={editing.status} onChange={(e)=>setEditing({...editing!, status:e.target.value})} />) : (r.status || '-')}</Td>
              <Td>{editing?.id === r.id ? (<Input type="date" value={editing.expected_date} onChange={(e)=>setEditing({...editing!, expected_date:e.target.value})} />) : (r.expected_date ? new Date(r.expected_date).toLocaleDateString() : '-')}</Td>
              <Td>{editing?.id === r.id ? (<Input value={editing.notes} onChange={(e)=>setEditing({...editing!, notes:e.target.value})} />) : (r.notes || '-')}</Td>
              <Td>{r.updated_at ? new Date(r.updated_at).toLocaleString() : '-'}</Td>
              <Td>
                {editing?.id === r.id ? (
                  <HStack>
                    <Button size="sm" colorScheme="green" onClick={saveEdit} isLoading={loading}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
                  </HStack>
                ) : (
                  <HStack>
                    <Button size="sm" onClick={() => startEdit(r)}>Edit</Button>
                    <Button size="sm" colorScheme="red" onClick={() => deleteRow(r.id)}>Delete</Button>
                  </HStack>
                )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default Logistics;
