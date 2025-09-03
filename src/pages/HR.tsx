import React, { useState } from 'react';
import React, { useState } from 'react';
import { Box, Heading, Text, Tabs, TabList, TabPanels, Tab, TabPanel, FormControl, FormLabel, Input, Select, Button, Table, Thead, Tr, Th, Tbody, Td, useToast, SimpleGrid, Card, CardHeader, CardBody } from '@chakra-ui/react';
import { supabase } from '../lib/supabase';

const HR: React.FC = () => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [inviteRole, setInviteRole] = useState('standard');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleInvite = async () => {
    try {
      if (!inviteEmail || !invitePassword) {
        toast({ title: 'Email and password required', status: 'warning', duration: 3000, isClosable: true });
        return;
      }
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: inviteEmail,
        password: invitePassword,
        options: { emailRedirectTo: `${window.location.origin}/login` }
      });
      if (error) throw error;
      if (data?.user?.id) {
        await supabase.from('users').upsert({ id: data.user.id, role: inviteRole });
      }
      toast({ title: 'Invitation sent', description: 'A sign-up link was emailed to the user.', status: 'success', duration: 5000, isClosable: true });
      setInviteEmail('');
      setInvitePassword('');
      setInviteRole('standard');
    } catch (e: any) {
      toast({ title: 'Failed to send invite', description: e?.message || String(e), status: 'error', duration: 6000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Heading size="lg" mb={2}>HR</Heading>
      <Text color="gray.600" mb={6}>User access and team management</Text>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
        <Card>
          <CardHeader><Heading size="sm">Quick Actions</Heading></CardHeader>
          <CardBody>
            <FormControl mb={3} isRequired>
              <FormLabel>Email</FormLabel>
              <Input placeholder="user@example.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
            </FormControl>
            <FormControl mb={3} isRequired>
              <FormLabel>Temporary Password</FormLabel>
              <Input type="password" placeholder="Set a temporary password" value={invitePassword} onChange={(e) => setInvitePassword(e.target.value)} />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Role</FormLabel>
              <Select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                <option value="standard">Standard</option>
                <option value="finance">Finance</option>
                <option value="admin">Admin</option>
              </Select>
            </FormControl>
            <Button colorScheme="green" onClick={handleInvite} isLoading={loading}>Send Invite</Button>
            <Text fontSize="xs" color="gray.500" mt={2}>An email with a sign-up link will be sent to the user. After verification, the selected role is applied.</Text>
          </CardBody>
        </Card>
        <Card>
          <CardHeader><Heading size="sm">Guidelines</Heading></CardHeader>
          <CardBody>
            <Text fontSize="sm" color="gray.600">Manage users and roles here. Invites send an email to let teammates join with the selected role. Roles determine access to features.</Text>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Tabs variant="enclosed">
        <TabList>
          <Tab>Users</Tab>
          <Tab>Roles</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Table size="sm">
              <Thead>
                <Tr>
                  <Th>Email</Th>
                  <Th>Role</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td>demo@company.com</Td>
                  <Td>Standard</Td>
                  <Td><Button size="xs">View</Button></Td>
                </Tr>
              </Tbody>
            </Table>
          </TabPanel>
          <TabPanel>
            <Text fontSize="sm" color="gray.600">Roles define permissions for each module. Admin manages global settings, Finance manages payments, Standard accesses projects.</Text>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default HR;
