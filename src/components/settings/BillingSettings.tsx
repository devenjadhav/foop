import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { ProgressBar } from '../ui/ProgressBar';
import type {
  Plan,
  Subscription,
  PaymentMethod,
  Invoice,
  UsageMetrics,
} from '../../types/settings';

// Mock data for demonstration
const mockPlans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    interval: 'monthly',
    features: ['5 Automations', '10,000 API calls/month', '3 Team members', '5GB Storage'],
    limits: { apiCalls: 10000, teamMembers: 3, automations: 5, storage: 5 },
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 99,
    interval: 'monthly',
    features: ['25 Automations', '100,000 API calls/month', '10 Team members', '25GB Storage', 'Priority Support'],
    limits: { apiCalls: 100000, teamMembers: 10, automations: 25, storage: 25 },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299,
    interval: 'monthly',
    features: ['Unlimited Automations', '1,000,000 API calls/month', 'Unlimited Team members', '100GB Storage', 'Dedicated Support', 'SLA'],
    limits: { apiCalls: 1000000, teamMembers: 999, automations: 999, storage: 100 },
  },
];

const mockSubscription: Subscription = {
  id: 'sub_123',
  planId: 'professional',
  status: 'active',
  currentPeriodStart: '2025-01-01',
  currentPeriodEnd: '2025-02-01',
  cancelAtPeriodEnd: false,
};

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm_1',
    type: 'card',
    last4: '4242',
    brand: 'Visa',
    expiryMonth: 12,
    expiryYear: 2027,
    isDefault: true,
  },
];

const mockInvoices: Invoice[] = [
  { id: 'inv_1', amount: 9900, currency: 'USD', status: 'paid', date: '2025-01-01', pdfUrl: '#' },
  { id: 'inv_2', amount: 9900, currency: 'USD', status: 'paid', date: '2024-12-01', pdfUrl: '#' },
  { id: 'inv_3', amount: 9900, currency: 'USD', status: 'paid', date: '2024-11-01', pdfUrl: '#' },
];

const mockUsage: UsageMetrics = {
  apiCalls: { used: 45000, limit: 100000 },
  teamMembers: { used: 6, limit: 10 },
  automations: { used: 18, limit: 25 },
  storage: { used: 12.5, limit: 25 },
};

export function BillingSettings() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const currentPlan = mockPlans.find((p) => p.id === mockSubscription.planId);

  const handleUpgrade = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowUpgradeModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader
          title="Current Plan"
          description="Manage your subscription and billing"
          action={
            <Badge variant={mockSubscription.status === 'active' ? 'success' : 'warning'}>
              {mockSubscription.status}
            </Badge>
          }
        />
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{currentPlan?.name}</h3>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                ${currentPlan?.price}
                <span className="text-base font-normal text-gray-500">/month</span>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Current period: {new Date(mockSubscription.currentPeriodStart).toLocaleDateString()} -{' '}
                {new Date(mockSubscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            </div>
            <div className="space-x-3">
              <Button variant="secondary" onClick={() => setShowUpgradeModal(true)}>
                Change Plan
              </Button>
              <Button variant="danger">Cancel Subscription</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage */}
      <Card>
        <CardHeader title="Usage" description="Current billing period usage" />
        <CardContent className="space-y-4">
          <ProgressBar
            value={mockUsage.apiCalls.used}
            max={mockUsage.apiCalls.limit}
            label="API Calls"
          />
          <ProgressBar
            value={mockUsage.teamMembers.used}
            max={mockUsage.teamMembers.limit}
            label="Team Members"
          />
          <ProgressBar
            value={mockUsage.automations.used}
            max={mockUsage.automations.limit}
            label="Automations"
          />
          <ProgressBar
            value={mockUsage.storage.used}
            max={mockUsage.storage.limit}
            label="Storage (GB)"
          />
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader
          title="Payment Method"
          description="Manage your payment methods"
          action={
            <Button variant="secondary" size="sm" onClick={() => setShowPaymentModal(true)}>
              Add Payment Method
            </Button>
          }
        />
        <CardContent>
          {mockPaymentMethods.length > 0 ? (
            <div className="space-y-3">
              {mockPaymentMethods.map((pm) => (
                <div
                  key={pm.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-xs font-semibold text-gray-600">{pm.brand}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        •••• •••• •••• {pm.last4}
                      </p>
                      <p className="text-sm text-gray-500">
                        Expires {pm.expiryMonth}/{pm.expiryYear}
                      </p>
                    </div>
                    {pm.isDefault && <Badge variant="info">Default</Badge>}
                  </div>
                  <Button variant="ghost" size="sm">
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No payment methods added</p>
          )}
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader title="Billing History" description="View and download past invoices" />
        <CardContent className="p-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Invoice
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockInvoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(invoice.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${(invoice.amount / 100).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={invoice.status === 'paid' ? 'success' : 'warning'}>
                      {invoice.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Button variant="ghost" size="sm">
                      Download
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Upgrade Modal */}
      <Modal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Change Plan"
        size="lg"
      >
        <div className="space-y-4">
          {mockPlans.map((plan) => (
            <div
              key={plan.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                plan.id === mockSubscription.planId
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedPlan(plan)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    ${plan.price}
                    <span className="text-sm font-normal text-gray-500">/month</span>
                  </p>
                </div>
                {plan.id === mockSubscription.planId && (
                  <Badge variant="info">Current</Badge>
                )}
              </div>
              <ul className="mt-3 space-y-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                    <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowUpgradeModal(false)}>
            Cancel
          </Button>
          <Button onClick={() => setShowUpgradeModal(false)}>
            Confirm Change
          </Button>
        </div>
      </Modal>

      {/* Add Payment Method Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Add Payment Method"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Payment form would be integrated with Stripe Elements here.
          </p>
          <div className="p-8 border-2 border-dashed border-gray-200 rounded-lg text-center text-gray-400">
            Stripe Card Element Placeholder
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
            Cancel
          </Button>
          <Button onClick={() => setShowPaymentModal(false)}>Add Card</Button>
        </div>
      </Modal>
    </div>
  );
}
