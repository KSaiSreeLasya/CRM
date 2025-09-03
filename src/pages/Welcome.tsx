import React from 'react';
import { Box, Heading, Text, SimpleGrid, Flex, LinkBox, LinkOverlay, useColorModeValue, Button, useToast, Image, Avatar, HStack, Spacer } from '@chakra-ui/react';
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
  const { logout, user, isFinance } = useAuth();
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
    <Box px={{ base: 4, md: 6 }} py={{ base: 4, md: 6 }} maxW="1200px" mx="auto">
      <Flex mb={6} align="center" gap={4} wrap="wrap">
        <Image src="https://cdn.builder.io/api/v1/image/assets%2F2f195b82614d46a0b777d649ad418b24%2F5065c74f0a374ff4a36efc224f468f09?format=webp&width=800" alt="Axiso Green Energy Logo" h={{ base: '36px', md: '48px' }} w="auto" objectFit="contain" />
        <Box>
          <Heading size={{ base: 'sm', md: 'md' }} color="green.600">Axiso Green Energy</Heading>
          <Text color={titleColor} fontSize={{ base: 'xs', md: 'sm' }}>Sustainable Energy Platform</Text>
        </Box>
        <Spacer />
        <HStack spacing={3} align="center">
          <Avatar size="sm" name={user?.email || 'User'} />
          <Box textAlign="right">
            <Text fontSize="sm" fontWeight="medium">{user?.email?.split('@')[0] || 'User'}</Text>
            <Text fontSize="xs" color="gray.500">{isFinance ? 'Finance User' : 'Standard User'}</Text>
          </Box>
          <Button onClick={handleLogout} colorScheme="red" variant="outline" size="sm">Logout</Button>
        </HStack>
      </Flex>

      {/* Mobile: horizontal scroll tiles */}
      <Box display={{ base: 'block', lg: 'none' }} overflowX="auto" pb={2} className="mobile-tiles-scroll" sx={{ scrollbarWidth: 'thin' }}>
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
