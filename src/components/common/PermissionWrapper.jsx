import React from 'react'
import { useAuth } from '../../hooks/useAuth'

const PermissionWrapper = ({ 
  children, 
  requiredRole = 'member', // 'owner', 'admin', 'member'
  fallback = null,
  requireWorkspace = false 
}) => {
  const { profile, isAdmin, isOwner } = useAuth()

  // Check if user has workspace (if required)
  if (requireWorkspace && !profile?.workspace_id) {
    return fallback
  }

  // Check role permissions
  const hasPermission = () => {
    switch (requiredRole) {
      case 'owner':
        return isOwner()
      case 'admin':
        return isAdmin()
      case 'member':
        return !!profile
      default:
        return false
    }
  }

  if (!hasPermission()) {
    return fallback
  }

  return children
}

export default PermissionWrapper