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
  Tooltip,
  Input,
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronDownIcon, DragHandleIcon } from '@chakra-ui/icons';
import DashboardHeader from './DashboardHeader';
import { supabase } from '../lib/supabase';
import NavigationHeader from './NavigationHeader';

interface LayoutProps {
  children: React.ReactNode;
}

interface NavItemProps {
  icon: string;
  label: string;
  to: string;
  isActive: boolean;
  onClick?: () => void;
  collapsed?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, to, isActive, onClick, collapsed }) => {
  const link = (
    <ChakraLink
      as={RouterLink}
      to={to}
      onClick={onClick}
      display="flex"
      alignItems="center"
      justifyContent={collapsed ? 'center' : 'flex-start'}
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
      <Text fontSize="lg" mr={collapsed ? 0 : 3}>{icon}</Text>
      {!collapsed && <Text fontSize="sm">{label}</Text>}
    </ChakraLink>
  );
  return collapsed ? (
    <Tooltip label={label} placement="right" hasArrow>{link}</Tooltip>
  ) : link;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { logout, isFinance, isAdmin, user } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: pwOpen, onOpen: onPwOpen, onClose: onPwClose } = useDisclosure();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [changingPw, setChangingPw] = React.useState(false);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const sidebarBg = useColorModeValue('gray.50', 'gray.900');
  const logoUrl = "https://cdn.builder.io/api/v1/image/assets%2F2f195b82614d46a0b777d649ad418b24%2F5065c74f0a374ff4a36efc224f468f09?format=webp&width=800";

  React.useEffect(() => {
    document.title = 'Axiso Green Energy';
    const link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
    if (link) link.href = logoUrl;
  }, [logoUrl]);

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

  // Map regions to navigation items (ALL PROJECTS first as requested)
  const allStateProjects = [
    { icon: '📊', label: 'ALL PROJECTS', to: '/projects', region: 'all' },
    { icon: '🏢', label: 'TG', to: '/projects/telangana', region: 'Telangana' },
    { icon: '🏛️', label: 'AP', to: '/projects/ap', region: 'Andhra Pradesh' },
    { icon: '🏗️', label: 'CHITOOR', to: '/projects/chitoor', region: 'Chitoor' },
  ];

  const stateDashboards = [
    { icon: '📈', label: 'TG Dashboard', to: '/dashboard/tg' },
    { icon: '📈', label: 'AP Dashboard', to: '/dashboard/ap' },
    { icon: '📈', label: 'Chitoor Dashboard', to: '/dashboard/chitoor' },
  ];

  // Always show these items in sidebar (per request)
  const stateProjects = allStateProjects;

  const financeItems = [
    { icon: '💰', label: 'Finance', to: '/finance' },
    { icon: '💳', label: 'Payments', to: '/payments' },
  ];

  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <Box>
      <Flex direction="column" h="full">
        <Box p={6}>
          <Flex align="center" justify={isCollapsed ? 'center' : 'space-between'} mb={8}>
            {!isCollapsed && (
              <img
                src={logoUrl}
                alt="Axiso Green Energy Logo"
                style={{ height: '60px', width: 'auto' }}
              />
            )}
            <IconButton
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              icon={<DragHandleIcon />}
              size="sm"
              variant="ghost"
              onClick={() => setIsCollapsed(v => !v)}
            />
          </Flex>
          {!isCollapsed && (
            <>
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
            </>
          )}
        </Box>

        <VStack spacing={2} px={4} flex="1">
          {!isCollapsed && (
            <Box w="full" my={4}>
              <Text fontSize="xs" fontWeight="semibold" color="gray.400" px={4} mb={2}>
                STATE DASHBOARDS
              </Text>
            </Box>
          )}
          {stateDashboards.map((item) => (
            <NavItem
              key={item.to}
              icon={item.icon}
              label={item.label}
              to={item.to}
              isActive={location.pathname === item.to || location.pathname.startsWith(item.to)}
              onClick={onClose}
              collapsed={isCollapsed}
            />
          ))}

          {!isCollapsed && (
            <Box w="full" my={4}>
              <Text fontSize="xs" fontWeight="semibold" color="gray.400" px={4} mb={2}>
                STATE PROJECTS
              </Text>
            </Box>
          )}
          {stateProjects.map((item) => {
            const active = item.to === '/projects'
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <NavItem
                key={item.to}
                icon={item.icon}
                label={item.label}
                to={item.to}
                isActive={active}
                onClick={onClose}
                collapsed={isCollapsed}
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
                collapsed={isCollapsed}
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
                  collapsed={isCollapsed}
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
              {!isCollapsed && (
                <Box>
                  <Text fontWeight="medium" isTruncated>
                    {user?.email?.split('@')[0] || 'User'}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {isFinance ? 'Finance User' : 'Standard User'}
                  </Text>
                </Box>
              )}
            </MenuButton>
            <MenuList>
              <MenuItem onClick={onPwOpen} fontSize="sm" icon={<Text>🔐</Text>}>
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

  const handleChangePassword = async () => {
    try {
      if (newPassword.length < 6) {
        toast({ title: 'Password too short', description: 'Use at least 6 characters', status: 'warning', duration: 3000, isClosable: true });
        return;
      }
      if (newPassword !== confirmPassword) {
        toast({ title: 'Mismatch', description: 'Passwords do not match', status: 'error', duration: 3000, isClosable: true });
        return;
      }
      setChangingPw(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw new Error(error.message || 'Password update failed');
      toast({ title: 'Password updated', status: 'success', duration: 3000, isClosable: true });
      setNewPassword('');
      setConfirmPassword('');
      onPwClose();
    } catch (e: any) {
      toast({ title: 'Failed to update password', description: e?.message || String(e), status: 'error', duration: 5000, isClosable: true });
    } finally {
      setChangingPw(false);
    }
  };

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
            src={logoUrl}
            alt="Axiso Green Energy Logo"
            style={{ height: '32px', width: 'auto' }}
          />
        </Flex>
        <IconButton
          aria-label="Open menu"
          icon={<Text fontSize="xl">☰</Text>}
          variant="ghost"
          onClick={onOpen}
        />
      </Flex>

      {/* Desktop Layout */}
      <Flex>
        {/* Desktop Sidebar */}
        <Box
          display={{ base: 'none', lg: 'block' }}
          w={isCollapsed ? '72px' : '240px'}
          bg={sidebarBg}
          borderRight="1px"
          borderColor={borderColor}
          position="fixed"
          h="100vh"
          overflowY="auto"
          transition="width 0.2s"
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
          ml={{ base: 0, lg: isCollapsed ? '72px' : '240px' }}
          transition="margin-left 0.2s"
        >
          {/* Navigation Header */}
          <NavigationHeader />

          {/* Show dashboard header only on dashboard routes */}
          {location.pathname.startsWith('/dashboard') && <DashboardHeader />}

          {/* Page Content */}
          <Box p={6}>
            {children}
          </Box>
        </Box>
      </Flex>

      {/* Change Password Modal */}
      <Drawer isOpen={pwOpen} placement="right" onClose={onPwClose} size="xs">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerBody>
            <VStack spacing={4} mt={10} align="stretch">
              <Text fontSize="lg" fontWeight="bold">Change Password</Text>
              <Text fontSize="sm" color="gray.600">Update your account password</Text>
              <Input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
              />
              <Button colorScheme="green" onClick={handleChangePassword} isLoading={changingPw}>Save Password</Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default Layout;
