import React from 'react';
import {
  Box,
  Flex,
  HStack,
  Button,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
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
  const activeBg = 'green.50';
  const activeColor = 'green.600';
  const hoverBg = 'gray.50';
  
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
  const { isAdmin, assignedRegions } = useAuth();
  const headerBg = 'white';
  const borderColor = 'gray.200';
  const reportActiveBg = 'green.50';
  const reportActiveColor = 'green.600';
  const reportHoverBg = 'gray.50';

  const navigationItems = [
    { icon: '📊', label: 'Dashboard', to: '/dashboard' },
    { icon: '📈', label: 'Projects', to: '/projects' },
    { icon: '🏭', label: 'Stock Warehouse', to: '/stock' },
    { icon: '🚚', label: 'Logistics & Supply Chain', to: '/logistics' },
    // Reports has submenu; keep parent link to /reports
    { icon: '📑', label: 'Reports', to: '/reports' },
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
          {navigationItems.map((item) => {
            if (item.label === 'Reports') {
              const active = location.pathname.startsWith('/reports');
              const activeBg = reportActiveBg;
              const activeColor = reportActiveColor;
              const hoverBg = reportHoverBg;
              return (
                <Menu key={item.to} isLazy>
                  <MenuButton
                    as={Button}
                    variant="ghost"
                    size="lg"
                    bg={active ? activeBg : 'transparent'}
                    color={active ? activeColor : 'gray.600'}
                    fontWeight={active ? 'semibold' : 'medium'}
                    _hover={{ bg: active ? activeBg : hoverBg, transform: 'translateY(-1px)' }}
                    _active={{ transform: 'translateY(0)' }}
                    borderRadius="lg"
                    px={6}
                    py={3}
                    leftIcon={<Text fontSize="lg">{item.icon}</Text>}
                  >
                    {item.label}
                  </MenuButton>
                  <MenuList>
                    <MenuItem as={RouterLink} to="/reports">All Reports</MenuItem>
                    <MenuItem as={RouterLink} to="/reports/tg">TG Reports</MenuItem>
                    <MenuItem as={RouterLink} to="/reports/ap">AP Reports</MenuItem>
                    <MenuItem as={RouterLink} to="/reports/chitoor">Chitoor Reports</MenuItem>
                  </MenuList>
                </Menu>
              );
            }
            if (item.label === 'Logistics & Supply Chain') {
              const active = location.pathname === '/logistics' || location.pathname.startsWith('/logistics/');
              const activeBg = reportActiveBg;
              const activeColor = reportActiveColor;
              const hoverBg = reportHoverBg;
              return (
                <Menu key={item.to} isLazy>
                  <MenuButton
                    as={Button}
                    variant="ghost"
                    size="lg"
                    bg={active ? activeBg : 'transparent'}
                    color={active ? activeColor : 'gray.600'}
                    fontWeight={active ? 'semibold' : 'medium'}
                    _hover={{ bg: active ? activeBg : hoverBg, transform: 'translateY(-1px)' }}
                    _active={{ transform: 'translateY(0)' }}
                    borderRadius="lg"
                    px={6}
                    py={3}
                    leftIcon={<Text fontSize="lg">{item.icon}</Text>}
                  >
                    {item.label}
                  </MenuButton>
                  <MenuList>
                    <MenuItem as={RouterLink} to="/logistics">Logistics (Default)</MenuItem>
                    <MenuItem as={RouterLink} to="/logistics/modules">Modules & Inventory</MenuItem>
                  </MenuList>
                </Menu>
              );
            }
            return (
              <NavButton
                key={item.to}
                icon={item.icon}
                label={item.label}
                to={item.to}
                isActive={location.pathname === item.to}
              />
            );
          })}
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
