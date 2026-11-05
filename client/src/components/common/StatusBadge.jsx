import React from 'react';
import Badge from './Badge';

export default function StatusBadge({ status, type = 'order', className = '' }) {
  if (!status) return null;

  // Order State Machine mappings
  const orderConfigs = {
    CREATED: { label: 'Created', variant: 'default' },
    PAYMENT_PENDING: { label: 'Payment Pending', variant: 'warning' },
    PAID: { label: 'Paid', variant: 'info' },
    ACCEPTED: { label: 'Accepted by Farmer', variant: 'primary' },
    PROCESSING: { label: 'Harvesting / Processing', variant: 'info' },
    PACKED: { label: 'Packed', variant: 'purple' },
    READY_FOR_PICKUP: { label: 'Ready for Pickup', variant: 'warning' },
    PICKED_UP: { label: 'Picked Up', variant: 'primary' },
    IN_TRANSIT: { label: 'In Transit', variant: 'info' },
    OUT_FOR_DELIVERY: { label: 'Out for Delivery', variant: 'primary' },
    DELIVERED: { label: 'Delivered', variant: 'success' },
    CANCELLED: { label: 'Cancelled', variant: 'danger' },
    REFUNDED: { label: 'Refunded', variant: 'default' },
  };

  // Channel Verification states
  const channelConfigs = {
    DRAFT: { label: 'Draft', variant: 'default' },
    PENDING_VERIFICATION: { label: 'Pending Verification', variant: 'warning' },
    VERIFIED: { label: 'Verified', variant: 'primary' },
    ACTIVE: { label: 'Active Channel', variant: 'success' },
    SUSPENDED: { label: 'Suspended', variant: 'danger' },
    REJECTED: { label: 'Application Rejected', variant: 'danger' },
    DEACTIVATED: { label: 'Deactivated', variant: 'default' },
  };

  // Generic fallback
  const config =
    type === 'channel'
      ? channelConfigs[status] || { label: status, variant: 'default' }
      : orderConfigs[status] || { label: status.replace(/_/g, ' '), variant: 'default' };

  return (
    <Badge variant={config.variant} dot className={className}>
      {config.label}
    </Badge>
  );
}
