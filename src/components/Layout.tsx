import React from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  useToast,
  Link as ChakraLink,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  IconButton,
  VStack,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Input,
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronDownIcon } from '@chakra-ui/icons';
import DashboardHeader from './DashboardHeader';
import NavigationHeader from './NavigationHeader';
import { supabase } from '../lib/supabase';

interface LayoutProps {
  children: React.ReactNode;
}

interface NavItemProps {
  icon: string;
  label: string;
  to: string;
  isActive: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, to, isActive, onClick }) => (
  <ChakraLink
    as={RouterLink}
    to={to}
    onClick={onClick}
    display="flex"
    alignItems="center"
    px={4}
    py={3}
    borderRadius="lg"
    bg={isActive ? 'green.50' : 'transparent'}
    color={isActive ? 'green.600' : 'gray.600'}
    fontWeight={isActive ? 'semibold' : 'medium'}
    _hover={{
      bg: isActive ? 'green.100' : 'gray.50',
      color: isActive ? 'green.700' : 'gray.700',
      textDecoration: 'none',
      transform: 'translateX(2px)',
    }}
    transition="all 0.2s"
    border="1px solid"
    borderColor={isActive ? 'green.200' : 'transparent'}
  >
    <Text fontSize="lg" mr={3}>{icon}</Text>
    <Text fontSize="sm">{label}</Text>
  </ChakraLink>
);

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { logout, isFinance, isAdmin, user, assignedRegions } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const passwordDisclosure = useDisclosure();
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [changingPassword, setChangingPassword] = React.useState(false);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const sidebarBg = useColorModeValue('gray.50', 'gray.900');

  const handleSignOut = async () => {
    try {
      await logout();
      toast({
        title: 'Logged out successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Error signing out',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Map regions to navigation items
  const allStateProjects = [
    { icon: '📊', label: 'ALL PROJECTS', to: '/reports?region=all', region: 'all' },
    { icon: '🏢', label: 'TG', to: '/reports?region=tg', region: 'Telangana' },
    { icon: '🏛️', label: 'AP', to: '/reports?region=ap', region: 'Andhra Pradesh' },
    { icon: '🏗️', label: 'CHITOOR', to: '/reports?region=chitoor', region: 'Chitoor' },
  ];

  // Filter state projects based on user's assigned regions
  const stateProjects = allStateProjects.filter(project => {
    // Admin users see all projects
    if (isAdmin) return true;

    // Show "ALL PROJECTS" if user has multiple regions OR no assignments
    if (project.region === 'all') {
      return assignedRegions.length > 1 || assignedRegions.length === 0 || isAdmin;
    }

    // If no assignments, show all regions
    if (assignedRegions.length === 0) return true;

    // Show region if user is assigned to it
    return assignedRegions.includes(project.region);
  });

  const financeItems = [
    { icon: '💰', label: 'Finance', to: '/finance' },
    { icon: '💳', label: 'Payments', to: '/payments' },
  ];

  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <Box>
      <Flex direction="column" h="full">
        <Box p={6}>
          <Flex align="center" justify="center" mb={8}>
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F2f195b82614d46a0b777d649ad418b24%2F5065c74f0a374ff4a36efc224f468f09?format=webp&width=800"
              alt="Axiso Green Energy Logo"
              style={{ height: '60px', width: 'auto' }}
            />
          </Flex>
          <Text
            fontSize="lg"
            fontWeight="bold"
            color="green.600"
            textAlign="center"
            mb={2}
          >
            Axiso Green Energy
          </Text>
          <Text fontSize="xs" color="gray.500" textAlign="center">
            Sustainable Energy Platform
          </Text>
        </Box>

        <VStack spacing={2} px={4} flex="1">
          <Box w="full" my={4}>
            <Text fontSize="xs" fontWeight="semibold" color="gray.400" px={4} mb={2}>
              STATE PROJECTS
            </Text>
          </Box>
          {stateProjects.map((item) => {
            const getIsActive = (to: string) => {
              if (to.startsWith('/reports')) {
                const params = new URLSearchParams(location.search);
                const region = params.get('region') || 'all';
                const targetRegion = new URLSearchParams(to.split('?')[1] || '').get('region') || 'all';
                return location.pathname === '/reports' && region === targetRegion;
              }
              return location.pathname === to || location.pathname.includes(to);
            };
            return (
              <NavItem
                key={item.to}
                icon={item.icon}
                label={item.label}
                to={item.to}
                isActive={getIsActive(item.to)}
                onClick={onClose}
              />
            );
          })}

          {isAdmin && (
            <>
              <Box w="full" my={4}>
                <Text fontSize="xs" fontWeight="semibold" color="gray.400" px={4} mb={2}>
                  ADMINISTRATION
                </Text>
              </Box>
              <NavItem
                icon="⚙️"
                label="Admin Dashboard"
                to="/admin"
                isActive={location.pathname === '/admin'}
                onClick={onClose}
              />
            </>
          )}

          {isFinance && (
            <>
              <Box w="full" my={4}>
                <Text fontSize="xs" fontWeight="semibold" color="gray.400" px={4} mb={2}>
                  FINANCE
                </Text>
              </Box>
              {financeItems.map((item) => (
                <NavItem
                  key={item.to}
                  icon={item.icon}
                  label={item.label}
                  to={item.to}
                  isActive={location.pathname === item.to}
                  onClick={onClose}
                />
              ))}
            </>
          )}
        </VStack>

        <Box p={4}>
          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              w="full"
              justifyContent="flex-start"
              leftIcon={<Avatar size="sm" name={user?.email} />}
              rightIcon={<ChevronDownIcon />}
              textAlign="left"
              fontSize="sm"
            >
              <Box>
                <Text fontWeight="medium" isTruncated>
                  {user?.email?.split('@')[0] || 'User'}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {isFinance ? 'Finance User' : 'Standard User'}
                </Text>
              </Box>
            </MenuButton>
            <MenuList>
              <MenuItem
                icon={<Text>🔒</Text>}
                onClick={passwordDisclosure.onOpen}
                fontSize="sm"
              >
                Change Password
              </MenuItem>
              <MenuItem
                icon={<Text>🚪</Text>}
                onClick={handleSignOut}
                fontSize="sm"
                color="red.500"
              >
                Sign Out
              </MenuItem>
            </MenuList>
          </Menu>
        </Box>
      </Flex>
    </Box>
  );

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Mobile Navigation */}
      <Flex
        display={{ base: 'flex', lg: 'none' }}
        as="nav"
        align="center"
        justify="space-between"
        padding="4"
        bg={bgColor}
        borderBottom="1px"
        borderColor={borderColor}
        position="sticky"
        top="0"
        zIndex="sticky"
      >
        <Flex align="center">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F2f195b82614d46a0b777d649ad418b24%2F5065c74f0a374ff4a36efc224f468f09?format=webp&width=800"
            alt="Axiso Green Energy Logo"
            style={{ height: '32px', width: 'auto' }}
          />
        </Flex>
        <IconButton
          aria-label="Open menu"
          icon={<Text>��</Text>}
          variant="ghost"
          onClick={onOpen}
        />
      </Flex>

      {/* Desktop Layout */}
      <Flex>
        {/* Desktop Sidebar */}
        <Box
          display={{ base: 'none', lg: 'block' }}
          w="240px"
          bg={sidebarBg}
          borderRight="1px"
          borderColor={borderColor}
          position="fixed"
          h="100vh"
          overflowY="auto"
        >
          <SidebarContent />
        </Box>

        {/* Mobile Drawer */}
        <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent bg={sidebarBg}>
            <DrawerCloseButton />
            <DrawerBody p={0}>
              <SidebarContent onClose={onClose} />
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        {/* Main Content */}
        <Box
          flex="1"
          ml={{ base: 0, lg: '240px' }}
          transition="margin-left 0.2s"
        >
          {/* Navigation Header */}
          <NavigationHeader />

          {/* Dashboard Header - Hidden on specific region pages */}
          {!location.pathname.includes('/projects/telangana') &&
           !location.pathname.includes('/projects/ap') &&
           !location.pathname.includes('/projects/chitoor') && (
            <DashboardHeader />
          )}

          {/* Page Content */}
          <Box p={6}>
            {children}
          </Box>
        </Box>
      </Flex>

      {/* Change Password Drawer */}
      <Drawer isOpen={passwordDisclosure.isOpen} placement="right" onClose={passwordDisclosure.onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerBody p={6}>
            <VStack spacing={4} align="stretch">
              <Text fontSize="lg" fontWeight="bold">Change Password</Text>
              <Text fontSize="sm" color="gray.600">Update your account password. Minimum 6 characters.</Text>
              <Input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <Input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              <Button colorScheme="green" isLoading={changingPassword} onClick={async () => {
                if (!newPassword || newPassword.length < 6) {
                  toast({ title: 'Password too short', status: 'warning', duration: 3000, isClosable: true });
                  return;
                }
                if (newPassword !== confirmPassword) {
                  toast({ title: 'Passwords do not match', status: 'error', duration: 3000, isClosable: true });
                  return;
                }
                try {
                  setChangingPassword(true);
                  const { error } = await supabase.auth.updateUser({ password: newPassword });
                  if (error) throw error;
                  setNewPassword('');
                  setConfirmPassword('');
                  passwordDisclosure.onClose();
                  toast({ title: 'Password updated', status: 'success', duration: 3000, isClosable: true });
                } catch (err) {
                  console.error(err);
                  toast({ title: 'Failed to update password', status: 'error', duration: 4000, isClosable: true });
                } finally {
                  setChangingPassword(false);
                }
              }}>
                Update Password
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default Layout;
