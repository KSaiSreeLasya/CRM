import React from 'react';
import { Box, Heading, Text, SimpleGrid, Flex, LinkBox, LinkOverlay, useColorModeValue, Button, useToast } from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

interface Tile {
  label: string;
  description: string;
  icon: string;
  to: string;
}

const tiles: Tile[] = [
  { label: 'Overall Dashboard', description: 'KPIs and performance overview', icon: '📊', to: '/dashboard' },
  { label: 'Projects', description: 'Track and manage all projects', icon: '📈', to: '/projects' },
  { label: 'Operations', description: 'Stock, procurement and operations', icon: '🏭', to: '/stock' },
  { label: 'Logistics', description: 'Logistics & supply chain flows', icon: '🚚', to: '/logistics' },
  { label: 'Finance', description: 'Billing, payments and receipts', icon: '💰', to: '/finance' },
  { label: 'Sales', description: 'Sales insights and reports', icon: '🧾', to: '/reports' },
  { label: 'HR', description: 'User access and team management', icon: '👥', to: '/admin' },
  { label: 'Admin Settings', description: 'System configuration and controls', icon: '⚙️', to: '/admin' },
];

import { useAuth } from '../context/AuthContext';

const Welcome: React.FC = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const titleColor = useColorModeValue('gray.700', 'gray.200');
  const { logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: 'Logged out', status: 'success', duration: 3000, isClosable: true });
      navigate('/login');
    } catch (e: any) {
      toast({ title: 'Logout failed', description: e?.message || String(e), status: 'error', duration: 4000, isClosable: true });
    }
  };

  return (
    <Box>
      <Flex mb={6} justify="space-between" align="center">
        <Box>
          <Heading size={{ base: 'md', md: 'lg' }} color="green.600">Welcome</Heading>
          <Text color={titleColor} mt={2}>Choose a module to continue</Text>
        </Box>
        <Button onClick={handleLogout} colorScheme="red" variant="outline" size="sm">Logout</Button>
      </Flex>

      {/* Mobile: horizontal scroll tiles */}
      <Box display={{ base: 'block', lg: 'none' }} overflowX="auto" pb={2} className="mobile-tiles-scroll">
        <Flex gap={4} minW="max-content" pr={2}>
          {tiles.map((t) => (
            <LinkBox
              key={t.label}
              as="article"
              role="group"
              minW="260px"
              maxW="260px"
              bg={cardBg}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="xl"
              p={5}
              boxShadow="sm"
              _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
              transition="all 0.2s"
            >
              <Text fontSize="3xl" mb={2}>{t.icon}</Text>
              <Heading size="sm" mb={1} color="green.600">{t.label}</Heading>
              <Text fontSize="sm" color={titleColor} noOfLines={2}>{t.description}</Text>
              <Box mt={3}>
                <LinkOverlay as={RouterLink} to={t.to} color="green.600">Open</LinkOverlay>
              </Box>
            </LinkBox>
          ))}
        </Flex>
      </Box>

      {/* Desktop/Tablet: grid tiles */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5} display={{ base: 'none', lg: 'grid' }}>
        {tiles.map((t) => (
          <LinkBox
            key={t.label}
            as="article"
            role="group"
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="xl"
            p={6}
            boxShadow="sm"
            _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
            transition="all 0.2s"
          >
            <Text fontSize="4xl" mb={2}>{t.icon}</Text>
            <Heading size="sm" mb={1} color="green.600">{t.label}</Heading>
            <Text fontSize="sm" color={titleColor}>{t.description}</Text>
            <Box mt={3}>
              <LinkOverlay as={RouterLink} to={t.to} color="green.600">Open</LinkOverlay>
            </Box>
          </LinkBox>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default Welcome;
