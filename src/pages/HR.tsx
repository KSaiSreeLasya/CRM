import React, { useState } from 'react';
import { Box, Heading, Text, Tabs, TabList, TabPanels, Tab, TabPanel, FormControl, FormLabel, Input, Select, Button, Table, Thead, Tr, Th, Tbody, Td, useToast, SimpleGrid, Card, CardHeader, CardBody } from '@chakra-ui/react';

const HR: React.FC = () => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('standard');
  const toast = useToast();

  const handleInvite = () => {
    if (!inviteEmail) {
      toast({ title: 'Email required', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    toast({ title: 'Invitation sent', description: `Invited ${inviteEmail} as ${inviteRole}`, status: 'success', duration: 3000, isClosable: true });
    setInviteEmail('');
    setInviteRole('standard');
  };

  return (
    <Box>
      <Heading size="lg" mb={2}>HR</Heading>
      <Text color="gray.600" mb={6}>User access and team management</Text>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
        <Card>
          <CardHeader><Heading size="sm">Quick Actions</Heading></CardHeader>
          <CardBody>
            <FormControl mb={3}>
              <FormLabel>Invite user</FormLabel>
              <Input placeholder="user@example.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Role</FormLabel>
              <Select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                <option value="standard">Standard</option>
                <option value="finance">Finance</option>
                <option value="admin">Admin</option>
              </Select>
            </FormControl>
            <Button colorScheme="green" onClick={handleInvite}>Send Invite</Button>
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
