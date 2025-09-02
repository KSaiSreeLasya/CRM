import React from 'react';
import {
  Box,
  Flex,
  HStack,
  Button,
  useColorModeValue,
  Text,
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface NavButtonProps {
  icon: string;
  label: string;
  to: string;
  isActive: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, label, to, isActive }) => {
  const activeBg = useColorModeValue('green.50', 'green.900');
  const activeColor = useColorModeValue('green.600', 'green.200');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  
  return (
    <Button
      as={RouterLink}
      to={to}
      variant="ghost"
      size="lg"
      bg={isActive ? activeBg : 'transparent'}
      color={isActive ? activeColor : 'gray.600'}
      fontWeight={isActive ? 'semibold' : 'medium'}
      _hover={{
        bg: isActive ? activeBg : hoverBg,
        transform: 'translateY(-1px)',
      }}
      _active={{
        transform: 'translateY(0)',
      }}
      transition="all 0.2s"
      borderRadius="lg"
      px={6}
      py={3}
      h="auto"
      leftIcon={<Text fontSize="lg">{icon}</Text>}
    >
      {label}
    </Button>
  );
};

const NavigationHeader = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const headerBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const navigationItems = [
    { icon: '📊', label: 'Dashboard', to: '/dashboard' },
    { icon: '📈', label: 'Projects', to: '/projects' },
    { icon: '🏭', label: 'Stock Warehouse', to: '/stock' },
    { icon: '🚚', label: 'Logistics & Supply Chain', to: '/logistics' },
    { icon: '🎫', label: 'Service Tickets', to: '/service-tickets' },
    ...(isAdmin ? [{ icon: '⚙️', label: 'Admin', to: '/admin' }] : []),
  ];

  return (
    <Box 
      bg={headerBg} 
      borderBottom="2px solid" 
      borderColor={borderColor} 
      py={4} 
      px={6}
      shadow="sm"
    >
      <Flex justify="space-between" align="center">
        <HStack spacing={1}>
          {navigationItems.map((item) => (
            <NavButton
              key={item.to}
              icon={item.icon}
              label={item.label}
              to={item.to}
              isActive={location.pathname === item.to}
            />
          ))}
        </HStack>
        
        <Box>
          <Text fontSize="sm" color="gray.500" textAlign="right">
            Navigate through different sections
          </Text>
        </Box>
      </Flex>
    </Box>
  );
};

export default NavigationHeader;
